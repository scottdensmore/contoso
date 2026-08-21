# AGENTS.md — contoso Contributor & Agent Guide

Working agreement for coding agents and humans contributing to this repository.
This file is the single source of truth for project commands, architecture,
review criteria, and workflow.

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

Keep exactly one physical `AGENTS.md`: this repository-root file. The generated
reviewers read the root guide, so nested runbooks would create rules that review
stages do not see.

Assistant-specific context files are root pointers only:

| Assistant | Pointer |
|---|---|
| Claude Code | `CLAUDE.md` |
| Gemini CLI | `GEMINI.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |

Never add instructions to a pointer file. Move appended notes into this file,
then run `make agent-docs-check FIX=1` to restore the canonical pointer.

`.agents/agent-skills.json` inventories the workflow assets installed under
`.agents/`, `.claude/`, `.codex/`, `.cursor/`, and `.github/agents/`. Treat every
listed file as generated output: do not hand-edit it, and do not keep a divergent
copy. `tests/scripts/test_agent_definitions.py` fails if a listed file is missing,
or if an agent or skill file exists that the manifest does not list. It does not
compare content: a hand-edit passes the gate, then gets backed up and overwritten
the next time the assets are regenerated.

## Delivery default

A request to change or build something includes the reversible delivery lifecycle
unless the user explicitly asks for a local-only stopping point: create a dedicated
branch, verify and review the change, commit it, push the branch, open a ready pull
request, and monitor its checks. The user does not need to repeat "publish the PR"
or "follow the workflow" for those steps.

This project-specific default overrides the generic stopping-point language in the
managed workflow and `slice-and-pr` skill for branch pushes and pull-request
creation. It does not authorize merging, force-pushing, rewriting shared history,
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
| Generated workflow assets | Paths listed in `.agents/agent-skills.json`; generated, never hand-edited |

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
| Documentation merge gate | `make docs-check` |
| Complete gate | `make ci` |
| Browser journeys | `make test-e2e` (running stack and browser required) |
| Dockerized integration | `make e2e-smoke` |

`make ci` expands to `quick-ci` (toolchain and environment contracts, web
lint/type-check/tests, chat dependency policy/lint/type-check/tests), then
`test-scripts`, `build`, and `docs-check`. CI's `full-ci-main` job runs
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
that says *complete gate* it prints the `quick-ci` set — no `build`, no
`docs-check` — so it under-covers exactly the rows with the most to lose. Only a
change to the generated workflow assets makes it print `ci`. Match your change to
a row and run that row's gate yourself.

| A fix touches | Rerun |
|---|---|
| `apps/web/**`, `Dockerfile` | `make -C apps/web ci`, `make test-scripts` |
| `services/chat/**`, `Dockerfile.migrate` | `make -C services/chat ci`, `make test-scripts` |
| `apps/web/prisma/**`, `apps/web/prisma.config.ts` | both surface gates and `make test-scripts` |
| `docs/**`, `README.md`, root `AGENTS.md` / `CLAUDE.md` / `GEMINI.md`, `CONTRIBUTING.md`, `.github/copilot-instructions.md` | `make docs-check`, `make test-scripts` |
| `.agents/**`, `.claude/agents/**`, `.claude/skills/**`, `.codex/agents/**`, `.cursor/agents/**`, `.github/agents/**` | complete gate |
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

<!-- agent-skills:begin workflow 185672e4 — managed block, edits here are overwritten -->
## Development Workflow

Follow these stages in order (governed by the global `agent-workflow-skills`). Scale the pipeline to the
size of the change using the triage table — skipping a stage is a decision to
state out loud, never a shortcut taken silently. A stage in parentheses applies
only when its own entry says it does.

| Track | When | Stages |
|---|---|---|
| **Trivial** | Docs, comments, typos, config with no logic change | 1 → 6 → 9 |
| **Single fix** | One bug or small change with a clear, contained cause | 1 → 2 → 5 → 6 → (7) → 8 → 9 |
| **Feature** | New behavior, several files, or an architectural choice | All stages; repeat 5–8 per slice |

**Division of labor.** The main agent runs only focused checks — the single test
it just wrote, a formatter over the files it just touched. Whole suites, builds,
dependency audits, and repository-wide lint go to the **`verifier`** subagent;
reviews go to **`code-reviewer`** and **`ui-reviewer`**. Each follows the skill
of the same job (`verifier`, `code-review`, `ui-review`), reads this file for
what the project's commands and criteria are, and is declared without
file-editing tools — a read-only sandbox where the host supports one. This is
not ceremony: it keeps routine command output out of the implementation context,
and it means each gate is read by something that has not already convinced
itself the change is correct. If a subagent is unavailable, run the stage
inline against the same skill and say that you did.

**Stages end.** Every delegated stage returns a verdict, and a verdict is acted
on once. Fix what came back, then rerun only the stage whose inputs your fix
touched. If the same finding survives two attempts, stop and report it with what
you tried — do not loop. Never rerun a stage against a state it has already
seen; an unchanged tree yields an unchanged verdict.

**Preserve what you did not change.** A worktree may hold work that is not yours.
Never stage, revert, or "clean up" a change you did not make; when something
unrelated is in the way, name it and leave it alone.

**Claim only what you observed.** A gate licenses a statement about exactly
what it measured and nothing more: a green build says the code compiles, not
that the feature works; a passing test says that test passed, not that the bug
is gone. If you did not run it, say you did not. "I believe this fixes it" is a
usable sentence; "fixed and verified" without a command and its output is not.

**Say what you assumed.** When a choice would change what gets delivered and the
request does not settle it, ask before building rather than after. When it is
too small to be worth asking, decide, and write the assumption where a reviewer
will see it. An assumption nobody can see is indistinguishable from a mistake.

**Instructions are part of the change.** When a command, a behavior, or a
constraint changes, the file that documents it changes in the same commit —
`AGENTS.md`, the Verification Map, the README, whichever is now wrong. Stale
instructions are worse than missing ones, because the next agent follows them
confidently.

1. **Inspect & Branch**: Inspect `git status`, the current branch, and every
   applicable instruction file before touching anything. Note unrelated staged,
   unstaged, and untracked work so you can preserve it. Fetch the base branch
   (`git fetch origin main`) and create a dedicated branch:
   `git checkout -b <owner>/<type>/<short-description> origin/main`.
   `<owner>` is your GitHub login (`gh api user --jq .login`); `<type>` is one of
   `feat`, `fix`, `refactor`, `chore`, `test`, `docs`. Never commit to `main`.
2. **Plan & Slice (`plan-and-prototype`)**:
   - **Read before you plan.** Open the code the change will touch, its tests, and
     its call sites. A plan written without reading them is a guess about a
     codebase rather than a plan for this one.
   - Formulate a clear step-by-step plan before writing code. Define the smallest
     end-to-end slice that can be reviewed, tested, and shipped independently; if
     the work is too large for one pull request, order the slices and complete only
     the current one.
   - **A slice is vertical, not horizontal.** It goes through every layer of one
     narrow thing and ends in something you can actually verify: "add the new field
     end to end, with tests" is a slice; "rename the field everywhere" is a sweep.
     One concern per branch — if a change spans unrelated concerns, that is two
     branches.
   - **A new dependency is an architectural decision, not an implementation
     detail.** Say what it replaces, why writing that yourself is the worse option,
     and what its license and maintenance status are. Adding one silently is how a
     project acquires a liability nobody chose.
3. **Prototype Options (if needed)**: When facing architectural choices, unfamiliar
   APIs, or UX alternatives, spike lightweight prototypes and compare trade-offs
   before committing to an approach.
4. **Track Bugs & Follow-ups**: When bugs, edge cases, technical debt, or follow-up
   tasks surface mid-change, file them immediately (`gh issue create`, the project's
   tracker, or `ISSUES.md` when none is configured) instead of expanding the current
   slice.
5. **Test-Driven Development (`tdd-workflow`)**:
   - Write/update a focused test first → confirm it fails for the expected reason →
     minimal implementation → iterate until passing → refactor. A test that passes
     before the code exists is testing the wrong thing.
   - **When the change replaces an existing contract, find the tests pinning the old
     one first.** A new failing test proves the new behavior is missing; it says
     nothing about tests still asserting the behavior being removed. Search for
     assertions on the symbol, attribute, label, or role being changed and update
     them inside the same red/green loop. Skipping this is silently safe — the new
     test goes green, the loop looks complete, and the contradiction only surfaces a
     full gate cycle later.
   - **A test that has never failed is not evidence of anything.** When you add a
     regression detector, break the thing it guards and confirm it catches it, then
     put it back. A detector that cannot be shown to fire is decoration.
   - Run only the test you authored or changed, filtered by file and name. Whole
     suites are stage 6's job.
   - Pure logic (calculations, state machines, business rules) must be unit-tested.
     Non-testable areas (rendering, audio) must be visually/interactively verified.
6. **Verification (`verifier` subagent → `verifier` skill)**:
   - Run the project's full gate: lint, type-check, test suites, build. Focused runs
     from stage 5 do not substitute for it.
   - **Know what green looked like before you started.** If you do not know the
     gate passed on the state you began from, establish that first. Without it a
     failure is ambiguous — you cannot tell what you broke from what you inherited,
     and every later decision rests on that distinction.
   - **Measure the thing you ship, not a proxy for it.** A gate that checks part of
     the output, or a stand-in for it, reads exactly like one that checks all of it
     — and certifies the rest by silence. If a command covers less than it appears
     to, say what it left out.
   - The subagent runs and reports; fixing is yours. Resolve every actionable
     finding before code review. When a fix changes code, rerun the affected focused
     tests, then ask for only the gate commands whose inputs the fix touched — see
     **Verification Map** below if this project defines one. The complete gate must
     run in full at least once on the state that enters code review.
   - Some findings are environmental and no code change resolves them (browsers that
     will not install, no network, a missing credential). Resolving those means
     naming them precisely — what ran, what did not, and why — not retrying them.
7. **UI Review (`ui-reviewer` → `ui-review`)**:
   - Runs after verification, so the tree builds before anyone looks at it.
   - **Check whether this stage applies before delegating.** It applies only when
     the change can alter something a person sees or interacts with. A change
     confined to documentation, comments, configuration, build scripts, CI, tests,
     or code with no rendered output does not qualify — skip the stage, record one
     line saying which of those it was, and move on. A docs-only or test-only diff
     never needs a UI review.
   - When it does apply, audit layout, visual hierarchy, contrast (WCAG AA),
     interaction states, and accessibility according to the project's UI domain.
   - A project whose UI domain is headless or backend skips this stage every time.
   - Never invent findings to justify the stage, and never describe an appearance
     that was not observed running.
8. **Code Review (`code-reviewer` → `code-review`)**:
   - The reviewer reads the complete change: `git diff origin/main...HEAD`,
     plus staged and unstaged edits (`git diff HEAD`) and untracked files (`git
     status --porcelain`). It reports; it does not edit. **You** remove the
     accidental or unrelated edits it names, and preserve anything that is the
     user's.
   - Enforce architectural boundaries, language idioms, defensive error handling,
     and zero committed secrets.
   - Do not repeat this review on an unchanged state. Rerun it only when the
     reviewed content actually changed.
9. **Commit & PR Lifecycle (`slice-and-pr`)**:
   - **Close the loop against the request.** Re-read what was actually asked for,
     and state how this change satisfies it — and what it deliberately does not.
     Every gate above proves the code works; none of them prove it is the thing
     that was wanted. A green pipeline on the wrong feature is the most expensive
     outcome available.
   - Commit using Conventional Commits (`<type>(<scope>): <summary>`). Stage files
     explicitly; never `git add -A` when unrelated work is present.
   - **Match the stopping point to the request.** A request that only asks to
     commit stops after the local commit. A request that asks to use, follow, or
     complete the workflow—including "commit based on the workflow"—includes the
     reversible remote steps: push the branch, open the PR, and watch its checks.
     It does not authorize a merge or any action named under **Stop there and
     report**.
   - Open the PR with `gh pr create` and watch CI with `gh pr checks --watch`.
   - **The description carries the evidence.** Say why the change exists, what it
     changes grouped by concern rather than by file, and how it was tested — the
     command you actually ran and its actual result. "Should work" is not a test
     result. If a test was added, say what it would have caught.
   - **Stop there and report.** Anything you cannot take back needs explicit
     approval from the user in the current conversation: merging (`gh pr merge`),
     force-pushing, rewriting shared history, deleting a branch or tag, dropping
     or migrating data, removing files wholesale, and publishing or deploying.
     Approval for one of them is not approval for the next.
   - **Squash, unless this project says otherwise.** One reviewed slice lands as
     one commit on the base branch. The false starts, the fixups and the "address
     review" commits are how the work got made, not what it is; keeping them turns
     the base branch's history into a diary and makes a revert an archaeology
     exercise. Because the PR description is what survives, it has to carry the
     reasoning — see above. A project that requires merge commits or a rebase says
     so in its own section, and that wins.
   - **A merge takes its branch with it.** Once a merge is approved and done,
     delete that branch — remote and local, in the same step. It is the one
     deletion the merge approval covers, because it is the merge finishing rather
     than a separate act; no other branch is included. A merged branch left
     behind is a decoy: it looks like work in flight, and the next person cannot
     tell it from the real thing without checking.
   - Verify before deleting, and be aware of the squash case: a squash merge
     writes a new commit rather than joining histories, so git sees no ancestry
     and `git branch -d` refuses a branch whose every line is already merged.
     Confirm with `git diff <base> <branch>` — empty output means nothing is
     lost — and then `-D` is correct rather than reckless. If that diff is *not*
     empty, stop: something did not make it in.
<!-- agent-skills:end workflow -->
