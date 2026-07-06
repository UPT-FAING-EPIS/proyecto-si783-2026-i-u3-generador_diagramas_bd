import uuid

from sqlalchemy.orm import Session

from backend.models.schemas import Artifact, PolicyDecision, SkillRunRequest, SkillRunResponse
from backend.policy.engine import evaluate_policy
from backend.skills.registry import get_enabled_skill


def run_skill(request: SkillRunRequest, db: Session | None = None) -> SkillRunResponse:
    skill = get_enabled_skill(db, request.skill_id)
    run_id = str(uuid.uuid4())

    if not skill:
        return SkillRunResponse(
            run_id=run_id,
            skill_id=request.skill_id,
            status="not_found",
            message="Skill is not installed or is disabled.",
        )

    environment = request.profile.environment if request.profile else "unknown"
    if skill.requires_approval or skill.requires_backup or skill.requires_sandbox:
        policy = evaluate_policy(
            operation="alter" if "migration" in skill.id else "direct_insert",
            environment=environment,
            has_backup=False,
            has_sandbox=False,
            human_approved=request.human_approved,
        )
        if policy.decision != PolicyDecision.allow:
            return SkillRunResponse(
                run_id=run_id,
                skill_id=skill.id,
                status="requires_approval",
                message="Skill requires safety prerequisites before execution.",
                policy=policy,
            )

    database_memory = request.input.get("database_memory") if isinstance(request.input, dict) else None
    memory_content = ""
    if isinstance(database_memory, dict) and database_memory.get("content"):
        memory_content = (
            "\nDatabase memory used: "
            f"{database_memory.get('content')}\n"
            f"Memory scope: {database_memory.get('scope', 'database')} / {database_memory.get('subject', 'local')}\n"
        )

    artifact = Artifact(
        id=str(uuid.uuid4()),
        type="report",
        title=f"{skill.name} Report",
        content=(
            f"Skill `{skill.id}` accepted by Fluxy runner.\n\n"
            f"Instruction: {request.instruction or 'No instruction provided.'}\n"
            f"{memory_content}"
            "This baseline runner records the workflow contract and produces a safe artifact."
        ),
    )
    return SkillRunResponse(
        run_id=run_id,
        skill_id=skill.id,
        status="completed",
        message="Skill completed with baseline artifact.",
        artifacts=[artifact],
    )
