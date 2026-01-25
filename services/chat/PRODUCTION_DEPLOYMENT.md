# Production Deployment Guide

This guide covers deploying Contoso Chat to production on Google Cloud Platform with proper security, scaling, and monitoring.

## Overview

The production deployment includes:
- Enhanced security configurations
- Proper resource scaling (2-100 instances)
- Comprehensive monitoring and alerting
- Environment separation (dev/prod)
- Production-grade container configuration
- Direct Vertex AI integration (no external dependencies)
- Automated CI/CD with GitHub Actions

## Prerequisites

1. **Google Cloud Project**: Set up with billing enabled
2. **gcloud CLI**: Installed and authenticated
3. **Docker**: Installed for building container images
4. **Terraform**: Installed for infrastructure deployment

## Quick Production Deployment

```bash
# Navigate to infrastructure directory
cd infra/gcp

# Deploy production environment
./deploy-prod.sh
```

The script will:
1. Run pre-deployment security checks
2. Enable required GCP APIs
3. Build and push production container images
4. Deploy infrastructure with Terraform
5. Run post-deployment validation

## Manual Production Deployment

If you prefer manual control over the deployment:

### 1. Environment Setup

```bash
export PROJECT_ID="your-production-project"
export ENVIRONMENT="prod"
export REGION="us-central1"
```

### 2. Build Production Container

```bash
cd ../..  # Navigate to project root

# Configure Docker for Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build production container with security optimizations
docker build \
  --platform linux/amd64 \
  --target production \
  -f src/api/Dockerfile \
  -t "us-central1-docker.pkg.dev/$PROJECT_ID/contoso-registry/prod-app:latest" \
  --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
  --build-arg GIT_COMMIT="$(git rev-parse HEAD)" \
  --build-arg VERSION="1.0.0" \
  .

# Push to Artifact Registry
docker push "us-central1-docker.pkg.dev/$PROJECT_ID/contoso-registry/prod-app:latest"
```

### 3. Deploy Infrastructure

```bash
cd infra/gcp

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="terraform-prod.tfvars" -out="terraform-prod.plan"

# Apply (requires confirmation)
terraform apply "terraform-prod.plan"
```

### 4. Seed Production Data

```bash
cd ../../scripts

# Set environment variables
export PROJECT_ID="your-production-project"
export ENVIRONMENT="prod"

# Seed customer and product data
python seed_gcp_all.py
```

## Production Configuration

### Key Production Settings

| Setting | Development | Production |
|---------|-------------|------------|
| Min Instances | 0 | 2 |
| Max Instances | 10 | 100 |
| Deletion Protection | false | true |
| Log Level | DEBUG | INFO |
| Force Destroy | false | false |
| CORS Origins | ["*"] | ["yourdomain.com"] |

### Security Features

1. **Non-root Container**: Application runs as unprivileged user
2. **Deletion Protection**: Prevents accidental resource deletion
3. **Health Checks**: Automated container health monitoring
4. **Monitoring**: Comprehensive metrics and alerting
5. **Access Controls**: Proper IAM roles and service accounts

### Environment Variables

Production containers receive these environment variables:

```
PROJECT_ID=your-project
REGION=us-central1
ENVIRONMENT=prod
FIRESTORE_DATABASE=prod-customer-db
DISCOVERY_ENGINE_DATASTORE_ID=prod-products-datastore
GEMINI_MODEL_NAME=gemini-2.5-flash
EMBEDDINGS_MODEL_NAME=text-embedding-004
LOG_LEVEL=INFO
ENABLE_METRICS=true
```

## Monitoring and Alerting

### Cloud Monitoring Dashboard

Access your production dashboard:
```
https://console.cloud.google.com/monitoring/dashboards/custom/{dashboard-id}?project={project-id}
```

### Alert Policies

Production includes these critical alerts:
- **App Down**: Service health check failures
- **High Error Rate**: >10 5xx errors in 5 minutes
- **High Latency**: >5 second P95 response time

### Log Analysis

View application logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=prod-app" \
  --project="$PROJECT_ID" \
  --format="table(timestamp,severity,textPayload)" \
  --limit=100
```

## Scaling and Performance

### Automatic Scaling

Cloud Run automatically scales based on:
- Request volume
- CPU utilization
- Memory usage
- Custom metrics

### Performance Optimization

1. **Instance Warmup**: Min instances prevent cold starts
2. **Resource Limits**: 2 CPU, 2Gi memory per instance
3. **Connection Pooling**: Optimized database connections
4. **Caching**: Discovery Engine results cached

## Security Best Practices

### Network Security

1. **HTTPS Only**: All traffic encrypted in transit
2. **Service Accounts**: Least privilege access
3. **VPC**: Consider VPC connector for private networking
4. **Firewall**: Default deny with specific allows

### Data Security

1. **Encryption**: Data encrypted at rest and in transit
2. **IAM**: Role-based access control
3. **Secrets**: Sensitive data in Secret Manager
4. **Audit Logs**: All access logged and monitored

## Disaster Recovery

### Backup Strategy

1. **Firestore**: Automatic daily backups
2. **Container Images**: Multiple tagged versions retained
3. **Configuration**: Infrastructure as Code in Git

### Recovery Procedures

1. **Service Outage**: Automatic restart and scaling
2. **Data Loss**: Restore from Firestore backups
3. **Infrastructure Failure**: Redeploy with Terraform

## Maintenance and Updates

### Regular Updates

1. **Security Patches**: Monthly container base image updates
2. **Dependencies**: Quarterly dependency updates
3. **Model Updates**: As new Gemini versions release

### Deployment Process

1. Test changes in development environment
2. Build and tag new container version
3. Deploy with blue-green strategy
4. Monitor for issues and rollback if needed

## Troubleshooting

### Common Issues

1. **Cold Starts**: Increase min_instances
2. **Timeout Errors**: Check Discovery Engine connectivity
3. **Memory Issues**: Increase container memory limits
4. **Rate Limits**: Implement request throttling

### Diagnostic Commands

```bash
# Check service status
gcloud run services list --platform=managed --region=$REGION

# View recent logs
gcloud logging tail "resource.type=cloud_run_revision" --project=$PROJECT_ID

# Test endpoints
curl -f https://your-service-url/health
curl -X POST https://your-service-url/api/create_response \
  -H "Content-Type: application/json" \
  -d '{"question":"test","customer_id":"1","chat_history":"[]"}'
```

## Support and Monitoring

### Health Endpoints

- **Health Check**: `GET /health`
- **Service Info**: `GET /`
- **Metrics**: Available in Cloud Monitoring

### Contact Information

- **Operations Team**: alerts sent to configured email
- **Dashboard**: Monitor key metrics in real-time
- **Logs**: Centralized logging in Cloud Logging

## CI/CD Integration

### GitHub Actions Deployment

The project includes automated deployment workflows:

1. **Automated Testing**: `api-tests.yml` runs on every PR
2. **Infrastructure Validation**: `terraform-validation.yml` validates changes
3. **Production Deployment**: `gcp-deploy.yml` can deploy to production

**To set up automated production deployment:**

1. Configure repository secrets:
   ```
   PROJECT_ID=your-production-project
   WIF_PROVIDER=your-workload-identity-provider
   WIF_SERVICE_ACCOUNT=your-service-account
   ```

2. Enable production deployment:
   - Use GitHub Actions workflow dispatch
   - Or configure automatic deployment on main branch

### Manual CI/CD Setup

If not using GitHub Actions, set up your preferred CI/CD platform with:

1. **Build Stage**: Docker container build and push
2. **Test Stage**: Run unit and integration tests
3. **Deploy Stage**: Terraform apply with production config
4. **Verify Stage**: Health checks and smoke tests

## Next Steps

After production deployment:

1. **Custom Domain**: Configure custom domain and SSL certificate
2. **Load Testing**: Implement performance monitoring and testing
3. **Backup Strategy**: Configure automated backup procedures
4. **Security Review**: Review IAM roles and access controls
5. **Monitoring Setup**: Configure custom dashboards and alerts
6. **Documentation**: Update team runbooks and procedures

## Production Checklist

Before going live:

- [ ] Production Terraform configuration reviewed
- [ ] Monitoring and alerting configured
- [ ] Backup procedures tested
- [ ] Load testing completed
- [ ] Security review performed
- [ ] Team trained on operations procedures
- [ ] Documentation updated
- [ ] Emergency contacts configured