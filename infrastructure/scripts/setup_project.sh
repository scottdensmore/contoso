#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Pre-flight Checks ---
if [ -z "${NEXTAUTH_SECRET}" ]; then
  echo "Error: Please set the NEXTAUTH_SECRET environment variable."
  exit 1
fi

# --- Configuration ---
PROJECT_ID=${PROJECT_ID:-"contoso-outdoor"}
BILLING_ACCOUNT=${BILLING_ACCOUNT:-"YOUR_BILLING_ACCOUNT"}
ENVIRONMENT=${ENVIRONMENT:-"dev"}
REGION=${REGION:-"us-central1"}

# --- Create Project ---
echo "Checking for existing project: ${PROJECT_ID}..."
if gcloud projects describe "${PROJECT_ID}" &> /dev/null; then
  echo "Project '${PROJECT_ID}' already exists. Skipping creation."
else
  echo "Creating GCP project: ${PROJECT_ID}..."
  gcloud projects create "${PROJECT_ID}"
fi

# --- Link Billing Account ---
if [ -z "${BILLING_ACCOUNT}" ] || [ "${BILLING_ACCOUNT}" == "YOUR_BILLING_ACCOUNT" ]; then
    echo "Error: BILLING_ACCOUNT is not set. Please set it to a valid billing account ID."
    echo "You can list your billing accounts with: gcloud beta billing accounts list"
    exit 1
else
    echo "Linking billing account: ${BILLING_ACCOUNT}..."
    gcloud billing projects link "${PROJECT_ID}" --billing-account="${BILLING_ACCOUNT}"
fi

# --- Set Project ---
gcloud config set project "${PROJECT_ID}"

# --- Enable Required APIs ---
echo "Enabling required services..."
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable servicenetworking.googleapis.com
gcloud services enable vpcaccess.googleapis.com
gcloud services enable discoveryengine.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable storage.googleapis.com

# --- Terraform Backend Setup ---
echo "Setting up Terraform backend..."
BUCKET_NAME="${PROJECT_ID}-tf-state"
if gsutil ls -b "gs://${BUCKET_NAME}" &> /dev/null; then
  echo "GCS bucket 'gs://${BUCKET_NAME}' already exists."
else
  echo "Creating GCS bucket 'gs://${BUCKET_NAME}'..."
  gsutil mb -p "${PROJECT_ID}" -l US "gs://${BUCKET_NAME}"
  gsutil versioning set on "gs://${BUCKET_NAME}"
fi

# --- Artifact Registry Setup (Idempotent) ---
echo "Ensuring Artifact Registry repository exists..."
if ! gcloud artifacts repositories describe "${ENVIRONMENT}-containers" --location "${REGION}" &>/dev/null; then
  gcloud artifacts repositories create "${ENVIRONMENT}-containers" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Container registry for Contoso Outdoor application"
fi

# --- Build and Push Images ---
echo "Building and pushing Docker images..."
IMAGE_WEB="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ENVIRONMENT}-containers/contoso-web:latest"
IMAGE_CHAT="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ENVIRONMENT}-containers/contoso-chat:latest"

docker buildx build --platform linux/amd64 -t "${IMAGE_WEB}" .
docker push "${IMAGE_WEB}"

docker buildx build --platform linux/amd64 -t "${IMAGE_CHAT}" -f services/chat/Dockerfile .
docker push "${IMAGE_CHAT}"

# --- Secret Manager Setup (Idempotent) ---
echo "Ensuring secrets exist..."
if ! gcloud secrets describe "${ENVIRONMENT}-app-config" &>/dev/null; then
  gcloud secrets create "${ENVIRONMENT}-app-config" --replication-policy="automatic"
fi
echo -n "${NEXTAUTH_SECRET}" | gcloud secrets versions add "${ENVIRONMENT}-app-config" --data-file=-

# --- Run Terraform ---
echo "Applying Terraform..."
cd infrastructure/terraform
terraform init -reconfigure -backend-config="bucket=${BUCKET_NAME}"

# Helper to import existing resources for idempotency
import_if_exists() {
  RESOURCE_ADDR=$1
  RESOURCE_ID=$2
  CHECK_CMD=$3

  echo "Checking if ${RESOURCE_ADDR} needs to be imported..."
  if eval "${CHECK_CMD}" &>/dev/null; then
    if ! terraform state list | grep -q "${RESOURCE_ADDR}"; then
      echo "Syncing existing resource ${RESOURCE_ID} into state..."
      terraform import -var="project_id=${PROJECT_ID}" -var="environment_name=${ENVIRONMENT}" -var="region=${REGION}" "${RESOURCE_ADDR}" "${RESOURCE_ID}" || true
    fi
  fi
}

# Sync all key resources into state
SA_ID="${ENVIRONMENT}-app-sa@${PROJECT_ID}.iam.gserviceaccount.com"
import_if_exists "google_service_account.app_service_account" "projects/${PROJECT_ID}/serviceAccounts/${SA_ID}" "gcloud iam service-accounts describe ${SA_ID}"

DB_ID="${ENVIRONMENT}-db-instance"
import_if_exists "google_sql_database_instance.postgres" "projects/${PROJECT_ID}/instances/${DB_ID}" "gcloud sql instances describe ${DB_ID}"

IP_NAME="${ENVIRONMENT}-private-ip"
import_if_exists "google_compute_global_address.private_ip_address" "projects/${PROJECT_ID}/global/addresses/${IP_NAME}" "gcloud compute addresses describe ${IP_NAME} --global"

import_if_exists "google_service_networking_connection.private_vpc_connection" "default:servicenetworking.googleapis.com" "gcloud services vpc-peerings list --network=default --project=${PROJECT_ID} | grep -q servicenetworking.googleapis.com"

VPC_ID="projects/${PROJECT_ID}/locations/${REGION}/connectors/${ENVIRONMENT}-vpc-conn"
import_if_exists "google_vpc_access_connector.connector" "${VPC_ID}" "gcloud compute networks vpc-access connectors describe ${ENVIRONMENT}-vpc-conn --region ${REGION}"

import_if_exists "google_artifact_registry_repository.container_registry" "projects/${PROJECT_ID}/locations/${REGION}/repositories/${ENVIRONMENT}-containers" "gcloud artifacts repositories describe ${ENVIRONMENT}-containers --location ${REGION}"

import_if_exists "google_secret_manager_secret.app_config" "projects/${PROJECT_ID}/secrets/${ENVIRONMENT}-app-config" "gcloud secrets describe ${ENVIRONMENT}-app-config"
import_if_exists "google_secret_manager_secret.database_url" "projects/${PROJECT_ID}/secrets/${ENVIRONMENT}-database-url" "gcloud secrets describe ${ENVIRONMENT}-database-url"

# Sync Cloud Run services
import_if_exists "google_cloud_run_v2_service.web_app" "projects/${PROJECT_ID}/locations/${REGION}/services/contoso-web" "gcloud run services describe contoso-web --region ${REGION}"
import_if_exists "google_cloud_run_v2_service.chat_service" "projects/${PROJECT_ID}/locations/${REGION}/services/contoso-chat" "gcloud run services describe contoso-chat --region ${REGION}"

# Sync Discovery Engine Data Store
DATASTORE_ID="${ENVIRONMENT}-products-datastore"
# Discovery Engine Data Stores are global resources but accessed via location/collections
# The ID format for import is projects/{{project}}/locations/{{location}}/collections/default_collection/dataStores/{{data_store_id}}
# Check if Discovery Engine DataStore exists and is usable
# Try to create a test query against the datastore - if it fails, skip creation
CREATE_DATASTORE=${CREATE_DATASTORE:-"true"}
if [ "${CREATE_DATASTORE}" = "true" ]; then
  DATASTORE_CHECK=$(curl -s -o /dev/null -w "%{http_code}" -X GET \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "x-goog-user-project: ${PROJECT_ID}" \
    "https://discoveryengine.googleapis.com/v1alpha/projects/${PROJECT_ID}/locations/global/collections/default_collection/dataStores/${DATASTORE_ID}" 2>/dev/null)
  echo "DataStore check returned HTTP ${DATASTORE_CHECK}"
  if [ "${DATASTORE_CHECK}" = "200" ]; then
    echo "DataStore exists, importing..."
    import_if_exists "google_discovery_engine_data_store.products[0]" \
      "projects/${PROJECT_ID}/locations/global/collections/default_collection/dataStores/${DATASTORE_ID}" \
      "echo already_checked"
  elif [ "${DATASTORE_CHECK}" = "404" ]; then
    echo "DataStore not found, Terraform will create it."
  else
    echo "DataStore returned unexpected HTTP ${DATASTORE_CHECK}, skipping creation (may be deleting, re-run later)..."
    CREATE_DATASTORE="false"
  fi
fi

if ! terraform apply -auto-approve \
  -var="project_id=${PROJECT_ID}" \
  -var="environment_name=${ENVIRONMENT}" \
  -var="region=${REGION}" \
  -var="create_datastore=${CREATE_DATASTORE}"; then

  # Check if the failure was due to DataStore still being deleted
  # (GET returns 404 but creation returns 400 "is being deleted" — a known GCP quirk)
  if [ "${CREATE_DATASTORE}" = "true" ]; then
    echo ""
    echo "Terraform failed. Retrying without DataStore creation (it may still be deleting from a previous teardown)..."
    echo "You can re-run this script later to create the DataStore once deletion completes (up to 2 hours)."
    terraform apply -auto-approve \
      -var="project_id=${PROJECT_ID}" \
      -var="environment_name=${ENVIRONMENT}" \
      -var="region=${REGION}" \
      -var="create_datastore=false"
  else
    echo "Terraform apply failed."
    exit 1
  fi
fi

cd ../..

# --- Data Seeding ---
echo "Seeding data into GCP..."
# Ensure python dependencies are installed
pip install -r services/chat/src/api/requirements-core.txt
# Generate python prisma client
prisma generate --schema=apps/web/prisma/schema.prisma
# Run the master seeding script (skip DataStore seeding if it doesn't exist yet)
python3 infrastructure/scripts/seed_gcp_all.py || {
  echo ""
  echo "Warning: Data seeding failed (likely because Discovery Engine DataStore doesn't exist yet)."
  echo "Re-run this script after the DataStore deletion completes (up to 2 hours from teardown)."
}

echo "✅ Project setup and deployment complete!"
echo "Web App URL: $(cd infrastructure/terraform && terraform output -raw web_app_url)"
echo "Chat Service URL: $(cd infrastructure/terraform && terraform output -raw chat_service_url)"
