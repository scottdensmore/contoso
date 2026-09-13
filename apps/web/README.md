# Web App

Next.js web application for Contoso Outdoors.

## Paths

- App routes: `apps/web/src/app/`
- Components: `apps/web/src/components/`
- Shared web lib: `apps/web/src/lib/`

## Local development

From repository root:

```bash
make bootstrap
make setup
make dev-web
npm run setup:web
npm run dev:web
make -C apps/web setup
make -C apps/web dev
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
make -C apps/web quick-ci
make -C apps/web ci
```

## Prisma

The web app schema and migrations live in `apps/web/prisma/`.

## TypeScript & ESLint Compatibility Tracking (#90)

- TypeScript is pinned to `^5` in `apps/web/package.json`.
- `eslint-config-next@16.3.3` bundles `typescript-eslint@^8.46.0`, which enforces a peer dependency of `typescript@">=4.8.4 <6.1.0"`.
- Upstream support for TypeScript 7+ is tracked at `typescript-eslint#10940`. Bumping to TypeScript 7 will be revisited once `typescript-eslint` and `eslint-config-next` officially support TypeScript >= 7.1.

