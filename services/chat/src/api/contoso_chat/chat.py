"""Chat intent cascade and request processing for Contoso Outdoors."""

from typing import Any, Optional

from contoso_chat.canyon_bouldering import (
    detect_canyon_bouldering_intent,
    format_canyon_bouldering_response,
)
from contoso_chat.cave_diving import (
    detect_cave_diving_intent,
    format_cave_diving_response,
)
from contoso_chat.cave_mineralogy import (
    detect_cave_mineralogy_intent,
    format_cave_mineralogy_response,
)
from contoso_chat.falconry import (
    detect_falconry_intent,
    format_falconry_response,
)
from contoso_chat.mudflat_trekking import (
    detect_mudflat_intent,
    format_mudflat_response,
)
from contoso_chat.night_via_ferrata import (
    detect_night_via_ferrata_intent,
    format_night_via_ferrata_response,
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


def handle_cave_mineralogy_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format cave mineralogy intent in the cascade."""
    intent = detect_cave_mineralogy_intent(question)
    if not intent:
        return None
    formatted = format_cave_mineralogy_response(intent)
    return {
        "cave_mineralogy_info": formatted.get("cave_mineralogy_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_cave_diving_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format cave diving intent in the cascade."""
    intent = detect_cave_diving_intent(question)
    if not intent:
        return None
    formatted = format_cave_diving_response(intent)
    return {
        "cave_diving_info": formatted.get("cave_diving_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_pack_goat_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format pack goat intent in the cascade."""
    intent = detect_pack_goat_intent(question)
    if not intent:
        return None
    formatted = format_pack_goat_response(intent, question)
    return {
        "pack_goat_info": formatted.get("pack_goat_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_pack_llama_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format pack llama intent in the cascade."""
    intent = detect_pack_llama_intent(question)
    if not intent:
        return None
    formatted = format_pack_llama_response(intent)
    return {
        "pack_llama_info": formatted.get("pack_llama_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_zipline_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format zipline intent in the cascade."""
    intent = detect_zipline_intent(question)
    if not intent:
        return None
    formatted = format_zipline_response(intent, question)
    return {
        "zipline_info": formatted.get("zipline_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_sandboarding_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format sandboarding intent in the cascade."""
    intent = detect_sandboarding_intent(question)
    if not intent:
        return None
    formatted = format_sandboarding_response(intent, question)
    return {
        "sandboarding_info": formatted.get("sandboarding_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_telemark_skiing_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format telemark skiing intent in the cascade."""
    intent = detect_telemark_intent(question)
    if not intent:
        return None
    formatted = format_telemark_response(intent)
    return {
        "telemark_skiing_info": formatted.get("telemark_skiing_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_falconry_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format falconry intent in the cascade."""
    intent = detect_falconry_intent(question)
    if not intent:
        return None
    formatted = format_falconry_response(intent, question)
    return {
        "falconry_info": formatted.get("falconry_info"),
        "answer": formatted.get("answer", str(formatted)),
    }

def handle_turtle_patrol_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format turtle patrol intent in the cascade."""
    intent = detect_turtle_patrol_intent(question)
    if not intent:
        return None
    formatted = format_turtle_patrol_response(intent, question)
    return {
        "turtle_patrol_info": formatted.get("turtle_patrol_info"),
        "answer": formatted.get("answer", str(formatted)),
    }

def handle_night_via_ferrata_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format night via ferrata intent in the cascade."""
    intent = detect_night_via_ferrata_intent(question)
    if not intent:
        return None
    formatted = format_night_via_ferrata_response(intent, question)
    return {
        "night_via_ferrata_info": formatted.get("night_via_ferrata_info"),
        "answer": formatted.get("answer", str(formatted)),
    }
def handle_canyon_bouldering_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format wilderness canyon bouldering intent in the cascade."""
    intent = detect_canyon_bouldering_intent(question)
    if not intent:
        return None
    formatted = format_canyon_bouldering_response(intent, question)
    return {
        "canyon_bouldering_info": formatted.get("canyon_bouldering_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_mudflat_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format wilderness tidal flat mud-trekking intent in the cascade."""
    intent = detect_mudflat_intent(question)
    if not intent:
        return None
    formatted = format_mudflat_response(intent, question)
    return {
        "mudflat_trekking_info": formatted.get("mudflat_trekking_info"),
        "answer": formatted.get("answer", str(formatted)),
    }
