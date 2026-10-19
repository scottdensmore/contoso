"""Unit tests for the Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation Guide module."""

import pytest
from contoso_chat.chat import handle_yardang_navigation_intent
from contoso_chat.desert_trekking import detect_desert_trekking_intent
from contoso_chat.flash_flood_slot import detect_flash_flood_slot_intent
from contoso_chat.orienteering import extract_orienteering_intent
from contoso_chat.salt_pan_navigation import is_salt_pan_navigation_query
from contoso_chat.sandboarding import detect_sandboarding_intent
from contoso_chat.scree_running import detect_scree_running_intent
from contoso_chat.slickrock_burro import detect_slickrock_burro_intent
from contoso_chat.stream import generate_yardang_navigation_stream_events
from contoso_chat.tephra_navigation import is_tephra_navigation_query
from contoso_chat.yardang_navigation import (
    YARDANG_DESERT_SITES,
    YARDANG_NAVIGATION_GEAR_CHECKLIST,
    build_yardang_navigation_prompt,
    calculate_yardang_navigation,
    detect_yardang_navigation_intent,
    extract_yardang_navigation_params,
    filter_sites,
    format_yardang_navigation_response,
    generate_stream_events,
    get_all_sites,
    get_all_yardang_navigation_sites,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    get_yardang_navigation_site_by_id,
    is_yardang_navigation_query,
)


class TestYardangDesertSitesCatalog:
    """Tests for the 4-site aeolian yardang & mega-dune desert catalog and lookup/filter functions."""

    def test_get_all_sites_returns_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(YARDANG_DESERT_SITES) == 4
        assert len(get_all_yardang_navigation_sites()) == 4

    def test_site_ids_match_specification(self) -> None:
        ids = {s["id"] for s in get_all_sites()}
        assert ids == {
            "dasht-e-lut-kaluts-iran",
            "badain-jaran-star-dunes-china",
            "lop-nur-yardang-xinjiang-china",
            "borkou-ennedi-yardangs-chad",
        }

    def test_sites_have_required_fields(self) -> None:
        required_fields = {
            "id",
            "name",
            "country",
            "region",
            "morphology",
            "difficulty",
            "default_slip_face_angle_deg",
            "default_wind_speed_kmh",
            "default_corridor_width_m",
            "default_sand_surface_temp_c",
            "default_visibility_m",
            "primary_hazard",
            "routing_strategy",
            "navigation_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_fields.issubset(set(site.keys()))
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.morphology == site["morphology"]

    def test_get_site_by_id_found(self) -> None:
        site = get_site_by_id("dasht-e-lut-kaluts-iran")
        assert site is not None
        assert (
            site["name"] == "Dasht-e Lut Gandom Beryan & Shahr-e Lut Mega-Yardang Kalut Corridors"
        )
        assert site["country"] == "Iran"
        assert site["morphology"] == "kalut-mega-yardang-corridor"
        assert site["difficulty"] == "extreme"

        alias_site = get_yardang_navigation_site_by_id("badain-jaran-star-dunes-china")
        assert alias_site is not None
        assert alias_site["country"] == "China"
        assert alias_site["morphology"] == "star-dune-multi-arm-slipface"
        assert alias_site["difficulty"] == "challenging"

    def test_get_site_by_id_not_found(self) -> None:
        assert get_site_by_id("nonexistent-yardang-site") is None

    def test_filter_sites_by_country(self) -> None:
        china_results = filter_sites(country="China")
        assert len(china_results) == 2
        ids = {s["id"] for s in china_results}
        assert ids == {
            "badain-jaran-star-dunes-china",
            "lop-nur-yardang-xinjiang-china",
        }

        iran_results = filter_sites(country="Iran")
        assert len(iran_results) == 1
        assert iran_results[0]["id"] == "dasht-e-lut-kaluts-iran"

        chad_results = filter_sites(country="Chad")
        assert len(chad_results) == 1
        assert chad_results[0]["id"] == "borkou-ennedi-yardangs-chad"

    def test_filter_sites_by_morphology(self) -> None:
        results = filter_sites(morphology="kalut-mega-yardang-corridor")
        assert len(results) == 1
        assert results[0]["id"] == "dasht-e-lut-kaluts-iran"

        star_results = filter_sites(morphology="star-dune-multi-arm-slipface")
        assert len(star_results) == 1
        assert star_results[0]["id"] == "badain-jaran-star-dunes-china"

    def test_filter_sites_by_difficulty(self) -> None:
        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 2
        challenging = filter_sites(difficulty="challenging")
        assert len(challenging) == 2

    def test_filter_sites_by_search(self) -> None:
        results = filter_sites(search="Bilutu")
        assert len(results) == 1
        assert results[0]["id"] == "badain-jaran-star-dunes-china"

        lop_results = filter_sites(search="Lop Nur")
        assert len(lop_results) == 1
        assert lop_results[0]["id"] == "lop-nur-yardang-xinjiang-china"


class TestYardangNavigationCalculator:
    """Tests for the Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation Calculator."""

    def test_low_risk_calculation_windward_rib_and_gassi_corridor(self) -> None:
        result = calculate_yardang_navigation(
            slip_face_angle_deg=18.0,
            wind_speed_kmh=15.0,
            corridor_width_m=120.0,
            sand_surface_temp_c=28.0,
            visibility_m=1200.0,
        )
        assert result["risk_level"] == "low"
        assert result["safety_status"] == "low"
        assert result["avalanche_slip_safety_factor"] >= 1.45
        assert result["venturi_wind_acceleration_ratio"] >= 1.0
        assert result["triboelectric_gnss_noise_index"] < 3.0
        assert result["stride_sinkage_energy_multiplier"] >= 1.0
        assert isinstance(result["routing_strategy"], str)
        assert isinstance(result["warnings"], list)
        assert len(result["recommendations"]) >= 1

    def test_moderate_risk_calculation(self) -> None:
        result = calculate_yardang_navigation(
            slip_face_angle_deg=28.0,
            wind_speed_kmh=38.0,
            corridor_width_m=45.0,
            sand_surface_temp_c=42.0,
            visibility_m=450.0,
        )
        assert result["risk_level"] == "moderate"
        assert len(result["recommendations"]) >= 1

    def test_high_risk_calculation(self) -> None:
        result = calculate_yardang_navigation(
            slip_face_angle_deg=33.5,
            wind_speed_kmh=68.0,
            corridor_width_m=18.0,
            sand_surface_temp_c=54.0,
            visibility_m=120.0,
        )
        assert result["risk_level"] == "high"
        assert len(result["warnings"]) >= 1

    def test_critical_risk_calculation_haboob_and_grainflow_avalanche(self) -> None:
        result = calculate_yardang_navigation(
            slip_face_angle_deg=38.0,
            wind_speed_kmh=105.0,
            corridor_width_m=6.0,
            sand_surface_temp_c=66.0,
            visibility_m=15.0,
        )
        assert result["risk_level"] == "critical"
        assert result["safety_status"] == "critical"
        assert result["avalanche_slip_safety_factor"] < 0.95
        assert result["venturi_wind_acceleration_ratio"] >= 1.8
        assert result["triboelectric_gnss_noise_index"] >= 7.0
        assert result["stride_sinkage_energy_multiplier"] >= 2.2
        assert len(result["warnings"]) >= 2

    def test_monotonic_physics_relationships(self) -> None:
        calm_corridor = calculate_yardang_navigation(
            slip_face_angle_deg=20.0,
            wind_speed_kmh=18.0,
            corridor_width_m=110.0,
            sand_surface_temp_c=30.0,
            visibility_m=1000.0,
        )
        severe_corridor = calculate_yardang_navigation(
            slip_face_angle_deg=36.0,
            wind_speed_kmh=95.0,
            corridor_width_m=8.0,
            sand_surface_temp_c=62.0,
            visibility_m=25.0,
        )
        assert (
            severe_corridor["avalanche_slip_safety_factor"]
            < calm_corridor["avalanche_slip_safety_factor"]
        )
        assert (
            severe_corridor["venturi_wind_acceleration_ratio"]
            > calm_corridor["venturi_wind_acceleration_ratio"]
        )
        assert (
            severe_corridor["triboelectric_gnss_noise_index"]
            > calm_corridor["triboelectric_gnss_noise_index"]
        )
        assert (
            severe_corridor["stride_sinkage_energy_multiplier"]
            > calm_corridor["stride_sinkage_energy_multiplier"]
        )

    def test_validation_out_of_bounds_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="slip_face_angle_deg"):
            calculate_yardang_navigation(
                slip_face_angle_deg=8.0,
                wind_speed_kmh=30.0,
                corridor_width_m=25.0,
            )
        with pytest.raises(ValueError, match="slip_face_angle_deg"):
            calculate_yardang_navigation(
                slip_face_angle_deg=45.0,
                wind_speed_kmh=30.0,
                corridor_width_m=25.0,
            )
        with pytest.raises(ValueError, match="wind_speed_kmh"):
            calculate_yardang_navigation(
                slip_face_angle_deg=30.0,
                wind_speed_kmh=-5.0,
                corridor_width_m=25.0,
            )
        with pytest.raises(ValueError, match="wind_speed_kmh"):
            calculate_yardang_navigation(
                slip_face_angle_deg=30.0,
                wind_speed_kmh=145.0,
                corridor_width_m=25.0,
            )
        with pytest.raises(ValueError, match="corridor_width_m"):
            calculate_yardang_navigation(
                slip_face_angle_deg=30.0,
                wind_speed_kmh=30.0,
                corridor_width_m=1.0,
            )
        with pytest.raises(ValueError, match="corridor_width_m"):
            calculate_yardang_navigation(
                slip_face_angle_deg=30.0,
                wind_speed_kmh=30.0,
                corridor_width_m=300.0,
            )
        with pytest.raises(ValueError, match="sand_surface_temp_c"):
            calculate_yardang_navigation(
                slip_face_angle_deg=30.0,
                wind_speed_kmh=30.0,
                corridor_width_m=25.0,
                sand_surface_temp_c=5.0,
            )
        with pytest.raises(ValueError, match="sand_surface_temp_c"):
            calculate_yardang_navigation(
                slip_face_angle_deg=30.0,
                wind_speed_kmh=30.0,
                corridor_width_m=25.0,
                sand_surface_temp_c=80.0,
            )
        with pytest.raises(ValueError, match="visibility_m"):
            calculate_yardang_navigation(
                slip_face_angle_deg=30.0,
                wind_speed_kmh=30.0,
                corridor_width_m=25.0,
                visibility_m=2.0,
            )
        with pytest.raises(ValueError, match="visibility_m"):
            calculate_yardang_navigation(
                slip_face_angle_deg=30.0,
                wind_speed_kmh=30.0,
                corridor_width_m=25.0,
                visibility_m=2500.0,
            )


class TestGearChecklist:
    """Tests for the 6-item mandatory aeolian yardang & mega-dune navigation gear checklist."""

    def test_get_gear_checklist_returns_six_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(YARDANG_NAVIGATION_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert "item" in item
            assert "category" in item
            assert "priority" in item
            assert "rationale" in item
            assert item["priority"] == "essential"


class TestIntentDetectionAndDisambiguation:
    """Tests for yardang navigation intent detection, parameter extraction, and cross-domain disambiguation."""

    def test_positive_yardang_navigation_intent_queries(self) -> None:
        positive_queries = [
            "How do I navigate the mega-yardang kalut corridors in Dasht-e Lut Gandom Beryan, Iran?",
            "Calculate yardang navigation avalanche slip safety factor and venturi wind acceleration for a 34 deg slip-face and 70 km/h wind in an 18 m corridor",
            "What gear do I need for Badain Jaran Bilutu Peak star-dune multi-arm slipface navigation in China?",
            "Tell me about Lop Nur and Dunhuang Yadan Pleistocene lacustrine yardang fleet in Xinjiang",
            "How to traverse Borkou-Tibesti sandstone yardang wind-tunnels and barchanoid gassi corridors in Erg Djourab, Chad?",
            "Aeolian corridor triboelectric GNSS noise and mega-dune slip-face sinkage at 58 C sand surface temperature",
        ]
        for q in positive_queries:
            assert is_yardang_navigation_query(q) is True, f"Expected True for: {q}"
            assert detect_yardang_navigation_intent(q) is True, f"Expected True for: {q}"

    def test_negative_and_excluded_queries(self) -> None:
        negative_queries = [
            "",
            "   ",
            "Where is my order #12345?",
            "I want a refund for my desert gaiters",
            "What is the top speed on Great Sand Dunes star dune slipface with silicone speed wax?",
            "How do we cross the Salar de Uyuni polygonal halite crust and salt pan?",
            "Tell me about the Badwater Basin to Telescope Peak desert trekking route",
            "What is the flood wave lag time in Buckskin Gulch slot canyon during upstream rain?",
            "How do I take a compass bearing on the Harriman Silvermine orienteering course?",
            "Calculate scree running velocity on Mount Sneffels pea scree",
            "What respirator do I need for volcanic tephra and cristobalite ash on Mount Yasur?",
        ]
        for q in negative_queries:
            assert is_yardang_navigation_query(q) is False, f"Expected False for: {q}"

    def test_cross_domain_disambiguation_guards(self) -> None:
        yardang_queries = [
            "Navigate Dasht-e Lut Gandom Beryan kalut mega-yardang corridors in Iran with 75 km/h venturi wind",
            "Calculate slip-face avalanche safety factor on Badain Jaran Bilutu Peak mega-star-dune in China",
            "Lop Nur and Dunhuang Yadan lacustrine mudstone yardang fleet compass dead reckoning in Xinjiang",
            "Borkou-Ennedi sandstone yardang wind-tunnels and barchanoid gassi navigation in Erg Djourab Chad",
        ]
        for q in yardang_queries:
            assert is_yardang_navigation_query(q) is True
            assert detect_desert_trekking_intent(q) is None
            assert detect_sandboarding_intent(q) is None
            assert is_salt_pan_navigation_query(q) is False
            assert detect_slickrock_burro_intent(q) is False
            assert detect_flash_flood_slot_intent(q) is False
            assert extract_orienteering_intent(q) is None
            assert detect_scree_running_intent(q) is False
            assert is_tephra_navigation_query(q) is False

    def test_extract_yardang_navigation_params(self) -> None:
        query = (
            "Calculate yardang navigation risk for Dasht-e Lut kaluts in Iran with 35 deg slip-face angle, "
            "72 km/h wind speed, 14 m corridor width, 61 C sand surface temp, and 85 m visibility"
        )
        params = extract_yardang_navigation_params(query)
        assert params["site_id"] == "dasht-e-lut-kaluts-iran"
        assert params["slip_face_angle_deg"] == 35.0
        assert params["wind_speed_kmh"] == 72.0
        assert params["corridor_width_m"] == 14.0
        assert params["sand_surface_temp_c"] == 61.0
        assert params["visibility_m"] == 85.0


class TestFormattingChatAndStream:
    """Tests for response formatting, prompt builder, chat handler, and SSE stream generator."""

    def test_format_yardang_navigation_response_actions(self) -> None:
        calc_resp = format_yardang_navigation_response(
            "Calculate yardang navigation avalanche slip safety factor for 34 deg slip-face angle, 65 km/h wind, and 18 m corridor width"
        )
        assert calc_resp["action"] == "yardang_navigation_calculated"
        assert "calculation" in calc_resp
        assert "answer" in calc_resp

        lookup_resp = format_yardang_navigation_response(
            "Tell me about Badain Jaran Bilutu Peak mega-star-dune and interdune lakes in China"
        )
        assert lookup_resp["action"] == "yardang_navigation_lookup"
        assert lookup_resp["matched_site"]["id"] == "badain-jaran-star-dunes-china"

        info_resp = format_yardang_navigation_response(
            "What are the general aeolian yardang corridor and mega-dune slip-face navigation guidelines?"
        )
        assert info_resp["action"] == "yardang_navigation_info"
        assert len(info_resp["sites"]) == 4

    def test_build_yardang_navigation_prompt(self) -> None:
        prompt = build_yardang_navigation_prompt(
            "How do I avoid slip-face grainflow avalanches and venturi wind acceleration in Dasht-e Lut kaluts?"
        )
        assert "Yardang" in prompt or "Dasht-e Lut" in prompt
        assert "slip" in prompt.lower() or "venturi" in prompt.lower()

    def test_chat_handler_and_get_chat_response(self) -> None:
        handled = handle_yardang_navigation_intent(
            "Calculate yardang navigation risk for Dasht-e Lut kaluts with 34 deg slip-face angle and 68 km/h wind"
        )
        assert handled is not None
        assert "yardang_navigation_info" in handled
        assert "answer" in handled

        assert handle_yardang_navigation_intent("Check my order refund status") is None

        direct = get_chat_response("Tell me about Borkou-Ennedi yardangs and Erg Djourab in Chad")
        assert "yardang_navigation_info" in direct

    @pytest.mark.anyio
    async def test_stream_events_generators(self) -> None:
        sync_events = list(
            generate_stream_events(
                "Calculate yardang navigation venturi wind ratio for Lop Nur yardang fleet at 80 km/h wind"
            )
        )
        assert len(sync_events) >= 3
        assert any("yardang_navigation_info" in e for e in sync_events)
        assert sync_events[-1] == "data: [DONE]\n\n"

        async_events = []
        async for chunk in generate_yardang_navigation_stream_events(
            "Navigate Dasht-e Lut kalut mega-yardang corridors in Iran"
        ):
            async_events.append(chunk)
        assert len(async_events) >= 3
        assert any("yardang_navigation_info" in e for e in async_events)
        assert async_events[-1] == "data: [DONE]\n\n"
