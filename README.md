# Contoso Outdoors Company Website

A modern e-commerce website for "Contoso Outdoors" with integrated AI features, built with Next.js, Tailwind CSS, and PostgreSQL.

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Local Development](#local-development)
- [Deployment](#deployment-to-google-cloud-platform)
- [Database](#database)
- [Authentication](#authentication)
- [Contributing](#contributing)

## Quick Start

The fastest way to get the application running locally is using Docker Compose.

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
    DATABASE_URL="postgresql://postgres:postgres@db:5432/contoso-db?schema=public"
    ```

3.  **Start the application:**

    ```bash
    docker-compose up
    ```

    This will:
    - Start a PostgreSQL database container
    - Build and start the Next.js application container
    - Build and start the Python AI Chat service container
    - Automatically run database migrations and seed data

    The web application will be available at [http://localhost:3000](http://localhost:3000) and the chat service at [http://localhost:8000](http://localhost:8000).

4.  **Stopping the application:**

    ```bash
    docker-compose down
    ```

    To also remove the database volume (deletes all data):
    ```bash
    docker-compose down -v
    ```

## Features

- **Product Catalog:** Browse products by category (Tents, Backpacks, etc.).
- **Dynamic Sidebar:** Responsive navigation sidebar with categories and support links.
- **Product Details:** Detailed product pages with images, descriptions, specifications, and manuals.
- **User Accounts:** Sign up, sign in, and manage your profile (Avatar, Address, Password).
- **About Us:** Learn about the company's mission and story (`/about`).
- **FAQ:** Common questions regarding ordering, shipping, and returns (`/faq`).
- **AI Chat Assistant:** Intelligent customer service chatbot powered by Gemini 2.5 Flash.
- **Category Filtering:** Dedicated pages for viewing products within specific categories.

## AI Chat Service

The AI Chat Assistant is a Python-based FastAPI service that uses Retrieval-Augmented Generation (RAG) to provide contextual responses based on product manuals and customer data.

### Overview

Contoso Chat uses a Retrieval-Augmented Generation (RAG) pattern to provide contextual, accurate responses based on:
1.  **Product Catalog:** Grounded by Vertex AI Search (Discovery Engine).
2.  **Customer Context:** Personalized responses based on profile and order history from PostgreSQL.

### Architecture

- **Backend:** FastAPI (Python 3.10+)
- **LLM:** Google Vertex AI (Gemini 2.5 Flash)
- **Vector Search:** Google Cloud Discovery Engine
- **Database:** PostgreSQL (Cloud SQL) via Prisma
- **Orchestration:** Prompty for prompt management

### Local Development (Python)

If you wish to run the chat service independently of Docker:

1.  **Install dependencies:**
    ```bash
    cd services/chat
    pip install -r src/api/requirements.txt
    ```

2.  **Configure Environment:**
    Create a `.env` file in `services/chat/src/api/` (or set environment variables):
    ```env
    PROJECT_ID=your-project-id
    REGION=us-central1
    ENVIRONMENT=dev
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contoso-db?schema=public"
    ```

3.  **Run the service:**
    ```bash
    cd services/chat/src/api
    uvicorn main:app --reload --port 8000
    ```

### Key API Endpoints

- `GET /health`: Service health check.
- `POST /api/create_response`: Generate an AI response.

### Deployment

The chat service is deployed as a Google Cloud Run service via the unified infrastructure configuration in the root `infrastructure/` directory.

## Local Development

For active development, it is recommended to run the database in Docker and the application on your host machine to enable hot-reloading and faster feedback loops.

### Prerequisites
*   [Node.js 20+](https://nodejs.org/)
*   [Docker](https://www.docker.com/) (for the database)

### Steps

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Start the database:**

    ```bash
    docker-compose up -d db
    ```

3.  **Update your `.env` file:**

    Ensure `DATABASE_URL` points to `localhost` instead of `db`:

    ```bash
    NEXTAUTH_SECRET=your-generated-secret-here
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contoso-db?schema=public"
    ```

4.  **Run database migrations and seed:**

    ```bash
    npx prisma migrate dev
    # This command creates the database schema and runs the seed script automatically
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

**Running Tests:**

```bash
npm test
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our development workflow, coding standards, and how to submit pull requests.

## Database

The project uses a PostgreSQL database managed by Prisma.

### Database Setup

To set up the database locally, run the following commands:

1.  **Generate the Prisma Client:**
    ```bash
    npx prisma generate
    ```

2.  **Push the schema to the database:**
    ```bash
    npx prisma db push
    ```

3.  **Seed the database with initial data:**
    ```bash
    npx prisma db seed
    ```

### Local Development
- Uses Docker Compose with a local PostgreSQL container
- Database is seeded with initial data from JSON files in the `public` directory
- Connection string: `postgresql://postgres:postgres@localhost:5432/contoso-db?schema=public`

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
./infrastructure/scripts/setup_project.sh
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
./infrastructure/scripts/dev_db_proxy.sh

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
   ./infrastructure/scripts/setup_project.sh
   ```

**Note:** Production uses `prisma migrate deploy` (runs automatically on startup), while local development uses `prisma migrate dev` (interactive).

### Tearing Down Resources

To delete all GCP resources and avoid charges:

```bash
./infrastructure/scripts/teardown_project.sh
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
./infrastructure/scripts/setup_project.sh

# Connect to production database locally
./infrastructure/scripts/dev_db_proxy.sh

# Run production migrations
gcloud run jobs execute contoso-migrate --region us-central1 --wait

# View Cloud Run logs
gcloud run logs tail contoso-web --region us-central1

# Describe deployed service
gcloud run services describe contoso-web --region us-central1

# Tear down all resources
./infrastructure/scripts/teardown_project.sh
```

### Useful GCP Commands

```bash
# List Cloud SQL instances
gcloud sql instances list

# List Cloud Run services
gcloud run services list --region us-central1

# View Terraform outputs
cd infrastructure/terraform && terraform output

# Get database password
cd infrastructure/terraform && terraform output -raw db_password
```
