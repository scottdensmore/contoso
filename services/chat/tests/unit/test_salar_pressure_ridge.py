"""Unit tests for the High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking Guide."""

import pytest
from contoso_chat.acclimatization import detect_acclimatization_intent
from contoso_chat.crevasse_pulk import detect_crevasse_pulk_intent
from contoso_chat.desert_trekking import detect_desert_trekking_intent
from contoso_chat.hot_springs import detect_hot_spring_intent
from contoso_chat.orienteering import extract_orienteering_intent
from contoso_chat.pack_llama import detect_pack_llama_intent
from contoso_chat.penitentes_navigation import is_penitentes_navigation_query
from contoso_chat.salar_pressure_ridge import (
    SALAR_PRESSURE_RIDGE_GEAR_CHECKLIST,
    SALAR_PRESSURE_RIDGE_SITES,
    SALAR_SITES,
    build_salar_pressure_ridge_prompt,
    calculate_salar_pressure_ridge,
    detect_salar_pressure_ridge_intent,
    extract_salar_pressure_ridge_params,
    filter_sites,
    format_salar_pressure_ridge_response,
    generate_stream_events,
    get_all_salar_pressure_ridge_sites,
    get_all_sites,
    get_chat_response,
    get_gear_checklist,
    get_salar_pressure_ridge_site_by_id,
    get_site_by_id,
    is_salar_pressure_ridge_query,
)
from contoso_chat.salt_pan_navigation import is_salt_pan_navigation_query
from contoso_chat.solfatara_navigation import is_solfatara_navigation_query
from contoso_chat.thermokarst_tundra import is_thermokarst_tundra_query
from contoso_chat.yardang_navigation import is_yardang_navigation_query


class TestSalarPressureRidgeCatalog:
    """Tests for the high-altitude salar pressure-ridge site catalog and lookup functions."""

    def test_catalog_has_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(SALAR_PRESSURE_RIDGE_SITES) == 4
        assert len(SALAR_SITES) == 4
        assert len(get_all_salar_pressure_ridge_sites()) == 4

    def test_expected_site_ids_present(self) -> None:
        site_ids = {s["id"] for s in get_all_sites()}
        expected = {
            "uyuni-incahuasi-ojos-bolivia",
            "atacama-soncor-cordillera-sal-chile",
            "arizaro-cono-arita-puna-argentina",
            "chalviri-termas-polques-bolivia",
        }
        assert site_ids == expected

    def test_site_required_fields_and_attr_access(self) -> None:
        required_keys = {
            "id",
            "name",
            "country",
            "region",
            "elevation_range",
            "max_elevation_m",
            "morphology",
            "difficulty",
            "default_crust_thickness_cm",
            "default_brine_eye_proximity_m",
            "default_ridge_relief_cm",
            "default_solar_uv_index",
            "default_packsled_load_kg",
            "primary_hazard",
            "traversal_strategy",
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
        uyuni = get_site_by_id("uyuni-incahuasi-ojos-bolivia")
        assert uyuni is not None
        assert uyuni["country"] == "Bolivia"
        assert uyuni["morphology"] == "ojos-del-salar-brine-upwelling"
        assert uyuni["difficulty"] == "challenging"

        atacama = get_salar_pressure_ridge_site_by_id("atacama")
        assert atacama is not None
        assert atacama["id"] == "atacama-soncor-cordillera-sal-chile"
        assert atacama["country"] == "Chile"
        assert atacama["morphology"] == "corrugated-gypsum-chevron-crust"
        assert atacama["difficulty"] == "extreme"

        arizaro = get_site_by_id("arizaro")
        assert arizaro is not None
        assert arizaro["id"] == "arizaro-cono-arita-puna-argentina"
        assert arizaro["country"] == "Argentina"
        assert arizaro["morphology"] == "polygonal-halite-pressure-crust"
        assert arizaro["difficulty"] == "extreme"

        chalviri = get_site_by_id("chalviri")
        assert chalviri is not None
        assert chalviri["id"] == "chalviri-termas-polques-bolivia"
        assert chalviri["country"] == "Bolivia"
        assert chalviri["morphology"] == "borate-mirabilite-mud-margin"
        assert chalviri["difficulty"] == "moderate"

    def test_get_site_by_id_unknown_returns_none(self) -> None:
        assert get_site_by_id("nonexistent-salar-site") is None
        assert get_site_by_id("") is None

    def test_filter_sites_by_country_morphology_difficulty_and_search(self) -> None:
        bolivia_sites = filter_sites(country="Bolivia")
        assert len(bolivia_sites) == 2
        assert {s["id"] for s in bolivia_sites} == {
            "uyuni-incahuasi-ojos-bolivia",
            "chalviri-termas-polques-bolivia",
        }

        chile_sites = filter_sites(country="Chile")
        assert len(chile_sites) == 1
        assert chile_sites[0]["id"] == "atacama-soncor-cordillera-sal-chile"

        morph_sites = filter_sites(morphology="polygonal-halite-pressure-crust")
        assert len(morph_sites) == 1
        assert morph_sites[0]["id"] == "arizaro-cono-arita-puna-argentina"

        extreme_sites = filter_sites(difficulty="extreme")
        assert len(extreme_sites) == 2

        search_sites = filter_sites(search="Cono de Arita")
        assert len(search_sites) == 1
        assert search_sites[0]["id"] == "arizaro-cono-arita-puna-argentina"

    def test_gear_checklist_has_six_essential_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(SALAR_PRESSURE_RIDGE_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert item["priority"] == "essential"
            assert "item" in item
            assert "category" in item
            assert "rationale" in item


class TestSalarPressureRidgeCalculator:
    """Tests for the deterministic calculate_salar_pressure_ridge engine."""

    def test_default_calculation_returns_expected_keys(self) -> None:
        res = calculate_salar_pressure_ridge(
            crust_thickness_cm=28.0,
            brine_eye_proximity_m=25.0,
            ridge_relief_cm=32.0,
            solar_uv_index=14.0,
            packsled_load_kg=45.0,
        )
        expected_keys = {
            "crust_thickness_cm",
            "brine_eye_proximity_m",
            "ridge_relief_cm",
            "solar_uv_index",
            "packsled_load_kg",
            "crust_punch_through_probability_pct",
            "effective_albedo_uv_dose_index",
            "sole_laceration_wear_rate_mm_per_10km",
            "brine_hypothermia_immersion_risk_pct",
            "risk_level",
            "safety_status",
            "traversal_strategy",
            "warnings",
            "recommendations",
        }
        assert expected_keys.issubset(res.keys())
        assert res["risk_level"] in {"low", "moderate", "high", "critical"}
        assert res["safety_status"] == res["risk_level"]
        assert isinstance(res["warnings"], list)
        assert isinstance(res["recommendations"], list)
        assert len(res["recommendations"]) >= 2

    def test_low_risk_thick_halite_crust_conditions(self) -> None:
        res = calculate_salar_pressure_ridge(
            crust_thickness_cm=110.0,
            brine_eye_proximity_m=150.0,
            ridge_relief_cm=8.0,
            solar_uv_index=5.0,
            packsled_load_kg=18.0,
        )
        assert res["risk_level"] == "low"
        assert res["crust_punch_through_probability_pct"] < 20.0
        assert res["effective_albedo_uv_dose_index"] < 12.0
        assert res["sole_laceration_wear_rate_mm_per_10km"] < 2.0
        assert res["brine_hypothermia_immersion_risk_pct"] < 20.0

    def test_critical_risk_thin_crust_ojos_del_salar_conditions(self) -> None:
        res = calculate_salar_pressure_ridge(
            crust_thickness_cm=4.0,
            brine_eye_proximity_m=2.0,
            ridge_relief_cm=95.0,
            solar_uv_index=20.0,
            packsled_load_kg=135.0,
        )
        assert res["risk_level"] == "critical"
        assert res["crust_punch_through_probability_pct"] >= 70.0
        assert res["effective_albedo_uv_dose_index"] >= 24.0
        assert res["sole_laceration_wear_rate_mm_per_10km"] >= 4.0
        assert res["brine_hypothermia_immersion_risk_pct"] >= 68.0
        assert len(res["warnings"]) >= 3

    def test_monotonicity_across_inputs(self) -> None:
        thick_crust = calculate_salar_pressure_ridge(
            crust_thickness_cm=120.0,
            brine_eye_proximity_m=80.0,
            ridge_relief_cm=20.0,
            solar_uv_index=12.0,
            packsled_load_kg=30.0,
        )
        thin_crust = calculate_salar_pressure_ridge(
            crust_thickness_cm=5.0,
            brine_eye_proximity_m=4.0,
            ridge_relief_cm=20.0,
            solar_uv_index=12.0,
            packsled_load_kg=120.0,
        )
        assert (
            thin_crust["crust_punch_through_probability_pct"]
            > thick_crust["crust_punch_through_probability_pct"]
        )
        assert (
            thin_crust["brine_hypothermia_immersion_risk_pct"]
            > thick_crust["brine_hypothermia_immersion_risk_pct"]
        )

        low_relief = calculate_salar_pressure_ridge(
            crust_thickness_cm=40.0,
            brine_eye_proximity_m=50.0,
            ridge_relief_cm=5.0,
            solar_uv_index=6.0,
            packsled_load_kg=25.0,
        )
        high_relief = calculate_salar_pressure_ridge(
            crust_thickness_cm=40.0,
            brine_eye_proximity_m=50.0,
            ridge_relief_cm=105.0,
            solar_uv_index=21.0,
            packsled_load_kg=130.0,
        )
        assert (
            high_relief["sole_laceration_wear_rate_mm_per_10km"]
            > low_relief["sole_laceration_wear_rate_mm_per_10km"]
        )
        assert (
            high_relief["effective_albedo_uv_dose_index"]
            > low_relief["effective_albedo_uv_dose_index"]
        )

    @pytest.mark.parametrize(
        "kwargs,expected_field",
        [
            ({"crust_thickness_cm": 0.4}, "crust_thickness_cm"),
            ({"crust_thickness_cm": 160.0}, "crust_thickness_cm"),
            ({"brine_eye_proximity_m": 0.2}, "brine_eye_proximity_m"),
            ({"brine_eye_proximity_m": 220.0}, "brine_eye_proximity_m"),
            ({"ridge_relief_cm": 1.0}, "ridge_relief_cm"),
            ({"ridge_relief_cm": 135.0}, "ridge_relief_cm"),
            ({"solar_uv_index": 0.5}, "solar_uv_index"),
            ({"solar_uv_index": 25.0}, "solar_uv_index"),
            ({"packsled_load_kg": 5.0}, "packsled_load_kg"),
            ({"packsled_load_kg": 180.0}, "packsled_load_kg"),
        ],
    )
    def test_validation_bounds_raise_value_error(
        self, kwargs: dict[str, float], expected_field: str
    ) -> None:
        base = {
            "crust_thickness_cm": 28.0,
            "brine_eye_proximity_m": 25.0,
            "ridge_relief_cm": 32.0,
            "solar_uv_index": 14.0,
            "packsled_load_kg": 45.0,
        }
        base.update(kwargs)
        with pytest.raises(ValueError, match=expected_field):
            calculate_salar_pressure_ridge(**base)


class TestSalarPressureRidgeIntentAndFormatting:
    """Tests for intent detection, parameter extraction, response formatting, and disambiguation."""

    def test_positive_intent_detection(self) -> None:
        queries = [
            "How do we navigate Ojos del Salar brine upwellings on Salar de Uyuni near Isla Incahuasi?",
            "Assess Salar de Atacama Laguna Chaxa and Cordillera de la Sal halite pressure ridge trekking.",
            "What is the best traversal strategy for Salar de Arizaro and Cono de Arita polygonal halite pressure ridge?",
            "How do we cross the Salar de Chalviri and Termas de Polques mirabilite crust margin?",
            "Calculate salar pressure ridge risk with crust thickness 18 cm, brine eye proximity 8 m, and ridge relief 55 cm.",
        ]
        for q in queries:
            assert is_salar_pressure_ridge_query(q), f"Expected positive intent for: {q}"
            assert detect_salar_pressure_ridge_intent(q), f"Expected positive intent for: {q}"

    def test_negative_intent_and_cross_domain_disambiguation(self) -> None:
        non_matching = [
            "What boots do you recommend for hiking?",
            "Where is my order #12345?",
            "Calculate salt pan crust bearing capacity for Makgadikgadi Ntwetwe traverse",
            "Chott el Djerid sebkha mirage compass navigation and Fata Morgana refraction",
            "Bonneville Salt Flats wet capillary brine crust and sighting distance",
            "Tell me about Salar de Uyuni Incahuasi halite polygon basin site details",
            "How do we navigate penitentes ablation blades on Aconcagua Polish Glacier?",
            "Evaluate Dasht-e Lut kalut yardangs and Badain Jaran mega-dune slip-faces.",
            "How do we cross El Tatio fumarole sinter crust with a 4-gas H2S detector?",
        ]
        for q in non_matching:
            assert not is_salar_pressure_ridge_query(q), f"Expected negative intent for: {q}"

        # Verify adjacent domains do not hijack salar_pressure_ridge queries
        salar_queries = [
            "How do we trek across Salar de Uyuni Isla Incahuasi and Colchani Ojos del Salar brine eyes?",
            "Calculate salar pressure ridge sole laceration on Salar de Atacama Cordillera de la Sal with 65 cm ridge relief",
            "Traversing Salar de Arizaro and Cono de Arita black-halite pressure ridge with a 55 kg packsled",
            "High altitude salar pressure ridge trekking at Salar de Chalviri and Termas de Polques mirabilite crust",
        ]
        for sq in salar_queries:
            assert is_salar_pressure_ridge_query(sq) is True
            assert is_salt_pan_navigation_query(sq) is False
            assert detect_desert_trekking_intent(sq) is None
            assert is_penitentes_navigation_query(sq) is False
            assert is_yardang_navigation_query(sq) is False
            assert is_solfatara_navigation_query(sq) is False
            assert detect_hot_spring_intent(sq) is None
            assert detect_acclimatization_intent(sq) is None
            assert detect_pack_llama_intent(sq) is None
            assert detect_crevasse_pulk_intent(sq) is False
            assert extract_orienteering_intent(sq) is None
            assert is_thermokarst_tundra_query(sq) is False

    def test_extract_params_from_natural_language(self) -> None:
        query = (
            "Calculate salar pressure ridge risk on Salar de Atacama with crust thickness 14 cm, "
            "brine eye proximity 6.5 m, ridge relief 68 cm, solar uv index 18, "
            "and packsled load 62 kg."
        )
        params = extract_salar_pressure_ridge_params(query)
        assert params["site_id"] == "atacama-soncor-cordillera-sal-chile"
        assert params["crust_thickness_cm"] == 14.0
        assert params["brine_eye_proximity_m"] == 6.5
        assert params["ridge_relief_cm"] == 68.0
        assert params["solar_uv_index"] == 18.0
        assert params["packsled_load_kg"] == 62.0
        assert params["has_calc_params"] is True

    def test_format_response_actions_and_prompt_builder(self) -> None:
        calc_info = format_salar_pressure_ridge_response(
            "Calculate salar pressure ridge risk with crust thickness 16 cm, brine eye proximity 9 m, and ridge relief 50 cm"
        )
        assert calc_info["action"] == "salar_pressure_ridge_calculated"
        assert calc_info["calculation"] is not None

        lookup_info = format_salar_pressure_ridge_response(
            "Tell me about Salar de Arizaro and Cono de Arita black-halite pressure ridge trekking in Argentina"
        )
        assert lookup_info["action"] == "salar_pressure_ridge_lookup"
        assert len(lookup_info["matched_sites"]) == 1
        assert lookup_info["matched_sites"][0]["id"] == "arizaro-cono-arita-puna-argentina"

        general_info = format_salar_pressure_ridge_response(
            "Give me an overview of high-altitude salar brine-pool and polygonal halite pressure-ridge trekking"
        )
        assert general_info["action"] == "salar_pressure_ridge_info"
        assert len(general_info["sites"]) == 4

        prompt = build_salar_pressure_ridge_prompt(calc_info)
        assert "SALAR" in prompt.upper()
        assert "PRESSURE-RIDGE" in prompt.upper()

    def test_chat_and_stream_helpers(self) -> None:
        chat_res = get_chat_response(
            "How do we cross Salar de Uyuni Ojos del Salar with crust thickness 12 cm and brine eye proximity 5 m?"
        )
        assert "answer" in chat_res
        assert "salar_pressure_ridge_info" in chat_res
        assert chat_res["salar_pressure_ridge_info"]["action"] == "salar_pressure_ridge_calculated"

        events = list(
            generate_stream_events(
                "Tell me about Salar de Chalviri and Laguna Salada borate-mirabilite margin trekking"
            )
        )
        assert len(events) >= 3
        assert events[0]["salar_pressure_ridge_info"]["action"] == "salar_pressure_ridge_lookup"
