import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_sea_kayaking_journey():
    """Multi-step API journey test for Coastal Sea Kayaking & Marine Expedition Outfitting Tooling:

    Step 1: Query sea kayaking routes with water grade filter (GET /api/sea-kayaking/routes).
    Step 2: Query specific route detail (GET /api/sea-kayaking/routes/san-juan-islands-crossing).
    Step 3: Post to tide plan calculation endpoint (POST /api/sea-kayaking/tide-plan).
    Step 4: Query mandatory coastal gear checklist (GET /api/sea-kayaking/gear-checklist).
    Step 5: Post chat query to create_response and verify sea_kayaking_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event sea_kayaking_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query sea kayaking routes with water grade filter
        # -------------------------------------------------------------------------
        res1 = client.get("/api/sea-kayaking/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "san-juan-islands-crossing" in route_ids
        assert "prince-william-sound-fjords" in route_ids
        assert "maine-island-trail-passage" in route_ids
        assert "apostle-islands-sea-caves" in route_ids
        assert "haida-gwaii-gwaii-haanas" in route_ids

        # Filter by water_grade
        res1_grade = client.get("/api/sea-kayaking/routes?water_grade=grade_iii")
        assert res1_grade.status_code == 200
        grade_iii_routes = res1_grade.json()
        assert len(grade_iii_routes) == 1
        assert grade_iii_routes[0]["route_id"] == "san-juan-islands-crossing"

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail (GET /api/sea-kayaking/routes/{route_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/sea-kayaking/routes/san-juan-islands-crossing")
        assert res2.status_code == 200
        route = res2.json()
        assert route["route_id"] == "san-juan-islands-crossing"
        assert "San Juan" in route["title"]
        assert route["distance_nm"] > 0
        assert route["typical_duration_days"] == 3
        assert route["water_grade"] == "grade_iii"
        assert route["current_risk"] in ("moderate", "high", "extreme")
        assert route["max_current_knots"] > 0
        assert route["open_crossing_miles"] > 0
        assert route["drysuit_mandatory"] is True
        assert len(route["highlights"]) >= 2

        # 404 for unknown route
        res2_404 = client.get("/api/sea-kayaking/routes/unknown-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to tide plan calculation endpoint (POST /api/sea-kayaking/tide-plan)
        # -------------------------------------------------------------------------
        plan_req = {
            "route_id": "san-juan-islands-crossing",
            "paddler_skill_level": "intermediate",
            "current_speed_knots": 2.5,
            "wind_speed_knots": 12.0,
            "crossing_window_hours": 2.0,
        }
        res3 = client.post("/api/sea-kayaking/tide-plan", json=plan_req)
        assert res3.status_code == 200
        plan_data = res3.json()
        assert plan_data["route_id"] == "san-juan-islands-crossing"
        assert "San Juan" in plan_data["route_title"]
        assert plan_data["ferry_angle_degrees"] > 0
        assert plan_data["effective_speed_knots"] > 0
        assert plan_data["drysuit_required"] is True
        assert plan_data["vhf_channel"] == 16
        assert plan_data["crossing_safety_status"] in ("safe", "caution", "optimal")
        assert len(plan_data["safety_advisory"]) > 20

        # 404 for invalid route in tide plan
        res3_404 = client.post(
            "/api/sea-kayaking/tide-plan", json={"route_id": "invalid-route"}
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory coastal gear checklist (GET /api/sea-kayaking/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/sea-kayaking/gear-checklist")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "paddling-drysuit" in gear_ids
        assert "neoprene-spray-skirt" in gear_ids
        assert "paddle-float" in gear_ids
        assert "bilge-pump" in gear_ids
        assert "type-iii-v-pfd" in gear_ids
        assert "marine-vhf-radio" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify sea_kayaking_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate tidal current ferry angle and slack water tide plan for San Juan Islands crossing",
            "customer_id": "cust-kayak-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "sea_kayaking_info" in data5
        sk_info = data5["sea_kayaking_info"]
        assert sk_info is not None
        assert sk_info["action"] == "tide_plan"
        assert sk_info["tide_plan"]["route_id"] == "san-juan-islands-crossing"
        assert "San Juan" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate tidal current ferry angle and slack water tide plan for San Juan Islands crossing"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        sk_event = next((e for e in parsed_events if e.get("event") == "sea_kayaking_info"), None)
        assert sk_event is not None
        assert "sea_kayaking_info" in sk_event
        stream_sk_info = sk_event["sea_kayaking_info"]
        assert stream_sk_info is not None
        assert stream_sk_info["action"] == "tide_plan"
        assert stream_sk_info["tide_plan"]["route_id"] == "san-juan-islands-crossing"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "San Juan" in full_text


@pytest.mark.anyio
async def test_sea_kayaking_journey_real_mode_execution():
    """Step 7: Verifies sea kayaking prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Taylor", "membership": "Platinum", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="For San Juan Islands crossing, plan departure during slack water and maintain a ferry angle to offset Rosario Strait tidal currents."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate tidal current ferry angle and slack water tide plan for San Juan Islands crossing"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "sea_kayaking_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "sea_kayaking_prompt" in call_kwargs
        assert "San Juan Islands" in call_kwargs["sea_kayaking_prompt"]
