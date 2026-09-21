from typing import Any, Optional

from pydantic import BaseModel, Field


class IceClimbingRouteModel(BaseModel):
    route_id: str
    title: str
    region: str
    pitches: int
    length_m: int
    ice_grade: str
    elevation_m: int
    ice_structure: str
    typical_duration_hours: float
    v_thread_anchor_standard: bool
    description: str
    highlights: list[str] = Field(default_factory=list)


class IceRiggingRequest(BaseModel):
    route_id: str
    ice_temperature_f: float = 20.0
    ice_thickness_cm: float = 25.0
    screw_length_cm: int = 16
    screw_placement_angle_deg: int = 100
    anchor_type: str = "v_thread_abalakov"


class IceRiggingResponse(BaseModel):
    route_id: str
    route_title: str
    ice_grade: str
    ice_quality_rating: str
    estimated_holding_force_kn: float
    safety_status: str
    temperature_advisory: str
    rigging_recommendation: str
    v_thread_suitable: bool


class IceClimbingGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class IceClimbingIntent(BaseModel):
    action: str  # "routes", "route_detail", "rigging_plan", "gear_checklist"
    route_id: Optional[str] = None
    grade: Optional[str] = None
    region: Optional[str] = None


DEFAULT_ICE_CLIMBING_ROUTES: dict[str, IceClimbingRouteModel] = {
    "ouray-ice-park-pic-of-the-vic": IceClimbingRouteModel(
        route_id="ouray-ice-park-pic-of-the-vic",
        title="Pic of the Vic & Upper Bridge Area",
        region="Ouray Ice Park, Ouray, CO",
        pitches=2,
        length_m=45,
        ice_grade="wi3_intermediate",
        elevation_m=2400,
        ice_structure="plastic_water_ice",
        typical_duration_hours=2.5,
        v_thread_anchor_standard=True,
        description=(
            "World-renowned farmed waterfall ice inside the Uncompahgre Gorge featuring continuous "
            "plastic blue waterfall flows, gorge rim bridge access, and top-rope anchor stanchions."
        ),
        highlights=[
            "Gorge rim bridge access",
            "Continuous blue waterfall ice flows",
            "Top-rope anchor stanchions",
        ],
    ),
    "hyalite-canyon-genesis-ii": IceClimbingRouteModel(
        route_id="hyalite-canyon-genesis-ii",
        title="Genesis II Waterfall",
        region="Hyalite Canyon, Bozeman, MT",
        pitches=3,
        length_m=85,
        ice_grade="wi4_advanced",
        elevation_m=2250,
        ice_structure="brittle_bullet_ice",
        typical_duration_hours=4.0,
        v_thread_anchor_standard=True,
        description=(
            "Classic Montana multi-pitch waterfall ascent in a sheltered alpine drainage amphitheater, "
            "delivering sustained 80-degree ice walls and dense brittle bullet ice steps."
        ),
        highlights=[
            "Sustained 80-degree ice wall",
            "Sheltered alpine drainage amphitheater",
            "Two-tier vertical flow steps",
        ],
    ),
    "canmore-weeping-wall-lower": IceClimbingRouteModel(
        route_id="canmore-weeping-wall-lower",
        title="The Weeping Wall (Lower Tier)",
        region="Banff & Jasper National Parks, AB, Canada",
        pitches=4,
        length_m=160,
        ice_grade="wi4_advanced",
        elevation_m=1950,
        ice_structure="plastic_water_ice",
        typical_duration_hours=5.5,
        v_thread_anchor_standard=True,
        description=(
            "Vast 500-foot roadside ice shield along the Icefields Parkway, renowned for massive blue "
            "waterfall curtains and classic Canadian Rockies multi-pitch ice climbing."
        ),
        highlights=[
            "Vast 500-foot ice shield",
            "Iconic Canadian Rockies roadside route",
            "Massive blue ice curtain pitches",
        ],
    ),
    "lake-willoughby-promised-land": IceClimbingRouteModel(
        route_id="lake-willoughby-promised-land",
        title="The Promised Land",
        region="Lake Willoughby, Westmore, VT",
        pitches=3,
        length_m=110,
        ice_grade="wi5_expert",
        elevation_m=580,
        ice_structure="chandelier_candled_ice",
        typical_duration_hours=5.0,
        v_thread_anchor_standard=True,
        description=(
            "Steep New England testpiece on Mount Pisgah exposed to brutal lake winds, featuring high-angle "
            "columnar ice pillars and delicate candled chandelier ice placements."
        ),
        highlights=[
            "High-angle columnar ice pillars",
            "Dramatic lake breeze exposure",
            "Delicate thin chandelier ice placements",
        ],
    ),
    "vail-amphitheater-fang": IceClimbingRouteModel(
        route_id="vail-amphitheater-fang",
        title="The Fang",
        region="Vail Amphitheater, Vail, CO",
        pitches=1,
        length_m=35,
        ice_grade="wi6_extreme",
        elevation_m=2700,
        ice_structure="chandelier_candled_ice",
        typical_duration_hours=3.0,
        v_thread_anchor_standard=True,
        description=(
            "Legendary free-standing vertical ice pillar in the Vail Amphitheater requiring sustained "
            "technical mastery through aerated hollow ice daggers and acute exposure."
        ),
        highlights=[
            "Legendary free-standing vertical ice pillar",
            "Aerated hollow ice dagger transitions",
            "Severe forearm pump and exposure",
        ],
    ),
}

DEFAULT_ICE_CLIMBING_GEAR: list[IceClimbingGearRequirement] = [
    IceClimbingGearRequirement(
        item_id="technical-ice-tools",
        name="Pair of Ergonomic Technical Ice Tools with Aggressive Cascading Ice Picks",
        category="ice_tools",
        mandatory=True,
        purpose="Provides ergonomic leashless grip, aggressive pick penetration, and clearance over ice bulges and vertical chandelier pillars.",
    ),
    IceClimbingGearRequirement(
        item_id="mono-dual-point-crampons",
        name="Rigid or Semi-Rigid Steel Ice Climbing Crampons with Vertical Frontpoints",
        category="crampons",
        mandatory=True,
        purpose="Ensures precise frontpoint penetration into bullet ice and delicate candled ice features without shattering the structure.",
    ),
    IceClimbingGearRequirement(
        item_id="ice-screw-rack",
        name="Rack of 8-12 CE/UIAA Certified Ice Screws (13cm, 16cm, 19cm, 22cm) with Express Cranks",
        category="protection_hardware",
        mandatory=True,
        purpose="Provides intermediate lead protection and multi-point anchor construction in solid waterfall ice.",
    ),
    IceClimbingGearRequirement(
        item_id="v-thread-hooker-cord",
        name="Abalakov V-Thread Cord Threader Tool and 7mm Static Dyneema/Perlon Anchor Cord",
        category="anchor_rigging",
        mandatory=True,
        purpose="Facilitates rigging retrievable Abalakov V-thread anchors for multi-pitch rappels and bail anchors.",
    ),
    IceClimbingGearRequirement(
        item_id="insulated-mountaineering-boots",
        name="B3-Rated Rigid Waterproof Insulated Double Mountaineering Boots with Heel/Toe Welts",
        category="footwear",
        mandatory=True,
        purpose="Delivers rigid crampon platform, calf muscle fatigue relief, and thermal insulation during sub-zero belays.",
    ),
    IceClimbingGearRequirement(
        item_id="ice-climbing-helmet-visor",
        name="EN 12492 Certified Climbing Helmet with Eye-Protection Ice Visor",
        category="headwear_protection",
        mandatory=True,
        purpose="Protects skull and eyes against falling ice shrapnel, falling icicles, and pick rebounds while swinging overhead.",
    ),
]


def get_ice_climbing_routes(grade: Optional[str] = None) -> list[IceClimbingRouteModel]:
    routes = list(DEFAULT_ICE_CLIMBING_ROUTES.values())
    if not grade:
        return routes

    norm = grade.strip().lower().replace(" ", "_").replace("-", "_")

    def canonical(g: str) -> str:
        if "wi6" in g or g == "wi6":
            return "wi6_extreme"
        if "wi5" in g or g == "wi5":
            return "wi5_expert"
        if "wi4" in g or g == "wi4":
            return "wi4_advanced"
        if "wi3" in g or g == "wi3":
            return "wi3_intermediate"
        if "wi2" in g or g == "wi2":
            return "wi2_beginner"
        return g

    target = canonical(norm)
    return [r for r in routes if r.ice_grade == target or target in r.ice_grade]


def get_ice_climbing_route_by_id(route_id: str) -> Optional[IceClimbingRouteModel]:
    return DEFAULT_ICE_CLIMBING_ROUTES.get(route_id.strip().lower())


def get_ice_climbing_gear() -> list[IceClimbingGearRequirement]:
    return list(DEFAULT_ICE_CLIMBING_GEAR)


def calculate_ice_rigging_plan(request: IceRiggingRequest) -> IceRiggingResponse:
    route = get_ice_climbing_route_by_id(request.route_id)
    if not route:
        raise ValueError(f"Ice climbing route '{request.route_id}' not found")

    temp_f = request.ice_temperature_f
    thickness_cm = request.ice_thickness_cm
    screw_len_cm = request.screw_length_cm
    angle_deg = request.screw_placement_angle_deg
    anchor_type = request.anchor_type.strip().lower()

    # Base holding force by screw length
    screw_holding_map = {
        10: 8.0,
        13: 11.5,
        16: 15.0,
        19: 18.5,
        22: 20.0,
    }
    # Closest match
    closest_len = min(screw_holding_map.keys(), key=lambda k: abs(k - screw_len_cm))
    base_screw_kn = screw_holding_map[closest_len]

    # Angle efficiency: modern testing confirms 90° - 105° positive angle gives peak holding power
    if 90 <= angle_deg <= 105:
        angle_efficiency = 1.0
    elif angle_deg < 90:
        angle_efficiency = max(0.4, 1.0 - ((90 - angle_deg) * 0.015))
    else:  # angle_deg > 105
        angle_efficiency = max(0.5, 1.0 - ((angle_deg - 105) * 0.012))

    # Base holding force based on anchor configuration
    if anchor_type == "v_thread_abalakov":
        base_anchor_kn = 16.0
    elif anchor_type == "two_screw_equalized":
        base_anchor_kn = base_screw_kn * 1.45
    else:
        base_anchor_kn = base_screw_kn

    # Quality rating based on route ice structure and temperature
    if temp_f > 32.0:
        ice_quality = "degraded_melting_slush"
    elif temp_f < 14.0:
        ice_quality = "dense_brittle_bullet_ice"
    elif route.ice_structure == "chandelier_candled_ice":
        ice_quality = "delicate_candled_ice"
    else:
        ice_quality = "excellent_plastic_water_ice"

    # Temperature advisory & safety status
    is_bottoming_out = screw_len_cm > thickness_cm
    is_too_thin = thickness_cm < 15.0
    is_thawing = temp_f > 32.0
    is_brittle = temp_f < 14.0

    if is_thawing:
        temperature_advisory = (
            f"CRITICAL THAW HAZARD ({temp_f:.1f}°F): Air/ice temperature is above freezing! "
            "Ice is melting, water-lubricated, and structurally compromised with severely degraded "
            "pull-out resistance and catastrophic detachment risks."
        )
        temp_factor = 0.35
    elif is_brittle:
        temperature_advisory = (
            f"EXTREME COLD ADVISORY ({temp_f:.1f}°F): Sub-zero cold produces hard, brittle bullet ice "
            "prone to severe dinner-plate shattering and stress fractures under pick swings and screw placement. "
            "Clear shattered surface plates before screwing and turn teeth steadily."
        )
        temp_factor = 0.85
    else:
        temperature_advisory = (
            f"OPTIMAL TEMPERATURE ({temp_f:.1f}°F): Resilient plastic deformation range (14°F to 28°F). "
            "Water ice yields smoothly without brittle dinner-plate shattering, providing optimal thread shear resistance."
        )
        temp_factor = 1.0

    # V-Thread suitability
    v_thread_suitable = (
        not is_thawing
        and not is_too_thin
        and thickness_cm >= 20.0
        and not is_bottoming_out
    )

    # Holding force calculation
    if is_bottoming_out:
        estimated_kn = 2.0
        safety_status = "critical_hazard_bottoming_out"
    elif is_thawing:
        estimated_kn = round(base_anchor_kn * temp_factor * angle_efficiency, 1)
        safety_status = "critical_thaw_hazard"
    elif is_too_thin:
        estimated_kn = round(base_anchor_kn * 0.55 * temp_factor * angle_efficiency, 1)
        safety_status = "hazardous_thin_ice"
    elif is_brittle:
        estimated_kn = round(base_anchor_kn * temp_factor * angle_efficiency, 1)
        safety_status = "caution_brittle_ice"
    else:
        estimated_kn = round(base_anchor_kn * temp_factor * angle_efficiency, 1)
        safety_status = "optimal_anchorage"

    # Rigging recommendation
    recs = []
    if is_bottoming_out:
        recs.append(
            f"DANGER: Screw length ({screw_len_cm}cm) exceeds ice thickness ({thickness_cm}cm)! "
            "Screws will bottom out on bedrock or air pockets. Switch immediately to 10cm-13cm stubby screws "
            "or find deeper ice flows."
        )
    elif is_too_thin:
        recs.append(
            f"WARNING: Ice thickness is only {thickness_cm}cm. Use short stubby screws (10-13cm) and tie off hangers "
            "with webbing if screw eyes do not sit flush against ice. Avoid V-threads on ice thinner than 20cm."
        )
    else:
        recs.append(
            f"Ice thickness of {thickness_cm}cm is sufficient for full {screw_len_cm}cm screw penetration."
        )

    if anchor_type == "v_thread_abalakov":
        if v_thread_suitable:
            recs.append(
                "Abalakov V-Thread: Drill two intersecting holes at a 60-degree angle using a 22cm screw, "
                "spaced 18-20cm horizontally apart. Thread 7mm static cord with an Abalakov hooker tool and tie with a double fisherman's knot."
            )
        else:
            recs.append(
                "V-Thread is NOT suitable under current conditions (insufficient ice depth or thawing). "
                "Construct a multi-screw equalized anchor or seek established top-rope/rock anchor stanchions."
            )
    elif anchor_type == "two_screw_equalized":
        recs.append(
            "Two-Screw Anchor: Place two 16-22cm screws separated vertically by at least 30-50cm and horizontally offset "
            "to prevent fracture propagation. Equalize with a cordellette or pre-equalized sling."
        )

    if angle_deg < 85 or angle_deg > 115:
        recs.append(
            f"Placement angle ({angle_deg}°) is suboptimal. Aim for 90° to 100° (perpendicular or slightly positive into the load vector) "
            "for maximum thread shear strength."
        )

    rigging_recommendation = " ".join(recs)

    return IceRiggingResponse(
        route_id=route.route_id,
        route_title=route.title,
        ice_grade=route.ice_grade,
        ice_quality_rating=ice_quality,
        estimated_holding_force_kn=estimated_kn,
        safety_status=safety_status,
        temperature_advisory=temperature_advisory,
        rigging_recommendation=rigging_recommendation,
        v_thread_suitable=v_thread_suitable,
    )


def detect_ice_climbing_intent(message: str) -> Optional[IceClimbingIntent]:
    if not message or not message.strip():
        return None

    q = message.lower()

    # Exclusions for unrelated general e-commerce
    ecommerce_exclusions = [
        "refund",
        "order #",
        "return label",
        "shipping tracking",
    ]
    if any(ex in q for ex in ecommerce_exclusions):
        return None

    # CRITICAL DISAMBIGUATION: Strictly guard against rock climbing keywords handled in climbing.py!
    rock_climbing_exclusions = [
        "rock climbing",
        "trad climbing",
        "sport climbing",
        "bouldering",
        "camalot",
        "chalk bag",
        "belay partner",
    ]
    if any(rx in q for rx in rock_climbing_exclusions):
        return None

    # CRITICAL DISAMBIGUATION: Strictly guard against glacier mountaineering in mountaineering.py!
    glacier_mountaineering_exclusions = [
        "glacier mountaineering",
        "crevasse rescue",
        "glacier travel",
        "rope team",
        "snow picket",
        "z-pulley",
        "z pulley",
    ]
    if any(gx in q for gx in glacier_mountaineering_exclusions):
        return None

    # CRITICAL DISAMBIGUATION: Strictly guard against via ferrata in via_ferrata.py!
    via_ferrata_exclusions = [
        "via ferrata",
        "iron way",
        "klettersteig",
        "cable route",
        "energy absorber",
        "type k",
    ]
    if any(vx in q for vx in via_ferrata_exclusions):
        return None

    # Waterfall ice climbing keywords
    ice_keywords = [
        "ice climb",
        "ice climbing",
        "waterfall ice",
        "mixed climbing",
        "ice tool",
        "ice screw",
        "v-thread",
        "abalakov",
        "crampon frontpoint",
        "ouray ice park",
        "hyalite canyon",
        "weeping wall",
        "lake willoughby ice",
        "the fang ice",
        "ice pillar",
        "chandelier ice",
        "bullet ice",
        "plastic water ice",
        "the fang",
        "pic of the vic",
        "genesis ii",
        "promised land",
    ]
    if not any(k in q for k in ice_keywords):
        return None

    # Detect Route
    route_id = None
    if "ouray" in q or "pic of the vic" in q:
        route_id = "ouray-ice-park-pic-of-the-vic"
    elif "hyalite" in q or "genesis" in q:
        route_id = "hyalite-canyon-genesis-ii"
    elif "weeping wall" in q or "canmore" in q:
        route_id = "canmore-weeping-wall-lower"
    elif "willoughby" in q or "promised land" in q:
        route_id = "lake-willoughby-promised-land"
    elif "the fang" in q or "fang" in q or "vail" in q:
        route_id = "vail-amphitheater-fang"

    # Detect Grade
    grade = None
    if "wi6" in q or "extreme" in q:
        grade = "wi6_extreme"
    elif "wi5" in q or "expert" in q:
        grade = "wi5_expert"
    elif "wi4" in q or "advanced" in q:
        grade = "wi4_advanced"
    elif "wi3" in q or "intermediate" in q:
        grade = "wi3_intermediate"
    elif "wi2" in q or "beginner" in q:
        grade = "wi2_beginner"

    # Detect Action
    if any(
        k in q
        for k in [
            "rigging",
            "rigging plan",
            "holding force",
            "v-thread anchor",
            "anchor force",
            "screw placement",
            "calculate ice rigging",
        ]
    ):
        action = "rigging_plan"
    elif any(
        k in q
        for k in [
            "gear",
            "checklist",
            "tools",
            "crampon",
            "screws",
            "equipment",
            "hardware",
            "helmet",
        ]
    ):
        action = "gear_checklist"
    elif route_id and any(
        k in q
        for k in [
            "pitch",
            "pitches",
            "beta",
            "detail",
            "length",
            "steep",
            "grade",
            "about",
            "how steep",
            "elevation",
        ]
    ):
        action = "route_detail"
    elif any(
        k in q
        for k in [
            "routes",
            "catalog",
            "list",
            "destinations",
            "show me",
            "available",
            "waterfall ice routes",
        ]
    ):
        action = "routes"
    elif route_id:
        action = "route_detail"
    else:
        action = "routes"

    return IceClimbingIntent(
        action=action,
        route_id=route_id,
        grade=grade,
    )


def build_ice_climbing_prompt(intent: IceClimbingIntent) -> str:
    lines = [
        "Waterfall Ice Climbing, Winter Ascents & Anchor Rigging Tooling Beta:",
        "- Ice Structures: Plastic water ice (optimal 14°F-28°F, resilient deformation), "
        "Brittle bullet ice (< 14°F, dinner-plating and shattering risks), "
        "Chandelier candled ice (aerated vertical columns and pillars).",
        "- Protection Mechanics: CE/UIAA certified tubular ice screws placed at 90° to 100° (positive angle in direction of pull). "
        "Always maintain >= 1.5x screw length (30-50cm) spacing between screws to prevent propagation lines.",
        "- Abalakov V-Thread Anchors: 60-degree equilateral intersection drilled using 22cm screw with 18-20cm hole separation; "
        "threaded with 7mm static cord using an Abalakov hooker tool. Minimum 20cm solid ice required.",
    ]

    if intent.route_id:
        route = get_ice_climbing_route_by_id(intent.route_id)
        if route:
            lines.append(
                f"- Focused Route Beta: {route.title} ({route.region})\n"
                f"  Grade: {route.ice_grade} | Pitches: {route.pitches} ({route.length_m}m) | Elevation: {route.elevation_m}m\n"
                f"  Ice Structure: {route.ice_structure} | Duration: {route.typical_duration_hours}h | V-Thread Standard: {route.v_thread_anchor_standard}\n"
                f"  Highlights: {', '.join(route.highlights)}\n"
                f"  Description: {route.description}"
            )
    else:
        routes = get_ice_climbing_routes(grade=intent.grade)
        lines.append(
            f"- Featured Iconic Ice Routes: {'; '.join(f'{r.title} ({r.ice_grade}, {r.region})' for r in routes)}"
        )

    return "\n".join(lines)


def format_ice_climbing_response(intent: IceClimbingIntent) -> dict[str, Any]:
    if intent.action == "rigging_plan":
        req = IceRiggingRequest(
            route_id=intent.route_id or "ouray-ice-park-pic-of-the-vic",
            ice_temperature_f=20.0,
            ice_thickness_cm=25.0,
            screw_length_cm=16,
            screw_placement_angle_deg=100,
            anchor_type="v_thread_abalakov",
        )
        plan = calculate_ice_rigging_plan(req)
        answer = (
            f"Ice Rigging & Anchor Plan for {plan.route_title} ({plan.ice_grade}): "
            f"Safety Status: {plan.safety_status}. Ice Quality: {plan.ice_quality_rating}. "
            f"Estimated Holding Force: {plan.estimated_holding_force_kn:.1f} kN. "
            f"V-Thread Anchor Suitable: {plan.v_thread_suitable}. "
            f"Temperature Advisory: {plan.temperature_advisory} "
            f"Recommendation: {plan.rigging_recommendation}"
        )
        return {
            "answer": answer,
            "ice_climbing_info": {
                "action": "rigging_plan",
                "plan": plan.model_dump(),
            },
        }

    if intent.action == "gear_checklist":
        gear = get_ice_climbing_gear()
        mandatory_names = [g.name for g in gear if g.mandatory]
        answer = (
            f"Mandatory Waterfall Ice Climbing Gear Checklist ({len(gear)} essential items): "
            + "; ".join(f"{g.name} ({g.purpose})" for g in gear)
            + ". Always verify sharp pick profiles and inspect screw threads before heading into sub-zero terrain."
        )
        return {
            "answer": answer,
            "ice_climbing_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in gear],
                "mandatory_count": len(mandatory_names),
            },
        }

    if intent.action == "route_detail" and intent.route_id:
        route = get_ice_climbing_route_by_id(intent.route_id)
        if route:
            answer = (
                f"Waterfall Ice Climbing Beta — {route.title} ({route.region}): "
                f"Grade: {route.ice_grade}, {route.pitches} pitches, {route.length_m}m total length, elevation {route.elevation_m}m. "
                f"Ice Structure: {route.ice_structure}. Typical Duration: {route.typical_duration_hours} hours. "
                f"V-Thread Anchor Standard: {route.v_thread_anchor_standard}. "
                f"Highlights: {', '.join(route.highlights)}. {route.description}"
            )
            return {
                "answer": answer,
                "ice_climbing_info": {
                    "action": "route_detail",
                    "route": route.model_dump(),
                },
            }

    # Default: routes catalog
    routes = get_ice_climbing_routes(grade=intent.grade)
    routes_summary = "; ".join(f"{r.title} ({r.ice_grade}, {r.pitches}p, {r.region})" for r in routes)
    answer = (
        f"Contoso Iconic Waterfall Ice Climbing Catalog ({len(routes)} routes): {routes_summary}. "
        "Ask about specific route beta, rigging plans, V-thread anchors, or our ice climbing gear checklist."
    )
    return {
        "answer": answer,
        "ice_climbing_info": {
            "action": "routes",
            "routes": [r.model_dump() for r in routes],
        },
    }
