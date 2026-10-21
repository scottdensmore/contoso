"""Unit tests for the Tropical Laterite Duricrust Mesa & Bauxite Ferricrete Scarp-Edge Bushwhacking module."""

from __future__ import annotations

import pytest
from contoso_chat.laterite_duricrust import (
    LATERITE_DURICRUST_GEAR_CHECKLIST,
    LATERITE_DURICRUST_SITES,
    LATERITE_SITES,
    LateriteDuricrustSite,
    build_laterite_duricrust_prompt,
    calculate_laterite_duricrust,
    detect_laterite_duricrust_intent,
    extract_laterite_duricrust_params,
    filter_sites,
    format_laterite_duricrust_response,
    generate_stream_events,
    get_chat_response,
    get_gear_checklist,
    is_laterite_duricrust_query,
)


class TestLateriteDuricrustCatalog:
    """Validate the tropical laterite duricrust & bauxite ferricrete catalog."""

    def test_catalog_has_four_sites(self) -> None:
        assert len(LATERITE_DURICRUST_SITES) == 4
        assert LATERITE_SITES is LATERITE_DURICRUST_SITES

    def test_expected_site_ids_present(self) -> None:
        ids = {site["id"] for site in LATERITE_DURICRUST_SITES}
        assert ids == {
            "fouta-djallon-bowe-labe-guinea",
            "serra-dos-carajas-canga-para-brazil",
            "mitchell-plateau-ngauwudu-kimberley-australia",
            "panchgani-kaas-ferricrete-tableland-maharashtra-india",
        }

    def test_site_attribute_access_and_required_fields(self) -> None:
        required_keys = {
            "id",
            "name",
            "country",
            "region",
            "duricrust_type",
            "morphology",
            "substrate_type",
            "difficulty",
            "elevation_range",
            "max_elevation_m",
            "default_pisolite_gravel_depth_mm",
            "default_scarp_slope_angle_deg",
            "default_saprolite_undercut_span_m",
            "default_surface_rock_temp_c",
            "default_convective_storm_proximity_km",
            "primary_hazard",
            "scarp_strategy",
            "crossing_strategy",
            "navigation_strategy",
            "navigation_protocol",
            "conservation_protocol",
            "field_notes",
        }
        for site in LATERITE_DURICRUST_SITES:
            assert isinstance(site, LateriteDuricrustSite)
            assert required_keys.issubset(site.keys())
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.duricrust_type == site["duricrust_type"]
            assert site.difficulty in {"moderate", "challenging", "extreme"}

    def test_filter_sites_by_country(self) -> None:
        guinea = filter_sites(country="Guinea")
        assert len(guinea) == 1
        assert guinea[0]["id"] == "fouta-djallon-bowe-labe-guinea"

        brazil = filter_sites(country="brazil")
        assert len(brazil) == 1
        assert brazil[0]["id"] == "serra-dos-carajas-canga-para-brazil"

    def test_filter_sites_by_duricrust_type_and_difficulty(self) -> None:
        bauxite = filter_sites(duricrust_type="bauxite")
        assert len(bauxite) == 1
        assert bauxite[0]["id"] == "mitchell-plateau-ngauwudu-kimberley-australia"

        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 2

    def test_filter_sites_by_search(self) -> None:
        canga = filter_sites(search="Carajás")
        assert len(canga) == 1
        assert canga[0]["id"] == "serra-dos-carajas-canga-para-brazil"

        panchgani = filter_sites(search="Panchgani")
        assert len(panchgani) == 1
        assert panchgani[0]["id"] == "panchgani-kaas-ferricrete-tableland-maharashtra-india"


class TestCalculateLateriteDuricrust:
    """Validate deterministic physics and safety calculations for laterite duricrust scarps."""

    def test_default_parameters_return_expected_structure(self) -> None:
        result = calculate_laterite_duricrust()
        expected_keys = {
            "pisolite_gravel_depth_mm",
            "scarp_slope_angle_deg",
            "saprolite_undercut_span_m",
            "surface_rock_temp_c",
            "convective_storm_proximity_km",
            "pisolite_ball_bearing_slip_pct",
            "cantilever_rim_collapse_probability_pct",
            "ferruginous_compass_deviation_deg",
            "mesa_lightning_thermal_hazard_score",
            "risk_level",
            "safety_status",
            "scarp_strategy",
            "crossing_strategy",
            "navigation_strategy",
            "warnings",
            "recommendations",
        }
        assert expected_keys.issubset(result.keys())
        assert result["risk_level"] in {"low", "moderate", "high", "critical"}
        assert isinstance(result["warnings"], list)
        assert isinstance(result["recommendations"], list)

    def test_low_risk_benign_tableland(self) -> None:
        res = calculate_laterite_duricrust(
            pisolite_gravel_depth_mm=4.0,
            scarp_slope_angle_deg=9.0,
            saprolite_undercut_span_m=0.3,
            surface_rock_temp_c=27.0,
            convective_storm_proximity_km=48.0,
        )
        assert res["risk_level"] == "low"
        assert res["pisolite_ball_bearing_slip_pct"] < 25.0
        assert res["cantilever_rim_collapse_probability_pct"] < 20.0
        assert res["mesa_lightning_thermal_hazard_score"] < 30.0

    def test_critical_risk_cantilever_undercut_and_pisolite_scarp(self) -> None:
        res = calculate_laterite_duricrust(
            pisolite_gravel_depth_mm=65.0,
            scarp_slope_angle_deg=44.0,
            saprolite_undercut_span_m=4.8,
            surface_rock_temp_c=64.0,
            convective_storm_proximity_km=3.5,
        )
        assert res["risk_level"] == "critical"
        assert res["pisolite_ball_bearing_slip_pct"] >= 75.0
        assert res["cantilever_rim_collapse_probability_pct"] >= 75.0
        assert res["ferruginous_compass_deviation_deg"] >= 8.0
        assert res["mesa_lightning_thermal_hazard_score"] >= 75.0
        assert len(res["warnings"]) >= 3

    def test_parameter_validation_bounds(self) -> None:
        with pytest.raises(ValueError, match="pisolite_gravel_depth_mm"):
            calculate_laterite_duricrust(pisolite_gravel_depth_mm=-1.0)
        with pytest.raises(ValueError, match="pisolite_gravel_depth_mm"):
            calculate_laterite_duricrust(pisolite_gravel_depth_mm=90.0)

        with pytest.raises(ValueError, match="scarp_slope_angle_deg"):
            calculate_laterite_duricrust(scarp_slope_angle_deg=3.0)
        with pytest.raises(ValueError, match="scarp_slope_angle_deg"):
            calculate_laterite_duricrust(scarp_slope_angle_deg=60.0)

        with pytest.raises(ValueError, match="saprolite_undercut_span_m"):
            calculate_laterite_duricrust(saprolite_undercut_span_m=-0.2)
        with pytest.raises(ValueError, match="saprolite_undercut_span_m"):
            calculate_laterite_duricrust(saprolite_undercut_span_m=7.0)

        with pytest.raises(ValueError, match="surface_rock_temp_c"):
            calculate_laterite_duricrust(surface_rock_temp_c=15.0)
        with pytest.raises(ValueError, match="surface_rock_temp_c"):
            calculate_laterite_duricrust(surface_rock_temp_c=80.0)

        with pytest.raises(ValueError, match="convective_storm_proximity_km"):
            calculate_laterite_duricrust(convective_storm_proximity_km=0.5)
        with pytest.raises(ValueError, match="convective_storm_proximity_km"):
            calculate_laterite_duricrust(convective_storm_proximity_km=65.0)


class TestGearChecklistAndIntentDetection:
    """Validate gear checklist, intent detection, and cross-domain disambiguation."""

    def test_gear_checklist_has_six_essential_items(self) -> None:
        gear = get_gear_checklist()
        assert len(gear) == 6
        assert gear == LATERITE_DURICRUST_GEAR_CHECKLIST
        names = " ".join(item["item"].lower() for item in gear)
        assert "pisolite" in names or "gaiter" in names or "lug" in names
        assert "gnomon" in names or "sun-compass" in names or "gyro" in names

    @pytest.mark.parametrize(
        "query",
        [
            "How do I cross loose pisolitic buckshot gravel on a laterite duricrust breakaway scarp?",
            "Planning a bushwhack across Fouta Djallon ferricrete bowal cuirasse in Guinea",
            "Compass deviation and canga hematite mesa hazards at Serra dos Carajás",
            "Avoiding saprolite cavern undercut collapse on Mitchell Plateau bauxite breakaway rim",
            "Trekking Kaas Plateau and Panchgani Deccan laterite tableland rim in Maharashtra",
        ],
    )
    def test_detects_laterite_duricrust_queries(self, query: str) -> None:
        assert is_laterite_duricrust_query(query) is True
        assert detect_laterite_duricrust_intent(query) is True

    @pytest.mark.parametrize(
        "non_laterite_query",
        [
            "Roraima tepui quartzite sinkhole navigation in Venezuela",
            "Tsingy de Bemaraha razor limestone karst pinnacle traverse",
            "Volcanic scree running and talus glissade boot skiing",
            "Magnetic declination adjustment for standard forest orienteering",
            "Desert sand dune erg navigation and hydration calculation",
            "Gold panning in alluvial placer gravel bars with a sluice box",
            "Cave pearl pisolith speleothem crystallography in limestone caverns",
        ],
    )
    def test_rejects_adjacent_domain_queries(self, non_laterite_query: str) -> None:
        assert is_laterite_duricrust_query(non_laterite_query) is False
        assert detect_laterite_duricrust_intent(non_laterite_query) is False

    def test_extract_params_and_format_response(self) -> None:
        query = (
            "Assess Serra dos Carajás canga mesa with 42 mm pisolite gravel, "
            "36 deg scarp slope, 3.2 m saprolite undercut, 58 C rock temp, and storm 6 km away"
        )
        params = extract_laterite_duricrust_params(query)
        assert params["pisolite_gravel_depth_mm"] == 42.0
        assert params["scarp_slope_angle_deg"] == 36.0
        assert params["saprolite_undercut_span_m"] == 3.2
        assert params["surface_rock_temp_c"] == 58.0
        assert params["convective_storm_proximity_km"] == 6.0

        info = format_laterite_duricrust_response(query)
        assert info["matched_site"]["id"] == "serra-dos-carajas-canga-para-brazil"
        assert info["calculation"]["risk_level"] in {"high", "critical"}
        assert "Serra dos Carajás" in info["summary"]

        prompt = build_laterite_duricrust_prompt(info)
        assert "Tropical Laterite Duricrust" in prompt
        assert "Serra dos Carajás" in prompt

        chat_res = get_chat_response(query)
        assert "answer" in chat_res
        assert "laterite_duricrust_info" in chat_res

        events = list(generate_stream_events(query))
        assert any(e.get("event") == "laterite_duricrust_info" for e in events)

    def test_cross_domain_disambiguation_guards(self) -> None:
        from contoso_chat.bamboo_thicket import detect_bamboo_thicket_intent
        from contoso_chat.bushcraft import detect_bushcraft_intent
        from contoso_chat.desert_trekking import detect_desert_trekking_intent
        from contoso_chat.gold_prospecting import detect_gold_prospecting_intent
        from contoso_chat.krummholz_bushwhack import detect_krummholz_bushwhack_intent
        from contoso_chat.mountain_weather import detect_mountain_weather_intent
        from contoso_chat.orienteering import detect_orienteering_intent
        from contoso_chat.scree_running import detect_scree_running_intent
        from contoso_chat.tepui_navigation import detect_tepui_navigation_intent
        from contoso_chat.tiankeng_descent import detect_tiankeng_descent_intent
        from contoso_chat.tsingy_labyrinth import detect_tsingy_labyrinth_intent

        queries = [
            "How do I cross loose pisolitic buckshot gravel on a laterite duricrust breakaway scarp?",
            "Compass deviation and canga hematite mesa hazards at Serra dos Carajás in Brazil",
            "Avoiding saprolite cavern undercut collapse on Fouta Djallon ferricrete bowal in Guinea",
        ]
        for q in queries:
            assert detect_laterite_duricrust_intent(q) is True
            assert not detect_scree_running_intent(q)
            assert not detect_orienteering_intent(q)
            assert not detect_tepui_navigation_intent(q)
            assert not detect_tsingy_labyrinth_intent(q)
            assert not detect_desert_trekking_intent(q)
            assert not detect_bamboo_thicket_intent(q)
            assert not detect_krummholz_bushwhack_intent(q)
            assert not detect_bushcraft_intent(q)
            assert not detect_mountain_weather_intent(q)
            assert not detect_tiankeng_descent_intent(q)
            assert not detect_gold_prospecting_intent(q)

