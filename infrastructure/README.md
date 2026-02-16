# Infrastructure and Deployment

This directory contains the infrastructure-as-code and setup scripts for the Contoso Outdoor project.

## CI/CD Overview

The project uses a test-focused Continuous Integration (CI) pipeline via GitHub Actions. Automated deployment to Google Cloud Run has been removed in favor of manual deployment via scripts when necessary.

### CI Workflow
The CI pipeline (`.github/workflows/ci.yml`) automatically runs on every push to `main` and includes:
- Web App: Linting, Unit Tests, and Build verification.
- Chat Service: Python unit tests.
- Security: CodeQL static analysis.

### Manual Deployment
To provision resources and deploy the stack manually:
```bash
export PROJECT_ID="your-project-id"
export BILLING_ACCOUNT="your-billing-account-id"
export NEXTAUTH_SECRET="your-secret"
./infrastructure/scripts/setup_project.sh
```

## Maintenance and Teardown

To destroy all GCP resources for an environment:

```bash
export PROJECT_ID="your-project-id"
./infrastructure/scripts/teardown_project.sh
```

The script runs in 4 phases:
1. **Disable deletion protection** on Cloud SQL and Cloud Run (required before Terraform can destroy them)
2. **Terraform destroy** — removes all resources tracked in state
3. **Manual cleanup sweep** — catches anything Terraform missed (VPC peering, DataStore, etc.)
4. **Delete Terraform state bucket** — removed last so Terraform can run in Phase 2

Key points for team members:
- **Safe to re-run** — every operation checks if the resource exists first
- **Use `--force`** to skip the confirmation prompt: `./infrastructure/scripts/teardown_project.sh --force`
- **Summary at the end** — shows what succeeded, was skipped (already gone), or failed
- **If something fails**, wait 5-10 minutes and re-run. Cloud SQL shutdown and VPC peering deletion are the most common causes of transient failures
- **Discovery Engine DataStore** deletion runs asynchronously and takes up to 2 hours. The setup script handles this by checking the DataStore status before attempting to create a new one

## Health and Smoke Tests
After any deployment or rollback, run the smoke tests:
```bash
export WEB_APP_URL="https://contoso-web-xyz.a.run.app"
export CHAT_SERVICE_URL="https://contoso-chat-xyz.a.run.app"
python3 infrastructure/scripts/test_deployment.py
```
