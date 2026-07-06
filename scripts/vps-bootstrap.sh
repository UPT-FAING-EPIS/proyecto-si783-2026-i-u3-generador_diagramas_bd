#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-$HOME/fluxsql-bd}"
REPO_URL="${2:-https://github.com/UPT-FAING-EPIS/proyecto-si783-2026-i-u3-generador_diagramas_bd.git}"

sudo apt-get update
sudo apt-get install -y ca-certificates curl git docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"

mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

cat <<MSG
VPS bootstrap complete.

Next steps:
1. Log out and back in so Docker group permissions apply.
2. Add GitHub Secrets: VPS_HOST, VPS_USER, VPS_PASSWORD, VPS_APP_DIR, PRODUCTION_ENV.
3. Run the Deploy VPS workflow.
MSG
