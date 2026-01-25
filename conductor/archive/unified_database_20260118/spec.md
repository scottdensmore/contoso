# Specification: Unified Database for App and Chat Service

## Overview
Currently, the chat service uses its own data store (JSON/Firestore) while the main app uses PostgreSQL. This track aims to unify the database by extending the main PostgreSQL schema to accommodate the chat service's data requirements (customer profiles and order history) and updating the chat service to use the main database as its source of truth.

## Functional Requirements
- **Extend Prisma Schema:** Update `prisma/schema.prisma` to include:
    - Extended `User` fields: `firstName`, `lastName`, `age`, `phone`, `membership` (mapping chat "Customer" data to "User").
    - New `Order` model: `id`, `userId`, `total`, `date`, etc.
    - New `OrderItem` model: Linking products to orders with quantity and price.
- **Data Migration (Seeding):** Create/update a seeding script to import data from `services/chat/data/customer_info/*.json` into the PostgreSQL database.
- **Python Database Integration:**
    - Add `prisma-client-python` to `services/chat/src/api/requirements.txt`.
    - Generate the Python Prisma client for the chat service.
- **Chat Service Logic Update:** Refactor the chat service's data fetching logic to query the PostgreSQL database via Prisma instead of reading from local JSON files.

## Non-Functional Requirements
- **Single Source of Truth:** PostgreSQL becomes the primary data store for both the web application and the chat service.
- **Schema Consistency:** Ensure that the Python Prisma client stays in sync with the main `schema.prisma`.

## Acceptance Criteria
- [ ] `npx prisma migrate dev` successfully updates the database schema.
- [ ] Seeding script successfully populates PostgreSQL with chat service's user and order data.
- [ ] Chat service successfully connects to PostgreSQL using `prisma-client-python`.
- [ ] Chat responses are correctly grounded in data retrieved from the PostgreSQL database.

## Out of Scope
- Fully deprecating Firestore if it's used for other non-grounding features.
- Updating the web UI to display the new order history.
