# GCP Project Configuration
project_id         = "contoso-outdoor"
region            = "us-central1"
firestore_location = "us-central1"

# Environment Configuration
environment_name = "prod"

# Application Configuration
image_tag         = "latest"
gemini_model_name = "gemini-2.5-flash"
embeddings_model_name = "text-embedding-004"

# Production Scaling Configuration
min_instances = 2
max_instances = 100

# Access Configuration
allow_public_access = true

# Deployment Configuration
deployer_email = "scott.densmore@gmail.com"
alert_email    = "scott.densmore@gmail.com"
force_destroy  = false

# Production Security and Configuration
enable_deletion_protection = true
log_level = "INFO"
enable_metrics = true
cors_origins = ["*"]  # In production, restrict to specific domains

# Production-specific settings
# These would typically be different from dev:
# - Separate project or proper resource isolation
# - Different alert email (operations team)
# - Higher instance limits for traffic
# - More restrictive access controls