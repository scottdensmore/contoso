## Contoso Chat Project Overview

This project implements "Contoso Chat", a RAG-based retail copilot for an online outdoor equipment retailer. The copilot assists customers by answering questions and providing product recommendations based on their purchase history and the retailer's product data.

The application is built using a code-first approach with Azure AI and Prompty. It leverages several Azure services, including:

*   **Azure OpenAI:** For chat, embeddings, and evaluation models.
*   **Azure AI Search:** For semantic similarity search on product data.
*   **Azure Cosmos DB:** For storing customer order history.
*   **Azure Container Apps:** For hosting the FastAPI-based chat AI endpoint.

The project also includes a comprehensive workshop and documentation to guide developers through the process of building, evaluating, and deploying the application.

### Building and Running

The project uses the Azure Developer CLI (`azd`) for provisioning and deployment.

**To build and run the project:**

1.  **Prerequisites:**
    *   Azure subscription
    *   GitHub account
    *   Access to Azure OpenAI Services
    *   Azure Developer CLI (`azd`)
    *   Python 3.10+
    *   Docker Desktop
    *   Git

2.  **Setup:**
    *   The recommended setup is to use GitHub Codespaces or VS Code Dev Containers, which provide a pre-configured development environment.
    *   For a local setup, you need to install the required tools and dependencies manually.

3.  **Provision and Deploy:**
    *   Authenticate with Azure using `az login` and `azd auth login`.
    *   Run `azd up` to provision the Azure infrastructure and deploy the application. This command will create the necessary resources, including the Azure Container App, and deploy the FastAPI application to it.

4.  **Testing:**
    *   **Manual Testing:** The deployed application can be tested via the Swagger UI at the `/docs` endpoint of the Azure Container App URL.
    *   **Automated Evaluation:** The project includes a Jupyter notebook (`src/api/evaluate-chat-flow.ipynb`) for AI-assisted evaluation of the chat responses.

### Development Conventions

*   **Infrastructure as Code:** The project uses Bicep to define the Azure infrastructure in a declarative way.
*   **Prompty:** The chat prompts are defined using Prompty, a tool for creating and managing prompts.
*   **FastAPI:** The backend API is built using FastAPI, a modern, fast (high-performance) web framework for building APIs with Python 3.7+.
*   **Dev Containers:** The project includes a dev container configuration for a consistent and reproducible development environment.
*   **CI/CD:** A GitHub Actions workflow is set up for continuous integration and deployment to Azure.
*   **Workshop:** A comprehensive workshop is available in the `docs/workshop` directory to guide developers through the project.
