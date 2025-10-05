terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  backend "gcs" {
    bucket = "contoso-outdoor-tf-state"
    prefix = "terraform/state"
  }
}

variable "nextauth_secret" {
  description = "The secret for NextAuth.js"
  type        = string
  sensitive   = true
}

provider "google" {
  project = "contoso-outdoor"
  region  = "us-central1"
}

# --- Remote State Data --- 
data "terraform_remote_state" "state" {
  backend = "gcs"
  config = {
    bucket = "contoso-outdoor-tf-state"
    prefix = "terraform/state"
  }
}

# --- Service Definitions ---
resource "google_project_service" "services" {
  project = "contoso-outdoor"
  service = "iam.googleapis.com"
}

# --- Artifact Registry --- 
resource "google_artifact_registry_repository" "docker_repo" {
  location      = "us-central1"
  repository_id = "contoso-outdoor-repo"
  format        = "DOCKER"
}

# --- Cloud SQL --- 
resource "random_password" "db_password" {
  length  = 16
  special = true
}

resource "google_sql_database_instance" "postgres" {
  name             = "contoso-outdoor-db-instance"
  database_version = "POSTGRES_15"
  region           = "us-central1"

  settings {
    tier = "db-g1-small"
  }

  root_password = random_password.db_password.result
}

resource "google_sql_database" "database" {
  instance = google_sql_database_instance.postgres.name
  name     = "contoso-db"
}

# --- Cloud Run --- 
resource "google_cloud_run_v2_service" "default" {
  name     = "contoso-web"
  location = "us-central1"

  template {
    containers {
      image = "us-central1-docker.pkg.dev/contoso-outdoor/contoso-outdoor-repo/contoso-web:latest"
      ports {
        container_port = 3000
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql://${google_sql_database_instance.postgres.root_user}:${random_password.db_password.result}@/${google_sql_database.database.name}?host=/cloudsql/${google_sql_database_instance.postgres.connection_name}"
      }
      env {
        name  = "NEXTAUTH_SECRET"
        value = var.nextauth_secret
      }
      env {
        name  = "NEXTAUTH_URL"
        value = google_cloud_run_v2_service.default.uri
      }
    }
  }

  traffic {
    percent         = 100
    type            = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }

  depends_on = [google_sql_database_instance.postgres]
}

# --- IAM for Cloud Run --- 
resource "google_cloud_run_service_iam_member" "noauth" {
  location = google_cloud_run_v2_service.default.location
  name     = google_cloud_run_v2_service.default.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# --- Outputs --- 
output "cloud_run_url" {
  description = "The URL of the deployed Cloud Run service."
  value       = google_cloud_run_v2_service.default.uri
}

output "db_instance_name" {
  description = "The name of the Cloud SQL database instance."
  value       = google_sql_database_instance.postgres.name
}