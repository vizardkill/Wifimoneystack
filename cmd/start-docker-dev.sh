#!/bin/sh

set -e # Detener el script si ocurre un error

# Ejecutar migraciones de Prisma
echo "🗄️ Ejecutando migraciones..."
if ! npx prisma migrate deploy; then
  echo "❌ Ocurrió un problema al ejecutar las migraciones. Por favor, revisa los logs y vuelve a intentarlo. 🌟"
  exit 1
fi

# Validar que el esquema real de la BD coincide con schema.prisma.
# Se tolera únicamente la tabla técnica _prisma_seed_history.
echo "🔎 Verificando integridad del esquema Prisma vs base de datos..."
DIFF_OUTPUT_FILE="$(mktemp)"
set +e
DB_URL="$DB_URL" npx prisma migrate diff \
  --from-config-datasource \
  --to-schema prisma/schema.prisma \
  --exit-code >"$DIFF_OUTPUT_FILE"
DIFF_EXIT_CODE="$?"
set -e

if [ "$DIFF_EXIT_CODE" -eq 2 ]; then
  DIFF_LINES="$(grep -E '^(\[[*+-]\]|  (\[[*+-]\]|[-+*]) )' "$DIFF_OUTPUT_FILE" || true)"
  FILTERED_DIFF="$(printf '%s\n' "$DIFF_LINES" | grep -v '^\[-\] Removed tables$' | grep -v '^  - _prisma_seed_history$' || true)"

  if [ -n "$FILTERED_DIFF" ]; then
    echo "❌ Se detectó drift de esquema (migraciones incompletas o BD fuera de sync)."
    cat "$DIFF_OUTPUT_FILE"
    rm -f "$DIFF_OUTPUT_FILE"
    echo "❌ Se cancela el arranque para evitar servir una versión incompatible."
    exit 1
  fi

  echo "ℹ️ Drift técnico permitido detectado: tabla _prisma_seed_history (historial de seeds)."
elif [ "$DIFF_EXIT_CODE" -ne 0 ]; then
  echo "❌ No se pudo validar drift de esquema (exit code: $DIFF_EXIT_CODE)."
  cat "$DIFF_OUTPUT_FILE"
  rm -f "$DIFF_OUTPUT_FILE"
  exit 1
fi

rm -f "$DIFF_OUTPUT_FILE"

# Ejecutar seeds de Prisma (idempotentes con historial por archivo)
echo "🌱 Ejecutando seeds..."
if ! npx prisma db seed; then
  echo "❌ Ocurrió un problema al ejecutar los seeds. Por favor, revisa los logs y vuelve a intentarlo. 🌱"
  exit 1
fi

# Iniciar la aplicación
echo "🚀 Iniciando la aplicación en desarrollo..."
if ! npm run docker-start:dev; then
  echo "❌ La aplicación no pudo iniciarse correctamente. ¡Tómate un café ☕ y revisa los logs! 🚧"
  exit 1
fi

# Verificar si la aplicación está corriendo
echo "🔍 Verificando si la aplicación está activa..."
if curl -s http://localhost:3000 > /dev/null; then
  echo "✅ La aplicación se levantó correctamente. ¡Todo está listo! 🎉"
else
  echo "❌ La aplicación no parece estar corriendo. Revisa los logs para más detalles. 🛠️"
  exit 1
fi
