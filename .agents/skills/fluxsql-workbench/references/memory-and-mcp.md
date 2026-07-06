# FluxSQL Memory And MCP

## Local Memory Boundary

FluxSQL Desktop keeps sensitive data local:

- connection profiles
- encrypted credentials
- local SQLite project data
- generated backups
- sandbox metadata
- audit/report exports

Cloud/web sync must only receive safe artifacts:

- project metadata
- diagram JSON
- version snapshots
- share/public-link metadata
- telemetry that does not contain credentials or private query results

## Desktop Runtime

The desktop app is:

```txt
apps/desktop/frontend-app
apps/desktop/backend-python
```

The Tauri shell starts the FastAPI sidecar with a dynamic local port in development. For production-like demos use port `8000`.

## MCP Bridge

MCP clients should call:

```txt
scripts/fluxsql-mcp-stdio.mjs
```

The bridge forwards JSON-RPC to:

```txt
FLUXY_MCP_URL=http://127.0.0.1:<port>/api/v1/mcp/rpc
```

Always refresh the active sidecar config from:

```txt
GET /api/v1/mcp/config
```

## Agent Rules

- Prefer MCP safe metadata tools before raw SQL.
- Never expose passwords, connection strings, dumps or private rows in chat.
- Ask before running destructive SQL, backup restore, data generation against a non-demo target, or sync to cloud.
- Use `docker-compose.test-dbs.yml` for demos and tests.
- Use `tmp_exports/` or the configured export folder for generated reports; keep them out of Git unless explicitly requested.

## Useful Checks

```powershell
pnpm run dev:local-sidecar
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/api/v1/mcp/config
```
