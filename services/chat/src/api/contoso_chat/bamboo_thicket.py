"""Montane Bamboo-Thicket (Chusquea / Sasa) & Cloud-Forest Ridge-Crest Bushwhacking Guide.

Provides deterministic solid- and hollow-culm bamboo rebound whip-back kinetic energy modeling,
epiphytic water-film culm slip probability, net ridge-crest advance rate (m/hr), diagonal
machete-cut "punji stump" puncture risk, curated montane bamboo-thicket sites across Costa Rica,
Japan, Uganda, and Peru, and specialized cloud-forest bushwhacking gear checklists for Contoso
Outdoor Company customers.
"""

from __future__ import annotations

import re
from collections.abc import Generator
from typing import Any


class _AttrDict(dict[str, Any]):
    """Dictionary supporting both key and attribute access."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc


BAMBOO_THICKET_SITES: list[_AttrDict] = [
    _AttrDict(
        {
            "id": "chirripo-talamanca-chusquea-costa-rica",
            "name": "Cordillera de Talamanca & Cerro Kamuk Chusquea Cloud-Ridge",
            "country": "Costa Rica",
            "region": "La Amistad International Park & Cordillera de Talamanca, Costa Rica",
            "elevation_range": "2400-3549 m (7874-11644 ft)",
            "max_elevation_m": 3549,
            "ecotype": "chusquea-solid-culm-cloud-ridge",
            "morphology": "chusquea-solid-culm-cloud-ridge",
            "difficulty": "extreme",
            "default_culm_density_per_sq_m": 82.0,
            "default_culm_diameter_mm": 28.0,
            "default_ridge_slope_deg": 36.0,
            "default_wetness_film_pct": 88.0,
            "default_follower_spacing_m": 4.0,
            "primary_hazard": (
                "Interlocking solid-pith Chusquea talamancensis and Chusquea subtessellata culms "
                "(70-100 culms/m²) storing high flexural rebound energy, concealed peat root-void drop-offs "
                "along cloud-shrouded knife-edge divides, and diagonal machete-cut punji stubs."
            ),
            "threading_strategy": (
                "Avoid indiscriminate high-angle machete slashing that creates ankle-level diagonal spear "
                "stubs; instead wedge solid Chusquea culms aside at basal root nodes, thread low under "
                "arched culm tunnels, and enforce a minimum 4.0 m follower spacing."
            ),
            "navigation_protocol": (
                "Follow the true hydrographic divide spine using barometric altimeter and L1/L5 multi-GNSS "
                "waypoints; never drop into false tapir trails descending into steep Atlantic/Pacific "
                "headwater ravines."
            ),
            "routing_strategy": (
                "Basal Culm-Wedge Threading & Hydrographic Divide Spine Micro-Bearing Discipline"
            ),
            "progression_protocol": (
                "Basal Culm-Wedge Threading & Hydrographic Divide Spine Micro-Bearing Discipline"
            ),
            "field_notes": (
                "Unlike hollow lowland bamboos, neotropical montane Chusquea possesses solid woody culms "
                "and dense whorled nodal branchlets that trap cold trade-wind cloud condensation."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "hidaka-sasa-kurilensis-hokkaido-japan",
            "name": "Hidaka Mountains Poroshiri-dake Sasa kurilensis Chishima-zasa Crest",
            "country": "Japan",
            "region": "Hidaka Sanmyaku Quasi-National Park, Hokkaido, Japan",
            "elevation_range": "1350-2052 m (4429-6732 ft)",
            "max_elevation_m": 2052,
            "ecotype": "sasa-kurilensis-dwarf-snow-bamboo",
            "morphology": "sasa-kurilensis-dwarf-snow-bamboo",
            "difficulty": "challenging",
            "default_culm_density_per_sq_m": 68.0,
            "default_culm_diameter_mm": 14.0,
            "default_ridge_slope_deg": 30.0,
            "default_wetness_film_pct": 78.0,
            "default_follower_spacing_m": 3.5,
            "primary_hazard": (
                "Chest-to-head-high Sasa kurilensis (Chishima-zasa) culm mats laid horizontally downslope "
                "by winter snowpack creep, creating ultra-slick silica-waxed culm ramps, hidden boulder "
                "ankle traps, and brown-bear (Higuma) zero-visibility encounters."
            ),
            "threading_strategy": (
                "Ascend by gripping upslope Sasa root-collars (Yabu-kogi technique) with cut-resistant "
                "gloves while stepping sideways onto culm bases rather than slick horizontal internodes; "
                "sound bear bells and vocal calls every 60 seconds."
            ),
            "navigation_protocol": (
                "Check sighting-compass bearings at every cirque shoulder above the Sasa canopy; keep "
                "pack profile narrow with zero external straps to prevent snagging in procumbent culms."
            ),
            "routing_strategy": (
                "Yabu-Kogi Basal Root-Collar Grip & Procumbent Culm-Grain Side-Stepping"
            ),
            "progression_protocol": (
                "Yabu-Kogi Basal Root-Collar Grip & Procumbent Culm-Grain Side-Stepping"
            ),
            "field_notes": (
                "Hokkaido's Chishima-zasa forms unbroken 1.5-2.5 m subalpine carpets across untrailed "
                "Hidaka ridges, where morning dew and orographic drizzle soak hikers within minutes."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "rwenzori-virunga-yushania-uganda",
            "name": "Rwenzori & Virunga Yushania alpina Montane Bamboo Belt",
            "country": "Uganda",
            "region": "Rwenzori Mountains & Mgahinga Virunga Volcanoes, Western Uganda",
            "elevation_range": "2500-3200 m (8202-10499 ft)",
            "max_elevation_m": 3200,
            "ecotype": "yushania-alpina-montane-belt",
            "morphology": "yushania-alpina-montane-belt",
            "difficulty": "moderate",
            "default_culm_density_per_sq_m": 32.0,
            "default_culm_diameter_mm": 46.0,
            "default_ridge_slope_deg": 22.0,
            "default_wetness_film_pct": 72.0,
            "default_follower_spacing_m": 4.5,
            "primary_hazard": (
                "Tall hollow-culm Yushania alpina stands (8-15 m height) over deep black volcanic/peat "
                "bog wallows, slick decaying culm-sheath litter, and sudden Afromontane mist whiteouts."
            ),
            "threading_strategy": (
                "Step deliberately across horizontal fallen culm corduroy bridges or firm rhizome pedestals; "
                "avoid vaulting over fractured hollow culms that splinter into longitudinal razor shards."
            ),
            "navigation_protocol": (
                "Use established elephant/buffalo ridge corridors with caution, verifying azimuth continuity "
                "toward the upper Erica heather transition zone."
            ),
            "routing_strategy": (
                "Rhizome Pedestal Stepping & Hollow-Culm Splinter Avoidance Corridor Transit"
            ),
            "progression_protocol": (
                "Rhizome Pedestal Stepping & Hollow-Culm Splinter Avoidance Corridor Transit"
            ),
            "field_notes": (
                "East Africa's Afromontane bamboo zone forms a distinct 2500-3200 m elevational belt where "
                "silica-rich culm sheaths and saturated humic soils demand high-traction boots and gaiters."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "vilcabamba-colani-chusquea-peru",
            "name": "Cordillera Vilcabamba & Apurímac Chusquea scandens Knife-Edge",
            "country": "Peru",
            "region": "Cordillera Vilcabamba & Apurímac Cloud-Forest Escarpment, Cusco, Peru",
            "elevation_range": "2600-3750 m (8530-12303 ft)",
            "max_elevation_m": 3750,
            "ecotype": "guadua-spiny-riparian-tangle",
            "morphology": "guadua-spiny-riparian-tangle",
            "difficulty": "extreme",
            "default_culm_density_per_sq_m": 90.0,
            "default_culm_diameter_mm": 34.0,
            "default_ridge_slope_deg": 42.0,
            "default_wetness_film_pct": 92.0,
            "default_follower_spacing_m": 4.5,
            "primary_hazard": (
                "Scandent climbing Chusquea scandens and lower-montane spiny Guadua tangles draping "
                "40°+ shale/granite knife-edge ridges, cantilevered moss-bamboo cornices over vertical "
                "abysses, and silica-spined nodal hooks."
            ),
            "threading_strategy": (
                "Probe every ridge-crest foothold through the bamboo root mat with a steel-tipped staff "
                "before committing body weight; cut only horizontal tension culms flush to the ground "
                "(90° flat cut) to prevent punji-stump impalement."
            ),
            "navigation_protocol": (
                "Maintain rope-length voice and whistle contact along narrow Ceja de Selva cloud-forest "
                "spurs; log GPS trackback points every 100 m of net ridge advance."
            ),
            "routing_strategy": (
                "Flush-Cut Tension Relief & Probed Ridge-CorniceBelay Threading"
            ),
            "progression_protocol": (
                "Flush-Cut Tension Relief & Probed Ridge-CorniceBelay Threading"
            ),
            "field_notes": (
                "In the Peruvian Ceja de Selva, climbing Chusquea weaves with Weinmannia cloud-forest "
                "roots to form suspended false floors several meters above actual bedrock."
            ),
        }
    ),
]

BAMBOO_SITES = BAMBOO_THICKET_SITES

BAMBOO_THICKET_GEAR_CHECKLIST: list[_AttrDict] = [
    _AttrDict(
        {
            "item": "ANSI Z87.1 Polycarbonate Anti-Fog Mesh/Lens Eye Shield & Chin-Strapped Helmet",
            "category": "ocular_cranial_protection",
            "priority": "essential",
            "rationale": (
                "Prevents corneal lacerations and orbital trauma from high-velocity Chusquea/Sasa culm "
                "rebound whip-back and silica-sharp nodal branchlets."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "ANSI Cut-Level A5 Kevlar-Palm Bushwhacking Gloves with Wrist Gauntlets",
            "category": "hand_armor",
            "priority": "essential",
            "rationale": (
                "Protects palms and tendons from razor-sharp split bamboo silica epidermis, irritative "
                "culm-sheath trichomes (miates), and thorny Guadua nodal hooks during Yabu-kogi pulling."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "1000D Ballistic Cordura Knee-High Gaiters & Puncture-Resistant Midsole Boots",
            "category": "lower_limb_puncture_defense",
            "priority": "essential",
            "rationale": (
                "Defends shins, calves, and plantar arches against diagonal machete-cut punji stumps "
                "and fractured culm spears concealed in cloud-forest leaf litter."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "270 mm Pull-Stroke Pruning Saw & Heavy-Spine Latin Machete in Rigid Kydex Sheath",
            "category": "selective_clearing",
            "priority": "essential",
            "rationale": (
                "Pull-stroke saw enables clean 90-degree flush cuts at basal nodes without leaving "
                "diagonal punji spikes or triggering spring-loaded culm whip-back."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "Snag-Free Internal-Frame Tubular Alpine Pack (No External Mesh Pockets or Loops)",
            "category": "streamlined_load_carriage",
            "priority": "essential",
            "rationale": (
                "Eliminates backward hang-ups and collar-strangulation hazards when crawling or "
                "threading beneath interlocking 70+ culm/m² Chusquea and Sasa arches."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "Dual-Band L1/L5 Multi-GNSS Receiver, Barometric Altimeter & Baseplate Mirror Compass",
            "category": "cloud_ridge_wayfinding",
            "priority": "essential",
            "rationale": (
                "Maintains true hydrographic ridge-spine alignment inside zero-horizon 3-4 m bamboo "
                "tunnels and dense orographic cloud-forest fog."
            ),
        }
    ),
]


def get_all_sites() -> list[_AttrDict]:
    """Return all curated montane bamboo-thicket & cloud-forest ridge bushwhacking sites."""
    return list(BAMBOO_THICKET_SITES)


def get_all_bamboo_thicket_sites() -> list[_AttrDict]:
    """Alias returning all curated montane bamboo-thicket sites."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> _AttrDict | None:
    """Look up a montane bamboo-thicket site by exact ID or fuzzy substring."""
    if not site_id:
        return None
    norm = site_id.strip().lower()
    for site in BAMBOO_THICKET_SITES:
        if site["id"].lower() == norm:
            return site
    for site in BAMBOO_THICKET_SITES:
        if norm in site["id"].lower() or norm in site["name"].lower():
            return site
    return None


def get_bamboo_thicket_site_by_id(site_id: str) -> _AttrDict | None:
    """Alias for get_site_by_id."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    ecotype: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
    morphology: str | None = None,
) -> list[_AttrDict]:
    """Filter bamboo-thicket sites by country, ecotype, difficulty, and/or search term."""
    results = list(BAMBOO_THICKET_SITES)
    if country:
        c_norm = country.strip().lower()
        results = [
            s for s in results if c_norm in s["country"].lower() or c_norm in s["region"].lower()
        ]
    effective_eco = ecotype or morphology
    if effective_eco:
        e_norm = effective_eco.strip().lower()
        results = [s for s in results if e_norm in s["ecotype"].lower()]
    if difficulty:
        d_norm = difficulty.strip().lower()
        results = [s for s in results if d_norm == s["difficulty"].lower()]
    if search:
        s_norm = search.strip().lower()
        results = [
            s
            for s in results
            if s_norm in s["id"].lower()
            or s_norm in s["name"].lower()
            or s_norm in s["country"].lower()
            or s_norm in s["region"].lower()
            or s_norm in s["ecotype"].lower()
            or s_norm in s["primary_hazard"].lower()
            or s_norm in s["field_notes"].lower()
        ]
    return results


def get_gear_checklist() -> list[_AttrDict]:
    """Return the 6-item essential montane bamboo-thicket bushwhacking gear checklist."""
    return list(BAMBOO_THICKET_GEAR_CHECKLIST)


def calculate_bamboo_thicket(
    culm_density_per_sq_m: float = 45.0,
    culm_diameter_mm: float = 22.0,
    ridge_slope_deg: float = 28.0,
    wetness_film_pct: float = 70.0,
    follower_spacing_m: float = 3.5,
) -> _AttrDict:
    """Calculate culm rebound whip kinetic energy, slip probability, advance rate, and punji risk.

    Validates all 5 physical parameters and returns deterministic bushwhacking field metrics.
    """
    if not (5.0 <= culm_density_per_sq_m <= 120.0):
        raise ValueError(
            "culm_density_per_sq_m must be between 5.0 and 120.0 culms/m² "
            f"(received {culm_density_per_sq_m})"
        )
    if not (4.0 <= culm_diameter_mm <= 80.0):
        raise ValueError(
            f"culm_diameter_mm must be between 4.0 and 80.0 mm (received {culm_diameter_mm})"
        )
    if not (0.0 <= ridge_slope_deg <= 55.0):
        raise ValueError(
            f"ridge_slope_deg must be between 0.0 and 55.0 deg (received {ridge_slope_deg})"
        )
    if not (0.0 <= wetness_film_pct <= 100.0):
        raise ValueError(
            f"wetness_film_pct must be between 0.0 and 100.0 % (received {wetness_film_pct})"
        )
    if not (0.5 <= follower_spacing_m <= 15.0):
        raise ValueError(
            f"follower_spacing_m must be between 0.5 and 15.0 m (received {follower_spacing_m})"
        )

    # Normalized components (0.0 to 1.0)
    dens_norm = (culm_density_per_sq_m - 5.0) / 115.0
    diam_norm = (culm_diameter_mm - 4.0) / 76.0
    slope_norm = ridge_slope_deg / 55.0
    wet_norm = wetness_film_pct / 100.0
    spacing_deficit = max(0.0, (10.0 - follower_spacing_m) / 9.5)

    # Rebound whip-back kinetic energy (Joules) at follower position
    raw_whip_j = (
        3.0
        + 38.0 * diam_norm
        + 16.0 * dens_norm
        + 18.0 * spacing_deficit
        + 8.0 * slope_norm
    )
    rebound_whip_kinetic_j = round(max(2.0, min(95.0, raw_whip_j)), 1)

    # Wet silica-culm slip probability (%)
    raw_slip_pct = (
        6.0
        + 44.0 * wet_norm
        + 34.0 * slope_norm
        + 10.0 * dens_norm
        + 5.0 * diam_norm
    )
    wet_culm_slip_probability_pct = round(max(4.0, min(99.0, raw_slip_pct)), 1)

    # Net ridge-crest advance rate (meters per hour)
    raw_advance_m_hr = (
        480.0
        - 240.0 * dens_norm
        - 95.0 * slope_norm
        - 60.0 * diam_norm
        - 45.0 * wet_norm
    )
    net_advance_meters_per_hour = round(max(25.0, min(600.0, raw_advance_m_hr)), 1)

    # Diagonal machete-cut / fractured culm "punji stump" puncture risk (%)
    raw_punji_pct = (
        5.0
        + 42.0 * dens_norm
        + 24.0 * diam_norm
        + 18.0 * slope_norm
        + 10.0 * wet_norm
    )
    punji_stump_puncture_risk_pct = round(max(3.0, min(98.5, raw_punji_pct)), 1)

    # Risk classification & threading strategy
    if (
        rebound_whip_kinetic_j >= 48.0
        or wet_culm_slip_probability_pct >= 75.0
        or net_advance_meters_per_hour <= 150.0
        or punji_stump_puncture_risk_pct >= 68.0
    ):
        risk_level = "critical"
        threading_strategy = (
            "CRITICAL BAMBOO-WALL & PUNJI IMPALEMENT HAZARD: Halt high-angle machete slashing "
            "immediately; switch to 90-degree flush basal pruning cuts or low sub-canopy rhizome "
            "crawling. Enforce >= 5.0 m follower spacing with full ANSI Z87.1 eye protection and "
            "probe every ridge-crest foothold through suspended Chusquea/Sasa root mats."
        )
    elif (
        rebound_whip_kinetic_j >= 32.0
        or wet_culm_slip_probability_pct >= 55.0
        or net_advance_meters_per_hour <= 240.0
        or punji_stump_puncture_risk_pct >= 48.0
    ):
        risk_level = "high"
        threading_strategy = (
            "HIGH CULM REBOUND & WET-SILICA SLIP RISK: Use Yabu-kogi basal root-collar handholds "
            "with Kevlar A5 gloves, step sideways across culm crowns rather than slick axial "
            "internodes, and maintain at least 4.0 m spacing with verbal release callouts ('Culm!')."
        )
    elif (
        rebound_whip_kinetic_j >= 18.0
        or wet_culm_slip_probability_pct >= 35.0
        or net_advance_meters_per_hour <= 340.0
        or punji_stump_puncture_risk_pct >= 28.0
    ):
        risk_level = "moderate"
        threading_strategy = (
            "MODERATE MONTANE BAMBOO INTERLOCK: Part culm clusters laterally at chest height, "
            "keep all gear inside a streamlined pack, and check compass back-bearings along the "
            "ridge spine every 15 minutes."
        )
    else:
        risk_level = "low"
        threading_strategy = (
            "LOW BAMBOO THICKET RESISTANCE: Open montane bamboo understory corridor; maintain "
            "standard 3.0 m spacing, wear eye protection, and avoid stepping on split hollow culms."
        )

    warnings: list[str] = []
    if rebound_whip_kinetic_j >= 30.0 or follower_spacing_m < 2.5:
        warnings.append(
            f"High culm rebound whip-back energy ({rebound_whip_kinetic_j:.1f} J at "
            f"{follower_spacing_m:.1f} m follower spacing) can cause severe ocular or facial trauma "
            "if bent solid/thick culms snap back unannounced."
        )
    if wet_culm_slip_probability_pct >= 55.0 or wetness_film_pct >= 75.0:
        warnings.append(
            f"Elevated silica-epidermis slip probability ({wet_culm_slip_probability_pct:.1f}% at "
            f"{wetness_film_pct:.0f}% wetness film on {ridge_slope_deg:.0f}° slope) over procumbent "
            "downslope culms."
        )
    if punji_stump_puncture_risk_pct >= 45.0:
        warnings.append(
            f"Severe punji-stump puncture risk ({punji_stump_puncture_risk_pct:.1f}%): diagonal "
            "machete cuts or shattered culms at ankle/knee height act as concealed woody spears "
            "during a slip."
        )
    if net_advance_meters_per_hour <= 180.0:
        warnings.append(
            f"Slow net ridge-crest advance ({net_advance_meters_per_hour:.0f} m/hr in "
            f"{culm_density_per_sq_m:.0f} culms/m²) requires early bivouac planning before "
            "cloud-forest nightfall."
        )

    recommendations: list[str] = [
        "Enforce strict follower spacing (>= 4.0 m) and require the lead bushwhacker to hold bent culms until the trailing teammate acknowledges hand-off.",
        "Never slash bamboo culms at a 45-degree diagonal angle at shin or waist height; either part culms intact or saw flush (90 degrees) at the ground node.",
        "Wear ANSI Z87.1 polycarbonate eye shields, Kevlar-palm gloves, and 1000D Cordura gaiters continuously inside Chusquea, Sasa, or Yushania stands.",
    ]
    if risk_level in {"high", "critical"}:
        recommendations.append(
            "Probe ridge-crest moss and bamboo rhizome mats with a pole before committing weight to avoid cantilevered cornice collapse over cloud-forest drop-offs."
        )

    return _AttrDict(
        {
            "culm_density_per_sq_m": round(float(culm_density_per_sq_m), 1),
            "culm_diameter_mm": round(float(culm_diameter_mm), 1),
            "ridge_slope_deg": round(float(ridge_slope_deg), 1),
            "wetness_film_pct": round(float(wetness_film_pct), 1),
            "follower_spacing_m": round(float(follower_spacing_m), 1),
            "rebound_whip_kinetic_j": rebound_whip_kinetic_j,
            "wet_culm_slip_probability_pct": wet_culm_slip_probability_pct,
            "net_advance_meters_per_hour": net_advance_meters_per_hour,
            "punji_stump_puncture_risk_pct": punji_stump_puncture_risk_pct,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "threading_strategy": threading_strategy,
            "navigation_protocol": threading_strategy,
            "routing_strategy": threading_strategy,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


_STRONG_KEYWORDS: tuple[str, ...] = (
    "bamboo thicket",
    "bamboo thickets",
    "bamboo-thicket",
    "bamboo-thickets",
    "chusquea",
    "sasa kurilensis",
    "chishima-zasa",
    "chishima zasa",
    "yabu-kogi",
    "yabukogi",
    "yushania",
    "bamboo bushwhack",
    "bamboo bushwhacking",
    "cerro kamuk",
    "poroshiri-dake",
    "poroshiri dake",
    "culm density",
    "culm diameter",
    "punji stump",
    "punji stumps",
    "montane bamboo",
    "cloud-forest bamboo",
    "cloud forest bamboo",
    "vilcabamba chusquea",
    "chirripo-talamanca-chusquea-costa-rica",
    "hidaka-sasa-kurilensis-hokkaido-japan",
    "rwenzori-virunga-yushania-uganda",
    "vilcabamba-colani-chusquea-peru",
)

_CONTEXT_KEYWORDS: tuple[str, ...] = (
    "culm",
    "culms",
    "sasa",
    "guadua",
    "bamboo belt",
    "bamboo ridge",
    "rebound whip",
    "whip-back",
    "hidaka",
    "vilcabamba",
    "rwenzori",
)

_EXCLUSION_PATTERNS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return policy",
    "return label",
    "shipping",
    "tracking number",
    "turtle patrol",
    "sea turtle",
    "bamboo marker",
    "bamboo survey stakes",
    "bamboo wands",
    "sea bamboo",
    "ecklonia maxima",
    "sabana de los leones",
    "polylepis ecotone",
    "frailejon",
    "frailejón",
    "espeletia",
    "turbera",
    "distichia",
    "cushion bog",
    "spruce trap",
    "spruce traps",
    "latschenkiefer",
    "pinus mugo",
    "hai-matsu",
    "abies balsamea",
    "pneumatophore",
    "rhizophora",
    "mangrove",
    "cambium saver",
    "throwline",
    "bow drill",
    "debris hut",
    "ferro rod",
    "laterite",
    "duricrust",
    "ferricrete",
    "bauxite",
    "bowal",
    "bowé",
    "cuirasse",
    "canga",
    "serra dos carajas",
    "serra dos carajás",
    "fouta djallon",
    "mitchell plateau",
    "ngauwudu",
    "kaas plateau",
    "panchgani",
    "pisolite",
    "pisolitic",
    "buckshot gravel",
    "saprolite",
    "aluminocrete",
)


def is_bamboo_thicket_query(query: str) -> bool:
    """Return True if the user query asks about montane bamboo-thicket or cloud-forest ridge bushwhacking."""
    if not query or not query.strip():
        return False
    q_lower = query.lower()

    if any(k in q_lower for k in _STRONG_KEYWORDS):
        return True

    if any(ex in q_lower for ex in _EXCLUSION_PATTERNS):
        return False

    context_hits = sum(1 for k in _CONTEXT_KEYWORDS if k in q_lower)
    if context_hits >= 2:
        return True
    if context_hits == 1 and any(
        w in q_lower
        for w in ("bamboo", "bushwhack", "bushwhacking", "thicket", "machete", "ridge")
    ):
        return True

    return False


def detect_bamboo_thicket_intent(query: str) -> bool:
    """Alias for is_bamboo_thicket_query used by chat_request and main."""
    return is_bamboo_thicket_query(query)


def _clamp(val: float, low: float, high: float) -> float:
    return max(low, min(high, val))


def extract_bamboo_thicket_params(query: str) -> dict[str, Any]:
    """Extract bamboo-thicket site ID and physical calculator parameters from natural language."""
    q_lower = query.lower()
    matched_site: _AttrDict | None = None

    site_aliases: list[tuple[tuple[str, ...], str]] = [
        (
            ("cerro kamuk", "kamuk", "talamanca", "chirripo", "chirripó", "costa rica"),
            "chirripo-talamanca-chusquea-costa-rica",
        ),
        (
            ("hidaka", "poroshiri", "sasa kurilensis", "chishima-zasa", "chishima zasa", "hokkaido"),
            "hidaka-sasa-kurilensis-hokkaido-japan",
        ),
        (
            ("rwenzori", "virunga", "yushania", "uganda", "mgahinga"),
            "rwenzori-virunga-yushania-uganda",
        ),
        (
            ("vilcabamba", "apurimac", "apurímac", "colani", "chusquea scandens", "guadua", "peru"),
            "vilcabamba-colani-chusquea-peru",
        ),
    ]
    for keywords, sid in site_aliases:
        if any(k in q_lower for k in keywords):
            matched_site = get_site_by_id(sid)
            break

    culm_density_per_sq_m = (
        float(matched_site["default_culm_density_per_sq_m"]) if matched_site else 45.0
    )
    culm_diameter_mm = float(matched_site["default_culm_diameter_mm"]) if matched_site else 22.0
    ridge_slope_deg = float(matched_site["default_ridge_slope_deg"]) if matched_site else 28.0
    wetness_film_pct = float(matched_site["default_wetness_film_pct"]) if matched_site else 70.0
    follower_spacing_m = (
        float(matched_site["default_follower_spacing_m"]) if matched_site else 3.5
    )

    has_calc_params = any(
        w in q_lower
        for w in ("calculate", "calculator", "compute", "evaluate", "assess")
    )

    # Culm density (culms/m2, per sq m)
    m_dens = re.search(
        r"(?:culm\s+density\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:culms?\s*/\s*m2|culms?\s*per\s*sq\s*m|per\s*sq\s*m|/m2)?|"
        r"(\d+(?:\.\d+)?)\s*(?:culms?\s*/\s*m2|culms?\s*per\s*sq\s*m|culms?\s*/\s*sq\s*m))",
        q_lower,
    )
    if m_dens:
        val = float(m_dens.group(1) or m_dens.group(2))
        culm_density_per_sq_m = _clamp(val, 5.0, 120.0)
        has_calc_params = True

    # Culm diameter (mm)
    m_diam = re.search(
        r"(?:culm\s+diameter\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*mm|"
        r"(\d+(?:\.\d+)?)\s*mm\s*culm(?:\s+diameter)?)",
        q_lower,
    )
    if m_diam:
        val = float(m_diam.group(1) or m_diam.group(2))
        culm_diameter_mm = _clamp(val, 4.0, 80.0)
        has_calc_params = True

    # Ridge slope (deg / degrees)
    m_slope = re.search(
        r"(?:(?:ridge\s+)?slope\s*(?:angle\s*)?(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:deg|degrees|°)|"
        r"(\d+(?:\.\d+)?)\s*(?:deg|degrees|°)\s*(?:ridge\s+)?slope)",
        q_lower,
    )
    if m_slope:
        val = float(m_slope.group(1) or m_slope.group(2))
        ridge_slope_deg = _clamp(val, 0.0, 55.0)
        has_calc_params = True

    # Wetness film (%)
    m_wet = re.search(
        r"(?:wetness(?:\s+film)?\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*%|"
        r"(\d+(?:\.\d+)?)\s*%\s*wetness(?:\s+film)?)",
        q_lower,
    )
    if m_wet:
        val = float(m_wet.group(1) or m_wet.group(2))
        wetness_film_pct = _clamp(val, 0.0, 100.0)
        has_calc_params = True

    # Follower spacing (m)
    m_space = re.search(
        r"(?:(?:follower\s+)?spacing\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*m\b|"
        r"(\d+(?:\.\d+)?)\s*m\s*(?:follower\s+)?spacing)",
        q_lower,
    )
    if m_space:
        val = float(m_space.group(1) or m_space.group(2))
        follower_spacing_m = _clamp(val, 0.5, 15.0)
        has_calc_params = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "site": matched_site,
        "culm_density_per_sq_m": culm_density_per_sq_m,
        "culm_diameter_mm": culm_diameter_mm,
        "ridge_slope_deg": ridge_slope_deg,
        "wetness_film_pct": wetness_film_pct,
        "follower_spacing_m": follower_spacing_m,
        "has_calc_params": has_calc_params,
    }


def format_bamboo_thicket_response(query: str) -> _AttrDict:
    """Format structured montane bamboo-thicket response payload for chat and SSE pipelines."""
    params = extract_bamboo_thicket_params(query)
    matched_site: _AttrDict | None = params["site"]
    has_calc = bool(params["has_calc_params"])

    calc_result: _AttrDict = calculate_bamboo_thicket(
        culm_density_per_sq_m=float(params["culm_density_per_sq_m"]),
        culm_diameter_mm=float(params["culm_diameter_mm"]),
        ridge_slope_deg=float(params["ridge_slope_deg"]),
        wetness_film_pct=float(params["wetness_film_pct"]),
        follower_spacing_m=float(params["follower_spacing_m"]),
    )

    if has_calc:
        action = "bamboo_thicket_calculated"
    elif matched_site is not None:
        action = "bamboo_thicket_lookup"
    else:
        action = "bamboo_thicket_info"

    matched_sites = [matched_site] if matched_site is not None else list(BAMBOO_THICKET_SITES)

    summary_parts: list[str] = []
    if matched_site is not None:
        summary_parts.append(
            f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']}) — "
            f"Ecotype: `{matched_site['ecotype']}`, Difficulty: `{matched_site['difficulty']}`."
        )
        summary_parts.append(f"Primary Hazard: {matched_site['primary_hazard']}")
        summary_parts.append(f"Site Threading Strategy: {matched_site['threading_strategy']}")
    else:
        summary_parts.append(
            "**Montane Bamboo-Thicket (Chusquea / Sasa) & Cloud-Forest Ridge-Crest Bushwhacking Guide** — "
            "Covers solid-culm Chusquea cloud-ridges, procumbent Sasa kurilensis (Chishima-zasa) snow-bamboo "
            "crests, Afromontane Yushania alpina belts, and spiny Guadua/Chusquea scandens knife-edges."
        )

    summary_parts.append(
        f"**Bamboo-Thicket Bushwhacking & Culm Mechanics Assessment** "
        f"(Culm Density `{calc_result['culm_density_per_sq_m']} culms/m²`, "
        f"Culm Diameter `{calc_result['culm_diameter_mm']} mm`, "
        f"Ridge Slope `{calc_result['ridge_slope_deg']}°`, "
        f"Wetness Film `{calc_result['wetness_film_pct']}%`, "
        f"Follower Spacing `{calc_result['follower_spacing_m']} m`): "
        f"Rebound Whip Kinetic Energy `{calc_result['rebound_whip_kinetic_j']} J`, "
        f"Wet-Culm Slip Probability `{calc_result['wet_culm_slip_probability_pct']}%`, "
        f"Net Advance Rate `{calc_result['net_advance_meters_per_hour']} m/hr`, "
        f"Punji-Stump Puncture Risk `{calc_result['punji_stump_puncture_risk_pct']}%`, "
        f"Risk Level `{calc_result['risk_level'].upper()}`."
    )
    summary_parts.append(f"Recommended Threading Strategy: {calc_result['threading_strategy']}")

    summary_text = "\n\n".join(summary_parts)
    payload: dict[str, Any] = {
        "action": action,
        "query": query,
        "matched_site": matched_site,
        "matched_sites": matched_sites,
        "sites": list(BAMBOO_THICKET_SITES),
        "calculation": calc_result,
        "gear_checklist": list(BAMBOO_THICKET_GEAR_CHECKLIST),
        "summary": summary_text,
        "answer": summary_text,
    }
    return _AttrDict(payload)


def build_bamboo_thicket_prompt(query_or_info: dict[str, Any] | str) -> str:
    """Build system prompt injection block with montane bamboo-thicket data and gear checklist."""
    info: dict[str, Any] = (
        format_bamboo_thicket_response(query_or_info)
        if isinstance(query_or_info, str)
        else query_or_info
    )
    calc: dict[str, Any] = info.get("calculation") or {}
    matched_site: dict[str, Any] | None = info.get("matched_site")
    lines: list[str] = [
        "=== MONTANE BAMBOO-THICKET (CHUSQUEA / SASA) & CLOUD-FOREST RIDGE-CREST BUSHWHACKING CONTEXT ===",
        f"Action: {info.get('action', 'bamboo_thicket_info')}",
    ]
    if matched_site:
        lines.extend(
            [
                f"Matched Site: {matched_site['name']} ({matched_site['id']})",
                f"Location: {matched_site['region']}, {matched_site['country']} ({matched_site['elevation_range']})",
                f"Ecotype: {matched_site['ecotype']} | Difficulty: {matched_site['difficulty']}",
                f"Primary Hazard: {matched_site['primary_hazard']}",
                f"Site Threading Strategy: {matched_site['threading_strategy']}",
            ]
        )
    else:
        lines.append("Cataloged Montane Bamboo-Thicket & Cloud-Forest Ridge Sites:")
        for s in BAMBOO_THICKET_SITES:
            lines.append(
                f"- {s['name']} ({s['country']}, {s['ecotype']}, {s['difficulty']}): {s['threading_strategy']}"
            )

    if calc:
        lines.extend(
            [
                "Deterministic Montane Bamboo-Thicket & Culm Bushwhacking Metrics:",
                f"- Culm Density: {calc.get('culm_density_per_sq_m')} culms/m²",
                f"- Culm Diameter: {calc.get('culm_diameter_mm')} mm",
                f"- Ridge Slope: {calc.get('ridge_slope_deg')} deg",
                f"- Wetness Film: {calc.get('wetness_film_pct')}%",
                f"- Follower Spacing: {calc.get('follower_spacing_m')} m",
                f"- Rebound Whip Kinetic Energy: {calc.get('rebound_whip_kinetic_j')} J",
                f"- Wet-Culm Slip Probability: {calc.get('wet_culm_slip_probability_pct')}%",
                f"- Net Advance Rate: {calc.get('net_advance_meters_per_hour')} m/hr",
                f"- Punji-Stump Puncture Risk: {calc.get('punji_stump_puncture_risk_pct')}%",
                f"- Risk Level: {calc.get('risk_level')}",
                f"- Threading Strategy: {calc.get('threading_strategy')}",
            ]
        )
        warnings = calc.get("warnings") or []
        if warnings:
            lines.append("Active Montane Bamboo Bushwhacking Warnings:")
            for w in warnings:
                lines.append(f"  * {w}")

    lines.append("ESSENTIAL MONTANE BAMBOO-THICKET BUSHWHACKING GEAR CHECKLIST:")
    for item in BAMBOO_THICKET_GEAR_CHECKLIST:
        lines.append(f"- {item['item']} ({item['category']}): {item['rationale']}")
    lines.append("=== END MONTANE BAMBOO-THICKET BUSHWHACKING CONTEXT ===")
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return synchronous chat response dictionary for bamboo-thicket queries."""
    info: dict[str, Any] = format_bamboo_thicket_response(query)
    return {
        "answer": info["summary"],
        "bamboo_thicket_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[dict[str, Any], None, None]:
    """Yield SSE stream event dictionaries for bamboo-thicket queries."""
    info: dict[str, Any] = format_bamboo_thicket_response(query)
    yield {"bamboo_thicket_info": info, "context": []}
    for paragraph in str(info["summary"]).split("\n\n"):
        yield {"answer": paragraph + "\n\n"}
