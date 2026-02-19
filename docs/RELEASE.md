# Release Runbook

This repository uses two release paths:

1. automated build releases from successful `main` CI runs
2. tag-driven draft releases for semver/promoted releases

## Local Preflight

Run this before creating or pushing a release tag:

```bash
make release-dry-run RELEASE_TAG=v1.2.3
```

`release-dry-run` validates:

1. release guardrail files exist (`CODEOWNERS`, templates, release workflow, runbook)
2. tag format (`vMAJOR.MINOR.PATCH`, optional prerelease/build suffix)
3. quick CI checks (`make quick-ci`)
4. script guardrail tests (`make test-scripts`)
5. docs/runbook links (`make docs-check`)

## Draft Release Workflow

- Workflow file: `.github/workflows/release.yml`
- Trigger:
1. push tag matching `v*`
2. manual `workflow_dispatch` with an existing `tag` input
- Behavior:
1. validates tag existence
2. runs `make release-dry-run`
3. creates a **draft** GitHub Release with generated release notes

## Automated Main Build Releases

- Workflow file: `.github/workflows/release-main-build.yml`
- Trigger: completion of `Continuous Integration` with:
1. `conclusion == success`
2. `event == push`
3. `head_branch == main`
- Behavior:
1. creates an immutable build tag:
   `build-main-YYYYMMDD-run<run_id>-a<attempt>-<sha7>`
2. creates/publishes a prerelease GitHub Release for that tag
3. links the release body back to the source CI run and commit

This gives a reproducible baseline artifact for every green `main` build.

## Branch Protection Guidance

Use `main` branch protection with:

1. required pull request reviews
2. `CODEOWNERS` enabled review routing (`.github/CODEOWNERS`)
3. status checks required before merge

Recommended baseline required checks (always run on PRs):

1. `Continuous Integration / Detect Changed Surfaces`
2. `CodeQL / Analyze (javascript-typescript)`
3. `CodeQL / Analyze (python)`

Conditionally expected CI jobs should pass when triggered by changed surfaces:

1. `Continuous Integration / Env Contract Drift Check`
2. `Continuous Integration / Script Guardrail Tests`
3. `Continuous Integration / Documentation Link Checks`
4. `Continuous Integration / Web App CI`
5. `Continuous Integration / Chat Service CI`
6. `Continuous Integration / Onboarding Smoke`

## Notes

- Release drafts are intentionally non-publishing; promotion to a published release is manual.
- Automated main-build releases are prereleases and are intended as CI baselines, not semver promotions.
- If local `make ci` fails with sandbox `listen EPERM`, run build/release checks in a non-restricted shell.
