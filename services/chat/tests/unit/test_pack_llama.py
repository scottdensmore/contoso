import pytest
from contoso_chat.pack_llama import (
    FormattedPackLlamaResponse,
    PackLlamaGearModel,
    PackLlamaIntent,
    PackLlamaRequest,
    PackLlamaResponse,
    PackLlamaRouteModel,
    build_pack_llama_prompt,
    calculate_pack_llama_payload,
    detect_pack_llama_intent,
    format_pack_llama_response,
    get_pack_llama_gear_checklist,
    get_pack_llama_route,
    get_pack_llama_routes,
    pack_llama_tool,
)


def test_pack_llama_route_model():
    route = PackLlamaRouteModel(
        route_id="high-sierra-bishop-pass",
        title="High Sierra Bishop Pass & Dusy Basin Llama Trek",
        wilderness_area="John Muir Wilderness",
        national_forest="Inyo National Forest, CA, USA",
        elevation_m=3650,
        saddle_rigging="wood_crossbuck_pack",
        max_string_llamas=4,
        typical_days=5,
        description="High-altitude High Sierra trek crossing 11,972 ft Bishop Pass into alpine Dusy Basin.",
        highlights=[
            "Granite switchback agility",
            "Two-toed soft pad low meadow impact",
            "Dusy Basin alpine camp string picket",
        ],
    )
    assert route.route_id == "high-sierra-bishop-pass"
    assert route.elevation_m == 3650
    assert route.saddle_rigging == "wood_crossbuck_pack"
    assert route.max_string_llamas == 4
    assert route.typical_days == 5
    assert len(route.highlights) == 3


def test_pack_llama_request_defaults():
    req = PackLlamaRequest()
    assert req.route_id == "high-sierra-bishop-pass"
    assert req.saddle_rigging == "wood_crossbuck_pack"
    assert req.llama_body_weight_lbs == 360.0
    assert req.left_pannier_lbs == 32.0
    assert req.right_pannier_lbs == 32.0
    assert req.saddle_pad_weight_lbs == 12.0
    assert req.trail_elevation_m == 3200.0


def test_pack_llama_response_model():
    res = PackLlamaResponse(
        route_id="high-sierra-bishop-pass",
        route_title="High Sierra Bishop Pass & Dusy Basin Llama Trek",
        saddle_rigging="wood_crossbuck_pack",
        total_payload_lbs=76.0,
        payload_percentage=21.1,
        weight_difference_lbs=0.0,
        balance_status="perfect_balance",
        capacity_status="optimal_working_capacity",
        highline_spacing_m=3.5,
        daily_water_estimate_gal=2.0,
        rigging_advisory="Advisory text",
        trail_etiquette_guidance="Guidance text",
    )
    assert res.route_id == "high-sierra-bishop-pass"
    assert res.total_payload_lbs == 76.0
    assert res.balance_status == "perfect_balance"
    assert res.capacity_status == "optimal_working_capacity"
    assert res.highline_spacing_m == 3.5
    assert res.daily_water_estimate_gal == 2.0


def test_pack_llama_gear_model():
    gear = PackLlamaGearModel(
        item_id="padded-llama-pack-saddle",
        name="Contoured Wool-Felt Padded Llama Pack Saddle with Britchen & Breast Collar",
        category="rigging",
        mandatory=True,
        purpose="Distributes weight evenly along ribcage while preventing forward/aft slippage on steep grades",
    )
    assert gear.item_id == "padded-llama-pack-saddle"
    assert gear.mandatory is True
    assert gear.category == "rigging"


def test_pack_llama_intent_model():
    intent = PackLlamaIntent(action="calculate_packing", route_id="high-sierra-bishop-pass")
    assert intent.action == "calculate_packing"
    assert intent.route_id == "high-sierra-bishop-pass"
    assert intent.saddle_rigging is None
    assert bool(intent) is True

    empty_intent = PackLlamaIntent(action="")
    assert bool(empty_intent) is False


def test_formatted_pack_llama_response():
    data = {
        "pack_llama_info": {"status": "ok", "action": "routes_list"},
        "answer": "Test answer for llama packing",
    }
    resp = FormattedPackLlamaResponse("Test answer for llama packing", data)
    assert isinstance(resp, str)
    assert resp == "Test answer for llama packing"
    assert resp.get("answer") == "Test answer for llama packing"
    assert "pack_llama_info" in resp
    assert resp["pack_llama_info"]["action"] == "routes_list"
    assert list(resp.keys()) == ["pack_llama_info", "answer"]
    assert len(list(resp.values())) == 2
    assert len(list(resp.items())) == 2


def test_get_pack_llama_routes_all():
    routes = get_pack_llama_routes()
    assert len(routes) == 5
    route_ids = [r.route_id for r in routes]
    assert "high-sierra-bishop-pass" in route_ids
    assert "wind-river-cirque-towers" in route_ids
    assert "san-juan-weminuche-pass" in route_ids
    assert "pasayten-boundary-trail" in route_ids
    assert "uinta-four-lakes-basin" in route_ids


def test_get_pack_llama_routes_filtered():
    crossbuck_routes = get_pack_llama_routes(rigging="wood_crossbuck_pack")
    assert len(crossbuck_routes) == 2
    for r in crossbuck_routes:
        assert r.saddle_rigging == "wood_crossbuck_pack"

    fiberglass_routes = get_pack_llama_routes(rigging="articulated_fiberglass_tree")
    assert len(fiberglass_routes) == 2
    for r in fiberglass_routes:
        assert r.saddle_rigging == "articulated_fiberglass_tree"

    decker_routes = get_pack_llama_routes(rigging="decker_cinch_pack")
    assert len(decker_routes) == 1
    assert decker_routes[0].route_id == "san-juan-weminuche-pass"


def test_get_pack_llama_route_by_id():
    route = get_pack_llama_route("high-sierra-bishop-pass")
    assert route is not None
    assert route.route_id == "high-sierra-bishop-pass"
    assert route.elevation_m == 3650
    assert route.max_string_llamas == 4

    not_found = get_pack_llama_route("nonexistent-route")
    assert not_found is None


def test_calculate_pack_llama_payload_perfect_balance_and_optimal():
    req = PackLlamaRequest(
        route_id="high-sierra-bishop-pass",
        saddle_rigging="wood_crossbuck_pack",
        llama_body_weight_lbs=360.0,
        left_pannier_lbs=32.0,
        right_pannier_lbs=32.0,
        saddle_pad_weight_lbs=12.0,
    )
    res = calculate_pack_llama_payload(req)
    # total = 32 + 32 + 12 = 76.0
    assert res.total_payload_lbs == 76.0
    # percentage = round((76.0 / 360.0) * 100, 1) = 21.1
    assert res.payload_percentage == 21.1
    assert res.weight_difference_lbs == 0.0
    assert res.balance_status == "perfect_balance"
    assert res.capacity_status == "optimal_working_capacity"
    assert res.highline_spacing_m == 3.5
    # water = round(360 * 0.0055, 1) = 2.0
    assert res.daily_water_estimate_gal == 2.0
    assert "wood_crossbuck_pack" in res.rigging_advisory
    assert "Leave No Trace" in res.trail_etiquette_guidance
    assert "3.5m" in res.trail_etiquette_guidance or "3.5" in res.trail_etiquette_guidance


def test_calculate_pack_llama_payload_acceptable_balance_and_light_load():
    req = PackLlamaRequest(
        route_id="wind-river-cirque-towers",
        saddle_rigging="articulated_fiberglass_tree",
        llama_body_weight_lbs=380.0,
        left_pannier_lbs=24.0,
        right_pannier_lbs=26.5,  # diff 2.5 lbs (<= 3.5, > 1.5)
        saddle_pad_weight_lbs=10.0,  # total = 60.5 -> 60.5/380 * 100 = 15.9% <= 18.0
    )
    res = calculate_pack_llama_payload(req)
    assert res.total_payload_lbs == 60.5
    assert res.weight_difference_lbs == 2.5
    assert res.balance_status == "acceptable_balance"
    assert res.capacity_status == "light_cruising_load"
    assert res.daily_water_estimate_gal == round(380.0 * 0.0055, 1)


def test_calculate_pack_llama_payload_unbalanced_and_overloaded():
    req = PackLlamaRequest(
        route_id="san-juan-weminuche-pass",
        saddle_rigging="decker_cinch_pack",
        llama_body_weight_lbs=340.0,
        left_pannier_lbs=46.0,
        right_pannier_lbs=41.0,  # diff 5.0 lbs > 3.5
        saddle_pad_weight_lbs=12.0,  # total = 99.0 -> 99/340 = 29.1% > 25.0
    )
    res = calculate_pack_llama_payload(req)
    assert res.weight_difference_lbs == 5.0
    assert res.balance_status == "unbalanced_girth_gall_risk"
    assert res.capacity_status == "overloaded_spine_strain"
    assert "unbalanced" in res.rigging_advisory.lower() or "girth gall" in res.rigging_advisory.lower()


def test_calculate_pack_llama_payload_invalid_route():
    req = PackLlamaRequest(route_id="nonexistent-route")
    with pytest.raises(ValueError, match="not found"):
        calculate_pack_llama_payload(req)


def test_get_pack_llama_gear_checklist():
    gear = get_pack_llama_gear_checklist()
    assert len(gear) == 6
    for item in gear:
        assert item.mandatory is True
    item_ids = [g.item_id for g in gear]
    assert "padded-llama-pack-saddle" in item_ids
    assert "highline-tree-savers-swivels" in item_ids
    assert "dual-side-balanced-panniers" in item_ids
    assert "breakaway-lead-and-halter" in item_ids
    assert "llama-hoof-shears-styptic" in item_ids
    assert "bear-resistant-food-canisters" in item_ids


def test_detect_pack_llama_intent_positive():
    # Routes list
    intent1 = detect_pack_llama_intent("What backcountry pack llama high-altitude trekking routes do you offer?")
    assert intent1 is not None
    assert intent1.action == "routes_list"

    # Route detail
    intent2 = detect_pack_llama_intent("Tell me about the Bishop Pass llama trek route details")
    assert intent2 is not None
    assert intent2.action == "route_detail"
    assert intent2.route_id == "high-sierra-bishop-pass"

    # Calculate packing
    intent3 = detect_pack_llama_intent(
        "Calculate llama pannier balancing and payload for 360 lb llama on Bishop Pass"
    )
    assert intent3 is not None
    assert intent3.action in ("calculate_packing", "calculate")

    # Gear checklist
    intent4 = detect_pack_llama_intent(
        "What llama highline tree savers and pack saddle gear are mandatory?"
    )
    assert intent4 is not None
    assert intent4.action in ("gear_checklist", "gear")

    # Saddle rigging inquiry
    intent5 = detect_pack_llama_intent(
        "Which routes use the wood crossbuck pack saddle rigging system?"
    )
    assert intent5 is not None
    assert intent5.saddle_rigging == "wood_crossbuck_pack"

    # Carrying capacity inquiry
    intent6 = detect_pack_llama_intent(
        "What is the carrying capacity and water requirement for a working pack llama?"
    )
    assert intent6 is not None


def test_detect_pack_llama_intent_exclusions():
    exclusions = [
        "Where is my order #12345?",
        "Can I get a refund on my purchase?",
        "I need a return label for my jacket",
        "What is the shipping tracking status?",
        "Tell me about the pack burro race in Leadville",
        "Horse pack saddle rigging for the mountains",
        "Pack goat alpine trekking in Titcomb Basin",
        "Dogsled mushing in the Yukon",
        "Primitive trapping snares and deadfalls",
        "Gold pan sluice box prospecting",
        "Beachcombing sea glass on the coast",
        "Fire lookout tower spotting azimuth",
        "Snowshoe mountaineering route up Rainier",
        "Sandboarding giant dunes in Oregon",
        "Cave diving sump exploration",
        "Wild caving spelunking guide",
        "Ski touring backcountry avalanche risk",
        "Steep skiing couloir lines",
        "Nordic classic track skiing",
        "Telemark skiing free heel turns",
        "Falconry raptor mews care",
        "Do you have llama rentals?",
        "Can I get a llama rental for the weekend?",
    ]
    for text in exclusions:
        intent = detect_pack_llama_intent(text)
        assert intent is None, f"Expected None for excluded query: {text}"


def test_format_pack_llama_response_routes():
    intent = PackLlamaIntent(action="routes_list")
    resp = format_pack_llama_response(intent)
    assert isinstance(resp, FormattedPackLlamaResponse)
    assert "Bishop Pass" in str(resp) or "Pack-Llama" in str(resp) or "routes" in str(resp)
    assert resp.get("pack_llama_info") is not None
    assert resp["pack_llama_info"]["action"] == "routes_list"


def test_format_pack_llama_response_calculate():
    intent = PackLlamaIntent(action="calculate_packing", route_id="high-sierra-bishop-pass")
    req = PackLlamaRequest(route_id="high-sierra-bishop-pass")
    resp = format_pack_llama_response(intent, req)
    assert isinstance(resp, FormattedPackLlamaResponse)
    assert resp.get("pack_llama_info") is not None
    assert resp["pack_llama_info"]["action"] == "calculate_packing"
    assert "calculation" in resp["pack_llama_info"]


def test_format_pack_llama_response_gear():
    intent = PackLlamaIntent(action="gear_checklist")
    resp = format_pack_llama_response(intent)
    assert isinstance(resp, FormattedPackLlamaResponse)
    assert resp.get("pack_llama_info") is not None
    assert resp["pack_llama_info"]["action"] == "gear_checklist"
    assert len(resp["pack_llama_info"]["gear"]) == 6


def test_format_pack_llama_response_route_detail():
    intent = PackLlamaIntent(action="route_detail", route_id="high-sierra-bishop-pass")
    resp = format_pack_llama_response(intent)
    assert isinstance(resp, FormattedPackLlamaResponse)
    assert resp.get("pack_llama_info") is not None
    assert resp["pack_llama_info"]["action"] == "route_detail"
    assert resp["pack_llama_info"]["route_id"] == "high-sierra-bishop-pass"


def test_build_pack_llama_prompt():
    prompt = build_pack_llama_prompt()
    assert "pack-llama" in prompt.lower() or "pack llama" in prompt.lower()
    assert "crossbuck" in prompt.lower()
    assert "leave no trace" in prompt.lower()
    assert "soft" in prompt.lower() or "two-toed" in prompt.lower()


def test_pack_llama_tool():
    req = PackLlamaRequest()
    calc = pack_llama_tool(request=req)
    assert isinstance(calc, PackLlamaResponse)

    gear = pack_llama_tool(action="gear_checklist")
    assert isinstance(gear, list)
    assert len(gear) == 6

    routes = pack_llama_tool(action="routes_list")
    assert isinstance(routes, list)
    assert len(routes) == 5

    route = pack_llama_tool(action="route_detail", route_id="high-sierra-bishop-pass")
    assert isinstance(route, PackLlamaRouteModel)


def test_handle_pack_llama_intent():
    from contoso_chat.chat import handle_pack_llama_intent

    res = handle_pack_llama_intent("Tell me about the Bishop Pass llama trek")
    assert res is not None
    assert "pack_llama_info" in res
    assert "answer" in res

    none_res = handle_pack_llama_intent("Where is my order #12345?")
    assert none_res is None


@pytest.mark.anyio
async def test_generate_pack_llama_stream_events():
    from contoso_chat.stream import generate_pack_llama_stream_events

    events = []
    async for chunk in generate_pack_llama_stream_events(
        "Calculate llama pannier balancing and payload for 360 lb llama on Bishop Pass"
    ):
        events.append(chunk)

    assert len(events) > 0
    full_output = "".join(events)
    assert "pack_llama_calculated" in full_output
    assert "data: [DONE]" in full_output

    lookup_events = []
    async for chunk in generate_pack_llama_stream_events("What pack llama routes are available?"):
        lookup_events.append(chunk)

    assert len(lookup_events) > 0
    lookup_output = "".join(lookup_events)
    assert "pack_llama_lookup" in lookup_output

    none_events = []
    async for chunk in generate_pack_llama_stream_events("Where is my order #12345?"):
        none_events.append(chunk)
    assert len(none_events) == 0
