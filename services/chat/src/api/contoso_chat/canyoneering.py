from typing import Any, Optional

from pydantic import BaseModel


class SlotCanyonRouteModel(BaseModel):
    route_id: str
    canyon_name: str
    route_name: str
    region: str
    technical_grade: str
    flash_flood_risk: str
    max_rappel_ft: int
    number_of_rappels: int
    longest_rappel_ft: int
    wetsuit_thickness_mm: int
    typical_duration_hours: float
    description: str
    anchor_features: list[str]


class RopeRiggingRequest(BaseModel):
    route_id: str
    team_size: int = 4
    rope_diameter_mm: float = 9.0
    pull_cord_type: str = "dedicated_pull_line"
    water_immersion_level: str = "pothole_swimming"


class RopeRiggingResponse(BaseModel):
    route_id: str
    canyon_and_route: str
    rope_length_ft: int
    pull_cord_length_ft: int
    rigging_anchor_system: str
    rigging_status: str
    neoprene_spec: str
    safety_advisory: str


class CanyoneeringGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class CanyoneeringIntent(BaseModel):
    action: str  # "routes_list", "route_detail", "rigging_plan", "gear_checklist"
    route_id: Optional[str] = None
    technical_grade: Optional[str] = None
    canyon_name: Optional[str] = None


DEFAULT_CANYON_ROUTES: dict[str, SlotCanyonRouteModel] = {
    "zion-subway-left-fork": SlotCanyonRouteModel(
        route_id="zion-subway-left-fork",
        canyon_name="The Subway (Left Fork of North Creek)",
        route_name="Left Fork Technical Descent",
        region="Zion National Park, UT",
        technical_grade="class_3b",
        flash_flood_risk="moderate",
        max_rappel_ft=30,
        number_of_rappels=3,
        longest_rappel_ft=30,
        wetsuit_thickness_mm=4,
        typical_duration_hours=7.0,
        description="Iconic Zion slot canyon descent through tubular sandstone corridors, cold water pothole swims, and the famous Subway formation.",
        anchor_features=[
            "Cold water pothole swims",
            "Keyhole bowling ball rappel",
            "Emerald pools cascade",
        ],
    ),
    "zion-mystery-canyon": SlotCanyonRouteModel(
        route_id="zion-mystery-canyon",
        canyon_name="Mystery Canyon Technical Descent",
        route_name="Mystery Canyon Technical Descent",
        region="Zion National Park, UT",
        technical_grade="class_3b",
        flash_flood_risk="moderate",
        max_rappel_ft=120,
        number_of_rappels=12,
        longest_rappel_ft=120,
        wetsuit_thickness_mm=3,
        typical_duration_hours=8.0,
        description="Spectacular multi-rappel canyon featuring sustained drops down fluted gullies, cold pools, and a breathtaking 120ft terminal waterfall into The Narrows.",
        anchor_features=[
            "Mystery Springs rappel",
            "Terminal waterfall into The Narrows",
            "Natural webbing slings",
        ],
    ),
    "escalante-choprock-canyon": SlotCanyonRouteModel(
        route_id="escalante-choprock-canyon",
        canyon_name="Choprock Canyon Deep Slot",
        route_name="Choprock Canyon Deep Slot",
        region="Grand Staircase-Escalante, UT",
        technical_grade="class_4b",
        flash_flood_risk="high",
        max_rappel_ft=80,
        number_of_rappels=7,
        longest_rappel_ft=80,
        wetsuit_thickness_mm=5,
        typical_duration_hours=11.0,
        description="Grueling, committing expedition through one of the longest and darkest sandstone narrows in the Southwest with formidable keeper potholes.",
        anchor_features=[
            "Log jam natural anchors",
            "Grim keeper potholes",
            "Serrated sandstone flute anchors",
        ],
    ),
    "san-rafael-black-hole": SlotCanyonRouteModel(
        route_id="san-rafael-black-hole",
        canyon_name="The Black Hole of White Canyon",
        route_name="Black Hole Gorge Descent",
        region="San Rafael Swell, UT",
        technical_grade="class_3c",
        flash_flood_risk="high",
        max_rappel_ft=40,
        number_of_rappels=2,
        longest_rappel_ft=40,
        wetsuit_thickness_mm=5,
        typical_duration_hours=5.0,
        description="Cold, dark gorge with sustained frigid swims through stagnant water channels and scoured sandstone slots subject to violent flash flooding.",
        anchor_features=[
            "Sustained frigid gorge swim",
            "Fluted sculpted walls",
            "Boulder choke bypass",
        ],
    ),
    "robbers-roost-bluejohn": SlotCanyonRouteModel(
        route_id="robbers-roost-bluejohn",
        canyon_name="Bluejohn Canyon Squeeze Fork",
        route_name="Bluejohn Canyon Squeeze Fork",
        region="Robbers Roost, UT",
        technical_grade="class_3a",
        flash_flood_risk="low",
        max_rappel_ft=90,
        number_of_rappels=5,
        longest_rappel_ft=90,
        wetsuit_thickness_mm=0,
        typical_duration_hours=9.0,
        description="Historic remote maze of tight sandstone squeeze slots made famous by Aron Ralston, culminating in a dramatic 90ft final rappel into the main fork.",
        anchor_features=[
            "Squeeze slot chimneying",
            "Terminal 90ft dry drop",
            "Chockstone deadman anchors",
        ],
    ),
}

DEFAULT_CANYON_GEAR: list[CanyoneeringGearRequirement] = [
    CanyoneeringGearRequirement(
        item_id="canyon-harness-seat",
        name="CE Certified Canyoneering Harness with Protective PVC Scuff Guard Seat",
        category="harness_rigging",
        mandatory=True,
        purpose="Protects harness webbing and climber seat from abrasive sandstone friction during chimneying, downclimbing, and wet rappels.",
    ),
    CanyoneeringGearRequirement(
        item_id="static-canyon-rope",
        name="8.3mm - 9.2mm Hydrophobic Static Canyoneering Rope",
        category="rope_hardware",
        mandatory=True,
        purpose="Low-elongation hydrophobic static line that resists water weight absorption and sharp sandstone edge abrasion.",
    ),
    CanyoneeringGearRequirement(
        item_id="variable-friction-descender",
        name="Figure-8 / Pirana / Totem Variable-Friction Descender",
        category="rope_hardware",
        mandatory=True,
        purpose="Allows rapid adjustment of friction settings for wet ropes, heavy packs, and variable rope diameters without unhooking from the harness.",
    ),
    CanyoneeringGearRequirement(
        item_id="sealed-neoprene-wetsuit",
        name="4mm - 5mm Sealed Neoprene Full Canyoneering Wetsuit",
        category="thermal_protection",
        mandatory=True,
        purpose="Essential hypothermia defense with glued and blind-stitched seams for prolonged immersion in sunless slot canyon pools.",
    ),
    CanyoneeringGearRequirement(
        item_id="canyon-helmet",
        name="EN 12492 Certified Sandstone Canyoning Helmet with Drain Vents",
        category="safety",
        mandatory=True,
        purpose="Protects against overhead rockfall dislodged by rope pulls and incorporates drainage ports for turbulent hydraulic immersion.",
    ),
    CanyoneeringGearRequirement(
        item_id="pothole-escape-kit",
        name="Technical Pothole Escape Kit (Pot-Shots, Cheater Stick & Etrier)",
        category="pot_hole_escape",
        mandatory=True,
        purpose="Facilitates ascending out of scoured keeper potholes using thrown sand-filled pot-shots, telescoping cheater hooks, and Dyneema etrier ladders.",
    ),
]


def get_canyon_routes(grade: Optional[str] = None) -> list[SlotCanyonRouteModel]:
    routes = list(DEFAULT_CANYON_ROUTES.values())
    if grade:
        norm = grade.strip().lower().replace("-", "_").replace(" ", "_")

        def canonical(g: str) -> str:
            if "4c" in g:
                return "class_4c"
            if "4b" in g:
                return "class_4b"
            if "4a" in g:
                return "class_4a"
            if "3c" in g:
                return "class_3c"
            if "3b" in g:
                return "class_3b"
            if "3a" in g:
                return "class_3a"
            if "4" in g:
                return "class_4"
            if "3" in g:
                return "class_3"
            return g

        target = canonical(norm)
        return [r for r in routes if r.technical_grade == target or target in r.technical_grade]
    return routes


def get_canyon_route_by_id(route_id: str) -> Optional[SlotCanyonRouteModel]:
    return DEFAULT_CANYON_ROUTES.get(route_id.strip().lower())


def calculate_rope_rigging_plan(req: RopeRiggingRequest) -> RopeRiggingResponse:
    route = get_canyon_route_by_id(req.route_id)
    if not route:
        raise ValueError(f"Slot canyon route '{req.route_id}' not found")

    pull_type = req.pull_cord_type.strip().lower()
    if pull_type == "dual_rope_system":
        rope_length_ft = route.longest_rappel_ft * 2
        pull_cord_length_ft = 0
        rigging_anchor_system = "Doubled rope isolated twin anchor with Alpine Butterfly block"
    elif pull_type == "fiddle_stick_retrievable":
        rope_length_ft = route.longest_rappel_ft + 15
        pull_cord_length_ft = route.longest_rappel_ft + 15
        rigging_anchor_system = "FiddleStick retrievable toggle anchor on courtesy webbing sling"
    else:
        rope_length_ft = route.longest_rappel_ft + 15
        pull_cord_length_ft = route.longest_rappel_ft + 15
        rigging_anchor_system = "Releasable contingency block (Figure-8 block / MMO) with dedicated pull line"

    # Rigging status evaluation
    immersion = req.water_immersion_level.strip().lower()
    if (route.flash_flood_risk in ("high", "extreme_imminent") and immersion == "flowing_water") or req.rope_diameter_mm < 8.0:
        rigging_status = "critical_hazard"
    elif route.technical_grade.startswith("class_4") or req.team_size > 5 or immersion == "flowing_water" or route.flash_flood_risk == "high":
        rigging_status = "caution"
    else:
        rigging_status = "safe"

    # Neoprene thermal spec
    if immersion == "dry" and route.wetsuit_thickness_mm == 0:
        neoprene_spec = "No wetsuit required (dry canyon); quick-dry synthetic layers recommended"
    else:
        thickness = max(route.wetsuit_thickness_mm, 4 if immersion == "pothole_swimming" else (5 if immersion == "flowing_water" else 3))
        neoprene_spec = f"{thickness}mm glued and blind-stitched sealed full wetsuit with 3mm neoprene socks"

    # Safety advisory
    advisories = [
        f"Longest rappel is {route.longest_rappel_ft} ft across {route.number_of_rappels} total rappels. Primary rope length: {rope_length_ft} ft{' (doubled for dual rope retrieval)' if pull_type == 'dual_rope_system' else ''}."
    ]
    if pull_type == "fiddle_stick_retrievable":
        advisories.append(
            "FiddleStick system requires setting the toggle on the non-load strand, clear rope track verification, and a test pull before the last person descends."
        )
    elif pull_type == "dual_rope_system":
        advisories.append(
            "Dual rope system eliminates pull-cord tangles in high-friction slots but doubles pack weight; ensure rope ends are knotted before dropping."
        )
    else:
        advisories.append(
            f"Dedicated {pull_cord_length_ft} ft pull line must be tied with a square knot / flat overhand to the retrieval strand with a contingency block at the station."
        )

    advisories.append(
        f"Flash flood risk for {route.canyon_name} is {route.flash_flood_risk.upper()}. Slot canyons offer zero lateral escape once committed inside the narrows. Always check upstream radar within the watershed before entering."
    )

    if req.team_size > 5:
        advisories.append("Warning: Large team size (>5) causes severe delays at multi-stage rappel stations and cold-water queues.")

    if any("keeper" in f.lower() for f in route.anchor_features):
        advisories.append("Warning: Route contains keeper potholes requiring a pothole escape kit (pot-shots, cheater stick, etrier).")

    if rigging_status == "critical_hazard":
        advisories.append("CRITICAL HAZARD: Active flowing water combined with high flash flood risk presents lethal entrapment conditions.")

    safety_advisory = " ".join(advisories)

    return RopeRiggingResponse(
        route_id=route.route_id,
        canyon_and_route=f"{route.canyon_name} — {route.route_name}",
        rope_length_ft=rope_length_ft,
        pull_cord_length_ft=pull_cord_length_ft,
        rigging_anchor_system=rigging_anchor_system,
        rigging_status=rigging_status,
        neoprene_spec=neoprene_spec,
        safety_advisory=safety_advisory,
    )


def get_canyoneering_gear() -> list[CanyoneeringGearRequirement]:
    return list(DEFAULT_CANYON_GEAR)


def detect_canyoneering_intent(query: str) -> Optional[CanyoneeringIntent]:
    q = query.lower()

    # Domain disambiguation keywords - at least one must be present
    canyoneering_keywords = [
        "canyoneering",
        "slot canyon",
        "technical canyon",
        "rappel station",
        "pothole escape",
        "subway zion",
        "mystery canyon",
        "choprock canyon",
        "black hole white canyon",
        "bluejohn canyon",
        "canyoneering harness",
        "canyon descender",
        "fiddle stick",
        "canyon wetsuit",
        "fiddle-stick",
        "fiddlestick",
        "canyon rappel",
        "longest drop rope",
        "slot canyon rappel",
    ]

    if not any(k in q for k in canyoneering_keywords):
        return None

    # Exclusions for unrelated domains
    exclusions = [
        "refund",
        "order #",
        "return label",
        "climbing shoe",
        "climbing crag",
        "sport climbing",
        "trad climbing",
        "rock climbing",
        "packraft",
        "packrafting",
        "mountaineering",
        "glacier",
        "crevasse",
        "ice axe",
        "crampon",
        "whitewater",
        "kayak",
        "sea kayak",
        "ski tour",
        "splitboard",
        "avalanche",
        "fly fishing",
        "foraging",
        "stargazing",
        "hot spring",
        "bikepacking",
        "water filter",
        "water purification",
        "filtration",
        "campfire",
    ]
    if any(w in q for w in exclusions):
        return None

    # Identify route
    route_id = None
    canyon_name = None
    if any(k in q for k in ["subway", "left fork of north creek"]):
        route_id = "zion-subway-left-fork"
        canyon_name = "The Subway (Left Fork of North Creek)"
    elif any(k in q for k in ["mystery canyon", "mystery"]):
        route_id = "zion-mystery-canyon"
        canyon_name = "Mystery Canyon"
    elif any(k in q for k in ["choprock", "choprock canyon"]):
        route_id = "escalante-choprock-canyon"
        canyon_name = "Choprock Canyon"
    elif any(k in q for k in ["black hole", "white canyon"]):
        route_id = "san-rafael-black-hole"
        canyon_name = "The Black Hole of White Canyon"
    elif any(k in q for k in ["bluejohn", "blue john"]):
        route_id = "robbers-roost-bluejohn"
        canyon_name = "Bluejohn Canyon"

    # Identify technical grade
    technical_grade = None
    if any(k in q for k in ["class 4b", "class_4b", "4b"]):
        technical_grade = "class_4b"
    elif any(k in q for k in ["class 4c", "class_4c", "4c"]):
        technical_grade = "class_4c"
    elif any(k in q for k in ["class 4a", "class_4a", "4a", "class 4"]):
        technical_grade = "class_4a"
    elif any(k in q for k in ["class 3c", "class_3c", "3c"]):
        technical_grade = "class_3c"
    elif any(k in q for k in ["class 3b", "class_3b", "3b"]):
        technical_grade = "class_3b"
    elif any(k in q for k in ["class 3a", "class_3a", "3a", "class 3"]):
        technical_grade = "class_3a"

    # Determine action
    if any(
        k in q
        for k in [
            "rigging",
            "rigging plan",
            "rope length",
            "calculate",
            "pull cord",
            "longest drop",
            "fiddle stick retrieval",
            "fiddlestick",
            "plan",
        ]
    ):
        action = "rigging_plan"
    elif any(
        k in q
        for k in [
            "gear",
            "checklist",
            "kit",
            "equipment",
            "compliance",
            "harness",
            "descender",
            "pothole escape kit",
            "wetsuit thickness",
        ]
    ):
        action = "gear_checklist"
    elif route_id and any(
        k in q
        for k in [
            "detail",
            "about",
            "tell me about",
            "rappels",
            "longest rappel",
            "route details",
        ]
    ):
        action = "route_detail"
    elif any(k in q for k in ["routes", "catalog", "canyons", "slots", "options", "list", "offer"]):
        action = "routes_list"
    elif route_id:
        action = "route_detail"
    else:
        action = "routes_list"

    return CanyoneeringIntent(
        action=action,
        route_id=route_id,
        technical_grade=technical_grade,
        canyon_name=canyon_name,
    )


def build_canyoneering_prompt(intent: CanyoneeringIntent) -> str:
    lines = ["Alpine Canyoneering & Technical Slot Canyon Outfitting Tooling:"]

    if intent.route_id:
        route = get_canyon_route_by_id(intent.route_id)
        if route:
            lines.append(
                f"- Slot Canyon Route: {route.canyon_name} — {route.route_name} ({route.region})\n"\
                f"  Technical Grade: {route.technical_grade} | Flash Flood Risk: {route.flash_flood_risk}\n"\
                f"  Rappels: {route.number_of_rappels} (Longest: {route.longest_rappel_ft} ft, Max: {route.max_rappel_ft} ft)\n"\
                f"  Wetsuit Thickness: {route.wetsuit_thickness_mm} mm | Typical Duration: {route.typical_duration_hours} hrs\n"\
                f"  Description: {route.description}\n"\
                f"  Anchor & Route Features: {'; '.join(route.anchor_features)}"
            )
    elif intent.technical_grade:
        routes = get_canyon_routes(grade=intent.technical_grade)
        lines.append(
            f"- Matching {intent.technical_grade} Slot Canyon Routes: {', '.join(r.canyon_name for r in routes)}"
        )
    else:
        routes = get_canyon_routes()
        formatted_routes = [f"{r.canyon_name} ({r.technical_grade}, {r.longest_rappel_ft}ft drop)" for r in routes]
        lines.append(
            f"- Available Slot Canyon Expeditions: {', '.join(formatted_routes)}"
        )

    lines.extend(
        [
            "- Mandatory Technical Canyoneering Kit Compliance:",
            "  1. Canyoneering Harness with Protective PVC Scuff Guard Seat.",
            "  2. 8.3mm-9.2mm Hydrophobic Static Canyoneering Rope.",
            "  3. Figure-8 / Pirana / Totem Variable-Friction Descender.",
            "  4. 4mm-5mm Sealed Neoprene Full Canyoneering Wetsuit.",
            "  5. EN 12492 Certified Sandstone Canyoning Helmet with Drain Vents.",
            "  6. Technical Pothole Escape Kit (Pot-Shots, Cheater Stick & Etrier).",
            "- Rigging & Hydrology Principles: Always verify rope retrieval before sending the last canyoneer down; test pull cord friction and monitor flash flood hydrology upstream in the drainage basin.",
        ]
    )

    return "\n".join(lines)


def format_canyoneering_response(intent: CanyoneeringIntent) -> dict[str, Any]:
    if intent.action == "rigging_plan":
        target_route_id = intent.route_id or "zion-subway-left-fork"
        try:
            req = RopeRiggingRequest(route_id=target_route_id)
            plan_res = calculate_rope_rigging_plan(req)
            answer = (
                f"Canyoneering Rigging & Hydrology Plan for {plan_res.canyon_and_route}: "
                f"Rigging status is {plan_res.rigging_status.upper()}. "
                f"Recommended primary rope length: {plan_res.rope_length_ft} ft with {plan_res.pull_cord_length_ft} ft pull cord. "
                f"Anchor system: {plan_res.rigging_anchor_system}. "
                f"Thermal protection: {plan_res.neoprene_spec}. "
                f"{plan_res.safety_advisory}"
            )
            return {
                "answer": answer,
                "canyoneering_info": {
                    "action": "rigging_plan",
                    "plan": plan_res.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "route_detail" and intent.route_id:
        route = get_canyon_route_by_id(intent.route_id)
        if route:
            grade_name = route.technical_grade.replace("_", " ").title()
            answer = (
                f"Slot Canyon Route: {route.canyon_name} ({route.region}). "
                f"Grade: {grade_name} | Flash Flood Risk: {route.flash_flood_risk.upper()}. "
                f"Rappels: {route.number_of_rappels} drops (longest {route.longest_rappel_ft} ft). "
                f"Wetsuit: {route.wetsuit_thickness_mm}mm neoprene recommended. Duration: ~{route.typical_duration_hours} hrs. "
                f"{route.description} Key features: {', '.join(route.anchor_features)}."
            )
            return {
                "answer": answer,
                "canyoneering_info": {
                    "action": "route_detail",
                    "route": route.model_dump(),
                },
            }

    if intent.action == "gear_checklist":
        gear = get_canyoneering_gear()
        gear_names = "; ".join(f"{g.name} ({g.purpose})" for g in gear[:3])
        answer = (
            f"Mandatory Technical Canyoneering Kit Checklist: {gear_names}; "
            f"plus {', '.join(g.name for g in gear[3:])}. "
            "Inspect PVC seat harness and verify watertight seal on dry bags before descent."
        )
        return {
            "answer": answer,
            "canyoneering_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in gear],
            },
        }

    # Default: routes_list
    routes = get_canyon_routes(grade=intent.technical_grade)
    routes_summary = "; ".join(
        f"{r.canyon_name} ({r.technical_grade}, {r.longest_rappel_ft}ft drop)" for r in routes
    )
    answer = (
        f"Premier Technical Slot Canyon Routes: {routes_summary}. "
        "Each route includes rappel counts, longest drop heights, flash flood risk assessments, and required wetsuit thermal specs."
    )
    return {
        "answer": answer,
        "canyoneering_info": {
            "action": "routes_list",
            "routes": [r.model_dump() for r in routes],
        },
    }
