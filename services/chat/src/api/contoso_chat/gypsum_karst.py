"""Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology Guide.

Covers high-consequence artesian rectilinear gypsum mega-labyrinths, Messinian selenite through-caves,
arid ephemeral flash-flood evaporite sinks, and Permian anhydrite-hydration breakdown halls:
- Optimisticeskaja (Optymistychna) & Ozerna Artesian Gypsum Mega-Labyrinth (Podolia, Ukraine)
- Sistema Spipola-Acquafredda & Vena del Gesso Messinian Selenite Karst (Emilia-Romagna, Italy)
- Karst en Yesos de Sorbas & Cueva de Covadura Evaporite Maze (Almería, Spain)
- Parks Ranch Cave & Yeso-Castile Evaporite Sink-Maze (Eddy County, New Mexico, USA)

Deterministic calculator evaluates:
- Ceiling slab peel & anhydrite-hydration breakdown probability (%)
- Rectilinear joint-maze disorientation entropy score (0-100)
- Rapid-dissolution ephemeral siphon flash-flood risk (%)
- Swallowtail selenite crystal blade shear & cord-abrasion hazard (%)
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from typing import Any


class GypsumKarstSite(dict[str, Any]):
    """Dictionary subclass supporting attribute access for subterranean gypsum-karst sites."""

    def __getattr__(self, name: str) -> Any:
        try:
            return self[name]
        except KeyError as exc:
            raise AttributeError(
                f"'GypsumKarstSite' object has no attribute '{name}'"
            ) from exc


GYPSUM_KARST_SITES: list[GypsumKarstSite] = [
    GypsumKarstSite(
        {
            "id": "optimisticeskaja-ozerna-podolia-ukraine",
            "name": "Optimisticeskaja (Optymistychna) & Ozerna Artesian Gypsum Mega-Labyrinth",
            "country": "Ukraine",
            "region": "Dniester-Podolian Evaporite Basin, Ternopil Oblast, Western Ukraine",
            "elevation_range": "230 m - 310 m (20 m - 105 m overburden depth)",
            "max_elevation_m": 310,
            "morphology": "artesian-rectilinear-joint-labyrinth",
            "regime": "artesian-rectilinear-joint-labyrinth",
            "substrate_type": "artesian-rectilinear-joint-labyrinth",
            "difficulty": "extreme",
            "default_junction_count_per_100m": 34.0,
            "default_ceiling_bed_thickness_cm": 11.0,
            "default_surface_rain_inflow_mm_hr": 6.0,
            "default_anhydrite_swelling_pct": 38.0,
            "default_party_acoustic_decibels": 72.0,
            "primary_hazard": (
                "Over 265 km of hyper-dense 3D rectilinear hypogene artesian joint mazes with 30+ intersections "
                "per 100 m, delaminating Badenian gypsum ceiling slabs, and suspended breakdown choke blocks."
            ),
            "navigation_strategy": (
                "Maintain a continuous EN 12542 survey line or numbered reflective station-tag trail back to the "
                "region's base camp hub, log azimuth and junction index at every orthogonal cross-rift, and "
                "keep party vocal acoustics below 65 dB beneath thin (<15 cm) peeling gypsum ceiling beds."
            ),
            "navigation_protocol": (
                "Never step off established clay-floor foot tracks in multi-level joint networks; verify survey "
                "station plaques at every four-way intersection and bypass sagging selenite ceiling plates."
            ),
            "conservation_protocol": (
                "Protect secondary gypsum needle frostwork, black manganese-oxide wall coatings, and subterranean "
                "clay floor stratigraphy in Ozerna and Optymistychna by staying strictly within flagged single-file lanes."
            ),
            "progression_protocol": (
                "Never step off established clay-floor foot tracks in multi-level joint networks; verify survey "
                "station plaques at every four-way intersection and bypass sagging selenite ceiling plates."
            ),
            "field_notes": (
                "Optymistychna (Optimisticeskaja) is the longest known gypsum cave on Earth (>265 km mapped) and "
                "formed by upward artesian groundwater circulation across orthogonal tectonic fractures in "
                "Neogene (Badenian) evaporites."
            ),
        }
    ),
    GypsumKarstSite(
        {
            "id": "spipola-acquafredda-vena-del-gesso-italy",
            "name": "Sistema Spipola-Acquafredda & Vena del Gesso Messinian Selenite Karst",
            "country": "Italy",
            "region": "Parco Regionale dei Gessi Bolognesi e Vena del Gesso Romagnola, Emilia-Romagna",
            "elevation_range": "140 m - 420 m",
            "max_elevation_m": 420,
            "morphology": "messinian-selenite-epigenetic-gorge",
            "regime": "messinian-selenite-epigenetic-gorge",
            "substrate_type": "messinian-selenite-epigenetic-gorge",
            "difficulty": "challenging",
            "default_junction_count_per_100m": 19.0,
            "default_ceiling_bed_thickness_cm": 18.0,
            "default_surface_rain_inflow_mm_hr": 18.0,
            "default_anhydrite_swelling_pct": 31.0,
            "default_party_acoustic_decibels": 68.0,
            "primary_hazard": (
                "Razor-sharp Messinian 'ferro di lancia' (swallowtail twin) macro-crystalline selenite blades "
                "that sever textile harnesses and ropes, coupled with active sinkhole streamway siphons and "
                "monumental breakdown halls."
            ),
            "navigation_strategy": (
                "Equip ANSI A5 Kevlar-palm caving gloves and Aramid-sheathed rope protectors over every "
                "swallowtail selenite lip, monitor Apennine storm inflows before entering the Rio Acquafredda "
                "streamway, and skirt the perimeter of unstable breakdown cones."
            ),
            "navigation_protocol": (
                "Rig all vertical pitches off load-tested stainless expansion anchors placed in massive "
                "macro-twinned selenite beds rather than fractured marly interbeds; avoid chimneying against "
                "protruding swallowtail crystal tips."
            ),
            "conservation_protocol": (
                "Comply with UNESCO World Heritage Evaporitic Karst and Caves of Northern Apennines protocols: "
                "never chip or collect Messinian selenite twin crystals and observe seasonal bat hibernacula closures."
            ),
            "progression_protocol": (
                "Rig all vertical pitches off load-tested stainless expansion anchors placed in massive "
                "macro-twinned selenite beds rather than fractured marly interbeds; avoid chimneying against "
                "protruding swallowtail crystal tips."
            ),
            "field_notes": (
                "Carved into Upper Miocene (Messinian Salinity Crisis) giant swallowtail selenite beds first "
                "explored by Luigi Fantini in 1932, the Spipola-Acquafredda system exhibits textbook blind "
                "valleys, dolines, and multi-story epigenetic dissolution galleries."
            ),
        }
    ),
    GypsumKarstSite(
        {
            "id": "sorbas-covadura-yesos-almeria-spain",
            "name": "Karst en Yesos de Sorbas & Cueva de Covadura Evaporite Maze",
            "country": "Spain",
            "region": "Paraje Natural Karst en Yesos de Sorbas, Almería, Andalusia",
            "elevation_range": "320 m - 490 m (up to 120 m cave depth)",
            "max_elevation_m": 490,
            "morphology": "arid-ephemeral-evaporite-sink",
            "regime": "arid-ephemeral-evaporite-sink",
            "substrate_type": "arid-ephemeral-evaporite-sink",
            "difficulty": "challenging",
            "default_junction_count_per_100m": 24.0,
            "default_ceiling_bed_thickness_cm": 15.0,
            "default_surface_rain_inflow_mm_hr": 29.0,
            "default_anhydrite_swelling_pct": 34.0,
            "default_party_acoustic_decibels": 66.0,
            "primary_hazard": (
                "Sudden Mediterranean 'gota fría' cloudbursts funneling violent sediment-laden flash floods "
                "through over 1,000 surface dolines into interstratal gypsum-marl crawlways, alongside "
                "delaminating tabular ceiling slabs."
            ),
            "navigation_strategy": (
                "Abort underground entry if Almería convective precipitation exceeds 5 mm/hr, identify high "
                "fossil-gallery flood escape risers before descending Cueva de Covadura or Cueva del Agua, "
                "and pad all rebelays against abrasive gypsum-marl ledges."
            ),
            "navigation_protocol": (
                "Traverse low interstratal marl-and-gypsum crawls with low-profile helmets; never camp or "
                "linger beneath cantilevered gypsum strata detaching along wet marl parting planes."
            ),
            "conservation_protocol": (
                "Preserve translucent hollow gypsum stalactites ('macarrones'),usters of selenite arrows, and "
                "endemic gypsophile surface flora (Narcissus tortifolius, Helianthemum alypoides) around doline rims."
            ),
            "progression_protocol": (
                "Traverse low interstratal marl-and-gypsum crawls with low-profile helmets; never camp or "
                "linger beneath cantilevered gypsum strata detaching along wet marl parting planes."
            ),
            "field_notes": (
                "The Sorbas Basin contains over 1,000 sinkholes and 50+ km of interstratal gypsum caves where "
                "rapid evaporite dissolution (~100x faster than limestone) enlarges fissures measurably during "
                "single flash-flood events."
            ),
        }
    ),
    GypsumKarstSite(
        {
            "id": "parks-ranch-chandelier-gypsum-new-mexico",
            "name": "Parks Ranch Cave & Yeso-Castile Evaporite Sink-Maze",
            "country": "USA",
            "region": "Chihuahuan Gypsum Plain, Eddy County, New Mexico",
            "elevation_range": "1,010 m - 1,090 m",
            "max_elevation_m": 1090,
            "morphology": "permian-anhydrite-hydration-dome",
            "regime": "permian-anhydrite-hydration-dome",
            "substrate_type": "permian-anhydrite-hydration-dome",
            "difficulty": "moderate",
            "default_junction_count_per_100m": 21.0,
            "default_ceiling_bed_thickness_cm": 16.0,
            "default_surface_rain_inflow_mm_hr": 14.0,
            "default_anhydrite_swelling_pct": 44.0,
            "default_party_acoustic_decibels": 64.0,
            "primary_hazard": (
                "Permian Castile Formation anhydrite-to-gypsum hydration domes that expand up to 62% by volume, "
                "buckling thin laminated ceiling crusts into unstable breakdown arches and seasonal monsoonal "
                "arroyo flood sumps."
            ),
            "navigation_strategy": (
                "Log every sinkhole entrance and flood-wash junction on a waterproof disto/compass survey card, "
                "inspect arched hydration-buckle ceilings with a focused 1,000-lumen spot beam before crossing "
                "breakdown rooms, and exit immediately upon Chihuahuan monsoon thunder."
            ),
            "navigation_protocol": (
                "Avoid crawling beneath freshly spalled white anhydrite-hydration blisters or wedging knees "
                "against thin laminated Castile gypsum partitions in low phreatic tubes."
            ),
            "conservation_protocol": (
                "Follow BLM Chihuahuan Gypsum Plain cave management rules: pack out all human waste and carbide/mud "
                "residue, avoid disturbing cave crickets and bat roosts, and do not break fibrous satin-spar veins."
            ),
            "progression_protocol": (
                "Avoid crawling beneath freshly spalled white anhydrite-hydration blisters or wedging knees "
                "against thin laminated Castile gypsum partitions in low phreatic tubes."
            ),
            "field_notes": (
                "Extending over 6.5 km beneath the Chihuahuan Desert gypsum plain, Parks Ranch Cave captures "
                "ephemeral flash-flood arroyos into an anastomosing Permian Castile evaporite maze."
            ),
        }
    ),
]

GYPSUM_SITES: list[GypsumKarstSite] = GYPSUM_KARST_SITES

GYPSUM_KARST_GEAR_CHECKLIST: list[dict[str, str]] = [
    {
        "item": "EN 12542 Braided Survey Line Reel & Numbered Reflective Junction Direction Tags",
        "category": "Rectilinear Labyrinth Wayfinding",
        "priority": "essential",
        "rationale": (
            "Prevents fatal disorientation in 3D artesian rectilinear joint mazes (30+ junctions per 100 m) "
            "where identical gypsum cross-passages defeat memory-based navigation."
        ),
    },
    {
        "item": "Laser Rangefinder / Clinometer (DistoX) & Waterproof Cave Survey Book",
        "category": "Breakdown-Hall & Ceiling-Arch Mensuration",
        "priority": "essential",
        "rationale": (
            "Maps complex anastomosing loops and measures ceiling-bed sag and breakdown-dome spans from a "
            "safe standoff without entering unstable collapse zones."
        ),
    },
    {
        "item": "EN 12492 Low-Profile Caving Helmet with Dual IP68 Spot/Flood Headlamps",
        "category": "Ceiling Slab Spall Protection & Inspection",
        "priority": "essential",
        "rationale": (
            "Protects the cranium against delaminating gypsum/marl flakes while providing a narrow spot beam "
            "to inspect overhead anhydrite-hydration fractures."
        ),
    },
    {
        "item": "ANSI A5 Kevlar-Palm Caving Gloves & Aramid Rope Edge Protectors",
        "category": "Swallowtail Selenite Crystal Shear Defense",
        "priority": "essential",
        "rationale": (
            "Shields hands, harnesses, and semi-static ropes from razor-sharp Messinian swallowtail selenite "
            "twin crystals and jagged satin-spar cleavage blades."
        ),
    },
    {
        "item": "Barometric / Ultrasonic Siphon Water-Level Surge Alarm & Emergency Escape Whistles",
        "category": "Ephemeral Evaporite Sink Flash-Flood Warning",
        "priority": "essential",
        "rationale": (
            "Detects rapid hydrostatic rise in downstream sumps when surface cloudbursts pour into karst "
            "dolines and rapidly dissolving evaporite streamways."
        ),
    },
    {
        "item": "Cordura Knee/Elbow Articulated Crawl Pads & Non-Marring Clay-Boot Covers",
        "category": "Interstratal Crawl Protection & Conservation",
        "priority": "essential",
        "rationale": (
            "Enables low-profile crawling across abrasive gypsum crystals while preventing mud tracking "
            "across pristine selenite floors and secondary gypsum flowers."
        ),
    },
]


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 subterranean gypsum-karst dissolution maze & evaporite breakdown-hall sites."""
    return list(GYPSUM_KARST_SITES)


def get_all_gypsum_karst_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6 essential gear checklist items for gypsum-karst speleology."""
    return [dict(item) for item in GYPSUM_KARST_GEAR_CHECKLIST]


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Lookup a gypsum-karst site by exact ID or fuzzy substring match."""
    if not site_id or not site_id.strip():
        return None
    norm = site_id.strip().lower()
    for site in GYPSUM_KARST_SITES:
        if str(site["id"]).lower() == norm:
            return site

    alias_map = {
        "optimisticeskaja": "optimisticeskaja-ozerna-podolia-ukraine",
        "optymistychna": "optimisticeskaja-ozerna-podolia-ukraine",
        "ozerna": "optimisticeskaja-ozerna-podolia-ukraine",
        "podolia": "optimisticeskaja-ozerna-podolia-ukraine",
        "ternopil": "optimisticeskaja-ozerna-podolia-ukraine",
        "ukraine": "optimisticeskaja-ozerna-podolia-ukraine",
        "spipola": "spipola-acquafredda-vena-del-gesso-italy",
        "acquafredda": "spipola-acquafredda-vena-del-gesso-italy",
        "vena del gesso": "spipola-acquafredda-vena-del-gesso-italy",
        "vena-del-gesso": "spipola-acquafredda-vena-del-gesso-italy",
        "gessi bolognesi": "spipola-acquafredda-vena-del-gesso-italy",
        "messinian": "spipola-acquafredda-vena-del-gesso-italy",
        "italy": "spipola-acquafredda-vena-del-gesso-italy",
        "sorbas": "sorbas-covadura-yesos-almeria-spain",
        "covadura": "sorbas-covadura-yesos-almeria-spain",
        "yesos de sorbas": "sorbas-covadura-yesos-almeria-spain",
        "almeria": "sorbas-covadura-yesos-almeria-spain",
        "almería": "sorbas-covadura-yesos-almeria-spain",
        "spain": "sorbas-covadura-yesos-almeria-spain",
        "parks ranch": "parks-ranch-chandelier-gypsum-new-mexico",
        "parks-ranch": "parks-ranch-chandelier-gypsum-new-mexico",
        "yeso-castile": "parks-ranch-chandelier-gypsum-new-mexico",
        "castile": "parks-ranch-chandelier-gypsum-new-mexico",
        "new mexico": "parks-ranch-chandelier-gypsum-new-mexico",
    }
    for alias, target_id in alias_map.items():
        if alias in norm:
            for site in GYPSUM_KARST_SITES:
                if site["id"] == target_id:
                    return site

    for site in GYPSUM_KARST_SITES:
        if norm in str(site["id"]).lower() or norm in str(site["name"]).lower():
            return site
    return None


def get_gypsum_karst_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
    regime: str | None = None,
    substrate_type: str | None = None,
) -> list[dict[str, Any]]:
    """Filter gypsum-karst sites by country, morphology, difficulty, and free-text search."""
    results: list[dict[str, Any]] = list(GYPSUM_KARST_SITES)
    if country and country.strip():
        c_norm = country.strip().lower()
        results = [
            s
            for s in results
            if c_norm == str(s["country"]).lower() or c_norm in str(s["country"]).lower()
        ]
    effective_morphology = (
        morphology
        if morphology and morphology.strip()
        else (regime if regime and regime.strip() else substrate_type)
    )
    if effective_morphology and effective_morphology.strip():
        m_norm = effective_morphology.strip().lower()
        results = [s for s in results if m_norm in str(s["morphology"]).lower()]
    if difficulty and difficulty.strip():
        d_norm = difficulty.strip().lower()
        results = [s for s in results if str(s["difficulty"]).lower() == d_norm]
    if search and search.strip():
        q_norm = search.strip().lower()
        results = [
            s
            for s in results
            if q_norm in str(s["id"]).lower()
            or q_norm in str(s["name"]).lower()
            or q_norm in str(s["country"]).lower()
            or q_norm in str(s["region"]).lower()
            or q_norm in str(s["morphology"]).lower()
            or q_norm in str(s["primary_hazard"]).lower()
            or q_norm in str(s["navigation_strategy"]).lower()
            or q_norm in str(s["field_notes"]).lower()
        ]
    return results


def calculate_gypsum_karst(
    junction_count_per_100m: float = 18.0,
    ceiling_bed_thickness_cm: float = 24.0,
    surface_rain_inflow_mm_hr: float = 12.0,
    anhydrite_swelling_pct: float = 28.0,
    party_acoustic_decibels: float = 68.0,
) -> dict[str, Any]:
    """Calculate ceiling slab peel probability, maze disorientation entropy score, rapid dissolution siphon flood risk, and selenite crystal shear hazard.

    Raises ValueError if any input is outside validated physical bounds:
    - junction_count_per_100m: 2.0 to 45.0 junctions / 100 m
    - ceiling_bed_thickness_cm: 2.0 to 120.0 cm
    - surface_rain_inflow_mm_hr: 0.0 to 80.0 mm/hr
    - anhydrite_swelling_pct: 0.0 to 65.0 %
    - party_acoustic_decibels: 35.0 to 110.0 dB
    """
    if not (2.0 <= junction_count_per_100m <= 45.0):
        raise ValueError(
            f"junction_count_per_100m must be between 2 and 45 (got {junction_count_per_100m})"
        )
    if not (2.0 <= ceiling_bed_thickness_cm <= 120.0):
        raise ValueError(
            f"ceiling_bed_thickness_cm must be between 2 and 120 cm (got {ceiling_bed_thickness_cm})"
        )
    if not (0.0 <= surface_rain_inflow_mm_hr <= 80.0):
        raise ValueError(
            f"surface_rain_inflow_mm_hr must be between 0 and 80 mm/hr (got {surface_rain_inflow_mm_hr})"
        )
    if not (0.0 <= anhydrite_swelling_pct <= 65.0):
        raise ValueError(
            f"anhydrite_swelling_pct must be between 0 and 65 % (got {anhydrite_swelling_pct})"
        )
    if not (35.0 <= party_acoustic_decibels <= 110.0):
        raise ValueError(
            f"party_acoustic_decibels must be between 35 and 110 dB (got {party_acoustic_decibels})"
        )

    # 1. Ceiling slab peel & anhydrite-hydration delamination probability (%)
    # Thin evaporite beds under anhydrite->gypsum hydration swelling pressure and acoustic vibration
    thinness_factor = (120.0 - ceiling_bed_thickness_cm) * 0.34 + (
        80.0 / max(2.0, ceiling_bed_thickness_cm)
    )
    acoustic_excitation = max(0.0, party_acoustic_decibels - 35.0) * 0.28
    raw_peel_prob = (
        thinness_factor
        + (anhydrite_swelling_pct * 0.56)
        + acoustic_excitation
        + (surface_rain_inflow_mm_hr * 0.18)
    )
    ceiling_slab_peel_probability_pct = round(
        min(99.0, max(1.0, raw_peel_prob)),
        1,
    )

    # 2. Rectilinear joint-maze disorientation entropy score (0 - 100)
    # Driven by 3D joint intersection density, breakdown block chaos, and flood turbidity
    raw_entropy = (
        2.0
        + (junction_count_per_100m * 1.68)
        + (anhydrite_swelling_pct * 0.24)
        + (surface_rain_inflow_mm_hr * 0.16)
        + ((120.0 - ceiling_bed_thickness_cm) * 0.06)
    )
    maze_disorientation_entropy_score = round(
        min(99.0, max(1.0, raw_entropy)),
        1,
    )

    # 3. Rapid-dissolution ephemeral siphon flash-flood risk (%)
    # Driven by surface rain inflow into sinkholes and constricted anastomosing evaporite tubes
    raw_flood_risk = (
        1.5
        + (surface_rain_inflow_mm_hr * 1.18)
        + (junction_count_per_100m * 0.32)
        + (anhydrite_swelling_pct * 0.16)
        + ((120.0 - ceiling_bed_thickness_cm) * 0.05)
    )
    rapid_dissolution_siphon_flood_risk_pct = round(
        min(99.0, max(1.0, raw_flood_risk)),
        1,
    )

    # 4. Swallowtail selenite crystal blade shear & cord-abrasion hazard (%)
    # Driven by anhydrite recrystallization/swelling, thin fractured beds, and tight junction squeezes
    raw_crystal_shear = (
        2.0
        + (anhydrite_swelling_pct * 0.68)
        + ((120.0 - ceiling_bed_thickness_cm) * 0.25)
        + (junction_count_per_100m * 0.35)
        + (surface_rain_inflow_mm_hr * 0.15)
        + (max(0.0, party_acoustic_decibels - 35.0) * 0.14)
    )
    selenite_crystal_shear_hazard_pct = round(
        min(99.0, max(1.0, raw_crystal_shear)),
        1,
    )

    warnings: list[str] = []
    recommendations: list[str] = []

    if ceiling_slab_peel_probability_pct >= 62.0 or ceiling_bed_thickness_cm <= 14.0:
        warnings.append(
            f"EVAPORITE CEILING SLAB DELAMINATION HAZARD: {ceiling_bed_thickness_cm:.1f} cm gypsum bedding "
            f"with {anhydrite_swelling_pct:.1f}% anhydrite-hydration swelling and {party_acoustic_decibels:.0f} dB "
            f"acoustics yields a {ceiling_slab_peel_probability_pct:.1f}% slab peel probability."
        )
        recommendations.append(
            "Enforce silent single-file transit (<60 dB) beneath thin gypsum ceiling beds and bypass "
            "buckled anhydrite-hydration domes along perimeter wall buttresses."
        )
    elif ceiling_slab_peel_probability_pct >= 32.0:
        warnings.append(
            f"MODERATE GYPSUM BEDDING SPALL RISK: {ceiling_slab_peel_probability_pct:.1f}% ceiling peel "
            "probability along marly interstratal parting planes."
        )
        recommendations.append(
            "Inspect overhead bedding joints with a focused spot headlamp before halting or setting survey stations."
        )

    if maze_disorientation_entropy_score >= 60.0 or junction_count_per_100m >= 25.0:
        warnings.append(
            f"EXTREME RECTILINEAR LABYRINTH ENTROPY: {junction_count_per_100m:.1f} junctions/100m produces "
            f"a {maze_disorientation_entropy_score:.1f}/100 disorientation score across multi-story joint networks."
        )
        recommendations.append(
            "Pay out a continuous EN 12542 braided survey line or clip numbered reflective directional markers "
            "at every four-way joint intersection with logged DistoX back-bearings."
        )

    if rapid_dissolution_siphon_flood_risk_pct >= 55.0 or surface_rain_inflow_mm_hr >= 22.0:
        warnings.append(
            f"RAPID-DISSOLUTION SIPHON FLASH-FLOOD RISK: {surface_rain_inflow_mm_hr:.1f} mm/hr surface inflow "
            f"drives a {rapid_dissolution_siphon_flood_risk_pct:.1f}% sump closure probability in low evaporite conduits."
        )
        recommendations.append(
            "Evacuate active streamway galleries immediately to upper fossil-level risers and deploy an ultrasonic "
            "siphon water-level surge alarm at upstream constrictions."
        )

    if selenite_crystal_shear_hazard_pct >= 52.0 or anhydrite_swelling_pct >= 35.0:
        warnings.append(
            f"SWALLOWTAIL SELENITE CRYSTAL SHEAR HAZARD: {selenite_crystal_shear_hazard_pct:.1f}% abrasion/cut "
            "hazard on exposed Messinian/Permian macro-crystalline gypsum blades."
        )
        recommendations.append(
            "Wear ANSI A5 Kevlar-palm caving gloves, Cordura knee/elbow pads, and wrap Aramid edge protectors "
            "around all rope rebelays contacting selenite crystal lips."
        )

    if len(recommendations) < 2:
        recommendations.extend(
            [
                "Record azimuth, inclination, and distance at every rectilinear cross-rift in a waterproof survey book.",
                "Stay within flagged clay-floor foot trails to protect fragile gypsum flowers and satin-spar veins.",
            ]
        )

    # Determine overall risk_level & navigation_strategy
    if (
        ceiling_slab_peel_probability_pct >= 75.0
        or maze_disorientation_entropy_score >= 78.0
        or rapid_dissolution_siphon_flood_risk_pct >= 72.0
        or ceiling_bed_thickness_cm <= 7.0
    ):
        risk_level = "critical"
        navigation_strategy = (
            "ABORT BREAKDOWN-HALL & STREAMWAY PENETRATION: Critical evaporite ceiling delamination, "
            f"rectilinear labyrinth entropy, or siphon flood hazard ({ceiling_slab_peel_probability_pct:.1f}% peel risk, "
            f"{maze_disorientation_entropy_score:.1f}/100 maze entropy, "
            f"{rapid_dissolution_siphon_flood_risk_pct:.1f}% siphon flood risk). Retreat along tagged survey line "
            "to stable thick-bedded fossil trunk galleries or surface doline exits."
        )
    elif (
        ceiling_slab_peel_probability_pct >= 50.0
        or maze_disorientation_entropy_score >= 52.0
        or rapid_dissolution_siphon_flood_risk_pct >= 45.0
        or selenite_crystal_shear_hazard_pct >= 55.0
    ):
        risk_level = "high"
        navigation_strategy = (
            "CONTINUOUS SURVEY-LINE & SILENT BREAKDOWN TRANSIT: Rig numbered reflective directional tags "
            "at every joint intersection, maintain <60 dB acoustic discipline under thin gypsum beds, "
            "and armor ropes and hands with Aramid/Kevlar protection across swallowtail selenite ledges."
        )
    elif (
        ceiling_slab_peel_probability_pct >= 26.0
        or maze_disorientation_entropy_score >= 26.0
        or rapid_dissolution_siphon_flood_risk_pct >= 22.0
        or selenite_crystal_shear_hazard_pct >= 28.0
    ):
        risk_level = "moderate"
        navigation_strategy = (
            "CONTROLLED DISTOX SURVEY & PERIMETER ARCH PASSAGE: Log back-bearings at all cross-joints, "
            "skirt the walls of anhydrite-hydration domes, and monitor surface weather forecasts before "
            "entering interstratal gypsum-marl crawls."
        )
    else:
        risk_level = "low"
        navigation_strategy = (
            "NOMINAL THICK-BEDDED EVAPORITE GALLERY WALK: Thick competent gypsum roof strata, low junction "
            "density, and dry surface conditions permit standard single-file survey progression along "
            "marked floor tracks."
        )

    return {
        "junction_count_per_100m": round(float(junction_count_per_100m), 1),
        "ceiling_bed_thickness_cm": round(float(ceiling_bed_thickness_cm), 1),
        "surface_rain_inflow_mm_hr": round(float(surface_rain_inflow_mm_hr), 1),
        "anhydrite_swelling_pct": round(float(anhydrite_swelling_pct), 1),
        "party_acoustic_decibels": round(float(party_acoustic_decibels), 1),
        "ceiling_slab_peel_probability_pct": ceiling_slab_peel_probability_pct,
        "maze_disorientation_entropy_score": maze_disorientation_entropy_score,
        "rapid_dissolution_siphon_flood_risk_pct": rapid_dissolution_siphon_flood_risk_pct,
        "selenite_crystal_shear_hazard_pct": selenite_crystal_shear_hazard_pct,
        "risk_level": risk_level,
        "safety_status": risk_level,
        "navigation_strategy": navigation_strategy,
        "warnings": warnings,
        "recommendations": recommendations,
    }


_EXPLICIT_GYPSUM_KARST_TERMS: tuple[str, ...] = (
    "gypsum karst",
    "gypsum-karst",
    "gypsum_karst",
    "gypsum maze",
    "gypsum-maze",
    "gypsum cave",
    "gypsum caves",
    "gypsum labyrinth",
    "evaporite karst",
    "evaporite-karst",
    "evaporite maze",
    "evaporite breakdown",
    "breakdown-hall",
    "breakdown hall",
    "breakdown halls",
    "anhydrite hydration",
    "anhydrite-hydration",
    "anhydrite swelling",
    "hydration dome",
    "optimisticeskaja",
    "optymistychna",
    "ozerna",
    "podolia",
    "vena del gesso",
    "vena-del-gesso",
    "spipola",
    "acquafredda",
    "gessi bolognesi",
    "yesos de sorbas",
    "karst en yesos",
    "covadura",
    "cueva de covadura",
    "parks ranch cave",
    "parks ranch",
    "yeso-castile",
    "swallowtail selenite",
    "selenite karst",
    "selenite crystal shear",
    "ceiling slab peel",
    "optimisticeskaja-ozerna-podolia-ukraine",
    "spipola-acquafredda-vena-del-gesso-italy",
    "sorbas-covadura-yesos-almeria-spain",
    "parks-ranch-chandelier-gypsum-new-mexico",
)

_OTHER_DOMAIN_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return label",
    "shipping",
    "tracking number",
    # Cave mineralogy & classic US limestone/sulfuric speleothem exclusions
    "lechuguilla",
    "chandelier room",
    "chandelier ballroom",
    "carlsbad",
    "rookery",
    "cave pearl",
    "cave pearls",
    "pisolith",
    "pisoliths",
    "organ cave",
    "anthodite",
    "frozen niagara",
    "blanchard springs",
    "coral grotto",
    "helictite",
    "calcite saturation",
    "pool agitation",
    # Classic US SRT pit caving exclusions
    "fantastic pit",
    "ellison's cave",
    "ellisons cave",
    "mammoth cave",
    "cleaveland avenue",
    "tumbling rock",
    "leprechaun cave",
    "great x pit",
    "columbine crevasse",
    "slaughter canyon",
    # Cenote halocline / tiankeng / tsingy / talus cold-trap / salar exclusions
    "cenote",
    "halocline",
    "anchialine",
    "ox bel ha",
    "angelita",
    "sac actun",
    "tiankeng",
    "xiaozhai",
    "dashiwei",
    "golondrinas",
    "sarisarinama",
    "sima humboldt",
    "tsingy",
    "bemaraha",
    "ankarana",
    "mulu pinnacles",
    "shilin",
    "talus cold trap",
    "talus-cold-trap",
    "algific",
    "mahoosuc",
    "king ravine",
    "indian pass",
    "kamenec",
    "salar de uyuni",
    "salar de atacama",
    "salar de arizaro",
    "salar de chalviri",
    "halite pressure ridge",
    "eisriesenwelt",
    "scarisoara",
    "bandera ice cave",
    "lofthellir",
    "matanuska",
    "kazumura",
    "ape cave",
)


def is_gypsum_karst_query(query: str) -> bool:
    """Return True if the user query targets Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology."""
    if not query or not query.strip():
        return False
    q = query.strip().lower()

    if any(excl in q for excl in _OTHER_DOMAIN_EXCLUSIONS):
        return False

    if any(term in q for term in _EXPLICIT_GYPSUM_KARST_TERMS):
        return True

    has_gypsum_or_evaporite = any(
        w in q
        for w in (
            "gypsum",
            "evaporite",
            "selenite",
            "anhydrite",
            "satin-spar",
            "satin spar",
            "sorbas",
        )
    )
    has_maze_or_mechanic = any(
        w in q
        for w in (
            "karst",
            "maze",
            "labyrinth",
            "breakdown",
            "ceiling bed",
            "ceiling slab",
            "junction count",
            "dissolution",
            "siphon flood",
            "speleology",
            "doline",
        )
    )
    return has_gypsum_or_evaporite and has_maze_or_mechanic


def detect_gypsum_karst_intent(query: str) -> bool:
    """Alias for is_gypsum_karst_query()."""
    return is_gypsum_karst_query(query)


def extract_gypsum_karst_params(query: str) -> dict[str, Any]:
    """Extract gypsum-karst site_id and calculator parameters from a natural-language query."""
    q = (query or "").lower()

    matched_site: dict[str, Any] | None = None
    for token in (
        "optimisticeskaja-ozerna-podolia-ukraine",
        "spipola-acquafredda-vena-del-gesso-italy",
        "sorbas-covadura-yesos-almeria-spain",
        "parks-ranch-chandelier-gypsum-new-mexico",
        "optimisticeskaja",
        "optymistychna",
        "ozerna",
        "podolia",
        "spipola",
        "acquafredda",
        "vena del gesso",
        "vena-del-gesso",
        "gessi bolognesi",
        "yesos de sorbas",
        "covadura",
        "sorbas",
        "parks ranch",
        "parks-ranch",
        "yeso-castile",
    ):
        if token in q:
            matched_site = get_site_by_id(token)
            if matched_site is not None:
                break

    site_defaults: dict[str, Any] = matched_site or GYPSUM_KARST_SITES[0]
    junction_count_per_100m = float(site_defaults["default_junction_count_per_100m"])
    ceiling_bed_thickness_cm = float(site_defaults["default_ceiling_bed_thickness_cm"])
    surface_rain_inflow_mm_hr = float(site_defaults["default_surface_rain_inflow_mm_hr"])
    anhydrite_swelling_pct = float(site_defaults["default_anhydrite_swelling_pct"])
    party_acoustic_decibels = float(site_defaults["default_party_acoustic_decibels"])
    has_calc_params = False

    # 1. Junction count per 100m (2 - 45)
    junction_patterns = [
        r"junction(?:\s+count)?(?:\s+per\s+100\s*m)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)",
        r"(\d+(?:\.\d+)?)\s*junctions?\s*(?:per\s*100\s*m|/100\s*m)?",
    ]
    for pat in junction_patterns:
        m = re.search(pat, q)
        if m:
            junction_count_per_100m = max(2.0, min(45.0, float(m.group(1))))
            has_calc_params = True
            break

    # 2. Ceiling bed thickness (cm) (2 - 120)
    thickness_patterns = [
        r"(?:ceiling\s+)?(?:bed\s+|slab\s+)?thickness\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*cm\b",
        r"(\d+(?:\.\d+)?)\s*cm\s+(?:ceiling\s+)?(?:bed\s+|slab\s+)?thickness",
        r"ceiling\s+bed\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*cm\b",
    ]
    for pat in thickness_patterns:
        m = re.search(pat, q)
        if m:
            ceiling_bed_thickness_cm = max(2.0, min(120.0, float(m.group(1))))
            has_calc_params = True
            break

    # 3. Surface rain inflow (mm/hr) (0 - 80)
    rain_patterns = [
        r"(?:surface\s+)?(?:rain\s+|storm\s+)?inflow\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:mm/hr|mm/h|mm)\b",
        r"(\d+(?:\.\d+)?)\s*(?:mm/hr|mm/h)\s*(?:surface\s+)?(?:rain\s+)?(?:inflow)?",
    ]
    for pat in rain_patterns:
        m = re.search(pat, q)
        if m:
            surface_rain_inflow_mm_hr = max(0.0, min(80.0, float(m.group(1))))
            has_calc_params = True
            break

    # 4. Anhydrite swelling (%) (0 - 65)
    swelling_patterns = [
        r"(?:anhydrite\s+)?swelling(?:\s+pct|\s+percentage)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*%",
        r"(\d+(?:\.\d+)?)\s*%\s*(?:anhydrite\s+)?swelling",
    ]
    for pat in swelling_patterns:
        m = re.search(pat, q)
        if m:
            anhydrite_swelling_pct = max(0.0, min(65.0, float(m.group(1))))
            has_calc_params = True
            break

    # 5. Party acoustic decibels (dB) (35 - 110)
    acoustic_patterns = [
        r"(?:party\s+)?acoustic(?:s|\s+decibels|\s+level)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*db\b",
        r"(\d+(?:\.\d+)?)\s*db\s*(?:party\s+)?(?:acoustic|noise)?",
    ]
    for pat in acoustic_patterns:
        m = re.search(pat, q)
        if m:
            party_acoustic_decibels = max(35.0, min(110.0, float(m.group(1))))
            has_calc_params = True
            break

    if any(w in q for w in ("calculate", "calculator", "compute")) and not has_calc_params:
        has_calc_params = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "site": matched_site,
        "junction_count_per_100m": junction_count_per_100m,
        "ceiling_bed_thickness_cm": ceiling_bed_thickness_cm,
        "surface_rain_inflow_mm_hr": surface_rain_inflow_mm_hr,
        "anhydrite_swelling_pct": anhydrite_swelling_pct,
        "party_acoustic_decibels": party_acoustic_decibels,
        "has_calc_params": has_calc_params,
    }


def format_gypsum_karst_response(query: str) -> dict[str, Any]:
    """Build a structured gypsum-karst response payload for chat and SSE endpoints."""
    params: dict[str, Any] = extract_gypsum_karst_params(query)
    matched_site: dict[str, Any] | None = params["site"]
    has_calc = bool(params["has_calc_params"])

    calc_result: dict[str, Any] = calculate_gypsum_karst(
        junction_count_per_100m=float(params["junction_count_per_100m"]),
        ceiling_bed_thickness_cm=float(params["ceiling_bed_thickness_cm"]),
        surface_rain_inflow_mm_hr=float(params["surface_rain_inflow_mm_hr"]),
        anhydrite_swelling_pct=float(params["anhydrite_swelling_pct"]),
        party_acoustic_decibels=float(params["party_acoustic_decibels"]),
    )

    if has_calc:
        action = "gypsum_karst_calculated"
        matched_sites: list[dict[str, Any]] = (
            [matched_site] if matched_site else list(GYPSUM_KARST_SITES)
        )
    elif matched_site is not None:
        action = "gypsum_karst_lookup"
        matched_sites = [matched_site]
    else:
        action = "gypsum_karst_info"
        matched_sites = list(GYPSUM_KARST_SITES)

    site_summary = (
        f"{matched_site['name']} ({matched_site['country']}, {matched_site['elevation_range']})"
        if matched_site
        else "Global Subterranean Gypsum-Karst Dissolution Mazes & Evaporite Breakdown Halls (Optimisticeskaja/Ozerna, Vena del Gesso/Spipola, Yesos de Sorbas/Covadura, Parks Ranch Cave)"
    )

    summary_lines: list[str] = [
        f"### Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Assessment: {site_summary}",
        f"- **Safety / Risk Level:** `{calc_result['risk_level'].upper()}`",
        f"- **Ceiling Slab Peel Probability:** `{calc_result['ceiling_slab_peel_probability_pct']:.1f}%` "
        f"(Ceiling Bed `{calc_result['ceiling_bed_thickness_cm']:.1f} cm`, "
        f"Anhydrite Swelling `{calc_result['anhydrite_swelling_pct']:.1f}%`, "
        f"Party Acoustics `{calc_result['party_acoustic_decibels']:.0f} dB`)",
        f"- **Maze Disorientation Entropy Score:** `{calc_result['maze_disorientation_entropy_score']:.1f} / 100` "
        f"(Junction Density `{calc_result['junction_count_per_100m']:.1f} / 100m`)",
        f"- **Rapid-Dissolution Siphon Flood Risk:** `{calc_result['rapid_dissolution_siphon_flood_risk_pct']:.1f}%` "
        f"(Surface Rain Inflow `{calc_result['surface_rain_inflow_mm_hr']:.1f} mm/hr`)",
        f"- **Selenite Crystal Shear Hazard:** `{calc_result['selenite_crystal_shear_hazard_pct']:.1f}%`",
        f"- **Navigation Strategy:** {calc_result['navigation_strategy']}",
    ]
    if matched_site:
        summary_lines.append(
            f"- **Site Navigation Protocol:** {matched_site['navigation_protocol']}"
        )
        summary_lines.append(
            f"- **Evaporite Conservation Protocol:** {matched_site['conservation_protocol']}"
        )
    if calc_result["warnings"]:
        summary_lines.append("- **Active Warnings:** " + " | ".join(calc_result["warnings"]))
    summary_lines.append(
        "- **Essential Gear:** "
        + "; ".join(item["item"] for item in GYPSUM_KARST_GEAR_CHECKLIST[:4])
    )

    formatted_text = "\n".join(summary_lines)

    return {
        "action": action,
        "query": query,
        "site": dict(matched_site) if matched_site else None,
        "matched_sites": [dict(s) for s in matched_sites],
        "sites": [dict(s) for s in GYPSUM_KARST_SITES],
        "calculation": calc_result,
        "gear_checklist": get_gear_checklist(),
        "answer": formatted_text,
        "formatted_response": formatted_text,
    }


def build_gypsum_karst_prompt(info_or_query: dict[str, Any] | str) -> str:
    """Build the system prompt grounding block for LLM generation on gypsum-karst queries."""
    info: dict[str, Any] = (
        format_gypsum_karst_response(info_or_query)
        if isinstance(info_or_query, str)
        else info_or_query
    )
    calc: dict[str, Any] = info.get("calculation") or {}
    site: dict[str, Any] | None = info.get("site")
    site_header = (
        f"Target Site: {site['name']} ({site['country']}, {site['elevation_range']}, morphology={site['morphology']})"
        if site
        else "Target Domain: Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology"
    )
    warnings_str = "; ".join(calc.get("warnings", [])) or "None"
    recs_str = "; ".join(calc.get("recommendations", []))
    return (
        "\n\n[SUBTERRANEAN GYPSUM-KARST DISSOLUTION MAZE & EVAPORITE BREAKDOWN-HALL SPELEOLOGY GUIDE]\n"
        f"{site_header}\n"
        f"Action: {info.get('action', 'gypsum_karst_info')}\n"
        f"Risk Level: {calc.get('risk_level', 'moderate')}\n"
        f"Inputs: junction_count_per_100m={calc.get('junction_count_per_100m')}, "
        f"ceiling_bed_thickness_cm={calc.get('ceiling_bed_thickness_cm')}, "
        f"surface_rain_inflow_mm_hr={calc.get('surface_rain_inflow_mm_hr')}, "
        f"anhydrite_swelling_pct={calc.get('anhydrite_swelling_pct')}, "
        f"party_acoustic_decibels={calc.get('party_acoustic_decibels')}\n"
        f"Calculated Metrics: ceiling_slab_peel_probability_pct={calc.get('ceiling_slab_peel_probability_pct')}%, "
        f"maze_disorientation_entropy_score={calc.get('maze_disorientation_entropy_score')}/100, "
        f"rapid_dissolution_siphon_flood_risk_pct={calc.get('rapid_dissolution_siphon_flood_risk_pct')}%, "
        f"selenite_crystal_shear_hazard_pct={calc.get('selenite_crystal_shear_hazard_pct')}%\n"
        f"Navigation Strategy: {calc.get('navigation_strategy', '')}\n"
        f"Warnings: {warnings_str}\n"
        f"Recommendations: {recs_str}\n"
        "Provide concrete subterranean gypsum-karst dissolution maze and evaporite breakdown-hall speleology "
        "guidance covering EN 12542 survey line and reflective junction marker discipline in 3D rectilinear "
        "artesian joint labyrinths, anhydrite-to-gypsum hydration swelling and ceiling slab peel avoidance, "
        "ephemeral sinkhole flash-flood siphon evacuation, and Kevlar/Aramid protection against swallowtail "
        "selenite crystal blades.\n"
    )


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a standalone fallback chat response dictionary with gypsum_karst_info."""
    info: dict[str, Any] = format_gypsum_karst_response(query)
    return {
        "answer": info["formatted_response"],
        "context": [s["name"] for s in info["matched_sites"]],
        "gypsum_karst_info": info,
    }


def generate_stream_events(query: str) -> Iterator[dict[str, Any]]:
    """Yield SSE event dictionaries for standalone gypsum-karst streaming."""
    info: dict[str, Any] = format_gypsum_karst_response(query)
    text = str(info["formatted_response"])
    midpoint = max(1, len(text) // 2)
    yield {
        "answer": text[:midpoint],
        "context": [s["name"] for s in info["matched_sites"]],
        "gypsum_karst_info": info,
    }
    yield {
        "answer": text[midpoint:],
    }
    yield {
        "done": True,
        "gypsum_karst_info": info,
    }
