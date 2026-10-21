"""Unit tests for the Subterranean Ice-Filled Lava Tube & Permafrost Glacière Cave Navigation module."""

import pytest
from contoso_chat.aufeis_crossing import detect_aufeis_crossing_intent
from contoso_chat.cave_mineralogy import detect_cave_mineralogy_intent
from contoso_chat.caving import detect_caving_intent
from contoso_chat.chat import handle_glaciere_caving_intent
from contoso_chat.cryokarst_speleology import detect_cryokarst_speleology_intent
from contoso_chat.glacier_navigation import detect_glacier_intent
from contoso_chat.glaciere_caving import (
    GLACIERE_CAVE_SITES,
    GLACIERE_GEAR_CHECKLIST,
    GLACIERE_SITES,
    build_glaciere_caving_prompt,
    calculate_glaciere_caving,
    detect_glaciere_caving_intent,
    extract_glaciere_caving_params,
    filter_sites,
    format_glaciere_caving_response,
    generate_stream_events,
    get_all_glaciere_sites,
    get_all_sites,
    get_chat_response,
    get_gear_checklist,
    get_glaciere_site_by_id,
    get_site_by_id,
    is_glaciere_caving_query,
)
from contoso_chat.ice_climbing import detect_ice_climbing_intent
from contoso_chat.lava_tube_biospeleology import detect_lava_tube_biospeleology_intent
from contoso_chat.mountaineering import detect_mountaineering_intent
from contoso_chat.rock_glacier_navigation import detect_rock_glacier_navigation_intent
from contoso_chat.stream import generate_glaciere_caving_stream_events


class TestGlaciereSitesCatalog:
    """Tests for the 4-site glacière cave catalog and lookup/filter functions."""

    def test_get_all_sites_returns_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(GLACIERE_CAVE_SITES) == 4
        assert len(GLACIERE_SITES) == 4
        assert len(get_all_glaciere_sites()) == 4

    def test_site_ids_match_specification(self) -> None:
        ids = {s["id"] for s in get_all_sites()}
        assert ids == {
            "eisriesenwelt-tennengebirge-austria",
            "scarisoara-glaciere-apuseni-romania",
            "bandera-ice-cave-el-malpais-usa",
            "lofthellir-lava-glaciere-iceland",
        }

    def test_sites_have_required_fields(self) -> None:
        required_fields = {
            "id",
            "name",
            "country",
            "region",
            "elevation",
            "elevation_m",
            "morphology",
            "difficulty",
            "default_floor_ice_slope_deg",
            "default_cave_air_temp_c",
            "default_meltwater_film_mm",
            "co2_ppm",
            "hoarfrost_ceiling_thickness_cm",
            "traction_recommendation",
            "primary_hazard",
            "navigation_protocol",
            "descent_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_fields.issubset(set(site.keys()))
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.morphology == site["morphology"]

    def test_get_site_by_id_found(self) -> None:
        site = get_site_by_id("eisriesenwelt-tennengebirge-austria")
        assert site is not None
        assert site["name"] == "Eisriesenwelt Dynamic Wind-Chimney Ice Labyrinth"
        assert site["country"] == "Austria"
        assert site["morphology"] == "dynamic-chimney-karst-ice"
        assert site["difficulty"] == "challenging"

        alias_site = get_glaciere_site_by_id("lofthellir-lava-glaciere-iceland")
        assert alias_site is not None
        assert alias_site["country"] == "Iceland"
        assert alias_site["morphology"] == "permafrost-fissure-glaciere"
        assert alias_site["difficulty"] == "extreme"

    def test_get_site_by_id_not_found(self) -> None:
        assert get_site_by_id("nonexistent-glaciere") is None

    def test_filter_sites_by_country(self) -> None:
        results = filter_sites(country="Romania")
        assert len(results) == 1
        assert results[0]["id"] == "scarisoara-glaciere-apuseni-romania"

    def test_filter_sites_by_morphology(self) -> None:
        results = filter_sites(morphology="static-cold-trap-lava-tube")
        assert len(results) == 1
        assert results[0]["id"] == "bandera-ice-cave-el-malpais-usa"

    def test_filter_sites_by_difficulty(self) -> None:
        challenging = filter_sites(difficulty="challenging")
        assert len(challenging) == 2
        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 1
        assert extreme[0]["id"] == "lofthellir-lava-glaciere-iceland"
        moderate = filter_sites(difficulty="moderate")
        assert len(moderate) == 1
        assert moderate[0]["id"] == "bandera-ice-cave-el-malpais-usa"

    def test_filter_sites_by_search(self) -> None:
        results = filter_sites(search="Lofthellir")
        assert len(results) == 1
        assert results[0]["id"] == "lofthellir-lava-glaciere-iceland"


class TestGlaciereCavingCalculator:
    """Tests for the Subterranean Glacière Cave Safety & Traction Calculator."""

    def test_low_risk_calculation_microspikes(self) -> None:
        result = calculate_glaciere_caving(
            floor_ice_slope_deg=8.0,
            cave_air_temp_c=-4.5,
            meltwater_film_mm=0.2,
            co2_ppm=550.0,
            hoarfrost_ceiling_thickness_cm=6.0,
        )
        assert result["risk_level"] == "low"
        assert result["safety_status"] == "low"
        assert result["traction_class"] == "microspikes-10pt"
        assert result["ice_friction_coefficient"] > 0.15
        assert result["crampon_shear_safety_factor"] > 1.8
        assert result["hoarfrost_detachment_risk_pct"] < 25.0
        assert result["hypoxic_co2_index"] < 20.0
        assert isinstance(result["warnings"], list)
        assert len(result["recommendations"]) >= 1

    def test_moderate_risk_calculation_steel_12pt_crampons(self) -> None:
        result = calculate_glaciere_caving(
            floor_ice_slope_deg=20.0,
            cave_air_temp_c=-2.0,
            meltwater_film_mm=1.2,
            co2_ppm=900.0,
            hoarfrost_ceiling_thickness_cm=18.0,
        )
        assert result["risk_level"] in ("moderate", "low")
        assert result["traction_class"] == "steel-12pt-crampons-ice-axe"
        assert result["crampon_shear_safety_factor"] >= 1.0
        assert len(result["recommendations"]) >= 1

    def test_high_risk_steep_slope_front_point_dual_tools(self) -> None:
        result = calculate_glaciere_caving(
            floor_ice_slope_deg=36.0,
            cave_air_temp_c=-1.5,
            meltwater_film_mm=2.5,
            co2_ppm=2800.0,
            hoarfrost_ceiling_thickness_cm=42.0,
        )
        assert result["risk_level"] in ("high", "critical")
        assert result["traction_class"] in (
            "front-point-dual-tools-ice-screws",
            "abort-glaze-co2-collapse-hazard",
        )
        assert len(result["warnings"]) >= 1

    def test_critical_risk_glaze_co2_and_hoarfrost_collapse_abort(self) -> None:
        result = calculate_glaciere_caving(
            floor_ice_slope_deg=48.0,
            cave_air_temp_c=2.5,
            meltwater_film_mm=8.0,
            co2_ppm=12000.0,
            hoarfrost_ceiling_thickness_cm=75.0,
        )
        assert result["risk_level"] == "critical"
        assert result["safety_status"] == "critical"
        assert result["traction_class"] == "abort-glaze-co2-collapse-hazard"
        assert result["hoarfrost_detachment_risk_pct"] >= 60.0
        assert result["hypoxic_co2_index"] >= 50.0
        assert len(result["warnings"]) >= 2

    def test_monotonic_physics_relationships(self) -> None:
        # Wet warm ice has lower friction than cold dry ice
        cold_dry = calculate_glaciere_caving(
            floor_ice_slope_deg=18.0,
            cave_air_temp_c=-6.0,
            meltwater_film_mm=0.0,
            co2_ppm=600.0,
            hoarfrost_ceiling_thickness_cm=10.0,
        )
        warm_wet = calculate_glaciere_caving(
            floor_ice_slope_deg=18.0,
            cave_air_temp_c=1.5,
            meltwater_film_mm=5.0,
            co2_ppm=600.0,
            hoarfrost_ceiling_thickness_cm=10.0,
        )
        assert warm_wet["ice_friction_coefficient"] < cold_dry["ice_friction_coefficient"]
        assert warm_wet["crampon_shear_safety_factor"] < cold_dry["crampon_shear_safety_factor"]

        # Steeper slope reduces crampon shear safety factor
        gentle = calculate_glaciere_caving(floor_ice_slope_deg=10.0)
        steep = calculate_glaciere_caving(floor_ice_slope_deg=42.0)
        assert steep["crampon_shear_safety_factor"] < gentle["crampon_shear_safety_factor"]

        # Thicker hoarfrost & warmer cave air increases detachment risk
        thin_cold = calculate_glaciere_caving(cave_air_temp_c=-5.0, hoarfrost_ceiling_thickness_cm=8.0)
        thick_warm = calculate_glaciere_caving(cave_air_temp_c=2.0, hoarfrost_ceiling_thickness_cm=65.0)
        assert thick_warm["hoarfrost_detachment_risk_pct"] > thin_cold["hoarfrost_detachment_risk_pct"]

        # Higher CO2 increases hypoxic index
        low_co2 = calculate_glaciere_caving(co2_ppm=500.0)
        high_co2 = calculate_glaciere_caving(co2_ppm=15000.0)
        assert high_co2["hypoxic_co2_index"] > low_co2["hypoxic_co2_index"]

    def test_validation_out_of_bounds_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="floor_ice_slope_deg"):
            calculate_glaciere_caving(floor_ice_slope_deg=-2.0)
        with pytest.raises(ValueError, match="floor_ice_slope_deg"):
            calculate_glaciere_caving(floor_ice_slope_deg=65.0)
        with pytest.raises(ValueError, match="cave_air_temp_c"):
            calculate_glaciere_caving(cave_air_temp_c=-25.0)
        with pytest.raises(ValueError, match="cave_air_temp_c"):
            calculate_glaciere_caving(cave_air_temp_c=15.0)
        with pytest.raises(ValueError, match="meltwater_film_mm"):
            calculate_glaciere_caving(meltwater_film_mm=-1.0)
        with pytest.raises(ValueError, match="meltwater_film_mm"):
            calculate_glaciere_caving(meltwater_film_mm=30.0)
        with pytest.raises(ValueError, match="co2_ppm"):
            calculate_glaciere_caving(co2_ppm=200.0)
        with pytest.raises(ValueError, match="co2_ppm"):
            calculate_glaciere_caving(co2_ppm=60000.0)
        with pytest.raises(ValueError, match="hoarfrost_ceiling_thickness_cm"):
            calculate_glaciere_caving(hoarfrost_ceiling_thickness_cm=-5.0)
        with pytest.raises(ValueError, match="hoarfrost_ceiling_thickness_cm"):
            calculate_glaciere_caving(hoarfrost_ceiling_thickness_cm=150.0)


class TestGearChecklist:
    """Tests for the 6-item mandatory glacière gear checklist."""

    def test_get_gear_checklist_returns_six_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(GLACIERE_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert "item" in item
            assert "category" in item
            assert "priority" in item
            assert "rationale" in item
            assert item["priority"] == "essential"


class TestIntentDetectionAndDisambiguation:
    """Tests for glacière intent detection, parameter extraction, and cross-domain disambiguation."""

    def test_positive_glaciere_intent_queries(self) -> None:
        positive_queries = [
            "How do I navigate a subterranean glacière cave with a 25 degree floor ice slope?",
            "Tell me about Eisriesenwelt dynamic wind-chimney ice labyrinth in Austria",
            "What traction do I need for Scărișoara glaciere firn plug pit in Romania?",
            "Bandera ice cave cold-trap lava tube navigation protocol",
            "Lofthellir lava glaciere permafrost fissure cave in Iceland",
            "Calculate glaciere cave ice friction and hoarfrost ceiling detachment risk",
            "How does the Balch effect trap cold air in an ice-filled lava tube?",
        ]
        for q in positive_queries:
            assert is_glaciere_caving_query(q) is True, f"Expected True for: {q}"
            assert detect_glaciere_caving_intent(q) is True, f"Expected True for: {q}"

    def test_negative_and_excluded_queries(self) -> None:
        negative_queries = [
            "",
            "   ",
            "Where is my order #12345?",
            "I want a refund for my damaged boots",
            "Tell me about Matanuska glacier moulin cryokarst shaft",
            "Calculate troglobite endemism index for Kazumura Cave lava tube biospeleology",
            "Where can I see cave pearls and aragonite anthodites?",
            "How do I cross river icing aufeis overflow in the Brooks Range?",
            "Rock glacier talus navigation on interstitial ice",
        ]
        for q in negative_queries:
            assert is_glaciere_caving_query(q) is False, f"Expected False for: {q}"

    def test_cross_domain_disambiguation_guards(self) -> None:
        glaciere_queries = [
            "Navigate subterranean glacière cave at Eisriesenwelt with 12-point crampons",
            "Check CO2 pooling and hoarfrost ceiling detachment in Lofthellir ice-filled lava tube",
            "Bandera ice cave static cold-trap lava tube Balch effect navigation",
            "Scărișoara glaciere stratified firn-plug pit descent with ice screws",
        ]
        for q in glaciere_queries:
            assert is_glaciere_caving_query(q) is True
            assert detect_cryokarst_speleology_intent(q) is False
            assert detect_lava_tube_biospeleology_intent(q) is False
            assert detect_caving_intent(q) is None
            assert detect_cave_mineralogy_intent(q) is None
            assert detect_ice_climbing_intent(q) is None
            assert detect_rock_glacier_navigation_intent(q) is False
            assert detect_aufeis_crossing_intent(q) is False
            assert detect_glacier_intent(q) is None
            assert detect_mountaineering_intent(q) is None

    def test_extract_glaciere_caving_params(self) -> None:
        query = (
            "Calculate glaciere caving for Lofthellir with 32 deg slope, "
            "-1.5°C cave temp, 3.5 mm meltwater film, 2400 ppm CO2, and 35 cm hoarfrost"
        )
        params = extract_glaciere_caving_params(query)
        assert params["site_id"] == "lofthellir-lava-glaciere-iceland"
        assert params["floor_ice_slope_deg"] == 32.0
        assert params["cave_air_temp_c"] == -1.5
        assert params["meltwater_film_mm"] == 3.5
        assert params["co2_ppm"] == 2400.0
        assert params["hoarfrost_ceiling_thickness_cm"] == 35.0


class TestFormattingChatAndStream:
    """Tests for response formatting, prompt builder, chat handler, and SSE stream generator."""

    def test_format_glaciere_caving_response_actions(self) -> None:
        calc_resp = format_glaciere_caving_response(
            "Calculate glaciere safety for 28 deg slope and 1800 ppm co2"
        )
        assert calc_resp["action"] == "glaciere_caving_calculated"
        assert "calculation" in calc_resp
        assert "answer" in calc_resp

        lookup_resp = format_glaciere_caving_response(
            "Tell me about Eisriesenwelt glaciere cave in Austria"
        )
        assert lookup_resp["action"] == "glaciere_caving_lookup"
        assert lookup_resp["matched_site"]["id"] == "eisriesenwelt-tennengebirge-austria"

        info_resp = format_glaciere_caving_response(
            "What are the general glacière cave cold-trap navigation guidelines?"
        )
        assert info_resp["action"] == "glaciere_caving_info"
        assert len(info_resp["sites"]) == 4

    def test_build_glaciere_caving_prompt(self) -> None:
        prompt = build_glaciere_caving_prompt("How do I navigate Lofthellir lava glaciere?")
        assert "Glacière" in prompt or "Glaciere" in prompt
        assert "Lofthellir" in prompt
        assert "Balch" in prompt or "cold-trap" in prompt

    def test_chat_handler_and_get_chat_response(self) -> None:
        handled = handle_glaciere_caving_intent(
            "Calculate glacière traction for Scărișoara with 24 deg floor ice slope"
        )
        assert handled is not None
        assert "glaciere_caving_info" in handled
        assert "answer" in handled

        assert handle_glaciere_caving_intent("Check my order refund status") is None

        direct = get_chat_response("Tell me about Bandera ice cave cold-trap lava tube")
        assert "glaciere_caving_info" in direct

    @pytest.mark.anyio
    async def test_stream_events_generators(self) -> None:
        sync_events = list(
            generate_stream_events("Calculate glaciere safety for Lofthellir at 30 deg slope")
        )
        assert len(sync_events) >= 3
        assert any("glaciere_caving_info" in e for e in sync_events)
        assert sync_events[-1] == "data: [DONE]\n\n"

        async_events = []
        async for chunk in generate_glaciere_caving_stream_events(
            "Navigate Eisriesenwelt glacière cave floor ice"
        ):
            async_events.append(chunk)
        assert len(async_events) >= 3
        assert any("glaciere_caving_info" in e for e in async_events)
        assert async_events[-1] == "data: [DONE]\n\n"
