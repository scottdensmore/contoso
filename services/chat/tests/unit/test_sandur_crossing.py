"""Unit tests for the Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing Guide module."""

import pytest
from contoso_chat.aufeis_crossing import detect_aufeis_crossing_intent
from contoso_chat.canoe_expedition import extract_canoe_intent
from contoso_chat.chat import handle_sandur_crossing_intent
from contoso_chat.cobble_spit_trekking import detect_cobble_spit_trekking_intent
from contoso_chat.flash_flood_slot import detect_flash_flood_slot_intent
from contoso_chat.glacier_navigation import detect_glacier_intent
from contoso_chat.mudflat_trekking import detect_mudflat_intent
from contoso_chat.packrafting import detect_packrafting_intent
from contoso_chat.river_rafting import detect_river_rafting_intent
from contoso_chat.river_sup import detect_river_sup_intent
from contoso_chat.rock_glacier_navigation import detect_rock_glacier_navigation_intent
from contoso_chat.sandur_crossing import (
    SANDUR_CROSSING_GEAR_CHECKLIST,
    SANDUR_CROSSING_SITES,
    build_sandur_crossing_prompt,
    calculate_sandur_crossing,
    detect_sandur_crossing_intent,
    extract_sandur_crossing_params,
    filter_sites,
    format_sandur_crossing_response,
    generate_stream_events,
    get_all_sandur_crossing_sites,
    get_all_sites,
    get_chat_response,
    get_gear_checklist,
    get_sandur_crossing_site_by_id,
    get_site_by_id,
    is_sandur_crossing_query,
)
from contoso_chat.stream import generate_sandur_crossing_stream_events
from contoso_chat.whitewater import detect_whitewater_intent


class TestSandurCrossingSitesCatalog:
    """Tests for the 4-site sandur crossing catalog and lookup/filter functions."""

    def test_get_all_sites_returns_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(SANDUR_CROSSING_SITES) == 4
        assert len(get_all_sandur_crossing_sites()) == 4

    def test_site_ids_match_specification(self) -> None:
        ids = {s["id"] for s in get_all_sites()}
        assert ids == {
            "skeidararsandur-krossa-iceland",
            "slim-river-kaskawulsh-canada",
            "rakaia-gorge-braids-nz",
            "copper-river-sheridan-alaska-usa",
        }

    def test_sites_have_required_fields(self) -> None:
        required_fields = {
            "id",
            "name",
            "country",
            "region",
            "morphology",
            "difficulty",
            "default_water_depth_m",
            "default_flow_velocity_ms",
            "default_hour_of_day_24",
            "default_silt_flour_concentration_mg_l",
            "default_hiker_mass_kg",
            "quicksand_protocol",
            "primary_hazard",
            "navigation_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_fields.issubset(set(site.keys()))
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.morphology == site["morphology"]

    def test_get_site_by_id_found(self) -> None:
        site = get_site_by_id("skeidararsandur-krossa-iceland")
        assert site is not None
        assert site["name"] == "Skeiðarársandur & Þórsmörk Krossá Braided Outwash Plain"
        assert site["country"] == "Iceland"
        assert site["morphology"] == "jokulhlaup-basalt-sandur"
        assert site["difficulty"] == "extreme"

        alias_site = get_sandur_crossing_site_by_id("slim-river-kaskawulsh-canada")
        assert alias_site is not None
        assert alias_site["country"] == "Canada"
        assert alias_site["morphology"] == "anastomosing-glacial-silt-braid"
        assert alias_site["difficulty"] == "challenging"

    def test_get_site_by_id_not_found(self) -> None:
        assert get_site_by_id("nonexistent-sandur-site") is None

    def test_filter_sites_by_country(self) -> None:
        results = filter_sites(country="New Zealand")
        assert len(results) == 1
        assert results[0]["id"] == "rakaia-gorge-braids-nz"

    def test_filter_sites_by_morphology(self) -> None:
        results = filter_sites(morphology="tidal-estuarine-glacial-delta")
        assert len(results) == 1
        assert results[0]["id"] == "copper-river-sheridan-alaska-usa"

    def test_filter_sites_by_difficulty(self) -> None:
        challenging = filter_sites(difficulty="challenging")
        assert len(challenging) == 2
        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 1
        assert extreme[0]["id"] == "skeidararsandur-krossa-iceland"
        moderate = filter_sites(difficulty="moderate")
        assert len(moderate) == 1
        assert moderate[0]["id"] == "copper-river-sheridan-alaska-usa"

    def test_filter_sites_by_search(self) -> None:
        results = filter_sites(search="Kaskawulsh")
        assert len(results) == 1
        assert results[0]["id"] == "slim-river-kaskawulsh-canada"


class TestSandurCrossingCalculator:
    """Tests for the Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing Calculator."""

    def test_low_risk_calculation_dawn_shallow_riffle(self) -> None:
        result = calculate_sandur_crossing(
            water_depth_m=0.25,
            flow_velocity_ms=0.7,
            hour_of_day_24=5,
            silt_flour_concentration_mg_l=250.0,
            hiker_mass_kg=80.0,
        )
        assert result["risk_level"] == "low"
        assert result["safety_status"] == "low"
        assert result["crossing_technique"] == "solo-diagonal-pole-riffle-stride"
        assert result["hydrodynamic_momentum_product"] < 0.45
        assert result["quicksand_liquefaction_index"] < 30.0
        assert result["diurnal_discharge_multiplier"] <= 1.05
        assert result["bedload_boulder_roll_risk_pct"] < 25.0
        assert isinstance(result["warnings"], list)
        assert len(result["recommendations"]) >= 1

    def test_moderate_risk_calculation_tripod_pole_ferry(self) -> None:
        result = calculate_sandur_crossing(
            water_depth_m=0.48,
            flow_velocity_ms=1.25,
            hour_of_day_24=9,
            silt_flour_concentration_mg_l=900.0,
            hiker_mass_kg=75.0,
        )
        assert result["risk_level"] == "moderate"
        assert result["crossing_technique"] == "tripod-pole-eddy-line-ferry"
        assert result["hydrodynamic_momentum_product"] >= 0.40
        assert len(result["recommendations"]) >= 1

    def test_high_risk_calculation_mutual_support_wedge(self) -> None:
        result = calculate_sandur_crossing(
            water_depth_m=0.68,
            flow_velocity_ms=1.75,
            hour_of_day_24=13,
            silt_flour_concentration_mg_l=1900.0,
            hiker_mass_kg=72.0,
        )
        assert result["risk_level"] == "high"
        assert result["crossing_technique"] == "mutual-support-linked-wedge-formation"
        assert len(result["warnings"]) >= 1

    def test_critical_risk_afternoon_surge_abort_until_dawn(self) -> None:
        result = calculate_sandur_crossing(
            water_depth_m=1.15,
            flow_velocity_ms=2.8,
            hour_of_day_24=16,
            silt_flour_concentration_mg_l=3800.0,
            hiker_mass_kg=65.0,
        )
        assert result["risk_level"] == "critical"
        assert result["safety_status"] == "critical"
        assert result["crossing_technique"] == "abort-bivouac-until-dawn-minimum"
        assert result["hydrodynamic_momentum_product"] >= 1.5
        assert result["quicksand_liquefaction_index"] >= 65.0
        assert result["diurnal_discharge_multiplier"] >= 1.35
        assert result["bedload_boulder_roll_risk_pct"] >= 65.0
        assert len(result["warnings"]) >= 2

    def test_monotonic_physics_relationships(self) -> None:
        # Deeper & faster flow increases hydrodynamic momentum product and bedload boulder roll risk
        gentle = calculate_sandur_crossing(
            water_depth_m=0.30,
            flow_velocity_ms=0.8,
            hour_of_day_24=7,
            silt_flour_concentration_mg_l=600.0,
            hiker_mass_kg=75.0,
        )
        torrent = calculate_sandur_crossing(
            water_depth_m=0.95,
            flow_velocity_ms=2.4,
            hour_of_day_24=7,
            silt_flour_concentration_mg_l=600.0,
            hiker_mass_kg=75.0,
        )
        assert torrent["hydrodynamic_momentum_product"] > gentle["hydrodynamic_momentum_product"]
        assert torrent["bedload_boulder_roll_risk_pct"] > gentle["bedload_boulder_roll_risk_pct"]

        # Peak afternoon hour (15:00) has higher diurnal discharge multiplier than dawn (05:00)
        dawn = calculate_sandur_crossing(
            water_depth_m=0.50,
            flow_velocity_ms=1.4,
            hour_of_day_24=5,
            silt_flour_concentration_mg_l=1000.0,
            hiker_mass_kg=75.0,
        )
        afternoon = calculate_sandur_crossing(
            water_depth_m=0.50,
            flow_velocity_ms=1.4,
            hour_of_day_24=15,
            silt_flour_concentration_mg_l=1000.0,
            hiker_mass_kg=75.0,
        )
        assert afternoon["diurnal_discharge_multiplier"] > dawn["diurnal_discharge_multiplier"]
        assert afternoon["hydrodynamic_momentum_product"] > dawn["hydrodynamic_momentum_product"]

        # Higher silt flour concentration increases quicksand liquefaction index
        low_silt = calculate_sandur_crossing(
            water_depth_m=0.45,
            flow_velocity_ms=1.2,
            hour_of_day_24=8,
            silt_flour_concentration_mg_l=150.0,
            hiker_mass_kg=75.0,
        )
        high_silt = calculate_sandur_crossing(
            water_depth_m=0.45,
            flow_velocity_ms=1.2,
            hour_of_day_24=8,
            silt_flour_concentration_mg_l=4200.0,
            hiker_mass_kg=75.0,
        )
        assert high_silt["quicksand_liquefaction_index"] > low_silt["quicksand_liquefaction_index"]

    def test_validation_out_of_bounds_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="water_depth_m"):
            calculate_sandur_crossing(water_depth_m=0.05, flow_velocity_ms=1.2)
        with pytest.raises(ValueError, match="water_depth_m"):
            calculate_sandur_crossing(water_depth_m=2.5, flow_velocity_ms=1.2)
        with pytest.raises(ValueError, match="flow_velocity_ms"):
            calculate_sandur_crossing(water_depth_m=0.5, flow_velocity_ms=0.02)
        with pytest.raises(ValueError, match="flow_velocity_ms"):
            calculate_sandur_crossing(water_depth_m=0.5, flow_velocity_ms=5.8)
        with pytest.raises(ValueError, match="hour_of_day_24"):
            calculate_sandur_crossing(water_depth_m=0.5, flow_velocity_ms=1.2, hour_of_day_24=-1)
        with pytest.raises(ValueError, match="hour_of_day_24"):
            calculate_sandur_crossing(water_depth_m=0.5, flow_velocity_ms=1.2, hour_of_day_24=24)
        with pytest.raises(ValueError, match="silt_flour_concentration_mg_l"):
            calculate_sandur_crossing(
                water_depth_m=0.5,
                flow_velocity_ms=1.2,
                silt_flour_concentration_mg_l=20.0,
            )
        with pytest.raises(ValueError, match="silt_flour_concentration_mg_l"):
            calculate_sandur_crossing(
                water_depth_m=0.5,
                flow_velocity_ms=1.2,
                silt_flour_concentration_mg_l=6000.0,
            )
        with pytest.raises(ValueError, match="hiker_mass_kg"):
            calculate_sandur_crossing(
                water_depth_m=0.5,
                flow_velocity_ms=1.2,
                hiker_mass_kg=30.0,
            )
        with pytest.raises(ValueError, match="hiker_mass_kg"):
            calculate_sandur_crossing(
                water_depth_m=0.5,
                flow_velocity_ms=1.2,
                hiker_mass_kg=180.0,
            )


class TestGearChecklist:
    """Tests for the 6-item mandatory sandur crossing gear checklist."""

    def test_get_gear_checklist_returns_six_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(SANDUR_CROSSING_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert "item" in item
            assert "category" in item
            assert "priority" in item
            assert "rationale" in item
            assert item["priority"] == "essential"


class TestIntentDetectionAndDisambiguation:
    """Tests for sandur crossing intent detection, parameter extraction, and cross-domain disambiguation."""

    def test_positive_sandur_crossing_intent_queries(self) -> None:
        positive_queries = [
            "How do I cross Skeiðarársandur and Krossá braided river outwash plain in Iceland without getting trapped in quicksand silt?",
            "Calculate sandur crossing risk for 0.7 m water depth and 1.9 m/s velocity at 15:00",
            "What gear do I need for Kaskawulsh Slims River glacial outwash quicksand silt-bar crossing in Yukon?",
            "Tell me about Rakaia braids proglacial boulder outwash fan crossing technique in New Zealand",
            "How to avoid glacial flour quicksand on Sheridan Glacier Copper River sandur delta?",
            "When is the safest hour of day to ford a braided-river jokulhlaup outwash plain?",
        ]
        for q in positive_queries:
            assert is_sandur_crossing_query(q) is True, f"Expected True for: {q}"
            assert detect_sandur_crossing_intent(q) is True, f"Expected True for: {q}"

    def test_negative_and_excluded_queries(self) -> None:
        negative_queries = [
            "",
            "   ",
            "Where is my order #12345?",
            "I want a refund for my wading staff",
            "How do I cross subarctic river aufeis overflow ice sheets in Ulakhan-Taryn?",
            "What is the tidal return window for Wattwandern mudflat trekking in the Wadden Sea?",
            "Calculate crevasse snow bridge depth-to-span ratio for Khumbu Icefall glacier navigation",
            "How do I run Boulder Drop on the Skykomish River in a whitewater kayak?",
            "What is the escape ledge height for Buckskin Gulch slot canyon flash flood?",
        ]
        for q in negative_queries:
            assert is_sandur_crossing_query(q) is False, f"Expected False for: {q}"

    def test_cross_domain_disambiguation_guards(self) -> None:
        sandur_queries = [
            "Wading Skeiðarársandur and Krossá braided river glacial outwash plain with quicksand silt-bars",
            "Calculate sandur crossing momentum for Kaskawulsh Slims River glacial flour quicksand braids",
            "Rakaia braids proglacial outwash plain crossing technique and rolling greywacke bedload hazard",
            "Copper River Sheridan Glacier sandur outwash delta silt-bar liquefaction risk",
        ]
        for q in sandur_queries:
            assert is_sandur_crossing_query(q) is True
            assert detect_aufeis_crossing_intent(q) is False
            assert detect_glacier_intent(q) is None
            assert detect_mudflat_intent(q) is None
            assert detect_whitewater_intent(q) is None
            assert detect_river_rafting_intent(q).intent_detected is False
            assert detect_river_sup_intent(q) is None
            assert detect_packrafting_intent(q) is None
            assert extract_canoe_intent(q) is None
            assert detect_flash_flood_slot_intent(q) is False
            assert detect_rock_glacier_navigation_intent(q) is False
            assert detect_cobble_spit_trekking_intent(q) is False

    def test_extract_sandur_crossing_params(self) -> None:
        query = (
            "Calculate sandur crossing for Kaskawulsh Slims River with 0.65 m depth, "
            "1.8 m/s flow velocity, at 14:00, 2600 mg/L silt concentration, and 82 kg hiker mass"
        )
        params = extract_sandur_crossing_params(query)
        assert params["site_id"] == "slim-river-kaskawulsh-canada"
        assert params["water_depth_m"] == 0.65
        assert params["flow_velocity_ms"] == 1.8
        assert params["hour_of_day_24"] == 14
        assert params["silt_flour_concentration_mg_l"] == 2600.0
        assert params["hiker_mass_kg"] == 82.0


class TestFormattingChatAndStream:
    """Tests for response formatting, prompt builder, chat handler, and SSE stream generator."""

    def test_format_sandur_crossing_response_actions(self) -> None:
        calc_resp = format_sandur_crossing_response(
            "Calculate sandur crossing hydrodynamic momentum for 0.8 m water depth and 2.1 m/s velocity"
        )
        assert calc_resp["action"] == "sandur_crossing_calculated"
        assert "calculation" in calc_resp
        assert "answer" in calc_resp

        lookup_resp = format_sandur_crossing_response(
            "Tell me about Rakaia braids glacial outwash crossing in New Zealand"
        )
        assert lookup_resp["action"] == "sandur_crossing_lookup"
        assert lookup_resp["matched_site"]["id"] == "rakaia-gorge-braids-nz"

        info_resp = format_sandur_crossing_response(
            "What are the general glacial outwash braided river sandur crossing and quicksand silt-bar guidelines?"
        )
        assert info_resp["action"] == "sandur_crossing_info"
        assert len(info_resp["sites"]) == 4

    def test_build_sandur_crossing_prompt(self) -> None:
        prompt = build_sandur_crossing_prompt(
            "How do I avoid quicksand silt-bars while crossing Skeiðarársandur braided river?"
        )
        assert "Sandur" in prompt
        assert "Skeiðarársandur" in prompt
        assert "quicksand" in prompt.lower() or "momentum" in prompt.lower()

    def test_chat_handler_and_get_chat_response(self) -> None:
        handled = handle_sandur_crossing_intent(
            "Calculate sandur crossing for Skeiðarársandur with 0.75 m depth and 2.2 m/s velocity"
        )
        assert handled is not None
        assert "sandur_crossing_info" in handled
        assert "answer" in handled

        assert handle_sandur_crossing_intent("Check my order refund status") is None

        direct = get_chat_response("Tell me about Kaskawulsh sandur outwash in Canada")
        assert "sandur_crossing_info" in direct

    @pytest.mark.anyio
    async def test_stream_events_generators(self) -> None:
        sync_events = list(
            generate_stream_events(
                "Calculate sandur crossing for Rakaia braids at 0.6 m depth and 1.8 m/s velocity"
            )
        )
        assert len(sync_events) >= 3
        assert any("sandur_crossing_info" in e for e in sync_events)
        assert sync_events[-1] == "data: [DONE]\n\n"

        async_events = []
        async for chunk in generate_sandur_crossing_stream_events(
            "Navigate Skeiðarársandur and Krossá braided river outwash plain"
        ):
            async_events.append(chunk)
        assert len(async_events) >= 3
        assert any("sandur_crossing_info" in e for e in async_events)
        assert async_events[-1] == "data: [DONE]\n\n"
