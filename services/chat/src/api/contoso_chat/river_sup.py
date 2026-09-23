from typing import Any, Optional

from pydantic import BaseModel


class RiverSupRunModel(BaseModel):
    run_id: str
    title: str
    river_system: str
    region: str
    difficulty: str
    length_miles: float
    gradient_ft_per_mile: float
    flow_range_cfs: str
    typical_duration_hours: float
    description: str
    highlights: list[str]


class RiverSupCalculationRequest(BaseModel):
    run_id: str = "arkansas-river-browns-canyon"
    paddler_weight_kg: float = 75.0
    gear_weight_kg: float = 5.0
    board_volume_liters: float = 310.0
    river_flow_cfs: float = 1500.0
    fin_type: str = "short_flexible_river_fins"
    leash_type: str = "torso_quick_release"


class RiverSupCalculationResponse(BaseModel):
    run_id: str
    run_title: str
    total_payload_kg: float
    volume_to_weight_ratio: float
    buoyancy_rating: str
    stability_index_percent: int
    fin_clearance_status: str
    leash_safety_status: str
    safety_status: str
    paddling_advisory: str


class RiverSupGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class RiverSupIntent(BaseModel):
    action: str  # "runs_list", "run_detail", "river_sup_calculation", "gear_checklist"
    run_id: Optional[str] = None
    difficulty: Optional[str] = None


DEFAULT_RIVER_SUP_RUNS: dict[str, RiverSupRunModel] = {
    "arkansas-river-browns-canyon": RiverSupRunModel(
        run_id="arkansas-river-browns-canyon",
        title="Browns Canyon National Monument",
        river_system="Arkansas River",
        region="Salida/Buena Vista, CO, USA",
        difficulty="class_iii",
        length_miles=14.0,
        gradient_ft_per_mile=28.0,
        flow_range_cfs="800 - 2,200 CFS",
        typical_duration_hours=4.5,
        description="Iconic Colorado whitewater SUP section through granite canyons with continuous Class III wavetrains and technical eddy moves.",
        highlights=[
            "Canyon punchy wavetrains",
            "Continuous granite boulder gardens",
            "Zoeller & Seidel eddy lines",
        ],
    ),
    "white-salmon-husum": RiverSupRunModel(
        run_id="white-salmon-husum",
        title="Middle White Salmon River",
        river_system="White Salmon River",
        region="BZ Corners, WA, USA",
        difficulty="class_iv",
        length_miles=6.0,
        gradient_ft_per_mile=45.0,
        flow_range_cfs="900 - 2,500 CFS",
        typical_duration_hours=3.0,
        description="Steep Pacific Northwest volcanic gorge featuring committing Class IV drops, punchy hydraulic holes, and narrow basalt slot rapids.",
        highlights=[
            "Lush basalt canyon gorges",
            "Punchy hydraulic holes",
            "Husum Falls portage option",
        ],
    ),
    "french-broad-section-9": RiverSupRunModel(
        run_id="french-broad-section-9",
        title="French Broad River (Section 9)",
        river_system="French Broad River",
        region="Marshall to Hot Springs, NC, USA",
        difficulty="class_iii",
        length_miles=8.5,
        gradient_ft_per_mile=24.0,
        flow_range_cfs="1,200 - 4,000 CFS",
        typical_duration_hours=3.5,
        description="Appalachian free-flowing whitewater classic with broad boulder-strewn rapids, technical ledge drops, and warm summer currents.",
        highlights=[
            "Warm Appalachian free-flowing water",
            "Wide technical eddy hopping",
            "Frank Bell's Rapid drop",
        ],
    ),
    "deschutes-maupin-run": RiverSupRunModel(
        run_id="deschutes-maupin-run",
        title="Lower Deschutes (Maupin Reach)",
        river_system="Deschutes River",
        region="Maupin, OR, USA",
        difficulty="class_iii",
        length_miles=10.0,
        gradient_ft_per_mile=22.0,
        flow_range_cfs="3,500 - 5,500 CFS",
        typical_duration_hours=4.0,
        description="High-desert canyon big-water river SUP run characterized by powerful rolling wave trains, basalt ledges, and sustained Class III volume.",
        highlights=[
            "Desert canyon basalt walls",
            "Boxcar & Oak Springs standing waves",
            "Big volume rolling wave trains",
        ],
    ),
    "soca-kobarid-slalom": RiverSupRunModel(
        run_id="soca-kobarid-slalom",
        title="Soča River (Kobarid Reach)",
        river_system="Soča River",
        region="Kobarid, Slovenia",
        difficulty="class_iv",
        length_miles=7.5,
        gradient_ft_per_mile=35.0,
        flow_range_cfs="700 - 2,100 CFS",
        typical_duration_hours=3.5,
        description="Breathtaking emerald Julian Alps glacial river featuring crystal-clear technical slalom rapids, limestone gorges, and dynamic surf waves.",
        highlights=[
            "Crystal turquoise glacial pools",
            "Technical limestone boulder slaloms",
            "Emerald standing wave surf spots",
        ],
    ),
}

DEFAULT_RIVER_SUP_GEAR: list[RiverSupGearRequirement] = [
    RiverSupGearRequirement(
        item_id="quick-release-torso-leash",
        name="Chest-Harness Quick-Release River Leash Belt with High-Visibility Toggle",
        category="leash_safety",
        mandatory=True,
        purpose="Enables immediate one-handed detachment under moving water dynamic load to prevent fatal snag entrapment.",
    ),
    RiverSupGearRequirement(
        item_id="whitewater-certified-pfd",
        name="Type V High-Buoyancy Whitewater PFD with Rescue Harness Ring",
        category="buoyancy",
        mandatory=True,
        purpose="Delivers essential high-flotation in aerated whitewater and integrated quick-release harness capability.",
    ),
    RiverSupGearRequirement(
        item_id="drainage-water-helmet",
        name="EN 1385 Certified Whitewater Drainage Helmet with Ear Protection",
        category="head_protection",
        mandatory=True,
        purpose="Cranial and temporal impact protection against shallow riverbed boulders and violent hydraulic flips.",
    ),
    RiverSupGearRequirement(
        item_id="flexible-river-fins",
        name="Low-Profile 2-4 Inch Flexible Polyurethane River Fins for Shallow Clearance",
        category="fins",
        mandatory=True,
        purpose="Flexes over shallow riverbed rocks without catching, preventing violent forward pivot falls.",
    ),
    RiverSupGearRequirement(
        item_id="carbon-reinforced-river-paddle",
        name="Durable Nylon/Carbon River SUP Paddle with Reinforced Tip",
        category="propulsion",
        mandatory=True,
        purpose="Withstands forceful rock strikes during shallow aggressive bracing and explosive rapid propulsion.",
    ),
    RiverSupGearRequirement(
        item_id="padded-neoprene-booties",
        name="5mm Sticky Rubber Sole Neoprene River Booties with Ankle Protection",
        category="footwear",
        mandatory=True,
        purpose="Provides high-traction grip on slippery riverbed boulders and thermal cushioning during defensive swims.",
    ),
]


def get_river_sup_runs(difficulty: Optional[str] = None) -> list[RiverSupRunModel]:
    runs = list(DEFAULT_RIVER_SUP_RUNS.values())
    if not difficulty:
        return runs

    norm = difficulty.strip().lower().replace("-", "_").replace(" ", "_")
    target = norm
    if "iv" in norm or "4" in norm:
        target = "class_iv"
    elif "iii" in norm or "3" in norm:
        target = "class_iii"
    elif "ii" in norm or "2" in norm:
        target = "class_ii"

    return [r for r in runs if r.difficulty == target]


def get_river_sup_run_by_id(run_id: str) -> Optional[RiverSupRunModel]:
    return DEFAULT_RIVER_SUP_RUNS.get(run_id.strip().lower())


def get_river_sup_gear() -> list[RiverSupGearRequirement]:
    return list(DEFAULT_RIVER_SUP_GEAR)


def calculate_river_sup(req: RiverSupCalculationRequest) -> RiverSupCalculationResponse:
    run = get_river_sup_run_by_id(req.run_id)
    if not run:
        raise ValueError(f"River SUP run '{req.run_id}' not found")

    total_payload_kg = round(req.paddler_weight_kg + req.gear_weight_kg, 2)
    volume_to_weight_ratio = round(req.board_volume_liters / total_payload_kg, 2)

    # Buoyancy rating
    if volume_to_weight_ratio < 2.8:
        buoyancy_rating = (
            "Critically under-buoyant for aerated whitewater; severe sinking and instability risk."
        )
    elif volume_to_weight_ratio < 3.5:
        buoyancy_rating = (
            "Moderate buoyancy; lively handling for expert paddlers, low margin in foam."
        )
    elif volume_to_weight_ratio <= 4.5:
        buoyancy_rating = "Optimal whitewater buoyancy; stable flotation across aerated wavetrains."
    else:
        buoyancy_rating = "High volume buoyancy; maximum stability, increased wind resistance."

    # Fin clearance status
    if req.fin_type == "standard_long_touring_fin":
        fin_clearance_status = "Severe hazard: 8-9 inch touring fin will strike shallow river boulders and trigger violent falls."
    else:
        fin_clearance_status = (
            "Approved: shallow-draft flexible fin setup clears riverbed obstructions."
        )

    # Leash safety status
    if req.leash_type == "ankle_fixed_coiled":
        leash_safety_status = "PROHIBITED HAZARD: Fixed ankle leashes cause fatal riverbed snag entrapment in moving water."
    elif req.leash_type == "none":
        leash_safety_status = (
            "Caution: unattached board loss in rapids; emergency swim to eddy required."
        )
    else:
        leash_safety_status = "Approved: quick-release torso harness allows instant detachment under dynamic current load."

    # Overall safety status
    if (
        req.leash_type == "ankle_fixed_coiled"
        or req.fin_type == "standard_long_touring_fin"
        or volume_to_weight_ratio < 2.8
    ):
        safety_status = "hazardous_prohibited"
    elif volume_to_weight_ratio < 3.5 or req.leash_type == "none" or req.river_flow_cfs > 3500:
        safety_status = "caution_expert_only"
    else:
        safety_status = "approved"

    # Stability index calculation
    flow_penalty = 15 if req.river_flow_cfs > 3000 else 0
    raw_stability = int(round((volume_to_weight_ratio / 4.0) * 85 - flow_penalty))
    stability_index_percent = min(100, max(20, raw_stability))

    # Composite paddling advisory
    advisory_parts = [
        f"River SUP Analysis for {run.title} ({run.river_system}, {run.difficulty.upper()}):",
        f"Total payload is {total_payload_kg} kg with board volume {req.board_volume_liters} L (ratio: {volume_to_weight_ratio}).",
        buoyancy_rating,
        fin_clearance_status,
        leash_safety_status,
    ]
    if safety_status == "hazardous_prohibited":
        advisory_parts.append(
            "CRITICAL SAFETY WARNING: Setup contains prohibited equipment or critical buoyancy deficits. Do not paddle in moving water."
        )
    elif safety_status == "caution_expert_only":
        advisory_parts.append(
            "CAUTION: High-demand configuration or heavy flow conditions requiring advanced river SUP bracing and eddy hopping skills."
        )
    else:
        advisory_parts.append(
            "Setup approved for whitewater river stand-up paddleboarding with proper quick-release torso harness and shallow fins."
        )

    paddling_advisory = " ".join(advisory_parts)

    return RiverSupCalculationResponse(
        run_id=run.run_id,
        run_title=run.title,
        total_payload_kg=total_payload_kg,
        volume_to_weight_ratio=volume_to_weight_ratio,
        buoyancy_rating=buoyancy_rating,
        stability_index_percent=stability_index_percent,
        fin_clearance_status=fin_clearance_status,
        leash_safety_status=leash_safety_status,
        safety_status=safety_status,
        paddling_advisory=paddling_advisory,
    )


def detect_river_sup_intent(query: str) -> Optional[RiverSupIntent]:
    if not query or not query.strip():
        return None

    q = query.lower()

    # Disambiguation guards
    flatwater_markers = [
        "flatwater paddleboard",
        "lake paddleboard",
        "flatwater sup",
        "calm lake",
        "calm water",
    ]
    kayak_markers = [
        "kayak rental",
        "kayak rentals",
        "sea kayak",
        "sea kayaking",
        "whitewater kayaking",
    ]
    canoe_markers = [
        "canoe expedition",
        "canoe expeditions",
        "boundary waters",
        "canoe trim",
    ]
    unrelated_markers = [
        "order #",
        "refund",
        "return label",
        "climbing shoe",
        "ski tour",
        "splitboard",
        "snowpack",
        "avalanche danger",
        "avalanche forecast",
    ]

    for m in flatwater_markers + kayak_markers + canoe_markers + unrelated_markers:
        if m in q:
            # Check if there is an explicit river SUP marker overriding
            if not any(
                rk in q
                for rk in [
                    "river sup",
                    "river paddleboard",
                    "whitewater sup",
                    "whitewater stand-up paddleboard",
                    "whitewater stand up paddleboard",
                ]
            ):
                return None

    # Check for domain keywords
    river_sup_keywords = [
        "river sup",
        "river paddleboard",
        "river paddleboarding",
        "river stand up paddleboard",
        "river stand up paddleboarding",
        "river stand-up paddleboard",
        "river stand-up paddleboarding",
        "whitewater sup",
        "whitewater stand-up paddleboard",
        "whitewater stand-up paddleboarding",
        "whitewater stand up paddleboard",
        "whitewater stand up paddleboarding",
        "whitewater paddleboard",
        "whitewater paddleboarding",
        "browns canyon sup",
        "white salmon sup",
        "french broad sup",
        "deschutes river sup",
        "deschutes sup",
        "soca river sup",
        "soca sup",
        "flexible river fins",
        "river fins",
        "ankle leash danger",
        "ankle leash dangers",
        "ankle leash",
        "torso quick release",
        "quick release torso leash",
        "torso leash",
    ]

    has_domain_keyword = any(k in q for k in river_sup_keywords)

    # Check combinations:
    # 1. "river" and ("sup" or "paddleboard" or "paddleboarding")
    # 2. "whitewater" and ("sup" or "paddleboard" or "paddleboarding" or "pfd")
    has_river_and_sup = "river" in q and any(
        s in q for s in ["sup", "paddleboard", "paddleboarding"]
    )
    has_whitewater_and_sup = "whitewater" in q and any(
        s in q for s in ["sup", "paddleboard", "paddleboarding", "pfd"]
    )

    # 3. Known river reach name + sup/paddleboard/rapid
    has_river_name = any(
        r in q
        for r in [
            "browns canyon",
            "arkansas river",
            "white salmon",
            "husum",
            "french broad",
            "deschutes",
            "maupin",
            "soca",
            "soča",
            "kobarid",
        ]
    )
    has_sup_generic = any(s in q for s in ["sup", "paddleboard", "paddleboarding"])

    if not (
        has_domain_keyword
        or has_river_and_sup
        or has_whitewater_and_sup
        or (has_river_name and has_sup_generic)
    ):
        return None

    # Identify run_id
    run_id: Optional[str] = None
    if "browns canyon" in q or "arkansas river" in q:
        run_id = "arkansas-river-browns-canyon"
    elif "white salmon" in q or "husum" in q:
        run_id = "white-salmon-husum"
    elif "french broad" in q:
        run_id = "french-broad-section-9"
    elif "deschutes" in q or "maupin" in q:
        run_id = "deschutes-maupin-run"
    elif "soca" in q or "soča" in q or "kobarid" in q:
        run_id = "soca-kobarid-slalom"

    # Identify difficulty
    difficulty: Optional[str] = None
    if "class iv" in q or "class 4" in q:
        difficulty = "class_iv"
    elif "class iii" in q or "class 3" in q:
        difficulty = "class_iii"
    elif "class ii" in q or "class 2" in q:
        difficulty = "class_ii"

    # Determine action
    calculation_keywords = [
        "calculate",
        "calculation",
        "volume",
        "ratio",
        "payload",
        "stability",
        "buoyancy",
        "clearance",
        "fin",
        "fins",
        "leash",
        "ankle leash",
        "torso leash",
        "cfs",
        "flow",
        "danger",
        "dangers",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "kit",
        "equipment",
        "safety kit",
        "pfd",
        "helmet",
        "booties",
    ]
    detail_keywords = [
        "detail",
        "details",
        "about",
        "tell me about",
        "highlights",
        "duration",
        "miles",
        "gradient",
        "reach info",
        "rapid info",
        "trip",
    ]

    if any(k in q for k in calculation_keywords):
        action = "river_sup_calculation"
    elif any(k in q for k in gear_keywords):
        action = "gear_checklist"
    elif run_id and any(k in q for k in detail_keywords):
        action = "run_detail"
    elif run_id and not any(k in q for k in ["runs", "catalog", "reaches", "list"]):
        action = "run_detail"
    else:
        action = "runs_list"

    return RiverSupIntent(
        action=action,
        run_id=run_id,
        difficulty=difficulty,
    )


def build_river_sup_prompt(intent: RiverSupIntent) -> str:
    lines = [
        "Whitewater Stand-Up Paddleboarding (River SUP) Tooling & Safety System:",
        "- River SUP is distinct from flatwater paddling, requiring dedicated high-volume river boards, low-profile flexible fins, and quick-release chest leashes.",
        "- Mandatory River SUP Safety Kit Checklist (6 items):",
        "  1. Chest-Harness Quick-Release River Leash Belt with High-Visibility Toggle (leash_safety, mandatory)",
        "  2. Type V High-Buoyancy Whitewater PFD with Rescue Harness Ring (buoyancy, mandatory)",
        "  3. EN 1385 Certified Whitewater Drainage Helmet with Ear Protection (head_protection, mandatory)",
        "  4. Low-Profile 2-4 Inch Flexible Polyurethane River Fins for Shallow Clearance (fins, mandatory)",
        "  5. Durable Nylon/Carbon River SUP Paddle with Reinforced Tip (propulsion, mandatory)",
        "  6. 5mm Sticky Rubber Sole Neoprene River Booties with Ankle Protection (footwear, mandatory)",
        "- Critical River SUP Safety Rules:",
        "  - ANKLE LEASH HAZARD: Never use standard ankle leashes on rivers. Moving current pinning a paddler by an ankle leash is a fatal hazard. Only quick-release torso harness belts are permitted.",
        "  - SHALLOW CLEARANCE: Standard 8-9 inch touring fins cause abrupt boulder strikes and severe falls. Flexible 2-4 inch polyurethane fins are mandatory.",
        "  - BOARD VOLUME RATIO: Target 3.5 - 4.5 volume-to-weight ratio (liters per kg of total payload) for flotation in aerated whitewater.",
    ]

    if intent.run_id:
        run = get_river_sup_run_by_id(intent.run_id)
        if run:
            lines.append(
                f"- Featured River Reach: {run.title} ({run.river_system}, {run.region})\n"
                f"  Difficulty: {run.difficulty} ({run.difficulty.upper()}) | Length: {run.length_miles} miles | Gradient: {run.gradient_ft_per_mile} ft/mi\n"
                f"  Flow Range: {run.flow_range_cfs} | Duration: {run.typical_duration_hours}h\n"
                f"  Description: {run.description}\n"
                f"  Highlights: {', '.join(run.highlights)}"
            )
    else:
        runs = get_river_sup_runs(difficulty=intent.difficulty)
        runs_desc = ", ".join(f"{r.title} ({r.difficulty}, {r.length_miles} mi)" for r in runs)
        lines.append(f"- Available River SUP Reaches: {runs_desc}")

    return "\n".join(lines)


class FormattedRiverSupResponse(str):
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


def format_river_sup_response(intent: RiverSupIntent, query: str = "") -> FormattedRiverSupResponse:
    if intent.action == "river_sup_calculation":
        run_id = intent.run_id or "arkansas-river-browns-canyon"
        try:
            req = RiverSupCalculationRequest(run_id=run_id)
            calc = calculate_river_sup(req)
            answer = (
                f"River SUP Volume & Safety Analysis for {calc.run_title}: "
                f"Total payload: {calc.total_payload_kg} kg, Volume-to-Weight Ratio: {calc.volume_to_weight_ratio}. "
                f"Buoyancy Rating: {calc.buoyancy_rating} "
                f"Fin Clearance: {calc.fin_clearance_status} "
                f"Leash Safety: {calc.leash_safety_status} "
                f"Overall Safety Status: {calc.safety_status.upper()} (Stability Index: {calc.stability_index_percent}%). "
                f"{calc.paddling_advisory}"
            )
            data = {
                "answer": answer,
                "river_sup_info": {
                    "action": "river_sup_calculation",
                    "calculation": calc.model_dump(),
                },
            }
            return FormattedRiverSupResponse(answer, data)
        except Exception:
            pass

    if intent.action == "run_detail" and intent.run_id:
        run = get_river_sup_run_by_id(intent.run_id)
        if run:
            answer = (
                f"Whitewater River SUP Reach: {run.title} ({run.river_system}, {run.region}). "
                f"Difficulty: {run.difficulty.upper()} | Length: {run.length_miles} miles | "
                f"Gradient: {run.gradient_ft_per_mile} ft/mi | Flow: {run.flow_range_cfs} | Duration: {run.typical_duration_hours}h. "
                f"{run.description} Highlights: {', '.join(run.highlights)}."
            )
            data = {
                "answer": answer,
                "river_sup_info": {
                    "action": "run_detail",
                    "run": run.model_dump(),
                },
            }
            return FormattedRiverSupResponse(answer, data)

    if intent.action == "gear_checklist":
        gear = get_river_sup_gear()
        items_summary = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Mandatory River SUP Safety Kit Checklist (6 items): {items_summary}. "
            "WARNING: Never use an ankle leash in moving current; only quick-release torso harness leashes are approved."
        )
        data = {
            "answer": answer,
            "river_sup_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in gear],
            },
        }
        return FormattedRiverSupResponse(answer, data)

    # Default: runs_list
    runs = get_river_sup_runs(difficulty=intent.difficulty)
    summary = "; ".join(
        f"{r.title} ({r.river_system}, {r.difficulty.upper()}, {r.length_miles} mi, Flow: {r.flow_range_cfs})"
        for r in runs
    )
    answer = (
        f"Iconic Whitewater Stand-Up Paddleboard Reaches: {summary}. "
        "All river SUP runs require quick-release torso leashes and shallow flexible fins."
    )
    data = {
        "answer": answer,
        "river_sup_info": {
            "action": "runs_list",
            "runs": [r.model_dump() for r in runs],
            "difficulty": intent.difficulty,
        },
    }
    return FormattedRiverSupResponse(answer, data)
