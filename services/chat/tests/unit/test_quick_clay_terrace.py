"""Unit tests for the Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Navigation Guide module."""

from __future__ import annotations

import pytest
from contoso_chat.quick_clay_terrace import (
    QUICK_CLAY_SITES,
    QUICK_CLAY_TERRACE_GEAR_CHECKLIST,
    QUICK_CLAY_TERRACE_SITES,
    QuickClayTerraceSite,
    build_quick_clay_terrace_prompt,
    calculate_quick_clay_terrace,
    detect_quick_clay_terrace_intent,
    extract_quick_clay_terrace_params,
    filter_sites,
    format_quick_clay_terrace_response,
    generate_stream_events,
    get_all_sites,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    is_quick_clay_terrace_query,
)


class TestQuickClayTerraceCatalog:
    """Validate the coastal fjord quick-clay (kvikkleire) marine-terrace catalog."""

    def test_catalog_has_four_sites(self) -> None:
        assert len(QUICK_CLAY_TERRACE_SITES) == 4
        assert QUICK_CLAY_SITES is QUICK_CLAY_TERRACE_SITES
        all_sites = get_all_sites()
        assert len(all_sites) == 4

    def test_expected_site_ids_present(self) -> None:
        ids = {site["id"] for site in QUICK_CLAY_TERRACE_SITES}
        assert ids == {
            "gauldalen-trondheimsfjord-kvikkleire-norway",
            "romerike-gjerdrum-ravine-terrace-norway",
            "south-nation-lemieux-leda-clay-ontario-canada",
            "saguenay-saint-jean-vianney-terrace-quebec-canada",
        }

    def test_get_site_by_id(self) -> None:
        site = get_site_by_id("gauldalen-trondheimsfjord-kvikkleire-norway")
        assert site is not None
        assert site["country"] == "Norway"
        assert site["deposit_type"] == "glaciomarine-kvikkleire-ravine"
        assert site["difficulty"] == "extreme"

        missing = get_site_by_id("nonexistent-quick-clay-terrace")
        assert missing is None

    def test_site_attribute_access_and_required_fields(self) -> None:
        required_keys = {
            "id",
            "name",
            "country",
            "region",
            "deposit_type",
            "terrace_type",
            "morphology",
            "substrate_type",
            "difficulty",
            "elevation_range",
            "marine_limit_m",
            "default_sensitivity_ratio_st",
            "default_pore_salinity_g_per_l",
            "default_ravine_slope_angle_deg",
            "default_stream_toe_erosion_rate_cm_yr",
            "default_rainfall_saturation_pct",
            "primary_hazard",
            "terrace_strategy",
            "crossing_strategy",
            "scarp_setback_protocol",
            "remolding_avoidance_protocol",
            "conservation_protocol",
            "field_notes",
        }
        for site in QUICK_CLAY_TERRACE_SITES:
            assert isinstance(site, QuickClayTerraceSite)
            assert required_keys.issubset(site.keys())
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.deposit_type == site["deposit_type"]
            assert site.difficulty in {"moderate", "challenging", "extreme"}

    def test_filter_sites_by_country(self) -> None:
        norway = filter_sites(country="Norway")
        assert len(norway) == 2

        canada = filter_sites(country="canada")
        assert len(canada) == 2
        canada_ids = {s["id"] for s in canada}
        assert canada_ids == {
            "south-nation-lemieux-leda-clay-ontario-canada",
            "saguenay-saint-jean-vianney-terrace-quebec-canada",
        }

    def test_filter_sites_by_deposit_type_and_difficulty(self) -> None:
        kvikkleire = filter_sites(deposit_type="glaciomarine-kvikkleire-ravine")
        assert len(kvikkleire) == 1
        assert kvikkleire[0]["id"] == "gauldalen-trondheimsfjord-kvikkleire-norway"

        leda = filter_sites(deposit_type="champlain-sea-leda-clay-terrace")
        assert len(leda) == 1
        assert leda[0]["id"] == "south-nation-lemieux-leda-clay-ontario-canada"

        challenging = filter_sites(difficulty="challenging")
        assert len(challenging) == 2

        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 2

    def test_filter_sites_by_search(self) -> None:
        gjerdrum = filter_sites(search="Gjerdrum")
        assert len(gjerdrum) == 1
        assert gjerdrum[0]["id"] == "romerike-gjerdrum-ravine-terrace-norway"

        saguenay = filter_sites(search="Saguenay")
        assert len(saguenay) == 1
        assert saguenay[0]["id"] == "saguenay-saint-jean-vianney-terrace-quebec-canada"


class TestCalculateQuickClayTerrace:
    """Validate deterministic physics and geotechnical calculations for quick-clay marine terraces."""

    def test_default_parameters_return_expected_structure(self) -> None:
        result = calculate_quick_clay_terrace()
        expected_keys = {
            "sensitivity_ratio_st",
            "pore_salinity_g_per_l",
            "ravine_slope_angle_deg",
            "stream_toe_erosion_rate_cm_yr",
            "rainfall_saturation_pct",
            "retrogressive_liquefaction_risk_pct",
            "retrogression_runout_distance_m",
            "remolded_shear_strength_kpa",
            "safe_crown_setback_distance_m",
            "risk_level",
            "safety_status",
            "terrace_strategy",
            "crossing_strategy",
            "warnings",
            "recommendations",
        }
        assert expected_keys.issubset(result.keys())
        assert result["risk_level"] in {"low", "moderate", "high", "critical"}
        assert isinstance(result["warnings"], list)
        assert isinstance(result["recommendations"], list)

    def test_low_risk_unleached_saline_clay_terrace(self) -> None:
        res = calculate_quick_clay_terrace(
            sensitivity_ratio_st=14.0,
            pore_salinity_g_per_l=11.5,
            ravine_slope_angle_deg=8.0,
            stream_toe_erosion_rate_cm_yr=5.0,
            rainfall_saturation_pct=20.0,
        )
        assert res["risk_level"] == "low"
        assert res["retrogressive_liquefaction_risk_pct"] < 28.0
        assert res["remolded_shear_strength_kpa"] > 0.5
        assert res["retrogression_runout_distance_m"] < 90.0
        assert res["safe_crown_setback_distance_m"] < 55.0

    def test_critical_risk_leached_kvikkleire_ravine(self) -> None:
        res = calculate_quick_clay_terrace(
            sensitivity_ratio_st=195.0,
            pore_salinity_g_per_l=0.3,
            ravine_slope_angle_deg=36.0,
            stream_toe_erosion_rate_cm_yr=110.0,
            rainfall_saturation_pct=92.0,
        )
        assert res["risk_level"] == "critical"
        assert res["retrogressive_liquefaction_risk_pct"] >= 75.0
        assert res["remolded_shear_strength_kpa"] <= 0.35
        assert res["retrogression_runout_distance_m"] >= 200.0
        assert res["safe_crown_setback_distance_m"] >= 110.0
        assert len(res["warnings"]) >= 3

    def test_parameter_validation_bounds(self) -> None:
        with pytest.raises(ValueError, match="sensitivity_ratio_st"):
            calculate_quick_clay_terrace(sensitivity_ratio_st=5.0)
        with pytest.raises(ValueError, match="sensitivity_ratio_st"):
            calculate_quick_clay_terrace(sensitivity_ratio_st=320.0)

        with pytest.raises(ValueError, match="pore_salinity_g_per_l"):
            calculate_quick_clay_terrace(pore_salinity_g_per_l=0.02)
        with pytest.raises(ValueError, match="pore_salinity_g_per_l"):
            calculate_quick_clay_terrace(pore_salinity_g_per_l=18.0)

        with pytest.raises(ValueError, match="ravine_slope_angle_deg"):
            calculate_quick_clay_terrace(ravine_slope_angle_deg=2.0)
        with pytest.raises(ValueError, match="ravine_slope_angle_deg"):
            calculate_quick_clay_terrace(ravine_slope_angle_deg=50.0)

        with pytest.raises(ValueError, match="stream_toe_erosion_rate_cm_yr"):
            calculate_quick_clay_terrace(stream_toe_erosion_rate_cm_yr=-5.0)
        with pytest.raises(ValueError, match="stream_toe_erosion_rate_cm_yr"):
            calculate_quick_clay_terrace(stream_toe_erosion_rate_cm_yr=175.0)

        with pytest.raises(ValueError, match="rainfall_saturation_pct"):
            calculate_quick_clay_terrace(rainfall_saturation_pct=-1.0)
        with pytest.raises(ValueError, match="rainfall_saturation_pct"):
            calculate_quick_clay_terrace(rainfall_saturation_pct=105.0)


class TestGearChecklistAndIntentDetection:
    """Validate gear checklist, intent detection, and cross-domain disambiguation."""

    def test_gear_checklist_has_six_essential_items(self) -> None:
        gear = get_gear_checklist()
        assert len(gear) == 6
        assert gear == QUICK_CLAY_TERRACE_GEAR_CHECKLIST
        names = " ".join(item["item"].lower() for item in gear)
        assert "lidar" in names or "nve" in names or "clinometer" in names or "probe" in names
        assert "snowshoe" in names or "flotation" in names or "mud" in names or "throw" in names

    @pytest.mark.parametrize(
        "query",
        [
            "How do I safely navigate quick-clay marine-terrace ravines in Gauldalen and Rissa near Trondheimsfjord?",
            "Assessing kvikkleire retrogressive slump and bottleneck landslide hazards in Romerike and Gjerdrum, Norway",
            "Trekking along South Nation River and Lemieux Champlain Sea Leda-clay bluffs in Ontario",
            "Navigating Saguenay Fjord and Saint-Jean-Vianney Laflamme Sea postglacial quick-clay terraces",
            "What crown setback distance do I need above a leached glaciomarine clay ravine with St=120 and 0.4 g/L salinity?",
        ],
    )
    def test_detects_quick_clay_terrace_queries(self, query: str) -> None:
        assert is_quick_clay_terrace_query(query) is True
        assert detect_quick_clay_terrace_intent(query) is True

    @pytest.mark.parametrize(
        "non_quick_clay_query",
        [
            "Wilderness mudflat trekking and prielen creek wading across Wadden Sea Neuwerk",
            "Crossing Skeiðarársandur braided glacial outwash river and rock-flour quicksand bars",
            "Navigating Batagaika retrogressive thaw mega-slump and ice-wedge polygon tundra in Yakutia",
            "Crossing Viiankiaapa boreal string-bog flark pools and palsa permafrost mounds in Finland",
            "Soomaa raised bog shoeing with räätsad across ombrotrophic sphagnum quaking mires",
            "Trekking Dungeness Spit coastal cobble berm and kelp-wrack boulder reefs",
            "Traversing Cape Perpetua barnacle-encrusted basalt ledges and sabellariid worm reefs",
        ],
    )
    def test_rejects_adjacent_domain_queries(self, non_quick_clay_query: str) -> None:
        assert is_quick_clay_terrace_query(non_quick_clay_query) is False
        assert detect_quick_clay_terrace_intent(non_quick_clay_query) is False

    def test_extract_params_and_format_response(self) -> None:
        query = (
            "Assess Romerike and Gjerdrum kvikkleire ravine terrace in Norway with sensitivity ratio St 145, "
            "0.4 g/L pore salinity, 31 deg ravine slope angle, 85 cm/yr toe erosion, and 88% rainfall saturation"
        )
        params = extract_quick_clay_terrace_params(query)
        assert params["sensitivity_ratio_st"] == 145.0
        assert params["pore_salinity_g_per_l"] == 0.4
        assert params["ravine_slope_angle_deg"] == 31.0
        assert params["stream_toe_erosion_rate_cm_yr"] == 85.0
        assert params["rainfall_saturation_pct"] == 88.0

        info = format_quick_clay_terrace_response(query)
        assert info["matched_site"]["id"] == "romerike-gjerdrum-ravine-terrace-norway"
        assert info["calculation"]["risk_level"] in {"high", "critical"}
        assert "Romerike" in info["summary"] or "Gjerdrum" in info["summary"]

        prompt = build_quick_clay_terrace_prompt(info)
        assert "Quick-Clay" in prompt or "Kvikkleire" in prompt
        assert "Gjerdrum" in prompt

        chat_res = get_chat_response(query)
        assert "answer" in chat_res
        assert "quick_clay_terrace_info" in chat_res

        events = list(generate_stream_events(query))
        assert any(e.get("event") == "quick_clay_terrace_info" for e in events)

    def test_cross_domain_disambiguation_guards(self) -> None:
        from contoso_chat.aapa_palsa_mire import detect_aapa_palsa_mire_intent
        from contoso_chat.avalanche import detect_avalanche_intent
        from contoso_chat.barnacle_ledge import detect_barnacle_ledge_intent
        from contoso_chat.bog_shoeing import detect_bog_shoeing_intent
        from contoso_chat.cobble_spit_trekking import detect_cobble_spit_trekking_intent
        from contoso_chat.mudflat_trekking import detect_mudflat_intent
        from contoso_chat.orienteering import detect_orienteering_intent
        from contoso_chat.sandur_crossing import is_sandur_crossing_query
        from contoso_chat.scree_running import detect_scree_running_intent
        from contoso_chat.sea_kayaking import detect_sea_kayaking_intent
        from contoso_chat.thermokarst_tundra import is_thermokarst_tundra_query

        queries = [
            "How do I safely navigate quick-clay marine-terrace ravines in Gauldalen and Rissa near Trondheimsfjord?",
            "Assessing kvikkleire retrogressive slump and bottleneck landslide hazards in Romerike and Gjerdrum, Norway",
            "Trekking along South Nation River and Lemieux Champlain Sea Leda-clay bluffs in Ontario with 28 deg ravine slope",
            "Navigating Saguenay Fjord and Saint-Jean-Vianney Laflamme Sea postglacial quick-clay terraces",
        ]
        for q in queries:
            assert detect_quick_clay_terrace_intent(q) is True
            assert not detect_mudflat_intent(q)
            assert not is_sandur_crossing_query(q)
            assert not is_thermokarst_tundra_query(q)
            assert not detect_aapa_palsa_mire_intent(q)
            assert not detect_bog_shoeing_intent(q)
            assert not detect_cobble_spit_trekking_intent(q)
            assert not detect_barnacle_ledge_intent(q)
            assert not detect_sea_kayaking_intent(q)
            assert not detect_avalanche_intent(q)
            assert not detect_scree_running_intent(q)
            assert not detect_orienteering_intent(q)
