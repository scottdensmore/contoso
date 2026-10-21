"""Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation Guide module.

Provides domain data, physics-based Poa flabellata / Chionochloa pedestal-maze & seal-wallow
pit entrapment modeling, katabatic / williwaw wind knockdown estimation, effective wet wind chill,
aggressive pinniped encounter detour multipliers, mandatory safety gear checklists,
and intent detection for subantarctic tussock headlands and peat bog terraces.
"""

from __future__ import annotations

import json
import re
from collections.abc import Generator
from typing import Any, Literal

TussockMorphology = Literal[
    "poa-flabellata-pedestal-maze",
    "seal-wallow-bog-trench-apron",
    "chionochloa-megaherb-peat-terrace",
    "azorella-feldmark-katabatic-ridge",
]
TussockDifficulty = Literal["moderate", "challenging", "extreme"]
TussockRiskLevel = Literal["low", "moderate", "high", "critical"]
TussockRoutingStrategy = Literal[
    "open-feldmark-compass-ridge-transit",
    "inter-pedestal-sounding-pole-channel-weave",
    "leeward-terrace-contour-fauna-detour",
    "abort-williwaw-bivy-and-wallow-lockout",
]


class _AttrDict(dict[str, Any]):
    """Dictionary subclass supporting attribute-style read access."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc


# ---------------------------------------------------------------------------
# Reference Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Sites (4 Sites)
# ---------------------------------------------------------------------------

TUSSOCK_HEADLAND_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "fortuna-bay-stromness-south-georgia",
            "name": "Fortuna Bay & Shackleton Gap Poa flabellata Tussock Headland",
            "country": "United Kingdom",
            "region": "South Georgia & the South Sandwich Islands (54°S Subantarctic Convergence)",
            "elevation": "Sea level to 305 m col (Shackleton Gap)",
            "elevation_m": 305,
            "morphology": "poa-flabellata-pedestal-maze",
            "difficulty": "extreme",
            "default_pedestal_height_m": 2.1,
            "default_katabatic_wind_kmh": 95.0,
            "default_wallow_trench_depth_cm": 85.0,
            "default_ambient_temp_c": 1.5,
            "default_seal_density_per_ha": 42.0,
            "primary_hazard": (
                "Overhanging 2 m Poa flabellata peat pedestals concealing chest-deep anaerobic seal-wallow "
                "mud trenches, territorial Antarctic fur seal (Arctocephalus gazella) bulls in blind corridors, "
                "and sudden 120+ km/h glacier-fed katabatic williwaw squalls."
            ),
            "navigation_protocol": (
                "Probe inter-pedestal mud channels with 100 mm snow/bog-basket poles before committing weight; "
                "never jump blindly from elevated tussock crowns into unprobed hollows, and climb above the "
                "coastal tussock fringe onto scree/feldmark benches whenever fur seal density exceeds 25/ha."
            ),
            "fauna_avoidance_protocol": (
                "Carry a wooden bodger / trekking pole extended horizontally at waist level to deter charging "
                "Antarctic fur seal bulls without striking; maintain a 25 m buffer around elephant seal harems "
                "and king penguin rookery commute lanes."
            ),
            "traversal_protocol": (
                "Probe inter-pedestal mud channels with 100 mm snow/bog-basket poles before committing weight; "
                "climb above the coastal tussock fringe onto scree benches when fur seal density is high."
            ),
            "field_notes": (
                "Final coastal headland and tussock-apron leg of the historic 1916 Shackleton Crean-Worsley "
                "traverse between Fortuna Bay and Stromness Whaling Station."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "macquarie-island-featherbed-australia",
            "name": "Macquarie Island Featherbed Peat Terrace & Katabatic Escarpment",
            "country": "Australia",
            "region": "Tasmanian Subantarctic World Heritage Area (54°30'S Southern Ocean)",
            "elevation": "5 m raised coastal terrace to 280 m plateau rim",
            "elevation_m": 280,
            "morphology": "seal-wallow-bog-trench-apron",
            "difficulty": "challenging",
            "default_pedestal_height_m": 1.6,
            "default_katabatic_wind_kmh": 82.0,
            "default_wallow_trench_depth_cm": 95.0,
            "default_ambient_temp_c": 3.5,
            "default_seal_density_per_ha": 35.0,
            "primary_hazard": (
                "Quaking floating-peat mire ('The Featherbed') perforated by liquefied southern elephant seal "
                "(Mirounga leonina) wallow pits, slick Stilbocarpa polaris megaherb slopes, and relentless "
                "Roaring Forties / Furious Fifties westerly mist."
            ),
            "navigation_protocol": (
                "Skirt the inner escarpment toe where alluvial gravel fans thin the floating peat mat; "
                "probe liquefied wallow aprons continuously and ascend to the wind-scoured plateau boardwalk/track "
                "corridor before dusk."
            ),
            "fauna_avoidance_protocol": (
                "Detour upslope around moulting southern elephant seal wallow aggregations and royal/gentoo "
                "penguin tussock highways; sanitize boots in Virkon S footbaths between catchment zones."
            ),
            "traversal_protocol": (
                "Skirt the inner escarpment toe where alluvial gravel fans thin the floating peat mat; "
                "probe liquefied wallow aprons continuously."
            ),
            "field_notes": (
                "Exposed ophiolite oceanic-crust ridge lifted above the Southern Ocean, fringed by deep "
                "Poa foliosa tussock pedestals and quaking coastal mire terraces."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "enderby-island-megaherb-auckland-nz",
            "name": "Enderby & Adams Island Chionochloa Tussock & Megaherb Bog",
            "country": "New Zealand",
            "region": "Auckland Islands (Motu Maha) Subantarctic Nature Reserve (50°30'S)",
            "elevation": "Sea-cliff headland rim to 340 m peat dome",
            "elevation_m": 340,
            "morphology": "chionochloa-megaherb-peat-terrace",
            "difficulty": "challenging",
            "default_pedestal_height_m": 1.4,
            "default_katabatic_wind_kmh": 72.0,
            "default_wallow_trench_depth_cm": 60.0,
            "default_ambient_temp_c": 5.0,
            "default_seal_density_per_ha": 28.0,
            "primary_hazard": (
                "Waterlogged blanket-peat sinkholes hidden beneath waist-high Chionochloa antarctica tussock "
                "and giant Pleurophyllum megaherbs, concealed white-chinned petrel burrows, and critically "
                "endangered New Zealand sea lion (Phocarctos hookeri) bulls resting inside deep tussock."
            ),
            "navigation_protocol": (
                "Step deliberately along firm mineral-soil sea-cliff rims or established planked tracks; "
                "use wide-basket probes to detect subterranean petrel burrow roofs and saturated peat pipes."
            ),
            "fauna_avoidance_protocol": (
                "Maintain high vocal call-outs when pushing through tall Chionochloa tussock to avoid startling "
                "sleeping Hooker's sea lions; yield 20 m right-of-way to yellow-eyed penguin (hoiho) landing transits."
            ),
            "traversal_protocol": (
                "Step deliberately along firm mineral-soil sea-cliff rims; use wide-basket probes to detect "
                "subterranean petrel burrow roofs and saturated peat pipes."
            ),
            "field_notes": (
                "Renowned subantarctic botanical sanctuary combining dense southern rata wind-shorn forest, "
                "deep blanket peat bogs, and vibrant megaherb meadows above sheer basalt sea cliffs."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "kerguelen-courbet-azorella-france",
            "name": "Péninsule Courbet & Baie de l'Oiseau Azorella Feldmark Headland",
            "country": "France",
            "region": "Archipel des Kerguelen, Terres Australes et Antarctiques Françaises (49°S)",
            "elevation": "10 m coastal bog terrace to 245 m basaltic headland ridge",
            "elevation_m": 245,
            "morphology": "azorella-feldmark-katabatic-ridge",
            "difficulty": "moderate",
            "default_pedestal_height_m": 0.8,
            "default_katabatic_wind_kmh": 88.0,
            "default_wallow_trench_depth_cm": 45.0,
            "default_ambient_temp_c": 2.5,
            "default_seal_density_per_ha": 16.0,
            "primary_hazard": (
                "Hurricane-force katabatic downslope gales sweeping off the Cook Ice Cap, treacherous "
                "waterlogged souilles (quaking peat sinkholes) bordering Azorella selago cushion domes, "
                "and rapid horizontal sleet whiteouts."
            ),
            "navigation_protocol": (
                "Route along wind-deflated basaltic feldmark gravel ridges above the coastal souille marshes; "
                "preserve fragile slow-growing Azorella selago cushions and Pringlea antiscorbutica (Kerguelen cabbage) beds."
            ),
            "fauna_avoidance_protocol": (
                "Detour upslope of dense coastal elephant seal wallow aprons and gentoo/king penguin "
                "molting colonies along Baie de l'Oiseau."
            ),
            "traversal_protocol": (
                "Route along wind-deflated basaltic feldmark gravel ridges above the coastal souille marshes; "
                "preserve fragile Azorella selago cushions."
            ),
            "field_notes": (
                "Classic subantarctic wind-scoured peninsula where compact vascular Azorella cushions and "
                "coastal peat bogs transition abruptly into periglacial basaltic fellfields."
            ),
        }
    ),
]

TUSSOCK_SITES: list[dict[str, Any]] = TUSSOCK_HEADLAND_SITES


# ---------------------------------------------------------------------------
# Mandatory 6-Item Subantarctic Tussock & Katabatic Headland Gear Checklist
# ---------------------------------------------------------------------------

TUSSOCK_HEADLAND_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "Dual Reinforced Carbon/Alloy Sounding Poles with 100 mm Subantarctic Bog Baskets & Rubber Tips",
        "category": "peat_and_fauna_defense",
        "priority": "essential",
        "rationale": (
            "Probes concealed inter-pedestal seal-wallow mud trenches before committing weight and "
            "serves as a non-injurious horizontal visual spacer against charging fur seal bulls."
        ),
    },
    {
        "item": "Knee-High 500D Cordura / ePTFE Waterproof Bog Gaiters over Stiff-Shank Leather Mountaineering Boots",
        "category": "lower_limb_entrapment_shield",
        "priority": "essential",
        "rationale": (
            "Seals out anaerobic peat slurry during sudden inter-pedestal step-throughs and prevents "
            "ankle inversion when edging along overhanging Poa flabellata root crowns."
        ),
    },
    {
        "item": "Expedition 3-Layer Gore-Tex Pro Storm Shell (28,000 mm HH) with Neoprene Wrist Cuffs & Storm Goggles",
        "category": "katabatic_williwaw_armor",
        "priority": "essential",
        "rationale": (
            "Withstands 120+ km/h horizontal sleet, salt spray, and glacier-fed katabatic williwaw gusts "
            "that strip core body heat within minutes on exposed subantarctic headlands."
        ),
    },
    {
        "item": "4-Person Silicone-Nylon Subantarctic Storm Bothy Bag with Internal Guy-Points",
        "category": "emergency_hypothermia_shelter",
        "priority": "essential",
        "rationale": (
            "Deploys in under 30 seconds in lee of tussock pedestals or basalt boulders to create a "
            "windproof microclimate during sudden subantarctic whiteout squalls."
        ),
    },
    {
        "item": "Biosecurity Boot-Scrubbing Brush, Hoof Pick & Virkon S Disinfectant Sachet Kit",
        "category": "island_biosecurity_compliance",
        "priority": "essential",
        "rationale": (
            "Mandatory under South Georgia, Macquarie, Auckland, and Kerguelen conservation regulations "
            "to prevent transporting invasive Poa annua seeds or avian pathogens between headlands."
        ),
    },
    {
        "item": "Liquid-Damped Southern-Hemisphere Global Needle Mirror Compass, Barometric Altimeter & Dual-Band GNSS",
        "category": "whiteout_dead_reckoning",
        "priority": "essential",
        "rationale": (
            "Maintains accurate azimuth dead-reckoning when 2 m tussock pedestals and advection sea fog "
            "reduce horizontal line-of-sight below 10 meters."
        ),
    },
]

TUSSOCK_GEAR_CHECKLIST: list[dict[str, Any]] = TUSSOCK_HEADLAND_GEAR_CHECKLIST


# ---------------------------------------------------------------------------
# Catalog Accessors & Filtering
# ---------------------------------------------------------------------------


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 reference subantarctic tussock headland sites."""
    return list(TUSSOCK_HEADLAND_SITES)


def get_all_tussock_headland_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Return a single subantarctic tussock headland site by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in TUSSOCK_HEADLAND_SITES:
        if str(site["id"]).lower() == target:
            return site
    return None


def get_tussock_headland_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """Filter subantarctic tussock headland sites by country, morphology, difficulty, or free-text search."""
    results: list[dict[str, Any]] = list(TUSSOCK_HEADLAND_SITES)

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
        q_lower = search.strip().lower().replace("é", "e").replace("è", "e").replace("ç", "c")
        results = [
            s
            for s in results
            if q_lower in str(s["name"]).lower().replace("é", "e")
            or q_lower in str(s["country"]).lower()
            or q_lower in str(s["region"]).lower().replace("é", "e").replace("ç", "c")
            or q_lower in str(s["morphology"]).lower()
            or q_lower in str(s["field_notes"]).lower().replace("é", "e")
            or q_lower in str(s["id"]).lower()
        ]

    return results


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6-item mandatory subantarctic tussock & katabatic headland gear checklist."""
    return list(TUSSOCK_HEADLAND_GEAR_CHECKLIST)


# ---------------------------------------------------------------------------
# Physics-Based Subantarctic Tussock & Katabatic Headland Calculator
# ---------------------------------------------------------------------------


def calculate_tussock_headland(
    pedestal_height_m: float = 1.4,
    katabatic_wind_kmh: float = 65.0,
    wallow_trench_depth_cm: float = 55.0,
    ambient_temp_c: float = 3.0,
    seal_density_per_ha: float = 18.0,
) -> dict[str, Any]:
    """Calculate katabatic knockdown index, inter-pedestal pit entrapment %, effective wind chill, and fauna detour multiplier.

    Parameters
    ----------
    pedestal_height_m:
        Mean height of Poa flabellata / Chionochloa peat pedestals in meters [0.2, 3.0].
    katabatic_wind_kmh:
        Katabatic / williwaw wind gust speed in km/h [0, 160].
    wallow_trench_depth_cm:
        Depth of waterlogged inter-pedestal seal-wallow mud trenches in cm [0, 180].
    ambient_temp_c:
        Subantarctic ambient air temperature in degrees Celsius [-15, 18].
    seal_density_per_ha:
        Coastal fur seal / elephant seal / sea lion density per hectare [0, 120].
    """
    if not (0.2 <= pedestal_height_m <= 3.0):
        raise ValueError("pedestal_height_m must be between 0.2 and 3.0 meters")
    if not (0.0 <= katabatic_wind_kmh <= 160.0):
        raise ValueError("katabatic_wind_kmh must be between 0 and 160 km/h")
    if not (0.0 <= wallow_trench_depth_cm <= 180.0):
        raise ValueError("wallow_trench_depth_cm must be between 0 and 180 cm")
    if not (-15.0 <= ambient_temp_c <= 18.0):
        raise ValueError("ambient_temp_c must be between -15 and 18 degrees Celsius")
    if not (0.0 <= seal_density_per_ha <= 120.0):
        raise ValueError("seal_density_per_ha must be between 0 and 120 seals/ha")

    # 1. Katabatic knockdown & balance instability index (0.2 to 10.0)
    raw_knockdown = (
        (katabatic_wind_kmh / 18.0) + (pedestal_height_m * 0.65) + (wallow_trench_depth_cm / 95.0)
    )
    katabatic_knockdown_index = round(min(10.0, max(0.2, raw_knockdown)), 2)

    # 2. Inter-pedestal seal-wallow & peat pit entrapment probability (1.0 to 99.0%)
    raw_entrapment = (
        (pedestal_height_m * 18.5)
        + (wallow_trench_depth_cm * 0.34)
        + (seal_density_per_ha * 0.16)
        + (max(0.0, katabatic_wind_kmh - 40.0) * 0.12)
    )
    inter_pedestal_pit_entrapment_pct = round(min(99.0, max(1.0, raw_entrapment)), 1)

    # 3. Subantarctic wet-spray effective wind chill (°C)
    v_pow = max(1.0, katabatic_wind_kmh) ** 0.16
    wind_chill_effective_c = round(
        ambient_temp_c
        - (katabatic_wind_kmh * 0.085)
        - ((15.0 - ambient_temp_c) * 0.04 * (v_pow - 1.0)),
        1,
    )

    # 4. Aggressive pinniped & megafauna encounter detour distance multiplier (>= 1.0x)
    fauna_encounter_detour_multiplier = round(
        1.0
        + (seal_density_per_ha * 0.014)
        + (pedestal_height_m * 0.15)
        + (wallow_trench_depth_cm * 0.0025),
        2,
    )

    # 5. Classify Risk Level & Routing Strategy
    warnings: list[str] = []
    recommendations: list[str] = []

    if (
        katabatic_wind_kmh >= 110.0
        or inter_pedestal_pit_entrapment_pct >= 84.0
        or wind_chill_effective_c <= -14.0
        or wallow_trench_depth_cm >= 135.0
        or seal_density_per_ha >= 85.0
    ):
        risk_level: TussockRiskLevel = "critical"
        routing_strategy: TussockRoutingStrategy = "abort-williwaw-bivy-and-wallow-lockout"
    elif (
        katabatic_wind_kmh >= 75.0
        or inter_pedestal_pit_entrapment_pct >= 52.0
        or wind_chill_effective_c <= -6.0
        or wallow_trench_depth_cm >= 85.0
        or seal_density_per_ha >= 45.0
    ):
        risk_level = "high"
        routing_strategy = "leeward-terrace-contour-fauna-detour"
    elif (
        katabatic_wind_kmh >= 40.0
        or inter_pedestal_pit_entrapment_pct >= 28.0
        or wind_chill_effective_c <= 0.0
        or wallow_trench_depth_cm >= 40.0
        or seal_density_per_ha >= 15.0
    ):
        risk_level = "moderate"
        routing_strategy = "inter-pedestal-sounding-pole-channel-weave"
    else:
        risk_level = "low"
        routing_strategy = "open-feldmark-compass-ridge-transit"

    # Populate actionable warnings
    if katabatic_wind_kmh >= 75.0 or katabatic_knockdown_index >= 5.5:
        warnings.append(
            f"KATABATIC WILLIWAW KNOCKDOWN HAZARD ({katabatic_wind_kmh:.0f} km/h, index {katabatic_knockdown_index:.2f}): "
            "Sudden glacier-fed downslope squalls can hurl hikers off elevated tussock crowns into deep mud trenches."
        )
    if inter_pedestal_pit_entrapment_pct >= 50.0 or wallow_trench_depth_cm >= 80.0:
        warnings.append(
            f"SEAL-WALLOW & PEAT TRENCH ENTRAPMENT RISK ({inter_pedestal_pit_entrapment_pct:.1f}%, "
            f"{wallow_trench_depth_cm:.0f} cm depth): Overhanging {pedestal_height_m:.1f} m Poa flabellata pedestals "
            "conceal liquefied anaerobic mud pits capable of waist-to-chest submersion."
        )
    if seal_density_per_ha >= 35.0:
        warnings.append(
            f"TERRITORIAL PINNIPED BLIND-CORRIDOR HAZARD ({seal_density_per_ha:.0f} seals/ha): "
            "High density of Antarctic fur seals or sea lions inside blind inter-tussock channels creates acute bite and charge risk."
        )
    if wind_chill_effective_c <= -5.0:
        warnings.append(
            f"SUBANTARCTIC WET-CHILL HYPOTHERMIA ALERT ({wind_chill_effective_c:.1f} °C effective wind chill): "
            "Driving sleet and salt spray rapidly penetrate damp insulation."
        )

    # Populate technical recommendations
    if routing_strategy == "abort-williwaw-bivy-and-wallow-lockout":
        recommendations.append(
            "ABORT HEADLAND TRANSIT IMMEDIATELY: Deploy the 4-person silicone-nylon storm bothy bag in the lee "
            "of consolidated bedrock or large tussock pedestals until hurricane-force williwaw gusts subside."
        )
        recommendations.append(
            "Do not enter coastal seal-wallow peat aprons; retreat upslope to drained mineral-scree benches "
            "using horizontal sounding poles for 3-point stability."
        )
    elif routing_strategy == "leeward-terrace-contour-fauna-detour":
        recommendations.append(
            f"Abandon the low coastal tussock maze and contour along the leeward mineral-scree terrace above the "
            f"bog line (plan for a {fauna_encounter_detour_multiplier:.2f}x fauna detour distance multiplier)."
        )
        recommendations.append(
            "Keep dual 100 mm basket sounding poles extended forward at waist height to probe concealed wallow "
            "trenches and maintain visual separation from territorial fur seal bulls."
        )
    elif routing_strategy == "inter-pedestal-sounding-pole-channel-weave":
        recommendations.append(
            "Weave along firm gravel-floored inter-pedestal channels rather than leaping across unstable "
            "overhanging tussock crowns; probe every dark mud pool before stepping."
        )
        recommendations.append(
            "Maintain vocal contact with partners in tall tussock and take mirror-compass azimuth bearings "
            "at every elevated headland knoll."
        )
    else:
        recommendations.append(
            "Standard subantarctic feldmark ridge transit: follow wind-scoured basaltic gravel leads and "
            "step around fragile Azorella selago cushions and seabird burrow roofs."
        )

    recommendations.append(
        "Complete full Virkon S boot-bath scrubbing and Velcro/gaiter seed inspection before embarking or "
        "moving between subantarctic island landing sites."
    )

    return _AttrDict(
        {
            "pedestal_height_m": round(pedestal_height_m, 2),
            "katabatic_wind_kmh": round(katabatic_wind_kmh, 1),
            "wallow_trench_depth_cm": round(wallow_trench_depth_cm, 1),
            "ambient_temp_c": round(ambient_temp_c, 1),
            "seal_density_per_ha": round(seal_density_per_ha, 1),
            "katabatic_knockdown_index": katabatic_knockdown_index,
            "inter_pedestal_pit_entrapment_pct": inter_pedestal_pit_entrapment_pct,
            "wind_chill_effective_c": wind_chill_effective_c,
            "fauna_encounter_detour_multiplier": fauna_encounter_detour_multiplier,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "routing_strategy": routing_strategy,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


# ---------------------------------------------------------------------------
# Intent Detection & Parameter Extraction
# ---------------------------------------------------------------------------

_TUSSOCK_HEADLAND_KEYWORDS: tuple[str, ...] = (
    "tussock headland",
    "tussock headlands",
    "tussock-headland",
    "tussock-grass",
    "tussock grass",
    "tussock pedestal",
    "tussock pedestals",
    "tussock maze",
    "tussock labyrinth",
    "poa flabellata",
    "poa foliosa",
    "chionochloa antarctica",
    "subantarctic",
    "sub-antarctic",
    "katabatic headland",
    "katabatic escarpment",
    "katabatic knockdown",
    "seal wallow",
    "seal wallows",
    "seal-wallow",
    "wallow trench",
    "wallow trenches",
    "fortuna bay",
    "shackleton gap",
    "stromness",
    "south georgia",
    "macquarie island",
    "featherbed",
    "enderby island",
    "auckland islands",
    "kerguelen",
    "peninsule courbet",
    "péninsule courbet",
    "azorella",
    "williwaw",
    "williwaws",
    "megaherb",
    "megaherbs",
    "poa-flabellata-pedestal-maze",
    "seal-wallow-bog-trench-apron",
    "chionochloa-megaherb-peat-terrace",
    "azorella-feldmark-katabatic-ridge",
)

_TUSSOCK_HEADLAND_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return policy",
    "return label",
    "shipping",
    "tracking number",
    "invoice",
    "cancel my order",
    # Boreal peatland bog-shoeing exclusions (bog_shoeing.py)
    "bog shoeing",
    "bog-shoeing",
    "bog shoe",
    "great dismal",
    "boundary waters",
    "black spruce muskeg",
    "kenai peninsula",
    "adirondack",
    "algonquin",
    "tussock fen",
    "floating tussock",
    # Andean paramo exclusions (paramo_navigation.py)
    "paramo",
    "páramo",
    "superparamo",
    "superpáramo",
    "frailejon",
    "frailejón",
    "espeletia",
    "sumapaz",
    "el angel",
    "el ángel",
    "chirripo",
    "chirripó",
    "panteneras",
    # Subalpine krummholz exclusions (krummholz_bushwhack.py)
    "krummholz",
    "latschenkiefer",
    "pinus mugo",
    "hai-matsu",
    "slide alder",
    "presidential range",
    "abies balsamea",
    # Coastal cobble spit exclusions (cobble_spit_trekking.py)
    "dungeness spit",
    "chesil beach",
    "nelson boulder bank",
    "farewell spit",
    "mucilage slip",
    # North American apex wildlife exclusions (wildlife.py)
    "grizzly bear",
    "black bear",
    "cougar",
    "rattlesnake",
    "bear spray",
    "yellowstone",
    # Arctic polygon-tundra & thermokarst exclusions (thermokarst_tundra.py)
    "thermokarst",
    "ice-wedge",
    "ice wedge",
    "polygon tundra",
    "polygon-tundra",
    "thaw-slump",
    "thaw slump",
    "retrogressive thaw",
    "batagaika",
    "tuktoyaktuk",
    "pingo",
    "yedoma",
    "eriophorum",
    "cottongrass",
    "alas depression",
    "drunken forest",
    "noatak",
    "bykovsky",
    "brooks range",
    "aapa",
    "aapasuo",
    "palsa",
    "string bog",
    "string-bog",
    "string fen",
    "string-fen",
    "flark",
    "rimpi",
    "sträng",
    "strang",
    "lagg moat",
    "lagg-moat",
    "viiankiaapa",
    "sodankyla",
    "sodankylä",
    "tavvavuoma",
    "kummavuopio",
    "hudson bay lowlands",
    "sutton ridges",
    "pasvik",
    "iettiselga",
    "injarvi",
)


def is_tussock_headland_query(query: str) -> bool:
    """Return True if the user query is asking about subantarctic tussock-grass peat bog or katabatic headland navigation."""
    if not query or not query.strip():
        return False
    q_lower = query.lower()

    if any(excl in q_lower for excl in _TUSSOCK_HEADLAND_EXCLUSIONS):
        return False

    if any(kw in q_lower for kw in _TUSSOCK_HEADLAND_KEYWORDS):
        return True

    # Broad "tussock" match when paired with subantarctic/coastal/katabatic/bog/pedestal/seal context
    if "tussock" in q_lower and any(
        ctx in q_lower
        for ctx in (
            "pedestal",
            "katabatic",
            "headland",
            "wallow",
            "seal",
            "penguin",
            "peat",
            "bog",
            "island",
            "gale",
            "squall",
        )
    ):
        return True

    return False


def detect_tussock_headland_intent(query: str) -> bool:
    """Alias for is_tussock_headland_query()."""
    return is_tussock_headland_query(query)


def extract_tussock_headland_params(query: str) -> dict[str, Any]:
    """Extract tussock headland site ID and numerical calculator parameters from a natural-language query."""
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = None

    if (
        "fortuna" in q_lower
        or "shackleton" in q_lower
        or "stromness" in q_lower
        or "south georgia" in q_lower
        or "poa flabellata" in q_lower
    ):
        matched_site = get_site_by_id("fortuna-bay-stromness-south-georgia")
    elif (
        "macquarie" in q_lower
        or "featherbed" in q_lower
        or "australia" in q_lower
        or "poa foliosa" in q_lower
    ):
        matched_site = get_site_by_id("macquarie-island-featherbed-australia")
    elif (
        "enderby" in q_lower
        or "auckland island" in q_lower
        or "adams island" in q_lower
        or "chionochloa" in q_lower
        or "megaherb" in q_lower
        or "new zealand" in q_lower
    ):
        matched_site = get_site_by_id("enderby-island-megaherb-auckland-nz")
    elif (
        "kerguelen" in q_lower
        or "courbet" in q_lower
        or "baie de l'oiseau" in q_lower
        or "azorella" in q_lower
        or "france" in q_lower
    ):
        matched_site = get_site_by_id("kerguelen-courbet-azorella-france")

    pedestal_m = float(matched_site["default_pedestal_height_m"]) if matched_site else 1.4
    wind_kmh = float(matched_site["default_katabatic_wind_kmh"]) if matched_site else 65.0
    trench_cm = float(matched_site["default_wallow_trench_depth_cm"]) if matched_site else 55.0
    temp_c = float(matched_site["default_ambient_temp_c"]) if matched_site else 3.0
    seal_ha = float(matched_site["default_seal_density_per_ha"]) if matched_site else 18.0

    has_explicit_numbers = False

    pedestal_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:pedestal|pedestals|tussock|crown)?",
        q_lower,
    )
    if pedestal_match:
        val = float(pedestal_match.group(1))
        if 0.2 <= val <= 3.0:
            pedestal_m = val
            has_explicit_numbers = True

    wind_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:km/h|kmh|kph)\b",
        q_lower,
    )
    if wind_match:
        val = float(wind_match.group(1))
        if 0.0 <= val <= 160.0:
            wind_kmh = val
            has_explicit_numbers = True

    trench_match = re.search(
        r"(\d+(?:\.\d+)?)\s*cm\s*(?:wallow|trench|pit|mud|depth)?",
        q_lower,
    )
    if trench_match:
        val = float(trench_match.group(1))
        if 0.0 <= val <= 180.0:
            trench_cm = val
            has_explicit_numbers = True

    temp_match = re.search(
        r"(-?\d+(?:\.\d+)?)\s*(?:°c|deg\s*c|degrees?\s*c|c)\s*(?:ambient|temp|temperature|air)?\b",
        q_lower,
    )
    if temp_match:
        val = float(temp_match.group(1))
        if -15.0 <= val <= 18.0:
            temp_c = val
            has_explicit_numbers = True

    seal_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:seals?/ha|seals?\s*per\s*ha|seals?\s*per\s*hectare)\b",
        q_lower,
    )
    if seal_match:
        val = float(seal_match.group(1))
        if 0.0 <= val <= 120.0:
            seal_ha = val
            has_explicit_numbers = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "matched_site": matched_site,
        "pedestal_height_m": pedestal_m,
        "katabatic_wind_kmh": wind_kmh,
        "wallow_trench_depth_cm": trench_cm,
        "ambient_temp_c": temp_c,
        "seal_density_per_ha": seal_ha,
        "has_explicit_numbers": has_explicit_numbers,
    }


def format_tussock_headland_response(query: str) -> dict[str, Any]:
    """Build a structured response dictionary for a subantarctic tussock headland query."""
    params: dict[str, Any] = extract_tussock_headland_params(query)
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = params["matched_site"]

    calc_result: dict[str, Any] = calculate_tussock_headland(
        pedestal_height_m=float(params["pedestal_height_m"]),
        katabatic_wind_kmh=float(params["katabatic_wind_kmh"]),
        wallow_trench_depth_cm=float(params["wallow_trench_depth_cm"]),
        ambient_temp_c=float(params["ambient_temp_c"]),
        seal_density_per_ha=float(params["seal_density_per_ha"]),
    )

    is_calc_request = bool(
        params["has_explicit_numbers"]
        or any(
            w in q_lower
            for w in (
                "calculate",
                "calculator",
                "knockdown",
                "entrapment",
                "detour multiplier",
                "wind chill",
            )
        )
    )

    if is_calc_request:
        action = "tussock_headland_calculated"
    elif matched_site is not None:
        action = "tussock_headland_lookup"
    else:
        action = "tussock_headland_info"

    site_summary = (
        f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']} — "
        f"morphology: `{matched_site['morphology']}`, difficulty: `{matched_site['difficulty']}`): "
        f"{matched_site['navigation_protocol']} "
        if matched_site
        else "Subantarctic tussock-grass peat bogs and katabatic headlands require careful evaluation "
        "of Poa flabellata / Chionochloa pedestal height, concealed seal-wallow mud trenches, "
        "katabatic williwaw wind gusts, and territorial pinniped density. "
    )

    answer = (
        f"{site_summary}"
        f"For **{calc_result['pedestal_height_m']} m tussock pedestals** under "
        f"**{calc_result['katabatic_wind_kmh']} km/h katabatic wind** "
        f"({calc_result['wallow_trench_depth_cm']} cm wallow trench depth, "
        f"{calc_result['ambient_temp_c']} °C ambient temp, {calc_result['seal_density_per_ha']} seals/ha), "
        f"the katabatic knockdown index is **{calc_result['katabatic_knockdown_index']}**, "
        f"inter-pedestal pit entrapment risk is **{calc_result['inter_pedestal_pit_entrapment_pct']}%**, "
        f"effective wind chill is **{calc_result['wind_chill_effective_c']} °C**, "
        f"fauna encounter detour multiplier is **{calc_result['fauna_encounter_detour_multiplier']}x**, and risk level is "
        f"**{calc_result['risk_level'].upper()}** (routing strategy: `{calc_result['routing_strategy']}`)."
    )

    return _AttrDict(
        {
            "action": action,
            "answer": answer,
            "matched_site": matched_site,
            "calculation": calc_result,
            "sites": TUSSOCK_HEADLAND_SITES,
            "checklist": TUSSOCK_HEADLAND_GEAR_CHECKLIST,
        }
    )


def build_tussock_headland_prompt(query: str = "") -> str:
    """Build system prompt context for LLM calls involving subantarctic tussock & katabatic headland navigation."""
    info: dict[str, Any] = (
        format_tussock_headland_response(query)
        if query
        else format_tussock_headland_response("subantarctic tussock headland")
    )
    calc: dict[str, Any] = info["calculation"]
    matched_site: dict[str, Any] | None = info.get("matched_site")

    lines: list[str] = [
        "### Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation Context",
        "- **Subantarctic Morphologies**: Poa flabellata pedestal mazes (e.g., Fortuna Bay & Shackleton Gap, South Georgia), "
        "quaking seal-wallow peat-trench aprons (e.g., Macquarie Island Featherbed, Australia), Chionochloa & megaherb blanket-peat "
        "terraces (e.g., Enderby & Adams Island, Auckland Islands, NZ), and Azorella selago feldmark katabatic ridges "
        "(e.g., Péninsule Courbet, Kerguelen, France).",
        f"- **Calculated Tussock Headland Physics**: PedestalHeight={calc['pedestal_height_m']}m, "
        f"KatabaticWind={calc['katabatic_wind_kmh']}km/h, WallowTrenchDepth={calc['wallow_trench_depth_cm']}cm, "
        f"AmbientTemp={calc['ambient_temp_c']}°C, SealDensity={calc['seal_density_per_ha']}/ha -> "
        f"KatabaticKnockdownIndex={calc['katabatic_knockdown_index']}, PitEntrapmentRisk={calc['inter_pedestal_pit_entrapment_pct']}%, "
        f"EffectiveWindChill={calc['wind_chill_effective_c']}°C, FaunaDetourMultiplier={calc['fauna_encounter_detour_multiplier']}x, "
        f"Risk={calc['risk_level']}, RoutingStrategy={calc['routing_strategy']}.",
    ]
    if matched_site:
        lines.append(
            f"- **Focused Subantarctic Site**: {matched_site['name']} ({matched_site['country']}) — "
            f"Primary Hazard: {matched_site['primary_hazard']} | Navigation Protocol: {matched_site['navigation_protocol']}"
        )
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response dictionary for a subantarctic tussock headland query."""
    info: dict[str, Any] = format_tussock_headland_response(query)
    return {
        "answer": info["answer"],
        "tussock_headland_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[str, None, None]:
    """Yield SSE stream chunks for a subantarctic tussock headland query."""
    info: dict[str, Any] = format_tussock_headland_response(query)
    yield f"data: {json.dumps({'action': info['action'], 'tussock_headland_info': info})}\n\n"
    yield f"data: {json.dumps({'content': info['answer'], 'answer': info['answer']})}\n\n"
    yield "data: [DONE]\n\n"
