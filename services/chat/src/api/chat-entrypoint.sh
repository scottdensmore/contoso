#!/bin/bash
set -e

echo "Starting Chat Service Entrypoint..."

provider="${LLM_PROVIDER:-gcp}"
if [[ "${provider}" == "local" ]]; then
    local_model="${LOCAL_MODEL_NAME:-gemma3:12b}"
    ollama_base_url="${OLLAMA_BASE_URL:-http://host.docker.internal:11434}"

    echo "Running local-provider preflight..."

    if ! python3 -c "import chromadb, litellm" >/dev/null 2>&1; then
        echo "ERROR: Local provider dependencies are not installed in this image." >&2
        echo "Rebuild chat with CHAT_INSTALL_LOCAL_STACK=1 or install requirements-local.txt." >&2
        exit 1
    fi

    if ! python3 - "${ollama_base_url}" "${local_model}" <<'PY'
import json
import sys
import urllib.error
import urllib.request

base_url = sys.argv[1].rstrip("/")
model_name = sys.argv[2]
tags_url = f"{base_url}/api/tags"

try:
    with urllib.request.urlopen(tags_url, timeout=8) as response:
        payload = json.loads(response.read().decode("utf-8"))
except (urllib.error.URLError, TimeoutError, ValueError) as exc:
    print(f"ERROR: Unable to reach Ollama tags endpoint at {tags_url}: {exc}", file=sys.stderr)
    sys.exit(1)

available_models = sorted(
    model["name"]
    for model in payload.get("models", [])
    if isinstance(model, dict) and isinstance(model.get("name"), str)
)

if model_name not in available_models:
    if available_models:
        print(
            f"ERROR: LOCAL_MODEL_NAME '{model_name}' not found in Ollama models: {', '.join(available_models)}",
            file=sys.stderr,
        )
    else:
        print("ERROR: Ollama returned no installed models.", file=sys.stderr)
    sys.exit(1)

print(f"Ollama preflight passed for model '{model_name}'.")
PY
    then
        echo "Local-provider preflight failed. Start Ollama and ensure the model exists:" >&2
        echo "  ollama serve" >&2
        echo "  ollama pull ${local_model}" >&2
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
