"""Multi-Step API User Journey Test for Sub-Canopy Mangroves & Pneumatophore Prop-Root Tidal Labyrinth Navigation.

Covers the 7-step end-to-end API user journey:
  Step 1: Health probes (/health, /, /api/health)
  Step 2: Catalog discovery & filtering (/api/mangrove-labyrinth/sites + filters + invalid filter validation)
  Step 3: Single site detail lookup (everglades-hell-bay-labyrinth-waterway) & 404 check
  Step 4: Navigation calculation (POST /api/mangrove-labyrinth/calculate: nominal high-slack tunnel vs critical spring-low sulfidic mud/ebb stranding abort + invalid input validation)
  Step 5: Mandatory gear checklist (GET /api/mangrove-labyrinth/gear)
  Step 6: Synchronous chat endpoint (POST /api/chat for calculation, site lookup, and general info)
  Step 7: Streaming SSE chat endpoint (POST /api/chat/stream verifying event: metadata action and event: done)
"""

import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_mangrove_labyrinth_multi_step_journey():

    # -------------------------------------------------------------------------
    # Step 1: Health probes (/health, /, /api/health)
    # -------------------------------------------------------------------------
    for path in ("/health", "/", "/api/health"):
        resp = client.get(path)
        assert resp.status_code == 200
        assert resp.json().get("status") in ("healthy", "running", "ok")

    # -------------------------------------------------------------------------
    # Step 2: Catalog discovery & filtering (/api/mangrove-labyrinth/sites + filters + validation)
    # -------------------------------------------------------------------------
    sites_resp = client.get("/api/mangrove-labyrinth/sites")
    assert sites_resp.status_code == 200
    sites = sites_resp.json()
    assert len(sites) == 5

    # Verify dual-prefix parity (/mangrove-labyrinth/sites)
    dual_sites_resp = client.get("/mangrove-labyrinth/sites")
    assert dual_sites_resp.status_code == 200
    assert len(dual_sites_resp.json()) == 5

    # Filter by root_morphology
    morph_filtered = client.get(
        "/api/mangrove-labyrinth/sites",
        params={"root_morphology": "rhizophora_arching_prop_root_tangle"},
    )
    assert morph_filtered.status_code == 200
    assert len(morph_filtered.json()) == 1
    assert (
        morph_filtered.json()[0]["id"]
        == "everglades-hell-bay-labyrinth-waterway"
    )

    # Filter by tidal_regime
    tidal_filtered = client.get(
        "/api/mangrove-labyrinth/sites",
        params={"tidal_regime": "high_slack_canopy_tunnel_float"},
    )
    assert tidal_filtered.status_code == 200
    assert len(tidal_filtered.json()) == 2
    assert {s["id"] for s in tidal_filtered.json()} == {
        "everglades-hell-bay-labyrinth-waterway",
        "hinchinbrook-missionary-bay-mangrove-tunnels",
    }

    # Filter by traversal_mode
    mode_filtered = client.get(
        "/api/mangrove-labyrinth/sites",
        params={"traversal_mode": "short_hull_sit_in_creek_kayak"},
    )
    assert mode_filtered.status_code == 200
    assert len(mode_filtered.json()) == 2
    assert {s["id"] for s in mode_filtered.json()} == {
        "everglades-hell-bay-labyrinth-waterway",
        "sundarbans-harbhanga-tidal-creek-nexus",
    }

    # Invalid filter returns 400 or 422
    invalid_filter = client.get(
        "/api/mangrove-labyrinth/sites",
        params={"root_morphology": "invalid_mangrove_root_morphology"},
    )
    assert invalid_filter.status_code in (400, 422)

    # -------------------------------------------------------------------------
    # Step 3: Single site detail lookup (everglades-hell-bay-labyrinth-waterway) & 404 check
    # -------------------------------------------------------------------------
    detail_resp = client.get(
        "/api/mangrove-labyrinth/sites/everglades-hell-bay-labyrinth-waterway"
    )
    assert detail_resp.status_code == 200
    everglades = detail_resp.json()
    assert everglades["id"] == "everglades-hell-bay-labyrinth-waterway"
    assert everglades["root_morphology"] == "rhizophora_arching_prop_root_tangle"
    assert everglades["tidal_regime"] == "high_slack_canopy_tunnel_float"
    assert everglades["traversal_mode"] == "short_hull_sit_in_creek_kayak"
    assert everglades["elevation"] == 0
    assert everglades["prop_root_density_stems_m2"] == 14.0
    assert everglades["typical_current_velocity_knots"] == 0.6
    assert everglades["typical_water_depth_over_mud_cm"] == 62.0
    assert everglades["anoxic_silt_sink_depth_cm"] == 35.0
    assert everglades["canopy_closure_percent"] == 88.0

    not_found_resp = client.get(
        "/api/mangrove-labyrinth/sites/nonexistent-mangrove-creek"
    )
    assert not_found_resp.status_code == 404

    # -------------------------------------------------------------------------
    # Step 4: Navigation calculation (POST /api/mangrove-labyrinth/calculate)
    # -------------------------------------------------------------------------
    # 4a. Nominal high-slack canopy tunnel
    calc_nominal_resp = client.post(
        "/api/mangrove-labyrinth/calculate",
        json={
            "root_morphology": "rhizophora_arching_prop_root_tangle",
            "tidal_regime": "high_slack_canopy_tunnel_float",
            "traversal_mode": "short_hull_sit_in_creek_kayak",
            "prop_root_density_stems_m2": 14.0,
            "tidal_current_velocity_knots": 0.6,
            "water_depth_over_mud_cm": 62.0,
            "anoxic_silt_sink_depth_cm": 35.0,
            "canopy_closure_percent": 88.0,
            "tide_stage_hours_to_low": 4.2,
        },
    )
    assert calc_nominal_resp.status_code == 200
    nominal_data = calc_nominal_resp.json()
    assert (
        nominal_data["safety_status"] == "nominal_high_slack_canopy_corridor"
    )
    assert nominal_data["root_strainer_pinning_risk_percent"] < 40.0
    assert nominal_data["anoxic_mud_entrapment_probability"] < 0.30

    # 4b. Critical spring-low sulfidic mud / ebb stranding abort
    calc_abort_resp = client.post(
        "/api/mangrove-labyrinth/calculate",
        json={
            "root_morphology": "submerged_oyster_encrusted_deadfall_snag",
            "tidal_regime": "spring_low_exposed_sulfidic_mud_plug",
            "traversal_mode": "packraft_amphibious_portage",
            "prop_root_density_stems_m2": 65.0,
            "tidal_current_velocity_knots": 3.4,
            "water_depth_over_mud_cm": 15.0,
            "anoxic_silt_sink_depth_cm": 110.0,
            "canopy_closure_percent": 94.0,
            "tide_stage_hours_to_low": 0.6,
        },
    )
    assert calc_abort_resp.status_code == 200
    abort_data = calc_abort_resp.json()
    assert (
        abort_data["safety_status"]
        == "abort_ebb_stranding_or_anoxic_silt_entrapment"
    )
    assert (
        abort_data["root_strainer_pinning_risk_percent"]
        > nominal_data["root_strainer_pinning_risk_percent"]
    )
    assert (
        abort_data["anoxic_mud_entrapment_probability"]
        > nominal_data["anoxic_mud_entrapment_probability"]
    )
    assert (
        abort_data["safe_ebb_exit_window_minutes"]
        < nominal_data["safe_ebb_exit_window_minutes"]
    )

    # 4c. Out-of-range validation
    calc_invalid_resp = client.post(
        "/api/mangrove-labyrinth/calculate",
        json={
            "root_morphology": "rhizophora_arching_prop_root_tangle",
            "tidal_regime": "high_slack_canopy_tunnel_float",
            "traversal_mode": "short_hull_sit_in_creek_kayak",
            "prop_root_density_stems_m2": 0.1,
            "tidal_current_velocity_knots": 0.6,
            "water_depth_over_mud_cm": 62.0,
            "anoxic_silt_sink_depth_cm": 35.0,
            "canopy_closure_percent": 88.0,
            "tide_stage_hours_to_low": 4.2,
        },
    )
    assert calc_invalid_resp.status_code in (400, 422)

    # -------------------------------------------------------------------------
    # Step 5: Mandatory gear checklist (GET /api/mangrove-labyrinth/gear)
    # -------------------------------------------------------------------------
    gear_resp = client.get("/api/mangrove-labyrinth/gear")
    assert gear_resp.status_code == 200
    gear_items = gear_resp.json()
    assert len(gear_items) == 6
    assert all(item["mandatory"] is True for item in gear_items)
    assert {g["id"] for g in gear_items} == {
        "kevlar-armored-cut-resistant-oyster-gloves-and-booties",
        "compact-115cm-double-blade-breakdown-tunnel-paddle",
        "sub-canopy-multi-gnss-breadcrumb-plotter-and-rheoscopic-compass",
        "biodegradable-reflective-retro-clip-trail-markers",
        "quick-release-tow-belt-and-floating-snag-pruning-saw",
        "sealed-permethrin-headnet-and-electrolyte-hydration-bladder",
    }

    # -------------------------------------------------------------------------
    # Step 6: Synchronous chat endpoint (POST /api/chat)
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # 6a. Calculation query
        chat_calc_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": (
                    "Calculate mangrove labyrinth navigation at Sundarbans Harbhanga with "
                    "prop root density 42 stems/m2, current velocity 2.4 knots, "
                    "water depth 48 cm, silt sink depth 72 cm, canopy closure 76%, "
                    "tide stage 1.8 hours to low"
                ),
                "chat_history": [],
            },
        )
        assert chat_calc_resp.status_code == 200
        chat_calc_body = chat_calc_resp.json()
        assert "mangrove_labyrinth_info" in chat_calc_body
        assert (
            chat_calc_body["mangrove_labyrinth_info"]["action"]
            == "mangrove_labyrinth_calculated"
        )
        assert (
            "root_strainer_pinning_risk_percent"
            in chat_calc_body["mangrove_labyrinth_info"]
        )

        # 6b. Site lookup query
        chat_lookup_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "Tell me about Everglades Hell Bay Rhizophora prop-root mangrove labyrinth site details",
                "chat_history": [],
            },
        )
        assert chat_lookup_resp.status_code == 200
        chat_lookup_body = chat_lookup_resp.json()
        assert "mangrove_labyrinth_info" in chat_lookup_body
        assert (
            chat_lookup_body["mangrove_labyrinth_info"]["action"]
            == "mangrove_labyrinth_lookup"
        )
        assert (
            chat_lookup_body["mangrove_labyrinth_info"]["site"]["id"]
            == "everglades-hell-bay-labyrinth-waterway"
        )

        # 6c. General info query
        chat_info_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "What mandatory gear and protocols are needed for sub-canopy mangroves and pneumatophore prop-root tidal labyrinth navigation?",
                "chat_history": [],
            },
        )
        assert chat_info_resp.status_code == 200
        chat_info_body = chat_info_resp.json()
        assert "mangrove_labyrinth_info" in chat_info_body
        assert (
            chat_info_body["mangrove_labyrinth_info"]["action"]
            == "mangrove_labyrinth_info"
        )
        assert len(chat_info_body["mangrove_labyrinth_info"]["sites"]) == 5
        assert (
            len(chat_info_body["mangrove_labyrinth_info"]["gear_checklist"])
            == 6
        )

        # -------------------------------------------------------------------------
        # Step 7: Streaming SSE chat endpoint (POST /api/chat/stream)
        # -------------------------------------------------------------------------
        with client.stream(
            "POST",
            "/api/chat/stream",
            json={
                "customer_id": "1",
                "question": (
                    "Calculate mangrove labyrinth navigation for prop root density 14 stems/m2, "
                    "current velocity 0.6 knots, water depth 62 cm, silt sink depth 35 cm, "
                    "canopy closure 88%, tide stage 3.5 hours"
                ),
                "chat_history": [],
            },
        ) as stream_resp:
            assert stream_resp.status_code == 200
            raw_text = "".join(stream_resp.iter_text())

        assert "event: metadata" in raw_text
        assert "mangrove_labyrinth_calculated" in raw_text
        assert "event: done" in raw_text

        # Parse metadata payload from SSE lines
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        metadata_payload = None
        for idx, line in enumerate(lines):
            if line == "event: metadata" and idx + 1 < len(lines):
                next_line = lines[idx + 1]
                if next_line.startswith("data: "):
                    metadata_payload = json.loads(next_line[len("data: ") :])
                    break
        assert metadata_payload is not None
        assert (
            metadata_payload["action"] == "mangrove_labyrinth_calculated"
        )
        assert "root_strainer_pinning_risk_percent" in metadata_payload
