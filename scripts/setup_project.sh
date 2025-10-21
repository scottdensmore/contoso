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
gcloud services enable compute.googleapis.com
gcloud services enable servicenetworking.googleapis.com
gcloud services enable vpcaccess.googleapis.com

echo "Waiting for services to be enabled..."
sleep 30

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

DB_NAME=$(cd terraform && terraform output -raw db_name)
DB_USER=$(cd terraform && terraform output -raw db_user)
DB_PASSWORD=$(cd terraform && terraform output -raw db_password)
INSTANCE_CONNECTION_NAME=$(cd terraform && terraform output -raw instance_connection_name)

# URL encode special characters for DATABASE_URL
# For Cloud SQL unix sockets with Prisma, the socket path goes in the hostname position
SOCKET_PATH="/cloudsql/${INSTANCE_CONNECTION_NAME}"
SOCKET_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${SOCKET_PATH}', safe=''))")

# Construct DATABASE_URL for Cloud SQL unix socket connection
# Format: postgresql://USER:PASSWORD@%2Fcloudsql%2FINSTANCE/DATABASE
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${SOCKET_ENCODED}/${DB_NAME}"

echo "Database migrations will run automatically on application startup"

# --- Deploy Application ---
echo "Deploying application..."
# For Cloud Run with Cloud SQL unix socket, use localhost with host parameter
# Cloud Run will mount the socket when --add-cloudsql-instances is used
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost/${DB_NAME}?host=/cloudsql/${INSTANCE_CONNECTION_NAME}"
VPC_CONNECTOR=$(cd terraform && terraform output -raw vpc_connector)
docker buildx build --platform linux/amd64 -t "us-central1-docker.pkg.dev/${PROJECT_ID}/contoso-outdoor-repo/contoso-web:latest" .
docker push "us-central1-docker.pkg.dev/${PROJECT_ID}/contoso-outdoor-repo/contoso-web:latest"
gcloud run deploy contoso-web \
  --image "us-central1-docker.pkg.dev/${PROJECT_ID}/contoso-outdoor-repo/contoso-web:latest" \
  --set-env-vars=DATABASE_URL="${DATABASE_URL}",NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
  --add-cloudsql-instances="${INSTANCE_CONNECTION_NAME}" \
  --vpc-connector="${VPC_CONNECTOR}" \
  --region us-central1 \
  --allow-unauthenticated


