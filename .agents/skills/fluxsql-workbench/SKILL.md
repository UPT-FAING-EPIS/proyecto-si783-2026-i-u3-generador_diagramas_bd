---
name: fluxsql-workbench
description: Use when Codex works in the FluxSQL repository or npm skill package to run, test, demo, debug, package, publish, or troubleshoot FluxSQL web, desktop, local sidecar, MCP bridge, Docker test databases, sync flows, and the VS Code diagram extension.
---

# FluxSQL Workbench

## Core Rules

- Work from the repository root unless a referenced workflow says otherwise.
- Prefer existing scripts in `package.json` before inventing commands.
- Keep database credentials local. Never send real credentials, dumps, backups, private query results, or production data to cloud endpoints.
- Treat demo credentials in `docker-compose.test-dbs.yml` as disposable test-only secrets.
- Do not overwrite user changes or generated Marketplace/package artifacts unless the user asks.
- If a task concerns current docs, Marketplace publishing, npm, or OpenAI/Codex behavior, verify with official/current docs when accuracy matters.

## Workflow Router

- For app/service map, read `references/architecture.md`.
- For local demos, production-like local runs, Docker DBs, desktop, web, sidecar, MCP, and verification, read `references/workflows.md`.
- For the VS Code extension, VSIX packaging, local install, and Marketplace publishing, read `references/vscode-extension.md`.
- For test database credentials and graph demo tables, read `references/test-databases.md`.
- For sync, MCP, ports, Docker health, build, and inherited lint failures, read `references/troubleshooting.md`.

## Fast Commands

```powershell
pnpm install
pnpm run dev:test-dbs
pnpm run dev:web
pnpm run dev:api
pnpm run dev:local-sidecar
pnpm run dev:desktop
pnpm run build:web
pnpm run build:api
pnpm run build:vscode-extension
pnpm run package:vscode-extension
```

## Helper Scripts

Run these from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/fluxsql-workbench/scripts/check_fluxsql_workspace.ps1
powershell -ExecutionPolicy Bypass -File .agents/skills/fluxsql-workbench/scripts/start_fluxsql_demo.ps1
powershell -ExecutionPolicy Bypass -File .agents/skills/fluxsql-workbench/scripts/package_vscode_extension.ps1
```

## Expected Outputs

- Demo local: Docker PostgreSQL/MySQL healthy, sidecar reachable at `http://127.0.0.1:8000/health`, desktop frontend reachable at `http://127.0.0.1:3002`.
- VS Code extension: `apps/vscode-extension/fluxsql-0.0.1.vsix`.
- MCP config: `/api/v1/mcp/config` should point to the active sidecar RPC URL, not stale random ports.
- Desktop/Web diagrams: prefer graph/canvas behavior over SQL-first presentation.
