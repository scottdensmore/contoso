import math
from typing import Any, Optional

from pydantic import BaseModel


class FalconryGroundModel(BaseModel):
    ground_id: str
    title: str
    region: str
    territory: str
    elevation_m: int
    primary_species: str
    flight_style: str
    description: str
    highlights: list[str]


class FalconryRequest(BaseModel):
    ground_id: str = "sagebrush-sea-wyoming"
    raptor_species: str = "peregrine_falcon"
    base_molt_weight_grams: float = 900.0
    target_weight_grams: float = 790.0
    pitch_altitude_m: float = 250.0
    ambient_temp_c: float = 10.0


class FalconryResponse(BaseModel):
    ground_id: str
    ground_title: str
    raptor_species: str
    weight_deviation_percent: float
    conditioning_status: str
    estimated_stoop_speed_mph: float
    telemetry_range_km: float
    weight_conditioning_advisory: str
    flight_recovery_guidance: str


class FalconryGearModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class FalconryIntent(BaseModel):
    action: str
    ground_id: str | None = None
    raptor_species: str | None = None

    def __bool__(self) -> bool:
        return bool(self.action)


class FormattedFalconryResponse(str):
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


DEFAULT_FALCONRY_GROUNDS: dict[str, FalconryGroundModel] = {
    "sagebrush-sea-wyoming": FalconryGroundModel(
        ground_id="sagebrush-sea-wyoming",
        title="Red Desert High Steppe & Sagebrush Sea",
        region="Sweetwater County, Wyoming, USA",
        territory="Great Divide Basin",
        elevation_m=2100,
        primary_species="gyrfalcon",
        flight_style="level_speed_pursuit",
        description="Vast open sagebrush steppe in the high desert basin providing expansive unobstructed airspace for sustained horizontal speed chases.",
        highlights=[
            "Vast open sagebrush terrain",
            "Thermal ridge lift updrafts",
            "Wide-angle biotelemetry tracking lines",
        ],
    ),
    "snake-river-birds-of-prey": FalconryGroundModel(
        ground_id="snake-river-birds-of-prey",
        title="Morley Nelson Snake River Birds of Prey NCA",
        region="Owyhee Canyonlands, Idaho, USA",
        territory="Snake River Canyon",
        elevation_m=950,
        primary_species="peregrine_falcon",
        flight_style="high_pitch_stoop",
        description="Sheer basalt canyon walls and powerful vertical thermals allowing falcons to mount massive waiting-on pitches before plunging vertical stoops.",
        highlights=[
            "Basalt canyon wall updrafts",
            "High-pitch 1,000ft waiting-on altitudes",
            "Dramatic vertical stoop acoustics",
        ],
    ),
    "san-luis-valley-alpine-plateau": FalconryGroundModel(
        ground_id="san-luis-valley-alpine-plateau",
        title="San Luis Valley High Desert Falconry Grounds",
        region="San Luis Basin, Colorado, USA",
        territory="Sangre de Cristo Foothills",
        elevation_m=2300,
        primary_species="peregrine_falcon",
        flight_style="high_pitch_stoop",
        description="Expansive high-elevation alpine desert plateau flanked by 14,000ft peaks, offering dense cold air and clear horizon lines for falconry flights.",
        highlights=[
            "Dense cold alpine air density",
            "Wide-open agricultural stubble fields",
            "Clear mountain horizon lines",
        ],
    ),
    "sonoran-desert-bajada": FalconryGroundModel(
        ground_id="sonoran-desert-bajada",
        title="Sonoran Saguaro Scrub & Bajada Washes",
        region="Pima County, Arizona, USA",
        territory="Sonoran Desert Bajadas",
        elevation_m=750,
        primary_species="harriss_hawk",
        flight_style="pack_cast_maneuver",
        description="Arid desert bajada with saguaro scrub and dry washes, ideal for cooperative social pack cast hunting and agile desert brush maneuvers.",
        highlights=[
            "Cast flying social hunting dynamics",
            "Tight desert brush navigation",
            "High-heat hydration protocols",
        ],
    ),
    "bighorn-basin-badlands": FalconryGroundModel(
        ground_id="bighorn-basin-badlands",
        title="Bighorn Basin Rimrock & Shoshone Ridge",
        region="Park County, Wyoming, USA",
        territory="Absaroka Foothills",
        elevation_m=1600,
        primary_species="golden_eagle",
        flight_style="perch_ridge_soaring",
        description="Rugged sandstone badlands and rimrock escarpments providing strong ridge deflection winds for soaring heavy eagles over mountainous terrain.",
        highlights=[
            "High-exposure rimrock launch points",
            "Strong mountain ridge deflection winds",
            "Heavy-quarry mountain terrain",
        ],
    ),
}

DEFAULT_FALCONRY_GEAR: list[FalconryGearModel] = [
    FalconryGearModel(
        item_id="vhf-gps-telemetry-transmitter",
        name="Dual-Frequency 216MHz VHF Tail-Mount & Micro-GPS Backpack",
        category="telemetry",
        mandatory=True,
        purpose="Precision dual-mode tracking ensuring raptor recovery over mountain ridges and distant draws",
    ),
    FalconryGearModel(
        item_id="elk-hide-falconry-gauntlet",
        name="Reinforced Triple-Layer Elk-Hide Gauntlet with D-Ring Tether",
        category="gauntlet",
        mandatory=True,
        purpose="Heavy puncture-resistant leather gauntlet protecting against razor-sharp talons and crushing grip pressure",
    ),
    FalconryGearModel(
        item_id="handcrafted-aylmeri-jesses",
        name="Kangaroo Leather Aylmeri Anklets, Field Jesses & Sampo Swivel",
        category="furniture",
        mandatory=True,
        purpose="High-tensile kangaroo leather field jesses preventing tangled legs during perch landings and flights",
    ),
    FalconryGearModel(
        item_id="dutch-blocked-raptor-hood",
        name="Calibrated Dutch Roll-Top Kipskin Leather Hunting Hood",
        category="furniture",
        mandatory=True,
        purpose="Precision-molded leather hood keeping the raptor calm and focused until quarry is spotted",
    ),
    FalconryGearModel(
        item_id="digital-gram-field-scale",
        name="Precision 0.1g Digital Field Perch Scale with T-Bar Mount",
        category="conditioning",
        mandatory=True,
        purpose="Daily flying weight monitoring ensuring optimal response motivation without dangerous starvation",
    ),
    FalconryGearModel(
        item_id="feathered-leather-training-lure",
        name="Weighted Leather Horseshoe Lure with Fresh Meat Attachment Thongs",
        category="recall",
        mandatory=True,
        purpose="Aerodynamic recall lure simulating natural quarry for conditioning and immediate field retrieval",
    ),
]


def get_falconry_grounds(species: Optional[str] = None) -> list[FalconryGroundModel]:
    """Retrieve catalog of falconry hunting grounds, optionally filtered by raptor species."""
    grounds = list(DEFAULT_FALCONRY_GROUNDS.values())
    if species:
        target = species.lower().replace("-", "_").replace(" ", "_")
        if target in ("harris_hawk", "harriss_hawk"):
            grounds = [g for g in grounds if g.primary_species in ("harris_hawk", "harriss_hawk")]
        else:
            grounds = [g for g in grounds if g.primary_species == target]
    return grounds


def get_falconry_ground(ground_id: str) -> Optional[FalconryGroundModel]:
    """Retrieve specific falconry hunting ground by identifier."""
    return DEFAULT_FALCONRY_GROUNDS.get(ground_id)


def calculate_raptor_conditioning(req: FalconryRequest) -> FalconryResponse:
    """Calculate raptor weight conditioning status, stoop speed, and biotelemetry line-of-sight range."""
    ground = get_falconry_ground(req.ground_id)
    if not ground:
        raise ValueError(f"Falconry ground '{req.ground_id}' not found")

    weight_deviation_percent = round(
        ((req.target_weight_grams - req.base_molt_weight_grams) / req.base_molt_weight_grams)
        * 100.0,
        1,
    )

    if weight_deviation_percent > -5.0:
        conditioning_status = "lethargic_overfed"
        weight_advisory = (
            f"Raptor weight is {weight_deviation_percent}% relative to molt weight. "
            "Lethargic motivation; high risk of ignoring recall lure, drifting on thermals, or perching out."
        )
    elif weight_deviation_percent >= -14.0:
        conditioning_status = "prime_hunting_condition"
        weight_advisory = (
            f"Raptor weight is {weight_deviation_percent}% relative to molt weight. "
            "Prime hunting condition with peak athletic response, strong hunting drive, and instant recall response."
        )
    elif weight_deviation_percent >= -18.0:
        conditioning_status = "keen_hyper_responsive"
        weight_advisory = (
            f"Raptor weight is {weight_deviation_percent}% relative to molt weight. "
            "Keen, hyper-responsive condition with high hunting motivation; monitor closely for bating fatigue and cold weather caloric depletion."
        )
    else:
        conditioning_status = "starvation_danger_lethal"
        weight_advisory = (
            f"CRITICAL DANGER: Raptor weight is {weight_deviation_percent}% relative to molt weight. "
            "Severe starvation risk with muscle wasting and metabolic collapse. Feed immediately to restore minimum flying weight."
        )

    species_norm = req.raptor_species.lower().replace("-", "_").replace(" ", "_")
    if species_norm in ("harris_hawk", "harriss_hawk"):
        stoop_speed = min(
            75.0, round(math.sqrt(2 * 9.81 * req.pitch_altitude_m * 0.35) * 2.23694, 1)
        )
    elif species_norm == "peregrine_falcon":
        stoop_speed = min(
            240.0, round(math.sqrt(2 * 9.81 * req.pitch_altitude_m * 0.82) * 2.23694, 1)
        )
    elif species_norm == "gyrfalcon":
        stoop_speed = min(
            190.0, round(math.sqrt(2 * 9.81 * req.pitch_altitude_m * 0.70) * 2.23694, 1)
        )
    elif species_norm == "red_tailed_hawk":
        stoop_speed = min(
            85.0, round(math.sqrt(2 * 9.81 * req.pitch_altitude_m * 0.40) * 2.23694, 1)
        )
    elif species_norm == "golden_eagle":
        stoop_speed = min(
            160.0, round(math.sqrt(2 * 9.81 * req.pitch_altitude_m * 0.65) * 2.23694, 1)
        )
    else:
        stoop_speed = min(
            150.0, round(math.sqrt(2 * 9.81 * req.pitch_altitude_m * 0.50) * 2.23694, 1)
        )

    telemetry_range_km = round(math.sqrt(req.pitch_altitude_m) * 1.8 + 12.0, 1)
    flight_guidance = (
        f"Estimated line-of-sight biotelemetry range: {telemetry_range_km} km at {req.pitch_altitude_m}m pitch altitude. "
        "Deploy 216MHz VHF directional Yagi antenna and check GPS backpack coordinates immediately upon release over ridge lines. "
        "Keep weighted recall lure ready for immediate recovery."
    )

    return FalconryResponse(
        ground_id=ground.ground_id,
        ground_title=ground.title,
        raptor_species=req.raptor_species,
        weight_deviation_percent=weight_deviation_percent,
        conditioning_status=conditioning_status,
        estimated_stoop_speed_mph=stoop_speed,
        telemetry_range_km=telemetry_range_km,
        weight_conditioning_advisory=weight_advisory,
        flight_recovery_guidance=flight_guidance,
    )


def get_falconry_gear_checklist() -> list[FalconryGearModel]:
    """Retrieve mandatory falconry and raptor handling equipment checklist."""
    return DEFAULT_FALCONRY_GEAR


def detect_falconry_intent(text: str) -> Optional[FalconryIntent]:
    """Detect whether user query targets falconry, raptor handling, or flight calculations."""
    if not text or not text.strip():
        return None

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
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in exclusions):
        return None

    matched_ground_id: Optional[str] = None
    if "snake river" in q:
        matched_ground_id = "snake-river-birds-of-prey"
    elif (
        "sagebrush sea" in q
        or "red desert" in q
        or ("sagebrush" in q and "sea" in q)
        or "wyoming steppe" in q
        or "great divide basin" in q
    ):
        matched_ground_id = "sagebrush-sea-wyoming"
    elif "san luis valley" in q or "san luis" in q:
        matched_ground_id = "san-luis-valley-alpine-plateau"
    elif "sonoran" in q or "bajada" in q:
        matched_ground_id = "sonoran-desert-bajada"
    elif "bighorn basin" in q or "bighorn" in q or "shoshone ridge" in q:
        matched_ground_id = "bighorn-basin-badlands"

    matched_species: Optional[str] = None
    if "peregrine" in q:
        matched_species = "peregrine_falcon"
    elif "gyrfalcon" in q or " gyr " in f" {q} ":
        matched_species = "gyrfalcon"
    elif "harris hawk" in q or "harriss hawk" in q or "harris's hawk" in q or "harris" in q:
        matched_species = "harriss_hawk"
    elif "red-tailed" in q or "red tail" in q or "red tailed" in q or "redtailed" in q:
        matched_species = "red_tailed_hawk"
    elif "golden eagle" in q or "eagle" in q:
        matched_species = "golden_eagle"

    falconry_terms = [
        "falconry",
        "raptor",
        "free-flight",
        "free flight",
        "stoop",
        "pitch altitude",
        "waiting-on",
        "waiting on",
        "cast hunting",
        "aylmeri",
        "jesses",
        "falconry hood",
        "hunting hood",
        "perch scale",
        "recall lure",
        "gauntlet",
        "molt weight",
        "flying weight",
        "weight calibration",
        "biotelemetry",
        "216mhz",
        "telemetry",
    ]

    has_falconry_term = any(term in q for term in falconry_terms)

    if not (has_falconry_term or matched_ground_id or matched_species):
        return None

    if any(
        k in q
        for k in [
            "calculate",
            "calc",
            "stoop speed",
            "stoop",
            "speed",
            "velocity",
            "weight calibration",
            "flying weight",
            "molt weight",
            "weight",
            "conditioning",
            "telemetry range",
        ]
    ):
        action = "calculate_conditioning"
    elif any(
        k in q
        for k in [
            "gear",
            "checklist",
            "equipment",
            "furniture",
            "aylmeri",
            "jesses",
            "hood",
            "gauntlet",
            "lure",
            "scale",
            "transmitter",
            "telemetry tracking",
        ]
    ):
        action = "gear_checklist"
    elif matched_ground_id and any(
        k in q
        for k in [
            "about",
            "tell me",
            "describe",
            "elevation",
            "highlights",
            "detail",
        ]
    ):
        action = "ground_detail"
    elif matched_ground_id and not any(
        k in q for k in ["grounds", "catalog", "list", "options", "territories"]
    ):
        action = "ground_detail"
    else:
        action = "grounds_list"

    return FalconryIntent(
        action=action,
        ground_id=matched_ground_id,
        raptor_species=matched_species,
    )


def format_falconry_response(
    intent: Any,
    req: Optional[Any] = None,
) -> FormattedFalconryResponse:
    """Format structured responses and answer text for falconry queries."""
    if isinstance(intent, FalconryResponse):
        calc = intent
        answer = (
            f"Wilderness Falconry Flight Analysis for {calc.ground_title}: "
            f"Raptor species: {calc.raptor_species.replace('_', ' ').title()}. "
            f"Weight deviation is {calc.weight_deviation_percent}% ({calc.conditioning_status.replace('_', ' ').title()}). "
            f"Estimated stoop speed: {calc.estimated_stoop_speed_mph} mph. "
            f"Line-of-sight biotelemetry range: {calc.telemetry_range_km} km. "
            f"{calc.weight_conditioning_advisory} {calc.flight_recovery_guidance}"
        )
        resp_calc_info: dict[str, Any] = {
            "falconry_info": {
                "action": "calculate_conditioning",
                "ground_id": calc.ground_id,
                "calculation": calc.model_dump(),
            },
            "answer": answer,
        }
        return FormattedFalconryResponse(answer, resp_calc_info)

    if isinstance(intent, dict):
        if "falconry_info" in intent and "answer" in intent:
            return FormattedFalconryResponse(str(intent["answer"]), intent)
        parsed_intent = (
            FalconryIntent(**intent)
            if "action" in intent
            else (
                detect_falconry_intent(str(req) or str(intent))
                or FalconryIntent(action="grounds_list")
            )
        )
    elif isinstance(intent, FalconryIntent):
        parsed_intent = intent
    else:
        parsed_intent = detect_falconry_intent(str(intent)) or FalconryIntent(action="grounds_list")

    if parsed_intent.action in ("calculate_conditioning", "calculate"):
        calc_req = (
            req
            if isinstance(req, FalconryRequest)
            else FalconryRequest(
                ground_id=parsed_intent.ground_id or "sagebrush-sea-wyoming",
                raptor_species=parsed_intent.raptor_species or "peregrine_falcon",
            )
        )
        calc_res = calculate_raptor_conditioning(calc_req)
        answer = (
            f"Wilderness Falconry Flight Analysis for {calc_res.ground_title}: "
            f"Raptor species: {calc_res.raptor_species.replace('_', ' ').title()}. "
            f"Weight deviation is {calc_res.weight_deviation_percent}% ({calc_res.conditioning_status.replace('_', ' ').title()}). "
            f"Estimated stoop speed: {calc_res.estimated_stoop_speed_mph} mph. "
            f"Line-of-sight biotelemetry range: {calc_res.telemetry_range_km} km. "
            f"{calc_res.weight_conditioning_advisory} {calc_res.flight_recovery_guidance}"
        )
        calc_info: dict[str, Any] = {
            "falconry_info": {
                "action": "calculate_conditioning",
                "ground_id": calc_res.ground_id,
                "calculation": calc_res.model_dump(),
            },
            "answer": answer,
        }
        return FormattedFalconryResponse(answer, calc_info)

    if parsed_intent.action in ("gear_checklist", "gear"):
        checklist = get_falconry_gear_checklist()
        items_str = "; ".join(f"{item.name} ({item.purpose})" for item in checklist)
        answer = (
            f"Mandatory Wilderness Falconry & Raptor Handling Gear Checklist ({len(checklist)} items): "
            f"{items_str}. All falconers must equip handcrafted Aylmeri jesses, Dutch roll-top hoods, "
            "triple-layer elk gauntlets, and 216MHz VHF & GPS transmitters before field release."
        )
        gear_info: dict[str, Any] = {
            "falconry_info": {
                "action": "gear_checklist",
                "gear": [item.model_dump() for item in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedFalconryResponse(answer, gear_info)

    if parsed_intent.action == "ground_detail" and parsed_intent.ground_id:
        ground = get_falconry_ground(parsed_intent.ground_id)
        if ground:
            highlights_str = ", ".join(ground.highlights)
            answer = (
                f"Falconry Ground: {ground.title} ({ground.territory}, {ground.region}). "
                f"Elevation: {ground.elevation_m}m | Primary Species: {ground.primary_species.replace('_', ' ').title()} | "
                f"Flight Style: {ground.flight_style.replace('_', ' ').title()}. "
                f"{ground.description} Key Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "falconry_info": {
                    "action": "ground_detail",
                    "ground_id": ground.ground_id,
                    "ground": ground.model_dump(),
                },
                "answer": answer,
            }
            return FormattedFalconryResponse(answer, detail_info)

    grounds = get_falconry_grounds(species=parsed_intent.raptor_species)
    summary_str = "; ".join(
        f"{g.title} ({g.elevation_m}m, {g.primary_species.replace('_', ' ').title()}, {g.flight_style.replace('_', ' ').title()})"
        for g in grounds
    )
    answer = (
        f"Contoso Wilderness Falconry & Free-Flight Hunting Grounds Catalog ({len(grounds)} iconic territories): {summary_str}. "
        "Ask about specific ground details, daily weight conditioning calibration, "
        "stoop terminal velocity calculations, or mandatory leather furniture and biotelemetry gear checklists."
    )
    list_info: dict[str, Any] = {
        "falconry_info": {
            "action": "grounds_list",
            "raptor_species": parsed_intent.raptor_species,
            "grounds": [g.model_dump() for g in grounds],
        },
        "answer": answer,
    }
    return FormattedFalconryResponse(answer, list_info)


def build_falconry_prompt(intent: Optional[FalconryIntent] = None) -> str:
    """Build guidance prompt for LLM generation regarding wilderness falconry."""
    lines = [
        "Wilderness Falconry & Raptor Free-Flight Hunting Guidance:",
        "- Species Flight Profiles: Peregrine falcons excel at high waiting-on pitches (1,000ft+) and vertical stoops reaching terminal velocities up to 240 mph. Gyrfalcons deliver relentless horizontal tail chases across sagebrush steppe. Harris's hawks engage in cooperative cast hunting maneuvers in desert brush.",
        "- Daily Weight Calibration: Flying weight monitoring on a 0.1g digital scale is critical. A target weight -5% to -14% below base molt weight ensures prime responsive hunting condition without dangerous starvation (< -18%).",
        "- Biotelemetry & Recovery: Mountain ridgelines and thermal updrafts create high fly-off risks. Always field-test dual-mode 216MHz VHF tail-mounts and micro-GPS backpack transmitters before uncapping hoods.",
        "- Handcrafted Leather Furniture: Use supple kangaroo leather Aylmeri anklets and field jesses with Sampo swivels to prevent leg entanglement, along with Dutch roll-top hoods and reinforced elk-hide gauntlets.",
    ]
    if intent and intent.ground_id:
        g = get_falconry_ground(intent.ground_id)
        if g:
            lines.append(
                f"- Focused Ground: {g.title} ({g.territory}, Elevation: {g.elevation_m}m, Primary Species: {g.primary_species.replace('_', ' ').title()})"
            )
    return "\n".join(lines)


def falconry_tool(
    request: Optional[FalconryRequest] = None,
    action: Optional[str] = None,
    ground_id: Optional[str] = None,
    raptor_species: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for wilderness falconry ground lookups, gear checklists, and flight calculations."""
    if isinstance(request, FalconryRequest):
        return calculate_raptor_conditioning(request)
    intent = kwargs.get("intent")
    if action in ("calculate_conditioning", "calculate") or "target_weight_grams" in kwargs:
        req = FalconryRequest(
            ground_id=ground_id
            or (intent.ground_id if intent else None)
            or "sagebrush-sea-wyoming",
            raptor_species=str(kwargs.get("raptor_species", raptor_species or "peregrine_falcon")),
            base_molt_weight_grams=float(kwargs.get("base_molt_weight_grams", 900.0)),
            target_weight_grams=float(kwargs.get("target_weight_grams", 790.0)),
            pitch_altitude_m=float(kwargs.get("pitch_altitude_m", 250.0)),
            ambient_temp_c=float(kwargs.get("ambient_temp_c", 10.0)),
        )
        return calculate_raptor_conditioning(req)
    if action in ("gear_checklist", "gear"):
        return get_falconry_gear_checklist()
    target_ground_id = ground_id or (intent.ground_id if intent else None)
    if action == "ground_detail" and target_ground_id:
        return get_falconry_ground(target_ground_id)
    return get_falconry_grounds(
        species=raptor_species or (intent.raptor_species if intent else None)
    )
