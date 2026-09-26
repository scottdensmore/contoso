import pytest
from contoso_chat.snowshoe_mountaineering import (
    FormattedSnowshoeResponse,
    SnowshoeGearItemModel,
    SnowshoeIntent,
    SnowshoeRequest,
    SnowshoeResponse,
    SnowshoeRouteModel,
    build_snowshoe_prompt,
    calculate_snowshoe_ascent,
    detect_snowshoe_intent,
    format_snowshoe_response,
    get_snowshoe_gear,
    get_snowshoe_route,
    get_snowshoe_routes,
)

# -----------------------------------------------------------------------------
# 1. Pydantic Models & Interface
# -----------------------------------------------------------------------------


def test_snowshoe_route_model():
    route = SnowshoeRouteModel(
        route_id="test-route", title="Test Snowshoe Route",
        mountain_range="Test Range", region="Test Region",
        summit_elevation_m=2500, route_length_km=10.5,
        technical_grade="steep_alpine", max_slope_deg=35,
        description="A great test route.", highlights=["Highlight 1", "Highlight 2"],
    )
    assert route.route_id == "test-route"
    assert route.title == "Test Snowshoe Route"
    assert route.mountain_range == "Test Range"
    assert route.region == "Test Region"
    assert route.summit_elevation_m == 2500
    assert route.route_length_km == 10.5
    assert route.technical_grade == "steep_alpine"
    assert route.max_slope_deg == 35
    assert len(route.highlights) == 2


def test_snowshoe_request_defaults():
    req = SnowshoeRequest()
    assert req.route_id == "mount-washington-tuckerman-ridge"
    assert req.snowpack == "windslab_crust"
    assert req.slope_angle_deg == 26.0
    assert req.payload_lbs == 200.0
    assert req.heel_lifter_engaged is True


def test_snowshoe_response_model():
    res = SnowshoeResponse(
        route_id="mount-washington-tuckerman-ridge",
        route_title="Mount Washington Lion Head Winter Ridge",
        tails_required=False,
        flotation_status="Standard Deck Surface Flotation Sufficient",
        calf_strain_reduction_percent=35,
        traction_status="optimal_snowshoe_ascent",
        advisory="Optimal conditions.",
    )
    assert res.route_id == "mount-washington-tuckerman-ridge"
    assert res.tails_required is False
    assert res.calf_strain_reduction_percent == 35


def test_snowshoe_gear_item_model():
    item = SnowshoeGearItemModel(
        item_id="test-gear", name="Test Gear Item", category="traction",
        mandatory=True, purpose="Test gear purpose",
    )
    assert item.item_id == "test-gear"
    assert item.mandatory is True


def test_snowshoe_intent_model():
    intent = SnowshoeIntent(
        action="calculate_snowshoe", route_id="mount-washington-tuckerman-ridge",
        technical_grade="steep_alpine",
    )
    assert intent.action == "calculate_snowshoe"
    assert intent.route_id == "mount-washington-tuckerman-ridge"
    assert intent.technical_grade == "steep_alpine"


def test_formatted_snowshoe_response():
    data = {
        "snowshoe_mountaineering_info": {"action": "routes_list"},
        "answer": "Test answer",
    }
    resp = FormattedSnowshoeResponse("Test answer", data)
    assert str(resp) == "Test answer"
    assert resp.get("snowshoe_mountaineering_info") == {"action": "routes_list"}
    assert resp.get("nonexistent", "fallback") == "fallback"
    assert resp["snowshoe_mountaineering_info"] == {"action": "routes_list"}
    assert "snowshoe_mountaineering_info" in resp
    assert "nonexistent" not in resp
    assert "snowshoe_mountaineering_info" in list(resp.keys())
    assert {"action": "routes_list"} in list(resp.values())
    assert len(list(resp.items())) == 2


# -----------------------------------------------------------------------------
# 2. Catalog & Route Filtering
# -----------------------------------------------------------------------------


def test_get_snowshoe_routes_all():
    routes = get_snowshoe_routes()
    assert len(routes) == 5
    ids = [r.route_id for r in routes]
    assert "mount-washington-tuckerman-ridge" in ids
    assert "mount-rainier-muir-snowfield" in ids
    assert "rocky-mountain-bear-lake-flattop" in ids
    assert "mount-shasta-avalanche-gulch" in ids
    assert "san-juan-red-mountain-pass" in ids


def test_get_snowshoe_routes_by_grade():
    steep = get_snowshoe_routes(technical_grade="steep_alpine")
    assert len(steep) == 2
    steep_ids = [r.route_id for r in steep]
    assert "mount-washington-tuckerman-ridge" in steep_ids
    assert "san-juan-red-mountain-pass" in steep_ids

    glaciated = get_snowshoe_routes(technical_grade="glaciated_high_altitude")
    assert len(glaciated) == 1
    assert glaciated[0].route_id == "mount-rainier-muir-snowfield"

    ridge = get_snowshoe_routes(technical_grade="alpine_ridge")
    assert len(ridge) == 1
    assert ridge[0].route_id == "rocky-mountain-bear-lake-flattop"

    volcanic = get_snowshoe_routes(technical_grade="extreme_volcanic")
    assert len(volcanic) == 1
    assert volcanic[0].route_id == "mount-shasta-avalanche-gulch"

    none_routes = get_snowshoe_routes(technical_grade="nonexistent_grade")
    assert len(none_routes) == 0


def test_get_snowshoe_route():
    mw = get_snowshoe_route("mount-washington-tuckerman-ridge")
    assert mw is not None
    assert mw.title == "Mount Washington Lion Head Winter Ridge"
    assert mw.mountain_range == "White Mountains"
    assert mw.region == "NH, USA"
    assert mw.summit_elevation_m == 1917
    assert mw.route_length_km == 13.5
    assert mw.technical_grade == "steep_alpine"
    assert mw.max_slope_deg == 38
    assert len(mw.highlights) == 3

    assert get_snowshoe_route("nonexistent-route") is None


# -----------------------------------------------------------------------------
# 3. Calculations
# -----------------------------------------------------------------------------


def test_calculate_snowshoe_ascent_standard():
    req = SnowshoeRequest(
        route_id="mount-washington-tuckerman-ridge", snowpack="windslab_crust",
        slope_angle_deg=26.0, payload_lbs=200.0, heel_lifter_engaged=True,
    )
    res = calculate_snowshoe_ascent(req)
    assert res.route_id == "mount-washington-tuckerman-ridge"
    assert res.route_title == "Mount Washington Lion Head Winter Ridge"
    assert res.tails_required is False
    assert res.flotation_status == "Standard Deck Surface Flotation Sufficient"
    assert res.calf_strain_reduction_percent == 35
    assert res.traction_status == "optimal_snowshoe_ascent"
    assert len(res.advisory) > 0


def test_calculate_snowshoe_ascent_tails_required_by_weight():
    req = SnowshoeRequest(
        route_id="mount-washington-tuckerman-ridge", snowpack="windslab_crust",
        slope_angle_deg=20.0, payload_lbs=215.0, heel_lifter_engaged=True,
    )
    res = calculate_snowshoe_ascent(req)
    assert res.tails_required is True
    assert res.flotation_status == "Tails Required (5-Inch Modular Extensions Recommended)"


def test_calculate_snowshoe_ascent_deep_powder_thresholds():
    req_heavy = SnowshoeRequest(
        route_id="san-juan-red-mountain-pass", snowpack="deep_powder",
        slope_angle_deg=25.0, payload_lbs=180.0, heel_lifter_engaged=True,
    )
    res_heavy = calculate_snowshoe_ascent(req_heavy)
    assert res_heavy.tails_required is True
    assert res_heavy.flotation_status == "Tails Required (5-Inch Modular Extensions Recommended)"

    req_light = SnowshoeRequest(
        route_id="san-juan-red-mountain-pass", snowpack="deep_powder",
        slope_angle_deg=25.0, payload_lbs=170.0, heel_lifter_engaged=True,
    )
    res_light = calculate_snowshoe_ascent(req_light)
    assert res_light.tails_required is False
    assert res_light.flotation_status == "Standard Deck Surface Flotation Sufficient"


def test_calculate_snowshoe_ascent_calf_strain_reduction():
    # heel_lifter_engaged is False -> 0
    req_no_lifter = SnowshoeRequest(slope_angle_deg=25.0, heel_lifter_engaged=False)
    assert calculate_snowshoe_ascent(req_no_lifter).calf_strain_reduction_percent == 0

    # slope_angle_deg < 15.0 -> 0 even if engaged
    req_gentle = SnowshoeRequest(slope_angle_deg=14.0, heel_lifter_engaged=True)
    assert calculate_snowshoe_ascent(req_gentle).calf_strain_reduction_percent == 0

    # slope_angle_deg >= 15.0 and engaged -> 35
    req_steep = SnowshoeRequest(slope_angle_deg=15.0, heel_lifter_engaged=True)
    assert calculate_snowshoe_ascent(req_steep).calf_strain_reduction_percent == 35


def test_calculate_snowshoe_ascent_traction_statuses():
    # Hazardous: slope > 38.0
    req_extreme_slope = SnowshoeRequest(slope_angle_deg=39.0, snowpack="windslab_crust")
    res_extreme_slope = calculate_snowshoe_ascent(req_extreme_slope)
    assert res_extreme_slope.traction_status == "hazardous_transition_to_crampons_axe"
    assert "transition" in res_extreme_slope.advisory.lower() or "crampons" in res_extreme_slope.advisory.lower()

    # Hazardous: boilerplate_ice regardless of slope
    req_ice = SnowshoeRequest(slope_angle_deg=20.0, snowpack="boilerplate_ice")
    res_ice = calculate_snowshoe_ascent(req_ice)
    assert res_ice.traction_status == "hazardous_transition_to_crampons_axe"

    # Caution: 33.0 <= slope <= 38.0
    req_caution_low = SnowshoeRequest(slope_angle_deg=33.0, snowpack="windslab_crust")
    assert calculate_snowshoe_ascent(req_caution_low).traction_status == "caution_steep_edging_required"

    req_caution_high = SnowshoeRequest(slope_angle_deg=38.0, snowpack="windslab_crust")
    assert calculate_snowshoe_ascent(req_caution_high).traction_status == "caution_steep_edging_required"

    # Optimal: slope < 33.0
    req_optimal = SnowshoeRequest(slope_angle_deg=32.9, snowpack="windslab_crust")
    assert calculate_snowshoe_ascent(req_optimal).traction_status == "optimal_snowshoe_ascent"


def test_calculate_snowshoe_ascent_unknown_route():
    req = SnowshoeRequest(route_id="nonexistent-route")
    with pytest.raises(ValueError, match="not found"):
        calculate_snowshoe_ascent(req)


# -----------------------------------------------------------------------------
# 4. Gear Checklist
# -----------------------------------------------------------------------------


def test_get_snowshoe_gear():
    gear = get_snowshoe_gear()
    assert len(gear) == 6
    assert all(item.mandatory is True for item in gear)
    item_ids = [item.item_id for item in gear]
    assert "serrated-side-rail-snowshoes" in item_ids
    assert "modular-flotation-tails" in item_ids
    assert "technical-telescoping-poles" in item_ids
    assert "insulated-gaiters-crampon-shield" in item_ids
    assert "avalanche-safety-trio" in item_ids
    assert "emergency-ice-axe-hybrid" in item_ids

    serrated = next(item for item in gear if item.item_id == "serrated-side-rail-snowshoes")
    assert serrated.category == "traction"
    assert "lateral bite" in serrated.purpose.lower() or "calf strain" in serrated.purpose.lower()


# -----------------------------------------------------------------------------
# 5. Intent Detection & Disambiguation
# -----------------------------------------------------------------------------


def test_detect_snowshoe_intent_routes():
    # Mount Washington
    i1 = detect_snowshoe_intent("Tell me about Mount Washington snowshoe ascent via Lion Head")
    assert i1 is not None
    assert i1.action == "route_detail"
    assert i1.route_id == "mount-washington-tuckerman-ridge"

    # Rainier Muir snowfield
    i2 = detect_snowshoe_intent("Rainier Muir snowfield snowshoeing route details")
    assert i2 is not None
    assert i2.action == "route_detail"
    assert i2.route_id == "mount-rainier-muir-snowfield"

    # Flattop Mountain
    i3 = detect_snowshoe_intent("Flattop Mountain snowshoe traverse in Rocky Mountain")
    assert i3 is not None
    assert i3.action == "route_detail"
    assert i3.route_id == "rocky-mountain-bear-lake-flattop"

    # Mount Shasta
    i4 = detect_snowshoe_intent("Mount Shasta Avalanche Gulch winter snowshoe climb")
    assert i4 is not None
    assert i4.action == "route_detail"
    assert i4.route_id == "mount-shasta-avalanche-gulch"

    # Red Mountain Pass
    i5 = detect_snowshoe_intent("San Juan Red Mountain Pass backcountry snowshoe trip")
    assert i5 is not None
    assert i5.action == "route_detail"
    assert i5.route_id == "san-juan-red-mountain-pass"


def test_detect_snowshoe_intent_calculate():
    i_calc = detect_snowshoe_intent("Calculate snowshoe slope angle limit and Televator heel lifter fatigue reduction")
    assert i_calc is not None
    assert i_calc.action == "calculate_snowshoe"

    i_calc2 = detect_snowshoe_intent("snowshoe slope angle limit for deep powder and 215 lbs payload")
    assert i_calc2 is not None
    assert i_calc2.action == "calculate_snowshoe"


def test_detect_snowshoe_intent_gear():
    i_gear = detect_snowshoe_intent("What is the mandatory snowshoe gear checklist and serrated snowshoe traction?")
    assert i_gear is not None
    assert i_gear.action == "gear_checklist"

    i_gear2 = detect_snowshoe_intent("Do I need flotation tails and crampon toe cleats for technical snowshoeing?")
    assert i_gear2 is not None
    assert i_gear2.action == "gear_checklist"


def test_detect_snowshoe_intent_routes_list():
    i_list = detect_snowshoe_intent("Show me the alpine snowshoe mountaineering routes")
    assert i_list is not None
    assert i_list.action == "routes_list"

    i_filtered = detect_snowshoe_intent("List steep alpine technical snowshoe routes")
    assert i_filtered is not None
    assert i_filtered.action == "routes_list"
    assert i_filtered.technical_grade == "steep_alpine"


def test_detect_snowshoe_intent_disambiguation():
    # General mountaineering without snowshoe terms
    assert detect_snowshoe_intent("Glacier rope team crevasse rescue with z-pulley system") is None
    assert detect_snowshoe_intent("Alpine mountaineering guide for Denali West Buttress") is None

    # Steep couloir skiing without snowshoe terms
    assert detect_snowshoe_intent("Extreme couloir descent sluff velocity and hop-turn edge loading on Corbet's Couloir") is None
    assert detect_snowshoe_intent("Tell me about Tuckerman Ravine steep skiing lines") is None

    # Cross-country / Nordic skiing without snowshoe terms
    assert detect_snowshoe_intent("Cross-country skiing skate ski wax and kick zone on nordic track") is None

    # Avalanche generic without snowshoe terms
    assert detect_snowshoe_intent("Check avalanche safety danger rating bulletin for backcountry zone") is None

    # Unrelated queries
    assert detect_snowshoe_intent("Where is my order #12345? Track shipping status.") is None
    assert detect_snowshoe_intent("") is None


# -----------------------------------------------------------------------------
# 6. Formatting & Prompt Generation
# -----------------------------------------------------------------------------


def test_format_snowshoe_response_calculation():
    req = SnowshoeRequest(
        route_id="mount-washington-tuckerman-ridge", snowpack="windslab_crust",
        slope_angle_deg=26.0, payload_lbs=200.0, heel_lifter_engaged=True,
    )
    calc = calculate_snowshoe_ascent(req)
    formatted = format_snowshoe_response(calc)
    assert isinstance(formatted, FormattedSnowshoeResponse)
    assert "snowshoe_mountaineering_info" in formatted
    info = formatted["snowshoe_mountaineering_info"]
    assert info["action"] == "calculate_snowshoe"
    assert info["calculation"]["route_id"] == "mount-washington-tuckerman-ridge"
    assert "Mount Washington" in str(formatted)


def test_format_snowshoe_response_gear():
    intent = SnowshoeIntent(action="gear_checklist")
    formatted = format_snowshoe_response(intent)
    assert isinstance(formatted, FormattedSnowshoeResponse)
    info = formatted["snowshoe_mountaineering_info"]
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6
    assert info["mandatory_count"] == 6


def test_format_snowshoe_response_route_detail():
    intent = SnowshoeIntent(
        action="route_detail",
        route_id="mount-rainier-muir-snowfield",
    )
    formatted = format_snowshoe_response(intent)
    assert isinstance(formatted, FormattedSnowshoeResponse)
    info = formatted["snowshoe_mountaineering_info"]
    assert info["action"] == "route_detail"
    assert info["route"]["route_id"] == "mount-rainier-muir-snowfield"
    assert "Camp Muir" in str(formatted)


def test_format_snowshoe_response_routes_list():
    intent = SnowshoeIntent(action="routes_list")
    formatted = format_snowshoe_response(intent)
    assert isinstance(formatted, FormattedSnowshoeResponse)
    info = formatted["snowshoe_mountaineering_info"]
    assert info["action"] == "routes_list"
    assert len(info["routes"]) == 5


def test_format_snowshoe_response_from_dict():
    raw_dict = {
        "action": "calculate_snowshoe",
        "route_id": "mount-washington-tuckerman-ridge",
        "payload_lbs": 220.0,
    }
    formatted = format_snowshoe_response(raw_dict)
    assert isinstance(formatted, FormattedSnowshoeResponse)
    assert "snowshoe_mountaineering_info" in formatted


def test_build_snowshoe_prompt():
    prompt = build_snowshoe_prompt()
    assert "Alpine Snowshoe Mountaineering" in prompt or "Technical Winter Ascent" in prompt
    assert "Televator" in prompt
    assert "flotation" in prompt.lower()


# -----------------------------------------------------------------------------
# 7. Chat Tools Integration Tests
# -----------------------------------------------------------------------------


def test_snowshoe_mountaineering_tool():
    from contoso_chat.chat_tools import (
        TOOL_REGISTRY,
        create_response,
        resolve_tool,
        snowshoe_mountaineering_tool,
    )

    assert "snowshoe_mountaineering_tool" in TOOL_REGISTRY

    # Calculation via request object
    req = SnowshoeRequest(route_id="mount-washington-tuckerman-ridge")
    res = snowshoe_mountaineering_tool(request=req)
    assert isinstance(res, SnowshoeResponse)
    assert res.route_id == "mount-washington-tuckerman-ridge"

    # Calculation via action and kwargs
    res_kw = snowshoe_mountaineering_tool(
        action="calculate_snowshoe",
        route_id="mount-washington-tuckerman-ridge",
        payload_lbs=220.0,
    )
    assert isinstance(res_kw, SnowshoeResponse)
    assert res_kw.tails_required is True

    # Gear checklist
    gear = snowshoe_mountaineering_tool(action="gear_checklist")
    assert len(gear) == 6

    # Route detail
    route = snowshoe_mountaineering_tool(
        action="route_detail",
        route_id="mount-rainier-muir-snowfield",
    )
    assert route.route_id == "mount-rainier-muir-snowfield"

    # Routes list
    routes = snowshoe_mountaineering_tool(action="routes_list")
    assert len(routes) == 5

    # resolve_tool
    intent = SnowshoeIntent(action="gear_checklist")
    resolved = resolve_tool(intent, question="mandatory snowshoe gear")
    assert isinstance(resolved, FormattedSnowshoeResponse)

    # create_response dispatch
    resp = create_response("What is the mandatory snowshoe gear checklist and serrated snowshoe traction?")
    assert "snowshoe_mountaineering_info" in resp
    assert resp["snowshoe_mountaineering_info"]["action"] == "gear_checklist"
