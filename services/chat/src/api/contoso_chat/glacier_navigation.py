from typing import Any, Optional

from pydantic import BaseModel, Field


class GlacierZoneModel(BaseModel):
    zone_id: str
    title: str
    glacier_system: str
    region: str
    elevation_m: int
    hazard_level: str
    crevasse_pattern: str
    ladder_sections_required: bool
    typical_crossing_hours: float
    description: str
    route_highlights: list[str] = Field(default_factory=list)


class CrevasseNavigationRequest(BaseModel):
    zone_id: str = "khumbu-icefall-everest"
    team_size: int = 3
    snow_bridge_depth_m: float = 1.2
    crevasse_width_m: float = 2.0
    ambient_temp_f: float = 24.0
    rope_interval_m: float = 12.0


class CrevasseNavigationResponse(BaseModel):
    zone_id: str
    zone_title: str
    span_to_depth_ratio: float
    recommended_interval_m: int
    interval_status: str
    safety_status: str
    thermal_stability: str
    route_recommendation: str
    rescue_reserve_length_m: int


class GlacierGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class GlacierIntent(BaseModel):
    action: str  # "zones_list", "zone_detail", "calculate_navigation", "gear_checklist"
    zone_id: Optional[str] = None
    hazard: Optional[str] = None


class FormattedGlacierResponse(str):
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


DEFAULT_GLACIER_ZONES: dict[str, GlacierZoneModel] = {
    "khumbu-icefall-everest": GlacierZoneModel(
        zone_id="khumbu-icefall-everest",
        title="Khumbu Icefall Lower Maze",
        glacier_system="Khumbu Glacier",
        region="Sagarmatha National Park, Nepal",
        elevation_m=5350,
        hazard_level="extreme",
        crevasse_pattern="icefall_chaos",
        ladder_sections_required=True,
        typical_crossing_hours=6.5,
        description="Perilous labyrinth through shattered glacier seracs and bottomless crevasses at the gateway to the Western Cwm on Mount Everest.",
        route_highlights=[
            "Active serac collapse corridors",
            "Aluminum ladder crevasse bridges",
            "Fixed safety line anchors",
        ],
    ),
    "ingraham-glacier-rainier": GlacierZoneModel(
        zone_id="ingraham-glacier-rainier",
        title="Ingraham Direct & Disappointment Cleaver",
        glacier_system="Ingraham Glacier",
        region="Mount Rainier, WA, USA",
        elevation_m=3800,
        hazard_level="high",
        crevasse_pattern="bergschrund",
        ladder_sections_required=False,
        typical_crossing_hours=3.5,
        description="High-angle glaciated alpine route on Mount Rainier requiring early alpine morning starts to avoid active serac fall from Ingraham Glacier.",
        route_highlights=[
            "Bergschrund snow bridge crossing",
            "Upper icefall bypass traverse",
            "Crevasse field route wanding",
        ],
    ),
    "mer-de-glace-geant": GlacierZoneModel(
        zone_id="mer-de-glace-geant",
        title="Mer de Glace & Glacier du Géant",
        glacier_system="Mer de Glace",
        region="Mont Blanc Massif, Chamonix, France",
        elevation_m=3000,
        hazard_level="moderate",
        crevasse_pattern="transverse",
        ladder_sections_required=False,
        typical_crossing_hours=5.0,
        description="Classic Mont Blanc valley glacier featuring sprawling transverse crevasse fields, deep glacial moulins, and steep lateral moraines.",
        route_highlights=[
            "Labyrinth of transverse crevasses",
            "Moulin drainage abyss navigation",
            "Summer serac pinnacle instability",
        ],
    ),
    "root-glacier-st-elias": GlacierZoneModel(
        zone_id="root-glacier-st-elias",
        title="Root & Kennicott Glacier Confluence",
        glacier_system="Root Glacier",
        region="Wrangell-St. Elias National Park, AK, USA",
        elevation_m=1100,
        hazard_level="low",
        crevasse_pattern="longitudinal",
        ladder_sections_required=False,
        typical_crossing_hours=4.0,
        description="Expansive low-elevation subarctic glacier featuring visible dry ice fractures, sculpted ice staircases, and accessible crampon touring.",
        route_highlights=[
            "Open dry-ice crevasse bypasses",
            "Step-cutting around compression moraines",
            "Blue ice moulins and melt pools",
        ],
    ),
    "tasman-glacier-icefall": GlacierZoneModel(
        zone_id="tasman-glacier-icefall",
        title="Upper Tasman Glacier Icefall",
        glacier_system="Tasman Glacier",
        region="Aoraki / Mount Cook, New Zealand",
        elevation_m=2200,
        hazard_level="high",
        crevasse_pattern="marginal",
        ladder_sections_required=True,
        typical_crossing_hours=4.5,
        description="Dynamic Southern Alps icefall known for heavy maritime snowfall, delicate transitional snow bridges, and steep bergschrund crevasses.",
        route_highlights=[
            "Dynamic snow bridge collapse cycles",
            "Steep bergschrund negotiation",
            "Glacier headwall serac exposure",
        ],
    ),
}

DEFAULT_GLACIER_GEAR: list[GlacierGearRequirement] = [
    GlacierGearRequirement(
        item_id="avalanche-crevasse-probe",
        name="320cm Graduated Aluminum Snow & Crevasse Probe for Depth Verification",
        category="probing",
        mandatory=True,
        purpose="Measures snow bridge thickness, detects hidden crevasse lips, and verifies bridge density before team transit.",
    ),
    GlacierGearRequirement(
        item_id="crevasse-rescue-pulley-kit",
        name="Micro Traxion, Tibloc, and Prusik Cord Mechanical Advantage Rescue Kit",
        category="rescue",
        mandatory=True,
        purpose="Enables immediate 3:1 Z-pulley or 6:1 complex mechanical advantage extraction for fallen rope team members.",
    ),
    GlacierGearRequirement(
        item_id="dynamic-dry-glacier-rope",
        name="60m 8.9mm UIAA Dry-Treated Triple-Rated Dynamic Glacier Rope",
        category="rigging",
        mandatory=True,
        purpose="Connects rope teams across crevasse fields and holds crevasse fall shock loads with water-repellent sheath.",
    ),
    GlacierGearRequirement(
        item_id="forged-steel-crampons",
        name="12-Point Forged Steel Semi-Rigid Mountaineering Crampons with Anti-Balling Plates",
        category="traction",
        mandatory=True,
        purpose="Delivers secure penetration in blue glacial ice and prevents dangerous snow balling underfoot on slushy bridges.",
    ),
    GlacierGearRequirement(
        item_id="technical-ice-axe",
        name="Curved Alpine Mountaineering Ice Axe with Adze for T-Slot Excavation",
        category="anchoring",
        mandatory=True,
        purpose="Provides self-arrest capability, anchor digging for deadman t-slots, and testing icefall stability.",
    ),
    GlacierGearRequirement(
        item_id="bivy-hypothermia-wrap",
        name="Reflective Ultralight Emergency Bivy Sack & Heat-Reflecting Hypothermia Wrap",
        category="survival",
        mandatory=True,
        purpose="Protects injured or stranded climbers from windchill and rapid hypothermia during prolonged crevasse rescue.",
    ),
]


def get_glacier_zones(hazard: Optional[str] = None) -> list[GlacierZoneModel]:
    zones = list(DEFAULT_GLACIER_ZONES.values())
    if not hazard:
        return zones
    norm = hazard.strip().lower()
    return [z for z in zones if z.hazard_level.lower() == norm]


def get_glacier_zone_by_id(zone_id: str) -> Optional[GlacierZoneModel]:
    return DEFAULT_GLACIER_ZONES.get(zone_id.strip().lower())


def get_glacier_gear() -> list[GlacierGearRequirement]:
    return list(DEFAULT_GLACIER_GEAR)


def calculate_crevasse_navigation(request: CrevasseNavigationRequest) -> CrevasseNavigationResponse:
    zone = get_glacier_zone_by_id(request.zone_id)
    if not zone:
        raise ValueError(f"Glacier icefall zone '{request.zone_id}' not found")

    team_size = request.team_size
    snow_bridge_depth_m = request.snow_bridge_depth_m
    crevasse_width_m = request.crevasse_width_m
    ambient_temp_f = request.ambient_temp_f
    rope_interval_m = request.rope_interval_m

    span_to_depth_ratio = (
        round(snow_bridge_depth_m / crevasse_width_m, 2) if crevasse_width_m > 0 else 0.0
    )

    recommended_interval_m = 15 if team_size == 2 else 12 if team_size == 3 else 10

    if team_size == 2 and rope_interval_m < 14:
        interval_status = "unsafe"
    elif team_size >= 3 and rope_interval_m < 8:
        interval_status = "unsafe"
    elif team_size >= 3 and rope_interval_m > 16:
        interval_status = "adequate"
    else:
        interval_status = "optimal"

    if ambient_temp_f > 34 or span_to_depth_ratio < 0.33:
        safety_status = "hazardous_bypass_required"
    elif ambient_temp_f >= 29 or span_to_depth_ratio < 0.5:
        safety_status = "caution_belayed_crossing_only"
    else:
        safety_status = "safe_crossing"

    if ambient_temp_f <= 25:
        thermal_stability = "Firm refrozen crust and solid firn matrix; minimal melting risk."
    elif ambient_temp_f <= 32:
        thermal_stability = "Near freezing; monitor solar radiation and bridge sag under load."
    else:
        thermal_stability = (
            "Critical thermal warming; high risk of punch-through and serac collapse."
        )

    rescue_reserve_length_m = max(0, int(60 - ((team_size - 1) * rope_interval_m)))

    recs = []
    if safety_status == "hazardous_bypass_required":
        recs.append(
            "DANGER: Snow bridge thickness or thermal conditions pose critical collapse hazards. "
            "Seek an alternate crevasse crossing or bypass route immediately."
        )
    elif safety_status == "caution_belayed_crossing_only":
        recs.append(
            "CAUTION: Marginal bridge span ratio or near-freezing temperatures. "
            "Team members must cross one-at-a-time on a tight belay with probe-verified anchors."
        )
    else:
        recs.append(
            "SAFE: Bridge structural ratio is solid and firn matrix is firmly refrozen. "
            "Maintain steady pace and rope discipline."
        )

    if interval_status == "unsafe":
        recs.append(
            f"Adjust rope interval: Current interval ({rope_interval_m}m) is unsafe for team size {team_size}; "
            f"adjust to recommended {recommended_interval_m}m."
        )
    elif interval_status == "adequate":
        recs.append(
            f"Notice: Rope interval ({rope_interval_m}m) is wide; monitor slack and rope drag closely."
        )

    if zone.ladder_sections_required:
        recs.append(
            f"{zone.title} requires aluminum ladder bridging over wide crevasses; clip fixed safety lines."
        )

    route_recommendation = " ".join(recs)

    return CrevasseNavigationResponse(
        zone_id=zone.zone_id,
        zone_title=zone.title,
        span_to_depth_ratio=span_to_depth_ratio,
        recommended_interval_m=recommended_interval_m,
        interval_status=interval_status,
        safety_status=safety_status,
        thermal_stability=thermal_stability,
        route_recommendation=route_recommendation,
        rescue_reserve_length_m=rescue_reserve_length_m,
    )


def detect_glacier_intent(query: str) -> Optional[GlacierIntent]:
    if not query or not query.strip():
        return None

    q = query.lower()

    # Exclusions for unrelated customer support intents
    ecommerce_exclusions = [
        "refund",
        "order #",
        "return label",
        "shipping tracking",
    ]
    if any(ex in q for ex in ecommerce_exclusions):
        return None

    # Guided tour / clinic / prerequisite adventure exclusions
    adventure_exclusions = [
        "previous experience",
        "experience required",
        "prerequisite",
        "prerequisites",
        "guided tour",
        "guided trip",
        "guided climb",
        "adventure tour",
        "skills clinic",
        "clinic",
        "lead guide",
        "sign up",
        "book a tour",
        "cost of tour",
    ]
    if any(ex in q for ex in adventure_exclusions):
        return None

    # Mountaineering specific exclusions (routes / gear specific to mountaineering service)
    mountaineering_exclusions = [
        "disappointment cleaver",
        "coleman deming",
        "avalanche gulch",
        "pearly gates",
        "brake knot",
        "brake knots",
        "snow picket",
        "snow pickets",
        "turnaround time",
    ]
    if any(ex in q for ex in mountaineering_exclusions):
        return None

    # Glacier navigation keywords
    glacier_keywords = [
        "glacier",
        "crevasse",
        "icefall",
        "serac",
        "snow bridge",
        "khumbu",
        "ingraham",
        "mer de glace",
        "root glacier",
        "kennicott",
        "tasman",
        "rope interval",
        "crevasse rescue",
        "probe depth",
        "depth probing",
        "bridge probing",
    ]
    if not any(k in q for k in glacier_keywords):
        return None

    # Detect Zone ID
    zone_id: Optional[str] = None
    if "khumbu" in q or "everest" in q:
        zone_id = "khumbu-icefall-everest"
    elif "ingraham" in q:
        zone_id = "ingraham-glacier-rainier"
    elif "mer de glace" in q or "geant" in q or "chamonix" in q:
        zone_id = "mer-de-glace-geant"
    elif "root" in q or "kennicott" in q or "st elias" in q or "st. elias" in q:
        zone_id = "root-glacier-st-elias"
    elif "tasman" in q or "aoraki" in q or "grand plateau" in q:
        zone_id = "tasman-glacier-icefall"

    # Detect Hazard Level
    hazard: Optional[str] = None
    if "extreme" in q:
        hazard = "extreme"
    elif "high" in q:
        hazard = "high"
    elif "moderate" in q:
        hazard = "moderate"
    elif "low" in q:
        hazard = "low"

    # Detect Action
    if any(
        k in q
        for k in [
            "calculate",
            "calculation",
            "interval",
            "probing",
            "probe depth",
            "snow bridge depth",
            "span",
            "reserve",
            "stability",
        ]
    ):
        action = "calculate_navigation"
    elif any(
        k in q
        for k in [
            "gear",
            "checklist",
            "equipment",
            "rescue kit",
            "kit",
            "pulley",
            "crampons",
            "probe",
            "rope",
            "axe",
        ]
    ):
        action = "gear_checklist"
    elif zone_id and any(
        k in q
        for k in [
            "detail",
            "beta",
            "tell me about",
            "highlights",
            "pattern",
            "ladder",
            "elevation",
            "hours",
            "about",
        ]
    ):
        action = "zone_detail"
    elif any(
        k in q
        for k in [
            "zones",
            "catalog",
            "list",
            "destinations",
            "show me",
            "routes",
            "icefall routes",
            "icefalls",
        ]
    ):
        action = "zones_list"
    elif zone_id:
        action = "zone_detail"
    else:
        action = "zones_list"

    return GlacierIntent(
        action=action,
        zone_id=zone_id,
        hazard=hazard,
    )


extract_glacier_intent = detect_glacier_intent


def build_glacier_prompt(intent: GlacierIntent) -> str:
    lines = [
        "Glacier Crevasse Navigation & Icefall Routefinding Expert Beta:",
        "- Glacier Crevasse Dynamics: Navigating icefall chaos, bergschrunds, and transverse/longitudinal crevasse networks.",
        "- Snow Bridge Probing: Depth-to-span ratio thresholds (ratio >= 0.5 safe, 0.33-0.5 caution belayed, < 0.33 hazard bypass).",
        "- Rope Intervals & Rescue Reserve: Recommended rope intervals (2-person: 15m; 3-person: 12m; 4-person: 10m). Minimum 30m rescue coil reserve.",
        "- Thermal Stability: Sub-freezing firn consolidation vs critical daytime solar warming and serac collapse hazard.",
    ]

    if intent.zone_id:
        zone = get_glacier_zone_by_id(intent.zone_id)
        if zone:
            lines.extend(
                [
                    f"- Focused Icefall Zone: {zone.title} ({zone.glacier_system}, {zone.region})",
                    f"  Elevation: {zone.elevation_m}m | Hazard: {zone.hazard_level} | Pattern: {zone.crevasse_pattern}",
                    f"  Ladders Required: {zone.ladder_sections_required} | Crossing Duration: {zone.typical_crossing_hours}h",
                    f"  Highlights: {', '.join(zone.route_highlights)}",
                    f"  Description: {zone.description}",
                ]
            )
    else:
        zones = get_glacier_zones(hazard=intent.hazard)
        lines.append(
            f"- Featured Iconic Icefall Zones: {'; '.join(f'{z.title} ({z.hazard_level} hazard, {z.region})' for z in zones)}"
        )

    return chr(10).join(lines)


def format_glacier_response(intent: GlacierIntent, query: str = "") -> FormattedGlacierResponse:
    if intent.action == "calculate_navigation":
        target_zone_id = intent.zone_id or "khumbu-icefall-everest"
        req = CrevasseNavigationRequest(
            zone_id=target_zone_id,
            team_size=3,
            snow_bridge_depth_m=1.2,
            crevasse_width_m=2.0,
            ambient_temp_f=24.0,
            rope_interval_m=12.0,
        )
        plan = calculate_crevasse_navigation(req)
        answer = (
            f"Crevasse Navigation & Routefinding Plan for {plan.zone_title}: "
            f"Span-to-Depth Ratio: {plan.span_to_depth_ratio:.2f}. "
            f"Recommended Rope Interval: {plan.recommended_interval_m}m (status: {plan.interval_status}). "
            f"Rescue Reserve Rope: {plan.rescue_reserve_length_m}m. "
            f"Safety Status: {plan.safety_status}. "
            f"Thermal Stability: {plan.thermal_stability} "
            f"Recommendation: {plan.route_recommendation}"
        )
        calc_info: dict[str, Any] = {
            "action": "calculate_navigation",
            "calculation": plan.model_dump(),
            "plan": plan.model_dump(),
        }
        return FormattedGlacierResponse(answer, {"answer": answer, "glacier_info": calc_info})

    if intent.action == "gear_checklist":
        gear = get_glacier_gear()
        mandatory_count = sum(1 for g in gear if g.mandatory)
        answer = (
            f"Mandatory Glacier Crevasse Safety Kit ({len(gear)} items): "
            + "; ".join(f"{g.name} ({g.purpose})" for g in gear)
            + ". Always conduct pre-crossing beacon checks and verify chest harness tie-ins."
        )
        gear_info: dict[str, Any] = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
            "mandatory_count": mandatory_count,
        }
        return FormattedGlacierResponse(answer, {"answer": answer, "glacier_info": gear_info})

    if intent.action == "zone_detail" and intent.zone_id:
        zone = get_glacier_zone_by_id(intent.zone_id)
        if zone:
            answer = (
                f"Glacier Icefall Route Beta — {zone.title} ({zone.glacier_system}, {zone.region}): "
                f"Elevation: {zone.elevation_m}m | Hazard: {zone.hazard_level} | Crevasse Pattern: {zone.crevasse_pattern}. "
                f"Ladder Sections Required: {zone.ladder_sections_required} | Crossing Duration: {zone.typical_crossing_hours}h. "
                f"Highlights: {', '.join(zone.route_highlights)}. {zone.description}"
            )
            detail_info: dict[str, Any] = {
                "action": "zone_detail",
                "zone": zone.model_dump(),
            }
            return FormattedGlacierResponse(answer, {"answer": answer, "glacier_info": detail_info})

    # Default: zones_list
    zones = get_glacier_zones(hazard=intent.hazard)
    summary = "; ".join(f"{z.title} ({z.hazard_level} hazard, {z.elevation_m}m)" for z in zones)
    answer = (
        f"Contoso Iconic Glacier & Icefall Navigation Catalog ({len(zones)} zones): {summary}. "
        "Inquire about specific icefall routes, crevasse safety calculations, or mandatory rescue gear."
    )
    list_info: dict[str, Any] = {
        "action": "zones_list",
        "zones": [z.model_dump() for z in zones],
    }
    return FormattedGlacierResponse(answer, {"answer": answer, "glacier_info": list_info})
