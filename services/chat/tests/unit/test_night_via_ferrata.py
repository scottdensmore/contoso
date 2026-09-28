import pytest
from contoso_chat.night_via_ferrata import (
    NightViaFerrataIntent,
    NightViaFerrataRequest,
    NightViaFerrataRouteModel,
    build_night_via_ferrata_prompt,
    calculate_night_via_ferrata_dynamics,
    detect_night_via_ferrata_intent,
    format_night_via_ferrata_response,
    get_night_via_ferrata_gear_checklist,
    get_night_via_ferrata_route,
    get_night_via_ferrata_routes,
    night_via_ferrata_tool,
)
from contoso_chat.via_ferrata import detect_via_ferrata_intent


def test_night_via_ferrata_route_model():
    route = NightViaFerrataRouteModel(
        route_id="dolomites-kellner-night-traverse",
        title="Dolomites Kellner Night Traverse",
        mountain_range="Dolomites (Brenta Group)",
        region="Trentino-Alto Adige, Italy",
        route_elevation_m=2580,
        suspension_bridge_span_m=45,
        vertical_drop_m=620,
        nocturnal_style="moonlight_ridge",
        max_grade="grade_d_very_difficult",
        description="Legendary nocturnal iron way traversing soaring limestone pinnacles and exposed suspension bridges under Brenta moonlight.",
        highlights=[
            "45m swaying suspension wire bridge",
            "Bocchette Centrali moonlit towers",
            "Sheer 600m nocturnal drop-offs",
        ],
    )
    assert route.route_id == "dolomites-kellner-night-traverse"
    assert route.route_elevation_m == 2580
    assert route.suspension_bridge_span_m == 45
    assert len(route.highlights) == 3


def test_get_night_via_ferrata_routes_all():
    routes = get_night_via_ferrata_routes()
    assert len(routes) == 5
    route_ids = [r.route_id for r in routes]
    assert "dolomites-kellner-night-traverse" in route_ids
    assert "ouray-canyon-night-ferrata" in route_ids
    assert "telluride-krogerata-moonlight" in route_ids
    assert "mammoth-pass-starlight-traverse" in route_ids
    assert "chamonix-aiguilles-rouges-darksky" in route_ids


def test_get_night_via_ferrata_routes_filtering():
    ridge_routes = get_night_via_ferrata_routes(style="moonlight_ridge")
    assert len(ridge_routes) == 1
    assert ridge_routes[0].route_id == "dolomites-kellner-night-traverse"

    gorge_routes = get_night_via_ferrata_routes(style="starlight_gorge")
    assert len(gorge_routes) == 1
    assert gorge_routes[0].route_id == "ouray-canyon-night-ferrata"

    crest_routes = get_night_via_ferrata_routes(style="starlight_crest")
    assert len(crest_routes) == 1
    assert crest_routes[0].route_id == "mammoth-pass-starlight-traverse"


def test_get_night_via_ferrata_route_lookup():
    route = get_night_via_ferrata_route("dolomites-kellner-night-traverse")
    assert route is not None
    assert route.title == "Dolomites Kellner Night Traverse"
    assert route.suspension_bridge_span_m == 45

    invalid = get_night_via_ferrata_route("nonexistent-night-route")
    assert invalid is None


def test_calculate_night_via_ferrata_dynamics_default():
    req = NightViaFerrataRequest()
    res = calculate_night_via_ferrata_dynamics(req)
    assert res.route_id == "dolomites-kellner-night-traverse"
    assert res.route_title == "Dolomites Kellner Night Traverse"
    assert res.nocturnal_style == "moonlight_ridge"
    assert res.max_grade == "grade_d_very_difficult"
    assert res.effective_visibility_meters == 53
    assert res.bridge_sway_amplitude_cm == 22
    assert res.hypothermia_risk_index == 6
    assert res.safety_rating == "optimal_moonlight_ascent"
    assert len(res.lighting_recommendation) > 10
    assert len(res.nocturnal_advisory) > 10


def test_calculate_night_via_ferrata_dynamics_moonlight_and_visibility():
    # Full moon glare: moon_factor = 1.5
    # (800 / 15) * 1.5 = 80.0
    req_full = NightViaFerrataRequest(
        route_id="ouray-canyon-night-ferrata",
        moonlight_condition="full_moon_glare",
        headlamp_lumens=800.0,
    )
    res_full = calculate_night_via_ferrata_dynamics(req_full)
    assert res_full.effective_visibility_meters == 80

    # Max clamp at 120m
    req_high_lumens = NightViaFerrataRequest(
        route_id="ouray-canyon-night-ferrata",
        moonlight_condition="full_moon_glare",
        headlamp_lumens=2000.0,
    )
    res_high = calculate_night_via_ferrata_dynamics(req_high_lumens)
    assert res_high.effective_visibility_meters == 120


def test_calculate_night_via_ferrata_dynamics_safety_ratings():
    # Hazardous: headlamp < 400 on new moon pitch black
    req_pitch = NightViaFerrataRequest(
        route_id="telluride-krogerata-moonlight",
        moonlight_condition="new_moon_pitch_black",
        headlamp_lumens=350.0,
    )
    res_pitch = calculate_night_via_ferrata_dynamics(req_pitch)
    assert res_pitch.safety_rating == "hazardous_zero_visibility_abort"

    # Hazardous: wind > 55 kph
    req_wind = NightViaFerrataRequest(
        route_id="telluride-krogerata-moonlight",
        wind_gusts_kph=60.0,
    )
    res_wind = calculate_night_via_ferrata_dynamics(req_wind)
    assert res_wind.safety_rating == "hazardous_zero_visibility_abort"

    # Hazardous: temperature < -10 C
    req_cold = NightViaFerrataRequest(
        route_id="telluride-krogerata-moonlight",
        temperature_c=-12.0,
    )
    res_cold = calculate_night_via_ferrata_dynamics(req_cold)
    assert res_cold.safety_rating == "hazardous_zero_visibility_abort"

    # Caution: headlamp < 700
    req_caution_light = NightViaFerrataRequest(
        route_id="mammoth-pass-starlight-traverse",
        headlamp_lumens=600.0,
    )
    res_caution_light = calculate_night_via_ferrata_dynamics(req_caution_light)
    assert res_caution_light.safety_rating == "caution_high_headlamp_beam_required"

    # Caution: wind >= 35 kph
    req_caution_wind = NightViaFerrataRequest(
        route_id="mammoth-pass-starlight-traverse",
        wind_gusts_kph=35.0,
    )
    res_caution_wind = calculate_night_via_ferrata_dynamics(req_caution_wind)
    assert res_caution_wind.safety_rating == "caution_high_headlamp_beam_required"

    # Caution: temperature <= 0 C
    req_caution_temp = NightViaFerrataRequest(
        route_id="mammoth-pass-starlight-traverse",
        temperature_c=0.0,
    )
    res_caution_temp = calculate_night_via_ferrata_dynamics(req_caution_temp)
    assert res_caution_temp.safety_rating == "caution_high_headlamp_beam_required"


def test_calculate_night_via_ferrata_invalid_route():
    with pytest.raises(ValueError, match="not found"):
        calculate_night_via_ferrata_dynamics(
            NightViaFerrataRequest(route_id="nonexistent-route")
        )


def test_get_night_via_ferrata_gear_checklist():
    gear = get_night_via_ferrata_gear_checklist()
    assert len(gear) == 6
    item_ids = [g.item_id for g in gear]
    assert "high-lumen-dual-beam-headlamp" in item_ids
    assert "backup-helmet-mounted-light" in item_ids
    assert "en958-nocturnal-energy-absorber" in item_ids
    assert "type-k-glow-locking-carabiners" in item_ids
    assert "insulated-windproof-via-ferrata-gloves" in item_ids
    assert "reflective-alpine-harness-rest-sling" in item_ids
    for g in gear:
        assert g.mandatory is True
        assert len(g.purpose) > 10


def test_detect_night_via_ferrata_intent():
    # Empty / none
    assert detect_night_via_ferrata_intent("") is None
    assert detect_night_via_ferrata_intent("hello there") is None

    # Exclusions
    assert detect_night_via_ferrata_intent("Where is my order #12345?") is None
    assert detect_night_via_ferrata_intent("I want a refund on my headlamp") is None
    assert detect_night_via_ferrata_intent("pack llama moonlight trek") is None
    assert detect_night_via_ferrata_intent("sea turtle patrol at night") is None
    assert detect_night_via_ferrata_intent("caving night exploration") is None

    # Positive calculations
    intent_calc = detect_night_via_ferrata_intent(
        "Calculate suspension bridge sway and visibility for Dolomites Kellner night traverse"
    )
    assert intent_calc is not None
    assert intent_calc.action == "calculate"
    assert intent_calc.route_id == "dolomites-kellner-night-traverse"

    # Positive gear
    intent_gear = detect_night_via_ferrata_intent(
        "What is the nocturnal safety gear checklist and headlamp lumens for moonlight via ferrata?"
    )
    assert intent_gear is not None
    assert intent_gear.action == "gear"

    # Positive route detail
    intent_detail = detect_night_via_ferrata_intent(
        "Tell me about Telluride Krogerata midnight iron way route details and drop"
    )
    assert intent_detail is not None
    assert intent_detail.action == "route_detail"
    assert intent_detail.route_id == "telluride-krogerata-moonlight"

    # Positive routes list
    intent_list = detect_night_via_ferrata_intent(
        "List all night via ferrata routes and moonlight traverses"
    )
    assert intent_list is not None
    assert intent_list.action == "routes_list"


def test_disambiguation_with_daytime_via_ferrata():
    # Daytime detector must NOT catch night via ferrata keywords
    night_query = "Dolomites night via ferrata suspension bridge sway"
    assert detect_via_ferrata_intent(night_query) is None

    moonlight_query = "moonlight traverse Krogerata iron way"
    assert detect_via_ferrata_intent(moonlight_query) is None

    nocturnal_query = "nocturnal ferrata safety gear checklist"
    assert detect_via_ferrata_intent(nocturnal_query) is None

    # Night detector MUST catch them
    assert detect_night_via_ferrata_intent(night_query) is not None
    assert detect_night_via_ferrata_intent(moonlight_query) is not None
    assert detect_night_via_ferrata_intent(nocturnal_query) is not None


def test_format_night_via_ferrata_response():
    # Calculate
    calc_intent = NightViaFerrataIntent(
        action="calculate",
        route_id="dolomites-kellner-night-traverse",
    )
    formatted_calc = format_night_via_ferrata_response(calc_intent)
    assert isinstance(formatted_calc, str)
    assert "Dolomites Kellner Night Traverse" in formatted_calc
    assert "night_via_ferrata_info" in formatted_calc
    assert formatted_calc.get("night_via_ferrata_info")["action"] == "calculate"

    # Gear
    gear_intent = NightViaFerrataIntent(action="gear")
    formatted_gear = format_night_via_ferrata_response(gear_intent)
    assert "night_via_ferrata_info" in formatted_gear
    assert formatted_gear.get("night_via_ferrata_info")["action"] == "gear"
    assert len(formatted_gear.get("night_via_ferrata_info")["gear"]) == 6

    # Detail
    detail_intent = NightViaFerrataIntent(
        action="route_detail",
        route_id="ouray-canyon-night-ferrata",
    )
    formatted_detail = format_night_via_ferrata_response(detail_intent)
    assert "Ouray" in formatted_detail
    assert formatted_detail.get("night_via_ferrata_info")["action"] == "route_detail"

    # List
    list_intent = NightViaFerrataIntent(action="routes_list")
    formatted_list = format_night_via_ferrata_response(list_intent)
    assert "night_via_ferrata_info" in formatted_list
    assert len(formatted_list.get("night_via_ferrata_info")["routes"]) == 5


def test_build_night_via_ferrata_prompt():
    prompt = build_night_via_ferrata_prompt(
        NightViaFerrataIntent(
            action="route_detail",
            route_id="chamonix-aiguilles-rouges-darksky",
        )
    )
    assert "Chamonix Aiguilles Rouges Dark Sky Traverse" in prompt
    assert "Alpine Via Ferrata Night Suspension" in prompt


def test_night_via_ferrata_tool():
    res = night_via_ferrata_tool(action="calculate", route_id="dolomites-kellner-night-traverse")
    assert isinstance(res, dict)
    assert "night_via_ferrata_info" in res


def test_formatted_response_methods():
    raw_data = {"answer": "Alpine moonlight test", "night_via_ferrata_info": {"action": "custom"}}
    res = format_night_via_ferrata_response(raw_data)
    assert res == "Alpine moonlight test"
    assert res["night_via_ferrata_info"] == {"action": "custom"}
    assert list(res.keys()) == ["answer", "night_via_ferrata_info"]
    assert len(list(res.values())) == 2
    assert len(list(res.items())) == 2
    assert (123 in res) is False

    # String input to formatter
    res_str = format_night_via_ferrata_response("Tell me about Ouray night ferrata")
    assert "Ouray" in res_str


def test_detect_intent_all_routes_and_styles():
    assert detect_night_via_ferrata_intent("Ouray canyon night ferrata gorge").route_id == "ouray-canyon-night-ferrata"
    assert detect_night_via_ferrata_intent("Mammoth pass starlight crest traverse").route_id == "mammoth-pass-starlight-traverse"
    assert detect_night_via_ferrata_intent("Chamonix aiguilles rouges dark sky face").route_id == "chamonix-aiguilles-rouges-darksky"

    assert detect_night_via_ferrata_intent("night via ferrata starlight gorge").nocturnal_style == "starlight_gorge"
    assert detect_night_via_ferrata_intent("night via ferrata midnight amphitheater").nocturnal_style == "midnight_amphitheater"
    assert detect_night_via_ferrata_intent("night via ferrata starlight crest").nocturnal_style == "starlight_crest"
    assert detect_night_via_ferrata_intent("night via ferrata dark sky face").nocturnal_style == "dark_sky_face"


def test_night_via_ferrata_tool_list():
    res = night_via_ferrata_tool(action="routes_list", nocturnal_style="moonlight_ridge")
    assert isinstance(res, dict)
    assert "night_via_ferrata_info" in res
    assert res["night_via_ferrata_info"]["action"] == "routes_list"
