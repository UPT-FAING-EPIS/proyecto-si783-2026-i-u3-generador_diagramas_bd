# Deployment

FluxSQL is deployed outside GitHub on a VPS.

Public URL:

```txt
https://fluxsql.sytes.net
```

Deployment stack:

- No-IP DNS points `fluxsql.sytes.net` to the VPS.
- Caddy provides automatic HTTPS certificates.
- Docker Compose runs the web frontend, cloud API and reverse proxy.
- GitHub Actions deploys on push to `main`.

Main files:

```txt
docker-compose.prod.yml
Caddyfile
apps/web/frontend-app/Dockerfile
apps/web/backend-api/Dockerfile
.github/workflows/deploy-vps.yml
```

Required GitHub Secrets:

```txt
VPS_HOST
VPS_USER
VPS_PASSWORD
VPS_APP_DIR
PRODUCTION_ENV
```

`PRODUCTION_ENV` contains production environment variables and should follow `.env.production.example`.

Manual verification:

```bash
curl -I https://fluxsql.sytes.net
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 caddy
```

One-time VPS bootstrap:

```bash
bash scripts/vps-bootstrap.sh /home/uptlibre/fluxsql-bd
```
