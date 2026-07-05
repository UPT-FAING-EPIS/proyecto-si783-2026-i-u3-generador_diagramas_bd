# FluxSQL Architecture

## Repository Map

- `apps/web/frontend-app`: Next.js web app, dashboard, editor, public diagrams, desktop-link sync page, `/api/desktop-sync/*` routes.
- `apps/web/backend-api`: NestJS cloud API for projects, diagrams, versions, telemetry and public links.
- `apps/desktop/frontend-app`: Next.js/Tauri desktop UI, local-first dashboard, editor, generator, account sync and MCP page.
- `apps/desktop/backend-python`: FastAPI local sidecar for connectors, schema inspection, local diagrams, synthetic data, safety, sync, MCP, audit and reports.
- `apps/vscode-extension`: VS Code extension for local SQL-to-ER diagrams, Mermaid/SVG/JSON export and Marketplace packaging.
- `scripts/fluxsql-mcp-stdio.mjs`: stdio bridge that forwards MCP JSON-RPC to the local sidecar.
- `docker-compose.test-dbs.yml`: Docker PostgreSQL/MySQL demo databases.
- `.agents/skills/fluxsql-workbench`: repo-scoped Codex skill.
- `packages/fluxsql-codex-skill`: npm distribution package for this skill.

## Runtime Shape

```txt
FluxSQL Web / Desktop UI
  -> local API client
  -> FastAPI sidecar on 127.0.0.1:<port>
  -> database connectors / local SQLite / MCP tools

VS Code Extension
  -> local parser for SQL files
  -> webview graph preview
  -> Mermaid/SVG/JSON artifacts

MCP Client
  -> scripts/fluxsql-mcp-stdio.mjs
  -> FLUXY_MCP_URL
  -> /api/v1/mcp/rpc
```

## Security Boundaries

- Cloud/web sync must not receive local DB passwords, dumps, backups or private query results.
- Desktop sidecar owns local credentials and stores them encrypted.
- MCP tools must return safe metadata by default and guard risky SQL.
- Docker demo credentials are intentionally disposable and documented for testing only.
