#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# The script uses the following environment variables:
# PROJECT_ID: The GCP Project ID.
PROJECT_ID=${PROJECT_ID:-"contoso-outdoor"}
SERVICE_ACCOUNT_NAME="terraform-deployer"

# --- Pre-flight Checks ---
echo "Setting project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

echo "Enabling required services..."
gcloud services enable iam.googleapis.com

# --- Create Service Account (Idempotent) ---
echo "Checking for existing service account: ${SERVICE_ACCOUNT_NAME}..."
if gcloud iam service-accounts describe "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" &> /dev/null; then
  echo "Service account '${SERVICE_ACCOUNT_NAME}' already exists. Skipping creation."
else
  echo "Creating service account '${SERVICE_ACCOUNT_NAME}'..."
  gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
    --display-name="Terraform Deployer"
  echo "Service account created successfully."
  echo "Waiting for service account to propagate..."
  sleep 10
fi

# --- Grant Permissions ---
# Grant roles needed for Terraform to manage resources
echo "Granting permissions to service account..."
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/owner" # For simplicity, granting Owner. For production, use least-privilege.

# --- Create and Download Key ---
if [ -f "terraform/terraform-credentials.json" ]; then
  echo "Service account key already exists at 'terraform/terraform-credentials.json'. Skipping creation."
else
  echo "Creating and downloading service account key..."
  success=false
  for i in {1..5}; do
    if gcloud iam service-accounts keys create "terraform/terraform-credentials.json" \
      --iam-account="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"; then
      echo "Successfully created service account key."
      success=true
      break
    fi
    echo "Attempt $i of 5 failed."
    if [ $i -lt 5 ]; then
      echo "Retrying in 10 seconds..."
      sleep 10
    fi
  done

  if [ "$success" = false ]; then
    echo "Error: Failed to create service account key after 5 attempts." >&2
    exit 1
  fi
fi

echo "\n✅ Setup complete!"
echo "A service account key has been saved to 'terraform/terraform-credentials.json'."
echo "You will use the contents of this file for the GCP_SA_KEY GitHub secret."
