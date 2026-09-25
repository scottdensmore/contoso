import pytest
from contoso_chat.trail_packing import (
    FormattedTrailPackingResponse,
    PackRouteModel,
    TackChecklistItemModel,
    TrailPackingRequest,
    TrailPackingResponse,
    calculate_trail_packing,
    detect_trail_packing_intent,
    format_trail_packing_response,
    get_pack_route,
    get_pack_routes,
    get_tack_checklist,
)


def test_pack_route_model():
    route = PackRouteModel(
        route_id="bob-marshall-wilderness",
        title="Bob Marshall Wilderness & Chinese Wall Pack String",
        wilderness_area="Bob Marshall Wilderness",
        national_forest="Flathead National Forest, MT, USA",
        elevation_m=2300,
        saddle_type="decker",
        terrain="mountain_pass",
        max_string_mules=6,
        typical_days=7,
        description="A rugged northern Rockies pack expedition along the Chinese Wall.",
        route_highlights=["Chinese Wall limestone escarpment", "Highline tree saver overnight picketing"],
    )
    assert route.route_id == "bob-marshall-wilderness"
    assert route.saddle_type == "decker"
    assert route.elevation_m == 2300
    assert len(route.route_highlights) == 2


def test_get_pack_routes_catalog():
    routes = get_pack_routes()
    assert len(routes) == 5
    route_ids = [r.route_id for r in routes]
    assert "bob-marshall-wilderness" in route_ids
    assert "pasayten-wilderness" in route_ids
    assert "wind-river-range" in route_ids
    assert "pecos-wilderness" in route_ids
    assert "frank-church-river-of-no-return" in route_ids


def test_get_pack_routes_saddle_filter():
    decker_routes = get_pack_routes(saddle_type="decker")
    assert len(decker_routes) == 3
    assert all(r.saddle_type == "decker" for r in decker_routes)

    sawbuck_routes = get_pack_routes(saddle_type="sawbuck")
    assert len(sawbuck_routes) == 2
    assert all(r.saddle_type == "sawbuck" for r in sawbuck_routes)


def test_get_pack_route_by_id():
    route = get_pack_route("bob-marshall-wilderness")
    assert route is not None
    assert route.title == "Bob Marshall Wilderness & Chinese Wall Pack String"
    assert route.national_forest == "Flathead National Forest, MT, USA"

    assert get_pack_route("nonexistent-pack-route") is None


def test_get_tack_checklist():
    checklist = get_tack_checklist()
    assert len(checklist) == 6
    assert all(isinstance(item, TackChecklistItemModel) for item in checklist)
    assert all(item.mandatory is True for item in checklist)

    item_ids = [item.item_id for item in checklist]
    expected_ids = [
        "tree-saver-highline-straps",
        "breakaway-lead-ropes",
        "contoured-pack-pads",
        "bear-resistant-panniers",
        "easyboot-trail-spares",
        "leather-punch-mending-kit",
    ]
    for exp_id in expected_ids:
        assert exp_id in item_ids


def test_calculate_trail_packing_optimal():
    req = TrailPackingRequest(
        route_id="bob-marshall-wilderness",
        stock_animal="mule",
        left_pannier_lbs=65.0,
        right_pannier_lbs=65.0,
        top_pack_lbs=20.0,
        hitch_type="diamond_hitch",
    )
    res = calculate_trail_packing(req)
    assert isinstance(res, TrailPackingResponse)
    assert res.route_id == "bob-marshall-wilderness"
    assert res.stock_animal == "mule"
    assert res.total_payload_lbs == 150.0
    assert res.weight_difference_lbs == 0.0
    assert res.balance_ratio == 1.0
    assert res.balance_status == "balanced"
    assert res.payload_capacity_status == "within_capacity"
    assert res.highline_spacing_m >= 3.0
    assert "diamond" in res.recommended_hitch_adjustment.lower()


def test_calculate_trail_packing_acceptable_near_capacity():
    req = TrailPackingRequest(
        route_id="bob-marshall-wilderness",
        stock_animal="mule",
        left_pannier_lbs=68.0,
        right_pannier_lbs=65.0,
        top_pack_lbs=45.0,
        hitch_type="diamond_hitch",
    )
    res = calculate_trail_packing(req)
    assert res.total_payload_lbs == 178.0  # 190 * 0.85 = 161.5, <= 190 -> near_capacity
    assert res.weight_difference_lbs == 3.0  # <= 5.0 -> acceptable
    assert res.balance_status == "acceptable"
    assert res.payload_capacity_status == "near_capacity"


def test_calculate_trail_packing_unbalanced():
    req = TrailPackingRequest(
        route_id="bob-marshall-wilderness",
        stock_animal="mule",
        left_pannier_lbs=75.0,
        right_pannier_lbs=60.0,
        top_pack_lbs=20.0,
        hitch_type="box_hitch",
    )
    res = calculate_trail_packing(req)
    assert res.weight_difference_lbs == 15.0
    assert res.balance_status == "unbalanced_risk_galls"
    assert res.balance_ratio == 0.8
    assert "shift" in res.recommended_hitch_adjustment.lower() or "rebalance" in res.recommended_hitch_adjustment.lower()


def test_calculate_trail_packing_overloaded():
    req = TrailPackingRequest(
        route_id="bob-marshall-wilderness",
        stock_animal="mule",
        left_pannier_lbs=90.0,
        right_pannier_lbs=90.0,
        top_pack_lbs=30.0,
        hitch_type="diamond_hitch",
    )
    res = calculate_trail_packing(req)
    assert res.total_payload_lbs == 210.0  # > 190 max payload for 950 lb mule
    assert res.payload_capacity_status == "overloaded_injury_risk"


def test_calculate_trail_packing_pack_horse_and_quarter_horse():
    req_ph = TrailPackingRequest(
        route_id="pasayten-wilderness",
        stock_animal="pack_horse",
        left_pannier_lbs=80.0,
        right_pannier_lbs=80.0,
        top_pack_lbs=20.0,
    )
    res_ph = calculate_trail_packing(req_ph)
    # 1100 lbs * 0.20 = 220 lbs max. 180 <= 220 * 0.85 (187) -> within_capacity
    assert res_ph.payload_capacity_status == "within_capacity"

    req_qh = TrailPackingRequest(
        route_id="pecos-wilderness",
        stock_animal="quarter_horse",
        left_pannier_lbs=85.0,
        right_pannier_lbs=85.0,
        top_pack_lbs=25.0,
    )
    res_qh = calculate_trail_packing(req_qh)
    # 1000 lbs * 0.20 = 200 lbs max. 195 lbs > 170 and <= 200 -> near_capacity
    assert res_qh.total_payload_lbs == 195.0
    assert res_qh.payload_capacity_status == "near_capacity"


def test_calculate_trail_packing_invalid_route():
    req = TrailPackingRequest(route_id="nonexistent-wilderness-route")
    with pytest.raises(ValueError, match="Pack route 'nonexistent-wilderness-route' not found"):
        calculate_trail_packing(req)


def test_detect_trail_packing_intent_routes():
    intent = detect_trail_packing_intent("Show me wilderness equestrian pack routes for a horse packing expedition")
    assert intent is not None
    assert intent.action == "routes_list"

    intent_saddle = detect_trail_packing_intent("Which horse packing trips use a sawbuck pack saddle?")
    assert intent_saddle is not None
    assert intent_saddle.saddle_type == "sawbuck"


def test_detect_trail_packing_intent_detail():
    intent = detect_trail_packing_intent("Tell me about the Bob Marshall wilderness pack string expedition")
    assert intent is not None
    assert intent.action == "route_detail"
    assert intent.route_id == "bob-marshall-wilderness"


def test_detect_trail_packing_intent_calculation():
    intent = detect_trail_packing_intent("How do I balance panniers with a diamond hitch for my pack mule?")
    assert intent is not None
    assert intent.action == "calculate_packing"


def test_detect_trail_packing_intent_gear():
    intent = detect_trail_packing_intent("What is the mandatory tack checklist and highline picket gear for horse packing?")
    assert intent is not None
    assert intent.action == "gear_checklist"


def test_detect_trail_packing_intent_disambiguation():
    # Trail running must not trigger trail packing
    assert detect_trail_packing_intent("What are the best trail running shoes for ultra running?") is None
    assert detect_trail_packing_intent("What is the recommended running pace for a 50k trail run?") is None
    assert detect_trail_packing_intent("Fastpacking hydration vest recommendations") is None

    # Hiking trails must not trigger trail packing
    assert detect_trail_packing_intent("What are easy hiking trails near Seattle for a day hike?") is None
    assert detect_trail_packing_intent("Hiking boots for muddy trails") is None

    # Wildlife tracking must not trigger trail packing
    assert detect_trail_packing_intent("How to identify grizzly bear tracks in the mud?") is None
    assert detect_trail_packing_intent("Animal tracking wildlife footprint guide") is None

    # Bikepacking must not trigger trail packing
    assert detect_trail_packing_intent("What tire pressure and frame bag capacity for gravel bikepacking?") is None
    assert detect_trail_packing_intent("Oregon outback bikepacking route guide") is None


def test_formatted_trail_packing_response():
    raw_data = {
        "action": "calculate_packing",
        "route_id": "bob-marshall-wilderness",
        "total_payload_lbs": 150.0,
    }
    resp = format_trail_packing_response({"trail_packing_info": raw_data, "answer": "Test answer"})
    assert isinstance(resp, FormattedTrailPackingResponse)
    assert isinstance(resp, str)
    assert "Test answer" in str(resp)
    assert resp["trail_packing_info"]["route_id"] == "bob-marshall-wilderness"
    assert resp.get("nonexistent", "default") == "default"
    assert "trail_packing_info" in resp
