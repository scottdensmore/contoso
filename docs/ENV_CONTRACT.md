# Environment Contract

`config/env_contract.json` is the source of truth for required environment keys.

Any change to required keys must update all of:

1. `config/env_contract.json`
2. `.env.example` and/or `services/chat/.env.example`
3. this file marker blocks

Validate drift with:

```bash
make env-contract-check
```

## Root `.env` Required Keys

<!-- BEGIN:ROOT_REQUIRED_KEYS -->
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `CHAT_ENDPOINT`
<!-- END:ROOT_REQUIRED_KEYS -->

## Chat `services/chat/.env` Required Keys

<!-- BEGIN:CHAT_REQUIRED_KEYS -->
- `DATABASE_URL`
- `LLM_PROVIDER`
- `ALLOWED_ORIGINS`
<!-- END:CHAT_REQUIRED_KEYS -->
