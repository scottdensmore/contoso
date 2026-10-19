"""Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking Guide module.

Provides domain data, physics-based alginate mucilage slip friction modeling,
inter-clast ankle-roll torque assessment, wave swash runup cutoff windows,
effective shingle/boulder pace calculations, mandatory gear checklists, and
intent detection for coastal cobble spits, storm-berm tombolos, and intertidal
kelp-wrack boulder reefs.
"""

from __future__ import annotations

import json
import re
from collections.abc import Generator
from typing import Any, Literal

CobbleSpitMorphology = Literal[
    "cuspate-shingle-spit",
    "storm-berm-cobble-bar",
    "intertidal-boulder-reef",
    "glacio-fluvial-tombolo",
]
CobbleSpitDifficulty = Literal["moderate", "challenging", "extreme"]
CobbleSpitRiskLevel = Literal["low", "moderate", "high", "critical"]
CobbleSpitFootwearClass = Literal[
    "trail-runner-trekking-poles",
    "high-cuff-scree-boot-dual-poles",
    "tungsten-studded-felt-boot-wading-staff",
    "abort-swash-overwash-entrapment",
]


class _AttrDict(dict[str, Any]):
    """Dictionary subclass supporting attribute-style read access."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc


# ---------------------------------------------------------------------------
# Reference Cobble Spit & Intertidal Boulder Reef Sites Catalog (4 Sites)
# ---------------------------------------------------------------------------

COBBLE_SPIT_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "dungeness-spit-olympic-usa",
            "name": "Dungeness Cuspate Shingle Spit & Drift-Log Berm",
            "country": "United States",
            "region": "Strait of Juan de Fuca, Olympic Peninsula, Washington",
            "length_km": 8.9,
            "elevation": "0 – 4 m MLLW",
            "elevation_m": 4,
            "morphology": "cuspate-shingle-spit",
            "difficulty": "moderate",
            "default_median_cobble_diameter_mm": 68.0,
            "default_kelp_wrack_depth_cm": 14.0,
            "default_berm_slope_deg": 9.5,
            "default_swell_height_m": 1.1,
            "default_pack_load_kg": 12.0,
            "footwear_recommendation": (
                "Stiff-shank trail runners or mid-cuff trekking boots with breathable scree gaiters "
                "and dual trekking poles fitted with wide cobble baskets."
            ),
            "primary_hazard": (
                "Rolling Western redcedar and Sitka spruce drift logs mobilized by flood-tide swash "
                "runup across the narrow storm-berm crest during westerly Strait gales."
            ),
            "navigation_protocol": (
                "Walk the damp lower foreshore shingle apron on a falling tide below the loose storm "
                "crest; never sit on or step between partially buoyant drift logs near the swash line."
            ),
            "traversal_protocol": (
                "Walk the damp lower foreshore shingle apron on a falling tide below the loose storm "
                "crest; never sit on or step between partially buoyant drift logs near the swash line."
            ),
            "field_notes": (
                "The longest natural sand-and-shingle spit in the United States (~8.9 km hike to New "
                "Dungeness Lighthouse), fed by littoral drift from eroding Pleistocene glacial bluffs "
                "and lined with dense Nereocystis bull-kelp wrack."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "chesil-beach-fleet-uk",
            "name": "Chesil Beach Graded Flint & Chert Storm-Berm Tombolo",
            "country": "United Kingdom",
            "region": "Jurassic Coast, Dorset (West Bay to Isle of Portland)",
            "length_km": 29.0,
            "elevation": "0 – 15 m MLLW",
            "elevation_m": 15,
            "morphology": "storm-berm-cobble-bar",
            "difficulty": "challenging",
            "default_median_cobble_diameter_mm": 125.0,
            "default_kelp_wrack_depth_cm": 18.0,
            "default_berm_slope_deg": 16.0,
            "default_swell_height_m": 1.8,
            "default_pack_load_kg": 15.0,
            "footwear_recommendation": (
                "High-cuff B1/scree leather mountaineering or trekking boots with full ankle lacing, "
                "heavy-duty shingle gaiters, and dual carbide-tip trekking poles."
            ),
            "primary_hazard": (
                "Severe energy drain ('Chesil trudging') on unconsolidated graded flint shingle "
                "combined with plunging Atlantic undertow and steep storm-berm backwash."
            ),
            "navigation_protocol": (
                "Follow the firmest high-water spring berm crest where imbricated flat cobbles pack "
                "horizontally; stay well back from the steep seaward plunge step where Atlantic "
                "dumping waves undercut the shingle bank."
            ),
            "traversal_protocol": (
                "Follow the firmest high-water spring berm crest where imbricated flat cobbles pack "
                "horizontally; stay well back from the steep seaward plunge step where Atlantic "
                "dumping waves undercut the shingle bank."
            ),
            "field_notes": (
                "A classic 29 km barrier shingle tombolo enclosing the Fleet Lagoon, famous for "
                "longshore sediment size grading from pea-sized shingle at West Bay (15 mm) to "
                "fist-sized flint cobbles at Portland Bill (150+ mm)."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "west-coast-trail-boulder-reef-canada",
            "name": "Pachena–Carmanah Intertidal Kelp-Wrack Boulder Reef",
            "country": "Canada",
            "region": "Pacific Rim National Park Reserve, Vancouver Island, BC",
            "length_km": 14.5,
            "elevation": "0 – 3 m MLLW",
            "elevation_m": 3,
            "morphology": "intertidal-boulder-reef",
            "difficulty": "extreme",
            "default_median_cobble_diameter_mm": 280.0,
            "default_kelp_wrack_depth_cm": 48.0,
            "default_berm_slope_deg": 22.0,
            "default_swell_height_m": 2.5,
            "default_pack_load_kg": 21.0,
            "footwear_recommendation": (
                "Tungsten-carbide studded felt/rubber intertidal boots with reinforced ankle cuffs, "
                "quick-release hip belt on expedition pack, and a rigid 3-section wading staff."
            ),
            "primary_hazard": (
                "Rotting Nereocystis/Macrocystis kelp-wrack mats up to 60 cm deep concealing ankle-snapping "
                "boulder voids and surge channels along cliff-pinched headlands (Owen Point)."
            ),
            "navigation_protocol": (
                "Consult Canadian Hydrographic Service tide tables to transit boulder reefs below "
                "1.8 m tide height; probe every kelp-wrack step with a staff before committing pack "
                "weight, and unbuckle hip belt when crossing surge-swept boulder shelves."
            ),
            "traversal_protocol": (
                "Consult Canadian Hydrographic Service tide tables to transit boulder reefs below "
                "1.8 m tide height; probe every kelp-wrack step with a staff before committing pack "
                "weight, and unbuckle hip belt when crossing surge-swept boulder shelves."
            ),
            "field_notes": (
                "Sandstone wave-cut benches and coarse boulder fields between Pachena Point, "
                "Carmanah, and Owen Point where alginate mucilage from decaying bull kelp coats "
                "intertidal boulders in a frictionless biofilm."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "farewell-spit-boulder-bank-nz",
            "name": "Nelson Boulder Bank & Farewell Spit Granodiorite Cobble Bar",
            "country": "New Zealand",
            "region": "Tasman Bay & Golden Bay, Northwest Nelson, South Island",
            "length_km": 13.5,
            "elevation": "0 – 6 m MLLW",
            "elevation_m": 6,
            "morphology": "glacio-fluvial-tombolo",
            "difficulty": "challenging",
            "default_median_cobble_diameter_mm": 165.0,
            "default_kelp_wrack_depth_cm": 22.0,
            "default_berm_slope_deg": 14.5,
            "default_swell_height_m": 1.6,
            "default_pack_load_kg": 16.0,
            "footwear_recommendation": (
                "Rigid Vibram-soled leather trekking boots with ankle-bone malleolus padding and "
                "dual ergonomic trekking poles to stabilize rocking granodiorite cobbles."
            ),
            "primary_hazard": (
                "Unstable sub-rounded Cable Bay granodiorite boulders that pivot underfoot, "
                "compounded by Durvillaea bull-kelp mucilage on the Tasman Bay seaward face."
            ),
            "navigation_protocol": (
                "Traverse the crest or sheltered Haven harbor side during mid-to-low tide; step "
                "dead-center onto large table-flat granodiorite clasts rather than wedging boots "
                "into unstable interstitial cobble crevices."
            ),
            "traversal_protocol": (
                "Traverse the crest or sheltered Haven harbor side during mid-to-low tide; step "
                "dead-center onto large table-flat granodiorite clasts rather than wedging boots "
                "into unstable interstitial cobble crevices."
            ),
            "field_notes": (
                "A 13.5 km natural cuspate boulder barrier (Te Taero a Kereopa) formed by longshore "
                "drift of Mackay Bluff granodiorite clasts, paired with the sweeping littoral spit "
                "systems of Golden Bay."
            ),
        }
    ),
]

COBBLE_SPIT_TREKKING_SITES = COBBLE_SPIT_SITES


# ---------------------------------------------------------------------------
# Mandatory 6-Item Cobble Spit & Kelp-Wrack Trekking Gear Checklist
# ---------------------------------------------------------------------------

COBBLE_SPIT_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "High-Cuff Ankle-Stabilizing Boots or Tungsten-Studded Intertidal Footwear",
        "category": "footwear_traction",
        "priority": "essential",
        "rationale": (
            "Prevents lateral talocrural ankle inversion on pivoting storm-berm cobbles and bites "
            "through slick alginate kelp-wrack mucilage on wet boulder reefs."
        ),
    },
    {
        "item": "Dual Carbon/Ergal Trekking Poles with Wide Cobble Baskets & Carbide Tips",
        "category": "balance_probing",
        "priority": "essential",
        "rationale": (
            "Wide baskets prevent pole tips from jamming and snapping inside interstitial boulder "
            "voids while probing blind kelp-wrack depth before committing body weight."
        ),
    },
    {
        "item": "Abrasion-Resistant Cordura Shingle & Scree Gaiters",
        "category": "lower_leg_protection",
        "priority": "essential",
        "rationale": (
            "Blocks pea-gravel, crushed shell, and decaying amphipod-rich kelp wrack from entering "
            "boot collars and guards shins against sharp barnacle-encrusted boulder edges."
        ),
    },
    {
        "item": "Laminated Local Tide Chart, Swell Period Table & Barometric Watch",
        "category": "tidal_navigation",
        "priority": "essential",
        "rationale": (
            "Critical for calculating wave swash runup cutoff windows around cliff-pinched headlands "
            "and avoiding flood-tide drift-log mobilization traps."
        ),
    },
    {
        "item": "Quick-Release Pack Hip Belt & Waterproof Dry-Bag Liner",
        "category": "pack_safety",
        "priority": "essential",
        "rationale": (
            "Enables instant pack jettison if knocked into a surge channel or pinned by a rolling "
            "drift log while keeping emergency insulation dry."
        ),
    },
    {
        "item": "Rigid SAM Malleolus Ankle Splint & Cohesive Compression Wrap",
        "category": "wilderness_first_aid",
        "priority": "essential",
        "rationale": (
            "Lateral ankle sprains and fibular avulsion fractures are the #1 evacuation injury on "
            "unconsolidated shingle spits and kelp-covered boulder reefs."
        ),
    },
]


# ---------------------------------------------------------------------------
# Catalog Accessors & Filtering
# ---------------------------------------------------------------------------


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 reference coastal cobble spit & boulder reef sites."""
    return list(COBBLE_SPIT_SITES)


def get_all_cobble_spit_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Return a single cobble spit site by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in COBBLE_SPIT_SITES:
        if str(site["id"]).lower() == target:
            return site
    return None


def get_cobble_spit_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """Filter cobble spit sites by country, morphology, difficulty, or free-text search."""
    results: list[dict[str, Any]] = list(COBBLE_SPIT_SITES)

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
    """Return the 6-item mandatory cobble spit & kelp-wrack trekking gear checklist."""
    return list(COBBLE_SPIT_GEAR_CHECKLIST)


# ---------------------------------------------------------------------------
# Physics-Based Cobble Spit & Kelp-Wrack Boulder Reef Calculator
# ---------------------------------------------------------------------------


def calculate_cobble_spit_trekking(
    median_cobble_diameter_mm: float = 110.0,
    kelp_wrack_depth_cm: float = 18.0,
    berm_slope_deg: float = 12.0,
    swell_height_m: float = 1.2,
    pack_load_kg: float = 14.0,
) -> dict[str, Any]:
    """Calculate alginate mucilage slip friction, ankle-roll torque, swash runup cutoff, and effective pace.

    Parameters
    ----------
    median_cobble_diameter_mm:
        Median D50 clast diameter of shingle/cobble/boulder substrate in mm [16, 600].
    kelp_wrack_depth_cm:
        Thickness of decaying intertidal kelp wrack mat in cm [0, 150].
    berm_slope_deg:
        Foreshore storm-berm or boulder reef transverse slope angle in degrees [0, 40].
    swell_height_m:
        Significant nearshore wave swell height in meters [0, 8].
    pack_load_kg:
        Carried backpack load in kilograms [0, 45].
    """
    if not (16.0 <= median_cobble_diameter_mm <= 600.0):
        raise ValueError("median_cobble_diameter_mm must be between 16 and 600 mm")
    if not (0.0 <= kelp_wrack_depth_cm <= 150.0):
        raise ValueError("kelp_wrack_depth_cm must be between 0 and 150 cm")
    if not (0.0 <= berm_slope_deg <= 40.0):
        raise ValueError("berm_slope_deg must be between 0 and 40 degrees")
    if not (0.0 <= swell_height_m <= 8.0):
        raise ValueError("swell_height_m must be between 0 and 8 meters")
    if not (0.0 <= pack_load_kg <= 45.0):
        raise ValueError("pack_load_kg must be between 0 and 45 kg")

    # 1. Alginate mucilage slip coefficient (μ): dry/damp cobble (~0.56) drops with kelp wrack depth & wave spray
    wrack_penalty = min(
        0.38,
        (kelp_wrack_depth_cm / 150.0) * 0.36 + (0.0022 * min(kelp_wrack_depth_cm, 50.0)),
    )
    spray_wetting = min(0.10, swell_height_m * 0.015)
    mucilage_slip_coefficient = round(
        max(0.06, min(0.62, 0.56 - wrack_penalty - spray_wetting)),
        3,
    )

    # 2. Ankle-roll torque index (0 - 100 scale): clast lever arm + berm canting + pack load + blind kelp voids
    cobble_component = ((median_cobble_diameter_mm - 16.0) / 584.0) * 42.0
    slope_component = (berm_slope_deg / 40.0) * 26.0
    pack_component = (pack_load_kg / 45.0) * 18.0
    wrack_blindness = (kelp_wrack_depth_cm / 150.0) * 14.0
    ankle_roll_torque_index = round(
        max(2.0, min(100.0, cobble_component + slope_component + pack_component + wrack_blindness)),
        1,
    )

    # 3. Wave swash runup cutoff window (minutes remaining before foreshore pinch/overwash)
    swell_erosion = swell_height_m * 24.5
    slope_pinch = berm_slope_deg * 1.45
    wrack_delay = kelp_wrack_depth_cm * 0.25
    swash_runup_cutoff_minutes = round(
        max(0.0, min(240.0, 180.0 - swell_erosion - slope_pinch - wrack_delay)),
        1,
    )

    # 4. Effective shingle/boulder progression pace (km/h)
    cobble_drag = ((median_cobble_diameter_mm - 16.0) / 584.0) * 1.45
    wrack_drag = (kelp_wrack_depth_cm / 150.0) * 1.15
    slope_drag = (berm_slope_deg / 40.0) * 0.75
    load_drag = (pack_load_kg / 45.0) * 0.55
    effective_pace_km_h = round(
        max(0.35, min(4.5, 4.1 - cobble_drag - wrack_drag - slope_drag - load_drag)),
        2,
    )

    # 5. Determine Risk Level & Footwear Class
    warnings: list[str] = []
    recommendations: list[str] = []

    if (
        swash_runup_cutoff_minutes <= 35.0
        or swell_height_m >= 3.8
        or ankle_roll_torque_index >= 65.0
        or mucilage_slip_coefficient < 0.16
        or kelp_wrack_depth_cm >= 85.0
    ):
        risk_level: CobbleSpitRiskLevel = "critical"
        footwear_class: CobbleSpitFootwearClass = "abort-swash-overwash-entrapment"
    elif (
        median_cobble_diameter_mm >= 200.0
        or kelp_wrack_depth_cm >= 35.0
        or swell_height_m >= 2.2
        or ankle_roll_torque_index >= 38.0
        or mucilage_slip_coefficient < 0.28
        or swash_runup_cutoff_minutes <= 75.0
    ):
        risk_level = "high"
        footwear_class = "tungsten-studded-felt-boot-wading-staff"
    elif (
        median_cobble_diameter_mm >= 80.0
        or kelp_wrack_depth_cm >= 12.0
        or berm_slope_deg >= 11.0
        or swell_height_m >= 1.2
        or ankle_roll_torque_index >= 18.0
    ):
        risk_level = "moderate"
        footwear_class = "high-cuff-scree-boot-dual-poles"
    else:
        risk_level = "low"
        footwear_class = "trail-runner-trekking-poles"

    # Populate actionable warnings
    if kelp_wrack_depth_cm >= 30.0:
        warnings.append(
            f"Deep decaying kelp-wrack mat ({kelp_wrack_depth_cm:.0f} cm) creates a severe alginate "
            f"mucilage slip hazard (μ = {mucilage_slip_coefficient:.3f}) and conceals interstitial boulder voids."
        )
    if ankle_roll_torque_index >= 40.0:
        warnings.append(
            f"High ankle-roll inversion torque index ({ankle_roll_torque_index:.1f}/100) on "
            f"{median_cobble_diameter_mm:.0f} mm clasts at {berm_slope_deg:.1f}° berm slope with {pack_load_kg:.1f} kg pack."
        )
    if swell_height_m >= 2.2 or swash_runup_cutoff_minutes <= 60.0:
        warnings.append(
            f"SWASH OVERWASH & DRIFT-LOG ENTRAPMENT WARNING: {swell_height_m:.1f} m swell leaves only "
            f"{swash_runup_cutoff_minutes:.0f} min before wave runup reaches the upper drift-log berm or sea cliff."
        )
    if effective_pace_km_h <= 1.5:
        warnings.append(
            f"Severe shingle/boulder energy dissipation reduces effective pace to {effective_pace_km_h:.2f} km/h; "
            "allow 2.5x normal trail transit time."
        )

    # Populate technical recommendations
    if footwear_class == "abort-swash-overwash-entrapment":
        recommendations.append(
            "ABORT FORESHORE TRAVERSE: Do not attempt to round headland boulder reefs or narrow spit "
            "necks under active storm-swell overwash and rolling drift-log mobilization."
        )
        recommendations.append(
            "Retreat to high inland headland trails or wait for a falling spring low-tide window."
        )
    elif footwear_class == "tungsten-studded-felt-boot-wading-staff":
        recommendations.append(
            "Equip tungsten-carbide studded intertidal boots and probe every kelp-covered step "
            "with a rigid wading staff or dual poles before committing pack weight."
        )
        recommendations.append(
            "Unbuckle backpack hip-belt buckle when traversing surge-swept boulder shelves."
        )
    elif footwear_class == "high-cuff-scree-boot-dual-poles":
        recommendations.append(
            "Wear high-cuff ankle-stabilizing trekking boots with shingle gaiters and use dual "
            "trekking poles fitted with wide baskets to prevent pole-tip wedging."
        )
        recommendations.append(
            "Walk along the compacted damp mid-tide shingle ribbon or imbricated storm-berm crest."
        )
    else:
        recommendations.append(
            "Stiff-shank trail runners with low scree gaiters and trekking poles are suitable on "
            "low-angle pebble/shingle spits during calm swell windows."
        )

    recommendations.append(
        "Step squarely onto the center of large flat clasts and never rest on or between "
        "partially buoyant drift logs near the swash line."
    )

    return _AttrDict(
        {
            "median_cobble_diameter_mm": round(median_cobble_diameter_mm, 1),
            "kelp_wrack_depth_cm": round(kelp_wrack_depth_cm, 1),
            "berm_slope_deg": round(berm_slope_deg, 1),
            "swell_height_m": round(swell_height_m, 2),
            "pack_load_kg": round(pack_load_kg, 1),
            "mucilage_slip_coefficient": mucilage_slip_coefficient,
            "ankle_roll_torque_index": ankle_roll_torque_index,
            "swash_runup_cutoff_minutes": swash_runup_cutoff_minutes,
            "effective_pace_km_h": effective_pace_km_h,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "footwear_class": footwear_class,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


# ---------------------------------------------------------------------------
# Intent Detection & Parameter Extraction
# ---------------------------------------------------------------------------

_COBBLE_SPIT_KEYWORDS: tuple[str, ...] = (
    "cobble spit",
    "cobble spits",
    "cobble-spit",
    "shingle spit",
    "shingle spits",
    "shingle beach",
    "shingle tombolo",
    "cobble bar",
    "cobble tombolo",
    "kelp-wrack",
    "kelp wrack",
    "boulder reef",
    "boulder reefs",
    "boulder bank",
    "dungeness spit",
    "chesil beach",
    "nelson boulder bank",
    "farewell spit",
    "intertidal cobble",
    "intertidal boulder",
    "storm-berm cobble",
    "storm berm cobble",
    "drift-log berm",
    "drift log berm",
    "mucilage slip",
    "alginate mucilage",
    "swash runup",
    "pachena",
    "carmanah",
    "cuspate-shingle-spit",
    "storm-berm-cobble-bar",
    "intertidal-boulder-reef",
    "glacio-fluvial-tombolo",
)

_COBBLE_SPIT_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return policy",
    "shipping",
    "tracking number",
    "invoice",
    "cancel my order",
    # Beachcombing / sea glass exclusions
    "sea glass",
    "vaseline glass",
    "uranium glass",
    "hydration patina",
    "glass beach",
    "fort bragg",
    # Subtidal kelp freediving exclusions
    "kelp freediving",
    "kelp free-diving",
    "kelp free diving",
    "duck dive",
    "benthic quadrat",
    "apnea",
    "point lobos",
    "anacapa",
    "great african seaforest",
    # Mudflat / wattwandern exclusions
    "wattwandern",
    "quicksilt",
    "prielen",
    "prikken",
    "wadden sea",
    # Sea-cave pneumatics / blowhole exclusions
    "blowhole",
    "pneumatic wave",
    "pneumatic overpressure",
    "fingal's cave",
    "fingals cave",
    "devils punchbowl",
    "devil's punchbowl",
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
    # Mangrove labyrinth exclusions
    "mangrove",
    "pneumatophore",
    "prop root",
    "prop-root",
    "rhizophora",
    "hell bay",
    "sundarbans",
)


def is_cobble_spit_trekking_query(query: str) -> bool:
    """Return True if the user query is asking about coastal cobble spit or kelp-wrack boulder reef trekking."""
    if not query or not query.strip():
        return False
    q_lower = query.lower()

    if any(excl in q_lower for excl in _COBBLE_SPIT_EXCLUSIONS):
        return False

    return any(kw in q_lower for kw in _COBBLE_SPIT_KEYWORDS)


def detect_cobble_spit_trekking_intent(query: str) -> bool:
    """Alias for is_cobble_spit_trekking_query()."""
    return is_cobble_spit_trekking_query(query)


def extract_cobble_spit_trekking_params(query: str) -> dict[str, Any]:
    """Extract cobble spit site ID and numerical calculator parameters from a natural-language query."""
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = None

    if "dungeness" in q_lower or ("olympic" in q_lower and "spit" in q_lower):
        matched_site = get_site_by_id("dungeness-spit-olympic-usa")
    elif "chesil" in q_lower or "dorset" in q_lower or "portland" in q_lower or "fleet" in q_lower:
        matched_site = get_site_by_id("chesil-beach-fleet-uk")
    elif (
        "west coast trail" in q_lower
        or "pachena" in q_lower
        or "carmanah" in q_lower
        or "owen point" in q_lower
        or "vancouver island" in q_lower
    ):
        matched_site = get_site_by_id("west-coast-trail-boulder-reef-canada")
    elif (
        "farewell spit" in q_lower
        or "nelson boulder bank" in q_lower
        or "boulder bank" in q_lower
        or "new zealand" in q_lower
        or "tasman bay" in q_lower
    ):
        matched_site = get_site_by_id("farewell-spit-boulder-bank-nz")

    cobble_mm = float(matched_site["default_median_cobble_diameter_mm"]) if matched_site else 110.0
    wrack_cm = float(matched_site["default_kelp_wrack_depth_cm"]) if matched_site else 18.0
    slope_deg = float(matched_site["default_berm_slope_deg"]) if matched_site else 12.0
    swell_m = float(matched_site["default_swell_height_m"]) if matched_site else 1.2
    load_kg = float(matched_site["default_pack_load_kg"]) if matched_site else 14.0

    has_explicit_numbers = False

    mm_match = re.search(r"(\d+(?:\.\d+)?)\s*mm\b", q_lower)
    if mm_match:
        val = float(mm_match.group(1))
        if 16.0 <= val <= 600.0:
            cobble_mm = val
            has_explicit_numbers = True

    cm_match = re.search(r"(\d+(?:\.\d+)?)\s*cm\b", q_lower)
    if cm_match:
        val = float(cm_match.group(1))
        if 0.0 <= val <= 150.0:
            wrack_cm = val
            has_explicit_numbers = True

    slope_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:deg|degree|degrees|°)\s*(?:berm|slope|foreshore)?",
        q_lower,
    )
    if slope_match:
        val = float(slope_match.group(1))
        if 0.0 <= val <= 40.0:
            slope_deg = val
            has_explicit_numbers = True

    swell_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:swell|wave|waves|surf)",
        q_lower,
    )
    if swell_match:
        val = float(swell_match.group(1))
        if 0.0 <= val <= 8.0:
            swell_m = val
            has_explicit_numbers = True

    kg_match = re.search(r"(\d+(?:\.\d+)?)\s*kg\b", q_lower)
    if kg_match:
        val = float(kg_match.group(1))
        if 0.0 <= val <= 45.0:
            load_kg = val
            has_explicit_numbers = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "matched_site": matched_site,
        "median_cobble_diameter_mm": cobble_mm,
        "kelp_wrack_depth_cm": wrack_cm,
        "berm_slope_deg": slope_deg,
        "swell_height_m": swell_m,
        "pack_load_kg": load_kg,
        "has_explicit_numbers": has_explicit_numbers,
    }


def format_cobble_spit_trekking_response(query: str) -> dict[str, Any]:
    """Build a structured response dictionary for a cobble spit trekking query."""
    params: dict[str, Any] = extract_cobble_spit_trekking_params(query)
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = params["matched_site"]

    calc_result: dict[str, Any] = calculate_cobble_spit_trekking(
        median_cobble_diameter_mm=float(params["median_cobble_diameter_mm"]),
        kelp_wrack_depth_cm=float(params["kelp_wrack_depth_cm"]),
        berm_slope_deg=float(params["berm_slope_deg"]),
        swell_height_m=float(params["swell_height_m"]),
        pack_load_kg=float(params["pack_load_kg"]),
    )

    is_calc_request = bool(
        params["has_explicit_numbers"]
        or any(
            w in q_lower
            for w in (
                "calculate",
                "calculator",
                "mucilage",
                "ankle roll",
                "torque",
                "swash runup",
                "traction for",
            )
        )
    )

    if is_calc_request:
        action = "cobble_spit_trekking_calculated"
    elif matched_site is not None:
        action = "cobble_spit_trekking_lookup"
    else:
        action = "cobble_spit_trekking_info"

    site_summary = (
        f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']} — "
        f"{matched_site['length_km']} km, morphology: `{matched_site['morphology']}`): "
        f"{matched_site['navigation_protocol']} "
        if matched_site
        else "Coastal shingle spits, storm-berm tombolos, and intertidal kelp-wrack boulder reefs "
        "demand careful management of alginate mucilage slip, clast-inversion ankle torque, and wave swash runup windows. "
    )

    answer = (
        f"{site_summary}"
        f"For **{calc_result['median_cobble_diameter_mm']} mm median cobbles** with "
        f"**{calc_result['kelp_wrack_depth_cm']} cm kelp-wrack depth** on a "
        f"**{calc_result['berm_slope_deg']}° berm slope** under **{calc_result['swell_height_m']} m swell** "
        f"({calc_result['pack_load_kg']} kg pack), the modeled mucilage slip coefficient is "
        f"**{calc_result['mucilage_slip_coefficient']}**, ankle-roll torque index is "
        f"**{calc_result['ankle_roll_torque_index']}/100**, swash runup cutoff is "
        f"**{calc_result['swash_runup_cutoff_minutes']} min**, effective pace is "
        f"**{calc_result['effective_pace_km_h']} km/h**, and risk level is "
        f"**{calc_result['risk_level'].upper()}** (recommended footwear: `{calc_result['footwear_class']}`)."
    )

    return _AttrDict(
        {
            "action": action,
            "answer": answer,
            "matched_site": matched_site,
            "calculation": calc_result,
            "sites": COBBLE_SPIT_SITES,
            "checklist": COBBLE_SPIT_GEAR_CHECKLIST,
        }
    )


def build_cobble_spit_trekking_prompt(query: str = "") -> str:
    """Build system prompt context for LLM calls involving coastal cobble spit & kelp-wrack boulder reef trekking."""
    info: dict[str, Any] = (
        format_cobble_spit_trekking_response(query)
        if query
        else format_cobble_spit_trekking_response("cobble spit")
    )
    calc: dict[str, Any] = info["calculation"]
    matched_site: dict[str, Any] | None = info.get("matched_site")

    lines: list[str] = [
        "### Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking Context",
        "- **Geomorphic Regimes**: Cuspate shingle spits & drift-log berms (e.g., Dungeness Spit), "
        "size-graded flint/chert storm-berm tombolos (e.g., Chesil Beach), intertidal kelp-wrack "
        "boulder reefs (e.g., West Coast Trail Pachena–Carmanah), and glacio-fluvial granodiorite "
        "boulder banks (e.g., Nelson Boulder Bank & Farewell Spit).",
        f"- **Calculated Intertidal Substrate Physics**: CobbleD50={calc['median_cobble_diameter_mm']}mm, "
        f"KelpWrack={calc['kelp_wrack_depth_cm']}cm, BermSlope={calc['berm_slope_deg']}°, "
        f"Swell={calc['swell_height_m']}m, Pack={calc['pack_load_kg']}kg -> "
        f"Mucilage Slip μ={calc['mucilage_slip_coefficient']}, Ankle Torque Index={calc['ankle_roll_torque_index']}/100, "
        f"Swash Runup Cutoff={calc['swash_runup_cutoff_minutes']}min, Effective Pace={calc['effective_pace_km_h']}km/h, "
        f"Risk={calc['risk_level']}, Footwear={calc['footwear_class']}.",
    ]
    if matched_site:
        lines.append(
            f"- **Focused Cobble Spit Site**: {matched_site['name']} ({matched_site['country']}) — "
            f"Primary Hazard: {matched_site['primary_hazard']} | Protocol: {matched_site['navigation_protocol']}"
        )
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response dictionary for a cobble spit trekking query."""
    info: dict[str, Any] = format_cobble_spit_trekking_response(query)
    return {
        "answer": info["answer"],
        "cobble_spit_trekking_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[str, None, None]:
    """Yield SSE stream chunks for a cobble spit trekking query."""
    info: dict[str, Any] = format_cobble_spit_trekking_response(query)
    yield f"data: {json.dumps({'action': info['action'], 'cobble_spit_trekking_info': info})}\n\n"
    yield f"data: {json.dumps({'content': info['answer'], 'answer': info['answer']})}\n\n"
    yield "data: [DONE]\n\n"
