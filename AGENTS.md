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
make setup
make prisma-generate
make dev
make test
make quick-ci
make ci
```

Unified npm command surface (root `package.json`):

```bash
npm run setup
npm run dev:web
npm run dev:chat
npm run quick-ci
npm run quick-ci:chat
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

Copy templates to `.env` before local development.

## Change boundaries

- If you change web API payloads for chat, validate both:
  - `apps/web/src/app/api/chat/*`
  - `services/chat/src/api/*`
- If you change Prisma schema, run migrations and validate both web/chat tests.
- Prefer keeping generated artifacts and local runtime outputs out of commits.

## Validation expectations

- Web-only change: `make -C apps/web quick-ci`
- Chat-only change: `make quick-ci-chat`
- Cross-surface change (web + chat + schema): `make ci`
