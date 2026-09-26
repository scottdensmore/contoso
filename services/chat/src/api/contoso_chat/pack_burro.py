import math
import re
from typing import Any, Optional

from pydantic import BaseModel, Field


class PackBurroCourseModel(BaseModel):
    course_id: str
    title: str
    location: str
    summit_elevation_m: int
    distance_km: float
    default_burro_type: str
    max_grade_percent: int
    description: str
    highlights: list[str] = Field(default_factory=list)


class PackBurroRequest(BaseModel):
    course_id: str = "leadville-boom-days-mosquito-pass"
    burro_type: str = "standard_burro"
    pack_weight_lbs: float = 35.0
    slope_gradient_percent: float = 18.0
    runner_pace_min_per_mile: float = 10.0


class PackBurroResponse(BaseModel):
    course_id: str
    course_title: str
    weight_status: str
    braking_force_lbs: int
    oxygen_level_percent: int
    team_status: str
    advisory: str


class BurroGearItemModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class PackBurroIntent(BaseModel):
    action: str
    course_id: Optional[str] = None
    burro_type: Optional[str] = None

    def __bool__(self) -> bool:
        return bool(self.action)


class FormattedPackBurroResponse(str):
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


PACK_BURRO_COURSES: dict[str, PackBurroCourseModel] = {
    "leadville-boom-days-mosquito-pass": PackBurroCourseModel(
        course_id="leadville-boom-days-mosquito-pass",
        title="Leadville Boom Days World Championship (Mosquito Pass)",
        location="Lake County, Leadville, CO, USA",
        summit_elevation_m=4019,
        distance_km=33.8,
        default_burro_type="standard_burro",
        max_grade_percent=24,
        description="Iconic high-altitude Rocky Mountain pack-burro race scaling Mosquito Pass summit at 13,185 ft, navigating rough mining roads and technical scree descents.",
        highlights=["Ascent to 13,185 ft Mosquito Pass summit", "Loose granite talus and scree switchbacks", "Historic 1880s mining claim trail"],
    ),
    "fairplay-burro-days-pass": PackBurroCourseModel(
        course_id="fairplay-burro-days-pass",
        title="Fairplay World Championship Burro Race",
        location="South Park, Fairplay, CO, USA",
        summit_elevation_m=3995,
        distance_km=46.7,
        default_burro_type="standard_burro",
        max_grade_percent=22,
        description="The premier long-distance marathon leg of the Colorado burro racing Triple Crown through South Park historic mining districts and alpine stream crossings.",
        highlights=["High-altitude marathon endurance loop", "Stream crossings and beaver meadow bogs", "Triple Crown premiere leg"],
    ),
    "buena-vista-gold-rush-days": PackBurroCourseModel(
        course_id="buena-vista-gold-rush-days",
        title="Buena Vista Gold Rush Pack-Burro Challenge",
        location="Chaffee County, CO, USA",
        summit_elevation_m=2850,
        distance_km=21.0,
        default_burro_type="standard_burro",
        max_grade_percent=18,
        description="Fast and scenic Arkansas River valley burro challenge boasting spectacular views of the Collegiate Peaks and runnable gravel logging roads.",
        highlights=["Collegiate Peaks panoramic views", "Fast-paced Arkansas River gravel flats", "Rapid runner-burro stride synchronization"],
    ),
    "georgetown-canyon-burro-run": PackBurroCourseModel(
        course_id="georgetown-canyon-burro-run",
        title="Georgetown Silver Plume Mining District Run",
        location="Clear Creek County, CO, USA",
        summit_elevation_m=3100,
        distance_km=14.5,
        default_burro_type="mammoth_donkey",
        max_grade_percent=20,
        description="Steep canyon mining district challenge tracing historic narrow-gauge railroad beds and switchbacks through Silver Plume and Georgetown.",
        highlights=["Historic narrow-gauge railroad grade", "Tight alpine timber switchbacks", "Steep mining canyon ascents"],
    ),
    "idaho-springs-tombstone-dash": PackBurroCourseModel(
        course_id="idaho-springs-tombstone-dash",
        title="Idaho Springs Gold Digger Mile & Steeplechase",
        location="Clear Creek County, CO, USA",
        summit_elevation_m=2590,
        distance_km=12.0,
        default_burro_type="standard_burro",
        max_grade_percent=16,
        description="High-energy spectator sprint starting in downtown Idaho Springs and climbing rapidly up Virginia Canyon gravel mining roads.",
        highlights=["Fast spectator-lined street sprint start", "Virginia Canyon gravel climbing grind", "Technical downhill water bar jumps"],
    ),
}

BURRO_GEAR_CHECKLIST: list[BurroGearItemModel] = [
    BurroGearItemModel(
        item_id="regulation-pack-saddle",
        name="Regulation Wood Sawbuck Pack Saddle with Double Cinch & Breeching",
        category="saddle",
        mandatory=True,
        purpose="Official wooden sawbuck tree distributing weight across burro withers",
    ),
    BurroGearItemModel(
        item_id="prospector-mining-kit",
        name="Steel Mining Pick, Flat Shovel, & 14-Inch Steel Gold Pan (33-lb Minimum)",
        category="regulation_weight",
        mandatory=True,
        purpose="Mandatory heritage mining gear providing official 33-pound minimum ballast",
    ),
    BurroGearItemModel(
        item_id="cotton-lead-rope",
        name="15-Foot Heavy-Duty Braided Cotton Lead Rope with Brass Swivel Snap",
        category="tack",
        mandatory=True,
        purpose="Regulation maximum 15-foot non-metallic lead rope protecting handler hands from friction burns",
    ),
    BurroGearItemModel(
        item_id="equine-cooling-electrolyte",
        name="Equine Veterinary Oral Electrolyte Syringe & Heart Rate Stethoscope",
        category="veterinary",
        mandatory=True,
        purpose="Post-pass electrolyte replenishment and veterinary check heart rate monitoring",
    ),
    BurroGearItemModel(
        item_id="hoof-pick-and-rasp",
        name="Ergonomic Brass Hoof Pick with Stiff Bristles & Compact Finishing Rasp",
        category="hoofcare",
        mandatory=True,
        purpose="Clears sharp granite gravel and scree from frog and sole during race halts",
    ),
    BurroGearItemModel(
        item_id="high-visibility-runner-vest",
        name="Breathable Fluorescent Runner-Wrangler Vest with Whistle & Bib Holder",
        category="runner_gear",
        mandatory=True,
        purpose="Ensures handler visibility along steep mining road cutbanks and road crossings",
    ),
]


def get_pack_burro_courses(burro_type: Optional[str] = None) -> list[PackBurroCourseModel]:
    courses = list(PACK_BURRO_COURSES.values())
    if burro_type:
        bt_norm = burro_type.strip().lower().replace("-", "_").replace(" ", "_")
        courses = [c for c in courses if c.default_burro_type.lower() == bt_norm]
    return courses


def get_pack_burro_course(course_id: str) -> Optional[PackBurroCourseModel]:
    return PACK_BURRO_COURSES.get(course_id)


def calculate_pack_burro(request: PackBurroRequest) -> PackBurroResponse:
    course = get_pack_burro_course(request.course_id)
    if not course:
        raise ValueError(f"Pack burro course '{request.course_id}' not found")

    weight_status = (
        "regulation_compliant"
        if request.pack_weight_lbs >= 33.0
        else "underweight_disqualification"
    )
    braking_force_lbs = round(
        request.pack_weight_lbs * (request.slope_gradient_percent / 100.0) * 2.5
    )
    oxygen_level_percent = round(100.0 * math.exp(-course.summit_elevation_m / 8400.0))

    if request.pack_weight_lbs < 33.0:
        team_status = "disqualified_underweight_pack"
        advisory = (
            f"Disqualification alert: Pack saddle ballast is {request.pack_weight_lbs:.1f} lbs, "
            "below the mandatory 33.0 lbs regulation minimum. Ensure pick, shovel, and gold pan "
            "meet official weight requirements before passing the pre-race scale inspection."
        )
    elif request.slope_gradient_percent > 20.0:
        team_status = "caution_steep_scree_braking"
        advisory = (
            f"Caution on steep scree descent ({request.slope_gradient_percent:.1f}% grade): "
            f"High braking force ({braking_force_lbs} lbs) required. Position yourself beside "
            "or behind burro on loose talus, keep lead rope slack without hand-wrapping, "
            "and monitor footing for rolling granite rocks."
        )
    else:
        team_status = "optimal_race_cadence"
        advisory = (
            f"Optimal race cadence: Regulation pack weight compliant ({request.pack_weight_lbs:.1f} lbs) "
            f"at manageable {request.slope_gradient_percent:.1f}% grade. Estimated summit oxygen level is "
            f"{oxygen_level_percent}%. Maintain synchronized runner-burro stride over the pass."
        )

    return PackBurroResponse(
        course_id=course.course_id,
        course_title=course.title,
        weight_status=weight_status,
        braking_force_lbs=braking_force_lbs,
        oxygen_level_percent=oxygen_level_percent,
        team_status=team_status,
        advisory=advisory,
    )


def get_burro_gear() -> list[BurroGearItemModel]:
    return list(BURRO_GEAR_CHECKLIST)


def detect_pack_burro_intent(message: str) -> Optional[PackBurroIntent]:
    q = message.lower()

    # Disambiguation guards against dogsledding
    dogsled_pats = [r"\bmush(?:ing)?\b", r"\bsled\s+dog(?:s)?\b", r"\bdog\s+sled(?:ding)?\b", r"\bhusk(?:y|ies)\b", r"\biditarod\b"]
    if any(re.search(pat, q) for pat in dogsled_pats):
        return None

    # Positive pack burro & ass packing triggers
    burro_keywords = [
        r"\bpack[\s-]burro\b", r"\bburro\s+rac(?:e|ing)\b", r"\bpack[\s-]donkey\b",
        r"\bdonkey\s+pack(?:ing)?\b", r"\bdonkey\s+rac(?:e|ing)?\b", r"\bass\s+pack(?:ing)?\b",
        r"\bburro(?:s)?\b", r"\bmammoth\s+donkey\b", r"\bmosquito\s+pass\b",
        r"\bleadville\s+boom\s+days\b", r"\bfairplay\s+burro\s+days\b",
        r"\bbuena\s+vista\s+gold\s+rush\b", r"\bgeorgetown\s+silver\s+plume\b",
        r"\btombstone\s+dash\b", r"\b33[\s-]lb\s+pack\b", r"\b33\s+pounds?\b",
        r"\brunner\s+and\s+burro\b", r"\bburro\s+lead\s+rope\b", r"\bwpbr\b",
    ]
    has_burro_trigger = any(re.search(pat, q) for pat in burro_keywords)

    # Disambiguation guards against equestrian horse packing if NO burro trigger is present
    equestrian_pats = [
        r"\bhorse\s+pack(?:ing)?\b", r"\bpack\s+horse(?:s)?\b", r"\bpack\s+mule(?:s)?\b",
        r"\bmule\s+string\b", r"\bmule\s+train\b", r"\bdecker\b", r"\bbob\s+marshall\b",
        r"\bchinese\s+wall\b", r"\bpasayten\b", r"\bwind\s+river\b", r"\bpecos\b", r"\bfrank\s+church\b",
    ]
    if any(re.search(pat, q) for pat in equestrian_pats) and not has_burro_trigger:
        return None

    # Disambiguation guards against general trail running if NO burro trigger is present
    trail_running_pats = [
        r"\btrail\s+run(?:ning)?\b", r"\bultramarathon(?:s)?\b", r"\bultra\s+run(?:ning)?\b",
        r"\bfastpack(?:ing)?\b", r"\brunning\s+shoes?\b", r"\b50k\b", r"\b100k\b", r"\b100\s+miler\b",
    ]
    if any(re.search(pat, q) for pat in trail_running_pats) and not has_burro_trigger:
        return None

    if not has_burro_trigger:
        return None

    matched_course_id: Optional[str] = None
    if "leadville" in q or "mosquito pass" in q:
        matched_course_id = "leadville-boom-days-mosquito-pass"
    elif "fairplay" in q or "south park" in q:
        matched_course_id = "fairplay-burro-days-pass"
    elif "buena vista" in q or "collegiate peaks" in q:
        matched_course_id = "buena-vista-gold-rush-days"
    elif "georgetown" in q or "silver plume" in q:
        matched_course_id = "georgetown-canyon-burro-run"
    elif "idaho springs" in q or "tombstone" in q or "gold digger" in q:
        matched_course_id = "idaho-springs-tombstone-dash"

    burro_type: Optional[str] = None
    if "mammoth" in q or "mammoth_donkey" in q:
        burro_type = "mammoth_donkey"
    elif "standard" in q or "standard_burro" in q:
        burro_type = "standard_burro"

    calc_keywords = [
        "calculate", "braking", "force", "scree", "slope", "gradient",
        "weight", "compliance", "33 lb", "33-lb", "oxygen", "altitude", "cadence",
    ]
    gear_keywords = [
        "gear", "checklist", "tack", "sawbuck", "pick", "shovel", "gold pan",
        "lead rope", "veterinary", "stethoscope", "electrolyte", "hoof pick", "rasp", "vest",
    ]

    if any(k in q for k in calc_keywords):
        action = "calculate_packing"
    elif any(k in q for k in gear_keywords):
        action = "gear_checklist"
    elif matched_course_id and any(
        k in q for k in ["tell me", "detail", "about", "describe", "elevation", "pass", "highlights"]
    ):
        action = "course_detail"
    else:
        action = (
            "course_detail"
            if (matched_course_id and not any(k in q for k in ["courses", "races", "catalog", "list", "schedule"]))
            else "courses_list"
        )

    return PackBurroIntent(action=action, course_id=matched_course_id, burro_type=burro_type)


def format_pack_burro_response(
    data: Any,
    query: str = "",
) -> FormattedPackBurroResponse:
    if isinstance(data, PackBurroResponse):
        calc = data
        answer = (
            f"Pack-Burro Racing Analysis for {calc.course_title}: "
            f"Weight Status: {calc.weight_status.replace('_', ' ').title()} "
            f"(Braking force on descent: {calc.braking_force_lbs} lbs). "
            f"Summit oxygen level: {calc.oxygen_level_percent}%. "
            f"Team Status: {calc.team_status}. {calc.advisory}"
        )
        return FormattedPackBurroResponse(
            answer,
            {
                "pack_burro_info": {
                    "action": "calculate_packing",
                    "course_id": calc.course_id,
                    "calculation": calc.model_dump(),
                },
                "answer": answer,
            },
        )

    if isinstance(data, dict):
        if "pack_burro_info" in data and "answer" in data:
            return FormattedPackBurroResponse(data["answer"], data)
        if "action" in data and "course_id" in data and "braking_force_lbs" in data:
            answer = f"Pack-burro racing calculation completed for {data.get('course_id')}."
            return FormattedPackBurroResponse(answer, {"pack_burro_info": data, "answer": answer})
        intent = (
            PackBurroIntent(**data)
            if "action" in data
            else (detect_pack_burro_intent(query or str(data)) or PackBurroIntent(action="courses_list"))
        )
    elif isinstance(data, PackBurroIntent):
        intent = data
    else:
        intent = detect_pack_burro_intent(str(data)) or PackBurroIntent(action="courses_list")

    if intent.action in ("calculate_packing", "calculate"):
        req = PackBurroRequest(course_id=intent.course_id or "leadville-boom-days-mosquito-pass")
        calc = calculate_pack_burro(req)
        answer = (
            f"Pack-Burro Racing Analysis for {calc.course_title}: "
            f"Weight Status: {calc.weight_status.replace('_', ' ').title()} "
            f"(Braking force on descent: {calc.braking_force_lbs} lbs). "
            f"Summit oxygen level: {calc.oxygen_level_percent}%. "
            f"Team Status: {calc.team_status}. {calc.advisory}"
        )
        return FormattedPackBurroResponse(
            answer,
            {
                "pack_burro_info": {
                    "action": "calculate_packing",
                    "course_id": calc.course_id,
                    "calculation": calc.model_dump(),
                },
                "answer": answer,
            },
        )

    if intent.action in ("gear_checklist", "gear"):
        checklist = get_burro_gear()
        items_str = "; ".join(f"{item.name} ({item.purpose})" for item in checklist)
        answer = (
            f"Mandatory Pack-Burro Racing Gear & Veterinary Checklist ({len(checklist)} items): "
            f"{items_str}. All runners must carry official 33-lb minimum ballast including pick, "
            "shovel, and gold pan, plus a maximum 15-foot lead rope."
        )
        return FormattedPackBurroResponse(
            answer,
            {
                "pack_burro_info": {
                    "action": "gear_checklist",
                    "gear": [item.model_dump() for item in checklist],
                    "mandatory_count": len(checklist),
                },
                "answer": answer,
            },
        )

    if intent.action == "course_detail" and intent.course_id:
        course = get_pack_burro_course(intent.course_id)
        if course:
            highlights_str = ", ".join(course.highlights)
            answer = (
                f"Pack-Burro Racing Course: {course.title} ({course.location}). "
                f"Distance: {course.distance_km} km | Summit: {course.summit_elevation_m}m | Max grade: {course.max_grade_percent}%. "
                f"Default Burro Type: {course.default_burro_type.replace('_', ' ').title()}. "
                f"{course.description} Highlights: {highlights_str}."
            )
            return FormattedPackBurroResponse(
                answer,
                {
                    "pack_burro_info": {
                        "action": "course_detail",
                        "course_id": course.course_id,
                        "course": course.model_dump(),
                    },
                    "answer": answer,
                },
            )

    courses = get_pack_burro_courses(burro_type=intent.burro_type)
    summary_str = "; ".join(
        f"{c.title} ({c.distance_km}km, {c.summit_elevation_m}m summit, max grade {c.max_grade_percent}%)"
        for c in courses
    )
    answer = (
        f"Contoso Wilderness Pack-Burro Racing Courses ({len(courses)} events): {summary_str}. "
        "Ask about course details, scree braking calculations & 33-lb pack saddle weight checks, "
        "or mandatory veterinary and heritage mining gear checklists."
    )
    return FormattedPackBurroResponse(
        answer,
        {
            "pack_burro_info": {
                "action": "courses_list",
                "burro_type": intent.burro_type,
                "courses": [c.model_dump() for c in courses],
            },
            "answer": answer,
        },
    )


def build_pack_burro_prompt(intent: Optional[PackBurroIntent] = None) -> str:
    lines = [
        "Wilderness Pack-Burro Racing (WPBR) & High-Altitude Ass Packing Guidance:",
        "- Colorado Heritage Sport: Teams consist of one human runner and one burro (donkey) traveling together on foot. Burros may NOT be ridden.",
        "- Regulation 33-lb Pack Saddle Rule: The pack saddle (sawbuck tree) must carry a mandatory heritage mining kit: pick, shovel, and gold pan, weighing at least 33.0 lbs at both start and finish weigh-ins.",
        "- Lead Rope Handling: Maximum 15-foot non-metallic (cotton/nylon) lead rope. Handlers must NEVER tie the lead rope to themselves or loop it around wrists/hands.",
        "- Scree Canyon Descent Braking: On steep grades (>20%), burro downhill braking force increases substantially. Handlers must stay behind or abreast to avoid being overrun.",
        "- High-Altitude Oxygen & Veterinary Care: High pass summits (e.g. Mosquito Pass at 4,019m / 13,185ft) present severe oxygen deficits. Mandatory vet checks enforce burro heart rate recovery, hydration, and hoof health.",
    ]
    if intent and intent.action == "course_detail" and intent.course_id:
        c = get_pack_burro_course(intent.course_id)
        if c:
            lines.append(
                f"- Focused Race Course: {c.title} ({c.location}, Summit: {c.summit_elevation_m}m, "
                f"Distance: {c.distance_km}km, Max Grade: {c.max_grade_percent}%)"
            )
    return "\n".join(lines)
