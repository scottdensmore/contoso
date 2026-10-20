"""Unit tests for the Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation Guide."""

import pytest
from contoso_chat.canopy_bryophyte import detect_canopy_bryophyte_intent
from contoso_chat.canyon_bouldering import detect_canyon_bouldering_intent
from contoso_chat.cave_mineralogy import detect_cave_mineralogy_intent
from contoso_chat.caving import detect_caving_intent
from contoso_chat.cryokarst_speleology import detect_cryokarst_speleology_intent
from contoso_chat.glaciere_caving import is_glaciere_caving_query
from contoso_chat.ice_climbing import detect_ice_climbing_intent
from contoso_chat.mountaineering import detect_mountaineering_intent
from contoso_chat.rock_glacier_navigation import is_rock_glacier_navigation_query
from contoso_chat.scree_running import detect_scree_running_intent
from contoso_chat.talus_cold_trap import (
    TALUS_COLD_TRAP_GEAR_CHECKLIST,
    TALUS_COLD_TRAP_SITES,
    TALUS_SITES,
    build_talus_cold_trap_prompt,
    calculate_talus_cold_trap,
    detect_talus_cold_trap_intent,
    extract_talus_cold_trap_params,
    filter_sites,
    format_talus_cold_trap_response,
    generate_stream_events,
    get_all_sites,
    get_all_talus_cold_trap_sites,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    get_talus_cold_trap_site_by_id,
    is_talus_cold_trap_query,
)
from contoso_chat.tundra_lichen import detect_tundra_lichen_intent


class TestTalusColdTrapCatalog:
    """Tests for the subalpine boulder-talus air-draft ice cave & cold-trap block-field catalog and lookup functions."""

    def test_catalog_has_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(TALUS_COLD_TRAP_SITES) == 4
        assert len(TALUS_SITES) == 4
        assert len(get_all_talus_cold_trap_sites()) == 4

    def test_expected_site_ids_present(self) -> None:
        site_ids = {s["id"] for s in get_all_sites()}
        expected = {
            "king-ravine-mahosuc-notch-white-mountains-nh",
            "indian-pass-avalanche-pass-adirondacks-ny",
            "driftless-algific-talus-slopes-iowa",
            "kamenec-crevice-ice-talus-bohemia-czechia",
        }
        assert site_ids == expected

    def test_site_required_fields_and_attr_access(self) -> None:
        required_keys = {
            "id",
            "name",
            "country",
            "region",
            "elevation_range",
            "max_elevation_m",
            "regime",
            "difficulty",
            "default_ambient_air_temp_c",
            "default_crevice_void_depth_m",
            "default_moss_humus_masking_pct",
            "default_boulder_block_span_m",
            "default_cold_draft_velocity_ms",
            "primary_hazard",
            "navigation_strategy",
            "navigation_protocol",
            "conservation_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_keys.issubset(site.keys())
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.regime == site["regime"]

    def test_get_site_by_id_exact_and_fuzzy(self) -> None:
        king_ravine = get_site_by_id("king-ravine-mahosuc-notch-white-mountains-nh")
        assert king_ravine is not None
        assert king_ravine["country"] == "USA"
        assert king_ravine["regime"] == "balch-chimney-megaboulder-gorge"
        assert king_ravine["difficulty"] == "extreme"

        indian_pass = get_talus_cold_trap_site_by_id("indian pass")
        assert indian_pass is not None
        assert indian_pass["id"] == "indian-pass-avalanche-pass-adirondacks-ny"
        assert indian_pass["country"] == "USA"
        assert indian_pass["regime"] == "anorthosite-pseudokarst-ice-chasm"
        assert indian_pass["difficulty"] == "challenging"

        driftless = get_site_by_id("algific")
        assert driftless is not None
        assert driftless["id"] == "driftless-algific-talus-slopes-iowa"
        assert driftless["country"] == "USA"
        assert driftless["regime"] == "algific-dolomite-cold-vent-slope"
        assert driftless["difficulty"] == "moderate"

        kamenec = get_site_by_id("kamenec")
        assert kamenec is not None
        assert kamenec["id"] == "kamenec-crevice-ice-talus-bohemia-czechia"
        assert kamenec["country"] == "Czech Republic"
        assert kamenec["regime"] == "periglacial-block-stream-felsenmeer"
        assert kamenec["difficulty"] == "challenging"

    def test_get_site_by_id_unknown_returns_none(self) -> None:
        assert get_site_by_id("nonexistent-talus-cold-trap-site") is None
        assert get_site_by_id("") is None

    def test_filter_sites_by_country_regime_difficulty_and_search(self) -> None:
        usa_sites = filter_sites(country="USA")
        assert len(usa_sites) == 3

        cz_sites = filter_sites(country="Czech Republic")
        assert len(cz_sites) == 1
        assert cz_sites[0]["id"] == "kamenec-crevice-ice-talus-bohemia-czechia"

        regime_sites = filter_sites(regime="algific-dolomite-cold-vent-slope")
        assert len(regime_sites) == 1
        assert regime_sites[0]["id"] == "driftless-algific-talus-slopes-iowa"

        extreme_sites = filter_sites(difficulty="extreme")
        assert len(extreme_sites) == 1
        assert extreme_sites[0]["id"] == "king-ravine-mahosuc-notch-white-mountains-nh"

        search_sites = filter_sites(search="Mahoosuc")
        assert len(search_sites) == 1
        assert search_sites[0]["id"] == "king-ravine-mahosuc-notch-white-mountains-nh"

    def test_gear_checklist_has_six_essential_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(TALUS_COLD_TRAP_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert item["priority"] == "essential"
            assert "item" in item
            assert "category" in item
            assert "rationale" in item


class TestTalusColdTrapCalculator:
    """Tests for the deterministic calculate_talus_cold_trap engine."""

    def test_default_calculation_returns_expected_keys(self) -> None:
        res = calculate_talus_cold_trap(
            ambient_air_temp_c=20.0,
            crevice_void_depth_m=10.0,
            moss_humus_masking_pct=65.0,
            boulder_block_span_m=3.2,
            cold_draft_velocity_ms=2.4,
        )
        expected_keys = {
            "ambient_air_temp_c",
            "crevice_void_depth_m",
            "moss_humus_masking_pct",
            "boulder_block_span_m",
            "cold_draft_velocity_ms",
            "verglas_glaze_slip_probability_pct",
            "moss_bridge_collapse_risk_pct",
            "void_hypothermia_cooling_rate_c_per_hr",
            "radon_co2_pocket_accumulation_index",
            "risk_level",
            "safety_status",
            "navigation_strategy",
            "warnings",
            "recommendations",
        }
        assert expected_keys.issubset(res.keys())
        assert res["risk_level"] in {"low", "moderate", "high", "critical"}
        assert res["safety_status"] == res["risk_level"]
        assert isinstance(res["warnings"], list)
        assert isinstance(res["recommendations"], list)
        assert len(res["recommendations"]) >= 2

    def test_low_risk_shallow_well_ventilated_talus_conditions(self) -> None:
        res = calculate_talus_cold_trap(
            ambient_air_temp_c=4.0,
            crevice_void_depth_m=2.0,
            moss_humus_masking_pct=10.0,
            boulder_block_span_m=1.0,
            cold_draft_velocity_ms=0.8,
        )
        assert res["risk_level"] == "low"
        assert res["verglas_glaze_slip_probability_pct"] < 25.0
        assert res["moss_bridge_collapse_risk_pct"] < 25.0
        assert res["void_hypothermia_cooling_rate_c_per_hr"] < 1.2
        assert res["radon_co2_pocket_accumulation_index"] < 35.0

    def test_critical_risk_deep_megatalus_void_with_dense_moss_masking(self) -> None:
        res = calculate_talus_cold_trap(
            ambient_air_temp_c=32.0,
            crevice_void_depth_m=28.0,
            moss_humus_masking_pct=92.0,
            boulder_block_span_m=8.5,
            cold_draft_velocity_ms=6.2,
        )
        assert res["risk_level"] == "critical"
        assert res["verglas_glaze_slip_probability_pct"] >= 75.0
        assert res["moss_bridge_collapse_risk_pct"] >= 75.0
        assert res["void_hypothermia_cooling_rate_c_per_hr"] >= 2.5
        assert len(res["warnings"]) >= 3

    def test_monotonicity_across_inputs(self) -> None:
        mild = calculate_talus_cold_trap(
            ambient_air_temp_c=6.0,
            crevice_void_depth_m=3.0,
            moss_humus_masking_pct=15.0,
            boulder_block_span_m=1.2,
            cold_draft_velocity_ms=1.0,
        )
        severe = calculate_talus_cold_trap(
            ambient_air_temp_c=30.0,
            crevice_void_depth_m=24.0,
            moss_humus_masking_pct=88.0,
            boulder_block_span_m=7.5,
            cold_draft_velocity_ms=5.8,
        )
        assert (
            severe["verglas_glaze_slip_probability_pct"]
            > mild["verglas_glaze_slip_probability_pct"]
        )
        assert (
            severe["moss_bridge_collapse_risk_pct"]
            > mild["moss_bridge_collapse_risk_pct"]
        )
        assert (
            severe["void_hypothermia_cooling_rate_c_per_hr"]
            > mild["void_hypothermia_cooling_rate_c_per_hr"]
        )

        # Lower draft velocity in a deep void increases radon/CO2 stagnation pocket accumulation
        ventilated_deep = calculate_talus_cold_trap(
            ambient_air_temp_c=22.0,
            crevice_void_depth_m=25.0,
            moss_humus_masking_pct=70.0,
            boulder_block_span_m=5.0,
            cold_draft_velocity_ms=6.5,
        )
        stagnant_deep = calculate_talus_cold_trap(
            ambient_air_temp_c=22.0,
            crevice_void_depth_m=25.0,
            moss_humus_masking_pct=70.0,
            boulder_block_span_m=5.0,
            cold_draft_velocity_ms=0.3,
        )
        assert (
            stagnant_deep["radon_co2_pocket_accumulation_index"]
            > ventilated_deep["radon_co2_pocket_accumulation_index"]
        )

    @pytest.mark.parametrize(
        "kwargs,expected_field",
        [
            ({"ambient_air_temp_c": -12.0}, "ambient_air_temp_c"),
            ({"ambient_air_temp_c": 42.0}, "ambient_air_temp_c"),
            ({"crevice_void_depth_m": 0.5}, "crevice_void_depth_m"),
            ({"crevice_void_depth_m": 40.0}, "crevice_void_depth_m"),
            ({"moss_humus_masking_pct": -5.0}, "moss_humus_masking_pct"),
            ({"moss_humus_masking_pct": 105.0}, "moss_humus_masking_pct"),
            ({"boulder_block_span_m": 0.2}, "boulder_block_span_m"),
            ({"boulder_block_span_m": 15.0}, "boulder_block_span_m"),
            ({"cold_draft_velocity_ms": 0.02}, "cold_draft_velocity_ms"),
            ({"cold_draft_velocity_ms": 10.0}, "cold_draft_velocity_ms"),
        ],
    )
    def test_validation_bounds_raise_value_error(
        self, kwargs: dict[str, float], expected_field: str
    ) -> None:
        base = {
            "ambient_air_temp_c": 20.0,
            "crevice_void_depth_m": 10.0,
            "moss_humus_masking_pct": 65.0,
            "boulder_block_span_m": 3.2,
            "cold_draft_velocity_ms": 2.4,
        }
        base.update(kwargs)
        with pytest.raises(ValueError, match=expected_field):
            calculate_talus_cold_trap(**base)


class TestTalusColdTrapIntentAndFormatting:
    """Tests for intent detection, parameter extraction, response formatting, and disambiguation."""

    def test_positive_intent_detection(self) -> None:
        queries = [
            "How do we navigate the King Ravine Subway and Mahoosuc Notch Balch-ice megatalus in New Hampshire?",
            "Assess moss bridge collapse risk on Indian Pass and Avalanche Pass anorthosite pseudokarst talus ice chasms.",
            "What conservation protocols apply to Driftless Area algific talus cold-air vent slopes in Iowa?",
            "How do we traverse Kamenec crevice ice talus and phonolite felsenmeer cold-trap block-field in Bohemia?",
            "Calculate talus cold trap hazard with ambient air temp 26 C, crevice void depth 16 m, and moss humus masking 78%.",
        ]
        for q in queries:
            assert is_talus_cold_trap_query(q), f"Expected positive intent for: {q}"
            assert detect_talus_cold_trap_intent(q), f"Expected positive intent for: {q}"

    def test_negative_intent_and_cross_domain_disambiguation(self) -> None:
        non_matching = [
            "What boots do you recommend for hiking?",
            "Where is my order #12345?",
            "Navigate subterranean glacière cave at Eisriesenwelt with 12-point crampons",
            "Bandera ice cave static cold-trap lava tube Balch effect navigation",
            "How do we cross the Sourdough Peak McCarthy Creek lobate rock glacier?",
            "Wheeler Peak quartzite blockfield felsenmeer interstitial ice matrix navigation",
            "How do I execute a heel plunge scree descent on Mount Sneffels?",
            "Calculate highball impact energy and spotter requirements for Buttermilks Peabody boulders",
            "Tell me about Matanuska glacier moulin cryokarst shaft",
        ]
        for q in non_matching:
            assert not is_talus_cold_trap_query(q), f"Expected negative intent for: {q}"

        # Verify adjacent glaciere/rock_glacier/scree/bouldering/caving/bryophyte domains do not hijack talus_cold_trap queries
        talus_queries = [
            "How do we navigate King Ravine Subway and Mahoosuc Notch Balch-ice megatalus cold-trap block-field?",
            "Calculate talus cold trap risk at Indian Pass anorthosite pseudokarst talus ice chasms with crevice void depth 14 m",
            "Traversing Driftless Area algific talus slopes without collapsing fragile moss bridges over cold-air vents",
            "Evaluate Kamenec crevice ice talus and Naděje phonolite cold-trap block-field in Czechia",
        ]
        for tq in talus_queries:
            assert is_talus_cold_trap_query(tq) is True
            assert is_glaciere_caving_query(tq) is False
            assert is_rock_glacier_navigation_query(tq) is False
            assert detect_scree_running_intent(tq) is False
            assert detect_canyon_bouldering_intent(tq) is None
            assert detect_caving_intent(tq) is None
            assert detect_cave_mineralogy_intent(tq) is None
            assert detect_cryokarst_speleology_intent(tq) is False
            assert detect_ice_climbing_intent(tq) is None
            assert detect_mountaineering_intent(tq) is None
            assert detect_tundra_lichen_intent(tq) is False
            assert detect_canopy_bryophyte_intent(tq) is False

    def test_extract_params_from_natural_language(self) -> None:
        query = (
            "Calculate talus cold trap risk for Mahoosuc Notch with ambient air temp 25 C, "
            "crevice void depth 16.5 m, moss humus masking 78%, boulder block span 5.2 m, "
            "and cold draft velocity 4.1 m/s."
        )
        params = extract_talus_cold_trap_params(query)
        assert params["site_id"] == "king-ravine-mahosuc-notch-white-mountains-nh"
        assert params["ambient_air_temp_c"] == 25.0
        assert params["crevice_void_depth_m"] == 16.5
        assert params["moss_humus_masking_pct"] == 78.0
        assert params["boulder_block_span_m"] == 5.2
        assert params["cold_draft_velocity_ms"] == 4.1
        assert params["has_calc_params"] is True

    def test_format_response_actions_and_prompt_builder(self) -> None:
        calc_info: dict[str, object] = format_talus_cold_trap_response(
            "Calculate talus cold trap risk with ambient air temp 24 C, crevice void depth 15 m, and moss humus masking 75%"
        )
        assert calc_info["action"] == "talus_cold_trap_calculated"
        assert calc_info["calculation"] is not None

        lookup_info: dict[str, object] = format_talus_cold_trap_response(
            "Tell me about Indian Pass and Avalanche Pass anorthosite talus ice chasms in the Adirondacks"
        )
        assert lookup_info["action"] == "talus_cold_trap_lookup"
        matched = lookup_info["matched_sites"]
        assert isinstance(matched, list)
        assert len(matched) == 1
        assert matched[0]["id"] == "indian-pass-avalanche-pass-adirondacks-ny"

        general_info: dict[str, object] = format_talus_cold_trap_response(
            "Give me an overview of subalpine boulder-talus air-draft ice cave and cold-trap block-field navigation"
        )
        assert general_info["action"] == "talus_cold_trap_info"
        sites_list = general_info["sites"]
        assert isinstance(sites_list, list)
        assert len(sites_list) == 4

        prompt = build_talus_cold_trap_prompt(calc_info)
        assert "TALUS" in prompt.upper()
        assert "COLD-TRAP" in prompt.upper() or "BALCH" in prompt.upper()

    def test_chat_and_stream_helpers(self) -> None:
        chat_res = get_chat_response(
            "How do we traverse Mahoosuc Notch megatalus with ambient air temp 23 C and crevice void depth 15 m?"
        )
        assert "answer" in chat_res
        assert "talus_cold_trap_info" in chat_res
        assert chat_res["talus_cold_trap_info"]["action"] == "talus_cold_trap_calculated"

        events = list(
            generate_stream_events(
                "Tell me about Kamenec and Naděje pseudokarst phonolite cold-trap block-field in Czechia"
            )
        )
        assert len(events) >= 3
        assert events[0]["talus_cold_trap_info"]["action"] == "talus_cold_trap_lookup"
