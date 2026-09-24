import math
from typing import Any, Optional, Union

from pydantic import BaseModel, Field


class AlpineScubaSiteModel(BaseModel):
    id: str
    name: str
    location: str
    elevation_meters: int
    max_depth_meters: int
    summer_water_temp_c: float
    winter_water_temp_c: float
    typical_visibility_meters: int
    overhead_condition: str
    water_type: str
    description: str
    highlights: list[str] = Field(default_factory=list)


class ScubaCalculationRequest(BaseModel):
    site_id: str = "lake-tahoe-rubicon-wall"
    target_depth_meters: float = 20.0
    bottom_time_minutes: float = 25.0
    thermal_exposure: str = "compressed_neoprene_drysuit"
    water_temp_c: Optional[float] = None


class ScubaCalculationResponse(BaseModel):
    site_name: str
    atmospheric_pressure_bar: float
    equivalent_sea_level_depth_meters: float
    adjusted_ndl_minutes: int
    decompression_status: str
    regulator_freeze_risk: str
    min_surface_interval_hours: float
    thermal_protection_advisory: str
    ice_safety_advisory: str


class AlpineScubaGearRequirement(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool = True
    description: str


class AlpineScubaIntent(BaseModel):
    intent_detected: bool = True
    site_id: Optional[str] = None
    action: str = "sites_list"
    confidence: float = 1.0

    def __bool__(self) -> bool:
        return self.intent_detected


class FormattedAlpineScubaResponse(str):
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


DEFAULT_ALPINE_SCUBA_SITES: dict[str, AlpineScubaSiteModel] = {
    "lake-tahoe-rubicon-wall": AlpineScubaSiteModel(
        id="lake-tahoe-rubicon-wall",
        name="Rubicon Wall & Emerald Bay",
        location="Lake Tahoe, California / Nevada, USA",
        elevation_meters=1897,
        max_depth_meters=120,
        summer_water_temp_c=15.0,
        winter_water_temp_c=4.5,
        typical_visibility_meters=25,
        overhead_condition="open_water_seasonal_ice_fringes",
        water_type="freshwater_alpine",
        description="Sheer granite drop-off plunging vertically over 100 meters into cobalt depths at 1,897 meters elevation, requiring high-altitude decompression schedules.",
        highlights=[
            "Vertical submerged granite wall plunging beyond recreational depths",
            "High-altitude optical clarity with visibility often exceeding 25 meters",
            "Bühlmann altitude decompression schedule requiring Cross Correction tables",
        ],
    ),
    "crater-lake-wizard-island": AlpineScubaSiteModel(
        id="crater-lake-wizard-island",
        name="Wizard Island & Cleetwood Cove",
        location="Crater Lake National Park, Oregon, USA",
        elevation_meters=1883,
        max_depth_meters=85,
        summer_water_temp_c=12.0,
        winter_water_temp_c=3.5,
        typical_visibility_meters=35,
        overhead_condition="open_caldera_restricted_access",
        water_type="volcanic_crater",
        description="Ultra-pure volcanic caldera lake featuring submerged hydrothermal features, moss beds, and world-record water clarity at nearly 1,900 meters elevation.",
        highlights=[
            "Unparalleled 35-meter visibility in a dormant volcanic caldera",
            "Submerged volcanic pinnacles and ancient submerged moss mats",
            "Strict National Park Service research and conservation entry protocols",
        ],
    ),
    "emerald-lake-rockies": AlpineScubaSiteModel(
        id="emerald-lake-rockies",
        name="Emerald Lake & Burgess Shale Ice Vault",
        location="Yoho National Park, British Columbia, Canada",
        elevation_meters=1300,
        max_depth_meters=28,
        summer_water_temp_c=9.0,
        winter_water_temp_c=1.0,
        typical_visibility_meters=18,
        overhead_condition="solid_ice_sheet_overhead",
        water_type="glacial_melt_ice_vault",
        description="Glacial alpine basin encased beneath 1 meter of solid winter ice under Mount Burgess, demanding full overhead tethering protocols and dual freeze-protected regulators.",
        highlights=[
            "Overhead ice diving underneath 1-meter thick winter ice sheets",
            "Vibrant glacial silt reflections and frozen subterranean light shafts",
            "Mandatory safety diver tether lines and surface attendant monitoring",
        ],
    ),
    "lake-ouananiche-chic-chocs": AlpineScubaSiteModel(
        id="lake-ouananiche-chic-chocs",
        name="Lac aux Américains Glacial Cirque",
        location="Parc National de la Gaspésie, Quebec, Canada",
        elevation_meters=680,
        max_depth_meters=22,
        summer_water_temp_c=11.0,
        winter_water_temp_c=1.0,
        typical_visibility_meters=12,
        overhead_condition="thick_ice_overhead_subarctic",
        water_type="glacial_cirque_ice",
        description="Sub-arctic glacial cirque lake framed by massive u-shaped amphitheater cliffs, serving as an extreme cold-water regulator anti-freeze testbed.",
        highlights=[
            "Glacial amphitheater ice diving in remote sub-arctic conditions",
            "Near-freezing 1°C water requiring environmentally sealed diaphragm regulators",
            "Overhead ice entry safety protocols with dedicated hole cutting chainsaw teams",
        ],
    ),
    "homestake-reservoir-colorado": AlpineScubaSiteModel(
        id="homestake-reservoir-colorado",
        name="Homestake Reservoir & Gold Dredge",
        location="Leadville / Sawatch Range, Colorado, USA",
        elevation_meters=3115,
        max_depth_meters=42,
        summer_water_temp_c=8.0,
        winter_water_temp_c=2.0,
        typical_visibility_meters=10,
        overhead_condition="extreme_altitude_partial_ice",
        water_type="alpine_quarry_high_altitude",
        description="Extreme ultra-high-altitude reservoir at 3,115 meters elevation harboring submerged gold-dredging timber artifacts and demanding severe decompression reductions.",
        highlights=[
            "Extreme altitude dive site at 3,115 meters (over 10,200 feet)",
            "Submerged historical gold rush mining timbers and structural relics",
            "High-altitude atmospheric pressure derating reducing NDL by more than 30%",
        ],
    ),
}

DEFAULT_ALPINE_SCUBA_GEAR: list[AlpineScubaGearRequirement] = [
    AlpineScubaGearRequirement(
        id="environmentally-sealed-coldwater-regulator",
        name="Environmentally Sealed Diaphragm Cold-Water Regulator System",
        category="life_support_breathing",
        mandatory=True,
        description="Dry-sealed ambient chamber prevents internal ice crystal buildup and adiabatic freezing in sub-4°C alpine waters.",
    ),
    AlpineScubaGearRequirement(
        id="compressed-neoprene-drysuit",
        name="High-Density Compressed Neoprene Drysuit with Dry Glove System",
        category="thermal_exposure",
        mandatory=True,
        description="Provides hydrostatic compression resistance and vital thermal insulation against incapacitating cold-water shock.",
    ),
    AlpineScubaGearRequirement(
        id="harness-ice-tether-carabiner",
        name="Overhead Ice Safety Harness with 50m Floating Line & Locking Carabiners",
        category="overhead_ice_safety",
        mandatory=True,
        description="Continuous mechanical tether connecting diver to surface tender, preventing disorientation beneath the ice ceiling.",
    ),
    AlpineScubaGearRequirement(
        id="dual-independent-redundant-tanks",
        name="Dual Independent Redundant Cylinder System (Twinset or H-Valve Pony)",
        category="gas_redundancy",
        mandatory=True,
        description="Redundant first and second stages ensuring immediate breathing gas in the event of an ice-induced regulator free-flow.",
    ),
    AlpineScubaGearRequirement(
        id="altitude-decompression-dive-computer",
        name="Bühlmann ZHL-16C Altitude-Adjustable Decompression Computer",
        category="decompression_monitoring",
        mandatory=True,
        description="Real-time barometric pressure sensor calculating Equivalent Sea Level Depth (ESLD) and reduced No-Decompression Limits.",
    ),
    AlpineScubaGearRequirement(
        id="chainsaw-ice-trench-clearing-tools",
        name="Ice Diving Chainsaw with Ice Tongs, Trench Clearing Shovels & Safety Ladder",
        category="surface_entry_extrication",
        mandatory=True,
        description="Heavy-duty surface kit for cutting triangular entry holes, clearing slush, and securing ladder egress points.",
    ),
]


def get_alpine_scuba_sites(
    overhead_condition: Optional[str] = None,
    water_type: Optional[str] = None,
) -> list[AlpineScubaSiteModel]:
    sites = list(DEFAULT_ALPINE_SCUBA_SITES.values())
    if overhead_condition:
        norm_oc = overhead_condition.strip().lower()
        sites = [s for s in sites if norm_oc in s.overhead_condition.lower()]
    if water_type:
        norm_wt = water_type.strip().lower()
        sites = [s for s in sites if norm_wt in s.water_type.lower()]
    return sites


def get_alpine_scuba_site_by_id(site_id: str) -> Optional[AlpineScubaSiteModel]:
    return DEFAULT_ALPINE_SCUBA_SITES.get(site_id.strip().lower())


def get_alpine_scuba_gear() -> list[AlpineScubaGearRequirement]:
    return list(DEFAULT_ALPINE_SCUBA_GEAR)


def _get_base_ndl_for_depth(esld_m: float) -> int:
    """Standard Bühlmann ZHL-16C / sea-level recreational NDL table (meters -> minutes)."""
    if esld_m <= 9.0:
        return 219
    elif esld_m <= 12.0:
        return 147
    elif esld_m <= 15.0:
        return 73
    elif esld_m <= 18.0:
        return 51
    elif esld_m <= 21.0:
        return 35
    elif esld_m <= 24.0:
        return 28
    elif esld_m <= 27.0:
        return 22
    elif esld_m <= 30.0:
        return 17
    elif esld_m <= 33.0:
        return 14
    elif esld_m <= 36.0:
        return 11
    elif esld_m <= 39.0:
        return 9
    elif esld_m <= 42.0:
        return 8
    else:
        return 6


def calculate_scuba_decompression(
    request: ScubaCalculationRequest,
) -> ScubaCalculationResponse:
    target_id = request.site_id.strip().lower()
    site = get_alpine_scuba_site_by_id(target_id)
    if not site:
        raise ValueError(f"Alpine scuba site '{request.site_id}' not found")

    # Barometric formula: Patm = round(1.0 * exp(-elevation_meters / 8434), 2)
    patm = round(1.0 * math.exp(-site.elevation_meters / 8434.0), 2)
    if patm <= 0.0:
        patm = 0.50

    # Bühlmann Equivalent Sea Level Depth (ESLD): ESLD = round(target_depth_meters * (1.0 / Patm), 1)
    esld = round(request.target_depth_meters * (1.0 / patm), 1)

    # Base NDL lookup by ESLD and altitude adjustment: round(base_ndl * Patm)
    base_ndl = _get_base_ndl_for_depth(esld)
    adjusted_ndl = int(round(base_ndl * patm))

    # Decompression status
    if request.bottom_time_minutes > adjusted_ndl:
        decompression_status = "mandatory_decompression_stops"
    elif request.bottom_time_minutes >= adjusted_ndl * 0.8:
        decompression_status = "near_ndl_caution"
    else:
        decompression_status = "within_no_decompression_limit"

    # Water temperature
    water_temp = (
        request.water_temp_c if request.water_temp_c is not None else site.winter_water_temp_c
    )

    # Regulator freeze risk index
    if water_temp <= 2.0 or (water_temp <= 4.0 and request.target_depth_meters >= 20.0):
        regulator_freeze_risk = "high"
    elif water_temp <= 6.0 or request.target_depth_meters >= 30.0:
        regulator_freeze_risk = "moderate"
    else:
        regulator_freeze_risk = "low"

    # Surface interval hours
    if decompression_status == "mandatory_decompression_stops" or site.elevation_meters >= 3000:
        min_surface_interval_hours = 24.0
    elif decompression_status == "near_ndl_caution":
        min_surface_interval_hours = 18.0
    else:
        min_surface_interval_hours = 12.0

    # Thermal protection advisory
    if water_temp <= 4.0:
        thermal_advisory = (
            "CRITICAL: Water temperature <= 4°C requires a high-density compressed neoprene "
            "or trilaminate drysuit with 400g/m² fleece undergarments, heated vest, and sealed "
            "dry gloves to avoid incapacitating hypothermia."
        )
    elif water_temp <= 10.0:
        thermal_advisory = (
            "ADVISORY: Water temperature between 4°C and 10°C requires a drysuit or 7mm "
            "semi-dry system with 5mm hood and gloves. Monitor core thermal state closely."
        )
    else:
        thermal_advisory = (
            "STANDARD: Alpine cold water requires minimum 7mm wetsuit or drysuit with "
            "appropriate thermal undergarments."
        )

    # Overhead ice safety advisory
    if (
        "solid_ice" in site.overhead_condition.lower()
        or "thick_ice" in site.overhead_condition.lower()
        or site.id
        in (
            "emerald-lake-rockies",
            "lake-ouananiche-chic-chocs",
        )
    ):
        ice_advisory = (
            "OVERHEAD ICE PROTOCOL: Overhead ice environment detected. Continuous 50m tether "
            "to surface tender, triangular cut entry hole, dual redundant stage regulators, "
            "and backup standby safety diver required."
        )
    else:
        ice_advisory = (
            "OPEN WATER PROTOCOL: Open water alpine environment. Adhere to conservative ascent rate "
            "(max 9m/min), perform 3-minute safety stop at equivalent depth, and monitor altitude barometric shift."
        )

    return ScubaCalculationResponse(
        site_name=site.name,
        atmospheric_pressure_bar=patm,
        equivalent_sea_level_depth_meters=esld,
        adjusted_ndl_minutes=adjusted_ndl,
        decompression_status=decompression_status,
        regulator_freeze_risk=regulator_freeze_risk,
        min_surface_interval_hours=min_surface_interval_hours,
        thermal_protection_advisory=thermal_advisory,
        ice_safety_advisory=ice_advisory,
    )


def detect_alpine_scuba_intent(message: str) -> AlpineScubaIntent:
    if not message or not message.strip():
        return AlpineScubaIntent(intent_detected=False, site_id=None, action="", confidence=0.0)

    q = message.lower()

    # Disambiguation guards
    # 1. Order tracking & ecommerce
    ecommerce_terms = [
        "order #",
        "return label",
        "refund",
        "shipping tracking",
        "track my order",
        "track my return",
        "tracking number",
    ]
    if any(t in q for t in ecommerce_terms):
        return AlpineScubaIntent(intent_detected=False, site_id=None, action="", confidence=0.0)

    # 2. Sea kayaking guard
    kayak_terms = [
        "sea kayak",
        "sea kayaking",
        "coastal kayak",
        "coastal paddling",
        "paddle float",
        "bilge pump",
        "spray skirt",
        "marine vhf",
        "tide plan",
        "ferry angle",
        "slack water",
    ]
    if any(k in q for k in kayak_terms) and not any(
        s in q
        for s in [
            "scuba",
            "dive",
            "diving",
            "buhlmann",
            "esld",
            "regulator freeze",
            "ice hole",
            "tank",
        ]
    ):
        return AlpineScubaIntent(intent_detected=False, site_id=None, action="", confidence=0.0)

    # 3. Whitewater & river sports guard
    whitewater_terms = [
        "whitewater",
        "river rapid",
        "river rapids",
        "class iv rapids",
        "class v rapids",
        "cfs",
        "river flow",
        "packraft",
        "river sup",
    ]
    if any(w in q for w in whitewater_terms) and not any(
        s in q
        for s in [
            "scuba",
            "dive",
            "diving",
            "buhlmann",
            "esld",
            "regulator freeze",
            "drysuit",
        ]
    ):
        return AlpineScubaIntent(intent_detected=False, site_id=None, action="", confidence=0.0)

    # 4. Coasteering & cliff swimming guard
    coasteering_terms = [
        "coasteering",
        "cliff jump",
        "cliff jumping",
        "deep swell",
        "canyoneering",
        "swimrun",
    ]
    if any(c in q for c in coasteering_terms) and not any(
        s in q
        for s in [
            "scuba",
            "dive",
            "diving",
            "buhlmann",
            "esld",
            "regulator freeze",
            "drysuit",
        ]
    ):
        return AlpineScubaIntent(intent_detected=False, site_id=None, action="", confidence=0.0)

    # Scuba / Alpine diving keywords
    scuba_keywords = [
        "altitude diving",
        "alpine scuba",
        "ice diving",
        "ice dive",
        "cold water diving",
        "cold water dive",
        "drysuit",
        "dry suit",
        "esld",
        "equivalent sea level depth",
        "buhlmann altitude",
        "buhlmann",
        "buhlmann zhl-16c",
        "regulator freeze",
        "freeze prevention",
        "ice hole dive",
        "ice hole diving",
        "ice tether",
        "lake tahoe scuba",
        "rubicon wall",
        "crater lake diving",
        "wizard island dive",
        "emerald lake ice",
        "emerald lake scuba",
        "lake ouananiche",
        "lac aux americains",
        "lac aux américains",
        "homestake reservoir dive",
        "homestake reservoir scuba",
        "altitude decompression",
        "high altitude diving",
        "high altitude scuba",
        "altitude dive",
    ]

    has_scuba_keyword = any(k in q for k in scuba_keywords)
    if not has_scuba_keyword:
        return AlpineScubaIntent(intent_detected=False, site_id=None, action="", confidence=0.0)

    # Site identification
    site_id: Optional[str] = None
    if "tahoe" in q or "rubicon" in q:
        site_id = "lake-tahoe-rubicon-wall"
    elif "crater lake" in q or "wizard island" in q or "cleetwood" in q:
        site_id = "crater-lake-wizard-island"
    elif "emerald lake" in q or "burgess shale" in q:
        site_id = "emerald-lake-rockies"
    elif "ouananiche" in q or "américains" in q or "americains" in q or "chic-chocs dive" in q:
        site_id = "lake-ouananiche-chic-chocs"
    elif "homestake" in q:
        site_id = "homestake-reservoir-colorado"

    # Action detection
    calc_terms = [
        "calculate",
        "calculation",
        "esld",
        "equivalent sea level depth",
        "ndl",
        "no decompression limit",
        "decompression schedule",
        "decompression stops",
        "buhlmann",
        "freeze risk",
        "surface interval",
        "bottom time",
    ]
    gear_terms = [
        "gear",
        "checklist",
        "equipment",
        "safety kit",
        "regulator",
        "drysuit",
        "dry suit",
        "tether",
        "ice harness",
        "redundant cylinder",
        "redundant tank",
        "dive computer",
        "chainsaw",
    ]

    if any(c in q for c in calc_terms):
        action = "calculate_scuba"
    elif any(g in q for g in gear_terms):
        action = "gear_checklist"
    elif site_id and any(
        w in q
        for w in [
            "detail",
            "about",
            "describe",
            "tell me about",
            "highlights",
            "visibility",
            "depth",
            "elevation",
        ]
    ):
        action = "site_detail"
    elif site_id and not any(
        w in q for w in ["list", "catalog", "where", "all sites", "all locations"]
    ):
        action = "site_detail"
    else:
        action = "sites_list"

    return AlpineScubaIntent(
        intent_detected=True,
        site_id=site_id,
        action=action,
        confidence=0.95 if site_id else 0.85,
    )


def build_alpine_scuba_prompt(
    query_or_intent: Union[str, AlpineScubaIntent],
    intent: Optional[AlpineScubaIntent] = None,
) -> str:
    if isinstance(query_or_intent, AlpineScubaIntent):
        act_intent = query_or_intent
    elif intent is not None:
        act_intent = intent
    else:
        act_intent = detect_alpine_scuba_intent(str(query_or_intent))

    lines = [
        "Contoso Wilderness High-Altitude Scuba & Alpine Lake Ice Diving Assistant Tooling:",
        "- High-Altitude Bühlmann ZHL-16C Dynamics: Atmospheric pressure (Patm) drops with altitude according to Patm = exp(-elevation / 8434).",
        "  Equivalent Sea Level Depth (ESLD = target_depth / Patm) must be calculated to determine conservative No-Decompression Limits (NDL).",
        "- Cold-Water Regulator Freeze Prevention: Adiabatic cooling during high gas demand in sub-4°C waters creates catastrophic freeze-ups.",
        "  Environmentally sealed diaphragm first stages and dual independent redundant cylinders are mandatory.",
        "- Overhead Ice Safety Protocols: Diving beneath surface ice ceilings requires continuous 50m floating tethers to surface tenders,",
        "  triangular chainsaw cut access holes with dual egress ladders, and rapid-response safety standby divers.",
        "- Thermal Protection & Decompression: Compressed neoprene or trilaminate drysuits with 400g/m² fleece undergarments prevent hypothermia.",
        "  Extended 24-hour minimum surface intervals required before mountain pass transit or flying.",
    ]

    if act_intent.action == "site_detail" and act_intent.site_id:
        site = get_alpine_scuba_site_by_id(act_intent.site_id)
        if site:
            lines.extend(
                [
                    f"- Focused Alpine Dive Site: {site.name} ({site.location})",
                    f"  Elevation: {site.elevation_meters}m | Max Depth: {site.max_depth_meters}m | Visibility: {site.typical_visibility_meters}m",
                    f"  Water Type: {site.water_type} | Overhead Condition: {site.overhead_condition}",
                    f"  Highlights: {', '.join(site.highlights)}",
                    f"  Description: {site.description}",
                ]
            )
    elif act_intent.action == "calculate_scuba":
        lines.append(
            "- Action: Calculate Bühlmann ESLD, altitude-adjusted NDL, regulator freeze risk index, "
            "decompression status, surface interval hours, and ice entry advisories."
        )
    elif act_intent.action == "gear_checklist":
        lines.append(
            "- Action: Present the mandatory 6-item Cold-Water & Overhead Ice Diving Safety Checklist."
        )
    else:
        sites = get_alpine_scuba_sites()
        lines.append(
            f"- Iconic Alpine Scuba Sites: {'; '.join(f'{s.name} ({s.elevation_meters}m, {s.water_type})' for s in sites)}"
        )

    return "\n".join(lines)


def format_alpine_scuba_response(
    result_or_intent: Any,
    query: str = "",
) -> FormattedAlpineScubaResponse:
    if isinstance(result_or_intent, ScubaCalculationResponse):
        calc = result_or_intent
        answer = (
            f"Bühlmann Altitude Scuba Analysis for {calc.site_name}: "
            f"Atmospheric Pressure: {calc.atmospheric_pressure_bar} bar | "
            f"Equivalent Sea Level Depth (ESLD): {calc.equivalent_sea_level_depth_meters}m | "
            f"Adjusted NDL: {calc.adjusted_ndl_minutes} min | Decompression Status: {calc.decompression_status.upper()} | "
            f"Regulator Freeze Risk: {calc.regulator_freeze_risk.upper()} | "
            f"Min Surface Interval: {calc.min_surface_interval_hours}h. "
            f"Advisories: {calc.thermal_protection_advisory} {calc.ice_safety_advisory}"
        )
        calc_info: dict[str, Any] = {
            "action": "calculate_scuba",
            "calculation": calc.model_dump(),
        }
        return FormattedAlpineScubaResponse(
            answer, {"alpine_scuba_info": calc_info, "answer": answer}
        )

    if isinstance(result_or_intent, AlpineScubaIntent):
        intent = result_or_intent
    elif isinstance(result_or_intent, dict):
        intent = AlpineScubaIntent(**result_or_intent)
    else:
        intent = detect_alpine_scuba_intent(str(result_or_intent))

    if intent.action == "calculate_scuba":
        target_site_id = intent.site_id or "lake-tahoe-rubicon-wall"
        req = ScubaCalculationRequest(site_id=target_site_id)
        calc_res = calculate_scuba_decompression(req)
        answer = (
            f"Bühlmann Altitude Scuba Analysis for {calc_res.site_name}: "
            f"Atmospheric Pressure: {calc_res.atmospheric_pressure_bar} bar | "
            f"Equivalent Sea Level Depth (ESLD): {calc_res.equivalent_sea_level_depth_meters}m | "
            f"Adjusted NDL: {calc_res.adjusted_ndl_minutes} min | Decompression Status: {calc_res.decompression_status.upper()} | "
            f"Regulator Freeze Risk: {calc_res.regulator_freeze_risk.upper()} | "
            f"Min Surface Interval: {calc_res.min_surface_interval_hours}h. "
            f"Advisories: {calc_res.thermal_protection_advisory} {calc_res.ice_safety_advisory}"
        )
        calc_dict: dict[str, Any] = {
            "action": "calculate_scuba",
            "calculation": calc_res.model_dump(),
        }
        return FormattedAlpineScubaResponse(
            answer, {"alpine_scuba_info": calc_dict, "answer": answer}
        )

    elif intent.action == "gear_checklist":
        gear = get_alpine_scuba_gear()
        answer = (
            f"Mandatory Cold Water & Ice Safety Gear Checklist ({len(gear)} items): "
            + "; ".join(f"{g.name} ({g.description})" for g in gear)
            + ". Strict environmental seal regulator testing and pre-dive ice tether checks mandatory."
        )
        gear_dict: dict[str, Any] = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
            "mandatory_count": sum(1 for g in gear if g.mandatory),
        }
        return FormattedAlpineScubaResponse(
            answer, {"alpine_scuba_info": gear_dict, "answer": answer}
        )

    elif intent.action == "site_detail" and intent.site_id:
        site = get_alpine_scuba_site_by_id(intent.site_id)
        if site:
            answer = (
                f"Alpine Scuba Site Beta — {site.name} ({site.location}): "
                f"Elevation: {site.elevation_meters}m | Max Depth: {site.max_depth_meters}m | "
                f"Visibility: {site.typical_visibility_meters}m | Water Type: {site.water_type} | "
                f"Overhead: {site.overhead_condition}. "
                f"Highlights: {', '.join(site.highlights)}. {site.description}"
            )
            detail_dict: dict[str, Any] = {
                "action": "site_detail",
                "site": site.model_dump(),
            }
            return FormattedAlpineScubaResponse(
                answer, {"alpine_scuba_info": detail_dict, "answer": answer}
            )

    # Default: sites_list
    sites = get_alpine_scuba_sites()
    summary = "; ".join(
        f"{s.name} ({s.location}, {s.elevation_meters}m, {s.water_type})" for s in sites
    )
    answer = (
        f"Contoso Alpine Scuba & Ice Diving Lake Catalog ({len(sites)} iconic sites): {summary}. "
        "Inquire about specific dive sites, Bühlmann ESLD decompression calculations, or mandatory cold-water gear."
    )
    list_dict: dict[str, Any] = {
        "action": "sites_list",
        "sites": [s.model_dump() for s in sites],
    }
    return FormattedAlpineScubaResponse(answer, {"alpine_scuba_info": list_dict, "answer": answer})
