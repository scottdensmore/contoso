# AGENTS

This repository contains two runtime surfaces:

- `apps/web/` for the Next.js web app (UI + API routes).
- `services/chat/` for the FastAPI chat service.

Use this file as the default runbook for coding agents.

## Repo map

- `apps/web/src/app/`: Next.js pages and API routes.
- `apps/web/src/components/`: UI components.
- `apps/web/src/lib/`: shared web helpers and domain logic.
- `apps/web/Makefile`: web-owned dev/test/build command surface.
- `services/chat/src/api/`: chat service API and chat logic.
- `services/chat/tests/`: chat unit and integration tests.
- `services/chat/Makefile`: chat-owned dev/test command surface.
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
make ci
```

Unified npm command surface (root `package.json`):

```bash
npm run bootstrap
npm run doctor
npm run env-contract-check
npm run setup
npm run setup:chat:full
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
- Release guardrail failure: run `make release-dry-run` and fix missing guardrail files.
- E2E smoke failure: run `make e2e-smoke KEEP_STACK=1`, then inspect `docker compose logs`.
- Need local LLM/vector dependencies in Docker chat image: rerun with `CHAT_INSTALL_LOCAL_STACK=1`.
- Need local LLM/vector dependencies in Python chat setup: run `make setup-chat-full`.
- Full-profile smoke failure in CI: inspect `e2e-full-compose.log`, `e2e-full-metrics.txt`, `e2e-full-metrics-summary.md`, and `e2e-full-alert-state.md` artifacts.
- Scheduled full-profile smoke alerts keep one open issue per alert class and auto-close when scheduled runs recover; include run URL and summary when triaging.
- Missing env files: run `make env-init`, then update `.env` and `services/chat/.env`.
- Python Prisma client missing: run `make prisma-generate-chat`.
- Sandbox-only build failure (`listen EPERM`): run `make ci` outside restricted sandbox.
