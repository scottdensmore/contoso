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
COPY apps/web/.eslintrc.json ./
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

COPY apps/web/package*.json ./

# Production dependencies only, plus the two dev tools the entrypoint needs at
# runtime: the Prisma CLI for `migrate deploy`, and tsx for the seed script
# (see the `migrations.seed` command in prisma.config.ts).
RUN npm ci --omit=dev --no-audit --no-fund \
    && npm install --no-save --no-audit --no-fund \
        "prisma@$(node -p "require('./package.json').devDependencies.prisma")" \
        "tsx@$(node -p "require('./package.json').devDependencies.tsx")" \
    && npm cache clean --force

COPY apps/web/prisma ./prisma
COPY apps/web/prisma.config.ts ./prisma.config.ts
COPY apps/web/next.config.js ./

COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public

# The build cache is only useful for rebuilds, never at runtime.
RUN rm -rf .next/cache

# Regenerate the client against the runtime engines.
RUN npx prisma generate --generator client --schema prisma/schema.prisma

# Copy entrypoint script
COPY infrastructure/scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port 3000
EXPOSE 3000

# Use entrypoint script that runs migrations before starting the app
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
