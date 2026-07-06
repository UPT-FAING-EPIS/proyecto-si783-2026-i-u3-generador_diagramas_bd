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

## Public Deployment

Production target:

```txt
https://fluxsql.sytes.net
```

Deployment shape:

```txt
GitHub original repository
  -> GitHub Actions
  -> VPS over SSH
  -> docker compose -f docker-compose.prod.yml up -d --build
  -> Caddy reverse proxy
  -> HTTPS on fluxsql.sytes.net
```

The VPS deployment uses No-IP for DNS and Caddy for automatic TLS certificates. The deploy workflow is:

```txt
.github/workflows/deploy-vps.yml
```

Required GitHub repository secrets:

```txt
VPS_HOST
VPS_USER
VPS_PASSWORD
VPS_APP_DIR
PRODUCTION_ENV
```

`PRODUCTION_ENV` should follow `.env.production.example`. Do not commit real credentials, private keys, PATs, npm tokens, VSCE tokens, dumps or `.env` files.

Production containers:

```txt
apps/web/frontend-app/Dockerfile
apps/web/backend-api/Dockerfile
docker-compose.prod.yml
Caddyfile
```

Manual production check:

```powershell
docker compose -f docker-compose.prod.yml config
docker compose -f docker-compose.prod.yml up -d --build
```

One-time VPS bootstrap helper:

```bash
bash scripts/vps-bootstrap.sh /home/uptlibre/fluxsql-bd
```

## CI/CD And Publishing

GitHub Actions included:

```txt
.github/workflows/quality-security.yml      # Builds, focused tests, Semgrep, pnpm audit, optional Snyk/Sonar
.github/workflows/deploy-vps.yml            # Deploys web/API to the VPS
.github/workflows/desktop-release.yml       # Builds Windows desktop installer and GitHub release
.github/workflows/vscode-marketplace.yml    # Packages/publishes VS Code extension
.github/workflows/npm-skill-publish.yml     # Publishes FluxSQL Codex skill to npm
.github/workflows/product-release.yml       # Bundled release with .exe, .vsix, npm tarball and checksums
```

Release tag conventions:

```txt
desktop-v0.1.0   # Desktop installer release
vscode-v0.0.1    # VS Code Marketplace/VSIX release
skill-v0.1.0     # npm skill package release
release-v0.1.0   # Complete product bundle
```

Optional publishing secrets:

```txt
VSCE_PAT
NPM_TOKEN
SNYK_TOKEN
SONAR_TOKEN
SONAR_HOST_URL
SEMGREP_APP_TOKEN
```

## Evaluation Evidence

Documentation and wiki-ready material:

```txt
docs/formatos/
docs/wiki/
```

The project evidence covers:

- FD01-FD06 reports in Markdown.
- GitHub Actions for secure development and deployment.
- Releases and packages for desktop, VS Code and npm skill distribution.
- VPS publication outside GitHub at `https://fluxsql.sytes.net`.
- No-IP DNS plus Caddy HTTPS.
- Skill and MCP workflows for agent-assisted operation.

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

The automated npm workflow can publish the package from a `skill-v*` tag after npm trusted publishing or `NPM_TOKEN` is configured.
