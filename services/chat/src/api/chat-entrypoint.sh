#!/bin/bash
set -e

echo "Starting Chat Service Entrypoint..."

provider="${LLM_PROVIDER:-gcp}"
if [[ "${provider}" == "local" ]]; then
    if python3 -c "import chromadb" >/dev/null 2>&1; then
        echo "Running local product indexing for vector search..."
        # Retry in case DB is still starting up.
        for i in {1..5}; do
            if python3 infrastructure/scripts/index_products_local.py; then
                break
            fi
            echo "Indexing attempt ${i} failed; retrying in 5s..."
            sleep 5
        done
    else
        echo "Skipping local product indexing: chromadb is not installed in this image."
        echo "Rebuild chat with CHAT_INSTALL_LOCAL_STACK=1 to enable local indexing."
    fi
else
    echo "Skipping local product indexing: LLM_PROVIDER=${provider}."
fi

echo "Starting Chat API..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --access-log
