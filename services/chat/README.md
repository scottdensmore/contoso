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

Service endpoint: `http://localhost:8000`

### Option 2: Run directly with Python

1. Install dependencies (from repository root):

```bash
make setup-chat
```

2. Create env file:

```bash
cp services/chat/.env.example services/chat/.env
```

3. Start service:

```bash
make dev-chat
```

## Endpoints

- `GET /health`
- `POST /api/create_response`

## Tests

From repository root:

```bash
make test-chat
SERVICE_URL=http://localhost:8000 make test-chat-integration
```

## Environment

Use `services/chat/.env.example` for local defaults and provider settings.
