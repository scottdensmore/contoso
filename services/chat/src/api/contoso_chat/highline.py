import math
from typing import Any, Optional

from pydantic import BaseModel


class HighlineSpanModel(BaseModel):
    span_id: str
    title: str
    region: str
    span_length_m: float
    void_exposure_m: float
    difficulty: str
    primary_webbing: str
    backup_webbing: str
    nominal_tension_kn: float
    anchor_system: str
    wind_exposure: str
    description: str
    highlights: list[str]


class RiggingCalculationRequest(BaseModel):
    span_id: str
    walker_weight_kg: float = 75.0
    standing_sag_percent: float = 6.0
    dynamic_load_factor: float = 1.8
    anchor_angle_degrees: float = 45.0


class RiggingCalculationResponse(BaseModel):
    span_id: str
    span_title: str
    center_sag_m: float
    line_tension_kn: float
    anchor_leg_load_kn: float
    webbing_safety_factor: float
    min_void_clearance_m: float
    rigging_advisory: str
    safety_status: str


class HighlineGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class HighlineIntent(BaseModel):
    action: str  # "spans_list", "span_detail", "calculate_rigging", "gear_checklist"
    span_id: Optional[str] = None
    difficulty: Optional[str] = None
    webbing_type: Optional[str] = None


DEFAULT_HIGHLINE_SPANS: dict[str, HighlineSpanModel] = {
    "yosemite-taft-point-highline": HighlineSpanModel(
        span_id="yosemite-taft-point-highline",
        title="Taft Point Highline",
        region="Yosemite National Park, CA",
        span_length_m=65.0,
        void_exposure_m=850.0,
        difficulty="expert",
        primary_webbing="Type 18 Polyester",
        backup_webbing="Dyneema QuickBraid",
        nominal_tension_kn=3.5,
        anchor_system="Bolted equalization masterpoint with redundant sling wrap",
        wind_exposure="severe",
        description="Iconic granite void span suspended high above Yosemite Valley with sweeping exposure over the sheer abyss.",
        highlights=[
            "850m vertical drop to Yosemite Valley floor",
            "Severe thermal updrafts and gusting crosswinds",
            "Historic classic alpine highline proving ground",
        ],
    ),
    "moab-fruit-bowl-canyon": HighlineSpanModel(
        span_id="moab-fruit-bowl-canyon",
        title="Fruit Bowl Canyon Highline",
        region="Moab, UT",
        span_length_m=110.0,
        void_exposure_m=140.0,
        difficulty="advanced",
        primary_webbing="Mantra Tubular Nylon",
        backup_webbing="Aero 2 Low-Stretch",
        nominal_tension_kn=4.2,
        anchor_system="Equalized sandstone multi-bolt directional anchor",
        wind_exposure="moderate",
        description="World-renowned desert canyon natural amphitheater highline overlooking towering sandstone monoliths.",
        highlights=[
            "Massive natural amphitheater red rock void",
            "Desert thermals and cyclic wind harmonics",
            "Long-distance nylon stretch walkability",
        ],
    ),
    "smith-rock-monkey-face-highline": HighlineSpanModel(
        span_id="smith-rock-monkey-face-highline",
        title="Monkey Face Highline",
        region="Smith Rock, OR",
        span_length_m=45.0,
        void_exposure_m=110.0,
        difficulty="intermediate",
        primary_webbing="Greenline Braided Polyester",
        backup_webbing="Dyneema Backup Line",
        nominal_tension_kn=3.0,
        anchor_system="Glued steel eye-bolts with sliding X equalization",
        wind_exposure="moderate",
        description="Sensational gap highline linking the Monkey Face pillar to the main caldera cliff face in Central Oregon.",
        highlights=[
            "Sensational volcanic tuff pillar gap exposure",
            "Direct sheer drop into the Crooked River gorge",
            "Engineered glued stainless steel anchor array",
        ],
    ),
    "castle-valley-rectory-span": HighlineSpanModel(
        span_id="castle-valley-rectory-span",
        title="The Rectory Spire Span",
        region="Castle Valley, UT",
        span_length_m=85.0,
        void_exposure_m=300.0,
        difficulty="expert",
        primary_webbing="Spider Silk Hybrid Webbing",
        backup_webbing="Aero Tubular Polyamide",
        nominal_tension_kn=3.8,
        anchor_system="Dual high-strength equalized spire anchors with edge pro",
        wind_exposure="high",
        description="Dramatic desert tower highline spanning between sandstone spires with massive desert valley void beneath.",
        highlights=[
            "Isolated desert summit spire anchors",
            "Extreme abrasive sandstone rim edge transitions",
            "Committing 300m vertical drop over Castle Valley floor",
        ],
    ),
    "index-town-walls-practice-highline": HighlineSpanModel(
        span_id="index-town-walls-practice-highline",
        title="Index Town Walls Practice Highline",
        region="Index, WA",
        span_length_m=35.0,
        void_exposure_m=60.0,
        difficulty="beginner",
        primary_webbing="Feather Low-Stretch Polyester",
        backup_webbing="Static Core Redundant Braid",
        nominal_tension_kn=2.5,
        anchor_system="Redundant granite horn slings with dual backup bolts",
        wind_exposure="low",
        description="Accessible Pacific Northwest granite practice highline perfect for rigging skill development and introductory exposure.",
        highlights=[
            "Sheltered granite quarry ledge access",
            "Low wind corridor ideal for skill progression",
            "Comprehensive multi-bolt redundant training anchor",
        ],
    ),
}

DEFAULT_HIGHLINE_GEAR: list[HighlineGearRequirement] = [
    HighlineGearRequirement(
        item_id="highline-leash-dual-rings",
        name="Dynamic Highline Leash with Dual Forged Aluminum Rings",
        category="personal_safety",
        mandatory=True,
        purpose="Redundant fall-arrest tether linking walker harness to primary and backup webbings with forged rings to prevent rope burn.",
    ),
    HighlineGearRequirement(
        item_id="independent-backup-webbing",
        name="Independent Redundant Backup Webbing & Taped Matrix",
        category="rigging_line",
        mandatory=True,
        purpose="Zero-load redundant safety webbing rigged beneath primary webbing with periodic tape matrix to prevent flail during release.",
    ),
    HighlineGearRequirement(
        item_id="weblock-anchor-devices",
        name="High-Efficiency Stainless Weblock Anchor Devices with Center Pin",
        category="anchor_hardware",
        mandatory=True,
        purpose="Maintains up to 95% webbing break strength without destructive knot weakening at the masterpoint anchor.",
    ),
    HighlineGearRequirement(
        item_id="buckingham-pulley-system",
        name="Buckingham 5:1 Modular Tensioning Pulley System",
        category="tensioning",
        mandatory=True,
        purpose="Allows precise mechanical advantage tensioning and line de-tensioning with integrated line-grip hardware.",
    ),
    HighlineGearRequirement(
        item_id="heavy-duty-edge-pads",
        name="Heavy-Duty Kevlar Reinforced Highline Edge Protectors",
        category="line_protection",
        mandatory=True,
        purpose="Shields tensioned webbings and backup lines from abrasive sharp rock corners and cliff lip friction.",
    ),
    HighlineGearRequirement(
        item_id="wind-dampener-wind-sock",
        name="Aerodynamic Wind Oscillation Dampener & Wind Sock",
        category="oscillation_control",
        mandatory=True,
        purpose="Disrupts vortex shedding and mitigates destructive standing-wave harmonics across long-distance alpine gaps.",
    ),
]


def get_highline_spans(difficulty: Optional[str] = None) -> list[HighlineSpanModel]:
    spans = list(DEFAULT_HIGHLINE_SPANS.values())
    if difficulty:
        diff_lower = difficulty.strip().lower()
        return [s for s in spans if s.difficulty.lower() == diff_lower]
    return spans


def get_highline_span_by_id(span_id: str) -> Optional[HighlineSpanModel]:
    return DEFAULT_HIGHLINE_SPANS.get(span_id.strip().lower())


def get_highline_gear() -> list[HighlineGearRequirement]:
    return list(DEFAULT_HIGHLINE_GEAR)


def calculate_rigging_physics(request: RiggingCalculationRequest) -> RiggingCalculationResponse:
    span = get_highline_span_by_id(request.span_id)
    if not span:
        raise ValueError(f"Highline span '{request.span_id}' not found")

    span_len = span.span_length_m
    center_sag_m = round(span_len * (request.standing_sag_percent / 100.0), 2)

    half_span = span_len / 2.0
    # Sag angle theta in radians
    theta_rad = math.atan(center_sag_m / half_span)

    # Dynamic vertical force (kN): m * g * dynamic_factor / 1000
    f_dynamic_kn = (request.walker_weight_kg * 9.81 * request.dynamic_load_factor) / 1000.0

    # Line tension: 2 * T * sin(theta) = F_dyn => T = F_dyn / (2 * sin(theta))
    sin_theta = math.sin(theta_rad)
    if sin_theta <= 0.001:
        line_tension_kn = 50.0
    else:
        line_tension_kn = round(f_dynamic_kn / (2.0 * sin_theta), 2)

    # Anchor equalization vector load:
    # 2 * F_leg * cos(alpha / 2) = T => F_leg = T / (2 * cos(alpha / 2))
    clamped_angle = max(min(request.anchor_angle_degrees, 178.0), 0.0)
    half_angle_rad = math.radians(clamped_angle / 2.0)
    cos_half_angle = math.cos(half_angle_rad)
    if cos_half_angle <= 0.01:
        anchor_leg_load_kn = round(line_tension_kn * 5.0, 2)
    else:
        anchor_leg_load_kn = round(line_tension_kn / (2.0 * cos_half_angle), 2)

    # Webbing safety factor based on standard 30 kN MBS
    mbs_kn = 30.0
    webbing_safety_factor = round(mbs_kn / max(line_tension_kn, 0.1), 2)

    # Minimum void clearance beneath center sag
    min_void_clearance_m = round(span.void_exposure_m - center_sag_m, 2)

    # Safety status determination
    if (
        webbing_safety_factor < 3.0
        or request.anchor_angle_degrees >= 120.0
        or min_void_clearance_m < 15.0
    ):
        safety_status = "critical_hazard"
    elif (
        webbing_safety_factor < 5.0
        or request.anchor_angle_degrees > 60.0
        or min_void_clearance_m < 30.0
    ):
        safety_status = "caution"
    else:
        safety_status = "safe"

    # Advisory formulation
    advisory_parts = [
        f"Center sag is {center_sag_m}m ({request.standing_sag_percent}%) on {span.title} ({span_len}m) with estimated line tension of {line_tension_kn} kN.",
        f"Webbing safety factor is {webbing_safety_factor}:1 (minimum 5:1 recommended for dynamic leash fall security on 30 kN MBS webbing).",
    ]
    if request.anchor_angle_degrees >= 120.0:
        advisory_parts.append(
            f"CRITICAL: Equalization anchor angle of {request.anchor_angle_degrees}° induces {anchor_leg_load_kn} kN leg load, exceeding single-point line tension! Re-rig anchor to under 60° immediately."
        )
    elif request.anchor_angle_degrees > 60.0:
        advisory_parts.append(
            f"WARNING: Anchor angle of {request.anchor_angle_degrees}° creates amplified vector forces ({anchor_leg_load_kn} kN per leg). Keep equalization angles below 60°."
        )
    else:
        advisory_parts.append(
            f"Anchor equalization angle of {request.anchor_angle_degrees}° maintains efficient leg load distribution at {anchor_leg_load_kn} kN."
        )

    if span.wind_exposure in ("severe", "high"):
        advisory_parts.append(
            f"Span features {span.wind_exposure.upper()} wind exposure: deploy aerodynamic wind socks/dampeners every 20m to disrupt resonant vortex shedding."
        )

    advisory_parts.append(
        "Redundancy compliance: Ensure independent backup line with periodic taped matrix, weblock center-pin wrap, and dual forged aluminum leash rings."
    )

    rigging_advisory = " ".join(advisory_parts)

    return RiggingCalculationResponse(
        span_id=span.span_id,
        span_title=span.title,
        center_sag_m=center_sag_m,
        line_tension_kn=line_tension_kn,
        anchor_leg_load_kn=anchor_leg_load_kn,
        webbing_safety_factor=webbing_safety_factor,
        min_void_clearance_m=min_void_clearance_m,
        rigging_advisory=rigging_advisory,
        safety_status=safety_status,
    )


def extract_highline_intent(message: str) -> Optional[HighlineIntent]:
    q = message.lower()

    # Domain keywords - at least one must be present unless specific span is identified
    highline_keywords = [
        "highline",
        "highlines",
        "slackline",
        "slacklining",
        "line tension",
        "webbing sag",
        "buckingham pulley",
        "buckingham",
        "weblock",
        "weblocks",
        "leash fall",
        "leash rings",
        "fruit bowl highline",
        "taft point highline",
        "anchor equalization",
        "wind dampener",
        "wind oscillation",
        "standing sag",
        "vector angle",
    ]

    has_keyword = any(k in q for k in highline_keywords)

    # Exclusions for unrelated domains (rock climbing, ice climbing, via ferrata, canyoneering, customer support)
    exclusions = [
        "order #",
        "return label",
        "refund",
        "climbing shoes",
        "climbing shoe",
        "chalk bag",
        "sport climbing",
        "trad climbing",
        "ice screws",
        "ice screw",
        "crampons",
        "crampon",
        "wi4",
        "wi5",
        "via ferrata",
        "klettersteig",
        "canyoneering",
        "slot canyon",
        "pothole escape",
        "fiddlestick",
    ]
    if any(e in q for e in exclusions) and not has_keyword:
        return None
    if any(e in q for e in exclusions) and not any(
        k in q for k in ["highline", "slackline", "weblock", "buckingham"]
    ):
        return None

    # Check for specific span identifiers
    span_id: Optional[str] = None
    if "taft point" in q or "taft" in q:
        span_id = "yosemite-taft-point-highline"
    elif "fruit bowl" in q:
        span_id = "moab-fruit-bowl-canyon"
    elif "monkey face" in q:
        span_id = "smith-rock-monkey-face-highline"
    elif "rectory" in q or "castle valley" in q:
        span_id = "castle-valley-rectory-span"
    elif "index town" in q or "index walls" in q or "practice highline" in q:
        span_id = "index-town-walls-practice-highline"

    if not has_keyword and not span_id:
        return None

    # Extract difficulty
    difficulty: Optional[str] = None
    if "beginner" in q:
        difficulty = "beginner"
    elif "intermediate" in q:
        difficulty = "intermediate"
    elif "advanced" in q:
        difficulty = "advanced"
    elif "expert" in q:
        difficulty = "expert"

    # Action determination
    if any(
        k in q
        for k in [
            "calculate",
            "tension",
            "standing sag",
            "webbing sag",
            "vector angle",
            "physics",
            "equalization",
            "load",
            "sag and tension",
        ]
    ):
        action = "calculate_rigging"
    elif (
        any(k in q for k in ["gear", "checklist", "kit", "compliance", "equipment", "hardware"])
        and not span_id
    ):
        action = "gear_checklist"
    elif span_id and any(
        k in q for k in ["detail", "about", "explore", "tell me about", "highlights", "span"]
    ):
        action = "span_detail"
    elif span_id:
        action = "span_detail"
    elif any(k in q for k in ["gear", "checklist", "kit", "compliance", "equipment", "hardware"]):
        action = "gear_checklist"
    else:
        action = "spans_list"

    return HighlineIntent(
        action=action,
        span_id=span_id,
        difficulty=difficulty,
    )


# Alias for compatibility
detect_highline_intent = extract_highline_intent


class FormattedHighlineResponse(str):
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


def format_highline_response(intent: HighlineIntent) -> FormattedHighlineResponse:
    if intent.action == "calculate_rigging":
        span_id = intent.span_id or "yosemite-taft-point-highline"
        req = RiggingCalculationRequest(span_id=span_id)
        calc = calculate_rigging_physics(req)
        answer = (
            f"Highline Rigging Calculation for {calc.span_title}: "
            f"Center sag is {calc.center_sag_m}m with estimated line tension of {calc.line_tension_kn} kN. "
            f"Anchor leg load: {calc.anchor_leg_load_kn} kN. Webbing safety factor: {calc.webbing_safety_factor}:1. "
            f"Min void clearance: {calc.min_void_clearance_m}m. Safety status: {calc.safety_status}. "
            f"Advisory: {calc.rigging_advisory}"
        )
        info = {
            "action": "calculate_rigging",
            "span_id": calc.span_id,
            "span_title": calc.span_title,
            "center_sag_m": calc.center_sag_m,
            "line_tension_kn": calc.line_tension_kn,
            "anchor_leg_load_kn": calc.anchor_leg_load_kn,
            "webbing_safety_factor": calc.webbing_safety_factor,
            "min_void_clearance_m": calc.min_void_clearance_m,
            "safety_status": calc.safety_status,
            "rigging_advisory": calc.rigging_advisory,
            "calculation": calc.model_dump(),
        }
        return FormattedHighlineResponse(answer, {"answer": answer, "highline_info": info})

    if intent.action == "span_detail" and intent.span_id:
        span = get_highline_span_by_id(intent.span_id)
        if span:
            answer = (
                f"Alpine Highline Span: {span.title} ({span.region}). "
                f"Length: {span.span_length_m}m | Void Exposure: {span.void_exposure_m}m | Difficulty: {span.difficulty}. "
                f"Primary Webbing: {span.primary_webbing} | Backup: {span.backup_webbing} | Nominal Tension: {span.nominal_tension_kn} kN. "
                f"Anchor: {span.anchor_system} | Wind: {span.wind_exposure}. {span.description} "
                f"Highlights: {'; '.join(span.highlights)}."
            )
            info = {
                "action": "span_detail",
                "span_id": span.span_id,
                "span": span.model_dump(),
            }
            return FormattedHighlineResponse(answer, {"answer": answer, "highline_info": info})

    if intent.action == "gear_checklist":
        gear = get_highline_gear()
        items_summary = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Mandatory Alpine Highline Rigging Kit Checklist: "
            f"All {len(gear)} items are mandatory for redundant fall protection. "
            f"{items_summary}."
        )
        info = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
        }
        return FormattedHighlineResponse(answer, {"answer": answer, "highline_info": info})

    # Default to spans_list
    spans = get_highline_spans(difficulty=intent.difficulty)
    span_summaries = "; ".join(
        f"{s.title} ({s.span_length_m}m length, {s.void_exposure_m}m void, {s.difficulty})"
        for s in spans
    )
    diff_clause = f" [{intent.difficulty.capitalize()}]" if intent.difficulty else ""
    answer = (
        f"Available Alpine Highline & Slackline Spans{diff_clause}: "
        f"{len(spans)} spans available. {span_summaries}."
    )
    info = {
        "action": "spans_list",
        "spans": [s.model_dump() for s in spans],
    }
    return FormattedHighlineResponse(answer, {"answer": answer, "highline_info": info})


def build_highline_prompt(intent: HighlineIntent) -> str:
    if intent.action == "calculate_rigging":
        span_id = intent.span_id or "yosemite-taft-point-highline"
        req = RiggingCalculationRequest(span_id=span_id)
        calc = calculate_rigging_physics(req)
        return (
            "### Alpine Highline Rigging Physics & Tension Analysis\n"
            f"- Span: {calc.span_title} ({calc.span_id})\n"
            f"- Center Sag: {calc.center_sag_m} m\n"
            f"- Line Tension: {calc.line_tension_kn} kN\n"
            f"- Anchor Leg Load: {calc.anchor_leg_load_kn} kN\n"
            f"- Webbing Safety Factor: {calc.webbing_safety_factor}:1\n"
            f"- Minimum Void Clearance: {calc.min_void_clearance_m} m\n"
            f"- Safety Status: {calc.safety_status.upper()}\n"
            f"- Rigging Advisory: {calc.rigging_advisory}\n"
            "Ensure the customer adheres to mandatory backup redundancy, weblock friction protection, and vector angles <= 60°."
        )

    if intent.action == "span_detail" and intent.span_id:
        span = get_highline_span_by_id(intent.span_id)
        if span:
            return (
                f"### Highline Span Profile: {span.title}\n"
                f"- Region: {span.region}\n"
                f"- Length: {span.span_length_m} m | Void Exposure: {span.void_exposure_m} m\n"
                f"- Difficulty: {span.difficulty.upper()}\n"
                f"- Primary Webbing: {span.primary_webbing}\n"
                f"- Backup Webbing: {span.backup_webbing}\n"
                f"- Nominal Tension: {span.nominal_tension_kn} kN\n"
                f"- Anchor System: {span.anchor_system}\n"
                f"- Wind Exposure: {span.wind_exposure}\n"
                f"- Description: {span.description}\n"
                f"- Highlights: {', '.join(span.highlights)}"
            )

    if intent.action == "gear_checklist":
        gear = get_highline_gear()
        gear_lines = "\n".join(f"- {g.name} [{g.category.upper()}]: {g.purpose}" for g in gear)
        return (
            "### Mandatory Alpine Highline Rigging Kit Compliance\n"
            f"{gear_lines}\n\n"
            "Emphasize redundant independent backup webbing, dual forged aluminum leash rings, and aerodynamic wind dampeners."
        )

    # Default to spans_list
    spans = get_highline_spans(difficulty=intent.difficulty)
    spans_lines = "\n".join(
        f"- {s.title} ({s.span_id}): {s.span_length_m}m length, {s.void_exposure_m}m void, {s.difficulty} difficulty, {s.region}"
        for s in spans
    )
    return (
        "### Available Alpine Highline Spans\n"
        f"{spans_lines}\n\n"
        "Provide helpful advice on line tensioning, leash fall safety, and anchor equalization."
    )
