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

## Getting Started

Choose one of the following three options to run the application:

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
    NEXTAUTH_SECRET=your-secret-here
    DATABASE_URL="postgresql://postgres:postgres@db:5432/contoso-db?schema=public"
    CHAT_ENDPOINT=http://localhost:8000/api/create_response
    LLM_PROVIDER=local
    LOCAL_MODEL_NAME=gemma3:12b
    PROJECT_ID=local
    ```

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
    NEXTAUTH_SECRET=your-secret-here
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contoso-db?schema=public"
    CHAT_ENDPOINT=http://localhost:8000/api/create_response
    LLM_PROVIDER=local
    PROJECT_ID=local
    ```

3.  **Run Migrations:**
    ```bash
    npx prisma migrate dev
    ```

4.  **Start Web App:**
    ```bash
    npm run dev
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

## Features

- **Product Catalog:** Browse products by category (Tents, Backpacks, etc.).
- **Dynamic Sidebar:** Responsive navigation sidebar with categories and support links.
- **Product Details:** Detailed product pages with images, descriptions, specifications, and manuals.
- **User Accounts:** Sign up, sign in, and manage your profile (Avatar, Address, Password).
- **About Us:** Learn about the company's mission and story (`/about`).
- **FAQ:** Common questions regarding ordering, shipping, and returns (`/faq`).
- **AI Chat Assistant:** Intelligent customer service chatbot powered by Gemini 2.5 Flash (Cloud) or Ollama (Local).
- **Category Filtering:** Dedicated pages for viewing products within specific categories.

## Database

The project uses a PostgreSQL database managed by Prisma.

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio (database GUI)
npx prisma studio
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
npm run dev                  # Start web app
npx prisma studio            # View database
```

### GCP Deployment (Option 3)
```bash
./infrastructure/scripts/setup_project.sh    # Deploy everything
./infrastructure/scripts/teardown_project.sh # Delete all resources
```