from typing import get_args

import pytest
from contoso_chat.chat import handle_penitentes_navigation_intent
from contoso_chat.glacier_navigation import detect_glacier_intent
from contoso_chat.glacier_ski_traverse import detect_glacier_ski_traverse_intent
from contoso_chat.ice_climbing import detect_ice_climbing_intent
from contoso_chat.mountaineering import detect_mountaineering_intent
from contoso_chat.penitentes_navigation import (
    PENITENTES_GEAR_CHECKLIST,
    PENITENTES_SITES,
    AblationMorphologyType,
    CramponTraversalTechnique,
    DiurnalFreezeState,
    PenitentesSafetyStatus,
    build_penitentes_navigation_prompt,
    calculate_penitentes_navigation_dynamics,
    extract_penitentes_navigation_params,
    filter_penitentes_sites,
    format_penitentes_navigation_response,
    get_all_penitentes_sites,
    get_penitentes_gear_checklist,
    get_penitentes_site_by_id,
    is_penitentes_navigation_query,
)
from contoso_chat.snowshoe_mountaineering import detect_snowshoe_intent
from contoso_chat.stream import generate_penitentes_navigation_stream_events
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_penitentes_literals():
    assert set(get_args(AblationMorphologyType)) == {
        "shallow_parabolic_suncup_matrix",
        "deep_suncup_crest_labyrinth",
        "juvenile_micropenitente_serrations",
        "mature_cathedral_nieves_penitentes",
        "rotten_basal_moat_undercut_field",
    }
    assert set(get_args(CramponTraversalTechnique)) == {
        "solar_azimuth_trough_corridor_gliding",
        "crest_ridge_step_bridging",
        "hybrid_frontpoint_stemming",
        "axe_belayed_blade_threading",
    }
    assert set(get_args(DiurnalFreezeState)) == {
        "predawn_vitreous_lockup",
        "midmorning_crust_softening",
        "solar_noon_slush_collapse",
        "late_afternoon_isothermal_rot",
    }
    assert set(get_args(PenitentesSafetyStatus)) == {
        "optimal_predawn_frozen_corridor",
        "caution_crampon_balling_and_ankle_torque",
        "abort_isothermal_blade_collapse",
    }


def test_penitentes_sites_catalog_and_lookup():
    assert len(PENITENTES_SITES) == 5
    all_sites = get_all_penitentes_sites()
    assert len(all_sites) == 5

    expected_ids = {
        "aconcagua-polish-glacier-penitentes",
        "mount-rainier-muir-snowfield-suncups",
        "tupungato-high-puna-ice-pinnacles",
        "mount-shasta-avalanche-gulch-suncups",
        "khumbu-lobuche-east-ablation-spires",
    }
    assert {s["id"] for s in all_sites} == expected_ids

    aconcagua = get_penitentes_site_by_id("aconcagua-polish-glacier-penitentes")
    assert aconcagua is not None
    assert aconcagua["id"] == "aconcagua-polish-glacier-penitentes"
    assert aconcagua["ablation_morphology"] == "mature_cathedral_nieves_penitentes"
    assert aconcagua["recommended_technique"] == "axe_belayed_blade_threading"
    assert aconcagua["diurnal_freeze_state"] == "predawn_vitreous_lockup"
    assert aconcagua["elevation_m"] == 6150
    assert aconcagua["mean_blade_height_cm"] == 185.0
    assert aconcagua["trough_corridor_azimuth_deg"] == 82.0
    assert aconcagua["slope_angle_deg"] == 34.0

    rainier = get_penitentes_site_by_id("mount-rainier-muir-snowfield-suncups")
    assert rainier is not None
    assert rainier["ablation_morphology"] == "deep_suncup_crest_labyrinth"
    assert rainier["recommended_technique"] == "crest_ridge_step_bridging"
    assert rainier["diurnal_freeze_state"] == "midmorning_crust_softening"
    assert rainier["elevation_m"] == 2950
    assert rainier["mean_blade_height_cm"] == 55.0
    assert rainier["trough_corridor_azimuth_deg"] == 98.0
    assert rainier["slope_angle_deg"] == 24.0

    tupungato = get_penitentes_site_by_id("tupungato-high-puna-ice-pinnacles")
    assert tupungato is not None
    assert tupungato["ablation_morphology"] == "mature_cathedral_nieves_penitentes"
    assert tupungato["recommended_technique"] == "hybrid_frontpoint_stemming"
    assert tupungato["diurnal_freeze_state"] == "predawn_vitreous_lockup"
    assert tupungato["elevation_m"] == 5800
    assert tupungato["mean_blade_height_cm"] == 240.0
    assert tupungato["trough_corridor_azimuth_deg"] == 78.0
    assert tupungato["slope_angle_deg"] == 31.0

    shasta = get_penitentes_site_by_id("mount-shasta-avalanche-gulch-suncups")
    assert shasta is not None
    assert shasta["ablation_morphology"] == "shallow_parabolic_suncup_matrix"
    assert shasta["recommended_technique"] == "solar_azimuth_trough_corridor_gliding"
    assert shasta["diurnal_freeze_state"] == "midmorning_crust_softening"
    assert shasta["elevation_m"] == 3650
    assert shasta["mean_blade_height_cm"] == 38.0
    assert shasta["trough_corridor_azimuth_deg"] == 105.0
    assert shasta["slope_angle_deg"] == 32.0

    khumbu = get_penitentes_site_by_id("khumbu-lobuche-east-ablation-spires")
    assert khumbu is not None
    assert khumbu["ablation_morphology"] == "rotten_basal_moat_undercut_field"
    assert khumbu["recommended_technique"] == "axe_belayed_blade_threading"
    assert khumbu["diurnal_freeze_state"] == "solar_noon_slush_collapse"
    assert khumbu["elevation_m"] == 5450
    assert khumbu["mean_blade_height_cm"] == 130.0
    assert khumbu["trough_corridor_azimuth_deg"] == 88.0
    assert khumbu["slope_angle_deg"] == 29.0

    assert get_penitentes_site_by_id("nonexistent-site") is None


def test_filter_penitentes_sites():
    cathedral_sites = filter_penitentes_sites(
        ablation_morphology="mature_cathedral_nieves_penitentes"
    )
    assert len(cathedral_sites) == 2
    assert {s["id"] for s in cathedral_sites} == {
        "aconcagua-polish-glacier-penitentes",
        "tupungato-high-puna-ice-pinnacles",
    }

    threading_sites = filter_penitentes_sites(
        recommended_technique="axe_belayed_blade_threading"
    )
    assert len(threading_sites) == 2
    assert {s["id"] for s in threading_sites} == {
        "aconcagua-polish-glacier-penitentes",
        "khumbu-lobuche-east-ablation-spires",
    }

    predawn_sites = filter_penitentes_sites(
        diurnal_freeze_state="predawn_vitreous_lockup"
    )
    assert len(predawn_sites) == 2

    combined = filter_penitentes_sites(
        ablation_morphology="mature_cathedral_nieves_penitentes",
        recommended_technique="hybrid_frontpoint_stemming",
        diurnal_freeze_state="predawn_vitreous_lockup",
    )
    assert len(combined) == 1
    assert combined[0]["id"] == "tupungato-high-puna-ice-pinnacles"

    with pytest.raises(ValueError, match="Invalid ablation_morphology"):
        filter_penitentes_sites(ablation_morphology="invalid_morphology")

    with pytest.raises(ValueError, match="Invalid recommended_technique"):
        filter_penitentes_sites(recommended_technique="invalid_technique")

    with pytest.raises(ValueError, match="Invalid diurnal_freeze_state"):
        filter_penitentes_sites(diurnal_freeze_state="invalid_freeze_state")


def test_penitentes_gear_checklist():
    assert len(PENITENTES_GEAR_CHECKLIST) == 6
    gear = get_penitentes_gear_checklist()
    assert len(gear) == 6
    assert all(item["mandatory"] is True for item in gear)

    expected_gear = {
        "chromoly-12-point-mountaineering-crampons-antibot": "crampon_traction",
        "hardshell-kevlar-padded-shin-gaiters": "lower_limb_armor",
        "curved-shaft-technical-alpine-ice-axe": "ice_axe_arrest",
        "dual-flicklock-alpine-poles-snow-baskets": "crampon_traction",
        "category-4-glacier-goggles-nose-guard": "solar_glare_protection",
        "high-ankle-stiff-shank-mountaineering-boots": "lower_limb_armor",
    }
    for item in gear:
        assert item["id"] in expected_gear
        assert item["category"] == expected_gear[item["id"]]


def test_calculate_penitentes_navigation_dynamics_regimes():
    # 1. Optimal predawn frozen corridor
    optimal = calculate_penitentes_navigation_dynamics(
        blade_height_cm=95.0,
        trough_spacing_cm=75.0,
        slope_angle_deg=25.0,
        snow_surface_temp_c=-12.0,
        solar_irradiance_wm2=110.0,
        pack_weight_kg=14.0,
        ablation_morphology="mature_cathedral_nieves_penitentes",
        recommended_technique="axe_belayed_blade_threading",
        diurnal_freeze_state="predawn_vitreous_lockup",
    )
    assert optimal["safety_status"] == "optimal_predawn_frozen_corridor"
    assert optimal["effective_horizontal_pace_mhr"] > 200.0
    assert optimal["caloric_energy_multiplier"] >= 1.1
    assert optimal["crampon_antibot_balling_risk_percent"] < 30.0
    assert optimal["blade_moat_collapse_probability"] < 0.30
    assert len(optimal["solar_azimuth_routing_protocol"]) > 20
    assert len(optimal["ankle_torque_and_shin_armor_advisory"]) > 20

    # 2. Caution crampon balling and ankle torque
    caution = calculate_penitentes_navigation_dynamics(
        blade_height_cm=60.0,
        trough_spacing_cm=50.0,
        slope_angle_deg=26.0,
        snow_surface_temp_c=-1.0,
        solar_irradiance_wm2=680.0,
        pack_weight_kg=16.0,
        ablation_morphology="deep_suncup_crest_labyrinth",
        recommended_technique="crest_ridge_step_bridging",
        diurnal_freeze_state="midmorning_crust_softening",
    )
    assert caution["safety_status"] == "caution_crampon_balling_and_ankle_torque"
    assert caution["crampon_antibot_balling_risk_percent"] >= 35.0
    assert caution["effective_horizontal_pace_mhr"] < optimal["effective_horizontal_pace_mhr"]

    # 3. Abort isothermal blade collapse
    abort = calculate_penitentes_navigation_dynamics(
        blade_height_cm=185.0,
        trough_spacing_cm=40.0,
        slope_angle_deg=34.0,
        snow_surface_temp_c=5.0,
        solar_irradiance_wm2=1280.0,
        pack_weight_kg=24.0,
        ablation_morphology="rotten_basal_moat_undercut_field",
        recommended_technique="axe_belayed_blade_threading",
        diurnal_freeze_state="solar_noon_slush_collapse",
    )
    assert abort["safety_status"] == "abort_isothermal_blade_collapse"
    assert abort["blade_moat_collapse_probability"] >= 0.62
    assert abort["crampon_antibot_balling_risk_percent"] >= 70.0
    assert abort["caloric_energy_multiplier"] > caution["caloric_energy_multiplier"]


@pytest.mark.parametrize(
    "invalid_kwargs",
    [
        {"blade_height_cm": 4.0},
        {"blade_height_cm": 405.0},
        {"trough_spacing_cm": 8.0},
        {"trough_spacing_cm": 260.0},
        {"slope_angle_deg": -1.0},
        {"slope_angle_deg": 66.0},
        {"snow_surface_temp_c": -46.0},
        {"snow_surface_temp_c": 16.0},
        {"solar_irradiance_wm2": -10.0},
        {"solar_irradiance_wm2": 1650.0},
        {"pack_weight_kg": -1.0},
        {"pack_weight_kg": 56.0},
        {"ablation_morphology": "invalid_morph"},
        {"recommended_technique": "invalid_tech"},
        {"diurnal_freeze_state": "invalid_state"},
    ],
)
def test_calculate_penitentes_navigation_validation_errors(invalid_kwargs):
    base_kwargs = {
        "blade_height_cm": 120.0,
        "trough_spacing_cm": 65.0,
        "slope_angle_deg": 28.0,
        "snow_surface_temp_c": -6.0,
        "solar_irradiance_wm2": 350.0,
        "pack_weight_kg": 16.0,
    }
    base_kwargs.update(invalid_kwargs)
    with pytest.raises(ValueError):
        calculate_penitentes_navigation_dynamics(**base_kwargs)


def test_is_penitentes_navigation_query_and_disambiguation():
    # Positive queries
    assert is_penitentes_navigation_query("How do I navigate nieves penitentes on Aconcagua Polish Glacier?") is True
    assert is_penitentes_navigation_query("Calculate suncup crampon pace on Mount Rainier Muir Snowfield") is True
    assert is_penitentes_navigation_query("Sun-cup trough gliding on Mount Shasta Avalanche Gulch") is True
    assert is_penitentes_navigation_query("Volcán Tupungato penitentes frontpoint stemming") is True
    assert is_penitentes_navigation_query("Khumbu Lobuche East ablation spires basal moat collapse") is True
    assert is_penitentes_navigation_query("What gear prevents ankle torque in deep sun cup fields?") is True

    # Negative queries
    assert is_penitentes_navigation_query("") is False
    assert is_penitentes_navigation_query("   ") is False
    assert is_penitentes_navigation_query("Track my order #98765") is False
    assert is_penitentes_navigation_query("I want a refund for my jacket") is False
    assert is_penitentes_navigation_query("What is the best fly fishing rod for trout?") is False

    # Cross-domain disambiguation: generic glacier/mountaineering/snowshoe/ice-climbing modules must ignore penitentes queries
    disambig_queries = [
        "Navigate penitentes and ablation spires on Khumbu Glacier with crampons and ice axe",
        "Mount Rainier Muir Snowfield sun-cup matrix crampon crest-ridge step-bridging",
        "Mount Shasta Avalanche Gulch suncup troughs and solar azimuth corridor gliding",
        "Nieves penitentes ablation blade threading on Aconcagua Polish Glacier",
    ]
    for q in disambig_queries:
        assert is_penitentes_navigation_query(q) is True
        assert detect_glacier_intent(q) is None
        assert detect_glacier_ski_traverse_intent(q) is False
        assert detect_mountaineering_intent(q) is None
        assert detect_snowshoe_intent(q) is None
        assert detect_ice_climbing_intent(q) is None


def test_extract_penitentes_navigation_params():
    q = (
        "Calculate penitentes navigation on Aconcagua with blade height 190 cm, "
        "trough spacing 55 cm, slope 34 deg, temp -8 C, solar 250 W/m2, pack 18 kg"
    )
    params = extract_penitentes_navigation_params(q)
    assert params["site_id"] == "aconcagua-polish-glacier-penitentes"
    assert params["blade_height_cm"] == 190.0
    assert params["trough_spacing_cm"] == 55.0
    assert params["slope_angle_deg"] == 34.0
    assert params["snow_surface_temp_c"] == -8.0
    assert params["solar_irradiance_wm2"] == 250.0
    assert params["pack_weight_kg"] == 18.0
    assert params["is_calculation"] is True


def test_format_penitentes_navigation_response_actions():
    # 1. Calculated action
    ans_calc, info_calc = format_penitentes_navigation_response(
        "Calculate penitentes pace for blade height 160 cm, trough spacing 50 cm, slope 32 deg, temp -9 C, solar 200 W/m2, pack 16 kg"
    )
    assert isinstance(ans_calc, str) and len(ans_calc) > 20
    assert info_calc["action"] == "penitentes_navigation_calculated"
    assert "effective_horizontal_pace_mhr" in info_calc
    assert "safety_status" in info_calc

    # 2. Lookup action
    ans_lookup, info_lookup = format_penitentes_navigation_response(
        "Tell me about Aconcagua Polish Glacier penitentes site details"
    )
    assert isinstance(ans_lookup, str) and "Aconcagua" in ans_lookup
    assert info_lookup["action"] == "penitentes_navigation_lookup"
    assert info_lookup["site"]["id"] == "aconcagua-polish-glacier-penitentes"

    # 3. General info action
    ans_info, info_general = format_penitentes_navigation_response(
        "What mandatory gear and techniques are used for sun-cup and penitentes navigation?"
    )
    assert isinstance(ans_info, str) and len(ans_info) > 20
    assert info_general["action"] == "penitentes_navigation_info"
    assert len(info_general["sites"]) == 5
    assert len(info_general["gear_checklist"]) == 6


def test_router_endpoints_and_validation():
    res_sites = client.get("/api/penitentes-navigation/sites")
    assert res_sites.status_code == 200
    assert len(res_sites.json()) == 5

    res_filtered = client.get(
        "/penitentes-navigation/sites?ablation_morphology=deep_suncup_crest_labyrinth"
    )
    assert res_filtered.status_code == 200
    assert len(res_filtered.json()) == 1
    assert res_filtered.json()[0]["id"] == "mount-rainier-muir-snowfield-suncups"

    res_invalid_filter = client.get(
        "/api/penitentes-navigation/sites?ablation_morphology=not_a_real_morphology"
    )
    assert res_invalid_filter.status_code == 422

    res_site = client.get(
        "/api/penitentes-navigation/sites/tupungato-high-puna-ice-pinnacles"
    )
    assert res_site.status_code == 200
    assert res_site.json()["id"] == "tupungato-high-puna-ice-pinnacles"

    res_404 = client.get("/api/penitentes-navigation/sites/unknown-penitentes-zone")
    assert res_404.status_code == 404

    res_calc = client.post(
        "/api/penitentes-navigation/calculate",
        json={
            "blade_height_cm": 140.0,
            "trough_spacing_cm": 60.0,
            "slope_angle_deg": 30.0,
            "snow_surface_temp_c": -10.0,
            "solar_irradiance_wm2": 180.0,
            "pack_weight_kg": 15.0,
        },
    )
    assert res_calc.status_code == 200
    assert res_calc.json()["safety_status"] == "optimal_predawn_frozen_corridor"

    res_calc_422 = client.post(
        "/api/penitentes-navigation/calculate",
        json={
            "blade_height_cm": 999.0,
            "trough_spacing_cm": 60.0,
            "slope_angle_deg": 30.0,
            "snow_surface_temp_c": -10.0,
            "solar_irradiance_wm2": 180.0,
            "pack_weight_kg": 15.0,
        },
    )
    assert res_calc_422.status_code == 422

    res_gear = client.get("/api/penitentes-navigation/gear")
    assert res_gear.status_code == 200
    assert len(res_gear.json()) == 6


@pytest.mark.anyio
async def test_prompt_chat_and_stream_helpers():
    prompt = build_penitentes_navigation_prompt("Aconcagua Polish Glacier penitentes")
    assert "Aconcagua" in prompt
    assert "Penitentes" in prompt

    chat_res = handle_penitentes_navigation_intent(
        "Tell me about Aconcagua Polish Glacier penitentes"
    )
    assert chat_res is not None
    assert chat_res["penitentes_navigation_info"]["action"] == "penitentes_navigation_lookup"
    assert handle_penitentes_navigation_intent("Where is my order #12345?") is None

    events = []
    async for chunk in generate_penitentes_navigation_stream_events(
        "Calculate penitentes pace for blade height 150 cm and slope 30 deg"
    ):
        events.append(chunk)
    assert len(events) > 0
    assert any("penitentes_navigation_calculated" in e for e in events)
