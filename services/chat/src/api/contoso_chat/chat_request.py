import json
import os

from prisma import Prisma

from .search_service import get_search_service


async def get_customer_from_postgres(customer_id: str):
    """Retrieves a customer's data from PostgreSQL."""
    if not customer_id:
        return None
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
            return user.model_dump()
        else:
            return None
    except Exception as e:
        print(f"Error retrieving customer from Postgres: {e}")
        return None

async def generate_llm_response(prompt: str, context: str, user_name: str, provider: str, project_id: str, location: str, model_name: str):
    """Generates a response using either local Ollama (via LiteLLM) or GCP Vertex AI."""
    
    system_instruction = f"""You are a knowledgeable and friendly outdoor gear expert for Contoso Outdoor. 
    Your goal is to help {user_name} find the best equipment from our catalog.

    Guidelines:
    - Use the provided Catalog Context to answer the user's question accurately.
    - Analyze product features (like waterproof materials, weight, or size) to make relevant recommendations.
    - If multiple products are suitable, compare them to help the user choose.
    - Be professional, helpful, and conversational.
    - If the catalog doesn't contain the answer, politely let the user know and suggest the closest alternative.
    """

    if provider == "local":
        from litellm import completion
        api_base = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
        local_model = os.getenv("LOCAL_MODEL_NAME", "gemma3:12b")
        
        response = completion(
            model=f"ollama/{local_model}",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": f"Catalog Context:\n{context}\n\nUser Question: {prompt}"}
            ],
            api_base=api_base,
            temperature=0.7
        )
        return response.choices[0].message.content
    else:
        import vertexai
        from vertexai.generative_models import GenerativeModel, Part
        vertexai.init(project=project_id, location=location)
        model = GenerativeModel(model_name)
        
        full_prompt = f"{system_instruction}\n\nCatalog Context:\n{context}\n\nUser Question: {prompt}"
        response = model.generate_content([Part.from_text(full_prompt)])
        return response.text

async def get_response(customer_id, question, chat_history):
    """Generates a response using the RAG pattern."""
    
    project_id = os.environ.get("PROJECT_ID")
    location = os.environ.get("REGION")
    
    # 1. Retrieve customer data
    customer = await get_customer_from_postgres(customer_id)
    user_name = customer['firstName'] if customer else 'Guest'

    # 2. Retrieve relevant product documentation (restored to 5 results)
    search_service = get_search_service()
    product_context = search_service.search(question, limit=5)

    # 3. Generate a response
    provider = os.environ.get("LLM_PROVIDER", "gcp")
    model_name = os.environ.get("GEMINI_MODEL_NAME", "gemini-2.5-flash")

    # Provide richer context to the more capable model
    context_str = json.dumps(product_context, indent=2)
    
    answer = await generate_llm_response(question, context_str, user_name, provider, project_id, location, model_name)
    
    return {
        "question": question,
        "answer": answer,
        "context": product_context
    }