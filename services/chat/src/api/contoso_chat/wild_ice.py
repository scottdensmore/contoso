from typing import Any, Optional

from .wild_ice_catalog import (
    DEFAULT_WILD_ICE_GEAR,
    DEFAULT_WILD_ICE_VENUES,
)
from .wild_ice_models import (
    FormattedWildIceResponse,
    WildIceGearItemModel,
    WildIceIntent,
    WildIceRequest,
    WildIceResponse,
    WildIceVenueModel,
)

__all__ = [
    "DEFAULT_WILD_ICE_GEAR",
    "DEFAULT_WILD_ICE_VENUES",
    "FormattedWildIceResponse",
    "WildIceGearItemModel",
    "WildIceIntent",
    "WildIceRequest",
    "WildIceResponse",
    "WildIceVenueModel",
    "build_wild_ice_prompt",
    "calculate_wild_ice",
    "detect_wild_ice_intent",
    "format_wild_ice_response",
    "get_wild_ice_gear",
    "get_wild_ice_venue",
    "get_wild_ice_venues",
]


def get_wild_ice_venues(
    ice_type: Optional[str] = None,
) -> list[WildIceVenueModel]:
    venues = list(DEFAULT_WILD_ICE_VENUES.values())
    if not ice_type:
        return venues
    norm = ice_type.strip().lower()
    return [v for v in venues if v.ice_type.lower() == norm]


def get_wild_ice_venue(venue_id: str) -> Optional[WildIceVenueModel]:
    key = venue_id.strip().lower()
    if key in DEFAULT_WILD_ICE_VENUES:
        return DEFAULT_WILD_ICE_VENUES[key]
    for k, v in DEFAULT_WILD_ICE_VENUES.items():
        if k == key or v.title.lower() == key:
            return v
    return None


def get_wild_ice_gear() -> list[WildIceGearItemModel]:
    return list(DEFAULT_WILD_ICE_GEAR)


def _get_effective_thickness(ice_type: str, thickness_cm: float) -> float:
    norm = ice_type.strip().lower().replace(" ", "_")
    if norm in ("black_ice", "black"):
        return float(thickness_cm * 1.0)
    if norm in ("white_snow_ice", "white_ice", "snow_ice"):
        return float(thickness_cm * 0.5)
    return 0.0


def _get_resonance_description(resonance_hz: int) -> str:
    if resonance_hz >= 600:
        return "High Singing Resonance (Thin Resonant Membrane)"
    if resonance_hz >= 350:
        return "Mid-Frequency Singing (Moderate Congelation Ice)"
    if resonance_hz > 0:
        return "Deep Low-Frequency Booming (Thick Structural Sheet)"
    return "Muffled Decay (Structural Integrity Nil)"


def _get_safety_assessment(
    eff_cm: float,
    ice_type: str,
    temp_f: float,
    skater_lbs: float,
    safe_load: int,
) -> tuple[str, str]:
    norm = ice_type.strip().lower().replace(" ", "_")
    if (
        eff_cm < 4.5
        or norm == "candled_ice"
        or temp_f > 36.0
        or skater_lbs > safe_load
    ):
        status = "unsafe_icefall_submersion_hazard"
        advisory = (
            "DANGER: Unsafe wild ice conditions present high submersion "
            "and icefall hazards. Structural integrity is compromised, "
            "candled, excessively thin (<4.5cm effective), above "
            "freezing point (>36°F), or skater weight exceeds bearing "
            "capacity."
        )
        return status, advisory

    if eff_cm < 7.0 or temp_f > 32.0:
        status = "marginal_caution_scouting_only"
        advisory = (
            "CAUTION: Marginal ice conditions. Touring restricted to "
            "advanced scouting only. Skate in dispersed single file with "
            "mandatory ice claws, ice pike probing, and safety line."
        )
        return status, advisory

    status = "safe_touring_window"
    advisory = (
        "SAFE: Safe wild ice touring window confirmed. Solid congelation "
        "ice bearing capacity comfortably exceeds skater load with strong "
        "acoustic resonance. Always carry mandatory 6-piece safety kit."
    )
    return status, advisory


def calculate_wild_ice(request: WildIceRequest) -> WildIceResponse:
    venue = get_wild_ice_venue(request.venue_id)
    v_title = (
        venue.title if venue else request.venue_id.replace("-", " ").title()
    )

    eff_cm = _get_effective_thickness(request.ice_type, request.thickness_cm)
    safe_load = round(50 * (eff_cm ** 2)) if eff_cm > 0 else 0
    res_hz = round(1200 / (eff_cm ** 0.5)) if eff_cm > 0 else 0

    res_desc = _get_resonance_description(res_hz)
    status, advisory = _get_safety_assessment(
        eff_cm,
        request.ice_type,
        request.ambient_temp_f,
        request.skater_weight_lbs,
        safe_load,
    )

    return WildIceResponse(
        venue_id=request.venue_id,
        venue_title=v_title,
        effective_thickness_cm=eff_cm,
        safe_load_capacity_lbs=safe_load,
        acoustic_resonance_hz=res_hz,
        resonance_description=res_desc,
        safety_status=status,
        advisory=advisory,
    )


def _is_excluded_domain(q: str, has_explicit: bool) -> bool:
    if has_explicit:
        return False
    all_excluded = [
        "cross-country", "cross country", "classic ski", "skate ski",
        "kick wax", "swix", "klister", "corduroy", "methow valley",
        "sugar road", "banadad", "skin ski", "scuba", "diving",
        "drysuit diving", "regulator freeze", "ndl", "decompression",
        "bottom time", "ice climbing", "ice screw", "ice axe",
        "waterfall ice", "dry tooling", "crampons", "belay",
        "fishing boat", "boat rental", "swimming", "kayak rental",
        "canoe rental",
    ]
    return any(k in q for k in all_excluded)


def _extract_venue_id(q: str) -> Optional[str]:
    mapping = {
        "lake-malaren-archipelago": ["malaren", "mälaren", "archipelago"],
        "lake-siljan-dalarna": ["siljan", "orsa"],
        "lake-baikal-olkhon": ["baikal", "olkhon"],
        "lake-moraine-banff": ["moraine", "bow valley"],
        "lake-superior-chequamegon": ["superior", "chequamegon", "apostle"],
    }
    for vid, aliases in mapping.items():
        if any(a in q for a in aliases):
            return vid
    return None


def _extract_ice_type(q: str) -> Optional[str]:
    if "candled" in q:
        return "candled_ice"
    if "white" in q or "snow ice" in q:
        return "white_snow_ice"
    if "black ice" in q:
        return "black_ice"
    return None


def _determine_action(q: str, venue_id: Optional[str]) -> str:
    gear_words = [
        "gear", "safety", "kit", "checklist", "claws",
        "ispiggar", "pike", "backpack", "lifeline", "rescue",
    ]
    calc_words = [
        "calculate", "calculation", "bearing capacity", "resonance",
        "load capacity", "pitch", "golds formula", "gold's formula",
        "formula", "frequency",
    ]
    detail_words = [
        "detail", "about", "tell me about", "elevation",
        "highlights", "info",
    ]
    list_words = [
        "venues", "catalog", "list", "destinations",
        "circuits", "options", "places",
    ]

    if any(w in q for w in calc_words):
        return "calculate_ice"
    if any(w in q for w in gear_words):
        return "gear_checklist"
    if venue_id and any(w in q for w in detail_words):
        return "venue_detail"
    if any(w in q for w in list_words):
        return "venues_list"
    if venue_id:
        return "venue_detail"
    return "venues_list"


def detect_wild_ice_intent(message: str) -> Optional[WildIceIntent]:
    q = message.lower()
    wild_ice_explicit = [
        "wild ice", "nordic speedskating", "nordic speed skating",
        "speedskating", "speed skating", "tour skating", "tour skate",
        "tour skater", "långfärdsskridskor", "langfardsskridskor",
        "black ice skating", "ice claws", "ispiggar", "ice pike staff",
        "singing ice", "throw line rescue", "ice bearing capacity",
        "nordic tour skates", "natural lake ice", "lake mälaren",
        "lake malaren", "lake siljan", "baikal wild ice",
        "congelation ice", "candled ice",
    ]
    has_explicit = any(k in q for k in wild_ice_explicit)

    if _is_excluded_domain(q, has_explicit):
        return None

    if not has_explicit:
        is_black_ice_ctx = "black ice" in q and any(
            t in q for t in ["skat", "tour", "thick", "lake"]
        )
        if not (is_black_ice_ctx or "singing ice" in q):
            return None

    venue_id = _extract_venue_id(q)
    ice_type = _extract_ice_type(q)
    action = _determine_action(q, venue_id)

    return WildIceIntent(
        action=action,
        venue_id=venue_id,
        ice_type=ice_type,
    )


def build_wild_ice_prompt(intent: WildIceIntent) -> str:
    lines = ["Backcountry Nordic Speedskating & Wild Ice Tooling:"]
    if intent.venue_id:
        v = get_wild_ice_venue(intent.venue_id)
        if v:
            lines.append(
                f"- Selected Wild Ice Venue: {v.title} ({v.region})\n"
                f"  Elevation: {v.surface_elevation_m}m | "
                f"Ice Type: {v.ice_type} | "
                f"Default Thickness: {v.default_thickness_cm}cm\n"
                f"  Typical Tour: {v.typical_tour_km}km | "
                f"Highlights: {'; '.join(v.highlights)}\n"
                f"  Description: {v.description}"
            )
    else:
        venues = get_wild_ice_venues(ice_type=intent.ice_type)
        formatted = [f"{v.title} ({v.typical_tour_km}km)" for v in venues]
        lines.append(f"- Supported Wild Ice Circuits: {', '.join(formatted)}")

    lines.extend(
        [
            "- Ice Bearing Capacity (Gold's Formula) & Resonance:",
            "  1. Effective thickness: Black ice 100%, White snow ice 50%, "
            "Candled ice 0%.",
            "  2. Safe Load Capacity: 50 * (effective_thickness_cm ^ 2) lbs.",
            "  3. Acoustic Singing Resonance: "
            "1200 / sqrt(effective_thickness_cm) Hz.",
            "  4. Singing descriptions: >=600Hz High Singing, "
            "350-599Hz Mid Singing, 1-349Hz Deep Booming, 0Hz Muffled Decay.",
            "  5. Safety Status: Unsafe (<4.5cm, candled, >36°F, or "
            "overweight), Marginal (4.5-6.9cm or >32°F), Safe (>=7.0cm).",
            "- Mandatory 6-Piece Nordic Wild Ice Safety Kit:",
            "  1. Dual Hand Ice Claws (Ispiggar) with Emergency Neck Lanyard.",
            "  2. Hardened Chisel-Tip Ice Probing Pole (Pik).",
            "  3. Waterproof Drybag Backpack with Crotch Strap & Waist Belt.",
            "  4. 25-Meter Floating Rescue Throw Line (Räddningslina).",
            "  5. 45cm Tool-Steel Nordic Tour Skates with NNN/BC Bindings.",
            "  6. Full Thermal Base Layer and Fleece Change Set in Dry Sack.",
        ]
    )
    return "\n".join(lines)


def _format_calc_response(calc: WildIceResponse) -> FormattedWildIceResponse:
    answer = (
        f"Wild Ice Safety & Acoustic Analysis for {calc.venue_title}: "
        f"Effective Ice Thickness: {calc.effective_thickness_cm:.1f} cm. "
        f"Safe Load Capacity: {calc.safe_load_capacity_lbs} lbs. "
        f"Acoustic Resonance: {calc.acoustic_resonance_hz} Hz "
        f"({calc.resonance_description}). "
        f"Safety Status: {calc.safety_status.upper()}. {calc.advisory}"
    )
    payload = {
        "action": "calculate_ice",
        "venue_id": calc.venue_id,
        "venue_title": calc.venue_title,
        "effective_thickness_cm": calc.effective_thickness_cm,
        "safe_load_capacity_lbs": calc.safe_load_capacity_lbs,
        "acoustic_resonance_hz": calc.acoustic_resonance_hz,
        "resonance_description": calc.resonance_description,
        "safety_status": calc.safety_status,
        "advisory": calc.advisory,
        "calculation": calc.model_dump(),
    }
    return FormattedWildIceResponse(
        answer, {"answer": answer, "wild_ice_info": payload}
    )


def _format_gear_response() -> FormattedWildIceResponse:
    gear = get_wild_ice_gear()
    items_str = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
    answer = (
        f"Mandatory Nordic Wild Ice Safety Kit ({len(gear)} items): "
        f"{items_str}. Never skate alone on natural wild ice. Always test "
        "ice continuously with an ice pike and wear ice claws around neck."
    )
    payload = {
        "action": "gear_checklist",
        "gear": [g.model_dump() for g in gear],
        "mandatory_count": len(gear),
    }
    return FormattedWildIceResponse(
        answer, {"answer": answer, "wild_ice_info": payload}
    )


def _format_venue_detail_response(venue_id: str) -> FormattedWildIceResponse:
    venue = get_wild_ice_venue(venue_id)
    if not venue:
        return _format_venues_list_response(None)
    highlights_str = ", ".join(venue.highlights)
    answer = (
        f"Wild Ice Venue Profile: {venue.title} ({venue.region}). "
        f"Water Body: {venue.water_body} | "
        f"Surface Elevation: {venue.surface_elevation_m}m | "
        f"Typical Ice Type: {venue.ice_type} | "
        f"Default Thickness: {venue.default_thickness_cm}cm | "
        f"Typical Tour: {venue.typical_tour_km}km. {venue.description} "
        f"Highlights: {highlights_str}."
    )
    payload = {
        "action": "venue_detail",
        "venue_id": venue.venue_id,
        "venue": venue.model_dump(),
    }
    return FormattedWildIceResponse(
        answer, {"answer": answer, "wild_ice_info": payload}
    )


def _format_venues_list_response(
    ice_type: Optional[str],
) -> FormattedWildIceResponse:
    venues = get_wild_ice_venues(ice_type=ice_type)
    venues_str = "; ".join(
        f"{v.title} ({v.region}, {v.typical_tour_km}km)" for v in venues
    )
    answer = (
        f"Contoso Wild Ice Touring & Nordic Speedskating Circuits "
        f"({len(venues)} venues): {venues_str}. "
        "Each circuit features natural congelation ice evaluation, "
        "bearing capacity calculations, and resonance monitoring."
    )
    payload = {
        "action": "venues_list",
        "venues": [v.model_dump() for v in venues],
        "ice_type_filter": ice_type,
    }
    return FormattedWildIceResponse(
        answer, {"answer": answer, "wild_ice_info": payload}
    )


def _resolve_intent(data: Any, query: str) -> WildIceIntent:
    if isinstance(data, dict):
        if "action" in data:
            return WildIceIntent(**data)
        return (
            detect_wild_ice_intent(query or str(data))
            or WildIceIntent(action="venues_list")
        )
    if isinstance(data, WildIceIntent):
        return data
    return (
        detect_wild_ice_intent(str(data))
        or WildIceIntent(action="venues_list")
    )


def format_wild_ice_response(
    data: Any,
    query: str = "",
) -> FormattedWildIceResponse:
    if isinstance(data, WildIceResponse):
        return _format_calc_response(data)

    if isinstance(data, dict) and "wild_ice_info" in data and "answer" in data:
        return FormattedWildIceResponse(data["answer"], data)

    intent = _resolve_intent(data, query)

    if intent.action in ("calculate_ice", "calculate"):
        req = WildIceRequest(
            venue_id=intent.venue_id or "lake-malaren-archipelago"
        )
        if intent.ice_type:
            req.ice_type = intent.ice_type
        return _format_calc_response(calculate_wild_ice(req))

    if intent.action in ("gear_checklist", "gear"):
        return _format_gear_response()

    if intent.action == "venue_detail" and intent.venue_id:
        return _format_venue_detail_response(intent.venue_id)

    return _format_venues_list_response(intent.ice_type)
