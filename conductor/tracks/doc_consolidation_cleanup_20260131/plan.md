# Implementation Plan - Documentation Consolidation and Repository Cleanup

## Phase 1: README Consolidation and Cleanup [checkpoint: c32eea4]
- [x] Task: Consolidate README files (40d2944)
    - [x] Extract instructions and architecture details from `services/chat/README.md`.
    - [x] Create a dedicated "AI Chat Service" section in the root `README.md`.
    - [x] Integrate chat-specific instructions (Local Dev, Deployment) into the root `README.md`.
- [x] Task: Remove redundant service files (5ac947f)
    - [x] Delete `services/chat/README.md`.
    - [x] Delete `services/chat/LICENSE`.
- [x] Task: Conductor - User Manual Verification 'README Consolidation and Cleanup' (097280e)

## Phase 2: GitIgnore Unification and Audit
- [ ] Task: Consolidate all .gitignore files
    - [ ] Locate all `.gitignore` files in the repository.
    - [ ] Merge unique patterns into the root `.gitignore`, adjusting paths relative to the root.
    - [ ] Delete sub-directory `.gitignore` files.
- [ ] Task: Audit and refine root .gitignore
    - [ ] Verify coverage for Node.js/Next.js (e.g., `.next`, `out`, `node_modules`).
    - [ ] Verify coverage for Python (e.g., `__pycache__`, `.venv`, `.pytest_cache`).
    - [ ] Verify coverage for OS/IDE files (e.g., `.DS_Store`, `.vscode`, `.idea`).
    - [ ] Ensure sensitive files like `.env` and `local.env` are ignored.
- [ ] Task: Conductor - User Manual Verification 'GitIgnore Unification and Audit' (Protocol in workflow.md)
