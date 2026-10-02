from enum import Enum
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator


class LichenMorphology(str, Enum):
    CRUSTOSE_SAXICOLOUS = "crustose_saxicolous"
    FOLIOSE_MACROLICHEN = "foliose_macrolichen"
    FRUTICOSE_MACROLICHEN = "fruticose_macrolichen"
    SQUAMULOSE_SOIL_CRUST = "squamulose_soil_crust"


class SubstrateType(str, Enum):
    VOLCANIC_BASALT_OUTCROP = "volcanic_basalt_outcrop"
    GRANITIC_GNEISS_BOULDER = "granitic_gneiss_boulder"
    GLACIAL_TILL_GRAVEL = "glacial_till_gravel"
    CALCAREOUS_LIMESTONE_SHALE = "calcareous_limestone_shale"
    ACIDIC_PEAT_TUSSOCK = "acidic_peat_tussock"


class PermafrostStatus(str, Enum):
    CONTINUOUS_PERMAFROST = "continuous_permafrost"
    DISCONTINUOUS_PERMAFROST = "discontinuous_permafrost"
    ALPINE_PERMAFROST_ISLANDS = "alpine_permafrost_islands"
    SPORADIC_PERMAFROST = "sporadic_permafrost"


class AirQualityDeposition(str, Enum):
    PRISTINE_BASELINE = "pristine_baseline"
    MODERATE_DRIFT = "moderate_drift"
    ELEVATED_ANTHROPOGENIC = "elevated_anthropogenic"


class LichenConservationStatus(str, Enum):
    OPTIMAL_PRISTINE_CLIMAX = "optimal_pristine_climax"
    VULNERABLE_MICROCLIMATE_SHIFT = "vulnerable_microclimate_shift"
    CRITICAL_CRYOTURBATION_DISTURBANCE = "critical_cryoturbation_disturbance"


class TundraLichenSite(BaseModel):
    id: str
    title: str = ""
    name: str = ""
    site_id: str = ""
    region: str = ""
    range: str = ""
    elevation_meters: int = 0
    dominant_morphology: str = LichenMorphology.CRUSTOSE_SAXICOLOUS.value
    substrate_type: str = SubstrateType.VOLCANIC_BASALT_OUTCROP.value
    permafrost_status: str = PermafrostStatus.DISCONTINUOUS_PERMAFROST.value
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
                "dominantMorphology": "dominant_morphology",
                "substrateType": "substrate_type",
                "permafrostStatus": "permafrost_status",
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
    def elevationMeters(self) -> int:
        return self.elevation_meters

    @property
    def dominantMorphology(self) -> str:
        return self.dominant_morphology

    @property
    def substrateType(self) -> str:
        return self.substrate_type

    @property
    def permafrostStatus(self) -> str:
        return self.permafrost_status


class LichenDynamicsQuery(BaseModel):
    site_id: str = "denali-polychrome-pass"
    morphology: str = LichenMorphology.CRUSTOSE_SAXICOLOUS.value
    substrate: str = SubstrateType.VOLCANIC_BASALT_OUTCROP.value
    colony_diameter_mm: float = 45.0
    annual_growth_rate_mm_yr: float = 0.35
    uv_exposure_index: float = 6.0
    snow_cover_duration_months: float = 7.0
    air_deposition: str = AirQualityDeposition.PRISTINE_BASELINE.value

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "site_id",
                "colonyDiameterMm": "colony_diameter_mm",
                "annualGrowthRateMmYr": "annual_growth_rate_mm_yr",
                "uvExposureIndex": "uv_exposure_index",
                "snowCoverDurationMonths": "snow_cover_duration_months",
                "airDeposition": "air_deposition",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def siteId(self) -> str:
        return self.site_id

    @property
    def colonyDiameterMm(self) -> float:
        return self.colony_diameter_mm

    @property
    def annualGrowthRateMmYr(self) -> float:
        return self.annual_growth_rate_mm_yr

    @property
    def uvExposureIndex(self) -> float:
        return self.uv_exposure_index

    @property
    def snowCoverDurationMonths(self) -> float:
        return self.snow_cover_duration_months

    @property
    def airDeposition(self) -> str:
        return self.air_deposition


class LichenDynamicsResult(BaseModel):
    site_title: str
    site_id: Optional[str] = None
    estimated_colony_age_years: int
    bioindicator_health_index: float
    desiccation_resilience_score: float
    conservation_status: str
    lichenometry_advisory: str
    chemical_spot_test_protocol: str

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteTitle": "site_title",
                "siteId": "site_id",
                "estimatedColonyAgeYears": "estimated_colony_age_years",
                "bioindicatorHealthIndex": "bioindicator_health_index",
                "desiccationResilienceScore": "desiccation_resilience_score",
                "conservationStatus": "conservation_status",
                "lichenometryAdvisory": "lichenometry_advisory",
                "chemicalSpotTestProtocol": "chemical_spot_test_protocol",
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
    def estimatedColonyAgeYears(self) -> int:
        return self.estimated_colony_age_years

    @property
    def bioindicatorHealthIndex(self) -> float:
        return self.bioindicator_health_index

    @property
    def desiccationResilienceScore(self) -> float:
        return self.desiccation_resilience_score

    @property
    def conservationStatus(self) -> str:
        return self.conservation_status

    @property
    def lichenometryAdvisory(self) -> str:
        return self.lichenometry_advisory

    @property
    def chemicalSpotTestProtocol(self) -> str:
        return self.chemical_spot_test_protocol


class LichenGearItem(BaseModel):
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


class TundraLichenIntent(BaseModel):
    action: Literal["catalog", "get_site", "calculate", "gear_checklist"] = "catalog"
    site_id: Optional[str] = None
    query: Optional[str] = None
    morphology: Optional[str] = None


class FormattedTundraLichenResponse(str):
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


DEFAULT_TUNDRA_SITES: dict[str, TundraLichenSite] = {
    "denali-polychrome-pass": TundraLichenSite(
        id="denali-polychrome-pass",
        title="Denali Polychrome Pass Saxicolous Tundra",
        name="Denali Polychrome Pass Saxicolous Tundra",
        site_id="denali-polychrome-pass",
        region="Denali National Park, Alaska",
        range="Alaska Range",
        elevation_meters=1150,
        dominant_morphology=LichenMorphology.CRUSTOSE_SAXICOLOUS.value,
        substrate_type=SubstrateType.VOLCANIC_BASALT_OUTCROP.value,
        permafrost_status=PermafrostStatus.DISCONTINUOUS_PERMAFROST.value,
        description="Subarctic volcanic scree and exposed basalt ridges harboring centuries-old yellow map lichen (Rhizocarpon geographicum) and saxicolous bryophyte communities.",
        highlights=[
            "Centuries-old Rhizocarpon geographicum yellow map lichen colonies",
            "High-angle exposed volcanic basalt cliff faces and scree",
            "Discontinuous permafrost microhabitats with cryic weathering",
        ],
    ),
    "torngat-mountains-fjords": TundraLichenSite(
        id="torngat-mountains-fjords",
        title="Torngat Mountains Arctic Maritime Fjords",
        name="Torngat Mountains Arctic Maritime Fjords",
        site_id="torngat-mountains-fjords",
        region="Nunatsiavut, Newfoundland and Labrador",
        range="Torngat Mountains",
        elevation_meters=890,
        dominant_morphology=LichenMorphology.FRUTICOSE_MACROLICHEN.value,
        substrate_type=SubstrateType.GRANITIC_GNEISS_BOULDER.value,
        permafrost_status=PermafrostStatus.CONTINUOUS_PERMAFROST.value,
        description="Hyper-boreal arctic maritime tundra carpeted in sprawling fruticose caribou moss (Cladonia rangiferina) across ancient Archean gneiss boulders.",
        highlights=[
            "Archean granitic gneiss boulder fields and coastal ledges",
            "Extensive Cladonia rangiferina and stellaris caribou moss carpets",
            "Continuous maritime permafrost plateau with marine fog influence",
        ],
    ),
    "wrangell-st-elias-root-glacier": TundraLichenSite(
        id="wrangell-st-elias-root-glacier",
        title="Wrangell-St. Elias Root Glacier Nunatak",
        name="Wrangell-St. Elias Root Glacier Nunatak",
        site_id="wrangell-st-elias-root-glacier",
        region="Copper Center, Alaska",
        range="Wrangell Mountains",
        elevation_meters=1420,
        dominant_morphology=LichenMorphology.FOLIOSE_MACROLICHEN.value,
        substrate_type=SubstrateType.GLACIAL_TILL_GRAVEL.value,
        permafrost_status=PermafrostStatus.ALPINE_PERMAFROST_ISLANDS.value,
        description="Pioneer glacial till moraines and exposed rocky nunataks exhibiting umbilicate rock tripe (Umbilicaria hyperborea) on frost-shattered gravel.",
        highlights=[
            "Primary post-glacial pioneer crusts on lateral moraine deposits",
            "Umbilicaria hyperborea foliose rock tripe clusters",
            "Cryoturbated frost heave patterns and ice-cored gravel mounds",
        ],
    ),
    "beartooth-plateau-alpine-tundra": TundraLichenSite(
        id="beartooth-plateau-alpine-tundra",
        title="Beartooth Plateau Alpine Fellfield",
        name="Beartooth Plateau Alpine Fellfield",
        site_id="beartooth-plateau-alpine-tundra",
        region="Montana & Wyoming Border",
        range="Beartooth Mountains",
        elevation_meters=3320,
        dominant_morphology=LichenMorphology.CRUSTOSE_SAXICOLOUS.value,
        substrate_type=SubstrateType.GRANITIC_GNEISS_BOULDER.value,
        permafrost_status=PermafrostStatus.ALPINE_PERMAFROST_ISLANDS.value,
        description="Wind-scoured high alpine tundra fellfield with miniature crustose colonies enduring extreme ultraviolet exposure and cryic soils.",
        highlights=[
            "High-altitude alpine permafrost islands above 3,300m",
            "Wind-sheared crustose thallus mosaics on Precambrian granite",
            "Sub-zero cryptogamic crust refugia and cushion plant symbioses",
        ],
    ),
    "brooks-range-anaktuvuk-pass": TundraLichenSite(
        id="brooks-range-anaktuvuk-pass",
        title="Brooks Range Anaktuvuk Pass Tundra Basin",
        name="Brooks Range Anaktuvuk Pass Tundra Basin",
        site_id="brooks-range-anaktuvuk-pass",
        region="Gates of the Arctic, Alaska",
        range="Brooks Range",
        elevation_meters=670,
        dominant_morphology=LichenMorphology.SQUAMULOSE_SOIL_CRUST.value,
        substrate_type=SubstrateType.ACIDIC_PEAT_TUSSOCK.value,
        permafrost_status=PermafrostStatus.CONTINUOUS_PERMAFROST.value,
        description="Subarctic continuous permafrost polygonal ground dominated by squamulose biological soil crusts and sphagnum bryophyte hummocks.",
        highlights=[
            "Continuous Arctic permafrost polygonal patterned ground",
            "Squamulose peltigera and stereocaulon biological soil crusts",
            "Acidic peat tussock micro-drainage networks and cryogenic sorting",
        ],
    ),
}


DEFAULT_TUNDRA_GEAR: list[LichenGearItem] = [
    LichenGearItem(
        item_id="achromatic-field-loupe-20x",
        id="achromatic-field-loupe-20x",
        name="20x Achromatic Field Triplet Loupe",
        category="Optical Examination",
        mandatory=True,
        description="Color-corrected Hastings triplet lens with anti-reflective coating for resolving lichen apothecia and thallus structures.",
        purpose="Optical examination of reproductive structures and thallus surface anatomy.",
    ),
    LichenGearItem(
        item_id="chemical-spot-test-reagent-kit",
        id="chemical-spot-test-reagent-kit",
        name="Chemical Spot Test Reagent Kit (K, C, KC, PD)",
        category="Chemical Identification",
        mandatory=True,
        description="Dropper vials with potassium hydroxide (K), sodium hypochlorite (C), and p-phenylenediamine (PD) in sealed containers for secondary metabolite spot tests.",
        purpose="Reagent color spot tests for lichen secondary chemistry confirmation.",
    ),
    LichenGearItem(
        item_id="subarctic-specimen-chisels",
        id="subarctic-specimen-chisels",
        name="Cold-Steel Subarctic Specimen Cold Chisels",
        category="Specimen Collection",
        mandatory=True,
        description="Hardened vanadium steel chisels with protective grip shock shields designed for fracturing granitic and basaltic rock matrices.",
        purpose="Saxicolous rock matrix sampling without damaging fragile crustose thalli.",
    ),
    LichenGearItem(
        item_id="digital-lichenometry-caliper",
        id="digital-lichenometry-caliper",
        name="Precision Digital Lichenometry Caliper",
        category="Morphometrics",
        mandatory=True,
        description="IP67 waterproof stainless steel vernier caliper reading down to 0.01mm for measuring maximum thallus diameter.",
        purpose="Accurate radial thallus diameter measurements for lichenometric growth analysis.",
    ),
    LichenGearItem(
        item_id="breathable-specimen-herbarium-packets",
        id="breathable-specimen-herbarium-packets",
        name="Archival 100% Rag Herbarium Specimen Packets",
        category="Specimen Preservation",
        mandatory=True,
        description="Acid-free breathable paper envelopes preventing condensation, mold development, and premature lichen spore deterioration.",
        purpose="Voucher specimen preservation in dry field herbarium envelopes.",
    ),
    LichenGearItem(
        item_id="field-uv-fluorescence-torch",
        id="field-uv-fluorescence-torch",
        name="Longwave 365nm Field UV Fluorescence Torch",
        category="Secondary Metabolite Detection",
        mandatory=True,
        description="High-intensity ultraviolet lamp with Woods glass filter for detecting xanthones, alectoronic acid, and fluorescent lichen substances.",
        purpose="Field fluorometric visualization of secondary lichen chemical metabolites.",
    ),
]


def get_tundra_sites(morphology: Optional[str] = None) -> list[TundraLichenSite]:
    if not morphology:
        return list(DEFAULT_TUNDRA_SITES.values())
    norm = morphology.lower().strip()
    return [
        s
        for s in DEFAULT_TUNDRA_SITES.values()
        if s.dominant_morphology.lower() == norm
    ]


def get_tundra_site(site_id: str) -> Optional[TundraLichenSite]:
    return DEFAULT_TUNDRA_SITES.get(site_id)


def get_tundra_gear() -> list[LichenGearItem]:
    return list(DEFAULT_TUNDRA_GEAR)


def calculate_lichen_dynamics(query: LichenDynamicsQuery) -> LichenDynamicsResult:
    site = get_tundra_site(query.site_id)
    if not site:
        raise ValueError(f"Tundra lichen site '{query.site_id}' not found")

    site_title = site.title
    if query.annual_growth_rate_mm_yr <= 0:
        estimated_colony_age_years = 0
    else:
        estimated_colony_age_years = round(query.colony_diameter_mm / query.annual_growth_rate_mm_yr)

    # Air factor
    air_dep_str = str(query.air_deposition).lower()
    if (
        air_dep_str == AirQualityDeposition.PRISTINE_BASELINE.value
        or "pristine" in air_dep_str
    ):
        air_factor = 1.0
    elif (
        air_dep_str == AirQualityDeposition.MODERATE_DRIFT.value
        or "moderate" in air_dep_str
    ):
        air_factor = 0.75
    elif (
        air_dep_str == AirQualityDeposition.ELEVATED_ANTHROPOGENIC.value
        or "elevated" in air_dep_str
    ):
        air_factor = 0.5
    else:
        air_factor = 1.0

    uv_penalty = max(0.0, (query.uv_exposure_index - 5.0) * 0.04)
    snow_factor = 1.0 - abs(query.snow_cover_duration_months - 7.0) * 0.05

    bioindicator_health_index = min(
        0.99, max(0.15, round(air_factor * snow_factor - uv_penalty, 2))
    )
    desiccation_resilience_score = round(
        min(
            99.0,
            max(20.0, (bioindicator_health_index * 70.0) + (query.uv_exposure_index * 3.0)),
        ),
        1,
    )

    if (
        bioindicator_health_index < 0.5
        or query.air_deposition == AirQualityDeposition.ELEVATED_ANTHROPOGENIC.value
        or "elevated" in air_dep_str
    ):
        conservation_status = LichenConservationStatus.CRITICAL_CRYOTURBATION_DISTURBANCE.value
        lichenometry_advisory = (
            "CRITICAL CONSERVATION ALERT: Thallus degradation or elevated atmospheric deposition detected. "
            "Avoid physical contact and cease rock scraping. Establish permanent photo-quadrat monitoring "
            "to document cryoturbation or anthropogenic loss."
        )
    elif bioindicator_health_index < 0.75 or query.uv_exposure_index >= 8:
        conservation_status = LichenConservationStatus.VULNERABLE_MICROCLIMATE_SHIFT.value
        lichenometry_advisory = (
            "VULNERABLE MICROCLIMATE ADVISORY: Thallus exhibits stress indicators due to shifted snowpack "
            "duration or elevated UV radiation. Limit sampling to non-invasive caliper measurements and "
            "record thallus margin pigmentation."
        )
    else:
        conservation_status = LichenConservationStatus.OPTIMAL_PRISTINE_CLIMAX.value
        lichenometry_advisory = (
            "OPTIMAL CLIMAX CONDITIONS: Pristine subarctic tundra ecosystem. Thallus radial expansion is stable. "
            "Ideal baseline for lichenometric dating of glacial moraine deposits."
        )

    morph_str = str(query.morphology).lower()
    if (
        LichenMorphology.CRUSTOSE_SAXICOLOUS.value in morph_str
        or "crustose" in morph_str
    ):
        chemical_spot_test_protocol = (
            "Apply 10% KOH (K test) to thallus cortex: yellow turning red indicates norstictic or salazinic acid. "
            "Follow with sodium hypochlorite (C test) on medulla to test for gyrophoric acid."
        )
    elif (
        LichenMorphology.FOLIOSE_MACROLICHEN.value in morph_str
        or "foliose" in morph_str
    ):
        chemical_spot_test_protocol = (
            "Perform paraphenylenediamine (Pd test) on lower medullary scrapings under 20x loupe: "
            "intense orange-red reaction confirms fumarprotocetraric acid complex."
        )
    elif (
        LichenMorphology.FRUTICOSE_MACROLICHEN.value in morph_str
        or "fruticose" in morph_str
    ):
        chemical_spot_test_protocol = (
            "Conduct UV-A 365nm fluorescence screen: bright white-blue fluorescence confirms squamatic acid; "
            "follow with KC test (KOH followed immediately by sodium hypochlorite) for usnic acid."
        )
    elif (
        LichenMorphology.SQUAMULOSE_SOIL_CRUST.value in morph_str
        or "squamulose" in morph_str
    ):
        chemical_spot_test_protocol = (
            "Test cortical squamules with I (Lugol's iodine) solution for amyloid reaction in hymenium; "
            "verify calcium oxalate crystalline deposit presence."
        )
    else:
        chemical_spot_test_protocol = (
            "Standard secondary metabolite assay: Conduct sequential K, C, and Pd reagent spot testing "
            "on cortical slice; document instant chromogenic transitions under achromatic loupe."
        )

    return LichenDynamicsResult(
        site_title=site_title,
        site_id=site.id if site else query.site_id,
        estimated_colony_age_years=estimated_colony_age_years,
        bioindicator_health_index=bioindicator_health_index,
        desiccation_resilience_score=desiccation_resilience_score,
        conservation_status=conservation_status,
        lichenometry_advisory=lichenometry_advisory,
        chemical_spot_test_protocol=chemical_spot_test_protocol,
    )


def detect_tundra_lichen_intent(message: str) -> bool:
    if not message or not message.strip():
        return False

    q = message.lower().strip()

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
        "caving",
        "speleothem",
        "cave pearl",
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
    ]
    if any(ex in q for ex in exclusions):
        return False

    keywords = [
        "lichen",
        "lichenology",
        "bryophyte",
        "cladonia",
        "rhizocarpon",
        "saxicolous",
        "lichenometry",
        "thallus",
        "rock tripe",
        "reindeer lichen",
        "map lichen",
        "macrolichen",
        "microlichen",
        "apothecia",
        "umbilicaria",
        "cryoturbation",
        "crustose",
        "foliose",
        "fruticose",
        "squamulose",
        "peltigera",
        "bioindicator health",
        "desiccation resilience",
    ]
    if any(k in q for k in keywords):
        return True

    site_matches = [
        "polychrome pass",
        "torngat",
        "root glacier",
        "beartooth",
        "anaktuvuk",
        "denali-polychrome-pass",
        "torngat-mountains-fjords",
        "wrangell-st-elias-root-glacier",
        "beartooth-plateau-alpine-tundra",
        "brooks-range-anaktuvuk-pass",
    ]
    if any(sm in q for sm in site_matches):
        return True

    return False


def extract_tundra_lichen_intent(message: str) -> TundraLichenIntent:
    q = message.lower().strip()

    matched_site_id: Optional[str] = None
    if "polychrome" in q or "denali" in q:
        matched_site_id = "denali-polychrome-pass"
    elif "torngat" in q:
        matched_site_id = "torngat-mountains-fjords"
    elif "root glacier" in q or "wrangell" in q:
        matched_site_id = "wrangell-st-elias-root-glacier"
    elif "beartooth" in q:
        matched_site_id = "beartooth-plateau-alpine-tundra"
    elif "anaktuvuk" in q or "brooks range" in q:
        matched_site_id = "brooks-range-anaktuvuk-pass"
    else:
        for s_id in DEFAULT_TUNDRA_SITES:
            if s_id in q:
                matched_site_id = s_id
                break

    morphology: Optional[str] = None
    if "crustose" in q:
        morphology = LichenMorphology.CRUSTOSE_SAXICOLOUS.value
    elif "foliose" in q or "rock tripe" in q:
        morphology = LichenMorphology.FOLIOSE_MACROLICHEN.value
    elif "fruticose" in q or "caribou moss" in q:
        morphology = LichenMorphology.FRUTICOSE_MACROLICHEN.value
    elif "squamulose" in q or "soil crust" in q:
        morphology = LichenMorphology.SQUAMULOSE_SOIL_CRUST.value
    elif matched_site_id and matched_site_id in DEFAULT_TUNDRA_SITES:
        morphology = DEFAULT_TUNDRA_SITES[matched_site_id].dominant_morphology

    calc_keywords = [
        "calculate",
        "calculation",
        "dynamics",
        "growth rate",
        "colony age",
        "diameter",
        "lichenometry",
        "bioindicator",
        "health index",
        "resilience",
        "spot test",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "kit",
        "loupe",
        "chisel",
        "caliper",
        "reagent",
        "herbarium",
        "torch",
        "packets",
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
            "permafrost",
        ]
    ):
        action = "get_site"
    elif matched_site_id and not any(
        k in q for k in ["sites", "catalog", "list", "options", "all"]
    ):
        action = "get_site"
    else:
        action = "catalog"

    return TundraLichenIntent(
        action=action,
        site_id=matched_site_id,
        query=message,
        morphology=morphology,
    )


def format_tundra_lichen_response(
    action: Union[TundraLichenIntent, str],
    message: Any = None,
) -> FormattedTundraLichenResponse:
    if isinstance(message, dict) and "tundra_lichen_info" in message:
        answer = str(
            message.get(
                "answer",
                "Wilderness Subarctic Tundra Lichenology & Saxicolous Bryophyte Ecology guidance",
            )
        )
        return FormattedTundraLichenResponse(answer, message)

    intent_obj: TundraLichenIntent
    if isinstance(action, TundraLichenIntent):
        intent_obj = action
    elif isinstance(action, str):
        if action == "tundra_lichen" and isinstance(message, str):
            intent_obj = extract_tundra_lichen_intent(message)
        elif action in ("calculate", "calculate_dynamics"):
            intent_obj = TundraLichenIntent(action="calculate")
        elif action in ("gear", "gear_checklist"):
            intent_obj = TundraLichenIntent(action="gear_checklist")
        elif action in ("get_site", "site_detail", "detail"):
            site_id = (
                message
                if isinstance(message, str) and message in DEFAULT_TUNDRA_SITES
                else None
            )
            intent_obj = TundraLichenIntent(action="get_site", site_id=site_id)
        else:
            intent_obj = TundraLichenIntent(action="catalog")
    else:
        intent_obj = TundraLichenIntent(action="catalog")

    resolved_action = intent_obj.action

    if resolved_action == "calculate":
        if isinstance(message, LichenDynamicsResult):
            calc_res = message
        elif isinstance(message, LichenDynamicsQuery):
            calc_res = calculate_lichen_dynamics(message)
        else:
            calc_q = LichenDynamicsQuery(
                site_id=intent_obj.site_id or "denali-polychrome-pass"
            )
            calc_res = calculate_lichen_dynamics(calc_q)

        answer = (
            f"Tundra Lichen Dynamics for {calc_res.site_title}: "
            f"Estimated Colony Age: {calc_res.estimated_colony_age_years} years. "
            f"Bioindicator Health Index: {calc_res.bioindicator_health_index}. "
            f"Desiccation Resilience Score: {calc_res.desiccation_resilience_score}. "
            f"Conservation Status: {calc_res.conservation_status.upper()}. "
            f"{calc_res.lichenometry_advisory} Chemical Protocol: {calc_res.chemical_spot_test_protocol}"
        )
        calc_info: dict[str, Any] = {
            "tundra_lichen_info": {
                "action": "calculate",
                "site_id": calc_res.site_id,
                "calculation": calc_res.model_dump(),
                "estimated_colony_age_years": calc_res.estimated_colony_age_years,
                "bioindicator_health_index": calc_res.bioindicator_health_index,
                "desiccation_resilience_score": calc_res.desiccation_resilience_score,
                "conservation_status": calc_res.conservation_status,
                "lichenometry_advisory": calc_res.lichenometry_advisory,
                "chemical_spot_test_protocol": calc_res.chemical_spot_test_protocol,
            },
            "answer": answer,
        }
        return FormattedTundraLichenResponse(answer, calc_info)

    if resolved_action == "gear_checklist":
        checklist = message if isinstance(message, list) else get_tundra_gear()
        items_str = "; ".join(f"{g.name} ({g.description})" for g in checklist)
        answer = (
            f"Mandatory Wilderness Subarctic Tundra Lichenology Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Field loupes, chemical spot kits, specimen chisels, digital calipers, "
            f"breathable herbarium packets, and UV torches are essential for subarctic lichenometry research."
        )
        gear_info: dict[str, Any] = {
            "tundra_lichen_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedTundraLichenResponse(answer, gear_info)

    if resolved_action == "get_site":
        site = None
        if intent_obj.site_id:
            site = get_tundra_site(intent_obj.site_id)
        if not site and isinstance(message, TundraLichenSite):
            site = message
        if not site and isinstance(message, str):
            site = get_tundra_site(message)
        if not site:
            site = get_tundra_site("denali-polychrome-pass")

        if site:
            highlights_str = ", ".join(site.highlights)
            answer = (
                f"Tundra Lichen Site: {site.title} ({site.range}, {site.region}). "
                f"Elevation: {site.elevation_meters}m | Dominant Morphology: {site.dominant_morphology} | "
                f"Substrate: {site.substrate_type} | Permafrost: {site.permafrost_status}. "
                f"{site.description} Key Highlights: {highlights_str}."
            )
            site_info: dict[str, Any] = {
                "tundra_lichen_info": {
                    "action": "get_site",
                    "site_id": site.id,
                    "site": site.model_dump(),
                },
                "answer": answer,
            }
            return FormattedTundraLichenResponse(answer, site_info)

    sites = (
        message
        if isinstance(message, list)
        else get_tundra_sites(morphology=intent_obj.morphology)
    )
    summary_str = "; ".join(
        f"{s.title} ({s.region}, {s.elevation_meters}m, morphology: {s.dominant_morphology})"
        for s in sites
    )
    answer = (
        f"Contoso Wilderness Subarctic Tundra Lichenology Catalog ({len(sites)} sites): {summary_str}. "
        "Inquire about specific tundra lichen sites, radial growth rate calculations, or mandatory field research gear."
    )
    catalog_info: dict[str, Any] = {
        "tundra_lichen_info": {
            "action": "catalog",
            "morphology": intent_obj.morphology,
            "sites": [s.model_dump() for s in sites],
        },
        "answer": answer,
    }
    return FormattedTundraLichenResponse(answer, catalog_info)


def build_tundra_lichen_prompt(message: Any = None) -> str:
    lines = [
        "Wilderness Subarctic Tundra Lichenology & Saxicolous Bryophyte Ecology Guidance:",
        "- Lichenometry & Growth Dynamics: Subarctic and alpine saxicolous lichens (e.g. Rhizocarpon geographicum) exhibit slow radial growth (~0.3-0.5 mm/year), serving as living chronometers for glacial retreat and permafrost moraine stabilization.",
        "- Cryptogamic Bioindicators: Lichens lack root systems and waxy cuticles, absorbing atmospheric nutrients and moisture directly. Consequently, bioindicator health index tracks atmospheric nitrogen/sulfur deposition, snow cover insulation, and high-altitude UV radiation.",
        "- Chemical Secondary Metabolites: Spot tests (K: 10% KOH, C: sodium hypochlorite, Pd: paraphenylenediamine) and UV-A (365nm) fluorescence confirm cortical and medullary secondary metabolites including norstictic, usnic, and gyrophoric acids.",
        "- Mandatory Field Research Kit: 20x achromatic triplet loupe, chemical spot test reagent dropper vials, cold-steel rock chisels, IP67 digital lichenometry caliper, acid-free herbarium packets, and 365nm UV torch.",
    ]
    site_id = None
    if isinstance(message, TundraLichenIntent) and message.site_id:
        site_id = message.site_id
    elif isinstance(message, str):
        detected = detect_tundra_lichen_intent(message)
        if detected:
            intent_obj = extract_tundra_lichen_intent(message)
            if intent_obj and intent_obj.site_id:
                site_id = intent_obj.site_id

    if site_id:
        s = get_tundra_site(site_id)
        if s:
            lines.append(
                f"- Focused Tundra Site: {s.title} ({s.region}, Range: {s.range}, Elevation: {s.elevation_meters}m, Morphology: {s.dominant_morphology}, Substrate: {s.substrate_type}, Permafrost: {s.permafrost_status})"
            )
    return "\n".join(lines)


def tundra_lichen_tool(
    query: Optional[LichenDynamicsQuery] = None,
    action: Optional[str] = None,
    site_id: Optional[str] = None,
    morphology: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_dynamics") or query is not None:
        calc_q = query or LichenDynamicsQuery(
            site_id=site_id or "denali-polychrome-pass"
        )
        res = calculate_lichen_dynamics(calc_q)
        formatted = format_tundra_lichen_response("calculate", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_tundra_gear()
        formatted = format_tundra_lichen_response("gear_checklist", checklist)
        return dict(formatted._data)

    if action in ("get_site", "site_detail", "detail") and site_id:
        site = get_tundra_site(site_id)
        if site:
            formatted = format_tundra_lichen_response("get_site", site)
            return dict(formatted._data)

    sites = get_tundra_sites(morphology=morphology)
    formatted = format_tundra_lichen_response("catalog", sites)
    return dict(formatted._data)
