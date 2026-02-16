# Specification: CI Optimization and GCP Deployment Removal

## Overview
This track focuses on streamlining the project's CI/CD pipeline by removing the Google Cloud Platform (GCP) deployment workflow and establishing a robust Continuous Integration (CI) process dedicated to testing, linting, and code quality.

## Functional Requirements
- **Workflow Deletion:** Remove the `.github/workflows/google-cloud.yml` file to disable automated GCP deployments.
- **New CI Workflow:** Implement a new GitHub Actions workflow (`.github/workflows/ci.yml`) that triggers on pushes and pull requests to `main`.
- **Web App Verification (Node.js):**
    - Perform linting (`npm run lint`).
    - Execute unit tests using Vitest (`npm run test`).
    - Verify the build process (`npm run build`).
- **Chat Service Verification (Python):**
    - Install dependencies from `services/chat/src/api/requirements.txt` and `services/chat/tests/requirements-test.txt`.
    - Execute unit tests using Pytest.
- **CodeQL Integration:** Ensure CodeQL analysis remains active and correctly configured for both JavaScript/TypeScript and Python.
- **Secret Management:** Document the removal or cleanup of unused GCP-related secrets (e.g., `GCP_SA_KEY`).

## Non-Functional Requirements
- **Performance:** Ensure the CI workflow runs efficiently and provides clear feedback on failure.
- **Reliability:** CI must pass before merging to `main` to maintain code standards.

## Acceptance Criteria
- [ ] `.github/workflows/google-cloud.yml` is deleted.
- [ ] `.github/workflows/ci.yml` is present and functional.
- [ ] Both Web and Chat services successfully pass linting and unit tests in the CI environment.
- [ ] Documentation (`README.md`, `infrastructure/README.md`) no longer contains stale deployment instructions.
- [ ] CodeQL successfully completes its analysis on the `main` branch.

## Out of Scope
- Migrating to a different cloud provider.
- End-to-end integration testing against live cloud resources.
