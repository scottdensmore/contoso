# Contoso Outdoors Company Website

A modern e-commerce website for "Contoso Outdoors" with integrated AI features, built with Next.js, Tailwind CSS, and PostgreSQL.

The web application source lives in `apps/web/`, and the chat service lives in `services/chat/`.

## Table of Contents

- [Quick Start](#getting-started)
- [Features](#features)
- [Project Documentation](#project-documentation)
- [Local Development](#option-2-local-development-hybrid)
- [Deployment](#option-3-deploy-to-google-cloud-platform-gcp)
- [Database](#database)
- [Authentication](#authentication)
- [Contributing](#contributing)

## Getting Started

Choose one of the following three options to run the application:

## Toolchain Baseline

Local development and coding-agent workflows are standardized on:

- Node.js `22`
- Python `3.11`

This repo uses `mise` for local runtime pinning:

```bash
mise install
```

### Option 1: Run Everything Locally (Docker)
**Best for:** Trying out the application quickly without installing dependencies.

This runs the Web App, AI Chat Service (with Local AI), and Database in containers. The database and search index are automatically set up on startup.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/contoso.git
    cd contoso
    ```

2.  **Prepare Local AI:**
    - Install [Ollama](https://ollama.com/) and run `ollama pull gemma3:12b`.

3.  **Create `.env`:**
    ```bash
    cp .env.example .env
    ```
    Then edit values as needed for your environment.

4.  **Start:**
    ```bash
    docker-compose up
    ```
    - Web App: [http://localhost:3000](http://localhost:3000)
    - Chat Service: [http://localhost:8000](http://localhost:8000)

### Option 2: Local Development (Hybrid)
**Best for:** developing the Next.js application with hot-reloading.

1.  **Start Database & Chat Service:**
    ```bash
    docker-compose up -d db chat
    ```

2.  **Configure `.env`:**
    ```bash
    cp .env.example .env
    ```
    Then edit values as needed for your environment.

3.  **Run Migrations:**
    ```bash
    make migrate
    ```

4.  **Start Web App:**
    ```bash
    make dev-web
    ```
    or
    ```bash
    npm run dev:web
    ```

### Option 3: Deploy to Google Cloud Platform (GCP)
**Best for:** Production deployment with Vertex AI.

1.  **Prerequisites:** Google Cloud SDK, Docker, Terraform, Billing Account.

2.  **Environment:**
    ```bash
    export PROJECT_ID="your-project-id"
    export BILLING_ACCOUNT="your-billing-id"
    export NEXTAUTH_SECRET="your-secret"
    ```

3.  **Deploy:**
    ```bash
    ./infrastructure/scripts/setup_project.sh
    ```
    This script provisions Cloud SQL, Cloud Run, and deploys the entire stack.

---

## Common Commands

The repository now includes a root `Makefile` for a consistent command surface:

```bash
make help
make toolchain-doctor
make setup
make dev
make test
make quick-ci
make ci
```

There is also a root `package.json` workspace command surface:

```bash
npm run setup
npm run dev:web
npm run dev:chat
npm run quick-ci
npm run quick-ci:chat
npm run ci:web
npm run ci:chat
npm run ci
```

Service-owned command surface:

```bash
make -C apps/web help
make -C apps/web setup
make -C apps/web dev
make -C apps/web ci
make -C services/chat help
make -C services/chat setup
make -C services/chat dev
make -C services/chat ci
```

For coding agents, see [AGENTS.md](./AGENTS.md).

## Features

- **Product Catalog:** Browse products by category (Tents, Backpacks, etc.).
- **Dynamic Sidebar:** Responsive navigation sidebar with categories and support links.
- **Product Details:** Detailed product pages with images, descriptions, specifications, and manuals.
- **User Accounts:** Sign up, sign in, and manage your profile (Avatar, Address, Password).
- **About Us:** Learn about the company's mission and story (`/about`).
- **FAQ:** Common questions regarding ordering, shipping, and returns (`/faq`).
- **AI Chat Assistant:** Intelligent customer service chatbot powered by Gemini 2.5 Flash (Cloud) or Ollama (Local).
- **Category Filtering:** Dedicated pages for viewing products within specific categories.

## Project Documentation

Comprehensive documentation is available in the [docs/](./docs/) directory:

- **[Database & Migrations](./docs/DATABASE.md):** Architecture, local access, and migration workflows.
- **[Infrastructure & Deployment](./docs/INFRASTRUCTURE.md):** GCP setup, rollbacks, and teardown procedures.
- **[Web App Runbook](./apps/web/README.md):** Web app development and verification commands.
- **[Chat Service Runbook](./services/chat/README.md):** Chat API local development and testing.
- **[Contributing Guide](./CONTRIBUTING.md):** Standards and workflow for developers.

## Database

The project uses a PostgreSQL database managed by Prisma.

### Prisma Commands

```bash
# Generate Prisma Client
make prisma-generate

# Create a new migration
cd apps/web && npx prisma migrate dev --schema prisma/schema.prisma --name your_migration_name

# Open Prisma Studio (database GUI)
cd apps/web && npx prisma studio --schema prisma/schema.prisma
```

## Authentication

Authentication is handled by NextAuth.js.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our development workflow, coding standards, and how to submit pull requests.

## Quick Reference

### Docker (Option 1)
```bash
docker-compose up      # Start all services
docker-compose down -v # Stop and remove data
```

### Local Dev (Option 2)
```bash
docker-compose up -d db chat # Start dependencies
make dev-web                 # Start web app
cd apps/web && npx prisma studio --schema prisma/schema.prisma  # View database
```

### GCP Deployment (Option 3)
```bash
./infrastructure/scripts/setup_project.sh    # Deploy everything
./infrastructure/scripts/teardown_project.sh # Delete all resources
```
