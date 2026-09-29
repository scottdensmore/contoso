from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator

SpeleothemType = Literal[
    "cave_pearl_pisolith",
    "eccentric_helictite",
    "aragonite_anthodite",
    "gypsum_flower_needle",
    "rimstone_gour_dam",
]

KarstHostRock = Literal[
    "ordovician_dolomite",
    "mississippian_limestone",
    "cretaceous_chalk",
    "permian_evaporite_gypsum",
]

ConservationStatus = Literal[
    "pristine_active_growth",
    "vulnerable_low_drip",
    "threatened_microclimate_desiccation",
]

PearlRotationState = Literal[
    "active_polishing_rotation",
    "stable_laminar_accretion",
    "cementation_stagnation_risk",
]

ConservationTriage = Literal[
    "nominal_active_mineralization",
    "caution_low_saturation",
    "critical_desiccation_halt_traffic",
]


class CaveMineralogySite(BaseModel):
    id: str
    site_id: str = ""
    name: str = ""
    title: str = ""
    region: str = ""
    system: str = ""
    max_depth_m: int = 0
    max_depth_meters: int = 0
    ambient_temp_c: float = 0.0
    humidity_percent: int = 0
    speleothem_type: str = ""
    host_rock: str = ""
    conservation_status: str = ""
    description: str = ""
    highlights: list[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "maxDepthMeters": "max_depth_m",
                "ambientTempC": "ambient_temp_c",
                "humidityPercent": "humidity_percent",
                "speleothemType": "speleothem_type",
                "hostRock": "host_rock",
                "conservationStatus": "conservation_status",
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
            elif "site_id" in data and not data.get("id"):
                data["id"] = data["site_id"]
            if "max_depth_m" in data and not data.get("max_depth_meters"):
                data["max_depth_meters"] = data["max_depth_m"]
            elif "max_depth_meters" in data and not data.get("max_depth_m"):
                data["max_depth_m"] = data["max_depth_meters"]
        return data

    @property
    def maxDepthMeters(self) -> int:
        return self.max_depth_m

    @property
    def ambientTempC(self) -> float:
        return self.ambient_temp_c

    @property
    def humidityPercent(self) -> int:
        return self.humidity_percent

    @property
    def speleothemType(self) -> str:
        return self.speleothem_type

    @property
    def hostRock(self) -> str:
        return self.host_rock

    @property
    def conservationStatus(self) -> str:
        return self.conservation_status


class MineralAccretionQuery(BaseModel):
    site_id: str = "carlsbad-rookery-chamber"
    speleothem_type: str = "cave_pearl_pisolith"
    drip_rate_dpm: float = 24.0
    water_ph: float = 7.8
    calcium_carbonate_ppm: float = 220.0
    survey_hours: float = 4.0

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "site_id",
                "speleothemType": "speleothem_type",
                "dripRateDpm": "drip_rate_dpm",
                "waterPh": "water_ph",
                "calciumCarbonatePpm": "calcium_carbonate_ppm",
                "surveyHours": "survey_hours",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data


class MineralAccretionResult(BaseModel):
    site_id: str = "carlsbad-rookery-chamber"
    site_title: str = ""
    calcite_saturation_index: float = 0.0
    pool_agitation_joules_per_hour: float = 0.0
    rotation_state: str = ""
    estimated_accretion_microns_per_year: int = 0
    triage_status: str = ""
    conservation_advisory: str = ""
    monitoring_protocol: str = ""

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteTitle": "site_title",
                "calciteSaturationIndex": "calcite_saturation_index",
                "poolAgitationJoulesPerHour": "pool_agitation_joules_per_hour",
                "rotationState": "rotation_state",
                "estimatedAccretionMicronsPerYear": "estimated_accretion_microns_per_year",
                "triageStatus": "triage_status",
                "conservationAdvisory": "conservation_advisory",
                "monitoringProtocol": "monitoring_protocol",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def siteTitle(self) -> str:
        return self.site_title

    @property
    def calciteSaturationIndex(self) -> float:
        return self.calcite_saturation_index

    @property
    def poolAgitationJoulesPerHour(self) -> float:
        return self.pool_agitation_joules_per_hour

    @property
    def rotationState(self) -> str:
        return self.rotation_state

    @property
    def estimatedAccretionMicronsPerYear(self) -> int:
        return self.estimated_accretion_microns_per_year

    @property
    def triageStatus(self) -> str:
        return self.triage_status

    @property
    def conservationAdvisory(self) -> str:
        return self.conservation_advisory

    @property
    def monitoringProtocol(self) -> str:
        return self.monitoring_protocol


class SpeleothemGearItem(BaseModel):
    id: str
    item_id: str = ""
    name: str = ""
    category: str = ""
    mandatory: bool = True
    description: str = ""
    purpose: str = ""

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "itemId" in data and not data.get("id"):
                data["id"] = data["itemId"]
            if "id" in data and not data.get("item_id"):
                data["item_id"] = data["id"]
            elif "item_id" in data and not data.get("id"):
                data["id"] = data["item_id"]
            if "description" in data and not data.get("purpose"):
                data["purpose"] = data["description"]
            elif "purpose" in data and not data.get("description"):
                data["description"] = data["purpose"]
        return data


class CaveMineralogyIntent(BaseModel):
    action: str
    site_id: Optional[str] = None
    speleothem_type: Optional[str] = None
    conservation: Optional[str] = None


class FormattedCaveMineralogyResponse(str):
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


DEFAULT_CAVE_MINERALOGY_SITES: dict[str, CaveMineralogySite] = {
    "carlsbad-rookery-chamber": CaveMineralogySite(
        id="carlsbad-rookery-chamber",
        name="Carlsbad Caverns Rookery Nest",
        title="Carlsbad Caverns Rookery Nest",
        region="Guadalupe Mountains, New Mexico",
        system="Capitan Reef Karst",
        max_depth_m=250,
        ambient_temp_c=13.5,
        humidity_percent=98,
        speleothem_type="cave_pearl_pisolith",
        host_rock="permian_evaporite_gypsum",
        conservation_status="pristine_active_growth",
        description="Shallow agitated splash pools with nested nest-like spherical calcite cave pearls formed by constant ceiling drips.",
        highlights=[
            "Polished spherical pisolith clusters",
            "Constant aerosol drip agitation",
            "Restricted scientific conservation zone",
        ],
    ),
    "lechuguilla-chandelier-room": CaveMineralogySite(
        id="lechuguilla-chandelier-room",
        name="Lechuguilla Chandelier Ballroom",
        title="Lechuguilla Chandelier Ballroom",
        region="Eddy County, New Mexico",
        system="Guadalupe Sulfuric Basin",
        max_depth_m=480,
        ambient_temp_c=20.0,
        humidity_percent=100,
        speleothem_type="gypsum_flower_needle",
        host_rock="permian_evaporite_gypsum",
        conservation_status="threatened_microclimate_desiccation",
        description="World-class 6-meter-long branching gypsum chandeliers and delicate curved gypsum needles growing under hyper-isolated airflows.",
        highlights=[
            "Massive selenitic gypsum chandeliers",
            "Sub-micron aerosol air currents",
            "Strict zero-impact glove-only protocol",
        ],
    ),
    "organ-cave-anthodite-gallery": CaveMineralogySite(
        id="organ-cave-anthodite-gallery",
        name="Organ Cave Anthodite Hall",
        title="Organ Cave Anthodite Hall",
        region="Greenbrier County, West Virginia",
        system="Appalachian Karst Highlands",
        max_depth_m=140,
        ambient_temp_c=11.2,
        humidity_percent=96,
        speleothem_type="aragonite_anthodite",
        host_rock="mississippian_limestone",
        conservation_status="vulnerable_low_drip",
        description="Radiating needle-like aragonite 'cave flowers' emerging from damp dolomite fractures under delicate drip seepage.",
        highlights=[
            "Radiating quill-like anthodite clusters",
            "Sensitive microclimate moisture balance",
            "High-humidity drip-rate equilibrium",
        ],
    ),
    "mammoth-frozen-niagara": CaveMineralogySite(
        id="mammoth-frozen-niagara",
        name="Mammoth Cave Travertine Cascades",
        title="Mammoth Cave Travertine Cascades",
        region="Edmonson County, Kentucky",
        system="Mississippian Chester Karst",
        max_depth_m=110,
        ambient_temp_c=12.8,
        humidity_percent=94,
        speleothem_type="rimstone_gour_dam",
        host_rock="mississippian_limestone",
        conservation_status="vulnerable_low_drip",
        description="Terraced rimstone dams and flowstone drapes depositing pure calcite from gently spilling supersaturated cave streams.",
        highlights=[
            "Terraced micro-gour pools",
            "Active calcium bicarbonate precipitation",
            "Historic geological exploration route",
        ],
    ),
    "blanchard-springs-coral-grotto": CaveMineralogySite(
        id="blanchard-springs-coral-grotto",
        name="Blanchard Springs Coral & Helictite Grotto",
        title="Blanchard Springs Coral & Helictite Grotto",
        region="Ozark Mountains, Arkansas",
        system="Ozark Highland Karst",
        max_depth_m=115,
        ambient_temp_c=14.4,
        humidity_percent=99,
        speleothem_type="eccentric_helictite",
        host_rock="ordovician_dolomite",
        conservation_status="pristine_active_growth",
        description="Gravity-defying helictites that twist horizontally through capillary pressure and rapid hydrostatic changes.",
        highlights=[
            "Capillary-driven helical calcite filaments",
            "Subterranean stream humidity corridor",
            "Active Ozark karst monitoring",
        ],
    ),
}

DEFAULT_SPELEOTHEM_GEAR: list[SpeleothemGearItem] = [
    SpeleothemGearItem(
        id="uv-365nm-forensic-lamp",
        name="High-Intensity 365nm Filtered UV Speleothem Luminescence Lamp",
        category="optical",
        mandatory=True,
        description="Excites fluorescence in calcite crystals to identify organic humic acid growth bands without physical contact",
    ),
    SpeleothemGearItem(
        id="digital-micro-caliper-laser",
        name="Non-Contact Sub-Millimeter Laser Profile Gauge & Photogrammetry Scale Bar",
        category="survey",
        mandatory=True,
        description="Measures speleothem diameter, pisolith spherical roundness, and accretion rate without touching fragile mineral coats",
    ),
    SpeleothemGearItem(
        id="waterproof-hydro-ph-ec-meter",
        name="Micro-Sample Water pH, EC, and Total Dissolved Solids Field Meter",
        category="hydrology",
        mandatory=True,
        description="Measures drip water saturation index, calcium hardness, and dissolved carbon dioxide in splash pools",
    ),
    SpeleothemGearItem(
        id="lint-free-nitrile-caver-gloves",
        name="Heavy-Duty Powder-Free Textured Nitrile Survey Gloves (Pack of 12)",
        category="conservation",
        mandatory=True,
        description="Prevents skin lipids, oils, and perspiration acids from contaminating active calcite crystal nucleation surfaces",
    ),
    SpeleothemGearItem(
        id="subterranean-acoustic-drip-counter",
        name="Submersible Piezoelectric Acoustic Cave Drip Rate Sensor",
        category="hydrology",
        mandatory=True,
        description="Logs drip frequency in drips per minute (DPM) to assess seasonal aquifer recharge and pool agitation energy",
    ),
    SpeleothemGearItem(
        id="sealed-pelican-specimen-case",
        name="Pressure-Equalized Foam-Lined Waterproof Scientific Speleothem Case",
        category="transport",
        mandatory=True,
        description="Safeguards fragile fallen crystal flakes, sediment samples, and micro-sensors across tight crawlways",
    ),
]


def get_cave_mineralogy_sites(
    speleothem_type: Optional[str] = None,
    conservation: Optional[str] = None,
) -> list[CaveMineralogySite]:
    sites = list(DEFAULT_CAVE_MINERALOGY_SITES.values())
    if speleothem_type:
        norm_type = speleothem_type.strip().lower().replace("-", "_").replace(" ", "_")
        sites = [
            s
            for s in sites
            if s.speleothem_type.lower().replace("-", "_").replace(" ", "_") == norm_type
        ]
    if conservation:
        norm_cons = conservation.strip().lower().replace("-", "_").replace(" ", "_")
        sites = [
            s
            for s in sites
            if s.conservation_status.lower().replace("-", "_").replace(" ", "_") == norm_cons
        ]
    return sites


def get_cave_mineralogy_site(site_id: str) -> Optional[CaveMineralogySite]:
    norm_id = site_id.strip().lower()
    for k, s in DEFAULT_CAVE_MINERALOGY_SITES.items():
        if k.lower() == norm_id or s.id.lower() == norm_id:
            return s
    return None


def get_speleothem_gear_checklist() -> list[SpeleothemGearItem]:
    return list(DEFAULT_SPELEOTHEM_GEAR)


get_cave_mineralogy_gear_checklist = get_speleothem_gear_checklist


def calculate_mineral_accretion(query: MineralAccretionQuery) -> MineralAccretionResult:
    site = get_cave_mineralogy_site(query.site_id)
    if not site:
        raise ValueError(f"Cave mineralogy site '{query.site_id}' not found")

    calcite_saturation_index = round(
        (query.water_ph - 7.0) * 0.6 + (query.calcium_carbonate_ppm - 200.0) / 400.0, 2
    )
    pool_agitation_joules_per_hour = round(query.drip_rate_dpm * 0.045, 2)

    if query.drip_rate_dpm >= 40.0 and calcite_saturation_index > 0.4:
        rotation_state = "active_polishing_rotation"
    elif query.drip_rate_dpm >= 15.0 and calcite_saturation_index > 0.1:
        rotation_state = "stable_laminar_accretion"
    else:
        rotation_state = "cementation_stagnation_risk"

    estimated_accretion_microns_per_year = max(
        1, round(calcite_saturation_index * 25.0 * (query.drip_rate_dpm / 20.0))
    )

    if calcite_saturation_index < 0.0 or query.drip_rate_dpm < 5.0:
        triage_status = "critical_desiccation_halt_traffic"
        conservation_advisory = (
            "CRITICAL SPELEOTHEM DESICCATION RISK: Subterranean microclimate desiccation or undersaturation detected. "
            "Mineral dissolution and accretion halt imminent. Cease traffic immediately."
        )
        monitoring_protocol = (
            "Halt caver transit; seal microclimate corridors; deploy high-precision acoustic drip arrays and hydrochemical loggers."
        )
    elif calcite_saturation_index < 0.2:
        triage_status = "caution_low_saturation"
        conservation_advisory = (
            "LOW CARBONATE SATURATION CAUTION: Calcite saturation index is marginal. "
            "Microclimate fluctuations or caver respiration may trigger crystal etching."
        )
        monitoring_protocol = (
            "Enforce strict scientific perimeter limits; monitor daily splash pool pH and conductivity; require powder-free survey gloves."
        )
    else:
        triage_status = "nominal_active_mineralization"
        conservation_advisory = (
            "NOMINAL ACTIVE MINERAL ACCRETION: Favorable supersaturation and hydrodynamic drip agitation supporting active speleothem accretion."
        )
        monitoring_protocol = (
            "Continue routine non-contact laser photogrammetry; maintain undisturbed aerosol drip zone and zero-touch scientific protocol."
        )

    return MineralAccretionResult(
        site_id=site.id,
        site_title=site.name,
        calcite_saturation_index=calcite_saturation_index,
        pool_agitation_joules_per_hour=pool_agitation_joules_per_hour,
        rotation_state=rotation_state,
        estimated_accretion_microns_per_year=estimated_accretion_microns_per_year,
        triage_status=triage_status,
        conservation_advisory=conservation_advisory,
        monitoring_protocol=monitoring_protocol,
    )


def detect_cave_mineralogy_intent(message: str) -> Optional[CaveMineralogyIntent]:
    q = message.lower()
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
    ]
    if any(k in q for k in exclusions):
        return None

    site_mappings = {
        "carlsbad": "carlsbad-rookery-chamber",
        "rookery": "carlsbad-rookery-chamber",
        "lechuguilla": "lechuguilla-chandelier-room",
        "chandelier": "lechuguilla-chandelier-room",
        "organ cave": "organ-cave-anthodite-gallery",
        "anthodite gallery": "organ-cave-anthodite-gallery",
        "anthodite hall": "organ-cave-anthodite-gallery",
        "mammoth": "mammoth-frozen-niagara",
        "frozen niagara": "mammoth-frozen-niagara",
        "travertine cascades": "mammoth-frozen-niagara",
        "blanchard": "blanchard-springs-coral-grotto",
        "coral grotto": "blanchard-springs-coral-grotto",
        "helictite grotto": "blanchard-springs-coral-grotto",
    }
    matched_site_id: Optional[str] = None
    for kw, s_id in site_mappings.items():
        if kw in q:
            matched_site_id = s_id
            break

    speleothem_type_mappings = {
        "cave pearl": "cave_pearl_pisolith",
        "cave pearls": "cave_pearl_pisolith",
        "pisolith": "cave_pearl_pisolith",
        "pisoliths": "cave_pearl_pisolith",
        "helictite": "eccentric_helictite",
        "helictites": "eccentric_helictite",
        "eccentric helictite": "eccentric_helictite",
        "anthodite": "radiating_anthodite",
        "anthodites": "radiating_anthodite",
        "radiating anthodite": "radiating_anthodite",
        "flowstone": "flowstone_drapery",
        "drapery": "flowstone_drapery",
        "frostwork": "aragonite_frostwork",
        "aragonite frostwork": "aragonite_frostwork",
        "rimstone": "rimstone_dam_gour",
        "rimstone dam": "rimstone_dam_gour",
        "gour": "rimstone_dam_gour",
        "gour dam": "rimstone_dam_gour",
    }
    matched_speleothem_type: Optional[str] = None
    for kw, st in speleothem_type_mappings.items():
        if kw in q:
            matched_speleothem_type = st
            break

    mineralogy_keywords = [
        "cave pearl",
        "cave pearls",
        "pisolith",
        "pisoliths",
        "speleothem",
        "speleothems",
        "helictite",
        "helictites",
        "anthodite",
        "anthodites",
        "gypsum flower",
        "gypsum needle",
        "rimstone dam",
        "gour dam",
        "calcite saturation",
        "karst mineralogy",
        "carbonate saturation",
        "aragonite",
        "mineral accretion",
    ]
    is_mineralogy_query = any(k in q for k in mineralogy_keywords)
    if not is_mineralogy_query and not matched_site_id:
        return None

    calc_keywords = [
        "calculate",
        "calc",
        "accretion",
        "saturation index",
        "pool agitation",
        "joules",
        "rotation state",
        "triage",
        "drip rate",
        "calcite saturation",
        "carbonate saturation",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "lamp",
        "uv",
        "caliper",
        "gloves",
        "nitrile",
        "photogrammetry",
        "boot cover",
        "specimen case",
    ]

    if any(k in q for k in calc_keywords) and (
        "calculate" in q
        or "calc" in q
        or "accretion" in q
        or "saturation index" in q
        or "rotation" in q
        or "joules" in q
        or "turn" in q
    ):
        action = "calculate_accretion"
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
            "microclimate",
            "highlights",
            "chamber",
            "room",
            "gallery",
            "grotto",
        ]
    ):
        action = "site_detail"
    elif matched_site_id and not any(
        k in q for k in ["sites", "catalog", "list", "options", "caves"]
    ):
        action = "site_detail"
    else:
        action = "sites_list"

    return CaveMineralogyIntent(
        action=action,
        site_id=matched_site_id,
        speleothem_type=matched_speleothem_type,
    )


def format_cave_mineralogy_response(
    intent: Union[CaveMineralogyIntent, str],
    data: Any = None,
) -> FormattedCaveMineralogyResponse:
    if isinstance(data, dict) and "cave_mineralogy_info" in data:
        answer = str(
            data.get(
                "answer",
                "Subterranean karst mineralogy and speleothem survey telemetry",
            )
        )
        return FormattedCaveMineralogyResponse(answer, data)

    # Normalize intent and action
    if isinstance(intent, CaveMineralogyIntent):
        intent_obj = intent
    elif isinstance(intent, str):
        if intent == "cave_mineralogy" and isinstance(data, str):
            detected = detect_cave_mineralogy_intent(data)
            intent_obj = (
                detected if detected else CaveMineralogyIntent(action="sites_list")
            )
        elif intent in ("calculate_accretion", "calculate"):
            intent_obj = CaveMineralogyIntent(action="calculate_accretion")
        elif intent in ("gear_checklist", "gear"):
            intent_obj = CaveMineralogyIntent(action="gear_checklist")
        elif intent in ("site_detail", "detail"):
            site_id = (
                data
                if isinstance(data, str) and data in DEFAULT_CAVE_MINERALOGY_SITES
                else None
            )
            intent_obj = CaveMineralogyIntent(action="site_detail", site_id=site_id)
        else:
            intent_obj = CaveMineralogyIntent(action=intent)
    else:
        intent_obj = CaveMineralogyIntent(action="sites_list")

    action = intent_obj.action

    if action in ("calculate_accretion", "calculate"):
        if isinstance(data, MineralAccretionResult):
            calc_res = data
        elif isinstance(data, MineralAccretionQuery):
            calc_res = calculate_mineral_accretion(data)
        else:
            calc_q = MineralAccretionQuery(
                site_id=intent_obj.site_id or "carlsbad-rookery-chamber",
                speleothem_type=intent_obj.speleothem_type or "cave_pearl_pisolith",
            )
            calc_res = calculate_mineral_accretion(calc_q)

        answer = (
            f"Karst Speleothem Mineral Accretion Survey for {calc_res.site_title}: "
            f"Triage: {calc_res.triage_status.upper()}. "
            f"Calcite Saturation Index: {calc_res.calcite_saturation_index:+0.2f} SI. "
            f"Pool Agitation: {calc_res.pool_agitation_joules_per_hour:.2f} J/hr. "
            f"Pearl Rotation: {calc_res.rotation_state}. "
            f"Accretion Rate: ~{calc_res.estimated_accretion_microns_per_year} µm/yr. "
            f"{calc_res.conservation_advisory} Protocol: {calc_res.monitoring_protocol}"
        )
        calc_info: dict[str, Any] = {
            "cave_mineralogy_info": {
                "action": "calculate_accretion",
                "site_id": calc_res.site_id,
                "calculation": calc_res.model_dump(),
                "calcite_saturation_index": calc_res.calcite_saturation_index,
                "pool_agitation_joules_per_hour": calc_res.pool_agitation_joules_per_hour,
                "rotation_state": calc_res.rotation_state,
                "estimated_accretion_microns_per_year": calc_res.estimated_accretion_microns_per_year,
                "triage_status": calc_res.triage_status,
                "conservation_advisory": calc_res.conservation_advisory,
                "monitoring_protocol": calc_res.monitoring_protocol,
            },
            "answer": answer,
        }
        return FormattedCaveMineralogyResponse(answer, calc_info)

    if action in ("gear_checklist", "gear"):
        checklist = data if isinstance(data, list) else get_speleothem_gear_checklist()
        items_str = "; ".join(f"{g.name} ({g.purpose})" for g in checklist)
        answer = (
            f"Mandatory Speleothem Survey & Karst Mineralogy Gear Checklist ({len(checklist)} items): "
            f"{items_str}. All surveyors must wear sterile powder-free nitrile gloves and lint-free suits "
            f"to prevent permanent contamination of delicate calcite crystal lattices."
        )
        gear_info: dict[str, Any] = {
            "cave_mineralogy_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedCaveMineralogyResponse(answer, gear_info)

    if action in ("site_detail", "detail", "cave_detail"):
        site = None
        if intent_obj.site_id:
            site = get_cave_mineralogy_site(intent_obj.site_id)
        if not site and isinstance(data, CaveMineralogySite):
            site = data
        if not site:
            site = get_cave_mineralogy_site("carlsbad-rookery-chamber")

        if site:
            highlights_str = ", ".join(site.highlights)
            answer = (
                f"Karst Speleothem Site: {site.name} ({site.system}, {site.region}). "
                f"Max Depth: {site.max_depth_m}m | Ambient Temp: {site.ambient_temp_c}°C | "
                f"Humidity: {site.humidity_percent}% | Host Rock: {site.host_rock} | "
                f"Primary Speleothem: {site.speleothem_type} | Conservation Status: {site.conservation_status}. "
                f"{site.description} Key Highlights: {highlights_str}."
            )
            site_info: dict[str, Any] = {
                "cave_mineralogy_info": {
                    "action": "site_detail",
                    "site_id": site.id,
                    "site": site.model_dump(),
                },
                "answer": answer,
            }
            return FormattedCaveMineralogyResponse(answer, site_info)

    sites = (
        data
        if isinstance(data, list)
        else get_cave_mineralogy_sites(
            speleothem_type=intent_obj.speleothem_type,
            conservation=intent_obj.conservation,
        )
    )
    summary_str = "; ".join(
        f"{s.name} ({s.region}, {s.speleothem_type}, {s.conservation_status})"
        for s in sites
    )
    answer = (
        f"Contoso Karst Mineralogy & Speleothem Survey Catalog ({len(sites)} sites): {summary_str}. "
        "Inquire about specific speleothem sites, calcite saturation and pearl rotation calculations, "
        "or clean-caving non-destructive survey gear checklists."
    )
    list_info: dict[str, Any] = {
        "cave_mineralogy_info": {
            "action": "sites_list",
            "speleothem_type": intent_obj.speleothem_type,
            "conservation": intent_obj.conservation,
            "sites": [s.model_dump() for s in sites],
        },
        "answer": answer,
    }
    return FormattedCaveMineralogyResponse(answer, list_info)


def build_cave_mineralogy_prompt(
    intent: Optional[Union[CaveMineralogyIntent, str]] = None,
) -> str:
    lines = [
        "Wilderness Caving Cave Pearl Karst Mineralogy & Speleothem Survey Guidance:",
        "- Cave Pearl Pisolith Hydrodynamics: Constant ceiling drips agitate shallow rimstone splash pools, rotating spherical calcite pisoliths and preventing premature floor cementation.",
        "- Speleothem Diversity: Eccentric helictites grow through capillary suction, aragonite anthodites radiate needle-like clusters under delicate humidity equilibrium, and gypsum chandeliers expand from sulfuric acid dissolution.",
        "- Calcite Saturation Index (SI): SI = (pH - 7.0) * 0.6 + (CaCO3 - 200) / 400. Positive SI indicates supersaturation and active mineral accretion; negative SI indicates corrosive dissolution and desiccation risk.",
        "- Conservation Triage: Pristine active growth sites require non-destructive laser photogrammetry, powder-free survey gloves to prevent skin lipid contamination, and restricted caver party sizing.",
        "- Mandatory Speleothem Survey Gear: 365nm Filtered UV Lamp, Non-Contact Laser Caliper, Waterproof pH/EC Meter, Powder-Free Nitrile Gloves, Acoustic Drip Sensor, Pressure-Equalized Specimen Case.",
    ]
    site_id = None
    if isinstance(intent, CaveMineralogyIntent) and intent.site_id:
        site_id = intent.site_id
    elif isinstance(intent, str):
        detected = detect_cave_mineralogy_intent(intent)
        if detected and detected.site_id:
            site_id = detected.site_id
        elif intent in DEFAULT_CAVE_MINERALOGY_SITES:
            site_id = intent

    if site_id:
        s = get_cave_mineralogy_site(site_id)
        if s:
            lines.append(
                f"- Focused Karst Speleothem Site: {s.name} ({s.region}, Speleothem: {s.speleothem_type}, Host Rock: {s.host_rock}, Conservation: {s.conservation_status})"
            )
    return "\n".join(lines)


def cave_mineralogy_tool(
    query: Optional[MineralAccretionQuery] = None,
    action: Optional[str] = None,
    site_id: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_accretion") or query is not None:
        calc_q = query or MineralAccretionQuery(
            site_id=site_id or "carlsbad-rookery-chamber"
        )
        res = calculate_mineral_accretion(calc_q)
        formatted = format_cave_mineralogy_response("calculate_accretion", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_speleothem_gear_checklist()
        formatted = format_cave_mineralogy_response("gear_checklist", checklist)
        return dict(formatted._data)

    if action in ("site_detail", "detail", "cave_detail") and site_id:
        site = get_cave_mineralogy_site(site_id)
        if site:
            formatted = format_cave_mineralogy_response("site_detail", site)
            return dict(formatted._data)

    sites = get_cave_mineralogy_sites()
    formatted = format_cave_mineralogy_response("sites_list", sites)
    return dict(formatted._data)
