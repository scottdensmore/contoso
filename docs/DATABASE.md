# Database Access and Migrations

This document details the architecture, management, and access patterns for the Contoso Outdoor PostgreSQL database.

## Architecture & Security

The database is a **Cloud SQL (PostgreSQL)** instance configured with **private IP only**.
- **Network:** Only accessible via the GCP VPC network or through a secure tunnel.
- **Connectivity:** Cloud Run services (Web and AI Chat) connect via a VPC Connector. See [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) for deployment details.

## Migrations & Seeding

### Production Migrations
Migrations run **automatically on application startup** via the Docker entrypoint script.
- **Command:** `prisma migrate deploy`
- **Logic:** Executed in `infrastructure/scripts/docker-entrypoint.sh`.

### Seeding
Initial data is sourced from `apps/web/public/*.json` files and managed by `apps/web/prisma/seed.ts`.
- **Manual Seed:** `cd apps/web && npx prisma db seed --schema prisma/schema.prisma`
- **Development:** Seeding occurs automatically after `npm install` or during `prisma migrate dev`.

## Local Development Access

Access the private database locally using the **Cloud SQL Proxy**.

### 1. Establish Secure Tunnel
```bash
./infrastructure/scripts/dev_db_proxy.sh
```
*Note: Requires `gcloud auth login` and `roles/cloudsql.client` IAM role.*

### 2. Run Local Migrations
With the proxy running, set your `DATABASE_URL` and execute:
```bash
export DATABASE_URL="postgresql://prismauser:<password>@localhost:5432/contoso-db"
cd apps/web && npx prisma migrate dev --schema prisma/schema.prisma
```

### 3. Database Tools (psql, pgAdmin)
- **Host:** `localhost`
- **Port:** `5432`
- **User:** `prismauser` (get password from `terraform output db_password`)

## Multi-Service Integration

Both the **Web App (Next.js)** and **AI Chat (FastAPI)** share the same database and schema.
- **Schema Source:** `apps/web/prisma/schema.prisma`.
- **Web App:** Manages users, products, and orders.
- **Chat Service:** Accesses product data for RAG and retrieves customer history.

## Troubleshooting

- **"Network unreachable":** Ensure you are using the Cloud SQL Proxy or running within the VPC.
- **Auth Errors:** Verify `gcloud auth login` and that you have the `Cloud SQL Client` role.
- **Connection Refused:** Ensure the proxy script is running and connected to the correct instance.
