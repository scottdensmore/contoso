# Implementation Plan - Infrastructure and Setup Consolidation

## Phase 1: Foundation and Directory Structure [checkpoint: 18b0399]
- [x] Task: Create unified infrastructure directory structure [06ccaa9]
    - [x] Create `infrastructure/terraform`, `infrastructure/scripts`, and `infrastructure/workflows` directories.
- [x] Task: Conductor - User Manual Verification 'Foundation and Directory Structure' (Protocol in workflow.md)

## Phase 2: Terraform Unification [checkpoint: 7f2dbd1]
- [x] Task: Analyze and merge root and chat service Terraform configurations [94b6810]
    - [x] Compare `terraform/main.tf` and `services/chat/infra/gcp/main.tf`.
    - [x] Create a unified `infrastructure/terraform/main.tf` and supporting files (`variables.tf`, `outputs.tf`).
    - [x] Ensure all GCP resources for both services are defined.
- [x] Task: Verify unified Terraform configuration [7f2dbd1]
    - [x] Run `terraform validate` in `infrastructure/terraform`.
- [x] Task: Conductor - User Manual Verification 'Terraform Unification' (Protocol in workflow.md)

## Phase 3: Script Consolidation
- [x] Task: Move and refactor root scripts to `infrastructure/scripts` [22a28e2]
    - [x] Move `scripts/*.sh` and `scripts/*.ts`.
    - [x] Update internal paths in scripts.
- [x] Task: Move and refactor chat service scripts to `infrastructure/scripts` [22a28e2]
    - [x] Move `services/chat/scripts/*`.
    - [x] Update internal paths.
- [x] Task: Create unified `setup_project.sh` [22a28e2]
    - [x] Merge logic from both setup scripts into a single, idempotent project-wide setup script.
- [~] Task: Conductor - User Manual Verification 'Script Consolidation' (Protocol in workflow.md)

## Phase 4: CI/CD and Workflow Unification
- [x] Task: Move and unify GitHub Actions workflows [acfc41f]
    - [x] Move `.github/workflows/google-cloud.yml` to `infrastructure/workflows/` (as a template/reference) or update the root workflow to coordinate both services.
    - [x] Standardize environment variables and secret management.
- [~] Task: Conductor - User Manual Verification 'CI/CD and Workflow Unification' (Protocol in workflow.md)

## Phase 5: Deployment Testing Implementation
- [x] Task: Implement infrastructure validation tests [827a492]
    - [x] Write scripts/tests to verify GCP resource existence and state.
- [x] Task: Implement app-chat service integration tests [827a492]
    - [x] Write automated tests to verify communication between services.
- [x] Task: Implement end-to-end smoke tests [827a492]
    - [x] Create a deployment smoke test suite.
- [~] Task: Conductor - User Manual Verification 'Deployment Testing Implementation' (Protocol in workflow.md)

## Phase 6: Final Cleanup
- [x] Task: Remove redundant directories and files [eaf4a61]
    - [x] Delete root `terraform/` and `scripts/`.
    - [x] Delete `services/chat/infra/` and `services/chat/scripts/`.
- [x] Task: Final project-wide build and verification [eaf4a61]
    - [x] Run `npm run build` and ensure everything functions correctly.
- [x] Task: Conductor - User Manual Verification 'Final Cleanup' (Protocol in workflow.md)
