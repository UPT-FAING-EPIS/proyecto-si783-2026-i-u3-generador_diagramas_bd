# Phase 08 - MCP Local Bridge

## Goal

Expose FluxSQL Desktop to AI agents through a small local MCP surface.

## Tools

- `fluxsql_list_connections`
- `fluxsql_get_database_profile`
- `fluxsql_list_skills`
- `fluxsql_run_skill`
- `fluxsql_get_skill_status`
- `fluxsql_get_artifact`
- `fluxsql_request_approval`

## Rule

Agents should mostly call `fluxsql_run_skill`. FluxSQL decides internal workflow steps using the skill resolver and policy engine.

## Exit Criteria

- MCP server starts from the local sidecar or desktop runtime. Done as `/api/v1/mcp/rpc`.
- Agent can list database profiles without secrets. Done through `fluxsql_list_connections`.
- Agent can run a safe read-only skill. Done through `fluxsql_run_skill`.
- Risky skill requests return approval requirements instead of executing directly. Done through skill runner policy.

## Current Status

Phase 08 is implemented as a local JSON-RPC MCP bridge exposed by the sidecar. It supports `initialize`, `tools/list` and `tools/call` for the planned FluxSQL tools. Persistent skill status/artifact lookup will be expanded in the audit phase.

## Verification

- `python -m py_compile apps/desktop/backend-python/backend/mcp/tools.py apps/desktop/backend-python/backend/api/mcp_router.py` passes.
- Smoke test verifies `initialize`, `tools/list`, a safe `fluxsql_run_skill`, and a risky `fluxsql_run_skill` returning approval requirements.
