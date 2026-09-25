from typing import Any, Callable, Optional

from .primitive_trapping import (
    TrappingCalculationRequest,
    TrappingIntent,
    calculate_primitive_trapping,
    detect_primitive_trapping_intent,
    format_primitive_trapping_response,
    get_trapping_mechanism,
    get_trapping_mechanisms,
    get_trapping_safety_gear,
)
from .trail_packing import (
    TrailPackingIntent,
    TrailPackingRequest,
    calculate_trail_packing,
    detect_trail_packing_intent,
    format_trail_packing_response,
    get_pack_route,
    get_pack_routes,
    get_tack_checklist,
)


def trail_packing_tool(
    request: Optional[TrailPackingRequest] = None,
    action: Optional[str] = None,
    route_id: Optional[str] = None,
    saddle_type: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for wilderness equestrian trail packing and horse packing expeditions."""
    if isinstance(request, TrailPackingRequest):
        return calculate_trail_packing(request)

    intent: Optional[TrailPackingIntent] = kwargs.get("intent")
    if intent is not None:
        action = intent.action
        route_id = intent.route_id or route_id
        saddle_type = intent.saddle_type or saddle_type

    stock_animal = kwargs.get("stock_animal", "mule")
    left_pannier_lbs = kwargs.get("left_pannier_lbs", 65.0)
    right_pannier_lbs = kwargs.get("right_pannier_lbs", 65.0)
    top_pack_lbs = kwargs.get("top_pack_lbs", 20.0)
    hitch_type = kwargs.get("hitch_type", "diamond_hitch")

    if action in ("calculate_packing", "calculate"):
        req = TrailPackingRequest(
            route_id=route_id or "bob-marshall-wilderness",
            stock_animal=stock_animal,
            left_pannier_lbs=left_pannier_lbs,
            right_pannier_lbs=right_pannier_lbs,
            top_pack_lbs=top_pack_lbs,
            hitch_type=hitch_type,
        )
        return calculate_trail_packing(req)

    if action in ("gear_checklist", "tack_checklist"):
        return get_tack_checklist()

    if action == "route_detail" and route_id:
        return get_pack_route(route_id)

    if action == "routes_list" or saddle_type:
        return get_pack_routes(saddle_type=saddle_type)

    if "left_pannier_lbs" in kwargs or "right_pannier_lbs" in kwargs:
        req = TrailPackingRequest(
            route_id=route_id or "bob-marshall-wilderness",
            stock_animal=stock_animal,
            left_pannier_lbs=left_pannier_lbs,
            right_pannier_lbs=right_pannier_lbs,
            top_pack_lbs=top_pack_lbs,
            hitch_type=hitch_type,
        )
        return calculate_trail_packing(req)

    # Default fallback
    return get_pack_routes(saddle_type=saddle_type)


def primitive_trapping_tool(
    request: Optional[TrappingCalculationRequest] = None,
    action: Optional[str] = None,
    mechanism_id: Optional[str] = None,
    category: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for wilderness bushcraft primitive trapping and deadfall mechanisms."""
    if isinstance(request, TrappingCalculationRequest):
        return calculate_primitive_trapping(request)

    intent: Optional[TrappingIntent] = kwargs.get("intent")
    if intent is not None:
        action = intent.action
        mechanism_id = intent.mechanism_id or mechanism_id
        category = intent.category or category

    quarry = kwargs.get("quarry", "snowshoe_hare")
    deadfall_weight_lbs = kwargs.get("deadfall_weight_lbs", 15.0)
    notch_depth_mm = kwargs.get("notch_depth_mm", 4.0)
    cordage_type = kwargs.get("cordage_type", "tarred_bankline")

    if action in ("calculate_trapping", "calculate"):
        req = TrappingCalculationRequest(
            mechanism_id=mechanism_id or "figure-4-deadfall",
            quarry=quarry,
            deadfall_weight_lbs=deadfall_weight_lbs,
            notch_depth_mm=notch_depth_mm,
            cordage_type=cordage_type,
        )
        return calculate_primitive_trapping(req)

    if action in ("gear_checklist", "gear", "safety_gear"):
        return get_trapping_safety_gear()

    if action == "mechanism_detail" and mechanism_id:
        return get_trapping_mechanism(mechanism_id)

    if action == "mechanisms_list" or category:
        return get_trapping_mechanisms(category=category)

    if "deadfall_weight_lbs" in kwargs or "notch_depth_mm" in kwargs:
        req = TrappingCalculationRequest(
            mechanism_id=mechanism_id or "figure-4-deadfall",
            quarry=quarry,
            deadfall_weight_lbs=deadfall_weight_lbs,
            notch_depth_mm=notch_depth_mm,
            cordage_type=cordage_type,
        )
        return calculate_primitive_trapping(req)

    return get_trapping_mechanisms(category=category)


TOOL_REGISTRY: dict[str, Callable[..., Any]] = {
    "primitive_trapping_tool": primitive_trapping_tool,
    "trail_packing_tool": trail_packing_tool,
}


def resolve_tool(intent: Any, question: str = "", **kwargs: Any) -> Any:
    """Resolve and dispatch appropriate chat tool given an intent or question."""
    if isinstance(intent, TrappingIntent):
        return format_primitive_trapping_response(intent, query=question)
    if isinstance(intent, TrailPackingIntent):
        return format_trail_packing_response(intent, query=question)
    return None


def create_response(request_or_question: Any, **kwargs: Any) -> dict[str, Any]:
    """Create a response invoking registered chat tooling when appropriate."""
    if hasattr(request_or_question, "question"):
        question = str(request_or_question.question)
        customer_id = getattr(request_or_question, "customer_id", "guest")
        chat_history = getattr(request_or_question, "chat_history", None)
    else:
        question = str(request_or_question)
        customer_id = kwargs.get("customer_id", "guest")
        chat_history = kwargs.get("chat_history", None)

    trap_intent = detect_primitive_trapping_intent(question)
    if trap_intent:
        formatted = resolve_tool(trap_intent, question=question)
        return {
            "answer": str(formatted),
            "primitive_trapping_info": formatted.get("primitive_trapping_info"),
            "customer_id": customer_id,
            "chat_history": chat_history,
        }

    tp_intent = detect_trail_packing_intent(question)
    if tp_intent:
        formatted = resolve_tool(tp_intent, question=question)
        return {
            "answer": str(formatted),
            "trail_packing_info": formatted.get("trail_packing_info"),
            "customer_id": customer_id,
            "chat_history": chat_history,
        }

    return {
        "answer": f"Mock response: You asked about '{question}'.",
        "customer_id": customer_id,
        "chat_history": chat_history,
    }
