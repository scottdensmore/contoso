#!/usr/bin/env python3
"""
Master script to seed all data into Google Cloud Platform.
This script orchestrates the seeding of both products and customers.
"""

import os
import sys
import logging
import subprocess
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_requirements():
    """Check if all required environment variables are set."""
    required_vars = ["PROJECT_ID"]
    missing_vars = []

    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        return False

    return True

def run_script(script_path: Path, script_name: str) -> bool:
    """Run a Python script and return success status."""
    try:
        logger.info(f"🚀 Starting {script_name}...")

        # Run the script using the same Python interpreter
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            cwd=script_path.parent
        )

        if result.returncode == 0:
            logger.info(f"✅ {script_name} completed successfully")
            if result.stdout:
                logger.debug(f"{script_name} output:\n{result.stdout}")
            return True
        else:
            logger.error(f"❌ {script_name} failed with return code {result.returncode}")
            if result.stderr:
                logger.error(f"{script_name} error output:\n{result.stderr}")
            if result.stdout:
                logger.info(f"{script_name} output:\n{result.stdout}")
            return False

    except Exception as e:
        logger.error(f"Error running {script_name}: {e}")
        return False

def install_requirements():
    """Install required Python packages."""
    requirements = [
        "google-cloud-firestore",
        "google-cloud-discoveryengine",
        "google-cloud-aiplatform",
        "vertexai"
    ]

    logger.info("📦 Installing required packages...")

    for package in requirements:
        try:
            import importlib
            importlib.import_module(package.replace('-', '_'))
            logger.debug(f"Package {package} already installed")
        except ImportError:
            logger.info(f"Installing {package}...")
            result = subprocess.run(
                [sys.executable, "-m", "pip", "install", package],
                capture_output=True,
                text=True
            )

            if result.returncode != 0:
                logger.error(f"Failed to install {package}")
                logger.error(result.stderr)
                return False

    logger.info("✅ All required packages are available")
    return True

def check_gcp_auth():
    """Check if GCP authentication is configured."""
    try:
        from google.auth import default
        credentials, project = default()
        logger.info(f"✅ GCP authentication configured for project: {project}")
        return True
    except Exception as e:
        logger.error(f"❌ GCP authentication not configured: {e}")
        logger.error("Please run: gcloud auth application-default login")
        return False

def verify_infrastructure():
    """Verify that the required GCP infrastructure exists."""
    logger.info("🔍 Verifying GCP infrastructure...")

    project_id = os.getenv("PROJECT_ID")
    environment = os.getenv("ENVIRONMENT", "dev")

    # Check if Firestore database exists
    try:
        from google.cloud import firestore
        database_name = os.getenv("FIRESTORE_DATABASE", f"{environment}-customer-db")

        if database_name and database_name != "(default)":
            db = firestore.Client(project=project_id, database=database_name)
        else:
            db = firestore.Client(project=project_id)

        # Try to access the database
        collections = list(db.collections())
        logger.info("✅ Firestore database accessible")

    except Exception as e:
        logger.error(f"❌ Cannot access Firestore database: {e}")
        logger.error("Please ensure Terraform has been applied and Firestore is configured")
        return False

    # Check if Discovery Engine datastore exists
    try:
        from google.cloud import discoveryengine_v1

        datastore_id = os.getenv("DISCOVERY_ENGINE_DATASTORE_ID", f"{environment}-products-datastore")
        datastore_client = discoveryengine_v1.DataStoreServiceClient()
        datastore_name = f"projects/{project_id}/locations/global/dataStores/{datastore_id}"

        datastore_client.get_data_store(name=datastore_name)
        logger.info("✅ Discovery Engine datastore accessible")

    except Exception as e:
        logger.error(f"❌ Cannot access Discovery Engine datastore: {e}")
        logger.error("Please ensure Terraform has been applied and Discovery Engine is configured")
        return False

    return True

def main():
    """Main function to orchestrate the seeding process."""
    logger.info("🌱 Starting GCP data seeding process...")

    # Check environment variables
    if not check_requirements():
        sys.exit(1)

    # Install required packages
    if not install_requirements():
        sys.exit(1)

    # Check GCP authentication
    if not check_gcp_auth():
        sys.exit(1)

    # Verify infrastructure
    if not verify_infrastructure():
        logger.error("Infrastructure verification failed. Please check your Terraform deployment.")
        sys.exit(1)

    # Get script directory
    script_dir = Path(__file__).parent

    # Define seeding scripts in order
    seeding_scripts = [
        (script_dir / "seed_gcp_customers.py", "Customer Data Seeding"),
        (script_dir / "seed_gcp_products.py", "Product Data Seeding")
    ]

    # Track results
    results = []

    # Run each seeding script
    for script_path, script_name in seeding_scripts:
        if not script_path.exists():
            logger.error(f"Script not found: {script_path}")
            results.append((script_name, False))
            continue

        success = run_script(script_path, script_name)
        results.append((script_name, success))

    # Report final results
    logger.info("\n" + "="*50)
    logger.info("📊 SEEDING SUMMARY")
    logger.info("="*50)

    all_successful = True
    for script_name, success in results:
        status = "✅ SUCCESS" if success else "❌ FAILED"
        logger.info(f"{script_name}: {status}")
        if not success:
            all_successful = False

    if all_successful:
        logger.info("\n🎉 All data seeding completed successfully!")
        logger.info("Your Contoso Chat application is ready to use.")
        sys.exit(0)
    else:
        logger.error("\n💥 Some seeding operations failed!")
        logger.error("Please check the logs above for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()