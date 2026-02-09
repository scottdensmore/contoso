# Infrastructure and Deployment

This directory contains the infrastructure-as-code and deployment scripts for the Contoso Outdoor project.

## Deployment Overview

The project uses a unified deployment process targeting Google Cloud Run.

### Local Simulation
To verify the deployment logic locally:
```bash
./infrastructure/scripts/simulate_ci.sh
```

### Manual Deployment
```bash
export PROJECT_ID="your-project-id"
export BILLING_ACCOUNT="your-billing-account-id" # List with: gcloud beta billing accounts list
export NEXTAUTH_SECRET="your-secret"
./infrastructure/scripts/setup_project.sh
```

## Rollback Procedures

In the event of a deployment failure or service instability, follow these steps to roll back to a previous known-good version.

### 1. Cloud Run Service Rollback (Immediate)
Use the `gcloud` CLI to revert traffic to a previous revision:

```bash
# List revisions to find the previous stable one
gcloud run revisions list --service=contoso-web --region=us-central1

# Revert 100% of traffic to the stable revision
gcloud run services update-traffic contoso-web --to-revisions=STABLE_REVISION_NAME=100 --region=us-central1
```
Repeat for `contoso-chat` if necessary.

### 2. GitHub Actions Rollback
If the failure was due to a faulty commit:
1. Revert the commit on the `main` branch.
2. The `google-cloud.yml` workflow will automatically trigger and deploy the previous state.

### 3. Terraform Rollback
If the failure was due to infrastructure changes:
1. Revert the changes in `infrastructure/terraform`.
2. Run `terraform apply` locally or push to trigger the CI pipeline.

## Teardown

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
