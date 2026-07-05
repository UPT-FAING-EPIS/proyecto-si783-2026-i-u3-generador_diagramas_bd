# FluxSQL

FluxSQL is the clean monorepo for the FluxSQL product.

The product direction is:

```txt
FluxSQL Web = cloud projects, collaboration, diagrams, versions and sync.
FluxSQL Cloud API = NestJS backend for accounts, projects and team-ready controls.
FluxSQL Desktop = local-first app with Tauri, FastAPI sidecar, real database connections and offline mode.
FluxSQL Skills = free installable workflows managed from the app, with per-user/per-profile enablement.
FluxSQL MCP = local bridge for AI agents.
```

Repository shape:

```txt
apps/
  web/
    frontend-app/   # cloud web UI
    backend-api/    # NestJS cloud API
  desktop/
    frontend-app/   # desktop Next.js UI + Tauri
    backend-python/ # FastAPI local sidecar
docs/
scripts/
```

Core security rule:

```txt
Cloud syncs safe artifacts.
Local runtime keeps credentials, backups, sandboxes, dumps and private query results.
```

Start here:

- [Development phases](./docs/phases/README.md)

## Codex Skill

This repo includes a repo-scoped Codex skill for operating FluxSQL:

```txt
.agents/skills/fluxsql-workbench
```

Use it in Codex with:

```txt
$fluxsql-workbench
```

The skill documents the main workflows for web, desktop, local sidecar, MCP, Docker test databases, sync troubleshooting, and the VS Code extension.

### Install From npm

Users who do not clone this repo can install the same skill into their current project:

```powershell
npx fluxsql-codex-skill install
```

To overwrite an existing local copy:

```powershell
npx fluxsql-codex-skill install --force
```

The npm package source lives in:

```txt
packages/fluxsql-codex-skill
```

Publish it manually with an npm account:

```powershell
cd packages/fluxsql-codex-skill
npm login
npm publish --access public
```
