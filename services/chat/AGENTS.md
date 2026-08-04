# AGENTS (Chat Service)

FastAPI chat service scope for coding agents. Source of truth for this scope: put
instructions here, never in `services/chat/CLAUDE.md`. See the repo-root `AGENTS.md`
for the policy.

## Entry points

- API app: `services/chat/src/api/main.py`
- Chat logic: `services/chat/src/api/contoso_chat/`
- Evaluators: `services/chat/src/api/evaluators/`
- Tests: `services/chat/tests/unit/`
- Integration coverage: `scripts/e2e_smoke.py`, run by `make e2e-smoke` against a real stack

## Toolchain baseline

- Python `3.11` (matches CI for chat checks)

From repository root:

```bash
mise install
make venv
```

All chat Python runs from the shared repo-root virtualenv at `.venv`. The Make
targets here create it on demand and call `.venv/bin/python` directly, so no
activation step is needed. Do not `pip install` chat dependencies into a system
or mise interpreter.

## Local commands

From repository root:

```bash
make bootstrap
make agent-doctor
make setup-chat
make local-provider-check
make diagnose-chat-local
make dev-chat
make test-chat
npm run bootstrap
npm run doctor
npm run setup:chat
npm run local-provider-check
npm run diagnose:chat:local
npm run dev:chat
npm run ci:chat
```

From service directory:

```bash
make help
make check-python
make setup
make local-provider-check
make diagnose-chat-local
make dev
make deps-check
make lint
make typecheck
make test
make quick-ci
make ci
```

Integration checks run against a real stack from the repository root:

```bash
make e2e-smoke
```

## Environment

Use `services/chat/.env.example` as the baseline template.

Most common local values:

- `LLM_PROVIDER=local`
- `OLLAMA_BASE_URL=http://localhost:11434`
- `ALLOWED_ORIGINS=http://localhost:3000`

## Database access

The chat service reads Postgres directly through `asyncpg` in
`services/chat/src/api/db.py`. There is no generated Python ORM client and no
code generation step.

`prisma-client-py` was removed: it pinned Prisma 5.17.0 and required a `url` in
the shared schema's `datasource` block, which Prisma 7 removes. Generating both
a JS and a Python client from `apps/web/prisma/schema.prisma` meant the Python
client dictated which Prisma versions the web app could adopt.

`apps/web/prisma/schema.prisma` remains the source of truth for the data model
and migrations. When it changes, update the SQL in `db.py` to match — the
queries name tables and columns explicitly and nothing verifies them at build
time.

## Guardrails

- Preserve API compatibility for web callers in `apps/web/src/lib/messaging.ts`.
- If request or response schema changes, update both unit tests and web proxy behavior.
- Keep external provider configuration behind environment variables.
