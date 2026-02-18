#!/bin/bash
set -e

echo "Starting Chat Service Entrypoint..."

provider="${LLM_PROVIDER:-gcp}"
if [[ "${provider}" == "local" ]]; then
    echo "Running local-provider preflight..."

    if ! python3 local_provider_health.py; then
        echo "Local-provider preflight failed. Start Ollama and ensure the model exists:" >&2
        echo "  ollama serve" >&2
        echo "  ollama pull \${LOCAL_MODEL_NAME:-gemma3:12b}" >&2
        exit 1
    fi

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
    echo "Skipping local product indexing: LLM_PROVIDER=${provider}."
fi

echo "Starting Chat API..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --access-log
