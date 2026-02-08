#!/usr/bin/env python3
"""
Create Discovery Engine datastore using Python API
"""
import os
from google.cloud import discoveryengine_v1

PROJECT_ID = os.environ.get("PROJECT_ID", "contoso-outdoor")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")
DATASTORE_ID = f"{ENVIRONMENT}-products-datastore"

def create_datastore():
    client = discoveryengine_v1.DataStoreServiceClient()
    parent = f"projects/{PROJECT_ID}/locations/global"
    
    datastore = discoveryengine_v1.DataStore(
        display_name=f"{ENVIRONMENT} Products Datastore",
        industry_vertical=discoveryengine_v1.IndustryVertical.GENERIC,
        solution_types=[discoveryengine_v1.SolutionType.SOLUTION_TYPE_SEARCH],
        content_config=discoveryengine_v1.DataStore.ContentConfig.CONTENT_REQUIRED,
    )
    
    try:
        operation = client.create_data_store(
            parent=parent,
            data_store=datastore,
            data_store_id=DATASTORE_ID
        )
        print(f"Creating datastore {DATASTORE_ID}...")
        result = operation.result()
        print(f"✅ Created datastore: {result.name}")
        return True
    except Exception as e:
        if "already exists" in str(e):
            print(f"✅ Datastore {DATASTORE_ID} already exists")
            return True
        else:
            print(f"❌ Error creating datastore: {e}")
            return False

if __name__ == "__main__":
    create_datastore()
