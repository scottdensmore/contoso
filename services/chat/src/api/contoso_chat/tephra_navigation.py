"""Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator Domain Module.

Provides domain logic, curated volcanic tephra/ash-fall/lapilli scree slope site catalogs,
mandatory respiratory/ocular/gaiter/stability gear checklists, deterministic resuspended PM10,
Mohr-Coulomb grain-flow factor of safety, downslope slide ratio, and filter clogging calculations,
intent detection, and response formatting for volcanic tephra navigation queries.
"""

import math
import re
from typing import Any, Literal, Optional

TephraLithology = Literal[
    "scoria-lapilli",
    "lithic-cinder",
    "vesicular-pumice",
    "vitrophyric-ash",
]

TephraDifficulty = Literal[
    "moderate",
    "challenging",
    "extreme",
]

TephraRiskLevel = Literal[
    "low",
    "moderate",
    "high",
    "critical",
]

TephraRespiratorClass = Literal[
    "N95-goggles",
    "P100-elastomeric-sealed-goggles",
    "P100-full-face-APR",
    "abort-silicosis-grainflow-hazard",
]

VALID_TEPHRA_LITHOLOGIES: set[str] = {
    "scoria-lapilli",
    "lithic-cinder",
    "vesicular-pumice",
    "vitrophyric-ash",
}

VALID_TEPHRA_DIFFICULTIES: set[str] = {
    "moderate",
    "challenging",
    "extreme",
}


class _AttrDict(dict[str, Any]):
    """Dictionary supporting both key and attribute access plus model_dump()."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc

    def model_dump(self) -> dict[str, Any]:
        return dict(self)


TEPHRA_SLOPE_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "yasur-ash-plain-vanuatu",
            "name": "Mount Yasur Ash Plain & Scoria Cone Apron",
            "country": "Vanuatu",
            "region": "Tanna Island, Vanuatu",
            "elevation": 361,
            "elevation_m": 361,
            "tephra_lithology": "scoria-lapilli",
            "difficulty": "moderate",
            "default_slope_angle_deg": 24.0,
            "default_ash_depth_cm": 35.0,
            "default_wind_speed_kmh": 22.0,
            "cristobalite_pct": 3.5,
            "grain_size_mm": 4.5,
            "respirator_recommendation": "P100-elastomeric-sealed-goggles",
            "primary_hazard": (
                "Continuous Strombolian ash-fall and trade-wind resuspension across the 24° "
                "basaltic-andesite scoria apron, combined with sharp vesicular lapilli entering boot collars."
            ),
            "descent_protocol": (
                "Descend downwind flanks only with sealed polycarbonate goggles and elastomeric P100 half-mask; "
                "use controlled heel-plunge strides across unconsolidated 35 cm scoria-lapilli sheets."
            ),
            "field_notes": (
                "Active Strombolian scoria cone above Lake Siwi ash plain; basaltic-andesite tephra has low "
                "free silica content (~3.5%) but high vesicular glass shard abrasion potential."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "acatenango-fuego-tephra-guatemala",
            "name": "Volcán Acatenango–Fuego Lapilli Saddle & Scree Chute",
            "country": "Guatemala",
            "region": "Sacatepéquez / Chimaltenango, Guatemala",
            "elevation": 3976,
            "elevation_m": 3976,
            "tephra_lithology": "lithic-cinder",
            "difficulty": "challenging",
            "default_slope_angle_deg": 33.0,
            "default_ash_depth_cm": 55.0,
            "default_wind_speed_kmh": 34.0,
            "cristobalite_pct": 7.5,
            "grain_size_mm": 3.2,
            "respirator_recommendation": "P100-elastomeric-sealed-goggles",
            "primary_hazard": (
                "Steep 33° unconsolidated lithic-cinder and ballistic lapilli chutes below Pico Mayor and "
                "La Horqueta saddle where footfalls trigger ankle-deep grain flows and dense PM10 ash plumes."
            ),
            "descent_protocol": (
                "Maintain 15 m diagonal spacing off the fall-line, deploy dual 85 mm lapilli-basket poles, "
                "and wear Kevlar scree gaiters with P100 elastomeric filtration during Fuego ash-plume drift."
            ),
            "field_notes": (
                "High-altitude 3,976 m stratovolcano traverse exposed to frequent Vulcanian ash-fall from "
                "adjacent Volcán de Fuego and loose 55 cm deep angular lithic-cinder scree."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "tarawera-scoria-chute-nz",
            "name": "Mount Tarawera Chasm & Basaltic Scoria Scree",
            "country": "New Zealand",
            "region": "Bay of Plenty, North Island, New Zealand",
            "elevation": 1111,
            "elevation_m": 1111,
            "tephra_lithology": "vesicular-pumice",
            "difficulty": "challenging",
            "default_slope_angle_deg": 36.0,
            "default_ash_depth_cm": 70.0,
            "default_wind_speed_kmh": 28.0,
            "cristobalite_pct": 9.0,
            "grain_size_mm": 6.0,
            "respirator_recommendation": "P100-full-face-APR",
            "primary_hazard": (
                "36° bimodal basaltic scoria and rhyolitic Kaharoa vesicular-pumice scree slopes lining "
                "the 1886 eruption chasm where low-density pumice rafts slide over underlying ash lenses."
            ),
            "descent_protocol": (
                "Execute short-cadence heel-plunge braking down dedicated scoria lanes, avoid undercut "
                "rhyolite dome walls, and wear sealed eye protection against wind-lofted pumice fines."
            ),
            "field_notes": (
                "Site of the 1886 basaltic-plinian fissure eruption; interbedded red/black scoria lapilli "
                "and pale rhyolitic pumice create variable grain-flow friction angles."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "chaiten-rhyolite-pumice-chile",
            "name": "Volcán Chaitén Obsidian Dome & Cristobalite Ash Apron",
            "country": "Chile",
            "region": "Los Lagos Region, Patagonia, Chile",
            "elevation": 1122,
            "elevation_m": 1122,
            "tephra_lithology": "vitrophyric-ash",
            "difficulty": "extreme",
            "default_slope_angle_deg": 39.0,
            "default_ash_depth_cm": 110.0,
            "default_wind_speed_kmh": 52.0,
            "cristobalite_pct": 21.0,
            "grain_size_mm": 0.25,
            "respirator_recommendation": "abort-silicosis-grainflow-hazard",
            "primary_hazard": (
                "High-silica rhyolitic vitrophyric ash containing ~21% crystalline cristobalite nanofibers "
                "on 39° caldera-rim slopes swept by 52 km/h Patagonian gusts, posing acute silicosis and slab-avalanche risk."
            ),
            "descent_protocol": (
                "Abort descent when winds exceed 40 km/h or cristobalite-rich PM10 plumes obscure caldera visibility; "
                "require full-face P100 APR and strict windward ridge routing when traversing below the obsidian dome."
            ),
            "field_notes": (
                "2008 rhyolitic dome extrusion generated ultra-fine vitrophyric tephra enriched in vapor-phase "
                "cristobalite and sharp obsidian micro-shards that rapidly clog unpleated filters."
            ),
        }
    ),
]

TEPHRA_SITES = TEPHRA_SLOPE_SITES


TEPHRA_GEAR_CHECKLIST: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "elastomeric-p100-full-or-half-mask-respirator",
            "name": "NIOSH P100 Elastomeric Respirator with Spare Pleated Particulate Cartridges",
            "category": "respiratory_protection",
            "mandatory": True,
            "rationale": (
                "Blocks >=99.97% of respirable volcanic glass shards and crystalline cristobalite silica "
                "fines (<10 microns) that cause acute bronchospasm and chronic silicosis."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "non-vented-foam-sealed-volcanic-ash-goggles",
            "name": "Non-Vented Closed-Cell Foam-Sealed Polycarbonate Goggles",
            "category": "ocular_protection",
            "mandatory": True,
            "rationale": (
                "Prevents angular vitrophyric ash and acidic sulfate-coated lapilli dust from causing "
                "corneal abrasions during high-wind slope descents (never wear contact lenses in ash-fall)."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "kevlar-reinforced-knee-high-scree-gaiters",
            "name": "Abrasion-Resistant Kevlar/Cordura Knee-High Volcanic Scree Gaiters",
            "category": "footwear_and_gaiters",
            "mandatory": True,
            "rationale": (
                "Seals boot collars against razor-sharp scoria lapilli and hot/abrasive cinder ingress "
                "during deep heel-plunge gliding descents."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "dual-85mm-volcanic-lapilli-basket-trekking-poles",
            "name": "Dual Aluminum Trekking Poles with Carbide Tips & 85mm Lapilli Baskets",
            "category": "slope_stability",
            "mandatory": True,
            "rationale": (
                "Provides wide-stance outrigger balance and prevents pole tips from sinking through "
                "unconsolidated vesicular pumice and deep ash-fall layers."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "vibram-megagrip-high-rand-mountaineering-boots",
            "name": "Full-Rubber-Rand Mountaineering Boots with Deep-Lug Vibram Outsoles",
            "category": "footwear_and_gaiters",
            "mandatory": True,
            "rationale": (
                "360-degree vulcanized rubber rand resists glass-shard stitching cuts that rapidly "
                "shred standard mesh trail-running uppers on volcanic scree."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "hermetic-ip68-drybag-and-lens-blower-kit",
            "name": "Hermetic IP68 Electronics Dry-Bag & Silicone Hurricane Air-Blower",
            "category": "ash_seal_and_optics",
            "mandatory": True,
            "rationale": (
                "Protects GPS/altimeter barometric ports and optical lenses from electrostatic fine "
                "volcanic ash infiltration without scratching coatings."
            ),
        }
    ),
]


def get_all_sites() -> list[dict[str, Any]]:
    """Return all curated volcanic tephra, ash-fall & lapilli scree sites."""
    return list(TEPHRA_SLOPE_SITES)


get_all_tephra_sites = get_all_sites


def get_site_by_id(site_id: str) -> Optional[dict[str, Any]]:
    """Return a single volcanic tephra site by ID, or None if not found."""
    normalized = site_id.strip().lower()
    for site in TEPHRA_SLOPE_SITES:
        if site["id"] == normalized:
            return site
    return None


get_tephra_site_by_id = get_site_by_id


def filter_sites(
    country: str | None = None,
    tephra_lithology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """Filter volcanic tephra sites by country, tephra_lithology, difficulty, and/or search string."""
    results = list(TEPHRA_SLOPE_SITES)
    if country is not None and country.strip():
        c_norm = country.strip().lower()
        results = [
            s
            for s in results
            if c_norm in str(s["country"]).lower() or c_norm in str(s["region"]).lower()
        ]
    if tephra_lithology is not None and tephra_lithology.strip():
        lith_norm = tephra_lithology.strip().lower()
        results = [s for s in results if str(s["tephra_lithology"]).lower() == lith_norm]
    if difficulty is not None and difficulty.strip():
        diff_norm = difficulty.strip().lower()
        results = [s for s in results if str(s["difficulty"]).lower() == diff_norm]
    if search is not None and search.strip():
        q_norm = search.strip().lower()
        results = [
            s
            for s in results
            if q_norm in str(s["id"]).lower()
            or q_norm in str(s["name"]).lower()
            or q_norm in str(s["country"]).lower()
            or q_norm in str(s["region"]).lower()
            or q_norm in str(s["tephra_lithology"]).lower()
            or q_norm in str(s["primary_hazard"]).lower()
            or q_norm in str(s["field_notes"]).lower()
        ]
    return results


filter_tephra_sites = filter_sites


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the mandatory volcanic tephra, ash-fall & lapilli scree gear checklist."""
    return list(TEPHRA_GEAR_CHECKLIST)


get_tephra_gear_checklist = get_gear_checklist


def calculate_tephra_navigation(
    slope_angle_deg: float = 28.0,
    ash_depth_cm: float = 40.0,
    wind_speed_kmh: float = 20.0,
    cristobalite_pct: float = 8.0,
    grain_size_mm: float = 2.0,
) -> dict[str, Any]:
    """Calculate resuspended PM10 (ug/m3), Mohr-Coulomb grain-flow factor of safety,
    downslope slide ratio, filter clog hours, risk level, and respirator class.
    """
    if not (0.0 <= slope_angle_deg <= 55.0):
        raise ValueError(f"slope_angle_deg ({slope_angle_deg}) must be between 0 and 55 degrees.")
    if not (0.0 <= ash_depth_cm <= 300.0):
        raise ValueError(f"ash_depth_cm ({ash_depth_cm}) must be between 0 and 300 cm.")
    if not (0.0 <= wind_speed_kmh <= 150.0):
        raise ValueError(f"wind_speed_kmh ({wind_speed_kmh}) must be between 0 and 150 km/h.")
    if not (0.0 <= cristobalite_pct <= 35.0):
        raise ValueError(f"cristobalite_pct ({cristobalite_pct}) must be between 0 and 35%.")
    if not (0.01 <= grain_size_mm <= 64.0):
        raise ValueError(f"grain_size_mm ({grain_size_mm}) must be between 0.01 and 64 mm.")

    # 1. Resuspended PM10 concentration (ug/m3)
    fine_fraction_factor = (2.5 / max(0.05, grain_size_mm)) ** 0.55
    wind_factor = 1.0 + (wind_speed_kmh / 18.0) ** 1.35
    depth_factor = 0.5 + min(2.5, ash_depth_cm / 45.0)
    raw_pm10 = 42.0 * fine_fraction_factor * wind_factor * depth_factor
    resuspended_pm10_ug_m3 = round(max(15.0, min(25000.0, raw_pm10)), 1)

    # 2. Grain-flow factor of safety (infinite-slope Mohr-Coulomb cohesionless model)
    repose_deg = min(42.0, 31.0 + math.log10(max(0.05, grain_size_mm) + 1.0) * 4.5)
    depth_penalty = 1.0 / (1.0 + (ash_depth_cm / 180.0) * 0.35)
    if slope_angle_deg <= 1.0:
        raw_fos = 4.50
    else:
        raw_fos = (
            math.tan(math.radians(repose_deg)) / math.tan(math.radians(slope_angle_deg))
        ) * depth_penalty
    grain_flow_factor_of_safety = round(max(0.25, min(4.50, raw_fos)), 2)

    # 3. Downslope slide ratio (slide distance per step stride)
    raw_slide = (slope_angle_deg / 30.0) * (0.35 + (ash_depth_cm / 120.0) * 0.65)
    downslope_slide_ratio = round(max(0.05, min(3.50, raw_slide)), 2)

    # 4. Filter clog service life (hours before high breathing resistance)
    raw_clog_hours = 3600.0 / max(60.0, resuspended_pm10_ug_m3)
    filter_clog_hours = round(max(0.5, min(48.0, raw_clog_hours)), 1)

    # 5. Classify risk_level and respirator_class
    risk_level: TephraRiskLevel
    respirator_class: TephraRespiratorClass
    if (
        grain_flow_factor_of_safety < 0.72
        or cristobalite_pct >= 18.0
        or resuspended_pm10_ug_m3 >= 2500.0
        or slope_angle_deg >= 42.0
        or (wind_speed_kmh >= 60.0 and ash_depth_cm >= 80.0)
    ):
        risk_level = "critical"
        respirator_class = "abort-silicosis-grainflow-hazard"
    elif (
        grain_flow_factor_of_safety < 1.20
        or cristobalite_pct >= 11.0
        or resuspended_pm10_ug_m3 >= 900.0
        or slope_angle_deg >= 35.0
        or wind_speed_kmh >= 40.0
    ):
        risk_level = "high"
        respirator_class = "P100-full-face-APR"
    elif (
        grain_flow_factor_of_safety < 1.55
        or cristobalite_pct >= 5.0
        or resuspended_pm10_ug_m3 >= 250.0
        or slope_angle_deg >= 24.0
        or wind_speed_kmh >= 20.0
        or ash_depth_cm >= 35.0
    ):
        risk_level = "moderate"
        respirator_class = "P100-elastomeric-sealed-goggles"
    else:
        risk_level = "low"
        respirator_class = "N95-goggles"

    warnings: list[str] = []
    recommendations: list[str] = []

    if grain_flow_factor_of_safety < 1.0:
        warnings.append(
            f"Slope angle ({slope_angle_deg:.1f}°) exceeds stable tephra angle of repose (FoS={grain_flow_factor_of_safety}); spontaneous lapilli grain-flow slab release imminent."
        )
    elif grain_flow_factor_of_safety < 1.3:
        warnings.append(
            f"Marginal tephra slope stability (FoS={grain_flow_factor_of_safety}); boot loading can trigger localized scoria-lapilli sloughing."
        )

    if cristobalite_pct >= 15.0:
        warnings.append(
            f"Extreme crystalline cristobalite silica concentration ({cristobalite_pct:.1f}%) poses severe acute silicosis hazard."
        )
    elif cristobalite_pct >= 8.0:
        warnings.append(
            f"Elevated cristobalite silica content ({cristobalite_pct:.1f}%) requires high-efficiency P100 particulate filtration."
        )

    if resuspended_pm10_ug_m3 >= 1000.0:
        warnings.append(
            f"Severe resuspended volcanic ash PM10 plume ({resuspended_pm10_ug_m3} ug/m3) reduces optical visibility and accelerates filter loading ({filter_clog_hours} h)."
        )

    if risk_level == "critical":
        recommendations.append(
            "ABORT DESCENT down unconsolidated tephra chutes; retreat to windward bedrock ridges and don full-face P100 respiratory protection immediately."
        )
        recommendations.append(
            f"Carry spare pleated P100 cartridges (estimated filter clog window: {filter_clog_hours} hours) and seal all optical/electronic ports."
        )
    elif risk_level == "high":
        recommendations.append(
            "Equip a full-face P100 Air-Purifying Respirator (APR) and Kevlar knee-high scree gaiters before entering the chute."
        )
        recommendations.append(
            "Descend one person at a time on diagonal lines off the fall-line using dual 85 mm lapilli-basket trekking poles."
        )
    elif risk_level == "moderate":
        recommendations.append(
            "Wear an elastomeric half-mask P100 respirator paired with non-vented foam-sealed polycarbonate goggles."
        )
        recommendations.append(
            "Use controlled heel-plunge gliding strides and keep 15 m spacing between party members."
        )
    else:
        recommendations.append(
            "Wear a NIOSH N95 particulate respirator and sealed goggles to guard against sudden gust resuspension."
        )
        recommendations.append(
            "Inspect boot rands and gaiter straps after crossing vesicular scoria and lapilli beds."
        )

    return _AttrDict(
        {
            "slope_angle_deg": round(slope_angle_deg, 1),
            "ash_depth_cm": round(ash_depth_cm, 1),
            "wind_speed_kmh": round(wind_speed_kmh, 1),
            "cristobalite_pct": round(cristobalite_pct, 1),
            "grain_size_mm": round(grain_size_mm, 2),
            "resuspended_pm10_ug_m3": resuspended_pm10_ug_m3,
            "grain_flow_factor_of_safety": grain_flow_factor_of_safety,
            "downslope_slide_ratio": downslope_slide_ratio,
            "filter_clog_hours": filter_clog_hours,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "respirator_class": respirator_class,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


calculate_tephra_navigation_safety = calculate_tephra_navigation


_TEPHRA_NAVIGATION_KEYWORDS: tuple[str, ...] = (
    "tephra",
    "lapilli",
    "ash-fall",
    "ashfall",
    "volcanic ash",
    "scoria scree",
    "scoria-lapilli",
    "scoria cone",
    "cristobalite",
    "mount yasur",
    "yasur",
    "acatenango",
    "volcan de fuego",
    "volcán de fuego",
    "tarawera",
    "chaiten",
    "chaitén",
    "pumice scree",
    "vesicular pumice",
    "vesicular-pumice",
    "vitrophyric ash",
    "vitrophyric-ash",
    "lithic cinder",
    "lithic-cinder",
)


def is_tephra_navigation_query(query: str) -> bool:
    """Return True if the user query pertains to volcanic tephra, ash-fall & lapilli scree slope descent."""
    if not query or not query.strip():
        return False
    q = query.lower()

    if any(kw in q for kw in _TEPHRA_NAVIGATION_KEYWORDS):
        return True

    has_volcanic_ash_context = any(
        term in q
        for term in (
            "volcanic scree",
            "volcanic cinder",
            "pyroclastic scree",
            "ash apron",
            "ash plain",
            "pumice slope",
        )
    )
    has_tephra_mechanic = any(
        term in q
        for term in (
            "respirator",
            "p100",
            "goggles",
            "pm10",
            "silicosis",
            "grain flow",
            "grain-flow",
            "heel plunge",
            "gaiter",
        )
    )
    return has_volcanic_ash_context and has_tephra_mechanic


detect_tephra_navigation_intent = is_tephra_navigation_query


def extract_tephra_navigation_params(query: str) -> dict[str, Any]:
    """Extract site_id and numerical calculation parameters from a user query."""
    q = query.lower()
    params: dict[str, Any] = {
        "site_id": None,
        "slope_angle_deg": 28.0,
        "ash_depth_cm": 40.0,
        "wind_speed_kmh": 20.0,
        "cristobalite_pct": 8.0,
        "grain_size_mm": 2.0,
        "has_explicit_numbers": False,
        "is_calculation": False,
    }

    site_patterns: list[tuple[tuple[str, ...], str]] = [
        (
            ("yasur", "tanna", "vanuatu"),
            "yasur-ash-plain-vanuatu",
        ),
        (
            ("acatenango", "fuego", "guatemala", "horqueta"),
            "acatenango-fuego-tephra-guatemala",
        ),
        (
            ("tarawera", "kaharoa", "bay of plenty", "new zealand"),
            "tarawera-scoria-chute-nz",
        ),
        (
            ("chaiten", "chaitén", "los lagos"),
            "chaiten-rhyolite-pumice-chile",
        ),
    ]
    for aliases, site_id in site_patterns:
        if site_id in q or any(alias in q for alias in aliases):
            params["site_id"] = site_id
            site = get_site_by_id(site_id)
            if site is not None:
                params["slope_angle_deg"] = float(site["default_slope_angle_deg"])
                params["ash_depth_cm"] = float(site["default_ash_depth_cm"])
                params["wind_speed_kmh"] = float(site["default_wind_speed_kmh"])
                params["cristobalite_pct"] = float(site["cristobalite_pct"])
                params["grain_size_mm"] = float(site["grain_size_mm"])
            break

    slope_match = re.search(
        r"(?:slope(?:\s+angle)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*(?:deg|degrees?|°)?|(\d+(?:\.\d+)?)\s*(?:deg|degrees?|°)\s+slope)",
        q,
    )
    if slope_match:
        val = float(slope_match.group(1) or slope_match.group(2))
        params["slope_angle_deg"] = max(0.0, min(55.0, val))
        params["has_explicit_numbers"] = True

    depth_match = re.search(
        r"(?:(?:ash|tephra|lapilli)(?:\s+depth)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*cm\b|(\d+(?:\.\d+)?)\s*cm\s+(?:ash|tephra|lapilli))",
        q,
    )
    if depth_match:
        val = float(depth_match.group(1) or depth_match.group(2))
        params["ash_depth_cm"] = max(0.0, min(300.0, val))
        params["has_explicit_numbers"] = True

    wind_match = re.search(
        r"(?:wind(?:\s+speed)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*(?:km/h|kmh|kph)\b|(\d+(?:\.\d+)?)\s*(?:km/h|kmh|kph)\b)",
        q,
    )
    if wind_match:
        val = float(wind_match.group(1) or wind_match.group(2))
        params["wind_speed_kmh"] = max(0.0, min(150.0, val))
        params["has_explicit_numbers"] = True

    crist_match = re.search(
        r"(?:cristobalite(?:\s+pct|\s+percent|\s+content)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*%?|(\d+(?:\.\d+)?)\s*%\s*cristobalite)",
        q,
    )
    if crist_match:
        val = float(crist_match.group(1) or crist_match.group(2))
        params["cristobalite_pct"] = max(0.0, min(35.0, val))
        params["has_explicit_numbers"] = True

    grain_match = re.search(
        r"(?:grain(?:\s+size)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*mm\b|(\d+(?:\.\d+)?)\s*mm\s+grain)",
        q,
    )
    if grain_match:
        val = float(grain_match.group(1) or grain_match.group(2))
        params["grain_size_mm"] = max(0.01, min(64.0, val))
        params["has_explicit_numbers"] = True

    calc_triggers = (
        "calculate",
        "evaluate",
        "assess",
        "pm10",
        "resuspension",
        "factor of safety",
        "filter clog",
        "slide ratio",
    )
    params["is_calculation"] = bool(params["has_explicit_numbers"]) or any(
        t in q for t in calc_triggers
    )
    return params


def format_tephra_navigation_response(query: str) -> dict[str, Any]:
    """Format a structured response dictionary for volcanic tephra navigation queries."""
    params = extract_tephra_navigation_params(query)
    is_calc = bool(params["is_calculation"])
    gear_list: list[dict[str, Any]] = [dict(g) for g in get_gear_checklist()]

    if is_calc:
        calc_result = calculate_tephra_navigation(
            slope_angle_deg=float(params["slope_angle_deg"]),
            ash_depth_cm=float(params["ash_depth_cm"]),
            wind_speed_kmh=float(params["wind_speed_kmh"]),
            cristobalite_pct=float(params["cristobalite_pct"]),
            grain_size_mm=float(params["grain_size_mm"]),
        )
        answer = (
            "### Volcanic Tephra, Ash-Fall & Lapilli Scree Descent Assessment\n\n"
            f"- **Risk Level:** `{calc_result['risk_level']}`\n"
            f"- **Recommended Respirator Class:** `{calc_result['respirator_class']}`\n"
            f"- **Resuspended PM10 Concentration:** `{calc_result['resuspended_pm10_ug_m3']} ug/m3`\n"
            f"- **Grain-Flow Factor of Safety:** `{calc_result['grain_flow_factor_of_safety']}` "
            f"(Slope: {calc_result['slope_angle_deg']}°, Ash Depth: {calc_result['ash_depth_cm']} cm, "
            f"Grain Size: {calc_result['grain_size_mm']} mm)\n"
            f"- **Downslope Slide Ratio:** `{calc_result['downslope_slide_ratio']}`\n"
            f"- **Estimated Filter Service Window:** `{calc_result['filter_clog_hours']} hours` "
            f"(Cristobalite: {calc_result['cristobalite_pct']}%)\n\n"
            f"**Recommendations:** {' '.join(calc_result['recommendations'])}"
        )
        calc_info: dict[str, Any] = {
            **dict(calc_result),
            "action": "tephra_navigation_calculated",
            "domain": "tephra_navigation",
            "calculation": dict(calc_result),
            "checklist": gear_list,
            "gear_checklist": gear_list,
            "answer": answer,
            "response": answer,
        }
        if params["site_id"]:
            matched_site = get_site_by_id(str(params["site_id"]))
            if matched_site is not None:
                calc_info["site"] = dict(matched_site)
        return _AttrDict(calc_info)

    if params["site_id"]:
        site = get_site_by_id(str(params["site_id"]))
        if site is not None:
            site_calc = calculate_tephra_navigation(
                slope_angle_deg=float(site["default_slope_angle_deg"]),
                ash_depth_cm=float(site["default_ash_depth_cm"]),
                wind_speed_kmh=float(site["default_wind_speed_kmh"]),
                cristobalite_pct=float(site["cristobalite_pct"]),
                grain_size_mm=float(site["grain_size_mm"]),
            )
            answer = (
                f"### {site['name']} ({site['region']})\n\n"
                f"- **Site ID:** `{site['id']}` (Country: {site['country']}, Elevation: {site['elevation_m']} m)\n"
                f"- **Tephra Lithology:** `{site['tephra_lithology']}` (Difficulty: `{site['difficulty']}`)\n"
                f"- **Slope & Ash Profile:** {site['default_slope_angle_deg']}° slope, "
                f"{site['default_ash_depth_cm']} cm ash depth, {site['grain_size_mm']} mm grain size, "
                f"{site['cristobalite_pct']}% cristobalite\n"
                f"- **Primary Hazard:** {site['primary_hazard']}\n"
                f"- **Descent Protocol:** {site['descent_protocol']}\n"
                f"- **Field Notes:** {site['field_notes']}"
            )
            lookup_info: dict[str, Any] = {
                "action": "tephra_navigation_lookup",
                "domain": "tephra_navigation",
                "site": dict(site),
                "baseline_calculation": dict(site_calc),
                "checklist": gear_list,
                "gear_checklist": gear_list,
                "answer": answer,
                "response": answer,
            }
            return _AttrDict(lookup_info)

    sites_list: list[dict[str, Any]] = [dict(s) for s in get_all_sites()]
    site_bullets = "\n".join(
        f"- **{s['name']}** (`{s['id']}`, {s['country']}, {s['elevation_m']} m): `{s['tephra_lithology']}` / `{s['difficulty']}`"
        for s in sites_list
    )
    gear_bullets = "\n".join(
        f"- **{g['name']}** (`{g['category']}`): {g['rationale']}" for g in gear_list
    )
    answer = (
        "### Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator Guide\n\n"
        "Descending unconsolidated volcanic tephra, scoria-lapilli chutes, and cristobalite-bearing "
        "vitrophyric ash aprons requires P100 elastomeric or full-face respiratory protection, "
        "non-vented foam-sealed polycarbonate goggles, Kevlar knee-high scree gaiters, and controlled "
        "heel-plunge braking with 85 mm lapilli-basket trekking poles.\n\n"
        "#### Curated Volcanic Tephra & Lapilli Reference Sites\n"
        f"{site_bullets}\n\n"
        "#### Mandatory 6-Item Tephra & Respirator Gear Checklist\n"
        f"{gear_bullets}"
    )
    general_info: dict[str, Any] = {
        "action": "tephra_navigation_info",
        "domain": "tephra_navigation",
        "sites": sites_list,
        "checklist": gear_list,
        "gear_checklist": gear_list,
        "answer": answer,
        "response": answer,
    }
    return _AttrDict(general_info)


def build_tephra_navigation_prompt(query: str = "") -> str:
    """Build system prompt context for LLM augmentation on volcanic tephra navigation topics."""
    info = format_tephra_navigation_response(query)
    answer = str(info.get("answer", ""))
    return (
        "You are an expert volcanologist and Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator specialist. "
        "Use the following resuspended PM10, cristobalite silicosis risk, and Mohr-Coulomb grain-flow stability telemetry to answer the user's question:\n\n"
        f"{answer}"
    )
