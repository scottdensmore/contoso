# Implementation Plan - Consolidate Monorepo Docker Configuration

## Phase 1: Chat Service Dockerization
- [x] Task: Create `services/chat/Dockerfile`.
    - [x] Sub-task: Adapt the content from `services/chat/src/api/Dockerfile`.
    - [x] Sub-task: Adjust paths (since it's moving from `src/api/` to the service root).
    - [x] Sub-task: Update the default port/command for local development (port 8000).
- [x] Task: Remove `services/chat/src/api/Dockerfile`.

## Phase 2: Root Dockerfile Refinement
- [x] Task: Update the root `Dockerfile` to be selective.
    - [x] Sub-task: Replace `COPY . .` with specific `COPY` commands for `src/`, `public/`, `next.config.js`, etc.
    - [x] Sub-task: Ensure `services/` is not copied.

## Phase 3: Docker Compose Integration
- [x] Task: Update `docker-compose.yml`.
    - [x] Sub-task: Add the `chat` service definition.
    - [x] Sub-task: Configure build context, ports (8000:8000), and dependencies.
    - [x] Sub-task: Add basic environment variables to the `chat` service (Project ID, Region, etc. as placeholders or from `.env`).

## Phase 4: Documentation Consolidation
- [x] Task: Update the root `README.md`.
    - [x] Sub-task: Add a "Chat Service" section under "Features" or a new major section.
    - [x] Sub-task: Incorporate local development and deployment instructions from `services/chat/README.md`.
    - [x] Sub-task: Ensure links and paths in the consolidated documentation are correct for the new monorepo structure.

## Phase 5: Verification [checkpoint: 4d6c419]
- [x] Task: Verify the build.
    - [x] Sub-task: Run `docker-compose build`.
    - [x] Sub-task: Run `docker-compose up -d`.
    - [x] Sub-task: Verify `web` and `chat` are running (e.g., check `docker ps` and logs).
- [x] Task: Conductor - User Manual Verification 'Consolidate Monorepo Docker Configuration' (Protocol in workflow.md).
