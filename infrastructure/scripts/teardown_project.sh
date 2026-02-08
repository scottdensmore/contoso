#!/bin/bash

# Don't exit on errors - we want to continue even if resources don't exist
set +e

# --- Configuration ---
# The script uses the following environment variables:
# PROJECT_ID: The GCP Project ID.
PROJECT_ID=${PROJECT_ID:-"contoso-outdoor"}
ENVIRONMENT=${ENVIRONMENT:-"dev"}
REGION=${REGION:-"us-central1"}

# --- Pre-flight Checks ---
echo "Checking project: ${PROJECT_ID}..."
if ! gcloud projects describe "${PROJECT_ID}" &>/dev/null; then
  echo "Error: Project '${PROJECT_ID}' not found."
  exit 1
fi

# --- Confirmation ---
echo "⚠️  WARNING: This will destroy all resources in project '${PROJECT_ID}' for environment '${ENVIRONMENT}'"
echo "This includes:"
echo "  - Cloud Run services (contoso-web, contoso-chat)"
echo "  - Cloud SQL database (ALL DATA WILL BE LOST)"
echo "  - VPC Connector"
echo "  - Artifact Registry repository"
echo "  - Secret Manager secrets"
echo "  - Terraform state bucket"
echo "  - Service accounts"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation

if [ "$confirmation" != "yes" ]; then
  echo "Teardown cancelled."
  exit 0
fi

# --- Set Project ---
echo ""
echo "Setting project to ${PROJECT_ID}..."
gcloud config set project "${PROJECT_ID}"

# --- Delete Cloud Run Resources (via gcloud for speed) ---
echo ""
echo "Cleaning up Cloud Run services..."
for service in "contoso-web" "contoso-chat"; do
  if gcloud run services describe "${service}" --region "${REGION}" &>/dev/null; then
    echo "Deleting Cloud Run service: ${service}..."
    gcloud run services delete "${service}" --region "${REGION}" --quiet
  fi
done

# --- Run Terraform Destroy ---
# We run Terraform destroy to clean up everything it managed.
echo ""
echo "Running Terraform destroy..."
if [ -d "infrastructure/terraform" ]; then
  cd infrastructure/terraform
  
  # Ensure backend is initialized
  BUCKET_NAME="${PROJECT_ID}-tf-state"
  terraform init -backend-config="bucket=${BUCKET_NAME}" || echo "Terraform init failed, continuing..."

  # We try to destroy. We ignore failures here because some network resources 
  # (like VPC peering) often take time to release and might need a retry.
  echo "Attempting to destroy infrastructure via Terraform..."
  terraform destroy -auto-approve \
    -var="project_id=${PROJECT_ID}" \
    -var="environment_name=${ENVIRONMENT}" \
    -var="region=${REGION}"

  # Handle common VPC peering hang-up
  if [ $? -ne 0 ]; then
    echo "⚠️  Terraform destroy encountered an error (likely VPC peering dependency)."
    echo "Removing peering connection from state to unblock cleanup..."
    terraform state rm google_service_networking_connection.private_vpc_connection 2>/dev/null
    
    echo "Retrying Terraform destroy..."
    terraform destroy -auto-approve \
      -var="project_id=${PROJECT_ID}" \
      -var="environment_name=${ENVIRONMENT}" \
      -var="region=${REGION}"
  fi
  cd ../..
else
  echo "Terraform directory not found."
fi

# --- Manual Cleanup (Final Sweep) ---
# Some resources (like Artifact Registry and SQL) can be "orphaned" if Terraform fails.
# We do a final sweep using gcloud to ensure they are gone.

echo ""
echo "Performing final cleanup sweep..."

# Secret Manager
SECRET_ID="${ENVIRONMENT}-app-config"
if gcloud secrets describe "${SECRET_ID}" &>/dev/null; then
  echo "Removing Secret Manager secret: ${SECRET_ID}..."
  gcloud secrets delete "${SECRET_ID}" --quiet
fi

# Artifact Registry
REPO_ID="${ENVIRONMENT}-containers"
if gcloud artifacts repositories describe "${REPO_ID}" --location "${REGION}" &>/dev/null; then
  echo "Removing Artifact Registry repository: ${REPO_ID}..."
  gcloud artifacts repositories delete "${REPO_ID}" --location "${REGION}" --quiet
fi

# Cloud SQL
DB_INSTANCE="${ENVIRONMENT}-db-instance"
if gcloud sql instances describe "${DB_INSTANCE}" &>/dev/null; then
  echo "Removing Cloud SQL instance: ${DB_INSTANCE} (this can take a few minutes)..."
  gcloud sql instances delete "${DB_INSTANCE}" --quiet
fi

# Global IP Address
IP_NAME="${ENVIRONMENT}-private-ip"
if gcloud compute addresses describe "${IP_NAME}" --global &>/dev/null; then
  echo "Removing global IP address: ${IP_NAME}..."
  gcloud compute addresses delete "${IP_NAME}" --global --quiet
fi

# VPC Connector
VPC_CONN="${ENVIRONMENT}-vpc-conn"
if gcloud compute networks vpc-access connectors describe "${VPC_CONN}" --region "${REGION}" &>/dev/null; then
  echo "Removing VPC Connector: ${VPC_CONN}..."
  gcloud compute networks vpc-access connectors delete "${VPC_CONN}" --region "${REGION}" --quiet
fi

# Service Accounts
# 1. Application Service Account
SA_APP="${ENVIRONMENT}-app-sa@${PROJECT_ID}.iam.gserviceaccount.com"
if gcloud iam service-accounts describe "${SA_APP}" &>/dev/null; then
  echo "Removing application service account: ${SA_APP}..."
  gcloud iam service-accounts delete "${SA_APP}" --quiet
fi

# 2. Terraform Deployer Service Account (created by separate setup script)
SA_TF="terraform-deployer@${PROJECT_ID}.iam.gserviceaccount.com"
if gcloud iam service-accounts describe "${SA_TF}" &>/dev/null; then
  echo "Removing Terraform deployer service account: ${SA_TF}..."
  gcloud iam service-accounts delete "${SA_TF}" --quiet
fi

# --- Delete GCS Bucket ---
echo ""
BUCKET_NAME="${PROJECT_ID}-tf-state"
if gsutil ls "gs://${BUCKET_NAME}" &>/dev/null; then
  echo "Deleting Terraform state bucket: gs://${BUCKET_NAME}..."
  gsutil -m rm -r "gs://${BUCKET_NAME}"
fi

echo ""
echo "✅ Teardown complete!"
echo "Note: The GCP project '${PROJECT_ID}' still exists."
echo "To delete the project entirely, run: gcloud projects delete ${PROJECT_ID}"
