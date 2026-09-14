import json
from datetime import datetime, timezone
from typing import Any, Optional

from contoso_chat.session_store import get_session

SUPPORTED_FORMATS: dict[str, tuple[str, str]] = {
    "markdown": ("text/markdown", "md"),
    "text": ("text/plain", "txt"),
    "json": ("application/json", "json"),
}


def _extract_message(msg: Any) -> dict[str, Any]:
    if isinstance(msg, dict):
        return msg
    if hasattr(msg, "model_dump"):
        return msg.model_dump()
    if hasattr(msg, "__dict__"):
        return dict(msg.__dict__)
    return {
        "role": getattr(msg, "role", "unknown"),
        "content": getattr(msg, "content", str(msg)),
        "timestamp": getattr(msg, "timestamp", None),
        "citations": getattr(msg, "citations", None),
        "order_tracking": getattr(msg, "order_tracking", None),
    }


def _format_price(price: Any) -> str:
    try:
        val = float(price)
        return f"${val:.2f}"
    except (ValueError, TypeError):
        return f"${price}" if price is not None else ""


def format_transcript_markdown(
    session_id: Optional[str],
    title: Optional[str],
    created_at: Optional[str],
    messages: list[Any],
    include_citations: bool = True,
    include_timestamps: bool = True,
) -> str:
    display_title = title or "Export"
    exported_at = datetime.now(timezone.utc).isoformat()

    lines = [
        f"# Chat Transcript: {display_title}",
        "",
        "## Metadata",
        f"- **Session ID:** {session_id or 'N/A'}",
        f"- **Exported At:** {exported_at}",
    ]
    if created_at:
        lines.append(f"- **Created At:** {created_at}")
    lines.extend([
        f"- **Total Messages:** {len(messages)}",
        "",
        "---",
        "",
    ])

    for msg_item in messages:
        msg = _extract_message(msg_item)
        role = str(msg.get("role", "unknown")).capitalize()
        timestamp = msg.get("timestamp")
        content = str(msg.get("content", ""))

        if include_timestamps and timestamp:
            lines.append(f"### {role} ({timestamp})")
        else:
            lines.append(f"### {role}")

        lines.append("")
        lines.append(content)
        lines.append("")

        citations = msg.get("citations")
        if include_citations and citations and isinstance(citations, list):
            lines.append("**Citations:**")
            for cit in citations:
                if isinstance(cit, dict):
                    name = cit.get("name", "Product")
                    slug = str(cit.get("slug", "")).lstrip("/")
                    price = cit.get("price")
                    price_part = f" ({_format_price(price)})" if price is not None else ""
                    lines.append(f"- {name}{price_part} - [View Product](/products/{slug})")
            lines.append("")

        order_tracking = msg.get("order_tracking")
        if order_tracking and isinstance(order_tracking, dict):
            trk_num = order_tracking.get("tracking_number", "N/A")
            status = order_tracking.get("status", "N/A")
            carrier = order_tracking.get("carrier", "N/A")
            lines.append("**Order Tracking:**")
            lines.append(f"- Tracking Number: {trk_num}")
            lines.append(f"- Status: {status}")
            lines.append(f"- Carrier: {carrier}")
            lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def format_transcript_text(
    session_id: Optional[str],
    title: Optional[str],
    created_at: Optional[str],
    messages: list[Any],
    include_citations: bool = True,
    include_timestamps: bool = True,
) -> str:
    display_title = title or "Export"
    exported_at = datetime.now(timezone.utc).isoformat()

    lines = [
        f"Chat Transcript: {display_title}",
        "=" * 60,
        f"Session ID: {session_id or 'N/A'}",
        f"Exported At: {exported_at}",
    ]
    if created_at:
        lines.append(f"Created At: {created_at}")
    lines.extend([
        f"Total Messages: {len(messages)}",
        "=" * 60,
        "",
    ])

    for msg_item in messages:
        msg = _extract_message(msg_item)
        role = str(msg.get("role", "unknown")).capitalize()
        timestamp = msg.get("timestamp")
        content = str(msg.get("content", ""))

        if include_timestamps and timestamp:
            lines.append(f"{role} [{timestamp}]:")
        else:
            lines.append(f"{role}:")

        for line in content.splitlines():
            lines.append(f"  {line}")

        citations = msg.get("citations")
        if include_citations and citations and isinstance(citations, list):
            lines.append("  Citations:")
            for cit in citations:
                if isinstance(cit, dict):
                    name = cit.get("name", "Product")
                    slug = str(cit.get("slug", "")).lstrip("/")
                    price = cit.get("price")
                    price_part = f" ({_format_price(price)})" if price is not None else ""
                    lines.append(f"    - {name}{price_part}: /products/{slug}")

        order_tracking = msg.get("order_tracking")
        if order_tracking and isinstance(order_tracking, dict):
            trk_num = order_tracking.get("tracking_number", "N/A")
            status = order_tracking.get("status", "N/A")
            carrier = order_tracking.get("carrier", "N/A")
            lines.append("  Order Tracking:")
            lines.append(f"    Tracking Number: {trk_num}, Status: {status}, Carrier: {carrier}")

        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def format_transcript_json(
    session_id: Optional[str],
    title: Optional[str],
    created_at: Optional[str],
    messages: list[Any],
    include_citations: bool = True,
    include_timestamps: bool = True,
) -> str:
    display_title = title or "Export"
    exported_at = datetime.now(timezone.utc).isoformat()

    formatted_messages = []
    for msg_item in messages:
        msg = _extract_message(msg_item)
        m: dict[str, Any] = {
            "role": msg.get("role", "unknown"),
            "content": msg.get("content", ""),
        }
        if include_timestamps and msg.get("timestamp"):
            m["timestamp"] = msg.get("timestamp")
        if include_citations and msg.get("citations") is not None:
            m["citations"] = msg.get("citations")
        if msg.get("order_tracking") is not None:
            m["order_tracking"] = msg.get("order_tracking")
        formatted_messages.append(m)

    payload = {
        "title": display_title,
        "session_id": session_id,
        "created_at": created_at,
        "exported_at": exported_at,
        "total_messages": len(messages),
        "messages": formatted_messages,
    }

    return json.dumps(payload, indent=2)


def export_transcript(
    session_id: Optional[str] = None,
    messages: Optional[list[Any]] = None,
    format: str = "markdown",
    title: Optional[str] = None,
    include_citations: bool = True,
    include_timestamps: bool = True,
) -> dict[str, Any]:
    fmt_key = format.lower().strip()
    if fmt_key not in SUPPORTED_FORMATS:
        raise ValueError(
            f"Unsupported format '{format}'. Supported formats: {', '.join(SUPPORTED_FORMATS.keys())}"
        )

    resolved_messages: list[Any] = []
    resolved_title: Optional[str] = title
    created_at: Optional[str] = None

    if session_id and messages is None:
        session = get_session(session_id)
        if not session:
            raise ValueError("Session not found")
        resolved_messages = list(session.messages)
        if not resolved_title:
            resolved_title = session.title
        created_at = session.created_at
    elif messages is not None:
        resolved_messages = list(messages)
    else:
        resolved_messages = []

    media_type, ext = SUPPORTED_FORMATS[fmt_key]

    if fmt_key == "markdown":
        content = format_transcript_markdown(
            session_id=session_id,
            title=resolved_title,
            created_at=created_at,
            messages=resolved_messages,
            include_citations=include_citations,
            include_timestamps=include_timestamps,
        )
    elif fmt_key == "text":
        content = format_transcript_text(
            session_id=session_id,
            title=resolved_title,
            created_at=created_at,
            messages=resolved_messages,
            include_citations=include_citations,
            include_timestamps=include_timestamps,
        )
    elif fmt_key == "json":
        content = format_transcript_json(
            session_id=session_id,
            title=resolved_title,
            created_at=created_at,
            messages=resolved_messages,
            include_citations=include_citations,
            include_timestamps=include_timestamps,
        )
    else:
        raise ValueError(f"Unsupported format: {format}")

    return {
        "filename": f"chat-transcript-{session_id or 'export'}.{ext}",
        "format": format,
        "media_type": media_type,
        "content": content,
        "message_count": len(resolved_messages),
    }
