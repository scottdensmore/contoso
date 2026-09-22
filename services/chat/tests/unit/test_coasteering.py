import pytest
from contoso_chat.coasteering import (
    CoasteeringGearRequirement,
    CoasteeringIntent,
    CoasteeringRouteModel,
    JumpSafetyRequest,
    JumpSafetyResponse,
    build_coasteering_prompt,
    calculate_jump_safety,
    detect_coasteering_intent,
    format_coasteering_response,
    get_coasteering_gear,
    get_coasteering_route_by_id,
    get_coasteering_routes,
)


def test_route_models_and_defaults():
    route = CoasteeringRouteModel(
        route_id="test-route",
        title="Test Sea Cliff",
        region="California Coast",
        distance_km=2.5,
        typical_duration_hours=3.0,
        coasteering_grade="grade_2_moderate_coastal",
        max_jump_height_m=5.0,
        sea_cave_count=2,
        water_temp_f=55,
        tide_window="mid_tide",
        min_water_depth_m=4.0,
        description="A great ocean traverse.",
        highlights=["Caves", "Jumps"],
    )
    assert route.route_id == "test-route"
    assert route.sea_cave_count == 2
    assert len(route.highlights) == 2

    req = JumpSafetyRequest(route_id="test-route")
    assert req.jump_height_m == 5.0
    assert req.water_depth_m == 4.5
    assert req.water_aerated_with_foam is False


def test_get_coasteering_routes_all():
    routes = get_coasteering_routes()
    assert len(routes) == 5
    route_ids = [r.route_id for r in routes]
    assert "point-lobos-granite-coves" in route_ids
    assert "depoe-bay-spouting-horn-surge" in route_ids
    assert "acadia-otter-cliffs-traverse" in route_ids
    assert "la-jolla-coves-caves-traverse" in route_ids
    assert "cape-flattery-pacific-surge" in route_ids


def test_get_coasteering_routes_filter_grade_1():
    routes = get_coasteering_routes(grade="grade_1_sheltered_cove")
    assert len(routes) == 1
    assert routes[0].route_id == "la-jolla-coves-caves-traverse"


def test_get_coasteering_routes_filter_grade_2():
    routes = get_coasteering_routes(grade="grade_2")
    assert len(routes) == 2
    ids = [r.route_id for r in routes]
    assert "point-lobos-granite-coves" in ids
    assert "acadia-otter-cliffs-traverse" in ids


def test_get_coasteering_routes_filter_grade_3():
    routes = get_coasteering_routes(grade="grade_3_advanced_swell")
    assert len(routes) == 1
    assert routes[0].route_id == "depoe-bay-spouting-horn-surge"


def test_get_coasteering_routes_filter_grade_4():
    routes = get_coasteering_routes(grade="grade_4_extreme_surge")
    assert len(routes) == 1
    assert routes[0].route_id == "cape-flattery-pacific-surge"


def test_get_coasteering_route_by_id_success():
    route = get_coasteering_route_by_id("point-lobos-granite-coves")
    assert route is not None
    assert route.title == "Point Lobos Granite Headlands Traverse"
    assert route.region == "Carmel, CA"
    assert route.distance_km == 2.8
    assert route.typical_duration_hours == 3.0
    assert route.coasteering_grade == "grade_2_moderate_coastal"
    assert route.max_jump_height_m == 5.5
    assert route.sea_cave_count == 2
    assert route.min_water_depth_m == 4.0


def test_get_coasteering_route_by_id_not_found():
    route = get_coasteering_route_by_id("non-existent-coasteering-route")
    assert route is None


def test_get_coasteering_gear_checklist():
    gear = get_coasteering_gear()
    assert len(gear) == 6
    item_ids = [g.item_id for g in gear]
    assert "high-impact-watersports-helmet" in item_ids
    assert "reinforced-steamer-wetsuit" in item_ids
    assert "high-buoyancy-coasteering-pfd" in item_ids
    assert "sticky-rubber-water-boots" in item_ids
    assert "neoprene-impact-gloves" in item_ids
    assert "coasteering-throwline-whistle" in item_ids

    helmet = next(g for g in gear if g.item_id == "high-impact-watersports-helmet")
    assert "EN 1385" in helmet.name
    assert isinstance(helmet, CoasteeringGearRequirement)
    assert helmet.mandatory is True

    pfd = next(g for g in gear if g.item_id == "high-buoyancy-coasteering-pfd")
    assert "50N+" in pfd.name
    assert pfd.mandatory is True


def test_calculate_jump_safety_safe_conditions():
    req = JumpSafetyRequest(
        route_id="point-lobos-granite-coves",
        jump_height_m=4.0,
        water_depth_m=5.5,
        swell_height_m=1.0,
        swell_period_seconds=14.0,
        tide_state="slack_water",
        water_aerated_with_foam=False,
    )
    res = calculate_jump_safety(req)
    assert isinstance(res, JumpSafetyResponse)
    assert res.safety_status == "safe_jump_conditions"
    assert res.depth_margin_m > 0
    assert "Nominal water density" in res.aeration_impact_notice
    assert "OPTIMAL SURGE WINDOW" in res.surge_timing_advisory


def test_calculate_jump_safety_shallow_water_hazard():
    req = JumpSafetyRequest(
        route_id="point-lobos-granite-coves",
        jump_height_m=6.0,
        water_depth_m=3.0,
        swell_height_m=1.0,
        swell_period_seconds=12.0,
        tide_state="slack_water",
        water_aerated_with_foam=False,
    )
    res = calculate_jump_safety(req)
    assert res.safety_status == "hazard_shallow_water"
    assert res.depth_margin_m < 0


def test_calculate_jump_safety_aerated_foam_extra_depth():
    req_calm = JumpSafetyRequest(
        route_id="depoe-bay-spouting-horn-surge",
        jump_height_m=5.0,
        water_depth_m=5.5,
        swell_height_m=1.2,
        swell_period_seconds=12.0,
        water_aerated_with_foam=False,
    )
    res_calm = calculate_jump_safety(req_calm)

    req_foam = JumpSafetyRequest(
        route_id="depoe-bay-spouting-horn-surge",
        jump_height_m=5.0,
        water_depth_m=5.5,
        swell_height_m=1.2,
        swell_period_seconds=12.0,
        water_aerated_with_foam=True,
    )
    res_foam = calculate_jump_safety(req_foam)

    assert res_foam.min_required_depth_m > res_calm.min_required_depth_m
    assert "CRITICAL BUOYANCY REDUCTION" in res_foam.aeration_impact_notice
    assert res_foam.depth_margin_m < res_calm.depth_margin_m


def test_calculate_jump_safety_extreme_swell_warning():
    req = JumpSafetyRequest(
        route_id="cape-flattery-pacific-surge",
        jump_height_m=5.0,
        water_depth_m=7.0,
        swell_height_m=2.5,
        swell_period_seconds=8.0,
        tide_state="slack_water",
        water_aerated_with_foam=False,
    )
    res = calculate_jump_safety(req)
    assert res.safety_status == "hazard_extreme_swell"
    assert "EXTREME SWELL HAZARD" in res.surge_timing_advisory


def test_calculate_jump_safety_marginal_depth():
    req = JumpSafetyRequest(
        route_id="point-lobos-granite-coves",
        jump_height_m=4.0,
        water_depth_m=4.2,
        swell_height_m=1.0,
        swell_period_seconds=12.0,
        tide_state="slack_water",
        water_aerated_with_foam=False,
    )
    res = calculate_jump_safety(req)
    assert res.safety_status == "caution_marginal_depth"
    assert 0 <= res.depth_margin_m < 0.5


def test_calculate_jump_safety_route_not_found():
    req = JumpSafetyRequest(route_id="non-existent-route")
    with pytest.raises(ValueError, match="not found"):
        calculate_jump_safety(req)


def test_detect_coasteering_intent_routes():
    intent = detect_coasteering_intent("Show me coastal sea cliff coasteering routes")
    assert intent is not None
    assert intent.action == "routes"


def test_detect_coasteering_intent_route_detail():
    intent = detect_coasteering_intent("What is the max jump height and caves at Depoe Bay cliffs?")
    assert intent is not None
    assert intent.action == "route_detail"
    assert intent.route_id == "depoe-bay-spouting-horn-surge"


def test_detect_coasteering_intent_jump_safety():
    intent = detect_coasteering_intent("Verify cliff jump safety, depth margin, and swell timing for Point Lobos")
    assert intent is not None
    assert intent.action == "jump_safety"
    assert intent.route_id == "point-lobos-granite-coves"


def test_detect_coasteering_intent_gear():
    intent = detect_coasteering_intent("What protective equipment, wetsuit, and watersports helmet do I need for coasteering?")
    assert intent is not None
    assert intent.action == "gear_checklist"


def test_detect_coasteering_intent_grade_filter():
    intent = detect_coasteering_intent("Show me grade 4 extreme surge coasteering routes")
    assert intent is not None
    assert intent.action == "routes"
    assert intent.grade == "grade_4_extreme_surge"


def test_detect_coasteering_intent_all_routes_recognition():
    i1 = detect_coasteering_intent("Tell me about Point Lobos coasteering traverse")
    assert i1 is not None and i1.route_id == "point-lobos-granite-coves"

    i2 = detect_coasteering_intent("Tell me about Depoe Bay cliffs and spouting horn surge")
    assert i2 is not None and i2.route_id == "depoe-bay-spouting-horn-surge"

    i3 = detect_coasteering_intent("Explore Acadia otter cliffs coasteering traverse")
    assert i3 is not None and i3.route_id == "acadia-otter-cliffs-traverse"

    i4 = detect_coasteering_intent("Show me La Jolla coves and sea cave exploration")
    assert i4 is not None and i4.route_id == "la-jolla-coves-caves-traverse"

    i5 = detect_coasteering_intent("Check out Cape Flattery swell and sea stacks ocean traverse")
    assert i5 is not None and i5.route_id == "cape-flattery-pacific-surge"


def test_detect_coasteering_intent_guardrails_sea_kayaking():
    intent = detect_coasteering_intent("Sea kayak paddle float self rescue at Acadia otter cliffs")
    assert intent is None


def test_detect_coasteering_intent_guardrails_whitewater():
    intent = detect_coasteering_intent("Whitewater river rafting class iv rapids and eddy turns")
    assert intent is None


def test_detect_coasteering_intent_guardrails_canyoneering():
    intent = detect_coasteering_intent("Technical slot canyoneering pothole escape and sand trap anchor")
    assert intent is None


def test_detect_coasteering_intent_guardrails_climbing():
    intent = detect_coasteering_intent("Sport climbing crag with quickdraws, chalk bag, and camalot")
    assert intent is None


def test_detect_coasteering_intent_guardrails_ecommerce():
    intent = detect_coasteering_intent("What is the status of my order #98765 refund?")
    assert intent is None


def test_detect_coasteering_intent_empty():
    assert detect_coasteering_intent("") is None
    assert detect_coasteering_intent("   ") is None


def test_build_coasteering_prompt_general():
    intent = CoasteeringIntent(action="routes")
    prompt = build_coasteering_prompt(intent)
    assert "Coastal Sea Cliff Coasteering" in prompt
    assert "Aerated Foam Physics" in prompt
    assert "EN 1385" in prompt
    assert "Featured Coasteering Routes" in prompt


def test_build_coasteering_prompt_focused_route():
    intent = CoasteeringIntent(action="route_detail", route_id="point-lobos-granite-coves")
    prompt = build_coasteering_prompt(intent)
    assert "Focused Route Beta: Point Lobos Granite Headlands Traverse" in prompt
    assert "Carmel, CA" in prompt
    assert "Grade: grade_2_moderate_coastal" in prompt


def test_format_coasteering_response_jump_safety():
    intent = CoasteeringIntent(action="jump_safety", route_id="point-lobos-granite-coves")
    res = format_coasteering_response(intent)
    assert "answer" in res
    assert "coasteering_info" in res
    info = res["coasteering_info"]
    assert info["action"] == "jump_safety"
    assert "safety_assessment" in info
    assert info["safety_assessment"]["route_id"] == "point-lobos-granite-coves"


def test_format_coasteering_response_gear():
    intent = CoasteeringIntent(action="gear_checklist")
    res = format_coasteering_response(intent)
    assert "answer" in res
    assert "coasteering_info" in res
    info = res["coasteering_info"]
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6
    assert info["mandatory_count"] == 6


def test_format_coasteering_response_route_detail():
    intent = CoasteeringIntent(action="route_detail", route_id="depoe-bay-spouting-horn-surge")
    res = format_coasteering_response(intent)
    assert "answer" in res
    assert "coasteering_info" in res
    info = res["coasteering_info"]
    assert info["action"] == "route_detail"
    assert info["route"]["route_id"] == "depoe-bay-spouting-horn-surge"
    assert "Spouting Horn" in res["answer"]


def test_format_coasteering_response_routes():
    intent = CoasteeringIntent(action="routes")
    res = format_coasteering_response(intent)
    assert "answer" in res
    assert "coasteering_info" in res
    info = res["coasteering_info"]
    assert info["action"] == "routes"
    assert len(info["routes"]) == 5
