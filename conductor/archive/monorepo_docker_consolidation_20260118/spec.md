# Specification: Consolidate Monorepo Docker Configuration

## Overview
Now that the chat service is co-located in this repository, we need to unify the Docker configuration. This involves refining the root `Dockerfile` to be specific to the Next.js application, creating a dedicated `Dockerfile` for the Python chat service, and integrating both services into the root `docker-compose.yml`. Finally, we will consolidate the documentation by merging relevant parts of `services/chat/README.md` into the main `README.md`.

## Functional Requirements
- **Refine Root Dockerfile:** Update the root `Dockerfile` (for the Next.js web app) to explicitly copy only the files it requires (e.g., `package.json`, `prisma/`, `src/`, `public/`), ensuring it no longer copies the entire repository (specifically avoiding `services/`).
- **Create Chat Service Dockerfile:** Move and adapt the existing configuration from `services/chat/src/api/Dockerfile` to a new `services/chat/Dockerfile`. This Dockerfile will be responsible for building the Python environment and running the FastAPI application.
- **Update Docker Compose:** Modify `docker-compose.yml` to:
    - Include a `chat` service that builds from `./services/chat`.
    - Map port `8000:8000` for the `chat` service.
    - Set up the necessary environment variables for the `chat` service as defined in its `LOCAL_DEVELOPMENT.md`.
    - Ensure the `web` service can communicate with the `chat` service (if applicable, though immediate code integration is not requested here).
- **Cleanup:** Remove the old `services/chat/src/api/Dockerfile` and any other redundant Docker configurations within the `services/chat` directory.
- **Documentation Consolidation:** Update the root `README.md` to include instructions for running the chat service locally and deploying it, using content from `services/chat/README.md`.

## Non-Functional Requirements
- **Build Efficiency:** Leverage Docker layer caching by copying dependency files (`package.json`, `requirements.txt`) before the rest of the source code.
- **Isolation:** Each service's build process should only have access to its relevant files.
- **Documentation Clarity:** The root `README.md` should be the single source of truth for getting the entire stack up and running.

## Acceptance Criteria
- [ ] Running `docker-compose up` builds and starts the `db`, `web`, and `chat` services.
- [ ] The `web` container does not contain files from the `services/` directory.
- [ ] The `chat` container successfully runs the FastAPI application on port 8000.
- [ ] Redundant Dockerfiles in `services/chat/` are removed.
- [ ] The root `README.md` contains a "Chat Service" section with instructions for local development and deployment.

## Out of Scope
- Implementing the actual API calls from the Next.js app to the Chat service (this is a configuration/chore task).
- Deployment configuration for GCP (this track focuses on local Docker/Compose setup).
