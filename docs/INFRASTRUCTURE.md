# Infrastructure and Deployment

This document outlines the infrastructure-as-code, deployment processes, and rollback procedures for the Contoso Outdoor project.

## Deployment Overview

Contoso Outdoor uses a unified deployment process targeting **Google Cloud Run**.

For details on database migrations and connectivity, see [DATABASE.md](./DATABASE.md).

### Local Simulation
Verify deployment logic locally before pushing:
```bash
./infrastructure/scripts/simulate_ci.sh
```

### Manual Deployment
For initial setup or manual updates:
```bash
export PROJECT_ID="your-project-id"
export BILLING_ACCOUNT="your-billing-account-id"
export NEXTAUTH_SECRET="your-secret"
./infrastructure/scripts/setup_project.sh
```

## Rollback Procedures

If a deployment fails or instability occurs, use these methods to restore service.

### 1. Cloud Run Rollback (Immediate)
Revert traffic to the previous stable revision:
```bash
# List revisions
gcloud run revisions list --service=contoso-web --region=us-central1

# Revert 100% of traffic
gcloud run services update-traffic contoso-web --to-revisions=STABLE_REVISION_NAME=100 --region=us-central1
```

### 2. GitHub Actions Rollback
For faulty commits, revert the commit on the `main` branch to trigger a clean CI build and deployment.

### 3. Terraform Rollback
For infrastructure failures, revert changes in `infrastructure/terraform` and run `terraform apply`.

## Environment Teardown

To permanently destroy all GCP resources:
```bash
export PROJECT_ID="your-project-id"
./infrastructure/scripts/teardown_project.sh
```

### Teardown Phases:
1. **Disable Deletion Protection:** Unlocks Cloud SQL and Cloud Run.
2. **Terraform Destroy:** Removes managed resources.
3. **Manual Sweep:** Cleans up VPC peering and DataStores.
4. **Delete State Bucket:** Final step to remove the Terraform backend.

## Health and Smoke Tests
After any deployment, verify the environment:
```bash
export WEB_APP_URL="https://contoso-web-xyz.a.run.app"
export CHAT_SERVICE_URL="https://contoso-chat-xyz.a.run.app"
python3 infrastructure/scripts/test_deployment.py
```
