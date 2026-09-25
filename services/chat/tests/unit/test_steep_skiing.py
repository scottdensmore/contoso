import pytest
from contoso_chat.steep_skiing import (
    CouloirCalculationRequest,
    CouloirCalculationResponse,
    CouloirDescentModel,
    FormattedSteepSkiingResponse,
    SteepSkiingGearRequirement,
    SteepSkiingIntent,
    build_steep_skiing_prompt,
    calculate_couloir_dynamics,
    detect_steep_skiing_intent,
    format_steep_skiing_response,
    get_couloir_descent_by_id,
    get_couloir_descents,
    get_steep_skiing_gear,
)

# -----------------------------------------------------------------------------
# Pydantic Model Tests
# -----------------------------------------------------------------------------


def test_couloir_descent_model():
    couloir = CouloirDescentModel(
        id="test-couloir",
        name="Test Couloir",
        mountain="Test Peak",
        range="Teton Range, WY",
        grade="Class_2_Steep_45_50",
        max_slope_angle_deg=50.0,
        average_slope_angle_deg=45.0,
        vertical_drop_meters=300.0,
        choke_width_meters=3.0,
        aspect="North",
        description="A steep test couloir.",
        highlights=["Steep entry", "Rocky choke"],
    )
    assert couloir.id == "test-couloir"
    assert couloir.name == "Test Couloir"
    assert couloir.mountain == "Test Peak"
    assert couloir.range == "Teton Range, WY"
    assert couloir.grade == "Class_2_Steep_45_50"
    assert couloir.max_slope_angle_deg == 50.0
    assert couloir.average_slope_angle_deg == 45.0
    assert couloir.vertical_drop_meters == 300.0
    assert couloir.choke_width_meters == 3.0
    assert couloir.aspect == "North"
    assert "steep" in couloir.description
    assert len(couloir.highlights) == 2


def test_couloir_calculation_request_defaults():
    req = CouloirCalculationRequest()
    assert req.couloir_id == "corbets-couloir-jackson"
    assert req.slope_angle_deg == 50.0
    assert req.snow_surface == "packed_powder"
    assert req.skier_weight_kg == 80.0
    assert req.sluff_release_distance_meters == 35.0


def test_couloir_calculation_response_model():
    resp = CouloirCalculationResponse(
        couloir_name="Corbet's Couloir & S&S Chute",
        sluff_velocity_km_h=53.2,
        hop_turn_edge_load_n=1469.0,
        fall_consequence_index="catastrophic_unmitigated",
        recommended_style="ski_belay_rappel",
        sluff_management_strategy="High-velocity sluff hazard: Ski down-and-cut rhythm.",
        choke_warning="Extreme choke restriction (<2.5m).",
    )
    assert resp.couloir_name == "Corbet's Couloir & S&S Chute"
    assert resp.sluff_velocity_km_h == 53.2
    assert resp.hop_turn_edge_load_n == 1469.0
    assert resp.fall_consequence_index == "catastrophic_unmitigated"
    assert resp.recommended_style == "ski_belay_rappel"
    assert "High-velocity" in resp.sluff_management_strategy
    assert "Extreme choke" in (resp.choke_warning or "")


def test_steep_skiing_gear_requirement_model():
    gear = SteepSkiingGearRequirement(
        id="technical-ski-mountaineering-axes",
        name="Curved Ski Mountaineering Ice Axes (Pair)",
        category="axes",
        mandatory=True,
        description="Technical steel-pick axes for self-arrest.",
    )
    assert gear.id == "technical-ski-mountaineering-axes"
    assert gear.name == "Curved Ski Mountaineering Ice Axes (Pair)"
    assert gear.category == "axes"
    assert gear.mandatory is True
    assert "self-arrest" in gear.description


def test_steep_skiing_intent_model():
    intent = SteepSkiingIntent(
        intent_detected=True,
        couloir_id="corbets-couloir-jackson",
        action="calculate_couloir",
        confidence=0.95,
    )
    assert intent.intent_detected is True
    assert intent.couloir_id == "corbets-couloir-jackson"
    assert intent.action == "calculate_couloir"
    assert intent.confidence == 0.95
    assert bool(intent) is True

    empty_intent = SteepSkiingIntent(
        intent_detected=False, couloir_id=None, action="", confidence=0.0
    )
    assert bool(empty_intent) is False


# -----------------------------------------------------------------------------
# Catalog & Gear Tests
# -----------------------------------------------------------------------------


def test_get_couloir_descents_all():
    descents = get_couloir_descents()
    assert len(descents) == 5
    ids = [c.id for c in descents]
    assert "corbets-couloir-jackson" in ids
    assert "tuckerman-ravine-headwall" in ids
    assert "silver-couloir-buffalo" in ids
    assert "terminal-cancer-couloir" in ids
    assert "mount-superior-south-face" in ids


def test_get_couloir_descents_filtering():
    class2 = get_couloir_descents(grade="Class_2_Steep_45_50")
    assert len(class2) == 3
    assert all(c.grade == "Class_2_Steep_45_50" for c in class2)

    class3 = get_couloir_descents(grade="Class_3_Extreme_50_55")
    assert len(class3) == 2
    assert all(c.grade == "Class_3_Extreme_50_55" for c in class3)

    none_found = get_couloir_descents(grade="Class_Nonexistent")
    assert len(none_found) == 0


def test_get_couloir_descent_by_id():
    corbets = get_couloir_descent_by_id("corbets-couloir-jackson")
    assert corbets is not None
    assert corbets.name == "Corbet's Couloir & S&S Chute"
    assert corbets.max_slope_angle_deg == 50.0
    assert corbets.vertical_drop_meters == 180.0
    assert corbets.choke_width_meters == 3.5

    unknown = get_couloir_descent_by_id("unknown-couloir")
    assert unknown is None


def test_get_steep_skiing_gear():
    gear = get_steep_skiing_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    gear_ids = [g.id for g in gear]
    assert "technical-ski-mountaineering-axes" in gear_ids
    assert "certified-ski-crampons" in gear_ids
    assert "ultralight-ski-rad-line" in gear_ids
    assert "ski-carry-airbag-backpack" in gear_ids
    assert "aluminum-snow-stake-fluke" in gear_ids
    assert "triple-certified-ski-climbing-helmet" in gear_ids


# -----------------------------------------------------------------------------
# Calculation Engine Tests
# -----------------------------------------------------------------------------


def test_calculate_couloir_dynamics_corbets():
    req = CouloirCalculationRequest(
        couloir_id="corbets-couloir-jackson",
        slope_angle_deg=48.0,
        snow_surface="packed_powder",
        skier_weight_kg=78.0,
        sluff_release_distance_meters=20.0,
    )
    res = calculate_couloir_dynamics(req)
    assert res.couloir_name == "Corbet's Couloir & S&S Chute"
    assert abs(res.sluff_velocity_km_h - 53.2) < 0.5
    assert res.hop_turn_edge_load_n == 1469.0
    assert res.fall_consequence_index == "severe_injury_risk"
    assert res.recommended_style == "hop_turns"
    assert "High-velocity" in res.sluff_management_strategy
    assert res.choke_warning is None


def test_calculate_couloir_dynamics_consequences():
    # 53+ deg -> catastrophic
    res_53 = calculate_couloir_dynamics(
        CouloirCalculationRequest(
            couloir_id="corbets-couloir-jackson",
            slope_angle_deg=53.0,
            snow_surface="packed_powder",
        )
    )
    assert res_53.fall_consequence_index == "catastrophic_unmitigated"

    # 48+ deg on corn_ice_firm -> catastrophic
    res_ice = calculate_couloir_dynamics(
        CouloirCalculationRequest(
            couloir_id="corbets-couloir-jackson",
            slope_angle_deg=48.0,
            snow_surface="corn_ice_firm",
        )
    )
    assert res_ice.fall_consequence_index == "catastrophic_unmitigated"

    # 42 deg on wind_slab -> severe_injury_risk
    res_slab = calculate_couloir_dynamics(
        CouloirCalculationRequest(
            couloir_id="corbets-couloir-jackson",
            slope_angle_deg=42.0,
            snow_surface="wind_slab",
        )
    )
    assert res_slab.fall_consequence_index == "severe_injury_risk"

    # 42 deg on packed_powder -> moderate_arrestable
    res_mod = calculate_couloir_dynamics(
        CouloirCalculationRequest(
            couloir_id="corbets-couloir-jackson",
            slope_angle_deg=42.0,
            snow_surface="packed_powder",
        )
    )
    assert res_mod.fall_consequence_index == "moderate_arrestable"


def test_calculate_couloir_dynamics_descent_styles():
    # >= 52 deg -> ski_belay_rappel
    res_steep = calculate_couloir_dynamics(
        CouloirCalculationRequest(
            couloir_id="corbets-couloir-jackson",
            slope_angle_deg=52.0,
        )
    )
    assert res_steep.recommended_style == "ski_belay_rappel"

    # Terminal Cancer (choke 2.0m <= 2.2m) at moderate slope -> side_slipping_choke
    res_choke = calculate_couloir_dynamics(
        CouloirCalculationRequest(
            couloir_id="terminal-cancer-couloir",
            slope_angle_deg=44.0,
            snow_surface="packed_powder",
        )
    )
    assert res_choke.recommended_style == "side_slipping_choke"
    assert res_choke.choke_warning is not None
    assert "Extreme choke restriction (<2.5m)" in res_choke.choke_warning

    # chalk_firm at 42 deg -> hop_turns
    res_chalk = calculate_couloir_dynamics(
        CouloirCalculationRequest(
            couloir_id="corbets-couloir-jackson",
            slope_angle_deg=42.0,
            snow_surface="chalk_firm",
        )
    )
    assert res_chalk.recommended_style == "hop_turns"

    # 42 deg packed powder on wide couloir -> fluid_turns
    res_fluid = calculate_couloir_dynamics(
        CouloirCalculationRequest(
            couloir_id="corbets-couloir-jackson",
            slope_angle_deg=42.0,
            snow_surface="packed_powder",
        )
    )
    assert res_fluid.recommended_style == "fluid_turns"


def test_calculate_couloir_dynamics_unknown_couloir():
    with pytest.raises(ValueError, match="not found"):
        calculate_couloir_dynamics(CouloirCalculationRequest(couloir_id="unknown-couloir-404"))


# -----------------------------------------------------------------------------
# Intent Detection & Disambiguation Tests
# -----------------------------------------------------------------------------


def test_detect_steep_skiing_intent_keywords():
    intent = detect_steep_skiing_intent("Tell me about steep couloir skiing and hop turn technique")
    assert intent.intent_detected is True
    assert intent.action in ("couloirs_list", "couloir_detail")

    corbets_intent = detect_steep_skiing_intent(
        "What is the slope angle and choke of Corbet's Couloir in Jackson?"
    )
    assert corbets_intent.intent_detected is True
    assert corbets_intent.couloir_id == "corbets-couloir-jackson"
    assert corbets_intent.action == "couloir_detail"

    calc_intent = detect_steep_skiing_intent(
        "Calculate sluff velocity and hop-turn edge loading on a 50 degree couloir"
    )
    assert calc_intent.intent_detected is True
    assert calc_intent.action == "calculate_couloir"

    gear_intent = detect_steep_skiing_intent(
        "What ski crampons, harscheisen, and rad line gear do I need for couloirs?"
    )
    assert gear_intent.intent_detected is True
    assert gear_intent.action == "gear_checklist"


def test_detect_steep_skiing_intent_couloir_names():
    # Tuckerman
    tuck = detect_steep_skiing_intent("Tell me about Tuckerman Ravine headwall skiing")
    assert tuck.couloir_id == "tuckerman-ravine-headwall"

    # Silver couloir
    silver = detect_steep_skiing_intent("Describe Silver Couloir on Buffalo Mountain")
    assert silver.couloir_id == "silver-couloir-buffalo"

    # Terminal cancer
    tc = detect_steep_skiing_intent("What is the width of Terminal Cancer couloir?")
    assert tc.couloir_id == "terminal-cancer-couloir"

    # Mount Superior
    sup = detect_steep_skiing_intent("How steep is Mount Superior South Face and Suicide Chute?")
    assert sup.couloir_id == "mount-superior-south-face"


def test_detect_steep_skiing_intent_disambiguation():
    # 1. Order tracking
    order_msg = "Where is my order #12345? Track my shipping status."
    assert detect_steep_skiing_intent(order_msg).intent_detected is False

    # 2. Snowmobiling
    sled_msg = "What throttle control and sled deck do I need for my Polaris mountain sled?"
    assert detect_steep_skiing_intent(sled_msg).intent_detected is False

    # 3. Snowkiting
    kite_msg = "How do I depower my snowkite foil and hook into the chickenloop on Hardangervidda?"
    assert detect_steep_skiing_intent(kite_msg).intent_detected is False

    # 4. Avalanche generic
    avy_msg = "Check the avalanche forecast and danger ratings for Stevens Pass near treeline"
    assert detect_steep_skiing_intent(avy_msg).intent_detected is False

    # 5. Ski touring pace
    tour_msg = "What is my uphill skin track pace and skinning pace for Camp Muir?"
    assert detect_steep_skiing_intent(tour_msg).intent_detected is False

    # Empty string
    assert detect_steep_skiing_intent("").intent_detected is False


# -----------------------------------------------------------------------------
# Prompt Generation & Formatting Tests
# -----------------------------------------------------------------------------


def test_build_steep_skiing_prompt():
    prompt = build_steep_skiing_prompt("Tell me about Corbet's Couloir")
    assert "Alpine Ski Mountaineering" in prompt or "Steep Couloir" in prompt
    assert "Corbet's Couloir" in prompt

    gear_intent = SteepSkiingIntent(action="gear_checklist")
    gear_prompt = build_steep_skiing_prompt(gear_intent)
    assert "Gear" in gear_prompt or "Checklist" in gear_prompt


def test_format_steep_skiing_response():
    # 1. Calculation
    calc_req = CouloirCalculationRequest(couloir_id="corbets-couloir-jackson")
    calc_res = calculate_couloir_dynamics(calc_req)
    fmt_calc = format_steep_skiing_response(calc_res)
    assert isinstance(fmt_calc, FormattedSteepSkiingResponse)
    assert "steep_skiing_info" in fmt_calc
    assert fmt_calc["steep_skiing_info"]["action"] == "calculate_couloir"
    assert "Corbet's Couloir" in str(fmt_calc)

    # 2. Gear
    gear_intent = SteepSkiingIntent(action="gear_checklist")
    fmt_gear = format_steep_skiing_response(gear_intent)
    assert fmt_gear["steep_skiing_info"]["action"] == "gear_checklist"
    assert len(fmt_gear["steep_skiing_info"]["gear"]) == 6

    # 3. Detail
    detail_intent = SteepSkiingIntent(
        action="couloir_detail",
        couloir_id="terminal-cancer-couloir",
    )
    fmt_detail = format_steep_skiing_response(detail_intent)
    assert fmt_detail["steep_skiing_info"]["action"] == "couloir_detail"
    assert "Terminal Cancer Couloir" in str(fmt_detail)

    # 4. List
    list_intent = SteepSkiingIntent(action="couloirs_list")
    fmt_list = format_steep_skiing_response(list_intent)
    assert fmt_list["steep_skiing_info"]["action"] == "couloirs_list"
    assert len(fmt_list["steep_skiing_info"]["couloirs"]) == 5


def test_formatted_steep_skiing_response_dict_interface():
    data = {"steep_skiing_info": {"action": "test"}, "answer": "Test answer"}
    resp = FormattedSteepSkiingResponse("Test answer", data)
    assert resp.get("steep_skiing_info") == {"action": "test"}
    assert resp.get("nonexistent", "default") == "default"
    assert resp["steep_skiing_info"] == {"action": "test"}
    assert "steep_skiing_info" in resp
    assert "nonexistent" not in resp
    assert "steep_skiing_info" in list(resp.keys())
    assert {"action": "test"} in list(resp.values())
    assert len(list(resp.items())) == 2


def test_format_steep_skiing_response_variants():
    # From dict
    dict_input = {"intent_detected": True, "action": "gear_checklist"}
    res_dict = format_steep_skiing_response(dict_input)
    assert res_dict["steep_skiing_info"]["action"] == "gear_checklist"

    # From string query
    res_str = format_steep_skiing_response("Tell me about steep couloirs")
    assert res_str["steep_skiing_info"]["action"] == "couloirs_list"

    # From calculate intent
    calc_intent = SteepSkiingIntent(
        action="calculate_couloir", couloir_id="corbets-couloir-jackson"
    )
    res_calc = format_steep_skiing_response(calc_intent)
    assert res_calc["steep_skiing_info"]["action"] == "calculate_couloir"


def test_build_steep_skiing_prompt_calculate():
    calc_intent = SteepSkiingIntent(action="calculate_couloir")
    prompt = build_steep_skiing_prompt(calc_intent)
    assert "Calculate sluff velocity" in prompt


def test_calculate_couloir_dynamics_low_sluff():
    req = CouloirCalculationRequest(
        couloir_id="corbets-couloir-jackson",
        slope_angle_deg=40.0,
        snow_surface="packed_powder",
        skier_weight_kg=75.0,
        sluff_release_distance_meters=5.0,
    )
    res = calculate_couloir_dynamics(req)
    assert res.sluff_velocity_km_h <= 35.0
    assert "Controlled sluff hazard" in res.sluff_management_strategy


def test_detect_steep_skiing_intent_no_keywords():
    intent = detect_steep_skiing_intent("Can I buy a water bottle?")
    assert intent.intent_detected is False


def test_build_steep_skiing_prompt_fallback_and_param():
    # Test intent param passed explicitly
    intent = SteepSkiingIntent(action="couloirs_list")
    prompt = build_steep_skiing_prompt("dummy", intent=intent)
    assert "Iconic Couloir Descents" in prompt

    # Test query str that defaults to couloirs_list
    prompt2 = build_steep_skiing_prompt("steep skiing couloirs list")
    assert "Iconic Couloir Descents" in prompt2


def test_formatted_steep_skiing_response_fallbacks():
    data = {"steep_skiing_info": {"action": "test"}}
    resp = FormattedSteepSkiingResponse("Hello", data)
    # Test __getitem__ with integer index (falls back to str.__getitem__)
    assert resp[0] == "H"
    # Test __contains__ with non-string object (falls back to False)
    assert (123 in resp) is False


def test_detect_steep_skiing_intent_implicit_detail():
    intent = detect_steep_skiing_intent("Corbet's Couloir")
    assert intent.intent_detected is True
    assert intent.couloir_id == "corbets-couloir-jackson"
    assert intent.action == "couloir_detail"
