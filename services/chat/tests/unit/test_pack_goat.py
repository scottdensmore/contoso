import pytest
from contoso_chat.pack_goat import (
    FormattedPackGoatResponse,
    PackGoatGearItemModel,
    PackGoatIntent,
    PackGoatRequest,
    PackGoatResponse,
    PackGoatRouteModel,
    build_pack_goat_prompt,
    calculate_pack_goat_payload,
    detect_pack_goat_intent,
    format_pack_goat_response,
    get_pack_goat_gear_checklist,
    get_pack_goat_route,
    get_pack_goat_routes,
    pack_goat_tool,
)


def test_pack_goat_route_model():
    route = PackGoatRouteModel(
        route_id="wind-river-titcomb-basin",
        title="Wind River High Basin & Titcomb Lakes Goat Trek",
        wilderness_area="Bridger Wilderness",
        national_forest="Bridger-Teton National Forest, WY, USA",
        elevation_m=3300,
        saddle_rigging="flexible_tree_harness",
        terrain_agility="granite_talus",
        max_string_goats=4,
        typical_days=6,
        bighorn_buffer_m=200,
        description="Alpine pack goat trek into Titcomb Basin.",
        highlights=[
            "Granite talus pass hopping",
            "Grizzly bear country food canisters",
            "Highline tree-saver tethering above treeline",
        ],
    )
    assert route.route_id == "wind-river-titcomb-basin"
    assert route.elevation_m == 3300
    assert route.bighorn_buffer_m == 200
    assert len(route.highlights) == 3


def test_pack_goat_request_defaults():
    req = PackGoatRequest()
    assert req.route_id == "wind-river-titcomb-basin"
    assert req.goat_breed == "alpine_dairy"
    assert req.goat_body_weight_lbs == 180.0
    assert req.left_pannier_lbs == 18.0
    assert req.right_pannier_lbs == 18.0
    assert req.saddle_pad_weight_lbs == 6.0
    assert req.saddle_rigging == "crossbuck_sawbuck"


def test_pack_goat_response_model():
    res = PackGoatResponse(
        route_id="wind-river-titcomb-basin",
        route_title="Wind River High Basin & Titcomb Lakes Goat Trek",
        goat_breed="alpine_dairy",
        total_payload_lbs=42.0,
        payload_percentage=23.3,
        weight_difference_lbs=0.0,
        balance_status="perfectly_balanced",
        payload_status="full_working_capacity",
        bighorn_buffer_m=200,
        recommended_daily_forage_pellets_lbs=3.6,
        rigging_advisory="Rigging advisory text",
        wildlife_mitigation_advisory="Wildlife advisory text",
    )
    assert res.route_id == "wind-river-titcomb-basin"
    assert res.balance_status == "perfectly_balanced"
    assert res.payload_status == "full_working_capacity"
    assert res.recommended_daily_forage_pellets_lbs == 3.6


def test_pack_goat_gear_item_model():
    item = PackGoatGearItemModel(
        item_id="weed-free-certified-forage",
        name="Weed-Free Certified Alfalfa/Timothy Pellets (Leave No Trace feed)",
        category="nutrition",
        mandatory=True,
        purpose="Prevent spreading noxious invasive weeds in fragile alpine tundra",
    )
    assert item.item_id == "weed-free-certified-forage"
    assert item.mandatory is True
    assert item.category == "nutrition"


def test_pack_goat_intent_model():
    intent = PackGoatIntent(action="calculate_packing", route_id="wind-river-titcomb-basin")
    assert intent.action == "calculate_packing"
    assert intent.route_id == "wind-river-titcomb-basin"
    assert intent.saddle_rigging is None


def test_formatted_pack_goat_response():
    data = {
        "pack_goat_info": {"status": "ok", "action": "routes_list"},
        "answer": "Test answer for goat packing",
    }
    resp = FormattedPackGoatResponse("Test answer for goat packing", data)
    assert isinstance(resp, str)
    assert resp == "Test answer for goat packing"
    assert resp.get("answer") == "Test answer for goat packing"
    assert "pack_goat_info" in resp
    assert resp["pack_goat_info"]["action"] == "routes_list"


def test_get_pack_goat_routes_all():
    routes = get_pack_goat_routes()
    assert len(routes) == 5
    route_ids = [r.route_id for r in routes]
    assert "wind-river-titcomb-basin" in route_ids
    assert "sawtooth-alice-toxaway" in route_ids
    assert "eagle-cap-lakes-basin" in route_ids
    assert "uinta-highline-kings-peak" in route_ids
    assert "maroon-bells-four-pass" in route_ids


def test_get_pack_goat_routes_filtered():
    sawbuck_routes = get_pack_goat_routes(rigging="crossbuck_sawbuck")
    assert len(sawbuck_routes) == 2
    for r in sawbuck_routes:
        assert r.saddle_rigging == "crossbuck_sawbuck"

    decker_routes = get_pack_goat_routes(rigging="decker_soft_pack")
    assert len(decker_routes) == 1
    assert decker_routes[0].route_id == "eagle-cap-lakes-basin"

    harness_routes = get_pack_goat_routes(rigging="flexible_tree_harness")
    assert len(harness_routes) == 2


def test_get_pack_goat_route_by_id():
    route = get_pack_goat_route("wind-river-titcomb-basin")
    assert route is not None
    assert route.route_id == "wind-river-titcomb-basin"
    assert route.elevation_m == 3300
    assert route.bighorn_buffer_m == 200

    not_found = get_pack_goat_route("nonexistent-route")
    assert not_found is None


def test_calculate_pack_goat_payload_balanced():
    req = PackGoatRequest(
        route_id="wind-river-titcomb-basin",
        goat_breed="alpine_dairy",
        goat_body_weight_lbs=180.0,
        left_pannier_lbs=18.0,
        right_pannier_lbs=18.0,
        saddle_pad_weight_lbs=6.0,
    )
    res = calculate_pack_goat_payload(req)
    assert res.total_payload_lbs == 42.0
    assert res.weight_difference_lbs == 0.0
    assert res.balance_status == "perfectly_balanced"
    assert res.payload_percentage == 23.3
    assert res.payload_status == "full_working_capacity"
    assert res.bighorn_buffer_m == 200
    assert res.recommended_daily_forage_pellets_lbs == 3.6
    assert "Titcomb" in res.route_title
    assert (
        "bighorn" in res.wildlife_mitigation_advisory.lower()
        or "mycoplasma" in res.wildlife_mitigation_advisory.lower()
    )


def test_calculate_pack_goat_payload_acceptable_balance():
    req = PackGoatRequest(
        route_id="sawtooth-alice-toxaway",
        goat_breed="saanen_draft",
        goat_body_weight_lbs=210.0,
        left_pannier_lbs=19.0,
        right_pannier_lbs=17.0,  # diff 2.0 lbs <= 2.5
        saddle_pad_weight_lbs=6.0,
    )
    res = calculate_pack_goat_payload(req)
    assert res.weight_difference_lbs == 2.0
    assert res.balance_status == "acceptable_balance"
    assert res.recommended_daily_forage_pellets_lbs == 4.2


def test_calculate_pack_goat_payload_unbalanced():
    req = PackGoatRequest(
        route_id="sawtooth-alice-toxaway",
        goat_breed="alpine_dairy",
        goat_body_weight_lbs=180.0,
        left_pannier_lbs=22.0,
        right_pannier_lbs=18.0,  # diff 4.0 lbs > 2.5
        saddle_pad_weight_lbs=6.0,
    )
    res = calculate_pack_goat_payload(req)
    assert res.weight_difference_lbs == 4.0
    assert res.balance_status == "unbalanced_roll_risk"
    assert "roll" in res.rigging_advisory.lower() or "unbalanced" in res.rigging_advisory.lower()


def test_calculate_pack_goat_payload_light_load():
    req = PackGoatRequest(
        route_id="eagle-cap-lakes-basin",
        goat_breed="alpine_dairy",
        goat_body_weight_lbs=180.0,
        left_pannier_lbs=14.0,
        right_pannier_lbs=14.0,
        saddle_pad_weight_lbs=6.0,  # total 34.0 lbs / 180 = 18.9% <= 22.0
    )
    res = calculate_pack_goat_payload(req)
    assert res.payload_percentage == 18.9
    assert res.payload_status == "optimal_light_load"


def test_calculate_pack_goat_payload_overloaded():
    req = PackGoatRequest(
        route_id="uinta-highline-kings-peak",
        goat_breed="oberhasli_swiss",
        goat_body_weight_lbs=170.0,
        left_pannier_lbs=25.0,
        right_pannier_lbs=25.0,
        saddle_pad_weight_lbs=6.0,  # total 56.0 lbs / 170 = 32.9% > 28.0
    )
    res = calculate_pack_goat_payload(req)
    assert res.payload_percentage == 32.9
    assert res.payload_status == "overloaded_spinal_strain"


def test_calculate_pack_goat_payload_invalid_route():
    req = PackGoatRequest(route_id="unknown-route")
    with pytest.raises(ValueError, match="not found"):
        calculate_pack_goat_payload(req)


def test_get_pack_goat_gear_checklist():
    gear = get_pack_goat_gear_checklist()
    assert len(gear) == 6
    for item in gear:
        assert item.mandatory is True
    item_ids = [g.item_id for g in gear]
    assert "weed-free-certified-forage" in item_ids
    assert "high-vis-orange-safety-vest" in item_ids
    assert "highline-swivel-tether-kit" in item_ids
    assert "hoof-trimming-shears-styptic" in item_ids
    assert "crossbuck-saddle-breeching" in item_ids
    assert "bear-resistant-pannier-liner" in item_ids


def test_detect_pack_goat_intent_positive():
    # Routes list
    intent1 = detect_pack_goat_intent("What pack goat alpine trekking routes do you offer?")
    assert intent1 is not None
    assert intent1.action == "routes_list"

    # Route detail
    intent2 = detect_pack_goat_intent("Tell me about the Titcomb Basin pack goat trek")
    assert intent2 is not None
    assert intent2.action == "route_detail"
    assert intent2.route_id == "wind-river-titcomb-basin"

    # Calculate packing
    intent3 = detect_pack_goat_intent(
        "Calculate pack goat pannier payload balance for 180 lb Alpine dairy wether"
    )
    assert intent3 is not None
    assert intent3.action in ("calculate_packing", "calculate")

    # Gear checklist
    intent4 = detect_pack_goat_intent(
        "What mandatory weed-free forage pellets and goat highline gear do I need?"
    )
    assert intent4 is not None
    assert intent4.action in ("gear_checklist", "gear")

    # Specific breeds
    intent5 = detect_pack_goat_intent(
        "How much weight can a Saanen wether or Oberhasli pack goat carry?"
    )
    assert intent5 is not None

    # Bighorn sheep buffer inquiry
    intent6 = detect_pack_goat_intent(
        "What is the bighorn sheep separation buffer protocol for pack goats?"
    )
    assert intent6 is not None


def test_detect_pack_goat_intent_exclusions():
    exclusions = [
        "Where is my order #12345?",
        "Can I get a refund on my purchase?",
        "I need a return label for my jacket",
        "What is the shipping tracking status?",
        "Tell me about the pack burro race in Leadville",
        "Horse pack saddle rigging for the mountains",
        "Trail packing mule equipment",
        "Dogsled mushing in the Yukon",
        "Primitive trapping snares and deadfalls",
        "Gold pan sluice box prospecting",
        "Beachcombing sea glass on the coast",
        "Fire lookout tower spotting azimuth",
        "Snowshoe mountaineering route up Rainier",
        "Do you have pack goat rentals?",
        "Can I get a goat rental for the weekend?",
    ]
    for text in exclusions:
        intent = detect_pack_goat_intent(text)
        assert intent is None, f"Expected None for excluded query: {text}"


def test_format_pack_goat_response_routes():
    intent = PackGoatIntent(action="routes_list")
    resp = format_pack_goat_response(intent)
    assert isinstance(resp, FormattedPackGoatResponse)
    assert "Titcomb" in str(resp) or "Pack-Goat" in str(resp) or "routes" in str(resp)
    assert resp.get("pack_goat_info") is not None
    assert resp["pack_goat_info"]["action"] == "routes_list"


def test_format_pack_goat_response_calculate():
    intent = PackGoatIntent(action="calculate_packing", route_id="wind-river-titcomb-basin")
    req = PackGoatRequest(route_id="wind-river-titcomb-basin")
    resp = format_pack_goat_response(intent, req)
    assert isinstance(resp, FormattedPackGoatResponse)
    assert resp.get("pack_goat_info") is not None
    assert resp["pack_goat_info"]["action"] == "calculate_packing"
    assert "calculation" in resp["pack_goat_info"]


def test_format_pack_goat_response_gear():
    intent = PackGoatIntent(action="gear_checklist")
    resp = format_pack_goat_response(intent)
    assert isinstance(resp, FormattedPackGoatResponse)
    assert resp.get("pack_goat_info") is not None
    assert resp["pack_goat_info"]["action"] == "gear_checklist"
    assert len(resp["pack_goat_info"]["gear"]) == 6


def test_build_pack_goat_prompt():
    prompt = build_pack_goat_prompt()
    assert "pack-goat" in prompt.lower() or "pack goat" in prompt.lower()
    assert "mycoplasma ovipneumoniae" in prompt.lower()
    assert "weed-free" in prompt.lower()
    assert "blaze orange" in prompt.lower()


def test_pack_goat_tool():
    # Test tool wrapper
    req = PackGoatRequest()
    calc = pack_goat_tool(request=req)
    assert isinstance(calc, PackGoatResponse)

    gear = pack_goat_tool(action="gear_checklist")
    assert isinstance(gear, list)
    assert len(gear) == 6

    routes = pack_goat_tool(action="routes_list")
    assert isinstance(routes, list)
    assert len(routes) == 5

    route = pack_goat_tool(action="route_detail", route_id="wind-river-titcomb-basin")
    assert isinstance(route, PackGoatRouteModel)


def test_handle_pack_goat_intent():
    from contoso_chat.chat import handle_pack_goat_intent

    res = handle_pack_goat_intent("Tell me about the Titcomb Basin pack goat trek")
    assert res is not None
    assert "pack_goat_info" in res
    assert "answer" in res

    none_res = handle_pack_goat_intent("Where is my order #12345?")
    assert none_res is None


@pytest.mark.anyio
async def test_generate_pack_goat_stream_events():
    from contoso_chat.stream import generate_pack_goat_stream_events

    events = []
    async for chunk in generate_pack_goat_stream_events(
        "Calculate pack goat pannier payload balance"
    ):
        events.append(chunk)

    assert len(events) > 0
    full_output = "".join(events)
    assert "pack_goat_calculated" in full_output
    assert "data: [DONE]" in full_output

    lookup_events = []
    async for chunk in generate_pack_goat_stream_events("What pack goat routes are available?"):
        lookup_events.append(chunk)

    assert len(lookup_events) > 0
    lookup_output = "".join(lookup_events)
    assert "pack_goat_lookup" in lookup_output

    none_events = []
    async for chunk in generate_pack_goat_stream_events("Where is my order #12345?"):
        none_events.append(chunk)
    assert len(none_events) == 0
