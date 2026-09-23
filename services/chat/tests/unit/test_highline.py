import pytest
from contoso_chat.highline import (
    HighlineGearRequirement,
    HighlineIntent,
    HighlineSpanModel,
    RiggingCalculationRequest,
    RiggingCalculationResponse,
    build_highline_prompt,
    calculate_rigging_physics,
    extract_highline_intent,
    format_highline_response,
    get_highline_gear,
    get_highline_span_by_id,
    get_highline_spans,
)


def test_highline_span_model():
    span = HighlineSpanModel(
        span_id="test-span",
        title="Test Abyss Highline",
        region="Cascades, WA",
        span_length_m=50.0,
        void_exposure_m=200.0,
        difficulty="advanced",
        primary_webbing="Type 18 Polyester",
        backup_webbing="Dyneema QuickBraid",
        nominal_tension_kn=3.5,
        anchor_system="Bolted equalization masterpoint",
        wind_exposure="moderate",
        description="A test alpine span.",
        highlights=["Sheer exposure", "Alpine wind"],
    )
    assert span.span_id == "test-span"
    assert span.span_length_m == 50.0
    assert span.void_exposure_m == 200.0
    assert span.nominal_tension_kn == 3.5
    assert len(span.highlights) == 2


def test_rigging_calculation_models_defaults():
    req = RiggingCalculationRequest(span_id="yosemite-taft-point-highline")
    assert req.span_id == "yosemite-taft-point-highline"
    assert req.walker_weight_kg == 75.0
    assert req.standing_sag_percent == 6.0
    assert req.dynamic_load_factor == 1.8
    assert req.anchor_angle_degrees == 45.0

    resp = RiggingCalculationResponse(
        span_id="yosemite-taft-point-highline",
        span_title="Taft Point Highline",
        center_sag_m=3.9,
        line_tension_kn=5.56,
        anchor_leg_load_kn=3.01,
        webbing_safety_factor=5.4,
        min_void_clearance_m=846.1,
        rigging_advisory="Equalized anchors nominal",
        safety_status="safe",
    )
    assert resp.center_sag_m == 3.9
    assert resp.line_tension_kn == 5.56
    assert resp.safety_status == "safe"


def test_highline_gear_requirement_model():
    gear = HighlineGearRequirement(
        item_id="highline-leash-dual-rings",
        name="Dynamic Highline Leash with Dual Forged Aluminum Rings",
        category="personal_safety",
        mandatory=True,
        purpose="Redundant fall-arrest tether linking walker harness to primary and backup webbings.",
    )
    assert gear.item_id == "highline-leash-dual-rings"
    assert gear.mandatory is True


def test_get_highline_spans_all():
    spans = get_highline_spans()
    assert len(spans) == 5
    ids = [s.span_id for s in spans]
    assert "yosemite-taft-point-highline" in ids
    assert "moab-fruit-bowl-canyon" in ids
    assert "smith-rock-monkey-face-highline" in ids
    assert "castle-valley-rectory-span" in ids
    assert "index-town-walls-practice-highline" in ids


def test_get_highline_spans_difficulty_filter():
    beginner = get_highline_spans(difficulty="beginner")
    assert len(beginner) == 1
    assert beginner[0].span_id == "index-town-walls-practice-highline"

    intermediate = get_highline_spans(difficulty="intermediate")
    assert len(intermediate) == 1
    assert intermediate[0].span_id == "smith-rock-monkey-face-highline"

    advanced = get_highline_spans(difficulty="advanced")
    assert len(advanced) == 1
    assert advanced[0].span_id == "moab-fruit-bowl-canyon"

    expert = get_highline_spans(difficulty="expert")
    assert len(expert) == 2
    expert_ids = [s.span_id for s in expert]
    assert "yosemite-taft-point-highline" in expert_ids
    assert "castle-valley-rectory-span" in expert_ids


def test_get_highline_span_by_id_found():
    span = get_highline_span_by_id("moab-fruit-bowl-canyon")
    assert span is not None
    assert span.span_id == "moab-fruit-bowl-canyon"
    assert "Fruit Bowl" in span.title
    assert span.span_length_m == 110.0
    assert span.void_exposure_m == 140.0
    assert span.difficulty == "advanced"
    assert len(span.highlights) >= 3


def test_get_highline_span_by_id_not_found():
    assert get_highline_span_by_id("non-existent-span") is None


def test_get_highline_gear():
    gear = get_highline_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    gear_ids = [g.item_id for g in gear]
    assert "highline-leash-dual-rings" in gear_ids
    assert "independent-backup-webbing" in gear_ids
    assert "weblock-anchor-devices" in gear_ids
    assert "buckingham-pulley-system" in gear_ids
    assert "heavy-duty-edge-pads" in gear_ids
    assert "wind-dampener-wind-sock" in gear_ids


def test_calculate_rigging_physics_standard():
    req = RiggingCalculationRequest(
        span_id="yosemite-taft-point-highline",
        walker_weight_kg=75.0,
        standing_sag_percent=6.0,
        dynamic_load_factor=1.8,
        anchor_angle_degrees=45.0,
    )
    res = calculate_rigging_physics(req)
    assert res.span_id == "yosemite-taft-point-highline"
    assert res.span_title == "Taft Point Highline"
    assert res.center_sag_m == 3.9
    assert 5.0 <= res.line_tension_kn <= 6.0
    assert 2.5 <= res.anchor_leg_load_kn <= 3.5
    assert res.webbing_safety_factor >= 5.0
    assert res.min_void_clearance_m > 800.0
    assert res.safety_status == "safe"
    assert "Center sag" in res.rigging_advisory
    assert "safety factor" in res.rigging_advisory.lower()


def test_calculate_rigging_physics_critical_angle():
    # 120 degree anchor angle doubles load per leg relative to half-split, equaling line tension
    req = RiggingCalculationRequest(
        span_id="moab-fruit-bowl-canyon",
        walker_weight_kg=80.0,
        standing_sag_percent=4.0,
        dynamic_load_factor=2.0,
        anchor_angle_degrees=120.0,
    )
    res = calculate_rigging_physics(req)
    assert res.span_id == "moab-fruit-bowl-canyon"
    # At 120 degrees, anchor leg load equals line tension
    assert abs(res.anchor_leg_load_kn - res.line_tension_kn) < 0.1
    assert res.safety_status in ("caution", "critical_hazard")
    assert "angle" in res.rigging_advisory.lower()


def test_calculate_rigging_physics_low_sag_high_tension():
    # Very tight line (2% sag) results in extreme tension and low safety factor
    req = RiggingCalculationRequest(
        span_id="castle-valley-rectory-span",
        walker_weight_kg=90.0,
        standing_sag_percent=2.0,
        dynamic_load_factor=2.2,
        anchor_angle_degrees=90.0,
    )
    res = calculate_rigging_physics(req)
    assert res.line_tension_kn > 15.0
    assert res.webbing_safety_factor < 3.0
    assert res.safety_status == "critical_hazard"


def test_calculate_rigging_physics_invalid_span():
    req = RiggingCalculationRequest(span_id="non-existent-span")
    with pytest.raises(ValueError, match="not found"):
        calculate_rigging_physics(req)


def test_extract_highline_intent_keywords():
    intent = extract_highline_intent("Tell me about alpine highline spans")
    assert intent is not None
    assert intent.action == "spans_list"

    intent_calc = extract_highline_intent(
        "Calculate line tension, standing sag, and anchor equalization for highline rigging"
    )
    assert intent_calc is not None
    assert intent_calc.action == "calculate_rigging"

    intent_gear = extract_highline_intent(
        "What is the mandatory highline rigging kit compliance checklist?"
    )
    assert intent_gear is not None
    assert intent_gear.action == "gear_checklist"


def test_extract_highline_intent_spans():
    intent_taft = extract_highline_intent("Tell me about the Yosemite Taft Point highline")
    assert intent_taft is not None
    assert intent_taft.span_id == "yosemite-taft-point-highline"
    assert intent_taft.action == "span_detail"

    intent_fruit = extract_highline_intent("Details on Fruit Bowl highline in Moab")
    assert intent_fruit is not None
    assert intent_fruit.span_id == "moab-fruit-bowl-canyon"
    assert intent_fruit.action == "span_detail"

    intent_monkey = extract_highline_intent(
        "Calculate webbing sag and tension for Monkey Face highline"
    )
    assert intent_monkey is not None
    assert intent_monkey.span_id == "smith-rock-monkey-face-highline"
    assert intent_monkey.action == "calculate_rigging"

    intent_rectory = extract_highline_intent(
        "Rigging gear for Castle Valley Rectory spire highline"
    )
    assert intent_rectory is not None
    assert intent_rectory.span_id == "castle-valley-rectory-span"

    intent_index = extract_highline_intent("Index town walls practice highline for beginners")
    assert intent_index is not None
    assert intent_index.span_id == "index-town-walls-practice-highline"


def test_extract_highline_intent_exclusions():
    # Must NOT hijack rock climbing
    assert (
        extract_highline_intent(
            "What climbing shoes and chalk bag should I bring for sport climbing?"
        )
        is None
    )
    # Must NOT hijack ice climbing
    assert (
        extract_highline_intent("What ice screws and crampons do I need for WI4 ice climbing?")
        is None
    )
    # Must NOT hijack via ferrata
    assert (
        extract_highline_intent("Tell me about the Telluride via ferrata route and lanyard?")
        is None
    )
    # Must NOT hijack canyoneering
    assert (
        extract_highline_intent("What rope rigging is required for the Subway slot canyon in Zion?")
        is None
    )
    # Must NOT hijack customer support
    assert extract_highline_intent("Where is my order #54321 shipment tracking?") is None


def test_format_highline_response_spans_list():
    intent = HighlineIntent(action="spans_list")
    resp = format_highline_response(intent)
    assert isinstance(resp, str)
    assert "Taft Point" in str(resp) or "Highline" in str(resp)
    assert resp.get("highline_info") is not None
    assert resp["highline_info"]["action"] == "spans_list"
    assert len(resp["highline_info"]["spans"]) == 5


def test_format_highline_response_span_detail():
    intent = HighlineIntent(action="span_detail", span_id="yosemite-taft-point-highline")
    resp = format_highline_response(intent)
    assert isinstance(resp, str)
    assert "Taft Point" in str(resp)
    assert resp.get("highline_info") is not None
    assert resp["highline_info"]["action"] == "span_detail"
    assert resp["highline_info"]["span_id"] == "yosemite-taft-point-highline"


def test_format_highline_response_calculate_rigging():
    intent = HighlineIntent(action="calculate_rigging", span_id="moab-fruit-bowl-canyon")
    resp = format_highline_response(intent)
    assert isinstance(resp, str)
    assert "sag" in str(resp).lower() or "tension" in str(resp).lower()
    info = resp.get("highline_info")
    assert info is not None
    assert info["action"] == "calculate_rigging"
    assert "line_tension_kn" in info


def test_format_highline_response_gear_checklist():
    intent = HighlineIntent(action="gear_checklist")
    resp = format_highline_response(intent)
    assert isinstance(resp, str)
    assert (
        "weblock" in str(resp).lower()
        or "leash" in str(resp).lower()
        or "gear" in str(resp).lower()
    )
    info = resp.get("highline_info")
    assert info is not None
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6


def test_build_highline_prompt():
    prompt_list = build_highline_prompt(HighlineIntent(action="spans_list"))
    assert "Highline" in prompt_list
    assert "Taft Point" in prompt_list

    prompt_detail = build_highline_prompt(
        HighlineIntent(action="span_detail", span_id="smith-rock-monkey-face-highline")
    )
    assert "Monkey Face" in prompt_detail

    prompt_calc = build_highline_prompt(
        HighlineIntent(action="calculate_rigging", span_id="moab-fruit-bowl-canyon")
    )
    assert "Rigging Physics" in prompt_calc or "Fruit Bowl" in prompt_calc

    prompt_gear = build_highline_prompt(HighlineIntent(action="gear_checklist"))
    assert "Mandatory" in prompt_gear or "Gear" in prompt_gear


def test_formatted_highline_response_methods():
    resp = format_highline_response(HighlineIntent(action="spans_list"))
    assert "answer" in resp
    assert "highline_info" in resp
    assert "nonexistent_key" not in resp
    assert resp.get("nonexistent_key") is None
    assert list(resp.keys()) == ["answer", "highline_info"]
    assert len(list(resp.values())) == 2
    assert len(list(resp.items())) == 2
    assert resp["answer"]
    assert resp[0] == str(resp)[0]
