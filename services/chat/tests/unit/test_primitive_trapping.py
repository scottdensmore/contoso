import pytest
from contoso_chat.primitive_trapping import (
    FormattedTrappingResponse,
    TrappingCalculationRequest,
    TrappingCalculationResponse,
    TrappingIntent,
    TrappingMechanismModel,
    TrappingSafetyItemModel,
    calculate_primitive_trapping,
    detect_primitive_trapping_intent,
    format_primitive_trapping_response,
    get_trapping_mechanism,
    get_trapping_mechanisms,
    get_trapping_safety_gear,
)


def test_trapping_mechanism_model():
    mech = TrappingMechanismModel(
        mechanism_id="figure-4-deadfall",
        title="Classic All-Wood Figure-4 Deadfall",
        category="deadfall",
        cordage_required=False,
        sensitivity_rating="moderate",
        quarry_suitability="Cottontail, ground squirrel, small mammals",
        description="Ancient and reliable self-supporting deadfall trigger crafted from three notched interlocking wooden sticks requiring zero cordage.",
        highlights=[
            "Interlocking three-stick geometry",
            "Zero cordage reliance using split wood",
            "Adjustable bait stick horizontal reach",
        ],
    )
    assert mech.mechanism_id == "figure-4-deadfall"
    assert mech.category == "deadfall"
    assert mech.cordage_required is False
    assert mech.sensitivity_rating == "moderate"
    assert len(mech.highlights) == 3


def test_get_trapping_mechanisms_catalog():
    mechanisms = get_trapping_mechanisms()
    assert len(mechanisms) == 5
    ids = [m.mechanism_id for m in mechanisms]
    assert "figure-4-deadfall" in ids
    assert "paiute-deadfall" in ids
    assert "promontory-peg-snare" in ids
    assert "spring-pole-snare" in ids
    assert "rolling-log-deadfall" in ids


def test_get_trapping_mechanisms_category_filter():
    deadfalls = get_trapping_mechanisms(category="deadfall")
    assert len(deadfalls) == 3
    assert all(m.category == "deadfall" for m in deadfalls)

    snares = get_trapping_mechanisms(category="snare")
    assert len(snares) == 2
    assert all(m.category == "snare" for m in snares)


def test_get_trapping_mechanism_by_id():
    m = get_trapping_mechanism("figure-4-deadfall")
    assert m is not None
    assert m.title == "Classic All-Wood Figure-4 Deadfall"
    assert m.cordage_required is False

    m_paiute = get_trapping_mechanism("paiute-deadfall")
    assert m_paiute is not None
    assert m_paiute.cordage_required is True
    assert m_paiute.sensitivity_rating == "hair_trigger"

    assert get_trapping_mechanism("nonexistent-mechanism") is None


def test_get_trapping_safety_gear():
    gear = get_trapping_safety_gear()
    assert len(gear) == 6
    assert all(isinstance(item, TrappingSafetyItemModel) for item in gear)
    assert all(item.mandatory is True for item in gear)

    expected_ids = [
        "carving-bushcraft-knife",
        "tarred-bank-line",
        "inert-training-peg-set",
        "safety-flagging-tape",
        "spring-wire-snare-gauge",
        "survival-regulations-guide",
    ]
    actual_ids = [item.item_id for item in gear]
    for expected_id in expected_ids:
        assert expected_id in actual_ids


def test_calculate_primitive_trapping_humane_instant():
    # snowshoe_hare = 3.5 lbs; 18.0 / 3.5 = 5.14 >= 5.0 -> humane_instant_dispatch
    # notch_depth_mm = 4.0 -> optimal_sensitivity
    # figure-4 multiplier = 0.8 -> 4.0 * 0.8 = 3.2 oz
    req = TrappingCalculationRequest(
        mechanism_id="figure-4-deadfall",
        quarry="snowshoe_hare",
        deadfall_weight_lbs=18.0,
        notch_depth_mm=4.0,
        cordage_type="tarred_bankline",
    )
    res = calculate_primitive_trapping(req)
    assert isinstance(res, TrappingCalculationResponse)
    assert res.mechanism_id == "figure-4-deadfall"
    assert res.quarry == "snowshoe_hare"
    assert res.quarry_weight_lbs == 3.5
    assert res.deadfall_weight_lbs == 18.0
    assert res.weight_ratio == pytest.approx(5.14, rel=1e-2)
    assert res.lethality_status == "humane_instant_dispatch"
    assert res.sensitivity_status == "optimal_sensitivity"
    assert res.estimated_trip_force_oz == pytest.approx(3.2, rel=1e-2)
    assert len(res.legal_ethics_advisory) > 0


def test_calculate_primitive_trapping_sufficient():
    # snowshoe_hare = 3.5 lbs; 12.0 / 3.5 = 3.43 >= 3.0 and < 5.0 -> sufficient
    req = TrappingCalculationRequest(
        mechanism_id="figure-4-deadfall",
        quarry="snowshoe_hare",
        deadfall_weight_lbs=12.0,
        notch_depth_mm=4.0,
    )
    res = calculate_primitive_trapping(req)
    assert res.lethality_status == "sufficient"
    assert res.weight_ratio == pytest.approx(3.43, rel=1e-2)


def test_calculate_primitive_trapping_underweight_risk():
    # snowshoe_hare = 3.5 lbs; 8.0 / 3.5 = 2.29 < 3.0 -> underweight_cruelty_risk
    req = TrappingCalculationRequest(
        mechanism_id="figure-4-deadfall",
        quarry="snowshoe_hare",
        deadfall_weight_lbs=8.0,
        notch_depth_mm=4.0,
    )
    res = calculate_primitive_trapping(req)
    assert res.lethality_status == "underweight_cruelty_risk"
    assert res.weight_ratio == pytest.approx(2.29, rel=1e-2)


def test_calculate_primitive_trapping_sensitivity_levels():
    # notch < 3.0 -> hair_trigger_premature_release
    req_hair = TrappingCalculationRequest(
        mechanism_id="figure-4-deadfall",
        quarry="cottontail",
        deadfall_weight_lbs=15.0,
        notch_depth_mm=2.5,
    )
    res_hair = calculate_primitive_trapping(req_hair)
    assert res_hair.sensitivity_status == "hair_trigger_premature_release"

    # notch <= 6.0 and >= 3.0 -> optimal_sensitivity
    req_opt = TrappingCalculationRequest(
        mechanism_id="figure-4-deadfall",
        quarry="cottontail",
        deadfall_weight_lbs=15.0,
        notch_depth_mm=6.0,
    )
    res_opt = calculate_primitive_trapping(req_opt)
    assert res_opt.sensitivity_status == "optimal_sensitivity"

    # notch > 6.0 -> overly_stiff_miss_risk
    req_stiff = TrappingCalculationRequest(
        mechanism_id="figure-4-deadfall",
        quarry="cottontail",
        deadfall_weight_lbs=15.0,
        notch_depth_mm=6.5,
    )
    res_stiff = calculate_primitive_trapping(req_stiff)
    assert res_stiff.sensitivity_status == "overly_stiff_miss_risk"


def test_calculate_primitive_trapping_trip_force_multipliers():
    # notch_depth_mm = 5.0
    # paiute: 5.0 * 0.3 = 1.5 oz
    req_paiute = TrappingCalculationRequest(
        mechanism_id="paiute-deadfall",
        notch_depth_mm=5.0,
    )
    assert calculate_primitive_trapping(req_paiute).estimated_trip_force_oz == pytest.approx(1.5, rel=1e-2)

    # promontory: 5.0 * 0.6 = 3.0 oz
    req_prom = TrappingCalculationRequest(
        mechanism_id="promontory-peg-snare",
        notch_depth_mm=5.0,
    )
    assert calculate_primitive_trapping(req_prom).estimated_trip_force_oz == pytest.approx(3.0, rel=1e-2)

    # spring-pole: 5.0 * 0.4 = 2.0 oz
    req_spring = TrappingCalculationRequest(
        mechanism_id="spring-pole-snare",
        notch_depth_mm=5.0,
    )
    assert calculate_primitive_trapping(req_spring).estimated_trip_force_oz == pytest.approx(2.0, rel=1e-2)

    # rolling-log: 5.0 * 1.5 = 7.5 oz
    req_roll = TrappingCalculationRequest(
        mechanism_id="rolling-log-deadfall",
        notch_depth_mm=5.0,
    )
    assert calculate_primitive_trapping(req_roll).estimated_trip_force_oz == pytest.approx(7.5, rel=1e-2)


def test_quarry_standards():
    # ground_squirrel: 1.2 lbs
    res_sq = calculate_primitive_trapping(
        TrappingCalculationRequest(quarry="ground_squirrel", deadfall_weight_lbs=6.0)
    )
    assert res_sq.quarry_weight_lbs == 1.2
    assert res_sq.weight_ratio == pytest.approx(5.0, rel=1e-2)

    # grouse_ptarmigan: 1.8 lbs
    res_gr = calculate_primitive_trapping(
        TrappingCalculationRequest(quarry="grouse_ptarmigan", deadfall_weight_lbs=5.4)
    )
    assert res_gr.quarry_weight_lbs == 1.8
    assert res_gr.weight_ratio == pytest.approx(3.0, rel=1e-2)

    # cottontail: 2.5 lbs
    res_cot = calculate_primitive_trapping(
        TrappingCalculationRequest(quarry="cottontail", deadfall_weight_lbs=12.5)
    )
    assert res_cot.quarry_weight_lbs == 2.5
    assert res_cot.weight_ratio == pytest.approx(5.0, rel=1e-2)


def test_detect_primitive_trapping_intent():
    # Mechanisms list
    i1 = detect_primitive_trapping_intent("What primitive trapping mechanisms and deadfall traps can I build?")
    assert i1 is not None
    assert i1.action == "mechanisms_list"

    # Category filter
    i2 = detect_primitive_trapping_intent("Show me primitive cordage snare mechanisms")
    assert i2 is not None
    assert i2.action == "mechanisms_list"
    assert i2.category == "snare"

    # Mechanism detail
    i3 = detect_primitive_trapping_intent("How does the Paiute deadfall hair trigger toggle work?")
    assert i3 is not None
    assert i3.action == "mechanism_detail"
    assert i3.mechanism_id == "paiute-deadfall"

    i4 = detect_primitive_trapping_intent("Explain the figure-4 deadfall trap trigger")
    assert i4 is not None
    assert i4.action == "mechanism_detail"
    assert i4.mechanism_id == "figure-4-deadfall"

    # Calculation
    i5 = detect_primitive_trapping_intent("Calculate deadfall stone weight ratio and trip force for snowshoe hare")
    assert i5 is not None
    assert i5.action in ("calculate_trapping", "calculate")

    # Gear / Safety
    i6 = detect_primitive_trapping_intent("What safety gear and flagging tape is needed for survival trapping practice?")
    assert i6 is not None
    assert i6.action == "gear_checklist"


def test_disambiguation():
    # Must NOT trigger on general bushcraft
    assert detect_primitive_trapping_intent("How do I make a friction fire with a bow drill?") is None
    assert detect_primitive_trapping_intent("How to construct a birch bark vessel and boil stones?") is None
    assert detect_primitive_trapping_intent("Carving a try stick with Mors Kochanski notches") is None

    # Must NOT trigger on animal tracking
    assert detect_primitive_trapping_intent("How do I identify wolf tracks in compacted mud?") is None
    assert detect_primitive_trapping_intent("Estimate track age and gait stride of cougar spoor") is None

    # Must NOT trigger on wilderness shelters
    assert detect_primitive_trapping_intent("How do I dig an alpine snow cave with a cold-air well?") is None
    assert detect_primitive_trapping_intent("Constructing a winter quinzhee snow shelter") is None

    # Must NOT trigger on wildlife bear safety
    assert detect_primitive_trapping_intent("How to deploy bear spray when encountering a grizzly bear?") is None
    assert detect_primitive_trapping_intent("Proper bear canister food hanging techniques") is None

    # Must NOT trigger on customer orders
    assert detect_primitive_trapping_intent("What is the status of my order tracking and refund?") is None


def test_format_primitive_trapping_response():
    # Test with TrappingCalculationResponse
    req = TrappingCalculationRequest(
        mechanism_id="figure-4-deadfall",
        quarry="snowshoe_hare",
        deadfall_weight_lbs=15.0,
        notch_depth_mm=4.0,
    )
    calc = calculate_primitive_trapping(req)
    resp = format_primitive_trapping_response(calc)
    assert isinstance(resp, FormattedTrappingResponse)
    assert "Figure-4" in str(resp) or "figure-4" in str(resp).lower()
    assert "primitive_trapping_info" in resp
    assert resp["primitive_trapping_info"]["action"] in ("calculate_trapping", "calculate")

    # Test with gear intent
    intent_gear = TrappingIntent(action="gear_checklist")
    resp_gear = format_primitive_trapping_response(intent_gear)
    assert "primitive_trapping_info" in resp_gear
    assert "gear" in resp_gear["primitive_trapping_info"] or "items" in resp_gear["primitive_trapping_info"]
    assert "carving-bushcraft-knife" in str(resp_gear) or "Knife" in str(resp_gear)

    # Test with dict input (as required by requirement 1)
    data_dict = {
        "primitive_trapping_info": {"status": "ok", "details": "test"},
        "answer": "Primitive trapping details test answer",
    }
    resp_dict = format_primitive_trapping_response(data_dict)
    assert isinstance(resp_dict, FormattedTrappingResponse)
    assert str(resp_dict) == "Primitive trapping details test answer"
    assert resp_dict.get("primitive_trapping_info")["status"] == "ok"
