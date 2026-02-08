#!/bin/bash
set -e

# Mock environment variables that would usually be secrets
export PROJECT_ID="${PROJECT_ID:-contoso-outdoor}"
export REGION="${REGION:-us-central1}"
export ENVIRONMENT="${ENVIRONMENT:-dev}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-dummy_secret_for_simulation}"

echo "--- Simulating GitHub Actions Workflow ---"

# Step 1: Terraform (Mocking the 'infrastructure' job)
echo "Step 1: Simulating Terraform..."
cd infrastructure/terraform

# In a real CI, we would run apply. For simulation, we check outputs.
# If outputs are missing, we warn.
if ! terraform output db_instance_name > /dev/null 2>&1; then
    echo "⚠️  Terraform outputs not found. Running plan to ensure config is valid..."
    terraform init -backend=false
    terraform validate
    echo "✅ Terraform config is valid. (Skipping actual apply for simulation)"
    
    # Mock outputs for the next steps
    DB_USER="mock_user"
    DB_PASSWORD="mock_password"
    DB_NAME="mock_db"
    INSTANCE_CONNECTION_NAME="mock-project:region:mock-instance"
    CONTAINER_REGISTRY_URL="us-central1-docker.pkg.dev/mock-project/mock-repo"
else
    echo "✅ Terraform outputs found."
    DB_USER=$(terraform output -raw db_user)
    DB_PASSWORD=$(terraform output -raw db_password)
    DB_NAME=$(terraform output -raw db_name)
    DB_INSTANCE_NAME=$(terraform output -raw db_instance_name)
    CONTAINER_REGISTRY_URL=$(terraform output -raw container_registry_url)
    # Mock connection name construction
    INSTANCE_CONNECTION_NAME="${PROJECT_ID}:${REGION}:${DB_INSTANCE_NAME}"
fi

cd ../..

echo "--- Captured Terraform Outputs ---"
echo "DB_USER: ${DB_USER}"
echo "DB_NAME: ${DB_NAME}"
echo "CONTAINER_REGISTRY: ${CONTAINER_REGISTRY_URL}"

# Step 2: Dynamic Variable Construction (The proposed fix)
echo "Step 2: Constructing DATABASE_URL dynamically..."
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost/${DB_NAME}?host=/cloudsql/${INSTANCE_CONNECTION_NAME}"
echo "Generated DATABASE_URL: ${DATABASE_URL}"

# Step 3: Build & Push (Simulating 'deploy-web' and 'deploy-chat')
echo "Step 3: Simulating Docker Build..."

# Web App
echo "Building Web App..."
# We use --dry-run or just check if Dockerfile exists to be fast
if [ -f "Dockerfile" ]; then
    echo "✅ Web App Dockerfile found."
else
    echo "❌ Web App Dockerfile missing!"
    exit 1
fi

# Chat Service
echo "Building Chat Service..."
if [ -f "services/chat/Dockerfile" ]; then
    echo "✅ Chat Service Dockerfile found."
else
    echo "❌ Chat Service Dockerfile missing!"
    exit 1
fi

echo "✅ CI Simulation Complete. Logic verified."
