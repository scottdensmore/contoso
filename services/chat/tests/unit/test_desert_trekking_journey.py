import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_desert_trekking_journey():
    """Multi-step API journey test for Desert Trekking & Water Cache Tooling:

    Step 1: Query desert routes with optional aridity zone filter (GET /api/desert-trekking/routes).
    Step 2: Query specific route detail (GET /api/desert-trekking/routes/badwater-telescope-peak-traverse).
    Step 3: Post to hydration plan calculation endpoint (POST /api/desert-trekking/hydration-plan).
    Step 4: Query mandatory desert trekking gear checklist (GET /api/desert-trekking/gear-checklist).
    Step 5: Post chat query to create_response and verify desert_trekking_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event desert_trekking_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query desert routes with optional aridity zone filter
        # -------------------------------------------------------------------------
        res1 = client.get("/api/desert-trekking/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "badwater-telescope-peak-traverse" in route_ids
        assert "hayduke-buckskin-gulch-paria" in route_ids
        assert "mazatzal-wilderness-divide-trail" in route_ids
        assert "black-rock-desert-playa-crossing" in route_ids
        assert "chihuahuan-mariscal-canyon-rim" in route_ids

        # Filter by aridity zone
        res1_zone = client.get("/api/desert-trekking/routes?zone=hyper_arid_salt_playa")
        assert res1_zone.status_code == 200
        zone_routes = res1_zone.json()
        assert len(zone_routes) == 2
        zone_ids = [r["route_id"] for r in zone_routes]
        assert "badwater-telescope-peak-traverse" in zone_ids
        assert "black-rock-desert-playa-crossing" in zone_ids

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail (GET /api/desert-trekking/routes/{route_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/desert-trekking/routes/badwater-telescope-peak-traverse")
        assert res2.status_code == 200
        route = res2.json()
        assert route["route_id"] == "badwater-telescope-peak-traverse"
        assert "Badwater" in route["title"]
        assert route["region"] == "Inyo County, CA"
        assert route["distance_km"] == 48.0
        assert route["elevation_gain_m"] == 3450
        assert route["aridity_zone"] == "hyper_arid_salt_playa"
        assert route["water_sources_count"] == 1
        assert route["water_cache_required"] is True
        assert route["flash_flood_risk"] == "low"
        assert len(route["highlights"]) >= 3

        # 404 for unknown route
        res2_404 = client.get("/api/desert-trekking/routes/unknown-desert-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to hydration plan calculation endpoint (POST /api/desert-trekking/hydration-plan)
        # -------------------------------------------------------------------------
        hydration_req = {
            "route_id": "badwater-telescope-peak-traverse",
            "ambient_temperature_f": 95.0,
            "relative_humidity_pct": 15.0,
            "hiker_weight_kg": 75.0,
            "pack_weight_kg": 15.0,
            "trekking_pace_km_h": 3.5,
            "hours_in_direct_sun": 6.0,
            "shade_umbrella_used": False,
        }
        res3 = client.post("/api/desert-trekking/hydration-plan", json=hydration_req)
        assert res3.status_code == 200
        plan_data = res3.json()
        assert plan_data["route_id"] == "badwater-telescope-peak-traverse"
        assert "Badwater" in plan_data["route_title"]
        assert plan_data["aridity_zone"] == "hyper_arid_salt_playa"
        assert plan_data["felt_heat_index_f"] >= 90.0
        assert plan_data["hourly_sweat_rate_liters"] > 0.8
        assert plan_data["total_water_needed_liters"] >= 6.0
        assert plan_data["electrolyte_dose_mg"] >= 3500
        assert len(plan_data["siesta_hours_advisory"]) > 10
        assert len(plan_data["caching_notice"]) > 10

        # 404 for non-existent route in hydration plan
        res3_404 = client.post(
            "/api/desert-trekking/hydration-plan",
            json={"route_id": "non-existent-desert-route"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory desert trekking gear checklist (GET /api/desert-trekking/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/desert-trekking/gear-checklist")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "wide-brim-sun-sombrero-cape" in gear_ids
        assert "electrolytes-fluid-reservoir-system" in gear_ids
        assert "uv-blocking-ultralight-sun-umbrella" in gear_ids
        assert "emergency-desert-bivvy-tarp" in gear_ids
        assert "satellite-sos-inreach-messenger" in gear_ids
        assert "high-vis-desert-signal-mirror" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify desert_trekking_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate desert sweat rate and hydration plan for badwater",
            "customer_id": "cust-desert-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "desert_trekking_info" in data5
        d_info = data5["desert_trekking_info"]
        assert d_info is not None
        assert d_info["action"] == "hydration_plan"
        assert d_info["plan"]["route_id"] == "badwater-telescope-peak-traverse"
        assert "Badwater" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate desert sweat rate and hydration plan for badwater"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        desert_event = next(
            (e for e in parsed_events if e.get("event") == "desert_trekking_info"), None
        )
        assert desert_event is not None
        assert "desert_trekking_info" in desert_event
        stream_d_info = desert_event["desert_trekking_info"]
        assert stream_d_info is not None
        assert stream_d_info["action"] == "hydration_plan"
        assert stream_d_info["plan"]["route_id"] == "badwater-telescope-peak-traverse"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Badwater" in full_text


@pytest.mark.anyio
async def test_desert_trekking_journey_real_mode_execution():
    """Step 7: Verifies desert trekking prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alex", "membership": "Platinum", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Badwater to Telescope Peak low-to-high traverse demands pre-trip water caching and strict sweat rate hydration management."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate desert sweat rate and hydration plan for badwater"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "desert_trekking_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "desert_trekking_prompt" in call_kwargs
        assert "Badwater" in call_kwargs["desert_trekking_prompt"]
