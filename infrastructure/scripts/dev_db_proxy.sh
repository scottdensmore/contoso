#!/bin/bash

# This script starts the Cloud SQL Proxy for local development
# It connects to the private database instance using Cloud IAM authentication

set -e

PROJECT_ID=${PROJECT_ID:-"contoso-outdoor"}

echo "Starting Cloud SQL Proxy for local development..."
echo "This uses your personal GCP credentials to securely connect to the private database."
echo ""

# Get instance connection name from Terraform
cd terraform
INSTANCE_CONNECTION_NAME=$(terraform output -raw instance_connection_name)
DB_USER=$(terraform output -raw db_user)
DB_PASSWORD=$(terraform output -raw db_password)
DB_NAME=$(terraform output -raw db_name)
cd ..

# URL encode the password
DB_PASSWORD_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$DB_PASSWORD', safe=''))")

# Detect OS and architecture, download appropriate Cloud SQL Proxy if needed
if [ ! -f "cloud_sql_proxy" ]; then
  OS="$(uname -s)"
  ARCH="$(uname -m)"

  case "${OS}" in
      Linux*)
          case "${ARCH}" in
              x86_64)     PROXY_URL="https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64";;
              aarch64|arm64) PROXY_URL="https://dl.google.com/cloudsql/cloud_sql_proxy.linux.arm64";;
              *)          echo "Unsupported architecture: ${ARCH}"; exit 1;;
          esac
          ;;
      Darwin*)
          case "${ARCH}" in
              x86_64)     PROXY_URL="https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64";;
              arm64)      PROXY_URL="https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.arm64";;
              *)          echo "Unsupported architecture: ${ARCH}"; exit 1;;
          esac
          ;;
      *)
          echo "Unsupported OS: ${OS}"; exit 1;;
  esac

  echo "Downloading Cloud SQL Proxy..."
  curl -o cloud_sql_proxy "${PROXY_URL}"
  chmod +x cloud_sql_proxy
fi

echo ""
echo "Cloud SQL Proxy is running on localhost:5432"
echo "Database: ${DB_NAME}"
echo "User: ${DB_USER}"
echo ""
echo "Connection string:"
echo "postgresql://${DB_USER}:${DB_PASSWORD_ENCODED}@localhost:5432/${DB_NAME}"
echo ""
echo "Press Ctrl+C to stop the proxy"
echo ""

# Run the proxy in foreground
./cloud_sql_proxy -instances=${INSTANCE_CONNECTION_NAME}=tcp:5432
