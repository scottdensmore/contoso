from typing import Any, Optional

from pydantic import BaseModel


class DogsledRouteModel(BaseModel):
    route_id: str
    title: str
    region: str
    distance_km: float
    typical_duration_days: int
    difficulty: str
    trail_surface: str
    recommended_team_size: int
    min_rest_ratio: float
    low_temp_record_f: int
    description: str
    highlights: list[str]


class MushingPacingRequest(BaseModel):
    route_id: str
    team_dog_count: int = 8
    ambient_temp_f: float = -10.0
    cargo_weight_kg: float = 65.0
    daily_run_hours: float = 6.0
    trail_surface: str = "groomed_hardpack"


class MushingPacingResponse(BaseModel):
    route_id: str
    route_title: str
    effective_speed_kmh: float
    daily_distance_km: float
    dog_calories_per_day: int
    team_total_calories_per_day: int
    total_melt_water_liters: float
    recommended_rest_hours: float
    required_bootie_count: int
    safety_status: str
    trail_advisory: str


class MushingGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class DogsledIntent(BaseModel):
    action: str  # "routes_list", "route_detail", "calculate_pacing", "gear_checklist"
    route_id: Optional[str] = None
    difficulty: Optional[str] = None
    trail_surface: Optional[str] = None


DEFAULT_DOGSLED_ROUTES: dict[str, DogsledRouteModel] = {
    "iditarod-historic-trail-traverse": DogsledRouteModel(
        route_id="iditarod-historic-trail-traverse",
        title="Iditarod National Historic Trail Traverse",
        region="Seward to Nome, Alaska",
        distance_km=1569.0,
        typical_duration_days=12,
        difficulty="expert",
        trail_surface="windblown_tundra",
        recommended_team_size=14,
        min_rest_ratio=1.0,
        low_temp_record_f=-60,
        description="The legendary Alaska Gold Rush mail and serum trail across the Alaska Range, frozen Yukon River, and Bering Sea pack ice.",
        highlights=[
            "Rainy Pass crossing across the Alaska Range",
            "Yukon River frozen river corridor navigation",
            "Norton Sound sea ice run into Nome",
        ],
    ),
    "boundary-waters-quetico-run": DogsledRouteModel(
        route_id="boundary-waters-quetico-run",
        title="Boundary Waters & Quetico Wilderness Lake Run",
        region="Boundary Waters Canoe Area Wilderness, Minnesota",
        distance_km=145.0,
        typical_duration_days=4,
        difficulty="intermediate",
        trail_surface="groomed_hardpack",
        recommended_team_size=6,
        min_rest_ratio=1.2,
        low_temp_record_f=-45,
        description="Pristine northern boreal forest traverse traversing frozen lake chains, granite portages, and dense spruce stands.",
        highlights=[
            "Frozen lake crossing chains with clear line of sight",
            "Portage wilderness timber navigation between lakes",
            "Remote wilderness lake ice campsites",
        ],
    ),
    "yukon-quest-eagle-summit": DogsledRouteModel(
        route_id="yukon-quest-eagle-summit",
        title="Yukon Quest Eagle Summit Alpine Crossing",
        region="Whitehorse to Fairbanks, Yukon & Alaska",
        distance_km=320.0,
        typical_duration_days=6,
        difficulty="expert",
        trail_surface="windblown_tundra",
        recommended_team_size=12,
        min_rest_ratio=1.25,
        low_temp_record_f=-65,
        description="Notorious subarctic alpine expedition featuring the treacherous 3,652-foot ascent of Eagle Summit with howling winds and glare ice.",
        highlights=[
            "Eagle Summit 3,652-foot vertical windblown alpine ascent",
            "Steese Highway high-velocity wind corridor",
            "Glacierized alpine ridge trail holding glare ice",
        ],
    ),
    "denali-sanctuary-river-patrol": DogsledRouteModel(
        route_id="denali-sanctuary-river-patrol",
        title="Denali National Park Sanctuary River Patrol",
        region="Denali National Park & Preserve, Alaska",
        distance_km=85.0,
        typical_duration_days=3,
        difficulty="advanced",
        trail_surface="river_overflow",
        recommended_team_size=8,
        min_rest_ratio=1.1,
        low_temp_record_f=-50,
        description="Historic park ranger patrol route navigating braided gravel river bars, aufeis overflow sheets, and taiga river bottoms.",
        highlights=[
            "Sanctuary River aufeis sheets requiring bootie vigilance",
            "Historic Denali park ranger patrol cabin network",
            "Mount Denali winter vistas across subzero taiga",
        ],
    ),
    "maine-north-woods-allagash": DogsledRouteModel(
        route_id="maine-north-woods-allagash",
        title="Maine North Woods Allagash Wilderness Traverse",
        region="Allagash Wilderness Waterway, Maine",
        distance_km=110.0,
        typical_duration_days=3,
        difficulty="intermediate",
        trail_surface="groomed_hardpack",
        recommended_team_size=6,
        min_rest_ratio=1.0,
        low_temp_record_f=-38,
        description="Classic eastern North American mushing expedition winding through old-growth spruce-fir forests and frozen riverways.",
        highlights=[
            "Allagash Waterway frozen river channels",
            "North Woods logging tote roads and spruce tunnels",
            "Deep northern Maine backcountry winter solitude",
        ],
    ),
}

DEFAULT_DOGSLED_GEAR: list[MushingGearRequirement] = [
    MushingGearRequirement(
        item_id="dog-protective-booties",
        name="Cordura & Polar Fleece Dog Protective Booties (Set of 16)",
        category="dog_wear",
        mandatory=True,
        purpose="Prevents ice balls from packing between paw pads and guards against abrasions from sharp glare ice, crusted snow, and overflow.",
    ),
    MushingGearRequirement(
        item_id="dual-claw-snow-hook",
        name="Heat-Treated Steel Dual-Claw Snow Hook Anchor",
        category="sled_anchors",
        mandatory=True,
        purpose="Emergency brake and stationary ground anchor designed to bite into hardpack and river ice to securely hold an eager dog team.",
    ),
    MushingGearRequirement(
        item_id="aircraft-cable-gangline",
        name="Aircraft-Grade Galvanized Steel Cable Core Gangline",
        category="rigging",
        mandatory=True,
        purpose="Chew-proof center pull line connecting lead dogs, swing dogs, team dogs, and wheel dogs directly to the sled bridle.",
    ),
    MushingGearRequirement(
        item_id="arctic-cooker-melt-pot",
        name="Subzero Arctic Cooker & Snow Melting Pot System",
        category="hydration_cooker",
        mandatory=True,
        purpose="High-output alcohol/isobutane burner and 5-gallon aluminum pot to rapidly melt snow for canine hydration and warm meat broth.",
    ),
    MushingGearRequirement(
        item_id="high-fat-canine-rations",
        name="High-Fat Endurance Sled Dog Nutrition Rations & Beef Tallow",
        category="canine_nutrition",
        mandatory=True,
        purpose="Calorie-dense 32/20 protein-to-fat canine kibble supplemented with pure beef fat and salmon meal delivering 10,000+ kcal daily burn requirements.",
    ),
    MushingGearRequirement(
        item_id="musher-subzero-bivy-parka",
        name="Expedition Subzero Musher Anorak Bivy Parka & Over-Mitts",
        category="musher_apparel",
        mandatory=True,
        purpose="Windproof 800-fill down anorak with coyote ruff and beaver gauntlet over-mitts to maintain core dexterity at -50°F.",
    ),
]

SURFACE_SPEED_FACTORS: dict[str, float] = {
    "groomed_hardpack": 1.0,
    "packed_snow": 0.92,
    "windblown_tundra": 0.82,
    "deep_powder": 0.68,
    "river_overflow": 0.55,
    "rough_ice": 0.72,
}


def get_dogsled_routes(difficulty: Optional[str] = None) -> list[DogsledRouteModel]:
    routes = list(DEFAULT_DOGSLED_ROUTES.values())
    if difficulty:
        diff_norm = difficulty.strip().lower()
        routes = [r for r in routes if r.difficulty.lower() == diff_norm]
    return routes


def get_dogsled_route_by_id(route_id: str) -> Optional[DogsledRouteModel]:
    return DEFAULT_DOGSLED_ROUTES.get(route_id.strip().lower())


def get_dogsled_gear() -> list[MushingGearRequirement]:
    return DEFAULT_DOGSLED_GEAR


def calculate_mushing_pacing(request: MushingPacingRequest) -> MushingPacingResponse:
    route = get_dogsled_route_by_id(request.route_id)
    if not route:
        raise ValueError(f"Dogsled route '{request.route_id}' not found")

    # 1. Surface factor
    surface_factor = SURFACE_SPEED_FACTORS.get(request.trail_surface, 0.85)

    # 2. Temperature factor
    # Sled dogs overheat easily above 20F, optimal between -25F and 15F, cold friction below -30F
    temp = request.ambient_temp_f
    if temp > 25.0:
        temp_factor = 0.75
    elif temp > 15.0:
        temp_factor = 0.88
    elif temp >= -25.0:
        temp_factor = 1.0
    elif temp >= -40.0:
        temp_factor = 0.90
    else:
        temp_factor = 0.78

    # 3. Cargo load factor per dog
    cargo_per_dog = request.cargo_weight_kg / max(1, request.team_dog_count)
    load_factor = max(0.5, 1.0 - max(0.0, cargo_per_dog - 8.0) * 0.04)

    # 4. Team size factor
    if request.team_dog_count < route.recommended_team_size:
        team_factor = max(0.65, float(request.team_dog_count) / float(route.recommended_team_size))
    else:
        team_factor = 1.0

    base_speed = 14.5
    effective_speed = max(3.0, round(base_speed * surface_factor * temp_factor * load_factor * team_factor, 1))
    daily_distance = round(effective_speed * request.daily_run_hours, 1)

    # 5. Caloric calculation
    base_cal = 6500
    run_cal = int(round(request.daily_run_hours * 450))
    cold_cal = int(round(max(0.0, -temp) * 45))
    weight_cal = int(round(cargo_per_dog * 55))
    surface_cal = 600 if request.trail_surface in ("deep_powder", "windblown_tundra") else 1000 if request.trail_surface == "river_overflow" else 0
    dog_cal = base_cal + run_cal + cold_cal + weight_cal + surface_cal
    team_total_cal = dog_cal * request.team_dog_count

    # 6. Water hydration (liters)
    melt_water = round((request.team_dog_count * (3.5 + request.daily_run_hours * 0.25)) + 4.0, 1)

    # 7. Recommended rest hours
    rec_rest = round(request.daily_run_hours * max(1.0, route.min_rest_ratio), 1)

    # 8. Required bootie count
    abrasive_mult = 1.5 if request.trail_surface in ("rough_ice", "river_overflow", "windblown_tundra") else 1.0
    booties_per_dog = max(8, int(round(4 + (daily_distance / 15.0) * abrasive_mult)))
    total_booties = booties_per_dog * request.team_dog_count

    # 9. Safety status & trail advisory
    advisories = []
    is_danger = False
    is_warning = False
    is_caution = False

    if temp > 30.0:
        is_danger = True
        advisories.append("CRITICAL HEAT WARNING: Ambient temperature above 30°F causes severe canine hyperthermia; halt team or mush only at night.")
    elif temp > 20.0:
        is_warning = True
        advisories.append("Warm weather advisory: Dogs risk overheating above 20°F; increase hydration broth and reduce run speed.")
    elif temp < -50.0:
        is_danger = True
        advisories.append("SEVERE COLD WARNING: Extreme subzero temperatures below -50°F threaten bronchial freezing and frostbite on dog extremities.")
    elif temp < -35.0:
        is_caution = True
        advisories.append("Extreme cold advisory: Snow runner friction increases sharply; apply cold-snow glide wax and check groin/toe pads for frost.")

    if request.trail_surface == "river_overflow":
        is_warning = True
        advisories.append("River overflow hazard: Wet paws freeze instantly in subzero air; inspect paws immediately, change booties after water crossings, and carry dry straw.")

    if request.daily_run_hours > 12.0:
        is_danger = True
        advisories.append("Dog welfare violation: Daily run duration exceeding 12 hours exceeds humane sled dog endurance limits.")
    elif request.daily_run_hours > 8.0:
        is_caution = True
        advisories.append("High daily mileage: Daily run exceeds 8 hours; adhere strictly to 1:1 rest ratio to avoid team exhaustion.")

    if cargo_per_dog > 20.0:
        is_danger = True
        advisories.append("Overloaded sled: Cargo load per dog exceeds 20 kg; risks musher harness injury and wrist tendonitis.")
    elif cargo_per_dog > 12.0:
        is_caution = True
        advisories.append("Heavy cargo load: Ensure wheel dogs are strong and seasoned pulling dogs to bear sled tongue shock.")

    if request.team_dog_count < (route.recommended_team_size - 3):
        is_caution = True
        advisories.append(f"Under-teamed route: {request.team_dog_count} dogs is below recommended {route.recommended_team_size} for {route.title}.")

    if not advisories:
        advisories.append("Nominal mushing conditions: Maintain equal run-to-rest pacing, verify gangline tension, set dual snow hooks during halts, and ladle warm broth.")

    if is_danger:
        safety_status = "DANGER"
    elif is_warning:
        safety_status = "WARNING"
    elif is_caution:
        safety_status = "CAUTION"
    else:
        safety_status = "OPTIMAL"

    trail_advisory = " ".join(advisories)

    return MushingPacingResponse(
        route_id=route.route_id,
        route_title=route.title,
        effective_speed_kmh=effective_speed,
        daily_distance_km=daily_distance,
        dog_calories_per_day=dog_cal,
        team_total_calories_per_day=team_total_cal,
        total_melt_water_liters=melt_water,
        recommended_rest_hours=rec_rest,
        required_bootie_count=total_booties,
        safety_status=safety_status,
        trail_advisory=trail_advisory,
    )


def extract_dogsled_intent(message: str) -> Optional[DogsledIntent]:
    q = message.lower()

    # Exclusions
    # Must not hijack ski touring
    if any(k in q for k in ["ski tour", "splitboard", "skin track", "downhill ski", "backcountry ski", "telemark"]) and not any(k in q for k in ["dogsled", "mush", "sled dog"]):
        return None
    # Must not hijack nordic skiing
    if any(k in q for k in ["nordic ski", "cross country ski", "classic ski", "skate ski", "xc ski", "methow valley"]) and not any(k in q for k in ["dogsled", "mush", "sled dog"]):
        return None
    # Must not hijack wildlife encounters
    if any(k in q for k in ["grizzly bear", "bear encounter", "bear spray", "bear canister", "wolves and bears"]) and not any(k in q for k in ["dogsled", "mush", "sled dog", "gangline", "dog team"]):
        return None
    # Customer support exclusions
    if any(k in q for k in ["order #", "order tracking", "shipping label", "return label", "membership reward"]):
        return None

    # Trigger keywords
    triggers = [
        "dogsled",
        "dog sled",
        "dogsledding",
        "mushing",
        "sled dog",
        "gangline",
        "snow hook",
        "dog booties",
        "musher",
        "iditarod",
        "yukon quest",
        "dog team",
        "lead dog",
        "wheel dog",
        "dog cooker",
        "swing dog",
        "sled dogs",
        "canine calories",
    ]
    if not any(k in q for k in triggers):
        return None

    # Identify route
    route_id = None
    if "iditarod" in q:
        route_id = "iditarod-historic-trail-traverse"
    elif "quetico" in q or "boundary water" in q:
        route_id = "boundary-waters-quetico-run"
    elif "yukon" in q or "eagle summit" in q:
        route_id = "yukon-quest-eagle-summit"
    elif "sanctuary" in q or "denali" in q:
        route_id = "denali-sanctuary-river-patrol"
    elif "allagash" in q or "maine" in q:
        route_id = "maine-north-woods-allagash"
    else:
        for r_id in DEFAULT_DOGSLED_ROUTES:
            if r_id in q:
                route_id = r_id
                break

    # Difficulty detection
    difficulty = None
    if "intermediate" in q:
        difficulty = "intermediate"
    elif "advanced" in q:
        difficulty = "advanced"
    elif "expert" in q:
        difficulty = "expert"

    # Surface detection
    surface = None
    if "overflow" in q:
        surface = "river_overflow"
    elif "tundra" in q:
        surface = "windblown_tundra"
    elif "powder" in q:
        surface = "deep_powder"
    elif "hardpack" in q:
        surface = "groomed_hardpack"

    # Action detection
    calc_words = ["calculate", "pacing", "speed", "calories", "caloric", "burn", "hydration", "broth", "melt water", "warm water", "rest ratio", "bootie count", "how many booties"]
    if any(k in q for k in calc_words) or ("water" in q and "boundary water" not in q and "allagash water" not in q):
        action = "calculate_pacing"
    elif any(k in q for k in ["gear", "equipment", "checklist", "mandatory", "kit", "booties", "snow hook", "gangline", "cooker", "harness"]) and not route_id:
        action = "gear_checklist"
    elif route_id and any(k in q for k in ["detail", "about", "explore", "info", "crossing", "traverse", "run", "patrol", "tell me about"]):
        action = "route_detail"
    elif route_id:
        action = "route_detail"
    elif any(k in q for k in ["gear", "equipment", "checklist", "mandatory", "kit", "booties", "snow hook", "gangline", "cooker", "harness"]):
        action = "gear_checklist"
    else:
        action = "routes_list"

    return DogsledIntent(
        action=action,
        route_id=route_id,
        difficulty=difficulty,
        trail_surface=surface,
    )


detect_dogsled_intent = extract_dogsled_intent


class FormattedDogsledResponse(str):
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


def format_dogsled_response(intent: DogsledIntent) -> FormattedDogsledResponse:
    if intent.action == "calculate_pacing":
        target_route_id = intent.route_id or "boundary-waters-quetico-run"
        surface = intent.trail_surface or "groomed_hardpack"
        req = MushingPacingRequest(route_id=target_route_id, trail_surface=surface)
        pacing = calculate_mushing_pacing(req)
        answer = (
            f"Mushing Pacing & Sled Dog Nutrition for {pacing.route_title}: "
            f"Effective speed is {pacing.effective_speed_kmh} km/h yielding {pacing.daily_distance_km} km per day. "
            f"Canine nutrition burn: {pacing.dog_calories_per_day} kcal/dog/day (team total: {pacing.team_total_calories_per_day} kcal). "
            f"Hydration requirement: {pacing.total_melt_water_liters} L melted warm broth. "
            f"Recommended rest: {pacing.recommended_rest_hours} hours. "
            f"Protective booties required: {pacing.required_bootie_count}. "
            f"Safety Status: {pacing.safety_status}. Advisory: {pacing.trail_advisory}"
        )
        info = {
            "action": "calculate_pacing",
            "route_id": pacing.route_id,
            "route_title": pacing.route_title,
            "effective_speed_kmh": pacing.effective_speed_kmh,
            "daily_distance_km": pacing.daily_distance_km,
            "dog_calories_per_day": pacing.dog_calories_per_day,
            "team_total_calories_per_day": pacing.team_total_calories_per_day,
            "total_melt_water_liters": pacing.total_melt_water_liters,
            "recommended_rest_hours": pacing.recommended_rest_hours,
            "required_bootie_count": pacing.required_bootie_count,
            "safety_status": pacing.safety_status,
            "trail_advisory": pacing.trail_advisory,
            "pacing": pacing.model_dump(),
        }
        return FormattedDogsledResponse(answer, {"answer": answer, "dogsled_info": info})

    if intent.action == "route_detail" and intent.route_id:
        route = get_dogsled_route_by_id(intent.route_id)
        if route:
            answer = (
                f"Dogsled Expedition Route: {route.title} ({route.region}). "
                f"Distance: {route.distance_km} km | Typical Duration: {route.typical_duration_days} days | Difficulty: {route.difficulty}. "
                f"Trail Surface: {route.trail_surface} | Recommended Team Size: {route.recommended_team_size} dogs | Minimum Rest Ratio: {route.min_rest_ratio}:1. "
                f"Low Temp Record: {route.low_temp_record_f}°F. {route.description} "
                f"Highlights: {'; '.join(route.highlights)}."
            )
            info = {
                "action": "route_detail",
                "route_id": route.route_id,
                "route": route.model_dump(),
            }
            return FormattedDogsledResponse(answer, {"answer": answer, "dogsled_info": info})

    if intent.action == "gear_checklist":
        gear = get_dogsled_gear()
        gear_names = ", ".join(g.name for g in gear)
        answer = (
            f"Mandatory Winter Wilderness Mushing Kit Checklist (6 items): {gear_names}. "
            "Protective dog booties, dual-claw snow hook, aircraft-grade cable gangline, arctic cooker pot, "
            "high-fat canine rations, and subzero bivy parka are essential for dog welfare and cold survival."
        )
        info = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
        }
        return FormattedDogsledResponse(answer, {"answer": answer, "dogsled_info": info})

    # Default: routes_list
    routes = get_dogsled_routes(difficulty=intent.difficulty)
    summary = "; ".join(f"{r.title} ({r.difficulty}, {r.region})" for r in routes)
    answer = (
        f"Contoso Winter Wilderness Dogsledding & Mushing Expeditions: {summary}. "
        "Each expedition requires certified dog welfare compliance, gangline safety inspections, "
        "high-fat caloric nutrition planning, and subzero snow melting capability."
    )
    info = {
        "action": "routes_list",
        "routes": [r.model_dump() for r in routes],
    }
    return FormattedDogsledResponse(answer, {"answer": answer, "dogsled_info": info})


def build_dogsled_prompt(intent: DogsledIntent) -> str:
    lines = ["Winter Wilderness Dogsledding & Mushing Expedition Tooling:"]
    if intent.route_id:
        route = get_dogsled_route_by_id(intent.route_id)
        if route:
            lines.extend([
                f"- Selected Route: {route.title} ({route.region})",
                f"  Distance: {route.distance_km} km | Typical Duration: {route.typical_duration_days} days",
                f"  Difficulty: {route.difficulty} | Trail Surface: {route.trail_surface}",
                f"  Recommended Team Size: {route.recommended_team_size} dogs | Minimum Rest Ratio: {route.min_rest_ratio}:1",
                f"  Record Low Temperature: {route.low_temp_record_f}°F",
                f"  Description: {route.description}",
                f"  Highlights: {'; '.join(route.highlights)}",
            ])
    elif intent.action == "gear_checklist":
        gear = get_dogsled_gear()
        lines.append("- Mandatory Expedition Mushing Gear Checklist:")
        for g in gear:
            lines.append(f"  * {g.name} [{g.category}]: {g.purpose}")
    elif intent.action == "calculate_pacing":
        lines.extend([
            "- Sled Dog Endurance & Trail Pacing Physics:",
            "  * Pacing: Standard 1:1 run-to-rest ratio (e.g. 6 hours run, 6 hours rest).",
            "  * Nutrition: 8,000 to 12,000 kcal/dog/day with high dietary fat (32/20 kibble + tallow).",
            "  * Broth Hydration: 4-6 L melted warm water broth per dog; never feed dry snow (lowers core temp).",
            "  * Paw Care: Minimum 8 booties carried per dog; change immediately upon ice or overflow exposure.",
            "  * Temperature Hazards: Overheating risk above 20°F (dogs pant, cannot sweat); bronchial damage below -50°F.",
        ])
    else:
        routes = get_dogsled_routes(difficulty=intent.difficulty)
        lines.append(
            f"- Available Dogsledding Routes ({intent.difficulty or 'All Difficulties'}): "
            + "; ".join(f"{r.title} [{r.difficulty}, {r.region}]" for r in routes)
        )

    lines.extend([
        "- Core Mushing & Dog Welfare Guidelines:",
        "  1. Gangline Rigging: Lead dogs steer and set pace; swing dogs pivot behind leads; team dogs provide power; wheel dogs steer sled tongue.",
        "  2. Snow Hook Anchoring: Never step off the sled runners without setting the dual-claw snow hook firmly into snowpack or ice.",
        "  3. Hydration Broth: Melt snow using arctic cooker pot and mix with meat fat to ensure dogs stay properly hydrated in dry subzero air.",
        "  4. River Overflow Safety: If overflow is encountered, stop immediately, dry paws, and replace soaked booties before ice balls form.",
    ])
    return chr(10).join(lines)
