from contoso_chat.chat_tools import (
    create_response,
    primitive_trapping_tool,
    resolve_tool,
    trail_packing_tool,
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
