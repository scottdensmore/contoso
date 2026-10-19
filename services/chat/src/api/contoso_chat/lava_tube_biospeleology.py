from enum import Enum
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator


class LavaTubeEcologicalZone(str, Enum):
    SKYLIGHT_ENTRANCE_ECOTONE = "skylight_entrance_ecotone"
    TWILIGHT_MOSS_THRESHOLD = "twilight_moss_threshold"
    TRANSITION_VARIABLE_MICROCLIMATE = "transition_variable_microclimate"
    DEEP_DARK_STAGNANT_SATURATION = "deep_dark_stagnant_saturation"
    SUBTERRANEAN_ROOT_CURTAIN_GALLERY = "subterranean_root_curtain_gallery"


class VolcanicSubstrateFeature(str, Enum):
    AA_CLINKER_RUBBLE_FLOOR = "aa_clinker_rubble_floor"
    PAHOEHOE_ROPY_BENCH_LEDGES = "pahoehoe_ropy_bench_ledges"
    LAVACICLE_CEILING_STALACTITES = "lavacicle_ceiling_stalactites"
    ACTINOBACTERIAL_GOLDEN_SLIME_WALL = "actinobacterial_golden_slime_wall"
    EPHEMERAL_PERCHED_WATER_DRIP_POOL = "ephemeral_perched_water_drip_pool"


class TroglomorphicAdaptationClass(str, Enum):
    OBLIGATE_EYELESS_TROGLOBITE = "obligate_eyeless_troglobite"
    FACULTATIVE_ROOT_FEEDING_TROGLOPHILE = "facultative_root_feeding_troglophile"
    TROGLOXENE_ROOSTING_COMMENSAL = "trogloxene_roosting_commensal"
    CHEMOLITHOAUTOTROPHIC_MICROBIAL_MAT = "chemolithoautotrophic_microbial_mat"


class BiospeleologyConservationStatus(str, Enum):
    PRISTINE_ENDEMIC_REFUGIUM = "pristine_endemic_refugium"
    VULNERABLE_MICROCLIMATE_DESICCATION = "vulnerable_microclimate_desiccation"
    CRITICAL_ANTHROPOGENIC_BIOCONTAMINATION = "critical_anthropogenic_biocontamination"


class LavaTubeBiospeleologySite(BaseModel):
    id: str
    title: str = ""
    name: str = ""
    site_id: str = ""
    region: str = ""
    range: str = ""
    elevation_meters: int = 0
    dominant_zone: str = LavaTubeEcologicalZone.SUBTERRANEAN_ROOT_CURTAIN_GALLERY.value
    primary_substrate: str = VolcanicSubstrateFeature.PAHOEHOE_ROPY_BENCH_LEDGES.value
    dominant_adaptation: str = TroglomorphicAdaptationClass.OBLIGATE_EYELESS_TROGLOBITE.value
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
                "dominantZone": "dominant_zone",
                "primarySubstrate": "primary_substrate",
                "dominantAdaptation": "dominant_adaptation",
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
    def dominantZone(self) -> str:
        return self.dominant_zone

    @property
    def primarySubstrate(self) -> str:
        return self.primary_substrate

    @property
    def dominantAdaptation(self) -> str:
        return self.dominant_adaptation


class LavaTubeBiospeleologyQuery(BaseModel):
    site_id: str = "kazumura-cave-kilauea-root-galleries"
    ecological_zone: str = LavaTubeEcologicalZone.SUBTERRANEAN_ROOT_CURTAIN_GALLERY.value
    substrate_feature: str = VolcanicSubstrateFeature.PAHOEHOE_ROPY_BENCH_LEDGES.value
    relative_humidity_percent: float = 98.5
    distance_from_skylight_meters: float = 350.0
    ceiling_root_density_per_m2: float = 42.0
    ambient_co2_ppm: float = 650.0

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "site_id",
                "ecologicalZone": "ecological_zone",
                "dominantZone": "ecological_zone",
                "dominant_zone": "ecological_zone",
                "substrateFeature": "substrate_feature",
                "primarySubstrate": "substrate_feature",
                "primary_substrate": "substrate_feature",
                "relativeHumidityPercent": "relative_humidity_percent",
                "distanceFromSkylightMeters": "distance_from_skylight_meters",
                "ceilingRootDensityPerM2": "ceiling_root_density_per_m2",
                "ambientCo2Ppm": "ambient_co2_ppm",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def siteId(self) -> str:
        return self.site_id

    @property
    def ecologicalZone(self) -> str:
        return self.ecological_zone

    @property
    def substrateFeature(self) -> str:
        return self.substrate_feature

    @property
    def relativeHumidityPercent(self) -> float:
        return self.relative_humidity_percent

    @property
    def distanceFromSkylightMeters(self) -> float:
        return self.distance_from_skylight_meters

    @property
    def ceilingRootDensityPerM2(self) -> float:
        return self.ceiling_root_density_per_m2

    @property
    def ambientCo2Ppm(self) -> float:
        return self.ambient_co2_ppm


class LavaTubeBiospeleologyResult(BaseModel):
    site_title: str
    site_id: Optional[str] = None
    troglobite_endemism_index: float
    root_exudate_trophic_capacity_mg_c_m2_day: float
    vapor_pressure_deficit_stress_kpa: float
    microbial_mat_integrity_percent: float
    conservation_status: str
    non_contact_traversal_protocol: str
    biocontamination_decon_advisory: str

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteTitle": "site_title",
                "siteId": "site_id",
                "troglobiteEndemismIndex": "troglobite_endemism_index",
                "rootExudateTrophicCapacityMgCM2Day": "root_exudate_trophic_capacity_mg_c_m2_day",
                "vaporPressureDeficitStressKpa": "vapor_pressure_deficit_stress_kpa",
                "microbialMatIntegrityPercent": "microbial_mat_integrity_percent",
                "conservationStatus": "conservation_status",
                "nonContactTraversalProtocol": "non_contact_traversal_protocol",
                "biocontaminationDeconAdvisory": "biocontamination_decon_advisory",
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
    def troglobiteEndemismIndex(self) -> float:
        return self.troglobite_endemism_index

    @property
    def rootExudateTrophicCapacityMgCM2Day(self) -> float:
        return self.root_exudate_trophic_capacity_mg_c_m2_day

    @property
    def vaporPressureDeficitStressKpa(self) -> float:
        return self.vapor_pressure_deficit_stress_kpa

    @property
    def microbialMatIntegrityPercent(self) -> float:
        return self.microbial_mat_integrity_percent

    @property
    def conservationStatus(self) -> str:
        return self.conservation_status

    @property
    def nonContactTraversalProtocol(self) -> str:
        return self.non_contact_traversal_protocol

    @property
    def biocontaminationDeconAdvisory(self) -> str:
        return self.biocontamination_decon_advisory


class LavaTubeBiospeleologyGearItem(BaseModel):
    id: str = ""
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
        return self.id or self.item_id


class LavaTubeBiospeleologyIntent(BaseModel):
    action: Literal["catalog", "get_site", "calculate", "gear_checklist"] = "catalog"
    site_id: Optional[str] = None
    query: Optional[str] = None
    ecological_zone: Optional[str] = None


class FormattedLavaTubeBiospeleologyResponse(str):
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


DEFAULT_LAVA_TUBE_BIOSPELEOLOGY_SITES: dict[str, LavaTubeBiospeleologySite] = {
    "kazumura-cave-kilauea-root-galleries": LavaTubeBiospeleologySite(
        id="kazumura-cave-kilauea-root-galleries",
        title="Kazumura Cave Kilauea Root Curtain Galleries",
        name="Kazumura Cave Kilauea Root Curtain Galleries",
        site_id="kazumura-cave-kilauea-root-galleries",
        region="Puna District, Hawaii Island",
        range="Kilauea East Rift Zone",
        elevation_meters=420,
        dominant_zone=LavaTubeEcologicalZone.SUBTERRANEAN_ROOT_CURTAIN_GALLERY.value,
        primary_substrate=VolcanicSubstrateFeature.PAHOEHOE_ROPY_BENCH_LEDGES.value,
        dominant_adaptation=TroglomorphicAdaptationClass.OBLIGATE_EYELESS_TROGLOBITE.value,
        description="The world's longest and deepest surveyed basaltic lava tube system, featuring dense hanging Metrosideros polymorpha ('ohi'a lehua) root curtains supporting endemic blind cave planthoppers and spiders.",
        highlights=[
            "Dense Metrosideros polymorpha subterranean root curtain trophic webs",
            "Endemic obligate eyeless Oliarus polyphemus cave planthoppers and Adelocosa anops wolf spiders",
            "Multi-level pahoehoe ropy bench ledges and intact lava falls",
        ],
    ),
    "ape-cave-mount-st-helens-basalt": LavaTubeBiospeleologySite(
        id="ape-cave-mount-st-helens-basalt",
        title="Ape Cave Mount St. Helens Basalt Conduit",
        name="Ape Cave Mount St. Helens Basalt Conduit",
        site_id="ape-cave-mount-st-helens-basalt",
        region="Gifford Pinchot National Forest, Washington",
        range="Cascade Volcanic Arc",
        elevation_meters=610,
        dominant_zone=LavaTubeEcologicalZone.TRANSITION_VARIABLE_MICROCLIMATE.value,
        primary_substrate=VolcanicSubstrateFeature.ACTINOBACTERIAL_GOLDEN_SLIME_WALL.value,
        dominant_adaptation=TroglomorphicAdaptationClass.CHEMOLITHOAUTOTROPHIC_MICROBIAL_MAT.value,
        description="Subalpine basalt lava tube on the southern flank of Mount St. Helens hosting extensive hydrophobic actinobacterial 'lava tube gold' microbial mats and cold-adapted Grylloblatta ice crawlers.",
        highlights=[
            "Reflective hydrophobic actinobacterial golden slime wall colonies ('lava tube gold')",
            "Psychrophilic Grylloblatta chirurgica rock crawlers and troglophilic collembola",
            "3.9 km continuous basaltic tube with lava ball wedged blocks and lateral benches",
        ],
    ),
    "undara-volcanic-lava-tubes": LavaTubeBiospeleologySite(
        id="undara-volcanic-lava-tubes",
        title="Undara Cenozoic Basalt Lava Tube System",
        name="Undara Cenozoic Basalt Lava Tube System",
        site_id="undara-volcanic-lava-tubes",
        region="Far North Queensland, Australia",
        range="McBride Volcanic Province",
        elevation_meters=780,
        dominant_zone=LavaTubeEcologicalZone.TWILIGHT_MOSS_THRESHOLD.value,
        primary_substrate=VolcanicSubstrateFeature.AA_CLINKER_RUBBLE_FLOOR.value,
        dominant_adaptation=TroglomorphicAdaptationClass.TROGLOXENE_ROOSTING_COMMENSAL.value,
        description="Ancient Cenozoic shield volcano lava tubes punctuated by collapsed skylight roof vine thickets that channel seasonal monsoon moisture and sustain guano-dependent invertebrate communities.",
        highlights=[
            "Collapsed skylight entrance ecotones supporting dry rainforest vine roots",
            "High-diversity trogloxene microbat roosts and guano-associated arthropod guilds",
            "Stagnant CO2 pooling sumps in deep terminal lava tube segments",
        ],
    ),
    "manjanggul-jeju-volcanic-tube": LavaTubeBiospeleologySite(
        id="manjanggul-jeju-volcanic-tube",
        title="Manjanggul Geomunoreum Basalt Lava Tube",
        name="Manjanggul Geomunoreum Basalt Lava Tube",
        site_id="manjanggul-jeju-volcanic-tube",
        region="Jeju Island, South Korea",
        range="Hallasan Shield Volcanic Complex",
        elevation_meters=145,
        dominant_zone=LavaTubeEcologicalZone.DEEP_DARK_STAGNANT_SATURATION.value,
        primary_substrate=VolcanicSubstrateFeature.LAVACICLE_CEILING_STALACTITES.value,
        dominant_adaptation=TroglomorphicAdaptationClass.FACULTATIVE_ROOT_FEEDING_TROGLOPHILE.value,
        description="Monumental multi-tiered basaltic tunnel within the Geomunoreum lava tube system featuring a 7.6-meter lava column, delicate ceiling lavacicles, and endemic Jeju cave spiders.",
        highlights=[
            "Dense ceiling lavacicle stalactites and multi-story basalt flow ledges",
            "Endemic Nesticella quelpartensis cave spiders and troglobitic pseudoscorpions",
            "High-humidity deep dark saturation zone with pristine silica-iron wall glazes",
        ],
    ),
    "cueva-de-los-verdes-lanzarote": LavaTubeBiospeleologySite(
        id="cueva-de-los-verdes-lanzarote",
        title="Cueva de los Verdes Monte Corona Lava Tube",
        name="Cueva de los Verdes Monte Corona Lava Tube",
        site_id="cueva-de-los-verdes-lanzarote",
        region="Lanzarote, Canary Islands",
        range="Monte Corona Volcanic Malpais",
        elevation_meters=85,
        dominant_zone=LavaTubeEcologicalZone.DEEP_DARK_STAGNANT_SATURATION.value,
        primary_substrate=VolcanicSubstrateFeature.EPHEMERAL_PERCHED_WATER_DRIP_POOL.value,
        dominant_adaptation=TroglomorphicAdaptationClass.OBLIGATE_EYELESS_TROGLOBITE.value,
        description="Subterranean and anchialine-connected volcanic tube extending from Monte Corona through dry malpais basalt into coastal percolation zones inhabited by blind Munidopsis squat lobsters and stygobionts.",
        highlights=[
            "Isolated perched water drip pools and anchialine marine transition galleries",
            "Iconic blind albino Munidopsis polymorpha crustacean and endemic troglobites",
            "Multi-level stacked volcanic conduits with zero-light stagnant saturation microclimates",
        ],
    ),
}


DEFAULT_LAVA_TUBE_BIOSPELEOLOGY_GEAR: list[LavaTubeBiospeleologyGearItem] = [
    LavaTubeBiospeleologyGearItem(
        id="en12492-low-profile-basalt-caving-helmet",
        item_id="en12492-low-profile-basalt-caving-helmet",
        name="EN 12492 Low-Profile Basalt Caving Helmet",
        category="Cranial Protection",
        mandatory=True,
        description="Low-clearance impact shell engineered to protect against sharp ceiling lavacicles while preventing accidental contact with hanging root curtains.",
        purpose="Protects caver cranium and fragile ceiling lavacicle formations in low-clearance volcanic conduits.",
    ),
    LavaTubeBiospeleologyGearItem(
        id="red-spectrum-low-lux-biosurvey-headlamp",
        item_id="red-spectrum-low-lux-biosurvey-headlamp",
        name="Red-Spectrum Low-Lux Biosurvey Headlamp (630nm)",
        category="Non-Invasive Illumination",
        mandatory=True,
        description="Regulated 630nm deep-red and low-lux warm LED headlamp designed to observe photophobic eyeless troglobites without inducing thermal or photic shock.",
        purpose="Prevents photic stress in obligate troglobites and inhibits photosynthetic lampenflora proliferation.",
    ),
    LavaTubeBiospeleologyGearItem(
        id="neoprene-kevlar-aa-basalt-knee-elbow-pads",
        item_id="neoprene-kevlar-aa-basalt-knee-elbow-pads",
        name="Neoprene-Kevlar A'a Basalt Knee & Elbow Pads",
        category="Abrasion & Non-Contact Mobility",
        mandatory=True,
        description="Cut-resistant Kevlar-faced articulation pads that allow controlled tripod crawling across razor-sharp a'a clinker floors without touching slime walls.",
        purpose="Enables stable low-crawl traversal over jagged basalt clinker without wall bracing on microbial mats.",
    ),
    LavaTubeBiospeleologyGearItem(
        id="quaternary-ammonium-boot-decon-kit",
        item_id="quaternary-ammonium-boot-decon-kit",
        name="Quaternary Ammonium Boot & Gear Decontamination Kit",
        category="Biosecurity & Conservation",
        mandatory=True,
        description="Portable scrubbing basin and biodegradable quaternary ammonium disinfectant spray for removing exotic soil fungi, seeds, and Ceratocystis ('ohi'a wilt) spores.",
        purpose="Prevents anthropogenic introduction of Rapid 'Ohi'a Death pathogens and invasive surface microbes into root galleries.",
    ),
    LavaTubeBiospeleologyGearItem(
        id="macro-15x-illuminated-entomological-loupe",
        item_id="macro-15x-illuminated-entomological-loupe",
        name="15x Achromatic Macro Illuminated Entomological Loupe",
        category="In-Situ Taxonomy",
        mandatory=True,
        description="Triplet achromatic glass hand lens with diffused ring illumination for non-destructive in-situ identification of reduced-eye troglomorphic arthropods.",
        purpose="Allows taxonomic verification of troglobitic planthoppers, collembola, and pseudoscorpions without specimen removal.",
    ),
    LavaTubeBiospeleologyGearItem(
        id="nondestructive-aspirator-pooter-vial-set",
        item_id="nondestructive-aspirator-pooter-vial-set",
        name="Non-Destructive HEPA-Filtered Entomological Aspirator (Pooter) & Borosilicate Vial Set",
        category="Biological Sampling",
        mandatory=True,
        description="Low-suction silikon-tubed entomological pooter with inline HEPA mesh filter and cushioned borosilicate observation vials for zero-trauma micro-fauna capture and release.",
        purpose="Enables gentle temporary capture of delicate unsclerotized cave arthropods without mechanical crushing.",
    ),
]


def get_lava_tube_biospeleology_sites(
    zone: Optional[str] = None,
) -> list[LavaTubeBiospeleologySite]:
    all_sites = list(DEFAULT_LAVA_TUBE_BIOSPELEOLOGY_SITES.values())
    if not zone:
        return all_sites
    norm = zone.strip().lower()
    return [s for s in all_sites if s.dominant_zone.lower() == norm]


def get_lava_tube_biospeleology_site(site_id: str) -> Optional[LavaTubeBiospeleologySite]:
    return DEFAULT_LAVA_TUBE_BIOSPELEOLOGY_SITES.get(site_id.strip().lower())


def get_lava_tube_biospeleology_gear() -> list[LavaTubeBiospeleologyGearItem]:
    return list(DEFAULT_LAVA_TUBE_BIOSPELEOLOGY_GEAR)


def calculate_lava_tube_biospeleology_dynamics(
    query: LavaTubeBiospeleologyQuery,
) -> LavaTubeBiospeleologyResult:
    site = get_lava_tube_biospeleology_site(query.site_id)
    if not site:
        raise ValueError(f"Lava tube biospeleology site '{query.site_id}' not found")

    site_title = site.title

    # Vapor Pressure Deficit (VPD) stress in kPa (at ~15°C reference cave temp, Esat ~ 1.705 kPa)
    rh = max(10.0, min(100.0, query.relative_humidity_percent))
    vapor_pressure_deficit_stress_kpa = round(1.705 * (1.0 - rh / 100.0), 3)

    # Root exudate trophic capacity (mg C / m2 / day)
    zone_val = str(query.ecological_zone).lower()
    zone_mult = 1.0
    if LavaTubeEcologicalZone.SUBTERRANEAN_ROOT_CURTAIN_GALLERY.value in zone_val:
        zone_mult = 1.35
    elif LavaTubeEcologicalZone.DEEP_DARK_STAGNANT_SATURATION.value in zone_val:
        zone_mult = 1.15
    elif LavaTubeEcologicalZone.SKYLIGHT_ENTRANCE_ECOTONE.value in zone_val:
        zone_mult = 0.75

    humidity_factor = max(0.2, (rh - 50.0) / 50.0)
    root_exudate_trophic_capacity_mg_c_m2_day = round(
        query.ceiling_root_density_per_m2 * 2.65 * humidity_factor * zone_mult,
        1,
    )

    # Troglobite endemism index (0.05 to 0.99)
    depth_score = min(0.45, (query.distance_from_skylight_meters / 400.0) * 0.45)
    humidity_score = max(0.0, ((rh - 70.0) / 30.0) * 0.35)
    root_score = min(0.20, (query.ceiling_root_density_per_m2 / 50.0) * 0.20)
    troglobite_endemism_index = round(
        min(0.99, max(0.08, depth_score + humidity_score + root_score)),
        2,
    )

    # Microbial mat integrity percent
    co2_penalty = max(0.0, (query.ambient_co2_ppm - 600.0) / 60.0)
    desiccation_penalty = vapor_pressure_deficit_stress_kpa * 55.0
    substrate_val = str(query.substrate_feature).lower()
    substrate_bonus = (
        4.0
        if VolcanicSubstrateFeature.ACTINOBACTERIAL_GOLDEN_SLIME_WALL.value in substrate_val
        or VolcanicSubstrateFeature.PAHOEHOE_ROPY_BENCH_LEDGES.value in substrate_val
        else 0.0
    )
    microbial_mat_integrity_percent = round(
        max(15.0, min(99.5, 98.0 - co2_penalty - desiccation_penalty + substrate_bonus)),
        1,
    )

    # Conservation status classification
    if rh < 78.0 or query.ambient_co2_ppm >= 1800.0 or microbial_mat_integrity_percent < 70.0:
        conservation_status = (
            BiospeleologyConservationStatus.CRITICAL_ANTHROPOGENIC_BIOCONTAMINATION.value
        )
        non_contact_traversal_protocol = (
            "CRITICAL BIOCONTAMINATION LOCKDOWN: Suspend off-trail survey immediately. "
            "Elevated anthropogenic CO2 and desiccation stress threaten actinobacterial mats and unsclerotized troglobites. "
            "Retreat single-file along established central floor flagging with zero wall or root contact."
        )
        biocontamination_decon_advisory = (
            "MANDATORY QUATERNARY AMMONIUM DECON: Perform full boot immersion and oversuit scrub with 2% quaternary ammonium "
            "solution before and after egress to halt Ceratocystis ('ohi'a wilt) and surface mold proliferation."
        )
    elif rh < 92.0 or vapor_pressure_deficit_stress_kpa > 0.15 or query.ambient_co2_ppm >= 1000.0:
        conservation_status = (
            BiospeleologyConservationStatus.VULNERABLE_MICROCLIMATE_DESICCATION.value
        )
        non_contact_traversal_protocol = (
            "VULNERABLE MICROCLIMATE PROTOCOL: Maintain minimum 50cm clearance from hanging Metrosideros root curtains "
            "and pahoehoe bench ledges. Limit party stationary dwell time to prevent localized body-heat convection desiccation."
        )
        biocontamination_decon_advisory = (
            "ENHANCED BIOSECURITY: Brush all basalt clinker sediment from lug soles and mist footwear with quaternary ammonium "
            "disinfectant at the skylight threshold."
        )
    else:
        conservation_status = BiospeleologyConservationStatus.PRISTINE_ENDEMIC_REFUGIUM.value
        non_contact_traversal_protocol = (
            "PRISTINE REFUGIUM NON-CONTACT PROTOCOL: Traverse strictly along the central pahoehoe thalweg using low-lux 630nm red "
            "illumination. Never touch actinobacterial 'lava tube gold' slime walls or disturb ceiling root curtain droplets."
        )
        biocontamination_decon_advisory = (
            "STANDARD BIOSPELEOLOGY DECON: Verify clean dedicated cave footwear treated with quaternary ammonium wash "
            "and lint-free knee/elbow protection prior to entering deep saturation galleries."
        )

    return LavaTubeBiospeleologyResult(
        site_title=site_title,
        site_id=site.id,
        troglobite_endemism_index=troglobite_endemism_index,
        root_exudate_trophic_capacity_mg_c_m2_day=root_exudate_trophic_capacity_mg_c_m2_day,
        vapor_pressure_deficit_stress_kpa=vapor_pressure_deficit_stress_kpa,
        microbial_mat_integrity_percent=microbial_mat_integrity_percent,
        conservation_status=conservation_status,
        non_contact_traversal_protocol=non_contact_traversal_protocol,
        biocontamination_decon_advisory=biocontamination_decon_advisory,
    )


def detect_lava_tube_biospeleology_intent(message: str) -> bool:
    if not message or not message.strip():
        return False

    q = message.lower().strip()

    lava_tube_keywords = [
        "lava tube",
        "biospeleology",
        "troglomorphic",
        "troglobite",
        "troglobitic",
        "troglophile",
        "trogloxene",
        "kazumura",
        "lavacicle",
        "pahoehoe bench",
        "pahoehoe",
        "actinobacterial",
        "lava tube gold",
        "root curtain",
        "ape cave",
        "undara",
        "manjanggul",
        "cueva de los verdes",
        "oliarus",
        "munidopsis",
        "pooter",
        "entomological aspirator",
    ]

    site_matches = [
        "kazumura-cave-kilauea-root-galleries",
        "ape-cave-mount-st-helens-basalt",
        "undara-volcanic-lava-tubes",
        "manjanggul-jeju-volcanic-tube",
        "cueva-de-los-verdes-lanzarote",
    ]

    is_explicit_lava_tube = any(k in q for k in lava_tube_keywords) or any(
        sm in q for sm in site_matches
    )

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
        "cryokarst",
        "moulin",
        "ice cave",
        "subglacial",
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
        "pulk",
        "crevasse pulk",
        "pothole",
        "pot-hole",
        "tundra lichen",
        "glacier ski",
        "solfatara",
        "fumarole",
        "mofette",
        "geyserite",
        "sinter crust",
        "mudpot",
        "h2s",
        "hydrogen sulfide",
        "sulfur dioxide",
    ]

    if not is_explicit_lava_tube:
        if any(ex in q for ex in exclusions):
            return False
        return False

    ecommerce_exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "rentals",
        "rental",
        "solfatara",
        "fumarole",
        "mofette",
        "geyserite",
        "sinter crust",
        "mudpot",
        "h2s",
        "hydrogen sulfide",
        "sulfur dioxide",
        "tephra",
        "lapilli",
        "ash-fall",
        "ashfall",
        "volcanic ash",
        "scoria scree",
        "pumice scree",
        "cristobalite",
        "mount yasur",
        "acatenango",
        "tarawera",
        "chaiten",
        "chaitén",
        "glaciere",
        "glacière",
        "ice-filled lava tube",
        "ice filled lava tube",
        "cold-trap",
        "cold trap",
        "balch effect",
        "eisriesenwelt",
        "scarisoara",
        "scărișoara",
        "bandera ice cave",
        "candelaria",
        "lofthellir",
        "hoarfrost ceiling",
    ]
    if any(ex in q for ex in ecommerce_exclusions):
        return False

    return True


def extract_lava_tube_biospeleology_intent(message: str) -> LavaTubeBiospeleologyIntent:
    q = message.lower().strip()

    matched_site_id: Optional[str] = None
    if "kazumura" in q or "kilauea" in q:
        matched_site_id = "kazumura-cave-kilauea-root-galleries"
    elif "ape cave" in q or "ape-cave" in q or "st. helens" in q or "st helens" in q:
        matched_site_id = "ape-cave-mount-st-helens-basalt"
    elif "undara" in q:
        matched_site_id = "undara-volcanic-lava-tubes"
    elif "manjanggul" in q or "jeju" in q:
        matched_site_id = "manjanggul-jeju-volcanic-tube"
    elif "cueva de los verdes" in q or "lanzarote" in q or "verdes" in q:
        matched_site_id = "cueva-de-los-verdes-lanzarote"
    else:
        for s_id in DEFAULT_LAVA_TUBE_BIOSPELEOLOGY_SITES:
            if s_id in q:
                matched_site_id = s_id
                break

    ecological_zone: Optional[str] = None
    if "root curtain" in q or "subterranean_root_curtain_gallery" in q:
        ecological_zone = LavaTubeEcologicalZone.SUBTERRANEAN_ROOT_CURTAIN_GALLERY.value
    elif "deep dark" in q or "stagnant saturation" in q or "deep_dark_stagnant_saturation" in q:
        ecological_zone = LavaTubeEcologicalZone.DEEP_DARK_STAGNANT_SATURATION.value
    elif (
        "transition" in q or "variable microclimate" in q or "transition_variable_microclimate" in q
    ):
        ecological_zone = LavaTubeEcologicalZone.TRANSITION_VARIABLE_MICROCLIMATE.value
    elif "twilight" in q or "moss threshold" in q or "twilight_moss_threshold" in q:
        ecological_zone = LavaTubeEcologicalZone.TWILIGHT_MOSS_THRESHOLD.value
    elif "skylight" in q or "entrance ecotone" in q or "skylight_entrance_ecotone" in q:
        ecological_zone = LavaTubeEcologicalZone.SKYLIGHT_ENTRANCE_ECOTONE.value
    elif matched_site_id and matched_site_id in DEFAULT_LAVA_TUBE_BIOSPELEOLOGY_SITES:
        ecological_zone = DEFAULT_LAVA_TUBE_BIOSPELEOLOGY_SITES[matched_site_id].dominant_zone

    calc_keywords = [
        "calculate",
        "calculation",
        "endemism",
        "endemism index",
        "trophic capacity",
        "root exudate",
        "vapor pressure deficit",
        "vpd",
        "microbial mat integrity",
        "mat integrity",
        "dynamics",
        "conservation status",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "kit",
        "helmet",
        "red-spectrum",
        "red spectrum",
        "headlamp",
        "knee",
        "elbow pads",
        "quaternary ammonium",
        "decon kit",
        "loupe",
        "aspirator",
        "pooter",
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
            "protocol",
            "zone",
            "substrate",
        ]
    ):
        action = "get_site"
    elif matched_site_id and not any(
        k in q for k in ["sites", "catalog", "list", "options", "all"]
    ):
        action = "get_site"
    else:
        action = "catalog"

    return LavaTubeBiospeleologyIntent(
        action=action,
        site_id=matched_site_id,
        query=message,
        ecological_zone=ecological_zone,
    )


def format_lava_tube_biospeleology_response(
    action: Union[LavaTubeBiospeleologyIntent, str],
    message: Any = None,
) -> FormattedLavaTubeBiospeleologyResponse:
    if isinstance(message, dict) and "lava_tube_biospeleology_info" in message:
        answer = str(
            message.get(
                "answer",
                "Subterranean Lava Tube Biospeleology & Troglomorphic Fauna guidance",
            )
        )
        return FormattedLavaTubeBiospeleologyResponse(answer, message)

    intent_obj: LavaTubeBiospeleologyIntent
    if isinstance(action, LavaTubeBiospeleologyIntent):
        intent_obj = action
    elif isinstance(action, str):
        if action in ("lava_tube_biospeleology", "lava_tube") and isinstance(message, str):
            intent_obj = extract_lava_tube_biospeleology_intent(message)
        elif action in ("calculate", "calculate_dynamics"):
            site_id = (
                message
                if isinstance(message, str) and message in DEFAULT_LAVA_TUBE_BIOSPELEOLOGY_SITES
                else None
            )
            intent_obj = LavaTubeBiospeleologyIntent(action="calculate", site_id=site_id)
        elif action in ("gear", "gear_checklist"):
            intent_obj = LavaTubeBiospeleologyIntent(action="gear_checklist")
        elif action in ("get_site", "site_detail", "detail"):
            site_id = (
                message
                if isinstance(message, str) and message in DEFAULT_LAVA_TUBE_BIOSPELEOLOGY_SITES
                else None
            )
            intent_obj = LavaTubeBiospeleologyIntent(action="get_site", site_id=site_id)
        else:
            intent_obj = LavaTubeBiospeleologyIntent(action="catalog")
    else:
        intent_obj = LavaTubeBiospeleologyIntent(action="catalog")

    resolved_action = intent_obj.action

    if resolved_action == "calculate":
        if isinstance(message, LavaTubeBiospeleologyResult):
            calc_res = message
        elif isinstance(message, LavaTubeBiospeleologyQuery):
            calc_res = calculate_lava_tube_biospeleology_dynamics(message)
        else:
            calc_q = LavaTubeBiospeleologyQuery(
                site_id=intent_obj.site_id or "kazumura-cave-kilauea-root-galleries"
            )
            calc_res = calculate_lava_tube_biospeleology_dynamics(calc_q)

        answer = (
            f"Lava Tube Biospeleology & Troglomorphic Dynamics for {calc_res.site_title}: "
            f"Troglobite Endemism Index: {calc_res.troglobite_endemism_index}. "
            f"Root Exudate Trophic Capacity: {calc_res.root_exudate_trophic_capacity_mg_c_m2_day} mg C/m²/day. "
            f"Vapor Pressure Deficit Stress: {calc_res.vapor_pressure_deficit_stress_kpa} kPa. "
            f"Microbial Mat Integrity: {calc_res.microbial_mat_integrity_percent}%. "
            f"Conservation Status: {calc_res.conservation_status.upper()}. "
            f"{calc_res.non_contact_traversal_protocol} {calc_res.biocontamination_decon_advisory}"
        )
        calc_info: dict[str, Any] = {
            "lava_tube_biospeleology_info": {
                "action": "calculate",
                "site_id": calc_res.site_id,
                "calculation": calc_res.model_dump(),
                "troglobite_endemism_index": calc_res.troglobite_endemism_index,
                "root_exudate_trophic_capacity_mg_c_m2_day": calc_res.root_exudate_trophic_capacity_mg_c_m2_day,
                "vapor_pressure_deficit_stress_kpa": calc_res.vapor_pressure_deficit_stress_kpa,
                "microbial_mat_integrity_percent": calc_res.microbial_mat_integrity_percent,
                "conservation_status": calc_res.conservation_status,
                "non_contact_traversal_protocol": calc_res.non_contact_traversal_protocol,
                "biocontamination_decon_advisory": calc_res.biocontamination_decon_advisory,
            },
            "answer": answer,
        }
        return FormattedLavaTubeBiospeleologyResponse(answer, calc_info)

    if resolved_action == "gear_checklist":
        checklist = message if isinstance(message, list) else get_lava_tube_biospeleology_gear()
        items_str = "; ".join(f"{g.name} ({g.description})" for g in checklist)
        answer = (
            f"Mandatory Subterranean Lava Tube Biospeleology & Troglomorphic Fauna Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Low-profile basalt helmets, 630nm red-spectrum headlamps, Kevlar knee/elbow pads, "
            f"quaternary ammonium boot decon kits, 15x macro loupes, and HEPA-filtered entomological pooters are mandatory."
        )
        gear_info: dict[str, Any] = {
            "lava_tube_biospeleology_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedLavaTubeBiospeleologyResponse(answer, gear_info)

    if resolved_action == "get_site":
        site = None
        if intent_obj.site_id:
            site = get_lava_tube_biospeleology_site(intent_obj.site_id)
        if not site and isinstance(message, LavaTubeBiospeleologySite):
            site = message
        if not site and isinstance(message, str):
            site = get_lava_tube_biospeleology_site(message)
        if not site:
            site = get_lava_tube_biospeleology_site("kazumura-cave-kilauea-root-galleries")

        if site:
            highlights_str = ", ".join(site.highlights)
            answer = (
                f"Lava Tube Biospeleology Site: {site.title} ({site.range}, {site.region}). "
                f"Elevation: {site.elevation_meters}m | Dominant Zone: {site.dominant_zone} | "
                f"Primary Substrate: {site.primary_substrate} | Dominant Adaptation: {site.dominant_adaptation}. "
                f"{site.description} Key Highlights: {highlights_str}."
            )
            site_info: dict[str, Any] = {
                "lava_tube_biospeleology_info": {
                    "action": "get_site",
                    "site_id": site.id,
                    "site": site.model_dump(),
                },
                "answer": answer,
            }
            return FormattedLavaTubeBiospeleologyResponse(answer, site_info)

    sites = (
        message
        if isinstance(message, list)
        else get_lava_tube_biospeleology_sites(zone=intent_obj.ecological_zone)
    )
    summary_str = "; ".join(
        f"{s.title} ({s.region}, {s.elevation_meters}m, zone: {s.dominant_zone})" for s in sites
    )
    answer = (
        f"Contoso Subterranean Lava Tube Biospeleology & Troglomorphic Fauna Catalog ({len(sites)} sites): {summary_str}. "
        "Inquire about specific volcanic lava tube ecosystems, troglobite endemism & trophic capacity calculations, or mandatory biosurvey gear."
    )
    catalog_info: dict[str, Any] = {
        "lava_tube_biospeleology_info": {
            "action": "catalog",
            "ecological_zone": intent_obj.ecological_zone,
            "sites": [s.model_dump() for s in sites],
        },
        "answer": answer,
    }
    return FormattedLavaTubeBiospeleologyResponse(answer, catalog_info)


def build_lava_tube_biospeleology_prompt(
    intent: Any = None,
    site: Optional[LavaTubeBiospeleologySite] = None,
    result: Optional[LavaTubeBiospeleologyResult] = None,
    gear: Optional[list[LavaTubeBiospeleologyGearItem]] = None,
) -> str:
    lines = [
        "Subterranean Lava Tube Biospeleology & Troglomorphic Fauna Guidance:",
        "- Lava Tube Zonation & Root Curtain Trophic Webs: Unlike deep karst caves, shallow basaltic lava tubes receive primary energy input from overhead tree roots (such as Metrosideros polymorpha) penetrating cooling fractures into subterranean root curtain galleries.",
        "- Troglomorphic Fauna Adaptations: Obligate eyeless troglobites (e.g., Oliarus polyphemus planthoppers, Adelocosa anops wolf spiders, Munidopsis squat lobsters) exhibit complete ocular regression, cuticular depigmentation, and extreme sensitivity to vapor pressure deficit (desiccation).",
        "- Actinobacterial 'Lava Tube Gold' & Microbial Mats: Chemolithoautotrophic actinobacterial colonies coat basalt walls and lavacicles with hydrophobic golden/white mineral-microbial biofilms that are permanently destroyed by human skin oils or muddy boot contact.",
        "- Mandatory Biosurvey & Biosecurity Protocol: Surveyors must use 630nm red-spectrum low-lux headlamps, EN 12492 low-profile helmets, Kevlar knee/elbow pads for a'a clinker, quaternary ammonium boot decontamination against Ceratocystis fungal spores, 15x achromatic loupes, and HEPA-filtered pooter aspirators.",
    ]

    resolved_site = site
    if not resolved_site:
        site_id: Optional[str] = None
        if isinstance(intent, LavaTubeBiospeleologyIntent) and intent.site_id:
            site_id = intent.site_id
        elif isinstance(intent, str):
            if detect_lava_tube_biospeleology_intent(intent):
                extracted = extract_lava_tube_biospeleology_intent(intent)
                site_id = extracted.site_id
        if site_id:
            resolved_site = get_lava_tube_biospeleology_site(site_id)

    if resolved_site:
        lines.append(
            f"- Focused Lava Tube Site: {resolved_site.title} ({resolved_site.region}, Range: {resolved_site.range}, Elevation: {resolved_site.elevation_meters}m, Zone: {resolved_site.dominant_zone}, Substrate: {resolved_site.primary_substrate}, Adaptation: {resolved_site.dominant_adaptation})"
        )

    if result:
        lines.append(
            f"- Calculated Biospeleology Telemetry: Endemism Index={result.troglobite_endemism_index}, Root Trophic Capacity={result.root_exudate_trophic_capacity_mg_c_m2_day} mg C/m²/day, VPD Stress={result.vapor_pressure_deficit_stress_kpa} kPa, Mat Integrity={result.microbial_mat_integrity_percent}%, Status={result.conservation_status}"
        )

    if gear:
        gear_names = ", ".join(g.name for g in gear)
        lines.append(f"- Mandatory Gear Items: {gear_names}")

    return "\n".join(lines)


def lava_tube_biospeleology_tool(
    query: Optional[LavaTubeBiospeleologyQuery] = None,
    action: Optional[str] = None,
    site_id: Optional[str] = None,
    zone: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_dynamics") or query is not None:
        calc_q = query or LavaTubeBiospeleologyQuery(
            site_id=site_id or "kazumura-cave-kilauea-root-galleries"
        )
        res = calculate_lava_tube_biospeleology_dynamics(calc_q)
        formatted = format_lava_tube_biospeleology_response("calculate", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_lava_tube_biospeleology_gear()
        formatted = format_lava_tube_biospeleology_response("gear_checklist", checklist)
        return dict(formatted._data)

    if action in ("get_site", "site_detail", "detail") and site_id:
        site = get_lava_tube_biospeleology_site(site_id)
        if site:
            formatted = format_lava_tube_biospeleology_response("get_site", site)
            return dict(formatted._data)

    sites = get_lava_tube_biospeleology_sites(zone=zone)
    formatted = format_lava_tube_biospeleology_response("catalog", sites)
    return dict(formatted._data)
