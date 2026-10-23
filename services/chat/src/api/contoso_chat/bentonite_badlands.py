"""Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation Guide.

Domain calculator, site catalog, gear checklist, and intent detection for navigating
expansive smectite/montmorillonite ('popcorn-clay' / 'gumbo') badlands mounds,
caprock hoodoo pedestals, subterranean soil-piping tunnel bridges, and dispersive
sodium-clay rill gullies across arid and semi-arid badlands basins.
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from enum import Enum
from typing import Any


class BentoniteMorphology(str, Enum):
    """Geomorphic classification of bentonite badlands landforms and piping systems."""

    POPCORN_CRUST_MOUND = "popcorn-crust-mound"
    CAPROCK_HOODOO_PEDESTAL = "caprock-hoodoo-pedestal"
    PIPING_TUNNEL_BRIDGE = "piping-tunnel-bridge"
    DISPERSIVE_RUTH_GULLY = "dispersive-ruth-gully"
    DISPERSIVE_RILL_GULLY = "dispersive-rill-gully"


class SmectiteSwellingGrade(str, Enum):
    """Mineralogical smectite/montmorillonite hydration expansion and thixotropic gumbo grade."""

    LOW_CALCIUM_SMECTITE = "low-calcium-smectite"
    MODERATE_MONTMORILLONITE = "moderate-montmorillonite"
    HIGH_SODIUM_BENTONITE = "high-sodium-bentonite"
    EXTREME_THIXOTROPIC_GUMBO = "extreme-thixotropic-gumbo"


class BentoniteRiskLevel(str, Enum):
    """Risk classification for bentonite badlands & piping-tunnel navigation."""

    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class _AttrDict(dict[str, Any]):
    """Dictionary subclass supporting attribute-style access and Pydantic-compatible helpers."""

    def __getattr__(self, item: str) -> Any:
        try:
            return self[item]
        except KeyError as exc:
            raise AttributeError(
                f"'{type(self).__name__}' object has no attribute '{item}'"
            ) from exc

    def __setattr__(self, key: str, value: Any) -> None:
        self[key] = value

    def model_dump(self) -> dict[str, Any]:
        """Return a standard dictionary copy for Pydantic compatibility."""
        return dict(self)


class BentoniteBadlandsSite(_AttrDict):
    """Dictionary subclass supporting attribute-style access for bentonite badlands sites."""


class BentoniteBadlandsInput(_AttrDict):
    """Input model for deterministic bentonite badlands and piping-tunnel calculations."""

    def __init__(
        self,
        data: dict[str, Any] | None = None,
        *,
        smectite_free_swell_index_pct: float = 180.0,
        popcorn_crust_thickness_cm: float = 12.0,
        piping_roof_thickness_cm: float = 38.0,
        rainfall_intensity_mm_hr: float = 14.0,
        slope_angle_deg: float = 28.0,
        sodium_adsorption_ratio_sar: float = 18.0,
        hiker_load_kg: float = 85.0,
        morphology: str = BentoniteMorphology.POPCORN_CRUST_MOUND.value,
        swelling_grade: str = SmectiteSwellingGrade.HIGH_SODIUM_BENTONITE.value,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> None:
        merged: dict[str, Any] = {}
        if data:
            merged.update(data)
        merged.update(kwargs)

        swell = float(
            merged.get(
                "smectite_free_swell_index_pct",
                merged.get(
                    "free_swell_index_pct",
                    merged.get("swell_index_pct", smectite_free_swell_index_pct),
                ),
            )
        )
        crust = float(
            merged.get(
                "popcorn_crust_thickness_cm",
                merged.get("crust_thickness_cm", popcorn_crust_thickness_cm),
            )
        )
        roof = float(
            merged.get(
                "piping_roof_thickness_cm",
                merged.get(
                    "tunnel_roof_thickness_cm",
                    merged.get("roof_thickness_cm", piping_roof_thickness_cm),
                ),
            )
        )
        rain = float(
            merged.get(
                "rainfall_intensity_mm_hr",
                merged.get(
                    "rain_intensity_mm_hr",
                    merged.get("surface_moisture_pct", rainfall_intensity_mm_hr),
                ),
            )
        )
        slope = float(
            merged.get(
                "slope_angle_deg",
                merged.get(
                    "ravine_slope_angle_deg",
                    merged.get("badlands_slope_angle_deg", slope_angle_deg),
                ),
            )
        )
        sar = float(
            merged.get(
                "sodium_adsorption_ratio_sar",
                merged.get("sar", sodium_adsorption_ratio_sar),
            )
        )
        load = float(
            merged.get(
                "hiker_load_kg",
                merged.get("total_load_kg", merged.get("pack_mass_kg", hiker_load_kg)),
            )
        )
        morph = str(merged.get("morphology", morphology))
        grade = str(merged.get("swelling_grade", swelling_grade))
        sid = merged.get("site_id", site_id)

        super().__init__(
            {
                "smectite_free_swell_index_pct": swell,
                "free_swell_index_pct": swell,
                "popcorn_crust_thickness_cm": crust,
                "piping_roof_thickness_cm": roof,
                "rainfall_intensity_mm_hr": rain,
                "slope_angle_deg": slope,
                "sodium_adsorption_ratio_sar": sar,
                "hiker_load_kg": load,
                "morphology": morph,
                "swelling_grade": grade,
                "site_id": sid,
            }
        )


class BentoniteBadlandsResult(_AttrDict):
    """Result model for deterministic bentonite badlands and piping-tunnel calculations."""


class BentoniteGearItem(_AttrDict):
    """Gear checklist item for arid badlands bentonite & piping-tunnel navigation."""


BENTONITE_BADLANDS_SITES: list[BentoniteBadlandsSite] = [
    BentoniteBadlandsSite(
        {
            "id": "badlands-sage-creek-chadron-south-dakota",
            "name": "Badlands National Park Sage Creek & Chadron Smectite Pinnacles",
            "region": "South Dakota (White River Badlands)",
            "country": "USA",
            "morphology": BentoniteMorphology.POPCORN_CRUST_MOUND.value,
            "swelling_grade": SmectiteSwellingGrade.HIGH_SODIUM_BENTONITE.value,
            "deposit_type": BentoniteMorphology.POPCORN_CRUST_MOUND.value,
            "substrate_type": BentoniteMorphology.POPCORN_CRUST_MOUND.value,
            "lithology": "Oligocene Chadron & Brule Formation Volcanic-Ash Sodium Smectite",
            "difficulty": "challenging",
            "elevation_range": "750–990 m (White River & Sage Creek Wilderness Basin)",
            "max_elevation_m": 990,
            "default_smectite_free_swell_index_pct": 240.0,
            "default_popcorn_crust_thickness_cm": 14.0,
            "default_piping_roof_thickness_cm": 32.0,
            "default_rainfall_intensity_mm_hr": 18.0,
            "default_slope_angle_deg": 31.0,
            "default_sodium_adsorption_ratio_sar": 24.0,
            "default_hiker_load_kg": 85.0,
            "primary_hazard": (
                "Desiccated polygonal 'popcorn-clay' (Oligocene Chadron Formation sodium-montmorillonite) "
                "crusts concealing subcutaneous desiccation cracks and 1–3 m deep vertical soil-piping "
                "swallow holes, transforming within 5 minutes of convective rain into zero-friction "
                "thixotropic 'badlands gumbo' that balls 3–5 kg of clay onto each boot."
            ),
            "navigation_strategy": (
                "Route along pale vegetated sod tables ('sod-table prairies') or consolidated white "
                "carbonate/ash marker beds on drainage divides; avoid stepping into dark-grey polygonal "
                "popcorn-clay swales and maintain a >= 4 m setback from blind gully sinks in Sage Creek."
            ),
            "crossing_strategy": (
                "Cross incised badlands washes only on coarse chalcedony/flint lag gravel bars; test "
                "bridged drainage floors with a graduated T-handle sounding probe before committing weight."
            ),
            "piping_avoidance_protocol": (
                "Treat every blind depression, sagebrush-choked funnel pit, and discontinuous gully channel "
                "as a hollow soil-piping roof; never walk along the axis of an underground pipe between "
                "an upper swallow hole and a lower basal outlet."
            ),
            "gumbo_traction_protocol": (
                "Vacate bare Chadron and Brule clay slopes immediately when Great Plains anvil cumulus "
                "cells approach; carry an aluminum mud-balling boot scraper and wide micro-platform "
                "sandals/overshoes to shed adhesive sodium-bentonite gumbo."
            ),
            "conservation_protocol": (
                "Never chip or excavate exposed Oligocene vertebrate fossils (titanotheres, oreodonts) "
                "from Chadron mounds—record GPS coordinates and photograph in situ for Badlands NPS "
                "paleontologists; protect fragile prairie-table cryptobiotic rims."
            ),
            "field_notes": (
                "The Chadron Formation ('haystack mounds') weathers from Eocene-Oligocene volcanic ash "
                "into high-swelling sodium smectite whose outer 10–18 cm expands and contracts up to "
                "300% by volume, creating the classic rounded popcorn-crust microtopography."
            ),
        }
    ),
    BentoniteBadlandsSite(
        {
            "id": "cainville-factory-butte-mancos-shale-utah",
            "name": "Cainville Reef & North Cainville Mesa Mancos-Morrison Bentonite Hills",
            "region": "Utah (Capitol Reef / Hanksville Badlands)",
            "country": "USA",
            "morphology": BentoniteMorphology.CAPROCK_HOODOO_PEDESTAL.value,
            "swelling_grade": SmectiteSwellingGrade.EXTREME_THIXOTROPIC_GUMBO.value,
            "deposit_type": BentoniteMorphology.CAPROCK_HOODOO_PEDESTAL.value,
            "substrate_type": BentoniteMorphology.CAPROCK_HOODOO_PEDESTAL.value,
            "lithology": "Jurassic Morrison (Brushy Basin Member) & Cretaceous Mancos Shale Bentonite",
            "difficulty": "extreme",
            "elevation_range": "1,310–1,920 m (Fremont River & Cathedral Valley / Cainville Badlands)",
            "max_elevation_m": 1920,
            "default_smectite_free_swell_index_pct": 340.0,
            "default_popcorn_crust_thickness_cm": 18.0,
            "default_piping_roof_thickness_cm": 28.0,
            "default_rainfall_intensity_mm_hr": 24.0,
            "default_slope_angle_deg": 36.0,
            "default_sodium_adsorption_ratio_sar": 31.0,
            "default_hiker_load_kg": 88.0,
            "primary_hazard": (
                "Variegated purple-grey Jurassic Brushy Basin and Blue Gate Mancos bentonite domes "
                "where fluffy 15–22 cm popcorn-crust veneers slide off underlying overconsolidated "
                "shale cores on >30° slopes, combined with undercut sandstone caprock hoodoos and "
                "impassable thixotropic gumbo flats along the Fremont and Muddy Creek crossings."
            ),
            "navigation_strategy": (
                "Follow indurated Emery/Ferron sandstone hogback ribs or Dakota conglomerate caprock "
                "benches; when traversing variegated bentonite hills, step in shallow micro-rills "
                "where loose popcorn crust has been flushed down to firmer shale sub-crust."
            ),
            "crossing_strategy": (
                "Do not attempt off-trail ascents of >34° Mancos or Brushy Basin clay cones where "
                "loose popcorn-clay granules act as ball bearings over hard basal mudstone; skirt "
                "around undercut sandstone hoodoo pedestals by at least 2x pedestal height."
            ),
            "piping_avoidance_protocol": (
                "Probe all colluvial aprons at the base of Cainville Reef cliffs where runoff dives "
                "beneath sandstone talus blocks into dispersive smectite piping tunnels."
            ),
            "gumbo_traction_protocol": (
                "Monitor Colorado Plateau monsoon buildup closely—even 3 mm of rain turns Hanksville "
                "and Cathedral Valley bentonite tracks into slick plastic grease that immobilizes "
                "boots and 4x4 tires for 24–48 hours."
            ),
            "conservation_protocol": (
                "Stay strictly off untracked variegated bentonite domes and Factory Butte closure "
                "zones; boot and tire ruts in desiccated popcorn crust disrupt natural crust healing "
                "for decades and accelerate dispersive gully incision."
            ),
            "field_notes": (
                "The Brushy Basin Member of the Morrison Formation and Blue Gate Member of the Mancos "
                "Shale contain some of the highest-swelling sodium-montmorillonite volcanic ash beds "
                "on the Colorado Plateau, producing extraterrestrial banded mounds and deep piping shafts."
            ),
        }
    ),
    BentoniteBadlandsSite(
        {
            "id": "dinosaur-red-deer-bearpaw-badlands-alberta-canada",
            "name": "Dinosaur Provincial Park & Red Deer River Bearpaw Bentonite Badlands",
            "region": "Alberta (Red Deer River Valley)",
            "country": "Canada",
            "morphology": BentoniteMorphology.PIPING_TUNNEL_BRIDGE.value,
            "swelling_grade": SmectiteSwellingGrade.HIGH_SODIUM_BENTONITE.value,
            "deposit_type": BentoniteMorphology.PIPING_TUNNEL_BRIDGE.value,
            "substrate_type": BentoniteMorphology.PIPING_TUNNEL_BRIDGE.value,
            "lithology": "Upper Cretaceous Dinosaur Park, Oldman & Bearpaw Formation Bentonite-Mudstone",
            "difficulty": "extreme",
            "elevation_range": "620–735 m (Red Deer River Coulee & Badlands Escarpment)",
            "max_elevation_m": 735,
            "default_smectite_free_swell_index_pct": 285.0,
            "default_popcorn_crust_thickness_cm": 15.0,
            "default_piping_roof_thickness_cm": 22.0,
            "default_rainfall_intensity_mm_hr": 21.0,
            "default_slope_angle_deg": 33.0,
            "default_sodium_adsorption_ratio_sar": 28.0,
            "default_hiker_load_kg": 85.0,
            "primary_hazard": (
                "Extensive subterranean pseudokarst soil-piping labyrinths and thin (<25 cm) clay "
                "natural bridges spanning 2–6 m deep vertical shafts eroded along dispersive sodium-rich "
                "Dinosaur Park and Bearpaw bentonite contacts, alongside slick coulee walls."
            ),
            "navigation_strategy": (
                "Navigate along open ironstone-capped benches or flat coulee bottomlands well clear of "
                "scarp toes; probe ahead with a 150 cm steel/carbon sounding rod whenever crossing "
                "saddles between badlands buttes or approaching blind sinkhole chains."
            ),
            "crossing_strategy": (
                "Never cross narrow clay land-bridges between adjacent sinkhole funnels; detour upslope "
                "to the prairie rim or downslope below the basal piping resurgence."
            ),
            "piping_avoidance_protocol": (
                "Enforce a minimum 5 m standoff from all vertical piping shafts ('sinkhole chimneys') "
                "and cavernous gully headcuts; listen for subterranean water trickle or hollow drum-like "
                "footstep acoustics indicating a thin dry-crust roof over a void."
            ),
            "gumbo_traction_protocol": (
                "Carry non-clogging traction cleats and a flat poly/aluminum mud scraper; wet Bearpaw "
                "and Dinosaur Park bentonite forms a soap-slick film over steep coulee ledges that "
                "causes uncontrolled sliding into piping shafts."
            ),
            "conservation_protocol": (
                "Dinosaur Provincial Park is a UNESCO World Heritage Site: stay within designated "
                "trail/guided zones unless holding a Park Research Permit, never disturb surface bone "
                "scatters or ironstone pedestals, and avoid collapsing micro-piping arches."
            ),
            "field_notes": (
                "High exchangeable sodium percentages (ESP > 20%) in the Upper Cretaceous Dinosaur Park "
                "and Bearpaw formations cause rapid clay deflocculation during prairie cloudbursts, "
                "excavating multi-level subterranean piping networks rivaling true karst."
            ),
        }
    ),
    BentoniteBadlandsSite(
        {
            "id": "bardenas-reales-pisquerra-piping-navarra-spain",
            "name": "Bardenas Reales & Rallón-Pisquerra Evaporite-Smectite Piping Badlands",
            "region": "Navarra (Ebro Basin)",
            "country": "Spain",
            "morphology": BentoniteMorphology.DISPERSIVE_RUTH_GULLY.value,
            "swelling_grade": SmectiteSwellingGrade.MODERATE_MONTMORILLONITE.value,
            "deposit_type": BentoniteMorphology.DISPERSIVE_RUTH_GULLY.value,
            "substrate_type": BentoniteMorphology.DISPERSIVE_RUTH_GULLY.value,
            "lithology": "Miocene Tudela Formation Calcareous-Gypsiferous Smectite-Illite Marls",
            "difficulty": "challenging",
            "elevation_range": "280–659 m (Bardena Blanca — El Rallón, Pisquerra & Castildetierra)",
            "max_elevation_m": 659,
            "default_smectite_free_swell_index_pct": 165.0,
            "default_popcorn_crust_thickness_cm": 11.0,
            "default_piping_roof_thickness_cm": 29.0,
            "default_rainfall_intensity_mm_hr": 22.0,
            "default_slope_angle_deg": 29.0,
            "default_sodium_adsorption_ratio_sar": 21.0,
            "default_hiker_load_kg": 82.0,
            "primary_hazard": (
                "Labyrinthine dispersive rill-and-gully ('barrancos') networks and collapsed piping "
                "tunnels ('simas de sufusión') up to 4 m deep cutting across Bardena Blanca alluvial "
                "pediments, where sudden Ebro Basin convective storms trigger flash mud-slurry surges "
                "and undermine tabular sandstone-limestone caprock rims."
            ),
            "navigation_strategy": (
                "Follow broad gravel-armored glacis ridges and authorized Bardena Blanca perimeter tracks; "
                "never descend into unmapped dispersive barranco floors or traverse narrow marl-clay "
                "knife-edge divides around Pisquerra and El Rallón."
            ),
            "crossing_strategy": (
                "Cross incised barrancos only at engineered ford aprons or wide braided silt-gravel "
                "confluences; stay >= 6 m back from undercut vertical barranco walls where tension "
                "cracks parallel the rim."
            ),
            "piping_avoidance_protocol": (
                "Watch for linear alignments of small surface collapse holes ('hoyas de piping') "
                "extending 10–30 m back from barranco walls—these mark active subcutaneous suffosion "
                "tunnels draining into the gully."
            ),
            "gumbo_traction_protocol": (
                "Halt transit immediately if Ebro Valley thunderstorms wet the Miocene marl-smectite "
                "surface; carry a stiff mud-clearing spatula and trek poles with wide 90 mm baskets "
                "to prevent sinking into softened suffosion aprons."
            ),
            "conservation_protocol": (
                "Comply with Bardenas Reales Natural Park & UNESCO Biosphere Reserve regulations: "
                "respect seasonal raptor nesting closures (Egyptian vulture, Bonelli's eagle) around "
                "El Rallón and Pisquerra between February and August, and exit before dusk."
            ),
            "field_notes": (
                "Bardenas Reales is one of Europe's premier dispersive piping badlands, where high "
                "sodium adsorption ratios (SAR) and alternating desiccation-cloudburst cycles carve "
                "spectacular tabular cabezos (Castildetierra, Pisquerra) and deep suffosion tunnels."
            ),
        }
    ),
]

BENTONITE_SITES = BENTONITE_BADLANDS_SITES

BENTONITE_BADLANDS_GEAR_CHECKLIST: list[BentoniteGearItem] = [
    BentoniteGearItem(
        {
            "id": "graduated-soil-piping-sounding-probe",
            "item": "Graduated 150 cm Carbon/Steel T-Handle Soil-Piping Cavity Sounding Probe",
            "name": "Graduated 150 cm Carbon/Steel T-Handle Soil-Piping Cavity Sounding Probe",
            "category": "piping_detection",
            "priority": "essential",
            "mandatory": True,
            "weight_g": 420,
            "reason": (
                "Detects hollow subterranean suffosion/piping tunnels and measures dry popcorn-crust "
                "roof thickness (<35 cm critical punch-through threshold) before stepping onto "
                "swale floors or natural clay bridges."
            ),
            "rationale": (
                "Detects hollow subterranean suffosion/piping tunnels and measures dry popcorn-crust "
                "roof thickness (<35 cm critical punch-through threshold) before stepping onto "
                "swale floors or natural clay bridges."
            ),
        }
    ),
    BentoniteGearItem(
        {
            "id": "anodized-gumbo-mud-boot-scraper",
            "item": "Anodized Aluminum & UHMWPE 'Badlands Gumbo' Boot-Sole Scraper Spatula",
            "name": "Anodized Aluminum & UHMWPE 'Badlands Gumbo' Boot-Sole Scraper Spatula",
            "category": "traction_maintenance",
            "priority": "essential",
            "mandatory": True,
            "weight_g": 165,
            "reason": (
                "Clears adhesive hydrated sodium-bentonite clay ('gumbo') that rapidly accretes "
                "2–5 kg per boot and packs Vibram lug channels into zero-friction clay skis."
            ),
            "rationale": (
                "Clears adhesive hydrated sodium-bentonite clay ('gumbo') that rapidly accretes "
                "2–5 kg per boot and packs Vibram lug channels into zero-friction clay skis."
            ),
        }
    ),
    BentoniteGearItem(
        {
            "id": "wide-spaced-mud-shedding-approach-boots",
            "item": "Self-Cleaning Wide-Lug Approach Boots with Sealed Kevlar Popcorn-Crust Gaiters",
            "name": "Self-Cleaning Wide-Lug Approach Boots with Sealed Kevlar Popcorn-Crust Gaiters",
            "category": "footwear",
            "priority": "essential",
            "mandatory": True,
            "weight_g": 1180,
            "reason": (
                "Wide tapered lug geometry sheds plastic montmorillonite mud while high-cut gaiters "
                "keep abrasive desiccated popcorn-clay granules and selenite shards out of boot collars."
            ),
            "rationale": (
                "Wide tapered lug geometry sheds plastic montmorillonite mud while high-cut gaiters "
                "keep abrasive desiccated popcorn-clay granules and selenite shards out of boot collars."
            ),
        }
    ),
    BentoniteGearItem(
        {
            "id": "trekking-poles-badlands-baskets",
            "item": "Dual-Lock Chromoly Trekking Poles with 95 mm Suffosion-Basket Collars",
            "name": "Dual-Lock Chromoly Trekking Poles with 95 mm Suffosion-Basket Collars",
            "category": "stability",
            "priority": "essential",
            "mandatory": True,
            "weight_g": 540,
            "reason": (
                "Prevents pole tips from plunging into desiccation polygons and provides 4-point "
                "balance on ball-bearing dry popcorn crusts over hard shale cores."
            ),
            "rationale": (
                "Prevents pole tips from plunging into desiccation polygons and provides 4-point "
                "balance on ball-bearing dry popcorn crusts over hard shale cores."
            ),
        }
    ),
    BentoniteGearItem(
        {
            "id": "lidar-hillshade-gnss-piping-navigator",
            "item": "Dual-Frequency GNSS Receiver with High-Resolution LiDAR Sinkhole/Barranco Hillshade",
            "name": "Dual-Frequency GNSS Receiver with High-Resolution LiDAR Sinkhole/Barranco Hillshade",
            "category": "navigation",
            "priority": "essential",
            "mandatory": True,
            "weight_g": 280,
            "reason": (
                "Identifies continuous caprock divide ridges, sod-table islands, and blind piping-sink "
                "alignments in featureless dendritic badlands mazes."
            ),
            "rationale": (
                "Identifies continuous caprock divide ridges, sod-table islands, and blind piping-sink "
                "alignments in featureless dendritic badlands mazes."
            ),
        }
    ),
    BentoniteGearItem(
        {
            "id": "static-rescue-webbing-throw-tether",
            "item": "20 m Tubular Aramid/Nylon Rescue Webbing & Pipe-Pit Extrication Stirrup",
            "name": "20 m Tubular Aramid/Nylon Rescue Webbing & Pipe-Pit Extrication Stirrup",
            "category": "rescue",
            "priority": "essential",
            "mandatory": True,
            "weight_g": 610,
            "reason": (
                "Enables safe standoff haul and rim-distributed extrication if a team member punches "
                "through a concealed piping-tunnel bridge into a bell-shaped suffosion shaft."
            ),
            "rationale": (
                "Enables safe standoff haul and rim-distributed extrication if a team member punches "
                "through a concealed piping-tunnel bridge into a bell-shaped suffosion shaft."
            ),
        }
    ),
]


def get_all_sites() -> list[BentoniteBadlandsSite]:
    """Return all 4 reference sites in the arid badlands bentonite & piping-tunnel catalog."""
    return [BentoniteBadlandsSite(site) for site in BENTONITE_BADLANDS_SITES]


def get_bentonite_badlands_site_by_id(site_id: str) -> BentoniteBadlandsSite | None:
    """Return a single bentonite badlands site by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in BENTONITE_BADLANDS_SITES:
        if site["id"].lower() == target:
            return BentoniteBadlandsSite(site)
    return None


def get_site_by_id(site_id: str) -> BentoniteBadlandsSite | None:
    """Alias for get_bentonite_badlands_site_by_id."""
    return get_bentonite_badlands_site_by_id(site_id)


def filter_bentonite_badlands_sites(
    country: str | None = None,
    morphology: str | None = None,
    swelling_grade: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
    region: str | None = None,
    deposit_type: str | None = None,
    substrate_type: str | None = None,
) -> list[BentoniteBadlandsSite]:
    """Filter the bentonite badlands catalog by country, morphology, swelling_grade, difficulty, region, or search."""
    effective_morphology = morphology or deposit_type or substrate_type
    results: list[BentoniteBadlandsSite] = []
    for site in BENTONITE_BADLANDS_SITES:
        if country and site["country"].lower() != country.strip().lower():
            continue
        if region and region.strip().lower() not in site["region"].lower():
            continue
        if (
            effective_morphology
            and effective_morphology.strip().lower() not in site["morphology"].lower()
        ):
            continue
        if (
            swelling_grade
            and swelling_grade.strip().lower() not in site["swelling_grade"].lower()
        ):
            continue
        if difficulty and site["difficulty"].lower() != difficulty.strip().lower():
            continue
        if search:
            q = search.strip().lower()
            searchable = " ".join(
                [
                    str(site.get("id", "")),
                    str(site.get("name", "")),
                    str(site.get("country", "")),
                    str(site.get("region", "")),
                    str(site.get("morphology", "")),
                    str(site.get("swelling_grade", "")),
                    str(site.get("lithology", "")),
                    str(site.get("primary_hazard", "")),
                    str(site.get("field_notes", "")),
                ]
            ).lower()
            if q not in searchable:
                continue
        results.append(BentoniteBadlandsSite(site))
    return results


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    swelling_grade: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
    region: str | None = None,
    deposit_type: str | None = None,
    substrate_type: str | None = None,
) -> list[BentoniteBadlandsSite]:
    """Alias for filter_bentonite_badlands_sites."""
    return filter_bentonite_badlands_sites(
        country=country,
        morphology=morphology,
        swelling_grade=swelling_grade,
        difficulty=difficulty,
        search=search,
        region=region,
        deposit_type=deposit_type,
        substrate_type=substrate_type,
    )


def get_bentonite_badlands_gear_checklist(
    input_or_morphology: BentoniteBadlandsInput | dict[str, Any] | str | None = None,
    *,
    morphology: str | None = None,
    swelling_grade: str | None = None,
    risk_level: str | None = None,
    rainfall_intensity_mm_hr: float | None = None,
) -> list[BentoniteGearItem]:
    """Return the 6-item essential gear checklist for bentonite badlands & piping-tunnel navigation."""
    _ = (input_or_morphology, morphology, swelling_grade, risk_level, rainfall_intensity_mm_hr)
    return [BentoniteGearItem(item) for item in BENTONITE_BADLANDS_GEAR_CHECKLIST]


def get_gear_checklist(
    input_or_morphology: BentoniteBadlandsInput | dict[str, Any] | str | None = None,
    **kwargs: Any,
) -> list[BentoniteGearItem]:
    """Alias for get_bentonite_badlands_gear_checklist."""
    return get_bentonite_badlands_gear_checklist(input_or_morphology, **kwargs)


def calculate_bentonite_badlands(
    input_data: BentoniteBadlandsInput | dict[str, Any] | None = None,
    *,
    smectite_free_swell_index_pct: float = 180.0,
    popcorn_crust_thickness_cm: float = 12.0,
    piping_roof_thickness_cm: float = 38.0,
    rainfall_intensity_mm_hr: float = 14.0,
    slope_angle_deg: float = 28.0,
    sodium_adsorption_ratio_sar: float = 18.0,
    hiker_load_kg: float = 85.0,
    morphology: str = BentoniteMorphology.POPCORN_CRUST_MOUND.value,
    swelling_grade: str = SmectiteSwellingGrade.HIGH_SODIUM_BENTONITE.value,
    site_id: str | None = None,
    **kwargs: Any,
) -> BentoniteBadlandsResult:
    """Calculate piping roof punch-through risk, wet gumbo traction loss, boot mud accretion, and safe pipe-bridge setback."""
    if isinstance(input_data, (BentoniteBadlandsInput, dict)):
        parsed = BentoniteBadlandsInput(input_data, **kwargs)
    else:
        parsed = BentoniteBadlandsInput(
            smectite_free_swell_index_pct=smectite_free_swell_index_pct,
            popcorn_crust_thickness_cm=popcorn_crust_thickness_cm,
            piping_roof_thickness_cm=piping_roof_thickness_cm,
            rainfall_intensity_mm_hr=rainfall_intensity_mm_hr,
            slope_angle_deg=slope_angle_deg,
            sodium_adsorption_ratio_sar=sodium_adsorption_ratio_sar,
            hiker_load_kg=hiker_load_kg,
            morphology=morphology,
            swelling_grade=swelling_grade,
            site_id=site_id,
            **kwargs,
        )

    swell = float(parsed["smectite_free_swell_index_pct"])
    crust = float(parsed["popcorn_crust_thickness_cm"])
    roof = float(parsed["piping_roof_thickness_cm"])
    rain = float(parsed["rainfall_intensity_mm_hr"])
    slope = float(parsed["slope_angle_deg"])
    sar = float(parsed["sodium_adsorption_ratio_sar"])
    load = float(parsed["hiker_load_kg"])
    morph = str(parsed["morphology"])
    grade = str(parsed["swelling_grade"])

    if not (20.0 <= swell <= 800.0):
        raise ValueError(
            "smectite_free_swell_index_pct must be between 20.0 and 800.0 %"
        )
    if not (1.0 <= crust <= 40.0):
        raise ValueError(
            "popcorn_crust_thickness_cm must be between 1.0 and 40.0 cm"
        )
    if not (5.0 <= roof <= 150.0):
        raise ValueError(
            "piping_roof_thickness_cm must be between 5.0 and 150.0 cm"
        )
    if not (0.0 <= rain <= 120.0):
        raise ValueError(
            "rainfall_intensity_mm_hr must be between 0.0 and 120.0 mm/hr"
        )
    if not (2.0 <= slope <= 65.0):
        raise ValueError(
            "slope_angle_deg must be between 2.0 and 65.0 degrees"
        )
    if not (1.0 <= sar <= 60.0):
        raise ValueError(
            "sodium_adsorption_ratio_sar must be between 1.0 and 60.0"
        )
    if not (35.0 <= load <= 160.0):
        raise ValueError(
            "hiker_load_kg must be between 35.0 and 160.0 kg"
        )

    # Normalized factors (0.0 to 1.0)
    swell_norm = (swell - 20.0) / 780.0
    crust_norm = (crust - 1.0) / 39.0
    thin_roof_norm = max(0.0, min(1.0, (150.0 - roof) / 145.0))
    critical_roof_boost = max(0.0, (35.0 - min(35.0, roof)) / 30.0)
    rain_norm = rain / 120.0
    wet_surface_boost = min(1.0, rain / 25.0)
    slope_norm = (slope - 2.0) / 63.0
    sar_norm = (sar - 1.0) / 59.0
    load_norm = (load - 35.0) / 125.0

    morph_pipe_bonus = 8.0 if "piping" in morph or "gully" in morph else 0.0
    grade_gumbo_bonus = (
        10.0
        if "extreme" in grade
        else (5.0 if "high-sodium" in grade else 0.0)
    )

    # 1. Effective crust bearing capacity (kPa)
    effective_crust_bearing_kpa = round(
        max(
            6.5,
            min(
                185.0,
                (14.0 + 1.15 * roof)
                * (1.0 - 0.52 * wet_surface_boost)
                * (1.0 - 0.25 * sar_norm)
                * (1.0 - 0.18 * swell_norm),
            ),
        ),
        1,
    )

    # 2. Subterranean piping roof punch-through risk (%)
    piping_roof_punch_through_risk_pct = round(
        min(
            99.0,
            max(
                3.0,
                4.0
                + thin_roof_norm * 30.0
                + critical_roof_boost * 24.0
                + sar_norm * 14.0
                + wet_surface_boost * 14.0
                + load_norm * 8.0
                + swell_norm * 6.0
                + morph_pipe_bonus,
            ),
        ),
        1,
    )

    # 3. Wet thixotropic gumbo traction loss (%)
    wet_gumbo_traction_loss_pct = round(
        min(
            99.0,
            max(
                4.0,
                6.0
                + wet_surface_boost * 36.0
                + rain_norm * 12.0
                + swell_norm * 18.0
                + slope_norm * 18.0
                + crust_norm * 6.0
                + grade_gumbo_bonus,
            ),
        ),
        1,
    )

    # 4. Adhesive boot mud accretion mass (kg per pair of boots)
    boot_mud_accretion_kg = round(
        min(
            8.5,
            max(
                0.1,
                0.15
                + wet_surface_boost
                * (1.6 + swell_norm * 2.8 + sar_norm * 1.4 + crust_norm * 0.9),
            ),
        ),
        2,
    )

    # 5. Safe pipe-bridge & gully-rim setback distance (m)
    safe_pipe_bridge_setback_m = round(
        min(
            28.0,
            max(
                2.0,
                2.2
                + thin_roof_norm * 7.5
                + critical_roof_boost * 5.5
                + sar_norm * 4.5
                + wet_surface_boost * 4.0
                + slope_norm * 3.5,
            ),
        ),
        1,
    )

    if (
        piping_roof_punch_through_risk_pct >= 72.0
        or wet_gumbo_traction_loss_pct >= 75.0
        or (roof <= 18.0 and sar >= 22.0)
        or (rain >= 25.0 and swell >= 260.0)
    ):
        risk_level = BentoniteRiskLevel.CRITICAL.value
        safety_status = (
            "CRITICAL — IMMINENT PIPING-TUNNEL ROOF COLLAPSE & THIXOTROPIC GUMBO LOCKOUT"
        )
        navigation_strategy = (
            f"Abort all badlands gully-floor, swale, and steep (>25°) bentonite mound travel; "
            f"retreat >= {safe_pipe_bridge_setback_m:.1f} m back from blind sinkholes and barranco rims "
            "onto vegetated sod tables, sandstone caprock benches, or coarse gravel ridges."
        )
    elif (
        piping_roof_punch_through_risk_pct >= 48.0
        or wet_gumbo_traction_loss_pct >= 50.0
        or roof <= 28.0
        or rain >= 12.0
        or slope >= 30.0
    ):
        risk_level = BentoniteRiskLevel.HIGH.value
        safety_status = (
            "HIGH CAUTION — DISPERSIVE SMECTITE PIPING BRIDGES & SLICK POPCORN-CLAY VENEER"
        )
        navigation_strategy = (
            f"Maintain at least a {safe_pipe_bridge_setback_m:.1f} m setback from sinkhole funnels "
            "and gully headcuts; probe all drainage saddles with a 150 cm T-handle rod and carry "
            "an aluminum gumbo boot scraper."
        )
    elif (
        piping_roof_punch_through_risk_pct >= 28.0
        or wet_gumbo_traction_loss_pct >= 30.0
    ):
        risk_level = BentoniteRiskLevel.MODERATE.value
        safety_status = (
            "MODERATE — DESICCATED POPCORN CRUST WITH LOCALIZED SUBSURFACE SUFFOSION PIPES"
        )
        navigation_strategy = (
            f"Keep a >= {safe_pipe_bridge_setback_m:.1f} m buffer from blind depressions and undercut "
            "hoodoo pedestals; step in shallow micro-rills on slopes >22° where loose popcorn granules "
            "are thinner."
        )
    else:
        risk_level = BentoniteRiskLevel.LOW.value
        safety_status = (
            "LOW — DRY CONSOLIDATED BADLANDS BENCH WITH THICK ROOF OVERBURDEN"
        )
        navigation_strategy = (
            "Proceed along established ridge divides and gravel-armored washes while visually scanning "
            "for linear sinkhole alignments and afternoon convective storm buildup."
        )

    piping_avoidance_protocol = (
        f"Enforce a >= {safe_pipe_bridge_setback_m:.1f} m lateral standoff from blind swallow holes "
        f"and suffosion chimneys (roof thickness {roof:.0f} cm, bearing capacity {effective_crust_bearing_kpa:.1f} kPa); "
        "never walk along the surface axis connecting upper sink funnels to lower gully outlets."
    )
    gumbo_traction_protocol = (
        f"Expect ~{boot_mud_accretion_kg:.2f} kg of adhesive sodium-smectite accretion per boot pair "
        f"at {rain:.1f} mm/hr rainfall; scrape Vibram lugs every 150–300 m and evacuate onto "
        "non-expansive sandstone/conglomerate ribs or vegetated prairie tables."
    )

    warnings: list[str] = []
    recommendations: list[str] = []

    if roof <= 30.0 or piping_roof_punch_through_risk_pct >= 50.0:
        warnings.append(
            f"High subterranean piping-bridge collapse hazard ({piping_roof_punch_through_risk_pct:.1f}%, "
            f"roof thickness {roof:.0f} cm, SAR={sar:.1f}): dispersive sodium-smectite suffosion "
            "tunnels can punch through into 2–6 m bell-shaped shafts under hiker foot loads."
        )
        recommendations.append(
            f"Sound all swale crossings with a 150 cm graduated probe and maintain a >= {safe_pipe_bridge_setback_m:.1f} m setback from sinkhole rims."
        )

    if rain >= 8.0 or wet_gumbo_traction_loss_pct >= 50.0:
        warnings.append(
            f"Severe thixotropic 'badlands gumbo' hydration ({wet_gumbo_traction_loss_pct:.1f}% traction loss, "
            f"free-swell index {swell:.0f}%): wet montmorillonite forms a soap-slick plastic film and "
            f"adds ~{boot_mud_accretion_kg:.2f} kg of clay balling to footwear."
        )
        recommendations.append(
            "Retreat off bare bentonite mounds immediately when rain begins; use an aluminum boot-sole scraper and route along sandstone caprocks or gravel bars."
        )

    if slope >= 28.0 or crust >= 15.0:
        warnings.append(
            f"Unstable {crust:.0f} cm desiccated 'popcorn-clay' veneer on {slope:.1f}° badlands slope: "
            "granular polygonal aggregates shear off the dense unweathered shale core beneath."
        )
        recommendations.append(
            "Avoid traversing steep convex bentonite domes; place steps in shallow flushed rills or follow low-angle interfluve benches."
        )

    if sar >= 20.0:
        warnings.append(
            f"Highly dispersive sodium-rich clay chemistry (SAR={sar:.1f}): rapid deflocculation "
            "accelerates subterranean tunnel enlargement and sudden gully-wall slabbing."
        )
        recommendations.append(
            "Never camp or shelter inside incised badlands barrancos or beneath cantilevered sandstone hoodoo caps."
        )

    if not warnings:
        warnings.append(
            "Dry, thick smectite crust with low current piping collapse probability; watch for hidden desiccation fissures and sudden convective showers."
        )
    if not recommendations:
        recommendations.append(
            "Stay on durable gravel-lag washes or vegetated sod-table rims, carry a sounding probe, and protect vertebrate fossil outcrops."
        )

    return BentoniteBadlandsResult(
        {
            "smectite_free_swell_index_pct": swell,
            "free_swell_index_pct": swell,
            "popcorn_crust_thickness_cm": crust,
            "piping_roof_thickness_cm": roof,
            "rainfall_intensity_mm_hr": rain,
            "slope_angle_deg": slope,
            "sodium_adsorption_ratio_sar": sar,
            "hiker_load_kg": load,
            "morphology": morph,
            "swelling_grade": grade,
            "site_id": parsed.get("site_id"),
            "piping_roof_punch_through_risk_pct": piping_roof_punch_through_risk_pct,
            "piping_collapse_risk_pct": piping_roof_punch_through_risk_pct,
            "punch_through_risk_pct": piping_roof_punch_through_risk_pct,
            "wet_gumbo_traction_loss_pct": wet_gumbo_traction_loss_pct,
            "gumbo_slip_risk_pct": wet_gumbo_traction_loss_pct,
            "traction_loss_pct": wet_gumbo_traction_loss_pct,
            "boot_mud_accretion_kg": boot_mud_accretion_kg,
            "mud_balling_mass_kg": boot_mud_accretion_kg,
            "safe_pipe_bridge_setback_m": safe_pipe_bridge_setback_m,
            "safe_setback_distance_m": safe_pipe_bridge_setback_m,
            "safe_crown_setback_distance_m": safe_pipe_bridge_setback_m,
            "effective_crust_bearing_kpa": effective_crust_bearing_kpa,
            "bearing_capacity_kpa": effective_crust_bearing_kpa,
            "risk_level": risk_level,
            "safety_status": safety_status,
            "navigation_strategy": navigation_strategy,
            "badlands_strategy": navigation_strategy,
            "crossing_strategy": navigation_strategy,
            "routing_strategy": navigation_strategy,
            "piping_avoidance_protocol": piping_avoidance_protocol,
            "gumbo_traction_protocol": gumbo_traction_protocol,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


_STRONG_BENTONITE_BADLANDS_KEYWORDS: tuple[str, ...] = (
    "bentonite",
    "bentonitic",
    "bentonite-badlands",
    "bentonite_badlands",
    "popcorn clay",
    "popcorn-clay",
    "popcorn crust",
    "popcorn-crust",
    "smectite",
    "montmorillonite",
    "badlands gumbo",
    "thixotropic gumbo",
    "bentonite gumbo",
    "piping-tunnel",
    "piping tunnel",
    "soil piping",
    "soil-piping",
    "pseudokarst piping",
    "suffosion tunnel",
    "suffosion pipe",
    "piping sinkhole",
    "piping-tunnel sinkhole",
    "sage creek",
    "chadron formation",
    "chadron smectite",
    "white river badlands",
    "cainville reef",
    "cainville mesa",
    "north cainville",
    "factory butte",
    "mancos shale",
    "mancos-morrison",
    "brushy basin bentonite",
    "hanksville badlands",
    "dinosaur provincial park",
    "bearpaw badlands",
    "bearpaw bentonite",
    "bearpaw formation",
    "red deer river badlands",
    "bardenas reales",
    "pisquerra",
    "rallon-pisquerra",
    "rallón-pisquerra",
    "castildetierra",
    "bardena blanca",
    "free swell index",
    "free-swell index",
    "sodium adsorption ratio",
)

_CONTEXT_BENTONITE_TERMS: tuple[str, ...] = (
    "badlands",
    "gumbo",
    "piping",
    "hoodoo pedestal",
    "caprock hoodoo",
    "dispersive clay",
    "dispersive gully",
    "swallow hole",
    "mud accretion",
    "mud balling",
    "sod table",
    "coulee",
)

_ADJACENT_DOMAIN_EXCLUSIONS: tuple[str, ...] = (
    "quick clay",
    "quick-clay",
    "kvikkleire",
    "leda clay",
    "leda-clay",
    "gauldalen",
    "gjerdrum",
    "romerike",
    "lemieux",
    "saint-jean-vianney",
    "laflamme sea",
    "wadden sea",
    "wattwandern",
    "prielen",
    "quicksilt",
    "morecambe bay",
    "turnagain arm",
    "skeidararsandur",
    "skeiðarársandur",
    "batagaika",
    "tuktoyaktuk",
    "thermokarst",
    "yedoma",
    "xiaozhai",
    "dashiwei",
    "golondrinas",
    "sarisarinama",
    "sima humboldt",
    "tiankeng",
    "optimisticeskaja",
    "optymistychna",
    "vena del gesso",
    "spipola",
    "yesos de sorbas",
    "covadura",
    "parks ranch",
    "fouta djallon",
    "serra dos carajas",
    "serra dos carajás",
    "mitchell plateau",
    "ngauwudu",
    "kaas plateau",
    "panchgani",
    "dasht-e lut",
    "kalut",
    "badain jaran",
    "dunhuang yadan",
    "buckskin gulch",
    "little wild horse",
    "siq",
    "wadi mujib",
    "neon canyon",
    "golden cathedral",
    "heaps canyon",
    "imlay canyon",
    "sandtrap",
    "ghost anchor",
)


def is_bentonite_badlands_query(query: str) -> bool:
    """Return True if the user query targets Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation."""
    if not query or not query.strip():
        return False
    q = query.lower()

    if any(excl in q for excl in _ADJACENT_DOMAIN_EXCLUSIONS) and not any(
        kw in q
        for kw in (
            "bentonite",
            "popcorn clay",
            "popcorn-clay",
            "popcorn crust",
            "smectite",
            "montmorillonite",
            "piping-tunnel",
            "piping tunnel",
            "sage creek",
            "chadron",
            "cainville",
            "factory butte",
            "mancos shale",
            "dinosaur provincial park",
            "bearpaw",
            "bardenas reales",
            "pisquerra",
        )
    ):
        return False

    if any(kw in q for kw in _STRONG_BENTONITE_BADLANDS_KEYWORDS):
        return True

    context_hits = sum(1 for term in _CONTEXT_BENTONITE_TERMS if term in q)
    if context_hits >= 2:
        return True

    if "badlands" in q and any(
        w in q
        for w in (
            "clay",
            "gumbo",
            "piping",
            "sinkhole",
            "popcorn",
            "crust",
            "hoodoo",
            "swelling",
            "mud",
            "tunnel",
            "bridge",
            "gully",
        )
    ):
        return True

    return False


def detect_bentonite_badlands_intent(query: str) -> bool:
    """Alias for is_bentonite_badlands_query used across main.py and chat_request.py."""
    return is_bentonite_badlands_query(query)


def _match_site_from_query(query: str) -> BentoniteBadlandsSite:
    q = query.lower()
    if any(
        w in q
        for w in (
            "cainville",
            "factory butte",
            "mancos",
            "morrison",
            "brushy basin",
            "hanksville",
            "capitol reef",
            "cathedral valley",
            "utah",
            "caprock-hoodoo-pedestal",
            "extreme-thixotropic-gumbo",
        )
    ):
        return BENTONITE_BADLANDS_SITES[1]
    if any(
        w in q
        for w in (
            "dinosaur provincial",
            "dinosaur park",
            "red deer",
            "bearpaw",
            "alberta",
            "canada",
            "piping-tunnel-bridge",
        )
    ):
        return BENTONITE_BADLANDS_SITES[2]
    if any(
        w in q
        for w in (
            "bardenas",
            "pisquerra",
            "rallón",
            "rallon",
            "castildetierra",
            "navarra",
            "ebro",
            "spain",
            "dispersive-ruth-gully",
            "dispersive-rill-gully",
            "moderate-montmorillonite",
        )
    ):
        return BENTONITE_BADLANDS_SITES[3]
    return BENTONITE_BADLANDS_SITES[0]


def extract_bentonite_badlands_params(query: str) -> dict[str, Any]:
    """Extract numerical calculator parameters and site metadata from a natural-language query."""
    matched_site = _match_site_from_query(query)
    params: dict[str, Any] = {
        "site_id": str(matched_site["id"]),
        "morphology": str(matched_site["morphology"]),
        "swelling_grade": str(matched_site["swelling_grade"]),
        "smectite_free_swell_index_pct": float(
            matched_site["default_smectite_free_swell_index_pct"]
        ),
        "popcorn_crust_thickness_cm": float(
            matched_site["default_popcorn_crust_thickness_cm"]
        ),
        "piping_roof_thickness_cm": float(
            matched_site["default_piping_roof_thickness_cm"]
        ),
        "rainfall_intensity_mm_hr": float(
            matched_site["default_rainfall_intensity_mm_hr"]
        ),
        "slope_angle_deg": float(matched_site["default_slope_angle_deg"]),
        "sodium_adsorption_ratio_sar": float(
            matched_site["default_sodium_adsorption_ratio_sar"]
        ),
        "hiker_load_kg": float(matched_site["default_hiker_load_kg"]),
    }

    q = query.lower()

    m_swell = (
        re.search(
            r"(\d+(?:\.\d+)?)\s*%\s*(?:smectite\s+)?(?:free[- ]swell|swell(?:\s+index)?|smectite)",
            q,
        )
        or re.search(
            r"(?:free[- ]swell(?:\s+index)?|swell(?:\s+index)?|smectite\s+swell)[^,\d]{0,15}(\d+(?:\.\d+)?)\s*%?",
            q,
        )
    )
    if m_swell:
        val = float(m_swell.group(1))
        params["smectite_free_swell_index_pct"] = min(800.0, max(20.0, val))

    m_crust = (
        re.search(
            r"(\d+(?:\.\d+)?)\s*cm\s*(?:popcorn[- ]crust|popcorn\s+clay|crust)",
            q,
        )
        or re.search(
            r"(?:popcorn[- ]crust|crust(?:\s+thickness)?)[^,\d]{0,15}(\d+(?:\.\d+)?)\s*cm\b",
            q,
        )
    )
    if m_crust:
        val = float(m_crust.group(1))
        params["popcorn_crust_thickness_cm"] = min(40.0, max(1.0, val))

    m_roof = (
        re.search(
            r"(\d+(?:\.\d+)?)\s*cm\s*(?:piping[- ]roof|tunnel[- ]roof|roof|bridge)",
            q,
        )
        or re.search(
            r"(?:piping[- ]roof|tunnel[- ]roof|roof(?:\s+thickness)?|bridge(?:\s+thickness)?)[^,\d]{0,15}(\d+(?:\.\d+)?)\s*cm\b",
            q,
        )
    )
    if m_roof:
        val = float(m_roof.group(1))
        params["piping_roof_thickness_cm"] = min(150.0, max(5.0, val))

    m_rain = (
        re.search(
            r"(\d+(?:\.\d+)?)\s*mm\s*/\s*(?:hr|h|hour)\b",
            q,
        )
        or re.search(
            r"(?:rainfall|rain(?:\s+intensity)?)[^\d]{0,20}(\d+(?:\.\d+)?)\s*mm",
            q,
        )
    )
    if m_rain:
        val = float(m_rain.group(1))
        params["rainfall_intensity_mm_hr"] = min(120.0, max(0.0, val))

    m_slope = (
        re.search(
            r"(\d+(?:\.\d+)?)\s*(?:deg|degrees|°)\s*(?:slope|mound|badlands|gully|ravine|cone|angle)?",
            q,
        )
        or re.search(
            r"(?:slope(?:\s+angle)?|mound\s+slope)[^\d]{0,20}(\d+(?:\.\d+)?)\s*(?:deg|degrees|°)?",
            q,
        )
    )
    if m_slope:
        val = float(m_slope.group(1))
        params["slope_angle_deg"] = min(65.0, max(2.0, val))

    m_sar = (
        re.search(
            r"(?:sodium\s+adsorption\s+ratio|\bsar\b)\s*(?:=|of|at|is)?\s*(\d+(?:\.\d+)?)",
            q,
        )
        or re.search(
            r"(\d+(?:\.\d+)?)\s*\bsar\b",
            q,
        )
    )
    if m_sar:
        val = float(m_sar.group(1))
        params["sodium_adsorption_ratio_sar"] = min(60.0, max(1.0, val))

    m_load = (
        re.search(
            r"(\d+(?:\.\d+)?)\s*kg\s*(?:hiker|load|pack|total)",
            q,
        )
        or re.search(
            r"(?:hiker\s+load|total\s+load|pack\s+mass)[^\d]{0,20}(\d+(?:\.\d+)?)\s*kg",
            q,
        )
    )
    if m_load:
        val = float(m_load.group(1))
        params["hiker_load_kg"] = min(160.0, max(35.0, val))

    return params


def format_bentonite_badlands_response(query: str) -> dict[str, Any]:
    """Build a structured domain response dictionary for chat and streaming endpoints."""
    matched_site = _match_site_from_query(query)
    site_info: dict[str, Any] = dict(matched_site)
    params: dict[str, Any] = extract_bentonite_badlands_params(query)
    calc_info: dict[str, Any] = dict(
        calculate_bentonite_badlands(
            smectite_free_swell_index_pct=float(
                params["smectite_free_swell_index_pct"]
            ),
            popcorn_crust_thickness_cm=float(params["popcorn_crust_thickness_cm"]),
            piping_roof_thickness_cm=float(params["piping_roof_thickness_cm"]),
            rainfall_intensity_mm_hr=float(params["rainfall_intensity_mm_hr"]),
            slope_angle_deg=float(params["slope_angle_deg"]),
            sodium_adsorption_ratio_sar=float(params["sodium_adsorption_ratio_sar"]),
            hiker_load_kg=float(params["hiker_load_kg"]),
            morphology=str(params["morphology"]),
            swelling_grade=str(params["swelling_grade"]),
            site_id=str(params["site_id"]),
        )
    )

    summary = (
        f"**Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Assessment — "
        f"{site_info['name']} ({site_info['country']})**\n\n"
        f"- **Morphology**: `{site_info['morphology']}` | **Swelling Grade**: `{site_info['swelling_grade']}` | "
        f"**Risk Level**: `{str(calc_info['risk_level']).upper()}`\n"
        f"- **Piping Roof Punch-Through Risk**: `{calc_info['piping_roof_punch_through_risk_pct']}%` "
        f"(roof thickness={params['piping_roof_thickness_cm']} cm, SAR={params['sodium_adsorption_ratio_sar']}, "
        f"bearing capacity={calc_info['effective_crust_bearing_kpa']} kPa)\n"
        f"- **Wet Thixotropic Gumbo Traction Loss**: `{calc_info['wet_gumbo_traction_loss_pct']}%` "
        f"(free-swell index={params['smectite_free_swell_index_pct']}%, rainfall={params['rainfall_intensity_mm_hr']} mm/hr, "
        f"slope={params['slope_angle_deg']}°)\n"
        f"- **Boot Mud Accretion Mass**: `{calc_info['boot_mud_accretion_kg']} kg` "
        f"(popcorn-crust thickness={params['popcorn_crust_thickness_cm']} cm)\n"
        f"- **Safe Pipe-Bridge & Sinkhole Setback**: `{calc_info['safe_pipe_bridge_setback_m']} m`\n"
        f"- **Navigation Strategy**: {calc_info['navigation_strategy']}\n"
        f"- **Piping Avoidance Protocol**: {site_info['piping_avoidance_protocol']}\n"
        f"- **Conservation Protocol**: {site_info['conservation_protocol']}"
    )

    response_info: dict[str, Any] = {
        "domain": "bentonite_badlands",
        "action": "bentonite_badlands_info",
        "query": query,
        "matched_site": site_info,
        "site": site_info,
        "sites": [dict(s) for s in BENTONITE_BADLANDS_SITES],
        "calculation": calc_info,
        "gear_checklist": [dict(g) for g in get_bentonite_badlands_gear_checklist()],
        "summary": summary,
        "answer": summary,
    }
    return response_info


def build_bentonite_badlands_prompt(info_or_query: dict[str, Any] | str) -> str:
    """Build system prompt context for LLM augmentation on bentonite badlands queries."""
    info: dict[str, Any] = (
        format_bentonite_badlands_response(info_or_query)
        if isinstance(info_or_query, str)
        else info_or_query
    )
    site_info: dict[str, Any] = dict(info["matched_site"])
    calc_info: dict[str, Any] = dict(info["calculation"])
    return (
        "### Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation Context\n"
        f"Matched Reference Site: {site_info['name']} ({site_info['country']}, {site_info['region']})\n"
        f"Morphology: {site_info['morphology']} | Swelling Grade: {site_info['swelling_grade']} | "
        f"Difficulty: {site_info['difficulty']}\n"
        f"Calculated Risk Level: {calc_info['risk_level']} ({calc_info['safety_status']})\n"
        f"Metrics: Piping Roof Punch-Through Risk={calc_info['piping_roof_punch_through_risk_pct']}%, "
        f"Wet Gumbo Traction Loss={calc_info['wet_gumbo_traction_loss_pct']}%, "
        f"Boot Mud Accretion={calc_info['boot_mud_accretion_kg']} kg, "
        f"Effective Crust Bearing={calc_info['effective_crust_bearing_kpa']} kPa, "
        f"Safe Pipe-Bridge Setback={calc_info['safe_pipe_bridge_setback_m']} m.\n"
        f"Navigation Strategy: {calc_info['navigation_strategy']}\n"
        f"Site Conservation Protocol: {site_info['conservation_protocol']}\n"
    )


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response payload for bentonite badlands intent."""
    info: dict[str, Any] = format_bentonite_badlands_response(query)
    return {
        "answer": info["summary"],
        "context": [site["name"] for site in BENTONITE_BADLANDS_SITES],
        "bentonite_badlands_info": info,
    }


def generate_stream_events(query: str) -> Iterator[dict[str, Any]]:
    """Yield SSE event dictionaries for streaming bentonite badlands responses."""
    info: dict[str, Any] = format_bentonite_badlands_response(query)
    yield {
        "event": "bentonite_badlands_info",
        "data": info,
        "bentonite_badlands_info": info,
    }
    yield {
        "event": "message",
        "answer": info["summary"],
        "context": [site["name"] for site in BENTONITE_BADLANDS_SITES],
        "bentonite_badlands_info": info,
    }
