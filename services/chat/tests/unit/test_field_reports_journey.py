import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_field_reports_journey():
    """End-to-end API journey test for Trail Field Conditions & Hazard Intent Tooling:

    Step 1: Query GET /api/reports/feed and verify reports catalog, conditions, snow depths, and parking status.
    Step 2: Query GET /api/reports/alerts and verify active hazard alerts and severities.
    Step 3: Call POST /api/create_response with "What are the latest trail conditions for Mount Si and Skyline Trail?"
            and assert field_reports_info and detailed response answer.
    Step 4: Stream POST /api/create_response/stream with "Are there any hazards or trail warnings for The Enchantments?"
            and verify SSE event: 'field_reports_info' frame, token chunks, and data: [DONE].
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query GET /api/reports/feed
        # Verify reports catalog, conditions, snow depths, and parking status
        # -------------------------------------------------------------------------
        feed_res = client.get("/api/reports/feed")
        assert feed_res.status_code == 200
        reports = feed_res.json()
        assert isinstance(reports, list)
        assert len(reports) == 5

        report_map = {r["trail_name"]: r for r in reports}
        assert "Mount Si" in report_map
        si = report_map["Mount Si"]
        assert si["snow_depth_inches"] == 0
        assert "Dry" in si["condition"] or "Clear" in si["condition"]
        assert "parking_status" in si and len(si["parking_status"]) > 0

        assert "Skyline Trail" in report_map
        skyline = report_map["Skyline Trail"]
        assert skyline["snow_depth_inches"] == 24
        assert "Snow" in skyline["condition"] or "Icy" in skyline["condition"]
        assert "Paradise" in skyline["parking_status"] or len(skyline["parking_status"]) > 0

        assert "Enchantments Core" in report_map
        ench = report_map["Enchantments Core"]
        assert ench["snow_depth_inches"] == 12
        assert "parking_status" in ench

        assert "Lake 22" in report_map
        l22 = report_map["Lake 22"]
        assert "Muddy" in l22["condition"] or "Wet" in l22["condition"]
        assert l22["snow_depth_inches"] == 2

        assert "Angel's Landing" in report_map
        angels = report_map["Angel's Landing"]
        assert angels["snow_depth_inches"] == 0
        assert "parking_status" in angels

        # Verify query filters
        si_filter_res = client.get("/api/reports/feed?trail_name=Mount+Si")
        assert si_filter_res.status_code == 200
        si_filtered = si_filter_res.json()
        assert len(si_filtered) == 1
        assert si_filtered[0]["trail_name"] == "Mount Si"

        muddy_filter_res = client.get("/api/reports/feed?condition=Muddy")
        assert muddy_filter_res.status_code == 200
        muddy_filtered = muddy_filter_res.json()
        assert len(muddy_filtered) >= 1
        assert all("muddy" in r["condition"].lower() for r in muddy_filtered)

        # -------------------------------------------------------------------------
        # Step 2: Query GET /api/reports/alerts
        # Verify active hazard alerts and severities
        # -------------------------------------------------------------------------
        alerts_res = client.get("/api/reports/alerts")
        assert alerts_res.status_code == 200
        alerts = alerts_res.json()
        assert isinstance(alerts, list)
        assert len(alerts) == 3

        severities = {a["severity"] for a in alerts}
        assert "Caution" in severities or "Warning" in severities or "Severe" in severities

        alert_map = {a["alert_id"]: a for a in alerts}
        assert any("enchantment" in aid.lower() for aid in alert_map)
        assert any("angel" in aid.lower() for aid in alert_map)
        assert any("rainier" in aid.lower() for aid in alert_map)

        # Filter alerts by trail_name
        ench_alerts_res = client.get("/api/reports/alerts?trail_name=Enchantments")
        assert ench_alerts_res.status_code == 200
        ench_alerts = ench_alerts_res.json()
        assert len(ench_alerts) == 1
        assert "snow bridge" in ench_alerts[0]["hazard_type"].lower() or "snow" in ench_alerts[0]["hazard_type"].lower()

        # -------------------------------------------------------------------------
        # Step 3: Call POST /api/create_response with
        # "What are the latest trail conditions for Mount Si and Skyline Trail?"
        # Assert field_reports_info and detailed response answer
        # -------------------------------------------------------------------------
        chat_res = client.post(
            "/api/create_response",
            json={"question": "What are the latest trail conditions for Mount Si and Skyline Trail?"},
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert "field_reports_info" in chat_data
        fr_info = chat_data["field_reports_info"]
        assert fr_info["action"] == "conditions"
        assert len(fr_info["reports"]) >= 2

        answer = chat_data["answer"]
        assert "Mount Si" in answer
        assert "Skyline Trail" in answer
        assert "snow" in answer.lower() or "condition" in answer.lower()

        # -------------------------------------------------------------------------
        # Step 4: Stream POST /api/create_response/stream with
        # "Are there any hazards or trail warnings for The Enchantments?"
        # Verify SSE event: 'field_reports_info' frame, token chunks, and data: [DONE]
        # -------------------------------------------------------------------------
        stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "Are there any hazards or trail warnings for The Enchantments?"},
        )
        assert stream_res.status_code == 200
        stream_text = stream_res.text
        assert "data: [DONE]" in stream_text

        events = []
        for block in stream_text.split("\n\n"):
            stripped = block.strip()
            if not stripped:
                continue
            if stripped == "data: [DONE]":
                events.append({"event": "done"})
                continue
            if stripped.startswith("data: "):
                try:
                    events.append(json.loads(stripped.removeprefix("data: ")))
                except json.JSONDecodeError:
                    pass

        # Verify SSE event: 'field_reports_info' frame
        fr_event = next((e for e in events if e.get("event") == "field_reports_info"), None)
        assert fr_event is not None
        assert "field_reports_info" in fr_event
        fr_payload = fr_event["field_reports_info"]
        assert fr_payload["action"] == "alerts"
        assert fr_payload["hazard_only"] is True
        assert len(fr_payload["alerts"]) >= 1

        # Verify token chunks exist
        chunk_events = [e for e in events if "chunk" in e]
        assert len(chunk_events) > 0
        streamed_answer = "".join(c["chunk"] for c in chunk_events)
        assert "Enchantment" in streamed_answer or "snow bridge" in streamed_answer.lower()


@pytest.mark.anyio
async def test_field_reports_journey_real_mode_execution():
    """Verifies field reports prompt injection and response payload in real mode execution."""
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
        new=AsyncMock(
            return_value="Mount Si has dry conditions with ample parking, while Skyline Trail has 24 inches of snowpack."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "What are the latest trail conditions for Mount Si and Skyline Trail?"},
        )
        assert res.status_code == 200
        data = res.json()

        assert "field_reports_info" in data
        assert data["field_reports_info"]["action"] == "conditions"

        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "field_reports_prompt" in call_kwargs
        assert "Community Trail Field Reports" in call_kwargs["field_reports_prompt"]
        assert "Mount Si" in call_kwargs["field_reports_prompt"]
        assert "Skyline Trail" in call_kwargs["field_reports_prompt"]
