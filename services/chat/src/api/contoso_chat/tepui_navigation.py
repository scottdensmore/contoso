"""Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation Guide module.

Provides domain data, physics-based Precambrian orthoquartzite cyanobacteria biofilm traction
modeling, Brocchinia/peat fissure bridge collapse risk estimation, orographic cloud blackout
indices, humic blackwater stream surge multipliers, mandatory safety gear checklists, and
intent detection for Guiana Shield table-mountain tepui plateaus.
"""

from __future__ import annotations

import json
import re
from collections.abc import Generator
from typing import Any, Literal

TepuiMorphology = Literal[
    "pseudokarst-fissure-grid",
    "brocchinia-bog-sinkhole-mesa",
    "orthoquartzite-pinnacle-plateau",
    "proterozoic-escarpment-ramp",
]
TepuiDifficulty = Literal["moderate", "challenging", "extreme"]
TepuiRiskLevel = Literal["low", "moderate", "high", "critical"]
TepuiProgressionProtocol = Literal[
    "protocol-1-cairn-corridor-walk",
    "protocol-2-probed-fissure-belay",
    "protocol-3-rope-bridged-chasm-traverse",
    "protocol-4-emergency-overhang-bivouac-lockout",
]


class _AttrDict(dict[str, Any]):
    """Dictionary subclass supporting attribute-style read access."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc


# ---------------------------------------------------------------------------
# Reference Table-Mountain Quartzite Tepui & High-Plateau Sites (4 Sites)
# ---------------------------------------------------------------------------

TEPUI_PLATEAU_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "mount-roraima-maverick-plateau",
            "name": "Mount Roraima Maverick Summit & Labyrinth Pseudokarst Plateau",
            "country": "Venezuela",
            "region": "Gran Sabana, Canaima National Park (Venezuela / Brazil / Guyana Triple Point)",
            "elevation": "2,723 m El Paso Ramp rim to 2,810 m Maverick Rock summit plateau",
            "elevation_m": 2810,
            "morphology": "pseudokarst-fissure-grid",
            "difficulty": "challenging",
            "default_cyanobacteria_biofilm_pct": 68.0,
            "default_fissure_gap_width_m": 1.6,
            "default_orographic_rain_mm_hr": 28.0,
            "default_cloud_visibility_m": 35.0,
            "default_slab_slope_deg": 14.0,
            "primary_hazard": (
                "Slick black cyanobacteria-coated Precambrian orthoquartzite slabs, orthogonal "
                "pseudokarst joint fissures dropping 30–80 m into subterranean abysses, and sudden "
                "15 m visibility orographic cloud blackouts."
            ),
            "progression_protocol": (
                "Follow stacked quartzite cairn lines from La Rampa across the Labyrinth using "
                "tungsten-studded or felt-hybrid Vibram Megagrip boots; belay unbridged fissure "
                "leaps >1.2 m with static tethers."
            ),
            "navigation_protocol": (
                "Record dual-frequency GNSS waypoints and mirror-compass back-bearings at every "
                "rock-hotel overhang ('El Hotel') before afternoon orographic cloud-banks erase "
                "visual horizon cues."
            ),
            "traversal_protocol": (
                "Follow quartzite cairn corridors across dark cyanobacteria slabs and belay "
                "fissure crossings exceeding 1.2 m."
            ),
            "field_notes": (
                "31 km² Precambrian Roraima Group orthoquartzite table mountain where 1.8-billion-year-old "
                "silica dissolution has sculpted 'The Labyrinth', crystal valleys, and endemic "
                "Oreophrynella black pebble toads."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "auyan-tepui-churun-rim-venezuela",
            "name": "Auyán-Tepui Devil's Canyon & Churún Orthoquartzite Mesa",
            "country": "Venezuela",
            "region": "Canaima Western Sector, Bolívar State, Guiana Shield",
            "elevation": "1,650 m El Peñón ramp to 2,450 m Churún-Merú (Angel Falls) rim plateau",
            "elevation_m": 2450,
            "morphology": "brocchinia-bog-sinkhole-mesa",
            "difficulty": "extreme",
            "default_cyanobacteria_biofilm_pct": 82.0,
            "default_fissure_gap_width_m": 2.4,
            "default_orographic_rain_mm_hr": 48.0,
            "default_cloud_visibility_m": 18.0,
            "default_slab_slope_deg": 19.0,
            "primary_hazard": (
                "Flash-flooding humic acid blackwater streams feeding Kerepakupai Merú (Angel Falls), "
                "concealed peat-and-Brocchinia bromeliad root bridges over 100 m collapse shafts, and "
                "torrential >45 mm/hr convective downpours."
            ),
            "progression_protocol": (
                "Probe every Brocchinia reducta and Stegolepis bog mat with a graduated carbon sounding "
                "pole to verify solid orthoquartzite bedrock before weighting; rig high-line tensioned "
                "ropes across swollen blackwater gorges."
            ),
            "navigation_protocol": (
                "Halt plateau progression and shelter beneath dry quartzite boulder overhangs "
                "('El Libertador' / 'El Peñón') whenever orographic rainfall exceeds 35 mm/hr or "
                "visibility drops below 20 m."
            ),
            "traversal_protocol": (
                "Probe Brocchinia bog mats for concealed pseudokarst shafts and never ford "
                "blackwater streams during convective rain surges."
            ),
            "field_notes": (
                "700 km² heart-shaped giant table mountain cleaved by the 1,500 m deep Cañón del Diablo, "
                "feeding the world's highest uninterrupted waterfall (979 m Angel Falls) from saturated "
                "summit bogs."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "kukenan-matawi-tepui-venezuela",
            "name": "Kukenán Matawi Tepui Proterozoic Escarpment & Summit Chasm",
            "country": "Venezuela",
            "region": "Eastern Gran Sabana, Canaima National Park, Bolívar State",
            "elevation": "2,600 m Southern Ramp breach to 2,680 m Matawi summit plateau",
            "elevation_m": 2680,
            "morphology": "orthoquartzite-pinnacle-plateau",
            "difficulty": "extreme",
            "default_cyanobacteria_biofilm_pct": 88.0,
            "default_fissure_gap_width_m": 3.2,
            "default_orographic_rain_mm_hr": 52.0,
            "default_cloud_visibility_m": 15.0,
            "default_slab_slope_deg": 24.0,
            "primary_hazard": (
                "2–5 m wide vertical tectonic fissures bisecting the summit into isolated rock islands, "
                "hyper-slick black Stigonema cyanobacteria crusts on 24° inclined ramps, and severe "
                "wind-driven cloud whiteouts."
            ),
            "progression_protocol": (
                "Deploy 35 m 8.5 mm hydrophobic static rope and removable camming chocks/hexes in "
                "parallel-sided quartzite cracks to protect exposed ramp scrambles and multi-meter "
                "chasm crossings."
            ),
            "navigation_protocol": (
                "Maintain strict rope-team spacing and lay high-visibility reflective silicone cairn "
                "markers at chasm dead-ends to guarantee retreat back to the single southern descent chimney."
            ),
            "traversal_protocol": (
                "Belay all inclined cyanobacteria slab ramps and multi-meter chasm bridges using "
                "natural quartzite chockstones and removable cams."
            ),
            "field_notes": (
                "Known to the Pemón indigenous people as Matawi-tepui ('Place of Death'), rising in the "
                "Eastern Tepuis chain with a 1,000 m vertical sheer wall and famous for the 674 m Kukenán Waterfall."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "chiribiquete-tepui-mesas-colombia",
            "name": "Serranía de Chiribiquete Quartzite Table-Mountain Mesas",
            "country": "Colombia",
            "region": "Guaviare & Caquetá Departments, Colombian Amazon Guiana Shield Outlier",
            "elevation": "450 m Ajaju basin floor to 1,000 m Araracuara orthoquartzite table-mountain crown",
            "elevation_m": 950,
            "morphology": "proterozoic-escarpment-ramp",
            "difficulty": "moderate",
            "default_cyanobacteria_biofilm_pct": 42.0,
            "default_fissure_gap_width_m": 0.9,
            "default_orographic_rain_mm_hr": 18.0,
            "default_cloud_visibility_m": 75.0,
            "default_slab_slope_deg": 10.0,
            "primary_hazard": (
                "Maze-like Precambrian Araracuara sandstone-quartzite corridors, seasonal blackwater "
                "sheet runoff across low-angle domes, and fragile sclerophyllous Vellozia and Bonnetia "
                "shrub thickets hiding shallow joint slots."
            ),
            "progression_protocol": (
                "Walk on clean, dry pale-pink quartzite ribs rather than dark algal drainage runnels; "
                "step directly onto exposed bedrock ledges and avoid crushing ancient rock-shelter "
                "overhang floors."
            ),
            "navigation_protocol": (
                "Navigate along structural escarpment rim azimuths using barometric altimeter and "
                "compass bearings between prominent mushroom-shaped quartzite hoodoo towers."
            ),
            "traversal_protocol": (
                "Follow dry pale-pink quartzite bedrock ribs along escarpment rim azimuths and "
                "avoid slick dark algal drainage channels."
            ),
            "field_notes": (
                "Westernmost Guiana Shield tepui archipelago ('Maloca of the Jaguar'), where "
                "Palaeo-Proterozoic quartz arenite mesas rise above pristine Amazonian rainforest."
            ),
        }
    ),
]

TEPUI_NAVIGATION_SITES: list[dict[str, Any]] = TEPUI_PLATEAU_SITES
TEPUI_SITES: list[dict[str, Any]] = TEPUI_PLATEAU_SITES


# ---------------------------------------------------------------------------
# Mandatory 6-Item Table-Mountain Quartzite Tepui Navigation Gear Checklist
# ---------------------------------------------------------------------------

TEPUI_NAVIGATION_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "Tungsten-Carbide Studded & Felt-Hybrid Vibram Megagrip Quartzite Approach Boots",
        "category": "biofilm_slab_traction",
        "priority": "essential",
        "rationale": (
            "Bites through mucilaginous black Stigonema cyanobacteria biofilms coating wet "
            "Precambrian orthoquartzite ramps where standard rubber soles hydroplane."
        ),
    },
    {
        "item": "Graduated 2.8m Carbon-Fiber Pseudokarst Fissure & Brocchinia Bog Sounding Pole",
        "category": "fissure_bridge_probing",
        "priority": "essential",
        "rationale": (
            "Tests the structural integrity of suspended peat, Stegolepis, and Brocchinia root "
            "mats concealing 50+ meter vertical pseudokarst solution shafts."
        ),
    },
    {
        "item": "35m 8.5mm Hydrophobic Static Aramid-Sheath Chasm Rope & Removable Quartzite Cam/Hex Rack",
        "category": "chasm_belay_and_tyrolean",
        "priority": "essential",
        "rationale": (
            "Protects multi-meter fissure leaps, inclined wet slab scrambles, and swollen "
            "blackwater gorge Tyrolean traverses using parallel-sided quartzite cracks."
        ),
    },
    {
        "item": "Dual-Frequency L1/L5 Multi-GNSS Receiver with Barometric Altimeter & Sighting Mirror Compass",
        "category": "orographic_whiteout_navigation",
        "priority": "essential",
        "rationale": (
            "Prevents fatal dead-end entrapment inside labyrinthine quartzite turret corridors "
            "when instantaneous 10 m visibility orographic cloud blackouts strike."
        ),
    },
    {
        "item": "28,000mm Hydrostatic 3-Layer Gore-Tex Pro Storm Shell & Submersible IPX8 Dry-Bag Pack Liner",
        "category": "torrential_deluge_protection",
        "priority": "essential",
        "rationale": (
            "Shields against hypothermia and gear saturation during 40–80 mm/hr equatorial "
            "orographic cloudbursts and wind-driven waterfall spray."
        ),
    },
    {
        "item": "Sealed Wag-Bag Human Waste Containment System & 1.5-Micron Humic Blackwater Hollow-Fiber Filter",
        "category": "tepui_environmental_stewardship",
        "priority": "essential",
        "rationale": (
            "Preserves oligotrophic Precambrian summit ecosystems with zero soil decomposition "
            "while safely filtering tannin-rich humic acid surface streams."
        ),
    },
]

TEPUI_GEAR_CHECKLIST: list[dict[str, Any]] = TEPUI_NAVIGATION_GEAR_CHECKLIST


# ---------------------------------------------------------------------------
# Catalog Accessors & Filtering
# ---------------------------------------------------------------------------


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 reference table-mountain quartzite tepui plateau sites."""
    return list(TEPUI_PLATEAU_SITES)


def get_all_tepui_navigation_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Return a single table-mountain quartzite tepui site by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in TEPUI_PLATEAU_SITES:
        if str(site["id"]).lower() == target:
            return site
    return None


def get_tepui_navigation_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def _normalize_accents(text: str) -> str:
    return (
        text.replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
        .replace("ñ", "n")
    )


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """Filter table-mountain quartzite tepui sites by country, morphology, difficulty, or free-text search."""
    results: list[dict[str, Any]] = list(TEPUI_PLATEAU_SITES)

    if country:
        c_lower = _normalize_accents(country.strip().lower())
        results = [
            s
            for s in results
            if c_lower in _normalize_accents(str(s["country"]).lower())
        ]

    if morphology:
        m_lower = morphology.strip().lower().replace("_", "-")
        results = [s for s in results if str(s["morphology"]).lower() == m_lower]

    if difficulty:
        d_lower = difficulty.strip().lower()
        results = [s for s in results if str(s["difficulty"]).lower() == d_lower]

    if search:
        q_lower = _normalize_accents(search.strip().lower())
        results = [
            s
            for s in results
            if q_lower in _normalize_accents(str(s["name"]).lower())
            or q_lower in _normalize_accents(str(s["country"]).lower())
            or q_lower in _normalize_accents(str(s["region"]).lower())
            or q_lower in _normalize_accents(str(s["morphology"]).lower())
            or q_lower in _normalize_accents(str(s["field_notes"]).lower())
            or q_lower in _normalize_accents(str(s["id"]).lower())
        ]

    return results


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6-item mandatory table-mountain quartzite tepui navigation gear checklist."""
    return list(TEPUI_NAVIGATION_GEAR_CHECKLIST)


# ---------------------------------------------------------------------------
# Physics-Based Table-Mountain Quartzite Tepui & Fissure Calculator
# ---------------------------------------------------------------------------


def calculate_tepui_navigation(
    cyanobacteria_biofilm_pct: float = 65.0,
    fissure_gap_width_m: float = 1.6,
    orographic_rain_mm_hr: float = 25.0,
    cloud_visibility_m: float = 45.0,
    slab_slope_deg: float = 14.0,
) -> dict[str, Any]:
    """Calculate biofilm traction coefficient, fissure bridge collapse risk %, orographic blackout index, and blackwater stream surge multiplier.

    Parameters
    ----------
    cyanobacteria_biofilm_pct:
        Surface coverage of dark Stigonema cyanobacteria biofilm on orthoquartzite slabs in percent [0, 100].
    fissure_gap_width_m:
        Mean horizontal span across pseudokarst joint fissures or chasm bridges in meters [0.2, 6.0].
    orographic_rain_mm_hr:
        Orographic rainfall intensity across the summit plateau in mm/hr [0, 90].
    cloud_visibility_m:
        Horizontal visibility in orographic cloud/fog across the labyrinth in meters [3, 500].
    slab_slope_deg:
        Inclination angle of orthoquartzite bedrock ramps/slabs in degrees [0, 45].
    """
    if not (0.0 <= cyanobacteria_biofilm_pct <= 100.0):
        raise ValueError("cyanobacteria_biofilm_pct must be between 0 and 100 percent")
    if not (0.2 <= fissure_gap_width_m <= 6.0):
        raise ValueError("fissure_gap_width_m must be between 0.2 and 6.0 meters")
    if not (0.0 <= orographic_rain_mm_hr <= 90.0):
        raise ValueError("orographic_rain_mm_hr must be between 0 and 90 mm/hr")
    if not (3.0 <= cloud_visibility_m <= 500.0):
        raise ValueError("cloud_visibility_m must be between 3 and 500 meters")
    if not (0.0 <= slab_slope_deg <= 45.0):
        raise ValueError("slab_slope_deg must be between 0 and 45 degrees")

    # 1. Orthoquartzite cyanobacteria biofilm traction coefficient (0.10 to 0.85)
    # Clean dry quartzite has high friction (~0.82); wet mucilaginous Stigonema biofilm + slope reduces effective traction
    raw_traction = (
        0.82
        - (cyanobacteria_biofilm_pct * 0.0042)
        - (orographic_rain_mm_hr * 0.0026)
        - (slab_slope_deg * 0.0045)
    )
    biofilm_traction_coefficient = round(min(0.85, max(0.10, raw_traction)), 2)

    # 2. Pseudokarst fissure / Brocchinia root-bridge collapse & slip-in risk (1.0 to 99.0%)
    raw_collapse_risk = (
        (fissure_gap_width_m * 14.5)
        + (orographic_rain_mm_hr * 0.36)
        + (cyanobacteria_biofilm_pct * 0.16)
        + (slab_slope_deg * 0.35)
    )
    fissure_bridge_collapse_risk_pct = round(min(99.0, max(1.0, raw_collapse_risk)), 1)

    # 3. Orographic cloud whiteout & labyrinth disorientation blackout index (0.5 to 10.0)
    raw_blackout = (
        (85.0 / max(8.0, cloud_visibility_m))
        + (orographic_rain_mm_hr * 0.045)
        + (fissure_gap_width_m * 0.25)
    )
    orographic_blackout_index = round(min(10.0, max(0.5, raw_blackout)), 2)

    # 4. Impervious orthoquartzite basin blackwater stream surge multiplier (1.0 to 12.0x)
    raw_surge = (
        1.0
        + (orographic_rain_mm_hr * 0.082)
        + (slab_slope_deg * 0.038)
        + (cyanobacteria_biofilm_pct * 0.006)
    )
    blackwater_stream_surge_multiplier = round(min(12.0, max(1.0, raw_surge)), 2)

    # 5. Classify Risk Level & Progression Protocol
    warnings: list[str] = []
    recommendations: list[str] = []

    if (
        biofilm_traction_coefficient <= 0.24
        or fissure_bridge_collapse_risk_pct >= 74.0
        or orographic_blackout_index >= 7.5
        or orographic_rain_mm_hr >= 62.0
        or cloud_visibility_m <= 11.0
        or fissure_gap_width_m >= 4.2
        or slab_slope_deg >= 32.0
    ):
        risk_level: TepuiRiskLevel = "critical"
        progression_protocol: TepuiProgressionProtocol = (
            "protocol-4-emergency-overhang-bivouac-lockout"
        )
    elif (
        biofilm_traction_coefficient <= 0.36
        or fissure_bridge_collapse_risk_pct >= 48.0
        or orographic_blackout_index >= 5.0
        or orographic_rain_mm_hr >= 36.0
        or cloud_visibility_m <= 24.0
        or fissure_gap_width_m >= 2.1
        or slab_slope_deg >= 20.0
    ):
        risk_level = "high"
        progression_protocol = "protocol-3-rope-bridged-chasm-traverse"
    elif (
        biofilm_traction_coefficient <= 0.54
        or fissure_bridge_collapse_risk_pct >= 26.0
        or orographic_blackout_index >= 2.5
        or orographic_rain_mm_hr >= 15.0
        or cloud_visibility_m <= 65.0
        or fissure_gap_width_m >= 1.1
        or slab_slope_deg >= 12.0
    ):
        risk_level = "moderate"
        progression_protocol = "protocol-2-probed-fissure-belay"
    else:
        risk_level = "low"
        progression_protocol = "protocol-1-cairn-corridor-walk"

    # Populate actionable warnings
    if biofilm_traction_coefficient <= 0.36 or cyanobacteria_biofilm_pct >= 70.0:
        warnings.append(
            f"HYPER-SLICK CYANOBACTERIA BIOFILM SLAB HAZARD ({cyanobacteria_biofilm_pct:.0f}% biofilm coverage, "
            f"traction coefficient {biofilm_traction_coefficient:.2f} on {slab_slope_deg:.1f}° slab): "
            "Wet Stigonema algal crusts on Precambrian orthoquartzite behave like black ice near vertical fissure rims."
        )
    if fissure_bridge_collapse_risk_pct >= 48.0 or fissure_gap_width_m >= 2.0:
        warnings.append(
            f"PSEUDOKARST FISSURE & BROCCHINIA ROOT-BRIDGE COLLAPSE RISK ({fissure_bridge_collapse_risk_pct:.1f}%, "
            f"{fissure_gap_width_m:.1f} m gap width): Suspended peat and bromeliad mats over deep tectonic "
            "solution shafts can shear without warning under body weight."
        )
    if orographic_blackout_index >= 5.0 or cloud_visibility_m <= 25.0:
        warnings.append(
            f"OROGRAPHIC CLOUD WHITEOUT & LABYRINTH BLACKOUT (visibility {cloud_visibility_m:.0f} m, "
            f"blackout index {orographic_blackout_index:.2f}): Dense adiabatic fog erases horizon landmarks "
            "across identical orthoquartzite turret avenues."
        )
    if blackwater_stream_surge_multiplier >= 4.0 or orographic_rain_mm_hr >= 35.0:
        warnings.append(
            f"BLACKWATER SHEET-FLOOD & WATERFALL SURGE ({orographic_rain_mm_hr:.1f} mm/hr rain, "
            f"{blackwater_stream_surge_multiplier:.2f}x stream surge): Impervious quartzite basins channel "
            "100% of rainfall directly into flash-flooding humic gorges and sinkhole drains."
        )

    # Populate technical recommendations
    if progression_protocol == "protocol-4-emergency-overhang-bivouac-lockout":
        recommendations.append(
            "HALT PLATEAU PROGRESSION IMMEDIATELY: Shelter beneath an established orthoquartzite boulder "
            "overhang ('El Hotel') until rainfall drops below 35 mm/hr and cloud visibility exceeds 20 m."
        )
        recommendations.append(
            "Do not attempt unbridged fissure leaps or ford blackwater drainage channels during active "
            f"{blackwater_stream_surge_multiplier:.2f}x surge conditions."
        )
    elif progression_protocol == "protocol-3-rope-bridged-chasm-traverse":
        recommendations.append(
            "Rig a 35 m 8.5 mm hydrophobic static rope with removable camming chocks/hexes in parallel "
            "quartzite cracks to belay all fissure crossings and inclined cyanobacteria slab ramps."
        )
        recommendations.append(
            "Probe every Brocchinia and Stegolepis bog margin to solid bedrock with a graduated carbon "
            "sounding pole before committing weight."
        )
    elif progression_protocol == "protocol-2-probed-fissure-belay":
        recommendations.append(
            "Step on pale-pink clean quartz arenite grains rather than dark cyanobacteria drainage streaks; "
            "spot or tether across fissures wider than 1.0 m."
        )
        recommendations.append(
            "Log L1/L5 multi-GNSS waypoints and mirror-compass back-bearings at each quartzite cairn "
            "junction before afternoon cloud buildup."
        )
    else:
        recommendations.append(
            "Standard cairn-corridor plateau walk: follow established quartzite cairn alignments, "
            "avoid stepping on fragile Brocchinia bog rosettes, and pack out 100% of waste in sealed wag-bags."
        )

    recommendations.append(
        "Wear tungsten-studded or felt-hybrid Vibram Megagrip boots and filter all humic blackwater "
        "through a 1.5-micron hollow-fiber membrane before consumption."
    )

    return _AttrDict(
        {
            "cyanobacteria_biofilm_pct": round(cyanobacteria_biofilm_pct, 1),
            "fissure_gap_width_m": round(fissure_gap_width_m, 2),
            "orographic_rain_mm_hr": round(orographic_rain_mm_hr, 1),
            "cloud_visibility_m": round(cloud_visibility_m, 1),
            "slab_slope_deg": round(slab_slope_deg, 1),
            "biofilm_traction_coefficient": biofilm_traction_coefficient,
            "fissure_bridge_collapse_risk_pct": fissure_bridge_collapse_risk_pct,
            "orographic_blackout_index": orographic_blackout_index,
            "blackwater_stream_surge_multiplier": blackwater_stream_surge_multiplier,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "progression_protocol": progression_protocol,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


# ---------------------------------------------------------------------------
# Intent Detection & Parameter Extraction
# ---------------------------------------------------------------------------

_TEPUI_NAVIGATION_KEYWORDS: tuple[str, ...] = (
    "tepui",
    "tepuis",
    "roraima",
    "mount roraima",
    "monte roraima",
    "maverick rock",
    "maverick plateau",
    "la rampa",
    "auyan-tepui",
    "auyán-tepui",
    "auyan tepui",
    "auyán tepui",
    "auyan",
    "kukenan",
    "kukenán",
    "matawi-tepui",
    "matawi tepui",
    "chiribiquete",
    "gran sabana",
    "orthoquartzite",
    "pseudokarst fissure",
    "pseudokarst plateau",
    "pseudokarst-fissure-grid",
    "brocchinia-bog-sinkhole-mesa",
    "orthoquartzite-pinnacle-plateau",
    "proterozoic-escarpment-ramp",
    "table-mountain quartzite",
    "table mountain quartzite",
    "brocchinia",
    "stegolepis",
    "oreophrynella",
    "cyanobacteria biofilm",
    "biofilm traction",
    "fissure bridge collapse",
    "orographic blackout",
    "blackwater stream surge",
)

_TEPUI_NAVIGATION_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return policy",
    "return label",
    "shipping",
    "tracking number",
    "invoice",
    "cancel my order",
    # Karst tiankeng giant collapse sinkhole exclusions (tiankeng_descent.py)
    "tiankeng",
    "giant sinkhole",
    "collapse sinkhole",
    "mega-doline",
    "collapse-mega-doline",
    "xiaozhai",
    "dashiwei",
    "golondrinas",
    "sarisarinama",
    "sarisariñama",
    "sima humboldt",
    "sima mayor",
    "tepui sinkhole",
    # Tropical tsingy labyrinth exclusions (tsingy_labyrinth.py)
    "tsingy",
    "bemaraha",
    "andamozavaky",
    "ankarana",
    "rillenkarren",
    "razor limestone",
    "razor-limestone",
    "gunung api",
    "mulu pinnacles",
    "shilin",
    "naigu",
    "stone forest",
    "diaclase",
    "pinnacle karst",
    # High-altitude Andean paramo exclusions (paramo_navigation.py)
    "paramo",
    "páramo",
    "superparamo",
    "frailejon",
    "frailejón",
    "frailejones",
    "espeletia",
    "turbera",
    "distichia",
    "plantago rigida",
    "sumapaz",
    "el angel",
    "panteneras",
    # Big wall & classical rock climbing exclusions (big_wall.py, climbing.py)
    "el capitan",
    "the nose",
    "half dome",
    "portaledge",
    "hauling pig",
    "index lower town wall",
    "castle rock",
    "vantage feathers",
    "liberty bell",
    "smith rock",
    "trad climbing",
)

_EXPLICIT_TEPUI_PLATEAU_OVERRIDES: tuple[str, ...] = (
    "tepui navigation",
    "plateau navigation",
    "mount roraima",
    "roraima",
    "auyan-tepui",
    "auyán-tepui",
    "auyan tepui",
    "kukenan",
    "kukenán",
    "chiribiquete",
    "cyanobacteria biofilm",
    "brocchinia",
    "pseudokarst fissure",
    "table-mountain quartzite",
)


def is_tepui_navigation_query(query: str) -> bool:
    """Return True if the user query is asking about table-mountain quartzite tepui & sandstone fissure navigation."""
    if not query or not query.strip():
        return False
    q_lower = query.lower()

    if any(excl in q_lower for excl in _TEPUI_NAVIGATION_EXCLUSIONS):
        if not any(ovr in q_lower for ovr in _EXPLICIT_TEPUI_PLATEAU_OVERRIDES):
            return False

    if any(kw in q_lower for kw in _TEPUI_NAVIGATION_KEYWORDS):
        return True

    # Broad quartzite/table-mountain match when paired with fissure/biofilm/guiana/plateau context
    if (
        "quartzite" in q_lower
        or "table mountain" in q_lower
        or "table-mountain" in q_lower
        or "guiana shield" in q_lower
    ) and any(
        ctx in q_lower
        for ctx in (
            "fissure",
            "fissures",
            "biofilm",
            "cyanobacteria",
            "pseudokarst",
            "blackwater",
            "venezuela",
            "canaima",
            "plateau",
        )
    ):
        return True

    return False


def detect_tepui_navigation_intent(query: str) -> bool:
    """Alias for is_tepui_navigation_query()."""
    return is_tepui_navigation_query(query)


def extract_tepui_navigation_params(query: str) -> dict[str, Any]:
    """Extract tepui navigation site ID and numerical calculator parameters from a natural-language query."""
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = None

    if (
        "roraima" in q_lower
        or "maverick" in q_lower
        or "la rampa" in q_lower
        or "el paso" in q_lower
    ):
        matched_site = get_site_by_id("mount-roraima-maverick-plateau")
    elif (
        "auyan" in q_lower
        or "auyán" in q_lower
        or "churun" in q_lower
        or "churún" in q_lower
        or "angel falls" in q_lower
        or "kerepakupai" in q_lower
        or "devil's canyon" in q_lower
        or "canon del diablo" in q_lower
        or "cañón del diablo" in q_lower
    ):
        matched_site = get_site_by_id("auyan-tepui-churun-rim-venezuela")
    elif (
        "kukenan" in q_lower
        or "kukenán" in q_lower
        or "matawi" in q_lower
    ):
        matched_site = get_site_by_id("kukenan-matawi-tepui-venezuela")
    elif (
        "chiribiquete" in q_lower
        or "araracuara" in q_lower
        or "guaviare" in q_lower
        or "caqueta" in q_lower
        or "caquetá" in q_lower
        or "colombia" in q_lower
    ):
        matched_site = get_site_by_id("chiribiquete-tepui-mesas-colombia")
    elif "venezuela" in q_lower or "gran sabana" in q_lower or "canaima" in q_lower:
        matched_site = get_site_by_id("mount-roraima-maverick-plateau")

    biofilm_pct = (
        float(matched_site["default_cyanobacteria_biofilm_pct"])
        if matched_site
        else 65.0
    )
    gap_m = (
        float(matched_site["default_fissure_gap_width_m"]) if matched_site else 1.6
    )
    rain_mm_hr = (
        float(matched_site["default_orographic_rain_mm_hr"]) if matched_site else 25.0
    )
    vis_m = (
        float(matched_site["default_cloud_visibility_m"]) if matched_site else 45.0
    )
    slope_deg = (
        float(matched_site["default_slab_slope_deg"]) if matched_site else 14.0
    )

    has_explicit_numbers = False

    biofilm_match = re.search(
        r"(\d+(?:\.\d+)?)\s*%\s*(?:cyanobacteria|biofilm|algal|stigonema|coverage)?",
        q_lower,
    )
    if biofilm_match:
        val = float(biofilm_match.group(1))
        if 0.0 <= val <= 100.0:
            biofilm_pct = val
            has_explicit_numbers = True

    gap_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:fissure|gap|chasm|crack|bridge|width|span)",
        q_lower,
    )
    if gap_match:
        val = float(gap_match.group(1))
        if 0.2 <= val <= 6.0:
            gap_m = val
            has_explicit_numbers = True

    rain_match = re.search(
        r"(\d+(?:\.\d+)?)\s*mm\s*(?:/\s*hr|/\s*h|per\s*hour|hr)?\s*(?:orographic|rain|rainfall|downpour)?",
        q_lower,
    )
    if rain_match:
        val = float(rain_match.group(1))
        if 0.0 <= val <= 90.0:
            rain_mm_hr = val
            has_explicit_numbers = True

    vis_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:cloud\s*visibility|visibility|fog\s*visibility|whiteout)",
        q_lower,
    )
    if vis_match:
        val = float(vis_match.group(1))
        if 3.0 <= val <= 500.0:
            vis_m = val
            has_explicit_numbers = True

    slope_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:°|deg|degrees?)\s*(?:slab\s*slope|slope|slab|ramp|inclination)?",
        q_lower,
    )
    if slope_match:
        val = float(slope_match.group(1))
        if 0.0 <= val <= 45.0:
            slope_deg = val
            has_explicit_numbers = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "matched_site": matched_site,
        "cyanobacteria_biofilm_pct": biofilm_pct,
        "fissure_gap_width_m": gap_m,
        "orographic_rain_mm_hr": rain_mm_hr,
        "cloud_visibility_m": vis_m,
        "slab_slope_deg": slope_deg,
        "has_explicit_numbers": has_explicit_numbers,
    }


def format_tepui_navigation_response(query: str) -> dict[str, Any]:
    """Build a structured response dictionary for a table-mountain quartzite tepui navigation query."""
    params: dict[str, Any] = extract_tepui_navigation_params(query)
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = params["matched_site"]

    calc_result: dict[str, Any] = calculate_tepui_navigation(
        cyanobacteria_biofilm_pct=float(params["cyanobacteria_biofilm_pct"]),
        fissure_gap_width_m=float(params["fissure_gap_width_m"]),
        orographic_rain_mm_hr=float(params["orographic_rain_mm_hr"]),
        cloud_visibility_m=float(params["cloud_visibility_m"]),
        slab_slope_deg=float(params["slab_slope_deg"]),
    )

    is_calc_request = bool(
        params["has_explicit_numbers"]
        or any(
            w in q_lower
            for w in (
                "calculate",
                "calculator",
                "traction coefficient",
                "collapse risk",
                "blackout index",
                "surge multiplier",
                "stream surge",
            )
        )
    )

    if is_calc_request:
        action = "tepui_navigation_calculated"
    elif matched_site is not None:
        action = "tepui_navigation_lookup"
    else:
        action = "tepui_navigation_info"

    site_summary = (
        f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']} — "
        f"morphology: `{matched_site['morphology']}`, difficulty: `{matched_site['difficulty']}`): "
        f"{matched_site['progression_protocol']} "
        if matched_site
        else "Table-mountain quartzite tepui and high-plateau sandstone fissure navigation require "
        "strict evaluation of Stigonema cyanobacteria biofilm coverage, pseudokarst fissure gap widths, "
        "orographic rainfall intensity, cloud visibility, and orthoquartzite slab inclination. "
    )

    answer = (
        f"{site_summary}"
        f"For **{calc_result['cyanobacteria_biofilm_pct']}% cyanobacteria biofilm coverage** and "
        f"**{calc_result['fissure_gap_width_m']} m fissure gap width** "
        f"({calc_result['orographic_rain_mm_hr']} mm/hr orographic rain, "
        f"{calc_result['cloud_visibility_m']} m cloud visibility, "
        f"{calc_result['slab_slope_deg']}° slab slope), "
        f"the biofilm traction coefficient is **{calc_result['biofilm_traction_coefficient']}**, "
        f"fissure bridge collapse risk is **{calc_result['fissure_bridge_collapse_risk_pct']}%**, "
        f"orographic blackout index is **{calc_result['orographic_blackout_index']}**, "
        f"blackwater stream surge multiplier is **{calc_result['blackwater_stream_surge_multiplier']}x**, "
        f"and risk level is **{calc_result['risk_level'].upper()}** "
        f"(progression protocol: `{calc_result['progression_protocol']}`)."
    )

    return _AttrDict(
        {
            "action": action,
            "answer": answer,
            "matched_site": matched_site,
            "calculation": calc_result,
            "sites": TEPUI_PLATEAU_SITES,
            "checklist": TEPUI_NAVIGATION_GEAR_CHECKLIST,
        }
    )


def build_tepui_navigation_prompt(query: str = "") -> str:
    """Build system prompt context for LLM calls involving table-mountain quartzite tepui navigation."""
    info: dict[str, Any] = (
        format_tepui_navigation_response(query)
        if query
        else format_tepui_navigation_response(
            "table-mountain quartzite tepui pseudokarst fissure navigation"
        )
    )
    calc: dict[str, Any] = info["calculation"]
    matched_site: dict[str, Any] | None = info.get("matched_site")

    lines: list[str] = [
        "### Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation Context",
        "- **Tepui Plateau Morphologies**: Pseudokarst fissure grids (e.g., Mount Roraima Maverick Summit & Labyrinth, Venezuela), "
        "Brocchinia bog-sinkhole mesas (e.g., Auyán-Tepui Devil's Canyon & Churún Mesa, Venezuela), "
        "orthoquartzite pinnacle plateaus (e.g., Kukenán Matawi Tepui, Venezuela), and Proterozoic escarpment ramps "
        "(e.g., Serranía de Chiribiquete Quartzite Mesas, Colombia).",
        f"- **Calculated Tepui Navigation Physics**: CyanobacteriaBiofilm={calc['cyanobacteria_biofilm_pct']}%, "
        f"FissureGapWidth={calc['fissure_gap_width_m']}m, OrographicRain={calc['orographic_rain_mm_hr']}mm/hr, "
        f"CloudVisibility={calc['cloud_visibility_m']}m, SlabSlope={calc['slab_slope_deg']}° -> "
        f"BiofilmTractionCoefficient={calc['biofilm_traction_coefficient']}, "
        f"FissureBridgeCollapseRisk={calc['fissure_bridge_collapse_risk_pct']}%, "
        f"OrographicBlackoutIndex={calc['orographic_blackout_index']}, "
        f"BlackwaterStreamSurgeMultiplier={calc['blackwater_stream_surge_multiplier']}x, "
        f"Risk={calc['risk_level']}, ProgressionProtocol={calc['progression_protocol']}.",
    ]
    if matched_site:
        lines.append(
            f"- **Focused Tepui Site**: {matched_site['name']} ({matched_site['country']}) — "
            f"Primary Hazard: {matched_site['primary_hazard']} | Progression Protocol: {matched_site['progression_protocol']}"
        )
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response dictionary for a tepui navigation query."""
    info: dict[str, Any] = format_tepui_navigation_response(query)
    return {
        "answer": info["answer"],
        "tepui_navigation_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[str, None, None]:
    """Yield SSE stream chunks for a tepui navigation query."""
    info: dict[str, Any] = format_tepui_navigation_response(query)
    yield f"data: {json.dumps({'action': info['action'], 'tepui_navigation_info': info})}\n\n"
    yield f"data: {json.dumps({'content': info['answer'], 'answer': info['answer']})}\n\n"
    yield "data: [DONE]\n\n"
