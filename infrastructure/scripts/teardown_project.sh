#!/bin/bash

# Teardown script for Contoso Outdoor GCP infrastructure
# Safe to retry: Terraform state is retained whenever cleanup is incomplete or uncertain.
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
BUCKET_NAME="${PROJECT_ID}-tf-state"
TF_DIR="${REPO_ROOT}/infrastructure/terraform"

# Track results for final summary
SUCCEEDED=()
FAILED=()
WARNED=()
SKIPPED=()

log_success() { SUCCEEDED+=("$1"); echo "  ✓ $1"; }
log_fail()    { FAILED+=("$1: $2"); echo "  ✗ $1 — $2"; }
log_warn()    { WARNED+=("$1: $2"); echo "  ! $1 — $2"; }
log_skip()    { SKIPPED+=("$1"); echo "  - $1 (not found, skipping)"; }

# Return 0 for present, 1 for confirmed absent, and 2 for an unreadable list.
# A failed describe cannot distinguish absence from IAM/network/API errors.
resource_exists() {
  local expected="$1"
  local resources resource
  shift
  if ! resources=$("$@" --project="${PROJECT_ID}"); then
    log_fail "Lookup ${expected}" "could not verify resources; state will be preserved"
    return 2
  fi
  while IFS= read -r resource; do
    if [ "${resource##*/}" = "${expected}" ]; then
      return 0
    fi
  done <<< "${resources}"
  return 1
}

# The backend is project-wide. Do not erase another workspace/prefix or an
# active lock just because this teardown's current state is empty.
state_bucket_is_dedicated() {
  local object
  while IFS= read -r object; do
    case "${object}" in
      ""|"gs://${BUCKET_NAME}/:"|"gs://${BUCKET_NAME}/terraform/:"|"gs://${BUCKET_NAME}/terraform/state/:"|"gs://${BUCKET_NAME}/terraform/state/default.tfstate") ;;
      *) return 1 ;;
    esac
  done <<< "$1"
}

# --- Pre-flight Checks ---
# Fail before making changes if cleanup cannot be verified. In particular, a
# missing gsutil must never be interpreted as an absent Terraform state bucket.
for tool in gcloud gsutil terraform curl; do
  if ! command -v "${tool}" >/dev/null 2>&1; then
    echo "Error: Required command '${tool}' is not installed. No resources changed."
    exit 1
  fi
done

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
  read -r -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation

  if [ "$confirmation" != "yes" ]; then
    echo "Teardown cancelled."
    exit 0
  fi
fi

# --- Verify the backend BEFORE changing deletion protection or resources ---
# ENVIRONMENT names resources within the default workspace; it must not select
# an unrelated workspace through TF_WORKSPACE or .terraform/environment.
if [ ! -d "${TF_DIR}" ]; then
  echo "Error: Terraform directory not found. No resources changed; state preserved."
  exit 1
fi
if [ -n "${TF_WORKSPACE:-}" ] && [ "${TF_WORKSPACE}" != default ]; then
  echo "Error: TF_WORKSPACE must be default. No resources changed; state preserved."
  exit 1
fi
if ! SELECTED_WORKSPACE=$(terraform -chdir="${TF_DIR}" workspace show); then
  echo "Error: Cannot verify the selected Terraform workspace. No resources changed; state preserved."
  exit 1
elif [ "${SELECTED_WORKSPACE}" != default ]; then
  echo "Error: Selected Terraform workspace is not default. No resources changed; state preserved."
  exit 1
fi
# Pin the verified selection for every later Terraform command, even if another
# local process changes .terraform/environment while this script is running.
export TF_WORKSPACE=default

if ! gsutil ls -b "gs://${BUCKET_NAME}" >/dev/null; then
  echo "Error: State bucket gs://${BUCKET_NAME} is missing or inaccessible. No resources changed."
  exit 1
fi
if ! terraform -chdir="${TF_DIR}" init -input=false -reconfigure -backend-config="bucket=${BUCKET_NAME}"; then
  echo "Error: Could not initialize Terraform. No resources changed; state preserved."
  exit 1
fi
if ! WORKSPACES=$(terraform -chdir="${TF_DIR}" workspace list -no-color); then
  echo "Error: Cannot verify Terraform workspaces. No resources changed; state preserved."
  exit 1
elif [ "$(printf '%s' "${WORKSPACES}" | tr -d '[:space:]')" != "*default" ]; then
  echo "Error: Other or unexpected Terraform workspaces need review. No resources changed; state preserved."
  exit 1
fi
if ! STATE_OBJECTS=$(gsutil ls -r "gs://${BUCKET_NAME}"); then
  echo "Error: Cannot verify state bucket contents. No resources changed; state preserved."
  exit 1
elif ! state_bucket_is_dedicated "${STATE_OBJECTS}"; then
  echo "Error: Other state objects or locks need review. No resources changed; state preserved."
  exit 1
fi

# --- Set Project ---
echo ""
echo "Setting project to ${PROJECT_ID}..."
if ! gcloud config set project "${PROJECT_ID}"; then
  echo "Error: Could not select project '${PROJECT_ID}'. Stopping before cleanup."
  exit 1
fi

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
if resource_exists "${DB_INSTANCE}" gcloud sql instances list --format="value(name)"; then
  echo "Disabling deletion protection on Cloud SQL: ${DB_INSTANCE}..."
  if gcloud sql instances patch "${DB_INSTANCE}" --no-deletion-protection --quiet 2>/dev/null; then
    log_success "Cloud SQL deletion protection disabled"
  else
    log_warn "Cloud SQL deletion protection" "patch command failed (may already be disabled)"
  fi
elif [ "$?" -eq 1 ]; then
  log_skip "Cloud SQL deletion protection (instance not found)"
fi

# Cloud Run services
for service in "contoso-web" "contoso-chat"; do
  if resource_exists "${service}" gcloud run services list --region "${REGION}" --format="value(metadata.name)"; then
    echo "Disabling deletion protection on Cloud Run: ${service}..."
    if gcloud run services update "${service}" --region "${REGION}" --no-deletion-protection --quiet 2>/dev/null; then
      log_success "Cloud Run ${service} deletion protection disabled"
    else
      log_fail "Cloud Run ${service} deletion protection" "update command failed"
    fi
  elif [ "$?" -eq 1 ]; then
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

TF_SUCCEEDED=false
if ! cd "${TF_DIR}"; then
  echo "Error: Cannot enter Terraform directory. State preserved."
  exit 1
fi

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
  echo "Terraform destroy encountered errors. Retrying with all resources still tracked..."
  # Never remove resources from state to make destroy pass. A failed delete
  # must remain tracked so a later retry can recover it safely.

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

cd "${REPO_ROOT}" || exit 1

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
  if resource_exists "${service}" gcloud run services list --region "${REGION}" --format="value(metadata.name)"; then
    echo "Deleting Cloud Run service: ${service}..."
    if gcloud run services delete "${service}" --region "${REGION}" --quiet; then
      log_success "Cloud Run ${service} deleted"
    else
      log_fail "Cloud Run ${service}" "delete command failed"
    fi
  elif [ "$?" -eq 1 ]; then
    log_skip "Cloud Run ${service}"
  fi
done

# --- Cloud SQL ---
if resource_exists "${DB_INSTANCE}" gcloud sql instances list --format="value(name)"; then
  echo "Removing Cloud SQL instance: ${DB_INSTANCE} (this can take several minutes)..."
  # Ensure deletion protection is off (may have been re-enabled by Terraform)
  gcloud sql instances patch "${DB_INSTANCE}" --no-deletion-protection --quiet 2>/dev/null
  if gcloud sql instances delete "${DB_INSTANCE}" --quiet; then
    log_success "Cloud SQL ${DB_INSTANCE} deleted"
  else
    log_fail "Cloud SQL ${DB_INSTANCE}" "delete failed — may need to wait and retry"
  fi
elif [ "$?" -eq 1 ]; then
  log_skip "Cloud SQL ${DB_INSTANCE}"
fi

# --- Secret Manager ---
for secret_id in "${ENVIRONMENT}-app-config" "${ENVIRONMENT}-database-url"; do
  if resource_exists "${secret_id}" gcloud secrets list --format="value(name)"; then
    echo "Removing Secret Manager secret: ${secret_id}..."
    if gcloud secrets delete "${secret_id}" --quiet; then
      log_success "Secret ${secret_id} deleted"
    else
      log_fail "Secret ${secret_id}" "delete failed"
    fi
  elif [ "$?" -eq 1 ]; then
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
  log_warn "Discovery Engine DataStore" "deletion requested but not verified complete; state will be preserved"
elif [ "${DATASTORE_CHECK}" = "404" ]; then
  log_skip "Discovery Engine DataStore"
else
  log_fail "Discovery Engine DataStore" "could not verify absence (HTTP ${DATASTORE_CHECK}); state will be preserved"
fi

# --- Artifact Registry ---
REPO_ID="${ENVIRONMENT}-containers"
if resource_exists "${REPO_ID}" gcloud artifacts repositories list --location "${REGION}" --format="value(name)"; then
  echo "Removing Artifact Registry repository: ${REPO_ID}..."
  if gcloud artifacts repositories delete "${REPO_ID}" --location "${REGION}" --quiet; then
    log_success "Artifact Registry ${REPO_ID} deleted"
  else
    log_fail "Artifact Registry ${REPO_ID}" "delete failed"
  fi
elif [ "$?" -eq 1 ]; then
  log_skip "Artifact Registry ${REPO_ID}"
fi

# --- VPC Connector ---
VPC_CONN="${ENVIRONMENT}-vpc-conn"
if resource_exists "${VPC_CONN}" gcloud compute networks vpc-access connectors list --region "${REGION}" --format="value(name)"; then
  echo "Removing VPC Connector: ${VPC_CONN}..."
  if gcloud compute networks vpc-access connectors delete "${VPC_CONN}" --region "${REGION}" --quiet; then
    log_success "VPC Connector ${VPC_CONN} deleted"
  else
    log_fail "VPC Connector ${VPC_CONN}" "delete failed (may be in use — wait a few minutes and retry)"
  fi
elif [ "$?" -eq 1 ]; then
  log_skip "VPC Connector ${VPC_CONN}"
fi

# --- VPC Peering (Service Networking Connection) ---
echo "Checking VPC peering connections..."
if resource_exists "servicenetworking.googleapis.com" gcloud services vpc-peerings list --network=default --format="value(service)"; then
  echo "Removing VPC peering to servicenetworking.googleapis.com..."
  if gcloud services vpc-peerings delete --network=default --service=servicenetworking.googleapis.com --quiet 2>/dev/null; then
    log_success "VPC peering deleted"
  else
    # A failed peering delete must prevent removal of recovery state.
    log_warn "VPC peering" "delete failed (Cloud SQL may still be shutting down); state will be preserved"
  fi
elif [ "$?" -eq 1 ]; then
  log_skip "VPC peering"
fi

# --- Global IP Address ---
IP_NAME="${ENVIRONMENT}-private-ip"
if resource_exists "${IP_NAME}" gcloud compute addresses list --global --format="value(name)"; then
  echo "Removing global IP address: ${IP_NAME}..."
  if gcloud compute addresses delete "${IP_NAME}" --global --quiet; then
    log_success "Global IP ${IP_NAME} deleted"
  else
    log_fail "Global IP ${IP_NAME}" "delete failed (VPC peering may still hold it)"
  fi
elif [ "$?" -eq 1 ]; then
  log_skip "Global IP ${IP_NAME}"
fi

# --- Service Accounts ---
SA_APP="${ENVIRONMENT}-app-sa@${PROJECT_ID}.iam.gserviceaccount.com"
if resource_exists "${SA_APP}" gcloud iam service-accounts list --format="value(email)"; then
  echo "Removing application service account: ${SA_APP}..."
  if gcloud iam service-accounts delete "${SA_APP}" --quiet; then
    log_success "Service account ${ENVIRONMENT}-app-sa deleted"
  else
    log_fail "Service account ${ENVIRONMENT}-app-sa" "delete failed"
  fi
elif [ "$?" -eq 1 ]; then
  log_skip "Service account ${ENVIRONMENT}-app-sa"
fi

# --- Storage buckets (app storage, not TF state) ---
echo "Checking for app storage buckets..."
if APP_BUCKETS=$(gsutil ls 2>/dev/null); then
  while IFS= read -r bucket; do
    # Match complete bucket names, never a substring of the state bucket.
    bucket_name=${bucket#gs://}
    bucket_name=${bucket_name%/}
    [ "${bucket_name}" != "${BUCKET_NAME}" ] || continue
    case "${bucket_name}" in
      "${ENVIRONMENT}-"*-storage)
        echo "Removing storage bucket: ${bucket}..."
        if gsutil -m rm -r "${bucket}" 2>/dev/null; then
          log_success "Storage bucket ${bucket} deleted"
        else
          log_fail "Storage bucket ${bucket}" "delete failed"
        fi
        ;;
    esac
  done <<< "${APP_BUCKETS}"
else
  log_fail "Storage buckets" "could not list buckets; state will be preserved"
fi

# ============================================================
# Phase 4: Delete Terraform state bucket (LAST)
# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Phase 4/4: Cleaning up Terraform state..."
echo "═══════════════════════════════════════════════════════════"

TF_STATE_DELETED=false
if [ "${TF_SUCCEEDED}" != true ] || [ ${#FAILED[@]} -gt 0 ] || [ ${#WARNED[@]} -gt 0 ]; then
  log_fail "Terraform state bucket" "preserved at gs://${BUCKET_NAME}: cleanup is incomplete or unverified"
elif ! REMAINING_STATE=$(terraform -chdir="${TF_DIR}" state list); then
  log_fail "Terraform state bucket" "preserved at gs://${BUCKET_NAME}: could not verify remaining state"
elif [ -n "${REMAINING_STATE}" ]; then
  log_fail "Terraform state bucket" "preserved at gs://${BUCKET_NAME}: Terraform still tracks resources"
elif ! WORKSPACES=$(terraform -chdir="${TF_DIR}" workspace list -no-color); then
  log_fail "Terraform state bucket" "preserved at gs://${BUCKET_NAME}: could not verify workspaces"
elif [ "$(printf '%s' "${WORKSPACES}" | tr -d '[:space:]')" != "*default" ]; then
  log_fail "Terraform state bucket" "preserved at gs://${BUCKET_NAME}: other Terraform workspaces need review"
elif ! STATE_OBJECTS=$(gsutil ls -r "gs://${BUCKET_NAME}"); then
  log_fail "Terraform state bucket" "preserved at gs://${BUCKET_NAME}: could not verify bucket contents"
elif ! state_bucket_is_dedicated "${STATE_OBJECTS}"; then
  log_fail "Terraform state bucket" "preserved at gs://${BUCKET_NAME}: unexpected objects or state locks need review"
else
  echo "Deleting Terraform state bucket: gs://${BUCKET_NAME}..."
  if gsutil -m rm -r "gs://${BUCKET_NAME}"; then
    TF_STATE_DELETED=true
    log_success "Terraform state bucket deleted"
  else
    log_fail "Terraform state bucket" "delete failed"
  fi
fi

# Keep the deployer available for recovery until state cleanup has succeeded.
if [ "${TF_STATE_DELETED}" = true ]; then
  SA_TF="terraform-deployer@${PROJECT_ID}.iam.gserviceaccount.com"
  if resource_exists "${SA_TF}" gcloud iam service-accounts list --format="value(email)"; then
    echo "Removing Terraform deployer service account..."
    if gcloud iam service-accounts delete "${SA_TF}" --quiet; then
      log_success "Service account terraform-deployer deleted"
    else
      log_fail "Service account terraform-deployer" "delete failed"
    fi
  elif [ "$?" -eq 1 ]; then
    log_skip "Service account terraform-deployer"
  fi
else
  log_warn "Service account terraform-deployer" "preserved for recovery with Terraform state"
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

if [ ${#WARNED[@]} -gt 0 ]; then
  echo ""
  echo "Warnings (${#WARNED[@]}):"
  for item in "${WARNED[@]}"; do
    echo "  ! ${item}"
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
  echo "Review the failures above and resolve access errors or pending deletions before retrying."
  echo "Retry: ./infrastructure/scripts/teardown_project.sh --force"
fi

echo ""
echo "Note: The GCP project '${PROJECT_ID}' itself still exists."
echo "  - Discovery Engine DataStore deletion may still be in progress (up to 2 hours)"
echo "  - To delete the project entirely: gcloud projects delete ${PROJECT_ID}"

if [ ${#FAILED[@]} -gt 0 ]; then
  exit 1
fi
