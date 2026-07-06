from backend.models.schemas import DatabaseProfile, McpRpcResponse, SkillRunRequest
from backend.skills.registry import list_skills, resolve_skills
from backend.skills.runner import run_skill


MCP_TOOLS = [
    {
        "name": "fluxy_list_connections",
        "description": "List local saved connection profiles without secrets.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "fluxy_get_database_profile",
        "description": "Get a local database profile by numeric saved connection id.",
        "inputSchema": {"type": "object", "properties": {"conexion_id": {"type": "integer"}}, "required": ["conexion_id"]},
    },
    {
        "name": "fluxy_inspect_schema",
        "description": "Inspect tables, columns, primary keys and foreign keys for a saved local database connection.",
        "inputSchema": {"type": "object", "properties": {"conexion_id": {"type": "integer"}}, "required": ["conexion_id"]},
    },
    {
        "name": "fluxy_read_sql",
        "description": "Execute a safe read-only SQL statement against a saved local SQL database connection.",
        "inputSchema": {
            "type": "object",
            "properties": {"conexion_id": {"type": "integer"}, "sql": {"type": "string"}},
            "required": ["conexion_id", "sql"],
        },
    },
    {
        "name": "fluxy_execute_sql",
        "description": "Execute a guarded SQL statement against a saved local database connection.",
        "inputSchema": {
            "type": "object",
            "properties": {"conexion_id": {"type": "integer"}, "sql": {"type": "string"}},
            "required": ["conexion_id", "sql"],
        },
    },
    {
        "name": "fluxy_list_skills",
        "description": "List Fluxy skills with their local installed/enabled state.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "fluxy_resolve_skills",
        "description": "Resolve installed and enabled skills compatible with a saved local database connection.",
        "inputSchema": {"type": "object", "properties": {"conexion_id": {"type": "integer"}}, "required": ["conexion_id"]},
    },
    {
        "name": "fluxy_run_skill",
        "description": "Run a Fluxy skill through the local policy engine.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "skill_id": {"type": "string"},
                "conexion_id": {"type": "integer"},
                "instruction": {"type": "string"},
                "input": {"type": "object"},
            },
            "required": ["skill_id"],
        },
    },
]


def text_result(text: str):
    return {"content": [{"type": "text", "text": text}]}


def call_tool(name: str, arguments: dict, db, list_connections, get_profile, inspect_schema, read_sql, execute_sql):
    if name == "fluxy_list_connections":
        return {"content": [{"type": "json", "json": list_connections()}]}
    if name == "fluxy_get_database_profile":
        return {"content": [{"type": "json", "json": get_profile(arguments["conexion_id"])}]}
    if name == "fluxy_inspect_schema":
        return {"content": [{"type": "json", "json": inspect_schema(arguments["conexion_id"])}]}
    if name == "fluxy_read_sql":
        return {"content": [{"type": "json", "json": read_sql(arguments["conexion_id"], arguments["sql"])}]}
    if name == "fluxy_execute_sql":
        return {"content": [{"type": "json", "json": execute_sql(arguments["conexion_id"], arguments["sql"])}]}
    if name == "fluxy_list_skills":
        return {"content": [{"type": "json", "json": [skill.model_dump() for skill in list_skills(db)]}]}
    if name == "fluxy_resolve_skills":
        profile = DatabaseProfile(**get_profile(arguments["conexion_id"]))
        return {"content": [{"type": "json", "json": [skill.model_dump() for skill in resolve_skills(profile, db)]}]}
    if name == "fluxy_run_skill":
        payload = dict(arguments)
        conexion_id = payload.pop("conexion_id", None)
        if conexion_id is not None and "profile" not in payload:
            payload["profile"] = get_profile(conexion_id)
        response = run_skill(SkillRunRequest(**payload), db)
        return {"content": [{"type": "json", "json": response.model_dump()}]}
    raise ValueError(f"Unknown MCP tool: {name}")


def mcp_error(request_id, code: int, message: str):
    return McpRpcResponse(id=request_id, error={"code": code, "message": message})
