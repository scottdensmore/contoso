"""Unit tests for the High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Navigation module."""

import pytest
from contoso_chat.canyon_bouldering import detect_canyon_bouldering_intent
from contoso_chat.canyoneering import detect_canyoneering_intent
from contoso_chat.chat import handle_flash_flood_slot_intent
from contoso_chat.desert_trekking import detect_desert_trekking_intent
from contoso_chat.flash_flood_slot import (
    FLASH_FLOOD_SLOT_GEAR_CHECKLIST,
    FLASH_FLOOD_SLOT_SITES,
    build_flash_flood_slot_prompt,
    calculate_flash_flood_slot,
    detect_flash_flood_slot_intent,
    extract_flash_flood_slot_params,
    filter_sites,
    format_flash_flood_slot_response,
    generate_stream_events,
    get_all_flash_flood_slot_sites,
    get_all_sites,
    get_chat_response,
    get_flash_flood_slot_site_by_id,
    get_gear_checklist,
    get_site_by_id,
    is_flash_flood_slot_query,
)
from contoso_chat.mountain_weather import detect_mountain_weather_intent
from contoso_chat.pothole_escape import detect_pothole_escape_intent
from contoso_chat.river_rafting import detect_river_rafting_intent
from contoso_chat.slickrock_burro import detect_slickrock_burro_intent
from contoso_chat.stream import generate_flash_flood_slot_stream_events
from contoso_chat.whitewater import detect_whitewater_intent


class TestFlashFloodSlotSitesCatalog:
    """Tests for the 4-site slot-canyon flash-flood catalog and lookup/filter functions."""

    def test_get_all_sites_returns_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(FLASH_FLOOD_SLOT_SITES) == 4
        assert len(get_all_flash_flood_slot_sites()) == 4

    def test_site_ids_match_specification(self) -> None:
        ids = {s["id"] for s in get_all_sites()}
        assert ids == {
            "buckskin-gulch-paria-usa",
            "little-wild-horse-bell-usa",
            "wadi-mujib-siq-jordan",
            "garganta-del-cares-wadi-oman",
        }

    def test_sites_have_required_fields(self) -> None:
        required_fields = {
            "id",
            "name",
            "country",
            "region",
            "length_km",
            "lithology",
            "difficulty",
            "default_catchment_area_km2",
            "default_upstream_rain_mm_hr",
            "default_slot_width_m",
            "default_escape_ledge_height_m",
            "default_distance_to_exit_km",
            "escape_ledge_protocol",
            "primary_hazard",
            "navigation_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_fields.issubset(set(site.keys()))
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.lithology == site["lithology"]

    def test_get_site_by_id_found(self) -> None:
        site = get_site_by_id("buckskin-gulch-paria-usa")
        assert site is not None
        assert site["name"] == "Buckskin Gulch & Wire Pass Navajo Sandstone Constriction"
        assert site["country"] == "United States"
        assert site["lithology"] == "navajo-sandstone-narrows"
        assert site["difficulty"] == "extreme"

        alias_site = get_flash_flood_slot_site_by_id("wadi-mujib-siq-jordan")
        assert alias_site is not None
        assert alias_site["country"] == "Jordan"
        assert alias_site["lithology"] == "kayenta-ledgy-gorge"
        assert alias_site["difficulty"] == "challenging"

    def test_get_site_by_id_not_found(self) -> None:
        assert get_site_by_id("nonexistent-slot-canyon") is None

    def test_filter_sites_by_country(self) -> None:
        results = filter_sites(country="Jordan")
        assert len(results) == 1
        assert results[0]["id"] == "wadi-mujib-siq-jordan"

    def test_filter_sites_by_lithology(self) -> None:
        results = filter_sites(lithology="limestone-karst-wadi")
        assert len(results) == 1
        assert results[0]["id"] == "garganta-del-cares-wadi-oman"

    def test_filter_sites_by_difficulty(self) -> None:
        challenging = filter_sites(difficulty="challenging")
        assert len(challenging) == 2
        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 1
        assert extreme[0]["id"] == "buckskin-gulch-paria-usa"
        moderate = filter_sites(difficulty="moderate")
        assert len(moderate) == 1
        assert moderate[0]["id"] == "little-wild-horse-bell-usa"

    def test_filter_sites_by_search(self) -> None:
        results = filter_sites(search="Little Wild Horse")
        assert len(results) == 1
        assert results[0]["id"] == "little-wild-horse-bell-usa"


class TestFlashFloodSlotCalculator:
    """Tests for the High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Calculator."""

    def test_low_risk_calculation_dry_wash_standard_transit(self) -> None:
        result = calculate_flash_flood_slot(
            catchment_area_km2=25.0,
            upstream_rain_mm_hr=2.0,
            slot_width_m=8.0,
            escape_ledge_height_m=2.0,
            distance_to_exit_km=1.0,
        )
        assert result["risk_level"] == "low"
        assert result["safety_status"] == "low"
        assert result["escape_class"] == "dry-wash-standard-transit"
        assert result["flood_wave_lag_minutes"] > 45.0
        assert result["wall_of_water_rise_rate_m_per_min"] < 0.25
        assert result["peak_discharge_m3_s"] >= 0.0
        assert result["escape_margin_minutes"] > 20.0
        assert isinstance(result["warnings"], list)
        assert len(result["recommendations"]) >= 1

    def test_moderate_risk_calculation_monitor_high_bench_ledges(self) -> None:
        result = calculate_flash_flood_slot(
            catchment_area_km2=85.0,
            upstream_rain_mm_hr=14.0,
            slot_width_m=4.0,
            escape_ledge_height_m=3.5,
            distance_to_exit_km=2.0,
        )
        assert result["risk_level"] == "moderate"
        assert result["escape_class"] == "monitor-high-bench-ledges"
        assert result["peak_discharge_m3_s"] > 5.0
        assert len(result["recommendations"]) >= 1

    def test_high_risk_calculation_immediate_climb_escape_ledge(self) -> None:
        result = calculate_flash_flood_slot(
            catchment_area_km2=240.0,
            upstream_rain_mm_hr=32.0,
            slot_width_m=1.8,
            escape_ledge_height_m=6.5,
            distance_to_exit_km=3.5,
        )
        assert result["risk_level"] == "high"
        assert result["escape_class"] == "immediate-climb-escape-ledge"
        assert len(result["warnings"]) >= 1

    def test_critical_risk_imminent_flood_bore_abort(self) -> None:
        result = calculate_flash_flood_slot(
            catchment_area_km2=850.0,
            upstream_rain_mm_hr=65.0,
            slot_width_m=0.8,
            escape_ledge_height_m=14.0,
            distance_to_exit_km=8.0,
        )
        assert result["risk_level"] == "critical"
        assert result["safety_status"] == "critical"
        assert result["escape_class"] == "abort-imminent-flood-bore-entrapment"
        assert result["wall_of_water_rise_rate_m_per_min"] >= 0.8
        assert result["peak_discharge_m3_s"] >= 100.0
        assert len(result["warnings"]) >= 2

    def test_monotonic_physics_relationships(self) -> None:
        # Higher upstream rainfall intensity increases peak discharge and wall-of-water rise rate
        light_rain = calculate_flash_flood_slot(
            catchment_area_km2=150.0,
            upstream_rain_mm_hr=5.0,
            slot_width_m=3.0,
            escape_ledge_height_m=4.0,
            distance_to_exit_km=2.0,
        )
        heavy_rain = calculate_flash_flood_slot(
            catchment_area_km2=150.0,
            upstream_rain_mm_hr=55.0,
            slot_width_m=3.0,
            escape_ledge_height_m=4.0,
            distance_to_exit_km=2.0,
        )
        assert heavy_rain["peak_discharge_m3_s"] > light_rain["peak_discharge_m3_s"]
        assert (
            heavy_rain["wall_of_water_rise_rate_m_per_min"]
            > light_rain["wall_of_water_rise_rate_m_per_min"]
        )
        assert heavy_rain["escape_margin_minutes"] < light_rain["escape_margin_minutes"]

        # Narrower slot width increases vertical rise rate for the same discharge
        wide_slot = calculate_flash_flood_slot(
            catchment_area_km2=200.0,
            upstream_rain_mm_hr=30.0,
            slot_width_m=10.0,
            escape_ledge_height_m=4.0,
            distance_to_exit_km=2.5,
        )
        narrow_slot = calculate_flash_flood_slot(
            catchment_area_km2=200.0,
            upstream_rain_mm_hr=30.0,
            slot_width_m=1.0,
            escape_ledge_height_m=4.0,
            distance_to_exit_km=2.5,
        )
        assert (
            narrow_slot["wall_of_water_rise_rate_m_per_min"]
            > wide_slot["wall_of_water_rise_rate_m_per_min"]
        )

        # Longer distance to exit reduces escape margin minutes
        short_exit = calculate_flash_flood_slot(
            catchment_area_km2=120.0,
            upstream_rain_mm_hr=20.0,
            slot_width_m=2.5,
            escape_ledge_height_m=4.0,
            distance_to_exit_km=0.8,
        )
        long_exit = calculate_flash_flood_slot(
            catchment_area_km2=120.0,
            upstream_rain_mm_hr=20.0,
            slot_width_m=2.5,
            escape_ledge_height_m=4.0,
            distance_to_exit_km=9.5,
        )
        assert long_exit["escape_margin_minutes"] < short_exit["escape_margin_minutes"]

    def test_validation_out_of_bounds_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="catchment_area_km2"):
            calculate_flash_flood_slot(
                catchment_area_km2=0.5,
                upstream_rain_mm_hr=20.0,
                slot_width_m=2.5,
            )
        with pytest.raises(ValueError, match="catchment_area_km2"):
            calculate_flash_flood_slot(
                catchment_area_km2=1800.0,
                upstream_rain_mm_hr=20.0,
                slot_width_m=2.5,
            )
        with pytest.raises(ValueError, match="upstream_rain_mm_hr"):
            calculate_flash_flood_slot(
                catchment_area_km2=100.0,
                upstream_rain_mm_hr=-5.0,
                slot_width_m=2.5,
            )
        with pytest.raises(ValueError, match="upstream_rain_mm_hr"):
            calculate_flash_flood_slot(
                catchment_area_km2=100.0,
                upstream_rain_mm_hr=150.0,
                slot_width_m=2.5,
            )
        with pytest.raises(ValueError, match="slot_width_m"):
            calculate_flash_flood_slot(
                catchment_area_km2=100.0,
                upstream_rain_mm_hr=20.0,
                slot_width_m=0.1,
            )
        with pytest.raises(ValueError, match="slot_width_m"):
            calculate_flash_flood_slot(
                catchment_area_km2=100.0,
                upstream_rain_mm_hr=20.0,
                slot_width_m=30.0,
            )
        with pytest.raises(ValueError, match="escape_ledge_height_m"):
            calculate_flash_flood_slot(
                catchment_area_km2=100.0,
                upstream_rain_mm_hr=20.0,
                slot_width_m=2.5,
                escape_ledge_height_m=0.2,
            )
        with pytest.raises(ValueError, match="escape_ledge_height_m"):
            calculate_flash_flood_slot(
                catchment_area_km2=100.0,
                upstream_rain_mm_hr=20.0,
                slot_width_m=2.5,
                escape_ledge_height_m=35.0,
            )
        with pytest.raises(ValueError, match="distance_to_exit_km"):
            calculate_flash_flood_slot(
                catchment_area_km2=100.0,
                upstream_rain_mm_hr=20.0,
                slot_width_m=2.5,
                distance_to_exit_km=0.05,
            )
        with pytest.raises(ValueError, match="distance_to_exit_km"):
            calculate_flash_flood_slot(
                catchment_area_km2=100.0,
                upstream_rain_mm_hr=20.0,
                slot_width_m=2.5,
                distance_to_exit_km=25.0,
            )


class TestGearChecklist:
    """Tests for the 6-item mandatory slot-canyon flash-flood & escape-ledge gear checklist."""

    def test_get_gear_checklist_returns_six_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(FLASH_FLOOD_SLOT_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert "item" in item
            assert "category" in item
            assert "priority" in item
            assert "rationale" in item
            assert item["priority"] == "essential"


class TestIntentDetectionAndDisambiguation:
    """Tests for flash-flood slot intent detection, parameter extraction, and cross-domain disambiguation."""

    def test_positive_flash_flood_slot_intent_queries(self) -> None:
        positive_queries = [
            "Calculate the flash-flood hydrograph and escape ledge margin for Buckskin Gulch",
            "How fast does a blue-sky flood bore rise in Little Wild Horse Canyon?",
            "Tell me about Wadi Mujib sandstone siq flash flood escape ledges in Jordan",
            "What is the flood wave lag time for Wadi Ghul Al Nakhar gorge in Oman?",
            "Slot canyon flood hydrograph calculator for 350 km2 catchment and 40 mm/hr rain",
            "Where are the escape ledges in Buckskin Gulch and Wire Pass narrows?",
        ]
        for q in positive_queries:
            assert is_flash_flood_slot_query(q) is True, f"Expected True for: {q}"
            assert detect_flash_flood_slot_intent(q) is True, f"Expected True for: {q}"

    def test_negative_and_excluded_queries(self) -> None:
        negative_queries = [
            "",
            "   ",
            "Where is my order #12345?",
            "I want a refund for my damaged drybag",
            "How do I build a sandtrap ghost anchor for pothole escape in Neon Canyon?",
            "What slot canyon rappel rope length do I need for The Subway?",
            "Is buckskin gulch dry for desert trekking?",
            "Slickrock burro packing expedition in San Rafael Swell chute canyon",
            "Can an intermediate paddler safely kayak Skykomish Boulder Drop?",
        ]
        for q in negative_queries:
            assert is_flash_flood_slot_query(q) is False, f"Expected False for: {q}"

    def test_cross_domain_disambiguation_guards(self) -> None:
        flash_flood_queries = [
            "Calculate flash-flood hydrograph and escape ledge height in Buckskin Gulch narrows",
            "Blue-sky flood bore rise rate in Little Wild Horse and Bell Canyon slot",
            "Wadi Mujib siq flash flood wave lag and escape ledge protocol in Jordan",
            "Wadi Ghul Al Nakhar limestone slot canyon flood hydrograph in Oman",
        ]
        for q in flash_flood_queries:
            assert is_flash_flood_slot_query(q) is True
            assert detect_canyoneering_intent(q) is None
            assert detect_pothole_escape_intent(q) is False
            assert detect_canyon_bouldering_intent(q) is None
            assert detect_desert_trekking_intent(q) is None
            assert detect_slickrock_burro_intent(q) is False
            assert detect_mountain_weather_intent(q) is None
            assert detect_whitewater_intent(q) is None
            assert detect_river_rafting_intent(q).intent_detected is False

    def test_extract_flash_flood_slot_params(self) -> None:
        query = (
            "Calculate flash flood hydrograph for Wadi Mujib with 280 km2 catchment area, "
            "35 mm/hr rain, 1.8 m slot width, 5.5 m escape ledge, and 3.2 km to exit"
        )
        params = extract_flash_flood_slot_params(query)
        assert params["site_id"] == "wadi-mujib-siq-jordan"
        assert params["catchment_area_km2"] == 280.0
        assert params["upstream_rain_mm_hr"] == 35.0
        assert params["slot_width_m"] == 1.8
        assert params["escape_ledge_height_m"] == 5.5
        assert params["distance_to_exit_km"] == 3.2


class TestFormattingChatAndStream:
    """Tests for response formatting, prompt builder, chat handler, and SSE stream generator."""

    def test_format_flash_flood_slot_response_actions(self) -> None:
        calc_resp = format_flash_flood_slot_response(
            "Calculate flash flood hydrograph for 400 km2 catchment and 45 mm/hr rain"
        )
        assert calc_resp["action"] == "flash_flood_slot_calculated"
        assert "calculation" in calc_resp
        assert "answer" in calc_resp

        lookup_resp = format_flash_flood_slot_response(
            "Tell me about Little Wild Horse and Bell Canyon flash flood escape ledges"
        )
        assert lookup_resp["action"] == "flash_flood_slot_lookup"
        assert lookup_resp["matched_site"]["id"] == "little-wild-horse-bell-usa"

        info_resp = format_flash_flood_slot_response(
            "What are the general slot canyon flood bore and escape ledge safety guidelines?"
        )
        assert info_resp["action"] == "flash_flood_slot_info"
        assert len(info_resp["sites"]) == 4

    def test_build_flash_flood_slot_prompt(self) -> None:
        prompt = build_flash_flood_slot_prompt(
            "How do I locate escape ledges during a blue-sky flood bore in Wadi Mujib?"
        )
        assert "Flash-Flood" in prompt or "Hydrograph" in prompt
        assert "Wadi Mujib" in prompt
        assert "escape" in prompt.lower() or "discharge" in prompt.lower()

    def test_chat_handler_and_get_chat_response(self) -> None:
        handled = handle_flash_flood_slot_intent(
            "Calculate flash flood hydrograph for Buckskin Gulch with 650 km2 catchment and 30 mm/hr rain"
        )
        assert handled is not None
        assert "flash_flood_slot_info" in handled
        assert "answer" in handled

        assert handle_flash_flood_slot_intent("Check my order refund status") is None

        direct = get_chat_response("Tell me about Wadi Ghul Al Nakhar flash flood slot in Oman")
        assert "flash_flood_slot_info" in direct

    @pytest.mark.anyio
    async def test_stream_events_generators(self) -> None:
        sync_events = list(
            generate_stream_events(
                "Calculate flash flood hydrograph for Wadi Mujib at 30 mm/hr rain"
            )
        )
        assert len(sync_events) >= 3
        assert any("flash_flood_slot_info" in e for e in sync_events)
        assert sync_events[-1] == "data: [DONE]\n\n"

        async_events = []
        async for chunk in generate_flash_flood_slot_stream_events(
            "Navigate Buckskin Gulch flash flood escape ledges"
        ):
            async_events.append(chunk)
        assert len(async_events) >= 3
        assert any("flash_flood_slot_info" in e for e in async_events)
        assert async_events[-1] == "data: [DONE]\n\n"
