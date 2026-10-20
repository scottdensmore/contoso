"""Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing Guide module.

Provides domain data, physics-based hydrodynamic momentum & overturning modeling,
thixotropic glacial-flour quicksand liquefaction indexing, diurnal ablation discharge
scaling, subaqueous bedload boulder-roll hazard estimation, mandatory safety gear checklists,
and intent detection for glacial outwash plains (sandur) and braided river crossings.
"""

from __future__ import annotations

import json
import math
import re
from collections.abc import Generator
from typing import Any, Literal

SandurMorphology = Literal[
    "jokulhlaup-basalt-sandur",
    "anastomosing-glacial-silt-braid",
    "proglacial-boulder-outwash-fan",
    "tidal-estuarine-glacial-delta",
]
SandurDifficulty = Literal["moderate", "challenging", "extreme"]
SandurRiskLevel = Literal["low", "moderate", "high", "critical"]
SandurCrossingTechnique = Literal[
    "solo-diagonal-pole-riffle-stride",
    "tripod-pole-eddy-line-ferry",
    "mutual-support-linked-wedge-formation",
    "abort-bivouac-until-dawn-minimum",
]


class _AttrDict(dict[str, Any]):
    """Dictionary subclass supporting attribute-style read access."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc


# ---------------------------------------------------------------------------
# Reference Glacial Outwash Braided-River Sandur Sites Catalog (4 Sites)
# ---------------------------------------------------------------------------

SANDUR_CROSSING_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "skeidararsandur-krossa-iceland",
            "name": "Skeiðarársandur & Þórsmörk Krossá Braided Outwash Plain",
            "country": "Iceland",
            "region": "Southern Highlands / Vatnajökull & Mýrdalsjökull Outwash, Iceland",
            "elevation": "15 – 260 m",
            "elevation_m": 140,
            "morphology": "jokulhlaup-basalt-sandur",
            "difficulty": "extreme",
            "default_water_depth_m": 0.75,
            "default_flow_velocity_ms": 2.1,
            "default_hour_of_day_24": 15,
            "default_silt_flour_concentration_mg_l": 2400.0,
            "default_hiker_mass_kg": 75.0,
            "quicksand_protocol": (
                "Sound exposed dark basalt silt-bar margins with a heavy wading staff before stepping; "
                "avoid thixotropic glacial-flour pockets in recently drained afternoon distributaries."
            ),
            "primary_hazard": (
                "Violent diurnal meltwater surges, shifting subaqueous basalt cobble bars, and "
                "thixotropic glacial-flour quicksand pockets."
            ),
            "navigation_protocol": (
                "Cross at dawn (04:00–07:00) where widest multi-thread riffles split the main thalweg "
                "above oblique gravel riffle crests; use tripod or linked-arm eddy-line ferrying."
            ),
            "traversal_protocol": (
                "Cross at dawn (04:00–07:00) where widest multi-thread riffles split the main thalweg "
                "above oblique gravel riffle crests; use tripod or linked-arm eddy-line ferrying."
            ),
            "field_notes": (
                "Fed by Vatnajökull and Mýrdalsjökull subglacial outlets, the Krossá and Skeiðará "
                "channels migrate meters per hour during peak afternoon ablation and jökulhlaup pulses."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "slim-river-kaskawulsh-canada",
            "name": "Kaskawulsh & Slims River Glacial Silt Outwash",
            "country": "Canada",
            "region": "Kluane National Park & Reserve, Yukon Territory",
            "elevation": "780 – 1,050 m",
            "elevation_m": 915,
            "morphology": "anastomosing-glacial-silt-braid",
            "difficulty": "challenging",
            "default_water_depth_m": 0.55,
            "default_flow_velocity_ms": 1.6,
            "default_hour_of_day_24": 13,
            "default_silt_flour_concentration_mg_l": 2850.0,
            "default_hiker_mass_kg": 75.0,
            "quicksand_protocol": (
                "Never halt stationary on saturated pale-grey glaciolacustrine rock-flour bars; "
                "keep weight moving across armored pebble stringers."
            ),
            "primary_hazard": (
                "Deep thixotropic rock-flour quicksand bars, opaque milky meltwater concealing "
                "steep cut-bank drop-offs, and katabatic dust storms."
            ),
            "navigation_protocol": (
                "Scout elevated moraine bluffs to trace continuous gravel bar diagonals across the "
                "2 km wide valley floor; cross before 08:00 prior to St. Elias solar melt pulse."
            ),
            "traversal_protocol": (
                "Scout elevated moraine bluffs to trace continuous gravel bar diagonals across the "
                "2 km wide valley floor; cross before 08:00 prior to St. Elias solar melt pulse."
            ),
            "field_notes": (
                "Following the 2016 Kaskawulsh Glacier river piracy event, the Slims (Ä'äy Chù) valley "
                "alternates between wind-scoured silt flats and treacherous anastomosing meltwater braids."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "rakaia-gorge-braids-nz",
            "name": "Rakaia & Hopkins Braided Greywacke Shingle Outwash",
            "country": "New Zealand",
            "region": "Canterbury Plains & Southern Alps, South Island",
            "elevation": "320 – 850 m",
            "elevation_m": 585,
            "morphology": "proglacial-boulder-outwash-fan",
            "difficulty": "challenging",
            "default_water_depth_m": 0.60,
            "default_flow_velocity_ms": 1.8,
            "default_hour_of_day_24": 11,
            "default_silt_flour_concentration_mg_l": 1100.0,
            "default_hiker_mass_kg": 75.0,
            "quicksand_protocol": (
                "Test loose greywacke shingle and fine glacial silt aprons at bar tails before "
                "committing pack load; listen for subaqueous bedload cobble rolling."
            ),
            "primary_hazard": (
                "High-velocity Nor'west rain-on-snow floods, rolling subaqueous greywacke boulders "
                "causing ankle entrapment, and braided channel entanglement."
            ),
            "navigation_protocol": (
                "Use the New Zealand mutual-support linked-pack-strap line or caterpillar formation "
                "angled 30° downstream along diagonal shingle riffles between bar apexes."
            ),
            "traversal_protocol": (
                "Use the New Zealand mutual-support linked-pack-strap line or caterpillar formation "
                "angled 30° downstream along diagonal shingle riffles between bar apexes."
            ),
            "field_notes": (
                "Classic Southern Alps braided rivers carry massive greywacke bedload across "
                "multi-kilometer shingle fans where channel geometry reorganizes with every Nor'wester storm."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "copper-river-sheridan-alaska-usa",
            "name": "Sheridan & Scott Glacier Outwash Sandur Delta",
            "country": "United States",
            "region": "Chugach National Forest & Copper River Delta, Alaska",
            "elevation": "5 – 120 m",
            "elevation_m": 60,
            "morphology": "tidal-estuarine-glacial-delta",
            "difficulty": "moderate",
            "default_water_depth_m": 0.42,
            "default_flow_velocity_ms": 1.1,
            "default_hour_of_day_24": 8,
            "default_silt_flour_concentration_mg_l": 950.0,
            "default_hiker_mass_kg": 75.0,
            "quicksand_protocol": (
                "Probe fine estuarine-glacial silt flats continuously; if a boot sinks past the ankle "
                "in liquefied glacial flour, drop to knees/pack to spread ground pressure and roll free."
            ),
            "primary_hazard": (
                "Liquefied glacial-flour silt bars compounded by tidal backwater ponding and "
                "near-freezing 1–3 °C outwash channels."
            ),
            "navigation_protocol": (
                "Time crossings with low-tide morning glacial minimum; thread coarse gravel outwash "
                "ribs upstream of estuarine silt-bar deposition zones."
            ),
            "traversal_protocol": (
                "Time crossings with low-tide morning glacial minimum; thread coarse gravel outwash "
                "ribs upstream of estuarine silt-bar deposition zones."
            ),
            "field_notes": (
                "Chugach piedmont glaciers discharge milky sediment plumes across wide outwash fans "
                "where coarse gravel braids grade rapidly into thixotropic coastal silt bars."
            ),
        }
    ),
]

SANDUR_SITES: list[dict[str, Any]] = SANDUR_CROSSING_SITES


# ---------------------------------------------------------------------------
# Mandatory 6-Item Sandur & Braided-River Crossing Gear Checklist
# ---------------------------------------------------------------------------

SANDUR_CROSSING_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "Reinforced 140 cm Carbon/Aluminum Wading Staff with Tungsten Carbide Tip & No Snow Basket",
        "category": "stability_sounding",
        "priority": "essential",
        "rationale": (
            "Provides a third point of contact against high-velocity current drag, sounds opaque "
            "glacial-milk thalweg depth, and probes silt bars for thixotropic quicksand liquefaction."
        ),
    },
    {
        "item": "Closed-Toe Lugged Neoprene Wading Boots & Gravel-Guard Gaiters",
        "category": "footwear_protection",
        "priority": "essential",
        "rationale": (
            "Protects toes from rolling subaqueous basalt/greywacke bedload boulders, prevents "
            "1–3 °C cold-shock foot numbness, and keeps abrasive glacial rock flour out of footwear."
        ),
    },
    {
        "item": "Submersible Roll-Top TPU Pack Liner (IPX7) & Quick-Release Hip-Belt Buckle",
        "category": "pack_flotation_jettison",
        "priority": "essential",
        "rationale": (
            "Turns the backpack into a positive-buoyancy flotation aid while allowing immediate "
            "one-handed load jettison if swept off feet in a deep braided thalweg."
        ),
    },
    {
        "item": "20 m Floating Polypropylene Rescue Throw-Bag Line (8 mm)",
        "category": "partner_rescue",
        "priority": "essential",
        "rationale": (
            "Enables pendulum bank-belay recovery of a lead wader or extraction of a teammate "
            "immobilized in a mid-channel thixotropic silt-bar pocket."
        ),
    },
    {
        "item": "Quick-Dry Merino/Polypropylene Thermal Leggings & Windproof Shell Pants",
        "category": "hypothermia_prevention",
        "priority": "essential",
        "rationale": (
            "Prevents conductive vasospasm during repeated 15–30 braid crossings in 1 °C glacial "
            "meltwater and blocks katabatic sandur winds immediately after exiting the river."
        ),
    },
    {
        "item": "Polarized Amber/Copper High-Contrast Glacier & River-Reading Glasses",
        "category": "optical_route_reading",
        "priority": "essential",
        "rationale": (
            "Cuts surface glare on milky braided threads to reveal V-wave riffle crests, submerged "
            "boulder eddies, and wet sheen differences marking unstable quicksand silt bars."
        ),
    },
]

SANDUR_GEAR_CHECKLIST: list[dict[str, Any]] = SANDUR_CROSSING_GEAR_CHECKLIST


# ---------------------------------------------------------------------------
# Catalog Accessors & Filtering
# ---------------------------------------------------------------------------


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 reference sandur crossing sites."""
    return list(SANDUR_CROSSING_SITES)


def get_all_sandur_crossing_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Return a single sandur crossing site by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in SANDUR_CROSSING_SITES:
        if str(site["id"]).lower() == target:
            return site
    return None


def get_sandur_crossing_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """Filter sandur crossing sites by country, morphology, difficulty, or free-text search."""
    results: list[dict[str, Any]] = list(SANDUR_CROSSING_SITES)

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
    """Return the 6-item mandatory sandur & braided-river crossing gear checklist."""
    return list(SANDUR_CROSSING_GEAR_CHECKLIST)


# ---------------------------------------------------------------------------
# Physics-Based Glacial Outwash Sandur & Quicksand Silt-Bar Crossing Calculator
# ---------------------------------------------------------------------------


def calculate_sandur_crossing(
    water_depth_m: float = 0.45,
    flow_velocity_ms: float = 1.2,
    hour_of_day_24: int = 7,
    silt_flour_concentration_mg_l: float = 800.0,
    hiker_mass_kg: float = 75.0,
) -> dict[str, Any]:
    """Calculate hydrodynamic momentum product, quicksand liquefaction index, diurnal multiplier, and bedload risk.

    Parameters
    ----------
    water_depth_m:
        Thalweg water depth of the active braided channel in meters [0.1, 2.0].
    flow_velocity_ms:
        Mean channel flow velocity in meters per second [0.1, 5.0].
    hour_of_day_24:
        Local solar hour of day (24-hour clock) governing diurnal glacial ablation pulse [0, 23].
    silt_flour_concentration_mg_l:
        Suspended glacial rock-flour and fine silt concentration in mg/L [50, 5000].
    hiker_mass_kg:
        Total hiker + pack mass in kg [40, 150].
    """
    if not (0.1 <= water_depth_m <= 2.0):
        raise ValueError("water_depth_m must be between 0.1 and 2.0 meters")
    if not (0.1 <= flow_velocity_ms <= 5.0):
        raise ValueError("flow_velocity_ms must be between 0.1 and 5.0 m/s")
    if not (0 <= hour_of_day_24 <= 23):
        raise ValueError("hour_of_day_24 must be between 0 and 23")
    if not (50.0 <= silt_flour_concentration_mg_l <= 5000.0):
        raise ValueError("silt_flour_concentration_mg_l must be between 50 and 5000 mg/L")
    if not (40.0 <= hiker_mass_kg <= 150.0):
        raise ValueError("hiker_mass_kg must be between 40 and 150 kg")

    # 1. Diurnal glacial meltwater discharge multiplier (peaks around 15:00-16:00, lowest 04:00-07:00)
    phase = ((float(hour_of_day_24) - 15.5) / 24.0) * 2.0 * math.pi
    diurnal_discharge_multiplier = round(1.24 + 0.34 * math.cos(phase), 2)

    # 2. Hydrodynamic momentum & overturning product (m²/s effective instability index)
    mass_factor = (75.0 / hiker_mass_kg) ** 0.35
    diurnal_boost = 0.85 + 0.25 * diurnal_discharge_multiplier
    hydrodynamic_momentum_product = round(
        water_depth_m * (flow_velocity_ms**1.15) * mass_factor * diurnal_boost,
        2,
    )

    # 3. Thixotropic glacial-flour quicksand liquefaction index (0 to 100)
    raw_quicksand = (
        (silt_flour_concentration_mg_l / 65.0)
        + ((hiker_mass_kg - 40.0) * 0.14)
        + ((diurnal_discharge_multiplier - 0.9) * 18.0)
        + (water_depth_m * 4.5)
    )
    quicksand_liquefaction_index = round(min(100.0, max(2.0, raw_quicksand)), 1)

    # 4. Subaqueous bedload boulder-roll & ankle-entrapment risk percentage (0 to 100%)
    raw_bedload = (
        ((flow_velocity_ms**1.35) * 14.5)
        + (water_depth_m * 18.0)
        + ((diurnal_discharge_multiplier - 0.9) * 15.0)
    )
    bedload_boulder_roll_risk_pct = round(min(99.0, max(1.0, raw_bedload)), 1)

    # 5. Determine Risk Level & Crossing Technique
    warnings: list[str] = []
    recommendations: list[str] = []

    if (
        hydrodynamic_momentum_product >= 2.1
        or water_depth_m >= 1.0
        or flow_velocity_ms >= 2.4
        or quicksand_liquefaction_index >= 72.0
        or bedload_boulder_roll_risk_pct >= 72.0
    ):
        risk_level: SandurRiskLevel = "critical"
        crossing_technique: SandurCrossingTechnique = "abort-bivouac-until-dawn-minimum"
    elif (
        hydrodynamic_momentum_product >= 1.1
        or water_depth_m >= 0.65
        or flow_velocity_ms >= 1.65
        or quicksand_liquefaction_index >= 45.0
        or bedload_boulder_roll_risk_pct >= 48.0
    ):
        risk_level = "high"
        crossing_technique = "mutual-support-linked-wedge-formation"
    elif (
        hydrodynamic_momentum_product >= 0.45
        or water_depth_m >= 0.42
        or flow_velocity_ms >= 1.1
        or quicksand_liquefaction_index >= 24.0
        or bedload_boulder_roll_risk_pct >= 26.0
    ):
        risk_level = "moderate"
        crossing_technique = "tripod-pole-eddy-line-ferry"
    else:
        risk_level = "low"
        crossing_technique = "solo-diagonal-pole-riffle-stride"

    # Populate actionable warnings
    if hydrodynamic_momentum_product >= 1.1 or water_depth_m >= 0.65:
        warnings.append(
            f"SEVERE HYDRODYNAMIC OVERTURNING FORCE (Product {hydrodynamic_momentum_product:.2f}): "
            f"Channel depth ({water_depth_m:.2f} m) and velocity ({flow_velocity_ms:.2f} m/s) exceed "
            f"safe unassisted solo wading limits for a {hiker_mass_kg:.0f} kg traveler."
        )
    if quicksand_liquefaction_index >= 45.0 or silt_flour_concentration_mg_l >= 1800.0:
        warnings.append(
            f"THIXOTROPIC QUICKSAND SILT-BAR HAZARD (Index {quicksand_liquefaction_index:.1f}/100): "
            f"High glacial rock-flour load ({silt_flour_concentration_mg_l:.0f} mg/L) creates unstable, "
            "fluid-saturated silt bars that liquefy under cyclic foot vibration."
        )
    if diurnal_discharge_multiplier >= 1.30 or 12 <= hour_of_day_24 <= 19:
        warnings.append(
            f"DIURNAL GLACIAL MELT SURGE ({diurnal_discharge_multiplier:.2f}x at {hour_of_day_24:02d}:00): "
            "Afternoon solar ablation pulse is actively inflating braided distributaries and destabilizing gravel bars."
        )
    if bedload_boulder_roll_risk_pct >= 50.0:
        warnings.append(
            f"SUBAQUEOUS BEDLOAD COBBLE/BOULDER ROLL RISK ({bedload_boulder_roll_risk_pct:.1f}%): "
            "Opaque glacial milk conceals rolling basalt/greywacke cobbles capable of pinning feet or fracturing ankles."
        )

    # Populate technical recommendations
    if crossing_technique == "abort-bivouac-until-dawn-minimum":
        recommendations.append(
            "DO NOT ENTER THE ACTIVE THALWEG: Pitch camp on an elevated moraine bench or vegetated terrace "
            "and wait until the 04:00–07:00 diurnal freeze minimum when discharge drops by 35–50%."
        )
        recommendations.append(
            "Never attempt a fixed rope taut-line tensioned across a high-velocity braided channel; "
            "if forced to retreat from a mid-stream gravel bar, ferry diagonally downstream toward the nearest shallow riffle fan."
        )
    elif crossing_technique == "mutual-support-linked-wedge-formation":
        recommendations.append(
            "Use a multi-person mutual-support wedge or caterpillar formation (strongest, heaviest wader upstream "
            "breaking the current wave) while angling 30–45° diagonally downstream across wide riffle crests."
        )
        recommendations.append(
            "Sound every silt-bar edge with a basketless wading staff before stepping out of the channel; "
            "keep moving continuously across wet rock-flour flats to prevent thixotropic liquefaction."
        )
    elif crossing_technique == "tripod-pole-eddy-line-ferry":
        recommendations.append(
            "Maintain three points of contact using a locked 140 cm wading staff planted upstream, "
            "shuffling sideways-diagonally along the widest gravel riffle divide between bar apexes."
        )
        recommendations.append(
            "Unbuckle pack hip-belt and sternum strap prior to entering each braid thread, and wear "
            "closed-toe lugged wading footwear to guard against shifting bedload cobbles."
        )
    else:
        recommendations.append(
            "Standard dawn sandur ford: cross where the channel splits into multiple shallow braided threads "
            "and follow coarse pebble stringers rather than fine pale-grey silt aprons."
        )

    recommendations.append(
        "If a foot sinks into liquefied glacial-flour quicksand, immediately lean onto your wading staff "
        "or drop horizontally onto your backpack to distribute ground pressure, then agitate slowly to break vacuum suction."
    )

    return _AttrDict(
        {
            "water_depth_m": round(water_depth_m, 2),
            "flow_velocity_ms": round(flow_velocity_ms, 2),
            "hour_of_day_24": int(hour_of_day_24),
            "silt_flour_concentration_mg_l": round(silt_flour_concentration_mg_l, 1),
            "hiker_mass_kg": round(hiker_mass_kg, 1),
            "hydrodynamic_momentum_product": hydrodynamic_momentum_product,
            "quicksand_liquefaction_index": quicksand_liquefaction_index,
            "diurnal_discharge_multiplier": diurnal_discharge_multiplier,
            "bedload_boulder_roll_risk_pct": bedload_boulder_roll_risk_pct,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "crossing_technique": crossing_technique,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


# ---------------------------------------------------------------------------
# Intent Detection & Parameter Extraction
# ---------------------------------------------------------------------------

_SANDUR_CROSSING_KEYWORDS: tuple[str, ...] = (
    "sandur",
    "sandar",
    "braided river",
    "braided-river",
    "braided rivers",
    "braided outwash",
    "glacial outwash",
    "outwash plain",
    "outwash fan",
    "silt-bar",
    "silt bar",
    "quicksand silt",
    "glacial flour quicksand",
    "rock-flour quicksand",
    "rock flour quicksand",
    "skeidararsandur",
    "skeiðarársandur",
    "krossa river",
    "krossá",
    "kaskawulsh",
    "slims river",
    "rakaia braids",
    "rakaia gorge braids",
    "jokulhlaup outwash",
    "jökulhlaup outwash",
    "sheridan glacier outwash",
    "jokulhlaup-basalt-sandur",
    "anastomosing-glacial-silt-braid",
    "proglacial-boulder-outwash-fan",
    "tidal-estuarine-glacial-delta",
)

_SANDUR_CROSSING_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return policy",
    "return label",
    "shipping",
    "tracking number",
    "invoice",
    "cancel my order",
    # Aufeis / winter overflow ice exclusions
    "aufeis",
    "naled",
    "overflow ice",
    "frost blister",
    "ulakhan-taryn",
    "cryolock",
    # Tidal coastal mudflat / Wattwandern exclusions
    "wattwandern",
    "wadden sea",
    "prielen",
    "prikken",
    "bay of fundy",
    "mont-saint-michel",
    "morecambe bay",
    # Crevasse / icefall glacier navigation exclusions
    "khumbu icefall",
    "ingraham glacier",
    "mer de glace",
    "crevasse rescue",
    "snow bridge depth",
    "bergschrund",
    # Slot canyon flash flood exclusions
    "buckskin gulch",
    "little wild horse",
    "wadi mujib",
    "escape ledge",
    "escape-ledge",
    # Whitewater kayaking / rafting exclusions
    "eskimo roll",
    "combat roll",
    "skykomish",
    "boulder drop",
    "oar frame",
    "oarlock",
    "groover",
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
    "alas depression",
    "drunken forest",
    "noatak",
    "bykovsky",
)


def is_sandur_crossing_query(query: str) -> bool:
    """Return True if the user query is asking about glacial outwash braided-river sandur or quicksand silt-bar crossings."""
    if not query or not query.strip():
        return False
    q_lower = query.lower()

    if any(excl in q_lower for excl in _SANDUR_CROSSING_EXCLUSIONS):
        return False

    return any(kw in q_lower for kw in _SANDUR_CROSSING_KEYWORDS)


def detect_sandur_crossing_intent(query: str) -> bool:
    """Alias for is_sandur_crossing_query()."""
    return is_sandur_crossing_query(query)


def extract_sandur_crossing_params(query: str) -> dict[str, Any]:
    """Extract sandur crossing site ID and numerical calculator parameters from a natural-language query."""
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = None

    if (
        "skeidararsandur" in q_lower
        or "skeiðarársandur" in q_lower
        or "krossa" in q_lower
        or "krossá" in q_lower
        or "thorsmork" in q_lower
        or "þórsmörk" in q_lower
        or "iceland" in q_lower
    ):
        matched_site = get_site_by_id("skeidararsandur-krossa-iceland")
    elif (
        "kaskawulsh" in q_lower
        or "slims river" in q_lower
        or "slim river" in q_lower
        or "kluane" in q_lower
        or "yukon" in q_lower
        or "canada" in q_lower
    ):
        matched_site = get_site_by_id("slim-river-kaskawulsh-canada")
    elif (
        "rakaia" in q_lower
        or "hopkins" in q_lower
        or "canterbury" in q_lower
        or "greywacke" in q_lower
        or "new zealand" in q_lower
    ):
        matched_site = get_site_by_id("rakaia-gorge-braids-nz")
    elif (
        "copper river" in q_lower
        or "sheridan" in q_lower
        or "scott glacier" in q_lower
        or "chugach" in q_lower
        or "alaska" in q_lower
    ):
        matched_site = get_site_by_id("copper-river-sheridan-alaska-usa")

    depth_m = (
        float(matched_site["default_water_depth_m"]) if matched_site else 0.45
    )
    velocity_ms = (
        float(matched_site["default_flow_velocity_ms"]) if matched_site else 1.2
    )
    hour_24 = (
        int(matched_site["default_hour_of_day_24"]) if matched_site else 7
    )
    silt_mg_l = (
        float(matched_site["default_silt_flour_concentration_mg_l"])
        if matched_site
        else 800.0
    )
    mass_kg = (
        float(matched_site["default_hiker_mass_kg"]) if matched_site else 75.0
    )

    has_explicit_numbers = False

    depth_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:water\s*depth|depth|deep|channel|thalweg)?",
        q_lower,
    )
    if depth_match:
        val = float(depth_match.group(1))
        if 0.1 <= val <= 2.0:
            depth_m = val
            has_explicit_numbers = True

    vel_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m/s|ms|meters\s*per\s*second)\b",
        q_lower,
    )
    if vel_match:
        val = float(vel_match.group(1))
        if 0.1 <= val <= 5.0:
            velocity_ms = val
            has_explicit_numbers = True

    hour_colon_match = re.search(r"\b([01]?\d|2[0-3]):00\b", q_lower)
    hour_word_match = re.search(
        r"\b(\d{1,2})\s*(?:h|hr|hour|hours)\s*(?:of\s*day)?\b", q_lower
    )
    if hour_colon_match:
        h_val = int(hour_colon_match.group(1))
        if 0 <= h_val <= 23:
            hour_24 = h_val
            has_explicit_numbers = True
    elif hour_word_match:
        h_val = int(hour_word_match.group(1))
        if 0 <= h_val <= 23:
            hour_24 = h_val
            has_explicit_numbers = True

    silt_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:mg/l|mg\s*per\s*l)\b",
        q_lower,
    )
    if silt_match:
        val = float(silt_match.group(1))
        if 50.0 <= val <= 5000.0:
            silt_mg_l = val
            has_explicit_numbers = True

    mass_match = re.search(
        r"(\d+(?:\.\d+)?)\s*kg\b",
        q_lower,
    )
    if mass_match:
        val = float(mass_match.group(1))
        if 40.0 <= val <= 150.0:
            mass_kg = val
            has_explicit_numbers = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "matched_site": matched_site,
        "water_depth_m": depth_m,
        "flow_velocity_ms": velocity_ms,
        "hour_of_day_24": hour_24,
        "silt_flour_concentration_mg_l": silt_mg_l,
        "hiker_mass_kg": mass_kg,
        "has_explicit_numbers": has_explicit_numbers,
    }


def format_sandur_crossing_response(query: str) -> dict[str, Any]:
    """Build a structured response dictionary for a sandur crossing query."""
    params: dict[str, Any] = extract_sandur_crossing_params(query)
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = params["matched_site"]

    calc_result: dict[str, Any] = calculate_sandur_crossing(
        water_depth_m=float(params["water_depth_m"]),
        flow_velocity_ms=float(params["flow_velocity_ms"]),
        hour_of_day_24=int(params["hour_of_day_24"]),
        silt_flour_concentration_mg_l=float(params["silt_flour_concentration_mg_l"]),
        hiker_mass_kg=float(params["hiker_mass_kg"]),
    )

    is_calc_request = bool(
        params["has_explicit_numbers"]
        or any(
            w in q_lower
            for w in (
                "calculate",
                "calculator",
                "momentum",
                "liquefaction",
                "diurnal",
                "multiplier",
                "bedload",
            )
        )
    )

    if is_calc_request:
        action = "sandur_crossing_calculated"
    elif matched_site is not None:
        action = "sandur_crossing_lookup"
    else:
        action = "sandur_crossing_info"

    site_summary = (
        f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']} — "
        f"morphology: `{matched_site['morphology']}`, difficulty: `{matched_site['difficulty']}`): "
        f"{matched_site['navigation_protocol']} "
        if matched_site
        else "Glacial outwash braided-river sandur plains and quicksand silt-bars require careful evaluation "
        "of diurnal ablation discharge, hydrodynamic momentum, and thixotropic rock-flour liquefaction. "
    )

    answer = (
        f"{site_summary}"
        f"For **{calc_result['water_depth_m']} m water depth** at "
        f"**{calc_result['flow_velocity_ms']} m/s flow velocity** "
        f"(hour `{calc_result['hour_of_day_24']:02d}:00`, {calc_result['silt_flour_concentration_mg_l']} mg/L glacial flour, "
        f"{calc_result['hiker_mass_kg']} kg hiker mass), "
        f"the hydrodynamic momentum product is **{calc_result['hydrodynamic_momentum_product']}**, "
        f"quicksand liquefaction index is **{calc_result['quicksand_liquefaction_index']}/100**, "
        f"diurnal discharge multiplier is **{calc_result['diurnal_discharge_multiplier']}x**, "
        f"bedload boulder-roll risk is **{calc_result['bedload_boulder_roll_risk_pct']}%**, and risk level is "
        f"**{calc_result['risk_level'].upper()}** (crossing technique: `{calc_result['crossing_technique']}`)."
    )

    return _AttrDict(
        {
            "action": action,
            "answer": answer,
            "matched_site": matched_site,
            "calculation": calc_result,
            "sites": SANDUR_CROSSING_SITES,
            "checklist": SANDUR_CROSSING_GEAR_CHECKLIST,
        }
    )


def build_sandur_crossing_prompt(query: str = "") -> str:
    """Build system prompt context for LLM calls involving glacial outwash braided-river sandur crossings."""
    info: dict[str, Any] = (
        format_sandur_crossing_response(query)
        if query
        else format_sandur_crossing_response("sandur crossing")
    )
    calc: dict[str, Any] = info["calculation"]
    matched_site: dict[str, Any] | None = info.get("matched_site")

    lines: list[str] = [
        "### Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing Context",
        "- **Sandur Morphologies**: Jökulhlaup basalt sandur plains (e.g., Skeiðarársandur & Krossá, Iceland), "
        "anastomosing glacial-silt braids (e.g., Kaskawulsh & Slims River, Yukon), proglacial greywacke boulder "
        "outwash fans (e.g., Rakaia & Hopkins braids, New Zealand), and tidal-estuarine glacial deltas "
        "(e.g., Sheridan & Scott Glacier Copper River delta, Alaska).",
        f"- **Calculated Sandur Crossing Physics**: Depth={calc['water_depth_m']}m, "
        f"Velocity={calc['flow_velocity_ms']}m/s, Hour={calc['hour_of_day_24']:02d}:00, "
        f"SiltFlour={calc['silt_flour_concentration_mg_l']}mg/L, Mass={calc['hiker_mass_kg']}kg -> "
        f"MomentumProduct={calc['hydrodynamic_momentum_product']}, QuicksandIndex={calc['quicksand_liquefaction_index']}, "
        f"DiurnalMultiplier={calc['diurnal_discharge_multiplier']}x, BedloadRollRisk={calc['bedload_boulder_roll_risk_pct']}%, "
        f"Risk={calc['risk_level']}, Technique={calc['crossing_technique']}.",
    ]
    if matched_site:
        lines.append(
            f"- **Focused Sandur Site**: {matched_site['name']} ({matched_site['country']}) — "
            f"Primary Hazard: {matched_site['primary_hazard']} | Navigation Protocol: {matched_site['navigation_protocol']}"
        )
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response dictionary for a sandur crossing query."""
    info: dict[str, Any] = format_sandur_crossing_response(query)
    return {
        "answer": info["answer"],
        "sandur_crossing_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[str, None, None]:
    """Yield SSE stream chunks for a sandur crossing query."""
    info: dict[str, Any] = format_sandur_crossing_response(query)
    yield f"data: {json.dumps({'action': info['action'], 'sandur_crossing_info': info})}\n\n"
    yield f"data: {json.dumps({'content': info['answer'], 'answer': info['answer']})}\n\n"
    yield "data: [DONE]\n\n"
