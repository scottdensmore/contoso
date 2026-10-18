from typing import get_args

import pytest
from contoso_chat.cave_mineralogy import detect_cave_mineralogy_intent
from contoso_chat.chat import handle_solfatara_navigation_intent
from contoso_chat.hot_springs import detect_hot_spring_intent
from contoso_chat.lava_tube_biospeleology import detect_lava_tube_biospeleology_intent
from contoso_chat.smoke_advisory import detect_smoke_advisory_intent
from contoso_chat.solfatara_navigation import (
    SOLFATARA_GEAR_CHECKLIST,
    SOLFATARA_SITES,
    BoundaryLayerWindState,
    HydrothermalCrustType,
    SolfataraSafetyStatus,
    VolcanicGasRegime,
    build_solfatara_navigation_prompt,
    calculate_solfatara_navigation_safety,
    extract_solfatara_navigation_params,
    filter_solfatara_sites,
    format_solfatara_navigation_response,
    get_all_solfatara_sites,
    get_solfatara_gear_checklist,
    get_solfatara_site_by_id,
    is_solfatara_navigation_query,
)
from contoso_chat.stream import generate_solfatara_navigation_stream_events
from contoso_chat.weather_station import detect_weather_station_intent
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_solfatara_literals():
    assert set(get_args(HydrothermalCrustType)) == {
        "siliceous_geyserite_sinter_shield",
        "argillic_kaolinite_steam_crust",
        "native_sulfur_sublimation_dome",
        "travertine_carbonate_terrace",
        "undercut_boiling_mudpot_apron",
    }
    assert set(get_args(VolcanicGasRegime)) == {
        "h2s_so2_acid_fume_plume",
        "co2_cold_mofette_topographic_pooling",
        "superheated_fumarolic_steam_jet",
        "mixed_solfatara_degassing_basin",
    }
    assert set(get_args(BoundaryLayerWindState)) == {
        "katabatic_calms_inversion_trap",
        "steady_upwind_ridge_ventilation",
        "gusty_rotors_plume_downwash",
        "barometric_drop_outgassing_surge",
    }
    assert set(get_args(SolfataraSafetyStatus)) == {
        "nominal_upwind_sinter_corridor",
        "caution_acid_plume_respirator_required",
        "abort_lethal_gas_pool_or_crust_collapse",
    }


def test_solfatara_sites_catalog_and_lookup():
    assert len(SOLFATARA_SITES) == 5
    all_sites = get_all_solfatara_sites()
    assert len(all_sites) == 5

    expected_ids = {
        "katmai-valley-of-ten-thousand-smokes-fumaroles",
        "lassens-bumpass-hell-devil-kitchen-solfatara",
        "askja-viti-kverkfjoll-geothermal-ice-fumaroles",
        "el-tatio-atacama-high-altitude-geyser-sinter",
        "mutnovsky-active-crater-sulfur-fumarole-canyon",
    }
    assert {s["id"] for s in all_sites} == expected_ids

    katmai = get_solfatara_site_by_id("katmai-valley-of-ten-thousand-smokes-fumaroles")
    assert katmai is not None
    assert katmai["id"] == "katmai-valley-of-ten-thousand-smokes-fumaroles"
    assert katmai["crust_type"] == "siliceous_geyserite_sinter_shield"
    assert katmai["gas_regime"] == "superheated_fumarolic_steam_jet"
    assert katmai["wind_state"] == "steady_upwind_ridge_ventilation"
    assert katmai["elevation"] == 840
    assert katmai["mean_crust_thickness_cm"] == 28.0
    assert katmai["subsurface_temp_10cm_c"] == 62.0
    assert katmai["basin_depression_depth_m"] == 2.5
    assert katmai["baseline_so2_ppm"] == 1.2
    assert katmai["baseline_h2s_ppm"] == 0.8

    lassen = get_solfatara_site_by_id("lassens-bumpass-hell-devil-kitchen-solfatara")
    assert lassen is not None
    assert lassen["crust_type"] == "argillic_kaolinite_steam_crust"
    assert lassen["gas_regime"] == "h2s_so2_acid_fume_plume"
    assert lassen["wind_state"] == "gusty_rotors_plume_downwash"
    assert lassen["elevation"] == 2500
    assert lassen["mean_crust_thickness_cm"] == 14.0
    assert lassen["subsurface_temp_10cm_c"] == 84.0
    assert lassen["basin_depression_depth_m"] == 5.5
    assert lassen["baseline_so2_ppm"] == 3.8
    assert lassen["baseline_h2s_ppm"] == 6.5

    askja = get_solfatara_site_by_id("askja-viti-kverkfjoll-geothermal-ice-fumaroles")
    assert askja is not None
    assert askja["crust_type"] == "undercut_boiling_mudpot_apron"
    assert askja["gas_regime"] == "mixed_solfatara_degassing_basin"
    assert askja["wind_state"] == "barometric_drop_outgassing_surge"
    assert askja["elevation"] == 1100
    assert askja["mean_crust_thickness_cm"] == 9.0
    assert askja["subsurface_temp_10cm_c"] == 92.0
    assert askja["basin_depression_depth_m"] == 11.0
    assert askja["baseline_so2_ppm"] == 8.5
    assert askja["baseline_h2s_ppm"] == 14.0

    el_tatio = get_solfatara_site_by_id("el-tatio-atacama-high-altitude-geyser-sinter")
    assert el_tatio is not None
    assert el_tatio["crust_type"] == "travertine_carbonate_terrace"
    assert el_tatio["gas_regime"] == "superheated_fumarolic_steam_jet"
    assert el_tatio["wind_state"] == "katabatic_calms_inversion_trap"
    assert el_tatio["elevation"] == 4320
    assert el_tatio["mean_crust_thickness_cm"] == 22.0
    assert el_tatio["subsurface_temp_10cm_c"] == 76.0
    assert el_tatio["basin_depression_depth_m"] == 3.0
    assert el_tatio["baseline_so2_ppm"] == 1.8
    assert el_tatio["baseline_h2s_ppm"] == 2.4

    mutnovsky = get_solfatara_site_by_id("mutnovsky-active-crater-sulfur-fumarole-canyon")
    assert mutnovsky is not None
    assert mutnovsky["crust_type"] == "native_sulfur_sublimation_dome"
    assert mutnovsky["gas_regime"] == "co2_cold_mofette_topographic_pooling"
    assert mutnovsky["wind_state"] == "katabatic_calms_inversion_trap"
    assert mutnovsky["elevation"] == 1680
    assert mutnovsky["mean_crust_thickness_cm"] == 11.0
    assert mutnovsky["subsurface_temp_10cm_c"] == 89.0
    assert mutnovsky["basin_depression_depth_m"] == 14.0
    assert mutnovsky["baseline_so2_ppm"] == 12.0
    assert mutnovsky["baseline_h2s_ppm"] == 18.5

    assert get_solfatara_site_by_id("nonexistent-solfatara-site") is None


def test_filter_solfatara_sites():
    sinter_sites = filter_solfatara_sites(crust_type="siliceous_geyserite_sinter_shield")
    assert len(sinter_sites) == 1
    assert sinter_sites[0]["id"] == "katmai-valley-of-ten-thousand-smokes-fumaroles"

    steam_sites = filter_solfatara_sites(gas_regime="superheated_fumarolic_steam_jet")
    assert len(steam_sites) == 2
    assert {s["id"] for s in steam_sites} == {
        "katmai-valley-of-ten-thousand-smokes-fumaroles",
        "el-tatio-atacama-high-altitude-geyser-sinter",
    }

    katabatic_sites = filter_solfatara_sites(wind_state="katabatic_calms_inversion_trap")
    assert len(katabatic_sites) == 2
    assert {s["id"] for s in katabatic_sites} == {
        "el-tatio-atacama-high-altitude-geyser-sinter",
        "mutnovsky-active-crater-sulfur-fumarole-canyon",
    }

    combined = filter_solfatara_sites(
        crust_type="native_sulfur_sublimation_dome",
        gas_regime="co2_cold_mofette_topographic_pooling",
        wind_state="katabatic_calms_inversion_trap",
    )
    assert len(combined) == 1
    assert combined[0]["id"] == "mutnovsky-active-crater-sulfur-fumarole-canyon"

    with pytest.raises(ValueError, match="Invalid crust_type"):
        filter_solfatara_sites(crust_type="invalid_crust_type")

    with pytest.raises(ValueError, match="Invalid gas_regime"):
        filter_solfatara_sites(gas_regime="invalid_gas_regime")

    with pytest.raises(ValueError, match="Invalid wind_state"):
        filter_solfatara_sites(wind_state="invalid_wind_state")


def test_solfatara_gear_checklist():
    assert len(SOLFATARA_GEAR_CHECKLIST) == 6
    gear = get_solfatara_gear_checklist()
    assert len(gear) == 6
    assert all(item["mandatory"] is True for item in gear)

    expected_gear = {
        "four-gas-pumped-electrochemical-detector": "gas_telemetry",
        "niorsh-ov-ag-p100-acid-gas-half-mask-respirator": "respiratory_defense",
        "carbon-fiber-graduated-thermal-crust-probe-pole": "crust_probing",
        "sealed-polycarbonate-chemical-splash-goggles": "respiratory_defense",
        "bi-metal-soil-probe-stem-thermometer": "crust_probing",
        "ptfe-acid-resistant-overboots-and-gaiters": "thermal_footwear",
    }
    for item in gear:
        assert item["id"] in expected_gear
        assert item["category"] == expected_gear[item["id"]]


def test_calculate_solfatara_navigation_safety_regimes():
    # 1. Nominal upwind sinter corridor
    nominal = calculate_solfatara_navigation_safety(
        sinter_crust_thickness_cm=32.0,
        subsurface_temp_10cm_c=52.0,
        wind_speed_kmh=24.0,
        basin_depression_depth_m=2.0,
        ambient_so2_ppm=0.8,
        ambient_h2s_ppm=0.5,
        crust_type="siliceous_geyserite_sinter_shield",
        gas_regime="superheated_fumarolic_steam_jet",
        wind_state="steady_upwind_ridge_ventilation",
    )
    assert nominal["safety_status"] == "nominal_upwind_sinter_corridor"
    assert nominal["crust_bearing_safety_factor"] >= 1.8
    assert nominal["scald_breakthrough_probability"] < 0.25
    assert nominal["dense_gas_accumulation_index"] < 35.0
    assert nominal["recommended_standoff_distance_m"] >= 5.0
    assert len(nominal["windward_routing_protocol"]) > 20
    assert len(nominal["crust_probing_and_respirator_advisory"]) > 20

    # 2. Caution acid plume respirator required
    caution = calculate_solfatara_navigation_safety(
        sinter_crust_thickness_cm=15.0,
        subsurface_temp_10cm_c=82.0,
        wind_speed_kmh=12.0,
        basin_depression_depth_m=5.5,
        ambient_so2_ppm=4.2,
        ambient_h2s_ppm=6.8,
        crust_type="argillic_kaolinite_steam_crust",
        gas_regime="h2s_so2_acid_fume_plume",
        wind_state="gusty_rotors_plume_downwash",
    )
    assert caution["safety_status"] == "caution_acid_plume_respirator_required"
    assert caution["crust_bearing_safety_factor"] < nominal["crust_bearing_safety_factor"]
    assert caution["scald_breakthrough_probability"] > nominal["scald_breakthrough_probability"]
    assert caution["recommended_standoff_distance_m"] > nominal["recommended_standoff_distance_m"]

    # 3. Abort lethal gas pool or crust collapse
    abort = calculate_solfatara_navigation_safety(
        sinter_crust_thickness_cm=6.0,
        subsurface_temp_10cm_c=98.0,
        wind_speed_kmh=2.0,
        basin_depression_depth_m=18.0,
        ambient_so2_ppm=18.0,
        ambient_h2s_ppm=26.0,
        crust_type="undercut_boiling_mudpot_apron",
        gas_regime="co2_cold_mofette_topographic_pooling",
        wind_state="katabatic_calms_inversion_trap",
    )
    assert abort["safety_status"] == "abort_lethal_gas_pool_or_crust_collapse"
    assert abort["scald_breakthrough_probability"] >= 0.65
    assert abort["dense_gas_accumulation_index"] >= 70.0
    assert abort["recommended_standoff_distance_m"] > caution["recommended_standoff_distance_m"]


@pytest.mark.parametrize(
    "invalid_kwargs",
    [
        {"sinter_crust_thickness_cm": 0.5},
        {"sinter_crust_thickness_cm": 155.0},
        {"subsurface_temp_10cm_c": -1.0},
        {"subsurface_temp_10cm_c": 135.0},
        {"wind_speed_kmh": -2.0},
        {"wind_speed_kmh": 125.0},
        {"basin_depression_depth_m": -0.5},
        {"basin_depression_depth_m": 65.0},
        {"ambient_so2_ppm": -0.1},
        {"ambient_so2_ppm": 105.0},
        {"ambient_h2s_ppm": -0.1},
        {"ambient_h2s_ppm": 105.0},
        {"crust_type": "invalid_crust"},
        {"gas_regime": "invalid_gas"},
        {"wind_state": "invalid_wind"},
    ],
)
def test_calculate_solfatara_navigation_validation_errors(invalid_kwargs):
    base_kwargs = {
        "sinter_crust_thickness_cm": 22.0,
        "subsurface_temp_10cm_c": 70.0,
        "wind_speed_kmh": 18.0,
        "basin_depression_depth_m": 4.0,
        "ambient_so2_ppm": 2.0,
        "ambient_h2s_ppm": 3.0,
    }
    base_kwargs.update(invalid_kwargs)
    with pytest.raises(ValueError):
        calculate_solfatara_navigation_safety(**base_kwargs)


def test_is_solfatara_navigation_query_and_disambiguation():
    # Positive queries
    assert is_solfatara_navigation_query("How do I navigate fumarole fields in Katmai Valley of Ten Thousand Smokes?") is True
    assert is_solfatara_navigation_query("Calculate solfatara sinter crust safety at Bumpass Hell Lassen") is True
    assert is_solfatara_navigation_query("Mofette CO2 pooling and H2S hazard in Mutnovsky Volcano crater") is True
    assert is_solfatara_navigation_query("El Tatio geyserite sinter crust thickness and thermal probe") is True
    assert is_solfatara_navigation_query("Askja Viti and Kverkfjoll boiling mudpot apron navigation") is True
    assert is_solfatara_navigation_query("What respirator protects against sulfur dioxide and hydrogen sulfide in a solfatara?") is True

    # Negative queries
    assert is_solfatara_navigation_query("") is False
    assert is_solfatara_navigation_query("   ") is False
    assert is_solfatara_navigation_query("Track my order #98765") is False
    assert is_solfatara_navigation_query("I want a refund for my boots") is False
    assert is_solfatara_navigation_query("What is the best fly fishing rod for trout?") is False

    # Cross-domain disambiguation: adjacent modules must ignore solfatara/fumarole/mofette queries
    disambig_queries = [
        "Navigate geothermal fumarole sinter crust and boiling mudpot apron with H2S gas detector",
        "Solfatara sulfur dioxide plume respirator and mofette gas pooling in volcanic crater",
        "Geyserite sinter crust probing and hydrogen sulfide telemetry at Bumpass Hell",
        "Travertine sinter crust fumarole field navigation at El Tatio",
    ]
    for q in disambig_queries:
        assert is_solfatara_navigation_query(q) is True
        assert detect_hot_spring_intent(q) is None
        assert detect_smoke_advisory_intent(q) is False
        assert detect_lava_tube_biospeleology_intent(q) is False
        assert detect_cave_mineralogy_intent(q) is None
        assert detect_weather_station_intent(q) is None


def test_extract_solfatara_navigation_params():
    q = (
        "Calculate solfatara navigation safety at Bumpass Hell with crust thickness 14 cm, "
        "subsurface temp 84 C, wind speed 16 km/h, depression depth 6 m, SO2 4.5 ppm, H2S 7.2 ppm"
    )
    params = extract_solfatara_navigation_params(q)
    assert params["site_id"] == "lassens-bumpass-hell-devil-kitchen-solfatara"
    assert params["sinter_crust_thickness_cm"] == 14.0
    assert params["subsurface_temp_10cm_c"] == 84.0
    assert params["wind_speed_kmh"] == 16.0
    assert params["basin_depression_depth_m"] == 6.0
    assert params["ambient_so2_ppm"] == 4.5
    assert params["ambient_h2s_ppm"] == 7.2
    assert params["is_calculation"] is True


def test_format_solfatara_navigation_response_actions():
    # 1. Calculated action
    ans_calc, info_calc = format_solfatara_navigation_response(
        "Calculate solfatara safety for crust thickness 28 cm, subsurface temp 62 C, wind speed 22 km/h, depression depth 2.5 m, SO2 1.2 ppm, H2S 0.8 ppm"
    )
    assert isinstance(ans_calc, str) and len(ans_calc) > 20
    assert info_calc["action"] == "solfatara_navigation_calculated"
    assert "crust_bearing_safety_factor" in info_calc
    assert "safety_status" in info_calc

    # 2. Lookup action
    ans_lookup, info_lookup = format_solfatara_navigation_response(
        "Tell me about Katmai Valley of Ten Thousand Smokes fumaroles site details"
    )
    assert isinstance(ans_lookup, str) and "Valley of Ten Thousand Smokes" in ans_lookup
    assert info_lookup["action"] == "solfatara_navigation_lookup"
    assert info_lookup["site"]["id"] == "katmai-valley-of-ten-thousand-smokes-fumaroles"

    # 3. General info action
    ans_info, info_general = format_solfatara_navigation_response(
        "What mandatory gear and protocols are used for backcountry solfatara and fumarole navigation?"
    )
    assert isinstance(ans_info, str) and len(ans_info) > 20
    assert info_general["action"] == "solfatara_navigation_info"
    assert len(info_general["sites"]) == 5
    assert len(info_general["gear_checklist"]) == 6


def test_router_endpoints_and_validation():
    res_sites = client.get("/api/solfatara-navigation/sites")
    assert res_sites.status_code == 200
    assert len(res_sites.json()) == 5

    res_filtered = client.get(
        "/solfatara-navigation/sites?crust_type=argillic_kaolinite_steam_crust"
    )
    assert res_filtered.status_code == 200
    assert len(res_filtered.json()) == 1
    assert res_filtered.json()[0]["id"] == "lassens-bumpass-hell-devil-kitchen-solfatara"

    res_invalid_filter = client.get(
        "/api/solfatara-navigation/sites?crust_type=not_a_real_crust"
    )
    assert res_invalid_filter.status_code == 422

    res_site = client.get(
        "/api/solfatara-navigation/sites/katmai-valley-of-ten-thousand-smokes-fumaroles"
    )
    assert res_site.status_code == 200
    assert res_site.json()["id"] == "katmai-valley-of-ten-thousand-smokes-fumaroles"

    res_404 = client.get("/api/solfatara-navigation/sites/unknown-solfatara-zone")
    assert res_404.status_code == 404

    res_calc = client.post(
        "/api/solfatara-navigation/calculate",
        json={
            "sinter_crust_thickness_cm": 30.0,
            "subsurface_temp_10cm_c": 58.0,
            "wind_speed_kmh": 24.0,
            "basin_depression_depth_m": 2.0,
            "ambient_so2_ppm": 1.0,
            "ambient_h2s_ppm": 0.6,
        },
    )
    assert res_calc.status_code == 200
    assert res_calc.json()["safety_status"] == "nominal_upwind_sinter_corridor"

    res_calc_422 = client.post(
        "/api/solfatara-navigation/calculate",
        json={
            "sinter_crust_thickness_cm": 999.0,
            "subsurface_temp_10cm_c": 58.0,
            "wind_speed_kmh": 24.0,
            "basin_depression_depth_m": 2.0,
            "ambient_so2_ppm": 1.0,
            "ambient_h2s_ppm": 0.6,
        },
    )
    assert res_calc_422.status_code == 422

    res_gear = client.get("/api/solfatara-navigation/gear")
    assert res_gear.status_code == 200
    assert len(res_gear.json()) == 6


@pytest.mark.anyio
async def test_prompt_chat_and_stream_helpers():
    prompt = build_solfatara_navigation_prompt("Katmai Valley of Ten Thousand Smokes fumaroles")
    assert "Valley of Ten Thousand Smokes" in prompt
    assert "Solfatara" in prompt

    chat_res = handle_solfatara_navigation_intent(
        "Tell me about Katmai Valley of Ten Thousand Smokes fumaroles"
    )
    assert chat_res is not None
    assert chat_res["solfatara_navigation_info"]["action"] == "solfatara_navigation_lookup"
    assert handle_solfatara_navigation_intent("Where is my order #12345?") is None

    events = []
    async for chunk in generate_solfatara_navigation_stream_events(
        "Calculate solfatara safety for crust thickness 25 cm and subsurface temp 65 C"
    ):
        events.append(chunk)
    assert len(events) > 0
    assert any("solfatara_navigation_calculated" in e for e in events)
