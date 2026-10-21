"""Unit tests for the Subterranean Cenote Halocline & Anchialine Phreatic Cave-Passage Navigation Guide."""

import pytest
from contoso_chat.cenote_halocline import (
    CENOTE_HALOCLINE_GEAR_CHECKLIST,
    CENOTE_HALOCLINE_SITES,
    CENOTE_SITES,
    build_cenote_halocline_prompt,
    calculate_cenote_halocline,
    detect_cenote_halocline_intent,
    extract_cenote_halocline_params,
    filter_sites,
    format_cenote_halocline_response,
    generate_stream_events,
    get_all_cenote_halocline_sites,
    get_all_sites,
    get_cenote_halocline_site_by_id,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    is_cenote_halocline_query,
)


class TestCenoteHaloclineCatalog:
    """Tests for the cenote halocline site catalog and lookup functions."""

    def test_catalog_has_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(CENOTE_HALOCLINE_SITES) == 4
        assert len(CENOTE_SITES) == 4
        assert len(get_all_cenote_halocline_sites()) == 4

    def test_expected_site_ids_present(self) -> None:
        site_ids = {s["id"] for s in get_all_sites()}
        expected = {
            "ox-bel-ha-halocline-tulum-mexico",
            "angelita-h2s-cloud-tulum-mexico",
            "sac-actun-pet-cembalo-mexico",
            "dan-s-cave-abaco-anchialine-bahamas",
        }
        assert site_ids == expected

    def test_site_required_fields_and_attr_access(self) -> None:
        required_keys = {
            "id",
            "name",
            "country",
            "region",
            "depth_range",
            "max_depth_m",
            "morphology",
            "difficulty",
            "default_salinity_delta_ppt",
            "default_tannic_doc_mg_l",
            "default_silt_clay_fraction_pct",
            "default_penetration_distance_m",
            "default_h2s_concentration_ppm",
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
        ox = get_site_by_id("ox-bel-ha-halocline-tulum-mexico")
        assert ox is not None
        assert ox["country"] == "Mexico"
        assert ox["morphology"] == "anchialine-halocline-conduit"
        assert ox["difficulty"] == "extreme"

        angelita = get_cenote_halocline_site_by_id("angelita")
        assert angelita is not None
        assert angelita["id"] == "angelita-h2s-cloud-tulum-mexico"
        assert angelita["country"] == "Mexico"
        assert angelita["morphology"] == "meromictic-h2s-cloud-bell-sinkhole"
        assert angelita["difficulty"] == "challenging"

        sac = get_site_by_id("sac-actun")
        assert sac is not None
        assert sac["id"] == "sac-actun-pet-cembalo-mexico"
        assert sac["country"] == "Mexico"
        assert sac["morphology"] == "decorated-speleothem-phreatic-maze"
        assert sac["difficulty"] == "moderate"

        dans = get_site_by_id("abaco")
        assert dans is not None
        assert dans["id"] == "dan-s-cave-abaco-anchialine-bahamas"
        assert dans["country"] == "Bahamas"
        assert dans["morphology"] == "coastal-tidal-siphon-blue-hole"
        assert dans["difficulty"] == "extreme"

    def test_get_site_by_id_unknown_returns_none(self) -> None:
        assert get_site_by_id("nonexistent-cenote-site") is None

    def test_filter_sites_by_country_morphology_difficulty_and_search(self) -> None:
        mexico_sites = filter_sites(country="Mexico")
        assert len(mexico_sites) == 3

        bahamas_sites = filter_sites(country="Bahamas")
        assert len(bahamas_sites) == 1
        assert bahamas_sites[0]["id"] == "dan-s-cave-abaco-anchialine-bahamas"

        meromictic_sites = filter_sites(morphology="meromictic-h2s-cloud-bell-sinkhole")
        assert len(meromictic_sites) == 1
        assert meromictic_sites[0]["id"] == "angelita-h2s-cloud-tulum-mexico"

        extreme_sites = filter_sites(difficulty="extreme")
        assert len(extreme_sites) == 2

        search_sites = filter_sites(search="Sawmill Sink")
        assert len(search_sites) == 1
        assert search_sites[0]["id"] == "dan-s-cave-abaco-anchialine-bahamas"

    def test_gear_checklist_has_six_essential_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(CENOTE_HALOCLINE_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert item["priority"] == "essential"
            assert "item" in item
            assert "category" in item
            assert "rationale" in item


class TestCenoteHaloclineCalculator:
    """Tests for the deterministic calculate_cenote_halocline engine."""

    def test_default_calculation_returns_expected_keys(self) -> None:
        res = calculate_cenote_halocline()
        expected_keys = {
            "salinity_delta_ppt",
            "tannic_doc_mg_l",
            "silt_clay_fraction_pct",
            "penetration_distance_m",
            "h2s_concentration_ppm",
            "schlieren_optical_blur_index",
            "post_mix_visibility_meters",
            "buoyancy_trim_shift_kg",
            "rule_of_thirds_reserve_bar",
            "risk_level",
            "safety_status",
            "navigation_protocol",
            "routing_strategy",
            "warnings",
            "recommendations",
        }
        assert expected_keys.issubset(res.keys())
        assert res["risk_level"] in {"low", "moderate", "high", "critical"}
        assert res["safety_status"] == res["risk_level"]
        assert isinstance(res["warnings"], list)
        assert isinstance(res["recommendations"], list)
        assert len(res["recommendations"]) >= 2

    def test_low_risk_clear_freshwater_conduit_conditions(self) -> None:
        res = calculate_cenote_halocline(
            salinity_delta_ppt=5.0,
            tannic_doc_mg_l=1.5,
            silt_clay_fraction_pct=8.0,
            penetration_distance_m=60.0,
            h2s_concentration_ppm=0.0,
        )
        assert res["risk_level"] == "low"
        assert res["schlieren_optical_blur_index"] < 30.0
        assert res["post_mix_visibility_meters"] >= 14.0
        assert res["buoyancy_trim_shift_kg"] < 0.8
        assert res["rule_of_thirds_reserve_bar"] <= 95.0

    def test_critical_risk_anchialine_halocline_h2s_siltout_conditions(self) -> None:
        res = calculate_cenote_halocline(
            salinity_delta_ppt=34.0,
            tannic_doc_mg_l=48.0,
            silt_clay_fraction_pct=88.0,
            penetration_distance_m=950.0,
            h2s_concentration_ppm=45.0,
        )
        assert res["risk_level"] == "critical"
        assert res["schlieren_optical_blur_index"] >= 75.0
        assert res["post_mix_visibility_meters"] <= 3.5
        assert res["buoyancy_trim_shift_kg"] >= 2.0
        assert res["rule_of_thirds_reserve_bar"] >= 135.0
        assert len(res["warnings"]) >= 3

    def test_monotonicity_across_inputs(self) -> None:
        low_sal = calculate_cenote_halocline(salinity_delta_ppt=6.0)
        high_sal = calculate_cenote_halocline(salinity_delta_ppt=34.0)
        assert high_sal["schlieren_optical_blur_index"] > low_sal["schlieren_optical_blur_index"]
        assert high_sal["buoyancy_trim_shift_kg"] > low_sal["buoyancy_trim_shift_kg"]
        assert high_sal["post_mix_visibility_meters"] < low_sal["post_mix_visibility_meters"]

        short_pen = calculate_cenote_halocline(penetration_distance_m=50.0)
        long_pen = calculate_cenote_halocline(penetration_distance_m=900.0)
        assert long_pen["rule_of_thirds_reserve_bar"] > short_pen["rule_of_thirds_reserve_bar"]

    @pytest.mark.parametrize(
        "kwargs,expected_field",
        [
            ({"salinity_delta_ppt": 1.0}, "salinity_delta_ppt"),
            ({"salinity_delta_ppt": 40.0}, "salinity_delta_ppt"),
            ({"tannic_doc_mg_l": -1.0}, "tannic_doc_mg_l"),
            ({"tannic_doc_mg_l": 65.0}, "tannic_doc_mg_l"),
            ({"silt_clay_fraction_pct": -5.0}, "silt_clay_fraction_pct"),
            ({"silt_clay_fraction_pct": 105.0}, "silt_clay_fraction_pct"),
            ({"penetration_distance_m": 5.0}, "penetration_distance_m"),
            ({"penetration_distance_m": 1300.0}, "penetration_distance_m"),
            ({"h2s_concentration_ppm": -1.0}, "h2s_concentration_ppm"),
            ({"h2s_concentration_ppm": 90.0}, "h2s_concentration_ppm"),
        ],
    )
    def test_validation_bounds_raise_value_error(
        self, kwargs: dict[str, float], expected_field: str
    ) -> None:
        with pytest.raises(ValueError, match=expected_field):
            calculate_cenote_halocline(**kwargs)


class TestCenoteHaloclineIntentAndFormatting:
    """Tests for intent detection, parameter extraction, and response formatting."""

    def test_positive_intent_detection(self) -> None:
        queries = [
            "How do we navigate the halocline schlieren blur in Sistema Ox Bel Ha near Tulum?",
            "Assess meromictic hydrogen sulfide cloud hazards in Cenote Angelita.",
            "What is the best tactile line protocol for Sistema Sac Actun and Dos Ojos cenote passages?",
            "Crossing the tannic halocline and chemocline in Dan's Cave and Sawmill Sink on Abaco.",
            "Calculate cenote halocline schlieren blur with 32 ppt salinity delta and 600 m penetration.",
        ]
        for q in queries:
            assert is_cenote_halocline_query(q), f"Expected positive intent for: {q}"
            assert detect_cenote_halocline_intent(q), f"Expected positive intent for: {q}"

    def test_negative_intent_disambiguation_against_other_domains(self) -> None:
        non_matching = [
            "What boots do you recommend for hiking?",
            "What is the turn pressure for Peacock Springs sump penetration in Florida?",
            "Calculate Bühlmann ZHL-16C altitude diving ESLD for Lake Tahoe Rubicon Wall.",
            "How do I freedive through Macrocystis pyrifera giant kelp stipe columns at Point Lobos?",
            "What SRT descender should I use for Fantastic Pit in Ellison's Cave?",
            "How do I descend the vertical rim of Xiaozhai Tiankeng in Chongqing?",
            "How do we navigate boiling mudpots and sulfur domes in a solfatara field?",
        ]
        for q in non_matching:
            assert not is_cenote_halocline_query(q), f"Expected negative intent for: {q}"

    def test_extract_params_from_natural_language(self) -> None:
        query = (
            "Calculate cenote halocline navigation at Sistema Ox Bel Ha with salinity delta 33 ppt, "
            "tannic DOC 24 mg/L, silt clay fraction 65%, penetration distance 550 m, "
            "and H2S concentration 18 ppm."
        )
        params = extract_cenote_halocline_params(query)
        assert params["site_id"] == "ox-bel-ha-halocline-tulum-mexico"
        assert params["salinity_delta_ppt"] == 33.0
        assert params["tannic_doc_mg_l"] == 24.0
        assert params["silt_clay_fraction_pct"] == 65.0
        assert params["penetration_distance_m"] == 550.0
        assert params["h2s_concentration_ppm"] == 18.0
        assert params["has_calc_params"] is True

    def test_format_response_actions_and_prompt_builder(self) -> None:
        calc_info = format_cenote_halocline_response(
            "Calculate cenote halocline with 30 ppt salinity delta and 500 m penetration"
        )
        assert calc_info["action"] == "cenote_halocline_calculated"
        assert calc_info["calculation"] is not None

        lookup_info = format_cenote_halocline_response(
            "Tell me about Cenote Angelita meromictic chemocline navigation"
        )
        assert lookup_info["action"] == "cenote_halocline_lookup"
        assert len(lookup_info["matched_sites"]) == 1
        assert lookup_info["matched_sites"][0]["id"] == "angelita-h2s-cloud-tulum-mexico"

        general_info = format_cenote_halocline_response(
            "Give me an overview of subterranean cenote halocline and anchialine cave navigation"
        )
        assert general_info["action"] == "cenote_halocline_info"
        assert len(general_info["sites"]) == 4

        prompt = build_cenote_halocline_prompt(calc_info)
        assert "CENOTE HALOCLINE" in prompt.upper()
        assert "ESSENTIAL CENOTE" in prompt.upper()

    def test_chat_and_stream_helpers(self) -> None:
        chat_res = get_chat_response(
            "How do we navigate the halocline in Sistema Ox Bel Ha with 32 ppt salinity delta?"
        )
        assert "answer" in chat_res
        assert "cenote_halocline_info" in chat_res
        assert chat_res["cenote_halocline_info"]["action"] == "cenote_halocline_calculated"

        events = list(
            generate_stream_events(
                "Tell me about Dan's Cave and Sawmill Sink anchialine blue hole navigation"
            )
        )
        assert len(events) >= 3
        assert events[0]["cenote_halocline_info"]["action"] == "cenote_halocline_lookup"
