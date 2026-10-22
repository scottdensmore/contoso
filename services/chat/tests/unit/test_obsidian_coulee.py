"""Unit tests for the High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling Guide module."""

from __future__ import annotations

import pytest
from contoso_chat.obsidian_coulee import (
    OBSIDIAN_COULEE_GEAR_CHECKLIST,
    OBSIDIAN_COULEE_SITES,
    OBSIDIAN_SITES,
    ObsidianCouleeSite,
    build_obsidian_coulee_prompt,
    calculate_obsidian_coulee,
    detect_obsidian_coulee_intent,
    extract_obsidian_coulee_params,
    filter_sites,
    format_obsidian_coulee_response,
    generate_stream_events,
    get_all_sites,
    get_chat_response,
    get_gear_checklist,
    get_site_by_id,
    is_obsidian_coulee_query,
)


class TestObsidianCouleeCatalog:
    """Validate the high-altitude volcanic obsidian-flow & glass-block coulee catalog."""

    def test_catalog_has_four_sites(self) -> None:
        assert len(OBSIDIAN_COULEE_SITES) == 4
        assert OBSIDIAN_SITES is OBSIDIAN_COULEE_SITES
        all_sites = get_all_sites()
        assert len(all_sites) == 4

    def test_expected_site_ids_present(self) -> None:
        ids = {site["id"] for site in OBSIDIAN_COULEE_SITES}
        assert ids == {
            "big-obsidian-flow-newberry-caldera-oregon",
            "glass-mountain-medicine-lake-volcano-california",
            "panum-crater-mono-inyo-obsidian-domes-california",
            "hrafntinnusker-torfajokull-obsidian-plateau-iceland",
        }

    def test_get_site_by_id(self) -> None:
        site = get_site_by_id("big-obsidian-flow-newberry-caldera-oregon")
        assert site is not None
        assert site["country"] == "USA"
        assert site["lithology"] == "banded-rhyolite-obsidian-coulee"
        assert site["difficulty"] == "moderate"

        missing = get_site_by_id("nonexistent-obsidian-coulee")
        assert missing is None

    def test_site_attribute_access_and_required_fields(self) -> None:
        required_keys = {
            "id",
            "name",
            "country",
            "region",
            "lithology",
            "coulee_type",
            "morphology",
            "substrate_type",
            "difficulty",
            "elevation_range",
            "max_elevation_m",
            "default_conchoidal_flake_density_pct",
            "default_block_instability_tilt_deg",
            "default_vesicular_pumice_crust_ratio_pct",
            "default_coulee_crest_relief_m",
            "default_scrambler_pack_mass_kg",
            "primary_hazard",
            "scrambling_strategy",
            "crossing_strategy",
            "footwork_protocol",
            "hand_protection_protocol",
            "conservation_protocol",
            "field_notes",
        }
        for site in OBSIDIAN_COULEE_SITES:
            assert isinstance(site, ObsidianCouleeSite)
            assert required_keys.issubset(site.keys())
            assert site.id == site["id"]
            assert site.name == site["name"]
            assert site.lithology == site["lithology"]
            assert site.difficulty in {"moderate", "challenging", "extreme"}

    def test_filter_sites_by_country(self) -> None:
        usa = filter_sites(country="USA")
        assert len(usa) == 3

        iceland = filter_sites(country="iceland")
        assert len(iceland) == 1
        assert iceland[0]["id"] == "hrafntinnusker-torfajokull-obsidian-plateau-iceland"

    def test_filter_sites_by_lithology_and_difficulty(self) -> None:
        pumiceous = filter_sites(lithology="pumiceous-carapace")
        assert len(pumiceous) == 1
        assert pumiceous[0]["id"] == "glass-mountain-medicine-lake-volcano-california"

        vitrophyre = filter_sites(lithology="vitrophyre-block-rubble-lobe")
        assert len(vitrophyre) == 1
        assert vitrophyre[0]["id"] == "hrafntinnusker-torfajokull-obsidian-plateau-iceland"

        challenging = filter_sites(difficulty="challenging")
        assert len(challenging) == 2

        extreme = filter_sites(difficulty="extreme")
        assert len(extreme) == 1
        assert extreme[0]["id"] == "glass-mountain-medicine-lake-volcano-california"

    def test_filter_sites_by_search(self) -> None:
        newberry = filter_sites(search="Newberry")
        assert len(newberry) == 1
        assert newberry[0]["id"] == "big-obsidian-flow-newberry-caldera-oregon"

        panum = filter_sites(search="Panum")
        assert len(panum) == 1
        assert panum[0]["id"] == "panum-crater-mono-inyo-obsidian-domes-california"


class TestCalculateObsidianCoulee:
    """Validate deterministic physics and safety calculations for obsidian-flow coulee scrambling."""

    def test_default_parameters_return_expected_structure(self) -> None:
        result = calculate_obsidian_coulee()
        expected_keys = {
            "conchoidal_flake_density_pct",
            "block_instability_tilt_deg",
            "vesicular_pumice_crust_ratio_pct",
            "coulee_crest_relief_m",
            "scrambler_pack_mass_kg",
            "surgical_laceration_severity_score",
            "vesicular_crust_collapse_probability_pct",
            "block_teeter_pinch_hazard_pct",
            "boot_lug_shred_rate_mm_per_km",
            "risk_level",
            "safety_status",
            "scrambling_strategy",
            "crossing_strategy",
            "warnings",
            "recommendations",
        }
        assert expected_keys.issubset(result.keys())
        assert result["risk_level"] in {"low", "moderate", "high", "critical"}
        assert isinstance(result["warnings"], list)
        assert isinstance(result["recommendations"], list)

    def test_low_risk_consolidated_obsidian_bench(self) -> None:
        res = calculate_obsidian_coulee(
            conchoidal_flake_density_pct=12.0,
            block_instability_tilt_deg=5.0,
            vesicular_pumice_crust_ratio_pct=10.0,
            coulee_crest_relief_m=12.0,
            scrambler_pack_mass_kg=8.0,
        )
        assert res["risk_level"] == "low"
        assert res["surgical_laceration_severity_score"] < 28.0
        assert res["vesicular_crust_collapse_probability_pct"] < 25.0
        assert res["block_teeter_pinch_hazard_pct"] < 25.0
        assert res["boot_lug_shred_rate_mm_per_km"] < 1.2

    def test_critical_risk_glass_mountain_pressure_spine(self) -> None:
        res = calculate_obsidian_coulee(
            conchoidal_flake_density_pct=92.0,
            block_instability_tilt_deg=41.0,
            vesicular_pumice_crust_ratio_pct=82.0,
            coulee_crest_relief_m=115.0,
            scrambler_pack_mass_kg=34.0,
        )
        assert res["risk_level"] == "critical"
        assert res["surgical_laceration_severity_score"] >= 75.0
        assert res["vesicular_crust_collapse_probability_pct"] >= 70.0
        assert res["block_teeter_pinch_hazard_pct"] >= 70.0
        assert res["boot_lug_shred_rate_mm_per_km"] >= 2.2
        assert len(res["warnings"]) >= 3

    def test_parameter_validation_bounds(self) -> None:
        with pytest.raises(ValueError, match="conchoidal_flake_density_pct"):
            calculate_obsidian_coulee(conchoidal_flake_density_pct=2.0)
        with pytest.raises(ValueError, match="conchoidal_flake_density_pct"):
            calculate_obsidian_coulee(conchoidal_flake_density_pct=105.0)

        with pytest.raises(ValueError, match="block_instability_tilt_deg"):
            calculate_obsidian_coulee(block_instability_tilt_deg=1.0)
        with pytest.raises(ValueError, match="block_instability_tilt_deg"):
            calculate_obsidian_coulee(block_instability_tilt_deg=52.0)

        with pytest.raises(ValueError, match="vesicular_pumice_crust_ratio_pct"):
            calculate_obsidian_coulee(vesicular_pumice_crust_ratio_pct=3.0)
        with pytest.raises(ValueError, match="vesicular_pumice_crust_ratio_pct"):
            calculate_obsidian_coulee(vesicular_pumice_crust_ratio_pct=98.0)

        with pytest.raises(ValueError, match="coulee_crest_relief_m"):
            calculate_obsidian_coulee(coulee_crest_relief_m=2.0)
        with pytest.raises(ValueError, match="coulee_crest_relief_m"):
            calculate_obsidian_coulee(coulee_crest_relief_m=150.0)

        with pytest.raises(ValueError, match="scrambler_pack_mass_kg"):
            calculate_obsidian_coulee(scrambler_pack_mass_kg=2.0)
        with pytest.raises(ValueError, match="scrambler_pack_mass_kg"):
            calculate_obsidian_coulee(scrambler_pack_mass_kg=50.0)


class TestGearChecklistAndIntentDetection:
    """Validate gear checklist, intent detection, and cross-domain disambiguation."""

    def test_gear_checklist_has_six_essential_items(self) -> None:
        gear = get_gear_checklist()
        assert len(gear) == 6
        assert gear == OBSIDIAN_COULEE_GEAR_CHECKLIST
        names = " ".join(item["item"].lower() for item in gear)
        assert "kevlar" in names or "aramid" in names or "glove" in names
        assert "vibram" in names or "lug" in names or "boot" in names

    @pytest.mark.parametrize(
        "query",
        [
            "How do I scramble across the Big Obsidian Flow coulee at Newberry Caldera in Oregon?",
            "Assessing conchoidal fracture glass laceration and pumiceous crust collapse on Glass Mountain Medicine Lake",
            "Scrambling Panum Crater obsidian dome pressure-spine coulee near Mono Lake",
            "Traversing Hrafntinnusker vitrophyre obsidian ridge in Torfajökull Iceland",
            "What Kevlar gloves and boot lug protection do I need for volcanic glass coulee scrambling?",
        ],
    )
    def test_detects_obsidian_coulee_queries(self, query: str) -> None:
        assert is_obsidian_coulee_query(query) is True
        assert detect_obsidian_coulee_intent(query) is True

    @pytest.mark.parametrize(
        "non_obsidian_query",
        [
            "How do we descend the volcanic tephra and scoria scree apron on Mount Yasur?",
            "Mount Tarawera basaltic scoria scree and vesicular pumice scree descent protocol",
            "Tsingy de Bemaraha razor limestone karst pinnacle traverse in Madagascar",
            "Volcanic scree running and talus glissade boot skiing on Mount Sneffels",
            "Solfatara fumarole gas and boiling mud pot crust navigation at Kverkfjöll",
            "Lava tube biospeleology and root curtain troglobites in Kazumura Cave",
            "Subalpine boulder-talus cold-trap ice cave navigation in Mahoosuc Notch",
        ],
    )
    def test_rejects_adjacent_domain_queries(self, non_obsidian_query: str) -> None:
        assert is_obsidian_coulee_query(non_obsidian_query) is False
        assert detect_obsidian_coulee_intent(non_obsidian_query) is False

    def test_extract_params_and_format_response(self) -> None:
        query = (
            "Assess Glass Mountain obsidian coulee at Medicine Lake with 84% conchoidal flake density, "
            "36 deg block tilt, 68% vesicular pumice crust, 85 m coulee crest relief, and 24 kg pack"
        )
        params = extract_obsidian_coulee_params(query)
        assert params["conchoidal_flake_density_pct"] == 84.0
        assert params["block_instability_tilt_deg"] == 36.0
        assert params["vesicular_pumice_crust_ratio_pct"] == 68.0
        assert params["coulee_crest_relief_m"] == 85.0
        assert params["scrambler_pack_mass_kg"] == 24.0

        info = format_obsidian_coulee_response(query)
        assert info["matched_site"]["id"] == "glass-mountain-medicine-lake-volcano-california"
        assert info["calculation"]["risk_level"] in {"high", "critical"}
        assert "Glass Mountain" in info["summary"]

        prompt = build_obsidian_coulee_prompt(info)
        assert "Obsidian" in prompt
        assert "Glass Mountain" in prompt

        chat_res = get_chat_response(query)
        assert "answer" in chat_res
        assert "obsidian_coulee_info" in chat_res

        events = list(generate_stream_events(query))
        assert any(e.get("event") == "obsidian_coulee_info" for e in events)

    def test_cross_domain_disambiguation_guards(self) -> None:
        from contoso_chat.canyon_bouldering import detect_canyon_bouldering_intent
        from contoso_chat.climbing import detect_climbing_intent
        from contoso_chat.first_aid import detect_first_aid_intent
        from contoso_chat.glaciere_caving import detect_glaciere_caving_intent
        from contoso_chat.lava_tube_biospeleology import detect_lava_tube_biospeleology_intent
        from contoso_chat.mountaineering import detect_mountaineering_intent
        from contoso_chat.rock_glacier_navigation import is_rock_glacier_navigation_query
        from contoso_chat.scree_running import detect_scree_running_intent
        from contoso_chat.solfatara_navigation import is_solfatara_navigation_query
        from contoso_chat.talus_cold_trap import detect_talus_cold_trap_intent
        from contoso_chat.tephra_navigation import is_tephra_navigation_query
        from contoso_chat.tsingy_labyrinth import detect_tsingy_labyrinth_intent

        queries = [
            "How do I scramble across the Big Obsidian Flow coulee at Newberry Caldera in Oregon?",
            "Conchoidal fracture laceration and vesicular pumice crust collapse on Glass Mountain obsidian flow",
            "Traversing Hrafntinnusker vitrophyre obsidian ridge in Torfajökull Iceland",
        ]
        for q in queries:
            assert detect_obsidian_coulee_intent(q) is True
            assert not is_tephra_navigation_query(q)
            assert not detect_scree_running_intent(q)
            assert not detect_tsingy_labyrinth_intent(q)
            assert not is_solfatara_navigation_query(q)
            assert not detect_lava_tube_biospeleology_intent(q)
            assert not detect_glaciere_caving_intent(q)
            assert not detect_canyon_bouldering_intent(q)
            assert not is_rock_glacier_navigation_query(q)
            assert not detect_talus_cold_trap_intent(q)
            assert not detect_climbing_intent(q)
            assert not detect_mountaineering_intent(q)
            assert not detect_first_aid_intent(q)
