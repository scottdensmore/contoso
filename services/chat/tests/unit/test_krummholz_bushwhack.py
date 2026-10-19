"""Unit tests for the Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking Guide module."""

import pytest
from contoso_chat.avalanche import detect_avalanche_intent
from contoso_chat.bushcraft import detect_bushcraft_intent
from contoso_chat.canopy_bryophyte import detect_canopy_bryophyte_intent
from contoso_chat.chat import handle_krummholz_bushwhack_intent
from contoso_chat.krummholz_bushwhack import (
    KRUMMHOLZ_BUSHWHACK_GEAR_CHECKLIST,
    KRUMMHOLZ_SITES,
    build_krummholz_bushwhack_prompt,
    calculate_krummholz_bushwhack,
    detect_krummholz_bushwhack_intent,
    extract_krummholz_bushwhack_params,
    filter_sites,
    format_krummholz_bushwhack_response,
    generate_stream_events,
    get_all_krummholz_bushwhack_sites,
    get_all_sites,
    get_chat_response,
    get_gear_checklist,
    get_krummholz_bushwhack_site_by_id,
    get_site_by_id,
    is_krummholz_bushwhack_query,
)
from contoso_chat.mountaineering import detect_mountaineering_intent
from contoso_chat.orienteering import extract_orienteering_intent
from contoso_chat.paramo_navigation import detect_paramo_navigation_intent
from contoso_chat.snowshoe_mountaineering import detect_snowshoe_intent
from contoso_chat.stream import generate_krummholz_bushwhack_stream_events
from contoso_chat.tree_climbing import detect_tree_climbing_intent
from contoso_chat.tundra_lichen import detect_tundra_lichen_intent


class TestKrummholzBushwhackSitesCatalog:
    """Tests for the 4-site krummholz bushwhack catalog and lookup/filter functions."""

    def test_get_all_sites_returns_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(KRUMMHOLZ_SITES) == 4
        assert len(get_all_krummholz_bushwhack_sites()) == 4

    def test_site_ids_match_specification(self) -> None:
        ids = {s["id"] for s in get_all_sites()}
        assert ids == {
            "presidential-krummholz-whitemtns-usa",
            "karwendel-latschenkiefer-tyrol-austria",
            "garibaldi-slide-alder-subalpine-canada",
            "tateyama-hai-matsu-alps-japan",
        }

    def test_sites_have_required_fields(self) -> None:
        required_fields = {
            "id",
            "name",
            "country",
            "region",
            "ecotype",
            "difficulty",
            "default_stems_per_sq_meter",
            "default_canopy_mat_height_m",
            "default_snow_moat_depth_cm",
            "default_slope_angle_deg",
            "default_pack_width_cm",
            "primary_hazard",
            "navigation_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_fields.issubset(set(site.keys()))
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.ecotype == site["ecotype"]

    def test_get_site_by_id_found(self) -> None:
        site = get_site_by_id("presidential-krummholz-whitemtns-usa")
        assert site is not None
        assert site["name"] == "Presidential Range Abies balsamea Krummholz Wave Zone"
        assert site["country"] == "United States"
        assert site["ecotype"] == "balsam-fir-spruce-mat"
        assert site["difficulty"] == "extreme"

        alias_site = get_krummholz_bushwhack_site_by_id("karwendel-latschenkiefer-tyrol-austria")
        assert alias_site is not None
        assert alias_site["country"] == "Austria"
        assert alias_site["ecotype"] == "mountain-pine-latschen-labyrinth"
        assert alias_site["difficulty"] == "challenging"

    def test_get_site_by_id_not_found(self) -> None:
        assert get_site_by_id("nonexistent-krummholz-site") is None

    def test_filter_sites_by_country(self) -> None:
        results = filter_sites(country="Canada")
        assert len(results) == 1
        assert results[0]["id"] == "garibaldi-slide-alder-subalpine-canada"

    def test_filter_sites_by_ecotype(self) -> None:
        results = filter_sites(ecotype="wind-flagged-whitebark-cushion")
        assert len(results) == 1
        assert results[0]["id"] == "tateyama-hai-matsu-alps-japan"

    def test_filter_sites_by_difficulty(self) -> None:
        challenging = filter_sites(difficulty="challenging")
        assert len(challenging) == 2
        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 1
        assert extreme[0]["id"] == "presidential-krummholz-whitemtns-usa"
        moderate = filter_sites(difficulty="moderate")
        assert len(moderate) == 1
        assert moderate[0]["id"] == "tateyama-hai-matsu-alps-japan"

    def test_filter_sites_by_search(self) -> None:
        results = filter_sites(search="Latschenkiefer")
        assert len(results) == 1
        assert results[0]["id"] == "karwendel-latschenkiefer-tyrol-austria"


class TestKrummholzBushwhackCalculator:
    """Tests for the Subalpine Krummholz & Dwarf-Conifer Thicket Bushwhacking Calculator."""

    def test_low_risk_calculation_frost_ridge_rock_hopping(self) -> None:
        result = calculate_krummholz_bushwhack(
            stems_per_sq_meter=3.0,
            canopy_mat_height_m=0.5,
            snow_moat_depth_cm=5.0,
            slope_angle_deg=8.0,
            pack_width_cm=32.0,
        )
        assert result["risk_level"] == "low"
        assert result["safety_status"] == "low"
        assert result["transit_strategy"] == "frost-ridge-rock-hopping-leads"
        assert result["effective_velocity_km_h"] > 1.2
        assert result["tree_well_spruce_trap_risk_pct"] < 25.0
        assert result["metabolic_kcal_per_hour"] > 250.0
        assert result["branch_snag_resistance_index"] < 35.0
        assert isinstance(result["warnings"], list)
        assert len(result["recommendations"]) >= 1

    def test_moderate_risk_calculation_streamlined_pack_creek_bed_bypass(self) -> None:
        result = calculate_krummholz_bushwhack(
            stems_per_sq_meter=11.0,
            canopy_mat_height_m=1.1,
            snow_moat_depth_cm=30.0,
            slope_angle_deg=16.0,
            pack_width_cm=44.0,
        )
        assert result["risk_level"] == "moderate"
        assert result["transit_strategy"] == "streamlined-pack-creek-bed-bypass"
        assert result["effective_velocity_km_h"] > 0.4
        assert len(result["recommendations"]) >= 1

    def test_high_risk_calculation_probe_tested_canopy_crawling(self) -> None:
        result = calculate_krummholz_bushwhack(
            stems_per_sq_meter=24.0,
            canopy_mat_height_m=1.9,
            snow_moat_depth_cm=95.0,
            slope_angle_deg=28.0,
            pack_width_cm=58.0,
        )
        assert result["risk_level"] == "high"
        assert result["transit_strategy"] == "probe-tested-canopy-crawling"
        assert len(result["warnings"]) >= 1

    def test_critical_risk_impenetrable_spruce_trap_abort(self) -> None:
        result = calculate_krummholz_bushwhack(
            stems_per_sq_meter=38.0,
            canopy_mat_height_m=2.8,
            snow_moat_depth_cm=190.0,
            slope_angle_deg=40.0,
            pack_width_cm=75.0,
        )
        assert result["risk_level"] == "critical"
        assert result["safety_status"] == "critical"
        assert result["transit_strategy"] == "abort-impenetrable-spruce-trap-labyrinth"
        assert result["effective_velocity_km_h"] <= 0.35
        assert result["tree_well_spruce_trap_risk_pct"] >= 75.0
        assert result["branch_snag_resistance_index"] >= 75.0
        assert len(result["warnings"]) >= 2

    def test_monotonic_physics_relationships(self) -> None:
        # Higher stem density reduces velocity and increases branch snag resistance & kcal/hr
        sparse = calculate_krummholz_bushwhack(
            stems_per_sq_meter=4.0,
            canopy_mat_height_m=1.2,
            snow_moat_depth_cm=30.0,
            slope_angle_deg=15.0,
            pack_width_cm=42.0,
        )
        dense = calculate_krummholz_bushwhack(
            stems_per_sq_meter=36.0,
            canopy_mat_height_m=1.2,
            snow_moat_depth_cm=30.0,
            slope_angle_deg=15.0,
            pack_width_cm=42.0,
        )
        assert dense["effective_velocity_km_h"] < sparse["effective_velocity_km_h"]
        assert dense["branch_snag_resistance_index"] > sparse["branch_snag_resistance_index"]
        assert dense["metabolic_kcal_per_hour"] > sparse["metabolic_kcal_per_hour"]

        # Deeper snow moat increases spruce trap risk pct
        shallow_snow = calculate_krummholz_bushwhack(
            stems_per_sq_meter=15.0,
            canopy_mat_height_m=1.5,
            snow_moat_depth_cm=10.0,
            slope_angle_deg=18.0,
            pack_width_cm=45.0,
        )
        deep_snow = calculate_krummholz_bushwhack(
            stems_per_sq_meter=15.0,
            canopy_mat_height_m=1.5,
            snow_moat_depth_cm=180.0,
            slope_angle_deg=18.0,
            pack_width_cm=45.0,
        )
        assert (
            deep_snow["tree_well_spruce_trap_risk_pct"]
            > shallow_snow["tree_well_spruce_trap_risk_pct"]
        )

        # Wider pack increases branch snag resistance index
        narrow_pack = calculate_krummholz_bushwhack(
            stems_per_sq_meter=18.0,
            canopy_mat_height_m=1.6,
            snow_moat_depth_cm=40.0,
            slope_angle_deg=20.0,
            pack_width_cm=30.0,
        )
        wide_pack = calculate_krummholz_bushwhack(
            stems_per_sq_meter=18.0,
            canopy_mat_height_m=1.6,
            snow_moat_depth_cm=40.0,
            slope_angle_deg=20.0,
            pack_width_cm=78.0,
        )
        assert (
            wide_pack["branch_snag_resistance_index"]
            > narrow_pack["branch_snag_resistance_index"]
        )

    def test_validation_out_of_bounds_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="stems_per_sq_meter"):
            calculate_krummholz_bushwhack(
                stems_per_sq_meter=0.5,
                canopy_mat_height_m=1.2,
                snow_moat_depth_cm=30.0,
            )
        with pytest.raises(ValueError, match="stems_per_sq_meter"):
            calculate_krummholz_bushwhack(
                stems_per_sq_meter=50.0,
                canopy_mat_height_m=1.2,
                snow_moat_depth_cm=30.0,
            )
        with pytest.raises(ValueError, match="canopy_mat_height_m"):
            calculate_krummholz_bushwhack(
                stems_per_sq_meter=10.0,
                canopy_mat_height_m=0.1,
                snow_moat_depth_cm=30.0,
            )
        with pytest.raises(ValueError, match="canopy_mat_height_m"):
            calculate_krummholz_bushwhack(
                stems_per_sq_meter=10.0,
                canopy_mat_height_m=4.0,
                snow_moat_depth_cm=30.0,
            )
        with pytest.raises(ValueError, match="snow_moat_depth_cm"):
            calculate_krummholz_bushwhack(
                stems_per_sq_meter=10.0,
                canopy_mat_height_m=1.2,
                snow_moat_depth_cm=-5.0,
            )
        with pytest.raises(ValueError, match="snow_moat_depth_cm"):
            calculate_krummholz_bushwhack(
                stems_per_sq_meter=10.0,
                canopy_mat_height_m=1.2,
                snow_moat_depth_cm=300.0,
            )
        with pytest.raises(ValueError, match="slope_angle_deg"):
            calculate_krummholz_bushwhack(
                stems_per_sq_meter=10.0,
                canopy_mat_height_m=1.2,
                snow_moat_depth_cm=30.0,
                slope_angle_deg=-2.0,
            )
        with pytest.raises(ValueError, match="slope_angle_deg"):
            calculate_krummholz_bushwhack(
                stems_per_sq_meter=10.0,
                canopy_mat_height_m=1.2,
                snow_moat_depth_cm=30.0,
                slope_angle_deg=55.0,
            )
        with pytest.raises(ValueError, match="pack_width_cm"):
            calculate_krummholz_bushwhack(
                stems_per_sq_meter=10.0,
                canopy_mat_height_m=1.2,
                snow_moat_depth_cm=30.0,
                pack_width_cm=15.0,
            )
        with pytest.raises(ValueError, match="pack_width_cm"):
            calculate_krummholz_bushwhack(
                stems_per_sq_meter=10.0,
                canopy_mat_height_m=1.2,
                snow_moat_depth_cm=30.0,
                pack_width_cm=95.0,
            )


class TestGearChecklist:
    """Tests for the 6-item mandatory krummholz bushwhack gear checklist."""

    def test_get_gear_checklist_returns_six_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(KRUMMHOLZ_BUSHWHACK_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert "item" in item
            assert "category" in item
            assert "priority" in item
            assert "rationale" in item
            assert item["priority"] == "essential"


class TestIntentDetectionAndDisambiguation:
    """Tests for krummholz bushwhack intent detection, parameter extraction, and cross-domain disambiguation."""

    def test_positive_krummholz_bushwhack_intent_queries(self) -> None:
        positive_queries = [
            "How do I bushwhack through Presidential Range krummholz balsam fir thickets without falling into a spruce trap?",
            "Calculate bushwhacking velocity for Karwendel Latschenkiefer Pinus mugo labyrinth",
            "What gear do I need for slide alder cripplebrush bushwhacking in Garibaldi Coast Range?",
            "Tell me about Tateyama Hai-Matsu dwarf conifer cushion navigation in the Japanese Alps",
            "Krummholz bushwhack calculator for 25 stems/m2, 1.8 m canopy mat height, and 110 cm snow moat",
            "How to avoid spruce traps in subalpine timberline thicket dwarf-conifer mats?",
        ]
        for q in positive_queries:
            assert is_krummholz_bushwhack_query(q) is True, f"Expected True for: {q}"
            assert detect_krummholz_bushwhack_intent(q) is True, f"Expected True for: {q}"

    def test_negative_and_excluded_queries(self) -> None:
        negative_queries = [
            "",
            "   ",
            "Where is my order #12345?",
            "I want a refund for my torn gaiters",
            "How do I build a debris hut and bow drill friction fire for bushcraft?",
            "How do I rig a cambium saver and throwline for old-growth arborist tree climbing?",
            "What is the epiphytic bryophyte moss load on old-growth Sitka spruce canopy limbs?",
            "How do I protect fragile Cladonia rangiferina caribou moss tundra lichen mats in Cairngorms?",
            "How do I navigate Andean paramo frailejon Espeletia rosettes in Chingaza?",
        ]
        for q in negative_queries:
            assert is_krummholz_bushwhack_query(q) is False, f"Expected False for: {q}"

    def test_cross_domain_disambiguation_guards(self) -> None:
        krummholz_queries = [
            "Bushwhacking through Presidential Range krummholz balsam fir mat and spruce traps",
            "Navigate Karwendel Latschenkiefer Pinus mugo dwarf conifer thicket labyrinth",
            "Garibaldi slide alder and subalpine fir cripplebrush bushwhack velocity calculator",
            "Tateyama Hai-Matsu Pinus pumila dwarf-conifer timberline thicket transit protocol",
        ]
        for q in krummholz_queries:
            assert is_krummholz_bushwhack_query(q) is True
            assert detect_bushcraft_intent(q) is None
            assert extract_orienteering_intent(q) is None
            assert detect_canopy_bryophyte_intent(q) is False
            assert detect_tree_climbing_intent(q) is None
            assert detect_snowshoe_intent(q) is None
            assert detect_tundra_lichen_intent(q) is False
            assert detect_paramo_navigation_intent(q) is False
            assert detect_mountaineering_intent(q) is None
            assert detect_avalanche_intent(q) is None

    def test_extract_krummholz_bushwhack_params(self) -> None:
        query = (
            "Calculate krummholz bushwhack for Karwendel Latschenkiefer with 22 stems/m2, "
            "1.7 m canopy mat height, 85 cm snow moat depth, 26 deg slope, and 52 cm pack width"
        )
        params = extract_krummholz_bushwhack_params(query)
        assert params["site_id"] == "karwendel-latschenkiefer-tyrol-austria"
        assert params["stems_per_sq_meter"] == 22.0
        assert params["canopy_mat_height_m"] == 1.7
        assert params["snow_moat_depth_cm"] == 85.0
        assert params["slope_angle_deg"] == 26.0
        assert params["pack_width_cm"] == 52.0


class TestFormattingChatAndStream:
    """Tests for response formatting, prompt builder, chat handler, and SSE stream generator."""

    def test_format_krummholz_bushwhack_response_actions(self) -> None:
        calc_resp = format_krummholz_bushwhack_response(
            "Calculate krummholz bushwhack velocity for 28 stems/m2 and 120 cm snow moat"
        )
        assert calc_resp["action"] == "krummholz_bushwhack_calculated"
        assert "calculation" in calc_resp
        assert "answer" in calc_resp

        lookup_resp = format_krummholz_bushwhack_response(
            "Tell me about Karwendel Latschenkiefer Pinus mugo bushwhacking in Austria"
        )
        assert lookup_resp["action"] == "krummholz_bushwhack_lookup"
        assert lookup_resp["matched_site"]["id"] == "karwendel-latschenkiefer-tyrol-austria"

        info_resp = format_krummholz_bushwhack_response(
            "What are the general dwarf-conifer krummholz bushwhacking and spruce trap guidelines?"
        )
        assert info_resp["action"] == "krummholz_bushwhack_info"
        assert len(info_resp["sites"]) == 4

    def test_build_krummholz_bushwhack_prompt(self) -> None:
        prompt = build_krummholz_bushwhack_prompt(
            "How do I avoid spruce traps while bushwhacking Presidential Range krummholz?"
        )
        assert "Krummholz" in prompt
        assert "Presidential Range" in prompt
        assert "spruce trap" in prompt.lower() or "velocity" in prompt.lower()

    def test_chat_handler_and_get_chat_response(self) -> None:
        handled = handle_krummholz_bushwhack_intent(
            "Calculate krummholz bushwhack for Presidential Range with 30 stems/m2 and 140 cm snow moat"
        )
        assert handled is not None
        assert "krummholz_bushwhack_info" in handled
        assert "answer" in handled

        assert handle_krummholz_bushwhack_intent("Check my order refund status") is None

        direct = get_chat_response("Tell me about Tateyama Hai-Matsu krummholz in Japan")
        assert "krummholz_bushwhack_info" in direct

    @pytest.mark.anyio
    async def test_stream_events_generators(self) -> None:
        sync_events = list(
            generate_stream_events(
                "Calculate krummholz bushwhack for Garibaldi slide alder at 20 stems/m2"
            )
        )
        assert len(sync_events) >= 3
        assert any("krummholz_bushwhack_info" in e for e in sync_events)
        assert sync_events[-1] == "data: [DONE]\n\n"

        async_events = []
        async for chunk in generate_krummholz_bushwhack_stream_events(
            "Navigate Presidential Range krummholz balsam fir thickets"
        ):
            async_events.append(chunk)
        assert len(async_events) >= 3
        assert any("krummholz_bushwhack_info" in e for e in async_events)
        assert async_events[-1] == "data: [DONE]\n\n"
