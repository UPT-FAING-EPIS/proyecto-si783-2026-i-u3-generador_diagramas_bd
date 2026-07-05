# FluxSQL Troubleshooting

## Ports

- Web dev: `3000`
- Desktop production-like local: `3002`
- Local sidecar conventional dev: `8000`
- PostgreSQL demo: `15432`
- MySQL demo: `13306`

Check ports:

```powershell
Get-NetTCPConnection -LocalPort 3000,3002,8000,15432,13306 -ErrorAction SilentlyContinue
```

## Sync Points To localhost

Desktop sync should use `FLUXSQL_WEB_URL`, defaulting to deployed web. Avoid hardcoding `http://localhost:3000` except web development.

Check:

```powershell
rg "localhost:3000|FLUXSQL_WEB_URL" apps/desktop apps/web -n
```

## MCP Uses A Stale Random Port

The sidecar chooses dynamic ports in Tauri dev. Always copy fresh config from:

```txt
GET /api/v1/mcp/config
```

The stdio bridge script is:

```txt
scripts/fluxsql-mcp-stdio.mjs
```

The env var is:

```txt
FLUXY_MCP_URL=http://127.0.0.1:<port>/api/v1/mcp/rpc
```

## Docker DBs Not Ready

```powershell
docker compose -f docker-compose.test-dbs.yml ps
docker compose -f docker-compose.test-dbs.yml logs postgres-demo
docker compose -f docker-compose.test-dbs.yml logs mysql-demo
```

Reset if needed:

```powershell
pnpm run reset:test-dbs
```

## Lint Failures

Current lint can fail from inherited unrelated issues. Prefer production builds and focused checks when validating FluxSQL demo changes:

```powershell
pnpm --filter @fluxsql/web build
pnpm --filter @fluxsql/desktop build
python -m py_compile <changed-python-files>
```

## Desktop Installer Is Slow

For presentations, use the production-like local demo instead of waiting for Tauri/NSIS:

```powershell
pnpm --filter @fluxsql/desktop build
pnpm run dev:test-dbs
python apps/desktop/backend-python/main.py --port 8000
pnpm --filter @fluxsql/desktop exec next start -p 3002
```
