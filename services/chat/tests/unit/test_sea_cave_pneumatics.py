from typing import get_args

import pytest
from contoso_chat.beachcombing import detect_beachcombing_intent
from contoso_chat.cave_diving import detect_cave_diving_intent
from contoso_chat.caving import detect_caving_intent
from contoso_chat.chat import handle_sea_cave_pneumatics_intent
from contoso_chat.coasteering import detect_coasteering_intent
from contoso_chat.kelp_freediving import detect_kelp_freediving_intent
from contoso_chat.sea_cave_pneumatics import (
    SEA_CAVE_PNEUMATIC_GEAR_CHECKLIST,
    SEA_CAVE_PNEUMATIC_SITES,
    LittoralConduitMorphology,
    LittoralTraversalMode,
    SeaCavePneumaticSafetyStatus,
    WavePeriodRegime,
    build_sea_cave_pneumatics_prompt,
    calculate_sea_cave_pneumatic_safety,
    extract_sea_cave_pneumatics_params,
    filter_sea_cave_pneumatic_sites,
    format_sea_cave_pneumatics_response,
    get_all_sea_cave_pneumatic_sites,
    get_sea_cave_pneumatic_gear_checklist,
    get_sea_cave_pneumatic_site_by_id,
    is_sea_cave_pneumatics_query,
)
from contoso_chat.sea_kayaking import detect_sea_kayaking_intent
from contoso_chat.stream import generate_sea_cave_pneumatics_stream_events
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_sea_cave_pneumatics_literals():
    assert set(get_args(LittoralConduitMorphology)) == {
        "constricted_pneumatic_blowhole_shaft",
        "convergent_basalt_surge_slot",
        "submerged_siphon_overpressure_chamber",
        "dual_portal_littoral_through_arch",
        "boulder_choked_collapse_doline",
    }
    assert set(get_args(WavePeriodRegime)) == {
        "short_period_wind_chop_8s",
        "moderate_groundswell_12s",
        "long_period_forerunner_swell_17s",
        "infragravity_sneaker_wave_group_22s",
    }
    assert set(get_args(LittoralTraversalMode)) == {
        "sit_on_top_sea_kayak_sprint",
        "helmeted_coasteer_swim_and_scramble",
        "inflatable_rescue_sled_recon",
        "rope_belayed_rim_standoff_observation",
    }
    assert set(get_args(SeaCavePneumaticSafetyStatus)) == {
        "nominal_vented_slack_swell_window",
        "caution_acoustic_overpressure_and_rebound_surge",
        "abort_pneumatic_piston_seal_and_blowhole_eruption",
    }


def test_sea_cave_pneumatic_sites_catalog_and_lookup():
    assert len(SEA_CAVE_PNEUMATIC_SITES) == 5
    all_sites = get_all_sea_cave_pneumatic_sites()
    assert len(all_sites) == 5

    expected_ids = {
        "mendocino-devils-punchbowl-russian-gulch-siphon",
        "staffa-fingals-cave-columnar-basalt-surge-vault",
        "pictured-rocks-lovers-leap-sandstone-sea-caves",
        "kiama-bombo-headland-basalt-blowhole-slot",
        "na-pali-honopu-open-ceiling-lava-sea-cave",
    }
    assert {s["id"] for s in all_sites} == expected_ids

    mendocino = get_sea_cave_pneumatic_site_by_id(
        "mendocino-devils-punchbowl-russian-gulch-siphon"
    )
    assert mendocino is not None
    assert (
        mendocino["id"] == "mendocino-devils-punchbowl-russian-gulch-siphon"
    )
    assert mendocino["morphology"] == "boulder_choked_collapse_doline"
    assert mendocino["wave_regime"] == "long_period_forerunner_swell_17s"
    assert mendocino["traversal_mode"] == "sit_on_top_sea_kayak_sprint"
    assert mendocino["elevation"] == 0
    assert mendocino["portal_ceiling_clearance_m"] == 3.2
    assert mendocino["typical_significant_wave_height_m"] == 1.8
    assert mendocino["typical_swell_period_seconds"] == 15.0
    assert mendocino["chamber_convergence_ratio"] == 2.4
    assert mendocino["chamber_length_m"] == 62.0

    staffa = get_sea_cave_pneumatic_site_by_id(
        "staffa-fingals-cave-columnar-basalt-surge-vault"
    )
    assert staffa is not None
    assert staffa["morphology"] == "convergent_basalt_surge_slot"
    assert staffa["wave_regime"] == "moderate_groundswell_12s"
    assert staffa["traversal_mode"] == "helmeted_coasteer_swim_and_scramble"
    assert staffa["elevation"] == 0
    assert staffa["portal_ceiling_clearance_m"] == 6.5
    assert staffa["typical_significant_wave_height_m"] == 1.4
    assert staffa["typical_swell_period_seconds"] == 12.0
    assert staffa["chamber_convergence_ratio"] == 1.8
    assert staffa["chamber_length_m"] == 72.0

    pictured_rocks = get_sea_cave_pneumatic_site_by_id(
        "pictured-rocks-lovers-leap-sandstone-sea-caves"
    )
    assert pictured_rocks is not None
    assert pictured_rocks["morphology"] == "dual_portal_littoral_through_arch"
    assert pictured_rocks["wave_regime"] == "short_period_wind_chop_8s"
    assert pictured_rocks["traversal_mode"] == "sit_on_top_sea_kayak_sprint"
    assert pictured_rocks["elevation"] == 183
    assert pictured_rocks["portal_ceiling_clearance_m"] == 4.8
    assert pictured_rocks["typical_significant_wave_height_m"] == 0.7
    assert pictured_rocks["typical_swell_period_seconds"] == 8.0
    assert pictured_rocks["chamber_convergence_ratio"] == 1.3
    assert pictured_rocks["chamber_length_m"] == 38.0

    kiama = get_sea_cave_pneumatic_site_by_id(
        "kiama-bombo-headland-basalt-blowhole-slot"
    )
    assert kiama is not None
    assert kiama["morphology"] == "constricted_pneumatic_blowhole_shaft"
    assert kiama["wave_regime"] == "infragravity_sneaker_wave_group_22s"
    assert (
        kiama["traversal_mode"] == "rope_belayed_rim_standoff_observation"
    )
    assert kiama["elevation"] == 0
    assert kiama["portal_ceiling_clearance_m"] == 1.4
    assert kiama["typical_significant_wave_height_m"] == 2.8
    assert kiama["typical_swell_period_seconds"] == 18.0
    assert kiama["chamber_convergence_ratio"] == 4.1
    assert kiama["chamber_length_m"] == 54.0

    na_pali = get_sea_cave_pneumatic_site_by_id(
        "na-pali-honopu-open-ceiling-lava-sea-cave"
    )
    assert na_pali is not None
    assert na_pali["morphology"] == "submerged_siphon_overpressure_chamber"
    assert na_pali["wave_regime"] == "long_period_forerunner_swell_17s"
    assert na_pali["traversal_mode"] == "inflatable_rescue_sled_recon"
    assert na_pali["elevation"] == 0
    assert na_pali["portal_ceiling_clearance_m"] == 2.6
    assert na_pali["typical_significant_wave_height_m"] == 1.9
    assert na_pali["typical_swell_period_seconds"] == 16.0
    assert na_pali["chamber_convergence_ratio"] == 2.9
    assert na_pali["chamber_length_m"] == 85.0

    assert (
        get_sea_cave_pneumatic_site_by_id("nonexistent-sea-cave-site") is None
    )


def test_filter_sea_cave_pneumatic_sites():
    doline = filter_sea_cave_pneumatic_sites(
        morphology="boulder_choked_collapse_doline"
    )
    assert len(doline) == 1
    assert (
        doline[0]["id"] == "mendocino-devils-punchbowl-russian-gulch-siphon"
    )

    long_period = filter_sea_cave_pneumatic_sites(
        wave_regime="long_period_forerunner_swell_17s"
    )
    assert len(long_period) == 2
    assert {s["id"] for s in long_period} == {
        "mendocino-devils-punchbowl-russian-gulch-siphon",
        "na-pali-honopu-open-ceiling-lava-sea-cave",
    }

    kayak_sprint = filter_sea_cave_pneumatic_sites(
        traversal_mode="sit_on_top_sea_kayak_sprint"
    )
    assert len(kayak_sprint) == 2
    assert {s["id"] for s in kayak_sprint} == {
        "mendocino-devils-punchbowl-russian-gulch-siphon",
        "pictured-rocks-lovers-leap-sandstone-sea-caves",
    }

    combined = filter_sea_cave_pneumatic_sites(
        morphology="dual_portal_littoral_through_arch",
        wave_regime="short_period_wind_chop_8s",
        traversal_mode="sit_on_top_sea_kayak_sprint",
    )
    assert len(combined) == 1
    assert (
        combined[0]["id"] == "pictured-rocks-lovers-leap-sandstone-sea-caves"
    )

    with pytest.raises(ValueError, match="Invalid morphology"):
        filter_sea_cave_pneumatic_sites(morphology="invalid_morphology")

    with pytest.raises(ValueError, match="Invalid wave_regime"):
        filter_sea_cave_pneumatic_sites(wave_regime="invalid_wave_regime")

    with pytest.raises(ValueError, match="Invalid traversal_mode"):
        filter_sea_cave_pneumatic_sites(traversal_mode="invalid_mode")


def test_sea_cave_pneumatic_gear_checklist():
    assert len(SEA_CAVE_PNEUMATIC_GEAR_CHECKLIST) == 6
    gear = get_sea_cave_pneumatic_gear_checklist()
    assert len(gear) == 6
    assert all(item["mandatory"] is True for item in gear)

    expected_gear = {
        "ce-en1385-whitewater-and-surf-impact-helmet": "impact_and_barotrauma_armor",
        "vented-acoustic-barotrauma-surf-earplugs": "impact_and_barotrauma_armor",
        "high-flotation-quick-release-coasteering-pfd": "buoyancy_and_extraction",
        "blunt-tip-titanium-line-cutter-and-kelp-knife": "buoyancy_and_extraction",
        "dual-beam-ipx8-submersible-headlamp-and-strobe": "littoral_telemetry",
        "digital-swell-set-interval-chronograph-and-tide-table": "littoral_telemetry",
    }
    for item in gear:
        assert item["id"] in expected_gear
        assert item["category"] == expected_gear[item["id"]]


def test_calculate_sea_cave_pneumatic_safety_regimes():
    # 1. Nominal vented slack swell window
    nominal = calculate_sea_cave_pneumatic_safety(
        morphology="dual_portal_littoral_through_arch",
        wave_regime="short_period_wind_chop_8s",
        traversal_mode="sit_on_top_sea_kayak_sprint",
        portal_ceiling_clearance_m=5.5,
        significant_wave_height_m=0.6,
        swell_period_seconds=8.0,
        chamber_convergence_ratio=1.2,
        tide_height_above_mllw_m=0.2,
        chamber_length_m=35.0,
    )
    assert nominal["safety_status"] == "nominal_vented_slack_swell_window"
    assert nominal["portal_piston_seal_probability"] < 0.25
    assert nominal["pneumatic_overpressure_kpa"] < 12.0
    assert nominal["rebound_surge_velocity_ms"] < 2.2
    assert nominal["safe_set_lull_window_seconds"] >= 60.0
    assert len(nominal["swell_set_timing_protocol"]) > 20
    assert len(nominal["barotrauma_and_clapotis_advisory"]) > 20

    # 2. Caution acoustic overpressure and rebound surge
    caution = calculate_sea_cave_pneumatic_safety(
        morphology="convergent_basalt_surge_slot",
        wave_regime="moderate_groundswell_12s",
        traversal_mode="helmeted_coasteer_swim_and_scramble",
        portal_ceiling_clearance_m=3.2,
        significant_wave_height_m=1.6,
        swell_period_seconds=13.0,
        chamber_convergence_ratio=2.3,
        tide_height_above_mllw_m=1.1,
        chamber_length_m=68.0,
    )
    assert (
        caution["safety_status"]
        == "caution_acoustic_overpressure_and_rebound_surge"
    )
    assert (
        caution["portal_piston_seal_probability"]
        > nominal["portal_piston_seal_probability"]
    )
    assert (
        caution["pneumatic_overpressure_kpa"]
        > nominal["pneumatic_overpressure_kpa"]
    )
    assert (
        caution["rebound_surge_velocity_ms"]
        > nominal["rebound_surge_velocity_ms"]
    )
    assert (
        caution["safe_set_lull_window_seconds"]
        < nominal["safe_set_lull_window_seconds"]
    )

    # 3. Abort pneumatic piston seal and blowhole eruption
    abort = calculate_sea_cave_pneumatic_safety(
        morphology="constricted_pneumatic_blowhole_shaft",
        wave_regime="infragravity_sneaker_wave_group_22s",
        traversal_mode="rope_belayed_rim_standoff_observation",
        portal_ceiling_clearance_m=1.2,
        significant_wave_height_m=3.4,
        swell_period_seconds=20.0,
        chamber_convergence_ratio=4.5,
        tide_height_above_mllw_m=2.1,
        chamber_length_m=60.0,
    )
    assert (
        abort["safety_status"]
        == "abort_pneumatic_piston_seal_and_blowhole_eruption"
    )
    assert abort["portal_piston_seal_probability"] >= 0.65
    assert (
        abort["pneumatic_overpressure_kpa"]
        > caution["pneumatic_overpressure_kpa"]
    )
    assert (
        abort["rebound_surge_velocity_ms"]
        > caution["rebound_surge_velocity_ms"]
    )


@pytest.mark.parametrize(
    "invalid_kwargs",
    [
        {"portal_ceiling_clearance_m": 0.1},
        {"portal_ceiling_clearance_m": 28.0},
        {"significant_wave_height_m": 0.02},
        {"significant_wave_height_m": 15.0},
        {"swell_period_seconds": 2.5},
        {"swell_period_seconds": 32.0},
        {"chamber_convergence_ratio": 0.8},
        {"chamber_convergence_ratio": 7.5},
        {"tide_height_above_mllw_m": -2.0},
        {"tide_height_above_mllw_m": 6.0},
        {"chamber_length_m": 2.0},
        {"chamber_length_m": 280.0},
        {"morphology": "invalid_conduit_morphology"},
        {"wave_regime": "invalid_wave_regime"},
        {"traversal_mode": "invalid_traversal_mode"},
    ],
)
def test_calculate_sea_cave_pneumatic_validation_errors(invalid_kwargs):
    base_kwargs = {
        "portal_ceiling_clearance_m": 3.2,
        "significant_wave_height_m": 1.5,
        "swell_period_seconds": 12.0,
        "chamber_convergence_ratio": 2.0,
        "tide_height_above_mllw_m": 0.8,
        "chamber_length_m": 55.0,
    }
    base_kwargs.update(invalid_kwargs)
    with pytest.raises(ValueError):
        calculate_sea_cave_pneumatic_safety(**base_kwargs)


def test_is_sea_cave_pneumatics_query_and_disambiguation():
    # Positive queries
    assert (
        is_sea_cave_pneumatics_query(
            "How do we time swell sets at Mendocino Devil's Punchbowl Russian Gulch sea cave siphon?"
        )
        is True
    )
    assert (
        is_sea_cave_pneumatics_query(
            "Calculate pneumatic wave overpressure and blowhole eruption risk at Kiama headland"
        )
        is True
    )
    assert (
        is_sea_cave_pneumatics_query(
            "Fingal's Cave Staffa columnar basalt surge channel and clapotis wave reflection"
        )
        is True
    )
    assert (
        is_sea_cave_pneumatics_query(
            "Pictured Rocks Lover's Leap littoral cave dual portal arch kayak sprint"
        )
        is True
    )
    assert (
        is_sea_cave_pneumatics_query(
            "Na Pali Honopu sea-cave submerged siphon air compression blast hazard"
        )
        is True
    )
    assert (
        is_sea_cave_pneumatics_query(
            "What barotrauma earplugs and helmet are required for sea cave blowhole surge channels?"
        )
        is True
    )

    # Negative queries
    assert is_sea_cave_pneumatics_query("") is False
    assert is_sea_cave_pneumatics_query("   ") is False
    assert is_sea_cave_pneumatics_query("Track my order #98765") is False
    assert (
        is_sea_cave_pneumatics_query("I want a refund for my sleeping bag")
        is False
    )
    assert (
        is_sea_cave_pneumatics_query(
            "What is the best mountain bike for desert singletrack?"
        )
        is False
    )

    # Cross-domain disambiguation: adjacent modules must ignore blowhole / sea cave / sea-cave / surge channel / pneumatic wave / clapotis / fingal / devils punchbowl / air compression blast / littoral cave queries
    disambig_queries = [
        "Coasteering jump vs sea cave pneumatic wave and surge channel clapotis at Fingal's Cave",
        "Sea kayaking paddle trip through Mendocino Devils Punchbowl sea-cave and blowhole",
        "Karst caving headlamp vs littoral cave air compression blast and surge channel",
        "Cave diving guideline vs sea cave submerged siphon and pneumatic wave overpressure",
        "Kelp freediving holdfast vs sea-cave surge channel and blowhole clapotis",
        "Intertidal beachcombing tide pool vs coastal blowhole and littoral cave surge channel",
    ]
    for q in disambig_queries:
        assert is_sea_cave_pneumatics_query(q) is True
        assert detect_coasteering_intent(q) is None
        assert detect_sea_kayaking_intent(q) is None
        assert detect_caving_intent(q) is None
        assert detect_cave_diving_intent(q) is None
        assert detect_kelp_freediving_intent(q) is False
        assert detect_beachcombing_intent(q) is None


def test_extract_sea_cave_pneumatics_params():
    q = (
        "Calculate sea cave pneumatic safety at Kiama blowhole with portal clearance 1.4 m, "
        "wave height 2.8 m, swell period 18 s, convergence ratio 4.1, tide 1.6 m, chamber length 54 m"
    )
    params = extract_sea_cave_pneumatics_params(q)
    assert params["site_id"] == "kiama-bombo-headland-basalt-blowhole-slot"
    assert params["portal_ceiling_clearance_m"] == 1.4
    assert params["significant_wave_height_m"] == 2.8
    assert params["swell_period_seconds"] == 18.0
    assert params["chamber_convergence_ratio"] == 4.1
    assert params["tide_height_above_mllw_m"] == 1.6
    assert params["chamber_length_m"] == 54.0
    assert params["is_calculation"] is True


def test_format_sea_cave_pneumatics_response_actions():
    # 1. Calculated action
    ans_calc, info_calc = format_sea_cave_pneumatics_response(
        "Calculate sea cave pneumatic wave hazard for portal clearance 3.2 m, wave height 1.8 m, swell period 15 s, convergence ratio 2.4, tide 0.8 m, chamber length 62 m"
    )
    assert isinstance(ans_calc, str) and len(ans_calc) > 20
    assert info_calc["action"] == "sea_cave_pneumatics_calculated"
    assert "portal_piston_seal_probability" in info_calc
    assert "pneumatic_overpressure_kpa" in info_calc
    assert "safety_status" in info_calc

    # 2. Lookup action
    ans_lookup, info_lookup = format_sea_cave_pneumatics_response(
        "Tell me about Mendocino Devils Punchbowl Russian Gulch sea cave site details"
    )
    assert isinstance(ans_lookup, str) and "Punchbowl" in ans_lookup
    assert info_lookup["action"] == "sea_cave_pneumatics_lookup"
    assert (
        info_lookup["site"]["id"]
        == "mendocino-devils-punchbowl-russian-gulch-siphon"
    )

    # 3. General info action
    ans_info, info_general = format_sea_cave_pneumatics_response(
        "What mandatory gear is required for coastal blowhole, surge channel, and sea-cave pneumatic navigation?"
    )
    assert isinstance(ans_info, str) and len(ans_info) > 20
    assert info_general["action"] == "sea_cave_pneumatics_info"
    assert len(info_general["sites"]) == 5
    assert len(info_general["gear_checklist"]) == 6


@pytest.mark.anyio
async def test_chat_and_stream_handlers_and_prompt():
    prompt = build_sea_cave_pneumatics_prompt(
        "How do we navigate Fingal's Cave basalt surge slot on Staffa?"
    )
    assert "Staffa" in prompt or "Fingal" in prompt

    chat_res = handle_sea_cave_pneumatics_intent(
        "Tell me about Mendocino Devils Punchbowl Russian Gulch sea cave"
    )
    assert chat_res is not None
    assert "sea_cave_pneumatics_info" in chat_res
    assert (
        chat_res["sea_cave_pneumatics_info"]["action"]
        == "sea_cave_pneumatics_lookup"
    )

    assert (
        handle_sea_cave_pneumatics_intent("Where is my order #12345?") is None
    )

    events = []
    async for ev in generate_sea_cave_pneumatics_stream_events(
        "Calculate sea cave pneumatic safety for portal clearance 3.2 m, wave height 1.8 m, swell period 15 s, convergence ratio 2.4, tide 0.8 m, chamber length 62 m"
    ):
        events.append(ev)
    joined = "".join(events)
    assert "event: metadata" in joined
    assert "sea_cave_pneumatics_calculated" in joined
    assert "event: done" in joined


def test_sea_cave_pneumatics_router_endpoints():
    # Dual prefixes: /sea-cave-pneumatics and /api/sea-cave-pneumatics
    for prefix in (
        "/sea-cave-pneumatics",
        "/api/sea-cave-pneumatics",
    ):
        res_sites = client.get(f"{prefix}/sites")
        assert res_sites.status_code == 200
        assert len(res_sites.json()) == 5

        res_filter = client.get(
            f"{prefix}/sites",
            params={"wave_regime": "long_period_forerunner_swell_17s"},
        )
        assert res_filter.status_code == 200
        assert len(res_filter.json()) == 2

        res_422 = client.get(
            f"{prefix}/sites",
            params={"morphology": "invalid_morphology_value"},
        )
        assert res_422.status_code in (400, 422)

        res_detail = client.get(
            f"{prefix}/sites/mendocino-devils-punchbowl-russian-gulch-siphon"
        )
        assert res_detail.status_code == 200
        assert (
            res_detail.json()["id"]
            == "mendocino-devils-punchbowl-russian-gulch-siphon"
        )

        res_404 = client.get(f"{prefix}/sites/unknown-sea-cave-site")
        assert res_404.status_code == 404

        res_calc = client.post(
            f"{prefix}/calculate",
            json={
                "morphology": "dual_portal_littoral_through_arch",
                "wave_regime": "short_period_wind_chop_8s",
                "traversal_mode": "sit_on_top_sea_kayak_sprint",
                "portal_ceiling_clearance_m": 5.2,
                "significant_wave_height_m": 0.6,
                "swell_period_seconds": 8.0,
                "chamber_convergence_ratio": 1.2,
                "tide_height_above_mllw_m": 0.2,
                "chamber_length_m": 38.0,
            },
        )
        assert res_calc.status_code == 200
        assert (
            res_calc.json()["safety_status"]
            == "nominal_vented_slack_swell_window"
        )

        res_calc_422 = client.post(
            f"{prefix}/calculate",
            json={
                "morphology": "dual_portal_littoral_through_arch",
                "wave_regime": "short_period_wind_chop_8s",
                "traversal_mode": "sit_on_top_sea_kayak_sprint",
                "portal_ceiling_clearance_m": 0.05,
                "significant_wave_height_m": 0.6,
                "swell_period_seconds": 8.0,
                "chamber_convergence_ratio": 1.2,
                "tide_height_above_mllw_m": 0.2,
                "chamber_length_m": 38.0,
            },
        )
        assert res_calc_422.status_code in (400, 422)

        res_gear = client.get(f"{prefix}/gear")
        assert res_gear.status_code == 200
        assert len(res_gear.json()) == 6
