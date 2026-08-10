## Summary
- What changed:
- Why:

## Scope
- Surface: web / chat / runtime / docs / infra
- Risk level: low / medium / high
- Breaking change: yes / no

## Verification Evidence
Paste command output snippets or concise summaries for what you actually ran.

### Required
- [ ] `make quick-ci-changed`
- [ ] Applicable merge-gate command(s) from the `AGENTS.md` validation matrix
- [ ] `make test-scripts` (for runtime/scripts/docs automation changes)
- [ ] `make docs-check` (for docs/runbook changes)
- [ ] `ui-review`: rendered evidence, static fallback, or concrete not-applicable reason
- [ ] `verifier`: verdict and exact commands
- [ ] `code-review`: no defects; refinements recorded below

### Optional / Contextual
- [ ] `make quick-ci`
- [ ] Manual UX/API validation

### Before merge
- [ ] Pull request head still matches the reviewed SHA
- [ ] GitHub reports a clean merge state and all configured checks pass

## Release and Ops Impact
- Env contract change: yes / no
- Migration required: yes / no
- Runbook updates needed: yes / no
- Follow-up tasks:

## Reviewer Notes
- Areas that need close review:
- Known limitations or deferred cleanup:
