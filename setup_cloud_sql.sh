#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# IMPORTANT: Replace these with your desired settings.
PROJECT_ID="YOUR_GCP_PROJECT_ID" # Replace with your GCP Project ID
INSTANCE_NAME="contoso-web-db-instance" # A unique name for your Cloud SQL instance
REGION="us-central1" # The region for your instance
DB_NAME="contoso-db" # The name of the database
DB_USER="user" # The username for the database
DB_PASSWORD="your-strong-password" # Replace with a strong, secure password

# --- Pre-flight Checks ---
echo "Setting project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

echo "Enabling required services..."
gcloud services enable sqladmin.googleapis.com

# --- Create Cloud SQL Instance (Idempotent) ---
echo "Checking for existing Cloud SQL instance: ${INSTANCE_NAME}..."
if gcloud sql instances describe "${INSTANCE_NAME}" &> /dev/null; then
  echo "Instance '${INSTANCE_NAME}' already exists. Skipping creation."
else
  echo "Creating Cloud SQL instance '${INSTANCE_NAME}'..."
  gcloud sql instances create "${INSTANCE_NAME}" \
    --database-version=POSTGRES_15 \
    --region="${REGION}" \
    --cpu=2 \
    --memory=4GB \
    --root-password="${DB_PASSWORD}" # Set root password for initial setup
  echo "Instance created successfully."
fi

# --- Create Database (Idempotent) ---
echo "Checking for existing database: ${DB_NAME}..."
if gcloud sql databases describe "${DB_NAME}" --instance="${INSTANCE_NAME}" &> /dev/null; then
  echo "Database '${DB_NAME}' already exists. Skipping creation."
else
  echo "Creating database '${DB_NAME}'..."
  gcloud sql databases create "${DB_NAME}" --instance="${INSTANCE_NAME}"
  echo "Database created successfully."
fi

# --- Create User (Idempotent) ---
echo "Checking for existing user: ${DB_USER}..."
if gcloud sql users list --instance="${INSTANCE_NAME}" --format="value(name)" | grep -q "^${DB_USER}$\"; then
  echo "User '${DB_USER}' already exists. Skipping creation."
else
  echo "Creating user '${DB_USER}'..."
  gcloud sql users create "${DB_USER}" \
    --instance="${INSTANCE_NAME}" \
    --password="${DB_PASSWORD}"
  echo "User created successfully."
fi

# --- Output Connection String ---
INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe "${INSTANCE_NAME}" --format='value(connectionName)')

echo "\n✅ Setup complete!"
echo "\nUse the following DATABASE_URL for your GitHub Secret and Cloud Run environment variable:"
echo "postgresql://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${INSTANCE_CONNECTION_NAME}"
