# Implementation Plan - Consolidate Monorepo Docker Configuration

## Phase 1: Chat Service Dockerization
- [x] Task: Create `services/chat/Dockerfile`.
    - [x] Sub-task: Adapt the content from `services/chat/src/api/Dockerfile`.
    - [x] Sub-task: Adjust paths (since it's moving from `src/api/` to the service root).
    - [x] Sub-task: Update the default port/command for local development (port 8000).
- [x] Task: Remove `services/chat/src/api/Dockerfile`.

## Phase 2: Root Dockerfile Refinement
- [ ] Task: Update the root `Dockerfile` to be selective.
    - [ ] Sub-task: Replace `COPY . .` with specific `COPY` commands for `src/`, `public/`, `next.config.js`, etc.
    - [ ] Sub-task: Ensure `services/` is not copied.

## Phase 3: Docker Compose Integration
- [ ] Task: Update `docker-compose.yml`.
    - [ ] Sub-task: Add the `chat` service definition.
    - [ ] Sub-task: Configure build context, ports (8000:8000), and dependencies.
    - [ ] Sub-task: Add basic environment variables to the `chat` service (Project ID, Region, etc. as placeholders or from `.env`).

## Phase 4: Documentation Consolidation
- [ ] Task: Update the root `README.md`.
    - [ ] Sub-task: Add a "Chat Service" section under "Features" or a new major section.
    - [ ] Sub-task: Incorporate local development and deployment instructions from `services/chat/README.md`.
    - [ ] Sub-task: Ensure links and paths in the consolidated documentation are correct for the new monorepo structure.

## Phase 5: Verification
- [ ] Task: Verify the build.
    - [ ] Sub-task: Run `docker-compose build`.
    - [ ] Sub-task: Run `docker-compose up -d`.
    - [ ] Sub-task: Verify `web` and `chat` are running (e.g., check `docker ps` and logs).
- [ ] Task: Conductor - User Manual Verification 'Consolidate Monorepo Docker Configuration' (Protocol in workflow.md).
