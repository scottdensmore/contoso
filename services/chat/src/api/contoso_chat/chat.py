"""Chat intent cascade and request processing for Contoso Outdoors."""

from typing import Any, Optional

from contoso_chat.pack_goat import (
    detect_pack_goat_intent,
    format_pack_goat_response,
)


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
