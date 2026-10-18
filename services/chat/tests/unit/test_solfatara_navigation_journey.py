"""Multi-Step API User Journey Test for Backcountry Geothermal Fumarole Field & Solfatara Gas Hazard Navigation.

Covers the 7-step end-to-end API user journey:
  Step 1: Health probes (/health, /, /api/health)
  Step 2: Catalog discovery & filtering (/api/solfatara-navigation/sites + filters + 422 validation)
  Step 3: Single site detail lookup (katmai-valley-of-ten-thousand-smokes-fumaroles) & 404 check
  Step 4: Navigation safety calculation (POST /api/solfatara-navigation/calculate: nominal ventilated sinter vs critical mofette/thin-mudpot abort + 422 validation)
  Step 5: Mandatory gear checklist (GET /api/solfatara-navigation/gear)
  Step 6: Synchronous chat endpoint (POST /api/chat for calculation, site lookup, and general info)
  Step 7: Streaming SSE chat endpoint (POST /api/chat/stream verifying event: metadata action and event: done)
"""

import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_solfatara_navigation_multi_step_journey():

    # -------------------------------------------------------------------------
    # Step 1: Health probes (/health, /, /api/health)
    # -------------------------------------------------------------------------
    for path in ("/health", "/", "/api/health"):
        resp = client.get(path)
        assert resp.status_code == 200
        assert resp.json().get("status") in ("healthy", "running", "ok")

    # -------------------------------------------------------------------------
    # Step 2: Catalog discovery & filtering (/api/solfatara-navigation/sites + filters + 422 validation)
    # -------------------------------------------------------------------------
    sites_resp = client.get("/api/solfatara-navigation/sites")
    assert sites_resp.status_code == 200
    sites = sites_resp.json()
    assert len(sites) == 5

    # Verify dual-prefix parity (/solfatara-navigation/sites)
    dual_sites_resp = client.get("/solfatara-navigation/sites")
    assert dual_sites_resp.status_code == 200
    assert len(dual_sites_resp.json()) == 5

    # Filter by crust_type
    crust_filtered = client.get(
        "/api/solfatara-navigation/sites",
        params={"crust_type": "siliceous_geyserite_sinter_shield"},
    )
    assert crust_filtered.status_code == 200
    assert len(crust_filtered.json()) == 1
    assert (
        crust_filtered.json()[0]["id"]
        == "katmai-valley-of-ten-thousand-smokes-fumaroles"
    )

    # Filter by gas_regime
    gas_filtered = client.get(
        "/api/solfatara-navigation/sites",
        params={"gas_regime": "superheated_fumarolic_steam_jet"},
    )
    assert gas_filtered.status_code == 200
    assert len(gas_filtered.json()) == 2

    # Filter by wind_state
    wind_filtered = client.get(
        "/api/solfatara-navigation/sites",
        params={"wind_state": "katabatic_calms_inversion_trap"},
    )
    assert wind_filtered.status_code == 200
    assert len(wind_filtered.json()) == 2

    # Invalid filter returns 422
    invalid_filter = client.get(
        "/api/solfatara-navigation/sites",
        params={"crust_type": "invalid_hydrothermal_crust"},
    )
    assert invalid_filter.status_code == 422

    # -------------------------------------------------------------------------
    # Step 3: Single site detail lookup (katmai-valley-of-ten-thousand-smokes-fumaroles) & 404 check
    # -------------------------------------------------------------------------
    detail_resp = client.get(
        "/api/solfatara-navigation/sites/katmai-valley-of-ten-thousand-smokes-fumaroles"
    )
    assert detail_resp.status_code == 200
    katmai = detail_resp.json()
    assert katmai["id"] == "katmai-valley-of-ten-thousand-smokes-fumaroles"
    assert katmai["crust_type"] == "siliceous_geyserite_sinter_shield"
    assert katmai["gas_regime"] == "superheated_fumarolic_steam_jet"
    assert katmai["wind_state"] == "steady_upwind_ridge_ventilation"
    assert katmai["elevation"] == 840
    assert katmai["mean_crust_thickness_cm"] == 28.0

    not_found_resp = client.get(
        "/api/solfatara-navigation/sites/nonexistent-fumarole-basin"
    )
    assert not_found_resp.status_code == 404

    # -------------------------------------------------------------------------
    # Step 4: Navigation safety calculation (POST /api/solfatara-navigation/calculate)
    # -------------------------------------------------------------------------
    # 4a. Nominal ventilated sinter corridor
    calc_nominal_resp = client.post(
        "/api/solfatara-navigation/calculate",
        json={
            "crust_type": "siliceous_geyserite_sinter_shield",
            "gas_regime": "superheated_fumarolic_steam_jet",
            "wind_state": "steady_upwind_ridge_ventilation",
            "sinter_crust_thickness_cm": 30.0,
            "subsurface_temp_10cm_c": 56.0,
            "wind_speed_kmh": 24.0,
            "basin_depression_depth_m": 2.0,
            "ambient_so2_ppm": 0.9,
            "ambient_h2s_ppm": 0.6,
        },
    )
    assert calc_nominal_resp.status_code == 200
    nominal_data = calc_nominal_resp.json()
    assert nominal_data["safety_status"] == "nominal_upwind_sinter_corridor"
    assert nominal_data["crust_bearing_safety_factor"] >= 1.8
    assert nominal_data["scald_breakthrough_probability"] < 0.25

    # 4b. Critical mofette / thin-mudpot abort
    calc_abort_resp = client.post(
        "/api/solfatara-navigation/calculate",
        json={
            "crust_type": "undercut_boiling_mudpot_apron",
            "gas_regime": "co2_cold_mofette_topographic_pooling",
            "wind_state": "katabatic_calms_inversion_trap",
            "sinter_crust_thickness_cm": 5.5,
            "subsurface_temp_10cm_c": 96.0,
            "wind_speed_kmh": 2.0,
            "basin_depression_depth_m": 16.0,
            "ambient_so2_ppm": 15.0,
            "ambient_h2s_ppm": 24.0,
        },
    )
    assert calc_abort_resp.status_code == 200
    abort_data = calc_abort_resp.json()
    assert abort_data["safety_status"] == "abort_lethal_gas_pool_or_crust_collapse"
    assert (
        abort_data["crust_bearing_safety_factor"]
        < nominal_data["crust_bearing_safety_factor"]
    )
    assert (
        abort_data["scald_breakthrough_probability"]
        > nominal_data["scald_breakthrough_probability"]
    )
    assert (
        abort_data["dense_gas_accumulation_index"]
        > nominal_data["dense_gas_accumulation_index"]
    )
    assert (
        abort_data["recommended_standoff_distance_m"]
        > nominal_data["recommended_standoff_distance_m"]
    )

    # 4c. Out-of-range 422 validation
    calc_invalid_resp = client.post(
        "/api/solfatara-navigation/calculate",
        json={
            "crust_type": "siliceous_geyserite_sinter_shield",
            "gas_regime": "superheated_fumarolic_steam_jet",
            "wind_state": "steady_upwind_ridge_ventilation",
            "sinter_crust_thickness_cm": 0.2,
            "subsurface_temp_10cm_c": 145.0,
            "wind_speed_kmh": 24.0,
            "basin_depression_depth_m": 2.0,
            "ambient_so2_ppm": 1.0,
            "ambient_h2s_ppm": 0.8,
        },
    )
    assert calc_invalid_resp.status_code == 422

    # -------------------------------------------------------------------------
    # Step 5: Mandatory gear checklist (GET /api/solfatara-navigation/gear)
    # -------------------------------------------------------------------------
    gear_resp = client.get("/api/solfatara-navigation/gear")
    assert gear_resp.status_code == 200
    gear_items = gear_resp.json()
    assert len(gear_items) == 6
    assert all(item["mandatory"] is True for item in gear_items)
    assert {g["id"] for g in gear_items} == {
        "four-gas-pumped-electrochemical-detector",
        "niorsh-ov-ag-p100-acid-gas-half-mask-respirator",
        "carbon-fiber-graduated-thermal-crust-probe-pole",
        "sealed-polycarbonate-chemical-splash-goggles",
        "bi-metal-soil-probe-stem-thermometer",
        "ptfe-acid-resistant-overboots-and-gaiters",
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
                    "Calculate solfatara navigation safety at Bumpass Hell with crust thickness 14 cm, "
                    "subsurface temp 84 C, wind speed 14 km/h, depression depth 5.5 m, SO2 3.8 ppm, H2S 6.5 ppm"
                ),
                "chat_history": [],
            },
        )
        assert chat_calc_resp.status_code == 200
        chat_calc_body = chat_calc_resp.json()
        assert "solfatara_navigation_info" in chat_calc_body
        assert (
            chat_calc_body["solfatara_navigation_info"]["action"]
            == "solfatara_navigation_calculated"
        )
        assert "crust_bearing_safety_factor" in chat_calc_body["solfatara_navigation_info"]

        # 6b. Site lookup query
        chat_lookup_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "Tell me about Katmai Valley of Ten Thousand Smokes fumaroles site details",
                "chat_history": [],
            },
        )
        assert chat_lookup_resp.status_code == 200
        chat_lookup_body = chat_lookup_resp.json()
        assert "solfatara_navigation_info" in chat_lookup_body
        assert (
            chat_lookup_body["solfatara_navigation_info"]["action"]
            == "solfatara_navigation_lookup"
        )
        assert (
            chat_lookup_body["solfatara_navigation_info"]["site"]["id"]
            == "katmai-valley-of-ten-thousand-smokes-fumaroles"
        )

        # 6c. General info query
        chat_info_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "What mandatory gear and protocols are needed for backcountry solfatara and fumarole navigation?",
                "chat_history": [],
            },
        )
        assert chat_info_resp.status_code == 200
        chat_info_body = chat_info_resp.json()
        assert "solfatara_navigation_info" in chat_info_body
        assert (
            chat_info_body["solfatara_navigation_info"]["action"]
            == "solfatara_navigation_info"
        )
        assert len(chat_info_body["solfatara_navigation_info"]["sites"]) == 5
        assert len(chat_info_body["solfatara_navigation_info"]["gear_checklist"]) == 6

        # -------------------------------------------------------------------------
        # Step 7: Streaming SSE chat endpoint (POST /api/chat/stream)
        # -------------------------------------------------------------------------
        with client.stream(
            "POST",
            "/api/chat/stream",
            json={
                "customer_id": "1",
                "question": (
                    "Calculate solfatara sinter crust safety for crust thickness 26 cm, "
                    "subsurface temp 62 C, wind speed 20 km/h, depression depth 2.5 m, SO2 1.2 ppm, H2S 0.8 ppm"
                ),
                "chat_history": [],
            },
        ) as stream_resp:
            assert stream_resp.status_code == 200
            raw_text = "".join(stream_resp.iter_text())

        assert "event: metadata" in raw_text
        assert "solfatara_navigation_calculated" in raw_text
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
        assert metadata_payload["action"] == "solfatara_navigation_calculated"
        assert "crust_bearing_safety_factor" in metadata_payload
