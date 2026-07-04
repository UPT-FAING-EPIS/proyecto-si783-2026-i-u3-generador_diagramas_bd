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
