#!/bin/bash
set -e

echo "Starting Chat Service Entrypoint..."

# Run indexing in the background or wait for DB?
# Better to run it and let it fail/retry if DB isn't ready, or wait.
echo "Running local product indexing for vector search..."
# We'll retry a few times in case the DB is still starting up
for i in {1..5}; do
    python3 infrastructure/scripts/index_products_local.py && break || sleep 5
done

echo "Starting Chat API..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --access-log
