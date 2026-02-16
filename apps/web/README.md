# Web App

Next.js web application for Contoso Outdoors.

## Paths

- App routes: `apps/web/src/app/`
- Components: `apps/web/src/components/`
- Shared web lib: `apps/web/src/lib/`

## Local development

From repository root:

```bash
make setup
make dev-web
npm run setup:web
npm run dev:web
```

Run web with dependencies (db + chat) in Docker:

```bash
make dev
```

## Checks

From repository root:

```bash
make lint
make typecheck
make test-web
make quick-ci-web
make build
make prisma-generate
npm run quick-ci:web
npm run ci:web
```

## Prisma

The web app schema and migrations live in `apps/web/prisma/`.
