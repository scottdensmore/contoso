"""Unit tests for the Montane Bamboo-Thicket (Chusquea / Sasa) & Cloud-Forest Ridge-Crest Bushwhacking Guide."""

import pytest
from contoso_chat.bamboo_thicket import (
    BAMBOO_SITES,
    BAMBOO_THICKET_GEAR_CHECKLIST,
    BAMBOO_THICKET_SITES,
    build_bamboo_thicket_prompt,
    calculate_bamboo_thicket,
    detect_bamboo_thicket_intent,
    extract_bamboo_thicket_params,
    filter_sites,
    format_bamboo_thicket_response,
    generate_stream_events,
    get_all_bamboo_thicket_sites,
    get_all_sites,
    get_bamboo_thicket_site_by_id,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    is_bamboo_thicket_query,
)
from contoso_chat.bushcraft import detect_bushcraft_intent
from contoso_chat.canopy_bryophyte import detect_canopy_bryophyte_intent
from contoso_chat.foraging import detect_foraging_intent
from contoso_chat.krummholz_bushwhack import is_krummholz_bushwhack_query
from contoso_chat.mangrove_labyrinth import is_mangrove_labyrinth_query
from contoso_chat.orienteering import extract_orienteering_intent
from contoso_chat.paramo_navigation import is_paramo_navigation_query
from contoso_chat.tepui_navigation import is_tepui_navigation_query
from contoso_chat.tree_climbing import detect_tree_climbing_intent


class TestBambooThicketCatalog:
    """Tests for the montane bamboo-thicket site catalog and lookup functions."""

    def test_catalog_has_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(BAMBOO_THICKET_SITES) == 4
        assert len(BAMBOO_SITES) == 4
        assert len(get_all_bamboo_thicket_sites()) == 4

    def test_expected_site_ids_present(self) -> None:
        site_ids = {s["id"] for s in get_all_sites()}
        expected = {
            "chirripo-talamanca-chusquea-costa-rica",
            "hidaka-sasa-kurilensis-hokkaido-japan",
            "rwenzori-virunga-yushania-uganda",
            "vilcabamba-colani-chusquea-peru",
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
            "ecotype",
            "difficulty",
            "default_culm_density_per_sq_m",
            "default_culm_diameter_mm",
            "default_ridge_slope_deg",
            "default_wetness_film_pct",
            "default_follower_spacing_m",
            "primary_hazard",
            "threading_strategy",
            "navigation_protocol",
            "progression_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_keys.issubset(site.keys())
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.ecotype == site["ecotype"]

    def test_get_site_by_id_exact_and_fuzzy(self) -> None:
        talamanca = get_site_by_id("chirripo-talamanca-chusquea-costa-rica")
        assert talamanca is not None
        assert talamanca["country"] == "Costa Rica"
        assert talamanca["ecotype"] == "chusquea-solid-culm-cloud-ridge"
        assert talamanca["difficulty"] == "extreme"

        hidaka = get_bamboo_thicket_site_by_id("hidaka")
        assert hidaka is not None
        assert hidaka["id"] == "hidaka-sasa-kurilensis-hokkaido-japan"
        assert hidaka["country"] == "Japan"
        assert hidaka["ecotype"] == "sasa-kurilensis-dwarf-snow-bamboo"
        assert hidaka["difficulty"] == "challenging"

        rwenzori = get_site_by_id("rwenzori")
        assert rwenzori is not None
        assert rwenzori["id"] == "rwenzori-virunga-yushania-uganda"
        assert rwenzori["country"] == "Uganda"
        assert rwenzori["ecotype"] == "yushania-alpina-montane-belt"
        assert rwenzori["difficulty"] == "moderate"

        vilcabamba = get_site_by_id("vilcabamba")
        assert vilcabamba is not None
        assert vilcabamba["id"] == "vilcabamba-colani-chusquea-peru"
        assert vilcabamba["country"] == "Peru"
        assert vilcabamba["ecotype"] == "guadua-spiny-riparian-tangle"
        assert vilcabamba["difficulty"] == "extreme"

    def test_get_site_by_id_unknown_returns_none(self) -> None:
        assert get_site_by_id("nonexistent-bamboo-site") is None
        assert get_site_by_id("") is None

    def test_filter_sites_by_country_ecotype_difficulty_and_search(self) -> None:
        cr_sites = filter_sites(country="Costa Rica")
        assert len(cr_sites) == 1
        assert cr_sites[0]["id"] == "chirripo-talamanca-chusquea-costa-rica"

        japan_sites = filter_sites(country="Japan")
        assert len(japan_sites) == 1
        assert japan_sites[0]["id"] == "hidaka-sasa-kurilensis-hokkaido-japan"

        sasa_sites = filter_sites(ecotype="sasa-kurilensis-dwarf-snow-bamboo")
        assert len(sasa_sites) == 1
        assert sasa_sites[0]["id"] == "hidaka-sasa-kurilensis-hokkaido-japan"

        extreme_sites = filter_sites(difficulty="extreme")
        assert len(extreme_sites) == 2

        search_sites = filter_sites(search="Poroshiri-dake")
        assert len(search_sites) == 1
        assert search_sites[0]["id"] == "hidaka-sasa-kurilensis-hokkaido-japan"

    def test_gear_checklist_has_six_essential_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(BAMBOO_THICKET_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert item["priority"] == "essential"
            assert "item" in item
            assert "category" in item
            assert "rationale" in item


class TestBambooThicketCalculator:
    """Tests for the deterministic calculate_bamboo_thicket engine."""

    def test_default_calculation_returns_expected_keys(self) -> None:
        res = calculate_bamboo_thicket()
        expected_keys = {
            "culm_density_per_sq_m",
            "culm_diameter_mm",
            "ridge_slope_deg",
            "wetness_film_pct",
            "follower_spacing_m",
            "rebound_whip_kinetic_j",
            "wet_culm_slip_probability_pct",
            "net_advance_meters_per_hour",
            "punji_stump_puncture_risk_pct",
            "risk_level",
            "safety_status",
            "threading_strategy",
            "warnings",
            "recommendations",
        }
        assert expected_keys.issubset(res.keys())
        assert res["risk_level"] in {"low", "moderate", "high", "critical"}
        assert res["safety_status"] == res["risk_level"]
        assert isinstance(res["warnings"], list)
        assert isinstance(res["recommendations"], list)
        assert len(res["recommendations"]) >= 2

    def test_low_risk_open_montane_bamboo_belt_conditions(self) -> None:
        res = calculate_bamboo_thicket(
            culm_density_per_sq_m=10.0,
            culm_diameter_mm=8.0,
            ridge_slope_deg=6.0,
            wetness_film_pct=15.0,
            follower_spacing_m=8.0,
        )
        assert res["risk_level"] == "low"
        assert res["rebound_whip_kinetic_j"] < 15.0
        assert res["wet_culm_slip_probability_pct"] < 30.0
        assert res["net_advance_meters_per_hour"] >= 350.0
        assert res["punji_stump_puncture_risk_pct"] < 25.0

    def test_critical_risk_dense_chusquea_cloud_ridge_conditions(self) -> None:
        res = calculate_bamboo_thicket(
            culm_density_per_sq_m=105.0,
            culm_diameter_mm=58.0,
            ridge_slope_deg=46.0,
            wetness_film_pct=95.0,
            follower_spacing_m=1.2,
        )
        assert res["risk_level"] == "critical"
        assert res["rebound_whip_kinetic_j"] >= 45.0
        assert res["wet_culm_slip_probability_pct"] >= 70.0
        assert res["net_advance_meters_per_hour"] <= 140.0
        assert res["punji_stump_puncture_risk_pct"] >= 65.0
        assert len(res["warnings"]) >= 3

    def test_monotonicity_across_inputs(self) -> None:
        sparse = calculate_bamboo_thicket(culm_density_per_sq_m=12.0)
        dense = calculate_bamboo_thicket(culm_density_per_sq_m=95.0)
        assert dense["net_advance_meters_per_hour"] < sparse["net_advance_meters_per_hour"]
        assert dense["punji_stump_puncture_risk_pct"] > sparse["punji_stump_puncture_risk_pct"]

        thin_culm = calculate_bamboo_thicket(culm_diameter_mm=8.0, follower_spacing_m=8.0)
        thick_culm = calculate_bamboo_thicket(culm_diameter_mm=65.0, follower_spacing_m=1.0)
        assert thick_culm["rebound_whip_kinetic_j"] > thin_culm["rebound_whip_kinetic_j"]

        dry_flat = calculate_bamboo_thicket(ridge_slope_deg=5.0, wetness_film_pct=10.0)
        steep_wet = calculate_bamboo_thicket(ridge_slope_deg=48.0, wetness_film_pct=95.0)
        assert (
            steep_wet["wet_culm_slip_probability_pct"]
            > dry_flat["wet_culm_slip_probability_pct"]
        )

    @pytest.mark.parametrize(
        "kwargs,expected_field",
        [
            ({"culm_density_per_sq_m": 2.0}, "culm_density_per_sq_m"),
            ({"culm_density_per_sq_m": 130.0}, "culm_density_per_sq_m"),
            ({"culm_diameter_mm": 2.0}, "culm_diameter_mm"),
            ({"culm_diameter_mm": 90.0}, "culm_diameter_mm"),
            ({"ridge_slope_deg": -2.0}, "ridge_slope_deg"),
            ({"ridge_slope_deg": 60.0}, "ridge_slope_deg"),
            ({"wetness_film_pct": -5.0}, "wetness_film_pct"),
            ({"wetness_film_pct": 105.0}, "wetness_film_pct"),
            ({"follower_spacing_m": 0.2}, "follower_spacing_m"),
            ({"follower_spacing_m": 18.0}, "follower_spacing_m"),
        ],
    )
    def test_validation_bounds_raise_value_error(
        self, kwargs: dict[str, float], expected_field: str
    ) -> None:
        with pytest.raises(ValueError, match=expected_field):
            calculate_bamboo_thicket(**kwargs)


class TestBambooThicketIntentAndFormatting:
    """Tests for intent detection, parameter extraction, response formatting, and disambiguation."""

    def test_positive_intent_detection(self) -> None:
        queries = [
            "How do we bushwhack through Chusquea bamboo thickets on Cerro Kamuk in Cordillera de Talamanca?",
            "Assess Sasa kurilensis Chishima-zasa crest navigation on Poroshiri-dake in the Hidaka Mountains.",
            "What is the best threading strategy for the Rwenzori and Virunga Yushania alpina montane bamboo belt?",
            "How do we avoid punji stump punctures and culm whip-back on Cordillera Vilcabamba Chusquea scandens ridges?",
            "Calculate bamboo thicket progress with culm density 65 per sq m, culm diameter 28 mm, and 34 deg ridge slope.",
        ]
        for q in queries:
            assert is_bamboo_thicket_query(q), f"Expected positive intent for: {q}"
            assert detect_bamboo_thicket_intent(q), f"Expected positive intent for: {q}"

    def test_negative_intent_and_cross_domain_disambiguation(self) -> None:
        non_matching = [
            "What boots do you recommend for hiking?",
            "Where is my order #12345?",
            "How do I bushwhack through Presidential Range krummholz balsam fir thickets without falling into a spruce trap?",
            "Cerro Chirripó Sabana de los Leones Talamanca paramo Polylepis ecotone needle ice",
            "How do we navigate Rhizophora prop roots in a tidal mangrove labyrinth?",
            "What is the epiphytic bryophyte moss load on old-growth Sitka spruce canopy limbs?",
            "How do I build a debris hut and bow drill friction fire for bushcraft?",
            "How do I rig a cambium saver and throwline for old-growth arborist tree climbing?",
        ]
        for q in non_matching:
            assert not is_bamboo_thicket_query(q), f"Expected negative intent for: {q}"

        # Verify adjacent domains do not hijack bamboo_thicket queries
        bamboo_queries = [
            "How do we bushwhack through Chusquea solid-culm bamboo thickets on Cerro Kamuk in Talamanca?",
            "Calculate bamboo bushwhack velocity for Sasa kurilensis on Poroshiri-dake with 80 culms/m2",
            "Navigating Yushania alpina montane bamboo belt in Rwenzori without punji stump punctures",
            "Cordillera Vilcabamba Chusquea scandens bamboo thicket ridge-crest bushwhacking",
        ]
        for bq in bamboo_queries:
            assert is_bamboo_thicket_query(bq) is True
            assert is_krummholz_bushwhack_query(bq) is False
            assert is_paramo_navigation_query(bq) is False
            assert is_mangrove_labyrinth_query(bq) is False
            assert is_tepui_navigation_query(bq) is False
            assert detect_canopy_bryophyte_intent(bq) is False
            assert detect_bushcraft_intent(bq) is None
            assert detect_tree_climbing_intent(bq) is None
            assert extract_orienteering_intent(bq) is None
            assert detect_foraging_intent(bq) is None

    def test_extract_params_from_natural_language(self) -> None:
        query = (
            "Calculate bamboo thicket bushwhack on Cerro Kamuk with culm density 75 culms/m2, "
            "culm diameter 32 mm, ridge slope 36 deg, wetness film 85%, "
            "and follower spacing 4.5 m."
        )
        params = extract_bamboo_thicket_params(query)
        assert params["site_id"] == "chirripo-talamanca-chusquea-costa-rica"
        assert params["culm_density_per_sq_m"] == 75.0
        assert params["culm_diameter_mm"] == 32.0
        assert params["ridge_slope_deg"] == 36.0
        assert params["wetness_film_pct"] == 85.0
        assert params["follower_spacing_m"] == 4.5
        assert params["has_calc_params"] is True

    def test_format_response_actions_and_prompt_builder(self) -> None:
        calc_info = format_bamboo_thicket_response(
            "Calculate bamboo thicket progress with culm density 60 per sq m and 30 mm culm diameter"
        )
        assert calc_info["action"] == "bamboo_thicket_calculated"
        assert calc_info["calculation"] is not None

        lookup_info = format_bamboo_thicket_response(
            "Tell me about Poroshiri-dake Sasa kurilensis Chishima-zasa crest bushwhacking in Hidaka"
        )
        assert lookup_info["action"] == "bamboo_thicket_lookup"
        assert len(lookup_info["matched_sites"]) == 1
        assert lookup_info["matched_sites"][0]["id"] == "hidaka-sasa-kurilensis-hokkaido-japan"

        general_info = format_bamboo_thicket_response(
            "Give me an overview of montane bamboo-thicket and cloud-forest ridge-crest bushwhacking"
        )
        assert general_info["action"] == "bamboo_thicket_info"
        assert len(general_info["sites"]) == 4

        prompt = build_bamboo_thicket_prompt(calc_info)
        assert "BAMBOO-THICKET" in prompt.upper()
        assert "ESSENTIAL MONTANE BAMBOO" in prompt.upper()

    def test_chat_and_stream_helpers(self) -> None:
        chat_res = get_chat_response(
            "How do we bushwhack Cerro Kamuk Chusquea bamboo thicket with culm density 70 per sq m?"
        )
        assert "answer" in chat_res
        assert "bamboo_thicket_info" in chat_res
        assert chat_res["bamboo_thicket_info"]["action"] == "bamboo_thicket_calculated"

        events = list(
            generate_stream_events(
                "Tell me about Rwenzori and Virunga Yushania alpina montane bamboo belt navigation"
            )
        )
        assert len(events) >= 3
        assert events[0]["bamboo_thicket_info"]["action"] == "bamboo_thicket_lookup"
