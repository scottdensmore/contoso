from typing import Any, Optional

from pydantic import BaseModel


class TelemarkZoneModel(BaseModel):
    zone_id: str
    title: str
    region: str
    range_name: str
    elevation_m: int
    primary_binding: str
    steepness_deg: int
    snow_type: str
    description: str
    highlights: list[str]


class TelemarkRequest(BaseModel):
    zone_id: str = "silverton-mountain-powder"
    binding_system: str = "ntn_modern"
    skier_weight_lbs: float = 170.0
    snow_condition: str = "deep_blower_powder"
    turn_style: str = "fluid_deep_knee_lunges"
    tension_level: int = 3


class TelemarkResponse(BaseModel):
    zone_id: str
    zone_title: str
    binding_system: str
    effective_resistance_nm: float
    tip_drive_edge_pressure_index: float
    resistance_rating: str
    bellows_strain_warning: str
    lead_change_advisory: str
    edge_transition_guidance: str


class TelemarkGearModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class TelemarkIntent(BaseModel):
    action: str
    zone_id: str | None = None
    binding_system: str | None = None

    def __bool__(self) -> bool:
        return bool(self.action)


class FormattedTelemarkResponse(str):
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


DEFAULT_TELEMARK_ZONES: dict[str, TelemarkZoneModel] = {
    "silverton-mountain-powder": TelemarkZoneModel(
        zone_id="silverton-mountain-powder",
        title="Silverton Mountain High Alpine Freeheel Bowls",
        region="San Juan Mountains, Colorado, USA",
        range_name="San Juan National Forest",
        elevation_m=4100,
        primary_binding="ntn_modern",
        steepness_deg=45,
        snow_type="Deep Ungrooved Dry San Juan Powder",
        description="Rugged backcountry-style extreme alpine terrain featuring steep fall-line bowl drops, unguided hike-to ridges, and demanding deep powder freeheel turns.",
        highlights=[
            "High-altitude 13,487ft alpine ridge drops",
            "Deep ungrooved dry San Juan powder",
            "Active NTN power cartridge edge drive",
        ],
    ),
    "mad-river-glen-trees": TelemarkZoneModel(
        zone_id="mad-river-glen-trees",
        title="Mad River Glen Gen Stark Ridge Telemark Glades",
        region="Fayston, Vermont, USA",
        range_name="Green Mountains",
        elevation_m=1110,
        primary_binding="duckbill_75mm_cable",
        steepness_deg=36,
        snow_type="Variable Eastern Hardpack & Powder Stashes",
        description="Historic New England ski preserve where traditional 75mm freeheel skiers carve tight natural glades, waterfall steps, and ungroomed tree runs.",
        highlights=[
            "Tight hardwood forest tree glades",
            "Traditional 75mm supple flex knee drops",
            "Natural waterfall and rock cliff drops",
        ],
    ),
    "alta-catherine-pass": TelemarkZoneModel(
        zone_id="alta-catherine-pass",
        title="Alta Backcountry Catherine's Pass & Supreme Cirque",
        region="Alta, Utah, USA",
        range_name="Wasatch Mountains",
        elevation_m=3200,
        primary_binding="ntn_modern",
        steepness_deg=38,
        snow_type="Ultra-Light Wasatch Lake-Effect Fluff",
        description="Legendary high-elevation Wasatch powder basin offering continuous pitch, pristine lake-effect snow, and open alpine cirque freeheel descents.",
        highlights=[
            "Ultra-light 8.5% density Wasatch powder",
            "Fast fluid lead-change transitions",
            "Supreme Cirque steep chutes",
        ],
    ),
    "rogers-pass-asulkan": TelemarkZoneModel(
        zone_id="rogers-pass-asulkan",
        title="Rogers Pass Asulkan Valley Glaciated Telemark Tours",
        region="Glacier National Park, BC, Canada",
        range_name="Selkirk Mountains",
        elevation_m=2600,
        primary_binding="tele_tech_hybrid",
        steepness_deg=42,
        snow_type="Deep Coastal-Intermountain Maritime Powder",
        description="Vast glaciated ski mountaineering paradise with endless vertical fall lines, alpine moraine fields, and tech-toe hybrid freeheel touring efficiency.",
        highlights=[
            "Frictionless tech-toe skin track ascents",
            "Glaciated moraine powder bowls",
            "Massive 1,500m sustained fall line descents",
        ],
    ),
    "tuckerman-ravine-bowl": TelemarkZoneModel(
        zone_id="tuckerman-ravine-bowl",
        title="Mount Washington Tuckerman Ravine Telemark Descent",
        region="White Mountain National Forest, NH, USA",
        range_name="Presidential Range",
        elevation_m=1916,
        primary_binding="ntn_modern",
        steepness_deg=50,
        snow_type="Steep Spring Glissade Corn Snow",
        description="Iconic glacial cirque on Mount Washington featuring 50-degree headwalls, high exposure, and intense spring telemark jump-turn descents.",
        highlights=[
            "Iconic 50-degree Tuckerman Headwall",
            "Spring corn snow edge carving",
            "High-exposure jump telemark turns",
        ],
    ),
}

DEFAULT_TELEMARK_GEAR: list[TelemarkGearModel] = [
    TelemarkGearModel(
        item_id="telemark-bellows-boots",
        name="Triple-Injection Pebax Bellows Telemark Boots with Walk-Mode Lockout",
        category="boots",
        mandatory=True,
        purpose="Metatarsal accordion bellows enables deep knee drop while rigid torsion frame drives ski edge",
    ),
    TelemarkGearModel(
        item_id="touring-climbing-skins",
        name="High-Traction Mohair-Nylon Blend Backcountry Climbing Skins with Tail Clips",
        category="touring",
        mandatory=True,
        purpose="Supple grip-to-glide ratio for steep skin tracks in deep alpine powder",
    ),
    TelemarkGearModel(
        item_id="safety-leash-release-cables",
        name="Breakaway Steel Core Telemark Safety Leashes or Low-Profile Brakes",
        category="bindings",
        mandatory=True,
        purpose="Prevents runaway ski loss down 45-degree bowls without inhibiting bellows flex",
    ),
    TelemarkGearModel(
        item_id="adjustable-whippet-poles",
        name="Two-Piece Aluminum Freeheel Ski Poles with Self-Arrest Whippet Picks",
        category="poles",
        mandatory=True,
        purpose="Integrated steel self-arrest blade provides immediate anchor if dropped on steep headwalls",
    ),
    TelemarkGearModel(
        item_id="binding-spare-cartridge-kit",
        name="Field Spare Cartridge Springs, Pivot Pins & Multi-Wrench Hex Tool",
        category="repair",
        mandatory=True,
        purpose="Essential backcountry repair parts for field spring swaps and pivot pin adjustments",
    ),
    TelemarkGearModel(
        item_id="avalanche-airbag-rescue-pack",
        name="Deployable Electric Avalanche Airbag Pack with Probe and Metal Shovel",
        category="safety",
        mandatory=True,
        purpose="Mandatory alpine safety equipment for traveling in avalanche terrain",
    ),
]


def get_telemark_zones(system: Optional[str] = None) -> list[TelemarkZoneModel]:
    zones = list(DEFAULT_TELEMARK_ZONES.values())
    if system:
        norm = system.strip().lower().replace("-", "_").replace(" ", "_")
        zones = [
            z
            for z in zones
            if z.primary_binding.lower() == norm or norm in z.primary_binding.lower()
        ]
    return zones


def get_telemark_zone(zone_id: str) -> Optional[TelemarkZoneModel]:
    return DEFAULT_TELEMARK_ZONES.get(zone_id.strip().lower())


def get_telemark_gear_checklist() -> list[TelemarkGearModel]:
    return DEFAULT_TELEMARK_GEAR


def calculate_telemark_activity(req: TelemarkRequest) -> TelemarkResponse:
    zone = get_telemark_zone(req.zone_id)
    if not zone:
        raise ValueError(f"Telemark zone '{req.zone_id}' not found")

    binding_norm = req.binding_system.strip().lower().replace("-", "_").replace(" ", "_")
    if "duckbill" in binding_norm or "75mm" in binding_norm:
        base_resistance = 35.0
    elif "tele_tech" in binding_norm or "hybrid" in binding_norm:
        base_resistance = 40.0
    else:
        base_resistance = 45.0

    tension_mod = (req.tension_level - 3) * 6.0
    weight_factor = req.skier_weight_lbs / 170.0
    effective_resistance_nm = round((base_resistance + tension_mod) * weight_factor, 1)

    tip_drive_edge_pressure_index = min(0.98, round(effective_resistance_nm / 80.0, 2))

    if effective_resistance_nm < 35.0:
        resistance_rating = "supple_surf_flex"
    elif effective_resistance_nm < 52.0:
        resistance_rating = "balanced_all_mountain"
    elif effective_resistance_nm < 70.0:
        resistance_rating = "active_carving_power"
    else:
        resistance_rating = "stiff_race_lockout"

    if effective_resistance_nm >= 70.0:
        bellows_strain_warning = (
            "CRITICAL BELLOWS STRAIN ALERT: High spring pre-load accelerates Pebax bellows hinge creasing and fatigue cracking. "
            "Inspect accordion flex zone for stress micro-fractures prior to descent."
        )
    elif "duckbill" in binding_norm or "75mm" in binding_norm:
        bellows_strain_warning = (
            "75MM DUCKBILL ADVISORY: Cable tension exerts upward torque on duckbill toe tabs; "
            "verify toe thickness and ensure 3-pin latch pins or bail clasps are firmly seated."
        )
    else:
        bellows_strain_warning = (
            "NOMINAL BELLOWS FLEX: Spring pre-load is within manufacturer fatigue tolerance limits across metatarsal flex zone."
        )

    lead_change_advisory = (
        "Lead-Change Turn Dynamics: Advance uphill ski smoothly into the fall line while depressing the trailing rear foot bellows. "
        "Maintain dynamic 50/50 fore-aft weight distribution through the apex of the turn."
    )

    edge_transition_guidance = (
        "Edge Transition Guidance: Simultaneously roll the inside edge of the front lead ski and outside edge of the trailing rear ski, "
        "engaging underfoot spring tension to drive continuous carving pressure through turn exit."
    )

    return TelemarkResponse(
        zone_id=zone.zone_id,
        zone_title=zone.title,
        binding_system=req.binding_system,
        effective_resistance_nm=effective_resistance_nm,
        tip_drive_edge_pressure_index=tip_drive_edge_pressure_index,
        resistance_rating=resistance_rating,
        bellows_strain_warning=bellows_strain_warning,
        lead_change_advisory=lead_change_advisory,
        edge_transition_guidance=edge_transition_guidance,
    )


def detect_telemark_intent(text: str) -> Optional[TelemarkIntent]:
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
        "cross country",
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in exclusions):
        return None

    zone_mappings = {
        "silverton": "silverton-mountain-powder",
        "mad river": "mad-river-glen-trees",
        "gen stark": "mad-river-glen-trees",
        "alta": "alta-catherine-pass",
        "catherine": "alta-catherine-pass",
        "supreme cirque": "alta-catherine-pass",
        "rogers pass": "rogers-pass-asulkan",
        "asulkan": "rogers-pass-asulkan",
        "tuckerman": "tuckerman-ravine-bowl",
        "mount washington": "tuckerman-ravine-bowl",
    }

    matched_zone_id: Optional[str] = None
    for kw, z_id in zone_mappings.items():
        if kw in q:
            matched_zone_id = z_id
            break

    telemark_keywords = [
        "telemark",
        "freeheel",
        "tele",
        "ntn",
        "duckbill",
        "75mm",
        "tele-tech",
        "tele tech",
        "lead change",
        "lead-change",
        "bellows",
        "knee drop",
        "spring tension",
    ]

    is_telemark_query = any(k in q for k in telemark_keywords)
    if not is_telemark_query and not matched_zone_id:
        return None

    binding_system: Optional[str] = None
    if "75mm" in q or "duckbill" in q or "cable" in q:
        binding_system = "duckbill_75mm_cable"
    elif "tele-tech" in q or "tele tech" in q or "hybrid" in q:
        binding_system = "tele_tech_hybrid"
    elif "ntn" in q or "modern" in q:
        binding_system = "ntn_modern"

    calc_keywords = [
        "calculate",
        "spring tension",
        "tension",
        "resistance",
        "edge pressure",
        "preload",
        "pre-load",
        "knee resistance",
        "tip drive",
        "nm",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "boots",
        "skins",
        "whippet",
        "leash",
        "cartridge",
        "airbag",
    ]

    has_gear_explicit = any(k in q for k in ["gear", "gear checklist", "equipment list", "gear list"])
    if any(k in q for k in calc_keywords) and not has_gear_explicit:
        action = "calculate_activity"
    elif any(k in q for k in gear_keywords):
        action = "gear_checklist"
    elif matched_zone_id and any(
        k in q
        for k in [
            "detail",
            "details",
            "about",
            "tell me",
            "describe",
            "elevation",
            "steepness",
            "snow type",
            "highlights",
            "bowls",
            "glade",
        ]
    ):
        action = "zone_detail"
    elif matched_zone_id and not any(
        k in q for k in ["zones", "catalog", "list", "options", "bowls"]
    ):
        action = "zone_detail"
    else:
        action = "zones_list"

    return TelemarkIntent(
        action=action,
        zone_id=matched_zone_id,
        binding_system=binding_system,
    )


def build_telemark_prompt(intent: Optional[TelemarkIntent] = None) -> str:
    lines = [
        "Alpine Telemark Skiing & Freeheel Backcountry Descending Tooling:",
        "- Binding Dynamics: NTN Modern (45.0 Nm base), 75mm Duckbill Cable (35.0 Nm base), Tele-Tech Hybrid (40.0 Nm base).",
        "- Lead-Change Mechanics: Continuous fluid fore-aft lead changes with 50/50 dynamic pressure through turn apex.",
        "- Bellows Flex Integrity: Monitor Pebax accordion bellows fatigue, avoid excessive spring pre-load lockout.",
        "- Alpine Safety & Avalanche Rescue: Whippet arrest poles, breakaway leashes, and electric airbag packs mandatory for steep 35°+ lines.",
    ]
    if intent and intent.zone_id:
        z = get_telemark_zone(intent.zone_id)
        if z:
            lines.append(
                f"- Focused Alpine Telemark Zone: {z.title} ({z.range_name}, {z.region}, Elevation: {z.elevation_m}m, Steepness: {z.steepness_deg}°, Binding: {z.primary_binding})"
            )
    return "\n".join(lines)


def format_telemark_response(
    intent: TelemarkIntent,
    req: Optional[TelemarkRequest] = None,
) -> FormattedTelemarkResponse:
    calc_info: dict[str, Any]
    gear_info: dict[str, Any]
    detail_info: dict[str, Any]
    list_info: dict[str, Any]

    if intent.action in ("calculate_activity", "calculate"):
        calc_req = req or TelemarkRequest(
            zone_id=intent.zone_id or "silverton-mountain-powder",
            binding_system=intent.binding_system or "ntn_modern",
        )
        calc_res = calculate_telemark_activity(calc_req)
        answer = (
            f"Alpine Telemark Mechanics Analysis for {calc_res.zone_title}: "
            f"Forward knee resistance is {calc_res.effective_resistance_nm} Nm "
            f"({calc_res.resistance_rating.upper()}) with Tip Drive Edge Pressure Index of {calc_res.tip_drive_edge_pressure_index}. "
            f"Binding: {calc_res.binding_system}. {calc_res.bellows_strain_warning} "
            f"{calc_res.lead_change_advisory} {calc_res.edge_transition_guidance}"
        )
        calc_info = {
            "telemark_skiing_info": {
                "action": "calculate_activity",
                "zone_id": calc_res.zone_id,
                "calculation": calc_res.model_dump(),
            },
            "answer": answer,
        }
        return FormattedTelemarkResponse(answer, calc_info)

    if intent.action in ("gear_checklist", "gear"):
        checklist = get_telemark_gear_checklist()
        items_str = "; ".join(f"{item.name} ({item.purpose})" for item in checklist)
        answer = (
            f"Mandatory Alpine Telemark & Freeheel Backcountry Gear Checklist ({len(checklist)} items): "
            f"{items_str}. All skiers must ensure functional bellows flex, self-arrest whippet poles, and electric avalanche safety airbags."
        )
        gear_info = {
            "telemark_skiing_info": {
                "action": "gear_checklist",
                "gear": [item.model_dump() for item in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedTelemarkResponse(answer, gear_info)

    if intent.action == "zone_detail" and intent.zone_id:
        zone = get_telemark_zone(intent.zone_id)
        if zone:
            highlights_str = ", ".join(zone.highlights)
            answer = (
                f"Alpine Telemark Zone: {zone.title} ({zone.range_name}, {zone.region}). "
                f"Elevation: {zone.elevation_m}m | Steepness: {zone.steepness_deg}° | "
                f"Primary Binding: {zone.primary_binding} | Snow: {zone.snow_type}. "
                f"{zone.description} Highlights: {highlights_str}."
            )
            detail_info = {
                "telemark_skiing_info": {
                    "action": "zone_detail",
                    "zone_id": zone.zone_id,
                    "zone": zone.model_dump(),
                },
                "answer": answer,
            }
            return FormattedTelemarkResponse(answer, detail_info)

    zones = get_telemark_zones(system=intent.binding_system)
    summary_str = "; ".join(
        f"{z.title} ({z.steepness_deg}°, {z.elevation_m}m, {z.primary_binding})" for z in zones
    )
    answer = (
        f"Contoso Alpine Telemark & Freeheel Descending Catalog ({len(zones)} iconic zones): {summary_str}. "
        "Inquire about specific zone terrain, forward knee resistance & spring tension calculations, "
        "or mandatory bellows boots, climbing skins, and avalanche safety gear."
    )
    list_info = {
        "telemark_skiing_info": {
            "action": "zones_list",
            "binding_system": intent.binding_system,
            "zones": [z.model_dump() for z in zones],
        },
        "answer": answer,
    }
    return FormattedTelemarkResponse(answer, list_info)
