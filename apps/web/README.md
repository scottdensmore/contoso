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
make build
make prisma-generate
```

## Prisma

The web app schema and migrations live in `apps/web/prisma/`.
