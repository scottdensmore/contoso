#!/bin/bash

# Don't exit on errors - we want to continue even if resources don't exist
set +e

# --- Pre-flight Checks ---
if [ -z "${NEXTAUTH_SECRET}" ]; then
  echo "Warning: NEXTAUTH_SECRET not set. Terraform destroy may fail."
  echo "Set it with: export NEXTAUTH_SECRET=<your-secret>"
fi

# --- Configuration ---
# The script uses the following environment variables:
# PROJECT_ID: The GCP Project ID.
# NEXTAUTH_SECRET: Required for Terraform destroy
PROJECT_ID=${PROJECT_ID:-"contoso-outdoor"}

# --- Confirmation ---
echo "⚠️  WARNING: This will destroy all resources in project '${PROJECT_ID}'"
echo "This includes:"
echo "  - Cloud Run service (contoso-web)"
echo "  - Cloud SQL database (ALL DATA WILL BE LOST)"
echo "  - VPC Connector"
echo "  - Artifact Registry repository"
echo "  - Terraform state bucket"
echo "  - Service accounts"
echo ""
echo "This script is idempotent and can be run multiple times safely."
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

# --- Delete Cloud Run Resources ---
echo ""
echo "Checking for Cloud Run service..."
if gcloud run services describe contoso-web --region us-central1 &>/dev/null; then
  echo "Deleting Cloud Run service..."
  gcloud run services delete contoso-web --region us-central1 --quiet
else
  echo "Cloud Run service not found (already deleted)"
fi

# --- Delete Artifact Registry Repository ---
echo ""
echo "Checking for Artifact Registry repository..."
if gcloud artifacts repositories describe contoso-outdoor-repo --location us-central1 &>/dev/null; then
  echo "Deleting Artifact Registry repository..."
  gcloud artifacts repositories delete contoso-outdoor-repo --location us-central1 --quiet
else
  echo "Artifact Registry repository not found (already deleted)"
fi

# --- Delete Cloud SQL Instance First ---
echo ""
echo "Checking for Cloud SQL instance..."
if gcloud sql instances describe contoso-outdoor-db-instance &>/dev/null; then
  echo "Deleting Cloud SQL instance (this may take several minutes)..."
  gcloud sql instances delete contoso-outdoor-db-instance --quiet
else
  echo "Cloud SQL instance not found (already deleted)"
fi

# Wait for Cloud SQL deletion to complete
echo "Waiting for Cloud SQL deletion to complete..."
echo "Checking if instance still exists..."
for i in {1..60}; do
  if gcloud sql instances describe contoso-outdoor-db-instance --format="value(state)" 2>/dev/null; then
    echo "  Attempt $i/60: Instance still exists, waiting..."
    sleep 10
  else
    echo "✓ Cloud SQL instance deleted successfully"
    break
  fi
done

# --- Run Terraform Destroy ---
echo ""
echo "Checking for Terraform state..."
if [ -d "terraform/.terraform" ]; then
  echo "Running Terraform destroy..."
  cd terraform
  terraform init || echo "Terraform init failed, continuing..."

  # Try to destroy, but handle errors gracefully
  if [ -n "${NEXTAUTH_SECRET}" ]; then
    terraform destroy -auto-approve -var="nextauth_secret=${NEXTAUTH_SECRET}" || echo "Terraform destroy encountered errors, continuing..."
  else
    terraform destroy -auto-approve || echo "Terraform destroy encountered errors, continuing..."
  fi

  # Handle the VPC connection error if it occurs
  if [ $? -ne 0 ]; then
    echo "Removing VPC Service Networking Connection from state..."
    terraform state rm google_service_networking_connection.private_vpc_connection 2>/dev/null || true

    # Try destroy again
    if [ -n "${NEXTAUTH_SECRET}" ]; then
      terraform destroy -auto-approve -var="nextauth_secret=${NEXTAUTH_SECRET}" || echo "Terraform destroy still has errors, continuing..."
    else
      terraform destroy -auto-approve || echo "Terraform destroy still has errors, continuing..."
    fi
  fi

  cd ..
else
  echo "Terraform not initialized (already cleaned up)"
fi

# --- Delete GCS Bucket ---
echo ""
echo "Checking for Terraform state bucket..."
if gsutil ls "gs://contoso-outdoor-tf-state" &>/dev/null; then
  echo "Deleting GCS bucket..."
  gsutil -m rm -r "gs://contoso-outdoor-tf-state"
else
  echo "GCS bucket not found (already deleted)"
fi

# --- Delete Service Account ---
echo ""
echo "Checking for service account..."
if gcloud iam service-accounts describe "terraform-deployer@${PROJECT_ID}.iam.gserviceaccount.com" &>/dev/null; then
  echo "Deleting service account..."
  gcloud iam service-accounts delete "terraform-deployer@${PROJECT_ID}.iam.gserviceaccount.com" --quiet
else
  echo "Service account not found (already deleted)"
fi

echo ""
echo "✅ Teardown complete!"
echo ""
echo "All resources have been deleted from project '${PROJECT_ID}'"
echo ""
echo "To redeploy, run: ./scripts/setup_project.sh"
echo ""
echo "Note: The GCP project '${PROJECT_ID}' itself still exists."
echo "To delete the project entirely, run:"
echo "  gcloud projects delete ${PROJECT_ID}"
