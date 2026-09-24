import pytest
from contoso_chat.alpine_scuba import (
    AlpineScubaGearRequirement,
    AlpineScubaIntent,
    AlpineScubaSiteModel,
    FormattedAlpineScubaResponse,
    ScubaCalculationRequest,
    ScubaCalculationResponse,
    build_alpine_scuba_prompt,
    calculate_scuba_decompression,
    detect_alpine_scuba_intent,
    format_alpine_scuba_response,
    get_alpine_scuba_gear,
    get_alpine_scuba_site_by_id,
    get_alpine_scuba_sites,
)

# -----------------------------------------------------------------------------
# Pydantic Model Tests
# -----------------------------------------------------------------------------


def test_alpine_scuba_site_model():
    site = AlpineScubaSiteModel(
        id="test-lake",
        name="Test Alpine Basin",
        location="High Sierras, CA",
        elevation_meters=2100,
        max_depth_meters=45,
        summer_water_temp_c=12.0,
        winter_water_temp_c=3.0,
        typical_visibility_meters=20,
        overhead_condition="partial_ice_ceiling",
        water_type="freshwater_alpine",
        description="Pristine alpine lake for high-altitude scuba exploration.",
        highlights=["Crystalline waters", "Submerged granite monoliths"],
    )
    assert site.id == "test-lake"
    assert site.name == "Test Alpine Basin"
    assert site.elevation_meters == 2100
    assert site.max_depth_meters == 45
    assert site.summer_water_temp_c == 12.0
    assert site.winter_water_temp_c == 3.0
    assert site.typical_visibility_meters == 20
    assert site.overhead_condition == "partial_ice_ceiling"
    assert site.water_type == "freshwater_alpine"
    assert len(site.highlights) == 2


def test_scuba_calculation_request_defaults():
    req = ScubaCalculationRequest()
    assert req.site_id == "lake-tahoe-rubicon-wall"
    assert req.target_depth_meters == 20.0
    assert req.bottom_time_minutes == 25.0
    assert "drysuit" in req.thermal_exposure.lower()
    assert req.water_temp_c is None


def test_scuba_calculation_response_model():
    resp = ScubaCalculationResponse(
        site_name="Rubicon Wall & Emerald Bay",
        atmospheric_pressure_bar=0.80,
        equivalent_sea_level_depth_meters=25.0,
        adjusted_ndl_minutes=18,
        decompression_status="mandatory_decompression_stops",
        regulator_freeze_risk="high",
        min_surface_interval_hours=24.0,
        thermal_protection_advisory="Drysuit mandatory.",
        ice_safety_advisory="Conservative ascent rate required.",
    )
    assert resp.site_name == "Rubicon Wall & Emerald Bay"
    assert resp.atmospheric_pressure_bar == 0.80
    assert resp.equivalent_sea_level_depth_meters == 25.0
    assert resp.adjusted_ndl_minutes == 18
    assert resp.decompression_status == "mandatory_decompression_stops"
    assert resp.regulator_freeze_risk == "high"
    assert resp.min_surface_interval_hours == 24.0
    assert resp.thermal_protection_advisory == "Drysuit mandatory."
    assert resp.ice_safety_advisory == "Conservative ascent rate required."


def test_alpine_scuba_gear_requirement_model():
    gear = AlpineScubaGearRequirement(
        id="test-gear",
        name="Test Cold-Water Regulator",
        category="life_support_breathing",
        mandatory=True,
        description="Environmentally sealed diaphragm system.",
    )
    assert gear.id == "test-gear"
    assert gear.name == "Test Cold-Water Regulator"
    assert gear.category == "life_support_breathing"
    assert gear.mandatory is True
    assert "diaphragm" in gear.description


def test_alpine_scuba_intent_model():
    intent = AlpineScubaIntent(
        intent_detected=True,
        site_id="emerald-lake-rockies",
        action="calculate_scuba",
        confidence=0.95,
    )
    assert intent.intent_detected is True
    assert intent.site_id == "emerald-lake-rockies"
    assert intent.action == "calculate_scuba"
    assert intent.confidence == 0.95
    assert bool(intent) is True

    falsy_intent = AlpineScubaIntent(
        intent_detected=False,
        site_id=None,
        action="",
        confidence=0.0,
    )
    assert bool(falsy_intent) is False


# -----------------------------------------------------------------------------
# Catalog & Gear Tests
# -----------------------------------------------------------------------------


def test_get_alpine_scuba_sites():
    sites = get_alpine_scuba_sites()
    assert len(sites) == 5
    site_ids = [s.id for s in sites]
    assert "lake-tahoe-rubicon-wall" in site_ids
    assert "crater-lake-wizard-island" in site_ids
    assert "emerald-lake-rockies" in site_ids
    assert "lake-ouananiche-chic-chocs" in site_ids
    assert "homestake-reservoir-colorado" in site_ids


def test_get_alpine_scuba_sites_filtering():
    ice_sites = get_alpine_scuba_sites(overhead_condition="solid_ice_sheet_overhead")
    assert len(ice_sites) == 1
    assert ice_sites[0].id == "emerald-lake-rockies"

    volcanic = get_alpine_scuba_sites(water_type="volcanic_crater")
    assert len(volcanic) == 1
    assert volcanic[0].id == "crater-lake-wizard-island"


def test_get_alpine_scuba_site_by_id():
    tahoe = get_alpine_scuba_site_by_id("lake-tahoe-rubicon-wall")
    assert tahoe is not None
    assert tahoe.name == "Rubicon Wall & Emerald Bay"
    assert tahoe.elevation_meters == 1897
    assert tahoe.max_depth_meters == 120

    unknown = get_alpine_scuba_site_by_id("unknown-pond")
    assert unknown is None


def test_get_alpine_scuba_gear():
    gear = get_alpine_scuba_gear()
    assert len(gear) == 6
    assert all(g.mandatory for g in gear)
    gear_ids = [g.id for g in gear]
    assert "environmentally-sealed-coldwater-regulator" in gear_ids
    assert "compressed-neoprene-drysuit" in gear_ids
    assert "harness-ice-tether-carabiner" in gear_ids
    assert "dual-independent-redundant-tanks" in gear_ids
    assert "altitude-decompression-dive-computer" in gear_ids
    assert "chainsaw-ice-trench-clearing-tools" in gear_ids


# -----------------------------------------------------------------------------
# Calculation Engine Tests
# -----------------------------------------------------------------------------


def test_calculate_scuba_lake_tahoe_decompression():
    # Lake Tahoe: elevation 1897m -> Patm = exp(-1897/8434) ~ 0.80 bar
    # 20m depth -> ESLD = 20 / 0.80 = 25.0m
    # Base NDL for 25m = 22 min -> adjusted NDL = round(22 * 0.80) = 18 min
    # Bottom time 25 min > 18 min -> mandatory decompression stops
    req = ScubaCalculationRequest(
        site_id="lake-tahoe-rubicon-wall",
        target_depth_meters=20.0,
        bottom_time_minutes=25.0,
        thermal_exposure="compressed_neoprene_drysuit",
    )
    resp = calculate_scuba_decompression(req)
    assert resp.site_name == "Rubicon Wall & Emerald Bay"
    assert resp.atmospheric_pressure_bar == 0.80
    assert resp.equivalent_sea_level_depth_meters == 25.0
    assert resp.adjusted_ndl_minutes == 18
    assert resp.decompression_status == "mandatory_decompression_stops"
    assert resp.min_surface_interval_hours == 24.0
    assert "ascent rate" in resp.ice_safety_advisory.lower()


def test_calculate_scuba_shallow_within_ndl():
    # 12m depth at Lake Tahoe -> ESLD = 12 / 0.80 = 15.0m
    # Base NDL for 15m = 73 min -> adjusted NDL = round(73 * 0.80) = 58 min
    # Bottom time 20 min < 58 * 0.8 min -> within NDL
    req = ScubaCalculationRequest(
        site_id="lake-tahoe-rubicon-wall",
        target_depth_meters=12.0,
        bottom_time_minutes=20.0,
        thermal_exposure="compressed_neoprene_drysuit",
        water_temp_c=4.5,
    )
    resp = calculate_scuba_decompression(req)
    assert resp.equivalent_sea_level_depth_meters == 15.0
    assert resp.adjusted_ndl_minutes == 58
    assert resp.decompression_status == "within_no_decompression_limit"
    assert resp.min_surface_interval_hours == 12.0


def test_calculate_scuba_homestake_reservoir_extreme_altitude():
    # Homestake Reservoir: elevation 3115m -> Patm = exp(-3115/8434) ~ 0.69 bar
    # 20m depth -> ESLD = 20 / 0.69 = 29.0m
    # Base NDL for 29m = 17 min -> adjusted NDL = round(17 * 0.69) = 12 min
    req = ScubaCalculationRequest(
        site_id="homestake-reservoir-colorado",
        target_depth_meters=20.0,
        bottom_time_minutes=15.0,
    )
    resp = calculate_scuba_decompression(req)
    assert resp.atmospheric_pressure_bar == 0.69
    assert resp.equivalent_sea_level_depth_meters == 29.0
    assert resp.adjusted_ndl_minutes == 12
    assert resp.min_surface_interval_hours == 24.0


def test_calculate_scuba_ice_overhead_environment():
    # Emerald Lake: overhead ice environment
    req = ScubaCalculationRequest(
        site_id="emerald-lake-rockies",
        target_depth_meters=15.0,
        bottom_time_minutes=20.0,
        water_temp_c=1.0,
    )
    resp = calculate_scuba_decompression(req)
    assert resp.regulator_freeze_risk == "high"
    assert "OVERHEAD ICE" in resp.ice_safety_advisory.upper()
    assert "tether" in resp.ice_safety_advisory.lower()


def test_calculate_scuba_unknown_site():
    req = ScubaCalculationRequest(site_id="invalid-site-id")
    with pytest.raises(ValueError, match="not found"):
        calculate_scuba_decompression(req)


# -----------------------------------------------------------------------------
# Intent Detection & Disambiguation Tests
# -----------------------------------------------------------------------------


def test_detect_alpine_scuba_intent_empty():
    intent = detect_alpine_scuba_intent("")
    assert not intent.intent_detected
    assert not bool(intent)


def test_detect_alpine_scuba_intent_disambiguation():
    # General order tracking
    assert not detect_alpine_scuba_intent("Where is my order #98721?").intent_detected
    assert not detect_alpine_scuba_intent("Track my return label and refund").intent_detected

    # Sea kayaking
    assert not detect_alpine_scuba_intent(
        "What is the tide plan for sea kayaking in San Juan Islands?"
    ).intent_detected
    assert not detect_alpine_scuba_intent(
        "Do I need a paddle float and bilge pump for coastal paddling?"
    ).intent_detected

    # Whitewater river running
    assert not detect_alpine_scuba_intent(
        "What are the river flows and cfs rapids for whitewater rafting?"
    ).intent_detected

    # Coasteering / cliff jumping
    assert not detect_alpine_scuba_intent(
        "Can I go coasteering and cliff jumping into deep swell?"
    ).intent_detected


def test_detect_alpine_scuba_intent_positive_queries():
    # Generic altitude diving
    i1 = detect_alpine_scuba_intent("Tell me about high altitude scuba diving in alpine lakes")
    assert i1.intent_detected
    assert i1.action == "sites_list"

    # Specific site detail
    i2 = detect_alpine_scuba_intent(
        "What are the details and visibility at Rubicon Wall in Lake Tahoe scuba?"
    )
    assert i2.intent_detected
    assert i2.site_id == "lake-tahoe-rubicon-wall"
    assert i2.action == "site_detail"

    # Calculation intent
    i3 = detect_alpine_scuba_intent(
        "Calculate ESLD and Buhlmann altitude decompression for 20m dive at Crater Lake"
    )
    assert i3.intent_detected
    assert i3.site_id == "crater-lake-wizard-island"
    assert i3.action == "calculate_scuba"

    # Gear checklist intent
    i4 = detect_alpine_scuba_intent(
        "What mandatory cold water regulator and drysuit gear checklist is required for ice diving?"
    )
    assert i4.intent_detected
    assert i4.action == "gear_checklist"

    # Other sites
    i5 = detect_alpine_scuba_intent(
        "How thick is the ice hole dive at Emerald Lake in the Rockies?"
    )
    assert i5.intent_detected
    assert i5.site_id == "emerald-lake-rockies"

    i6 = detect_alpine_scuba_intent(
        "Is Homestake Reservoir dive at high altitude safe with regulator freeze?"
    )
    assert i6.intent_detected
    assert i6.site_id == "homestake-reservoir-colorado"


# -----------------------------------------------------------------------------
# Prompt Generation & Response Formatting Tests
# -----------------------------------------------------------------------------


def test_build_alpine_scuba_prompt():
    prompt = build_alpine_scuba_prompt("What are the best altitude scuba sites?")
    assert "Alpine Lake Ice Diving" in prompt or "Altitude Scuba" in prompt
    assert "Bühlmann" in prompt or "Buhlmann" in prompt
    assert "ESLD" in prompt
    assert "Lake Tahoe" in prompt or "Rubicon Wall" in prompt


def test_format_alpine_scuba_response_sites_list():
    intent = AlpineScubaIntent(action="sites_list")
    resp = format_alpine_scuba_response(intent)
    assert isinstance(resp, FormattedAlpineScubaResponse)
    assert "sites" in resp.get("alpine_scuba_info", {})
    assert len(resp["alpine_scuba_info"]["sites"]) == 5
    assert "Lake Tahoe" in str(resp)


def test_format_alpine_scuba_response_site_detail():
    intent = AlpineScubaIntent(action="site_detail", site_id="lake-tahoe-rubicon-wall")
    resp = format_alpine_scuba_response(intent)
    assert resp["alpine_scuba_info"]["action"] == "site_detail"
    assert resp["alpine_scuba_info"]["site"]["id"] == "lake-tahoe-rubicon-wall"
    assert "Rubicon Wall" in str(resp)


def test_format_alpine_scuba_response_calculation():
    intent = AlpineScubaIntent(action="calculate_scuba", site_id="crater-lake-wizard-island")
    resp = format_alpine_scuba_response(intent)
    assert resp["alpine_scuba_info"]["action"] == "calculate_scuba"
    assert "calculation" in resp["alpine_scuba_info"]
    assert "ESLD" in str(resp) or "Equivalent Sea Level Depth" in str(resp)


def test_format_alpine_scuba_response_gear():
    intent = AlpineScubaIntent(action="gear_checklist")
    resp = format_alpine_scuba_response(intent)
    assert resp["alpine_scuba_info"]["action"] == "gear_checklist"
    assert len(resp["alpine_scuba_info"]["gear"]) == 6
    assert "regulator" in str(resp).lower()


def test_formatted_alpine_scuba_response_dict_methods():
    resp = FormattedAlpineScubaResponse(
        "test answer",
        {"alpine_scuba_info": {"key": "val"}, "answer": "test answer"},
    )
    assert resp["alpine_scuba_info"] == {"key": "val"}
    assert resp["answer"] == "test answer"
    assert "alpine_scuba_info" in resp
    assert "non_existent" not in resp
    assert 123 not in resp
    assert list(resp.keys()) == ["alpine_scuba_info", "answer"]
    assert len(list(resp.values())) == 2
    assert len(list(resp.items())) == 2


def test_calculate_scuba_near_ndl_and_moderate_temp():
    # 20m at Tahoe -> adjusted NDL = 18 min
    # bottom time = 15 min (15 >= 18 * 0.8 = 14.4) -> near_ndl_caution
    req = ScubaCalculationRequest(
        site_id="lake-tahoe-rubicon-wall",
        target_depth_meters=20.0,
        bottom_time_minutes=15.0,
        water_temp_c=5.5,
    )
    resp = calculate_scuba_decompression(req)
    assert resp.decompression_status == "near_ndl_caution"
    assert resp.min_surface_interval_hours == 18.0
    assert resp.regulator_freeze_risk == "moderate"
    assert "ADVISORY" in resp.thermal_protection_advisory


def test_calculate_scuba_low_freeze_risk_warm_water():
    req = ScubaCalculationRequest(
        site_id="lake-tahoe-rubicon-wall",
        target_depth_meters=10.0,
        bottom_time_minutes=10.0,
        water_temp_c=12.0,
    )
    resp = calculate_scuba_decompression(req)
    assert resp.regulator_freeze_risk == "low"
    assert "STANDARD" in resp.thermal_protection_advisory


def test_calculate_scuba_chic_chocs_cirque():
    req = ScubaCalculationRequest(
        site_id="lake-ouananiche-chic-chocs",
        target_depth_meters=15.0,
        bottom_time_minutes=10.0,
    )
    resp = calculate_scuba_decompression(req)
    assert resp.site_name == "Lac aux Américains Glacial Cirque"
    assert "OVERHEAD ICE" in resp.ice_safety_advisory


def test_build_alpine_scuba_prompt_actions():
    calc_intent = AlpineScubaIntent(intent_detected=True, action="calculate_scuba")
    p_calc = build_alpine_scuba_prompt(calc_intent)
    assert "Calculate Bühlmann ESLD" in p_calc

    gear_intent = AlpineScubaIntent(intent_detected=True, action="gear_checklist")
    p_gear = build_alpine_scuba_prompt(gear_intent)
    assert "mandatory 6-item Cold-Water" in p_gear

    list_intent = AlpineScubaIntent(intent_detected=True, action="sites_list")
    p_list = build_alpine_scuba_prompt(list_intent)
    assert "Iconic Alpine Scuba Sites" in p_list

    detail_intent = AlpineScubaIntent(
        intent_detected=True,
        site_id="lake-ouananiche-chic-chocs",
        action="site_detail",
    )
    p_detail = build_alpine_scuba_prompt(detail_intent)
    assert "Lac aux Américains" in p_detail


def test_format_alpine_scuba_response_with_calc_response_and_dict():
    req = ScubaCalculationRequest(site_id="emerald-lake-rockies")
    calc = calculate_scuba_decompression(req)
    resp = format_alpine_scuba_response(calc)
    assert isinstance(resp, FormattedAlpineScubaResponse)
    assert "Emerald Lake" in resp
    assert resp.get("alpine_scuba_info")["action"] == "calculate_scuba"

    # From dict
    resp2 = format_alpine_scuba_response({"action": "sites_list"})
    assert "sites" in resp2.get("alpine_scuba_info")


def test_detect_alpine_scuba_intent_disambiguation_with_scuba_override():
    # If user mentions kayak AND scuba, scuba should still be detected
    i1 = detect_alpine_scuba_intent(
        "Can I use sea kayak to transport my scuba tanks and drysuit dive in Lake Tahoe?"
    )
    assert i1.intent_detected
    assert i1.site_id == "lake-tahoe-rubicon-wall"

    # If user mentions whitewater AND buhlmann decompression
    i2 = detect_alpine_scuba_intent(
        "Whitewater river rapid safety vs buhlmann altitude decompression tables"
    )
    assert i2.intent_detected

    # If user mentions coasteering AND scuba
    i3 = detect_alpine_scuba_intent(
        "Coasteering deep water cliff jumping vs alpine scuba dive at Crater Lake"
    )
    assert i3.intent_detected
    assert i3.site_id == "crater-lake-wizard-island"

    # Chic-chocs detection
    i4 = detect_alpine_scuba_intent(
        "Tell me about ice diving in Lac aux Américains chic-chocs dive"
    )
    assert i4.intent_detected
    assert i4.site_id == "lake-ouananiche-chic-chocs"


def test_base_ndl_depth_branches():
    from contoso_chat.alpine_scuba import _get_base_ndl_for_depth

    assert _get_base_ndl_for_depth(8.0) == 219
    assert _get_base_ndl_for_depth(11.0) == 147
    assert _get_base_ndl_for_depth(14.0) == 73
    assert _get_base_ndl_for_depth(17.0) == 51
    assert _get_base_ndl_for_depth(20.0) == 35
    assert _get_base_ndl_for_depth(23.0) == 28
    assert _get_base_ndl_for_depth(26.0) == 22
    assert _get_base_ndl_for_depth(29.0) == 17
    assert _get_base_ndl_for_depth(32.0) == 14
    assert _get_base_ndl_for_depth(35.0) == 11
    assert _get_base_ndl_for_depth(38.0) == 9
    assert _get_base_ndl_for_depth(41.0) == 8
    assert _get_base_ndl_for_depth(50.0) == 6


def test_formatted_response_string_indexing_and_helpers():
    resp = FormattedAlpineScubaResponse("sample text", {"alpine_scuba_info": {}})
    assert resp[0] == "s"

    # build_alpine_scuba_prompt with query and intent
    intent = AlpineScubaIntent(intent_detected=True, action="sites_list")
    p = build_alpine_scuba_prompt("some query", intent=intent)
    assert "Contoso Wilderness" in p

    # format_alpine_scuba_response from string
    resp_str = format_alpine_scuba_response("What gear do I need for Lake Tahoe scuba?")
    assert isinstance(resp_str, FormattedAlpineScubaResponse)
