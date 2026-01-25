variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "firestore_location" {
  description = "The location for Firestore database"
  type        = string
  default     = "us-central1"
}

variable "environment_name" {
  description = "Name of the environment (e.g., dev, staging, prod)"
  type        = string
  validation {
    condition     = length(var.environment_name) > 0 && length(var.environment_name) <= 20
    error_message = "Environment name must be between 1 and 20 characters."
  }
}

variable "image_tag" {
  description = "The container image tag to deploy"
  type        = string
  default     = "latest"
}

variable "gemini_model_name" {
  description = "The name of the Gemini model to use for chat"
  type        = string
  default     = "gemini-2.5-flash"
}

variable "embeddings_model_name" {
  description = "The name of the Gemini model to use for embeddings"
  type        = string
  default     = "text-embedding-004"
}

variable "min_instances" {
  description = "Minimum number of Cloud Run instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 10
}

variable "allow_public_access" {
  description = "Whether to allow public access to the Cloud Run service"
  type        = bool
  default     = true
}

variable "deployer_email" {
  description = "Email of the user who will deploy/manage the infrastructure"
  type        = string
  default     = ""
}

variable "force_destroy" {
  description = "Whether to force destroy resources (useful for testing)"
  type        = bool
  default     = false
}

variable "alert_email" {
  description = "Email address for monitoring alerts"
  type        = string
  default     = ""
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for production resources"
  type        = bool
  default     = true
}

variable "log_level" {
  description = "Application log level"
  type        = string
  default     = "INFO"
  validation {
    condition     = contains(["DEBUG", "INFO", "WARNING", "ERROR"], var.log_level)
    error_message = "Log level must be one of: DEBUG, INFO, WARNING, ERROR."
  }
}

variable "cors_origins" {
  description = "List of allowed CORS origins"
  type        = list(string)
  default     = ["*"]
}

variable "enable_metrics" {
  description = "Enable detailed application metrics"
  type        = bool
  default     = true
}