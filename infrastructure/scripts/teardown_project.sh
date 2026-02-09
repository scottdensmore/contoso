#!/bin/bash

# Teardown script for Contoso Outdoor GCP infrastructure
# Safe to run multiple times — idempotent and handles missing resources gracefully.
#
# Usage:
#   ./infrastructure/scripts/teardown_project.sh              # interactive confirmation
#   ./infrastructure/scripts/teardown_project.sh --force       # skip confirmation (CI/CD)
#
# Environment variables:
#   PROJECT_ID    - GCP project ID (default: contoso-outdoor)
#   ENVIRONMENT   - Environment name (default: dev)
#   REGION        - GCP region (default: us-central1)

# Don't exit on errors — we want to continue even if some resources are already gone
set +e

# --- Configuration ---
PROJECT_ID=${PROJECT_ID:-"contoso-outdoor"}
ENVIRONMENT=${ENVIRONMENT:-"dev"}
REGION=${REGION:-"us-central1"}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Track results for final summary
SUCCEEDED=()
FAILED=()
SKIPPED=()

log_success() { SUCCEEDED+=("$1"); echo "  ✓ $1"; }
log_fail()    { FAILED+=("$1: $2"); echo "  ✗ $1 — $2"; }
log_skip()    { SKIPPED+=("$1"); echo "  - $1 (not found, skipping)"; }

# --- Pre-flight Checks ---
echo "Checking project: ${PROJECT_ID}..."
if ! gcloud projects describe "${PROJECT_ID}" &>/dev/null; then
  echo "Error: Project '${PROJECT_ID}' not found or you don't have access."
  echo "Make sure you're authenticated: gcloud auth login"
  exit 1
fi

# --- Confirmation ---
if [ "$1" != "--force" ]; then
  echo ""
  echo "WARNING: This will destroy ALL resources in project '${PROJECT_ID}' for environment '${ENVIRONMENT}'"
  echo ""
  echo "  Resources that will be deleted:"
  echo "    - Cloud Run services (contoso-web, contoso-chat)"
  echo "    - Cloud SQL database (ALL DATA WILL BE LOST)"
  echo "    - VPC Connector and networking (VPC peering, private IP)"
  echo "    - Artifact Registry repository (all container images)"
  echo "    - Secret Manager secrets"
  echo "    - Discovery Engine DataStore (deletion takes up to 2 hours)"
  echo "    - Storage buckets"
  echo "    - Service accounts"
  echo "    - Terraform state bucket"
  echo ""
  read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation

  if [ "$confirmation" != "yes" ]; then
    echo "Teardown cancelled."
    exit 0
  fi
fi

# --- Set Project ---
echo ""
echo "Setting project to ${PROJECT_ID}..."
gcloud config set project "${PROJECT_ID}"

# ============================================================
# Phase 1: Disable deletion protection
# ============================================================
# This MUST happen before Terraform destroy. Terraform cannot
# disable protection and destroy a resource in the same operation.
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Phase 1/4: Disabling deletion protection..."
echo "═══════════════════════════════════════════════════════════"

# Cloud SQL
DB_INSTANCE="${ENVIRONMENT}-db-instance"
if gcloud sql instances describe "${DB_INSTANCE}" &>/dev/null; then
  echo "Disabling deletion protection on Cloud SQL: ${DB_INSTANCE}..."
  if gcloud sql instances patch "${DB_INSTANCE}" --no-deletion-protection --quiet 2>/dev/null; then
    log_success "Cloud SQL deletion protection disabled"
  else
    log_fail "Cloud SQL deletion protection" "patch command failed (may already be disabled)"
  fi
else
  log_skip "Cloud SQL deletion protection (instance not found)"
fi

# Cloud Run services
for service in "contoso-web" "contoso-chat"; do
  if gcloud run services describe "${service}" --region "${REGION}" &>/dev/null; then
    echo "Disabling deletion protection on Cloud Run: ${service}..."
    if gcloud run services update "${service}" --region "${REGION}" --no-deletion-protection --quiet 2>/dev/null; then
      log_success "Cloud Run ${service} deletion protection disabled"
    else
      log_fail "Cloud Run ${service} deletion protection" "update command failed"
    fi
  else
    log_skip "Cloud Run ${service} deletion protection"
  fi
done

# ============================================================
# Phase 2: Terraform Destroy
# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Phase 2/4: Terraform destroy..."
echo "═══════════════════════════════════════════════════════════"

BUCKET_NAME="${PROJECT_ID}-tf-state"
TF_DIR="${REPO_ROOT}/infrastructure/terraform"
TF_SUCCEEDED=false

if [ -d "${TF_DIR}" ] && gsutil ls "gs://${BUCKET_NAME}" &>/dev/null; then
  cd "${TF_DIR}"

  if terraform init -reconfigure -backend-config="bucket=${BUCKET_NAME}" 2>/dev/null; then
    echo "Attempting to destroy infrastructure via Terraform..."
    if terraform destroy -auto-approve \
      -var="project_id=${PROJECT_ID}" \
      -var="environment_name=${ENVIRONMENT}" \
      -var="region=${REGION}" \
      -var="enable_deletion_protection=false" \
      -var="force_destroy=true" \
      -var="create_datastore=true"; then
      TF_SUCCEEDED=true
      log_success "Terraform destroy"
    else
      echo ""
      echo "Terraform destroy encountered errors. Removing problematic resources from state and retrying..."
      # VPC peering and connector are the most common hang-ups
      terraform state rm google_service_networking_connection.private_vpc_connection 2>/dev/null
      terraform state rm google_vpc_access_connector.connector 2>/dev/null
      terraform state rm google_compute_global_address.private_ip_address 2>/dev/null

      if terraform destroy -auto-approve \
        -var="project_id=${PROJECT_ID}" \
        -var="environment_name=${ENVIRONMENT}" \
        -var="region=${REGION}" \
        -var="enable_deletion_protection=false" \
        -var="force_destroy=true" \
        -var="create_datastore=true"; then
        TF_SUCCEEDED=true
        log_success "Terraform destroy (retry)"
      else
        log_fail "Terraform destroy" "failed after retry — Phase 3 will clean up remaining resources"
      fi
    fi
  else
    log_fail "Terraform init" "could not initialize — skipping to manual cleanup"
  fi

  cd "${REPO_ROOT}"
else
  if [ ! -d "${TF_DIR}" ]; then
    log_skip "Terraform (directory not found)"
  else
    log_skip "Terraform (state bucket gs://${BUCKET_NAME} not found)"
  fi
fi

# ============================================================
# Phase 3: Manual Cleanup (Final Sweep)
# ============================================================
# Ensures all resources are gone even if Terraform failed or had partial state.
# Every check is idempotent — safe to run even if Terraform already cleaned up.
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Phase 3/4: Manual cleanup sweep..."
echo "═══════════════════════════════════════════════════════════"

# --- Cloud Run services ---
for service in "contoso-web" "contoso-chat"; do
  if gcloud run services describe "${service}" --region "${REGION}" &>/dev/null; then
    echo "Deleting Cloud Run service: ${service}..."
    if gcloud run services delete "${service}" --region "${REGION}" --quiet; then
      log_success "Cloud Run ${service} deleted"
    else
      log_fail "Cloud Run ${service}" "delete command failed"
    fi
  else
    log_skip "Cloud Run ${service}"
  fi
done

# --- Cloud SQL ---
if gcloud sql instances describe "${DB_INSTANCE}" &>/dev/null; then
  echo "Removing Cloud SQL instance: ${DB_INSTANCE} (this can take several minutes)..."
  # Ensure deletion protection is off (may have been re-enabled by Terraform)
  gcloud sql instances patch "${DB_INSTANCE}" --no-deletion-protection --quiet 2>/dev/null
  if gcloud sql instances delete "${DB_INSTANCE}" --quiet; then
    log_success "Cloud SQL ${DB_INSTANCE} deleted"
  else
    log_fail "Cloud SQL ${DB_INSTANCE}" "delete failed — may need to wait and retry"
  fi
else
  log_skip "Cloud SQL ${DB_INSTANCE}"
fi

# --- Secret Manager ---
for secret_id in "${ENVIRONMENT}-app-config" "${ENVIRONMENT}-database-url"; do
  if gcloud secrets describe "${secret_id}" &>/dev/null; then
    echo "Removing Secret Manager secret: ${secret_id}..."
    if gcloud secrets delete "${secret_id}" --quiet; then
      log_success "Secret ${secret_id} deleted"
    else
      log_fail "Secret ${secret_id}" "delete failed"
    fi
  else
    log_skip "Secret ${secret_id}"
  fi
done

# --- Discovery Engine DataStore ---
echo "Checking Discovery Engine DataStore..."
DATASTORE_ID="${ENVIRONMENT}-products-datastore"
DATASTORE_CHECK=$(curl -s -o /dev/null -w "%{http_code}" -X GET \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "x-goog-user-project: ${PROJECT_ID}" \
  "https://discoveryengine.googleapis.com/v1alpha/projects/${PROJECT_ID}/locations/global/collections/default_collection/dataStores/${DATASTORE_ID}" 2>/dev/null)

if [ "${DATASTORE_CHECK}" = "200" ]; then
  echo "Deleting Discovery Engine DataStore (runs in background, takes up to 2 hours)..."
  DELETE_RESPONSE=$(curl -s -X DELETE \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "x-goog-user-project: ${PROJECT_ID}" \
    "https://discoveryengine.googleapis.com/v1alpha/projects/${PROJECT_ID}/locations/global/collections/default_collection/dataStores/${DATASTORE_ID}")
  echo "  Response: ${DELETE_RESPONSE}"
  log_success "Discovery Engine DataStore deletion initiated"
elif [ "${DATASTORE_CHECK}" = "404" ]; then
  log_skip "Discovery Engine DataStore"
else
  echo "  DataStore returned HTTP ${DATASTORE_CHECK} (may already be deleting)"
  log_skip "Discovery Engine DataStore (status: ${DATASTORE_CHECK})"
fi

# --- Artifact Registry ---
REPO_ID="${ENVIRONMENT}-containers"
if gcloud artifacts repositories describe "${REPO_ID}" --location "${REGION}" &>/dev/null; then
  echo "Removing Artifact Registry repository: ${REPO_ID}..."
  if gcloud artifacts repositories delete "${REPO_ID}" --location "${REGION}" --quiet; then
    log_success "Artifact Registry ${REPO_ID} deleted"
  else
    log_fail "Artifact Registry ${REPO_ID}" "delete failed"
  fi
else
  log_skip "Artifact Registry ${REPO_ID}"
fi

# --- VPC Connector ---
VPC_CONN="${ENVIRONMENT}-vpc-conn"
if gcloud compute networks vpc-access connectors describe "${VPC_CONN}" --region "${REGION}" &>/dev/null; then
  echo "Removing VPC Connector: ${VPC_CONN}..."
  if gcloud compute networks vpc-access connectors delete "${VPC_CONN}" --region "${REGION}" --quiet; then
    log_success "VPC Connector ${VPC_CONN} deleted"
  else
    log_fail "VPC Connector ${VPC_CONN}" "delete failed (may be in use — wait a few minutes and retry)"
  fi
else
  log_skip "VPC Connector ${VPC_CONN}"
fi

# --- VPC Peering (Service Networking Connection) ---
echo "Checking VPC peering connections..."
if gcloud services vpc-peerings list --network=default --project="${PROJECT_ID}" 2>/dev/null | grep -q "servicenetworking.googleapis.com"; then
  echo "Removing VPC peering to servicenetworking.googleapis.com..."
  if gcloud services vpc-peerings delete --network=default --service=servicenetworking.googleapis.com --quiet 2>/dev/null; then
    log_success "VPC peering deleted"
  else
    # Peering delete can fail if Cloud SQL is still being deleted. This is non-critical.
    log_fail "VPC peering" "delete failed (Cloud SQL may still be shutting down — safe to ignore)"
  fi
else
  log_skip "VPC peering"
fi

# --- Global IP Address ---
IP_NAME="${ENVIRONMENT}-private-ip"
if gcloud compute addresses describe "${IP_NAME}" --global &>/dev/null; then
  echo "Removing global IP address: ${IP_NAME}..."
  if gcloud compute addresses delete "${IP_NAME}" --global --quiet; then
    log_success "Global IP ${IP_NAME} deleted"
  else
    log_fail "Global IP ${IP_NAME}" "delete failed (VPC peering may still hold it)"
  fi
else
  log_skip "Global IP ${IP_NAME}"
fi

# --- Service Accounts ---
SA_APP="${ENVIRONMENT}-app-sa@${PROJECT_ID}.iam.gserviceaccount.com"
if gcloud iam service-accounts describe "${SA_APP}" &>/dev/null; then
  echo "Removing application service account: ${SA_APP}..."
  if gcloud iam service-accounts delete "${SA_APP}" --quiet; then
    log_success "Service account ${ENVIRONMENT}-app-sa deleted"
  else
    log_fail "Service account ${ENVIRONMENT}-app-sa" "delete failed"
  fi
else
  log_skip "Service account ${ENVIRONMENT}-app-sa"
fi

SA_TF="terraform-deployer@${PROJECT_ID}.iam.gserviceaccount.com"
if gcloud iam service-accounts describe "${SA_TF}" &>/dev/null; then
  echo "Removing Terraform deployer service account..."
  if gcloud iam service-accounts delete "${SA_TF}" --quiet; then
    log_success "Service account terraform-deployer deleted"
  else
    log_fail "Service account terraform-deployer" "delete failed"
  fi
else
  log_skip "Service account terraform-deployer"
fi

# --- Storage buckets (app storage, not TF state) ---
echo "Checking for app storage buckets..."
for bucket in $(gsutil ls 2>/dev/null | grep "gs://${ENVIRONMENT}-.*-storage"); do
  echo "Removing storage bucket: ${bucket}..."
  if gsutil -m rm -r "${bucket}" 2>/dev/null; then
    log_success "Storage bucket ${bucket} deleted"
  else
    log_fail "Storage bucket ${bucket}" "delete failed"
  fi
done

# ============================================================
# Phase 4: Delete Terraform state bucket (LAST)
# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Phase 4/4: Cleaning up Terraform state..."
echo "═══════════════════════════════════════════════════════════"

if gsutil ls "gs://${BUCKET_NAME}" &>/dev/null; then
  echo "Deleting Terraform state bucket: gs://${BUCKET_NAME}..."
  if gsutil -m rm -r "gs://${BUCKET_NAME}"; then
    log_success "Terraform state bucket deleted"
  else
    log_fail "Terraform state bucket" "delete failed"
  fi
else
  log_skip "Terraform state bucket gs://${BUCKET_NAME}"
fi

# ============================================================
# Summary
# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Teardown Summary"
echo "═══════════════════════════════════════════════════════════"

if [ ${#SUCCEEDED[@]} -gt 0 ]; then
  echo ""
  echo "Succeeded (${#SUCCEEDED[@]}):"
  for item in "${SUCCEEDED[@]}"; do
    echo "  ✓ ${item}"
  done
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo ""
  echo "Skipped — already gone (${#SKIPPED[@]}):"
  for item in "${SKIPPED[@]}"; do
    echo "  - ${item}"
  done
fi

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  echo "Failed (${#FAILED[@]}):"
  for item in "${FAILED[@]}"; do
    echo "  ✗ ${item}"
  done
  echo ""
  echo "Some resources failed to delete. Common causes:"
  echo "  - Cloud SQL deletion takes several minutes — wait and re-run this script"
  echo "  - VPC peering can't delete while Cloud SQL is shutting down"
  echo "  - Discovery Engine DataStore deletion takes up to 2 hours"
  echo ""
  echo "Fix: Wait 5-10 minutes, then re-run: ./infrastructure/scripts/teardown_project.sh --force"
fi

echo ""
echo "Note: The GCP project '${PROJECT_ID}' itself still exists."
echo "  - Discovery Engine DataStore deletion may still be in progress (up to 2 hours)"
echo "  - To delete the project entirely: gcloud projects delete ${PROJECT_ID}"

if [ ${#FAILED[@]} -gt 0 ]; then
  exit 1
fi
