from typing import Any, Optional

from pydantic import BaseModel


class OrienteeringCourseModel(BaseModel):
    course_id: str
    title: str
    region: str
    difficulty: str
    terrain_type: str
    distance_km: float
    checkpoint_controls: int
    magnetic_declination_deg: float
    base_pace_count_per_100m: int
    off_trail_percentage: int
    description: str
    highlights: list[str]


class NavigationLegRequest(BaseModel):
    course_id: str
    leg_distance_meters: float = 350.0
    map_bearing_degrees: float = 45.0
    terrain_type: str = "open_forest"
    visibility: str = "clear"


class NavigationLegResponse(BaseModel):
    course_id: str
    course_title: str
    magnetic_bearing_degrees: float
    back_bearing_degrees: float
    aim_off_bearing_degrees: float
    effective_pace_count_per_100m: int
    total_double_paces: int
    estimated_time_minutes: int
    technique_recommendation: str
    safety_advisory: str


class OrienteeringGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class OrienteeringIntent(BaseModel):
    action: str  # "courses_list", "course_detail", "calculate_leg", "gear_checklist"
    course_id: Optional[str] = None
    difficulty: Optional[str] = None
    terrain_type: Optional[str] = None


DEFAULT_ORIENTEERING_COURSES: dict[str, OrienteeringCourseModel] = {
    "harriman-silvermine-classic": OrienteeringCourseModel(
        course_id="harriman-silvermine-classic",
        title="Harriman Silvermine Classic Orienteering Course",
        region="Harriman State Park, NY",
        difficulty="intermediate",
        terrain_type="dense_deciduous_forest",
        distance_km=6.8,
        checkpoint_controls=12,
        magnetic_declination_deg=-12.5,
        base_pace_count_per_100m=64,
        off_trail_percentage=45,
        description="Technical off-trail navigation through rocky hemlock knolls, stone walls, and glacial erratic boulders.",
        highlights=[
            "Glacial erratics as attack points",
            "Iron mine contour re-entrants",
            "Linear stone wall handrails",
        ],
    ),
    "devils-lake-bluff-rogaine": OrienteeringCourseModel(
        course_id="devils-lake-bluff-rogaine",
        title="Devil's Lake Quartzite Bluffs Rogaine",
        region="Baraboo Hills, WI",
        difficulty="advanced",
        terrain_type="quartzite_talus_bluffs",
        distance_km=14.5,
        checkpoint_controls=24,
        magnetic_declination_deg=-2.0,
        base_pace_count_per_100m=62,
        off_trail_percentage=75,
        description="Challenging cross-country rogaine across 500-foot quartzite cliffs, talus slopes, and oak savanna ridges.",
        highlights=[
            "Steep cliff contour lines",
            "Talus field pace adjustments",
            "Ridge-to-gully bearing checks",
        ],
    ),
    "rainier-paradise-glacier-traverse": OrienteeringCourseModel(
        course_id="rainier-paradise-glacier-traverse",
        title="Mount Rainier Paradise Off-Trail Alpine Traverse",
        region="Mount Rainier National Park, WA",
        difficulty="expert",
        terrain_type="alpine_tundra_moraine",
        distance_km=9.2,
        checkpoint_controls=8,
        magnetic_declination_deg=14.8,
        base_pace_count_per_100m=66,
        off_trail_percentage=90,
        description="High-alpine whiteout navigation across lateral moraines, snowfields, and unmarked alpine meadows above timberline.",
        highlights=[
            "Dead reckoning in whiteout conditions",
            "Altimeter elevation verification",
            "Moraine crest handrails",
        ],
    ),
    "blue-ridge-linville-gorge-challenge": OrienteeringCourseModel(
        course_id="blue-ridge-linville-gorge-challenge",
        title="Linville Gorge Wilderness Precision Navigation",
        region="Pisgah National Forest, NC",
        difficulty="expert",
        terrain_type="rugged_canyon_rhododendron",
        distance_km=11.4,
        checkpoint_controls=16,
        magnetic_declination_deg=-7.5,
        base_pace_count_per_100m=65,
        off_trail_percentage=80,
        description="Extreme off-trail bushwhacking through dense rhododendron hells and steep canyon chimneys requiring precise compass bearings.",
        highlights=[
            "Rhododendron thicket aim-off technique",
            "Canyon rim sightlines",
            "Spur-and-draw terrain association",
        ],
    ),
    "boulder-chautauqua-sprint-course": OrienteeringCourseModel(
        course_id="boulder-chautauqua-sprint-course",
        title="Chautauqua Open Mesa Orienteering Sprint",
        region="Boulder Open Space, CO",
        difficulty="beginner",
        terrain_type="open_pine_savanna",
        distance_km=4.2,
        checkpoint_controls=10,
        magnetic_declination_deg=8.5,
        base_pace_count_per_100m=63,
        off_trail_percentage=25,
        description="Fast-paced introduction to topographic map reading and control point identification along open ponderosa pine foothills.",
        highlights=[
            "Distinct trail intersections",
            "Flatiron geological landmarks",
            "Easy thumbing-the-map practice",
        ],
    ),
}

DEFAULT_ORIENTEERING_GEAR: list[OrienteeringGearRequirement] = [
    OrienteeringGearRequirement(
        item_id="mirrored-sighting-compass",
        name="Adjustable Declination Mirrored Sighting Compass",
        category="compass",
        mandatory=True,
        purpose="Sighting mirror with sighting hole, 1° resolution bezel, clinometer for slope angle, and tool-adjustable declination screw.",
    ),
    OrienteeringGearRequirement(
        item_id="waterproof-topo-map",
        name="Waterproof 1:24,000 USGS Topographic Map & Map Case",
        category="map",
        mandatory=True,
        purpose="Detailed 7.5-minute quadrangle map with 40ft contour intervals, protected inside a UV-resistant watertight sealable case.",
    ),
    OrienteeringGearRequirement(
        item_id="utm-mgrs-grid-reader",
        name="Transparent Corner UTM / MGRS Coordinate Grid Reader & Protractor",
        category="tools",
        mandatory=True,
        purpose="Precision 1:24k/1:25k/1:50k slot ruler and 360° protractor for plotting exact 6-to-8-digit grid coordinates.",
    ),
    OrienteeringGearRequirement(
        item_id="ranger-pace-tally-beads",
        name="Ranger Pace Count Tally Beads (Paracord & Beads)",
        category="pacing",
        mandatory=True,
        purpose="Mechanical pace counter with 9 100m beads and 4 1km beads to track dead-reckoning distance without losing count.",
    ),
    OrienteeringGearRequirement(
        item_id="barometric-altimeter-watch",
        name="Calibrated Barometric Altimeter Watch & Backup Compass",
        category="instruments",
        mandatory=True,
        purpose="Barometric elevation gauge calibrated at known benchmarks to verify contour elevation bands and cross-check position.",
    ),
    OrienteeringGearRequirement(
        item_id="high-visibility-marking-ribbon",
        name="High-Visibility Biodegradable Surveying Ribbon & Map Pen",
        category="marking",
        mandatory=True,
        purpose="Non-permanent fine-point waterproof alcohol pen for route sketching and biodegradable trail flags for attack point confirmation.",
    ),
]

TERRAIN_PACE_MULTIPLIERS: dict[str, float] = {
    "flat_trail": 1.0,
    "open_forest": 1.10,
    "rocky_talus": 1.35,
    "dense_brush": 1.50,
    "snowfield": 1.40,
}

TERRAIN_SPEED_KMH: dict[str, float] = {
    "flat_trail": 4.0,
    "open_forest": 3.0,
    "rocky_talus": 1.8,
    "dense_brush": 1.2,
    "snowfield": 1.5,
}

VISIBILITY_FACTORS: dict[str, float] = {
    "clear": 1.0,
    "dense_canopy": 1.0,
    "fog_overcast": 0.8,
    "night_whiteout": 0.6,
}


def get_orienteering_courses(difficulty: Optional[str] = None) -> list[OrienteeringCourseModel]:
    courses = list(DEFAULT_ORIENTEERING_COURSES.values())
    if difficulty:
        diff_norm = difficulty.strip().lower()
        courses = [c for c in courses if c.difficulty.lower() == diff_norm]
    return courses


def get_orienteering_course_by_id(course_id: str) -> Optional[OrienteeringCourseModel]:
    normalized = course_id.strip().lower()
    return DEFAULT_ORIENTEERING_COURSES.get(normalized)


def get_orienteering_gear() -> list[OrienteeringGearRequirement]:
    return DEFAULT_ORIENTEERING_GEAR


def calculate_navigation_leg(request: NavigationLegRequest) -> NavigationLegResponse:
    course = get_orienteering_course_by_id(request.course_id)
    if not course:
        raise ValueError(f"Orienteering course '{request.course_id}' not found")

    declination = course.magnetic_declination_deg
    # Magnetic bearing: map bearing minus declination
    raw_magnetic = ((request.map_bearing_degrees - declination) % 360.0 + 360.0) % 360.0
    magnetic_bearing_degrees = round(raw_magnetic, 1)

    # Back bearing (reciprocal)
    if request.map_bearing_degrees < 180.0:
        back_bearing_degrees = round(request.map_bearing_degrees + 180.0, 1)
    else:
        back_bearing_degrees = round(request.map_bearing_degrees - 180.0, 1)

    # Aim-off bearing (+4° deliberate offset)
    aim_off_bearing_degrees = round((request.map_bearing_degrees + 4.0) % 360.0, 1)

    # Terrain multiplier and pace calculations
    terrain_multiplier = TERRAIN_PACE_MULTIPLIERS.get(request.terrain_type, 1.0)
    effective_pace_count_per_100m = round(course.base_pace_count_per_100m * terrain_multiplier)
    total_double_paces = round((request.leg_distance_meters / 100.0) * effective_pace_count_per_100m)

    # Speed and time calculation
    base_speed = TERRAIN_SPEED_KMH.get(request.terrain_type, 3.0)
    visibility_factor = VISIBILITY_FACTORS.get(request.visibility, 1.0)
    speed_km_h = base_speed * visibility_factor
    estimated_time_minutes = max(1, round(((request.leg_distance_meters / 1000.0) / speed_km_h) * 60.0))

    # Technique recommendation
    if request.visibility == "night_whiteout":
        technique_recommendation = (
            "Leap-frog pacing: Send lead navigator forward to the edge of visibility, "
            "check bearing alignment, and repeat."
        )
    elif request.terrain_type == "dense_brush":
        technique_recommendation = (
            "Aiming off: Deliberately navigate 4° off target toward a linear catching feature "
            "(stream/trail) to avoid directional ambiguity."
        )
    elif request.terrain_type == "rocky_talus":
        technique_recommendation = (
            "Handrail & Attack Point: Follow distinct contour lines or ridge spines "
            "toward a prominent boulder or saddle attack point."
        )
    elif request.terrain_type == "snowfield":
        technique_recommendation = (
            "Dead reckoning & Altimeter checks: Maintain compass heading with strict pace tally counting, "
            "confirming elevation bands."
        )
    elif request.terrain_type == "open_forest":
        technique_recommendation = (
            "Thumbing the map & Point-to-point: Keep thumb anchored on current location, "
            "checking bearing at every prominent knoll or re-entrant."
        )
    else:
        technique_recommendation = (
            "Direct azimuth navigation: Follow compass sighting line directly to destination control point."
        )

    # Safety advisory
    if request.visibility == "night_whiteout":
        safety_advisory = (
            "Extreme disorientation hazard: maintain strict contact with handrails and leap-frog bearings."
        )
    elif request.visibility == "fog_overcast":
        safety_advisory = "Reduced optical range: keep legs under 400m between verified attack points."
    elif request.terrain_type == "dense_brush":
        safety_advisory = "High risk of lateral drift: aim off by 4° toward a definitive linear catching feature."
    elif request.terrain_type == "rocky_talus":
        safety_advisory = (
            "Slip and fall hazard on loose scree: reduce pace length and verify handholds across boulder fields."
        )
    elif request.terrain_type == "snowfield":
        safety_advisory = (
            "Hypothermia and cornice hazard: verify barometric altimeter and watch for concealed crevasses or wind slabs."
        )
    else:
        safety_advisory = (
            "Nominal off-trail conditions: maintain dead reckoning pace tally and periodic bearing cross-checks."
        )

    return NavigationLegResponse(
        course_id=course.course_id,
        course_title=course.title,
        magnetic_bearing_degrees=magnetic_bearing_degrees,
        back_bearing_degrees=back_bearing_degrees,
        aim_off_bearing_degrees=aim_off_bearing_degrees,
        effective_pace_count_per_100m=effective_pace_count_per_100m,
        total_double_paces=total_double_paces,
        estimated_time_minutes=estimated_time_minutes,
        technique_recommendation=technique_recommendation,
        safety_advisory=safety_advisory,
    )


def extract_orienteering_intent(message: str) -> Optional[OrienteeringIntent]:
    q = message.lower()

    # Guardrails against hijacking other services
    # 1. Customer support / order tracking exclusions
    if any(k in q for k in ["order #", "return label", "refund", "promo code", "shipping status", "order tracking"]):
        return None

    # 2. GPS / digital navigation exclusions
    if any(k in q for k in ["gpx", "gps unit", "geocaching", "satellite navigation"]):
        return None

    # 3. Caving exclusions
    if any(k in q for k in ["caving", "speleology", "srt", "abseil", "stalactite", "rebelay", "cave "]):
        return None

    # 4. Explicit orienteering keywords
    orienteering_keywords = [
        "orienteering",
        "compass bearing",
        "magnetic declination",
        "pace count",
        "map reading",
        "topo map",
        "grid reader",
        "dead reckoning",
        "aiming off",
        "aim off",
        "back bearing",
        "triangulation",
        "attack point",
        "contour interval",
        "harriman silvermine",
        "linville gorge navigation",
        "chautauqua orienteering",
        "rogaine",
        "pace tally",
        "sighting compass",
        "handrail",
        "catching feature",
        "control point",
        "thumbing the map",
        "land navigation",
        "navigation",
        "off-trail",
    ]

    has_orienteering_keyword = any(k in q for k in orienteering_keywords)

    # Exclude other domain journeys if no explicit orienteering terms are present
    other_domain_terms = [
        "carpool",
        "shuttle",
        "park pass",
        "passes",
        "lottery",
        "permit",
        "kayak",
        "whitewater",
        "rapid",
        "paddler",
        "climbing clinic",
        "rock climbing",
        "trip plan",
        "itinerary",
        "packing list",
        "plan a trip",
        "marked hiking trails",
        "glacier travel",
    ]
    if any(k in q for k in other_domain_terms) and not has_orienteering_keyword:
        return None

    # Check for specific course identifiers with contextual qualifiers
    course_id: Optional[str] = None
    if "harriman silvermine" in q or "harriman" in q or "silvermine" in q:
        course_id = "harriman-silvermine-classic"
    elif "rogaine" in q or "devil's lake" in q or "devils lake" in q:
        course_id = "devils-lake-bluff-rogaine"
    elif ("rainier" in q or "paradise" in q) and (
        "glacier traverse" in q or "traverse" in q or "whiteout" in q or has_orienteering_keyword
    ):
        course_id = "rainier-paradise-glacier-traverse"
    elif "linville gorge" in q or (
        "linville" in q and ("navigation" in q or "challenge" in q or has_orienteering_keyword)
    ):
        course_id = "blue-ridge-linville-gorge-challenge"
    elif "chautauqua" in q or (
        "boulder" in q and ("sprint" in q or "orienteering" in q or "mesa" in q or has_orienteering_keyword)
    ):
        course_id = "boulder-chautauqua-sprint-course"

    if not has_orienteering_keyword and not course_id:
        return None

    # Difficulty extraction
    difficulty: Optional[str] = None
    if "beginner" in q:
        difficulty = "beginner"
    elif "intermediate" in q:
        difficulty = "intermediate"
    elif "advanced" in q:
        difficulty = "advanced"
    elif "expert" in q:
        difficulty = "expert"

    # Terrain type extraction
    terrain_type: Optional[str] = None
    if "brush" in q or "rhododendron" in q:
        terrain_type = "dense_brush"
    elif "talus" in q or "rocky" in q or "scree" in q:
        terrain_type = "rocky_talus"
    elif "snow" in q or "glacier" in q or "snowfield" in q:
        terrain_type = "snowfield"
    elif "trail" in q:
        terrain_type = "flat_trail"
    elif "forest" in q or "woods" in q:
        terrain_type = "open_forest"

    # Action determination
    if any(k in q for k in ["calculate", "bearing", "declination", "pace", "paces", "dead reckoning", "aiming off", "aim off", "back bearing", "leg calculation"]):
        action = "calculate_leg"
    elif any(k in q for k in ["gear", "equipment", "checklist", "mandatory", "tools", "kit"]) and not course_id:
        action = "gear_checklist"
    elif course_id and any(k in q for k in ["detail", "about", "course", "navigate", "info", "explore", "tell me about"]):
        action = "course_detail"
    elif course_id:
        action = "course_detail"
    elif any(k in q for k in ["gear", "equipment", "checklist", "mandatory", "tools", "kit"]):
        action = "gear_checklist"
    else:
        action = "courses_list"

    return OrienteeringIntent(
        action=action,
        course_id=course_id,
        difficulty=difficulty,
        terrain_type=terrain_type,
    )


# Alias for compatibility
detect_orienteering_intent = extract_orienteering_intent


class FormattedOrienteeringResponse(str):
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


def format_orienteering_response(intent: OrienteeringIntent) -> FormattedOrienteeringResponse:
    if intent.action == "calculate_leg":
        course_id = intent.course_id or "harriman-silvermine-classic"
        terrain = intent.terrain_type or "open_forest"
        req = NavigationLegRequest(course_id=course_id, terrain_type=terrain)
        leg = calculate_navigation_leg(req)
        answer = (
            f"Navigation Leg Calculation for {leg.course_title}: "
            f"Magnetic bearing is {leg.magnetic_bearing_degrees}° (back bearing {leg.back_bearing_degrees}°, "
            f"aim-off bearing {leg.aim_off_bearing_degrees}°). "
            f"Effective pace count is {leg.effective_pace_count_per_100m} double paces/100m "
            f"(total: {leg.total_double_paces} double paces, est. {leg.estimated_time_minutes} min). "
            f"Technique: {leg.technique_recommendation} Safety: {leg.safety_advisory}"
        )
        info = {
            "action": "calculate_leg",
            "course_id": leg.course_id,
            "course_title": leg.course_title,
            "magnetic_bearing_degrees": leg.magnetic_bearing_degrees,
            "back_bearing_degrees": leg.back_bearing_degrees,
            "aim_off_bearing_degrees": leg.aim_off_bearing_degrees,
            "effective_pace_count_per_100m": leg.effective_pace_count_per_100m,
            "total_double_paces": leg.total_double_paces,
            "estimated_time_minutes": leg.estimated_time_minutes,
            "technique_recommendation": leg.technique_recommendation,
            "safety_advisory": leg.safety_advisory,
            "leg": leg.model_dump(),
        }
        return FormattedOrienteeringResponse(answer, {"answer": answer, "orienteering_info": info})

    if intent.action == "course_detail" and intent.course_id:
        course = get_orienteering_course_by_id(intent.course_id)
        if course:
            answer = (
                f"Orienteering Course: {course.title} ({course.region}). "
                f"Difficulty: {course.difficulty} | Distance: {course.distance_km} km | Checkpoints: {course.checkpoint_controls}. "
                f"Declination: {course.magnetic_declination_deg}° | Base pace: {course.base_pace_count_per_100m} double paces/100m. "
                f"Off-trail: {course.off_trail_percentage}%. {course.description} "
                f"Key Highlights: {'; '.join(course.highlights)}."
            )
            info = {
                "action": "course_detail",
                "course_id": course.course_id,
                "course": course.model_dump(),
            }
            return FormattedOrienteeringResponse(answer, {"answer": answer, "orienteering_info": info})

    if intent.action == "gear_checklist":
        gear = get_orienteering_gear()
        gear_names = ", ".join(g.name for g in gear)
        answer = (
            f"Mandatory Wilderness Orienteering Kit Checklist (6 items): {gear_names}. "
            "Adjustable mirrored sighting compass, waterproof topo map, grid reader, pace tally beads, "
            "altimeter watch, and marking ribbon form the baseline for off-trail navigation."
        )
        info = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
        }
        return FormattedOrienteeringResponse(answer, {"answer": answer, "orienteering_info": info})

    # Default: courses_list
    courses = get_orienteering_courses(difficulty=intent.difficulty)
    summary = "; ".join(f"{c.title} ({c.difficulty}, {c.region})" for c in courses)
    answer = (
        f"Contoso Wilderness Orienteering Courses: {summary}. "
        "Each course tests precision magnetic declination adjustment, pace count calibration, "
        "resection triangulation, and off-trail dead reckoning."
    )
    info = {
        "action": "courses_list",
        "courses": [c.model_dump() for c in courses],
    }
    return FormattedOrienteeringResponse(answer, {"answer": answer, "orienteering_info": info})


def build_orienteering_prompt(intent: OrienteeringIntent) -> str:
    lines = ["Wilderness Orienteering & Off-Trail Land Navigation Tooling:"]
    if intent.course_id:
        course = get_orienteering_course_by_id(intent.course_id)
        if course:
            lines.append(
                f"- Selected Course: {course.title} ({course.region})\n"
                f"  Difficulty: {course.difficulty} | Distance: {course.distance_km} km | Checkpoints: {course.checkpoint_controls}\n"
                f"  Declination: {course.magnetic_declination_deg}° | Base Pace: {course.base_pace_count_per_100m} double paces/100m\n"
                f"  Off-trail: {course.off_trail_percentage}% | Terrain: {course.terrain_type}\n"
                f"  Description: {course.description}\n"
                f"  Highlights: {'; '.join(course.highlights)}"
            )
    elif intent.action == "gear_checklist":
        gear = get_orienteering_gear()
        lines.append("- Mandatory Orienteering Navigation Kit Checklist:")
        for g in gear:
            lines.append(f"  * {g.name} [{g.category}]: {g.purpose}")
    elif intent.action == "calculate_leg":
        lines.extend([
            "- Land Navigation & Bearing Arithmetic:",
            "  * Magnetic Bearing = Map Bearing - Magnetic Declination (West declination is negative, so subtract negative = add).",
            "  * Back Bearing (Reciprocal) = Bearing + 180° if < 180°, else Bearing - 180°.",
            "  * Aiming Off: Intentionally offset 4° toward a catching linear feature (stream, road, contour handrail).",
            "  * Terrain Pace Adjustment: Dense brush (+50%), snowfield (+40%), rocky talus (+35%), open forest (+10%).",
        ])
    else:
        courses = get_orienteering_courses(difficulty=intent.difficulty)
        lines.append(
            f"- Available Orienteering Courses ({intent.difficulty or 'All Difficulties'}): "
            + "; ".join(f"{c.title} [{c.difficulty}, {c.region}]" for c in courses)
        )

    lines.extend([
        "- Core Wilderness Orienteering Principles:",
        "  1. Declination Adjustment: Always verify local declination diagram on USGS 7.5-minute quadrangles.",
        "  2. Pace Counting: Count double paces (every left foot strike) calibrated per 100m across varying terrain.",
        "  3. Attack Points: Navigate to large, unmistakable features near your target before fine-tuning final approach.",
        "  4. Handrails & Catching Features: Use ridges, streams, or linear trails to bound off-trail travel and prevent overshooting.",
    ])
    return "\n".join(lines)
