from typing import Any, Optional, Union

from pydantic import BaseModel, Field


class RaftingExpeditionModel(BaseModel):
    id: str
    name: str
    river: str
    location: str
    difficulty: str
    mileage_miles: float
    typical_days: int
    recommended_raft_size_feet: float
    permit_season: str
    description: str
    highlights: list[str] = Field(default_factory=list)


class RaftCalculationRequest(BaseModel):
    expedition_id: str = "colorado-river-grand-canyon"
    raft_length_feet: float = 18.0
    rigged_payload_kg: float = 650.0
    oar_length_feet: float = 10.0
    inboard_leverage_inches: float = 33.0
    entry_speed_knots: float = 6.0


class RaftCalculationResponse(BaseModel):
    expedition_name: str
    leverage_ratio: float
    total_displacement_liters: float
    hole_punch_momentum_ns: float
    punch_feasibility: str
    back_ferry_efficiency_score: float
    stability_warning: str
    oar_rig_recommendation: str


class RaftingGearRequirement(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool = True
    description: str


class RaftingIntent(BaseModel):
    intent_detected: bool = True
    expedition_id: Optional[str] = None
    action: str = "expeditions_list"
    confidence: float = 1.0

    def __bool__(self) -> bool:
        return self.intent_detected


class FormattedRiverRaftingResponse(str):
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


DEFAULT_RIVER_RAFTING_EXPEDITIONS: dict[str, RaftingExpeditionModel] = {
    "colorado-river-grand-canyon": RaftingExpeditionModel(
        id="colorado-river-grand-canyon",
        name="Colorado River — Grand Canyon Expedition",
        river="Colorado River",
        location="Lee's Ferry to Diamond Creek, Arizona, USA",
        difficulty="Class V",
        mileage_miles=226.0,
        typical_days=18,
        recommended_raft_size_feet=18.0,
        permit_season="Weighted Lottery (Feb for following year) / Year-Round",
        description="The premier multi-day whitewater expedition on Earth, carving through 226 miles of primordial Vishnu schist with legendary big-water rapids including Crystal, Lava Falls, and Hermit.",
        highlights=[
            "Legendary Class V big-water rapids: Lava Falls, Crystal, and Hermit",
            "226 miles through 2 billion years of geological strata",
            "Requires rigorous National Park Service non-commercial river permit & NPS groover/firepan inspection",
        ],
    ),
    "middle-fork-salmon-river": RaftingExpeditionModel(
        id="middle-fork-salmon-river",
        name="Middle Fork of the Salmon River",
        river="Middle Fork Salmon River",
        location="Frank Church Wilderness, Idaho, USA",
        difficulty="Class IV",
        mileage_miles=100.0,
        typical_days=6,
        recommended_raft_size_feet=15.0,
        permit_season="Four Rivers Lottery (Dec 1 - Jan 31) / Control Season Jun 20 - Sep 3",
        description="A free-flowing jewel of the Frank Church River of No Return Wilderness, dropping 3,000 vertical feet through 100 miles of continuous alpine canyon whitewater, thermal hot springs, and Impassable Canyon.",
        highlights=[
            "Continuous technical Class III-IV pool-and-drop whitewater through Velvet Falls and Tappan Falls",
            "Impassable Canyon's dramatic sheer granite gorges and natural thermal hot springs",
            "Strict USFS wilderness waste pack-out and four-rivers lottery permit regulations",
        ],
    ),
    "rogue-river-wilderness": RaftingExpeditionModel(
        id="rogue-river-wilderness",
        name="Rogue River Wilderness Wild & Scenic",
        river="Rogue River",
        location="Grave Creek to Foster Bar, Oregon, USA",
        difficulty="Class IV",
        mileage_miles=34.0,
        typical_days=4,
        recommended_raft_size_feet=14.0,
        permit_season="Competitive Lottery (Dec 1 - Jan 31) / Regulated Season May 15 - Oct 15",
        description="Designated under the original 1968 Wild and Scenic Rivers Act, the Rogue winds through dense Pacific Northwest old-growth forests with iconic rapids like Blossom Bar and Rainie Falls.",
        highlights=[
            "Iconic Blossom Bar Class IV boulder maze requiring precise back-ferry maneuvers",
            "Lush Pacific Northwest coastal temperate rainforest and black bear habitat",
            "BLM Smullin Visitor Center permit compliance with strict firepan and groover mandates",
        ],
    ),
    "selway-river-wilderness": RaftingExpeditionModel(
        id="selway-river-wilderness",
        name="Selway River National Wilderness",
        river="Selway River",
        location="Selway-Bitterroot Wilderness, Idaho, USA",
        difficulty="Class V",
        mileage_miles=47.0,
        typical_days=5,
        recommended_raft_size_feet=15.0,
        permit_season="Single Launch Per Day Lottery (May 15 - Jul 31)",
        description="One of the most pristine and strictly regulated whitewater rivers in North America, allowing only one private launch per day through intense continuous Class IV-V rapids like Moose Creek and Ladle.",
        highlights=[
            "Extremely exclusive one-launch-per-day lottery through untrammeled wilderness",
            "Relentless Moose Creek Rapid complex demanding precise high-water oar momentum",
            "Leave No Trace pack-it-in pack-it-out river corridor with zero development",
        ],
    ),
    "green-river-gates-of-lodore": RaftingExpeditionModel(
        id="green-river-gates-of-lodore",
        name="Green River — Gates of Lodore",
        river="Green River",
        location="Dinosaur National Monument, Colorado / Utah, USA",
        difficulty="Class IV",
        mileage_miles=44.0,
        typical_days=4,
        recommended_raft_size_feet=16.0,
        permit_season="Dinosaur National Monument Permit Lottery (Dec 1 - Jan 31) / May - Sep",
        description="Spectacular red-rock canyon expedition entering through the dramatic 1,000-foot crimson cliffs of Lodore Gate, featuring technical rapids like Disaster Falls and Hell's Half Mile.",
        highlights=[
            "Striking 1,000-foot Precambrian red quartzite canyon walls at the Gates of Lodore",
            "High-stakes technical boulder gardens: Upper Disaster Falls and Hell's Half Mile",
            "NPS river permit required with mandatory clean-waste human waste groover containment",
        ],
    ),
}

DEFAULT_RIVER_RAFTING_GEAR: list[RaftingGearRequirement] = [
    RaftingGearRequirement(
        id="modular-aluminum-oar-frame",
        name="Modular Aluminum Oar Frame System with Adjustable Towers",
        category="frame_rowing",
        mandatory=True,
        description="Heavy-duty anodized 1.25-inch or 1.5-inch aluminum pipe frame with modular bays, foot bar, and adjustable oar towers for balanced rowing torque.",
    ),
    RaftingGearRequirement(
        id="counterbalanced-composite-oars",
        name="Counterbalanced Composite Whitewater Oars with Heavy-Duty Oarlocks",
        category="rowing_propulsion",
        mandatory=True,
        description="Lightweight, resilient carbon/fiberglass shaft oars with weighted handles to reduce rower fatigue and bronze oarlocks secured with split rings.",
    ),
    RaftingGearRequirement(
        id="gasketed-aluminum-drybox",
        name="Gasketed Heavy-Gauge Aluminum River Dry Box",
        category="cargo_containment",
        mandatory=True,
        description="Watertight, lockable marine-grade aluminum drybox with full perimeter neoprene gasket to protect delicate food, camp gear, and first aid from submersion.",
    ),
    RaftingGearRequirement(
        id="heavy-duty-drop-bag-cargo-net",
        name="Heavy-Duty Vinyl Drop Bag & Cam-Strap Cargo Net System",
        category="cargo_rigging",
        mandatory=True,
        description="Suspended frame drop bag with high-tensile cam-strap mesh net securing all payload bags flush to prevent shifting in violent hydraulics.",
    ),
    RaftingGearRequirement(
        id="high-flotation-type-v-pfd",
        name="High-Flotation US Coast Guard Type V Whitewater Rafting PFD",
        category="personal_flotation",
        mandatory=True,
        description="High-buoyancy (22+ lbs flotation) rescue life jacket designed to quickly bring swimmers to the surface in heavily aerated, turbulent whitewater.",
    ),
    RaftingGearRequirement(
        id="firepan-clean-waste-groover",
        name="Heavy-Duty River Groover Toilet System & Firepan with 3-Inch Lip",
        category="sanitation_leave_no_trace",
        mandatory=True,
        description="Rigid gasketed SCAT human waste containment system ('groover') and elevated 3-inch walled metal firepan mandatory for USFS/NPS wilderness river permit compliance.",
    ),
]


def get_river_rafting_expeditions(
    difficulty: Optional[str] = None,
    river: Optional[str] = None,
) -> list[RaftingExpeditionModel]:
    expeditions = list(DEFAULT_RIVER_RAFTING_EXPEDITIONS.values())
    if difficulty:
        norm_diff = difficulty.strip().lower()
        expeditions = [e for e in expeditions if norm_diff in e.difficulty.lower()]
    if river:
        norm_riv = river.strip().lower()
        expeditions = [e for e in expeditions if norm_riv in e.river.lower()]
    return expeditions


def get_river_rafting_expedition_by_id(expedition_id: str) -> Optional[RaftingExpeditionModel]:
    return DEFAULT_RIVER_RAFTING_EXPEDITIONS.get(expedition_id.strip().lower())


def get_river_rafting_gear() -> list[RaftingGearRequirement]:
    return list(DEFAULT_RIVER_RAFTING_GEAR)


def calculate_river_rafting(request: RaftCalculationRequest) -> RaftCalculationResponse:
    target_id = request.expedition_id.strip().lower()
    expedition = get_river_rafting_expedition_by_id(target_id)
    if not expedition:
        raise ValueError(f"River rafting expedition '{request.expedition_id}' not found")

    # Outboard leverage mechanics
    outboard_inches = (request.oar_length_feet * 12.0) - request.inboard_leverage_inches
    inboard = max(request.inboard_leverage_inches, 1.0)
    leverage_ratio = round(outboard_inches / inboard, 2)

    # Raft displacement and hydrodynamics
    total_weight_kg = request.rigged_payload_kg + (request.raft_length_feet * 8.0)
    total_displacement_liters = round(total_weight_kg * 1.05)

    # Hydraulic hole punch momentum
    velocity_ms = request.entry_speed_knots * 0.514444
    hole_punch_momentum_ns = round(total_weight_kg * velocity_ms)

    # Punch feasibility
    if hole_punch_momentum_ns >= 2200:
        punch_feasibility = "punch_clean"
    elif hole_punch_momentum_ns >= 1400:
        punch_feasibility = "caution_stall_risk"
    else:
        punch_feasibility = "flip_hazard_danger"

    # Back ferry efficiency score
    leverage_delta = abs(leverage_ratio - 2.2)
    mass_penalty = max(0.0, (total_weight_kg - (request.raft_length_feet * 30.0)) * 0.04)
    back_ferry_efficiency_score = round(
        max(15.0, min(98.0, 95.0 - (leverage_delta * 22.0) - mass_penalty)), 1
    )

    # Stability warning
    if punch_feasibility == "flip_hazard_danger":
        stability_warning = (
            "CRITICAL DANGER: Hole punch momentum is below 1,400 N·s. Entering a recirculating hydraulic hole "
            "at this payload and velocity creates extreme risk of stalling in the boil line, severe backwash surf, "
            "and catastrophic flip."
        )
    elif punch_feasibility == "caution_stall_risk":
        stability_warning = (
            "CAUTION: Marginal hole punch momentum (1,400 - 2,200 N·s). Significant risk of hydraulic stall. "
            "Rowers must maintain downstream momentum with aggressive forward power strokes and high-side crew preparation."
        )
    else:
        stability_warning = (
            "OPTIMAL: Rig momentum exceeds 2,200 N·s threshold. The boat possesses sufficient kinetic inertia to punch "
            "through aerated hydraulic curtains and boil lines cleanly."
        )

    # Oar rig recommendation
    if request.raft_length_feet >= 18.0:
        base_oar = "For an 18ft heavy expedition rig, 10.0ft to 10.5ft counterbalanced composite oars paired with heavy-duty brass oarlocks provide maximum leverage and clearance over dry boxes."
    elif request.raft_length_feet >= 16.0:
        base_oar = "For a 16ft expedition raft, 9.5ft to 10.0ft composite oars with counterbalanced grips and bronze horn oarlocks ensure balanced control in technical canyon drops."
    elif request.raft_length_feet >= 14.0:
        base_oar = "For a 14ft to 15ft technical whitewater raft, 9.0ft to 9.5ft oars offer optimal agility and blade response through tight boulder gardens."
    else:
        base_oar = "For rafts under 14ft, 8.5ft to 9.0ft oars provide nimble handling with minimal inboard handle clash."

    if leverage_ratio > 2.5:
        oar_rig_recommendation = (
            f"{base_oar} Outboard leverage ratio is high ({leverage_ratio}:1) — consider counterbalanced handle sleeves "
            "to reduce rower forearm fatigue."
        )
    elif leverage_ratio < 1.9:
        oar_rig_recommendation = (
            f"{base_oar} Outboard leverage ratio is low ({leverage_ratio}:1) — consider widening oar tower stance "
            "or increasing oar length for better reach."
        )
    else:
        oar_rig_recommendation = f"{base_oar} Mechanical leverage ratio ({leverage_ratio}:1) is well within the ideal 2.0–2.4:1 rowing window."

    return RaftCalculationResponse(
        expedition_name=expedition.name,
        leverage_ratio=leverage_ratio,
        total_displacement_liters=total_displacement_liters,
        hole_punch_momentum_ns=hole_punch_momentum_ns,
        punch_feasibility=punch_feasibility,
        back_ferry_efficiency_score=back_ferry_efficiency_score,
        stability_warning=stability_warning,
        oar_rig_recommendation=oar_rig_recommendation,
    )


def detect_river_rafting_intent(message: str) -> RaftingIntent:
    if not message or not message.strip():
        return RaftingIntent(intent_detected=False, expedition_id=None, action="", confidence=0.0)

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
        return RaftingIntent(intent_detected=False, expedition_id=None, action="", confidence=0.0)

    # 2. Packrafting guard (packrafting.py)
    packraft_terms = [
        "packraft",
        "packrafting",
        "alpacka",
        "ultralight boat",
        "bikerafting",
        "tizip cargo fly",
    ]
    rafting_specific = [
        "oar frame",
        "oar-frame",
        "oarlock",
        "oarlocks",
        "oar locks",
        "groover",
        "dry box",
        "drybox",
        "cataraft",
        "grand canyon",
        "middle fork",
        "gates of lodore",
        "hole punch",
    ]
    if any(p in q for p in packraft_terms) and not any(r in q for r in rafting_specific):
        return RaftingIntent(intent_detected=False, expedition_id=None, action="", confidence=0.0)

    # 3. Whitewater kayaking guard (whitewater.py)
    kayak_terms = [
        "creek boat",
        "playboat",
        "half slice",
        "paddle roll",
        "eskimo roll",
    ]
    if any(k in q for k in kayak_terms) and not any(
        r in q for r in rafting_specific + ["raft", "rafting"]
    ):
        return RaftingIntent(intent_detected=False, expedition_id=None, action="", confidence=0.0)
    if ("kayak" in q or "kayaking" in q) and not any(
        r in q for r in rafting_specific + ["raft", "rafting", "oar frame"]
    ):
        return RaftingIntent(intent_detected=False, expedition_id=None, action="", confidence=0.0)

    # 4. Canoe expedition guard (canoe_expedition.py)
    canoe_terms = [
        "canoe",
        "canoeing",
        "portage yoke",
        "bent-shaft paddle",
        "boundary waters",
        "j-stroke",
    ]
    if any(c in q for c in canoe_terms) and not any(
        r in q for r in rafting_specific + ["raft", "rafting"]
    ):
        return RaftingIntent(intent_detected=False, expedition_id=None, action="", confidence=0.0)

    # 5. River SUP guard (river_sup.py)
    sup_terms = [
        "river sup",
        "stand up paddleboard",
        "stand-up paddleboard",
        "sup board",
        "paddleboard",
    ]
    if any(s in q for s in sup_terms) and not any(
        r in q for r in rafting_specific + ["raft", "rafting"]
    ):
        return RaftingIntent(intent_detected=False, expedition_id=None, action="", confidence=0.0)

    # Keywords for river rafting
    rafting_keywords = [
        "whitewater rafting",
        "river rafting",
        "rafting",
        "oar frame",
        "oar-frame",
        "oar frames",
        "oar lock",
        "oarlocks",
        "oar locks",
        "river rowing",
        "cataraft",
        "groover",
        "dry box",
        "drybox",
        "grand canyon rafting",
        "colorado river rafting",
        "middle fork salmon",
        "selway river",
        "rogue river rafting",
        "rogue river wilderness",
        "gates of lodore",
        "hole punch",
        "hydraulic hole",
        "back ferry",
        "back-ferry",
        "raft payload",
        "rigged payload",
        "oar leverage",
        "inboard leverage",
        "drop bag",
        "river groover",
    ]

    has_rafting_keyword = any(k in q for k in rafting_keywords)
    if not has_rafting_keyword:
        return RaftingIntent(intent_detected=False, expedition_id=None, action="", confidence=0.0)

    # Expedition identification
    expedition_id: Optional[str] = None
    if "grand canyon" in q or "colorado river" in q:
        expedition_id = "colorado-river-grand-canyon"
    elif "middle fork" in q or "salmon river" in q:
        expedition_id = "middle-fork-salmon-river"
    elif "rogue river" in q or "blossom bar" in q:
        expedition_id = "rogue-river-wilderness"
    elif "selway" in q or "moose creek" in q:
        expedition_id = "selway-river-wilderness"
    elif "gates of lodore" in q or "lodore" in q:
        expedition_id = "green-river-gates-of-lodore"

    # Action detection
    calc_terms = [
        "calculate",
        "calculation",
        "leverage",
        "leverage ratio",
        "hole punch",
        "momentum",
        "displacement",
        "punch feasibility",
        "back ferry efficiency",
        "inboard leverage",
    ]
    gear_terms = [
        "gear",
        "checklist",
        "equipment",
        "mandatory",
        "pack list",
        "packing list",
        "what to pack",
        "drybox",
        "dry box",
        "groover",
        "cargo net",
        "drop bag",
        "firepan",
    ]

    if any(c in q for c in calc_terms):
        action = "calculate_raft"
    elif any(g in q for g in gear_terms):
        action = "gear_checklist"
    elif expedition_id and any(
        w in q
        for w in [
            "detail",
            "about",
            "describe",
            "tell me about",
            "highlights",
            "permit",
            "mileage",
            "days",
            "rapids",
        ]
    ):
        action = "expedition_detail"
    elif expedition_id and not any(
        w in q for w in ["list", "catalog", "where", "all trips", "all expeditions"]
    ):
        action = "expedition_detail"
    else:
        action = "expeditions_list"

    return RaftingIntent(
        intent_detected=True,
        expedition_id=expedition_id,
        action=action,
        confidence=0.95 if expedition_id else 0.85,
    )


def build_river_rafting_prompt(
    query_or_intent: Union[str, RaftingIntent],
    intent: Optional[RaftingIntent] = None,
) -> str:
    if isinstance(query_or_intent, RaftingIntent):
        act_intent = query_or_intent
    elif intent is not None:
        act_intent = intent
    else:
        act_intent = detect_river_rafting_intent(str(query_or_intent))

    lines = [
        "Contoso Backcountry Whitewater Rafting & Oar-Frame River Assistant Tooling:",
        "- Rowing Mechanics & Oar Leverage: Mechanical leverage ratio = outboard oar inches / inboard inches.",
        "  Optimal leverage ratio is 2.0 to 2.4 (ideal 2.2:1) balancing blade reach and rower power output.",
        "- Hydraulic Hole Punch Dynamics: Kinetic momentum (p = m * v) determines whether a rigged expedition raft",
        "  punches through recirculating river hydraulics (>=2,200 N·s = punch clean; 1,400-2,200 N·s = stall risk; <1,400 N·s = flip hazard).",
        "- Rigged Payload & Displacement: Multi-day expedition payloads include heavy-gauge aluminum dry boxes,",
        "  USFS-mandated groover toilets, metal firepans, drop bags, and high-flotation USCG Type V PFDs.",
        "- River Permit Regulations: Controlled wilderness rivers require strict lottery season compliance (Grand Canyon non-commercial lottery,",
        "  Four Rivers lottery for Middle Fork Salmon & Selway, Rogue River BLM permit, Dinosaur National Monument Gates of Lodore).",
    ]

    if act_intent.action == "expedition_detail" and act_intent.expedition_id:
        expedition = get_river_rafting_expedition_by_id(act_intent.expedition_id)
        if expedition:
            lines.extend(
                [
                    f"- Focused Expedition: {expedition.name} ({expedition.location})",
                    f"  River: {expedition.river} | Difficulty: {expedition.difficulty} | Mileage: {expedition.mileage_miles} miles | Duration: {expedition.typical_days} days",
                    f"  Recommended Raft: {expedition.recommended_raft_size_feet}ft | Permit Season: {expedition.permit_season}",
                    f"  Highlights: {', '.join(expedition.highlights)}",
                    f"  Description: {expedition.description}",
                ]
            )
    elif act_intent.action == "calculate_raft":
        lines.append(
            "- Action: Calculate oar leverage ratio, total rigged displacement, entry momentum (N·s), "
            "hole punch feasibility, back ferry efficiency score, and frame stability advisories."
        )
    elif act_intent.action == "gear_checklist":
        lines.append(
            "- Action: Present the mandatory 6-item Multi-Day Whitewater Rafting & Oar Frame Safety Checklist."
        )
    else:
        expeditions = get_river_rafting_expeditions()
        lines.append(
            f"- Iconic Rafting Expeditions: {'; '.join(f'{e.name} ({e.difficulty}, {e.mileage_miles} mi, {e.typical_days} days)' for e in expeditions)}"
        )

    return "\n".join(lines)


def format_river_rafting_response(
    result_or_intent: Any,
    query: str = "",
) -> FormattedRiverRaftingResponse:
    if isinstance(result_or_intent, RaftCalculationResponse):
        calc = result_or_intent
        answer = (
            f"Whitewater Rafting Oar Leverage & Hydraulic Mechanics Analysis for {calc.expedition_name}: "
            f"Leverage Ratio: {calc.leverage_ratio}:1 | Total Displacement: {calc.total_displacement_liters} L | "
            f"Hole Punch Momentum: {calc.hole_punch_momentum_ns} N·s | "
            f"Punch Feasibility: {calc.punch_feasibility.upper()} | "
            f"Back Ferry Efficiency: {calc.back_ferry_efficiency_score}% | "
            f"Stability Advisory: {calc.stability_warning} | "
            f"Rig Recommendation: {calc.oar_rig_recommendation}"
        )
        calc_info: dict[str, Any] = {
            "action": "calculate_raft",
            "calculation": calc.model_dump(),
        }
        return FormattedRiverRaftingResponse(
            answer, {"river_rafting_info": calc_info, "answer": answer}
        )

    if isinstance(result_or_intent, RaftingIntent):
        intent = result_or_intent
    elif isinstance(result_or_intent, dict):
        intent = RaftingIntent(**result_or_intent)
    else:
        intent = detect_river_rafting_intent(str(result_or_intent))

    if intent.action == "calculate_raft":
        target_exp_id = intent.expedition_id or "colorado-river-grand-canyon"
        req = RaftCalculationRequest(expedition_id=target_exp_id)
        calc_res = calculate_river_rafting(req)
        answer = (
            f"Whitewater Rafting Oar Leverage & Hydraulic Mechanics Analysis for {calc_res.expedition_name}: "
            f"Leverage Ratio: {calc_res.leverage_ratio}:1 | Total Displacement: {calc_res.total_displacement_liters} L | "
            f"Hole Punch Momentum: {calc_res.hole_punch_momentum_ns} N·s | "
            f"Punch Feasibility: {calc_res.punch_feasibility.upper()} | "
            f"Back Ferry Efficiency: {calc_res.back_ferry_efficiency_score}% | "
            f"Stability Advisory: {calc_res.stability_warning} | "
            f"Rig Recommendation: {calc_res.oar_rig_recommendation}"
        )
        calc_dict: dict[str, Any] = {
            "action": "calculate_raft",
            "calculation": calc_res.model_dump(),
        }
        return FormattedRiverRaftingResponse(
            answer, {"river_rafting_info": calc_dict, "answer": answer}
        )

    elif intent.action == "gear_checklist":
        gear = get_river_rafting_gear()
        answer = (
            f"Mandatory Multi-Day Whitewater Rafting & Oar Frame Gear Checklist ({len(gear)} items): "
            + "; ".join(f"{g.name} ({g.description})" for g in gear)
            + ". Rigorous USFS/NPS wilderness permit inspection compliance required before river launch."
        )
        gear_dict: dict[str, Any] = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
            "mandatory_count": sum(1 for g in gear if g.mandatory),
        }
        return FormattedRiverRaftingResponse(
            answer, {"river_rafting_info": gear_dict, "answer": answer}
        )

    elif intent.action == "expedition_detail" and intent.expedition_id:
        expedition = get_river_rafting_expedition_by_id(intent.expedition_id)
        if expedition:
            answer = (
                f"River Rafting Expedition Beta — {expedition.name} ({expedition.location}): "
                f"Difficulty: {expedition.difficulty} | Mileage: {expedition.mileage_miles} miles | "
                f"Duration: {expedition.typical_days} days | Recommended Raft: {expedition.recommended_raft_size_feet}ft. "
                f"Permit Season: {expedition.permit_season}. "
                f"Highlights: {', '.join(expedition.highlights)}. {expedition.description}"
            )
            detail_dict: dict[str, Any] = {
                "action": "expedition_detail",
                "expedition": expedition.model_dump(),
            }
            return FormattedRiverRaftingResponse(
                answer, {"river_rafting_info": detail_dict, "answer": answer}
            )

    # Default: expeditions_list
    expeditions = get_river_rafting_expeditions()
    summary = "; ".join(
        f"{e.name} ({e.difficulty}, {e.mileage_miles} mi, {e.typical_days} days)"
        for e in expeditions
    )
    answer = (
        f"Contoso Multi-Day Whitewater Rafting Expeditions ({len(expeditions)} iconic rivers): {summary}. "
        "Ask about specific river logistics, oar leverage & hole punch calculations, or mandatory wilderness gear checklists."
    )
    list_dict: dict[str, Any] = {
        "action": "expeditions_list",
        "expeditions": [e.model_dump() for e in expeditions],
    }
    return FormattedRiverRaftingResponse(
        answer, {"river_rafting_info": list_dict, "answer": answer}
    )
