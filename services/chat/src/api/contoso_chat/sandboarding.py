import math
from typing import Any, Optional

from pydantic import BaseModel


class DuneLocationModel(BaseModel):
    dune_id: str
    title: str
    region: str
    park: str
    elevation_m: int
    dune_height_m: int
    primary_style: str
    max_slope_deg: int
    sand_type: str
    description: str
    highlights: list[str]


class SandboardingRequest(BaseModel):
    dune_id: str = "great-sand-dunes-star-dune"
    board_style: str = "directional_carver"
    rider_weight_lbs: float = 165.0
    slope_degrees: float = 32.0
    sand_condition: str = "dry_temperate_loose"
    wax_type: str = "silicone_speed_wax"


class SandboardingResponse(BaseModel):
    dune_id: str
    dune_title: str
    board_style: str
    estimated_top_speed_mph: float
    kinetic_friction_coefficient: float
    glide_performance: str
    wax_reapplication_runs: int
    slipface_risk: str
    thermal_base_warning: str
    rider_technique_advisory: str


class SandboardingGearModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class SandboardingIntent(BaseModel):
    action: str
    dune_id: str | None = None
    board_style: str | None = None

    def __bool__(self) -> bool:
        return bool(self.action)


class FormattedSandboardingResponse(str):
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


BASE_FRICTION: dict[str, float] = {
    "silicone_speed_wax": 0.22,
    "pure_carnauba_hard": 0.26,
    "graphite_friction_shield": 0.29,
    "unwaxed_raw_base": 0.52,
}

SAND_CONDITION_MODIFIERS: dict[str, float] = {
    "early_morning_damp": -0.04,
    "wind_compacted_crust": -0.02,
    "dry_temperate_loose": 0.00,
    "baked_desert_hot": 0.05,
}

DEFAULT_DUNE_LOCATIONS: dict[str, DuneLocationModel] = {
    "great-sand-dunes-star-dune": DuneLocationModel(
        dune_id="great-sand-dunes-star-dune",
        title="Great Sand Dunes Star Dune Slipface",
        region="San Luis Valley, Colorado, USA",
        park="Great Sand Dunes National Park & Preserve",
        elevation_m=2600,
        dune_height_m=230,
        primary_style="directional_carver",
        max_slope_deg=34,
        sand_type="Alpine Quartz & Volcanic Sand",
        description="Towering 750-foot star dune complex in Colorado high alpine desert requiring multi-hour approaches and offering steep technical descents.",
        highlights=[
            "Tallest dunes in North America",
            "High-altitude 8,500ft alpine desert exertion",
            "Star dune ridge spines and knife-edge drops",
        ],
    ),
    "oregon-dunes-florence-bowl": DuneLocationModel(
        dune_id="oregon-dunes-florence-bowl",
        title="Oregon Dunes Coastal Sand Master Ridge",
        region="Florence, Oregon, USA",
        park="Oregon Dunes National Recreation Area",
        elevation_m=45,
        dune_height_m=150,
        primary_style="twin_tip_freestyle",
        max_slope_deg=32,
        sand_type="Maritime Coastal Silica Sand",
        description="Coastal ocean-view dune bowls with moist maritime silica sand, natural wind-sculpted amphitheaters, and smooth freestyle transitions.",
        highlights=[
            "Pacific ocean-view slipfaces",
            "Moist morning fog sand compaction",
            "Natural amphitheater bowl kickers",
        ],
    ),
    "coral-pink-sand-dunes": DuneLocationModel(
        dune_id="coral-pink-sand-dunes",
        title="Coral Pink Dunes Navajo Sandstone Basin",
        region="Kanab, Utah, USA",
        park="Coral Pink Sand Dunes State Park",
        elevation_m=1800,
        dune_height_m=100,
        primary_style="twin_tip_freestyle",
        max_slope_deg=33,
        sand_type="Navajo Hematite Iron Oxide Sand",
        description="Vibrant reddish-pink sand dunes sculpted from eroding Navajo sandstone surrounded by pinyon-juniper woodlands and dramatic slickrock bluffs.",
        highlights=[
            "Vibrant reddish-pink sandscapes",
            "Pinyon-juniper forest border lines",
            "Midday heat friction challenges",
        ],
    ),
    "bruneau-dunes-mega-ridge": DuneLocationModel(
        dune_id="bruneau-dunes-mega-ridge",
        title="Bruneau Dunes Single-Structure Mega Ridge",
        region="Mountain Home, Idaho, USA",
        park="Bruneau Dunes State Park",
        elevation_m=750,
        dune_height_m=143,
        primary_style="directional_carver",
        max_slope_deg=35,
        sand_type="Basaltic Inland Quartz Sand",
        description="Massive 470-foot single-structure sand dune trapped in an ancient Snake River basin with steep terminal slipfaces and dark basalt quartz sand.",
        highlights=[
            "Largest single-structured sand dune in North America",
            "Steep 35-degree terminal slipface drop",
            "Clear desert night skies and thermal winds",
        ],
    ),
    "white-sands-alkali-flats": DuneLocationModel(
        dune_id="white-sands-alkali-flats",
        title="White Sands Gypsum Crystal Dunes",
        region="Tularosa Basin, New Mexico, USA",
        park="White Sands National Park",
        elevation_m=1215,
        dune_height_m=18,
        primary_style="tandem_seated_sled",
        max_slope_deg=30,
        sand_type="Hydrous Calcium Sulfate Gypsum Sand",
        description="Vast blinding white gypsum crystal dunes that remain cool in the summer desert heat, creating gentle slopes ideal for dune sledding and carving.",
        highlights=[
            "Pure gypsum sand that remains cool to the touch",
            "Gentle rolling dunes ideal for family sledding",
            "Expansive 275 sq mile glistening white field",
        ],
    ),
}

DEFAULT_SANDBOARDING_GEAR: list[SandboardingGearModel] = [
    SandboardingGearModel(
        item_id="sealed-sand-goggles",
        name="Full-Seal Anti-Scratch Sandboarding Goggles (ANSI Z87.1)",
        category="eyewear",
        mandatory=True,
        purpose="Foam-filtered ventilation prevents blinding airborne quartz grit during rapid descents",
    ),
    SandboardingGearModel(
        item_id="hard-sand-speed-wax",
        name="Dual-Temperature High-Friction Sand Speed Wax Bar",
        category="maintenance",
        mandatory=True,
        purpose="Carnauba and silicone enriched wax formulated specifically to counter quartz abrasion",
    ),
    SandboardingGearModel(
        item_id="thermal-sand-socks",
        name="High-Collar Neoprene Sand-Shield Booties & Ankle Gaiters",
        category="apparel",
        mandatory=True,
        purpose="Protects feet from burning sand temperatures exceeding 130°F on summer slipfaces",
    ),
    SandboardingGearModel(
        item_id="desert-hydration-pack",
        name="3-Liter Insulated Sand-Proof Hydration Reservoir Pack",
        category="hydration",
        mandatory=True,
        purpose="Hydration reservoir with covered bite valve preventing grit ingestion during dune ascents",
    ),
    SandboardingGearModel(
        item_id="board-base-scraper",
        name="Heavy-Duty Brass Base Scraper & Sand Buffing Pad",
        category="tools",
        mandatory=True,
        purpose="Removes scorched wax buildup and polishes laminate base before fresh wax application",
    ),
    SandboardingGearModel(
        item_id="sun-sand-shield-buff",
        name="UPF 50+ Microfiber Sand Face Shield & Neck Gaiter",
        category="protection",
        mandatory=True,
        purpose="Shields face and neck from UV radiation and scouring sand drift in 25+ mph ridge gusts",
    ),
]


def get_dune_locations(style: Optional[str] = None) -> list[DuneLocationModel]:
    dunes = list(DEFAULT_DUNE_LOCATIONS.values())
    if style:
        norm_style = style.strip().lower().replace("-", "_").replace(" ", "_")
        dunes = [d for d in dunes if d.primary_style.lower() == norm_style]
    return dunes


def get_dune_location(dune_id: str) -> Optional[DuneLocationModel]:
    return DEFAULT_DUNE_LOCATIONS.get(dune_id)


def calculate_sandboarding_glide(req: SandboardingRequest) -> SandboardingResponse:
    dune = get_dune_location(req.dune_id)
    if not dune:
        raise ValueError(f"Dune location '{req.dune_id}' not found")

    base_mu = BASE_FRICTION.get(req.wax_type, 0.26)
    sand_mod = SAND_CONDITION_MODIFIERS.get(req.sand_condition, 0.00)
    final_mu = round(max(0.15, min(0.65, base_mu + sand_mod)), 2)

    angle_rad = req.slope_degrees * (3.14159265 / 180.0)
    net_accel = max(0.5, 9.81 * (math.sin(angle_rad) - final_mu * math.cos(angle_rad)))
    speed_mps = math.sqrt(2 * net_accel * 40.0)
    speed_mph = round(speed_mps * 2.23694, 1)

    if req.wax_type == "unwaxed_raw_base":
        speed_mph = min(speed_mph, 14.0)

    if speed_mph >= 30.0:
        glide_performance = "blistering_speed"
    elif speed_mph >= 20.0:
        glide_performance = "smooth_gliding"
    elif speed_mph >= 12.0:
        glide_performance = "high_friction_drag"
    else:
        glide_performance = "severe_drag_bogged"

    if req.wax_type == "unwaxed_raw_base":
        wax_reapplication_runs = 0
    elif req.sand_condition == "baked_desert_hot":
        wax_reapplication_runs = 1
    elif req.sand_condition == "dry_temperate_loose":
        wax_reapplication_runs = 2
    else:
        wax_reapplication_runs = 3

    if req.slope_degrees >= 34.0:
        slipface_risk = "high_sandfall_avalanche"
    elif req.slope_degrees >= 29.0:
        slipface_risk = "moderate_surface_sluff"
    else:
        slipface_risk = "low_firm_sand"

    if req.sand_condition == "baked_desert_hot":
        thermal_base_warning = (
            "Extreme slipface surface heat (>130°F). Friction melting hazard: wax will rapidly delaminate "
            "and sand will scorch raw p-tex base. Re-wax base every single run and cool board in shade."
        )
    else:
        thermal_base_warning = "Nominal thermal conditions. Dune surface temperature within acceptable operating range for base laminate."

    if req.board_style == "directional_carver":
        rider_technique_advisory = "Maintain 60/40 rearward stance bias to prevent nose-dive in loose quartz sand; initiate turns with smooth ankle roll rather than aggressive edge digging."
    elif req.board_style == "twin_tip_freestyle":
        rider_technique_advisory = "Keep center-weighted athletic stance with loose knees to absorb variable dune ripples; avoid heel-checking on steep slipfaces."
    elif req.board_style in ("tandem_seated_sled", "seated_sand_sled"):
        rider_technique_advisory = "Keep feet securely inside foot rests, grip dual handles firmly, and lean back to elevate front shovel above the sand crest."
    else:
        rider_technique_advisory = "Keep weight back and maintain constant momentum to avoid sinking into loose dune slipface."

    if slipface_risk == "high_sandfall_avalanche":
        rider_technique_advisory += " Caution: Steep slope >=34° carries high risk of sandfall sluffing and cascading avalanches. Scout descent corridor."

    return SandboardingResponse(
        dune_id=dune.dune_id,
        dune_title=dune.title,
        board_style=req.board_style,
        estimated_top_speed_mph=speed_mph,
        kinetic_friction_coefficient=final_mu,
        glide_performance=glide_performance,
        wax_reapplication_runs=wax_reapplication_runs,
        slipface_risk=slipface_risk,
        thermal_base_warning=thermal_base_warning,
        rider_technique_advisory=rider_technique_advisory,
    )


def get_sandboarding_gear_checklist() -> list[SandboardingGearModel]:
    return list(DEFAULT_SANDBOARDING_GEAR)


def detect_sandboarding_intent(text: str) -> Optional[SandboardingIntent]:
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
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in exclusions):
        return None

    sandboarding_keywords = [
        "sandboard",
        "sandboarding",
        "sand board",
        "sand boarding",
        "dune gliding",
        "sand gliding",
        "dune glide",
        "dune sledding",
        "sand sledding",
        "sand sled",
        "dune sled",
        "sand wax",
        "speed wax",
        "carnauba",
        "sand friction",
        "slipface",
        "sandfall",
        "sand avalanche",
        "sand goggles",
        "sand socks",
        "star dune",
        "florence bowl",
        "coral pink sand dunes",
        "coral pink dunes",
        "bruneau dunes",
        "bruneau",
        "white sands",
    ]

    dune_mappings = {
        "star dune": "great-sand-dunes-star-dune",
        "great sand dunes": "great-sand-dunes-star-dune",
        "florence bowl": "oregon-dunes-florence-bowl",
        "oregon dunes": "oregon-dunes-florence-bowl",
        "coral pink": "coral-pink-sand-dunes",
        "bruneau": "bruneau-dunes-mega-ridge",
        "white sands": "white-sands-alkali-flats",
    }

    matched_dune_id: Optional[str] = None
    for kw, d_id in dune_mappings.items():
        if kw in q:
            matched_dune_id = d_id
            break

    is_sandboarding_query = any(k in q for k in sandboarding_keywords)
    if not is_sandboarding_query and not (
        matched_dune_id and any(w in q for w in ["dune", "sand", "glide", "sled"])
    ):
        return None

    board_style: Optional[str] = None
    if "twin tip" in q or "freestyle" in q:
        board_style = "twin_tip_freestyle"
    elif "directional" in q or "carver" in q:
        board_style = "directional_carver"
    elif "sled" in q:
        board_style = "tandem_seated_sled"

    calc_keywords = [
        "calculate",
        "speed",
        "top speed",
        "mph",
        "friction",
        "coefficient",
        "glide",
        "physics",
        "reapplication",
        "slipface risk",
        "slope angle",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "wax",
        "goggles",
        "socks",
        "scraper",
        "buff",
        "hydration",
        "items",
    ]

    if any(k in q for k in calc_keywords) and not any(
        k in q for k in ["gear list", "gear checklist"]
    ):
        action = "calculate_glide"
    elif any(k in q for k in gear_keywords):
        action = "gear_checklist"
    elif matched_dune_id and any(
        k in q
        for k in [
            "detail",
            "about",
            "tell me",
            "describe",
            "elevation",
            "height",
            "highlights",
            "sand type",
        ]
    ):
        action = "dune_detail"
    elif matched_dune_id and not any(
        k in q for k in ["dunes", "catalog", "list", "options", "locations"]
    ):
        action = "dune_detail"
    else:
        action = "dunes_list"

    return SandboardingIntent(
        action=action,
        dune_id=matched_dune_id,
        board_style=board_style,
    )


def format_sandboarding_response(
    intent: Any,
    req: Optional[Any] = None,
) -> FormattedSandboardingResponse:
    if isinstance(intent, SandboardingResponse):
        calc = intent
        answer = (
            f"Sandboarding Glide & Dune Dynamics Analysis for {calc.dune_title}: "
            f"Estimated top speed is {calc.estimated_top_speed_mph} mph ({calc.glide_performance.replace('_', ' ').title()}) "
            f"with kinetic friction coefficient μk={calc.kinetic_friction_coefficient}. "
            f"Slipface risk: {calc.slipface_risk.replace('_', ' ').title()}. "
            f"Wax reapplication needed every {calc.wax_reapplication_runs} run(s). "
            f"{calc.thermal_base_warning} {calc.rider_technique_advisory}"
        )
        resp_calc_info: dict[str, Any] = {
            "sandboarding_info": {
                "action": "calculate_glide",
                "dune_id": calc.dune_id,
                "calculation": calc.model_dump(),
            },
            "answer": answer,
        }
        return FormattedSandboardingResponse(answer, resp_calc_info)

    if isinstance(intent, dict):
        if "sandboarding_info" in intent and "answer" in intent:
            return FormattedSandboardingResponse(str(intent["answer"]), intent)
        parsed_intent = (
            SandboardingIntent(**intent)
            if "action" in intent
            else (
                detect_sandboarding_intent(str(req) or str(intent))
                or SandboardingIntent(action="dunes_list")
            )
        )
    elif isinstance(intent, SandboardingIntent):
        parsed_intent = intent
    else:
        parsed_intent = detect_sandboarding_intent(str(intent)) or SandboardingIntent(
            action="dunes_list"
        )

    if parsed_intent.action in ("calculate_glide", "calculate"):
        calc_req = (
            req
            if isinstance(req, SandboardingRequest)
            else SandboardingRequest(
                dune_id=parsed_intent.dune_id or "great-sand-dunes-star-dune",
                board_style=parsed_intent.board_style or "directional_carver",
            )
        )
        calc_res = calculate_sandboarding_glide(calc_req)
        answer = (
            f"Sandboarding Glide & Dune Dynamics Analysis for {calc_res.dune_title}: "
            f"Estimated top speed is {calc_res.estimated_top_speed_mph} mph ({calc_res.glide_performance.replace('_', ' ').title()}) "
            f"with kinetic friction coefficient μk={calc_res.kinetic_friction_coefficient}. "
            f"Slipface risk: {calc_res.slipface_risk.replace('_', ' ').title()}. "
            f"Wax reapplication needed every {calc_res.wax_reapplication_runs} run(s). "
            f"{calc_res.thermal_base_warning} {calc_res.rider_technique_advisory}"
        )
        calc_info: dict[str, Any] = {
            "sandboarding_info": {
                "action": "calculate_glide",
                "dune_id": calc_res.dune_id,
                "calculation": calc_res.model_dump(),
            },
            "answer": answer,
        }
        return FormattedSandboardingResponse(answer, calc_info)

    if parsed_intent.action in ("gear_checklist", "gear"):
        checklist = get_sandboarding_gear_checklist()
        items_str = "; ".join(f"{item.name} ({item.purpose})" for item in checklist)
        answer = (
            f"Mandatory Sandboarding & Dune Gliding Gear Checklist ({len(checklist)} items): "
            f"{items_str}. All riders must equip full-seal anti-scratch goggles, dual-temp sand speed wax, "
            "and thermal sand socks to prevent severe quartz scouring and blistering base heat."
        )
        gear_info: dict[str, Any] = {
            "sandboarding_info": {
                "action": "gear_checklist",
                "gear": [item.model_dump() for item in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedSandboardingResponse(answer, gear_info)

    if parsed_intent.action == "dune_detail" and parsed_intent.dune_id:
        dune = get_dune_location(parsed_intent.dune_id)
        if dune:
            highlights_str = ", ".join(dune.highlights)
            answer = (
                f"Sandboarding Dune: {dune.title} ({dune.park}, {dune.region}). "
                f"Elevation: {dune.elevation_m}m | Height: {dune.dune_height_m}m | Max Slope: {dune.max_slope_deg}° | "
                f"Primary Board Style: {dune.primary_style.replace('_', ' ').title()} | Sand Type: {dune.sand_type}. "
                f"{dune.description} Key Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "sandboarding_info": {
                    "action": "dune_detail",
                    "dune_id": dune.dune_id,
                    "dune": dune.model_dump(),
                },
                "answer": answer,
            }
            return FormattedSandboardingResponse(answer, detail_info)

    dunes = get_dune_locations(style=parsed_intent.board_style)
    summary_str = "; ".join(
        f"{d.title} ({d.dune_height_m}m height, {d.max_slope_deg}° slope, {d.sand_type})"
        for d in dunes
    )
    answer = (
        f"Contoso Backcountry Sandboarding & Desert Dune Gliding Catalog ({len(dunes)} iconic dunefields): {summary_str}. "
        "Ask about specific dune details, kinetic friction & top speed calculations, "
        "or mandatory sandboarding goggles, thermal socks, and speed wax checklists."
    )
    list_info: dict[str, Any] = {
        "sandboarding_info": {
            "action": "dunes_list",
            "board_style": parsed_intent.board_style,
            "dunes": [d.model_dump() for d in dunes],
        },
        "answer": answer,
    }
    return FormattedSandboardingResponse(answer, list_info)


def build_sandboarding_prompt(intent: Optional[SandboardingIntent] = None) -> str:
    lines = [
        "Backcountry Sandboarding & Desert Dune Gliding Guidance:",
        "- Dunefield Terrains: North American dunefields range from alpine quartz/volcanic sands (Great Sand Dunes) and coastal silica bowls (Oregon Dunes) to pure cool gypsum (White Sands) and basaltic mega-ridges (Bruneau Dunes).",
        "- Kinetic Sand Friction (μk) & Waxing: Quartz sand creates intense kinetic friction and thermal abrasion. High-friction silicone and carnauba speed wax reduces base friction from unwaxed μk=0.52 down to μk=0.22-0.26.",
        "- Slipface Avalanche Safety: Dunes with slope angles >=34° carry high sandfall avalanche risks. Avoid carving directly below other riders on active slipfaces.",
        "- Desert Heat & Thermal Protection: Slipface surface temperatures can exceed 130°F, requiring thermal sand socks to prevent foot burns and frequent re-waxing to avoid base scorching.",
        "- Eye & Grit Protection: Airborne quartz sand drifting in 20+ mph ridge gusts requires ANSI Z87.1 full-seal foam-filtered goggles and neck gaiters.",
    ]
    if intent and intent.action == "dune_detail" and intent.dune_id:
        d = get_dune_location(intent.dune_id)
        if d:
            lines.append(
                f"- Focused Dune: {d.title} ({d.park}, Elevation: {d.elevation_m}m, Height: {d.dune_height_m}m, Sand: {d.sand_type})"
            )
    return "\n".join(lines)


def sandboarding_tool(
    request: Optional[SandboardingRequest] = None,
    action: Optional[str] = None,
    dune_id: Optional[str] = None,
    board_style: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for backcountry sandboarding and desert dune gliding lookup and calculations."""
    if isinstance(request, SandboardingRequest):
        return calculate_sandboarding_glide(request)
    intent = kwargs.get("intent")
    if action in ("calculate_glide", "calculate") or "slope_degrees" in kwargs:
        req = SandboardingRequest(
            dune_id=dune_id or (intent.dune_id if intent else None) or "great-sand-dunes-star-dune",
            board_style=str(kwargs.get("board_style", "directional_carver")),
            rider_weight_lbs=float(kwargs.get("rider_weight_lbs", 165.0)),
            slope_degrees=float(kwargs.get("slope_degrees", 32.0)),
            sand_condition=str(kwargs.get("sand_condition", "dry_temperate_loose")),
            wax_type=str(kwargs.get("wax_type", "silicone_speed_wax")),
        )
        return calculate_sandboarding_glide(req)
    if action in ("gear_checklist", "gear"):
        return get_sandboarding_gear_checklist()
    target_dune_id = dune_id or (intent.dune_id if intent else None)
    if action == "dune_detail" and target_dune_id:
        return get_dune_location(target_dune_id)
    return get_dune_locations(style=board_style or (intent.board_style if intent else None))
