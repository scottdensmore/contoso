#!/bin/bash

# Script to manually create Discovery Engine resources
# Run this after the main Terraform deployment

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

# Get configuration
PROJECT_ID=${PROJECT_ID:-"contoso-outdoor"}
ENVIRONMENT=${ENVIRONMENT:-"dev"}
DATASTORE_ID="${ENVIRONMENT}-products-datastore"
SEARCH_ENGINE_ID="${ENVIRONMENT}-product-search"

log_info "Creating Discovery Engine resources..."
log_info "Project: $PROJECT_ID"
log_info "Environment: $ENVIRONMENT"
log_info "Datastore ID: $DATASTORE_ID"
log_info "Search Engine ID: $SEARCH_ENGINE_ID"

# Set project
gcloud config set project "$PROJECT_ID"

# For now, skip Discovery Engine creation due to CLI limitations
log_warning "Discovery Engine creation requires gcloud alpha components"
log_warning "You can create these manually in the GCP Console:"
log_warning "1. Go to Discovery Engine in GCP Console"
log_warning "2. Create a datastore with ID: $DATASTORE_ID"
log_warning "3. Create a search engine with ID: $SEARCH_ENGINE_ID"
log_warning ""
log_warning "Or update gcloud and retry:"
log_warning "  gcloud components update"
log_warning "  gcloud components install alpha"
log_warning ""
log_info "Continuing without Discovery Engine for now..."

# Check if Discovery Engine alpha commands are available
if gcloud alpha discovery-engine --help &>/dev/null; then
    log_info "Discovery Engine alpha commands available, proceeding..."

    # Check if datastore already exists
    log_info "Checking if Discovery Engine datastore exists..."
    if gcloud alpha discovery-engine data-stores describe "$DATASTORE_ID" --location=global --quiet 2>/dev/null; then
        log_info "Datastore $DATASTORE_ID already exists, skipping creation"
    else
        log_info "Creating Discovery Engine datastore..."
        gcloud alpha discovery-engine data-stores create \
            --data-store-id="$DATASTORE_ID" \
            --display-name="$DATASTORE_ID" \
            --location=global \
            --content-config=NO_CONTENT \
            --solution-types=SOLUTION_TYPE_SEARCH \
            --industry-vertical=GENERIC \
            --quiet || {
            log_warning "Failed to create datastore via gcloud"
        }
    fi

    # Check if search engine already exists
    log_info "Checking if Discovery Engine search engine exists..."
    if gcloud alpha discovery-engine search-engines describe "$SEARCH_ENGINE_ID" --location=global --quiet 2>/dev/null; then
        log_info "Search engine $SEARCH_ENGINE_ID already exists, skipping creation"
    else
        log_info "Creating Discovery Engine search engine..."
        gcloud alpha discovery-engine search-engines create \
            --engine-id="$SEARCH_ENGINE_ID" \
            --display-name="$SEARCH_ENGINE_ID-app" \
            --location=global \
            --collection-id=default_collection \
            --data-store-ids="$DATASTORE_ID" \
            --search-tier=search-tier-standard \
            --search-add-ons=search-add-on-llm \
            --quiet || {
            log_warning "Failed to create search engine via gcloud"
        }
    fi
else
    log_warning "Discovery Engine alpha commands not available"
    log_warning "Create manually in GCP Console or update gcloud CLI"
fi

log_success "Discovery Engine resources created successfully!"
log_info "Datastore ID: $DATASTORE_ID"
log_info "Search Engine ID: $SEARCH_ENGINE_ID"

# Verify creation
log_info "Verifying resources..."
gcloud discovery-engine data-stores describe "$DATASTORE_ID" --location=global --quiet || log_error "Failed to verify datastore"
gcloud discovery-engine search-engines describe "$SEARCH_ENGINE_ID" --location=global --quiet || log_error "Failed to verify search engine"

log_success "✅ Discovery Engine setup complete!"