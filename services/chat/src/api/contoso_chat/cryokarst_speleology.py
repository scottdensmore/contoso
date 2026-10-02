from enum import Enum
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator


class CryokarstConduitType(str, Enum):
    VERTICAL_MOULIN_SHAFT = "vertical_moulin_shaft"
    HORIZONTAL_SUBGLACIAL_TUNNEL = "horizontal_subglacial_tunnel"
    BERGSCHRUND_FRACTURE_CLEFT = "bergschrund_fracture_cleft"
    ICE_SIPHON_SUMP_CAVE = "ice_siphon_sump_cave"
    VOLCANIC_FUMAROLE_MELT_CAVE = "volcanic_fumarole_melt_cave"


class IceStabilityClass(str, Enum):
    COLD_POLAR_STABLE = "cold_polar_stable"
    TEMPERATE_FIRN_DYNAMIC = "temperate_firn_dynamic"
    THERMAL_ABLATION_UNSTABLE = "thermal_ablation_unstable"


class MeltwaterFlowState(str, Enum):
    BONE_DRY_WINTER_DORMANT = "bone_dry_winter_dormant"
    LOW_TRICKLE_FROZEN = "low_trickle_frozen"
    MODERATE_SUBGLACIAL_STREAM = "moderate_subglacial_stream"
    HIGH_RISK_DIURNAL_SURGE = "high_risk_diurnal_surge"
    CONTINUOUS_THERMAL_DRIP = "continuous_thermal_drip"


class CryokarstAnchorSystem(str, Enum):
    STANDARD_17CM = "standard_17cm"
    LONG_21CM = "long_21cm"
    V_THREAD_ABALAKOV = "v_thread_abalakov"


class CryokarstSafetyTriage(str, Enum):
    NOMINAL_STABLE_COLD_ICE = "nominal_stable_cold_ice"
    CAUTION_DIURNAL_MELT_MONITORING = "caution_diurnal_melt_monitoring"
    CRITICAL_ABLATION_COLLAPSE_DANGER = "critical_ablation_collapse_danger"


class CryokarstSite(BaseModel):
    id: str
    title: str = ""
    name: str = ""
    site_id: str = ""
    region: str = ""
    range: str = ""
    depth_meters: int = 0
    conduit_type: str = CryokarstConduitType.VERTICAL_MOULIN_SHAFT.value
    ice_stability_class: str = IceStabilityClass.COLD_POLAR_STABLE.value
    meltwater_flow_state: str = MeltwaterFlowState.LOW_TRICKLE_FROZEN.value
    description: str = ""
    highlights: list[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "id",
                "site_id": "id",
                "depthMeters": "depth_meters",
                "conduitType": "conduit_type",
                "iceStabilityClass": "ice_stability_class",
                "meltwaterFlowState": "meltwater_flow_state",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
            if "title" in data and "name" not in data:
                data["name"] = data["title"]
            elif "name" in data and "title" not in data:
                data["title"] = data["name"]
            if "id" in data and not data.get("site_id"):
                data["site_id"] = data["id"]
        return data

    @property
    def siteId(self) -> str:
        return self.id

    @property
    def depthMeters(self) -> int:
        return self.depth_meters

    @property
    def conduitType(self) -> str:
        return self.conduit_type

    @property
    def iceStabilityClass(self) -> str:
        return self.ice_stability_class

    @property
    def meltwaterFlowState(self) -> str:
        return self.meltwater_flow_state


class CryokarstDynamicsQuery(BaseModel):
    site_id: str = "matanuska-glacier-moulin-chamber"
    conduit_type: str = CryokarstConduitType.VERTICAL_MOULIN_SHAFT.value
    ice_stability: str = IceStabilityClass.COLD_POLAR_STABLE.value
    anchor_system: str = CryokarstAnchorSystem.LONG_21CM.value
    ambient_ice_temp_c: float = -6.0
    descent_depth_meters: float = 45.0
    diurnal_solar_exposure_hours: float = 4.0
    team_size: int = 3

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "site_id",
                "conduitType": "conduit_type",
                "iceStability": "ice_stability",
                "ice_stability_class": "ice_stability",
                "iceStabilityClass": "ice_stability",
                "anchorSystem": "anchor_system",
                "ambientIceTempC": "ambient_ice_temp_c",
                "descentDepthMeters": "descent_depth_meters",
                "diurnalSolarExposureHours": "diurnal_solar_exposure_hours",
                "teamSize": "team_size",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def siteId(self) -> str:
        return self.site_id

    @property
    def conduitType(self) -> str:
        return self.conduit_type

    @property
    def iceStability(self) -> str:
        return self.ice_stability

    @property
    def anchorSystem(self) -> str:
        return self.anchor_system

    @property
    def ambientIceTempC(self) -> float:
        return self.ambient_ice_temp_c

    @property
    def descentDepthMeters(self) -> float:
        return self.descent_depth_meters

    @property
    def diurnalSolarExposureHours(self) -> float:
        return self.diurnal_solar_exposure_hours

    @property
    def teamSize(self) -> int:
        return self.team_size


class CryokarstDynamicsResult(BaseModel):
    site_title: str
    site_id: Optional[str] = None
    anchor_creep_rate_mm_hr: float
    thermal_ablation_velocity_mm_day: float
    jokulhlaup_outburst_risk_index: float
    safety_triage: str
    anchor_rigging_advisory: str
    subglacial_escape_protocol: str

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteTitle": "site_title",
                "siteId": "site_id",
                "anchorCreepRateMmHr": "anchor_creep_rate_mm_hr",
                "thermalAblationVelocityMmDay": "thermal_ablation_velocity_mm_day",
                "jokulhlaupOutburstRiskIndex": "jokulhlaup_outburst_risk_index",
                "safetyTriage": "safety_triage",
                "anchorRiggingAdvisory": "anchor_rigging_advisory",
                "subglacialEscapeProtocol": "subglacial_escape_protocol",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def siteTitle(self) -> str:
        return self.site_title

    @property
    def siteId(self) -> Optional[str]:
        return self.site_id

    @property
    def anchorCreepRateMmHr(self) -> float:
        return self.anchor_creep_rate_mm_hr

    @property
    def thermalAblationVelocityMmDay(self) -> float:
        return self.thermal_ablation_velocity_mm_day

    @property
    def jokulhlaupOutburstRiskIndex(self) -> float:
        return self.jokulhlaup_outburst_risk_index

    @property
    def safetyTriage(self) -> str:
        return self.safety_triage

    @property
    def anchorRiggingAdvisory(self) -> str:
        return self.anchor_rigging_advisory

    @property
    def subglacialEscapeProtocol(self) -> str:
        return self.subglacial_escape_protocol


class CryokarstGearItem(BaseModel):
    item_id: str
    id: str = ""
    name: str = ""
    category: str = ""
    mandatory: bool = True
    description: str = ""
    purpose: str = ""

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "itemId" in data and not data.get("item_id"):
                data["item_id"] = data["itemId"]
            if "id" in data and not data.get("item_id"):
                data["item_id"] = data["id"]
            elif "item_id" in data and not data.get("id"):
                data["id"] = data["item_id"]
            if "purpose" in data and not data.get("description"):
                data["description"] = data["purpose"]
            elif "description" in data and not data.get("purpose"):
                data["purpose"] = data["description"]
        return data

    @property
    def itemId(self) -> str:
        return self.item_id


class CryokarstSpeleologyIntent(BaseModel):
    action: Literal["catalog", "get_site", "calculate", "gear_checklist"] = "catalog"
    site_id: Optional[str] = None
    query: Optional[str] = None
    conduit_type: Optional[str] = None


class FormattedCryokarstSpeleologyResponse(str):
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


DEFAULT_CRYOKARST_SITES: dict[str, CryokarstSite] = {
    "matanuska-glacier-moulin-chamber": CryokarstSite(
        id="matanuska-glacier-moulin-chamber",
        title="Matanuska Glacier Deep Moulin Chamber",
        name="Matanuska Glacier Deep Moulin Chamber",
        site_id="matanuska-glacier-moulin-chamber",
        region="Palmer, Alaska",
        range="Chugach Mountains",
        depth_meters=65,
        conduit_type=CryokarstConduitType.VERTICAL_MOULIN_SHAFT.value,
        ice_stability_class=IceStabilityClass.COLD_POLAR_STABLE.value,
        meltwater_flow_state=MeltwaterFlowState.LOW_TRICKLE_FROZEN.value,
        description="Sheer cylindrical vertical shaft plunged through compression ice into crystalline subglacial chambers within the Matanuska ice sheet.",
        highlights=[
            "65m vertical rappel through blue firn and compression ice",
            "Deep subglacial cathedral chamber with acoustical resonance",
            "Active cryoconite deposit formations on shaft walls",
        ],
    ),
    "root-glacier-cryokarst-conduit": CryokarstSite(
        id="root-glacier-cryokarst-conduit",
        title="Root Glacier Subglacial Fluvial Conduit",
        name="Root Glacier Subglacial Fluvial Conduit",
        site_id="root-glacier-cryokarst-conduit",
        region="Wrangell-St. Elias, Alaska",
        range="Wrangell Mountains",
        depth_meters=40,
        conduit_type=CryokarstConduitType.HORIZONTAL_SUBGLACIAL_TUNNEL.value,
        ice_stability_class=IceStabilityClass.TEMPERATE_FIRN_DYNAMIC.value,
        meltwater_flow_state=MeltwaterFlowState.MODERATE_SUBGLACIAL_STREAM.value,
        description="Meandering subglacial canyon featuring hydraulic scalloping, sculpted ice arches, and clear water flumes along the bedrock interface.",
        highlights=[
            "Smooth scalloped flume tunnels revealing annual ice layers",
            "Dynamic subglacial drainage conduit with bedrock contact",
            "Stunning translucent cobalt ice ceilings",
        ],
    ),
    "athabasca-glacier-crevasse-chasm": CryokarstSite(
        id="athabasca-glacier-crevasse-chasm",
        title="Athabasca Glacier Bergschrund Crevasse Chasm",
        name="Athabasca Glacier Bergschrund Crevasse Chasm",
        site_id="athabasca-glacier-crevasse-chasm",
        region="Jasper National Park, Alberta",
        range="Canadian Rockies",
        depth_meters=85,
        conduit_type=CryokarstConduitType.BERGSCHRUND_FRACTURE_CLEFT.value,
        ice_stability_class=IceStabilityClass.THERMAL_ABLATION_UNSTABLE.value,
        meltwater_flow_state=MeltwaterFlowState.HIGH_RISK_DIURNAL_SURGE.value,
        description="Towering fracture cleft opened along the bergschrund separating dynamic firn from bedrock headwall, subject to intense diurnal melt cycles.",
        highlights=[
            "85m deep technical fracture canyon with hanging seracs",
            "Intense diurnal hydrological surge channels",
            "Complex structural ice fracture mechanics and crevasse bridging",
        ],
    ),
    "gorner-glacier-zermatt-cryokarst": CryokarstSite(
        id="gorner-glacier-zermatt-cryokarst",
        title="Gorner Glacier Cryokarst Siphon & Sump Cave",
        name="Gorner Glacier Cryokarst Siphon & Sump Cave",
        site_id="gorner-glacier-zermatt-cryokarst",
        region="Zermatt, Valais",
        range="Pennine Alps",
        depth_meters=110,
        conduit_type=CryokarstConduitType.ICE_SIPHON_SUMP_CAVE.value,
        ice_stability_class=IceStabilityClass.COLD_POLAR_STABLE.value,
        meltwater_flow_state=MeltwaterFlowState.BONE_DRY_WINTER_DORMANT.value,
        description="Europe's premier deep glacial cryokarst system, featuring subterranean ice sumps, siphon tubes, and high-pressure subglacial labyrinths.",
        highlights=[
            "110m descent into dormant winter glacial siphon network",
            "Intricate frozen sump tubes with crystalline frazil ice",
            "High-angle ascending ice pitches requiring technical lead tools",
        ],
    ),
    "palmer-glacier-fumarole-ice-caves": CryokarstSite(
        id="palmer-glacier-fumarole-ice-caves",
        title="Palmer Glacier Volcanic Fumarole Melt Caves",
        name="Palmer Glacier Volcanic Fumarole Melt Caves",
        site_id="palmer-glacier-fumarole-ice-caves",
        region="Mount Hood, Oregon",
        range="Cascade Range",
        depth_meters=50,
        conduit_type=CryokarstConduitType.VOLCANIC_FUMAROLE_MELT_CAVE.value,
        ice_stability_class=IceStabilityClass.THERMAL_ABLATION_UNSTABLE.value,
        meltwater_flow_state=MeltwaterFlowState.CONTINUOUS_THERMAL_DRIP.value,
        description="Subglacial thermal cavern carved by geothermal fumarolic steam venting through basal glacier ice on Mount Hood.",
        highlights=[
            "Geothermal gas venting creating massive vaulted ice domes",
            "Continuous hydrothermal ablation and sulfuric dripping",
            "Requires continuous toxic gas monitoring (H2S, CO2, SO2)",
        ],
    ),
}


DEFAULT_CRYOKARST_GEAR: list[CryokarstGearItem] = [
    CryokarstGearItem(
        item_id="sub-zero-dry-caving-suit",
        id="sub-zero-dry-caving-suit",
        name="Sub-Zero Thermal Waterproof Cryo-Caving Drysuit",
        category="Thermal & Moisture Protection",
        mandatory=True,
        description="Fully sealed waterproof and abrasion-resistant drysuit with integrated latex gaskets and fleece thermal liner for freezing subglacial water immersion.",
        purpose="Hypothermia prevention in freezing subglacial streams and meltwater sprays.",
    ),
    CryokarstGearItem(
        item_id="dual-tube-stainless-ice-screws",
        id="dual-tube-stainless-ice-screws",
        name="21cm Dual-Tube Stainless Steel Ice Screws (Set of 8)",
        category="Anchoring & Rigging",
        mandatory=True,
        description="Aggressive reverse-angle thread ice screws engineered for cold dense glacial ice and rapid bite placement.",
        purpose="Primary multipoint anchor equalisation in glacial moulin walls.",
    ),
    CryokarstGearItem(
        item_id="abalakov-v-thread-hooker",
        id="abalakov-v-thread-hooker",
        name="Ergonomic Abalakov V-Thread Hooker & Rigging Tool",
        category="Anchor Construction",
        mandatory=True,
        description="Long-reach steel retrieval hook with integrated tube cleaner for threading cord through intersecting 21cm boreholes.",
        purpose="Creating zero-hardware zero-creep bail anchors in glacial ice.",
    ),
    CryokarstGearItem(
        item_id="subglacial-multi-gas-detector",
        id="subglacial-multi-gas-detector",
        name="Subglacial Multi-Gas Atmospheric Monitor (CO2, H2S, O2)",
        category="Atmospheric Safety",
        mandatory=True,
        description="Intrinsically safe audible and visual multi-gas monitor calibrated for volcanic fumarole caves and hypoxic subglacial sumps.",
        purpose="Detecting deadly volcanic steam gas accumulation and hypoxic pockets.",
    ),
    CryokarstGearItem(
        item_id="watertight-submersible-headlamp",
        id="watertight-submersible-headlamp",
        name="IPX8 Submersible 1200 Lumen Dual-Beam Headlamp",
        category="Illumination",
        mandatory=True,
        description="Submersible cold-temperature rated headlamp with redundant Li-ion battery pack and wide diffuse beam for ice cave navigation.",
        purpose="High-output subterranean route finding and chamber illumination.",
    ),
    CryokarstGearItem(
        item_id="cryo-traction-ice-crampons",
        id="cryo-traction-ice-crampons",
        name="Semi-Rigid Monopoint Cryo-Traction Ice Crampons",
        category="Glacier Traction",
        mandatory=True,
        description="Aggressive forged steel front-point crampons optimized for vertical hard waterfall ice and subglacial limestone-ice interfaces.",
        purpose="Ascending vertical moulin flutes and maneuvering along subglacial river channels.",
    ),
]


def get_cryokarst_sites(
    conduit_type: Optional[str] = None,
) -> list[CryokarstSite]:
    all_sites = list(DEFAULT_CRYOKARST_SITES.values())
    if not conduit_type:
        return all_sites
    norm = conduit_type.strip().lower()
    return [
        s
        for s in all_sites
        if s.conduit_type.lower() == norm
    ]


def get_cryokarst_site(site_id: str) -> Optional[CryokarstSite]:
    return DEFAULT_CRYOKARST_SITES.get(site_id)


def get_cryokarst_gear() -> list[CryokarstGearItem]:
    return list(DEFAULT_CRYOKARST_GEAR)


def calculate_cryokarst_dynamics(query: CryokarstDynamicsQuery) -> CryokarstDynamicsResult:
    site = get_cryokarst_site(query.site_id)
    if not site:
        raise ValueError(f"Cryokarst site '{query.site_id}' not found")

    site_title = site.title

    # Temperature factor
    temp_factor = max(0.2, (query.ambient_ice_temp_c + 16.0) / 10.0)

    # Anchor multiplier
    anchor_sys = str(query.anchor_system).lower()
    if CryokarstAnchorSystem.STANDARD_17CM.value in anchor_sys or "17cm" in anchor_sys:
        anchor_mult = 1.4
    elif CryokarstAnchorSystem.V_THREAD_ABALAKOV.value in anchor_sys or "abalakov" in anchor_sys or "v_thread" in anchor_sys:
        anchor_mult = 0.65
    else:
        anchor_mult = 1.0

    # Anchor creep rate mm/hr
    anchor_creep_rate_mm_hr = round(
        1.5 * temp_factor * anchor_mult * (query.team_size / 3.0),
        1,
    )

    # Thermal ablation velocity mm/day
    is_thermal_unstable = (
        query.ice_stability == IceStabilityClass.THERMAL_ABLATION_UNSTABLE.value
        or query.ice_stability == IceStabilityClass.THERMAL_ABLATION_UNSTABLE
    )
    thermal_ablation_velocity_mm_day = round(
        5.0 + query.diurnal_solar_exposure_hours * 3.5 + (25.0 if is_thermal_unstable else 0.0),
        1,
    )

    # Jokulhlaup outburst risk index
    base_risk = (
        (query.descent_depth_meters / 120.0) * 0.4
        + (query.diurnal_solar_exposure_hours / 12.0) * 0.35
        + (0.25 if is_thermal_unstable else 0.05)
    )
    jokulhlaup_outburst_risk_index = min(0.99, max(0.08, round(base_risk, 2)))

    # Safety triage
    if (
        jokulhlaup_outburst_risk_index >= 0.70
        or is_thermal_unstable
        or anchor_creep_rate_mm_hr >= 3.5
    ):
        safety_triage = CryokarstSafetyTriage.CRITICAL_ABLATION_COLLAPSE_DANGER.value
        anchor_rigging_advisory = (
            "CRITICAL HAZARD: Rapid ice creep and elevated ablation detected. Do NOT rely on standard screws. "
            "Establish redundant 21cm stainless screws backed by equalized multi-point Abalakov v-threads with hourly torque monitoring."
        )
        subglacial_escape_protocol = (
            "EMERGENCY RETREAT PROTOCOL: Evacuate conduit immediately. Ascend vertical moulin shafts before afternoon diurnal solar surge "
            "to prevent entrapment from jokulhlaup outburst or hydraulic dam breach."
        )
    elif (
        jokulhlaup_outburst_risk_index >= 0.40
        or query.ambient_ice_temp_c > -1.0
    ):
        safety_triage = CryokarstSafetyTriage.CAUTION_DIURNAL_MELT_MONITORING.value
        anchor_rigging_advisory = (
            "CAUTION: Moderate creep displacement and active solar ablation. Inspect anchor collar melt rings hourly. "
            "Utilize 21cm ice screws with thread insulation sleeves and secondary cord backups."
        )
        subglacial_escape_protocol = (
            "DIURNAL MONITORING ESCAPE PLAN: Monitor subglacial water trickle gauges. Establish fixed egress lines with rebelays "
            "rigged well above active meltwater thalwegs."
        )
    else:
        safety_triage = CryokarstSafetyTriage.NOMINAL_STABLE_COLD_ICE.value
        anchor_rigging_advisory = (
            "NOMINAL: Stable cold polar ice matrix. Standard 21cm screws or paired Abalakov v-threads provide optimal holding power "
            "with minimal creeping displacement."
        )
        subglacial_escape_protocol = (
            "STANDARD SPELEOLOGY PROTOCOL: Maintain ascending lines rigged above siphon choke points. Follow marked survey corridors "
            "with redundant communications."
        )

    return CryokarstDynamicsResult(
        site_title=site_title,
        site_id=site.id if site else query.site_id,
        anchor_creep_rate_mm_hr=anchor_creep_rate_mm_hr,
        thermal_ablation_velocity_mm_day=thermal_ablation_velocity_mm_day,
        jokulhlaup_outburst_risk_index=jokulhlaup_outburst_risk_index,
        safety_triage=safety_triage,
        anchor_rigging_advisory=anchor_rigging_advisory,
        subglacial_escape_protocol=subglacial_escape_protocol,
    )


def detect_cryokarst_speleology_intent(message: str) -> bool:
    if not message or not message.strip():
        return False

    q = message.lower().strip()

    # Prioritized domain keywords that override generic caving/siphon overlap
    cryokarst_keywords = [
        "cryokarst",
        "ice cave",
        "glacier cave",
        "moulin",
        "subglacial",
        "cryoconite",
        "jokulhlaup",
        "fumarole cave",
        "bergschrund crevasse",
        "ice speleology",
        "ice shaft",
        "firn dynamic",
        "thermal ablation",
        "subglacial tunnel",
        "subglacial stream",
        "ice siphon",
    ]

    site_matches = [
        "matanuska",
        "root glacier",
        "athabasca",
        "gorner",
        "palmer glacier",
        "matanuska-glacier-moulin-chamber",
        "root-glacier-cryokarst-conduit",
        "athabasca-glacier-crevasse-chasm",
        "gorner-glacier-zermatt-cryokarst",
        "palmer-glacier-fumarole-ice-caves",
    ]

    is_explicit_cryokarst = any(k in q for k in cryokarst_keywords) or any(sm in q for sm in site_matches)

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
        "lookout",
        "alidade",
        "osborne",
        "snowshoe",
        "sandboarding",
        "cave diving",
        "siphon",
        "sump",
        "cave pearl",
        "speleothem",
        "cave mineralogy",
        "bog shoeing",
        "bog-shoeing",
        "muskeg",
        "peatland",
        "ski touring",
        "steep skiing",
        "nordic",
        "telemark",
        "falconry",
        "llama",
        "pack llama",
        "zipline",
        "zip line",
        "turtle patrol",
        "sea turtle",
        "night via ferrata",
        "via ferrata",
        "canyon bouldering",
        "bouldering",
        "mudflat trekking",
        "mudflat",
        "weather station",
        "anemometry",
        "smoke advisory",
        "smoke",
        "rentals",
        "rental",
        "snowkite",
        "snowkiting",
        "kite",
        "kiting",
        "foil kite",
        "chickenloop",
        "dog sled",
        "mushing",
        "pulk",
        "crevasse pulk",
        "pothole",
        "pot-hole",
        "sandtrap",
        "cheater stick",
        "tundra lichen",
        "lichen",
        "bryophyte",
    ]

    # If it is not explicitly about cryokarst / glacier caves, apply all exclusions
    if not is_explicit_cryokarst:
        if any(ex in q for ex in exclusions):
            return False
        return False

    # When explicit cryokarst is present, still reject non-chat / order ecommerce queries
    ecommerce_exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in ecommerce_exclusions):
        return False

    return True


def extract_cryokarst_speleology_intent(message: str) -> CryokarstSpeleologyIntent:
    q = message.lower().strip()

    matched_site_id: Optional[str] = None
    if "matanuska" in q:
        matched_site_id = "matanuska-glacier-moulin-chamber"
    elif "root glacier" in q or "root-glacier" in q:
        matched_site_id = "root-glacier-cryokarst-conduit"
    elif "athabasca" in q:
        matched_site_id = "athabasca-glacier-crevasse-chasm"
    elif "gorner" in q or "zermatt" in q:
        matched_site_id = "gorner-glacier-zermatt-cryokarst"
    elif "palmer" in q:
        matched_site_id = "palmer-glacier-fumarole-ice-caves"
    else:
        for s_id in DEFAULT_CRYOKARST_SITES:
            if s_id in q:
                matched_site_id = s_id
                break

    conduit_type: Optional[str] = None
    if "moulin" in q or "vertical" in q or "shaft" in q:
        conduit_type = CryokarstConduitType.VERTICAL_MOULIN_SHAFT.value
    elif "fluvial" in q or "horizontal" in q or "tunnel" in q:
        conduit_type = CryokarstConduitType.HORIZONTAL_SUBGLACIAL_TUNNEL.value
    elif "bergschrund" in q or "cleft" in q or "fracture" in q:
        conduit_type = CryokarstConduitType.BERGSCHRUND_FRACTURE_CLEFT.value
    elif "siphon" in q or "sump" in q:
        conduit_type = CryokarstConduitType.ICE_SIPHON_SUMP_CAVE.value
    elif "fumarole" in q or "volcanic" in q:
        conduit_type = CryokarstConduitType.VOLCANIC_FUMAROLE_MELT_CAVE.value
    elif matched_site_id and matched_site_id in DEFAULT_CRYOKARST_SITES:
        conduit_type = DEFAULT_CRYOKARST_SITES[matched_site_id].conduit_type

    calc_keywords = [
        "calculate",
        "calculation",
        "creep",
        "creep rate",
        "ablation",
        "jokulhlaup",
        "outburst",
        "dynamics",
        "triage",
        "anchor creep",
        "anchor creep rate",
        "thermal ablation",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "kit",
        "drysuit",
        "dry caving suit",
        "ice screw",
        "ice screws",
        "abalakov",
        "gas detector",
        "headlamp",
        "crampons",
    ]

    if any(k in q for k in calc_keywords):
        action: Literal["catalog", "get_site", "calculate", "gear_checklist"] = "calculate"
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
            "highlights",
            "site",
            "depth",
            "conduit",
            "stability",
        ]
    ):
        action = "get_site"
    elif matched_site_id and not any(
        k in q for k in ["sites", "catalog", "list", "options", "all"]
    ):
        action = "get_site"
    else:
        action = "catalog"

    return CryokarstSpeleologyIntent(
        action=action,
        site_id=matched_site_id,
        query=message,
        conduit_type=conduit_type,
    )


def format_cryokarst_speleology_response(
    action: Union[CryokarstSpeleologyIntent, str],
    message: Any = None,
) -> FormattedCryokarstSpeleologyResponse:
    if isinstance(message, dict) and "cryokarst_speleology_info" in message:
        answer = str(
            message.get(
                "answer",
                "Alpine Glacial Crevasse Ice Cave Exploration & Cryokarst Speleology guidance",
            )
        )
        return FormattedCryokarstSpeleologyResponse(answer, message)

    intent_obj: CryokarstSpeleologyIntent
    if isinstance(action, CryokarstSpeleologyIntent):
        intent_obj = action
    elif isinstance(action, str):
        if action in ("cryokarst_speleology", "cryokarst") and isinstance(message, str):
            intent_obj = extract_cryokarst_speleology_intent(message)
        elif action in ("calculate", "calculate_dynamics"):
            intent_obj = CryokarstSpeleologyIntent(action="calculate")
        elif action in ("gear", "gear_checklist"):
            intent_obj = CryokarstSpeleologyIntent(action="gear_checklist")
        elif action in ("get_site", "site_detail", "detail"):
            site_id = (
                message
                if isinstance(message, str) and message in DEFAULT_CRYOKARST_SITES
                else None
            )
            intent_obj = CryokarstSpeleologyIntent(action="get_site", site_id=site_id)
        else:
            intent_obj = CryokarstSpeleologyIntent(action="catalog")
    else:
        intent_obj = CryokarstSpeleologyIntent(action="catalog")

    resolved_action = intent_obj.action

    if resolved_action == "calculate":
        if isinstance(message, CryokarstDynamicsResult):
            calc_res = message
        elif isinstance(message, CryokarstDynamicsQuery):
            calc_res = calculate_cryokarst_dynamics(message)
        else:
            calc_q = CryokarstDynamicsQuery(
                site_id=intent_obj.site_id or "matanuska-glacier-moulin-chamber"
            )
            calc_res = calculate_cryokarst_dynamics(calc_q)

        answer = (
            f"Cryokarst Speleology Dynamics for {calc_res.site_title}: "
            f"Anchor Creep Rate: {calc_res.anchor_creep_rate_mm_hr} mm/hr. "
            f"Thermal Ablation Velocity: {calc_res.thermal_ablation_velocity_mm_day} mm/day. "
            f"Jökulhlaup Outburst Risk Index: {calc_res.jokulhlaup_outburst_risk_index}. "
            f"Safety Triage: {calc_res.safety_triage.upper()}. "
            f"{calc_res.anchor_rigging_advisory} Escape Protocol: {calc_res.subglacial_escape_protocol}"
        )
        calc_info: dict[str, Any] = {
            "cryokarst_speleology_info": {
                "action": "calculate",
                "site_id": calc_res.site_id,
                "calculation": calc_res.model_dump(),
                "anchor_creep_rate_mm_hr": calc_res.anchor_creep_rate_mm_hr,
                "thermal_ablation_velocity_mm_day": calc_res.thermal_ablation_velocity_mm_day,
                "jokulhlaup_outburst_risk_index": calc_res.jokulhlaup_outburst_risk_index,
                "safety_triage": calc_res.safety_triage,
                "anchor_rigging_advisory": calc_res.anchor_rigging_advisory,
                "subglacial_escape_protocol": calc_res.subglacial_escape_protocol,
            },
            "answer": answer,
        }
        return FormattedCryokarstSpeleologyResponse(answer, calc_info)

    if resolved_action == "gear_checklist":
        checklist = message if isinstance(message, list) else get_cryokarst_gear()
        items_str = "; ".join(f"{g.name} ({g.description})" for g in checklist)
        answer = (
            f"Mandatory Alpine Glacial Crevasse Ice Cave Exploration & Cryokarst Speleology Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Sub-zero dry caving suits, dual-tube stainless ice screws, Abalakov hookers, "
            f"subglacial multi-gas detectors, watertight submersible headlamps, and cryo-traction crampons are essential for safe glacial exploration."
        )
        gear_info: dict[str, Any] = {
            "cryokarst_speleology_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedCryokarstSpeleologyResponse(answer, gear_info)

    if resolved_action == "get_site":
        site = None
        if intent_obj.site_id:
            site = get_cryokarst_site(intent_obj.site_id)
        if not site and isinstance(message, CryokarstSite):
            site = message
        if not site and isinstance(message, str):
            site = get_cryokarst_site(message)
        if not site:
            site = get_cryokarst_site("matanuska-glacier-moulin-chamber")

        if site:
            highlights_str = ", ".join(site.highlights)
            answer = (
                f"Cryokarst Speleology Site: {site.title} ({site.range}, {site.region}). "
                f"Descent Depth: {site.depth_meters}m | Conduit Type: {site.conduit_type} | "
                f"Ice Stability: {site.ice_stability_class} | Meltwater Flow: {site.meltwater_flow_state}. "
                f"{site.description} Key Highlights: {highlights_str}."
            )
            site_info: dict[str, Any] = {
                "cryokarst_speleology_info": {
                    "action": "get_site",
                    "site_id": site.id,
                    "site": site.model_dump(),
                },
                "answer": answer,
            }
            return FormattedCryokarstSpeleologyResponse(answer, site_info)

    sites = (
        message
        if isinstance(message, list)
        else get_cryokarst_sites(conduit_type=intent_obj.conduit_type)
    )
    summary_str = "; ".join(
        f"{s.title} ({s.region}, {s.depth_meters}m, conduit: {s.conduit_type})"
        for s in sites
    )
    answer = (
        f"Contoso Alpine Glacial Crevasse Ice Cave Exploration & Cryokarst Speleology Catalog ({len(sites)} sites): {summary_str}. "
        "Inquire about specific cryokarst sites, ice dynamics calculations, or mandatory subterranean glacier gear."
    )
    catalog_info: dict[str, Any] = {
        "cryokarst_speleology_info": {
            "action": "catalog",
            "conduit_type": intent_obj.conduit_type,
            "sites": [s.model_dump() for s in sites],
        },
        "answer": answer,
    }
    return FormattedCryokarstSpeleologyResponse(answer, catalog_info)


def build_cryokarst_speleology_prompt(message: Any = None) -> str:
    lines = [
        "Alpine Glacial Crevasse Ice Cave Exploration & Cryokarst Speleology Guidance:",
        "- Glacier Ice Dynamics & Creep Rates: Glacial ice behaves as a viscoelastic solid. Anchors placed in temperate firn or warm ice experience rapid creep displacement (~1-4 mm/hr) requiring long 21cm steel screws or equalized Abalakov v-threads.",
        "- Thermal Ablation & Jökulhlaup Hazard: Diurnal solar radiation drives subglacial melt surges and sudden glacial lake drainage outbursts (jökulhlaups). Teams must establish ascent lines above active drainage thalwegs and egress before solar afternoon peaks.",
        "- Multi-Gas Subglacial Hazards: Basal volcanic fumarole caves vent toxic concentrations of H2S, SO2, and CO2, while stagnant siphon sumps can harbor hypoxic atmospheres requiring continuous multi-gas detection.",
        "- Mandatory Subglacial Equipment: Sub-zero thermal dry caving suit, 21cm stainless steel ice screws, ergonomic Abalakov v-thread hooker, multi-gas detector, IPX8 submersible dual-beam headlamp, and technical cryo-traction crampons.",
    ]
    site_id = None
    if isinstance(message, CryokarstSpeleologyIntent) and message.site_id:
        site_id = message.site_id
    elif isinstance(message, str):
        detected = detect_cryokarst_speleology_intent(message)
        if detected:
            intent_obj = extract_cryokarst_speleology_intent(message)
            if intent_obj and intent_obj.site_id:
                site_id = intent_obj.site_id

    if site_id:
        s = get_cryokarst_site(site_id)
        if s:
            lines.append(
                f"- Focused Cryokarst Site: {s.title} ({s.region}, Range: {s.range}, Depth: {s.depth_meters}m, Conduit: {s.conduit_type}, Stability: {s.ice_stability_class}, Meltwater: {s.meltwater_flow_state})"
            )
    return "\n".join(lines)


def cryokarst_speleology_tool(
    query: Optional[CryokarstDynamicsQuery] = None,
    action: Optional[str] = None,
    site_id: Optional[str] = None,
    conduit_type: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_dynamics") or query is not None:
        calc_q = query or CryokarstDynamicsQuery(
            site_id=site_id or "matanuska-glacier-moulin-chamber"
        )
        res = calculate_cryokarst_dynamics(calc_q)
        formatted = format_cryokarst_speleology_response("calculate", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_cryokarst_gear()
        formatted = format_cryokarst_speleology_response("gear_checklist", checklist)
        return dict(formatted._data)

    if action in ("get_site", "site_detail", "detail") and site_id:
        site = get_cryokarst_site(site_id)
        if site:
            formatted = format_cryokarst_speleology_response("get_site", site)
            return dict(formatted._data)

    sites = get_cryokarst_sites(conduit_type=conduit_type)
    formatted = format_cryokarst_speleology_response("catalog", sites)
    return dict(formatted._data)
