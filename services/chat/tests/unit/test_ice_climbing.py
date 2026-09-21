import pytest
from contoso_chat.ice_climbing import (
    IceClimbingIntent,
    IceClimbingRouteModel,
    IceRiggingRequest,
    IceRiggingResponse,
    build_ice_climbing_prompt,
    calculate_ice_rigging_plan,
    detect_ice_climbing_intent,
    format_ice_climbing_response,
    get_ice_climbing_gear,
    get_ice_climbing_route_by_id,
    get_ice_climbing_routes,
)


def test_get_ice_climbing_routes_all():
    routes = get_ice_climbing_routes()
    assert len(routes) == 5
    route_ids = [r.route_id for r in routes]
    assert "ouray-ice-park-pic-of-the-vic" in route_ids
    assert "hyalite-canyon-genesis-ii" in route_ids
    assert "canmore-weeping-wall-lower" in route_ids
    assert "lake-willoughby-promised-land" in route_ids
    assert "vail-amphitheater-fang" in route_ids


def test_get_ice_climbing_route_by_id_found():
    route = get_ice_climbing_route_by_id("ouray-ice-park-pic-of-the-vic")
    assert route is not None
    assert isinstance(route, IceClimbingRouteModel)
    assert route.route_id == "ouray-ice-park-pic-of-the-vic"
    assert route.title == "Pic of the Vic & Upper Bridge Area"
    assert "Ouray" in route.region
    assert route.pitches == 2
    assert route.length_m == 45
    assert route.ice_grade == "wi3_intermediate"
    assert route.elevation_m == 2400
    assert route.ice_structure == "plastic_water_ice"
    assert route.typical_duration_hours == 2.5
    assert route.v_thread_anchor_standard is True
    assert "Gorge rim bridge access" in route.highlights
    assert "Continuous blue waterfall ice flows" in route.highlights
    assert "Top-rope anchor stanchions" in route.highlights


def test_get_ice_climbing_route_by_id_not_found():
    route = get_ice_climbing_route_by_id("non-existent-route")
    assert route is None


def test_get_ice_climbing_routes_grade_filtering():
    wi3_routes = get_ice_climbing_routes(grade="wi3_intermediate")
    assert len(wi3_routes) == 1
    assert wi3_routes[0].route_id == "ouray-ice-park-pic-of-the-vic"

    wi3_short = get_ice_climbing_routes(grade="wi3")
    assert len(wi3_short) == 1
    assert wi3_short[0].route_id == "ouray-ice-park-pic-of-the-vic"

    wi4_routes = get_ice_climbing_routes(grade="wi4_advanced")
    assert len(wi4_routes) == 2
    wi4_ids = [r.route_id for r in wi4_routes]
    assert "hyalite-canyon-genesis-ii" in wi4_ids
    assert "canmore-weeping-wall-lower" in wi4_ids

    wi5_routes = get_ice_climbing_routes(grade="wi5_expert")
    assert len(wi5_routes) == 1
    assert wi5_routes[0].route_id == "lake-willoughby-promised-land"

    wi6_routes = get_ice_climbing_routes(grade="wi6_extreme")
    assert len(wi6_routes) == 1
    assert wi6_routes[0].route_id == "vail-amphitheater-fang"


def test_calculate_ice_rigging_plan_standard():
    req = IceRiggingRequest(
        route_id="ouray-ice-park-pic-of-the-vic",
        ice_temperature_f=20.0,
        ice_thickness_cm=25.0,
        screw_length_cm=16,
        screw_placement_angle_deg=100,
        anchor_type="v_thread_abalakov",
    )
    res = calculate_ice_rigging_plan(req)
    assert isinstance(res, IceRiggingResponse)
    assert res.route_id == "ouray-ice-park-pic-of-the-vic"
    assert res.route_title == "Pic of the Vic & Upper Bridge Area"
    assert res.ice_grade == "wi3_intermediate"
    assert res.v_thread_suitable is True
    assert res.safety_status in ("optimal_anchorage", "certified_safe")
    assert res.estimated_holding_force_kn >= 12.0
    assert "plastic" in res.ice_quality_rating.lower()
    assert "temperature" in res.temperature_advisory.lower() or "plastic" in res.temperature_advisory.lower()
    assert len(res.rigging_recommendation) > 20


def test_calculate_ice_rigging_plan_cold_fracturing_risk():
    req = IceRiggingRequest(
        route_id="hyalite-canyon-genesis-ii",
        ice_temperature_f=5.0,
        ice_thickness_cm=25.0,
        screw_length_cm=16,
        screw_placement_angle_deg=100,
        anchor_type="v_thread_abalakov",
    )
    res = calculate_ice_rigging_plan(req)
    assert res.route_id == "hyalite-canyon-genesis-ii"
    assert "brittle" in res.safety_status.lower() or "fracture" in res.safety_status.lower() or "cold" in res.safety_status.lower()
    assert "fractur" in res.temperature_advisory.lower() or "brittle" in res.temperature_advisory.lower() or "dinner-plate" in res.temperature_advisory.lower()


def test_calculate_ice_rigging_plan_warm_thaw_hazard():
    req = IceRiggingRequest(
        route_id="canmore-weeping-wall-lower",
        ice_temperature_f=35.0,
        ice_thickness_cm=25.0,
        screw_length_cm=16,
        screw_placement_angle_deg=100,
        anchor_type="v_thread_abalakov",
    )
    res = calculate_ice_rigging_plan(req)
    assert res.v_thread_suitable is False
    assert "thaw" in res.safety_status.lower() or "hazard" in res.safety_status.lower() or "melt" in res.safety_status.lower()
    assert "thaw" in res.temperature_advisory.lower() or "melt" in res.temperature_advisory.lower() or "degrad" in res.temperature_advisory.lower()


def test_calculate_ice_rigging_plan_thin_ice_bottoming_out():
    req = IceRiggingRequest(
        route_id="lake-willoughby-promised-land",
        ice_temperature_f=22.0,
        ice_thickness_cm=12.0,
        screw_length_cm=16,
        screw_placement_angle_deg=100,
        anchor_type="v_thread_abalakov",
    )
    res = calculate_ice_rigging_plan(req)
    assert res.v_thread_suitable is False
    assert "bottom" in res.safety_status.lower() or "thin" in res.safety_status.lower() or "hazard" in res.safety_status.lower()
    assert "bottom" in res.rigging_recommendation.lower() or "thin" in res.rigging_recommendation.lower() or "stubby" in res.rigging_recommendation.lower()


def test_calculate_ice_rigging_plan_angle_efficiency():
    req_optimal = IceRiggingRequest(
        route_id="vail-amphitheater-fang",
        ice_temperature_f=20.0,
        ice_thickness_cm=30.0,
        screw_length_cm=19,
        screw_placement_angle_deg=100,
        anchor_type="two_screw_equalized",
    )
    res_optimal = calculate_ice_rigging_plan(req_optimal)

    req_suboptimal = IceRiggingRequest(
        route_id="vail-amphitheater-fang",
        ice_temperature_f=20.0,
        ice_thickness_cm=30.0,
        screw_length_cm=19,
        screw_placement_angle_deg=65,
        anchor_type="two_screw_equalized",
    )
    res_suboptimal = calculate_ice_rigging_plan(req_suboptimal)

    assert res_optimal.estimated_holding_force_kn > res_suboptimal.estimated_holding_force_kn


def test_calculate_ice_rigging_plan_route_not_found():
    req = IceRiggingRequest(
        route_id="unknown-ice-route",
        ice_temperature_f=20.0,
        ice_thickness_cm=25.0,
    )
    with pytest.raises(ValueError, match="not found"):
        calculate_ice_rigging_plan(req)


def test_get_ice_climbing_gear_items():
    gear = get_ice_climbing_gear()
    assert len(gear) == 6
    item_ids = [g.item_id for g in gear]
    assert "technical-ice-tools" in item_ids
    assert "mono-dual-point-crampons" in item_ids
    assert "ice-screw-rack" in item_ids
    assert "v-thread-hooker-cord" in item_ids
    assert "insulated-mountaineering-boots" in item_ids
    assert "ice-climbing-helmet-visor" in item_ids
    assert all(g.mandatory for g in gear)


def test_detect_ice_climbing_intent_catalog_routes():
    intent = detect_ice_climbing_intent("Can you show me the waterfall ice climbing routes?")
    assert intent is not None
    assert isinstance(intent, IceClimbingIntent)
    assert intent.action == "routes"


def test_detect_ice_climbing_intent_route_ouray():
    intent = detect_ice_climbing_intent("Tell me about Ouray ice park pic of the vic route")
    assert intent is not None
    assert intent.action == "route_detail"
    assert intent.route_id == "ouray-ice-park-pic-of-the-vic"


def test_detect_ice_climbing_intent_route_hyalite():
    intent = detect_ice_climbing_intent("What is the pitch breakdown for Genesis II in Hyalite Canyon?")
    assert intent is not None
    assert intent.action == "route_detail"
    assert intent.route_id == "hyalite-canyon-genesis-ii"


def test_detect_ice_climbing_intent_route_weeping_wall():
    intent = detect_ice_climbing_intent("Is Weeping Wall ice climb good for waterfall ice in Canada?")
    assert intent is not None
    assert intent.action == "route_detail"
    assert intent.route_id == "canmore-weeping-wall-lower"


def test_detect_ice_climbing_intent_route_willoughby():
    intent = detect_ice_climbing_intent("Give me beta on Lake Willoughby ice Promised Land")
    assert intent is not None
    assert intent.action == "route_detail"
    assert intent.route_id == "lake-willoughby-promised-land"


def test_detect_ice_climbing_intent_route_the_fang():
    intent = detect_ice_climbing_intent("How steep is The Fang ice pillar in Vail?")
    assert intent is not None
    assert intent.action == "route_detail"
    assert intent.route_id == "vail-amphitheater-fang"


def test_detect_ice_climbing_intent_rigging():
    intent = detect_ice_climbing_intent("Calculate ice rigging plan and V-thread anchor force for Ouray ice park")
    assert intent is not None
    assert intent.action == "rigging_plan"
    assert intent.route_id == "ouray-ice-park-pic-of-the-vic"


def test_detect_ice_climbing_intent_gear_checklist():
    intent = detect_ice_climbing_intent("What technical ice tools, ice screws, and crampon frontpoint gear do I need for ice climb?")
    assert intent is not None
    assert intent.action == "gear_checklist"


def test_detect_ice_climbing_intent_grade_filtering():
    intent = detect_ice_climbing_intent("Find wi4 ice climbs in waterfall ice")
    assert intent is not None
    assert intent.grade == "wi4_advanced"

    intent2 = detect_ice_climbing_intent("Show wi5 ice climbing pillars")
    assert intent2 is not None
    assert intent2.grade == "wi5_expert"


def test_detect_ice_climbing_intent_exclusions_rock_climbing():
    assert detect_ice_climbing_intent("What rock climbing shoes should I buy for trad climbing with a camalot?") is None
    assert detect_ice_climbing_intent("Looking for a belay partner for sport climbing and bouldering with my chalk bag") is None


def test_detect_ice_climbing_intent_exclusions_glacier_mountaineering():
    assert detect_ice_climbing_intent("How do I practice crevasse rescue and glacier travel on Mount Rainier?") is None
    assert detect_ice_climbing_intent("Glacier mountaineering rope team setup with snow pickets") is None


def test_detect_ice_climbing_intent_exclusions_via_ferrata():
    assert detect_ice_climbing_intent("Tell me about Telluride via ferrata cable route and rest lanyard") is None
    assert detect_ice_climbing_intent("What energy absorber should I use on a klettersteig iron way?") is None


def test_detect_ice_climbing_intent_exclusions_ecommerce():
    assert detect_ice_climbing_intent("What is the status of my order #98721? I need a refund and return label.") is None
    assert detect_ice_climbing_intent("") is None
    assert detect_ice_climbing_intent("   ") is None


def test_build_ice_climbing_prompt():
    intent = IceClimbingIntent(action="route_detail", route_id="ouray-ice-park-pic-of-the-vic")
    prompt = build_ice_climbing_prompt(intent)
    assert "Pic of the Vic" in prompt
    assert "wi3_intermediate" in prompt or "WI3" in prompt
    assert "V-thread" in prompt or "v-thread" in prompt or "Abalakov" in prompt
    assert "screw" in prompt.lower()

    general_intent = IceClimbingIntent(action="routes")
    general_prompt = build_ice_climbing_prompt(general_intent)
    assert "Pic of the Vic" in general_prompt
    assert "Genesis II" in general_prompt


def test_format_ice_climbing_response_rigging_plan():
    intent = IceClimbingIntent(action="rigging_plan", route_id="ouray-ice-park-pic-of-the-vic")
    resp = format_ice_climbing_response(intent)
    assert "answer" in resp
    assert "ice_climbing_info" in resp
    info = resp["ice_climbing_info"]
    assert info["action"] == "rigging_plan"
    assert "plan" in info
    assert info["plan"]["route_id"] == "ouray-ice-park-pic-of-the-vic"


def test_format_ice_climbing_response_route_detail():
    intent = IceClimbingIntent(action="route_detail", route_id="hyalite-canyon-genesis-ii")
    resp = format_ice_climbing_response(intent)
    assert "answer" in resp
    assert "ice_climbing_info" in resp
    info = resp["ice_climbing_info"]
    assert info["action"] == "route_detail"
    assert info["route"]["route_id"] == "hyalite-canyon-genesis-ii"


def test_format_ice_climbing_response_gear():
    intent = IceClimbingIntent(action="gear_checklist")
    resp = format_ice_climbing_response(intent)
    assert "answer" in resp
    assert "ice_climbing_info" in resp
    info = resp["ice_climbing_info"]
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6


def test_format_ice_climbing_response_routes():
    intent = IceClimbingIntent(action="routes")
    resp = format_ice_climbing_response(intent)
    assert "answer" in resp
    assert "ice_climbing_info" in resp
    info = resp["ice_climbing_info"]
    assert info["action"] == "routes"
    assert len(info["routes"]) == 5
