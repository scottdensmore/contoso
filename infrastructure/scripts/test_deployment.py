#!/usr/bin/env python3
"""
Integration and Smoke tests for Contoso Outdoor deployment.
"""

import json
import logging
import os
import subprocess
import sys

import requests

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_web_app_health(url: str):
    """Test the web application health endpoint."""
    logger.info(f"Testing Web App health at {url}...")
    try:
        response = requests.get(f"{url}/api/health", timeout=10)
        if response.status_code == 200:
            logger.info("✅ Web App is healthy")
            return True
        else:
            logger.error(f"❌ Web App returned status {response.status_code}")
            return False
    except Exception as e:  # noqa: BLE001
        logger.error(f"❌ Failed to connect to Web App: {e}")
        return False

def test_chat_service_health(url: str):
    """Test the chat service health endpoint."""
    logger.info(f"Testing Chat Service health at {url}...")
    try:
        response = requests.get(f"{url}/health", timeout=10)
        if response.status_code == 200:
            logger.info("✅ Chat Service is healthy")
            return True
        else:
            logger.error(f"❌ Chat Service returned status {response.status_code}")
            return False
    except Exception as e:  # noqa: BLE001
        logger.error(f"❌ Failed to connect to Chat Service: {e}")
        return False

def verify_gcp_resources():
    """Verify that key GCP resources exist using gcloud."""
    logger.info("Verifying GCP resources...")
    project_id = os.getenv("PROJECT_ID")
    if not project_id:
        logger.error("PROJECT_ID not set")
        return False

    # Check Cloud Run services
    services = ["contoso-web", "contoso-chat"]
    for service in services:
        result = subprocess.run(
            ["gcloud", "run", "services", "describe", service, "--project", project_id, "--region", "us-central1", "--format", "json"],
            capture_output=True, text=True, check=False
        )
        if result.returncode == 0:
            logger.info(f"✅ Cloud Run service '{service}' exists")
        else:
            logger.error(f"❌ Cloud Run service '{service}' not found or inaccessible")
            return False

    # Check Cloud SQL instance
    result = subprocess.run(
        ["gcloud", "sql", "instances", "list", "--project", project_id, "--format", "json"],
        capture_output=True, text=True, check=False
    )
    if result.returncode == 0:
        instances = json.loads(result.stdout)
        if any(i['name'].endswith('db-instance') for i in instances):
            logger.info("✅ Cloud SQL instance exists")
        else:
            logger.error("❌ Cloud SQL instance not found")
            return False
    
    return True

def main():
    project_id = os.getenv("PROJECT_ID")
    web_url = os.getenv("WEB_APP_URL")
    chat_url = os.getenv("CHAT_SERVICE_URL")

    if not any([project_id, web_url, chat_url]):
        logger.error("❌ No environment variables provided for testing (PROJECT_ID, WEB_APP_URL, or CHAT_SERVICE_URL)")
        sys.exit(1)

    success = True

    if project_id and not verify_gcp_resources():
        success = False

    if web_url and not test_web_app_health(web_url):
        success = False

    if chat_url and not test_chat_service_health(chat_url):
        success = False

    if success:
        logger.info("🎉 All deployment tests passed!")
        sys.exit(0)
    else:
        logger.error("💥 Some deployment tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
