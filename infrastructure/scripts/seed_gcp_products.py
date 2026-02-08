#!/usr/bin/env python3
"""
Idempotent script to seed product data into Google Cloud Discovery Engine.
This script creates the search datastore, uploads documents, and configures embeddings.
"""

import os
import sys
import csv
import json
import logging
from typing import Dict, List, Any
from pathlib import Path

from google.cloud import discoveryengine_v1
from google.api_core import exceptions
import vertexai
from vertexai.language_models import TextEmbeddingModel

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProductSeeder:
    def __init__(self, project_id: str, region: str, datastore_id: str, location: str = "global"):
        self.project_id = project_id
        self.region = region
        self.location = location
        self.datastore_id = datastore_id

        # Initialize Vertex AI
        vertexai.init(project=project_id, location=region)

        # Initialize Discovery Engine client
        self.client = discoveryengine_v1.DocumentServiceClient()
        self.parent = f"projects/{project_id}/locations/{location}/dataStores/{datastore_id}/branches/default_branch"

        # Initialize embedding model
        self.embedding_model = TextEmbeddingModel.from_pretrained("textembedding-gecko@003")

    def check_datastore_exists(self) -> bool:
        """Check if the datastore exists."""
        try:
            datastore_client = discoveryengine_v1.DataStoreServiceClient()
            datastore_name = f"projects/{self.project_id}/locations/{self.location}/dataStores/{self.datastore_id}"
            datastore_client.get_data_store(name=datastore_name)
            logger.info(f"Datastore {self.datastore_id} exists")
            return True
        except exceptions.NotFound:
            logger.warning(f"Datastore {self.datastore_id} not found")
            return False
        except Exception as e:
            logger.error(f"Error checking datastore: {e}")
            return False

    def load_products_from_json(self, json_path: str) -> List[Dict[str, Any]]:
        """Load products from JSON file."""
        products = []
        try:
            with open(json_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                if isinstance(data, list):
                    for item in data:
                        products.append({
                            'id': str(item['id']),
                            'name': item['name'],
                            'price': float(item['price']),
                            'category': item['category'],
                            'brand': item['brand'],
                            'description': item['description']
                        })
                else:
                    logger.error(f"Expected list of products in {json_path}")
            
            logger.info(f"Loaded {len(products)} products from {json_path}")
            return products
        except Exception as e:
            logger.error(f"Error loading products from JSON: {e}")
            raise

    def generate_embeddings(self, text: str) -> List[float]:
        """Generate embeddings for the given text."""
        try:
            embeddings = self.embedding_model.get_embeddings([text])
            return embeddings[0].values
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            return []

    def create_document(self, product: Dict[str, Any]) -> discoveryengine_v1.Document:
        """Create a Discovery Engine document from product data."""
        doc_id = f"product_{product['id']}"

        # Generate embeddings for the product description
        embeddings = self.generate_embeddings(product['description'])

        # Create structured data
        struct_data = {
            "id": product['id'],
            "name": product['name'],
            "price": product['price'],
            "category": product['category'],
            "brand": product['brand'],
            "description": product['description'],
            "url": f"/products/{product['name'].lower().replace(' ', '-')}",
            "content": product['description']
        }

        document = discoveryengine_v1.Document(
            id=doc_id,
            struct_data=struct_data,
            content=discoveryengine_v1.Document.Content(
                mime_type="text/plain",
                raw_bytes=product['description'].encode('utf-8')
            )
        )

        # Add embeddings if generated successfully
        if embeddings:
            document.derived_struct_data = {
                "extractive_answers": [
                    {
                        "content": product['description'],
                        "page_identifier": doc_id
                    }
                ],
                "embeddings": embeddings
            }

        return document

    def document_exists(self, doc_id: str) -> bool:
        """Check if a document already exists."""
        try:
            document_name = f"{self.parent}/documents/{doc_id}"
            self.client.get_document(name=document_name)
            return True
        except exceptions.NotFound:
            return False
        except Exception as e:
            logger.error(f"Error checking document existence: {e}")
            return False

    def upload_document(self, document: discoveryengine_v1.Document) -> bool:
        """Upload a single document, checking for existence first."""
        try:
            doc_id = document.id

            # Check if document already exists
            if self.document_exists(doc_id):
                logger.info(f"Document {doc_id} already exists, skipping...")
                return True

            # Create the document
            request = discoveryengine_v1.CreateDocumentRequest(
                parent=self.parent,
                document=document,
                document_id=doc_id
            )

            response = self.client.create_document(request=request)
            logger.info(f"Successfully uploaded document: {doc_id}")
            return True

        except Exception as e:
            logger.error(f"Error uploading document {document.id}: {e}")
            return False

    def batch_upload_documents(self, documents: List[discoveryengine_v1.Document]) -> Dict[str, int]:
        """Upload documents in batches with idempotency checks."""
        results = {"uploaded": 0, "skipped": 0, "failed": 0}

        for document in documents:
            try:
                if self.upload_document(document):
                    if self.document_exists(document.id):
                        results["skipped"] += 1
                    else:
                        results["uploaded"] += 1
                else:
                    results["failed"] += 1
            except Exception as e:
                logger.error(f"Error processing document {document.id}: {e}")
                results["failed"] += 1

        return results

    def seed_products(self, json_path: str) -> bool:
        """Main method to seed products into Discovery Engine."""
        try:
            # Check if datastore exists
            if not self.check_datastore_exists():
                logger.error("Datastore not found. Please ensure Terraform has been applied.")
                return False

            # Load products from JSON
            products = self.load_products_from_json(json_path)
            if not products:
                logger.error("No products loaded")
                return False

            # Convert products to documents
            documents = []
            for product in products:
                document = self.create_document(product)
                documents.append(document)

            # Upload documents
            logger.info(f"Uploading {len(documents)} documents...")
            results = self.batch_upload_documents(documents)

            logger.info(f"Upload results: {results}")

            if results["failed"] > 0:
                logger.warning(f"{results['failed']} documents failed to upload")
                return False

            logger.info("Product seeding completed successfully")
            return True

        except Exception as e:
            logger.error(f"Error seeding products: {e}")
            return False


def main():
    """Main function to run the product seeding script."""
    # Get environment variables
    project_id = os.getenv("PROJECT_ID")
    region = os.getenv("REGION", "us-central1")
    environment = os.getenv("ENVIRONMENT", "dev")
    datastore_id = os.getenv("DISCOVERY_ENGINE_DATASTORE_ID")

    if not project_id:
        logger.error("PROJECT_ID environment variable not set")
        sys.exit(1)

    if not datastore_id:
        # Construct datastore ID from environment if not provided
        datastore_id = f"{environment}-products-datastore"
        logger.info(f"Using constructed datastore_id: {datastore_id}")

    # Path to products JSON
    script_dir = Path(__file__).parent
    json_path = script_dir.parents[1] / "public" / "products.json"

    if not json_path.exists():
        logger.error(f"Products JSON not found at: {json_path}")
        sys.exit(1)

    # Initialize seeder and run
    seeder = ProductSeeder(
        project_id=project_id,
        region=region,
        datastore_id=datastore_id
    )

    success = seeder.seed_products(str(json_path))

    if success:
        logger.info("✅ Product seeding completed successfully")
        sys.exit(0)
    else:
        logger.error("❌ Product seeding failed")
        sys.exit(1)


if __name__ == "__main__":
    main()