import re
import secrets
from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel


class FireZoneModel(BaseModel):
    zone_id: str
    name: str
    region: str
    agency: str
    danger_level: str
    restriction_stage: str
    campfires_allowed: bool
    elevation_limit_feet: Optional[int] = None
    allowed_stoves: list[str]
    advisory_note: str


class StoveCheckRequest(BaseModel):
    zone_id: str
    stove_type: str


class StoveCheckResponse(BaseModel):
    zone_id: str
    stove_type: str
    is_allowed: bool
    restriction_stage: str
    reason: str
    precautions: list[str]


class FireReportRequest(BaseModel):
    zone_id: str
    location_description: str
    report_type: str
    contact_phone: Optional[str] = None


class FireReportResponse(BaseModel):
    report_id: str
    zone_id: str
    location_description: str
    reported_at: str
    status: str
    hotline_number: str


class FireSafetyIntent(BaseModel):
    action: str  # "zones", "danger", "regulations", "stove_check", "report", "lnt"
    zone_id: Optional[str] = None
    region: Optional[str] = None
    danger_level: Optional[str] = None
    stove_type: Optional[str] = None


DEFAULT_FIRE_ZONES: dict[str, FireZoneModel] = {
    "alpine-lakes": FireZoneModel(
        zone_id="alpine-lakes",
        name="Alpine Lakes Wilderness",
        region="Central Cascades",
        agency="US Forest Service",
        danger_level="High",
        restriction_stage="Stage 1",
        campfires_allowed=False,
        elevation_limit_feet=4000,
        allowed_stoves=["canister stove", "liquid fuel stove", "isobutane stove"],
        advisory_note="Campfires prohibited above 4,000 ft year-round and currently prohibited at all elevations under Stage 1 restrictions. Pressurized canister and liquid fuel stoves with shutoff valves are permitted.",
    ),
    "mount-rainier": FireZoneModel(
        zone_id="mount-rainier",
        name="Mount Rainier National Park",
        region="Mount Rainier",
        agency="National Park Service",
        danger_level="Moderate",
        restriction_stage="Stage 1",
        campfires_allowed=False,
        elevation_limit_feet=None,
        allowed_stoves=["canister stove", "liquid fuel stove", "pressurized gas stove"],
        advisory_note="Backcountry campfires prohibited year-round throughout Mount Rainier National Park. Portable stoves using gas or pressurized liquid petroleum with shutoff valves are permitted.",
    ),
    "olympic-backcountry": FireZoneModel(
        zone_id="olympic-backcountry",
        name="Olympic National Park Backcountry",
        region="Olympic Peninsula",
        agency="National Park Service",
        danger_level="Low",
        restriction_stage="Stage 0",
        campfires_allowed=True,
        elevation_limit_feet=3500,
        allowed_stoves=["canister stove", "liquid fuel stove", "alcohol stove", "wood-burning stove"],
        advisory_note="Campfires permitted only below 3,500 feet in established rings or below high-tide line on coastal strips. Strictly prohibited in alpine zones.",
    ),
    "north-cascades-stehekin": FireZoneModel(
        zone_id="north-cascades-stehekin",
        name="North Cascades Stehekin Corridor",
        region="North Cascades",
        agency="National Park Service",
        danger_level="Extreme",
        restriction_stage="Total Fire Ban",
        campfires_allowed=False,
        elevation_limit_feet=None,
        allowed_stoves=["canister stove", "pressurized gas stove"],
        advisory_note="Extreme wildfire danger. Total fire ban in effect across the Stehekin Valley and North Cascades National Park complex. No campfires or charcoal briquettes permitted. Only portable canister stoves with an on/off shutoff valve are allowed in designated campsites.",
    ),
    "mount-baker-snoqualmie": FireZoneModel(
        zone_id="mount-baker-snoqualmie",
        name="Mount Baker-Snoqualmie National Forest",
        region="North Cascades",
        agency="US Forest Service",
        danger_level="Very High",
        restriction_stage="Stage 2",
        campfires_allowed=False,
        elevation_limit_feet=None,
        allowed_stoves=["canister stove", "pressurized gas stove"],
        advisory_note="Stage 2 fire restrictions in effect. Building, maintaining, attending, or using a fire, campfire, or charcoal fire is prohibited across all backcountry areas. Stoves with an immediate shutoff switch are permitted.",
    ),
}

FIRE_ZONES_STORE: dict[str, FireZoneModel] = {
    k: v.model_copy(deep=True) for k, v in DEFAULT_FIRE_ZONES.items()
}
FIRE_REPORTS_STORE: dict[str, FireReportResponse] = {}


def reset_fire_store() -> None:
    """Resets fire zones and reports to default initial state."""
    global FIRE_ZONES_STORE, FIRE_REPORTS_STORE
    FIRE_ZONES_STORE = {
        k: v.model_copy(deep=True) for k, v in DEFAULT_FIRE_ZONES.items()
    }
    FIRE_REPORTS_STORE.clear()


def get_fire_zones(
    region: Optional[str] = None,
    danger_level: Optional[str] = None,
) -> list[FireZoneModel]:
    """Lists fire zones with optional filtering by region and danger level."""
    zones = list(FIRE_ZONES_STORE.values())
    if region:
        reg_clean = region.strip().lower()
        zones = [z for z in zones if reg_clean in z.region.lower() or reg_clean in z.name.lower()]
    if danger_level:
        dl_clean = danger_level.strip().lower()
        zones = [z for z in zones if z.danger_level.lower() == dl_clean]
    return zones


def get_fire_zone_by_id(zone_id: str) -> Optional[FireZoneModel]:
    """Finds a fire zone by exact or normalized zone ID."""
    zid = zone_id.strip().lower()
    for k, v in FIRE_ZONES_STORE.items():
        if k.lower() == zid or v.zone_id.lower() == zid:
            return v
    return None


def check_stove_compliance(req: StoveCheckRequest) -> StoveCheckResponse:
    """Validates whether a specific stove type is permitted in the designated fire zone."""
    zone = get_fire_zone_by_id(req.zone_id)
    if not zone:
        raise ValueError(f"Fire zone '{req.zone_id}' not found")

    st = req.stove_type.strip().lower()

    # Determine if unvalved or open-flame/biomass stove type
    unvalved_types = [
        "alcohol", "wood", "twig", "biomass", "charcoal",
        "tablet", "solid fuel", "esbit", "open flame",
    ]
    is_unvalved = any(ut in st for ut in unvalved_types)
    has_restrictions = zone.restriction_stage.lower() not in ("stage 0", "none")

    if is_unvalved and has_restrictions:
        is_allowed = False
        reason = (
            f"{req.stove_type.title()} stoves lack a dedicated on/off shut-off valve "
            f"and cannot be extinguished immediately. They are strictly prohibited under "
            f"{zone.restriction_stage} restrictions in {zone.name}."
        )
        precautions = [
            "Do not ignite open-flame, unpressurized alcohol, or solid-fuel stoves under fire restrictions.",
            "Switch to a certified canister stove equipped with an immediate on/off shut-off valve.",
            "Consider carrying cold-soak or ready-to-eat meals if stove regulations cannot be met.",
            "Report any unattended fires or open burns to backcountry rangers immediately.",
        ]
    elif any(allowed in st or st in allowed for allowed in zone.allowed_stoves):
        is_allowed = True
        reason = (
            f"Pressurized stoves with an immediate on/off shutoff valve (such as {req.stove_type}) "
            f"are permitted for cooking in {zone.name} under {zone.restriction_stage}."
        )
        precautions = [
            "Clear all duff, pine needles, and dry organic matter within a 3-foot radius before lighting.",
            "Place the stove on a stable, level surface of bare mineral soil or rock.",
            "Never leave a lit stove unattended under any circumstances.",
            "Ensure the burner head and canister are completely cool to the touch before packing.",
        ]
    elif any(w in st for w in ["canister", "isobutane", "propane", "pressurized", "gas"]):
        is_allowed = True
        reason = f"Pressurized canister stoves with an on/off shut-off valve are permitted in {zone.name}."
        precautions = [
            "Operate only on non-flammable mineral soil or flat rock surfaces.",
            "Maintain a 3-foot clearance from dry vegetation.",
            "Keep a water bottle nearby while cooking.",
            "Ensure fuel valve is fully sealed before disconnecting canister.",
        ]
    else:
        is_allowed = False
        reason = (
            f"Stove type '{req.stove_type}' is not verified as compliant with {zone.name} "
            f"regulations under {zone.restriction_stage}."
        )
        precautions = [
            "Only stoves with a positive on/off fuel shut-off valve are permitted.",
            "Check with the local ranger station before using specialized or homemade stoves.",
        ]

    return StoveCheckResponse(
        zone_id=zone.zone_id,
        stove_type=req.stove_type,
        is_allowed=is_allowed,
        restriction_stage=zone.restriction_stage,
        reason=reason,
        precautions=precautions,
    )


def submit_fire_report(req: FireReportRequest) -> FireReportResponse:
    """Submits a wildfire smoke or illegal fire report and generates a confirmed tracking ID."""
    zone = get_fire_zone_by_id(req.zone_id)
    if not zone:
        raise ValueError(f"Fire zone '{req.zone_id}' not found")

    report_id = f"FIR-{secrets.token_hex(3).upper()[:5]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    response = FireReportResponse(
        report_id=report_id,
        zone_id=zone.zone_id,
        location_description=req.location_description,
        reported_at=now_iso,
        status="confirmed",
        hotline_number="1-800-474-7020",
    )
    FIRE_REPORTS_STORE[report_id] = response
    return response


def get_campfire_safety_protocol() -> dict[str, Any]:
    """Returns Leave No Trace campfire safety guidelines and suppression procedures."""
    return {
        "title": "Leave No Trace Backcountry Campfire & Fire Safety Protocol",
        "principles": [
            "Minimize Campfire Impacts: Use a lightweight canister stove for cooking and enjoy candle lanterns for illumination.",
            "Know Fire Restriction Stages: Always check active burn bans, Stage 1/Stage 2 restrictions, and elevation limits before lighting fires.",
            "Use Established Fire Rings: Where permitted, only build fires in pre-existing USFS/NPS metal fire rings or rock pits.",
            "Keep Fires Small: Burn only dead-and-down wood no thicker than an adult wrist that can be broken by hand.",
            "Burn Completely to Ash: Burn all wood and coals down to fine white ash; never leave partially burned logs.",
            "Drown, Stir, and Feel: Thoroughly soak embers, stir with a stick, drench again, and test with the back of your hand until cold to the touch.",
        ],
        "drown_stir_technique": {
            "step_1": "Drown the campfire thoroughly with copious amounts of water.",
            "step_2": "Stir the coals, ash, and dirt with a stick or shovel to expose hidden hot spots.",
            "step_3": "Drown the pit a second time until all hissing and steam completely stops.",
            "step_4": "Feel the coals and surrounding ground with the back of your bare hand. If it is too warm to touch, it is too hot to leave!",
        },
        "stove_safety": [
            "Use only stoves with a positive on/off shutoff valve during fire restrictions.",
            "Clear a minimum 3-foot radius of flammable duff and needles.",
            "Never ignite stoves inside an enclosed tent or vestibule due to carbon monoxide and flash fire danger.",
            "Pack out all empty fuel canisters; puncture only with an approved recycling tool when completely depressurized.",
        ],
        "emergency_hotline": "1-800-474-7020",
        "wildfire_reporting": "If you observe rising smoke plumes, active wildfires, or abandoned hot fire pits, report them immediately to 911 or call the interagency fire dispatch at 1-800-474-7020.",
    }


def detect_fire_safety_intent(query: str) -> Optional[FireSafetyIntent]:
    """Detects inquiries regarding fire danger index, campfire regulations, stove compliance, smoke reports, and LNT."""
    q_lower = query.lower()

    fire_keywords = [
        "campfire", "campfires", "fire ban", "burn ban", "fire danger",
        "fire safety", "fire restriction", "fire restrictions", "stage 1",
        "stage 2", "total ban", "stove", "stoves", "canister stove",
        "alcohol stove", "liquid fuel", "white gas", "charcoal", "backpacking stove", "smoke sighting",
        "report smoke", "wildfire", "smoke report", "lnt fire",
        "leave no trace fire", "campfire regulations", "campfire rules",
        "fires allowed", "have a fire", "build a fire", "make a fire",
        "drown and stir", "put out campfire", "extinguish fire", "fire zones",
        "check-stove", "stove rule", "stove rules",
    ]

    if not any(kw in q_lower for kw in fire_keywords):
        # Secondary check for specific fire queries
        if not re.search(r"\b(can\s+i\s+use\s+a\s+stove|can\s+i\s+have\s+a\s+fire|is\s+there\s+a\s+fire|see\s+smoke|saw\s+smoke)\b", q_lower):
            return None

    # Determine action
    if any(k in q_lower for k in ["report smoke", "smoke sighting", "saw smoke", "see smoke", "report a wildfire", "report wildfire", "report fire", "smoke report"]):
        action = "report"
    elif any(k in q_lower for k in ["leave no trace", "lnt", "drown", "stir", "extinguish", "how to put out"]):
        action = "lnt"
    elif any(k in q_lower for k in ["stove", "canister", "alcohol"]):
        action = "stove_check"
    elif any(k in q_lower for k in ["danger", "danger rating", "danger level", "fire index"]):
        action = "danger"
    elif any(k in q_lower for k in ["campfire", "campfires", "burn ban", "fire ban", "regulation", "regulations", "rule", "rules", "fires allowed", "stage 1", "stage 2", "total ban"]):
        action = "regulations"
    else:
        action = "zones"

    # Extract zone
    zone_id = None
    if "alpine" in q_lower or "colchuck" in q_lower:
        zone_id = "alpine-lakes"
    elif "rainier" in q_lower:
        zone_id = "mount-rainier"
    elif "olympic" in q_lower:
        zone_id = "olympic-backcountry"
    elif "stehekin" in q_lower or "north cascades" in q_lower:
        zone_id = "north-cascades-stehekin"
    elif "baker" in q_lower or "snoqualmie" in q_lower:
        zone_id = "mount-baker-snoqualmie"

    # Extract region
    region = None
    if "north cascades" in q_lower:
        region = "North Cascades"
    elif "rainier" in q_lower:
        region = "Mount Rainier"
    elif "olympic" in q_lower:
        region = "Olympic Peninsula"
    elif "cascades" in q_lower:
        region = "Central Cascades"

    # Extract danger level
    danger_level = None
    if "extreme" in q_lower:
        danger_level = "Extreme"
    elif "very high" in q_lower:
        danger_level = "Very High"
    elif "high" in q_lower:
        danger_level = "High"
    elif "moderate" in q_lower:
        danger_level = "Moderate"
    elif "low" in q_lower:
        danger_level = "Low"

    # Extract stove type
    stove_type = None
    if "alcohol" in q_lower:
        stove_type = "alcohol stove"
    elif "canister" in q_lower:
        stove_type = "canister stove"
    elif "liquid fuel" in q_lower or "white gas" in q_lower:
        stove_type = "liquid fuel stove"
    elif "wood" in q_lower or "twig" in q_lower:
        stove_type = "wood-burning stove"
    elif "charcoal" in q_lower:
        stove_type = "charcoal grill"

    return FireSafetyIntent(
        action=action,
        zone_id=zone_id,
        region=region,
        danger_level=danger_level,
        stove_type=stove_type,
    )


def build_fire_safety_prompt(intent: FireSafetyIntent) -> str:
    """Formats system prompt grounding lines for fire danger index and campfire regulations."""
    lines = [
        "Contoso Outdoors Backcountry Fire Danger Index & Campfire Regulations Grounding:",
        "- Wildfire prevention and fire safety are top priorities across all Pacific Northwest backcountry zones.",
        "- In areas with Stage 1, Stage 2, or Total Fire Bans, open wood campfires and charcoal fires are strictly prohibited.",
        "- Stoves with a dedicated positive on/off shut-off valve (pressurized canister or liquid fuel) are permitted in most zones.",
        "- Alcohol stoves, wood-burning twig stoves, and solid fuel tablets lack positive shut-off valves and are prohibited during fire restrictions.",
    ]

    if intent.zone_id:
        zone = get_fire_zone_by_id(intent.zone_id)
        if zone:
            lines.extend([
                f"Target Fire Zone: {zone.name} ({zone.zone_id})",
                f"- Region: {zone.region} | Agency: {zone.agency}",
                f"- Danger Level: {zone.danger_level} | Restriction Stage: {zone.restriction_stage}",
                f"- Campfires Allowed: {'Yes' if zone.campfires_allowed else 'No'}"
                + (f" (below {zone.elevation_limit_feet:,} ft only)" if zone.elevation_limit_feet else ""),
                f"- Allowed Stoves: {', '.join(zone.allowed_stoves)}",
                f"- Advisory Note: {zone.advisory_note}",
            ])
    else:
        zones = get_fire_zones(region=intent.region, danger_level=intent.danger_level)
        lines.append("Current Backcountry Fire Zones Status:")
        for z in zones:
            lines.append(
                f"- {z.name} ({z.zone_id}): Danger={z.danger_level}, Restrictions={z.restriction_stage}, "
                f"Campfires={'Allowed' if z.campfires_allowed else 'Prohibited'}, "
                f"Advisory: {z.advisory_note}"
            )

    if intent.action == "stove_check" and intent.stove_type and intent.zone_id:
        try:
            check = check_stove_compliance(
                StoveCheckRequest(zone_id=intent.zone_id, stove_type=intent.stove_type)
            )
            lines.extend([
                f"Stove Compliance Evaluation for {intent.stove_type}:",
                f"- Allowed: {'YES' if check.is_allowed else 'NO'}",
                f"- Reason: {check.reason}",
                f"- Precautions: {'; '.join(check.precautions)}",
            ])
        except ValueError:
            pass

    if intent.action == "lnt":
        proto = get_campfire_safety_protocol()
        lines.extend([
            "Leave No Trace Fire Etiquette Protocol:",
            "- Principles: " + " | ".join(proto["principles"]),
            "- Drown, Stir, and Feel: Drown with water, stir thoroughly, drown again, and check with bare hand until cold to touch.",
        ])

    if intent.action == "report":
        lines.extend([
            "Wildfire & Smoke Sighting Reporting:",
            "- Hikers can report smoke sightings with confirmed FIR-XXXXX tracking IDs.",
            "- Interagency Fire Dispatch Emergency Hotline: 1-800-474-7020 (or 911 for active fires).",
        ])

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Prioritize hiker and wilderness safety in all responses.",
        "- Clearly explain campfire prohibitions and active restriction stages.",
        "- Highlight that alcohol stoves and biomass twig stoves lack shut-off valves and are banned under Stage 1/2 restrictions.",
        "- Guide customers to place canister stoves on bare mineral soil or rock with a 3-foot clearance.",
    ])

    return "\n".join(lines)


def format_fire_safety_response(intent: FireSafetyIntent) -> dict[str, Any]:
    """Formats the assistant answer and structured fire_safety_info metadata."""
    if intent.action == "stove_check":
        if intent.zone_id and intent.stove_type:
            try:
                check = check_stove_compliance(
                    StoveCheckRequest(zone_id=intent.zone_id, stove_type=intent.stove_type)
                )
                zone = get_fire_zone_by_id(intent.zone_id)
                zone_name = zone.name if zone else intent.zone_id
                if check.is_allowed:
                    answer = (
                        f"In {zone_name}, your {check.stove_type} is permitted for backcountry use under {check.restriction_stage}. "
                        f"{check.reason} Required precautions: {'; '.join(check.precautions)}."
                    )
                else:
                    answer = (
                        f"In {zone_name}, your {check.stove_type} is prohibited under {check.restriction_stage}. "
                        f"{check.reason} Recommended actions: {'; '.join(check.precautions)}."
                    )
                return {
                    "answer": answer,
                    "fire_safety_info": {
                        "action": "stove_check",
                        "zone_id": intent.zone_id,
                        "stove_type": intent.stove_type,
                        "is_allowed": check.is_allowed,
                        "restriction_stage": check.restriction_stage,
                        "reason": check.reason,
                        "precautions": check.precautions,
                    },
                }
            except ValueError:
                pass

    if intent.action == "regulations":
        if intent.zone_id:
            zone = get_fire_zone_by_id(intent.zone_id)
            if zone:
                answer = (
                    f"Campfire regulations for {zone.name}: Campfires are currently "
                    f"{'allowed' if zone.campfires_allowed else 'prohibited'} under {zone.restriction_stage} "
                    f"(Fire Danger Level: {zone.danger_level}). {zone.advisory_note} "
                    f"Permitted stoves: {', '.join(zone.allowed_stoves)}."
                )
                return {
                    "answer": answer,
                    "fire_safety_info": {
                        "action": "regulations",
                        "zone": zone.model_dump(),
                    },
                }

        zones = get_fire_zones(region=intent.region)
        details = "; ".join(
            f"{z.name}: {z.restriction_stage} (Campfires: {'Allowed' if z.campfires_allowed else 'Prohibited'})"
            for z in zones
        )
        answer = (
            f"Backcountry Campfire Regulations: {details}. "
            "Portable canister stoves with on/off shutoff valves are permitted in designated areas."
        )
        return {
            "answer": answer,
            "fire_safety_info": {
                "action": "regulations",
                "zones": [z.model_dump() for z in zones],
            },
        }

    if intent.action == "danger":
        zones = get_fire_zones(region=intent.region, danger_level=intent.danger_level)
        if intent.zone_id:
            specific_zone = get_fire_zone_by_id(intent.zone_id)
            if specific_zone:
                zones = [specific_zone]
        details = "; ".join(
            f"{z.name} is rated {z.danger_level} danger ({z.restriction_stage})" for z in zones
        )
        answer = (
            f"Current Backcountry Fire Danger Index: {details}. "
            "Always check active burn restrictions and practice strict fire safety before traveling."
        )
        return {
            "answer": answer,
            "fire_safety_info": {
                "action": "danger",
                "zones": [z.model_dump() for z in zones],
            },
        }

    if intent.action == "lnt":
        proto = get_campfire_safety_protocol()
        answer = (
            "Leave No Trace Campfire Safety & Etiquette: "
            "1. Minimize campfire impacts by using a lightweight canister stove for cooking. "
            "2. Always obey active fire bans and restriction stages. "
            "3. If fires are allowed, use established fire rings and burn only dead-and-down wood smaller than wrist-size. "
            "4. Drown, Stir, and Feel: Drown coals thoroughly with water, stir ashes, drown again, and verify the ground is cold to the touch before leaving."
        )
        return {
            "answer": answer,
            "fire_safety_info": {
                "action": "lnt",
                "protocol": proto,
            },
        }

    if intent.action == "report":
        answer = (
            "To report a wildfire, rising smoke plume, or unattended campfire: "
            "Call 911 for immediate emergencies or call the Interagency Fire Center Dispatch hotline at 1-800-474-7020. "
            "You can also submit field smoke reports via Contoso Outdoors chat."
        )
        return {
            "answer": answer,
            "fire_safety_info": {
                "action": "report",
                "hotline_number": "1-800-474-7020",
                "instructions": "Submit reports via POST /api/fire-safety/reports with zone_id, location_description, and report_type.",
            },
        }

    # Default "zones"
    zones = get_fire_zones(region=intent.region, danger_level=intent.danger_level)
    details = "; ".join(
        f"{z.name} ({z.region}): {z.danger_level} danger, {z.restriction_stage}" for z in zones
    )
    answer = f"Backcountry Fire Zones Status: {details}."
    return {
        "answer": answer,
        "fire_safety_info": {
            "action": "zones",
            "zones": [z.model_dump() for z in zones],
        },
    }
