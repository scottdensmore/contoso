import pytest
from contoso_chat.glacier_navigation import (
    CrevasseNavigationRequest,
    CrevasseNavigationResponse,
    FormattedGlacierResponse,
    GlacierGearRequirement,
    GlacierIntent,
    GlacierZoneModel,
    build_glacier_prompt,
    calculate_crevasse_navigation,
    detect_glacier_intent,
    extract_glacier_intent,
    format_glacier_response,
    get_glacier_gear,
    get_glacier_zone_by_id,
    get_glacier_zones,
)

# -----------------------------------------------------------------------------
# Pydantic Model Tests
# -----------------------------------------------------------------------------


def test_glacier_zone_model():
    zone = GlacierZoneModel(
        zone_id="test-zone",
        title="Test Icefall",
        glacier_system="Test Glacier",
        region="Test Range",
        elevation_m=4000,
        hazard_level="high",
        crevasse_pattern="transverse",
        ladder_sections_required=True,
        typical_crossing_hours=5.0,
        description="A challenging test icefall.",
        route_highlights=["Serac hazard", "Ladder crossing"],
    )
    assert zone.zone_id == "test-zone"
    assert zone.title == "Test Icefall"
    assert zone.elevation_m == 4000
    assert zone.hazard_level == "high"
    assert zone.ladder_sections_required is True
    assert len(zone.route_highlights) == 2


def test_crevasse_navigation_request_defaults():
    req = CrevasseNavigationRequest()
    assert req.zone_id == "khumbu-icefall-everest"
    assert req.team_size == 3
    assert req.snow_bridge_depth_m == 1.2
    assert req.crevasse_width_m == 2.0
    assert req.ambient_temp_f == 24.0
    assert req.rope_interval_m == 12.0


def test_crevasse_navigation_response_model():
    resp = CrevasseNavigationResponse(
        zone_id="khumbu-icefall-everest",
        zone_title="Khumbu Icefall Lower Maze",
        span_to_depth_ratio=0.6,
        recommended_interval_m=12,
        interval_status="optimal",
        safety_status="safe_crossing",
        thermal_stability="Firm refrozen crust and solid firn matrix; minimal melting risk.",
        route_recommendation="Proceed with standard crevasse crossing precautions.",
        rescue_reserve_length_m=36,
    )
    assert resp.zone_id == "khumbu-icefall-everest"
    assert resp.span_to_depth_ratio == 0.6
    assert resp.recommended_interval_m == 12
    assert resp.interval_status == "optimal"
    assert resp.safety_status == "safe_crossing"
    assert resp.rescue_reserve_length_m == 36


def test_glacier_gear_model():
    gear = GlacierGearRequirement(
        item_id="test-item",
        name="Test Probe",
        category="probing",
        mandatory=True,
        purpose="Depth verification",
    )
    assert gear.item_id == "test-item"
    assert gear.mandatory is True


# -----------------------------------------------------------------------------
# Catalog Tests (5 Iconic Glacier Zones)
# -----------------------------------------------------------------------------


def test_glacier_zones_catalog():
    zones = get_glacier_zones()
    assert len(zones) == 5
    zone_ids = [z.zone_id for z in zones]
    assert "khumbu-icefall-everest" in zone_ids
    assert "ingraham-glacier-rainier" in zone_ids
    assert "mer-de-glace-geant" in zone_ids
    assert "root-glacier-st-elias" in zone_ids
    assert "tasman-glacier-icefall" in zone_ids


def test_get_glacier_zones_filtering():
    extreme = get_glacier_zones(hazard="extreme")
    assert len(extreme) == 1
    assert extreme[0].zone_id == "khumbu-icefall-everest"

    high = get_glacier_zones(hazard="high")
    assert len(high) == 2
    high_ids = [z.zone_id for z in high]
    assert "ingraham-glacier-rainier" in high_ids
    assert "tasman-glacier-icefall" in high_ids

    mod = get_glacier_zones(hazard="moderate")
    assert len(mod) == 1
    assert mod[0].zone_id == "mer-de-glace-geant"

    low = get_glacier_zones(hazard="low")
    assert len(low) == 1
    assert low[0].zone_id == "root-glacier-st-elias"


def test_get_glacier_zone_by_id():
    khumbu = get_glacier_zone_by_id("khumbu-icefall-everest")
    assert khumbu is not None
    assert khumbu.title == "Khumbu Icefall Lower Maze"
    assert khumbu.glacier_system == "Khumbu Glacier"
    assert khumbu.elevation_m == 5350
    assert khumbu.hazard_level == "extreme"
    assert khumbu.crevasse_pattern == "icefall_chaos"
    assert khumbu.ladder_sections_required is True
    assert khumbu.typical_crossing_hours == 6.5
    assert "Active serac collapse corridors" in khumbu.route_highlights

    # Case insensitivity
    assert get_glacier_zone_by_id("KHUMBU-ICEFALL-EVEREST") is not None
    assert get_glacier_zone_by_id("non-existent-glacier") is None


# -----------------------------------------------------------------------------
# Gear Checklist Tests (6 Items)
# -----------------------------------------------------------------------------


def test_glacier_gear_checklist():
    gear = get_glacier_gear()
    assert len(gear) == 6
    assert all(item.mandatory for item in gear)
    item_ids = [item.item_id for item in gear]
    assert "avalanche-crevasse-probe" in item_ids
    assert "crevasse-rescue-pulley-kit" in item_ids
    assert "dynamic-dry-glacier-rope" in item_ids
    assert "forged-steel-crampons" in item_ids
    assert "technical-ice-axe" in item_ids
    assert "bivy-hypothermia-wrap" in item_ids

    categories = {item.category for item in gear}
    assert {"probing", "rescue", "rigging", "traction", "anchoring", "survival"}.issubset(
        categories
    )


# -----------------------------------------------------------------------------
# Calculation Logic Tests
# -----------------------------------------------------------------------------


def test_calculation_optimal_crossing():
    req = CrevasseNavigationRequest(
        zone_id="khumbu-icefall-everest",
        team_size=3,
        snow_bridge_depth_m=1.2,
        crevasse_width_m=2.0,
        ambient_temp_f=24.0,
        rope_interval_m=12.0,
    )
    res = calculate_crevasse_navigation(req)
    assert res.zone_id == "khumbu-icefall-everest"
    assert res.zone_title == "Khumbu Icefall Lower Maze"
    # span_to_depth_ratio = 1.2 / 2.0 = 0.6
    assert res.span_to_depth_ratio == 0.6
    assert res.recommended_interval_m == 12
    assert res.interval_status == "optimal"
    assert res.safety_status == "safe_crossing"
    assert "Firm refrozen crust" in res.thermal_stability
    # rescue_reserve_length_m = 60 - (2 * 12) = 36
    assert res.rescue_reserve_length_m == 36


def test_calculation_team_intervals():
    # 2-person team
    req_2p_unsafe = CrevasseNavigationRequest(
        team_size=2,
        rope_interval_m=12.0,  # < 14 -> unsafe
    )
    res_2p_unsafe = calculate_crevasse_navigation(req_2p_unsafe)
    assert res_2p_unsafe.recommended_interval_m == 15
    assert res_2p_unsafe.interval_status == "unsafe"
    assert res_2p_unsafe.rescue_reserve_length_m == 60 - 12  # 48

    req_2p_optimal = CrevasseNavigationRequest(
        team_size=2,
        rope_interval_m=15.0,  # >= 14 -> optimal
    )
    res_2p_optimal = calculate_crevasse_navigation(req_2p_optimal)
    assert res_2p_optimal.interval_status == "optimal"

    # 4-person team
    req_4p = CrevasseNavigationRequest(
        team_size=4,
        rope_interval_m=10.0,
    )
    res_4p = calculate_crevasse_navigation(req_4p)
    assert res_4p.recommended_interval_m == 10
    assert res_4p.interval_status == "optimal"
    # reserve = 60 - (3 * 10) = 30
    assert res_4p.rescue_reserve_length_m == 30

    # 3-person team interval bounds
    req_3p_short = CrevasseNavigationRequest(
        team_size=3,
        rope_interval_m=6.0,  # < 8 -> unsafe
    )
    assert calculate_crevasse_navigation(req_3p_short).interval_status == "unsafe"

    req_3p_long = CrevasseNavigationRequest(
        team_size=3,
        rope_interval_m=18.0,  # > 16 -> adequate
    )
    assert calculate_crevasse_navigation(req_3p_long).interval_status in ("adequate", "unsafe")


def test_calculation_safety_and_thermal_statuses():
    # Critical thaw / hazardous bypass
    req_thaw = CrevasseNavigationRequest(
        ambient_temp_f=36.0,  # > 34 -> hazardous_bypass_required
        snow_bridge_depth_m=1.0,
        crevasse_width_m=2.0,  # ratio 0.5
    )
    res_thaw = calculate_crevasse_navigation(req_thaw)
    assert res_thaw.safety_status == "hazardous_bypass_required"
    assert "Critical thermal warming" in res_thaw.thermal_stability

    # Weak bridge depth ratio < 0.33 -> hazardous bypass
    req_weak_bridge = CrevasseNavigationRequest(
        ambient_temp_f=20.0,
        snow_bridge_depth_m=0.5,
        crevasse_width_m=2.0,  # ratio = 0.25 < 0.33
    )
    res_weak_bridge = calculate_crevasse_navigation(req_weak_bridge)
    assert res_weak_bridge.safety_status == "hazardous_bypass_required"

    # Caution: temp between 29 and 34, or ratio between 0.33 and 0.5
    req_caution_temp = CrevasseNavigationRequest(
        ambient_temp_f=30.0,  # >= 29 and <= 32
        snow_bridge_depth_m=1.5,
        crevasse_width_m=2.0,  # ratio 0.75
    )
    res_caution_temp = calculate_crevasse_navigation(req_caution_temp)
    assert res_caution_temp.safety_status == "caution_belayed_crossing_only"
    assert "Near freezing" in res_caution_temp.thermal_stability

    req_caution_ratio = CrevasseNavigationRequest(
        ambient_temp_f=22.0,
        snow_bridge_depth_m=0.8,
        crevasse_width_m=2.0,  # ratio = 0.40 (< 0.5, >= 0.33)
    )
    res_caution_ratio = calculate_crevasse_navigation(req_caution_ratio)
    assert res_caution_ratio.safety_status == "caution_belayed_crossing_only"


def test_calculation_invalid_zone():
    req = CrevasseNavigationRequest(zone_id="unknown-glacier-zone")
    with pytest.raises(ValueError, match="not found"):
        calculate_crevasse_navigation(req)


# -----------------------------------------------------------------------------
# Intent Detection Tests
# -----------------------------------------------------------------------------


def test_detect_glacier_intent():
    # Catalog query
    i1 = detect_glacier_intent("Show me glacier crevasse navigation zones")
    assert i1 is not None
    assert i1.action in ("zones_list", "zones")

    # Hazard filter query
    i2 = detect_glacier_intent("Find glacier icefall routes with extreme hazard")
    assert i2 is not None
    assert i2.hazard == "extreme"

    # Specific zone query
    i3 = detect_glacier_intent("Tell me about Khumbu icefall crevasse maze")
    assert i3 is not None
    assert i3.zone_id == "khumbu-icefall-everest"

    i4 = detect_glacier_intent("How do we navigate Ingraham glacier on Mount Rainier?")
    assert i4 is not None
    assert i4.zone_id == "ingraham-glacier-rainier"

    i5 = detect_glacier_intent("Serac collapse hazard on Mer de Glace")
    assert i5 is not None
    assert i5.zone_id == "mer-de-glace-geant"

    i6 = detect_glacier_intent("Root glacier Kennicott crevasse routefinding")
    assert i6 is not None
    assert i6.zone_id == "root-glacier-st-elias"

    i7 = detect_glacier_intent("Tasman glacier icefall ladder sections")
    assert i7 is not None
    assert i7.zone_id == "tasman-glacier-icefall"

    # Calculation queries
    i8 = detect_glacier_intent(
        "Calculate crevasse navigation rope team intervals and snow bridge depth probing"
    )
    assert i8 is not None
    assert i8.action in ("calculate_navigation", "calculate")

    # Gear query
    i9 = detect_glacier_intent(
        "What is the mandatory crevasse rescue kit and glacier rope checklist?"
    )
    assert i9 is not None
    assert i9.action in ("gear_checklist", "gear")

    # Other hazard levels
    assert detect_glacier_intent("Glacier routes with high hazard").hazard == "high"
    assert detect_glacier_intent("Glacier routes with moderate hazard").hazard == "moderate"
    assert detect_glacier_intent("Glacier routes with low hazard").hazard == "low"
    assert detect_glacier_intent("Tell me about glaciers in general").action == "zones_list"

    # Extract alias test
    assert extract_glacier_intent("Khumbu glacier") is not None

    # Unrelated queries & disambiguation exclusions
    assert detect_glacier_intent("") is None
    assert detect_glacier_intent("Where is my order #12345?") is None
    assert detect_glacier_intent("How do I return my sleeping bag?") is None
    assert (
        detect_glacier_intent("Do I need previous experience for glacier travel on Mount Rainier?")
        is None
    )
    assert (
        detect_glacier_intent(
            "What rope spacing and brake knots for Disappointment Cleaver on Rainier?"
        )
        is None
    )


# -----------------------------------------------------------------------------
# Response Formatting & Prompt Tests
# -----------------------------------------------------------------------------


def test_format_glacier_response():
    intent = GlacierIntent(action="zones_list")
    formatted = format_glacier_response(intent, "List glacier zones")
    assert isinstance(formatted, FormattedGlacierResponse)
    assert isinstance(formatted, str)
    assert "Khumbu Icefall" in formatted
    assert "glacier_info" in formatted
    assert formatted.get("glacier_info")["action"] in ("zones_list", "zones")
    assert formatted["glacier_info"] is not None
    assert "glacier_info" in formatted
    assert list(formatted.keys()) == ["answer", "glacier_info"]
    assert formatted[0] == "C"  # str getitem
    assert 123 not in formatted  # non-string __contains__
    assert len(list(formatted.values())) == 2
    assert len(list(formatted.items())) == 2

    # Calculation formatted response
    calc_intent = GlacierIntent(action="calculate_navigation", zone_id="khumbu-icefall-everest")
    calc_formatted = format_glacier_response(calc_intent, "Calculate crevasse safety")
    assert "Khumbu" in calc_formatted
    assert "glacier_info" in calc_formatted
    info = calc_formatted["glacier_info"]
    assert "calculation" in info or "plan" in info or "navigation" in info

    # Gear checklist formatted response
    gear_intent = GlacierIntent(action="gear_checklist")
    gear_formatted = format_glacier_response(gear_intent, "Crevasse rescue gear")
    assert (
        "avalanche-crevasse-probe" in str(gear_formatted) or "probe" in str(gear_formatted).lower()
    )
    assert "glacier_info" in gear_formatted

    # Zone detail formatted response
    detail_intent = GlacierIntent(action="zone_detail", zone_id="khumbu-icefall-everest")
    detail_formatted = format_glacier_response(detail_intent, "Khumbu icefall beta")
    assert "Khumbu" in detail_formatted
    assert detail_formatted.get("glacier_info")["action"] == "zone_detail"


def test_build_glacier_prompt():
    prompt_focused = build_glacier_prompt(
        GlacierIntent(action="zone_detail", zone_id="khumbu-icefall-everest")
    )
    assert "Khumbu" in prompt_focused
    assert "Glacier Crevasse Navigation" in prompt_focused

    prompt_general = build_glacier_prompt(GlacierIntent(action="zones_list", hazard="extreme"))
    assert "Iconic Icefall Zones" in prompt_general
