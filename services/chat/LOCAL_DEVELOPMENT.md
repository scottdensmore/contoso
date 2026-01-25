# Local Development Guide

This guide explains how to set up and run Contoso Chat locally for development.

## Prerequisites

- Python 3.10 or 3.11
- Google Cloud CLI (`gcloud`)
- A Google Cloud Project with billing enabled
- Git

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd contoso-chat
```

### 2. Set up Google Cloud Authentication

```bash
# Install and initialize gcloud CLI
gcloud auth login
gcloud auth application-default login

# Set your project
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID
```

### 3. Install Dependencies

```bash
# Install API dependencies
pip install -r src/api/requirements.txt

# Install test dependencies (optional)
pip install -r tests/requirements-test.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
PROJECT_ID=your-gcp-project-id
REGION=us-central1
GEMINI_MODEL_NAME=gemini-2.5-flash
FIRESTORE_DATABASE=contoso-db
DISCOVERY_ENGINE_APP_ID=contoso-product-search
DISCOVERY_ENGINE_DATASTORE_ID=contoso-product-search
ENVIRONMENT=development
```

### 5. Deploy Infrastructure (One-time)

If you haven't deployed the GCP infrastructure yet:

```bash
cd infra/gcp
./deploy.sh
cd ../..
```

### 6. Seed Data (One-time)

```bash
cd scripts
python seed_gcp_all.py
cd ..
```

### 7. Run the Application

```bash
cd src/api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The application will be available at: http://localhost:8000

## Development Workflow

### Running Tests

```bash
# Run all tests
./run_tests.sh

# Run only unit tests
pytest tests/unit/ -v

# Run only integration tests (requires running server)
SERVICE_URL=http://localhost:8000 pytest tests/integration/ -v
```

### API Endpoints

- **Health Check**: `GET /health`
- **Root Info**: `GET /`
- **Chat**: `POST /api/create_response`

### Example API Usage

```bash
# Health check
curl http://localhost:8000/health

# Chat request
curl -X POST http://localhost:8000/api/create_response \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What hiking boots do you recommend?",
    "customer_id": "1",
    "chat_history": "[]"
  }'
```

## Development Features

### Hot Reload

The `--reload` flag enables automatic reloading when code changes:

```bash
cd src/api
uvicorn main:app --reload --port 8000
```

### Debug Logging

Set the log level for more verbose output:

```bash
export LOG_LEVEL=DEBUG
cd src/api
uvicorn main:app --reload --port 8000
```

### Mock Mode

If GCP services are unavailable, the app will automatically fall back to mock responses. You can force mock mode by temporarily removing the chat_request import.

## Testing with Docker (Optional)

If you want to test the production Docker image locally:

```bash
# Build the image
docker build -f src/api/Dockerfile -t contoso-chat .

# Run with environment file
docker run -p 8000:80 --env-file .env contoso-chat
```

## Troubleshooting

### Authentication Issues

```bash
# Re-authenticate
gcloud auth application-default login

# Check current project
gcloud config get-value project
```

### Missing Dependencies

```bash
# Reinstall all dependencies
pip install -r src/api/requirements.txt --force-reinstall
```

### GCP Service Issues

```bash
# Check if APIs are enabled
gcloud services list --enabled

# Enable required APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable discoveryengine.googleapis.com
```

### Port Conflicts

If port 8000 is in use:

```bash
uvicorn main:app --port 8080 --reload
```

## Code Structure

```
src/api/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── contoso_chat/          # Core chat logic
├── evaluators/            # AI evaluation functions
└── tracing.py             # Observability setup
```

## Making Changes

1. Make your code changes
2. Run tests: `./run_tests.sh`
3. Test locally: `uvicorn main:app --reload`
4. Commit and push changes
5. GitHub Actions will run tests automatically

## Production Deployment

To deploy your changes to production:

```bash
cd infra/gcp
./deploy-prod.sh
```

Or use the GitHub Actions workflow for automated deployment.