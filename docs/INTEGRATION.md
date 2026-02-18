# Integration Smoke Runbook

This runbook covers cross-surface validation for `web -> chat -> db`.

## Local Smoke Command

Run from repo root:

```bash
make e2e-smoke
```

Fast contract-only profile (minimal chat dependency footprint):

```bash
make e2e-smoke-lite
```

Full local-provider profile:

```bash
make e2e-smoke-full
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

Enable local LLM/vector stack in chat image when needed:

```bash
make e2e-smoke CHAT_INSTALL_LOCAL_STACK=1
```

## Profile Selection

- `e2e-smoke-lite`: default for PRs and fast contract validation.
- `e2e-smoke-full`: use when validating local provider/runtime behavior (`LLM_PROVIDER=local`).

## CI Integration Job

Workflow: `.github/workflows/ci.yml`  
Job: `Integration E2E Smoke`

Behavior:

1. runs on PR/manual events when `web`, `chat`, or `runtime` surfaces change
2. prebuilds `contoso-web` and `contoso-chat` with Buildx cache
3. executes `make e2e-smoke-lite KEEP_STACK=1`
4. captures compose logs to `e2e-compose.log`
5. captures duration/image-size metrics to `e2e-metrics.txt`
6. compares against previous successful baseline and writes `e2e-metrics-summary.md`
7. stores rolling metrics history in cache (`.ci-metrics/lite-history.json`)
8. enforces smoke budgets (duration <= 420s, chat image <= 2.5GB, web image <= 1.5GB)
9. uploads logs, raw metrics, summary, and history artifact `e2e-compose-logs-<run_id>`
10. tears down the stack

Manual full-profile validation:

1. run `Continuous Integration` via `workflow_dispatch`
2. set input `run_full_profile_smoke=true`
3. job `Integration E2E Smoke (Full Chat Profile)` runs `make e2e-smoke-full`
4. enforces full-profile budgets (duration <= 600s, chat image <= 2.0GB, web image <= 1.5GB)

Scheduled full-profile validation:

1. same job also runs weekly via cron (`0 9 * * 1`, Mondays 09:00 UTC)
2. schedule runs full-profile smoke only (changed-scope jobs remain skipped)
3. workflow compares full-profile metrics against previous successful full-profile baseline
4. if scheduled run fails, exceeds budget, or regresses significantly, CI creates or updates one open issue per alert class
5. if a later scheduled run is healthy, CI auto-closes open full-profile smoke alert issues
6. workflow writes `e2e-full-alert-state.md` summarizing issue lifecycle action for the run

## Budget Baselines

Reference observations from local runs on February 17, 2026:

- `e2e-smoke-lite` runtime: ~33s
- `e2e-smoke-full` runtime: ~143s
- `contoso-chat` image size (`INSTALL_LOCAL_STACK=0`): ~356 MB (`356002891` bytes)
- `contoso-chat` image size (`INSTALL_LOCAL_STACK=1`): ~714 MB (`713665560` bytes)
- `contoso-web` image size: ~1.21 GB (`1211753576` bytes)

Current enforced budgets:

- Lite profile: duration <= `420s`, chat <= `2.5GB`, web <= `1.5GB`
- Full profile: duration <= `600s`, chat <= `2.0GB`, web <= `1.5GB`

## Failure Triage

If smoke fails:

1. inspect `e2e-compose.log` artifact from CI
2. check `db` startup and chat dependency health output
3. rerun locally with stack retained:
   `make e2e-smoke KEEP_STACK=1`
   (or `make e2e-smoke-lite KEEP_STACK=1` for contract-only validation)
4. inspect services:
   `docker compose ps`
   `docker compose logs --no-color db chat web`
5. retry smoke only:
   `python scripts/e2e_smoke.py --web-url http://127.0.0.1:3000 --chat-url http://127.0.0.1:8000`

For full-profile failures:

1. inspect `e2e-full-compose.log`, `e2e-full-metrics.txt`, `e2e-full-metrics-summary.md`, and `e2e-full-alert-state.md` artifacts
2. look for `warning=` lines in metrics output to identify budget class
3. rerun locally with:
   `make e2e-smoke-full KEEP_STACK=1`
4. if dependency install is slow/failing, inspect chat build logs for `requirements-local.txt` packages
5. if chat fails fast during startup in local-provider mode, verify:
   `CHAT_INSTALL_LOCAL_STACK=1`, `OLLAMA_BASE_URL=http://host.docker.internal:11434`, `ollama serve`, and `ollama pull <LOCAL_MODEL_NAME>`
6. if chat starts but request path fails, verify `LLM_PROVIDER`/local-provider envs and optional dependency imports

## Common Failure Classes

1. `chat dependency health (db)` timeout:
   DB not reachable from chat container or Prisma client cannot connect.
2. `web -> chat proxy call` non-200:
   web route cannot reach chat endpoint or chat returned upstream error.
3. missing `answer`/`response` field:
   response contract drift between web consumer and chat provider.
4. full-profile dependency install timeout/failure:
   heavy optional dependencies (`torch`, `chromadb`, `sentence-transformers`) failed or exceeded budget.
