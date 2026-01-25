terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.41.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

provider "google" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
  billing_project       = var.project_id
}

# Local values for resource naming and configuration
locals {
  name_prefix = "${var.environment_name}-${random_string.suffix.result}"
  labels = {
    environment = var.environment_name
    project     = "contoso-chat"
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
# Enable Cloud Resource Manager API first (required for other API enablements)
resource "google_project_service" "cloudresourcemanager" {
  project = var.project_id
  service = "cloudresourcemanager.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Enable all other required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "firestore.googleapis.com",
    "discoveryengine.googleapis.com",
    "aiplatform.googleapis.com",
    "secretmanager.googleapis.com",
    "storage.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "cloudbuild.googleapis.com",
    "iam.googleapis.com"
  ])

  project = var.project_id
  service = each.value

  disable_dependent_services = false
  disable_on_destroy         = false

  depends_on = [google_project_service.cloudresourcemanager]
}

# Service account for the application
resource "google_service_account" "app_service_account" {
  account_id   = "${var.environment_name}-app-sa"
  display_name = "Contoso Chat Application Service Account"
  description  = "Service account for Contoso Chat application"

  depends_on = [google_project_service.required_apis]
}

# Cloud Storage bucket for application data and configs
resource "google_storage_bucket" "app_storage" {
  name     = "${local.name_prefix}-storage"
  location = var.region

  uniform_bucket_level_access = true
  force_destroy               = var.force_destroy

  versioning {
    enabled = false
  }

  labels = local.labels

  depends_on = [google_project_service.required_apis]
}

# Secret Manager for application configuration
resource "google_secret_manager_secret" "app_config" {
  secret_id = "${var.environment_name}-app-config"

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  labels = local.labels

  depends_on = [google_project_service.required_apis]
}

# --- ARTIFACT REGISTRY ---
resource "google_artifact_registry_repository" "container_registry" {
  repository_id = "${var.environment_name}-containers"
  format        = "DOCKER"
  location      = var.region
  description   = "Container registry for Contoso Chat application"

  labels = local.labels

  depends_on = [google_project_service.required_apis]
}

# --- FIRESTORE DATABASE ---
resource "google_firestore_database" "customer_db" {
  project     = var.project_id
  name        = "${var.environment_name}-customer-db"
  location_id = var.firestore_location
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.required_apis]
}

# --- DISCOVERY ENGINE (VERTEX AI SEARCH) ---
# Temporarily commented out due to quota project authentication issues
# We'll create these manually or via gcloud after initial deployment

# resource "google_discovery_engine_data_store" "product_datastore" {
#   project           = var.project_id
#   location          = "global"
#   data_store_id     = "${var.environment_name}-products-datastore"
#   display_name      = "${var.environment_name}-products-datastore"
#   industry_vertical = "GENERIC"
#   solution_types    = ["SOLUTION_TYPE_SEARCH"]
#   content_config    = "NO_CONTENT"
#
#   depends_on = [google_project_service.required_apis]
# }

# resource "google_discovery_engine_search_engine" "product_search_app" {
#   project          = var.project_id
#   location         = "global"
#   collection_id    = "default_collection"
#   engine_id        = "${var.environment_name}-product-search"
#   display_name     = "${var.environment_name}-product-search-app"
#   data_store_ids   = [google_discovery_engine_data_store.product_datastore.data_store_id]
#
#   search_engine_config {
#     search_tier    = "SEARCH_TIER_STANDARD"
#     search_add_ons = ["SEARCH_ADD_ON_LLM"]
#   }
#
#   depends_on = [google_discovery_engine_data_store.product_datastore]
# }

# --- CLOUD RUN SERVICE ---
resource "google_cloud_run_v2_service" "app_service" {
  name     = "${var.environment_name}-app"
  location = var.region

  deletion_protection = var.enable_deletion_protection  # Allow cleanup script to delete this service

  template {
    service_account = google_service_account.app_service_account.email

    containers {
      image = "gcr.io/contoso-outdoor/dev-app:latest"

      ports {
        container_port = 80
      }

      env {
        name  = "PROJECT_ID"
        value = var.project_id
      }

      env {
        name  = "REGION"
        value = var.region
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment_name
      }

      env {
        name  = "FIRESTORE_DATABASE"
        value = google_firestore_database.customer_db.name
      }

      env {
        name  = "STORAGE_BUCKET"
        value = google_storage_bucket.app_storage.name
      }

      env {
        name  = "DISCOVERY_ENGINE_APP_ID"
        value = "${var.environment_name}-product-search"
      }

      env {
        name  = "DISCOVERY_ENGINE_DATASTORE_ID"
        value = "${var.environment_name}-products-datastore"
      }

      env {
        name  = "GEMINI_MODEL_NAME"
        value = var.gemini_model_name
      }

      env {
        name  = "EMBEDDINGS_MODEL_NAME"
        value = var.embeddings_model_name
      }

      env {
        name  = "LOG_LEVEL"
        value = var.log_level
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment_name
      }

      env {
        name  = "ENABLE_METRICS"
        value = tostring(var.enable_metrics)
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "2Gi"
        }
      }
    }

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
  }

  labels = local.labels

  depends_on = [
    google_project_service.required_apis,
    google_service_account.app_service_account
  ]
}

# --- IAM BINDINGS ---

# Cloud Run public access
resource "google_cloud_run_service_iam_binding" "app_service_invoker" {
  location = google_cloud_run_v2_service.app_service.location
  service  = google_cloud_run_v2_service.app_service.name
  role     = "roles/run.invoker"
  members  = var.allow_public_access ? ["allUsers"] : []
}

# IAM roles for the service account
resource "google_project_iam_member" "app_sa_roles" {
  for_each = toset([
    "roles/aiplatform.user",
    "roles/datastore.user",
    "roles/storage.objectAdmin",
    "roles/secretmanager.secretAccessor",
    "roles/monitoring.metricWriter",
    "roles/logging.logWriter",
    "roles/discoveryengine.editor"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.app_service_account.email}"
}

# IAM roles for the deployment user/service account
resource "google_project_iam_member" "deployer_roles" {
  for_each = var.deployer_email != "" ? toset([
    "roles/run.admin",
    "roles/artifactregistry.admin",
    "roles/storage.admin",
    "roles/secretmanager.admin",
    "roles/datastore.owner",
    "roles/aiplatform.admin",
    "roles/discoveryengine.admin"
  ]) : toset([])

  project = var.project_id
  role    = each.value
  member  = "user:${var.deployer_email}"
}

# Monitoring and Alerting Resources
# Create notification channel for alerts
resource "google_monitoring_notification_channel" "email" {
  count = var.alert_email != "" ? 1 : 0

  display_name = "${var.environment_name} Alert Email"
  type         = "email"

  labels = {
    email_address = var.alert_email
  }
}

# Uptime check for the application
resource "google_monitoring_uptime_check_config" "app_health" {
  display_name = "${var.environment_name}-app-uptime-check"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path         = "/health"
    port         = "443"
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = split("//", google_cloud_run_v2_service.app_service.uri)[1]
    }
  }
}

# Alert policy for uptime check failures
resource "google_monitoring_alert_policy" "uptime_check_failure" {
  count = var.alert_email != "" ? 1 : 0

  display_name = "${var.environment_name} App Down Alert"
  combiner     = "OR"

  conditions {
    display_name = "Uptime check failure"

    condition_threshold {
      filter          = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND resource.type=\"uptime_url\" AND metric.label.check_id=\"${google_monitoring_uptime_check_config.app_health.uptime_check_id}\""
      duration        = "300s"
      comparison      = "COMPARISON_LT"
      threshold_value = 1

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_NEXT_OLDER"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email[0].name]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Alert policy for high error rate
resource "google_monitoring_alert_policy" "high_error_rate" {
  count = var.alert_email != "" ? 1 : 0

  display_name = "${var.environment_name} High Error Rate Alert"
  combiner     = "OR"

  conditions {
    display_name = "High 5xx error rate"

    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"${google_cloud_run_v2_service.app_service.name}\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.label.response_code_class=\"5xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 10

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
        group_by_fields      = ["resource.label.service_name"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email[0].name]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Alert policy for high latency
resource "google_monitoring_alert_policy" "high_latency" {
  count = var.alert_email != "" ? 1 : 0

  display_name = "${var.environment_name} High Latency Alert"
  combiner     = "OR"

  conditions {
    display_name = "High request latency"

    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"${google_cloud_run_v2_service.app_service.name}\" AND metric.type=\"run.googleapis.com/request_latencies\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 5000  # 5 seconds

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_DELTA"
        cross_series_reducer = "REDUCE_PERCENTILE_95"
        group_by_fields      = ["resource.label.service_name"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email[0].name]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Custom dashboard for application monitoring
resource "google_monitoring_dashboard" "app_dashboard" {
  dashboard_json = jsonencode({
    displayName = "${var.environment_name} Contoso Chat Dashboard"
    mosaicLayout = {
      columns = 12
      tiles = [
        {
          width  = 6
          height = 4
          widget = {
            title = "Request Count"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"${google_cloud_run_v2_service.app_service.name}\" AND metric.type=\"run.googleapis.com/request_count\""
                    aggregation = {
                      alignmentPeriod  = "60s"
                      perSeriesAligner = "ALIGN_RATE"
                    }
                  }
                }
              }]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Requests/sec"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width  = 6
          height = 4
          xPos   = 6
          widget = {
            title = "Request Latency (95th percentile)"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"${google_cloud_run_v2_service.app_service.name}\" AND metric.type=\"run.googleapis.com/request_latencies\""
                    aggregation = {
                      alignmentPeriod    = "60s"
                      perSeriesAligner   = "ALIGN_DELTA"
                      crossSeriesReducer = "REDUCE_PERCENTILE_95"
                    }
                  }
                }
              }]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Latency (ms)"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width  = 6
          height = 4
          yPos   = 4
          widget = {
            title = "Error Rate"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"${google_cloud_run_v2_service.app_service.name}\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.label.response_code_class=\"5xx\""
                    aggregation = {
                      alignmentPeriod  = "60s"
                      perSeriesAligner = "ALIGN_RATE"
                    }
                  }
                }
              }]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Errors/sec"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width  = 6
          height = 4
          xPos   = 6
          yPos   = 4
          widget = {
            title = "Instance Count"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"${google_cloud_run_v2_service.app_service.name}\" AND metric.type=\"run.googleapis.com/container/instance_count\""
                    aggregation = {
                      alignmentPeriod  = "60s"
                      perSeriesAligner = "ALIGN_MEAN"
                    }
                  }
                }
              }]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Instances"
                scale = "LINEAR"
              }
            }
          }
        }
      ]
    }
  })
}