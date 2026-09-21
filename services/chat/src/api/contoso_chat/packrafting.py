from typing import Any, Optional

from pydantic import BaseModel


class PackraftRouteModel(BaseModel):
    route_id: str
    river_name: str
    section_name: str
    region: str
    river_miles: float
    portage_miles: float
    river_grade: str
    flow_status: str
    min_flow_cfs: int
    max_flow_cfs: int
    current_flow_cfs: int
    spraydeck_required: bool
    description: str
    portage_features: list[str]


class PackraftPlanRequest(BaseModel):
    route_id: str
    paddler_skill: str = "intermediate"
    flow_rate_cfs: Optional[int] = None
    boat_capacity_kg: float = 135.0
    total_payload_kg: float = 95.0


class PackraftPlanResponse(BaseModel):
    route_id: str
    river_and_section: str
    flow_feasibility: str
    recommended_spraydeck: str
    payload_margin_kg: float
    paddle_length_cm: int
    safety_advisory: str


class PackraftGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class PackraftingIntent(BaseModel):
    action: str  # "routes_list", "route_detail", "packraft_plan", "gear_checklist"
    route_id: Optional[str] = None
    river_grade: Optional[str] = None
    river_name: Optional[str] = None


DEFAULT_PACKRAFT_ROUTES: dict[str, PackraftRouteModel] = {
    "frank-church-middle-fork-salmon": PackraftRouteModel(
        route_id="frank-church-middle-fork-salmon",
        river_name="Middle Fork Salmon River",
        section_name="Boundary Creek to Cache Bar",
        region="Frank Church Wilderness, ID",
        river_miles=96.0,
        portage_miles=4.5,
        river_grade="class_iii_moderate",
        flow_status="optimal",
        min_flow_cfs=1200,
        max_flow_cfs=3500,
        current_flow_cfs=2100,
        spraydeck_required=True,
        description="Multi-day wilderness whitewater expedition through deep granite canyons with crystal-clear alpine water and geothermal springs.",
        portage_features=[
            "Impassable Canyon portages",
            "Hot springs camps",
            "Granite boulder garden rapids",
        ],
    ),
    "bob-marshall-south-fork-flathead": PackraftRouteModel(
        route_id="bob-marshall-south-fork-flathead",
        river_name="South Fork Flathead River",
        section_name="Meadow Creek Gorge & Upper Wilderness",
        region="Bob Marshall Wilderness, MT",
        river_miles=42.0,
        portage_miles=12.0,
        river_grade="class_ii_mild",
        flow_status="optimal",
        min_flow_cfs=800,
        max_flow_cfs=2400,
        current_flow_cfs=1450,
        spraydeck_required=False,
        description="Classic hike-in wilderness packrafting route through Montana premier wilderness with mandatory gorge portaging.",
        portage_features=[
            "Meadow Creek gorge mandatory portage",
            "Cutthroat trout pools",
            "Pack-horse trail access",
        ],
    ),
    "alaska-talkeetna-river-wilderness": PackraftRouteModel(
        route_id="alaska-talkeetna-river-wilderness",
        river_name="Talkeetna River",
        section_name="Talkeetna Deep Wilderness Traverse",
        region="Talkeetna Mountains, AK",
        river_miles=70.0,
        portage_miles=8.0,
        river_grade="class_iv_technical",
        flow_status="high_flush",
        min_flow_cfs=2000,
        max_flow_cfs=6500,
        current_flow_cfs=5200,
        spraydeck_required=True,
        description="Remote fly-in Alaskan wilderness expedition traversing continuous Class IV whitewater through a steep, committing box canyon.",
        portage_features=[
            "Talkeetna Canyon Class IV rapids",
            "Grizzly bear corridors",
            "Glacial silt hydraulics",
        ],
    ),
    "escalante-river-desert-canyon": PackraftRouteModel(
        route_id="escalante-river-desert-canyon",
        river_name="Escalante River",
        section_name="Escalante Desert Slickrock Canyons",
        region="Grand Staircase-Escalante, UT",
        river_miles=35.0,
        portage_miles=2.0,
        river_grade="class_i_flatwater",
        flow_status="low_scrape",
        min_flow_cfs=50,
        max_flow_cfs=300,
        current_flow_cfs=85,
        spraydeck_required=False,
        description="Canyon-country desert packrafting run threading sheer Navajo sandstone walls, requiring flash flood awareness and low-water scraping tolerance.",
        portage_features=[
            "Slickrock canyon narrows",
            "Beaver dam portages",
            "Desert alcove cliff camps",
        ],
    ),
    "green-river-desolation-canyon": PackraftRouteModel(
        route_id="green-river-desolation-canyon",
        river_name="Green River",
        section_name="Desolation & Gray Canyons",
        region="Tavaputs Plateau, UT",
        river_miles=84.0,
        portage_miles=1.5,
        river_grade="class_ii_mild",
        flow_status="optimal",
        min_flow_cfs=2500,
        max_flow_cfs=8000,
        current_flow_cfs=4200,
        spraydeck_required=False,
        description="Wilderness canyon expedition with rolling wave trains, remote cottonwood sandbars, and dramatic 5,000-foot carved plateau cliffs.",
        portage_features=[
            "Historic abandoned ranches",
            "Cottonwood sandbars",
            "Joe Hutch Canyon rapid",
        ],
    ),
}

DEFAULT_PACKRAFT_GEAR: list[PackraftGearRequirement] = [
    PackraftGearRequirement(
        item_id="tizip-packraft-hull",
        name="Ultralight TPU Fabric Packraft with TiZip Cargo Zipper",
        category="boat_hull",
        mandatory=True,
        purpose="Airtight internal tube gear storage lowering center of gravity and preserving deck agility in technical whitewater.",
    ),
    PackraftGearRequirement(
        item_id="breakdown-paddle-carbon",
        name="4-Piece Breakdown Carbon Packrafting Paddle",
        category="paddle",
        mandatory=True,
        purpose="Packable 4-piece breakdown design fitting inside backpack or internal hull with high-angle blade design for rapid strokes.",
    ),
    PackraftGearRequirement(
        item_id="low-profile-whitewater-pfd",
        name="USCG Type III/V Low-Profile Whitewater PFD",
        category="safety",
        mandatory=True,
        purpose="High-mobility whitewater buoyancy aid engineered for packraft seat backs and unrestricted paddling stroke clearance.",
    ),
    PackraftGearRequirement(
        item_id="nylon-inflation-bag",
        name="Ultralight Nylon Inflation Bag & Top-Off Valve",
        category="portage_cargo",
        mandatory=True,
        purpose="Pump-free manual inflation utilizing wind-catching nylon sack and screw-lock top-off pressure valve.",
    ),
    PackraftGearRequirement(
        item_id="whitewater-helmet",
        name="CE EN 1385 Certified Whitewater Helmet",
        category="safety",
        mandatory=True,
        purpose="Impact protection against shallow river boulders, canyon rockfall, and turbulence during whitewater capsizes.",
    ),
    PackraftGearRequirement(
        item_id="emergency-tpu-repair-kit",
        name="Emergency Packraft TPU Field Repair Kit",
        category="repair",
        mandatory=True,
        purpose="Instant field remediation with Aquaseal UV adhesive, Tenacious Tape patches, alcohol prep swabs, and replacement valves.",
    ),
]


def get_packraft_routes(grade: Optional[str] = None) -> list[PackraftRouteModel]:
    routes = list(DEFAULT_PACKRAFT_ROUTES.values())
    if grade:
        norm = grade.strip().lower().replace("-", "_").replace(" ", "_")
        def canonical(g: str) -> str:
            if "iv" in g or "4" in g:
                return "class_iv_technical"
            if "iii" in g or "3" in g:
                return "class_iii_moderate"
            if "ii" in g or "2" in g:
                return "class_ii_mild"
            if "i" in g or "1" in g or "flatwater" in g:
                return "class_i_flatwater"
            return g

        target = canonical(norm)
        return [r for r in routes if r.river_grade == target or target in r.river_grade]
    return routes


def get_packraft_route_by_id(route_id: str) -> Optional[PackraftRouteModel]:
    return DEFAULT_PACKRAFT_ROUTES.get(route_id.strip().lower())


def calculate_packraft_plan(req: PackraftPlanRequest) -> PackraftPlanResponse:
    route = get_packraft_route_by_id(req.route_id)
    if not route:
        raise ValueError(f"Packraft route '{req.route_id}' not found")

    flow = req.flow_rate_cfs if req.flow_rate_cfs is not None else route.current_flow_cfs

    # Flow feasibility
    if flow < route.min_flow_cfs:
        flow_feasibility = "scrape_risk"
    elif flow > route.max_flow_cfs:
        flow_feasibility = "hazardous_high"
    else:
        flow_feasibility = "navigable"

    # Spraydeck recommendation
    if route.spraydeck_required or "class_iv" in route.river_grade or "class_iii" in route.river_grade:
        recommended_spraydeck = "whitewater_deck"
    elif "class_ii" in route.river_grade:
        recommended_spraydeck = "self_bailer"
    else:
        recommended_spraydeck = "open_bucket"

    # Boat payload margin
    payload_margin_kg = round(req.boat_capacity_kg - req.total_payload_kg, 1)

    # Paddle length (cm) based on whitewater grade & boat maneuverability
    if "class_iv" in route.river_grade:
        paddle_length_cm = 205
    elif "class_iii" in route.river_grade:
        paddle_length_cm = 210
    elif "class_ii" in route.river_grade:
        paddle_length_cm = 215
    else:
        paddle_length_cm = 220

    # Build safety advisory
    advisory_parts = []
    if flow_feasibility == "scrape_risk":
        advisory_parts.append(
            f"River flow is {flow} cfs, below minimum runnable flow of {route.min_flow_cfs} cfs (scrape risk). "
            f"Expect frequent bottom scraping, exposed boulder bars, and mandatory walking portages."
        )
    elif flow_feasibility == "hazardous_high":
        advisory_parts.append(
            f"River flow is {flow} cfs, exceeding maximum safe threshold of {route.max_flow_cfs} cfs (hazardous high). "
            f"Violent hydraulics, washed-out eddies, and debris strainers present severe hazards."
        )
    else:
        advisory_parts.append(
            f"River flow is {flow} cfs, within optimal runnable range ({route.min_flow_cfs}-{route.max_flow_cfs} cfs, navigable)."
        )

    deck_display = recommended_spraydeck.replace("_", " ").title()
    grade_display = route.river_grade.replace("_", " ")
    advisory_parts.append(
        f"Recommended spraydeck: {deck_display} for {grade_display} conditions."
    )

    if payload_margin_kg < 0:
        advisory_parts.append(
            f"DANGER: Boat is overloaded by {abs(payload_margin_kg)} kg! Payload ({req.total_payload_kg} kg) exceeds boat capacity ({req.boat_capacity_kg} kg)."
        )
    elif payload_margin_kg < 20:
        advisory_parts.append(
            f"Caution: Narrow payload safety margin of {payload_margin_kg} kg. Store heavy gear inside TiZip internal cargo tubes."
        )
    else:
        advisory_parts.append(
            f"Payload safety margin is adequate at {payload_margin_kg} kg."
        )

    if req.paddler_skill.lower() == "beginner" and ("class_iii" in route.river_grade or "class_iv" in route.river_grade):
        advisory_parts.append(
            f"Warning: {grade_display.title()} rapids demand advanced self-rescue and combat roll capabilities."
        )

    safety_advisory = " ".join(advisory_parts)

    return PackraftPlanResponse(
        route_id=route.route_id,
        river_and_section=f"{route.river_name} — {route.section_name}",
        flow_feasibility=flow_feasibility,
        recommended_spraydeck=recommended_spraydeck,
        payload_margin_kg=payload_margin_kg,
        paddle_length_cm=paddle_length_cm,
        safety_advisory=safety_advisory,
    )


def get_packraft_gear() -> list[PackraftGearRequirement]:
    return list(DEFAULT_PACKRAFT_GEAR)


def detect_packrafting_intent(query: str) -> Optional[PackraftingIntent]:
    q = query.lower()

    # Domain disambiguation keywords - at least one must be present
    packraft_keywords = [
        "packraft",
        "packrafting",
        "pack raft",
        "breakdown paddle",
        "tizip cargo",
        "inflation bag packraft",
        "middle fork salmon packraft",
        "south fork flathead packraft",
        "talkeetna river packraft",
        "escalante packraft",
        "desolation canyon packraft",
    ]

    if not any(k in q for k in packraft_keywords):
        return None

    # Exclusions for unrelated domains
    if any(
        w in q
        for w in [
            "refund",
            "order #",
            "return label",
            "climbing shoe",
            "water filter",
            "water purification",
            "filtration",
            "ski tour",
            "splitboard",
            "skin track",
            "avalanche danger",
            "snowpack",
            "fire ban",
        ]
    ):
        return None

    # Identify route
    route_id = None
    river_name = None
    if any(k in q for k in ["middle fork salmon", "frank church"]):
        route_id = "frank-church-middle-fork-salmon"
        river_name = "Middle Fork Salmon River"
    elif any(k in q for k in ["south fork flathead", "bob marshall", "meadow creek"]):
        route_id = "bob-marshall-south-fork-flathead"
        river_name = "South Fork Flathead River"
    elif "talkeetna" in q:
        route_id = "alaska-talkeetna-river-wilderness"
        river_name = "Talkeetna River"
    elif "escalante" in q:
        route_id = "escalante-river-desert-canyon"
        river_name = "Escalante River"
    elif any(k in q for k in ["desolation", "gray canyon", "green river"]):
        route_id = "green-river-desolation-canyon"
        river_name = "Green River"

    # Identify river grade
    river_grade = None
    if any(k in q for k in ["class iv", "class 4", "technical"]):
        river_grade = "class_iv_technical"
    elif any(k in q for k in ["class iii", "class 3", "moderate"]):
        river_grade = "class_iii_moderate"
    elif any(k in q for k in ["class ii", "class 2", "mild"]):
        river_grade = "class_ii_mild"
    elif any(k in q for k in ["class i", "class 1", "flatwater"]):
        river_grade = "class_i_flatwater"

    # Determine action
    if any(
        k in q
        for k in [
            "calculate",
            "plan",
            "flow cfs",
            "flow rate",
            "payload",
            "capacity",
            "margin",
            "cfs safe",
            "spraydeck for packraft",
            "spraydeck",
            "feasibility",
            "paddle length",
        ]
    ):
        action = "packraft_plan"
    elif any(
        k in q
        for k in [
            "gear",
            "checklist",
            "kit",
            "equipment",
            "compliance",
            "tizip",
            "inflation bag",
            "repair kit",
            "tpu",
        ]
    ):
        action = "gear_checklist"
    elif route_id and any(
        k in q
        for k in [
            "detail",
            "about",
            "tell me about",
            "portage",
            "miles",
            "section",
            "route details",
        ]
    ):
        action = "route_detail"
    elif any(k in q for k in ["routes", "catalog", "rivers", "expeditions", "options", "offer"]):
        action = "routes_list"
    elif route_id:
        action = "route_detail"
    else:
        action = "routes_list"

    return PackraftingIntent(
        action=action,
        route_id=route_id,
        river_grade=river_grade,
        river_name=river_name,
    )


def build_packrafting_prompt(intent: PackraftingIntent) -> str:
    lines = ["Backcountry Packrafting & River Expedition Outfitting Tooling:"]

    if intent.route_id:
        route = get_packraft_route_by_id(intent.route_id)
        if route:
            lines.append(
                f"- Expedition Route: {route.river_name} — {route.section_name} ({route.region})\n"
                f"  Difficulty: {route.river_grade} | Distance: {route.river_miles} river mi, {route.portage_miles} portage mi\n"
                f"  Flow: {route.current_flow_cfs} cfs (Status: {route.flow_status}, Runnable: {route.min_flow_cfs}-{route.max_flow_cfs} cfs)\n"
                f"  Spraydeck: {'Mandatory' if route.spraydeck_required else 'Optional'}\n"
                f"  Description: {route.description}\n"
                f"  Key Features: {'; '.join(route.portage_features)}"
            )
    elif intent.river_grade:
        routes = get_packraft_routes(grade=intent.river_grade)
        lines.append(
            f"- Matching {intent.river_grade} Packrafting Expeditions: {', '.join(r.river_name for r in routes)}"
        )
    else:
        routes = get_packraft_routes()
        formatted_routes = [f"{r.river_name} ({r.river_grade}, {r.current_flow_cfs} cfs)" for r in routes]
        lines.append(
            f"- Available Packrafting Expeditions: {', '.join(formatted_routes)}"
        )

    lines.extend(
        [
            "- Mandatory Ultralight Packrafting Kit Compliance:",
            "  1. TiZip Cargo Hull: Internal tube zipper for low-center-of-gravity gear packing.",
            "  2. 4-Piece Breakdown Paddle: Sized 205-220 cm for high-angle packraft control.",
            "  3. Low-Profile PFD: USCG Type III/V buoyancy aid fitted for back-band clearance.",
            "  4. Inflation Bag: Ultralight nylon roll-top pump bag for rapid riverside inflation.",
            "  5. Whitewater Helmet: CE EN 1385 certified cranial impact protection.",
            "  6. Emergency TPU Repair Kit: Aquaseal UV, Tenacious Tape, and valve seals.",
            "- Boat Capacity & Payload Safety Margin: Always reserve at least 20-30% boat weight capacity for freeboard and stability in turbulent current.",
        ]
    )

    return "\n".join(lines)


def format_packrafting_response(intent: PackraftingIntent) -> dict[str, Any]:
    if intent.action == "packraft_plan":
        target_route_id = intent.route_id or "frank-church-middle-fork-salmon"
        try:
            req = PackraftPlanRequest(route_id=target_route_id)
            plan_res = calculate_packraft_plan(req)
            deck_name = plan_res.recommended_spraydeck.replace("_", " ").title()
            answer = (
                f"Packrafting Expedition Plan for {plan_res.river_and_section}: "
                f"Flow feasibility is {plan_res.flow_feasibility.upper()}. "
                f"Recommended spraydeck configuration: {deck_name}. "
                f"Payload safety margin: {plan_res.payload_margin_kg} kg with a {plan_res.paddle_length_cm} cm breakdown paddle. "
                f"{plan_res.safety_advisory}"
            )
            return {
                "answer": answer,
                "packrafting_info": {
                    "action": "packraft_plan",
                    "plan": plan_res.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "route_detail" and intent.route_id:
        route = get_packraft_route_by_id(intent.route_id)
        if route:
            grade_name = route.river_grade.replace("_", " ").title()
            answer = (
                f"Wilderness Packraft Route: {route.river_name} — {route.section_name} ({route.region}). "
                f"Grade: {grade_name} | Distance: {route.river_miles} river miles, {route.portage_miles} portage miles. "
                f"Flow: {route.current_flow_cfs} cfs ({route.flow_status}, runnable range {route.min_flow_cfs}-{route.max_flow_cfs} cfs). "
                f"Spraydeck Required: {'Yes' if route.spraydeck_required else 'No'}. "
                f"{route.description} Key features: {', '.join(route.portage_features)}."
            )
            return {
                "answer": answer,
                "packrafting_info": {
                    "action": "route_detail",
                    "route": route.model_dump(),
                },
            }

    if intent.action == "gear_checklist":
        gear = get_packraft_gear()
        gear_names = "; ".join(f"{g.name} ({g.purpose})" for g in gear[:3])
        answer = (
            f"Mandatory Ultralight Packrafting Kit Checklist: {gear_names}; "
            f"plus {', '.join(g.name for g in gear[3:])}. "
            "Ensure TiZip cargo zippers are clean and lubricated before river expeditions."
        )
        return {
            "answer": answer,
            "packrafting_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in gear],
            },
        }

    # Default: routes_list
    routes = get_packraft_routes(grade=intent.river_grade)
    routes_summary = "; ".join(
        f"{r.river_name} ({r.river_grade}, {r.current_flow_cfs} cfs)" for r in routes
    )
    answer = (
        f"Wilderness Backcountry Packrafting Expeditions: {routes_summary}. "
        "Each route includes portage distances, river flow status, and required spraydeck configurations."
    )
    return {
        "answer": answer,
        "packrafting_info": {
            "action": "routes_list",
            "routes": [r.model_dump() for r in routes],
        },
    }
