"""Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Ecology Tooling & Domain Logic."""

from enum import Enum
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator


class CanopyStratum(str, Enum):
    GROUND_FLOOR_BRYOSPHERE = "ground_floor_bryosphere"
    SUBCANOPY_TRUNK_EPIPHYTES = "subcanopy_trunk_epiphytes"
    TREE_FERN_CAUDEX_SKIRT = "tree_fern_caudex_skirt"
    MID_CANOPY_BRANCH_MATS = "mid_canopy_branch_mats"
    EMERGENT_OUTER_CANOPY = "emergent_outer_canopy"


class HostSubstrate(str, Enum):
    SITKA_SPRUCE_BARK = "sitka_spruce_bark"
    WESTERN_HEMLOCK_FLUTED_TRUNK = "western_hemlock_fluted_trunk"
    DICKSONIA_ANTARCTICA_FIBROUS_CAUDEX = "dicksonia_antarctica_fibrous_caudex"
    BIGLEAF_MAPLE_EPIPHYTE_LIMB = "bigleaf_maple_epiphyte_limb"
    TASMANIAN_MYRTLE_BEECH = "tasmanian_myrtle_beech"


class RainforestMicroclimate(str, Enum):
    HYPER_MARITIME_PERHUMID = "hyper_maritime_perhumid"
    MONTANE_CLOUD_INVERSION = "montane_cloud_inversion"
    SHELTERED_RIPARIAN_GORGE = "sheltered_riparian_gorge"
    SEASONALLY_BUFFERED_TEMPERATE = "seasonally_buffered_temperate"


class EpiphyteHydrationState(str, Enum):
    POIKILOHYDRIC_DORMANT = "poikilohydric_dormant"
    ACTIVE_PHOTOSYNTHETIC_SATURATION = "active_photosynthetic_saturation"
    FOG_INTERCEPTION_PHASE = "fog_interception_phase"


class CanopyBryophyteConservationStatus(str, Enum):
    PRISTINE_CLIMAX_BRYOSPHERE = "pristine_climax_bryosphere"
    VULNERABLE_FRAGMENTATION_RISK = "vulnerable_fragmentation_risk"
    MICROCLIMATE_DESICCATION_WARNING = "microclimate_desiccation_warning"


class CanopyBryophyteSite(BaseModel):
    id: str
    title: str = ""
    name: str = ""
    site_id: str = ""
    region: str = ""
    range: str = ""
    elevation_meters: float = 0.0
    dominant_stratum: str = CanopyStratum.GROUND_FLOOR_BRYOSPHERE.value
    primary_substrate: str = HostSubstrate.SITKA_SPRUCE_BARK.value
    microclimate: str = RainforestMicroclimate.HYPER_MARITIME_PERHUMID.value
    description: str = ""
    highlights: list[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "id",
                "site_id": "id",
                "elevationMeters": "elevation_meters",
                "dominantStratum": "dominant_stratum",
                "primarySubstrate": "primary_substrate",
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
    def elevationMeters(self) -> float:
        return self.elevation_meters

    @property
    def dominantStratum(self) -> str:
        return self.dominant_stratum

    @property
    def primarySubstrate(self) -> str:
        return self.primary_substrate


class CanopyBryophyteDynamicsQuery(BaseModel):
    site_id: str = "hoh-river-hall-of-mosses"
    stratum: str = CanopyStratum.MID_CANOPY_BRANCH_MATS.value
    substrate: str = HostSubstrate.BIGLEAF_MAPLE_EPIPHYTE_LIMB.value
    ambient_humidity_percent: float = 85.0
    canopy_height_meters: float = 35.0
    fog_drip_rate_mm_day: float = 4.5
    mat_thickness_cm: float = 12.0

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "site_id",
                "ambientHumidityPercent": "ambient_humidity_percent",
                "canopyHeightMeters": "canopy_height_meters",
                "fogDripRateMmDay": "fog_drip_rate_mm_day",
                "matThicknessCm": "mat_thickness_cm",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def siteId(self) -> str:
        return self.site_id

    @property
    def ambientHumidityPercent(self) -> float:
        return self.ambient_humidity_percent

    @property
    def canopyHeightMeters(self) -> float:
        return self.canopy_height_meters

    @property
    def fogDripRateMmDay(self) -> float:
        return self.fog_drip_rate_mm_day

    @property
    def matThicknessCm(self) -> float:
        return self.mat_thickness_cm


class CanopyBryophyteDynamicsResult(BaseModel):
    site_title: str
    site_id: Optional[str] = None
    water_storage_capacity_liters_m2: float
    poikilohydric_recovery_time_minutes: float
    canopy_epiphyte_biomass_kg_ha: float
    microclimate_buffer_index: float
    conservation_status: str
    canopy_access_protocol: str
    microscope_identification_advisory: str
    hydration_state: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteTitle": "site_title",
                "siteId": "site_id",
                "waterStorageCapacityLitersM2": "water_storage_capacity_liters_m2",
                "poikilohydricRecoveryTimeMinutes": "poikilohydric_recovery_time_minutes",
                "canopyEpiphyteBiomassKgHa": "canopy_epiphyte_biomass_kg_ha",
                "microclimateBufferIndex": "microclimate_buffer_index",
                "conservationStatus": "conservation_status",
                "canopyAccessProtocol": "canopy_access_protocol",
                "microscopeIdentificationAdvisory": "microscope_identification_advisory",
                "hydrationState": "hydration_state",
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
    def waterStorageCapacityLitersM2(self) -> float:
        return self.water_storage_capacity_liters_m2

    @property
    def poikilohydricRecoveryTimeMinutes(self) -> float:
        return self.poikilohydric_recovery_time_minutes

    @property
    def canopyEpiphyteBiomassKgHa(self) -> float:
        return self.canopy_epiphyte_biomass_kg_ha

    @property
    def microclimateBufferIndex(self) -> float:
        return self.microclimate_buffer_index

    @property
    def conservationStatus(self) -> str:
        return self.conservation_status

    @property
    def canopyAccessProtocol(self) -> str:
        return self.canopy_access_protocol

    @property
    def microscopeIdentificationAdvisory(self) -> str:
        return self.microscope_identification_advisory

    @property
    def hydrationState(self) -> Optional[str]:
        return self.hydration_state


class CanopyBryophyteGearItem(BaseModel):
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


class CanopyBryophyteIntent(BaseModel):
    action: Literal["catalog", "get_site", "calculate", "gear_checklist"] = "catalog"
    site_id: Optional[str] = None
    query: Optional[str] = None
    stratum: Optional[str] = None


class FormattedCanopyBryophyteResponse(str):
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


DEFAULT_CANOPY_BRYOPHYTE_SITES: dict[str, CanopyBryophyteSite] = {
    "hoh-river-hall-of-mosses": CanopyBryophyteSite(
        id="hoh-river-hall-of-mosses",
        title="Hoh River Hall of Mosses",
        name="Hoh River Hall of Mosses",
        site_id="hoh-river-hall-of-mosses",
        region="Olympic National Park, Washington, USA",
        range="Olympic Mountains",
        elevation_meters=180.0,
        dominant_stratum=CanopyStratum.MID_CANOPY_BRANCH_MATS.value,
        primary_substrate=HostSubstrate.BIGLEAF_MAPLE_EPIPHYTE_LIMB.value,
        microclimate=RainforestMicroclimate.HYPER_MARITIME_PERHUMID.value,
        description="Temperate rainforest canopy cathedral dominated by massive Acer macrophyllum laden with multi-ton mats of Isothecium stoloniferum and epiphytic ferns.",
        highlights=[
            "Multi-ton pendulous moss curtains",
            "Nurse log regeneration colonnades",
            "Hyper-maritime fog drip interception",
        ],
    ),
    "tarkine-takayna-rainforest": CanopyBryophyteSite(
        id="tarkine-takayna-rainforest",
        title="Takayna / Tarkine Rainforest Wilderness",
        name="Takayna / Tarkine Rainforest Wilderness",
        site_id="tarkine-takayna-rainforest",
        region="Tasmania, Australia",
        range="Norfolk Ranges",
        elevation_meters=320.0,
        dominant_stratum=CanopyStratum.TREE_FERN_CAUDEX_SKIRT.value,
        primary_substrate=HostSubstrate.DICKSONIA_ANTARCTICA_FIBROUS_CAUDEX.value,
        microclimate=RainforestMicroclimate.SHELTERED_RIPARIAN_GORGE.value,
        description="Gondwanic cool-temperate rainforest featuring ancient Myrtle Beech and towering Dicksonia antarctica tree ferns harboring hyper-diverse filmy fern and liverwort skirts.",
        highlights=[
            "Dicksonia antarctica fibrous caudex skirts",
            "Ancient Nothofagus cunninghamii epiphyte platforms",
            "Cryptogamic mantle microclimate buffering",
        ],
    ),
    "fiordland-milford-sound-canopy": CanopyBryophyteSite(
        id="fiordland-milford-sound-canopy",
        title="Fiordland Milford Sound Hanging Bryosphere",
        name="Fiordland Milford Sound Hanging Bryosphere",
        site_id="fiordland-milford-sound-canopy",
        region="South Island, New Zealand",
        range="Southern Alps",
        elevation_meters=120.0,
        dominant_stratum=CanopyStratum.SUBCANOPY_TRUNK_EPIPHYTES.value,
        primary_substrate=HostSubstrate.TASMANIAN_MYRTLE_BEECH.value,
        microclimate=RainforestMicroclimate.HYPER_MARITIME_PERHUMID.value,
        description="Extreme-precipitation glacial fiord precipices where mosses, liverworts, and kidney ferns drape sheer rainforest canopies fed by thousands of millimeters of annual rain.",
        highlights=[
            "Glacial fiord wall bryosphere drapes",
            "Plagiochila liverwort cushions",
            "Saturated moss avalanche avoidance zones",
        ],
    ),
    "yakushima-ancient-cedar-moss": CanopyBryophyteSite(
        id="yakushima-ancient-cedar-moss",
        title="Yakushima Ancient Yaku-sugi Cedar Moss Forest",
        name="Yakushima Ancient Yaku-sugi Cedar Moss Forest",
        site_id="yakushima-ancient-cedar-moss",
        region="Yakushima, Kagoshima, Japan",
        range="Miyanoura Mountain Massif",
        elevation_meters=750.0,
        dominant_stratum=CanopyStratum.MID_CANOPY_BRANCH_MATS.value,
        primary_substrate=HostSubstrate.WESTERN_HEMLOCK_FLUTED_TRUNK.value,
        microclimate=RainforestMicroclimate.MONTANE_CLOUD_INVERSION.value,
        description="Subtropical-to-temperate island cloud forest harboring millenary Cryptomeria japonica enveloped by deep Sphagnum and Dicranum epiphytic mats.",
        highlights=[
            "Millennial Yaku-sugi cedar epiphyte branches",
            "Subtropical-montane cloud moss carpets",
            "Perpetual rainfall mist canopy saturation",
        ],
    ),
    "great-bear-rainforest-fjords": CanopyBryophyteSite(
        id="great-bear-rainforest-fjords",
        title="Great Bear Rainforest Estuary Fjords",
        name="Great Bear Rainforest Estuary Fjords",
        site_id="great-bear-rainforest-fjords",
        region="British Columbia, Canada",
        range="Pacific Coast Ranges",
        elevation_meters=45.0,
        dominant_stratum=CanopyStratum.EMERGENT_OUTER_CANOPY.value,
        primary_substrate=HostSubstrate.SITKA_SPRUCE_BARK.value,
        microclimate=RainforestMicroclimate.SEASONALLY_BUFFERED_TEMPERATE.value,
        description="Intact coastal temperate rainforest where giant Picea sitchensis intercept Pacific sea mist, supporting specialized pendulous lichens and epiphytic moss bioindicators.",
        highlights=[
            "Giant Sitka spruce emergent crowns",
            "Salmon-derived nitrogen moss enrichment",
            "Intertidal-canopy maritime interface",
        ],
    ),
}

CANOPY_BRYOPHYTE_GEAR: list[CanopyBryophyteGearItem] = [
    CanopyBryophyteGearItem(
        item_id="arborist-friction-cambium-saver",
        name="Arborist Friction Cambium Saver Sleeve",
        category="canopy_access",
        mandatory=True,
        description="Tubular webbing with unequal friction rings to isolate ropes and protect host bark cambium from mechanical abrasion during ascent.",
    ),
    CanopyBryophyteGearItem(
        item_id="lightweight-srt-canopy-ascent-kit",
        name="Lightweight SRT Canopy Ascent Kit",
        category="canopy_access",
        mandatory=True,
        description="Single rope technique footloop, chest ascender, and handled clamp calibrated for low-impact ascent into high tree limbs.",
    ),
    CanopyBryophyteGearItem(
        item_id="handheld-20x-achromatic-loupe",
        name="Handheld 20x Achromatic Field Loupe",
        category="microscopy",
        mandatory=True,
        description="Precision doublet optical magnifier with LED illumination for inspecting bryophyte leaf cell alar structures and peristome teeth in the canopy.",
    ),
    CanopyBryophyteGearItem(
        item_id="digital-ultrasonic-fog-canopy-hygrometer",
        name="Digital Ultrasonic Fog Canopy Hygrometer",
        category="microclimate",
        mandatory=True,
        description="Weather-sealed high-precision sensor measuring ambient vapor pressure deficit and fog droplet interception within the epiphyte mat.",
    ),
    CanopyBryophyteGearItem(
        item_id="breathable-botanical-collection-pouches",
        name="Breathable Botanical Collection Pouches",
        category="specimen",
        mandatory=True,
        description="Micro-perforated acid-free packets allowing moist bryophyte samples to slowly desiccate without mold formation during field transit.",
    ),
    CanopyBryophyteGearItem(
        item_id="tree-fern-caudex-caliper-gauge",
        name="Tree-Fern Caudex Caliper Gauge",
        category="measurement",
        mandatory=True,
        description="Non-invasive composite caliper for measuring fibrous caudex trunk diameter and adventitious aerial root thickness without crushing epiphyte roots.",
    ),
]


def get_canopy_bryophyte_site(site_id: str) -> Optional[CanopyBryophyteSite]:
    return DEFAULT_CANOPY_BRYOPHYTE_SITES.get(site_id)


def get_canopy_bryophyte_sites(stratum: Optional[str] = None) -> list[CanopyBryophyteSite]:
    sites = list(DEFAULT_CANOPY_BRYOPHYTE_SITES.values())
    if stratum:
        sites = [s for s in sites if s.dominant_stratum == stratum]
    return sites


def get_canopy_bryophyte_gear() -> list[CanopyBryophyteGearItem]:
    return list(CANOPY_BRYOPHYTE_GEAR)


def calculate_canopy_bryophyte_dynamics(
    query: CanopyBryophyteDynamicsQuery,
) -> CanopyBryophyteDynamicsResult:
    site = get_canopy_bryophyte_site(query.site_id)
    if not site:
        raise ValueError(f"Canopy bryophyte site '{query.site_id}' not found")

    # Water storage capacity (10.0 to 120.0 L/m²)
    raw_storage = query.mat_thickness_cm * 5.0 + (query.fog_drip_rate_mm_day * 2.5)
    if query.substrate == HostSubstrate.DICKSONIA_ANTARCTICA_FIBROUS_CAUDEX.value:
        raw_storage *= 1.15
    water_storage_capacity = round(max(10.0, min(120.0, raw_storage)), 1)

    # Poikilohydric recovery time (5.0 to 90.0 minutes)
    raw_recovery = (100.0 - query.ambient_humidity_percent) * 0.9 + (20.0 / (query.fog_drip_rate_mm_day + 0.5))
    recovery_time = round(max(5.0, min(90.0, raw_recovery)), 1)

    # Epiphyte biomass accumulation (500.0 to 5000.0 kg/ha)
    raw_biomass = query.mat_thickness_cm * 180.0 + query.canopy_height_meters * 40.0
    biomass_accumulation = round(max(500.0, min(5000.0, raw_biomass)), 1)

    # Microclimate buffer index (0.00 to 1.00)
    raw_buffer = (query.ambient_humidity_percent / 100.0) * 0.65 + (query.mat_thickness_cm / 20.0) * 0.35
    microclimate_buffer_index = round(max(0.00, min(1.00, raw_buffer)), 2)

    # Conservation status & Hydration state
    if query.ambient_humidity_percent < 55.0 or microclimate_buffer_index < 0.50 or query.mat_thickness_cm < 4.0:
        conservation_status = CanopyBryophyteConservationStatus.MICROCLIMATE_DESICCATION_WARNING.value
    elif microclimate_buffer_index >= 0.75 and query.ambient_humidity_percent >= 80.0:
        conservation_status = CanopyBryophyteConservationStatus.PRISTINE_CLIMAX_BRYOSPHERE.value
    else:
        conservation_status = CanopyBryophyteConservationStatus.VULNERABLE_FRAGMENTATION_RISK.value

    if query.ambient_humidity_percent >= 85.0 or query.fog_drip_rate_mm_day >= 4.0:
        hydration_state = EpiphyteHydrationState.ACTIVE_PHOTOSYNTHETIC_SATURATION.value
    elif query.ambient_humidity_percent >= 65.0:
        hydration_state = EpiphyteHydrationState.FOG_INTERCEPTION_PHASE.value
    else:
        hydration_state = EpiphyteHydrationState.POIKILOHYDRIC_DORMANT.value

    canopy_access_protocol = (
        "Strict canopy rigging protocol: Single Rope Technique (SRT) ascent utilizing arborist friction "
        "cambium saver sleeve on branches >15cm diameter. Foot placement restricted to bare wood; never step "
        "directly onto bryophyte cushions or tree-fern caudex skirts."
    )
    microscope_advisory = (
        "Diagnostic microscopy protocol: Examine alar cells, costa nerve endings, and peristome teeth under "
        "20x loupe or field compound scope. Verify poikilohydric hydration saturation prior to diagnostic mounting."
    )

    return CanopyBryophyteDynamicsResult(
        site_title=site.title,
        site_id=site.id,
        water_storage_capacity_liters_m2=water_storage_capacity,
        poikilohydric_recovery_time_minutes=recovery_time,
        canopy_epiphyte_biomass_kg_ha=biomass_accumulation,
        microclimate_buffer_index=microclimate_buffer_index,
        conservation_status=conservation_status,
        canopy_access_protocol=canopy_access_protocol,
        microscope_identification_advisory=microscope_advisory,
        hydration_state=hydration_state,
    )


def detect_canopy_bryophyte_intent(message: str) -> bool:
    if not message or not message.strip():
        return False

    q = message.lower().strip()

    exclusions = [
        "order #",
        "refund",
        "tiankeng",
        "giant sinkhole",
        "collapse sinkhole",
        "mega-doline",
        "xiaozhai",
        "dashiwei",
        "golondrinas",
        "sarisarinama",
        "sarisariñama",
        "sima humboldt",
        "return label",
        "shipping tracking",
        "krummholz",
        "bushwhack",
        "bushwhacking",
        "dwarf conifer",
        "dwarf-conifer",
        "spruce trap",
        "latschenkiefer",
        "pinus mugo",
        "hai-matsu",
        "slide alder",
        "cripplebrush",
        "timberline thicket",
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
        "pulk",
        "crevasse pulk",
        "pothole",
        "pot-hole",
        "sandtrap",
        "cheater stick",
        "rock climbing",
        "trad climbing",
        "sport climbing",
        "chalk bag",
        "canyoneering",
    ]
    if any(ex in q for ex in exclusions):
        return False

    bryo_keywords = [
        "canopy bryophyte",
        "canopy bryophytes",
        "epiphytic bryophyte",
        "epiphytic bryophytes",
        "tree-fern",
        "tree-ferns",
        "tree fern",
        "tree ferns",
        "caudex",
        "caudex skirt",
        "caudex skirts",
        "nurse log",
        "nurse logs",
        "canopy moss",
        "canopy mosses",
        "pendulous moss",
        "pendulous mosses",
        "hoh river moss",
        "takayna",
        "dicksonia",
        "dicksonia antarctica",
        "bryosphere",
        "poikilohydric",
        "poikilohydry",
        "filmy fern",
        "epiphyte mat",
        "epiphytic mat",
        "epiphyte mats",
        "epiphytic mats",
        "epiphyte biomass",
        "canopy epiphyte",
        "canopy epiphytes",
    ]

    site_keywords = [
        "hoh river hall of mosses",
        "hall of mosses",
        "tarkine",
        "takayna",
        "fiordland",
        "milford sound",
        "yakushima",
        "yaku-sugi",
        "great bear rainforest",
    ]

    has_bryo = any(k in q for k in bryo_keywords)
    has_site = any(k in q for k in site_keywords)

    return has_bryo or has_site


def extract_canopy_bryophyte_intent(message: str) -> CanopyBryophyteIntent:
    q = message.lower().strip()

    matched_site_id: Optional[str] = None
    if "hoh" in q or "hall of mosses" in q:
        matched_site_id = "hoh-river-hall-of-mosses"
    elif "takayna" in q or "tarkine" in q:
        matched_site_id = "tarkine-takayna-rainforest"
    elif "fiordland" in q or "milford" in q:
        matched_site_id = "fiordland-milford-sound-canopy"
    elif "yakushima" in q or "yaku-sugi" in q or "cedar" in q:
        matched_site_id = "yakushima-ancient-cedar-moss"
    elif "great bear" in q:
        matched_site_id = "great-bear-rainforest-fjords"
    else:
        for s_id in DEFAULT_CANOPY_BRYOPHYTE_SITES:
            if s_id in q:
                matched_site_id = s_id
                break

    stratum: Optional[str] = None
    if "ground floor" in q or "forest floor" in q:
        stratum = CanopyStratum.GROUND_FLOOR_BRYOSPHERE.value
    elif "subcanopy" in q or "trunk" in q:
        stratum = CanopyStratum.SUBCANOPY_TRUNK_EPIPHYTES.value
    elif "tree fern" in q or "tree-fern" in q or "caudex" in q:
        stratum = CanopyStratum.TREE_FERN_CAUDEX_SKIRT.value
    elif "branch" in q or "mat" in q or "mats" in q or "mid canopy" in q or "mid-canopy" in q:
        stratum = CanopyStratum.MID_CANOPY_BRANCH_MATS.value
    elif "emergent" in q or "outer canopy" in q:
        stratum = CanopyStratum.EMERGENT_OUTER_CANOPY.value
    elif matched_site_id and matched_site_id in DEFAULT_CANOPY_BRYOPHYTE_SITES:
        stratum = DEFAULT_CANOPY_BRYOPHYTE_SITES[matched_site_id].dominant_stratum

    calc_keywords = [
        "calculate",
        "calculation",
        "dynamics",
        "water storage",
        "capacity",
        "biomass",
        "recovery time",
        "buffer index",
        "humidity",
        "drip",
        "thickness",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "loupe",
        "hygrometer",
        "cambium saver",
        "srt",
        "ascent kit",
        "pouch",
        "caliper",
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
            "elevation",
            "substrate",
            "microclimate",
        ]
    ):
        action = "get_site"
    elif matched_site_id and not any(
        k in q for k in ["sites", "catalog", "list", "options", "all", "rainforests"]
    ):
        action = "get_site"
    else:
        action = "catalog"

    return CanopyBryophyteIntent(
        action=action,
        site_id=matched_site_id,
        query=message,
        stratum=stratum,
    )


def format_canopy_bryophyte_response(
    action: Union[CanopyBryophyteIntent, str],
    message: Any = None,
) -> FormattedCanopyBryophyteResponse:
    if isinstance(message, dict) and "canopy_bryophyte_info" in message:
        answer = str(
            message.get(
                "answer",
                "Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Ecology Guidance",
            )
        )
        return FormattedCanopyBryophyteResponse(answer, message)

    intent_obj: CanopyBryophyteIntent
    if isinstance(action, CanopyBryophyteIntent):
        intent_obj = action
    elif isinstance(action, str):
        if action in ("canopy_bryophyte", "bryophyte_ecology", "canopy_moss") and isinstance(message, str):
            intent_obj = extract_canopy_bryophyte_intent(message)
        elif action in ("calculate", "calculate_dynamics"):
            site_id = (
                message
                if isinstance(message, str) and message in DEFAULT_CANOPY_BRYOPHYTE_SITES
                else None
            )
            intent_obj = CanopyBryophyteIntent(action="calculate", site_id=site_id)
        elif action in ("gear", "gear_checklist"):
            intent_obj = CanopyBryophyteIntent(action="gear_checklist")
        elif action in ("get_site", "site_detail", "detail"):
            site_id = (
                message
                if isinstance(message, str) and message in DEFAULT_CANOPY_BRYOPHYTE_SITES
                else None
            )
            intent_obj = CanopyBryophyteIntent(action="get_site", site_id=site_id)
        else:
            intent_obj = CanopyBryophyteIntent(action="catalog")
    else:
        intent_obj = CanopyBryophyteIntent(action="catalog")

    resolved_action = intent_obj.action

    if resolved_action == "calculate":
        if isinstance(message, CanopyBryophyteDynamicsResult):
            calc_res = message
        elif isinstance(message, CanopyBryophyteDynamicsQuery):
            calc_res = calculate_canopy_bryophyte_dynamics(message)
        else:
            site_to_use = intent_obj.site_id or "hoh-river-hall-of-mosses"
            site_obj = get_canopy_bryophyte_site(site_to_use)
            stratum = site_obj.dominant_stratum if site_obj else CanopyStratum.MID_CANOPY_BRANCH_MATS.value
            substrate = site_obj.primary_substrate if site_obj else HostSubstrate.BIGLEAF_MAPLE_EPIPHYTE_LIMB.value
            calc_q = CanopyBryophyteDynamicsQuery(
                site_id=site_to_use,
                stratum=stratum,
                substrate=substrate,
            )
            calc_res = calculate_canopy_bryophyte_dynamics(calc_q)

        answer = (
            f"Canopy Bryophyte Dynamics for {calc_res.site_title}: "
            f"Water Storage Capacity: {calc_res.water_storage_capacity_liters_m2} L/m². "
            f"Poikilohydric Recovery Time: {calc_res.poikilohydric_recovery_time_minutes} min. "
            f"Canopy Epiphyte Biomass: {calc_res.canopy_epiphyte_biomass_kg_ha} kg/ha. "
            f"Microclimate Buffer Index: {calc_res.microclimate_buffer_index:.2f}. "
            f"Conservation Status: {calc_res.conservation_status.upper()}. "
            f"{calc_res.canopy_access_protocol} {calc_res.microscope_identification_advisory}"
        )
        calc_info: dict[str, Any] = {
            "canopy_bryophyte_info": {
                "action": "calculate",
                "site_id": calc_res.site_id,
                "calculation": calc_res.model_dump(),
                "water_storage_capacity_liters_m2": calc_res.water_storage_capacity_liters_m2,
                "poikilohydric_recovery_time_minutes": calc_res.poikilohydric_recovery_time_minutes,
                "canopy_epiphyte_biomass_kg_ha": calc_res.canopy_epiphyte_biomass_kg_ha,
                "microclimate_buffer_index": calc_res.microclimate_buffer_index,
                "conservation_status": calc_res.conservation_status,
                "canopy_access_protocol": calc_res.canopy_access_protocol,
                "microscope_identification_advisory": calc_res.microscope_identification_advisory,
            },
            "answer": answer,
        }
        return FormattedCanopyBryophyteResponse(answer, calc_info)

    if resolved_action == "gear_checklist":
        checklist = message if isinstance(message, list) else get_canopy_bryophyte_gear()
        items_str = "; ".join(f"{g.name} ({g.description})" for g in checklist)
        answer = (
            f"Mandatory Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Arborist friction cambium saver, SRT ascent kit, 20x loupe, ultrasonic hygrometer, "
            f"breathable collection pouches, and caliper gauge are essential for canopy bryophyte expeditions."
        )
        gear_info: dict[str, Any] = {
            "canopy_bryophyte_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedCanopyBryophyteResponse(answer, gear_info)

    if resolved_action == "get_site":
        site = None
        if intent_obj.site_id:
            site = get_canopy_bryophyte_site(intent_obj.site_id)
        if not site and isinstance(message, CanopyBryophyteSite):
            site = message
        if not site and isinstance(message, str):
            site = get_canopy_bryophyte_site(message)
        if not site:
            site = get_canopy_bryophyte_site("hoh-river-hall-of-mosses")

        if site:
            highlights_str = ", ".join(site.highlights)
            answer = (
                f"Canopy Bryophyte Site: {site.title} ({site.range}, {site.region}). "
                f"Elevation: {site.elevation_meters} m | Dominant Stratum: {site.dominant_stratum} | "
                f"Primary Substrate: {site.primary_substrate} | Microclimate: {site.microclimate}. "
                f"{site.description} Key Highlights: {highlights_str}."
            )
            site_info: dict[str, Any] = {
                "canopy_bryophyte_info": {
                    "action": "get_site",
                    "site_id": site.id,
                    "site": site.model_dump(),
                },
                "answer": answer,
            }
            return FormattedCanopyBryophyteResponse(answer, site_info)

    sites = (
        message
        if isinstance(message, list)
        else get_canopy_bryophyte_sites(stratum=intent_obj.stratum)
    )
    summary_str = "; ".join(
        f"{s.title} ({s.region}, stratum: {s.dominant_stratum}, substrate: {s.primary_substrate})"
        for s in sites
    )
    answer = (
        f"Contoso Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Catalog ({len(sites)} sites): {summary_str}. "
        "Inquire about specific canopy sites, poikilohydric water storage calculations, or mandatory canopy access gear."
    )
    catalog_info: dict[str, Any] = {
        "canopy_bryophyte_info": {
            "action": "catalog",
            "stratum": intent_obj.stratum,
            "sites": [s.model_dump() for s in sites],
        },
        "answer": answer,
    }
    return FormattedCanopyBryophyteResponse(answer, catalog_info)


def build_canopy_bryophyte_prompt(message: Any = None) -> str:
    lines = [
        "Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Ecology Guidance:",
        "- Canopy Epiphytic Bryosphere & Stratification: Old-growth temperate rainforest canopies host stratified cryptogamic communities spanning ground floor bryospheres, subcanopy trunk mantles, tree-fern caudex skirts, and multi-ton mid-canopy branch mats.",
        "- Poikilohydric Physiology & Water Storage Dynamics: Bryophytes lack vascular xylem and stomatal regulation; they intercept cloud droplets and fog drip, absorbing 5 to 20 times their dry weight in water and buffering the inner forest microclimate.",
        "- Tree-Fern Caudex Skirt Ecology: Dicksonia antarctica and allied tree ferns possess adventitious fibrous caudex aerial root mantles providing continuous humidity buffering and specialized germination beds for epiphytic filmy ferns and micro-liverworts.",
        "- Canopy Access Ethics & Cambium Protection: Arborist friction cambium savers and Single Rope Technique (SRT) ascent kits are mandatory to prevent bark girdling and cushion displacement. Direct trampling of epiphyte mats is strictly prohibited.",
        "- Mandatory Field Gear: Arborist friction cambium saver, lightweight SRT ascent kit, handheld 20x achromatic field loupe, digital ultrasonic fog canopy hygrometer, breathable botanical collection pouches, and non-invasive tree-fern caudex caliper gauge.",
    ]
    site_id = None
    if isinstance(message, CanopyBryophyteIntent) and message.site_id:
        site_id = message.site_id
    elif isinstance(message, str):
        detected = detect_canopy_bryophyte_intent(message)
        if detected:
            intent_obj = extract_canopy_bryophyte_intent(message)
            if intent_obj and intent_obj.site_id:
                site_id = intent_obj.site_id

    if site_id:
        s = get_canopy_bryophyte_site(site_id)
        if s:
            lines.append(
                f"- Focused Canopy Site: {s.title} ({s.region}, Range: {s.range}, Elevation: {s.elevation_meters} m, Stratum: {s.dominant_stratum}, Substrate: {s.primary_substrate}, Microclimate: {s.microclimate})"
            )
    return "\n".join(lines)


def canopy_bryophyte_tool(
    query: Optional[CanopyBryophyteDynamicsQuery] = None,
    action: Optional[str] = None,
    site_id: Optional[str] = None,
    stratum: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_dynamics") or query is not None:
        calc_q = query or CanopyBryophyteDynamicsQuery(
            site_id=site_id or "hoh-river-hall-of-mosses"
        )
        res = calculate_canopy_bryophyte_dynamics(calc_q)
        formatted = format_canopy_bryophyte_response("calculate", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_canopy_bryophyte_gear()
        formatted = format_canopy_bryophyte_response("gear_checklist", checklist)
        return dict(formatted._data)

    if action in ("get_site", "site_detail", "detail") and site_id:
        site = get_canopy_bryophyte_site(site_id)
        if site:
            formatted = format_canopy_bryophyte_response("get_site", site)
            return dict(formatted._data)

    sites = get_canopy_bryophyte_sites(stratum=stratum)
    formatted = format_canopy_bryophyte_response("catalog", sites)
    return dict(formatted._data)
