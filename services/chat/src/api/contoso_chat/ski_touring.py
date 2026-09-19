from typing import Any, Optional

from pydantic import BaseModel


class SkiTourRouteModel(BaseModel):
    route_id: str
    name: str
    region: str
    zone: str
    difficulty: str
    distance_miles: float
    elevation_gain_ft: int
    max_elevation_ft: int
    avg_uphill_hours: float
    avalanche_terrain_rating: str
    recommended_season: str
    skin_track_notes: str
    parking_permit_required: str
    uphill_travel_policy: str


class SkinningPaceRequest(BaseModel):
    route_id: str
    fitness_level: str = "moderate"
    snow_condition: str = "firm_skin_track"
    party_size: int = 2


class SkinningPaceResponse(BaseModel):
    route_id: str
    estimated_uphill_minutes: int
    estimated_descent_minutes: int
    total_tour_minutes: int
    vertical_feet_per_hour: int
    transition_count: int
    recommended_turnaround_time: str
    hydration_liters: float
    calories_burned: int
    gear_recommendations: list[str]


class SkiTourIntent(BaseModel):
    action: str  # "routes", "route_detail", "pace_calc", "etiquette_policy"
    route_id: Optional[str] = None
    difficulty: Optional[str] = None
    fitness_level: Optional[str] = None
    snow_condition: Optional[str] = None


DEFAULT_SKI_TOUR_ROUTES: dict[str, SkiTourRouteModel] = {
    "muir-snowfield": SkiTourRouteModel(
        route_id="muir-snowfield",
        name="Camp Muir Snowfield",
        region="Mount Rainier National Park",
        zone="volcano_alpine",
        difficulty="advanced",
        distance_miles=9.0,
        elevation_gain_ft=4600,
        max_elevation_ft=10080,
        avg_uphill_hours=4.5,
        avalanche_terrain_rating="challenging",
        recommended_season="Spring to Early Summer (April-July)",
        skin_track_notes="Glaciated snowfield ascent via Pebble Creek and Panorama Point. Crevasse hazards open late season; whiteout compass bearing/GPS track essential.",
        parking_permit_required="National Park Pass + Wilderness Permit for overnight",
        uphill_travel_policy="Permitted anytime; register at Paradise climbing kiosk or ranger station.",
    ),
    "kendal-lakes": SkiTourRouteModel(
        route_id="kendal-lakes",
        name="Kendall Lakes Peak & Knob",
        region="Snoqualmie Pass",
        zone="cascade_crest",
        difficulty="intermediate",
        distance_miles=6.5,
        elevation_gain_ft=2200,
        max_elevation_ft=5100,
        avg_uphill_hours=2.5,
        avalanche_terrain_rating="challenging",
        recommended_season="Mid-Winter to Early Spring (January-April)",
        skin_track_notes="Follows logging road before ascending through mature timber into lake basin. Watch cornices on Kendall Ridge.",
        parking_permit_required="USFS Northwest Forest Pass or Discover Pass at Gold Creek",
        uphill_travel_policy="Unrestricted backcountry travel outside Summit at Snoqualmie ski area boundaries.",
    ),
    "artist-point-table": SkiTourRouteModel(
        route_id="artist-point-table",
        name="Artist Point to Table Mountain",
        region="Mount Baker Highway (SR 542)",
        zone="west_slopes",
        difficulty="beginner_friendly",
        distance_miles=4.0,
        elevation_gain_ft=1400,
        max_elevation_ft=5100,
        avg_uphill_hours=1.8,
        avalanche_terrain_rating="simple",
        recommended_season="December to May",
        skin_track_notes="Gentle rolling ridge line with stunning views of Shuksan and Baker. Stay off steep corniced north face of Table Mountain.",
        parking_permit_required="Northwest Forest Pass",
        uphill_travel_policy="Designated uphill routes in Heather Meadows; follow Mt. Baker ski area uphill policy during operating hours.",
    ),
    "silver-basin": SkiTourRouteModel(
        route_id="silver-basin",
        name="Silver Basin & Three Way Peak",
        region="Crystal Mountain Backcountry",
        zone="cascade_crest",
        difficulty="advanced",
        distance_miles=5.5,
        elevation_gain_ft=2800,
        max_elevation_ft=6790,
        avg_uphill_hours=3.0,
        avalanche_terrain_rating="complex",
        recommended_season="January to April",
        skin_track_notes="Ascends past Campbell Basin toward Silver Basin gap and Three Way Peak col. Steep kick turns required on summit headwall; ski crampons strongly advised.",
        parking_permit_required="Crystal Mountain parking reservation / pass",
        uphill_travel_policy="Crystal Mountain uphill travel pass required if skinning within designated resort corridors before open.",
    ),
    "blewett-pass-diamond": SkiTourRouteModel(
        route_id="blewett-pass-diamond",
        name="Diamond Head via Blewett Pass",
        region="Wenatchee Mountains / East Cascades",
        zone="east_slopes",
        difficulty="beginner_friendly",
        distance_miles=7.0,
        elevation_gain_ft=1800,
        max_elevation_ft=5916,
        avg_uphill_hours=2.2,
        avalanche_terrain_rating="simple",
        recommended_season="December to March",
        skin_track_notes="Gradual forest road skin track ascending through ponderosa pines to open scenic ridge with continental snowpack.",
        parking_permit_required="Washington State Sno-Park Permit with Groomed sticker",
        uphill_travel_policy="Blewett Pass Sno-Park is public USFS land; non-motorized ski trail etiquette applies.",
    ),
}

SKIN_TRACK_ETIQUETTE_AND_POLICIES: dict[str, Any] = {
    "title": "Backcountry Skin Track Etiquette & Resort Uphill Travel Policies",
    "skin_track_etiquette": [
        "Never bootpack, posthole, or snowshoe in an established skin track. Create a separate parallel boot track outside the skin track.",
        "Yield to downhill skiers and riders when climbing on shared trails or descent lines; step off the track safely.",
        "Maintain safe spacing between group members (minimum 10-15 meters) in avalanche terrain and cross suspect slopes one at a time.",
        "Set clean, gentle skin tracks (10°-14° angle) with efficient kick turns; avoid overly steep 'hero tracks' that cause slipping and skin failure.",
        "Step off the track to adjust layers, eat, or transition; never block the skin track for following parties.",
        "Keep dogs on leash or under direct voice control, and clean up waste; keep pets out of fresh skin tracks.",
    ],
    "resort_uphill_policies": {
        "crystal_mountain": {
            "resort": "Crystal Mountain",
            "policy": "Uphill travel pass required ($49 season or included with Ikon). Permitted 6:00 AM - 8:30 AM and 4:30 PM - 8:00 PM on designated routes (Kelly's Gap / Meadow). Headlamp and reflective clothing mandatory.",
        },
        "summit_at_snoqualmie": {
            "resort": "The Summit at Snoqualmie",
            "policy": "Uphill travel pass and arm band required. Permitted during designated hours on Alpental and Summit West designated corridors. Closed during winch cat operations and avalanche mitigation.",
        },
        "mt_baker": {
            "resort": "Mt. Baker Ski Area",
            "policy": "Uphill skinning within ski area boundary prohibited during operating hours. Backcountry access gates open from Heather Meadows and White Salmon lots.",
        },
        "stevens_pass": {
            "resort": "Stevens Pass",
            "policy": "Uphill travel prohibited inside ski area boundary during winter operations. Backcountry tours utilize Pacific Crest Trail trailhead north/south of US-2.",
        },
        "mission_ridge": {
            "resort": "Mission Ridge",
            "policy": "Uphill travel pass required ($10 day / $45 season). Follow designated skin track route on Sunspot/Sitkum; uphillers must yield to downhill traffic.",
        },
    },
    "splitboard_transition_tips": [
        "Keep touring brackets and pucks clear of ice using a plastic scraper or brush before reassembling board.",
        "Dry skins glue-to-glue or on skin savers, stow inside jacket on freezing days to maintain tackiness.",
        "Lock touring risers in low/medium positions on gentle ascents; save high risers for sustained steep kick turns.",
        "Always carry spare binding screws, splitboard pins, and ski straps (Voile straps) for emergency field repairs.",
    ],
}


def get_ski_tour_routes(
    difficulty: Optional[str] = None, zone: Optional[str] = None
) -> list[SkiTourRouteModel]:
    routes = list(DEFAULT_SKI_TOUR_ROUTES.values())
    if difficulty:
        routes = [r for r in routes if r.difficulty.lower() == difficulty.strip().lower()]
    if zone:
        routes = [r for r in routes if r.zone.lower() == zone.strip().lower()]
    return routes


def get_ski_tour_route_by_id(route_id: str) -> Optional[SkiTourRouteModel]:
    key = route_id.strip().lower()
    if key in DEFAULT_SKI_TOUR_ROUTES:
        return DEFAULT_SKI_TOUR_ROUTES[key]
    for k, v in DEFAULT_SKI_TOUR_ROUTES.items():
        if k.lower() == key or v.name.lower() == key:
            return v
    return None


def calculate_skinning_pace(req: SkinningPaceRequest) -> SkinningPaceResponse:
    route = get_ski_tour_route_by_id(req.route_id)
    if not route:
        raise ValueError(f"Ski tour route '{req.route_id}' not found")

    base_vert_map = {
        "recreational": 800,
        "moderate": 1100,
        "athletic": 1500,
        "skimo_racer": 2000,
    }
    base_vert = base_vert_map.get(req.fitness_level.lower(), 1100)

    snow_mult_map = {
        "firm_skin_track": 1.05,
        "breaking_trail_powder": 0.75,
        "wet_heavy_spring": 0.85,
    }
    snow_multiplier = snow_mult_map.get(req.snow_condition.lower(), 1.0)

    party_factor = max(0.75, 1.0 - (max(1, req.party_size) - 1) * 0.03)

    vertical_feet_per_hour = round(base_vert * snow_multiplier * party_factor)
    if vertical_feet_per_hour <= 0:
        vertical_feet_per_hour = 100

    uphill_minutes = round((route.elevation_gain_ft / vertical_feet_per_hour) * 60)
    descent_minutes = round(route.distance_miles * 8)
    transition_allowance = 20
    transition_count = 2
    total_minutes = uphill_minutes + transition_allowance + descent_minutes

    hydration_liters = round((total_minutes / 60) * 0.7, 1)

    cal_rate = 12 if req.fitness_level.lower() in ("athletic", "skimo_racer") else 9
    calories = round(uphill_minutes * cal_rate)

    start_mins = 7 * 60  # 07:00 AM start
    turnaround_mins = start_mins + uphill_minutes
    turnaround_h = (turnaround_mins // 60) % 24
    turnaround_m = turnaround_mins % 60
    recommended_turnaround_time = f"{turnaround_h:02d}:{turnaround_m:02d}"

    gear = [
        "Climbing skins (tailored to ski/splitboard waist)",
        "Avalanche safety triad (transceiver, 240cm+ probe, metal shovel)",
        "Adjustable touring poles with powder baskets",
        "Splitboard touring bracket & puck tool / multi-tool",
    ]
    if (
        route.avalanche_terrain_rating in ("challenging", "complex")
        or route.elevation_gain_ft >= 2500
        or req.snow_condition.lower() == "firm_skin_track"
    ):
        gear.append("Ski crampons / splitboard crampons for icy or steep skin tracks")
    if route.zone == "volcano_alpine" or route.max_elevation_ft >= 9000:
        gear.append("Glacier travel kit (harness, prusiks, pulleys) & GPS navigation")
    if req.snow_condition.lower() == "wet_heavy_spring":
        gear.append("Skin wax / anti-glopping bar for wet snow")
    gear.extend([
        "Technical windproof/waterproof outer shell & breathable ascent midlayer",
        "Alpine headlamp with spare batteries",
    ])

    return SkinningPaceResponse(
        route_id=route.route_id,
        estimated_uphill_minutes=uphill_minutes,
        estimated_descent_minutes=descent_minutes,
        total_tour_minutes=total_minutes,
        vertical_feet_per_hour=vertical_feet_per_hour,
        transition_count=transition_count,
        recommended_turnaround_time=recommended_turnaround_time,
        hydration_liters=hydration_liters,
        calories_burned=calories,
        gear_recommendations=gear,
    )


def get_skin_track_etiquette_and_policies() -> dict[str, Any]:
    return SKIN_TRACK_ETIQUETTE_AND_POLICIES


def detect_ski_tour_intent(query: str) -> Optional[SkiTourIntent]:
    q = query.lower()

    # Exclusions for unrelated domains
    if any(
        w in q
        for w in [
            "refund",
            "climbing shoe",
            "kayak rental",
            "order #",
            "return label",
            "shipping tracking",
            "water filter",
            "fire ban",
        ]
    ):
        return None

    # Check for general ski touring / splitboarding indicators
    ski_tour_keywords = [
        "ski tour",
        "ski touring",
        "splitboard",
        "splitboarding",
        "skin track",
        "skinning",
        "skin up",
        "uphill travel",
        "skimo",
        "backcountry ski",
        "ski crampon",
        "uphill pace",
        "camp muir",
        "kendall lake",
        "artist point",
        "table mountain",
        "silver basin",
        "diamond head",
        "blewett pass",
        "resort uphill",
        "uphill policy",
    ]

    if not any(k in q for k in ski_tour_keywords):
        return None

    # Route matching
    route_id = None
    if any(k in q for k in ["muir", "rainier"]):
        route_id = "muir-snowfield"
    elif any(k in q for k in ["kendall", "kendal"]):
        route_id = "kendal-lakes"
    elif any(k in q for k in ["artist point", "table mountain", "baker"]):
        route_id = "artist-point-table"
    elif any(k in q for k in ["silver basin", "three way peak", "crystal"]):
        route_id = "silver-basin"
    elif any(k in q for k in ["blewett", "diamond head"]):
        route_id = "blewett-pass-diamond"

    # Difficulty detection
    difficulty = None
    if "beginner" in q:
        difficulty = "beginner_friendly"
    elif "intermediate" in q:
        difficulty = "intermediate"
    elif "advanced" in q or "expert" in q:
        difficulty = "advanced"

    # Fitness detection
    fitness_level = "moderate"
    if "recreational" in q:
        fitness_level = "recreational"
    elif "athletic" in q:
        fitness_level = "athletic"
    elif "skimo" in q or "racer" in q:
        fitness_level = "skimo_racer"
    elif "moderate" in q:
        fitness_level = "moderate"

    # Snow condition detection
    snow_condition = "firm_skin_track"
    if "powder" in q or "breaking trail" in q or "deep snow" in q:
        snow_condition = "breaking_trail_powder"
    elif "spring" in q or "wet" in q or "heavy" in q or "slush" in q:
        snow_condition = "wet_heavy_spring"
    elif "firm" in q or "icy" in q or "hard" in q or "crust" in q or "skin track" in q:
        snow_condition = "firm_skin_track"

    # Action detection
    if any(
        k in q
        for k in [
            "pace",
            "how long",
            "calculate",
            "uphill time",
            "skinning time",
            "ascent time",
            "vert per hour",
            "vertical feet",
            "calories",
            "hydration",
            "speed",
        ]
    ):
        return SkiTourIntent(
            action="pace_calc",
            route_id=route_id or "muir-snowfield",
            fitness_level=fitness_level,
            snow_condition=snow_condition,
        )

    if any(
        k in q
        for k in [
            "etiquette",
            "rule",
            "resort uphill",
            "uphill policy",
            "bootpack",
            "posthole",
            "yield",
            "transition tip",
            "puck",
        ]
    ):
        return SkiTourIntent(
            action="etiquette_policy",
            route_id=route_id,
        )

    if route_id:
        return SkiTourIntent(
            action="route_detail",
            route_id=route_id,
            difficulty=difficulty,
        )

    return SkiTourIntent(
        action="routes",
        difficulty=difficulty,
    )


def build_ski_tour_prompt(intent: SkiTourIntent) -> str:
    lines = [
        "Backcountry Ski Touring & Splitboard Planning Context:",
    ]

    if intent.action == "pace_calc" and intent.route_id:
        try:
            req = SkinningPaceRequest(
                route_id=intent.route_id,
                fitness_level=intent.fitness_level or "moderate",
                snow_condition=intent.snow_condition or "firm_skin_track",
            )
            calc = calculate_skinning_pace(req)
            route = get_ski_tour_route_by_id(intent.route_id)
            route_name = route.name if route else intent.route_id
            lines.extend([
                f"Skinning Pace Assessment for {route_name} ({req.fitness_level} fitness, {req.snow_condition} snow):",
                f"- Vertical Ascent Rate: {calc.vertical_feet_per_hour} vert ft/hr",
                f"- Estimated Uphill Time: {calc.estimated_uphill_minutes} minutes ({calc.estimated_uphill_minutes / 60:.1f} hrs)",
                f"- Estimated Descent Time: {calc.estimated_descent_minutes} minutes",
                f"- Transition Allowance: 20 minutes ({calc.transition_count} transitions)",
                f"- Total Tour Duration: {calc.total_tour_minutes} minutes ({calc.total_tour_minutes / 60:.1f} hrs)",
                f"- Recommended Turnaround Time: {calc.recommended_turnaround_time} (based on 07:00 departure)",
                f"- Hydration & Caloric Needs: {calc.hydration_liters} L water, ~{calc.calories_burned} kcal",
                f"- Key Gear: {', '.join(calc.gear_recommendations[:4])}",
            ])
        except ValueError:
            pass

    elif intent.action == "route_detail" and intent.route_id:
        route = get_ski_tour_route_by_id(intent.route_id)
        if route:
            lines.extend([
                f"Route Details: {route.name} ({route.region}):",
                f"- Zone: {route.zone} | Difficulty: {route.difficulty} | Avalanche Rating: {route.avalanche_terrain_rating}",
                f"- Distance: {route.distance_miles} miles | Elevation Gain: +{route.elevation_gain_ft} ft | Summit/High Point: {route.max_elevation_ft} ft",
                f"- Average Ascent Time: {route.avg_uphill_hours} hours",
                f"- Recommended Season: {route.recommended_season}",
                f"- Skin Track Notes: {route.skin_track_notes}",
                f"- Parking & Permits: {route.parking_permit_required}",
                f"- Uphill Travel Policy: {route.uphill_travel_policy}",
            ])

    elif intent.action == "etiquette_policy":
        etiquette_data = get_skin_track_etiquette_and_policies()
        lines.extend([
            "Skin Track Etiquette Guidelines:",
            *[f"- {rule}" for rule in etiquette_data["skin_track_etiquette"][:4]],
            "Resort Uphill Travel Policies Overview:",
            *[
                f"- {item['resort']}: {item['policy']}"
                for item in etiquette_data["resort_uphill_policies"].values()
            ],
            "Splitboard Transition Tips:",
            *[f"- {tip}" for tip in etiquette_data["splitboard_transition_tips"][:3]],
        ])

    else:
        routes = get_ski_tour_routes(difficulty=intent.difficulty)
        lines.append("Pacific Northwest Backcountry Ski Touring & Splitboard Catalog:")
        for r in routes:
            lines.append(
                f"- {r.name} ({r.route_id}): {r.difficulty}, +{r.elevation_gain_ft} ft gain, {r.distance_miles} mi, "
                f"Avalanche Rating: {r.avalanche_terrain_rating}. Notes: {r.skin_track_notes}"
            )

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Prioritize avalanche safety (beacon, probe, shovel) and terrain awareness (30°-45° prime slope angles).",
        "- Provide realistic skinning pace estimates factoring vertical gain, snow conditions, and transitions.",
        "- Emphasize skin track etiquette (never bootpack in the skin track, yield to downhill traffic, space out in avalanche terrain).",
        "- Remind backcountry travelers to obey resort uphill travel policies and carry required passes/headlamps.",
    ])

    return "\n".join(lines)


def format_ski_tour_response(intent: SkiTourIntent) -> dict[str, Any]:
    if intent.action == "pace_calc":
        target_route_id = intent.route_id or "muir-snowfield"
        try:
            req = SkinningPaceRequest(
                route_id=target_route_id,
                fitness_level=intent.fitness_level or "moderate",
                snow_condition=intent.snow_condition or "firm_skin_track",
            )
            calc = calculate_skinning_pace(req)
            route = get_ski_tour_route_by_id(target_route_id)
            route_name = route.name if route else target_route_id

            answer = (
                f"Skinning Pace Calculation for {route_name}: "
                f"Estimated uphill ascent time is {calc.estimated_uphill_minutes} minutes "
                f"({calc.estimated_uphill_minutes / 60:.1f} hours) climbing {route.elevation_gain_ft if route else 0} ft "
                f"at {calc.vertical_feet_per_hour} vertical ft/hr ({req.fitness_level} fitness, {req.snow_condition} snow). "
                f"Descent is estimated at {calc.estimated_descent_minutes} minutes with 20 minutes for transitions "
                f"({calc.transition_count} transitions), yielding a total tour time of {calc.total_tour_minutes} minutes. "
                f"Recommended turnaround time is {calc.recommended_turnaround_time}. "
                f"Hydration requirement: {calc.hydration_liters} L; estimated calorie burn: {calc.calories_burned} kcal. "
                f"Recommended gear: {'; '.join(calc.gear_recommendations[:4])}."
            )

            return {
                "answer": answer,
                "ski_tour_info": {
                    "action": "pace_calc",
                    "route_id": calc.route_id,
                    "route_name": route_name,
                    "estimated_uphill_minutes": calc.estimated_uphill_minutes,
                    "estimated_descent_minutes": calc.estimated_descent_minutes,
                    "total_tour_minutes": calc.total_tour_minutes,
                    "vertical_feet_per_hour": calc.vertical_feet_per_hour,
                    "transition_count": calc.transition_count,
                    "recommended_turnaround_time": calc.recommended_turnaround_time,
                    "hydration_liters": calc.hydration_liters,
                    "calories_burned": calc.calories_burned,
                    "gear_recommendations": calc.gear_recommendations,
                },
            }
        except ValueError:
            pass

    if intent.action == "route_detail" and intent.route_id:
        route = get_ski_tour_route_by_id(intent.route_id)
        if route:
            answer = (
                f"Backcountry Ski Tour Route: {route.name} ({route.region}). "
                f"Zone: {route.zone} | Difficulty: {route.difficulty} | Avalanche Terrain: {route.avalanche_terrain_rating}. "
                f"Stats: {route.distance_miles} miles, +{route.elevation_gain_ft} ft elevation gain, max elevation {route.max_elevation_ft} ft. "
                f"Average uphill time: {route.avg_uphill_hours} hours. Recommended season: {route.recommended_season}. "
                f"Skin track notes: {route.skin_track_notes} "
                f"Parking/Permit: {route.parking_permit_required}. Resort/Uphill Policy: {route.uphill_travel_policy}"
            )
            return {
                "answer": answer,
                "ski_tour_info": {
                    "action": "route_detail",
                    "route": route.model_dump(),
                },
            }

    if intent.action == "etiquette_policy":
        etiquette_data = get_skin_track_etiquette_and_policies()
        rules_str = " ".join(etiquette_data["skin_track_etiquette"][:3])
        policies_str = "; ".join(
            f"{p['resort']}: {p['policy']}"
            for p in list(etiquette_data["resort_uphill_policies"].values())[:2]
        )
        answer = (
            f"Backcountry Skin Track Etiquette & Resort Policies: {rules_str} "
            f"Key Resort Policies: {policies_str}. "
            "Never bootpack in the skin track, yield to downhill traffic, and verify local resort uphill access passes."
        )
        return {
            "answer": answer,
            "ski_tour_info": {
                "action": "etiquette_policy",
                "etiquette_and_policies": etiquette_data,
            },
        }

    # Default "routes"
    routes = get_ski_tour_routes(difficulty=intent.difficulty)
    routes_summary = "; ".join(
        f"{r.name} ({r.difficulty}, +{r.elevation_gain_ft} ft, {r.distance_miles} mi)"
        for r in routes
    )
    answer = (
        f"Pacific Northwest Backcountry Ski Touring & Splitboard Routes: {routes_summary}. "
        "Always check avalanche forecasts (NWAC), verify gear (beacon, shovel, probe), and respect skin track etiquette."
    )
    return {
        "answer": answer,
        "ski_tour_info": {
            "action": "routes",
            "routes": [r.model_dump() for r in routes],
        },
    }
