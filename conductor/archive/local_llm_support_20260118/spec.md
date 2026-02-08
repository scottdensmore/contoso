# Specification: Local LLM and Search Support for Chat Service

## Overview
This track aims to enable a fully local development experience for the AI Chat Service, removing the hard dependency on Google Cloud Platform (Vertex AI and Discovery Engine) for development. We will implement support for a local LLM (via Ollama) and a local vector search (via ChromaDB), toggled by an environment variable.

## Functional Requirements
- **Local LLM Integration:**
    - Use `litellm` to interface with the LLM.
    - Configure `litellm` to route requests to a local **Ollama** instance when `LLM_PROVIDER=local`.
    - Default local model: `gemma:2b`.
- **Local Vector Search Integration:**
    - Use `chromadb` as the local vector store.
    - Use `sentence-transformers` (or similar local embedding model via Ollama/LiteLLM) to generate embeddings.
    - Implement a local search function that replaces `search_products_vertex_ai` when `LLM_PROVIDER=local`.
- **Initialization Script:**
    - Create a script (e.g., `services/chat/scripts/index_products_local.py`) to fetch products from the PostgreSQL database, generate embeddings, and populate the local ChromaDB store.
- **Environment Configuration:**
    - Introduce `LLM_PROVIDER` env var (`gcp` [default] vs `local`).
    - Introduce `OLLAMA_BASE_URL` env var (default: `http://host.docker.internal:11434` for Docker access to host).

## Non-Functional Requirements
- **Modularity:** The chat logic (`chat_request.py`) should abstract the LLM and Search providers cleanly.
- **Developer Experience:** The setup should require minimal manual steps aside from running the indexing script and having Ollama running.

## Acceptance Criteria
- [ ] `services/chat/requirements.txt` includes `litellm`, `chromadb`, and embedding libraries.
- [ ] A script exists to index products from Postgres into a local ChromaDB.
- [ ] Setting `LLM_PROVIDER=local` makes the chat service use Ollama and ChromaDB.
- [ ] The chat service responds to queries locally without any GCP credentials.
- [ ] `search_products_vertex_ai` is NOT called when `LLM_PROVIDER=local`.

## Out of Scope
- Managing the Ollama process itself (assumed to be running on host).
- Production deployment of ChromaDB (this is for local dev only).
