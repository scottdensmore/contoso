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

resource "google_vpc_access_connector" "connector" {
  name          = "vpc-connector"
  ip_cidr_range = "10.8.0.0/28"
  network       = "default"
}

data "google_compute_network" "default" {
  name = "default"
}

resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = data.google_compute_network.default.self_link
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = data.google_compute_network.default.self_link
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# --- Cloud SQL ---
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "-_"
}

resource "google_sql_database_instance" "postgres" {
  name             = "contoso-outdoor-db-instance"
  database_version = "POSTGRES_15"
  region           = "us-central1"
  depends_on       = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier = "db-g1-small"
    ip_configuration {
      ipv4_enabled                          = false
      private_network                       = data.google_compute_network.default.self_link
      enable_private_path_for_google_cloud_services = true
    }

    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "off"
    }
  }

  root_password       = random_password.db_password.result
  deletion_protection = false

  lifecycle {
    ignore_changes = [root_password]
  }
}

resource "google_sql_database" "database" {
  instance = google_sql_database_instance.postgres.name
  name     = "contoso-db"
}



data "google_project" "project" {}

resource "google_project_iam_member" "cloud_run_sql_client" {
  project = data.google_project.project.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

resource "google_sql_user" "users" {
  name     = "prismauser"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

# --- Outputs --- 


output "db_instance_name" {
  description = "The name of the Cloud SQL database instance."
  value       = google_sql_database_instance.postgres.name
}

output "db_name" {
  description = "The name of the database."
  value       = google_sql_database.database.name
}

output "db_user" {
  description = "The name of the database user."
  value       = google_sql_user.users.name
}

output "db_password" {
  description = "The password for the database user."
  value       = random_password.db_password.result
  sensitive   = true
}

output "db_private_ip" {
  description = "The private IP address of the database instance."
  value       = google_sql_database_instance.postgres.private_ip_address
}

output "vpc_connector" {
  description = "The name of the VPC connector."
  value       = google_vpc_access_connector.connector.name
}

output "instance_connection_name" {
  description = "The instance connection name for Cloud SQL."
  value       = google_sql_database_instance.postgres.connection_name
}