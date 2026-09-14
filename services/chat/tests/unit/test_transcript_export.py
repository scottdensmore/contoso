import json

import pytest
from contoso_chat.session_store import append_message, clear_session_store, create_or_get_session
from contoso_chat.transcript_export import (
    export_transcript,
    format_transcript_json,
    format_transcript_markdown,
    format_transcript_text,
)


@pytest.fixture(autouse=True)
def clean_sessions():
    clear_session_store()
    yield
    clear_session_store()


def test_format_transcript_markdown():
    messages = [
        {
            "role": "user",
            "content": "Can you recommend a tent for backpacking?",
            "timestamp": "2026-09-12T10:00:00Z",
        },
        {
            "role": "assistant",
            "content": "The Alpine Explorer Tent is a great choice.",
            "timestamp": "2026-09-12T10:00:05Z",
            "citations": [
                {
                    "name": "Alpine Explorer Tent",
                    "slug": "alpine-explorer-tent",
                    "price": 350.0,
                }
            ],
            "order_tracking": {
                "tracking_number": "CTSO-TRK-MOCK123",
                "status": "Shipped",
                "carrier": "FedEx Ground",
            },
        },
    ]

    # Test full markdown formatting
    md = format_transcript_markdown(
        session_id="sess-test-1",
        title="Tent Recommendation",
        created_at="2026-09-12T10:00:00Z",
        messages=messages,
        include_citations=True,
        include_timestamps=True,
    )

    # Document header
    assert "# Chat Transcript: Tent Recommendation" in md
    # Metadata section
    assert "sess-test-1" in md
    assert "Exported At:" in md or "Exported At" in md
    assert "Total Messages:" in md and "2" in md
    # Role sections and timestamps
    assert "### User" in md
    assert "2026-09-12T10:00:00Z" in md
    assert "### Assistant" in md
    assert "2026-09-12T10:00:05Z" in md
    # Citations list
    assert "Alpine Explorer Tent" in md
    assert "[View Product](/products/alpine-explorer-tent)" in md
    assert "$350.00" in md
    # Order tracking
    assert "CTSO-TRK-MOCK123" in md
    assert "Shipped" in md
    assert "FedEx Ground" in md

    # Test without timestamps and citations
    md_minimal = format_transcript_markdown(
        session_id="sess-test-1",
        title="Tent Recommendation",
        created_at="2026-09-12T10:00:00Z",
        messages=messages,
        include_citations=False,
        include_timestamps=False,
    )
    assert "[View Product](/products/alpine-explorer-tent)" not in md_minimal
    assert "2026-09-12T10:00:05Z" not in md_minimal


def test_format_transcript_text():
    messages = [
        {
            "role": "user",
            "content": "Where is my order?",
            "timestamp": "2026-09-12T11:00:00Z",
        },
        {
            "role": "assistant",
            "content": "Your order is on the way.",
            "timestamp": "2026-09-12T11:00:05Z",
            "citations": [
                {
                    "name": "Trail Runner Shoes",
                    "slug": "trail-runner-shoes",
                    "price": 120.0,
                }
            ],
            "order_tracking": {
                "tracking_number": "CTSO-TRK-8888",
                "status": "In Transit",
                "carrier": "UPS",
            },
        },
    ]

    text = format_transcript_text(
        session_id="sess-text-1",
        title="Order Status",
        created_at="2026-09-12T11:00:00Z",
        messages=messages,
        include_citations=True,
        include_timestamps=True,
    )

    assert "Chat Transcript: Order Status" in text
    assert "sess-text-1" in text
    assert "Total Messages: 2" in text
    assert "User" in text
    assert "Where is my order?" in text
    assert "Assistant" in text
    assert "Your order is on the way." in text
    assert "2026-09-12T11:00:00Z" in text
    assert "Trail Runner Shoes" in text
    assert "/products/trail-runner-shoes" in text
    assert "CTSO-TRK-8888" in text
    assert "In Transit" in text
    assert "UPS" in text


def test_format_transcript_json():
    messages = [
        {
            "role": "user",
            "content": "Hello there",
            "timestamp": "2026-09-12T12:00:00Z",
        },
        {
            "role": "assistant",
            "content": "Hello! How can I help you today?",
            "timestamp": "2026-09-12T12:00:01Z",
        },
    ]

    json_str = format_transcript_json(
        session_id="sess-json-1",
        title="Greetings",
        created_at="2026-09-12T12:00:00Z",
        messages=messages,
        include_citations=True,
        include_timestamps=True,
    )

    data = json.loads(json_str)
    assert data["session_id"] == "sess-json-1"
    assert data["title"] == "Greetings"
    assert data["total_messages"] == 2
    assert "exported_at" in data
    assert len(data["messages"]) == 2
    assert data["messages"][0]["role"] == "user"
    assert data["messages"][0]["content"] == "Hello there"
    assert data["messages"][0]["timestamp"] == "2026-09-12T12:00:00Z"


def test_export_transcript_from_session_store():
    session_id = "sess-store-1"
    create_or_get_session(session_id=session_id, title="Stored Session")
    append_message(session_id=session_id, role="user", content="Question 1")
    append_message(session_id=session_id, role="assistant", content="Answer 1")

    result = export_transcript(session_id=session_id, format="markdown")

    assert result["filename"] == f"chat-transcript-{session_id}.md"
    assert result["format"] == "markdown"
    assert result["media_type"] == "text/markdown"
    assert result["message_count"] == 2
    assert "# Chat Transcript: Stored Session" in result["content"]
    assert "Question 1" in result["content"]
    assert "Answer 1" in result["content"]


def test_export_transcript_from_custom_messages():
    messages = [
        {"role": "user", "content": "Direct message test"},
    ]

    result = export_transcript(
        messages=messages,
        format="json",
        title="Direct Export",
    )

    assert result["filename"] == "chat-transcript-export.json"
    assert result["format"] == "json"
    assert result["media_type"] == "application/json"
    assert result["message_count"] == 1

    parsed = json.loads(result["content"])
    assert parsed["title"] == "Direct Export"
    assert parsed["messages"][0]["content"] == "Direct message test"


def test_export_transcript_invalid_format_raises():
    with pytest.raises(ValueError, match="Unsupported format"):
        export_transcript(messages=[], format="pdf")


def test_export_transcript_missing_session_raises():
    with pytest.raises(ValueError, match="Session not found"):
        export_transcript(session_id="nonexistent-sess-xyz")
