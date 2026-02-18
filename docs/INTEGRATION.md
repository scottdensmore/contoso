# Integration Smoke Runbook

This runbook covers cross-surface validation for `web -> chat -> db`.

## Local Smoke Command

Run from repo root:

```bash
make e2e-smoke
```

What it does:

1. starts `db`, `chat`, and `web` with Docker Compose
2. waits for chat health (`/health`)
3. verifies chat database dependency health (`/health/dependencies`)
4. sends a web proxy request to `/api/chat/service`
5. validates the response contract (`answer` or `response` string)
6. tears down the stack (unless `KEEP_STACK=1`)

Keep the stack running for manual debugging:

```bash
make e2e-smoke KEEP_STACK=1
```

## CI Integration Job

Workflow: `.github/workflows/ci.yml`  
Job: `Integration E2E Smoke`

Behavior:

1. runs on PR/manual events when `web`, `chat`, or `runtime` surfaces change
2. executes `make e2e-smoke KEEP_STACK=1`
3. captures compose logs to `e2e-compose.log`
4. uploads logs as artifact `e2e-compose-logs-<run_id>`
5. tears down the stack

## Failure Triage

If smoke fails:

1. inspect `e2e-compose.log` artifact from CI
2. check `db` startup and chat dependency health output
3. rerun locally with stack retained:
   `make e2e-smoke KEEP_STACK=1`
4. inspect services:
   `docker compose ps`
   `docker compose logs --no-color db chat web`
5. retry smoke only:
   `python scripts/e2e_smoke.py --web-url http://127.0.0.1:3000 --chat-url http://127.0.0.1:8000`

## Common Failure Classes

1. `chat dependency health (db)` timeout:
   DB not reachable from chat container or Prisma client cannot connect.
2. `web -> chat proxy call` non-200:
   web route cannot reach chat endpoint or chat returned upstream error.
3. missing `answer`/`response` field:
   response contract drift between web consumer and chat provider.
