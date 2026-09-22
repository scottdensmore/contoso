from typing import Any, Optional

from pydantic import BaseModel, Field


class CoasteeringRouteModel(BaseModel):
    route_id: str
    title: str
    region: str
    distance_km: float
    typical_duration_hours: float
    coasteering_grade: str
    max_jump_height_m: float
    sea_cave_count: int
    water_temp_f: int
    tide_window: str
    min_water_depth_m: float
    description: str
    highlights: list[str] = Field(default_factory=list)


class JumpSafetyRequest(BaseModel):
    route_id: str
    jump_height_m: float = 5.0
    water_depth_m: float = 4.5
    swell_height_m: float = 1.2
    swell_period_seconds: float = 12.0
    tide_state: str = "slack_water"
    water_aerated_with_foam: bool = False


class JumpSafetyResponse(BaseModel):
    route_id: str
    route_title: str
    coasteering_grade: str
    min_required_depth_m: float
    depth_margin_m: float
    safety_status: str
    aeration_impact_notice: str
    surge_timing_advisory: str
    body_position_guide: str
    exit_route_advisory: str


class CoasteeringGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class CoasteeringIntent(BaseModel):
    action: str  # "routes", "route_detail", "jump_safety", "gear_checklist"
    route_id: Optional[str] = None
    grade: Optional[str] = None
    region: Optional[str] = None


DEFAULT_COASTEERING_ROUTES: dict[str, CoasteeringRouteModel] = {
    "point-lobos-granite-coves": CoasteeringRouteModel(
        route_id="point-lobos-granite-coves",
        title="Point Lobos Granite Headlands Traverse",
        region="Carmel, CA",
        distance_km=2.8,
        typical_duration_hours=3.0,
        coasteering_grade="grade_2_moderate_coastal",
        max_jump_height_m=5.5,
        sea_cave_count=2,
        water_temp_f=53,
        tide_window="mid_to_slack_water",
        min_water_depth_m=4.0,
        description=(
            "Dramatic granitic sea cliff scrambling and sheltered oceanic cove swimming along the Monterey coast, "
            "featuring giant bull kelp beds, sea lion swim channels, and technical granite slab traverses."
        ),
        highlights=[
            "Granite headlands traverse",
            "Sheltered oceanic coves",
            "Bull kelp swim channels",
        ],
    ),
    "depoe-bay-spouting-horn-surge": CoasteeringRouteModel(
        route_id="depoe-bay-spouting-horn-surge",
        title="Depoe Bay Basalt Cliffs & Spouting Horn",
        region="Depoe Bay, OR",
        distance_km=3.5,
        typical_duration_hours=4.0,
        coasteering_grade="grade_3_advanced_swell",
        max_jump_height_m=8.0,
        sea_cave_count=3,
        water_temp_f=49,
        tide_window="slack_water_low_swell",
        min_water_depth_m=5.0,
        description=(
            "Exhilarating Oregon basalt coastline traverse through surging swell channels, hydraulic blowholes, "
            "and turbulent Pacific foam cauldrons requiring precise wave timing."
        ),
        highlights=[
            "Spouting horn blowhole",
            "Basalt surge channels",
            "Boiling cauldron jump pools",
        ],
    ),
    "acadia-otter-cliffs-traverse": CoasteeringRouteModel(
        route_id="acadia-otter-cliffs-traverse",
        title="Acadia Otter Cliffs & Ocean Path Traverse",
        region="Acadia NP, ME",
        distance_km=2.2,
        typical_duration_hours=2.5,
        coasteering_grade="grade_2_moderate_coastal",
        max_jump_height_m=6.0,
        sea_cave_count=1,
        water_temp_f=51,
        tide_window="low_to_mid_incoming",
        min_water_depth_m=4.5,
        description=(
            "Iconic Maine pink granite sea cliff traverse along Mount Desert Island delivering precipitous ocean "
            "bluffs, deep Atlantic plunge chasms, and rich intertidal invertebrate colonies."
        ),
        highlights=[
            "Pink granite sea bluffs",
            "Thunder hole surge viewing",
            "Atlantic deep water drop",
        ],
    ),
    "la-jolla-coves-caves-traverse": CoasteeringRouteModel(
        route_id="la-jolla-coves-caves-traverse",
        title="La Jolla Ecological Reserve Sea Coves & Arches",
        region="La Jolla, CA",
        distance_km=2.0,
        typical_duration_hours=2.0,
        coasteering_grade="grade_1_sheltered_cove",
        max_jump_height_m=4.0,
        sea_cave_count=4,
        water_temp_f=65,
        tide_window="all_tides_low_swell",
        min_water_depth_m=3.5,
        description=(
            "Sunlit southern California coastal marine sanctuary featuring gentle sea cave arches, swimming "
            "with garibaldi and leopard sharks, and beginner-friendly sandstone platform leaps."
        ),
        highlights=[
            "Sunny Jim sea cave swim",
            "Sandstone arch traverses",
            "Garibaldi marine reserve swim",
        ],
    ),
    "cape-flattery-pacific-surge": CoasteeringRouteModel(
        route_id="cape-flattery-pacific-surge",
        title="Cape Flattery Pacific Rim Sea Stacks",
        region="Clallam County, WA",
        distance_km=4.2,
        typical_duration_hours=5.0,
        coasteering_grade="grade_4_extreme_surge",
        max_jump_height_m=9.5,
        sea_cave_count=5,
        water_temp_f=47,
        tide_window="slack_water_neap_tide",
        min_water_depth_m=6.0,
        description=(
            "Remote wilderness Pacific traverse on the edge of the Olympic Peninsula featuring heavy ocean swell, "
            "soaring sea stacks, massive surge tunnels, and intense hydraulic currents."
        ),
        highlights=[
            "Pacific rim sea stacks",
            "Massive surge cavern swims",
            "Tatoosh island vista",
        ],
    ),
}

DEFAULT_COASTEERING_GEAR: list[CoasteeringGearRequirement] = [
    CoasteeringGearRequirement(
        item_id="high-impact-watersports-helmet",
        name="EN 1385 Certified Watersports Helmet with Ear Protection & Drainage Vents",
        category="headwear_protection",
        mandatory=True,
        purpose="Protects against violent sea cliff impacts, head strikes against submerged boulders, and hydraulic disorientation.",
    ),
    CoasteeringGearRequirement(
        item_id="reinforced-steamer-wetsuit",
        name="5/4mm or 4/3mm Heavy-Duty Neoprene Steamer Wetsuit with Abrasion-Resistant Knees & Seat",
        category="thermal_protection",
        mandatory=True,
        purpose="Provides core hypothermia defense in cold oceanic waters and shields skin from sharp barnacles and jagged rock faces.",
    ),
    CoasteeringGearRequirement(
        item_id="high-buoyancy-coasteering-pfd",
        name="ISO 12402-5 / USCG Type III 50N+ High-Impact Buoyancy Aid with Quick-Release Rescue Harness",
        category="buoyancy_pfd",
        mandatory=True,
        purpose="Ensures positive flotation in turbulent aerated whitewash foam and allows emergency swimmer extraction in surge gullies.",
    ),
    CoasteeringGearRequirement(
        item_id="sticky-rubber-water-boots",
        name="High-Traction Vibram/Stealth Sticky Rubber Canyoneering/Coasteering Boots with Ankle Support",
        category="footwear",
        mandatory=True,
        purpose="Delivers maximum friction on slick kelp, wet algae, and greasy marine shelves while protecting ankles from boulder fissures.",
    ),
    CoasteeringGearRequirement(
        item_id="neoprene-impact-gloves",
        name="Reinforced 2mm Pre-Curved Neoprene Gloves with Kevlar Palm Protection",
        category="hand_protection",
        mandatory=True,
        purpose="Shields palms and fingers from razor-sharp barnacles, razor clams, and mussel beds during wave surge holds.",
    ),
    CoasteeringGearRequirement(
        item_id="coasteering-throwline-whistle",
        name="15m Floating Water Rescue Throwline in Waist Pouch with Pealess Marine Whistle",
        category="rescue_signaling",
        mandatory=True,
        purpose="Enables immediate rescue line deployment in offshore rip currents and audibly cuts through pounding sea roar.",
    ),
]


def get_coasteering_routes(grade: Optional[str] = None) -> list[CoasteeringRouteModel]:
    routes = list(DEFAULT_COASTEERING_ROUTES.values())
    if not grade:
        return routes

    norm = grade.strip().lower().replace(" ", "_").replace("-", "_")

    def canonical(g: str) -> str:
        if "grade_4" in g or "grade_4_extreme_surge" in g or g == "extreme":
            return "grade_4_extreme_surge"
        if "grade_3" in g or "grade_3_advanced_swell" in g or g == "advanced":
            return "grade_3_advanced_swell"
        if "grade_2" in g or "grade_2_moderate_coastal" in g or g == "moderate":
            return "grade_2_moderate_coastal"
        if "grade_1" in g or "grade_1_sheltered_cove" in g or g == "sheltered":
            return "grade_1_sheltered_cove"
        return g

    target = canonical(norm)
    return [r for r in routes if r.coasteering_grade == target or target in r.coasteering_grade]


def get_coasteering_route_by_id(route_id: str) -> Optional[CoasteeringRouteModel]:
    return DEFAULT_COASTEERING_ROUTES.get(route_id.strip().lower())


def get_coasteering_gear() -> list[CoasteeringGearRequirement]:
    return list(DEFAULT_COASTEERING_GEAR)


def calculate_jump_safety(request: JumpSafetyRequest) -> JumpSafetyResponse:
    route = get_coasteering_route_by_id(request.route_id)
    if not route:
        raise ValueError(f"Coasteering route '{request.route_id}' not found")

    # Base deceleration depth needed for jump height
    base_required_depth = 2.5 + (request.jump_height_m * 0.35)
    base_depth = max(route.min_water_depth_m, base_required_depth)

    # Aerated foam factor: bubbles reduce water density, requiring greater landing pool depth
    if request.water_aerated_with_foam:
        aeration_factor = 1.30
        min_required_depth_m = round(base_depth * aeration_factor, 2)
        aeration_impact_notice = (
            "CRITICAL BUOYANCY REDUCTION: Highly aerated whitewater foam decreases water density by up to 30%, "
            "dramatically reducing hydrodynamic drag and buoyant lift. Required pool depth increases by 30% to prevent sea bed collision."
        )
    else:
        min_required_depth_m = round(base_depth, 2)
        aeration_impact_notice = (
            "Nominal water density: Solid green water provides standard hydrodynamic deceleration and buoyant stopping force."
        )

    depth_margin_m = round(request.water_depth_m - min_required_depth_m, 2)

    # Safety status evaluation
    if request.swell_height_m >= 2.0 or request.swell_period_seconds < 6.0:
        if depth_margin_m < 0:
            safety_status = "hazard_shallow_water_and_extreme_swell"
        else:
            safety_status = "hazard_extreme_swell"
    elif depth_margin_m < 0:
        safety_status = "hazard_shallow_water"
    elif depth_margin_m < 0.5:
        safety_status = "caution_marginal_depth"
    else:
        safety_status = "safe_jump_conditions"

    # Surge timing advisory
    if request.swell_height_m >= 2.0:
        surge_timing_advisory = (
            f"EXTREME SWELL HAZARD ({request.swell_height_m:.1f}m @ {request.swell_period_seconds:.1f}s): "
            "Violent oceanic surges, violent backwash, and chaotic hydraulics make jumping unsafe. Abort jump."
        )
    elif request.swell_height_m > 1.2 or request.tide_state in ["ebb_tide", "low_tide"]:
        surge_timing_advisory = (
            f"MODERATE SURGE ADVISORY ({request.swell_height_m:.1f}m @ {request.swell_period_seconds:.1f}s, {request.tide_state}): "
            "Time leap strictly for the crest of an incoming swell wave set to maximize impact water depth. Never jump into a receding wave trough."
        )
    else:
        surge_timing_advisory = (
            f"OPTIMAL SURGE WINDOW ({request.swell_height_m:.1f}m @ {request.swell_period_seconds:.1f}s, {request.tide_state}): "
            "Swell conditions are calm to moderate. Leap smoothly into the swell rise."
        )

    body_position_guide = (
        "Maintain strict pencil jump posture: body vertical, legs pinned tightly together, arms crossed across PFD chest harness, "
        "head neutral with chin tucked, and toes pointed down to pierce water tension smoothly."
    )

    exit_route_advisory = (
        "Scout primary and secondary low-angle scramble exits before leaping. Upon surfacing, signal OK to spotter, "
        "swim out of the turbulent drop zone perpendicular to surge currents, and ride the swell crest onto the rocky exit ledge."
    )

    return JumpSafetyResponse(
        route_id=route.route_id,
        route_title=route.title,
        coasteering_grade=route.coasteering_grade,
        min_required_depth_m=min_required_depth_m,
        depth_margin_m=depth_margin_m,
        safety_status=safety_status,
        aeration_impact_notice=aeration_impact_notice,
        surge_timing_advisory=surge_timing_advisory,
        body_position_guide=body_position_guide,
        exit_route_advisory=exit_route_advisory,
    )


def detect_coasteering_intent(message: str) -> Optional[CoasteeringIntent]:
    if not message or not message.strip():
        return None

    q = message.lower()

    # General e-commerce exclusions
    ecommerce_exclusions = [
        "refund",
        "order #",
        "return label",
        "shipping tracking",
    ]
    if any(ex in q for ex in ecommerce_exclusions):
        return None

    # CRITICAL DISAMBIGUATION: Strictly guard against Wilderness sea kayaking (sea_kayaking.py)
    sea_kayaking_exclusions = [
        "sea kayak",
        "sea kayaking",
        "coastal kayak",
        "coastal kayaking",
        "ocean paddling",
        "paddle float",
        "bilge pump",
        "spray skirt",
        "spray deck",
        "dry suit paddling",
        "drysuit paddling",
    ]
    if any(sx in q for sx in sea_kayaking_exclusions):
        return None

    # CRITICAL DISAMBIGUATION: Strictly guard against Whitewater river paddling (whitewater.py)
    whitewater_exclusions = [
        "whitewater",
        "white water",
        "rafting",
        "river run",
        "river rapid",
        "river rapids",
        "class iv",
        "class v",
        "eddy turn",
        "ferry angle",
    ]
    if any(wx in q for wx in whitewater_exclusions):
        return None

    # CRITICAL DISAMBIGUATION: Strictly guard against Technical slot canyoneering (canyoneering.py)
    canyoneering_exclusions = [
        "canyoneering",
        "canyoning",
        "slot canyon",
        "pothole escape",
        "sand trap anchor",
        "potshot",
        "subway zion",
        "rap line",
    ]
    if any(cx in q for cx in canyoneering_exclusions):
        return None

    # CRITICAL DISAMBIGUATION: Strictly guard against Rock climbing crags (climbing.py)
    climbing_exclusions = [
        "rock climbing",
        "trad climbing",
        "sport climbing",
        "bouldering",
        "camalot",
        "chalk bag",
        "quickdraw",
        "quickdraws",
        "climbing crag",
    ]
    if any(rx in q for rx in climbing_exclusions):
        return None

    # Coasteering keywords
    coasteering_keywords = [
        "coasteering",
        "sea cliff",
        "sea cliffs",
        "ocean traverse",
        "surge gully",
        "surge gullies",
        "surge channel",
        "swell timing",
        "cliff jump",
        "cliff jumping",
        "blowhole",
        "spouting horn",
        "barnacle protection",
        "point lobos coasteering",
        "point lobos",
        "depoe bay cliffs",
        "depoe bay",
        "acadia otter cliffs",
        "otter cliffs",
        "la jolla coves",
        "la jolla cove",
        "cape flattery swell",
        "cape flattery",
        "aerated foam",
        "buoyancy physics",
        "watersports helmet",
        "en 1385",
        "coasteering wetsuit",
        "sticky rubber water boots",
        "sea cave exploration",
        "sea cave",
        "sea caves",
    ]

    if not any(k in q for k in coasteering_keywords):
        return None

    # Detect Route
    route_id = None
    if "point lobos" in q or "point-lobos" in q or "carmel" in q:
        route_id = "point-lobos-granite-coves"
    elif "depoe bay" in q or "depoe-bay" in q or "spouting horn" in q:
        route_id = "depoe-bay-spouting-horn-surge"
    elif "acadia" in q or "otter cliff" in q or "otter cliffs" in q:
        route_id = "acadia-otter-cliffs-traverse"
    elif "la jolla" in q or "la-jolla" in q:
        route_id = "la-jolla-coves-caves-traverse"
    elif "cape flattery" in q or "cape-flattery" in q:
        route_id = "cape-flattery-pacific-surge"

    # Detect Grade
    grade = None
    if "grade 4" in q or "grade_4" in q or "extreme" in q:
        grade = "grade_4_extreme_surge"
    elif "grade 3" in q or "grade_3" in q or "advanced" in q:
        grade = "grade_3_advanced_swell"
    elif "grade 2" in q or "grade_2" in q or "moderate" in q:
        grade = "grade_2_moderate_coastal"
    elif "grade 1" in q or "grade_1" in q or "sheltered" in q:
        grade = "grade_1_sheltered_cove"

    # Detect Action
    if any(
        k in q
        for k in [
            "jump safety",
            "cliff jump",
            "jump calculation",
            "jump depth",
            "depth verification",
            "water depth",
            "aerated foam",
            "swell timing",
            "surge timing",
            "buoyancy physics",
            "is it safe to jump",
            "depth margin",
        ]
    ):
        action = "jump_safety"
    elif any(
        k in q
        for k in [
            "gear",
            "checklist",
            "equipment",
            "kit",
            "helmet",
            "wetsuit",
            "boots",
            "gloves",
            "throwline",
            "pfd",
            "protective equipment",
        ]
    ):
        action = "gear_checklist"
    elif route_id and any(
        k in q
        for k in [
            "detail",
            "beta",
            "caves",
            "cave",
            "jump height",
            "distance",
            "duration",
            "tide",
            "about",
            "describe",
            "how long",
            "sea cave",
            "coves",
        ]
    ):
        action = "route_detail"
    elif any(
        k in q
        for k in [
            "routes",
            "catalog",
            "destinations",
            "list",
            "show me",
            "available",
            "coastal traverse",
            "coasteering routes",
        ]
    ):
        action = "routes"
    elif route_id:
        action = "route_detail"
    else:
        action = "routes"

    return CoasteeringIntent(
        action=action,
        route_id=route_id,
        grade=grade,
    )


def build_coasteering_prompt(intent: CoasteeringIntent) -> str:
    lines = [
        "Coastal Sea Cliff Coasteering, Ocean Traverses & Swell Safety Beta:",
        "- Coasteering Disciplines: Intertidal cliff scrambling, ocean surge swimming, sea cave exploration, and technical cliff jumping.",
        "- Aerated Foam Physics: Entrained air in whitewater froth reduces water density by 20-30%, decreasing buoyancy and requiring substantially deeper landing pools to prevent sea bed impact.",
        "- Swell Surge Timing: Time jumps to coincide with incoming swell crests for maximum depth; never jump into an empty surge gully trough or receding backwash.",
        "- Safety Equipment Standard: Mandatory EN 1385 watersports helmet, 4-5mm reinforced wetsuit, ISO 12402-5 50N+ PFD, and high-traction sticky rubber water boots.",
    ]

    if intent.route_id:
        route = get_coasteering_route_by_id(intent.route_id)
        if route:
            lines.append(
                f"- Focused Route Beta: {route.title} ({route.region})\n"
                f"  Grade: {route.coasteering_grade} | Distance: {route.distance_km}km | Duration: {route.typical_duration_hours}h\n"
                f"  Max Jump: {route.max_jump_height_m}m | Sea Caves: {route.sea_cave_count} | Water Temp: {route.water_temp_f}°F\n"
                f"  Tide Window: {route.tide_window} | Min Depth: {route.min_water_depth_m}m\n"
                f"  Highlights: {', '.join(route.highlights)}\n"
                f"  Description: {route.description}"
            )
    else:
        routes = get_coasteering_routes(grade=intent.grade)
        lines.append(
            f"- Featured Coasteering Routes: {'; '.join(f'{r.title} ({r.coasteering_grade}, {r.region})' for r in routes)}"
        )

    return chr(10).join(lines)


def format_coasteering_response(intent: CoasteeringIntent) -> dict[str, Any]:
    if intent.action == "jump_safety":
        req = JumpSafetyRequest(
            route_id=intent.route_id or "point-lobos-granite-coves",
            jump_height_m=5.0,
            water_depth_m=4.5,
            swell_height_m=1.2,
            swell_period_seconds=12.0,
            tide_state="slack_water",
            water_aerated_with_foam=False,
        )
        plan = calculate_jump_safety(req)
        answer = (
            f"Coasteering Cliff Jump Safety Verification for {plan.route_title} ({plan.coasteering_grade}): "
            f"Safety Status: {plan.safety_status.upper()}. "
            f"Minimum Required Depth: {plan.min_required_depth_m:.1f}m (Margin: {plan.depth_margin_m:+.1f}m). "
            f"Aeration Impact: {plan.aeration_impact_notice} "
            f"Surge Timing: {plan.surge_timing_advisory} "
            f"Body Posture: {plan.body_position_guide} "
            f"Exit Strategy: {plan.exit_route_advisory}"
        )
        return {
            "answer": answer,
            "coasteering_info": {
                "action": "jump_safety",
                "safety_assessment": plan.model_dump(),
            },
        }

    if intent.action == "gear_checklist":
        gear = get_coasteering_gear()
        mandatory_names = [g.name for g in gear if g.mandatory]
        answer = (
            f"Mandatory Coasteering & Sea Cliff Safety Kit ({len(gear)} essential items): "
            + "; ".join(f"{g.name} ({g.purpose})" for g in gear)
            + ". Always wear an EN 1385 certified helmet and sticky rubber boots before entering tidal surge zones."
        )
        return {
            "answer": answer,
            "coasteering_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in gear],
                "mandatory_count": len(mandatory_names),
            },
        }

    if intent.action == "route_detail" and intent.route_id:
        route = get_coasteering_route_by_id(intent.route_id)
        if route:
            answer = (
                f"Coasteering Route Beta — {route.title} ({route.region}): "
                f"Grade: {route.coasteering_grade}, {route.distance_km} km, typical duration {route.typical_duration_hours} hours. "
                f"Max Jump: {route.max_jump_height_m}m, Sea Caves: {route.sea_cave_count}, Water Temp: {route.water_temp_f}°F. "
                f"Tide Window: {route.tide_window}, Min Landing Depth: {route.min_water_depth_m}m. "
                f"Highlights: {', '.join(route.highlights)}. {route.description}"
            )
            return {
                "answer": answer,
                "coasteering_info": {
                    "action": "route_detail",
                    "route": route.model_dump(),
                },
            }

    # Default: routes catalog
    routes = get_coasteering_routes(grade=intent.grade)
    routes_summary = "; ".join(f"{r.title} ({r.coasteering_grade}, {r.region})" for r in routes)
    answer = (
        f"Contoso Coastal Sea Cliff Coasteering Catalog ({len(routes)} routes): {routes_summary}. "
        "Ask about specific sea cliff routes, cliff jump safety calculations, swell surge timing, or our mandatory coasteering gear checklist."
    )
    return {
        "answer": answer,
        "coasteering_info": {
            "action": "routes",
            "routes": [r.model_dump() for r in routes],
        },
    }
