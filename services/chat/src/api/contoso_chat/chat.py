"""Chat intent cascade and request processing for Contoso Outdoors."""

from typing import Any, Optional

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
from contoso_chat.sandboarding import (
    detect_sandboarding_intent,
    format_sandboarding_response,
)
from contoso_chat.telemark_skiing import (
    detect_telemark_intent,
    format_telemark_response,
)


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

