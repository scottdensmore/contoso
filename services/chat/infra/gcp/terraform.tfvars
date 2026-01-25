# GCP Project Configuration
project_id         = "contoso-outdoor"
region            = "us-central1"
firestore_location = "us-central1"

# Environment Configuration
environment_name = "dev"

# Application Configuration
image_tag         = "latest"
gemini_model_name = "gemini-2.5-flash"
embeddings_model_name = "text-embedding-004"

# Scaling Configuration
min_instances = 0
max_instances = 10

# Access Configuration
allow_public_access = true

# Deployment Configuration
deployer_email = "scott.densmore@gmail.com"
alert_email    = "scott.densmore@gmail.com"
force_destroy  = false

# Development Configuration
enable_deletion_protection = false  # Allow easy cleanup in dev
log_level = "DEBUG"
enable_metrics = true
cors_origins = ["*"]

# Example for production:
# environment_name = "prod"
# min_instances = 1
# max_instances = 50
# force_destroy = false

# Example for development:
# environment_name = "dev"
# min_instances = 0
# max_instances = 5
# force_destroy = true