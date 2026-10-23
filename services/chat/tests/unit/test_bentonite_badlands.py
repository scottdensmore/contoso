"""Unit tests for the Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation Guide module."""

from __future__ import annotations

import pytest
from contoso_chat.bentonite_badlands import (
    BENTONITE_BADLANDS_GEAR_CHECKLIST,
    BENTONITE_BADLANDS_SITES,
    BENTONITE_SITES,
    BentoniteBadlandsInput,
    BentoniteBadlandsResult,
    BentoniteBadlandsSite,
    BentoniteGearItem,
    BentoniteMorphology,
    BentoniteRiskLevel,
    SmectiteSwellingGrade,
    build_bentonite_badlands_prompt,
    calculate_bentonite_badlands,
    detect_bentonite_badlands_intent,
    extract_bentonite_badlands_params,
    filter_bentonite_badlands_sites,
    filter_sites,
    format_bentonite_badlands_response,
    generate_stream_events,
    get_all_sites,
    get_bentonite_badlands_gear_checklist,
    get_bentonite_badlands_site_by_id,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    is_bentonite_badlands_query,
)


class TestBentoniteBadlandsCatalog:
    """Validate the arid badlands bentonite popcorn-clay & piping-tunnel sinkhole catalog."""

    def test_catalog_has_four_sites(self) -> None:
        assert len(BENTONITE_BADLANDS_SITES) == 4
        assert BENTONITE_SITES is BENTONITE_BADLANDS_SITES
        all_sites = get_all_sites()
        assert len(all_sites) == 4

    def test_expected_site_ids_present(self) -> None:
        ids = {site["id"] for site in BENTONITE_BADLANDS_SITES}
        assert ids == {
            "badlands-sage-creek-chadron-south-dakota",
            "cainville-factory-butte-mancos-shale-utah",
            "dinosaur-red-deer-bearpaw-badlands-alberta-canada",
            "bardenas-reales-pisquerra-piping-navarra-spain",
        }

    def test_get_site_by_id(self) -> None:
        site = get_bentonite_badlands_site_by_id("badlands-sage-creek-chadron-south-dakota")
        assert site is not None
        assert site["country"] == "USA"
        assert site["morphology"] == BentoniteMorphology.POPCORN_CRUST_MOUND.value
        assert site["swelling_grade"] == SmectiteSwellingGrade.HIGH_SODIUM_BENTONITE.value
        assert site["difficulty"] == "challenging"

        alias_site = get_site_by_id("bardenas-reales-pisquerra-piping-navarra-spain")
        assert alias_site is not None
        assert alias_site["country"] == "Spain"

        missing = get_bentonite_badlands_site_by_id("nonexistent-bentonite-badlands-site")
        assert missing is None

    def test_site_attribute_access_and_required_fields(self) -> None:
        required_keys = {
            "id",
            "name",
            "country",
            "region",
            "morphology",
            "swelling_grade",
            "deposit_type",
            "substrate_type",
            "lithology",
            "difficulty",
            "elevation_range",
            "max_elevation_m",
            "default_smectite_free_swell_index_pct",
            "default_popcorn_crust_thickness_cm",
            "default_piping_roof_thickness_cm",
            "default_rainfall_intensity_mm_hr",
            "default_slope_angle_deg",
            "default_sodium_adsorption_ratio_sar",
            "default_hiker_load_kg",
            "primary_hazard",
            "navigation_strategy",
            "crossing_strategy",
            "piping_avoidance_protocol",
            "gumbo_traction_protocol",
            "conservation_protocol",
            "field_notes",
        }
        for site in BENTONITE_BADLANDS_SITES:
            assert isinstance(site, BentoniteBadlandsSite)
            assert required_keys.issubset(site.keys())
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.morphology == site["morphology"]
            assert site.swelling_grade == site["swelling_grade"]
            assert site.difficulty in {"moderate", "challenging", "extreme"}
            dumped = site.model_dump()
            assert dumped["id"] == site["id"]

    def test_filter_sites_by_country_and_region(self) -> None:
        usa = filter_bentonite_badlands_sites(country="USA")
        assert len(usa) == 2

        utah = filter_bentonite_badlands_sites(region="Utah")
        assert len(utah) == 1
        assert utah[0]["id"] == "cainville-factory-butte-mancos-shale-utah"

        canada = filter_sites(country="canada")
        assert len(canada) == 1
        assert canada[0]["id"] == "dinosaur-red-deer-bearpaw-badlands-alberta-canada"

        spain = filter_bentonite_badlands_sites(country="Spain")
        assert len(spain) == 1
        assert spain[0]["id"] == "bardenas-reales-pisquerra-piping-navarra-spain"

    def test_filter_sites_by_morphology_swelling_grade_and_difficulty(self) -> None:
        popcorn = filter_bentonite_badlands_sites(
            morphology=BentoniteMorphology.POPCORN_CRUST_MOUND.value
        )
        assert len(popcorn) == 1
        assert popcorn[0]["id"] == "badlands-sage-creek-chadron-south-dakota"

        piping = filter_bentonite_badlands_sites(
            morphology=BentoniteMorphology.PIPING_TUNNEL_BRIDGE.value
        )
        assert len(piping) == 1
        assert piping[0]["id"] == "dinosaur-red-deer-bearpaw-badlands-alberta-canada"

        swelling = filter_bentonite_badlands_sites(
            swelling_grade=SmectiteSwellingGrade.MODERATE_MONTMORILLONITE.value
        )
        assert len(swelling) == 1
        assert swelling[0]["id"] == "bardenas-reales-pisquerra-piping-navarra-spain"

        challenging = filter_bentonite_badlands_sites(difficulty="challenging")
        assert len(challenging) == 2

        extreme = filter_bentonite_badlands_sites(difficulty="extreme")
        assert len(extreme) == 2

    def test_filter_sites_by_search(self) -> None:
        cainville = filter_bentonite_badlands_sites(search="Cainville")
        assert len(cainville) == 1
        assert cainville[0]["id"] == "cainville-factory-butte-mancos-shale-utah"

        pisquerra = filter_bentonite_badlands_sites(search="Pisquerra")
        assert len(pisquerra) == 1
        assert pisquerra[0]["id"] == "bardenas-reales-pisquerra-piping-navarra-spain"


class TestCalculateBentoniteBadlands:
    """Validate deterministic physics and geotechnical calculations for bentonite badlands."""

    def test_default_parameters_return_expected_structure(self) -> None:
        result = calculate_bentonite_badlands()
        assert isinstance(result, BentoniteBadlandsResult)
        expected_keys = {
            "smectite_free_swell_index_pct",
            "popcorn_crust_thickness_cm",
            "piping_roof_thickness_cm",
            "rainfall_intensity_mm_hr",
            "slope_angle_deg",
            "sodium_adsorption_ratio_sar",
            "hiker_load_kg",
            "piping_roof_punch_through_risk_pct",
            "wet_gumbo_traction_loss_pct",
            "boot_mud_accretion_kg",
            "safe_pipe_bridge_setback_m",
            "effective_crust_bearing_kpa",
            "risk_level",
            "safety_status",
            "navigation_strategy",
            "crossing_strategy",
            "piping_avoidance_protocol",
            "gumbo_traction_protocol",
            "warnings",
            "recommendations",
        }
        assert expected_keys.issubset(result.keys())
        assert result["risk_level"] in {
            BentoniteRiskLevel.LOW.value,
            BentoniteRiskLevel.MODERATE.value,
            BentoniteRiskLevel.HIGH.value,
            BentoniteRiskLevel.CRITICAL.value,
        }
        assert isinstance(result["warnings"], list)
        assert isinstance(result["recommendations"], list)

    def test_accepts_bentonite_badlands_input_object(self) -> None:
        inp = BentoniteBadlandsInput(
            smectite_free_swell_index_pct=280.0,
            popcorn_crust_thickness_cm=16.0,
            piping_roof_thickness_cm=22.0,
            rainfall_intensity_mm_hr=24.0,
            slope_angle_deg=34.0,
            sodium_adsorption_ratio_sar=26.0,
            hiker_load_kg=88.0,
        )
        res = calculate_bentonite_badlands(inp)
        assert res.smectite_free_swell_index_pct == 280.0
        assert res.risk_level in {"high", "critical"}

    def test_low_risk_desiccated_low_angle_badlands(self) -> None:
        res = calculate_bentonite_badlands(
            smectite_free_swell_index_pct=55.0,
            popcorn_crust_thickness_cm=4.0,
            piping_roof_thickness_cm=125.0,
            rainfall_intensity_mm_hr=0.0,
            slope_angle_deg=8.0,
            sodium_adsorption_ratio_sar=4.0,
            hiker_load_kg=65.0,
            morphology=BentoniteMorphology.POPCORN_CRUST_MOUND.value,
            swelling_grade=SmectiteSwellingGrade.LOW_CALCIUM_SMECTITE.value,
        )
        assert res["risk_level"] == "low"
        assert res["piping_roof_punch_through_risk_pct"] < 28.0
        assert res["wet_gumbo_traction_loss_pct"] < 30.0
        assert res["boot_mud_accretion_kg"] < 0.5
        assert res["safe_pipe_bridge_setback_m"] < 6.0

    def test_critical_risk_saturated_sodium_bentonite_storm(self) -> None:
        res = calculate_bentonite_badlands(
            smectite_free_swell_index_pct=420.0,
            popcorn_crust_thickness_cm=22.0,
            piping_roof_thickness_cm=14.0,
            rainfall_intensity_mm_hr=45.0,
            slope_angle_deg=44.0,
            sodium_adsorption_ratio_sar=38.0,
            hiker_load_kg=95.0,
            morphology=BentoniteMorphology.PIPING_TUNNEL_BRIDGE.value,
            swelling_grade=SmectiteSwellingGrade.EXTREME_THIXOTROPIC_GUMBO.value,
        )
        assert res["risk_level"] == "critical"
        assert res["piping_roof_punch_through_risk_pct"] >= 72.0
        assert res["wet_gumbo_traction_loss_pct"] >= 75.0
        assert res["boot_mud_accretion_kg"] >= 3.0
        assert res["safe_pipe_bridge_setback_m"] >= 14.0
        assert len(res["warnings"]) >= 3

    def test_parameter_validation_bounds(self) -> None:
        with pytest.raises(ValueError, match="smectite_free_swell_index_pct"):
            calculate_bentonite_badlands(smectite_free_swell_index_pct=10.0)
        with pytest.raises(ValueError, match="smectite_free_swell_index_pct"):
            calculate_bentonite_badlands(smectite_free_swell_index_pct=850.0)

        with pytest.raises(ValueError, match="popcorn_crust_thickness_cm"):
            calculate_bentonite_badlands(popcorn_crust_thickness_cm=0.2)
        with pytest.raises(ValueError, match="popcorn_crust_thickness_cm"):
            calculate_bentonite_badlands(popcorn_crust_thickness_cm=45.0)

        with pytest.raises(ValueError, match="piping_roof_thickness_cm"):
            calculate_bentonite_badlands(piping_roof_thickness_cm=2.0)
        with pytest.raises(ValueError, match="piping_roof_thickness_cm"):
            calculate_bentonite_badlands(piping_roof_thickness_cm=170.0)

        with pytest.raises(ValueError, match="rainfall_intensity_mm_hr"):
            calculate_bentonite_badlands(rainfall_intensity_mm_hr=-2.0)
        with pytest.raises(ValueError, match="rainfall_intensity_mm_hr"):
            calculate_bentonite_badlands(rainfall_intensity_mm_hr=135.0)

        with pytest.raises(ValueError, match="slope_angle_deg"):
            calculate_bentonite_badlands(slope_angle_deg=1.0)
        with pytest.raises(ValueError, match="slope_angle_deg"):
            calculate_bentonite_badlands(slope_angle_deg=70.0)

        with pytest.raises(ValueError, match="sodium_adsorption_ratio_sar"):
            calculate_bentonite_badlands(sodium_adsorption_ratio_sar=0.5)
        with pytest.raises(ValueError, match="sodium_adsorption_ratio_sar"):
            calculate_bentonite_badlands(sodium_adsorption_ratio_sar=70.0)

        with pytest.raises(ValueError, match="hiker_load_kg"):
            calculate_bentonite_badlands(hiker_load_kg=25.0)
        with pytest.raises(ValueError, match="hiker_load_kg"):
            calculate_bentonite_badlands(hiker_load_kg=180.0)


class TestGearChecklistAndIntentDetection:
    """Validate gear checklist, intent detection, and cross-domain disambiguation."""

    def test_gear_checklist_has_six_essential_items(self) -> None:
        gear = get_bentonite_badlands_gear_checklist()
        assert len(gear) == 6
        assert gear == BENTONITE_BADLANDS_GEAR_CHECKLIST
        assert get_gear_checklist() == BENTONITE_BADLANDS_GEAR_CHECKLIST
        for item in gear:
            assert isinstance(item, BentoniteGearItem)
            assert item.id == item["id"]
            assert item.mandatory is True
        names = " ".join(item["name"].lower() for item in gear)
        assert "probe" in names
        assert "scraper" in names
        assert "gaiters" in names or "boots" in names

    @pytest.mark.parametrize(
        "query",
        [
            "How do I safely navigate bentonite popcorn-clay mounds and piping-tunnel sinkholes in Sage Creek Chadron Badlands, South Dakota?",
            "Assessing Mancos Shale bentonite domes and gumbo clay boot adhesion near Cainville and Factory Butte in Utah",
            "Trekking Dinosaur Provincial Park Red Deer Bearpaw bentonite badlands and subsurface piping tunnels in Alberta",
            "Navigating Bardenas Reales Rallón and Pisquerra dispersive sodic piping sinkholes in Navarra, Spain",
            "What pipe-bridge setback do I need on a 36 deg badlands slope with 280% free-swell index and 22 cm piping roof thickness?",
        ],
    )
    def test_detects_bentonite_badlands_queries(self, query: str) -> None:
        assert is_bentonite_badlands_query(query) is True
        assert detect_bentonite_badlands_intent(query) is True

    @pytest.mark.parametrize(
        "non_bentonite_query",
        [
            "How do I safely navigate quick-clay marine-terrace ravines in Gauldalen and Rissa near Trondheimsfjord?",
            "Wilderness mudflat trekking and prielen creek wading across Wadden Sea Neuwerk",
            "Crossing Skeiðarársandur braided glacial outwash river and rock-flour quicksand bars",
            "Navigating Dasht-e Lut kalut yardangs and Badain Jaran star-dune slip-faces",
            "Escaping keeper potholes in Choprock Canyon using a Sandtrap ghost anchor and cheater stick",
            "Evaluating slot canyon flash flood wave lag and escape ledges in Buckskin Gulch",
            "Descending Xiaozhai Tiankeng giant karst collapse sinkhole with SRT rebelays",
            "Exploring Optimisticeskaja and Vena del Gesso gypsum-karst dissolution mazes",
            "Trekking Fouta Djallon bowal laterite duricrust and pisolitic buckshot gravel scarps",
        ],
    )
    def test_rejects_adjacent_domain_queries(self, non_bentonite_query: str) -> None:
        assert is_bentonite_badlands_query(non_bentonite_query) is False
        assert detect_bentonite_badlands_intent(non_bentonite_query) is False

    def test_extract_params_and_format_response(self) -> None:
        query = (
            "Assess Dinosaur Provincial Park Bearpaw bentonite badlands in Alberta with "
            "310% free-swell index, 16 cm popcorn crust, 19 cm piping roof thickness, "
            "26 mm/hr rain, 35 deg slope angle, SAR 30, and 90 kg hiker load"
        )
        params = extract_bentonite_badlands_params(query)
        assert params["smectite_free_swell_index_pct"] == 310.0
        assert params["popcorn_crust_thickness_cm"] == 16.0
        assert params["piping_roof_thickness_cm"] == 19.0
        assert params["rainfall_intensity_mm_hr"] == 26.0
        assert params["slope_angle_deg"] == 35.0
        assert params["sodium_adsorption_ratio_sar"] == 30.0
        assert params["hiker_load_kg"] == 90.0

        info = format_bentonite_badlands_response(query)
        assert (
            info["matched_site"]["id"]
            == "dinosaur-red-deer-bearpaw-badlands-alberta-canada"
        )
        assert info["calculation"]["risk_level"] in {"high", "critical"}
        assert "Dinosaur" in info["summary"] or "Bearpaw" in info["summary"]

        prompt = build_bentonite_badlands_prompt(info)
        assert "Bentonite" in prompt or "Popcorn-Clay" in prompt
        assert "Dinosaur" in prompt

        chat_res = get_chat_response(query)
        assert "answer" in chat_res
        assert "bentonite_badlands_info" in chat_res

        events = list(generate_stream_events(query))
        assert any(e.get("event") == "bentonite_badlands_info" for e in events)

    def test_cross_domain_disambiguation_guards(self) -> None:
        from contoso_chat.canyoneering import detect_canyoneering_intent
        from contoso_chat.caving import detect_caving_intent
        from contoso_chat.desert_trekking import detect_desert_trekking_intent
        from contoso_chat.flash_flood_slot import detect_flash_flood_slot_intent
        from contoso_chat.glaciere_caving import detect_glaciere_caving_intent
        from contoso_chat.gypsum_karst import detect_gypsum_karst_intent
        from contoso_chat.laterite_duricrust import detect_laterite_duricrust_intent
        from contoso_chat.mudflat_trekking import detect_mudflat_intent
        from contoso_chat.orienteering import detect_orienteering_intent
        from contoso_chat.pothole_escape import detect_pothole_escape_intent
        from contoso_chat.quick_clay_terrace import detect_quick_clay_terrace_intent
        from contoso_chat.scree_running import detect_scree_running_intent
        from contoso_chat.tiankeng_descent import detect_tiankeng_descent_intent
        from contoso_chat.yardang_navigation import detect_yardang_navigation_intent

        queries = [
            "How do I safely navigate bentonite popcorn-clay mounds and piping-tunnel sinkholes in Sage Creek Chadron Badlands, South Dakota?",
            "Assessing Mancos Shale bentonite domes and gumbo clay boot adhesion near Cainville and Factory Butte in Utah",
            "Trekking Dinosaur Provincial Park Red Deer Bearpaw bentonite badlands and subsurface piping tunnels in Alberta",
            "Navigating Bardenas Reales Pisquerra dispersive sodic piping sinkholes and Castildetierra caprock pedestals in Navarra, Spain",
        ]
        for q in queries:
            assert detect_bentonite_badlands_intent(q) is True
            assert not detect_quick_clay_terrace_intent(q)
            assert not detect_mudflat_intent(q)
            assert not detect_desert_trekking_intent(q)
            assert not detect_flash_flood_slot_intent(q)
            assert not detect_yardang_navigation_intent(q)
            assert not detect_pothole_escape_intent(q)
            assert not detect_canyoneering_intent(q)
            assert not detect_scree_running_intent(q)
            assert not detect_gypsum_karst_intent(q)
            assert not detect_laterite_duricrust_intent(q)
            assert not detect_tiankeng_descent_intent(q)
            assert not detect_caving_intent(q)
            assert not detect_glaciere_caving_intent(q)
            assert not detect_orienteering_intent(q)
