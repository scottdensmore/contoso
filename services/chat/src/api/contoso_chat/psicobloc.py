from math import sqrt
from typing import Any, Optional

from pydantic import BaseModel, Field


class PsicoblocCragModel(BaseModel):
    crag_id: str
    title: str
    location: str
    country: str
    grade_range: str
    max_height_m: int
    rock_type: str
    water_type: str
    typical_water_depth_m: int
    boat_access_only: bool
    description: str
    highlights: list[str] = Field(default_factory=list)


class PsicoblocCalculationRequest(BaseModel):
    crag_id: str = "es-pontas-mallorca"
    climbing_height_m: float = 12.0
    water_depth_m: float = 7.0
    swell_height_m: float = 0.6
    tide_stage: str = "high_slack_tide"
    body_entry_position: str = "pencil_feet_first_pointed"


class PsicoblocCalculationResponse(BaseModel):
    crag_id: str
    crag_title: str
    impact_velocity_ms: float
    impact_velocity_kmh: float
    min_safe_depth_m: float
    depth_clearance_m: float
    entry_orientation_safety: str
    tide_swell_safety: str
    safety_status: str
    dive_advisory: str


class PsicoblocGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class PsicoblocIntent(BaseModel):
    action: str  # "crags_list", "crag_detail", "calculate_psicobloc", "gear_checklist"
    crag_id: Optional[str] = None
    rock_type: Optional[str] = None


class FormattedPsicoblocResponse(str):
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


DEFAULT_PSICOBLOC_CRAGS: dict[str, PsicoblocCragModel] = {
    "es-pontas-mallorca": PsicoblocCragModel(
        crag_id="es-pontas-mallorca",
        title="Es Pontàs Natural Sea Arch",
        location="Santanyí, Mallorca",
        country="Spain",
        grade_range="9a+ (5.15a)",
        max_height_m=20,
        rock_type="pocketed_limestone",
        water_type="sea",
        typical_water_depth_m=10,
        boat_access_only=False,
        description="World's most famous dyno over water, massive natural sea arch roof, and deep Mediterranean fall zone.",
        highlights=[
            "World's most famous dyno over water",
            "Massive natural sea arch roof",
            "Deep Mediterranean fall zone",
        ],
    ),
    "cala-barques-cave": PsicoblocCragModel(
        crag_id="cala-barques-cave",
        title="Cala Barques & Cova del Diable",
        location="Manacor, Mallorca",
        country="Spain",
        grade_range="6b - 8a (5.10d - 5.13b)",
        max_height_m=14,
        rock_type="tufa_limestone",
        water_type="sea",
        typical_water_depth_m=8,
        boat_access_only=False,
        description="Sheltered sea cave overhangs with abundant warm-up traverses and clear turquoise landing pools.",
        highlights=[
            "Sheltered sea cave overhangs",
            "Abundant warm-up traverses",
            "Clear turquoise landing pools",
        ],
    ),
    "railay-tonsai-krabi": PsicoblocCragModel(
        crag_id="railay-tonsai-krabi",
        title="Railay Beach & Tonsai Towers",
        location="Krabi, Andaman Sea",
        country="Thailand",
        grade_range="6a - 7c (5.10a - 5.12d)",
        max_height_m=16,
        rock_type="karst_limestone",
        water_type="sea",
        typical_water_depth_m=7,
        boat_access_only=True,
        description="Tide-dependent karst monoliths in warm tropical waters with longtail boat access and safety watch.",
        highlights=[
            "Tide-dependent karst monoliths",
            "Longtail boat access & safety watch",
            "Warm tropical waters & deep channels",
        ],
    ),
    "swanage-conner-cove": PsicoblocCragModel(
        crag_id="swanage-conner-cove",
        title="Conner Cove & Portland Coast",
        location="Dorset Jurassic Coast",
        country="UK",
        grade_range="6b - 7b+ (5.10d - 5.12c)",
        max_height_m=12,
        rock_type="pocketed_limestone",
        water_type="sea",
        typical_water_depth_m=6,
        boat_access_only=False,
        description="Tide-critical Atlantic swell crags with scramble exit traverses and marine rope ladder ascents in cool ocean waters.",
        highlights=[
            "Tide-critical Atlantic swell crags",
            "Scramble exit traverses with rope ladders",
            "Cool ocean waters requiring swift exits",
        ],
    ),
    "summersville-lake-wv": PsicoblocCragModel(
        crag_id="summersville-lake-wv",
        title="Pirate's Cove & Long Point",
        location="Summersville Lake, WV",
        country="USA",
        grade_range="5.9 - 5.13a",
        max_height_m=15,
        rock_type="marine_sandstone",
        water_type="freshwater_lake",
        typical_water_depth_m=18,
        boat_access_only=True,
        description="Premier freshwater deep water soloing destination with warm summer water, boat pickup, and safe deep drop zone.",
        highlights=[
            "Premier freshwater deep water soloing",
            "Warm freshwater summer jumping",
            "Boat pickup & safe deep drop zone",
        ],
    ),
}

DEFAULT_PSICOBLOC_GEAR: list[PsicoblocGearRequirement] = [
    PsicoblocGearRequirement(
        item_id="liquid-chalk-water-resistant",
        name="Quick-Drying Resin-Enhanced Liquid Chalk Tube for Salt Spray Resistance",
        category="friction",
        mandatory=True,
        purpose="Provides a humidity-resistant friction base that prevents slip off damp sea cliff holds.",
    ),
    PsicoblocGearRequirement(
        item_id="quick-drain-climbing-shoes",
        name="Multiple Pairs of Snug Synthetic Climbing Shoes for Rotating Dry Spares",
        category="footwear",
        mandatory=True,
        purpose="Enables rotating dry shoes between soloing attempts without leather stretching or sole slipping.",
    ),
    PsicoblocGearRequirement(
        item_id="floating-drybag-chalkbag",
        name="Floating Water-Sealed Roll-Top Chalk Bag with Waterproof Waist Belt",
        category="chalk_containment",
        mandatory=True,
        purpose="Secures chalk against water saturation upon impact and floats to surface for rapid recovery.",
    ),
    PsicoblocGearRequirement(
        item_id="weighted-cliff-exit-ladder",
        name="15m Heavy-Duty Marine Rope Ladder with Steel Spreader Rungs for Cliff Exit",
        category="exit_ascent",
        mandatory=True,
        purpose="Provides emergency re-ascent capability from surge channels back up onto safety ledges.",
    ),
    PsicoblocGearRequirement(
        item_id="high-visibility-swim-buoy",
        name="Inflatable Safety Swim Tow Float with Integrated Whistle for Rescues",
        category="buoyancy",
        mandatory=True,
        purpose="Ensures immediate swimmer resting buoyancy and visual signaling for safety boats.",
    ),
    PsicoblocGearRequirement(
        item_id="microfiber-chamois-towels",
        name="High-Absorption Quick-Dry Microfiber Chamois Towels for Rapid Sole Drying",
        category="drying",
        mandatory=True,
        purpose="Dries shoe rubber and hands thoroughly between falls to preserve precision foot placement.",
    ),
]


def get_psicobloc_crags(rock_type: Optional[str] = None) -> list[PsicoblocCragModel]:
    crags = list(DEFAULT_PSICOBLOC_CRAGS.values())
    if not rock_type:
        return crags
    norm = rock_type.strip().lower().replace("-", "_").replace(" ", "_")
    return [c for c in crags if c.rock_type.lower() == norm]


def get_psicobloc_crag_by_id(crag_id: str) -> Optional[PsicoblocCragModel]:
    return DEFAULT_PSICOBLOC_CRAGS.get(crag_id.strip().lower())


def get_psicobloc_gear() -> list[PsicoblocGearRequirement]:
    return list(DEFAULT_PSICOBLOC_GEAR)


def calculate_psicobloc(request: PsicoblocCalculationRequest) -> PsicoblocCalculationResponse:
    crag = get_psicobloc_crag_by_id(request.crag_id)
    if not crag:
        raise ValueError(f"Psicobloc crag '{request.crag_id}' not found")

    h = request.climbing_height_m
    w = request.water_depth_m
    s = request.swell_height_m
    t = request.tide_stage
    pos = request.body_entry_position

    # Impact velocity: v = sqrt(2 * g * h) where g = 9.81
    impact_velocity_ms = round(sqrt(2 * 9.81 * h) * 10) / 10
    impact_velocity_kmh = round(impact_velocity_ms * 3.6 * 10) / 10

    # Minimum safe water depth: 2.5 + 0.3 * height
    min_safe_depth_m = round((2.5 + 0.3 * h) * 10) / 10
    depth_clearance_m = round((w - min_safe_depth_m) * 10) / 10

    # Safety status evaluation
    if w < min_safe_depth_m or pos == "flat_back_or_belly" or s > 2.0:
        safety_status = "hazardous_prohibited"
    elif h > 16.0 or s > 1.0 or t == "low_dead_tide":
        safety_status = "caution_high_risk"
    else:
        safety_status = "approved"

    # Entry orientation safety advisory
    if pos == "flat_back_or_belly":
        entry_orientation_safety = (
            "CRITICAL IMPACT TRAUMA: Flat back or belly flop from height causes severe hydrostatic "
            "deceleration trauma, internal organ contusions, and loss of consciousness. Always maintain strict vertical pencil dive."
        )
    elif pos == "feet_first_arms_flailing":
        entry_orientation_safety = (
            "HIGH RISK OF SHOULDER DISLOCATION: Flailing arms upon water entry create extreme hydrodynamic leverage "
            "that can dislocate shoulders or cause head impact. Pin arms firmly across chest or tight to sides."
        )
    else:
        entry_orientation_safety = (
            "OPTIMAL ENTRY ORIENTATION: Vertical pencil entry with toes pointed downward and legs locked minimizes "
            "surface impact shock and controls deceleration depth."
        )

    # Tide and swell safety advisory
    if s > 2.0:
        tide_swell_safety = (
            f"DANGEROUS SEA SWELL ({s:.1f}m): Violent oceanic surge and rebound wash against sea cliff base "
            "create deadly undertow and high collision hazard against underwater ledges. Soloing strictly prohibited."
        )
    elif s > 1.0 or t == "low_dead_tide":
        tide_swell_safety = (
            f"MARGINAL SWELL/TIDE CONDITIONS ({s:.1f}m swell, {t}): Elevated surge turbulence or shallow water depth "
            "over subsea boulders. Time water entries with incoming wave crests and verify spotter readiness."
        )
    else:
        tide_swell_safety = f"FAVORABLE SEA STATE ({s:.1f}m swell, {t}): Moderate water movement and adequate depth provide clear landing visibility and manageable exit swims."

    # Dive advisory
    if safety_status == "hazardous_prohibited":
        dive_advisory = "PROHIBITED JUMP/FALL ZONE: Shallow clearance, dangerous swell, or hazardous entry orientation creates unacceptable trauma risk. Abort climb or await high tide and calm seas."
    elif safety_status == "caution_high_risk":
        dive_advisory = "HIGH RISK ADVISORY: Fall height exceeds 16m, swell is elevated, or dead low tide reduces margin. Certified rescue boat and marine rope ladders must be active."
    else:
        dive_advisory = "APPROVED PSICOBLOC PROFILE: Water depth clearance and entry trajectory meet safe fall criteria. Confirm exit ladder line is deployed before starting."

    return PsicoblocCalculationResponse(
        crag_id=crag.crag_id,
        crag_title=crag.title,
        impact_velocity_ms=impact_velocity_ms,
        impact_velocity_kmh=impact_velocity_kmh,
        min_safe_depth_m=min_safe_depth_m,
        depth_clearance_m=depth_clearance_m,
        entry_orientation_safety=entry_orientation_safety,
        tide_swell_safety=tide_swell_safety,
        safety_status=safety_status,
        dive_advisory=dive_advisory,
    )


def detect_psicobloc_intent(query: str) -> Optional[PsicoblocIntent]:
    if not query or not query.strip():
        return None

    q = query.lower()

    # Disambiguation guards:
    # 1. Indoor gyms
    gym_exclusions = [
        "bouldering gym",
        "climbing gym",
        "indoor gym",
        "gym membership",
        "gym pass",
        "gym",
    ]
    if any(g in q for g in gym_exclusions):
        return None

    # 2. Lead/trad rock climbing with ropes & hardware
    rope_exclusions = [
        "quickdraws",
        "quickdraw",
        "harness",
        "belay device",
        "belayer",
        "trad rack",
        "camalot",
        "camalots",
        "climbing rope",
        "lead climbing",
        "sport lead",
    ]
    if any(r in q for r in rope_exclusions):
        return None

    # 3. Deep sea fishing
    fishing_exclusions = [
        "fishing rod",
        "trolling",
        "deep sea charter",
        "charter",
        "tackle box",
        "deep sea fishing",
        "marlin",
        "halibut",
        "anglers",
    ]
    if any(f in q for f in fishing_exclusions):
        return None

    # 4. Ecommerce & order tracking
    ecommerce_exclusions = [
        "refund",
        "order #",
        "return label",
        "shipping tracking",
        "track my order",
    ]
    if any(e in q for e in ecommerce_exclusions):
        return None

    # Psicobloc / DWS keywords
    keywords = [
        "psicobloc",
        "psico",
        "deep water solo",
        "deep water soloing",
        "dws",
        "sea cliff",
        "es pontas",
        "cala barques",
        "cova del diable",
        "railay",
        "tonsai",
        "conner cove",
        "summersville lake",
        "summersville",
        "pencil dive",
        "liquid chalk",
        "floating chalk",
        "marine rope ladder",
        "rope ladder",
        "cliff exit ladder",
        "swim buoy",
        "chamois",
    ]
    if not any(k in q for k in keywords):
        return None

    # Extract crag_id
    crag_id: Optional[str] = None
    if "pontas" in q or "es pontàs" in q:
        crag_id = "es-pontas-mallorca"
    elif "barques" in q or "cova del diable" in q:
        crag_id = "cala-barques-cave"
    elif "railay" in q or "tonsai" in q:
        crag_id = "railay-tonsai-krabi"
    elif "conner" in q or "swanage" in q or "portland" in q:
        crag_id = "swanage-conner-cove"
    elif "summersville" in q or "pirate's cove" in q or "long point" in q:
        crag_id = "summersville-lake-wv"

    # Extract rock_type
    rock_type: Optional[str] = None
    if "pocketed" in q or "pocketed_limestone" in q:
        rock_type = "pocketed_limestone"
    elif "tufa" in q or "tufa_limestone" in q:
        rock_type = "tufa_limestone"
    elif "karst" in q or "karst_limestone" in q:
        rock_type = "karst_limestone"
    elif "sandstone" in q or "marine_sandstone" in q:
        rock_type = "marine_sandstone"

    # Determine action
    if any(
        c in q
        for c in [
            "calculate",
            "calculation",
            "impact velocity",
            "velocity",
            "minimum safe water depth",
            "water depth clearance",
            "depth clearance",
            "safe depth",
            "pencil dive",
            "belly flop",
            "fall clearance",
            "entry position",
        ]
    ):
        action = "calculate_psicobloc"
    elif any(
        g in q
        for g in [
            "gear",
            "checklist",
            "equipment",
            "liquid chalk",
            "floating chalk",
            "rope ladder",
            "exit ladder",
            "swim buoy",
            "chamois",
            "safety kit",
        ]
    ):
        action = "gear_checklist"
    elif crag_id and not any(term in q for term in ["where", "list", "all crags", "filter"]):
        action = "crag_detail"
    else:
        action = "crags_list"

    return PsicoblocIntent(action=action, crag_id=crag_id, rock_type=rock_type)


def extract_psicobloc_intent(query: str) -> Optional[PsicoblocIntent]:
    return detect_psicobloc_intent(query)


def build_psicobloc_prompt(intent: PsicoblocIntent) -> str:
    lines = [
        "Contoso Deep Water Soloing (Psicobloc) & Sea Cliff Bouldering Expert Assistant Knowledge:",
        "- Deep water soloing (psicobloc) is free solo climbing on sea cliffs over deep water without ropes, harnesses, or hardware.",
        "- Core physics: Impact velocity is calculated as v = sqrt(2 * g * h) where g = 9.81 m/s².",
        "- Minimum safe water depth requirement: d_min = 2.5m + 0.3 * height (meters).",
        "- Critical safety: Always enter water in strict pencil dive posture (vertical, toes pointed down, legs pressed tight, arms pinned across chest or tight to sides). Flat back or belly flop impacts cause hydrostatic organ trauma.",
        "- Swell & tide: Solos are prohibited when ocean swell exceeds 2.0m. Caution is advised for swells > 1.0m or low dead tides.",
        "- Sea cliff exits: Climbers require pre-rigged marine rope ladders with rigid rungs, safety watch boats, or swim buoys to exit water safely.",
        "- 5 Iconic Crags: Es Pontàs (Santanyí, Mallorca), Cala Barques (Manacor, Mallorca), Railay Beach & Tonsai (Krabi, Thailand), Conner Cove (Swanage, Dorset, UK), Summersville Lake (WV, USA).",
        "- Mandatory 6-Item Safety Kit: Liquid chalk tube, quick-drain climbing shoes, floating roll-top chalk bag, 15m marine rope ladder, high-visibility swim buoy, and microfiber chamois towels.",
    ]

    if intent.action == "crag_detail" and intent.crag_id:
        crag = get_psicobloc_crag_by_id(intent.crag_id)
        if crag:
            lines.append(
                f"- Selected Crag: {crag.title} ({crag.location}, {crag.country}). Grade: {crag.grade_range}, "
                f"Max Height: {crag.max_height_m}m, Rock: {crag.rock_type}, Typical Depth: {crag.typical_water_depth_m}m, Boat Access Only: {crag.boat_access_only}. Highlights: {', '.join(crag.highlights)}."
            )
    elif intent.action == "calculate_psicobloc":
        lines.append(
            "- Action: Calculate impact velocity, safe depth clearance, entry orientation safety, and tide/swell hazards for user fall height."
        )
    elif intent.action == "gear_checklist":
        lines.append(
            "- Action: Present the mandatory 6-item Psicobloc / DWS safety kit checklist and purpose for each item."
        )

    return "\n".join(lines)


def format_psicobloc_response(intent: PsicoblocIntent, query: str) -> FormattedPsicoblocResponse:
    action = intent.action

    if action == "crags_list":
        crags = get_psicobloc_crags(intent.rock_type)
        items_summary = "\n".join(
            [
                f"- **{c.title}** ({c.location}, {c.country}): Grade {c.grade_range}, max height {c.max_height_m}m, "
                f"rock type `{c.rock_type}`, water depth {c.typical_water_depth_m}m{' (Boat Access Only)' if c.boat_access_only else ''}."
                for c in crags
            ]
        )
        answer = (
            f"Here are top Deep Water Soloing (Psicobloc) destinations{' for rock type ' + intent.rock_type if intent.rock_type else ''}:\n\n"
            f"{items_summary}\n\n"
            "Always inspect landing zones for subsea reefs, time entries with swell crests, and rig marine exit ladders."
        )
        crags_data: dict[str, Any] = {
            "action": "crags_list",
            "rock_type": intent.rock_type,
            "crags": [c.model_dump() for c in crags],
        }
        return FormattedPsicoblocResponse(answer, {"psicobloc_info": crags_data, "answer": answer})

    elif action == "crag_detail" and intent.crag_id:
        crag = get_psicobloc_crag_by_id(intent.crag_id)
        if crag:
            highlights_text = "\n".join([f"  * {h}" for h in crag.highlights])
            answer = (
                f"### {crag.title}\n"
                f"- **Location**: {crag.location}, {crag.country}\n"
                f"- **Grade Range**: {crag.grade_range}\n"
                f"- **Max Solo Height**: {crag.max_height_m}m\n"
                f"- **Rock & Water**: `{crag.rock_type}` over {crag.water_type} (Typical depth: {crag.typical_water_depth_m}m)\n"
                f"- **Access**: {'Boat access strictly required' if crag.boat_access_only else 'Scramble or swim in from shore'}\n"
                f"- **Description**: {crag.description}\n"
                f"- **Highlights**:\n{highlights_text}\n"
            )
            detail_data: dict[str, Any] = {
                "action": "crag_detail",
                "crag": crag.model_dump(),
            }
            return FormattedPsicoblocResponse(
                answer, {"psicobloc_info": detail_data, "answer": answer}
            )

    elif action == "calculate_psicobloc":
        req = PsicoblocCalculationRequest(
            crag_id=intent.crag_id or "es-pontas-mallorca",
        )
        res = calculate_psicobloc(req)
        answer = (
            f"### Psicobloc Fall Velocity & Safe Depth Clearance ({res.crag_title})\n"
            f"- **Climbing Height**: {req.climbing_height_m}m\n"
            f"- **Impact Velocity**: {res.impact_velocity_ms} m/s ({res.impact_velocity_kmh} km/h)\n"
            f"- **Min Safe Water Depth**: {res.min_safe_depth_m}m (Clearance: {res.depth_clearance_m}m)\n"
            f"- **Safety Status**: `{res.safety_status.upper()}`\n"
            f"- **Body Entry Advisory**: {res.entry_orientation_safety}\n"
            f"- **Tide & Swell**: {res.tide_swell_safety}\n"
            f"- **Dive Recommendation**: {res.dive_advisory}"
        )
        calc_data: dict[str, Any] = {
            "action": "calculate_psicobloc",
            "calculation": res.model_dump(),
        }
        return FormattedPsicoblocResponse(answer, {"psicobloc_info": calc_data, "answer": answer})

    elif action == "gear_checklist":
        gear = get_psicobloc_gear()
        gear_lines = "\n".join([f"- **{g.name}** ({g.category}): {g.purpose}" for g in gear])
        answer = (
            "### Mandatory Deep Water Soloing (Psicobloc) Safety Kit Checklist:\n\n"
            f"{gear_lines}\n\n"
            "Pre-rig your marine rope exit ladder and confirm spotter positions before leaving the deck."
        )
        gear_data: dict[str, Any] = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
        }
        return FormattedPsicoblocResponse(answer, {"psicobloc_info": gear_data, "answer": answer})

    # Fallback to crags_list
    crags = get_psicobloc_crags()
    fallback_data: dict[str, Any] = {
        "action": "crags_list",
        "crags": [c.model_dump() for c in crags],
    }
    answer = f"Found {len(crags)} iconic psicobloc destinations worldwide. Es Pontàs, Cala Barques, Railay, Conner Cove, and Summersville Lake."
    return FormattedPsicoblocResponse(answer, {"psicobloc_info": fallback_data, "answer": answer})
