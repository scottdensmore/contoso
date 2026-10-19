"""Unit tests for the Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking module."""

import pytest
from contoso_chat.beachcombing import detect_beachcombing_intent
from contoso_chat.canyon_bouldering import detect_canyon_bouldering_intent
from contoso_chat.chat import handle_cobble_spit_trekking_intent
from contoso_chat.coasteering import detect_coasteering_intent
from contoso_chat.cobble_spit_trekking import (
    COBBLE_SPIT_GEAR_CHECKLIST,
    COBBLE_SPIT_SITES,
    COBBLE_SPIT_TREKKING_SITES,
    build_cobble_spit_trekking_prompt,
    calculate_cobble_spit_trekking,
    detect_cobble_spit_trekking_intent,
    extract_cobble_spit_trekking_params,
    filter_sites,
    format_cobble_spit_trekking_response,
    generate_stream_events,
    get_all_cobble_spit_sites,
    get_all_sites,
    get_chat_response,
    get_cobble_spit_site_by_id,
    get_gear_checklist,
    get_site_by_id,
    is_cobble_spit_trekking_query,
)
from contoso_chat.kelp_freediving import detect_kelp_freediving_intent
from contoso_chat.mangrove_labyrinth import detect_mangrove_labyrinth_intent
from contoso_chat.mudflat_trekking import detect_mudflat_intent
from contoso_chat.scree_running import detect_scree_running_intent
from contoso_chat.sea_cave_pneumatics import detect_sea_cave_pneumatics_intent
from contoso_chat.sea_kayaking import detect_sea_kayaking_intent
from contoso_chat.stream import generate_cobble_spit_trekking_stream_events
from contoso_chat.trail_running import detect_trail_running_intent
from contoso_chat.turtle_patrol import detect_turtle_patrol_intent


class TestCobbleSpitSitesCatalog:
    """Tests for the 4-site cobble spit & boulder reef catalog and lookup/filter functions."""

    def test_get_all_sites_returns_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(COBBLE_SPIT_SITES) == 4
        assert len(COBBLE_SPIT_TREKKING_SITES) == 4
        assert len(get_all_cobble_spit_sites()) == 4

    def test_site_ids_match_specification(self) -> None:
        ids = {s["id"] for s in get_all_sites()}
        assert ids == {
            "dungeness-spit-olympic-usa",
            "chesil-beach-fleet-uk",
            "west-coast-trail-boulder-reef-canada",
            "farewell-spit-boulder-bank-nz",
        }

    def test_sites_have_required_fields(self) -> None:
        required_fields = {
            "id",
            "name",
            "country",
            "region",
            "length_km",
            "morphology",
            "difficulty",
            "default_median_cobble_diameter_mm",
            "default_kelp_wrack_depth_cm",
            "default_berm_slope_deg",
            "default_swell_height_m",
            "default_pack_load_kg",
            "footwear_recommendation",
            "primary_hazard",
            "navigation_protocol",
            "traversal_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_fields.issubset(set(site.keys()))
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.morphology == site["morphology"]

    def test_get_site_by_id_found(self) -> None:
        site = get_site_by_id("dungeness-spit-olympic-usa")
        assert site is not None
        assert site["name"] == "Dungeness Cuspate Shingle Spit & Drift-Log Berm"
        assert site["country"] == "United States"
        assert site["morphology"] == "cuspate-shingle-spit"
        assert site["difficulty"] == "moderate"

        alias_site = get_cobble_spit_site_by_id("west-coast-trail-boulder-reef-canada")
        assert alias_site is not None
        assert alias_site["country"] == "Canada"
        assert alias_site["morphology"] == "intertidal-boulder-reef"
        assert alias_site["difficulty"] == "extreme"

    def test_get_site_by_id_not_found(self) -> None:
        assert get_site_by_id("nonexistent-cobble-spit") is None

    def test_filter_sites_by_country(self) -> None:
        results = filter_sites(country="United Kingdom")
        assert len(results) == 1
        assert results[0]["id"] == "chesil-beach-fleet-uk"

    def test_filter_sites_by_morphology(self) -> None:
        results = filter_sites(morphology="glacio-fluvial-tombolo")
        assert len(results) == 1
        assert results[0]["id"] == "farewell-spit-boulder-bank-nz"

    def test_filter_sites_by_difficulty(self) -> None:
        challenging = filter_sites(difficulty="challenging")
        assert len(challenging) == 2
        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 1
        assert extreme[0]["id"] == "west-coast-trail-boulder-reef-canada"
        moderate = filter_sites(difficulty="moderate")
        assert len(moderate) == 1
        assert moderate[0]["id"] == "dungeness-spit-olympic-usa"

    def test_filter_sites_by_search(self) -> None:
        results = filter_sites(search="Chesil")
        assert len(results) == 1
        assert results[0]["id"] == "chesil-beach-fleet-uk"


class TestCobbleSpitTrekkingCalculator:
    """Tests for the Coastal Kelp-Wrack Boulder Reef & Cobble Spit Calculator."""

    def test_low_risk_calculation_trail_runner_poles(self) -> None:
        result = calculate_cobble_spit_trekking(
            median_cobble_diameter_mm=45.0,
            kelp_wrack_depth_cm=4.0,
            berm_slope_deg=6.0,
            swell_height_m=0.6,
            pack_load_kg=8.0,
        )
        assert result["risk_level"] == "low"
        assert result["safety_status"] == "low"
        assert result["footwear_class"] == "trail-runner-trekking-poles"
        assert result["mucilage_slip_coefficient"] > 0.25
        assert result["ankle_roll_torque_index"] < 35.0
        assert result["swash_runup_cutoff_minutes"] > 60.0
        assert result["effective_pace_km_h"] >= 2.2
        assert isinstance(result["warnings"], list)
        assert len(result["recommendations"]) >= 1

    def test_moderate_risk_calculation_high_cuff_scree_boot(self) -> None:
        result = calculate_cobble_spit_trekking(
            median_cobble_diameter_mm=110.0,
            kelp_wrack_depth_cm=16.0,
            berm_slope_deg=14.0,
            swell_height_m=1.4,
            pack_load_kg=15.0,
        )
        assert result["risk_level"] == "moderate"
        assert result["footwear_class"] == "high-cuff-scree-boot-dual-poles"
        assert result["effective_pace_km_h"] > 1.0
        assert len(result["recommendations"]) >= 1

    def test_high_risk_boulder_reef_tungsten_studded_felt_boot(self) -> None:
        result = calculate_cobble_spit_trekking(
            median_cobble_diameter_mm=260.0,
            kelp_wrack_depth_cm=45.0,
            berm_slope_deg=22.0,
            swell_height_m=2.4,
            pack_load_kg=22.0,
        )
        assert result["risk_level"] == "high"
        assert result["footwear_class"] == "tungsten-studded-felt-boot-wading-staff"
        assert len(result["warnings"]) >= 1

    def test_critical_risk_swash_overwash_abort(self) -> None:
        result = calculate_cobble_spit_trekking(
            median_cobble_diameter_mm=450.0,
            kelp_wrack_depth_cm=95.0,
            berm_slope_deg=32.0,
            swell_height_m=4.8,
            pack_load_kg=32.0,
        )
        assert result["risk_level"] == "critical"
        assert result["safety_status"] == "critical"
        assert result["footwear_class"] == "abort-swash-overwash-entrapment"
        assert result["swash_runup_cutoff_minutes"] <= 35.0
        assert result["ankle_roll_torque_index"] >= 65.0
        assert len(result["warnings"]) >= 2

    def test_monotonic_physics_relationships(self) -> None:
        # Deeper kelp wrack reduces mucilage slip friction coefficient (more slippery -> lower mu)
        shallow_wrack = calculate_cobble_spit_trekking(
            median_cobble_diameter_mm=100.0,
            kelp_wrack_depth_cm=2.0,
            berm_slope_deg=10.0,
            swell_height_m=1.0,
            pack_load_kg=12.0,
        )
        deep_wrack = calculate_cobble_spit_trekking(
            median_cobble_diameter_mm=100.0,
            kelp_wrack_depth_cm=80.0,
            berm_slope_deg=10.0,
            swell_height_m=1.0,
            pack_load_kg=12.0,
        )
        assert deep_wrack["mucilage_slip_coefficient"] < shallow_wrack["mucilage_slip_coefficient"]
        assert deep_wrack["effective_pace_km_h"] < shallow_wrack["effective_pace_km_h"]

        # Larger cobble diameter + heavier pack load increases ankle roll torque index
        small_light = calculate_cobble_spit_trekking(
            median_cobble_diameter_mm=40.0,
            kelp_wrack_depth_cm=10.0,
            berm_slope_deg=8.0,
            swell_height_m=1.0,
            pack_load_kg=8.0,
        )
        large_heavy = calculate_cobble_spit_trekking(
            median_cobble_diameter_mm=380.0,
            kelp_wrack_depth_cm=10.0,
            berm_slope_deg=26.0,
            swell_height_m=1.0,
            pack_load_kg=30.0,
        )
        assert large_heavy["ankle_roll_torque_index"] > small_light["ankle_roll_torque_index"]

        # Higher swell height reduces swash runup cutoff minutes
        calm_swell = calculate_cobble_spit_trekking(
            median_cobble_diameter_mm=100.0,
            kelp_wrack_depth_cm=15.0,
            berm_slope_deg=12.0,
            swell_height_m=0.8,
            pack_load_kg=14.0,
        )
        storm_swell = calculate_cobble_spit_trekking(
            median_cobble_diameter_mm=100.0,
            kelp_wrack_depth_cm=15.0,
            berm_slope_deg=12.0,
            swell_height_m=5.2,
            pack_load_kg=14.0,
        )
        assert storm_swell["swash_runup_cutoff_minutes"] < calm_swell["swash_runup_cutoff_minutes"]

    def test_validation_out_of_bounds_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="median_cobble_diameter_mm"):
            calculate_cobble_spit_trekking(
                median_cobble_diameter_mm=10.0,
                kelp_wrack_depth_cm=15.0,
                berm_slope_deg=10.0,
            )
        with pytest.raises(ValueError, match="median_cobble_diameter_mm"):
            calculate_cobble_spit_trekking(
                median_cobble_diameter_mm=650.0,
                kelp_wrack_depth_cm=15.0,
                berm_slope_deg=10.0,
            )
        with pytest.raises(ValueError, match="kelp_wrack_depth_cm"):
            calculate_cobble_spit_trekking(
                median_cobble_diameter_mm=100.0,
                kelp_wrack_depth_cm=-5.0,
                berm_slope_deg=10.0,
            )
        with pytest.raises(ValueError, match="kelp_wrack_depth_cm"):
            calculate_cobble_spit_trekking(
                median_cobble_diameter_mm=100.0,
                kelp_wrack_depth_cm=180.0,
                berm_slope_deg=10.0,
            )
        with pytest.raises(ValueError, match="berm_slope_deg"):
            calculate_cobble_spit_trekking(
                median_cobble_diameter_mm=100.0,
                kelp_wrack_depth_cm=15.0,
                berm_slope_deg=-2.0,
            )
        with pytest.raises(ValueError, match="berm_slope_deg"):
            calculate_cobble_spit_trekking(
                median_cobble_diameter_mm=100.0,
                kelp_wrack_depth_cm=15.0,
                berm_slope_deg=45.0,
            )
        with pytest.raises(ValueError, match="swell_height_m"):
            calculate_cobble_spit_trekking(
                median_cobble_diameter_mm=100.0,
                kelp_wrack_depth_cm=15.0,
                berm_slope_deg=10.0,
                swell_height_m=-0.5,
            )
        with pytest.raises(ValueError, match="swell_height_m"):
            calculate_cobble_spit_trekking(
                median_cobble_diameter_mm=100.0,
                kelp_wrack_depth_cm=15.0,
                berm_slope_deg=10.0,
                swell_height_m=9.5,
            )
        with pytest.raises(ValueError, match="pack_load_kg"):
            calculate_cobble_spit_trekking(
                median_cobble_diameter_mm=100.0,
                kelp_wrack_depth_cm=15.0,
                berm_slope_deg=10.0,
                pack_load_kg=-3.0,
            )
        with pytest.raises(ValueError, match="pack_load_kg"):
            calculate_cobble_spit_trekking(
                median_cobble_diameter_mm=100.0,
                kelp_wrack_depth_cm=15.0,
                berm_slope_deg=10.0,
                pack_load_kg=50.0,
            )


class TestGearChecklist:
    """Tests for the 6-item mandatory cobble spit trekking gear checklist."""

    def test_get_gear_checklist_returns_six_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(COBBLE_SPIT_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert "item" in item
            assert "category" in item
            assert "priority" in item
            assert "rationale" in item
            assert item["priority"] == "essential"


class TestIntentDetectionAndDisambiguation:
    """Tests for cobble spit trekking intent detection, parameter extraction, and cross-domain disambiguation."""

    def test_positive_cobble_spit_intent_queries(self) -> None:
        positive_queries = [
            "How do I trek across an intertidal cobble spit with 30 cm kelp-wrack depth?",
            "Tell me about Dungeness Spit cuspate shingle spit and drift-log berm in Olympic USA",
            "What footwear do I need for Chesil Beach storm-berm cobble bar in the UK?",
            "Pachena Carmanah intertidal kelp-wrack boulder reef navigation on the West Coast Trail",
            "Nelson Boulder Bank and Farewell Spit granodiorite cobble bar in New Zealand",
            "Calculate mucilage slip coefficient and ankle roll torque on a shingle spit",
            "How does storm-berm cobble grading affect swash runup cutoff time?",
        ]
        for q in positive_queries:
            assert is_cobble_spit_trekking_query(q) is True, f"Expected True for: {q}"
            assert detect_cobble_spit_trekking_intent(q) is True, f"Expected True for: {q}"

    def test_negative_and_excluded_queries(self) -> None:
        negative_queries = [
            "",
            "   ",
            "Where is my order #12345?",
            "I want a refund for my damaged boots",
            "Where can I find uranium sea glass on Glass Beach in Fort Bragg?",
            "How do I freedive through Macrocystis kelp forest canopy at Point Lobos?",
            "Calculate wattwandern mudflat silt suction drag in the Wadden Sea",
            "What is the pneumatic wave overpressure in Fingal's Cave blowhole?",
            "Navigate Rhizophora mangrove prop root labyrinth in Hell Bay",
        ]
        for q in negative_queries:
            assert is_cobble_spit_trekking_query(q) is False, f"Expected False for: {q}"

    def test_cross_domain_disambiguation_guards(self) -> None:
        cobble_spit_queries = [
            "Trekking across Dungeness Spit shingle spit and drift-log berm on the Olympic coast",
            "Check kelp-wrack mucilage slip and ankle roll torque on West Coast Trail boulder reef",
            "Chesil Beach graded flint storm-berm cobble spit traversal with trekking poles",
            "Farewell Spit and Nelson Boulder Bank intertidal cobble bar swash runup cutoff",
        ]
        for q in cobble_spit_queries:
            assert is_cobble_spit_trekking_query(q) is True
            assert detect_beachcombing_intent(q) is None
            assert detect_kelp_freediving_intent(q) is False
            assert detect_coasteering_intent(q) is None
            assert detect_mudflat_intent(q) is None
            assert detect_sea_cave_pneumatics_intent(q) is False
            assert detect_mangrove_labyrinth_intent(q) is False
            assert detect_turtle_patrol_intent(q) is None
            assert detect_sea_kayaking_intent(q) is None
            assert detect_scree_running_intent(q) is False
            assert detect_canyon_bouldering_intent(q) is None
            assert detect_trail_running_intent(q) is None

    def test_extract_cobble_spit_trekking_params(self) -> None:
        query = (
            "Calculate cobble spit trekking for Chesil Beach with 140 mm cobble diameter, "
            "25 cm kelp wrack depth, 18 deg berm slope, 2.2 m swell, and 18 kg pack load"
        )
        params = extract_cobble_spit_trekking_params(query)
        assert params["site_id"] == "chesil-beach-fleet-uk"
        assert params["median_cobble_diameter_mm"] == 140.0
        assert params["kelp_wrack_depth_cm"] == 25.0
        assert params["berm_slope_deg"] == 18.0
        assert params["swell_height_m"] == 2.2
        assert params["pack_load_kg"] == 18.0


class TestFormattingChatAndStream:
    """Tests for response formatting, prompt builder, chat handler, and SSE stream generator."""

    def test_format_cobble_spit_trekking_response_actions(self) -> None:
        calc_resp = format_cobble_spit_trekking_response(
            "Calculate cobble spit safety for 180 mm cobbles and 35 cm kelp wrack"
        )
        assert calc_resp["action"] == "cobble_spit_trekking_calculated"
        assert "calculation" in calc_resp
        assert "answer" in calc_resp

        lookup_resp = format_cobble_spit_trekking_response(
            "Tell me about Dungeness Spit shingle spit in the United States"
        )
        assert lookup_resp["action"] == "cobble_spit_trekking_lookup"
        assert lookup_resp["matched_site"]["id"] == "dungeness-spit-olympic-usa"

        info_resp = format_cobble_spit_trekking_response(
            "What are the general intertidal cobble spit and kelp-wrack trekking guidelines?"
        )
        assert info_resp["action"] == "cobble_spit_trekking_info"
        assert len(info_resp["sites"]) == 4

    def test_build_cobble_spit_trekking_prompt(self) -> None:
        prompt = build_cobble_spit_trekking_prompt(
            "How do I cross Chesil Beach storm-berm cobble spit?"
        )
        assert "Cobble Spit" in prompt or "Kelp-Wrack" in prompt
        assert "Chesil Beach" in prompt
        assert "mucilage" in prompt.lower() or "swash" in prompt.lower()

    def test_chat_handler_and_get_chat_response(self) -> None:
        handled = handle_cobble_spit_trekking_intent(
            "Calculate cobble spit traction for Dungeness Spit with 95 mm cobbles and 14 deg berm slope"
        )
        assert handled is not None
        assert "cobble_spit_trekking_info" in handled
        assert "answer" in handled

        assert handle_cobble_spit_trekking_intent("Check my order refund status") is None

        direct = get_chat_response("Tell me about Nelson Boulder Bank and Farewell Spit cobble bar")
        assert "cobble_spit_trekking_info" in direct

    @pytest.mark.anyio
    async def test_stream_events_generators(self) -> None:
        sync_events = list(
            generate_stream_events(
                "Calculate cobble spit safety for Chesil Beach at 16 deg berm slope"
            )
        )
        assert len(sync_events) >= 3
        assert any("cobble_spit_trekking_info" in e for e in sync_events)
        assert sync_events[-1] == "data: [DONE]\n\n"

        async_events = []
        async for chunk in generate_cobble_spit_trekking_stream_events(
            "Navigate West Coast Trail intertidal kelp-wrack boulder reef"
        ):
            async_events.append(chunk)
        assert len(async_events) >= 3
        assert any("cobble_spit_trekking_info" in e for e in async_events)
        assert async_events[-1] == "data: [DONE]\n\n"
