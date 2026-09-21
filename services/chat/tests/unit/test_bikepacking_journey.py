import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_bikepacking_journey():
    """Multi-step API journey test for Wilderness Bikepacking & Route Outfitting:

    Step 1: Query bikepacking routes with terrain filter (GET /api/bikepacking/routes).
    Step 2: Query specific route detail (GET /api/bikepacking/routes/oregon-outback).
    Step 3: Post to rig calculation endpoint (POST /api/bikepacking/rig-calc).
    Step 4: Query mandatory gear checklist (GET /api/bikepacking/gear-checklist).
    Step 5: Post chat query to create_response and verify bikepacking_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event bikepacking_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query bikepacking routes with terrain filter
        # -------------------------------------------------------------------------
        res1 = client.get("/api/bikepacking/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "cross-washington-xwa" in route_ids
        assert "oregon-outback" in route_ids
        assert "great-divide-montana" in route_ids
        assert "olympic-adventure-trail-loop" in route_ids
        assert "cascade-hut-to-hut-gravel" in route_ids

        # Filter by terrain
        res1_terrain = client.get("/api/bikepacking/routes?terrain=gravel_fire_road")
        assert res1_terrain.status_code == 200
        gravel_routes = res1_terrain.json()
        assert len(gravel_routes) == 1
        assert gravel_routes[0]["route_id"] == "oregon-outback"

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail (GET /api/bikepacking/routes/{route_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/bikepacking/routes/oregon-outback")
        assert res2.status_code == 200
        outback = res2.json()
        assert outback["route_id"] == "oregon-outback"
        assert outback["name"] == "Oregon Outback Gravel Epic"
        assert outback["distance_miles"] == 364.0
        assert outback["elevation_gain_ft"] == 14500
        assert outback["recommended_tire_width_mm"] == 45
        assert outback["typical_days"] == 4
        assert outback["water_carry_liters"] == 4.0
        assert len(outback["highlights"]) >= 4

        # 404 for unknown route
        res2_404 = client.get("/api/bikepacking/routes/unknown-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to rig calculation endpoint (POST /api/bikepacking/rig-calc)
        # -------------------------------------------------------------------------
        rig_req = {
            "route_id": "oregon-outback",
            "trip_duration_days": 3,
            "shelter_type": "bikepacking_tent",
            "rider_weight_lbs": 165.0,
        }
        res3 = client.post("/api/bikepacking/rig-calc", json=rig_req)
        assert res3.status_code == 200
        rig_data = res3.json()
        assert rig_data["route_id"] == "oregon-outback"
        assert rig_data["front_tire_psi"] == 32.0
        assert rig_data["rear_tire_psi"] == 35.0
        assert rig_data["frame_bag_liters"] == 8.0
        assert rig_data["seat_pack_liters"] == 10.0
        assert rig_data["handlebar_roll_liters"] == 14.0
        assert rig_data["total_bag_capacity_liters"] == 32.0
        assert rig_data["total_gear_weight_lbs"] == 26.0
        assert rig_data["daily_calories_kcal"] == 5019
        assert rig_data["daily_water_liters"] == 4.0
        assert len(rig_data["mechanical_spares"]) >= 5

        # 404 for invalid route
        res3_404 = client.post("/api/bikepacking/rig-calc", json={"route_id": "invalid-route"})
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory gear checklist (GET /api/bikepacking/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/bikepacking/gear-checklist")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "multi-tool" in gear_ids
        assert "tubeless-plugs" in gear_ids
        assert "derailleur-hanger-link" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify bikepacking_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What tire pressure and bag capacity do I need for my bikepacking rig on the Oregon Outback?",
            "customer_id": "cust-bike-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "bikepacking_info" in data5
        bp_info = data5["bikepacking_info"]
        assert bp_info is not None
        assert bp_info["route_id"] == "oregon-outback"
        assert "Oregon Outback" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What tire pressure and bag capacity do I need for my bikepacking rig on the Oregon Outback?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        bp_event = next((e for e in parsed_events if e.get("event") == "bikepacking_info"), None)
        assert bp_event is not None
        assert "bikepacking_info" in bp_event
        stream_bp_info = bp_event["bikepacking_info"]
        assert stream_bp_info is not None
        assert stream_bp_info["route_id"] == "oregon-outback"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Oregon Outback" in full_text


@pytest.mark.anyio
async def test_bikepacking_journey_real_mode_execution():
    """Step 7: Verifies bikepacking prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Jordan", "membership": "Gold", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="For the Oregon Outback bikepacking route, run 32 PSI front and 35 PSI rear with a 32L total bag setup."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What tire pressure and bag capacity do I need for my bikepacking rig on the Oregon Outback?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "bikepacking_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "bikepacking_prompt" in call_kwargs
        assert "Oregon Outback" in call_kwargs["bikepacking_prompt"]
