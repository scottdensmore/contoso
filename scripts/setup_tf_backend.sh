#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# The script uses the following environment variables:
# BUCKET_NAME: The name of the GCS bucket for Terraform state. Must be globally unique.
# LOCATION: The location of the GCS bucket.
BUCKET_NAME=${BUCKET_NAME:-"contoso-outdoor-tf-state"}
PROJECT_ID=$(gcloud config get-value project)
LOCATION=${LOCATION:-"US"}

echo "Using project: ${PROJECT_ID}"
echo "Checking for GCS bucket: gs://${BUCKET_NAME}..."

# Check if the bucket already exists
if gsutil ls -b "gs://${BUCKET_NAME}" &> /dev/null; then
  echo "GCS bucket 'gs://${BUCKET_NAME}' already exists. Skipping creation."
else
  echo "Creating GCS bucket 'gs://${BUCKET_NAME}'..."
  # Create the bucket
  gsutil mb -p "${PROJECT_ID}" -l "${LOCATION}" "gs://${BUCKET_NAME}"
  
  # Enable versioning to keep state history
  gsutil versioning set on "gs://${BUCKET_NAME}"
  echo "Bucket created and versioning enabled."
fi

echo "\n✅ Terraform backend bucket is ready."
