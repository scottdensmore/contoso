"""Unit tests for the Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing Guide."""

import pytest
from contoso_chat.barnacle_ledge import (
    BARNACLE_LEDGE_GEAR_CHECKLIST,
    BARNACLE_LEDGE_SITES,
    BARNACLE_SITES,
    build_barnacle_ledge_prompt,
    calculate_barnacle_ledge,
    detect_barnacle_ledge_intent,
    extract_barnacle_ledge_params,
    filter_sites,
    format_barnacle_ledge_response,
    generate_stream_events,
    get_all_barnacle_ledge_sites,
    get_all_sites,
    get_barnacle_ledge_site_by_id,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    is_barnacle_ledge_query,
)
from contoso_chat.beachcombing import detect_beachcombing_intent
from contoso_chat.coasteering import detect_coasteering_intent
from contoso_chat.cobble_spit_trekking import is_cobble_spit_trekking_query
from contoso_chat.first_aid import detect_first_aid_intent
from contoso_chat.foraging import detect_foraging_intent
from contoso_chat.kelp_freediving import detect_kelp_freediving_intent
from contoso_chat.leave_no_trace import detect_lnt_intent
from contoso_chat.mudflat_trekking import detect_mudflat_intent
from contoso_chat.psicobloc import detect_psicobloc_intent
from contoso_chat.sea_cave_pneumatics import is_sea_cave_pneumatics_query
from contoso_chat.sea_kayaking import detect_sea_kayaking_intent


class TestBarnacleLedgeCatalog:
    """Tests for the intertidal sabellariid worm-reef & barnacle ledge catalog and lookup functions."""

    def test_catalog_has_four_sites(self) -> None:
        sites = get_all_sites()
        assert len(sites) == 4
        assert len(BARNACLE_LEDGE_SITES) == 4
        assert len(BARNACLE_SITES) == 4
        assert len(get_all_barnacle_ledge_sites()) == 4

    def test_expected_site_ids_present(self) -> None:
        site_ids = {s["id"] for s in get_all_sites()}
        expected = {
            "cape-perpetua-yachats-basalt-bench-oregon",
            "duckpool-bude-sabellaria-reef-cornwall-uk",
            "west-coast-trail-owen-point-shelf-bc-canada",
            "cabo-percebes-costa-da-morte-galicia-spain",
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
            "substrate_type",
            "difficulty",
            "default_swell_height_m",
            "default_swell_period_sec",
            "default_algal_biofilm_cover_pct",
            "default_sabellariid_colony_density_pct",
            "default_ledge_freeboard_m",
            "primary_hazard",
            "traversal_strategy",
            "navigation_protocol",
            "conservation_protocol",
            "field_notes",
        }
        for site in get_all_sites():
            assert required_keys.issubset(site.keys())
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.substrate_type == site["substrate_type"]

    def test_get_site_by_id_exact_and_fuzzy(self) -> None:
        cape_perpetua = get_site_by_id("cape-perpetua-yachats-basalt-bench-oregon")
        assert cape_perpetua is not None
        assert cape_perpetua["country"] == "USA"
        assert cape_perpetua["substrate_type"] == "balanus-mussel-basalt-bench"
        assert cape_perpetua["difficulty"] == "extreme"

        duckpool = get_barnacle_ledge_site_by_id("duckpool")
        assert duckpool is not None
        assert duckpool["id"] == "duckpool-bude-sabellaria-reef-cornwall-uk"
        assert duckpool["country"] == "UK"
        assert duckpool["substrate_type"] == "sabellariid-honeycomb-worm-reef"
        assert duckpool["difficulty"] == "moderate"

        owen_point = get_site_by_id("owen point")
        assert owen_point is not None
        assert owen_point["id"] == "west-coast-trail-owen-point-shelf-bc-canada"
        assert owen_point["country"] == "Canada"
        assert owen_point["substrate_type"] == "porphyra-ulva-glazed-shelf"
        assert owen_point["difficulty"] == "challenging"

        roncudo = get_site_by_id("roncudo")
        assert roncudo is not None
        assert roncudo["id"] == "cabo-percebes-costa-da-morte-galicia-spain"
        assert roncudo["country"] == "Spain"
        assert roncudo["substrate_type"] == "pollicipes-gooseneck-surge-channel"
        assert roncudo["difficulty"] == "extreme"

    def test_get_site_by_id_unknown_returns_none(self) -> None:
        assert get_site_by_id("nonexistent-barnacle-ledge-site") is None
        assert get_site_by_id("") is None

    def test_filter_sites_by_country_substrate_type_difficulty_and_search(self) -> None:
        usa_sites = filter_sites(country="USA")
        assert len(usa_sites) == 1
        assert usa_sites[0]["id"] == "cape-perpetua-yachats-basalt-bench-oregon"

        uk_sites = filter_sites(country="UK")
        assert len(uk_sites) == 1
        assert uk_sites[0]["id"] == "duckpool-bude-sabellaria-reef-cornwall-uk"

        sub_sites = filter_sites(substrate_type="sabellariid-honeycomb-worm-reef")
        assert len(sub_sites) == 1
        assert sub_sites[0]["id"] == "duckpool-bude-sabellaria-reef-cornwall-uk"

        extreme_sites = filter_sites(difficulty="extreme")
        assert len(extreme_sites) == 2

        search_sites = filter_sites(search="Percebe")
        assert len(search_sites) == 1
        assert search_sites[0]["id"] == "cabo-percebes-costa-da-morte-galicia-spain"

    def test_gear_checklist_has_six_essential_items(self) -> None:
        checklist = get_gear_checklist()
        assert len(checklist) == 6
        assert len(BARNACLE_LEDGE_GEAR_CHECKLIST) == 6
        for item in checklist:
            assert item["priority"] == "essential"
            assert "item" in item
            assert "category" in item
            assert "rationale" in item


class TestBarnacleLedgeCalculator:
    """Tests for the deterministic calculate_barnacle_ledge engine."""

    def test_default_calculation_returns_expected_keys(self) -> None:
        res = calculate_barnacle_ledge(
            swell_height_m=1.8,
            swell_period_sec=12.0,
            algal_biofilm_cover_pct=40.0,
            sabellariid_colony_density_pct=35.0,
            ledge_freeboard_m=1.6,
        )
        expected_keys = {
            "swell_height_m",
            "swell_period_sec",
            "algal_biofilm_cover_pct",
            "sabellariid_colony_density_pct",
            "ledge_freeboard_m",
            "infragravity_overwash_probability_pct",
            "barnacle_laceration_shear_score",
            "biogenic_reef_crush_damage_pct",
            "safe_tide_window_minutes",
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

    def test_low_risk_calm_intertidal_shelf_conditions(self) -> None:
        res = calculate_barnacle_ledge(
            swell_height_m=0.5,
            swell_period_sec=7.0,
            algal_biofilm_cover_pct=10.0,
            sabellariid_colony_density_pct=5.0,
            ledge_freeboard_m=3.8,
        )
        assert res["risk_level"] == "low"
        assert res["infragravity_overwash_probability_pct"] < 20.0
        assert res["barnacle_laceration_shear_score"] < 35.0
        assert res["biogenic_reef_crush_damage_pct"] < 15.0
        assert res["safe_tide_window_minutes"] >= 110

    def test_critical_risk_long_period_surge_and_dense_biofilm(self) -> None:
        res = calculate_barnacle_ledge(
            swell_height_m=4.8,
            swell_period_sec=19.0,
            algal_biofilm_cover_pct=88.0,
            sabellariid_colony_density_pct=78.0,
            ledge_freeboard_m=0.4,
        )
        assert res["risk_level"] == "critical"
        assert res["infragravity_overwash_probability_pct"] >= 75.0
        assert res["barnacle_laceration_shear_score"] >= 75.0
        assert res["biogenic_reef_crush_damage_pct"] >= 60.0
        assert res["safe_tide_window_minutes"] <= 30
        assert len(res["warnings"]) >= 3

    def test_monotonicity_across_inputs(self) -> None:
        calm = calculate_barnacle_ledge(
            swell_height_m=0.8,
            swell_period_sec=8.0,
            algal_biofilm_cover_pct=15.0,
            sabellariid_colony_density_pct=15.0,
            ledge_freeboard_m=3.2,
        )
        storm = calculate_barnacle_ledge(
            swell_height_m=3.8,
            swell_period_sec=17.0,
            algal_biofilm_cover_pct=80.0,
            sabellariid_colony_density_pct=75.0,
            ledge_freeboard_m=0.7,
        )
        assert (
            storm["infragravity_overwash_probability_pct"]
            > calm["infragravity_overwash_probability_pct"]
        )
        assert (
            storm["barnacle_laceration_shear_score"] > calm["barnacle_laceration_shear_score"]
        )
        assert (
            storm["biogenic_reef_crush_damage_pct"] > calm["biogenic_reef_crush_damage_pct"]
        )
        assert storm["safe_tide_window_minutes"] < calm["safe_tide_window_minutes"]

    @pytest.mark.parametrize(
        "kwargs,expected_field",
        [
            ({"swell_height_m": 0.1}, "swell_height_m"),
            ({"swell_height_m": 7.0}, "swell_height_m"),
            ({"swell_period_sec": 3.0}, "swell_period_sec"),
            ({"swell_period_sec": 25.0}, "swell_period_sec"),
            ({"algal_biofilm_cover_pct": -5.0}, "algal_biofilm_cover_pct"),
            ({"algal_biofilm_cover_pct": 105.0}, "algal_biofilm_cover_pct"),
            ({"sabellariid_colony_density_pct": -2.0}, "sabellariid_colony_density_pct"),
            ({"sabellariid_colony_density_pct": 110.0}, "sabellariid_colony_density_pct"),
            ({"ledge_freeboard_m": 0.05}, "ledge_freeboard_m"),
            ({"ledge_freeboard_m": 5.5}, "ledge_freeboard_m"),
        ],
    )
    def test_validation_bounds_raise_value_error(
        self, kwargs: dict[str, float], expected_field: str
    ) -> None:
        base = {
            "swell_height_m": 1.8,
            "swell_period_sec": 12.0,
            "algal_biofilm_cover_pct": 40.0,
            "sabellariid_colony_density_pct": 35.0,
            "ledge_freeboard_m": 1.6,
        }
        base.update(kwargs)
        with pytest.raises(ValueError, match=expected_field):
            calculate_barnacle_ledge(**base)


class TestBarnacleLedgeIntentAndFormatting:
    """Tests for intent detection, parameter extraction, response formatting, and disambiguation."""

    def test_positive_intent_detection(self) -> None:
        queries = [
            "How do we traverse the barnacle-encrusted basalt ledge at Cape Perpetua and Thor's Well?",
            "Assess sabellariid honeycomb worm-reef crush damage at Duckpool and Bude in Cornwall.",
            "What is the safe tide window for Owen Point wave-cut Porphyra barnacle shelf on the West Coast Trail?",
            "How do we avoid barnacle laceration on Roncudo and Cabo Vilán gooseneck barnacle percebe surge ledges?",
            "Calculate barnacle ledge risk with swell height 2.6 m, swell period 15 sec, and algal biofilm 65%.",
        ]
        for q in queries:
            assert is_barnacle_ledge_query(q), f"Expected positive intent for: {q}"
            assert detect_barnacle_ledge_intent(q), f"Expected positive intent for: {q}"

    def test_negative_intent_and_cross_domain_disambiguation(self) -> None:
        non_matching = [
            "What boots do you recommend for hiking?",
            "Where is my order #12345?",
            "Show me coastal sea cliff coasteering routes",
            "What is the max jump height and caves at Depoe Bay cliffs?",
            "Pachena Carmanah intertidal kelp-wrack boulder reef navigation on the West Coast Trail",
            "How do I trek across an intertidal cobble spit with 30 cm kelp-wrack depth?",
            "What is the pneumatic wave overpressure in Fingal's Cave blowhole?",
            "Calculate wattwandern mudflat silt suction drag in the Wadden Sea",
            "How do I freedive through Macrocystis kelp forest canopy at Point Lobos?",
        ]
        for q in non_matching:
            assert not is_barnacle_ledge_query(q), f"Expected negative intent for: {q}"

        # Verify adjacent coastal/intertidal domains do not hijack barnacle_ledge queries
        barnacle_queries = [
            "How do we traverse the barnacle-encrusted basalt ledge at Cape Perpetua and Thor's Well in Oregon?",
            "Calculate barnacle ledge risk at Duckpool Sabellaria alveolata honeycomb worm-reef with swell height 1.9 m",
            "Traversing Owen Point wave-cut Porphyra-barnacle shelf on the West Coast Trail without barnacle laceration",
            "Evaluate gooseneck barnacle percebe surge ledges at Roncudo and Cabo Vilán in Galicia",
        ]
        for bq in barnacle_queries:
            assert is_barnacle_ledge_query(bq) is True
            assert detect_coasteering_intent(bq) is None
            assert is_cobble_spit_trekking_query(bq) is False
            assert is_sea_cave_pneumatics_query(bq) is False
            assert detect_mudflat_intent(bq) is None
            assert detect_beachcombing_intent(bq) is None
            assert detect_kelp_freediving_intent(bq) is False
            assert detect_sea_kayaking_intent(bq) is None
            assert detect_psicobloc_intent(bq) is None
            assert detect_foraging_intent(bq) is None
            assert detect_first_aid_intent(bq) is None
            assert detect_lnt_intent(bq) is None

    def test_extract_params_from_natural_language(self) -> None:
        query = (
            "Calculate barnacle ledge risk for Cape Perpetua with swell height 2.8 m, "
            "swell period 16 sec, algal biofilm cover 72%, sabellariid colony density 20%, "
            "and ledge freeboard 1.1 m."
        )
        params = extract_barnacle_ledge_params(query)
        assert params["site_id"] == "cape-perpetua-yachats-basalt-bench-oregon"
        assert params["swell_height_m"] == 2.8
        assert params["swell_period_sec"] == 16.0
        assert params["algal_biofilm_cover_pct"] == 72.0
        assert params["sabellariid_colony_density_pct"] == 20.0
        assert params["ledge_freeboard_m"] == 1.1
        assert params["has_calc_params"] is True

    def test_format_response_actions_and_prompt_builder(self) -> None:
        calc_info: dict[str, object] = format_barnacle_ledge_response(
            "Calculate barnacle ledge risk with swell height 2.4 m, swell period 15 sec, and algal biofilm 60%"
        )
        assert calc_info["action"] == "barnacle_ledge_calculated"
        assert calc_info["calculation"] is not None

        lookup_info: dict[str, object] = format_barnacle_ledge_response(
            "Tell me about Duckpool and Bude Sabellaria alveolata honeycomb worm-reef in Cornwall"
        )
        assert lookup_info["action"] == "barnacle_ledge_lookup"
        matched = lookup_info["matched_sites"]
        assert isinstance(matched, list)
        assert len(matched) == 1
        assert matched[0]["id"] == "duckpool-bude-sabellaria-reef-cornwall-uk"

        general_info: dict[str, object] = format_barnacle_ledge_response(
            "Give me an overview of intertidal sabellariid worm-reef and barnacle-encrusted basalt ledge traversing"
        )
        assert general_info["action"] == "barnacle_ledge_info"
        sites_list = general_info["sites"]
        assert isinstance(sites_list, list)
        assert len(sites_list) == 4

        prompt = build_barnacle_ledge_prompt(calc_info)
        assert "BARNACLE" in prompt.upper()
        assert "SABELLARIID" in prompt.upper()

    def test_chat_and_stream_helpers(self) -> None:
        chat_res = get_chat_response(
            "How do we traverse Cape Perpetua basalt ledge with swell height 2.5 m and swell period 14 sec?"
        )
        assert "answer" in chat_res
        assert "barnacle_ledge_info" in chat_res
        assert chat_res["barnacle_ledge_info"]["action"] == "barnacle_ledge_calculated"

        events = list(
            generate_stream_events(
                "Tell me about Cabo Percebes and Roncudo gooseneck barnacle surge ledges in Spain"
            )
        )
        assert len(events) >= 3
        assert events[0]["barnacle_ledge_info"]["action"] == "barnacle_ledge_lookup"
