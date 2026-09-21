import pytest
from contoso_chat.bikepacking import (
    BikepackingGearRequirement,
    BikepackingIntent,
    BikepackingRigRequest,
    BikepackingRigResponse,
    BikepackingRouteModel,
    build_bikepacking_prompt,
    calculate_bikepacking_rig,
    detect_bikepacking_intent,
    format_bikepacking_response,
    get_bikepacking_gear,
    get_bikepacking_route_by_id,
    get_bikepacking_routes,
)


def test_get_bikepacking_routes_all():
    routes = get_bikepacking_routes()
    assert len(routes) == 5
    ids = [r.route_id for r in routes]
    assert "cross-washington-xwa" in ids
    assert "oregon-outback" in ids
    assert "great-divide-montana" in ids
    assert "olympic-adventure-trail-loop" in ids
    assert "cascade-hut-to-hut-gravel" in ids


def test_get_bikepacking_routes_filtered():
    gravel_routes = get_bikepacking_routes(terrain="gravel_fire_road")
    assert len(gravel_routes) == 1
    assert gravel_routes[0].route_id == "oregon-outback"

    singletrack_routes = get_bikepacking_routes(terrain="rugged_singletrack")
    assert len(singletrack_routes) == 1
    assert singletrack_routes[0].route_id == "olympic-adventure-trail-loop"

    empty = get_bikepacking_routes(terrain="non_existent_terrain")
    assert empty == []


def test_get_bikepacking_route_by_id():
    route = get_bikepacking_route_by_id("cross-washington-xwa")
    assert route is not None
    assert isinstance(route, BikepackingRouteModel)
    assert route.route_id == "cross-washington-xwa"
    assert route.name == "Cross-Washington Mountain Bike Route (XWA)"
    assert route.distance_miles == 680.0
    assert route.elevation_gain_ft == 34000
    assert route.recommended_tire_width_mm == 50
    assert route.typical_days == 7
    assert route.resupply_interval_miles == 65
    assert route.water_carry_liters == 3.5
    assert len(route.highlights) == 4

    missing = get_bikepacking_route_by_id("non-existent-route")
    assert missing is None


def test_get_bikepacking_gear():
    gear = get_bikepacking_gear()
    assert len(gear) == 6
    for item in gear:
        assert isinstance(item, BikepackingGearRequirement)
        assert item.item_id
        assert item.name
        assert item.category in ["repair_tools", "bike_bags", "hydration_fuel", "sleep_system", "electronics"]
        assert item.mandatory is True
        assert item.purpose

    gear_ids = [g.item_id for g in gear]
    assert "multi-tool" in gear_ids
    assert "tubeless-plugs" in gear_ids
    assert "mini-pump-co2" in gear_ids
    assert "derailleur-hanger-link" in gear_ids
    assert "waterproof-bag-system" in gear_ids
    assert "gravity-water-filter" in gear_ids


def test_calculate_bikepacking_rig_standard():
    req = BikepackingRigRequest(
        route_id="oregon-outback",
        trip_duration_days=3,
        shelter_type="bikepacking_tent",
        rider_weight_lbs=165.0,
    )
    res = calculate_bikepacking_rig(req)
    assert isinstance(res, BikepackingRigResponse)
    assert res.route_id == "oregon-outback"
    assert res.route_name == "Oregon Outback Gravel Epic"
    # Tire pressure: width 45mm, weight 165
    # delta = (165 - 160) * 0.12 = 0.6
    # rear_psi = round(70 - 45 * 0.8 + 0.6) = 35.0
    # front_psi = round(35.0 * 0.9) = 32.0
    assert res.rear_tire_psi == 35.0
    assert res.front_tire_psi == 32.0
    # Bag capacity:
    # frame_bag = min(12, 6 + round(3 * 0.6)) = 8.0
    # seat_pack = min(16, 8 + round(3 * 0.8)) = 10.0
    # handlebar_roll = 14.0 (tent)
    # total = 32.0
    assert res.frame_bag_liters == 8.0
    assert res.seat_pack_liters == 10.0
    assert res.handlebar_roll_liters == 14.0
    assert res.total_bag_capacity_liters == 32.0
    # Gear weight: 11.5 + 4.2 + 5.0 + 3 * 1.75 = 25.95 -> 26.0
    assert res.total_gear_weight_lbs == 26.0
    # Daily calories: 2200 + (364/4)*25 + (14500/4)*0.15 = 2200 + 2275 + 543.75 = 5018.75 -> 5019
    assert res.daily_calories_kcal == 5019
    assert res.daily_water_liters == 4.0
    assert len(res.mechanical_spares) == 5
    assert "Tubeless tire plug kit (bacon strips) & brass insertion tool" in res.mechanical_spares
    assert "Spare derailleur hanger matching frame dropout spec" in res.mechanical_spares


def test_calculate_bikepacking_rig_technical_terrain():
    req = BikepackingRigRequest(
        route_id="olympic-adventure-trail-loop",
        trip_duration_days=2,
        shelter_type="ultralight_bivy",
        rider_weight_lbs=170.0,
    )
    res = calculate_bikepacking_rig(req)
    # Olympic singletrack has extra spare
    assert len(res.mechanical_spares) == 6
    assert "Replacement disc brake pads & rotor truing fork" in res.mechanical_spares
    assert res.handlebar_roll_liters == 9.0


def test_calculate_bikepacking_rig_invalid_route():
    req = BikepackingRigRequest(route_id="unknown-route")
    with pytest.raises(ValueError, match="not found"):
        calculate_bikepacking_rig(req)


def test_detect_bikepacking_intent_routes_list():
    intent = detect_bikepacking_intent("What are the best bikepacking routes in the Pacific Northwest?")
    assert intent is not None
    assert intent.action == "routes_list"

    intent_gravel = detect_bikepacking_intent("I am looking for gravel touring routes on fire roads")
    assert intent_gravel is not None
    assert intent_gravel.action == "routes_list"
    assert intent_gravel.terrain == "gravel_fire_road"


def test_detect_bikepacking_intent_route_detail():
    intent = detect_bikepacking_intent("Tell me about the Oregon Outback route and its elevation profile")
    assert intent is not None
    assert intent.action == "route_detail"
    assert intent.route_id == "oregon-outback"

    intent_xwa = detect_bikepacking_intent("What are the highlights of the Cross-Washington XWA?")
    assert intent_xwa is not None
    assert intent_xwa.action == "route_detail"
    assert intent_xwa.route_id == "cross-washington-xwa"


def test_detect_bikepacking_intent_rig_calc():
    intent = detect_bikepacking_intent("What tire pressure and bag capacity do I need for my bikepacking rig on the Great Divide?")
    assert intent is not None
    assert intent.action == "rig_calc"
    assert intent.route_id == "great-divide-montana"

    intent_tire = detect_bikepacking_intent("What tire width for bikepacking and what psi should I run?")
    assert intent_tire is not None
    assert intent_tire.action == "rig_calc"

    intent_bags = detect_bikepacking_intent("How much volume do I need in my frame bag, seat pack, and handlebar roll for bikepacking?")
    assert intent_bags is not None
    assert intent_bags.action == "rig_calc"


def test_detect_bikepacking_intent_gear_checklist():
    intent = detect_bikepacking_intent("What is on the mandatory bikepacking repair kit and gear checklist?")
    assert intent is not None
    assert intent.action == "gear_checklist"


def test_detect_bikepacking_intent_disambiguation_guards():
    # Must NOT hijack generic queries
    assert detect_bikepacking_intent("What are the best hiking trails around Mount Rainier?") is None
    assert detect_bikepacking_intent("What trail running shoes should I wear for a 50k ultra?") is None
    assert detect_bikepacking_intent("Where can I find natural hot springs in Washington?") is None
    assert detect_bikepacking_intent("What fly should I use for cutthroat trout on the Yakima River?") is None
    assert detect_bikepacking_intent("What is the avalanche forecast for Snoqualmie Pass ski touring?") is None
    assert detect_bikepacking_intent("How do I filter water on a backcountry camping trip?") is None
    assert detect_bikepacking_intent("Can I rent a road cycling bike for the Seattle to Portland ride?") is None


def test_build_bikepacking_prompt():
    intent_rig = BikepackingIntent(action="rig_calc", route_id="oregon-outback")
    prompt_rig = build_bikepacking_prompt(intent_rig)
    assert "Oregon Outback" in prompt_rig
    assert "Tire Pressure" in prompt_rig or "PSI" in prompt_rig
    assert "Bag Capacity" in prompt_rig

    intent_gear = BikepackingIntent(action="gear_checklist")
    prompt_gear = build_bikepacking_prompt(intent_gear)
    assert "repair kit" in prompt_gear.lower() or "gear" in prompt_gear.lower()
    assert "multi-tool" in prompt_gear.lower() or "tubeless" in prompt_gear.lower()

    intent_detail = BikepackingIntent(action="route_detail", route_id="cross-washington-xwa")
    prompt_detail = build_bikepacking_prompt(intent_detail)
    assert "Cross-Washington" in prompt_detail
    assert "680" in prompt_detail

    intent_list = BikepackingIntent(action="routes_list")
    prompt_list = build_bikepacking_prompt(intent_list)
    assert "Cross-Washington" in prompt_list
    assert "Oregon Outback" in prompt_list


def test_format_bikepacking_response():
    res_rig = format_bikepacking_response(BikepackingIntent(action="rig_calc", route_id="oregon-outback"))
    assert "answer" in res_rig
    assert "bikepacking_info" in res_rig
    assert res_rig["bikepacking_info"]["action"] == "rig_calc"
    assert res_rig["bikepacking_info"]["route_id"] == "oregon-outback"
    assert res_rig["bikepacking_info"]["front_tire_psi"] == 32.0

    res_gear = format_bikepacking_response(BikepackingIntent(action="gear_checklist"))
    assert "bikepacking_info" in res_gear
    assert res_gear["bikepacking_info"]["action"] == "gear_checklist"
    assert len(res_gear["bikepacking_info"]["gear"]) == 6

    res_detail = format_bikepacking_response(BikepackingIntent(action="route_detail", route_id="cross-washington-xwa"))
    assert "bikepacking_info" in res_detail
    assert res_detail["bikepacking_info"]["action"] == "route_detail"
    assert res_detail["bikepacking_info"]["route_id"] == "cross-washington-xwa"

    res_list = format_bikepacking_response(BikepackingIntent(action="routes_list"))
    assert "bikepacking_info" in res_list
    assert res_list["bikepacking_info"]["action"] == "routes_list"
    assert len(res_list["bikepacking_info"]["routes"]) == 5
