"""Multi-Step API User Journey Test for Arid Playas & Salt Pan Crust Bearing-Capacity & Mirage Compass Navigation.

Covers the 7-step end-to-end API user journey:
  Step 1: Health probes (/health, /, /api/health)
  Step 2: Catalog discovery & filtering (/api/salt-pan-navigation/sites + filters + 422 validation)
  Step 3: Single site detail lookup (salar-de-uyuni-incahuasi-halite-polygon-basin) & 404 check
  Step 4: Navigation safety calculation (POST /api/salt-pan-navigation/calculate: nominal crystalline halite corridor vs critical liquefied silt/shallow water-table abort + 422 validation)
  Step 5: Mandatory gear checklist (GET /api/salt-pan-navigation/gear)
  Step 6: Synchronous chat endpoint (POST /api/chat for calculation, site lookup, and general info)
  Step 7: Streaming SSE chat endpoint (POST /api/chat/stream verifying event: metadata action and event: done)
"""

import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_salt_pan_navigation_multi_step_journey():

    # -------------------------------------------------------------------------
    # Step 1: Health probes (/health, /, /api/health)
    # -------------------------------------------------------------------------
    for path in ("/health", "/", "/api/health"):
        resp = client.get(path)
        assert resp.status_code == 200
        assert resp.json().get("status") in ("healthy", "running", "ok")

    # -------------------------------------------------------------------------
    # Step 2: Catalog discovery & filtering (/api/salt-pan-navigation/sites + filters + 422 validation)
    # -------------------------------------------------------------------------
    sites_resp = client.get("/api/salt-pan-navigation/sites")
    assert sites_resp.status_code == 200
    sites = sites_resp.json()
    assert len(sites) == 5

    # Verify dual-prefix parity (/salt-pan-navigation/sites)
    dual_sites_resp = client.get("/salt-pan-navigation/sites")
    assert dual_sites_resp.status_code == 200
    assert len(dual_sites_resp.json()) == 5

    # Filter by crust_type
    crust_filtered = client.get(
        "/api/salt-pan-navigation/sites",
        params={"crust_type": "polygonal_halite_pressure_ridge"},
    )
    assert crust_filtered.status_code == 200
    assert len(crust_filtered.json()) == 1
    assert (
        crust_filtered.json()[0]["id"]
        == "salar-de-uyuni-incahuasi-halite-polygon-basin"
    )

    # Filter by refraction_state
    refraction_filtered = client.get(
        "/api/salt-pan-navigation/sites",
        params={"refraction_state": "fata_morgana_vertical_loom"},
    )
    assert refraction_filtered.status_code == 200
    assert len(refraction_filtered.json()) == 2
    assert {s["id"] for s in refraction_filtered.json()} == {
        "makgadikgadi-ntwetwe-sua-salt-pan-traverse",
        "chott-el-djerid-ephemeral-mirage-salar",
    }

    # Filter by traversal_mode
    mode_filtered = client.get(
        "/api/salt-pan-navigation/sites",
        params={"traversal_mode": "wide_tire_desert_expedition_cart"},
    )
    assert mode_filtered.status_code == 200
    assert len(mode_filtered.json()) == 2

    # Invalid filter returns 422
    invalid_filter = client.get(
        "/api/salt-pan-navigation/sites",
        params={"crust_type": "invalid_evaporite_crust"},
    )
    assert invalid_filter.status_code == 422

    # -------------------------------------------------------------------------
    # Step 3: Single site detail lookup (salar-de-uyuni-incahuasi-halite-polygon-basin) & 404 check
    # -------------------------------------------------------------------------
    detail_resp = client.get(
        "/api/salt-pan-navigation/sites/salar-de-uyuni-incahuasi-halite-polygon-basin"
    )
    assert detail_resp.status_code == 200
    uyuni = detail_resp.json()
    assert uyuni["id"] == "salar-de-uyuni-incahuasi-halite-polygon-basin"
    assert uyuni["crust_type"] == "polygonal_halite_pressure_ridge"
    assert uyuni["refraction_state"] == "predawn_isothermal_clarity"
    assert uyuni["traversal_mode"] == "wide_tire_desert_expedition_cart"
    assert uyuni["elevation"] == 3656
    assert uyuni["mean_halite_crust_thickness_cm"] == 38.0
    assert uyuni["water_table_depth_cm"] == 45.0
    assert uyuni["typical_surface_air_temp_c"] == 14.0
    assert uyuni["typical_ground_skin_temp_c"] == 22.0

    not_found_resp = client.get(
        "/api/salt-pan-navigation/sites/nonexistent-salt-pan-basin"
    )
    assert not_found_resp.status_code == 404

    # -------------------------------------------------------------------------
    # Step 4: Navigation safety calculation (POST /api/salt-pan-navigation/calculate)
    # -------------------------------------------------------------------------
    # 4a. Nominal crystalline halite corridor
    calc_nominal_resp = client.post(
        "/api/salt-pan-navigation/calculate",
        json={
            "crust_type": "polygonal_halite_pressure_ridge",
            "refraction_state": "predawn_isothermal_clarity",
            "traversal_mode": "wide_tire_desert_expedition_cart",
            "halite_crust_thickness_cm": 38.0,
            "water_table_depth_cm": 45.0,
            "surface_air_temp_c": 14.0,
            "ground_skin_temp_c": 22.0,
            "total_traveler_load_kg": 95.0,
            "target_sighting_distance_km": 12.0,
        },
    )
    assert calc_nominal_resp.status_code == 200
    nominal_data = calc_nominal_resp.json()
    assert (
        nominal_data["safety_status"] == "nominal_crystalline_halite_corridor"
    )
    assert nominal_data["crust_bearing_safety_factor"] >= 1.8
    assert nominal_data["brine_mud_breakthrough_probability"] < 0.20

    # 4b. Critical liquefied silt / shallow water-table abort
    calc_abort_resp = client.post(
        "/api/salt-pan-navigation/calculate",
        json={
            "crust_type": "subsurface_liquefied_silt_dome",
            "refraction_state": "fata_morgana_vertical_loom",
            "traversal_mode": "belayed_crust_sounding_probe_team",
            "halite_crust_thickness_cm": 6.0,
            "water_table_depth_cm": 8.0,
            "surface_air_temp_c": 38.0,
            "ground_skin_temp_c": 56.0,
            "total_traveler_load_kg": 145.0,
            "target_sighting_distance_km": 18.0,
        },
    )
    assert calc_abort_resp.status_code == 200
    abort_data = calc_abort_resp.json()
    assert (
        abort_data["safety_status"]
        == "abort_subsurface_brine_mud_breakthrough"
    )
    assert (
        abort_data["crust_bearing_safety_factor"]
        < nominal_data["crust_bearing_safety_factor"]
    )
    assert (
        abort_data["brine_mud_breakthrough_probability"]
        > nominal_data["brine_mud_breakthrough_probability"]
    )
    assert (
        abort_data["mirage_horizon_dip_error_deg"]
        > nominal_data["mirage_horizon_dip_error_deg"]
    )

    # 4c. Out-of-range 422 validation
    calc_invalid_resp = client.post(
        "/api/salt-pan-navigation/calculate",
        json={
            "crust_type": "polygonal_halite_pressure_ridge",
            "refraction_state": "predawn_isothermal_clarity",
            "traversal_mode": "wide_tire_desert_expedition_cart",
            "halite_crust_thickness_cm": 0.3,
            "water_table_depth_cm": 45.0,
            "surface_air_temp_c": 14.0,
            "ground_skin_temp_c": 22.0,
            "total_traveler_load_kg": 95.0,
            "target_sighting_distance_km": 12.0,
        },
    )
    assert calc_invalid_resp.status_code == 422

    # -------------------------------------------------------------------------
    # Step 5: Mandatory gear checklist (GET /api/salt-pan-navigation/gear)
    # -------------------------------------------------------------------------
    gear_resp = client.get("/api/salt-pan-navigation/gear")
    assert gear_resp.status_code == 200
    gear_items = gear_resp.json()
    assert len(gear_items) == 6
    assert all(item["mandatory"] is True for item in gear_items)
    assert {g["id"] for g in gear_items} == {
        "graduated-stainless-evaporite-crust-core-auger",
        "fluid-damped-prismatic-sighting-compass-and-sun-compass",
        "polarized-category-4-wrap-glare-shields",
        "collapsible-high-flotation-brine-mud-extraction-boards",
        "dual-band-gnss-inreach-beacon-and-paper-utm-grid",
        "ptfe-coated-halite-resistant-gaiters-and-barrier-salve",
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
                    "Calculate salt pan navigation safety at Chott el Djerid with "
                    "halite crust thickness 7 cm, water table depth 9 cm, air temp 37 C, "
                    "ground skin temp 55 C, load 135 kg, sighting distance 15 km"
                ),
                "chat_history": [],
            },
        )
        assert chat_calc_resp.status_code == 200
        chat_calc_body = chat_calc_resp.json()
        assert "salt_pan_navigation_info" in chat_calc_body
        assert (
            chat_calc_body["salt_pan_navigation_info"]["action"]
            == "salt_pan_navigation_calculated"
        )
        assert (
            "crust_bearing_safety_factor"
            in chat_calc_body["salt_pan_navigation_info"]
        )

        # 6b. Site lookup query
        chat_lookup_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "Tell me about Salar de Uyuni Incahuasi halite polygon basin site details",
                "chat_history": [],
            },
        )
        assert chat_lookup_resp.status_code == 200
        chat_lookup_body = chat_lookup_resp.json()
        assert "salt_pan_navigation_info" in chat_lookup_body
        assert (
            chat_lookup_body["salt_pan_navigation_info"]["action"]
            == "salt_pan_navigation_lookup"
        )
        assert (
            chat_lookup_body["salt_pan_navigation_info"]["site"]["id"]
            == "salar-de-uyuni-incahuasi-halite-polygon-basin"
        )

        # 6c. General info query
        chat_info_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "What mandatory gear and protocols are needed for arid salt pan crust and mirage compass navigation?",
                "chat_history": [],
            },
        )
        assert chat_info_resp.status_code == 200
        chat_info_body = chat_info_resp.json()
        assert "salt_pan_navigation_info" in chat_info_body
        assert (
            chat_info_body["salt_pan_navigation_info"]["action"]
            == "salt_pan_navigation_info"
        )
        assert len(chat_info_body["salt_pan_navigation_info"]["sites"]) == 5
        assert (
            len(chat_info_body["salt_pan_navigation_info"]["gear_checklist"])
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
                    "Calculate salt pan navigation safety for halite crust thickness 38 cm, "
                    "water table depth 45 cm, air temp 14 C, ground temp 22 C, "
                    "load 95 kg, sighting distance 12 km"
                ),
                "chat_history": [],
            },
        ) as stream_resp:
            assert stream_resp.status_code == 200
            raw_text = "".join(stream_resp.iter_text())

        assert "event: metadata" in raw_text
        assert "salt_pan_navigation_calculated" in raw_text
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
        assert metadata_payload["action"] == "salt_pan_navigation_calculated"
        assert "crust_bearing_safety_factor" in metadata_payload
