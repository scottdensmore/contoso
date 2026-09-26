"""SSE stream event generation for Contoso Outdoors."""

import json
from typing import AsyncGenerator

from contoso_chat.pack_goat import (
    detect_pack_goat_intent,
    format_pack_goat_response,
)
from contoso_chat.sandboarding import (
    detect_sandboarding_intent,
    format_sandboarding_response,
)


async def generate_pack_goat_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events pack_goat_lookup and pack_goat_calculated when pack goat intent is handled."""
    intent = detect_pack_goat_intent(question)
    if not intent:
        return

    formatted = format_pack_goat_response(intent, question)
    goat_payload = formatted.get("pack_goat_info")

    event_name = (
        "pack_goat_calculated"
        if intent.action in ("calculate_packing", "calculate")
        else "pack_goat_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'pack_goat_info': goat_payload, event_name: goat_payload})}\n\n"
    if event_name != "pack_goat_info":
        yield f"data: {json.dumps({'event': 'pack_goat_info', 'pack_goat_info': goat_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_sandboarding_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events sandboarding_lookup and sandboarding_calculated when sandboarding intent is handled."""
    intent = detect_sandboarding_intent(question)
    if not intent:
        return

    formatted = format_sandboarding_response(intent, question)
    sand_payload = formatted.get("sandboarding_info")

    event_name = (
        "sandboarding_calculated"
        if intent.action in ("calculate_glide", "calculate")
        else "sandboarding_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'sandboarding_info': sand_payload, event_name: sand_payload})}\n\n"
    if event_name != "sandboarding_info":
        yield f"data: {json.dumps({'event': 'sandboarding_info', 'sandboarding_info': sand_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"
