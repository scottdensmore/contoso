from typing import get_args

import pytest
from contoso_chat.acclimatization import detect_acclimatization_intent
from contoso_chat.bog_shoeing import detect_bog_shoeing_intent
from contoso_chat.chat import handle_paramo_navigation_intent
from contoso_chat.mountain_weather import detect_mountain_weather_intent
from contoso_chat.orienteering import extract_orienteering_intent
from contoso_chat.pack_llama import detect_pack_llama_intent
from contoso_chat.paramo_navigation import (
    PARAMO_GEAR_CHECKLIST,
    PARAMO_SITES,
    AndeanCloudFogRegime,
    ParamoSafetyStatus,
    ParamoSubstrateMorphology,
    ParamoTraversalTechnique,
    build_paramo_navigation_prompt,
    calculate_paramo_navigation_safety,
    extract_paramo_navigation_params,
    filter_paramo_sites,
    format_paramo_navigation_response,
    get_all_paramo_sites,
    get_paramo_gear_checklist,
    get_paramo_site_by_id,
    is_paramo_navigation_query,
)
from contoso_chat.stream import generate_paramo_navigation_stream_events
from contoso_chat.tundra_lichen import detect_tundra_lichen_intent
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_paramo_navigation_literals():
    assert set(get_args(ParamoSubstrateMorphology)) == {
        "plantago_distichia_cushion_bog_dome",
        "espeletia_frailejon_tussock_matrix",
        "waterlogged_histosol_turbera_basin",
        "superparamo_periglacial_solifluction_scree",
        "polylepis_cloud_forest_ecotone_margin",
    }
    assert set(get_args(AndeanCloudFogRegime)) == {
        "morning_zenith_uv_window",
        "orographic_paramo_drizzle_whiteout",
        "freezing_horizontal_sleet_squall",
        "nocturnal_radiative_needle_ice_frost",
    }
    assert set(get_args(ParamoTraversalTechnique)) == {
        "distichia_cushion_dome_stepping",
        "tussock_crown_bridging_with_baskets",
        "wellies_and_gaiter_turbera_contouring",
        "compass_pacing_azimuth_dead_reckoning",
    }
    assert set(get_args(ParamoSafetyStatus)) == {
        "nominal_morning_window_cushion_corridor",
        "caution_whiteout_fog_and_turbera_breakthrough",
        "abort_hypothermic_squall_and_peat_mire_entrapment",
    }


def test_paramo_sites_catalog_and_lookup():
    assert len(PARAMO_SITES) == 5
    all_sites = get_all_paramo_sites()
    assert len(all_sites) == 5

    expected_ids = {
        "sumapaz-chisaca-laguna-tunjos-paramo",
        "el-angel-frailejon-giant-rosette-reserve",
        "cajas-toreadora-glacial-turbera-labyrinth",
        "cocuy-ritacuba-superparamo-cushion-pass",
        "chirripo-sabana-de-los-leones-talamanca-paramo",
    }
    assert {s["id"] for s in all_sites} == expected_ids

    sumapaz = get_paramo_site_by_id("sumapaz-chisaca-laguna-tunjos-paramo")
    assert sumapaz is not None
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

    el_angel = get_paramo_site_by_id(
        "el-angel-frailejon-giant-rosette-reserve"
    )
    assert el_angel is not None
    assert (
        el_angel["substrate_morphology"]
        == "plantago_distichia_cushion_bog_dome"
    )
    assert el_angel["fog_regime"] == "morning_zenith_uv_window"
    assert el_angel["technique"] == "distichia_cushion_dome_stepping"
    assert el_angel["elevation"] == 3850
    assert el_angel["mean_cushion_mat_thickness_cm"] == 38.0
    assert el_angel["histosol_water_saturation_percent"] == 68.0
    assert el_angel["typical_visibility_meters"] == 220.0
    assert el_angel["typical_ambient_temp_c"] == 8.0
    assert el_angel["typical_wind_speed_kmh"] == 16.0

    cajas = get_paramo_site_by_id("cajas-toreadora-glacial-turbera-labyrinth")
    assert cajas is not None
    assert (
        cajas["substrate_morphology"] == "waterlogged_histosol_turbera_basin"
    )
    assert cajas["fog_regime"] == "orographic_paramo_drizzle_whiteout"
    assert cajas["technique"] == "wellies_and_gaiter_turbera_contouring"
    assert cajas["elevation"] == 3960
    assert cajas["mean_cushion_mat_thickness_cm"] == 14.0
    assert cajas["histosol_water_saturation_percent"] == 92.0
    assert cajas["typical_visibility_meters"] == 28.0
    assert cajas["typical_ambient_temp_c"] == 4.0
    assert cajas["typical_wind_speed_kmh"] == 32.0

    cocuy = get_paramo_site_by_id("cocuy-ritacuba-superparamo-cushion-pass")
    assert cocuy is not None
    assert (
        cocuy["substrate_morphology"]
        == "superparamo_periglacial_solifluction_scree"
    )
    assert cocuy["fog_regime"] == "freezing_horizontal_sleet_squall"
    assert cocuy["technique"] == "compass_pacing_azimuth_dead_reckoning"
    assert cocuy["elevation"] == 4380
    assert cocuy["mean_cushion_mat_thickness_cm"] == 18.0
    assert cocuy["histosol_water_saturation_percent"] == 85.0
    assert cocuy["typical_visibility_meters"] == 18.0
    assert cocuy["typical_ambient_temp_c"] == 1.0
    assert cocuy["typical_wind_speed_kmh"] == 46.0

    chirripo = get_paramo_site_by_id(
        "chirripo-sabana-de-los-leones-talamanca-paramo"
    )
    assert chirripo is not None
    assert (
        chirripo["substrate_morphology"]
        == "polylepis_cloud_forest_ecotone_margin"
    )
    assert chirripo["fog_regime"] == "nocturnal_radiative_needle_ice_frost"
    assert chirripo["technique"] == "distichia_cushion_dome_stepping"
    assert chirripo["elevation"] == 3520
    assert chirripo["mean_cushion_mat_thickness_cm"] == 32.0
    assert chirripo["histosol_water_saturation_percent"] == 71.0
    assert chirripo["typical_visibility_meters"] == 160.0
    assert chirripo["typical_ambient_temp_c"] == 7.0
    assert chirripo["typical_wind_speed_kmh"] == 20.0

    assert get_paramo_site_by_id("nonexistent-paramo-site") is None


def test_filter_paramo_sites():
    distichia = filter_paramo_sites(
        substrate_morphology="plantago_distichia_cushion_bog_dome"
    )
    assert len(distichia) == 1
    assert distichia[0]["id"] == "el-angel-frailejon-giant-rosette-reserve"

    whiteout = filter_paramo_sites(
        fog_regime="orographic_paramo_drizzle_whiteout"
    )
    assert len(whiteout) == 2
    assert {s["id"] for s in whiteout} == {
        "sumapaz-chisaca-laguna-tunjos-paramo",
        "cajas-toreadora-glacial-turbera-labyrinth",
    }

    dome_stepping = filter_paramo_sites(
        technique="distichia_cushion_dome_stepping"
    )
    assert len(dome_stepping) == 2
    assert {s["id"] for s in dome_stepping} == {
        "el-angel-frailejon-giant-rosette-reserve",
        "chirripo-sabana-de-los-leones-talamanca-paramo",
    }

    combined = filter_paramo_sites(
        substrate_morphology="espeletia_frailejon_tussock_matrix",
        fog_regime="orographic_paramo_drizzle_whiteout",
        technique="tussock_crown_bridging_with_baskets",
    )
    assert len(combined) == 1
    assert combined[0]["id"] == "sumapaz-chisaca-laguna-tunjos-paramo"

    with pytest.raises(ValueError, match="Invalid substrate_morphology"):
        filter_paramo_sites(substrate_morphology="invalid_substrate_type")

    with pytest.raises(ValueError, match="Invalid fog_regime"):
        filter_paramo_sites(fog_regime="invalid_fog_regime")

    with pytest.raises(ValueError, match="Invalid technique"):
        filter_paramo_sites(technique="invalid_technique")


def test_paramo_gear_checklist():
    assert len(PARAMO_GEAR_CHECKLIST) == 6
    gear = get_paramo_gear_checklist()
    assert len(gear) == 6
    assert all(item["mandatory"] is True for item in gear)

    expected_gear = {
        "knee-high-neoprene-lined-rubber-paramo-panteneras": "turbera_footwear",
        "dual-probe-85mm-snow-basket-trekking-poles": "cushion_probing",
        "three-layer-hydrostatic-28k-gore-pro-hardshell": "hypothermia_defense",
        "declination-adjustable-mirror-sighting-compass-and-altimeter": "whiteout_wayfinding",
        "vapor-barrier-fleece-liner-gloves-and-overmitts": "hypothermia_defense",
        "ultralight-bothy-bag-emergency-storm-shelter": "hypothermia_defense",
    }
    for item in gear:
        assert item["id"] in expected_gear
        assert item["category"] == expected_gear[item["id"]]


def test_calculate_paramo_navigation_safety_regimes():
    # 1. Nominal morning window cushion corridor
    nominal = calculate_paramo_navigation_safety(
        substrate_morphology="plantago_distichia_cushion_bog_dome",
        fog_regime="morning_zenith_uv_window",
        technique="distichia_cushion_dome_stepping",
        cushion_mat_thickness_cm=38.0,
        histosol_water_saturation_percent=65.0,
        visibility_meters=250.0,
        ambient_temp_c=9.0,
        wind_speed_kmh=14.0,
        pack_weight_kg=12.0,
    )
    assert (
        nominal["safety_status"] == "nominal_morning_window_cushion_corridor"
    )
    assert nominal["cushion_bearing_safety_factor"] >= 1.5
    assert nominal["turbera_breakthrough_probability"] < 0.25
    assert nominal["effective_wind_chill_c"] >= 4.0
    assert nominal["azimuth_drift_meters_per_km"] < 40.0
    assert len(nominal["turbera_stepping_protocol"]) > 20
    assert len(nominal["whiteout_and_hypothermia_advisory"]) > 20

    # 2. Caution whiteout fog and turbera breakthrough
    caution = calculate_paramo_navigation_safety(
        substrate_morphology="espeletia_frailejon_tussock_matrix",
        fog_regime="orographic_paramo_drizzle_whiteout",
        technique="tussock_crown_bridging_with_baskets",
        cushion_mat_thickness_cm=24.0,
        histosol_water_saturation_percent=80.0,
        visibility_meters=42.0,
        ambient_temp_c=5.0,
        wind_speed_kmh=26.0,
        pack_weight_kg=18.0,
    )
    assert (
        caution["safety_status"]
        == "caution_whiteout_fog_and_turbera_breakthrough"
    )
    assert (
        caution["turbera_breakthrough_probability"]
        > nominal["turbera_breakthrough_probability"]
    )
    assert (
        caution["cushion_bearing_safety_factor"]
        < nominal["cushion_bearing_safety_factor"]
    )
    assert (
        caution["azimuth_drift_meters_per_km"]
        > nominal["azimuth_drift_meters_per_km"]
    )

    # 3. Abort hypothermic squall and peat mire entrapment
    abort = calculate_paramo_navigation_safety(
        substrate_morphology="waterlogged_histosol_turbera_basin",
        fog_regime="freezing_horizontal_sleet_squall",
        technique="compass_pacing_azimuth_dead_reckoning",
        cushion_mat_thickness_cm=9.0,
        histosol_water_saturation_percent=95.0,
        visibility_meters=12.0,
        ambient_temp_c=-1.0,
        wind_speed_kmh=55.0,
        pack_weight_kg=28.0,
    )
    assert (
        abort["safety_status"]
        == "abort_hypothermic_squall_and_peat_mire_entrapment"
    )
    assert (
        abort["turbera_breakthrough_probability"]
        > caution["turbera_breakthrough_probability"]
    )
    assert (
        abort["cushion_bearing_safety_factor"]
        < caution["cushion_bearing_safety_factor"]
    )
    assert abort["effective_wind_chill_c"] < caution["effective_wind_chill_c"]
    assert (
        abort["azimuth_drift_meters_per_km"]
        > caution["azimuth_drift_meters_per_km"]
    )


@pytest.mark.parametrize(
    "invalid_kwargs",
    [
        {"cushion_mat_thickness_cm": 1.0},
        {"cushion_mat_thickness_cm": 110.0},
        {"histosol_water_saturation_percent": 15.0},
        {"histosol_water_saturation_percent": 105.0},
        {"visibility_meters": 1.0},
        {"visibility_meters": 2500.0},
        {"ambient_temp_c": -20.0},
        {"ambient_temp_c": 32.0},
        {"wind_speed_kmh": -5.0},
        {"wind_speed_kmh": 135.0},
        {"pack_weight_kg": -2.0},
        {"pack_weight_kg": 50.0},
        {"substrate_morphology": "invalid_substrate_morphology"},
        {"fog_regime": "invalid_fog_regime"},
        {"technique": "invalid_technique"},
    ],
)
def test_calculate_paramo_navigation_validation_errors(invalid_kwargs):
    base_kwargs = {
        "cushion_mat_thickness_cm": 28.0,
        "histosol_water_saturation_percent": 75.0,
        "visibility_meters": 80.0,
        "ambient_temp_c": 5.0,
        "wind_speed_kmh": 22.0,
        "pack_weight_kg": 15.0,
    }
    base_kwargs.update(invalid_kwargs)
    with pytest.raises(ValueError):
        calculate_paramo_navigation_safety(**base_kwargs)


def test_is_paramo_navigation_query_and_disambiguation():
    # Positive queries
    assert (
        is_paramo_navigation_query(
            "How do we navigate the Páramo de Sumapaz and Lagunas de Chisacá frailejón moorland?"
        )
        is True
    )
    assert (
        is_paramo_navigation_query(
            "Calculate turbera breakthrough probability and cushion bog safety in El Ángel Ecuador"
        )
        is True
    )
    assert (
        is_paramo_navigation_query(
            "Parque Nacional Cajas Toreadora waterlogged histosol turbera basin wellies contouring"
        )
        is True
    )
    assert (
        is_paramo_navigation_query(
            "Sierra Nevada del Cocuy Ritacuba superpáramo Distichia cushion pass sleet squall"
        )
        is True
    )
    assert (
        is_paramo_navigation_query(
            "Cerro Chirripó Sabana de los Leones Talamanca paramo Polylepis ecotone needle ice"
        )
        is True
    )
    assert (
        is_paramo_navigation_query(
            "What panteneras rubber boots and 85mm snow-basket poles are needed for Espeletia frailejon cushion bog traversal?"
        )
        is True
    )

    # Negative queries
    assert is_paramo_navigation_query("") is False
    assert is_paramo_navigation_query("   ") is False
    assert is_paramo_navigation_query("Track my order #98765") is False
    assert (
        is_paramo_navigation_query("I want a refund for my sleeping bag")
        is False
    )
    assert (
        is_paramo_navigation_query(
            "What is the best mountain bike for desert singletrack?"
        )
        is False
    )

    # Cross-domain disambiguation: adjacent modules must ignore paramo / páramo / frailejon / frailejón / espeletia / turbera / distichia / sumapaz / el angel / cushion bog queries
    disambig_queries = [
        "Bog shoeing muskeg peatland vs paramo frailejon and turbera cushion bog in Sumapaz",
        "Tundra lichen bryophyte thallus vs páramo Espeletia frailejón and Distichia cushion bog",
        "High altitude acclimatization Diamox vs paramo cushion bog and turbera moorland in El Angel",
        "Orienteering compass bearing and dead reckoning in paramo whiteout over Espeletia frailejon turbera",
        "Mountain weather 500mb wind chill and altimeter watch in paramo frailejón drizzle at Sumapaz",
        "Pack llama trekking vs Andean páramo Distichia cushion bog and frailejon turbera",
    ]
    for q in disambig_queries:
        assert is_paramo_navigation_query(q) is True
        assert detect_bog_shoeing_intent(q) is False
        assert detect_tundra_lichen_intent(q) is False
        assert detect_acclimatization_intent(q) is None
        assert extract_orienteering_intent(q) is None
        assert detect_mountain_weather_intent(q) is None
        assert detect_pack_llama_intent(q) is None


def test_extract_paramo_navigation_params():
    q = (
        "Calculate paramo navigation safety at Sumapaz with cushion mat thickness 26 cm, "
        "histosol water saturation 78%, visibility 45 meters, ambient temp 5 C, "
        "wind speed 24 km/h, pack weight 18 kg"
    )
    params = extract_paramo_navigation_params(q)
    assert params["site_id"] == "sumapaz-chisaca-laguna-tunjos-paramo"
    assert params["cushion_mat_thickness_cm"] == 26.0
    assert params["histosol_water_saturation_percent"] == 78.0
    assert params["visibility_meters"] == 45.0
    assert params["ambient_temp_c"] == 5.0
    assert params["wind_speed_kmh"] == 24.0
    assert params["pack_weight_kg"] == 18.0
    assert params["is_calculation"] is True


def test_format_paramo_navigation_response_actions():
    # 1. Calculated action
    ans_calc, info_calc = format_paramo_navigation_response(
        "Calculate paramo navigation safety for cushion mat thickness 38 cm, histosol water saturation 68%, visibility 220 meters, ambient temp 8 C, wind speed 16 km/h, pack weight 14 kg"
    )
    assert isinstance(ans_calc, str) and len(ans_calc) > 20
    assert info_calc["action"] == "paramo_navigation_calculated"
    assert "cushion_bearing_safety_factor" in info_calc
    assert "turbera_breakthrough_probability" in info_calc
    assert "effective_wind_chill_c" in info_calc
    assert "azimuth_drift_meters_per_km" in info_calc
    assert "safety_status" in info_calc

    # 2. Lookup action
    ans_lookup, info_lookup = format_paramo_navigation_response(
        "Tell me about Páramo de Sumapaz and Lagunas de Chisacá frailejón moorland site details"
    )
    assert isinstance(ans_lookup, str) and "Sumapaz" in ans_lookup
    assert info_lookup["action"] == "paramo_navigation_lookup"
    assert (
        info_lookup["site"]["id"]
        == "sumapaz-chisaca-laguna-tunjos-paramo"
    )

    # 3. General info action
    ans_info, info_general = format_paramo_navigation_response(
        "What mandatory gear is required for high-altitude paramo and frailejon cushion-bog moorland navigation?"
    )
    assert isinstance(ans_info, str) and len(ans_info) > 20
    assert info_general["action"] == "paramo_navigation_info"
    assert len(info_general["sites"]) == 5
    assert len(info_general["gear_checklist"]) == 6


@pytest.mark.anyio
async def test_chat_and_stream_handlers_and_prompt():
    prompt = build_paramo_navigation_prompt(
        "How do we navigate Páramo de Sumapaz frailejón tussocks and turbera bogs?"
    )
    assert "Sumapaz" in prompt or "Páramo" in prompt

    chat_res = handle_paramo_navigation_intent(
        "Tell me about Páramo de Sumapaz and Lagunas de Chisacá frailejón moorland"
    )
    assert chat_res is not None
    assert "paramo_navigation_info" in chat_res
    assert (
        chat_res["paramo_navigation_info"]["action"]
        == "paramo_navigation_lookup"
    )

    assert (
        handle_paramo_navigation_intent("Where is my order #12345?") is None
    )

    events = []
    async for ev in generate_paramo_navigation_stream_events(
        "Calculate paramo navigation safety for cushion mat thickness 38 cm, histosol water saturation 68%, visibility 220 meters, ambient temp 8 C, wind speed 16 km/h, pack weight 14 kg"
    ):
        events.append(ev)
    joined = "".join(events)
    assert "event: metadata" in joined
    assert "paramo_navigation_calculated" in joined
    assert "event: done" in joined


def test_paramo_navigation_router_endpoints():
    # Dual prefixes: /paramo-navigation and /api/paramo-navigation
    for prefix in (
        "/paramo-navigation",
        "/api/paramo-navigation",
    ):
        res_sites = client.get(f"{prefix}/sites")
        assert res_sites.status_code == 200
        assert len(res_sites.json()) == 5

        res_filter = client.get(
            f"{prefix}/sites",
            params={"fog_regime": "orographic_paramo_drizzle_whiteout"},
        )
        assert res_filter.status_code == 200
        assert len(res_filter.json()) == 2

        res_422 = client.get(
            f"{prefix}/sites",
            params={"substrate_morphology": "invalid_morphology_value"},
        )
        assert res_422.status_code in (400, 422)

        res_detail = client.get(
            f"{prefix}/sites/sumapaz-chisaca-laguna-tunjos-paramo"
        )
        assert res_detail.status_code == 200
        assert (
            res_detail.json()["id"]
            == "sumapaz-chisaca-laguna-tunjos-paramo"
        )

        res_404 = client.get(f"{prefix}/sites/unknown-paramo-site")
        assert res_404.status_code == 404

        res_calc = client.post(
            f"{prefix}/calculate",
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
        assert res_calc.status_code == 200
        assert (
            res_calc.json()["safety_status"]
            == "nominal_morning_window_cushion_corridor"
        )

        res_calc_422 = client.post(
            f"{prefix}/calculate",
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
        assert res_calc_422.status_code in (400, 422)

        res_gear = client.get(f"{prefix}/gear")
        assert res_gear.status_code == 200
        assert len(res_gear.json()) == 6
