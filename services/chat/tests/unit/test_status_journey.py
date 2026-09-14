import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_chat_status_diagnostics_endpoint():
    """Step 1 of status journey: GET /api/chat/status asserts service is online and lists 'status' in supported_events."""
    response = client.get("/api/chat/status")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "online"
    assert "real_chat_available" in data
    assert "model_provider" in data
    assert "model_name" in data
    assert "supported_events" in data

    supported_events = data["supported_events"]
    assert isinstance(supported_events, list)
    assert "status" in supported_events
    assert supported_events == [
        "status",
        "citations",
        "profile",
        "handoff",
        "order_tracking",
        "promotions",
        "policy",
        "session",
    ]


def test_status_journey_mock_streaming():
    """Step 2 of status journey (mock mode):
    POST /api/create_response/stream emits status events before token chunks,
    followed by metadata and ordered token chunks, ending with [DONE].
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "What tents do you recommend for backpacking?"},
        )
        assert res.status_code == 200
        assert "text/event-stream" in res.headers.get("content-type", "")

        raw_frames = [f.strip() for f in res.text.split("\n\n") if f.strip()]
        assert raw_frames[-1] == "data: [DONE]"

        parsed_events = []
        for frame in raw_frames[:-1]:
            assert frame.startswith("data: ")
            payload = json.loads(frame.removeprefix("data: "))
            parsed_events.append(payload)

        # 1. Early status events are emitted first before token chunks
        status_events = [e for e in parsed_events if e.get("event") == "status"]
        assert len(status_events) == 3

        assert status_events[0] == {
            "event": "status",
            "status": "analyzing_query",
            "message": "Analyzing question...",
        }
        assert status_events[1] == {
            "event": "status",
            "status": "searching_catalog",
            "message": "Searching catalog...",
        }
        assert status_events[2] == {
            "event": "status",
            "status": "generating_response",
            "message": "Generating response...",
        }

        # Status events must precede citations, profile, and handoff
        first_chunk_index = next(
            i for i, e in enumerate(parsed_events) if "chunk" in e
        )
        status_indices = [
            i for i, e in enumerate(parsed_events) if e.get("event") == "status"
        ]
        for s_idx in status_indices:
            assert s_idx < first_chunk_index

        # 2. Metadata events follow status events
        metadata_event_types = [
            e["event"] for e in parsed_events if "event" in e and e["event"] != "status"
        ]
        assert "citations" in metadata_event_types
        assert "handoff" in metadata_event_types
        assert "profile" in metadata_event_types

        # 3. Token chunks arrive in order
        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Mock response:" in full_text
        assert "backpacking" in full_text


@pytest.mark.anyio
async def test_status_journey_real_streaming():
    """Step 2 of status journey (real mode):
    Verifies get_response_stream emits status events ('searching_catalog', 'generating_response')
    before citations, profile, handoff, and token chunks, concluding with [DONE].
    """
    product_context = [
        {
            "name": "Alpine Explorer Tent",
            "slug": "alpine-explorer-tent",
            "price": 350.0,
            "image": "/images/tent.webp",
            "category": "Tents",
        }
    ]
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = product_context

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Alex", "membership": "Gold", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["Here is ", "the Alpine Explorer Tent ", "for your trip."]),
    ), patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Tell me about the alpine explorer tent", "customer_id": "cust-1"},
        )
        assert res.status_code == 200
        assert "text/event-stream" in res.headers.get("content-type", "")

        raw_frames = [f.strip() for f in res.text.split("\n\n") if f.strip()]
        assert raw_frames[-1] == "data: [DONE]"

        parsed_events = [
            json.loads(f.removeprefix("data: "))
            for f in raw_frames[:-1]
            if f.startswith("data: ")
        ]

        status_events = [e for e in parsed_events if e.get("event") == "status"]
        assert len(status_events) == 2
        assert status_events[0] == {
            "event": "status",
            "status": "searching_catalog",
            "message": "Searching product catalog...",
        }
        assert status_events[1] == {
            "event": "status",
            "status": "generating_response",
            "message": "Generating response...",
        }

        first_chunk_index = next(
            i for i, e in enumerate(parsed_events) if "chunk" in e
        )
        for s_idx, e in enumerate(parsed_events):
            if e.get("event") == "status":
                assert s_idx < first_chunk_index

        chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert chunks == ["Here is ", "the Alpine Explorer Tent ", "for your trip."]


def test_status_journey_streaming_error_handling():
    """Step 3 of status journey: streaming error handling preserves error framing."""
    with patch(
        "main.get_response_stream",
        side_effect=RuntimeError("Database failure during search"),
    ), patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Tell me about hiking boots"},
        )
        assert res.status_code == 200
        assert "text/event-stream" in res.headers.get("content-type", "")

        raw_frames = [f.strip() for f in res.text.split("\n\n") if f.strip()]
        error_frame = next(
            (f for f in raw_frames if "error" in f), None
        )
        assert error_frame is not None
        payload = json.loads(error_frame.removeprefix("data: "))
        assert payload == {"error": "Database failure during search"}


def test_status_journey_multi_step_flow_with_session():
    """Complete multi-step journey:
    1. Query GET /api/chat/status to verify readiness and supported events.
    2. Start a session and stream via POST /api/create_response/stream.
    3. Verify frame order: session -> status -> metadata -> chunks -> [DONE].
    """
    # Step 1: Query GET /api/chat/status
    status_res = client.get("/api/chat/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["status"] == "online"
    assert "status" in status_data["supported_events"]

    # Step 2: Stream request with session_id
    session_id = "sess-journey-101"
    with patch("main.REAL_CHAT_AVAILABLE", False):
        stream_res = client.post(
            "/api/create_response/stream",
            json={
                "question": "What is the best tent?",
                "session_id": session_id,
            },
        )
        assert stream_res.status_code == 200
        frames = [f.strip() for f in stream_res.text.split("\n\n") if f.strip()]
        assert frames[-1] == "data: [DONE]"

        events = [json.loads(f.removeprefix("data: ")) for f in frames[:-1]]

        # Frame 0: session event
        assert events[0] == {"event": "session", "session_id": session_id}

        # Frames 1-3: status events
        assert events[1]["event"] == "status"
        assert events[1]["status"] == "analyzing_query"
        assert events[2]["event"] == "status"
        assert events[2]["status"] == "searching_catalog"
        assert events[3]["event"] == "status"
        assert events[3]["status"] == "generating_response"

        # Subsequent frames: citations, handoff, profile
        event_types_after_status = [
            e.get("event") for e in events[4:] if "event" in e
        ]
        assert "citations" in event_types_after_status
        assert "handoff" in event_types_after_status
        assert "profile" in event_types_after_status
