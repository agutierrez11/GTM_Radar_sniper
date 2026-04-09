#!/usr/bin/env bash
# Despliegue a EasyEngine (equalitech) + verificación HTTPS al final.
# Raíz del repo. Requisitos: ssh, scp, tar, curl (Git Bash / WSL / Linux).
# Solo verificar sin desplegar: VERIFY_ONLY=1 bash scripts/deploy-equalitech.sh
set -euo pipefail

REMOTE="${DEPLOY_REMOTE:-root@equalitech.xyz}"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-/root/GTM_Radar_sniper}"
EE_SITE="${EE_SITE:-nerv.equalitech.xyz}"
BASE_URL="${NERV_URL:-https://${EE_SITE}}"

if [[ "${VERIFY_ONLY:-0}" != "1" ]]; then
  echo "==> Sincronizando proyecto a ${REMOTE}:${REMOTE_DIR} (excluye node_modules, .git, .next)..."
  ssh "${REMOTE}" "mkdir -p '${REMOTE_DIR}'"

  tar -czf - \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='apps/frontend/node_modules' \
    --exclude='apps/frontend/.next' \
    --exclude='**/__pycache__' \
    --exclude='.env' \
    . | ssh "${REMOTE}" "tar -xzf - -C '${REMOTE_DIR}'"

  echo "==> Copiando user.conf de nginx (EasyEngine nerv)..."
  scp scripts/nginx-easyengine-nerv.user.conf "${REMOTE}:/var/lib/docker/volumes/nervequalitechxyz_config_nginx/_data/custom/user.conf"

  echo "==> Build y up con red ee-global-frontend-network..."
  ssh "${REMOTE}" "cd '${REMOTE_DIR}' && docker compose -f docker-compose.yml -f docker-compose.equalitech.yml up -d --build"

  echo "==> EasyEngine: recargando sitio (${EE_SITE})..."
  ssh "${REMOTE}" "ee site reload '${EE_SITE}'"

  echo "==> Esperando arranque del frontend (evita 502 transitorio)..."
  sleep 5
else
  echo "==> VERIFY_ONLY=1 — omitiendo deploy"
fi

echo "==> Verificando ${BASE_URL} ..."
code_root="$(curl -fsS -o /dev/null -w '%{http_code}' "${BASE_URL}/")"
if [[ "${code_root}" != "200" ]]; then
  echo "ERROR: GET / devolvió ${code_root}, esperado 200" >&2
  exit 1
fi
echo "    GET / -> ${code_root}"

code_health="$(curl -fsS -o /dev/null -w '%{http_code}' "${BASE_URL}/health")"
if [[ "${code_health}" != "200" ]]; then
  echo "ERROR: GET /health devolvió ${code_health}, esperado 200" >&2
  exit 1
fi
echo "    GET /health -> ${code_health}"

health_body="$(curl -fsS "${BASE_URL}/health")"
if ! echo "${health_body}" | grep -q 'healthy'; then
  echo "ERROR: /health no contiene 'healthy': ${health_body}" >&2
  exit 1
fi

html="$(curl -fsS "${BASE_URL}/")"
if ! echo "${html}" | grep -qi 'NERV'; then
  echo "ERROR: la home no contiene el marcador 'NERV'" >&2
  exit 1
fi

echo "==> Verificación OK (${BASE_URL})"
