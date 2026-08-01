#!/bin/sh
set -e

PRISMA_SCHEMA="${PRISMA_SCHEMA:-/app/apps/web/prisma/schema.prisma}"

# The Prisma CLI and tsx are installed outside the traced standalone tree so
# they do not pull the full dependency graph back into the runtime image.
MIGRATE_BIN="${MIGRATE_BIN:-/opt/migrate/node_modules/.bin}"
if [ -d "$MIGRATE_BIN" ]; then
    PATH="$MIGRATE_BIN:$PATH"
    export PATH
fi

echo "Running database migrations..."
prisma migrate deploy --schema "$PRISMA_SCHEMA"

echo "Seeding database..."
prisma db seed --schema "$PRISMA_SCHEMA"

echo "Starting application..."
exec node server.js
