
import os
import json
from prisma import Prisma
from .search_service import get_search_service

async def get_customer_from_postgres(customer_id: str):
    """Retrieves a customer's data from PostgreSQL."""
    try:
        db = Prisma()
        await db.connect()
        
        # Try to find by ID
        user = await db.user.find_unique(
            where={'id': customer_id},
            include={
                'orders': {
                    'include': {
                        'items': {
                            'include': {
                                'product': True
                            }
                        }
                    }
                }
            }
        )
        
        await db.disconnect()
        
        if user:
            # Convert to dictionary
            return user.model_dump()
        else:
            return None
    except Exception as e:
        print(f"Error retrieving customer from Postgres: {e}")
        return None

async def generate_llm_response(prompt: str, provider: str, project_id: str, location: str, model_name: str):
    """Generates a response using either local Ollama (via LiteLLM) or GCP Vertex AI."""
    if provider == "local":
        from litellm import completion
        api_base = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
        # Ensure we use the correct model format for LiteLLM + Ollama
        # Assuming user has pulled gemma:2b locally
        response = completion(
            model="ollama/gemma:2b",
            messages=[{"role": "user", "content": prompt}],
            api_base=api_base
        )
        return response.choices[0].message.content
    else:
        import vertexai
        from vertexai.generative_models import GenerativeModel, Part
        vertexai.init(project=project_id, location=location)
        model = GenerativeModel(model_name)
        response = model.generate_content([Part.from_text(prompt)])
        return response.text

async def get_response(customer_id, question, chat_history):
    """Generates a response using the RAG pattern."""
    
    project_id = os.environ.get("PROJECT_ID")
    location = os.environ.get("REGION")
    
    # 1. Retrieve customer data
    print(f"Retrieving customer {customer_id}...")
    customer = await get_customer_from_postgres(customer_id)

    # 2. Retrieve relevant product documentation
    print(f"Searching for products related to: {question}")
    search_service = get_search_service()
    product_context = search_service.search(question)

    # 3. Generate a response
    print("Generating response...")
    provider = os.environ.get("LLM_PROVIDER", "gcp")
    print(f"DEBUG: LLM_PROVIDER is {provider}")
    model_name = os.environ.get("GEMINI_MODEL_NAME", "gemini-2.5-flash")

    # Prepare the prompt
    prompt = f"""You are a helpful AI assistant for Contoso Outdoor, an online retailer.
    Your customer is {customer['firstName'] if customer else 'a guest'}.
    Their chat history is: {chat_history}

    Based on the following product information, please answer the customer's question.
    Product Information:
    {json.dumps(product_context, indent=2)}

    Customer's Question: {question}
    """

    answer = await generate_llm_response(prompt, provider, project_id, location, model_name)
    
    return {
        "question": question,
        "answer": answer,
        "context": product_context
    }
