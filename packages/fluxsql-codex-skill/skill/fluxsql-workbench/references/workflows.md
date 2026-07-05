# FluxSQL Workflows

## Install

```powershell
pnpm install
```

## Docker Test Databases

```powershell
pnpm run dev:test-dbs
docker compose -f docker-compose.test-dbs.yml ps
pnpm run stop:test-dbs
pnpm run reset:test-dbs
```

## Web + API Development

```powershell
pnpm run dev:api
pnpm run dev:web
```

Default web dev URL is usually `http://localhost:3000`.

## Desktop Development

Use this when Tauri window behavior matters:

```powershell
pnpm run dev:desktop
```

This starts the Tauri shell and the managed FastAPI sidecar with a dynamic local port.

## Production-Like Local Demo Without Installer

Use this for presentations when the `.exe` build is slow:

```powershell
pnpm --filter @fluxsql/desktop build
pnpm run dev:test-dbs
cd apps/desktop/backend-python
$env:FLUXSQL_WEB_URL="https://fluxsql-bd-frontend-app.vercel.app"
python main.py --port 8000
```

In another terminal:

```powershell
cd apps/desktop/frontend-app
pnpm exec next start -p 3002
```

Open `http://127.0.0.1:3002`.

## Local Sidecar

```powershell
pnpm run dev:local-sidecar
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health
```

Useful endpoints:

- `GET /health`
- `GET /api/v1/mcp/health`
- `GET /api/v1/mcp/config`
- `POST /api/v1/connect/test`
- `POST /api/v1/connect/schema`

## Verification

Focused checks:

```powershell
python -m py_compile apps/desktop/backend-python/backend/api/sync_router.py apps/desktop/backend-python/backend/api/mcp_router.py apps/desktop/backend-python/diagrams/api/router.py
pnpm --filter @fluxsql/web build
pnpm --filter @fluxsql/desktop build
pnpm run build:vscode-extension
pnpm --filter ./apps/vscode-extension test
```

Full MVP check:

```powershell
pnpm run verify:mvp
```

Expect full lint to fail until inherited lint issues are fixed in unrelated files.
