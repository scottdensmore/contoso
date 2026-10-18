from typing import get_args

import pytest
from contoso_chat.aufeis_crossing import (
    AUFEIS_GEAR_CHECKLIST,
    AUFEIS_SITES,
    AufeisMorphologyType,
    AufeisSafetyStatus,
    OverflowHydrologyState,
    TraversalModeType,
    build_aufeis_crossing_prompt,
    calculate_aufeis_crossing_safety,
    extract_aufeis_crossing_params,
    filter_aufeis_sites,
    format_aufeis_crossing_response,
    get_all_aufeis_sites,
    get_aufeis_gear_checklist,
    get_aufeis_site_by_id,
    is_aufeis_crossing_query,
)
from contoso_chat.chat import handle_aufeis_crossing_intent
from contoso_chat.crevasse_pulk import detect_crevasse_pulk_intent
from contoso_chat.dogsledding import extract_dogsled_intent
from contoso_chat.glacier_navigation import detect_glacier_intent
from contoso_chat.ice_climbing import detect_ice_climbing_intent
from contoso_chat.nordic_skiing import detect_nordic_skiing_intent
from contoso_chat.stream import generate_aufeis_crossing_stream_events
from contoso_chat.wild_ice import detect_wild_ice_intent
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_aufeis_literals():
    assert set(get_args(AufeisMorphologyType)) == {
        "braided_gravel_bar_sheet_icing",
        "pressurized_groundwater_frost_blister",
        "perennial_tundra_spring_naled",
        "canyon_confinement_stepped_overflow",
        "rotten_candle_ice_ablation_apron",
    }
    assert set(get_args(OverflowHydrologyState)) == {
        "vitreous_dry_cryolock",
        "active_sheet_overflow_film",
        "pressurized_sub_crust_slush_lens",
        "hollow_drained_air_cavity_vault",
    }
    assert set(get_args(TraversalModeType)) == {
        "nordic_backcountry_ski_glide",
        "articulated_crampon_snowshoe",
        "boot_microspike_pulk_tow",
        "belayed_ice_screw_probe_team",
    }
    assert set(get_args(AufeisSafetyStatus)) == {
        "nominal_cryolocked_laminar_sheet",
        "caution_overflow_slush_accretion_hazard",
        "abort_pressurized_lens_or_cavity_collapse",
    }


def test_aufeis_sites_catalog_and_lookup():
    assert len(AUFEIS_SITES) == 5
    all_sites = get_all_aufeis_sites()
    assert len(all_sites) == 5

    expected_ids = {
        "canning-river-shublik-springs-aufeis",
        "firth-river-joe-creek-naled-corridor",
        "delta-river-black-rapids-overflow-sheet",
        "moma-valley-ulakhan-taryn-giant-naled",
        "macmillan-pass-hess-river-frost-blister",
    }
    assert {s["id"] for s in all_sites} == expected_ids

    canning = get_aufeis_site_by_id("canning-river-shublik-springs-aufeis")
    assert canning is not None
    assert canning["id"] == "canning-river-shublik-springs-aufeis"
    assert canning["morphology"] == "perennial_tundra_spring_naled"
    assert canning["overflow_state"] == "vitreous_dry_cryolock"
    assert canning["traversal_mode"] == "nordic_backcountry_ski_glide"
    assert canning["elevation"] == 420
    assert canning["mean_upper_crust_thickness_cm"] == 26.0
    assert canning["slush_water_lens_depth_cm"] == 8.0
    assert canning["hydrostatic_head_kpa"] == 12.0
    assert canning["typical_cavity_span_m"] == 0.6

    firth = get_aufeis_site_by_id("firth-river-joe-creek-naled-corridor")
    assert firth is not None
    assert firth["morphology"] == "braided_gravel_bar_sheet_icing"
    assert firth["overflow_state"] == "active_sheet_overflow_film"
    assert firth["traversal_mode"] == "articulated_crampon_snowshoe"
    assert firth["elevation"] == 360
    assert firth["mean_upper_crust_thickness_cm"] == 15.0
    assert firth["slush_water_lens_depth_cm"] == 28.0
    assert firth["hydrostatic_head_kpa"] == 24.0
    assert firth["typical_cavity_span_m"] == 1.4

    delta = get_aufeis_site_by_id("delta-river-black-rapids-overflow-sheet")
    assert delta is not None
    assert delta["morphology"] == "canyon_confinement_stepped_overflow"
    assert delta["overflow_state"] == "pressurized_sub_crust_slush_lens"
    assert delta["traversal_mode"] == "boot_microspike_pulk_tow"
    assert delta["elevation"] == 690
    assert delta["mean_upper_crust_thickness_cm"] == 11.0
    assert delta["slush_water_lens_depth_cm"] == 45.0
    assert delta["hydrostatic_head_kpa"] == 42.0
    assert delta["typical_cavity_span_m"] == 2.2

    moma = get_aufeis_site_by_id("moma-valley-ulakhan-taryn-giant-naled")
    assert moma is not None
    assert moma["morphology"] == "perennial_tundra_spring_naled"
    assert moma["overflow_state"] == "vitreous_dry_cryolock"
    assert moma["traversal_mode"] == "nordic_backcountry_ski_glide"
    assert moma["elevation"] == 510
    assert moma["mean_upper_crust_thickness_cm"] == 34.0
    assert moma["slush_water_lens_depth_cm"] == 6.0
    assert moma["hydrostatic_head_kpa"] == 10.0
    assert moma["typical_cavity_span_m"] == 0.5

    macmillan = get_aufeis_site_by_id("macmillan-pass-hess-river-frost-blister")
    assert macmillan is not None
    assert macmillan["morphology"] == "pressurized_groundwater_frost_blister"
    assert macmillan["overflow_state"] == "hollow_drained_air_cavity_vault"
    assert macmillan["traversal_mode"] == "belayed_ice_screw_probe_team"
    assert macmillan["elevation"] == 1280
    assert macmillan["mean_upper_crust_thickness_cm"] == 7.0
    assert macmillan["slush_water_lens_depth_cm"] == 68.0
    assert macmillan["hydrostatic_head_kpa"] == 68.0
    assert macmillan["typical_cavity_span_m"] == 4.2

    assert get_aufeis_site_by_id("nonexistent-aufeis-site") is None


def test_filter_aufeis_sites():
    naled_sites = filter_aufeis_sites(morphology="perennial_tundra_spring_naled")
    assert len(naled_sites) == 2
    assert {s["id"] for s in naled_sites} == {
        "canning-river-shublik-springs-aufeis",
        "moma-valley-ulakhan-taryn-giant-naled",
    }

    cryolock_sites = filter_aufeis_sites(overflow_state="vitreous_dry_cryolock")
    assert len(cryolock_sites) == 2
    assert {s["id"] for s in cryolock_sites} == {
        "canning-river-shublik-springs-aufeis",
        "moma-valley-ulakhan-taryn-giant-naled",
    }

    snowshoe_sites = filter_aufeis_sites(traversal_mode="articulated_crampon_snowshoe")
    assert len(snowshoe_sites) == 1
    assert snowshoe_sites[0]["id"] == "firth-river-joe-creek-naled-corridor"

    combined = filter_aufeis_sites(
        morphology="pressurized_groundwater_frost_blister",
        overflow_state="hollow_drained_air_cavity_vault",
        traversal_mode="belayed_ice_screw_probe_team",
    )
    assert len(combined) == 1
    assert combined[0]["id"] == "macmillan-pass-hess-river-frost-blister"

    with pytest.raises(ValueError, match="Invalid morphology"):
        filter_aufeis_sites(morphology="invalid_morphology")

    with pytest.raises(ValueError, match="Invalid overflow_state"):
        filter_aufeis_sites(overflow_state="invalid_overflow_state")

    with pytest.raises(ValueError, match="Invalid traversal_mode"):
        filter_aufeis_sites(traversal_mode="invalid_traversal_mode")


def test_aufeis_gear_checklist():
    assert len(AUFEIS_GEAR_CHECKLIST) == 6
    gear = get_aufeis_gear_checklist()
    assert len(gear) == 6
    assert all(item["mandatory"] is True for item in gear)

    expected_gear = {
        "graduated-chisel-tip-ice-sounding-bar": "ice_sounding",
        "vapor-barrier-neoprene-insulated-overboots": "slush_waterproofing",
        "ptfe-fluoropolymer-ski-base-anti-ice-scraper": "accretion_defense",
        "retractable-dual-ice-awls-and-throw-bag": "self_extraction",
        "tubular-22cm-express-ice-screws-and-v-threader": "ice_sounding",
        "sealed-drybag-pulk-hull-and-floating-tow-tether": "slush_waterproofing",
    }
    for item in gear:
        assert item["id"] in expected_gear
        assert item["category"] == expected_gear[item["id"]]


def test_calculate_aufeis_crossing_safety_regimes():
    # 1. Nominal cryolocked laminar sheet
    nominal = calculate_aufeis_crossing_safety(
        morphology="perennial_tundra_spring_naled",
        overflow_state="vitreous_dry_cryolock",
        traversal_mode="nordic_backcountry_ski_glide",
        upper_crust_thickness_cm=28.0,
        slush_water_lens_depth_cm=6.0,
        ambient_air_temp_c=-22.0,
        hydrostatic_head_kpa=10.0,
        traveler_plus_pulk_load_kg=95.0,
        cavity_span_m=0.5,
    )
    assert nominal["safety_status"] == "nominal_cryolocked_laminar_sheet"
    assert nominal["effective_crust_bearing_margin"] >= 1.7
    assert nominal["slush_breakthrough_probability"] < 0.25
    assert nominal["ski_boot_ice_accretion_rate_mm_min"] < 1.5
    assert nominal["cavity_vault_collapse_risk_percent"] < 25.0
    assert len(nominal["overflow_routing_protocol"]) > 20
    assert len(nominal["slush_extraction_and_deicing_advisory"]) > 20

    # 2. Caution overflow slush accretion hazard
    caution = calculate_aufeis_crossing_safety(
        morphology="braided_gravel_bar_sheet_icing",
        overflow_state="active_sheet_overflow_film",
        traversal_mode="articulated_crampon_snowshoe",
        upper_crust_thickness_cm=15.0,
        slush_water_lens_depth_cm=28.0,
        ambient_air_temp_c=-16.0,
        hydrostatic_head_kpa=24.0,
        traveler_plus_pulk_load_kg=115.0,
        cavity_span_m=1.4,
    )
    assert caution["safety_status"] == "caution_overflow_slush_accretion_hazard"
    assert caution["effective_crust_bearing_margin"] < nominal["effective_crust_bearing_margin"]
    assert caution["slush_breakthrough_probability"] > nominal["slush_breakthrough_probability"]
    assert caution["ski_boot_ice_accretion_rate_mm_min"] > nominal["ski_boot_ice_accretion_rate_mm_min"]

    # 3. Abort pressurized lens or cavity collapse
    abort = calculate_aufeis_crossing_safety(
        morphology="pressurized_groundwater_frost_blister",
        overflow_state="hollow_drained_air_cavity_vault",
        traversal_mode="belayed_ice_screw_probe_team",
        upper_crust_thickness_cm=6.0,
        slush_water_lens_depth_cm=70.0,
        ambient_air_temp_c=-28.0,
        hydrostatic_head_kpa=72.0,
        traveler_plus_pulk_load_kg=145.0,
        cavity_span_m=4.5,
    )
    assert abort["safety_status"] == "abort_pressurized_lens_or_cavity_collapse"
    assert abort["slush_breakthrough_probability"] >= 0.65
    assert abort["cavity_vault_collapse_risk_percent"] >= 65.0
    assert abort["effective_crust_bearing_margin"] < caution["effective_crust_bearing_margin"]


@pytest.mark.parametrize(
    "invalid_kwargs",
    [
        {"upper_crust_thickness_cm": 0.5},
        {"upper_crust_thickness_cm": 155.0},
        {"slush_water_lens_depth_cm": -1.0},
        {"slush_water_lens_depth_cm": 260.0},
        {"ambient_air_temp_c": -60.0},
        {"ambient_air_temp_c": 18.0},
        {"hydrostatic_head_kpa": -2.0},
        {"hydrostatic_head_kpa": 160.0},
        {"traveler_plus_pulk_load_kg": 25.0},
        {"traveler_plus_pulk_load_kg": 260.0},
        {"cavity_span_m": -0.5},
        {"cavity_span_m": 16.0},
        {"morphology": "invalid_morphology"},
        {"overflow_state": "invalid_overflow_state"},
        {"traversal_mode": "invalid_traversal_mode"},
    ],
)
def test_calculate_aufeis_crossing_validation_errors(invalid_kwargs):
    base_kwargs = {
        "upper_crust_thickness_cm": 20.0,
        "slush_water_lens_depth_cm": 15.0,
        "ambient_air_temp_c": -18.0,
        "hydrostatic_head_kpa": 18.0,
        "traveler_plus_pulk_load_kg": 100.0,
        "cavity_span_m": 1.0,
    }
    base_kwargs.update(invalid_kwargs)
    with pytest.raises(ValueError):
        calculate_aufeis_crossing_safety(**base_kwargs)


def test_is_aufeis_crossing_query_and_disambiguation():
    # Positive queries
    assert is_aufeis_crossing_query("How do we cross the Canning River Shublik Springs aufeis field?") is True
    assert is_aufeis_crossing_query("Calculate aufeis crossing safety for Firth River Joe Creek naled corridor") is True
    assert is_aufeis_crossing_query("Pressurized frost blister and overflow ice sheet hazard at Macmillan Pass Hess River") is True
    assert is_aufeis_crossing_query("Moma Valley Ulakhan-Taryn giant naled crust thickness and sounding bar") is True
    assert is_aufeis_crossing_query("Delta River Black Rapids overflow ice slush lens and candle ice ablation") is True
    assert is_aufeis_crossing_query("What gear prevents slush freezing onto ski bases on a subarctic icing sheet?") is True

    # Negative queries
    assert is_aufeis_crossing_query("") is False
    assert is_aufeis_crossing_query("   ") is False
    assert is_aufeis_crossing_query("Track my order #98765") is False
    assert is_aufeis_crossing_query("I want a refund for my boots") is False
    assert is_aufeis_crossing_query("What is the best fly fishing rod for trout?") is False

    # Cross-domain disambiguation: adjacent modules must ignore aufeis/naled/overflow ice/frost blister/icing sheet/ulakhan-taryn/candle ice queries
    disambig_queries = [
        "Cross subarctic river aufeis and pressurized frost blister with pulk tow and ice screws",
        "Naled icing sheet traversal on nordic skis across Ulakhan-Taryn overflow ice",
        "Candle ice ablation apron and river overflow ice slush lens sounding bar check",
        "Frost blister cavity collapse and aufeis slush waterproofing overboots with crampons",
    ]
    for q in disambig_queries:
        assert is_aufeis_crossing_query(q) is True
        assert detect_wild_ice_intent(q) is None
        assert detect_crevasse_pulk_intent(q) is False
        assert detect_glacier_intent(q) is None
        assert detect_ice_climbing_intent(q) is None
        assert extract_dogsled_intent(q) is None
        assert detect_nordic_skiing_intent(q) is None


def test_extract_aufeis_crossing_params():
    q = (
        "Calculate aufeis crossing safety at Delta River Black Rapids with crust thickness 11 cm, "
        "slush lens depth 45 cm, air temp -18 C, hydrostatic head 42 kPa, load 125 kg, cavity span 2.2 m"
    )
    params = extract_aufeis_crossing_params(q)
    assert params["site_id"] == "delta-river-black-rapids-overflow-sheet"
    assert params["upper_crust_thickness_cm"] == 11.0
    assert params["slush_water_lens_depth_cm"] == 45.0
    assert params["ambient_air_temp_c"] == -18.0
    assert params["hydrostatic_head_kpa"] == 42.0
    assert params["traveler_plus_pulk_load_kg"] == 125.0
    assert params["cavity_span_m"] == 2.2
    assert params["is_calculation"] is True


def test_format_aufeis_crossing_response_actions():
    # 1. Calculated action
    ans_calc, info_calc = format_aufeis_crossing_response(
        "Calculate aufeis crossing safety for crust thickness 26 cm, slush depth 8 cm, air temp -22 C, hydrostatic head 12 kPa, load 95 kg, cavity span 0.6 m"
    )
    assert isinstance(ans_calc, str) and len(ans_calc) > 20
    assert info_calc["action"] == "aufeis_crossing_calculated"
    assert "effective_crust_bearing_margin" in info_calc
    assert "safety_status" in info_calc

    # 2. Lookup action
    ans_lookup, info_lookup = format_aufeis_crossing_response(
        "Tell me about Canning River Shublik Springs aufeis site details"
    )
    assert isinstance(ans_lookup, str) and "Canning River" in ans_lookup
    assert info_lookup["action"] == "aufeis_crossing_lookup"
    assert info_lookup["site"]["id"] == "canning-river-shublik-springs-aufeis"

    # 3. General info action
    ans_info, info_general = format_aufeis_crossing_response(
        "What mandatory gear is required for subarctic river aufeis and naled crossings?"
    )
    assert isinstance(ans_info, str) and len(ans_info) > 20
    assert info_general["action"] == "aufeis_crossing_info"
    assert len(info_general["sites"]) == 5
    assert len(info_general["gear_checklist"]) == 6


@pytest.mark.anyio
async def test_chat_and_stream_handlers_and_prompt():
    prompt = build_aufeis_crossing_prompt("How do we cross Firth River naled?")
    assert "Firth River" in prompt

    chat_res = handle_aufeis_crossing_intent(
        "Tell me about Moma Valley Ulakhan-Taryn giant naled"
    )
    assert chat_res is not None
    assert "aufeis_crossing_info" in chat_res
    assert chat_res["aufeis_crossing_info"]["action"] == "aufeis_crossing_lookup"

    assert handle_aufeis_crossing_intent("Where is my order #12345?") is None

    events = []
    async for ev in generate_aufeis_crossing_stream_events(
        "Calculate aufeis safety for crust thickness 28 cm, slush depth 6 cm, air temp -20 C, hydrostatic head 10 kPa, load 90 kg, cavity span 0.5 m"
    ):
        events.append(ev)
    joined = "".join(events)
    assert "event: metadata" in joined
    assert "aufeis_crossing_calculated" in joined
    assert "event: done" in joined


def test_aufeis_crossing_router_endpoints():
    # Dual prefixes: /aufeis-crossing and /api/aufeis-crossing
    for prefix in ("/aufeis-crossing", "/api/aufeis-crossing"):
        res_sites = client.get(f"{prefix}/sites")
        assert res_sites.status_code == 200
        assert len(res_sites.json()) == 5

        res_filter = client.get(
            f"{prefix}/sites",
            params={"morphology": "perennial_tundra_spring_naled"},
        )
        assert res_filter.status_code == 200
        assert len(res_filter.json()) == 2

        res_422 = client.get(
            f"{prefix}/sites",
            params={"morphology": "invalid_morphology_value"},
        )
        assert res_422.status_code == 422

        res_detail = client.get(
            f"{prefix}/sites/canning-river-shublik-springs-aufeis"
        )
        assert res_detail.status_code == 200
        assert res_detail.json()["id"] == "canning-river-shublik-springs-aufeis"

        res_404 = client.get(f"{prefix}/sites/unknown-aufeis-site")
        assert res_404.status_code == 404

        res_calc = client.post(
            f"{prefix}/calculate",
            json={
                "morphology": "perennial_tundra_spring_naled",
                "overflow_state": "vitreous_dry_cryolock",
                "traversal_mode": "nordic_backcountry_ski_glide",
                "upper_crust_thickness_cm": 26.0,
                "slush_water_lens_depth_cm": 8.0,
                "ambient_air_temp_c": -22.0,
                "hydrostatic_head_kpa": 12.0,
                "traveler_plus_pulk_load_kg": 95.0,
                "cavity_span_m": 0.6,
            },
        )
        assert res_calc.status_code == 200
        assert res_calc.json()["safety_status"] == "nominal_cryolocked_laminar_sheet"

        res_calc_422 = client.post(
            f"{prefix}/calculate",
            json={
                "morphology": "perennial_tundra_spring_naled",
                "overflow_state": "vitreous_dry_cryolock",
                "traversal_mode": "nordic_backcountry_ski_glide",
                "upper_crust_thickness_cm": 0.2,
                "slush_water_lens_depth_cm": 8.0,
                "ambient_air_temp_c": -22.0,
                "hydrostatic_head_kpa": 12.0,
                "traveler_plus_pulk_load_kg": 95.0,
                "cavity_span_m": 0.6,
            },
        )
        assert res_calc_422.status_code == 422

        res_gear = client.get(f"{prefix}/gear")
        assert res_gear.status_code == 200
        assert len(res_gear.json()) == 6
