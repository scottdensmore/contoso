# Implementation Plan - Local LLM and Search Support

## Phase 1: Dependencies and Environment
- [x] Task: Update dependencies.
    - [x] Sub-task: Add `litellm`, `chromadb`, `sentence-transformers` (or `ollama` lib for embeddings) to `services/chat/src/api/requirements.txt`.
    - [x] Sub-task: Rebuild the chat service container to install new dependencies.
- [x] Task: Update `docker-compose.yml` and configs.
    - [x] Sub-task: Add `LLM_PROVIDER` and `OLLAMA_BASE_URL` environment variables to `docker-compose.yml`.

## Phase 2: Local Vector Store Implementation
- [x] Task: Create Indexing Script.
    - [x] Sub-task: Create `services/chat/scripts/index_products_local.py`.
    - [x] Sub-task: Implement logic to read products from Prisma (Postgres), generate embeddings, and save to `./data/chroma_db`.
- [x] Task: Verify Indexing.
    - [x] Sub-task: Run the indexing script locally (or inside container) to generate the vector store.

## Phase 3: Chat Service Refactoring
- [x] Task: Abstract Search Logic.
    - [x] Sub-task: Create `search_service.py` (or similar) with an interface for search.
    - [x] Sub-task: Implement `LocalVectorSearch` class using ChromaDB.
    - [x] Sub-task: Refactor `chat_request.py` to use the appropriate search implementation based on `LLM_PROVIDER`.
- [x] Task: Abstract LLM Logic.
    - [x] Sub-task: Update `chat_request.py` to use `litellm` for generation.
    - [x] Sub-task: Configure `litellm` to use Vertex AI (when `gcp`) or Ollama (when `local`).

## Phase 4: Verification
- [x] Task: Verify Local Chat.
    - [x] Sub-task: Ensure Ollama is running (`gemma:2b`).
    - [x] Sub-task: Run the indexing script.
    - [x] Sub-task: Start app with `LLM_PROVIDER=local`.
    - [x] Sub-task: Send a chat request and verify response and logs (ensure no GCP calls).
- [~] Task: Conductor - User Manual Verification 'Local LLM Support' (Protocol in workflow.md).
