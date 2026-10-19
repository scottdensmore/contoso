"""Unit tests for the Tropical Tsingy (Pinnacle Karst Labyrinth) & Razor-Limestone Arête Scrambling Guide module."""

import pytest
from contoso_chat.canyon_bouldering import detect_canyon_bouldering_intent
from contoso_chat.cave_mineralogy import detect_cave_mineralogy_intent
from contoso_chat.caving import detect_caving_intent
from contoso_chat.chat import handle_tsingy_labyrinth_intent
from contoso_chat.climbing import detect_climbing_intent
from contoso_chat.cryokarst_speleology import detect_cryokarst_speleology_intent
from contoso_chat.highline import extract_highline_intent
from contoso_chat.night_via_ferrata import detect_night_via_ferrata_intent
from contoso_chat.scree_running import detect_scree_running_intent
from contoso_chat.stream import generate_tsingy_labyrinth_stream_events
from contoso_chat.tiankeng_descent import detect_tiankeng_descent_intent
from contoso_chat.tsingy_labyrinth import (
    TSINGY_LABYRINTH_GEAR_CHECKLIST,
    TSINGY_LABYRINTH_SITES,
    build_tsingy_labyrinth_prompt,
    calculate_tsingy_labyrinth,
    detect_tsingy_labyrinth_intent,
    extract_tsingy_labyrinth_params,
    filter_sites,
    format_tsingy_labyrinth_response,
    generate_stream_events,
    get_all_sites,
    get_all_tsingy_labyrinth_sites,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    get_tsingy_labyrinth_site_by_id,
    is_tsingy_labyrinth_query,
)
from contoso_chat.via_ferrata import detect_via_ferrata_intent


class TestTsingyLabyrinthSitesCatalog:
    """Tests for the 4-site tropical tsingy pinnacle karst labyrinth catalog and lookup/filter functions."""

    def test_get_all_sites_returns_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(TSINGY_LABYRINTH_SITES) == 4
        assert len(get_all_tsingy_labyrinth_sites()) == 4

    def test_site_ids_match_specification(self) -> None:
        ids = {s["id"] for s in get_all_sites()}
        assert ids == {
            "bemaraha-grand-tsingy-madagascar",
            "ankarana-tsingy-canyon-madagascar",
            "mulu-api-pinnacles-borneo-malaysia",
            "shilin-naigu-stone-forest-china",
        }

    def test_sites_have_required_fields(self) -> None:
        required_fields = {
            "id",
            "name",
            "country",
            "region",
            "morphology",
            "difficulty",
            "default_blade_edge_radius_mm",
            "default_spire_height_m",
            "default_rock_surface_temp_c",
            "default_diaclase_gap_width_m",
            "default_ambient_humidity_pct",
            "primary_hazard",
            "scrambling_protocol",
            "navigation_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_fields.issubset(set(site.keys()))
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.morphology == site["morphology"]

    def test_get_site_by_id_found(self) -> None:
        site = get_site_by_id("bemaraha-grand-tsingy-madagascar")
        assert site is not None
        assert site["name"] == "Tsingy de Bemaraha Grand Tsingy & Andamozavaky Razor Labyrinth"
        assert site["country"] == "Madagascar"
        assert site["morphology"] == "rillenkarren-razor-spires"
        assert site["difficulty"] == "extreme"

        alias_site = get_tsingy_labyrinth_site_by_id("mulu-api-pinnacles-borneo-malaysia")
        assert alias_site is not None
        assert alias_site["country"] == "Malaysia"
        assert alias_site["morphology"] == "canopy-suspension-bridge-arête"
        assert alias_site["difficulty"] == "extreme"

    def test_get_site_by_id_not_found(self) -> None:
        assert get_site_by_id("nonexistent-tsingy-site") is None

    def test_filter_sites_by_country(self) -> None:
        results = filter_sites(country="Madagascar")
        assert len(results) == 2
        ids = {s["id"] for s in results}
        assert ids == {
            "bemaraha-grand-tsingy-madagascar",
            "ankarana-tsingy-canyon-madagascar",
        }

    def test_filter_sites_by_morphology(self) -> None:
        results = filter_sites(morphology="diaclase-slot-corridor-maze")
        assert len(results) == 1
        assert results[0]["id"] == "ankarana-tsingy-canyon-madagascar"

        arete_results = filter_sites(morphology="canopy-suspension-bridge-arête")
        assert len(arete_results) == 1
        assert arete_results[0]["id"] == "mulu-api-pinnacles-borneo-malaysia"

    def test_filter_sites_by_difficulty(self) -> None:
        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 2
        challenging = filter_sites(difficulty="challenging")
        assert len(challenging) == 1
        assert challenging[0]["id"] == "ankarana-tsingy-canyon-madagascar"
        moderate = filter_sites(difficulty="moderate")
        assert len(moderate) == 1
        assert moderate[0]["id"] == "shilin-naigu-stone-forest-china"

    def test_filter_sites_by_search(self) -> None:
        results = filter_sites(search="Gunung Api")
        assert len(results) == 1
        assert results[0]["id"] == "mulu-api-pinnacles-borneo-malaysia"


class TestTsingyLabyrinthCalculator:
    """Tests for the Tropical Tsingy & Razor-Limestone Arête Scrambling Calculator."""

    def test_low_risk_calculation_stone_forest_walk(self) -> None:
        result = calculate_tsingy_labyrinth(
            blade_edge_radius_mm=6.5,
            spire_height_m=18.0,
            rock_surface_temp_c=25.0,
            diaclase_gap_width_m=0.6,
            ambient_humidity_pct=45.0,
        )
        assert result["risk_level"] == "low"
        assert result["safety_status"] == "low"
        assert result["scrambling_class"] == "class-2-corridor-stone-forest-walk"
        assert result["laceration_shear_index"] < 3.0
        assert result["cord_cut_through_risk_pct"] < 25.0
        assert result["radiant_sweat_loss_litres_hr"] < 1.2
        assert result["arete_exposure_factor"] >= 1.0
        assert isinstance(result["warnings"], list)
        assert len(result["recommendations"]) >= 1

    def test_moderate_risk_calculation_gloved_diaclase_stemming(self) -> None:
        result = calculate_tsingy_labyrinth(
            blade_edge_radius_mm=2.2,
            spire_height_m=34.0,
            rock_surface_temp_c=39.0,
            diaclase_gap_width_m=1.2,
            ambient_humidity_pct=62.0,
        )
        assert result["risk_level"] == "moderate"
        assert result["scrambling_class"] == "class-3-gloved-diaclase-stemming"
        assert len(result["recommendations"]) >= 1

    def test_high_risk_calculation_twin_lanyard_arete(self) -> None:
        result = calculate_tsingy_labyrinth(
            blade_edge_radius_mm=0.8,
            spire_height_m=58.0,
            rock_surface_temp_c=50.0,
            diaclase_gap_width_m=2.3,
            ambient_humidity_pct=74.0,
        )
        assert result["risk_level"] == "high"
        assert result["scrambling_class"] == "class-4-twin-lanyard-arete-via-ferrata"
        assert len(result["warnings"]) >= 1

    def test_critical_risk_razor_spire_thermal_lockout(self) -> None:
        result = calculate_tsingy_labyrinth(
            blade_edge_radius_mm=0.3,
            spire_height_m=102.0,
            rock_surface_temp_c=62.0,
            diaclase_gap_width_m=5.5,
            ambient_humidity_pct=92.0,
        )
        assert result["risk_level"] == "critical"
        assert result["safety_status"] == "critical"
        assert result["scrambling_class"] == "class-5-abort-razor-spire-thermal-lockout"
        assert result["cord_cut_through_risk_pct"] >= 75.0
        assert result["laceration_shear_index"] >= 8.0
        assert len(result["warnings"]) >= 2

    def test_monotonic_physics_relationships(self) -> None:
        # Razorsharper blades (smaller radius) and taller spires increase laceration shear index and cord cut-through risk
        rounded_spires = calculate_tsingy_labyrinth(
            blade_edge_radius_mm=8.0,
            spire_height_m=20.0,
            rock_surface_temp_c=30.0,
            diaclase_gap_width_m=0.8,
            ambient_humidity_pct=55.0,
        )
        razor_spires = calculate_tsingy_labyrinth(
            blade_edge_radius_mm=0.4,
            spire_height_m=85.0,
            rock_surface_temp_c=30.0,
            diaclase_gap_width_m=3.2,
            ambient_humidity_pct=55.0,
        )
        assert (
            razor_spires["laceration_shear_index"]
            > rounded_spires["laceration_shear_index"]
        )
        assert (
            razor_spires["cord_cut_through_risk_pct"]
            > rounded_spires["cord_cut_through_risk_pct"]
        )
        assert (
            razor_spires["arete_exposure_factor"]
            > rounded_spires["arete_exposure_factor"]
        )

        # Higher rock surface temperature and humidity increase radiant sweat loss rate
        cool_corridor = calculate_tsingy_labyrinth(
            blade_edge_radius_mm=1.8,
            spire_height_m=35.0,
            rock_surface_temp_c=22.0,
            diaclase_gap_width_m=1.2,
            ambient_humidity_pct=40.0,
        )
        solar_furnace = calculate_tsingy_labyrinth(
            blade_edge_radius_mm=1.8,
            spire_height_m=35.0,
            rock_surface_temp_c=60.0,
            diaclase_gap_width_m=1.2,
            ambient_humidity_pct=90.0,
        )
        assert (
            solar_furnace["radiant_sweat_loss_litres_hr"]
            > cool_corridor["radiant_sweat_loss_litres_hr"]
        )

    def test_validation_out_of_bounds_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="blade_edge_radius_mm"):
            calculate_tsingy_labyrinth(
                blade_edge_radius_mm=0.05, spire_height_m=40.0, rock_surface_temp_c=35.0
            )
        with pytest.raises(ValueError, match="blade_edge_radius_mm"):
            calculate_tsingy_labyrinth(
                blade_edge_radius_mm=18.0, spire_height_m=40.0, rock_surface_temp_c=35.0
            )
        with pytest.raises(ValueError, match="spire_height_m"):
            calculate_tsingy_labyrinth(
                blade_edge_radius_mm=1.5, spire_height_m=2.0, rock_surface_temp_c=35.0
            )
        with pytest.raises(ValueError, match="spire_height_m"):
            calculate_tsingy_labyrinth(
                blade_edge_radius_mm=1.5, spire_height_m=150.0, rock_surface_temp_c=35.0
            )
        with pytest.raises(ValueError, match="rock_surface_temp_c"):
            calculate_tsingy_labyrinth(
                blade_edge_radius_mm=1.5, spire_height_m=40.0, rock_surface_temp_c=10.0
            )
        with pytest.raises(ValueError, match="rock_surface_temp_c"):
            calculate_tsingy_labyrinth(
                blade_edge_radius_mm=1.5, spire_height_m=40.0, rock_surface_temp_c=75.0
            )
        with pytest.raises(ValueError, match="diaclase_gap_width_m"):
            calculate_tsingy_labyrinth(
                blade_edge_radius_mm=1.5,
                spire_height_m=40.0,
                rock_surface_temp_c=35.0,
                diaclase_gap_width_m=0.1,
            )
        with pytest.raises(ValueError, match="diaclase_gap_width_m"):
            calculate_tsingy_labyrinth(
                blade_edge_radius_mm=1.5,
                spire_height_m=40.0,
                rock_surface_temp_c=35.0,
                diaclase_gap_width_m=10.0,
            )
        with pytest.raises(ValueError, match="ambient_humidity_pct"):
            calculate_tsingy_labyrinth(
                blade_edge_radius_mm=1.5,
                spire_height_m=40.0,
                rock_surface_temp_c=35.0,
                ambient_humidity_pct=10.0,
            )
        with pytest.raises(ValueError, match="ambient_humidity_pct"):
            calculate_tsingy_labyrinth(
                blade_edge_radius_mm=1.5,
                spire_height_m=40.0,
                rock_surface_temp_c=35.0,
                ambient_humidity_pct=105.0,
            )


class TestGearChecklist:
    """Tests for the 6-item mandatory tropical tsingy & razor-limestone arête gear checklist."""

    def test_get_gear_checklist_returns_six_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(TSINGY_LABYRINTH_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert "item" in item
            assert "category" in item
            assert "priority" in item
            assert "rationale" in item
            assert item["priority"] == "essential"


class TestIntentDetectionAndDisambiguation:
    """Tests for tsingy labyrinth intent detection, parameter extraction, and cross-domain disambiguation."""

    def test_positive_tsingy_labyrinth_intent_queries(self) -> None:
        positive_queries = [
            "How do I scramble the rillenkarren razor spires at Tsingy de Bemaraha Grand Tsingy in Madagascar?",
            "Calculate tsingy labyrinth laceration shear index and cord cut-through risk for 0.6 mm blade edge radius and 65 m spire height",
            "What gear do I need for Massif de l'Ankarana Tsingy Rary and sunken diaclase slot corridors?",
            "Tell me about Gunung Api and Mulu Pinnacles razor-limestone arête scrambling in Borneo Malaysia",
            "How to navigate Shilin and Naigu Stone Forest Permian dolomitic pinnacle karst labyrinth in Yunnan China?",
            "Pinnacle karst diaclase route planning with 52 C rock surface temp and 1.8 m diaclase gap width",
        ]
        for q in positive_queries:
            assert is_tsingy_labyrinth_query(q) is True, f"Expected True for: {q}"
            assert detect_tsingy_labyrinth_intent(q) is True, f"Expected True for: {q}"

    def test_negative_and_excluded_queries(self) -> None:
        negative_queries = [
            "",
            "   ",
            "Where is my order #12345?",
            "I want a refund for my climbing gloves",
            "How do I rig a multi-rebelay SRT descent into Xiaozhai Tiankeng giant collapse sinkhole in Chongqing?",
            "What EN 958 energy absorber lanyard do I need for Telluride Via Ferrata in Colorado?",
            "Calculate bridge sway amplitude for Dolomites Kellner night via ferrata moonlight traverse",
            "What trad climbing cam rack do I need for Index Lower Town Wall granite cracks?",
            "Looking for pit cave expeditions in Ellison's Cave Fantastic Pit in Georgia",
            "What is the calcite saturation index for cave pearls in Carlsbad Caverns?",
            "Calculate highline webbing tension for Taft Point Highline in Yosemite",
        ]
        for q in negative_queries:
            assert is_tsingy_labyrinth_query(q) is False, f"Expected False for: {q}"

    def test_cross_domain_disambiguation_guards(self) -> None:
        tsingy_queries = [
            "Scramble rillenkarren razor limestone spires and canopy suspension bridge at Tsingy de Bemaraha Madagascar",
            "Calculate cord cut-through risk and laceration shear index on Ankarana tsingy diaclase slot canyon maze",
            "Gunung Api Mulu Pinnacles razor-limestone arête climb and ladder via ferrata in Borneo Malaysia",
            "Shilin and Naigu Stone Forest pinnacle karst labyrinth navigation in Yunnan China",
        ]
        for q in tsingy_queries:
            assert is_tsingy_labyrinth_query(q) is True
            assert detect_tiankeng_descent_intent(q) is False
            assert detect_via_ferrata_intent(q) is None
            assert detect_night_via_ferrata_intent(q) is None
            assert detect_climbing_intent(q) is None
            assert detect_caving_intent(q) is None
            assert detect_cryokarst_speleology_intent(q) is False
            assert detect_cave_mineralogy_intent(q) is None
            assert detect_scree_running_intent(q) is False
            assert detect_canyon_bouldering_intent(q) is None
            assert extract_highline_intent(q) is None

    def test_extract_tsingy_labyrinth_params(self) -> None:
        query = (
            "Calculate tsingy labyrinth risk for Tsingy de Bemaraha Madagascar with 0.5 mm blade edge radius, "
            "70 m spire height, 54 C rock surface temp, 2.0 m diaclase gap width, and 60% ambient humidity"
        )
        params = extract_tsingy_labyrinth_params(query)
        assert params["site_id"] == "bemaraha-grand-tsingy-madagascar"
        assert params["blade_edge_radius_mm"] == 0.5
        assert params["spire_height_m"] == 70.0
        assert params["rock_surface_temp_c"] == 54.0
        assert params["diaclase_gap_width_m"] == 2.0
        assert params["ambient_humidity_pct"] == 60.0


class TestFormattingChatAndStream:
    """Tests for response formatting, prompt builder, chat handler, and SSE stream generator."""

    def test_format_tsingy_labyrinth_response_actions(self) -> None:
        calc_resp = format_tsingy_labyrinth_response(
            "Calculate tsingy labyrinth laceration shear index for 0.8 mm blade edge radius and 55 m spire height"
        )
        assert calc_resp["action"] == "tsingy_labyrinth_calculated"
        assert "calculation" in calc_resp
        assert "answer" in calc_resp

        lookup_resp = format_tsingy_labyrinth_response(
            "Tell me about Gunung Api and Mulu Pinnacles razor-limestone spires in Borneo Malaysia"
        )
        assert lookup_resp["action"] == "tsingy_labyrinth_lookup"
        assert lookup_resp["matched_site"]["id"] == "mulu-api-pinnacles-borneo-malaysia"

        info_resp = format_tsingy_labyrinth_response(
            "What are the general tropical tsingy pinnacle karst labyrinth and rillenkarren scrambling guidelines?"
        )
        assert info_resp["action"] == "tsingy_labyrinth_info"
        assert len(info_resp["sites"]) == 4

    def test_build_tsingy_labyrinth_prompt(self) -> None:
        prompt = build_tsingy_labyrinth_prompt(
            "How do I avoid cord cut-through and heat exhaustion on Tsingy de Bemaraha rillenkarren spires?"
        )
        assert "Tsingy" in prompt
        assert "Bemaraha" in prompt
        assert "rillenkarren" in prompt.lower() or "diaclase" in prompt.lower()

    def test_chat_handler_and_get_chat_response(self) -> None:
        handled = handle_tsingy_labyrinth_intent(
            "Calculate tsingy labyrinth risk for Bemaraha Grand Tsingy with 0.6 mm blade radius and 65 m spires"
        )
        assert handled is not None
        assert "tsingy_labyrinth_info" in handled
        assert "answer" in handled

        assert handle_tsingy_labyrinth_intent("Check my order refund status") is None

        direct = get_chat_response(
            "Tell me about Shilin and Naigu Stone Forest pinnacle karst in Yunnan China"
        )
        assert "tsingy_labyrinth_info" in direct

    @pytest.mark.anyio
    async def test_stream_events_generators(self) -> None:
        sync_events = list(
            generate_stream_events(
                "Calculate tsingy labyrinth laceration shear index for Ankarana Tsingy at 46 C rock surface temp"
            )
        )
        assert len(sync_events) >= 3
        assert any("tsingy_labyrinth_info" in e for e in sync_events)
        assert sync_events[-1] == "data: [DONE]\n\n"

        async_events = []
        async for chunk in generate_tsingy_labyrinth_stream_events(
            "Scramble Tsingy de Bemaraha rillenkarren razor limestone labyrinth in Madagascar"
        ):
            async_events.append(chunk)
        assert len(async_events) >= 3
        assert any("tsingy_labyrinth_info" in e for e in async_events)
        assert async_events[-1] == "data: [DONE]\n\n"
