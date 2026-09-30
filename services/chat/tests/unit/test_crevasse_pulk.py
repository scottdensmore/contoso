from typing import Any

import pytest
from contoso_chat.crevasse_pulk import (
    CrevassePulkRoute,
    PulkDynamicsQuery,
    PulkGearItem,
    build_crevasse_pulk_prompt,
    calculate_pulk_dynamics,
    crevasse_pulk_tool,
    detect_crevasse_pulk_intent,
    extract_crevasse_pulk_intent,
    format_crevasse_pulk_response,
    get_crevasse_pulk_gear,
    get_crevasse_pulk_route,
    get_crevasse_pulk_routes,
)
from contoso_chat.dogsledding import extract_dogsled_intent
from contoso_chat.glacier_navigation import detect_glacier_intent
from contoso_chat.mountaineering import detect_mountaineering_intent


def test_models_and_enums() -> None:
    route = CrevassePulkRoute(
        id="test-route",
        title="Test Glacial Route",
        region="Alaska",
        system="Test Glacier",
        elevation_m=2000,
        average_slope_deg=7.5,
        crevasse_risk="high",
        primary_rigging="rigid_fiberglass_shaft_harness",
        terrain="crevassed_icefall_labyrinth",
        description="A test glacial pulk route.",
        highlights=["Maze", "Crevasses"],
    )
    assert route.id == "test-route"
    assert route.elevationMeters == 2000
    assert route.averageSlopeDeg == 7.5
    assert route.crevassedRisk == "high"
    assert route.primaryRigging == "rigid_fiberglass_shaft_harness"

    gear = PulkGearItem(
        id="test-gear",
        name="Test Pulk Sled",
        category="pulk",
        mandatory=True,
        description="Heavy-duty hull",
    )
    assert gear.id == "test-gear"
    assert gear.item_id == "test-gear"
    assert gear.mandatory is True


def test_route_catalog() -> None:
    routes = get_crevasse_pulk_routes()
    assert len(routes) == 5
    ids = [r.id for r in routes]
    assert "denali-kahiltna-glacier-highway" in ids
    assert "bagley-icefield-traverse" in ids
    assert "ruth-gorge-great-gorge-freight" in ids
    assert "columbia-icefield-athabasca" in ids
    assert "mount-rainier-ingraham-glacier" in ids


def test_get_routes_filtering() -> None:
    # Filter by terrain
    labyrinth_routes = get_crevasse_pulk_routes(terrain="crevassed_icefall_labyrinth")
    assert len(labyrinth_routes) == 1
    assert labyrinth_routes[0].id == "denali-kahiltna-glacier-highway"

    # Filter by risk
    extreme_routes = get_crevasse_pulk_routes(risk="extreme")
    assert len(extreme_routes) == 1
    assert extreme_routes[0].id == "mount-rainier-ingraham-glacier"

    moderate_routes = get_crevasse_pulk_routes(risk="moderate")
    assert len(moderate_routes) == 2

    # Combined filter
    none_routes = get_crevasse_pulk_routes(terrain="polar_icecap_plateau", risk="extreme")
    assert len(none_routes) == 0


def test_get_single_route() -> None:
    r = get_crevasse_pulk_route("denali-kahiltna-glacier-highway")
    assert r is not None
    assert r.title == "Denali Kahiltna Glacier Pulk Ascent"
    assert r.elevation_m == 2200
    assert r.average_slope_deg == 8.5
    assert r.crevasse_risk == "high"
    assert r.terrain == "crevassed_icefall_labyrinth"
    assert len(r.highlights) == 3

    # Lookup by title substring or alias
    r2 = get_crevasse_pulk_route("Bagley Icefield Polar Traverse")
    assert r2 is not None
    assert r2.id == "bagley-icefield-traverse"

    # Lookup non-existent
    assert get_crevasse_pulk_route("unknown-glacier-highway") is None


def test_gear_checklist() -> None:
    gear = get_crevasse_pulk_gear()
    assert len(gear) == 6
    assert all(g.mandatory for g in gear)
    gear_ids = [g.id for g in gear]
    assert "reinforced-uhmwpe-expedition-pulk" in gear_ids
    assert "rigid-fiberglass-crossover-shafts" in gear_ids
    assert "downhill-trailing-rope-brake" in gear_ids
    assert "crevasse-arrest-prussik-haul-rig" in gear_ids
    assert "dual-directional-crevasse-fluke" in gear_ids
    assert "sub-zero-sled-lashing-cover" in gear_ids


def test_pulk_dynamics_calculation_nominal() -> None:
    query = PulkDynamicsQuery(
        route_id="bagley-icefield-traverse",
        rigging_system="rope_trace_with_brake_fin",
        payload_kg=50.0,
        hauler_weight_kg=78.0,
        incline_degrees=3.2,
        snow_condition="wind_packed_firn",
        crevasse_hazard="moderate",
    )
    result = calculate_pulk_dynamics(query)
    assert result.route_title == "Bagley Icefield Polar Traverse"
    assert result.tow_force_newtons > 0
    assert result.gravity_force_newtons > 0
    assert result.friction_force_newtons > 0
    assert result.downhill_overrun_joules > 0
    assert result.crevasse_arrest_force_kilonewtons > 0
    assert result.arrest_safety == "nominal_dynamic_hold"
    assert "NOMINAL" in result.rigging_advisory
    assert "Standard crevasse arrest" in result.crevasse_extraction_protocol


def test_pulk_dynamics_calculation_caution() -> None:
    # Caution scenario: payload_kg > 70 and crevasse_hazard == "extreme"
    query = PulkDynamicsQuery(
        route_id="mount-rainier-ingraham-glacier",
        rigging_system="rigid_fiberglass_shaft_harness",
        payload_kg=80.0,
        hauler_weight_kg=80.0,
        incline_degrees=10.0,
        snow_condition="hard_blue_ice",
        crevasse_hazard="extreme",
    )
    result = calculate_pulk_dynamics(query)
    assert result.arrest_safety == "caution_overrun_risk"
    assert "CAUTION" in result.rigging_advisory
    assert "Equalized snow fluke" in result.crevasse_extraction_protocol


def test_pulk_dynamics_calculation_critical() -> None:
    # Critical scenario: incline_degrees > 14 and rigging_system != "rigid_fiberglass_shaft_harness"
    query = PulkDynamicsQuery(
        route_id="mount-rainier-ingraham-glacier",
        rigging_system="rope_trace_with_brake_fin",
        payload_kg=60.0,
        hauler_weight_kg=75.0,
        incline_degrees=16.0,
        snow_condition="wind_packed_firn",
        crevasse_hazard="extreme",
    )
    result = calculate_pulk_dynamics(query)
    assert result.arrest_safety == "critical_arrest_failure_alert"
    assert "CRITICAL" in result.rigging_advisory
    assert "Emergency deadman anchor" in result.crevasse_extraction_protocol


def test_pulk_dynamics_calculation_invalid_route() -> None:
    query = PulkDynamicsQuery(
        route_id="non-existent-glacier",
        payload_kg=50.0,
    )
    with pytest.raises(ValueError, match="not found"):
        calculate_pulk_dynamics(query)


def test_detect_crevasse_pulk_intent_positive() -> None:
    queries = [
        "What is the best pulk sled for Denali?",
        "Tell me about crevasse pulk hauling routes",
        "How do I manage a sled haul on Kahiltna Glacier?",
        "We need pulk harness recommendations",
        "What are the best practices for glacial sledging?",
        "Where can I attach the haul shaft to the expedition sled?",
        "Details on sled hauling in Alaska",
        "Pulk sled stability across sastrugi",
        "denali-kahiltna-glacier-highway route information",
        "Bagley icefield traverse logistics",
    ]
    for q in queries:
        assert detect_crevasse_pulk_intent(q) is True, f"Failed for query: {q}"


def test_detect_crevasse_pulk_intent_negative() -> None:
    negatives = [
        "",
        "   ",
        "Where is my order #12345?",
        "Can I get a refund for my boots?",
        "Print a return label",
        "Pack burro packing techniques",
        "Dogsledding in the Yukon",
        "Cave diving sump exploration",
        "Karst speleothem cave pearl survey",
        "Bog-shoeing in muskeg peatlands",
        "Backcountry ski touring setup",
        "Night via ferrata harness inspection",
        "Rental equipment for camping",
    ]
    for n in negatives:
        assert detect_crevasse_pulk_intent(n) is False, f"Should be false for: {n}"


def test_extract_crevasse_pulk_intent() -> None:
    intent_calc = extract_crevasse_pulk_intent("Calculate tow force and downhill overrun for Denali pulk")
    assert intent_calc.action == "calculate"
    assert intent_calc.route_id == "denali-kahiltna-glacier-highway"

    intent_gear = extract_crevasse_pulk_intent("What is the mandatory gear checklist for pulk expedition?")
    assert intent_gear.action == "gear"

    intent_detail = extract_crevasse_pulk_intent("Tell me details about Ruth Glacier Great Gorge Sled Haul")
    assert intent_detail.action == "route_detail"
    assert intent_detail.route_id == "ruth-gorge-great-gorge-freight"

    intent_list = extract_crevasse_pulk_intent("Show me all pulk routes on polar icecap plateau")
    assert intent_list.action == "routes_list"
    assert intent_list.terrain == "polar_icecap_plateau"


def test_format_crevasse_pulk_response() -> None:
    # Test calculate formatting
    query = PulkDynamicsQuery(
        route_id="denali-kahiltna-glacier-highway",
        payload_kg=55.0,
        incline_degrees=8.5,
    )
    result = calculate_pulk_dynamics(query)
    resp_calc = format_crevasse_pulk_response("calculate", result)
    assert "crevasse_pulk_info" in resp_calc
    calc_info: dict[str, Any] = resp_calc["crevasse_pulk_info"]
    assert calc_info["action"] == "calculate"
    assert "Denali" in str(resp_calc)

    # Test gear formatting
    resp_gear = format_crevasse_pulk_response("gear")
    assert "crevasse_pulk_info" in resp_gear
    gear_info: dict[str, Any] = resp_gear["crevasse_pulk_info"]
    assert gear_info["action"] == "gear"
    assert gear_info["mandatory_count"] == 6

    # Test route detail formatting
    resp_route = format_crevasse_pulk_response("route_detail", "bagley-icefield-traverse")
    assert "crevasse_pulk_info" in resp_route
    route_info: dict[str, Any] = resp_route["crevasse_pulk_info"]
    assert route_info["action"] == "route_detail"
    assert route_info["route_id"] == "bagley-icefield-traverse"

    # Test routes list formatting
    resp_list = format_crevasse_pulk_response("routes_list")
    assert "crevasse_pulk_info" in resp_list
    list_info: dict[str, Any] = resp_list["crevasse_pulk_info"]
    assert list_info["action"] == "routes_list"
    assert len(list_info["routes"]) == 5


def test_build_crevasse_pulk_prompt() -> None:
    prompt = build_crevasse_pulk_prompt("denali-kahiltna-glacier-highway")
    assert "Alpine Glacial Sledging & Crevasse Pulk" in prompt
    assert "Denali Kahiltna Glacier Pulk Ascent" in prompt

    prompt_general = build_crevasse_pulk_prompt()
    assert "Alpine Glacial Sledging & Crevasse Pulk" in prompt_general


def test_crevasse_pulk_tool() -> None:
    # Test calculate action
    tool_res_calc = crevasse_pulk_tool(
        action="calculate",
        route_id="columbia-icefield-athabasca",
    )
    assert tool_res_calc["crevasse_pulk_info"]["action"] == "calculate"

    # Test gear action
    tool_res_gear = crevasse_pulk_tool(action="gear")
    assert tool_res_gear["crevasse_pulk_info"]["action"] == "gear"

    # Test detail action
    tool_res_detail = crevasse_pulk_tool(action="route_detail", route_id="ruth-gorge-great-gorge-freight")
    assert tool_res_detail["crevasse_pulk_info"]["action"] == "route_detail"

    # Test routes list
    tool_res_list = crevasse_pulk_tool(action="routes_list")
    assert tool_res_list["crevasse_pulk_info"]["action"] == "routes_list"


def test_external_disambiguation_guards() -> None:
    # Pulk keywords must not be hijacked by glacier navigation
    assert detect_glacier_intent("How do I rig a pulk sled for Kahiltna Glacier?") is None
    assert detect_glacier_intent("What is the best pulk harness for glacier travel?") is None
    assert detect_glacier_intent("Crevasse pulk safety protocols") is None
    assert detect_glacier_intent("Sled haul through the icefall") is None

    # Pulk keywords must not be hijacked by mountaineering
    assert detect_mountaineering_intent("Expedition pulk hauling on Ingraham Glacier") is None
    assert detect_mountaineering_intent("Pulk haul shaft setup for glacier ascent") is None

    # Pulk keywords must not be hijacked by dogsledding
    assert extract_dogsled_intent("Glacial sledging with a human-hauled pulk sled") is None
    assert extract_dogsled_intent("Sled haul with rigid haul shaft") is None


def test_model_properties_and_aliases() -> None:
    # Test PulkGearItem aliases
    gear = PulkGearItem.model_validate({
        "itemId": "gear-alias-1",
        "name": "Alias Gear",
        "purpose": "Alias Description",
    })
    assert gear.id == "gear-alias-1"
    assert gear.item_id == "gear-alias-1"
    assert gear.description == "Alias Description"
    assert gear.purpose == "Alias Description"

    # Test PulkDynamicsQuery camelCase aliases and properties
    query = PulkDynamicsQuery.model_validate({
        "routeId": "denali-kahiltna-glacier-highway",
        "riggingSystem": "rigid_fiberglass_shaft_harness",
        "payloadKg": 65.0,
        "haulerWeightKg": 82.0,
        "inclineDegrees": 9.0,
        "snowCondition": "hard_blue_ice",
        "crevasseHazard": "extreme",
    })
    assert query.routeId == "denali-kahiltna-glacier-highway"
    assert query.riggingSystem == "rigid_fiberglass_shaft_harness"
    assert query.payloadKg == 65.0
    assert query.haulerWeightKg == 82.0
    assert query.inclineDegrees == 9.0
    assert query.snowCondition == "hard_blue_ice"
    assert query.crevasseHazard == "extreme"

    # Test PulkDynamicsResult properties
    res = calculate_pulk_dynamics(query)
    assert res.routeTitle == "Denali Kahiltna Glacier Pulk Ascent"
    assert res.routeId == "denali-kahiltna-glacier-highway"
    assert res.towForceNewtons == res.tow_force_newtons
    assert res.gravityForceNewtons == res.gravity_force_newtons
    assert res.frictionForceNewtons == res.friction_force_newtons
    assert res.downhillOverrunJoules == res.downhill_overrun_joules
    assert res.crevasseArrestForceKiloNewtons == res.crevasse_arrest_force_kilonewtons
    assert res.arrestSafety == res.arrest_safety
    assert res.riggingAdvisory == res.rigging_advisory
    assert res.crevasseExtractionProtocol == res.crevasse_extraction_protocol

    # Test FormattedCrevassePulkResponse methods
    resp = format_crevasse_pulk_response("calculate", res)
    assert resp.get("non_existent", "default") == "default"
    assert "crevasse_pulk_info" in resp
    assert resp["crevasse_pulk_info"]["action"] == "calculate"
    assert list(resp.keys())
    assert list(resp.values())
    assert list(resp.items())


def test_extract_intent_additional_branches() -> None:
    # Test Athabasca route extraction
    intent_ath = extract_crevasse_pulk_intent("What is the slope of Athabasca sledging route?")
    assert intent_ath.route_id == "columbia-icefield-athabasca"

    # Test terrain variations
    intent_moraine = extract_crevasse_pulk_intent("Hauling across moraine firn basin")
    assert intent_moraine.terrain == "moraine_firn_basin"

    intent_sastrugi = extract_crevasse_pulk_intent("Pulk towing across wind scoured sastrugi")
    assert intent_sastrugi.terrain == "wind_scoured_sastrugi"

    intent_headwall = extract_crevasse_pulk_intent("Staging on steep alpine headwall")
    assert intent_headwall.terrain == "steep_alpine_headwall"

    # Test risk variations
    intent_low = extract_crevasse_pulk_intent("Routes with low crevasse risk")
    assert intent_low.risk == "low"

    intent_extreme = extract_crevasse_pulk_intent("Routes with extreme crevasse hazard")
    assert intent_extreme.risk == "extreme"

    # Test direct ID match
    intent_direct = extract_crevasse_pulk_intent("Check status for bagley-icefield-traverse")
    assert intent_direct.route_id == "bagley-icefield-traverse"


def test_format_response_and_prompt_coverage() -> None:
    # Existing dict passed to format_crevasse_pulk_response
    existing = {"crevasse_pulk_info": {"action": "custom"}, "answer": "Custom answer"}
    formatted_existing = format_crevasse_pulk_response("custom", existing)
    assert formatted_existing["crevasse_pulk_info"]["action"] == "custom"
    assert formatted_existing.get("answer") == "Custom answer"

    # Test build_crevasse_pulk_prompt with CrevassePulkIntent
    from contoso_chat.crevasse_pulk import CrevassePulkIntent
    intent_obj = CrevassePulkIntent(action="route_detail", route_id="ruth-gorge-great-gorge-freight")
    prompt = build_crevasse_pulk_prompt(intent_obj)
    assert "Ruth Glacier Great Gorge Sled Haul" in prompt
