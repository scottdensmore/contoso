import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_penitentes_navigation_journey():
    """Multi-step API user journey test for High-Alpine Snowfield Sun-Cup & Penitentes Crampon Navigation:

    Step 1: Health probes (/health, /, /api/health)
    Step 2: Catalog discovery & filtering (/api/penitentes-navigation/sites + filters + 422 validation)
    Step 3: Single site detail lookup (aconcagua-polish-glacier-penitentes) & 404 check
    Step 4: Navigation dynamics calculation (POST /api/penitentes-navigation/calculate: nominal predawn vs critical midday isothermal collapse + 422 validation)
    Step 5: Mandatory gear checklist (GET /api/penitentes-navigation/gear)
    Step 6: Synchronous chat endpoint (POST /api/chat for calculation, site lookup, and general info)
    Step 7: Streaming SSE chat endpoint (POST /api/chat/stream verifying event: metadata action and event: done)
    """
    # -------------------------------------------------------------------------
    # Step 1: Health probes (/health, /, /api/health)
    # -------------------------------------------------------------------------
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_root = client.get("/")
    assert res_root.status_code == 200
    assert res_root.json()["status"] == "running"

    res_api_health = client.get("/api/health")
    assert res_api_health.status_code == 200
    assert res_api_health.json()["status"] == "healthy"

    # -------------------------------------------------------------------------
    # Step 2: Catalog discovery & filtering (/api/penitentes-navigation/sites + filters + 422 validation)
    # -------------------------------------------------------------------------
    res_sites = client.get("/api/penitentes-navigation/sites")
    assert res_sites.status_code == 200
    sites = res_sites.json()
    assert len(sites) == 5
    site_ids = {s["id"] for s in sites}
    assert site_ids == {
        "aconcagua-polish-glacier-penitentes",
        "mount-rainier-muir-snowfield-suncups",
        "tupungato-high-puna-ice-pinnacles",
        "mount-shasta-avalanche-gulch-suncups",
        "khumbu-lobuche-east-ablation-spires",
    }

    res_morph = client.get(
        "/api/penitentes-navigation/sites?ablation_morphology=mature_cathedral_nieves_penitentes"
    )
    assert res_morph.status_code == 200
    assert len(res_morph.json()) == 2

    res_tech = client.get(
        "/api/penitentes-navigation/sites?recommended_technique=crest_ridge_step_bridging"
    )
    assert res_tech.status_code == 200
    assert len(res_tech.json()) == 1
    assert res_tech.json()[0]["id"] == "mount-rainier-muir-snowfield-suncups"

    res_freeze = client.get(
        "/api/penitentes-navigation/sites?diurnal_freeze_state=solar_noon_slush_collapse"
    )
    assert res_freeze.status_code == 200
    assert len(res_freeze.json()) == 1
    assert res_freeze.json()[0]["id"] == "khumbu-lobuche-east-ablation-spires"

    res_invalid_filter = client.get(
        "/api/penitentes-navigation/sites?ablation_morphology=invalid_morphology"
    )
    assert res_invalid_filter.status_code == 422

    # -------------------------------------------------------------------------
    # Step 3: Single site detail lookup (aconcagua-polish-glacier-penitentes) & 404 check
    # -------------------------------------------------------------------------
    res_aconcagua = client.get(
        "/api/penitentes-navigation/sites/aconcagua-polish-glacier-penitentes"
    )
    assert res_aconcagua.status_code == 200
    aconcagua = res_aconcagua.json()
    assert aconcagua["id"] == "aconcagua-polish-glacier-penitentes"
    assert aconcagua["ablation_morphology"] == "mature_cathedral_nieves_penitentes"
    assert aconcagua["recommended_technique"] == "axe_belayed_blade_threading"
    assert aconcagua["diurnal_freeze_state"] == "predawn_vitreous_lockup"
    assert aconcagua["elevation_m"] == 6150
    assert aconcagua["mean_blade_height_cm"] == 185.0
    assert aconcagua["trough_corridor_azimuth_deg"] == 82.0
    assert aconcagua["slope_angle_deg"] == 34.0

    res_404 = client.get("/api/penitentes-navigation/sites/nonexistent-site")
    assert res_404.status_code == 404

    # -------------------------------------------------------------------------
    # Step 4: Navigation dynamics calculation (nominal predawn vs critical midday isothermal collapse + 422 validation)
    # -------------------------------------------------------------------------
    predawn_payload = {
        "blade_height_cm": 95.0,
        "trough_spacing_cm": 75.0,
        "slope_angle_deg": 24.0,
        "snow_surface_temp_c": -11.0,
        "solar_irradiance_wm2": 120.0,
        "pack_weight_kg": 14.0,
        "ablation_morphology": "mature_cathedral_nieves_penitentes",
        "recommended_technique": "axe_belayed_blade_threading",
        "diurnal_freeze_state": "predawn_vitreous_lockup",
    }
    res_predawn = client.post(
        "/api/penitentes-navigation/calculate", json=predawn_payload
    )
    assert res_predawn.status_code == 200
    predawn_data = res_predawn.json()
    assert predawn_data["safety_status"] == "optimal_predawn_frozen_corridor"
    assert predawn_data["crampon_antibot_balling_risk_percent"] < 30.0
    assert predawn_data["blade_moat_collapse_probability"] < 0.30

    midday_payload = {
        "blade_height_cm": 195.0,
        "trough_spacing_cm": 38.0,
        "slope_angle_deg": 35.0,
        "snow_surface_temp_c": 6.0,
        "solar_irradiance_wm2": 1350.0,
        "pack_weight_kg": 25.0,
        "ablation_morphology": "rotten_basal_moat_undercut_field",
        "recommended_technique": "axe_belayed_blade_threading",
        "diurnal_freeze_state": "solar_noon_slush_collapse",
    }
    res_midday = client.post(
        "/api/penitentes-navigation/calculate", json=midday_payload
    )
    assert res_midday.status_code == 200
    midday_data = res_midday.json()
    assert midday_data["safety_status"] == "abort_isothermal_blade_collapse"
    assert (
        midday_data["effective_horizontal_pace_mhr"]
        < predawn_data["effective_horizontal_pace_mhr"]
    )
    assert (
        midday_data["caloric_energy_multiplier"]
        > predawn_data["caloric_energy_multiplier"]
    )
    assert midday_data["blade_moat_collapse_probability"] >= 0.62

    res_calc_422 = client.post(
        "/api/penitentes-navigation/calculate",
        json={
            "blade_height_cm": 2.0,
            "trough_spacing_cm": 60.0,
            "slope_angle_deg": 28.0,
            "snow_surface_temp_c": -5.0,
            "solar_irradiance_wm2": 400.0,
            "pack_weight_kg": 15.0,
        },
    )
    assert res_calc_422.status_code == 422

    # -------------------------------------------------------------------------
    # Step 5: Mandatory gear checklist (GET /api/penitentes-navigation/gear)
    # -------------------------------------------------------------------------
    res_gear = client.get("/api/penitentes-navigation/gear")
    assert res_gear.status_code == 200
    gear = res_gear.json()
    assert len(gear) == 6
    assert all(item["mandatory"] is True for item in gear)
    assert {item["id"] for item in gear} == {
        "chromoly-12-point-mountaineering-crampons-antibot",
        "hardshell-kevlar-padded-shin-gaiters",
        "curved-shaft-technical-alpine-ice-axe",
        "dual-flicklock-alpine-poles-snow-baskets",
        "category-4-glacier-goggles-nose-guard",
        "high-ankle-stiff-shank-mountaineering-boots",
    }

    # -------------------------------------------------------------------------
    # Step 6: Synchronous chat endpoint (POST /api/chat for calculation, site lookup, and general info)
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res_chat_calc = client.post(
            "/api/chat",
            json={
                "question": "Calculate penitentes navigation pace with blade height 180 cm, trough spacing 50 cm, slope 34 deg, temp -9 C, solar 180 W/m2, pack 16 kg"
            },
        )
        assert res_chat_calc.status_code == 200
        chat_calc_body = res_chat_calc.json()
        assert (
            chat_calc_body["penitentes_navigation_info"]["action"]
            == "penitentes_navigation_calculated"
        )
        assert "effective_horizontal_pace_mhr" in chat_calc_body["penitentes_navigation_info"]

        res_chat_lookup = client.post(
            "/api/chat",
            json={
                "question": "Tell me about Aconcagua Polish Glacier penitentes site details"
            },
        )
        assert res_chat_lookup.status_code == 200
        chat_lookup_body = res_chat_lookup.json()
        assert (
            chat_lookup_body["penitentes_navigation_info"]["action"]
            == "penitentes_navigation_lookup"
        )
        assert (
            chat_lookup_body["penitentes_navigation_info"]["site"]["id"]
            == "aconcagua-polish-glacier-penitentes"
        )

        res_chat_info = client.post(
            "/api/chat",
            json={
                "question": "What mandatory gear and crampon techniques are needed for sun-cup and nieves penitentes navigation?"
            },
        )
        assert res_chat_info.status_code == 200
        chat_info_body = res_chat_info.json()
        assert (
            chat_info_body["penitentes_navigation_info"]["action"]
            == "penitentes_navigation_info"
        )
        assert len(chat_info_body["penitentes_navigation_info"]["gear_checklist"]) == 6

        # -------------------------------------------------------------------------
        # Step 7: Streaming SSE chat endpoint (POST /api/chat/stream verifying event: metadata action and event: done)
        # -------------------------------------------------------------------------
        res_stream = client.post(
            "/api/chat/stream",
            json={
                "question": "Calculate penitentes navigation dynamics for blade height 150 cm, trough spacing 60 cm, slope 30 deg, temp -8 C, solar 200 W/m2, pack 15 kg"
            },
        )
        assert res_stream.status_code == 200
        stream_text = res_stream.text
        assert "event: metadata" in stream_text
        assert "penitentes_navigation_calculated" in stream_text
        assert "event: done" in stream_text

        metadata_payload = None
        for block in stream_text.split("\n\n"):
            lines = [ln.strip() for ln in block.strip().splitlines() if ln.strip()]
            if len(lines) >= 2 and lines[0] == "event: metadata" and lines[1].startswith("data: "):
                metadata_payload = json.loads(lines[1].removeprefix("data: "))
                break
        assert metadata_payload is not None
        assert metadata_payload["action"] == "penitentes_navigation_calculated"
