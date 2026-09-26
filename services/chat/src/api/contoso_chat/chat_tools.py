from typing import Any, Callable, Optional

from .mountain_weather import (
    MountainWeatherIntent,
    MountainWeatherRequest,
    calculate_mountain_weather,
    detect_mountain_weather_intent,
    format_mountain_weather_response,
    get_weather_gear,
    get_weather_sector,
    get_weather_sectors,
)
from .pack_burro import (
    PackBurroIntent,
    PackBurroRequest,
    calculate_pack_burro,
    detect_pack_burro_intent,
    format_pack_burro_response,
    get_burro_gear,
    get_pack_burro_course,
    get_pack_burro_courses,
)
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
from .tree_climbing import (
    TreeClimbingIntent,
    TreeClimbingRequest,
    calculate_tree_climbing,
    detect_tree_climbing_intent,
    format_tree_climbing_response,
    get_canopy_grove,
    get_canopy_groves,
    get_tree_gear,
)
from .wild_ice import (
    WildIceIntent,
    WildIceRequest,
    calculate_wild_ice,
    detect_wild_ice_intent,
    format_wild_ice_response,
    get_wild_ice_gear,
    get_wild_ice_venue,
    get_wild_ice_venues,
)


def _resolve_mw_args(
    intent: Optional[MountainWeatherIntent],
    action: Optional[str],
    sector_id: Optional[str],
    synoptic_level: Optional[str],
) -> tuple[str, Optional[str], Optional[str]]:
    act = action or (intent.action if intent else "sectors_list")
    if "calc" in act:
        act = "calculate_weather"
    elif "gear" in act:
        act = "gear_checklist"
    sec = sector_id or (intent.sector_id if intent else None)
    syn = synoptic_level or (intent.synoptic_level if intent else None)
    return act, sec, syn


def _build_weather_req(
    sec_id: Optional[str],
    kw: dict[str, Any],
) -> MountainWeatherRequest:
    return MountainWeatherRequest(
        sector_id=sec_id if sec_id else "denali-south-buttress",
        baseline_wind_mph=kw.get("baseline_wind_mph", 20.0),
        barometric_drop_hpa=kw.get("barometric_drop_hpa", 1.2),
        jet_stream_offset_km=kw.get("jet_stream_offset_km", 150),
        air_temp_f=kw.get("air_temp_f", 10.0),
    )


def mountain_weather_tool(
    request: Optional[MountainWeatherRequest] = None,
    action: Optional[str] = None,
    sector_id: Optional[str] = None,
    synoptic_level: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for high-altitude mountain weather routing and forecasting."""
    if isinstance(request, MountainWeatherRequest):
        return calculate_mountain_weather(request)

    intent: Optional[MountainWeatherIntent] = kwargs.get("intent")
    action, sector_id, synoptic_level = _resolve_mw_args(
        intent, action, sector_id, synoptic_level
    )

    if action == "calculate_weather" or "baseline_wind_mph" in kwargs:
        req = _build_weather_req(sector_id, kwargs)
        return calculate_mountain_weather(req)
    if action == "gear_checklist":
        return get_weather_gear()
    if action == "sector_detail" and sector_id:
        return get_weather_sector(sector_id)
    return get_weather_sectors(synoptic_level=synoptic_level)


def _resolve_tp_args(
    intent: Optional[TrailPackingIntent],
    action: Optional[str],
    route_id: Optional[str],
    saddle_type: Optional[str],
) -> tuple[str, Optional[str], Optional[str]]:
    act = action or (intent.action if intent else "routes_list")
    if "calc" in act:
        act = "calculate_packing"
    elif "gear" in act or "tack" in act:
        act = "gear_checklist"
    rt = route_id or (intent.route_id if intent else None)
    sad = saddle_type or (intent.saddle_type if intent else None)
    return act, rt, sad


def _build_packing_req(
    rt_id: Optional[str],
    kw: dict[str, Any],
) -> TrailPackingRequest:
    return TrailPackingRequest(
        route_id=rt_id if rt_id else "bob-marshall-wilderness",
        stock_animal=kw.get("stock_animal", "mule"),
        left_pannier_lbs=kw.get("left_pannier_lbs", 65.0),
        right_pannier_lbs=kw.get("right_pannier_lbs", 65.0),
        top_pack_lbs=kw.get("top_pack_lbs", 20.0),
        hitch_type=kw.get("hitch_type", "diamond_hitch"),
    )


def trail_packing_tool(
    request: Optional[TrailPackingRequest] = None,
    action: Optional[str] = None,
    route_id: Optional[str] = None,
    saddle_type: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for wilderness equestrian trail packing expeditions."""
    if isinstance(request, TrailPackingRequest):
        return calculate_trail_packing(request)

    intent: Optional[TrailPackingIntent] = kwargs.get("intent")
    action, route_id, saddle_type = _resolve_tp_args(
        intent, action, route_id, saddle_type
    )

    if action == "calculate_packing" or "left_pannier_lbs" in kwargs:
        return calculate_trail_packing(_build_packing_req(route_id, kwargs))
    if action == "gear_checklist":
        return get_tack_checklist()
    if action == "route_detail" and route_id:
        return get_pack_route(route_id)
    return get_pack_routes(saddle_type=saddle_type)


def _resolve_pt_args(
    intent: Optional[TrappingIntent],
    action: Optional[str],
    mechanism_id: Optional[str],
    category: Optional[str],
) -> tuple[str, Optional[str], Optional[str]]:
    act = action or (intent.action if intent else "mechanisms_list")
    if "calc" in act:
        act = "calculate_trapping"
    elif "gear" in act or "safety" in act:
        act = "gear_checklist"
    mech = mechanism_id or (intent.mechanism_id if intent else None)
    cat = category or (intent.category if intent else None)
    return act, mech, cat


def _build_trapping_req(
    mech_id: Optional[str],
    kw: dict[str, Any],
) -> TrappingCalculationRequest:
    return TrappingCalculationRequest(
        mechanism_id=mech_id if mech_id else "figure-4-deadfall",
        quarry=kw.get("quarry", "snowshoe_hare"),
        deadfall_weight_lbs=kw.get("deadfall_weight_lbs", 15.0),
        notch_depth_mm=kw.get("notch_depth_mm", 4.0),
        cordage_type=kw.get("cordage_type", "tarred_bankline"),
    )


def primitive_trapping_tool(
    request: Optional[TrappingCalculationRequest] = None,
    action: Optional[str] = None,
    mechanism_id: Optional[str] = None,
    category: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for wilderness bushcraft primitive trapping mechanisms."""
    if isinstance(request, TrappingCalculationRequest):
        return calculate_primitive_trapping(request)

    intent: Optional[TrappingIntent] = kwargs.get("intent")
    action, mechanism_id, category = _resolve_pt_args(
        intent, action, mechanism_id, category
    )

    if action == "calculate_trapping" or "deadfall_weight_lbs" in kwargs:
        req = _build_trapping_req(mechanism_id, kwargs)
        return calculate_primitive_trapping(req)
    if action == "gear_checklist":
        return get_trapping_safety_gear()
    if action == "mechanism_detail" and mechanism_id:
        return get_trapping_mechanism(mechanism_id)
    return get_trapping_mechanisms(category=category)


def _resolve_wi_args(
    intent: Optional[WildIceIntent],
    action: Optional[str],
    venue_id: Optional[str],
    ice_type: Optional[str],
) -> tuple[str, Optional[str], Optional[str]]:
    act = action or (intent.action if intent else "venues_list")
    if "calc" in act:
        act = "calculate_ice"
    elif "gear" in act:
        act = "gear_checklist"
    vid = venue_id or (intent.venue_id if intent else None)
    itype = ice_type or (intent.ice_type if intent else None)
    return act, vid, itype


def _build_wild_ice_req(
    ven_id: Optional[str],
    itype: Optional[str],
    kw: dict[str, Any],
) -> WildIceRequest:
    return WildIceRequest(
        venue_id=ven_id if ven_id else "lake-malaren-archipelago",
        ice_type=itype if itype else "black_ice",
        thickness_cm=kw.get("thickness_cm", 8.0),
        skater_weight_lbs=kw.get("skater_weight_lbs", 180.0),
        ambient_temp_f=kw.get("ambient_temp_f", 22.0),
    )


def wild_ice_tool(
    request: Optional[WildIceRequest] = None,
    action: Optional[str] = None,
    venue_id: Optional[str] = None,
    ice_type: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for backcountry Nordic speedskating and wild ice touring."""
    if isinstance(request, WildIceRequest):
        return calculate_wild_ice(request)

    intent: Optional[WildIceIntent] = kwargs.get("intent")
    action, venue_id, ice_type = _resolve_wi_args(
        intent, action, venue_id, ice_type
    )

    if action == "calculate_ice" or "thickness_cm" in kwargs:
        req = _build_wild_ice_req(venue_id, ice_type, kwargs)
        return calculate_wild_ice(req)
    if action == "gear_checklist":
        return get_wild_ice_gear()
    if action == "venue_detail" and venue_id:
        return get_wild_ice_venue(venue_id)
    return get_wild_ice_venues(ice_type=ice_type)


def _resolve_tc_args(
    intent: Optional[TreeClimbingIntent],
    action: Optional[str],
    grove_id: Optional[str],
    climbing_system: Optional[str],
) -> tuple[str, Optional[str], Optional[str]]:
    act = action or (intent.action if intent else "groves_list")
    if "calc" in act:
        act = "calculate_tree_climbing"
    elif "gear" in act:
        act = "gear_checklist"
    gid = grove_id or (intent.grove_id if intent else None)
    cs = climbing_system or (intent.climbing_system if intent else None)
    return act, gid, cs


def _build_tree_climbing_req(
    grv_id: Optional[str],
    cs: Optional[str],
    kw: dict[str, Any],
) -> TreeClimbingRequest:
    return TreeClimbingRequest(
        grove_id=grv_id if grv_id else "redwood-canopy-prairie-creek",
        climbing_system=cs if cs else kw.get("climbing_system", "SRT"),
        anchor_style=kw.get("anchor_style", "basal_anchor"),
        climber_weight_lbs=kw.get("climber_weight_lbs", 190.0),
        branch_diameter_cm=kw.get("branch_diameter_cm", 22.0),
    )


def tree_climbing_tool(
    request: Optional[TreeClimbingRequest] = None,
    action: Optional[str] = None,
    grove_id: Optional[str] = None,
    climbing_system: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for backcountry tree climbing and arboreal canopy research."""
    if isinstance(request, TreeClimbingRequest):
        return calculate_tree_climbing(request)

    intent: Optional[TreeClimbingIntent] = kwargs.get("intent")
    action, grove_id, climbing_system = _resolve_tc_args(
        intent, action, grove_id, climbing_system
    )

    if (
        action == "calculate_tree_climbing"
        or "climber_weight_lbs" in kwargs
        or "branch_diameter_cm" in kwargs
    ):
        req = _build_tree_climbing_req(grove_id, climbing_system, kwargs)
        return calculate_tree_climbing(req)
    if action == "gear_checklist":
        return get_tree_gear()
    if action == "grove_detail" and grove_id:
        return get_canopy_grove(grove_id)
    return get_canopy_groves(climbing_system=climbing_system)


def _resolve_pb_args(
    intent: Optional[PackBurroIntent],
    action: Optional[str],
    course_id: Optional[str],
    burro_type: Optional[str],
) -> tuple[str, Optional[str], Optional[str]]:
    act = action or (intent.action if intent else "courses_list")
    if "calc" in act:
        act = "calculate_packing"
    elif "gear" in act:
        act = "gear_checklist"
    cid = course_id or (intent.course_id if intent else None)
    bt = burro_type or (intent.burro_type if intent else None)
    return act, cid, bt


def _build_pack_burro_req(
    course_id: Optional[str],
    burro_type: Optional[str],
    kw: dict[str, Any],
) -> PackBurroRequest:
    return PackBurroRequest(
        course_id=course_id if course_id else "leadville-boom-days-mosquito-pass",
        burro_type=burro_type if burro_type else kw.get("burro_type", "standard_burro"),
        pack_weight_lbs=kw.get("pack_weight_lbs", 35.0),
        slope_gradient_percent=kw.get("slope_gradient_percent", 18.0),
        runner_pace_min_per_mile=kw.get("runner_pace_min_per_mile", 10.0),
    )


def pack_burro_tool(
    request: Optional[PackBurroRequest] = None,
    action: Optional[str] = None,
    course_id: Optional[str] = None,
    burro_type: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for wilderness pack-burro racing and high-altitude ass packing."""
    if isinstance(request, PackBurroRequest):
        return calculate_pack_burro(request)

    intent: Optional[PackBurroIntent] = kwargs.get("intent")
    action, course_id, burro_type = _resolve_pb_args(
        intent, action, course_id, burro_type
    )

    if (
        action == "calculate_packing"
        or "pack_weight_lbs" in kwargs
        or "slope_gradient_percent" in kwargs
    ):
        req = _build_pack_burro_req(course_id, burro_type, kwargs)
        return calculate_pack_burro(req)
    if action == "gear_checklist":
        return get_burro_gear()
    if action == "course_detail" and course_id:
        return get_pack_burro_course(course_id)
    return get_pack_burro_courses(burro_type=burro_type)


TOOL_REGISTRY: dict[str, Callable[..., Any]] = {
    "pack_burro_tool": pack_burro_tool,
    "mountain_weather_tool": mountain_weather_tool,
    "primitive_trapping_tool": primitive_trapping_tool,
    "trail_packing_tool": trail_packing_tool,
    "wild_ice_tool": wild_ice_tool,
    "tree_climbing_tool": tree_climbing_tool,
}


def resolve_tool(intent: Any, question: str = "", **kwargs: Any) -> Any:
    """Resolve and dispatch appropriate chat tool given an intent."""
    if isinstance(intent, MountainWeatherIntent):
        return format_mountain_weather_response(intent, query=question)
    if isinstance(intent, TrappingIntent):
        return format_primitive_trapping_response(intent, query=question)
    if isinstance(intent, TrailPackingIntent):
        return format_trail_packing_response(intent, query=question)
    if isinstance(intent, WildIceIntent):
        return format_wild_ice_response(intent, query=question)
    if isinstance(intent, TreeClimbingIntent):
        return format_tree_climbing_response(intent, query=question)
    if isinstance(intent, PackBurroIntent):
        return format_pack_burro_response(intent, query=question)
    return None


def _extract_request_context(
    request_or_question: Any,
    **kwargs: Any,
) -> tuple[str, str, Any]:
    if hasattr(request_or_question, "question"):
        q = str(request_or_question.question)
        cid = getattr(request_or_question, "customer_id", "guest")
        hist = getattr(request_or_question, "chat_history", None)
    else:
        q = str(request_or_question)
        cid = kwargs.get("customer_id", "guest")
        hist = kwargs.get("chat_history", None)
    return q, cid, hist


def _dispatch_tool(question: str) -> Optional[tuple[str, str, Any]]:
    pb_intent = detect_pack_burro_intent(question)
    if pb_intent:
        fmt = resolve_tool(pb_intent, question=question)
        return str(fmt), "pack_burro_info", fmt.get("pack_burro_info")

    mw_intent = detect_mountain_weather_intent(question)
    if mw_intent:
        fmt = resolve_tool(mw_intent, question=question)
        return str(fmt), "mountain_weather_info", fmt.get(
            "mountain_weather_info"
        )

    trap_intent = detect_primitive_trapping_intent(question)
    if trap_intent:
        fmt = resolve_tool(trap_intent, question=question)
        return str(fmt), "primitive_trapping_info", fmt.get(
            "primitive_trapping_info"
        )

    tp_intent = detect_trail_packing_intent(question)
    if tp_intent:
        fmt = resolve_tool(tp_intent, question=question)
        return str(fmt), "trail_packing_info", fmt.get("trail_packing_info")

    wi_intent = detect_wild_ice_intent(question)
    if wi_intent:
        fmt = resolve_tool(wi_intent, question=question)
        return str(fmt), "wild_ice_info", fmt.get("wild_ice_info")

    tc_intent = detect_tree_climbing_intent(question)
    if tc_intent:
        fmt = resolve_tool(tc_intent, question=question)
        return str(fmt), "tree_climbing_info", fmt.get("tree_climbing_info")

    return None


def create_response(request_or_question: Any, **kwargs: Any) -> dict[str, Any]:
    """Create a response invoking registered chat tooling when appropriate."""
    question, customer_id, chat_history = _extract_request_context(
        request_or_question, **kwargs
    )
    result = _dispatch_tool(question)
    if result:
        ans, key, info = result
        return {
            "answer": ans,
            key: info,
            "customer_id": customer_id,
            "chat_history": chat_history,
        }

    return {
        "answer": f"Mock response: You asked about '{question}'.",
        "customer_id": customer_id,
        "chat_history": chat_history,
    }
