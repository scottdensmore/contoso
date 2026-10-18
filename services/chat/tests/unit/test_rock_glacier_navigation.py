from typing import get_args

import pytest
from contoso_chat.canyon_bouldering import detect_canyon_bouldering_intent
from contoso_chat.chat import handle_rock_glacier_navigation_intent
from contoso_chat.cryokarst_speleology import detect_cryokarst_speleology_intent
from contoso_chat.glacier_navigation import detect_glacier_intent
from contoso_chat.glacier_ski_traverse import detect_glacier_ski_traverse_intent
from contoso_chat.mountaineering import detect_mountaineering_intent
from contoso_chat.rock_glacier_navigation import (
    ROCK_GLACIER_GEAR_CHECKLIST,
    ROCK_GLACIER_SITES,
    CarapaceTraversalTechnique,
    InterstitialIceState,
    RockGlacierMorphologyType,
    RockGlacierSafetyStatus,
    build_rock_glacier_navigation_prompt,
    calculate_rock_glacier_navigation_safety,
    extract_rock_glacier_navigation_params,
    filter_rock_glacier_sites,
    format_rock_glacier_navigation_response,
    get_all_rock_glacier_sites,
    get_rock_glacier_gear_checklist,
    get_rock_glacier_site_by_id,
    is_rock_glacier_navigation_query,
)
from contoso_chat.scree_running import detect_scree_running_intent
from contoso_chat.stream import generate_rock_glacier_navigation_stream_events
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_rock_glacier_literals():
    assert set(get_args(RockGlacierMorphologyType)) == {
        "active_lobate_ice_cored_carapace",
        "tongue_shaped_interstitial_ice_matrix",
        "oversteepened_frontal_talus_apron",
        "thermokarst_furrow_and_ridge_labyrinth",
        "relict_collapsed_boulder_blockfield",
    }
    assert set(get_args(InterstitialIceState)) == {
        "cryo_cemented_permafrost_lock",
        "seasonal_active_layer_thaw_lubrication",
        "basal_meltwater_piping_undercut",
        "isothermal_debris_creep_slump",
    }
    assert set(get_args(CarapaceTraversalTechnique)) == {
        "compression_ridge_crest_hopping",
        "diagonal_furrow_trough_contouring",
        "three_point_imbricated_slab_stepping",
        "belayed_frontal_scarp_switchbacking",
    }
    assert set(get_args(RockGlacierSafetyStatus)) == {
        "nominal_cryo_cemented_carapace",
        "caution_perched_block_and_void_hazard",
        "abort_oversteepened_scarp_or_thaw_rotation",
    }


def test_rock_glacier_sites_catalog_and_lookup():
    assert len(ROCK_GLACIER_SITES) == 5
    all_sites = get_all_rock_glacier_sites()
    assert len(all_sites) == 5

    expected_ids = {
        "sourdough-peak-mccarthy-creek-rock-glacier",
        "mount-mendenhall-san-juan-imbricated-tongue",
        "muragl-upper-engadine-permafrost-carapace",
        "dos-lenguas-agua-negra-andean-cryolith-lobe",
        "nesters-ridge-wheeler-peak-quartzite-blockfield",
    }
    assert {s["id"] for s in all_sites} == expected_ids

    sourdough = get_rock_glacier_site_by_id(
        "sourdough-peak-mccarthy-creek-rock-glacier"
    )
    assert sourdough is not None
    assert sourdough["id"] == "sourdough-peak-mccarthy-creek-rock-glacier"
    assert sourdough["morphology"] == "active_lobate_ice_cored_carapace"
    assert sourdough["ice_state"] == "cryo_cemented_permafrost_lock"
    assert sourdough["technique"] == "compression_ridge_crest_hopping"
    assert sourdough["elevation"] == 1720
    assert sourdough["mean_block_diameter_cm"] == 75.0
    assert sourdough["slope_angle_deg"] == 21.0
    assert sourdough["active_layer_thaw_depth_cm"] == 65.0
    assert sourdough["interstitial_void_ratio_percent"] == 22.0

    mendenhall = get_rock_glacier_site_by_id(
        "mount-mendenhall-san-juan-imbricated-tongue"
    )
    assert mendenhall is not None
    assert mendenhall["morphology"] == "tongue_shaped_interstitial_ice_matrix"
    assert (
        mendenhall["ice_state"] == "seasonal_active_layer_thaw_lubrication"
    )
    assert mendenhall["technique"] == "three_point_imbricated_slab_stepping"
    assert mendenhall["elevation"] == 3780
    assert mendenhall["mean_block_diameter_cm"] == 92.0
    assert mendenhall["slope_angle_deg"] == 27.0
    assert mendenhall["active_layer_thaw_depth_cm"] == 125.0
    assert mendenhall["interstitial_void_ratio_percent"] == 31.0

    muragl = get_rock_glacier_site_by_id(
        "muragl-upper-engadine-permafrost-carapace"
    )
    assert muragl is not None
    assert muragl["morphology"] == "thermokarst_furrow_and_ridge_labyrinth"
    assert muragl["ice_state"] == "basal_meltwater_piping_undercut"
    assert muragl["technique"] == "diagonal_furrow_trough_contouring"
    assert muragl["elevation"] == 2680
    assert muragl["mean_block_diameter_cm"] == 84.0
    assert muragl["slope_angle_deg"] == 25.0
    assert muragl["active_layer_thaw_depth_cm"] == 145.0
    assert muragl["interstitial_void_ratio_percent"] == 35.0

    dos_lenguas = get_rock_glacier_site_by_id(
        "dos-lenguas-agua-negra-andean-cryolith-lobe"
    )
    assert dos_lenguas is not None
    assert dos_lenguas["morphology"] == "oversteepened_frontal_talus_apron"
    assert dos_lenguas["ice_state"] == "isothermal_debris_creep_slump"
    assert dos_lenguas["technique"] == "belayed_frontal_scarp_switchbacking"
    assert dos_lenguas["elevation"] == 4450
    assert dos_lenguas["mean_block_diameter_cm"] == 68.0
    assert dos_lenguas["slope_angle_deg"] == 39.0
    assert dos_lenguas["active_layer_thaw_depth_cm"] == 210.0
    assert dos_lenguas["interstitial_void_ratio_percent"] == 42.0

    wheeler = get_rock_glacier_site_by_id(
        "nesters-ridge-wheeler-peak-quartzite-blockfield"
    )
    assert wheeler is not None
    assert wheeler["morphology"] == "relict_collapsed_boulder_blockfield"
    assert wheeler["ice_state"] == "cryo_cemented_permafrost_lock"
    assert wheeler["technique"] == "three_point_imbricated_slab_stepping"
    assert wheeler["elevation"] == 3410
    assert wheeler["mean_block_diameter_cm"] == 110.0
    assert wheeler["slope_angle_deg"] == 19.0
    assert wheeler["active_layer_thaw_depth_cm"] == 80.0
    assert wheeler["interstitial_void_ratio_percent"] == 24.0

    assert get_rock_glacier_site_by_id("nonexistent-rock-glacier-site") is None


def test_filter_rock_glacier_sites():
    lobate = filter_rock_glacier_sites(
        morphology="active_lobate_ice_cored_carapace"
    )
    assert len(lobate) == 1
    assert lobate[0]["id"] == "sourdough-peak-mccarthy-creek-rock-glacier"

    cryo_locked = filter_rock_glacier_sites(
        ice_state="cryo_cemented_permafrost_lock"
    )
    assert len(cryo_locked) == 2
    assert {s["id"] for s in cryo_locked} == {
        "sourdough-peak-mccarthy-creek-rock-glacier",
        "nesters-ridge-wheeler-peak-quartzite-blockfield",
    }

    slab_stepping = filter_rock_glacier_sites(
        technique="three_point_imbricated_slab_stepping"
    )
    assert len(slab_stepping) == 2
    assert {s["id"] for s in slab_stepping} == {
        "mount-mendenhall-san-juan-imbricated-tongue",
        "nesters-ridge-wheeler-peak-quartzite-blockfield",
    }

    combined = filter_rock_glacier_sites(
        morphology="relict_collapsed_boulder_blockfield",
        ice_state="cryo_cemented_permafrost_lock",
        technique="three_point_imbricated_slab_stepping",
    )
    assert len(combined) == 1
    assert (
        combined[0]["id"]
        == "nesters-ridge-wheeler-peak-quartzite-blockfield"
    )

    with pytest.raises(ValueError, match="Invalid morphology"):
        filter_rock_glacier_sites(morphology="invalid_morphology")

    with pytest.raises(ValueError, match="Invalid ice_state"):
        filter_rock_glacier_sites(ice_state="invalid_ice_state")

    with pytest.raises(ValueError, match="Invalid technique"):
        filter_rock_glacier_sites(technique="invalid_technique")


def test_rock_glacier_gear_checklist():
    assert len(ROCK_GLACIER_GEAR_CHECKLIST) == 6
    gear = get_rock_glacier_gear_checklist()
    assert len(gear) == 6
    assert all(item["mandatory"] is True for item in gear)

    expected_gear = {
        "stiff-shank-vibram-megagrip-mountaineering-boots": "ankle_tibial_armor",
        "kevlar-reinforced-nitrile-palm-boulder-gloves": "block_stabilization",
        "fixed-section-chromoly-scrambling-staff-no-baskets": "block_stabilization",
        "uiia-certified-rockfall-and-impact-climbing-helmet": "ankle_tibial_armor",
        "high-collar-ballistic-nylon-talus-gaiters": "void_entrapment_defense",
        "compact-dyneema-cord-and-pulley-block-extrication-kit": "void_entrapment_defense",
    }
    for item in gear:
        assert item["id"] in expected_gear
        assert item["category"] == expected_gear[item["id"]]


def test_calculate_rock_glacier_navigation_safety_regimes():
    # 1. Nominal cryo-cemented carapace
    nominal = calculate_rock_glacier_navigation_safety(
        morphology="active_lobate_ice_cored_carapace",
        ice_state="cryo_cemented_permafrost_lock",
        technique="compression_ridge_crest_hopping",
        mean_block_diameter_cm=95.0,
        slope_angle_deg=18.0,
        active_layer_thaw_depth_cm=60.0,
        interstitial_void_ratio_percent=20.0,
        ambient_air_temp_c=-4.0,
        pack_weight_kg=12.0,
    )
    assert nominal["safety_status"] == "nominal_cryo_cemented_carapace"
    assert nominal["block_rotational_stability_index"] >= 1.75
    assert nominal["perched_block_tip_probability"] < 0.22
    assert nominal["sub_carapace_void_entrapment_risk_percent"] < 25.0
    assert nominal["effective_horizontal_pace_mhr"] >= 280.0
    assert len(nominal["carapace_routing_protocol"]) > 20
    assert len(nominal["tibial_entrapment_and_rockfall_advisory"]) > 20

    # 2. Caution perched block and void hazard
    caution = calculate_rock_glacier_navigation_safety(
        morphology="tongue_shaped_interstitial_ice_matrix",
        ice_state="seasonal_active_layer_thaw_lubrication",
        technique="three_point_imbricated_slab_stepping",
        mean_block_diameter_cm=84.0,
        slope_angle_deg=27.0,
        active_layer_thaw_depth_cm=135.0,
        interstitial_void_ratio_percent=33.0,
        ambient_air_temp_c=8.0,
        pack_weight_kg=18.0,
    )
    assert (
        caution["safety_status"] == "caution_perched_block_and_void_hazard"
    )
    assert (
        caution["block_rotational_stability_index"]
        < nominal["block_rotational_stability_index"]
    )
    assert (
        caution["perched_block_tip_probability"]
        > nominal["perched_block_tip_probability"]
    )
    assert (
        caution["sub_carapace_void_entrapment_risk_percent"]
        > nominal["sub_carapace_void_entrapment_risk_percent"]
    )
    assert (
        caution["effective_horizontal_pace_mhr"]
        < nominal["effective_horizontal_pace_mhr"]
    )

    # 3. Abort oversteepened scarp or thaw rotation
    abort = calculate_rock_glacier_navigation_safety(
        morphology="oversteepened_frontal_talus_apron",
        ice_state="isothermal_debris_creep_slump",
        technique="belayed_frontal_scarp_switchbacking",
        mean_block_diameter_cm=55.0,
        slope_angle_deg=41.0,
        active_layer_thaw_depth_cm=230.0,
        interstitial_void_ratio_percent=46.0,
        ambient_air_temp_c=16.0,
        pack_weight_kg=26.0,
    )
    assert (
        abort["safety_status"]
        == "abort_oversteepened_scarp_or_thaw_rotation"
    )
    assert abort["perched_block_tip_probability"] >= 0.60
    assert (
        abort["block_rotational_stability_index"]
        < caution["block_rotational_stability_index"]
    )


@pytest.mark.parametrize(
    "invalid_kwargs",
    [
        {"mean_block_diameter_cm": 10.0},
        {"mean_block_diameter_cm": 310.0},
        {"slope_angle_deg": 3.0},
        {"slope_angle_deg": 58.0},
        {"active_layer_thaw_depth_cm": 5.0},
        {"active_layer_thaw_depth_cm": 420.0},
        {"interstitial_void_ratio_percent": 3.0},
        {"interstitial_void_ratio_percent": 70.0},
        {"ambient_air_temp_c": -40.0},
        {"ambient_air_temp_c": 40.0},
        {"pack_weight_kg": -2.0},
        {"pack_weight_kg": 55.0},
        {"morphology": "invalid_morphology_type"},
        {"ice_state": "invalid_ice_state"},
        {"technique": "invalid_technique"},
    ],
)
def test_calculate_rock_glacier_navigation_validation_errors(invalid_kwargs):
    base_kwargs = {
        "mean_block_diameter_cm": 75.0,
        "slope_angle_deg": 22.0,
        "active_layer_thaw_depth_cm": 80.0,
        "interstitial_void_ratio_percent": 25.0,
        "ambient_air_temp_c": 2.0,
        "pack_weight_kg": 15.0,
    }
    base_kwargs.update(invalid_kwargs)
    with pytest.raises(ValueError):
        calculate_rock_glacier_navigation_safety(**base_kwargs)


def test_is_rock_glacier_navigation_query_and_disambiguation():
    # Positive queries
    assert (
        is_rock_glacier_navigation_query(
            "How do we cross the Sourdough Peak McCarthy Creek lobate rock glacier?"
        )
        is True
    )
    assert (
        is_rock_glacier_navigation_query(
            "Calculate periglacial rock-glacier block stability for Mount Mendenhall imbricated tongue"
        )
        is True
    )
    assert (
        is_rock_glacier_navigation_query(
            "Val Muragl permafrost carapace thermokarst furrow and basal meltwater piping"
        )
        is True
    )
    assert (
        is_rock_glacier_navigation_query(
            "Glaciar de Escombros Dos Lenguas oversteepened frontal talus apron and active layer thaw"
        )
        is True
    )
    assert (
        is_rock_glacier_navigation_query(
            "Wheeler Peak quartzite blockfield felsenmeer interstitial ice matrix navigation"
        )
        is True
    )
    assert (
        is_rock_glacier_navigation_query(
            "What gear prevents tibial entrapment in sub-carapace voids on a rock glacier?"
        )
        is True
    )

    # Negative queries
    assert is_rock_glacier_navigation_query("") is False
    assert is_rock_glacier_navigation_query("   ") is False
    assert is_rock_glacier_navigation_query("Track my order #98765") is False
    assert (
        is_rock_glacier_navigation_query("I want a refund for my tent")
        is False
    )
    assert (
        is_rock_glacier_navigation_query(
            "What is the best fly fishing rod for trout?"
        )
        is False
    )

    # Cross-domain disambiguation: adjacent modules must ignore rock glacier / periglacial / blockfield / felsenmeer / interstitial ice / active layer thaw / glaciar de escombros / val muragl / dos lenguas queries
    disambig_queries = [
        "Glacier navigation and crevasse probing vs periglacial rock glacier interstitial ice matrix",
        "Glacier ski traverse vs rock-glacier active layer thaw and Val Muragl permafrost carapace",
        "Scree running descent vs rock glacier oversteepened frontal talus apron at Dos Lenguas",
        "Canyon bouldering problem vs quartzite blockfield and felsenmeer on a rock glacier",
        "Glacier mountaineering rope team vs glaciar de escombros interstitial ice and rock glacier",
        "Cryokarst speleology subglacial moulin vs rock glacier basal meltwater piping and periglacial blockfield",
    ]
    for q in disambig_queries:
        assert is_rock_glacier_navigation_query(q) is True
        assert detect_glacier_intent(q) is None
        assert detect_glacier_ski_traverse_intent(q) is False
        assert detect_scree_running_intent(q) is False
        assert detect_canyon_bouldering_intent(q) is None
        assert detect_mountaineering_intent(q) is None
        assert detect_cryokarst_speleology_intent(q) is False


def test_extract_rock_glacier_navigation_params():
    q = (
        "Calculate rock glacier navigation safety at Dos Lenguas with block diameter 68 cm, "
        "slope angle 39 deg, active layer thaw depth 210 cm, void ratio 42%, air temp 14 C, pack weight 22 kg"
    )
    params = extract_rock_glacier_navigation_params(q)
    assert (
        params["site_id"] == "dos-lenguas-agua-negra-andean-cryolith-lobe"
    )
    assert params["mean_block_diameter_cm"] == 68.0
    assert params["slope_angle_deg"] == 39.0
    assert params["active_layer_thaw_depth_cm"] == 210.0
    assert params["interstitial_void_ratio_percent"] == 42.0
    assert params["ambient_air_temp_c"] == 14.0
    assert params["pack_weight_kg"] == 22.0
    assert params["is_calculation"] is True


def test_format_rock_glacier_navigation_response_actions():
    # 1. Calculated action
    ans_calc, info_calc = format_rock_glacier_navigation_response(
        "Calculate rock glacier navigation safety for block diameter 75 cm, slope angle 21 deg, thaw depth 65 cm, void ratio 22%, air temp -2 C, pack weight 14 kg"
    )
    assert isinstance(ans_calc, str) and len(ans_calc) > 20
    assert info_calc["action"] == "rock_glacier_navigation_calculated"
    assert "block_rotational_stability_index" in info_calc
    assert "safety_status" in info_calc

    # 2. Lookup action
    ans_lookup, info_lookup = format_rock_glacier_navigation_response(
        "Tell me about Sourdough Peak McCarthy Creek rock glacier site details"
    )
    assert isinstance(ans_lookup, str) and "Sourdough Peak" in ans_lookup
    assert info_lookup["action"] == "rock_glacier_navigation_lookup"
    assert (
        info_lookup["site"]["id"]
        == "sourdough-peak-mccarthy-creek-rock-glacier"
    )

    # 3. General info action
    ans_info, info_general = format_rock_glacier_navigation_response(
        "What mandatory gear is required for periglacial rock glacier and boulder-field navigation?"
    )
    assert isinstance(ans_info, str) and len(ans_info) > 20
    assert info_general["action"] == "rock_glacier_navigation_info"
    assert len(info_general["sites"]) == 5
    assert len(info_general["gear_checklist"]) == 6


@pytest.mark.anyio
async def test_chat_and_stream_handlers_and_prompt():
    prompt = build_rock_glacier_navigation_prompt(
        "How do we cross Val Muragl permafrost rock glacier?"
    )
    assert "Muragl" in prompt

    chat_res = handle_rock_glacier_navigation_intent(
        "Tell me about Sourdough Peak McCarthy Creek rock glacier"
    )
    assert chat_res is not None
    assert "rock_glacier_navigation_info" in chat_res
    assert (
        chat_res["rock_glacier_navigation_info"]["action"]
        == "rock_glacier_navigation_lookup"
    )

    assert (
        handle_rock_glacier_navigation_intent("Where is my order #12345?")
        is None
    )

    events = []
    async for ev in generate_rock_glacier_navigation_stream_events(
        "Calculate rock glacier safety for block diameter 75 cm, slope angle 21 deg, thaw depth 65 cm, void ratio 22%, air temp -2 C, pack weight 14 kg"
    ):
        events.append(ev)
    joined = "".join(events)
    assert "event: metadata" in joined
    assert "rock_glacier_navigation_calculated" in joined
    assert "event: done" in joined


def test_rock_glacier_navigation_router_endpoints():
    # Dual prefixes: /rock-glacier-navigation and /api/rock-glacier-navigation
    for prefix in (
        "/rock-glacier-navigation",
        "/api/rock-glacier-navigation",
    ):
        res_sites = client.get(f"{prefix}/sites")
        assert res_sites.status_code == 200
        assert len(res_sites.json()) == 5

        res_filter = client.get(
            f"{prefix}/sites",
            params={"ice_state": "cryo_cemented_permafrost_lock"},
        )
        assert res_filter.status_code == 200
        assert len(res_filter.json()) == 2

        res_422 = client.get(
            f"{prefix}/sites",
            params={"morphology": "invalid_morphology_value"},
        )
        assert res_422.status_code == 422

        res_detail = client.get(
            f"{prefix}/sites/sourdough-peak-mccarthy-creek-rock-glacier"
        )
        assert res_detail.status_code == 200
        assert (
            res_detail.json()["id"]
            == "sourdough-peak-mccarthy-creek-rock-glacier"
        )

        res_404 = client.get(f"{prefix}/sites/unknown-rock-glacier-site")
        assert res_404.status_code == 404

        res_calc = client.post(
            f"{prefix}/calculate",
            json={
                "morphology": "active_lobate_ice_cored_carapace",
                "ice_state": "cryo_cemented_permafrost_lock",
                "technique": "compression_ridge_crest_hopping",
                "mean_block_diameter_cm": 85.0,
                "slope_angle_deg": 20.0,
                "active_layer_thaw_depth_cm": 65.0,
                "interstitial_void_ratio_percent": 22.0,
                "ambient_air_temp_c": -3.0,
                "pack_weight_kg": 14.0,
            },
        )
        assert res_calc.status_code == 200
        assert (
            res_calc.json()["safety_status"]
            == "nominal_cryo_cemented_carapace"
        )

        res_calc_422 = client.post(
            f"{prefix}/calculate",
            json={
                "morphology": "active_lobate_ice_cored_carapace",
                "ice_state": "cryo_cemented_permafrost_lock",
                "technique": "compression_ridge_crest_hopping",
                "mean_block_diameter_cm": 5.0,
                "slope_angle_deg": 20.0,
                "active_layer_thaw_depth_cm": 65.0,
                "interstitial_void_ratio_percent": 22.0,
                "ambient_air_temp_c": -3.0,
                "pack_weight_kg": 14.0,
            },
        )
        assert res_calc_422.status_code == 422

        res_gear = client.get(f"{prefix}/gear")
        assert res_gear.status_code == 200
        assert len(res_gear.json()) == 6
