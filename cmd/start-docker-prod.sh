#!/bin/sh

set -e # Detener el script si ocurre un error

if [ "${RUN_DB_BOOTSTRAP_ON_START:-true}" = "true" ]; then
  /bin/sh ./cmd/bootstrap-db-prod.sh
else
  echo "ℹ️ RUN_DB_BOOTSTRAP_ON_START=false, se omiten migraciones y seeds al arrancar el servicio."
fi

# Iniciar la aplicación
echo "🚀 Iniciando la aplicación en producción..."
exec npm run docker-start:prod


