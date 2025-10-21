# Contoso Outdoors Company Website

This is the Contoso Outdoors Company Website. It is built with Next.js, Tailwind CSS, and uses a PostgreSQL database with Prisma.

## Table of Contents

- [Local Development with Docker](#local-development-with-docker)
- [Deployment to Google Cloud Platform](#deployment-to-google-cloud-platform)
- [Database Management](#database)
- [Authentication](#authentication)

## Overview

This application can be run in two modes:

1. **Local Development** - Run the entire stack locally using Docker Compose with a local PostgreSQL database. Perfect for development and testing.

2. **Production on GCP** - Deploy to Google Cloud Platform with Cloud Run (application), Cloud SQL (database), and production-ready security configurations.

## Local Development with Docker

These instructions will get you a copy of the project running on your local machine for development and testing, using Docker Compose with a local PostgreSQL database.

> **Note:** This is completely separate from GCP deployment. For connecting to a GCP-hosted database, see the [GCP Deployment section](#deployment-to-google-cloud-platform).

### Prerequisites

*   [Docker](https://www.docker.com/) and Docker Compose
*   [Node.js 20+](https://nodejs.org/) (optional, for running outside containers)

### Quick Start

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/contoso.git
    cd contoso
    ```

2.  **Create a `.env` file:**

    Create a `.env` file in the root directory:

    ```bash
    # Generate a secret: openssl rand -base64 32
    NEXTAUTH_SECRET=your-generated-secret-here

    # Database URL for local Docker Compose
    DATABASE_URL="postgresql://postgres:postgres@db:5432/contoso?schema=public"
    ```

3.  **Start the application:**

    ```bash
    docker-compose up
    ```

    This will:
    - Start a PostgreSQL database container
    - Build and start the Next.js application container
    - Automatically run database migrations

    The application will be available at [http://localhost:3000](http://localhost:3000).

4.  **Stopping the application:**

    ```bash
    docker-compose down
    ```

    To also remove the database volume (deletes all data):
    ```bash
    docker-compose down -v
    ```

### Alternative: Local Development Without Docker

Run the application directly on your machine with only the database in Docker.

**Prerequisites:**
*   [Node.js 20+](https://nodejs.org/)
*   [Docker](https://www.docker.com/) (for the database only)

**Steps:**

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Start the database:**

    ```bash
    docker-compose up -d db
    ```

3.  **Update your `.env` file:**

    ```bash
    NEXTAUTH_SECRET=your-generated-secret-here

    # Note: host is 'localhost' not 'db' when running outside Docker
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contoso?schema=public"
    ```

4.  **Run database migrations:**

    ```bash
    npx prisma migrate dev
    ```

5.  **Start the development server:**

    ```bash
    npm run dev
    ```

    The application will be available at [http://localhost:3000](http://localhost:3000).

### Development Workflow

**Creating new database migrations:**

```bash
npx prisma migrate dev --name describe_your_changes
```

**Viewing the database:**

```bash
npx prisma studio
```

**Resetting the database:**

```bash
npx prisma migrate reset
```

## Database

The project uses a PostgreSQL database managed by Prisma.

### Local Development
- Uses Docker Compose with a local PostgreSQL container
- Database is seeded with initial data from JSON files in the `public` directory
- Seeding runs automatically after `npm install`
- Connection string: `postgresql://postgres:postgres@localhost:5432/contoso`

### Production (GCP)
- Uses Cloud SQL for PostgreSQL 15
- Private IP only (no public internet access)
- Migrations run via Cloud Run Jobs inside GCP network
- See [docs/DATABASE.md](docs/DATABASE.md) for detailed architecture and security information

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations (production-safe)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Authentication

Authentication is handled by NextAuth.js.

## Deployment to Google Cloud Platform

This section guides you through deploying the application to Google Cloud Platform with production-ready security configurations.

### Prerequisites

*   **Google Cloud SDK:** Install and authenticate with `gcloud auth login`
*   **Docker:** Required for building container images
*   **Terraform:** Installed automatically if needed
*   **Billing Account:** Your Google Cloud Billing Account ID
*   **Node.js 20+:** For local development

### Security Architecture

The deployment uses the following security best practices:

*   **Private Cloud SQL:** Database has no public IP and is only accessible within the GCP VPC
*   **VPC Connector:** Cloud Run services connect to the database via private networking
*   **Automatic Migrations:** Database migrations run automatically on application startup
*   **IAM Authentication:** Cloud SQL Proxy uses your GCP credentials for secure local access

For detailed information about database access, see [docs/DATABASE.md](docs/DATABASE.md).

### Environment Variables

Create a `.env` file in the root directory or export these variables:

```bash
export PROJECT_ID="contoso-outdoor"        # Your GCP project ID
export BILLING_ACCOUNT="YOUR_BILLING_ID"   # Your GCP billing account ID
export NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32
```

### Automated Deployment

Run the setup script to provision and deploy everything:

```bash
./scripts/setup_project.sh
```

This script performs the following steps:

1.  **Project Setup**
    - Creates or verifies the GCP project
    - Links billing account
    - Enables required APIs (Cloud SQL, Cloud Run, Artifact Registry, etc.)

2.  **Infrastructure Provisioning**
    - Creates Terraform service account and state bucket
    - Provisions Cloud SQL (PostgreSQL 15, private IP only)
    - Sets up VPC connector for private networking
    - Creates Artifact Registry repository

3.  **Application Deployment**
    - Builds and pushes application Docker image
    - Deploys to Cloud Run with environment variables
    - Configures VPC connector and Cloud SQL connection
    - Migrations run automatically on container startup

The script outputs your deployed application URL at the end.

### Local Development Against GCP Database

To connect to the production database from your local machine for debugging:

```bash
# Terminal 1: Start the Cloud SQL Proxy
./scripts/dev_db_proxy.sh

# Terminal 2: Run your application locally
npm run dev
```

The proxy creates a secure tunnel using your GCP IAM credentials. See [docs/DATABASE.md](docs/DATABASE.md) for more details.

### Managing Database Migrations

**Adding a new migration:**

1. Develop and test locally with Docker Compose
2. Create the migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Commit the migration files
4. Deploy the application - migrations run automatically:
   ```bash
   # Just deploy - migrations happen on startup!
   # Or re-run the setup script to deploy
   ./scripts/setup_project.sh
   ```

**Note:** Production uses `prisma migrate deploy` (runs automatically on startup), while local development uses `prisma migrate dev` (interactive).

### Tearing Down Resources

To delete all GCP resources and avoid charges:

```bash
./scripts/teardown_project.sh
```

This will destroy all infrastructure including the database (data will be lost).

---

## Quick Reference

### Local Development Commands

```bash
# Start everything with Docker Compose
docker-compose up

# Stop everything
docker-compose down

# Start only database (run app on host)
docker-compose up -d db

# View logs
docker-compose logs -f

# Run migrations
npx prisma migrate dev

# Open database GUI
npx prisma studio
```

### GCP Deployment Commands

```bash
# Full deployment
./scripts/setup_project.sh

# Connect to production database locally
./scripts/dev_db_proxy.sh

# Run production migrations
gcloud run jobs execute contoso-migrate --region us-central1 --wait

# View Cloud Run logs
gcloud run logs tail contoso-web --region us-central1

# Describe deployed service
gcloud run services describe contoso-web --region us-central1

# Tear down all resources
./scripts/teardown_project.sh
```

### Useful GCP Commands

```bash
# List Cloud SQL instances
gcloud sql instances list

# List Cloud Run services
gcloud run services list --region us-central1

# View Terraform outputs
cd terraform && terraform output

# Get database password
cd terraform && terraform output -raw db_password
```