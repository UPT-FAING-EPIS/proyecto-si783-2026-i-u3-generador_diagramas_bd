# FluxSQL VPS Deployment

## Public Target

- Domain: `fluxsql.sytes.net`
- DNS/DDNS provider: No-IP
- VPS public IP: configured by the project owner in No-IP
- TLS: Caddy obtains and renews HTTPS certificates automatically.

Do not store VPS passwords, SSH private keys, npm tokens, VSCE PATs or database credentials in Git.

## Production Files

```txt
apps/web/frontend-app/Dockerfile
apps/web/backend-api/Dockerfile
docker-compose.prod.yml
Caddyfile
.env.production.example
```

`docker-compose.prod.yml` starts:

- `web`: Next.js standalone server on port `3000`.
- `api`: NestJS backend on port `3001`.
- `postgres`: production PostgreSQL database with a persistent Docker volume.
- `caddy`: public HTTP/HTTPS reverse proxy.

## Required GitHub Secrets

Use repository secrets:

```txt
VPS_HOST
VPS_USER
VPS_PASSWORD
VPS_APP_DIR
PRODUCTION_ENV
```

Recommended `PRODUCTION_ENV` content:

```txt
FRONTEND_URL=https://fluxsql.sytes.net
POSTGRES_DB=fluxsql
POSTGRES_USER=fluxsql
POSTGRES_PASSWORD=change-me
# Optional external DB override:
# DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/fluxsql
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

SSH key authentication is preferred when available. Password deployment exists for the university VPS workflow.

## Manual VPS Bootstrap

Run once on the VPS:

```bash
sudo apt-get update
sudo apt-get install -y git docker.io docker-compose-plugin
sudo usermod -aG docker "$USER"
mkdir -p "$HOME/fluxsql-bd"
```

Then clone the original repository into `VPS_APP_DIR`.

## Deploy

The GitHub Actions workflow updates the repo and runs:

```bash
docker compose -f docker-compose.prod.yml pull || true
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
docker compose -f docker-compose.prod.yml ps
```

## Verification

```bash
curl -I https://fluxsql.sytes.net
curl -I https://fluxsql.sytes.net/cloud-api
docker compose -f docker-compose.prod.yml logs --tail=100 caddy
```
