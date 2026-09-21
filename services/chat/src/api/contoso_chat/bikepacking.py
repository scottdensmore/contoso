from typing import Any, Optional

from pydantic import BaseModel, Field


class BikepackingRouteModel(BaseModel):
    route_id: str
    name: str
    region: str
    distance_miles: float
    elevation_gain_ft: int
    terrain_category: str
    recommended_tire_width_mm: int
    recommended_bike_type: str
    typical_days: int
    resupply_interval_miles: int
    water_carry_liters: float
    description: str
    highlights: list[str] = Field(default_factory=list)


class BikepackingRigRequest(BaseModel):
    route_id: str
    trip_duration_days: int = 3
    shelter_type: str = "bikepacking_tent"
    rider_weight_lbs: float = 165.0


class BikepackingRigResponse(BaseModel):
    route_id: str
    route_name: str
    front_tire_psi: float
    rear_tire_psi: float
    total_gear_weight_lbs: float
    daily_calories_kcal: int
    frame_bag_liters: float
    seat_pack_liters: float
    handlebar_roll_liters: float
    total_bag_capacity_liters: float
    daily_water_liters: float
    mechanical_spares: list[str] = Field(default_factory=list)


class BikepackingGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool = True
    purpose: str


class BikepackingIntent(BaseModel):
    action: str  # "routes_list", "route_detail", "rig_calc", "gear_checklist"
    route_id: Optional[str] = None
    terrain: Optional[str] = None
    bike_type: Optional[str] = None


DEFAULT_BIKEPACKING_ROUTES: dict[str, BikepackingRouteModel] = {
    "cross-washington-xwa": BikepackingRouteModel(
        route_id="cross-washington-xwa",
        name="Cross-Washington Mountain Bike Route (XWA)",
        region="Cascade Mountains & Columbia Basin, WA",
        distance_miles=680.0,
        elevation_gain_ft=34000,
        terrain_category="mixed_pavement_gravel",
        recommended_tire_width_mm=50,
        recommended_bike_type="gravel_all_road",
        typical_days=7,
        resupply_interval_miles=65,
        water_carry_liters=3.5,
        description="A strenuous cross-state traverse linking the Olympic coast, Cascade mountain passes, and Columbia Basin rail-corridors over tarmac, gravel, and unpaved rights-of-way.",
        highlights=[
            "Snoqualmie Tunnel passage",
            "Palouse to Cascades rail trail",
            "Columbia River basalt canyon",
            "Eastern Washington gravel ridges",
        ],
    ),
    "oregon-outback": BikepackingRouteModel(
        route_id="oregon-outback",
        name="Oregon Outback Gravel Epic",
        region="Central Oregon High Desert, OR",
        distance_miles=364.0,
        elevation_gain_ft=14500,
        terrain_category="gravel_fire_road",
        recommended_tire_width_mm=45,
        recommended_bike_type="gravel_all_road",
        typical_days=4,
        resupply_interval_miles=85,
        water_carry_liters=4.0,
        description="Legendary south-to-north gravel odyssey spanning remote red cinder volcanic roads, pine forest double-track, and sagebrush high-desert plateaus.",
        highlights=[
            "Fort Rock volcanic caldera",
            "Ochoco National Forest single/double-track",
            "Prineville Reservoir ascent",
            "Remote desert canyon roads",
        ],
    ),
    "great-divide-montana": BikepackingRouteModel(
        route_id="great-divide-montana",
        name="Great Divide Mountain Bike Route - Montana Passes",
        region="Continental Divide, MT",
        distance_miles=410.0,
        elevation_gain_ft=28000,
        terrain_category="remote_two_track",
        recommended_tire_width_mm=55,
        recommended_bike_type="rigid_adventure",
        typical_days=5,
        resupply_interval_miles=75,
        water_carry_liters=3.0,
        description="The crown jewel northern segment of the Great Divide, featuring jagged pass climbs, remote national forest two-track, and backcountry grizzly bear corridors.",
        highlights=[
            "Whitefish Divide mountain pass",
            "Seeley-Swan wilderness valley",
            "Richmond Peak remote double-track",
            "Continental Divide spine crossings",
        ],
    ),
    "olympic-adventure-trail-loop": BikepackingRouteModel(
        route_id="olympic-adventure-trail-loop",
        name="Olympic Discovery & Adventure Singletrack",
        region="Olympic Peninsula, WA",
        distance_miles=135.0,
        elevation_gain_ft=9500,
        terrain_category="rugged_singletrack",
        recommended_tire_width_mm=60,
        recommended_bike_type="hardtail_mtb",
        typical_days=2,
        resupply_interval_miles=40,
        water_carry_liters=2.5,
        description="Lush coastal rainforest loop featuring purpose-built bench-cut singletrack, flowy descents, and views over Lake Crescent in the foothills of Olympic National Park.",
        highlights=[
            "Olympic Adventure Trail singletrack",
            "Lake Crescent glacial shoreline",
            "Spruce Railroad historic tunnel",
            "Elwha River canyon suspension bridge",
        ],
    ),
    "cascade-hut-to-hut-gravel": BikepackingRouteModel(
        route_id="cascade-hut-to-hut-gravel",
        name="Cascade High Alpine Fire Road Traverse",
        region="Central Cascades, WA/OR",
        distance_miles=220.0,
        elevation_gain_ft=18000,
        terrain_category="high_alpine_pass",
        recommended_tire_width_mm=55,
        recommended_bike_type="rigid_adventure",
        typical_days=3,
        resupply_interval_miles=60,
        water_carry_liters=3.0,
        description="Rugged volcanic backcountry traverse tracing USFS fire roads and primitive subalpine tracks between Mount Hood and Mount Adams.",
        highlights=[
            "Subalpine volcanic vistas",
            "Old lava bed pass crossings",
            "Remote backcountry shelter huts",
            "Fast gravel descent descents",
        ],
    ),
}

DEFAULT_MANDATORY_GEAR: list[BikepackingGearRequirement] = [
    BikepackingGearRequirement(
        item_id="multi-tool",
        name="Multi-tool with integrated chain breaker and tubeless valve core tool",
        category="repair_tools",
        mandatory=True,
        purpose="Emergency cockpit adjustment, spoke tensioning, drivetrain chain repair, and valve core maintenance.",
    ),
    BikepackingGearRequirement(
        item_id="tubeless-plugs",
        name="Tubeless plug puncture kit (bacon strips) + tyre boot patches",
        category="repair_tools",
        mandatory=True,
        purpose="Rapid trailside puncture sealing and emergency sidewall casing rip protection.",
    ),
    BikepackingGearRequirement(
        item_id="mini-pump-co2",
        name="High-volume frame mini pump + CO2 inflator with cartridges",
        category="repair_tools",
        mandatory=True,
        purpose="Reliable high-volume tire reinflation and emergency tubeless bead re-seating on remote trails.",
    ),
    BikepackingGearRequirement(
        item_id="derailleur-hanger-link",
        name="Spare derailleur hanger & speed-matched quick-link master links",
        category="repair_tools",
        mandatory=True,
        purpose="Critical drivetrain recovery in the event of rock strikes, bent hangers, or broken chains.",
    ),
    BikepackingGearRequirement(
        item_id="waterproof-bag-system",
        name="Waterproof handlebar roll & seat pack harness system",
        category="bike_bags",
        mandatory=True,
        purpose="Submersion-proof storage for sleep system and spare apparel with stable handling over rough terrain.",
    ),
    BikepackingGearRequirement(
        item_id="gravity-water-filter",
        name="Ultralight gravity water filtration bag / fast-flow squeeze filter",
        category="hydration_fuel",
        mandatory=True,
        purpose="Safe microbial water purification from streams, alpine seeps, and wilderness lakes.",
    ),
]


def get_bikepacking_routes(terrain: Optional[str] = None) -> list[BikepackingRouteModel]:
    routes = list(DEFAULT_BIKEPACKING_ROUTES.values())
    if terrain:
        return [r for r in routes if r.terrain_category == terrain]
    return routes


def get_bikepacking_route_by_id(route_id: str) -> Optional[BikepackingRouteModel]:
    return DEFAULT_BIKEPACKING_ROUTES.get(route_id)


def calculate_bikepacking_rig(req: BikepackingRigRequest) -> BikepackingRigResponse:
    route = get_bikepacking_route_by_id(req.route_id)
    if not route:
        raise ValueError(f"Bikepacking route '{req.route_id}' not found")

    tire_width = route.recommended_tire_width_mm

    # Realistic tire pressure calculation:
    # Baseline pressure at 160 lbs: 70 - (tireWidth * 0.8)
    # Weight adjustment: (riderWeightLbs - 160) * 0.12
    weight_delta = (req.rider_weight_lbs - 160.0) * 0.12
    rear_psi = max(18.0, float(round(70.0 - tire_width * 0.8 + weight_delta)))
    front_psi = max(16.0, float(round(rear_psi * 0.9)))

    # Bag capacity calculation:
    # Frame bag scales slightly with trip duration (6L to 12L)
    frame_bag = float(min(12, 6 + round(req.trip_duration_days * 0.6)))
    # Seat pack scales with trip duration (8L to 16L)
    seat_pack = float(min(16, 8 + round(req.trip_duration_days * 0.8)))
    # Handlebar roll scales with shelter bulk
    handlebar_roll_map = {
        "ultralight_bivy": 9.0,
        "tarp_setup": 11.0,
        "bikepacking_tent": 14.0,
    }
    handlebar_roll = float(handlebar_roll_map.get(req.shelter_type, 12.0))
    total_bag_capacity_liters = frame_bag + seat_pack + handlebar_roll

    # Total gear weight (lbs):
    shelter_weight_map = {
        "ultralight_bivy": 1.8,
        "tarp_setup": 2.5,
        "bikepacking_tent": 4.2,
    }
    base_gear_weight = 11.5
    clothes_and_sleep_weight = 5.0
    food_per_day = 1.75
    food_weight = min(req.trip_duration_days, 5) * food_per_day
    total_gear_weight_lbs = round(
        (base_gear_weight + shelter_weight_map.get(req.shelter_type, 4.2) + clothes_and_sleep_weight + food_weight) * 10
    ) / 10

    # Daily calorie burn demand:
    daily_miles = route.distance_miles / route.typical_days
    daily_vert = route.elevation_gain_ft / route.typical_days
    daily_calories_kcal = int(round(2200 + daily_miles * 25 + daily_vert * 0.15))

    daily_water_liters = float(route.water_carry_liters)

    # Mechanical spares:
    mechanical_spares = [
        "Tubeless tire plug kit (bacon strips) & brass insertion tool",
        "Spare derailleur hanger matching frame dropout spec",
        "Speed-matched master quick-links (11/12-spd)",
        "High-volume hand pump & valve core remover tool",
        "Pre-glued tyre casing emergency boot patches",
    ]
    if route.terrain_category in ("rugged_singletrack", "high_alpine_pass"):
        mechanical_spares.append("Replacement disc brake pads & rotor truing fork")

    return BikepackingRigResponse(
        route_id=route.route_id,
        route_name=route.name,
        front_tire_psi=front_psi,
        rear_tire_psi=rear_psi,
        total_gear_weight_lbs=total_gear_weight_lbs,
        daily_calories_kcal=daily_calories_kcal,
        frame_bag_liters=frame_bag,
        seat_pack_liters=seat_pack,
        handlebar_roll_liters=handlebar_roll,
        total_bag_capacity_liters=total_bag_capacity_liters,
        daily_water_liters=daily_water_liters,
        mechanical_spares=mechanical_spares,
    )


def get_bikepacking_gear() -> list[BikepackingGearRequirement]:
    return list(DEFAULT_MANDATORY_GEAR)


def detect_bikepacking_intent(query: str) -> Optional[BikepackingIntent]:
    if not query or not query.strip():
        return None

    q = query.lower()
    q_norm = q.replace("-", " ")

    # Explicit triggers required to prevent hijacking general outdoor inquiries
    triggers = [
        "bikepacking",
        "bike packing",
        "gravel touring",
        "cycle touring",
        "cross washington",
        "xwa",
        "oregon outback",
        "great divide mountain bike",
        "gdmbr",
        "frame bag",
        "seat pack",
        "bikepacking rig",
        "tire width for bikepacking",
        "bikepacking repair kit",
        "handlebar roll",
        "gravel bikepacking",
        "olympic adventure trail",
        "cascade hut to hut",
    ]

    has_trigger = any(t in q_norm for t in triggers)
    if not has_trigger:
        return None

    # Guard against queries primarily about road cycling with no bikepacking terms
    if "road cycling" in q and not any(k in q for k in ["bikepack", "gravel touring", "cycle touring", "frame bag", "seat pack"]):
        return None

    # Route identification
    route_id: Optional[str] = None
    if any(k in q_norm for k in ["cross washington", "xwa"]):
        route_id = "cross-washington-xwa"
    elif "oregon outback" in q_norm:
        route_id = "oregon-outback"
    elif any(k in q_norm for k in ["great divide", "gdmbr"]):
        route_id = "great-divide-montana"
    elif any(k in q_norm for k in ["olympic adventure trail", "olympic discovery"]):
        route_id = "olympic-adventure-trail-loop"
    elif any(k in q_norm for k in ["cascade hut to hut", "cascade high alpine"]):
        route_id = "cascade-hut-to-hut-gravel"

    # Terrain identification
    terrain: Optional[str] = None
    if any(k in q_norm for k in ["gravel fire road", "fire road", "gravel road"]):
        terrain = "gravel_fire_road"
    elif any(k in q_norm for k in ["rugged singletrack", "singletrack"]):
        terrain = "rugged_singletrack"
    elif any(k in q_norm for k in ["mixed pavement", "pavement gravel"]):
        terrain = "mixed_pavement_gravel"
    elif any(k in q_norm for k in ["two track", "double track"]):
        terrain = "remote_two_track"
    elif any(k in q_norm for k in ["high alpine pass", "high alpine", "alpine pass"]):
        terrain = "high_alpine_pass"

    # Bike type identification
    bike_type: Optional[str] = None
    if any(k in q_norm for k in ["gravel all road", "all road", "gravel bike"]):
        bike_type = "gravel_all_road"
    elif any(k in q_norm for k in ["hardtail", "hardtail mtb", "hardtail mountain bike"]):
        bike_type = "hardtail_mtb"
    elif any(k in q_norm for k in ["full suspension", "plus bike"]):
        bike_type = "full_suspension_plus"
    elif any(k in q_norm for k in ["rigid adventure", "rigid bike", "rigid mtb"]):
        bike_type = "rigid_adventure"

    # Action detection
    rig_keywords = [
        "rig",
        "tire pressure",
        "psi",
        "tire width",
        "bag capacity",
        "bag volume",
        "calorie",
        "calories",
        "hydration demand",
        "rider weight",
        "frame bag",
        "seat pack",
        "handlebar roll",
        "pack volume",
        "rig calc",
        "rig-calc",
    ]
    gear_keywords = [
        "gear checklist",
        "repair kit",
        "mandatory gear",
        "multi tool",
        "tubeless plug",
        "what gear",
        "packing list",
        "gear",
        "spares",
        "mechanical spares",
        "tools",
    ]
    detail_keywords = [
        "detail",
        "details",
        "tell me about",
        "about",
        "highlights",
        "elevation",
        "distance",
        "profile",
        "overview",
        "guide",
        "route info",
    ]

    has_rig = any(k in q_norm for k in rig_keywords)
    has_gear = any(k in q_norm for k in gear_keywords)
    has_detail = any(k in q_norm for k in detail_keywords)

    if has_rig:
        action = "rig_calc"
    elif has_gear:
        action = "gear_checklist"
    elif route_id and (has_detail or not (has_rig or has_gear)):
        action = "route_detail"
    else:
        action = "routes_list"

    return BikepackingIntent(
        action=action,
        route_id=route_id,
        terrain=terrain,
        bike_type=bike_type,
    )


def build_bikepacking_prompt(intent: BikepackingIntent) -> str:
    lines = [
        "Contoso Outdoors Wilderness Bikepacking & Gravel Touring Grounding:",
        f"- Detected Intent Action: {intent.action.upper()}",
    ]

    if intent.action == "rig_calc":
        target_route_id = intent.route_id or "cross-washington-xwa"
        try:
            calc = calculate_bikepacking_rig(BikepackingRigRequest(route_id=target_route_id))
            lines.extend(
                [
                    f"- Rig & Setup Calculation for {calc.route_name} [ID: {calc.route_id}]:",
                    f"  * Recommended Tire Pressure: {calc.front_tire_psi:.0f} PSI front / {calc.rear_tire_psi:.0f} PSI rear",
                    f"  * Bag Capacity Distribution: {calc.total_bag_capacity_liters:.0f}L total "
                    f"({calc.frame_bag_liters:.0f}L frame bag, {calc.seat_pack_liters:.0f}L seat pack, {calc.handlebar_roll_liters:.0f}L handlebar roll)",
                    f"  * Total Gear Weight: ~{calc.total_gear_weight_lbs:.1f} lbs",
                    f"  * Daily Demands: {calc.daily_calories_kcal} kcal/day, {calc.daily_water_liters:.1f} L water carry",
                    f"  * Trailside Mechanical Spares: {', '.join(calc.mechanical_spares)}",
                ]
            )
        except ValueError:
            pass

    elif intent.action == "gear_checklist":
        lines.extend(
            [
                "- Mandatory Wilderness Bikepacking Repair Kit & Gear Checklist:",
                *[f"  * {g.name} [{g.category}]: {g.purpose}" for g in get_bikepacking_gear()],
            ]
        )

    elif intent.action == "route_detail" and intent.route_id:
        route = get_bikepacking_route_by_id(intent.route_id)
        if route:
            lines.extend(
                [
                    f"- Featured Route: {route.name} [ID: {route.route_id}] ({route.region}):",
                    f"  * Distance: {route.distance_miles} miles | Elevation Gain: +{route.elevation_gain_ft} ft",
                    f"  * Terrain Category: {route.terrain_category} | Bike Type: {route.recommended_bike_type} ({route.recommended_tire_width_mm}mm tire)",
                    f"  * Typical Duration: {route.typical_days} days | Resupply Interval: every ~{route.resupply_interval_miles} mi",
                    f"  * Water Carry: {route.water_carry_liters} L",
                    f"  * Description: {route.description}",
                    f"  * Key Highlights: {', '.join(route.highlights)}",
                ]
            )

    else:
        lines.append("- Wilderness Bikepacking & Gravel Touring Catalog:")
        for r in get_bikepacking_routes(terrain=intent.terrain):
            lines.append(
                f"  * {r.name} [{r.route_id}]: {r.terrain_category}, {r.distance_miles} mi, +{r.elevation_gain_ft} ft, "
                f"{r.recommended_bike_type} ({r.recommended_tire_width_mm}mm tire), resupply every ~{r.resupply_interval_miles} mi"
            )

    lines.extend(
        [
            "",
            "- Wilderness Bikepacking Principles & Trail Ethics:",
            "  * Tubeless Self-Reliance: Always carry bacon strips, brass insertion fork, and high-volume hand pump.",
            "  * Drivetrain Protection: A spare derailleur hanger matching frame dropout spec and quick-links are mandatory.",
            "  * Weight & Volume Distribution: Keep heavy tools/water in frame bag, sleeping kit in handlebar roll, clothing in seat pack.",
            "  * Water & Fuel: Calculate remote resupply intervals carefully; filter backcountry seeps and carry emergency water capacity.",
            "",
            "Assistant Guidance:",
            "- Ground responses directly in route distances, elevations, tire width/pressure calculations, and packing volumes.",
            "- Emphasize trailside mechanical self-reliance and proper Leave No Trace camping along wilderness routes.",
        ]
    )

    return "\n".join(lines)


def format_bikepacking_response(intent: BikepackingIntent) -> dict[str, Any]:
    if intent.action == "rig_calc":
        target_route_id = intent.route_id or "cross-washington-xwa"
        try:
            calc = calculate_bikepacking_rig(BikepackingRigRequest(route_id=target_route_id))
            answer = (
                f"Bikepacking Rig & Setup Calculation for {calc.route_name}: "
                f"Recommended tire pressure is {calc.front_tire_psi:.0f} PSI front / {calc.rear_tire_psi:.0f} PSI rear. "
                f"Total gear weight is estimated at {calc.total_gear_weight_lbs:.1f} lbs. "
                f"Bag capacity planning requires {calc.total_bag_capacity_liters:.0f}L total "
                f"({calc.frame_bag_liters:.0f}L frame bag, {calc.seat_pack_liters:.0f}L seat pack, {calc.handlebar_roll_liters:.0f}L handlebar roll). "
                f"Caloric demand: {calc.daily_calories_kcal} kcal/day; water carry: {calc.daily_water_liters:.1f} L/day. "
                f"Essential trailside spares: {', '.join(calc.mechanical_spares[:4])}."
            )
            return {
                "answer": answer,
                "bikepacking_info": {
                    "action": "rig_calc",
                    "route_id": calc.route_id,
                    "route_name": calc.route_name,
                    "front_tire_psi": calc.front_tire_psi,
                    "rear_tire_psi": calc.rear_tire_psi,
                    "total_gear_weight_lbs": calc.total_gear_weight_lbs,
                    "daily_calories_kcal": calc.daily_calories_kcal,
                    "frame_bag_liters": calc.frame_bag_liters,
                    "seat_pack_liters": calc.seat_pack_liters,
                    "handlebar_roll_liters": calc.handlebar_roll_liters,
                    "total_bag_capacity_liters": calc.total_bag_capacity_liters,
                    "daily_water_liters": calc.daily_water_liters,
                    "mechanical_spares": calc.mechanical_spares,
                    "rig": calc.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "gear_checklist":
        gear = get_bikepacking_gear()
        gear_summary = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Wilderness Bikepacking Gear & Mechanical Spares Checklist: "
            f"Essential trailside repair and packing kit includes: {gear_summary}. "
            f"Always carry tubeless plugs, high-volume pump, spare derailleur hanger, master links, and reliable water filtration."
        )
        return {
            "answer": answer,
            "bikepacking_info": {
                "action": "gear_checklist",
                "route_id": intent.route_id,
                "gear": [g.model_dump() for g in gear],
                "mandatory_count": len([g for g in gear if g.mandatory]),
            },
        }

    if intent.action == "route_detail" and intent.route_id:
        route = get_bikepacking_route_by_id(intent.route_id)
        if route:
            highlights_str = ", ".join(route.highlights)
            answer = (
                f"Bikepacking Route: {route.name} ({route.region}). "
                f"Distance: {route.distance_miles} miles, Elevation Gain: +{route.elevation_gain_ft} ft. "
                f"Terrain: {route.terrain_category} | Bike Type: {route.recommended_bike_type} ({route.recommended_tire_width_mm}mm tires). "
                f"Typical Duration: {route.typical_days} days (resupply every ~{route.resupply_interval_miles} mi, {route.water_carry_liters}L water carry). "
                f"{route.description} Highlights: {highlights_str}."
            )
            return {
                "answer": answer,
                "bikepacking_info": {
                    "action": "route_detail",
                    "route_id": route.route_id,
                    "route": route.model_dump(),
                },
            }

    # Default to routes_list
    routes = get_bikepacking_routes(terrain=intent.terrain)
    routes_summary = "; ".join(
        f"{r.name} ({r.terrain_category}, {r.distance_miles} mi, +{r.elevation_gain_ft} ft, {r.recommended_tire_width_mm}mm tire)"
        for r in routes
    )
    answer = (
        f"Featured Pacific Northwest & Western Bikepacking Routes: {routes_summary}. "
        f"Inquire about specific route details, tire pressure and bag capacity calculations, or mandatory mechanical repair kit."
    )
    return {
        "answer": answer,
        "bikepacking_info": {
            "action": "routes_list",
            "terrain": intent.terrain,
            "routes": [r.model_dump() for r in routes],
        },
    }
