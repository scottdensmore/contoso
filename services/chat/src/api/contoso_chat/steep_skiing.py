import math
from typing import Any, Optional, Union

from pydantic import BaseModel, Field


class CouloirDescentModel(BaseModel):
    id: str
    name: str
    mountain: str
    range: str
    grade: str
    max_slope_angle_deg: float
    average_slope_angle_deg: float
    vertical_drop_meters: float
    choke_width_meters: float
    aspect: str
    description: str
    highlights: list[str] = Field(default_factory=list)


class CouloirCalculationRequest(BaseModel):
    couloir_id: str = "corbets-couloir-jackson"
    slope_angle_deg: float = 50.0
    snow_surface: str = "packed_powder"
    skier_weight_kg: float = 80.0
    sluff_release_distance_meters: float = 35.0


class CouloirCalculationResponse(BaseModel):
    couloir_name: str
    sluff_velocity_km_h: float
    hop_turn_edge_load_n: float
    fall_consequence_index: str
    recommended_style: str
    sluff_management_strategy: str
    choke_warning: Optional[str] = None


class SteepSkiingGearRequirement(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool = True
    description: str


class SteepSkiingIntent(BaseModel):
    intent_detected: bool = True
    couloir_id: Optional[str] = None
    action: str = "couloirs_list"
    confidence: float = 1.0

    def __bool__(self) -> bool:
        return self.intent_detected


class FormattedSteepSkiingResponse(str):
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


DEFAULT_COULOIR_DESCENTS: dict[str, CouloirDescentModel] = {
    "corbets-couloir-jackson": CouloirDescentModel(
        id="corbets-couloir-jackson",
        name="Corbet's Couloir & S&S Chute",
        mountain="Rendezvous Mountain",
        range="Teton Range, WY",
        grade="Class_2_Steep_45_50",
        max_slope_angle_deg=50.0,
        average_slope_angle_deg=46.0,
        vertical_drop_meters=180.0,
        choke_width_meters=3.5,
        aspect="East",
        description="America's most storied in-bounds couloir featuring a 10-to-20 foot mandatory cornice drop, rock funnel walls, and 50-degree chalk turns.",
        highlights=[
            "Mandatory cornice entry air",
            "Narrow rock gate funnel",
            "Wind-buffed chalk turns",
        ],
    ),
    "tuckerman-ravine-headwall": CouloirDescentModel(
        id="tuckerman-ravine-headwall",
        name="Tuckerman Ravine — The Lip & Center Headwall",
        mountain="Mount Washington",
        range="White Mountains, NH",
        grade="Class_3_Extreme_50_55",
        max_slope_angle_deg=55.0,
        average_slope_angle_deg=51.0,
        vertical_drop_meters=320.0,
        choke_width_meters=4.0,
        aspect="East",
        description="Iconic glacial cirque headwall renowned for extreme 55-degree pitches, gaping bergschrund crevasses, and variable Atlantic freeze-thaw snowpacks.",
        highlights=[
            "Spring headwall corn turns",
            "Bergschrund gaping schrund jump",
            "Lunch Rocks spectator bowl",
        ],
    ),
    "silver-couloir-buffalo": CouloirDescentModel(
        id="silver-couloir-buffalo",
        name="Silver Couloir — Buffalo Mountain",
        mountain="Buffalo Mountain",
        range="Gore Range, CO",
        grade="Class_2_Steep_45_50",
        max_slope_angle_deg=48.0,
        average_slope_angle_deg=45.0,
        vertical_drop_meters=915.0,
        choke_width_meters=2.8,
        aspect="North",
        description="Aesthetic 3,000-vertical-foot direct plummet down Buffalo Mountain with continuous high-angle fall lines and an intimidating rocky choke midway down.",
        highlights=[
            "3,000 vertical feet continuous pitch",
            "Mid-couloir rocky choke constriction",
            "Protected cold northern powder",
        ],
    ),
    "terminal-cancer-couloir": CouloirDescentModel(
        id="terminal-cancer-couloir",
        name="Terminal Cancer Couloir",
        mountain="Ruby Dome Massif",
        range="Ruby Mountains, NV",
        grade="Class_2_Steep_45_50",
        max_slope_angle_deg=46.0,
        average_slope_angle_deg=43.0,
        vertical_drop_meters=550.0,
        choke_width_meters=2.0,
        aspect="North",
        description="A surreal 14-foot wide vertical limestone slot canyon dropping dead-straight for 1,800 feet down the Ruby Mountains like a knife slice through rock.",
        highlights=[
            "14-foot razor-thin slot walls",
            "Dead-straight continuous fall line",
            "Pencil-thin hop-turn rhythm",
        ],
    ),
    "mount-superior-south-face": CouloirDescentModel(
        id="mount-superior-south-face",
        name="Mount Superior — South Face & Suicide Chute",
        mountain="Mount Superior",
        range="Wasatch Range, UT",
        grade="Class_3_Extreme_50_55",
        max_slope_angle_deg=52.0,
        average_slope_angle_deg=47.0,
        vertical_drop_meters=890.0,
        choke_width_meters=3.0,
        aspect="South",
        description="The Wasatch premier extreme face directly overlooking Little Cottonwood Canyon highway, demanding sunrise timing before solar thermal deterioration.",
        highlights=[
            "Exposed knife-edge ridge entry",
            "Solar aspect spring corn cycle",
            "Highway 210 direct finish apron",
        ],
    ),
}

DEFAULT_STEEP_SKIING_GEAR: list[SteepSkiingGearRequirement] = [
    SteepSkiingGearRequirement(
        id="technical-ski-mountaineering-axes",
        name="Curved Ski Mountaineering Ice Axes (Pair)",
        category="axes",
        mandatory=True,
        description="Ultralight technical steel-pick axes with dual hand rests, hammer/adze heads, and spike spikes for self-arrest in 50° firm snow.",
    ),
    SteepSkiingGearRequirement(
        id="certified-ski-crampons",
        name="CNC Machined High-Angle Ski Crampons (Harscheisen)",
        category="crampons",
        mandatory=True,
        description="Waist-matched binding ski crampons providing mechanical lateral bite into frozen 45° sidehill skin tracks before booting.",
    ),
    SteepSkiingGearRequirement(
        id="ultralight-ski-rad-line",
        name="30m 6mm Hyperstatic Aramid RAD Rappel Line & Micro Traxion",
        category="rope_rad",
        mandatory=True,
        description="Hyperstatic aramid cord with progress-capture pulley for crevasse extraction and un-skiable choke cliff rappels.",
    ),
    SteepSkiingGearRequirement(
        id="ski-carry-airbag-backpack",
        name="30L Avalanche Airbag Pack with Diagonal/A-Frame Ski Carry",
        category="airbag",
        mandatory=True,
        description="Electronic or canister airbag pack reinforced with cut-resistant Dyneema ski carry straps and ice axe tool garages.",
    ),
    SteepSkiingGearRequirement(
        id="aluminum-snow-stake-fluke",
        name="Forged Aluminum T-Slot Snow Picket & Deadman Fluke",
        category="snow_anchor",
        mandatory=True,
        description="Aircraft aluminum anchor picket for driving deep deadman anchors or snow bollards to ski-belay steep icy entrances.",
    ),
    SteepSkiingGearRequirement(
        id="triple-certified-ski-climbing-helmet",
        name="Dual/Triple-Certified Climbing & Ski Mountaineering Helmet",
        category="helmet",
        mandatory=True,
        description="Multi-impact helmet certified to EN 12492 (mountaineering rockfall) and EN 1077 (alpine ski crash) standards.",
    ),
]

FRICTION_COEFFICIENTS: dict[str, float] = {
    "packed_powder": 0.28,
    "wind_slab": 0.20,
    "chalk_firm": 0.32,
    "corn_ice_firm": 0.15,
    "crust_unconsolidated": 0.22,
}


def get_couloir_descents(grade: Optional[str] = None) -> list[CouloirDescentModel]:
    couloirs = list(DEFAULT_COULOIR_DESCENTS.values())
    if grade:
        norm_grade = grade.strip().lower()
        couloirs = [c for c in couloirs if norm_grade == c.grade.lower()]
    return couloirs


def get_couloir_descent_by_id(couloir_id: str) -> Optional[CouloirDescentModel]:
    return DEFAULT_COULOIR_DESCENTS.get(couloir_id.strip().lower())


def get_steep_skiing_gear() -> list[SteepSkiingGearRequirement]:
    return list(DEFAULT_STEEP_SKIING_GEAR)


def calculate_couloir_dynamics(request: CouloirCalculationRequest) -> CouloirCalculationResponse:
    couloir = get_couloir_descent_by_id(request.couloir_id)
    if not couloir:
        raise ValueError(f"Couloir '{request.couloir_id}' not found")

    theta = math.radians(request.slope_angle_deg)
    mu = FRICTION_COEFFICIENTS.get(request.snow_surface.strip().lower(), 0.25)

    accel = max(0.5, 9.81 * (math.sin(theta) - mu * math.cos(theta)))
    sluff_velocity_ms = math.sqrt(2 * accel * request.sluff_release_distance_meters)
    sluff_velocity_km_h = round(sluff_velocity_ms * 3.6, 1)

    # Hop-turn edge impact force:
    # Landing velocity from jump: base ~2.2 m/s. deltaT = 0.12s.
    hop_turn_edge_load_n = float(
        round(
            ((request.skier_weight_kg * 2.2) / 0.12) * math.cos(theta)
            + request.skier_weight_kg * 9.81 * math.cos(theta)
        )
    )

    if request.slope_angle_deg >= 53 or (
        request.slope_angle_deg >= 48 and request.snow_surface.strip().lower() == "corn_ice_firm"
    ):
        fall_consequence_index = "catastrophic_unmitigated"
    elif request.slope_angle_deg >= 46 or request.snow_surface.strip().lower() == "wind_slab":
        fall_consequence_index = "severe_injury_risk"
    else:
        fall_consequence_index = "moderate_arrestable"

    if request.slope_angle_deg >= 52:
        recommended_style = "ski_belay_rappel"
    elif couloir.choke_width_meters <= 2.2:
        recommended_style = "side_slipping_choke"
    elif request.slope_angle_deg >= 45 or request.snow_surface.strip().lower() == "chalk_firm":
        recommended_style = "hop_turns"
    else:
        recommended_style = "fluid_turns"

    if sluff_velocity_km_h > 35:
        sluff_management_strategy = "High-velocity sluff hazard: Ski down-and-cut rhythm; make 2-3 turns then pull onto protected rock ribs to let sluff run past."
    else:
        sluff_management_strategy = "Controlled sluff hazard: Maintain deliberate rhythm, manage sluff runouts behind turns, and pause on safe shoulders."

    choke_warning: Optional[str] = None
    if couloir.choke_width_meters <= 2.5:
        choke_warning = "Extreme choke restriction (<2.5m): Narrower than ski turn radius. Use methodical side-slipping with ice axe held in uphill hand."

    return CouloirCalculationResponse(
        couloir_name=couloir.name,
        sluff_velocity_km_h=sluff_velocity_km_h,
        hop_turn_edge_load_n=hop_turn_edge_load_n,
        fall_consequence_index=fall_consequence_index,
        recommended_style=recommended_style,
        sluff_management_strategy=sluff_management_strategy,
        choke_warning=choke_warning,
    )


def detect_steep_skiing_intent(message: str) -> SteepSkiingIntent:
    if not message or not message.strip():
        return SteepSkiingIntent(intent_detected=False, couloir_id=None, action="", confidence=0.0)

    q = message.lower()

    # Disambiguation guards
    # 1. Order tracking & ecommerce
    ecommerce_terms = [
        "order #",
        "return label",
        "refund",
        "shipping tracking",
        "track my order",
        "order status",
        "tracking number",
    ]
    if any(t in q for t in ecommerce_terms):
        return SteepSkiingIntent(intent_detected=False, couloir_id=None, action="", confidence=0.0)

    # Steep skiing specific positive keywords
    steep_specific = [
        "steep skiing",
        "steep ski",
        "couloir",
        "couloirs",
        "extreme skiing",
        "extreme ski",
        "ski mountaineering",
        "hop turn",
        "hop-turn",
        "sluff",
        "harscheisen",
        "ski crampon",
        "rad line",
        "corbet",
        "tuckerman",
        "terminal cancer",
        "mount superior",
        "silver couloir",
        "suicide chute",
        "deadman anchor",
        "t-slot",
        "rock choke",
        "choke width",
    ]

    # 2. Snowmobiling guard (snowmobiling.py)
    snowmobile_terms = [
        "snowmobile",
        "sled deck",
        "skidoo",
        "polaris",
        "throttle",
        "braap",
        "mountain sled",
    ]
    if any(s in q for s in snowmobile_terms) and not any(k in q for k in steep_specific):
        return SteepSkiingIntent(intent_detected=False, couloir_id=None, action="", confidence=0.0)

    # 3. Snowkiting guard (snowkiting.py)
    snowkite_terms = [
        "snowkite",
        "snowkiting",
        "kite foil",
        "depower",
        "chickenloop",
        "pulk",
    ]
    if any(k in q for k in snowkite_terms) and not any(k in q for k in steep_specific):
        return SteepSkiingIntent(intent_detected=False, couloir_id=None, action="", confidence=0.0)

    # 4. Avalanche generic guard (avalanche.py)
    avalanche_terms = [
        "avalanche zone",
        "avalanche danger",
        "avalanche forecast",
        "avy forecast",
        "danger rating",
        "companion rescue",
        "beacon trailhead",
    ]
    if any(a in q for a in avalanche_terms) and not any(k in q for k in steep_specific):
        return SteepSkiingIntent(intent_detected=False, couloir_id=None, action="", confidence=0.0)

    # 5. Ski touring pace guard (ski_touring.py)
    touring_terms = [
        "skin track",
        "skinning pace",
        "uphill travel",
        "vertical feet per hour",
        "transition count",
        "ski touring",
    ]
    if any(t in q for t in touring_terms) and not any(k in q for k in steep_specific):
        return SteepSkiingIntent(intent_detected=False, couloir_id=None, action="", confidence=0.0)

    has_steep_keyword = any(k in q for k in steep_specific)
    if not has_steep_keyword:
        return SteepSkiingIntent(intent_detected=False, couloir_id=None, action="", confidence=0.0)

    # Couloir identification
    couloir_id: Optional[str] = None
    if "corbet" in q or "s&s chute" in q or "jackson hole" in q:
        couloir_id = "corbets-couloir-jackson"
    elif "tuckerman" in q or "center headwall" in q or "the lip" in q or "mount washington" in q:
        couloir_id = "tuckerman-ravine-headwall"
    elif "silver couloir" in q or "buffalo mountain" in q:
        couloir_id = "silver-couloir-buffalo"
    elif "terminal cancer" in q or "ruby mountain" in q or "ruby dome" in q:
        couloir_id = "terminal-cancer-couloir"
    elif "superior" in q or "suicide chute" in q:
        couloir_id = "mount-superior-south-face"

    # Action detection
    calc_terms = [
        "calculate",
        "calculation",
        "sluff velocity",
        "sluff",
        "edge load",
        "edge loading",
        "hop-turn edge",
        "fall consequence",
        "kinematics",
        "dynamics",
    ]
    gear_terms = [
        "gear",
        "checklist",
        "equipment",
        "mandatory",
        "pack list",
        "packing list",
        "what to pack",
        "ice axe",
        "ice axes",
        "axes",
        "crampon",
        "crampons",
        "harscheisen",
        "rad line",
        "rappel cord",
        "airbag",
        "helmet",
        "snow stake",
        "snow picket",
        "fluke",
    ]

    if any(c in q for c in calc_terms):
        action = "calculate_couloir"
    elif any(g in q for g in gear_terms):
        action = "gear_checklist"
    elif couloir_id and any(
        w in q
        for w in [
            "detail",
            "about",
            "describe",
            "tell me about",
            "highlights",
            "slope",
            "pitch",
            "choke",
            "width",
            "vertical drop",
            "grade",
            "how steep",
        ]
    ):
        action = "couloir_detail"
    elif couloir_id and not any(
        w in q for w in ["list", "catalog", "where", "all couloirs", "all descents"]
    ):
        action = "couloir_detail"
    else:
        action = "couloirs_list"

    return SteepSkiingIntent(
        intent_detected=True,
        couloir_id=couloir_id,
        action=action,
        confidence=0.95 if couloir_id else 0.85,
    )


def build_steep_skiing_prompt(
    query_or_intent: Union[str, SteepSkiingIntent],
    intent: Optional[SteepSkiingIntent] = None,
) -> str:
    if isinstance(query_or_intent, SteepSkiingIntent):
        act_intent = query_or_intent
    elif intent is not None:
        act_intent = intent
    else:
        act_intent = detect_steep_skiing_intent(str(query_or_intent))

    lines = [
        "Contoso Alpine Ski Mountaineering & Steep Couloir Assistant Tooling:",
        "- Extreme Couloir Descents (40°-60°): Sustained high-angle couloirs with narrow rocky chokes,",
        "  exposed cliff bands, mandatory cornice drops, and extreme fall consequences.",
        "- Sluff Management Kinematics: High-velocity surface sluff v = sqrt(2 * a * d) requires diagonal",
        "  sluff cuts across the fall line to pull onto safe rock ribs/shoulders before continuing.",
        "- Hop-Turn Edge Loading: Dynamic edge impact loads ((m * 2.2 / 0.12) * cos(theta) + m * g * cos(theta))",
        "  require precision edge bite, centered athletic stance, and rigid boot/binding lateral stiffness.",
        "- Snow Anchor & Rappel Systems: 30m 6mm hyperstatic RAD line, aluminum snow stake T-slot deadman anchors,",
        "  and progress-capture pulleys for navigating rocky un-skiable couloir chokes and bergschrunds.",
        "- Mandatory Mountaineering Gear: Dual ice axes, certified ski crampons (harscheisen), airbag pack,",
        "  and EN 12492 / EN 1077 dual-certified ski-mountaineering helmets.",
    ]

    if act_intent.action == "couloir_detail" and act_intent.couloir_id:
        couloir = get_couloir_descent_by_id(act_intent.couloir_id)
        if couloir:
            lines.extend(
                [
                    f"- Focused Couloir: {couloir.name} ({couloir.mountain}, {couloir.range})",
                    f"  Grade: {couloir.grade} | Max Angle: {couloir.max_slope_angle_deg}° | Avg Angle: {couloir.average_slope_angle_deg}° | Drop: {couloir.vertical_drop_meters}m | Choke: {couloir.choke_width_meters}m | Aspect: {couloir.aspect}",
                    f"  Highlights: {', '.join(couloir.highlights)}",
                    f"  Description: {couloir.description}",
                ]
            )
    elif act_intent.action == "calculate_couloir":
        lines.append(
            "- Action: Calculate sluff velocity (km/h), hop-turn edge load (N), fall consequence index, "
            "recommended descent style, sluff management strategy, and choke constriction warnings."
        )
    elif act_intent.action == "gear_checklist":
        lines.append(
            "- Action: Present the mandatory 6-item Steep Skiing & Alpine Ski Mountaineering Safety Checklist."
        )
    else:
        couloirs = get_couloir_descents()
        lines.append(
            f"- Iconic Couloir Descents: {'; '.join(f'{c.name} ({c.grade}, {c.max_slope_angle_deg}°, {c.vertical_drop_meters}m)' for c in couloirs)}"
        )

    return "\n".join(lines)


def format_steep_skiing_response(
    result_or_intent: Any,
    query: str = "",
) -> FormattedSteepSkiingResponse:
    if isinstance(result_or_intent, CouloirCalculationResponse):
        calc = result_or_intent
        choke_str = f" | Choke Warning: {calc.choke_warning}" if calc.choke_warning else ""
        answer = (
            f"Steep Couloir Dynamics & Kinematics Analysis for {calc.couloir_name}: "
            f"Sluff Velocity: {calc.sluff_velocity_km_h} km/h | Hop-Turn Edge Load: {calc.hop_turn_edge_load_n} N | "
            f"Fall Consequence: {calc.fall_consequence_index.upper()} | "
            f"Recommended Style: {calc.recommended_style.upper()} | "
            f"Sluff Strategy: {calc.sluff_management_strategy}{choke_str}"
        )
        calc_info: dict[str, Any] = {
            "action": "calculate_couloir",
            "calculation": calc.model_dump(),
        }
        return FormattedSteepSkiingResponse(
            answer, {"steep_skiing_info": calc_info, "answer": answer}
        )

    if isinstance(result_or_intent, SteepSkiingIntent):
        intent = result_or_intent
    elif isinstance(result_or_intent, dict):
        intent = SteepSkiingIntent(**result_or_intent)
    else:
        intent = detect_steep_skiing_intent(str(result_or_intent))

    if intent.action == "calculate_couloir":
        target_couloir_id = intent.couloir_id or "corbets-couloir-jackson"
        req = CouloirCalculationRequest(couloir_id=target_couloir_id)
        calc_res = calculate_couloir_dynamics(req)
        choke_str = f" | Choke Warning: {calc_res.choke_warning}" if calc_res.choke_warning else ""
        answer = (
            f"Steep Couloir Dynamics & Kinematics Analysis for {calc_res.couloir_name}: "
            f"Sluff Velocity: {calc_res.sluff_velocity_km_h} km/h | Hop-Turn Edge Load: {calc_res.hop_turn_edge_load_n} N | "
            f"Fall Consequence: {calc_res.fall_consequence_index.upper()} | "
            f"Recommended Style: {calc_res.recommended_style.upper()} | "
            f"Sluff Strategy: {calc_res.sluff_management_strategy}{choke_str}"
        )
        calc_dict: dict[str, Any] = {
            "action": "calculate_couloir",
            "calculation": calc_res.model_dump(),
        }
        return FormattedSteepSkiingResponse(
            answer, {"steep_skiing_info": calc_dict, "answer": answer}
        )

    elif intent.action == "gear_checklist":
        gear = get_steep_skiing_gear()
        answer = (
            f"Mandatory Steep Skiing & Ski Mountaineering Gear Checklist ({len(gear)} items): "
            + "; ".join(f"{g.name} ({g.description})" for g in gear)
            + ". Mandatory alpine safety equipment required before dropping into 45°+ couloirs."
        )
        gear_dict: dict[str, Any] = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
            "mandatory_count": sum(1 for g in gear if g.mandatory),
        }
        return FormattedSteepSkiingResponse(
            answer, {"steep_skiing_info": gear_dict, "answer": answer}
        )

    elif intent.action == "couloir_detail" and intent.couloir_id:
        couloir = get_couloir_descent_by_id(intent.couloir_id)
        if couloir:
            answer = (
                f"Steep Couloir Beta — {couloir.name} ({couloir.mountain}, {couloir.range}): "
                f"Grade: {couloir.grade} | Max Slope: {couloir.max_slope_angle_deg}° | "
                f"Average Slope: {couloir.average_slope_angle_deg}° | Vertical Drop: {couloir.vertical_drop_meters}m | "
                f"Choke Width: {couloir.choke_width_meters}m | Aspect: {couloir.aspect}. "
                f"Highlights: {', '.join(couloir.highlights)}. {couloir.description}"
            )
            detail_dict: dict[str, Any] = {
                "action": "couloir_detail",
                "couloir": couloir.model_dump(),
            }
            return FormattedSteepSkiingResponse(
                answer, {"steep_skiing_info": detail_dict, "answer": answer}
            )

    # Default: couloirs_list
    couloirs = get_couloir_descents()
    summary = "; ".join(
        f"{c.name} ({c.grade}, {c.max_slope_angle_deg}°, {c.vertical_drop_meters}m drop, {c.choke_width_meters}m choke)"
        for c in couloirs
    )
    answer = (
        f"Contoso Extreme Steep Couloir Descents ({len(couloirs)} iconic lines): {summary}. "
        "Ask about specific couloir logistics, sluff velocity & hop-turn edge load calculations, or mandatory ski mountaineering gear."
    )
    list_dict: dict[str, Any] = {
        "action": "couloirs_list",
        "couloirs": [c.model_dump() for c in couloirs],
    }
    return FormattedSteepSkiingResponse(answer, {"steep_skiing_info": list_dict, "answer": answer})
