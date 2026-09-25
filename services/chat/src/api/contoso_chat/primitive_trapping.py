from typing import Any, Optional

from pydantic import BaseModel


class TrappingMechanismModel(BaseModel):
    mechanism_id: str
    title: str
    category: str
    cordage_required: bool
    sensitivity_rating: str
    quarry_suitability: str
    description: str
    highlights: list[str]


class TrappingCalculationRequest(BaseModel):
    mechanism_id: str = "figure-4-deadfall"
    quarry: str = "snowshoe_hare"
    deadfall_weight_lbs: float = 15.0
    notch_depth_mm: float = 4.0
    cordage_type: str = "tarred_bankline"


class TrappingCalculationResponse(BaseModel):
    mechanism_id: str
    mechanism_title: str
    quarry: str
    quarry_name: str
    quarry_weight_lbs: float
    deadfall_weight_lbs: float
    weight_ratio: float
    lethality_status: str
    sensitivity_status: str
    estimated_trip_force_oz: float
    legal_ethics_advisory: str


class TrappingSafetyItemModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class TrappingIntent(BaseModel):
    action: str  # "mechanisms_list", "mechanism_detail", "calculate_trapping", "gear_checklist"
    mechanism_id: Optional[str] = None
    category: Optional[str] = None


class FormattedTrappingResponse(str):
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


QUARRY_STANDARDS: dict[str, dict[str, Any]] = {
    "snowshoe_hare": {"name": "Snowshoe Hare", "weight_lbs": 3.5},
    "ground_squirrel": {"name": "Ground Squirrel", "weight_lbs": 1.2},
    "grouse_ptarmigan": {"name": "Grouse / Ptarmigan", "weight_lbs": 1.8},
    "cottontail": {"name": "Cottontail Rabbit", "weight_lbs": 2.5},
}

TRIP_FORCE_MULTIPLIERS: dict[str, float] = {
    "figure-4-deadfall": 0.8,
    "figure-4": 0.8,
    "paiute-deadfall": 0.3,
    "paiute": 0.3,
    "promontory-peg-snare": 0.6,
    "promontory": 0.6,
    "promontory-peg": 0.6,
    "spring-pole-snare": 0.4,
    "spring-pole": 0.4,
    "rolling-log-deadfall": 1.5,
    "rolling-log": 1.5,
}

DEFAULT_MECHANISMS: dict[str, TrappingMechanismModel] = {
    "figure-4-deadfall": TrappingMechanismModel(
        mechanism_id="figure-4-deadfall",
        title="Classic All-Wood Figure-4 Deadfall",
        category="deadfall",
        cordage_required=False,
        sensitivity_rating="moderate",
        quarry_suitability="Cottontail, ground squirrel, small mammals",
        description="Ancient and reliable self-supporting deadfall trigger crafted from three notched interlocking wooden sticks requiring zero cordage.",
        highlights=[
            "Interlocking three-stick geometry",
            "Zero cordage reliance using split wood",
            "Adjustable bait stick horizontal reach",
        ],
    ),
    "paiute-deadfall": TrappingMechanismModel(
        mechanism_id="paiute-deadfall",
        title="Paiute Deadfall with Cordage & Hair-Trigger Toggle",
        category="deadfall",
        cordage_required=True,
        sensitivity_rating="hair_trigger",
        quarry_suitability="Mice, voles, ground squirrels, rats",
        description="High-sensitivity indigenous Great Basin deadfall utilizing cordage, a lever post, and an ultra-sensitive bait toggle stick.",
        highlights=[
            "Cordage-wrapped upright pivot",
            "Hair-trigger toggle stick sensitivity",
            "Ultra-fast drop release under light nibbles",
        ],
    ),
    "promontory-peg-snare": TrappingMechanismModel(
        mechanism_id="promontory-peg-snare",
        title="Promontory Peg Interlocking Cordage Snare",
        category="snare",
        cordage_required=True,
        sensitivity_rating="moderate",
        quarry_suitability="Snowshoe hare, cottontail rabbits",
        description="Prehistoric interlocking wooden peg snare mechanism recovered from Promontory Caves, designed to trigger along narrow game runs.",
        highlights=[
            "Ancient Great Basin notched peg design",
            "Bent willow or birch tension sapling",
            "Runs on game trail runways without bait",
        ],
    ),
    "spring-pole-snare": TrappingMechanismModel(
        mechanism_id="spring-pole-snare",
        title="Tensioned Sapling Spring-Pole Toggle Snare",
        category="snare",
        cordage_required=True,
        sensitivity_rating="hair_trigger",
        quarry_suitability="Snowshoe hare, grouse, game birds",
        description="Dynamic bent engine sapling snare utilizing a toggle pin trigger that instantly lifts quarry into the air upon displacement.",
        highlights=[
            "Lifts quarry clear of ground scavengers",
            "Trigger toggle slips instantly on loop pull",
            "Ideal in winter boreal snowpack trails",
        ],
    ),
    "rolling-log-deadfall": TrappingMechanismModel(
        mechanism_id="rolling-log-deadfall",
        title="Heavy Timber Rolling Log & Lever Deadfall",
        category="deadfall",
        cordage_required=False,
        sensitivity_rating="firm",
        quarry_suitability="Larger foraging pests and camp nuisance scavengers",
        description="Heavy log crush deadfall using guide stakes and a pivoting trip lever to drop timber deadweights cleanly onto target quarry.",
        highlights=[
            "Dual guide logs prevent lateral roll",
            "High-inertia timber deadweight crushing force",
            "Simple prop-stick trip trigger",
        ],
    ),
}

DEFAULT_SAFETY_GEAR: list[TrappingSafetyItemModel] = [
    TrappingSafetyItemModel(
        item_id="carving-bushcraft-knife",
        name="High-Carbon Fixed Blade Woodcarving Knife with Scandi Grind for Trigger Notching",
        category="carving",
        mandatory=True,
        purpose="Precision whittling of delicate trigger notches and toggles",
    ),
    TrappingSafetyItemModel(
        item_id="tarred-bank-line",
        name="#36 Tarred Braided Bank Line (320 lb Tensile Strength) for Toggle Rigging",
        category="cordage",
        mandatory=True,
        purpose="Weather-resistant, non-stretch trigger toggle and snare cords",
    ),
    TrappingSafetyItemModel(
        item_id="inert-training-peg-set",
        name="Hardwood Split Inert Practice Pegs and Figure-4 Demonstration Set",
        category="training",
        mandatory=True,
        purpose="Safe classroom demonstration without live drop weights",
    ),
    TrappingSafetyItemModel(
        item_id="safety-flagging-tape",
        name="High-Visibility Fluorescent Orange Trail Flagging Ribbon for Trap Marking",
        category="safety",
        mandatory=True,
        purpose="Marks practice trigger locations to prevent accidental tripping",
    ),
    TrappingSafetyItemModel(
        item_id="spring-wire-snare-gauge",
        name="Aircraft Galvanized Small-Game Snare Wire with Safety Stop",
        category="rigging",
        mandatory=True,
        purpose="Prevents loop over-tightening during practice drills",
    ),
    TrappingSafetyItemModel(
        item_id="survival-regulations-guide",
        name="Wilderness Survival Trapping Ethics & Game Code Emergency Legal Field Manual",
        category="reference",
        mandatory=True,
        purpose="Covers emergency life-or-death legality and state wildlife restrictions",
    ),
]


def get_trapping_mechanisms(category: Optional[str] = None) -> list[TrappingMechanismModel]:
    mechanisms = list(DEFAULT_MECHANISMS.values())
    if category:
        cat_clean = category.strip().lower()
        mechanisms = [m for m in mechanisms if m.category.lower() == cat_clean]
    return mechanisms


def get_trapping_mechanism(mechanism_id: str) -> Optional[TrappingMechanismModel]:
    return DEFAULT_MECHANISMS.get(mechanism_id.strip().lower())


def get_trapping_safety_gear() -> list[TrappingSafetyItemModel]:
    return list(DEFAULT_SAFETY_GEAR)


def calculate_primitive_trapping(
    request: TrappingCalculationRequest,
) -> TrappingCalculationResponse:
    mech = get_trapping_mechanism(request.mechanism_id)
    mech_title = mech.title if mech else request.mechanism_id.replace("-", " ").title()

    quarry_key = request.quarry.strip().lower().replace("-", "_").replace(" ", "_")
    if quarry_key in QUARRY_STANDARDS:
        q_info = QUARRY_STANDARDS[quarry_key]
        quarry_name = q_info["name"]
        quarry_weight_lbs = q_info["weight_lbs"]
    elif "hare" in quarry_key or ("rabbit" in quarry_key and "cottontail" not in quarry_key):
        quarry_key, quarry_name, quarry_weight_lbs = "snowshoe_hare", "Snowshoe Hare", 3.5
    elif "squirrel" in quarry_key:
        quarry_key, quarry_name, quarry_weight_lbs = "ground_squirrel", "Ground Squirrel", 1.2
    elif "grouse" in quarry_key or "ptarmigan" in quarry_key or "bird" in quarry_key:
        quarry_key, quarry_name, quarry_weight_lbs = "grouse_ptarmigan", "Grouse / Ptarmigan", 1.8
    elif "cottontail" in quarry_key:
        quarry_key, quarry_name, quarry_weight_lbs = "cottontail", "Cottontail Rabbit", 2.5
    else:
        quarry_key, quarry_name, quarry_weight_lbs = "snowshoe_hare", "Snowshoe Hare", 3.5

    weight_ratio = round(request.deadfall_weight_lbs / quarry_weight_lbs, 2)
    if weight_ratio >= 5.0:
        lethality_status = "humane_instant_dispatch"
    elif weight_ratio >= 3.0:
        lethality_status = "sufficient"
    else:
        lethality_status = "underweight_cruelty_risk"

    if request.notch_depth_mm < 3.0:
        sensitivity_status = "hair_trigger_premature_release"
    elif request.notch_depth_mm <= 6.0:
        sensitivity_status = "optimal_sensitivity"
    else:
        sensitivity_status = "overly_stiff_miss_risk"

    multiplier = TRIP_FORCE_MULTIPLIERS.get(request.mechanism_id.strip().lower(), 0.8)
    for k, v in TRIP_FORCE_MULTIPLIERS.items():
        if k in request.mechanism_id.strip().lower():
            multiplier = v
            break
    estimated_trip_force_oz = round(request.notch_depth_mm * multiplier, 2)

    advisories = [
        f"Lethality ratio is {weight_ratio:.2f}:1 ({lethality_status}) with estimated trip force of {estimated_trip_force_oz:.2f} oz ({sensitivity_status}).",
    ]
    if lethality_status == "underweight_cruelty_risk":
        advisories.append(
            f"WARNING: Deadfall weight ({request.deadfall_weight_lbs:.1f} lbs) is below 3x quarry weight ({quarry_weight_lbs:.1f} lbs). High risk of non-lethal crushing injury."
        )
    elif lethality_status == "humane_instant_dispatch":
        advisories.append(
            f"Deadfall weight exceeds 5x quarry weight ({quarry_weight_lbs:.1f} lbs), providing adequate kinetic mass for clean, instantaneous dispatch."
        )

    if sensitivity_status == "hair_trigger_premature_release":
        advisories.append(
            "Trigger notch is shallower than 3mm: vulnerable to wind gusts or slight vibration triggering premature drops."
        )
    elif sensitivity_status == "overly_stiff_miss_risk":
        advisories.append(
            "Trigger notch exceeds 6mm: target quarry may take bait without tripping mechanism due to excessive friction."
        )

    advisories.append(
        "ETHICAL & LEGAL NOTICE: Primitive trapping and deadfalls are strictly regulated under state wildlife game codes and are generally prohibited except in genuine life-or-death wilderness survival emergencies. Always use inert demonstration weights when training."
    )

    return TrappingCalculationResponse(
        mechanism_id=request.mechanism_id,
        mechanism_title=mech_title,
        quarry=quarry_key,
        quarry_name=quarry_name,
        quarry_weight_lbs=quarry_weight_lbs,
        deadfall_weight_lbs=request.deadfall_weight_lbs,
        weight_ratio=weight_ratio,
        lethality_status=lethality_status,
        sensitivity_status=sensitivity_status,
        estimated_trip_force_oz=estimated_trip_force_oz,
        legal_ethics_advisory=" ".join(advisories),
    )


def detect_primitive_trapping_intent(message: str) -> Optional[TrappingIntent]:
    q = message.lower().strip()

    order_words = ["refund", "order #", "return label", "order tracking", "promo code", "shipping"]
    if any(ow in q for ow in order_words):
        return None

    trapping_core = [
        "primitive trapping", "deadfall", "figure-4", "figure 4", "paiute",
        "promontory peg", "promontory-peg", "spring-pole", "spring pole",
        "snare trigger", "deadfall weight", "weight ratio", "trigger sensitivity",
        "notch depth", "survival trapping", "trip force", "rolling log deadfall",
        "rolling-log deadfall", "primitive snare", "primitive trap",
        "trapping mechanisms", "snare mechanisms", "trapping safety",
    ]
    has_trapping = any(tk in q for tk in trapping_core)

    bushcraft_exclusive = [
        "friction fire", "bow drill", "hand drill", "bast cordage",
        "stone boiling", "birch bark", "super shelter", "mors kochanski", "try stick",
    ]
    if any(be in q for be in bushcraft_exclusive) and not has_trapping:
        return None

    tracking_exclusive = [
        "wolf tracks", "cougar spoor", "track aging", "track age",
        "gait stride", "spoor", "footprint", "compacted mud",
        "dental stone", "animal tracks", "tracks in",
    ]
    if any(te in q for te in tracking_exclusive) and not has_trapping:
        return None

    shelter_exclusive = [
        "snow cave", "quinzhee", "quinzee", "debris hut",
        "snow trench", "cold-air well", "cold air well", "tree well bivouac",
    ]
    if any(se in q for se in shelter_exclusive) and not has_trapping:
        return None

    wildlife_exclusive = [
        "bear spray", "bear canister", "bear attack",
        "food hanging", "hang food", "store food from bears",
    ]
    if any(we in q for we in wildlife_exclusive) and not has_trapping:
        return None

    if not has_trapping:
        return None

    gear_words = ["gear", "safety", "kit", "checklist", "flagging tape", "practice peg"]
    if any(gw in q for gw in gear_words) and ("gear" in q or "safety" in q or "kit" in q or "checklist" in q):
        return TrappingIntent(action="gear_checklist")

    calc_words = ["calculate", "calculation", "weight ratio", "trip force", "stone weight", "deadfall weight", "notch depth"]
    if any(cw in q for cw in calc_words):
        matched_id: Optional[str] = None
        for m_id in DEFAULT_MECHANISMS:
            if m_id in q or m_id.replace("-", " ") in q or m_id.split("-")[0] in q:
                matched_id = m_id
                break
        return TrappingIntent(action="calculate_trapping", mechanism_id=matched_id or "figure-4-deadfall")

    mechanism_patterns = [
        ("figure-4-deadfall", ["figure-4", "figure 4", "figure-four", "figure four"]),
        ("paiute-deadfall", ["paiute"]),
        ("promontory-peg-snare", ["promontory", "promontory peg", "promontory-peg"]),
        ("spring-pole-snare", ["spring-pole", "spring pole", "sapling snare"]),
        ("rolling-log-deadfall", ["rolling log", "rolling-log", "log deadfall"]),
    ]
    for mech_id, aliases in mechanism_patterns:
        if any(alias in q for alias in aliases):
            return TrappingIntent(action="mechanism_detail", mechanism_id=mech_id)

    category: Optional[str] = None
    if "snare" in q:
        category = "snare"
    elif "deadfall" in q:
        category = "deadfall"

    return TrappingIntent(action="mechanisms_list", category=category)


def format_primitive_trapping_response(data: Any, query: str = "") -> FormattedTrappingResponse:
    payload: dict[str, Any]
    if isinstance(data, TrappingCalculationResponse):
        calc = data
        answer = (
            f"Primitive Trapping Calculation for {calc.mechanism_title}: Quarry: {calc.quarry_name} ({calc.quarry_weight_lbs:.1f} lbs). "
            f"Deadfall weight: {calc.deadfall_weight_lbs:.1f} lbs (Weight ratio: {calc.weight_ratio:.2f}:1, Status: {calc.lethality_status}). "
            f"Trigger sensitivity status: {calc.sensitivity_status} (Estimated trip force: {calc.estimated_trip_force_oz:.2f} oz). "
            f"Ethics & Regulations: {calc.legal_ethics_advisory}"
        )
        payload = {"action": "calculate_trapping", "mechanism_id": calc.mechanism_id, "calculation": calc.model_dump()}
        return FormattedTrappingResponse(answer, {"primitive_trapping_info": payload, "trapping_info": payload, "answer": answer})

    if isinstance(data, dict):
        if "primitive_trapping_info" in data and "answer" in data:
            return FormattedTrappingResponse(data["answer"], data)
        if "action" in data and ("calculation" in data or "mechanism_id" in data):
            answer = f"Primitive trapping calculation completed for {data.get('mechanism_id', 'mechanism')}."
            return FormattedTrappingResponse(answer, {"primitive_trapping_info": data, "trapping_info": data, "answer": answer})
        intent = (
            TrappingIntent(**data)
            if "action" in data
            else (detect_primitive_trapping_intent(query or str(data)) or TrappingIntent(action="mechanisms_list"))
        )
    elif isinstance(data, TrappingIntent):
        intent = data
    else:
        intent = detect_primitive_trapping_intent(str(data)) or TrappingIntent(action="mechanisms_list")

    if intent.action in ("calculate_trapping", "calculate"):
        req = TrappingCalculationRequest(mechanism_id=intent.mechanism_id or "figure-4-deadfall")
        calc = calculate_primitive_trapping(req)
        answer = (
            f"Primitive Trapping Calculation for {calc.mechanism_title}: Quarry: {calc.quarry_name} ({calc.quarry_weight_lbs:.1f} lbs). "
            f"Deadfall weight: {calc.deadfall_weight_lbs:.1f} lbs (Weight ratio: {calc.weight_ratio:.2f}:1, Status: {calc.lethality_status}). "
            f"Trigger sensitivity status: {calc.sensitivity_status} (Estimated trip force: {calc.estimated_trip_force_oz:.2f} oz). "
            f"Ethics & Regulations: {calc.legal_ethics_advisory}"
        )
        payload = {"action": "calculate_trapping", "mechanism_id": calc.mechanism_id, "calculation": calc.model_dump()}
        return FormattedTrappingResponse(answer, {"primitive_trapping_info": payload, "trapping_info": payload, "answer": answer})

    if intent.action in ("gear_checklist", "gear", "safety_gear"):
        gear = get_trapping_safety_gear()
        items_str = "; ".join(f"{item.name} ({item.purpose})" for item in gear)
        answer = (
            f"Mandatory Wilderness Trapping Safety & Ethics Kit ({len(gear)} items): {items_str}. "
            f"Practice triggers exclusively with inert wooden pegs and flag all drill sets with fluorescent tape."
        )
        payload = {"action": "gear_checklist", "gear": [item.model_dump() for item in gear], "mandatory_count": len(gear)}
        return FormattedTrappingResponse(answer, {"primitive_trapping_info": payload, "trapping_info": payload, "answer": answer})

    if intent.action == "mechanism_detail" and intent.mechanism_id:
        mech = get_trapping_mechanism(intent.mechanism_id)
        if mech:
            highlights_str = ", ".join(mech.highlights)
            answer = (
                f"Primitive Trapping Mechanism: {mech.title} (Category: {mech.category.title()}). "
                f"Sensitivity: {mech.sensitivity_rating.title()} | Cordage required: {'Yes' if mech.cordage_required else 'No'} | "
                f"Quarry suitability: {mech.quarry_suitability}. {mech.description} Highlights: {highlights_str}."
            )
            payload = {"action": "mechanism_detail", "mechanism_id": mech.mechanism_id, "mechanism": mech.model_dump()}
            return FormattedTrappingResponse(answer, {"primitive_trapping_info": payload, "trapping_info": payload, "answer": answer})

    mechanisms = get_trapping_mechanisms(category=intent.category)
    summary_str = "; ".join(
        f"{m.title} ({m.category.title()}, {m.sensitivity_rating} sensitivity, cordage: {'required' if m.cordage_required else 'none'})"
        for m in mechanisms
    )
    answer = (
        f"Contoso Primitive Trapping & Deadfall Catalog ({len(mechanisms)} mechanisms): {summary_str}. "
        f"Ask about trigger mechanics, weight-to-quarry ratio calculations, or mandatory practice safety gear."
    )
    payload = {"action": "mechanisms_list", "category": intent.category, "mechanisms": [m.model_dump() for m in mechanisms]}
    return FormattedTrappingResponse(answer, {"primitive_trapping_info": payload, "trapping_info": payload, "answer": answer})


def build_primitive_trapping_prompt(intent: Optional[TrappingIntent] = None) -> str:
    lines = [
        "Wilderness Bushcraft Primitive Trapping & Deadfall Mechanics Guidance:",
        "- 5:1 Humane Instant Dispatch Rule: Deadfall deadweights must provide at least a 5:1 weight ratio to quarry mass (e.g. 17.5+ lbs for 3.5 lb snowshoe hare; 6+ lbs for 1.2 lb ground squirrel). 3:1 is sufficient minimum; sub-3:1 poses severe cruelty and suffering risks.",
        "- Trigger Notch Sensitivity: Optimal notch depth is 3.0mm to 6.0mm. Less than 3.0mm is a hair-trigger prone to premature wind release. Greater than 6.0mm risks quarry bait-theft without tripping.",
        "- Iconic Mechanisms: Classic Figure-4 (all-wood 3-stick interlocking, no cordage), Paiute Deadfall (cordage lever + hair-trigger toggle stick), Promontory Peg Snare (prehistoric Great Basin interlocking notched pegs), Tensioned Spring-Pole Snare (bent sapling engine), Rolling Log Deadfall (heavy timber crush deadweight).",
        "- Safety & Ethics: Practice strictly with inert demonstration pegs and safety catches. Flag all practice setups with fluorescent orange ribbon. Primitive trapping is strictly regulated under state wildlife codes and restricted to genuine survival emergencies.",
    ]
    if intent and intent.action == "mechanism_detail" and intent.mechanism_id:
        mech = get_trapping_mechanism(intent.mechanism_id)
        if mech:
            lines.append(f"Current Subject: {mech.title} ({mech.category}). {mech.description}")
    return "\n".join(lines)
