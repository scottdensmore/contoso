import json
import os
from typing import Any

from .search_service import get_search_service


def extract_product_citations(product_context: list) -> list[dict]:
    """Extracts clean product citations from product_context, deduplicated by slug."""
    citations: list[dict] = []
    seen_slugs: set[str] = set()

    for item in product_context or []:
        if not isinstance(item, dict):
            continue

        nested = (
            item.get("structData")
            or item.get("struct_data")
            or item.get("derivedStructData")
            or item.get("derived_struct_data")
            or {}
        )
        if not isinstance(nested, dict):
            nested = {}

        name = item.get("name") or item.get("title") or nested.get("name") or nested.get("title")
        slug = item.get("slug") or nested.get("slug")
        price = item.get("price") if item.get("price") is not None else nested.get("price")
        image = item.get("image") or nested.get("image")
        category = (
            item.get("category")
            or item.get("categoryName")
            or nested.get("category")
            or nested.get("categoryName")
        )

        if slug and slug in seen_slugs:
            continue
        if slug:
            seen_slugs.add(slug)

        citations.append({
            "name": name,
            "slug": slug,
            "price": price,
            "image": image,
            "category": category,
        })

    return citations


def format_chat_history(chat_history: Any, max_turns: int = 10) -> list[dict[str, str]]:
    """Normalizes and bounds conversation history.

    - If chat_history is a string, attempt json.loads(chat_history). If invalid JSON or non-list, treat as empty list.
    - If chat_history is a list, normalize each item:
      - Standard turn format: dict with keys role and content or message.
      - Q&A turn format: dict with keys question and answer. Convert into two turns:
        {"role": "user", "content": item["question"]} and {"role": "assistant", "content": item["answer"]}.
      - Skip invalid or empty items.
    - If chat_history is None or any other type, return [].
    - Window bounding: retain only the most recent max_turns turns (default 10).
    - Return list[dict[str, str]] with keys role and content.
    """
    if chat_history is None:
        return []

    if isinstance(chat_history, str):
        try:
            parsed = json.loads(chat_history)
            if isinstance(parsed, list):
                chat_history = parsed
            else:
                return []
        except (json.JSONDecodeError, TypeError):
            return []

    if not isinstance(chat_history, list):
        return []

    turns: list[dict[str, str]] = []
    for item in chat_history:
        if not isinstance(item, dict):
            continue

        if "question" in item and "answer" in item:
            q = item.get("question")
            a = item.get("answer")
            if isinstance(q, str) and q.strip() and isinstance(a, str) and a.strip():
                turns.append({"role": "user", "content": q.strip()})
                turns.append({"role": "assistant", "content": a.strip()})
            continue

        role = item.get("role")
        content = item.get("content")
        if content is None:
            content = item.get("message")

        if isinstance(role, str) and role.strip() and isinstance(content, str) and content.strip():
            turns.append({"role": role.strip().lower(), "content": content.strip()})

    if max_turns <= 0:
        return []

    if len(turns) > max_turns:
        turns = turns[-max_turns:]

    return turns


def format_chat_history_prompt(formatted_history: list[dict[str, str]]) -> str:
    """Formats history turns into readable text block.

    If empty, return "".
    Example:
    Conversation History:
    User: <content>
    Assistant: <content>
    """
    if not formatted_history:
        return ""

    lines = ["Conversation History:"]
    for turn in formatted_history:
        role = turn.get("role", "").capitalize()
        content = turn.get("content", "")
        lines.append(f"{role}: {content}")
    return "\n".join(lines)


async def get_customer_from_postgres(customer_id: str):
    """Retrieves a customer's data from PostgreSQL."""
    if not customer_id:
        return None
    try:
        # Imported lazily so unit tests can exercise this module without a
        # database driver present, matching the previous client's behaviour.
        from db import fetch_customer

        return await fetch_customer(customer_id)
    except Exception as e:
        print(f"Error retrieving customer from Postgres: {e}")
        return None


async def generate_llm_response(
    prompt: str,
    context: str,
    user_name: str,
    provider: str,
    project_id: str | None,
    location: str | None,
    model_name: str,
    chat_history: Any = None,
):
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

    history = format_chat_history(chat_history)
    history_prompt = format_chat_history_prompt(history)

    if provider == "local":
        try:
            from litellm import completion
        except ImportError as exc:
            raise RuntimeError(
                "Local LLM provider dependencies are not installed. "
                "Rebuild with CHAT_INSTALL_LOCAL_STACK=1 or install requirements-local.txt."
            ) from exc
        api_base = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
        local_model = os.getenv("LOCAL_MODEL_NAME", "gemma3:12b")

        messages = [
            {"role": "system", "content": system_instruction},
            *[{"role": turn["role"], "content": turn["content"]} for turn in history],
            {"role": "user", "content": f"Catalog Context:\n{context}\n\nUser Question: {prompt}"},
        ]

        response = completion(
            model=f"ollama/{local_model}",
            messages=messages,
            api_base=api_base,
            temperature=0.7,
        )
        return response.choices[0].message.content
    else:
        from google import genai

        client = genai.Client(vertexai=True, project=project_id, location=location)
        if history_prompt:
            full_prompt = f"{system_instruction}\n\n{history_prompt}\n\nCatalog Context:\n{context}\n\nUser Question: {prompt}"
        else:
            full_prompt = f"{system_instruction}\n\nCatalog Context:\n{context}\n\nUser Question: {prompt}"
        response = client.models.generate_content(
            model=model_name,
            contents=full_prompt,
        )
        return response.text


async def get_response(customer_id, question, chat_history: Any = None):
    """Generates a response using the RAG pattern."""
    project_id = os.environ.get("PROJECT_ID")
    location = os.environ.get("REGION")

    # 1. Retrieve customer data
    customer = await get_customer_from_postgres(customer_id)
    user_name = customer["firstName"] if customer else "Guest"

    # 2. Retrieve relevant product documentation (restored to 5 results)
    search_service = get_search_service()
    product_context = search_service.search(question, limit=5)

    # 3. Generate a response
    provider = os.environ.get("LLM_PROVIDER", "gcp")
    model_name = os.environ.get("GEMINI_MODEL_NAME", "gemini-2.5-flash")

    # Provide richer context to the more capable model
    context_str = json.dumps(product_context, indent=2)

    answer = await generate_llm_response(
        question,
        context_str,
        user_name,
        provider,
        project_id,
        location,
        model_name,
        chat_history=chat_history,
    )

    citations = extract_product_citations(product_context)

    return {
        "question": question,
        "answer": answer,
        "context": product_context,
        "citations": citations,
    }


def generate_llm_response_stream(
    prompt: str,
    context: str,
    user_name: str,
    provider: str,
    project_id: str | None,
    location: str | None,
    model_name: str,
    chat_history: Any = None,
):
    """Generates a streaming response using either local Ollama (via LiteLLM) or GCP Vertex AI."""
    system_instruction = f"""You are a knowledgeable and friendly outdoor gear expert for Contoso Outdoor. 
    Your goal is to help {user_name} find the best equipment from our catalog.

    Guidelines:
    - Use the provided Catalog Context to answer the user's question accurately.
    - Analyze product features (like waterproof materials, weight, or size) to make relevant recommendations.
    - If multiple products are suitable, compare them to help the user choose.
    - Be professional, helpful, and conversational.
    - If the catalog doesn't contain the answer, politely let the user know and suggest the closest alternative.
    """

    history = format_chat_history(chat_history)
    history_prompt = format_chat_history_prompt(history)

    if provider == "local":
        try:
            from litellm import completion
        except ImportError as exc:
            raise RuntimeError(
                "Local LLM provider dependencies are not installed. "
                "Rebuild with CHAT_INSTALL_LOCAL_STACK=1 or install requirements-local.txt."
            ) from exc
        api_base = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
        local_model = os.getenv("LOCAL_MODEL_NAME", "gemma3:12b")

        messages = [
            {"role": "system", "content": system_instruction},
            *[{"role": turn["role"], "content": turn["content"]} for turn in history],
            {"role": "user", "content": f"Catalog Context:\n{context}\n\nUser Question: {prompt}"},
        ]

        response = completion(
            model=f"ollama/{local_model}",
            messages=messages,
            api_base=api_base,
            temperature=0.7,
            stream=True,
        )
        for chunk in response:
            if chunk.choices and hasattr(chunk.choices[0], "delta") and getattr(chunk.choices[0].delta, "content", None):
                yield chunk.choices[0].delta.content
    else:
        from google import genai

        client = genai.Client(vertexai=True, project=project_id, location=location)
        if history_prompt:
            full_prompt = f"{system_instruction}\n\n{history_prompt}\n\nCatalog Context:\n{context}\n\nUser Question: {prompt}"
        else:
            full_prompt = f"{system_instruction}\n\nCatalog Context:\n{context}\n\nUser Question: {prompt}"
        response = client.models.generate_content_stream(
            model=model_name,
            contents=full_prompt,
        )
        for chunk in response:
            if chunk.text:
                yield chunk.text


async def get_response_stream(customer_id: str, question: str, chat_history: Any = None):
    """Generates a streaming response using the RAG pattern."""
    project_id = os.environ.get("PROJECT_ID")
    location = os.environ.get("REGION")

    # 1. Retrieve customer data
    customer = await get_customer_from_postgres(customer_id)
    user_name = customer["firstName"] if customer else "Guest"

    # 2. Retrieve relevant product documentation (restored to 5 results)
    search_service = get_search_service()
    product_context = search_service.search(question, limit=5)

    # 3. Generate a response stream
    provider = os.environ.get("LLM_PROVIDER", "gcp")
    model_name = os.environ.get("GEMINI_MODEL_NAME", "gemini-2.5-flash")

    # Provide richer context to the more capable model
    context_str = json.dumps(product_context, indent=2)

    citations = extract_product_citations(product_context)

    # Initial SSE frame with citations
    yield f"data: {json.dumps({'event': 'citations', 'citations': citations})}\n\n"

    for chunk in generate_llm_response_stream(
        question,
        context_str,
        user_name,
        provider,
        project_id,
        location,
        model_name,
        chat_history=chat_history,
    ):
        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
