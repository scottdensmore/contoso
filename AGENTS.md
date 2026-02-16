# AGENTS

This repository contains two runtime surfaces:

- `src/` for the Next.js web app (UI + API routes).
- `services/chat/` for the FastAPI chat service.

Use this file as the default runbook for coding agents.

## Repo map

- `src/app/`: Next.js pages and API routes.
- `src/components/`: UI components.
- `src/lib/`: shared web helpers and domain logic.
- `services/chat/src/api/`: chat service API and chat logic.
- `services/chat/tests/`: chat unit and integration tests.
- `prisma/`: shared data model and migrations.
- `infrastructure/`: deployment scripts and Terraform.
- `docs/`: operator and architecture docs.

## Canonical commands

Run from repository root:

```bash
make help
make setup
make dev
make test
make ci
```

Useful split commands:

```bash
make dev-web
make dev-chat
make test-web
make test-chat
make docs-check
```

## Environment files

- Root app template: `.env.example`
- Chat service template: `services/chat/.env.example`

Copy templates to `.env` before local development.

## Change boundaries

- If you change web API payloads for chat, validate both:
  - `src/app/api/chat/*`
  - `services/chat/src/api/*`
- If you change Prisma schema, run migrations and validate both web/chat tests.
- Prefer keeping generated artifacts and local runtime outputs out of commits.

## Validation expectations

- Web-only change: `make lint && make typecheck && make test-web`
- Chat-only change: `make test-chat`
- Cross-surface change (web + chat + schema): `make ci`
