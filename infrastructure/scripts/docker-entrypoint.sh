#!/bin/sh
set -e

PRISMA_SCHEMA="${PRISMA_SCHEMA:-/app/prisma/schema.prisma}"

echo "Running database migrations..."
npx prisma migrate deploy --schema "$PRISMA_SCHEMA"

echo "Seeding database..."
npx prisma db seed --schema "$PRISMA_SCHEMA"

echo "Starting application..."
exec npm start
