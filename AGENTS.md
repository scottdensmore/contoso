# AGENTS

This repository contains two runtime surfaces:

- `apps/web/` for the Next.js web app (UI + API routes).
- `services/chat/` for the FastAPI chat service.

Use this file as the default runbook for coding agents.

## Source of truth

`AGENTS.md` is the single source of truth for agent instructions. Assistants that read
their own context file get a pointer to `AGENTS.md` and nothing else:

| Assistant | Pointer file | Points at |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` (per scope) | sibling `AGENTS.md` |
| Gemini CLI | `GEMINI.md` (per scope) | sibling `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` | root `AGENTS.md` |

Scopes with their own runbook:

- `AGENTS.md` (repo-wide)
- `apps/web/AGENTS.md`
- `services/chat/AGENTS.md`

Never add instructions to a pointer file. That includes memories captured by pressing
`#` in Claude Code, which append to the nearest `CLAUDE.md` — move that text into the
matching `AGENTS.md` instead.

`make agent-docs-check` (part of `make docs-check`, and gated in CI) fails when a
pointer drifts and prints the added lines. To restore the pointers locally after
moving the content across:

```bash
make agent-docs-check FIX=1
```

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

   Point the guard at a fixture tree; do not damage the real one. These modules
   compute their paths at import, so rebind **every path constant the assertion
   dereferences** — found by reading the module, not guessed from its name.
   That is more than the obvious one and is different per guard:
   `test_image_encoding.py` reaches everything through `IMAGES_DIR`;
   `test_image_references.py` also needs `PUBLIC_DIR`, which its `relative_to`
   depends on, and `REPO_ROOT`, which it walks for references;
   `test_page_headings.py` reads `REPO_ROOT` directly for the
   component-supplied headings, so rebinding `APP_DIR` alone leaves that
   assertion on the checkout. Rebinding a root that other constants were
   derived from at import changes nothing they read.

   Then confirm the run opened the fixture at all: a failure naming a path
   inside it, or a vacuity guard reporting a count that matches what the
   fixture holds. The count is the evidence, not the firing — a vacuity guard
   fires on nothing found, which is equally what a mistyped fixture path
   produces, and the assertions being demonstrated pass on the empty loop
   either way. A green run that never opened the fixture looks exactly like a
   guard that works.

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
   anything carrying a `srcset` — exercise it at **2x as well as 1x**. A 2x
   screen asks for twice the CSS width, and the optimiser never upscales past
   the source, so a source that satisfies 1x can fall short at 2x while every
   1x measurement stays clean. The 600px re-encode first tried in #152 came out
   at −0.9 to −2.2 dB PSNR at 1x and −4.4 to −6.6 dB at 2x: a difference at 1x
   small enough to accept, and one at 2x that was plainly visible.

   For changes with no UI impact, explicitly record that rendered UI review is
   not applicable. If a finding is not applicable, record the concrete reason
   rather than silently ignoring it.

7. **Run `verifier` before code review.** Invoke the `verifier` sub-agent to run
   the builds, static checks, tests, and journey coverage appropriate for the
   change. The verifier must report failures, flakes, missing coverage, and
   environment issues. Fix or explicitly resolve every actionable finding
   before starting code review. If a verifier finding requires a code change,
   rerun the verifier after addressing it.

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
`.claude/agents/`. All three run unattended: they cannot ask a question and
cannot modify the repository they assess.

If one is unavailable — a different assistant, or a session started before the
definitions landed — carry out that step's intent directly and say which agent
was unavailable, rather than skipping the step or reporting it as done.

`ui-review` needs a browser to satisfy step 6's rendered-journey requirement.
Where none is installed it falls back to reviewing source and must say so; a
review that claims viewports it never rendered is worse than none.

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
make setup
make setup-chat-full
make local-provider-check
make diagnose-chat-local
make docker-init-fresh
make prisma-generate
make dev
make test
make test-scripts
make quick-ci
make quick-ci-changed
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
npm run setup
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
- Prefer keeping generated artifacts and local runtime outputs out of commits.

## Validation expectations

- Default agent loop: `make quick-ci-changed`
- Range-scoped agent validation: `CHANGED_BASE=<base_sha> CHANGED_HEAD=<head_sha> make quick-ci-changed`
- Web-only change: `make -C apps/web quick-ci`
- Chat-only change: `make quick-ci-chat`
- Scripts/tooling change: `make test-scripts`
- Cross-surface change (web + chat + schema): `make ci`
- Cross-surface integration confidence: `make e2e-smoke`
- Contract-only integration confidence (minimal chat stack): `make e2e-smoke-lite`
- Full local-provider integration confidence: `make e2e-smoke-full`
- Release preflight: `make release-dry-run RELEASE_TAG=vX.Y.Z`

## Troubleshooting

- Toolchain mismatch: run `mise install`, then `make toolchain-doctor`.
- Virtualenv missing, broken, or on the wrong Python: run `rm -rf .venv && make venv`.
- `ModuleNotFoundError` for a chat dependency: you are probably outside the venv — re-run through `make`, or use `.venv/bin/python`.
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

Before submitting any changes, it is crucial to validate them by running the full build and lint check. This command will build the repository and lint the code.

When doing git operations use the GitHub CLI `gh` where possible.

## Git repo

The main branch for this project is called `main`.

## Comments policy

Only write high-value comments if at all. Avoid talking to the user through comments.

## General style requirements

Use hyphens instead of underscores in flag names (e.g. `my-flag` instead of `my_flag`).

JavaScript/TypeScript and React conventions live in `apps/web/AGENTS.md`.
