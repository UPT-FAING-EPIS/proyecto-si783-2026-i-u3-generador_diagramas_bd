---
name: fluxsql-workbench
description: Use when Codex works in FluxSQL from any installed location to run, test, demo, deploy, package, publish, or troubleshoot the web app, cloud API, desktop app, local sidecar, MCP bridge, memory/local data, Docker databases, sync flows, npm skill package, GitHub releases, VPS deployment, and VS Code extension.
---

# FluxSQL Workbench

## Core Rules

- Work from the repository root when it exists. If the skill is installed from npm into another project, first locate the FluxSQL repo or ask for its path.
- Prefer existing scripts in `package.json` before inventing commands.
- Keep database credentials local. Never send real credentials, dumps, backups, private query results, or production data to cloud endpoints.
- Treat demo credentials in `docker-compose.test-dbs.yml` as disposable test-only secrets.
- Do not overwrite user changes or generated Marketplace/package artifacts unless the user asks.
- If a task concerns current docs, Marketplace publishing, npm, or OpenAI/Codex behavior, verify with official/current docs when accuracy matters.
- Never commit `.env`, VPS passwords, PATs, npm tokens, VSCE tokens, private SSH keys, database dumps, local SQLite files, generated `.vsix`, release `.exe`, or runtime logs.
- For production deployment, use GitHub Secrets and the repo workflows; do not paste secrets into workflow YAML.

## Workflow Router

- For app/service map, read `references/architecture.md`.
- For local demos, production-like local runs, Docker DBs, desktop, web, sidecar, MCP, and verification, read `references/workflows.md`.
- For the VS Code extension, VSIX packaging, local install, and Marketplace publishing, read `references/vscode-extension.md`.
- For test database credentials and graph demo tables, read `references/test-databases.md`.
- For sync, MCP, ports, Docker health, build, and inherited lint failures, read `references/troubleshooting.md`.
- For VPS, No-IP, Caddy, Docker production compose, GitHub Secrets and deployment, read `references/deployment.md`.
- For local memory, desktop storage, safe payloads and MCP agent behavior, read `references/memory-and-mcp.md`.

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
docker compose -f docker-compose.prod.yml config
docker compose -f docker-compose.prod.yml up -d --build
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
- Production URL: `https://fluxsql.sytes.net` should terminate TLS in Caddy and route `/cloud-api/*` to the NestJS API.
- GitHub release artifacts should include checksums and avoid embedding secrets.
