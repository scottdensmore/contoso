"""Unit tests for the Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape Guide."""

import pytest
from contoso_chat.aufeis_crossing import is_aufeis_crossing_query
from contoso_chat.canyoneering import detect_canyoneering_intent
from contoso_chat.cryokarst_speleology import detect_cryokarst_speleology_intent
from contoso_chat.flash_flood_slot import is_flash_flood_slot_query
from contoso_chat.glacier_navigation import detect_glacier_intent
from contoso_chat.glacier_ski_traverse import detect_glacier_ski_traverse_intent
from contoso_chat.glaciere_caving import is_glaciere_caving_query
from contoso_chat.jokulhlaup_escape import (
    JOKULHLAUP_ESCAPE_GEAR_CHECKLIST,
    JOKULHLAUP_ESCAPE_SITES,
    JOKULHLAUP_SITES,
    build_jokulhlaup_escape_prompt,
    calculate_jokulhlaup_escape,
    detect_jokulhlaup_escape_intent,
    extract_jokulhlaup_escape_params,
    filter_sites,
    format_jokulhlaup_escape_response,
    generate_stream_events,
    get_all_jokulhlaup_escape_sites,
    get_all_sites,
    get_chat_response,
    get_gear_checklist,
    get_jokulhlaup_escape_site_by_id,
    get_site_by_id,
    is_jokulhlaup_escape_query,
)
from contoso_chat.rock_glacier_navigation import is_rock_glacier_navigation_query
from contoso_chat.sandur_crossing import is_sandur_crossing_query
from contoso_chat.solfatara_navigation import is_solfatara_navigation_query
from contoso_chat.tephra_navigation import is_tephra_navigation_query


class TestJokulhlaupEscapeCatalog:
    """Tests for the subglacial jökulhlaup & ice-dammed lake outburst site catalog and lookup functions."""

    def test_catalog_has_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(JOKULHLAUP_ESCAPE_SITES) == 4
        assert len(JOKULHLAUP_SITES) == 4
        assert len(get_all_jokulhlaup_escape_sites()) == 4

    def test_expected_site_ids_present(self) -> None:
        site_ids = {s["id"] for s in get_all_sites()}
        expected = {
            "grimsvotn-skeidararsandur-vatnajokull-iceland",
            "suicide-basin-mendenhall-juneau-alaska",
            "cachet-dos-colonia-patagonia-chile",
            "kyagar-shaksgam-karakoram-pakistan-china",
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
            "trigger_mechanism",
            "difficulty",
            "default_ice_dam_drawdown_cm_per_hr",
            "default_proglacial_conductivity_us_cm",
            "default_subglacial_tremor_amplitude_um",
            "default_canyon_floor_distance_from_portal_km",
            "default_vertical_gain_to_safe_terrace_m",
            "primary_hazard",
            "evacuation_strategy",
            "navigation_protocol",
            "early_warning_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_keys.issubset(site.keys())
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.trigger_mechanism == site["trigger_mechanism"]

    def test_get_site_by_id_exact_and_fuzzy(self) -> None:
        grimsvotn = get_site_by_id("grimsvotn-skeidararsandur-vatnajokull-iceland")
        assert grimsvotn is not None
        assert grimsvotn["country"] == "Iceland"
        assert grimsvotn["trigger_mechanism"] == "subglacial-geothermal-caldera"
        assert grimsvotn["difficulty"] == "extreme"

        suicide_basin = get_jokulhlaup_escape_site_by_id("suicide basin")
        assert suicide_basin is not None
        assert suicide_basin["id"] == "suicide-basin-mendenhall-juneau-alaska"
        assert suicide_basin["country"] == "USA"
        assert suicide_basin["trigger_mechanism"] == "marginal-ice-dam-flotation"
        assert suicide_basin["difficulty"] == "challenging"

        cachet = get_site_by_id("lago cachet")
        assert cachet is not None
        assert cachet["id"] == "cachet-dos-colonia-patagonia-chile"
        assert cachet["country"] == "Chile"
        assert cachet["trigger_mechanism"] == "supraglacial-englacial-conduit"
        assert cachet["difficulty"] == "extreme"

        kyagar = get_site_by_id("kyagar tso")
        assert kyagar is not None
        assert kyagar["id"] == "kyagar-shaksgam-karakoram-pakistan-china"
        assert kyagar["country"] == "Pakistan / China"
        assert kyagar["trigger_mechanism"] == "moraine-ice-core-piping"
        assert kyagar["difficulty"] == "extreme"

    def test_get_site_by_id_unknown_returns_none(self) -> None:
        assert get_site_by_id("nonexistent-jokulhlaup-site") is None
        assert get_site_by_id("") is None

    def test_filter_sites_by_country_trigger_mechanism_difficulty_and_search(self) -> None:
        iceland_sites = filter_sites(country="Iceland")
        assert len(iceland_sites) == 1
        assert iceland_sites[0]["id"] == "grimsvotn-skeidararsandur-vatnajokull-iceland"

        usa_sites = filter_sites(country="USA")
        assert len(usa_sites) == 1
        assert usa_sites[0]["id"] == "suicide-basin-mendenhall-juneau-alaska"

        trig_sites = filter_sites(trigger_mechanism="supraglacial-englacial-conduit")
        assert len(trig_sites) == 1
        assert trig_sites[0]["id"] == "cachet-dos-colonia-patagonia-chile"

        extreme_sites = filter_sites(difficulty="extreme")
        assert len(extreme_sites) == 3

        search_sites = filter_sites(search="Shaksgam")
        assert len(search_sites) == 1
        assert search_sites[0]["id"] == "kyagar-shaksgam-karakoram-pakistan-china"

    def test_gear_checklist_has_six_essential_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(JOKULHLAUP_ESCAPE_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert item["priority"] == "essential"
            assert "item" in item
            assert "category" in item
            assert "rationale" in item


class TestJokulhlaupEscapeCalculator:
    """Tests for the deterministic calculate_jokulhlaup_escape engine."""

    def test_default_calculation_returns_expected_keys(self) -> None:
        res = calculate_jokulhlaup_escape(
            ice_dam_drawdown_cm_per_hr=45.0,
            proglacial_conductivity_us_cm=280.0,
            subglacial_tremor_amplitude_um=6.5,
            canyon_floor_distance_from_portal_km=4.5,
            vertical_gain_to_safe_terrace_m=55.0,
        )
        expected_keys = {
            "ice_dam_drawdown_cm_per_hr",
            "proglacial_conductivity_us_cm",
            "subglacial_tremor_amplitude_um",
            "canyon_floor_distance_from_portal_km",
            "vertical_gain_to_safe_terrace_m",
            "estimated_peak_discharge_m3s",
            "flood_front_arrival_minutes",
            "required_ascent_rate_m_per_min",
            "ice_block_ballistic_impact_risk_pct",
            "risk_level",
            "safety_status",
            "evacuation_strategy",
            "warnings",
            "recommendations",
        }
        assert expected_keys.issubset(res.keys())
        assert res["risk_level"] in {"low", "moderate", "high", "critical"}
        assert res["safety_status"] == res["risk_level"]
        assert isinstance(res["warnings"], list)
        assert isinstance(res["recommendations"], list)
        assert len(res["recommendations"]) >= 2

    def test_low_risk_stable_ice_dam_conditions(self) -> None:
        res = calculate_jokulhlaup_escape(
            ice_dam_drawdown_cm_per_hr=2.0,
            proglacial_conductivity_us_cm=45.0,
            subglacial_tremor_amplitude_um=0.4,
            canyon_floor_distance_from_portal_km=22.0,
            vertical_gain_to_safe_terrace_m=15.0,
        )
        assert res["risk_level"] == "low"
        assert res["estimated_peak_discharge_m3s"] < 500.0
        assert res["flood_front_arrival_minutes"] > 90.0
        assert res["required_ascent_rate_m_per_min"] < 1.5
        assert res["ice_block_ballistic_impact_risk_pct"] < 15.0

    def test_critical_risk_imminent_subglacial_outburst_conditions(self) -> None:
        res = calculate_jokulhlaup_escape(
            ice_dam_drawdown_cm_per_hr=180.0,
            proglacial_conductivity_us_cm=950.0,
            subglacial_tremor_amplitude_um=36.0,
            canyon_floor_distance_from_portal_km=1.2,
            vertical_gain_to_safe_terrace_m=130.0,
        )
        assert res["risk_level"] == "critical"
        assert res["estimated_peak_discharge_m3s"] >= 5000.0
        assert res["flood_front_arrival_minutes"] < 15.0
        assert res["required_ascent_rate_m_per_min"] >= 10.0
        assert res["ice_block_ballistic_impact_risk_pct"] >= 65.0
        assert len(res["warnings"]) >= 3

    def test_monotonicity_across_inputs(self) -> None:
        low_drive = calculate_jokulhlaup_escape(
            ice_dam_drawdown_cm_per_hr=8.0,
            proglacial_conductivity_us_cm=80.0,
            subglacial_tremor_amplitude_um=1.2,
            canyon_floor_distance_from_portal_km=6.0,
            vertical_gain_to_safe_terrace_m=45.0,
        )
        high_drive = calculate_jokulhlaup_escape(
            ice_dam_drawdown_cm_per_hr=150.0,
            proglacial_conductivity_us_cm=820.0,
            subglacial_tremor_amplitude_um=28.0,
            canyon_floor_distance_from_portal_km=6.0,
            vertical_gain_to_safe_terrace_m=45.0,
        )
        assert (
            high_drive["estimated_peak_discharge_m3s"] > low_drive["estimated_peak_discharge_m3s"]
        )
        assert high_drive["flood_front_arrival_minutes"] < low_drive["flood_front_arrival_minutes"]
        assert (
            high_drive["required_ascent_rate_m_per_min"]
            > low_drive["required_ascent_rate_m_per_min"]
        )
        assert (
            high_drive["ice_block_ballistic_impact_risk_pct"]
            > low_drive["ice_block_ballistic_impact_risk_pct"]
        )

        near_portal = calculate_jokulhlaup_escape(
            ice_dam_drawdown_cm_per_hr=50.0,
            proglacial_conductivity_us_cm=300.0,
            subglacial_tremor_amplitude_um=8.0,
            canyon_floor_distance_from_portal_km=1.0,
            vertical_gain_to_safe_terrace_m=95.0,
        )
        far_portal = calculate_jokulhlaup_escape(
            ice_dam_drawdown_cm_per_hr=50.0,
            proglacial_conductivity_us_cm=300.0,
            subglacial_tremor_amplitude_um=8.0,
            canyon_floor_distance_from_portal_km=25.0,
            vertical_gain_to_safe_terrace_m=20.0,
        )
        assert (
            far_portal["flood_front_arrival_minutes"] > near_portal["flood_front_arrival_minutes"]
        )
        assert (
            near_portal["required_ascent_rate_m_per_min"]
            > far_portal["required_ascent_rate_m_per_min"]
        )
        assert (
            near_portal["ice_block_ballistic_impact_risk_pct"]
            > far_portal["ice_block_ballistic_impact_risk_pct"]
        )

    @pytest.mark.parametrize(
        "kwargs,expected_field",
        [
            ({"ice_dam_drawdown_cm_per_hr": -1.0}, "ice_dam_drawdown_cm_per_hr"),
            ({"ice_dam_drawdown_cm_per_hr": 260.0}, "ice_dam_drawdown_cm_per_hr"),
            ({"proglacial_conductivity_us_cm": 15.0}, "proglacial_conductivity_us_cm"),
            ({"proglacial_conductivity_us_cm": 1250.0}, "proglacial_conductivity_us_cm"),
            ({"subglacial_tremor_amplitude_um": 0.05}, "subglacial_tremor_amplitude_um"),
            ({"subglacial_tremor_amplitude_um": 55.0}, "subglacial_tremor_amplitude_um"),
            (
                {"canyon_floor_distance_from_portal_km": 0.1},
                "canyon_floor_distance_from_portal_km",
            ),
            (
                {"canyon_floor_distance_from_portal_km": 45.0},
                "canyon_floor_distance_from_portal_km",
            ),
            (
                {"vertical_gain_to_safe_terrace_m": 3.0},
                "vertical_gain_to_safe_terrace_m",
            ),
            (
                {"vertical_gain_to_safe_terrace_m": 240.0},
                "vertical_gain_to_safe_terrace_m",
            ),
        ],
    )
    def test_validation_bounds_raise_value_error(
        self, kwargs: dict[str, float], expected_field: str
    ) -> None:
        base = {
            "ice_dam_drawdown_cm_per_hr": 45.0,
            "proglacial_conductivity_us_cm": 280.0,
            "subglacial_tremor_amplitude_um": 6.5,
            "canyon_floor_distance_from_portal_km": 4.5,
            "vertical_gain_to_safe_terrace_m": 55.0,
        }
        base.update(kwargs)
        with pytest.raises(ValueError, match=expected_field):
            calculate_jokulhlaup_escape(**base)


class TestJokulhlaupEscapeIntentAndFormatting:
    """Tests for intent detection, parameter extraction, response formatting, and disambiguation."""

    def test_positive_intent_detection(self) -> None:
        queries = [
            "How do we escape a subglacial jökulhlaup outburst from Grímsvötn across Skeiðarárjökull?",
            "Assess ice-dammed lake outburst flood risk at Suicide Basin and Mendenhall Glacier in Juneau.",
            "What is the evacuation strategy for Lago Cachet II and Glaciar Colonia GLOF in Patagonia?",
            "How do we monitor Kyagar Tso and Upper Shaksgam Glacier moraine ice-core piping outburst?",
            "Calculate jokulhlaup escape with ice dam drawdown 85 cm/hr, proglacial conductivity 540 uS/cm, and subglacial tremor 14 um.",
        ]
        for q in queries:
            assert is_jokulhlaup_escape_query(q), f"Expected positive intent for: {q}"
            assert detect_jokulhlaup_escape_intent(q), f"Expected positive intent for: {q}"

    def test_negative_intent_and_cross_domain_disambiguation(self) -> None:
        non_matching = [
            "What boots do you recommend for hiking?",
            "Where is my order #12345?",
            "When is the safest hour of day to ford a braided-river jokulhlaup outwash plain?",
            "Wading Skeiðarársandur and Krossá braided river glacial outwash plain with quicksand silt-bars",
            "Calculate anchor creep rate and jokulhlaup outburst risk for Matanuska glacier moulin chamber",
            "Calculate anchor creep rate and jokulhlaup risk for Root Glacier",
            "Calculate crevasse snow bridge depth-to-span ratio for Khumbu Icefall glacier navigation",
            "What is the escape ledge height for Buckskin Gulch slot canyon flash flood?",
            "How do we cross El Tatio fumarole sinter crust with a 4-gas H2S detector?",
        ]
        for q in non_matching:
            assert not is_jokulhlaup_escape_query(q), f"Expected negative intent for: {q}"

        # Verify adjacent domains do not hijack jokulhlaup_escape queries
        jokulhlaup_queries = [
            "How do we escape a subglacial jökulhlaup outburst from Grímsvötn and Skeiðarárjökull in Iceland?",
            "Calculate jokulhlaup escape at Suicide Basin and Mendenhall Glacier with ice dam drawdown 75 cm/hr",
            "Evacuating Lago Cachet II and Glaciar Colonia proglacial canyon during a glacial lake outburst flood",
            "Subglacial outburst flood early warning at Kyagar Tso and Upper Shaksgam Glacier ice-dammed gorge",
        ]
        for jq in jokulhlaup_queries:
            assert is_jokulhlaup_escape_query(jq) is True
            assert is_sandur_crossing_query(jq) is False
            assert detect_glacier_intent(jq) is None
            assert detect_glacier_ski_traverse_intent(jq) is False
            assert detect_cryokarst_speleology_intent(jq) is False
            assert is_aufeis_crossing_query(jq) is False
            assert is_rock_glacier_navigation_query(jq) is False
            assert is_flash_flood_slot_query(jq) is False
            assert detect_canyoneering_intent(jq) is None
            assert is_solfatara_navigation_query(jq) is False
            assert is_tephra_navigation_query(jq) is False
            assert is_glaciere_caving_query(jq) is False

    def test_extract_params_from_natural_language(self) -> None:
        query = (
            "Calculate jokulhlaup escape for Lago Cachet II with ice dam drawdown 92 cm/hr, "
            "proglacial conductivity 640 uS/cm, subglacial tremor amplitude 18.5 um, "
            "canyon floor distance 3.2 km, and vertical gain 75 m."
        )
        params = extract_jokulhlaup_escape_params(query)
        assert params["site_id"] == "cachet-dos-colonia-patagonia-chile"
        assert params["ice_dam_drawdown_cm_per_hr"] == 92.0
        assert params["proglacial_conductivity_us_cm"] == 640.0
        assert params["subglacial_tremor_amplitude_um"] == 18.5
        assert params["canyon_floor_distance_from_portal_km"] == 3.2
        assert params["vertical_gain_to_safe_terrace_m"] == 75.0
        assert params["has_calc_params"] is True

    def test_format_response_actions_and_prompt_builder(self) -> None:
        calc_info: dict[str, object] = format_jokulhlaup_escape_response(
            "Calculate jokulhlaup escape risk with ice dam drawdown 110 cm/hr, conductivity 720 uS/cm, and tremor 22 um"
        )
        assert calc_info["action"] == "jokulhlaup_escape_calculated"
        assert calc_info["calculation"] is not None

        lookup_info: dict[str, object] = format_jokulhlaup_escape_response(
            "Tell me about Kyagar Tso and Upper Shaksgam Glacier ice-dammed lake outburst in the Karakoram"
        )
        assert lookup_info["action"] == "jokulhlaup_escape_lookup"
        matched = lookup_info["matched_sites"]
        assert isinstance(matched, list)
        assert len(matched) == 1
        assert matched[0]["id"] == "kyagar-shaksgam-karakoram-pakistan-china"

        general_info: dict[str, object] = format_jokulhlaup_escape_response(
            "Give me an overview of subglacial jökulhlaup ice-dammed lake outburst and proglacial canyon escape"
        )
        assert general_info["action"] == "jokulhlaup_escape_info"
        sites_list = general_info["sites"]
        assert isinstance(sites_list, list)
        assert len(sites_list) == 4

        prompt = build_jokulhlaup_escape_prompt(calc_info)
        assert "JÖKULHLAUP" in prompt.upper() or "JOKULHLAUP" in prompt.upper()
        assert "OUTBURST" in prompt.upper()

    def test_chat_and_stream_helpers(self) -> None:
        chat_res = get_chat_response(
            "How do we escape Grímsvötn jökulhlaup with ice dam drawdown 120 cm/hr and conductivity 800 uS/cm?"
        )
        assert "answer" in chat_res
        assert "jokulhlaup_escape_info" in chat_res
        assert chat_res["jokulhlaup_escape_info"]["action"] == "jokulhlaup_escape_calculated"

        events = list(
            generate_stream_events(
                "Tell me about Suicide Basin and Mendenhall Glacier ice-dammed lake outburst in Alaska"
            )
        )
        assert len(events) >= 3
        assert events[0]["jokulhlaup_escape_info"]["action"] == "jokulhlaup_escape_lookup"
