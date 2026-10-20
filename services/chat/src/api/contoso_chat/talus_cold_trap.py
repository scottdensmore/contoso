"""Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation Guide.

Covers high-consequence subalpine megatalus gorges, pseudokarst anorthosite/phonolite ice chasms,
and algific cold-air vent slopes governed by Balch-effect winter density trapping and barometric chimney drafts:
- King Ravine Subway & Mahoosuc Notch Balch-Ice Megatalus (White Mountains, New Hampshire, USA)
- Indian Pass & Avalanche Pass Anorthosite Talus Ice Chasms (Adirondack High Peaks, New York, USA)
- Driftless Area Algific Talus Cold-Air Vent Slopes (Upper Mississippi Driftless Area, Iowa, USA)
- Kamenec & Naděje Pseudokarst Phonolite Cold-Trap Block-Field (Lužické hory, Northern Bohemia, Czech Republic)

Deterministic calculator evaluates:
- Subterranean verglas & condensation glaze slip probability (%)
- Suspended moss-and-humus bridge collapse risk (%)
- Sub-talus cold-trap void hypothermia core cooling rate (°C/hr)
- Stagnant radon & CO2 pocket accumulation index (0-100)
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from typing import Any


class TalusColdTrapSite(dict[str, Any]):
    """Dictionary subclass supporting attribute access for boulder-talus cold-trap sites."""

    def __getattr__(self, name: str) -> Any:
        try:
            return self[name]
        except KeyError as exc:
            raise AttributeError(
                f"'TalusColdTrapSite' object has no attribute '{name}'"
            ) from exc


TALUS_COLD_TRAP_SITES: list[TalusColdTrapSite] = [
    TalusColdTrapSite(
        {
            "id": "king-ravine-mahosuc-notch-white-mountains-nh",
            "name": "King Ravine Subway & Mahoosuc Notch Balch-Ice Megatalus",
            "country": "USA",
            "region": "Presidential & Mahoosuc Ranges, White Mountains, New Hampshire",
            "elevation_range": "480 m - 1,180 m",
            "max_elevation_m": 1180,
            "regime": "balch-chimney-megaboulder-gorge",
            "morphology": "balch-chimney-megaboulder-gorge",
            "substrate_type": "balch-chimney-megaboulder-gorge",
            "difficulty": "extreme",
            "default_ambient_air_temp_c": 21.0,
            "default_crevice_void_depth_m": 14.5,
            "default_moss_humus_masking_pct": 68.0,
            "default_boulder_block_span_m": 4.8,
            "default_cold_draft_velocity_ms": 3.8,
            "primary_hazard": (
                "Deep house-sized Devonian Littleton schist and gneiss megaboulder voids harboring "
                "perennial Balch-effect floor ice, wet condensation verglas, and false Sphagnum-spruce "
                "humus bridges across 15 m subterranean drops."
            ),
            "navigation_strategy": (
                "Unshoulder oversized packs before threading the King Ravine Subway or Mahoosuc Notch "
                "lemon-squeezers, probe every moss-draped boulder gap with a graduated chromoly staff, "
                "and strap on 10-point steel microspikes when descending onto perennial sub-talus ice."
            ),
            "navigation_protocol": (
                "Follow blazed crawl-through leads rather than high-stepping across unsupported spruce-root "
                "and Hylocomium moss mats; don a windproof shell before dropping into 0 °C cold-trap chambers "
                "when sweat-soaked from humid summer approaches."
            ),
            "conservation_protocol": (
                "Stay strictly on established subterranean rock-scramble pads; do not peel cryophilic "
                "bryophyte mats from cold-air vents or disturb boreal birch-spruce micro-refugia."
            ),
            "progression_protocol": (
                "Follow blazed crawl-through leads rather than high-stepping across unsupported spruce-root "
                "and Hylocomium moss mats; don a windproof shell before dropping into 0 °C cold-trap chambers "
                "when sweat-soaked from humid summer approaches."
            ),
            "field_notes": (
                "Edwin Swift Balch (1900) documented King Ravine as a textbook static-and-chimney cold trap "
                "where dense winter air sinks into deep megatalus interstices and freezes spring meltwater into "
                "August glaze ice even when ambient valley temperatures exceed 28 °C."
            ),
        }
    ),
    TalusColdTrapSite(
        {
            "id": "indian-pass-avalanche-pass-adirondacks-ny",
            "name": "Indian Pass & Avalanche Pass Anorthosite Talus Ice Chasms",
            "country": "USA",
            "region": "High Peaks Wilderness, Adirondack Park, New York",
            "elevation_range": "660 m - 890 m",
            "max_elevation_m": 890,
            "regime": "anorthosite-pseudokarst-ice-chasm",
            "morphology": "anorthosite-pseudokarst-ice-chasm",
            "substrate_type": "anorthosite-pseudokarst-ice-chasm",
            "difficulty": "challenging",
            "default_ambient_air_temp_c": 18.5,
            "default_crevice_void_depth_m": 11.0,
            "default_moss_humus_masking_pct": 74.0,
            "default_boulder_block_span_m": 3.9,
            "default_cold_draft_velocity_ms": 2.7,
            "primary_hazard": (
                "Massive Marcy anorthosite cliff-fall block chasms beneath Wallface where thick "
                "Bazzania trilobata liverwort and Sphagnum carpets conceal 10-12 m vertical ice-floored "
                "pseudokarst fissures and slick feldspar verglas."
            ),
            "navigation_strategy": (
                "Maintain three points of contact in stiff-shank Vibram boots with Kevlar-palm gloves, "
                "test every moss-covered chockstone with a basketless probing staff, and use fixed ladders "
                "or bedrock ledges around deep cold-air blowholes."
            ),
            "navigation_protocol": (
                "Avoid stepping onto cantilevered organic duff shelves bridging angular anorthosite blocks; "
                "monitor lower-leg placement around cold-venting crevices where wet labradorite crystals "
                "become frictionless from summer dew-point condensation."
            ),
            "conservation_protocol": (
                "Protect fragile subalpine anorthosite ice-cave bryophyte communities and rare northern "
                "sedges clustered around the cold-air efflux vents at the base of Wallface."
            ),
            "progression_protocol": (
                "Avoid stepping onto cantilevered organic duff shelves bridging angular anorthosite blocks; "
                "monitor lower-leg placement around cold-venting crevices where wet labradorite crystals "
                "become frictionless from summer dew-point condensation."
            ),
            "field_notes": (
                "Monumental post-glacial rockfalls from Wallface created a labyrinth of anorthosite talus "
                "caves in Indian Pass and Avalanche Pass that vent 1-3 °C air plumes throughout July and August."
            ),
        }
    ),
    TalusColdTrapSite(
        {
            "id": "driftless-algific-talus-slopes-iowa",
            "name": "Driftless Area Algific Talus Cold-Air Vent Slopes",
            "country": "USA",
            "region": "Upper Mississippi Driftless Area (Bixby / White Pine Hollow), Northeastern Iowa",
            "elevation_range": "210 m - 340 m",
            "max_elevation_m": 340,
            "regime": "algific-dolomite-cold-vent-slope",
            "morphology": "algific-dolomite-cold-vent-slope",
            "substrate_type": "algific-dolomite-cold-vent-slope",
            "difficulty": "moderate",
            "default_ambient_air_temp_c": 24.0,
            "default_crevice_void_depth_m": 6.5,
            "default_moss_humus_masking_pct": 86.0,
            "default_boulder_block_span_m": 1.8,
            "default_cold_draft_velocity_ms": 3.1,
            "primary_hazard": (
                "Extremely fragile ice-underlaid Ordovician dolomite talus aprons and sinkhole cold vents "
                "masked by 85%+ saturated moss/hepatic mats that shear and collapse under a single boot step, "
                "causing ankle entrapment and destroying Pleistocene relict habitat."
            ),
            "navigation_strategy": (
                "Observe from designated perimeter overlooks or permitted bedrock rims using an infrared "
                "thermometer to map cold-air vents; never scramble directly across vegetated algific talus aprons."
            ),
            "navigation_protocol": (
                "Where authorized scientific monitoring requires perimeter access, step exclusively on "
                "flagged dry dolomite bedrock outcrops outside the cold-vent bryophyte buffer zone."
            ),
            "conservation_protocol": (
                "Strictly enforce zero-footfall conservation on algific talus slopes to protect federally "
                "endangered Iowa Pleistocene snails (Discus macclintocki) and northern monkshood (Aconitum "
                "noveboracense); a single boot print collapses subterranean ice-vent conduits."
            ),
            "progression_protocol": (
                "Strictly enforce zero-footfall conservation on algific talus slopes to protect federally "
                "endangered Iowa Pleistocene snails (Discus macclintocki) and northern monkshood (Aconitum "
                "noveboracense); a single boot print collapses subterranean ice-vent conduits."
            ),
            "field_notes": (
                "Algific ('cold-producing') talus slopes couple fractured karst mechanical sinkholes with "
                "subsurface ice lenses, exhaling 0-4 °C air through porous dolomite rubble all summer."
            ),
        }
    ),
    TalusColdTrapSite(
        {
            "id": "kamenec-crevice-ice-talus-bohemia-czechia",
            "name": "Kamenec & Naděje Pseudokarst Phonolite Cold-Trap Block-Field",
            "country": "Czech Republic",
            "region": "Lužické hory & Česká Lípa Phonolite Block-Streams, Northern Bohemia",
            "elevation_range": "450 m - 690 m",
            "max_elevation_m": 690,
            "regime": "periglacial-block-stream-felsenmeer",
            "morphology": "periglacial-block-stream-felsenmeer",
            "substrate_type": "periglacial-block-stream-felsenmeer",
            "difficulty": "challenging",
            "default_ambient_air_temp_c": 17.0,
            "default_crevice_void_depth_m": 9.5,
            "default_moss_humus_masking_pct": 62.0,
            "default_boulder_block_span_m": 3.1,
            "default_cold_draft_velocity_ms": 2.2,
            "primary_hazard": (
                "Ringing tabular phonolite and basaltic felsenmeer slabs coated in wet Dicranum/Polytrichum "
                "moss carpets and hoarfrost verglas above narrow 10 m pseudokarst ice crevices (Ledová jeskyně "
                "u Naděje) with stagnant CO2/radon floor pockets."
            ),
            "navigation_strategy": (
                "Cross the phonolite block-stream along consolidated ridge ribs using a basketless probing "
                "staff, wear a low-profile EN 12492 helmet and microspikes when entering the Naděje crevice "
                "ice cave, and limit dwell time in unventilated lower pockets."
            ),
            "navigation_protocol": (
                "Test tabular clinking phonolite slabs for tipping stability before committing full weight; "
                "avoid straddling dark moss-bridged fissures where summer condensation coats volcanic glass-rich "
                "rock surfaces in invisible black verglas."
            ),
            "conservation_protocol": (
                "Respect Czech National Nature Monument (PP Kamenec & PP Ledová jeskyně u Naděje) rules: "
                "remain on marked block-field boundary trails and avoid disturbing cryophilic mosses, lichens, "
                "and subterranean perennial firn lenses."
            ),
            "progression_protocol": (
                "Test tabular clinking phonolite slabs for tipping stability before committing full weight; "
                "avoid straddling dark moss-bridged fissures where summer condensation coats volcanic glass-rich "
                "rock surfaces in invisible black verglas."
            ),
            "field_notes": (
                "Periglacial frost-shattering of Tertiary phonolite domes produced deep block-streams where "
                "winter barometric chimney circulation preserves subterranean ice stalagmites and hoarfrost "
                "well into mid-summer at elevations below 600 m."
            ),
        }
    ),
]

TALUS_SITES: list[TalusColdTrapSite] = TALUS_COLD_TRAP_SITES

TALUS_COLD_TRAP_GEAR_CHECKLIST: list[dict[str, str]] = [
    {
        "item": "Graduated Basketless Chromoly Talus-Void & Moss-Bridge Probing Staff",
        "category": "False-Floor & Moss-Bridge Detection",
        "priority": "essential",
        "rationale": (
            "Probes through deceptive Sphagnum, Hylocomium, and rotten spruce-humus carpets to verify "
            "solid bedrock/chockstone purchase before stepping across 10-20 m megatalus voids."
        ),
    },
    {
        "item": "10-Point Stainless Steel Pocket Microspikes / Talus-Ice Crampons",
        "category": "Sub-Talus Verglas & Balch-Ice Traction",
        "priority": "essential",
        "rationale": (
            "Provides immediate mechanical bite on perennial Balch-effect floor ice and wet summer "
            "condensation verglas inside darkmegatalus subways and pseudokarst chasms."
        ),
    },
    {
        "item": "EN 12492 Low-Profile Mountaineering Helmet with Dual-Beam IP68 Headlamp",
        "category": "Cranium Impact & Sub-Boulder Illumination",
        "priority": "essential",
        "rationale": (
            "Protects the head from overhanging gneiss/anorthosite ceiling ceilings during pack-off "
            "lemon-squeezer crawls while illuminating shadowed ice-floored voids."
        ),
    },
    {
        "item": "1000D Ballistic Cordura Tibial Shin Guards & Stiff-Shank Vibram Boots",
        "category": "Tibial Entrapment & Edge-Shear Armor",
        "priority": "essential",
        "rationale": (
            "Prevents compound tibial fractures and sharp feldspar/phonolite shin lacerations if a "
            "moss bridge shears or a tabular block tips during three-point boulder scrambling."
        ),
    },
    {
        "item": "Windproof Vapour-Permeable Thermal Shell & Kevlar-Palm Scramble Gloves",
        "category": "Katabatic Cold-Draft Hypothermia Defense",
        "priority": "essential",
        "rationale": (
            "Blocks 0-2 °C barometric cold-trap drafts from rapidly chilling sweat-soaked hikers "
            "descending from 25-30 °C summer surface trails into sub-talus ice chambers."
        ),
    },
    {
        "item": "Non-Contact Infrared Surface Thermometer & Pocket CO2/Radon Air Monitor",
        "category": "Algific Vent Mapping & Stagnant Pocket Safety",
        "priority": "essential",
        "rationale": (
            "Identifies sub-zero dew-point verglas zones and fragile algific cold-air vents from a "
            "safe distance while warning of CO2/Rn-222 accumulation in unventilated bottom fissures."
        ),
    },
]


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 subalpine boulder-talus air-draft ice cave & cold-trap block-field sites."""
    return list(TALUS_COLD_TRAP_SITES)


def get_all_talus_cold_trap_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6 essential gear checklist items for talus cold-trap navigation."""
    return [dict(item) for item in TALUS_COLD_TRAP_GEAR_CHECKLIST]


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Lookup a talus cold-trap site by exact ID or fuzzy substring match."""
    if not site_id or not site_id.strip():
        return None
    norm = site_id.strip().lower()
    for site in TALUS_COLD_TRAP_SITES:
        if str(site["id"]).lower() == norm:
            return site

    alias_map = {
        "king ravine": "king-ravine-mahosuc-notch-white-mountains-nh",
        "king-ravine": "king-ravine-mahosuc-notch-white-mountains-nh",
        "mahoosuc notch": "king-ravine-mahosuc-notch-white-mountains-nh",
        "mahoosuc": "king-ravine-mahosuc-notch-white-mountains-nh",
        "mahosuc": "king-ravine-mahosuc-notch-white-mountains-nh",
        "white mountains": "king-ravine-mahosuc-notch-white-mountains-nh",
        "subway": "king-ravine-mahosuc-notch-white-mountains-nh",
        "indian pass": "indian-pass-avalanche-pass-adirondacks-ny",
        "indian-pass": "indian-pass-avalanche-pass-adirondacks-ny",
        "avalanche pass": "indian-pass-avalanche-pass-adirondacks-ny",
        "adirondack": "indian-pass-avalanche-pass-adirondacks-ny",
        "anorthosite": "indian-pass-avalanche-pass-adirondacks-ny",
        "wallface": "indian-pass-avalanche-pass-adirondacks-ny",
        "driftless": "driftless-algific-talus-slopes-iowa",
        "algific": "driftless-algific-talus-slopes-iowa",
        "bixby": "driftless-algific-talus-slopes-iowa",
        "iowa": "driftless-algific-talus-slopes-iowa",
        "kamenec": "kamenec-crevice-ice-talus-bohemia-czechia",
        "nadeje": "kamenec-crevice-ice-talus-bohemia-czechia",
        "naděje": "kamenec-crevice-ice-talus-bohemia-czechia",
        "bohemia": "kamenec-crevice-ice-talus-bohemia-czechia",
        "czech": "kamenec-crevice-ice-talus-bohemia-czechia",
        "phonolite": "kamenec-crevice-ice-talus-bohemia-czechia",
    }
    for alias, target_id in alias_map.items():
        if alias in norm:
            for site in TALUS_COLD_TRAP_SITES:
                if site["id"] == target_id:
                    return site

    for site in TALUS_COLD_TRAP_SITES:
        if norm in str(site["id"]).lower() or norm in str(site["name"]).lower():
            return site
    return None


def get_talus_cold_trap_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    regime: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
    morphology: str | None = None,
    substrate_type: str | None = None,
) -> list[dict[str, Any]]:
    """Filter talus cold-trap sites by country, regime, difficulty, and free-text search."""
    results: list[dict[str, Any]] = list(TALUS_COLD_TRAP_SITES)
    if country and country.strip():
        c_norm = country.strip().lower()
        results = [
            s
            for s in results
            if c_norm == str(s["country"]).lower() or c_norm in str(s["country"]).lower()
        ]
    effective_regime = (
        regime
        if regime and regime.strip()
        else (morphology if morphology and morphology.strip() else substrate_type)
    )
    if effective_regime and effective_regime.strip():
        reg_norm = effective_regime.strip().lower()
        results = [s for s in results if reg_norm in str(s["regime"]).lower()]
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
            or q_norm in str(s["regime"]).lower()
            or q_norm in str(s["primary_hazard"]).lower()
            or q_norm in str(s["navigation_strategy"]).lower()
            or q_norm in str(s["field_notes"]).lower()
        ]
    return results


def calculate_talus_cold_trap(
    ambient_air_temp_c: float = 20.0,
    crevice_void_depth_m: float = 10.0,
    moss_humus_masking_pct: float = 65.0,
    boulder_block_span_m: float = 3.2,
    cold_draft_velocity_ms: float = 2.4,
) -> dict[str, Any]:
    """Calculate verglas glaze slip probability, moss bridge collapse risk, void hypothermia cooling rate, and radon/CO2 accumulation index.

    Raises ValueError if any input is outside validated physical bounds:
    - ambient_air_temp_c: -10.0 to 38.0 °C
    - crevice_void_depth_m: 1.0 to 35.0 m
    - moss_humus_masking_pct: 0.0 to 100.0 %
    - boulder_block_span_m: 0.4 to 12.0 m
    - cold_draft_velocity_ms: 0.1 to 8.5 m/s
    """
    if not (-10.0 <= ambient_air_temp_c <= 38.0):
        raise ValueError(
            f"ambient_air_temp_c must be between -10 and 38 °C (got {ambient_air_temp_c})"
        )
    if not (1.0 <= crevice_void_depth_m <= 35.0):
        raise ValueError(
            f"crevice_void_depth_m must be between 1.0 and 35.0 m (got {crevice_void_depth_m})"
        )
    if not (0.0 <= moss_humus_masking_pct <= 100.0):
        raise ValueError(
            f"moss_humus_masking_pct must be between 0 and 100 % (got {moss_humus_masking_pct})"
        )
    if not (0.4 <= boulder_block_span_m <= 12.0):
        raise ValueError(
            f"boulder_block_span_m must be between 0.4 and 12.0 m (got {boulder_block_span_m})"
        )
    if not (0.1 <= cold_draft_velocity_ms <= 8.5):
        raise ValueError(
            f"cold_draft_velocity_ms must be between 0.1 and 8.5 m/s (got {cold_draft_velocity_ms})"
        )

    # 1. Subterranean verglas & condensation glaze slip probability (%)
    # Warm humid ambient air contacting 0 °C Balch-trapped sub-talus ice & cold rock surfaces
    thermal_gradient = max(0.0, ambient_air_temp_c + 2.0)
    raw_verglas_prob = (
        2.5
        + (thermal_gradient * 1.12)
        + (crevice_void_depth_m * 1.38)
        + (cold_draft_velocity_ms * 4.1)
        + (moss_humus_masking_pct * 0.19)
    )
    verglas_glaze_slip_probability_pct = round(
        min(99.0, max(1.0, raw_verglas_prob)),
        1,
    )

    # 2. Suspended moss-and-humus bridge collapse risk (%)
    # Driven by moss/humus masking percentage, boulder block span across void, and condensation rot
    raw_collapse_risk = (
        2.0
        + (moss_humus_masking_pct * 0.54)
        + (boulder_block_span_m * 4.25)
        + (crevice_void_depth_m * 0.72)
        + (max(0.0, ambient_air_temp_c) * 0.22)
    )
    moss_bridge_collapse_risk_pct = round(
        min(99.0, max(1.0, raw_collapse_risk)),
        1,
    )

    # 3. Sub-talus cold-trap void hypothermia core cooling rate (°C/hr)
    # Sweat-soaked hikers dropping from warm ambient air into 0 °C katabatic air drafts
    sweat_soak_penalty = max(0.0, ambient_air_temp_c - 5.0) * 0.032
    raw_cooling_rate = (
        0.35
        + (crevice_void_depth_m * 0.048)
        + (cold_draft_velocity_ms * 0.28)
        + (boulder_block_span_m * 0.04)
        + sweat_soak_penalty
    )
    void_hypothermia_cooling_rate_c_per_hr = round(
        min(6.5, max(0.2, raw_cooling_rate)),
        2,
    )

    # 4. Stagnant radon & CO2 pocket accumulation index (0 - 100)
    # Deep density-stratified voids with high humus cap and low draft velocity trap soil CO2 & Rn-222
    ventilation_relief = cold_draft_velocity_ms * 5.2
    raw_gas_index = (
        12.0
        + (crevice_void_depth_m * 2.15)
        + (moss_humus_masking_pct * 0.32)
        + (max(0.0, ambient_air_temp_c) * 0.35)
        - ventilation_relief
    )
    radon_co2_pocket_accumulation_index = round(
        min(99.0, max(2.0, raw_gas_index)),
        1,
    )

    warnings: list[str] = []
    recommendations: list[str] = []

    if verglas_glaze_slip_probability_pct >= 65.0 or (
        ambient_air_temp_c >= 20.0 and crevice_void_depth_m >= 12.0
    ):
        warnings.append(
            f"BALCH-ICE & CONDENSATION VERGLAS HAZARD: {ambient_air_temp_c:.1f} °C ambient air meeting "
            f"sub-zero air drafts ({cold_draft_velocity_ms:.1f} m/s) in a {crevice_void_depth_m:.1f} m void "
            f"produces a {verglas_glaze_slip_probability_pct:.1f}% glaze slip probability."
        )
        recommendations.append(
            "Equip 10-point steel pocket microspikes and an EN 12492 helmet before descending into "
            "sub-boulder ice chambers or subway leads."
        )
    elif verglas_glaze_slip_probability_pct >= 35.0:
        warnings.append(
            f"MODERATE DEW-POINT CONDENSATION GLAZE: {verglas_glaze_slip_probability_pct:.1f}% slip "
            "probability on cold-venting boulder facets."
        )
        recommendations.append(
            "Maintain three points of contact with Kevlar-palm gloves and stiff-shank Vibram soles "
            "across damp cold-vent boulders."
        )

    if moss_bridge_collapse_risk_pct >= 60.0 or moss_humus_masking_pct >= 65.0:
        warnings.append(
            f"FALSE-FLOOR MOSS BRIDGE COLLAPSE RISK: {moss_humus_masking_pct:.0f}% Sphagnum/humus masking "
            f"spanning {boulder_block_span_m:.1f} m blocks over a {crevice_void_depth_m:.1f} m void yields "
            f"a {moss_bridge_collapse_risk_pct:.1f}% punch-through probability."
        )
        recommendations.append(
            "Probe every moss-and-root carpet with a graduated basketless chromoly staff before committing "
            "weight, and enforce zero-footfall conservation on algific cold-vent bryophyte mats."
        )

    if void_hypothermia_cooling_rate_c_per_hr >= 1.8 or cold_draft_velocity_ms >= 3.2:
        warnings.append(
            f"RAPID KATABATIC COLD-TRAP COOLING: {cold_draft_velocity_ms:.1f} m/s sub-talus air draft "
            f"drives a {void_hypothermia_cooling_rate_c_per_hr:.2f} °C/hr core cooling rate for "
            "sweat-dampened scramblers."
        )
        recommendations.append(
            "Don a windproof vapour-permeable shell and dry insulating layer before entering "
            "cold-trap boulder gorges or unshouldering packs in narrow squeezes."
        )

    if radon_co2_pocket_accumulation_index >= 55.0:
        warnings.append(
            f"STAGNANT SUB-TALUS CO2 / RADON POCKET: Accumulation index {radon_co2_pocket_accumulation_index:.1f}/100 "
            "in poorly ventilated dead-end crevices beneath dense humus caps."
        )
        recommendations.append(
            "Limit dwell time in dead-end bottom fissures and carry a pocket CO2/Rn-222 monitor when "
            "surveying deep static cold traps."
        )

    if len(recommendations) < 2:
        recommendations.extend(
            [
                "Step directly on solid bedrock points or locked chockstones rather than suspended organic humus mats.",
                "Wear 1000D ballistic Cordura shin guards and stiff-shank boots to prevent tibial entrapment between blocks.",
            ]
        )

    # Determine overall risk_level & navigation_strategy
    if (
        verglas_glaze_slip_probability_pct >= 75.0
        or moss_bridge_collapse_risk_pct >= 78.0
        or void_hypothermia_cooling_rate_c_per_hr >= 2.6
        or crevice_void_depth_m >= 22.0
    ):
        risk_level = "critical"
        navigation_strategy = (
            "ABORT UNPROTECTED MEGATALUS VOID ENTRY: Extreme false-floor moss-bridge collapse and "
            f"sub-talus Balch-ice verglas hazard ({verglas_glaze_slip_probability_pct:.1f}% slip risk, "
            f"{moss_bridge_collapse_risk_pct:.1f}% moss-bridge collapse risk, "
            f"{void_hypothermia_cooling_rate_c_per_hr:.2f} °C/hr cooling rate). Bypass deep subterranean "
            "crevice leads on high bedrock rims or deploy full microspike, helmet, and probing-staff protection."
        )
    elif (
        verglas_glaze_slip_probability_pct >= 52.0
        or moss_bridge_collapse_risk_pct >= 55.0
        or void_hypothermia_cooling_rate_c_per_hr >= 1.65
        or radon_co2_pocket_accumulation_index >= 60.0
    ):
        risk_level = "high"
        navigation_strategy = (
            "TECHNICAL PACK-OFF SUBWAY & CHOCKSTONE SCRAMBLE: Don EN 12492 helmet, 10-point steel "
            "microspikes, windproof shell, and ballistic shin guards. Probe every Sphagnum/humus bridge "
            "with a basketless chromoly staff and haul packs through narrow boulder squeezes."
        )
    elif (
        verglas_glaze_slip_probability_pct >= 26.0
        or moss_bridge_collapse_risk_pct >= 28.0
        or void_hypothermia_cooling_rate_c_per_hr >= 1.05
        or radon_co2_pocket_accumulation_index >= 38.0
    ):
        risk_level = "moderate"
        navigation_strategy = (
            "CAUTIOUS THREE-POINT BLOCK-FIELD & COLD-VENT TRANSIT: Use a basketless probing staff "
            "to verify chockstone stability, step clear of damp condensation-glazed facets, and "
            "maintain strict zero-footfall buffers around sensitive algific bryophyte vents."
        )
    else:
        risk_level = "low"
        navigation_strategy = (
            "NOMINAL SHALLOW BLOCK-FIELD PASSAGE: Shallow well-ventilated talus interstices and "
            "minimal moss masking allow steady three-point boulder stepping; keep probing staff "
            "ready and avoid trampling cold-vent moss cushions."
        )

    return {
        "ambient_air_temp_c": round(float(ambient_air_temp_c), 1),
        "crevice_void_depth_m": round(float(crevice_void_depth_m), 1),
        "moss_humus_masking_pct": round(float(moss_humus_masking_pct), 1),
        "boulder_block_span_m": round(float(boulder_block_span_m), 2),
        "cold_draft_velocity_ms": round(float(cold_draft_velocity_ms), 2),
        "verglas_glaze_slip_probability_pct": verglas_glaze_slip_probability_pct,
        "moss_bridge_collapse_risk_pct": moss_bridge_collapse_risk_pct,
        "void_hypothermia_cooling_rate_c_per_hr": void_hypothermia_cooling_rate_c_per_hr,
        "radon_co2_pocket_accumulation_index": radon_co2_pocket_accumulation_index,
        "risk_level": risk_level,
        "safety_status": risk_level,
        "navigation_strategy": navigation_strategy,
        "warnings": warnings,
        "recommendations": recommendations,
    }


_EXPLICIT_TALUS_COLD_TRAP_TERMS: tuple[str, ...] = (
    "talus cold trap",
    "talus-cold-trap",
    "talus_cold_trap",
    "talus cold-trap",
    "algific talus",
    "algific slope",
    "algific cold",
    "algific",
    "balch effect",
    "balch-effect",
    "balch ice",
    "balch-ice",
    "mahoosuc notch",
    "mahosuc notch",
    "mahoosuc",
    "king ravine subway",
    "king ravine",
    "talus ice cave",
    "talus ice caves",
    "talus ice chasm",
    "talus ice chasms",
    "pseudokarst talus",
    "pseudokarst phonolite",
    "anorthosite talus",
    "anorthosite pseudokarst",
    "indian pass",
    "megatalus",
    "felsenmeer",
    "moss bridge",
    "moss bridges",
    "moss-bridge",
    "cold-trap block",
    "cold trap block",
    "crevice ice talus",
    "kamenec",
    "ledová jeskyně u naděje",
    "naděje",
    "king-ravine-mahosuc-notch-white-mountains-nh",
    "indian-pass-avalanche-pass-adirondacks-ny",
    "driftless-algific-talus-slopes-iowa",
    "kamenec-crevice-ice-talus-bohemia-czechia",
)

_OTHER_DOMAIN_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return label",
    "shipping",
    "tracking number",
    # Subterranean lava tube & karst glaciere exclusions
    "lava tube",
    "lava-tube",
    "lava glaciere",
    "lava glacière",
    "eisriesenwelt",
    "tennengebirge",
    "scarisoara",
    "scărișoara",
    "bandera ice cave",
    "bandera",
    "candelaria",
    "el malpais",
    "lofthellir",
    "firn-plug",
    "firn plug",
    # High-alpine periglacial rock-glacier exclusions
    "rock glacier",
    "rock-glacier",
    "rock glaciers",
    "sourdough peak",
    "mccarthy creek",
    "mount mendenhall",
    "val muragl",
    "murtèl",
    "dos lenguas",
    "agua negra",
    "glaciar de escombros",
    "wheeler peak",
    "nesters ridge",
    "lehman quartzite",
    # Scree running / canyon bouldering / cryokarst exclusions
    "scree running",
    "heel plunge",
    "mount sneffels",
    "wastwater screes",
    "buttermilks",
    "peabody",
    "crash pad",
    "crashpad",
    "matanuska",
    "moulin",
)


def is_talus_cold_trap_query(query: str) -> bool:
    """Return True if the user query targets Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation."""
    if not query or not query.strip():
        return False
    q = query.strip().lower()

    if any(excl in q for excl in _OTHER_DOMAIN_EXCLUSIONS):
        return False

    if any(term in q for term in _EXPLICIT_TALUS_COLD_TRAP_TERMS):
        return True

    has_talus_block_context = any(
        w in q
        for w in (
            "talus",
            "boulder-talus",
            "boulder talus",
            "block-field",
            "block field",
            "crevice void",
            "boulder gorge",
        )
    )
    has_cold_trap_mechanic = any(
        w in q
        for w in (
            "cold-air vent",
            "cold air vent",
            "cold draft",
            "air-draft",
            "air draft",
            "moss humus",
            "verglas",
            "cold trap",
            "cold-trap",
            "ice cave",
            "ice chasm",
            "sub-talus",
        )
    )
    return has_talus_block_context and has_cold_trap_mechanic


def detect_talus_cold_trap_intent(query: str) -> bool:
    """Alias for is_talus_cold_trap_query()."""
    return is_talus_cold_trap_query(query)


def extract_talus_cold_trap_params(query: str) -> dict[str, Any]:
    """Extract talus cold-trap site_id and calculator parameters from a natural-language query."""
    q = (query or "").lower()

    matched_site: dict[str, Any] | None = None
    for token in (
        "king-ravine-mahosuc-notch-white-mountains-nh",
        "indian-pass-avalanche-pass-adirondacks-ny",
        "driftless-algific-talus-slopes-iowa",
        "kamenec-crevice-ice-talus-bohemia-czechia",
        "king ravine",
        "king-ravine",
        "mahoosuc notch",
        "mahosuc notch",
        "mahoosuc",
        "mahosuc",
        "indian pass",
        "indian-pass",
        "avalanche pass",
        "anorthosite",
        "wallface",
        "driftless",
        "algific",
        "bixby",
        "kamenec",
        "naděje",
        "nadeje",
        "phonolite",
        "bohemia",
    ):
        if token in q:
            matched_site = get_site_by_id(token)
            if matched_site is not None:
                break

    site_defaults: dict[str, Any] = matched_site or TALUS_COLD_TRAP_SITES[0]
    ambient_air_temp_c = float(site_defaults["default_ambient_air_temp_c"])
    crevice_void_depth_m = float(site_defaults["default_crevice_void_depth_m"])
    moss_humus_masking_pct = float(site_defaults["default_moss_humus_masking_pct"])
    boulder_block_span_m = float(site_defaults["default_boulder_block_span_m"])
    cold_draft_velocity_ms = float(site_defaults["default_cold_draft_velocity_ms"])
    has_calc_params = False

    # 1. Ambient air temperature (°C)
    temp_patterns = [
        r"(?:ambient\s+)?(?:air\s+)?temp(?:erature)?\s*(?:of|=|:)?\s*(-?\d+(?:\.\d+)?)\s*°?\s*c\b",
        r"(-?\d+(?:\.\d+)?)\s*°?\s*c\s+(?:ambient\s+)?(?:air\s+)?temp(?:erature)?",
    ]
    for pat in temp_patterns:
        m = re.search(pat, q)
        if m:
            ambient_air_temp_c = max(-10.0, min(38.0, float(m.group(1))))
            has_calc_params = True
            break

    # 2. Crevice void depth (m)
    depth_patterns = [
        r"(?:crevice\s+)?(?:void\s+)?depth\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*m\b",
        r"(\d+(?:\.\d+)?)\s*m\s+(?:crevice\s+)?(?:void\s+)?depth",
    ]
    for pat in depth_patterns:
        m = re.search(pat, q)
        if m:
            crevice_void_depth_m = max(1.0, min(35.0, float(m.group(1))))
            has_calc_params = True
            break

    # 3. Moss humus masking (%)
    moss_patterns = [
        r"(?:moss(?:\s+humus)?|humus)(?:\s+masking)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*%",
        r"(\d+(?:\.\d+)?)\s*%\s*(?:moss(?:\s+humus)?|humus)(?:\s+masking)?",
    ]
    for pat in moss_patterns:
        m = re.search(pat, q)
        if m:
            moss_humus_masking_pct = max(0.0, min(100.0, float(m.group(1))))
            has_calc_params = True
            break

    # 4. Boulder block span (m)
    span_patterns = [
        r"(?:boulder\s+)?(?:block\s+)?span\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*m\b",
        r"(\d+(?:\.\d+)?)\s*m\s+(?:boulder\s+)?(?:block\s+)?span",
    ]
    for pat in span_patterns:
        m = re.search(pat, q)
        if m:
            boulder_block_span_m = max(0.4, min(12.0, float(m.group(1))))
            has_calc_params = True
            break

    # 5. Cold draft velocity (m/s)
    draft_patterns = [
        r"(?:cold\s+)?draft(?:\s+velocity)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:m/s|ms)\b",
        r"(\d+(?:\.\d+)?)\s*(?:m/s|ms)\s+(?:cold\s+)?draft(?:\s+velocity)?",
    ]
    for pat in draft_patterns:
        m = re.search(pat, q)
        if m:
            cold_draft_velocity_ms = max(0.1, min(8.5, float(m.group(1))))
            has_calc_params = True
            break

    if any(w in q for w in ("calculate", "calculator", "compute")) and not has_calc_params:
        has_calc_params = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "site": matched_site,
        "ambient_air_temp_c": ambient_air_temp_c,
        "crevice_void_depth_m": crevice_void_depth_m,
        "moss_humus_masking_pct": moss_humus_masking_pct,
        "boulder_block_span_m": boulder_block_span_m,
        "cold_draft_velocity_ms": cold_draft_velocity_ms,
        "has_calc_params": has_calc_params,
    }


def format_talus_cold_trap_response(query: str) -> dict[str, Any]:
    """Build a structured talus cold-trap response payload for chat and SSE endpoints."""
    params: dict[str, Any] = extract_talus_cold_trap_params(query)
    matched_site: dict[str, Any] | None = params["site"]
    has_calc = bool(params["has_calc_params"])

    calc_result: dict[str, Any] = calculate_talus_cold_trap(
        ambient_air_temp_c=float(params["ambient_air_temp_c"]),
        crevice_void_depth_m=float(params["crevice_void_depth_m"]),
        moss_humus_masking_pct=float(params["moss_humus_masking_pct"]),
        boulder_block_span_m=float(params["boulder_block_span_m"]),
        cold_draft_velocity_ms=float(params["cold_draft_velocity_ms"]),
    )

    if has_calc:
        action = "talus_cold_trap_calculated"
        matched_sites: list[dict[str, Any]] = (
            [matched_site] if matched_site else list(TALUS_COLD_TRAP_SITES)
        )
    elif matched_site is not None:
        action = "talus_cold_trap_lookup"
        matched_sites = [matched_site]
    else:
        action = "talus_cold_trap_info"
        matched_sites = list(TALUS_COLD_TRAP_SITES)

    site_summary = (
        f"{matched_site['name']} ({matched_site['country']}, {matched_site['elevation_range']})"
        if matched_site
        else "Global Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Corridors (King Ravine/Mahoosuc Notch, Indian Pass, Driftless Algific Slopes, Kamenec/Naděje)"
    )

    summary_lines: list[str] = [
        f"### Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Assessment: {site_summary}",
        f"- **Safety / Risk Level:** `{calc_result['risk_level'].upper()}`",
        f"- **Verglas Glaze Slip Probability:** `{calc_result['verglas_glaze_slip_probability_pct']:.1f}%` "
        f"(Ambient Air `{calc_result['ambient_air_temp_c']:.1f} °C`, "
        f"Cold Draft `{calc_result['cold_draft_velocity_ms']:.1f} m/s`)",
        f"- **Moss-Bridge Collapse Risk:** `{calc_result['moss_bridge_collapse_risk_pct']:.1f}%` "
        f"(Moss/Humus Masking `{calc_result['moss_humus_masking_pct']:.0f}%`, "
        f"Boulder Span `{calc_result['boulder_block_span_m']:.1f} m`, "
        f"Void Depth `{calc_result['crevice_void_depth_m']:.1f} m`)",
        f"- **Void Hypothermia Cooling Rate:** `{calc_result['void_hypothermia_cooling_rate_c_per_hr']:.2f} °C/hr`",
        f"- **Radon / CO2 Pocket Accumulation Index:** `{calc_result['radon_co2_pocket_accumulation_index']:.1f} / 100`",
        f"- **Navigation Strategy:** {calc_result['navigation_strategy']}",
    ]
    if matched_site:
        summary_lines.append(
            f"- **Site Navigation Protocol:** {matched_site['navigation_protocol']}"
        )
        summary_lines.append(
            f"- **Cryophilic Conservation Protocol:** {matched_site['conservation_protocol']}"
        )
    if calc_result["warnings"]:
        summary_lines.append("- **Active Warnings:** " + " | ".join(calc_result["warnings"]))
    summary_lines.append(
        "- **Essential Gear:** "
        + "; ".join(item["item"] for item in TALUS_COLD_TRAP_GEAR_CHECKLIST[:4])
    )

    formatted_text = "\n".join(summary_lines)

    return {
        "action": action,
        "query": query,
        "site": dict(matched_site) if matched_site else None,
        "matched_sites": [dict(s) for s in matched_sites],
        "sites": [dict(s) for s in TALUS_COLD_TRAP_SITES],
        "calculation": calc_result,
        "gear_checklist": get_gear_checklist(),
        "answer": formatted_text,
        "formatted_response": formatted_text,
    }


def build_talus_cold_trap_prompt(info_or_query: dict[str, Any] | str) -> str:
    """Build the system prompt grounding block for LLM generation on talus cold-trap queries."""
    info: dict[str, Any] = (
        format_talus_cold_trap_response(info_or_query)
        if isinstance(info_or_query, str)
        else info_or_query
    )
    calc: dict[str, Any] = info.get("calculation") or {}
    site: dict[str, Any] | None = info.get("site")
    site_header = (
        f"Target Site: {site['name']} ({site['country']}, {site['elevation_range']}, regime={site['regime']})"
        if site
        else "Target Domain: Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation"
    )
    warnings_str = "; ".join(calc.get("warnings", [])) or "None"
    recs_str = "; ".join(calc.get("recommendations", []))
    return (
        "\n\n[SUBALPINE BOULDER-TALUS AIR-DRAFT ICE CAVE & COLD-TRAP BLOCK-FIELD NAVIGATION GUIDE]\n"
        f"{site_header}\n"
        f"Action: {info.get('action', 'talus_cold_trap_info')}\n"
        f"Risk Level: {calc.get('risk_level', 'moderate')}\n"
        f"Inputs: ambient_air_temp_c={calc.get('ambient_air_temp_c')}, "
        f"crevice_void_depth_m={calc.get('crevice_void_depth_m')}, "
        f"moss_humus_masking_pct={calc.get('moss_humus_masking_pct')}, "
        f"boulder_block_span_m={calc.get('boulder_block_span_m')}, "
        f"cold_draft_velocity_ms={calc.get('cold_draft_velocity_ms')}\n"
        f"Calculated Metrics: verglas_glaze_slip_probability_pct={calc.get('verglas_glaze_slip_probability_pct')}%, "
        f"moss_bridge_collapse_risk_pct={calc.get('moss_bridge_collapse_risk_pct')}%, "
        f"void_hypothermia_cooling_rate_c_per_hr={calc.get('void_hypothermia_cooling_rate_c_per_hr')} C/hr, "
        f"radon_co2_pocket_accumulation_index={calc.get('radon_co2_pocket_accumulation_index')}/100\n"
        f"Navigation Strategy: {calc.get('navigation_strategy', '')}\n"
        f"Warnings: {warnings_str}\n"
        f"Recommendations: {recs_str}\n"
        "Provide concrete subalpine boulder-talus air-draft ice cave and cold-trap block-field navigation "
        "guidance covering Balch-effect winter density trapping, dew-point condensation verglas on cold "
        "boulders, basketless chromoly staff probing of false-floor Sphagnum/humus bridges, 10-point pocket "
        "microspikes, katabatic draft hypothermia defense, and strict zero-footfall conservation on fragile "
        "algific talus slopes.\n"
    )


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a standalone fallback chat response dictionary with talus_cold_trap_info."""
    info: dict[str, Any] = format_talus_cold_trap_response(query)
    return {
        "answer": info["formatted_response"],
        "context": [s["name"] for s in info["matched_sites"]],
        "talus_cold_trap_info": info,
    }


def generate_stream_events(query: str) -> Iterator[dict[str, Any]]:
    """Yield SSE event dictionaries for standalone talus cold-trap streaming."""
    info: dict[str, Any] = format_talus_cold_trap_response(query)
    text = str(info["formatted_response"])
    midpoint = max(1, len(text) // 2)
    yield {
        "answer": text[:midpoint],
        "context": [s["name"] for s in info["matched_sites"]],
        "talus_cold_trap_info": info,
    }
    yield {
        "answer": text[midpoint:],
    }
    yield {
        "done": True,
        "talus_cold_trap_info": info,
    }
