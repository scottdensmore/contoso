# AGENTS.md — contoso Contributor & Agent Guide

Working agreement for coding agents and humans contributing to this repository.
This file is the single source of truth for project commands, architecture,
and review criteria.

## Project overview

- **Description**: contoso — a Next.js storefront and a FastAPI chat service
  sharing one Prisma data model.
- **Stack / Toolchain**: TypeScript / Next.js (npm workspace) and Python 3.11 /
  FastAPI. Node 22 and Python 3.11 are pinned in `mise.toml`.
- **Runtime surfaces**: `apps/web/` (Next.js UI and API routes) and
  `services/chat/` (FastAPI chat service).
- **UI Domain**: Responsive web, WCAG AA.
- **Base Branch**: `main`.

## Source of truth

Keep exactly one physical `AGENTS.md`: this repository-root file. Coding agents
and contributors read the root guide, so nested runbooks would create
conflicting rules.

Assistant-specific context files are root pointers only:

| Assistant | Pointer |
|---|---|
| Claude Code | `CLAUDE.md` |
| Gemini CLI | `GEMINI.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |

Never add instructions to a pointer file. Move appended notes into this file.

## Delivery default

A request to change or build something includes the reversible delivery lifecycle
unless the user explicitly asks for a local-only stopping point: create a dedicated
branch, verify and review the change, commit it, push the branch, open a ready pull
request, and monitor its checks. The user does not need to repeat "publish the PR"
for those steps.

This does not authorize merging, force-pushing, rewriting shared history,
deleting branches or tags, publishing a release, deploying, or changing durable
data; those still require explicit approval in the current conversation.

## Repo Map

| Area | Location and contract |
|---|---|
| Web routes and API handlers | `apps/web/src/app/` |
| Web presentation | `apps/web/src/components/` |
| Web domain helpers and API clients | `apps/web/src/lib/` |
| Web tests | Beside source as `*.test.ts` / `*.test.tsx`; journeys in `apps/web/e2e/` |
| Chat entry point | `services/chat/src/api/main.py` |
| Chat domain code | `services/chat/src/api/contoso_chat/` |
| Chat evaluators | `services/chat/src/api/evaluators/` |
| Chat tests | `services/chat/tests/unit/` |
| Shared data model | `apps/web/prisma/schema.prisma` and migrations under `apps/web/prisma/` |
| Cross-surface smoke | `scripts/e2e_smoke.py`, exercised by `make e2e-smoke` |
| Repository guard tests | `tests/scripts/` |
| Deployment | `infrastructure/`, `Dockerfile*`, and `docker-compose.yml` |

Command surfaces are layered: the root `Makefile` delegates to
`apps/web/Makefile` and `services/chat/Makefile`. Root `package.json` scripts are
thin wrappers over the same make targets. Prefer make targets.

## Development Commands

Run from the repository root.

| Stage | Command |
|---|---|
| Bootstrap | `make bootstrap` |
| Dev stack | `make dev` |
| Web only | `make dev-web` |
| Chat only | `make dev-chat` |
| Web lint / type check | `make lint` / `make typecheck` |
| Chat lint / type check | `make -C services/chat lint` / `make -C services/chat typecheck` |
| Unit and component tests | `make test` |
| Repository guard tests | `make test-scripts` |
| Production web build | `make build` |
| Changed-surface iteration | `make quick-ci-changed` |
| Web merge gate | `make -C apps/web ci` |
| Chat merge gate | `make -C services/chat ci` |
| Complete gate | `make ci` |
| Browser journeys | `make test-e2e` (running stack and browser required) |
| Dockerized integration | `make e2e-smoke` |

`make ci` expands to `quick-ci` (toolchain and environment contracts, web
lint/type-check/tests, chat dependency policy/lint/type-check/tests), then
`test-scripts`, and `build`. CI's `full-ci-main` job runs
`make ci PYTHON_BASE=python`. A green gate exits 0; it proves only the checks in
that command. In particular, `make ci` does not run Playwright journeys or the
Dockerized smoke.

Root `make lint` and `make typecheck` cover the web app only. Chat linting and
type-checking are reached through `make quick-ci-chat`,
`make -C services/chat ci`, or `make ci`.

## Local Setup

- Run `mise install`, then `make toolchain-doctor` if the pinned tools are not
  already available.
- Use the single repository virtualenv at `.venv`. Make targets create it and
  invoke `.venv/bin/python` directly; there is nothing to activate. Never install
  project dependencies into a system or mise Python.
- `make bootstrap` installs web and chat dependencies. `make setup` installs web
  dependencies only, while `npm run setup` installs both surfaces.
- Copy `.env.example` to `.env` and `services/chat/.env.example` to
  `services/chat/.env`. `config/env_contract.json` and `docs/ENV_CONTRACT.md`
  define the required keys. Never copy real secret values into this guide.
- Local chat commonly uses `LLM_PROVIDER=local`,
  `OLLAMA_BASE_URL=http://localhost:11434`, and
  `ALLOWED_ORIGINS=http://localhost:3100`. Dockerized chat reaches Ollama at
  `http://host.docker.internal:11434`.
- Playwright browsers are separate from bootstrap. Install them with
  `make -C apps/web install-e2e-browsers` when journeys require one.

## Architecture & Conventions

- **Two runtime surfaces, one API contract.** Treat
  `apps/web/src/app/api/chat/*`, `apps/web/src/lib/messaging.ts`, and the FastAPI
  request/response models as one contract. Validate inputs on both sides and
  update success, validation, degraded, and error shapes together.
- **One data model, two access layers.** Prisma's schema and migrations are the
  source of truth. The web app uses Prisma 7 with `DATABASE_URL` in
  `apps/web/prisma.config.ts` and a `PrismaPg` adapter passed to every
  `PrismaClient`. The chat service uses handwritten `asyncpg` SQL in
  `services/chat/src/api/db.py`; schema changes must update affected SQL and
  exercise the real migration/query path.
- **Keep web layers separate.** Route handlers and pages belong in
  `apps/web/src/app/`, reusable domain logic in `apps/web/src/lib/`, and
  presentation in `apps/web/src/components/`.
- **Keep database-backed routes dynamic.** Production builds set
  `NEXT_BUILD_SKIP_DB=1`; a route that reads the database must not bake an empty
  build-time response into the deployed application.
- **Keep optional chat dependencies optional.** Core chat paths must not import
  local-LLM/vector dependencies unless the full profile is selected. Requirement
  files carry package names; versions are pinned in `services/chat/constraints.txt`.
- **Use strict boundaries in TypeScript.** Accept `unknown` at application
  boundaries and validate or narrow it. Avoid `any`, broad assertions, and
  mutating React state. Prefer functions and plain objects when instance identity
  or lifecycle is unnecessary.
- **Keep rendering pure.** Use functional components and Hooks. Effects
  synchronize with external systems; derive values during render or event
  handlers otherwise. Clean up subscriptions and include dependencies read by an
  effect. Add memoization only for referential identity or measured performance.
- **Guard effective behavior.** Repository tests must exercise the output they
  claim to protect. Mutation demonstrations use fixture trees, prove the fixture
  was opened, and show the guard fail before restore. Rebind every imported path
  constant the assertion dereferences and clear stale `__pycache__` when a
  same-size, same-mtime mutation could reuse bytecode.
- **Responsive and accessible.** Exercise user-visible changes at phone, tablet,
  and desktop sizes. Changes to `srcset` or source dimensions also need a 2x
  density pass; density is a browser-context property, not another viewport.
- Use hyphens rather than underscores in command-line flag names. Write comments
  only when they preserve reasoning that the code cannot make obvious.

## Code Review Rules

- Treat seams as one contract: web/chat payloads, Prisma schema/handwritten SQL,
  dependency manifests/constraints, and container inputs/runtime files must be
  inspected and validated together.
- Require guards and reviews to measure effective behavior, not nearby
  declarations. Reject vacuous fixtures and claims about rendered output,
  accessibility, resolved files, or tool behavior that were never exercised.
- For UI, runtime, and container changes, verify the shipped surface. Source
  inspection and unit tests cannot prove rendered interaction, image density,
  container contents, deployed startup, or end-to-end integration.

## Gotchas & Troubleshooting

- A broken or wrong-version virtualenv: remove `.venv`, then run `make venv`.
  Missing chat imports after web-only setup require `make setup-chat`.
- Prisma 7 requires a `PrismaPg` adapter. Constructing `PrismaClient` without one
  fails at runtime.
- Local checks build a fresh database and cannot prove a destructive migration is
  safe for populated data or an older serving revision. Use expand/contract
  releases for dropped/renamed columns, narrowed types, and new `NOT NULL` fields.
- `make test-e2e` follows `E2E_BASE_URL`; `make e2e-smoke` always probes
  `127.0.0.1:3100` and `:8100`. Free the default ports before smoke so it cannot
  report green against unrelated containers.
- `make e2e-smoke` removes containers and volumes unless `KEEP_STACK=1`. Tear down
  a retained stack at the end with `make down` or
  `docker compose down --volumes`.
- Vitest excludes `e2e/**`; Playwright specs otherwise match Vitest's default glob
  and fail on `@playwright/test` imports.
- Web type-checking is two `tsc` passes (`tsconfig.json` and
  `tsconfig.e2e.json`) plus journey coverage. Bare `npx tsc --noEmit` misses the
  journeys.
- `next dev` may rewrite generated web files. `agentRules: false` in
  `apps/web/next.config.js` prevents it from appending generated instructions to
  an `AGENTS.md`.
- A sandbox-only `listen EPERM`, package-download timeout, or Docker/port failure
  can be environmental. Report the exact command and error rather than changing
  code to accommodate an unproven environment problem.
- Local-provider startup requires a running Ollama and a pulled model. Use
  `make local-provider-check` or `make diagnose-chat-local` before debugging the
  request path.
- Full-profile smoke artifacts are `e2e-full-compose.log`,
  `e2e-full-metrics.txt`, `e2e-full-metrics-summary.md`,
  `e2e-full-dependencies-health.json`, and `e2e-full-alert-state.md`.
- A rendering dependency bump (`tailwindcss`, `next`, `react`, `postcss`, or a UI
  library) is UI-affecting even when no component file changes.

## Verification Map

`scripts/detect_changed_surfaces.py` decides which surfaces a change touches.
Use it to scope iteration:

```bash
CHANGED_BASE=<base-sha> CHANGED_HEAD=<head-sha> make quick-ci-changed
```

It prints iteration targets, not this table's merge gates. For every row below
that says *complete gate* it prints the `quick-ci` set — no `build` — so it under-covers exactly the rows with the most to lose. Match your change to
a row and run that row's gate yourself.

| A fix touches | Rerun |
|---|---|
| `apps/web/**`, `Dockerfile` | `make -C apps/web ci`, `make test-scripts` |
| `services/chat/**`, `Dockerfile.migrate` | `make -C services/chat ci`, `make test-scripts` |
| `apps/web/prisma/**`, `apps/web/prisma.config.ts` | both surface gates and `make test-scripts` |
| `docs/**`, `README.md`, root `AGENTS.md` / `CLAUDE.md` / `GEMINI.md`, `CONTRIBUTING.md`, `.github/copilot-instructions.md` | `make test-scripts` |
| `docker-compose.yml` | complete gate |
| `Makefile`, `mise.toml`, `package.json`, web dependency manifests | complete gate |
| environment contract/templates/docs | complete gate |
| `scripts/*.py`, `tests/scripts/**` | complete gate |
| chat dependency manifests | complete gate |
| GitHub workflows, dependency policy, CODEOWNERS, or PR/issue templates | complete gate |
| anything else | complete gate |

Rows accumulate; they are not first-match. A Prisma change is both web and chat,
and `make test-scripts` runs for every non-empty change. `quick-ci-web` and
`quick-ci-chat` are iteration targets, not merge gates. The complete gate must
run once on the state that enters code review.

