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
- [ ] `make quick-ci-changed` or `make ci`
- [ ] Applicable merge-gate command(s) from `CONTRIBUTING.md`
- [ ] `make test-scripts` (for runtime/scripts/docs automation changes)

### Optional / Contextual
- [ ] `make quick-ci`
- [ ] Manual UX/API validation

### Before merge
- [ ] Pull request head still matches the reviewed SHA
- [ ] Full local verification (`make ci`) passed
- [ ] Ready for squash merge into `main`

## Release and Ops Impact
- Env contract change: yes / no
- Migration required: yes / no
- Runbook updates needed: yes / no
- Follow-up tasks:

## Reviewer Notes
- Areas that need close review:
- Known limitations or deferred cleanup:
