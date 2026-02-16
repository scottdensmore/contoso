# Technology Stack

## Core Technologies
- **Languages:**
  - [TypeScript](https://www.typescriptlang.org/) - Provides static typing for safer and more maintainable code in the web application.
  - [Python](https://www.python.org/) - Powering the AI Chat service and data processing scripts.
- **Frameworks:**
  - [Next.js](https://nextjs.org/) (App Router) - Main web framework for the frontend and application logic.
  - [FastAPI](https://fastapi.tiangolo.com/) - High-performance web framework used for the Python AI Chat service.
- **UI Library:** [React](https://reactjs.org/) - A JavaScript library for building component-based user interfaces.

## Styling
- **CSS Framework:** [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development and consistent styling.

## AI & Machine Learning
- **Platform:** [Google Cloud Vertex AI](https://cloud.google.com/vertex-ai) - For powering the AI Chat Assistant and other integrated AI features.
- **Search:** [Discovery Engine](https://cloud.google.com/generative-ai-app-builder/docs/discovery-engine-overview) - For grounding the AI assistant with product manuals and documentation.
- **Model Orchestration:** [LiteLLM](https://github.com/BerriAI/litellm) - Used for routing LLM requests between GCP Vertex AI and local Ollama.
- **Local Models:** [Ollama](https://ollama.com/) - For running local LLMs (e.g., `gemma:2b`) during development.
- **Local Search:** [ChromaDB](https://www.trychroma.com/) - Persistent vector store for local product search.

## Database & Data Management
- **Database:** [PostgreSQL](https://www.postgresql.org/) - A powerful, open-source object-relational database system.
- **ORM:** [Prisma](https://www.prisma.io/) - Unified ORM for Node.js (TypeScript) and Python, providing type-safe database access across both services.

## Authentication
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) - A complete open-source authentication solution for Next.js applications.

## Infrastructure & Deployment
- **Cloud Provider:** [Google Cloud Platform (GCP)](https://cloud.google.com/)
  - **Compute:** Cloud Run - For running containerized applications in a fully managed environment.
  - **Databases:**
    - Cloud SQL for PostgreSQL - Fully managed PostgreSQL database service for the main application and AI Chat service.
- **Infrastructure as Code (IaC):** [Terraform](https://www.terraform.io/) - For provisioning and managing cloud infrastructure through configuration files.
- **CI/CD Strategy:** Test-focused Continuous Integration via GitHub Actions, performing automated linting, unit testing, and build verification for both the web application and chat service.

## Development Tools
- **Containerization:** [Docker](https://www.docker.com/) - For consistent local development and production environments.
