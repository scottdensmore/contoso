# Implementation Plan - Move contoso-chat to services/chat

## Phase 1: Preparation and Acquisition
- [x] Task: Create a test to verify the existence of the `services/chat` directory and key files (e.g., `package.json` inside it).
    - [x] Sub-task: Create `scripts/test-chat-migration.js` (or a similar test file) that asserts `services/chat` exists and contains files.
    - [x] Sub-task: Run the test to confirm it fails (Red Phase).
- [x] Task: Create the `services` directory if it doesn't exist.

## Phase 2: Migration (Lift and Shift)
- [x] Task: Clone and Copy Chat Service Code.
    - [x] Sub-task: Clone `https://github.com/scottdensmore/contoso-chat` to a temporary directory in `.gemini/tmp` or similar.
    - [x] Sub-task: Create the `services/chat` directory.
    - [x] Sub-task: Copy all files from the temp directory to `services/chat`, explicitly excluding the `.git` folder.
    - [x] Sub-task: Remove the temporary clone.
- [x] Task: Verify Migration.
    - [x] Sub-task: Run the `scripts/test-chat-migration.js` test to confirm it passes (Green Phase).
    - [x] Sub-task: Delete the temporary test script.
- [~] Task: Conductor - User Manual Verification 'Migration (Lift and Shift)' (Protocol in workflow.md).
