
import os
import json
from google.cloud import firestore
from google.cloud import discoveryengine_v1alpha as discoveryengine
import vertexai
from vertexai.generative_models import GenerativeModel, Part

def get_customer_from_firestore(customer_id: str, project_id: str):
    """Retrieves a customer's data from Firestore."""
    try:
        db = firestore.Client(project=project_id)
        doc_ref = db.collection('customers').document(customer_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        else:
            return None
    except Exception as e:
        print(f"Error retrieving customer from Firestore: {e}")
        return None

def search_products_vertex_ai(query: str, project_id: str, location: str, search_app_id: str):
    """Performs a semantic search for products using Vertex AI Search."""
    try:
        client = discoveryengine.SearchServiceClient()
        serving_config = f"projects/{project_id}/locations/global/collections/default_collection/dataStores/{search_app_id}/servingConfigs/default_config"

        request = discoveryengine.SearchRequest(
            serving_config=serving_config,
            query=query,
            page_size=5,
        )

        response = client.search(request)
        return [discoveryengine.Document.to_dict(r.document) for r in response.results]
    except Exception as e:
        print(f"Error searching products in Vertex AI Search: {e}")
        return []

def get_response(customer_id, question, chat_history):
    """Generates a response using the RAG pattern with GCP services."""
    
    project_id = os.environ.get("PROJECT_ID")
    location = os.environ.get("REGION")
    search_app_id = os.environ.get("DISCOVERY_ENGINE_DATASTORE_ID")

    # 1. Retrieve customer data
    print(f"Retrieving customer {customer_id}...")
    customer = get_customer_from_firestore(customer_id, project_id)

    # 2. Retrieve relevant product documentation
    print(f"Searching for products related to: {question}")
    product_context = search_products_vertex_ai(question, project_id, location, search_app_id)

    # 3. Generate a response using a Gemini model
    print("Generating response with Gemini...")
    vertexai.init(project=project_id, location=location)
    model_name = os.environ.get("GEMINI_MODEL_NAME", "gemini-2.5-flash")
    model = GenerativeModel(model_name)

    # Prepare the prompt
    prompt = f"""You are a helpful AI assistant for Contoso Outdoor, an online retailer.
    Your customer is {customer['firstName'] if customer else 'a guest'}.
    Their chat history is: {chat_history}

    Based on the following product information, please answer the customer's question.
    Product Information:
    {json.dumps(product_context, indent=2)}

    Customer's Question: {question}
    """

    response = model.generate_content([Part.from_text(prompt)])
    
    return {
        "question": question,
        "answer": response.text,
        "context": product_context
    }
