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



# --- Outputs --- 


output "db_instance_name" {
  description = "The name of the Cloud SQL database instance."
  value       = google_sql_database_instance.postgres.name
}