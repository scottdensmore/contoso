# AGENTS (Web)

Web app scope for coding agents.

## Entry points

- Routes: `src/app/`
- UI components: `src/components/`
- Domain and API clients: `src/lib/`
- Route tests: `src/app/**/*.test.tsx` and `src/app/**/*.test.ts`

## Local commands

From repository root:

```bash
make dev-web
make lint
make typecheck
make test-web
```

## Chat integration touchpoints

- Web proxy routes: `src/app/api/chat/service/route.ts`, `src/app/api/chat/visual/route.ts`
- Web chat client: `src/lib/messaging.ts`

When changing request/response shape, update chat service and tests in `services/chat/` as part of the same change.

## Guardrails

- Keep environment usage centralized and explicit.
- Avoid hard-coding service URLs in component code.
- Prefer tests alongside changed route modules and lib functions.
