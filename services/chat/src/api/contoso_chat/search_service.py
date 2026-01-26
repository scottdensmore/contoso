import os
import chromadb
from chromadb.utils import embedding_functions
from google.cloud import discoveryengine_v1alpha as discoveryengine

class SearchService:
    def search(self, query: str) -> list:
        raise NotImplementedError

class LocalVectorSearch(SearchService):
    def __init__(self):
        # Path relative to where the app runs (/app)
        # We store data in /app/data/chroma_db
        self.chroma_path = os.getenv("CHROMA_DB_PATH", "/app/data/chroma_db")
        self.client = chromadb.PersistentClient(path=self.chroma_path)
        self.ef = embedding_functions.DefaultEmbeddingFunction()
        try:
            self.collection = self.client.get_collection(name="products", embedding_function=self.ef)
        except Exception as e:
            print(f"Error initializing local vector search: {e}")
            self.collection = None

    def search(self, query: str) -> list:
        if not self.collection:
            return []
            
        results = self.collection.query(
            query_texts=[query],
            n_results=5
        )
        
        # Format results to match Discovery Engine structure roughly (list of dicts)
        formatted_results = []
        if results['metadatas'] and results['documents']:
            for i, meta in enumerate(results['metadatas'][0]):
                # Add the document text as 'content' or similar to match what the prompt expects
                # Discovery Engine usually returns 'derivedStructData' or similar content.
                # We'll just put the text in a key that the prompt can use.
                item = meta.copy()
                item['content'] = results['documents'][0][i]
                formatted_results.append(item)
        
        return formatted_results

class VertexAISearch(SearchService):
    def __init__(self, project_id: str, location: str, search_app_id: str):
        self.project_id = project_id
        self.location = location
        self.search_app_id = search_app_id
        self.client = discoveryengine.SearchServiceClient()
        self.serving_config = f"projects/{self.project_id}/locations/global/collections/default_collection/dataStores/{self.search_app_id}/servingConfigs/default_config"

    def search(self, query: str) -> list:
        try:
            request = discoveryengine.SearchRequest(
                serving_config=self.serving_config,
                query=query,
                page_size=5,
            )
            response = self.client.search(request)
            return [discoveryengine.Document.to_dict(r.document) for r in response.results]
        except Exception as e:
            print(f"Error searching products in Vertex AI Search: {e}")
            return []

def get_search_service() -> SearchService:
    provider = os.getenv("LLM_PROVIDER", "gcp")
    if provider == "local":
        return LocalVectorSearch()
    else:
        project_id = os.getenv("PROJECT_ID")
        location = os.getenv("REGION")
        search_app_id = os.getenv("DISCOVERY_ENGINE_DATASTORE_ID")
        return VertexAISearch(project_id, location, search_app_id)
