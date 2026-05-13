#!/bin/sh

set -e

is_allowed_drift_line() {
  case "$1" in
    '[*] Changed the `marketplace_app_storefront_versions` table') return 0 ;;
    '[*] Changed the `marketplace_app_storefront_version_media` table') return 0 ;;
    '[*] Changed the `marketplace_app_storefront_version_languages` table') return 0 ;;
    '  [*] Renamed index `marketplace_app_storefront_versions_app_id_kind_readiness_statu` to `marketplace_app_storefront_versions_app_id_kind_readiness_s_idx`') return 0 ;;
    '  [*] Renamed index `mkt_stf_ver_media_version_sort_idx` to `marketplace_app_storefront_version_media_storefront_version_idx`') return 0 ;;
    '  [*] Renamed index `mkt_stf_ver_media_version_media_key` to `marketplace_app_storefront_version_media_storefront_version_key`') return 0 ;;
    '  [*] Renamed the foreign key "marketplace_app_storefront_version_media_storefront_version_id_" to "marketplace_app_storefront_version_media_storefront_versio_fkey"') return 0 ;;
    '  [*] Renamed index `mkt_stf_ver_lang_version_sort_idx` to `marketplace_app_storefront_version_languages_storefront_ver_idx`') return 0 ;;
    '  [*] Renamed index `mkt_stf_ver_lang_version_lang_key` to `marketplace_app_storefront_version_languages_storefront_ver_key`') return 0 ;;
    '  [*] Renamed the foreign key "marketplace_app_storefront_version_languages_storefront_version" to "marketplace_app_storefront_version_languages_storefront_ve_fkey"') return 0 ;;
  esac

  return 1
}

# Ejecutar migraciones de Prisma
echo "🗄️ Ejecutando migraciones en producción..."
if ! npx prisma migrate deploy; then
  echo "❌ Ocurrió un problema al ejecutar las migraciones. Por favor, revisa los logs y vuelve a intentarlo. 🌟"
  exit 1
fi

# Validar que el esquema real de la BD coincide con schema.prisma.
# Si hay drift (ej. columna faltante aunque la migración figure aplicada),
# se aborta el arranque para que la nueva revisión no reciba tráfico.
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
  FILTERED_DIFF=''

  while IFS= read -r line; do
    if [ -z "$line" ]; then
      continue
    fi

    if [ "$line" = '[-] Removed tables' ] || [ "$line" = '  - _prisma_seed_history' ]; then
      continue
    fi

    if is_allowed_drift_line "$line"; then
      continue
    fi

    FILTERED_DIFF="${FILTERED_DIFF}${line}\n"
  done <<EOF
$DIFF_LINES
EOF

  FILTERED_DIFF="$(printf '%b' "$FILTERED_DIFF")"

  if [ -n "$FILTERED_DIFF" ]; then
    echo "❌ Se detectó drift de esquema en producción (migraciones incompletas o BD fuera de sync)."
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
echo "🌱 Ejecutando seeds en producción..."
if ! npx prisma db seed; then
  echo "❌ Ocurrió un problema al ejecutar los seeds. Por favor, revisa los logs y vuelve a intentarlo. 🌱"
  exit 1
fi