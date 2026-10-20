"""Unit tests for the Arctic Polygon-Tundra Ice-Wedge Trough & Thermokarst Thaw-Slump Navigation Guide."""

import pytest
from contoso_chat.thermokarst_tundra import (
    THERMOKARST_SITES,
    THERMOKARST_TUNDRA_GEAR_CHECKLIST,
    THERMOKARST_TUNDRA_SITES,
    build_thermokarst_tundra_prompt,
    calculate_thermokarst_tundra,
    detect_thermokarst_tundra_intent,
    extract_thermokarst_tundra_params,
    filter_sites,
    format_thermokarst_tundra_response,
    generate_stream_events,
    get_all_sites,
    get_all_thermokarst_tundra_sites,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    get_thermokarst_tundra_site_by_id,
    is_thermokarst_tundra_query,
)


class TestThermokarstTundraCatalog:
    """Tests for the thermokarst tundra site catalog and lookup functions."""

    def test_catalog_has_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(THERMOKARST_TUNDRA_SITES) == 4
        assert len(THERMOKARST_SITES) == 4
        assert len(get_all_thermokarst_tundra_sites()) == 4

    def test_expected_site_ids_present(self) -> None:
        site_ids = {s["id"] for s in get_all_sites()}
        expected = {
            "tuktoyaktuk-pingo-polygons-canada",
            "batagaika-mega-slump-yakutia",
            "noatak-foothills-tussock-alaska-usa",
            "bykovsky-lena-alas-tundra-russia",
        }
        assert site_ids == expected

    def test_site_required_fields_and_attr_access(self) -> None:
        required_keys = {
            "id",
            "name",
            "country",
            "region",
            "elevation",
            "elevation_m",
            "morphology",
            "difficulty",
            "default_active_layer_depth_cm",
            "default_trough_water_depth_cm",
            "default_soil_moisture_saturation_pct",
            "default_eriophorum_tussock_height_cm",
            "default_pack_load_kg",
            "primary_hazard",
            "routing_strategy",
            "navigation_protocol",
            "progression_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_keys.issubset(site.keys())
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.morphology == site["morphology"]

    def test_get_site_by_id_exact_and_fuzzy(self) -> None:
        tuk = get_site_by_id("tuktoyaktuk-pingo-polygons-canada")
        assert tuk is not None
        assert tuk["country"] == "Canada"
        assert tuk["morphology"] == "low-center-ice-wedge-polygon"
        assert tuk["difficulty"] == "challenging"

        bata = get_thermokarst_tundra_site_by_id("batagaika")
        assert bata is not None
        assert bata["id"] == "batagaika-mega-slump-yakutia"
        assert bata["country"] == "Russia"
        assert bata["morphology"] == "retrogressive-thaw-slump-headwall"
        assert bata["difficulty"] == "extreme"

        noatak = get_site_by_id("noatak")
        assert noatak is not None
        assert noatak["id"] == "noatak-foothills-tussock-alaska-usa"
        assert noatak["country"] == "United States"
        assert noatak["morphology"] == "high-center-tussock-polygon-trough"

        bykovsky = get_site_by_id("bykovsky")
        assert bykovsky is not None
        assert bykovsky["id"] == "bykovsky-lena-alas-tundra-russia"
        assert bykovsky["morphology"] == "drunken-forest-alas-depression"
        assert bykovsky["difficulty"] == "moderate"

    def test_get_site_by_id_unknown_returns_none(self) -> None:
        assert get_site_by_id("nonexistent-thermokarst-site") is None

    def test_filter_sites_by_country_morphology_and_difficulty(self) -> None:
        russia_sites = filter_sites(country="Russia")
        assert len(russia_sites) == 2

        canada_sites = filter_sites(country="Canada")
        assert len(canada_sites) == 1
        assert canada_sites[0]["id"] == "tuktoyaktuk-pingo-polygons-canada"

        headwall_sites = filter_sites(morphology="retrogressive-thaw-slump-headwall")
        assert len(headwall_sites) == 1
        assert headwall_sites[0]["id"] == "batagaika-mega-slump-yakutia"

        challenging_sites = filter_sites(difficulty="challenging")
        assert len(challenging_sites) == 2

    def test_gear_checklist_has_six_essential_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(THERMOKARST_TUNDRA_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert item["priority"] == "essential"
            assert "item" in item
            assert "category" in item
            assert "rationale" in item


class TestThermokarstTundraCalculator:
    """Tests for the deterministic calculate_thermokarst_tundra engine."""

    def test_default_calculation_returns_expected_keys(self) -> None:
        res = calculate_thermokarst_tundra()
        expected_keys = {
            "active_layer_depth_cm",
            "trough_water_depth_cm",
            "soil_moisture_saturation_pct",
            "eriophorum_tussock_height_cm",
            "pack_load_kg",
            "suprapermafrost_liquefaction_index",
            "boot_suction_entrapment_pct",
            "tussock_ankle_fatigue_multiplier",
            "effective_forward_speed_kmh",
            "risk_level",
            "safety_status",
            "routing_strategy",
            "progression_protocol",
            "warnings",
            "recommendations",
        }
        assert expected_keys.issubset(res.keys())
        assert res["risk_level"] in {"low", "moderate", "high", "critical"}
        assert res["safety_status"] == res["risk_level"]
        assert isinstance(res["warnings"], list)
        assert isinstance(res["recommendations"], list)
        assert len(res["recommendations"]) >= 2

    def test_low_risk_firm_frost_table_conditions(self) -> None:
        res = calculate_thermokarst_tundra(
            active_layer_depth_cm=20.0,
            trough_water_depth_cm=5.0,
            soil_moisture_saturation_pct=35.0,
            eriophorum_tussock_height_cm=10.0,
            pack_load_kg=8.0,
        )
        assert res["risk_level"] == "low"
        assert res["suprapermafrost_liquefaction_index"] < 35.0
        assert res["boot_suction_entrapment_pct"] < 25.0
        assert res["tussock_ankle_fatigue_multiplier"] < 1.5
        assert res["effective_forward_speed_kmh"] >= 2.5

    def test_critical_risk_retrogressive_thaw_slump_conditions(self) -> None:
        res = calculate_thermokarst_tundra(
            active_layer_depth_cm=135.0,
            trough_water_depth_cm=110.0,
            soil_moisture_saturation_pct=96.0,
            eriophorum_tussock_height_cm=60.0,
            pack_load_kg=34.0,
        )
        assert res["risk_level"] == "critical"
        assert res["suprapermafrost_liquefaction_index"] >= 75.0
        assert res["boot_suction_entrapment_pct"] >= 65.0
        assert res["tussock_ankle_fatigue_multiplier"] >= 2.4
        assert res["effective_forward_speed_kmh"] <= 1.2
        assert len(res["warnings"]) >= 3

    def test_monotonicity_across_inputs(self) -> None:
        shallow = calculate_thermokarst_tundra(active_layer_depth_cm=25.0)
        deep = calculate_thermokarst_tundra(active_layer_depth_cm=125.0)
        assert deep["suprapermafrost_liquefaction_index"] > shallow["suprapermafrost_liquefaction_index"]
        assert deep["boot_suction_entrapment_pct"] > shallow["boot_suction_entrapment_pct"]
        assert deep["effective_forward_speed_kmh"] < shallow["effective_forward_speed_kmh"]

        low_tussock = calculate_thermokarst_tundra(eriophorum_tussock_height_cm=10.0)
        high_tussock = calculate_thermokarst_tundra(eriophorum_tussock_height_cm=65.0)
        assert high_tussock["tussock_ankle_fatigue_multiplier"] > low_tussock["tussock_ankle_fatigue_multiplier"]
        assert high_tussock["effective_forward_speed_kmh"] < low_tussock["effective_forward_speed_kmh"]

    @pytest.mark.parametrize(
        "kwargs,expected_field",
        [
            ({"active_layer_depth_cm": 5.0}, "active_layer_depth_cm"),
            ({"active_layer_depth_cm": 175.0}, "active_layer_depth_cm"),
            ({"trough_water_depth_cm": -1.0}, "trough_water_depth_cm"),
            ({"trough_water_depth_cm": 150.0}, "trough_water_depth_cm"),
            ({"soil_moisture_saturation_pct": 10.0}, "soil_moisture_saturation_pct"),
            ({"soil_moisture_saturation_pct": 105.0}, "soil_moisture_saturation_pct"),
            ({"eriophorum_tussock_height_cm": 2.0}, "eriophorum_tussock_height_cm"),
            ({"eriophorum_tussock_height_cm": 80.0}, "eriophorum_tussock_height_cm"),
            ({"pack_load_kg": -2.0}, "pack_load_kg"),
            ({"pack_load_kg": 50.0}, "pack_load_kg"),
        ],
    )
    def test_validation_bounds_raise_value_error(
        self, kwargs: dict[str, float], expected_field: str
    ) -> None:
        with pytest.raises(ValueError, match=expected_field):
            calculate_thermokarst_tundra(**kwargs)


class TestThermokarstTundraIntentAndFormatting:
    """Tests for intent detection, parameter extraction, and response formatting."""

    def test_positive_intent_detection(self) -> None:
        queries = [
            "How do we navigate low-center ice-wedge polygons on the Tuktoyaktuk Peninsula?",
            "Assess retrogressive thaw-slump headwall mudflow risk near Batagaika in Yakutia.",
            "What is the best route across Eriophorum tussocks and flooded ice-wedge troughs in Noatak?",
            "Crossing drunken forest alas depressions on the Bykovsky Peninsula in the Lena Delta.",
            "Calculate thermokarst tundra suprapermafrost liquefaction with 75 cm active layer depth.",
        ]
        for q in queries:
            assert is_thermokarst_tundra_query(q), f"Expected positive intent for: {q}"
            assert detect_thermokarst_tundra_intent(q), f"Expected positive intent for: {q}"

    def test_negative_intent_disambiguation_against_other_domains(self) -> None:
        non_matching = [
            "What boots do you recommend for hiking?",
            "How do I avoid trampling Cladonia stellaris reindeer lichen mats in Rondane?",
            "Navigating coastal Poa foliosa megaherbs and peat bogs on Macquarie Island.",
            "What bog shoes should I use for raised ombrotrophic Sphagnum domes in Soomaa?",
            "How to cross Espeletia frailejón cushion bogs in Páramo de Sumapaz?",
            "Crossing overflow aufeis icing fields in the Momsky Range.",
            "Traversing bouldery rock glacier lobes in Val Muragl.",
        ]
        for q in non_matching:
            assert not is_thermokarst_tundra_query(q), f"Expected negative intent for: {q}"

    def test_extract_params_from_natural_language(self) -> None:
        query = (
            "Calculate thermokarst tundra crossing at Batagaika with active layer depth 95 cm, "
            "trough water depth 60 cm, soil moisture saturation 88%, tussock height 42 cm, "
            "and 24 kg pack load."
        )
        params = extract_thermokarst_tundra_params(query)
        assert params["site_id"] == "batagaika-mega-slump-yakutia"
        assert params["active_layer_depth_cm"] == 95.0
        assert params["trough_water_depth_cm"] == 60.0
        assert params["soil_moisture_saturation_pct"] == 88.0
        assert params["eriophorum_tussock_height_cm"] == 42.0
        assert params["pack_load_kg"] == 24.0
        assert params["has_calc_params"] is True

    def test_format_response_actions_and_prompt_builder(self) -> None:
        calc_info = format_thermokarst_tundra_response(
            "Calculate thermokarst tundra with 80 cm active layer depth and 22 kg pack"
        )
        assert calc_info["action"] == "thermokarst_tundra_calculated"
        assert calc_info["calculation"] is not None

        lookup_info = format_thermokarst_tundra_response(
            "Tell me about Tuktoyaktuk Peninsula ice-wedge polygons"
        )
        assert lookup_info["action"] == "thermokarst_tundra_lookup"
        assert len(lookup_info["matched_sites"]) == 1
        assert lookup_info["matched_sites"][0]["id"] == "tuktoyaktuk-pingo-polygons-canada"

        general_info = format_thermokarst_tundra_response(
            "Give me an overview of thermokarst tundra ice-wedge trough navigation"
        )
        assert general_info["action"] == "thermokarst_tundra_info"
        assert len(general_info["sites"]) == 4

        prompt = build_thermokarst_tundra_prompt(calc_info)
        assert "THERMOKARST" in prompt.upper()
        assert "ESSENTIAL THERMOKARST" in prompt.upper()

    def test_chat_and_stream_helpers(self) -> None:
        chat_res = get_chat_response(
            "How do we cross ice-wedge polygon troughs at Tuktoyaktuk with 65 cm active layer depth?"
        )
        assert "answer" in chat_res
        assert "thermokarst_tundra_info" in chat_res
        assert chat_res["thermokarst_tundra_info"]["action"] == "thermokarst_tundra_calculated"

        events = list(
            generate_stream_events(
                "Tell me about Batagaika retrogressive thaw-slump headwall navigation"
            )
        )
        assert len(events) >= 3
        assert events[0]["thermokarst_tundra_info"]["action"] == "thermokarst_tundra_lookup"
