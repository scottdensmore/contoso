import json
import os
import re
from typing import Any

from .order_tracking import (
    build_order_tracking_prompt,
    detect_order_tracking_intent,
    lookup_order_tracking,
)
from .policies import (
    build_policy_prompt,
    detect_policy_intent,
)
from .promotions import (
    build_promo_prompt,
    detect_promo_intent,
    get_active_promotions,
)
from .search_service import get_search_service
from .stores import (
    build_store_prompt,
    detect_store_intent,
)


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


def build_customer_profile_context(customer: dict[str, Any] | None) -> dict[str, Any]:
    """Builds customer profile context for personalized recommendations."""
    if customer is None:
        return {
            "user_name": "Guest",
            "membership": None,
            "past_purchases": [],
            "profile_prompt": "",
        }

    user_name = customer.get("firstName") or customer.get("name") or "Valued Customer"
    membership = customer.get("membership")

    seen: set[str] = set()
    past_purchases: list[str] = []

    for order in customer.get("orders", []) or []:
        if not isinstance(order, dict):
            continue
        for item in order.get("items", []) or []:
            if not isinstance(item, dict):
                continue
            product = item.get("product")
            name = None
            if isinstance(product, dict):
                name = (
                    product.get("name")
                    or product.get("title")
                    or product.get("category")
                    or product.get("categoryName")
                )
            elif isinstance(product, str):
                name = product
            elif not product:
                name = (
                    item.get("name")
                    or item.get("product_name")
                    or item.get("category")
                    or item.get("categoryName")
                )

            if name and isinstance(name, str) and name.strip() and name.strip() not in seen:
                seen.add(name.strip())
                past_purchases.append(name.strip())

    purchases_str = ", ".join(past_purchases) if past_purchases else "None"
    profile_prompt = (
        f"Customer Profile:\n"
        f"- Name: {user_name}\n"
        f"- Membership Tier: {membership}\n"
        f"- Past Purchases: {purchases_str}\n"
        f"- Recommendation Guidelines: Tailor product suggestions to complement the customer's existing gear and acknowledge their membership status when relevant."
    )

    return {
        "user_name": user_name,
        "membership": membership,
        "past_purchases": past_purchases,
        "profile_prompt": profile_prompt,
    }


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
    customer_profile: dict[str, Any] | None = None,
    profile_prompt: str = "",
    order_tracking_prompt: str = "",
    promo_prompt: str = "",
    policy_prompt: str = "",
    store_prompt: str = "",
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

    if customer_profile and isinstance(customer_profile, dict):
        if not profile_prompt:
            profile_prompt = customer_profile.get("profile_prompt", "")

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

        local_system = system_instruction
        if profile_prompt:
            local_system = f"{local_system}\n\n{profile_prompt}"
        if order_tracking_prompt:
            local_system = f"{local_system}\n\n{order_tracking_prompt}"
        if promo_prompt:
            local_system = f"{local_system}\n\n{promo_prompt}"
        if policy_prompt:
            local_system = f"{local_system}\n\n{policy_prompt}"
        if store_prompt:
            local_system = f"{local_system}\n\n{store_prompt}"
        if store_prompt:
            local_system = f"{local_system}\n\n{store_prompt}"

        messages = [
            {"role": "system", "content": local_system},
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
        prompt_parts = [system_instruction]
        if history_prompt:
            prompt_parts.append(history_prompt)
        if profile_prompt:
            prompt_parts.append(profile_prompt)
        if order_tracking_prompt:
            prompt_parts.append(order_tracking_prompt)
        if promo_prompt:
            prompt_parts.append(promo_prompt)
        if policy_prompt:
            prompt_parts.append(policy_prompt)
        if store_prompt:
            prompt_parts.append(store_prompt)
        prompt_parts.append(f"Catalog Context:\n{context}\n\nUser Question: {prompt}")
        full_prompt = "\n\n".join(prompt_parts)

        response = client.models.generate_content(
            model=model_name,
            contents=full_prompt,
        )
        return response.text



SUPPORT_CONTACT = {
    "email": "support@contosooutdoor.com",
    "phone": "1-800-555-0199",
    "hours": "Mon-Fri 8am-8pm EST",
}

AGENT_PATTERNS = [
    r"\bhuman\b",
    r"\bhumans\b",
    r"\bagent\b",
    r"\bagents\b",
    r"\breal person\b",
    r"\brepresentative\b",
    r"\brepresentatives\b",
    r"\boperator\b",
    r"\boperators\b",
    r"\btalk to someone\b",
    r"\bspeak to someone\b",
    r"\bspeak with someone\b",
    r"\btalk to a person\b",
    r"\bspeak to a person\b",
    r"\bspeak with a person\b",
    r"\btalk to a human\b",
    r"\bspeak to a human\b",
    r"\bspeak with a human\b",
    r"\bcustomer service representative\b",
    r"\bcustomer service rep\b",
    r"\blive agent\b",
    r"\bsupport agent\b",
]

DISPUTE_PATTERNS = [
    r"\bcancel (?:my |the )?order\b",
    r"\bcancellation\b",
    r"\brefund (?:my )?money\b",
    r"\brefund\b",
    r"\brefunds\b",
    r"\bdispute (?:a |the )?charge\b",
    r"\bdispute\b",
    r"\bdisputes\b",
    r"\bbroken item\b",
    r"\bbroken\b",
    r"\bdefective item\b",
    r"\bdefective\b",
    r"\bstolen package\b",
    r"\bnever arrived\b",
    r"\bspeak to (?:a )?manager\b",
    r"\btalk to (?:a )?manager\b",
    r"\bspeak with (?:a )?manager\b",
    r"\btalk with (?:a )?manager\b",
    r"\bsupervisor\b",
    r"\bsupervisors\b",
    r"\bchargeback\b",
    r"\bchargebacks\b",
]

FRUSTRATION_PATTERNS = [
    r"\byou are useless\b",
    r"\byou're useless\b",
    r"\buseless\b",
    r"\bnot helping\b",
    r"\bstop repeating\b",
    r"\bthis is ridiculous\b",
    r"\bridiculous\b",
    r"\bterrible service\b",
    r"\bhorrible service\b",
    r"\bawful service\b",
    r"\bworst service\b",
    r"\bcompletely unhelpful\b",
    r"\bunhelpful\b",
    r"\bwaste of time\b",
]


def detect_handoff_intent(question: str, chat_history: Any = None) -> dict:
    """Evaluates user question (and recent history if applicable) for escalation or handoff intent."""
    texts_to_check: list[str] = []

    if isinstance(question, str) and question.strip():
        texts_to_check.append(question.strip())

    if not texts_to_check and chat_history is not None:
        history = format_chat_history(chat_history)
        for turn in reversed(history):
            if turn.get("role") == "user" and turn.get("content"):
                texts_to_check.append(turn["content"])
                break

    for text in texts_to_check:
        for pattern in AGENT_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return {
                    "requested": True,
                    "reason": "agent_requested",
                    "suggested_action": "live_agent_transfer",
                    "support_contact": SUPPORT_CONTACT,
                }

        for pattern in DISPUTE_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return {
                    "requested": True,
                    "reason": "dispute_or_refund",
                    "suggested_action": "support_ticket",
                    "support_contact": SUPPORT_CONTACT,
                }

        for pattern in FRUSTRATION_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return {
                    "requested": True,
                    "reason": "user_frustration",
                    "suggested_action": "contact_support",
                    "support_contact": SUPPORT_CONTACT,
                }

    return {
        "requested": False,
        "reason": None,
        "suggested_action": None,
        "support_contact": None,
    }


async def get_response(customer_id, question, chat_history: Any = None):
    """Generates a response using the RAG pattern."""
    project_id = os.environ.get("PROJECT_ID")
    location = os.environ.get("REGION")

    # 1. Retrieve customer data
    customer = await get_customer_from_postgres(customer_id)
    profile = build_customer_profile_context(customer)
    user_name = profile["user_name"]

    # 2. Retrieve relevant product documentation (restored to 5 results)
    search_service = get_search_service()
    product_context = search_service.search(question, limit=5)

    # 3. Generate a response
    provider = os.environ.get("LLM_PROVIDER", "gcp")
    model_name = os.environ.get("GEMINI_MODEL_NAME", "gemini-2.5-flash")

    # Provide richer context to the more capable model
    context_str = json.dumps(product_context, indent=2)

    tracking_intent = detect_order_tracking_intent(question)
    tracking_info = None
    order_tracking_prompt = ""
    if tracking_intent.get("is_tracking_intent"):
        customer_orders = customer.get("orders") if customer else None
        tracking_info = lookup_order_tracking(
            customer_id=customer_id,
            order_id=tracking_intent.get("extracted_order_id"),
            customer_orders=customer_orders,
        )
        order_tracking_prompt = build_order_tracking_prompt(tracking_info, question)

    promo_intent = detect_promo_intent(question)
    promo_prompt = ""
    if promo_intent.get("is_promo_intent"):
        promo_prompt = build_promo_prompt(promo_intent, question)

    policy_intent = detect_policy_intent(question)
    policy_prompt = ""
    if policy_intent.get("is_policy_query") and policy_intent.get("matched_policy"):
        policy_prompt = build_policy_prompt(policy_intent["matched_policy"])

    store_intent = detect_store_intent(question)
    store_prompt = ""
    if store_intent.get("is_store_query") and store_intent.get("matched_stores"):
        store_prompt = build_store_prompt(
            store_intent["matched_stores"], store_intent.get("intent_type", "general")
        )

    llm_kwargs: dict[str, Any] = {
        "chat_history": chat_history,
        "customer_profile": profile,
    }
    if order_tracking_prompt:
        llm_kwargs["order_tracking_prompt"] = order_tracking_prompt
    if promo_prompt:
        llm_kwargs["promo_prompt"] = promo_prompt
    if policy_prompt:
        llm_kwargs["policy_prompt"] = policy_prompt
    if store_prompt:
        llm_kwargs["store_prompt"] = store_prompt

    answer = await generate_llm_response(
        question,
        context_str,
        user_name,
        provider,
        project_id,
        location,
        model_name,
        **llm_kwargs,
    )

    citations = extract_product_citations(product_context)
    handoff = detect_handoff_intent(question, chat_history)

    response_payload: dict[str, Any] = {
        "question": question,
        "answer": answer,
        "context": product_context,
        "citations": citations,
        "handoff": handoff,
        "customer_profile": {
            "membership": profile["membership"],
            "past_purchases_count": len(profile["past_purchases"]),
        },
    }
    if tracking_intent.get("is_tracking_intent"):
        response_payload["order_tracking"] = tracking_info
    if promo_intent.get("is_promo_intent"):
        response_payload["promotions"] = get_active_promotions()
    if policy_intent.get("is_policy_query") and policy_intent.get("matched_policy"):
        response_payload["policy"] = policy_intent["matched_policy"]
    if store_intent.get("is_store_query") and store_intent.get("matched_stores"):
        response_payload["stores"] = store_intent["matched_stores"]

    return response_payload


def generate_llm_response_stream(
    prompt: str,
    context: str,
    user_name: str,
    provider: str,
    project_id: str | None,
    location: str | None,
    model_name: str,
    chat_history: Any = None,
    customer_profile: dict[str, Any] | None = None,
    profile_prompt: str = "",
    order_tracking_prompt: str = "",
    promo_prompt: str = "",
    policy_prompt: str = "",
    store_prompt: str = "",
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

    if customer_profile and isinstance(customer_profile, dict):
        if not profile_prompt:
            profile_prompt = customer_profile.get("profile_prompt", "")

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

        local_system = system_instruction
        if profile_prompt:
            local_system = f"{local_system}\n\n{profile_prompt}"
        if order_tracking_prompt:
            local_system = f"{local_system}\n\n{order_tracking_prompt}"
        if promo_prompt:
            local_system = f"{local_system}\n\n{promo_prompt}"
        if policy_prompt:
            local_system = f"{local_system}\n\n{policy_prompt}"

        messages = [
            {"role": "system", "content": local_system},
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
        prompt_parts = [system_instruction]
        if history_prompt:
            prompt_parts.append(history_prompt)
        if profile_prompt:
            prompt_parts.append(profile_prompt)
        if order_tracking_prompt:
            prompt_parts.append(order_tracking_prompt)
        if promo_prompt:
            prompt_parts.append(promo_prompt)
        if policy_prompt:
            prompt_parts.append(policy_prompt)
        if store_prompt:
            prompt_parts.append(store_prompt)
        prompt_parts.append(f"Catalog Context:\n{context}\n\nUser Question: {prompt}")
        full_prompt = "\n\n".join(prompt_parts)

        response = client.models.generate_content_stream(
            model=model_name,
            contents=full_prompt,
        )
        for chunk in response:
            if chunk.text:
                yield chunk.text


async def get_response_stream(customer_id: str, question: str, chat_history: Any = None):
    """Generates a streaming response using the RAG pattern."""
    yield f"data: {json.dumps({'event': 'status', 'status': 'searching_catalog', 'message': 'Searching product catalog...'})}\n\n"

    project_id = os.environ.get("PROJECT_ID")
    location = os.environ.get("REGION")

    # 1. Retrieve customer data
    customer = await get_customer_from_postgres(customer_id)
    profile = build_customer_profile_context(customer)
    user_name = profile["user_name"]

    # 2. Retrieve relevant product documentation (restored to 5 results)
    search_service = get_search_service()
    product_context = search_service.search(question, limit=5)

    yield f"data: {json.dumps({'event': 'status', 'status': 'generating_response', 'message': 'Generating response...'})}\n\n"

    # 3. Generate a response stream
    provider = os.environ.get("LLM_PROVIDER", "gcp")
    model_name = os.environ.get("GEMINI_MODEL_NAME", "gemini-2.5-flash")

    # Provide richer context to the more capable model
    context_str = json.dumps(product_context, indent=2)

    citations = extract_product_citations(product_context)
    handoff = detect_handoff_intent(question, chat_history)

    tracking_intent = detect_order_tracking_intent(question)
    tracking_info = None
    order_tracking_prompt = ""
    if tracking_intent.get("is_tracking_intent"):
        customer_orders = customer.get("orders") if customer else None
        tracking_info = lookup_order_tracking(
            customer_id=customer_id,
            order_id=tracking_intent.get("extracted_order_id"),
            customer_orders=customer_orders,
        )
        order_tracking_prompt = build_order_tracking_prompt(tracking_info, question)

    promo_intent = detect_promo_intent(question)
    promo_prompt = ""
    if promo_intent.get("is_promo_intent"):
        promo_prompt = build_promo_prompt(promo_intent, question)

    policy_intent = detect_policy_intent(question)
    policy_prompt = ""
    if policy_intent.get("is_policy_query") and policy_intent.get("matched_policy"):
        policy_prompt = build_policy_prompt(policy_intent["matched_policy"])

    store_intent = detect_store_intent(question)
    store_prompt = ""
    if store_intent.get("is_store_query") and store_intent.get("matched_stores"):
        store_prompt = build_store_prompt(
            store_intent["matched_stores"], store_intent.get("intent_type", "general")
        )

    # Initial SSE frames with citations, handoff, customer profile, order tracking, promotions, and policy
    yield f"data: {json.dumps({'event': 'citations', 'citations': citations})}\n\n"
    yield f"data: {json.dumps({'event': 'handoff', 'handoff': handoff})}\n\n"
    yield f"data: {json.dumps({'event': 'profile', 'profile': {'membership': profile['membership'], 'past_purchases_count': len(profile['past_purchases'])}})}\n\n"
    if tracking_intent.get("is_tracking_intent"):
        yield f"data: {json.dumps({'event': 'order_tracking', 'order_tracking': tracking_info})}\n\n"
    if promo_intent.get("is_promo_intent"):
        yield f"data: {json.dumps({'event': 'promotions', 'promotions': get_active_promotions()})}\n\n"
    if policy_intent.get("is_policy_query") and policy_intent.get("matched_policy"):
        yield f"data: {json.dumps({'event': 'policy', 'policy': policy_intent['matched_policy']})}\n\n"
    if store_intent.get("is_store_query") and store_intent.get("matched_stores"):
        yield f"data: {json.dumps({'event': 'stores', 'stores': store_intent['matched_stores']})}\n\n"

    stream_kwargs: dict[str, Any] = {
        "chat_history": chat_history,
        "customer_profile": profile,
    }
    if order_tracking_prompt:
        stream_kwargs["order_tracking_prompt"] = order_tracking_prompt
    if promo_prompt:
        stream_kwargs["promo_prompt"] = promo_prompt
    if policy_prompt:
        stream_kwargs["policy_prompt"] = policy_prompt
    if store_prompt:
        stream_kwargs["store_prompt"] = store_prompt

    for chunk in generate_llm_response_stream(
        question,
        context_str,
        user_name,
        provider,
        project_id,
        location,
        model_name,
        **stream_kwargs,
    ):
        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
