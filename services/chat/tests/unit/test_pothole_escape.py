import pytest
from contoso_chat.canyoneering import detect_canyoneering_intent
from contoso_chat.chat import handle_pothole_escape_intent
from contoso_chat.pothole_escape import (
    EscapeTechnique,
    FormattedPotholeEscapeResponse,
    PotholeCanyonRoute,
    PotholeDynamicsQuery,
    PotholeDynamicsResult,
    PotholeGearItem,
    PotholeSafetyStatus,
    WallWetness,
    WaterLevelCondition,
    build_pothole_escape_prompt,
    calculate_pothole_dynamics,
    detect_pothole_escape_intent,
    extract_pothole_escape_intent,
    format_pothole_escape_response,
    get_pothole_gear,
    get_pothole_route,
    get_pothole_routes,
    pothole_escape_tool,
)
from contoso_chat.stream import generate_pothole_escape_stream_events


def test_pothole_escape_enums():
    assert EscapeTechnique.SANDTRAP_GHOST_ANCHOR == "sandtrap_ghost_anchor"
    assert EscapeTechnique.POT_HOLE_ESCAPE_HOOK == "pot_hole_escape_hook"
    assert EscapeTechnique.WATER_ANCHOR_PACK_TOSS == "water_anchor_pack_toss"
    assert EscapeTechnique.CHEATER_STICK_REACH == "cheater_stick_reach"

    assert WaterLevelCondition.BONE_DRY_SCOUR == "bone_dry_scour"
    assert WaterLevelCondition.KNEE_WADING_SAND == "knee_wading_sand"
    assert WaterLevelCondition.SEMI_SWIMMING_KEEPER == "semi_swimming_keeper"
    assert WaterLevelCondition.DEEP_SWIMMING_KEEPER == "deep_swimming_keeper"
    assert WaterLevelCondition.FLOODED_SWIMMING_FLUME == "flooded_swimming_flume"

    assert WallWetness.DRY_SLICKROCK == "dry_slickrock"
    assert WallWetness.DAMP_SANDSTONE == "damp_sandstone"
    assert WallWetness.SLIPPERY_ALGAE_SCUM == "slippery_algae_scum"

    assert PotholeSafetyStatus.NOMINAL_PARTNER_BOOST == "nominal_partner_boost"
    assert PotholeSafetyStatus.CAUTION_TECHNICAL_HOOK_REQUIRED == "caution_technical_hook_required"
    assert PotholeSafetyStatus.CRITICAL_KEEPER_TRAP_HAZARD == "critical_keeper_trap_hazard"


def test_pothole_models_and_aliases():
    route_data = {
        "routeId": "test-route",
        "title": "Test Canyon Route",
        "region": "Utah Desert",
        "range": "Escalante",
        "depthMeters": 25.5,
        "primaryTechnique": "sandtrap_ghost_anchor",
        "lipFrictionAngleDegrees": 62.0,
        "typicalWaterLevel": "semi_swimming_keeper",
        "description": "Test canyon with potholes.",
        "highlights": ["Test highlight 1", "Test highlight 2"],
    }
    route = PotholeCanyonRoute.model_validate(route_data)
    assert route.id == "test-route"
    assert route.title == "Test Canyon Route"
    assert route.name == "Test Canyon Route"
    assert route.depth_meters == 25.5
    assert route.depthMeters == 25.5
    assert route.primary_technique == "sandtrap_ghost_anchor"
    assert route.primaryTechnique == "sandtrap_ghost_anchor"
    assert route.lip_friction_angle_degrees == 62.0
    assert route.lipFrictionAngleDegrees == 62.0
    assert route.typical_water_level == "semi_swimming_keeper"
    assert route.typicalWaterLevel == "semi_swimming_keeper"

    query_data = {
        "routeId": "neon-canyon-golden-cathedral",
        "technique": "pot_hole_escape_hook",
        "waterLevel": "deep_swimming_keeper",
        "wallWetness": "damp_sandstone",
        "teamSize": 4,
        "leadClimberWeightKg": 80.0,
        "lipHeightMeters": 4.0,
        "inclineAngleDegrees": 70.0,
    }
    query = PotholeDynamicsQuery.model_validate(query_data)
    assert query.route_id == "neon-canyon-golden-cathedral"
    assert query.routeId == "neon-canyon-golden-cathedral"
    assert query.water_level == "deep_swimming_keeper"
    assert query.waterLevel == "deep_swimming_keeper"
    assert query.wall_wetness == "damp_sandstone"
    assert query.wallWetness == "damp_sandstone"
    assert query.team_size == 4
    assert query.teamSize == 4
    assert query.lead_climber_weight_kg == 80.0
    assert query.leadClimberWeightKg == 80.0
    assert query.lip_height_meters == 4.0
    assert query.lipHeightMeters == 4.0
    assert query.incline_angle_degrees == 70.0
    assert query.inclineAngleDegrees == 70.0

    result_data = {
        "routeTitle": "Test Route Result",
        "routeId": "test-route",
        "effectiveHoistForceN": 650,
        "packCounterweightKg": 49.7,
        "escapeDifficultyIndex": 0.65,
        "safetyStatus": "caution_technical_hook_required",
        "anchorRetrievalAdvisory": "Check edge protection.",
        "tacticalEscapeProtocol": "Maintain tension.",
    }
    result = PotholeDynamicsResult.model_validate(result_data)
    assert result.route_title == "Test Route Result"
    assert result.routeTitle == "Test Route Result"
    assert result.route_id == "test-route"
    assert result.routeId == "test-route"
    assert result.effective_hoist_force_n == 650
    assert result.effectiveHoistForceN == 650
    assert result.pack_counterweight_kg == 49.7
    assert result.packCounterweightKg == 49.7
    assert result.escape_difficulty_index == 0.65
    assert result.escapeDifficultyIndex == 0.65
    assert result.safety_status == "caution_technical_hook_required"
    assert result.safetyStatus == "caution_technical_hook_required"
    assert result.anchorRetrievalAdvisory == "Check edge protection."
    assert result.tacticalEscapeProtocol == "Maintain tension."

    gear_data = {
        "itemId": "custom-gear-id",
        "name": "Custom Anchor Kit",
        "category": "Anchors",
        "mandatory": True,
        "description": "Custom gear item.",
    }
    gear = PotholeGearItem.model_validate(gear_data)
    assert gear.item_id == "custom-gear-id"
    assert gear.id == "custom-gear-id"
    assert gear.itemId == "custom-gear-id"
    assert gear.description == "Custom gear item."
    assert gear.purpose == "Custom gear item."


def test_formatted_response_wrapper():
    data = {"pothole_escape_info": {"action": "catalog", "routes": []}, "answer": "Hello"}
    resp = FormattedPotholeEscapeResponse("Hello", data)
    assert str(resp) == "Hello"
    assert resp.get("pothole_escape_info") == data["pothole_escape_info"]
    assert resp["answer"] == "Hello"
    assert "pothole_escape_info" in resp
    assert "nonexistent" not in resp
    assert list(resp.keys()) == ["pothole_escape_info", "answer"]
    assert len(list(resp.values())) == 2
    assert len(list(resp.items())) == 2


def test_catalog_routes_and_filtering():
    routes = get_pothole_routes()
    assert len(routes) == 5
    route_ids = [r.id for r in routes]
    assert "neon-canyon-golden-cathedral" in route_ids
    assert "choprock-canyon-keepers" in route_ids
    assert "black-hole-white-canyon" in route_ids
    assert "imlay-canyon-sneffels" in route_ids
    assert "heaps-canyon-emerald-pools" in route_ids

    sandtrap_routes = get_pothole_routes(technique="sandtrap_ghost_anchor")
    assert len(sandtrap_routes) == 2
    sandtrap_ids = [r.id for r in sandtrap_routes]
    assert "neon-canyon-golden-cathedral" in sandtrap_ids
    assert "heaps-canyon-emerald-pools" in sandtrap_ids

    hook_routes = get_pothole_routes(technique="pot_hole_escape_hook")
    assert len(hook_routes) == 1
    assert hook_routes[0].id == "choprock-canyon-keepers"

    pack_toss_routes = get_pothole_routes(technique="water_anchor_pack_toss")
    assert len(pack_toss_routes) == 1
    assert pack_toss_routes[0].id == "black-hole-white-canyon"

    stick_routes = get_pothole_routes(technique="cheater_stick_reach")
    assert len(stick_routes) == 1
    assert stick_routes[0].id == "imlay-canyon-sneffels"


def test_single_route_lookup():
    neon = get_pothole_route("neon-canyon-golden-cathedral")
    assert neon is not None
    assert neon.id == "neon-canyon-golden-cathedral"
    assert "Golden Cathedral" in neon.title
    assert neon.range == "Grand Staircase-Escalante National Monument"
    assert neon.depth_meters == 18.0
    assert len(neon.highlights) == 3

    unknown = get_pothole_route("nonexistent-abyss-canyon")
    assert unknown is None


def test_gear_checklist():
    gear = get_pothole_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    item_ids = [g.item_id for g in gear]
    assert "sandtrap-ghosting-anchor" in item_ids
    assert "telescoping-cheater-stick" in item_ids
    assert "talon-pothole-escape-hooks" in item_ids
    assert "water-pack-toss-cord" in item_ids
    assert "foot-stirrup-etrier" in item_ids
    assert "full-neoprene-wetsuit" in item_ids


def test_calculate_pothole_dynamics_nominal():
    # Low incline, low lip height, dry wall, bone dry water level -> nominal boost
    query = PotholeDynamicsQuery(
        route_id="neon-canyon-golden-cathedral",
        technique="sandtrap_ghost_anchor",
        water_level="bone_dry_scour",
        wall_wetness="dry_slickrock",
        team_size=3,
        lead_climber_weight_kg=70.0,
        lip_height_meters=1.5,
        incline_angle_degrees=30.0,
    )
    result = calculate_pothole_dynamics(query)
    assert result.route_id == "neon-canyon-golden-cathedral"
    assert "Neon Canyon" in result.route_title
    assert result.safety_status == PotholeSafetyStatus.NOMINAL_PARTNER_BOOST.value
    assert result.effective_hoist_force_n > 0
    assert result.pack_counterweight_kg > 0
    assert result.escape_difficulty_index < 0.45
    assert "Sandtrap" in result.anchor_retrieval_advisory
    assert "NOMINAL BOOST" in result.tactical_escape_protocol


def test_calculate_pothole_dynamics_caution():
    # Hook technique or moderate difficulty -> caution technical hook required
    query = PotholeDynamicsQuery(
        route_id="choprock-canyon-keepers",
        technique="pot_hole_escape_hook",
        water_level="semi_swimming_keeper",
        wall_wetness="damp_sandstone",
        team_size=4,
        lead_climber_weight_kg=75.0,
        lip_height_meters=3.0,
        incline_angle_degrees=60.0,
    )
    result = calculate_pothole_dynamics(query)
    assert result.route_id == "choprock-canyon-keepers"
    assert result.safety_status == PotholeSafetyStatus.CAUTION_TECHNICAL_HOOK_REQUIRED.value
    assert "talon escape hook" in result.anchor_retrieval_advisory
    assert "TECHNICAL CAUTION" in result.tactical_escape_protocol


def test_calculate_pothole_dynamics_critical_hazard():
    # Critical hazard triggered by: lip height >= 4.5m OR flooded flume OR difficulty >= 0.75
    query_high_lip = PotholeDynamicsQuery(
        route_id="imlay-canyon-sneffels",
        technique="cheater_stick_reach",
        water_level="deep_swimming_keeper",
        wall_wetness="slippery_algae_scum",
        team_size=4,
        lead_climber_weight_kg=80.0,
        lip_height_meters=4.8,
        incline_angle_degrees=75.0,
    )
    result_high_lip = calculate_pothole_dynamics(query_high_lip)
    assert result_high_lip.safety_status == PotholeSafetyStatus.CRITICAL_KEEPER_TRAP_HAZARD.value
    assert "CRITICAL HAZARD" in result_high_lip.tactical_escape_protocol

    query_flooded = PotholeDynamicsQuery(
        route_id="black-hole-white-canyon",
        technique="water_anchor_pack_toss",
        water_level="flooded_swimming_flume",
        wall_wetness="slippery_algae_scum",
        team_size=2,
        lead_climber_weight_kg=75.0,
        lip_height_meters=2.5,
        incline_angle_degrees=50.0,
    )
    result_flooded = calculate_pothole_dynamics(query_flooded)
    assert result_flooded.safety_status == PotholeSafetyStatus.CRITICAL_KEEPER_TRAP_HAZARD.value
    assert "pack counterweight" in result_flooded.anchor_retrieval_advisory


def test_calculate_pothole_dynamics_invalid_route():
    query = PotholeDynamicsQuery(route_id="nonexistent-fantasy-canyon")
    with pytest.raises(ValueError, match="Pothole canyon route 'nonexistent-fantasy-canyon' not found"):
        calculate_pothole_dynamics(query)


def test_calculate_pothole_dynamics_friction_and_water_drag():
    base_params = {
        "route_id": "heaps-canyon-emerald-pools",
        "technique": "sandtrap_ghost_anchor",
        "team_size": 3,
        "lead_climber_weight_kg": 75.0,
        "lip_height_meters": 3.0,
        "incline_angle_degrees": 60.0,
    }

    # Compare wall wetness friction factors: dry (0.65) vs algae (1.25)
    q_dry = PotholeDynamicsQuery(**base_params, wall_wetness="dry_slickrock", water_level="bone_dry_scour")
    q_algae = PotholeDynamicsQuery(**base_params, wall_wetness="slippery_algae_scum", water_level="bone_dry_scour")
    res_dry = calculate_pothole_dynamics(q_dry)
    res_algae = calculate_pothole_dynamics(q_algae)
    assert res_algae.effective_hoist_force_n > res_dry.effective_hoist_force_n

    # Compare water drag: bone_dry (1.0) vs knee (1.1) vs deep (1.4) vs flooded (1.55)
    q_knee = PotholeDynamicsQuery(**base_params, wall_wetness="damp_sandstone", water_level="knee_wading_sand")
    q_deep = PotholeDynamicsQuery(**base_params, wall_wetness="damp_sandstone", water_level="deep_swimming_keeper")
    res_knee = calculate_pothole_dynamics(q_knee)
    res_deep = calculate_pothole_dynamics(q_deep)
    assert res_deep.effective_hoist_force_n > res_knee.effective_hoist_force_n


def test_detect_pothole_escape_intent():
    # Empty string or whitespace
    assert detect_pothole_escape_intent("") is False
    assert detect_pothole_escape_intent("   ") is False

    # Positive keywords
    assert detect_pothole_escape_intent("How do I escape a keeper pothole in Neon Canyon?") is True
    assert detect_pothole_escape_intent("What is the sandtrap ghost anchor rigging technique?") is True
    assert detect_pothole_escape_intent("Need cheater stick recommendations for slot canyons") is True
    assert detect_pothole_escape_intent("Can I use talon escape hooks in Choprock?") is True
    assert detect_pothole_escape_intent("How does water anchor pack toss work for potholes?") is True
    assert detect_pothole_escape_intent("Tell me about White Canyon black hole") is True
    assert detect_pothole_escape_intent("Is Imlay canyon Sneffels route open?") is True
    assert detect_pothole_escape_intent("Heaps canyon emerald pools descent plan") is True

    # Negative exclusions
    assert detect_pothole_escape_intent("Can I get a refund on order #12345?") is False
    assert detect_pothole_escape_intent("Where is my return label?") is False
    assert detect_pothole_escape_intent("Tell me about pack goat trekking") is False
    assert detect_pothole_escape_intent("Dogsled and mushing expedition") is False
    assert detect_pothole_escape_intent("Snowkiting and kite harness gear") is False
    assert detect_pothole_escape_intent("Crevasse pulk sled rigging on glacier") is False
    assert detect_pothole_escape_intent("Wilderness bog-shoeing across muskeg peatland") is False
    assert detect_pothole_escape_intent("Cave diving sump exploration") is False


def test_disambiguation_guard_canyoneering():
    # Pothole keywords in canyoneering exclusions ensure no hijacking
    pothole_msg = "How do I build a sandtrap ghost anchor for pothole escape in Neon Canyon?"
    assert detect_pothole_escape_intent(pothole_msg) is True
    # Canyoneering intent should be blocked by mutual exclusion
    assert detect_canyoneering_intent(pothole_msg) is None


def test_extract_pothole_escape_intent():
    # Catalog intent
    intent_cat = extract_pothole_escape_intent("List all slot canyon pothole escape routes")
    assert intent_cat.action == "catalog"

    # Route detail intent
    intent_route = extract_pothole_escape_intent("Tell me about Neon Canyon Golden Cathedral route details")
    assert intent_route.action == "get_route"
    assert intent_route.route_id == "neon-canyon-golden-cathedral"

    # Calculate intent
    intent_calc = extract_pothole_escape_intent("Calculate effective hoist force and counterweight in Choprock")
    assert intent_calc.action == "calculate"
    assert intent_calc.route_id == "choprock-canyon-keepers"
    assert intent_calc.technique is not None or "hook" in intent_calc.action

    # Gear checklist intent
    intent_gear = extract_pothole_escape_intent("What is the mandatory gear checklist for keeper pothole escape?")
    assert intent_gear.action == "gear_checklist"


def test_format_pothole_escape_response():
    # Catalog
    resp_cat = format_pothole_escape_response("catalog")
    assert "Contoso Backcountry Slot Canyon Pot-Hole Escape Catalog" in str(resp_cat)
    assert resp_cat.get("pothole_escape_info")["action"] == "catalog"
    assert len(resp_cat.get("pothole_escape_info")["routes"]) == 5

    # Route detail
    resp_route = format_pothole_escape_response("get_route", "neon-canyon-golden-cathedral")
    assert "Neon Canyon Golden Cathedral" in str(resp_route)
    assert resp_route.get("pothole_escape_info")["action"] == "get_route"
    assert resp_route.get("pothole_escape_info")["route"]["id"] == "neon-canyon-golden-cathedral"

    # Gear checklist
    resp_gear = format_pothole_escape_response("gear_checklist")
    assert "Mandatory Backcountry Slot Canyon Pothole Escape" in str(resp_gear)
    assert resp_gear.get("pothole_escape_info")["action"] == "gear_checklist"
    assert resp_gear.get("pothole_escape_info")["mandatory_count"] == 6

    # Calculate
    calc_q = PotholeDynamicsQuery(route_id="choprock-canyon-keepers")
    resp_calc = format_pothole_escape_response("calculate", calc_q)
    assert "Dynamics for Choprock Canyon Deep Slot" in str(resp_calc)
    assert resp_calc.get("pothole_escape_info")["action"] == "calculate"
    assert "effective_hoist_force_n" in resp_calc.get("pothole_escape_info")

    # Already formatted pass-through
    passthrough = format_pothole_escape_response(
        "any", {"pothole_escape_info": {"custom": True}, "answer": "Custom Answer"}
    )
    assert str(passthrough) == "Custom Answer"
    assert passthrough.get("pothole_escape_info")["custom"] is True


def test_build_pothole_escape_prompt():
    prompt_generic = build_pothole_escape_prompt()
    assert "Backcountry Desert Slot Canyon Pot-Hole Escape" in prompt_generic
    assert "Ghost Anchor Rigging" in prompt_generic
    assert "Sandtrap" in prompt_generic

    prompt_neon = build_pothole_escape_prompt("Tell me about Neon Canyon Golden Cathedral escapes")
    assert "Focused Slot Canyon Route: Neon Canyon Golden Cathedral" in prompt_neon


def test_pothole_escape_tool():
    # Test catalog action
    res_cat = pothole_escape_tool(action="catalog")
    assert "pothole_escape_info" in res_cat
    assert res_cat["pothole_escape_info"]["action"] == "catalog"

    # Test gear action
    res_gear = pothole_escape_tool(action="gear")
    assert "pothole_escape_info" in res_gear
    assert res_gear["pothole_escape_info"]["action"] == "gear_checklist"

    # Test route detail action
    res_route = pothole_escape_tool(action="get_route", route_id="imlay-canyon-sneffels")
    assert "pothole_escape_info" in res_route
    assert res_route["pothole_escape_info"]["route_id"] == "imlay-canyon-sneffels"

    # Test calculate action
    calc_q = PotholeDynamicsQuery(route_id="black-hole-white-canyon")
    res_calc = pothole_escape_tool(action="calculate", query=calc_q)
    assert "pothole_escape_info" in res_calc
    assert res_calc["pothole_escape_info"]["action"] == "calculate"


def test_chat_handle_pothole_escape_intent():
    assert handle_pothole_escape_intent("What is my shipping status for order #999?") is None
    res = handle_pothole_escape_intent("What gear do I need for keeper pothole escape?")
    assert res is not None
    assert "pothole_escape_info" in res
    assert "answer" in res
    assert len(res["answer"]) > 0


@pytest.mark.anyio
async def test_stream_generate_pothole_escape_stream_events():
    # Non-matching query returns nothing
    events_unrelated = [
        chunk async for chunk in generate_pothole_escape_stream_events("Where is my order #1234?")
    ]
    assert len(events_unrelated) == 0

    # Matching query yields lookup and info events
    events_gear = [
        chunk async for chunk in generate_pothole_escape_stream_events("List pothole escape gear checklist")
    ]
    assert len(events_gear) > 0
    raw_str = "".join(events_gear)
    assert "pothole_escape_lookup" in raw_str
    assert "pothole_escape_info" in raw_str
    assert "[DONE]" in raw_str
