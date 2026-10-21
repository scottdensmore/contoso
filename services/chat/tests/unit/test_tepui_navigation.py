"""Unit tests for the Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation Guide module."""

import pytest
from contoso_chat.big_wall import detect_big_wall_intent
from contoso_chat.bog_shoeing import detect_bog_shoeing_intent
from contoso_chat.canopy_bryophyte import detect_canopy_bryophyte_intent
from contoso_chat.canyon_bouldering import detect_canyon_bouldering_intent
from contoso_chat.canyoneering import detect_canyoneering_intent
from contoso_chat.chat import handle_tepui_navigation_intent
from contoso_chat.climbing import detect_climbing_intent
from contoso_chat.orienteering import extract_orienteering_intent
from contoso_chat.paramo_navigation import detect_paramo_navigation_intent
from contoso_chat.stream import generate_tepui_navigation_stream_events
from contoso_chat.tepui_navigation import (
    TEPUI_NAVIGATION_GEAR_CHECKLIST,
    TEPUI_PLATEAU_SITES,
    build_tepui_navigation_prompt,
    calculate_tepui_navigation,
    detect_tepui_navigation_intent,
    extract_tepui_navigation_params,
    filter_sites,
    format_tepui_navigation_response,
    generate_stream_events,
    get_all_sites,
    get_all_tepui_navigation_sites,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    get_tepui_navigation_site_by_id,
    is_tepui_navigation_query,
)
from contoso_chat.tiankeng_descent import detect_tiankeng_descent_intent
from contoso_chat.tsingy_labyrinth import detect_tsingy_labyrinth_intent


class TestTepuiPlateauSitesCatalog:
    """Tests for the 4-site table-mountain quartzite tepui catalog and lookup/filter functions."""

    def test_get_all_sites_returns_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(TEPUI_PLATEAU_SITES) == 4
        assert len(get_all_tepui_navigation_sites()) == 4

    def test_site_ids_match_specification(self) -> None:
        ids = {s["id"] for s in get_all_sites()}
        assert ids == {
            "mount-roraima-maverick-plateau",
            "auyan-tepui-churun-rim-venezuela",
            "kukenan-matawi-tepui-venezuela",
            "chiribiquete-tepui-mesas-colombia",
        }

    def test_sites_have_required_fields(self) -> None:
        required_fields = {
            "id",
            "name",
            "country",
            "region",
            "morphology",
            "difficulty",
            "default_cyanobacteria_biofilm_pct",
            "default_fissure_gap_width_m",
            "default_orographic_rain_mm_hr",
            "default_cloud_visibility_m",
            "default_slab_slope_deg",
            "primary_hazard",
            "progression_protocol",
            "navigation_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_fields.issubset(set(site.keys()))
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.morphology == site["morphology"]

    def test_get_site_by_id_found(self) -> None:
        site = get_site_by_id("mount-roraima-maverick-plateau")
        assert site is not None
        assert (
            site["name"]
            == "Mount Roraima Maverick Summit & Labyrinth Pseudokarst Plateau"
        )
        assert site["country"] == "Venezuela"
        assert site["morphology"] == "pseudokarst-fissure-grid"
        assert site["difficulty"] == "challenging"

        alias_site = get_tepui_navigation_site_by_id(
            "auyan-tepui-churun-rim-venezuela"
        )
        assert alias_site is not None
        assert alias_site["country"] == "Venezuela"
        assert alias_site["morphology"] == "brocchinia-bog-sinkhole-mesa"
        assert alias_site["difficulty"] == "extreme"

    def test_get_site_by_id_not_found(self) -> None:
        assert get_site_by_id("nonexistent-tepui-site") is None

    def test_filter_sites_by_country(self) -> None:
        results = filter_sites(country="Venezuela")
        assert len(results) == 3
        ids = {s["id"] for s in results}
        assert ids == {
            "mount-roraima-maverick-plateau",
            "auyan-tepui-churun-rim-venezuela",
            "kukenan-matawi-tepui-venezuela",
        }

        colombia_results = filter_sites(country="Colombia")
        assert len(colombia_results) == 1
        assert colombia_results[0]["id"] == "chiribiquete-tepui-mesas-colombia"

    def test_filter_sites_by_morphology(self) -> None:
        results = filter_sites(morphology="pseudokarst-fissure-grid")
        assert len(results) == 1
        assert results[0]["id"] == "mount-roraima-maverick-plateau"

        pinnacle_results = filter_sites(morphology="orthoquartzite-pinnacle-plateau")
        assert len(pinnacle_results) == 1
        assert pinnacle_results[0]["id"] == "kukenan-matawi-tepui-venezuela"

    def test_filter_sites_by_difficulty(self) -> None:
        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 2
        challenging = filter_sites(difficulty="challenging")
        assert len(challenging) == 1
        assert challenging[0]["id"] == "mount-roraima-maverick-plateau"
        moderate = filter_sites(difficulty="moderate")
        assert len(moderate) == 1
        assert moderate[0]["id"] == "chiribiquete-tepui-mesas-colombia"

    def test_filter_sites_by_search(self) -> None:
        results = filter_sites(search="Chiribiquete")
        assert len(results) == 1
        assert results[0]["id"] == "chiribiquete-tepui-mesas-colombia"

        auyan_results = filter_sites(search="Auyan")
        assert len(auyan_results) == 1
        assert auyan_results[0]["id"] == "auyan-tepui-churun-rim-venezuela"


class TestTepuiNavigationCalculator:
    """Tests for the Table-Mountain Quartzite Tepui & Sandstone Fissure Navigation Calculator."""

    def test_low_risk_calculation_cairn_corridor_walk(self) -> None:
        result = calculate_tepui_navigation(
            cyanobacteria_biofilm_pct=20.0,
            fissure_gap_width_m=0.5,
            orographic_rain_mm_hr=5.0,
            cloud_visibility_m=180.0,
            slab_slope_deg=6.0,
        )
        assert result["risk_level"] == "low"
        assert result["safety_status"] == "low"
        assert result["progression_protocol"] == "protocol-1-cairn-corridor-walk"
        assert result["biofilm_traction_coefficient"] > 0.55
        assert result["fissure_bridge_collapse_risk_pct"] < 25.0
        assert result["orographic_blackout_index"] < 3.5
        assert result["blackwater_stream_surge_multiplier"] >= 1.0
        assert isinstance(result["warnings"], list)
        assert len(result["recommendations"]) >= 1

    def test_moderate_risk_calculation_probed_fissure_belay(self) -> None:
        result = calculate_tepui_navigation(
            cyanobacteria_biofilm_pct=52.0,
            fissure_gap_width_m=1.4,
            orographic_rain_mm_hr=20.0,
            cloud_visibility_m=55.0,
            slab_slope_deg=14.0,
        )
        assert result["risk_level"] == "moderate"
        assert result["progression_protocol"] == "protocol-2-probed-fissure-belay"
        assert len(result["recommendations"]) >= 1

    def test_high_risk_calculation_rope_bridged_chasm_traverse(self) -> None:
        result = calculate_tepui_navigation(
            cyanobacteria_biofilm_pct=78.0,
            fissure_gap_width_m=2.4,
            orographic_rain_mm_hr=42.0,
            cloud_visibility_m=22.0,
            slab_slope_deg=20.0,
        )
        assert result["risk_level"] == "high"
        assert result["progression_protocol"] == "protocol-3-rope-bridged-chasm-traverse"
        assert len(result["warnings"]) >= 1

    def test_critical_risk_emergency_overhang_bivouac_lockout(self) -> None:
        result = calculate_tepui_navigation(
            cyanobacteria_biofilm_pct=94.0,
            fissure_gap_width_m=4.6,
            orographic_rain_mm_hr=72.0,
            cloud_visibility_m=8.0,
            slab_slope_deg=34.0,
        )
        assert result["risk_level"] == "critical"
        assert result["safety_status"] == "critical"
        assert (
            result["progression_protocol"]
            == "protocol-4-emergency-overhang-bivouac-lockout"
        )
        assert result["biofilm_traction_coefficient"] <= 0.25
        assert result["fissure_bridge_collapse_risk_pct"] >= 75.0
        assert result["orographic_blackout_index"] >= 7.5
        assert result["blackwater_stream_surge_multiplier"] >= 5.0
        assert len(result["warnings"]) >= 2

    def test_monotonic_physics_relationships(self) -> None:
        # Higher cyanobacteria biofilm, steeper slope, and heavier rain reduce traction and increase collapse/surge risk
        clean_plateau = calculate_tepui_navigation(
            cyanobacteria_biofilm_pct=15.0,
            fissure_gap_width_m=0.8,
            orographic_rain_mm_hr=6.0,
            cloud_visibility_m=150.0,
            slab_slope_deg=8.0,
        )
        slick_storm_plateau = calculate_tepui_navigation(
            cyanobacteria_biofilm_pct=90.0,
            fissure_gap_width_m=3.8,
            orographic_rain_mm_hr=65.0,
            cloud_visibility_m=12.0,
            slab_slope_deg=28.0,
        )
        assert (
            slick_storm_plateau["biofilm_traction_coefficient"]
            < clean_plateau["biofilm_traction_coefficient"]
        )
        assert (
            slick_storm_plateau["fissure_bridge_collapse_risk_pct"]
            > clean_plateau["fissure_bridge_collapse_risk_pct"]
        )
        assert (
            slick_storm_plateau["orographic_blackout_index"]
            > clean_plateau["orographic_blackout_index"]
        )
        assert (
            slick_storm_plateau["blackwater_stream_surge_multiplier"]
            > clean_plateau["blackwater_stream_surge_multiplier"]
        )

    def test_validation_out_of_bounds_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="cyanobacteria_biofilm_pct"):
            calculate_tepui_navigation(
                cyanobacteria_biofilm_pct=-5.0,
                fissure_gap_width_m=1.5,
                orographic_rain_mm_hr=20.0,
            )
        with pytest.raises(ValueError, match="cyanobacteria_biofilm_pct"):
            calculate_tepui_navigation(
                cyanobacteria_biofilm_pct=105.0,
                fissure_gap_width_m=1.5,
                orographic_rain_mm_hr=20.0,
            )
        with pytest.raises(ValueError, match="fissure_gap_width_m"):
            calculate_tepui_navigation(
                cyanobacteria_biofilm_pct=50.0,
                fissure_gap_width_m=0.05,
                orographic_rain_mm_hr=20.0,
            )
        with pytest.raises(ValueError, match="fissure_gap_width_m"):
            calculate_tepui_navigation(
                cyanobacteria_biofilm_pct=50.0,
                fissure_gap_width_m=8.5,
                orographic_rain_mm_hr=20.0,
            )
        with pytest.raises(ValueError, match="orographic_rain_mm_hr"):
            calculate_tepui_navigation(
                cyanobacteria_biofilm_pct=50.0,
                fissure_gap_width_m=1.5,
                orographic_rain_mm_hr=-2.0,
            )
        with pytest.raises(ValueError, match="orographic_rain_mm_hr"):
            calculate_tepui_navigation(
                cyanobacteria_biofilm_pct=50.0,
                fissure_gap_width_m=1.5,
                orographic_rain_mm_hr=110.0,
            )
        with pytest.raises(ValueError, match="cloud_visibility_m"):
            calculate_tepui_navigation(
                cyanobacteria_biofilm_pct=50.0,
                fissure_gap_width_m=1.5,
                orographic_rain_mm_hr=20.0,
                cloud_visibility_m=1.0,
            )
        with pytest.raises(ValueError, match="cloud_visibility_m"):
            calculate_tepui_navigation(
                cyanobacteria_biofilm_pct=50.0,
                fissure_gap_width_m=1.5,
                orographic_rain_mm_hr=20.0,
                cloud_visibility_m=600.0,
            )
        with pytest.raises(ValueError, match="slab_slope_deg"):
            calculate_tepui_navigation(
                cyanobacteria_biofilm_pct=50.0,
                fissure_gap_width_m=1.5,
                orographic_rain_mm_hr=20.0,
                slab_slope_deg=-3.0,
            )
        with pytest.raises(ValueError, match="slab_slope_deg"):
            calculate_tepui_navigation(
                cyanobacteria_biofilm_pct=50.0,
                fissure_gap_width_m=1.5,
                orographic_rain_mm_hr=20.0,
                slab_slope_deg=55.0,
            )


class TestGearChecklist:
    """Tests for the 6-item mandatory table-mountain quartzite tepui gear checklist."""

    def test_get_gear_checklist_returns_six_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(TEPUI_NAVIGATION_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert "item" in item
            assert "category" in item
            assert "priority" in item
            assert "rationale" in item
            assert item["priority"] == "essential"


class TestIntentDetectionAndDisambiguation:
    """Tests for tepui navigation intent detection, parameter extraction, and cross-domain disambiguation."""

    def test_positive_tepui_navigation_intent_queries(self) -> None:
        positive_queries = [
            "How do I navigate the pseudokarst fissure grid on Mount Roraima Maverick summit plateau in Venezuela?",
            "Calculate tepui navigation biofilm traction coefficient and fissure bridge collapse risk for 75% cyanobacteria biofilm and 2.2 m fissure gap width",
            "What gear do I need for Auyán-Tepui Churún orthoquartzite mesa and Brocchinia bog sinkholes?",
            "Tell me about Kukenán Matawi Tepui Proterozoic escarpment and summit chasm in the Gran Sabana",
            "How to traverse Serranía de Chiribiquete table-mountain quartzite mesas in Colombia?",
            "Orthoquartzite pseudokarst fissure navigation with 45 mm/hr orographic rain and 18 m cloud visibility",
        ]
        for q in positive_queries:
            assert is_tepui_navigation_query(q) is True, f"Expected True for: {q}"
            assert detect_tepui_navigation_intent(q) is True, f"Expected True for: {q}"

    def test_negative_and_excluded_queries(self) -> None:
        negative_queries = [
            "",
            "   ",
            "Where is my order #12345?",
            "I want a refund for my approach boots",
            "How do I rig a multi-rebelay SRT descent into Xiaozhai Tiankeng giant collapse sinkhole in Chongqing?",
            "How to avoid waterfall spray and quartzite rockfall at Sima Humboldt Sarisariñama tepui sinkhole?",
            "Sima Humboldt Sarisariñama erosional waterfall tiankeng descent and spall trajectory risk",
            "How do I scramble the rillenkarren razor spires at Tsingy de Bemaraha Grand Tsingy in Madagascar?",
            "How do I cross Plantago and Distichia cushion bogs in Sumapaz Páramo with Espeletia frailejones?",
            "What trad climbing cam rack do I need for Index Lower Town Wall granite cracks?",
            "What portaledge and hauling pig setup do I need for El Capitan The Nose big wall climb?",
        ]
        for q in negative_queries:
            assert is_tepui_navigation_query(q) is False, f"Expected False for: {q}"

    def test_cross_domain_disambiguation_guards(self) -> None:
        tepui_queries = [
            "Navigate Mount Roraima Maverick summit plateau pseudokarst fissure grid and cyanobacteria biofilm slabs in Venezuela",
            "Calculate fissure bridge collapse risk and blackwater stream surge on Auyán-Tepui Brocchinia bog mesa",
            "Kukenán Matawi Tepui orthoquartzite pinnacle plateau chasm rope belay in Gran Sabana Venezuela",
            "Serranía de Chiribiquete table-mountain quartzite escarpment ramp navigation in Colombia",
        ]
        for q in tepui_queries:
            assert is_tepui_navigation_query(q) is True
            assert detect_tiankeng_descent_intent(q) is False
            assert detect_tsingy_labyrinth_intent(q) is False
            assert detect_paramo_navigation_intent(q) is False
            assert detect_big_wall_intent(q) is None
            assert detect_climbing_intent(q) is None
            assert detect_canyoneering_intent(q) is None
            assert detect_canyon_bouldering_intent(q) is None
            assert detect_canopy_bryophyte_intent(q) is False
            assert extract_orienteering_intent(q) is None
            assert detect_bog_shoeing_intent(q) is False

    def test_extract_tepui_navigation_params(self) -> None:
        query = (
            "Calculate tepui navigation risk for Mount Roraima Venezuela with 72% cyanobacteria biofilm, "
            "2.1 m fissure gap width, 36 mm/hr orographic rain, 25 m cloud visibility, and 18 deg slab slope"
        )
        params = extract_tepui_navigation_params(query)
        assert params["site_id"] == "mount-roraima-maverick-plateau"
        assert params["cyanobacteria_biofilm_pct"] == 72.0
        assert params["fissure_gap_width_m"] == 2.1
        assert params["orographic_rain_mm_hr"] == 36.0
        assert params["cloud_visibility_m"] == 25.0
        assert params["slab_slope_deg"] == 18.0


class TestFormattingChatAndStream:
    """Tests for response formatting, prompt builder, chat handler, and SSE stream generator."""

    def test_format_tepui_navigation_response_actions(self) -> None:
        calc_resp = format_tepui_navigation_response(
            "Calculate tepui navigation biofilm traction coefficient for 80% cyanobacteria biofilm and 2.5 m fissure gap width"
        )
        assert calc_resp["action"] == "tepui_navigation_calculated"
        assert "calculation" in calc_resp
        assert "answer" in calc_resp

        lookup_resp = format_tepui_navigation_response(
            "Tell me about Auyán-Tepui Devil's Canyon and Churún orthoquartzite mesa in Venezuela"
        )
        assert lookup_resp["action"] == "tepui_navigation_lookup"
        assert lookup_resp["matched_site"]["id"] == "auyan-tepui-churun-rim-venezuela"

        info_resp = format_tepui_navigation_response(
            "What are the general table-mountain quartzite tepui and pseudokarst fissure guidelines?"
        )
        assert info_resp["action"] == "tepui_navigation_info"
        assert len(info_resp["sites"]) == 4

    def test_build_tepui_navigation_prompt(self) -> None:
        prompt = build_tepui_navigation_prompt(
            "How do I avoid cyanobacteria biofilm slips and fissure bridge collapse on Mount Roraima?"
        )
        assert "Tepui" in prompt or "Roraima" in prompt
        assert "quartzite" in prompt.lower() or "fissure" in prompt.lower()

    def test_chat_handler_and_get_chat_response(self) -> None:
        handled = handle_tepui_navigation_intent(
            "Calculate tepui navigation risk for Mount Roraima with 68% cyanobacteria biofilm and 1.6 m fissure gap"
        )
        assert handled is not None
        assert "tepui_navigation_info" in handled
        assert "answer" in handled

        assert handle_tepui_navigation_intent("Check my order refund status") is None

        direct = get_chat_response(
            "Tell me about Serranía de Chiribiquete table-mountain quartzite mesas in Colombia"
        )
        assert "tepui_navigation_info" in direct

    @pytest.mark.anyio
    async def test_stream_events_generators(self) -> None:
        sync_events = list(
            generate_stream_events(
                "Calculate tepui navigation biofilm traction for Kukenán Matawi Tepui at 88% cyanobacteria biofilm"
            )
        )
        assert len(sync_events) >= 3
        assert any("tepui_navigation_info" in e for e in sync_events)
        assert sync_events[-1] == "data: [DONE]\n\n"

        async_events = []
        async for chunk in generate_tepui_navigation_stream_events(
            "Navigate Mount Roraima Maverick plateau pseudokarst fissure grid in Venezuela"
        ):
            async_events.append(chunk)
        assert len(async_events) >= 3
        assert any("tepui_navigation_info" in e for e in async_events)
        assert async_events[-1] == "data: [DONE]\n\n"
