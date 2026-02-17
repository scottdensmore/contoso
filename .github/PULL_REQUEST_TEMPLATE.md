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
- [ ] `make test-scripts` (for runtime/scripts/docs automation changes)
- [ ] `make docs-check` (for docs/runbook changes)

### Optional / Contextual
- [ ] `make quick-ci`
- [ ] `make ci` (run outside restricted sandbox if `next build` hits `listen EPERM`)
- [ ] Manual UX/API validation

## Release and Ops Impact
- Env contract change: yes / no
- Migration required: yes / no
- Runbook updates needed: yes / no
- Follow-up tasks:

## Reviewer Notes
- Areas that need close review:
- Known limitations or deferred cleanup:
