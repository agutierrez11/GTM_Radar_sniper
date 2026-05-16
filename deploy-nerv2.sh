#!/usr/bin/env bash
# Deploy de gtm-intel a nerv2.equalitech.xyz (EasyEngine)
# Uso: bash deploy-nerv2.sh
# Solo verificar: VERIFY_ONLY=1 bash deploy-nerv2.sh
set -eu

REMOTE="${DEPLOY_REMOTE:-root@equalitech.xyz}"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-/root/gtm-intel}"
EE_SITE="nerv2.equalitech.xyz"
BASE_URL="https://${EE_SITE}"

if [[ "${VERIFY_ONLY:-0}" != "1" ]]; then
  echo "==> Sincronizando proyecto a ${REMOTE}:${REMOTE_DIR} ..."
  ssh "${REMOTE}" "mkdir -p '${REMOTE_DIR}'"

  tar -czf - \
    --exclude='.git' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    . | ssh "${REMOTE}" "tar -xzf - -C '${REMOTE_DIR}'"

  echo "==> Copiando nginx user.conf para nerv2..."
  ssh "${REMOTE}" "mkdir -p /var/lib/docker/volumes/nerv2equalitechxyz_config_nginx/_data/custom"
  scp nginx-easyengine-nerv2.user.conf \
    "${REMOTE}:/var/lib/docker/volumes/nerv2equalitechxyz_config_nginx/_data/custom/user.conf"

  echo "==> Build y up en producción..."
  ssh "${REMOTE}" "cd '${REMOTE_DIR}' && docker compose -f docker-compose.yml -f docker-compose.equalitech.yml up -d --build"

  echo "==> EasyEngine: recargando sitio (${EE_SITE})..."
  ssh "${REMOTE}" "ee site reload '${EE_SITE}'"

  echo "==> Esperando arranque..."
  sleep 5
else
  echo "==> VERIFY_ONLY=1 — omitiendo deploy"
fi

echo "==> Verificando ${BASE_URL} ..."
code="$(curl -fsS -o /dev/null -w '%{http_code}' "${BASE_URL}/")"
if [[ "${code}" != "200" ]]; then
  echo "ERROR: GET / devolvió ${code}, esperado 200" >&2
  exit 1
fi
echo "    GET / -> ${code}"

html="$(curl -fsS "${BASE_URL}/")"
if ! echo "${html}" | grep -qi 'GTM INTEL'; then
  echo "ERROR: la home no contiene el marcador 'GTM INTEL'" >&2
  exit 1
fi

echo "==> Deploy OK -> ${BASE_URL}"
