#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Pre-flight Checks ---
if [ -z "${NEXTAUTH_SECRET}" ]; then
  echo "Error: Please set the NEXTAUTH_SECRET environment variable."
  exit 1
fi

# --- Configuration ---
# The script uses the following environment variables:
# PROJECT_ID: The desired GCP Project ID.
# BILLING_ACCOUNT: Your GCP Billing Account ID.
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
if [ -n "${BILLING_ACCOUNT}" ] && [ "${BILLING_ACCOUNT}" != "YOUR_BILLING_ACCOUNT" ]; then
  echo "Linking billing account: ${BILLING_ACCOUNT}..."
  gcloud billing projects link "${PROJECT_ID}" --billing-account="${BILLING_ACCOUNT}"
else
  echo "Skipping billing account linking. Please link a billing account to the project manually."
fi

# --- Set Project ---
echo "Setting project to ${PROJECT_ID}..."
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

echo "Waiting for services to be enabled..."
sleep 30

# --- Terraform Backend Setup ---
echo "Setting up Terraform backend..."
# Assuming BUCKET_NAME is globally unique
BUCKET_NAME="${PROJECT_ID}-tf-state"
if gsutil ls -b "gs://${BUCKET_NAME}" &> /dev/null; then
  echo "GCS bucket 'gs://${BUCKET_NAME}' already exists."
else
  echo "Creating GCS bucket 'gs://${BUCKET_NAME}'..."
  gsutil mb -p "${PROJECT_ID}" -l US "gs://${BUCKET_NAME}"
  gsutil versioning set on "gs://${BUCKET_NAME}"
fi

# --- Run Terraform ---
echo "Running Terraform..."
cd infrastructure/terraform
terraform init -backend-config="bucket=${BUCKET_NAME}"

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

# Sync key resources before applying
SA_ID="${ENVIRONMENT}-app-sa@${PROJECT_ID}.iam.gserviceaccount.com"
import_if_exists "google_service_account.app_service_account" "projects/${PROJECT_ID}/serviceAccounts/${SA_ID}" "gcloud iam service-accounts describe ${SA_ID}"

DB_ID="${ENVIRONMENT}-db-instance"
import_if_exists "google_sql_database_instance.postgres" "projects/${PROJECT_ID}/instances/${DB_ID}" "gcloud sql instances describe ${DB_ID}"

IP_NAME="${ENVIRONMENT}-private-ip"
import_if_exists "google_compute_global_address.private_ip_address" "projects/${PROJECT_ID}/global/addresses/${IP_NAME}" "gcloud compute addresses describe ${IP_NAME} --global"

import_if_exists "google_service_networking_connection.private_vpc_connection" "default:servicenetworking.googleapis.com" "gcloud services vpc-peerings list --network=default --project=${PROJECT_ID} | grep -q servicenetworking.googleapis.com"

VPC_ID="projects/${PROJECT_ID}/locations/${REGION}/connectors/${ENVIRONMENT}-vpc-conn"
import_if_exists "google_vpc_access_connector.connector" "${VPC_ID}" "gcloud compute networks vpc-access connectors describe ${ENVIRONMENT}-vpc-conn --region ${REGION}"

terraform apply -auto-approve \
  -var="project_id=${PROJECT_ID}" \
  -var="environment_name=${ENVIRONMENT}" \
  -var="region=${REGION}"

# Extract outputs
DB_NAME=$(terraform output -raw db_name)
DB_USER=$(terraform output -raw db_user)
DB_PASSWORD=$(terraform output -raw db_password)
DB_INSTANCE_NAME=$(terraform output -raw db_instance_name)
# For Cloud SQL, connection name is often project:region:instance
INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe ${DB_INSTANCE_NAME} --format='value(connectionName)')
cd ../..

# --- Database Setup (Prisma) ---
echo "Configuring database connection..."
# For local migration proxy or Cloud Build
# For simplicity in this script, we assume the user might need to run migrations via a proxy or from within GCP.
# Here we just show the intended DATABASE_URL format for Cloud Run.
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost/${DB_NAME}?host=/cloudsql/${INSTANCE_CONNECTION_NAME}"

# --- Data Seeding ---
echo "Seeding data into GCP (Discovery Engine)..."
# Ensure python dependencies are installed
pip install -r services/chat/requirements.txt
# Run the master seeding script
python3 infrastructure/scripts/seed_gcp_all.py

# --- Build and Deploy Web App ---
echo "Deploying Web Application..."
VPC_CONNECTOR="${ENVIRONMENT}-vpc-conn"
IMAGE_WEB="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ENVIRONMENT}-containers/contoso-web:latest"

docker buildx build --platform linux/amd64 -t "${IMAGE_WEB}" .
docker push "${IMAGE_WEB}"

gcloud run deploy contoso-web \
  --image "${IMAGE_WEB}" \
  --set-env-vars=DATABASE_URL="${DATABASE_URL}",NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
  --add-cloudsql-instances="${INSTANCE_CONNECTION_NAME}" \
  --vpc-connector="${VPC_CONNECTOR}" \
  --region "${REGION}" \
  --allow-unauthenticated

# --- Build and Deploy Chat Service ---
echo "Deploying Chat Service..."
IMAGE_CHAT="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ENVIRONMENT}-containers/contoso-chat:latest"

cd services/chat
docker buildx build --platform linux/amd64 -t "${IMAGE_CHAT}" .
docker push "${IMAGE_CHAT}"
cd ../..

gcloud run deploy contoso-chat \
  --image "${IMAGE_CHAT}" \
  --set-env-vars=PROJECT_ID="${PROJECT_ID}",REGION="${REGION}",ENVIRONMENT="${ENVIRONMENT}" \
  --region "${REGION}" \
  --allow-unauthenticated

echo "✅ Project setup and deployment complete!"