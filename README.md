# FluxSQL

FluxSQL es un generador de diagramas de bases de datos para proyectos SQL y NoSQL. El repositorio contiene la aplicacion web, API cloud, aplicacion desktop, extension de VS Code, skill de Codex/MCP y automatizaciones de despliegue/publicacion.

## Alcance Del Proyecto

```txt
FluxSQL Web        = proyectos cloud, dashboard, editor visual, diagramas, exportacion y colaboracion.
FluxSQL Cloud API  = backend NestJS para proyectos, cuentas y servicios cloud.
FluxSQL Desktop    = aplicacion local-first con Tauri, Next.js y sidecar FastAPI.
FluxSQL VS Code    = extension para generar diagramas desde archivos SQL/NoSQL.
FluxSQL Skill/MCP  = flujos para agentes, memoria local y operacion asistida desde Codex.
```

La publicacion principal del proyecto esta fuera de GitHub:

```txt
https://fluxsql.sytes.net
```

## Estructura

```txt
apps/
  web/
    frontend-app/      # Frontend web Next.js
    backend-api/       # Backend cloud NestJS
  desktop/
    frontend-app/      # Frontend desktop Next.js + Tauri
    backend-python/    # Sidecar local FastAPI
  vscode-extension/    # Extension VS Code / Open VSX / Marketplace
packages/
  fluxsql-codex-skill/ # Skill instalable por npm
docs/
  formatos/            # Informes FD01-FD04 en MD/PDF
  wiki/                # Material para GitHub Wiki
scripts/               # Utilidades de verificacion, MCP y VPS
.github/workflows/     # CI, seguridad, deploy y releases
```

## Requisitos

Para desarrollo local:

```txt
Node.js >= 20
pnpm 11.7.0
Docker y Docker Compose
Git
Python 3.11+ para el sidecar local
VS Code para probar la extension
```

Para produccion en VPS:

```txt
Ubuntu/Debian recomendado
Docker
Docker Compose plugin
Git
Puertos 80 y 443 abiertos
Dominio No-IP apuntando al VPS
```

## Instalacion Local

Desde la raiz del repositorio:

```powershell
pnpm install
```

Levantar bases de datos de prueba:

```powershell
pnpm run dev:test-dbs
```

Levantar frontend web:

```powershell
pnpm run dev:web
```

Levantar API:

```powershell
pnpm run dev:api
```

Levantar desktop:

```powershell
pnpm run dev:desktop
```

Levantar sidecar local:

```powershell
pnpm run dev:local-sidecar
```

## Variables Y Parametros

El ejemplo de produccion vive en:

```txt
.env.production.example
```

Variables principales:

```txt
FRONTEND_URL=https://fluxsql.sytes.net
POSTGRES_DB=fluxsql
POSTGRES_USER=fluxsql
POSTGRES_PASSWORD=change-me
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/fluxsql
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Uso de cada parametro:

```txt
FRONTEND_URL
  URL publica usada por el backend para CORS y referencias externas.

POSTGRES_DB
  Nombre de la base PostgreSQL creada por docker-compose.prod.yml.

POSTGRES_USER
  Usuario PostgreSQL de produccion.

POSTGRES_PASSWORD
  Password de PostgreSQL. Es obligatorio en produccion.

DATABASE_URL
  Conexion completa a PostgreSQL. Si no se define, Docker usa el servicio postgres interno.

NEXT_PUBLIC_SUPABASE_URL
  URL publica del proyecto Supabase usado por el frontend.

NEXT_PUBLIC_SUPABASE_ANON_KEY
  Llave anonima publica de Supabase para autenticacion/cliente web.
```

No se deben commitear archivos `.env`, tokens, passwords, PATs, llaves SSH, dumps de base de datos, backups ni instaladores generados.

## Build Y Verificacion

Compilar frontend web:

```powershell
pnpm run build:web
```

Compilar API:

```powershell
pnpm run build:api
```

Compilar extension VS Code:

```powershell
pnpm run build:vscode-extension
```

Empaquetar extension VS Code:

```powershell
pnpm run package:vscode-extension
```

Verificacion MVP:

```powershell
pnpm run verify:mvp
```

Validar compose de produccion:

```powershell
docker compose -f docker-compose.prod.yml config
```

## Despliegue En VPS

El despliegue usa:

```txt
VPS                  = servidor Linux con Docker
No-IP                = fluxsql.sytes.net apuntando al IP del VPS
Caddy                = proxy reverso con HTTPS automatico de Let's Encrypt
GitHub Actions       = actualizacion automatica al hacer push a main
docker-compose.prod  = frontend, backend, PostgreSQL y Caddy
```

Arquitectura:

```txt
GitHub original repository
  -> push a main
  -> GitHub Actions Deploy VPS
  -> SSH al VPS
  -> git reset --hard origin/main
  -> docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
  -> Caddy publica https://fluxsql.sytes.net
```

Archivos usados:

```txt
docker-compose.prod.yml
Caddyfile
apps/web/frontend-app/Dockerfile
apps/web/backend-api/Dockerfile
scripts/vps-bootstrap.sh
.github/workflows/deploy-vps.yml
```

Servicios de produccion:

```txt
web       = Next.js standalone en puerto interno 3000
api       = NestJS en puerto interno 3001
postgres  = PostgreSQL 16 con volumen persistente
caddy     = HTTPS publico en puertos 80/443
```

Rutas publicas:

```txt
https://fluxsql.sytes.net             -> frontend web
https://fluxsql.sytes.net/cloud-api/* -> backend API
```

## Bootstrap Del VPS

En el VPS, instalar dependencias base:

```bash
sudo apt-get update
sudo apt-get install -y git docker.io docker-compose-plugin
sudo usermod -aG docker "$USER"
mkdir -p "$HOME/fluxsql-bd"
```

Tambien se puede usar el helper:

```bash
bash scripts/vps-bootstrap.sh /home/uptlibre/fluxsql-bd
```

Despues, el workflow de GitHub mantiene actualizado el directorio configurado en `VPS_APP_DIR`.

## Secrets De GitHub Para Deploy

Configurar en GitHub:

```txt
Settings -> Secrets and variables -> Actions -> Repository secrets
```

Secrets requeridos:

```txt
VPS_HOST
VPS_USER
VPS_PASSWORD
VPS_APP_DIR
PRODUCTION_ENV
```

Contenido esperado de `PRODUCTION_ENV`:

```txt
FRONTEND_URL=https://fluxsql.sytes.net
POSTGRES_DB=fluxsql
POSTGRES_USER=fluxsql
POSTGRES_PASSWORD=valor-seguro
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Si se usa una base externa, agregar:

```txt
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/fluxsql
```

## Despliegue Manual

En el VPS:

```bash
cd /home/uptlibre/fluxsql-bd
git fetch origin main
git reset --hard origin/main
cat > .env <<'EOF'
FRONTEND_URL=https://fluxsql.sytes.net
POSTGRES_DB=fluxsql
POSTGRES_USER=fluxsql
POSTGRES_PASSWORD=valor-seguro
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
EOF
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
docker compose -f docker-compose.prod.yml ps
```

Verificar:

```bash
curl -I https://fluxsql.sytes.net
curl -I https://fluxsql.sytes.net/cloud-api
docker compose -f docker-compose.prod.yml logs --tail=100 caddy
```

## GitHub Actions

Workflows principales:

```txt
.github/workflows/quality-security.yml
  CI de calidad y seguridad: build, pruebas enfocadas, Semgrep, pnpm audit, Snyk/Sonar opcionales.

.github/workflows/deploy-vps.yml
  Deploy automatico al VPS cuando se actualiza main o cuando se ejecuta manualmente.

.github/workflows/desktop-release.yml
  Construye instalador Windows y publica release del desktop.

.github/workflows/vscode-marketplace.yml
  Publica extension en Open VSX Registry.

.github/workflows/vscode-visual-marketplace.yml
  Publica extension en Visual Studio Marketplace.

.github/workflows/npm-skill-publish.yml
  Publica la skill de Codex en npm.

.github/workflows/product-release.yml
  Genera release completo con instalador, VSIX, paquete npm, checksums y notas.
```

Secrets opcionales para publicacion y seguridad:

```txt
VSCE_PAT
OPEN_VSX_TOKEN
NPM_TOKEN
SNYK_TOKEN
SONAR_TOKEN
SONAR_HOST_URL
SEMGREP_APP_TOKEN
```

## Convenciones De Releases

Tags usados por los workflows:

```txt
desktop-v0.1.0   -> release desktop Windows
vscode-v0.0.3    -> extension VS Code/Open VSX
skill-v0.1.0     -> paquete npm de la skill
release-v0.1.0   -> bundle completo del producto
```

Crear y publicar un tag:

```powershell
git tag vscode-v0.0.3
git push origin vscode-v0.0.3
```

## Extension VS Code

Empaquetar:

```powershell
pnpm run package:vscode-extension
```

Instalar localmente:

```powershell
code --install-extension "apps/vscode-extension/fluxsql-0.0.3.vsix" --force
```

Probar:

```txt
1. Abrir un archivo .sql, .json, .js, .ts, .prisma o .cypher.
2. Ejecutar "FluxSQL: Generate Diagram from File".
3. Elegir SQL o NoSQL.
4. Elegir motor: PostgreSQL, MySQL, SQL Server, MongoDB, Mongoose, Prisma o Neo4j.
5. Exportar desde "FluxSQL: Export Diagram...".
```

Publicaciones:

```txt
Open VSX Registry: https://open-vsx.org/extension/JeffersonVargas/fluxsql
VS Marketplace:    https://marketplace.visualstudio.com/items?itemName=JeffersonVargas.fluxsql
```

## Skill De Codex Y MCP

Skill incluida en el repositorio:

```txt
.agents/skills/fluxsql-workbench
```

Uso en Codex:

```txt
$fluxsql-workbench
```

Instalacion desde npm:

```powershell
npx fluxsql-codex-skill install
```

Reinstalar forzando reemplazo:

```powershell
npx fluxsql-codex-skill install --force
```

Publicar manualmente:

```powershell
cd packages/fluxsql-codex-skill
npm login
npm publish --access public
```

## Evidencia Para La Rubrica

```txt
README actualizado con requisitos, procedimientos, parametros y despliegue.
GitHub Wiki con caracteristicas, roadmap, futuras versiones y fecha de liberacion.
GitHub Projects con tareas relacionadas a ramas.
GitHub Actions para calidad, seguridad, deploy y releases.
Releases y packages para desktop, extension VS Code y skill npm.
Publicacion real fuera de GitHub en https://fluxsql.sytes.net.
No-IP como DNS publico y Caddy para HTTPS automatico.
```

Documentos:

```txt
docs/formatos/
docs/wiki/
docs/phases/README.md
```

Regla de seguridad del proyecto:

```txt
La nube sincroniza artefactos seguros.
El entorno local conserva credenciales, dumps, backups, sandboxes, logs privados y resultados sensibles.
```

