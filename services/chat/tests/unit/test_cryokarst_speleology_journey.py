import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_cryokarst_speleology_journey():
    """Multi-step API journey test for Alpine Glacial Crevasse Ice Cave Exploration & Cryokarst Speleology:

    Step 1: Check health and status endpoints (/health, /healthz, /ready, /api/status).
    Step 2: Query /cryokarst-speleology/sites and /api/cryokarst-speleology/sites with filters, plus single site and 404 on invalid site.
    Step 3: Post /cryokarst-speleology/calculate and /api/cryokarst-speleology/calculate (nominal, critical, and 404 on invalid site).
    Step 4: Query /cryokarst-speleology/gear and /api/cryokarst-speleology/gear verifying 6 mandatory gear items.
    Step 5: Chat create_response for cryokarst speleology inquiries (gear, calculation, site detail).
    Step 6: Chat create_response/stream verifying SSE tokens and custom events (cryokarst_speleology_calculated, cryokarst_speleology_lookup, cryokarst_speleology_info).
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
        # Step 2: Query cryokarst speleology catalog & single site lookup
        # -------------------------------------------------------------------------
        res_sites = client.get("/cryokarst-speleology/sites")
        assert res_sites.status_code == 200
        sites = res_sites.json()
        assert len(sites) == 5
        site_ids = [s["id"] for s in sites]
        assert "matanuska-glacier-moulin-chamber" in site_ids
        assert "root-glacier-cryokarst-conduit" in site_ids
        assert "athabasca-glacier-crevasse-chasm" in site_ids
        assert "gorner-glacier-zermatt-cryokarst" in site_ids
        assert "palmer-glacier-fumarole-ice-caves" in site_ids

        # Test prefixed route /api/cryokarst-speleology/sites
        res_api_sites = client.get("/api/cryokarst-speleology/sites")
        assert res_api_sites.status_code == 200
        assert len(res_api_sites.json()) == 5

        # Filter by conduit_type=vertical_moulin_shaft
        res_moulin = client.get("/cryokarst-speleology/sites?conduit_type=vertical_moulin_shaft")
        assert res_moulin.status_code == 200
        moulin_data = res_moulin.json()
        assert len(moulin_data) == 1
        assert moulin_data[0]["id"] == "matanuska-glacier-moulin-chamber"

        # Filter by conduit_type=horizontal_subglacial_tunnel
        res_tunnel = client.get("/api/cryokarst-speleology/sites?conduit_type=horizontal_subglacial_tunnel")
        assert res_tunnel.status_code == 200
        tunnel_data = res_tunnel.json()
        assert len(tunnel_data) == 1
        assert tunnel_data[0]["id"] == "root-glacier-cryokarst-conduit"

        # Query single site details
        res_mat = client.get("/cryokarst-speleology/sites/matanuska-glacier-moulin-chamber")
        assert res_mat.status_code == 200
        mat = res_mat.json()
        assert mat["id"] == "matanuska-glacier-moulin-chamber"
        assert mat["site_id"] == "matanuska-glacier-moulin-chamber"
        assert "Matanuska Glacier" in mat["title"]
        assert mat["depth_meters"] == 65
        assert mat["conduit_type"] == "vertical_moulin_shaft"
        assert mat["ice_stability_class"] == "cold_polar_stable"
        assert mat["meltwater_flow_state"] == "low_trickle_frozen"
        assert len(mat["highlights"]) == 3

        # Prefixed single site lookup /api/cryokarst-speleology/sites/matanuska-glacier-moulin-chamber
        res_api_single = client.get("/api/cryokarst-speleology/sites/matanuska-glacier-moulin-chamber")
        assert res_api_single.status_code == 200
        assert res_api_single.json()["id"] == "matanuska-glacier-moulin-chamber"

        # 404 for unknown site
        res_404 = client.get("/cryokarst-speleology/sites/unknown-subglacial-cave")
        assert res_404.status_code == 404

        res_api_404 = client.get("/api/cryokarst-speleology/sites/unknown-subglacial-cave")
        assert res_api_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Cryokarst Dynamics Calculation
        # -------------------------------------------------------------------------
        calc_payload_nominal = {
            "site_id": "matanuska-glacier-moulin-chamber",
            "conduit_type": "vertical_moulin_shaft",
            "ice_stability": "cold_polar_stable",
            "anchor_system": "long_21cm",
            "ambient_ice_temp_c": -12.0,
            "descent_depth_meters": 45.0,
            "diurnal_solar_exposure_hours": 2.0,
            "team_size": 3,
        }
        res_calc_nom = client.post("/cryokarst-speleology/calculate", json=calc_payload_nominal)
        assert res_calc_nom.status_code == 200
        nom_res = res_calc_nom.json()
        assert nom_res["site_id"] == "matanuska-glacier-moulin-chamber"
        assert nom_res["safety_triage"] == "nominal_stable_cold_ice"
        assert nom_res["anchor_creep_rate_mm_hr"] < 3.5
        assert "NOMINAL" in nom_res["anchor_rigging_advisory"]
        assert "STANDARD SPELEOLOGY" in nom_res["subglacial_escape_protocol"]

        # Prefixed route /api/cryokarst-speleology/calculate
        res_api_calc = client.post("/api/cryokarst-speleology/calculate", json=calc_payload_nominal)
        assert res_api_calc.status_code == 200
        assert res_api_calc.json()["site_id"] == "matanuska-glacier-moulin-chamber"

        # Critical calculation with thermal ablation unstable
        calc_payload_crit = {
            "site_id": "athabasca-glacier-crevasse-chasm",
            "conduit_type": "bergschrund_fracture_cleft",
            "ice_stability": "thermal_ablation_unstable",
            "anchor_system": "standard_17cm",
            "ambient_ice_temp_c": -1.5,
            "descent_depth_meters": 85.0,
            "diurnal_solar_exposure_hours": 8.0,
            "team_size": 4,
        }
        res_calc_crit = client.post("/cryokarst-speleology/calculate", json=calc_payload_crit)
        assert res_calc_crit.status_code == 200
        crit_res = res_calc_crit.json()
        assert crit_res["safety_triage"] == "critical_ablation_collapse_danger"
        assert "CRITICAL HAZARD" in crit_res["anchor_rigging_advisory"]
        assert "EMERGENCY RETREAT" in crit_res["subglacial_escape_protocol"]

        # 404 for invalid site
        res_calc_404 = client.post(
            "/cryokarst-speleology/calculate", json={"site_id": "unknown-glacier-chasm"}
        )
        assert res_calc_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Cryokarst Speleology Gear Checklist
        # -------------------------------------------------------------------------
        res_gear = client.get("/cryokarst-speleology/gear")
        assert res_gear.status_code == 200
        gear_items = res_gear.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["item_id"] for g in gear_items]
        assert "sub-zero-dry-caving-suit" in gear_ids
        assert "dual-tube-stainless-ice-screws" in gear_ids
        assert "abalakov-v-thread-hooker" in gear_ids
        assert "subglacial-multi-gas-detector" in gear_ids
        assert "watertight-submersible-headlamp" in gear_ids
        assert "cryo-traction-ice-crampons" in gear_ids

        # Prefixed gear endpoint /api/cryokarst-speleology/gear
        res_api_gear = client.get("/api/cryokarst-speleology/gear")
        assert res_api_gear.status_code == 200
        assert len(res_api_gear.json()) == 6

        # -------------------------------------------------------------------------
        # Step 5: Chat create_response for cryokarst speleology inquiries
        # -------------------------------------------------------------------------
        # 5a. Gear inquiry via /api/create_response
        chat_req_gear = {
            "question": "What mandatory equipment and drysuit do I need for subglacial ice cave exploration?",
        }
        res5_gear = client.post("/api/create_response", json=chat_req_gear)
        assert res5_gear.status_code == 200
        gear_ans = res5_gear.json()
        assert "cryokarst_speleology_info" in gear_ans
        cs_gear_info = gear_ans["cryokarst_speleology_info"]
        assert cs_gear_info is not None
        assert cs_gear_info["action"] == "gear_checklist"
        assert cs_gear_info["mandatory_count"] == 6

        # 5b. Calculation inquiry via /api/create_response
        chat_req_calc = {
            "question": "Calculate anchor creep rate and jokulhlaup outburst risk for Matanuska glacier moulin chamber",
        }
        res5_calc = client.post("/api/create_response", json=chat_req_calc)
        assert res5_calc.status_code == 200
        calc_ans = res5_calc.json()
        assert "cryokarst_speleology_info" in calc_ans
        cs_calc_info = calc_ans["cryokarst_speleology_info"]
        assert cs_calc_info is not None
        assert cs_calc_info["action"] == "calculate"
        assert "anchor_creep_rate_mm_hr" in cs_calc_info
        assert "thermal_ablation_velocity_mm_day" in cs_calc_info
        assert "jokulhlaup_outburst_risk_index" in cs_calc_info

        # Also test via /api/chat
        res5_chat = client.post("/api/chat", json=chat_req_gear)
        assert res5_chat.status_code == 200
        assert "cryokarst_speleology_info" in res5_chat.json()

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response/stream SSE events
        # -------------------------------------------------------------------------
        # 6a. Test calculation custom event via /chat/stream
        stream_req_calc = {
            "question": "Calculate anchor creep rate and thermal ablation for Gorner Glacier cryokarst siphon cave",
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
            (e for e in parsed_events if e.get("event") == "cryokarst_speleology_calculated"),
            None,
        )
        assert calc_event is not None
        assert "cryokarst_speleology_info" in calc_event
        assert calc_event["cryokarst_speleology_info"]["action"] == "calculate"

        info_event = next(
            (e for e in parsed_events if e.get("event") == "cryokarst_speleology_info"),
            None,
        )
        assert info_event is not None
        assert "cryokarst_speleology_info" in info_event

        token_events = [
            e
            for e in parsed_events
            if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0

        # 6b. Test lookup custom event via /api/create_response/stream
        stream_req_lookup = {
            "question": "Tell me about Root Glacier cryokarst conduit tunnel details",
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
            (e for e in parsed_lookup if e.get("event") == "cryokarst_speleology_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "cryokarst_speleology_info" in lookup_event


@pytest.mark.anyio
async def test_cryokarst_speleology_journey_real_mode_execution():
    """Step 7: Verifies cryokarst speleology prompt injection and payload parity in real LLM mode."""
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
                return_value="In Matanuska Glacier moulin chamber, cold polar ice ensures stable anchor placements."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the anchor rigging advisory for moulin ice caves at Matanuska Glacier?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "cryokarst_speleology_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "cryokarst_speleology_prompt" in call_kwargs
        prompt_content = call_kwargs["cryokarst_speleology_prompt"].lower()
        assert (
            "cryokarst" in prompt_content
            or "glacier ice dynamics" in prompt_content
            or "subglacial" in prompt_content
            or "moulin" in prompt_content
        )
