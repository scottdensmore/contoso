# AGENTS

This repository contains two runtime surfaces:

- `apps/web/` for the Next.js web app (UI + API routes).
- `services/chat/` for the FastAPI chat service.

Use this file as the default runbook for coding agents.

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

## Development workflow

Follow these steps in order for every change.

1. **Inspect before changing anything.** Inspect the repository, current Git
   state, and all applicable instruction files before making changes. Preserve
   unrelated staged, unstaged, and untracked work.

2. **Create a branch first.** Create a dedicated feature, fix, refactor, chore,
   test, or documentation branch before making code changes. Never commit
   directly to `main`, and create the branch from the latest appropriate
   `main` state.

3. **Choose a thin vertical slice.** Before implementing a tracked issue or
   feature, define the smallest end-to-end slice that can be reviewed, tested,
   shipped, and merged independently. Prefer one coherent user-visible or
   operational outcome over a broad horizontal layer. If the next issue is too
   large for one pull request, split it into ordered slices and complete only
   the current slice. Keep pull requests small enough for thorough review,
   reliable verification, and quick rollback.

4. **Use test-driven development when behavior or structure is testable.**
   - Add or update a focused test before implementation.
   - Run it and confirm it fails for the expected reason.
   - Implement the smallest appropriate change.
   - Run focused tests while iterating.
   - Refactor only while the relevant tests remain green.

   **A guard added for behavior that already works has no red phase**, so the
   confirm-it-fails bullet never reaches it. Write down which mistake each
   assertion catches, and which ones nothing catches, then demonstrate it:
   break an input on purpose and watch that assertion fail on it. Coverage
   argued rather than demonstrated is the defect the guard was added to
   prevent, one level up.

   **Measure what was produced, not what was asked for.** A guard that reads a
   declaration is measuring the request, and the two come apart constantly: a
   colour Tailwind serialises as `lab()` reads as a different colour through a
   regex for numbers; `ring-0` leaves its colour in the computed box-shadow
   with no geometry to paint it; a zero-width border still reports a border
   colour; a blurred shadow reports its source colour while every pixel it
   paints is composited toward the background; `outlineWidth` reports the
   user-agent default of `3px` for an outline whose style is `none`. Every one
   of those passed a check that looked right and was measuring something
   adjacent to the claim. Read the rendered pixels, the served bytes, the
   accessibility tree — whatever the asserted thing actually is.

   The same trap catches fixtures and samples. Assert that a sample is what its
   name says — for example, a brightness band, an overlap, or a count that only
   the intended case produces. Fixture-isolation rules for the root guard suite
   live in `tests/scripts/AGENTS.md`.

   **Run the focused test here, and only the focused test.** This step needs
   the one spec or module under change, its red phase, and the mutations that
   demonstrate what each assertion catches. The `verifier` will not do those:
   it is instructed not to modify the repository, so breaking an input on
   purpose is not available to it. Fast whole-suite runners are fine too where
   they are genuinely fast — `make test-web` is a few seconds.

   The one spec may itself be a journey, and then it needs a composed stack:
   `make e2e-smoke KEEP_STACK=1` builds one and leaves it up, and steps 6 and 7
   will want that same one. No make target runs a single spec, so running just
   the one is `npx playwright test <file>` from `apps/web`.

   What does not belong here is the whole journey suite. Running it costs
   minutes per iteration, and the trigger for handing over is "I believe this
   is done", not "I want to know whether it works".

5. **Inspect the complete diff.** Review the branch diff plus all staged,
   unstaged, and untracked files. Remove accidental or unrelated changes while
   preserving work that belongs to the user. A real problem found here is filed
   as an issue before the change is removed — see *Unrelated findings become
   issues* below.

6. **Run `ui-review` before verification.** After the main agent completes an
   implementation pass, invoke the `ui-review` sub-agent. The `ui-review`
   sub-agent must act as an expert in website design, usability,
   responsiveness, and accessibility. Address every actionable finding before
   running the `verifier`. For UI-affecting changes, exercise the changed
   journey in the rendered application at representative phone, tablet, and
   desktop viewports; inspect interaction, loading, empty, error, focus,
   keyboard, contrast, and responsive states as applicable; and capture
   screenshots or equivalent visual evidence.

   A viewport is a width in CSS pixels, which says nothing about how many
   device pixels fill it. Where the change affects what the browser requests —
   anything carrying a `srcset`, or a source whose dimensions changed —
   exercise it at **2x as well as 1x**. Density is a property of the browser
   context (`deviceScaleFactor: 2`), not a width, so it needs a second pass
   rather than another viewport. A 2x screen asks for twice the CSS width, and
   the optimiser never upscales past the source, so a source that satisfies 1x
   can fall short at 2x while every 1x measurement stays clean. The 600px
   re-encode first tried in #152 came out at −0.9 to −2.2 dB PSNR at 1x and
   −4.4 to −6.6 dB at 2x: a difference at 1x small enough to accept, and one at
   2x that was plainly visible.

   A change is UI-affecting when it moves a rendering dependency, too —
   `tailwindcss`, `next`, `react`, `postcss`, or a UI library in
   `apps/web/package.json`. That diff touches no component and can still change
   every rendered pixel; a Tailwind major shipped here with every check green.

   For changes with no UI impact, explicitly record that rendered UI review is
   not applicable. If a finding is not applicable, record the concrete reason
   rather than silently ignoring it.

   `ui-review` may start and stop a stack of its own. If one is already up —
   from step 4, or from an earlier pass through steps 6 and 7 when step 8 sends
   you back here — give it the `E2E_BASE_URL` and the ports if they are not the
   defaults, say the stack is not to be torn down, and say it is not
   `ui-review`'s. Naming it without addressing it is not a handover: remapped
   ports are normal here, and a reviewer that cannot reach the stack starts its
   own or renders nothing. Otherwise step 7's handover below promises a stack
   that stopped existing here.

7. **Run `verifier` before code review.** Invoke the `verifier` sub-agent to run
   the builds, static checks, tests, and journey coverage appropriate for the
   change. The verifier must report failures, flakes, missing coverage, and
   environment issues. Fix or explicitly resolve every actionable finding
   before starting code review. If a verifier finding requires a code change,
   rerun the verifier after addressing it.

   **The whole battery belongs here** — the merge-gate command, the production
   build, the root guard suite, and the full journey run. Do not pre-run those
   and hand over a summary: it doubles the wall-clock, and a summary is not
   what the next step needs.

   **Hand over the stack rather than leaving one to be found.** Where journeys
   need a composed stack, step 4 has usually built one, and step 6 may have
   built its own — `ui-review` is allowed to, and that one is then its to tear
   down and may be on ports it chose. Give the `E2E_BASE_URL`, say the stack is
   yours, and say `KEEP_STACK=1`: without that flag `make e2e-smoke` deletes
   the containers and their volumes on exit. What the handover buys is not the
   rebuild, which happens either way, but that the verifier knows a stack
   exists, knows where it is, and knows not to destroy it. Tear it down after
   the last step that needs it, not after this one.

   Say the ports if they are not the defaults. `make test-e2e` follows
   `E2E_BASE_URL` anywhere; `make e2e-smoke` probes `127.0.0.1:3100` and
   `:8100` literally and cannot be aimed elsewhere, so it and a remapped stack
   do not mix. One of the ways they fail is a green smoke run against an
   unrelated project's containers, which is worse than a failure because
   nothing looks wrong. Exactly which way you get depends on which compose
   files resolve and which ports are already held, and is not worth predicting
   here. Free the default ports before step 7, or hand over nothing and say
   why.

8. **Run `code-review` before every commit.** Invoke the `code-review`
   sub-agent against the current branch diff and every staged, unstaged, and
   untracked file. The reviewer must act as an expert in the languages and
   frameworks used by this application. Address every actionable finding
   before committing. If review findings cause changes, rerun the appropriate
   tests and the `verifier`, then obtain a fresh `code-review` approval for the
   changed state.

   That loop has no natural end, so ask for one: **have the reviewer say which
   findings are defects and which are refinements.** The loop ends on a round
   returning no defects, however many refinements come with it. Apply those,
   rerun the focused tests and the `verifier`, and record what was applied — a
   refinement-only change does not earn a fresh review round, here or at
   step 10.

   **A fix made in this loop can invalidate step 6 as well.** If it alters what
   a page renders, rerun `ui-review` before the verifier and carry its verdict
   forward; the screenshots from step 6 otherwise describe a state that no
   longer exists. If it does not, record that the fix was not UI-affecting and
   go straight to the verifier. Only defects reopen step 6, on the same
   reasoning that ends this loop — a refinement applied to a rendered surface
   does not.

9. **Commit after approval.** Commit only after verification and code review
   are complete. Use Conventional Commits:

   ```text
   <type>(<scope>): <imperative summary>
   ```

   Keep the subject at 72 characters or fewer, describe why in the body when
   useful, and do not combine unrelated work.

10. **Create pull requests from the reviewed state.**
    - Confirm that local verification remains valid.
    - Rerun `code-review` only if the reviewed state changed after the
      pre-commit review.
    - A changed state includes code, tests, documentation, generated files,
      conflict resolution, or any other staged, unstaged, or untracked content.
    - Except refinements the reviewer classified as such and step 8 cleared:
      applying those does not re-arm this, or the loop step 8 just ended
      reopens here.
    - Do not repeat code review when the already-reviewed diff and worktree
      remain unchanged.
    - Updating the branch from `main` — rebase, merge, or conflict resolution —
      invalidates **verification** as well as review. The builds, merge gates,
      smoke, and journeys were measured against a tree that no longer exists,
      so rerun step 7's applicable commands against the updated one rather than
      rerunning `code-review` alone.
    - Tear down any stack steps 4, 6, or 7 left running, once step 8's loop has
      closed and no further `verifier` run is coming: `make down`, or
      `docker compose down --volumes` to drop the seeded database with it. Step
      7 hands its stack forward under `KEEP_STACK=1`, which disables the only
      teardown the workflow otherwise performs — so without this the containers
      outlive the change and hold ports 3100, 55432, and 8100 against the next
      one.
    - Push and create the pull request only after local verification and any
      required code review are complete.
    - Open a normal, ready-for-review pull request by default. Do not open
      draft pull requests unless the user explicitly asks for a draft.

11. **Merge only clean, passing pull requests.** Merge only after GitHub
    reports a clean merge state and every configured check passes. Never bypass
    a failing or pending required check. Self-merges are allowed when these
    conditions are met. Use squash merge for short-lived development branches
    to keep `main` linear, then delete the merged branch.

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

Use `make quick-ci-changed` during implementation, and rerun it against an
explicit range when validating committed work:

```bash
CHANGED_BASE=<base-sha> CHANGED_HEAD=<head-sha> make quick-ci-changed
```

Every changed surface's merge-gate command has to have run before pushing.
Step 7 is where that happens, so this matrix is what tells `verifier` which
ones apply rather than a list to work through by hand:

- Web: `make -C apps/web ci` (includes lint, type-check, tests, and build)
- Chat: `make -C services/chat ci`
- Scripts/tooling: `make test-scripts`
- Documentation/runbooks: `make docs-check`
- Cross-surface or repository-wide: `make ci`

Add integration confidence where the change crosses a runtime boundary. These
are the verifier's too.

- End-to-end journeys: `make test-e2e` (needs a running stack and the Playwright
  browser; see step 7)
- Cross-surface integration confidence: `make e2e-smoke`
- Contract-only integration confidence (minimal chat stack): `make e2e-smoke-lite`
- Full local-provider integration confidence: `make e2e-smoke-full`
- Release preflight: `make release-dry-run RELEASE_TAG=vX.Y.Z`

## Troubleshooting

- Toolchain mismatch: run `mise install`, then `make toolchain-doctor`.
- Virtualenv missing, broken, or on the wrong Python: run `rm -rf .venv && make venv`.
- `ModuleNotFoundError` for a chat dependency: you are probably outside the venv — re-run through `make`, or use `.venv/bin/python`. If you are inside it, the chat dependencies were never installed: `make setup` covers web only, so run `make setup-chat`.
- Playwright journeys fail with a missing browser: run `make -C apps/web install-e2e-browsers`, then rerun `make test-e2e`. Neither `make setup` nor `make bootstrap` installs it.
- Env contract drift: run `make env-contract-check` and update contract/templates/docs together.
- Docs link drift (including root runbooks): run `make docs-check`.
- Agent doc drift (a `CLAUDE.md`, `GEMINI.md`, or `.github/copilot-instructions.md` gained content): move the flagged lines into the matching `AGENTS.md`, then run `make agent-docs-check FIX=1`.
- Release guardrail failure: run `make release-dry-run` and fix missing guardrail files.
- E2E smoke failure: run `make e2e-smoke KEEP_STACK=1`, then inspect `docker compose logs`.
- Need local LLM/vector dependencies in Docker chat image: rerun with `CHAT_INSTALL_LOCAL_STACK=1`.
- Need local LLM/vector dependencies in Python chat setup: run `make setup-chat-full`.
- Need one-command local-provider preflight checks: run `make local-provider-check`.
- Need fuller local chat diagnostics (preflight + health payload + compose logs): run `make diagnose-chat-local`.
- Need to initialize a fresh Docker DB volume and rebuild chat product index: run `make docker-init-fresh`.
- Local-provider startup preflight fails (`LLM_PROVIDER=local`): start Ollama (`ollama serve`), pull model (`ollama pull <LOCAL_MODEL_NAME>`), and for docker chat use `OLLAMA_BASE_URL=http://host.docker.internal:11434`.
- Full-profile smoke failure in CI: inspect `e2e-full-compose.log`, `e2e-full-metrics.txt`, `e2e-full-metrics-summary.md`, `e2e-full-dependencies-health.json`, and `e2e-full-alert-state.md` artifacts.
- Scheduled full-profile smoke alerts keep one open issue per alert class and auto-close when scheduled runs recover; include run URL and summary when triaging.
- Missing env files: run `make env-init`, then update `.env` and `services/chat/.env`.
- Sandbox-only build failure (`listen EPERM`): run `make ci` outside restricted sandbox.

## Building and running

Follow the validation matrix above. `make quick-ci-changed` is the iteration loop,
not a substitute for the applicable merge-gate command. Web merge gates include a
production build through `make -C apps/web ci` or `make ci`.

When doing git operations use the GitHub CLI `gh` where possible.

## Git repo

The main branch for this project is called `main`.

## Comments policy

Only write high-value comments if at all. Avoid talking to the user through comments.

## General style requirements

Use hyphens instead of underscores in flag names (e.g. `my-flag` instead of `my_flag`).

JavaScript/TypeScript and React conventions live in `apps/web/AGENTS.md`.
