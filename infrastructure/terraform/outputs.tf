output "project_id" {
  value = var.project_id
}

output "region" {
  value = var.region
}

output "db_instance_name" {
  value = google_sql_database_instance.postgres.name
}

output "db_name" {
  value = google_sql_database.database.name
}

output "db_user" {
  value = google_sql_user.users.name
}

output "db_password" {
  value     = random_password.db_password.result
  sensitive = true
}

output "container_registry_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.container_registry.repository_id}"
}

output "storage_bucket_name" {
  value = google_storage_bucket.app_storage.name
}

output "app_service_account_email" {
  value = google_service_account.app_service_account.email
}

output "web_app_url" {
  value = google_cloud_run_v2_service.web_app.uri
}

output "chat_service_url" {
  value = google_cloud_run_v2_service.chat_service.uri
}
