terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "gcs" {
    bucket = "contoso-outdoor-tf-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
  billing_project       = var.project_id
}

# --- Locals ---
locals {
  name_prefix = "${var.environment_name}-${random_string.suffix.result}"
  labels = {
    environment = var.environment_name
    project     = "contoso-outdoor"
    managed-by  = "terraform"
  }
}

# Random suffix for unique naming
resource "random_string" "suffix" {
  length  = 8
  upper   = false
  special = false
}

# --- API ENABLING ---
resource "google_project_service" "required_apis" {
  for_each = toset([
    "iam.googleapis.com",
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "discoveryengine.googleapis.com",
    "aiplatform.googleapis.com",
    "secretmanager.googleapis.com",
    "storage.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "cloudbuild.googleapis.com",
    "sqladmin.googleapis.com",
    "servicenetworking.googleapis.com",
    "vpcaccess.googleapis.com",
    "compute.googleapis.com"
  ])

  project = var.project_id
  service = each.value

  disable_dependent_services = false
  disable_on_destroy         = false
}

# --- Service Accounts ---
resource "google_service_account" "app_service_account" {
  account_id   = "${var.environment_name}-app-sa"
  display_name = "Contoso Outdoor Application Service Account"
  description  = "Service account for Contoso Outdoor application services"

  depends_on = [google_project_service.required_apis]
}

# --- Networking ---
resource "google_vpc_access_connector" "connector" {
  name          = "${var.environment_name}-vpc-conn"
  ip_cidr_range = "10.8.0.0/28"
  network       = "default"
  region        = var.region

  depends_on = [google_project_service.required_apis]
}

data "google_compute_network" "default" {
  name = "default"
}

resource "google_compute_global_address" "private_ip_address" {
  name          = "${var.environment_name}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = data.google_compute_network.default.self_link

  depends_on = [google_project_service.required_apis]
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = data.google_compute_network.default.self_link
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]

  depends_on = [google_project_service.required_apis]
}

# --- Cloud SQL (Postgres) ---
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "-_"
}

resource "google_sql_database_instance" "postgres" {
  name             = "${var.environment_name}-db-instance"
  database_version = "POSTGRES_15"
  region           = var.region
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
  deletion_protection = var.enable_deletion_protection

  lifecycle {
    ignore_changes = [root_password]
  }
}

resource "google_sql_database" "database" {
  instance = google_sql_database_instance.postgres.name
  name     = "contoso-db"
}

resource "google_sql_user" "users" {
  name     = "prismauser"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

# --- Artifact Registry ---
resource "google_artifact_registry_repository" "container_registry" {
  repository_id = "${var.environment_name}-containers"
  format        = "DOCKER"
  location      = var.region
  description   = "Container registry for Contoso Outdoor application"

  labels = local.labels

  depends_on = [google_project_service.required_apis]
}

# --- Storage ---
resource "google_storage_bucket" "app_storage" {
  name     = "${local.name_prefix}-storage"
  location = var.region

  uniform_bucket_level_access = true
  force_destroy               = var.force_destroy

  labels = local.labels

  depends_on = [google_project_service.required_apis]
}

# --- Secret Manager ---
resource "google_secret_manager_secret" "app_config" {
  secret_id = "${var.environment_name}-app-config"

  replication {
    auto {}
  }

  labels = local.labels

  depends_on = [google_project_service.required_apis]
}

# --- IAM ---
resource "google_project_iam_member" "app_sa_roles" {
  for_each = toset([
    "roles/aiplatform.user",
    "roles/datastore.user",
    "roles/storage.objectAdmin",
    "roles/secretmanager.secretAccessor",
    "roles/monitoring.metricWriter",
    "roles/logging.logWriter",
    "roles/discoveryengine.editor",
    "roles/cloudsql.client"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.app_service_account.email}"
}

# --- Monitoring ---
resource "google_monitoring_notification_channel" "email" {
  count = var.alert_email != "" ? 1 : 0

  display_name = "${var.environment_name} Alert Email"
  type         = "email"

  labels = {
    email_address = var.alert_email
  }
}
