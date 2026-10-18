from enum import Enum
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator


class KelpForestStratum(str, Enum):
    FLOATING_PNEUMATOCYST_CANOPY = "floating_pneumatocyst_canopy"
    MIDWATER_STIPE_COLUMNS = "midwater_stipe_columns"
    SUBCANOPY_PTERYGOPHORA_UNDERSTORY = "subcanopy_pterygophora_understory"
    BENTHIC_HAPTERA_HOLDFAST_REEF = "benthic_haptera_holdfast_reef"
    INTERTIDAL_SURGE_CHANNEL_ECOTONE = "intertidal_surge_channel_ecotone"


class DominantKelpTaxa(str, Enum):
    MACROCYSTIS_PYRIFERA_GIANT_KELP = "macrocystis_pyrifera_giant_kelp"
    NEREOCYSTIS_LUETKEANA_BULL_KELP = "nereocystis_luetkeana_bull_kelp"
    ECKLONIA_RADIATA_GOLDEN_KELP = "ecklonia_radiata_golden_kelp"
    LAMINARIA_HYPERBOREA_CUVIE_FOREST = "laminaria_hyperborea_cuvie_forest"
    POSTELSIA_PALMAEFORMIS_SEA_PALM = "postelsia_palmaeformis_sea_palm"


class TrophicCascadeState(str, Enum):
    OTTER_KEYSTONE_CLIMAX_FOREST = "otter_keystone_climax_forest"
    TRANSITIONAL_PATCH_MOSAIC = "transitional_patch_mosaic"
    PURPLE_URCHIN_BARREN_DEGRADED = "purple_urchin_barren_degraded"
    UPWELLING_NUTRIENT_RECOVERY_BLOOM = "upwelling_nutrient_recovery_bloom"


class FreediveSafetyStatus(str, Enum):
    OPTIMAL_CALM_CANOPY_WINDOW = "optimal_calm_canopy_window"
    CAUTION_STIPE_ENTANGLEMENT_SWELL = "caution_stipe_entanglement_swell"
    ABORT_HEAVY_SURGE_LOW_VISIBILITY = "abort_heavy_surge_low_visibility"


class KelpFreedivingSite(BaseModel):
    id: str
    title: str = ""
    name: str = ""
    site_id: str = ""
    region: str = ""
    range: str = ""
    max_depth_meters: int = 0
    dominant_stratum: str = KelpForestStratum.FLOATING_PNEUMATOCYST_CANOPY.value
    primary_taxa: str = DominantKelpTaxa.MACROCYSTIS_PYRIFERA_GIANT_KELP.value
    trophic_state: str = TrophicCascadeState.OTTER_KEYSTONE_CLIMAX_FOREST.value
    description: str = ""
    highlights: list[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "id",
                "site_id": "id",
                "maxDepthMeters": "max_depth_meters",
                "dominantStratum": "dominant_stratum",
                "primaryTaxa": "primary_taxa",
                "trophicState": "trophic_state",
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
    def maxDepthMeters(self) -> int:
        return self.max_depth_meters

    @property
    def dominantStratum(self) -> str:
        return self.dominant_stratum

    @property
    def primaryTaxa(self) -> str:
        return self.primary_taxa

    @property
    def trophicState(self) -> str:
        return self.trophic_state


class KelpFreedivingQuery(BaseModel):
    site_id: str = "point-lobos-carmel-pinnacles"
    kelp_stratum: str = KelpForestStratum.FLOATING_PNEUMATOCYST_CANOPY.value
    dominant_taxa: str = DominantKelpTaxa.MACROCYSTIS_PYRIFERA_GIANT_KELP.value
    target_depth_meters: float = 12.0
    water_temp_celsius: float = 12.5
    surge_velocity_ms: float = 0.35
    visibility_meters: float = 15.0
    wetsuit_thickness_mm: float = 7.0

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "site_id",
                "kelpStratum": "kelp_stratum",
                "dominantStratum": "kelp_stratum",
                "dominant_stratum": "kelp_stratum",
                "dominantTaxa": "dominant_taxa",
                "primaryTaxa": "dominant_taxa",
                "primary_taxa": "dominant_taxa",
                "targetDepthMeters": "target_depth_meters",
                "waterTempCelsius": "water_temp_celsius",
                "surgeVelocityMs": "surge_velocity_ms",
                "visibilityMeters": "visibility_meters",
                "wetsuitThicknessMm": "wetsuit_thickness_mm",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def siteId(self) -> str:
        return self.site_id

    @property
    def kelpStratum(self) -> str:
        return self.kelp_stratum

    @property
    def dominantTaxa(self) -> str:
        return self.dominant_taxa

    @property
    def targetDepthMeters(self) -> float:
        return self.target_depth_meters

    @property
    def waterTempCelsius(self) -> float:
        return self.water_temp_celsius

    @property
    def surgeVelocityMs(self) -> float:
        return self.surge_velocity_ms

    @property
    def visibilityMeters(self) -> float:
        return self.visibility_meters

    @property
    def wetsuitThicknessMm(self) -> float:
        return self.wetsuit_thickness_mm


class KelpFreedivingResult(BaseModel):
    site_title: str
    site_id: Optional[str] = None
    neutral_buoyancy_depth_meters: float
    recommended_lead_weight_kg: float
    safe_bottom_time_seconds: int
    stipe_entanglement_risk_percent: float
    holdfast_biodiversity_index: float
    safety_status: str
    canopy_entry_protocol: str
    holdfast_survey_advisory: str

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteTitle": "site_title",
                "siteId": "site_id",
                "neutralBuoyancyDepthMeters": "neutral_buoyancy_depth_meters",
                "recommendedLeadWeightKg": "recommended_lead_weight_kg",
                "safeBottomTimeSeconds": "safe_bottom_time_seconds",
                "stipeEntanglementRiskPercent": "stipe_entanglement_risk_percent",
                "holdfastBiodiversityIndex": "holdfast_biodiversity_index",
                "safetyStatus": "safety_status",
                "canopyEntryProtocol": "canopy_entry_protocol",
                "holdfastSurveyAdvisory": "holdfast_survey_advisory",
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
    def neutralBuoyancyDepthMeters(self) -> float:
        return self.neutral_buoyancy_depth_meters

    @property
    def recommendedLeadWeightKg(self) -> float:
        return self.recommended_lead_weight_kg

    @property
    def safeBottomTimeSeconds(self) -> int:
        return self.safe_bottom_time_seconds

    @property
    def stipeEntanglementRiskPercent(self) -> float:
        return self.stipe_entanglement_risk_percent

    @property
    def holdfastBiodiversityIndex(self) -> float:
        return self.holdfast_biodiversity_index

    @property
    def safetyStatus(self) -> str:
        return self.safety_status

    @property
    def canopyEntryProtocol(self) -> str:
        return self.canopy_entry_protocol

    @property
    def holdfastSurveyAdvisory(self) -> str:
        return self.holdfast_survey_advisory


class KelpFreedivingGearItem(BaseModel):
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


class KelpFreedivingIntent(BaseModel):
    action: Literal["catalog", "get_site", "calculate", "gear_checklist"] = "catalog"
    site_id: Optional[str] = None
    query: Optional[str] = None
    kelp_stratum: Optional[str] = None


class FormattedKelpFreedivingResponse(str):
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


DEFAULT_KELP_FREEDIVING_SITES: dict[str, KelpFreedivingSite] = {
    "point-lobos-carmel-pinnacles": KelpFreedivingSite(
        id="point-lobos-carmel-pinnacles",
        title="Point Lobos Whalers Cove & Carmel Pinnacles",
        name="Point Lobos Whalers Cove & Carmel Pinnacles",
        site_id="point-lobos-carmel-pinnacles",
        region="Monterey Bay National Marine Sanctuary, California",
        range="Central California Granitic Headlands",
        max_depth_meters=24,
        dominant_stratum=KelpForestStratum.FLOATING_PNEUMATOCYST_CANOPY.value,
        primary_taxa=DominantKelpTaxa.MACROCYSTIS_PYRIFERA_GIANT_KELP.value,
        trophic_state=TrophicCascadeState.OTTER_KEYSTONE_CLIMAX_FOREST.value,
        description="Towering Macrocystis pyrifera giant kelp cathedrals anchored to submerged granitic pinnacles, sustained by sea otter predation on herbivorous urchins and fed by cold Carmel Submarine Canyon upwelling.",
        highlights=[
            "Dense floating pneumatocyst surface canopies with sunlit cathedral shafts",
            "Keystone southern sea otter (Enhydra lutris nereis) trophic regulation",
            "Intricate benthic haptera holdfasts sheltering red abalone, cabezon, and wolf-eels",
        ],
    ),
    "channel-islands-anacapa-cathedral-cove": KelpFreedivingSite(
        id="channel-islands-anacapa-cathedral-cove",
        title="Channel Islands Anacapa Landing & Cathedral Cove",
        name="Channel Islands Anacapa Landing & Cathedral Cove",
        site_id="channel-islands-anacapa-cathedral-cove",
        region="Channel Islands National Park, Southern California",
        range="Northern Channel Islands Volcanic Reef",
        max_depth_meters=18,
        dominant_stratum=KelpForestStratum.BENTHIC_HAPTERA_HOLDFAST_REEF.value,
        primary_taxa=DominantKelpTaxa.MACROCYSTIS_PYRIFERA_GIANT_KELP.value,
        trophic_state=TrophicCascadeState.TRANSITIONAL_PATCH_MOSAIC.value,
        description="Volcanic basaltic reefs and submerged arches supporting lush giant kelp stands alongside transitional mosaic reefs where California sheephead and spiny lobsters actively control purple sea urchin grazing.",
        highlights=[
            "Massive perennial Macrocystis holdfasts exceeding 1 meter in basal diameter",
            "Vibrant Garibaldi damselfish, California sheephead, and horn shark nurseries",
            "Crystal-clear volcanic cove windows ideal for benthic quadrat holdfast surveys",
        ],
    ),
    "false-bay-millers-point-great-african-seaforest": KelpFreedivingSite(
        id="false-bay-millers-point-great-african-seaforest",
        title="False Bay Miller's Point Great African Seaforest",
        name="False Bay Miller's Point Great African Seaforest",
        site_id="false-bay-millers-point-great-african-seaforest",
        region="Cape Peninsula, Western Cape, South Africa",
        range="Benguela-Agulhas Upwelling Mixing Zone",
        max_depth_meters=14,
        dominant_stratum=KelpForestStratum.SUBCANOPY_PTERYGOPHORA_UNDERSTORY.value,
        primary_taxa=DominantKelpTaxa.ECKLONIA_RADIATA_GOLDEN_KELP.value,
        trophic_state=TrophicCascadeState.UPWELLING_NUTRIENT_RECOVERY_BLOOM.value,
        description="Shallow granitic boulder channels dominated by buoyant hollow-stiped Ecklonia maxima sea bamboo and dense subcanopy Ecklonia radiata / Laminaria pallida understory gardens.",
        highlights=[
            "Rigid hollow gas-filled stipe columns forming a dense subcanopy labyrinth",
            "Endemic pyjama catsharks, shysharks, and Cape rock lobster holdfast refugia",
            "Cold Benguela nutrient upwelling pulses driving rapid frond blade recruitment",
        ],
    ),
    "barkley-sound-broken-group-bull-kelp": KelpFreedivingSite(
        id="barkley-sound-broken-group-bull-kelp",
        title="Barkley Sound Broken Group Islands Bull Kelp",
        name="Barkley Sound Broken Group Islands Bull Kelp",
        site_id="barkley-sound-broken-group-bull-kelp",
        region="Pacific Rim National Park Reserve, Vancouver Island, BC",
        range="West Coast Insular Fjord & Skerry Archipelago",
        max_depth_meters=20,
        dominant_stratum=KelpForestStratum.MIDWATER_STIPE_COLUMNS.value,
        primary_taxa=DominantKelpTaxa.NEREOCYSTIS_LUETKEANA_BULL_KELP.value,
        trophic_state=TrophicCascadeState.OTTER_KEYSTONE_CLIMAX_FOREST.value,
        description="High-current tidal channels where annual Nereocystis luetkeana bull kelp whips rise 20 meters from cobble-boulder reefs, crowned by single terminal pneumatocyst bulbs streaming in the surge.",
        highlights=[
            "Elastic midwater Nereocystis whip stipes flexing in 2-knot tidal currents",
            "Pterygophora californica woody understory palms carpeting the 12m rocky bench",
            "High-density sunflower star (Pycnopodia) and giant Pacific octopus dens",
        ],
    ),
    "fortescue-bay-tasman-peninsula-giant-kelp": KelpFreedivingSite(
        id="fortescue-bay-tasman-peninsula-giant-kelp",
        title="Fortescue Bay & Tasman Peninsula Dolerite Reefs",
        name="Fortescue Bay & Tasman Peninsula Dolerite Reefs",
        site_id="fortescue-bay-tasman-peninsula-giant-kelp",
        region="Tasman National Park, Southeastern Tasmania, Australia",
        range="Southern Ocean Sub-Antarctic Dolerite Coast",
        max_depth_meters=22,
        dominant_stratum=KelpForestStratum.INTERTIDAL_SURGE_CHANNEL_ECOTONE.value,
        primary_taxa=DominantKelpTaxa.MACROCYSTIS_PYRIFERA_GIANT_KELP.value,
        trophic_state=TrophicCascadeState.PURPLE_URCHIN_BARREN_DEGRADED.value,
        description="Dramatic Jurassic dolerite sea cliffs plunging into Southern Ocean swell channels, preserving remnant cold-water Macrocystis pyrifera forests and weedy seadragon habitats threatened by range-extending Centrostephanus rodgersii urchins.",
        highlights=[
            "Remnant Southern Hemisphere Macrocystis pyrifera conservation refugia",
            "Endemic weedy seadragons (Phyllopteryx taeniolatus) gliding along kelp edges",
            "High-energy intertidal bull-kelp (Durvillaea potatorum) surge channel ecotones",
        ],
    ),
}


DEFAULT_KELP_FREEDIVING_GEAR: list[KelpFreedivingGearItem] = [
    KelpFreedivingGearItem(
        id="open-cell-7mm-camo-freedive-wetsuit",
        item_id="open-cell-7mm-camo-freedive-wetsuit",
        name="7mm Two-Piece Open-Cell Camo Freediving Wetsuit",
        category="Thermal Protection",
        mandatory=True,
        description="Snag-free beaver-tail two-piece open-cell neoprene suit without exterior zippers or Velcro tabs that catch on Macrocystis fronds.",
        purpose="Provides sub-12°C upwelling thermal insulation while eliminating exterior snag points in dense kelp canopies.",
    ),
    KelpFreedivingGearItem(
        id="quick-release-silicone-rubber-weight-belt",
        item_id="quick-release-silicone-rubber-weight-belt",
        name="Quick-Release Elastic Silicone Rubber Freedive Weight Belt",
        category="Buoyancy & Ballast Safety",
        mandatory=True,
        description="High-stretch silicone belt with low-profile Marseillaise pin buckle that stays locked on the hips during inverted duck dives and ditches instantly with a single-hand pull.",
        purpose="Ensures immediate positive-buoyancy ditching if entangled in midwater stipe columns or benthic holdfasts.",
    ),
    KelpFreedivingGearItem(
        id="blunt-tip-titanium-kelp-line-cutter",
        item_id="blunt-tip-titanium-kelp-line-cutter",
        name="Blunt-Tip Titanium Kelp & Monofilament Line Cutter",
        category="Entanglement Extrication",
        mandatory=True,
        description="Corrosion-proof titanium trauma shears and shrouded line cutter mounted on the upper arm or chest strap for severing drifted fishing monofilament wrapped in kelp.",
        purpose="Cuts monofilament, crab trap lines, or twisted stipes without puncturing open-cell neoprene or injuring the diver.",
    ),
    KelpFreedivingGearItem(
        id="low-volume-frameless-freedive-mask-j-snorkel",
        item_id="low-volume-frameless-freedive-mask-j-snorkel",
        name="Low-Volume Frameless Freedive Mask & Hydrodynamic J-Snorkel",
        category="Apnea Breathing & Vision",
        mandatory=True,
        description="Ultra-low internal volume silicone mask paired with a flexible valveless J-tube snorkel slipped under the mask strap to prevent kelp frond drag.",
        purpose="Minimizes mask equalization air usage and eliminates bulky purge valves that snag on floating pneumatocyst mats.",
    ),
    KelpFreedivingGearItem(
        id="carbon-fiber-long-blade-bi-fins",
        item_id="carbon-fiber-long-blade-bi-fins",
        name="Pure Carbon-Fiber Long-Blade Freediving Bi-Fins",
        category="Propulsion & Surge Control",
        mandatory=True,
        description="Responsive 80cm parabolic carbon-fiber blades with soft rubber water rails engineered for narrow-amplitude flutter kicks through vertical stipe corridors.",
        purpose="Delivers high thrust against coastal surge channels while maintaining a compact kick envelope inside kelp columns.",
    ),
    KelpFreedivingGearItem(
        id="submersible-slate-benthic-quadrat-frame",
        item_id="submersible-slate-benthic-quadrat-frame",
        name="Submersible Wrist Slate & Collapsible 0.25m² Benthic Quadrat Frame",
        category="Ecological Survey",
        mandatory=True,
        description="Shock-corded PVC/anodized-aluminum 50x50cm quadrat and luminescent wrist slate for non-destructive haptera holdfast biodiversity and urchin density counts.",
        purpose="Enables standardized intertidal and subtidal holdfast epifauna and trophic cascade monitoring during apnea drops.",
    ),
]


def get_kelp_freediving_sites(
    stratum: Optional[str] = None,
) -> list[KelpFreedivingSite]:
    all_sites = list(DEFAULT_KELP_FREEDIVING_SITES.values())
    if not stratum:
        return all_sites
    norm = stratum.strip().lower()
    return [
        s
        for s in all_sites
        if s.dominant_stratum.lower() == norm
    ]


def get_kelp_freediving_site(site_id: str) -> Optional[KelpFreedivingSite]:
    return DEFAULT_KELP_FREEDIVING_SITES.get(site_id.strip().lower())


def get_kelp_freediving_gear() -> list[KelpFreedivingGearItem]:
    return list(DEFAULT_KELP_FREEDIVING_GEAR)


def calculate_kelp_freediving_dynamics(
    query: KelpFreedivingQuery,
) -> KelpFreedivingResult:
    site = get_kelp_freediving_site(query.site_id)
    if not site:
        raise ValueError(f"Kelp freediving site '{query.site_id}' not found")

    site_title = site.title

    # Neutral buoyancy depth (m): freediving safety rule sets neutral buoyancy at ~2/3 of target depth, min 8.0m, max 12.0m
    neutral_buoyancy_depth_meters = round(
        max(8.0, min(12.0, query.target_depth_meters * 0.78)),
        1,
    )

    # Recommended lead weight (kg): based on wetsuit thickness and shallow vs deep neutral buoyancy target
    base_weight = query.wetsuit_thickness_mm * 0.95
    depth_trim_offset = max(-1.5, min(1.0, (10.0 - neutral_buoyancy_depth_meters) * 0.35))
    recommended_lead_weight_kg = round(max(2.0, base_weight + depth_trim_offset), 1)

    # Safe apnea bottom time (seconds): accounts for depth, cold water mammalian dive reflex / metabolic O2 consumption, and surge work
    temp_factor = max(0.65, min(1.1, (query.water_temp_celsius - 4.0) / 10.0))
    surge_penalty_sec = query.surge_velocity_ms * 22.0
    depth_transit_sec = query.target_depth_meters * 1.8
    safe_bottom_time_seconds = int(
        round(max(20.0, min(110.0, (95.0 * temp_factor) - surge_penalty_sec - (depth_transit_sec * 0.4))))
    )

    # Stipe entanglement risk (%)
    stratum_val = str(query.kelp_stratum).lower()
    stratum_risk = 12.0
    if KelpForestStratum.FLOATING_PNEUMATOCYST_CANOPY.value in stratum_val:
        stratum_risk = 16.0
    elif KelpForestStratum.INTERTIDAL_SURGE_CHANNEL_ECOTONE.value in stratum_val:
        stratum_risk = 28.0
    elif KelpForestStratum.MIDWATER_STIPE_COLUMNS.value in stratum_val:
        stratum_risk = 20.0
    elif KelpForestStratum.SUBCANOPY_PTERYGOPHORA_UNDERSTORY.value in stratum_val:
        stratum_risk = 18.0

    surge_risk = query.surge_velocity_ms * 32.0
    vis_penalty = max(0.0, (12.0 - query.visibility_meters) * 2.8)
    stipe_entanglement_risk_percent = round(
        max(5.0, min(98.0, stratum_risk + surge_risk + vis_penalty)),
        1,
    )

    # Holdfast biodiversity index (0.10 to 0.99)
    trophic_base = 0.86
    if site.trophic_state == TrophicCascadeState.OTTER_KEYSTONE_CLIMAX_FOREST.value:
        trophic_base = 0.91
    elif site.trophic_state == TrophicCascadeState.UPWELLING_NUTRIENT_RECOVERY_BLOOM.value:
        trophic_base = 0.85
    elif site.trophic_state == TrophicCascadeState.TRANSITIONAL_PATCH_MOSAIC.value:
        trophic_base = 0.78
    elif site.trophic_state == TrophicCascadeState.PURPLE_URCHIN_BARREN_DEGRADED.value:
        trophic_base = 0.52

    taxa_bonus = (
        0.04
        if DominantKelpTaxa.MACROCYSTIS_PYRIFERA_GIANT_KELP.value in str(query.dominant_taxa).lower()
        else 0.02
    )
    temp_nutrient_bonus = 0.03 if 9.0 <= query.water_temp_celsius <= 14.5 else -0.02
    holdfast_biodiversity_index = round(
        max(0.15, min(0.99, trophic_base + taxa_bonus + temp_nutrient_bonus)),
        2,
    )

    # Safety status classification
    if (
        query.surge_velocity_ms >= 1.35
        or query.visibility_meters < 4.0
        or stipe_entanglement_risk_percent >= 68.0
    ):
        safety_status = FreediveSafetyStatus.ABORT_HEAVY_SURGE_LOW_VISIBILITY.value
        canopy_entry_protocol = (
            "ABORT CANOPY ENTRY: Heavy oscillatory swell and low optical visibility create severe stipe wrapping and "
            "rock-pinning hazards in surge channels. Stand down to shore or remain in open sandy channels outside the kelp bed."
        )
        holdfast_survey_advisory = (
            "SUSPEND BENTHIC QUADRAT SURVEY: Bottom surge velocity exceeds safe apnea station-keeping limits. "
            "Do not descend into subcanopy Pterygophora or haptera reef crevices until swell period subsides."
        )
    elif (
        query.surge_velocity_ms >= 0.75
        or query.visibility_meters < 8.5
        or stipe_entanglement_risk_percent >= 40.0
    ):
        safety_status = FreediveSafetyStatus.CAUTION_STIPE_ENTANGLEMENT_SWELL.value
        canopy_entry_protocol = (
            "CAUTION SWELL ENTRY PROTOCOL: Enter only through natural open water windows between stipe bundles. "
            "Remove snorkel from mouth prior to duck dive, keep bi-fins within a narrow kick arc, and maintain one-up one-down buddy visual contact."
        )
        holdfast_survey_advisory = (
            "ELEVATED SURGE HOLDFAST PROTOCOL: Time benthic quadrat placements with wave trough slack intervals. "
            "Never wedge fingers or knees beneath haptera root lattices; keep titanium line cutter immediately accessible."
        )
    else:
        safety_status = FreediveSafetyStatus.OPTIMAL_CALM_CANOPY_WINDOW.value
        canopy_entry_protocol = (
            "OPTIMAL KELP CRAWL & VERTICAL PARTING PROTOCOL: Glide across dense surface pneumatocyst mats using a flat "
            "hands-forward kelp crawl. Gently part fronds vertically to open a clear shaft before executing a streamlined duck dive."
        )
        holdfast_survey_advisory = (
            "PRISTINE HOLDFAST ECOLOGY SURVEY: Hover at neutral buoyancy 50cm above the benthic haptera cone. "
            "Record brittle star, abalone, and sea urchin counts inside the 0.25m² quadrat without detaching basal haptera."
        )

    return KelpFreedivingResult(
        site_title=site_title,
        site_id=site.id,
        neutral_buoyancy_depth_meters=neutral_buoyancy_depth_meters,
        recommended_lead_weight_kg=recommended_lead_weight_kg,
        safe_bottom_time_seconds=safe_bottom_time_seconds,
        stipe_entanglement_risk_percent=stipe_entanglement_risk_percent,
        holdfast_biodiversity_index=holdfast_biodiversity_index,
        safety_status=safety_status,
        canopy_entry_protocol=canopy_entry_protocol,
        holdfast_survey_advisory=holdfast_survey_advisory,
    )


def detect_kelp_freediving_intent(message: str) -> bool:
    if not message or not message.strip():
        return False

    q = message.lower().strip()

    kelp_keywords = [
        "kelp forest",
        "kelp freediving",
        "kelp free-diving",
        "kelp free diving",
        "kelp dive",
        "kelp diving",
        "holdfast",
        "haptera",
        "macrocystis",
        "nereocystis",
        "bull kelp",
        "giant kelp",
        "golden kelp",
        "ecklonia",
        "pterygophora",
        "pneumatocyst",
        "urchin barren",
        "kelp crawl",
        "stipe entanglement",
        "stipe column",
        "stipe columns",
        "great african seaforest",
        "seaforest",
        "kelp line cutter",
        "benthic quadrat",
    ]

    site_matches = [
        "point-lobos-carmel-pinnacles",
        "channel-islands-anacapa-cathedral-cove",
        "false-bay-millers-point-great-african-seaforest",
        "barkley-sound-broken-group-bull-kelp",
        "fortescue-bay-tasman-peninsula-giant-kelp",
        "anacapa cathedral cove",
        "millers point",
        "miller's point",
        "barkley sound",
        "fortescue bay",
    ]

    is_explicit_kelp = any(k in q for k in kelp_keywords) or any(
        sm in q for sm in site_matches
    )
    if not is_explicit_kelp and "point lobos" in q and any(
        w in q for w in ["kelp", "freediv", "free-div", "apnea", "canopy", "wetsuit", "buoyancy"]
    ):
        is_explicit_kelp = True

    exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "rentals",
        "rental",
        "esld",
        "equivalent sea level depth",
        "buhlmann",
        "regulator freeze",
        "ice hole dive",
        "turn pressure",
        "rule of thirds",
        "rule of sixths",
        "sump penetration",
        "peacock springs",
        "sea glass",
        "vaseline glass",
        "uranium glass",
        "hydration patina",
        "ferry angle",
        "paddle float",
        "bilge pump",
        "spray skirt",
        "lava tube",
        "biospeleology",
        "troglobite",
    ]

    if not is_explicit_kelp:
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
        "blowhole",
        "sea cave",
        "sea-cave",
        "pneumatic wave",
        "clapotis",
        "fingal",
        "devils punchbowl",
        "devil's punchbowl",
        "air compression blast",
        "littoral cave",
    ]
    if any(ex in q for ex in ecommerce_exclusions):
        return False
    if "surge channel" in q and "urchin barren" not in q:
        return False

    return True


def extract_kelp_freediving_intent(message: str) -> KelpFreedivingIntent:
    q = message.lower().strip()

    matched_site_id: Optional[str] = None
    if "point lobos" in q or "carmel" in q or "whalers cove" in q:
        matched_site_id = "point-lobos-carmel-pinnacles"
    elif "channel islands" in q or "anacapa" in q or "cathedral cove" in q:
        matched_site_id = "channel-islands-anacapa-cathedral-cove"
    elif "false bay" in q or "millers point" in q or "miller's point" in q or "seaforest" in q or "ecklonia" in q:
        matched_site_id = "false-bay-millers-point-great-african-seaforest"
    elif "barkley sound" in q or "broken group" in q or "nereocystis" in q or "bull kelp" in q:
        matched_site_id = "barkley-sound-broken-group-bull-kelp"
    elif "fortescue" in q or "tasman" in q or "tasmania" in q:
        matched_site_id = "fortescue-bay-tasman-peninsula-giant-kelp"
    else:
        for s_id in DEFAULT_KELP_FREEDIVING_SITES:
            if s_id in q:
                matched_site_id = s_id
                break

    kelp_stratum: Optional[str] = None
    if "pneumatocyst" in q or "floating_pneumatocyst_canopy" in q or "surface canopy" in q:
        kelp_stratum = KelpForestStratum.FLOATING_PNEUMATOCYST_CANOPY.value
    elif "stipe column" in q or "midwater_stipe_columns" in q:
        kelp_stratum = KelpForestStratum.MIDWATER_STIPE_COLUMNS.value
    elif "pterygophora" in q or "subcanopy" in q or "subcanopy_pterygophora_understory" in q:
        kelp_stratum = KelpForestStratum.SUBCANOPY_PTERYGOPHORA_UNDERSTORY.value
    elif "haptera" in q or "holdfast reef" in q or "benthic_haptera_holdfast_reef" in q:
        kelp_stratum = KelpForestStratum.BENTHIC_HAPTERA_HOLDFAST_REEF.value
    elif "surge channel" in q or "intertidal_surge_channel_ecotone" in q:
        kelp_stratum = KelpForestStratum.INTERTIDAL_SURGE_CHANNEL_ECOTONE.value
    elif matched_site_id and matched_site_id in DEFAULT_KELP_FREEDIVING_SITES:
        kelp_stratum = DEFAULT_KELP_FREEDIVING_SITES[matched_site_id].dominant_stratum

    calc_keywords = [
        "calculate",
        "calculation",
        "neutral buoyancy",
        "lead weight",
        "bottom time",
        "stipe entanglement",
        "entanglement risk",
        "holdfast biodiversity",
        "biodiversity index",
        "dynamics",
        "safety status",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "kit",
        "wetsuit",
        "open-cell",
        "weight belt",
        "silicone belt",
        "line cutter",
        "kelp line cutter",
        "j-snorkel",
        "snorkel",
        "bi-fins",
        "carbon-fiber",
        "quadrat",
        "wrist slate",
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
            "advisory",
            "stratum",
            "taxa",
        ]
    ):
        action = "get_site"
    elif matched_site_id and not any(
        k in q for k in ["sites", "catalog", "list", "options", "all"]
    ):
        action = "get_site"
    else:
        action = "catalog"

    return KelpFreedivingIntent(
        action=action,
        site_id=matched_site_id,
        query=message,
        kelp_stratum=kelp_stratum,
    )


def format_kelp_freediving_response(
    action: Union[KelpFreedivingIntent, str],
    message: Any = None,
) -> FormattedKelpFreedivingResponse:
    if isinstance(message, dict) and "kelp_freediving_info" in message:
        answer = str(
            message.get(
                "answer",
                "Coastal Intertidal Kelp Forest Free-Diving & Holdfast Ecology guidance",
            )
        )
        return FormattedKelpFreedivingResponse(answer, message)

    intent_obj: KelpFreedivingIntent
    if isinstance(action, KelpFreedivingIntent):
        intent_obj = action
    elif isinstance(action, str):
        if action in ("kelp_freediving", "kelp_forest") and isinstance(message, str):
            intent_obj = extract_kelp_freediving_intent(message)
        elif action in ("calculate", "calculate_dynamics"):
            site_id = (
                message
                if isinstance(message, str) and message in DEFAULT_KELP_FREEDIVING_SITES
                else None
            )
            intent_obj = KelpFreedivingIntent(action="calculate", site_id=site_id)
        elif action in ("gear", "gear_checklist"):
            intent_obj = KelpFreedivingIntent(action="gear_checklist")
        elif action in ("get_site", "site_detail", "detail"):
            site_id = (
                message
                if isinstance(message, str) and message in DEFAULT_KELP_FREEDIVING_SITES
                else None
            )
            intent_obj = KelpFreedivingIntent(action="get_site", site_id=site_id)
        else:
            intent_obj = KelpFreedivingIntent(action="catalog")
    else:
        intent_obj = KelpFreedivingIntent(action="catalog")

    resolved_action = intent_obj.action

    if resolved_action == "calculate":
        if isinstance(message, KelpFreedivingResult):
            calc_res = message
        elif isinstance(message, KelpFreedivingQuery):
            calc_res = calculate_kelp_freediving_dynamics(message)
        else:
            calc_q = KelpFreedivingQuery(
                site_id=intent_obj.site_id or "point-lobos-carmel-pinnacles"
            )
            calc_res = calculate_kelp_freediving_dynamics(calc_q)

        answer = (
            f"Kelp Forest Free-Diving & Holdfast Ecology Analysis for {calc_res.site_title}: "
            f"Neutral Buoyancy Depth: {calc_res.neutral_buoyancy_depth_meters}m | "
            f"Recommended Lead Weight: {calc_res.recommended_lead_weight_kg} kg | "
            f"Safe Apnea Bottom Time: {calc_res.safe_bottom_time_seconds}s | "
            f"Stipe Entanglement Risk: {calc_res.stipe_entanglement_risk_percent}% | "
            f"Holdfast Biodiversity Index: {calc_res.holdfast_biodiversity_index} | "
            f"Safety Status: {calc_res.safety_status.upper()}. "
            f"{calc_res.canopy_entry_protocol} {calc_res.holdfast_survey_advisory}"
        )
        calc_info: dict[str, Any] = {
            "kelp_freediving_info": {
                "action": "calculate",
                "site_id": calc_res.site_id,
                "calculation": calc_res.model_dump(),
                "neutral_buoyancy_depth_meters": calc_res.neutral_buoyancy_depth_meters,
                "recommended_lead_weight_kg": calc_res.recommended_lead_weight_kg,
                "safe_bottom_time_seconds": calc_res.safe_bottom_time_seconds,
                "stipe_entanglement_risk_percent": calc_res.stipe_entanglement_risk_percent,
                "holdfast_biodiversity_index": calc_res.holdfast_biodiversity_index,
                "safety_status": calc_res.safety_status,
                "canopy_entry_protocol": calc_res.canopy_entry_protocol,
                "holdfast_survey_advisory": calc_res.holdfast_survey_advisory,
            },
            "answer": answer,
        }
        return FormattedKelpFreedivingResponse(answer, calc_info)

    if resolved_action == "gear_checklist":
        checklist = (
            message if isinstance(message, list) else get_kelp_freediving_gear()
        )
        items_str = "; ".join(f"{g.name} ({g.description})" for g in checklist)
        answer = (
            f"Mandatory Coastal Intertidal Kelp Forest Free-Diving & Holdfast Survey Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Snag-free 7mm open-cell camo wetsuits, quick-release silicone rubber weight belts, "
            f"blunt-tip titanium kelp line cutters, low-volume masks with J-snorkels, carbon-fiber bi-fins, and 0.25m² benthic quadrat frames are mandatory."
        )
        gear_info: dict[str, Any] = {
            "kelp_freediving_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedKelpFreedivingResponse(answer, gear_info)

    if resolved_action == "get_site":
        site = None
        if intent_obj.site_id:
            site = get_kelp_freediving_site(intent_obj.site_id)
        if not site and isinstance(message, KelpFreedivingSite):
            site = message
        if not site and isinstance(message, str):
            site = get_kelp_freediving_site(message)
        if not site:
            site = get_kelp_freediving_site("point-lobos-carmel-pinnacles")

        if site:
            highlights_str = ", ".join(site.highlights)
            answer = (
                f"Kelp Forest Free-Diving Site: {site.title} ({site.range}, {site.region}). "
                f"Max Depth: {site.max_depth_meters}m | Dominant Stratum: {site.dominant_stratum} | "
                f"Primary Taxa: {site.primary_taxa} | Trophic State: {site.trophic_state}. "
                f"{site.description} Key Highlights: {highlights_str}."
            )
            site_info: dict[str, Any] = {
                "kelp_freediving_info": {
                    "action": "get_site",
                    "site_id": site.id,
                    "site": site.model_dump(),
                },
                "answer": answer,
            }
            return FormattedKelpFreedivingResponse(answer, site_info)

    sites = (
        message
        if isinstance(message, list)
        else get_kelp_freediving_sites(stratum=intent_obj.kelp_stratum)
    )
    summary_str = "; ".join(
        f"{s.title} ({s.region}, max depth {s.max_depth_meters}m, stratum: {s.dominant_stratum})"
        for s in sites
    )
    answer = (
        f"Contoso Coastal Intertidal Kelp Forest Free-Diving & Holdfast Ecology Catalog ({len(sites)} sites): {summary_str}. "
        "Inquire about specific giant or bull kelp sanctuaries, neutral buoyancy & stipe entanglement calculations, or mandatory apnea survey gear."
    )
    catalog_info: dict[str, Any] = {
        "kelp_freediving_info": {
            "action": "catalog",
            "kelp_stratum": intent_obj.kelp_stratum,
            "sites": [s.model_dump() for s in sites],
        },
        "answer": answer,
    }
    return FormattedKelpFreedivingResponse(answer, catalog_info)


def build_kelp_freediving_prompt(
    intent: Any = None,
    site: Optional[KelpFreedivingSite] = None,
    result: Optional[KelpFreedivingResult] = None,
    gear: Optional[list[KelpFreedivingGearItem]] = None,
) -> str:
    lines = [
        "Coastal Intertidal Kelp Forest Free-Diving & Holdfast Ecology Guidance:",
        "- Vertical Kelp Architecture & Canopy Entry: Giant kelp (Macrocystis pyrifera) and bull kelp (Nereocystis luetkeana) form multi-tiered marine forests from benthic haptera holdfast reefs through midwater stipe columns to floating gas-filled pneumatocyst canopies. Freedivers must use a flat 'kelp crawl' across surface mats and part fronds vertically rather than kicking horizontally through entangled blades.",
        "- Trophic Cascade & Holdfast Biodiversity: Keystone predators (sea otters Enhydra lutris, California sheephead, sunflower stars) suppress herbivorous purple sea urchins (Strongylocentrotus purpuratus), preserving high-diversity benthic haptera cones that shelter abalone, brittle stars, and cryptic scorpaenids.",
        "- Apnea Ballast & Entanglement Safety: Calibrate silicone rubber weight belts for positive buoyancy above 10m neutral buoyancy depth to prevent shallow-water blackout sinking, remove the J-snorkel from the mouth before descending, and carry a blunt-tip titanium line cutter for drifted monofilament.",
        "- Mandatory 6-Item Kelp Freediving Gear Checklist: 7mm Two-Piece Open-Cell Camo Wetsuit, Quick-Release Silicone Rubber Weight Belt, Blunt-Tip Titanium Kelp Line Cutter, Low-Volume Frameless Mask & J-Snorkel, Carbon-Fiber Long-Blade Bi-Fins, and Submersible Slate with 0.25m² Benthic Quadrat Frame.",
    ]

    resolved_site = site
    if not resolved_site:
        site_id: Optional[str] = None
        if isinstance(intent, KelpFreedivingIntent) and intent.site_id:
            site_id = intent.site_id
        elif isinstance(intent, str):
            if detect_kelp_freediving_intent(intent):
                extracted = extract_kelp_freediving_intent(intent)
                site_id = extracted.site_id
        if site_id:
            resolved_site = get_kelp_freediving_site(site_id)

    if resolved_site:
        lines.append(
            f"- Focused Kelp Forest Site: {resolved_site.title} ({resolved_site.region}, Range: {resolved_site.range}, Max Depth: {resolved_site.max_depth_meters}m, Stratum: {resolved_site.dominant_stratum}, Taxa: {resolved_site.primary_taxa}, Trophic State: {resolved_site.trophic_state})"
        )

    if result:
        lines.append(
            f"- Calculated Kelp Freediving Telemetry: Neutral Buoyancy Depth={result.neutral_buoyancy_depth_meters}m, Lead Weight={result.recommended_lead_weight_kg}kg, Safe Bottom Time={result.safe_bottom_time_seconds}s, Entanglement Risk={result.stipe_entanglement_risk_percent}%, Holdfast Biodiversity={result.holdfast_biodiversity_index}, Status={result.safety_status}"
        )

    if gear:
        gear_names = ", ".join(g.name for g in gear)
        lines.append(f"- Mandatory Gear Items: {gear_names}")

    return "\n".join(lines)


def kelp_freediving_tool(
    query: Optional[KelpFreedivingQuery] = None,
    action: Optional[str] = None,
    site_id: Optional[str] = None,
    stratum: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_dynamics") or query is not None:
        calc_q = query or KelpFreedivingQuery(
            site_id=site_id or "point-lobos-carmel-pinnacles"
        )
        res = calculate_kelp_freediving_dynamics(calc_q)
        formatted = format_kelp_freediving_response("calculate", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_kelp_freediving_gear()
        formatted = format_kelp_freediving_response("gear_checklist", checklist)
        return dict(formatted._data)

    if action in ("get_site", "site_detail", "detail") and site_id:
        site = get_kelp_freediving_site(site_id)
        if site:
            formatted = format_kelp_freediving_response("get_site", site)
            return dict(formatted._data)

    sites = get_kelp_freediving_sites(stratum=stratum)
    formatted = format_kelp_freediving_response("catalog", sites)
    return dict(formatted._data)
