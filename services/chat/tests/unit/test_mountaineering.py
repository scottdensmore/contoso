import pytest
from contoso_chat.mountaineering import (
    GlacierGearRequirement,
    GlacierRouteModel,
    MountaineeringIntent,
    RopeTeamPlanRequest,
    RopeTeamPlanResponse,
    build_mountaineering_prompt,
    calculate_rope_team_plan,
    detect_mountaineering_intent,
    format_mountaineering_response,
    get_glacier_gear,
    get_glacier_route_by_id,
    get_glacier_routes,
)


def test_get_glacier_routes_all():
    routes = get_glacier_routes()
    assert len(routes) == 5
    route_ids = [r.route_id for r in routes]
    assert "rainier-disappointment-cleaver" in route_ids
    assert "baker-coleman-deming" in route_ids
    assert "shasta-avalanche-gulch" in route_ids
    assert "hood-south-side-pearly-gates" in route_ids
    assert "olympus-blue-glacier" in route_ids


def test_get_glacier_routes_filtered_by_grade():
    grade_ii_routes = get_glacier_routes(grade="grade_ii")
    assert len(grade_ii_routes) == 3
    ids = [r.route_id for r in grade_ii_routes]
    assert "baker-coleman-deming" in ids
    assert "shasta-avalanche-gulch" in ids
    assert "hood-south-side-pearly-gates" in ids

    grade_iii_routes = get_glacier_routes(grade="grade_iii")
    assert len(grade_iii_routes) == 1
    assert grade_iii_routes[0].route_id == "rainier-disappointment-cleaver"

    grade_iv_routes = get_glacier_routes(grade="grade_iv")
    assert len(grade_iv_routes) == 1
    assert grade_iv_routes[0].route_id == "olympus-blue-glacier"

    empty_routes = get_glacier_routes(grade="grade_v")
    assert empty_routes == []


def test_get_glacier_route_by_id():
    route = get_glacier_route_by_id("rainier-disappointment-cleaver")
    assert route is not None
    assert isinstance(route, GlacierRouteModel)
    assert route.route_id == "rainier-disappointment-cleaver"
    assert route.peak_name == "Mount Rainier"
    assert route.route_name == "Disappointment Cleaver"
    assert route.elevation_ft == 14411
    assert route.vertical_gain_ft == 9000
    assert route.glacier_grade == "grade_iii"
    assert route.crevasse_risk == "extreme"
    assert route.recommended_team_size == 3
    assert route.typical_ascent_hours == 14.0
    assert route.recommended_rope_length_m == 60
    assert route.crampon_type == "semi_automatic"
    assert len(route.crux_features) >= 3

    missing = get_glacier_route_by_id("non-existent-glacier-route")
    assert missing is None


def test_get_glacier_gear():
    gear = get_glacier_gear()
    assert len(gear) == 6
    for item in gear:
        assert isinstance(item, GlacierGearRequirement)
        assert item.item_id
        assert item.name
        assert item.category in ["hardware", "soft_goods", "rescue", "protection"]
        assert item.mandatory is True
        assert item.purpose

    gear_ids = [g.item_id for g in gear]
    assert "ice-axe-steel" in gear_ids
    assert "crampons-steel-12pt" in gear_ids
    assert "dry-rope-glacier" in gear_ids
    assert "crevasse-rescue-kit" in gear_ids
    assert "snow-picket-aluminum" in gear_ids
    assert "climbing-helmet-glacier" in gear_ids


def test_calculate_rope_team_plan_standard():
    req = RopeTeamPlanRequest(
        route_id="rainier-disappointment-cleaver",
        team_members_count=3,
        snowpack_firmness="dense_firn",
        rescue_haul_system="z_pulley_3_to_1",
    )
    res = calculate_rope_team_plan(req)
    assert isinstance(res, RopeTeamPlanResponse)
    assert res.route_id == "rainier-disappointment-cleaver"
    assert "Rainier" in res.peak_and_route
    assert res.rope_spacing_meters == 12.0
    # Extreme crevasse risk triggers brake knots even with 3 climbers
    assert res.brake_knots_required is True
    assert res.snow_pickets_required >= 3
    assert res.prerigged_prusiks_count == 6
    assert "3:1" in res.mechanical_advantage
    assert res.turnaround_time_hours > 0


def test_calculate_rope_team_plan_soft_snowpack_and_two_person():
    # Baker Coleman-Deming with 2 climbers and soft wet spring snowpack
    req = RopeTeamPlanRequest(
        route_id="baker-coleman-deming",
        team_members_count=2,
        snowpack_firmness="soft_wet_spring",
        rescue_haul_system="c_pulley_2_to_1",
    )
    res = calculate_rope_team_plan(req)
    assert res.route_id == "baker-coleman-deming"
    # 2 climbers: base 15m + 2m for soft snowpack = 17.0m
    assert res.rope_spacing_meters == 17.0
    assert res.brake_knots_required is True
    # 2 climbers base 2 + 1 for soft snowpack = 3 pickets
    assert res.snow_pickets_required == 3
    assert res.prerigged_prusiks_count == 4
    assert "2:1" in res.mechanical_advantage
    assert res.safety_warning is not None
    assert "2-person" in res.safety_warning or "snowpack" in res.safety_warning


def test_calculate_rope_team_plan_invalid_route():
    req = RopeTeamPlanRequest(route_id="invalid-peak-route")
    with pytest.raises(ValueError, match="not found"):
        calculate_rope_team_plan(req)


def test_detect_mountaineering_intent_routes_list():
    intent = detect_mountaineering_intent(
        "What are the best glaciated peak mountaineering routes in the Cascades?"
    )
    assert intent is not None
    assert intent.action == "routes_list"

    intent_grade = detect_mountaineering_intent("Show me Grade II glacier climbing routes")
    assert intent_grade is not None
    assert intent_grade.action == "routes_list"
    assert intent_grade.glacier_grade == "grade_ii"


def test_detect_mountaineering_intent_route_detail():
    intent_dc = detect_mountaineering_intent(
        "Tell me about the Disappointment Cleaver route on Mount Rainier and its bergschrund"
    )
    assert intent_dc is not None
    assert intent_dc.action == "route_detail"
    assert intent_dc.route_id == "rainier-disappointment-cleaver"

    intent_baker = detect_mountaineering_intent(
        "What are the crux features of Coleman Deming glacier climb?"
    )
    assert intent_baker is not None
    assert intent_baker.action == "route_detail"
    assert intent_baker.route_id == "baker-coleman-deming"

    intent_shasta = detect_mountaineering_intent(
        "Details on Avalanche Gulch glacier travel route on Shasta"
    )
    assert intent_shasta is not None
    assert intent_shasta.action == "route_detail"
    assert intent_shasta.route_id == "shasta-avalanche-gulch"

    intent_hood = detect_mountaineering_intent("Tell me about Pearly Gates route on Mount Hood")
    assert intent_hood is not None
    assert intent_hood.action == "route_detail"
    assert intent_hood.route_id == "hood-south-side-pearly-gates"

    intent_olympus = detect_mountaineering_intent(
        "What is the elevation gain for the Blue Glacier climb on Olympus?"
    )
    assert intent_olympus is not None
    assert intent_olympus.action == "route_detail"
    assert intent_olympus.route_id == "olympus-blue-glacier"


def test_detect_mountaineering_intent_rope_team_plan():
    intent = detect_mountaineering_intent(
        "How much rope team spacing and do I need brake knots for crevasse rescue on Rainier?"
    )
    assert intent is not None
    assert intent.action == "rope_team_plan"
    assert intent.route_id == "rainier-disappointment-cleaver"

    intent_z = detect_mountaineering_intent(
        "How do I rig a z-pulley system for a rope team crevasse rescue?"
    )
    assert intent_z is not None
    assert intent_z.action == "rope_team_plan"


def test_detect_mountaineering_intent_gear_checklist():
    intent = detect_mountaineering_intent(
        "What technical glacier gear and mountaineering ice axe do I need?"
    )
    assert intent is not None
    assert intent.action == "gear_checklist"

    intent_picket = detect_mountaineering_intent(
        "What crampons for glacier and snow picket setup are required?"
    )
    assert intent_picket is not None
    assert intent_picket.action == "gear_checklist"


def test_detect_mountaineering_intent_disambiguation_guards():
    # MUST NOT hijack general rock climbing
    assert (
        detect_mountaineering_intent("What are the best climbing crags for sport climbing?") is None
    )
    assert (
        detect_mountaineering_intent("Where can I go bouldering or trad climbing in Leavenworth?")
        is None
    )
    assert detect_mountaineering_intent("Can you calculate a trad rack for a 5.9 pitch?") is None

    # MUST NOT hijack ski touring or avalanche forecasts
    assert (
        detect_mountaineering_intent("What is the avalanche forecast for Snoqualmie Pass?") is None
    )
    assert detect_mountaineering_intent("Where can I find backcountry ski touring routes?") is None

    # MUST NOT hijack trail hiking or trail running
    assert (
        detect_mountaineering_intent("What are the top hiking trails around Mount Rainier?") is None
    )
    assert (
        detect_mountaineering_intent("What trail running shoes should I wear for an ultra?") is None
    )

    # MUST NOT hijack hot springs or fly fishing
    assert detect_mountaineering_intent("Where are scenic hot springs in Washington?") is None
    assert (
        detect_mountaineering_intent("What fly pattern should I use on the Yakima River?") is None
    )


def test_build_mountaineering_prompt():
    intent_rope = MountaineeringIntent(
        action="rope_team_plan", route_id="rainier-disappointment-cleaver"
    )
    prompt_rope = build_mountaineering_prompt(intent_rope)
    assert "Rainier" in prompt_rope
    assert "Disappointment Cleaver" in prompt_rope
    assert "Rope Spacing" in prompt_rope or "Spacing" in prompt_rope
    assert "3:1" in prompt_rope or "Pulley" in prompt_rope

    intent_gear = MountaineeringIntent(action="gear_checklist")
    prompt_gear = build_mountaineering_prompt(intent_gear)
    assert "Ice Axe" in prompt_gear or "ice axe" in prompt_gear.lower()
    assert "Crampons" in prompt_gear or "crampons" in prompt_gear.lower()
    assert "Snow Picket" in prompt_gear or "snow picket" in prompt_gear.lower()

    intent_detail = MountaineeringIntent(action="route_detail", route_id="baker-coleman-deming")
    prompt_detail = build_mountaineering_prompt(intent_detail)
    assert "Mount Baker" in prompt_detail
    assert "Coleman-Deming" in prompt_detail
    assert "10781" in prompt_detail

    intent_list = MountaineeringIntent(action="routes_list")
    prompt_list = build_mountaineering_prompt(intent_list)
    assert "Mount Rainier" in prompt_list
    assert "Mount Baker" in prompt_list


def test_format_mountaineering_response():
    res_rope = format_mountaineering_response(
        MountaineeringIntent(action="rope_team_plan", route_id="rainier-disappointment-cleaver")
    )
    assert "answer" in res_rope
    assert "mountaineering_info" in res_rope
    assert res_rope["mountaineering_info"]["action"] == "rope_team_plan"
    assert res_rope["mountaineering_info"]["route_id"] == "rainier-disappointment-cleaver"
    assert res_rope["mountaineering_info"]["rope_spacing_meters"] == 12.0

    res_gear = format_mountaineering_response(MountaineeringIntent(action="gear_checklist"))
    assert "mountaineering_info" in res_gear
    assert res_gear["mountaineering_info"]["action"] == "gear_checklist"
    assert len(res_gear["mountaineering_info"]["gear"]) == 6
    assert res_gear["mountaineering_info"]["mandatory_count"] == 6

    res_detail = format_mountaineering_response(
        MountaineeringIntent(action="route_detail", route_id="baker-coleman-deming")
    )
    assert "mountaineering_info" in res_detail
    assert res_detail["mountaineering_info"]["action"] == "route_detail"
    assert res_detail["mountaineering_info"]["route_id"] == "baker-coleman-deming"

    res_list = format_mountaineering_response(MountaineeringIntent(action="routes_list"))
    assert "mountaineering_info" in res_list
    assert res_list["mountaineering_info"]["action"] == "routes_list"
    assert len(res_list["mountaineering_info"]["routes"]) == 5
