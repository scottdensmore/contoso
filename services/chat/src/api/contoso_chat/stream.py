"""SSE stream event generation for Contoso Outdoors."""

import json
from typing import AsyncGenerator

from contoso_chat.cave_diving import (
    detect_cave_diving_intent,
    format_cave_diving_response,
)
from contoso_chat.falconry import (
    detect_falconry_intent,
    format_falconry_response,
)
from contoso_chat.pack_goat import (
    detect_pack_goat_intent,
    format_pack_goat_response,
)
from contoso_chat.pack_llama import (
    detect_pack_llama_intent,
    format_pack_llama_response,
)
from contoso_chat.sandboarding import (
    detect_sandboarding_intent,
    format_sandboarding_response,
)
from contoso_chat.telemark_skiing import (
    detect_telemark_intent,
    format_telemark_response,
)
from contoso_chat.turtle_patrol import (
    detect_turtle_patrol_intent,
    format_turtle_patrol_response,
)
from contoso_chat.zipline import (
    detect_zipline_intent,
    format_zipline_response,
)


async def generate_cave_diving_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events cave_diving_lookup and cave_diving_calculated when cave diving intent is handled."""
    intent = detect_cave_diving_intent(question)
    if not intent:
        return

    formatted = format_cave_diving_response(intent)
    cave_payload = formatted.get("cave_diving_info")

    event_name = (
        "cave_diving_calculated"
        if intent.action in ("calculate_gas", "calculate")
        else "cave_diving_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'cave_diving_info': cave_payload, event_name: cave_payload})}\n\n"
    if event_name != "cave_diving_info":
        yield f"data: {json.dumps({'event': 'cave_diving_info', 'cave_diving_info': cave_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


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


async def generate_pack_llama_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events pack_llama_lookup and pack_llama_calculated when pack llama intent is handled."""
    intent = detect_pack_llama_intent(question)
    if not intent:
        return

    formatted = format_pack_llama_response(intent, question)
    llama_payload = formatted.get("pack_llama_info")

    event_name = (
        "pack_llama_calculated"
        if intent.action in ("calculate_packing", "calculate")
        else "pack_llama_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'pack_llama_info': llama_payload, event_name: llama_payload})}\n\n"
    if event_name != "pack_llama_info":
        yield f"data: {json.dumps({'event': 'pack_llama_info', 'pack_llama_info': llama_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_zipline_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events zipline_lookup and zipline_calculated when zipline intent is handled."""
    intent = detect_zipline_intent(question)
    if not intent:
        return

    formatted = format_zipline_response(intent, question)
    zip_payload = formatted.get("zipline_info")

    event_name = (
        "zipline_calculated"
        if intent.action in ("calculate_dynamics", "calculate")
        else "zipline_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'zipline_info': zip_payload, event_name: zip_payload})}\n\n"
    if event_name != "zipline_info":
        yield f"data: {json.dumps({'event': 'zipline_info', 'zipline_info': zip_payload})}\n\n"

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


async def generate_telemark_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events telemark_lookup and telemark_calculated when telemark skiing intent is handled."""
    intent = detect_telemark_intent(question)
    if not intent:
        return

    formatted = format_telemark_response(intent)
    tele_payload = formatted.get("telemark_skiing_info")

    event_name = (
        "telemark_calculated"
        if intent.action in ("calculate_activity", "calculate")
        else "telemark_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'telemark_skiing_info': tele_payload, event_name: tele_payload})}\n\n"
    if event_name != "telemark_skiing_info":
        yield f"data: {json.dumps({'event': 'telemark_skiing_info', 'telemark_skiing_info': tele_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_falconry_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events falconry_lookup and falconry_calculated when falconry intent is handled."""
    intent = detect_falconry_intent(question)
    if not intent:
        return

    formatted = format_falconry_response(intent, question)
    falconry_payload = formatted.get("falconry_info")

    event_name = (
        "falconry_calculated"
        if intent.action in ("calculate_conditioning", "calculate")
        else "falconry_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'falconry_info': falconry_payload, event_name: falconry_payload})}\n\n"
    if event_name != "falconry_info":
        yield f"data: {json.dumps({'event': 'falconry_info', 'falconry_info': falconry_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"

async def generate_turtle_patrol_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events turtle_patrol_lookup and turtle_patrol_calculated when turtle patrol intent is handled."""
    intent = detect_turtle_patrol_intent(question)
    if not intent:
        return

    formatted = format_turtle_patrol_response(intent, question)
    turtle_payload = formatted.get("turtle_patrol_info")

    event_name = (
        "turtle_patrol_calculated"
        if intent.action in ("calculate_dynamics", "calculate")
        else "turtle_patrol_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'turtle_patrol_info': turtle_payload, event_name: turtle_payload})}\n\n"
    if event_name != "turtle_patrol_info":
        yield f"data: {json.dumps({'event': 'turtle_patrol_info', 'turtle_patrol_info': turtle_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"

