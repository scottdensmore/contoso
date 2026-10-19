"""Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation Guide module.

Provides domain data, physics-based leeward slip-face grainflow avalanche stability modeling,
inter-yardang Venturi wind-tunnel acceleration ratios, triboelectric airborne sand GNSS noise
indices, hot loose-sand stride sinkage energy multipliers, mandatory safety gear checklists,
and intent detection for hyper-arid yardang fleets and mega-star-dune erg corridors.
"""

from __future__ import annotations

import json
import math
import re
from collections.abc import Generator
from typing import Any, Literal

YardangMorphology = Literal[
    "kalut-mega-yardang-corridor",
    "star-dune-multi-arm-slipface",
    "lacustrine-mudstone-yardang-fleet",
    "barchanoid-interdune-gassi",
]
YardangDifficulty = Literal["moderate", "challenging", "extreme"]
YardangRiskLevel = Literal["low", "moderate", "high", "critical"]
YardangRoutingStrategy = Literal[
    "strategy-1-interdune-gassi-hardpan-corridor",
    "strategy-2-windward-stoss-rib-contouring",
    "strategy-3-prismatic-dead-reckoning-flank-bypass",
    "strategy-4-emergency-lee-trench-haboob-bivouac-lockout",
]


class _AttrDict(dict[str, Any]):
    """Dictionary subclass supporting attribute-style read access."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc


# ---------------------------------------------------------------------------
# Reference Aeolian Yardang & Mega-Dune Desert Sites (4 Sites)
# ---------------------------------------------------------------------------

YARDANG_DESERT_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "dasht-e-lut-kaluts-iran",
            "name": "Dasht-e Lut Gandom Beryan & Shahr-e Lut Mega-Yardang Kalut Corridors",
            "country": "Iran",
            "region": "Kerman & Sistan-Baluchestan Provinces, Lut Desert UNESCO World Heritage Core",
            "elevation": "205 m Shahdad salt-flat depression to 480 m Gandom Beryan basalt-capped kalut ridges",
            "elevation_m": 340,
            "morphology": "kalut-mega-yardang-corridor",
            "difficulty": "extreme",
            "default_slip_face_angle_deg": 35.0,
            "default_wind_speed_kmh": 74.0,
            "default_corridor_width_m": 18.0,
            "default_sand_surface_temp_c": 64.0,
            "default_visibility_m": 95.0,
            "primary_hazard": (
                "70–150 m tall parallel NW–SE Pleistocene clay-evaporite kalut mega-yardang ridges "
                "creating severe Venturi wind-tunnel sandblasting, >65°C surface skin temperatures, "
                "and blind acoustic-shadow troughs."
            ),
            "routing_strategy": (
                "Travel strictly along wind-scoured gravel-gypsum inter-kalut troughs ('gassi') "
                "between 03:30 and 09:30 local time; never ascend overhanging 34°+ leeward sand "
                "aprons banking against vertical kalut mudstone walls."
            ),
            "navigation_protocol": (
                "Lock NW–SE kalut strike bearings (325°/145° magnetic) on a fluid-damped prismatic "
                "compass and log dual-frequency L1/L5 GNSS waypoints every 500 m to prevent "
                "parallel-corridor transposition during 120-day Bad-e Sad-o-Bist-Ruz windstorms."
            ),
            "progression_protocol": (
                "Follow wind-scoured inter-kalut gravel floors during predawn hours and bypass "
                "steep leeward sand aprons."
            ),
            "field_notes": (
                "Carved by the 120-day summer shamal/sistan winds across 150 km of hyper-arid "
                "playa-lacustrine sediments, adjacent to the Rig-e Yalan mega-dunes where satellite "
                "radiometry recorded 70.7°C ground temperatures."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "badain-jaran-star-dunes-china",
            "name": "Badain Jaran Bilutu Peak Mega-Star-Dune & Interdune Lakes",
            "country": "China",
            "region": "Alxa Right Banner, Inner Mongolia Autonomous Region (Alashan Plateau)",
            "elevation": "1,150 m spring-fed interdune lake basins to 1,611 m Bilutu Peak mega-star-dune crest",
            "elevation_m": 1611,
            "morphology": "star-dune-multi-arm-slipface",
            "difficulty": "challenging",
            "default_slip_face_angle_deg": 33.5,
            "default_wind_speed_kmh": 42.0,
            "default_corridor_width_m": 65.0,
            "default_sand_surface_temp_c": 46.0,
            "default_visibility_m": 420.0,
            "primary_hazard": (
                "450–500 m vertical relief stationary multi-arm star dunes with 34° angle-of-repose "
                "booming-sand slip-faces that trigger spontaneous dry grainflow slab avalanches and "
                "severe uphill stride sinkage."
            ),
            "routing_strategy": (
                "Ascend exclusively along firm windward stoss ridges (14°–20° inclination) where "
                "multidirectional winds compact quartz grains; contour around multi-arm saddles to "
                "reach spring-fed interdune groundwater lakes ('haizi')."
            ),
            "navigation_protocol": (
                "Triangulate bearings off primary star-dune nodal peaks and calcareous tufa spring "
                "shorelines; avoid dropping down concave leeward slip-face bowls where acoustic "
                "booming sand emissions mask wind direction."
            ),
            "progression_protocol": (
                "Walk compacted windward stoss arêtes between multi-arm star-dune nodes and never "
                "traverse across 33°+ leeward grainflow slip-faces."
            ),
            "field_notes": (
                "Home to the tallest stationary mega-dunes on Earth (Bilutu Peak rising ~500 m "
                "above its base) interspersed with over 140 permanent hypersaline and freshwater "
                "interdune lakes sustained by deep fault-zone artesian groundwater."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "lop-nur-yardang-xinjiang-china",
            "name": "Lop Nur & Dunhuang Yadan Pleistocene Lacustrine Fleet",
            "country": "China",
            "region": "Kumtag Desert & Lop Nur Basin, Xinjiang / Gansu Border",
            "elevation": "780 m desiccated Lop Nur salt-ear basin to 920 m Sanlongsha yardang mesas",
            "elevation_m": 860,
            "morphology": "lacustrine-mudstone-yardang-fleet",
            "difficulty": "extreme",
            "default_slip_face_angle_deg": 34.0,
            "default_wind_speed_kmh": 82.0,
            "default_corridor_width_m": 14.0,
            "default_sand_surface_temp_c": 54.0,
            "default_visibility_m": 65.0,
            "primary_hazard": (
                "Maze-like fleets of streamlined Pleistocene lacustrine mudstone-siltstone yardangs "
                "('Ghost Ship Fleet') swept by black-buran ('Kara-buran') gale-force sandstorms "
                "generating intense triboelectric static charge and sub-50 m visibility."
            ),
            "routing_strategy": (
                "Maintain single-file visual tether spacing along primary NE–SW wind-carved alleys; "
                "test overhanging mudstone-gypsum yardang cornices from below and anchor leeward "
                "storm bivouacs behind low aerodynamically stable yardang prows."
            ),
            "navigation_protocol": (
                "Cross-check L1/L5 multi-GNSS tracks against mechanical sun-compass shadow angles "
                "and barometric trends whenever triboelectric dust static degrades satellite "
                "carrier-to-noise ratios during Kara-buran gusts."
            ),
            "progression_protocol": (
                "Navigate NE–SW lacustrine yardang alleys using sun-compass and dual-band GNSS "
                "back-bearings while avoiding undercut mudstone overhangs."
            ),
            "field_notes": (
                "Where Swedish explorer Sven Hedin first introduced the Uyghur term 'yardang' "
                "('steep bank') in 1903 to describe streamlined wind-abraded ridges rising like "
                "capsized hulls above the desiccated Tarim-Lop basin floor."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "borkou-ennedi-yardangs-chad",
            "name": "Borkou–Tibesti Sandstone Yardang Wind-Tunnels & Erg Djourab",
            "country": "Chad",
            "region": "Borkou & Ennedi-Ouest Regions, Bodélé Depression Northern Margin, Central Sahara",
            "elevation": "190 m Bodélé diatomite depression to 540 m Borkou Paleozoic sandstone yardang fins",
            "elevation_m": 380,
            "morphology": "barchanoid-interdune-gassi",
            "difficulty": "challenging",
            "default_slip_face_angle_deg": 31.5,
            "default_wind_speed_kmh": 58.0,
            "default_corridor_width_m": 32.0,
            "default_sand_surface_temp_c": 52.0,
            "default_visibility_m": 180.0,
            "primary_hazard": (
                "Persistent NE Harmattan low-level jet funneling through Paleozoic sandstone "
                "mega-yardang rock corridors while driving fast-migrating barchan horns and "
                "blinding diatomite-quartz dust plumes across interdune gassi streets."
            ),
            "routing_strategy": (
                "Follow exposed sandstone bedrock pavement and coarse lag-gravel gassi corridors "
                "between barchanoid dune trains; cross barchan chains only at low windward horn "
                "cols rather than steep crescentic leeward slip-faces."
            ),
            "navigation_protocol": (
                "Sight prismatic compass azimuths along regional NE–SW sandstone yardang strike "
                "ribs (045°/225°) and establish windbreak bivouacs on windward bedrock shelves "
                "clear of encroaching leeward barchan slip-face aprons."
            ),
            "progression_protocol": (
                "Follow Paleozoic sandstone gassi pavements and cross barchanoid dune chains "
                "solely at low windward horn saddles."
            ),
            "field_notes": (
                "Sculpted across the world's most intense continental aeolian dust-source corridor, "
                "where the Bodélé low-level jet scours kilometer-scale sandstone yardang ridges and "
                "Faya-Largeau barchan trains across the ancient Mega-Chad lakebed."
            ),
        }
    ),
]

YARDANG_NAVIGATION_SITES: list[dict[str, Any]] = YARDANG_DESERT_SITES
YARDANG_SITES: list[dict[str, Any]] = YARDANG_DESERT_SITES


# ---------------------------------------------------------------------------
# Mandatory 6-Item Aeolian Yardang & Mega-Dune Navigation Gear Checklist
# ---------------------------------------------------------------------------

YARDANG_NAVIGATION_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "Full-Seal Foam-Gasket ANSI Z87.1 Ballistic Sandstorm Goggles with Amber Contrast Lens",
        "category": "venturi_sandblast_eye_defense",
        "priority": "essential",
        "rationale": (
            "Blocks saltating quartz and gypsum grains accelerated to >80 km/h inside narrow "
            "inter-yardang Venturi wind tunnels while enhancing low-contrast slip-face crestlines."
        ),
    },
    {
        "item": "Non-Magnetic Fluid-Damped Prismatic Sighting Compass & Mechanical Equatorial Sun-Compass",
        "category": "triboelectric_blackout_dead_reckoning",
        "priority": "essential",
        "rationale": (
            "Provides drift-free azimuth dead reckoning through repetitive parallel kalut/yardang "
            "corridors when triboelectric dust static and canyon walls degrade GNSS lock."
        ),
    },
    {
        "item": "Dual-Frequency L1/L5 Multi-GNSS Receiver with Antistatic ShieldedHelix Antenna & Iridium SOS",
        "category": "multi_gnss_corridor_positioning",
        "priority": "essential",
        "rationale": (
            "Mitigates multipath reflections off 100 m vertical yardang walls and electrostatic "
            "scintillation during Kara-buran and Harmattan haboob whiteouts."
        ),
    },
    {
        "item": "High-Cuff Kevlar-Weave Desert Sand Gaiters & Heat-Reflective Vibram Mega-Dune Boots",
        "category": "thermal_slipface_foot_protection",
        "priority": "essential",
        "rationale": (
            "Prevents 60–70°C conductive quartz sand burns and stops fine aeolian silt ingress "
            "during deep stride sinkage on mega-star-dune stoss ridges."
        ),
    },
    {
        "item": "Anodized Aluminum Deadman Sand-Fluke Anchors & 2.4m Telescoping Windbreak Bivouac Tarp",
        "category": "haboob_lee_trench_shelter",
        "priority": "essential",
        "rationale": (
            "Secures emergency storm shelters in cohesionless aeolian sand when Venturi gusts "
            "exceed 75 km/h and visibility drops below 50 meters."
        ),
    },
    {
        "item": "Insulated 8-Liter Dual-Bladder Hydration System with High-Sodium Oral Rehydration Salts",
        "category": "hyper_arid_metabolic_hydration",
        "priority": "essential",
        "rationale": (
            "Sustains plasma volume and prevents thermal core exhaustion when loose-sand stride "
            "sinkage doubles metabolic energy expenditure in >45°C hyper-arid basins."
        ),
    },
]

YARDANG_GEAR_CHECKLIST: list[dict[str, Any]] = YARDANG_NAVIGATION_GEAR_CHECKLIST


# ---------------------------------------------------------------------------
# Catalog Accessors & Filtering
# ---------------------------------------------------------------------------


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 reference aeolian yardang and mega-dune desert navigation sites."""
    return list(YARDANG_DESERT_SITES)


def get_all_yardang_navigation_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Return a single aeolian yardang / mega-dune site by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in YARDANG_DESERT_SITES:
        if str(site["id"]).lower() == target:
            return site
    return None


def get_yardang_navigation_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def _normalize_text(text: str) -> str:
    return (
        text.replace("–", "-")
        .replace("—", "-")
        .replace("é", "e")
        .replace("è", "e")
        .replace("á", "a")
        .replace("ó", "o")
        .replace("ú", "u")
    )


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """Filter aeolian yardang & mega-dune sites by country, morphology, difficulty, or free-text search."""
    results: list[dict[str, Any]] = list(YARDANG_DESERT_SITES)

    if country:
        c_lower = _normalize_text(country.strip().lower())
        results = [s for s in results if c_lower in _normalize_text(str(s["country"]).lower())]

    if morphology:
        m_lower = morphology.strip().lower().replace("_", "-")
        results = [s for s in results if str(s["morphology"]).lower() == m_lower]

    if difficulty:
        d_lower = difficulty.strip().lower()
        results = [s for s in results if str(s["difficulty"]).lower() == d_lower]

    if search:
        q_lower = _normalize_text(search.strip().lower())
        results = [
            s
            for s in results
            if q_lower in _normalize_text(str(s["name"]).lower())
            or q_lower in _normalize_text(str(s["country"]).lower())
            or q_lower in _normalize_text(str(s["region"]).lower())
            or q_lower in _normalize_text(str(s["morphology"]).lower())
            or q_lower in _normalize_text(str(s["field_notes"]).lower())
            or q_lower in _normalize_text(str(s["id"]).lower())
        ]

    return results


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6-item mandatory aeolian yardang & mega-dune navigation gear checklist."""
    return list(YARDANG_NAVIGATION_GEAR_CHECKLIST)


# ---------------------------------------------------------------------------
# Physics-Based Aeolian Yardang & Mega-Dune Slip-Face Calculator
# ---------------------------------------------------------------------------


def calculate_yardang_navigation(
    slip_face_angle_deg: float = 32.0,
    wind_speed_kmh: float = 45.0,
    corridor_width_m: float = 28.0,
    sand_surface_temp_c: float = 42.0,
    visibility_m: float = 400.0,
) -> dict[str, Any]:
    """Calculate slip-face avalanche safety factor, Venturi wind acceleration ratio, triboelectric GNSS noise index, and stride sinkage energy multiplier.

    Parameters
    ----------
    slip_face_angle_deg:
        Inclination angle of the mega-dune leeward slip-face or yardang sand apron in degrees [10, 42].
    wind_speed_kmh:
        Ambient free-stream wind speed entering the yardang/dune field in km/h [0, 130].
    corridor_width_m:
        Horizontal constriction width between adjacent yardang ridges or interdune gassi walls in meters [2, 250].
    sand_surface_temp_c:
        Conductive sand/mudstone skin surface temperature in degrees Celsius [10, 72].
    visibility_m:
        Horizontal optical visibility through saltating sand and suspended dust in meters [5, 2000].
    """
    if not (10.0 <= slip_face_angle_deg <= 42.0):
        raise ValueError("slip_face_angle_deg must be between 10 and 42 degrees")
    if not (0.0 <= wind_speed_kmh <= 130.0):
        raise ValueError("wind_speed_kmh must be between 0 and 130 km/h")
    if not (2.0 <= corridor_width_m <= 250.0):
        raise ValueError("corridor_width_m must be between 2 and 250 meters")
    if not (10.0 <= sand_surface_temp_c <= 72.0):
        raise ValueError("sand_surface_temp_c must be between 10 and 72 degrees Celsius")
    if not (5.0 <= visibility_m <= 2000.0):
        raise ValueError("visibility_m must be between 5 and 2000 meters")

    # 1. Dry quartz sand angle of repose (~35.0°) reduced by thermal dilatancy and crest wind-loading
    effective_repose_deg = (
        35.0 - max(0.0, sand_surface_temp_c - 30.0) * 0.032 - (wind_speed_kmh * 0.015)
    )
    tan_slope = math.tan(math.radians(slip_face_angle_deg))
    tan_repose = math.tan(math.radians(max(24.0, effective_repose_deg)))
    raw_safety_factor = tan_repose / max(0.15, tan_slope)
    avalanche_slip_safety_factor = round(min(3.50, max(0.45, raw_safety_factor)), 2)

    # 2. Inter-yardang Venturi wind-tunnel acceleration ratio (1.00 to 2.85x)
    # Narrow kalut/yardang corridors constrict airflow and accelerate saltation jets
    constriction_boost = 18.0 / (corridor_width_m + 12.0)
    wind_jet_coupling = 1.0 + (wind_speed_kmh / 180.0) * 0.35
    raw_venturi = (1.0 + constriction_boost) * wind_jet_coupling
    venturi_wind_acceleration_ratio = round(min(2.85, max(1.00, raw_venturi)), 2)

    # 3. Triboelectric airborne sand GNSS noise & multipath index (0.5 to 10.0)
    # Driven by saltating quartz friction, thermal dryness, narrow canyon multipath, and dust opacity
    raw_tribo_noise = (
        0.6
        + (wind_speed_kmh * 0.042 * venturi_wind_acceleration_ratio / 1.4)
        + max(0.0, sand_surface_temp_c - 25.0) * 0.048
        + (160.0 / max(15.0, visibility_m)) * 0.32
        + (25.0 / max(6.0, corridor_width_m)) * 0.28
    )
    triboelectric_gnss_noise_index = round(min(10.0, max(0.5, raw_tribo_noise)), 2)

    # 4. Loose-sand stride sinkage & thermal metabolic energy multiplier (1.05 to 3.40x)
    raw_sinkage_mult = (
        1.05
        + max(0.0, slip_face_angle_deg - 10.0) * 0.038
        + max(0.0, sand_surface_temp_c - 22.0) * 0.016
        + (wind_speed_kmh * 0.0045)
    )
    stride_sinkage_energy_multiplier = round(min(3.40, max(1.05, raw_sinkage_mult)), 2)

    # 5. Classify Risk Level & Routing Strategy
    warnings: list[str] = []
    recommendations: list[str] = []

    if (
        avalanche_slip_safety_factor <= 0.88
        or venturi_wind_acceleration_ratio >= 2.15
        or triboelectric_gnss_noise_index >= 7.2
        or wind_speed_kmh >= 85.0
        or visibility_m <= 45.0
        or sand_surface_temp_c >= 62.0
        or slip_face_angle_deg >= 36.0
    ):
        risk_level: YardangRiskLevel = "critical"
        routing_strategy: YardangRoutingStrategy = (
            "strategy-4-emergency-lee-trench-haboob-bivouac-lockout"
        )
    elif (
        avalanche_slip_safety_factor <= 1.15
        or venturi_wind_acceleration_ratio >= 1.65
        or triboelectric_gnss_noise_index >= 4.8
        or wind_speed_kmh >= 55.0
        or visibility_m <= 160.0
        or sand_surface_temp_c >= 50.0
        or slip_face_angle_deg >= 32.5
    ):
        risk_level = "high"
        routing_strategy = "strategy-3-prismatic-dead-reckoning-flank-bypass"
    elif (
        avalanche_slip_safety_factor <= 1.42
        or venturi_wind_acceleration_ratio >= 1.32
        or triboelectric_gnss_noise_index >= 2.6
        or wind_speed_kmh >= 30.0
        or visibility_m <= 500.0
        or sand_surface_temp_c >= 38.0
        or slip_face_angle_deg >= 25.0
    ):
        risk_level = "moderate"
        routing_strategy = "strategy-2-windward-stoss-rib-contouring"
    else:
        risk_level = "low"
        routing_strategy = "strategy-1-interdune-gassi-hardpan-corridor"

    # Populate actionable warnings
    if avalanche_slip_safety_factor <= 1.12 or slip_face_angle_deg >= 32.5:
        warnings.append(
            f"LEEWARD SLIP-FACE GRAINFLOW AVALANCHE HAZARD ({slip_face_angle_deg:.1f}° slope, "
            f"safety factor {avalanche_slip_safety_factor:.2f}): Dry cohesionless sand at or above "
            "the 34° angle of repose will shear in cascading booming-sand slab avalanches."
        )
    if venturi_wind_acceleration_ratio >= 1.60 or wind_speed_kmh >= 55.0:
        warnings.append(
            f"INTER-YARDANG VENTURI SANDBLAST JET ({wind_speed_kmh:.0f} km/h ambient wind accelerated "
            f"{venturi_wind_acceleration_ratio:.2f}x inside {corridor_width_m:.0f} m corridor): "
            "Channeled saltation curtains cause severe corneal/skin abrasion and undercut mudstone cornices."
        )
    if triboelectric_gnss_noise_index >= 4.8 or visibility_m <= 160.0:
        warnings.append(
            f"TRIBOELECTRIC DUST STATIC & CORRIDOR BLACKOUT (visibility {visibility_m:.0f} m, "
            f"GNSS noise index {triboelectric_gnss_noise_index:.2f}/10): Electrostatic quartz friction "
            "and vertical kalut walls degrade satellite lock and cause parallel-trough disorientation."
        )
    if sand_surface_temp_c >= 50.0 or stride_sinkage_energy_multiplier >= 2.15:
        warnings.append(
            f"EXTREME THERMAL SKIN TEMPERATURE & STRIDE SINKAGE ({sand_surface_temp_c:.1f}°C sand surface, "
            f"{stride_sinkage_energy_multiplier:.2f}x metabolic energy multiplier): Unconsolidated hot "
            "sand induces rapid conductive foot burns and hyperthermic fluid depletion."
        )

    # Populate technical recommendations
    if routing_strategy == "strategy-4-emergency-lee-trench-haboob-bivouac-lockout":
        recommendations.append(
            "HALT AEOLIAN CORRIDOR PROGRESSION IMMEDIATELY: Pitch a deadman sand-fluke anchored storm "
            "bivouac on the stable windward flank of a low yardang prow—never beneath undercut mudstone "
            "overhangs or at the base of a 34°+ leeward slip-face."
        )
        recommendations.append(
            "Switch to mechanical prismatic compass and sun-compass back-bearings until visibility "
            f"exceeds 150 m and triboelectric GNSS noise ({triboelectric_gnss_noise_index:.2f}) subsides."
        )
    elif routing_strategy == "strategy-3-prismatic-dead-reckoning-flank-bypass":
        recommendations.append(
            "Bypass all concave leeward star-dune slip-faces and narrow Venturi yardang throats; "
            "route along wide interdune gassi gravel floors or firm windward stoss ridges (<20° slope)."
        )
        recommendations.append(
            "Maintain visual rope/line contact in sub-200 m dust visibility and verify L1/L5 GNSS "
            "fixes against magnetic strike bearings every 400 m."
        )
    elif routing_strategy == "strategy-2-windward-stoss-rib-contouring":
        recommendations.append(
            "Contour along wind-compacted windward stoss ribs and inter-kalut gravel pavements during "
            "early morning isothermal windows before surface temperatures exceed 45°C."
        )
        recommendations.append(
            "Log magnetic azimuths along the dominant yardang ridge strike to prevent drifting into "
            "adjacent blind parallel troughs."
        )
    else:
        recommendations.append(
            "Nominal interdune gassi & windward rib progression: follow firm lag-gravel corridors, "
            "cross dune saddles at low windward cols, and log baseline GNSS and compass bearings."
        )

    recommendations.append(
        "Wear full-seal ANSI Z87.1 foam-gasket sandstorm goggles, Kevlar high-cuff sand gaiters, "
        "and consume 1.0–1.5 L/hr of high-sodium electrolyte fluid during active dune/yardang travel."
    )

    return _AttrDict(
        {
            "slip_face_angle_deg": round(slip_face_angle_deg, 1),
            "wind_speed_kmh": round(wind_speed_kmh, 1),
            "corridor_width_m": round(corridor_width_m, 1),
            "sand_surface_temp_c": round(sand_surface_temp_c, 1),
            "visibility_m": round(visibility_m, 1),
            "avalanche_slip_safety_factor": avalanche_slip_safety_factor,
            "venturi_wind_acceleration_ratio": venturi_wind_acceleration_ratio,
            "triboelectric_gnss_noise_index": triboelectric_gnss_noise_index,
            "stride_sinkage_energy_multiplier": stride_sinkage_energy_multiplier,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "routing_strategy": routing_strategy,
            "progression_protocol": routing_strategy,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


# ---------------------------------------------------------------------------
# Intent Detection & Parameter Extraction
# ---------------------------------------------------------------------------

_YARDANG_NAVIGATION_KEYWORDS: tuple[str, ...] = (
    "yardang",
    "yardangs",
    "kalut",
    "kaluts",
    "star dune",
    "star-dune",
    "star dunes",
    "star-dunes",
    "mega-dune",
    "mega-dunes",
    "mega dune",
    "mega dunes",
    "slip-face",
    "slip face",
    "slip-faces",
    "slip faces",
    "dasht-e lut",
    "dasht e lut",
    "gandom beryan",
    "shahr-e lut",
    "badain jaran",
    "bilutu",
    "lop nur",
    "dunhuang yadan",
    "yadan",
    "barchanoid",
    "erg djourab",
    "borkou",
    "ennedi",
    "aeolian corridor",
    "aeolian corridors",
    "inter-kalut",
    "interdune gassi",
    "kalut-mega-yardang-corridor",
    "star-dune-multi-arm-slipface",
    "lacustrine-mudstone-yardang-fleet",
    "barchanoid-interdune-gassi",
    "triboelectric gnss",
    "venturi wind acceleration",
    "avalanche slip safety factor",
    "stride sinkage",
)

_YARDANG_NAVIGATION_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return policy",
    "return label",
    "shipping",
    "tracking number",
    "invoice",
    "cancel my order",
    # Sandboarding & North American dune sledding exclusions (sandboarding.py)
    "sandboard",
    "sandboarding",
    "sand board",
    "sand boarding",
    "dune gliding",
    "sand gliding",
    "dune sled",
    "sand sled",
    "sand wax",
    "speed wax",
    "carnauba",
    "great sand dunes",
    "florence bowl",
    "oregon dunes",
    "coral pink",
    "bruneau dunes",
    "white sands",
    # Arid playas & salt pan exclusions (salt_pan_navigation.py)
    "salt pan",
    "salt-pan",
    "salt flat",
    "salar de uyuni",
    "uyuni",
    "makgadikgadi",
    "chott el djerid",
    "bonneville salt",
    "halite crust",
    "playa crust",
    "fata morgana",
    # Desert trekking US routes (desert_trekking.py)
    "badwater",
    "telescope peak",
    "buckskin gulch",
    "mazatzal",
    "black rock desert",
    "mariscal canyon",
    # Slot canyon flash flood exclusions (flash_flood_slot.py)
    "flash flood",
    "flash-flood",
    "flood wave lag",
    "escape ledge",
    "wadi mujib",
    "little wild horse",
    # Scree running & volcanic tephra exclusions (scree_running.py, tephra_navigation.py)
    "scree running",
    "pea scree",
    "mount sneffels",
    "wastwater screes",
    "tephra",
    "lapilli",
    "cristobalite",
    "mount yasur",
    "acatenango",
    # Orienteering courses (orienteering.py)
    "harriman silvermine",
    "devils lake",
    "linville gorge",
    "chautauqua",
)

_EXPLICIT_YARDANG_OVERRIDES: tuple[str, ...] = (
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
    "borkou",
    "ennedi",
    "erg djourab",
    "barchanoid",
    "aeolian corridor",
    "yardang navigation",
    "star-dune",
    "mega-dune",
)


def is_yardang_navigation_query(query: str) -> bool:
    """Return True if the user query is asking about aeolian yardang & mega-dune slip-face star-dune desert navigation."""
    if not query or not query.strip():
        return False
    q_lower = _normalize_text(query.lower())

    if any(excl in q_lower for excl in _YARDANG_NAVIGATION_EXCLUSIONS):
        if not any(ovr in q_lower for ovr in _EXPLICIT_YARDANG_OVERRIDES):
            return False

    if any(kw in q_lower for kw in _YARDANG_NAVIGATION_KEYWORDS):
        return True

    # Contextual match for aeolian / interdune / barchan + navigation / corridor / wind / slip
    if any(
        term in q_lower
        for term in ("aeolian", "interdune", "barchan", "gassi", "shamal", "kara-buran")
    ) and any(
        ctx in q_lower
        for ctx in (
            "corridor",
            "navigation",
            "navigate",
            "venturi",
            "triboelectric",
            "slip",
            "avalanche",
            "dune",
            "dunes",
        )
    ):
        return True

    return False


def detect_yardang_navigation_intent(query: str) -> bool:
    """Alias for is_yardang_navigation_query()."""
    return is_yardang_navigation_query(query)


def extract_yardang_navigation_params(query: str) -> dict[str, Any]:
    """Extract yardang navigation site ID and numerical calculator parameters from a natural-language query."""
    q_lower = _normalize_text(query.lower())
    matched_site: dict[str, Any] | None = None

    if (
        "dasht-e lut" in q_lower
        or "dasht e lut" in q_lower
        or "kalut" in q_lower
        or "gandom beryan" in q_lower
        or "shahr-e lut" in q_lower
        or "shahdad" in q_lower
        or "iran" in q_lower
    ):
        matched_site = get_site_by_id("dasht-e-lut-kaluts-iran")
    elif (
        "badain jaran" in q_lower
        or "bilutu" in q_lower
        or "alxa" in q_lower
        or "alashan" in q_lower
        or "inner mongolia" in q_lower
        or "star-dune" in q_lower
        or "star dune" in q_lower
    ):
        matched_site = get_site_by_id("badain-jaran-star-dunes-china")
    elif (
        "lop nur" in q_lower
        or "dunhuang" in q_lower
        or "yadan" in q_lower
        or "kumtag" in q_lower
        or "sanlongsha" in q_lower
        or "xinjiang" in q_lower
    ):
        matched_site = get_site_by_id("lop-nur-yardang-xinjiang-china")
    elif (
        "borkou" in q_lower
        or "ennedi" in q_lower
        or "tibesti" in q_lower
        or "erg djourab" in q_lower
        or "djourab" in q_lower
        or "bodele" in q_lower
        or "bodélé" in query.lower()
        or "chad" in q_lower
        or "barchanoid" in q_lower
        or "gassi" in q_lower
    ):
        matched_site = get_site_by_id("borkou-ennedi-yardangs-chad")

    slip_angle = float(matched_site["default_slip_face_angle_deg"]) if matched_site else 32.0
    wind_kmh = float(matched_site["default_wind_speed_kmh"]) if matched_site else 45.0
    corridor_m = float(matched_site["default_corridor_width_m"]) if matched_site else 28.0
    temp_c = float(matched_site["default_sand_surface_temp_c"]) if matched_site else 42.0
    vis_m = float(matched_site["default_visibility_m"]) if matched_site else 400.0

    has_explicit_numbers = False

    angle_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:°|deg|degrees?)\s*(?:slip-?face(?:\s*angle)?|slip\s*angle|slope|angle|repose)?",
        q_lower,
    )
    if angle_match:
        val = float(angle_match.group(1))
        if 10.0 <= val <= 42.0:
            slip_angle = val
            has_explicit_numbers = True

    wind_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:km/h|kmh|kph)\s*(?:wind(?:\s*speed)?|venturi|gusts?)?",
        q_lower,
    )
    if wind_match:
        val = float(wind_match.group(1))
        if 0.0 <= val <= 130.0:
            wind_kmh = val
            has_explicit_numbers = True

    corridor_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:corridor(?:\s*width)?|gassi|trough|alley|width|constriction)",
        q_lower,
    )
    if corridor_match:
        val = float(corridor_match.group(1))
        if 2.0 <= val <= 250.0:
            corridor_m = val
            has_explicit_numbers = True

    temp_match = re.search(
        r"(\d+(?:\.\d+)?)\s*°?\s*c\b\s*(?:sand(?:\s*surface)?(?:\s*temp(?:erature)?)?|surface(?:\s*temp(?:erature)?)?|skin\s*temp)?",
        q_lower,
    )
    if temp_match:
        val = float(temp_match.group(1))
        if 10.0 <= val <= 72.0:
            temp_c = val
            has_explicit_numbers = True

    vis_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:visibility|dust\s*visibility|sandstorm\s*visibility|visual\s*range)",
        q_lower,
    )
    if vis_match:
        val = float(vis_match.group(1))
        if 5.0 <= val <= 2000.0:
            vis_m = val
            has_explicit_numbers = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "matched_site": matched_site,
        "slip_face_angle_deg": slip_angle,
        "wind_speed_kmh": wind_kmh,
        "corridor_width_m": corridor_m,
        "sand_surface_temp_c": temp_c,
        "visibility_m": vis_m,
        "has_explicit_numbers": has_explicit_numbers,
    }


def format_yardang_navigation_response(query: str) -> dict[str, Any]:
    """Build a structured response dictionary for an aeolian yardang & mega-dune slip-face navigation query."""
    params: dict[str, Any] = extract_yardang_navigation_params(query)
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = params["matched_site"]

    calc_result: dict[str, Any] = calculate_yardang_navigation(
        slip_face_angle_deg=float(params["slip_face_angle_deg"]),
        wind_speed_kmh=float(params["wind_speed_kmh"]),
        corridor_width_m=float(params["corridor_width_m"]),
        sand_surface_temp_c=float(params["sand_surface_temp_c"]),
        visibility_m=float(params["visibility_m"]),
    )

    is_calc_request = bool(
        params["has_explicit_numbers"]
        or any(
            w in q_lower
            for w in (
                "calculate",
                "calculator",
                "safety factor",
                "venturi",
                "acceleration ratio",
                "triboelectric",
                "gnss noise",
                "sinkage",
                "energy multiplier",
            )
        )
    )

    if is_calc_request:
        action = "yardang_navigation_calculated"
    elif matched_site is not None:
        action = "yardang_navigation_lookup"
    else:
        action = "yardang_navigation_info"

    site_summary = (
        f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']} — "
        f"morphology: `{matched_site['morphology']}`, difficulty: `{matched_site['difficulty']}`): "
        f"{matched_site['routing_strategy']} "
        if matched_site
        else "Aeolian yardang corridors and mega-dune slip-face star-dune desert navigation require "
        "strict evaluation of leeward angle-of-repose grainflow avalanche stability, inter-yardang "
        "Venturi wind-tunnel acceleration, triboelectric dust GNSS noise, and thermal sand sinkage. "
    )

    answer = (
        f"{site_summary}"
        f"For a **{calc_result['slip_face_angle_deg']}° slip-face angle** and "
        f"**{calc_result['wind_speed_kmh']} km/h wind speed** inside a "
        f"**{calc_result['corridor_width_m']} m corridor** "
        f"({calc_result['sand_surface_temp_c']}°C sand surface temp, "
        f"{calc_result['visibility_m']} m visibility), "
        f"the avalanche slip safety factor is **{calc_result['avalanche_slip_safety_factor']}**, "
        f"Venturi wind acceleration ratio is **{calc_result['venturi_wind_acceleration_ratio']}x**, "
        f"triboelectric GNSS noise index is **{calc_result['triboelectric_gnss_noise_index']}**, "
        f"stride sinkage energy multiplier is **{calc_result['stride_sinkage_energy_multiplier']}x**, "
        f"and risk level is **{calc_result['risk_level'].upper()}** "
        f"(routing strategy: `{calc_result['routing_strategy']}`)."
    )

    return _AttrDict(
        {
            "action": action,
            "answer": answer,
            "matched_site": matched_site,
            "calculation": calc_result,
            "sites": YARDANG_DESERT_SITES,
            "checklist": YARDANG_NAVIGATION_GEAR_CHECKLIST,
        }
    )


def build_yardang_navigation_prompt(query: str = "") -> str:
    """Build system prompt context for LLM calls involving aeolian yardang & mega-dune slip-face navigation."""
    info: dict[str, Any] = (
        format_yardang_navigation_response(query)
        if query
        else format_yardang_navigation_response(
            "aeolian yardang corridor and mega-dune slip-face star-dune navigation"
        )
    )
    calc: dict[str, Any] = info["calculation"]
    matched_site: dict[str, Any] | None = info.get("matched_site")

    lines: list[str] = [
        "### Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation Context",
        "- **Aeolian Desert Morphologies**: Kalut mega-yardang corridors (e.g., Dasht-e Lut Gandom Beryan & Shahr-e Lut, Iran), "
        "star-dune multi-arm slipfaces (e.g., Badain Jaran Bilutu Peak & Interdune Lakes, China), "
        "lacustrine mudstone yardang fleets (e.g., Lop Nur & Dunhuang Yadan Fleet, China), and "
        "barchanoid interdune gassi wind-tunnels (e.g., Borkou–Tibesti Yardangs & Erg Djourab, Chad).",
        f"- **Calculated Yardang & Mega-Dune Physics**: SlipFaceAngle={calc['slip_face_angle_deg']}°, "
        f"WindSpeed={calc['wind_speed_kmh']}km/h, CorridorWidth={calc['corridor_width_m']}m, "
        f"SandSurfaceTemp={calc['sand_surface_temp_c']}°C, Visibility={calc['visibility_m']}m -> "
        f"AvalancheSlipSafetyFactor={calc['avalanche_slip_safety_factor']}, "
        f"VenturiWindAccelerationRatio={calc['venturi_wind_acceleration_ratio']}x, "
        f"TriboelectricGNSSNoiseIndex={calc['triboelectric_gnss_noise_index']}, "
        f"StrideSinkageEnergyMultiplier={calc['stride_sinkage_energy_multiplier']}x, "
        f"Risk={calc['risk_level']}, RoutingStrategy={calc['routing_strategy']}.",
    ]
    if matched_site:
        lines.append(
            f"- **Focused Yardang/Mega-Dune Site**: {matched_site['name']} ({matched_site['country']}) — "
            f"Primary Hazard: {matched_site['primary_hazard']} | Routing Strategy: {matched_site['routing_strategy']}"
        )
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response dictionary for a yardang navigation query."""
    info: dict[str, Any] = format_yardang_navigation_response(query)
    return {
        "answer": info["answer"],
        "yardang_navigation_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[str, None, None]:
    """Yield SSE stream chunks for a yardang navigation query."""
    info: dict[str, Any] = format_yardang_navigation_response(query)
    yield f"data: {json.dumps({'action': info['action'], 'yardang_navigation_info': info})}\n\n"
    yield f"data: {json.dumps({'content': info['answer'], 'answer': info['answer']})}\n\n"
    yield "data: [DONE]\n\n"
