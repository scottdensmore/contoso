# Specification: Move contoso-chat to services/chat

## Overview
This track involves migrating the code from the external `contoso-chat` repository (https://github.com/scottdensmore/contoso-chat) into the current `contoso` repository to transition towards a monorepo structure. The goal is to co-locate the chat service with the main application to simplify future deployments and service management.

## Functional Requirements
- Create a new directory `services/chat` at the root of the project.
- Fetch the latest code from `https://github.com/scottdensmore/contoso-chat`.
- Copy all files from the source repository into `services/chat`, excluding the `.git` directory.
- This is a "Lift and Shift" operation; the code should be moved as-is without immediate integration into the main build or deployment pipelines.

## Non-Functional Requirements
- **Fresh History:** The migration will not preserve the git history of the original repository (files will be copied as a single commit).
- **Directory Structure:** Adhere to the `services/<service-name>` pattern for service organization.

## Acceptance Criteria
- [ ] Directory `services/chat` exists.
- [ ] Latest files from `contoso-chat` are present in `services/chat`.
- [ ] The `services/chat` directory does not contain a `.git` folder.
- [ ] The repository's root `.gitignore` or other global configurations are updated if necessary to accommodate the new directory.

## Out of Scope
- Integration with `docker-compose.yml`.
- Terraform or cloud deployment configuration for the chat service.
- Integration with the main `package.json` or build scripts.
- Refactoring the chat service code.
