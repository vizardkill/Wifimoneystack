#!/usr/bin/env bash
# =============================================================================
# Setup idempotente de Cloud Tasks para SomaUp
# Ejecutar UNA VEZ manualmente desde un entorno con gcloud autenticado
# con permisos de Project Editor o roles específicos de Cloud Tasks + IAM.
#
# Uso:
#   bash cmd/setup-cloud-tasks.sh
#
# Pre-requisitos:
#   gcloud auth login
#   gcloud config set project atomic-life-488006-c6
# =============================================================================
set -euo pipefail

PROJECT_ID="atomic-life-488006-c6"
LOCATION="us-east1"
QUEUE_NAME="calendar-sync"
SA_NAME="cloud-tasks-invoker"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo ">>> [1/5] Habilitando API de Cloud Tasks..."
gcloud services enable cloudtasks.googleapis.com --project="${PROJECT_ID}"

echo ">>> [2/5] Creando queue '${QUEUE_NAME}' (idempotente)..."
if gcloud tasks queues describe "${QUEUE_NAME}" --location="${LOCATION}" --project="${PROJECT_ID}" &>/dev/null; then
  echo "    Queue ya existe, actualizando configuración..."
  gcloud tasks queues update "${QUEUE_NAME}" \
    --location="${LOCATION}" \
    --project="${PROJECT_ID}" \
    --max-concurrent-dispatches=2 \
    --max-dispatches-per-second=5 \
    --max-attempts=5 \
    --min-backoff=10s \
    --max-backoff=300s \
    --max-doublings=4
else
  gcloud tasks queues create "${QUEUE_NAME}" \
    --location="${LOCATION}" \
    --project="${PROJECT_ID}" \
    --max-concurrent-dispatches=2 \
    --max-dispatches-per-second=5 \
    --max-attempts=5 \
    --min-backoff=10s \
    --max-backoff=300s \
    --max-doublings=4
fi

echo ">>> [3/5] Creando Service Account '${SA_NAME}' (idempotente)..."
if gcloud iam service-accounts describe "${SA_EMAIL}" --project="${PROJECT_ID}" &>/dev/null; then
  echo "    Service Account ya existe."
else
  gcloud iam service-accounts create "${SA_NAME}" \
    --display-name="Cloud Tasks → Cloud Run invoker" \
    --project="${PROJECT_ID}"
fi

echo ">>> [4/5] Obteniendo número de proyecto para SA de Cloud Tasks..."
PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format="value(projectNumber)")
CLOUD_TASKS_SA="service-${PROJECT_NUMBER}@gcp-sa-cloudtasks.iam.gserviceaccount.com"

echo "    Cloud Tasks SA: ${CLOUD_TASKS_SA}"
echo "    Otorgando roles/iam.serviceAccountTokenCreator..."

gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --member="serviceAccount:${CLOUD_TASKS_SA}" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project="${PROJECT_ID}"

echo ">>> [5/5] Otorgando roles/run.invoker al SA en el servicio Cloud Run..."
# Permite que la SA invoque el servicio Cloud Run somaup-app
gcloud run services add-iam-policy-binding somaup-app \
  --region="${LOCATION}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.invoker" \
  --project="${PROJECT_ID}"

echo ""
echo "✅ Cloud Tasks setup completo."
echo ""
echo "Agrega estas variables a Cloud Run (Secret Manager o env vars del servicio):"
echo "  CLOUD_TASKS_PROJECT_ID=${PROJECT_ID}"
echo "  CLOUD_TASKS_LOCATION=${LOCATION}"
echo "  CLOUD_TASKS_QUEUE_CALENDAR_SYNC=${QUEUE_NAME}"
echo "  CLOUD_TASKS_INVOKER_SA=${SA_EMAIL}"
echo "  INTERNAL_TASKS_AUDIENCE=https://app.somaup.com"
