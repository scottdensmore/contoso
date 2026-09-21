import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_ice_climbing_journey():
    """Multi-step API journey test for Waterfall Ice Climbing & Anchor Rigging Tooling:

    Step 1: Query ice climbing routes with grade filter (GET /api/ice-climbing/routes).
    Step 2: Query specific route detail (GET /api/ice-climbing/routes/ouray-ice-park-pic-of-the-vic).
    Step 3: Post to rigging plan calculation endpoint (POST /api/ice-climbing/rigging-plan).
    Step 4: Query mandatory ice climbing gear checklist (GET /api/ice-climbing/gear-checklist).
    Step 5: Post chat query to create_response and verify ice_climbing_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event ice_climbing_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query ice climbing routes with grade filter
        # -------------------------------------------------------------------------
        res1 = client.get("/api/ice-climbing/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "ouray-ice-park-pic-of-the-vic" in route_ids
        assert "hyalite-canyon-genesis-ii" in route_ids
        assert "canmore-weeping-wall-lower" in route_ids
        assert "lake-willoughby-promised-land" in route_ids
        assert "vail-amphitheater-fang" in route_ids

        # Filter by grade
        res1_grade = client.get("/api/ice-climbing/routes?grade=wi4_advanced")
        assert res1_grade.status_code == 200
        wi4_routes = res1_grade.json()
        assert len(wi4_routes) == 2
        wi4_ids = [r["route_id"] for r in wi4_routes]
        assert "hyalite-canyon-genesis-ii" in wi4_ids
        assert "canmore-weeping-wall-lower" in wi4_ids

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail (GET /api/ice-climbing/routes/{route_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/ice-climbing/routes/ouray-ice-park-pic-of-the-vic")
        assert res2.status_code == 200
        route = res2.json()
        assert route["route_id"] == "ouray-ice-park-pic-of-the-vic"
        assert "Pic of the Vic" in route["title"]
        assert route["ice_grade"] == "wi3_intermediate"
        assert route["ice_structure"] == "plastic_water_ice"
        assert route["elevation_m"] == 2400
        assert route["typical_duration_hours"] == 2.5
        assert route["v_thread_anchor_standard"] is True
        assert len(route["highlights"]) == 3

        # 404 for unknown route
        res2_404 = client.get("/api/ice-climbing/routes/unknown-ice-climbing-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to rigging plan calculation endpoint (POST /api/ice-climbing/rigging-plan)
        # -------------------------------------------------------------------------
        rigging_req = {
            "route_id": "ouray-ice-park-pic-of-the-vic",
            "ice_temperature_f": 20.0,
            "ice_thickness_cm": 25.0,
            "screw_length_cm": 16,
            "screw_placement_angle_deg": 100,
            "anchor_type": "v_thread_abalakov",
        }
        res3 = client.post("/api/ice-climbing/rigging-plan", json=rigging_req)
        assert res3.status_code == 200
        rigging_data = res3.json()
        assert rigging_data["route_id"] == "ouray-ice-park-pic-of-the-vic"
        assert "Pic of the Vic" in rigging_data["route_title"]
        assert rigging_data["v_thread_suitable"] is True
        assert rigging_data["estimated_holding_force_kn"] >= 12.0
        assert len(rigging_data["rigging_recommendation"]) > 20

        # 404 for non-existent route in rigging plan
        res3_404 = client.post(
            "/api/ice-climbing/rigging-plan", json={"route_id": "invalid-ice-route"}
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory ice climbing gear checklist (GET /api/ice-climbing/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/ice-climbing/gear-checklist")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "technical-ice-tools" in gear_ids
        assert "mono-dual-point-crampons" in gear_ids
        assert "ice-screw-rack" in gear_ids
        assert "v-thread-hooker-cord" in gear_ids
        assert "insulated-mountaineering-boots" in gear_ids
        assert "ice-climbing-helmet-visor" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify ice_climbing_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate ice rigging plan and V-thread anchor force for Ouray ice park",
            "customer_id": "cust-ice-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "ice_climbing_info" in data5
        ice_info = data5["ice_climbing_info"]
        assert ice_info is not None
        assert ice_info["action"] == "rigging_plan"
        assert ice_info["plan"]["route_id"] == "ouray-ice-park-pic-of-the-vic"
        assert "Pic of the Vic" in data5["answer"] or "Ouray" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate ice rigging plan and V-thread anchor force for Ouray ice park"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        ice_event = next((e for e in parsed_events if e.get("event") == "ice_climbing_info"), None)
        assert ice_event is not None
        assert "ice_climbing_info" in ice_event
        stream_ice_info = ice_event["ice_climbing_info"]
        assert stream_ice_info is not None
        assert stream_ice_info["action"] == "rigging_plan"
        assert stream_ice_info["plan"]["route_id"] == "ouray-ice-park-pic-of-the-vic"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Pic of the Vic" in full_text or "Ouray" in full_text


@pytest.mark.anyio
async def test_ice_climbing_journey_real_mode_execution():
    """Step 7: Verifies ice climbing prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alex", "membership": "Gold", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Ouray Ice Park offers world-class farmed waterfall ice climbing."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate ice rigging plan and V-thread anchor force for Ouray ice park"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "ice_climbing_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "ice_climbing_prompt" in call_kwargs
        assert "Ouray" in call_kwargs["ice_climbing_prompt"]
