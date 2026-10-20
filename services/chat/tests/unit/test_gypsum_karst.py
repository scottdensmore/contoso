"""Unit tests for the Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology Guide."""

import pytest
from contoso_chat.cave_diving import detect_cave_diving_intent
from contoso_chat.cave_mineralogy import detect_cave_mineralogy_intent
from contoso_chat.caving import detect_caving_intent
from contoso_chat.cenote_halocline import is_cenote_halocline_query
from contoso_chat.cryokarst_speleology import detect_cryokarst_speleology_intent
from contoso_chat.glaciere_caving import is_glaciere_caving_query
from contoso_chat.gypsum_karst import (
    GYPSUM_KARST_GEAR_CHECKLIST,
    GYPSUM_KARST_SITES,
    GYPSUM_SITES,
    build_gypsum_karst_prompt,
    calculate_gypsum_karst,
    detect_gypsum_karst_intent,
    extract_gypsum_karst_params,
    filter_sites,
    format_gypsum_karst_response,
    generate_stream_events,
    get_all_gypsum_karst_sites,
    get_all_sites,
    get_chat_response,
    get_gear_checklist,
    get_gypsum_karst_site_by_id,
    get_site_by_id,
    is_gypsum_karst_query,
)
from contoso_chat.lava_tube_biospeleology import detect_lava_tube_biospeleology_intent
from contoso_chat.orienteering import extract_orienteering_intent
from contoso_chat.salar_pressure_ridge import is_salar_pressure_ridge_query
from contoso_chat.talus_cold_trap import is_talus_cold_trap_query
from contoso_chat.tiankeng_descent import is_tiankeng_descent_query
from contoso_chat.tsingy_labyrinth import is_tsingy_labyrinth_query
from contoso_chat.water import detect_water_intent


class TestGypsumKarstCatalog:
    """Tests for the subterranean gypsum-karst dissolution maze & evaporite breakdown-hall catalog and lookup functions."""

    def test_catalog_has_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(GYPSUM_KARST_SITES) == 4
        assert len(GYPSUM_SITES) == 4
        assert len(get_all_gypsum_karst_sites()) == 4

    def test_expected_site_ids_present(self) -> None:
        site_ids = {s["id"] for s in get_all_sites()}
        expected = {
            "optimisticeskaja-ozerna-podolia-ukraine",
            "spipola-acquafredda-vena-del-gesso-italy",
            "sorbas-covadura-yesos-almeria-spain",
            "parks-ranch-chandelier-gypsum-new-mexico",
        }
        assert site_ids == expected

    def test_site_required_fields_and_attr_access(self) -> None:
        required_keys = {
            "id",
            "name",
            "country",
            "region",
            "elevation_range",
            "morphology",
            "regime",
            "difficulty",
            "default_junction_count_per_100m",
            "default_ceiling_bed_thickness_cm",
            "default_surface_rain_inflow_mm_hr",
            "default_anhydrite_swelling_pct",
            "default_party_acoustic_decibels",
            "primary_hazard",
            "navigation_strategy",
            "navigation_protocol",
            "conservation_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_keys.issubset(site.keys())
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.morphology == site["morphology"]

    def test_get_site_by_id_exact_and_fuzzy(self) -> None:
        opti = get_site_by_id("optimisticeskaja-ozerna-podolia-ukraine")
        assert opti is not None
        assert opti["country"] == "Ukraine"
        assert opti["morphology"] == "artesian-rectilinear-joint-labyrinth"
        assert opti["difficulty"] == "extreme"

        spipola = get_gypsum_karst_site_by_id("vena del gesso")
        assert spipola is not None
        assert spipola["id"] == "spipola-acquafredda-vena-del-gesso-italy"
        assert spipola["country"] == "Italy"
        assert spipola["morphology"] == "messinian-selenite-epigenetic-gorge"
        assert spipola["difficulty"] == "challenging"

        sorbas = get_site_by_id("covadura")
        assert sorbas is not None
        assert sorbas["id"] == "sorbas-covadura-yesos-almeria-spain"
        assert sorbas["country"] == "Spain"
        assert sorbas["morphology"] == "arid-ephemeral-evaporite-sink"
        assert sorbas["difficulty"] == "challenging"

        parks = get_site_by_id("parks ranch")
        assert parks is not None
        assert parks["id"] == "parks-ranch-chandelier-gypsum-new-mexico"
        assert parks["country"] == "USA"
        assert parks["morphology"] == "permian-anhydrite-hydration-dome"
        assert parks["difficulty"] == "moderate"

    def test_get_site_by_id_unknown_returns_none(self) -> None:
        assert get_site_by_id("nonexistent-gypsum-karst-site") is None
        assert get_site_by_id("") is None

    def test_filter_sites_by_country_morphology_difficulty_and_search(self) -> None:
        ukraine_sites = filter_sites(country="Ukraine")
        assert len(ukraine_sites) == 1
        assert ukraine_sites[0]["id"] == "optimisticeskaja-ozerna-podolia-ukraine"

        italy_sites = filter_sites(country="Italy")
        assert len(italy_sites) == 1
        assert italy_sites[0]["id"] == "spipola-acquafredda-vena-del-gesso-italy"

        morph_sites = filter_sites(morphology="arid-ephemeral-evaporite-sink")
        assert len(morph_sites) == 1
        assert morph_sites[0]["id"] == "sorbas-covadura-yesos-almeria-spain"

        extreme_sites = filter_sites(difficulty="extreme")
        assert len(extreme_sites) == 1
        assert extreme_sites[0]["id"] == "optimisticeskaja-ozerna-podolia-ukraine"

        search_sites = filter_sites(search="Parks Ranch")
        assert len(search_sites) == 1
        assert search_sites[0]["id"] == "parks-ranch-chandelier-gypsum-new-mexico"

    def test_gear_checklist_has_six_essential_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(GYPSUM_KARST_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert item["priority"] == "essential"
            assert "item" in item
            assert "category" in item
            assert "rationale" in item


class TestGypsumKarstCalculator:
    """Tests for the deterministic calculate_gypsum_karst engine."""

    def test_default_calculation_returns_expected_keys(self) -> None:
        res = calculate_gypsum_karst(
            junction_count_per_100m=18.0,
            ceiling_bed_thickness_cm=24.0,
            surface_rain_inflow_mm_hr=12.0,
            anhydrite_swelling_pct=28.0,
            party_acoustic_decibels=68.0,
        )
        expected_keys = {
            "junction_count_per_100m",
            "ceiling_bed_thickness_cm",
            "surface_rain_inflow_mm_hr",
            "anhydrite_swelling_pct",
            "party_acoustic_decibels",
            "ceiling_slab_peel_probability_pct",
            "maze_disorientation_entropy_score",
            "rapid_dissolution_siphon_flood_risk_pct",
            "selenite_crystal_shear_hazard_pct",
            "risk_level",
            "safety_status",
            "navigation_strategy",
            "warnings",
            "recommendations",
        }
        assert expected_keys.issubset(res.keys())
        assert res["risk_level"] in {"low", "moderate", "high", "critical"}
        assert res["safety_status"] == res["risk_level"]
        assert isinstance(res["warnings"], list)
        assert isinstance(res["recommendations"], list)
        assert len(res["recommendations"]) >= 2

    def test_low_risk_thick_bed_sparse_junction_dry_conditions(self) -> None:
        res = calculate_gypsum_karst(
            junction_count_per_100m=4.0,
            ceiling_bed_thickness_cm=95.0,
            surface_rain_inflow_mm_hr=0.0,
            anhydrite_swelling_pct=5.0,
            party_acoustic_decibels=42.0,
        )
        assert res["risk_level"] == "low"
        assert res["ceiling_slab_peel_probability_pct"] < 25.0
        assert res["maze_disorientation_entropy_score"] < 25.0
        assert res["rapid_dissolution_siphon_flood_risk_pct"] < 20.0
        assert res["selenite_crystal_shear_hazard_pct"] < 25.0

    def test_critical_risk_thin_ceiling_dense_labyrinth_cloudburst_inflow(self) -> None:
        res = calculate_gypsum_karst(
            junction_count_per_100m=38.0,
            ceiling_bed_thickness_cm=5.0,
            surface_rain_inflow_mm_hr=64.0,
            anhydrite_swelling_pct=58.0,
            party_acoustic_decibels=98.0,
        )
        assert res["risk_level"] == "critical"
        assert res["ceiling_slab_peel_probability_pct"] >= 75.0
        assert res["maze_disorientation_entropy_score"] >= 75.0
        assert res["rapid_dissolution_siphon_flood_risk_pct"] >= 75.0
        assert res["selenite_crystal_shear_hazard_pct"] >= 65.0
        assert len(res["warnings"]) >= 3

    def test_monotonicity_across_inputs(self) -> None:
        mild = calculate_gypsum_karst(
            junction_count_per_100m=6.0,
            ceiling_bed_thickness_cm=85.0,
            surface_rain_inflow_mm_hr=2.0,
            anhydrite_swelling_pct=10.0,
            party_acoustic_decibels=45.0,
        )
        severe = calculate_gypsum_karst(
            junction_count_per_100m=36.0,
            ceiling_bed_thickness_cm=6.0,
            surface_rain_inflow_mm_hr=55.0,
            anhydrite_swelling_pct=52.0,
            party_acoustic_decibels=95.0,
        )
        assert (
            severe["ceiling_slab_peel_probability_pct"]
            > mild["ceiling_slab_peel_probability_pct"]
        )
        assert (
            severe["maze_disorientation_entropy_score"]
            > mild["maze_disorientation_entropy_score"]
        )
        assert (
            severe["rapid_dissolution_siphon_flood_risk_pct"]
            > mild["rapid_dissolution_siphon_flood_risk_pct"]
        )
        assert (
            severe["selenite_crystal_shear_hazard_pct"]
            > mild["selenite_crystal_shear_hazard_pct"]
        )

    @pytest.mark.parametrize(
        "kwargs,expected_field",
        [
            ({"junction_count_per_100m": 1.0}, "junction_count_per_100m"),
            ({"junction_count_per_100m": 50.0}, "junction_count_per_100m"),
            ({"ceiling_bed_thickness_cm": 1.0}, "ceiling_bed_thickness_cm"),
            ({"ceiling_bed_thickness_cm": 130.0}, "ceiling_bed_thickness_cm"),
            ({"surface_rain_inflow_mm_hr": -2.0}, "surface_rain_inflow_mm_hr"),
            ({"surface_rain_inflow_mm_hr": 90.0}, "surface_rain_inflow_mm_hr"),
            ({"anhydrite_swelling_pct": -5.0}, "anhydrite_swelling_pct"),
            ({"anhydrite_swelling_pct": 75.0}, "anhydrite_swelling_pct"),
            ({"party_acoustic_decibels": 20.0}, "party_acoustic_decibels"),
            ({"party_acoustic_decibels": 120.0}, "party_acoustic_decibels"),
        ],
    )
    def test_validation_bounds_raise_value_error(
        self, kwargs: dict[str, float], expected_field: str
    ) -> None:
        base = {
            "junction_count_per_100m": 18.0,
            "ceiling_bed_thickness_cm": 24.0,
            "surface_rain_inflow_mm_hr": 12.0,
            "anhydrite_swelling_pct": 28.0,
            "party_acoustic_decibels": 68.0,
        }
        base.update(kwargs)
        with pytest.raises(ValueError, match=expected_field):
            calculate_gypsum_karst(**base)


class TestGypsumKarstIntentAndFormatting:
    """Tests for intent detection, parameter extraction, response formatting, and disambiguation."""

    def test_positive_intent_detection(self) -> None:
        queries = [
            "How do we navigate the Optimisticeskaja (Optymistychna) and Ozerna artesian gypsum karst labyrinth in Ukraine?",
            "Assess swallowtail selenite crystal shear hazard in Sistema Spipola-Acquafredda and Vena del Gesso in Italy.",
            "What flash-flood siphon protocols apply to Karst en Yesos de Sorbas and Cueva de Covadura evaporite maze in Spain?",
            "How do we traverse Parks Ranch Cave and Permian anhydrite hydration breakdown halls in New Mexico?",
            "Calculate gypsum karst hazard with junction count 32 per 100m, ceiling bed thickness 8 cm, and surface rain inflow 35 mm/hr.",
        ]
        for q in queries:
            assert is_gypsum_karst_query(q), f"Expected positive intent for: {q}"
            assert detect_gypsum_karst_intent(q), f"Expected positive intent for: {q}"

    def test_negative_intent_and_cross_domain_disambiguation(self) -> None:
        non_matching = [
            "What boots do you recommend for hiking?",
            "Where is my order #12345?",
            "Lechuguilla Chandelier Room gypsum flowers microclimate",
            "Tell me about Carlsbad Caverns Rookery Nest cave pearls",
            "Mammoth cave Cleaveland Avenue historic route",
            "Calculate SRT rigging plan and rope stretch for Fantastic Pit",
            "How do we navigate the Bemaraha Grand Tsingy razor limestone labyrinth?",
            "How do we cross the Salar de Atacama halite pressure ridges?",
            "How do we navigate King Ravine Subway and Mahoosuc Notch Balch-ice megatalus?",
        ]
        for q in non_matching:
            assert not is_gypsum_karst_query(q), f"Expected negative intent for: {q}"

        # Verify adjacent cave_mineralogy/caving/cenote/tiankeng/tsingy/salar/water/orienteering domains do not hijack gypsum_karst queries
        gypsum_queries = [
            "How do we navigate Optimisticeskaja and Ozerna artesian gypsum karst dissolution maze in Podolia, Ukraine?",
            "Calculate gypsum karst breakdown-hall peel probability at Vena del Gesso Spipola with ceiling bed thickness 9 cm",
            "Evaluate rapid dissolution siphon flood risk in Yesos de Sorbas and Cueva de Covadura evaporite karst maze",
            "Assess anhydrite hydration dome swelling and ceiling slab peel in Parks Ranch Cave gypsum sink-maze",
        ]
        for gq in gypsum_queries:
            assert is_gypsum_karst_query(gq) is True
            assert detect_cave_mineralogy_intent(gq) is None
            assert detect_caving_intent(gq) is None
            assert is_cenote_halocline_query(gq) is False
            assert is_tiankeng_descent_query(gq) is False
            assert is_tsingy_labyrinth_query(gq) is False
            assert is_glaciere_caving_query(gq) is False
            assert detect_lava_tube_biospeleology_intent(gq) is False
            assert detect_cryokarst_speleology_intent(gq) is False
            assert detect_cave_diving_intent(gq) is None
            assert is_salar_pressure_ridge_query(gq) is False
            assert is_talus_cold_trap_query(gq) is False
            assert extract_orienteering_intent(gq) is None
            assert detect_water_intent(gq) is None

    def test_extract_params_from_natural_language(self) -> None:
        query = (
            "Calculate gypsum karst hazard for Optimisticeskaja with junction count 34 per 100m, "
            "ceiling bed thickness 7.5 cm, surface rain inflow 28 mm/hr, anhydrite swelling 46%, "
            "and party acoustic 84 dB."
        )
        params = extract_gypsum_karst_params(query)
        assert params["site_id"] == "optimisticeskaja-ozerna-podolia-ukraine"
        assert params["junction_count_per_100m"] == 34.0
        assert params["ceiling_bed_thickness_cm"] == 7.5
        assert params["surface_rain_inflow_mm_hr"] == 28.0
        assert params["anhydrite_swelling_pct"] == 46.0
        assert params["party_acoustic_decibels"] == 84.0
        assert params["has_calc_params"] is True

    def test_format_response_actions_and_prompt_builder(self) -> None:
        calc_info: dict[str, object] = format_gypsum_karst_response(
            "Calculate gypsum karst risk with junction count 30 per 100m, ceiling bed thickness 9 cm, and surface rain inflow 25 mm/hr"
        )
        assert calc_info["action"] == "gypsum_karst_calculated"
        assert calc_info["calculation"] is not None

        lookup_info: dict[str, object] = format_gypsum_karst_response(
            "Tell me about Sistema Spipola-Acquafredda and Vena del Gesso Messinian selenite karst in Italy"
        )
        assert lookup_info["action"] == "gypsum_karst_lookup"
        matched = lookup_info["matched_sites"]
        assert isinstance(matched, list)
        assert len(matched) == 1
        assert matched[0]["id"] == "spipola-acquafredda-vena-del-gesso-italy"

        general_info: dict[str, object] = format_gypsum_karst_response(
            "Give me an overview of subterranean gypsum-karst dissolution maze and evaporite breakdown-hall speleology"
        )
        assert general_info["action"] == "gypsum_karst_info"
        sites_list = general_info["sites"]
        assert isinstance(sites_list, list)
        assert len(sites_list) == 4

        prompt = build_gypsum_karst_prompt(calc_info)
        assert "GYPSUM" in prompt.upper()
        assert "EVAPORITE" in prompt.upper() or "KARST" in prompt.upper()

    def test_chat_and_stream_helpers(self) -> None:
        chat_res = get_chat_response(
            "How do we navigate Optimisticeskaja gypsum maze with junction count 32 per 100m and ceiling bed thickness 8 cm?"
        )
        assert "answer" in chat_res
        assert "gypsum_karst_info" in chat_res
        assert chat_res["gypsum_karst_info"]["action"] == "gypsum_karst_calculated"

        events = list(
            generate_stream_events(
                "Tell me about Karst en Yesos de Sorbas and Cueva de Covadura evaporite maze in Spain"
            )
        )
        assert len(events) >= 3
        assert events[0]["gypsum_karst_info"]["action"] == "gypsum_karst_lookup"
