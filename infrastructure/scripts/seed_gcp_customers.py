#!/usr/bin/env python3
"""
Idempotent script to seed customer data into Google Cloud Firestore.
This script loads customer JSON files and uploads them to Firestore with idempotency checks.
"""

import os
import sys
import json
import glob
import logging
from typing import Dict, List, Any
from pathlib import Path

from google.cloud import firestore
from google.api_core import exceptions

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CustomerSeeder:
    def __init__(self, project_id: str, database_name: str):
        self.project_id = project_id
        self.database_name = database_name

        # Initialize Firestore client
        try:
            if database_name and database_name != "(default)":
                self.db = firestore.Client(project=project_id, database=database_name)
            else:
                self.db = firestore.Client(project=project_id)

            logger.info(f"Connected to Firestore database: {database_name or '(default)'}")
        except Exception as e:
            logger.error(f"Failed to connect to Firestore: {e}")
            raise

    def validate_customer_data(self, customer: Dict[str, Any]) -> bool:
        """Validate customer data structure."""
        required_fields = ['id', 'firstName', 'lastName', 'email']

        for field in required_fields:
            if field not in customer:
                logger.error(f"Missing required field '{field}' in customer data")
                return False

        # Validate email format (basic check)
        if '@' not in customer['email']:
            logger.error(f"Invalid email format: {customer['email']}")
            return False

        # Validate orders if present
        if 'orders' in customer:
            if not isinstance(customer['orders'], list):
                logger.error("Orders field must be a list")
                return False

            for order in customer['orders']:
                required_order_fields = ['id', 'productId', 'quantity', 'total', 'date']
                for field in required_order_fields:
                    if field not in order:
                        logger.warning(f"Missing order field '{field}' in customer {customer['id']}")

        return True

    def load_customers_from_json(self, json_path: Path) -> List[Dict[str, Any]]:
        """Load customers from a single JSON file."""
        customers = []

        if not json_path.exists():
            logger.warning(f"Customer file not found at: {json_path}")
            return customers

        try:
            with open(json_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                
                if isinstance(data, list):
                    for customer_data in data:
                        if self.validate_customer_data(customer_data):
                            customers.append(customer_data)
                        else:
                            logger.error(f"Invalid customer data in {json_path}")
                else:
                    logger.error(f"Expected list of customers in {json_path}, got {type(data)}")

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in {json_path}: {e}")
        except Exception as e:
            logger.error(f"Error loading {json_path}: {e}")

        logger.info(f"Successfully loaded {len(customers)} valid customers")
        return customers

    def customer_exists(self, customer_id: str) -> bool:
        """Check if a customer document already exists in Firestore."""
        try:
            doc_ref = self.db.collection('customers').document(customer_id)
            doc = doc_ref.get()
            return doc.exists
        except Exception as e:
            logger.error(f"Error checking customer existence: {e}")
            return False

    def upload_customer(self, customer: Dict[str, Any], force_update: bool = False) -> bool:
        """Upload a single customer to Firestore with idempotency."""
        try:
            customer_id = str(customer['id'])

            # Check if customer already exists
            if not force_update and self.customer_exists(customer_id):
                logger.info(f"Customer {customer_id} already exists, skipping...")
                return True

            # Prepare document data
            doc_data = customer.copy()

            # Ensure the ID is stored as a string for consistency
            doc_data['id'] = customer_id

            # Add timestamp for tracking
            doc_data['lastUpdated'] = firestore.SERVER_TIMESTAMP

            # Upload to Firestore
            doc_ref = self.db.collection('customers').document(customer_id)

            if force_update:
                doc_ref.set(doc_data)
                logger.info(f"Updated customer {customer_id}")
            else:
                doc_ref.set(doc_data)
                logger.info(f"Created customer {customer_id}")

            return True

        except Exception as e:
            logger.error(f"Error uploading customer {customer.get('id', 'unknown')}: {e}")
            return False

    def batch_upload_customers(self, customers: List[Dict[str, Any]], force_update: bool = False) -> Dict[str, int]:
        """Upload customers in batches with idempotency checks."""
        results = {"created": 0, "updated": 0, "skipped": 0, "failed": 0}

        # Process customers in batches for better performance
        batch_size = 50  # Firestore batch limit is 500, but we'll use smaller batches

        for i in range(0, len(customers), batch_size):
            batch = customers[i:i + batch_size]
            batch_obj = self.db.batch()
            batch_operations = []

            for customer in batch:
                try:
                    customer_id = str(customer['id'])

                    # Check if customer exists
                    exists = self.customer_exists(customer_id)

                    if exists and not force_update:
                        results["skipped"] += 1
                        continue

                    # Prepare document data
                    doc_data = customer.copy()
                    doc_data['id'] = customer_id
                    doc_data['lastUpdated'] = firestore.SERVER_TIMESTAMP

                    # Add to batch
                    doc_ref = self.db.collection('customers').document(customer_id)
                    batch_obj.set(doc_ref, doc_data)
                    batch_operations.append((customer_id, exists))

                except Exception as e:
                    logger.error(f"Error preparing customer {customer.get('id', 'unknown')}: {e}")
                    results["failed"] += 1

            # Commit batch if there are operations
            if batch_operations:
                try:
                    batch_obj.commit()
                    for customer_id, existed in batch_operations:
                        if existed:
                            results["updated"] += 1
                            logger.info(f"Updated customer {customer_id}")
                        else:
                            results["created"] += 1
                            logger.info(f"Created customer {customer_id}")
                except Exception as e:
                    logger.error(f"Error committing batch: {e}")
                    results["failed"] += len(batch_operations)

        return results

    def create_indexes(self):
        """Create recommended indexes for customer collection."""
        # Note: Firestore indexes are typically created via the Firebase console
        # or using the Firebase CLI. This is here for documentation purposes.
        logger.info("Consider creating indexes for:")
        logger.info("- customers.email")
        logger.info("- customers.membership")
        logger.info("- customers.orders.date")
        logger.info("Use the Firebase console or CLI to create composite indexes as needed")

    def seed_customers(self, json_path: Path, force_update: bool = False) -> bool:
        """Main method to seed customers into Firestore."""
        try:
            # Load customer data
            customers = self.load_customers_from_json(json_path)

            if not customers:
                logger.error("No valid customer data found")
                return False

            # Upload customers
            logger.info(f"Uploading {len(customers)} customers...")
            results = self.batch_upload_customers(customers, force_update)

            logger.info(f"Upload results: {results}")

            # Create indexes reminder
            self.create_indexes()

            if results["failed"] > 0:
                logger.warning(f"{results['failed']} customers failed to upload")
                return False

            logger.info("Customer seeding completed successfully")
            return True

        except Exception as e:
            logger.error(f"Error seeding customers: {e}")
            return False


def main():
    """Main function to run the customer seeding script."""
    # Get environment variables
    project_id = os.getenv("PROJECT_ID")
    database_name = os.getenv("FIRESTORE_DATABASE")
    force_update = os.getenv("FORCE_UPDATE", "false").lower() == "true"

    if not project_id:
        logger.error("PROJECT_ID environment variable not set")
        sys.exit(1)

    if not database_name:
        environment = os.getenv("ENVIRONMENT", "dev")
        database_name = f"{environment}-customer-db"
        logger.info(f"Using constructed database name: {database_name}")

    # Path to customer data file
    script_dir = Path(__file__).parent
    json_path = script_dir.parents[2] / "public" / "customers.json"

    if not json_path.exists():
        logger.error(f"Customer data file not found at: {json_path}")
        sys.exit(1)

    # Initialize seeder and run
    try:
        seeder = CustomerSeeder(
            project_id=project_id,
            database_name=database_name
        )

        success = seeder.seed_customers(json_path, force_update)

        if success:
            logger.info("✅ Customer seeding completed successfully")
            sys.exit(0)
        else:
            logger.error("❌ Customer seeding failed")
            sys.exit(1)

    except Exception as e:
        logger.error(f"Failed to initialize customer seeder: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()