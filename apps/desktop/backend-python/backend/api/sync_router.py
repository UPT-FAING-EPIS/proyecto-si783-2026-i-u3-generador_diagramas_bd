import json
import re
import secrets
import urllib.error
import urllib.request
from urllib.parse import urlencode
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.core.database import get_db
from backend.core.encryption import decrypt_password, encrypt_password
from backend.core.config import settings
from backend.models.models import CloudAccountSession, LocalSkillInstallation, SyncQueueItem
from backend.models.schemas import SyncQueueRequest, SyncQueueResponse
from backend.skills.registry import install_skill, list_skills, set_skill_enabled
from backend.sync.safe_payload import validate_safe_sync_payload
from diagrams.models import Diagram, Project

router = APIRouter(prefix="/sync", tags=["Sync"])
DEVICE_SESSIONS: dict[str, dict] = {}


def web_base_url() -> str:
    return settings.FLUXSQL_WEB_URL.rstrip("/")


class DeviceCompleteRequest(BaseModel):
    device_code: str
    user_email: str | None = None
    access_token: str
    refresh_token: str | None = None


def cleanup_device_sessions():
    now = datetime.now(timezone.utc)
    expired = [code for code, session in DEVICE_SESSIONS.items() if session["expires_at"] < now]
    for code in expired:
        DEVICE_SESSIONS.pop(code, None)


def serialize_queue_item(item: SyncQueueItem) -> SyncQueueResponse:
    return SyncQueueResponse(
        id=item.id,
        artifact_type=item.artifact_type,
        local_id=item.local_id,
        operation=item.operation,
        status=item.status,
        attempts=item.attempts,
        last_error=item.last_error,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.post("/device/start")
def start_device_link(request: Request):
    cleanup_device_sessions()
    device_code = secrets.token_urlsafe(18)
    user_code = f"FLUXY-{secrets.randbelow(900000) + 100000}"
    local_port = request.url.port or 8000
    local_callback_url = f"http://127.0.0.1:{local_port}"
    DEVICE_SESSIONS[device_code] = {
        "user_code": user_code,
        "status": "pending",
        "user_email": None,
        "access_token": None,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    return {
        "device_code": device_code,
        "user_code": user_code,
        "status": "pending",
        "verification_url": f"{web_base_url()}/desktop-link?" + urlencode({
            "device_code": device_code,
            "sidecar_url": local_callback_url,
        }),
        "expires_in": 600,
        "poll_interval": 2,
    }


@router.get("/device/status/{device_code}")
def device_link_status(device_code: str):
    cleanup_device_sessions()
    session = DEVICE_SESSIONS.get(device_code)
    if not session:
        raise HTTPException(status_code=404, detail="La solicitud de sincronizacion expiro o no existe.")
    return {
        "device_code": device_code,
        "user_code": session["user_code"],
        "status": session["status"],
        "user_email": session["user_email"],
        "expires_at": session["expires_at"].isoformat(),
    }


@router.post("/device/complete")
def complete_device_link(req: DeviceCompleteRequest, db: Session = Depends(get_db)):
    cleanup_device_sessions()
    session = DEVICE_SESSIONS.get(req.device_code)
    if not session:
        raise HTTPException(status_code=404, detail="La solicitud de sincronizacion expiro o no existe.")
    if not req.access_token:
        raise HTTPException(status_code=400, detail="Token de sesion requerido.")
    session["status"] = "linked"
    session["user_email"] = req.user_email or "usuario@fluxy.local"
    session["access_token"] = req.access_token
    session["token_source"] = "fluxy_web_session"

    account = db.query(CloudAccountSession).filter(CloudAccountSession.id == 1).first()
    if not account:
        account = CloudAccountSession(id=1, user_email=session["user_email"], access_token=encrypt_password(req.access_token))
        db.add(account)
    else:
        account.user_email = session["user_email"]
        account.access_token = encrypt_password(req.access_token)
        account.provider = "fluxy_web"
        account.status = "linked"
    if req.refresh_token:
        account.refresh_token = encrypt_password(req.refresh_token)
    db.commit()

    return {
        "ok": True,
        "status": "linked",
        "user_email": session["user_email"],
        "token_source": session["token_source"],
        "message": "Desktop enlazado con Fluxy Web.",
    }


@router.get("/account")
def get_cloud_account(db: Session = Depends(get_db)):
    account = db.query(CloudAccountSession).filter(CloudAccountSession.id == 1).first()
    if not account:
        return {"linked": False, "user_email": None, "provider": None, "status": "local"}
    return {
        "linked": account.status == "linked",
        "user_email": account.user_email,
        "provider": account.provider,
        "status": account.status,
        "linked_at": account.linked_at,
        "updated_at": account.updated_at,
    }


@router.post("/account/unlink")
def unlink_cloud_account(db: Session = Depends(get_db)):
    account = db.query(CloudAccountSession).filter(CloudAccountSession.id == 1).first()
    if account:
        db.delete(account)
        db.commit()
    return {"ok": True, "message": "Cuenta desvinculada."}


def _cloud_marker(cloud_id: str) -> str:
    return f"cloud_project_id:{cloud_id}"


def _extract_cloud_project_id(description: str | None) -> str | None:
    if not description:
        return None
    match = re.search(r"cloud_project_id:([0-9a-fA-F-]+)", description)
    return match.group(1) if match else None


def _strip_cloud_markers(description: str | None) -> str:
    if not description:
        return ""
    return "\n".join(
        line for line in description.splitlines()
        if not line.strip().startswith(("cloud_project_id:", "cloud_diagram_id:"))
    ).strip()


def _extract_cloud_diagram_id(source_database: str | None) -> str | None:
    if not source_database or not source_database.startswith("cloud_diagram_id:"):
        return None
    return source_database.replace("cloud_diagram_id:", "", 1)


def _safe_json_object(value: str | None) -> dict:
    if not value:
        return {"nodes": [], "edges": []}
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, dict) else {"nodes": [], "edges": []}
    except Exception:
        return {"nodes": [], "edges": []}


def _refresh_access_token(account: CloudAccountSession, db: Session) -> str:
    token = decrypt_password(account.access_token)
    if not account.refresh_token:
        return token

    refresh_token = decrypt_password(account.refresh_token)
    request = urllib.request.Request(
        f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=refresh_token",
        data=json.dumps({"refresh_token": refresh_token}).encode("utf-8"),
        headers={
            "apikey": settings.SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception:
        return token

    next_access_token = payload.get("access_token")
    next_refresh_token = payload.get("refresh_token")
    if next_access_token:
        account.access_token = encrypt_password(next_access_token)
        token = next_access_token
    if next_refresh_token:
        account.refresh_token = encrypt_password(next_refresh_token)
    account.status = "linked"
    db.commit()
    return token


def _linked_account(db: Session) -> CloudAccountSession:
    account = db.query(CloudAccountSession).filter(CloudAccountSession.id == 1).first()
    if not account or account.status != "linked":
        raise HTTPException(status_code=401, detail="Desktop no esta enlazado con Fluxy Web.")
    return account


def _web_json_request(db: Session, path: str, method: str = "GET", payload: dict | None = None) -> dict:
    account = _linked_account(db)
    token = _refresh_access_token(account, db)
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        f"{web_base_url()}{path}",
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8") or str(error)
        if error.code == 401:
            account.status = "expired"
            db.commit()
        raise HTTPException(status_code=error.code, detail=f"Fluxy Web rechazo la sincronizacion: {detail}")
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"No se pudo conectar con Fluxy Web: {error}")


@router.post("/cloud/pull")
def pull_cloud_projects(db: Session = Depends(get_db)):
    payload = _web_json_request(db, "/api/desktop-sync/projects")

    projects_imported = 0
    diagrams_imported = 0

    incoming_project_ids = {str(p["id"]) for p in payload.get("projects", [])}
    for local_project in db.query(Project).filter(Project.deleted_at == None).all():
        cloud_id = _extract_cloud_project_id(local_project.description)
        if cloud_id and cloud_id not in incoming_project_ids:
            local_project.deleted_at = datetime.utcnow()

    for cloud_project in payload.get("projects", []):
        marker = _cloud_marker(cloud_project["id"])
        project = db.query(Project).filter(Project.description.like(f"%{marker}%")).first()
        description = cloud_project.get("description") or ""
        synced_description = f"{description}\n\n{marker}".strip()
        if not project:
            project = Project(name=cloud_project["name"], description=synced_description)
            db.add(project)
            db.flush()
            projects_imported += 1
        else:
            project.name = cloud_project["name"]
            project.description = synced_description
        project.is_public = True
        project.share_access = "edit"
        project.members_json = json.dumps(cloud_project.get("members", []))

        incoming_diagram_ids = {str(d["id"]) for d in cloud_project.get("diagrams", [])}
        for ld in db.query(Diagram).filter(Diagram.project_id == project.id).all():
            if ld.source_database and ld.source_database.startswith("cloud_diagram_id:"):
                ld_cloud_id = ld.source_database.replace("cloud_diagram_id:", "")
                if ld_cloud_id not in incoming_diagram_ids:
                    db.delete(ld)

        for cloud_diagram in cloud_project.get("diagrams", []):
            diagram_marker = f"cloud_diagram_id:{cloud_diagram['id']}"
            diagram = db.query(Diagram).filter(
                Diagram.project_id == project.id,
                Diagram.source_database == diagram_marker,
            ).first()
            if not diagram:
                diagram = Diagram(project_id=project.id, source_database=diagram_marker)
                db.add(diagram)
                diagrams_imported += 1
            diagram.name = cloud_diagram.get("name") or "Diagrama Web"
            diagram.schema_json = json.dumps(cloud_diagram.get("flowJson") or {"nodes": [], "edges": []})
            diagram.sql_content = cloud_diagram.get("sourceCode") or ""
            diagram.active_dialect = cloud_diagram.get("dialect") or "postgresql"
            diagram.selected_tables_json = "[]"
            diagram.last_synced_at = datetime.utcnow()

    db.commit()
    skills_result = {"skills_imported": 0, "skills_seen": 0}
    try:
        skills_result = pull_cloud_skills(db)
    except HTTPException:
        pass
    return {
        "ok": True,
        "projects_imported": projects_imported,
        "diagrams_imported": diagrams_imported,
        "projects_seen": len(payload.get("projects", [])),
        **skills_result,
    }


@router.post("/cloud/projects/{project_id}/push")
def push_cloud_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto local no encontrado.")

    diagrams = db.query(Diagram).filter(Diagram.project_id == project.id).order_by(Diagram.updated_at.desc()).all()
    payload = {
        "cloudProjectId": _extract_cloud_project_id(project.description),
        "project": {
            "localId": project.id,
            "name": project.name,
            "description": _strip_cloud_markers(project.description),
            "engineFamily": "nosql" if any((d.active_dialect or "").lower() in {"mongodb", "neo4j", "json"} for d in diagrams) else "sql",
        },
        "diagrams": [
            {
                "localId": diagram.id,
                "cloudDiagramId": _extract_cloud_diagram_id(diagram.source_database),
                "name": diagram.name or "Diagrama Desktop",
                "flowJson": _safe_json_object(diagram.schema_json),
                "sourceCode": diagram.sql_content or "",
                "dialect": diagram.active_dialect or "postgresql",
            }
            for diagram in diagrams
        ],
    }
    result = _web_json_request(db, "/api/desktop-sync/projects/push", method="POST", payload=payload)
    cloud_project_id = result.get("projectId")
    if cloud_project_id:
        cleaned_description = _strip_cloud_markers(project.description)
        project.description = f"{cleaned_description}\n\n{_cloud_marker(cloud_project_id)}".strip()
        project.is_public = True
        project.share_access = "view"
        diagram_id_map = {
            str(item.get("localId")): item.get("cloudDiagramId")
            for item in result.get("diagramIds", [])
            if item.get("localId") is not None and item.get("cloudDiagramId")
        }
        for diagram in diagrams:
            cloud_diagram_id = diagram_id_map.get(str(diagram.id))
            if cloud_diagram_id:
                diagram.source_database = f"cloud_diagram_id:{cloud_diagram_id}"
            diagram.last_synced_at = datetime.utcnow()
        db.commit()
    return {
        "ok": True,
        "project_id": project.id,
        "cloud_project_id": cloud_project_id,
        "cloud_diagram_id": result.get("diagramId"),
        "diagrams_synced": len(result.get("diagramIds", [])),
    }


@router.post("/cloud/sync")
def sync_cloud(db: Session = Depends(get_db)):
    pushed_projects = 0
    pushed_diagrams = 0
    push_errors: list[dict] = []

    local_projects = db.query(Project).filter(Project.deleted_at == None).order_by(Project.updated_at.asc()).all()
    for project in local_projects:
        try:
            result = push_cloud_project(project.id, db)
            if result.get("ok"):
                pushed_projects += 1
                pushed_diagrams += int(result.get("diagrams_synced") or 0)
        except HTTPException as error:
            push_errors.append({"project_id": project.id, "detail": error.detail})

    pulled = pull_cloud_projects(db)
    return {
        "ok": len(push_errors) == 0 and bool(pulled.get("ok")),
        "pushed_projects": pushed_projects,
        "pushed_diagrams": pushed_diagrams,
        "push_errors": push_errors,
        "projects_imported": pulled.get("projects_imported", 0),
        "diagrams_imported": pulled.get("diagrams_imported", 0),
        "projects_seen": pulled.get("projects_seen", 0),
        "skills_imported": pulled.get("skills_imported", 0),
        "skills_seen": pulled.get("skills_seen", 0),
    }


@router.post("/cloud/skills/pull")
def pull_cloud_skills(db: Session = Depends(get_db)):
    payload = _web_json_request(db, "/api/desktop-sync/skills")
    skills = payload.get("skills", [])
    imported = 0
    for item in skills:
        skill_id = item.get("skillId")
        if not skill_id:
            continue
        if item.get("enabled", True):
            skill = install_skill(db, skill_id)
        else:
            skill = set_skill_enabled(db, skill_id, False)
        if skill:
            imported += 1
    return {"ok": True, "skills_imported": imported, "skills_seen": len(skills)}


@router.post("/cloud/skills/push")
def push_cloud_skills(db: Session = Depends(get_db)):
    installations = db.query(LocalSkillInstallation).all()
    payload = {
        "skills": [
            {
                "skillId": item.skill_id,
                "installedVersion": item.version,
                "enabled": item.enabled,
            }
            for item in installations
        ]
    }
    result = _web_json_request(db, "/api/desktop-sync/skills", method="POST", payload=payload)
    return {"ok": True, "skills_synced": result.get("synced", 0), "skills_seen": len(payload["skills"])}


@router.post("/queue", response_model=SyncQueueResponse)
def enqueue_sync(req: SyncQueueRequest, db: Session = Depends(get_db)):
    try:
        validate_safe_sync_payload(req.artifact_type, req.payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    item = SyncQueueItem(
        artifact_type=req.artifact_type,
        local_id=req.local_id,
        operation=req.operation,
        payload_json=json.dumps(req.payload),
        status="pending",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return serialize_queue_item(item)


@router.get("/queue", response_model=list[SyncQueueResponse])
def list_sync_queue(status: str = "pending", db: Session = Depends(get_db)):
    items = db.query(SyncQueueItem).filter(SyncQueueItem.status == status).order_by(SyncQueueItem.created_at.asc()).all()
    return [serialize_queue_item(item) for item in items]


@router.post("/queue/{item_id}/mark-synced", response_model=SyncQueueResponse)
def mark_synced(item_id: int, db: Session = Depends(get_db)):
    item = db.query(SyncQueueItem).filter(SyncQueueItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Sync item not found.")
    item.status = "synced"
    db.commit()
    db.refresh(item)
    return serialize_queue_item(item)
