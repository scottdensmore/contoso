from typing import Any, Optional

from pydantic import BaseModel


class CaveDivingSiteModel(BaseModel):
    site_id: str
    title: str
    region: str
    system: str
    max_depth_m: int
    water_temp_c: int
    flow_type: str
    primary_rigging: str
    sump_length_m: int
    silt_risk: str
    description: str
    highlights: list[str]


class CaveDivingRequest(BaseModel):
    site_id: str = "peacock-springs-karst"
    rigging_setup: str = "sidemount_dual_cylinder"
    starting_pressure_psi: float = 3000.0
    reserve_rule: str = "rule_of_thirds"
    planned_penetration_m: float = 120.0
    flow_type: str = "static_slack_phreatic"


class CaveDivingResponse(BaseModel):
    site_id: str
    site_title: str
    rigging_setup: str
    turn_pressure_psi: float
    usable_gas_psi: float
    reserve_gas_psi: float
    guideline_spool_required_m: float
    penetration_safety: str
    silt_risk: str
    gas_management_advisory: str
    decompression_advisory: str


class CaveDivingGearModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class CaveDivingIntent(BaseModel):
    action: str
    site_id: str | None = None
    rigging_setup: str | None = None

    def __bool__(self) -> bool:
        return bool(self.action)


class FormattedCaveDivingResponse(str):
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


DEFAULT_CAVE_DIVING_SITES: dict[str, CaveDivingSiteModel] = {
    "peacock-springs-karst": CaveDivingSiteModel(
        site_id="peacock-springs-karst",
        title="Peacock Springs Karst Siphon & Grand Traverse",
        region="Luraville, Florida, USA",
        system="Wes Skiles Peacock Springs State Park",
        max_depth_m=20,
        water_temp_c=21,
        flow_type="static_slack_phreatic",
        primary_rigging="sidemount_dual_cylinder",
        sump_length_m=850,
        silt_risk="moderate_sand_drift",
        description="World-renowned freshwater karst cavern and siphon labyrinth featuring over 30,000 feet of explored underwater passages and delicate restriction traverses.",
        highlights=[
            "Interconnected cavern and cave passages",
            "Low bedding-plane restriction squeezes",
            "Permanent golden guideline navigation",
        ],
    ),
    "ginnie-springs-devil-system": CaveDivingSiteModel(
        site_id="ginnie-springs-devil-system",
        title="Devil's Eye & Ear Spring Trunk Conduit",
        region="High Springs, Florida, USA",
        system="Santa Fe River Karst Basin",
        max_depth_m=30,
        water_temp_c=22,
        flow_type="outflowing_spring_resurgence",
        primary_rigging="backmount_manifold_doubles",
        sump_length_m=1200,
        silt_risk="low_rock_floor",
        description="High-energy spring resurgence system pumping crystal clear water through massive eroded limestone tunnels and the high-flow Devil's Ear fissure.",
        highlights=[
            "Heavy outflowing current resistance",
            "Devil's Ear high-flow limestone fissure",
            "Rule of Thirds deep trunk exploration",
        ],
    ),
    "cholla-sump-lost-creek": CaveDivingSiteModel(
        site_id="cholla-sump-lost-creek",
        title="Lost Creek Siphon Sump Penetration",
        region="Bighorn Mountains, Wyoming, USA",
        system="Tongue River Karst Highlands",
        max_depth_m=18,
        water_temp_c=4,
        flow_type="inflowing_siphon_suction",
        primary_rigging="sidemount_dual_cylinder",
        sump_length_m=320,
        silt_risk="extreme_clay_zero_vis",
        description="Treacherous alpine siphon conduit swallowing surface glacial meltwater into submerged mountain sumps with freezing 4°C water and extreme low-visibility clay.",
        highlights=[
            "Freezing 4°C alpine glacial water",
            "High-suction siphon drag dynamics",
            "Zero-visibility clay silt disturbance risks",
        ],
    ),
    "phantom-lake-spring": CaveDivingSiteModel(
        site_id="phantom-lake-spring",
        title="Phantom Lake Cave Siphon Deep Conduit",
        region="Toyahvale, Texas, USA",
        system="Balmorhea Artesian Karst System",
        max_depth_m=45,
        water_temp_c=20,
        flow_type="static_slack_phreatic",
        primary_rigging="closed_circuit_rebreather_ccr",
        sump_length_m=1600,
        silt_risk="low_rock_floor",
        description="Deep artesian phreatic aquifer trunk extending into remote West Texas bedrock with deep trimix stages, rebreather exploration, and massive drowned galleries.",
        highlights=[
            "Deep 45m phreatic aquifer trunk",
            "Helium trimix and rebreather depth staging",
            "Historic underwater scientific exploration",
        ],
    ),
    "tuckaleechee-caverns-sump": CaveDivingSiteModel(
        site_id="tuckaleechee-caverns-sump",
        title="Smoky Mountain Tuckaleechee Siphon Resurgence",
        region="Townsend, Tennessee, USA",
        system="Great Smoky Mountains Karst",
        max_depth_m=25,
        water_temp_c=12,
        flow_type="outflowing_spring_resurgence",
        primary_rigging="sidemount_dual_cylinder",
        sump_length_m=450,
        silt_risk="extreme_clay_zero_vis",
        description="Ancient Appalachian subterranean drainage siphon connecting great mountain chambers through dark flooded vertical fissures and active streamway resurgence tunnels.",
        highlights=[
            "Cold Appalachian mountain runoff",
            "Multiple jump reel line transitions",
            "Restricted vertical fissure squeezes",
        ],
    ),
}

DEFAULT_CAVE_DIVING_GEAR: list[CaveDivingGearModel] = [
    CaveDivingGearModel(
        item_id="primary-safety-guideline-reels",
        name="400ft Anodized Aluminum Primary Reel & Two Safety Finger Spools with Line Arrows",
        category="guideline",
        mandatory=True,
        purpose="Unbroken physical lifeline to the entrance, essential for surviving total zero-visibility silt-outs",
    ),
    CaveDivingGearModel(
        item_id="redundant-led-dive-lights",
        name="1500-Lumen Primary Canister Light & Two Independent Backup LED Torches",
        category="lighting",
        mandatory=True,
        purpose="NSS-CDS rule of three independent submersible light sources with minimum 4-hour burn times",
    ),
    CaveDivingGearModel(
        item_id="sidemount-dual-regulator-kit",
        name="Sealed Diaphragm First Stages with 7ft Long Hose and Right-Angle Swivels",
        category="gas_management",
        mandatory=True,
        purpose="Environmentally sealed cold-water regulators ensuring redundant gas delivery through tight restriction passes",
    ),
    CaveDivingGearModel(
        item_id="dual-cutting-devices",
        name="Serrated Line Cutter Titanium Z-Knife and Stainless Trauma Shears",
        category="safety",
        mandatory=True,
        purpose="Instantly frees diver from entangling old line, mono-filament, or debris without puncturing drysuit",
    ),
    CaveDivingGearModel(
        item_id="underwater-dive-slate-markers",
        name="Submersible Wrist Slate, Waterproof Pencil & Directional Line Markers",
        category="navigation",
        mandatory=True,
        purpose="Directional line arrows pointing exit way and non-directional cookies marking personal jump tees",
    ),
    CaveDivingGearModel(
        item_id="drysuit-crush-resistant-boots",
        name="High-Durability Cordura Karst Drysuit with Heavy Kevlar Kneepads",
        category="exposure",
        mandatory=True,
        purpose="Protects against hypothermia and sharp jagged limestone abrasions in overhead sump squeezes",
    ),
]


def get_cave_diving_sites(rigging: Optional[str] = None) -> list[CaveDivingSiteModel]:
    sites = list(DEFAULT_CAVE_DIVING_SITES.values())
    if rigging:
        norm = rigging.strip().lower().replace("-", "_").replace(" ", "_")
        sites = [
            s
            for s in sites
            if s.primary_rigging.lower() == norm or norm in s.primary_rigging.lower()
        ]
    return sites


def get_cave_diving_site(site_id: str) -> Optional[CaveDivingSiteModel]:
    return DEFAULT_CAVE_DIVING_SITES.get(site_id.strip().lower())


def get_cave_diving_gear_checklist() -> list[CaveDivingGearModel]:
    return DEFAULT_CAVE_DIVING_GEAR


def calculate_cave_diving_gas(req: CaveDivingRequest) -> CaveDivingResponse:
    site = get_cave_diving_site(req.site_id)
    if not site:
        raise ValueError(f"Cave diving site '{req.site_id}' not found")

    norm_rule = req.reserve_rule.strip().lower().replace("-", "_").replace(" ", "_")
    if norm_rule == "rule_of_sixths":
        usable_fraction = 1.0 / 6.0
    elif norm_rule == "rule_of_quarters":
        usable_fraction = 1.0 / 4.0
    else:
        usable_fraction = 1.0 / 3.0

    usable_gas_psi = round(req.starting_pressure_psi * usable_fraction, 1)
    turn_pressure_psi = round(req.starting_pressure_psi - usable_gas_psi, 1)
    reserve_gas_psi = round(req.starting_pressure_psi - usable_gas_psi, 1)
    guideline_spool_required_m = round(req.planned_penetration_m * 1.25 + 50.0, 1)

    flow_type = req.flow_type.strip().lower().replace("-", "_").replace(" ", "_")
    if flow_type == "inflowing_siphon_suction":
        if norm_rule != "rule_of_sixths":
            penetration_safety = "critical_gas_reserve_alert"
        else:
            penetration_safety = "nominal_safe_turn"
    elif flow_type == "outflowing_spring_resurgence":
        penetration_safety = "nominal_safe_turn"
    elif flow_type == "static_slack_phreatic":
        if req.planned_penetration_m > 200.0:
            penetration_safety = "caution_flow_resistance"
        else:
            penetration_safety = "nominal_safe_turn"
    else:
        penetration_safety = "nominal_safe_turn"

    # Gas management advisory
    if penetration_safety == "critical_gas_reserve_alert":
        gas_management_advisory = (
            "CRITICAL SIPHON ALERT: Inflowing suction pulls divers inward and strongly opposes outbound swimming. "
            "Rule of Sixths reserve (1/6 penetration, 5/6 reserve) is strictly mandatory to prevent drowning against the flow."
        )
    elif norm_rule == "rule_of_sixths":
        gas_management_advisory = (
            "Conservative Rule of Sixths applied: 1/6th gas for inbound penetration, leaving 5/6ths reserve "
            "for siphon current fighting, buddy air sharing, and complex line entanglement delays."
        )
    elif norm_rule == "rule_of_quarters":
        gas_management_advisory = (
            "Rule of Quarters applied: 1/4th gas for inbound penetration, 3/4ths held in reserve for silt-out navigation and flow resistance."
        )
    else:
        gas_management_advisory = (
            "Standard Rule of Thirds applied: 1/3rd gas for penetration, 1/3rd for return exit, and 1/3rd emergency buddy reserve."
        )

    # Decompression advisory
    if site.max_depth_m >= 35:
        decompression_advisory = (
            f"Deep phreatic conduit ({site.max_depth_m}m). High decompression obligation with inert gas narcosis risks; "
            "trimix and staged oxygen/nitrox decompression bottles required along continuous main line."
        )
    elif site.max_depth_m >= 20:
        decompression_advisory = (
            f"Moderate depth karst trunk ({site.max_depth_m}m). Adhere to conservative runtime NDL schedules, "
            "stage safety decompression cylinders at cave entrance / cavern zone."
        )
    else:
        decompression_advisory = (
            f"Shallow karst conduit ({site.max_depth_m}m). Complete standard 3-minute safety stop at 5m with continuous physical line contact."
        )

    return CaveDivingResponse(
        site_id=site.site_id,
        site_title=site.title,
        rigging_setup=req.rigging_setup,
        turn_pressure_psi=turn_pressure_psi,
        usable_gas_psi=usable_gas_psi,
        reserve_gas_psi=reserve_gas_psi,
        guideline_spool_required_m=guideline_spool_required_m,
        penetration_safety=penetration_safety,
        silt_risk=site.silt_risk,
        gas_management_advisory=gas_management_advisory,
        decompression_advisory=decompression_advisory,
    )


def detect_cave_diving_intent(text: str) -> Optional[CaveDivingIntent]:
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
        "caving",
        "dry cave",
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in exclusions):
        return None

    site_mappings = {
        "peacock": "peacock-springs-karst",
        "wes skiles": "peacock-springs-karst",
        "devil's eye": "ginnie-springs-devil-system",
        "devils eye": "ginnie-springs-devil-system",
        "devil's ear": "ginnie-springs-devil-system",
        "devils ear": "ginnie-springs-devil-system",
        "ginnie": "ginnie-springs-devil-system",
        "lost creek": "cholla-sump-lost-creek",
        "cholla": "cholla-sump-lost-creek",
        "phantom lake": "phantom-lake-spring",
        "balmorhea": "phantom-lake-spring",
        "tuckaleechee": "tuckaleechee-caverns-sump",
        "smoky mountain": "tuckaleechee-caverns-sump",
    }

    matched_site_id: Optional[str] = None
    for kw, s_id in site_mappings.items():
        if kw in q:
            matched_site_id = s_id
            break

    cave_diving_keywords = [
        "cave diving",
        "cave diver",
        "cave dive",
        "sump diving",
        "sump dive",
        "sump penetration",
        "sump",
        "siphon",
        "karst conduit",
        "karst",
        "phreatic",
        "silt out",
        "silt-out",
        "guideline",
        "continuous guideline",
        "line arrows",
        "jump reel",
        "primary reel",
        "finger spool",
        "spool",
        "turn pressure",
        "rule of thirds",
        "rule of sixths",
        "rule of quarters",
        "sidemount",
        "manifold doubles",
        "ccr",
        "rebreather",
    ]

    is_cave_diving_query = any(k in q for k in cave_diving_keywords)
    if not is_cave_diving_query and not matched_site_id:
        return None

    rigging_setup: Optional[str] = None
    if "sidemount" in q or "dual cylinder" in q or "dual cylinders" in q:
        rigging_setup = "sidemount_dual_cylinder"
    elif "backmount" in q or "manifold doubles" in q or "doubles" in q:
        rigging_setup = "backmount_manifold_doubles"
    elif "rebreather" in q or "ccr" in q or "closed circuit" in q:
        rigging_setup = "closed_circuit_rebreather_ccr"

    calc_keywords = [
        "calculate",
        "turn pressure",
        "rule of thirds",
        "rule of sixths",
        "rule of quarters",
        "gas management",
        "reserve pressure",
        "usable gas",
        "turn",
        "psi",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "reels",
        "reel",
        "spools",
        "spool",
        "dive lights",
        "light",
        "torches",
        "cutting device",
        "line cutter",
        "wrist slate",
        "line arrows",
        "cookies",
    ]

    has_gear_explicit = any(k in q for k in ["gear", "gear checklist", "equipment list", "gear list"])
    if any(k in q for k in calc_keywords) and not has_gear_explicit:
        action = "calculate_gas"
    elif any(k in q for k in gear_keywords):
        action = "gear_checklist"
    elif matched_site_id and any(
        k in q
        for k in [
            "detail",
            "details",
            "about",
            "tell me",
            "describe",
            "depth",
            "water temp",
            "highlights",
            "traverse",
            "exploration",
            "explore",
            "conduit",
        ]
    ):
        action = "site_detail"
    elif matched_site_id and not any(
        k in q for k in ["sites", "catalog", "list", "options", "conduits"]
    ):
        action = "site_detail"
    else:
        action = "sites_list"

    return CaveDivingIntent(
        action=action,
        site_id=matched_site_id,
        rigging_setup=rigging_setup,
    )


def build_cave_diving_prompt(intent: Optional[CaveDivingIntent] = None) -> str:
    lines = [
        "Wilderness Karst Cave Diving, Sump Penetration & Gas Management Guidance:",
        "- Gas Management & Turn Pressures: Strict Rule of Thirds for static phreatic caves, Rule of Sixths for high-suction inflowing siphons, and Rule of Quarters for high-drag sumps.",
        "- Continuous Guideline Protocol: An unbroken physical lifeline from open water to the furthest point of penetration is essential to survive zero-visibility silt-outs.",
        "- Siphon & Resurgence Dynamics: Inflowing siphons pull divers in and strongly fight outbound exits; outflowing springs provide current resistance on ingress but assist exits.",
        "- Redundant Life Support: Three independent submersible lights, dual isolated gas supplies, dual cutting devices, and line markers (directional arrows and non-directional cookies).",
    ]
    if intent and intent.site_id:
        s = get_cave_diving_site(intent.site_id)
        if s:
            lines.append(
                f"- Focused Cave Diving Site: {s.title} ({s.region}, Max Depth: {s.max_depth_m}m, Flow: {s.flow_type}, Rigging: {s.primary_rigging})"
            )
    return "\n".join(lines)


def format_cave_diving_response(
    intent: CaveDivingIntent,
    req: Optional[CaveDivingRequest] = None,
) -> FormattedCaveDivingResponse:
    calc_info: dict[str, Any]
    gear_info: dict[str, Any]
    detail_info: dict[str, Any]
    list_info: dict[str, Any]

    if intent.action in ("calculate_gas", "calculate"):
        calc_req = req or CaveDivingRequest(
            site_id=intent.site_id or "peacock-springs-karst",
            rigging_setup=intent.rigging_setup or "sidemount_dual_cylinder",
        )
        calc_res = calculate_cave_diving_gas(calc_req)
        answer = (
            f"Cave Diving Gas Management for {calc_res.site_title}: "
            f"Turn pressure is {calc_res.turn_pressure_psi} PSI (Usable gas: {calc_res.usable_gas_psi} PSI, "
            f"Reserve gas: {calc_res.reserve_gas_psi} PSI). "
            f"Guideline spool required: {calc_res.guideline_spool_required_m}m. "
            f"Penetration safety: {calc_res.penetration_safety.upper()}. "
            f"Silt risk: {calc_res.silt_risk}. "
            f"{calc_res.gas_management_advisory} {calc_res.decompression_advisory}"
        )
        calc_info = {
            "cave_diving_info": {
                "action": "calculate_gas",
                "site_id": calc_res.site_id,
                "calculation": calc_res.model_dump(),
            },
            "answer": answer,
        }
        return FormattedCaveDivingResponse(answer, calc_info)

    if intent.action in ("gear_checklist", "gear"):
        checklist = get_cave_diving_gear_checklist()
        items_str = "; ".join(f"{item.name} ({item.purpose})" for item in checklist)
        answer = (
            f"Mandatory Wilderness Cave Diving & Sump Penetration Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Divers must strictly maintain continuous guideline contact and verify 3 independent light sources."
        )
        gear_info = {
            "cave_diving_info": {
                "action": "gear_checklist",
                "gear": [item.model_dump() for item in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedCaveDivingResponse(answer, gear_info)

    if intent.action == "site_detail" and intent.site_id:
        site = get_cave_diving_site(intent.site_id)
        if site:
            highlights_str = ", ".join(site.highlights)
            answer = (
                f"Cave Diving Conduit: {site.title} ({site.system}, {site.region}). "
                f"Max Depth: {site.max_depth_m}m | Water Temp: {site.water_temp_c}°C | Flow Type: {site.flow_type} | "
                f"Primary Rigging: {site.primary_rigging} | Sump Length: {site.sump_length_m}m | Silt Risk: {site.silt_risk}. "
                f"{site.description} Key Highlights: {highlights_str}."
            )
            detail_info = {
                "cave_diving_info": {
                    "action": "site_detail",
                    "site_id": site.site_id,
                    "site": site.model_dump(),
                },
                "answer": answer,
            }
            return FormattedCaveDivingResponse(answer, detail_info)

    sites = get_cave_diving_sites(rigging=intent.rigging_setup)
    summary_str = "; ".join(
        f"{s.title} ({s.max_depth_m}m depth, {s.flow_type}, {s.primary_rigging})" for s in sites
    )
    answer = (
        f"Contoso Wilderness Cave Diving & Sump Penetration Catalog ({len(sites)} iconic conduits): {summary_str}. "
        "Inquire about specific site details, gas management & turn pressure calculations (Rule of Thirds/Sixths), "
        "or mandatory cave safety reels, lights, and sidemount checklists."
    )
    list_info = {
        "cave_diving_info": {
            "action": "sites_list",
            "rigging_setup": intent.rigging_setup,
            "sites": [s.model_dump() for s in sites],
        },
        "answer": answer,
    }
    return FormattedCaveDivingResponse(answer, list_info)
