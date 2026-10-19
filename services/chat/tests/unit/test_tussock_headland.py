"""Unit tests for the Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation Guide module."""

import pytest
from contoso_chat.bog_shoeing import detect_bog_shoeing_intent
from contoso_chat.chat import handle_tussock_headland_intent
from contoso_chat.coasteering import detect_coasteering_intent
from contoso_chat.cobble_spit_trekking import detect_cobble_spit_trekking_intent
from contoso_chat.krummholz_bushwhack import detect_krummholz_bushwhack_intent
from contoso_chat.leave_no_trace import detect_lnt_intent
from contoso_chat.mountain_weather import detect_mountain_weather_intent
from contoso_chat.paramo_navigation import detect_paramo_navigation_intent
from contoso_chat.stream import generate_tussock_headland_stream_events
from contoso_chat.tundra_lichen import detect_tundra_lichen_intent
from contoso_chat.tussock_headland import (
    TUSSOCK_HEADLAND_GEAR_CHECKLIST,
    TUSSOCK_HEADLAND_SITES,
    build_tussock_headland_prompt,
    calculate_tussock_headland,
    detect_tussock_headland_intent,
    extract_tussock_headland_params,
    filter_sites,
    format_tussock_headland_response,
    generate_stream_events,
    get_all_sites,
    get_all_tussock_headland_sites,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    get_tussock_headland_site_by_id,
    is_tussock_headland_query,
)
from contoso_chat.wildlife import detect_wildlife_intent


class TestTussockHeadlandSitesCatalog:
    """Tests for the 4-site subantarctic tussock headland catalog and lookup/filter functions."""

    def test_get_all_sites_returns_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(TUSSOCK_HEADLAND_SITES) == 4
        assert len(get_all_tussock_headland_sites()) == 4

    def test_site_ids_match_specification(self) -> None:
        ids = {s["id"] for s in get_all_sites()}
        assert ids == {
            "fortuna-bay-stromness-south-georgia",
            "macquarie-island-featherbed-australia",
            "enderby-island-megaherb-auckland-nz",
            "kerguelen-courbet-azorella-france",
        }

    def test_sites_have_required_fields(self) -> None:
        required_fields = {
            "id",
            "name",
            "country",
            "region",
            "morphology",
            "difficulty",
            "default_pedestal_height_m",
            "default_katabatic_wind_kmh",
            "default_wallow_trench_depth_cm",
            "default_ambient_temp_c",
            "default_seal_density_per_ha",
            "primary_hazard",
            "navigation_protocol",
            "fauna_avoidance_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_fields.issubset(set(site.keys()))
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.morphology == site["morphology"]

    def test_get_site_by_id_found(self) -> None:
        site = get_site_by_id("fortuna-bay-stromness-south-georgia")
        assert site is not None
        assert site["name"] == "Fortuna Bay & Shackleton Gap Poa flabellata Tussock Headland"
        assert site["country"] == "United Kingdom"
        assert site["morphology"] == "poa-flabellata-pedestal-maze"
        assert site["difficulty"] == "extreme"

        alias_site = get_tussock_headland_site_by_id("macquarie-island-featherbed-australia")
        assert alias_site is not None
        assert alias_site["country"] == "Australia"
        assert alias_site["morphology"] == "seal-wallow-bog-trench-apron"
        assert alias_site["difficulty"] == "challenging"

    def test_get_site_by_id_not_found(self) -> None:
        assert get_site_by_id("nonexistent-tussock-site") is None

    def test_filter_sites_by_country(self) -> None:
        results = filter_sites(country="New Zealand")
        assert len(results) == 1
        assert results[0]["id"] == "enderby-island-megaherb-auckland-nz"

    def test_filter_sites_by_morphology(self) -> None:
        results = filter_sites(morphology="azorella-feldmark-katabatic-ridge")
        assert len(results) == 1
        assert results[0]["id"] == "kerguelen-courbet-azorella-france"

    def test_filter_sites_by_difficulty(self) -> None:
        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 1
        assert extreme[0]["id"] == "fortuna-bay-stromness-south-georgia"
        challenging = filter_sites(difficulty="challenging")
        assert len(challenging) == 2
        moderate = filter_sites(difficulty="moderate")
        assert len(moderate) == 1
        assert moderate[0]["id"] == "kerguelen-courbet-azorella-france"

    def test_filter_sites_by_search(self) -> None:
        results = filter_sites(search="Featherbed")
        assert len(results) == 1
        assert results[0]["id"] == "macquarie-island-featherbed-australia"


class TestTussockHeadlandCalculator:
    """Tests for the Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Calculator."""

    def test_low_risk_calculation_open_feldmark_ridge(self) -> None:
        result = calculate_tussock_headland(
            pedestal_height_m=0.4,
            katabatic_wind_kmh=22.0,
            wallow_trench_depth_cm=15.0,
            ambient_temp_c=8.0,
            seal_density_per_ha=4.0,
        )
        assert result["risk_level"] == "low"
        assert result["safety_status"] == "low"
        assert result["routing_strategy"] == "open-feldmark-compass-ridge-transit"
        assert result["katabatic_knockdown_index"] < 3.0
        assert result["inter_pedestal_pit_entrapment_pct"] < 25.0
        assert result["wind_chill_effective_c"] > 0.0
        assert result["fauna_encounter_detour_multiplier"] >= 1.0
        assert isinstance(result["warnings"], list)
        assert len(result["recommendations"]) >= 1

    def test_moderate_risk_calculation_inter_pedestal_weave(self) -> None:
        result = calculate_tussock_headland(
            pedestal_height_m=1.1,
            katabatic_wind_kmh=52.0,
            wallow_trench_depth_cm=45.0,
            ambient_temp_c=4.0,
            seal_density_per_ha=18.0,
        )
        assert result["risk_level"] == "moderate"
        assert result["routing_strategy"] == "inter-pedestal-sounding-pole-channel-weave"
        assert len(result["recommendations"]) >= 1

    def test_high_risk_calculation_leeward_terrace_contour(self) -> None:
        result = calculate_tussock_headland(
            pedestal_height_m=1.8,
            katabatic_wind_kmh=88.0,
            wallow_trench_depth_cm=95.0,
            ambient_temp_c=1.0,
            seal_density_per_ha=52.0,
        )
        assert result["risk_level"] == "high"
        assert result["routing_strategy"] == "leeward-terrace-contour-fauna-detour"
        assert len(result["warnings"]) >= 1

    def test_critical_risk_williwaw_abort_lockout(self) -> None:
        result = calculate_tussock_headland(
            pedestal_height_m=2.6,
            katabatic_wind_kmh=135.0,
            wallow_trench_depth_cm=155.0,
            ambient_temp_c=-8.0,
            seal_density_per_ha=95.0,
        )
        assert result["risk_level"] == "critical"
        assert result["safety_status"] == "critical"
        assert result["routing_strategy"] == "abort-williwaw-bivy-and-wallow-lockout"
        assert result["inter_pedestal_pit_entrapment_pct"] >= 75.0
        assert result["katabatic_knockdown_index"] >= 8.0
        assert len(result["warnings"]) >= 2

    def test_monotonic_physics_relationships(self) -> None:
        # Taller pedestals and deeper wallow trenches increase pit entrapment % and detour multiplier
        shallow = calculate_tussock_headland(
            pedestal_height_m=0.5,
            katabatic_wind_kmh=40.0,
            wallow_trench_depth_cm=20.0,
            ambient_temp_c=5.0,
            seal_density_per_ha=10.0,
        )
        deep_labyrinth = calculate_tussock_headland(
            pedestal_height_m=2.4,
            katabatic_wind_kmh=40.0,
            wallow_trench_depth_cm=140.0,
            ambient_temp_c=5.0,
            seal_density_per_ha=75.0,
        )
        assert (
            deep_labyrinth["inter_pedestal_pit_entrapment_pct"]
            > shallow["inter_pedestal_pit_entrapment_pct"]
        )
        assert (
            deep_labyrinth["fauna_encounter_detour_multiplier"]
            > shallow["fauna_encounter_detour_multiplier"]
        )

        # Higher katabatic wind increases knockdown index and lowers effective wind chill
        calm = calculate_tussock_headland(
            pedestal_height_m=1.2,
            katabatic_wind_kmh=15.0,
            wallow_trench_depth_cm=40.0,
            ambient_temp_c=2.0,
            seal_density_per_ha=15.0,
        )
        gale = calculate_tussock_headland(
            pedestal_height_m=1.2,
            katabatic_wind_kmh=125.0,
            wallow_trench_depth_cm=40.0,
            ambient_temp_c=2.0,
            seal_density_per_ha=15.0,
        )
        assert gale["katabatic_knockdown_index"] > calm["katabatic_knockdown_index"]
        assert gale["wind_chill_effective_c"] < calm["wind_chill_effective_c"]

    def test_validation_out_of_bounds_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="pedestal_height_m"):
            calculate_tussock_headland(pedestal_height_m=0.05)
        with pytest.raises(ValueError, match="pedestal_height_m"):
            calculate_tussock_headland(pedestal_height_m=3.5)
        with pytest.raises(ValueError, match="katabatic_wind_kmh"):
            calculate_tussock_headland(katabatic_wind_kmh=-5.0)
        with pytest.raises(ValueError, match="katabatic_wind_kmh"):
            calculate_tussock_headland(katabatic_wind_kmh=180.0)
        with pytest.raises(ValueError, match="wallow_trench_depth_cm"):
            calculate_tussock_headland(wallow_trench_depth_cm=-10.0)
        with pytest.raises(ValueError, match="wallow_trench_depth_cm"):
            calculate_tussock_headland(wallow_trench_depth_cm=210.0)
        with pytest.raises(ValueError, match="ambient_temp_c"):
            calculate_tussock_headland(ambient_temp_c=-20.0)
        with pytest.raises(ValueError, match="ambient_temp_c"):
            calculate_tussock_headland(ambient_temp_c=25.0)
        with pytest.raises(ValueError, match="seal_density_per_ha"):
            calculate_tussock_headland(seal_density_per_ha=-1.0)
        with pytest.raises(ValueError, match="seal_density_per_ha"):
            calculate_tussock_headland(seal_density_per_ha=150.0)


class TestGearChecklist:
    """Tests for the 6-item mandatory subantarctic tussock headland gear checklist."""

    def test_get_gear_checklist_returns_six_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(TUSSOCK_HEADLAND_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert "item" in item
            assert "category" in item
            assert "priority" in item
            assert "rationale" in item
            assert item["priority"] == "essential"


class TestIntentDetectionAndDisambiguation:
    """Tests for tussock headland intent detection, parameter extraction, and cross-domain disambiguation."""

    def test_positive_tussock_headland_intent_queries(self) -> None:
        positive_queries = [
            "How do I navigate the Poa flabellata tussock pedestal maze at Fortuna Bay and Shackleton Gap in South Georgia?",
            "Calculate tussock headland katabatic knockdown index and pit entrapment for 2.1 m pedestals and 95 km/h katabatic wind",
            "What gear do I need for Macquarie Island Featherbed peat terrace and seal wallow bog trenches?",
            "Tell me about Enderby Island Chionochloa tussock and megaherb peat bog navigation in the Auckland Islands",
            "How to cross Péninsule Courbet Azorella feldmark katabatic ridge in the Kerguelen Islands during a williwaw?",
            "Subantarctic tussock headland route planning with 35 seals/ha and 80 cm wallow trench depth",
        ]
        for q in positive_queries:
            assert is_tussock_headland_query(q) is True, f"Expected True for: {q}"
            assert detect_tussock_headland_intent(q) is True, f"Expected True for: {q}"

    def test_negative_and_excluded_queries(self) -> None:
        negative_queries = [
            "",
            "   ",
            "Where is my order #12345?",
            "I want a refund for my gaiters",
            "What bog shoeing flotation index do I need for Algonquin Highland tussock fen in Ontario?",
            "How do I navigate Espeletia frailejón tussock matrix in Sumapaz páramo Colombia?",
            "Calculate krummholz bushwhack velocity in Presidential Range Abies balsamea fir waves",
            "What is the mucilage slip coefficient for Dungeness Spit cobble spit trekking?",
            "How do I use bear spray during a grizzly bear wildlife encounter in Yellowstone?",
        ]
        for q in negative_queries:
            assert is_tussock_headland_query(q) is False, f"Expected False for: {q}"

    def test_cross_domain_disambiguation_guards(self) -> None:
        tussock_queries = [
            "Navigate Poa flabellata tussock pedestals and fur seal wallow trenches at Fortuna Bay South Georgia",
            "Calculate katabatic wind knockdown and peat bog wallow entrapment on Macquarie Island Featherbed terrace",
            "Enderby Island Auckland Islands subantarctic Chionochloa tussock and megaherb peat terrace biosecurity",
            "Kerguelen Péninsule Courbet Azorella selago feldmark katabatic headland williwaw squall navigation",
        ]
        for q in tussock_queries:
            assert is_tussock_headland_query(q) is True
            assert detect_bog_shoeing_intent(q) is False
            assert detect_paramo_navigation_intent(q) is False
            assert detect_tundra_lichen_intent(q) is False
            assert detect_krummholz_bushwhack_intent(q) is False
            assert detect_coasteering_intent(q) is None
            assert detect_cobble_spit_trekking_intent(q) is False
            assert detect_wildlife_intent(q) is None
            assert detect_mountain_weather_intent(q) is None
            assert detect_lnt_intent(q) is None

    def test_extract_tussock_headland_params(self) -> None:
        query = (
            "Calculate tussock headland risk for Fortuna Bay South Georgia with 2.2 m pedestal height, "
            "95 km/h katabatic wind, 85 cm wallow trench depth, 1.5 C ambient temp, and 42 seals/ha"
        )
        params = extract_tussock_headland_params(query)
        assert params["site_id"] == "fortuna-bay-stromness-south-georgia"
        assert params["pedestal_height_m"] == 2.2
        assert params["katabatic_wind_kmh"] == 95.0
        assert params["wallow_trench_depth_cm"] == 85.0
        assert params["ambient_temp_c"] == 1.5
        assert params["seal_density_per_ha"] == 42.0


class TestFormattingChatAndStream:
    """Tests for response formatting, prompt builder, chat handler, and SSE stream generator."""

    def test_format_tussock_headland_response_actions(self) -> None:
        calc_resp = format_tussock_headland_response(
            "Calculate tussock headland knockdown index for 1.8 m pedestals and 85 km/h katabatic wind"
        )
        assert calc_resp["action"] == "tussock_headland_calculated"
        assert "calculation" in calc_resp
        assert "answer" in calc_resp

        lookup_resp = format_tussock_headland_response(
            "Tell me about Macquarie Island Featherbed peat terrace in Australia"
        )
        assert lookup_resp["action"] == "tussock_headland_lookup"
        assert lookup_resp["matched_site"]["id"] == "macquarie-island-featherbed-australia"

        info_resp = format_tussock_headland_response(
            "What are the general subantarctic tussock headland and seal wallow navigation guidelines?"
        )
        assert info_resp["action"] == "tussock_headland_info"
        assert len(info_resp["sites"]) == 4

    def test_build_tussock_headland_prompt(self) -> None:
        prompt = build_tussock_headland_prompt(
            "How do I avoid fur seal wallow traps in Fortuna Bay Poa flabellata tussock?"
        )
        assert "Tussock" in prompt
        assert "Fortuna Bay" in prompt
        assert "katabatic" in prompt.lower() or "wallow" in prompt.lower()

    def test_chat_handler_and_get_chat_response(self) -> None:
        handled = handle_tussock_headland_intent(
            "Calculate tussock headland risk for Fortuna Bay with 2.0 m pedestals and 90 km/h wind"
        )
        assert handled is not None
        assert "tussock_headland_info" in handled
        assert "answer" in handled

        assert handle_tussock_headland_intent("Check my order refund status") is None

        direct = get_chat_response(
            "Tell me about Enderby Island megaherb bog in the Auckland Islands"
        )
        assert "tussock_headland_info" in direct

    @pytest.mark.anyio
    async def test_stream_events_generators(self) -> None:
        sync_events = list(
            generate_stream_events(
                "Calculate tussock headland knockdown for Macquarie Island Featherbed at 80 km/h katabatic wind"
            )
        )
        assert len(sync_events) >= 3
        assert any("tussock_headland_info" in e for e in sync_events)
        assert sync_events[-1] == "data: [DONE]\n\n"

        async_events = []
        async for chunk in generate_tussock_headland_stream_events(
            "Navigate Fortuna Bay Poa flabellata tussock headland in South Georgia"
        ):
            async_events.append(chunk)
        assert len(async_events) >= 3
        assert any("tussock_headland_info" in e for e in async_events)
        assert async_events[-1] == "data: [DONE]\n\n"
