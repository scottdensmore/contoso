# Specification - Infrastructure and Setup Consolidation

## Overview
Consolidate and unify the infrastructure management, deployment scripts, and CI/CD workflows for both the main application and the chat service. This will create a single source of truth for operations and simplify both local development and cloud deployments.

## Functional Requirements
- **Unified Infrastructure Directory:** Create a top-level `infrastructure/` directory to house all Terraform configurations, deployment scripts, and CI/CD workflows.
- **Monolithic Terraform Configuration:** Merge existing Terraform files from the root and `services/chat/infra` into a single, unified configuration within `infrastructure/terraform`. This will manage all GCP resources under one state.
- **Consolidated Deployment Scripts:** Move and refactor deployment and setup scripts (e.g., `services/chat/scripts/`, root `scripts/`) into `infrastructure/scripts/`.
- **Standardized CI/CD:** Unify GitHub Actions workflows in `.github/workflows/` to handle the deployment of both services in a coordinated manner.
- **Simplified Local Setup:** Create a unified `setup_project.sh` (or similar) in `infrastructure/scripts/` that handles the entire project's local environment preparation.
- **Deployment Testing:** Implement a suite of tests including:
    - Infrastructure validation (checking GCP resource state).
    - Integration tests between the app and chat service.
    - End-to-end deployment smoke tests.

## Non-Functional Requirements
- **Maintainability:** The unified structure should be easy to navigate and understand for any developer.
- **Consistency:** Use consistent naming conventions and patterns across all scripts and Terraform modules.
- **Idempotency:** All scripts and Terraform configurations must be idempotent.

## Acceptance Criteria
- [ ] A new `infrastructure/` directory exists with `terraform/`, `scripts/`, and `workflows/` subdirectories.
- [ ] Terraform can provision all necessary GCP resources for both services in a single run.
- [ ] A single set of scripts can deploy both the application and the chat service.
- [ ] CI/CD workflows successfully deploy both services to GCP.
- [ ] All deployment tests (infrastructure, integration, and smoke tests) pass.
- [ ] Redundant deployment and infra files are removed from the original locations.

## Out of Scope
- Major architectural changes to the services themselves (e.g., refactoring the application logic).
- Migrating to a different cloud provider.
