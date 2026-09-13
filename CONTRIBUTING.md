# Contributing to Contoso Outdoors

Thank you for your interest in contributing to the Contoso Outdoors project!

Work is tracked in GitHub issues and pull requests.

## Coding Standards

### Technology Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS.
- **Backend:** Next.js API Routes, FastAPI chat service, Prisma ORM.
- **Database:** PostgreSQL.
- **Testing:** Vitest, React Testing Library, pytest.

### Guidelines
- **TypeScript:** Use strict typing. Avoid `any`.
- **Functional Components:** Use React Hooks and functional components.
- **Tailwind:** Use utility classes for styling.
- **TDD:** Write tests *before* implementation.
- **Runtime Parity:** Use pinned local tool versions via `mise install` (Node.js 22, Python 3.11).

## Quality Gates

Before submitting or merging a Pull Request, ensure:
- [ ] Full local CI passes (`make ci`).
- [ ] No linting errors (`make lint` / `make check-scripts`).
- [ ] All tests pass (`make test`).
- [ ] All changes land on `main` via squash-merged PRs to preserve a linear commit graph.
- [ ] The code does what the issue it closes describes.

## Making Changes

1.  **Bootstrap once:** `make bootstrap` (or `npm run bootstrap`) for a full local setup.
2.  **Validate env contract drift:** `make env-contract-check`.
3.  **Create a Branch:** `git checkout -b feature/your-feature-name`
4.  **Implement:** Follow the TDD cycle (Red -> Green -> Refactor).
5.  **Commit:** Use conventional commit messages (e.g., `feat(auth): Add login page`).
6.  **Verify:** Run preflight (`make agent-doctor`), fast changed-scope checks (`make quick-ci-changed`), script tests (`make test-scripts`), integration smoke (`make e2e-smoke`, `make e2e-smoke-lite`, or `make e2e-smoke-full` with the full chat dependency profile installed), release preflight (`make release-dry-run`), and full local checks (`make ci`).
7.  **Push & PR:** Push your branch and open a Pull Request.
8.  **Merge Policy:** Squash-merge PRs into `main` (`gh pr merge --squash --delete-branch`) to maintain a clean linear commit graph.

## Database Migrations

If your change involves the database:
1.  Modify `apps/web/prisma/schema.prisma`.
2.  Run `make migrate NAME=<migration-name>` (or `cd apps/web && npx prisma migrate dev --schema prisma/schema.prisma --name <migration-name>`). The name is required either way: without it Prisma prompts, which a non-interactive shell cannot answer.
3.  Update the seed script (`apps/web/prisma/seed.ts`) if necessary.

## Need Help?

Refer to `docs/` for architecture, database, deployment, and release runbooks.

### Quick Troubleshooting

- If runtime checks fail, run `mise install` then `make toolchain-doctor`.
- All Python runs from the `.venv` virtualenv created by `make venv`/`make bootstrap`; if a dependency looks missing, re-run the command through `make` rather than a system `python`.
- If env contract drift check fails, run `make env-contract-check` and align `config/env_contract.json`, env templates, and `docs/ENV_CONTRACT.md`.
- If env checks fail, run `make env-init` and fill required values in `.env` files.
- If release preflight fails, run `make release-dry-run RELEASE_TAG=vX.Y.Z` and fix missing guardrail files.
- If integration smoke fails, run `make e2e-smoke KEEP_STACK=1` and inspect compose logs.
- If chat local-provider dependencies are required in Docker, run with `CHAT_INSTALL_LOCAL_STACK=1`.
- If chat local-provider dependencies are required in Python setup, run `make setup-chat-full`.
- If local-provider runtime is flaky, run `make local-provider-check` before debugging request-path failures.
- For a full local diagnostics bundle (preflight + health payload + compose status/logs), run `make diagnose-chat-local`.
- If local-provider startup preflight fails, ensure `ollama serve` is running, `ollama pull <LOCAL_MODEL_NAME>` exists, and docker chat uses `OLLAMA_BASE_URL=http://host.docker.internal:11434`.
- If full-profile integration smoke fails, run `make e2e-smoke-full KEEP_STACK=1` and inspect compose logs (`docker compose logs chat`).
- All validation runs locally; GitHub Actions workflows are disabled to preserve action minutes.
- Keyboard and focus journeys (e.g. evaluating tab order, focus-out dismissal, or boundary visibility) must be evaluated against a production build (`make build-web` or compose stack). Next.js dev mode injects dev overlay elements (such as the issues portal and error badges) into the DOM that alter tab stop sequences and focus behavior. See `.claude/agents/ui-review.md`.
- TypeScript is pinned to `^5` in `apps/web/package.json` because `eslint-config-next` bundles `typescript-eslint` with peer dependency `typescript <6.1.0`. TypeScript 7 will be adopted once supported upstream (see `apps/web/README.md`).
