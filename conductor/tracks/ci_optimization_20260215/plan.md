# Implementation Plan: CI Optimization and GCP Deployment Removal

## Phase 1: Deletion and Cleanup [checkpoint: 9f39742]
- [x] Task: Remove GCP deployment workflow (14a7d9a)
    - [x] Delete `.github/workflows/google-cloud.yml`
- [x] Task: Update project documentation (10e29fc)
    - [x] Retain deployment information in `README.md` and `infrastructure/README.md` as requested.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Deletion and Cleanup' (Protocol in workflow.md) (9f39742)

## Phase 2: CI Workflow Implementation
- [ ] Task: Implement Web CI job
    - [ ] Create `.github/workflows/ci.yml` with Node.js setup
    - [ ] Add linting step (`npm run lint`)
    - [ ] Add unit testing step (`npm run test`)
    - [ ] Add build verification step (`npm run build`)
- [ ] Task: Implement Chat CI job
    - [ ] Add Python setup to `ci.yml`
    - [ ] Add dependency installation for `services/chat`
    - [ ] Add unit testing step using Pytest for `services/chat`
- [ ] Task: Update CodeQL workflow
    - [ ] Remove `feat/google-cloud-deployment` branch trigger from `.github/workflows/codeql.yml`
- [ ] Task: Conductor - User Manual Verification 'Phase 2: CI Workflow Implementation' (Protocol in workflow.md)

## Phase 3: Final Verification
- [ ] Task: Verify CI workflow execution
    - [ ] Trigger the `ci.yml` workflow and ensure all jobs pass
- [ ] Task: Verify CodeQL execution
    - [ ] Ensure CodeQL analysis completes successfully
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Verification' (Protocol in workflow.md)
