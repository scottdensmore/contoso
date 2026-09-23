import pytest
from contoso_chat.big_wall import (
    BigWallGearRequirement,
    BigWallIntent,
    BigWallRouteModel,
    FormattedBigWallResponse,
    HaulCalculationRequest,
    HaulCalculationResponse,
    build_big_wall_prompt,
    calculate_haul_effort,
    detect_big_wall_intent,
    extract_big_wall_intent,
    format_big_wall_response,
    get_big_wall_gear,
    get_big_wall_route_by_id,
    get_big_wall_routes,
)

# -----------------------------------------------------------------------------
# Pydantic Model Tests
# -----------------------------------------------------------------------------


def test_big_wall_route_model():
    route = BigWallRouteModel(
        id="test-route",
        name="Test Big Wall Route",
        location="Yosemite Valley, CA",
        grade="Grade VI 5.9 C2",
        aid_rating="C2",
        pitches=25,
        height_meters=800,
        recommended_days=3,
        typical_pig_weight_kg=75.0,
        description="A thrilling aid climbing line.",
        highlights=["King Swing", "Great Roof"],
    )
    assert route.id == "test-route"
    assert route.name == "Test Big Wall Route"
    assert route.pitches == 25
    assert route.height_meters == 800
    assert route.aid_rating == "C2"
    assert route.typical_pig_weight_kg == 75.0
    assert len(route.highlights) == 2


def test_haul_calculation_request_defaults():
    req = HaulCalculationRequest()
    assert req.route_id is None
    assert req.pig_weight_kg == 70.0
    assert req.haul_system == "2:1_mechanical_advantage"
    assert req.wall_angle == "vertical"
    assert req.climber_weight_kg == 75.0


def test_haul_calculation_response_model():
    resp = HaulCalculationResponse(
        route_name="The Nose — El Capitan",
        effective_pull_force_kg=40.6,
        mechanical_advantage_ratio=2.0,
        friction_coefficient=0.15,
        counterweight_sufficient=True,
        haul_effort_level="moderate",
        recommended_technique="Counterweight space hauling with foot-loop ascender and bodyweight drops.",
        safety_warning=None,
    )
    assert resp.route_name == "The Nose — El Capitan"
    assert resp.effective_pull_force_kg == 40.6
    assert resp.counterweight_sufficient is True
    assert resp.haul_effort_level == "moderate"
    assert resp.safety_warning is None


def test_big_wall_gear_requirement_model():
    gear = BigWallGearRequirement(
        id="test-gear",
        name="Test Portaledge",
        category="portaledge",
        mandatory=True,
        description="High strength portaledge for multi-day walls.",
    )
    assert gear.id == "test-gear"
    assert gear.category == "portaledge"
    assert gear.mandatory is True


def test_big_wall_intent_model():
    intent = BigWallIntent(
        intent_detected=True,
        route_id="el-capitan-nose",
        action="calculate_haul",
        confidence=0.95,
    )
    assert intent.intent_detected is True
    assert intent.route_id == "el-capitan-nose"
    assert intent.action == "calculate_haul"
    assert intent.confidence == 0.95


# -----------------------------------------------------------------------------
# Catalog Tests (5 Iconic Big Wall Routes)
# -----------------------------------------------------------------------------


def test_get_big_wall_routes_catalog():
    routes = get_big_wall_routes()
    assert len(routes) == 5
    route_ids = [r.id for r in routes]
    assert "el-capitan-nose" in route_ids
    assert "half-dome-regular-northwest" in route_ids
    assert "fisher-towers-titan" in route_ids
    assert "zion-prodigal-son" in route_ids
    assert "leaning-tower-west-face" in route_ids


def test_get_big_wall_routes_filter_by_aid_rating():
    c2_routes = get_big_wall_routes(aid_rating="C2")
    assert len(c2_routes) == 2
    c2_ids = [r.id for r in c2_routes]
    assert "el-capitan-nose" in c2_ids
    assert "zion-prodigal-son" in c2_ids

    c1_routes = get_big_wall_routes(aid_rating="C1")
    assert len(c1_routes) == 1
    assert c1_routes[0].id == "half-dome-regular-northwest"

    a2_routes = get_big_wall_routes(aid_rating="A2+")
    assert len(a2_routes) == 1
    assert a2_routes[0].id == "fisher-towers-titan"

    c2f_routes = get_big_wall_routes(aid_rating="C2F")
    assert len(c2f_routes) == 1
    assert c2f_routes[0].id == "leaning-tower-west-face"


def test_get_big_wall_route_by_id():
    nose = get_big_wall_route_by_id("el-capitan-nose")
    assert nose is not None
    assert nose.id == "el-capitan-nose"
    assert "The Nose" in nose.name
    assert nose.pitches == 31
    assert nose.height_meters == 1000
    assert nose.typical_pig_weight_kg == 85.0
    assert len(nose.highlights) >= 3

    titan = get_big_wall_route_by_id("fisher-towers-titan")
    assert titan is not None
    assert titan.aid_rating == "A2+"
    assert titan.pitches == 4

    assert get_big_wall_route_by_id("non-existent-route") is None


# -----------------------------------------------------------------------------
# Gear Checklist Tests (6 Mandatory Safety Kit Items)
# -----------------------------------------------------------------------------


def test_get_big_wall_gear():
    gear = get_big_wall_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    gear_ids = [g.id for g in gear]
    assert "full-portaledge-storm-fly" in gear_ids
    assert "progress-capture-hauling-pulley" in gear_ids
    assert "adjustable-daisy-chains-etriers" in gear_ids
    assert "beak-and-cam-hook-set" in gear_ids
    assert "haul-bag-pig-dry-containment" in gear_ids
    assert "aluminum-waste-haul-tube" in gear_ids


# -----------------------------------------------------------------------------
# Calculation Engine Tests
# -----------------------------------------------------------------------------


def test_calculate_haul_effort_low():
    # 3:1 Z-rig on vertical wall with 60kg pig -> (60 * 1.15) / 2.4 = 28.75 -> 28.8 kg (< 35 => low)
    req = HaulCalculationRequest(
        route_id="leaning-tower-west-face",
        pig_weight_kg=60.0,
        haul_system="3:1_z_rig",
        wall_angle="vertical",
        climber_weight_kg=75.0,
    )
    res = calculate_haul_effort(req)
    assert res.effective_pull_force_kg == 28.8
    assert res.mechanical_advantage_ratio == 3.0
    assert res.friction_coefficient == 0.15
    assert res.counterweight_sufficient is True
    assert res.haul_effort_level == "low"
    assert "Direct 1:1 bodyweight squat haul" in res.recommended_technique
    assert res.safety_warning is None


def test_calculate_haul_effort_moderate():
    # 2:1 MA on vertical wall with 60kg pig -> (60 * 1.15) / 1.7 = 40.588 -> 40.6 kg (35 <= x < 60 => moderate)
    req = HaulCalculationRequest(
        route_id="leaning-tower-west-face",
        pig_weight_kg=60.0,
        haul_system="2:1_mechanical_advantage",
        wall_angle="vertical",
        climber_weight_kg=75.0,
    )
    res = calculate_haul_effort(req)
    assert res.effective_pull_force_kg == 40.6
    assert res.mechanical_advantage_ratio == 2.0
    assert res.friction_coefficient == 0.15
    assert res.counterweight_sufficient is True
    assert res.haul_effort_level == "moderate"
    assert "Counterweight space hauling" in res.recommended_technique


def test_calculate_haul_effort_strenuous():
    # 1:1 direct on vertical wall with 55kg pig -> (55 * 1.15) / 0.9 = 63.25 / 0.9 = 70.3 kg (60 <= x < 90 => strenuous)
    req = HaulCalculationRequest(
        route_id="half-dome-regular-northwest",
        pig_weight_kg=55.0,
        haul_system="1:1_direct",
        wall_angle="vertical",
        climber_weight_kg=75.0,
    )
    res = calculate_haul_effort(req)
    assert res.effective_pull_force_kg == 70.3
    assert res.counterweight_sufficient is True
    assert res.haul_effort_level == "strenuous"
    assert "2:1 mechanical advantage assisted hauling" in res.recommended_technique


def test_calculate_haul_effort_extreme_and_warnings():
    # 1:1 direct on slab with 110kg double pig -> (110 * 1.35) / 0.9 = 165.0 kg
    # Climber weight 70kg -> counterweight_sufficient is False
    req = HaulCalculationRequest(
        route_id="el-capitan-nose",
        pig_weight_kg=110.0,
        haul_system="1:1_direct",
        wall_angle="slab",
        climber_weight_kg=70.0,
    )
    res = calculate_haul_effort(req)
    assert res.effective_pull_force_kg == 165.0
    assert res.counterweight_sufficient is False
    assert res.haul_effort_level == "extreme_two_person"
    assert "Two-person synchronized" in res.recommended_technique
    assert res.safety_warning is not None
    assert "Effective pull force exceeds climber bodyweight" in res.safety_warning
    assert "Heavy bag dragging on slab" in res.safety_warning
    assert "Expedition double-pig load" in res.safety_warning


def test_calculate_haul_effort_overhanging_and_roof():
    # Overhanging friction = 0.02
    req_oh = HaulCalculationRequest(
        route_id="leaning-tower-west-face",
        pig_weight_kg=50.0,
        haul_system="2:1_mechanical_advantage",
        wall_angle="overhanging",
        climber_weight_kg=75.0,
    )
    res_oh = calculate_haul_effort(req_oh)
    assert res_oh.friction_coefficient == 0.02
    assert res_oh.effective_pull_force_kg == round((50.0 * 1.02) / 1.7, 1)

    # Roof friction = 0.0
    req_roof = HaulCalculationRequest(
        route_id="leaning-tower-west-face",
        pig_weight_kg=50.0,
        haul_system="1:1_direct",
        wall_angle="roof",
        climber_weight_kg=75.0,
    )
    res_roof = calculate_haul_effort(req_roof)
    assert res_roof.friction_coefficient == 0.0
    assert res_roof.effective_pull_force_kg == round(50.0 / 0.9, 1)


def test_calculate_haul_effort_default_route():
    req = HaulCalculationRequest()
    res = calculate_haul_effort(req)
    assert res.route_name == "The Nose — El Capitan"


def test_calculate_haul_effort_invalid_route():
    req = HaulCalculationRequest(route_id="unknown-wall")
    with pytest.raises(ValueError, match="not found"):
        calculate_haul_effort(req)


# -----------------------------------------------------------------------------
# Intent Detection Tests
# -----------------------------------------------------------------------------


def test_detect_big_wall_intent_routes_list():
    i = detect_big_wall_intent("What are the best big wall aid climbing routes?")
    assert i is not None
    assert i.intent_detected is True
    assert i.action == "routes_list"


def test_detect_big_wall_intent_route_detail():
    i1 = detect_big_wall_intent("Tell me about climbing The Nose on El Capitan")
    assert i1 is not None
    assert i1.action == "route_detail"
    assert i1.route_id == "el-capitan-nose"

    i2 = detect_big_wall_intent("Regular Northwest Face of Half Dome portaledge bivy")
    assert i2 is not None
    assert i2.action == "route_detail"
    assert i2.route_id == "half-dome-regular-northwest"

    i3 = detect_big_wall_intent("Fisher Towers The Titan finger of fate aid rating")
    assert i3 is not None
    assert i3.action == "route_detail"
    assert i3.route_id == "fisher-towers-titan"

    i4 = detect_big_wall_intent("Prodigal Son Zion big wall aid climbing")
    assert i4 is not None
    assert i4.action == "route_detail"
    assert i4.route_id == "zion-prodigal-son"

    i5 = detect_big_wall_intent("Leaning Tower West Face overhanging wall haul")
    assert i5 is not None
    assert i5.action == "route_detail"
    assert i5.route_id == "leaning-tower-west-face"


def test_detect_big_wall_intent_calculate_haul():
    i = detect_big_wall_intent(
        "Calculate haul effort and mechanical advantage for 85kg pig on El Capitan"
    )
    assert i is not None
    assert i.action == "calculate_haul"
    assert i.route_id == "el-capitan-nose"


def test_detect_big_wall_intent_gear_checklist():
    i = detect_big_wall_intent(
        "What is the mandatory big wall gear checklist for portaledge and hauling pig?"
    )
    assert i is not None
    assert i.action == "gear_checklist"


def test_detect_big_wall_intent_aid_keywords():
    assert detect_big_wall_intent("clean aid cam hook and birdbeak placement") is not None
    assert detect_big_wall_intent("how to use etriers and jumaring on big wall") is not None
    assert detect_big_wall_intent("copperheads and peckers on aid routes") is not None
    assert detect_big_wall_intent("waste haul tube ethics on big walls") is not None


def test_extract_big_wall_intent_alias():
    assert extract_big_wall_intent("El Capitan big wall") is not None


def test_detect_big_wall_intent_disambiguation_guards():
    assert detect_big_wall_intent("") is None
    assert detect_big_wall_intent("Where is my order #12345?") is None
    assert detect_big_wall_intent("I need a refund and return label for my boots") is None
    assert detect_big_wall_intent("What is the shipping tracking status?") is None
    assert (
        detect_big_wall_intent("What are the day pass prices for the local bouldering gym?") is None
    )
    assert detect_big_wall_intent("Indoor climbing gym membership fees") is None
    assert (
        detect_big_wall_intent("Sport climbing quickdraws and climbing harness for local crag")
        is None
    )
    assert detect_big_wall_intent("Hiking trails for a gentle Sunday walk") is None
    assert detect_big_wall_intent("Nice trail run in the foothills") is None
    assert detect_big_wall_intent("I just need quickdraws for a day out") is None
    assert detect_big_wall_intent("just enjoying the sunny weather outside") is None


# -----------------------------------------------------------------------------
# Prompt Building & Response Formatting Tests
# -----------------------------------------------------------------------------


def test_build_big_wall_prompt():
    intent = BigWallIntent(action="routes_list")
    prompt = build_big_wall_prompt(intent)
    assert "Big Wall" in prompt
    assert "El Capitan" in prompt
    assert "portaledge" in prompt.lower()
    assert "hauling" in prompt.lower()


def test_build_big_wall_prompt_variants():
    # route_detail
    i_detail = BigWallIntent(action="route_detail", route_id="el-capitan-nose")
    p_detail = build_big_wall_prompt(i_detail)
    assert "The Nose — El Capitan" in p_detail

    # calculate_haul
    i_calc = BigWallIntent(action="calculate_haul", route_id="leaning-tower-west-face")
    p_calc = build_big_wall_prompt(i_calc)
    assert "Calculate" in p_calc or "mechanical advantage" in p_calc

    # gear_checklist
    i_gear = BigWallIntent(action="gear_checklist")
    p_gear = build_big_wall_prompt(i_gear)
    assert "gear" in p_gear.lower()


def test_format_big_wall_response_routes_list():
    intent = BigWallIntent(action="routes_list")
    res = format_big_wall_response(intent, "List big wall routes")
    assert isinstance(res, FormattedBigWallResponse)
    assert "big_wall_info" in res
    assert "answer" in res
    assert res.get("big_wall_info")["action"] == "routes_list"
    assert "The Nose" in res.get("answer")


def test_format_big_wall_response_route_detail():
    intent = BigWallIntent(action="route_detail", route_id="half-dome-regular-northwest")
    res = format_big_wall_response(intent, "Tell me about Half Dome Regular Northwest")
    assert "Half Dome" in res.get("answer")
    assert res.get("big_wall_info")["action"] == "route_detail"


def test_format_big_wall_response_calculate_haul():
    intent = BigWallIntent(action="calculate_haul", route_id="el-capitan-nose")
    res = format_big_wall_response(intent, "Calculate haul for Nose")
    assert "Haul Calculation" in res.get("answer") or "Effective Pull Force" in res.get("answer")
    assert res.get("big_wall_info")["action"] == "calculate_haul"


def test_format_big_wall_response_gear_checklist():
    intent = BigWallIntent(action="gear_checklist")
    res = format_big_wall_response(intent, "Big wall gear checklist")
    assert "Portaledge" in res.get("answer")
    assert res.get("big_wall_info")["action"] == "gear_checklist"


def test_format_big_wall_response_fallback():
    intent = BigWallIntent(action="unknown_action")
    res = format_big_wall_response(intent, "General big wall question")
    assert "iconic" in res.get("answer").lower()


def test_formatted_big_wall_response_dict_methods():
    raw_data = {"big_wall_info": {"test": 456}, "status": "ok"}
    resp = FormattedBigWallResponse("Big wall answer", raw_data)
    assert resp["big_wall_info"] == {"test": 456}
    assert resp["status"] == "ok"
    assert "big_wall_info" in resp
    assert "missing" not in resp
    assert "big_wall_info" in list(resp.keys())
    assert {"test": 456} in list(resp.values())
    assert ("status", "ok") in list(resp.items())
    assert resp[0] == "B"
    assert (123 in resp) is False
