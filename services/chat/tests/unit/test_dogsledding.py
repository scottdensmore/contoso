import pytest
from contoso_chat.dogsledding import (
    DogsledIntent,
    DogsledRouteModel,
    MushingGearRequirement,
    MushingPacingRequest,
    MushingPacingResponse,
    build_dogsled_prompt,
    calculate_mushing_pacing,
    detect_dogsled_intent,
    extract_dogsled_intent,
    format_dogsled_response,
    get_dogsled_gear,
    get_dogsled_route_by_id,
    get_dogsled_routes,
)


def test_dogsled_route_model_validation():
    route = DogsledRouteModel(
        route_id="test-route",
        title="Test Wilderness Run",
        region="Alaska Range",
        distance_km=120.0,
        typical_duration_days=4,
        difficulty="advanced",
        trail_surface="groomed_hardpack",
        recommended_team_size=8,
        min_rest_ratio=1.0,
        low_temp_record_f=-45,
        description="A challenging wilderness test run.",
        highlights=["Frozen river crossing", "Spruce forest"],
    )
    assert route.route_id == "test-route"
    assert route.distance_km == 120.0
    assert route.recommended_team_size == 8
    assert route.min_rest_ratio == 1.0
    assert len(route.highlights) == 2


def test_mushing_pacing_request_defaults():
    req = MushingPacingRequest(route_id="iditarod-historic-trail-traverse")
    assert req.route_id == "iditarod-historic-trail-traverse"
    assert req.team_dog_count == 8
    assert req.ambient_temp_f == -10.0
    assert req.cargo_weight_kg == 65.0
    assert req.daily_run_hours == 6.0
    assert req.trail_surface == "groomed_hardpack"


def test_mushing_pacing_response_model():
    resp = MushingPacingResponse(
        route_id="boundary-waters-quetico-run",
        route_title="Boundary Waters & Quetico Wilderness Lake Run",
        effective_speed_kmh=14.0,
        daily_distance_km=84.0,
        dog_calories_per_day=9500,
        team_total_calories_per_day=76000,
        total_melt_water_liters=44.0,
        recommended_rest_hours=7.2,
        required_bootie_count=64,
        safety_status="OPTIMAL",
        trail_advisory="Trail conditions nominal.",
    )
    assert resp.route_id == "boundary-waters-quetico-run"
    assert resp.effective_speed_kmh == 14.0
    assert resp.dog_calories_per_day == 9500
    assert resp.required_bootie_count == 64


def test_mushing_gear_requirement_model():
    gear = MushingGearRequirement(
        item_id="dog-protective-booties",
        name="Dog Protective Booties",
        category="dog_wear",
        mandatory=True,
        purpose="Paw protection against ice and abrasions.",
    )
    assert gear.item_id == "dog-protective-booties"
    assert gear.mandatory is True


def test_get_dogsled_routes_all():
    routes = get_dogsled_routes()
    assert len(routes) == 5
    ids = [r.route_id for r in routes]
    assert "iditarod-historic-trail-traverse" in ids
    assert "boundary-waters-quetico-run" in ids
    assert "yukon-quest-eagle-summit" in ids
    assert "denali-sanctuary-river-patrol" in ids
    assert "maine-north-woods-allagash" in ids


def test_get_dogsled_routes_difficulty_filter():
    intermediate = get_dogsled_routes(difficulty="intermediate")
    assert len(intermediate) == 2
    int_ids = [r.route_id for r in intermediate]
    assert "boundary-waters-quetico-run" in int_ids
    assert "maine-north-woods-allagash" in int_ids

    advanced = get_dogsled_routes(difficulty="advanced")
    assert len(advanced) == 1
    assert advanced[0].route_id == "denali-sanctuary-river-patrol"

    expert = get_dogsled_routes(difficulty="expert")
    assert len(expert) == 2
    expert_ids = [r.route_id for r in expert]
    assert "iditarod-historic-trail-traverse" in expert_ids
    assert "yukon-quest-eagle-summit" in expert_ids


def test_get_dogsled_route_by_id_found():
    route = get_dogsled_route_by_id("iditarod-historic-trail-traverse")
    assert route is not None
    assert route.route_id == "iditarod-historic-trail-traverse"
    assert "Iditarod" in route.title
    assert route.recommended_team_size == 14
    assert route.low_temp_record_f == -60
    assert len(route.highlights) >= 3


def test_get_dogsled_route_by_id_not_found():
    assert get_dogsled_route_by_id("non-existent-route") is None


def test_get_dogsled_gear():
    gear = get_dogsled_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    gear_ids = [g.item_id for g in gear]
    assert "dog-protective-booties" in gear_ids
    assert "dual-claw-snow-hook" in gear_ids
    assert "aircraft-cable-gangline" in gear_ids
    assert "arctic-cooker-melt-pot" in gear_ids
    assert "high-fat-canine-rations" in gear_ids
    assert "musher-subzero-bivy-parka" in gear_ids


def test_calculate_mushing_pacing_standard():
    req = MushingPacingRequest(
        route_id="boundary-waters-quetico-run",
        team_dog_count=8,
        ambient_temp_f=-10.0,
        cargo_weight_kg=65.0,
        daily_run_hours=6.0,
        trail_surface="groomed_hardpack",
    )
    res = calculate_mushing_pacing(req)
    assert res.route_id == "boundary-waters-quetico-run"
    assert "Boundary Waters" in res.route_title
    assert res.effective_speed_kmh > 0
    assert res.daily_distance_km == round(res.effective_speed_kmh * 6.0, 1)
    assert 7000 <= res.dog_calories_per_day <= 15000
    assert res.team_total_calories_per_day == res.dog_calories_per_day * 8
    assert res.total_melt_water_liters >= 30.0
    assert res.recommended_rest_hours >= 6.0
    assert res.required_bootie_count >= 32
    assert res.safety_status in ("OPTIMAL", "CAUTION")
    assert "advisory" in res.trail_advisory.lower() or len(res.trail_advisory) > 10


def test_calculate_mushing_pacing_extreme_cold():
    req = MushingPacingRequest(
        route_id="yukon-quest-eagle-summit",
        team_dog_count=12,
        ambient_temp_f=-45.0,
        cargo_weight_kg=90.0,
        daily_run_hours=7.0,
        trail_surface="windblown_tundra",
    )
    res = calculate_mushing_pacing(req)
    # Cold increases thermoregulation caloric demands significantly
    assert res.dog_calories_per_day > 9000
    assert res.team_total_calories_per_day == res.dog_calories_per_day * 12
    # Extreme cold requires high water melting
    assert res.total_melt_water_liters > 40.0
    assert res.safety_status in ("CAUTION", "WARNING", "DANGER")
    assert "cold" in res.trail_advisory.lower() or "frostbite" in res.trail_advisory.lower() or "runner" in res.trail_advisory.lower()


def test_calculate_mushing_pacing_warm_weather_danger():
    req = MushingPacingRequest(
        route_id="maine-north-woods-allagash",
        team_dog_count=6,
        ambient_temp_f=32.0,
        cargo_weight_kg=50.0,
        daily_run_hours=6.0,
        trail_surface="groomed_hardpack",
    )
    res = calculate_mushing_pacing(req)
    # Dogs cannot sweat and risk hyperthermia above 25-30F
    assert res.safety_status in ("CAUTION", "WARNING", "DANGER")
    assert "heat" in res.trail_advisory.lower() or "hyperthermia" in res.trail_advisory.lower() or "warm" in res.trail_advisory.lower()


def test_calculate_mushing_pacing_river_overflow():
    req = MushingPacingRequest(
        route_id="denali-sanctuary-river-patrol",
        team_dog_count=8,
        ambient_temp_f=-20.0,
        cargo_weight_kg=70.0,
        daily_run_hours=5.0,
        trail_surface="river_overflow",
    )
    res = calculate_mushing_pacing(req)
    # Overflow presents severe ice-balling / frozen paw hazards
    assert "overflow" in res.trail_advisory.lower() or "bootie" in res.trail_advisory.lower() or "ice" in res.trail_advisory.lower()
    assert res.safety_status in ("CAUTION", "WARNING")


def test_calculate_mushing_pacing_invalid_route():
    req = MushingPacingRequest(route_id="unknown-route-id")
    with pytest.raises(ValueError, match="not found"):
        calculate_mushing_pacing(req)


def test_extract_dogsled_intent_keywords():
    intent1 = extract_dogsled_intent("Tell me about wilderness dogsledding routes")
    assert intent1 is not None
    assert intent1.action == "routes_list"

    intent2 = extract_dogsled_intent("What is the mandatory mushing expedition gear checklist?")
    assert intent2 is not None
    assert intent2.action == "gear_checklist"

    intent3 = extract_dogsled_intent("How do I calculate mushing pacing, sled dog caloric burn, and broth hydration?")
    assert intent3 is not None
    assert intent3.action == "calculate_pacing"

    intent4 = extract_dogsled_intent("How do you rig an aircraft cable gangline and snow hook for a 12-dog team?")
    assert intent4 is not None
    assert intent4.action in ("gear_checklist", "calculate_pacing", "routes_list")


def test_extract_dogsled_intent_routes():
    intent_iditarod = extract_dogsled_intent("Details on the Iditarod historic trail traverse expedition")
    assert intent_iditarod is not None
    assert intent_iditarod.route_id == "iditarod-historic-trail-traverse"
    assert intent_iditarod.action == "route_detail"

    intent_quetico = extract_dogsled_intent("Can I take my sled dog team on the Boundary Waters Quetico run?")
    assert intent_quetico is not None
    assert intent_quetico.route_id == "boundary-waters-quetico-run"
    assert intent_quetico.action in ("route_detail", "routes_list")

    intent_yukon = extract_dogsled_intent("Tell me about Yukon Quest Eagle Summit alpine crossing")
    assert intent_yukon is not None
    assert intent_yukon.route_id == "yukon-quest-eagle-summit"
    assert intent_yukon.action == "route_detail"

    intent_denali = extract_dogsled_intent("What is the Sanctuary River patrol route in Denali for mushers?")
    assert intent_denali is not None
    assert intent_denali.route_id == "denali-sanctuary-river-patrol"
    assert intent_denali.action == "route_detail"

    intent_allagash = extract_dogsled_intent("Explore the Maine North Woods Allagash mushing trail")
    assert intent_allagash is not None
    assert intent_allagash.route_id == "maine-north-woods-allagash"
    assert intent_allagash.action == "route_detail"


def test_extract_dogsled_intent_exclusions():
    # Must NOT hijack backcountry ski touring
    assert extract_dogsled_intent("What ski touring bindings should I use for Mount Rainier?") is None
    assert extract_dogsled_intent("Tell me about skin tracks and avalanche gear for splitboarding") is None

    # Must NOT hijack nordic / cross country skiing
    assert extract_dogsled_intent("Where can I find classic kick-and-glide cross country ski trails?") is None
    assert extract_dogsled_intent("What wax do I need for skate skiing at Methow Valley?") is None

    # Must NOT hijack wildlife encounters
    assert extract_dogsled_intent("What should I do if I encounter a grizzly bear in the backcountry?") is None
    assert extract_dogsled_intent("How do I store food to prevent wolves and bears from approaching camp?") is None

    # Customer support exclusions
    assert extract_dogsled_intent("Where is my order #12345 tracking?") is None
    assert extract_dogsled_intent("I want to return my tent and print a return label") is None


def test_detect_dogsled_intent_alias():
    # detect_dogsled_intent should be an alias of extract_dogsled_intent
    assert detect_dogsled_intent("Tell me about dogsledding") is not None


def test_format_dogsled_response_route_detail():
    intent = DogsledIntent(action="route_detail", route_id="iditarod-historic-trail-traverse")
    resp = format_dogsled_response(intent)
    assert isinstance(resp, str)
    assert "Iditarod" in str(resp)
    # Check dictionary-like access
    assert resp.get("dogsled_info") is not None
    assert resp["dogsled_info"]["action"] == "route_detail"
    assert resp["dogsled_info"]["route_id"] == "iditarod-historic-trail-traverse"


def test_format_dogsled_response_calculate_pacing():
    intent = DogsledIntent(
        action="calculate_pacing",
        route_id="boundary-waters-quetico-run",
        trail_surface="groomed_hardpack",
    )
    resp = format_dogsled_response(intent)
    assert isinstance(resp, str)
    assert "Boundary Waters" in str(resp) or "pacing" in str(resp).lower()
    info = resp.get("dogsled_info")
    assert info is not None
    assert info["action"] == "calculate_pacing"
    assert "daily_distance_km" in info or "effective_speed_kmh" in info


def test_format_dogsled_response_gear_checklist():
    intent = DogsledIntent(action="gear_checklist")
    resp = format_dogsled_response(intent)
    assert isinstance(resp, str)
    assert "booties" in str(resp).lower() or "gangline" in str(resp).lower() or "hook" in str(resp).lower()
    info = resp.get("dogsled_info")
    assert info is not None
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6


def test_format_dogsled_response_routes_list():
    intent = DogsledIntent(action="routes_list")
    resp = format_dogsled_response(intent)
    assert isinstance(resp, str)
    assert "Iditarod" in str(resp)
    info = resp.get("dogsled_info")
    assert info is not None
    assert info["action"] == "routes_list"
    assert len(info["routes"]) == 5


def test_build_dogsled_prompt():
    intent_route = DogsledIntent(action="route_detail", route_id="yukon-quest-eagle-summit")
    prompt = build_dogsled_prompt(intent_route)
    assert isinstance(prompt, str)
    assert "Yukon Quest" in prompt or "Eagle Summit" in prompt
    assert "welfare" in prompt.lower() or "canine" in prompt.lower() or "sled dog" in prompt.lower()

    intent_gear = DogsledIntent(action="gear_checklist")
    prompt_gear = build_dogsled_prompt(intent_gear)
    assert "booties" in prompt_gear.lower() or "gangline" in prompt_gear.lower()
def test_calculate_mushing_pacing_various_temperatures_and_hours():
    # Temp > 15 but <= 20
    req_18 = MushingPacingRequest(
        route_id="boundary-waters-quetico-run",
        ambient_temp_f=18.0,
    )
    res_18 = calculate_mushing_pacing(req_18)
    assert res_18.effective_speed_kmh > 0

    # Temp between 20 and 25
    req_22 = MushingPacingRequest(
        route_id="boundary-waters-quetico-run",
        ambient_temp_f=22.0,
    )
    res_22 = calculate_mushing_pacing(req_22)
    assert "overheating" in res_22.trail_advisory.lower() or "warm" in res_22.trail_advisory.lower()

    # Temp between -25 and -40
    req_30 = MushingPacingRequest(
        route_id="boundary-waters-quetico-run",
        ambient_temp_f=-30.0,
    )
    res_30 = calculate_mushing_pacing(req_30)
    assert res_30.effective_speed_kmh > 0

    # Temp < -50
    req_55 = MushingPacingRequest(
        route_id="boundary-waters-quetico-run",
        ambient_temp_f=-55.0,
    )
    res_55 = calculate_mushing_pacing(req_55)
    assert res_55.safety_status == "DANGER"
    assert "bronchial" in res_55.trail_advisory.lower() or "frostbite" in res_55.trail_advisory.lower()

    # Run hours > 12
    req_14h = MushingPacingRequest(
        route_id="boundary-waters-quetico-run",
        daily_run_hours=14.0,
    )
    res_14h = calculate_mushing_pacing(req_14h)
    assert res_14h.safety_status == "DANGER"
    assert "welfare" in res_14h.trail_advisory.lower()

    # Run hours between 8 and 12
    req_9h = MushingPacingRequest(
        route_id="boundary-waters-quetico-run",
        daily_run_hours=9.0,
    )
    res_9h = calculate_mushing_pacing(req_9h)
    assert "mileage" in res_9h.trail_advisory.lower() or "exhaustion" in res_9h.trail_advisory.lower()

    # Cargo per dog > 20 kg
    req_heavy = MushingPacingRequest(
        route_id="boundary-waters-quetico-run",
        team_dog_count=6,
        cargo_weight_kg=150.0,
    )
    res_heavy = calculate_mushing_pacing(req_heavy)
    assert res_heavy.safety_status == "DANGER"
    assert "overloaded" in res_heavy.trail_advisory.lower()

    # Cargo per dog between 12 and 20 kg
    req_medium = MushingPacingRequest(
        route_id="boundary-waters-quetico-run",
        team_dog_count=6,
        cargo_weight_kg=85.0,
    )
    res_medium = calculate_mushing_pacing(req_medium)
    assert "wheel dogs" in res_medium.trail_advisory.lower() or "heavy cargo" in res_medium.trail_advisory.lower()

    # Under-teamed route
    req_under = MushingPacingRequest(
        route_id="iditarod-historic-trail-traverse",
        team_dog_count=6,
    )
    res_under = calculate_mushing_pacing(req_under)
    assert "under-teamed" in res_under.trail_advisory.lower()


def test_extract_dogsled_intent_surfaces_and_difficulties():
    intent_intermediate = extract_dogsled_intent("Looking for intermediate difficulty dogsledding on groomed hardpack")
    assert intent_intermediate is not None
    assert intent_intermediate.difficulty == "intermediate"
    assert intent_intermediate.trail_surface == "groomed_hardpack"

    intent_advanced = extract_dogsled_intent("Advanced mushing trail on deep powder")
    assert intent_advanced is not None
    assert intent_advanced.difficulty == "advanced"
    assert intent_advanced.trail_surface == "deep_powder"

    intent_expert = extract_dogsled_intent("Expert dogsled expedition on windblown tundra with river overflow")
    assert intent_expert is not None
    assert intent_expert.difficulty == "expert"
    assert intent_expert.trail_surface == "river_overflow"

    # Match route_id directly
    intent_direct = extract_dogsled_intent("Can you tell me more about iditarod-historic-trail-traverse in Alaska?")
    assert intent_direct is not None
    assert intent_direct.route_id == "iditarod-historic-trail-traverse"
    assert intent_direct.action == "route_detail"

    # Route with gear
    intent_route_gear = extract_dogsled_intent("What gear is needed for Iditarod?")
    assert intent_route_gear is not None
    assert intent_route_gear.action in ("gear_checklist", "route_detail")

    # Plain route
    intent_plain = extract_dogsled_intent("Iditarod")
    assert intent_plain is not None
    assert intent_plain.action == "route_detail"


def test_formatted_dogsled_response_dict_methods():
    intent = DogsledIntent(action="routes_list")
    resp = format_dogsled_response(intent)
    assert "dogsled_info" in resp
    assert resp["dogsled_info"] is not None
    assert "non_existent" not in resp
    assert "dogsled_info" in list(resp.keys())
    assert len(list(resp.values())) > 0
    assert len(list(resp.items())) > 0
    assert resp.get("unknown_key", "default") == "default"


def test_build_dogsled_prompt_all_actions():
    p_pacing = build_dogsled_prompt(DogsledIntent(action="calculate_pacing"))
    assert "Pacing Physics" in p_pacing or "caloric" in p_pacing.lower()

    p_routes = build_dogsled_prompt(DogsledIntent(action="routes_list"))
    assert "Available Dogsledding Routes" in p_routes
