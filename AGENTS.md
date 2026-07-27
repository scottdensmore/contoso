# AGENTS

This repository contains two runtime surfaces:

- `apps/web/` for the Next.js web app (UI + API routes).
- `services/chat/` for the FastAPI chat service.

Use this file as the default runbook for coding agents.

## Source of truth

`AGENTS.md` is the single source of truth for agent instructions. Assistants that read
their own context file get a pointer to `AGENTS.md` and nothing else:

| Assistant | Pointer file | Points at |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` (per scope) | sibling `AGENTS.md` |
| Gemini CLI | `GEMINI.md` (per scope) | sibling `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` | root `AGENTS.md` |

Scopes with their own runbook:

- `AGENTS.md` (repo-wide)
- `apps/web/AGENTS.md`
- `services/chat/AGENTS.md`

Never add instructions to a pointer file. That includes memories captured by pressing
`#` in Claude Code, which append to the nearest `CLAUDE.md` — move that text into the
matching `AGENTS.md` instead.

`make agent-docs-check` (part of `make docs-check`, and gated in CI) fails when a
pointer drifts and prints the added lines. To restore the pointers locally after
moving the content across:

```bash
make agent-docs-check FIX=1
```

## Repo map

- `apps/web/src/app/`: Next.js pages and API routes.
- `apps/web/src/components/`: UI components.
- `apps/web/src/lib/`: shared web helpers and domain logic.
- `apps/web/Makefile`: web-owned dev/test/build command surface.
- `apps/web/AGENTS.md`: web-scoped agent runbook.
- `services/chat/src/api/`: chat service API and chat logic.
- `services/chat/tests/`: chat unit and integration tests.
- `services/chat/Makefile`: chat-owned dev/test command surface.
- `services/chat/AGENTS.md`: chat-scoped agent runbook.
- `apps/web/prisma/`: shared data model and migrations.
- `infrastructure/`: deployment scripts and Terraform.
- `docs/`: operator and architecture docs.

## Toolchain baseline

- Node.js `22`
- Python `3.11`

Use `mise` at repo root before running setup/CI commands:

```bash
mise install
```

## Canonical commands

Run from repository root:

```bash
make help
make bootstrap
make toolchain-doctor
make env-contract-check
make agent-doctor
make env-init
make setup
make setup-chat-full
make local-provider-check
make diagnose-chat-local
make docker-init-fresh
make prisma-generate
make prisma-generate-chat
make dev
make test
make test-scripts
make quick-ci
make quick-ci-changed
make e2e-smoke
make e2e-smoke-lite
make e2e-smoke-full
make release-dry-run
make docs-check
make agent-docs-check
make ci
```

Unified npm command surface (root `package.json`):

```bash
npm run bootstrap
npm run doctor
npm run env-contract-check
npm run setup
npm run setup:chat:full
npm run local-provider-check
npm run diagnose:chat:local
npm run dev:web
npm run dev:chat
npm run test:scripts
npm run quick-ci
npm run quick-ci:changed
npm run quick-ci:chat
npm run e2e:smoke
npm run e2e:smoke:lite
npm run e2e:smoke:full
npm run release:dry-run
npm run docs:check
npm run agent-docs:check
npm run ci:web
npm run ci:chat
npm run ci
```

Useful split commands:

```bash
make dev-web
make dev-chat
make test-web
make test-chat
make docs-check
make -C apps/web help
make -C services/chat help
```

## Environment files

- Root app template: `.env.example`
- Chat service template: `services/chat/.env.example`
- Required keys contract: `config/env_contract.json`
- Required keys docs: `docs/ENV_CONTRACT.md`

Copy templates to `.env` before local development.

## Change boundaries

- If you change web API payloads for chat, validate both:
  - `apps/web/src/app/api/chat/*`
  - `services/chat/src/api/*`
- If you change Prisma schema, run migrations and validate both web/chat tests.
- Prefer keeping generated artifacts and local runtime outputs out of commits.

## Validation expectations

- Default agent loop: `make quick-ci-changed`
- Range-scoped agent validation: `CHANGED_BASE=<base_sha> CHANGED_HEAD=<head_sha> make quick-ci-changed`
- Web-only change: `make -C apps/web quick-ci`
- Chat-only change: `make quick-ci-chat`
- Scripts/tooling change: `make test-scripts`
- Cross-surface change (web + chat + schema): `make ci`
- Cross-surface integration confidence: `make e2e-smoke`
- Contract-only integration confidence (minimal chat stack): `make e2e-smoke-lite`
- Full local-provider integration confidence: `make e2e-smoke-full`
- Release preflight: `make release-dry-run RELEASE_TAG=vX.Y.Z`

## Troubleshooting

- Toolchain mismatch: run `mise install`, then `make toolchain-doctor`.
- Env contract drift: run `make env-contract-check` and update contract/templates/docs together.
- Docs link drift (including root runbooks): run `make docs-check`.
- Agent doc drift (a `CLAUDE.md`, `GEMINI.md`, or `.github/copilot-instructions.md` gained content): move the flagged lines into the matching `AGENTS.md`, then run `make agent-docs-check FIX=1`.
- Release guardrail failure: run `make release-dry-run` and fix missing guardrail files.
- E2E smoke failure: run `make e2e-smoke KEEP_STACK=1`, then inspect `docker compose logs`.
- Need local LLM/vector dependencies in Docker chat image: rerun with `CHAT_INSTALL_LOCAL_STACK=1`.
- Need local LLM/vector dependencies in Python chat setup: run `make setup-chat-full`.
- Need one-command local-provider preflight checks: run `make local-provider-check`.
- Need fuller local chat diagnostics (preflight + health payload + compose logs): run `make diagnose-chat-local`.
- Need to initialize a fresh Docker DB volume and rebuild chat product index: run `make docker-init-fresh`.
- Local-provider startup preflight fails (`LLM_PROVIDER=local`): start Ollama (`ollama serve`), pull model (`ollama pull <LOCAL_MODEL_NAME>`), and for docker chat use `OLLAMA_BASE_URL=http://host.docker.internal:11434`.
- Full-profile smoke failure in CI: inspect `e2e-full-compose.log`, `e2e-full-metrics.txt`, `e2e-full-metrics-summary.md`, `e2e-full-dependencies-health.json`, and `e2e-full-alert-state.md` artifacts.
- Scheduled full-profile smoke alerts keep one open issue per alert class and auto-close when scheduled runs recover; include run URL and summary when triaging.
- Missing env files: run `make env-init`, then update `.env` and `services/chat/.env`.
- Python Prisma client missing: run `make prisma-generate-chat`.
- Sandbox-only build failure (`listen EPERM`): run `make ci` outside restricted sandbox.

## Building and running

Before submitting any changes, it is crucial to validate them by running the full build and lint check. This command will build the repository and lint the code.

When doing git operations use the GitHub CLI `gh` where possible.

## Git repo

The main branch for this project is called `main`.

## Comments policy

Only write high-value comments if at all. Avoid talking to the user through comments.

## General style requirements

Use hyphens instead of underscores in flag names (e.g. `my-flag` instead of `my_flag`).

JavaScript/TypeScript and React conventions live in `apps/web/AGENTS.md`.
