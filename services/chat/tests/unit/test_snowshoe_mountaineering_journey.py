import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_snowshoe_mountaineering_journey():
    """Multi-step API journey test for Alpine Snowshoe Mountaineering & Technical Winter Ascent Tooling:

    Step 1: Catalog lookup & grade filtering (GET /snowshoe-mountaineering/routes and /api/snowshoe-mountaineering/routes).
    Step 2: Detail lookup (GET /snowshoe-mountaineering/routes/mount-washington-tuckerman-ridge) & 404 on unknown.
    Step 3: Ascent & slope transition calculation (POST /snowshoe-mountaineering/calculate).
    Step 4: Mandatory winter mountaineering gear checklist (GET /snowshoe-mountaineering/gear).
    Step 5: Conversational chat query through create_response with snowshoe_mountaineering_info metadata.
    Step 6: SSE streaming endpoint create_response/stream asserting snowshoe_mountaineering_info / calculation events.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Catalog lookup & grade filtering
        # -------------------------------------------------------------------------
        res1 = client.get("/snowshoe-mountaineering/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "mount-washington-tuckerman-ridge" in route_ids
        assert "mount-rainier-muir-snowfield" in route_ids
        assert "rocky-mountain-bear-lake-flattop" in route_ids
        assert "mount-shasta-avalanche-gulch" in route_ids
        assert "san-juan-red-mountain-pass" in route_ids

        # Also verify /api/ prefix
        res1_api = client.get("/api/snowshoe-mountaineering/routes")
        assert res1_api.status_code == 200
        assert len(res1_api.json()) == 5

        # Filter by technical_grade
        res1_steep = client.get("/snowshoe-mountaineering/routes?technical_grade=steep_alpine")
        assert res1_steep.status_code == 200
        steep_routes = res1_steep.json()
        assert len(steep_routes) == 2
        steep_ids = [r["route_id"] for r in steep_routes]
        assert "mount-washington-tuckerman-ridge" in steep_ids
        assert "san-juan-red-mountain-pass" in steep_ids

        res1_glaciated = client.get("/snowshoe-mountaineering/routes?technical_grade=glaciated_high_altitude")
        assert res1_glaciated.status_code == 200
        assert len(res1_glaciated.json()) == 1
        assert res1_glaciated.json()[0]["route_id"] == "mount-rainier-muir-snowfield"

        # -------------------------------------------------------------------------
        # Step 2: Detail lookup & 404 on unknown
        # -------------------------------------------------------------------------
        res2 = client.get("/snowshoe-mountaineering/routes/mount-washington-tuckerman-ridge")
        assert res2.status_code == 200
        mw = res2.json()
        assert mw["route_id"] == "mount-washington-tuckerman-ridge"
        assert mw["title"] == "Mount Washington Lion Head Winter Ridge"
        assert mw["mountain_range"] == "White Mountains"
        assert mw["region"] == "NH, USA"
        assert mw["summit_elevation_m"] == 1917
        assert mw["route_length_km"] == 13.5
        assert mw["technical_grade"] == "steep_alpine"
        assert mw["max_slope_deg"] == 38
        assert len(mw["highlights"]) == 3

        # Also verify /api/ prefix
        res2_api = client.get("/api/snowshoe-mountaineering/routes/mount-washington-tuckerman-ridge")
        assert res2_api.status_code == 200
        assert res2_api.json()["route_id"] == "mount-washington-tuckerman-ridge"

        res2_404 = client.get("/snowshoe-mountaineering/routes/unknown-route-xyz")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Ascent & slope transition calculation
        # -------------------------------------------------------------------------
        calc_req = {
            "route_id": "mount-washington-tuckerman-ridge",
            "snowpack": "windslab_crust",
            "slope_angle_deg": 26.0,
            "payload_lbs": 200.0,
            "heel_lifter_engaged": True,
        }
        res3 = client.post("/snowshoe-mountaineering/calculate", json=calc_req)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["route_id"] == "mount-washington-tuckerman-ridge"
        assert calc_data["route_title"] == "Mount Washington Lion Head Winter Ridge"
        assert calc_data["tails_required"] is False
        assert calc_data["flotation_status"] == "Standard Deck Surface Flotation Sufficient"
        assert calc_data["calf_strain_reduction_percent"] == 35
        assert calc_data["traction_status"] == "optimal_snowshoe_ascent"
        assert len(calc_data["advisory"]) > 0

        # Also test with /api/ prefix
        res3_api = client.post("/api/snowshoe-mountaineering/calculate", json=calc_req)
        assert res3_api.status_code == 200
        assert res3_api.json()["route_id"] == "mount-washington-tuckerman-ridge"

        # Deep powder with heavy payload requiring modular flotation tails
        calc_powder = {
            "route_id": "san-juan-red-mountain-pass",
            "snowpack": "deep_powder",
            "slope_angle_deg": 34.0,
            "payload_lbs": 185.0,
            "heel_lifter_engaged": True,
        }
        res3_powder = client.post("/snowshoe-mountaineering/calculate", json=calc_powder)
        assert res3_powder.status_code == 200
        powder_data = res3_powder.json()
        assert powder_data["tails_required"] is True
        assert "Tails Required" in powder_data["flotation_status"]
        assert powder_data["traction_status"] == "caution_steep_edging_required"

        # Hazardous slope transition test (>38 degrees)
        calc_hazard = {
            "route_id": "mount-shasta-avalanche-gulch",
            "snowpack": "windslab_crust",
            "slope_angle_deg": 40.0,
            "payload_lbs": 190.0,
            "heel_lifter_engaged": True,
        }
        res3_hazard = client.post("/snowshoe-mountaineering/calculate", json=calc_hazard)
        assert res3_hazard.status_code == 200
        hazard_data = res3_hazard.json()
        assert hazard_data["traction_status"] == "hazardous_transition_to_crampons_axe"
        assert "transition" in hazard_data["advisory"].lower() or "crampons" in hazard_data["advisory"].lower()

        # Unknown route returns 404
        res3_404 = client.post(
            "/snowshoe-mountaineering/calculate",
            json={"route_id": "unknown-route-123"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Gear checklist via GET /snowshoe-mountaineering/gear
        # -------------------------------------------------------------------------
        res4 = client.get("/snowshoe-mountaineering/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(item["mandatory"] is True for item in gear)
        item_ids = [item["item_id"] for item in gear]
        assert "serrated-side-rail-snowshoes" in item_ids
        assert "modular-flotation-tails" in item_ids
        assert "technical-telescoping-poles" in item_ids
        assert "insulated-gaiters-crampon-shield" in item_ids
        assert "avalanche-safety-trio" in item_ids
        assert "emergency-ice-axe-hybrid" in item_ids

        # Also verify /api/ prefix
        res4_api = client.get("/api/snowshoe-mountaineering/gear")
        assert res4_api.status_code == 200
        assert len(res4_api.json()) == 6

        # -------------------------------------------------------------------------
        # Step 5: Conversational chat query with snowshoe_mountaineering_info metadata
        # -------------------------------------------------------------------------
        chat_req1 = {
            "question": "What is the mandatory snowshoe gear checklist and serrated snowshoe traction?",
            "customer_id": "cust-snowshoe-101",
        }
        res5_1 = client.post("/api/create_response", json=chat_req1)
        assert res5_1.status_code == 200
        data5_1 = res5_1.json()
        assert "snowshoe_mountaineering_info" in data5_1
        assert data5_1["snowshoe_mountaineering_info"]["action"] == "gear_checklist"
        assert len(data5_1["snowshoe_mountaineering_info"]["gear"]) == 6

        chat_req2 = {
            "question": "Calculate snowshoe slope angle limit and Televator heel lifter fatigue reduction for Mount Washington",
            "customer_id": "cust-snowshoe-101",
        }
        res5_2 = client.post("/api/create_response", json=chat_req2)
        assert res5_2.status_code == 200
        data5_2 = res5_2.json()
        assert "snowshoe_mountaineering_info" in data5_2
        assert data5_2["snowshoe_mountaineering_info"]["action"] == "calculate_snowshoe"
        assert "calculation" in data5_2["snowshoe_mountaineering_info"]

        # Also test service path /api/chat/service/create_response
        res5_3 = client.post("/api/chat/service/create_response", json=chat_req2)
        assert res5_3.status_code == 200
        data5_3 = res5_3.json()
        assert "snowshoe_mountaineering_info" in data5_3

        # -------------------------------------------------------------------------
        # Step 6: SSE streaming endpoint create_response/stream asserting events
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate snowshoe slope angle limit and Televator heel lifter fatigue reduction for Mount Washington",
            },
        )
        assert res6_stream.status_code == 200
        sep = chr(10) + chr(10)
        raw_events = [line.strip() for line in res6_stream.text.split(sep) if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        sm_event = next(
            (
                e
                for e in parsed_events
                if e.get("event") in ("snowshoe_mountaineering_calculation", "snowshoe_mountaineering_info")
            ),
            None,
        )
        assert sm_event is not None
        assert "snowshoe_mountaineering_info" in sm_event or "snowshoe_mountaineering_calculation" in sm_event

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert (
            "Mount Washington" in full_text
            or "Snowshoe" in full_text
            or "Traction" in full_text
            or "Flotation" in full_text
        )


@pytest.mark.anyio
async def test_snowshoe_mountaineering_journey_real_mode_execution():
    """Step 7: Verifies snowshoe mountaineering prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Ed", "membership": "Platinum", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Mount Washington Lion Head winter route demands 3D perimeter crampon traction and Televator heel lifters."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Tell me about Mount Washington snowshoe ascent via Lion Head ridge and Televator heel lifter."
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "snowshoe_mountaineering_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "snowshoe_mountaineering_prompt" in call_kwargs
        prompt_val = call_kwargs["snowshoe_mountaineering_prompt"]
        assert (
            "Snowshoe" in prompt_val
            or "Mount Washington" in prompt_val
            or "Televator" in prompt_val
        )
