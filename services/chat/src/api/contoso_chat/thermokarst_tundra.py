"""Arctic Polygon-Tundra Ice-Wedge Trough & Thermokarst Thaw-Slump Navigation Guide.

Provides deterministic suprapermafrost active-layer liquefaction modeling,
ice-wedge trough and retrogressive thaw-slump headwall routing, Eriophorum
tussock ankle-fatigue calculations, curated Arctic polygon-tundra sites,
and specialized gear checklists for Contoso Outdoor Company customers.
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


THERMOKARST_TUNDRA_SITES: list[_AttrDict] = [
    _AttrDict(
        {
            "id": "tuktoyaktuk-pingo-polygons-canada",
            "name": "Tuktoyaktuk Peninsula Ice-Wedge Polygon & Pingo Littoral Tundra",
            "country": "Canada",
            "region": "Inuvik Region, Northwest Territories (Beaufort Sea Littoral)",
            "elevation": "5-48 m (16-157 ft)",
            "elevation_m": 25,
            "morphology": "low-center-ice-wedge-polygon",
            "difficulty": "challenging",
            "default_active_layer_depth_cm": 52.0,
            "default_trough_water_depth_cm": 45.0,
            "default_soil_moisture_saturation_pct": 82.0,
            "default_eriophorum_tussock_height_cm": 28.0,
            "default_pack_load_kg": 18.0,
            "primary_hazard": (
                "Submerged ice-wedge trough junctions, perched polygon-rim breach channels, "
                "and coastal pingo crater thaw-lake margins with bottomless peat-silt."
            ),
            "routing_strategy": (
                "Walk strictly along raised peripheral rims of low-center ice-wedge polygons; "
                "probe trough intersections with a graduated permafrost T-probe before stepping "
                "across flooded ice-wedge fissures."
            ),
            "navigation_protocol": (
                "Maintain elevated rim-to-rim progression; avoid shortcutting across flooded "
                "low-center marsh basins or dark open-water ice-wedge triple junctions."
            ),
            "progression_protocol": (
                "Elevated Polygon-Rim Traverse with Graduated Frost-Table Probing"
            ),
            "field_notes": (
                "Massive epigenetic and syngenetic ice wedges underlie polygonal ridges around "
                "Ibyuk Pingo; late-summer thermal erosion rapidly deepens water-filled troughs."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "batagaika-mega-slump-yakutia",
            "name": "Batagaika & Yana Highlands Retrogressive Thaw-Slump Headwall",
            "country": "Russia",
            "region": "Verkhoyansk District, Sakha Republic (Yakutia)",
            "elevation": "240-380 m (787-1,247 ft)",
            "elevation_m": 310,
            "morphology": "retrogressive-thaw-slump-headwall",
            "difficulty": "extreme",
            "default_active_layer_depth_cm": 115.0,
            "default_trough_water_depth_cm": 75.0,
            "default_soil_moisture_saturation_pct": 94.0,
            "default_eriophorum_tussock_height_cm": 35.0,
            "default_pack_load_kg": 22.0,
            "primary_hazard": (
                "Active retrogressive thaw-slump headwall overhang collapse, liquefied Yedoma "
                "ice-complex mudflows (baydzherakh silt), and acoustic ice-crack detachments."
            ),
            "routing_strategy": (
                "Enforce a minimum 50 m standoff buffer upslope of overhanging turf mats and "
                "tensile desiccation cracks above the headwall; never descend into liquefied "
                "slump-floor mud aprons between residual baydzherakh silt mounds."
            ),
            "navigation_protocol": (
                "Circumvent active thaw-slump amphitheaters along stable dry larch-tundra "
                "interfluve ridges; monitor acoustic popping from thawing massive ice faces."
            ),
            "progression_protocol": (
                "High-Standoff Crown-Crack Avoidance & Interfluve Ridge Bypass"
            ),
            "field_notes": (
                "The world's largest retrogressive megaslump exposes Pleistocene Yedoma "
                "permafrost; summer solar radiation triggers continuous mud-slurry debris flows."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "noatak-foothills-tussock-alaska-usa",
            "name": "Noatak & Brooks Range Foothills Eriophorum Tussock Polygon Basin",
            "country": "United States",
            "region": "Northwest Arctic Borough, Alaska (Western Brooks Range Foothills)",
            "elevation": "180-520 m (590-1,706 ft)",
            "elevation_m": 340,
            "morphology": "high-center-tussock-polygon-trough",
            "difficulty": "challenging",
            "default_active_layer_depth_cm": 60.0,
            "default_trough_water_depth_cm": 40.0,
            "default_soil_moisture_saturation_pct": 78.0,
            "default_eriophorum_tussock_height_cm": 48.0,
            "default_pack_load_kg": 20.0,
            "primary_hazard": (
                "Unstable wobble-pedestals of Eriophorum vaginatum (cottongrass) tussocks "
                "flanked by deep, water-filled high-center polygon erosion troughs."
            ),
            "routing_strategy": (
                "Use dual locking trekking poles with oversized mud baskets; step firmly into "
                "the narrow inter-tussock channels where the frozen frost table is shallow, or "
                "traverse dry gravel-eskine drainage divides rather than balancing on tall crowns."
            ),
            "navigation_protocol": (
                "Link gravel river bars and dry Dryas-heath ridge crests; when forced into "
                "high-center polygon fields, test inter-tussock frost depth every 15-20 paces."
            ),
            "progression_protocol": (
                "Inter-Tussock Frost-Table Stepping & Dual-Pole Tripod Stabilization"
            ),
            "field_notes": (
                "Relentless cottongrass tussock fields ('ball-bearing tundra') amplify ankle "
                "inversion torque and cut unassisted walking speed by more than half."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "bykovsky-lena-alas-tundra-russia",
            "name": "Lena Delta & Bykovsky Yedoma Ice-Complex Alas Depressions",
            "country": "Russia",
            "region": "Bulunsky District, Sakha Republic (Lena River Delta & Laptev Coast)",
            "elevation": "2-42 m (7-138 ft)",
            "elevation_m": 22,
            "morphology": "drunken-forest-alas-depression",
            "difficulty": "moderate",
            "default_active_layer_depth_cm": 48.0,
            "default_trough_water_depth_cm": 30.0,
            "default_soil_moisture_saturation_pct": 74.0,
            "default_eriophorum_tussock_height_cm": 24.0,
            "default_pack_load_kg": 16.0,
            "primary_hazard": (
                "Coalescing thermokarst alas lake basins, tilted 'drunken forest' larch edge "
                "zones, and conical baydzherakh thermokarst mounds surrounded by thixotropic silt."
            ),
            "routing_strategy": (
                "Contour along intermediate Yedoma terrace shoulders above the waterlogged alas "
                "basin floor; avoid quaking Carex-moss mats bordering expanding thermokarst lakes."
            ),
            "navigation_protocol": (
                "Follow wind-scoured upland Yedoma remnants and dry pingos; bypass sunken alas "
                "bottoms where suprapermafrost groundwater pools above the ice table."
            ),
            "progression_protocol": (
                "Yedoma Terrace Shoulder Contouring & Baydzherakh Saddle Threading"
            ),
            "field_notes": (
                "Degrading Ice Complex deposits create a labyrinth of steep-sided thermokarst "
                "alas basins and isolated baydzherakh silt pillars along the Laptev Sea coast."
            ),
        }
    ),
]

THERMOKARST_SITES = THERMOKARST_TUNDRA_SITES

THERMOKARST_TUNDRA_GEAR_CHECKLIST: list[_AttrDict] = [
    _AttrDict(
        {
            "item": "Graduated T-Handle Steel Permafrost Active-Layer Probe (150 cm)",
            "category": "sounding_navigation",
            "priority": "essential",
            "rationale": (
                "Measures depth to the solid sub-surface frost table and detects submerged "
                "ice-wedge trough drop-offs before committing body weight."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "Dual Locking Trekking Poles with 110 mm Snow/Mud Baskets",
            "category": "stabilization",
            "priority": "essential",
            "rationale": (
                "Prevents ankle inversion on wobbling Eriophorum cottongrass tussock pedestals "
                "and provides tripod leverage to break thixotropic silt boot suction."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "Knee-High Neoprene-Lined Tundra Wading Boots or Breathable Dry-Bibs",
            "category": "footwear_protection",
            "priority": "essential",
            "rationale": (
                "Protects feet from near-freezing (0.5-3 °C) suprapermafrost water pooled in "
                "flooded ice-wedge troughs and low-center polygon pans."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "20 m Floating Dyneema Throw-Line & Webbing Extraction Harness",
            "category": "rescue_safety",
            "priority": "essential",
            "rationale": (
                "Enables rapid horizontal haul extraction from liquefied retrogressive "
                "thaw-slump mudflows or submerged ice-wedge fissures without approaching unstable edges."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "High-Resolution Optical/SAR Satellite Imagery & Offline GNSS Receiver",
            "category": "navigation",
            "priority": "essential",
            "rationale": (
                "Identifies coalescing thermokarst lake networks, retrogressive headwall "
                "retreat scarps, and continuous upland interfluve corridors across featureless tundra."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "Ankle-Support Lace-Up Inner Lacing System & Abrasion Gaiters",
            "category": "footwear_protection",
            "priority": "essential",
            "rationale": (
                "Secures the heel cup against deep mud vacuum pull so boots are not stripped "
                "off in liquefied Yedoma silt and protects shins from dwarf birch scrub."
            ),
        }
    ),
]


def get_all_sites() -> list[_AttrDict]:
    """Return all curated thermokarst tundra sites."""
    return list(THERMOKARST_TUNDRA_SITES)


def get_all_thermokarst_tundra_sites() -> list[_AttrDict]:
    """Alias returning all curated thermokarst tundra sites."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> _AttrDict | None:
    """Look up a thermokarst tundra site by exact ID or fuzzy substring."""
    if not site_id:
        return None
    norm = site_id.strip().lower()
    for site in THERMOKARST_TUNDRA_SITES:
        if site["id"].lower() == norm:
            return site
    for site in THERMOKARST_TUNDRA_SITES:
        if norm in site["id"].lower() or norm in site["name"].lower():
            return site
    return None


def get_thermokarst_tundra_site_by_id(site_id: str) -> _AttrDict | None:
    """Alias for get_site_by_id."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
) -> list[_AttrDict]:
    """Filter thermokarst tundra sites by country, morphology, and/or difficulty."""
    results = list(THERMOKARST_TUNDRA_SITES)
    if country:
        c_norm = country.strip().lower()
        results = [
            s
            for s in results
            if c_norm in s["country"].lower() or c_norm in s["region"].lower()
        ]
    if morphology:
        m_norm = morphology.strip().lower()
        results = [s for s in results if m_norm in s["morphology"].lower()]
    if difficulty:
        d_norm = difficulty.strip().lower()
        results = [s for s in results if d_norm == s["difficulty"].lower()]
    return results


def get_gear_checklist() -> list[_AttrDict]:
    """Return the 6-item essential thermokarst tundra gear checklist."""
    return list(THERMOKARST_TUNDRA_GEAR_CHECKLIST)


def calculate_thermokarst_tundra(
    active_layer_depth_cm: float = 55.0,
    trough_water_depth_cm: float = 35.0,
    soil_moisture_saturation_pct: float = 75.0,
    eriophorum_tussock_height_cm: float = 30.0,
    pack_load_kg: float = 18.0,
) -> _AttrDict:
    """Calculate suprapermafrost liquefaction, boot suction, tussock fatigue, and speed.

    Validates all 5 physical parameters and returns deterministic field metrics.
    """
    if not (10.0 <= active_layer_depth_cm <= 160.0):
        raise ValueError(
            "active_layer_depth_cm must be between 10.0 and 160.0 cm "
            f"(received {active_layer_depth_cm})"
        )
    if not (0.0 <= trough_water_depth_cm <= 140.0):
        raise ValueError(
            "trough_water_depth_cm must be between 0.0 and 140.0 cm "
            f"(received {trough_water_depth_cm})"
        )
    if not (20.0 <= soil_moisture_saturation_pct <= 100.0):
        raise ValueError(
            "soil_moisture_saturation_pct must be between 20.0 and 100.0 % "
            f"(received {soil_moisture_saturation_pct})"
        )
    if not (5.0 <= eriophorum_tussock_height_cm <= 75.0):
        raise ValueError(
            "eriophorum_tussock_height_cm must be between 5.0 and 75.0 cm "
            f"(received {eriophorum_tussock_height_cm})"
        )
    if not (0.0 <= pack_load_kg <= 45.0):
        raise ValueError(
            "pack_load_kg must be between 0.0 and 45.0 kg "
            f"(received {pack_load_kg})"
        )

    # Normalized components (0.0 to 1.0)
    thaw_norm = (active_layer_depth_cm - 10.0) / 150.0
    water_norm = trough_water_depth_cm / 140.0
    moisture_norm = (soil_moisture_saturation_pct - 20.0) / 80.0
    tussock_norm = (eriophorum_tussock_height_cm - 5.0) / 70.0
    load_norm = pack_load_kg / 45.0

    # Suprapermafrost liquefaction index (0 - 100 scale)
    raw_liquefaction = (
        10.0
        + 38.0 * thaw_norm
        + 28.0 * moisture_norm
        + 16.0 * water_norm
        + 8.0 * load_norm
    )
    suprapermafrost_liquefaction_index = round(
        max(5.0, min(99.5, raw_liquefaction)), 1
    )

    # Boot suction entrapment probability (0 - 100 %)
    raw_suction = (
        6.0
        + 34.0 * thaw_norm
        + 30.0 * moisture_norm
        + 18.0 * load_norm
        + 12.0 * water_norm
    )
    boot_suction_entrapment_pct = round(max(3.0, min(98.0, raw_suction)), 1)

    # Tussock ankle fatigue multiplier (1.0x - 3.5x)
    raw_fatigue = (
        1.05
        + 1.35 * tussock_norm
        + 0.45 * load_norm
        + 0.30 * water_norm
        + 0.25 * thaw_norm
    )
    tussock_ankle_fatigue_multiplier = round(max(1.0, min(3.5, raw_fatigue)), 2)

    # Effective forward speed (km/h)
    raw_speed = (
        3.6
        - 0.95 * thaw_norm
        - 0.75 * tussock_norm
        - 0.65 * water_norm
        - 0.45 * moisture_norm
        - 0.40 * load_norm
    )
    effective_forward_speed_kmh = round(max(0.45, min(3.6, raw_speed)), 2)

    # Risk classification
    if (
        suprapermafrost_liquefaction_index >= 72.0
        or boot_suction_entrapment_pct >= 68.0
        or trough_water_depth_cm >= 85.0
        or active_layer_depth_cm >= 115.0
    ):
        risk_level = "critical"
        routing_strategy = (
            "CRITICAL THAW-SLUMP & TROUGH HAZARD: Abort direct polygon-basin or slump-floor "
            "crossing. Maintain >=50 m standoff from retrogressive thaw-slump headwalls and "
            "detour along upland gravel-eskine or dry Yedoma interfluve ridges."
        )
    elif (
        suprapermafrost_liquefaction_index >= 52.0
        or boot_suction_entrapment_pct >= 48.0
        or trough_water_depth_cm >= 50.0
        or eriophorum_tussock_height_cm >= 45.0
    ):
        risk_level = "high"
        routing_strategy = (
            "HIGH THERMOKARST INSTABILITY: Traverse strictly along elevated low-center "
            "polygon rims; probe every flooded trough intersection with a 150 cm steel "
            "frost probe and step between tall Eriophorum tussocks onto the frost table."
        )
    elif (
        suprapermafrost_liquefaction_index >= 34.0
        or boot_suction_entrapment_pct >= 28.0
        or trough_water_depth_cm >= 25.0
    ):
        risk_level = "moderate"
        routing_strategy = (
            "MODERATE POLYGON-TUNDRA HAZARD: Link raised polygon rims and intermediate "
            "terrace shoulders; use dual locking poles with 110 mm mud baskets to counter "
            "cottongrass tussock wobble and shallow silt suction."
        )
    else:
        risk_level = "low"
        routing_strategy = (
            "LOW FROST-TABLE HAZARD: Shallow active layer provides firm sub-surface frost-table "
            "support; maintain standard rim-to-rim progression and probe dark water channels."
        )

    warnings: list[str] = []
    if active_layer_depth_cm >= 90.0:
        warnings.append(
            f"Deep thawed active layer ({active_layer_depth_cm:.0f} cm) exceeds standard boot shaft "
            "and causes deep thixotropic Yedoma silt sinkage above the permafrost table."
        )
    if trough_water_depth_cm >= 50.0:
        warnings.append(
            f"Flooded ice-wedge troughs ({trough_water_depth_cm:.0f} cm) conceal thermal-erosion "
            "undercuts and slippery massive-ice wedge tops; avoid jumping across triple junctions."
        )
    if soil_moisture_saturation_pct >= 85.0:
        warnings.append(
            f"Near-saturated suprapermafrost soil ({soil_moisture_saturation_pct:.0f}%) triggers "
            "spontaneous liquefaction under footstep vibration and high boot-suction entrapment."
        )
    if eriophorum_tussock_height_cm >= 40.0:
        warnings.append(
            f"Tall Eriophorum cottongrass tussocks ({eriophorum_tussock_height_cm:.0f} cm) create "
            f"severe ankle-inversion torque ({tussock_ankle_fatigue_multiplier:.2f}x fatigue multiplier)."
        )
    if pack_load_kg >= 25.0:
        warnings.append(
            f"Heavy pack load ({pack_load_kg:.0f} kg) increases ground bearing pressure and "
            "accelerates punch-through into liquefied inter-tussock peat channels."
        )

    recommendations: list[str] = [
        "Probe depth to the frozen frost table continuously using a graduated 150 cm T-handle steel permafrost rod.",
        "Walk on elevated polygon rims or step into shallow inter-tussock channels where the frost table is firm rather than balancing on wobbling Eriophorum crowns.",
        "Maintain at least 50 m upslope clearance from overhanging turf mats and tension cracks along retrogressive thaw-slump headwalls.",
    ]
    if risk_level in {"high", "critical"}:
        recommendations.append(
            "Stage a 20 m floating Dyneema throw-line when crossing flooded ice-wedge trough junctions or skirting baydzherakh mud aprons."
        )

    return _AttrDict(
        {
            "active_layer_depth_cm": round(float(active_layer_depth_cm), 1),
            "trough_water_depth_cm": round(float(trough_water_depth_cm), 1),
            "soil_moisture_saturation_pct": round(float(soil_moisture_saturation_pct), 1),
            "eriophorum_tussock_height_cm": round(float(eriophorum_tussock_height_cm), 1),
            "pack_load_kg": round(float(pack_load_kg), 1),
            "suprapermafrost_liquefaction_index": suprapermafrost_liquefaction_index,
            "boot_suction_entrapment_pct": boot_suction_entrapment_pct,
            "tussock_ankle_fatigue_multiplier": tussock_ankle_fatigue_multiplier,
            "effective_forward_speed_kmh": effective_forward_speed_kmh,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "routing_strategy": routing_strategy,
            "progression_protocol": routing_strategy,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


_STRONG_KEYWORDS: tuple[str, ...] = (
    "thermokarst",
    "ice-wedge",
    "ice wedge",
    "polygon tundra",
    "polygon-tundra",
    "polygonal tundra",
    "low-center polygon",
    "high-center polygon",
    "ice-wedge polygon",
    "ice wedge polygon",
    "thaw-slump",
    "thaw slump",
    "retrogressive thaw",
    "batagaika",
    "tuktoyaktuk",
    "ibyuk pingo",
    "pingo polygon",
    "bykovsky",
    "yedoma",
    "baydzherakh",
    "alas depression",
    "drunken forest",
    "eriophorum",
    "suprapermafrost",
    "noatak",
)

_CONTEXT_KEYWORDS: tuple[str, ...] = (
    "active layer",
    "active-layer",
    "frost table",
    "frost-table",
    "pingo",
    "trough water",
    "polygon rim",
    "cottongrass tussock",
    "tussock polygon",
    "permafrost probe",
    "lena delta",
    "yana highlands",
)

_EXCLUSION_PATTERNS: tuple[str, ...] = (
    "cladonia",
    "reindeer lichen",
    "lichen mat",
    "rondane",
    "hardangervidda",
    "laponia",
    "poa foliosa",
    "megaherb",
    "macquarie island",
    "sub-antarctic",
    "subantarctic",
    "south georgia",
    "ombrotrophic",
    "raised bog",
    "soomaa",
    "räätsad",
    "raatsad",
    "espeletia",
    "frailejón",
    "frailejon",
    "páramo",
    "paramo",
    "sumapaz",
    "aufeis",
    "naled",
    "overflow ice",
    "rock glacier",
    "rock-glacier",
    "val muragl",
    "thermokarst furrow",
    "glacière",
    "glaciere",
    "eisriesenwelt",
    "cryokarst",
    "moulin",
    "sandur",
    "jökulhlaup",
    "jokulhlaup",
    "wattwanderung",
    "wadden",
    "salar",
    "halite",
    "brine",
    "mirabilite",
)


def is_thermokarst_tundra_query(query: str) -> bool:
    """Return True if the user query asks about Arctic polygon-tundra or thermokarst navigation."""
    if not query:
        return False
    q_lower = query.lower()

    if any(ex in q_lower for ex in _EXCLUSION_PATTERNS):
        return False

    if any(k in q_lower for k in _STRONG_KEYWORDS):
        return True

    context_hits = sum(1 for k in _CONTEXT_KEYWORDS if k in q_lower)
    if context_hits >= 2:
        return True
    if context_hits == 1 and any(
        w in q_lower for w in ("tundra", "permafrost", "polygon", "trough", "slump", "arctic")
    ):
        return True

    return False


def detect_thermokarst_tundra_intent(query: str) -> bool:
    """Alias for is_thermokarst_tundra_query used by chat_request and main."""
    return is_thermokarst_tundra_query(query)


def _clamp(val: float, low: float, high: float) -> float:
    return max(low, min(high, val))


def extract_thermokarst_tundra_params(query: str) -> dict[str, Any]:
    """Extract thermokarst tundra site ID and physical calculator parameters from text."""
    q_lower = query.lower()
    matched_site: _AttrDict | None = None

    site_aliases: list[tuple[tuple[str, ...], str]] = [
        (("tuktoyaktuk", "ibyuk", "pingo", "beaufort", "inuvik"), "tuktoyaktuk-pingo-polygons-canada"),
        (("batagaika", "yana", "verkhoyansk", "yakutia", "mega-slump", "megaslump"), "batagaika-mega-slump-yakutia"),
        (("noatak", "brooks range", "alaska", "cottongrass"), "noatak-foothills-tussock-alaska-usa"),
        (("bykovsky", "lena delta", "laptev", "alas", "drunken forest", "yedoma"), "bykovsky-lena-alas-tundra-russia"),
    ]
    for keywords, sid in site_aliases:
        if any(k in q_lower for k in keywords):
            matched_site = get_site_by_id(sid)
            break

    active_layer_depth_cm = (
        float(matched_site["default_active_layer_depth_cm"]) if matched_site else 55.0
    )
    trough_water_depth_cm = (
        float(matched_site["default_trough_water_depth_cm"]) if matched_site else 35.0
    )
    soil_moisture_saturation_pct = (
        float(matched_site["default_soil_moisture_saturation_pct"]) if matched_site else 75.0
    )
    eriophorum_tussock_height_cm = (
        float(matched_site["default_eriophorum_tussock_height_cm"]) if matched_site else 30.0
    )
    pack_load_kg = (
        float(matched_site["default_pack_load_kg"]) if matched_site else 18.0
    )

    has_calc_params = any(
        w in q_lower
        for w in ("calculate", "calculator", "compute", "liquefaction", "suction", "assess", "evaluate")
    )

    # Active layer depth (cm)
    m_active = re.search(
        r"(?:active[- ]layer(?:\s+depth|\s+thaw)?\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*cm|"
        r"(\d+(?:\.\d+)?)\s*cm\s+active[- ]layer)",
        q_lower,
    )
    if m_active:
        val = float(m_active.group(1) or m_active.group(2))
        active_layer_depth_cm = _clamp(val, 10.0, 160.0)
        has_calc_params = True

    # Trough water depth (cm)
    m_trough = re.search(
        r"(?:trough(?:\s+water)?(?:\s+depth)?\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*cm|"
        r"(\d+(?:\.\d+)?)\s*cm\s+(?:trough|water\s+depth))",
        q_lower,
    )
    if m_trough:
        val = float(m_trough.group(1) or m_trough.group(2))
        trough_water_depth_cm = _clamp(val, 0.0, 140.0)
        has_calc_params = True

    # Soil moisture saturation (%)
    m_moist = re.search(
        r"(?:(?:soil\s+)?(?:moisture|saturation)(?:\s+saturation)?\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*%?|"
        r"(\d+(?:\.\d+)?)\s*%\s*(?:soil\s+)?(?:moisture|saturation))",
        q_lower,
    )
    if m_moist:
        val = float(m_moist.group(1) or m_moist.group(2))
        soil_moisture_saturation_pct = _clamp(val, 20.0, 100.0)
        has_calc_params = True

    # Eriophorum tussock height (cm)
    m_tussock = re.search(
        r"(?:(?:eriophorum\s+|cottongrass\s+)?tussock(?:\s+height)?\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*cm|"
        r"(\d+(?:\.\d+)?)\s*cm\s+(?:eriophorum\s+|cottongrass\s+)?tussock)",
        q_lower,
    )
    if m_tussock:
        val = float(m_tussock.group(1) or m_tussock.group(2))
        eriophorum_tussock_height_cm = _clamp(val, 5.0, 75.0)
        has_calc_params = True

    # Pack load (kg)
    m_pack = re.search(
        r"(?:pack(?:\s+load|\s+weight)?\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*kg|"
        r"(\d+(?:\.\d+)?)\s*kg\s+pack)",
        q_lower,
    )
    if m_pack:
        val = float(m_pack.group(1) or m_pack.group(2))
        pack_load_kg = _clamp(val, 0.0, 45.0)
        has_calc_params = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "site": matched_site,
        "active_layer_depth_cm": active_layer_depth_cm,
        "trough_water_depth_cm": trough_water_depth_cm,
        "soil_moisture_saturation_pct": soil_moisture_saturation_pct,
        "eriophorum_tussock_height_cm": eriophorum_tussock_height_cm,
        "pack_load_kg": pack_load_kg,
        "has_calc_params": has_calc_params,
    }


def format_thermokarst_tundra_response(query: str) -> _AttrDict:
    """Format structured thermokarst tundra response payload for chat and SSE pipelines."""
    params = extract_thermokarst_tundra_params(query)
    matched_site = params["site"]
    has_calc = bool(params["has_calc_params"])

    calc_result = calculate_thermokarst_tundra(
        active_layer_depth_cm=params["active_layer_depth_cm"],
        trough_water_depth_cm=params["trough_water_depth_cm"],
        soil_moisture_saturation_pct=params["soil_moisture_saturation_pct"],
        eriophorum_tussock_height_cm=params["eriophorum_tussock_height_cm"],
        pack_load_kg=params["pack_load_kg"],
    )

    if has_calc:
        action = "thermokarst_tundra_calculated"
    elif matched_site is not None:
        action = "thermokarst_tundra_lookup"
    else:
        action = "thermokarst_tundra_info"

    matched_sites = [matched_site] if matched_site is not None else list(THERMOKARST_TUNDRA_SITES)

    summary_parts: list[str] = []
    if matched_site is not None:
        summary_parts.append(
            f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']}) — "
            f"Morphology: `{matched_site['morphology']}`, Difficulty: `{matched_site['difficulty']}`."
        )
        summary_parts.append(f"Primary Hazard: {matched_site['primary_hazard']}")
        summary_parts.append(f"Site Routing Strategy: {matched_site['routing_strategy']}")
    else:
        summary_parts.append(
            "**Arctic Polygon-Tundra Ice-Wedge Trough & Thermokarst Thaw-Slump Navigation Guide** — "
            "Covers low-center and high-center ice-wedge polygons, retrogressive thaw-slump headwalls, "
            "Eriophorum cottongrass tussock basins, and Yedoma alas depressions."
        )

    summary_parts.append(
        f"**Suprapermafrost Liquefaction & Routing Assessment** "
        f"(Active Layer `{calc_result['active_layer_depth_cm']} cm`, "
        f"Trough Water `{calc_result['trough_water_depth_cm']} cm`, "
        f"Soil Saturation `{calc_result['soil_moisture_saturation_pct']}%`, "
        f"Tussock Height `{calc_result['eriophorum_tussock_height_cm']} cm`, "
        f"Pack Load `{calc_result['pack_load_kg']} kg`): "
        f"Liquefaction Index `{calc_result['suprapermafrost_liquefaction_index']}/100`, "
        f"Boot Suction Entrapment `{calc_result['boot_suction_entrapment_pct']}%`, "
        f"Tussock Fatigue Multiplier `{calc_result['tussock_ankle_fatigue_multiplier']}x`, "
        f"Effective Speed `{calc_result['effective_forward_speed_kmh']} km/h`, "
        f"Risk Level `{calc_result['risk_level'].upper()}`."
    )
    summary_parts.append(f"Recommended Protocol: {calc_result['routing_strategy']}")

    summary_text = "\n\n".join(summary_parts)
    return _AttrDict(
        {
            "action": action,
            "query": query,
            "matched_site": matched_site,
            "matched_sites": matched_sites,
            "sites": list(THERMOKARST_TUNDRA_SITES),
            "calculation": calc_result,
            "gear_checklist": list(THERMOKARST_TUNDRA_GEAR_CHECKLIST),
            "summary": summary_text,
            "answer": summary_text,
        }
    )


def build_thermokarst_tundra_prompt(query_or_info: dict[str, Any] | str) -> str:
    """Build system prompt injection block with thermokarst tundra data and gear checklist."""
    info: dict[str, Any] = (
        format_thermokarst_tundra_response(query_or_info)
        if isinstance(query_or_info, str)
        else query_or_info
    )
    calc: dict[str, Any] = info.get("calculation") or {}
    matched_site: dict[str, Any] | None = info.get("matched_site")
    lines: list[str] = [
        "=== ARCTIC POLYGON-TUNDRA ICE-WEDGE TROUGH & THERMOKARST THAW-SLUMP NAVIGATION CONTEXT ===",
        f"Action: {info.get('action', 'thermokarst_tundra_info')}",
    ]
    if matched_site:
        lines.extend(
            [
                f"Matched Site: {matched_site['name']} ({matched_site['id']})",
                f"Location: {matched_site['region']}, {matched_site['country']} ({matched_site['elevation']})",
                f"Morphology: {matched_site['morphology']} | Difficulty: {matched_site['difficulty']}",
                f"Primary Hazard: {matched_site['primary_hazard']}",
                f"Site Routing Strategy: {matched_site['routing_strategy']}",
            ]
        )
    else:
        lines.append("Cataloged Arctic Polygon-Tundra & Thermokarst Sites:")
        for s in THERMOKARST_TUNDRA_SITES:
            lines.append(
                f"- {s['name']} ({s['country']}, {s['morphology']}, {s['difficulty']}): {s['routing_strategy']}"
            )

    if calc:
        lines.extend(
            [
                "Deterministic Suprapermafrost Liquefaction & Progression Metrics:",
                f"- Active Layer Thaw Depth: {calc.get('active_layer_depth_cm')} cm",
                f"- Ice-Wedge Trough Water Depth: {calc.get('trough_water_depth_cm')} cm",
                f"- Soil Moisture Saturation: {calc.get('soil_moisture_saturation_pct')}%",
                f"- Eriophorum Tussock Height: {calc.get('eriophorum_tussock_height_cm')} cm",
                f"- Pack Load: {calc.get('pack_load_kg')} kg",
                f"- Suprapermafrost Liquefaction Index: {calc.get('suprapermafrost_liquefaction_index')}/100",
                f"- Boot Suction Entrapment Probability: {calc.get('boot_suction_entrapment_pct')}%",
                f"- Tussock Ankle Fatigue Multiplier: {calc.get('tussock_ankle_fatigue_multiplier')}x",
                f"- Effective Forward Speed: {calc.get('effective_forward_speed_kmh')} km/h",
                f"- Risk Level: {calc.get('risk_level')}",
                f"- Routing Strategy: {calc.get('routing_strategy')}",
            ]
        )
        warnings = calc.get("warnings") or []
        if warnings:
            lines.append("Active Field Warnings:")
            for w in warnings:
                lines.append(f"  * {w}")

    lines.append("ESSENTIAL THERMOKARST TUNDRA GEAR CHECKLIST:")
    for item in THERMOKARST_TUNDRA_GEAR_CHECKLIST:
        lines.append(f"- {item['item']} ({item['category']}): {item['rationale']}")
    lines.append("=== END THERMOKARST TUNDRA NAVIGATION CONTEXT ===")
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return synchronous chat response dictionary for thermokarst tundra queries."""
    info = format_thermokarst_tundra_response(query)
    return {
        "answer": info["summary"],
        "thermokarst_tundra_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[dict[str, Any], None, None]:
    """Yield SSE stream event dictionaries for thermokarst tundra queries."""
    info = format_thermokarst_tundra_response(query)
    yield {"thermokarst_tundra_info": info, "context": []}
    for paragraph in info["summary"].split("\n\n"):
        yield {"answer": paragraph + "\n\n"}
