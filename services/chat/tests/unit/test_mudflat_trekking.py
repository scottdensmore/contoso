import pytest
from contoso_chat.mudflat_trekking import (
    FormattedMudflatResponse,
    MudflatGearModel,
    MudflatIntent,
    MudflatRequest,
    MudflatResponse,
    MudflatRouteModel,
    build_mudflat_trekking_prompt,
    calculate_mudflat_dynamics,
    detect_mudflat_intent,
    format_mudflat_response,
    get_mudflat_gear_checklist,
    get_mudflat_route,
    get_mudflat_routes,
    mudflat_trekking_tool,
)


def test_mudflat_route_model():
    route = MudflatRouteModel(
        route_id="wadden-sea-neuwerk-traverse",
        title="Wadden Sea Neuwerk Traverse",
        estuary_location="Cuxhaven-Sahlenburg to Neuwerk Island",
        region="Lower Saxony Wadden Sea National Park, Germany",
        route_distance_km=12.5,
        tidal_window_hours=4.0,
        max_silt_depth_cm=35,
        terrain_profile="soft_estuary_silt",
        description="Historic Wattwandern tidal flat traverse across exposed North Sea seabed.",
        highlights=[
            "Prikken-marked tidal fairway",
            "Duhner Loch tidal creek crossing",
            "Emergency rescue beacon cages (Rettungsbaken)",
        ],
    )
    assert route.route_id == "wadden-sea-neuwerk-traverse"
    assert route.route_distance_km == 12.5
    assert route.tidal_window_hours == 4.0
    assert route.max_silt_depth_cm == 35
    assert route.terrain_profile == "soft_estuary_silt"
    assert len(route.highlights) == 3


def test_get_mudflat_routes_all():
    routes = get_mudflat_routes()
    assert len(routes) == 5
    route_ids = [r.route_id for r in routes]
    assert "wadden-sea-neuwerk-traverse" in route_ids
    assert "bay-of-fundy-miners-marsh" in route_ids
    assert "mont-saint-michel-bay" in route_ids
    assert "morecambe-bay-sands" in route_ids
    assert "turnagain-arm-mudflats" in route_ids


def test_get_mudflat_routes_filtering():
    silt_routes = get_mudflat_routes(terrain="soft_estuary_silt")
    assert len(silt_routes) >= 2
    for r in silt_routes:
        assert r.terrain_profile == "soft_estuary_silt"

    quicksilt_routes = get_mudflat_routes(terrain="deep_quicksilt_ooze")
    assert len(quicksilt_routes) >= 2
    for r in quicksilt_routes:
        assert r.terrain_profile == "deep_quicksilt_ooze"

    sand_routes = get_mudflat_routes(terrain="firm_compact_sand")
    assert len(sand_routes) == 1
    assert sand_routes[0].route_id == "morecambe-bay-sands"


def test_get_mudflat_route_lookup():
    route = get_mudflat_route("wadden-sea-neuwerk-traverse")
    assert route is not None
    assert route.title == "Wadden Sea Neuwerk Traverse"
    assert route.tidal_window_hours == 4.0

    invalid = get_mudflat_route("nonexistent-traverse")
    assert invalid is None


def test_calculate_mudflat_dynamics_default():
    req = MudflatRequest()
    res = calculate_mudflat_dynamics(req)
    assert isinstance(res, MudflatResponse)
    assert res.route_id == "wadden-sea-neuwerk-traverse"
    assert res.route_title == "Wadden Sea Neuwerk Traverse"
    assert res.terrain_profile == "soft_estuary_silt"
    # remaining_tidal_window_minutes = round(4.0 * 60 - 45) = 195
    assert res.remaining_tidal_window_minutes == 195
    # terrain_factor = 3 for soft_estuary_silt. silt_suction_drag_index = round(25.0 / 8.0 + 3) = 6
    assert res.silt_suction_drag_index == 6
    # phase_offset = 10 for slack_low_tide. prielen_wading_depth_cm = round(25.0 * 1.4 + 10) = 45
    assert res.prielen_wading_depth_cm == 45
    assert res.tidal_hazard_rating == "safe_low_tide_window"
    assert len(res.evacuation_advisory) > 10
    assert len(res.navigation_guidance) > 10


def test_calculate_mudflat_dynamics_caution():
    # remaining_tidal_window_minutes < 75 or silt_depth_cm >= 30.0 or tidal_phase == "mid_flood_rising"
    req = MudflatRequest(
        route_id="wadden-sea-neuwerk-traverse",
        silt_depth_cm=35.0,
        elapsed_time_minutes=170.0,
        tidal_phase="mid_flood_rising",
    )
    res = calculate_mudflat_dynamics(req)
    assert isinstance(res, MudflatResponse)
    # remaining = round(240 - 170) = 70 (< 75)
    assert res.remaining_tidal_window_minutes == 70
    # suction = round(35.0 / 8.0 + 3) = round(4.375 + 3) = 7
    assert res.silt_suction_drag_index == 7
    # prielen = round(35.0 * 1.4 + 30) = round(49.0 + 30) = 79
    assert res.prielen_wading_depth_cm == 79
    assert res.tidal_hazard_rating == "caution_accelerated_flood_return"
    assert "CAUTION" in res.evacuation_advisory.upper() or "FLOOD" in res.evacuation_advisory.upper()


def test_calculate_mudflat_dynamics_hazardous():
    # remaining_tidal_window_minutes < 40 or silt_depth_cm > 45.0 or tidal_phase == "spring_bore_incoming"
    req = MudflatRequest(
        route_id="bay-of-fundy-miners-marsh",
        silt_depth_cm=48.0,
        elapsed_time_minutes=150.0,
        tidal_phase="spring_bore_incoming",
    )
    res = calculate_mudflat_dynamics(req)
    assert isinstance(res, MudflatResponse)
    # route tidal_window_hours = 3.0 -> 180 min. elapsed = 150 -> remaining = 30 (< 40)
    assert res.remaining_tidal_window_minutes == 30
    assert res.tidal_hazard_rating == "hazardous_quicksilt_tidal_entrapment"
    # phase_offset = 65 for spring_bore_incoming. prielen = round(48.0 * 1.4 + 65) = round(67.2 + 65) = 132
    assert res.prielen_wading_depth_cm == 132
    assert "CRITICAL" in res.evacuation_advisory.upper() or "EVACUATION" in res.evacuation_advisory.upper() or "IMMEDIATE" in res.evacuation_advisory.upper()


def test_calculate_mudflat_dynamics_unknown_route():
    req = MudflatRequest(route_id="unknown-mudflat-route")
    with pytest.raises(ValueError, match="not found"):
        calculate_mudflat_dynamics(req)


def test_get_mudflat_gear_checklist():
    gear = get_mudflat_gear_checklist()
    assert len(gear) == 6
    assert all(isinstance(g, MudflatGearModel) for g in gear)
    item_ids = [g.item_id for g in gear]
    assert "neoprene-mudflat-suction-booties" in item_ids
    assert "wattwandern-wading-staff" in item_ids
    mandatory = [g for g in gear if g.mandatory]
    assert len(mandatory) >= 3


def test_detect_mudflat_intent():
    # Negative cases: None, empty, whitespace
    assert detect_mudflat_intent("") is None
    assert detect_mudflat_intent("   ") is None

    # Exclusions
    assert detect_mudflat_intent("Where is my order #12345?") is None
    assert detect_mudflat_intent("I want a refund for my mud booties") is None
    assert detect_mudflat_intent("beachcombing along the tidal shore") is None
    assert detect_mudflat_intent("canyon bouldering crash pad options") is None
    assert detect_mudflat_intent("pack goat traverse in mountains") is None
    assert detect_mudflat_intent("rental booties for the weekend") is None
    assert detect_mudflat_intent("falconry raptor handling") is None

    # Calculate intent
    intent_calc = detect_mudflat_intent(
        "Calculate mudflat trekking dynamics and prielen creek depth for Wadden Sea Neuwerk"
    )
    assert intent_calc is not None
    assert intent_calc.action == "calculate"
    assert intent_calc.route_id == "wadden-sea-neuwerk-traverse"

    # Gear intent
    intent_gear = detect_mudflat_intent("What gear do I need for wattwandern coastal walking?")
    assert intent_gear is not None
    assert intent_gear.action == "gear"

    # Route detail intent
    intent_detail = detect_mudflat_intent("Tell me about Mont-Saint-Michel bay silt crossing")
    assert intent_detail is not None
    assert intent_detail.action == "route_detail"
    assert intent_detail.route_id == "mont-saint-michel-bay"

    # Routes list intent
    intent_list = detect_mudflat_intent("Show me all tidal flat traverse routes and mudflat hiking options")
    assert intent_list is not None
    assert intent_list.action == "routes_list"

    # Terrain profile detection
    intent_terrain = detect_mudflat_intent("List routes with deep quicksilt ooze estuary silt")
    assert intent_terrain is not None
    assert intent_terrain.terrain_profile in ("deep_quicksilt_ooze", "soft_estuary_silt")

    # Additional route and terrain keywords
    intent_morecambe = detect_mudflat_intent("Morecambe bay Queen's Guide sands firm compact sand")
    assert intent_morecambe is not None
    assert intent_morecambe.route_id == "morecambe-bay-sands"
    assert intent_morecambe.terrain_profile == "firm_compact_sand"

    intent_turnagain = detect_mudflat_intent("Turnagain Arm mudflats shell gravel shallows")
    assert intent_turnagain is not None
    assert intent_turnagain.route_id == "turnagain-arm-mudflats"
    assert intent_turnagain.terrain_profile == "shell_gravel_shallows"

    intent_fundy_short = detect_mudflat_intent("Bay of fundy miners marsh mud traverse")
    assert intent_fundy_short is not None
    assert intent_fundy_short.route_id == "bay-of-fundy-miners-marsh"


def test_format_mudflat_response():
    # Calculate format
    intent_calc = MudflatIntent(action="calculate", route_id="wadden-sea-neuwerk-traverse")
    fmt_calc = format_mudflat_response(intent_calc)
    assert isinstance(fmt_calc, FormattedMudflatResponse)
    assert isinstance(str(fmt_calc), str)
    assert "mudflat_trekking_info" in fmt_calc
    calc_data = fmt_calc["mudflat_trekking_info"]
    assert calc_data["action"] == "calculate"
    assert calc_data["route_id"] == "wadden-sea-neuwerk-traverse"
    assert "remaining_tidal_window_minutes" in calc_data
    assert "silt_suction_drag_index" in calc_data

    # Test dict-like methods on FormattedMudflatResponse
    assert "mudflat_trekking_info" in fmt_calc
    assert "nonexistent_key" not in fmt_calc
    assert len(list(fmt_calc.keys())) > 0
    assert len(list(fmt_calc.values())) > 0
    assert len(list(fmt_calc.items())) > 0

    # Gear format
    intent_gear = MudflatIntent(action="gear")
    fmt_gear = format_mudflat_response(intent_gear)
    gear_data = fmt_gear.get("mudflat_trekking_info")
    assert gear_data["action"] == "gear"
    assert len(gear_data["gear"]) == 6
    assert gear_data["mandatory_count"] >= 3

    # Route detail format
    intent_detail = MudflatIntent(action="route_detail", route_id="bay-of-fundy-miners-marsh")
    fmt_detail = format_mudflat_response(intent_detail)
    detail_data = fmt_detail.get("mudflat_trekking_info")
    assert detail_data["action"] == "route_detail"
    assert detail_data["route_id"] == "bay-of-fundy-miners-marsh"
    assert detail_data["route"]["tidal_window_hours"] == 3.0

    # Routes list format
    intent_list = MudflatIntent(action="routes_list")
    fmt_list = format_mudflat_response(intent_list)
    list_data = fmt_list.get("mudflat_trekking_info")
    assert list_data["action"] == "routes_list"
    assert len(list_data["routes"]) == 5

    # Dict input format
    raw_dict = {"answer": "Custom mud response", "mudflat_trekking_info": {"custom": True}}
    fmt_dict = format_mudflat_response(raw_dict)
    assert str(fmt_dict) == "Custom mud response"
    assert fmt_dict.get("mudflat_trekking_info") == {"custom": True}

    # String input format
    fmt_str = format_mudflat_response("Tell me about wattwandern mudflat trekking gear")
    assert "mudflat_trekking_info" in fmt_str
    assert fmt_str.get("mudflat_trekking_info")["action"] == "gear"


def test_build_mudflat_trekking_prompt():
    prompt = build_mudflat_trekking_prompt()
    assert "Tidal Flat" in prompt or "Mud-Trekking" in prompt or "Wattwandern" in prompt
    assert "Prikken" in prompt or "prielen" in prompt or "quicksilt" in prompt

    prompt_with_route = build_mudflat_trekking_prompt(
        MudflatIntent(action="route_detail", route_id="wadden-sea-neuwerk-traverse")
    )
    assert "Wadden Sea Neuwerk Traverse" in prompt_with_route
    assert "Prikken-marked" in prompt_with_route


def test_mudflat_trekking_tool():
    # Test calculate via tool
    res_calc = mudflat_trekking_tool(action="calculate", route_id="wadden-sea-neuwerk-traverse")
    assert "mudflat_trekking_info" in res_calc
    assert res_calc["mudflat_trekking_info"]["action"] == "calculate"

    # Test gear via tool
    res_gear = mudflat_trekking_tool(action="gear")
    assert "mudflat_trekking_info" in res_gear
    assert res_gear["mudflat_trekking_info"]["action"] == "gear"

    # Test list via tool
    res_list = mudflat_trekking_tool(action="routes_list")
    assert "mudflat_trekking_info" in res_list
    assert res_list["mudflat_trekking_info"]["action"] == "routes_list"
