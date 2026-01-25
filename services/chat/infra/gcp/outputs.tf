# Service outputs
output "cloud_run_service_url" {
  description = "URL of the deployed Cloud Run service"
  value       = google_cloud_run_v2_service.app_service.uri
}

output "cloud_run_service_name" {
  description = "Name of the Cloud Run service"
  value       = google_cloud_run_v2_service.app_service.name
}

# Database outputs
output "firestore_database_name" {
  description = "Name of the Firestore database"
  value       = google_firestore_database.customer_db.name
}

# Search outputs
output "discovery_engine_datastore_id" {
  description = "ID of the Discovery Engine datastore"
  value       = "${var.environment_name}-products-datastore"
}

output "discovery_engine_app_id" {
  description = "ID of the Discovery Engine search app"
  value       = "${var.environment_name}-product-search"
}

# Container registry outputs
output "container_registry_url" {
  description = "URL of the Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.container_registry.repository_id}"
}

# Storage outputs
output "storage_bucket_name" {
  description = "Name of the Cloud Storage bucket"
  value       = google_storage_bucket.app_storage.name
}

# Service account outputs
output "app_service_account_email" {
  description = "Email of the application service account"
  value       = google_service_account.app_service_account.email
}

# Project information
output "project_id" {
  description = "The GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "The GCP region"
  value       = var.region
}

output "environment_name" {
  description = "The environment name"
  value       = var.environment_name
}

# Resource names for reference
output "resource_prefix" {
  description = "Resource naming prefix"
  value       = local.name_prefix
}

# Monitoring Outputs
output "monitoring_dashboard_url" {
  description = "URL to the Cloud Monitoring dashboard"
  value       = "https://console.cloud.google.com/monitoring/dashboards/custom/${google_monitoring_dashboard.app_dashboard.id}?project=${var.project_id}"
}

output "uptime_check_id" {
  description = "The ID of the uptime check"
  value       = google_monitoring_uptime_check_config.app_health.uptime_check_id
}

output "alert_policies" {
  description = "Alert policy names"
  value = var.alert_email != "" ? [
    google_monitoring_alert_policy.uptime_check_failure[0].name,
    google_monitoring_alert_policy.high_error_rate[0].name,
    google_monitoring_alert_policy.high_latency[0].name
  ] : []
}