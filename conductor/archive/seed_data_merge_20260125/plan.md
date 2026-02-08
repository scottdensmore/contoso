# Implementation Plan - Seed Data Merge

## Phase 1: Data Consolidation
- [x] Task: Aggregate customer JSON files into `public/customers.json`.
- [x] Task: Verify product and manual data in `public/` matches `services/chat/data/`.

## Phase 2: Script Updates
- [x] Task: Update `prisma/seed.ts` to include Customer and Order seeding logic.
- [x] Task: Update `services/chat/scripts/seed_gcp_customers.py` to use `public/customers.json`.
- [x] Task: Update `services/chat/scripts/seed_gcp_products.py` to use `public/products.json`.

## Phase 3: Cleanup and Verification
- [x] Task: Remove `services/chat/data/` directory.
- [x] Task: Run `npm run build` to ensure no regressions.
- [x] Task: Conductor - User Manual Verification 'Cleanup and Verification' (Protocol in workflow.md)
