import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_carrier_tracking_journey():
    """
    End-to-end API journey test for live carrier tracking & shipment milestones:
    Step 1: Direct carrier REST inquiry GET /api/tracking/CTSO-TRK-DEMO123 returns 200 with all milestone details.
    Step 2: Inquire via chat POST /api/create_response asking 'Where is my shipment CTSO-TRK-DEMO123?'
            verifying response includes carrier_tracking payload with ordered milestones and carrier details.
    Step 3: Stream chat response via POST /api/create_response/stream
            verifying event: carrier_tracking frame is emitted in the SSE stream.
    Step 4: Negative lookup GET /api/tracking/UNKNOWN-99999 returns 404 cleanly.
    Step 5: Chat query with invalid tracking number handles gracefully without crash.
    """
    # -------------------------------------------------------------------------
    # Step 1: Direct carrier REST inquiry GET /api/tracking/CTSO-TRK-DEMO123
    # -------------------------------------------------------------------------
    rest_res = client.get("/api/tracking/CTSO-TRK-DEMO123")
    assert rest_res.status_code == 200
    tracking_data = rest_res.json()

    assert tracking_data["tracking_number"] == "CTSO-TRK-DEMO123"
    assert tracking_data["carrier"] in ["FedEx Ground", "UPS Ground"]
    assert "status" in tracking_data
    assert "current_location" in tracking_data
    assert "estimated_delivery" in tracking_data
    assert "service_level" in tracking_data
    assert "milestones" in tracking_data
    assert isinstance(tracking_data["milestones"], list)
    assert len(tracking_data["milestones"]) in [4, 5]

    milestones = tracking_data["milestones"]
    milestone_ids = [m["milestone_id"] for m in milestones]
    assert "order_confirmed" in milestone_ids
    assert "processing" in milestone_ids
    assert "carrier_pickup" in milestone_ids
    assert "in_transit" in milestone_ids

    # Verify milestone sequence and required details
    first_ms = milestones[0]
    assert first_ms["milestone_id"] == "order_confirmed"
    assert "Order Confirmed & Payment Processed" in first_ms["description"]
    assert "Distribution Center, Seattle WA" in first_ms["location"]
    assert first_ms["status"] == "completed"

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 2: Inquire via chat POST /api/create_response
        # -------------------------------------------------------------------------
        chat_res = client.post(
            "/api/create_response",
            json={"question": "Where is my shipment CTSO-TRK-DEMO123?"},
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()

        assert "answer" in chat_data
        assert "carrier_tracking" in chat_data
        carrier_tracking = chat_data["carrier_tracking"]
        assert carrier_tracking is not None
        assert carrier_tracking["tracking_number"] == "CTSO-TRK-DEMO123"
        assert carrier_tracking["carrier"] in ["FedEx Ground", "UPS Ground"]
        assert isinstance(carrier_tracking["milestones"], list)
        assert len(carrier_tracking["milestones"]) >= 4

        # Milestones are sequentially ordered
        chat_milestone_ids = [m["milestone_id"] for m in carrier_tracking["milestones"]]
        assert chat_milestone_ids[:4] == [
            "order_confirmed",
            "processing",
            "carrier_pickup",
            "in_transit",
        ]

        # -------------------------------------------------------------------------
        # Step 3: Stream chat response via POST /api/create_response/stream
        # -------------------------------------------------------------------------
        stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "Where is my shipment CTSO-TRK-DEMO123?"},
        )
        assert stream_res.status_code == 200
        assert "text/event-stream" in stream_res.headers.get("content-type", "")

        lines = stream_res.text.strip().split("\n\n")
        events = []
        for line in lines:
            if line.startswith("data: ") and line != "data: [DONE]":
                try:
                    events.append(json.loads(line[6:]))
                except json.JSONDecodeError:
                    pass

        carrier_events = [e for e in events if e.get("event") == "carrier_tracking"]
        assert len(carrier_events) >= 1
        event_payload = carrier_events[0]["carrier_tracking"]
        assert event_payload["tracking_number"] == "CTSO-TRK-DEMO123"
        assert event_payload["carrier"] in ["FedEx Ground", "UPS Ground"]
        assert len(event_payload["milestones"]) >= 4

    # -------------------------------------------------------------------------
    # Step 4: Negative lookup GET /api/tracking/UNKNOWN-99999 returns 404 cleanly
    # -------------------------------------------------------------------------
    neg_res = client.get("/api/tracking/UNKNOWN-99999")
    assert neg_res.status_code == 404
    neg_detail = neg_res.json().get("detail", "")
    assert "Tracking information not found for identifier: UNKNOWN-99999" in neg_detail

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 5: Chat query with invalid tracking number handles gracefully
        # -------------------------------------------------------------------------
        invalid_chat_res = client.post(
            "/api/create_response",
            json={"question": "Where is my shipment UNKNOWN-99999?"},
        )
        assert invalid_chat_res.status_code == 200
        invalid_chat_data = invalid_chat_res.json()
        assert "answer" in invalid_chat_data
        # Should not crash and should indicate not found or handle gracefully
        assert not invalid_chat_data.get("carrier_tracking")

        # Also test stream handles invalid tracking number gracefully
        invalid_stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "Where is my shipment UNKNOWN-99999?"},
        )
        assert invalid_stream_res.status_code == 200
        assert "text/event-stream" in invalid_stream_res.headers.get("content-type", "")


@pytest.mark.anyio
async def test_carrier_tracking_real_chat_pipeline():
    """Verify carrier tracking in real pipeline mode when LLM is invoked."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Alex", "membership": "Gold", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="Your package CTSO-TRK-DEMO123 is currently in transit with FedEx Ground."),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "Where is my shipment CTSO-TRK-DEMO123?"},
        )
        assert res.status_code == 200
        data = res.json()

        assert "carrier_tracking" in data
        assert data["carrier_tracking"]["tracking_number"] == "CTSO-TRK-DEMO123"
        assert "FedEx Ground" in data["answer"]

        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "carrier_tracking_prompt" in call_kwargs
        assert "CTSO-TRK-DEMO123" in call_kwargs["carrier_tracking_prompt"]


@pytest.mark.anyio
async def test_carrier_tracking_real_stream_pipeline():
    """Verify carrier tracking SSE event frame in real streaming pipeline."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    async def fake_stream(*args, **kwargs):
        yield "data: " + json.dumps({"event": "status", "status": "searching_catalog", "message": "Searching..."}) + "\n\n"
        yield "data: " + json.dumps({"event": "citations", "citations": []}) + "\n\n"
        yield "data: " + json.dumps({"event": "handoff", "handoff": {"requested": False}}) + "\n\n"
        yield "data: " + json.dumps({"event": "profile", "profile": {"membership": "Gold", "past_purchases_count": 0}}) + "\n\n"
        info = {
            "order_id": "CTSO-DEMO123",
            "carrier": "FedEx Ground",
            "tracking_number": "CTSO-TRK-DEMO123",
            "status": "Shipped",
            "estimated_delivery": "In 2 business days",
            "current_location": "Transit Hub, Portland OR",
            "service_level": "Standard Ground",
            "milestones": [],
        }
        yield "data: " + json.dumps({"event": "carrier_tracking", "carrier_tracking": info}) + "\n\n"
        yield "data: " + json.dumps({"chunk": "Your package is in transit."}) + "\n\n"

    with patch(
        "main.get_response_stream",
        side_effect=fake_stream,
    ), patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Where is my shipment CTSO-TRK-DEMO123?"},
        )
        assert res.status_code == 200
        assert "text/event-stream" in res.headers.get("content-type", "")
        lines = res.text.strip().split("\n\n")
        events = [
            json.loads(line[6:])
            for line in lines
            if line.startswith("data: ") and line != "data: [DONE]"
        ]
        carrier_events = [e for e in events if e.get("event") == "carrier_tracking"]
        assert len(carrier_events) == 1
        assert carrier_events[0]["carrier_tracking"]["tracking_number"] == "CTSO-TRK-DEMO123"
