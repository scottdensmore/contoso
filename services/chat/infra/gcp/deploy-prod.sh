#!/bin/bash

# Production deployment script for Contoso Chat on Google Cloud Platform
# This script deploys the production environment with enhanced security and scaling

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
PROJECT_ID=${PROJECT_ID:-"contoso-outdoor"}
ENVIRONMENT="prod"
REGION=${REGION:-"us-central1"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

log_info "🚀 Starting production deployment for Contoso Chat"
log_info "Project: $PROJECT_ID"
log_info "Environment: $ENVIRONMENT"
log_info "Region: $REGION"

# Pre-deployment checks
log_info "🔍 Running pre-deployment checks..."

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
    log_error "❌ No active gcloud authentication found"
    log_info "Please run: gcloud auth login"
    exit 1
fi

# Check if correct project is set
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
if [[ "$CURRENT_PROJECT" != "$PROJECT_ID" ]]; then
    log_warning "⚠️  Current project ($CURRENT_PROJECT) differs from target ($PROJECT_ID)"
    log_info "Setting project to $PROJECT_ID"
    gcloud config set project "$PROJECT_ID"
fi

# Verify project exists and user has access
if ! gcloud projects describe "$PROJECT_ID" >/dev/null 2>&1; then
    log_error "❌ Cannot access project $PROJECT_ID"
    log_info "Please verify project exists and you have access"
    exit 1
fi

log_success "✅ Pre-deployment checks passed"

# Enable required APIs
log_info "📡 Enabling required Google Cloud APIs..."
REQUIRED_APIS=(
    "cloudresourcemanager.googleapis.com"
    "run.googleapis.com"
    "artifactregistry.googleapis.com"
    "firestore.googleapis.com"
    "aiplatform.googleapis.com"
    "discoveryengine.googleapis.com"
    "secretmanager.googleapis.com"
    "monitoring.googleapis.com"
    "logging.googleapis.com"
    "cloudbuild.googleapis.com"
)

for api in "${REQUIRED_APIS[@]}"; do
    if gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        log_info "✓ $api already enabled"
    else
        log_info "Enabling $api..."
        gcloud services enable "$api"
    fi
done

log_success "✅ All required APIs enabled"

# Production security checks
log_info "🔒 Running production security validation..."

# Check for production-ready configuration
if [[ ! -f "terraform-prod.tfvars" ]]; then
    log_error "❌ Production configuration file terraform-prod.tfvars not found"
    exit 1
fi

# Validate production settings
if grep -q 'force_destroy.*=.*true' terraform-prod.tfvars; then
    log_error "❌ force_destroy is set to true in production config"
    log_error "This is dangerous for production environments"
    exit 1
fi

if grep -q 'min_instances.*=.*0' terraform-prod.tfvars; then
    log_warning "⚠️  min_instances is set to 0 - consider setting to 1+ for production"
fi

log_success "✅ Production security validation passed"

# Build and push container image
log_info "🐳 Building and pushing container image..."

# Navigate to project root
cd "$(dirname "$0")/../.."

# Build production image with optimizations
log_info "Building production container..."
docker build \
    --platform linux/amd64 \
    --target production \
    -f src/api/Dockerfile \
    -t "gcr.io/$PROJECT_ID/${ENVIRONMENT}-app:$IMAGE_TAG" \
    -t "gcr.io/$PROJECT_ID/${ENVIRONMENT}-app:$(date +%Y%m%d-%H%M%S)" \
    .

# Configure Docker to use gcloud credentials
gcloud auth configure-docker --quiet

# Push images
log_info "Pushing container images..."
docker push "gcr.io/$PROJECT_ID/${ENVIRONMENT}-app:$IMAGE_TAG"
docker push "gcr.io/$PROJECT_ID/${ENVIRONMENT}-app:$(date +%Y%m%d-%H%M%S)"

log_success "✅ Container images built and pushed"

# Navigate back to terraform directory
cd "infra/gcp"

# Terraform deployment
log_info "🏗️  Deploying infrastructure with Terraform..."

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Plan with production variables
log_info "Creating Terraform plan for production..."
terraform plan \
    -var-file="terraform-prod.tfvars" \
    -var="image_tag=$IMAGE_TAG" \
    -out="terraform-prod.plan"

# Confirm deployment
log_warning "⚠️  About to deploy to PRODUCTION environment"
log_info "Project: $PROJECT_ID"
log_info "Environment: $ENVIRONMENT"
read -p "Are you sure you want to proceed? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log_info "Deployment cancelled"
    exit 0
fi

# Apply infrastructure
log_info "Applying Terraform configuration..."
terraform apply "terraform-prod.plan"

log_success "✅ Infrastructure deployment completed"

# Post-deployment validation
log_info "🧪 Running post-deployment validation..."

# Get service URL
SERVICE_URL=$(terraform output -raw cloud_run_service_url)
DASHBOARD_URL=$(terraform output -raw monitoring_dashboard_url)

# Health check
log_info "Testing health endpoint..."
if curl -f -s "$SERVICE_URL/health" > /dev/null; then
    log_success "✅ Health check passed"
else
    log_error "❌ Health check failed"
    exit 1
fi

# Test API endpoint
log_info "Testing API endpoint..."
TEST_RESPONSE=$(curl -s -X POST "$SERVICE_URL/api/create_response" \
    -H "Content-Type: application/json" \
    -d '{"question": "Production deployment test", "customer_id": "1", "chat_history": "[]"}')

if echo "$TEST_RESPONSE" | grep -q "answer\|response"; then
    log_success "✅ API endpoint test passed"
else
    log_error "❌ API endpoint test failed"
    log_error "Response: $TEST_RESPONSE"
    exit 1
fi

log_success "✅ Post-deployment validation completed"

# Clean up
rm -f terraform-prod.plan

# Final output
log_success "🎉 Production deployment completed successfully!"
log_info ""
log_info "📊 Deployment Summary:"
log_info "Environment: $ENVIRONMENT"
log_info "Service URL: $SERVICE_URL"
log_info "Dashboard URL: $DASHBOARD_URL"
log_info ""
log_info "🔍 Next Steps:"
log_info "1. Monitor the dashboard for metrics and alerts"
log_info "2. Run data seeding if this is a fresh deployment"
log_info "3. Configure DNS and SSL certificates if needed"
log_info "4. Set up CI/CD pipeline for future deployments"