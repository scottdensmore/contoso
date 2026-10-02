import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_slickrock_burro_journey():
    """Multi-step API journey test for Wilderness High-Desert Dry Wash Pack-Burro & Slickrock Packing Expedition Logistics:

    Step 1: Check health and status endpoints (/health, /healthz, /ready, /api/status).
    Step 2: Query /slickrock-burro/routes and /api/slickrock-burro/routes with filters, plus single route and 404 on invalid route.
    Step 3: Post /slickrock-burro/calculate and /api/slickrock-burro/calculate (nominal, critical, and 404 on invalid route).
    Step 4: Query /slickrock-burro/gear and /api/slickrock-burro/gear verifying 6 mandatory gear items.
    Step 5: Chat create_response for slickrock burro inquiries (gear, calculation, route detail).
    Step 6: Chat create_response/stream verifying SSE tokens and custom events (slickrock_burro_calculated, slickrock_burro_lookup, slickrock_burro_info).
    """
    # -------------------------------------------------------------------------
    # Step 1: Health & Status checks
    # -------------------------------------------------------------------------
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_healthz = client.get("/healthz")
    assert res_healthz.status_code == 200

    res_ready = client.get("/ready")
    assert res_ready.status_code == 200

    res_status = client.get("/api/status")
    assert res_status.status_code == 200
    status_data = res_status.json()
    assert status_data["status"] == "online"
    assert "model_provider" in status_data

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 2: Query slickrock burro catalog & single route lookup
        # -------------------------------------------------------------------------
        res_routes = client.get("/slickrock-burro/routes")
        assert res_routes.status_code == 200
        routes = res_routes.json()
        assert len(routes) == 5
        route_ids = [r["id"] for r in routes]
        assert "san-rafael-swell-chute-canyon" in route_ids
        assert "grand-gulch-cedar-mesa-canyon" in route_ids
        assert "death-valley-cottonwood-marble" in route_ids
        assert "escalante-river-baker-canyon" in route_ids
        assert "big-bend-mesa-de-anguila" in route_ids

        # Test prefixed route /api/slickrock-burro/routes
        res_api_routes = client.get("/api/slickrock-burro/routes")
        assert res_api_routes.status_code == 200
        assert len(res_api_routes.json()) == 5

        # Filter by terrain=slickrock_dry_wash
        res_slickrock = client.get("/slickrock-burro/routes?terrain=slickrock_dry_wash")
        assert res_slickrock.status_code == 200
        sr_data = res_slickrock.json()
        assert len(sr_data) == 2
        sr_ids = [r["id"] for r in sr_data]
        assert "san-rafael-swell-chute-canyon" in sr_ids
        assert "big-bend-mesa-de-anguila" in sr_ids

        # Filter by terrain=deep_alluvial_sand
        res_sand = client.get("/api/slickrock-burro/routes?terrain=deep_alluvial_sand")
        assert res_sand.status_code == 200
        sand_data = res_sand.json()
        assert len(sand_data) == 1
        assert sand_data[0]["id"] == "escalante-river-baker-canyon"

        # Query single route details
        res_single = client.get("/slickrock-burro/routes/san-rafael-swell-chute-canyon")
        assert res_single.status_code == 200
        single_route = res_single.json()
        assert single_route["id"] == "san-rafael-swell-chute-canyon"
        assert single_route["route_id"] == "san-rafael-swell-chute-canyon"
        assert "Chute Canyon" in single_route["title"]
        assert single_route["trail_distance_km"] == 24.5
        assert single_route["canyon_terrain"] == "slickrock_dry_wash"
        assert single_route["water_availability"] == "intermittent_tinaja_pockets"
        assert len(single_route["highlights"]) == 3

        # Prefixed single route lookup /api/slickrock-burro/routes/san-rafael-swell-chute-canyon
        res_api_single = client.get("/api/slickrock-burro/routes/san-rafael-swell-chute-canyon")
        assert res_api_single.status_code == 200
        assert res_api_single.json()["id"] == "san-rafael-swell-chute-canyon"

        # 404 for unknown route
        res_404 = client.get("/slickrock-burro/routes/unknown-canyon-wash")
        assert res_404.status_code == 404

        res_api_404 = client.get("/api/slickrock-burro/routes/unknown-canyon-wash")
        assert res_api_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Burro Dynamics Calculation
        # -------------------------------------------------------------------------
        calc_payload_nominal = {
            "route_id": "san-rafael-swell-chute-canyon",
            "terrain": "slickrock_dry_wash",
            "water_source": "intermittent_tinaja_pockets",
            "hoof_protection": "neoprene_trail_boots",
            "burro_count": 2,
            "ambient_peak_temp_c": 20.0,
            "daily_trek_km": 8.0,
            "cargo_weight_kg_per_burro": 25.0,
            "pannier_weight_delta_kg": 0.5,
        }
        res_calc_nom = client.post("/slickrock-burro/calculate", json=calc_payload_nominal)
        assert res_calc_nom.status_code == 200
        nom_res = res_calc_nom.json()
        assert nom_res["route_id"] == "san-rafael-swell-chute-canyon"
        assert nom_res["triage_status"] == "optimal_conditioned_trek"
        assert nom_res["daily_water_requirement_liters"] == 22.4
        assert "OPTIMAL TREK RIGGING" in nom_res["pack_balance_advisory"]
        assert "STANDARD WATER PROTOCOL" in nom_res["desert_trek_water_protocol"]

        # Prefixed route /api/slickrock-burro/calculate
        res_api_calc = client.post("/api/slickrock-burro/calculate", json=calc_payload_nominal)
        assert res_api_calc.status_code == 200
        assert res_api_calc.json()["route_id"] == "san-rafael-swell-chute-canyon"

        # Critical calculation with extreme ambient temperature
        calc_payload_crit = {
            "route_id": "death-valley-cottonwood-marble",
            "terrain": "limestone_scree_bench",
            "water_source": "sparse_alkali_seeps",
            "hoof_protection": "steel_shod_cleats",
            "burro_count": 2,
            "ambient_peak_temp_c": 42.0,
            "daily_trek_km": 28.0,
            "cargo_weight_kg_per_burro": 50.0,
            "pannier_weight_delta_kg": 4.5,
        }
        res_calc_crit = client.post("/slickrock-burro/calculate", json=calc_payload_crit)
        assert res_calc_crit.status_code == 200
        crit_res = res_calc_crit.json()
        assert crit_res["triage_status"] == "critical_overload_dehydration_hazard"
        assert crit_res["daily_water_requirement_liters"] >= 35.0
        assert "CRITICAL OVERLOAD HAZARD" in crit_res["pack_balance_advisory"]
        assert "EMERGENCY DESERT WATER PROTOCOL" in crit_res["desert_trek_water_protocol"]

        # 404 for invalid route
        res_calc_404 = client.post(
            "/slickrock-burro/calculate", json={"route_id": "unknown-desert-wash"}
        )
        assert res_calc_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Slickrock Burro Gear Checklist
        # -------------------------------------------------------------------------
        res_gear = client.get("/slickrock-burro/gear")
        assert res_gear.status_code == 200
        gear_items = res_gear.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["item_id"] for g in gear_items]
        assert "sawbuck-pack-saddle-rig" in gear_ids
        assert "heavy-duty-canvas-panniers" in gear_ids
        assert "collapsible-desert-water-bladder" in gear_ids
        assert "protective-equine-trail-boots" in gear_ids
        assert "hoof-pick-and-rasp-kit" in gear_ids
        assert "desert-night-hobble-tether" in gear_ids

        # Prefixed gear endpoint /api/slickrock-burro/gear
        res_api_gear = client.get("/api/slickrock-burro/gear")
        assert res_api_gear.status_code == 200
        assert len(res_api_gear.json()) == 6

        # -------------------------------------------------------------------------
        # Step 5: Chat create_response for slickrock burro inquiries
        # -------------------------------------------------------------------------
        # 5a. Gear inquiry via /api/create_response
        chat_req_gear = {
            "question": "What mandatory equipment and sawbuck saddle gear do I need for slickrock burro packing?",
        }
        res5_gear = client.post("/api/create_response", json=chat_req_gear)
        assert res5_gear.status_code == 200
        gear_ans = res5_gear.json()
        assert "slickrock_burro_info" in gear_ans
        sb_gear_info = gear_ans["slickrock_burro_info"]
        assert sb_gear_info is not None
        assert sb_gear_info["action"] == "gear_checklist"
        assert sb_gear_info["mandatory_count"] == 6

        # 5b. Calculation inquiry via /api/create_response
        chat_req_calc = {
            "question": "Calculate burro hydration requirement and slickrock slip risk for Chute Canyon",
        }
        res5_calc = client.post("/api/create_response", json=chat_req_calc)
        assert res5_calc.status_code == 200
        calc_ans = res5_calc.json()
        assert "slickrock_burro_info" in calc_ans
        sb_calc_info = calc_ans["slickrock_burro_info"]
        assert sb_calc_info is not None
        assert sb_calc_info["action"] == "calculate"
        assert "daily_water_requirement_liters" in sb_calc_info
        assert "hoof_slickrock_slip_risk_index" in sb_calc_info
        assert "pannier_balance_score" in sb_calc_info

        # Also test via /api/chat
        res5_chat = client.post("/api/chat", json=chat_req_gear)
        assert res5_chat.status_code == 200
        assert "slickrock_burro_info" in res5_chat.json()

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response/stream SSE events
        # -------------------------------------------------------------------------
        # 6a. Test calculation custom event via /chat/stream
        stream_req_calc = {
            "question": "Calculate burro hydration dynamics and pannier balance for Grand Gulch Cedar Mesa",
        }
        res6_calc = client.post("/chat/stream", json=stream_req_calc)
        assert res6_calc.status_code == 200
        raw_chunks = [c.strip() for c in res6_calc.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        calc_event = next(
            (e for e in parsed_events if e.get("event") == "slickrock_burro_calculated"),
            None,
        )
        assert calc_event is not None
        assert "slickrock_burro_info" in calc_event
        assert calc_event["slickrock_burro_info"]["action"] == "calculate"

        info_event = next(
            (e for e in parsed_events if e.get("event") == "slickrock_burro_info"),
            None,
        )
        assert info_event is not None
        assert "slickrock_burro_info" in info_event

        token_events = [
            e
            for e in parsed_events
            if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0

        # 6b. Test lookup custom event via /api/create_response/stream
        stream_req_lookup = {
            "question": "Tell me about Escalante River Baker Canyon burro route details",
        }
        res6_lookup = client.post(
            "/api/create_response/stream", json=stream_req_lookup
        )
        assert res6_lookup.status_code == 200
        raw_chunks_lookup = [
            c.strip() for c in res6_lookup.text.split("\n\n") if c.strip()
        ]
        assert "data: [DONE]" in raw_chunks_lookup

        parsed_lookup = []
        for line in raw_chunks_lookup:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_lookup.append(json.loads(line.removeprefix("data: ")))

        lookup_event = next(
            (e for e in parsed_lookup if e.get("event") == "slickrock_burro_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "slickrock_burro_info" in lookup_event


@pytest.mark.anyio
async def test_slickrock_burro_journey_real_mode_execution():
    """Step 7: Verifies slickrock burro prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Sierra",
                    "membership": "Summit",
                    "orders": [],
                }
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="In San Rafael Swell Chute Canyon, pack burros require careful hydration planning and neoprene trail boots."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the burro hydration protocol and pack rigging for Chute Canyon?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "slickrock_burro_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "slickrock_burro_prompt" in call_kwargs
        prompt_content = call_kwargs["slickrock_burro_prompt"].lower()
        assert (
            "burro" in prompt_content
            or "slickrock" in prompt_content
            or "hydration" in prompt_content
            or "sawbuck" in prompt_content
        )
