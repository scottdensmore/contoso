import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_highline_journey():
    """Multi-step API journey test for Alpine Highline & Slackline Rigging Tooling:

    Step 1: Query highline spans (GET /api/highline/spans) and filter by difficulty.
    Step 2: Query specific span detail (GET /api/highline/spans/{span_id}) and 404 for unknown.
    Step 3: Run rigging calculation (POST /api/highline/calculate-rigging) with varying parameters and 404 on unknown.
    Step 4: Query mandatory gear checklist (GET /api/highline/gear) asserting 6 mandatory items.
    Step 5: Test create_response non-streaming with highline inquiry verifying highline_info metadata.
    Step 6: Test create_response/stream SSE streaming events for highline actions.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query spans list (GET /api/highline/spans)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/highline/spans")
        assert res1.status_code == 200
        spans = res1.json()
        assert len(spans) == 5
        span_ids = [s["span_id"] for s in spans]
        assert "yosemite-taft-point-highline" in span_ids
        assert "moab-fruit-bowl-canyon" in span_ids
        assert "smith-rock-monkey-face-highline" in span_ids
        assert "castle-valley-rectory-span" in span_ids
        assert "index-town-walls-practice-highline" in span_ids

        # Filter by difficulty
        res1_diff = client.get("/api/highline/spans?difficulty=beginner")
        assert res1_diff.status_code == 200
        beginner_spans = res1_diff.json()
        assert len(beginner_spans) == 1
        assert beginner_spans[0]["span_id"] == "index-town-walls-practice-highline"

        res1_expert = client.get("/api/highline/spans?difficulty=expert")
        assert res1_expert.status_code == 200
        expert_spans = res1_expert.json()
        assert len(expert_spans) == 2

        # -------------------------------------------------------------------------
        # Step 2: Query specific span detail (GET /api/highline/spans/{span_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/highline/spans/yosemite-taft-point-highline")
        assert res2.status_code == 200
        taft = res2.json()
        assert taft["span_id"] == "yosemite-taft-point-highline"
        assert "Taft Point" in taft["title"]
        assert taft["region"] == "Yosemite National Park, CA"
        assert taft["span_length_m"] == 65.0
        assert taft["void_exposure_m"] == 850.0
        assert taft["difficulty"] == "expert"
        assert len(taft["highlights"]) >= 3

        # 404 for unknown span
        res2_404 = client.get("/api/highline/spans/unknown-highline-id")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run rigging calculation (POST /api/highline/calculate-rigging)
        # -------------------------------------------------------------------------
        calc_payload = {
            "span_id": "yosemite-taft-point-highline",
            "walker_weight_kg": 75.0,
            "standing_sag_percent": 6.0,
            "dynamic_load_factor": 1.8,
            "anchor_angle_degrees": 45.0,
        }
        res3 = client.post("/api/highline/calculate-rigging", json=calc_payload)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["span_id"] == "yosemite-taft-point-highline"
        assert calc_data["center_sag_m"] == 3.9
        assert 5.0 <= calc_data["line_tension_kn"] <= 6.0
        assert 2.5 <= calc_data["anchor_leg_load_kn"] <= 3.5
        assert calc_data["webbing_safety_factor"] >= 5.0
        assert calc_data["safety_status"] == "safe"
        assert calc_data["rigging_advisory"]

        # Varying parameters: severe anchor angle (120 degrees)
        calc_severe = {
            "span_id": "moab-fruit-bowl-canyon",
            "walker_weight_kg": 80.0,
            "standing_sag_percent": 5.0,
            "dynamic_load_factor": 2.0,
            "anchor_angle_degrees": 120.0,
        }
        res3_severe = client.post("/api/highline/calculate-rigging", json=calc_severe)
        assert res3_severe.status_code == 200
        severe_data = res3_severe.json()
        assert severe_data["span_id"] == "moab-fruit-bowl-canyon"
        assert severe_data["safety_status"] in ("caution", "critical_hazard")
        assert "angle" in severe_data["rigging_advisory"].lower()

        # 404 on unknown span
        res3_404 = client.post(
            "/api/highline/calculate-rigging",
            json={"span_id": "non-existent-span"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory highline gear (GET /api/highline/gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/highline/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["item_id"] for g in gear]
        assert "highline-leash-dual-rings" in gear_ids
        assert "independent-backup-webbing" in gear_ids
        assert "weblock-anchor-devices" in gear_ids
        assert "buckingham-pulley-system" in gear_ids
        assert "heavy-duty-edge-pads" in gear_ids
        assert "wind-dampener-wind-sock" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test create_response non-streaming with highline inquiry
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the mandatory alpine highline gear checklist?",
            "customer_id": "cust-highline-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "highline_info" in data5
        h_info = data5["highline_info"]
        assert h_info is not None
        assert h_info.get("action") == "gear_checklist"
        assert "weblock" in data5["answer"].lower() or "gear" in data5["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 6: Test create_response/stream SSE events with highline questions
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate webbing sag, line tension, and anchor equalization for Taft Point highline"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        highline_event = next(
            (e for e in parsed_events if e.get("event") in ("highline_rigging", "highline_info")),
            None,
        )
        assert highline_event is not None
        assert "highline_info" in highline_event or "highline_rigging" in highline_event


@pytest.mark.anyio
async def test_highline_journey_real_mode_execution():
    """Step 7: Verifies highline prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(return_value={"firstName": "Alex", "membership": "Gold", "orders": []}),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Taft Point Highline in Yosemite spans 65m across an 850m vertical abyss."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={"question": "Calculate webbing sag and line tension for Taft Point highline"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "highline_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "highline_prompt" in call_kwargs
        assert "Taft Point" in call_kwargs["highline_prompt"]
