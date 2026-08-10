# AGENTS (Web)

Web app scope for coding agents. This file adds authoritative instructions for
`apps/web/`; apply it together with the repo-root `AGENTS.md`. Put instructions
here, never in `apps/web/CLAUDE.md` or `apps/web/GEMINI.md`.

## Entry points

- Routes: `src/app/`
- UI components: `src/components/`
- Domain and API clients: `src/lib/`
- Route tests: `src/app/**/*.test.tsx` and `src/app/**/*.test.ts`

## Local commands

From repository root:

```bash
make bootstrap
make agent-doctor
make dev-web
make lint
make typecheck
make test-web
npm run bootstrap
npm run doctor
npm run dev:web
npm run ci:web
```

From the web app directory:

```bash
make help
make setup
make dev
make quick-ci
make ci
```

## Chat integration touchpoints

- Web proxy route: `src/app/api/chat/service/route.ts`
- Web chat client: `src/lib/messaging.ts`

When changing a request or response shape, update the chat service and its tests
in `services/chat/` as part of the same change.

## Database access

Prisma 7 removed `url` from the schema's `datasource` block. The connection URL
now lives in two places, both reading `DATABASE_URL`:

- `prisma.config.ts` — used by `prisma migrate` and `prisma db seed`.
- A `PrismaPg` driver adapter passed to every `PrismaClient` constructor
  (`src/lib/prisma.ts` and `prisma/seed.ts`). Constructing `PrismaClient`
  without an adapter fails at runtime.

The production image builds with `NEXT_BUILD_SKIP_DB=1`, so anything Next
prerenders at build time captures the no-database response permanently. Route
handlers that read the database must opt out of static prerendering.

## Code Review Rules

- A route that reads the database must remain dynamic under the production
  `NEXT_BUILD_SKIP_DB=1` build. Flag a change that can bake a build-time empty or
  fallback response into the deployed route instead of evaluating it at request time.
- Treat the web proxy, `src/lib/messaging.ts`, and the FastAPI request/response
  models as one contract. A payload change is incomplete unless both surfaces and
  their contract tests agree, including error and degraded responses.
- For UI changes, review the rendered behavior rather than class names alone.
  Preserve keyboard/focus semantics and responsive states; when `srcset` or source
  dimensions change, require evidence at representative 1x and 2x densities.

## JavaScript, TypeScript, and React conventions

- Prefer functions, plain objects, and ES module boundaries when no instance identity
  or lifecycle is required. Plain objects are mutable; never mutate React state, and
  use a class when an external API or a test double genuinely requires one.
- Avoid `any` and unchecked type assertions at application boundaries. Accept
  `unknown`, validate or narrow it, and keep unavoidable assertions local with a
  reason the compiler cannot establish the type itself.
- Prefer non-mutating collection operations. `sort()` mutates; use `toSorted()` when
  supported or sort a deliberate copy such as `[...items].sort(...)`.
- Keep rendering pure and use functional components and Hooks. Effects synchronize
  with external systems; derive values during render or update them in event handlers
  when no external synchronization is involved. Clean up subscriptions and include
  the dependencies the effect reads.
- Do not assume React Compiler is enabled. Check the current Next configuration before
  relying on compiler memoization, and add `useMemo`, `useCallback`, or `React.memo`
  only when referential identity or measured performance makes it necessary.
- Keep environment access centralized, avoid service URLs in components, and prefer
  focused tests beside changed routes, components, and library modules.
