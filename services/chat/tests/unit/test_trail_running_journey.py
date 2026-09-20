import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_trail_running_journey():
    """Multi-step API journey test for Mountain Ultra Outfitting & Pacing Tooling:

    Step 1: Query routes list (GET /api/trail-running/routes).
    Step 2: Query specific route detail (GET /api/trail-running/routes/timberline-trail-ultra).
    Step 3: Calculate pacing & nutrition (POST /api/trail-running/pacing-calc).
    Step 4: Retrieve mandatory gear requirements (GET /api/trail-running/mandatory-gear).
    Step 5: Test chat query via create_response verifying trail_running_info metadata.
    Step 6: Test SSE streaming via create_response_stream asserting trail_running_info event.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query routes list (GET /api/trail-running/routes)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/trail-running/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        r_ids = [r["route_id"] for r in routes]
        assert "enchantments-thru-run" in r_ids
        assert "timberline-trail-ultra" in r_ids
        assert "wonderland-trail-fastpack" in r_ids
        assert "si-mailbox-vertical-double" in r_ids
        assert "olympic-coast-wilderness-run" in r_ids

        # Filter by difficulty
        res1_diff = client.get("/api/trail-running/routes?difficulty=expert")
        assert res1_diff.status_code == 200
        expert_routes = res1_diff.json()
        assert len(expert_routes) >= 2
        assert all(r["technical_difficulty"] == "expert" for r in expert_routes)

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail (GET /api/trail-running/routes/timberline-trail-ultra)
        # -------------------------------------------------------------------------
        res2 = client.get("/api/trail-running/routes/timberline-trail-ultra")
        assert res2.status_code == 200
        timberline = res2.json()
        assert timberline["route_id"] == "timberline-trail-ultra"
        assert timberline["name"] == "Timberline Trail Ultra"
        assert "Hood" in timberline["region"] or "Mount Hood" in timberline["region"]
        assert timberline["distance_miles"] == 41.5
        assert timberline["elevation_gain_ft"] == 9000
        assert timberline["elevation_loss_ft"] == 9000
        assert timberline["technical_difficulty"] == "advanced"
        assert timberline["terrain"]
        assert timberline["refill_points"] >= 4
        assert timberline["estimated_fast_time_hrs"] > 0
        assert timberline["recommended_drop_mm"]
        assert timberline["lug_depth_mm"]
        assert timberline["description"]

        # 404 for unknown route
        res2_404 = client.get("/api/trail-running/routes/unknown-ultra-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Calculate pacing & nutrition (POST /api/trail-running/pacing-calc)
        # -------------------------------------------------------------------------
        pacing_payload = {
            "route_id": "timberline-trail-ultra",
            "target_pace_min_mile": 12.0,
            "runner_weight_lbs": 150.0,
            "ambient_temp_f": 65.0,
        }
        res3 = client.post("/api/trail-running/pacing-calc", json=pacing_payload)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["route_id"] == "timberline-trail-ultra"
        assert "Timberline" in calc_data["route_name"]
        assert calc_data["estimated_time_hours"] > 0
        assert calc_data["total_calories_kcal"] > 0
        assert calc_data["hourly_carbs_grams"] >= 40
        assert calc_data["fluid_liters_total"] > 0
        assert calc_data["electrolytes_mg_hourly"] >= 300
        assert calc_data["hydration_vest_min_capacity_l"] >= 5.0
        assert len(calc_data["pacing_splits"]) >= 3

        # 404 for non-existent route in pacing calc
        res3_404 = client.post(
            "/api/trail-running/pacing-calc",
            json={"route_id": "unknown-ultra-trail"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve mandatory gear requirements (GET /api/trail-running/mandatory-gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/trail-running/mandatory-gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        item_ids = {g["item_id"] for g in gear}
        expected_items = {
            "hydration-vest",
            "emergency-bivy",
            "microspikes",
            "waterproof-shell",
            "headlamp",
            "filtration-flask",
        }
        assert item_ids == expected_items
        for item in gear:
            assert item["item_id"]
            assert item["name"]
            assert item["mandatory"] is True
            assert item["category"]
            assert item["purpose"]

        # -------------------------------------------------------------------------
        # Step 5: Test chat query via create_response verifying trail_running_info metadata
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the ultra pacing and nutrition plan for the Timberline Trail ultra run?",
            "customer_id": "cust-runner-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "trail_running_info" in data5
        tr_info = data5["trail_running_info"]
        assert tr_info is not None
        assert "timberline" in str(tr_info).lower() or tr_info.get("route_id") == "timberline-trail-ultra"
        assert "Timberline" in data5["answer"] or "pace" in data5["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response_stream asserting trail_running_info event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What is the ultra pacing and nutrition plan for the Timberline Trail ultra run?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        tr_event = next((e for e in parsed_events if e.get("event") == "trail_running_info"), None)
        assert tr_event is not None
        assert "trail_running_info" in tr_event
        stream_tr_info = tr_event["trail_running_info"]
        assert stream_tr_info is not None
        assert "timberline" in str(stream_tr_info).lower()

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "timberline" in full_text.lower() or "pace" in full_text.lower() or "calories" in full_text.lower()


@pytest.mark.anyio
async def test_trail_running_journey_real_mode_execution():
    """Step 7: Verifies trail running prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Kilior", "membership": "Platinum", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(
            return_value="For the Timberline Trail Ultra, plan on 10.5 hours of pacing with 65g carbs/hour and mandatory microspikes."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the recommended ultra pacing and caloric fueling for the Timberline Trail ultra run?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "trail_running_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "trail_running_prompt" in call_kwargs
        assert "Timberline" in call_kwargs["trail_running_prompt"]
