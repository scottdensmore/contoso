#!/bin/bash

# Deploy script for Contoso Chat on Google Cloud Platform
# This script deploys the infrastructure and seeds the data

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    log_info "Checking prerequisites..."

    local missing_tools=()

    if ! command -v terraform &> /dev/null; then
        missing_tools+=("terraform")
    fi

    if ! command -v gcloud &> /dev/null; then
        missing_tools+=("gcloud")
    fi

    if ! command -v python3 &> /dev/null; then
        missing_tools+=("python3")
    fi

    if ! command -v docker &> /dev/null; then
        missing_tools+=("docker")
    fi

    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_error "Please install them and try again."
        exit 1
    fi

    log_success "All prerequisites are installed"
}

# Validate environment variables
validate_environment() {
    log_info "Validating environment variables..."

    if [ -z "${PROJECT_ID:-}" ]; then
        log_error "PROJECT_ID environment variable is required"
        exit 1
    fi

    if [ -z "${ENVIRONMENT:-}" ]; then
        log_warning "ENVIRONMENT not set, defaulting to 'dev'"
        export ENVIRONMENT="dev"
    fi

    if [ -z "${REGION:-}" ]; then
        log_warning "REGION not set, defaulting to 'us-central1'"
        export REGION="us-central1"
    fi

    log_success "Environment variables validated"
    log_info "PROJECT_ID: $PROJECT_ID"
    log_info "ENVIRONMENT: $ENVIRONMENT"
    log_info "REGION: $REGION"
}

# Check GCP authentication
check_gcp_auth() {
    log_info "Checking GCP authentication..."

    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
        log_error "No active GCP authentication found"
        log_error "Please run: gcloud auth login"
        exit 1
    fi

    # Set the project
    gcloud config set project "$PROJECT_ID"

    # Check if application default credentials are set
    if ! gcloud auth application-default print-access-token &> /dev/null; then
        log_warning "Application default credentials not found"
        log_info "Setting up application default credentials..."
        gcloud auth application-default login
    fi

    log_success "GCP authentication verified"
}

# Enable essential APIs that Terraform needs
enable_essential_apis() {
    log_info "Enabling essential GCP APIs..."

    # Enable Cloud Resource Manager API first (required for Terraform to enable other APIs)
    log_info "Enabling Cloud Resource Manager API..."
    gcloud services enable cloudresourcemanager.googleapis.com --project="$PROJECT_ID" || {
        log_error "Failed to enable Cloud Resource Manager API"
        exit 1
    }

    # Enable Service Usage API (also needed for API management)
    log_info "Enabling Service Usage API..."
    gcloud services enable serviceusage.googleapis.com --project="$PROJECT_ID" || {
        log_warning "Service Usage API might already be enabled"
    }

    # Wait for APIs to propagate
    log_info "Waiting for APIs to propagate..."
    sleep 10

    log_success "Essential APIs enabled"
}

# Initialize Terraform
init_terraform() {
    log_info "Initializing Terraform..."

    cd "$(dirname "$0")"

    # Initialize Terraform
    terraform init

    log_success "Terraform initialized"
}

# Plan Terraform deployment
plan_terraform() {
    log_info "Planning Terraform deployment..."

    # Create terraform.tfvars if it doesn't exist
    if [ ! -f terraform.tfvars ]; then
        log_info "Creating terraform.tfvars from example..."
        cp terraform.tfvars.example terraform.tfvars

        # Update with current environment variables
        sed -i.bak "s/your-gcp-project-id/$PROJECT_ID/g" terraform.tfvars
        sed -i.bak "s/dev/$ENVIRONMENT/g" terraform.tfvars
        sed -i.bak "s/us-central1/$REGION/g" terraform.tfvars

        # Get current user email if possible
        CURRENT_USER=$(gcloud config list account --format "value(core.account)" 2>/dev/null || echo "")
        if [ -n "$CURRENT_USER" ]; then
            sed -i.bak "s/your-email@domain.com/$CURRENT_USER/g" terraform.tfvars
        fi

        rm terraform.tfvars.bak

        log_warning "Please review and update terraform.tfvars before continuing"
        log_info "terraform.tfvars has been created with default values"
    fi

    # Plan the deployment (quietly for idempotent runs)
    terraform plan -out=tfplan -detailed-exitcode > /dev/null 2>&1 || {
        log_info "Infrastructure changes detected, applying updates..."
    }

    log_success "Terraform plan completed"
}

# Apply Terraform deployment
apply_terraform() {
    log_info "Applying Terraform deployment..."

    # Apply the plan
    terraform apply tfplan

    log_success "Terraform deployment completed"
}

# Get Terraform outputs
get_terraform_outputs() {
    log_info "Retrieving Terraform outputs..."

    # Export outputs as environment variables for data seeding
    export CLOUD_RUN_SERVICE_URL=$(terraform output -raw cloud_run_service_url)
    export FIRESTORE_DATABASE=$(terraform output -raw firestore_database_name)
    export DISCOVERY_ENGINE_DATASTORE_ID=$(terraform output -raw discovery_engine_datastore_id)
    export DISCOVERY_ENGINE_APP_ID=$(terraform output -raw discovery_engine_app_id)
    export CONTAINER_REGISTRY_URL=$(terraform output -raw container_registry_url)

    log_success "Terraform outputs retrieved"
    log_info "Cloud Run URL: $CLOUD_RUN_SERVICE_URL"
    log_info "Container Registry: $CONTAINER_REGISTRY_URL"
}

# Build and push container image
build_and_push_image() {
    log_info "Building and pushing container image..."

    cd "../../"  # Go back to project root

    # Configure Docker for Artifact Registry
    log_info "Configuring Docker for Artifact Registry..."
    gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet

    # Build the image
    local image_tag="${IMAGE_TAG:-latest}"
    local full_image_name="$CONTAINER_REGISTRY_URL/contoso-chat:$image_tag"

    # Check if image already exists (for idempotency)
    if gcloud artifacts docker images describe "$full_image_name" --quiet 2>/dev/null; then
        log_info "Container image $full_image_name already exists"
        log_info "Rebuilding to ensure it's up to date..."
    fi

    # Verify Dockerfile exists
    if [ ! -f "src/api/Dockerfile" ]; then
        log_error "Dockerfile not found at src/api/Dockerfile"
        exit 1
    fi

    # Build the image with correct platform for Cloud Run
    log_info "Building container image: $full_image_name"
    log_info "Using Dockerfile: src/api/Dockerfile"
    log_info "Building for linux/amd64 platform (required for Cloud Run)"

    docker build --platform linux/amd64 -t "$full_image_name" -f src/api/Dockerfile . || {
        log_error "Failed to build container image"
        exit 1
    }

    # Push the image
    log_info "Pushing container image to registry..."
    docker push "$full_image_name" || {
        log_error "Failed to push container image"
        exit 1
    }

    # Verify the push was successful
    if gcloud artifacts docker images describe "$full_image_name" --quiet 2>/dev/null; then
        log_success "Container image successfully built and pushed: $full_image_name"
    else
        log_error "Failed to verify container image in registry"
        exit 1
    fi

    cd infra/gcp  # Return to terraform directory
}

# Update Cloud Run service with new image
update_cloud_run() {
    log_info "Updating Cloud Run service with new image..."

    local image_tag="${IMAGE_TAG:-latest}"
    local full_image_name="$CONTAINER_REGISTRY_URL/contoso-chat:$image_tag"
    local service_name="${ENVIRONMENT}-app"

    # Update the Cloud Run service directly with gcloud
    log_info "Deploying new image to Cloud Run service: $service_name"
    gcloud run deploy "$service_name" \
        --image="$full_image_name" \
        --region="$REGION" \
        --platform=managed \
        --allow-unauthenticated \
        --quiet

    log_success "Cloud Run service updated with image: $full_image_name"
}

# Create Discovery Engine resources
create_discovery_engine() {
    log_info "Creating Discovery Engine resources..."

    # Export environment variables for the script
    export PROJECT_ID
    export ENVIRONMENT

    # Run the Discovery Engine creation script
    ./create_discovery_engine.sh

    log_success "Discovery Engine resources created"
}

# Seed data
seed_data() {
    log_info "Seeding data..."

    cd "../../scripts"  # Go to scripts directory

    # Run the data seeding script
    python3 seed_gcp_all.py

    log_success "Data seeding completed"

    cd ../infra/gcp  # Return to terraform directory
}

# Show deployment summary
show_summary() {
    log_success "🎉 Deployment completed successfully!"
    echo
    log_info "=== DEPLOYMENT SUMMARY ==="
    log_info "Project ID: $PROJECT_ID"
    log_info "Environment: $ENVIRONMENT"
    log_info "Region: $REGION"
    log_info "Cloud Run URL: $CLOUD_RUN_SERVICE_URL"
    log_info "Container Registry: $CONTAINER_REGISTRY_URL"
    echo
    log_info "Your Contoso Chat application is now running on Google Cloud!"
    log_info "You can access it at: $CLOUD_RUN_SERVICE_URL"
    echo
    log_info "To test the API, try:"
    log_info "curl $CLOUD_RUN_SERVICE_URL/docs"
}

# Main deployment function
main() {
    log_info "🚀 Starting Contoso Chat GCP deployment..."

    # Parse command line arguments
    SKIP_INFRA=false
    SKIP_BUILD=false
    SKIP_DATA=false
    FORCE_REBUILD=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-infra)
                SKIP_INFRA=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --skip-data)
                SKIP_DATA=true
                shift
                ;;
            --force-rebuild)
                FORCE_REBUILD=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --skip-infra     Skip infrastructure deployment"
                echo "  --skip-build     Skip container build and push"
                echo "  --skip-data      Skip data seeding"
                echo "  --force-rebuild  Force complete rebuild (cleanup first)"
                echo "  --help           Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Handle force rebuild
    if [ "$FORCE_REBUILD" = true ]; then
        log_warning "🧹 Force rebuild requested - running cleanup first..."
        ./cleanup.sh --force
        log_info "Cleanup completed, proceeding with fresh deployment..."
    fi

    # Check prerequisites
    check_prerequisites

    # Validate environment
    validate_environment

    # Check GCP authentication
    check_gcp_auth

    # Enable essential APIs
    enable_essential_apis

    if [ "$SKIP_INFRA" = false ]; then
        # Initialize and apply Terraform
        init_terraform
        plan_terraform

        # Apply terraform automatically (idempotent)
        apply_terraform
        get_terraform_outputs

        # Create Discovery Engine resources after infrastructure is ready
        create_discovery_engine
    else
        log_info "Skipping infrastructure deployment"
        cd "$(dirname "$0")"
        get_terraform_outputs
    fi

    if [ "$SKIP_BUILD" = false ]; then
        # Build and deploy application
        build_and_push_image
        update_cloud_run
    else
        log_info "Skipping container build and push"
    fi

    if [ "$SKIP_DATA" = false ]; then
        # Seed data
        seed_data
    else
        log_info "Skipping data seeding"
    fi

    # Show summary
    show_summary
}

# Run main function
main "$@"