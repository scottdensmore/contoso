# Release Runbook

This repository uses local preflight verification and GitHub CLI for release management, keeping GitHub Actions minutes at zero:

1. local preflight validation via `make release-dry-run`
2. tag-driven draft releases created via `gh release create`

## Local Preflight

Run this before creating or pushing a release tag:

```bash
make release-dry-run RELEASE_TAG=v1.2.3
```

`release-dry-run` validates:

1. release guardrail files exist (`CODEOWNERS`, issue and PR templates, runbook)
2. tag format (`vMAJOR.MINOR.PATCH`, optional prerelease/build suffix)
3. quick CI checks (`make quick-ci`)
4. script guardrail tests (`make test-scripts`)

## Release Drafting Workflow

To publish a draft release:

1. Verify `main` is clean, up to date, and passing `make ci`:
   ```bash
   git checkout main
   git pull origin main
   make ci
   ```
2. Run the release preflight:
   ```bash
   make release-dry-run RELEASE_TAG=v1.2.3
   ```
3. Tag the release:
   ```bash
   git tag -a v1.2.3 -m "Release v1.2.3"
   git push origin v1.2.3
   ```
4. Draft the release using the GitHub CLI:
   ```bash
   gh release create v1.2.3 --generate-notes --draft
   ```
5. Review the drafted release notes in GitHub, and publish when ready.

## Branch Protection & Merge Policy

The repository enforces:

1. **Linear Commit Graph:** Direct pushes to `main` are restricted. All changes land via Pull Requests.
2. **Squash Merges:** PRs are squash-merged into `main` (`gh pr merge --squash --delete-branch`) to maintain a clean linear history with a single commit per change.
3. **Local Quality Verification:** All PRs must be verified locally via `make ci` before merge. GitHub Actions workflows are disabled to prevent burning action minutes.
4. **No Force Pushing:** Force pushes to `main` are disallowed.

## Notes

- Release drafts are intentionally non-publishing; promotion to a published release is manual.
- If local `make ci` fails with sandbox `listen EPERM`, run build/release checks in a non-restricted shell.
