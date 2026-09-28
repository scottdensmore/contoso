import re
from typing import Any, Optional

from pydantic import BaseModel, Field


class ZiplineCourseModel(BaseModel):
    course_id: str
    title: str
    canyon_location: str
    state_or_region: str
    span_length_ft: int
    vertical_drop_ft: int
    max_speed_mph: int
    course_type: str
    braking_system: str
    description: str
    highlights: list[str] = Field(default_factory=list)


class ZiplineRequest(BaseModel):
    course_id: str = "royal-gorge-canyon-extreme"
    rider_payload_lbs: float = 175.0
    line_length_ft: int = 2400
    slope_grade_percent: float = 15.0
    trolley_bearing: str = "dual_steel_high_speed"


class ZiplineResponse(BaseModel):
    course_id: str
    course_title: str
    course_type: str
    rider_payload_lbs: float
    calculated_speed_mph: float
    braking_distance_ft: int
    cable_tension_kn: float
    safety_rating: str
    speed_category: str
    braking_advisory: str
    engineering_advisory: str


class ZiplineGearModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class ZiplineIntent(BaseModel):
    action: str
    course_id: str | None = None
    course_type: str | None = None

    def __bool__(self) -> bool:
        return bool(self.action)


class FormattedZiplineResponse(str):
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


ZIPLINE_COURSES: dict[str, ZiplineCourseModel] = {
    "royal-gorge-canyon-extreme": ZiplineCourseModel(
        course_id="royal-gorge-canyon-extreme",
        title="Royal Gorge Canyon Extreme Highline Traverse",
        canyon_location="Royal Gorge Canyon, Cañon City",
        state_or_region="Colorado, USA",
        span_length_ft=2400,
        vertical_drop_ft=450,
        max_speed_mph=65,
        course_type="extreme_gravity",
        braking_system="ZipStop Heavy-Duty Magnetic Braking System with Dual Spring Buffer",
        description="Extreme gravity zipline soaring 1,000 feet above the Arkansas River through the sheer granite walls of Royal Gorge.",
        highlights=[
            "1,000-ft gorge canyon clearance",
            "Dual steel high-speed trolley traverse",
            "ZipStop magnetic arrest terminal",
        ],
    ),
    "snake-river-canyon-highline": ZiplineCourseModel(
        course_id="snake-river-canyon-highline",
        title="Snake River Canyon Highline Cross-Chasm Zipline",
        canyon_location="Snake River Canyon, Twin Falls",
        state_or_region="Idaho, USA",
        span_length_ft=2800,
        vertical_drop_ft=380,
        max_speed_mph=58,
        course_type="canyon_highline",
        braking_system="ZipStop Magnetic Braking with Impact Trolley Capture",
        description="Highline canyon traverse crossing basalt canyon cliffs with dramatic gorge views above the Snake River.",
        highlights=[
            "Basalt rim-to-rim canyon crossing",
            "Highline cable tension engineering",
            "Zero-impact magnetic braking finish",
        ],
    ),
    "haleakala-canopy-rainforest": ZiplineCourseModel(
        course_id="haleakala-canopy-rainforest",
        title="Haleakala Canopy Rainforest Aerial Zipline Tour",
        canyon_location="Haleakala Slopes, Maui",
        state_or_region="Hawaii, USA",
        span_length_ft=1800,
        vertical_drop_ft=220,
        max_speed_mph=45,
        course_type="canopy_tour",
        braking_system="ZipStop Standard Magnetic Retractor System",
        description="Multi-tier rainforest canopy traverse gliding over eucalyptus forests, gulches, and coastal valleys on Haleakala.",
        highlights=[
            "Subtropical eucalyptus canopy fly-through",
            "Multi-stage tree platform traverses",
            "Eco-canopy biodiversity viewpoints",
        ],
    ),
    "red-river-gorge-cliffside": ZiplineCourseModel(
        course_id="red-river-gorge-cliffside",
        title="Red River Gorge Cliffside Sandstone Zip Traverse",
        canyon_location="Red River Gorge Geological Area, Slade",
        state_or_region="Kentucky, USA",
        span_length_ft=1900,
        vertical_drop_ft=260,
        max_speed_mph=48,
        course_type="canopy_tour",
        braking_system="ZipStop Magnetic Brake with Secondary Spring Damper",
        description="Spectacular sandstone cliffside traverse skirting massive arches, hemlock ravines, and rugged Appalachian crags.",
        highlights=[
            "Sandstone cliff wall proximity",
            "Hemlock ravine canyon crossing",
            "Smooth deceleration arrival terminal",
        ],
    ),
    "new-river-gorge-span-express": ZiplineCourseModel(
        course_id="new-river-gorge-span-express",
        title="New River Gorge Span Express Highline",
        canyon_location="New River Gorge National Park, Fayetteville",
        state_or_region="West Virginia, USA",
        span_length_ft=3100,
        vertical_drop_ft=420,
        max_speed_mph=62,
        course_type="extreme_gravity",
        braking_system="ZipStop Dual Magnetic Arrestor with Redundant Catch Carriage",
        description="High-speed express canyon flight spanning the ancient gorge chasm parallel to the legendary New River Gorge Bridge.",
        highlights=[
            "Expansive Appalachian gorge crossing",
            "High-speed ceramic hybrid trolley run",
            "Redundant catch carriage arrest terminal",
        ],
    ),
}

ZIPLINE_GEAR_CHECKLIST: list[ZiplineGearModel] = [
    ZiplineGearModel(
        item_id="high-speed-zipline-trolley",
        name="Dual Stainless-Steel High-Speed Zipline Trolley with Sealed Ball Bearings",
        category="trolleys",
        mandatory=True,
        purpose="Dual-bearing trolley designed for high velocities and low cable friction on long canyon spans",
    ),
    ZiplineGearModel(
        item_id="full-body-zipline-harness",
        name="Industrial Full-Body Fall-Arrest Zipline Harness with Dorsal & Sternal Attachment Points",
        category="harnesses",
        mandatory=True,
        purpose="Ensures upright rider posture and full fall-arrest safety throughout highline acceleration and deceleration",
    ),
    ZiplineGearModel(
        item_id="climbing-helmet-cert",
        name="EN 12492 Certified High-Impact Ventilated Climbing Helmet",
        category="headwear",
        mandatory=True,
        purpose="Protects against overhead cable hazards, trolley recoil, and rockfall within canyon corridors",
    ),
    ZiplineGearModel(
        item_id="heavy-duty-leather-braking-gloves",
        name="Reinforced Split-Cowhide Leather Braking & Rigging Gloves",
        category="gloves",
        mandatory=True,
        purpose="Protects hands against line friction, heat dissipation, and emergency tether handling",
    ),
    ZiplineGearModel(
        item_id="dynamic-backup-lanyard",
        name="Dual-Arm Dynamic Safety Backup Lanyard with Auto-Locking ANSI Carabiners",
        category="lanyards",
        mandatory=True,
        purpose="Redundant tether connecting harness directly to trolley backup loop and arrest carriage",
    ),
    ZiplineGearModel(
        item_id="impact-arrest-zipstop-carriage",
        name="ZipStop Magnetic Impact Brake Trolley Catch Block & Buffer Assembly",
        category="braking",
        mandatory=True,
        purpose="Absorbs high-speed impact force using self-regulating magnetic eddy-current braking technology",
    ),
]


def get_zipline_courses(course_type: Optional[str] = None) -> list[ZiplineCourseModel]:
    courses = list(ZIPLINE_COURSES.values())
    if course_type:
        type_norm = course_type.strip().lower().replace("-", "_").replace(" ", "_")
        courses = [c for c in courses if c.course_type.lower() == type_norm]
    return courses


def get_zipline_course(course_id: str) -> Optional[ZiplineCourseModel]:
    return ZIPLINE_COURSES.get(course_id)


def calculate_zipline_dynamics(req: ZiplineRequest) -> ZiplineResponse:
    course = get_zipline_course(req.course_id)
    if not course:
        raise ValueError(f"Zipline course '{req.course_id}' not found")

    bearing_multipliers = {
        "ceramic_hybrid": 1.05,
        "dual_steel_high_speed": 1.0,
        "tandem_pulley": 0.92,
    }
    mult = bearing_multipliers.get(req.trolley_bearing, 1.0)

    raw_velocity = (
        (
            2
            * 32.174
            * (req.line_length_ft * (req.slope_grade_percent / 100.0))
            * (req.rider_payload_lbs / 175.0)
            * 0.15
        )
        ** 0.5
    ) * 0.681818 * mult

    calculated_speed_mph = round(min(80.0, max(20.0, raw_velocity)), 1)
    braking_distance_ft = int(round((calculated_speed_mph**2) / 25.0))
    cable_tension_kn = round(
        (req.rider_payload_lbs * 0.00444822 * req.line_length_ft) / 80.0, 1
    )

    if calculated_speed_mph > 65.0 or req.slope_grade_percent > 22.0:
        safety_rating = "excessive_velocity_hazard_regrade"
    elif calculated_speed_mph >= 50.0:
        safety_rating = "high_speed_heavy_braking_required"
    else:
        safety_rating = "optimal_descent_dynamics"

    if calculated_speed_mph >= 65.0:
        speed_category = "extreme_speed"
    elif calculated_speed_mph >= 50.0:
        speed_category = "high_speed"
    elif calculated_speed_mph >= 35.0:
        speed_category = "moderate_speed"
    else:
        speed_category = "scenic_speed"

    if safety_rating == "excessive_velocity_hazard_regrade":
        braking_advisory = (
            f"CRITICAL BRAKING ALERT: Calculated velocity of {calculated_speed_mph} mph or slope {req.slope_grade_percent}% "
            f"exceeds safe limits. Extended braking runout of {braking_distance_ft} ft required. Line regrade and heavy-duty ZipStop array mandatory."
        )
    elif safety_rating == "high_speed_heavy_braking_required":
        braking_advisory = (
            f"High-Speed Heavy Braking Required: Projected speed is {calculated_speed_mph} mph. "
            f"ZipStop magnetic braking system requires a minimum deceleration zone of {braking_distance_ft} ft with secondary emergency arrest device (EAD)."
        )
    else:
        braking_advisory = (
            f"Optimal Descent Dynamics: Projected speed is {calculated_speed_mph} mph with nominal braking distance of {braking_distance_ft} ft. "
            f"Standard ZipStop magnetic arrest buffer provides smooth, consistent rider deceleration."
        )

    engineering_advisory = (
        f"Catenary Engineering Profile: Cable tension calculated at {cable_tension_kn} kN for {req.line_length_ft} ft span with {req.trolley_bearing} bearings. "
        f"Maintain certified 5:1 structural safety factor on galvanized aircraft cable and verify anchor termination tension proof-load."
    )

    return ZiplineResponse(
        course_id=course.course_id,
        course_title=course.title,
        course_type=course.course_type,
        rider_payload_lbs=req.rider_payload_lbs,
        calculated_speed_mph=calculated_speed_mph,
        braking_distance_ft=braking_distance_ft,
        cable_tension_kn=cable_tension_kn,
        safety_rating=safety_rating,
        speed_category=speed_category,
        braking_advisory=braking_advisory,
        engineering_advisory=engineering_advisory,
    )


def get_zipline_gear_checklist() -> list[ZiplineGearModel]:
    return list(ZIPLINE_GEAR_CHECKLIST)


def detect_zipline_intent(text: str) -> Optional[ZiplineIntent]:
    q = text.lower()

    exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "burro",
        "horse",
        "pack goat",
        "dogsled",
        "trapping",
        "gold pan",
        "beachcombing",
        "fire lookout",
        "snowshoe",
        "sandboarding",
        "cave diving",
        "caving",
        "ski touring",
        "steep skiing",
        "nordic",
        "telemark",
        "falconry",
        "llama",
        "pack llama",
        "rentals",
        "rental",
    ]
    if any(k in q for k in exclusions):
        return None

    zipline_keywords = [
        r"\bzip[\s-]?line(?:s)?\b",
        r"\bcanopy[\s-]tour(?:s)?\b",
        r"\bcanyon[\s-]highline(?:s)?\b",
        r"\baerial[\s-]traverse(?:s)?\b",
        r"\bextreme[\s-]gravity[\s-]zipline(?:s)?\b",
        r"\bzipstop\b",
        r"\btrolley\s+bearing(?:s)?\b",
        r"\bpulley\s+trolley(?:s)?\b",
        r"\bzipping\b",
        r"\bhighline\b",
        r"\broyal[\s-]gorge\b",
        r"\bsnake[\s-]river\b",
        r"\bhaleakala\b",
        r"\bred[\s-]river[\s-]gorge\b",
        r"\bnew[\s-]river[\s-]gorge\b",
    ]
    if not any(re.search(pat, q) for pat in zipline_keywords):
        return None

    matched_course_id: Optional[str] = None
    if "royal gorge" in q or "royal-gorge" in q:
        matched_course_id = "royal-gorge-canyon-extreme"
    elif "snake river" in q or "snake-river" in q:
        matched_course_id = "snake-river-canyon-highline"
    elif "haleakala" in q or "maui" in q:
        matched_course_id = "haleakala-canopy-rainforest"
    elif "red river" in q or "red-river" in q:
        matched_course_id = "red-river-gorge-cliffside"
    elif "new river" in q or "new-river" in q:
        matched_course_id = "new-river-gorge-span-express"

    matched_course_type: Optional[str] = None
    if "extreme" in q or "gravity" in q:
        matched_course_type = "extreme_gravity"
    elif "highline" in q:
        matched_course_type = "canyon_highline"
    elif "canopy" in q or "rainforest" in q:
        matched_course_type = "canopy_tour"

    calc_keywords = [
        "calculate",
        "calc",
        "speed",
        "velocity",
        "tension",
        "cable tension",
        "braking distance",
        "dynamics",
        "bearing",
        "slope",
        "grade",
        "mph",
        "payload",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "harness",
        "helmet",
        "gloves",
        "lanyard",
        "carabiner",
        "trolley",
        "catch block",
    ]

    if any(k in q for k in calc_keywords) and any(
        k in q
        for k in [
            "calculate",
            "calc",
            "speed",
            "velocity",
            "tension",
            "braking",
            "dynamics",
            "bearing",
            "mph",
            "distance",
        ]
    ):
        action = "calculate"
    elif any(k in q for k in gear_keywords) and any(
        k in q
        for k in [
            "gear",
            "checklist",
            "equipment",
            "harness",
            "helmet",
            "gloves",
            "lanyard",
        ]
    ):
        action = "gear"
    elif matched_course_id and any(
        k in q
        for k in [
            "detail",
            "details",
            "about",
            "describe",
            "elevation",
            "course",
            "span",
            "tell me",
            "drop",
            "extreme",
        ]
    ):
        action = "course_detail"
    else:
        action = (
            "course_detail"
            if (
                matched_course_id
                and not any(
                    k in q
                    for k in [
                        "courses",
                        "catalog",
                        "list",
                        "tours",
                        "options",
                        "all",
                        "offer",
                        "routes",
                    ]
                )
            )
            else "courses_list"
        )

    return ZiplineIntent(
        action=action,
        course_id=matched_course_id,
        course_type=matched_course_type,
    )


def format_zipline_response(
    intent: Any,
    query: str = "",
) -> FormattedZiplineResponse:
    if isinstance(intent, ZiplineResponse):
        calc = intent
        answer = (
            f"Wilderness Canyon Zipline Dynamics Analysis for {calc.course_title}: "
            f"Calculated speed is {calc.calculated_speed_mph} mph ({calc.speed_category.replace('_', ' ').title()}). "
            f"Safety rating: {calc.safety_rating.replace('_', ' ').title()}. "
            f"Braking distance required: {calc.braking_distance_ft} ft. "
            f"Catenary cable tension: {calc.cable_tension_kn} kN. "
            f"{calc.braking_advisory} {calc.engineering_advisory}"
        )
        resp_calc_info: dict[str, Any] = {
            "zipline_info": {
                "action": "calculate",
                "course_id": calc.course_id,
                "calculation": calc.model_dump(),
            },
            "answer": answer,
        }
        return FormattedZiplineResponse(answer, resp_calc_info)

    if isinstance(intent, dict):
        if "zipline_info" in intent and "answer" in intent:
            return FormattedZiplineResponse(str(intent["answer"]), intent)
        parsed_intent = (
            ZiplineIntent(**intent)
            if "action" in intent
            else (
                detect_zipline_intent(str(query) or str(intent))
                or ZiplineIntent(action="courses_list")
            )
        )
    elif isinstance(intent, ZiplineIntent):
        parsed_intent = intent
    else:
        parsed_intent = detect_zipline_intent(str(intent)) or ZiplineIntent(
            action="courses_list"
        )

    if parsed_intent.action in ("calculate", "calculate_dynamics"):
        calc_req = (
            query
            if isinstance(query, ZiplineRequest)
            else ZiplineRequest(
                course_id=parsed_intent.course_id or "royal-gorge-canyon-extreme"
            )
        )
        calc_res = calculate_zipline_dynamics(calc_req)
        answer = (
            f"Wilderness Canyon Zipline Dynamics Analysis for {calc_res.course_title}: "
            f"Calculated speed is {calc_res.calculated_speed_mph} mph ({calc_res.speed_category.replace('_', ' ').title()}). "
            f"Safety rating: {calc_res.safety_rating.replace('_', ' ').title()}. "
            f"Braking distance required: {calc_res.braking_distance_ft} ft. "
            f"Catenary cable tension: {calc_res.cable_tension_kn} kN. "
            f"{calc_res.braking_advisory} {calc_res.engineering_advisory}"
        )
        calc_info: dict[str, Any] = {
            "zipline_info": {
                "action": "calculate",
                "course_id": calc_res.course_id,
                "calculation": calc_res.model_dump(),
            },
            "answer": answer,
        }
        return FormattedZiplineResponse(answer, calc_info)

    if parsed_intent.action in ("gear", "gear_checklist"):
        checklist = get_zipline_gear_checklist()
        items_str = "; ".join(f"{item.name} ({item.purpose})" for item in checklist)
        answer = (
            f"Mandatory Wilderness Canyon Zipline Safety Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Riders must wear certified full-body harness, dual high-speed trolley, "
            f"ANSI backup lanyards, high-impact helmets, and heavy-duty leather braking gloves."
        )
        gear_info: dict[str, Any] = {
            "zipline_info": {
                "action": "gear",
                "gear": [item.model_dump() for item in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedZiplineResponse(answer, gear_info)

    if parsed_intent.action == "course_detail" and parsed_intent.course_id:
        course = get_zipline_course(parsed_intent.course_id)
        if course:
            highlights_str = ", ".join(course.highlights)
            answer = (
                f"Zipline Course: {course.title} ({course.canyon_location}, {course.state_or_region}). "
                f"Span: {course.span_length_ft} ft | Drop: {course.vertical_drop_ft} ft | "
                f"Max Speed: {course.max_speed_mph} mph | Course Type: {course.course_type.replace('_', ' ').title()} | "
                f"Braking System: {course.braking_system}. "
                f"{course.description} Key Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "zipline_info": {
                    "action": "course_detail",
                    "course_id": course.course_id,
                    "course": course.model_dump(),
                },
                "answer": answer,
            }
            return FormattedZiplineResponse(answer, detail_info)

    courses = get_zipline_courses(course_type=parsed_intent.course_type)
    summary_str = "; ".join(
        f"{c.title} ({c.span_length_ft} ft span, {c.vertical_drop_ft} ft drop, {c.max_speed_mph} mph max)"
        for c in courses
    )
    answer = (
        f"Contoso Wilderness Canyon Zipline Canopy Aerial Traversing Catalog ({len(courses)} courses): {summary_str}. "
        f"Ask about specific course details, speed and cable tension dynamics calculations, "
        f"or mandatory ZipStop magnetic braking and safety gear checklists."
    )
    list_info: dict[str, Any] = {
        "zipline_info": {
            "action": "courses_list",
            "course_type": parsed_intent.course_type,
            "courses": [c.model_dump() for c in courses],
        },
        "answer": answer,
    }
    return FormattedZiplineResponse(answer, list_info)


def build_zipline_prompt(intent: Optional[ZiplineIntent] = None) -> str:
    lines = [
        "Wilderness Canyon Zipline Canopy Aerial Traversing & Highline Engineering Guidance:",
        "- High-Tension Canyon Crossings: Zipline traverses across massive gorges (Royal Gorge, Snake River Canyon) require high-tensile 7x19 aircraft cable tension calculations, sag monitoring, and minimum 5:1 safety factors.",
        "- ZipStop Magnetic Braking Systems: Non-contact magnetic eddy-current braking technology (ZipStop IR) automatically self-regulates resistance based on rider velocity, combined with redundant secondary emergency arrest devices (EAD).",
        "- Trolley Bearing Engineering: High-speed dual stainless-steel ball bearings and ceramic hybrid bearings minimize line friction and heat buildup during long canyon descents.",
        "- Mandatory Fall-Arrest Gear: Industrial full-body harnesses with dorsal/sternal tie-in, EN 12492 climbing helmets, dual-arm dynamic backup lanyards with ANSI auto-locking carabiners, and reinforced leather rigging gloves.",
    ]
    if intent and intent.action == "course_detail" and intent.course_id:
        c = get_zipline_course(intent.course_id)
        if c:
            lines.append(
                f"- Focused Course: {c.title} ({c.canyon_location}, {c.state_or_region}, "
                f"Span: {c.span_length_ft} ft, Drop: {c.vertical_drop_ft} ft, Speed: {c.max_speed_mph} mph)"
            )
    return "\n".join(lines)


def zipline_tool(
    request: Optional[ZiplineRequest] = None,
    action: Optional[str] = None,
    course_id: Optional[str] = None,
    course_type: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for wilderness canyon zipline canopy aerial traversing and speed calculations."""
    if isinstance(request, ZiplineRequest):
        return calculate_zipline_dynamics(request)
    intent = kwargs.get("intent")
    if action in ("calculate", "calculate_dynamics") or "rider_payload_lbs" in kwargs:
        req = ZiplineRequest(
            course_id=course_id
            or (intent.course_id if intent else None)
            or "royal-gorge-canyon-extreme",
            rider_payload_lbs=float(kwargs.get("rider_payload_lbs", 175.0)),
            line_length_ft=int(kwargs.get("line_length_ft", 2400)),
            slope_grade_percent=float(kwargs.get("slope_grade_percent", 15.0)),
            trolley_bearing=str(
                kwargs.get("trolley_bearing", "dual_steel_high_speed")
            ),
        )
        return calculate_zipline_dynamics(req)
    if action in ("gear", "gear_checklist"):
        return get_zipline_gear_checklist()
    target_course_id = course_id or (intent.course_id if intent else None)
    if action == "course_detail" and target_course_id:
        return get_zipline_course(target_course_id)
    return get_zipline_courses(
        course_type=course_type or (intent.course_type if intent else None)
    )
