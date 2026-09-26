from contoso_chat.beachcombing import (
    BeachcombingIntent,
    BeachcombingRequest,
    BeachcombingResponse,
)
from contoso_chat.chat_tools import (
    beachcombing_tool,
    create_response,
    primitive_trapping_tool,
    resolve_tool,
    trail_packing_tool,
    tree_climbing_tool,
    wild_ice_tool,
)
from contoso_chat.primitive_trapping import (
    TrappingCalculationRequest,
    TrappingCalculationResponse,
    TrappingIntent,
)
from contoso_chat.trail_packing import (
    TrailPackingIntent,
    TrailPackingRequest,
    TrailPackingResponse,
)
from contoso_chat.tree_climbing import (
    TreeClimbingIntent,
    TreeClimbingRequest,
    TreeClimbingResponse,
)
from contoso_chat.wild_ice import (
    WildIceIntent,
    WildIceRequest,
    WildIceResponse,
)


def test_trail_packing_tool_calculation():
    req = TrailPackingRequest(route_id="bob-marshall-wilderness")
    res = trail_packing_tool(req)
    assert isinstance(res, TrailPackingResponse)
    assert res.route_id == "bob-marshall-wilderness"


def test_trail_packing_tool_dict_args():
    res = trail_packing_tool(action="routes_list", saddle_type="decker")
    assert isinstance(res, list)
    assert len(res) == 3


def test_trail_packing_tool_gear():
    res = trail_packing_tool(action="gear_checklist")
    assert isinstance(res, list)
    assert len(res) == 6


def test_resolve_tool_with_trail_packing_intent():
    intent = TrailPackingIntent(action="routes_list", saddle_type="sawbuck")
    result = resolve_tool(intent, question="Which trips use sawbuck saddles?")
    assert result is not None
    assert "trail_packing_info" in result
    assert result["trail_packing_info"]["action"] == "routes_list"


def test_create_response_with_trail_packing_intent():
    resp = create_response("Tell me about the Bob Marshall wilderness pack string expedition")
    assert resp is not None
    assert "trail_packing_info" in resp
    assert resp["trail_packing_info"]["route_id"] == "bob-marshall-wilderness"
    assert "Bob Marshall Wilderness" in resp["answer"]


def test_primitive_trapping_tool_calculation():
    req = TrappingCalculationRequest(mechanism_id="figure-4-deadfall", deadfall_weight_lbs=18.0)
    res = primitive_trapping_tool(req)
    assert isinstance(res, TrappingCalculationResponse)
    assert res.mechanism_id == "figure-4-deadfall"
    assert res.lethality_status == "humane_instant_dispatch"


def test_primitive_trapping_tool_dict_args():
    res = primitive_trapping_tool(action="mechanisms_list", category="deadfall")
    assert isinstance(res, list)
    assert len(res) == 3


def test_primitive_trapping_tool_gear():
    res = primitive_trapping_tool(action="gear_checklist")
    assert isinstance(res, list)
    assert len(res) == 6


def test_resolve_tool_with_primitive_trapping_intent():
    intent = TrappingIntent(action="mechanisms_list", category="snare")
    result = resolve_tool(intent, question="Which primitive cordage snares are documented?")
    assert result is not None
    assert "primitive_trapping_info" in result
    assert result["primitive_trapping_info"]["action"] == "mechanisms_list"


def test_create_response_with_primitive_trapping_intent():
    resp = create_response("Tell me about the Paiute deadfall hair trigger toggle mechanism")
    assert resp is not None
    assert "primitive_trapping_info" in resp
    assert resp["primitive_trapping_info"]["mechanism_id"] == "paiute-deadfall"
    assert "Paiute" in resp["answer"]


def test_wild_ice_tool_calculation():
    req = WildIceRequest(venue_id="lake-malaren-archipelago", thickness_cm=8.0)
    res = wild_ice_tool(req)
    assert isinstance(res, WildIceResponse)
    assert res.venue_id == "lake-malaren-archipelago"
    assert res.effective_thickness_cm == 8.0


def test_wild_ice_tool_dict_args():
    res = wild_ice_tool(action="venues_list", ice_type="black_ice")
    assert isinstance(res, list)
    assert len(res) == 4


def test_wild_ice_tool_gear():
    res = wild_ice_tool(action="gear_checklist")
    assert isinstance(res, list)
    assert len(res) == 6


def test_resolve_tool_with_wild_ice_intent():
    intent = WildIceIntent(action="venues_list")
    result = resolve_tool(intent, question="Where can I go wild ice touring?")
    assert result is not None
    assert "wild_ice_info" in result
    assert result["wild_ice_info"]["action"] == "venues_list"


def test_create_response_with_wild_ice_intent():
    resp = create_response("Tell me about wild ice tour skating on Lake Mälaren archipelago")
    assert resp is not None
    assert "wild_ice_info" in resp
    assert resp["wild_ice_info"]["venue_id"] == "lake-malaren-archipelago"
    assert "Lake Mälaren" in resp["answer"]


def test_tree_climbing_tool_calculation():
    req = TreeClimbingRequest(grove_id="redwood-canopy-prairie-creek")
    res = tree_climbing_tool(req)
    assert isinstance(res, TreeClimbingResponse)
    assert res.grove_id == "redwood-canopy-prairie-creek"
    assert res.peak_fork_load_lbs == 456


def test_tree_climbing_tool_dict_args():
    res = tree_climbing_tool(action="groves_list", climbing_system="SRT")
    assert isinstance(res, list)
    assert len(res) == 4


def test_tree_climbing_tool_gear():
    res = tree_climbing_tool(action="gear_checklist")
    assert isinstance(res, list)
    assert len(res) == 6


def test_resolve_tool_with_tree_climbing_intent():
    intent = TreeClimbingIntent(action="groves_list")
    result = resolve_tool(intent, question="Which canopy groves are available for tree climbing?")
    assert result is not None
    assert "tree_climbing_info" in result
    assert result["tree_climbing_info"]["action"] == "groves_list"


def test_create_response_with_tree_climbing_intent():
    resp = create_response("Tell me about Prairie Creek redwood canopy climbing expedition")
    assert resp is not None
    assert "tree_climbing_info" in resp
    assert resp["tree_climbing_info"]["grove_id"] == "redwood-canopy-prairie-creek"
    assert "Prairie Creek" in resp["answer"]


def test_beachcombing_tool_calculation():
    req = BeachcombingRequest(site_id="glass-beach-fort-bragg")
    res = beachcombing_tool(req)
    assert isinstance(res, BeachcombingResponse)
    assert res.site_id == "glass-beach-fort-bragg"


def test_beachcombing_tool_dict_args():
    res = beachcombing_tool(action="sites_list", shoreline_type="gravel_pebble_cove")
    assert isinstance(res, list)
    assert len(res) == 2


def test_beachcombing_tool_gear():
    res = beachcombing_tool(action="gear_checklist")
    assert isinstance(res, list)
    assert len(res) == 6


def test_resolve_tool_with_beachcombing_intent():
    intent = BeachcombingIntent(action="sites_list", shoreline_type="barrier_island_sandspit")
    result = resolve_tool(intent, question="Which barrier island sites are good for sea glass?")
    assert result is not None
    assert "beachcombing_info" in result
    assert result["beachcombing_info"]["action"] == "sites_list"


def test_create_response_with_beachcombing_intent():
    resp = create_response("Tell me about Glass Beach Fort Bragg sea glass foraging")
    assert resp is not None
    assert "beachcombing_info" in resp
    assert resp["beachcombing_info"]["site_id"] == "glass-beach-fort-bragg"
    assert "Glass Beach" in resp["answer"]
