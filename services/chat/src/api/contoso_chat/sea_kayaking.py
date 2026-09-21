import math
import re
from typing import Any, Optional

from pydantic import BaseModel, Field


class SeaKayakRouteModel(BaseModel):
    route_id: str
    title: str
    region: str
    distance_nm: float
    typical_duration_days: int
    water_grade: str
    current_risk: str
    max_current_knots: float
    open_crossing_miles: float
    recommended_kayak_length_ft: int
    drysuit_mandatory: bool
    description: str
    highlights: list[str] = Field(default_factory=list)


class TidePlanRequest(BaseModel):
    route_id: str
    paddler_skill_level: str = "intermediate"
    current_speed_knots: float = 2.5
    wind_speed_knots: float = 12.0
    crossing_window_hours: float = 2.0


class TidePlanResponse(BaseModel):
    route_id: str
    route_title: str
    crossing_safety_status: str
    departure_timing: str
    ferry_angle_degrees: int
    effective_speed_knots: float
    drysuit_required: bool
    vhf_channel: int
    safety_advisory: str


class SeaKayakGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool = True
    purpose: str


class SeaKayakingIntent(BaseModel):
    action: str  # "routes_list", "route_detail", "tide_plan", "gear_checklist"
    route_id: Optional[str] = None
    water_grade: Optional[str] = None
    region: Optional[str] = None


DEFAULT_SEA_KAYAK_ROUTES: dict[str, SeaKayakRouteModel] = {
    "san-juan-islands-crossing": SeaKayakRouteModel(
        route_id="san-juan-islands-crossing",
        title="San Juan Islands Crossing & Rosario Strait",
        region="Pacific Northwest / Washington",
        distance_nm=28.0,
        typical_duration_days=3,
        water_grade="grade_iii",
        current_risk="high",
        max_current_knots=4.5,
        open_crossing_miles=4.2,
        recommended_kayak_length_ft=16,
        drysuit_mandatory=True,
        description="Scenic passage through the San Juan Archipelago navigating tidal currents in Rosario Strait, eddy lines at Peavine Pass, and marine mammal sanctuaries.",
        highlights=[
            "Rosario Strait open crossing and tidal gate timing",
            "Orca whale sanctuary and marine wildlife watching",
            "Turbulent eddy lines and tide rips at Peavine Pass",
            "Jones Island and Doe Island marine campsite layovers",
        ],
    ),
    "prince-william-sound-fjords": SeaKayakRouteModel(
        route_id="prince-william-sound-fjords",
        title="Prince William Sound & Columbia Glacier Fjords",
        region="Southcentral Alaska",
        distance_nm=45.0,
        typical_duration_days=5,
        water_grade="grade_iv",
        current_risk="extreme",
        max_current_knots=3.8,
        open_crossing_miles=6.0,
        recommended_kayak_length_ft=17,
        drysuit_mandatory=True,
        description="Sub-arctic coastal wilderness expedition paddling among tidewater glaciers, icebergs, steep fjords, and temperate rainforest shorelines.",
        highlights=[
            "Columbia Glacier iceberg fields and active calving zones",
            "Glacial fjord navigation and katabatic wind management",
            "Humpback, sea otter, and harbor seal marine sanctuaries",
            "Remote coastal wilderness gravel spit campsites",
        ],
    ),
    "maine-island-trail-passage": SeaKayakRouteModel(
        route_id="maine-island-trail-passage",
        title="Maine Island Trail & Merchant Row Passage",
        region="Midcoast Maine / Atlantic Coast",
        distance_nm=32.0,
        typical_duration_days=4,
        water_grade="grade_ii",
        current_risk="moderate",
        max_current_knots=2.8,
        open_crossing_miles=2.5,
        recommended_kayak_length_ft=16,
        drysuit_mandatory=True,
        description="Classic New England coastal sea kayaking navigating granite archipelagos, working lobster boat channels, and Atlantic fog passages.",
        highlights=[
            "Merchant Row granite archipelago island hopping",
            "Isle au Haut remote coastal wilderness passage",
            "Atlantic grey seal haul-outs and historic lighthouses",
            "Dense coastal sea fog dead-reckoning navigation",
        ],
    ),
    "apostle-islands-sea-caves": SeaKayakRouteModel(
        route_id="apostle-islands-sea-caves",
        title="Apostle Islands National Lakeshore & Sea Caves",
        region="Lake Superior, Wisconsin",
        distance_nm=22.0,
        typical_duration_days=3,
        water_grade="grade_ii",
        current_risk="moderate",
        max_current_knots=1.5,
        open_crossing_miles=3.5,
        recommended_kayak_length_ft=16,
        drysuit_mandatory=True,
        description="Inland sea wilderness expedition exploring vaulted Precambrian sandstone sea caves, arches, and exposed open-water crossings on Lake Superior.",
        highlights=[
            "Meyers Beach and Devils Island sandstone sea caves",
            "Lake Superior open-water crossing between islands",
            "Historic island lighthouses and maritime shipwrecks",
            "Hypothermic 40-50°F freshwater immersion conditions",
        ],
    ),
    "haida-gwaii-gwaii-haanas": SeaKayakRouteModel(
        route_id="haida-gwaii-gwaii-haanas",
        title="Gwaii Haanas National Park Reserve Expedition",
        region="Haida Gwaii, British Columbia",
        distance_nm=65.0,
        typical_duration_days=7,
        water_grade="grade_iv",
        current_risk="extreme",
        max_current_knots=5.0,
        open_crossing_miles=8.0,
        recommended_kayak_length_ft=17,
        drysuit_mandatory=True,
        description="Rugged Pacific ocean expedition along exposed headlands, ancient Haida village sites, and turbulent tidal narrows in the Queen Charlotte Islands.",
        highlights=[
            "SGang Gwaay UNESCO World Heritage standing totem poles",
            "Burnaby Narrows extreme intertidal biodiversity and tidal rapids",
            "Exposed Pacific swell and tempestuous weather headlands",
            "Ancient temperate rainforest wilderness campsites",
        ],
    ),
}

DEFAULT_SEA_KAYAK_GEAR: list[SeaKayakGearRequirement] = [
    SeaKayakGearRequirement(
        item_id="paddling-drysuit",
        name="Immersion Drysuit with Neoprene Neck/Wrist Gaskets & Relief Zipper",
        category="immersion_apparel",
        mandatory=True,
        purpose="Prevents debilitating cold water shock and life-threatening hypothermia during prolonged ocean immersion (<55°F).",
    ),
    SeaKayakGearRequirement(
        item_id="neoprene-spray-skirt",
        name="Whitewater-Grade Fitted Neoprene Ocean Spray Skirt",
        category="cockpit_safety",
        mandatory=True,
        purpose="Maintains a watertight seal over the kayak cockpit coaming against breaking surf, rolling swell, and capsize.",
    ),
    SeaKayakGearRequirement(
        item_id="paddle-float",
        name="Dual-Chamber Inflatable Sea Kayak Paddle Float",
        category="rescue_gear",
        mandatory=True,
        purpose="Creates an emergency outrigger with a paddle blade for assisted and self-rescue re-entry in deep open water.",
    ),
    SeaKayakGearRequirement(
        item_id="bilge-pump",
        name="High-Flow Manual Sea Kayak Bilge Pump with Float Collar",
        category="rescue_gear",
        mandatory=True,
        purpose="Rapidly evacuates swamped seawater from the kayak cockpit and hatches following a capsize and wet re-entry.",
    ),
    SeaKayakGearRequirement(
        item_id="type-iii-v-pfd",
        name="Type III/V High-Mobility Sea Kayaking PFD with Lash Tab",
        category="personal_flotation",
        mandatory=True,
        purpose="Provides continuous Coast Guard-compliant ocean buoyancy with mounting for VHF radio, whistle, and rescue knife.",
    ),
    SeaKayakGearRequirement(
        item_id="marine-vhf-radio",
        name="Waterproof Floating Marine VHF Handheld Radio (Channel 16)",
        category="navigation_communication",
        mandatory=True,
        purpose="Critical coastal communication monitoring distress frequency Channel 16, NOAA weather channels, and vessel traffic.",
    ),
]


def get_sea_kayak_routes(water_grade: Optional[str] = None) -> list[SeaKayakRouteModel]:
    routes = list(DEFAULT_SEA_KAYAK_ROUTES.values())
    if water_grade:
        wg_norm = water_grade.strip().lower()
        routes = [r for r in routes if r.water_grade.lower() == wg_norm]
    return routes


def get_sea_kayak_route_by_id(route_id: str) -> Optional[SeaKayakRouteModel]:
    normalized = route_id.strip().lower()
    return DEFAULT_SEA_KAYAK_ROUTES.get(normalized)


def calculate_tide_plan(req: TidePlanRequest) -> TidePlanResponse:
    route = get_sea_kayak_route_by_id(req.route_id)
    if not route:
        raise ValueError(f"Sea kayak route '{req.route_id}' not found")

    skill = req.paddler_skill_level.strip().lower()
    skill_speed_map = {
        "beginner": 2.5,
        "novice": 2.8,
        "intermediate": 3.5,
        "advanced": 4.2,
        "expert": 4.8,
    }
    paddling_speed = skill_speed_map.get(skill, 3.5)
    current_speed = req.current_speed_knots
    wind_speed = req.wind_speed_knots

    # Calculate Ferry Angle (arcsin(current_speed / paddling_speed))
    if paddling_speed > 0:
        ratio = current_speed / paddling_speed
        if ratio < 1.0:
            ferry_angle = round(math.asin(ratio) * 180.0 / math.pi)
            raw_effective_speed = math.sqrt(max(0.25, paddling_speed**2 - current_speed**2))
        else:
            ferry_angle = min(85, round(math.asin(0.98) * 180.0 / math.pi))
            raw_effective_speed = 0.5
    else:
        ferry_angle = 45
        raw_effective_speed = 0.5

    # Adjust effective forward speed for wind resistance
    if wind_speed > 12.0:
        effective_speed = max(0.5, round(raw_effective_speed - (wind_speed - 12.0) * 0.05, 1))
    else:
        effective_speed = max(0.5, round(raw_effective_speed, 1))

    # Evaluate Crossing Safety Status
    if (
        wind_speed >= 20.0
        or current_speed >= 4.0
        or current_speed >= paddling_speed
        or (skill == "beginner" and (current_speed > 2.0 or wind_speed > 12.0))
        or route.current_risk == "extreme" and skill in ("beginner", "novice")
    ):
        crossing_safety_status = "hazardous"
    elif (
        wind_speed >= 15.0
        or current_speed >= 2.5
        or (skill == "beginner" and (current_speed > 1.2 or wind_speed > 8.0))
        or (skill == "intermediate" and current_speed > 3.0)
    ):
        crossing_safety_status = "caution"
    else:
        crossing_safety_status = "optimal"

    # Departure Timing based on tidal current
    if current_speed >= 2.0:
        departure_timing = "Depart 30-45 minutes prior to slack water to transit during minimum tidal current velocity."
    else:
        departure_timing = "Depart within the 1-hour slack water window or with a favorable tidal assist flow."

    drysuit_required = True
    vhf_channel = 16

    advisory_parts = []
    if crossing_safety_status == "hazardous":
        advisory_parts.append(
            f"HAZARDOUS CROSSING: Tidal current ({current_speed} kt) and wind ({wind_speed} kt) exceed safe operating parameters for {skill} paddlers."
        )
    elif crossing_safety_status == "caution":
        advisory_parts.append(
            f"CAUTION ADVISED: Tidal current ({current_speed} kt) requires a {ferry_angle}° ferry angle to counteract downstream drift across {route.title}."
        )
    else:
        advisory_parts.append(
            f"CONDITIONS FAVORABLE: Maintain a {ferry_angle}° ferry angle during the {req.crossing_window_hours}h crossing window."
        )

    advisory_parts.append(
        "Monitor Marine VHF Channel 16 continuously. Mandatory cold-water immersion gear (drysuit, neoprene spray skirt, paddle float, bilge pump) required for all open water crossings."
    )
    safety_advisory = " ".join(advisory_parts)

    return TidePlanResponse(
        route_id=route.route_id,
        route_title=route.title,
        crossing_safety_status=crossing_safety_status,
        departure_timing=departure_timing,
        ferry_angle_degrees=ferry_angle,
        effective_speed_knots=effective_speed,
        drysuit_required=drysuit_required,
        vhf_channel=vhf_channel,
        safety_advisory=safety_advisory,
    )


def get_sea_kayak_gear() -> list[SeaKayakGearRequirement]:
    return list(DEFAULT_SEA_KAYAK_GEAR)


def detect_sea_kayaking_intent(query: str) -> Optional[SeaKayakingIntent]:
    if not query or not query.strip():
        return None

    q = query.lower()
    q_norm = q.replace("-", " ")

    # Exclusions for unrelated domains
    unrelated = [
        "refund",
        "order #",
        "return label",
        "climbing shoe",
        "water filter",
        "water purification",
        "filtration",
        "filter bottle",
        "hydration pack",
        "ski tour",
        "splitboard",
        "avalanche danger",
        "snowpack",
        "fire ban",
        "rock climbing clinic",
        "glacier travel",
        "mount rainier",
    ]
    if any(u in q for u in unrelated):
        return None

    # Alpine huts disambiguation ("San Juan Mountains" in Colorado)
    if "san juan" in q and any(w in q for w in ["mountain", "mountains", "yurt", "bunk", "hut", "refuge", "pass"]):
        return None

    # Explicit sea kayaking / ocean paddling triggers
    has_explicit_sea_kayak = any(
        k in q
        for k in [
            "sea kayak",
            "sea kayaking",
            "coastal kayak",
            "coastal kayaking",
            "coastal expedition",
            "coastal paddling",
            "ocean paddling",
            "marine vhf",
            "paddle float",
            "bilge pump",
            "dry suit paddling",
            "drysuit paddling",
            "slack water",
            "ferry angle",
            "tidal current",
            "tidal currents",
            "tide plan",
            "san juan islands crossing",
            "prince william sound fjords",
            "maine island trail passage",
            "apostle islands sea caves",
            "haida gwaii gwaii haanas",
        ]
    )

    # Disambiguation: guard against river whitewater kayaking
    whitewater_terms = [
        "whitewater",
        "river run",
        "river runs",
        "river rapid",
        "river rapids",
        "cfs",
        "river flow",
        "river gauge",
        "river safety",
        "river rescue",
        "boulder drop",
        "tumwater",
        "white salmon",
        "husum",
        "snoqualmie",
        "middle fork",
        "deschutes",
        "maupin",
    ]
    if any(w in q for w in whitewater_terms) and not has_explicit_sea_kayak:
        return None

    # Positive detection keywords for sea kayaking routes or coastal paddling
    location_triggers = [
        "san juan islands",
        "san juan kayak",
        "prince william sound",
        "columbia glacier",
        "maine island trail",
        "merchant row",
        "apostle islands",
        "gwaii haanas",
        "haida gwaii",
    ]
    has_location_trigger = any(loc in q_norm for loc in location_triggers)

    if not (has_explicit_sea_kayak or has_location_trigger):
        return None

    # Detect Route ID
    route_id: Optional[str] = None
    if "san juan" in q_norm:
        route_id = "san-juan-islands-crossing"
    elif "prince william" in q_norm or "columbia glacier" in q_norm:
        route_id = "prince-william-sound-fjords"
    elif "maine island" in q_norm or "merchant row" in q_norm or "isle au haut" in q_norm:
        route_id = "maine-island-trail-passage"
    elif "apostle" in q_norm or "meyers beach" in q_norm or "devils island" in q_norm:
        route_id = "apostle-islands-sea-caves"
    elif (
        "haida gwaii" in q_norm
        or "gwaii haanas" in q_norm
        or "burnaby narrows" in q_norm
        or "sgang gwaay" in q_norm
    ):
        route_id = "haida-gwaii-gwaii-haanas"

    # Detect Water Grade
    water_grade: Optional[str] = None
    if re.search(r"\b(?:grade\s*iv|grade\s*4|class\s*iv)\b", q):
        water_grade = "grade_iv"
    elif re.search(r"\b(?:grade\s*iii|grade\s*3|class\s*iii)\b", q):
        water_grade = "grade_iii"
    elif re.search(r"\b(?:grade\s*ii|grade\s*2|class\s*ii)\b", q):
        water_grade = "grade_ii"
    elif re.search(r"\b(?:grade\s*i|grade\s*1|class\s*i)\b", q):
        water_grade = "grade_i"

    # Detect Action
    if any(
        k in q
        for k in [
            "tide plan",
            "ferry angle",
            "tidal current",
            "slack water",
            "crossing window",
            "calculate tide",
            "tide &",
            "tides",
        ]
    ):
        action = "tide_plan"
    elif any(
        k in q
        for k in [
            "gear",
            "checklist",
            "equipment",
            "safety kit",
            "drysuit",
            "dry suit",
            "paddle float",
            "bilge pump",
            "spray skirt",
            "immersion gear",
        ]
    ) and not any(k in q for k in ["ferry angle", "slack water", "calculate"]):
        action = "gear_checklist"
    elif route_id and any(
        k in q
        for k in [
            "detail",
            "about",
            "describe",
            "tell me about",
            "highlights",
            "length",
            "how long is",
        ]
    ):
        action = "route_detail"
    elif any(
        k in q
        for k in [
            "routes",
            "catalog",
            "expeditions",
            "trips",
            "passages",
            "recommend",
            "options",
            "list",
        ]
    ):
        action = "routes_list"
    elif route_id:
        action = "route_detail"
    else:
        action = "routes_list"

    return SeaKayakingIntent(
        action=action,
        route_id=route_id,
        water_grade=water_grade,
    )


def build_sea_kayaking_prompt(intent: SeaKayakingIntent) -> str:
    lines = ["Coastal Sea Kayaking & Marine Expedition Outfitting Tooling:"]
    if intent.route_id:
        route = get_sea_kayak_route_by_id(intent.route_id)
        if route:
            lines.append(
                f"- Route: {route.title} ({route.region})\n"
                f"  Distance: {route.distance_nm} nm | Duration: {route.typical_duration_days} days\n"
                f"  Water Grade: {route.water_grade.upper()} | Current Risk: {route.current_risk.capitalize()} (Max: {route.max_current_knots} kt)\n"
                f"  Open Crossing: {route.open_crossing_miles} miles | Recommended Kayak: {route.recommended_kayak_length_ft} ft\n"
                f"  Immersion Drysuit Mandatory: {route.drysuit_mandatory}\n"
                f"  Highlights: {'; '.join(route.highlights)}\n"
                f"  Description: {route.description}"
            )
    elif intent.water_grade:
        routes = get_sea_kayak_routes(water_grade=intent.water_grade)
        lines.append(f"- Matching {intent.water_grade.upper()} Routes: {', '.join(r.title for r in routes)}")
    else:
        routes = get_sea_kayak_routes()
        lines.append(
            f"- Featured Sea Kayaking Routes: {', '.join(f'{r.title} ({r.water_grade.upper()}, {r.distance_nm} nm)' for r in routes)}"
        )

    lines.extend(
        [
            "- Marine Safety Protocols:",
            "  1. Cold water immersion protection: Waterproof paddling drysuit with thermal undergarments mandatory for all cold ocean routes (<55°F).",
            "  2. Tidal currents & navigation: Calculate ferry angles and cross open passages at slack water to avoid strong drift.",
            "  3. Essential safety kit: Type III/V PFD, neoprene spray skirt, dual-chamber paddle float, manual bilge pump, and floating marine VHF radio.",
            "  4. Marine communication: Monitor Marine VHF Channel 16 for emergency distress hailing and continuous NOAA marine weather forecasts.",
        ]
    )
    return "\n".join(lines)


def format_sea_kayaking_response(intent: SeaKayakingIntent) -> dict[str, Any]:
    if intent.action == "tide_plan":
        target_route_id = intent.route_id or "san-juan-islands-crossing"
        try:
            req = TidePlanRequest(route_id=target_route_id)
            plan = calculate_tide_plan(req)
            answer = (
                f"Tide & Tidal Current Passage Plan for {plan.route_title}: "
                f"Crossing status is {plan.crossing_safety_status.upper()}. {plan.departure_timing} "
                f"Recommended ferry angle: {plan.ferry_angle_degrees}° with an effective forward speed of {plan.effective_speed_knots} knots. "
                f"Drysuit required: {'Yes' if plan.drysuit_required else 'No'}. Monitor VHF Channel {plan.vhf_channel}. "
                f"{plan.safety_advisory}"
            )
            return {
                "answer": answer,
                "sea_kayaking_info": {
                    "action": "tide_plan",
                    "tide_plan": plan.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "gear_checklist":
        gear = get_sea_kayak_gear()
        gear_names = ", ".join(g.name for g in gear)
        answer = (
            f"Mandatory Sea Kayak Coastal Expedition Safety Gear: {gear_names}. "
            "All paddlers must wear a cold-water immersion drysuit and Type III/V PFD, "
            "and carry an inflatable paddle float, high-volume bilge pump, and Marine VHF Radio (Channel 16)."
        )
        return {
            "answer": answer,
            "sea_kayaking_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in gear],
            },
        }

    if intent.action == "route_detail" and intent.route_id:
        route = get_sea_kayak_route_by_id(intent.route_id)
        if route:
            answer = (
                f"Sea Kayaking Route: {route.title} ({route.region}). "
                f"Water Grade: {route.water_grade.upper()} | Distance: {route.distance_nm} nautical miles | Duration: {route.typical_duration_days} days. "
                f"Max Tidal Current: {route.max_current_knots} knots (Current Risk: {route.current_risk.capitalize()}). "
                f"Open Crossing: {route.open_crossing_miles} miles. Recommended Kayak Length: {route.recommended_kayak_length_ft} ft. "
                f"Immersion Drysuit Mandatory: {'Yes' if route.drysuit_mandatory else 'No'}. "
                f"Highlights: {'; '.join(route.highlights)}. {route.description}"
            )
            return {
                "answer": answer,
                "sea_kayaking_info": {
                    "action": "route_detail",
                    "route": route.model_dump(),
                },
            }

    # Default: "routes_list"
    routes = get_sea_kayak_routes(water_grade=intent.water_grade)
    summary = "; ".join(
        f"{r.title} ({r.water_grade.upper()}, {r.distance_nm} nm, {r.current_risk} current)"
        for r in routes
    )
    answer = (
        f"Coastal Sea Kayaking Expeditions: {summary}. "
        "Always check local tide tables, calculate ferry angles for tidal passages, and carry mandatory cold-water safety gear."
    )
    return {
        "answer": answer,
        "sea_kayaking_info": {
            "action": "routes_list",
            "routes": [r.model_dump() for r in routes],
        },
    }
