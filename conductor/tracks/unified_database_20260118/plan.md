# Implementation Plan - Unified Database for App and Chat Service

## Phase 1: Schema Extension and Migration
- [x] Task: Update `prisma/schema.prisma`.
    - [x] Sub-task: Add `firstName`, `lastName`, `age`, `phoneNumber`, `membership` to the `User` model.
    - [x] Sub-task: Add `Order` and `OrderItem` models.
    - [x] Sub-task: Run `npx prisma migrate dev --name extend_user_and_orders`.
- [x] Task: Create data migration script.
    - [x] Sub-task: Create `scripts/migrate-chat-data.ts` to read JSON files and seed PostgreSQL.
    - [x] Sub-task: Run the migration script and verify data in the database.

## Phase 2: Python Environment Setup
- [x] Task: Configure Python for Prisma.
    - [x] Sub-task: Add `prisma` to `services/chat/src/api/requirements.txt`.
    - [x] Sub-task: Update `services/chat/Dockerfile` to generate the Prisma client.
    - [x] Sub-task: Set `DATABASE_URL` in `docker-compose.yml` for the `chat` service.

## Phase 3: Chat Service Code Refactoring
- [~] Task: Update data access logic in `services/chat`.
    - [ ] Sub-task: Identify functions reading from `data/customer_info/`.
    - [ ] Sub-task: Refactor these functions to use the generated Python Prisma client.
- [ ] Task: Verify chat service functionality.
    - [ ] Sub-task: Run `docker-compose up`.
    - [ ] Sub-task: Test a chat request that requires customer or order information.

## Phase 4: Verification and Cleanup
- [ ] Task: Verify the entire stack.
- [ ] Task: Conductor - User Manual Verification 'Unified Database' (Protocol in workflow.md).
