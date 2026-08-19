# AGENTS.md — contoso Contributor & Agent Guide

Working agreement for coding agents (Antigravity, Gemini CLI, Claude Code,
Cursor, Copilot, Codex, or humans) contributing to this repository. This file is
the single source of truth for the project contract and conventions. Tool-specific
files such as `CLAUDE.md` point here rather than duplicating these rules.

## Project overview

- **Description**: contoso — a Next.js storefront and a FastAPI chat service
  sharing one Prisma data model.
- **Stack / Toolchain**: TypeScript / Next.js (npm workspaces) + Python 3.11 /
  FastAPI. Node `22`, Python `3.11`, both pinned in `mise.toml`.
- **Runtime surfaces**: `apps/web/` (Next.js UI + API routes),
  `services/chat/` (FastAPI chat service).
- **UI Domain**: Web (responsive browser UI, WCAG AA).
- **Base Branch**: `main`

Command surfaces are layered: root `Makefile` delegates to `apps/web/Makefile`
and `services/chat/Makefile`; root `package.json` scripts are thin wrappers over
the same make targets. Prefer make targets — the npm scripts add nothing but a
second spelling.

## Development Commands

Run from the repository root.

| Stage | Command |
|---|---|
| Bootstrap (one command) | `make bootstrap` |
| Dev Server (web + db/chat in Docker) | `make dev` |
| Dev Server (web only) | `make dev-web` |
| Dev Server (chat only) | `make dev-chat` |
| Lint | `make lint` (web) · `make -C services/chat lint` (chat) |
| Type Check | `make typecheck` (web) · `make -C services/chat typecheck` (chat) |
| Unit / Component Tests | `make test` (web + chat) |
| Repo tooling guard tests | `make test-scripts` |
| Build | `make build` (web production build) |
| Fast iteration loop | `make quick-ci-changed` |
| Merge gate — web | `make -C apps/web ci` |
| Merge gate — chat | `make -C services/chat ci` |
| Merge gate — docs | `make docs-check` |
| Complete gate | `make ci` |
| End-to-end journeys | `make test-e2e` (needs a running stack + browser) |
| Dockerized smoke | `make e2e-smoke` |

Root `make lint` and `make typecheck` cover the **web app only** — they delegate
to `apps/web`. Chat linting and type-checking reach you through
`make quick-ci-chat`, `make -C services/chat ci`, or `make ci`, not through the
root `lint`/`typecheck` targets.

`make ci` is the complete gate and expands to: `quick-ci` (toolchain-doctor,
env-contract-check, web lint/typecheck/test, chat deps-check/lint/typecheck/test)
→ `test-scripts` → `build` → `docs-check`. CI's `full-ci-main` job runs exactly
`make ci PYTHON_BASE=python`.

## Architecture & Conventions

- **Two runtime surfaces, one contract.** `apps/web/src/app/api/chat/*` and
  `services/chat/src/api/*` are two halves of the same payload contract. A change
  to either is a change to both — inspect and validate both sides.
- **Nested runbooks win locally.** A nested `AGENTS.md` adds authoritative rules
  for its subtree. Apply the root file plus every nested one from the root down to
  the file closest to the work. JavaScript/TypeScript and React conventions live
  in `apps/web/AGENTS.md`, not here.
- **Separate route handlers, domain logic, and presentation.** Web pages and API
  routes in `apps/web/src/app/`, shared helpers and domain logic in
  `apps/web/src/lib/`, presentation in `apps/web/src/components/`.
- **Validate inputs at boundaries** using schemas, on both the web and chat sides
  of a call.
- **All Python runs from the single `.venv` at the repo root.** Make targets create
  it on demand and call `.venv/bin/python` directly — there is nothing to activate.
  Never install project Python dependencies into a system or `mise` interpreter.
- **Responsive and accessible.** The web surface is checked at phone, tablet, and
  desktop viewports; ESLint runs `jsx-a11y/recommended`, so accessibility
  regressions fail lint rather than review.
- **Guards must measure effective behavior**, not a nearby declaration. A test that
  asserts on configuration while claiming to cover rendered output is a failing
  test that passes.
- Keep generated artifacts and local runtime outputs out of commits.

## Gotchas & Troubleshooting

- Toolchain mismatch: run `mise install`, then `make toolchain-doctor`.
- Virtualenv missing, broken, or on the wrong Python: run `rm -rf .venv && make venv`.
- `ModuleNotFoundError` for a chat dependency: you are probably outside the venv —
  re-run through `make`, or use `.venv/bin/python`. If you are inside it, the chat
  dependencies were never installed: `make setup` covers web only, so run
  `make setup-chat`.
- `make setup` and `npm run setup` are **not** the same command. `make setup`
  installs web dependencies only; `npm run setup` runs `setup:web` then
  `setup:chat`. Use `make bootstrap` for both through make.
- Playwright journeys fail with a missing browser: run
  `make -C apps/web install-e2e-browsers`, then rerun `make test-e2e`. Neither
  `make setup` nor `make bootstrap` installs it.
- Env contract drift: run `make env-contract-check` and update
  contract/templates/docs together.
- Docs link drift (including root runbooks): run `make docs-check`.
- Agent doc drift (a `CLAUDE.md`, `GEMINI.md`, or
  `.github/copilot-instructions.md` gained content): move the flagged lines into
  the matching `AGENTS.md`, then run `make agent-docs-check FIX=1`.
- Release guardrail failure: run `make release-dry-run` and fix missing guardrail files.
- E2E smoke failure: run `make e2e-smoke KEEP_STACK=1`, then inspect `docker compose logs`.
- Need local LLM/vector dependencies in the Docker chat image: rerun with
  `CHAT_INSTALL_LOCAL_STACK=1`. In Python chat setup: `make setup-chat-full`.
- Local-provider startup preflight fails (`LLM_PROVIDER=local`): start Ollama
  (`ollama serve`), pull the model (`ollama pull <LOCAL_MODEL_NAME>`), and for
  dockerized chat use `OLLAMA_BASE_URL=http://host.docker.internal:11434`.
- One-command local-provider preflight: `make local-provider-check`. Fuller
  diagnostics (preflight + health payload + compose logs):
  `make diagnose-chat-local`.
- Fresh Docker DB volume and rebuilt chat product index: `make docker-init-fresh`.
- Full-profile smoke failure in CI: inspect the `e2e-full-compose.log`,
  `e2e-full-metrics.txt`, `e2e-full-metrics-summary.md`,
  `e2e-full-dependencies-health.json`, and `e2e-full-alert-state.md` artifacts.
- Scheduled full-profile smoke alerts keep one open issue per alert class and
  auto-close when scheduled runs recover; include the run URL and summary when triaging.
- Missing env files: run `make env-init`, then update `.env` and `services/chat/.env`.
- Sandbox-only build failure (`listen EPERM`): run `make ci` outside a restricted sandbox.
- Vitest excludes `e2e/**`. Playwright specs match vitest's default glob, and left
  in they fail on `@playwright/test` imports vitest cannot run.
- Web type-checking is **two** `tsc` passes — the app's `tsconfig.json` and the
  specs' `tsconfig.e2e.json` — plus `scripts/check-journey-coverage.mjs`. Running
  bare `npx tsc --noEmit` checks only the first and misses the journeys entirely.
- `make e2e-smoke` probes `127.0.0.1:3100` and `:8100` **literally** and cannot be
  aimed elsewhere; only `make test-e2e` follows `E2E_BASE_URL`. A remapped stack and
  `e2e-smoke` do not mix, and one failure mode is a green smoke run against an
  unrelated project's containers — worse than a red one, because nothing looks wrong.
  Free the default ports first.
- `make e2e-smoke` deletes its containers **and their volumes** on exit unless you
  pass `KEEP_STACK=1`. Use it when a later step still needs the stack.
- A change carrying a `srcset`, or one whose image source dimensions changed, needs a
  **2x pass as well as 1x** (`deviceScaleFactor: 2`). Density is a browser-context
  property, not a width, so it is a second pass rather than another viewport: a 2x
  screen asks for twice the CSS width and the optimiser never upscales past the
  source, so a source that satisfies 1x can fall short at 2x with every 1x
  measurement clean. The 600px re-encode in #152 measured −0.9 to −2.2 dB PSNR at 1x
  but −4.4 to −6.6 dB at 2x.
- Bumping a **rendering dependency** — `tailwindcss`, `next`, `react`, `postcss`, or
  a UI library in `apps/web/package.json` — is a UI-affecting change even though the
  diff touches no component. A Tailwind major shipped here with every check green.

## Verification Map

Which gate commands read which paths. Stage 7 of the workflow uses this to rerun
only what a fix could have invalidated, instead of the whole gate every time.

`scripts/detect_changed_surfaces.py` is the executable form of this table, and
`make quick-ci-changed` runs it. Prefer that over reading the table by hand:

```bash
CHANGED_BASE=<base-sha> CHANGED_HEAD=<head-sha> make quick-ci-changed
```

| A fix touches | Rerun |
|---|---|
| `apps/web/**`, `Dockerfile` | `make -C apps/web ci`, `make test-scripts` |
| `services/chat/**`, `Dockerfile.migrate` | `make -C services/chat ci`, `make test-scripts` |
| `apps/web/prisma/**`, `apps/web/prisma.config.ts` | both surfaces: `make -C apps/web ci`, `make -C services/chat ci`, `make test-scripts` |
| `docs/**`, `README.md`, any `AGENTS.md` / `CLAUDE.md` / `GEMINI.md`, `CONTRIBUTING.md`, `.github/copilot-instructions.md` | `make docs-check`, `make test-scripts` |
| `docker-compose.yml` | the complete gate — it is web, chat, and runtime at once |
| `Makefile`, `mise.toml`, `package.json`, `apps/web/package.json`, `apps/web/package-lock.json` | the complete gate |
| `config/env_contract.json`, `.env.example`, `services/chat/.env.example`, `docs/ENV_CONTRACT.md` | the complete gate |
| `scripts/*.py`, `tests/scripts/**`, `.claude/agents/**` | the complete gate |
| `services/chat/constraints.txt`, `services/chat/requirements-dev.txt`, `services/chat/src/api/requirements-*.txt`, `services/chat/tests/requirements-test.txt` | the complete gate |
| `.github/workflows/ci.yml`, `release.yml`, `release-main-build.yml`, `.github/dependabot.yml`, `CODEOWNERS`, PR/issue templates | the complete gate |
| anything else | the complete gate — unmatched paths fall back to runtime by design |

**Rows accumulate -- they are not first-match.** A path matching several rows runs
the union of their commands, which is what the script does: a Prisma change is a
chat dependency *and* still matches `apps/web/**`, and a nested `AGENTS.md` under a
surface runs that surface's gate as well as `docs-check`. Reading the table as
first-match is how a Prisma change skips `next build`.

There is no "rerun nothing" row, and that is deliberate rather than an omission.
`tests/scripts/` asserts on files across every surface — docs headings, image
references, compose ordering, agent definitions — so `make test-scripts` runs for
**any** non-empty change, documentation included.

`quick-ci-web` / `quick-ci-chat` are the fast forms and skip the web production
build. They are the iteration loop, not the merge gate: the gate that has to have
run before pushing is the `ci` target for each changed surface.

<!-- agent-skills:begin workflow 8881bee7 — managed block, edits here are overwritten -->
## Development Workflow

Follow these stages in order (governed by the global `agent-workflow-skills`). Scale the pipeline to the
size of the change using the triage table — skipping a stage is a decision to
state out loud, never a shortcut taken silently.

| Track | When | Stages |
|---|---|---|
| **Trivial** | Docs, comments, typos, config with no logic change | 1 → 7 → 9 |
| **Single fix** | One bug or small change with a clear, contained cause | 1 → 2 → 5 → 7 → 8 → 9 |
| **Feature** | New behavior, several files, or an architectural choice | All stages; repeat 5–8 per slice |

**Division of labor.** The main agent runs only focused checks — the single test
it just wrote, a formatter over the files it just touched. Whole suites, builds,
dependency audits, and repository-wide lint belong to `verifier`, and reviews
belong to `ui-review` and `code-review`. This is not ceremony: it keeps routine
command output out of the implementation context, and it means each gate is read
by something that has not already convinced itself the change is correct.
Sub-agents report successes in one line and include only the evidence needed to
diagnose a failure.

**Preserve what you did not change.** A worktree may hold work that is not yours.
Never stage, revert, or "clean up" a change you did not make; when something
unrelated is in the way, name it and leave it alone.

1. **Inspect & Branch**: Inspect `git status`, the current branch, and every
   applicable instruction file before touching anything. Note unrelated staged,
   unstaged, and untracked work so you can preserve it. Fetch the base branch
   (`git fetch origin main`) and create a dedicated branch:
   `git checkout -b <owner>/<type>/<short-description> origin/main`.
   `<owner>` is your GitHub login (`gh api user --jq .login`); `<type>` is one of
   `feat`, `fix`, `refactor`, `chore`, `test`, `docs`. Never commit to `main`.
2. **Plan & Slice (`plan-and-prototype`)**: Formulate a clear step-by-step plan
   before writing code. Define the smallest end-to-end slice that can be reviewed,
   tested, and shipped independently; if the work is too large for one pull
   request, order the slices and complete only the current one.
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
   - Run only the test you authored or changed, filtered by file and name. Whole
     suites are stage 7's job.
   - Pure logic (calculations, state machines, business rules) must be unit-tested.
     Non-testable areas (rendering, audio) must be visually/interactively verified.
6. **UI Review (`ui-review`)**:
   - Audit layout, visual hierarchy, contrast (WCAG AA), interaction states, and
     accessibility according to the project's UI domain.
   - For a change with no user-visible surface, say so and return. Do not invent
     findings to justify the stage.
7. **Verification (`verifier`)**:
   - Run the project's full gate: lint, type-check, test suites, build. Focused runs
     from stage 5 do not substitute for it.
   - Fix or explicitly resolve every actionable finding before code review. When a
     fix changes code, rerun the affected focused tests, then rerun the gate commands
     whose inputs the fix touched — see **Verification Map** below if this project
     defines one. The complete gate must run in full at least once on the state that
     enters code review.
   - Some findings are environmental and no code change resolves them (browsers that
     will not install, no network, a missing credential). Resolving those means
     naming them precisely — what ran, what did not, and why — not retrying them.
8. **Code Review (`code-review`)**:
   - Read the complete change: `git diff origin/main...HEAD`, plus staged
     and unstaged edits (`git diff HEAD`) and untracked files (`git status
     --porcelain`). Remove accidental or unrelated edits of your own; preserve
     anything that belongs to the user.
   - Enforce architectural boundaries, language idioms, defensive error handling,
     and zero committed secrets.
   - Do not repeat this review on an unchanged state. Rerun it only when the
     reviewed content actually changed.
9. **Commit & PR Lifecycle (`slice-and-pr`)**:
   - Commit using Conventional Commits (`<type>(<scope>): <summary>`). Stage files
     explicitly; never `git add -A` when unrelated work is present.
   - Open the PR with `gh pr create` and watch CI with `gh pr checks --watch`.
   - **Stop there and report.** Merging (`gh pr merge`) and force-pushing require
     explicit approval from the user in the current conversation.
<!-- agent-skills:end workflow -->

### Unrelated findings become issues

Work turns up problems that are not the problem being worked on. A stale script,
a pre-existing overflow, a check that does not check what it claims. This can
happen at any step, and most often happens during steps 6 to 8, because
`ui-review`, `verifier`, and `code-review` read more of the repository than the
change touches.

**File an issue at the moment of finding, before deciding what to do about it.**
The finding is cheapest to write down while the context that produced it is
still loaded, and an issue costs little if it later turns out to be nothing.

Two failure modes this exists to prevent, and they pull in opposite directions:

- **Silently widening the change.** Fixing it here inflates a reviewed diff with
  work nobody scoped, and buries an independent decision inside an unrelated
  pull request.
- **Silently dropping it.** Mentioning it only in a review comment or a chat
  reply means it is gone as soon as that context is. Nobody rediscovers it until
  it breaks something.

Filing an issue is what makes "not now" different from "never".

Write enough that it can be acted on without rediscovering it: what is wrong,
where, how it was found, and why it was not fixed at the time. Include the
measurement if there was one. Link the issue from the pull request that surfaced
it, so the reviewer can see the finding was handled rather than missed.

Fix it in the current change only when leaving it would make that change wrong
or unverifiable — a pre-existing problem the change makes materially worse, or a
check that has to work for this change to be trustworthy. That is a judgement
call, so state the reason in the commit message. When in doubt, file and leave
it: a separate pull request is cheap, and an unscoped one is not.

Sub-agents report findings; they do not file issues. Every finding they report
that falls outside the current change needs the main agent to file it.

### Stack handover and teardown

The numbered stages above are the generic pipeline. These are the repo-specific
obligations attached to them, and they live here because the stages themselves are
a managed block this file does not edit.

**Stage 5 may build the stack the later stages use.** The one spec under change
may itself be a journey, and then it needs a composed stack: `make e2e-smoke
KEEP_STACK=1` builds one and leaves it up, and stages 6 and 7 will want that same
one. No make target runs a single spec, so running just the one is
`npx playwright test <file>` from `apps/web`.

**Stage 6 hands its stack forward.** Where a stack is already up -- from stage 5, or
from an earlier pass through 6 and 7 when stage 8 sends you back -- give `ui-review`
the `E2E_BASE_URL` and the ports if they are not the defaults, say the stack is not to
be torn down, and say it is not `ui-review`'s. Naming it without addressing it is not
a handover: remapped ports are normal here, and a reviewer that cannot reach the stack
starts its own and tears it down on exit, destroying the stack stage 7 was promised.

**Stage 7 hands its stack forward too.** Give the `E2E_BASE_URL`, say the stack is
yours, and say `KEEP_STACK=1` -- without that flag `make e2e-smoke` deletes the
containers and their volumes on exit. What the handover buys is not the rebuild, which
happens either way, but that the verifier knows a stack exists, knows where it is, and
knows not to destroy it.

**A fix in stage 8's loop can invalidate stage 6.** Rerun `ui-review` before the
verifier when a review fix touches a rendered surface; a re-review of source alone does
not re-establish what the rendered pass covered.

**Tear the stack down at the end, not before.** Once stage 8's loop has closed and no
further `verifier` run is coming, tear down any stack stages 5, 6, or 7 left running:
`make down`, or `docker compose down --volumes` to drop the seeded database with it.
Stage 7 hands its stack forward under `KEEP_STACK=1`, which disables the only teardown
the workflow otherwise performs -- so without this the containers outlive the change
and hold ports 3100, 55432, and 8100 against the next one.

### Sub-agents this workflow depends on

Steps 6 through 8 use `ui-review`, `verifier`, and `code-review`, defined in
`.claude/agents/`. All three run unattended: they cannot ask a question, and
they are instructed not to modify the repository they assess. That is an
instruction rather than a sandbox — each of them has `Bash` — so if a review
round is followed by working-tree changes you did not make, check `git status`
before assuming they are yours.

**Their findings are claims, not verdicts.** Check the ones a change depends
on. This workflow has had a rendered review call a compliant focus indicator
"completely invisible" — acted on, it produced a guard that rejected a correct
design — and the same review quote a contrast ratio the running build measured
differently, zinc-400 at 2.56:1 against a measured 2.62:1. Both were believed
before they were checked. Address every finding, and where one is wrong, say so
with the measurement rather than complying.

Record a disputed finding where someone else can audit it, and note when:
carried into the body of the commit step 9 is about to make, or into the pull
request body when the dispute arises after committing. Neither surface exists
while step 8 is running, so this is a commitment about what gets written, not a
precondition to satisfy first. Step 8's loop ends on a round returning no
defects, and a defect disputed rather than fixed counts as cleared only if it
is written down that way — a commit whose body omits it means step 8 did not
clear. Otherwise "I checked, it was wrong" lives inside one agent's reasoning,
and the gate opens with nothing to inspect.

If one is unavailable — a different assistant, or a session started before the
definitions landed — carry out that step's intent directly and say which agent
was unavailable, rather than skipping the step or reporting it as done.

**Changing a definition: check it landed rather than guessing how long to wait.**
An edit under `.claude/agents/` does not reach the agents immediately. Measured
by putting a marker string in a definition and asking spawned agents whether
they had it, with file reads forbidden so the answer describes what they were
given:

```text
~1 min after the edit    absent
~2.5 min                 absent
~6 min                   present
```

Nothing changed between the second and third — no edit, no commit, no restart.
So a commit is not required to publish an edit, and neither is a new session.
Whether either would *force* a reload was not tested, and nothing between 2.5
and 6 minutes was probed, so the interval is unbounded at both ends of that gap.

Which is why the instruction is a check rather than a duration. Put a marker in
the definition and ask the spawned agent to quote it back **from its own
instructions, without reading any file**, saying so if it cannot tell the two
apart. Only then trust the run — "a few minutes" is exactly the guess the
numbers above do not support.

That prohibition is the whole check, not a caveat on it. A spawned agent has
`Read`, and `code-review`'s own definition tells it to read both sides
whenever a change touches `.claude/agents/` — which is exactly the situation
this check runs in. Without it the agent reads the marker off disk and quotes it
back while running the previous text, and the check confirms the thing it was
added to catch. The prohibition has to go in the spawn prompt every time,
because no definition mentions markers.

Take the marker out once the run is trusted, before step 9 commits — nothing
guards against one being left in. The removal is itself an edit under
`.claude/agents/`, so a spawn shortly after it can still quote a marker that is
gone; that is the stale-copy case below, not a failed removal.

Both directions of a stale copy mislead. A spawn too soon runs the old text and
reports on it, which reads exactly like the new text failing. And the copy
outlives the file: an agent still returned a marker a minute after it had been
deleted from disk, so a rollback looks like it did not take either.

An agent change is therefore testable in the session that writes it. Step 8's
loop is where forgetting that costs most: take a finding, edit, spawn straight
away, and the run meant to confirm the fix is testing the version before it.

This paragraph is the product of getting the mechanism wrong twice, in opposite
directions — once as "read at session start", once as "read from `HEAD`" — each
time from a single observation treated as decisive. So prefer the marker check
over any theory about what triggers a reload, including the one above. And where
an agent seems to be missing a definition entirely, that is the *If one is
unavailable* paragraph above; a wait is worth trying first, since these two look
alike from the caller's side.

**A requirement this file places on a step has to be described in the agent that
executes it.** Nothing checks that. The guard suite reads names, tool lists,
step numbers, and the instructions it matches by regex in a definition's body
— that an agent is told not to modify the repository, and that `code-review`
still carries the bullet below — never whether an
obligation on a step appears in the agent that runs it. So an obligation added
to step 6, 7 or 8 can name something the executing agent was never told to do,
and the agent does not refuse: it omits it and reports the step complete, which
reads as a clean result. That makes it `code-review`'s to catch whenever a
change touches the numbered steps, this section, or a file under
`.claude/agents/`, and its definition says so. The instance that found the gap
was an edit to step 6 alone, so dropping the steps from that list would disarm
the check for the case that motivated it.

`ui-review` needs a browser to satisfy step 6's rendered-journey requirement.
Where none is installed it falls back to reviewing source and must say so; a
review that claims viewports it never rendered is worse than none.

A browser being installed and the *tools* reaching one are different questions,
and only the first is what "none is installed" describes. The Playwright MCP
server drives branded Chrome by default and fails every call on a machine that
has only Playwright's own Chromium — so the tools can be present, and broken,
while a browser sits there working. That is not a fallback-to-source case:
`Bash` still drives the installed browser. `ui-review` carries the detail; what
belongs here is that a rendered review remains required in that state, and that
the writeup says which path rendered it.

## Source of truth

`AGENTS.md` is the canonical format for agent instructions. The root file defines
repository-wide policy; a nested `AGENTS.md` adds authoritative instructions for
its subtree. Apply both, from the root down to the file closest to the work.

Assistant-specific context files are pointers only. They contain no independent
instructions:

| Assistant | Pointer file | Points at |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` (per scope) | sibling `AGENTS.md` |
| Gemini CLI | `GEMINI.md` (per scope) | sibling `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` | root `AGENTS.md` |

Scopes with their own runbook:

- `AGENTS.md` (repo-wide)
- `apps/web/AGENTS.md`
- `services/chat/AGENTS.md`
- `tests/scripts/AGENTS.md`

Never add instructions to a pointer file. That includes memories captured by pressing
`#` in Claude Code, which append to the nearest `CLAUDE.md` — move that text into the
matching `AGENTS.md` instead.

`make agent-docs-check` (part of `make docs-check`, and gated in CI) fails when a
pointer drifts and prints the added lines. To restore the pointers locally after
moving the content across:

```bash
make agent-docs-check FIX=1
```

## Code Review Rules

- Treat changes at system seams as one contract. When a change touches the web/chat
  payload, Prisma schema and handwritten SQL, dependency manifests and constraints,
  or container inputs and runtime files, inspect and validate both sides.
- Require guards to measure effective behavior, not a nearby declaration. Reject
  vacuous loops, mislabeled samples, or configuration checks that never exercise the
  rendered pixels, served bytes, accessibility tree, resolved files, or tool output
  named by the assertion.
- For runtime and container changes, verify the built artifact and real integration
  path. Unit tests cannot prove that a file was copied into an image, a service starts
  with its deployed configuration, or the web/chat/database path works together.

## Repo map

- `apps/web/src/app/`: Next.js pages and API routes.
- `apps/web/src/components/`: UI components.
- `apps/web/src/lib/`: shared web helpers and domain logic.
- `apps/web/Makefile`: web-owned dev/test/build command surface.
- `apps/web/AGENTS.md`: web-scoped agent runbook.
- `services/chat/src/api/`: chat service API and chat logic.
- `services/chat/tests/`: chat unit tests. Integration coverage lives in
  `scripts/e2e_smoke.py`, which runs against a real stack.
- `services/chat/Makefile`: chat-owned dev/test command surface.
- `services/chat/AGENTS.md`: chat-scoped agent runbook.
- `tests/scripts/AGENTS.md`: fixture and mutation rules for root guard tests.
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

### Python virtualenv

All Python runs from a single project virtualenv at `.venv` (git-ignored). Make
targets create it on demand and invoke `.venv/bin/python` directly, so there is
nothing to activate — `make test-scripts`, `make quick-ci-chat`, and friends all
work from a clean shell.

```bash
make venv
```

Never install project Python dependencies into a system or mise interpreter. If
you run Python by hand, use `.venv/bin/python`, not `python`/`python3`.

`PYTHON_BASE` is the interpreter used to *create* the venv (default
`mise exec python@3.11 -- python`); CI overrides it with `PYTHON_BASE=python`.
Do not override `PYTHON` itself — that bypasses the venv.

## Canonical commands

Run from repository root:

```bash
make help
make bootstrap
make venv
make toolchain-doctor
make env-contract-check
make agent-doctor
make env-init
make setup            # web dependencies only — see the note below
make setup-chat
make setup-chat-full
make local-provider-check
make diagnose-chat-local
make docker-init-fresh
make prisma-generate
make migrate-deploy
make migrate NAME=add-order-status
make dev
make down
make test
make test-scripts
make quick-ci
make quick-ci-chat
make quick-ci-changed
make test-e2e
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
npm run setup         # web + chat — not the same as `make setup`
npm run setup:chat
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

The two `setup` entries are not the same command. `make setup` installs web
dependencies only; `npm run setup` runs `setup:web` then `setup:chat`. Use
`make bootstrap` when you want both through make, and reach for `make setup-chat`
if you already ran `make setup` and the chat imports are missing.

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
  State whether the migration is destructive — a dropped or renamed column, a
  `NOT NULL` added to an existing one, a narrowed type. Local checks cannot tell
  you: they build the database fresh and seed it, so there is no data to lose and
  no older reader still running. Deployment has both.
  `infrastructure/scripts/docker-entrypoint.sh` applies migrations at container
  start while the previous revision is still serving, and rollback is a traffic
  shift back to that revision — which a destructive migration has already made
  unservable. Split those across two releases, expand then contract, or say in
  the pull request why this one does not need it.
- Prefer keeping generated artifacts and local runtime outputs out of commits.

## Validation expectations

`## Verification Map` above is the authority on which gate command a change
requires, and `make quick-ci-changed` computes it for you. That is the iteration
loop during implementation, not a substitute for the gate: the `ci` target for
every changed surface has to have run before pushing, and step 7 is where that
happens.

Add integration confidence where the change crosses a runtime boundary. The
Verification Map does not route these and `make ci` does not run them, so they
are a deliberate addition to step 7 rather than something a changed path selects:

- End-to-end journeys: `make test-e2e` (needs a running stack and the Playwright
  browser; see step 7)
- Cross-surface integration confidence: `make e2e-smoke`
- Contract-only integration confidence (minimal chat stack): `make e2e-smoke-lite`
- Full local-provider integration confidence: `make e2e-smoke-full`
- Release preflight: `make release-dry-run RELEASE_TAG=vX.Y.Z`

## Git repo

The main branch for this project is called `main`.

When doing git operations use the GitHub CLI `gh` where possible.

## Comments policy

Only write high-value comments if at all. Avoid talking to the user through comments.

## General style requirements

Use hyphens instead of underscores in flag names (e.g. `my-flag` instead of `my_flag`).

JavaScript/TypeScript and React conventions live in `apps/web/AGENTS.md`.

## Notes & Learned Patterns

- Add learned project patterns, architecture insights, and persistent notes here.
