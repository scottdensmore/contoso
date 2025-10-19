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

# --- Enable Services ---
echo "Enabling required services..."
gcloud services enable iam.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# --- Run Setup Scripts ---
echo "Running setup scripts..."
./scripts/setup_terraform_sa.sh
./scripts/setup_tf_backend.sh

# --- Run Terraform ---
echo "Running Terraform..."
cd terraform
terraform init
terraform apply -auto-approve -var="nextauth_secret=${NEXTAUTH_SECRET}"
cd ..

# --- Deploy Application ---
echo "Deploying application..."
DATABASE_URL=$(cd terraform && terraform output -raw db_instance_name)
docker buildx build --platform linux/amd64 -t "us-central1-docker.pkg.dev/${PROJECT_ID}/contoso-outdoor-repo/contoso-web:latest" .
docker push "us-central1-docker.pkg.dev/${PROJECT_ID}/contoso-outdoor-repo/contoso-web:latest"
gcloud run deploy contoso-web \
  --image "us-central1-docker.pkg.dev/${PROJECT_ID}/contoso-outdoor-repo/contoso-web:latest" \
  --set-env-vars=DATABASE_URL="${DATABASE_URL}" \
  --region us-central1 \
  --allow-unauthenticated

# --- Update Cloud Run Service ---
echo "Updating Cloud Run service..."
CLOUD_RUN_URL=$(gcloud run services describe contoso-web --region us-central1 --format 'value(uri)')
gcloud run services update contoso-web \
  --update-env-vars=NEXTAUTH_URL="${CLOUD_RUN_URL}" \
  --region us-central1

echo "\n✅ Project setup and deployment complete!"
echo "Your application is available at: ${CLOUD_RUN_URL}"
