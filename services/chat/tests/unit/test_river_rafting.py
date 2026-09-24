import pytest
from contoso_chat.river_rafting import (
    FormattedRiverRaftingResponse,
    RaftCalculationRequest,
    RaftCalculationResponse,
    RaftingExpeditionModel,
    RaftingGearRequirement,
    RaftingIntent,
    build_river_rafting_prompt,
    calculate_river_rafting,
    detect_river_rafting_intent,
    format_river_rafting_response,
    get_river_rafting_expedition_by_id,
    get_river_rafting_expeditions,
    get_river_rafting_gear,
)

# -----------------------------------------------------------------------------
# Pydantic Model Tests
# -----------------------------------------------------------------------------


def test_rafting_expedition_model():
    expedition = RaftingExpeditionModel(
        id="test-river-expedition",
        name="Test Canyon Expedition",
        river="Test River",
        location="Idaho / Montana, USA",
        difficulty="Class IV",
        mileage_miles=85.0,
        typical_days=6,
        recommended_raft_size_feet=16.0,
        permit_season="Lottery May-Sep",
        description="A wild scenic river expedition through rugged canyons.",
        highlights=["Continuous rapids", "Deep wilderness gorges"],
    )
    assert expedition.id == "test-river-expedition"
    assert expedition.name == "Test Canyon Expedition"
    assert expedition.river == "Test River"
    assert expedition.location == "Idaho / Montana, USA"
    assert expedition.difficulty == "Class IV"
    assert expedition.mileage_miles == 85.0
    assert expedition.typical_days == 6
    assert expedition.recommended_raft_size_feet == 16.0
    assert expedition.permit_season == "Lottery May-Sep"
    assert "canyons" in expedition.description
    assert len(expedition.highlights) == 2


def test_raft_calculation_request_defaults():
    req = RaftCalculationRequest()
    assert req.expedition_id == "colorado-river-grand-canyon"
    assert req.raft_length_feet == 18.0
    assert req.rigged_payload_kg == 650.0
    assert req.oar_length_feet == 10.0
    assert req.inboard_leverage_inches == 33.0
    assert req.entry_speed_knots == 6.0


def test_raft_calculation_response_model():
    resp = RaftCalculationResponse(
        expedition_name="Colorado River — Grand Canyon Expedition",
        leverage_ratio=2.64,
        total_displacement_liters=834.0,
        hole_punch_momentum_ns=2451.0,
        punch_feasibility="punch_clean",
        back_ferry_efficiency_score=85.0,
        stability_warning="OPTIMAL: Raft displacement and momentum are well-matched.",
        oar_rig_recommendation="Use 10.0ft counterbalanced composite oars.",
    )
    assert resp.expedition_name == "Colorado River — Grand Canyon Expedition"
    assert resp.leverage_ratio == 2.64
    assert resp.total_displacement_liters == 834.0
    assert resp.hole_punch_momentum_ns == 2451.0
    assert resp.punch_feasibility == "punch_clean"
    assert resp.back_ferry_efficiency_score == 85.0
    assert "OPTIMAL" in resp.stability_warning
    assert "10.0ft" in resp.oar_rig_recommendation


def test_rafting_gear_requirement_model():
    gear = RaftingGearRequirement(
        id="modular-aluminum-oar-frame",
        name="Modular Aluminum Oar Frame System with Adjustable Towers",
        category="frame_rowing",
        mandatory=True,
        description="Anodized pipe frame with adjustable oar towers.",
    )
    assert gear.id == "modular-aluminum-oar-frame"
    assert gear.name == "Modular Aluminum Oar Frame System with Adjustable Towers"
    assert gear.category == "frame_rowing"
    assert gear.mandatory is True
    assert "pipe frame" in gear.description


def test_rafting_intent_model():
    intent = RaftingIntent(
        intent_detected=True,
        expedition_id="colorado-river-grand-canyon",
        action="calculate_raft",
        confidence=0.95,
    )
    assert intent.intent_detected is True
    assert intent.expedition_id == "colorado-river-grand-canyon"
    assert intent.action == "calculate_raft"
    assert intent.confidence == 0.95
    assert bool(intent) is True

    empty_intent = RaftingIntent(intent_detected=False, action="", confidence=0.0)
    assert bool(empty_intent) is False


# -----------------------------------------------------------------------------
# Catalog Tests
# -----------------------------------------------------------------------------


def test_get_river_rafting_expeditions_all():
    expeditions = get_river_rafting_expeditions()
    assert len(expeditions) == 5
    ids = [e.id for e in expeditions]
    assert "colorado-river-grand-canyon" in ids
    assert "middle-fork-salmon-river" in ids
    assert "rogue-river-wilderness" in ids
    assert "selway-river-wilderness" in ids
    assert "green-river-gates-of-lodore" in ids


def test_get_river_rafting_expeditions_filter():
    class_v_trips = get_river_rafting_expeditions(difficulty="Class V")
    assert len(class_v_trips) == 2
    class_v_ids = [e.id for e in class_v_trips]
    assert "colorado-river-grand-canyon" in class_v_ids
    assert "selway-river-wilderness" in class_v_ids

    salmon_trips = get_river_rafting_expeditions(river="Salmon")
    assert len(salmon_trips) == 1
    assert salmon_trips[0].id == "middle-fork-salmon-river"


def test_get_river_rafting_expedition_by_id():
    gc = get_river_rafting_expedition_by_id("colorado-river-grand-canyon")
    assert gc is not None
    assert gc.name == "Colorado River — Grand Canyon Expedition"
    assert gc.mileage_miles == 226.0
    assert gc.typical_days == 18
    assert gc.recommended_raft_size_feet == 18.0

    mf = get_river_rafting_expedition_by_id("middle-fork-salmon-river")
    assert mf is not None
    assert mf.typical_days == 6

    unknown = get_river_rafting_expedition_by_id("non-existent-river")
    assert unknown is None


# -----------------------------------------------------------------------------
# Gear Checklist Tests
# -----------------------------------------------------------------------------


def test_get_river_rafting_gear():
    gear = get_river_rafting_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    gear_ids = [g.id for g in gear]
    assert "modular-aluminum-oar-frame" in gear_ids
    assert "counterbalanced-composite-oars" in gear_ids
    assert "gasketed-aluminum-drybox" in gear_ids
    assert "heavy-duty-drop-bag-cargo-net" in gear_ids
    assert "high-flotation-type-v-pfd" in gear_ids
    assert "firepan-clean-waste-groover" in gear_ids


# -----------------------------------------------------------------------------
# Calculation Engine Tests
# -----------------------------------------------------------------------------


def test_calculate_river_rafting_default_clean_punch():
    req = RaftCalculationRequest(
        expedition_id="colorado-river-grand-canyon",
        raft_length_feet=18.0,
        rigged_payload_kg=650.0,
        oar_length_feet=10.0,
        inboard_leverage_inches=33.0,
        entry_speed_knots=6.0,
    )
    res = calculate_river_rafting(req)
    assert res.expedition_name == "Colorado River — Grand Canyon Expedition"
    assert res.leverage_ratio == 2.64
    assert res.total_displacement_liters == 834
    assert res.hole_punch_momentum_ns == 2451
    assert res.punch_feasibility == "punch_clean"
    assert 50.0 <= res.back_ferry_efficiency_score <= 100.0
    assert len(res.stability_warning) > 0
    assert len(res.oar_rig_recommendation) > 0


def test_calculate_river_rafting_caution_stall_risk():
    req = RaftCalculationRequest(
        expedition_id="middle-fork-salmon-river",
        raft_length_feet=15.0,
        rigged_payload_kg=400.0,
        oar_length_feet=9.5,
        inboard_leverage_inches=32.0,
        entry_speed_knots=5.5,
    )
    res = calculate_river_rafting(req)
    assert res.punch_feasibility == "caution_stall_risk"
    assert "CAUTION" in res.stability_warning or "warning" in res.stability_warning.lower()


def test_calculate_river_rafting_flip_hazard_danger():
    req = RaftCalculationRequest(
        expedition_id="rogue-river-wilderness",
        raft_length_feet=14.0,
        rigged_payload_kg=300.0,
        oar_length_feet=9.0,
        inboard_leverage_inches=30.0,
        entry_speed_knots=2.0,
    )
    res = calculate_river_rafting(req)
    assert res.punch_feasibility == "flip_hazard_danger"
    assert "CRITICAL" in res.stability_warning or "danger" in res.stability_warning.lower()


def test_calculate_river_rafting_invalid_expedition():
    req = RaftCalculationRequest(expedition_id="non-existent-expedition")
    with pytest.raises(ValueError, match="not found"):
        calculate_river_rafting(req)


# -----------------------------------------------------------------------------
# Intent Detection Tests & Disambiguation Guards
# -----------------------------------------------------------------------------


def test_detect_river_rafting_intent_empty():
    assert bool(detect_river_rafting_intent("")) is False
    assert bool(detect_river_rafting_intent("   ")) is False


def test_detect_river_rafting_intent_ecommerce_guard():
    assert bool(detect_river_rafting_intent("Where is my order #12345?")) is False
    assert bool(detect_river_rafting_intent("Track my return shipping label")) is False
    assert bool(detect_river_rafting_intent("Can I get a refund for my order?")) is False


def test_detect_river_rafting_intent_packrafting_guard():
    intent = detect_river_rafting_intent(
        "I want an ultralight packraft with tizip cargo fly for bikerafting"
    )
    assert bool(intent) is False


def test_detect_river_rafting_intent_kayak_guard():
    intent = detect_river_rafting_intent(
        "How do I execute a solid roll in my half slice creek boat kayak?"
    )
    assert bool(intent) is False


def test_detect_river_rafting_intent_canoe_guard():
    intent = detect_river_rafting_intent(
        "What portage yoke and bent-shaft paddle do I need for boundary waters canoeing?"
    )
    assert bool(intent) is False


def test_detect_river_rafting_intent_river_sup_guard():
    intent = detect_river_rafting_intent(
        "What inflatable river SUP board with quick-release torso leash do I need?"
    )
    assert bool(intent) is False


def test_detect_river_rafting_intent_expeditions_list():
    intent = detect_river_rafting_intent("Show me all backcountry whitewater rafting trips")
    assert intent.intent_detected is True
    assert intent.action == "expeditions_list"
    assert intent.confidence >= 0.8


def test_detect_river_rafting_intent_detail_grand_canyon():
    intent = detect_river_rafting_intent(
        "Tell me about the Grand Canyon rafting permit and Colorado river rapids"
    )
    assert intent.intent_detected is True
    assert intent.expedition_id == "colorado-river-grand-canyon"
    assert intent.action == "expedition_detail"


def test_detect_river_rafting_intent_detail_middle_fork():
    intent = detect_river_rafting_intent(
        "Describe the Middle Fork Salmon River oar frame rafting trip"
    )
    assert intent.intent_detected is True
    assert intent.expedition_id == "middle-fork-salmon-river"
    assert intent.action == "expedition_detail"


def test_detect_river_rafting_intent_detail_selway():
    intent = detect_river_rafting_intent("Tell me about Selway River wilderness whitewater rafting")
    assert intent.intent_detected is True
    assert intent.expedition_id == "selway-river-wilderness"
    assert intent.action == "expedition_detail"


def test_detect_river_rafting_intent_detail_rogue():
    intent = detect_river_rafting_intent(
        "Details on Rogue River wilderness rafting and Blossom Bar"
    )
    assert intent.intent_detected is True
    assert intent.expedition_id == "rogue-river-wilderness"
    assert intent.action == "expedition_detail"


def test_detect_river_rafting_intent_detail_gates_of_lodore():
    intent = detect_river_rafting_intent(
        "Information on Gates of Lodore Green River whitewater rafting"
    )
    assert intent.intent_detected is True
    assert intent.expedition_id == "green-river-gates-of-lodore"
    assert intent.action == "expedition_detail"


def test_detect_river_rafting_intent_calculate():
    intent = detect_river_rafting_intent(
        "Calculate oar leverage ratio and hole punch momentum for Grand Canyon rafting"
    )
    assert intent.intent_detected is True
    assert intent.action == "calculate_raft"
    assert intent.expedition_id == "colorado-river-grand-canyon"


def test_detect_river_rafting_intent_gear():
    intent = detect_river_rafting_intent(
        "What mandatory groover and dry box gear do I need for multi-day rafting?"
    )
    assert intent.intent_detected is True
    assert intent.action == "gear_checklist"


# -----------------------------------------------------------------------------
# Prompt Builder & Response Formatter Tests
# -----------------------------------------------------------------------------


def test_build_river_rafting_prompt_list():
    prompt = build_river_rafting_prompt("whitewater rafting")
    assert "Contoso" in prompt
    assert "Grand Canyon" in prompt or "Rafting" in prompt


def test_build_river_rafting_prompt_detail():
    intent = RaftingIntent(
        intent_detected=True,
        expedition_id="middle-fork-salmon-river",
        action="expedition_detail",
    )
    prompt = build_river_rafting_prompt(intent)
    assert "Middle Fork" in prompt
    assert "Salmon" in prompt


def test_format_river_rafting_response_calculation():
    req = RaftCalculationRequest(expedition_id="colorado-river-grand-canyon")
    calc = calculate_river_rafting(req)
    formatted = format_river_rafting_response(calc)
    assert isinstance(formatted, FormattedRiverRaftingResponse)
    assert "Colorado River" in str(formatted)
    assert "river_rafting_info" in formatted
    assert formatted.get("river_rafting_info")["action"] == "calculate_raft"
    assert formatted["river_rafting_info"]["calculation"]["punch_feasibility"] == "punch_clean"


def test_format_river_rafting_response_gear():
    intent = RaftingIntent(intent_detected=True, action="gear_checklist")
    formatted = format_river_rafting_response(intent)
    assert "river_rafting_info" in formatted
    info = formatted.get("river_rafting_info")
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6
    assert info["mandatory_count"] == 6


def test_format_river_rafting_response_detail():
    intent = RaftingIntent(
        intent_detected=True,
        expedition_id="selway-river-wilderness",
        action="expedition_detail",
    )
    formatted = format_river_rafting_response(intent)
    assert "Selway River" in str(formatted)
    info = formatted.get("river_rafting_info")
    assert info["action"] == "expedition_detail"
    assert info["expedition"]["id"] == "selway-river-wilderness"


def test_format_river_rafting_response_list():
    intent = RaftingIntent(intent_detected=True, action="expeditions_list")
    formatted = format_river_rafting_response(intent)
    info = formatted.get("river_rafting_info")
    assert info["action"] == "expeditions_list"
    assert len(info["expeditions"]) == 5
    assert "colorado-river-grand-canyon" in [e["id"] for e in info["expeditions"]]


def test_formatted_river_rafting_response_dict_interface():
    resp = FormattedRiverRaftingResponse("test answer", {"key": "val", "num": 42})
    assert resp["key"] == "val"
    assert "key" in resp
    assert "missing" not in resp
    assert resp.get("num") == 42
    assert resp.get("nonexistent", "default") == "default"
    assert "key" in list(resp.keys())
    assert "val" in list(resp.values())
    assert ("key", "val") in list(resp.items())
    # Substring in str
    assert "test answer" in resp


def test_calculate_river_rafting_oar_rig_recommendation_branches():
    # 16ft raft with ideal leverage ratio (2.0 - 2.4)
    req16 = RaftCalculationRequest(
        expedition_id="green-river-gates-of-lodore",
        raft_length_feet=16.0,
        rigged_payload_kg=500.0,
        oar_length_feet=9.5,
        inboard_leverage_inches=36.0,
        entry_speed_knots=5.0,
    )
    # outboard = 9.5 * 12 - 36 = 78
    # leverage_ratio = 78 / 36 = 2.17 (ideal 2.0 - 2.4)
    res16 = calculate_river_rafting(req16)
    assert "16ft" in res16.oar_rig_recommendation
    assert (
        "ideal" in res16.oar_rig_recommendation.lower()
        or "within" in res16.oar_rig_recommendation.lower()
    )

    # Small raft (<14ft) with low leverage ratio (<1.9)
    req_small = RaftCalculationRequest(
        expedition_id="rogue-river-wilderness",
        raft_length_feet=13.0,
        rigged_payload_kg=250.0,
        oar_length_feet=8.0,
        inboard_leverage_inches=35.0,
        entry_speed_knots=4.0,
    )
    # outboard = 8 * 12 - 35 = 61
    # leverage_ratio = 61 / 35 = 1.74 (< 1.9)
    res_small = calculate_river_rafting(req_small)
    assert "under 14ft" in res_small.oar_rig_recommendation
    assert "low" in res_small.oar_rig_recommendation.lower()

    # 14-15ft raft with high leverage ratio (>2.5)
    req14 = RaftCalculationRequest(
        expedition_id="middle-fork-salmon-river",
        raft_length_feet=14.5,
        rigged_payload_kg=400.0,
        oar_length_feet=9.5,
        inboard_leverage_inches=30.0,
        entry_speed_knots=5.0,
    )
    # outboard = 9.5 * 12 - 30 = 84
    # leverage = 84 / 30 = 2.8 (> 2.5)
    res14 = calculate_river_rafting(req14)
    assert "14ft to 15ft" in res14.oar_rig_recommendation
    assert "high" in res14.oar_rig_recommendation.lower()


def test_build_river_rafting_prompt_calculate_and_gear():
    calc_intent = RaftingIntent(intent_detected=True, action="calculate_raft")
    calc_prompt = build_river_rafting_prompt(calc_intent)
    assert "Calculate oar leverage ratio" in calc_prompt

    gear_intent = RaftingIntent(intent_detected=True, action="gear_checklist")
    gear_prompt = build_river_rafting_prompt(gear_intent)
    assert "Checklist" in gear_prompt

    # Query with explicit intent arg
    custom_prompt = build_river_rafting_prompt("grand canyon", intent=calc_intent)
    assert "Calculate" in custom_prompt


def test_format_river_rafting_response_dict_and_string_inputs():
    # Dict input
    dict_input = {"intent_detected": True, "action": "expeditions_list"}
    resp_dict = format_river_rafting_response(dict_input)
    assert resp_dict.get("river_rafting_info")["action"] == "expeditions_list"

    # String input
    resp_str = format_river_rafting_response("calculate oar leverage for grand canyon")
    assert resp_str.get("river_rafting_info")["action"] == "calculate_raft"
