# Contoso Chat - AI Assistant for Contoso Outdoors

An intelligent customer service chatbot that helps customers find products and get answers about outdoor gear.

## Overview

Contoso Chat uses a Retrieval-Augmented Generation (RAG) pattern to provide contextual, accurate responses based on:
1.  **Product Catalog:** Grounded by Vertex AI Search (Discovery Engine).
2.  **Customer Context:** Personalized responses based on profile and order history from PostgreSQL.

## Architecture

- **Backend:** FastAPI (Python 3.10+)
- **LLM:** Google Vertex AI (Gemini 2.5 Flash)
- **Vector Search:** Google Cloud Discovery Engine
- **Database:** PostgreSQL (Cloud SQL) via Prisma
- **Orchestration:** Prompty for prompt management

## Local Development

### Prerequisites
- Python 3.10+
- Access to a PostgreSQL database (or run `docker-compose up db` in the root)
- GCP credentials (for Vertex AI and Discovery Engine)

### Setup
1. **Install dependencies:**
   ```bash
   pip install -r src/api/requirements.txt
   ```

2. **Configure Environment:**
   Create a `.env` file in this directory:
   ```env
   PROJECT_ID=your-project-id
   REGION=us-central1
   ENVIRONMENT=dev
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contoso-db?schema=public"
   ```

3. **Run Service:**
   ```bash
   cd src/api
   uvicorn main:app --reload --port 8000
   ```

## Key API Endpoints

- `GET /health`: Service health check.
- `POST /api/create_response`: Generate an AI response.

## Infrastructure

The chat service is deployed as a Google Cloud Run service via the unified infrastructure configuration in the root `infrastructure/` directory.
