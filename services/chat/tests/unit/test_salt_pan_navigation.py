from typing import get_args

import pytest
from contoso_chat.bikepacking import detect_bikepacking_intent
from contoso_chat.chat import handle_salt_pan_navigation_intent
from contoso_chat.desert_trekking import detect_desert_trekking_intent
from contoso_chat.mudflat_trekking import detect_mudflat_intent
from contoso_chat.orienteering import extract_orienteering_intent
from contoso_chat.salt_pan_navigation import (
    SALT_PAN_GEAR_CHECKLIST,
    SALT_PAN_SITES,
    AtmosphericRefractionState,
    EvaporiteCrustType,
    PlayaTraversalMode,
    SaltPanSafetyStatus,
    build_salt_pan_navigation_prompt,
    calculate_salt_pan_navigation_safety,
    extract_salt_pan_navigation_params,
    filter_salt_pan_sites,
    format_salt_pan_navigation_response,
    get_all_salt_pan_sites,
    get_salt_pan_gear_checklist,
    get_salt_pan_site_by_id,
    is_salt_pan_navigation_query,
)
from contoso_chat.sandboarding import detect_sandboarding_intent
from contoso_chat.slickrock_burro import detect_slickrock_burro_intent
from contoso_chat.stream import generate_salt_pan_navigation_stream_events
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_salt_pan_literals():
    assert set(get_args(EvaporiteCrustType)) == {
        "polygonal_halite_pressure_ridge",
        "desiccated_argillaceous_hardpan",
        "puffy_gypsum_efflorescent_crust",
        "wet_capillary_brine_salar_margin",
        "subsurface_liquefied_silt_dome",
    }
    assert set(get_args(AtmosphericRefractionState)) == {
        "predawn_isothermal_clarity",
        "inferior_shimmer_horizon_collapse",
        "fata_morgana_vertical_loom",
        "haboob_halite_aerosol_whiteout",
    }
    assert set(get_args(PlayaTraversalMode)) == {
        "wide_tire_desert_expedition_cart",
        "foot_trek_distributed_sand_sandals",
        "fat_tire_bikepacking_low_psi",
        "belayed_crust_sounding_probe_team",
    }
    assert set(get_args(SaltPanSafetyStatus)) == {
        "nominal_crystalline_halite_corridor",
        "caution_mirage_azimuth_drift_and_brine_crust",
        "abort_subsurface_brine_mud_breakthrough",
    }


def test_salt_pan_sites_catalog_and_lookup():
    assert len(SALT_PAN_SITES) == 5
    all_sites = get_all_salt_pan_sites()
    assert len(all_sites) == 5

    expected_ids = {
        "salar-de-uyuni-incahuasi-halite-polygon-basin",
        "badwater-devils-golf-course-halite-pan",
        "makgadikgadi-ntwetwe-sua-salt-pan-traverse",
        "chott-el-djerid-ephemeral-mirage-salar",
        "bonneville-salt-flats-wendover-crust-corridor",
    }
    assert {s["id"] for s in all_sites} == expected_ids

    uyuni = get_salt_pan_site_by_id("salar-de-uyuni-incahuasi-halite-polygon-basin")
    assert uyuni is not None
    assert uyuni["id"] == "salar-de-uyuni-incahuasi-halite-polygon-basin"
    assert uyuni["crust_type"] == "polygonal_halite_pressure_ridge"
    assert uyuni["refraction_state"] == "predawn_isothermal_clarity"
    assert uyuni["traversal_mode"] == "wide_tire_desert_expedition_cart"
    assert uyuni["elevation"] == 3656
    assert uyuni["mean_halite_crust_thickness_cm"] == 38.0
    assert uyuni["water_table_depth_cm"] == 45.0
    assert uyuni["typical_surface_air_temp_c"] == 14.0
    assert uyuni["typical_ground_skin_temp_c"] == 22.0

    badwater = get_salt_pan_site_by_id("badwater-devils-golf-course-halite-pan")
    assert badwater is not None
    assert badwater["crust_type"] == "puffy_gypsum_efflorescent_crust"
    assert badwater["refraction_state"] == "inferior_shimmer_horizon_collapse"
    assert badwater["traversal_mode"] == "foot_trek_distributed_sand_sandals"
    assert badwater["elevation"] == -86
    assert badwater["mean_halite_crust_thickness_cm"] == 16.0
    assert badwater["water_table_depth_cm"] == 28.0
    assert badwater["typical_surface_air_temp_c"] == 39.0
    assert badwater["typical_ground_skin_temp_c"] == 58.0

    makgadikgadi = get_salt_pan_site_by_id("makgadikgadi-ntwetwe-sua-salt-pan-traverse")
    assert makgadikgadi is not None
    assert makgadikgadi["crust_type"] == "desiccated_argillaceous_hardpan"
    assert makgadikgadi["refraction_state"] == "fata_morgana_vertical_loom"
    assert makgadikgadi["traversal_mode"] == "fat_tire_bikepacking_low_psi"
    assert makgadikgadi["elevation"] == 905
    assert makgadikgadi["mean_halite_crust_thickness_cm"] == 24.0
    assert makgadikgadi["water_table_depth_cm"] == 35.0
    assert makgadikgadi["typical_surface_air_temp_c"] == 34.0
    assert makgadikgadi["typical_ground_skin_temp_c"] == 51.0

    chott = get_salt_pan_site_by_id("chott-el-djerid-ephemeral-mirage-salar")
    assert chott is not None
    assert chott["crust_type"] == "subsurface_liquefied_silt_dome"
    assert chott["refraction_state"] == "fata_morgana_vertical_loom"
    assert chott["traversal_mode"] == "belayed_crust_sounding_probe_team"
    assert chott["elevation"] == 15
    assert chott["mean_halite_crust_thickness_cm"] == 7.0
    assert chott["water_table_depth_cm"] == 9.0
    assert chott["typical_surface_air_temp_c"] == 37.0
    assert chott["typical_ground_skin_temp_c"] == 55.0

    bonneville = get_salt_pan_site_by_id("bonneville-salt-flats-wendover-crust-corridor")
    assert bonneville is not None
    assert bonneville["crust_type"] == "wet_capillary_brine_salar_margin"
    assert bonneville["refraction_state"] == "inferior_shimmer_horizon_collapse"
    assert bonneville["traversal_mode"] == "wide_tire_desert_expedition_cart"
    assert bonneville["elevation"] == 1286
    assert bonneville["mean_halite_crust_thickness_cm"] == 14.0
    assert bonneville["water_table_depth_cm"] == 19.0
    assert bonneville["typical_surface_air_temp_c"] == 31.0
    assert bonneville["typical_ground_skin_temp_c"] == 44.0

    assert get_salt_pan_site_by_id("nonexistent-salt-pan-site") is None


def test_filter_salt_pan_sites():
    halite_sites = filter_salt_pan_sites(crust_type="polygonal_halite_pressure_ridge")
    assert len(halite_sites) == 1
    assert halite_sites[0]["id"] == "salar-de-uyuni-incahuasi-halite-polygon-basin"

    fata_morgana_sites = filter_salt_pan_sites(
        refraction_state="fata_morgana_vertical_loom"
    )
    assert len(fata_morgana_sites) == 2
    assert {s["id"] for s in fata_morgana_sites} == {
        "makgadikgadi-ntwetwe-sua-salt-pan-traverse",
        "chott-el-djerid-ephemeral-mirage-salar",
    }

    cart_sites = filter_salt_pan_sites(
        traversal_mode="wide_tire_desert_expedition_cart"
    )
    assert len(cart_sites) == 2
    assert {s["id"] for s in cart_sites} == {
        "salar-de-uyuni-incahuasi-halite-polygon-basin",
        "bonneville-salt-flats-wendover-crust-corridor",
    }

    combined = filter_salt_pan_sites(
        crust_type="subsurface_liquefied_silt_dome",
        refraction_state="fata_morgana_vertical_loom",
        traversal_mode="belayed_crust_sounding_probe_team",
    )
    assert len(combined) == 1
    assert combined[0]["id"] == "chott-el-djerid-ephemeral-mirage-salar"

    with pytest.raises(ValueError, match="Invalid crust_type"):
        filter_salt_pan_sites(crust_type="invalid_crust")

    with pytest.raises(ValueError, match="Invalid refraction_state"):
        filter_salt_pan_sites(refraction_state="invalid_refraction")

    with pytest.raises(ValueError, match="Invalid traversal_mode"):
        filter_salt_pan_sites(traversal_mode="invalid_mode")


def test_salt_pan_gear_checklist():
    assert len(SALT_PAN_GEAR_CHECKLIST) == 6
    gear = get_salt_pan_gear_checklist()
    assert len(gear) == 6
    assert all(item["mandatory"] is True for item in gear)

    expected_gear = {
        "graduated-stainless-evaporite-crust-core-auger": "crust_sounding",
        "fluid-damped-prismatic-sighting-compass-and-sun-compass": "optical_navigation",
        "polarized-category-4-wrap-glare-shields": "albedo_eye_protection",
        "collapsible-high-flotation-brine-mud-extraction-boards": "mire_extraction",
        "dual-band-gnss-inreach-beacon-and-paper-utm-grid": "optical_navigation",
        "ptfe-coated-halite-resistant-gaiters-and-barrier-salve": "mire_extraction",
    }
    for item in gear:
        assert item["id"] in expected_gear
        assert item["category"] == expected_gear[item["id"]]


def test_calculate_salt_pan_navigation_safety_regimes():
    # 1. Nominal crystalline halite corridor
    nominal = calculate_salt_pan_navigation_safety(
        crust_type="polygonal_halite_pressure_ridge",
        refraction_state="predawn_isothermal_clarity",
        traversal_mode="wide_tire_desert_expedition_cart",
        halite_crust_thickness_cm=38.0,
        water_table_depth_cm=45.0,
        surface_air_temp_c=14.0,
        ground_skin_temp_c=22.0,
        total_traveler_load_kg=95.0,
        target_sighting_distance_km=12.0,
    )
    assert nominal["safety_status"] == "nominal_crystalline_halite_corridor"
    assert nominal["crust_bearing_safety_factor"] >= 1.8
    assert nominal["brine_mud_breakthrough_probability"] < 0.20
    assert nominal["mirage_horizon_dip_error_deg"] < 0.35
    assert nominal["effective_visual_range_km"] >= 8.0
    assert len(nominal["dead_reckoning_routing_protocol"]) > 20
    assert len(nominal["crust_sounding_and_extraction_advisory"]) > 20

    # 2. Caution mirage azimuth drift and brine crust
    caution = calculate_salt_pan_navigation_safety(
        crust_type="puffy_gypsum_efflorescent_crust",
        refraction_state="inferior_shimmer_horizon_collapse",
        traversal_mode="foot_trek_distributed_sand_sandals",
        halite_crust_thickness_cm=16.0,
        water_table_depth_cm=28.0,
        surface_air_temp_c=39.0,
        ground_skin_temp_c=58.0,
        total_traveler_load_kg=105.0,
        target_sighting_distance_km=14.0,
    )
    assert (
        caution["safety_status"]
        == "caution_mirage_azimuth_drift_and_brine_crust"
    )
    assert (
        caution["crust_bearing_safety_factor"]
        < nominal["crust_bearing_safety_factor"]
    )
    assert (
        caution["brine_mud_breakthrough_probability"]
        > nominal["brine_mud_breakthrough_probability"]
    )
    assert (
        caution["mirage_horizon_dip_error_deg"]
        > nominal["mirage_horizon_dip_error_deg"]
    )
    assert (
        caution["effective_visual_range_km"]
        < nominal["effective_visual_range_km"]
    )

    # 3. Abort subsurface brine mud breakthrough
    abort = calculate_salt_pan_navigation_safety(
        crust_type="subsurface_liquefied_silt_dome",
        refraction_state="fata_morgana_vertical_loom",
        traversal_mode="belayed_crust_sounding_probe_team",
        halite_crust_thickness_cm=6.0,
        water_table_depth_cm=8.0,
        surface_air_temp_c=38.0,
        ground_skin_temp_c=56.0,
        total_traveler_load_kg=140.0,
        target_sighting_distance_km=18.0,
    )
    assert (
        abort["safety_status"] == "abort_subsurface_brine_mud_breakthrough"
    )
    assert abort["brine_mud_breakthrough_probability"] >= 0.65
    assert (
        abort["crust_bearing_safety_factor"]
        < caution["crust_bearing_safety_factor"]
    )


@pytest.mark.parametrize(
    "invalid_kwargs",
    [
        {"halite_crust_thickness_cm": 0.5},
        {"halite_crust_thickness_cm": 155.0},
        {"water_table_depth_cm": -1.0},
        {"water_table_depth_cm": 260.0},
        {"surface_air_temp_c": -20.0},
        {"surface_air_temp_c": 65.0},
        {"ground_skin_temp_c": -20.0},
        {"ground_skin_temp_c": 90.0},
        {"total_traveler_load_kg": 25.0},
        {"total_traveler_load_kg": 310.0},
        {"target_sighting_distance_km": 0.2},
        {"target_sighting_distance_km": 55.0},
        {"crust_type": "invalid_crust_type"},
        {"refraction_state": "invalid_refraction_state"},
        {"traversal_mode": "invalid_traversal_mode"},
    ],
)
def test_calculate_salt_pan_navigation_validation_errors(invalid_kwargs):
    base_kwargs = {
        "halite_crust_thickness_cm": 25.0,
        "water_table_depth_cm": 35.0,
        "surface_air_temp_c": 28.0,
        "ground_skin_temp_c": 42.0,
        "total_traveler_load_kg": 95.0,
        "target_sighting_distance_km": 10.0,
    }
    base_kwargs.update(invalid_kwargs)
    with pytest.raises(ValueError):
        calculate_salt_pan_navigation_safety(**base_kwargs)


def test_is_salt_pan_navigation_query_and_disambiguation():
    # Positive queries
    assert (
        is_salt_pan_navigation_query(
            "How do we cross the Salar de Uyuni polygonal halite crust?"
        )
        is True
    )
    assert (
        is_salt_pan_navigation_query(
            "Calculate salt pan crust bearing capacity for Makgadikgadi Ntwetwe traverse"
        )
        is True
    )
    assert (
        is_salt_pan_navigation_query(
            "Chott el Djerid sebkha mirage compass navigation and Fata Morgana refraction"
        )
        is True
    )
    assert (
        is_salt_pan_navigation_query(
            "Bonneville Salt Flats wet capillary brine crust and sighting distance"
        )
        is True
    )
    assert (
        is_salt_pan_navigation_query(
            "Badwater Devil's Golf Course halite crust thickness and core auger sounding"
        )
        is True
    )
    assert (
        is_salt_pan_navigation_query(
            "What gear prevents breaking through a playa crust into subsurface brine mud?"
        )
        is True
    )

    # Negative queries
    assert is_salt_pan_navigation_query("") is False
    assert is_salt_pan_navigation_query("   ") is False
    assert is_salt_pan_navigation_query("Track my order #98765") is False
    assert is_salt_pan_navigation_query("I want a refund for my tent") is False
    assert (
        is_salt_pan_navigation_query(
            "What is the best fly fishing rod for trout?"
        )
        is False
    )

    # Cross-domain disambiguation: adjacent modules must ignore salt pan / salar / sebkha / chott / makgadikgadi / uyuni / fata morgana / halite crust / playa crust queries
    disambig_queries = [
        "Desert trek across Salar de Uyuni polygonal halite crust and salt pan water table",
        "Fat tire bikepacking across Makgadikgadi salt pan and Fata Morgana mirage navigation",
        "Compass bearing and dead reckoning across Chott el Djerid sebkha salt flat mirage",
        "Badwater salt pan and playa crust sounding for subsurface brine mud and silt",
        "Pack burro expedition vs salt flat halite crust core auger on Bonneville salt pan",
        "Sandboarding dune vs salt pan efflorescent gypsum crust and Fata Morgana",
    ]
    for q in disambig_queries:
        assert is_salt_pan_navigation_query(q) is True
        assert detect_desert_trekking_intent(q) is None
        assert detect_sandboarding_intent(q) is None
        assert extract_orienteering_intent(q) is None
        assert detect_mudflat_intent(q) is None
        assert detect_slickrock_burro_intent(q) is False
        assert detect_bikepacking_intent(q) is None


def test_extract_salt_pan_navigation_params():
    q = (
        "Calculate salt pan navigation safety at Chott el Djerid with halite crust thickness 7 cm, "
        "water table depth 9 cm, air temp 37 C, ground skin temp 55 C, load 135 kg, sighting distance 15 km"
    )
    params = extract_salt_pan_navigation_params(q)
    assert params["site_id"] == "chott-el-djerid-ephemeral-mirage-salar"
    assert params["halite_crust_thickness_cm"] == 7.0
    assert params["water_table_depth_cm"] == 9.0
    assert params["surface_air_temp_c"] == 37.0
    assert params["ground_skin_temp_c"] == 55.0
    assert params["total_traveler_load_kg"] == 135.0
    assert params["target_sighting_distance_km"] == 15.0
    assert params["is_calculation"] is True


def test_format_salt_pan_navigation_response_actions():
    # 1. Calculated action
    ans_calc, info_calc = format_salt_pan_navigation_response(
        "Calculate salt pan navigation safety for halite crust thickness 38 cm, water table depth 45 cm, air temp 14 C, ground temp 22 C, load 95 kg, sighting distance 12 km"
    )
    assert isinstance(ans_calc, str) and len(ans_calc) > 20
    assert info_calc["action"] == "salt_pan_navigation_calculated"
    assert "crust_bearing_safety_factor" in info_calc
    assert "safety_status" in info_calc

    # 2. Lookup action
    ans_lookup, info_lookup = format_salt_pan_navigation_response(
        "Tell me about Salar de Uyuni Incahuasi halite polygon basin site details"
    )
    assert isinstance(ans_lookup, str) and "Salar de Uyuni" in ans_lookup
    assert info_lookup["action"] == "salt_pan_navigation_lookup"
    assert (
        info_lookup["site"]["id"]
        == "salar-de-uyuni-incahuasi-halite-polygon-basin"
    )

    # 3. General info action
    ans_info, info_general = format_salt_pan_navigation_response(
        "What mandatory gear is required for arid salt pan crust and mirage compass navigation?"
    )
    assert isinstance(ans_info, str) and len(ans_info) > 20
    assert info_general["action"] == "salt_pan_navigation_info"
    assert len(info_general["sites"]) == 5
    assert len(info_general["gear_checklist"]) == 6


@pytest.mark.anyio
async def test_chat_and_stream_handlers_and_prompt():
    prompt = build_salt_pan_navigation_prompt(
        "How do we cross Makgadikgadi Ntwetwe salt pan?"
    )
    assert "Makgadikgadi" in prompt

    chat_res = handle_salt_pan_navigation_intent(
        "Tell me about Salar de Uyuni Incahuasi halite polygon basin"
    )
    assert chat_res is not None
    assert "salt_pan_navigation_info" in chat_res
    assert (
        chat_res["salt_pan_navigation_info"]["action"]
        == "salt_pan_navigation_lookup"
    )

    assert (
        handle_salt_pan_navigation_intent("Where is my order #12345?") is None
    )

    events = []
    async for ev in generate_salt_pan_navigation_stream_events(
        "Calculate salt pan safety for halite crust thickness 38 cm, water table depth 45 cm, air temp 14 C, ground temp 22 C, load 95 kg, sighting distance 12 km"
    ):
        events.append(ev)
    joined = "".join(events)
    assert "event: metadata" in joined
    assert "salt_pan_navigation_calculated" in joined
    assert "event: done" in joined


def test_salt_pan_navigation_router_endpoints():
    # Dual prefixes: /salt-pan-navigation and /api/salt-pan-navigation
    for prefix in ("/salt-pan-navigation", "/api/salt-pan-navigation"):
        res_sites = client.get(f"{prefix}/sites")
        assert res_sites.status_code == 200
        assert len(res_sites.json()) == 5

        res_filter = client.get(
            f"{prefix}/sites",
            params={"refraction_state": "fata_morgana_vertical_loom"},
        )
        assert res_filter.status_code == 200
        assert len(res_filter.json()) == 2

        res_422 = client.get(
            f"{prefix}/sites",
            params={"crust_type": "invalid_crust_type_value"},
        )
        assert res_422.status_code == 422

        res_detail = client.get(
            f"{prefix}/sites/salar-de-uyuni-incahuasi-halite-polygon-basin"
        )
        assert res_detail.status_code == 200
        assert (
            res_detail.json()["id"]
            == "salar-de-uyuni-incahuasi-halite-polygon-basin"
        )

        res_404 = client.get(f"{prefix}/sites/unknown-salt-pan-site")
        assert res_404.status_code == 404

        res_calc = client.post(
            f"{prefix}/calculate",
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
        assert res_calc.status_code == 200
        assert (
            res_calc.json()["safety_status"]
            == "nominal_crystalline_halite_corridor"
        )

        res_calc_422 = client.post(
            f"{prefix}/calculate",
            json={
                "crust_type": "polygonal_halite_pressure_ridge",
                "refraction_state": "predawn_isothermal_clarity",
                "traversal_mode": "wide_tire_desert_expedition_cart",
                "halite_crust_thickness_cm": 0.2,
                "water_table_depth_cm": 45.0,
                "surface_air_temp_c": 14.0,
                "ground_skin_temp_c": 22.0,
                "total_traveler_load_kg": 95.0,
                "target_sighting_distance_km": 12.0,
            },
        )
        assert res_calc_422.status_code == 422

        res_gear = client.get(f"{prefix}/gear")
        assert res_gear.status_code == 200
        assert len(res_gear.json()) == 6
