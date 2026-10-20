"""Subterranean Ice-Filled Lava Tube & Permafrost Glacière Cave Navigation module.

Provides domain data, physics-based floor-ice friction & crampon shear safety
calculations, hoarfrost ceiling detachment modeling, cold-trap CO2 pooling
hypoxia assessment, mandatory gear checklists, and intent detection for
subterranean glacière caves and ice-filled basaltic lava tubes.
"""

from __future__ import annotations

import json
import math
import re
from collections.abc import Generator
from typing import Any, Literal

GlaciereMorphology = Literal[
    "dynamic-chimney-karst-ice",
    "stratified-firn-plug-pit",
    "static-cold-trap-lava-tube",
    "permafrost-fissure-glaciere",
]
GlaciereDifficulty = Literal["moderate", "challenging", "extreme"]
GlaciereRiskLevel = Literal["low", "moderate", "high", "critical"]
GlaciereTractionClass = Literal[
    "microspikes-10pt",
    "steel-12pt-crampons-ice-axe",
    "front-point-dual-tools-ice-screws",
    "abort-glaze-co2-collapse-hazard",
]


class _AttrDict(dict[str, Any]):
    """Dictionary subclass supporting attribute-style read access."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc


# ---------------------------------------------------------------------------
# Reference Glacière Cave Sites Catalog (4 Sites)
# ---------------------------------------------------------------------------

GLACIERE_CAVE_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "eisriesenwelt-tennengebirge-austria",
            "name": "Eisriesenwelt Dynamic Wind-Chimney Ice Labyrinth",
            "country": "Austria",
            "region": "Tennengebirge, Salzburg Alps",
            "elevation": "1,641 m",
            "elevation_m": 1641,
            "morphology": "dynamic-chimney-karst-ice",
            "difficulty": "challenging",
            "default_floor_ice_slope_deg": 24.0,
            "default_cave_air_temp_c": -1.8,
            "default_meltwater_film_mm": 1.2,
            "co2_ppm": 620.0,
            "hoarfrost_ceiling_thickness_cm": 18.0,
            "traction_recommendation": (
                "12-point steel crampons with anti-balling plates and a 55 cm technical ice axe "
                "for traversing the Great Ice Embankment (Großer Eiswall)."
            ),
            "primary_hazard": (
                "Barometric wind-chimney drafts up to 65 km/h causing rapid seasonal spring "
                "meltwater glazing over steep congelation floor ice."
            ),
            "navigation_protocol": (
                "Enter during stable winter or early-summer barometric regimes; clip into fixed "
                "guide cables along the Posselt Hall ice ramp and avoid lingering beneath thawing "
                "ceiling ice stalactites near the entrance wind throat."
            ),
            "descent_protocol": (
                "Enter during stable winter or early-summer barometric regimes; clip into fixed "
                "guide cables along the Posselt Hall ice ramp and avoid lingering beneath thawing "
                "ceiling ice stalactites near the entrance wind throat."
            ),
            "field_notes": (
                "The world's largest limestone ice cave (~42 km total passage, first 1 km ice-filled). "
                "Driven by a bidirectional chimney effect between the lower entrance (1,641 m) and "
                "upper plateau shafts (>2,100 m), pulling sub-zero winter air into the lower gallery."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "scarisoara-glaciere-apuseni-romania",
            "name": "Peștera Scărișoara Stratified Firn-Block Cold Trap",
            "country": "Romania",
            "region": "Apuseni Mountains, Transylvania",
            "elevation": "1,165 m",
            "elevation_m": 1165,
            "morphology": "stratified-firn-plug-pit",
            "difficulty": "challenging",
            "default_floor_ice_slope_deg": 28.0,
            "default_cave_air_temp_c": -2.4,
            "default_meltwater_film_mm": 0.9,
            "co2_ppm": 1350.0,
            "hoarfrost_ceiling_thickness_cm": 24.0,
            "traction_recommendation": (
                "12-point chromoly crampons with third-hand mechanical ascender backup for the "
                "48 m karst entrance shaft and Great Hall stratified ice block."
            ),
            "primary_hazard": (
                "Basal meltwater pool undercutting at the perimeter of the 100,000 m³ Holocene "
                "ice block and CO2 accumulation in the sunken Church (Biserica) stalagmite depression."
            ),
            "navigation_protocol": (
                "Descend the 48 m entrance collapse doline on fixed rigging; probe perimeter "
                "crevasses (rimaye) where the ice mass pulls away from limestone walls, and monitor "
                "CO2 ppm when descending into the Little Reserve or Church chambers."
            ),
            "descent_protocol": (
                "Descend the 48 m entrance collapse doline on fixed rigging; probe perimeter "
                "crevasses (rimaye) where the ice mass pulls away from limestone walls, and monitor "
                "CO2 ppm when descending into the Little Reserve or Church chambers."
            ),
            "field_notes": (
                "Houses one of Europe's oldest subterranean perennial ice blocks (>10,500 years BP) "
                "with horizontal organic-rich summer dust strata and cryo-calcitic pearl deposits."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "bandera-ice-cave-el-malpais-usa",
            "name": "Bandera & Candelaria Static Cold-Trap Basalt Lava Tube",
            "country": "United States",
            "region": "El Malpais National Monument, New Mexico",
            "elevation": "2,390 m",
            "elevation_m": 2390,
            "morphology": "static-cold-trap-lava-tube",
            "difficulty": "moderate",
            "default_floor_ice_slope_deg": 14.0,
            "default_cave_air_temp_c": -1.2,
            "default_meltwater_film_mm": 1.5,
            "co2_ppm": 980.0,
            "hoarfrost_ceiling_thickness_cm": 14.0,
            "traction_recommendation": (
                "10-point steel microspikes or light hinged crampons with a low-profile EN 12492 "
                "helmet to protect against sharp vesicular aa/pahoehoe ceiling breakdown."
            ),
            "primary_hazard": (
                "Balch-effect static cold-air pooling combined with fragile hoarfrost crystal domes "
                "and razor-sharp basaltic breakdown rubble concealed beneath thin glaze ice."
            ),
            "navigation_protocol": (
                "Step carefully across the collapsed skylight talus apron into the dead-end cold trap; "
                "minimize body-heat dwell time inside the main ice chamber to preserve the delicate "
                "-1 °C thermal inversion and avoid touching hexagonal ceiling hoarfrost."
            ),
            "descent_protocol": (
                "Step carefully across the collapsed skylight talus apron into the dead-end cold trap; "
                "minimize body-heat dwell time inside the main ice chamber to preserve the delicate "
                "-1 °C thermal inversion and avoid touching hexagonal ceiling hoarfrost."
            ),
            "field_notes": (
                "Porous vesicular basalt insulates a dead-end collapsed lava tube segment where dense "
                "winter air sinks via the Balch effect and remains trapped year-round despite semi-arid "
                "New Mexico summer surface temperatures exceeding 30 °C."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "lofthellir-lava-glaciere-iceland",
            "name": "Lofthellir Permafrost Basaltic Lava Tube Glacière",
            "country": "Iceland",
            "region": "Mývatn / Búrfellshraun, North Iceland",
            "elevation": "385 m",
            "elevation_m": 385,
            "morphology": "permafrost-fissure-glaciere",
            "difficulty": "extreme",
            "default_floor_ice_slope_deg": 34.0,
            "default_cave_air_temp_c": -3.2,
            "default_meltwater_film_mm": 2.2,
            "co2_ppm": 1650.0,
            "hoarfrost_ceiling_thickness_cm": 38.0,
            "traction_recommendation": (
                "Front-point 12-point technical crampons, dual compact ice tools, 13 cm stubby ice "
                "screws for thick congelation columns, and neoprene knee/elbow crawl armor."
            ),
            "primary_hazard": (
                "Sub-freezing meltwater sump pools beneath hollow ice crust bridges, narrow crawl "
                "constrictions coated in wet black glaze ice, and massive ceiling hoarfrost plates."
            ),
            "navigation_protocol": (
                "Negotiate the low entrance ice crawl on belly with waterproof dry-caving shell; "
                "belay across the steep 34° inner ice chute using short stubby ice screws placed in "
                "clear blue congelation columns (never in porous white hoarfrost)."
            ),
            "descent_protocol": (
                "Negotiate the low entrance ice crawl on belly with waterproof dry-caving shell; "
                "belay across the steep 34° inner ice chute using short stubby ice screws placed in "
                "clear blue congelation columns (never in porous white hoarfrost)."
            ),
            "field_notes": (
                "A 3,500-year-old basaltic lava tube in the Laxárdalsfjöll lava field featuring "
                "monumental perennial ice stalagmites, freezing water traps, and thick hexagonal "
                "depth-hoar ceiling plates."
            ),
        }
    ),
]

GLACIERE_SITES = GLACIERE_CAVE_SITES


# ---------------------------------------------------------------------------
# Mandatory 6-Item Glacière Caving Gear Checklist
# ---------------------------------------------------------------------------

GLACIERE_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "12-Point Chromoly Crampons with Anti-Balling Plates",
        "category": "footwear_traction",
        "priority": "essential",
        "rationale": (
            "Provides positive front-point and heel spike purchase on steep congelation floor "
            "ice and wet glaze ramps inside cold-trap lava tubes and karst shafts."
        ),
    },
    {
        "item": "Compact Technical Ice Axe / Dual Caving Ice Tools (50 cm)",
        "category": "ice_belay_arrest",
        "priority": "essential",
        "rationale": (
            "Short shaft length prevents ceiling basalt/limestone strikes in low-clearance "
            "passages while enabling self-arrest and vertical ice column progression."
        ),
    },
    {
        "item": "Stubby 13 cm Steel Ice Screws & Basalt Camming Anchors",
        "category": "rigging_protection",
        "priority": "essential",
        "rationale": (
            "Short 10-13 cm screws engage solid floor/column congelation ice without bottoming "
            "out against underlying vesicular basalt or limestone bedrock."
        ),
    },
    {
        "item": "EN 12492 Low-Profile Caving Helmet with Polycarbonate Visor",
        "category": "head_protection",
        "priority": "essential",
        "rationale": (
            "Shields cranium and face from spontaneous ceiling hoarfrost plate detachment, "
            "falling ice stalactites, and razor-sharp basaltic lavacicles."
        ),
    },
    {
        "item": "Multi-Gas CO2 / O2 Cold-Trap Atmospheric Monitor",
        "category": "atmospheric_safety",
        "priority": "essential",
        "rationale": (
            "Balch-effect static cold traps accumulate dense CO2 and volcanic/karst soil gas "
            "in dead-end lower pits where natural ventilation is absent."
        ),
    },
    {
        "item": "Cordura Dry-Caving Oversuit with Neoprene Thermal Barrier",
        "category": "thermal_protection",
        "priority": "essential",
        "rationale": (
            "Prevents conductive hypothermia when crawling through 0 °C meltwater films and "
            "abrasive basaltic breakdown coated in wet glaze ice."
        ),
    },
]


# ---------------------------------------------------------------------------
# Catalog Accessors & Filtering
# ---------------------------------------------------------------------------


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 reference subterranean glacière cave sites."""
    return list(GLACIERE_CAVE_SITES)


def get_all_glaciere_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Return a single glacière cave site by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in GLACIERE_CAVE_SITES:
        if str(site["id"]).lower() == target:
            return site
    return None


def get_glaciere_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """Filter glacière cave sites by country, morphology, difficulty, or free-text search."""
    results: list[dict[str, Any]] = list(GLACIERE_CAVE_SITES)

    if country:
        c_lower = country.strip().lower()
        results = [s for s in results if c_lower in str(s["country"]).lower()]

    if morphology:
        m_lower = morphology.strip().lower().replace("_", "-")
        results = [s for s in results if str(s["morphology"]).lower() == m_lower]

    if difficulty:
        d_lower = difficulty.strip().lower()
        results = [s for s in results if str(s["difficulty"]).lower() == d_lower]

    if search:
        q_lower = search.strip().lower()
        results = [
            s
            for s in results
            if q_lower in str(s["name"]).lower()
            or q_lower in str(s["country"]).lower()
            or q_lower in str(s["region"]).lower()
            or q_lower in str(s["morphology"]).lower()
            or q_lower in str(s["field_notes"]).lower()
            or q_lower in str(s["id"]).lower()
        ]

    return results


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6-item mandatory glacière caving gear checklist."""
    return list(GLACIERE_GEAR_CHECKLIST)


# ---------------------------------------------------------------------------
# Physics-Based Glacière Cave Safety & Traction Calculator
# ---------------------------------------------------------------------------


def calculate_glaciere_caving(
    floor_ice_slope_deg: float = 18.0,
    cave_air_temp_c: float = -2.5,
    meltwater_film_mm: float = 1.0,
    co2_ppm: float = 800.0,
    hoarfrost_ceiling_thickness_cm: float = 15.0,
) -> dict[str, Any]:
    """Calculate subterranean floor-ice friction, crampon shear safety, hoarfrost detachment, and CO2 risk.

    Parameters
    ----------
    floor_ice_slope_deg:
        Subterranean congelation floor ice slope angle in degrees [0, 60].
    cave_air_temp_c:
        Cold-trap cave air temperature in degrees Celsius [-20, 10].
    meltwater_film_mm:
        Liquid meltwater glaze film thickness on floor ice in mm [0, 25].
    co2_ppm:
        Cold-trap ambient carbon dioxide concentration in ppm [350, 50000].
    hoarfrost_ceiling_thickness_cm:
        Ceiling hoarfrost crystal plate / stalactite thickness in cm [0, 120].
    """
    if not (0.0 <= floor_ice_slope_deg <= 60.0):
        raise ValueError("floor_ice_slope_deg must be between 0 and 60 degrees")
    if not (-20.0 <= cave_air_temp_c <= 10.0):
        raise ValueError("cave_air_temp_c must be between -20 and 10 °C")
    if not (0.0 <= meltwater_film_mm <= 25.0):
        raise ValueError("meltwater_film_mm must be between 0 and 25 mm")
    if not (350.0 <= co2_ppm <= 50000.0):
        raise ValueError("co2_ppm must be between 350 and 50000 ppm")
    if not (0.0 <= hoarfrost_ceiling_thickness_cm <= 120.0):
        raise ValueError("hoarfrost_ceiling_thickness_cm must be between 0 and 120 cm")

    # 1. Ice friction coefficient: cold dry ice (~0.32 at -10°C) drops near 0°C and with liquid water film
    thermal_softening = max(0.0, (cave_air_temp_c + 10.0) * 0.011)
    film_lubrication = min(0.16, meltwater_film_mm * 0.018)
    ice_friction_coefficient = round(
        max(0.04, min(0.42, 0.34 - thermal_softening - film_lubrication)),
        3,
    )

    # 2. Crampon shear safety factor: ratio of effective spike-and-friction shear resistance to slope sin/tan demand
    slope_rad = math.radians(max(2.0, floor_ice_slope_deg))
    crampon_bite_bonus = (
        0.52 if cave_air_temp_c <= 0.0 else max(0.22, 0.45 - cave_air_temp_c * 0.035)
    )
    effective_resistance = (ice_friction_coefficient + crampon_bite_bonus) * math.cos(slope_rad)
    shear_demand = math.sin(slope_rad) + (0.015 * meltwater_film_mm)
    crampon_shear_safety_factor = round(
        max(0.35, min(6.5, effective_resistance / max(0.05, shear_demand))),
        2,
    )

    # 3. Ceiling hoarfrost & stalactite detachment risk (%)
    temp_destabilization = max(0.0, (cave_air_temp_c + 4.0) * 6.2)
    thickness_load = (hoarfrost_ceiling_thickness_cm / 120.0) * 62.0
    film_seepage_boost = min(18.0, meltwater_film_mm * 1.4)
    hoarfrost_detachment_risk_pct = round(
        max(1.0, min(100.0, thickness_load + temp_destabilization + film_seepage_boost)),
        1,
    )

    # 4. Cold-trap hypoxic CO2 index (0 - 100 scale)
    if co2_ppm <= 1000.0:
        hypoxic_co2_index = round((co2_ppm - 350.0) / 650.0 * 18.0, 1)
    elif co2_ppm <= 5000.0:
        hypoxic_co2_index = round(18.0 + ((co2_ppm - 1000.0) / 4000.0) * 37.0, 1)
    else:
        hypoxic_co2_index = round(
            min(100.0, 55.0 + ((co2_ppm - 5000.0) / 25000.0) * 45.0),
            1,
        )

    # 5. Determine Risk Level & Traction Class
    warnings: list[str] = []
    recommendations: list[str] = []

    if (
        crampon_shear_safety_factor < 0.95
        or co2_ppm >= 10000.0
        or hoarfrost_detachment_risk_pct >= 72.0
        or (cave_air_temp_c > 1.5 and floor_ice_slope_deg >= 35.0 and meltwater_film_mm >= 5.0)
    ):
        risk_level: GlaciereRiskLevel = "critical"
        traction_class: GlaciereTractionClass = "abort-glaze-co2-collapse-hazard"
    elif (
        floor_ice_slope_deg >= 30.0
        or crampon_shear_safety_factor < 1.35
        or co2_ppm >= 2500.0
        or hoarfrost_detachment_risk_pct >= 48.0
    ):
        risk_level = "high"
        traction_class = "front-point-dual-tools-ice-screws"
    elif (
        floor_ice_slope_deg >= 14.0
        or crampon_shear_safety_factor < 2.1
        or co2_ppm >= 1000.0
        or hoarfrost_ceiling_thickness_cm >= 15.0
        or meltwater_film_mm >= 1.0
    ):
        risk_level = "moderate"
        traction_class = "steel-12pt-crampons-ice-axe"
    else:
        risk_level = "low"
        traction_class = "microspikes-10pt"

    # Populate actionable warnings
    if cave_air_temp_c > 0.0:
        warnings.append(
            f"Positive cave air temperature ({cave_air_temp_c:.1f} °C) is actively thawing "
            "congelation floor ice and weakening ice-screw shear strength."
        )
    if meltwater_film_mm >= 2.0:
        warnings.append(
            f"Hydrodynamic meltwater glaze film ({meltwater_film_mm:.1f} mm) severely reduces "
            f"boot-ice friction (μ = {ice_friction_coefficient:.3f}) and hides perimeter rimaye crevasses."
        )
    if co2_ppm >= 5000.0:
        warnings.append(
            f"CRITICAL COLD-TRAP CO2 POOLING ({co2_ppm:.0f} ppm, index {hypoxic_co2_index}): "
            "exceeds workplace PEL; immediate hypercapnic hypoxia hazard in sunken chambers."
        )
    elif co2_ppm >= 1200.0:
        warnings.append(
            f"Elevated cold-trap CO2 concentration ({co2_ppm:.0f} ppm): dense air stagnation "
            "detected; monitor breathing rate and avoid floor-level depressions."
        )
    if hoarfrost_detachment_risk_pct >= 45.0:
        warnings.append(
            f"High ceiling hoarfrost & stalactite detachment risk ({hoarfrost_detachment_risk_pct:.1f}%): "
            f"{hoarfrost_ceiling_thickness_cm:.0f} cm crystal plates are prone to acoustic/thermal collapse."
        )
    if crampon_shear_safety_factor < 1.25:
        warnings.append(
            f"Low crampon shear safety factor ({crampon_shear_safety_factor:.2f}x) on "
            f"{floor_ice_slope_deg:.1f}° floor ice slope: unarrested slide into basalt/karst breakdown."
        )

    # Populate technical recommendations
    if traction_class == "abort-glaze-co2-collapse-hazard":
        recommendations.append(
            "ABORT DESCENT: Do not enter the lower cold-trap chamber under active thermal glazing, "
            "critical CO2 pooling, or imminent ceiling hoarfrost collapse."
        )
        recommendations.append(
            "Retreat to the upper ventilated entrance zone above the thermal inversion boundary."
        )
    elif traction_class == "front-point-dual-tools-ice-screws":
        recommendations.append(
            "Equip 12-point steel front-point crampons and dual compact (50 cm) caving ice tools; "
            "establish belays using stubby 13 cm ice screws in dense blue congelation ice."
        )
        recommendations.append(
            "Belay across all slopes >28° and maintain rope protection above perimeter meltwater sumps."
        )
    elif traction_class == "steel-12pt-crampons-ice-axe":
        recommendations.append(
            "Wear 12-point steel crampons with anti-balling plates and carry a 50-55 cm technical "
            "ice axe for French-technique footwork and self-arrest on inclined ice ramps."
        )
        recommendations.append(
            "Clip cowstails into fixed wall anchors when traversing above basal rimaye gaps."
        )
    else:
        recommendations.append(
            "10-point steel microspikes or light crampons are sufficient on low-angle frozen floors; "
            "maintain 3 points of contact around glazed basaltic breakdown."
        )

    recommendations.append(
        "Keep multi-gas CO2/O2 detector clipped at waist/knee height when descending into static "
        "Balch-effect cold traps."
    )

    return _AttrDict(
        {
            "floor_ice_slope_deg": round(floor_ice_slope_deg, 1),
            "cave_air_temp_c": round(cave_air_temp_c, 1),
            "meltwater_film_mm": round(meltwater_film_mm, 1),
            "co2_ppm": round(co2_ppm, 1),
            "hoarfrost_ceiling_thickness_cm": round(hoarfrost_ceiling_thickness_cm, 1),
            "ice_friction_coefficient": ice_friction_coefficient,
            "crampon_shear_safety_factor": crampon_shear_safety_factor,
            "hoarfrost_detachment_risk_pct": hoarfrost_detachment_risk_pct,
            "hypoxic_co2_index": hypoxic_co2_index,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "traction_class": traction_class,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


# ---------------------------------------------------------------------------
# Intent Detection & Parameter Extraction
# ---------------------------------------------------------------------------

_GLACIERE_KEYWORDS: tuple[str, ...] = (
    "glaciere",
    "glacière",
    "ice-filled lava tube",
    "ice filled lava tube",
    "lava tube ice",
    "lava glaciere",
    "lava glacière",
    "permafrost cave",
    "permafrost lava tube",
    "permafrost fissure glaciere",
    "cold-trap cave",
    "cold trap cave",
    "cold-trap lava tube",
    "cold trap lava tube",
    "static cold-trap",
    "static cold trap",
    "balch effect",
    "eisriesenwelt",
    "tennengebirge",
    "scarisoara",
    "scărișoara",
    "bandera ice cave",
    "candelaria ice cave",
    "el malpais ice",
    "lofthellir",
    "hoarfrost ceiling",
    "hoarfrost detachment",
    "congelation floor ice",
    "floor ice slope",
    "firn-plug pit",
    "firn plug pit",
    "dynamic-chimney-karst-ice",
    "stratified-firn-plug-pit",
    "static-cold-trap-lava-tube",
    "permafrost-fissure-glaciere",
)

_GLACIERE_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return policy",
    "shipping",
    "tracking number",
    "invoice",
    "cancel my order",
    # Cryokarst glacier moulin exclusions
    "cryokarst",
    "moulin",
    "subglacial",
    "matanuska",
    "root glacier",
    "athabasca",
    "gorner",
    "palmer glacier",
    "fumarole melt cave",
    "jokulhlaup",
    "jökulhlaup",
    "abalakov",
    # Lava tube biospeleology exclusions
    "biospeleology",
    "troglobite",
    "troglomorphic",
    "actinobacterial",
    "kazumura",
    "ape cave",
    "undara",
    "manjanggul",
    "cueva de los verdes",
    "root curtain",
    # Cave mineralogy / diving / aufeis / rock glacier exclusions
    "cave pearl",
    "anthodite",
    "helictite",
    "peacock springs",
    "aufeis",
    "rock glacier",
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
    "cenote",
    "cenotes",
    "halocline",
    "anchialine",
    "schlieren",
    "ox bel ha",
    "ox-bel-ha",
    "angelita",
    "sac actun",
    "sac-actun",
    "pet cembalo",
    "dan's cave",
    "dans cave",
    "sawmill sink",
    "abaco",
    "meromictic",
    "tannic",
    "chemocline",
    "pycnocline",
    "blue hole",
)


def is_glaciere_caving_query(query: str) -> bool:
    """Return True if the user query is asking about subterranean glacière caving or ice-filled lava tubes."""
    if not query or not query.strip():
        return False
    q_lower = query.lower()

    if any(excl in q_lower for excl in _GLACIERE_EXCLUSIONS):
        return False

    return any(kw in q_lower for kw in _GLACIERE_KEYWORDS)


def detect_glaciere_caving_intent(query: str) -> bool:
    """Alias for is_glaciere_caving_query()."""
    return is_glaciere_caving_query(query)


def extract_glaciere_caving_params(query: str) -> dict[str, Any]:
    """Extract glacière site ID and numerical calculator parameters from a natural-language query."""
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = None

    if "eisriesenwelt" in q_lower or "tennengebirge" in q_lower or "austria" in q_lower:
        matched_site = get_site_by_id("eisriesenwelt-tennengebirge-austria")
    elif (
        "scarisoara" in q_lower
        or "scărișoara" in q_lower
        or "apuseni" in q_lower
        or "romania" in q_lower
    ):
        matched_site = get_site_by_id("scarisoara-glaciere-apuseni-romania")
    elif (
        "bandera" in q_lower
        or "candelaria" in q_lower
        or "malpais" in q_lower
        or "new mexico" in q_lower
    ):
        matched_site = get_site_by_id("bandera-ice-cave-el-malpais-usa")
    elif (
        "lofthellir" in q_lower
        or "myvatn" in q_lower
        or "mývatn" in q_lower
        or "iceland" in q_lower
    ):
        matched_site = get_site_by_id("lofthellir-lava-glaciere-iceland")

    slope = float(matched_site["default_floor_ice_slope_deg"]) if matched_site else 18.0
    temp_c = float(matched_site["default_cave_air_temp_c"]) if matched_site else -2.5
    film_mm = float(matched_site["default_meltwater_film_mm"]) if matched_site else 1.0
    co2_ppm = float(matched_site["co2_ppm"]) if matched_site else 800.0
    hoarfrost_cm = float(matched_site["hoarfrost_ceiling_thickness_cm"]) if matched_site else 15.0

    has_explicit_numbers = False

    slope_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:deg|degree|degrees|°)\s*(?:floor|ice|slope)?", q_lower
    )
    if slope_match:
        val = float(slope_match.group(1))
        if 0.0 <= val <= 60.0:
            slope = val
            has_explicit_numbers = True

    temp_match = re.search(r"(-?\d+(?:\.\d+)?)\s*°?\s*c\b", q_lower)
    if temp_match:
        val = float(temp_match.group(1))
        if -20.0 <= val <= 10.0:
            temp_c = val
            has_explicit_numbers = True

    film_match = re.search(r"(\d+(?:\.\d+)?)\s*mm\b", q_lower)
    if film_match:
        val = float(film_match.group(1))
        if 0.0 <= val <= 25.0:
            film_mm = val
            has_explicit_numbers = True

    co2_match = re.search(r"(\d+(?:\.\d+)?)\s*ppm\b", q_lower)
    if co2_match:
        val = float(co2_match.group(1))
        if 350.0 <= val <= 50000.0:
            co2_ppm = val
            has_explicit_numbers = True

    hoarfrost_match = re.search(r"(\d+(?:\.\d+)?)\s*cm\b", q_lower)
    if hoarfrost_match:
        val = float(hoarfrost_match.group(1))
        if 0.0 <= val <= 120.0:
            hoarfrost_cm = val
            has_explicit_numbers = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "matched_site": matched_site,
        "floor_ice_slope_deg": slope,
        "cave_air_temp_c": temp_c,
        "meltwater_film_mm": film_mm,
        "co2_ppm": co2_ppm,
        "hoarfrost_ceiling_thickness_cm": hoarfrost_cm,
        "has_explicit_numbers": has_explicit_numbers,
    }


def format_glaciere_caving_response(query: str) -> dict[str, Any]:
    """Build a structured response dictionary for a glacière caving query."""
    params = extract_glaciere_caving_params(query)
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = params["matched_site"]

    calc_result = calculate_glaciere_caving(
        floor_ice_slope_deg=float(params["floor_ice_slope_deg"]),
        cave_air_temp_c=float(params["cave_air_temp_c"]),
        meltwater_film_mm=float(params["meltwater_film_mm"]),
        co2_ppm=float(params["co2_ppm"]),
        hoarfrost_ceiling_thickness_cm=float(params["hoarfrost_ceiling_thickness_cm"]),
    )

    is_calc_request = bool(
        params["has_explicit_numbers"]
        or any(
            w in q_lower
            for w in (
                "calculate",
                "calculator",
                "safety factor",
                "friction",
                "shear",
                "traction for",
            )
        )
    )

    if is_calc_request:
        action = "glaciere_caving_calculated"
    elif matched_site is not None:
        action = "glaciere_caving_lookup"
    else:
        action = "glaciere_caving_info"

    site_summary = (
        f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']} — "
        f"{matched_site['elevation']}, morphology: `{matched_site['morphology']}`): "
        f"{matched_site['navigation_protocol']} "
        if matched_site
        else "Subterranean glacière caves and cold-trap lava tubes preserve perennial congelation "
        "ice through Balch-effect cold-air trapping or dynamic karst wind-chimney drafts. "
    )

    answer = (
        f"{site_summary}"
        f"For a **{calc_result['floor_ice_slope_deg']}° floor-ice slope** at "
        f"**{calc_result['cave_air_temp_c']} °C** with **{calc_result['meltwater_film_mm']} mm** "
        f"meltwater glaze film and **{calc_result['co2_ppm']:.0f} ppm CO₂**, the modeled "
        f"ice friction coefficient is **{calc_result['ice_friction_coefficient']}**, crampon shear "
        f"safety factor is **{calc_result['crampon_shear_safety_factor']}x**, ceiling hoarfrost "
        f"detachment risk is **{calc_result['hoarfrost_detachment_risk_pct']}%**, and risk level is "
        f"**{calc_result['risk_level'].upper()}** (recommended traction: `{calc_result['traction_class']}`)."
    )

    return _AttrDict(
        {
            "action": action,
            "answer": answer,
            "matched_site": matched_site,
            "calculation": calc_result,
            "sites": GLACIERE_CAVE_SITES,
            "checklist": GLACIERE_GEAR_CHECKLIST,
        }
    )


def build_glaciere_caving_prompt(query: str = "") -> str:
    """Build system prompt context for LLM calls involving subterranean glacière cave navigation."""
    info = (
        format_glaciere_caving_response(query)
        if query
        else format_glaciere_caving_response("glaciere")
    )
    calc: dict[str, Any] = info["calculation"]
    matched_site: dict[str, Any] | None = info.get("matched_site")

    lines: list[str] = [
        "### Subterranean Ice-Filled Lava Tube & Permafrost Glacière Cave Navigation Context",
        "- **Thermodynamic Regimes**: Dynamic wind-chimney karst caves (e.g., Eisriesenwelt), "
        "stratified firn-plug collapse shafts (e.g., Scărișoara), static Balch-effect cold-trap "
        "basaltic lava tubes (e.g., Bandera Ice Cave), and permafrost fissure lava glacières (e.g., Lofthellir).",
        f"- **Calculated Floor-Ice Physics**: Slope={calc['floor_ice_slope_deg']}°, "
        f"AirTemp={calc['cave_air_temp_c']}°C, MeltwaterFilm={calc['meltwater_film_mm']}mm, "
        f"CO2={calc['co2_ppm']}ppm, Hoarfrost={calc['hoarfrost_ceiling_thickness_cm']}cm -> "
        f"Friction μ={calc['ice_friction_coefficient']}, Crampon Shear SF={calc['crampon_shear_safety_factor']}x, "
        f"Hoarfrost Detachment Risk={calc['hoarfrost_detachment_risk_pct']}%, "
        f"Hypoxic CO2 Index={calc['hypoxic_co2_index']}, Risk={calc['risk_level']}, "
        f"Traction={calc['traction_class']}.",
    ]
    if matched_site:
        lines.append(
            f"- **Focused Glacière Site**: {matched_site['name']} ({matched_site['country']}) — "
            f"Primary Hazard: {matched_site['primary_hazard']} | Protocol: {matched_site['navigation_protocol']}"
        )
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response dictionary for a glacière caving query."""
    info = format_glaciere_caving_response(query)
    return {
        "answer": info["answer"],
        "glaciere_caving_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[str, None, None]:
    """Yield SSE stream chunks for a glacière caving query."""
    info = format_glaciere_caving_response(query)
    yield f"data: {json.dumps({'action': info['action'], 'glaciere_caving_info': info})}\n\n"
    yield f"data: {json.dumps({'content': info['answer'], 'answer': info['answer']})}\n\n"
    yield "data: [DONE]\n\n"
