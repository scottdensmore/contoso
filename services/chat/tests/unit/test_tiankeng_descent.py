"""Unit tests for the Karst Tiankeng (Giant Collapse Sinkhole) & Vertical Cloud-Forest Rim Descent Guide module."""

import pytest
from contoso_chat.big_wall import detect_big_wall_intent
from contoso_chat.canopy_bryophyte import detect_canopy_bryophyte_intent
from contoso_chat.canyoneering import detect_canyoneering_intent
from contoso_chat.cave_diving import detect_cave_diving_intent
from contoso_chat.cave_mineralogy import detect_cave_mineralogy_intent
from contoso_chat.caving import detect_caving_intent
from contoso_chat.chat import handle_tiankeng_descent_intent
from contoso_chat.climbing import detect_climbing_intent
from contoso_chat.cryokarst_speleology import detect_cryokarst_speleology_intent
from contoso_chat.glaciere_caving import detect_glaciere_caving_intent
from contoso_chat.pothole_escape import detect_pothole_escape_intent
from contoso_chat.sea_cave_pneumatics import detect_sea_cave_pneumatics_intent
from contoso_chat.stream import generate_tiankeng_descent_stream_events
from contoso_chat.tiankeng_descent import (
    TIANKENG_DESCENT_GEAR_CHECKLIST,
    TIANKENG_DESCENT_SITES,
    build_tiankeng_descent_prompt,
    calculate_tiankeng_descent,
    detect_tiankeng_descent_intent,
    extract_tiankeng_descent_params,
    filter_sites,
    format_tiankeng_descent_response,
    generate_stream_events,
    get_all_sites,
    get_all_tiankeng_descent_sites,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    get_tiankeng_descent_site_by_id,
    is_tiankeng_descent_query,
)
from contoso_chat.tree_climbing import detect_tree_climbing_intent


class TestTiankengDescentSitesCatalog:
    """Tests for the 4-site karst tiankeng descent catalog and lookup/filter functions."""

    def test_get_all_sites_returns_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(TIANKENG_DESCENT_SITES) == 4
        assert len(get_all_tiankeng_descent_sites()) == 4

    def test_site_ids_match_specification(self) -> None:
        ids = {s["id"] for s in get_all_sites()}
        assert ids == {
            "xiaozhai-tiankeng-chongqing-china",
            "dashiwei-tiankeng-leye-china",
            "sotano-de-las-golondrinas-mexico",
            "sima-humboldt-sarisarinama-venezuela",
        }

    def test_sites_have_required_fields(self) -> None:
        required_fields = {
            "id",
            "name",
            "country",
            "region",
            "morphology",
            "difficulty",
            "default_vertical_drop_m",
            "default_rebelay_count",
            "default_fog_humidity_pct",
            "default_overhang_angle_deg",
            "default_waterfall_spray_litres_min",
            "rigging_protocol",
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
        site = get_site_by_id("xiaozhai-tiankeng-chongqing-china")
        assert site is not None
        assert site["name"] == "Xiaozhai Tiankeng Double-Nested Collapse Mega-Doline"
        assert site["country"] == "China"
        assert site["morphology"] == "collapse-mega-doline"
        assert site["difficulty"] == "extreme"

        alias_site = get_tiankeng_descent_site_by_id("sotano-de-las-golondrinas-mexico")
        assert alias_site is not None
        assert alias_site["country"] == "Mexico"
        assert alias_site["morphology"] == "overhung-bell-shaft-sinkhole"
        assert alias_site["difficulty"] == "challenging"

    def test_get_site_by_id_not_found(self) -> None:
        assert get_site_by_id("nonexistent-tiankeng-site") is None

    def test_filter_sites_by_country(self) -> None:
        results = filter_sites(country="China")
        assert len(results) == 2
        ids = {s["id"] for s in results}
        assert ids == {
            "xiaozhai-tiankeng-chongqing-china",
            "dashiwei-tiankeng-leye-china",
        }

    def test_filter_sites_by_morphology(self) -> None:
        results = filter_sites(morphology="erosional-waterfall-tiankeng")
        assert len(results) == 1
        assert results[0]["id"] == "sima-humboldt-sarisarinama-venezuela"

    def test_filter_sites_by_difficulty(self) -> None:
        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 3
        challenging = filter_sites(difficulty="challenging")
        assert len(challenging) == 1
        assert challenging[0]["id"] == "sotano-de-las-golondrinas-mexico"

    def test_filter_sites_by_search(self) -> None:
        results = filter_sites(search="Golondrinas")
        assert len(results) == 1
        assert results[0]["id"] == "sotano-de-las-golondrinas-mexico"


class TestTiankengDescentCalculator:
    """Tests for the Karst Tiankeng & Vertical Cloud-Forest Rim Descent Calculator."""

    def test_low_risk_calculation_clean_overhung_free_hang(self) -> None:
        result = calculate_tiankeng_descent(
            vertical_drop_m=95.0,
            rebelay_count=3,
            fog_humidity_pct=55.0,
            overhang_angle_deg=-12.0,
            waterfall_spray_litres_min=5.0,
        )
        assert result["risk_level"] == "low"
        assert result["safety_status"] == "low"
        assert result["rigging_strategy"] == "continuous-free-hang-6-bar-rack"
        assert result["wet_rope_friction_multiplier"] >= 0.8
        assert result["descender_thermal_c"] < 95.0
        assert result["limestone_spall_trajectory_risk_pct"] < 25.0
        assert result["free_hang_bounce_amplitude_m"] < 2.5
        assert isinstance(result["warnings"], list)
        assert len(result["recommendations"]) >= 1

    def test_moderate_risk_calculation_segmented_rebelay(self) -> None:
        result = calculate_tiankeng_descent(
            vertical_drop_m=220.0,
            rebelay_count=4,
            fog_humidity_pct=78.0,
            overhang_angle_deg=-2.0,
            waterfall_spray_litres_min=25.0,
        )
        assert result["risk_level"] == "moderate"
        assert result["rigging_strategy"] == "segmented-rebelay-lip-deviation"
        assert len(result["recommendations"]) >= 1

    def test_high_risk_calculation_offset_pendulum_spray_avoidance(self) -> None:
        result = calculate_tiankeng_descent(
            vertical_drop_m=380.0,
            rebelay_count=5,
            fog_humidity_pct=92.0,
            overhang_angle_deg=8.0,
            waterfall_spray_litres_min=110.0,
        )
        assert result["risk_level"] == "high"
        assert result["rigging_strategy"] == "offset-pendulum-spray-avoidance-rig"
        assert len(result["warnings"]) >= 1

    def test_critical_risk_monsoon_waterfall_plume_abort(self) -> None:
        result = calculate_tiankeng_descent(
            vertical_drop_m=610.0,
            rebelay_count=1,
            fog_humidity_pct=99.0,
            overhang_angle_deg=22.0,
            waterfall_spray_litres_min=360.0,
        )
        assert result["risk_level"] == "critical"
        assert result["safety_status"] == "critical"
        assert result["rigging_strategy"] == "abort-monsoon-waterfall-plume-lockout"
        assert result["limestone_spall_trajectory_risk_pct"] >= 65.0
        assert result["free_hang_bounce_amplitude_m"] >= 6.0
        assert len(result["warnings"]) >= 2

    def test_monotonic_physics_relationships(self) -> None:
        # Deeper drop with fewer rebelays increases descender thermal load and free-hang bounce amplitude
        short_segmented = calculate_tiankeng_descent(
            vertical_drop_m=120.0,
            rebelay_count=6,
            fog_humidity_pct=70.0,
            overhang_angle_deg=-5.0,
            waterfall_spray_litres_min=10.0,
        )
        deep_unsegmented = calculate_tiankeng_descent(
            vertical_drop_m=520.0,
            rebelay_count=1,
            fog_humidity_pct=70.0,
            overhang_angle_deg=-5.0,
            waterfall_spray_litres_min=10.0,
        )
        assert deep_unsegmented["descender_thermal_c"] > short_segmented["descender_thermal_c"]
        assert (
            deep_unsegmented["free_hang_bounce_amplitude_m"]
            > short_segmented["free_hang_bounce_amplitude_m"]
        )

        # Positive slab/funnel wall angle (+20 deg) and heavy waterfall spray increase limestone spall trajectory risk vs overhung (-20 deg)
        overhung_bell = calculate_tiankeng_descent(
            vertical_drop_m=300.0,
            rebelay_count=4,
            fog_humidity_pct=80.0,
            overhang_angle_deg=-20.0,
            waterfall_spray_litres_min=15.0,
        )
        slab_funnel = calculate_tiankeng_descent(
            vertical_drop_m=300.0,
            rebelay_count=4,
            fog_humidity_pct=80.0,
            overhang_angle_deg=20.0,
            waterfall_spray_litres_min=280.0,
        )
        assert (
            slab_funnel["limestone_spall_trajectory_risk_pct"]
            > overhung_bell["limestone_spall_trajectory_risk_pct"]
        )

    def test_validation_out_of_bounds_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="vertical_drop_m"):
            calculate_tiankeng_descent(vertical_drop_m=30.0)
        with pytest.raises(ValueError, match="vertical_drop_m"):
            calculate_tiankeng_descent(vertical_drop_m=750.0)
        with pytest.raises(ValueError, match="rebelay_count"):
            calculate_tiankeng_descent(vertical_drop_m=200.0, rebelay_count=-1)
        with pytest.raises(ValueError, match="rebelay_count"):
            calculate_tiankeng_descent(vertical_drop_m=200.0, rebelay_count=25)
        with pytest.raises(ValueError, match="fog_humidity_pct"):
            calculate_tiankeng_descent(vertical_drop_m=200.0, fog_humidity_pct=15.0)
        with pytest.raises(ValueError, match="fog_humidity_pct"):
            calculate_tiankeng_descent(vertical_drop_m=200.0, fog_humidity_pct=105.0)
        with pytest.raises(ValueError, match="overhang_angle_deg"):
            calculate_tiankeng_descent(vertical_drop_m=200.0, overhang_angle_deg=-30.0)
        with pytest.raises(ValueError, match="overhang_angle_deg"):
            calculate_tiankeng_descent(vertical_drop_m=200.0, overhang_angle_deg=35.0)
        with pytest.raises(ValueError, match="waterfall_spray_litres_min"):
            calculate_tiankeng_descent(vertical_drop_m=200.0, waterfall_spray_litres_min=-5.0)
        with pytest.raises(ValueError, match="waterfall_spray_litres_min"):
            calculate_tiankeng_descent(vertical_drop_m=200.0, waterfall_spray_litres_min=550.0)


class TestGearChecklist:
    """Tests for the 6-item mandatory tiankeng descent gear checklist."""

    def test_get_gear_checklist_returns_six_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(TIANKENG_DESCENT_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert "item" in item
            assert "category" in item
            assert "priority" in item
            assert "rationale" in item
            assert item["priority"] == "essential"


class TestIntentDetectionAndDisambiguation:
    """Tests for tiankeng descent intent detection, parameter extraction, and cross-domain disambiguation."""

    def test_positive_tiankeng_descent_intent_queries(self) -> None:
        positive_queries = [
            "How do I rig a multi-rebelay SRT descent into Xiaozhai Tiankeng giant collapse sinkhole in Chongqing?",
            "Calculate tiankeng descent thermal load and bounce amplitude for 376 m vertical drop with 4 rebelays",
            "What gear do I need for Dashiwei Tiankeng subterranean cloud-forest rim descent in Leye, China?",
            "Tell me about Sótano de las Golondrinas overhung bell shaft sinkhole free-fall rappel in Mexico",
            "How to avoid waterfall spray and quartzite rockfall at Sima Humboldt Sarisariñama tepui sinkhole?",
            "What is the limestone spall trajectory risk when rappelling a collapse-mega-doline with 95% fog humidity?",
        ]
        for q in positive_queries:
            assert is_tiankeng_descent_query(q) is True, f"Expected True for: {q}"
            assert detect_tiankeng_descent_intent(q) is True, f"Expected True for: {q}"

    def test_negative_and_excluded_queries(self) -> None:
        negative_queries = [
            "",
            "   ",
            "Where is my order #12345?",
            "I want a refund for my rappel rack",
            "Looking for pit cave expeditions and rebelay rigging in Ellison's Cave Fantastic Pit",
            "What is the calcite saturation index for cave pearls in Carlsbad Caverns?",
            "Calculate cave diving turn pressure for Peacock Springs karst siphon",
            "How do I rig a Sandtrap ghost anchor for Neon Canyon keeper pothole escape?",
            "What is the portal piston-seal probability for Devil's Punchbowl collapse doline sea cave?",
            "Calculate canopy bryophyte water storage capacity in Hoh River Hall of Mosses",
        ]
        for q in negative_queries:
            assert is_tiankeng_descent_query(q) is False, f"Expected False for: {q}"

    def test_cross_domain_disambiguation_guards(self) -> None:
        tiankeng_queries = [
            "Rigging a 500 m SRT descent with 6 rebelays into Xiaozhai Tiankeng giant collapse sinkhole",
            "Calculate descender thermal load for Sótano de las Golondrinas overhung bell shaft sinkhole in Mexico",
            "Dashiwei Tiankeng vertical cloud-forest rim rappel and subterranean karst chasm rigging protocol",
            "Sima Humboldt Sarisariñama erosional waterfall tiankeng descent and spall trajectory risk",
        ]
        for q in tiankeng_queries:
            assert is_tiankeng_descent_query(q) is True
            assert detect_caving_intent(q) is None
            assert detect_cryokarst_speleology_intent(q) is False
            assert detect_glaciere_caving_intent(q) is False
            assert detect_cave_mineralogy_intent(q) is None
            assert detect_cave_diving_intent(q) is None
            assert detect_big_wall_intent(q) is None
            assert detect_climbing_intent(q) is None
            assert detect_canyoneering_intent(q) is None
            assert detect_canopy_bryophyte_intent(q) is False
            assert detect_pothole_escape_intent(q) is False
            assert detect_tree_climbing_intent(q) is None
            assert detect_sea_cave_pneumatics_intent(q) is False

    def test_extract_tiankeng_descent_params(self) -> None:
        query = (
            "Calculate tiankeng descent for Dashiwei Tiankeng with 420 m vertical drop, "
            "6 rebelays, 92% fog humidity, -8 deg overhang angle, and 65 L/min waterfall spray"
        )
        params = extract_tiankeng_descent_params(query)
        assert params["site_id"] == "dashiwei-tiankeng-leye-china"
        assert params["vertical_drop_m"] == 420.0
        assert params["rebelay_count"] == 6
        assert params["fog_humidity_pct"] == 92.0
        assert params["overhang_angle_deg"] == -8.0
        assert params["waterfall_spray_litres_min"] == 65.0


class TestFormattingChatAndStream:
    """Tests for response formatting, prompt builder, chat handler, and SSE stream generator."""

    def test_format_tiankeng_descent_response_actions(self) -> None:
        calc_resp = format_tiankeng_descent_response(
            "Calculate tiankeng descent descender thermal load for 376 m vertical drop and 4 rebelays"
        )
        assert calc_resp["action"] == "tiankeng_descent_calculated"
        assert "calculation" in calc_resp
        assert "answer" in calc_resp

        lookup_resp = format_tiankeng_descent_response(
            "Tell me about Sótano de las Golondrinas bell shaft sinkhole in Mexico"
        )
        assert lookup_resp["action"] == "tiankeng_descent_lookup"
        assert lookup_resp["matched_site"]["id"] == "sotano-de-las-golondrinas-mexico"

        info_resp = format_tiankeng_descent_response(
            "What are the general karst tiankeng giant collapse sinkhole and cloud-forest rim descent guidelines?"
        )
        assert info_resp["action"] == "tiankeng_descent_info"
        assert len(info_resp["sites"]) == 4

    def test_build_tiankeng_descent_prompt(self) -> None:
        prompt = build_tiankeng_descent_prompt(
            "How do I manage descender heat and rebelays on Xiaozhai Tiankeng collapse sinkhole?"
        )
        assert "Tiankeng" in prompt
        assert "Xiaozhai" in prompt
        assert "rebelay" in prompt.lower() or "thermal" in prompt.lower()

    def test_chat_handler_and_get_chat_response(self) -> None:
        handled = handle_tiankeng_descent_intent(
            "Calculate tiankeng descent for Xiaozhai Tiankeng with 511 m drop and 6 rebelays"
        )
        assert handled is not None
        assert "tiankeng_descent_info" in handled
        assert "answer" in handled

        assert handle_tiankeng_descent_intent("Check my order refund status") is None

        direct = get_chat_response("Tell me about Dashiwei Tiankeng in Leye China")
        assert "tiankeng_descent_info" in direct

    @pytest.mark.anyio
    async def test_stream_events_generators(self) -> None:
        sync_events = list(
            generate_stream_events(
                "Calculate tiankeng descent for Sótano de las Golondrinas at 376 m vertical drop"
            )
        )
        assert len(sync_events) >= 3
        assert any("tiankeng_descent_info" in e for e in sync_events)
        assert sync_events[-1] == "data: [DONE]\n\n"

        async_events = []
        async for chunk in generate_tiankeng_descent_stream_events(
            "Descend Xiaozhai Tiankeng giant collapse sinkhole in Chongqing"
        ):
            async_events.append(chunk)
        assert len(async_events) >= 3
        assert any("tiankeng_descent_info" in e for e in async_events)
        assert async_events[-1] == "data: [DONE]\n\n"
