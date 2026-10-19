"""Multi-Step API User Journey Test for High-Altitude Páramo & Frailejón Cushion-Bog Moorland Navigation.

Covers the 7-step end-to-end API user journey:
  Step 1: Health probes (/health, /, /api/health)
  Step 2: Catalog discovery & filtering (/api/paramo-navigation/sites + filters + invalid filter validation)
  Step 3: Single site detail lookup (sumapaz-chisaca-laguna-tunjos-paramo) & 404 check
  Step 4: Navigation safety calculation (POST /api/paramo-navigation/calculate: nominal morning cushion corridor vs critical freezing sleet/saturated peat abort + invalid input validation)
  Step 5: Mandatory gear checklist (GET /api/paramo-navigation/gear)
  Step 6: Synchronous chat endpoint (POST /api/chat for calculation, site lookup, and general info)
  Step 7: Streaming SSE chat endpoint (POST /api/chat/stream verifying event: metadata action and event: done)
"""

import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_paramo_navigation_multi_step_journey():
    # -------------------------------------------------------------------------
    # Step 1: Health probes (/health, /, /api/health)
    # -------------------------------------------------------------------------
    for path in ("/health", "/", "/api/health"):
        resp = client.get(path)
        assert resp.status_code == 200
        assert resp.json().get("status") in ("healthy", "running", "ok")

    # -------------------------------------------------------------------------
    # Step 2: Catalog discovery & filtering (/api/paramo-navigation/sites + filters + validation)
    # -------------------------------------------------------------------------
    sites_resp = client.get("/api/paramo-navigation/sites")
    assert sites_resp.status_code == 200
    sites = sites_resp.json()
    assert len(sites) == 5

    # Verify dual-prefix parity (/paramo-navigation/sites)
    dual_sites_resp = client.get("/paramo-navigation/sites")
    assert dual_sites_resp.status_code == 200
    assert len(dual_sites_resp.json()) == 5

    # Filter by substrate_morphology
    morph_filtered = client.get(
        "/api/paramo-navigation/sites",
        params={"substrate_morphology": "plantago_distichia_cushion_bog_dome"},
    )
    assert morph_filtered.status_code == 200
    assert len(morph_filtered.json()) == 1
    assert (
        morph_filtered.json()[0]["id"]
        == "el-angel-frailejon-giant-rosette-reserve"
    )

    # Filter by fog_regime
    fog_filtered = client.get(
        "/api/paramo-navigation/sites",
        params={"fog_regime": "orographic_paramo_drizzle_whiteout"},
    )
    assert fog_filtered.status_code == 200
    assert len(fog_filtered.json()) == 2
    assert {s["id"] for s in fog_filtered.json()} == {
        "sumapaz-chisaca-laguna-tunjos-paramo",
        "cajas-toreadora-glacial-turbera-labyrinth",
    }

    # Filter by technique
    tech_filtered = client.get(
        "/api/paramo-navigation/sites",
        params={"technique": "distichia_cushion_dome_stepping"},
    )
    assert tech_filtered.status_code == 200
    assert len(tech_filtered.json()) == 2
    assert {s["id"] for s in tech_filtered.json()} == {
        "el-angel-frailejon-giant-rosette-reserve",
        "chirripo-sabana-de-los-leones-talamanca-paramo",
    }

    # Invalid filter returns 400 or 422
    invalid_filter = client.get(
        "/api/paramo-navigation/sites",
        params={"substrate_morphology": "invalid_paramo_substrate_morphology"},
    )
    assert invalid_filter.status_code in (400, 422)

    # -------------------------------------------------------------------------
    # Step 3: Single site detail lookup (sumapaz-chisaca-laguna-tunjos-paramo) & 404 check
    # -------------------------------------------------------------------------
    detail_resp = client.get(
        "/api/paramo-navigation/sites/sumapaz-chisaca-laguna-tunjos-paramo"
    )
    assert detail_resp.status_code == 200
    sumapaz = detail_resp.json()
    assert sumapaz["id"] == "sumapaz-chisaca-laguna-tunjos-paramo"
    assert (
        sumapaz["substrate_morphology"]
        == "espeletia_frailejon_tussock_matrix"
    )
    assert sumapaz["fog_regime"] == "orographic_paramo_drizzle_whiteout"
    assert sumapaz["technique"] == "tussock_crown_bridging_with_baskets"
    assert sumapaz["elevation"] == 3780
    assert sumapaz["mean_cushion_mat_thickness_cm"] == 26.0
    assert sumapaz["histosol_water_saturation_percent"] == 78.0
    assert sumapaz["typical_visibility_meters"] == 45.0
    assert sumapaz["typical_ambient_temp_c"] == 5.0
    assert sumapaz["typical_wind_speed_kmh"] == 24.0

    not_found_resp = client.get(
        "/api/paramo-navigation/sites/nonexistent-paramo-moorland"
    )
    assert not_found_resp.status_code == 404

    # -------------------------------------------------------------------------
    # Step 4: Navigation safety calculation (POST /api/paramo-navigation/calculate)
    # -------------------------------------------------------------------------
    # 4a. Nominal morning window cushion corridor
    calc_nominal_resp = client.post(
        "/api/paramo-navigation/calculate",
        json={
            "substrate_morphology": "plantago_distichia_cushion_bog_dome",
            "fog_regime": "morning_zenith_uv_window",
            "technique": "distichia_cushion_dome_stepping",
            "cushion_mat_thickness_cm": 38.0,
            "histosol_water_saturation_percent": 65.0,
            "visibility_meters": 220.0,
            "ambient_temp_c": 8.0,
            "wind_speed_kmh": 16.0,
            "pack_weight_kg": 14.0,
        },
    )
    assert calc_nominal_resp.status_code == 200
    nominal_data = calc_nominal_resp.json()
    assert (
        nominal_data["safety_status"]
        == "nominal_morning_window_cushion_corridor"
    )
    assert nominal_data["cushion_bearing_safety_factor"] >= 1.5
    assert nominal_data["turbera_breakthrough_probability"] < 0.25

    # 4b. Critical freezing sleet / saturated peat abort
    calc_abort_resp = client.post(
        "/api/paramo-navigation/calculate",
        json={
            "substrate_morphology": "waterlogged_histosol_turbera_basin",
            "fog_regime": "freezing_horizontal_sleet_squall",
            "technique": "compass_pacing_azimuth_dead_reckoning",
            "cushion_mat_thickness_cm": 9.0,
            "histosol_water_saturation_percent": 95.0,
            "visibility_meters": 12.0,
            "ambient_temp_c": -1.0,
            "wind_speed_kmh": 55.0,
            "pack_weight_kg": 28.0,
        },
    )
    assert calc_abort_resp.status_code == 200
    abort_data = calc_abort_resp.json()
    assert (
        abort_data["safety_status"]
        == "abort_hypothermic_squall_and_peat_mire_entrapment"
    )
    assert (
        abort_data["turbera_breakthrough_probability"]
        > nominal_data["turbera_breakthrough_probability"]
    )
    assert (
        abort_data["cushion_bearing_safety_factor"]
        < nominal_data["cushion_bearing_safety_factor"]
    )
    assert (
        abort_data["effective_wind_chill_c"]
        < nominal_data["effective_wind_chill_c"]
    )
    assert (
        abort_data["azimuth_drift_meters_per_km"]
        > nominal_data["azimuth_drift_meters_per_km"]
    )

    # 4c. Out-of-range validation
    calc_invalid_resp = client.post(
        "/api/paramo-navigation/calculate",
        json={
            "substrate_morphology": "plantago_distichia_cushion_bog_dome",
            "fog_regime": "morning_zenith_uv_window",
            "technique": "distichia_cushion_dome_stepping",
            "cushion_mat_thickness_cm": 0.5,
            "histosol_water_saturation_percent": 65.0,
            "visibility_meters": 220.0,
            "ambient_temp_c": 8.0,
            "wind_speed_kmh": 16.0,
            "pack_weight_kg": 14.0,
        },
    )
    assert calc_invalid_resp.status_code in (400, 422)

    # -------------------------------------------------------------------------
    # Step 5: Mandatory gear checklist (GET /api/paramo-navigation/gear)
    # -------------------------------------------------------------------------
    gear_resp = client.get("/api/paramo-navigation/gear")
    assert gear_resp.status_code == 200
    gear_items = gear_resp.json()
    assert len(gear_items) == 6
    assert all(item["mandatory"] is True for item in gear_items)
    assert {g["id"] for g in gear_items} == {
        "knee-high-neoprene-lined-rubber-paramo-panteneras",
        "dual-probe-85mm-snow-basket-trekking-poles",
        "three-layer-hydrostatic-28k-gore-pro-hardshell",
        "declination-adjustable-mirror-sighting-compass-and-altimeter",
        "vapor-barrier-fleece-liner-gloves-and-overmitts",
        "ultralight-bothy-bag-emergency-storm-shelter",
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
                    "Calculate paramo navigation safety at Sumapaz with "
                    "cushion mat thickness 26 cm, histosol water saturation 78%, "
                    "visibility 45 meters, ambient temp 5 C, wind speed 24 km/h, "
                    "pack weight 18 kg"
                ),
                "chat_history": [],
            },
        )
        assert chat_calc_resp.status_code == 200
        chat_calc_body = chat_calc_resp.json()
        assert "paramo_navigation_info" in chat_calc_body
        assert (
            chat_calc_body["paramo_navigation_info"]["action"]
            == "paramo_navigation_calculated"
        )
        assert (
            "cushion_bearing_safety_factor"
            in chat_calc_body["paramo_navigation_info"]
        )

        # 6b. Site lookup query
        chat_lookup_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "Tell me about Páramo de Sumapaz and Lagunas de Chisacá frailejón moorland site details",
                "chat_history": [],
            },
        )
        assert chat_lookup_resp.status_code == 200
        chat_lookup_body = chat_lookup_resp.json()
        assert "paramo_navigation_info" in chat_lookup_body
        assert (
            chat_lookup_body["paramo_navigation_info"]["action"]
            == "paramo_navigation_lookup"
        )
        assert (
            chat_lookup_body["paramo_navigation_info"]["site"]["id"]
            == "sumapaz-chisaca-laguna-tunjos-paramo"
        )

        # 6c. General info query
        chat_info_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "What mandatory gear and protocols are needed for high-altitude paramo and frailejon cushion-bog moorland navigation?",
                "chat_history": [],
            },
        )
        assert chat_info_resp.status_code == 200
        chat_info_body = chat_info_resp.json()
        assert "paramo_navigation_info" in chat_info_body
        assert (
            chat_info_body["paramo_navigation_info"]["action"]
            == "paramo_navigation_info"
        )
        assert len(chat_info_body["paramo_navigation_info"]["sites"]) == 5
        assert (
            len(chat_info_body["paramo_navigation_info"]["gear_checklist"])
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
                    "Calculate paramo navigation safety for cushion mat thickness 38 cm, "
                    "histosol water saturation 68%, visibility 220 meters, "
                    "ambient temp 8 C, wind speed 16 km/h, pack weight 14 kg"
                ),
                "chat_history": [],
            },
        ) as stream_resp:
            assert stream_resp.status_code == 200
            raw_text = "".join(stream_resp.iter_text())

        assert "event: metadata" in raw_text
        assert "paramo_navigation_calculated" in raw_text
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
            metadata_payload["action"] == "paramo_navigation_calculated"
        )
        assert "cushion_bearing_safety_factor" in metadata_payload
