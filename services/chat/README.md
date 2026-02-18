# Chat Service

FastAPI service for Contoso chat responses.

## Paths

- API app: `services/chat/src/api/main.py`
- Domain logic: `services/chat/src/api/contoso_chat/`
- Tests: `services/chat/tests/`

## Local development

### Option 1: Run with Docker (recommended with web app)

From repository root:

```bash
docker compose up -d db chat
```

The default chat Docker image uses a lightweight dependency profile.
Enable local LLM/vector dependencies when needed:

```bash
CHAT_INSTALL_LOCAL_STACK=1 docker compose up -d --build chat
```

Use profile-oriented smoke commands from repo root:

```bash
make e2e-smoke-lite # core/default profile
make e2e-smoke-full # full local-provider profile
```

Service endpoint: `http://localhost:8000`

### Option 2: Run directly with Python

1. Install pinned tool versions (from repository root):

```bash
mise install
```

2. Install dependencies (from repository root):

```bash
make bootstrap
make setup-chat
make setup-chat-full # optional: include local LLM/vector dependencies
make prisma-generate-chat
npm run setup:chat
npm run setup:chat:full # optional: include local LLM/vector dependencies
make -C services/chat setup
make -C services/chat setup-full # optional: include local LLM/vector dependencies
```

3. Create env file:

```bash
cp services/chat/.env.example services/chat/.env
```

4. Start service:

```bash
make dev-chat
npm run dev:chat
make -C services/chat dev
```

### Dependency profiles

- Core (default): `make -C services/chat setup` or `make -C services/chat setup-core`
- Full (local-provider): `make -C services/chat setup-full`

## Endpoints

- `GET /health`
- `GET /health/dependencies`
- `POST /api/create_response`

## Tests

From repository root:

```bash
make test-chat
SERVICE_URL=http://localhost:8000 make test-chat-integration
npm run quick-ci:chat
npm run ci:chat
make -C services/chat test
make -C services/chat test-integration
make -C services/chat check-python
make -C services/chat deps-check
make -C services/chat lint
make -C services/chat typecheck
make -C services/chat quick-ci
make -C services/chat ci
```

## Environment

Use `services/chat/.env.example` for local defaults and provider settings.

When running with `LLM_PROVIDER=local`, ensure optional local dependencies are installed
(`services/chat/src/api/requirements-local.txt`) via `make -C services/chat setup-full`
or build Docker chat with `CHAT_INSTALL_LOCAL_STACK=1`.
