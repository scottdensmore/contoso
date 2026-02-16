# AGENTS (Chat Service)

FastAPI chat service scope for coding agents.

## Entry points

- API app: `services/chat/src/api/main.py`
- Chat logic: `services/chat/src/api/contoso_chat/`
- Evaluators: `services/chat/src/api/evaluators/`
- Tests: `services/chat/tests/unit/`, `services/chat/tests/integration/`

## Local commands

From repository root:

```bash
make setup-chat
make dev-chat
make test-chat
```

Integration tests (service must already be running):

```bash
SERVICE_URL=http://localhost:8000 make test-chat-integration
```

## Environment

Use `services/chat/.env.example` as the baseline template.

Most common local values:

- `LLM_PROVIDER=local`
- `OLLAMA_BASE_URL=http://localhost:11434`
- `ALLOWED_ORIGINS=http://localhost:3000`

## Guardrails

- Preserve API compatibility for web callers in `apps/web/src/lib/messaging.ts`.
- If request or response schema changes, update both unit tests and web proxy behavior.
- Keep external provider configuration behind environment variables.
