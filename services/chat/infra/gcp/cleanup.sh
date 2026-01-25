#!/bin/bash

# Cleanup script for Contoso Chat GCP resources
# This script safely removes all resources from the GCP project

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

# Set default project
PROJECT_ID=${PROJECT_ID:-"contoso-outdoor"}
REGION=${REGION:-"us-central1"}

log_info "🧹 Starting cleanup of GCP project: $PROJECT_ID"

# Confirm with user
confirm_cleanup() {
    echo
    log_warning "⚠️  WARNING: This will DELETE ALL resources in project '$PROJECT_ID'"
    log_warning "This action is IRREVERSIBLE and will remove:"
    echo "  • Cloud Run services"
    echo "  • Firestore databases and all data"
    echo "  • Discovery Engine datastores and all data"
    echo "  • Artifact Registry repositories and images"
    echo "  • Storage buckets and all data"
    echo "  • Service accounts"
    echo "  • Secrets"
    echo "  • All other project resources"
    echo

    read -p "Are you absolutely sure you want to proceed? Type 'DELETE' to confirm: " -r
    if [[ ! $REPLY == "DELETE" ]]; then
        log_info "Cleanup cancelled by user"
        exit 0
    fi

    echo
    log_warning "Last chance! This will start deletion in 10 seconds. Press Ctrl+C to cancel."
    for i in {10..1}; do
        echo -n "$i "
        sleep 1
    done
    echo
    log_info "Starting cleanup..."
}

# Check if gcloud is authenticated and project exists
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI not found. Please install it first."
        exit 1
    fi

    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
        log_error "No active GCP authentication found"
        log_error "Please run: gcloud auth login"
        exit 1
    fi

    # Set the project
    gcloud config set project "$PROJECT_ID"

    # Verify project exists
    if ! gcloud projects describe "$PROJECT_ID" &> /dev/null; then
        log_error "Project '$PROJECT_ID' not found or not accessible"
        exit 1
    fi

    log_success "Prerequisites checked"
}

# Clean up Cloud Run services
cleanup_cloud_run() {
    log_info "🏃 Cleaning up Cloud Run services..."

    local services=$(gcloud run services list --region="$REGION" --format="value(metadata.name)" 2>/dev/null || true)

    if [ -n "$services" ]; then
        echo "$services" | while read -r service; do
            if [ -n "$service" ]; then
                log_info "Deleting Cloud Run service: $service"
                gcloud run services delete "$service" --region="$REGION" --quiet || log_warning "Failed to delete service: $service"
            fi
        done
    else
        log_info "No Cloud Run services found"
    fi
}

# Clean up Artifact Registry repositories
cleanup_artifact_registry() {
    log_info "📦 Cleaning up Artifact Registry repositories..."

    local repos=$(gcloud artifacts repositories list --location="$REGION" --format="value(name)" 2>/dev/null || true)

    if [ -n "$repos" ]; then
        echo "$repos" | while read -r repo; do
            if [ -n "$repo" ]; then
                local repo_name=$(basename "$repo")
                log_info "Deleting Artifact Registry repository: $repo_name"
                gcloud artifacts repositories delete "$repo_name" --location="$REGION" --quiet || log_warning "Failed to delete repository: $repo_name"
            fi
        done
    else
        log_info "No Artifact Registry repositories found"
    fi
}

# Clean up Firestore databases
cleanup_firestore() {
    log_info "🔥 Cleaning up Firestore databases..."

    # List all Firestore databases
    local databases=$(gcloud firestore databases list --format="value(name)" 2>/dev/null || true)

    if [ -n "$databases" ]; then
        echo "$databases" | while read -r database; do
            if [ -n "$database" ]; then
                local db_name=$(basename "$database")
                if [ "$db_name" != "(default)" ]; then
                    log_info "Deleting Firestore database: $db_name"
                    gcloud firestore databases delete "$db_name" --quiet || log_warning "Failed to delete database: $db_name"
                else
                    log_info "Deleting all documents from default Firestore database..."
                    # For default database, we need to delete all documents
                    python3 -c "
import sys
try:
    from google.cloud import firestore
    db = firestore.Client(project='$PROJECT_ID')

    # Delete all collections and documents
    collections = db.collections()
    for collection in collections:
        docs = collection.stream()
        for doc in docs:
            doc.reference.delete()
            print(f'Deleted document: {doc.id}')
    print('All documents deleted from default database')
except Exception as e:
    print(f'Error cleaning Firestore: {e}', file=sys.stderr)
" || log_warning "Failed to clean default Firestore database"
                fi
            fi
        done
    else
        log_info "No Firestore databases found"
    fi
}

# Clean up Discovery Engine resources
cleanup_discovery_engine() {
    log_info "🔍 Cleaning up Discovery Engine resources..."

    # Clean up search engines
    local engines=$(gcloud discovery-engine search-engines list --location=global --format="value(name)" 2>/dev/null || true)

    if [ -n "$engines" ]; then
        echo "$engines" | while read -r engine; do
            if [ -n "$engine" ]; then
                local engine_id=$(basename "$engine")
                log_info "Deleting Discovery Engine search engine: $engine_id"
                gcloud discovery-engine search-engines delete "$engine_id" --location=global --quiet || log_warning "Failed to delete search engine: $engine_id"
            fi
        done
    fi

    # Clean up data stores
    local datastores=$(gcloud discovery-engine data-stores list --location=global --format="value(name)" 2>/dev/null || true)

    if [ -n "$datastores" ]; then
        echo "$datastores" | while read -r datastore; do
            if [ -n "$datastore" ]; then
                local datastore_id=$(basename "$datastore")
                log_info "Deleting Discovery Engine datastore: $datastore_id"
                gcloud discovery-engine data-stores delete "$datastore_id" --location=global --quiet || log_warning "Failed to delete datastore: $datastore_id"
            fi
        done
    fi

    if [ -z "$engines" ] && [ -z "$datastores" ]; then
        log_info "No Discovery Engine resources found"
    fi
}

# Clean up Storage buckets
cleanup_storage() {
    log_info "🪣 Cleaning up Storage buckets..."

    local buckets=$(gcloud storage ls --format="value(name)" 2>/dev/null | grep "^gs://" || true)

    if [ -n "$buckets" ]; then
        echo "$buckets" | while read -r bucket; do
            if [ -n "$bucket" ]; then
                local bucket_name=$(echo "$bucket" | sed 's|gs://||' | sed 's|/$||')
                log_info "Deleting Storage bucket: $bucket_name"
                gcloud storage rm -r "$bucket" --quiet 2>/dev/null || log_warning "Failed to delete bucket: $bucket_name"
            fi
        done
    else
        log_info "No Storage buckets found"
    fi
}

# Clean up Secret Manager secrets
cleanup_secrets() {
    log_info "🔐 Cleaning up Secret Manager secrets..."

    local secrets=$(gcloud secrets list --format="value(name)" 2>/dev/null || true)

    if [ -n "$secrets" ]; then
        echo "$secrets" | while read -r secret; do
            if [ -n "$secret" ]; then
                local secret_name=$(basename "$secret")
                log_info "Deleting secret: $secret_name"
                gcloud secrets delete "$secret_name" --quiet || log_warning "Failed to delete secret: $secret_name"
            fi
        done
    else
        log_info "No secrets found"
    fi
}

# Clean up Service Accounts
cleanup_service_accounts() {
    log_info "👤 Cleaning up Service Accounts..."

    # Get custom service accounts (exclude default ones)
    local service_accounts=$(gcloud iam service-accounts list --format="value(email)" --filter="email !~ '.*compute@developer.gserviceaccount.com' AND email !~ '.*@appspot.gserviceaccount.com'" 2>/dev/null || true)

    if [ -n "$service_accounts" ]; then
        echo "$service_accounts" | while read -r sa; do
            if [ -n "$sa" ]; then
                log_info "Deleting service account: $sa"
                gcloud iam service-accounts delete "$sa" --quiet || log_warning "Failed to delete service account: $sa"
            fi
        done
    else
        log_info "No custom service accounts found"
    fi
}

# Clean up IAM roles and bindings
cleanup_iam() {
    log_info "🔒 Cleaning up custom IAM roles..."

    local custom_roles=$(gcloud iam roles list --project="$PROJECT_ID" --format="value(name)" 2>/dev/null || true)

    if [ -n "$custom_roles" ]; then
        echo "$custom_roles" | while read -r role; do
            if [ -n "$role" ]; then
                local role_name=$(basename "$role")
                log_info "Deleting custom IAM role: $role_name"
                gcloud iam roles delete "$role_name" --project="$PROJECT_ID" --quiet || log_warning "Failed to delete role: $role_name"
            fi
        done
    else
        log_info "No custom IAM roles found"
    fi
}

# Clean up using Terraform if state exists
cleanup_terraform() {
    log_info "🏗️ Checking for Terraform state..."

    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    if [ -f "$script_dir/terraform.tfstate" ] || [ -f "$script_dir/.terraform/terraform.tfstate" ]; then
        log_info "Terraform state found, attempting terraform destroy..."

        cd "$script_dir"

        if command -v terraform &> /dev/null; then
            terraform init || log_warning "Terraform init failed"
            terraform destroy -auto-approve || log_warning "Terraform destroy failed, continuing with manual cleanup"
        else
            log_warning "Terraform not found, skipping terraform destroy"
        fi
    else
        log_info "No Terraform state found"
    fi
}

# Main cleanup function
main() {
    log_info "Starting cleanup process for project: $PROJECT_ID"

    # Parse command line arguments
    FORCE=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                FORCE=true
                shift
                ;;
            --project)
                PROJECT_ID="$2"
                shift 2
                ;;
            --region)
                REGION="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --force         Skip confirmation prompts"
                echo "  --project ID    GCP project ID (default: contoso-outdoor)"
                echo "  --region NAME   GCP region (default: us-central1)"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Check prerequisites
    check_prerequisites

    # Confirm cleanup unless forced
    if [ "$FORCE" = false ]; then
        confirm_cleanup
    fi

    # Start cleanup process
    log_info "🧹 Beginning resource cleanup..."

    # Clean up in logical order
    cleanup_terraform
    cleanup_cloud_run
    cleanup_discovery_engine
    cleanup_firestore
    cleanup_storage
    cleanup_artifact_registry
    cleanup_secrets
    cleanup_service_accounts
    cleanup_iam

    # Final summary
    log_success "🎉 Cleanup completed!"
    log_info "Project '$PROJECT_ID' has been cleaned up."
    log_warning "Note: Some resources may take a few minutes to fully delete."
    log_info "You may want to verify in the GCP Console that all resources are removed."
}

# Run main function
main "$@"