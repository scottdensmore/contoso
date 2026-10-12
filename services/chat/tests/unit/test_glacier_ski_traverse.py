"""Unit tests for Alpine Crevasse Glacier Ski-Traverse & Serac Zone Descent Logistics Tooling."""

import pytest
from contoso_chat.chat import handle_glacier_ski_traverse_intent
from contoso_chat.crevasse_pulk import detect_crevasse_pulk_intent
from contoso_chat.cryokarst_speleology import detect_cryokarst_speleology_intent
from contoso_chat.glacier_navigation import detect_glacier_intent
from contoso_chat.glacier_ski_traverse import (
    FormattedGlacierSkiTraverseResponse,
    GlacierSkiTraverseGearItem,
    GlacierSkiTraverseQuery,
    GlacierSkiTraverseResult,
    GlacierSkiTraverseSite,
    GlacierTerrainZone,
    RopeTravelProtocol,
    SnowpackBridgeStability,
    TraverseHazardLevel,
    build_glacier_ski_traverse_prompt,
    calculate_glacier_ski_traverse_dynamics,
    detect_glacier_ski_traverse_intent,
    extract_glacier_ski_traverse_intent,
    format_glacier_ski_traverse_response,
    get_glacier_ski_traverse_gear,
    get_glacier_ski_traverse_site,
    get_glacier_ski_traverse_sites,
    glacier_ski_traverse_tool,
)
from contoso_chat.ski_touring import detect_ski_tour_intent
from contoso_chat.steep_skiing import detect_steep_skiing_intent


# -----------------------------------------------------------------------------
# 1. Enums Tests
# -----------------------------------------------------------------------------
def test_glacier_terrain_zone_values():
    assert (
        GlacierTerrainZone.UPPER_FIRN_ACCUMULATION_BASIN.value
        == "upper_firn_accumulation_basin"
    )
    assert (
        GlacierTerrainZone.COMPRESSED_ICEFALL_SERAC_CORRIDOR.value
        == "compressed_icefall_serac_corridor"
    )
    assert (
        GlacierTerrainZone.CREVASSE_LATTICE_TRANSITION_ZONE.value
        == "crevasse_lattice_transition_zone"
    )
    assert (
        GlacierTerrainZone.BERGSCHRUND_HEADWALL_CHUTE.value
        == "bergschrund_headwall_chute"
    )
    assert (
        GlacierTerrainZone.SUBGLACIAL_MORAINE_TERMINAL_TONGUE.value
        == "subglacial_moraine_terminal_tongue"
    )


def test_snowpack_bridge_stability_values():
    assert (
        SnowpackBridgeStability.DENSE_WIND_SLAB_BRIDGE.value
        == "dense_wind_slab_bridge"
    )
    assert (
        SnowpackBridgeStability.SETTLED_SPRING_FIRN_BRIDGE.value
        == "settled_spring_firn_bridge"
    )
    assert (
        SnowpackBridgeStability.UNCONSOLIDATED_POWDER_WEAK_BRIDGE.value
        == "unconsolidated_powder_weak_bridge"
    )
    assert (
        SnowpackBridgeStability.HONEYCOMBED_THERMAL_ABLATION_BRIDGE.value
        == "honeycombed_thermal_ablation_bridge"
    )


def test_rope_travel_protocol_values():
    assert (
        RopeTravelProtocol.ROPED_SKI_TANDEM_GLACIER_TRAVERSE.value
        == "roped_ski_tandem_glacier_traverse"
    )
    assert (
        RopeTravelProtocol.SKI_CREVASSE_BRAKE_KNOT_SPREAD.value
        == "ski_crevasse_brake_knot_spread"
    )
    assert (
        RopeTravelProtocol.UNROPED_RAPID_SERAC_HAZARD_SPRINT.value
        == "unroped_rapid_serac_hazard_sprint"
    )
    assert (
        RopeTravelProtocol.GUIDE_BELAYED_COULOIR_SKI_DROP.value
        == "guide_belayed_couloir_ski_drop"
    )


def test_traverse_hazard_level_values():
    assert (
        TraverseHazardLevel.LOW_COLD_STABLE_ACCUMULATION.value
        == "low_cold_stable_accumulation"
    )
    assert (
        TraverseHazardLevel.MODERATE_SEASONAL_BRIDGE_SOFTENING.value
        == "moderate_seasonal_bridge_softening"
    )
    assert (
        TraverseHazardLevel.SEVERE_SERAC_TOPPLING_EXPOSURE.value
        == "severe_serac_toppling_exposure"
    )
    assert (
        TraverseHazardLevel.EXTREME_DYNAMIC_ICEFALL_COLLAPSE.value
        == "extreme_dynamic_icefall_collapse"
    )


# -----------------------------------------------------------------------------
# 2. Pydantic Models & Aliases Tests
# -----------------------------------------------------------------------------
def test_glacier_ski_traverse_site_aliases():
    data = {
        "siteId": "test-traverse",
        "title": "Test Glacier Traverse",
        "region": "Alps",
        "range": "Mont Blanc",
        "elevationMeters": 3500.0,
        "dominantZone": "crevasse_lattice_transition_zone",
        "bridgeStability": "settled_spring_firn_bridge",
        "defaultProtocol": "roped_ski_tandem_glacier_traverse",
        "description": "A testing glacier traverse",
        "highlights": ["Technical icefall", "Deep crevasse field"],
    }
    site = GlacierSkiTraverseSite(**data)
    assert site.id == "test-traverse"
    assert site.site_id == "test-traverse"
    assert site.siteId == "test-traverse"
    assert site.title == "Test Glacier Traverse"
    assert site.name == "Test Glacier Traverse"
    assert site.elevation_meters == 3500.0
    assert site.elevationMeters == 3500.0
    assert site.dominant_zone == "crevasse_lattice_transition_zone"
    assert site.dominantZone == "crevasse_lattice_transition_zone"
    assert site.bridge_stability == "settled_spring_firn_bridge"
    assert site.bridgeStability == "settled_spring_firn_bridge"
    assert site.default_protocol == "roped_ski_tandem_glacier_traverse"
    assert site.defaultProtocol == "roped_ski_tandem_glacier_traverse"


def test_glacier_ski_traverse_query_aliases():
    data = {
        "siteId": "haute-route-chamonix-zermatt",
        "terrainZone": "crevasse_lattice_transition_zone",
        "bridgeStability": "settled_spring_firn_bridge",
        "travelersCount": 4,
        "packWeightKg": 16.5,
        "skiWidthWaistMm": 98.0,
        "slopeAngleDegrees": 30.0,
        "ambientTemperatureC": -5.0,
    }
    query = GlacierSkiTraverseQuery(**data)
    assert query.site_id == "haute-route-chamonix-zermatt"
    assert query.siteId == "haute-route-chamonix-zermatt"
    assert query.terrain_zone == "crevasse_lattice_transition_zone"
    assert query.terrainZone == "crevasse_lattice_transition_zone"
    assert query.bridge_stability == "settled_spring_firn_bridge"
    assert query.bridgeStability == "settled_spring_firn_bridge"
    assert query.travelers_count == 4
    assert query.travelersCount == 4
    assert query.pack_weight_kg == 16.5
    assert query.packWeightKg == 16.5
    assert query.ski_width_waist_mm == 98.0
    assert query.skiWidthWaistMm == 98.0
    assert query.slope_angle_degrees == 30.0
    assert query.slopeAngleDegrees == 30.0
    assert query.ambient_temperature_c == -5.0
    assert query.ambientTemperatureC == -5.0


def test_glacier_ski_traverse_result_aliases():
    data = {
        "siteTitle": "Classic Haute Route Glacier Ski-Traverse",
        "siteId": "haute-route-chamonix-zermatt",
        "bridgeGroundPressureKpa": 6.8,
        "crevasseBridgeFailureRisk": 0.32,
        "seracCorridorExposureTimeMinutes": 45,
        "recommendedRopeSpacingMeters": 18,
        "hazardLevel": "moderate_seasonal_bridge_softening",
        "ropeTravelAdvisory": "Maintain constant tension on rope",
        "emergencySkiRescueProtocol": "Standard 3:1 Z-Drag",
    }
    res = GlacierSkiTraverseResult(**data)
    assert res.site_title == "Classic Haute Route Glacier Ski-Traverse"
    assert res.siteTitle == "Classic Haute Route Glacier Ski-Traverse"
    assert res.site_id == "haute-route-chamonix-zermatt"
    assert res.siteId == "haute-route-chamonix-zermatt"
    assert res.bridge_ground_pressure_kpa == 6.8
    assert res.bridgeGroundPressureKpa == 6.8
    assert res.crevasse_bridge_failure_risk == 0.32
    assert res.crevasseBridgeFailureRisk == 0.32
    assert res.serac_corridor_exposure_time_minutes == 45
    assert res.seracCorridorExposureTimeMinutes == 45
    assert res.recommended_rope_spacing_meters == 18
    assert res.recommendedRopeSpacingMeters == 18
    assert res.hazard_level == "moderate_seasonal_bridge_softening"
    assert res.hazardLevel == "moderate_seasonal_bridge_softening"
    assert "Maintain constant tension" in res.ropeTravelAdvisory
    assert "Standard 3:1 Z-Drag" in res.emergencySkiRescueProtocol


def test_glacier_ski_traverse_gear_item_aliases():
    item = GlacierSkiTraverseGearItem(
        itemId="glacier-skimo-harness-with-ski-slots",
        name="Ultralight Skimo Harness",
        category="harness_rigging",
        mandatory=True,
        purpose="Donning harness without stepping out of skis",
    )
    assert item.id == "glacier-skimo-harness-with-ski-slots"
    assert item.item_id == "glacier-skimo-harness-with-ski-slots"
    assert item.itemId == "glacier-skimo-harness-with-ski-slots"
    assert item.description == "Donning harness without stepping out of skis"
    assert item.purpose == "Donning harness without stepping out of skis"


# -----------------------------------------------------------------------------
# 3. Catalog and Gear Tests
# -----------------------------------------------------------------------------
def test_catalog_sites_length_and_content():
    sites = get_glacier_ski_traverse_sites()
    assert len(sites) == 5
    ids = [s.id for s in sites]
    assert "haute-route-chamonix-zermatt" in ids
    assert "spearhead-traverse-whistler" in ids
    assert "wapta-traverse-canadian-rockies" in ids
    assert "berner-oberland-ski-traverse" in ids
    assert "wrangell-st-elias-bagley-icefield" in ids


def test_catalog_sites_filtering():
    filtered = get_glacier_ski_traverse_sites(
        zone="compressed_icefall_serac_corridor"
    )
    assert len(filtered) == 1
    assert filtered[0].id == "berner-oberland-ski-traverse"

    filtered_none = get_glacier_ski_traverse_sites(zone="nonexistent_zone")
    assert len(filtered_none) == 0


def test_get_glacier_ski_traverse_site():
    site = get_glacier_ski_traverse_site("haute-route-chamonix-zermatt")
    assert site is not None
    assert "Haute Route" in site.title
    assert site.elevation_meters == 3790.0

    missing = get_glacier_ski_traverse_site("invalid-glacier-site")
    assert missing is None


def test_get_glacier_ski_traverse_gear():
    gear = get_glacier_ski_traverse_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    gear_ids = [g.id for g in gear]
    assert "glacier-skimo-harness-with-ski-slots" in gear_ids
    assert "lightweight-hyperstatic-crevasse-rescue-cord" in gear_ids
    assert "ultra-compact-ski-crevasse-pulley-progress-capture" in gear_ids
    assert "titanium-tech-ski-crampons-ski-mountaineering" in gear_ids
    assert "ski-tail-anchor-snow-picket-system" in gear_ids
    assert "collapsible-avalanche-crevasse-probe-320cm" in gear_ids


# -----------------------------------------------------------------------------
# 4. Calculation Dynamics Tests
# -----------------------------------------------------------------------------
def test_calculate_glacier_ski_traverse_dynamics_nominal():
    q = GlacierSkiTraverseQuery(
        site_id="haute-route-chamonix-zermatt",
        pack_weight_kg=12.0,
        ski_width_waist_mm=95.0,
        slope_angle_degrees=24.0,
        ambient_temperature_c=-3.0,
        travelers_count=3,
    )
    res = calculate_glacier_ski_traverse_dynamics(q)
    assert res.site_title == "Classic Haute Route Glacier Ski-Traverse (Chamonix to Zermatt)"
    assert res.site_id == "haute-route-chamonix-zermatt"
    assert 3.5 <= res.bridge_ground_pressure_kpa <= 18.0
    assert 0.0 <= res.crevasse_bridge_failure_risk <= 1.0
    assert 5 <= res.serac_corridor_exposure_time_minutes <= 120
    assert 10 <= res.recommended_rope_spacing_meters <= 25
    assert len(res.rope_travel_advisory) > 0
    assert len(res.emergency_ski_rescue_protocol) > 0


def test_calculate_glacier_ski_traverse_dynamics_critical_collapse():
    q = GlacierSkiTraverseQuery(
        site_id="berner-oberland-ski-traverse",
        terrain_zone="compressed_icefall_serac_corridor",
        bridge_stability="honeycombed_thermal_ablation_bridge",
        pack_weight_kg=35.0,
        ski_width_waist_mm=75.0,
        slope_angle_degrees=48.0,
        ambient_temperature_c=6.0,
        travelers_count=6,
    )
    res = calculate_glacier_ski_traverse_dynamics(q)
    assert res.hazard_level == "extreme_dynamic_icefall_collapse"
    assert "Emergency Drop-Loop 6:1 Pulley System" in res.emergency_ski_rescue_protocol


def test_calculate_glacier_ski_traverse_dynamics_invalid_site():
    q = GlacierSkiTraverseQuery(site_id="nonexistent-icefield")
    with pytest.raises(ValueError, match="not found"):
        calculate_glacier_ski_traverse_dynamics(q)


# -----------------------------------------------------------------------------
# 5. Intent Detection & Exclusions Tests
# -----------------------------------------------------------------------------
def test_detect_glacier_ski_traverse_intent_positives():
    positives = [
        "What gear is needed for a glacier ski traverse?",
        "Planning the Haute Route Chamonix to Zermatt ski-traverse next April",
        "How do we safely navigate the serac zone and icefall descent on the Bernese Oberland?",
        "Tell me about crevasse bridge stability on the Wapta traverse",
        "Spearhead traverse bergschrund headwall chute route info",
        "Bagley icefield subarctic glacier ski expedition logistics",
    ]
    for prompt in positives:
        assert detect_glacier_ski_traverse_intent(prompt) is True, f"Failed on: {prompt}"


def test_detect_glacier_ski_traverse_intent_negatives():
    negatives = [
        "",
        "   ",
        "Where is my order #12345?",
        "I need a refund for my waterproof jacket",
        "What is the return label process?",
    ]
    for prompt in negatives:
        assert detect_glacier_ski_traverse_intent(prompt) is False, f"Failed on: {prompt}"


def test_cross_domain_exclusions_prevent_collisions():
    traverse_prompt = "Tell me about crevasse bridge stability and serac zone descent on the Haute Route glacier ski traverse"
    assert detect_ski_tour_intent(traverse_prompt) is None
    assert detect_glacier_intent(traverse_prompt) is None
    assert detect_steep_skiing_intent(traverse_prompt).intent_detected is False
    assert detect_crevasse_pulk_intent(traverse_prompt) is False
    assert detect_cryokarst_speleology_intent(traverse_prompt) is False


# -----------------------------------------------------------------------------
# 6. Intent Extraction Tests
# -----------------------------------------------------------------------------
def test_extract_glacier_ski_traverse_intent():
    # Gear
    intent_gear = extract_glacier_ski_traverse_intent("What gear and checklist do I need for glacier ski traverse?")
    assert intent_gear.action == "gear_checklist"

    # Calculate
    intent_calc = extract_glacier_ski_traverse_intent("Calculate crevasse bridge ground pressure and serac exposure for Haute Route")
    assert intent_calc.action == "calculate"
    assert intent_calc.site_id == "haute-route-chamonix-zermatt"

    # Get Site
    intent_site = extract_glacier_ski_traverse_intent("Tell me about details of the Spearhead traverse")
    assert intent_site.action == "get_site"
    assert intent_site.site_id == "spearhead-traverse-whistler"

    # Catalog
    intent_catalog = extract_glacier_ski_traverse_intent("List all glacier ski traverse sites")
    assert intent_catalog.action == "catalog"


# -----------------------------------------------------------------------------
# 7. Formatted Response Tests
# -----------------------------------------------------------------------------
def test_format_glacier_ski_traverse_response():
    # Catalog
    res_cat = format_glacier_ski_traverse_response("catalog")
    assert isinstance(res_cat, FormattedGlacierSkiTraverseResponse)
    assert "glacier_ski_traverse_info" in res_cat
    assert res_cat["glacier_ski_traverse_info"]["action"] == "catalog"
    assert len(res_cat["glacier_ski_traverse_info"]["sites"]) == 5

    # Gear
    res_gear = format_glacier_ski_traverse_response("gear_checklist")
    assert res_gear["glacier_ski_traverse_info"]["action"] == "gear_checklist"
    assert res_gear["glacier_ski_traverse_info"]["mandatory_count"] == 6

    # Get Site
    res_site = format_glacier_ski_traverse_response("get_site", "spearhead-traverse-whistler")
    assert res_site["glacier_ski_traverse_info"]["action"] == "get_site"
    assert res_site["glacier_ski_traverse_info"]["site_id"] == "spearhead-traverse-whistler"

    # Calculate
    res_calc = format_glacier_ski_traverse_response(
        "calculate",
        GlacierSkiTraverseQuery(site_id="haute-route-chamonix-zermatt"),
    )
    assert res_calc["glacier_ski_traverse_info"]["action"] == "calculate"
    assert "bridge_ground_pressure_kpa" in res_calc["glacier_ski_traverse_info"]


# -----------------------------------------------------------------------------
# 8. Prompt Builder & Assistant Tool Tests
# -----------------------------------------------------------------------------
def test_build_glacier_ski_traverse_prompt():
    prompt = build_glacier_ski_traverse_prompt("haute-route-chamonix-zermatt")
    assert "Alpine Crevasse Glacier Ski-Traverse & Serac Zone Descent Logistics Guidance" in prompt
    assert "Classic Haute Route" in prompt


def test_glacier_ski_traverse_tool():
    # Catalog
    res_cat = glacier_ski_traverse_tool(action="catalog")
    assert "glacier_ski_traverse_info" in res_cat
    assert res_cat["glacier_ski_traverse_info"]["action"] == "catalog"

    # Gear
    res_gear = glacier_ski_traverse_tool(action="gear")
    assert res_gear["glacier_ski_traverse_info"]["action"] == "gear_checklist"

    # Site
    res_site = glacier_ski_traverse_tool(action="get_site", site_id="spearhead-traverse-whistler")
    assert res_site["glacier_ski_traverse_info"]["action"] == "get_site"

    # Calculate
    res_calc = glacier_ski_traverse_tool(
        action="calculate",
        query=GlacierSkiTraverseQuery(site_id="haute-route-chamonix-zermatt"),
    )
    assert res_calc["glacier_ski_traverse_info"]["action"] == "calculate"


# -----------------------------------------------------------------------------
# 9. Cascade Handler in Chat Module
# -----------------------------------------------------------------------------
def test_handle_glacier_ski_traverse_intent():
    res = handle_glacier_ski_traverse_intent("Tell me about the Haute Route glacier ski traverse gear checklist")
    assert res is not None
    assert "glacier_ski_traverse_info" in res
    assert "answer" in res

    none_res = handle_glacier_ski_traverse_intent("What is my tracking number for shoes?")
    assert none_res is None
