# Multi-stage build: the runtime image ships production dependencies and build
# output only. A single-stage build carried the full dev toolchain (typescript,
# eslint, vitest, tailwind) into the final image and pushed it past the e2e
# size budget.

# ---- deps: full dependency tree, needed only to build ----
FROM node:22-alpine AS deps

# Install dependencies needed for sharp and prisma
RUN apk add --no-cache libc6-compat

WORKDIR /app/apps/web
COPY apps/web/package*.json ./
RUN npm ci --no-audit --no-fund

# ---- builder: generate the Prisma client and build Next.js ----
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app/apps/web

# Provide a build-time DATABASE_URL so Prisma client init does not fail on missing env.
ARG DATABASE_URL=postgresql://postgres:postgres@db:5432/contoso-db
ENV DATABASE_URL=${DATABASE_URL}

COPY --from=deps /app/apps/web/node_modules ./node_modules
COPY apps/web/package*.json ./
COPY apps/web/src ./src
COPY apps/web/public ./public
COPY apps/web/next.config.js ./
COPY apps/web/tsconfig.json ./
COPY apps/web/tailwind.config.ts ./
COPY apps/web/postcss.config.js ./
COPY apps/web/eslint.config.mjs ./
COPY apps/web/prisma ./prisma
COPY apps/web/prisma.config.ts ./prisma.config.ts

RUN npx prisma generate --generator client --schema prisma/schema.prisma

# Build the Next.js application without hitting DB-backed routes at image build time.
RUN NEXT_BUILD_SKIP_DB=1 npm run build

# ---- runner: production runtime ----
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app/apps/web

ARG DATABASE_URL=postgresql://postgres:postgres@db:5432/contoso-db
ENV DATABASE_URL=${DATABASE_URL}
ENV NODE_ENV=production

# Migration tooling lives in its own prefix, deliberately outside the traced
# standalone tree. Installing it into /app/apps/web would mean running
# `npm install` against the standalone package.json, which still lists every
# original dependency and would reinstall the full tree we just pruned away.
COPY apps/web/package.json /tmp/web-package.json
RUN mkdir -p /opt/migrate \
    && cd /opt/migrate \
    && npm init -y > /dev/null \
    && npm install --no-audit --no-fund \
        "prisma@$(node -p "require('/tmp/web-package.json').devDependencies.prisma")" \
        "tsx@$(node -p "require('/tmp/web-package.json').devDependencies.tsx")" \
        "@prisma/adapter-pg@$(node -p "require('/tmp/web-package.json').dependencies['@prisma/adapter-pg']")" \
        "pg@$(node -p "require('/tmp/web-package.json').dependencies.pg")" \
    && npm cache clean --force \
    && rm /tmp/web-package.json

# The traced server bundle carries its own minimal node_modules, and since
# Next 16 it also carries public/. Copying public/ separately would duplicate
# ~730MB into a second layer, since image size sums layers rather than the
# merged filesystem. static/ is still not included, so it stays explicit.
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static

# Tracing does not reliably pick up the generated Prisma client, which the app
# and the seed script both import.
COPY --from=builder /app/apps/web/node_modules/.prisma ./node_modules/.prisma

COPY apps/web/prisma ./prisma
COPY apps/web/prisma.config.ts ./prisma.config.ts

# prisma.config.ts does `import { defineConfig } from 'prisma/config'`, resolved
# from this directory, and `prisma db seed` runs `npx tsx ./prisma/seed.ts`,
# which resolves from the local .bin first. seed.ts imports the driver adapter,
# which the build bundles into the server chunks rather than emitting as a
# traced package. Link all three into the standalone tree; Node follows the
# symlinks to /opt/migrate, where their own deps resolve.
RUN mkdir -p node_modules/.bin node_modules/@prisma \
    && ln -sf /opt/migrate/node_modules/prisma node_modules/prisma \
    && ln -sf /opt/migrate/node_modules/.bin/tsx node_modules/.bin/tsx \
    && ln -sf /opt/migrate/node_modules/@prisma/adapter-pg node_modules/@prisma/adapter-pg

# Copy entrypoint script
COPY infrastructure/scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# The standalone server reads these rather than next.config.js at runtime.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Expose port 3000
EXPOSE 3000

# Use entrypoint script that runs migrations before starting the app
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
