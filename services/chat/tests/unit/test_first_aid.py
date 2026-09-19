from contoso_chat.first_aid import (
    FirstAidIntent,
    KitCalcRequest,
    KitCalcResponse,
    KitItemModel,
    MedicalConditionModel,
    TriageRequest,
    TriageResponse,
    assess_wilderness_triage,
    build_first_aid_prompt,
    calculate_first_aid_kit,
    detect_first_aid_intent,
    format_first_aid_response,
    get_evacuation_safety_protocol,
    get_medical_condition_by_id,
    get_medical_conditions,
)


def test_medical_condition_model():
    model = MedicalConditionModel(
        condition_id="hypothermia",
        title="Hypothermia & Cold Exposure",
        category="environmental",
        severity="Critical",
        symptoms=["uncontrollable shivering", "slurred speech"],
        field_treatments=["Dry clothing", "Burrito wrap"],
        evacuation_urgency="Urgent",
        red_flag_signs=["Shivering stops", "Loss of consciousness"],
    )
    assert model.condition_id == "hypothermia"
    assert model.title == "Hypothermia & Cold Exposure"
    assert model.category == "environmental"
    assert model.severity == "Critical"
    assert len(model.symptoms) == 2
    assert len(model.field_treatments) == 2
    assert model.evacuation_urgency == "Urgent"
    assert len(model.red_flag_signs) == 2


def test_kit_models():
    item = KitItemModel(
        name="Sterile Gauze Pads (4x4 in)",
        category="Wound Care",
        quantity=12,
        essential=True,
        notes="For bleeding control",
    )
    assert item.name == "Sterile Gauze Pads (4x4 in)"
    assert item.category == "Wound Care"
    assert item.quantity == 12
    assert item.essential is True

    req = KitCalcRequest(party_size=4, trip_days=5)
    assert req.party_size == 4
    assert req.trip_days == 5

    res = KitCalcResponse(
        party_size=4,
        trip_days=5,
        total_items=item.quantity,
        items=[item],
    )
    assert res.party_size == 4
    assert res.trip_days == 5
    assert res.total_items == 12
    assert len(res.items) == 1


def test_triage_models():
    req = TriageRequest(
        symptoms=["shivering", "slurred speech"],
        injury_type="cold exposure",
        is_conscious=True,
        can_walk=False,
    )
    assert req.symptoms == ["shivering", "slurred speech"]
    assert req.injury_type == "cold exposure"
    assert req.is_conscious is True
    assert req.can_walk is False

    res = TriageResponse(
        condition_match="Hypothermia & Cold Exposure",
        severity="Critical",
        evacuation_urgency="Immediate",
        immediate_action="Shelter and warm patient immediately",
        treatment_steps=["Wrap in sleeping bag", "Apply gentle heat"],
        sar_recommended=True,
    )
    assert res.condition_match == "Hypothermia & Cold Exposure"
    assert res.sar_recommended is True


def test_get_medical_conditions_catalog():
    all_conds = get_medical_conditions()
    assert len(all_conds) == 5

    ids = [c.condition_id for c in all_conds]
    assert "hypothermia" in ids
    assert "heat-stroke" in ids
    assert "altitude-sickness" in ids
    assert "musculoskeletal-fractures" in ids
    assert "anaphylaxis" in ids

    # Category filter
    env_conds = get_medical_conditions(category="environmental")
    assert len(env_conds) == 3
    env_ids = [c.condition_id for c in env_conds]
    assert "hypothermia" in env_ids
    assert "heat-stroke" in env_ids
    assert "altitude-sickness" in env_ids

    # Severity filter
    crit_conds = get_medical_conditions(severity="critical")
    assert len(crit_conds) >= 3


def test_get_medical_condition_by_id():
    hypo = get_medical_condition_by_id("hypothermia")
    assert hypo is not None
    assert "Hypothermia" in hypo.title

    # Alias / case-insensitive
    ams = get_medical_condition_by_id("altitude-sickness")
    assert ams is not None
    assert "Mountain Sickness" in ams.title or "AMS" in ams.title

    frac = get_medical_condition_by_id("fractures")
    assert frac is not None
    assert "Fractures" in frac.title

    ana = get_medical_condition_by_id("anaphylaxis")
    assert ana is not None
    assert "Anaphylaxis" in ana.title

    # Non-existent
    assert get_medical_condition_by_id("alien-virus") is None


def test_assess_wilderness_triage_hypothermia_non_ambulatory():
    req = TriageRequest(
        symptoms=["uncontrollable shivering", "fumbling hands"],
        is_conscious=True,
        can_walk=False,
    )
    res = assess_wilderness_triage(req)
    assert "Hypothermia" in res.condition_match
    assert res.sar_recommended is True
    assert len(res.immediate_action) > 0
    assert len(res.treatment_steps) >= 3
    assert "evacuat" in res.evacuation_urgency.lower() or res.evacuation_urgency in ("Immediate", "Urgent")


def test_assess_wilderness_triage_anaphylaxis():
    req = TriageRequest(
        symptoms=["facial swelling", "wheezing", "hives"],
        is_conscious=True,
        can_walk=True,
    )
    res = assess_wilderness_triage(req)
    assert "Anaphylaxis" in res.condition_match
    assert res.sar_recommended is True
    assert res.evacuation_urgency == "Immediate"
    assert any("epinephrine" in step.lower() or "epipen" in step.lower() for step in res.treatment_steps)


def test_assess_wilderness_triage_unconscious_patient():
    req = TriageRequest(
        symptoms=["hot dry skin", "confusion"],
        injury_type="heat",
        is_conscious=False,
        can_walk=False,
    )
    res = assess_wilderness_triage(req)
    assert res.sar_recommended is True
    assert res.evacuation_urgency == "Immediate"


def test_calculate_first_aid_kit_scaling():
    # Base 2 persons, 3 days
    req_small = KitCalcRequest(party_size=2, trip_days=3)
    res_small = calculate_first_aid_kit(req_small)
    assert res_small.party_size == 2
    assert res_small.trip_days == 3
    assert res_small.total_items > 0
    assert len(res_small.items) >= 10

    # Scaled 4 persons, 5 days
    req_large = KitCalcRequest(party_size=4, trip_days=5)
    res_large = calculate_first_aid_kit(req_large)
    assert res_large.party_size == 4
    assert res_large.trip_days == 5
    assert res_large.total_items > res_small.total_items

    # Verify scaled items
    items_large = {it.name.lower(): it.quantity for it in res_large.items}
    gauze_qty = next((q for name, q in items_large.items() if "gauze" in name), 0)
    assert gauze_qty >= 16

    splint_qty = next((q for name, q in items_large.items() if "splint" in name), 0)
    assert splint_qty >= 2

    blister_qty = next((q for name, q in items_large.items() if "blister" in name), 0)
    assert blister_qty >= 16

    med_qty = next((q for name, q in items_large.items() if "ibuprofen" in name or "medication" in name), 0)
    assert med_qty >= 20


def test_get_evacuation_safety_protocol():
    proto = get_evacuation_safety_protocol()
    assert "satellite_sos" in proto
    assert "helicopter_lz" in proto
    assert "ground_evacuation" in proto

    sos = proto["satellite_sos"]
    assert "trigger_criteria" in sos
    assert "transmission_protocol" in sos
    assert len(sos["trigger_criteria"]) > 0

    lz = proto["helicopter_lz"]
    assert "site_selection" in lz
    assert "ground_preparation" in lz
    assert "signaling_and_approach" in lz


def test_detect_first_aid_intent():
    # Triage intent
    intent_triage = detect_first_aid_intent("A hiker fell, has severe shivering and cannot walk")
    assert intent_triage is not None
    assert intent_triage.action == "triage"
    assert intent_triage.condition_id == "hypothermia"

    # Kit calculator intent
    intent_kit = detect_first_aid_intent("What first aid kit supplies do I need for 4 people on a 5-day backpacking trip?")
    assert intent_kit is not None
    assert intent_kit.action == "kit_calc"
    assert intent_kit.party_size == 4
    assert intent_kit.trip_days == 5

    # SAR evac intent
    intent_sar = detect_first_aid_intent("How do I set up a helicopter landing zone for emergency evacuation?")
    assert intent_sar is not None
    assert intent_sar.action == "sar_evac"

    # Protocol intent
    intent_proto = detect_first_aid_intent("What are the wilderness emergency first aid protocols?")
    assert intent_proto is not None
    assert intent_proto.action in ("protocol", "sar_evac", "conditions")

    # Conditions intent
    intent_cond = detect_first_aid_intent("Tell me about environmental conditions like altitude sickness")
    assert intent_cond is not None
    assert intent_cond.action == "conditions"
    assert intent_cond.condition_id == "altitude-sickness" or intent_cond.category == "environmental"

    # Irrelevant query
    assert detect_first_aid_intent("Do you sell green tents in size Large?") is None


def test_build_first_aid_prompt():
    intent = FirstAidIntent(action="triage", condition_id="hypothermia")
    prompt = build_first_aid_prompt(intent)
    assert "Wilderness First Aid" in prompt or "Backcountry Medical" in prompt
    assert "Hypothermia" in prompt
    assert "Evacuation" in prompt or "SAR" in prompt


def test_format_first_aid_response():
    # Triage format
    intent_triage = FirstAidIntent(action="triage", condition_id="hypothermia")
    res_triage = format_first_aid_response(intent_triage)
    assert "answer" in res_triage
    assert "first_aid_info" in res_triage
    assert res_triage["first_aid_info"]["action"] == "triage"
    assert "triage" in res_triage["first_aid_info"]

    # Kit calc format
    intent_kit = FirstAidIntent(action="kit_calc", party_size=3, trip_days=4)
    res_kit = format_first_aid_response(intent_kit)
    assert "answer" in res_kit
    assert "first_aid_info" in res_kit
    assert res_kit["first_aid_info"]["action"] == "kit_calc"
    assert "kit" in res_kit["first_aid_info"]

    # Evacuation protocol format
    intent_sar = FirstAidIntent(action="sar_evac")
    res_sar = format_first_aid_response(intent_sar)
    assert "answer" in res_sar
    assert "first_aid_info" in res_sar
    assert res_sar["first_aid_info"]["action"] == "sar_evac"
    assert "protocol" in res_sar["first_aid_info"]
