from typing import Any, Optional

from pydantic import BaseModel


class ViaFerrataRouteModel(BaseModel):
    route_id: str
    title: str
    region: str
    distance_km: float
    vertical_gain_m: int
    grade: str
    cable_length_m: int
    exposure_level: str
    typical_duration_hours: float
    suspension_bridge_span_m: int
    rest_lanyard_recommended: bool
    description: str
    highlights: list[str]


class RiggingPlanRequest(BaseModel):
    route_id: str
    climber_weight_kg: float = 75.0
    has_heavy_backpack: bool = False
    energy_absorber_type: str = "tearing_webbing_en958"
    rest_lanyard_attached: bool = True


class RiggingPlanResponse(BaseModel):
    route_id: str
    route_title: str
    route_grade: str
    effective_weight_kg: float
    weight_status: str
    lanyard_safety_status: str
    estimated_impact_force_kn: float
    rest_lanyard_advisory: str
    safety_notice: str
    en958_compliant: bool


class ViaFerrataGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class ViaFerrataIntent(BaseModel):
    action: str
    route_id: Optional[str] = None
    grade: Optional[str] = None
    region: Optional[str] = None


DEFAULT_VIA_FERRATA_ROUTES: dict[str, ViaFerrataRouteModel] = {
    "telluride-via-ferrata": ViaFerrataRouteModel(
        route_id="telluride-via-ferrata",
        title="Telluride Via Ferrata",
        region="San Juan Mountains, Telluride, CO",
        distance_km=3.2,
        vertical_gain_m=185,
        grade="grade_c_difficult",
        cable_length_m=1200,
        exposure_level="high",
        typical_duration_hours=3.5,
        suspension_bridge_span_m=0,
        rest_lanyard_recommended=True,
        description="Exhilarating horizontal ledge traverse clinging to the sheer amphitheater cliffs of Ajax Peak overlooking Telluride and Bridal Veil Falls.",
        highlights=[
            "The Main Event sheer ledge traverse",
            "Direct views of Bridal Veil Falls",
            "Airy canyon rim stepping irons",
        ],
    ),
    "mount-olympus-iron-way": ViaFerrataRouteModel(
        route_id="mount-olympus-iron-way",
        title="Mount Olympus Iron Way Ridge",
        region="Wasatch Range, Salt Lake City, UT",
        distance_km=4.8,
        vertical_gain_m=420,
        grade="grade_b_moderately_difficult",
        cable_length_m=950,
        exposure_level="moderate",
        typical_duration_hours=4.0,
        suspension_bridge_span_m=15,
        rest_lanyard_recommended=False,
        description="Alpine ridge iron way climbing quartzite slabs above Salt Lake City with an exciting 15-meter wire suspension monkey bridge.",
        highlights=[
            "15-meter wire suspension monkey bridge",
            "Granite friction slab traverses",
            "Panoramic Salt Lake Valley vistas",
        ],
    ),
    "ouray-via-ferrata-gold-mountain": ViaFerrataRouteModel(
        route_id="ouray-via-ferrata-gold-mountain",
        title="Ouray Via Ferrata Gold Mountain",
        region="Uncompahgre Gorge, Ouray, CO",
        distance_km=2.1,
        vertical_gain_m=260,
        grade="grade_d_very_difficult",
        cable_length_m=1400,
        exposure_level="extreme",
        typical_duration_hours=3.0,
        suspension_bridge_span_m=35,
        rest_lanyard_recommended=True,
        description="Strenuous vertical gorge ascent above the roaring Uncompahgre River featuring a 35-meter Sky Bridge and sheer overhanging headwalls.",
        highlights=[
            "Sky Bridge gorge crossing",
            "Vertical iron ladder staircase",
            "Overhanging headwall cable bypass",
        ],
    ),
    "whistler-peak-via-ferrata": ViaFerrataRouteModel(
        route_id="whistler-peak-via-ferrata",
        title="Whistler Peak West Ridge Via Ferrata",
        region="Coast Mountains, Whistler, BC",
        distance_km=3.6,
        vertical_gain_m=310,
        grade="grade_b_moderately_difficult",
        cable_length_m=800,
        exposure_level="moderate",
        typical_duration_hours=3.5,
        suspension_bridge_span_m=0,
        rest_lanyard_recommended=False,
        description="High-alpine glaciated ridge ascent to Whistler Peak summit with sweeping views of Black Tusk and Coast Mountain glaciers.",
        highlights=[
            "Glaciated summit approach",
            "Coast Mountain volcanic horn panorama",
            "Alpine marmot meadows",
        ],
    ),
    "mammoth-mountain-iron-crest": ViaFerrataRouteModel(
        route_id="mammoth-mountain-iron-crest",
        title="Mammoth Mountain Iron Crest Wall",
        region="Sierra Nevada, Mammoth Lakes, CA",
        distance_km=1.8,
        vertical_gain_m=380,
        grade="grade_e_extremely_difficult",
        cable_length_m=1100,
        exposure_level="extreme",
        typical_duration_hours=4.5,
        suspension_bridge_span_m=25,
        rest_lanyard_recommended=True,
        description="Extremely demanding high-altitude via ferrata ascending sustained overhanging faces of Mammoth Mountain with a 25-meter wire beam crossing.",
        highlights=[
            "Sustained 40-meter overhanging ladder rung face",
            "High Sierra crest panorama",
            "Suspended 25-meter wire beam crossing",
        ],
    ),
}

DEFAULT_VIA_FERRATA_GEAR: list[ViaFerrataGearRequirement] = [
    ViaFerrataGearRequirement(
        item_id="en958-energy-absorber-lanyard",
        name="EN 958:2017 Certified Y-Lanyard with Progressive Tearing Energy Absorber",
        category="fall_arrest",
        mandatory=True,
        purpose="Progressively tears under deceleration forces to limit fall impact loads below 6.0 kN on high fall-factor cable falls.",
    ),
    ViaFerrataGearRequirement(
        item_id="locking-via-ferrata-carabiners",
        name="Dual Ergonomic Palm-Squeeze Auto-Locking Carabiners (Type K)",
        category="carabiners_hardware",
        mandatory=True,
        purpose="Type K (Klettersteig) wide gate opening carabiners with automatic locking and high lateral breaking strength (>= 8 kN edge loading).",
    ),
    ViaFerrataGearRequirement(
        item_id="climbing-harness-tested",
        name="CE/UIAA Certified Sit Climbing Harness with Reinforced Belay Loop",
        category="harness",
        mandatory=True,
        purpose="Secures climber with girth-hitched energy absorber to tie-in point; must resist high-impact arrest and suspension.",
    ),
    ViaFerrataGearRequirement(
        item_id="climbing-helmet-en12492",
        name="EN 12492 Certified Mountaineering & Rock Climbing Helmet (Rockfall Protection)",
        category="headwear_protection",
        mandatory=True,
        purpose="Essential head protection against falling rocks dislodged by overhead climbers and impact against vertical iron rungs.",
    ),
    ViaFerrataGearRequirement(
        item_id="rest-sling-carabiner",
        name="Short Dynamic Rest Sling (15-30cm) with Screwgate Carabiner (for Ledge Resting)",
        category="rest_system",
        mandatory=True,
        purpose="Allows climber to directly clip into iron ladder rungs or pigtail anchors to rest without engaging the energy absorber.",
    ),
    ViaFerrataGearRequirement(
        item_id="sticky-approach-shoes-gloves",
        name="Sticky Rubber Approach Shoes and Reinforced Half-Finger Climbing Gloves",
        category="apparel_footwear",
        mandatory=True,
        purpose="Provides friction on smooth polished rock slabs and protects palms against metal burrs on steel cables.",
    ),
]


def get_via_ferrata_routes(grade: Optional[str] = None) -> list[ViaFerrataRouteModel]:
    routes = list(DEFAULT_VIA_FERRATA_ROUTES.values())
    if not grade:
        return routes

    norm = grade.strip().lower().replace(" ", "_").replace("-", "_")

    def canonical(g: str) -> str:
        if "grade_e" in g or g == "e":
            return "grade_e_extremely_difficult"
        if "grade_d" in g or g == "d":
            return "grade_d_very_difficult"
        if "grade_c" in g or g == "c":
            return "grade_c_difficult"
        if "grade_b" in g or g == "b":
            return "grade_b_moderately_difficult"
        if "grade_a" in g or g == "a":
            return "grade_a_easy"
        return g

    target = canonical(norm)
    return [r for r in routes if r.grade == target or target in r.grade]


def get_via_ferrata_route_by_id(route_id: str) -> Optional[ViaFerrataRouteModel]:
    return DEFAULT_VIA_FERRATA_ROUTES.get(route_id.strip().lower())


def calculate_rigging_plan(request: RiggingPlanRequest) -> RiggingPlanResponse:
    route = get_via_ferrata_route_by_id(request.route_id)
    if not route:
        raise ValueError(f"Via ferrata route '{request.route_id}' not found")

    effective_weight = round(
        request.climber_weight_kg + (10.0 if request.has_heavy_backpack else 0.0), 1
    )

    absorber_clean = request.energy_absorber_type.strip().lower().replace("-", "").replace(":", "").replace("_", "")
    is_en958 = "en958" in absorber_clean or request.energy_absorber_type == "tearing_webbing_en958"

    if effective_weight < 40.0:
        weight_status = "underweight_warning"
    elif effective_weight > 120.0:
        weight_status = "overweight_danger"
    else:
        weight_status = "within_en958_range"

    en958_compliant = is_en958 and (40.0 <= effective_weight <= 120.0)

    if not is_en958:
        lanyard_safety_status = "critical_hazard"
        estimated_impact_force_kn = 16.5
    elif effective_weight < 40.0 or effective_weight > 120.0:
        lanyard_safety_status = "weight_out_of_spec"
        if effective_weight < 40.0:
            estimated_impact_force_kn = 3.2
        else:
            estimated_impact_force_kn = round(6.0 + ((effective_weight - 120.0) * 0.08), 2)
    else:
        lanyard_safety_status = "certified_safe"
        estimated_impact_force_kn = round(3.5 + ((effective_weight - 40.0) / 80.0) * 2.3, 2)

    if request.rest_lanyard_attached:
        if route.rest_lanyard_recommended:
            rest_lanyard_advisory = (
                "Rest lanyard (short dynamic sling + screwgate carabiner) confirmed attached. "
                "Strongly recommended for this route to rest at anchor pegs and relieve forearm fatigue without stressing the tear webbing absorber."
            )
        else:
            rest_lanyard_advisory = (
                "Rest lanyard confirmed attached. While this route is moderately graded, "
                "having a dedicated rest lanyard provides convenient hands-free security during traffic delays."
            )
    else:
        if route.rest_lanyard_recommended:
            rest_lanyard_advisory = (
                f"WARNING: Rest lanyard is NOT attached! {route.title} has sustained steep/exposed sections "
                f"({route.exposure_level} exposure, grade {route.grade}). A short rest lanyard is strongly recommended to clip into rungs or eyebolts for resting."
            )
        else:
            rest_lanyard_advisory = (
                "Rest lanyard is not attached. Acceptable for moderately difficult ascents, "
                "but ensure you do not sit or hang directly onto the Y-lanyard tear arms."
            )

    safety_advisories = [
        "Via ferrata fall factors can exceed 5.0 (fall distance between cable pins divided by short lanyard length). "
        "Never use standard climbing static slings or dynamic ropes without an EN 958:2017 certified energy absorption system.",
        f"Route: {route.title} ({route.grade}, {route.cable_length_m}m cable). "
        "Always maintain continuous attachment with at least one Type K carabiner while transitioning past intermediate cable anchor brackets.",
    ]
    if route.suspension_bridge_span_m > 0:
        safety_advisories.append(
            f"Suspension bridge span: {route.suspension_bridge_span_m}m. Clip both carabiners to the main load cable and maintain single-person spacing."
        )
    if not en958_compliant:
        if not is_en958:
            safety_advisories.append(
                "CRITICAL HAZARD: Non-EN958 static rigging can generate lethal deceleration forces (>12 kN) during a fall."
            )
        elif effective_weight < 40.0:
            safety_advisories.append(
                "WARNING: Climber weight under 40 kg requires a top-rope belay backup; tear webbing may not deploy progressively."
            )
        elif effective_weight > 120.0:
            safety_advisories.append(
                "WARNING: Total mass exceeds 120 kg EN 958 threshold; risk of bottoming out absorber brake length."
            )

    safety_notice = " ".join(safety_advisories)

    return RiggingPlanResponse(
        route_id=route.route_id,
        route_title=route.title,
        route_grade=route.grade,
        effective_weight_kg=effective_weight,
        weight_status=weight_status,
        lanyard_safety_status=lanyard_safety_status,
        estimated_impact_force_kn=estimated_impact_force_kn,
        rest_lanyard_advisory=rest_lanyard_advisory,
        safety_notice=safety_notice,
        en958_compliant=en958_compliant,
    )


def get_via_ferrata_gear() -> list[ViaFerrataGearRequirement]:
    return list(DEFAULT_VIA_FERRATA_GEAR)


def detect_via_ferrata_intent(message: str) -> Optional[ViaFerrataIntent]:
    if not message or not message.strip():
        return None

    q = message.lower()

    # Exclusions for unrelated general e-commerce
    ecommerce_exclusions = [
        "refund",
        "order #",
        "return label",
        "shipping tracking",
        "water filter",
        "fire ban",
        "canyoneering",
        "packrafting",
        "fly fishing",
        "foraging",
        "bikepacking",
        "whitewater",
        "hot spring",
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

    # CRITICAL DISAMBIGUATION: Strictly guard against glacier mountaineering keywords in mountaineering.py!
    glacier_mountaineering_exclusions = [
        "glacier mountaineering",
        "crevasse rescue",
        "glacier travel",
        "rope team",
        "snow picket",
        "z-pulley",
        "z pulley",
        "crevasse",
        "ice axe",
        "crampon",
        "glacier climbing",
        "disappointment cleaver",
    ]
    if any(gx in q for gx in glacier_mountaineering_exclusions):
        return None

    # Via ferrata domain keywords
    vf_keywords = [
        "via ferrata",
        "iron way",
        "klettersteig",
        "cable route",
        "cable routes",
        "en 958",
        "en958",
        "energy absorber",
        "type k carabiner",
        "type k carabiners",
        "type k",
        "telluride via ferrata",
        "ouray via ferrata",
        "whistler peak via ferrata",
        "mammoth iron crest",
        "rest lanyard via ferrata",
        "stepping irons cable",
        "rest lanyard",
        "rest sling",
        "iron crest",
        "gold mountain via ferrata",
        "stepping irons",
        "fall factor",
        "iron ladder",
        "cable system",
    ]
    if not any(k in q for k in vf_keywords):
        return None

    # Identify route
    route_id = None
    if "telluride" in q or "ajax" in q:
        route_id = "telluride-via-ferrata"
    elif "olympus" in q:
        route_id = "mount-olympus-iron-way"
    elif "ouray" in q or "gold mountain" in q:
        route_id = "ouray-via-ferrata-gold-mountain"
    elif "whistler" in q:
        route_id = "whistler-peak-via-ferrata"
    elif "mammoth" in q or "iron crest" in q:
        route_id = "mammoth-mountain-iron-crest"

    # Identify grade
    grade = None
    if "grade e" in q or "grade_e" in q:
        grade = "grade_e_extremely_difficult"
    elif "grade d" in q or "grade_d" in q:
        grade = "grade_d_very_difficult"
    elif "grade c" in q or "grade_c" in q:
        grade = "grade_c_difficult"
    elif "grade b" in q or "grade_b" in q:
        grade = "grade_b_moderately_difficult"
    elif "grade a" in q or "grade_a" in q:
        grade = "grade_a_easy"

    # Identify action
    if any(
        k in q
        for k in [
            "rigging",
            "rigging plan",
            "fall factor",
            "energy absorber",
            "impact force",
            "weight",
            "effective weight",
            "absorber",
            "en 958 lanyard",
            "en958",
            "calculate",
        ]
    ):
        action = "rigging_plan"
    elif any(
        k in q
        for k in [
            "gear",
            "checklist",
            "equipment",
            "type k",
            "carabiner",
            "carabiners",
            "harness",
            "helmet",
            "gloves",
            "kit",
            "mandatory",
        ]
    ):
        action = "gear_checklist"
    elif route_id and any(
        k in q
        for k in [
            "detail",
            "details",
            "about",
            "tell me about",
            "highlights",
            "bridge",
            "cable length",
            "elevation",
            "gain",
        ]
    ):
        action = "route_detail"
    elif any(
        k in q
        for k in [
            "routes",
            "catalog",
            "options",
            "list",
            "all",
            "recommend",
            "grade",
        ]
    ):
        action = "routes_list"
    elif route_id:
        action = "route_detail"
    else:
        action = "routes_list"

    return ViaFerrataIntent(
        action=action,
        route_id=route_id,
        grade=grade,
        region=None,
    )


def build_via_ferrata_prompt(intent: ViaFerrataIntent) -> str:
    lines = ["Alpine Via Ferrata & Fall-Arrest Rigging Tooling:"]

    if intent.route_id:
        route = get_via_ferrata_route_by_id(intent.route_id)
        if route:
            lines.append(
                f"- Via Ferrata Route: {route.title} ({route.region})\n"
                f"  Grade: {route.grade} | Exposure: {route.exposure_level} | Cable: {route.cable_length_m}m\n"
                f"  Distance: {route.distance_km} km | Vertical Gain: {route.vertical_gain_m}m | Duration: ~{route.typical_duration_hours} hrs\n"
                f"  Suspension Bridge: {route.suspension_bridge_span_m}m | Rest Lanyard Recommended: {route.rest_lanyard_recommended}\n"
                f"  Description: {route.description}\n"
                f"  Key Highlights: {'; '.join(route.highlights)}"
            )
    elif intent.grade:
        routes = get_via_ferrata_routes(grade=intent.grade)
        formatted = [f"{r.title} ({r.grade}, {r.cable_length_m}m cable)" for r in routes]
        lines.append(f"- Matching {intent.grade} Routes: {', '.join(formatted)}")
    else:
        routes = get_via_ferrata_routes()
        formatted = [f"{r.title} ({r.grade}, {r.region})" for r in routes]
        lines.append(f"- Iconic Via Ferrata Routes Catalog: {', '.join(formatted)}")

    lines.extend(
        [
            "- Mandatory Via Ferrata & Fall-Arrest Kit Compliance:",
            "  1. EN 958:2017 Certified Y-Lanyard with Progressive Tearing Energy Absorber.",
            "  2. Dual Ergonomic Palm-Squeeze Auto-Locking Carabiners (Type K).",
            "  3. CE/UIAA Certified Sit Climbing Harness with Reinforced Belay Loop.",
            "  4. EN 12492 Certified Mountaineering & Rock Climbing Helmet.",
            "  5. Short Dynamic Rest Sling (15-30cm) with Screwgate Carabiner.",
            "  6. Sticky Rubber Approach Shoes and Reinforced Half-Finger Climbing Gloves.",
            "- Via Ferrata Fall Factor & Rigging Principles: Cable falls generate extreme fall factors (often >5.0) due to unyielding steel cable runs between anchor brackets. Never use static slings without certified tear webbing absorbers. Rest lanyards must be clipped to iron rungs/anchors, never hanging from energy-absorber arms.",
        ]
    )

    return "\n".join(lines)


def format_via_ferrata_response(intent: ViaFerrataIntent) -> dict[str, Any]:
    if intent.action == "rigging_plan":
        target_route_id = intent.route_id or "telluride-via-ferrata"
        try:
            req = RiggingPlanRequest(route_id=target_route_id)
            plan_res = calculate_rigging_plan(req)
            answer = (
                f"Via Ferrata Rigging Plan for {plan_res.route_title} ({plan_res.route_grade}): "
                f"Lanyard safety status is {plan_res.lanyard_safety_status.upper()}. "
                f"Effective weight: {plan_res.effective_weight_kg} kg ({plan_res.weight_status}). "
                f"Estimated fall impact force: {plan_res.estimated_impact_force_kn} kN (EN 958 compliant: {plan_res.en958_compliant}). "
                f"{plan_res.rest_lanyard_advisory} "
                f"{plan_res.safety_notice}"
            )
            return {
                "answer": answer,
                "via_ferrata_info": {
                    "action": "rigging_plan",
                    "plan": plan_res.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "route_detail" and intent.route_id:
        route = get_via_ferrata_route_by_id(intent.route_id)
        if route:
            bridge_desc = f" Bridge Span: {route.suspension_bridge_span_m}m." if route.suspension_bridge_span_m > 0 else ""
            rest_desc = " Rest lanyard strongly recommended." if route.rest_lanyard_recommended else ""
            answer = (
                f"{route.title} ({route.region}): Grade: {route.grade}. Exposure: {route.exposure_level}. "
                f"Distance: {route.distance_km} km, Gain: {route.vertical_gain_m}m, Cable length: {route.cable_length_m}m, Duration: ~{route.typical_duration_hours} hrs."
                f"{bridge_desc}{rest_desc} {route.description} Highlights: {', '.join(route.highlights)}."
            )
            return {
                "answer": answer,
                "via_ferrata_info": {
                    "action": "route_detail",
                    "route": route.model_dump(),
                },
            }

    if intent.action == "gear_checklist":
        gear = get_via_ferrata_gear()
        gear_names = "; ".join(f"{g.name} ({g.purpose})" for g in gear[:3])
        answer = (
            f"Mandatory Via Ferrata Gear Checklist (EN 958 & Type K Compliant): {gear_names}; "
            f"plus {', '.join(g.name for g in gear[3:])}. "
            "Inspect carabiner gate snap-back and tearing absorber pouch integrity prior to every ascent."
        )
        return {
            "answer": answer,
            "via_ferrata_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in gear],
            },
        }

    # Default: routes_list
    routes = get_via_ferrata_routes(grade=intent.grade)
    routes_summary = "; ".join(
        f"{r.title} ({r.grade}, {r.cable_length_m}m cable, {r.region})" for r in routes
    )
    answer = (
        f"Alpine Via Ferrata & Iron Way Routes: {routes_summary}. "
        "All routes require EN 958:2017 certified energy-absorbing lanyards and Type K locking carabiners."
    )
    return {
        "answer": answer,
        "via_ferrata_info": {
            "action": "routes_list",
            "routes": [r.model_dump() for r in routes],
        },
    }
