import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_avalanche_safety_journey():
    """Multi-step API journey test for Backcountry Avalanche Safety & Snowpack Assessment Tooling:

    Step 1: Query forecast zones (GET /api/avalanche/zones) and verify zone count.
    Step 2: Query specific zone (GET /api/avalanche/zones/stevens-pass) and inspect danger ratings and problems.
    Step 3: Run slope evaluation (POST /api/avalanche/slope-eval) with 37° slope angle and verify prime avalanche terrain.
    Step 4: Retrieve companion rescue protocol (GET /api/avalanche/rescue-protocol).
    Step 5: Test chat query via create_response verifying avalanche_info metadata.
    Step 6: Test SSE streaming via create_response_stream asserting avalanche_info event.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query forecast zones (GET /api/avalanche/zones)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/avalanche/zones")
        assert res1.status_code == 200
        zones = res1.json()
        assert len(zones) == 5
        zone_ids = [z["zone_id"] for z in zones]
        assert "stevens-pass" in zone_ids
        assert "snoqualmie-pass" in zone_ids
        assert "mount-baker" in zone_ids
        assert "mount-rainier" in zone_ids
        assert "olympics" in zone_ids

        # Query with zone_id filter
        res1_filter = client.get("/api/avalanche/zones?zone_id=stevens-pass")
        assert res1_filter.status_code == 200
        filtered = res1_filter.json()
        assert len(filtered) == 1
        assert filtered[0]["zone_id"] == "stevens-pass"

        # -------------------------------------------------------------------------
        # Step 2: Query specific zone (GET /api/avalanche/zones/stevens-pass)
        # -------------------------------------------------------------------------
        res2 = client.get("/api/avalanche/zones/stevens-pass")
        assert res2.status_code == 200
        stevens = res2.json()
        assert stevens["zone_id"] == "stevens-pass"
        assert stevens["name"] == "Stevens Pass / Cascade Crest"
        assert stevens["region"] == "Central Cascades"
        assert stevens["overall_danger"] == 3
        assert stevens["danger_ratings"]["above_treeline"] == 3
        assert stevens["danger_ratings"]["near_treeline"] == 3
        assert stevens["danger_ratings"]["below_treeline"] == 2
        assert len(stevens["problems"]) > 0
        prob = stevens["problems"][0]
        assert "problem_type" in prob
        assert "likelihood" in prob
        assert "expected_size" in prob
        assert "aspects" in prob
        assert "elevations" in prob
        assert "travel_advice" in prob

        # Check 404 for unknown zone
        assert client.get("/api/avalanche/zones/unknown-pass-999").status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run slope evaluation (POST /api/avalanche/slope-eval)
        # -------------------------------------------------------------------------
        # Prime avalanche terrain (37°)
        eval_payload = {
            "zone_id": "stevens-pass",
            "slope_angle_deg": 37.0,
            "elevation_band": "near_treeline",
            "aspect": "NE",
        }
        res3 = client.post("/api/avalanche/slope-eval", json=eval_payload)
        assert res3.status_code == 200
        eval_data = res3.json()
        assert eval_data["zone_id"] == "stevens-pass"
        assert eval_data["slope_risk_category"] == "prime_avalanche_terrain"
        assert eval_data["is_in_avalanche_terrain"] is True
        assert eval_data["danger_level"] == 3
        assert len(eval_data["recommendation"]) > 0
        assert len(eval_data["advisory"]) > 0
        assert len(eval_data["safety_protocols"]) > 0

        # Low angle safe (< 30°)
        res3_low = client.post(
            "/api/avalanche/slope-eval",
            json={"zone_id": "stevens-pass", "slope_angle_deg": 25.0, "elevation_band": "below_treeline", "aspect": "S"},
        )
        assert res3_low.status_code == 200
        assert res3_low.json()["slope_risk_category"] == "low_angle_safe"
        assert res3_low.json()["is_in_avalanche_terrain"] is False

        # 404 for non-existent zone
        res3_404 = client.post(
            "/api/avalanche/slope-eval",
            json={"zone_id": "non-existent-zone", "slope_angle_deg": 35.0},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve companion rescue protocol (GET /api/avalanche/rescue-protocol)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/avalanche/rescue-protocol")
        assert res4.status_code == 200
        proto_data = res4.json()
        assert "title" in proto_data
        assert "steps" in proto_data
        assert "required_gear" in proto_data

        # -------------------------------------------------------------------------
        # Step 5: Test chat query via create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the avalanche forecast and slope safety at Stevens Pass?",
            "customer_id": "cust-avy-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "avalanche_info" in data5
        avy_info = data5["avalanche_info"]
        assert avy_info is not None
        assert "action" in avy_info
        assert "Stevens Pass" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response_stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={"question": "What is the avalanche forecast and slope safety at Stevens Pass?"},
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        avy_event = next((e for e in parsed_events if e.get("event") == "avalanche_info"), None)
        assert avy_event is not None
        assert "avalanche_info" in avy_event
        stream_avy_info = avy_event["avalanche_info"]
        assert stream_avy_info is not None
        assert "action" in stream_avy_info

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Stevens Pass" in full_text


@pytest.mark.anyio
async def test_avalanche_journey_real_mode_execution():
    """Verifies avalanche prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Alex", "membership": "Platinum", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(
            return_value="Stevens Pass has a Considerable (Level 3) avalanche danger above and near treeline."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "What is the avalanche forecast and danger rating for Stevens Pass?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "avalanche_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "avalanche_prompt" in call_kwargs
        assert "Avalanche" in call_kwargs["avalanche_prompt"]
        assert "Stevens Pass" in call_kwargs["avalanche_prompt"]
