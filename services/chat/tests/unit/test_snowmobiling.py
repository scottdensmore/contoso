import pytest
from contoso_chat.snowmobiling import (
    FormattedSnowmobileResponse,
    SledCalculationRequest,
    SledCalculationResponse,
    SnowmobileGearRequirement,
    SnowmobileIntent,
    SnowmobileZoneModel,
    build_snowmobiling_prompt,
    calculate_sled_performance,
    detect_snowmobiling_intent,
    extract_snowmobiling_intent,
    format_snowmobiling_response,
    get_snowmobile_gear,
    get_snowmobile_zone_by_id,
    get_snowmobile_zones,
)

# -----------------------------------------------------------------------------
# Pydantic Model Tests
# -----------------------------------------------------------------------------


def test_snowmobile_zone_model():
    zone = SnowmobileZoneModel(
        id="test-zone",
        name="Test Mountain Zone",
        region="British Columbia, Canada",
        elevation_meters=2200,
        average_annual_snow_cm=1350,
        primary_riding_style="Technical Boondocking",
        ates_rating="Complex ATES",
        description="Epic mountain snowmobile zone with deep powder bowls.",
        highlights=["Alpine bowls", "Challenging chutes"],
    )
    assert zone.id == "test-zone"
    assert zone.name == "Test Mountain Zone"
    assert zone.elevation_meters == 2200
    assert zone.average_annual_snow_cm == 1350
    assert zone.primary_riding_style == "Technical Boondocking"
    assert zone.ates_rating == "Complex ATES"
    assert len(zone.highlights) == 2


def test_sled_calculation_request_defaults():
    req = SledCalculationRequest()
    assert req.zone_id == "revelstoke-boulder-mountain"
    assert req.track_length_inches == 165.0
    assert req.lug_height_inches == 2.75
    assert req.engine_type == "factory_turbo"
    assert req.rider_and_gear_weight_kg == 95.0
    assert req.snowpack_condition == "deep_powder"


def test_sled_calculation_response_model():
    resp = SledCalculationResponse(
        zone_name="Boulder Mountain & Frisby Ridge",
        flotation_index=8.2,
        trenching_risk="low",
        effective_horsepower=165.0,
        power_loss_percent=0.0,
        sidehill_stability_rating="exceptional_traction_firm_hold",
        counter_steering_guidance="Initiate counter-steering downhill to carve uphill edge.",
        avalanche_terrain_warning="Complex ATES warning.",
    )
    assert resp.zone_name == "Boulder Mountain & Frisby Ridge"
    assert resp.flotation_index == 8.2
    assert resp.trenching_risk == "low"
    assert resp.effective_horsepower == 165.0
    assert resp.power_loss_percent == 0.0
    assert resp.sidehill_stability_rating == "exceptional_traction_firm_hold"
    assert "counter-steering" in resp.counter_steering_guidance.lower()
    assert "Complex" in (resp.avalanche_terrain_warning or "")


def test_snowmobile_gear_requirement_model():
    gear = SnowmobileGearRequirement(
        id="test-gear",
        name="Test Avalanche Airbag",
        category="avalanche_airbag",
        mandatory=True,
        description="Electronic airbag pack.",
    )
    assert gear.id == "test-gear"
    assert gear.name == "Test Avalanche Airbag"
    assert gear.category == "avalanche_airbag"
    assert gear.mandatory is True


def test_snowmobile_intent_model():
    intent = SnowmobileIntent(
        intent_detected=True,
        zone_id="cooke-city-daisy-pass",
        action="calculate_sled",
        confidence=0.95,
    )
    assert intent.intent_detected is True
    assert intent.zone_id == "cooke-city-daisy-pass"
    assert intent.action == "calculate_sled"
    assert intent.confidence == 0.95


# -----------------------------------------------------------------------------
# Catalog Tests (5 Iconic Mountain Snowmobile Zones)
# -----------------------------------------------------------------------------


def test_get_snowmobile_zones_catalog():
    zones = get_snowmobile_zones()
    assert len(zones) == 5
    zone_ids = [z.id for z in zones]
    assert "revelstoke-boulder-mountain" in zone_ids
    assert "cooke-city-daisy-pass" in zone_ids
    assert "togwotee-pass-brooks-lake" in zone_ids
    assert "valee-de-bras-du-nord-gaspe" in zone_ids
    assert "steamboat-rabbit-ears-pass" in zone_ids


def test_get_snowmobile_zones_filter_by_ates_rating():
    complex_zones = get_snowmobile_zones(ates_rating="Complex ATES")
    assert len(complex_zones) == 2
    complex_ids = [z.id for z in complex_zones]
    assert "revelstoke-boulder-mountain" in complex_ids
    assert "cooke-city-daisy-pass" in complex_ids

    challenging_zones = get_snowmobile_zones(ates_rating="Challenging ATES")
    assert len(challenging_zones) == 2
    challenging_ids = [z.id for z in challenging_zones]
    assert "togwotee-pass-brooks-lake" in challenging_ids
    assert "valee-de-bras-du-nord-gaspe" in challenging_ids

    simple_zones = get_snowmobile_zones(ates_rating="Simple ATES")
    assert len(simple_zones) == 1
    assert simple_zones[0].id == "steamboat-rabbit-ears-pass"


def test_get_snowmobile_zone_by_id():
    rev = get_snowmobile_zone_by_id("revelstoke-boulder-mountain")
    assert rev is not None
    assert rev.id == "revelstoke-boulder-mountain"
    assert "Boulder Mountain" in rev.name
    assert rev.elevation_meters == 2300
    assert rev.average_annual_snow_cm == 1400
    assert rev.ates_rating == "Complex ATES"
    assert len(rev.highlights) >= 2

    cooke = get_snowmobile_zone_by_id("cooke-city-daisy-pass")
    assert cooke is not None
    assert cooke.elevation_meters == 3050

    none_zone = get_snowmobile_zone_by_id("non-existent-zone")
    assert none_zone is None


# -----------------------------------------------------------------------------
# Gear Checklist Tests (6 Mandatory Mountain Sled Gear Items)
# -----------------------------------------------------------------------------


def test_get_snowmobile_gear():
    gear = get_snowmobile_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    gear_ids = [g.id for g in gear]
    assert "electronic-avalanche-airbag-pack" in gear_ids
    assert "digital-three-antenna-beacon" in gear_ids
    assert "stealth-snow-probe-carbon-320" in gear_ids
    assert "d-grip-metal-snow-saw-shovel" in gear_ids
    assert "magnetic-kill-switch-tether" in gear_ids
    assert "tunnel-retractable-recovery-winch" in gear_ids


# -----------------------------------------------------------------------------
# Calculation Engine Tests
# -----------------------------------------------------------------------------


def test_calculate_sled_elevation_power_derating_naturally_aspirated():
    # Revelstoke: 2300m = ~7546 ft.
    # At ~3.5% loss per 1000 ft, loss is ~26.4%.
    req = SledCalculationRequest(
        zone_id="revelstoke-boulder-mountain",
        engine_type="naturally_aspirated",
        track_length_inches=165.0,
        lug_height_inches=2.75,
        rider_and_gear_weight_kg=95.0,
        snowpack_condition="deep_powder",
    )
    resp = calculate_sled_performance(req)
    assert resp.zone_name == "Boulder Mountain & Frisby Ridge"
    assert resp.power_loss_percent > 20.0
    assert resp.effective_horsepower < 135.0
    assert resp.effective_horsepower > 115.0


def test_calculate_sled_elevation_power_derating_factory_turbo():
    # Factory turbo maintains full boost up to 10k ft
    # Revelstoke is 2300m (~7546 ft) <= 10,000 ft -> 0% loss, full 165 HP
    req = SledCalculationRequest(
        zone_id="revelstoke-boulder-mountain",
        engine_type="factory_turbo",
        track_length_inches=165.0,
        lug_height_inches=2.75,
        rider_and_gear_weight_kg=95.0,
        snowpack_condition="deep_powder",
    )
    resp = calculate_sled_performance(req)
    assert resp.power_loss_percent == 0.0
    assert resp.effective_horsepower == 165.0

    # Steamboat Rabbit Ears: 3170m (~10400 ft) > 10,000 ft -> slight derating above 10k ft
    req_high = SledCalculationRequest(
        zone_id="steamboat-rabbit-ears-pass",
        engine_type="factory_turbo",
        track_length_inches=165.0,
        lug_height_inches=2.75,
        rider_and_gear_weight_kg=95.0,
        snowpack_condition="deep_powder",
    )
    resp_high = calculate_sled_performance(req_high)
    assert resp_high.power_loss_percent > 0.0
    assert resp_high.power_loss_percent < 5.0
    assert resp_high.effective_horsepower > 155.0


def test_calculate_sled_flotation_and_trenching_risk():
    # Short track, small lug, heavy rider in deep powder -> high trenching risk
    req_short = SledCalculationRequest(
        zone_id="revelstoke-boulder-mountain",
        track_length_inches=146.0,
        lug_height_inches=2.0,
        rider_and_gear_weight_kg=115.0,
        snowpack_condition="deep_powder",
    )
    resp_short = calculate_sled_performance(req_short)
    assert resp_short.flotation_index < 6.0
    assert resp_short.trenching_risk == "high"

    # Long track 175", 3.0" lug, light rider in deep powder -> low trenching risk
    req_long = SledCalculationRequest(
        zone_id="revelstoke-boulder-mountain",
        track_length_inches=175.0,
        lug_height_inches=3.0,
        rider_and_gear_weight_kg=80.0,
        snowpack_condition="deep_powder",
    )
    resp_long = calculate_sled_performance(req_long)
    assert resp_long.flotation_index >= 7.5
    assert resp_long.trenching_risk == "low"


def test_calculate_sled_sidehill_and_avalanche_warnings():
    req = SledCalculationRequest(
        zone_id="cooke-city-daisy-pass",
        track_length_inches=165.0,
        lug_height_inches=2.75,
        engine_type="factory_turbo",
        rider_and_gear_weight_kg=90.0,
        snowpack_condition="deep_powder",
    )
    resp = calculate_sled_performance(req)
    assert "counter-steering" in resp.counter_steering_guidance.lower()
    assert resp.sidehill_stability_rating is not None
    assert "Complex ATES" in (resp.avalanche_terrain_warning or "")


def test_calculate_sled_unknown_zone_raises_value_error():
    req = SledCalculationRequest(zone_id="invalid-zone-id")
    with pytest.raises(ValueError, match="not found"):
        calculate_sled_performance(req)


# -----------------------------------------------------------------------------
# Intent Detection Tests & Disambiguation Guards
# -----------------------------------------------------------------------------


def test_detect_snowmobiling_intent_basic_keywords():
    intent = detect_snowmobiling_intent("Can I get advice on backcountry snowmobiling?")
    assert intent is not None
    assert intent.intent_detected is True
    assert intent.action == "zones_list"

    intent2 = detect_snowmobiling_intent("Tell me about mountain sled boondocking and sidehilling")
    assert intent2 is not None
    assert intent2.intent_detected is True


def test_detect_snowmobiling_intent_zone_recognition():
    intent = detect_snowmobiling_intent(
        "How is the snowmobile riding in Revelstoke Boulder Mountain?"
    )
    assert intent is not None
    assert intent.zone_id == "revelstoke-boulder-mountain"
    assert intent.action == "zone_detail"

    intent2 = detect_snowmobiling_intent("Planning a mountain sled trip to Cooke City Daisy Pass")
    assert intent2 is not None
    assert intent2.zone_id == "cooke-city-daisy-pass"

    intent3 = detect_snowmobiling_intent("What is the riding like at Togwotee Pass?")
    assert intent3 is not None
    assert intent3.zone_id == "togwotee-pass-brooks-lake"

    intent4 = detect_snowmobiling_intent("Tell me about snowmobiling in Chic-Chocs Gaspésie")
    assert intent4 is not None
    assert intent4.zone_id == "valee-de-bras-du-nord-gaspe"

    intent5 = detect_snowmobiling_intent(
        "Buffalo pass and Rabbit Ears pass snowmobiling conditions"
    )
    assert intent5 is not None
    assert intent5.zone_id == "steamboat-rabbit-ears-pass"


def test_detect_snowmobiling_intent_action_classification():
    calc_intent = detect_snowmobiling_intent(
        "Calculate flotation index, trenching risk, and elevation power derating for 850 turbo"
    )
    assert calc_intent is not None
    assert calc_intent.action == "calculate_sled"

    gear_intent = detect_snowmobiling_intent(
        "What is the mandatory avalanche airbag and mountain sled gear checklist?"
    )
    assert gear_intent is not None
    assert gear_intent.action == "gear_checklist"


def test_detect_snowmobiling_intent_disambiguation_guards():
    # 1. Ski touring guard (skin track, splitboard, camp muir)
    assert (
        detect_snowmobiling_intent("How is the skin track and splitboard ascent on Camp Muir?")
        is None
    )
    assert (
        detect_snowmobiling_intent("What ski touring bindings do I need for backcountry touring?")
        is None
    )

    # 2. Snowkiting guard (foil kite, pulk hauling, depower foil)
    assert (
        detect_snowmobiling_intent("Best foil snowkite and pulk hauling harness for Hardangervidda")
        is None
    )

    # 3. Generic avalanche safety guard without sled terms
    assert (
        detect_snowmobiling_intent("How do I conduct an extended column test and dig a snow pit?")
        is None
    )

    # 4. Dogsledding guard (mushing, huskies, dog sled)
    assert (
        detect_snowmobiling_intent("Looking for a husky dog sledding mushing tour in Alaska")
        is None
    )

    # 5. Ecommerce & order tracking guard
    assert (
        detect_snowmobiling_intent("Where is my order #12345 tracking status and refund?") is None
    )

    # Empty string
    assert detect_snowmobiling_intent("") is None
    assert detect_snowmobiling_intent("   ") is None


def test_extract_snowmobiling_intent_alias():
    intent = extract_snowmobiling_intent("mountain sled sidehilling advice")
    assert intent is not None
    assert intent.intent_detected is True


# -----------------------------------------------------------------------------
# Prompt Generation & Response Formatting Tests
# -----------------------------------------------------------------------------


def test_build_snowmobiling_prompt():
    intent = SnowmobileIntent(
        intent_detected=True,
        zone_id="revelstoke-boulder-mountain",
        action="zone_detail",
    )
    prompt = build_snowmobiling_prompt(intent)
    assert "Backcountry Mountain Snowmobiling" in prompt or "Snowmobile" in prompt
    assert "Boulder Mountain" in prompt
    assert "Turbo" in prompt or "Naturally Aspirated" in prompt
    assert "Airbag" in prompt or "Tether" in prompt


def test_format_snowmobiling_response_zones_list():
    intent = SnowmobileIntent(intent_detected=True, action="zones_list")
    resp = format_snowmobiling_response(intent)
    assert isinstance(resp, FormattedSnowmobileResponse)
    assert "Boulder Mountain" in resp
    info = resp.get("snowmobiling_info")
    assert info is not None
    assert info["action"] == "zones_list"
    assert len(info["zones"]) == 5


def test_format_snowmobiling_response_zone_detail():
    intent = SnowmobileIntent(
        intent_detected=True,
        zone_id="cooke-city-daisy-pass",
        action="zone_detail",
    )
    resp = format_snowmobiling_response(intent)
    assert "Daisy Pass" in resp
    info = resp.get("snowmobiling_info")
    assert info["action"] == "zone_detail"
    assert info["zone"]["id"] == "cooke-city-daisy-pass"


def test_format_snowmobiling_response_calculate():
    intent = SnowmobileIntent(
        intent_detected=True,
        zone_id="revelstoke-boulder-mountain",
        action="calculate_sled",
    )
    resp = format_snowmobiling_response(intent)
    assert "Flotation" in resp or "Horsepower" in resp
    info = resp.get("snowmobiling_info")
    assert info["action"] == "calculate_sled"
    assert "calculation" in info


def test_format_snowmobiling_response_gear():
    intent = SnowmobileIntent(intent_detected=True, action="gear_checklist")
    resp = format_snowmobiling_response(intent)
    assert "electronic-avalanche-airbag-pack" in str(resp) or "Airbag" in str(resp)
    info = resp.get("snowmobiling_info")
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6


def test_formatted_snowmobile_response_dict_methods():
    resp = FormattedSnowmobileResponse(
        "test answer", {"snowmobiling_info": {"key": "val"}, "answer": "test answer"}
    )
    assert resp["snowmobiling_info"] == {"key": "val"}
    assert resp["answer"] == "test answer"
    assert "snowmobiling_info" in resp
    assert list(resp.keys()) == ["snowmobiling_info", "answer"]
    assert len(list(resp.values())) == 2
    assert len(list(resp.items())) == 2


def test_calculate_sled_short_track_and_simple_ates():
    req = SledCalculationRequest(
        zone_id="steamboat-rabbit-ears-pass",
        track_length_inches=150.0,
        lug_height_inches=2.25,
        rider_and_gear_weight_kg=90.0,
        snowpack_condition="spring_crust",
    )
    resp = calculate_sled_performance(req)
    assert resp.sidehill_stability_rating == "high_agility_reduced_hold"
    assert "Simple ATES" in (resp.avalanche_terrain_warning or "")


def test_calculate_sled_moderate_flotation():
    req = SledCalculationRequest(
        zone_id="togwotee-pass-brooks-lake",
        track_length_inches=154.0,
        lug_height_inches=2.5,
        rider_and_gear_weight_kg=95.0,
        snowpack_condition="deep_powder",
    )
    resp = calculate_sled_performance(req)
    assert resp.sidehill_stability_rating == "balanced_agility_and_hold"
    assert resp.trenching_risk in ("moderate", "low")


def test_build_snowmobiling_prompt_actions():
    calc_intent = SnowmobileIntent(intent_detected=True, action="calculate_sled")
    prompt_calc = build_snowmobiling_prompt(calc_intent)
    assert "Calculate sled track flotation" in prompt_calc

    gear_intent = SnowmobileIntent(intent_detected=True, action="gear_checklist")
    prompt_gear = build_snowmobiling_prompt(gear_intent)
    assert "Backcountry Avalanche & Mountain Sled Recovery Checklist" in prompt_gear

    list_intent = SnowmobileIntent(intent_detected=True, action="zones_list")
    prompt_list = build_snowmobiling_prompt(list_intent)
    assert "Iconic Mountain Snowmobile Zones" in prompt_list

    prompt_query = build_snowmobiling_prompt("snowmobile riding in revelstoke")
    assert "Boulder Mountain" in prompt_query


def test_format_snowmobiling_response_with_calc_response_and_dict():
    req = SledCalculationRequest(zone_id="revelstoke-boulder-mountain")
    calc = calculate_sled_performance(req)
    resp = format_snowmobiling_response(calc)
    assert isinstance(resp, FormattedSnowmobileResponse)
    assert "Boulder Mountain" in resp
    assert resp.get("snowmobiling_info")["action"] == "calculate_sled"

    # From dict
    resp2 = format_snowmobiling_response({"intent_detected": True, "action": "gear_checklist"})
    assert resp2.get("snowmobiling_info")["action"] == "gear_checklist"

    # From string
    resp3 = format_snowmobiling_response("tell me about avalanche gear for snowmobiling")
    assert resp3.get("snowmobiling_info")["action"] == "gear_checklist"
