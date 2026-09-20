import re
from typing import Any, Optional

from pydantic import BaseModel


class TrailRunRouteModel(BaseModel):
    route_id: str
    name: str
    region: str
    distance_miles: float
    elevation_gain_ft: int
    elevation_loss_ft: int
    technical_difficulty: str  # "moderate", "advanced", "expert"
    terrain: str
    refill_points: int
    estimated_fast_time_hrs: float
    recommended_drop_mm: str
    lug_depth_mm: str
    description: str


class PacingCalculationRequest(BaseModel):
    route_id: str
    target_pace_min_mile: float = 12.0
    runner_weight_lbs: float = 150.0
    ambient_temp_f: float = 65.0


class PacingCalculationResponse(BaseModel):
    route_id: str
    route_name: str
    estimated_time_hours: float
    total_calories_kcal: int
    hourly_carbs_grams: int
    fluid_liters_total: float
    electrolytes_mg_hourly: int
    hydration_vest_min_capacity_l: float
    pacing_splits: list[str]


class MandatoryGearRequirement(BaseModel):
    item_id: str
    name: str
    mandatory: bool = True
    category: str
    purpose: str


class TrailRunningIntent(BaseModel):
    action: str  # "routes_list", "route_detail", "pacing_calc", "gear_compliance"
    route_id: Optional[str] = None
    difficulty: Optional[str] = None
    distance_miles: Optional[float] = None


DEFAULT_TRAIL_RUN_ROUTES: dict[str, TrailRunRouteModel] = {
    "enchantments-thru-run": TrailRunRouteModel(
        route_id="enchantments-thru-run",
        name="The Enchantments Thru-Run",
        region="Central Cascades (Leavenworth, WA)",
        distance_miles=19.5,
        elevation_gain_ft=4500,
        elevation_loss_ft=6500,
        technical_difficulty="expert",
        terrain="Alpine granite slabs, steep Aasgard Pass scree, technical boulder fields, snowpack",
        refill_points=6,
        estimated_fast_time_hrs=6.5,
        recommended_drop_mm="4mm - 6mm",
        lug_depth_mm="4mm - 5mm Vibram Megagrip",
        description=(
            "Iconic point-to-point alpine ultra thru-run traversing Stuart Range via Aasgard Pass to Snow Lakes trailhead."
        ),
    ),
    "timberline-trail-ultra": TrailRunRouteModel(
        route_id="timberline-trail-ultra",
        name="Timberline Trail Ultra",
        region="Mount Hood (Cascade Range, OR)",
        distance_miles=41.5,
        elevation_gain_ft=9000,
        elevation_loss_ft=9000,
        technical_difficulty="advanced",
        terrain="Volcanic singletrack, unbridged glacial river fords (Sandy, Muddy Fork), alpine moraines, ridge traverses",
        refill_points=8,
        estimated_fast_time_hrs=9.5,
        recommended_drop_mm="4mm - 8mm",
        lug_depth_mm="4.5mm - 6mm multidirectional lugs",
        description=(
            "Circumnavigation of Mount Hood offering sustained vertical oscillation, glacial river hazards, and panoramic volcanic vistas."
        ),
    ),
    "wonderland-trail-fastpack": TrailRunRouteModel(
        route_id="wonderland-trail-fastpack",
        name="Wonderland Trail Fastpack",
        region="Mount Rainier National Park, WA",
        distance_miles=93.0,
        elevation_gain_ft=24000,
        elevation_loss_ft=24000,
        technical_difficulty="expert",
        terrain="Relentless vertical ascents and descents, temperate rainforest roots, glacial valleys, ridge singletrack",
        refill_points=15,
        estimated_fast_time_hrs=28.0,
        recommended_drop_mm="6mm - 8mm",
        lug_depth_mm="5mm deep lugs",
        description=(
            "Premier multi-day alpine fastpack loop circling Mount Rainier with 24,000 feet of punishing elevation change."
        ),
    ),
    "si-mailbox-vertical-double": TrailRunRouteModel(
        route_id="si-mailbox-vertical-double",
        name="Mount Si & Mailbox Peak Vertical Double",
        region="North Bend (I-90 Corridor, WA)",
        distance_miles=16.2,
        elevation_gain_ft=7100,
        elevation_loss_ft=7100,
        technical_difficulty="advanced",
        terrain="Steep old trail root staircases, rocky scree scrambles, steep technical forest singletrack",
        refill_points=2,
        estimated_fast_time_hrs=4.5,
        recommended_drop_mm="4mm - 6mm",
        lug_depth_mm="5mm - 6mm sticky rubber",
        description=(
            "Notorious Seattle mountain runner vertical power-double combining Mount Si and Mailbox Peak Old Trail."
        ),
    ),
    "olympic-coast-wilderness-run": TrailRunRouteModel(
        route_id="olympic-coast-wilderness-run",
        name="Olympic Coast Wilderness Run",
        region="Olympic National Park (Wilderness Coast, WA)",
        distance_miles=28.0,
        elevation_gain_ft=2200,
        elevation_loss_ft=2200,
        technical_difficulty="moderate",
        terrain="Intertidal gravel and sand, slick kelp rocks, sea stack boulder scrambles, overland headland ropes and ladders",
        refill_points=5,
        estimated_fast_time_hrs=6.0,
        recommended_drop_mm="0mm - 4mm",
        lug_depth_mm="3.5mm - 4.5mm wet-traction compound",
        description=(
            "Rugged coastal wilderness ultra run requiring low-tide window synchronization and technical headland scrambling."
        ),
    ),
}

MANDATORY_GEAR_CATALOG: list[MandatoryGearRequirement] = [
    MandatoryGearRequirement(
        item_id="hydration-vest",
        name="Mountain Ultra Hydration Vest (10L-12L)",
        mandatory=True,
        category="hydration_pack",
        purpose="Carriage for 2L minimum fluids, mandatory thermal layers, microspikes, nutrition, and emergency bivy.",
    ),
    MandatoryGearRequirement(
        item_id="emergency-bivy",
        name="Ultralight Thermal Emergency Bivy",
        mandatory=True,
        category="safety_shelter",
        purpose="Life-saving hypothermia protection and heat retention during forced immobilization or severe alpine squalls.",
    ),
    MandatoryGearRequirement(
        item_id="microspikes",
        name="Ultralight Trail Running Microspikes",
        mandatory=True,
        category="traction",
        purpose="Crucial mechanical traction over steep frozen snowpack, glacial headwalls, and late-season alpine ice bridges.",
    ),
    MandatoryGearRequirement(
        item_id="waterproof-shell",
        name="Ultralight Taped-Seam Waterproof Breathable Shell (20k/20k)",
        mandatory=True,
        category="apparel",
        purpose="Protection from sudden mountain squalls, driving rain, and wind-chill hypothermia on exposed alpine ridgelines.",
    ),
    MandatoryGearRequirement(
        item_id="headlamp",
        name="Alpine Trail Running Headlamp (300+ Lumens with Spare Battery)",
        mandatory=True,
        category="lighting",
        purpose="Essential illumination for pre-dawn alpine starts, dusk descents, and emergency night navigation.",
    ),
    MandatoryGearRequirement(
        item_id="filtration-flask",
        name="Fast-Flow Microfilter Squeeze Flask",
        mandatory=True,
        category="water_filtration",
        purpose="Rapid replenishment from glacial streams and alpine tarns without slowing pace or risking waterborne pathogens.",
    ),
]


def get_trail_run_routes(difficulty: Optional[str] = None) -> list[TrailRunRouteModel]:
    routes = list(DEFAULT_TRAIL_RUN_ROUTES.values())
    if difficulty:
        diff_lower = difficulty.lower().strip()
        routes = [r for r in routes if r.technical_difficulty.lower() == diff_lower]
    return routes


def get_trail_run_route_by_id(route_id: str) -> Optional[TrailRunRouteModel]:
    clean_id = route_id.lower().strip()
    if clean_id in DEFAULT_TRAIL_RUN_ROUTES:
        return DEFAULT_TRAIL_RUN_ROUTES[clean_id]

    # Alias / name fallback
    for r in DEFAULT_TRAIL_RUN_ROUTES.values():
        if (
            clean_id == r.name.lower()
            or clean_id in r.name.lower()
            or r.route_id.replace("-", " ") in clean_id
            or clean_id in r.route_id
        ):
            return r

    return None


def calculate_trail_run_pacing(req: PacingCalculationRequest) -> PacingCalculationResponse:
    route = get_trail_run_route_by_id(req.route_id)
    if not route:
        raise ValueError(f"Route \x27{req.route_id}\x27 not found")

    # Base flat time from target pace
    base_time_hours = (route.distance_miles * req.target_pace_min_mile) / 60.0
    # Naismith vertical penalty: ~0.25 hours per 1,000 ft elevation gain
    vert_time_hours = (route.elevation_gain_ft / 1000.0) * 0.25
    # Technical difficulty modifier
    diff_factor = 1.05 if route.technical_difficulty == "expert" else (1.02 if route.technical_difficulty == "advanced" else 1.0)
    estimated_time_hours = round((base_time_hours + vert_time_hours) * diff_factor, 2)

    # Caloric burn calculation
    # Running burn rate: weight * 4.5 * speed factor
    speed_factor = (12.0 / max(req.target_pace_min_mile, 6.0)) ** 0.35
    hourly_calories = req.runner_weight_lbs * 4.5 * speed_factor
    total_calories_kcal = int(round(hourly_calories * estimated_time_hours))

    # Hourly carbohydrate fueling (grams/hr)
    if req.target_pace_min_mile <= 10.0:
        hourly_carbs_grams = 75
    elif req.target_pace_min_mile <= 13.0:
        hourly_carbs_grams = 65
    else:
        hourly_carbs_grams = 55

    # Fluid requirements (liters/hr)
    base_fluid_l_hr = 0.65
    if req.ambient_temp_f > 65.0:
        base_fluid_l_hr += (req.ambient_temp_f - 65.0) * 0.015
    elif req.ambient_temp_f < 50.0:
        base_fluid_l_hr = max(0.45, base_fluid_l_hr - (50.0 - req.ambient_temp_f) * 0.008)
    fluid_liters_total = round(base_fluid_l_hr * estimated_time_hours, 2)

    # Electrolyte replenishment (mg sodium/hr)
    if req.ambient_temp_f > 65.0:
        electrolytes_mg_hourly = int(round(450 + (req.ambient_temp_f - 65.0) * 12))
    else:
        electrolytes_mg_hourly = 450

    # Hydration vest capacity
    if route.distance_miles >= 40.0:
        hydration_vest_min_capacity_l = 12.0
    elif route.distance_miles >= 20.0:
        hydration_vest_min_capacity_l = 8.0
    else:
        hydration_vest_min_capacity_l = 5.0

    # Splits generation (4 segments)
    q_dist = route.distance_miles / 4.0
    q_time = estimated_time_hours / 4.0
    q_gain = route.elevation_gain_ft // 4

    pacing_splits = [
        f"Quarter 1 (0.0 - {round(q_dist, 1)} mi, +{q_gain} ft): Est. Elapsed {round(q_time, 1)} hrs, Target Pace {round(req.target_pace_min_mile * 0.95, 1)} min/mi (Controlled start, preserve glycogen)",
        f"Quarter 2 ({round(q_dist, 1)} - {round(2*q_dist, 1)} mi, +{q_gain} ft): Est. Elapsed {round(2*q_time, 1)} hrs, Target Pace {round(req.target_pace_min_mile * 1.02, 1)} min/mi (Sustained climbing, consistent carb intake)",
        f"Quarter 3 ({round(2*q_dist, 1)} - {round(3*q_dist, 1)} mi, +{q_gain} ft): Est. Elapsed {round(3*q_time, 1)} hrs, Target Pace {round(req.target_pace_min_mile * 1.05, 1)} min/mi (Technical terrain management, hydration refill)",
        f"Quarter 4 ({round(3*q_dist, 1)} - {round(route.distance_miles, 1)} mi, +{q_gain} ft): Est. Elapsed {round(estimated_time_hours, 1)} hrs, Target Pace {round(req.target_pace_min_mile * 0.98, 1)} min/mi (Descent focus, final electrolyte drive)",
    ]

    return PacingCalculationResponse(
        route_id=route.route_id,
        route_name=route.name,
        estimated_time_hours=estimated_time_hours,
        total_calories_kcal=total_calories_kcal,
        hourly_carbs_grams=hourly_carbs_grams,
        fluid_liters_total=fluid_liters_total,
        electrolytes_mg_hourly=electrolytes_mg_hourly,
        hydration_vest_min_capacity_l=hydration_vest_min_capacity_l,
        pacing_splits=pacing_splits,
    )


def get_mandatory_gear_requirements() -> list[MandatoryGearRequirement]:
    return list(MANDATORY_GEAR_CATALOG)


def detect_trail_running_intent(query: str) -> Optional[TrailRunningIntent]:
    q_lower = query.lower()

    # Trail running specific keywords
    trail_running_keywords = [
        r"\btrail\s+run(?:ning)?\b",
        r"\bultramarathon(?:s)?\b",
        r"\bultra\s+run(?:ning)?\b",
        r"\bthru[- ]run(?:ning)?\b",
        r"\bfastpack(?:ing)?\b",
        r"\bmountain\s+run(?:ning)?\b",
        r"\brunning\s+pace(?:s)?\b",
        r"\bultra\s+pacing\b",
        r"\bmountain\s+ultra\b",
        r"\brunning\s+hydration\s+vest\b",
        r"\btrail\s+runner(?:s)?\b",
        r"\bultra\s+runner(?:s)?\b",
        r"\brunning\s+calories\b",
        r"\bshoe\s+drop\b",
        r"\blug\s+depth\b",
        r"\bvertical\s+double\b",
        r"\b50k\b",
        r"\b100k\b",
        r"\b100\s+miler\b",
    ]

    has_running_keyword = any(re.search(pat, q_lower) for pat in trail_running_keywords)

    # Specific trail run route matches
    matched_route_id: Optional[str] = None
    if "timberline" in q_lower:
        matched_route_id = "timberline-trail-ultra"
    elif "enchantment" in q_lower and any(w in q_lower for w in ["run", "thru-run", "pace", "ultra", "fast"]):
        matched_route_id = "enchantments-thru-run"
    elif "wonderland" in q_lower and any(w in q_lower for w in ["fastpack", "run", "ultra", "pace"]):
        matched_route_id = "wonderland-trail-fastpack"
    elif "mailbox" in q_lower and any(w in q_lower for w in ["double", "vertical", "run", "pace"]):
        matched_route_id = "si-mailbox-vertical-double"
    elif "olympic" in q_lower and "coast" in q_lower and any(w in q_lower for w in ["run", "ultra", "pace"]):
        matched_route_id = "olympic-coast-wilderness-run"

    # Explicit route ID matches
    for rid in DEFAULT_TRAIL_RUN_ROUTES:
        if rid in q_lower:
            matched_route_id = rid
            has_running_keyword = True
            break

    # If neither running keyword nor route was found, it is not trail running
    if not has_running_keyword and not matched_route_id:
        return None

    # Negative check / Disambiguation against generic hiking queries:
    # If the query is about general hiking conditions or permits and DOES NOT explicitly mention running keywords
    if not has_running_keyword:
        if re.search(r"\b(?:hiking|hike|family|conditions|permit|permits|backpacking)\b", q_lower):
            return None

    # Detect action
    if any(
        w in q_lower
        for w in [
            "mandatory gear",
            "gear compliance",
            "mandatory kit",
            "mandatory mountain ultra",
            "gear checklist",
            "required gear",
            "mandatory items",
        ]
    ):
        action = "gear_compliance"
    elif any(
        w in q_lower
        for w in [
            "pacing",
            "pace",
            "calorie",
            "calories",
            "fueling",
            "hydration rate",
            "fluid",
            "electrolytes",
            "splits",
            "calculate",
        ]
    ):
        action = "pacing_calc"
    elif matched_route_id or any(w in q_lower for w in ["shoe drop", "lug depth", "fast time", "detail", "details"]):
        action = "route_detail"
    else:
        action = "routes_list"

    # Detect difficulty
    difficulty = None
    if "expert" in q_lower:
        difficulty = "expert"
    elif "advanced" in q_lower:
        difficulty = "advanced"
    elif "moderate" in q_lower:
        difficulty = "moderate"

    # Detect distance
    distance_miles = None
    dist_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:mi|mile|miles)", q_lower)
    if dist_match:
        distance_miles = float(dist_match.group(1))

    return TrailRunningIntent(
        action=action,
        route_id=matched_route_id,
        difficulty=difficulty,
        distance_miles=distance_miles,
    )


def build_trail_running_prompt(intent: TrailRunningIntent) -> str:
    lines = [
        "Contoso Outdoors Mountain Ultra & Trail Running Advisory Grounding:",
        f"- Detected Intent Action: {intent.action.upper()}",
    ]

    if intent.route_id:
        route = get_trail_run_route_by_id(intent.route_id)
        if route:
            lines.extend(
                [
                    f"- Route: {route.name} ({route.region}) [ID: {route.route_id}]",
                    f"  * Distance: {route.distance_miles} miles | Elevation Gain: +{route.elevation_gain_ft} ft | Loss: -{route.elevation_loss_ft} ft",
                    f"  * Technical Difficulty: {route.technical_difficulty.capitalize()} | Estimated Fastpack/Run Time: {route.estimated_fast_time_hrs} hrs",
                    f"  * Terrain: {route.terrain}",
                    f"  * Refill Points: {route.refill_points} backcountry water sources",
                    f"  * Footwear Spec: Recommended Drop {route.recommended_drop_mm} | Lug Depth {route.lug_depth_mm}",
                    f"  * Description: {route.description}",
                ]
            )
    else:
        lines.append("- Mountain Ultra Routes Catalog:")
        for r in get_trail_run_routes(difficulty=intent.difficulty):
            lines.append(
                f"  * {r.name} [{r.route_id}]: {r.distance_miles} mi, +{r.elevation_gain_ft} ft gain, "
                f"difficulty: {r.technical_difficulty}, drop: {r.recommended_drop_mm}, lugs: {r.lug_depth_mm}"
            )

    lines.extend(
        [
            "",
            "- Mandatory Mountain Ultra Gear Compliance Checklist:",
            "  * Hydration Vest: minimum 10L-12L capacity with 2L fluid carriage capacity (hydration-vest)",
            "  * Emergency Bivy: reflective thermal bivy for rapid hypothermia mitigation (emergency-bivy)",
            "  * Traction Microspikes: trail running microspikes for hard alpine snow/ice (microspikes)",
            "  * Waterproof Shell: 20k/20k taped-seam storm shell (waterproof-shell)",
            "  * Alpine Headlamp: 300+ lumens with backup battery (headlamp)",
            "  * Microfiltration Flask: fast-flow squeeze filter for alpine tarns (filtration-flask)",
            "",
            "- Tactical Fueling & Hydration Guidance:",
            "  * Carbohydrate target: 60-80 grams/hour of complex/simple endurance carbs.",
            "  * Fluid replenishment: 0.6 - 0.9 Liters/hour adjusted for ambient temperature.",
            "  * Sodium/electrolytes: 450 - 650 mg/hour to maintain neuromuscular performance.",
            "",
            "Assistant Guidance:",
            "- Ground answers directly in the route stats, pacing models, and mandatory gear standards above.",
            "- Emphasize safety, hydration gaps, drop/lug trail shoe selection, and mountain weather variability.",
        ]
    )

    return "\n".join(lines)


def format_trail_running_response(intent: TrailRunningIntent) -> dict[str, Any]:
    if intent.action == "gear_compliance":
        gear = get_mandatory_gear_requirements()
        items_summary = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Mandatory Mountain Ultra Gear Compliance Kit: All mountain ultra competitors and fastpackers "
            f"must carry all 6 mandatory items: {items_summary}."
        )
        return {
            "answer": answer,
            "trail_running_info": {
                "action": "gear_compliance",
                "mandatory_gear": [g.model_dump() for g in gear],
            },
        }

    if intent.action == "pacing_calc":
        target_route_id = intent.route_id or "timberline-trail-ultra"
        try:
            pacing_res = calculate_trail_run_pacing(
                PacingCalculationRequest(
                    route_id=target_route_id,
                    target_pace_min_mile=12.0,
                    runner_weight_lbs=150.0,
                    ambient_temp_f=65.0,
                )
            )
            answer = (
                f"Mountain Ultra Pacing & Fueling Plan for {pacing_res.route_name}: "
                f"Estimated finish time: {pacing_res.estimated_time_hours} hours. "
                f"Total calories burned: {pacing_res.total_calories_kcal} kcal (caloric burn). "
                f"Nutrition target: {pacing_res.hourly_carbs_grams}g carbs/hour, {pacing_res.electrolytes_mg_hourly}mg electrolytes/hour. "
                f"Hydration demand: {pacing_res.fluid_liters_total}L total fluid (minimum vest capacity {pacing_res.hydration_vest_min_capacity_l}L). "
                f"Splits strategy: {pacing_res.pacing_splits[0]}"
            )
            return {
                "answer": answer,
                "trail_running_info": {
                    "action": "pacing_calc",
                    "route_id": target_route_id,
                    "pacing": pacing_res.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "route_detail" and intent.route_id:
        route = get_trail_run_route_by_id(intent.route_id)
        if route:
            answer = (
                f"{route.name} ({route.region}): {route.distance_miles} miles with +{route.elevation_gain_ft} ft elevation gain. "
                f"Technical difficulty: {route.technical_difficulty.upper()}. Estimated fast time: {route.estimated_fast_time_hrs} hours. "
                f"Footwear recommendation: {route.recommended_drop_mm} drop with {route.lug_depth_mm} lugs. "
                f"Terrain profile: {route.terrain}. Backcountry refill points: {route.refill_points}."
            )
            return {
                "answer": answer,
                "trail_running_info": {
                    "action": "route_detail",
                    "route": route.model_dump(),
                },
            }

    # Default to routes_list
    routes = get_trail_run_routes(difficulty=intent.difficulty)
    routes_summary = "; ".join(
        f"{r.name} ({r.distance_miles} mi, +{r.elevation_gain_ft} ft, {r.technical_difficulty})" for r in routes
    )
    answer = (
        f"Here are top mountain ultra and trail running routes: {routes_summary}. "
        f"Select a route for detailed pacing, shoe lug recommendations, or mandatory mountain ultra gear compliance."
    )
    return {
        "answer": answer,
        "trail_running_info": {
            "action": "routes_list",
            "difficulty": intent.difficulty,
            "routes": [r.model_dump() for r in routes],
        },
    }
