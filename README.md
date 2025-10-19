# Contoso Outdoors Company Website

This is the Contoso Outdoors Company Website. It is built with Next.js, Tailwind CSS, and uses a PostgreSQL database with Prisma.

## Getting Started with Docker

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes using Docker.

### Prerequisites

*   [Docker](https://www.docker.com/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/contoso.git
    cd contoso
    ```

2.  **Create a `.env` file:**

    Create a `.env` file in the root of the project and add the following environment variable. You can generate a secret with `openssl rand -base64 32`.

    ```
    NEXTAUTH_SECRET=
    ```

3.  **Start the application:**

    ```bash
    docker-compose up
    ```

    The first time you run this command, it will build the Docker image and download the necessary dependencies.

4.  **Run database migrations:**

    In a separate terminal, run the following command:

    ```bash
    docker-compose exec web npx prisma migrate dev
    ```

    The application should now be running at [http://localhost:3000](http://localhost:3000).

## Alternative: Local Development

If you prefer to run the application without Docker, you can follow these steps.

### Prerequisites

*   [Node.js](https://nodejs.org/)
*   [Docker](https://www.docker.com/) (for the database)

### Installation

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Start the database:**

    ```bash
    docker-compose up -d db
    ```

3.  **Run database migrations:**

    ```bash
    npx prisma migrate dev
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    The application should now be running at [http://localhost:3000](http://localhost:3000).

## Database

The project uses a PostgreSQL database managed by Prisma. The database is seeded with initial data from the JSON files in the `public` directory. The seeding process is run automatically after `npm install`.

## Authentication

Authentication is handled by NextAuth.js.

## Fully Automated Deployment to a New Google Cloud Project

This section will guide you through a fully automated deployment to a new Google Cloud project.

### Prerequisites

*   **Google Cloud SDK:** Make sure you have the `gcloud` CLI installed and authenticated. You can authenticate by running `gcloud auth login`.
*   **Docker:** Make sure you have Docker installed and running.
*   **Billing Account:** You will need your Google Cloud Billing Account ID.

### Environment Variables

The `setup_project.sh` script uses the following environment variables. You can set them in your shell or create a `.env` file and source it.

```bash
export PROJECT_ID="your-gcp-project-id" # Optional, a unique one will be generated if not set
export BILLING_ACCOUNT="YOUR_BILLING_ACCOUNT" # Required
export NEXTAUTH_SECRET="your-nextauth-secret" # Required
```

### Deployment

Run the `setup_project.sh` script to create a new Google Cloud project and deploy the application:

```bash
./scripts/setup_project.sh
```

This script will:
1.  Create a new Google Cloud project.
2.  Link the project to your billing account.
3.  Enable the necessary Google Cloud services.
4.  Create a service account for Terraform.
5.  Create a Google Cloud Storage bucket for the Terraform state.
6.  Run Terraform to provision the infrastructure (Cloud SQL, Cloud Run, etc.).
7.  Build and push the Docker image to Google Artifact Registry.
8.  Deploy the application to Google Cloud Run.
9.  Update the Cloud Run service with the `NEXTAUTH_URL` environment variable.

At the end of the script, it will output the URL of your deployed application.