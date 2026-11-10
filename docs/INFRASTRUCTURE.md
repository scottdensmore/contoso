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

### 2. Code Rollback
For faulty commits, create a revert pull request targeting `main`, verify locally with `make ci`, squash-merge, and redeploy via `./infrastructure/scripts/setup_project.sh` (or your deployment pipeline).

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
4. **Delete State Bucket:** Only after Terraform destroy succeeds, state is verified empty, and all cleanup checks succeed. The deployer service account is removed after the state bucket.

If any step fails or cannot be verified, the script exits nonzero and retains the Terraform state bucket and deployer account for recovery. It never removes resource addresses from state to force a destroy retry to pass. Pending DataStore deletion also retains state; wait for deletion to complete before retrying.

The script requires `gcloud`, `gsutil`, `terraform`, and `curl` before making changes. Missing or inaccessible state is an error, not evidence of successful cleanup. A state bucket containing other workspaces, other prefixes, or a state lock is retained for manual review. Do not run concurrent infrastructure changes during teardown.

The safety regression tests use local command doubles and do not access cloud resources:
```bash
.venv/bin/python -m unittest discover -s tests/scripts -p test_teardown_project.py -v
```

## Health and Smoke Tests
After any deployment, verify the environment:
```bash
export WEB_APP_URL="https://contoso-web-xyz.a.run.app"
export CHAT_SERVICE_URL="https://contoso-chat-xyz.a.run.app"
python3 infrastructure/scripts/test_deployment.py
```
