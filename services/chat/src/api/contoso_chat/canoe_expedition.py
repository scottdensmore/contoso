import re
from typing import Any, Optional

from pydantic import BaseModel, Field


class CanoeRouteModel(BaseModel):
    route_id: str
    title: str
    region: str
    distance_km: float
    typical_duration_days: int
    whitewater_class: str
    total_portages: int
    longest_portage_m: int
    recommended_hull_material: str
    recommended_length_ft: int
    description: str
    highlights: list[str] = Field(default_factory=list)


class CanoeTrimRequest(BaseModel):
    route_id: str
    canoe_length_ft: int = 16
    bow_paddler_weight_kg: float = 75.0
    stern_paddler_weight_kg: float = 85.0
    gear_cargo_weight_kg: float = 70.0
    cargo_placement: str = "centered"
    rapid_level: str = "class_ii"


class CanoeTrimResponse(BaseModel):
    route_id: str
    route_title: str
    total_gross_weight_kg: float
    capacity_percent: int
    center_freeboard_cm: float
    center_freeboard_inches: float
    trim_status: str
    swamping_risk: str
    safety_status: str
    tactical_advisory: str


class CanoeGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool = True
    purpose: str


class CanoeIntent(BaseModel):
    action: str  # "routes_list", "route_detail", "calculate_trim", "gear_checklist"
    route_id: Optional[str] = None
    whitewater_class: Optional[str] = None
    cargo_placement: Optional[str] = None


DEFAULT_CANOE_ROUTES: dict[str, CanoeRouteModel] = {
    "allagash-wilderness-waterway": CanoeRouteModel(
        route_id="allagash-wilderness-waterway",
        title="Allagash Wilderness Waterway Expedition",
        region="North Maine Woods, Maine",
        distance_km=148.0,
        typical_duration_days=7,
        whitewater_class="Class II",
        total_portages=3,
        longest_portage_m=500,
        recommended_hull_material="Royalex / T-Formex",
        recommended_length_ft=16,
        description="The premier eastern wilderness canoe trip featuring Chase Rapids, historic steam locomotives, and scenic lake chains in Maine's northern backcountry.",
        highlights=[
            "Chase Rapids Class II whitewater run requiring spray decks or lining",
            "Allagash Falls 40-foot drop with a mandatory 500m portage",
            "Historic 19th-century Lombard steam log haulers preserved in the forest",
            "Remote designated watercourse campsites with loon nesting habitats",
        ],
    ),
    "nahanni-river-canyon-run": CanoeRouteModel(
        route_id="nahanni-river-canyon-run",
        title="South Nahanni River Canyon Run",
        region="Dehcho Region, Northwest Territories",
        distance_km=320.0,
        typical_duration_days=12,
        whitewater_class="Class III-IV",
        total_portages=1,
        longest_portage_m=1200,
        recommended_hull_material="T-Formex / Heavy-Duty Royalex",
        recommended_length_ft=17,
        description="A legendary subarctic Canadian wilderness canyon expedition through towering limestone gorges, Virginia Falls, and continuous whitewater rapids.",
        highlights=[
            "Virginia Falls (Náilicho) 90m drop with steep 1.2km portage",
            "First, Second, Third, and Fourth Canyons with sheer 1,000m cliffs",
            "Figure Eight Rapids and George's Riffle heavy standing wave trains",
            "Kraus Hot Springs natural geothermal soak along the riverbank",
        ],
    ),
    "boundary-waters-granite-river": CanoeRouteModel(
        route_id="boundary-waters-granite-river",
        title="Boundary Waters Granite River Route",
        region="Gunflint Trail, Minnesota / Ontario Border",
        distance_km=52.0,
        typical_duration_days=4,
        whitewater_class="Class I-II",
        total_portages=6,
        longest_portage_m=800,
        recommended_hull_material="Kevlar / Composite / T-Formex",
        recommended_length_ft=16,
        description="Historic Voyageur fur trade border route connecting Gunflint Lake to Saganaga Lake with technical river chutes and Canadian Shield granite ledges.",
        highlights=[
            "Granite chutes and rapids along the US-Canada international border",
            "Historic voyageur portage trails with contoured granite rock faces",
            "High Falls portage and pristine Canadian Shield wilderness campsites",
            "Saganaga Lake grand entry with world-class boreal scenery",
        ],
    ),
    "missinaibi-river-james-bay": CanoeRouteModel(
        route_id="missinaibi-river-james-bay",
        title="Missinaibi River to James Bay Traverse",
        region="Northern Ontario, Canada",
        distance_km=510.0,
        typical_duration_days=16,
        whitewater_class="Class III",
        total_portages=18,
        longest_portage_m=1600,
        recommended_hull_material="T-Formex / Reinforced Kevlar",
        recommended_length_ft=17,
        description="Epic trans-watershed boreal expedition following the historic fur trade highway from Missinaibi Lake past Thunderhouse Falls to the salt tidewaters of James Bay.",
        highlights=[
            "Thunderhouse Falls and Hell's Gate gorge mandatory long portages",
            "Continuous Class II-III rapids including Glassy and Long Rapids",
            "Transition from boreal Canadian Shield to Hudson Bay Lowlands tundra",
            "Tidal river finish in Moosonee on the coast of James Bay",
        ],
    ),
    "rio-grande-lower-canyons": CanoeRouteModel(
        route_id="rio-grande-lower-canyons",
        title="Rio Grande Lower Canyons Expedition",
        region="Chihuahuan Desert, Texas / Coahuila Border",
        distance_km=134.0,
        typical_duration_days=7,
        whitewater_class="Class III",
        total_portages=2,
        longest_portage_m=350,
        recommended_hull_material="T-Formex / Royalex",
        recommended_length_ft=16,
        description="Remote and isolated desert river canyon run cutting through 1,500-foot limestone gorges with thermal springs, rock garden rapids, and mandatory rapid lining.",
        highlights=[
            "Burro Bluff and Hot Springs rapid lining and tracking sections",
            "Towering limestone canyon walls rising 1,500 feet above the river",
            "Natural riverbed thermal springs and absolute desert solitude",
            "Technical canoe maneuvering through limestone boulder fields",
        ],
    ),
}

DEFAULT_CANOE_GEAR: list[CanoeGearRequirement] = [
    CanoeGearRequirement(
        item_id="whitewater-canoe-spray-deck",
        name="Heavy-Duty Whitewater Canoe Spray Deck (Full Tandem Cover)",
        category="hull_protection",
        mandatory=True,
        purpose="Sheds breaking wave trains and prevents open hull swamping in technical Class II-IV whitewater rapids.",
    ),
    CanoeGearRequirement(
        item_id="dual-end-air-flotation-bags",
        name="Dual-End Heavy-Duty Nylon 3D Flotation Bags (Bow & Stern)",
        category="buoyancy_flotation",
        mandatory=True,
        purpose="Displaces over 600 lbs of water volume to ensure an overturned or swamped canoe floats high and remains recoverable in swift current.",
    ),
    CanoeGearRequirement(
        item_id="rapid-lining-tracking-ropes",
        name="Rapid Lining and Tracking Ropes (50ft Floating Polypropylene x 2)",
        category="rope_rigging",
        mandatory=True,
        purpose="Enables safe bankside boat lining down hazardous boulder ledges and upstream tracking through shallow swiftwater chutes.",
    ),
    CanoeGearRequirement(
        item_id="deep-water-canoe-bailer-pump",
        name="High-Capacity Manual Canoe Bailer and Hand Bilge Pump",
        category="bilge_dewatering",
        mandatory=True,
        purpose="Rapidly dewaters swamped water from the hull bottom to restore critical gunwale freeboard and stability.",
    ),
    CanoeGearRequirement(
        item_id="contoured-portage-yoke-pads",
        name="Contoured Ash Portage Yoke with High-Density Shoulder Pads",
        category="portage_equipment",
        mandatory=True,
        purpose="Cushions and distributes canoe weight evenly across shoulders for multi-kilometer overland wilderness carries.",
    ),
    CanoeGearRequirement(
        item_id="whitewater-rescue-pfd-harness",
        name="Type V Swiftwater Rescue PFD with Quick-Release Chest Harness",
        category="personal_flotation",
        mandatory=True,
        purpose="Provides high-buoyancy personal flotation with quick-release tether ring for swiftwater swimming and river extraction.",
    ),
]


def get_canoe_routes(whitewater_class: Optional[str] = None) -> list[CanoeRouteModel]:
    routes = list(DEFAULT_CANOE_ROUTES.values())
    if whitewater_class:
        wc_norm = whitewater_class.strip().lower().replace("_", " ").replace("-", " ")
        # Match class tokens like "class ii", "class iii", "class iv", "ii", "iii"
        filtered = []
        for r in routes:
            r_wc = r.whitewater_class.lower().replace("-", " ")
            if wc_norm in r_wc or r_wc in wc_norm:
                filtered.append(r)
            elif any(part in r_wc for part in wc_norm.split()):
                filtered.append(r)
        return filtered
    return routes


def get_canoe_route_by_id(route_id: str) -> Optional[CanoeRouteModel]:
    if not route_id:
        return None
    normalized = route_id.strip().lower()
    return DEFAULT_CANOE_ROUTES.get(normalized)


def get_canoe_gear() -> list[CanoeGearRequirement]:
    return list(DEFAULT_CANOE_GEAR)


def calculate_canoe_trim(req: CanoeTrimRequest) -> CanoeTrimResponse:
    route = get_canoe_route_by_id(req.route_id)
    if not route:
        raise ValueError(f"Canoe route '{req.route_id}' not found")

    total_gross = round(req.bow_paddler_weight_kg + req.stern_paddler_weight_kg + req.gear_cargo_weight_kg, 1)

    canoe_len = max(14, min(20, req.canoe_length_ft))
    base_capacity = 350.0 + (canoe_len - 15) * 50.0
    capacity_percent = min(100, max(0, round((total_gross / base_capacity) * 100)))

    base_depth_cm = 35.0 + (canoe_len - 15) * 1.5
    draft_cm = (total_gross / base_capacity) * 20.0
    center_freeboard_cm = round(max(5.0, base_depth_cm - draft_cm), 1)
    center_freeboard_inches = round(center_freeboard_cm / 2.54, 1)

    placement = req.cargo_placement.strip().lower()
    if placement in ("bow_heavy", "forward"):
        cargo_bow_share = 0.7
        cargo_stern_share = 0.3
    elif placement in ("stern_heavy", "aft"):
        cargo_bow_share = 0.3
        cargo_stern_share = 0.7
    else:
        cargo_bow_share = 0.5
        cargo_stern_share = 0.5

    effective_bow = req.bow_paddler_weight_kg + (req.gear_cargo_weight_kg * cargo_bow_share)
    effective_stern = req.stern_paddler_weight_kg + (req.gear_cargo_weight_kg * cargo_stern_share)

    # In tandem canoeing, slight stern-down bias (5-20 kg) is balanced
    if effective_bow > effective_stern + 5.0:
        trim_status = "bow_heavy"
    elif effective_stern > effective_bow + 25.0:
        trim_status = "stern_heavy"
    else:
        trim_status = "balanced"

    rapid = req.rapid_level.strip().lower()
    is_heavy_rapid = any(k in rapid for k in ["class_iii", "class_iv", "class_v", "class iii", "class iv", "class v"])
    is_moderate_rapid = "class_ii" in rapid or "class ii" in rapid

    if is_heavy_rapid:
        if center_freeboard_cm < 20.0 or trim_status == "bow_heavy":
            swamping_risk = "critical"
        elif center_freeboard_cm < 25.0:
            swamping_risk = "high"
        else:
            swamping_risk = "moderate"
    elif is_moderate_rapid:
        if center_freeboard_cm < 18.0 or trim_status == "bow_heavy":
            swamping_risk = "high"
        elif center_freeboard_cm < 24.0:
            swamping_risk = "moderate"
        else:
            swamping_risk = "low"
    else:
        if center_freeboard_cm < 16.0:
            swamping_risk = "moderate"
        else:
            swamping_risk = "low"

    if capacity_percent >= 85 or center_freeboard_cm < 18.0 or swamping_risk == "critical":
        safety_status = "WARNING"
    elif capacity_percent >= 70 or center_freeboard_cm < 23.0 or trim_status != "balanced" or swamping_risk == "high":
        safety_status = "CAUTION"
    else:
        safety_status = "OPTIMAL"

    # Tactical advisory
    advisory_parts = []
    if trim_status == "bow_heavy":
        advisory_parts.append(
            "BOW-HEAVY TRIM HAZARD: Bow will plow into wave trains, drastically increasing swamping risk and reducing turning responsiveness. Shift dense cargo packs aft to achieve neutral trim."
        )
    elif trim_status == "stern_heavy":
        advisory_parts.append(
            "STERN-HEAVY TRIM CAUTION: Stern is dragging and high bow will catch crosswinds (weathercocking). Shift dry bags forward toward center thwart."
        )
    else:
        advisory_parts.append(
            "OPTIMAL TRIM: Hull is balanced with appropriate slight stern bias for tracking and wave deflection."
        )

    if center_freeboard_cm < 20.0:
        advisory_parts.append(
            f"LOW FREEBOARD ({center_freeboard_cm} cm / {center_freeboard_inches} in): Gunwales are deeply immersed. Expedition whitewater spray deck and end air flotation bags mandatory."
        )
    else:
        advisory_parts.append(
            f"ADEQUATE FREEBOARD ({center_freeboard_cm} cm / {center_freeboard_inches} in): Hull has sufficient reserve buoyancy for {route.whitewater_class} water."
        )

    if is_heavy_rapid:
        advisory_parts.append(
            f"TECHNICAL RAPIDS: Rig 50ft floating lining ropes for scouting and lining around unrunnable ledge drops on {route.title}."
        )

    tactical_advisory = " ".join(advisory_parts)

    return CanoeTrimResponse(
        route_id=route.route_id,
        route_title=route.title,
        total_gross_weight_kg=total_gross,
        capacity_percent=capacity_percent,
        center_freeboard_cm=center_freeboard_cm,
        center_freeboard_inches=center_freeboard_inches,
        trim_status=trim_status,
        swamping_risk=swamping_risk,
        safety_status=safety_status,
        tactical_advisory=tactical_advisory,
    )


def extract_canoe_intent(message: str) -> Optional[CanoeIntent]:
    if not message or not message.strip():
        return None

    q = message.lower()
    q_norm = q.replace("-", " ")

    # Exclusions for unrelated customer service or alpine topics
    unrelated = [
        "refund",
        "order #",
        "return label",
        "climbing shoe",
        "avalanche danger",
        "snowpack",
        "fire ban",
        "glacier travel",
        "mount rainier",
        "ski tour",
        "splitboard",
    ]
    if any(u in q for u in unrelated):
        return None

    # Disambiguation guard 1: Sea Kayaking
    sea_kayak_terms = [
        "sea kayak",
        "sea kayaking",
        "coastal kayak",
        "coastal kayaking",
        "ocean paddling",
        "san juan islands",
        "prince william sound",
        "maine island trail",
        "apostle islands",
        "haida gwaii",
        "paddle float",
        "marine vhf",
        "slack water",
        "tidal current",
    ]
    if any(k in q for k in sea_kayak_terms):
        return None

    # Disambiguation guard 2: Backcountry Packrafting
    packraft_terms = [
        "packraft",
        "packrafting",
        "middle fork salmon",
        "bob marshall",
        "talkeetna",
        "tizip",
    ]
    if any(k in q for k in packraft_terms):
        return None

    # Disambiguation guard 3: River Whitewater Kayaking (without canoe terms)
    canoe_explicit_triggers = [
        "canoe",
        "canoeing",
        "pack canoeing",
        "pack-canoeing",
        "open canoe",
        "open boat",
        "portage",
        "portaging",
        "rapid lining",
        "tracking rope",
        "tracking line",
        "tracking ropes",
        "tracking lines",
        "spray deck",
        "allagash",
        "nahanni",
        "missinaibi",
        "granite river",
        "gunwale",
        "freeboard",
        "canoe trim",
        "yoke pad",
        "end bags",
        "air flotation bags",
        "canoe bailer",
    ]

    has_canoe_trigger = any(t in q_norm for t in canoe_explicit_triggers)

    general_whitewater_without_canoe = [
        "kayak roll",
        "whitewater kayak",
        "white salmon",
        "tumwater",
        "husum",
    ]
    if any(k in q for k in general_whitewater_without_canoe) and not has_canoe_trigger:
        return None

    if not has_canoe_trigger:
        return None

    # Detect Route ID
    route_id: Optional[str] = None
    if "allagash" in q_norm:
        route_id = "allagash-wilderness-waterway"
    elif "nahanni" in q_norm:
        route_id = "nahanni-river-canyon-run"
    elif "granite river" in q_norm or "boundary waters" in q_norm:
        route_id = "boundary-waters-granite-river"
    elif "missinaibi" in q_norm:
        route_id = "missinaibi-river-james-bay"
    elif "rio grande" in q_norm or "lower canyons" in q_norm:
        route_id = "rio-grande-lower-canyons"

    # Detect Whitewater Class
    whitewater_class: Optional[str] = None
    if re.search(r"\b(?:class\s*iv|class\s*4)\b", q):
        whitewater_class = "class_iv"
    elif re.search(r"\b(?:class\s*iii|class\s*3)\b", q):
        whitewater_class = "class_iii"
    elif re.search(r"\b(?:class\s*ii|class\s*2)\b", q):
        whitewater_class = "class_ii"
    elif re.search(r"\b(?:class\s*i|class\s*1)\b", q):
        whitewater_class = "class_i"

    # Detect Cargo Placement
    cargo_placement: Optional[str] = None
    if any(k in q for k in ["bow heavy", "bow-heavy", "forward"]):
        cargo_placement = "bow_heavy"
    elif any(k in q for k in ["stern heavy", "stern-heavy", "aft"]):
        cargo_placement = "stern_heavy"
    elif "centered" in q or "centre" in q:
        cargo_placement = "centered"

    # Detect Action
    if any(
        k in q
        for k in [
            "trim",
            "freeboard",
            "gunwale",
            "ballast",
            "calculate trim",
            "calculate freeboard",
            "swamping risk",
        ]
    ):
        action = "calculate_trim"
    elif any(
        k in q
        for k in [
            "gear",
            "checklist",
            "equipment",
            "spray deck",
            "end bags",
            "yoke pad",
            "lining rope",
            "tracking rope",
            "bailer",
            "pump",
        ]
    ) and not any(k in q for k in ["calculate", "trim", "freeboard"]):
        action = "gear_checklist"
    elif route_id and any(
        k in q
        for k in [
            "detail",
            "about",
            "describe",
            "tell me about",
            "highlights",
            "portage distance",
            "portages",
            "how long",
            "duration",
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

    return CanoeIntent(
        action=action,
        route_id=route_id,
        whitewater_class=whitewater_class,
        cargo_placement=cargo_placement,
    )


detect_canoe_intent = extract_canoe_intent


class FormattedCanoeResponse(str):
    _data: dict[str, Any]

    def __new__(cls, answer: str, data: dict[str, Any]):
        instance = super().__new__(cls, answer)
        instance._data = data
        return instance

    def get(self, key: str, default: Any = None) -> Any:
        return self._data.get(key, default)

    def __getitem__(self, key: Any) -> Any:
        if isinstance(key, str) and key in self._data:
            return self._data[key]
        return super().__getitem__(key)

    def __contains__(self, key: object) -> bool:
        if isinstance(key, str):
            return key in self._data or super().__contains__(key)
        return False

    def keys(self):
        return self._data.keys()

    def values(self):
        return self._data.values()

    def items(self):
        return self._data.items()


def format_canoe_response(intent: CanoeIntent) -> FormattedCanoeResponse:
    if intent.action == "calculate_trim":
        target_route_id = intent.route_id or "allagash-wilderness-waterway"
        try:
            req = CanoeTrimRequest(
                route_id=target_route_id,
                cargo_placement=intent.cargo_placement or "centered",
                rapid_level=intent.whitewater_class or "class_ii",
            )
            trim = calculate_canoe_trim(req)
            answer = (
                f"Canoe Hull Ballast & Freeboard Trim Plan for {trim.route_title}: "
                f"Total gross weight is {trim.total_gross_weight_kg} kg ({trim.capacity_percent}% hull capacity). "
                f"Center gunwale freeboard is {trim.center_freeboard_cm} cm ({trim.center_freeboard_inches} inches). "
                f"Trim Status: {trim.trim_status.upper()}. Swamping Risk: {trim.swamping_risk.upper()}. "
                f"Safety Status: {trim.safety_status}. {trim.tactical_advisory}"
            )
            info = {
                "action": "calculate_trim",
                "route_id": trim.route_id,
                "route_title": trim.route_title,
                "total_gross_weight_kg": trim.total_gross_weight_kg,
                "capacity_percent": trim.capacity_percent,
                "center_freeboard_cm": trim.center_freeboard_cm,
                "center_freeboard_inches": trim.center_freeboard_inches,
                "trim_status": trim.trim_status,
                "swamping_risk": trim.swamping_risk,
                "safety_status": trim.safety_status,
                "tactical_advisory": trim.tactical_advisory,
                "trim": trim.model_dump(),
            }
            return FormattedCanoeResponse(answer, {"answer": answer, "canoe_info": info})
        except ValueError:
            pass

    if intent.action == "route_detail" and intent.route_id:
        route = get_canoe_route_by_id(intent.route_id)
        if route:
            answer = (
                f"Open Canoe Expedition Route: {route.title} ({route.region}). "
                f"Whitewater Class: {route.whitewater_class} | Distance: {route.distance_km} km | Typical Duration: {route.typical_duration_days} days. "
                f"Portages: {route.total_portages} carries (longest: {route.longest_portage_m}m). "
                f"Recommended Boat: {route.recommended_length_ft}ft {route.recommended_hull_material} canoe. "
                f"{route.description} Highlights: {'; '.join(route.highlights)}."
            )
            info = {
                "action": "route_detail",
                "route_id": route.route_id,
                "route": route.model_dump(),
            }
            return FormattedCanoeResponse(answer, {"answer": answer, "canoe_info": info})

    if intent.action == "gear_checklist":
        gear = get_canoe_gear()
        gear_names = ", ".join(g.name for g in gear)
        answer = (
            f"Mandatory Whitewater Pack-Canoeing & Open Boat Expedition Gear (6 items): {gear_names}. "
            "A full tandem whitewater spray deck, dual-end 3D air flotation bags, 50ft floating lining/tracking ropes, "
            "high-flow bailer pump, contoured portage yoke pads, and Type V rescue PFD are required for open boat wilderness expeditions."
        )
        info = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
        }
        return FormattedCanoeResponse(answer, {"answer": answer, "canoe_info": info})

    # Default: routes_list
    routes = get_canoe_routes(whitewater_class=intent.whitewater_class)
    summary = "; ".join(f"{r.title} ({r.whitewater_class}, {r.distance_km} km, {r.total_portages} portages)" for r in routes)
    answer = (
        f"Contoso Whitewater Pack-Canoeing & Open Canoe Expeditions: {summary}. "
        "Each wilderness expedition requires balanced hull trim calculations, minimum gunwale freeboard evaluation, "
        "and rapid lining rigging."
    )
    info = {
        "action": "routes_list",
        "routes": [r.model_dump() for r in routes],
    }
    return FormattedCanoeResponse(answer, {"answer": answer, "canoe_info": info})


def build_canoe_prompt(intent: CanoeIntent) -> str:
    lines = ["Whitewater Pack-Canoeing & Open Canoe Expedition Tooling:"]
    if intent.route_id:
        route = get_canoe_route_by_id(intent.route_id)
        if route:
            lines.extend([
                f"- Selected Route: {route.title} ({route.region})",
                f"  Distance: {route.distance_km} km | Duration: {route.typical_duration_days} days | Class: {route.whitewater_class}",
                f"  Portages: {route.total_portages} carries (Longest: {route.longest_portage_m} m)",
                f"  Recommended Hull: {route.recommended_length_ft} ft {route.recommended_hull_material}",
                f"  Description: {route.description}",
                f"  Highlights: {'; '.join(route.highlights)}",
            ])
    elif intent.action == "gear_checklist":
        gear = get_canoe_gear()
        lines.append("- Mandatory Open Canoe Wilderness Expedition Safety Gear:")
        for g in gear:
            lines.append(f"  * {g.name} [{g.category}]: {g.purpose}")
    elif intent.action == "calculate_trim":
        lines.extend([
            "- Canoe Ballast & Gunwale Freeboard Trim Principles:",
            "  * Center Freeboard: Maintain at least 15 cm (6 inches) for calm water and 20-25 cm (8-10 inches) for Class II-III rapids.",
            "  * Neutral Trim: Tandem canoes perform best with slight stern-down bias (5-15 kg) for wave shedding and directional tracking.",
            "  * Bow-Heavy Hazards: Submarine effect where bow dives into standing waves, causing instant swamping and loss of steering.",
            "  * Rapid Lining & Tracking: When water volume or ledge height exceeds safe open canoe freeboard, line downstream or track upstream using 50ft floating ropes.",
        ])
    else:
        routes = get_canoe_routes(whitewater_class=intent.whitewater_class)
        lines.append(
            f"- Available Canoe Routes ({intent.whitewater_class or 'All Classes'}): "
            + "; ".join(f"{r.title} [{r.whitewater_class}, {r.distance_km} km]" for r in routes)
        )

    lines.extend([
        "- Core Whitewater Open Canoe Guidelines:",
        "  1. Spray Decks & Flotation: In Class II+ whitewater, tandem spray decks prevent swamping while 3D end bags prevent hull entrapment if filled.",
        "  2. Lining and Tracking: Use bridle ropes attached at stem waterlines (not gunwales) to control canoe angle from riverbanks.",
        "  3. Portage Discipline: Inspect yoke pads and balance boat pivot on shoulders with paddles secured along gunwales.",
        "  4. Rapid Scouting: Scout all Class III+ drops from shore before committing; open boats cannot recover from swamping without shore assistance or high-volume pumps.",
    ])
    return "\n".join(lines)
