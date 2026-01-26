# Specification - Seed Data Merge

## Overview
Consolidate redundant seed data across the project into a single source of truth within the `public/` directory.

## Functional Requirements
- Aggregate individual customer JSON files from `services/chat/data/customer_info/` into `public/customers.json`.
- Update `prisma/seed.ts` to support seeding `User`, `Order`, and `OrderItem` records from the consolidated file.
- Update chat service Python scripts (`seed_gcp_customers.py`, `seed_gcp_products.py`) to point to the new data location.
- Remove redundant data files in `services/chat/data/`.

## Acceptance Criteria
- [x] All 12 customers and their orders are present in `public/customers.json`.
- [x] `npm run prisma:seed` successfully seeds users and orders.
- [x] GCP seeding scripts in `services/chat/scripts/` function correctly with new paths.
- [x] Redundant data directory `services/chat/data/` is removed.
