"""Unit tests for High-Altitude Alpine Scramble Ridge Crest Scree Running Tooling."""

import pytest
from contoso_chat.canyon_bouldering import detect_canyon_bouldering_intent
from contoso_chat.chat import handle_scree_running_intent
from contoso_chat.climbing import detect_climbing_intent
from contoso_chat.mountaineering import detect_mountaineering_intent
from contoso_chat.scree_running import (
    DescentGaitTechnique,
    FormattedScreeRunningResponse,
    RockfallExposureTier,
    ScreeGradingClass,
    ScreeRunningGearItem,
    ScreeRunningIntent,
    ScreeRunningQuery,
    ScreeRunningResult,
    ScreeRunningSite,
    ScreeSafetyStatus,
    build_scree_running_prompt,
    calculate_scree_running_dynamics,
    detect_scree_running_intent,
    extract_scree_running_intent,
    format_scree_running_response,
    get_scree_running_gear,
    get_scree_running_site,
    get_scree_running_sites,
    scree_running_tool,
)
from contoso_chat.trail_running import detect_trail_running_intent


# -----------------------------------------------------------------------------
# 1. Enums Tests
# -----------------------------------------------------------------------------
def test_scree_grading_class_values():
    assert ScreeGradingClass.FINE_SHALE_PEA_SCREE.value == "fine_shale_pea_scree"
    assert (
        ScreeGradingClass.MEDIUM_SLATE_GRAVEL_SCREE.value
        == "medium_slate_gravel_scree"
    )
    assert (
        ScreeGradingClass.COARSE_ANGULAR_TALUS_RUBBLE.value
        == "coarse_angular_talus_rubble"
    )
    assert (
        ScreeGradingClass.UNCONSOLIDATED_MORAINE_SCREE.value
        == "unconsolidated_moraine_scree"
    )
    assert (
        ScreeGradingClass.HARDPAN_EMBEDDED_SCREE_SHEET.value
        == "hardpan_embedded_scree_sheet"
    )


def test_descent_gait_technique_values():
    assert (
        DescentGaitTechnique.HEEL_PLUNGE_SLIDING_GLIDE.value
        == "heel_plunge_sliding_glide"
    )
    assert (
        DescentGaitTechnique.RAPID_CADENCE_HOP_BRAKING.value
        == "rapid_cadence_hop_braking"
    )
    assert (
        DescentGaitTechnique.SIDEWAYS_EDGING_SKATE.value == "sideways_edging_skate"
    )
    assert (
        DescentGaitTechnique.POLE_STABILIZED_QUAD_BRAKING.value
        == "pole_stabilized_quad_braking"
    )


def test_rockfall_exposure_tier_values():
    assert (
        RockfallExposureTier.LOW_ISOLATED_SCREE_FAN.value
        == "low_isolated_scree_fan"
    )
    assert (
        RockfallExposureTier.MODERATE_LATERAL_CHUTE_DRIFT.value
        == "moderate_lateral_chute_drift"
    )
    assert (
        RockfallExposureTier.SEVERE_OVERHEAD_COULOIR_FUNNEL.value
        == "severe_overhead_couloir_funnel"
    )
    assert (
        RockfallExposureTier.CRITICAL_SPONTANEOUS_SCARP_SHED.value
        == "critical_spontaneous_scarp_shed"
    )


def test_scree_safety_status_values():
    assert (
        ScreeSafetyStatus.OPTIMAL_GLIDING_CONDITIONS.value
        == "optimal_gliding_conditions"
    )
    assert ScreeSafetyStatus.ELEVATED_ANKLE_HAZARD.value == "elevated_ankle_hazard"
    assert (
        ScreeSafetyStatus.SEVERE_ROCKFALL_WARNING.value == "severe_rockfall_warning"
    )


# -----------------------------------------------------------------------------
# 2. Pydantic Models & Aliases Tests
# -----------------------------------------------------------------------------
def test_scree_running_site_aliases():
    data = {
        "siteId": "test-scree-site",
        "title": "Test Scree Slope",
        "region": "San Juan Mountains, Colorado",
        "range": "San Juan Mountains",
        "elevationMeters": 4315.0,
        "dominantGrading": "fine_shale_pea_scree",
        "defaultGait": "heel_plunge_sliding_glide",
        "rockfallExposure": "moderate_lateral_chute_drift",
        "description": "A premier alpine pea-scree descent chute.",
        "highlights": ["Deep pea gravel cushion", "600m vertical glide"],
    }
    site = ScreeRunningSite(**data)
    assert site.id == "test-scree-site"
    assert site.site_id == "test-scree-site"
    assert site.siteId == "test-scree-site"
    assert site.title == "Test Scree Slope"
    assert site.name == "Test Scree Slope"
    assert site.elevation_meters == 4315.0
    assert site.elevationMeters == 4315.0
    assert site.dominant_grading == "fine_shale_pea_scree"
    assert site.dominantGrading == "fine_shale_pea_scree"
    assert site.default_gait == "heel_plunge_sliding_glide"
    assert site.defaultGait == "heel_plunge_sliding_glide"
    assert site.rockfall_exposure == "moderate_lateral_chute_drift"
    assert site.rockfallExposure == "moderate_lateral_chute_drift"


def test_scree_running_query_aliases():
    data = {
        "siteId": "mount-sneffels-south-slopes",
        "screeGrading": "fine_shale_pea_scree",
        "descentGait": "heel_plunge_sliding_glide",
        "slopeAngleDegrees": 34.0,
        "descentVerticalMeters": 450.0,
        "runnerWeightKg": 74.0,
        "screeDepthCm": 22.0,
    }
    query = ScreeRunningQuery(**data)
    assert query.site_id == "mount-sneffels-south-slopes"
    assert query.siteId == "mount-sneffels-south-slopes"
    assert query.scree_grading == "fine_shale_pea_scree"
    assert query.screeGrading == "fine_shale_pea_scree"
    assert query.descent_gait == "heel_plunge_sliding_glide"
    assert query.descentGait == "heel_plunge_sliding_glide"
    assert query.slope_angle_degrees == 34.0
    assert query.slopeAngleDegrees == 34.0
    assert query.descent_vertical_meters == 450.0
    assert query.descentVerticalMeters == 450.0
    assert query.runner_weight_kg == 74.0
    assert query.runnerWeightKg == 74.0
    assert query.scree_depth_cm == 22.0
    assert query.screeDepthCm == 22.0


def test_scree_running_result_aliases():
    data = {
        "siteTitle": "Mount Sneffels South Slopes Scree Chute",
        "siteId": "mount-sneffels-south-slopes",
        "descentVelocityKmh": 12.4,
        "ankleImpactForceKn": 1.85,
        "slideArrestDistanceMeters": 3.2,
        "screeRunDurationMinutes": 18,
        "safetyStatus": "optimal_gliding_conditions",
        "brakingTechniqueAdvisory": "Engage deep heel-plunge gliding",
        "gaiterAndProtectionProtocol": "Seal high-cuff gaiters tightly",
    }
    res = ScreeRunningResult(**data)
    assert res.site_title == "Mount Sneffels South Slopes Scree Chute"
    assert res.siteTitle == "Mount Sneffels South Slopes Scree Chute"
    assert res.site_id == "mount-sneffels-south-slopes"
    assert res.siteId == "mount-sneffels-south-slopes"
    assert res.descent_velocity_kmh == 12.4
    assert res.descentVelocityKmh == 12.4
    assert res.ankle_impact_force_kn == 1.85
    assert res.ankleImpactForceKn == 1.85
    assert res.slide_arrest_distance_meters == 3.2
    assert res.slideArrestDistanceMeters == 3.2
    assert res.scree_run_duration_minutes == 18
    assert res.screeRunDurationMinutes == 18
    assert res.safety_status == "optimal_gliding_conditions"
    assert res.safetyStatus == "optimal_gliding_conditions"
    assert "heel-plunge" in res.brakingTechniqueAdvisory
    assert "gaiters" in res.gaiterAndProtectionProtocol


def test_scree_running_gear_item_aliases():
    item = ScreeRunningGearItem(
        itemId="scree-running-high-cuff-dust-gaiters",
        name="High-Cuff Cordura Scree & Dust Gaiters",
        category="footwear_protection",
        mandatory=True,
        purpose="Prevents abrasive shale gravel and volcanic cinder from entering shoe collars.",
    )
    assert item.id == "scree-running-high-cuff-dust-gaiters"
    assert item.item_id == "scree-running-high-cuff-dust-gaiters"
    assert item.itemId == "scree-running-high-cuff-dust-gaiters"
    assert "shale gravel" in item.description
    assert "shale gravel" in item.purpose


# -----------------------------------------------------------------------------
# 3. Catalog and Gear Tests
# -----------------------------------------------------------------------------
def test_catalog_sites_length_and_content():
    sites = get_scree_running_sites()
    assert len(sites) == 5
    ids = [s.id for s in sites]
    assert "mount-sneffels-south-slopes" in ids
    assert "mount-stephen-fossil-talus" in ids
    assert "great-gable-wastwater-screes" in ids
    assert "mount-teide-volcanic-cinder-scree" in ids
    assert "mount-nelson-scree-corridor" in ids


def test_catalog_sites_filtering():
    filtered = get_scree_running_sites(grading="fine_shale_pea_scree")
    assert len(filtered) >= 1
    assert all(s.dominant_grading == "fine_shale_pea_scree" for s in filtered)

    filtered_none = get_scree_running_sites(grading="nonexistent_grading")
    assert len(filtered_none) == 0


def test_get_scree_running_site():
    site = get_scree_running_site("mount-sneffels-south-slopes")
    assert site is not None
    assert "Mount Sneffels" in site.title
    assert site.elevation_meters > 4000.0

    missing = get_scree_running_site("invalid-scree-site")
    assert missing is None


def test_get_scree_running_gear():
    gear = get_scree_running_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    gear_ids = [g.id for g in gear]
    assert "scree-running-high-cuff-dust-gaiters" in gear_ids
    assert "reinforced-toe-talus-running-shoes" in gear_ids
    assert "ultra-light-climbing-helmet-en12492" in gear_ids
    assert "carbon-z-pole-folding-trekking-poles" in gear_ids
    assert "leather-palm-abrasion-scramble-gloves" in gear_ids
    assert "high-wrap-ballistic-sunglasses" in gear_ids


# -----------------------------------------------------------------------------
# 4. Calculation Dynamics Tests
# -----------------------------------------------------------------------------
def test_calculate_scree_running_dynamics_nominal():
    q = ScreeRunningQuery(
        site_id="mount-sneffels-south-slopes",
        scree_grading="fine_shale_pea_scree",
        descent_gait="heel_plunge_sliding_glide",
        slope_angle_degrees=32.0,
        descent_vertical_meters=400.0,
        runner_weight_kg=70.0,
        scree_depth_cm=25.0,
    )
    res = calculate_scree_running_dynamics(q)
    assert "Mount Sneffels" in res.site_title
    assert res.site_id == "mount-sneffels-south-slopes"
    assert res.descent_velocity_kmh > 0
    assert res.ankle_impact_force_kn > 0
    assert res.slide_arrest_distance_meters > 0
    assert res.scree_run_duration_minutes > 0
    assert res.safety_status == ScreeSafetyStatus.OPTIMAL_GLIDING_CONDITIONS.value
    assert len(res.braking_technique_advisory) > 0
    assert len(res.gaiter_and_protection_protocol) > 0


def test_calculate_scree_running_dynamics_critical_rockfall():
    q = ScreeRunningQuery(
        site_id="mount-stephen-fossil-talus",
        scree_grading="coarse_angular_talus_rubble",
        descent_gait="rapid_cadence_hop_braking",
        slope_angle_degrees=42.0,
        descent_vertical_meters=650.0,
        runner_weight_kg=90.0,
        scree_depth_cm=5.0,
    )
    res = calculate_scree_running_dynamics(q)
    assert res.safety_status in (
        ScreeSafetyStatus.SEVERE_ROCKFALL_WARNING.value,
        ScreeSafetyStatus.ELEVATED_ANKLE_HAZARD.value,
    )
    assert len(res.braking_technique_advisory) > 10
    assert len(res.gaiter_and_protection_protocol) > 10


def test_calculate_scree_running_dynamics_elevated_ankle_hazard():
    q = ScreeRunningQuery(
        site_id="mount-nelson-scree-corridor",
        scree_grading="hardpan_embedded_scree_sheet",
        descent_gait="sideways_edging_skate",
        slope_angle_degrees=36.0,
        descent_vertical_meters=500.0,
        runner_weight_kg=85.0,
        scree_depth_cm=4.0,
    )
    res = calculate_scree_running_dynamics(q)
    assert res.safety_status in (
        ScreeSafetyStatus.ELEVATED_ANKLE_HAZARD.value,
        ScreeSafetyStatus.SEVERE_ROCKFALL_WARNING.value,
    )


def test_calculate_scree_running_dynamics_invalid_site():
    q = ScreeRunningQuery(site_id="nonexistent-scree-site")
    with pytest.raises(ValueError, match="not found"):
        calculate_scree_running_dynamics(q)


# -----------------------------------------------------------------------------
# 5. Intent Detection & Exclusions Tests
# -----------------------------------------------------------------------------
def test_detect_scree_running_intent_positives():
    positives = [
        "What gear is needed for scree running?",
        "How do I execute a heel plunge scree descent on Mount Sneffels?",
        "Tell me about scree slide dynamics on the Wastwater Screes at Great Gable",
        "Mount Stephen talus run ankle impact force and scree gaiters",
        "Best pea scree and shale scree corridors in the Rockies",
        "Mount Teide volcanic cinder scree running guide",
        "Mount Nelson scree corridor grading and gait",
    ]
    for prompt in positives:
        assert detect_scree_running_intent(prompt) is True, f"Failed on: {prompt}"


def test_detect_scree_running_intent_negatives():
    negatives = [
        "",
        "   ",
        "Where is my order #12345?",
        "I need a refund for my trail running shoes",
        "What is the return label process for scree gaiters?",
        "Can I get shipping tracking for my helmet?",
        "Do you offer rentals for trekking poles?",
    ]
    for prompt in negatives:
        assert detect_scree_running_intent(prompt) is False, f"Failed on: {prompt}"


def test_cross_domain_exclusions_prevent_collisions():
    scree_prompt = "Calculate heel plunge scree running dynamics and ankle impact for a talus run down Mount Sneffels pea scree with scree gaiters"
    assert detect_trail_running_intent(scree_prompt) is None
    assert detect_climbing_intent(scree_prompt) is None
    assert detect_mountaineering_intent(scree_prompt) is None
    assert detect_canyon_bouldering_intent(scree_prompt) is None


# -----------------------------------------------------------------------------
# 6. Intent Extraction Tests
# -----------------------------------------------------------------------------
def test_extract_scree_running_intent():
    # Gear
    intent_gear = extract_scree_running_intent(
        "What scree gaiters and mandatory gear checklist do I need for scree running?"
    )
    assert intent_gear.action == "gear_checklist"

    # Calculate
    intent_calc = extract_scree_running_intent(
        "Calculate scree running descent velocity and ankle impact force on Mount Sneffels"
    )
    assert intent_calc.action == "calculate"
    assert intent_calc.site_id == "mount-sneffels-south-slopes"

    # Get Site
    intent_site = extract_scree_running_intent(
        "Tell me about details of the Wastwater Screes at Great Gable"
    )
    assert intent_site.action == "get_site"
    assert intent_site.site_id == "great-gable-wastwater-screes"

    # Catalog
    intent_catalog = extract_scree_running_intent(
        "List all scree running sites and pea scree chutes"
    )
    assert intent_catalog.action == "catalog"


# -----------------------------------------------------------------------------
# 7. Formatted Response Tests
# -----------------------------------------------------------------------------
def test_format_scree_running_response():
    # Catalog
    res_cat = format_scree_running_response("catalog")
    assert isinstance(res_cat, FormattedScreeRunningResponse)
    assert "scree_running_info" in res_cat
    assert res_cat["scree_running_info"]["action"] == "catalog"
    assert len(res_cat["scree_running_info"]["sites"]) == 5

    # Gear
    res_gear = format_scree_running_response("gear_checklist")
    assert res_gear["scree_running_info"]["action"] == "gear_checklist"
    assert res_gear["scree_running_info"]["mandatory_count"] == 6

    # Get Site
    res_site = format_scree_running_response(
        "get_site", "great-gable-wastwater-screes"
    )
    assert res_site["scree_running_info"]["action"] == "get_site"
    assert (
        res_site["scree_running_info"]["site_id"]
        == "great-gable-wastwater-screes"
    )

    # Calculate
    res_calc = format_scree_running_response(
        "calculate",
        ScreeRunningQuery(site_id="mount-sneffels-south-slopes"),
    )
    assert res_calc["scree_running_info"]["action"] == "calculate"
    assert "descent_velocity_kmh" in res_calc["scree_running_info"]
    assert "ankle_impact_force_kn" in res_calc["scree_running_info"]


# -----------------------------------------------------------------------------
# 8. Prompt Builder & Assistant Tool Tests
# -----------------------------------------------------------------------------
def test_build_scree_running_prompt():
    prompt = build_scree_running_prompt("mount-sneffels-south-slopes")
    assert "Scree Running" in prompt
    assert "Mount Sneffels" in prompt

    site = get_scree_running_site("mount-sneffels-south-slopes")
    res = calculate_scree_running_dynamics(
        ScreeRunningQuery(site_id="mount-sneffels-south-slopes")
    )
    gear = get_scree_running_gear()
    intent = ScreeRunningIntent(
        action="calculate", site_id="mount-sneffels-south-slopes"
    )
    prompt_full = build_scree_running_prompt(intent, site, res, gear)
    assert "Mount Sneffels" in prompt_full
    assert str(res.descent_velocity_kmh) in prompt_full


def test_scree_running_tool():
    # Catalog
    res_cat = scree_running_tool(action="catalog")
    assert "scree_running_info" in res_cat
    assert res_cat["scree_running_info"]["action"] == "catalog"

    # Gear
    res_gear = scree_running_tool(action="gear")
    assert res_gear["scree_running_info"]["action"] == "gear_checklist"

    # Site
    res_site = scree_running_tool(
        action="get_site", site_id="great-gable-wastwater-screes"
    )
    assert res_site["scree_running_info"]["action"] == "get_site"

    # Calculate
    res_calc = scree_running_tool(
        action="calculate",
        query=ScreeRunningQuery(site_id="mount-sneffels-south-slopes"),
    )
    assert res_calc["scree_running_info"]["action"] == "calculate"


# -----------------------------------------------------------------------------
# 9. Cascade Handler in Chat Module
# -----------------------------------------------------------------------------
def test_handle_scree_running_intent():
    res = handle_scree_running_intent(
        "Tell me about Mount Sneffels scree running gear checklist and scree gaiters"
    )
    assert res is not None
    assert "scree_running_info" in res
    assert "answer" in res

    none_res = handle_scree_running_intent(
        "What is my tracking number for shoes?"
    )
    assert none_res is None
