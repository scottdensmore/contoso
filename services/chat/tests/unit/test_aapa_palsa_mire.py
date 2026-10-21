"""Unit tests for the Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Crossing Guide."""

import pytest
from contoso_chat.aapa_palsa_mire import (
    AAPA_PALSA_MIRE_GEAR_CHECKLIST,
    AAPA_PALSA_MIRE_SITES,
    AAPA_SITES,
    build_aapa_palsa_mire_prompt,
    calculate_aapa_palsa_mire,
    detect_aapa_palsa_mire_intent,
    extract_aapa_palsa_mire_params,
    filter_sites,
    format_aapa_palsa_mire_response,
    generate_stream_events,
    get_aapa_palsa_mire_site_by_id,
    get_all_aapa_palsa_mire_sites,
    get_all_sites,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    is_aapa_palsa_mire_query,
)
from contoso_chat.aufeis_crossing import is_aufeis_crossing_query
from contoso_chat.bog_shoeing import detect_bog_shoeing_intent
from contoso_chat.foraging import detect_foraging_intent
from contoso_chat.mudflat_trekking import detect_mudflat_intent
from contoso_chat.nordic_skiing import detect_nordic_skiing_intent
from contoso_chat.orienteering import extract_orienteering_intent
from contoso_chat.paramo_navigation import is_paramo_navigation_query
from contoso_chat.snowshoe_mountaineering import detect_snowshoe_intent
from contoso_chat.thermokarst_tundra import is_thermokarst_tundra_query
from contoso_chat.tundra_lichen import detect_tundra_lichen_intent
from contoso_chat.tussock_headland import is_tussock_headland_query


class TestAapaPalsaMireCatalog:
    """Tests for the boreal string-bog (aapa mire) flark-pool & palsa permafrost-mound catalog and lookup functions."""

    def test_catalog_has_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(AAPA_PALSA_MIRE_SITES) == 4
        assert len(AAPA_SITES) == 4
        assert len(get_all_aapa_palsa_mire_sites()) == 4

    def test_expected_site_ids_present(self) -> None:
        site_ids = {s["id"] for s in get_all_sites()}
        expected = {
            "voda-viiankiaapa-sodankyla-lapland-finland",
            "tavvavuoma-kummavuopio-palsa-norrbotten-sweden",
            "hudson-bay-lowlands-sutton-ridges-ontario-canada",
            "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
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
            "morphology",
            "regime",
            "difficulty",
            "default_strang_width_m",
            "default_flark_trough_span_m",
            "default_active_thaw_depth_cm",
            "default_palsa_rim_fissure_score",
            "default_hiker_pack_weight_kg",
            "primary_hazard",
            "crossing_strategy",
            "navigation_strategy",
            "navigation_protocol",
            "conservation_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_keys.issubset(site.keys())
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.morphology == site["morphology"]

    def test_get_site_by_id_exact_and_fuzzy(self) -> None:
        viiankiaapa = get_site_by_id("voda-viiankiaapa-sodankyla-lapland-finland")
        assert viiankiaapa is not None
        assert viiankiaapa["country"] == "Finland"
        assert viiankiaapa["morphology"] == "concentric-strang-flark-aapa"
        assert viiankiaapa["difficulty"] == "challenging"

        tavvavuoma = get_aapa_palsa_mire_site_by_id("tavvavuoma")
        assert tavvavuoma is not None
        assert tavvavuoma["id"] == "tavvavuoma-kummavuopio-palsa-norrbotten-sweden"
        assert tavvavuoma["country"] == "Sweden"
        assert tavvavuoma["morphology"] == "ice-cored-palsa-dome-plateau"
        assert tavvavuoma["difficulty"] == "extreme"

        hudson = get_site_by_id("hudson bay lowlands")
        assert hudson is not None
        assert hudson["id"] == "hudson-bay-lowlands-sutton-ridges-ontario-canada"
        assert hudson["country"] == "Canada"
        assert hudson["morphology"] == "thermokarst-lagg-moat-collapse"
        assert hudson["difficulty"] == "extreme"

        pasvik = get_site_by_id("pasvik")
        assert pasvik is not None
        assert pasvik["id"] == "pasvik-iettiselga-injarvi-palsa-finnmark-norway"
        assert pasvik["country"] == "Norway"
        assert pasvik["morphology"] == "minerotrophic-sedge-carpet-fen"
        assert pasvik["difficulty"] == "moderate"

    def test_get_site_by_id_unknown_returns_none(self) -> None:
        assert get_site_by_id("nonexistent-aapa-palsa-mire-site") is None
        assert get_site_by_id("") is None

    def test_filter_sites_by_country_morphology_difficulty_and_search(self) -> None:
        finland_sites = filter_sites(country="Finland")
        assert len(finland_sites) == 1
        assert finland_sites[0]["id"] == "voda-viiankiaapa-sodankyla-lapland-finland"

        sweden_sites = filter_sites(country="Sweden")
        assert len(sweden_sites) == 1
        assert sweden_sites[0]["id"] == "tavvavuoma-kummavuopio-palsa-norrbotten-sweden"

        morph_sites = filter_sites(morphology="thermokarst-lagg-moat-collapse")
        assert len(morph_sites) == 1
        assert morph_sites[0]["id"] == "hudson-bay-lowlands-sutton-ridges-ontario-canada"

        extreme_sites = filter_sites(difficulty="extreme")
        assert len(extreme_sites) == 2

        search_sites = filter_sites(search="Viiankiaapa")
        assert len(search_sites) == 1
        assert search_sites[0]["id"] == "voda-viiankiaapa-sodankyla-lapland-finland"

    def test_gear_checklist_has_six_essential_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(AAPA_PALSA_MIRE_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert item["priority"] == "essential"
            assert "item" in item
            assert "category" in item
            assert "rationale" in item


class TestAapaPalsaMireCalculator:
    """Tests for the deterministic calculate_aapa_palsa_mire engine."""

    def test_default_calculation_returns_expected_keys(self) -> None:
        res = calculate_aapa_palsa_mire(
            strang_width_m=1.6,
            flark_trough_span_m=14.0,
            active_thaw_depth_cm=55.0,
            palsa_rim_fissure_score=40.0,
            hiker_pack_weight_kg=22.0,
        )
        expected_keys = {
            "strang_width_m",
            "flark_trough_span_m",
            "active_thaw_depth_cm",
            "palsa_rim_fissure_score",
            "hiker_pack_weight_kg",
            "strang_shear_breakthrough_risk_pct",
            "palsa_lagg_moat_entrapment_pct",
            "flark_detour_distance_multiplier",
            "blackfly_mosquito_swarm_stress_index",
            "risk_level",
            "safety_status",
            "crossing_strategy",
            "navigation_strategy",
            "warnings",
            "recommendations",
        }
        assert expected_keys.issubset(res.keys())
        assert res["risk_level"] in {"low", "moderate", "high", "critical"}
        assert res["safety_status"] == res["risk_level"]
        assert res["navigation_strategy"] == res["crossing_strategy"]
        assert isinstance(res["warnings"], list)
        assert isinstance(res["recommendations"], list)
        assert len(res["recommendations"]) >= 2

    def test_low_risk_wide_strang_ridge_shallow_thaw_conditions(self) -> None:
        res = calculate_aapa_palsa_mire(
            strang_width_m=5.0,
            flark_trough_span_m=3.0,
            active_thaw_depth_cm=22.0,
            palsa_rim_fissure_score=8.0,
            hiker_pack_weight_kg=9.0,
        )
        assert res["risk_level"] == "low"
        assert res["strang_shear_breakthrough_risk_pct"] < 25.0
        assert res["palsa_lagg_moat_entrapment_pct"] < 25.0
        assert res["flark_detour_distance_multiplier"] < 1.5
        assert res["blackfly_mosquito_swarm_stress_index"] < 38.0

    def test_critical_risk_narrow_strang_deep_thaw_collapsed_palsa_moat(self) -> None:
        res = calculate_aapa_palsa_mire(
            strang_width_m=0.45,
            flark_trough_span_m=52.0,
            active_thaw_depth_cm=125.0,
            palsa_rim_fissure_score=92.0,
            hiker_pack_weight_kg=44.0,
        )
        assert res["risk_level"] == "critical"
        assert res["strang_shear_breakthrough_risk_pct"] >= 75.0
        assert res["palsa_lagg_moat_entrapment_pct"] >= 75.0
        assert res["flark_detour_distance_multiplier"] >= 2.5
        assert res["blackfly_mosquito_swarm_stress_index"] >= 75.0
        assert len(res["warnings"]) >= 3

    def test_monotonicity_across_inputs(self) -> None:
        benign = calculate_aapa_palsa_mire(
            strang_width_m=4.5,
            flark_trough_span_m=4.0,
            active_thaw_depth_cm=25.0,
            palsa_rim_fissure_score=12.0,
            hiker_pack_weight_kg=10.0,
        )
        severe = calculate_aapa_palsa_mire(
            strang_width_m=0.5,
            flark_trough_span_m=48.0,
            active_thaw_depth_cm=120.0,
            palsa_rim_fissure_score=88.0,
            hiker_pack_weight_kg=42.0,
        )
        assert (
            severe["strang_shear_breakthrough_risk_pct"]
            > benign["strang_shear_breakthrough_risk_pct"]
        )
        assert (
            severe["palsa_lagg_moat_entrapment_pct"]
            > benign["palsa_lagg_moat_entrapment_pct"]
        )
        assert (
            severe["flark_detour_distance_multiplier"]
            > benign["flark_detour_distance_multiplier"]
        )
        assert (
            severe["blackfly_mosquito_swarm_stress_index"]
            > benign["blackfly_mosquito_swarm_stress_index"]
        )

    @pytest.mark.parametrize(
        "kwargs,expected_field",
        [
            ({"strang_width_m": 0.1}, "strang_width_m"),
            ({"strang_width_m": 7.5}, "strang_width_m"),
            ({"flark_trough_span_m": 0.4}, "flark_trough_span_m"),
            ({"flark_trough_span_m": 75.0}, "flark_trough_span_m"),
            ({"active_thaw_depth_cm": 8.0}, "active_thaw_depth_cm"),
            ({"active_thaw_depth_cm": 155.0}, "active_thaw_depth_cm"),
            ({"palsa_rim_fissure_score": -5.0}, "palsa_rim_fissure_score"),
            ({"palsa_rim_fissure_score": 108.0}, "palsa_rim_fissure_score"),
            ({"hiker_pack_weight_kg": 2.0}, "hiker_pack_weight_kg"),
            ({"hiker_pack_weight_kg": 62.0}, "hiker_pack_weight_kg"),
        ],
    )
    def test_validation_bounds_raise_value_error(
        self, kwargs: dict[str, float], expected_field: str
    ) -> None:
        base = {
            "strang_width_m": 1.6,
            "flark_trough_span_m": 14.0,
            "active_thaw_depth_cm": 55.0,
            "palsa_rim_fissure_score": 40.0,
            "hiker_pack_weight_kg": 22.0,
        }
        base.update(kwargs)
        with pytest.raises(ValueError, match=expected_field):
            calculate_aapa_palsa_mire(**base)


class TestAapaPalsaMireIntentAndFormatting:
    """Tests for intent detection, parameter extraction, response formatting, and disambiguation."""

    def test_positive_intent_detection(self) -> None:
        queries = [
            "How do we cross the Viiankiaapa concentric string-bog aapasuo and rimpi flark pools in Sodankylä, Finland?",
            "Assess palsa lagg moat entrapment on the Tavvavuoma ice-cored palsa mound plateau in Norrbotten, Sweden.",
            "How do we navigate Hudson Bay Lowlands string-fen and thermokarst lagg moat collapse near Sutton Ridges?",
            "What crossing strategy applies to Øvre Pasvik and Neiden-Munkefjord palsa-aapa mire corridor in Finnmark?",
            "Calculate aapa palsa mire hazard with strang width 0.8 m, flark trough span 28 m, and active thaw depth 95 cm.",
        ]
        for q in queries:
            assert is_aapa_palsa_mire_query(q), f"Expected positive intent for: {q}"
            assert detect_aapa_palsa_mire_intent(q), f"Expected positive intent for: {q}"

    def test_negative_intent_and_cross_domain_disambiguation(self) -> None:
        non_matching = [
            "What boots do you recommend for hiking?",
            "Where is my order #12345?",
            "How do I choose bog shoeing gear for Great Dismal Sphagnum Quake Corridor?",
            "Navigating a patterned fen flark in Kenai Peninsula",
            "How do we navigate low-center ice-wedge polygons on the Tuktoyaktuk Peninsula?",
            "Assess retrogressive thaw-slump headwall mudflow risk near Batagaika in Yakutia.",
            "Navigating coastal Poa flabellata tussock pedestals at Fortuna Bay on South Georgia.",
            "How do I avoid trampling Cladonia stellaris reindeer lichen mats in Denali?",
            "How to cross Espeletia frailejón cushion bogs in Páramo de Sumapaz?",
            "Crossing overflow aufeis icing fields in the Moma Valley.",
        ]
        for q in non_matching:
            assert not is_aapa_palsa_mire_query(q), f"Expected negative intent for: {q}"

        # Verify adjacent bog/thermokarst/tussock/tundra/paramo/aufeis domains do not hijack aapa_palsa_mire queries
        aapa_queries = [
            "How do we cross the Viiankiaapa concentric string-bog aapasuo and rimpi flark pools in Sodankylä?",
            "Calculate aapa palsa mire risk at Tavvavuoma giant palsa mound plateau with strang width 0.9 m and flark trough span 32 m",
            "Traversing Hudson Bay Lowlands string-fen and palsa thermokarst lagg moat collapse in Ontario",
            "Evaluate Øvre Pasvik and Neiden-Munkefjord palsa-aapa mire sedge carpet fen in Norway",
        ]
        for aq in aapa_queries:
            assert is_aapa_palsa_mire_query(aq) is True
            assert detect_bog_shoeing_intent(aq) is False
            assert is_thermokarst_tundra_query(aq) is False
            assert is_tussock_headland_query(aq) is False
            assert detect_tundra_lichen_intent(aq) is False
            assert is_paramo_navigation_query(aq) is False
            assert is_aufeis_crossing_query(aq) is False
            assert detect_mudflat_intent(aq) is None
            assert detect_nordic_skiing_intent(aq) is None
            assert detect_snowshoe_intent(aq) is None
            assert extract_orienteering_intent(aq) is None
            assert detect_foraging_intent(aq) is None

    def test_extract_params_from_natural_language(self) -> None:
        query = (
            "Calculate aapa palsa mire risk for Viiankiaapa with strang width 0.85 m, "
            "flark trough span 30 m, active thaw depth 92 cm, palsa rim fissure score 74, "
            "and hiker pack weight 28 kg."
        )
        params = extract_aapa_palsa_mire_params(query)
        assert params["site_id"] == "voda-viiankiaapa-sodankyla-lapland-finland"
        assert params["strang_width_m"] == 0.85
        assert params["flark_trough_span_m"] == 30.0
        assert params["active_thaw_depth_cm"] == 92.0
        assert params["palsa_rim_fissure_score"] == 74.0
        assert params["hiker_pack_weight_kg"] == 28.0
        assert params["has_calc_params"] is True

    def test_format_response_actions_and_prompt_builder(self) -> None:
        calc_info: dict[str, object] = format_aapa_palsa_mire_response(
            "Calculate aapa palsa mire risk with strang width 0.9 m, flark trough span 26 m, and active thaw depth 85 cm"
        )
        assert calc_info["action"] == "aapa_palsa_mire_calculated"
        assert calc_info["calculation"] is not None

        lookup_info: dict[str, object] = format_aapa_palsa_mire_response(
            "Tell me about Tavvavuoma and Vissátvuopmi giant palsa-mound plateau in Norrbotten, Sweden"
        )
        assert lookup_info["action"] == "aapa_palsa_mire_lookup"
        matched = lookup_info["matched_sites"]
        assert isinstance(matched, list)
        assert len(matched) == 1
        assert matched[0]["id"] == "tavvavuoma-kummavuopio-palsa-norrbotten-sweden"

        general_info: dict[str, object] = format_aapa_palsa_mire_response(
            "Give me an overview of boreal string-bog aapa mire flark-pool and palsa permafrost-mound crossing"
        )
        assert general_info["action"] == "aapa_palsa_mire_info"
        sites_list = general_info["sites"]
        assert isinstance(sites_list, list)
        assert len(sites_list) == 4

        prompt = build_aapa_palsa_mire_prompt(calc_info)
        assert "AAPA" in prompt.upper()
        assert "PALSA" in prompt.upper() or "FLARK" in prompt.upper()

    def test_chat_and_stream_helpers(self) -> None:
        chat_res = get_chat_response(
            "How do we cross Viiankiaapa aapa mire with strang width 0.9 m and flark trough span 25 m?"
        )
        assert "answer" in chat_res
        assert "aapa_palsa_mire_info" in chat_res
        assert chat_res["aapa_palsa_mire_info"]["action"] == "aapa_palsa_mire_calculated"

        events = list(
            generate_stream_events(
                "Tell me about Øvre Pasvik and Neiden-Munkefjord palsa-aapa mire corridor in Norway"
            )
        )
        assert len(events) >= 3
        assert events[0]["aapa_palsa_mire_info"]["action"] == "aapa_palsa_mire_lookup"
