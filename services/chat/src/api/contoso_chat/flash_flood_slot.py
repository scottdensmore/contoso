"""High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Navigation Guide module.

Provides domain data, physics-based kinematic flood-wave lag modeling, peak discharge
hydrograph estimation, constriction wall-of-water vertical rise rates, escape-ledge
evacuation margins, mandatory safety gear checklists, and intent detection for
high-desert sandstone and limestone slot canyons.
"""

from __future__ import annotations

import json
import re
from collections.abc import Generator
from typing import Any, Literal

FlashFloodSlotLithology = Literal[
    "navajo-sandstone-narrows",
    "wingate-vertical-fissure",
    "kayenta-ledgy-gorge",
    "limestone-karst-wadi",
]
FlashFloodSlotDifficulty = Literal["moderate", "challenging", "extreme"]
FlashFloodSlotRiskLevel = Literal["low", "moderate", "high", "critical"]
FlashFloodSlotEscapeClass = Literal[
    "dry-wash-standard-transit",
    "monitor-high-bench-ledges",
    "immediate-climb-escape-ledge",
    "abort-imminent-flood-bore-entrapment",
]


class _AttrDict(dict[str, Any]):
    """Dictionary subclass supporting attribute-style read access."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc


# ---------------------------------------------------------------------------
# Reference High-Desert Slot-Canyon Flash-Flood Sites Catalog (4 Sites)
# ---------------------------------------------------------------------------

FLASH_FLOOD_SLOT_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "buckskin-gulch-paria-usa",
            "name": "Buckskin Gulch & Wire Pass Navajo Sandstone Constriction",
            "country": "United States",
            "region": "Paria Canyon-Vermilion Cliffs Wilderness, Southern Utah",
            "length_km": 21.0,
            "elevation": "1,380 – 1,520 m",
            "elevation_m": 1450,
            "lithology": "navajo-sandstone-narrows",
            "difficulty": "extreme",
            "default_catchment_area_km2": 780.0,
            "default_upstream_rain_mm_hr": 28.0,
            "default_slot_width_m": 1.4,
            "default_escape_ledge_height_m": 12.0,
            "default_distance_to_exit_km": 7.5,
            "escape_ledge_protocol": (
                "Identify infrequent alcove benches and the Middle Trail boulder jam exit; "
                "over 20 km of vertical Navajo Sandstone walls lack climbable ledges below 15 m."
            ),
            "primary_hazard": (
                "Blue-sky flash floods originating 40+ km upstream on the Kaiparowits and Bryce Canyon "
                "plateaus funneling a debris-laden flood bore through 1.2 m wide vertical walls."
            ),
            "navigation_protocol": (
                "Check NOAA/NWS Kanab convective precipitation forecasts and Paria River USGS stream "
                "gauge before entry; carry a satellite messenger and never camp on low channel sandbars."
            ),
            "traversal_protocol": (
                "Check NOAA/NWS Kanab convective precipitation forecasts and Paria River USGS stream "
                "gauge before entry; carry a satellite messenger and never camp on low channel sandbars."
            ),
            "field_notes": (
                "The longest and deepest slot canyon in the American Southwest (~21 km continuous "
                "constriction), where floodwaters can rise over 15 m with virtually no mid-canyon escape routes."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "little-wild-horse-bell-usa",
            "name": "Little Wild Horse & Bell Canyon San Rafael Reef Narrows",
            "country": "United States",
            "region": "San Rafael Swell, Emery County, Utah",
            "length_km": 12.9,
            "elevation": "1,550 – 1,820 m",
            "elevation_m": 1685,
            "lithology": "wingate-vertical-fissure",
            "difficulty": "moderate",
            "default_catchment_area_km2": 48.0,
            "default_upstream_rain_mm_hr": 16.0,
            "default_slot_width_m": 1.1,
            "default_escape_ledge_height_m": 3.5,
            "default_distance_to_exit_km": 1.8,
            "escape_ledge_protocol": (
                "Scramble onto inclined Kayenta-Wingate transition benches at the open wash breaks "
                "between the three main narrows sections."
            ),
            "primary_hazard": (
                "Rapid runoff from slickrock domes along the San Rafael Reef monocline creating "
                "sudden shoulder-width constriction surges and cold keeper pools."
            ),
            "navigation_protocol": (
                "Monitor convective buildup over the San Rafael Swell reef crest; use the Behind the Reef "
                "road corridor between Little Wild Horse and Bell Canyon as a mid-loop emergency bailout."
            ),
            "traversal_protocol": (
                "Monitor convective buildup over the San Rafael Swell reef crest; use the Behind the Reef "
                "road corridor between Little Wild Horse and Bell Canyon as a mid-loop emergency bailout."
            ),
            "field_notes": (
                "A classic non-technical Wingate and Navajo Sandstone slot loop slicing through the "
                "upturned San Rafael Reef hogback with tight 0.8 m sculpted narrows."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "wadi-mujib-siq-jordan",
            "name": "Wadi Mujib Dead Sea Sandstone Siq & Perennial Gorge",
            "country": "Jordan",
            "region": "Dead Sea Rift Valley, Karak & Madaba Governorates",
            "length_km": 8.5,
            "elevation": "-410 to -250 m",
            "elevation_m": -330,
            "lithology": "kayenta-ledgy-gorge",
            "difficulty": "challenging",
            "default_catchment_area_km2": 320.0,
            "default_upstream_rain_mm_hr": 24.0,
            "default_slot_width_m": 3.2,
            "default_escape_ledge_height_m": 5.0,
            "default_distance_to_exit_km": 2.4,
            "escape_ledge_protocol": (
                "Ascend fixed iron rungs and stepped Umm Ishrin sandstone ledges above the perennial "
                "thalweg immediately if water turbidity increases or acoustic rumble sounds upstream."
            ),
            "primary_hazard": (
                "Massive arid plateau drainage (~6,500 km² total basin) where distant Moab highland "
                "thunderstorms trigger violent hydraulic bores down the narrow Dead Sea sandstone siq."
            ),
            "navigation_protocol": (
                "Wear high-flotation PFDs in perennial gorge pools, obey seasonal October–April "
                "flash-flood closures, and maintain line-of-sight with high sandstone ledge refuges."
            ),
            "traversal_protocol": (
                "Wear high-flotation PFDs in perennial gorge pools, obey seasonal October–April "
                "flash-flood closures, and maintain line-of-sight with high sandstone ledge refuges."
            ),
            "field_notes": (
                "The lowest-elevation slot gorge on Earth (-410 m at the Dead Sea mouth), carved into "
                "Cambrian Umm Ishrin red sandstone with perennial cascades and chockstone drops."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "garganta-del-cares-wadi-oman",
            "name": "Wadi Ghul Al Nakhar Balcony Gorge Limestone Slot",
            "country": "Oman",
            "region": "Jebel Shams, Al Hajar Mountains, Ad Dakhiliyah",
            "length_km": 9.2,
            "elevation": "850 – 1,900 m",
            "elevation_m": 1375,
            "lithology": "limestone-karst-wadi",
            "difficulty": "challenging",
            "default_catchment_area_km2": 210.0,
            "default_upstream_rain_mm_hr": 22.0,
            "default_slot_width_m": 2.8,
            "default_escape_ledge_height_m": 4.5,
            "default_distance_to_exit_km": 2.6,
            "escape_ledge_protocol": (
                "Evacuate the boulder-choked wadi floor onto the historic Al Khitaym cliffside balcony "
                "trail ledges (5–15 m above the active channel) at the first sign of Jebel Shams summit rain."
            ),
            "primary_hazard": (
                "Orographic cloudbursts over the 3,000 m Jebel Shams massif shedding zero-infiltration "
                "sheetflow down polished Cretaceous limestone walls into boulder-jammed constrictions."
            ),
            "navigation_protocol": (
                "Start wadi floor transits at dawn before afternoon Al Hajar convective cells form; "
                "identify stepped limestone strata ramps leading to the upper balcony bench."
            ),
            "traversal_protocol": (
                "Start wadi floor transits at dawn before afternoon Al Hajar convective cells form; "
                "identify stepped limestone strata ramps leading to the upper balcony bench."
            ),
            "field_notes": (
                "Known as the Grand Canyon of Arabia, where a 1,000 m limestone chasm narrows into "
                "polished wadi floor slots beneath ancient abandoned cliffside villages."
            ),
        }
    ),
]


# ---------------------------------------------------------------------------
# Mandatory 6-Item Slot-Canyon Flash-Flood & Escape-Ledge Gear Checklist
# ---------------------------------------------------------------------------

FLASH_FLOOD_SLOT_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "Two-Way Satellite Communicator with Hourly Mesoscale Weather Alerts",
        "category": "weather_telemetry",
        "priority": "essential",
        "rationale": (
            "Receives upstream convective storm cell warnings 30–60 km away in distant headwater "
            "basins invisible from the narrow slot canyon floor ('blue-sky flood' hazard)."
        ),
    },
    {
        "item": "UIAA-Certified Climbing Helmet (High-Impact Crown & Side Protection)",
        "category": "head_protection",
        "priority": "essential",
        "rationale": (
            "Protects against pebble and cobble rain dislodged from 100+ m canyon rims by wind "
            "gusts or early sheetflow waterfalls prior to the main flood bore arrival."
        ),
    },
    {
        "item": "20 m x 8 mm Floating Polypropylene/Dyneema Canyon Assist Handline",
        "category": "escape_rigging",
        "priority": "essential",
        "rationale": (
            "Enables lead scramblers to haul team members and packs up steep 3–8 m sandstone "
            "escape ledges and alcove benches above rising floodwaters."
        ),
    },
    {
        "item": "Submersible IPX8 Dry-Bag Keg & Positive-Buoyancy Pack Liner",
        "category": "flotation_insulation",
        "priority": "essential",
        "rationale": (
            "Provides emergency torso flotation in deep wadi pools and keeps hypothermia shelter "
            "and thermal layers bone-dry during overnight forced bivouacs on high escape ledges."
        ),
    },
    {
        "item": "Sticky-Rubber Wet-Sandstone Approach Shoes & Neoprene Socks",
        "category": "footwear_traction",
        "priority": "essential",
        "rationale": (
            "Maximizes friction smearing on vertical Navajo and Wingate sandstone walls when "
            "stemming or scrambling rapidly toward elevated escape benches."
        ),
    },
    {
        "item": "24-Hour Emergency Ledge Bivouac Kit (SOL Bivy, Water Flocculant & Strobe)",
        "category": "ledge_survival",
        "priority": "essential",
        "rationale": (
            "Sustains party on exposed canyon ledges for 12–24 hours while waiting for the recessional "
            "limb of an ephemeral flash-flood hydrograph to subside."
        ),
    },
]


# ---------------------------------------------------------------------------
# Catalog Accessors & Filtering
# ---------------------------------------------------------------------------


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 reference slot-canyon flash-flood sites."""
    return list(FLASH_FLOOD_SLOT_SITES)


def get_all_flash_flood_slot_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Return a single slot-canyon flash-flood site by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in FLASH_FLOOD_SLOT_SITES:
        if str(site["id"]).lower() == target:
            return site
    return None


def get_flash_flood_slot_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    lithology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """Filter slot-canyon flash-flood sites by country, lithology, difficulty, or free-text search."""
    results: list[dict[str, Any]] = list(FLASH_FLOOD_SLOT_SITES)

    if country:
        c_lower = country.strip().lower()
        results = [s for s in results if c_lower in str(s["country"]).lower()]

    if lithology:
        l_lower = lithology.strip().lower().replace("_", "-")
        results = [s for s in results if str(s["lithology"]).lower() == l_lower]

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
            or q_lower in str(s["lithology"]).lower()
            or q_lower in str(s["field_notes"]).lower()
            or q_lower in str(s["id"]).lower()
        ]

    return results


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6-item mandatory slot-canyon flash-flood & escape-ledge gear checklist."""
    return list(FLASH_FLOOD_SLOT_GEAR_CHECKLIST)


# ---------------------------------------------------------------------------
# Physics-Based Slot-Canyon Flash-Flood Hydrograph & Escape-Ledge Calculator
# ---------------------------------------------------------------------------


def calculate_flash_flood_slot(
    catchment_area_km2: float = 120.0,
    upstream_rain_mm_hr: float = 25.0,
    slot_width_m: float = 2.5,
    escape_ledge_height_m: float = 4.0,
    distance_to_exit_km: float = 2.5,
) -> dict[str, Any]:
    """Calculate ephemeral flash-flood hydrograph lag, peak discharge, wall-of-water rise rate, and escape margin.

    Parameters
    ----------
    catchment_area_km2:
        Upstream drainage basin area feeding the slot canyon in km² [1, 1500].
    upstream_rain_mm_hr:
        Convective rainfall intensity over the upstream catchment in mm/hr [0, 120].
    slot_width_m:
        Effective bedrock constriction width at the canyon floor in meters [0.3, 25].
    escape_ledge_height_m:
        Vertical height to the nearest flood-safe escape bench or alcove ledge in meters [0.5, 30].
    distance_to_exit_km:
        Remaining canyon floor travel distance to the nearest open wash exit in km [0.1, 20].
    """
    if not (1.0 <= catchment_area_km2 <= 1500.0):
        raise ValueError("catchment_area_km2 must be between 1 and 1500 km2")
    if not (0.0 <= upstream_rain_mm_hr <= 120.0):
        raise ValueError("upstream_rain_mm_hr must be between 0 and 120 mm/hr")
    if not (0.3 <= slot_width_m <= 25.0):
        raise ValueError("slot_width_m must be between 0.3 and 25 meters")
    if not (0.5 <= escape_ledge_height_m <= 30.0):
        raise ValueError("escape_ledge_height_m must be between 0.5 and 30 meters")
    if not (0.1 <= distance_to_exit_km <= 20.0):
        raise ValueError("distance_to_exit_km must be between 0.1 and 20 km")

    # 1. Peak hydrograph discharge Q_peak (m³/s): slickrock/arid runoff scaling
    if upstream_rain_mm_hr <= 0.0:
        peak_discharge_m3_s = 0.0
    else:
        raw_q = 0.14 * (catchment_area_km2**0.78) * ((upstream_rain_mm_hr / 10.0) ** 1.15)
        peak_discharge_m3_s = round(max(0.05, raw_q), 2)

    # 2. Flood wave kinematic lag time (minutes from storm onset to bore arrival at constriction)
    base_lag = 38.0 + (catchment_area_km2**0.42) * 4.2
    rain_speedup = min(35.0, upstream_rain_mm_hr * 0.45)
    flood_wave_lag_minutes = round(max(8.0, min(180.0, base_lag - rain_speedup)), 1)

    # 3. Constriction wall-of-water vertical rise rate (m/min)
    if upstream_rain_mm_hr <= 0.0:
        wall_of_water_rise_rate_m_per_min = 0.0
    else:
        raw_rise = (peak_discharge_m3_s / slot_width_m) * 0.065 + (
            (upstream_rain_mm_hr * 0.008) / slot_width_m
        )
        wall_of_water_rise_rate_m_per_min = round(min(12.0, max(0.01, raw_rise)), 2)

    # 4. Escape margin (minutes remaining before flood bore cuts off escape ledge / canyon exit)
    evacuation_time_min = (
        (distance_to_exit_km * 14.0)
        + (escape_ledge_height_m * 1.4)
        + (wall_of_water_rise_rate_m_per_min * 6.5)
    )
    escape_margin_minutes = round(
        max(-120.0, min(160.0, flood_wave_lag_minutes - evacuation_time_min)),
        1,
    )

    # 5. Determine Risk Level & Escape Class
    warnings: list[str] = []
    recommendations: list[str] = []

    if (
        upstream_rain_mm_hr >= 48.0
        or peak_discharge_m3_s >= 90.0
        or wall_of_water_rise_rate_m_per_min >= 2.5
        or escape_margin_minutes <= -15.0
        or (escape_ledge_height_m >= 12.0 and upstream_rain_mm_hr >= 25.0)
    ):
        risk_level: FlashFloodSlotRiskLevel = "critical"
        escape_class: FlashFloodSlotEscapeClass = "abort-imminent-flood-bore-entrapment"
    elif (
        upstream_rain_mm_hr >= 22.0
        or peak_discharge_m3_s >= 20.0
        or wall_of_water_rise_rate_m_per_min >= 0.45
        or escape_margin_minutes <= 12.0
        or escape_ledge_height_m >= 6.0
    ):
        risk_level = "high"
        escape_class = "immediate-climb-escape-ledge"
    elif (
        upstream_rain_mm_hr >= 8.0
        or peak_discharge_m3_s >= 4.0
        or wall_of_water_rise_rate_m_per_min >= 0.10
        or escape_margin_minutes <= 25.0
        or slot_width_m <= 2.5
    ):
        risk_level = "moderate"
        escape_class = "monitor-high-bench-ledges"
    else:
        risk_level = "low"
        escape_class = "dry-wash-standard-transit"

    # Populate actionable warnings
    if peak_discharge_m3_s >= 25.0 or wall_of_water_rise_rate_m_per_min >= 0.5:
        warnings.append(
            f"SEVERE CONSTRICTION SURGE: Peak hydrograph discharge ({peak_discharge_m3_s:.1f} m³/s) "
            f"through a {slot_width_m:.1f} m slot drives a vertical rise rate of "
            f"{wall_of_water_rise_rate_m_per_min:.2f} m/min."
        )
    if escape_margin_minutes <= 10.0:
        warnings.append(
            f"NEGATIVE OR CRITICAL ESCAPE MARGIN ({escape_margin_minutes:.1f} min): Flood wave lag "
            f"({flood_wave_lag_minutes:.1f} min) is insufficient to cover {distance_to_exit_km:.1f} km "
            f"to exit or scramble {escape_ledge_height_m:.1f} m ledges."
        )
    if catchment_area_km2 >= 250.0 and upstream_rain_mm_hr >= 15.0:
        warnings.append(
            f"BLUE-SKY FLASH FLOOD HAZARD: Large {catchment_area_km2:.0f} km² headwater basin can "
            "deliver a lethal debris bore from distant storms even under clear overhead skies."
        )
    if escape_ledge_height_m >= 8.0:
        warnings.append(
            f"High escape ledge elevation ({escape_ledge_height_m:.1f} m) requires technical 5th-class "
            "stemming or rope assist; do not attempt to outrun the bore down-canyon."
        )

    # Populate technical recommendations
    if escape_class == "abort-imminent-flood-bore-entrapment":
        recommendations.append(
            "DO NOT ENTER SLOT CONSTRICTION: Imminent hydraulic bore and woody debris-wall hazard. "
            "If already inside, abandon heavy packs and scramble immediately to the highest alcove ledge."
        )
        recommendations.append(
            "Trigger SOS / two-way satellite beacon from high ground and wait out the full hydrograph "
            "recession (often 6–18 hours) before descending back into the thalweg."
        )
    elif escape_class == "immediate-climb-escape-ledge":
        recommendations.append(
            f"Ascend immediately to an escape bench at least {escape_ledge_height_m:.1f} m above the "
            "canyon floor; do not attempt to sprint down-canyon through narrow meanders."
        )
        recommendations.append(
            "Deploy the 20 m floating assist handline to belay slower party members and secure "
            "dry-bags above the projected high-water drift line."
        )
    elif escape_class == "monitor-high-bench-ledges":
        recommendations.append(
            "Maintain continuous awareness of Kayenta/sandstone bench ledges every 200–400 m and "
            "listen for acoustic upstream rumble or sudden brown foam changes in trickle flow."
        )
        recommendations.append(
            "Keep helmet buckled and unclip pack sternum/hip straps when passing constrictions "
            "narrower than 2.0 m."
        )
    else:
        recommendations.append(
            "Standard dry-wash slot transit protocol: log entry time, verify zero upstream radar "
            "echoes, and note mid-canyon bailout washes as you pass them."
        )

    recommendations.append(
        "Never camp or take extended rests on low inner-canyon sandbars; always select elevated "
        "bedrock terraces above historic driftwood wrack lines."
    )

    return _AttrDict(
        {
            "catchment_area_km2": round(catchment_area_km2, 1),
            "upstream_rain_mm_hr": round(upstream_rain_mm_hr, 1),
            "slot_width_m": round(slot_width_m, 2),
            "escape_ledge_height_m": round(escape_ledge_height_m, 1),
            "distance_to_exit_km": round(distance_to_exit_km, 2),
            "flood_wave_lag_minutes": flood_wave_lag_minutes,
            "wall_of_water_rise_rate_m_per_min": wall_of_water_rise_rate_m_per_min,
            "peak_discharge_m3_s": peak_discharge_m3_s,
            "escape_margin_minutes": escape_margin_minutes,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "escape_class": escape_class,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


# ---------------------------------------------------------------------------
# Intent Detection & Parameter Extraction
# ---------------------------------------------------------------------------

_FLASH_FLOOD_SLOT_KEYWORDS: tuple[str, ...] = (
    "flash flood",
    "flash-flood",
    "slot canyon flood",
    "slot-canyon flood",
    "escape ledge",
    "escape ledges",
    "escape-ledge",
    "buckskin gulch",
    "wire pass",
    "little wild horse",
    "bell canyon",
    "wadi mujib",
    "wadi ghul",
    "garganta del cares",
    "al nakhar",
    "hydrograph",
    "blue-sky flood",
    "blue sky flood",
    "flood bore",
    "flood wave lag",
    "wall of water",
    "wall-of-water",
    "navajo-sandstone-narrows",
    "wingate-vertical-fissure",
    "kayenta-ledgy-gorge",
    "limestone-karst-wadi",
)

_FLASH_FLOOD_SLOT_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return policy",
    "return label",
    "shipping",
    "tracking number",
    "invoice",
    "cancel my order",
    # Technical pothole escape exclusions
    "keeper pothole",
    "sandtrap",
    "ghost anchor",
    "cheater stick",
    "talon hook",
    "talon escape",
    "pack toss",
    # Technical rope rigging canyoneering exclusions
    "fiddle stick",
    "fiddlestick",
    "rappel rope length",
    "canyon descender",
    "canyoneering harness",
    # Slickrock burro exclusions
    "sawbuck",
    "burro packing",
    "pack burro",
    "burro hydration",
    # Whitewater kayaking exclusions
    "skykomish",
    "boulder drop",
    "tumwater",
    "eskimo roll",
    # Sandur / braided glacial outwash exclusions
    "sandur",
    "braided river",
    "braided-river",
    "glacial outwash",
    "outwash plain",
    "silt-bar",
    "quicksand silt",
    "glacial flour quicksand",
    "skeidararsandur",
    "skeiðarársandur",
    "kaskawulsh",
    "rakaia braids",
    # Aeolian yardang & mega-dune desert navigation exclusions (yardang_navigation.py)
    "yardang",
    "yardangs",
    "kalut",
    "kaluts",
    "dasht-e lut",
    "gandom beryan",
    "badain jaran",
    "bilutu",
    "lop nur",
    "dunhuang yadan",
    "barchanoid",
    "erg djourab",
    "borkou",
    "ennedi",
    "aeolian corridor",
    "jokulhlaup",
    "jökulhlaup",
    "grimsvotn",
    "grímsvötn",
    "skeidararjokull",
    "skeiðarárjökull",
    "suicide basin",
    "mendenhall",
    "lago cachet",
    "glaciar colonia",
    "kyagar",
    "shaksgam",
    "ice-dammed",
    "ice dammed",
    "glacial lake outburst",
    "glof",
    "proglacial canyon",
    "bentonite",
    "popcorn clay",
    "popcorn-clay",
    "piping tunnel",
    "piping-tunnel",
    "smectite",
    "montmorillonite",
    "gumbo clay",
    "gumbo mud",
    "sage creek",
    "chadron formation",
    "cainville",
    "factory butte",
    "mancos shale",
    "bearpaw shale",
    "red deer badlands",
    "bardenas reales",
    "pisquerra",
    "castildetierra",
)


def is_flash_flood_slot_query(query: str) -> bool:
    """Return True if the user query is asking about slot-canyon flash-flood hydrographs or escape-ledge navigation."""
    if not query or not query.strip():
        return False
    q_lower = query.lower()

    if any(excl in q_lower for excl in _FLASH_FLOOD_SLOT_EXCLUSIONS):
        return False

    # Preserve pure desert trekking route queries (e.g. "Is buckskin gulch dry for desert trekking?")
    if "desert trekking" in q_lower and not any(
        k in q_lower
        for k in (
            "flash flood",
            "flash-flood",
            "hydrograph",
            "escape ledge",
            "escape-ledge",
            "flood bore",
            "blue-sky flood",
            "blue sky flood",
        )
    ):
        return False

    return any(kw in q_lower for kw in _FLASH_FLOOD_SLOT_KEYWORDS)


def detect_flash_flood_slot_intent(query: str) -> bool:
    """Alias for is_flash_flood_slot_query()."""
    return is_flash_flood_slot_query(query)


def extract_flash_flood_slot_params(query: str) -> dict[str, Any]:
    """Extract slot-canyon flash-flood site ID and numerical calculator parameters from a natural-language query."""
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = None

    if "buckskin" in q_lower or "wire pass" in q_lower or "paria" in q_lower:
        matched_site = get_site_by_id("buckskin-gulch-paria-usa")
    elif (
        "little wild horse" in q_lower
        or "bell canyon" in q_lower
        or "san rafael reef" in q_lower
    ):
        matched_site = get_site_by_id("little-wild-horse-bell-usa")
    elif "wadi mujib" in q_lower or "mujib" in q_lower or "dead sea" in q_lower or "jordan" in q_lower:
        matched_site = get_site_by_id("wadi-mujib-siq-jordan")
    elif (
        "wadi ghul" in q_lower
        or "al nakhar" in q_lower
        or "garganta del cares" in q_lower
        or "jebel shams" in q_lower
        or "oman" in q_lower
    ):
        matched_site = get_site_by_id("garganta-del-cares-wadi-oman")

    catchment_km2 = (
        float(matched_site["default_catchment_area_km2"]) if matched_site else 120.0
    )
    rain_mm_hr = (
        float(matched_site["default_upstream_rain_mm_hr"]) if matched_site else 25.0
    )
    width_m = float(matched_site["default_slot_width_m"]) if matched_site else 2.5
    ledge_m = (
        float(matched_site["default_escape_ledge_height_m"]) if matched_site else 4.0
    )
    exit_km = float(matched_site["default_distance_to_exit_km"]) if matched_site else 2.5

    has_explicit_numbers = False

    km2_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:km2|km²|sq\s*km)\b", q_lower)
    if km2_match:
        val = float(km2_match.group(1))
        if 1.0 <= val <= 1500.0:
            catchment_km2 = val
            has_explicit_numbers = True

    rain_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:mm/hr|mm/h|mm\s*per\s*hr)\b", q_lower)
    if rain_match:
        val = float(rain_match.group(1))
        if 0.0 <= val <= 120.0:
            rain_mm_hr = val
            has_explicit_numbers = True

    width_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:slot|width|wide|constriction)",
        q_lower,
    )
    if width_match:
        val = float(width_match.group(1))
        if 0.3 <= val <= 25.0:
            width_m = val
            has_explicit_numbers = True

    ledge_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:escape|ledge|bench)",
        q_lower,
    )
    if ledge_match:
        val = float(ledge_match.group(1))
        if 0.5 <= val <= 30.0:
            ledge_m = val
            has_explicit_numbers = True

    exit_match = re.search(
        r"(\d+(?:\.\d+)?)\s*km\b(?!\s*(?:2|²))",
        q_lower,
    )
    if exit_match:
        val = float(exit_match.group(1))
        if 0.1 <= val <= 20.0:
            exit_km = val
            has_explicit_numbers = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "matched_site": matched_site,
        "catchment_area_km2": catchment_km2,
        "upstream_rain_mm_hr": rain_mm_hr,
        "slot_width_m": width_m,
        "escape_ledge_height_m": ledge_m,
        "distance_to_exit_km": exit_km,
        "has_explicit_numbers": has_explicit_numbers,
    }


def format_flash_flood_slot_response(query: str) -> dict[str, Any]:
    """Build a structured response dictionary for a slot-canyon flash-flood query."""
    params: dict[str, Any] = extract_flash_flood_slot_params(query)
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = params["matched_site"]

    calc_result: dict[str, Any] = calculate_flash_flood_slot(
        catchment_area_km2=float(params["catchment_area_km2"]),
        upstream_rain_mm_hr=float(params["upstream_rain_mm_hr"]),
        slot_width_m=float(params["slot_width_m"]),
        escape_ledge_height_m=float(params["escape_ledge_height_m"]),
        distance_to_exit_km=float(params["distance_to_exit_km"]),
    )

    is_calc_request = bool(
        params["has_explicit_numbers"]
        or any(
            w in q_lower
            for w in (
                "calculate",
                "calculator",
                "hydrograph",
                "rise rate",
                "wave lag",
                "escape margin",
                "peak discharge",
            )
        )
    )

    if is_calc_request:
        action = "flash_flood_slot_calculated"
    elif matched_site is not None:
        action = "flash_flood_slot_lookup"
    else:
        action = "flash_flood_slot_info"

    site_summary = (
        f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']} — "
        f"{matched_site['length_km']} km, lithology: `{matched_site['lithology']}`): "
        f"{matched_site['escape_ledge_protocol']} "
        if matched_site
        else "High-desert sandstone and limestone slot canyons require rigorous monitoring of "
        "upstream convective catchments, kinematic flood-wave lag times, and vertical escape-ledge elevations. "
    )

    answer = (
        f"{site_summary}"
        f"For a **{calc_result['catchment_area_km2']} km² catchment** under "
        f"**{calc_result['upstream_rain_mm_hr']} mm/hr upstream rain** in a "
        f"**{calc_result['slot_width_m']} m slot constriction** "
        f"({calc_result['escape_ledge_height_m']} m escape ledge, {calc_result['distance_to_exit_km']} km to exit), "
        f"the modeled flood-wave lag is **{calc_result['flood_wave_lag_minutes']} min**, "
        f"peak discharge is **{calc_result['peak_discharge_m3_s']} m³/s**, "
        f"wall-of-water rise rate is **{calc_result['wall_of_water_rise_rate_m_per_min']} m/min**, "
        f"escape margin is **{calc_result['escape_margin_minutes']} min**, and risk level is "
        f"**{calc_result['risk_level'].upper()}** (escape class: `{calc_result['escape_class']}`)."
    )

    return _AttrDict(
        {
            "action": action,
            "answer": answer,
            "matched_site": matched_site,
            "calculation": calc_result,
            "sites": FLASH_FLOOD_SLOT_SITES,
            "checklist": FLASH_FLOOD_SLOT_GEAR_CHECKLIST,
        }
    )


def build_flash_flood_slot_prompt(query: str = "") -> str:
    """Build system prompt context for LLM calls involving slot-canyon flash-flood hydrographs & escape ledges."""
    info: dict[str, Any] = (
        format_flash_flood_slot_response(query)
        if query
        else format_flash_flood_slot_response("flash flood slot canyon")
    )
    calc: dict[str, Any] = info["calculation"]
    matched_site: dict[str, Any] | None = info.get("matched_site")

    lines: list[str] = [
        "### High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Context",
        "- **Lithologic Constriction Regimes**: Navajo Sandstone narrows (e.g., Buckskin Gulch & Wire Pass), "
        "Wingate vertical fissures (e.g., Little Wild Horse & Bell Canyon), Kayenta/Umm Ishrin ledgy gorges "
        "(e.g., Wadi Mujib Siq), and Cretaceous limestone karst wadis (e.g., Wadi Ghul Al Nakhar).",
        f"- **Calculated Flash-Flood Hydrograph Physics**: Catchment={calc['catchment_area_km2']}km², "
        f"UpstreamRain={calc['upstream_rain_mm_hr']}mm/hr, SlotWidth={calc['slot_width_m']}m, "
        f"EscapeLedge={calc['escape_ledge_height_m']}m, ExitDist={calc['distance_to_exit_km']}km -> "
        f"Flood Wave Lag={calc['flood_wave_lag_minutes']}min, Peak Discharge={calc['peak_discharge_m3_s']}m³/s, "
        f"Rise Rate={calc['wall_of_water_rise_rate_m_per_min']}m/min, Escape Margin={calc['escape_margin_minutes']}min, "
        f"Risk={calc['risk_level']}, EscapeClass={calc['escape_class']}.",
    ]
    if matched_site:
        lines.append(
            f"- **Focused Slot-Canyon Site**: {matched_site['name']} ({matched_site['country']}) — "
            f"Primary Hazard: {matched_site['primary_hazard']} | Escape Protocol: {matched_site['escape_ledge_protocol']}"
        )
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response dictionary for a slot-canyon flash-flood query."""
    info: dict[str, Any] = format_flash_flood_slot_response(query)
    return {
        "answer": info["answer"],
        "flash_flood_slot_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[str, None, None]:
    """Yield SSE stream chunks for a slot-canyon flash-flood query."""
    info: dict[str, Any] = format_flash_flood_slot_response(query)
    yield f"data: {json.dumps({'action': info['action'], 'flash_flood_slot_info': info})}\n\n"
    yield f"data: {json.dumps({'content': info['answer'], 'answer': info['answer']})}\n\n"
    yield "data: [DONE]\n\n"
