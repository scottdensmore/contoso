# Contoso Chat - Retail RAG Copilot on Google Cloud Platform

A production-ready RAG-based retail copilot that responds to customer questions with responses grounded in the retailer's product and customer data, powered by Google Cloud Platform services.

## Overview

Contoso Chat is an intelligent customer service chatbot that helps customers find products and get answers about outdoor gear and equipment. The application uses a Retrieval-Augmented Generation (RAG) pattern with Google Cloud services to provide contextual, accurate responses.

## Architecture

- **Frontend**: FastAPI web application
- **AI Model**: Google Cloud Vertex AI (Gemini 2.5 Flash)
- **Vector Search**: Google Cloud Discovery Engine for product search
- **Database**: Google Cloud Firestore for customer data
- **Hosting**: Google Cloud Run (serverless containers)
- **Infrastructure**: Terraform for Infrastructure as Code
- **Monitoring**: Google Cloud Monitoring with dashboards and alerts

## Features

- **Intelligent Chat**: Powered by Gemini 2.5 Flash for natural conversations
- **Product Search**: Semantic search across product catalog using Discovery Engine
- **Customer Personalization**: Retrieve customer history from Firestore
- **Production Ready**: Comprehensive monitoring, logging, and alerting
- **Scalable**: Auto-scaling Cloud Run with 2-100 instances
- **Secure**: Non-root containers, proper IAM, deletion protection

## Quick Start

### Prerequisites

- Google Cloud Project with billing enabled
- gcloud CLI installed and authenticated
- Docker installed
- Terraform installed

### Deploy to Google Cloud

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd contoso-chat
   ```

2. **Set up environment**
   ```bash
   export PROJECT_ID="your-gcp-project"
   gcloud config set project $PROJECT_ID
   ```

3. **Deploy infrastructure and application**
   ```bash
   cd infra/gcp
   ./deploy.sh
   ```

4. **Seed data**
   ```bash
   cd ../../scripts
   python seed_gcp_all.py
   ```

## Development Environments

### Development Deployment
- **Environment**: dev
- **Scaling**: 0-10 instances
- **Logging**: DEBUG level
- **Configuration**: `terraform.tfvars`

### Production Deployment
- **Environment**: prod
- **Scaling**: 2-100 instances
- **Logging**: INFO level
- **Security**: Deletion protection enabled
- **Configuration**: `terraform-prod.tfvars`

## API Endpoints

- `GET /` - Service information
- `GET /health` - Health check
- `POST /api/create_response` - Chat endpoint

### Example Request
```bash
curl -X POST https://your-service-url/api/create_response \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What hiking boots do you recommend?",
    "customer_id": "1",
    "chat_history": "[]"
  }'
```

## Monitoring and Operations

### Cloud Monitoring Dashboard
Access real-time metrics and performance data:
- Request rate and latency
- Error rates and uptime
- Instance scaling and resource usage

### Alerts
Automatic alerts for:
- Service downtime
- High error rates (>10 5xx errors/5min)
- High latency (>5 second P95)

### Logs
Structured logging available in Cloud Logging:
```bash
gcloud logging read "resource.type=cloud_run_revision" \
  --project=$PROJECT_ID --limit=100
```

## Project Structure

```
├── .github/workflows/     # GitHub Actions workflows
│   ├── api-tests.yml      # API testing pipeline
│   ├── evaluations.yaml   # AI evaluation testing
│   ├── gcp-deploy.yml     # Automated GCP deployment
│   └── terraform-validation.yml # Infrastructure validation
├── infra/gcp/             # Terraform infrastructure
│   ├── main.tf            # Core GCP resources
│   ├── variables.tf       # Configuration variables
│   ├── outputs.tf         # Infrastructure outputs
│   ├── terraform.tfvars   # Development settings
│   ├── terraform-prod.tfvars # Production settings
│   ├── deploy.sh          # Development deployment script
│   ├── deploy-prod.sh     # Production deployment script
│   └── cleanup.sh         # Infrastructure cleanup
├── src/api/               # FastAPI application
│   ├── main.py            # Main application (production-ready)
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile         # Container configuration
│   ├── evaluate.py        # AI evaluation runner
│   ├── tracing.py         # Observability setup
│   ├── contoso_chat/      # Core chat logic
│   │   └── chat_request.py # Chat request handler
│   └── evaluators/        # AI response evaluation
│       └── custom_evals/  # Custom evaluation functions
├── scripts/               # Data seeding utilities
│   ├── seed_gcp_all.py    # Master seeding script
│   ├── seed_gcp_customers.py # Customer data seeding
│   └── seed_gcp_products.py  # Product data seeding
├── tests/                 # Test suite
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── conftest.py        # Test configuration
│   └── requirements-test.txt # Test dependencies
├── data/                  # Sample data
│   ├── customer_info/     # Customer JSON files
│   ├── manual_info/       # Product manuals
│   └── product_info/      # Product catalog
├── LOCAL_DEVELOPMENT.md   # Local development guide
├── PRODUCTION_DEPLOYMENT.md # Production deployment guide
├── GEMINI.md             # GCP/Gemini specific notes
└── run_tests.sh          # Test runner script
```

## Configuration

### Environment Variables
- `PROJECT_ID` - Google Cloud Project ID
- `REGION` - GCP region (default: us-central1)
- `ENVIRONMENT` - Environment name (dev/prod)
- `GEMINI_MODEL_NAME` - AI model (gemini-2.5-flash)
- `LOG_LEVEL` - Logging level (DEBUG/INFO)

### Terraform Variables
Key configuration options in `terraform.tfvars`:
- `environment_name` - Environment identifier
- `min_instances` / `max_instances` - Scaling limits
- `gemini_model_name` - AI model configuration
- `alert_email` - Monitoring notifications
- `enable_deletion_protection` - Resource protection

## Security

- **Container Security**: Non-root user, minimal base image
- **Network Security**: HTTPS only, configurable CORS
- **Access Control**: IAM service accounts with least privilege
- **Data Protection**: Encryption at rest and in transit
- **Monitoring**: Comprehensive audit logging

## Local Development

For detailed local development instructions, see [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md).

**Quick local setup:**
```bash
# Install dependencies
pip install -r src/api/requirements.txt

# Set up environment
export PROJECT_ID="your-gcp-project"
export REGION="us-central1"

# Run locally
cd src/api
uvicorn main:app --reload --port 8000
```

## Testing

### Run All Tests
```bash
./run_tests.sh
```

### Unit Tests Only
```bash
pytest tests/unit/ -v
```

### Integration Tests (requires deployed service)
```bash
SERVICE_URL=https://your-service-url.com pytest tests/integration/ -v
```

### AI Evaluation Tests
```bash
cd src/api
python -m evaluate
```

## GitHub Actions Workflows

The project includes automated CI/CD workflows:

- **`api-tests.yml`**: Runs unit tests, integration tests, and code validation on every PR/push
- **`gcp-deploy.yml`**: Automated deployment to GCP (manual trigger or main branch)
- **`terraform-validation.yml`**: Validates Terraform configuration on infrastructure changes
- **`evaluations.yaml`**: Runs AI evaluation tests to assess response quality

### Required GitHub Secrets/Variables

For GitHub Actions to work, configure these repository variables:
- `PROJECT_ID` - Your GCP project ID
- `REGION` - GCP region (e.g., us-central1)
- `GEMINI_MODEL_NAME` - AI model name (gemini-2.5-flash)
- `WIF_PROVIDER` - Workload Identity Federation provider
- `WIF_SERVICE_ACCOUNT` - Service account for GitHub Actions

## Deployment Options

### 1. Automated Deployment (Recommended)
Use GitHub Actions for automated deployment:
1. Push changes to `main` branch
2. GitHub Actions automatically deploys to development
3. Use workflow dispatch for production deployment

### 2. Manual Deployment

**Development:**
```bash
cd infra/gcp
./deploy.sh
```

**Production:**
```bash
cd infra/gcp
./deploy-prod.sh
```

### 3. Production Deployment Guide
For detailed production deployment procedures, see [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md).

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and test locally: `./run_tests.sh`
4. Deploy to development environment for testing
5. Submit a pull request with clear description
6. Ensure all GitHub Action checks pass

## Troubleshooting

### Common Issues

**Authentication errors:**
```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

**Build failures:**
- Ensure Docker is running
- Check that all required GCP APIs are enabled
- Verify Terraform variables are correctly set

**Test failures:**
- Check environment variables are set
- Ensure GCP services are deployed and accessible
- Run `./run_tests.sh` for detailed output

### Getting Help

- **Documentation**:
  - [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) - Local development setup
  - [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Production deployment
  - [GEMINI.md](GEMINI.md) - GCP-specific configuration
- **Monitoring**: Check Google Cloud Console for service health and logs
- **Issues**: Report bugs and feature requests in the repository issues
- **Testing**: Use `./run_tests.sh` to validate your setup

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🚀 Quick Start Summary

1. **Prerequisites**: GCP project, gcloud CLI, Terraform
2. **Deploy**: `cd infra/gcp && ./deploy.sh`
3. **Seed Data**: `cd scripts && python seed_gcp_all.py`
4. **Test**: `./run_tests.sh`
5. **Develop**: See [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)

**🎯 Ready to go!** Your Contoso Chat application will be running on Google Cloud Platform with full monitoring, auto-scaling, and AI-powered customer support.