# Specification - Infrastructure Validation and Deployment Testing

## Overview
Validate the newly consolidated infrastructure setup and test the unified deployment process to ensure reliability and readiness for Google Cloud Platform. This includes verifying local scripts, Terraform configurations, and the GitHub Actions CI/CD pipeline.

## Functional Requirements
- **Infrastructure Validation:**
    - Perform a local `terraform plan` and `apply` to ensure the monolithic configuration is valid and correctly provisions all resources (Cloud SQL, Firestore, VPC, etc.).
    - Verify manual deployment using the unified `infrastructure/scripts/setup_project.sh`.
    - Audit provisioned resources in GCP to ensure they match the defined configuration.
- **Deployment Testing:**
    - Verify that a commit to the `main` branch correctly triggers the `google-cloud.yml` workflow.
    - Confirm that both the web application and the chat service are deployed successfully by the CI/CD pipeline.
    - Perform post-deployment health checks and smoke tests on both services.
    - Test and document manual rollback procedures.
- **Environment Cleanup:**
    - Identify and permanently remove any remaining deprecated or redundant scripts and configuration files from the project root and service directories.

## Non-Functional Requirements
- **Reliability:** The deployment process should be robust and handle common failure scenarios.
- **Security:** Ensure that all secrets and credentials used in the deployment process are managed securely (e.g., GitHub Secrets).

## Acceptance Criteria
- [ ] Terraform successfully provisions the entire infrastructure stack in a clean environment.
- [ ] `setup_project.sh` correctly sets up the local environment and performs a full deployment.
- [ ] GitHub Actions workflow `google-cloud.yml` successfully deploys both services upon a push to `main`.
- [ ] Both services (web and chat) are accessible and pass health checks after deployment.
- [ ] Rollback procedure is verified and documented.
- [ ] No redundant deployment-related files remain in the codebase.

## Out of Scope
- Migrating data from existing production databases.
- Implementing advanced deployment strategies like canary or blue-green deployments (unless already part of the existing workflows).
