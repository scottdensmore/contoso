# Database Access and Migrations

## Security Architecture

The Cloud SQL database is configured with **private IP only** for security:
- No public IP address exposed to the internet
- Only accessible from within the GCP VPC network
- Uses VPC peering for secure connectivity

## Production Migrations

Database migrations run **automatically on application startup** via the Docker entrypoint script:
- Executes `prisma migrate deploy` before starting the Next.js server
- Runs within the Cloud Run container (has access to private Cloud SQL via VPC connector)
- Non-interactive and production-safe
- Happens on every deployment ensuring schema is always up-to-date

The migration logic is in `infrastructure/scripts/docker-entrypoint.sh` and is executed via the `Dockerfile` ENTRYPOINT.

## Seeding Strategy

The database is seeded with initial data to provide a complete experience out of the box. The data is sourced from JSON files in the `public` directory:
- `public/categories.json`
- `public/brands.json`
- `public/products.json`

The seed script (`prisma/seed.ts`) handles the creation of all models and their relationships. In development, seeding happens automatically after `npm install` or during `npx prisma migrate dev`.

To manually run the seed script:
```bash
npx prisma db seed
```

## Local Development Access

For local development and debugging, you can use the Cloud SQL Proxy to create a secure tunnel:

```bash
./infrastructure/scripts/dev_db_proxy.sh
```

This script:
1. Downloads the correct Cloud SQL Proxy binary for your OS/architecture
2. Uses your personal GCP credentials to authenticate
3. Creates a secure tunnel to the private database
4. Exposes the database on `localhost:5432`

**Important**: The proxy uses your GCP IAM credentials, so you must:
- Be authenticated with `gcloud auth login`
- Have the `roles/cloudsql.client` role on the project

### Running Local Migrations (Development Only)

With the proxy running in one terminal, you can run migrations locally:

```bash
# In terminal 1
./infrastructure/scripts/dev_db_proxy.sh

# In terminal 2
export DATABASE_URL="postgresql://prismauser:<password>@localhost:5432/contoso-db"
npx prisma migrate dev
```

### Connecting with Database Tools

You can use tools like `psql`, pgAdmin, or database GUIs:

```bash
# Get credentials
cd infrastructure/terraform
terraform output db_user      # prismauser
terraform output db_password  # the password

# Connect via proxy
psql -h localhost -p 5432 -U prismauser -d contoso-db
```

## How It Works

```
┌─────────────────┐
│ Your Local      │
│ Machine         │
└────────┬────────┘
         │ Cloud SQL Proxy
         │ (uses your GCP credentials)
         │
         ▼
┌─────────────────┐
│ GCP VPC         │
│  Network        │
│                 │
│  ┌───────────┐  │
│  │  Cloud    │  │
│  │  SQL      │  │
│  │ (Private) │  │
│  └───────────┘  │
└─────────────────┘
```

For Cloud Run:
```
┌─────────────────┐
│ Cloud Run Job   │
│ (Migration)     │
└────────┬────────┘
         │ VPC Connector
         │
         ▼
┌─────────────────┐
│ GCP VPC         │
│  Network        │
│                 │
│  ┌───────────┐  │
│  │  Cloud    │  │
│  │  SQL      │  │
│  │ (Private) │  │
│  └───────────┘  │
└─────────────────┘
```

## Migration Workflow

### Initial Setup
1. `infrastructure/scripts/setup_project.sh` runs Terraform to create the database
2. Script builds the migration Docker image
3. Script creates a Cloud Run Job and executes it
4. Migration job runs `prisma migrate deploy` inside GCP
5. Application is deployed

### Adding New Migrations

1. Develop locally with Docker Compose or the dev proxy
2. Create migration: `npx prisma migrate dev --name your_migration_name`
3. Test locally
4. Commit the migration files
5. Deploy the application - migrations run automatically on startup:
   ```bash
   # Migrations happen automatically during deployment
   # No separate migration step needed!
   ```

## Troubleshooting

### "network is unreachable" error
- The database only has a private IP
- You must use the Cloud SQL Proxy or run migrations in Cloud Run

### Authentication errors
- Ensure you're authenticated: `gcloud auth login`
- Verify you have Cloud SQL Client role
- Check the password is correct: `cd terraform && terraform output db_password`

### Proxy won't connect
- Verify the instance exists: `gcloud sql instances list`
- Check your GCP project is set: `gcloud config get-value project`
- Ensure you have the correct instance connection name