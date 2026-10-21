from typing import get_args

import pytest
from contoso_chat.bog_shoeing import detect_bog_shoeing_intent
from contoso_chat.canoe_expedition import extract_canoe_intent
from contoso_chat.chat import handle_mangrove_labyrinth_intent
from contoso_chat.mangrove_labyrinth import (
    MANGROVE_LABYRINTH_GEAR_CHECKLIST,
    MANGROVE_LABYRINTH_SITES,
    EstuarineTraversalMode,
    MangroveRootMorphology,
    MangroveSafetyStatus,
    TidalCreekRegime,
    build_mangrove_labyrinth_prompt,
    calculate_mangrove_labyrinth_navigation,
    extract_mangrove_labyrinth_params,
    filter_mangrove_labyrinth_sites,
    format_mangrove_labyrinth_response,
    get_all_mangrove_labyrinth_sites,
    get_mangrove_labyrinth_gear_checklist,
    get_mangrove_labyrinth_site_by_id,
    is_mangrove_labyrinth_query,
)
from contoso_chat.mudflat_trekking import detect_mudflat_intent
from contoso_chat.packrafting import detect_packrafting_intent
from contoso_chat.river_sup import detect_river_sup_intent
from contoso_chat.sea_kayaking import detect_sea_kayaking_intent
from contoso_chat.stream import generate_mangrove_labyrinth_stream_events
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_mangrove_labyrinth_literals():
    assert set(get_args(MangroveRootMorphology)) == {
        "rhizophora_arching_prop_root_tangle",
        "avicennia_dense_pencil_pneumatophore_mat",
        "bruguiera_buttress_knee_root_hummocks",
        "sonneratia_conical_spike_root_shoal",
        "submerged_oyster_encrusted_deadfall_snag",
    }
    assert set(get_args(TidalCreekRegime)) == {
        "high_slack_canopy_tunnel_float",
        "ebb_tide_dendritic_channel_drain",
        "flood_tide_sheetflow_inundation",
        "spring_low_exposed_sulfidic_mud_plug",
    }
    assert set(get_args(EstuarineTraversalMode)) == {
        "short_hull_sit_in_creek_kayak",
        "sup_finless_shallow_draft_poling",
        "root_stepping_and_mud_ski_wading",
        "packraft_amphibious_portage",
    }
    assert set(get_args(MangroveSafetyStatus)) == {
        "nominal_high_slack_canopy_corridor",
        "caution_prop_root_pinning_and_oyster_laceration",
        "abort_ebb_stranding_or_anoxic_silt_entrapment",
    }


def test_mangrove_labyrinth_sites_catalog_and_lookup():
    assert len(MANGROVE_LABYRINTH_SITES) == 5
    all_sites = get_all_mangrove_labyrinth_sites()
    assert len(all_sites) == 5

    expected_ids = {
        "everglades-hell-bay-labyrinth-waterway",
        "sundarbans-harbhanga-tidal-creek-nexus",
        "hinchinbrook-missionary-bay-mangrove-tunnels",
        "osa-sierpe-terraba-buttress-root-estuary",
        "iriomote-nakama-river-bruguiera-knee-root-creek",
    }
    assert {s["id"] for s in all_sites} == expected_ids

    everglades = get_mangrove_labyrinth_site_by_id(
        "everglades-hell-bay-labyrinth-waterway"
    )
    assert everglades is not None
    assert everglades["id"] == "everglades-hell-bay-labyrinth-waterway"
    assert everglades["root_morphology"] == "rhizophora_arching_prop_root_tangle"
    assert everglades["tidal_regime"] == "high_slack_canopy_tunnel_float"
    assert everglades["traversal_mode"] == "short_hull_sit_in_creek_kayak"
    assert everglades["elevation"] == 0
    assert everglades["prop_root_density_stems_m2"] == 14.0
    assert everglades["typical_current_velocity_knots"] == 0.6
    assert everglades["typical_water_depth_over_mud_cm"] == 62.0
    assert everglades["anoxic_silt_sink_depth_cm"] == 35.0
    assert everglades["canopy_closure_percent"] == 88.0

    sundarbans = get_mangrove_labyrinth_site_by_id(
        "sundarbans-harbhanga-tidal-creek-nexus"
    )
    assert sundarbans is not None
    assert (
        sundarbans["root_morphology"]
        == "avicennia_dense_pencil_pneumatophore_mat"
    )
    assert sundarbans["tidal_regime"] == "ebb_tide_dendritic_channel_drain"
    assert sundarbans["traversal_mode"] == "short_hull_sit_in_creek_kayak"
    assert sundarbans["elevation"] == 1
    assert sundarbans["prop_root_density_stems_m2"] == 42.0
    assert sundarbans["typical_current_velocity_knots"] == 2.4
    assert sundarbans["typical_water_depth_over_mud_cm"] == 48.0
    assert sundarbans["anoxic_silt_sink_depth_cm"] == 72.0
    assert sundarbans["canopy_closure_percent"] == 76.0

    hinchinbrook = get_mangrove_labyrinth_site_by_id(
        "hinchinbrook-missionary-bay-mangrove-tunnels"
    )
    assert hinchinbrook is not None
    assert (
        hinchinbrook["root_morphology"]
        == "bruguiera_buttress_knee_root_hummocks"
    )
    assert hinchinbrook["tidal_regime"] == "high_slack_canopy_tunnel_float"
    assert (
        hinchinbrook["traversal_mode"] == "sup_finless_shallow_draft_poling"
    )
    assert hinchinbrook["elevation"] == 0
    assert hinchinbrook["prop_root_density_stems_m2"] == 19.0
    assert hinchinbrook["typical_current_velocity_knots"] == 1.1
    assert hinchinbrook["typical_water_depth_over_mud_cm"] == 78.0
    assert hinchinbrook["anoxic_silt_sink_depth_cm"] == 40.0
    assert hinchinbrook["canopy_closure_percent"] == 82.0

    osa = get_mangrove_labyrinth_site_by_id(
        "osa-sierpe-terraba-buttress-root-estuary"
    )
    assert osa is not None
    assert (
        osa["root_morphology"] == "submerged_oyster_encrusted_deadfall_snag"
    )
    assert osa["tidal_regime"] == "spring_low_exposed_sulfidic_mud_plug"
    assert osa["traversal_mode"] == "packraft_amphibious_portage"
    assert osa["elevation"] == 0
    assert osa["prop_root_density_stems_m2"] == 28.0
    assert osa["typical_current_velocity_knots"] == 2.9
    assert osa["typical_water_depth_over_mud_cm"] == 22.0
    assert osa["anoxic_silt_sink_depth_cm"] == 85.0
    assert osa["canopy_closure_percent"] == 91.0

    iriomote = get_mangrove_labyrinth_site_by_id(
        "iriomote-nakama-river-bruguiera-knee-root-creek"
    )
    assert iriomote is not None
    assert (
        iriomote["root_morphology"] == "sonneratia_conical_spike_root_shoal"
    )
    assert iriomote["tidal_regime"] == "flood_tide_sheetflow_inundation"
    assert iriomote["traversal_mode"] == "root_stepping_and_mud_ski_wading"
    assert iriomote["elevation"] == 0
    assert iriomote["prop_root_density_stems_m2"] == 22.0
    assert iriomote["typical_current_velocity_knots"] == 1.4
    assert iriomote["typical_water_depth_over_mud_cm"] == 54.0
    assert iriomote["anoxic_silt_sink_depth_cm"] == 45.0
    assert iriomote["canopy_closure_percent"] == 79.0

    assert (
        get_mangrove_labyrinth_site_by_id("nonexistent-mangrove-site") is None
    )


def test_filter_mangrove_labyrinth_sites():
    rhizophora = filter_mangrove_labyrinth_sites(
        root_morphology="rhizophora_arching_prop_root_tangle"
    )
    assert len(rhizophora) == 1
    assert rhizophora[0]["id"] == "everglades-hell-bay-labyrinth-waterway"

    high_slack = filter_mangrove_labyrinth_sites(
        tidal_regime="high_slack_canopy_tunnel_float"
    )
    assert len(high_slack) == 2
    assert {s["id"] for s in high_slack} == {
        "everglades-hell-bay-labyrinth-waterway",
        "hinchinbrook-missionary-bay-mangrove-tunnels",
    }

    creek_kayak = filter_mangrove_labyrinth_sites(
        traversal_mode="short_hull_sit_in_creek_kayak"
    )
    assert len(creek_kayak) == 2
    assert {s["id"] for s in creek_kayak} == {
        "everglades-hell-bay-labyrinth-waterway",
        "sundarbans-harbhanga-tidal-creek-nexus",
    }

    combined = filter_mangrove_labyrinth_sites(
        root_morphology="bruguiera_buttress_knee_root_hummocks",
        tidal_regime="high_slack_canopy_tunnel_float",
        traversal_mode="sup_finless_shallow_draft_poling",
    )
    assert len(combined) == 1
    assert (
        combined[0]["id"] == "hinchinbrook-missionary-bay-mangrove-tunnels"
    )

    with pytest.raises(ValueError, match="Invalid root_morphology"):
        filter_mangrove_labyrinth_sites(root_morphology="invalid_root_type")

    with pytest.raises(ValueError, match="Invalid tidal_regime"):
        filter_mangrove_labyrinth_sites(tidal_regime="invalid_tidal_regime")

    with pytest.raises(ValueError, match="Invalid traversal_mode"):
        filter_mangrove_labyrinth_sites(traversal_mode="invalid_mode")


def test_mangrove_labyrinth_gear_checklist():
    assert len(MANGROVE_LABYRINTH_GEAR_CHECKLIST) == 6
    gear = get_mangrove_labyrinth_gear_checklist()
    assert len(gear) == 6
    assert all(item["mandatory"] is True for item in gear)

    expected_gear = {
        "kevlar-armored-cut-resistant-oyster-gloves-and-booties": "laceration_and_puncture_armor",
        "compact-115cm-double-blade-breakdown-tunnel-paddle": "canopy_propulsion",
        "sub-canopy-multi-gnss-breadcrumb-plotter-and-rheoscopic-compass": "labyrinth_wayfinding",
        "biodegradable-reflective-retro-clip-trail-markers": "labyrinth_wayfinding",
        "quick-release-tow-belt-and-floating-snag-pruning-saw": "canopy_propulsion",
        "sealed-permethrin-headnet-and-electrolyte-hydration-bladder": "laceration_and_puncture_armor",
    }
    for item in gear:
        assert item["id"] in expected_gear
        assert item["category"] == expected_gear[item["id"]]


def test_calculate_mangrove_labyrinth_navigation_regimes():
    # 1. Nominal high slack canopy corridor
    nominal = calculate_mangrove_labyrinth_navigation(
        root_morphology="rhizophora_arching_prop_root_tangle",
        tidal_regime="high_slack_canopy_tunnel_float",
        traversal_mode="short_hull_sit_in_creek_kayak",
        prop_root_density_stems_m2=14.0,
        tidal_current_velocity_knots=0.5,
        water_depth_over_mud_cm=75.0,
        anoxic_silt_sink_depth_cm=30.0,
        canopy_closure_percent=80.0,
        tide_stage_hours_to_low=4.5,
    )
    assert nominal["safety_status"] == "nominal_high_slack_canopy_corridor"
    assert nominal["effective_channel_speed_km_hr"] >= 2.0
    assert nominal["root_strainer_pinning_risk_percent"] < 40.0
    assert nominal["anoxic_mud_entrapment_probability"] < 0.30
    assert nominal["safe_ebb_exit_window_minutes"] >= 90
    assert len(nominal["dendritic_wayfinding_protocol"]) > 20
    assert len(nominal["oyster_armor_and_strainer_advisory"]) > 20

    # 2. Caution prop root pinning and oyster laceration
    caution = calculate_mangrove_labyrinth_navigation(
        root_morphology="avicennia_dense_pencil_pneumatophore_mat",
        tidal_regime="ebb_tide_dendritic_channel_drain",
        traversal_mode="short_hull_sit_in_creek_kayak",
        prop_root_density_stems_m2=42.0,
        tidal_current_velocity_knots=2.2,
        water_depth_over_mud_cm=48.0,
        anoxic_silt_sink_depth_cm=60.0,
        canopy_closure_percent=78.0,
        tide_stage_hours_to_low=2.4,
    )
    assert (
        caution["safety_status"]
        == "caution_prop_root_pinning_and_oyster_laceration"
    )
    assert (
        caution["root_strainer_pinning_risk_percent"]
        > nominal["root_strainer_pinning_risk_percent"]
    )
    assert (
        caution["anoxic_mud_entrapment_probability"]
        > nominal["anoxic_mud_entrapment_probability"]
    )
    assert (
        caution["safe_ebb_exit_window_minutes"]
        < nominal["safe_ebb_exit_window_minutes"]
    )

    # 3. Abort ebb stranding or anoxic silt entrapment
    abort = calculate_mangrove_labyrinth_navigation(
        root_morphology="submerged_oyster_encrusted_deadfall_snag",
        tidal_regime="spring_low_exposed_sulfidic_mud_plug",
        traversal_mode="packraft_amphibious_portage",
        prop_root_density_stems_m2=65.0,
        tidal_current_velocity_knots=3.4,
        water_depth_over_mud_cm=15.0,
        anoxic_silt_sink_depth_cm=110.0,
        canopy_closure_percent=94.0,
        tide_stage_hours_to_low=0.6,
    )
    assert (
        abort["safety_status"]
        == "abort_ebb_stranding_or_anoxic_silt_entrapment"
    )
    assert abort["anoxic_mud_entrapment_probability"] >= 0.55
    assert (
        abort["root_strainer_pinning_risk_percent"]
        > caution["root_strainer_pinning_risk_percent"]
    )
    assert (
        abort["safe_ebb_exit_window_minutes"]
        < caution["safe_ebb_exit_window_minutes"]
    )


@pytest.mark.parametrize(
    "invalid_kwargs",
    [
        {"prop_root_density_stems_m2": 0.2},
        {"prop_root_density_stems_m2": 135.0},
        {"tidal_current_velocity_knots": -0.5},
        {"tidal_current_velocity_knots": 9.5},
        {"water_depth_over_mud_cm": -5.0},
        {"water_depth_over_mud_cm": 400.0},
        {"anoxic_silt_sink_depth_cm": 2.0},
        {"anoxic_silt_sink_depth_cm": 210.0},
        {"canopy_closure_percent": -1.0},
        {"canopy_closure_percent": 105.0},
        {"tide_stage_hours_to_low": -0.5},
        {"tide_stage_hours_to_low": 7.5},
        {"root_morphology": "invalid_root_morphology"},
        {"tidal_regime": "invalid_tidal_regime"},
        {"traversal_mode": "invalid_traversal_mode"},
    ],
)
def test_calculate_mangrove_labyrinth_validation_errors(invalid_kwargs):
    base_kwargs = {
        "prop_root_density_stems_m2": 18.0,
        "tidal_current_velocity_knots": 1.2,
        "water_depth_over_mud_cm": 60.0,
        "anoxic_silt_sink_depth_cm": 40.0,
        "canopy_closure_percent": 82.0,
        "tide_stage_hours_to_low": 3.0,
    }
    base_kwargs.update(invalid_kwargs)
    with pytest.raises(ValueError):
        calculate_mangrove_labyrinth_navigation(**base_kwargs)


def test_is_mangrove_labyrinth_query_and_disambiguation():
    # Positive queries
    assert (
        is_mangrove_labyrinth_query(
            "How do we navigate the Everglades Hell Bay Rhizophora prop-root mangrove labyrinth?"
        )
        is True
    )
    assert (
        is_mangrove_labyrinth_query(
            "Calculate pneumatophore pinning risk and anoxic mud entrapment in Sundarbans Harbhanga creek"
        )
        is True
    )
    assert (
        is_mangrove_labyrinth_query(
            "Hinchinbrook Missionary Bay mangrove canopy tunnels SUP finless poling"
        )
        is True
    )
    assert (
        is_mangrove_labyrinth_query(
            "Osa Sierpe Terraba submerged oyster encrusted deadfall snag and sulfidic mud plug"
        )
        is True
    )
    assert (
        is_mangrove_labyrinth_query(
            "Iriomote Nakama River Bruguiera knee-root and Sonneratia spike-root mangrove channel"
        )
        is True
    )
    assert (
        is_mangrove_labyrinth_query(
            "What Kevlar oyster gloves and sub-canopy GNSS breadcrumb plotter are required for mangrove tunnels?"
        )
        is True
    )

    # Negative queries
    assert is_mangrove_labyrinth_query("") is False
    assert is_mangrove_labyrinth_query("   ") is False
    assert is_mangrove_labyrinth_query("Track my order #98765") is False
    assert (
        is_mangrove_labyrinth_query("I want a refund for my sleeping bag")
        is False
    )
    assert (
        is_mangrove_labyrinth_query(
            "What is the best mountain bike for desert singletrack?"
        )
        is False
    )

    # Cross-domain disambiguation: adjacent modules must ignore mangrove / pneumatophore / prop root / prop-root / rhizophora / avicennia / hell bay / sundarbans / oyster encrusted queries
    disambig_queries = [
        "Mudflat trekking silt vs mangrove pneumatophore mat and prop-root tidal labyrinth in Sundarbans",
        "Sea kayaking tidal current vs Hell Bay Rhizophora prop root canopy tunnel",
        "Canoe expedition portage vs mangrove labyrinth Avicennia pneumatophore creek",
        "Packrafting breakdown paddle vs Osa Sierpe oyster encrusted mangrove prop-root portage",
        "River SUP fin clearance vs Hinchinbrook mangrove prop-root canopy tunnel poling",
        "Bog shoeing muskeg vs mangrove prop root and pneumatophore anoxic mud",
    ]
    for q in disambig_queries:
        assert is_mangrove_labyrinth_query(q) is True
        assert detect_mudflat_intent(q) is None
        assert detect_sea_kayaking_intent(q) is None
        assert extract_canoe_intent(q) is None
        assert detect_packrafting_intent(q) is None
        assert detect_river_sup_intent(q) is None
        assert detect_bog_shoeing_intent(q) is False


def test_extract_mangrove_labyrinth_params():
    q = (
        "Calculate mangrove labyrinth navigation at Sundarbans Harbhanga with prop root density 42 stems/m2, "
        "current velocity 2.4 knots, water depth 48 cm, silt sink depth 72 cm, canopy closure 76%, tide stage 1.8 hours to low"
    )
    params = extract_mangrove_labyrinth_params(q)
    assert params["site_id"] == "sundarbans-harbhanga-tidal-creek-nexus"
    assert params["prop_root_density_stems_m2"] == 42.0
    assert params["tidal_current_velocity_knots"] == 2.4
    assert params["water_depth_over_mud_cm"] == 48.0
    assert params["anoxic_silt_sink_depth_cm"] == 72.0
    assert params["canopy_closure_percent"] == 76.0
    assert params["tide_stage_hours_to_low"] == 1.8
    assert params["is_calculation"] is True


def test_format_mangrove_labyrinth_response_actions():
    # 1. Calculated action
    ans_calc, info_calc = format_mangrove_labyrinth_response(
        "Calculate mangrove labyrinth navigation for prop root density 14 stems/m2, current velocity 0.6 knots, water depth 62 cm, silt sink depth 35 cm, canopy closure 88%, tide stage 3.5 hours"
    )
    assert isinstance(ans_calc, str) and len(ans_calc) > 20
    assert info_calc["action"] == "mangrove_labyrinth_calculated"
    assert "effective_channel_speed_km_hr" in info_calc
    assert "root_strainer_pinning_risk_percent" in info_calc
    assert "anoxic_mud_entrapment_probability" in info_calc
    assert "safe_ebb_exit_window_minutes" in info_calc
    assert "safety_status" in info_calc

    # 2. Lookup action
    ans_lookup, info_lookup = format_mangrove_labyrinth_response(
        "Tell me about Everglades Hell Bay Rhizophora prop-root mangrove labyrinth site details"
    )
    assert isinstance(ans_lookup, str) and "Hell Bay" in ans_lookup
    assert info_lookup["action"] == "mangrove_labyrinth_lookup"
    assert (
        info_lookup["site"]["id"]
        == "everglades-hell-bay-labyrinth-waterway"
    )

    # 3. General info action
    ans_info, info_general = format_mangrove_labyrinth_response(
        "What mandatory gear is required for sub-canopy mangroves and pneumatophore prop-root tidal labyrinth navigation?"
    )
    assert isinstance(ans_info, str) and len(ans_info) > 20
    assert info_general["action"] == "mangrove_labyrinth_info"
    assert len(info_general["sites"]) == 5
    assert len(info_general["gear_checklist"]) == 6


@pytest.mark.anyio
async def test_chat_and_stream_handlers_and_prompt():
    prompt = build_mangrove_labyrinth_prompt(
        "How do we navigate Everglades Hell Bay mangrove prop-root tunnels?"
    )
    assert "Hell Bay" in prompt or "Everglades" in prompt

    chat_res = handle_mangrove_labyrinth_intent(
        "Tell me about Everglades Hell Bay Rhizophora mangrove labyrinth"
    )
    assert chat_res is not None
    assert "mangrove_labyrinth_info" in chat_res
    assert (
        chat_res["mangrove_labyrinth_info"]["action"]
        == "mangrove_labyrinth_lookup"
    )

    assert (
        handle_mangrove_labyrinth_intent("Where is my order #12345?") is None
    )

    events = []
    async for ev in generate_mangrove_labyrinth_stream_events(
        "Calculate mangrove labyrinth navigation for prop root density 14 stems/m2, current velocity 0.6 knots, water depth 62 cm, silt sink depth 35 cm, canopy closure 88%, tide stage 3.5 hours"
    ):
        events.append(ev)
    joined = "".join(events)
    assert "event: metadata" in joined
    assert "mangrove_labyrinth_calculated" in joined
    assert "event: done" in joined


def test_mangrove_labyrinth_router_endpoints():
    # Dual prefixes: /mangrove-labyrinth and /api/mangrove-labyrinth
    for prefix in (
        "/mangrove-labyrinth",
        "/api/mangrove-labyrinth",
    ):
        res_sites = client.get(f"{prefix}/sites")
        assert res_sites.status_code == 200
        assert len(res_sites.json()) == 5

        res_filter = client.get(
            f"{prefix}/sites",
            params={"tidal_regime": "high_slack_canopy_tunnel_float"},
        )
        assert res_filter.status_code == 200
        assert len(res_filter.json()) == 2

        res_422 = client.get(
            f"{prefix}/sites",
            params={"root_morphology": "invalid_morphology_value"},
        )
        assert res_422.status_code in (400, 422)

        res_detail = client.get(
            f"{prefix}/sites/everglades-hell-bay-labyrinth-waterway"
        )
        assert res_detail.status_code == 200
        assert (
            res_detail.json()["id"]
            == "everglades-hell-bay-labyrinth-waterway"
        )

        res_404 = client.get(f"{prefix}/sites/unknown-mangrove-site")
        assert res_404.status_code == 404

        res_calc = client.post(
            f"{prefix}/calculate",
            json={
                "root_morphology": "rhizophora_arching_prop_root_tangle",
                "tidal_regime": "high_slack_canopy_tunnel_float",
                "traversal_mode": "short_hull_sit_in_creek_kayak",
                "prop_root_density_stems_m2": 14.0,
                "tidal_current_velocity_knots": 0.6,
                "water_depth_over_mud_cm": 62.0,
                "anoxic_silt_sink_depth_cm": 35.0,
                "canopy_closure_percent": 88.0,
                "tide_stage_hours_to_low": 4.2,
            },
        )
        assert res_calc.status_code == 200
        assert (
            res_calc.json()["safety_status"]
            == "nominal_high_slack_canopy_corridor"
        )

        res_calc_422 = client.post(
            f"{prefix}/calculate",
            json={
                "root_morphology": "rhizophora_arching_prop_root_tangle",
                "tidal_regime": "high_slack_canopy_tunnel_float",
                "traversal_mode": "short_hull_sit_in_creek_kayak",
                "prop_root_density_stems_m2": 0.1,
                "tidal_current_velocity_knots": 0.6,
                "water_depth_over_mud_cm": 62.0,
                "anoxic_silt_sink_depth_cm": 35.0,
                "canopy_closure_percent": 88.0,
                "tide_stage_hours_to_low": 4.2,
            },
        )
        assert res_calc_422.status_code in (400, 422)

        res_gear = client.get(f"{prefix}/gear")
        assert res_gear.status_code == 200
        assert len(res_gear.json()) == 6
