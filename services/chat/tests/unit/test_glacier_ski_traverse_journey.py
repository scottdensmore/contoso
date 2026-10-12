import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_glacier_ski_traverse_journey():
    """Multi-step API journey test for Alpine Crevasse Glacier Ski-Traverse & Serac Zone Descent Logistics:

    Step 1: Check health and status endpoints (/health, /healthz, /ready, /api/status).
    Step 2: Query /glacier-ski-traverse/sites and /api/glacier-ski-traverse/sites with filters, plus single site and 404 on invalid site.
    Step 3: Post /glacier-ski-traverse/calculate and /api/glacier-ski-traverse/calculate (nominal, critical, and 404 on invalid site).
    Step 4: Query /glacier-ski-traverse/gear and /api/glacier-ski-traverse/gear verifying 6 mandatory gear items.
    Step 5: Chat create_response for glacier ski traverse inquiries (gear, calculation, site detail).
    Step 6: Chat create_response/stream verifying SSE tokens and custom events (glacier_ski_traverse_calculated, glacier_ski_traverse_lookup, glacier_ski_traverse_info).
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
        # Step 2: Query glacier ski traverse catalog & single site lookup
        # -------------------------------------------------------------------------
        res_sites = client.get("/glacier-ski-traverse/sites")
        assert res_sites.status_code == 200
        sites = res_sites.json()
        assert len(sites) == 5
        site_ids = [s["id"] for s in sites]
        assert "haute-route-chamonix-zermatt" in site_ids
        assert "spearhead-traverse-whistler" in site_ids
        assert "wapta-traverse-canadian-rockies" in site_ids
        assert "berner-oberland-ski-traverse" in site_ids
        assert "wrangell-st-elias-bagley-icefield" in site_ids

        # Test prefixed route /api/glacier-ski-traverse/sites
        res_api_sites = client.get("/api/glacier-ski-traverse/sites")
        assert res_api_sites.status_code == 200
        assert len(res_api_sites.json()) == 5

        # Filter by zone=compressed_icefall_serac_corridor
        res_serac = client.get("/glacier-ski-traverse/sites?zone=compressed_icefall_serac_corridor")
        assert res_serac.status_code == 200
        serac_data = res_serac.json()
        assert len(serac_data) == 1
        assert serac_data[0]["id"] == "berner-oberland-ski-traverse"

        # Filter by zone=crevasse_lattice_transition_zone
        res_crev = client.get("/api/glacier-ski-traverse/sites?zone=crevasse_lattice_transition_zone")
        assert res_crev.status_code == 200
        crev_data = res_crev.json()
        assert len(crev_data) == 1
        assert crev_data[0]["id"] == "haute-route-chamonix-zermatt"

        # Query single site details
        res_single = client.get("/glacier-ski-traverse/sites/haute-route-chamonix-zermatt")
        assert res_single.status_code == 200
        single_site = res_single.json()
        assert single_site["id"] == "haute-route-chamonix-zermatt"
        assert single_site["site_id"] == "haute-route-chamonix-zermatt"
        assert "Haute Route" in single_site["title"]
        assert single_site["elevation_meters"] == 3790.0
        assert single_site["dominant_zone"] == "crevasse_lattice_transition_zone"
        assert len(single_site["highlights"]) >= 3

        # Prefixed single site lookup
        res_api_single = client.get("/api/glacier-ski-traverse/sites/spearhead-traverse-whistler")
        assert res_api_single.status_code == 200
        assert res_api_single.json()["id"] == "spearhead-traverse-whistler"

        # 404 for unknown site
        res_404 = client.get("/glacier-ski-traverse/sites/unknown-traverse-site")
        assert res_404.status_code == 404

        res_api_404 = client.get("/api/glacier-ski-traverse/sites/unknown-traverse-site")
        assert res_api_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Glacier Ski Traverse Dynamics Calculation
        # -------------------------------------------------------------------------
        calc_payload_nominal = {
            "site_id": "haute-route-chamonix-zermatt",
            "terrain_zone": "crevasse_lattice_transition_zone",
            "bridge_stability": "settled_spring_firn_bridge",
            "travelers_count": 3,
            "pack_weight_kg": 14.0,
            "ski_width_waist_mm": 95.0,
            "slope_angle_degrees": 28.0,
            "ambient_temperature_c": -4.0,
        }
        res_calc_nom = client.post("/glacier-ski-traverse/calculate", json=calc_payload_nominal)
        assert res_calc_nom.status_code == 200
        nom_res = res_calc_nom.json()
        assert nom_res["site_id"] == "haute-route-chamonix-zermatt"
        assert 3.5 <= nom_res["bridge_ground_pressure_kpa"] <= 18.0
        assert 0.0 <= nom_res["crevasse_bridge_failure_risk"] <= 1.0
        assert nom_res["recommended_rope_spacing_meters"] >= 10
        assert "glacier traverse rope" in nom_res["rope_travel_advisory"]

        # Prefixed route /api/glacier-ski-traverse/calculate
        res_api_calc = client.post("/api/glacier-ski-traverse/calculate", json=calc_payload_nominal)
        assert res_api_calc.status_code == 200
        assert res_api_calc.json()["site_id"] == "haute-route-chamonix-zermatt"

        # Critical calculation with extreme dynamic icefall collapse
        calc_payload_crit = {
            "site_id": "berner-oberland-ski-traverse",
            "terrain_zone": "compressed_icefall_serac_corridor",
            "bridge_stability": "honeycombed_thermal_ablation_bridge",
            "travelers_count": 6,
            "pack_weight_kg": 35.0,
            "ski_width_waist_mm": 75.0,
            "slope_angle_degrees": 48.0,
            "ambient_temperature_c": 6.0,
        }
        res_calc_crit = client.post("/glacier-ski-traverse/calculate", json=calc_payload_crit)
        assert res_calc_crit.status_code == 200
        crit_res = res_calc_crit.json()
        assert crit_res["hazard_level"] == "extreme_dynamic_icefall_collapse"
        assert "Emergency Drop-Loop 6:1 Pulley System" in crit_res["emergency_ski_rescue_protocol"]

        # 404 for invalid site
        res_calc_404 = client.post(
            "/glacier-ski-traverse/calculate", json={"site_id": "unknown-glacier-traverse"}
        )
        assert res_calc_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Glacier Ski Traverse Gear Checklist
        # -------------------------------------------------------------------------
        res_gear = client.get("/glacier-ski-traverse/gear")
        assert res_gear.status_code == 200
        gear_items = res_gear.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["item_id"] for g in gear_items]
        assert "glacier-skimo-harness-with-ski-slots" in gear_ids
        assert "lightweight-hyperstatic-crevasse-rescue-cord" in gear_ids
        assert "ultra-compact-ski-crevasse-pulley-progress-capture" in gear_ids
        assert "titanium-tech-ski-crampons-ski-mountaineering" in gear_ids
        assert "ski-tail-anchor-snow-picket-system" in gear_ids
        assert "collapsible-avalanche-crevasse-probe-320cm" in gear_ids

        # Prefixed gear endpoint /api/glacier-ski-traverse/gear
        res_api_gear = client.get("/api/glacier-ski-traverse/gear")
        assert res_api_gear.status_code == 200
        assert len(res_api_gear.json()) == 6

        # -------------------------------------------------------------------------
        # Step 5: Chat create_response for glacier ski traverse inquiries
        # -------------------------------------------------------------------------
        # 5a. Gear inquiry via /api/create_response
        chat_req_gear = {
            "question": "What mandatory equipment, skimo harness, and 320cm probe do I need for glacier ski traverse?",
        }
        res5_gear = client.post("/api/create_response", json=chat_req_gear)
        assert res5_gear.status_code == 200
        gear_ans = res5_gear.json()
        assert "glacier_ski_traverse_info" in gear_ans
        gst_gear_info = gear_ans["glacier_ski_traverse_info"]
        assert gst_gear_info is not None
        assert gst_gear_info["action"] == "gear_checklist"
        assert gst_gear_info["mandatory_count"] == 6

        # 5b. Calculation inquiry via /api/create_response
        chat_req_calc = {
            "question": "Calculate glacier ski traverse bridge ground pressure and serac exposure for Haute Route Chamonix to Zermatt",
        }
        res5_calc = client.post("/api/create_response", json=chat_req_calc)
        assert res5_calc.status_code == 200
        calc_ans = res5_calc.json()
        assert "glacier_ski_traverse_info" in calc_ans
        gst_calc_info = calc_ans["glacier_ski_traverse_info"]
        assert gst_calc_info is not None
        assert gst_calc_info["action"] == "calculate"
        assert "bridge_ground_pressure_kpa" in gst_calc_info
        assert "crevasse_bridge_failure_risk" in gst_calc_info

        # 5c. Site inquiry via /api/create_response
        chat_req_site = {
            "question": "Tell me about details of the Spearhead traverse glacier ski route",
        }
        res5_site = client.post("/api/create_response", json=chat_req_site)
        assert res5_site.status_code == 200
        site_ans = res5_site.json()
        assert "glacier_ski_traverse_info" in site_ans
        gst_site_info = site_ans["glacier_ski_traverse_info"]
        assert gst_site_info is not None
        assert gst_site_info["action"] == "get_site"
        assert gst_site_info["site_id"] == "spearhead-traverse-whistler"

        # Also test via /api/chat
        res5_chat = client.post("/api/chat", json=chat_req_gear)
        assert res5_chat.status_code == 200
        assert "glacier_ski_traverse_info" in res5_chat.json()

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response/stream SSE events
        # -------------------------------------------------------------------------
        # 6a. Test calculation custom event via /chat/stream
        stream_req_calc = {
            "question": "Calculate glacier ski traverse bridge ground pressure and serac exposure dynamics for Bernese Oberland",
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
            (e for e in parsed_events if e.get("event") == "glacier_ski_traverse_calculated"),
            None,
        )
        assert calc_event is not None
        assert "glacier_ski_traverse_info" in calc_event
        assert calc_event["glacier_ski_traverse_info"]["action"] == "calculate"

        info_event = next(
            (e for e in parsed_events if e.get("event") == "glacier_ski_traverse_info"),
            None,
        )
        assert info_event is not None
        assert "glacier_ski_traverse_info" in info_event

        token_events = [
            e
            for e in parsed_events
            if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0

        # 6b. Test lookup custom event via /api/create_response/stream
        stream_req_lookup = {
            "question": "Tell me about Wapta traverse glacier ski route details and serac hazards",
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
            (e for e in parsed_lookup if e.get("event") == "glacier_ski_traverse_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "glacier_ski_traverse_info" in lookup_event


@pytest.mark.anyio
async def test_glacier_ski_traverse_journey_real_mode_execution():
    """Step 7: Verifies glacier ski traverse prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Rowan",
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
                return_value="On the Haute Route glacier ski traverse, rope travel and brake knots prevent crevasse fall injuries."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the glacier ski traverse rope spacing and rescue protocol for Haute Route?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "glacier_ski_traverse_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "glacier_ski_traverse_prompt" in call_kwargs
        prompt_content = call_kwargs["glacier_ski_traverse_prompt"].lower()
        assert (
            "glacier" in prompt_content
            or "ski-traverse" in prompt_content
            or "serac" in prompt_content
            or "crevasse" in prompt_content
        )
