import pytest
from contoso_chat.via_ferrata import (
    RiggingPlanRequest,
    RiggingPlanResponse,
    ViaFerrataGearRequirement,
    ViaFerrataIntent,
    build_via_ferrata_prompt,
    calculate_rigging_plan,
    detect_via_ferrata_intent,
    format_via_ferrata_response,
    get_via_ferrata_gear,
    get_via_ferrata_route_by_id,
    get_via_ferrata_routes,
)


def test_get_via_ferrata_routes_all():
    routes = get_via_ferrata_routes()
    assert len(routes) == 5
    ids = [r.route_id for r in routes]
    assert "telluride-via-ferrata" in ids
    assert "mount-olympus-iron-way" in ids
    assert "ouray-via-ferrata-gold-mountain" in ids
    assert "whistler-peak-via-ferrata" in ids
    assert "mammoth-mountain-iron-crest" in ids


def test_get_via_ferrata_route_by_id_found():
    route = get_via_ferrata_route_by_id("telluride-via-ferrata")
    assert route is not None
    assert route.title == "Telluride Via Ferrata"
    assert "San Juan" in route.region
    assert route.distance_km == 3.2
    assert route.vertical_gain_m == 185
    assert route.grade == "grade_c_difficult"
    assert route.cable_length_m == 1200
    assert route.exposure_level == "high"
    assert route.typical_duration_hours == 3.5
    assert route.suspension_bridge_span_m == 0
    assert route.rest_lanyard_recommended is True
    assert "The Main Event sheer ledge traverse" in route.highlights


def test_get_via_ferrata_route_by_id_not_found():
    route = get_via_ferrata_route_by_id("non-existent-route")
    assert route is None


def test_get_via_ferrata_routes_grade_filter():
    grade_b = get_via_ferrata_routes(grade="grade_b_moderately_difficult")
    assert len(grade_b) == 2
    grade_b_ids = [r.route_id for r in grade_b]
    assert "mount-olympus-iron-way" in grade_b_ids
    assert "whistler-peak-via-ferrata" in grade_b_ids

    grade_c = get_via_ferrata_routes(grade="grade_c")
    assert len(grade_c) == 1
    assert grade_c[0].route_id == "telluride-via-ferrata"

    grade_d = get_via_ferrata_routes(grade="d")
    assert len(grade_d) == 1
    assert grade_d[0].route_id == "ouray-via-ferrata-gold-mountain"

    grade_e = get_via_ferrata_routes(grade="grade_e_extremely_difficult")
    assert len(grade_e) == 1
    assert grade_e[0].route_id == "mammoth-mountain-iron-crest"


def test_calculate_rigging_plan_standard():
    req = RiggingPlanRequest(
        route_id="telluride-via-ferrata",
        climber_weight_kg=75.0,
        has_heavy_backpack=False,
        energy_absorber_type="tearing_webbing_en958",
        rest_lanyard_attached=True,
    )
    plan = calculate_rigging_plan(req)
    assert isinstance(plan, RiggingPlanResponse)
    assert plan.route_id == "telluride-via-ferrata"
    assert plan.effective_weight_kg == 75.0
    assert plan.weight_status in ("within_en958_range", "optimal_en958_range")
    assert plan.lanyard_safety_status == "certified_safe"
    assert plan.en958_compliant is True
    assert 3.5 <= plan.estimated_impact_force_kn <= 6.0
    assert "attached" in plan.rest_lanyard_advisory.lower()
    assert "fall factor" in plan.safety_notice.lower()


def test_calculate_rigging_plan_heavy_backpack():
    req = RiggingPlanRequest(
        route_id="telluride-via-ferrata",
        climber_weight_kg=70.0,
        has_heavy_backpack=True,
        energy_absorber_type="tearing_webbing_en958",
        rest_lanyard_attached=True,
    )
    plan = calculate_rigging_plan(req)
    assert plan.effective_weight_kg == 80.0
    assert plan.en958_compliant is True


def test_calculate_rigging_plan_underweight():
    req = RiggingPlanRequest(
        route_id="mount-olympus-iron-way",
        climber_weight_kg=35.0,
        has_heavy_backpack=False,
        energy_absorber_type="tearing_webbing_en958",
        rest_lanyard_attached=True,
    )
    plan = calculate_rigging_plan(req)
    assert plan.effective_weight_kg == 35.0
    assert "underweight" in plan.weight_status
    assert plan.en958_compliant is False
    assert plan.lanyard_safety_status == "weight_out_of_spec"


def test_calculate_rigging_plan_overweight():
    req = RiggingPlanRequest(
        route_id="ouray-via-ferrata-gold-mountain",
        climber_weight_kg=125.0,
        has_heavy_backpack=False,
        energy_absorber_type="tearing_webbing_en958",
        rest_lanyard_attached=True,
    )
    plan = calculate_rigging_plan(req)
    assert plan.effective_weight_kg == 125.0
    assert "overweight" in plan.weight_status
    assert plan.en958_compliant is False
    assert plan.lanyard_safety_status == "weight_out_of_spec"


def test_calculate_rigging_plan_non_en958_absorber():
    req = RiggingPlanRequest(
        route_id="telluride-via-ferrata",
        climber_weight_kg=75.0,
        energy_absorber_type="static_sling",
        rest_lanyard_attached=True,
    )
    plan = calculate_rigging_plan(req)
    assert plan.en958_compliant is False
    assert plan.lanyard_safety_status == "critical_hazard"
    assert plan.estimated_impact_force_kn > 10.0


def test_calculate_rigging_plan_rest_lanyard_not_attached_recommended():
    req = RiggingPlanRequest(
        route_id="telluride-via-ferrata",
        climber_weight_kg=75.0,
        rest_lanyard_attached=False,
    )
    plan = calculate_rigging_plan(req)
    assert "warning" in plan.rest_lanyard_advisory.lower() or "not attached" in plan.rest_lanyard_advisory.lower()


def test_calculate_rigging_plan_rest_lanyard_not_attached_not_recommended():
    req = RiggingPlanRequest(
        route_id="mount-olympus-iron-way",
        climber_weight_kg=75.0,
        rest_lanyard_attached=False,
    )
    plan = calculate_rigging_plan(req)
    assert "not attached" in plan.rest_lanyard_advisory.lower()


def test_calculate_rigging_plan_unknown_route():
    req = RiggingPlanRequest(route_id="invalid-route")
    with pytest.raises(ValueError, match="not found"):
        calculate_rigging_plan(req)


def test_get_via_ferrata_gear_list():
    gear = get_via_ferrata_gear()
    assert len(gear) == 6
    assert all(isinstance(g, ViaFerrataGearRequirement) for g in gear)
    assert all(g.mandatory for g in gear)
    gear_ids = [g.item_id for g in gear]
    assert "en958-energy-absorber-lanyard" in gear_ids
    assert "locking-via-ferrata-carabiners" in gear_ids
    assert "climbing-harness-tested" in gear_ids
    assert "climbing-helmet-en12492" in gear_ids
    assert "rest-sling-carabiner" in gear_ids
    assert "sticky-approach-shoes-gloves" in gear_ids


def test_detect_via_ferrata_intent_keywords():
    intent1 = detect_via_ferrata_intent("What is the protocol for via ferrata ascents?")
    assert intent1 is not None
    assert intent1.action in ("routes_list", "route_detail", "gear_checklist")

    intent2 = detect_via_ferrata_intent("Looking for an alpine iron way with cable route protection")
    assert intent2 is not None

    intent3 = detect_via_ferrata_intent("How does an EN 958 energy absorber tearing lanyard work?")
    assert intent3 is not None
    assert intent3.action in ("rigging_plan", "gear_checklist")

    intent4 = detect_via_ferrata_intent("Do you have Type K auto-locking carabiners?")
    assert intent4 is not None

    intent5 = detect_via_ferrata_intent("Tell me about stepping irons cable routes and klettersteig")
    assert intent5 is not None


def test_detect_via_ferrata_intent_routes():
    intent_t = detect_via_ferrata_intent("Tell me about the Telluride via ferrata route")
    assert intent_t is not None
    assert intent_t.route_id == "telluride-via-ferrata"

    intent_o = detect_via_ferrata_intent("Details on Ouray via ferrata Gold Mountain")
    assert intent_o is not None
    assert intent_o.route_id == "ouray-via-ferrata-gold-mountain"

    intent_oly = detect_via_ferrata_intent("Mount Olympus iron way ridge information")
    assert intent_oly is not None
    assert intent_oly.route_id == "mount-olympus-iron-way"

    intent_w = detect_via_ferrata_intent("Whistler peak via ferrata guide")
    assert intent_w is not None
    assert intent_w.route_id == "whistler-peak-via-ferrata"

    intent_m = detect_via_ferrata_intent("Tell me about Mammoth mountain iron crest via ferrata")
    assert intent_m is not None
    assert intent_m.route_id == "mammoth-mountain-iron-crest"


def test_detect_via_ferrata_intent_actions():
    plan_intent = detect_via_ferrata_intent("Calculate via ferrata rigging plan and fall factor impact for telluride")
    assert plan_intent is not None
    assert plan_intent.action == "rigging_plan"
    assert plan_intent.route_id == "telluride-via-ferrata"

    gear_intent = detect_via_ferrata_intent("What mandatory gear and checklist do I need for via ferrata?")
    assert gear_intent is not None
    assert gear_intent.action == "gear_checklist"

    detail_intent = detect_via_ferrata_intent("Tell me details and highlights about ouray via ferrata")
    assert detail_intent is not None
    assert detail_intent.action == "route_detail"
    assert detail_intent.route_id == "ouray-via-ferrata-gold-mountain"

    list_intent = detect_via_ferrata_intent("Show me all via ferrata routes catalog")
    assert list_intent is not None
    assert list_intent.action == "routes_list"


def test_detect_via_ferrata_intent_guardrails_rock_climbing():
    assert detect_via_ferrata_intent("Looking for rock climbing crags and trad climbing routes") is None
    assert detect_via_ferrata_intent("Where can I find sport climbing and bouldering?") is None
    assert detect_via_ferrata_intent("Do I need a camalot for this climbing route?") is None
    assert detect_via_ferrata_intent("I need a chalk bag and a belay partner") is None


def test_detect_via_ferrata_intent_guardrails_glacier():
    assert detect_via_ferrata_intent("Glacier mountaineering crevasse rescue rope team") is None
    assert detect_via_ferrata_intent("How to self arrest with an ice axe and crampons") is None


def test_detect_via_ferrata_intent_guardrails_ecommerce():
    assert detect_via_ferrata_intent("What is the status of my order #12345?") is None
    assert detect_via_ferrata_intent("Can I get a return label for my refund?") is None


def test_build_via_ferrata_prompt_with_route():
    intent = ViaFerrataIntent(action="route_detail", route_id="telluride-via-ferrata")
    prompt = build_via_ferrata_prompt(intent)
    assert "Via Ferrata" in prompt
    assert "Telluride" in prompt
    assert "EN 958:2017" in prompt
    assert "Type K" in prompt


def test_build_via_ferrata_prompt_routes_list():
    intent = ViaFerrataIntent(action="routes_list")
    prompt = build_via_ferrata_prompt(intent)
    assert "Via Ferrata" in prompt
    assert "Telluride" in prompt
    assert "Ouray" in prompt


def test_format_via_ferrata_response_rigging_plan():
    intent = ViaFerrataIntent(action="rigging_plan", route_id="telluride-via-ferrata")
    res = format_via_ferrata_response(intent)
    assert "answer" in res
    assert "via_ferrata_info" in res
    info = res["via_ferrata_info"]
    assert info["action"] == "rigging_plan"
    assert info["plan"]["route_id"] == "telluride-via-ferrata"


def test_format_via_ferrata_response_route_detail():
    intent = ViaFerrataIntent(action="route_detail", route_id="ouray-via-ferrata-gold-mountain")
    res = format_via_ferrata_response(intent)
    assert "answer" in res
    assert "via_ferrata_info" in res
    info = res["via_ferrata_info"]
    assert info["action"] == "route_detail"
    assert info["route"]["route_id"] == "ouray-via-ferrata-gold-mountain"


def test_format_via_ferrata_response_gear_checklist():
    intent = ViaFerrataIntent(action="gear_checklist")
    res = format_via_ferrata_response(intent)
    assert "answer" in res
    assert "via_ferrata_info" in res
    info = res["via_ferrata_info"]
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6


def test_format_via_ferrata_response_routes_list():
    intent = ViaFerrataIntent(action="routes_list")
    res = format_via_ferrata_response(intent)
    assert "answer" in res
    assert "via_ferrata_info" in res
    info = res["via_ferrata_info"]
    assert info["action"] == "routes_list"
    assert len(info["routes"]) == 5


def test_detect_via_ferrata_intent_empty():
    assert detect_via_ferrata_intent("") is None
    assert detect_via_ferrata_intent("   ") is None


def test_detect_via_ferrata_intent_grades():
    assert detect_via_ferrata_intent("Show me grade a via ferrata routes").grade == "grade_a_easy"
    assert detect_via_ferrata_intent("Show me grade b via ferrata routes").grade == "grade_b_moderately_difficult"
    assert detect_via_ferrata_intent("Show me grade c via ferrata routes").grade == "grade_c_difficult"
    assert detect_via_ferrata_intent("Show me grade d via ferrata routes").grade == "grade_d_very_difficult"
    assert detect_via_ferrata_intent("Show me grade e via ferrata routes").grade == "grade_e_extremely_difficult"


def test_get_via_ferrata_routes_edge_grades():
    assert len(get_via_ferrata_routes(grade="grade_a")) == 0
    assert len(get_via_ferrata_routes(grade="non_matching_grade")) == 0


def test_build_via_ferrata_prompt_with_grade():
    intent = ViaFerrataIntent(action="routes_list", grade="grade_c_difficult")
    prompt = build_via_ferrata_prompt(intent)
    assert "Matching grade_c_difficult Routes" in prompt


def test_format_via_ferrata_response_rigging_plan_invalid_route_fallback():
    intent = ViaFerrataIntent(action="rigging_plan", route_id="invalid-route")
    res = format_via_ferrata_response(intent)
    assert res["via_ferrata_info"]["action"] == "routes_list"
