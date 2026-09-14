import threading
from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field

DEFAULT_TITLE = "New Chat"


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: str
    citations: Optional[list[dict[str, Any]]] = None
    order_tracking: Optional[dict[str, Any]] = None


class ChatSession(BaseModel):
    session_id: str
    customer_id: Optional[str] = None
    title: str
    created_at: str
    updated_at: str
    messages: list[ChatMessage] = Field(default_factory=list)


_SESSIONS: dict[str, ChatSession] = {}
_LOCK = threading.RLock()


def create_or_get_session(
    session_id: str,
    customer_id: Optional[str] = None,
    title: Optional[str] = None,
) -> ChatSession:
    """Creates a new chat session or returns an existing one by session_id."""
    with _LOCK:
        if session_id in _SESSIONS:
            session = _SESSIONS[session_id]
            if customer_id and not session.customer_id:
                session.customer_id = customer_id
            return session

        now = datetime.now(timezone.utc).isoformat()
        session = ChatSession(
            session_id=session_id,
            customer_id=customer_id,
            title=title if title is not None else DEFAULT_TITLE,
            created_at=now,
            updated_at=now,
            messages=[],
        )
        _SESSIONS[session_id] = session
        return session


def append_message(
    session_id: str,
    role: str,
    content: str,
    citations: Optional[list[dict[str, Any]]] = None,
    order_tracking: Optional[dict[str, Any]] = None,
) -> ChatSession:
    """Appends a message to the session and updates its timestamp and title."""
    with _LOCK:
        if session_id not in _SESSIONS:
            create_or_get_session(session_id)
        session = _SESSIONS[session_id]

        timestamp = datetime.now(timezone.utc).isoformat()
        if session.title == DEFAULT_TITLE and role == "user":
            clean = content.strip()
            if clean:
                session.title = clean[:40]

        msg = ChatMessage(
            role=role,
            content=content,
            timestamp=timestamp,
            citations=citations,
            order_tracking=order_tracking,
        )
        session.messages.append(msg)
        session.updated_at = timestamp
        return session


def get_session(session_id: str) -> Optional[ChatSession]:
    """Retrieves a session by ID or None if not found."""
    with _LOCK:
        return _SESSIONS.get(session_id)


def list_sessions(customer_id: Optional[str] = None) -> list[ChatSession]:
    """Returns all sessions sorted by updated_at descending, optionally filtered by customer_id."""
    with _LOCK:
        sessions = list(_SESSIONS.values())
    if customer_id is not None:
        sessions = [s for s in sessions if s.customer_id == customer_id]
    sessions.sort(key=lambda s: s.updated_at, reverse=True)
    return sessions


def delete_session(session_id: str) -> bool:
    """Deletes a session by ID. Returns True if deleted, False if not found."""
    with _LOCK:
        if session_id in _SESSIONS:
            del _SESSIONS[session_id]
            return True
        return False


def get_history_for_llm(session_id: str, max_turns: int = 10) -> list[dict[str, str]]:
    """Returns list of prior messages formatted as [{'role': m.role, 'content': m.content}, ...]."""
    with _LOCK:
        session = _SESSIONS.get(session_id)
        if not session:
            return []
        msgs = list(session.messages)

    if max_turns <= 0:
        return []

    if len(msgs) > max_turns:
        msgs = msgs[-max_turns:]

    return [{"role": m.role, "content": m.content} for m in msgs]


def clear_session_store() -> None:
    """Clears all sessions from in-memory store for testing cleanup."""
    with _LOCK:
        _SESSIONS.clear()
