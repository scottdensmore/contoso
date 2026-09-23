import re
from typing import Any, Optional

from pydantic import BaseModel, Field


class BigWallRouteModel(BaseModel):
    id: str
    name: str
    location: str
    grade: str
    aid_rating: str
    pitches: int
    height_meters: int
    recommended_days: int
    typical_pig_weight_kg: float
    description: str
    highlights: list[str] = Field(default_factory=list)


class HaulCalculationRequest(BaseModel):
    route_id: Optional[str] = None
    pig_weight_kg: float = 70.0
    haul_system: str = "2:1_mechanical_advantage"
    wall_angle: str = "vertical"
    climber_weight_kg: float = 75.0


class HaulCalculationResponse(BaseModel):
    route_name: Optional[str] = None
    effective_pull_force_kg: float
    mechanical_advantage_ratio: float
    friction_coefficient: float
    counterweight_sufficient: bool
    haul_effort_level: str
    recommended_technique: str
    safety_warning: Optional[str] = None


class BigWallGearRequirement(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool
    description: str


class BigWallIntent(BaseModel):
    intent_detected: bool = True
    route_id: Optional[str] = None
    action: str = "routes_list"
    confidence: float = 1.0


class FormattedBigWallResponse(str):
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


DEFAULT_BIG_WALL_ROUTES: dict[str, BigWallRouteModel] = {
    "el-capitan-nose": BigWallRouteModel(
        id="el-capitan-nose",
        name="The Nose — El Capitan",
        location="Yosemite Valley, CA",
        grade="Grade VI 5.9 C2",
        aid_rating="C2",
        pitches=31,
        height_meters=1000,
        recommended_days=4,
        typical_pig_weight_kg=85.0,
        description="The world's most famous big wall line featuring Boot Flake, the King Swing, and the Great Roof.",
        highlights=[
            "King Swing pendulum",
            "Great Roof thin seam aid",
            "Camp 4 and Camp 6 natural bivvies",
        ],
    ),
    "half-dome-regular-northwest": BigWallRouteModel(
        id="half-dome-regular-northwest",
        name="Regular Northwest Face — Half Dome",
        location="Yosemite Valley, CA",
        grade="Grade VI 5.9 C1",
        aid_rating="C1",
        pitches=23,
        height_meters=670,
        recommended_days=2,
        typical_pig_weight_kg=55.0,
        description="Classic sheer granite face requiring clean aid placements, chimney squeezing, and portaledge or bivy ledge camping.",
        highlights=[
            "Robbins Traverse",
            "Zig-Zags clean aid pitches",
            "Thank God Ledge",
        ],
    ),
    "fisher-towers-titan": BigWallRouteModel(
        id="fisher-towers-titan",
        name="The Titan — Finger of Fate",
        location="Moab, UT",
        grade="Grade V 5.8 A2+",
        aid_rating="A2+",
        pitches=4,
        height_meters=275,
        recommended_days=2,
        typical_pig_weight_kg=45.0,
        description="The largest freestanding sandstone tower in the US, known for bizarre mud curtains, soft sandstone, and serious nailing aid.",
        highlights=[
            "Mud curtain aid placements",
            "Fragile sandstone anchor rigging",
            "Free-hanging summit portaledge bivouac",
        ],
    ),
    "zion-prodigal-son": BigWallRouteModel(
        id="zion-prodigal-son",
        name="Prodigal Son — Angel's Landing",
        location="Zion National Park, UT",
        grade="Grade V 5.8 C2",
        aid_rating="C2",
        pitches=8,
        height_meters=360,
        recommended_days=2,
        typical_pig_weight_kg=50.0,
        description="Spectacular desert big wall rising above the Virgin River with steep cracks, aid seams, and sheer sandstone exposures.",
        highlights=[
            "Virgin River canyon exposure",
            "Sandstone hook moves",
            "Bivouac hanging above Angel's Landing",
        ],
    ),
    "leaning-tower-west-face": BigWallRouteModel(
        id="leaning-tower-west-face",
        name="West Face — Leaning Tower",
        location="Yosemite Valley, CA",
        grade="Grade V 5.7 C2F",
        aid_rating="C2F",
        pitches=11,
        height_meters=365,
        recommended_days=2,
        typical_pig_weight_kg=60.0,
        description="One of the steepest rock faces in North America, continuously overhanging 110 degrees for incredible free-hanging hauls and portaledge camping.",
        highlights=[
            "Continuously overhanging wall",
            "Completely free-hanging haul line",
            "Awahnee Ledge portaledge setup",
        ],
    ),
}

DEFAULT_BIG_WALL_GEAR: list[BigWallGearRequirement] = [
    BigWallGearRequirement(
        id="full-portaledge-storm-fly",
        name="Heavy-Duty Expedition Portaledge & Sealed Storm Fly",
        category="portaledge",
        mandatory=True,
        description="Extruded aircraft aluminum frame with tensioned ballistic bed, master suspension fin, and taped storm fly with integrated air vents.",
    ),
    BigWallGearRequirement(
        id="progress-capture-hauling-pulley",
        name="Progress-Capture Hauling Pulley (Pro Traxion Rig)",
        category="hauling",
        mandatory=True,
        description="High-efficiency 38mm toothed cam capture pulley rated for 2.5kN working load in 2:1 or 3:1 Z-pulley mechanical advantage hauling systems.",
    ),
    BigWallGearRequirement(
        id="adjustable-daisy-chains-etriers",
        name="Pair of 8-Step Ladder Etriers & Adjustable Daisies",
        category="aid_ladders",
        mandatory=True,
        description="Reinforced 8-step nylon stirrups with spreader bars paired with rapid buckle-adjust positioning lanyards for bounce-testing placements.",
    ),
    BigWallGearRequirement(
        id="beak-and-cam-hook-set",
        name="Clean Aid Cam Hook Rack & Birdbeak Piton Set",
        category="protection",
        mandatory=True,
        description="Heat-treated steel birdbeaks and wide/narrow cam hooks for fragile expanding flake progression without damaging the rock.",
    ),
    BigWallGearRequirement(
        id="haul-bag-pig-dry-containment",
        name="145L Durathane Hauling Pig & Docking Straps",
        category="haul_bag",
        mandatory=True,
        description="Puncture-proof welded polyurethane haul bag with tuck-away suspension harness, drain grommets, and dedicated anchor docking line.",
    ),
    BigWallGearRequirement(
        id="aluminum-waste-haul-tube",
        name="Threaded PVC/Aluminum Big Wall Waste Tube & Wag Bags",
        category="waste_ethics",
        mandatory=True,
        description="Airtight sealable waste containment tube with haul clip loops and biodegradable wag bags to ensure strict zero-trace cliff ethics.",
    ),
]

FRICTION_COEFFICIENTS: dict[str, float] = {
    "slab": 0.35,
    "vertical": 0.15,
    "overhanging": 0.02,
    "roof": 0.0,
}

HAUL_SYSTEM_CONFIG: dict[str, dict[str, float]] = {
    "1:1_direct": {"ratio": 1.0, "effectiveMA": 0.9},
    "2:1_mechanical_advantage": {"ratio": 2.0, "effectiveMA": 1.7},
    "3:1_z_rig": {"ratio": 3.0, "effectiveMA": 2.4},
}


def get_big_wall_routes(aid_rating: Optional[str] = None) -> list[BigWallRouteModel]:
    routes = list(DEFAULT_BIG_WALL_ROUTES.values())
    if not aid_rating:
        return routes
    norm = aid_rating.strip().upper()
    return [r for r in routes if r.aid_rating.upper() == norm]


def get_big_wall_route_by_id(route_id: str) -> Optional[BigWallRouteModel]:
    return DEFAULT_BIG_WALL_ROUTES.get(route_id.strip().lower())


def get_big_wall_gear() -> list[BigWallGearRequirement]:
    return list(DEFAULT_BIG_WALL_GEAR)


def _get_recommended_technique(effort_level: str) -> str:
    if effort_level == "low":
        return "Direct 1:1 bodyweight squat haul or single-line pull with progress-capture pulley."
    elif effort_level == "moderate":
        return "Counterweight space hauling with foot-loop ascender and bodyweight drops."
    elif effort_level == "strenuous":
        return "2:1 mechanical advantage assisted hauling or 3:1 Z-rig with ascender foot-pump."
    else:
        return "Two-person synchronized space-hauling or 3:1 compound mechanical advantage system with mechanical ascenders."


def calculate_haul_effort(request: HaulCalculationRequest) -> HaulCalculationResponse:
    target_id = request.route_id or "el-capitan-nose"
    route = get_big_wall_route_by_id(target_id)
    if not route:
        raise ValueError(f"Big wall route with id '{target_id}' not found.")

    friction = FRICTION_COEFFICIENTS.get(request.wall_angle, 0.15)
    system_cfg = HAUL_SYSTEM_CONFIG.get(request.haul_system, {"ratio": 1.0, "effectiveMA": 0.9})
    effective_ma = system_cfg["effectiveMA"]
    ratio = system_cfg["ratio"]

    effective_pull_force = round((request.pig_weight_kg * (1.0 + friction)) / effective_ma, 1)
    counterweight_sufficient = request.climber_weight_kg >= effective_pull_force

    if effective_pull_force < 35.0:
        effort_level = "low"
    elif effective_pull_force < 60.0:
        effort_level = "moderate"
    elif effective_pull_force < 90.0:
        effort_level = "strenuous"
    else:
        effort_level = "extreme_two_person"

    recommended_technique = _get_recommended_technique(effort_level)

    warnings: list[str] = []
    if not counterweight_sufficient:
        warnings.append(
            "Effective pull force exceeds climber bodyweight! 2:1 or 3:1 mechanical advantage or 2-person space-hauling counterweight required to prevent haul-line stall."
        )
    if request.wall_angle == "slab":
        warnings.append(
            "Heavy bag dragging on slab generates extreme abrasion; use haul bag swivel and wear-guard sleeves."
        )
    if request.pig_weight_kg > 100.0:
        warnings.append(
            "Expedition double-pig load: separate into two hauls or use 3:1 Z-pulley with mechanical ascender foot-pumping."
        )

    safety_warning = " ".join(warnings) if warnings else None

    return HaulCalculationResponse(
        route_name=route.name,
        effective_pull_force_kg=effective_pull_force,
        mechanical_advantage_ratio=ratio,
        friction_coefficient=friction,
        counterweight_sufficient=counterweight_sufficient,
        haul_effort_level=effort_level,
        recommended_technique=recommended_technique,
        safety_warning=safety_warning,
    )


def detect_big_wall_intent(message: str) -> Optional[BigWallIntent]:
    if not message or not message.strip():
        return None

    q = message.lower()

    # Disambiguation guards
    # 1. Ecommerce & order tracking
    ecommerce_exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "track my order",
        "track my package",
    ]
    if any(e in q for e in ecommerce_exclusions):
        return None

    # 2. Gym climbing & indoor bouldering
    gym_exclusions = [
        "bouldering gym",
        "climbing gym",
        "indoor gym",
        "gym membership",
        "gym pass",
        "day pass",
    ]
    if any(g in q for g in gym_exclusions):
        return None

    # 3. Hiking & trail running
    hiking_exclusions = [
        "hiking trails",
        "trail hike",
        "trail run",
        "day hike",
        "gentle walk",
        "sunday walk",
    ]
    if any(h in q for h in hiking_exclusions):
        return None

    # 4. Sport climbing / gym climbing without big wall terms
    # Check if this is a sport climbing query without any big wall terms
    sport_indicators = [
        "sport climbing",
        "sport climb",
        "sport route",
        "crash pad",
        "bouldering pad",
    ]
    has_sport = any(s in q for s in sport_indicators)

    # Keywords for big wall
    big_wall_keywords = [
        "big wall",
        "bigwall",
        "portaledge",
        "portal-edge",
        "haul bag",
        "hauling bag",
        "hauling pig",
        "pig haul",
        "pig hauling",
        "pig weight",
        "aid climbing",
        "clean aid",
        "cam hook",
        "cam hooks",
        "birdbeak",
        "bird beak",
        "birdbeaks",
        "pecker",
        "peckers",
        "copperhead",
        "copperheads",
        "etrier",
        "etriers",
        "jumaring",
        "jumar",
        "jugging",
        "space haul",
        "space hauling",
        "z-pulley",
        "z-rig",
        "z rig",
        "pro traxion",
        "poop tube",
        "waste tube",
        "waste haul tube",
        "wag bag",
        "wag bags",
        "el cap",
        "el capitan",
        "the nose",
        "half dome",
        "regular northwest",
        "leaning tower",
        "fisher towers",
        "the titan",
        "finger of fate",
        "prodigal son",
        "angel's landing",
    ]

    has_keyword = any(k in q for k in big_wall_keywords)

    # Aid ratings check: c1, c2, c3, c4, c5, a1, a2, a3, a4, a5, c2f, a2+
    has_aid_rating = bool(re.search(r"\b([ca][1-5]|c2f|a2\+)\b", q))

    if has_sport and not (has_keyword or has_aid_rating):
        return None

    # Sport climbing quickdraws check
    if "quickdraws" in q and not (has_keyword or has_aid_rating):
        return None

    if not (has_keyword or has_aid_rating):
        return None

    # Extract route_id
    route_id: Optional[str] = None
    if "nose" in q or "el cap" in q or "el capitan" in q:
        route_id = "el-capitan-nose"
    elif "half dome" in q or "regular northwest" in q:
        route_id = "half-dome-regular-northwest"
    elif "titan" in q or "fisher towers" in q or "finger of fate" in q:
        route_id = "fisher-towers-titan"
    elif "prodigal son" in q or "angel's landing" in q:
        route_id = "zion-prodigal-son"
    elif "leaning tower" in q:
        route_id = "leaning-tower-west-face"

    # Determine action
    calc_terms = [
        "calculate",
        "calculation",
        "haul effort",
        "hauling effort",
        "pull force",
        "mechanical advantage",
        "counterweight",
        "pig weight",
        "z-rig",
    ]
    gear_terms = [
        "gear",
        "checklist",
        "equipment",
        "safety kit",
        "portaledge and hauling pig",
    ]

    if any(c in q for c in calc_terms):
        action = "calculate_haul"
    elif any(g in q for g in gear_terms):
        action = "gear_checklist"
    elif route_id and not any(
        term in q for term in ["where", "list", "all routes", "all big walls"]
    ):
        action = "route_detail"
    else:
        action = "routes_list"

    return BigWallIntent(
        intent_detected=True,
        route_id=route_id,
        action=action,
        confidence=0.95 if route_id else 0.85,
    )


def extract_big_wall_intent(message: str) -> Optional[BigWallIntent]:
    return detect_big_wall_intent(message)


def build_big_wall_prompt(intent: BigWallIntent) -> str:
    lines = [
        "Contoso Alpine Big Wall Aid Climbing & Portaledge Expert Assistant Knowledge:",
        "- Big wall aid climbing involves multi-day ascents of massive sheer or overhanging rock faces (Grade V and Grade VI).",
        "- Hauling systems: 1:1 direct haul (efficient only for lightweight bags on steep walls), 2:1 mechanical advantage (ideal for moderate loads), and 3:1 Z-rig (essential for expedition heavy pigs).",
        "- Wall friction & drag: Slabs have severe friction (0.35) requiring bag swivels and wear-guards; vertical faces have moderate friction (0.15); overhanging walls (0.02) and roofs (0.0) offer free-hanging clean hauls.",
        "- Clean aid climbing techniques: Use removable copperheads, cam hooks, and birdbeaks/peckers to ascend thin seams and expanding flakes without hammering pitons or scarring rock.",
        "- Portaledge systems: Expedition multi-day bivouacs require heavy-duty aircraft aluminum portaledges with tensioned ballistic beds, central fin suspension, and sealed storm flies with ventilation.",
        "- Mandatory Big Wall Ethics: Pack-it-in, pack-it-out. Zero human waste may be left on the cliff; rigid waste haul tubes (poop tubes) and wag bags are mandatory on all big wall routes.",
        "- 5 Iconic Routes: The Nose (El Capitan, Yosemite), Regular Northwest Face (Half Dome, Yosemite), The Titan — Finger of Fate (Moab, Utah), Prodigal Son (Angel's Landing, Zion), West Face (Leaning Tower, Yosemite).",
        "- Mandatory 6-Item Safety Gear Kit: Expedition Portaledge & Storm Fly, Progress-Capture Hauling Pulley (Pro Traxion), 8-Step Etriers & Adjustable Daisies, Clean Aid Cam Hook & Birdbeak Set, 145L Durathane Hauling Pig, Aluminum Big Wall Waste Haul Tube.",
    ]

    if intent.action == "route_detail" and intent.route_id:
        route = get_big_wall_route_by_id(intent.route_id)
        if route:
            lines.append(
                f"- Selected Route: {route.name} ({route.location}). Grade: {route.grade}, Aid Rating: {route.aid_rating}, "
                f"Pitches: {route.pitches}, Height: {route.height_meters}m, Recommended Days: {route.recommended_days}, "
                f"Typical Pig: {route.typical_pig_weight_kg}kg. Highlights: {', '.join(route.highlights)}."
            )
    elif intent.action == "calculate_haul":
        lines.append(
            "- Action: Calculate hauling mechanical advantage, effective pull force, climber counterweight sufficiency, and provide technique recommendations."
        )
    elif intent.action == "gear_checklist":
        lines.append(
            "- Action: Present the mandatory 6-item Big Wall Aid Climbing & Portaledge safety gear checklist."
        )

    return "\n".join(lines)


def format_big_wall_response(intent: BigWallIntent, query: str = "") -> FormattedBigWallResponse:
    action = intent.action

    if action == "routes_list":
        routes = get_big_wall_routes()
        items_summary = "\n".join(
            [
                f"- **{r.name}** ({r.location}): Grade {r.grade} ({r.aid_rating}), {r.pitches} pitches, "
                f"{r.height_meters}m, typical pig weight {r.typical_pig_weight_kg}kg."
                for r in routes
            ]
        )
        answer = (
            "Here are top iconic Big Wall Aid Climbing routes:\n\n"
            f"{items_summary}\n\n"
            "Ensure proper mechanical advantage hauling systems, clean aid protection, and complete waste containment."
        )
        data: dict[str, Any] = {
            "action": "routes_list",
            "routes": [r.model_dump() for r in routes],
        }
        return FormattedBigWallResponse(answer, {"big_wall_info": data, "answer": answer})

    elif action == "route_detail" and intent.route_id:
        route = get_big_wall_route_by_id(intent.route_id)
        if route:
            highlights_text = "\n".join([f"  * {h}" for h in route.highlights])
            answer = (
                f"### {route.name}\n"
                f"- **Location**: {route.location}\n"
                f"- **Grade & Aid**: {route.grade} ({route.aid_rating})\n"
                f"- **Pitches & Height**: {route.pitches} pitches, {route.height_meters}m\n"
                f"- **Recommended Days**: {route.recommended_days} days\n"
                f"- **Typical Pig Weight**: {route.typical_pig_weight_kg} kg\n"
                f"- **Description**: {route.description}\n"
                f"- **Highlights**:\n{highlights_text}\n"
            )
            data = {
                "action": "route_detail",
                "route": route.model_dump(),
            }
            return FormattedBigWallResponse(answer, {"big_wall_info": data, "answer": answer})

    elif action == "calculate_haul":
        target_id = intent.route_id or "el-capitan-nose"
        route = get_big_wall_route_by_id(target_id)
        pig_weight = route.typical_pig_weight_kg if route else 70.0
        req = HaulCalculationRequest(
            route_id=target_id,
            pig_weight_kg=pig_weight,
            haul_system="2:1_mechanical_advantage",
            wall_angle="vertical",
            climber_weight_kg=75.0,
        )
        res = calculate_haul_effort(req)
        warning_str = f"\n- **Safety Warning**: {res.safety_warning}" if res.safety_warning else ""
        answer = (
            f"### Haul Calculation ({res.route_name})\n"
            f"- **Effective Pull Force**: {res.effective_pull_force_kg} kg\n"
            f"- **Mechanical Advantage**: {res.mechanical_advantage_ratio}:1\n"
            f"- **Effort Level**: `{res.haul_effort_level.upper()}`\n"
            f"- **Counterweight Sufficient**: {'Yes' if res.counterweight_sufficient else 'No'}\n"
            f"- **Recommended Technique**: {res.recommended_technique}"
            f"{warning_str}"
        )
        data = {
            "action": "calculate_haul",
            "calculation": res.model_dump(),
        }
        return FormattedBigWallResponse(answer, {"big_wall_info": data, "answer": answer})

    elif action == "gear_checklist":
        gear = get_big_wall_gear()
        gear_lines = "\n".join([f"- **{g.name}** ({g.category}): {g.description}" for g in gear])
        answer = (
            "### Mandatory Big Wall Aid Climbing & Portaledge Safety Kit Checklist:\n\n"
            f"{gear_lines}\n\n"
            "Never commit to multi-day walls without an airtight waste haul tube and storm fly."
        )
        data = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
        }
        return FormattedBigWallResponse(answer, {"big_wall_info": data, "answer": answer})

    # Fallback to routes_list
    routes = get_big_wall_routes()
    fallback_data: dict[str, Any] = {
        "action": "routes_list",
        "routes": [r.model_dump() for r in routes],
    }
    answer = f"Found {len(routes)} iconic big wall routes in North America: The Nose, Regular Northwest Face, The Titan, Prodigal Son, and Leaning Tower West Face."
    return FormattedBigWallResponse(answer, {"big_wall_info": fallback_data, "answer": answer})
