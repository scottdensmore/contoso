import json
import os
import re
from typing import Any

from .acclimatization import (
    build_acclimatization_prompt,
    detect_acclimatization_intent,
    format_acclimatization_response,
)
from .adventures import (
    build_adventure_prompt,
    detect_adventure_intent,
    format_adventure_response,
)
from .alpine_scuba import (
    build_alpine_scuba_prompt,
    detect_alpine_scuba_intent,
    format_alpine_scuba_response,
)
from .avalanche import (
    build_avalanche_prompt,
    detect_avalanche_intent,
    format_avalanche_response,
)
from .big_wall import (
    build_big_wall_prompt,
    detect_big_wall_intent,
    format_big_wall_response,
)
from .bikepacking import (
    build_bikepacking_prompt,
    detect_bikepacking_intent,
    format_bikepacking_response,
)
from .bushcraft import (
    build_bushcraft_prompt,
    detect_bushcraft_intent,
    format_bushcraft_response,
)
from .canoe_expedition import (
    build_canoe_prompt,
    extract_canoe_intent,
    format_canoe_response,
)
from .canyoneering import (
    build_canyoneering_prompt,
    detect_canyoneering_intent,
    format_canyoneering_response,
)
from .carrier_tracking import (
    build_carrier_milestone_prompt,
    detect_carrier_tracking_intent,
    lookup_carrier_tracking,
)
from .caving import (
    build_caving_prompt,
    detect_caving_intent,
    format_caving_response,
)
from .climbing import (
    build_climbing_prompt,
    detect_climbing_intent,
    format_climbing_response,
)
from .coasteering import (
    build_coasteering_prompt,
    detect_coasteering_intent,
    format_coasteering_response,
)
from .desert_trekking import (
    build_desert_trekking_prompt,
    detect_desert_trekking_intent,
    format_desert_trekking_response,
)
from .dogsledding import (
    build_dogsled_prompt,
    extract_dogsled_intent,
    format_dogsled_response,
)
from .faq import (
    build_faq_prompt,
    detect_faq_intent,
)
from .field_reports import (
    build_field_reports_prompt,
    detect_field_reports_intent,
    format_field_reports_response,
)
from .fire_safety import (
    build_fire_safety_prompt,
    detect_fire_safety_intent,
    format_fire_safety_response,
)
from .first_aid import (
    build_first_aid_prompt,
    detect_first_aid_intent,
    format_first_aid_response,
)
from .fly_fishing import (
    build_fly_fishing_prompt,
    detect_fly_fishing_intent,
    format_fly_fishing_response,
)
from .foraging import (
    build_foraging_prompt,
    detect_foraging_intent,
    format_foraging_response,
)
from .glacier_navigation import (
    build_glacier_prompt,
    detect_glacier_intent,
    format_glacier_response,
)
from .highline import (
    build_highline_prompt,
    extract_highline_intent,
    format_highline_response,
)
from .hot_springs import (
    build_hot_spring_prompt,
    detect_hot_spring_intent,
    format_hot_spring_response,
)
from .huts import (
    build_hut_prompt,
    detect_hut_intent,
    format_hut_response,
)
from .ice_climbing import (
    build_ice_climbing_prompt,
    detect_ice_climbing_intent,
    format_ice_climbing_response,
)
from .leave_no_trace import (
    build_lnt_prompt,
    detect_lnt_intent,
    format_lnt_response,
)
from .mountaineering import (
    build_mountaineering_prompt,
    detect_mountaineering_intent,
    format_mountaineering_response,
)
from .nordic_skiing import (
    build_nordic_skiing_prompt,
    detect_nordic_skiing_intent,
    format_nordic_skiing_response,
)
from .order_tracking import (
    build_order_tracking_prompt,
    detect_order_tracking_intent,
    lookup_order_tracking,
)
from .orienteering import (
    build_orienteering_prompt,
    extract_orienteering_intent,
    format_orienteering_response,
)
from .packrafting import (
    build_packrafting_prompt,
    detect_packrafting_intent,
    format_packrafting_response,
)
from .permits import (
    build_permits_prompt,
    detect_permits_intent,
    format_permits_response,
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
from .psicobloc import (
    build_psicobloc_prompt,
    detect_psicobloc_intent,
    format_psicobloc_response,
)
from .rentals import (
    build_rental_prompt,
    detect_rental_intent,
    format_rental_response,
)
from .repair import (
    build_repair_prompt,
    detect_repair_intent,
    format_repair_response,
)
from .return_label import (
    build_return_label_prompt,
    detect_return_label_intent,
    format_return_label_response,
    generate_return_label,
)
from .review_summary import (
    build_review_summary_prompt,
    detect_review_sentiment_intent,
)
from .rewards import (
    build_rewards_prompt,
    detect_rewards_intent,
    format_rewards_response,
    get_customer_loyalty,
)
from .river_sup import (
    build_river_sup_prompt,
    detect_river_sup_intent,
    format_river_sup_response,
)
from .routes import (
    build_route_prompt,
    detect_route_intent,
    format_route_response,
)
from .safety import (
    build_safety_prompt,
    detect_safety_intent,
    format_safety_response,
)
from .sea_kayaking import (
    build_sea_kayaking_prompt,
    detect_sea_kayaking_intent,
    format_sea_kayaking_response,
)
from .search_service import get_search_service
from .shuttles import (
    build_shuttle_prompt,
    detect_shuttle_intent,
    format_shuttle_response,
)
from .sizing import (
    build_sizing_prompt,
    detect_sizing_intent,
)
from .ski_touring import (
    build_ski_tour_prompt,
    detect_ski_tour_intent,
    format_ski_tour_response,
)
from .snowkiting import (
    build_snowkiting_prompt,
    detect_snowkiting_intent,
    format_snowkiting_response,
)
from .snowmobiling import (
    build_snowmobiling_prompt,
    detect_snowmobiling_intent,
    format_snowmobiling_response,
)
from .stargazing import (
    build_stargazing_prompt,
    detect_stargazing_intent,
    format_stargazing_response,
)
from .stores import (
    build_store_prompt,
    detect_store_intent,
)
from .trade_in import (
    build_trade_in_prompt,
    detect_trade_in_intent,
    format_trade_in_response,
)
from .trail_running import (
    build_trail_running_prompt,
    detect_trail_running_intent,
    format_trail_running_response,
)
from .trails import (
    build_trail_prompt,
    detect_trail_intent,
    format_trail_response,
    generate_outfitting_plan,
)
from .trip_planner import (
    build_trip_planner_prompt,
    detect_trip_planner_intent,
    format_trip_planner_response,
)
from .via_ferrata import (
    build_via_ferrata_prompt,
    detect_via_ferrata_intent,
    format_via_ferrata_response,
)
from .volunteer import (
    build_volunteer_prompt,
    detect_volunteer_intent,
    format_volunteer_response,
)
from .water import (
    build_water_prompt,
    detect_water_intent,
    format_water_response,
)
from .weather import (
    build_weather_prompt,
    detect_weather_intent,
    format_weather_response,
)
from .whitewater import (
    build_whitewater_prompt,
    detect_whitewater_intent,
    format_whitewater_response,
)
from .wilderness_shelters import (
    build_shelter_prompt,
    extract_shelter_intent,
    format_shelter_response,
)
from .wilderness_tracking import (
    build_wilderness_tracking_prompt,
    detect_wilderness_tracking_intent,
    format_wilderness_tracking_response,
)
from .wildlife import (
    build_wildlife_prompt,
    detect_wildlife_intent,
    format_wildlife_response,
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

        citations.append(
            {
                "name": name,
                "slug": slug,
                "price": price,
                "image": image,
                "category": category,
            }
        )

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
    carrier_tracking_prompt: str = "",
    faq_prompt: str = "",
    sizing_prompt: str = "",
    review_prompt: str = "",
    rental_prompt: str = "",
    return_label_prompt: str = "",
    trail_prompt: str = "",
    rewards_prompt: str = "",
    permits_prompt: str = "",
    repair_prompt: str = "",
    adventures_prompt: str = "",
    field_reports_prompt: str = "",
    trade_in_prompt: str = "",
    trip_planner_prompt: str = "",
    safety_prompt: str = "",
    shuttle_prompt: str = "",
    hut_prompt: str = "",
    volunteer_prompt: str = "",
    water_prompt: str = "",
    route_prompt: str = "",
    fire_safety_prompt: str = "",
    first_aid_prompt: str = "",
    lnt_prompt: str = "",
    avalanche_prompt: str = "",
    weather_prompt: str = "",
    ski_tour_prompt: str = "",
    whitewater_prompt: str = "",
    climbing_prompt: str = "",
    foraging_prompt: str = "",
    stargazing_prompt: str = "",
    wildlife_prompt: str = "",
    trail_running_prompt: str = "",
    hot_springs_prompt: str = "",
    fly_fishing_prompt: str = "",
    bikepacking_prompt: str = "",
    mountaineering_prompt: str = "",
    sea_kayaking_prompt: str = "",
    packrafting_prompt: str = "",
    canyoneering_prompt: str = "",
    acclimatization_prompt: str = "",
    nordic_skiing_prompt: str = "",
    via_ferrata_prompt: str = "",
    ice_climbing_prompt: str = "",
    bushcraft_prompt: str = "",
    caving_prompt: str = "",
    desert_trekking_prompt: str = "",
    coasteering_prompt: str = "",
    orienteering_prompt: str = "",
    highline_prompt: str = "",
    dogsled_prompt: str = "",
    canoe_prompt: str = "",
    shelter_prompt: str = "",
    glacier_prompt: str = "",
    river_sup_prompt: str = "",
    wilderness_tracking_prompt: str = "",
    snowkiting_prompt: str = "",
    psicobloc_prompt: str = "",
    big_wall_prompt: str = "",
    snowmobiling_prompt: str = "",
    alpine_scuba_prompt: str = "",
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
        if carrier_tracking_prompt:
            local_system = f"{local_system}\n\n{carrier_tracking_prompt}"
        if faq_prompt:
            local_system = f"{local_system}\n\n{faq_prompt}"
        if sizing_prompt:
            local_system = f"{local_system}\n\n{sizing_prompt}"
        if review_prompt:
            local_system = f"{local_system}\n\n{review_prompt}"
        if rental_prompt:
            local_system = f"{local_system}\n\n{rental_prompt}"
        if return_label_prompt:
            local_system = f"{local_system}\n\n{return_label_prompt}"
        if trail_prompt:
            local_system = f"{local_system}\n\n{trail_prompt}"
        if return_label_prompt:
            local_system = f"{local_system}\n\n{return_label_prompt}"
        if trail_prompt:
            local_system = f"{local_system}\n\n{trail_prompt}"
        if rewards_prompt:
            local_system = f"{local_system}\n\n{rewards_prompt}"
        if permits_prompt:
            local_system = f"{local_system}\n\n{permits_prompt}"
        if repair_prompt:
            local_system = f"{local_system}\n\n{repair_prompt}"
        if adventures_prompt:
            local_system = f"{local_system}\n\n{adventures_prompt}"
        if field_reports_prompt:
            local_system = f"{local_system}\n\n{field_reports_prompt}"
        if trade_in_prompt:
            local_system = f"{local_system}\n\n{trade_in_prompt}"
        if trip_planner_prompt:
            local_system = f"{local_system}\n\n{trip_planner_prompt}"
        if safety_prompt:
            local_system = f"{local_system}\n\n{safety_prompt}"
        if shuttle_prompt:
            local_system = f"{local_system}\n\n{shuttle_prompt}"
        if hut_prompt:
            local_system = f"{local_system}\n\n{hut_prompt}"
        if volunteer_prompt:
            local_system = f"{local_system}\n\n{volunteer_prompt}"
        if water_prompt:
            local_system = f"{local_system}\n\n{water_prompt}"
        if route_prompt:
            local_system = f"{local_system}\n\n{route_prompt}"
        if fire_safety_prompt:
            local_system = f"{local_system}\n\n{fire_safety_prompt}"
        if first_aid_prompt:
            local_system = f"{local_system}\n\n{first_aid_prompt}"
        if lnt_prompt:
            local_system = f"{local_system}\n\n{lnt_prompt}"
        if avalanche_prompt:
            local_system = f"{local_system}\n\n{avalanche_prompt}"
        if weather_prompt:
            local_system = f"{local_system}\n\n{weather_prompt}"
        if ski_tour_prompt:
            local_system = f"{local_system}\n\n{ski_tour_prompt}"
        if whitewater_prompt:
            local_system = f"{local_system}\n\n{whitewater_prompt}"
        if climbing_prompt:
            local_system = f"{local_system}\n\n{climbing_prompt}"
        if foraging_prompt:
            local_system = f"{local_system}\n\n{foraging_prompt}"
        if stargazing_prompt:
            local_system = f"{local_system}\n\n{stargazing_prompt}"
        if wildlife_prompt:
            local_system = f"{local_system}\n\n{wildlife_prompt}"
        if trail_running_prompt:
            local_system = f"{local_system}\n\n{trail_running_prompt}"
        if hot_springs_prompt:
            local_system = f"{local_system}\n\n{hot_springs_prompt}"
        if fly_fishing_prompt:
            local_system = f"{local_system}\n\n{fly_fishing_prompt}"
        if bikepacking_prompt:
            local_system = f"{local_system}\n\n{bikepacking_prompt}"
        if mountaineering_prompt:
            local_system = f"{local_system}\n\n{mountaineering_prompt}"
        if sea_kayaking_prompt:
            local_system = f"{local_system}\n\n{sea_kayaking_prompt}"
        if bikepacking_prompt:
            local_system = f"{local_system}\n\n{bikepacking_prompt}"
        if mountaineering_prompt:
            local_system = f"{local_system}\n\n{mountaineering_prompt}"
        if sea_kayaking_prompt:
            local_system = f"{local_system}\n\n{sea_kayaking_prompt}"
        if packrafting_prompt:
            local_system = f"{local_system}\n\n{packrafting_prompt}"
        if canyoneering_prompt:
            local_system = f"{local_system}\n\n{canyoneering_prompt}"
        if acclimatization_prompt:
            local_system = f"{local_system}\n\n{acclimatization_prompt}"
        if nordic_skiing_prompt:
            local_system = f"{local_system}\n\n{nordic_skiing_prompt}"
        if via_ferrata_prompt:
            local_system = f"{local_system}\n\n{via_ferrata_prompt}"
        if ice_climbing_prompt:
            local_system = f"{local_system}\n\n{ice_climbing_prompt}"
        if bushcraft_prompt:
            local_system = f"{local_system}\n\n{bushcraft_prompt}"
        if caving_prompt:
            local_system = f"{local_system}\n\n{caving_prompt}"
        if desert_trekking_prompt:
            local_system = f"{local_system}\n\n{desert_trekking_prompt}"
        if desert_trekking_prompt:
            local_system = f"{local_system}\n\n{desert_trekking_prompt}"
        if coasteering_prompt:
            local_system = f"{local_system}\n\n{coasteering_prompt}"
        if orienteering_prompt:
            local_system = f"{local_system}\n\n{orienteering_prompt}"
        if highline_prompt:
            local_system = f"{local_system}\n\n{highline_prompt}"
        if dogsled_prompt:
            local_system = f"{local_system}\n\n{dogsled_prompt}"
        if canoe_prompt:
            local_system = f"{local_system}\n\n{canoe_prompt}"
        if shelter_prompt:
            local_system = f"{local_system}\n\n{shelter_prompt}"
        if glacier_prompt:
            local_system = f"{local_system}\n\n{glacier_prompt}"
        if river_sup_prompt:
            local_system = f"{local_system}\n\n{river_sup_prompt}"
        if wilderness_tracking_prompt:
            local_system = f"{local_system}\n\n{wilderness_tracking_prompt}"
        if snowkiting_prompt:
            local_system = f"{local_system}\n\n{snowkiting_prompt}"
        if psicobloc_prompt:
            local_system = f"{local_system}\n\n{psicobloc_prompt}"
        if big_wall_prompt:
            local_system = f"{local_system}\n\n{big_wall_prompt}"
        if snowmobiling_prompt:
            local_system = f"{local_system}\n\n{snowmobiling_prompt}"
        if alpine_scuba_prompt:
            local_system = f"{local_system}\n\n{alpine_scuba_prompt}"

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
        if carrier_tracking_prompt:
            prompt_parts.append(carrier_tracking_prompt)
        if faq_prompt:
            prompt_parts.append(faq_prompt)
        if sizing_prompt:
            prompt_parts.append(sizing_prompt)
        if review_prompt:
            prompt_parts.append(review_prompt)
        if rental_prompt:
            prompt_parts.append(rental_prompt)
        if return_label_prompt:
            prompt_parts.append(return_label_prompt)
        if trail_prompt:
            prompt_parts.append(trail_prompt)
        if return_label_prompt:
            prompt_parts.append(return_label_prompt)
        if trail_prompt:
            prompt_parts.append(trail_prompt)
        if rewards_prompt:
            prompt_parts.append(rewards_prompt)
        if permits_prompt:
            prompt_parts.append(permits_prompt)
        if repair_prompt:
            prompt_parts.append(repair_prompt)
        if adventures_prompt:
            prompt_parts.append(adventures_prompt)
        if field_reports_prompt:
            prompt_parts.append(field_reports_prompt)
        if trade_in_prompt:
            prompt_parts.append(trade_in_prompt)
        if trip_planner_prompt:
            prompt_parts.append(trip_planner_prompt)
        if safety_prompt:
            prompt_parts.append(safety_prompt)
        if shuttle_prompt:
            prompt_parts.append(shuttle_prompt)
        if hut_prompt:
            prompt_parts.append(hut_prompt)
        if volunteer_prompt:
            prompt_parts.append(volunteer_prompt)
        if water_prompt:
            prompt_parts.append(water_prompt)
        if route_prompt:
            prompt_parts.append(route_prompt)
        if fire_safety_prompt:
            prompt_parts.append(fire_safety_prompt)
        if first_aid_prompt:
            prompt_parts.append(first_aid_prompt)
        if lnt_prompt:
            prompt_parts.append(lnt_prompt)
        if avalanche_prompt:
            prompt_parts.append(avalanche_prompt)
        if weather_prompt:
            prompt_parts.append(weather_prompt)
        if ski_tour_prompt:
            prompt_parts.append(ski_tour_prompt)
        if whitewater_prompt:
            prompt_parts.append(whitewater_prompt)
        if climbing_prompt:
            prompt_parts.append(climbing_prompt)
        if foraging_prompt:
            prompt_parts.append(foraging_prompt)
        if stargazing_prompt:
            prompt_parts.append(stargazing_prompt)
        if wildlife_prompt:
            prompt_parts.append(wildlife_prompt)
        if trail_running_prompt:
            prompt_parts.append(trail_running_prompt)
        if hot_springs_prompt:
            prompt_parts.append(hot_springs_prompt)
        if fly_fishing_prompt:
            prompt_parts.append(fly_fishing_prompt)
        if bikepacking_prompt:
            prompt_parts.append(bikepacking_prompt)
        if mountaineering_prompt:
            prompt_parts.append(mountaineering_prompt)
        if sea_kayaking_prompt:
            prompt_parts.append(sea_kayaking_prompt)
        if mountaineering_prompt:
            prompt_parts.append(mountaineering_prompt)
        if sea_kayaking_prompt:
            prompt_parts.append(sea_kayaking_prompt)
        if packrafting_prompt:
            prompt_parts.append(packrafting_prompt)
        if canyoneering_prompt:
            prompt_parts.append(canyoneering_prompt)
        if acclimatization_prompt:
            prompt_parts.append(acclimatization_prompt)
        if nordic_skiing_prompt:
            prompt_parts.append(nordic_skiing_prompt)
        if via_ferrata_prompt:
            prompt_parts.append(via_ferrata_prompt)
        if ice_climbing_prompt:
            prompt_parts.append(ice_climbing_prompt)
        if bushcraft_prompt:
            prompt_parts.append(bushcraft_prompt)
        if caving_prompt:
            prompt_parts.append(caving_prompt)
        if desert_trekking_prompt:
            prompt_parts.append(desert_trekking_prompt)
        if desert_trekking_prompt:
            prompt_parts.append(desert_trekking_prompt)
        if coasteering_prompt:
            prompt_parts.append(coasteering_prompt)
        if orienteering_prompt:
            prompt_parts.append(orienteering_prompt)
        if highline_prompt:
            prompt_parts.append(highline_prompt)
        if dogsled_prompt:
            prompt_parts.append(dogsled_prompt)
        if canoe_prompt:
            prompt_parts.append(canoe_prompt)
        if shelter_prompt:
            prompt_parts.append(shelter_prompt)
        if glacier_prompt:
            prompt_parts.append(glacier_prompt)
        if river_sup_prompt:
            prompt_parts.append(river_sup_prompt)
        if wilderness_tracking_prompt:
            prompt_parts.append(wilderness_tracking_prompt)
        if snowkiting_prompt:
            prompt_parts.append(snowkiting_prompt)
        if psicobloc_prompt:
            prompt_parts.append(psicobloc_prompt)
        if big_wall_prompt:
            prompt_parts.append(big_wall_prompt)
        if snowmobiling_prompt:
            prompt_parts.append(snowmobiling_prompt)
        if alpine_scuba_prompt:
            prompt_parts.append(alpine_scuba_prompt)
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

    carrier_intent = detect_carrier_tracking_intent(question)
    carrier_tracking_info = None
    carrier_tracking_prompt = ""
    if carrier_intent.get("is_carrier_intent") and carrier_intent.get("extracted_identifier"):
        carrier_tracking_info = lookup_carrier_tracking(carrier_intent["extracted_identifier"])
        if carrier_tracking_info:
            carrier_tracking_prompt = build_carrier_milestone_prompt(
                carrier_tracking_info, question
            )

    faq_result = detect_faq_intent(question)
    faq_prompt = ""
    if faq_result and faq_result.matches:
        faq_prompt = build_faq_prompt(faq_result.matches, question)

    sizing_info = detect_sizing_intent(question)
    sizing_prompt = ""
    if sizing_info.get("is_sizing_intent"):
        sizing_prompt = build_sizing_prompt(
            sizing_info.get("size_guide"),
            sizing_info.get("recommendation"),
            question,
        )

    review_info = detect_review_sentiment_intent(question)
    review_prompt = ""
    if review_info.get("is_review_intent") and review_info.get("summary"):
        review_prompt = build_review_summary_prompt(
            review_info.get("summary"),
            question,
        )

    rental_intent = detect_rental_intent(question)
    rental_prompt = ""
    rental_info = None
    if rental_intent:
        rental_prompt = build_rental_prompt(rental_intent)
        formatted_rental = format_rental_response(rental_intent)
        rental_info = formatted_rental.get("rental_info")

    return_label_intent = detect_return_label_intent(question)
    return_label_prompt = ""
    return_label_payload = None
    if return_label_intent:
        rl_info = (
            generate_return_label(return_label_intent.order_id)
            if return_label_intent.order_id
            else None
        )
        return_label_prompt = build_return_label_prompt(return_label_intent, rl_info)
        formatted_return = format_return_label_response(return_label_intent, rl_info)
        return_label_payload = formatted_return.get("return_label")

    trail_intent = detect_trail_intent(question)
    trail_prompt = ""
    trail_outfitting_payload = None
    if trail_intent:
        trail_outfitting_resp = generate_outfitting_plan(
            trail_name=trail_intent.trail_name,
            activity=trail_intent.activity or "day-hiking",
            season=trail_intent.season or "spring",
        )
        trail_prompt = build_trail_prompt(trail_intent, trail_outfitting_resp)
        formatted_trail = format_trail_response(trail_intent, trail_outfitting_resp)
        trail_outfitting_payload = formatted_trail.get("trail_outfitting")

    trail_intent = detect_trail_intent(question)
    trail_prompt = ""
    trail_outfitting_payload = None
    if trail_intent:
        trail_outfitting_resp = generate_outfitting_plan(
            trail_name=trail_intent.trail_name,
            activity=trail_intent.activity or "day-hiking",
            season=trail_intent.season or "spring",
        )
        trail_prompt = build_trail_prompt(trail_intent, trail_outfitting_resp)
        formatted_trail = format_trail_response(trail_intent, trail_outfitting_resp)
        trail_outfitting_payload = formatted_trail.get("trail_outfitting")

    rewards_intent = detect_rewards_intent(question)
    rewards_prompt = ""
    rewards_info_payload = None
    if rewards_intent:
        rewards_loyalty = get_customer_loyalty(rewards_intent.customer_id or customer_id)
        rewards_prompt = build_rewards_prompt(rewards_intent, rewards_loyalty)
        formatted_rewards = format_rewards_response(rewards_intent, rewards_loyalty)
        rewards_info_payload = formatted_rewards.get("rewards_info")

    permits_intent = detect_permits_intent(question)
    permits_prompt = ""
    permits_info_payload = None
    if permits_intent:
        permits_prompt = build_permits_prompt(permits_intent)
        formatted_permits = format_permits_response(permits_intent)
        permits_info_payload = formatted_permits.get("permits_info")

    repair_intent = detect_repair_intent(question)
    repair_prompt = ""
    repair_info_payload = None
    if repair_intent:
        repair_prompt = build_repair_prompt(repair_intent)
        formatted_repair = format_repair_response(repair_intent)
        repair_info_payload = formatted_repair.get("repair_info")

    adventure_intent = detect_adventure_intent(question)
    adventures_prompt = ""
    adventures_info_payload = None
    if adventure_intent:
        adventures_prompt = build_adventure_prompt(adventure_intent)
        formatted_adventures = format_adventure_response(adventure_intent)
        adventures_info_payload = formatted_adventures.get("adventures_info")

    field_reports_intent = detect_field_reports_intent(question)
    field_reports_prompt = ""
    field_reports_info_payload = None
    if field_reports_intent:
        field_reports_prompt = build_field_reports_prompt(field_reports_intent)
        formatted_field_reports = format_field_reports_response(field_reports_intent)
        field_reports_info_payload = formatted_field_reports.get("field_reports_info")

    trade_in_intent = detect_trade_in_intent(question)
    trade_in_prompt = ""
    trade_in_info_payload = None
    if trade_in_intent:
        trade_in_prompt = build_trade_in_prompt(trade_in_intent)
        formatted_trade_in = format_trade_in_response(trade_in_intent)
        trade_in_info_payload = formatted_trade_in.get("trade_in_info")

    trip_planner_intent = detect_trip_planner_intent(question)
    trip_planner_prompt = ""
    trip_planner_payload = None
    if trip_planner_intent:
        trip_planner_prompt = build_trip_planner_prompt(trip_planner_intent)
        formatted_trip = format_trip_planner_response(trip_planner_intent)
        trip_planner_payload = formatted_trip.get("trip_planner_info")

    safety_intent = detect_safety_intent(question)
    safety_prompt = ""
    safety_info_payload = None
    if safety_intent:
        safety_prompt = build_safety_prompt(safety_intent)
        formatted_safety = format_safety_response(safety_intent)
        safety_info_payload = formatted_safety.get("safety_info")

    shuttle_intent = detect_shuttle_intent(question)
    shuttle_prompt = ""
    shuttle_info_payload = None
    if shuttle_intent:
        shuttle_prompt = build_shuttle_prompt(shuttle_intent)
        formatted_shuttle = format_shuttle_response(shuttle_intent)
        shuttle_info_payload = formatted_shuttle.get("shuttle_info")

    hut_intent = detect_hut_intent(question)
    hut_prompt = ""
    hut_info_payload = None
    if hut_intent:
        hut_prompt = build_hut_prompt(hut_intent)
        formatted_hut = format_hut_response(hut_intent)
        hut_info_payload = formatted_hut.get("hut_info")

    volunteer_intent = detect_volunteer_intent(question)
    volunteer_prompt = ""
    volunteer_info_payload = None
    if volunteer_intent:
        volunteer_prompt = build_volunteer_prompt(volunteer_intent)
        formatted_volunteer = format_volunteer_response(volunteer_intent)
        volunteer_info_payload = formatted_volunteer.get("volunteer_info")

    water_intent = detect_water_intent(question)
    water_prompt = ""
    water_info_payload = None
    if water_intent:
        water_prompt = build_water_prompt(water_intent)
        formatted_water = format_water_response(water_intent)
        water_info_payload = formatted_water.get("water_info")

    route_intent = detect_route_intent(question)
    route_prompt = ""
    route_info_payload = None
    if route_intent and not shuttle_intent:
        route_prompt = build_route_prompt(route_intent)
        formatted_route = format_route_response(route_intent)
        route_info_payload = formatted_route.get("route_info")

    fire_safety_intent = detect_fire_safety_intent(question)
    fire_safety_prompt = ""
    fire_safety_info_payload = None
    if fire_safety_intent:
        fire_safety_prompt = build_fire_safety_prompt(fire_safety_intent)
        formatted_fire = format_fire_safety_response(fire_safety_intent)
        fire_safety_info_payload = formatted_fire.get("fire_safety_info")

    first_aid_intent = detect_first_aid_intent(question)
    first_aid_prompt = ""
    first_aid_info_payload = None
    if first_aid_intent:
        first_aid_prompt = build_first_aid_prompt(first_aid_intent)
        formatted_first_aid = format_first_aid_response(first_aid_intent)
        first_aid_info_payload = formatted_first_aid.get("first_aid_info")

    lnt_intent = detect_lnt_intent(question)
    lnt_prompt = ""
    lnt_info_payload = None
    if lnt_intent:
        lnt_prompt = build_lnt_prompt(lnt_intent)
        formatted_lnt = format_lnt_response(lnt_intent)
        lnt_info_payload = formatted_lnt.get("lnt_info")

    avalanche_intent = detect_avalanche_intent(question)
    avalanche_prompt = ""
    avalanche_info_payload = None
    if avalanche_intent:
        avalanche_prompt = build_avalanche_prompt(avalanche_intent)
        formatted_avy = format_avalanche_response(avalanche_intent)
        avalanche_info_payload = formatted_avy.get("avalanche_info")

    weather_intent = detect_weather_intent(question)
    weather_prompt = ""
    weather_info_payload = None
    if weather_intent:
        weather_prompt = build_weather_prompt(weather_intent)
        formatted_weather = format_weather_response(weather_intent)
        weather_info_payload = formatted_weather.get("weather_info")

    ski_tour_intent = detect_ski_tour_intent(question)
    ski_tour_prompt = ""
    ski_tour_info_payload = None
    if ski_tour_intent:
        ski_tour_prompt = build_ski_tour_prompt(ski_tour_intent)
        formatted_ski_tour = format_ski_tour_response(ski_tour_intent)
        ski_tour_info_payload = formatted_ski_tour.get("ski_tour_info")

    whitewater_intent = detect_whitewater_intent(question)
    whitewater_prompt = ""
    whitewater_info_payload = None
    if whitewater_intent:
        whitewater_prompt = build_whitewater_prompt(whitewater_intent)
        formatted_whitewater = format_whitewater_response(whitewater_intent)
        whitewater_info_payload = formatted_whitewater.get("whitewater_info")

    climbing_intent = detect_climbing_intent(question)
    climbing_prompt = ""
    climbing_info_payload = None
    if climbing_intent:
        climbing_prompt = build_climbing_prompt(climbing_intent)
        formatted_climbing = format_climbing_response(climbing_intent)
        climbing_info_payload = formatted_climbing.get("climbing_info")

    foraging_intent = detect_foraging_intent(question)
    foraging_prompt = ""
    foraging_info_payload = None
    if foraging_intent:
        foraging_prompt = build_foraging_prompt(foraging_intent)
        formatted_foraging = format_foraging_response(foraging_intent)
        foraging_info_payload = formatted_foraging.get("foraging_info")

    stargazing_intent = detect_stargazing_intent(question)
    stargazing_prompt = ""
    stargazing_info_payload = None
    if stargazing_intent:
        stargazing_prompt = build_stargazing_prompt(stargazing_intent)
        formatted_stargazing = format_stargazing_response(stargazing_intent)
        stargazing_info_payload = formatted_stargazing.get("stargazing_info")

    wildlife_intent = detect_wildlife_intent(question)
    wildlife_prompt = ""
    wildlife_info_payload = None
    if wildlife_intent:
        wildlife_prompt = build_wildlife_prompt(wildlife_intent)
        formatted_wildlife = format_wildlife_response(wildlife_intent)
        wildlife_info_payload = formatted_wildlife.get("wildlife_info")

    trail_running_intent = detect_trail_running_intent(question)
    trail_running_prompt = ""
    trail_running_info_payload = None
    if trail_running_intent:
        trail_running_prompt = build_trail_running_prompt(trail_running_intent)
        formatted_trail_running = format_trail_running_response(trail_running_intent)
        trail_running_info_payload = formatted_trail_running.get("trail_running_info")

    hot_springs_intent = detect_hot_spring_intent(question)
    hot_springs_prompt = ""
    hot_springs_info_payload = None
    if hot_springs_intent:
        hot_springs_prompt = build_hot_spring_prompt(hot_springs_intent)
        formatted_hot_springs = format_hot_spring_response(hot_springs_intent)
        hot_springs_info_payload = formatted_hot_springs.get("hot_springs_info")

    fly_fishing_intent = detect_fly_fishing_intent(question)
    fly_fishing_prompt = ""
    fly_fishing_info_payload = None
    if fly_fishing_intent:
        fly_fishing_prompt = build_fly_fishing_prompt(fly_fishing_intent)
        formatted_fly_fishing = format_fly_fishing_response(fly_fishing_intent)
        fly_fishing_info_payload = formatted_fly_fishing.get("fly_fishing_info")

    bikepacking_intent = detect_bikepacking_intent(question)
    bikepacking_prompt = ""
    bikepacking_info_payload = None
    if bikepacking_intent:
        bikepacking_prompt = build_bikepacking_prompt(bikepacking_intent)
        formatted_bikepacking = format_bikepacking_response(bikepacking_intent)
        bikepacking_info_payload = formatted_bikepacking.get("bikepacking_info")

    glacier_intent = detect_glacier_intent(question)
    glacier_prompt = ""
    glacier_info_payload = None
    if glacier_intent:
        glacier_prompt = build_glacier_prompt(glacier_intent)
        formatted_glacier = format_glacier_response(glacier_intent, question)
        glacier_info_payload = formatted_glacier.get("glacier_info")

    river_sup_intent = detect_river_sup_intent(question)
    river_sup_prompt = ""
    river_sup_info_payload = None
    if river_sup_intent:
        river_sup_prompt = build_river_sup_prompt(river_sup_intent)
        formatted_river_sup = format_river_sup_response(river_sup_intent, question)
        river_sup_info_payload = formatted_river_sup.get("river_sup_info")

    wilderness_tracking_intent = detect_wilderness_tracking_intent(question)
    wilderness_tracking_prompt = ""
    wilderness_tracking_info_payload = None
    if wilderness_tracking_intent:
        wilderness_tracking_prompt = build_wilderness_tracking_prompt(wilderness_tracking_intent)
        formatted_tracking = format_wilderness_tracking_response(
            wilderness_tracking_intent, question
        )
        wilderness_tracking_info_payload = formatted_tracking.get("tracking_info")
    snowkiting_intent = detect_snowkiting_intent(question)
    snowkiting_prompt = ""
    snowkiting_info_payload = None
    if snowkiting_intent:
        snowkiting_prompt = build_snowkiting_prompt(snowkiting_intent)
        formatted_snowkiting = format_snowkiting_response(snowkiting_intent, question)
        snowkiting_info_payload = formatted_snowkiting.get("snowkiting_info")
    psicobloc_intent = detect_psicobloc_intent(question)
    psicobloc_prompt = ""
    psicobloc_info_payload = None
    if psicobloc_intent:
        psicobloc_prompt = build_psicobloc_prompt(psicobloc_intent)
        formatted_psicobloc = format_psicobloc_response(psicobloc_intent, question)
        psicobloc_info_payload = formatted_psicobloc.get("psicobloc_info")
    big_wall_intent = detect_big_wall_intent(question)
    big_wall_prompt = ""
    big_wall_info_payload = None
    if big_wall_intent:
        big_wall_prompt = build_big_wall_prompt(big_wall_intent)
        formatted_big_wall = format_big_wall_response(big_wall_intent, question)
        big_wall_info_payload = formatted_big_wall.get("big_wall_info")
    snowmobiling_intent = detect_snowmobiling_intent(question)
    snowmobiling_prompt = ""
    snowmobiling_info_payload = None
    if snowmobiling_intent:
        snowmobiling_prompt = build_snowmobiling_prompt(snowmobiling_intent)
        formatted_snowmobiling = format_snowmobiling_response(snowmobiling_intent, question)
        snowmobiling_info_payload = formatted_snowmobiling.get("snowmobiling_info")
    alpine_scuba_intent = detect_alpine_scuba_intent(question)
    alpine_scuba_prompt = ""
    alpine_scuba_info_payload = None
    if alpine_scuba_intent:
        alpine_scuba_prompt = build_alpine_scuba_prompt(alpine_scuba_intent)
        formatted_alpine_scuba = format_alpine_scuba_response(alpine_scuba_intent, question)
        alpine_scuba_info_payload = formatted_alpine_scuba.get("alpine_scuba_info")
    mountaineering_intent = detect_mountaineering_intent(question)
    mountaineering_prompt = ""
    mountaineering_info_payload = None
    if mountaineering_intent:
        mountaineering_prompt = build_mountaineering_prompt(mountaineering_intent)
        formatted_mountaineering = format_mountaineering_response(mountaineering_intent)
        mountaineering_info_payload = formatted_mountaineering.get("mountaineering_info")

    sea_kayaking_intent = detect_sea_kayaking_intent(question)
    sea_kayaking_prompt = ""
    sea_kayaking_info_payload = None
    if sea_kayaking_intent:
        sea_kayaking_prompt = build_sea_kayaking_prompt(sea_kayaking_intent)
        formatted_sea_kayaking = format_sea_kayaking_response(sea_kayaking_intent)
        sea_kayaking_info_payload = formatted_sea_kayaking.get("sea_kayaking_info")

    canyoneering_intent = detect_canyoneering_intent(question)
    canyoneering_prompt = ""
    canyoneering_info_payload = None
    if canyoneering_intent:
        canyoneering_prompt = build_canyoneering_prompt(canyoneering_intent)
        formatted_canyoneering = format_canyoneering_response(canyoneering_intent)
        canyoneering_info_payload = formatted_canyoneering.get("canyoneering_info")

    acclimatization_intent = detect_acclimatization_intent(question)
    acclimatization_prompt = ""
    acclimatization_info_payload = None
    if acclimatization_intent:
        acclimatization_prompt = build_acclimatization_prompt(acclimatization_intent)
        formatted_acclimatization = format_acclimatization_response(acclimatization_intent)
        acclimatization_info_payload = formatted_acclimatization.get("acclimatization_info")

    nordic_skiing_intent = detect_nordic_skiing_intent(question)
    nordic_skiing_prompt = ""
    nordic_skiing_info_payload = None
    if nordic_skiing_intent:
        nordic_skiing_prompt = build_nordic_skiing_prompt(nordic_skiing_intent)
        formatted_nordic = format_nordic_skiing_response(nordic_skiing_intent)
        nordic_skiing_info_payload = formatted_nordic.get("nordic_skiing_info")

    via_ferrata_intent = detect_via_ferrata_intent(question)
    via_ferrata_prompt = ""
    via_ferrata_info_payload = None
    if via_ferrata_intent:
        via_ferrata_prompt = build_via_ferrata_prompt(via_ferrata_intent)
        formatted_via_ferrata = format_via_ferrata_response(via_ferrata_intent)
        via_ferrata_info_payload = formatted_via_ferrata.get("via_ferrata_info")

    ice_climbing_intent = detect_ice_climbing_intent(question)
    ice_climbing_prompt = ""
    ice_climbing_info_payload = None
    if ice_climbing_intent:
        ice_climbing_prompt = build_ice_climbing_prompt(ice_climbing_intent)
        formatted_ice_climbing = format_ice_climbing_response(ice_climbing_intent)
        ice_climbing_info_payload = formatted_ice_climbing.get("ice_climbing_info")

    bushcraft_intent = detect_bushcraft_intent(question)
    bushcraft_prompt = ""
    bushcraft_info_payload = None
    if bushcraft_intent:
        bushcraft_prompt = build_bushcraft_prompt(bushcraft_intent)
        formatted_bushcraft = format_bushcraft_response(bushcraft_intent)
        bushcraft_info_payload = formatted_bushcraft.get("bushcraft_info")

    caving_intent = detect_caving_intent(question)
    caving_prompt = ""
    caving_info_payload = None
    if caving_intent:
        caving_prompt = build_caving_prompt(caving_intent)
        formatted_caving = format_caving_response(caving_intent)
        caving_info_payload = formatted_caving.get("caving_info")

    desert_trekking_intent = detect_desert_trekking_intent(question)
    desert_trekking_prompt = ""
    desert_trekking_info_payload = None
    if desert_trekking_intent:
        desert_trekking_prompt = build_desert_trekking_prompt(desert_trekking_intent)
        formatted_desert = format_desert_trekking_response(desert_trekking_intent)
        desert_trekking_info_payload = formatted_desert.get("desert_trekking_info")

    desert_trekking_intent = detect_desert_trekking_intent(question)
    desert_trekking_prompt = ""
    desert_trekking_info_payload = None
    if desert_trekking_intent:
        desert_trekking_prompt = build_desert_trekking_prompt(desert_trekking_intent)
        formatted_desert = format_desert_trekking_response(desert_trekking_intent)
        desert_trekking_info_payload = formatted_desert.get("desert_trekking_info")

    packrafting_intent = detect_packrafting_intent(question)
    packrafting_prompt = ""
    packrafting_info_payload = None
    if packrafting_intent:
        packrafting_prompt = build_packrafting_prompt(packrafting_intent)
        formatted_packrafting = format_packrafting_response(packrafting_intent)
        packrafting_info_payload = formatted_packrafting.get("packrafting_info")

    coasteering_intent = detect_coasteering_intent(question)
    coasteering_prompt = ""
    coasteering_info_payload = None
    if coasteering_intent:
        coasteering_prompt = build_coasteering_prompt(coasteering_intent)
        formatted_coasteering = format_coasteering_response(coasteering_intent)
        coasteering_info_payload = formatted_coasteering.get("coasteering_info")

    orienteering_intent = extract_orienteering_intent(question)
    orienteering_prompt = ""
    orienteering_info_payload = None
    if orienteering_intent:
        orienteering_prompt = build_orienteering_prompt(orienteering_intent)
        formatted_orienteering = format_orienteering_response(orienteering_intent)
        orienteering_info_payload = formatted_orienteering.get("orienteering_info")

    highline_intent = extract_highline_intent(question)
    highline_prompt = ""
    highline_info_payload = None
    if highline_intent:
        highline_prompt = build_highline_prompt(highline_intent)
        formatted_highline = format_highline_response(highline_intent)
        highline_info_payload = formatted_highline.get("highline_info")

    dogsled_intent = extract_dogsled_intent(question)
    dogsled_prompt = ""
    dogsled_info_payload = None
    if dogsled_intent:
        dogsled_prompt = build_dogsled_prompt(dogsled_intent)
        formatted_dogsled = format_dogsled_response(dogsled_intent)
        dogsled_info_payload = formatted_dogsled.get("dogsled_info")

    canoe_intent = extract_canoe_intent(question)
    canoe_prompt = ""
    canoe_info_payload = None
    if canoe_intent:
        canoe_prompt = build_canoe_prompt(canoe_intent)
        formatted_canoe = format_canoe_response(canoe_intent)
        canoe_info_payload = formatted_canoe.get("canoe_info")

    shelter_intent = extract_shelter_intent(question)
    shelter_prompt = ""
    shelter_info_payload = None
    if shelter_intent:
        shelter_prompt = build_shelter_prompt(shelter_intent)
        formatted_shelter = format_shelter_response(shelter_intent)
        shelter_info_payload = formatted_shelter.get("shelter_info")

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
    if carrier_tracking_prompt:
        llm_kwargs["carrier_tracking_prompt"] = carrier_tracking_prompt
    if faq_prompt:
        llm_kwargs["faq_prompt"] = faq_prompt
    if sizing_prompt:
        llm_kwargs["sizing_prompt"] = sizing_prompt
    if review_prompt:
        llm_kwargs["review_prompt"] = review_prompt
    if rental_prompt:
        llm_kwargs["rental_prompt"] = rental_prompt
    if return_label_prompt:
        llm_kwargs["return_label_prompt"] = return_label_prompt
    if trail_prompt:
        llm_kwargs["trail_prompt"] = trail_prompt
    if rewards_prompt:
        llm_kwargs["rewards_prompt"] = rewards_prompt
    if (
        permits_prompt
        and not adventure_intent
        and not field_reports_intent
        and not shuttle_intent
        and not hut_intent
        and not volunteer_intent
        and not water_intent
        and not route_intent
        and not fire_safety_intent
        and not first_aid_intent
        and not lnt_intent
    ):
        llm_kwargs["permits_prompt"] = permits_prompt
    if repair_prompt:
        llm_kwargs["repair_prompt"] = repair_prompt
    if adventures_prompt:
        llm_kwargs["adventures_prompt"] = adventures_prompt
    if field_reports_prompt and not avalanche_intent:
        llm_kwargs["field_reports_prompt"] = field_reports_prompt
    if trade_in_prompt:
        llm_kwargs["trade_in_prompt"] = trade_in_prompt
    if trip_planner_prompt:
        llm_kwargs["trip_planner_prompt"] = trip_planner_prompt
    if safety_prompt and not avalanche_intent:
        llm_kwargs["safety_prompt"] = safety_prompt
    if shuttle_prompt:
        llm_kwargs["shuttle_prompt"] = shuttle_prompt
    if hut_prompt:
        llm_kwargs["hut_prompt"] = hut_prompt
    if volunteer_prompt:
        llm_kwargs["volunteer_prompt"] = volunteer_prompt
    if water_prompt:
        llm_kwargs["water_prompt"] = water_prompt
    if route_prompt:
        llm_kwargs["route_prompt"] = route_prompt
    if fire_safety_prompt:
        llm_kwargs["fire_safety_prompt"] = fire_safety_prompt
    if first_aid_prompt:
        llm_kwargs["first_aid_prompt"] = first_aid_prompt
    if lnt_prompt:
        llm_kwargs["lnt_prompt"] = lnt_prompt
    if avalanche_prompt:
        llm_kwargs["avalanche_prompt"] = avalanche_prompt
    if weather_prompt:
        llm_kwargs["weather_prompt"] = weather_prompt
    if ski_tour_prompt:
        llm_kwargs["ski_tour_prompt"] = ski_tour_prompt
    if whitewater_prompt:
        llm_kwargs["whitewater_prompt"] = whitewater_prompt
    if climbing_prompt:
        llm_kwargs["climbing_prompt"] = climbing_prompt
    if foraging_prompt:
        llm_kwargs["foraging_prompt"] = foraging_prompt
    if stargazing_prompt:
        llm_kwargs["stargazing_prompt"] = stargazing_prompt
    if wildlife_prompt:
        llm_kwargs["wildlife_prompt"] = wildlife_prompt
    if trail_running_prompt:
        llm_kwargs["trail_running_prompt"] = trail_running_prompt
    if hot_springs_prompt:
        llm_kwargs["hot_springs_prompt"] = hot_springs_prompt
    if fly_fishing_prompt:
        llm_kwargs["fly_fishing_prompt"] = fly_fishing_prompt
    if bikepacking_prompt:
        llm_kwargs["bikepacking_prompt"] = bikepacking_prompt
    if mountaineering_prompt:
        llm_kwargs["mountaineering_prompt"] = mountaineering_prompt
    if sea_kayaking_prompt:
        llm_kwargs["sea_kayaking_prompt"] = sea_kayaking_prompt
    if packrafting_prompt:
        llm_kwargs["packrafting_prompt"] = packrafting_prompt
    if canyoneering_prompt:
        llm_kwargs["canyoneering_prompt"] = canyoneering_prompt
    if acclimatization_prompt:
        llm_kwargs["acclimatization_prompt"] = acclimatization_prompt
    if nordic_skiing_prompt:
        llm_kwargs["nordic_skiing_prompt"] = nordic_skiing_prompt
    if via_ferrata_prompt:
        llm_kwargs["via_ferrata_prompt"] = via_ferrata_prompt
    if ice_climbing_prompt:
        llm_kwargs["ice_climbing_prompt"] = ice_climbing_prompt
    if bushcraft_prompt:
        llm_kwargs["bushcraft_prompt"] = bushcraft_prompt
    if caving_prompt:
        llm_kwargs["caving_prompt"] = caving_prompt
    if desert_trekking_prompt:
        llm_kwargs["desert_trekking_prompt"] = desert_trekking_prompt
    if coasteering_prompt:
        llm_kwargs["coasteering_prompt"] = coasteering_prompt
    if orienteering_prompt:
        llm_kwargs["orienteering_prompt"] = orienteering_prompt
    if highline_prompt:
        llm_kwargs["highline_prompt"] = highline_prompt
    if dogsled_prompt:
        llm_kwargs["dogsled_prompt"] = dogsled_prompt
    if canoe_prompt:
        llm_kwargs["canoe_prompt"] = canoe_prompt
    if shelter_prompt:
        llm_kwargs["shelter_prompt"] = shelter_prompt
    if glacier_prompt:
        llm_kwargs["glacier_prompt"] = glacier_prompt
    if river_sup_prompt:
        llm_kwargs["river_sup_prompt"] = river_sup_prompt
    if wilderness_tracking_prompt:
        llm_kwargs["wilderness_tracking_prompt"] = wilderness_tracking_prompt
    if snowkiting_prompt:
        llm_kwargs["snowkiting_prompt"] = snowkiting_prompt
    if psicobloc_prompt:
        llm_kwargs["psicobloc_prompt"] = psicobloc_prompt
    if big_wall_prompt:
        llm_kwargs["big_wall_prompt"] = big_wall_prompt
    if snowmobiling_prompt:
        llm_kwargs["snowmobiling_prompt"] = snowmobiling_prompt
    if alpine_scuba_prompt:
        llm_kwargs["alpine_scuba_prompt"] = alpine_scuba_prompt

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
    if carrier_tracking_info:
        response_payload["carrier_tracking"] = carrier_tracking_info.model_dump()
    if faq_result and faq_result.matches:
        response_payload["faq"] = [item.model_dump() for item in faq_result.matches]
    if sizing_info.get("is_sizing_intent") and sizing_info.get("size_guide"):
        response_payload["sizing"] = sizing_info["size_guide"].model_dump()
    if review_info.get("is_review_intent") and review_info.get("summary"):
        response_payload["review_summary"] = review_info["summary"].model_dump()
    if rental_intent and rental_info:
        response_payload["rental_info"] = rental_info
    if return_label_payload:
        response_payload["return_label"] = return_label_payload
    if trail_intent and not field_reports_intent and trail_outfitting_payload:
        response_payload["trail_outfitting"] = trail_outfitting_payload
    if rewards_intent and rewards_info_payload:
        response_payload["rewards_info"] = rewards_info_payload
    if (
        permits_intent
        and not adventure_intent
        and not field_reports_intent
        and not shuttle_intent
        and not hut_intent
        and not volunteer_intent
        and not water_intent
        and not route_intent
        and not fire_safety_intent
        and not first_aid_intent
        and not avalanche_intent
        and permits_info_payload
    ):
        response_payload["permits_info"] = permits_info_payload
    if repair_intent and repair_info_payload:
        response_payload["repair_info"] = repair_info_payload
    if adventure_intent and adventures_info_payload:
        response_payload["adventures_info"] = adventures_info_payload
    if field_reports_intent and not avalanche_intent and field_reports_info_payload:
        response_payload["field_reports_info"] = field_reports_info_payload
    if trade_in_intent and trade_in_info_payload:
        response_payload["trade_in_info"] = trade_in_info_payload
    if trip_planner_intent and trip_planner_payload:
        response_payload["trip_planner_info"] = trip_planner_payload
    if safety_intent and not avalanche_intent and safety_info_payload:
        response_payload["safety_info"] = safety_info_payload
    if shuttle_intent and shuttle_info_payload:
        response_payload["shuttle_info"] = shuttle_info_payload
    if hut_intent and hut_info_payload:
        response_payload["hut_info"] = hut_info_payload
    if volunteer_intent and volunteer_info_payload:
        response_payload["volunteer_info"] = volunteer_info_payload
    if water_intent and water_info_payload:
        response_payload["water_info"] = water_info_payload
    if route_intent and route_info_payload:
        response_payload["route_info"] = route_info_payload
    if fire_safety_intent and fire_safety_info_payload:
        response_payload["fire_safety_info"] = fire_safety_info_payload
    if first_aid_intent and first_aid_info_payload:
        response_payload["first_aid_info"] = first_aid_info_payload
    if lnt_intent and lnt_info_payload:
        response_payload["lnt_info"] = lnt_info_payload
    if avalanche_intent and avalanche_info_payload:
        response_payload["avalanche_info"] = avalanche_info_payload
    if weather_intent and weather_info_payload:
        response_payload["weather_info"] = weather_info_payload
    if ski_tour_intent and ski_tour_info_payload:
        response_payload["ski_tour_info"] = ski_tour_info_payload
    if whitewater_intent and whitewater_info_payload:
        response_payload["whitewater_info"] = whitewater_info_payload
    if climbing_intent and climbing_info_payload:
        response_payload["climbing_info"] = climbing_info_payload
    if foraging_intent and foraging_info_payload:
        response_payload["foraging_info"] = foraging_info_payload
    if stargazing_intent and stargazing_info_payload:
        response_payload["stargazing_info"] = stargazing_info_payload
    if wildlife_intent and wildlife_info_payload:
        response_payload["wildlife_info"] = wildlife_info_payload
    if trail_running_intent and trail_running_info_payload:
        response_payload["trail_running_info"] = trail_running_info_payload
    if hot_springs_intent and hot_springs_info_payload:
        response_payload["hot_springs_info"] = hot_springs_info_payload
    if fly_fishing_intent and fly_fishing_info_payload:
        response_payload["fly_fishing_info"] = fly_fishing_info_payload
    if bikepacking_intent and bikepacking_info_payload:
        response_payload["bikepacking_info"] = bikepacking_info_payload
    if mountaineering_intent and mountaineering_info_payload:
        response_payload["mountaineering_info"] = mountaineering_info_payload
    if sea_kayaking_intent and sea_kayaking_info_payload:
        response_payload["sea_kayaking_info"] = sea_kayaking_info_payload
    if packrafting_intent and packrafting_info_payload:
        response_payload["packrafting_info"] = packrafting_info_payload
    if canyoneering_intent and canyoneering_info_payload:
        response_payload["canyoneering_info"] = canyoneering_info_payload
    if acclimatization_intent and acclimatization_info_payload:
        response_payload["acclimatization_info"] = acclimatization_info_payload
    if nordic_skiing_intent and nordic_skiing_info_payload:
        response_payload["nordic_skiing_info"] = nordic_skiing_info_payload
    if via_ferrata_intent and via_ferrata_info_payload:
        response_payload["via_ferrata_info"] = via_ferrata_info_payload
    if ice_climbing_intent and ice_climbing_info_payload:
        response_payload["ice_climbing_info"] = ice_climbing_info_payload
    if bushcraft_intent and bushcraft_info_payload:
        response_payload["bushcraft_info"] = bushcraft_info_payload
    if caving_intent and caving_info_payload:
        response_payload["caving_info"] = caving_info_payload
    if desert_trekking_intent and desert_trekking_info_payload:
        response_payload["desert_trekking_info"] = desert_trekking_info_payload
    if coasteering_intent and coasteering_info_payload:
        response_payload["coasteering_info"] = coasteering_info_payload
    if orienteering_intent and orienteering_info_payload:
        response_payload["orienteering_info"] = orienteering_info_payload
    if highline_intent and highline_info_payload:
        response_payload["highline_info"] = highline_info_payload
    if dogsled_intent and dogsled_info_payload:
        response_payload["dogsled_info"] = dogsled_info_payload
    if canoe_intent and canoe_info_payload:
        response_payload["canoe_info"] = canoe_info_payload
    if shelter_intent and shelter_info_payload:
        response_payload["shelter_info"] = shelter_info_payload
    if glacier_intent and glacier_info_payload:
        response_payload["glacier_info"] = glacier_info_payload
    if river_sup_intent and river_sup_info_payload:
        response_payload["river_sup_info"] = river_sup_info_payload
    if wilderness_tracking_intent and wilderness_tracking_info_payload:
        response_payload["tracking_info"] = wilderness_tracking_info_payload
    if snowkiting_intent and snowkiting_info_payload:
        response_payload["snowkiting_info"] = snowkiting_info_payload
    if psicobloc_intent and psicobloc_info_payload:
        response_payload["psicobloc_info"] = psicobloc_info_payload
    if big_wall_intent and big_wall_info_payload:
        response_payload["big_wall_info"] = big_wall_info_payload
    if snowmobiling_intent and snowmobiling_info_payload:
        response_payload["snowmobiling_info"] = snowmobiling_info_payload
    if alpine_scuba_intent and alpine_scuba_info_payload:
        response_payload["alpine_scuba_info"] = alpine_scuba_info_payload

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
    carrier_tracking_prompt: str = "",
    faq_prompt: str = "",
    sizing_prompt: str = "",
    review_prompt: str = "",
    rental_prompt: str = "",
    return_label_prompt: str = "",
    trail_prompt: str = "",
    rewards_prompt: str = "",
    permits_prompt: str = "",
    repair_prompt: str = "",
    adventures_prompt: str = "",
    field_reports_prompt: str = "",
    trade_in_prompt: str = "",
    trip_planner_prompt: str = "",
    safety_prompt: str = "",
    shuttle_prompt: str = "",
    hut_prompt: str = "",
    volunteer_prompt: str = "",
    water_prompt: str = "",
    route_prompt: str = "",
    fire_safety_prompt: str = "",
    first_aid_prompt: str = "",
    lnt_prompt: str = "",
    avalanche_prompt: str = "",
    weather_prompt: str = "",
    ski_tour_prompt: str = "",
    whitewater_prompt: str = "",
    climbing_prompt: str = "",
    foraging_prompt: str = "",
    stargazing_prompt: str = "",
    wildlife_prompt: str = "",
    trail_running_prompt: str = "",
    hot_springs_prompt: str = "",
    fly_fishing_prompt: str = "",
    bikepacking_prompt: str = "",
    mountaineering_prompt: str = "",
    sea_kayaking_prompt: str = "",
    packrafting_prompt: str = "",
    canyoneering_prompt: str = "",
    acclimatization_prompt: str = "",
    nordic_skiing_prompt: str = "",
    via_ferrata_prompt: str = "",
    ice_climbing_prompt: str = "",
    bushcraft_prompt: str = "",
    caving_prompt: str = "",
    desert_trekking_prompt: str = "",
    coasteering_prompt: str = "",
    orienteering_prompt: str = "",
    highline_prompt: str = "",
    dogsled_prompt: str = "",
    canoe_prompt: str = "",
    shelter_prompt: str = "",
    glacier_prompt: str = "",
    river_sup_prompt: str = "",
    wilderness_tracking_prompt: str = "",
    snowkiting_prompt: str = "",
    psicobloc_prompt: str = "",
    big_wall_prompt: str = "",
    snowmobiling_prompt: str = "",
    alpine_scuba_prompt: str = "",
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
        if store_prompt:
            local_system = f"{local_system}\n\n{store_prompt}"
        if carrier_tracking_prompt:
            local_system = f"{local_system}\n\n{carrier_tracking_prompt}"
        if faq_prompt:
            local_system = f"{local_system}\n\n{faq_prompt}"
        if sizing_prompt:
            local_system = f"{local_system}\n\n{sizing_prompt}"
        if review_prompt:
            local_system = f"{local_system}\n\n{review_prompt}"
        if rental_prompt:
            local_system = f"{local_system}\n\n{rental_prompt}"
        if return_label_prompt:
            local_system = f"{local_system}\n\n{return_label_prompt}"
        if trail_prompt:
            local_system = f"{local_system}\n\n{trail_prompt}"
        if rewards_prompt:
            local_system = f"{local_system}\n\n{rewards_prompt}"
        if permits_prompt:
            local_system = f"{local_system}\n\n{permits_prompt}"
        if repair_prompt:
            local_system = f"{local_system}\n\n{repair_prompt}"
        if adventures_prompt:
            local_system = f"{local_system}\n\n{adventures_prompt}"
        if field_reports_prompt:
            local_system = f"{local_system}\n\n{field_reports_prompt}"
        if trade_in_prompt:
            local_system = f"{local_system}\n\n{trade_in_prompt}"
        if trip_planner_prompt:
            local_system = f"{local_system}\n\n{trip_planner_prompt}"
        if safety_prompt:
            local_system = f"{local_system}\n\n{safety_prompt}"
        if shuttle_prompt:
            local_system = f"{local_system}\n\n{shuttle_prompt}"
        if hut_prompt:
            local_system = f"{local_system}\n\n{hut_prompt}"
        if volunteer_prompt:
            local_system = f"{local_system}\n\n{volunteer_prompt}"
        if water_prompt:
            local_system = f"{local_system}\n\n{water_prompt}"
        if route_prompt:
            local_system = f"{local_system}\n\n{route_prompt}"
        if fire_safety_prompt:
            local_system = f"{local_system}\n\n{fire_safety_prompt}"
        if first_aid_prompt:
            local_system = f"{local_system}\n\n{first_aid_prompt}"
        if lnt_prompt:
            local_system = f"{local_system}\n\n{lnt_prompt}"
        if avalanche_prompt:
            local_system = f"{local_system}\n\n{avalanche_prompt}"
        if weather_prompt:
            local_system = f"{local_system}\n\n{weather_prompt}"
        if ski_tour_prompt:
            local_system = f"{local_system}\n\n{ski_tour_prompt}"
        if whitewater_prompt:
            local_system = f"{local_system}\n\n{whitewater_prompt}"
        if climbing_prompt:
            local_system = f"{local_system}\n\n{climbing_prompt}"
        if foraging_prompt:
            local_system = f"{local_system}\n\n{foraging_prompt}"
        if stargazing_prompt:
            local_system = f"{local_system}\n\n{stargazing_prompt}"
        if wildlife_prompt:
            local_system = f"{local_system}\n\n{wildlife_prompt}"
        if trail_running_prompt:
            local_system = f"{local_system}\n\n{trail_running_prompt}"
        if hot_springs_prompt:
            local_system = f"{local_system}\n\n{hot_springs_prompt}"
        if fly_fishing_prompt:
            local_system = f"{local_system}\n\n{fly_fishing_prompt}"
        if packrafting_prompt:
            local_system = f"{local_system}\n\n{packrafting_prompt}"
        if canyoneering_prompt:
            local_system = f"{local_system}\n\n{canyoneering_prompt}"
        if acclimatization_prompt:
            local_system = f"{local_system}\n\n{acclimatization_prompt}"
        if nordic_skiing_prompt:
            local_system = f"{local_system}\n\n{nordic_skiing_prompt}"
        if via_ferrata_prompt:
            local_system = f"{local_system}\n\n{via_ferrata_prompt}"
        if ice_climbing_prompt:
            local_system = f"{local_system}\n\n{ice_climbing_prompt}"
        if bushcraft_prompt:
            local_system = f"{local_system}\n\n{bushcraft_prompt}"
        if caving_prompt:
            local_system = f"{local_system}\n\n{caving_prompt}"
        if coasteering_prompt:
            local_system = f"{local_system}\n\n{coasteering_prompt}"
        if orienteering_prompt:
            local_system = f"{local_system}\n\n{orienteering_prompt}"
        if highline_prompt:
            local_system = f"{local_system}\n\n{highline_prompt}"
        if dogsled_prompt:
            local_system = f"{local_system}\n\n{dogsled_prompt}"
        if canoe_prompt:
            local_system = f"{local_system}\n\n{canoe_prompt}"
        if shelter_prompt:
            local_system = f"{local_system}\n\n{shelter_prompt}"
        if glacier_prompt:
            local_system = f"{local_system}\n\n{glacier_prompt}"
        if river_sup_prompt:
            local_system = f"{local_system}\n\n{river_sup_prompt}"
        if wilderness_tracking_prompt:
            local_system = f"{local_system}\n\n{wilderness_tracking_prompt}"
        if snowkiting_prompt:
            local_system = f"{local_system}\n\n{snowkiting_prompt}"
        if psicobloc_prompt:
            local_system = f"{local_system}\n\n{psicobloc_prompt}"
        if big_wall_prompt:
            local_system = f"{local_system}\n\n{big_wall_prompt}"
        if snowmobiling_prompt:
            local_system = f"{local_system}\n\n{snowmobiling_prompt}"
        if alpine_scuba_prompt:
            local_system = f"{local_system}\n\n{alpine_scuba_prompt}"

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
            if (
                chunk.choices
                and hasattr(chunk.choices[0], "delta")
                and getattr(chunk.choices[0].delta, "content", None)
            ):
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
        if carrier_tracking_prompt:
            prompt_parts.append(carrier_tracking_prompt)
        if faq_prompt:
            prompt_parts.append(faq_prompt)
        if sizing_prompt:
            prompt_parts.append(sizing_prompt)
        if review_prompt:
            prompt_parts.append(review_prompt)
        if rental_prompt:
            prompt_parts.append(rental_prompt)
        if return_label_prompt:
            prompt_parts.append(return_label_prompt)
        if trail_prompt:
            prompt_parts.append(trail_prompt)
        if rewards_prompt:
            prompt_parts.append(rewards_prompt)
        if permits_prompt:
            prompt_parts.append(permits_prompt)
        if repair_prompt:
            prompt_parts.append(repair_prompt)
        if adventures_prompt:
            prompt_parts.append(adventures_prompt)
        if field_reports_prompt:
            prompt_parts.append(field_reports_prompt)
        if trade_in_prompt:
            prompt_parts.append(trade_in_prompt)
        if trip_planner_prompt:
            prompt_parts.append(trip_planner_prompt)
        if safety_prompt:
            prompt_parts.append(safety_prompt)
        if shuttle_prompt:
            prompt_parts.append(shuttle_prompt)
        if hut_prompt:
            prompt_parts.append(hut_prompt)
        if volunteer_prompt:
            prompt_parts.append(volunteer_prompt)
        if water_prompt:
            prompt_parts.append(water_prompt)
        if route_prompt:
            prompt_parts.append(route_prompt)
        if fire_safety_prompt:
            prompt_parts.append(fire_safety_prompt)
        if first_aid_prompt:
            prompt_parts.append(first_aid_prompt)
        if lnt_prompt:
            prompt_parts.append(lnt_prompt)
        if avalanche_prompt:
            prompt_parts.append(avalanche_prompt)
        if weather_prompt:
            prompt_parts.append(weather_prompt)
        if ski_tour_prompt:
            prompt_parts.append(ski_tour_prompt)
        if whitewater_prompt:
            prompt_parts.append(whitewater_prompt)
        if climbing_prompt:
            prompt_parts.append(climbing_prompt)
        if foraging_prompt:
            prompt_parts.append(foraging_prompt)
        if stargazing_prompt:
            prompt_parts.append(stargazing_prompt)
        if wildlife_prompt:
            prompt_parts.append(wildlife_prompt)
        if trail_running_prompt:
            prompt_parts.append(trail_running_prompt)
        if hot_springs_prompt:
            prompt_parts.append(hot_springs_prompt)
        if fly_fishing_prompt:
            prompt_parts.append(fly_fishing_prompt)
        if bikepacking_prompt:
            prompt_parts.append(bikepacking_prompt)
        if packrafting_prompt:
            prompt_parts.append(packrafting_prompt)
        if canyoneering_prompt:
            prompt_parts.append(canyoneering_prompt)
        if acclimatization_prompt:
            prompt_parts.append(acclimatization_prompt)
        if nordic_skiing_prompt:
            prompt_parts.append(nordic_skiing_prompt)
        if via_ferrata_prompt:
            prompt_parts.append(via_ferrata_prompt)
        if ice_climbing_prompt:
            prompt_parts.append(ice_climbing_prompt)
        if bushcraft_prompt:
            prompt_parts.append(bushcraft_prompt)
        if caving_prompt:
            prompt_parts.append(caving_prompt)
        if coasteering_prompt:
            prompt_parts.append(coasteering_prompt)
        if orienteering_prompt:
            prompt_parts.append(orienteering_prompt)
        if highline_prompt:
            prompt_parts.append(highline_prompt)
        if dogsled_prompt:
            prompt_parts.append(dogsled_prompt)
        if canoe_prompt:
            prompt_parts.append(canoe_prompt)
        if shelter_prompt:
            prompt_parts.append(shelter_prompt)
        if glacier_prompt:
            prompt_parts.append(glacier_prompt)
        if river_sup_prompt:
            prompt_parts.append(river_sup_prompt)
        if wilderness_tracking_prompt:
            prompt_parts.append(wilderness_tracking_prompt)
        if snowkiting_prompt:
            prompt_parts.append(snowkiting_prompt)
        if psicobloc_prompt:
            prompt_parts.append(psicobloc_prompt)
        if big_wall_prompt:
            prompt_parts.append(big_wall_prompt)
        if snowmobiling_prompt:
            prompt_parts.append(snowmobiling_prompt)
        if alpine_scuba_prompt:
            prompt_parts.append(alpine_scuba_prompt)
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

    carrier_intent = detect_carrier_tracking_intent(question)
    carrier_tracking_info = None
    carrier_tracking_prompt = ""
    if carrier_intent.get("is_carrier_intent") and carrier_intent.get("extracted_identifier"):
        carrier_tracking_info = lookup_carrier_tracking(carrier_intent["extracted_identifier"])
        if carrier_tracking_info:
            carrier_tracking_prompt = build_carrier_milestone_prompt(
                carrier_tracking_info, question
            )

    faq_result = detect_faq_intent(question)
    faq_prompt = ""
    if faq_result and faq_result.matches:
        faq_prompt = build_faq_prompt(faq_result.matches, question)

    sizing_info = detect_sizing_intent(question)
    sizing_prompt = ""
    if sizing_info.get("is_sizing_intent"):
        sizing_prompt = build_sizing_prompt(
            sizing_info.get("size_guide"),
            sizing_info.get("recommendation"),
            question,
        )

    review_info = detect_review_sentiment_intent(question)
    review_prompt = ""
    if review_info.get("is_review_intent") and review_info.get("summary"):
        review_prompt = build_review_summary_prompt(
            review_info.get("summary"),
            question,
        )

    rental_intent = detect_rental_intent(question)
    rental_prompt = ""
    rental_info = None
    if rental_intent:
        rental_prompt = build_rental_prompt(rental_intent)
        formatted_rental = format_rental_response(rental_intent)
        rental_info = formatted_rental.get("rental_info")

    return_label_intent = detect_return_label_intent(question)
    return_label_prompt = ""
    return_label_payload = None
    if return_label_intent:
        rl_info = (
            generate_return_label(return_label_intent.order_id)
            if return_label_intent.order_id
            else None
        )
        return_label_prompt = build_return_label_prompt(return_label_intent, rl_info)
        formatted_return = format_return_label_response(return_label_intent, rl_info)
        return_label_payload = formatted_return.get("return_label")

    trail_intent = detect_trail_intent(question)
    trail_prompt = ""
    trail_outfitting_payload = None
    if trail_intent:
        trail_outfitting_resp = generate_outfitting_plan(
            trail_name=trail_intent.trail_name,
            activity=trail_intent.activity or "day-hiking",
            season=trail_intent.season or "spring",
        )
        trail_prompt = build_trail_prompt(trail_intent, trail_outfitting_resp)
        formatted_trail = format_trail_response(trail_intent, trail_outfitting_resp)
        trail_outfitting_payload = formatted_trail.get("trail_outfitting")

    rewards_intent = detect_rewards_intent(question)
    rewards_prompt = ""
    rewards_info_payload = None
    if rewards_intent:
        rewards_loyalty = get_customer_loyalty(rewards_intent.customer_id or customer_id)
        rewards_prompt = build_rewards_prompt(rewards_intent, rewards_loyalty)
        formatted_rewards = format_rewards_response(rewards_intent, rewards_loyalty)
        rewards_info_payload = formatted_rewards.get("rewards_info")

    permits_intent = detect_permits_intent(question)
    permits_prompt = ""
    permits_info_payload = None
    if permits_intent:
        permits_prompt = build_permits_prompt(permits_intent)
        formatted_permits = format_permits_response(permits_intent)
        permits_info_payload = formatted_permits.get("permits_info")

    repair_intent = detect_repair_intent(question)
    repair_prompt = ""
    repair_info_payload = None
    if repair_intent:
        repair_prompt = build_repair_prompt(repair_intent)
        formatted_repair = format_repair_response(repair_intent)
        repair_info_payload = formatted_repair.get("repair_info")

    adventure_intent = detect_adventure_intent(question)
    adventures_prompt = ""
    adventures_info_payload = None
    if adventure_intent:
        adventures_prompt = build_adventure_prompt(adventure_intent)
        formatted_adventures = format_adventure_response(adventure_intent)
        adventures_info_payload = formatted_adventures.get("adventures_info")

    field_reports_intent = detect_field_reports_intent(question)
    field_reports_prompt = ""
    field_reports_info_payload = None
    if field_reports_intent:
        field_reports_prompt = build_field_reports_prompt(field_reports_intent)
        formatted_field_reports = format_field_reports_response(field_reports_intent)
        field_reports_info_payload = formatted_field_reports.get("field_reports_info")

    trade_in_intent = detect_trade_in_intent(question)
    trade_in_prompt = ""
    trade_in_info_payload = None
    if trade_in_intent:
        trade_in_prompt = build_trade_in_prompt(trade_in_intent)
        formatted_trade_in = format_trade_in_response(trade_in_intent)
        trade_in_info_payload = formatted_trade_in.get("trade_in_info")

    trip_planner_intent = detect_trip_planner_intent(question)
    trip_planner_prompt = ""
    trip_planner_payload = None
    if trip_planner_intent:
        trip_planner_prompt = build_trip_planner_prompt(trip_planner_intent)
        formatted_trip = format_trip_planner_response(trip_planner_intent)
        trip_planner_payload = formatted_trip.get("trip_planner_info")

    safety_intent = detect_safety_intent(question)
    safety_prompt = ""
    safety_info_payload = None
    if safety_intent:
        safety_prompt = build_safety_prompt(safety_intent)
        formatted_safety = format_safety_response(safety_intent)
        safety_info_payload = formatted_safety.get("safety_info")

    shuttle_intent = detect_shuttle_intent(question)
    shuttle_prompt = ""
    shuttle_info_payload = None
    if shuttle_intent:
        shuttle_prompt = build_shuttle_prompt(shuttle_intent)
        formatted_shuttle = format_shuttle_response(shuttle_intent)
        shuttle_info_payload = formatted_shuttle.get("shuttle_info")

    hut_intent = detect_hut_intent(question)
    hut_prompt = ""
    hut_info_payload = None
    if hut_intent:
        hut_prompt = build_hut_prompt(hut_intent)
        formatted_hut = format_hut_response(hut_intent)
        hut_info_payload = formatted_hut.get("hut_info")

    volunteer_intent = detect_volunteer_intent(question)
    volunteer_prompt = ""
    volunteer_info_payload = None
    if volunteer_intent:
        volunteer_prompt = build_volunteer_prompt(volunteer_intent)
        formatted_volunteer = format_volunteer_response(volunteer_intent)
        volunteer_info_payload = formatted_volunteer.get("volunteer_info")

    water_intent = detect_water_intent(question)
    water_prompt = ""
    water_info_payload = None
    if water_intent:
        water_prompt = build_water_prompt(water_intent)
        formatted_water = format_water_response(water_intent)
        water_info_payload = formatted_water.get("water_info")

    route_intent = detect_route_intent(question)
    route_prompt = ""
    route_info_payload = None
    if route_intent and not shuttle_intent:
        route_prompt = build_route_prompt(route_intent)
        formatted_route = format_route_response(route_intent)
        route_info_payload = formatted_route.get("route_info")

    fire_safety_intent = detect_fire_safety_intent(question)
    fire_safety_prompt = ""
    fire_safety_info_payload = None
    if fire_safety_intent:
        fire_safety_prompt = build_fire_safety_prompt(fire_safety_intent)
        formatted_fire = format_fire_safety_response(fire_safety_intent)
        fire_safety_info_payload = formatted_fire.get("fire_safety_info")

    first_aid_intent = detect_first_aid_intent(question)
    first_aid_prompt = ""
    first_aid_info_payload = None
    if first_aid_intent:
        first_aid_prompt = build_first_aid_prompt(first_aid_intent)
        formatted_first_aid = format_first_aid_response(first_aid_intent)
        first_aid_info_payload = formatted_first_aid.get("first_aid_info")

    avalanche_intent = detect_avalanche_intent(question)
    avalanche_prompt = ""
    avalanche_info_payload = None
    if avalanche_intent:
        avalanche_prompt = build_avalanche_prompt(avalanche_intent)
        formatted_avy = format_avalanche_response(avalanche_intent)
        avalanche_info_payload = formatted_avy.get("avalanche_info")

    weather_intent = detect_weather_intent(question)
    weather_prompt = ""
    weather_info_payload = None
    if weather_intent:
        weather_prompt = build_weather_prompt(weather_intent)
        formatted_weather = format_weather_response(weather_intent)
        weather_info_payload = formatted_weather.get("weather_info")

    ski_tour_intent = detect_ski_tour_intent(question)
    ski_tour_prompt = ""
    ski_tour_info_payload = None
    if ski_tour_intent:
        ski_tour_prompt = build_ski_tour_prompt(ski_tour_intent)
        formatted_ski_tour = format_ski_tour_response(ski_tour_intent)
        ski_tour_info_payload = formatted_ski_tour.get("ski_tour_info")

    whitewater_intent = detect_whitewater_intent(question)
    whitewater_prompt = ""
    whitewater_info_payload = None
    if whitewater_intent:
        whitewater_prompt = build_whitewater_prompt(whitewater_intent)
        formatted_whitewater = format_whitewater_response(whitewater_intent)
        whitewater_info_payload = formatted_whitewater.get("whitewater_info")

    climbing_intent = detect_climbing_intent(question)
    climbing_prompt = ""
    climbing_info_payload = None
    if climbing_intent:
        climbing_prompt = build_climbing_prompt(climbing_intent)
        formatted_climbing = format_climbing_response(climbing_intent)
        climbing_info_payload = formatted_climbing.get("climbing_info")

    foraging_intent = detect_foraging_intent(question)
    foraging_prompt = ""
    foraging_info_payload = None
    if foraging_intent:
        foraging_prompt = build_foraging_prompt(foraging_intent)
        formatted_foraging = format_foraging_response(foraging_intent)
        foraging_info_payload = formatted_foraging.get("foraging_info")

    stargazing_intent = detect_stargazing_intent(question)
    stargazing_prompt = ""
    stargazing_info_payload = None
    if stargazing_intent:
        stargazing_prompt = build_stargazing_prompt(stargazing_intent)
        formatted_stargazing = format_stargazing_response(stargazing_intent)
        stargazing_info_payload = formatted_stargazing.get("stargazing_info")

    wildlife_intent = detect_wildlife_intent(question)
    wildlife_prompt = ""
    wildlife_info_payload = None
    if wildlife_intent:
        wildlife_prompt = build_wildlife_prompt(wildlife_intent)
        formatted_wildlife = format_wildlife_response(wildlife_intent)
        wildlife_info_payload = formatted_wildlife.get("wildlife_info")

    trail_running_intent = detect_trail_running_intent(question)
    trail_running_prompt = ""
    trail_running_info_payload = None
    if trail_running_intent:
        trail_running_prompt = build_trail_running_prompt(trail_running_intent)
        formatted_trail_running = format_trail_running_response(trail_running_intent)
        trail_running_info_payload = formatted_trail_running.get("trail_running_info")

    hot_springs_intent = detect_hot_spring_intent(question)
    hot_springs_prompt = ""
    hot_springs_info_payload = None
    if hot_springs_intent:
        hot_springs_prompt = build_hot_spring_prompt(hot_springs_intent)
        formatted_hot_springs = format_hot_spring_response(hot_springs_intent)
        hot_springs_info_payload = formatted_hot_springs.get("hot_springs_info")

    fly_fishing_intent = detect_fly_fishing_intent(question)
    fly_fishing_prompt = ""
    fly_fishing_info_payload = None
    if fly_fishing_intent:
        fly_fishing_prompt = build_fly_fishing_prompt(fly_fishing_intent)
        formatted_fly_fishing = format_fly_fishing_response(fly_fishing_intent)
        fly_fishing_info_payload = formatted_fly_fishing.get("fly_fishing_info")

    bikepacking_intent = detect_bikepacking_intent(question)
    bikepacking_prompt = ""
    bikepacking_info_payload = None
    if bikepacking_intent:
        bikepacking_prompt = build_bikepacking_prompt(bikepacking_intent)
        formatted_bikepacking = format_bikepacking_response(bikepacking_intent)
        bikepacking_info_payload = formatted_bikepacking.get("bikepacking_info")

    glacier_intent = detect_glacier_intent(question)
    glacier_prompt = ""
    glacier_info_payload = None
    if glacier_intent:
        glacier_prompt = build_glacier_prompt(glacier_intent)
        formatted_glacier = format_glacier_response(glacier_intent, question)
        glacier_info_payload = formatted_glacier.get("glacier_info")

    river_sup_intent = detect_river_sup_intent(question)
    river_sup_prompt = ""
    river_sup_info_payload = None
    if river_sup_intent:
        river_sup_prompt = build_river_sup_prompt(river_sup_intent)
        formatted_river_sup = format_river_sup_response(river_sup_intent, question)
        river_sup_info_payload = formatted_river_sup.get("river_sup_info")

    wilderness_tracking_intent = detect_wilderness_tracking_intent(question)
    wilderness_tracking_prompt = ""
    wilderness_tracking_info_payload = None
    if wilderness_tracking_intent:
        wilderness_tracking_prompt = build_wilderness_tracking_prompt(wilderness_tracking_intent)
        formatted_tracking = format_wilderness_tracking_response(
            wilderness_tracking_intent, question
        )
        wilderness_tracking_info_payload = formatted_tracking.get("tracking_info")
    snowkiting_intent = detect_snowkiting_intent(question)
    snowkiting_prompt = ""
    snowkiting_info_payload = None
    if snowkiting_intent:
        snowkiting_prompt = build_snowkiting_prompt(snowkiting_intent)
        formatted_snowkiting = format_snowkiting_response(snowkiting_intent, question)
        snowkiting_info_payload = formatted_snowkiting.get("snowkiting_info")
    psicobloc_intent = detect_psicobloc_intent(question)
    psicobloc_prompt = ""
    psicobloc_info_payload = None
    if psicobloc_intent:
        psicobloc_prompt = build_psicobloc_prompt(psicobloc_intent)
        formatted_psicobloc = format_psicobloc_response(psicobloc_intent, question)
        psicobloc_info_payload = formatted_psicobloc.get("psicobloc_info")
    big_wall_intent = detect_big_wall_intent(question)
    big_wall_prompt = ""
    big_wall_info_payload = None
    if big_wall_intent:
        big_wall_prompt = build_big_wall_prompt(big_wall_intent)
        formatted_big_wall = format_big_wall_response(big_wall_intent, question)
        big_wall_info_payload = formatted_big_wall.get("big_wall_info")
    snowmobiling_intent = detect_snowmobiling_intent(question)
    snowmobiling_prompt = ""
    snowmobiling_info_payload = None
    if snowmobiling_intent:
        snowmobiling_prompt = build_snowmobiling_prompt(snowmobiling_intent)
        formatted_snowmobiling = format_snowmobiling_response(snowmobiling_intent, question)
        snowmobiling_info_payload = formatted_snowmobiling.get("snowmobiling_info")
    alpine_scuba_intent = detect_alpine_scuba_intent(question)
    alpine_scuba_prompt = ""
    alpine_scuba_info_payload = None
    if alpine_scuba_intent:
        alpine_scuba_prompt = build_alpine_scuba_prompt(alpine_scuba_intent)
        formatted_alpine_scuba = format_alpine_scuba_response(alpine_scuba_intent, question)
        alpine_scuba_info_payload = formatted_alpine_scuba.get("alpine_scuba_info")
    mountaineering_intent = detect_mountaineering_intent(question)
    mountaineering_prompt = ""
    mountaineering_info_payload = None
    if mountaineering_intent:
        mountaineering_prompt = build_mountaineering_prompt(mountaineering_intent)
        formatted_mountaineering = format_mountaineering_response(mountaineering_intent)
        mountaineering_info_payload = formatted_mountaineering.get("mountaineering_info")

    sea_kayaking_intent = detect_sea_kayaking_intent(question)
    sea_kayaking_prompt = ""
    sea_kayaking_info_payload = None
    if sea_kayaking_intent:
        sea_kayaking_prompt = build_sea_kayaking_prompt(sea_kayaking_intent)
        formatted_sea_kayaking = format_sea_kayaking_response(sea_kayaking_intent)
        sea_kayaking_info_payload = formatted_sea_kayaking.get("sea_kayaking_info")

    canyoneering_intent = detect_canyoneering_intent(question)
    canyoneering_prompt = ""
    canyoneering_info_payload = None
    if canyoneering_intent:
        canyoneering_prompt = build_canyoneering_prompt(canyoneering_intent)
        formatted_canyoneering = format_canyoneering_response(canyoneering_intent)
        canyoneering_info_payload = formatted_canyoneering.get("canyoneering_info")

    acclimatization_intent = detect_acclimatization_intent(question)
    acclimatization_prompt = ""
    acclimatization_info_payload = None
    if acclimatization_intent:
        acclimatization_prompt = build_acclimatization_prompt(acclimatization_intent)
        formatted_acclimatization = format_acclimatization_response(acclimatization_intent)
        acclimatization_info_payload = formatted_acclimatization.get("acclimatization_info")

    nordic_skiing_intent = detect_nordic_skiing_intent(question)
    nordic_skiing_prompt = ""
    nordic_skiing_info_payload = None
    if nordic_skiing_intent:
        nordic_skiing_prompt = build_nordic_skiing_prompt(nordic_skiing_intent)
        formatted_nordic = format_nordic_skiing_response(nordic_skiing_intent)
        nordic_skiing_info_payload = formatted_nordic.get("nordic_skiing_info")

    packrafting_intent = detect_packrafting_intent(question)
    packrafting_prompt = ""
    packrafting_info_payload = None
    if packrafting_intent:
        packrafting_prompt = build_packrafting_prompt(packrafting_intent)
        formatted_packrafting = format_packrafting_response(packrafting_intent)
        packrafting_info_payload = formatted_packrafting.get("packrafting_info")

    via_ferrata_intent = detect_via_ferrata_intent(question)
    via_ferrata_prompt = ""
    via_ferrata_info_payload = None
    if via_ferrata_intent:
        via_ferrata_prompt = build_via_ferrata_prompt(via_ferrata_intent)
        formatted_via_ferrata = format_via_ferrata_response(via_ferrata_intent)
        via_ferrata_info_payload = formatted_via_ferrata.get("via_ferrata_info")

    ice_climbing_intent = detect_ice_climbing_intent(question)
    ice_climbing_prompt = ""
    ice_climbing_info_payload = None
    if ice_climbing_intent:
        ice_climbing_prompt = build_ice_climbing_prompt(ice_climbing_intent)
        formatted_ice_climbing = format_ice_climbing_response(ice_climbing_intent)
        ice_climbing_info_payload = formatted_ice_climbing.get("ice_climbing_info")

    bushcraft_intent = detect_bushcraft_intent(question)
    bushcraft_prompt = ""
    bushcraft_info_payload = None
    if bushcraft_intent:
        bushcraft_prompt = build_bushcraft_prompt(bushcraft_intent)
        formatted_bushcraft = format_bushcraft_response(bushcraft_intent)
        bushcraft_info_payload = formatted_bushcraft.get("bushcraft_info")

    caving_intent = detect_caving_intent(question)
    caving_prompt = ""
    caving_info_payload = None
    if caving_intent:
        caving_prompt = build_caving_prompt(caving_intent)
        formatted_caving = format_caving_response(caving_intent)
        caving_info_payload = formatted_caving.get("caving_info")

    desert_trekking_intent = detect_desert_trekking_intent(question)
    desert_trekking_prompt = ""
    desert_trekking_info_payload = None
    if desert_trekking_intent:
        desert_trekking_prompt = build_desert_trekking_prompt(desert_trekking_intent)
        formatted_desert = format_desert_trekking_response(desert_trekking_intent)
        desert_trekking_info_payload = formatted_desert.get("desert_trekking_info")

    coasteering_intent = detect_coasteering_intent(question)
    coasteering_prompt = ""
    coasteering_info_payload = None
    if coasteering_intent:
        coasteering_prompt = build_coasteering_prompt(coasteering_intent)
        formatted_coasteering = format_coasteering_response(coasteering_intent)
        coasteering_info_payload = formatted_coasteering.get("coasteering_info")

    orienteering_intent = extract_orienteering_intent(question)
    orienteering_prompt = ""
    orienteering_info_payload = None
    if orienteering_intent:
        orienteering_prompt = build_orienteering_prompt(orienteering_intent)
        formatted_orienteering = format_orienteering_response(orienteering_intent)
        orienteering_info_payload = formatted_orienteering.get("orienteering_info")

    highline_intent = extract_highline_intent(question)
    highline_prompt = ""
    highline_info_payload = None
    if highline_intent:
        highline_prompt = build_highline_prompt(highline_intent)
        formatted_highline = format_highline_response(highline_intent)
        highline_info_payload = formatted_highline.get("highline_info")

    dogsled_intent = extract_dogsled_intent(question)
    dogsled_prompt = ""
    dogsled_info_payload = None
    if dogsled_intent:
        dogsled_prompt = build_dogsled_prompt(dogsled_intent)
        formatted_dogsled = format_dogsled_response(dogsled_intent)
        dogsled_info_payload = formatted_dogsled.get("dogsled_info")

    canoe_intent = extract_canoe_intent(question)
    canoe_prompt = ""
    canoe_info_payload = None
    if canoe_intent:
        canoe_prompt = build_canoe_prompt(canoe_intent)
        formatted_canoe = format_canoe_response(canoe_intent)
        canoe_info_payload = formatted_canoe.get("canoe_info")

    shelter_intent = extract_shelter_intent(question)
    shelter_prompt = ""
    shelter_info_payload = None
    if shelter_intent:
        shelter_prompt = build_shelter_prompt(shelter_intent)
        formatted_shelter = format_shelter_response(shelter_intent)
        shelter_info_payload = formatted_shelter.get("shelter_info")

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
    if carrier_tracking_info:
        yield f"data: {json.dumps({'event': 'carrier_tracking', 'carrier_tracking': carrier_tracking_info.model_dump()})}\n\n"
    if faq_result and faq_result.matches:
        yield f"data: {json.dumps({'event': 'faq', 'faq': [item.model_dump() for item in faq_result.matches]})}\n\n"
    if sizing_info.get("is_sizing_intent") and sizing_info.get("size_guide"):
        yield f"data: {json.dumps({'event': 'sizing', 'sizing': sizing_info['size_guide'].model_dump()})}\n\n"
    if review_info.get("is_review_intent") and review_info.get("summary"):
        yield f"data: {json.dumps({'event': 'review_summary', 'review_summary': review_info['summary'].model_dump()})}\n\n"
    if rental_intent and rental_info:
        yield f"data: {json.dumps({'event': 'rental_info', 'rental_info': rental_info})}\n\n"
    if return_label_payload:
        yield f"data: {json.dumps({'event': 'return_label', 'return_label': return_label_payload})}\n\n"
    if trail_intent and not field_reports_intent and trail_outfitting_payload:
        yield f"data: {json.dumps({'event': 'trail_outfitting', 'trail_outfitting': trail_outfitting_payload})}\n\n"
    if rewards_intent and rewards_info_payload:
        yield f"data: {json.dumps({'event': 'rewards_info', 'rewards_info': rewards_info_payload})}\n\n"
    if (
        permits_intent
        and not adventure_intent
        and not field_reports_intent
        and not shuttle_intent
        and not hut_intent
        and not volunteer_intent
        and not water_intent
        and not route_intent
        and not fire_safety_intent
        and not first_aid_intent
        and not avalanche_intent
        and permits_info_payload
    ):
        yield f"data: {json.dumps({'event': 'permits_info', 'permits_info': permits_info_payload})}\n\n"
    if repair_intent and repair_info_payload:
        yield f"data: {json.dumps({'event': 'repair_info', 'repair_info': repair_info_payload})}\n\n"
    if adventure_intent and adventures_info_payload:
        yield f"data: {json.dumps({'event': 'adventures_info', 'adventures_info': adventures_info_payload})}\n\n"
    if field_reports_intent and not avalanche_intent and field_reports_info_payload:
        yield f"data: {json.dumps({'event': 'field_reports_info', 'field_reports_info': field_reports_info_payload})}\n\n"
    if trade_in_intent and trade_in_info_payload:
        yield f"data: {json.dumps({'event': 'trade_in_info', 'trade_in_info': trade_in_info_payload})}\n\n"
    if trip_planner_intent and trip_planner_payload:
        yield f"data: {json.dumps({'event': 'trip_planner_info', 'trip_planner_info': trip_planner_payload})}\n\n"
    if safety_intent and not avalanche_intent and safety_info_payload:
        yield f"data: {json.dumps({'event': 'safety_info', 'safety_info': safety_info_payload})}\n\n"
    if shuttle_intent and shuttle_info_payload:
        yield f"data: {json.dumps({'event': 'shuttle_info', 'shuttle_info': shuttle_info_payload})}\n\n"
    if hut_intent and hut_info_payload:
        yield f"data: {json.dumps({'event': 'hut_info', 'hut_info': hut_info_payload})}\n\n"
    if volunteer_intent and volunteer_info_payload:
        yield f"data: {json.dumps({'event': 'volunteer_info', 'volunteer_info': volunteer_info_payload})}\n\n"
    if water_intent and water_info_payload:
        yield f"data: {json.dumps({'event': 'water_info', 'water_info': water_info_payload})}\n\n"
    if route_intent and route_info_payload:
        yield f"data: {json.dumps({'event': 'route_info', 'route_info': route_info_payload})}\n\n"
    if fire_safety_intent and fire_safety_info_payload:
        yield f"data: {json.dumps({'event': 'fire_safety_info', 'fire_safety_info': fire_safety_info_payload})}\n\n"
    if first_aid_intent and first_aid_info_payload:
        yield f"data: {json.dumps({'event': 'first_aid_info', 'first_aid_info': first_aid_info_payload})}\n\n"
    if avalanche_intent and avalanche_info_payload:
        yield f"data: {json.dumps({'event': 'avalanche_info', 'avalanche_info': avalanche_info_payload})}\n\n"
    if weather_intent and weather_info_payload:
        yield f"data: {json.dumps({'event': 'weather_info', 'weather_info': weather_info_payload})}\n\n"
    if ski_tour_intent and ski_tour_info_payload:
        yield f"data: {json.dumps({'event': 'ski_tour_info', 'ski_tour_info': ski_tour_info_payload})}\n\n"
    if whitewater_intent and whitewater_info_payload:
        yield f"data: {json.dumps({'event': 'whitewater_info', 'whitewater_info': whitewater_info_payload})}\n\n"
    if climbing_intent and climbing_info_payload:
        yield f"data: {json.dumps({'event': 'climbing_info', 'climbing_info': climbing_info_payload})}\n\n"
    if foraging_intent and foraging_info_payload:
        yield f"data: {json.dumps({'event': 'foraging_info', 'foraging_info': foraging_info_payload})}\n\n"
    if stargazing_intent and stargazing_info_payload:
        yield f"data: {json.dumps({'event': 'stargazing_info', 'stargazing_info': stargazing_info_payload})}\n\n"
    if wildlife_intent and wildlife_info_payload:
        yield f"data: {json.dumps({'event': 'wildlife_info', 'wildlife_info': wildlife_info_payload})}\n\n"
    if trail_running_intent and trail_running_info_payload:
        yield f"data: {json.dumps({'event': 'trail_running_info', 'trail_running_info': trail_running_info_payload})}\n\n"
    if hot_springs_intent and hot_springs_info_payload:
        yield f"data: {json.dumps({'event': 'hot_springs_info', 'hot_springs_info': hot_springs_info_payload})}\n\n"
    if fly_fishing_intent and fly_fishing_info_payload:
        yield f"data: {json.dumps({'event': 'fly_fishing_info', 'fly_fishing_info': fly_fishing_info_payload})}\n\n"
    if bikepacking_intent and bikepacking_info_payload:
        yield f"data: {json.dumps({'event': 'bikepacking_info', 'bikepacking_info': bikepacking_info_payload})}\n\n"
    if mountaineering_intent and mountaineering_info_payload:
        yield f"data: {json.dumps({'event': 'mountaineering_info', 'mountaineering_info': mountaineering_info_payload})}\n\n"
    if sea_kayaking_intent and sea_kayaking_info_payload:
        yield f"data: {json.dumps({'event': 'sea_kayaking_info', 'sea_kayaking_info': sea_kayaking_info_payload})}\n\n"
    if packrafting_intent and packrafting_info_payload:
        yield f"data: {json.dumps({'event': 'packrafting_info', 'packrafting_info': packrafting_info_payload})}\n\n"
    if canyoneering_intent and canyoneering_info_payload:
        yield f"data: {json.dumps({'event': 'canyoneering_info', 'canyoneering_info': canyoneering_info_payload})}\n\n"
    if acclimatization_intent and acclimatization_info_payload:
        yield f"data: {json.dumps({'event': 'acclimatization_info', 'acclimatization_info': acclimatization_info_payload})}\n\n"
    if nordic_skiing_intent and nordic_skiing_info_payload:
        yield f"data: {json.dumps({'event': 'nordic_skiing_info', 'nordic_skiing_info': nordic_skiing_info_payload})}\n\n"
    if via_ferrata_intent and via_ferrata_info_payload:
        yield f"data: {json.dumps({'event': 'via_ferrata_info', 'via_ferrata_info': via_ferrata_info_payload})}\n\n"
    if ice_climbing_intent and ice_climbing_info_payload:
        yield f"data: {json.dumps({'event': 'ice_climbing_info', 'ice_climbing_info': ice_climbing_info_payload})}\n\n"
    if bushcraft_intent and bushcraft_info_payload:
        yield f"data: {json.dumps({'event': 'bushcraft_info', 'bushcraft_info': bushcraft_info_payload})}\n\n"
    if caving_intent and caving_info_payload:
        yield f"data: {json.dumps({'event': 'caving_info', 'caving_info': caving_info_payload})}\n\n"
    if desert_trekking_intent and desert_trekking_info_payload:
        yield f"data: {json.dumps({'event': 'desert_trekking_info', 'desert_trekking_info': desert_trekking_info_payload})}\n\n"
    if coasteering_intent and coasteering_info_payload:
        yield f"data: {json.dumps({'event': 'coasteering_info', 'coasteering_info': coasteering_info_payload})}\n\n"
    if orienteering_intent and orienteering_info_payload:
        action_to_event = {
            "courses_list": "orienteering_courses",
            "course_detail": "orienteering_detail",
            "calculate_leg": "orienteering_leg",
            "gear_checklist": "orienteering_gear",
        }
        event_name = action_to_event.get(orienteering_intent.action, "orienteering_info")
        yield f"data: {json.dumps({'event': event_name, 'orienteering_info': orienteering_info_payload, event_name: orienteering_info_payload})}\n\n"
        if event_name != "orienteering_info":
            yield f"data: {json.dumps({'event': 'orienteering_info', 'orienteering_info': orienteering_info_payload})}\n\n"
    if highline_intent and highline_info_payload:
        action_to_event = {
            "spans_list": "highline_spans",
            "span_detail": "highline_detail",
            "calculate_rigging": "highline_rigging",
            "gear_checklist": "highline_gear",
        }
        event_name = action_to_event.get(highline_intent.action, "highline_info")
        yield f"data: {json.dumps({'event': event_name, 'highline_info': highline_info_payload, event_name: highline_info_payload})}\n\n"
        if event_name != "highline_info":
            yield f"data: {json.dumps({'event': 'highline_info', 'highline_info': highline_info_payload})}\n\n"

    if dogsled_intent and dogsled_info_payload:
        action_to_event = {
            "routes_list": "dogsled_routes",
            "route_detail": "dogsled_detail",
            "calculate_pacing": "dogsled_pacing",
            "gear_checklist": "dogsled_gear",
        }
        event_name = action_to_event.get(dogsled_intent.action, "dogsled_info")
        yield f"data: {json.dumps({'event': event_name, 'dogsled_info': dogsled_info_payload, event_name: dogsled_info_payload})}\n\n"
        if event_name != "dogsled_info":
            yield f"data: {json.dumps({'event': 'dogsled_info', 'dogsled_info': dogsled_info_payload})}\n\n"

    if canoe_intent and canoe_info_payload:
        action_to_event = {
            "routes_list": "canoe_routes",
            "route_detail": "canoe_detail",
            "calculate_trim": "canoe_trim",
            "gear_checklist": "canoe_gear",
        }
        event_name = action_to_event.get(canoe_intent.action, "canoe_info")
        yield f"data: {json.dumps({'event': event_name, 'canoe_info': canoe_info_payload, event_name: canoe_info_payload})}\n\n"
        if event_name != "canoe_info":
            yield f"data: {json.dumps({'event': 'canoe_info', 'canoe_info': canoe_info_payload})}\n\n"
    if shelter_intent and shelter_info_payload:
        action_to_event = {
            "shelters_list": "shelter_list",
            "shelter_detail": "shelter_detail",
            "calculate_thermodynamics": "shelter_thermo",
            "gear_checklist": "shelter_gear",
        }
        event_name = action_to_event.get(shelter_intent.action, "shelter_info")
        yield f"data: {json.dumps({'event': event_name, 'shelter_info': shelter_info_payload, event_name: shelter_info_payload})}\n\n"
        if event_name != "shelter_info":
            yield f"data: {json.dumps({'event': 'shelter_info', 'shelter_info': shelter_info_payload})}\n\n"

    if glacier_intent and glacier_info_payload:
        action_to_event = {
            "zones_list": "glacier_zones",
            "zone_detail": "glacier_zone_detail",
            "calculate_navigation": "glacier_calculation",
            "gear_checklist": "glacier_gear",
        }
        event_name = action_to_event.get(glacier_intent.action, "glacier_info")
        yield f"data: {json.dumps({'event': event_name, 'glacier_info': glacier_info_payload, event_name: glacier_info_payload})}\n\n"
        if event_name != "glacier_info":
            yield f"data: {json.dumps({'event': 'glacier_info', 'glacier_info': glacier_info_payload})}\n\n"

    if river_sup_intent and river_sup_info_payload:
        action_to_event = {
            "runs_list": "river_sup_runs",
            "run_detail": "river_sup_run_detail",
            "river_sup_calculation": "river_sup_calculation",
            "gear_checklist": "river_sup_gear",
        }
        event_name = action_to_event.get(river_sup_intent.action, "river_sup_info")
        yield f"data: {json.dumps({'event': event_name, 'river_sup_info': river_sup_info_payload, event_name: river_sup_info_payload})}\n\n"
        if event_name != "river_sup_info":
            yield f"data: {json.dumps({'event': 'river_sup_info', 'river_sup_info': river_sup_info_payload})}\n\n"

    if wilderness_tracking_intent and wilderness_tracking_info_payload:
        action_to_event = {
            "species_list": "tracking_species",
            "species_detail": "tracking_species_detail",
            "calculate_track_aging": "tracking_calculation",
            "gear_checklist": "tracking_gear",
        }
        event_name = action_to_event.get(wilderness_tracking_intent.action, "tracking_info")
        yield f"data: {json.dumps({'event': event_name, 'tracking_info': wilderness_tracking_info_payload, event_name: wilderness_tracking_info_payload})}\n\n"
        if event_name != "tracking_info":
            yield f"data: {json.dumps({'event': 'tracking_info', 'tracking_info': wilderness_tracking_info_payload})}\n\n"
    if snowkiting_intent and snowkiting_info_payload:
        action_to_event = {
            "spots_list": "snowkiting_spots",
            "spot_detail": "snowkiting_spot_detail",
            "calculate_snowkiting": "snowkiting_calculation",
            "gear_checklist": "snowkiting_gear",
        }
        event_name = action_to_event.get(snowkiting_intent.action, "snowkiting_info")
        yield f"data: {json.dumps({'event': event_name, 'snowkiting_info': snowkiting_info_payload, event_name: snowkiting_info_payload})}\n\n"
        if event_name != "snowkiting_info":
            yield f"data: {json.dumps({'event': 'snowkiting_info', 'snowkiting_info': snowkiting_info_payload})}\n\n"
    if psicobloc_intent and psicobloc_info_payload:
        action_to_event = {
            "crags_list": "psicobloc_crags",
            "crag_detail": "psicobloc_crag_detail",
            "calculate_psicobloc": "psicobloc_calculation",
            "gear_checklist": "psicobloc_gear",
        }
        event_name = action_to_event.get(psicobloc_intent.action, "psicobloc_info")
        yield f"data: {json.dumps({'event': event_name, 'psicobloc_info': psicobloc_info_payload, event_name: psicobloc_info_payload})}\n\n"
        if event_name != "psicobloc_info":
            yield f"data: {json.dumps({'event': 'psicobloc_info', 'psicobloc_info': psicobloc_info_payload})}\n\n"
    if big_wall_intent and big_wall_info_payload:
        action_to_event = {
            "routes_list": "big_wall_routes",
            "route_detail": "big_wall_route_detail",
            "calculate_haul": "big_wall_calculation",
            "gear_checklist": "big_wall_gear",
        }
        event_name = action_to_event.get(big_wall_intent.action, "big_wall_info")
        yield f"data: {json.dumps({'event': event_name, 'big_wall_info': big_wall_info_payload, event_name: big_wall_info_payload})}\n\n"
        if event_name != "big_wall_info":
            yield f"data: {json.dumps({'event': 'big_wall_info', 'big_wall_info': big_wall_info_payload})}\n\n"
    if snowmobiling_intent and snowmobiling_info_payload:
        action_to_event = {
            "zones_list": "snowmobiling_zones",
            "zone_detail": "snowmobiling_zone_detail",
            "calculate_sled": "snowmobiling_calculation",
            "gear_checklist": "snowmobiling_gear",
        }
        event_name = action_to_event.get(snowmobiling_intent.action, "snowmobiling_info")
        yield f"data: {json.dumps({'event': event_name, 'snowmobiling_info': snowmobiling_info_payload, event_name: snowmobiling_info_payload})}\n\n"
        if event_name != "snowmobiling_info":
            yield f"data: {json.dumps({'event': 'snowmobiling_info', 'snowmobiling_info': snowmobiling_info_payload})}\n\n"
    if alpine_scuba_intent and alpine_scuba_info_payload:
        action_to_event = {
            "sites_list": "alpine_scuba_sites",
            "site_detail": "alpine_scuba_site_detail",
            "calculate_scuba": "alpine_scuba_calculation",
            "gear_checklist": "alpine_scuba_gear",
        }
        event_name = action_to_event.get(alpine_scuba_intent.action, "alpine_scuba_info")
        yield f"data: {json.dumps({'event': event_name, 'alpine_scuba_info': alpine_scuba_info_payload, event_name: alpine_scuba_info_payload})}\n\n"
        if event_name != "alpine_scuba_info":
            yield f"data: {json.dumps({'event': 'alpine_scuba_info', 'alpine_scuba_info': alpine_scuba_info_payload})}\n\n"
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
    if carrier_tracking_prompt:
        stream_kwargs["carrier_tracking_prompt"] = carrier_tracking_prompt
    if faq_prompt:
        stream_kwargs["faq_prompt"] = faq_prompt
    if sizing_prompt:
        stream_kwargs["sizing_prompt"] = sizing_prompt
    if review_prompt:
        stream_kwargs["review_prompt"] = review_prompt
    if rental_prompt:
        stream_kwargs["rental_prompt"] = rental_prompt
    if return_label_prompt:
        stream_kwargs["return_label_prompt"] = return_label_prompt
    if trail_prompt:
        stream_kwargs["trail_prompt"] = trail_prompt
    if rewards_prompt:
        stream_kwargs["rewards_prompt"] = rewards_prompt
    if (
        permits_prompt
        and not adventure_intent
        and not field_reports_intent
        and not shuttle_intent
        and not hut_intent
        and not volunteer_intent
        and not water_intent
        and not route_intent
        and not fire_safety_intent
        and not first_aid_intent
        and not avalanche_intent
    ):
        stream_kwargs["permits_prompt"] = permits_prompt
    if repair_prompt:
        stream_kwargs["repair_prompt"] = repair_prompt
    if adventures_prompt:
        stream_kwargs["adventures_prompt"] = adventures_prompt
    if field_reports_prompt and not avalanche_intent:
        stream_kwargs["field_reports_prompt"] = field_reports_prompt
    if trade_in_prompt:
        stream_kwargs["trade_in_prompt"] = trade_in_prompt
    if trip_planner_prompt:
        stream_kwargs["trip_planner_prompt"] = trip_planner_prompt
    if safety_prompt and not avalanche_intent:
        stream_kwargs["safety_prompt"] = safety_prompt
    if shuttle_prompt:
        stream_kwargs["shuttle_prompt"] = shuttle_prompt
    if hut_prompt:
        stream_kwargs["hut_prompt"] = hut_prompt
    if volunteer_prompt:
        stream_kwargs["volunteer_prompt"] = volunteer_prompt
    if water_prompt:
        stream_kwargs["water_prompt"] = water_prompt
    if route_prompt:
        stream_kwargs["route_prompt"] = route_prompt
    if fire_safety_prompt:
        stream_kwargs["fire_safety_prompt"] = fire_safety_prompt
    if first_aid_prompt:
        stream_kwargs["first_aid_prompt"] = first_aid_prompt
    if avalanche_prompt:
        stream_kwargs["avalanche_prompt"] = avalanche_prompt
    if weather_prompt:
        stream_kwargs["weather_prompt"] = weather_prompt
    if ski_tour_prompt:
        stream_kwargs["ski_tour_prompt"] = ski_tour_prompt
    if whitewater_prompt:
        stream_kwargs["whitewater_prompt"] = whitewater_prompt
    if climbing_prompt:
        stream_kwargs["climbing_prompt"] = climbing_prompt
    if foraging_prompt:
        stream_kwargs["foraging_prompt"] = foraging_prompt
    if stargazing_prompt:
        stream_kwargs["stargazing_prompt"] = stargazing_prompt
    if wildlife_prompt:
        stream_kwargs["wildlife_prompt"] = wildlife_prompt
    if trail_running_prompt:
        stream_kwargs["trail_running_prompt"] = trail_running_prompt
    if hot_springs_prompt:
        stream_kwargs["hot_springs_prompt"] = hot_springs_prompt
    if fly_fishing_prompt:
        stream_kwargs["fly_fishing_prompt"] = fly_fishing_prompt
    if bikepacking_prompt:
        stream_kwargs["bikepacking_prompt"] = bikepacking_prompt
    if mountaineering_prompt:
        stream_kwargs["mountaineering_prompt"] = mountaineering_prompt
    if sea_kayaking_prompt:
        stream_kwargs["sea_kayaking_prompt"] = sea_kayaking_prompt
    if packrafting_prompt:
        stream_kwargs["packrafting_prompt"] = packrafting_prompt
    if canyoneering_prompt:
        stream_kwargs["canyoneering_prompt"] = canyoneering_prompt
    if acclimatization_prompt:
        stream_kwargs["acclimatization_prompt"] = acclimatization_prompt
    if nordic_skiing_prompt:
        stream_kwargs["nordic_skiing_prompt"] = nordic_skiing_prompt
    if via_ferrata_prompt:
        stream_kwargs["via_ferrata_prompt"] = via_ferrata_prompt
    if ice_climbing_prompt:
        stream_kwargs["ice_climbing_prompt"] = ice_climbing_prompt
    if bushcraft_prompt:
        stream_kwargs["bushcraft_prompt"] = bushcraft_prompt
    if caving_prompt:
        stream_kwargs["caving_prompt"] = caving_prompt
    if desert_trekking_prompt:
        stream_kwargs["desert_trekking_prompt"] = desert_trekking_prompt
    if coasteering_prompt:
        stream_kwargs["coasteering_prompt"] = coasteering_prompt
    if orienteering_prompt:
        stream_kwargs["orienteering_prompt"] = orienteering_prompt
    if highline_prompt:
        stream_kwargs["highline_prompt"] = highline_prompt
    if dogsled_prompt:
        stream_kwargs["dogsled_prompt"] = dogsled_prompt
    if canoe_prompt:
        stream_kwargs["canoe_prompt"] = canoe_prompt
    if shelter_prompt:
        stream_kwargs["shelter_prompt"] = shelter_prompt
    if glacier_prompt:
        stream_kwargs["glacier_prompt"] = glacier_prompt
    if river_sup_prompt:
        stream_kwargs["river_sup_prompt"] = river_sup_prompt
    if wilderness_tracking_prompt:
        stream_kwargs["wilderness_tracking_prompt"] = wilderness_tracking_prompt
    if snowkiting_prompt:
        stream_kwargs["snowkiting_prompt"] = snowkiting_prompt
    if psicobloc_prompt:
        stream_kwargs["psicobloc_prompt"] = psicobloc_prompt
    if big_wall_prompt:
        stream_kwargs["big_wall_prompt"] = big_wall_prompt
    if snowmobiling_prompt:
        stream_kwargs["snowmobiling_prompt"] = snowmobiling_prompt
    if alpine_scuba_prompt:
        stream_kwargs["alpine_scuba_prompt"] = alpine_scuba_prompt

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
