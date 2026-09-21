from typing import Any, Optional

from pydantic import BaseModel, Field


class GlacierRouteModel(BaseModel):
    route_id: str
    peak_name: str
    route_name: str
    region: str
    elevation_ft: int
    vertical_gain_ft: int
    glacier_grade: str
    crevasse_risk: str
    recommended_team_size: int
    typical_ascent_hours: float
    recommended_rope_length_m: int
    crampon_type: str
    description: str
    crux_features: list[str] = Field(default_factory=list)


class RopeTeamPlanRequest(BaseModel):
    route_id: str
    team_members_count: int = 3
    snowpack_firmness: str = "dense_firn"
    rescue_haul_system: str = "z_pulley_3_to_1"


class RopeTeamPlanResponse(BaseModel):
    route_id: str
    peak_and_route: str
    rope_spacing_meters: float
    brake_knots_required: bool
    snow_pickets_required: int
    prerigged_prusiks_count: int
    mechanical_advantage: str
    turnaround_time_hours: float
    safety_warning: Optional[str] = None


class GlacierGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool = True
    purpose: str


class MountaineeringIntent(BaseModel):
    action: str  # "routes_list", "route_detail", "rope_team_plan", "gear_checklist"
    route_id: Optional[str] = None
    glacier_grade: Optional[str] = None
    peak_name: Optional[str] = None


DEFAULT_GLACIER_ROUTES: dict[str, GlacierRouteModel] = {
    "rainier-disappointment-cleaver": GlacierRouteModel(
        route_id="rainier-disappointment-cleaver",
        peak_name="Mount Rainier",
        route_name="Disappointment Cleaver",
        region="Cascade Range, Washington",
        elevation_ft=14411,
        vertical_gain_ft=9000,
        glacier_grade="grade_iii",
        crevasse_risk="extreme",
        recommended_team_size=3,
        typical_ascent_hours=14.0,
        recommended_rope_length_m=60,
        crampon_type="semi_automatic",
        description="The most iconic glaciated volcano route in the contiguous US, traversing Ingraham Glacier, ascending the loose rock cleaver, and negotiating high-altitude bergschrunds to Columbia Crest.",
        crux_features=[
            "Ingraham Direct vs Disappointment Cleaver route transition",
            "Upper Bergschrund crevasse crossing at 13,500 ft",
            "Active rockfall in the Bowling Alley chute",
        ],
    ),
    "baker-coleman-deming": GlacierRouteModel(
        route_id="baker-coleman-deming",
        peak_name="Mount Baker",
        route_name="Coleman-Deming Glacier",
        region="North Cascades, Washington",
        elevation_ft=10781,
        vertical_gain_ft=7000,
        glacier_grade="grade_ii",
        crevasse_risk="high",
        recommended_team_size=3,
        typical_ascent_hours=10.0,
        recommended_rope_length_m=50,
        crampon_type="semi_automatic",
        description="Classic moderately technical glacier climb navigating active Coleman Glacier serac fields, the Deming Glacier saddle, and steep 40-degree snow on the Roman Wall.",
        crux_features=[
            "Coleman Glacier crevasse maze and serac fall line",
            "Deming Col wind slab transitions",
            "Steep 40-degree firm snow on Roman Wall",
        ],
    ),
    "shasta-avalanche-gulch": GlacierRouteModel(
        route_id="shasta-avalanche-gulch",
        peak_name="Mount Shasta",
        route_name="Avalanche Gulch & Clear Creek",
        region="Cascade Range, Northern California",
        elevation_ft=14179,
        vertical_gain_ft=7300,
        glacier_grade="grade_ii",
        crevasse_risk="moderate",
        recommended_team_size=2,
        typical_ascent_hours=11.0,
        recommended_rope_length_m=30,
        crampon_type="strap_on",
        description="High-altitude volcano snow climb beginning at Bunny Flat, rising through Helen Lake, and tackling the Red Banks chute before the grueling Misery Hill plateau.",
        crux_features=[
            "Red Banks chimney chute and active rockfall",
            "Misery Hill high-elevation endurance threshold",
            "Early morning refrozen boilerplate snowpack",
        ],
    ),
    "hood-south-side-pearly-gates": GlacierRouteModel(
        route_id="hood-south-side-pearly-gates",
        peak_name="Mount Hood",
        route_name="South Side via Pearly Gates / Old Chute",
        region="Cascade Range, Oregon",
        elevation_ft=11249,
        vertical_gain_ft=5300,
        glacier_grade="grade_ii",
        crevasse_risk="high",
        recommended_team_size=2,
        typical_ascent_hours=8.0,
        recommended_rope_length_m=30,
        crampon_type="semi_automatic",
        description="Iconic Oregon stratovolcano ascent featuring Hogsback ridge, steaming fumaroles at Devil's Kitchen, and steep 45-degree rime ice gullies through the Pearly Gates or Old Chute.",
        crux_features=[
            "Hogsback bergschrund crossing",
            "Pearly Gates 45-degree rime ice chute",
            "Hot sulfur fumaroles and falling ice hazards",
        ],
    ),
    "olympus-blue-glacier": GlacierRouteModel(
        route_id="olympus-blue-glacier",
        peak_name="Mount Olympus",
        route_name="Blue Glacier via Hoh River",
        region="Olympic Mountains, Washington",
        elevation_ft=7980,
        vertical_gain_ft=8200,
        glacier_grade="grade_iv",
        crevasse_risk="extreme",
        recommended_team_size=3,
        typical_ascent_hours=18.0,
        recommended_rope_length_m=60,
        crampon_type="semi_automatic",
        description="Extremely remote wilderness alpine expedition combining an 18-mile rainforest approach with extensive Blue Glacier icefall navigation and a 4th class/5.4 summit rock tower.",
        crux_features=[
            "18-mile Hoh River rainforest wilderness approach",
            "Blue Glacier lateral moraine rope ladder and serac maze",
            "West Peak 4th class to 5.4 exposed summit horn block",
        ],
    ),
}

DEFAULT_GLACIER_GEAR: list[GlacierGearRequirement] = [
    GlacierGearRequirement(
        item_id="ice-axe-steel",
        name="CE/UIAA Certified Steel Mountaineering Ice Axe",
        category="hardware",
        mandatory=True,
        purpose="Arrest self and partner falls on steep glaciated slopes and aid ascending snow steps.",
    ),
    GlacierGearRequirement(
        item_id="crampons-steel-12pt",
        name="10-to-12 Point Steel Mountaineering Crampons with Anti-Balling Plates",
        category="hardware",
        mandatory=True,
        purpose="Provide essential bite on firm glacier ice, firn, and steep summit chutes.",
    ),
    GlacierGearRequirement(
        item_id="dry-rope-glacier",
        name="Dynamic Dry-Treated Mountaineering Rope (30m-60m)",
        category="soft_goods",
        mandatory=True,
        purpose="Team glacier rope travel, arresting crevasse falls, and building rescue haul systems.",
    ),
    GlacierGearRequirement(
        item_id="crevasse-rescue-kit",
        name="Crevasse Rescue Pulley Kit (Micro-Traxion, Tibloc, Prusiks)",
        category="rescue",
        mandatory=True,
        purpose="Mechanical advantage hauling (3:1 Z-pulley / 2:1 drop-loop) and partner crevasse extraction.",
    ),
    GlacierGearRequirement(
        item_id="snow-picket-aluminum",
        name="T-Profile Aluminum Snow Picket (50cm+) with Wired Runner",
        category="protection",
        mandatory=True,
        purpose="Establish deadman snow anchors and vertical pickets for belays and crevasse rescue.",
    ),
    GlacierGearRequirement(
        item_id="climbing-helmet-glacier",
        name="UIAA Climbing Helmet with Headlamp Retainers",
        category="protection",
        mandatory=True,
        purpose="Crucial defense against overhead icefall, serac collapse, and rockfall on volcanic routes.",
    ),
]


def get_glacier_routes(grade: Optional[str] = None) -> list[GlacierRouteModel]:
    routes = list(DEFAULT_GLACIER_ROUTES.values())
    if grade:
        return [r for r in routes if r.glacier_grade == grade]
    return routes


def get_glacier_route_by_id(route_id: str) -> Optional[GlacierRouteModel]:
    return DEFAULT_GLACIER_ROUTES.get(route_id)


def calculate_rope_team_plan(req: RopeTeamPlanRequest) -> RopeTeamPlanResponse:
    route = get_glacier_route_by_id(req.route_id)
    if not route:
        raise ValueError(f"Glacier route '{req.route_id}' not found")

    climbers = max(2, min(5, req.team_members_count))
    spacing_map = {2: 15.0, 3: 12.0, 4: 10.0, 5: 8.0}
    rope_spacing = spacing_map.get(climbers, 12.0)
    if req.snowpack_firmness in ("soft_wet_spring", "fresh_powder"):
        rope_spacing += 2.0

    brake_knots_required = (
        climbers <= 2
        or req.snowpack_firmness in ("soft_wet_spring", "fresh_powder")
        or route.crevasse_risk == "extreme"
    )

    base_pickets = max(2, climbers)
    if req.snowpack_firmness in ("soft_wet_spring", "fresh_powder") or route.crevasse_risk in (
        "high",
        "extreme",
    ):
        snow_pickets_required = base_pickets + 1
    else:
        snow_pickets_required = base_pickets

    prerigged_prusiks_count = climbers * 2

    haul_map = {
        "z_pulley_3_to_1": "3:1 Z-Pulley (Simple Haul)",
        "c_pulley_2_to_1": "2:1 C-Pulley (Drop Loop)",
        "compound_6_to_1": "6:1 Compound Pulley System",
    }
    mechanical_advantage = haul_map.get(req.rescue_haul_system, "3:1 Z-Pulley (Simple Haul)")

    turnaround_hours = round(route.typical_ascent_hours * 0.65, 1)
    if req.snowpack_firmness in ("soft_wet_spring", "fresh_powder"):
        turnaround_hours = max(3.0, round(turnaround_hours - 1.0, 1))

    warnings = []
    if climbers <= 2:
        warnings.append(
            "2-person rope teams have minimal arrest margin; brake knots and chest harness prusiks are strongly advised."
        )
    if req.snowpack_firmness in ("soft_wet_spring", "fresh_powder"):
        warnings.append(
            "Soft snowpack or fresh powder severely reduces crevasse bridge stability; enforce early alpine turnaround before solar warming."
        )
    if route.crevasse_risk == "extreme":
        warnings.append(
            "Extreme crevasse hazard with active serac zones; continuous roped travel and deadman anchor redundancy required."
        )

    safety_warning = " ".join(warnings) if warnings else None

    return RopeTeamPlanResponse(
        route_id=route.route_id,
        peak_and_route=f"{route.peak_name} - {route.route_name}",
        rope_spacing_meters=rope_spacing,
        brake_knots_required=brake_knots_required,
        snow_pickets_required=snow_pickets_required,
        prerigged_prusiks_count=prerigged_prusiks_count,
        mechanical_advantage=mechanical_advantage,
        turnaround_time_hours=turnaround_hours,
        safety_warning=safety_warning,
    )


def get_glacier_gear() -> list[GlacierGearRequirement]:
    return list(DEFAULT_GLACIER_GEAR)


def detect_mountaineering_intent(query: str) -> Optional[MountaineeringIntent]:
    if not query or not query.strip():
        return None

    q = query.lower()
    q_norm = q.replace("-", " ")

    # Primary triggers specifically targeted at glacier mountaineering
    triggers = [
        "glacier mountaineering",
        "crevasse rescue",
        "glacier climbing",
        "glacier travel",
        "rope team",
        "disappointment cleaver",
        "coleman deming",
        "avalanche gulch",
        "pearly gates",
        "blue glacier",
        "mountaineering ice axe",
        "crampons for glacier",
        "crampons on glacier",
        "glacier crampons",
        "snow picket",
        "snow pickets",
        "z pulley",
        "z-pulley",
        "c pulley",
        "c-pulley",
        "brake knot",
        "brake knots",
        "glacier route",
        "glacier routes",
        "glaciated peak",
        "glaciated volcano",
        "glaciated route",
        "technical glacier gear",
        "technical glacier kit",
        "crevasse hazard",
        "crevasse bridge",
    ]

    has_trigger = any(t in q_norm for t in triggers)
    if not has_trigger:
        return None

    # Disambiguation guards:
    # 1. Reject rock climbing queries that mention crag/sport/bouldering/trad rack without glacier context
    rock_climbing_terms = [
        "climbing crag",
        "climbing crags",
        "sport climbing",
        "bouldering",
        "trad climbing",
        "trad rack",
        "gym climbing",
    ]
    if any(term in q_norm for term in rock_climbing_terms) and not any(
        gk in q_norm for gk in ["glacier", "crevasse", "rope team", "snow picket", "z pulley"]
    ):
        return None

    # 2. Reject general avalanche safety/forecasting queries (unless specifically referencing Shasta's Avalanche Gulch route)
    if "avalanche gulch" not in q_norm:
        if any(
            term in q_norm
            for term in [
                "avalanche forecast",
                "avalanche danger",
                "avalanche advisory",
                "avy report",
            ]
        ):
            return None

    # 3. Reject ski touring queries
    if any(term in q_norm for term in ["ski touring", "backcountry ski", "splitboard"]):
        if not any(
            gk in q_norm
            for gk in ["crevasse", "rope team", "snow picket", "z pulley", "glacier climbing"]
        ):
            return None

    # 4. Reject pure trail hiking or trail running queries
    if any(
        term in q_norm for term in ["hiking trails", "hiking trail", "day hike", "trail running"]
    ) and not any(
        gk in q_norm
        for gk in ["glacier", "crevasse", "rope team", "ice axe", "picket", "summit climb"]
    ):
        return None

    # 5. Reject hot springs and fly fishing queries
    if any(
        term in q_norm
        for term in ["hot springs", "hot spring", "fly fishing", "fly pattern", "trout"]
    ):
        return None

    # 6. Reject guided tour / clinic / prerequisite adventure inquiries
    if any(
        term in q_norm
        for term in [
            "previous experience",
            "experience required",
            "prerequisite",
            "prerequisites",
            "guided tour",
            "guided trip",
            "guided climb",
            "adventure tour",
            "clinic",
            "lead guide",
        ]
    ):
        return None

    # Route identification
    route_id: Optional[str] = None
    peak_name: Optional[str] = None
    if "disappointment cleaver" in q_norm or (
        "rainier" in q_norm
        and any(
            k in q_norm for k in ["route", "climb", "crevasse", "cleaver", "spacing", "turnaround"]
        )
    ):
        route_id = "rainier-disappointment-cleaver"
        peak_name = "Mount Rainier"
    elif "coleman deming" in q_norm or (
        "baker" in q_norm
        and any(k in q_norm for k in ["route", "climb", "glacier", "deming", "coleman"])
    ):
        route_id = "baker-coleman-deming"
        peak_name = "Mount Baker"
    elif "avalanche gulch" in q_norm or (
        "shasta" in q_norm
        and any(k in q_norm for k in ["route", "climb", "gulch", "travel", "glacier"])
    ):
        route_id = "shasta-avalanche-gulch"
        peak_name = "Mount Shasta"
    elif "pearly gates" in q_norm or (
        "hood" in q_norm
        and any(k in q_norm for k in ["route", "climb", "gates", "pearly", "old chute"])
    ):
        route_id = "hood-south-side-pearly-gates"
        peak_name = "Mount Hood"
    elif "blue glacier" in q_norm or (
        "olympus" in q_norm and any(k in q_norm for k in ["route", "climb", "glacier", "hoh"])
    ):
        route_id = "olympus-blue-glacier"
        peak_name = "Mount Olympus"

    # Glacier grade filtering
    glacier_grade: Optional[str] = None
    if "grade ii" in q_norm or "grade 2" in q_norm:
        glacier_grade = "grade_ii"
    elif "grade iii" in q_norm or "grade 3" in q_norm:
        glacier_grade = "grade_iii"
    elif "grade iv" in q_norm or "grade 4" in q_norm:
        glacier_grade = "grade_iv"
    elif "grade v" in q_norm or "grade 5" in q_norm:
        glacier_grade = "grade_v"

    # Action detection
    rope_keywords = [
        "rope team",
        "rope spacing",
        "spacing",
        "brake knot",
        "brake knots",
        "crevasse rescue",
        "z pulley",
        "c pulley",
        "mechanical advantage",
        "haul system",
        "turnaround",
        "turnaround time",
    ]
    gear_keywords = [
        "gear checklist",
        "what gear",
        "technical glacier gear",
        "technical glacier kit",
        "ice axe",
        "crampon",
        "crampons",
        "snow picket",
        "snow pickets",
        "packing list",
        "equipment",
    ]
    detail_keywords = [
        "detail",
        "details",
        "crux",
        "crux features",
        "tell me about",
        "about",
        "elevation",
        "elevation gain",
        "profile",
        "overview",
        "guide",
        "route info",
    ]

    has_rope = any(k in q_norm for k in rope_keywords)
    has_gear = any(k in q_norm for k in gear_keywords)
    has_detail = any(k in q_norm for k in detail_keywords)

    if has_rope:
        action = "rope_team_plan"
    elif has_gear:
        action = "gear_checklist"
    elif route_id and (has_detail or not (has_rope or has_gear)):
        action = "route_detail"
    else:
        action = "routes_list"

    return MountaineeringIntent(
        action=action,
        route_id=route_id,
        glacier_grade=glacier_grade,
        peak_name=peak_name,
    )


def build_mountaineering_prompt(intent: MountaineeringIntent) -> str:
    lines = [
        "Contoso Outdoors Glacier Mountaineering & Alpine Peak Outfitting Grounding:",
        f"- Detected Intent Action: {intent.action.upper()}",
    ]

    if intent.action == "rope_team_plan":
        target_route_id = intent.route_id or "rainier-disappointment-cleaver"
        try:
            plan = calculate_rope_team_plan(RopeTeamPlanRequest(route_id=target_route_id))
            lines.extend(
                [
                    f"- Rope Team & Crevasse Rescue Calculation for {plan.peak_and_route} [ID: {plan.route_id}]:",
                    f"  * Recommended Rope Spacing: {plan.rope_spacing_meters:.1f} meters between climbers",
                    f"  * Brake Knots Required: {'Yes (Mandatory)' if plan.brake_knots_required else 'Optional / Guide Discretion'}",
                    f"  * Snow Pickets Required: {plan.snow_pickets_required} per team (T-profile deadman/vertical anchors)",
                    f"  * Pre-Rigged Prusiks: {plan.prerigged_prusiks_count} loops (waist & foot prusiks on harness)",
                    f"  * Mechanical Advantage Haul System: {plan.mechanical_advantage}",
                    f"  * Glacier Turnaround Guideline: ~{plan.turnaround_time_hours:.1f} hours into the ascent",
                ]
            )
            if plan.safety_warning:
                lines.append(f"  * Safety Alert: {plan.safety_warning}")
        except ValueError:
            pass

    elif intent.action == "gear_checklist":
        lines.extend(
            [
                "- Mandatory Technical Glacier Kit Checklist:",
                *[f"  * {g.name} [{g.category}]: {g.purpose}" for g in get_glacier_gear()],
            ]
        )

    elif intent.action == "route_detail" and intent.route_id:
        route = get_glacier_route_by_id(intent.route_id)
        if route:
            lines.extend(
                [
                    f"- Featured Route: {route.route_name} ({route.peak_name}, {route.region}) [ID: {route.route_id}]:",
                    f"  * Elevation: {route.elevation_ft} ft | Vertical Gain: +{route.vertical_gain_ft} ft",
                    f"  * Glacier Grade: {route.glacier_grade.upper()} | Crevasse Hazard: {route.crevasse_risk.upper()}",
                    f"  * Recommended Team Size: {route.recommended_team_size} climbers | Typical Ascent: ~{route.typical_ascent_hours:.0f} hrs",
                    f"  * Rope Recommendation: {route.recommended_rope_length_m}m dynamic dry rope | Crampons: {route.crampon_type}",
                    f"  * Description: {route.description}",
                    f"  * Crux Key Features: {', '.join(route.crux_features)}",
                ]
            )

    else:
        lines.append("- Glaciated Volcano & Alpine Mountaineering Catalog:")
        for r in get_glacier_routes(grade=intent.glacier_grade):
            lines.append(
                f"  * {r.peak_name} - {r.route_name} [{r.route_id}]: {r.glacier_grade}, elev {r.elevation_ft} ft, "
                f"+{r.vertical_gain_ft} ft gain, crevasse risk: {r.crevasse_risk}, team: {r.recommended_team_size}, rope: {r.recommended_rope_length_m}m"
            )

    lines.extend(
        [
            "",
            "- Glacier Travel & Mountain Safety Protocols:",
            "  * Crevasse Arrest: Roped climbers must maintain active slack control and situational vigilance on snow bridges.",
            "  * Brake Knots: Essential in warm/soft snow conditions and mandatory on 2-person teams to jam into the lip.",
            "  * Turnaround Time: Strict adherence to alpine turnaround times before solar radiation degrades snow bridges.",
            "  * Anchor Redundancy: Deadman snow pickets buried horizontal in soft firn provide maximum holding power.",
            "",
            "Assistant Guidance:",
            "- Ground recommendations directly in technical glacier grades, crevasse hazards, and rope-team spacing calculations.",
            "- Emphasize mandatory technical hardware (crampons, ice axe, dry rope, snow pickets, prusik rescue kits).",
        ]
    )

    return "\n".join(lines)


def format_mountaineering_response(intent: MountaineeringIntent) -> dict[str, Any]:
    if intent.action == "rope_team_plan":
        target_route_id = intent.route_id or "rainier-disappointment-cleaver"
        try:
            plan = calculate_rope_team_plan(RopeTeamPlanRequest(route_id=target_route_id))
            brake_str = (
                "Brake knots are mandatory" if plan.brake_knots_required else "Brake knots optional"
            )
            warning_str = f" Alert: {plan.safety_warning}" if plan.safety_warning else ""
            answer = (
                f"Rope Team & Crevasse Rescue Plan for {plan.peak_and_route}: "
                f"Recommended climber spacing is {plan.rope_spacing_meters:.1f} meters. "
                f"{brake_str}. Carry at least {plan.snow_pickets_required} snow pickets for deadman anchors "
                f"and {plan.prerigged_prusiks_count} pre-rigged harness prusiks. "
                f"Recommended rescue haul system: {plan.mechanical_advantage}. "
                f"Glacier turnaround time: ~{plan.turnaround_time_hours:.1f} hours.{warning_str}"
            )
            return {
                "answer": answer,
                "mountaineering_info": {
                    "action": "rope_team_plan",
                    "route_id": plan.route_id,
                    "peak_and_route": plan.peak_and_route,
                    "rope_spacing_meters": plan.rope_spacing_meters,
                    "brake_knots_required": plan.brake_knots_required,
                    "snow_pickets_required": plan.snow_pickets_required,
                    "prerigged_prusiks_count": plan.prerigged_prusiks_count,
                    "mechanical_advantage": plan.mechanical_advantage,
                    "turnaround_time_hours": plan.turnaround_time_hours,
                    "safety_warning": plan.safety_warning,
                    "plan": plan.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "gear_checklist":
        gear = get_glacier_gear()
        gear_summary = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Mandatory Technical Glacier Kit Checklist: "
            f"Essential glaciated peak gear includes: {gear_summary}. "
            f"Ensure dry-treated ropes, steel crampons with anti-balling plates, and crevasse rescue kits are pre-rigged."
        )
        return {
            "answer": answer,
            "mountaineering_info": {
                "action": "gear_checklist",
                "route_id": intent.route_id,
                "gear": [g.model_dump() for g in gear],
                "mandatory_count": len([g for g in gear if g.mandatory]),
            },
        }

    if intent.action == "route_detail" and intent.route_id:
        route = get_glacier_route_by_id(intent.route_id)
        if route:
            crux_str = ", ".join(route.crux_features)
            answer = (
                f"Glacier Route: {route.peak_name} — {route.route_name} ({route.region}). "
                f"Elevation: {route.elevation_ft} ft, Gain: +{route.vertical_gain_ft} ft. "
                f"Grade: {route.glacier_grade.upper()} | Crevasse Risk: {route.crevasse_risk.upper()}. "
                f"Recommended Team: {route.recommended_team_size} climbers, ~{route.typical_ascent_hours:.0f} hrs ascent. "
                f"Rope: {route.recommended_rope_length_m}m dry rope, Crampons: {route.crampon_type}. "
                f"{route.description} Crux Features: {crux_str}."
            )
            return {
                "answer": answer,
                "mountaineering_info": {
                    "action": "route_detail",
                    "route_id": route.route_id,
                    "route": route.model_dump(),
                },
            }

    # Default to routes_list
    routes = get_glacier_routes(grade=intent.glacier_grade)
    routes_summary = "; ".join(
        f"{r.peak_name} - {r.route_name} ({r.glacier_grade}, elev {r.elevation_ft} ft, +{r.vertical_gain_ft} ft gain, crevasse: {r.crevasse_risk})"
        for r in routes
    )
    answer = (
        f"Featured Pacific Northwest & Western Glaciated Volcano Routes: {routes_summary}. "
        f"Ask about specific route crux details, rope team spacing and crevasse rescue calculations, or the mandatory technical glacier gear checklist."
    )
    return {
        "answer": answer,
        "mountaineering_info": {
            "action": "routes_list",
            "glacier_grade": intent.glacier_grade,
            "routes": [r.model_dump() for r in routes],
        },
    }
