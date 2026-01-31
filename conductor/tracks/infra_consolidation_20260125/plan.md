# Implementation Plan - Infrastructure and Setup Consolidation

## Phase 1: Foundation and Directory Structure [checkpoint: 18b0399]
- [x] Task: Create unified infrastructure directory structure [06ccaa9]
    - [x] Create `infrastructure/terraform`, `infrastructure/scripts`, and `infrastructure/workflows` directories.
- [x] Task: Conductor - User Manual Verification 'Foundation and Directory Structure' (Protocol in workflow.md)

## Phase 2: Terraform Unification
- [x] Task: Analyze and merge root and chat service Terraform configurations [94b6810]
    - [x] Compare `terraform/main.tf` and `services/chat/infra/gcp/main.tf`.
    - [x] Create a unified `infrastructure/terraform/main.tf` and supporting files (`variables.tf`, `outputs.tf`).
    - [x] Ensure all GCP resources for both services are defined.
- [~] Task: Verify unified Terraform configuration
    - [ ] Run `terraform validate` in `infrastructure/terraform`.
- [ ] Task: Conductor - User Manual Verification 'Terraform Unification' (Protocol in workflow.md)

## Phase 3: Script Consolidation
- [ ] Task: Move and refactor root scripts to `infrastructure/scripts`
    - [ ] Move `scripts/*.sh` and `scripts/*.ts`.
    - [ ] Update internal paths in scripts.
- [ ] Task: Move and refactor chat service scripts to `infrastructure/scripts`
    - [ ] Move `services/chat/scripts/*`.
    - [ ] Update internal paths.
- [ ] Task: Create unified `setup_project.sh`
    - [ ] Merge logic from both setup scripts into a single, idempotent project-wide setup script.
- [ ] Task: Conductor - User Manual Verification 'Script Consolidation' (Protocol in workflow.md)

## Phase 4: CI/CD and Workflow Unification
- [ ] Task: Move and unify GitHub Actions workflows
    - [ ] Move `.github/workflows/google-cloud.yml` to `infrastructure/workflows/` (as a template/reference) or update the root workflow to coordinate both services.
    - [ ] Standardize environment variables and secret management.
- [ ] Task: Conductor - User Manual Verification 'CI/CD and Workflow Unification' (Protocol in workflow.md)

## Phase 5: Deployment Testing Implementation
- [ ] Task: Implement infrastructure validation tests
    - [ ] Write scripts/tests to verify GCP resource existence and state.
- [ ] Task: Implement app-chat service integration tests
    - [ ] Write automated tests to verify communication between services.
- [ ] Task: Implement end-to-end smoke tests
    - [ ] Create a deployment smoke test suite.
- [ ] Task: Conductor - User Manual Verification 'Deployment Testing Implementation' (Protocol in workflow.md)

## Phase 6: Final Cleanup
- [ ] Task: Remove redundant directories and files
    - [ ] Delete root `terraform/` and `scripts/`.
    - [ ] Delete `services/chat/infra/` and `services/chat/scripts/`.
- [ ] Task: Final project-wide build and verification
    - [ ] Run `npm run build` and ensure everything functions correctly.
- [ ] Task: Conductor - User Manual Verification 'Final Cleanup' (Protocol in workflow.md)
