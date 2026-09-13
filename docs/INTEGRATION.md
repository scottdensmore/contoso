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

Full chat dependency profile (`CHAT_INSTALL_LOCAL_STACK=1`):

```bash
make e2e-smoke-full
```

What it does:

1. starts `db`, `chat`, and `web` with Docker Compose
2. waits for chat health (`/health`)
3. verifies chat database dependency health (`/health/dependencies`)
   and fails immediately if `local_provider.enabled=true` with `local_provider.ready=false`
4. sends a web proxy request to `/api/chat/service`
5. validates the response contract (`answer` or `response` string) and rejects
   the chat service's degraded replies (see below)
6. tears down the stack (unless `KEEP_STACK=1`)

Keep the stack running for manual debugging:

```bash
make e2e-smoke KEEP_STACK=1
```

### Degraded chat replies

Chat answers `200` with a populated `answer` on both of its failure paths, so a
non-empty answer is not evidence that chat works. The service labels them, and
the smoke treats the two differently:

- `mock: true` means `contoso_chat` failed to import. Detecting it needs no
  credentials, so it **always fails** the smoke — this is what catches a broken
  image or an undeclared dependency.
- `fallback: true` means chat raised. That is the expected outcome wherever the
  datastore is unconfigured, including CI, so it passes with a warning in the
  job summary rather than failing.

Where chat is expected to answer for real, make the second case fail too:

```bash
make e2e-smoke E2E_REQUIRE_REAL_CHAT=1
```

Pass it on the command line as above, or export it. Putting it in `.env` has no
effect: `.env` is read by Docker Compose for the containers, and the smoke
script runs outside them.

Enable local LLM/vector stack in chat image when needed:

```bash
make e2e-smoke CHAT_INSTALL_LOCAL_STACK=1
```

## End-to-end journeys

`scripts/e2e_smoke.py` checks that routes respond. The Playwright journeys in
`apps/web/e2e/` check that they *work* — a page can return 200 while every
image on it 404s, or while no seeded account can sign in.

They run against a stack that is already up, so bring one up first:

```bash
make e2e-smoke KEEP_STACK=1     # leaves db + chat + web running
make test-e2e                    # then drive the journeys against it
```

Point them elsewhere with `E2E_BASE_URL`:

```bash
make test-e2e E2E_BASE_URL=http://127.0.0.1:3300
```

First run needs the browser:

```bash
make -C apps/web install-e2e-browsers
```

Journeys run after smoke brings up the stack with `KEEP_STACK=1`. Traces
and screenshots for a failed journey are saved locally in `apps/web/test-results/`.

Retries are deliberately off. A retried failure is a failure that gets
ignored; if a journey is flaky, that is a finding to chase rather than
something to absorb.

## Profile Selection

- `e2e-smoke-lite`: default for PRs and fast contract validation.
- `e2e-smoke-full`: validates container builds and smoke verification with the full chat dependency profile installed (`CHAT_INSTALL_LOCAL_STACK=1`), rather than selecting `LLM_PROVIDER=local`.

## Integration Verification Workflow

Integration verification runs locally via Make and Docker Compose (GitHub Actions workflows are disabled to preserve action minutes):

### Fast Contract Verification (Lite Profile)

```bash
make e2e-smoke-lite KEEP_STACK=1
make test-e2e
docker compose down
```

Behavior:

1. builds `contoso-web` and `contoso-chat` images locally with Docker Compose
2. boots `db`, `chat`, and `web` containers
3. verifies `/health` and `/health/dependencies`
4. validates web proxy and response contract (`answer` or `response` string)
5. executes Playwright end-to-end journey tests against the running stack
6. enforces smoke budgets (duration <= 420s, chat image <= 2.5GB, web image <= 1.5GB)
7. tears down the stack

### Full Chat Profile Verification

```bash
make e2e-smoke-full KEEP_STACK=1
make test-e2e
docker compose down
```

Behavior:

1. builds `contoso-chat` with the full dependency profile (`CHAT_INSTALL_LOCAL_STACK=1`)
2. boots the stack and gates on `local_provider.ready=true` when configured
3. enforces full-profile budgets (duration <= 600s, chat image <= 2.0GB, web image <= 1.5GB)
4. executes full Playwright journeys against the stack

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

1. check `db` startup and chat dependency health output in console logs
2. rerun locally with stack retained:
   `make e2e-smoke KEEP_STACK=1`
   (or `make e2e-smoke-lite KEEP_STACK=1` for contract-only validation)
3. inspect services:
   `docker compose ps`
   `docker compose logs --no-color db chat web`
4. retry smoke only:
   `python scripts/e2e_smoke.py --web-url http://127.0.0.1:3100 --chat-url http://127.0.0.1:8100`

For full-profile failures:

1. inspect compose logs: `docker compose logs --no-color chat`
2. rerun locally with:
   `make e2e-smoke-full KEEP_STACK=1`
3. if dependency install is slow/failing, inspect chat build logs for `requirements-local.txt` packages
4. if chat fails fast during startup in local-provider mode, verify:
   `CHAT_INSTALL_LOCAL_STACK=1`, `OLLAMA_BASE_URL=http://host.docker.internal:11434`, `ollama serve`, and `ollama pull <LOCAL_MODEL_NAME>`
   then run `make local-provider-check` to confirm prerequisites
   and `make diagnose-chat-local` for full local diagnostics
5. if chat starts but request path fails, verify `LLM_PROVIDER`/local-provider envs and optional dependency imports

## Common Failure Classes

1. `chat dependency health (db)` timeout:
   DB not reachable from chat container or Prisma client cannot connect.
   For fresh local Docker volumes, run `make docker-init-fresh` before retrying.
2. `web -> chat proxy call` non-200:
   web route cannot reach chat endpoint or chat returned upstream error.
3. missing `answer`/`response` field:
   response contract drift between web consumer and chat provider.
4. full-profile dependency install timeout/failure:
   heavy optional dependencies (`torch`, `chromadb`, `sentence-transformers`) failed or exceeded budget.
5. `image optimizer hang / wedged variant` (#270):
   Next.js image optimizer can hang indefinitely on specific `(image, width)` variants if `.next/cache/images` is deleted under a running container or if concurrent test runners execute against the same container simultaneously.
   Symptom: requests to `/_next/image?url=...` hang with HTTP 000 / timeout while neighbouring variants return HTTP 200 in milliseconds.
   Recovery: `docker compose restart web`.
   Prevention: do not mutate or delete the image cache directory in a running container, and avoid running parallel end-to-end suites against the same composed stack.
