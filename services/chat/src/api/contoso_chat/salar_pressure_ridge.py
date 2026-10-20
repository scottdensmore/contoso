"""High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking Guide.

Covers South American Andean & Puna salar evaporite basin expeditions:
- Salar de Uyuni: Isla Incahuasi & Colchani Ojos del Salar Perimeter (Potosi, Bolivia)
- Salar de Atacama: Laguna Chaxa, Soncor & Cordillera de la Sal Traverse (Antofagasta, Chile)
- Salar de Arizaro: Cono de Arita & Black-Halite Pressure-Ridge Basin (Salta Puna, Argentina)
- Salar de Chalviri: Termas de Polques & Laguna Salada Borate-Mirabilite Margin (Eduardo Avaroa, Bolivia)

Deterministic calculator evaluates:
- Crust punch-through probability (%)
- Effective albedo-amplified UV dose index
- Sole laceration wear rate (mm / 10 km)
- Eutectic brine hypothermia immersion risk (%)
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from typing import Any


class SalarPressureRidgeSite(dict[str, Any]):
    """Dictionary subclass supporting attribute access for salar pressure-ridge sites."""

    def __getattr__(self, name: str) -> Any:
        try:
            return self[name]
        except KeyError as exc:
            raise AttributeError(
                f"'SalarPressureRidgeSite' object has no attribute '{name}'"
            ) from exc


SALAR_PRESSURE_RIDGE_SITES: list[SalarPressureRidgeSite] = [
    SalarPressureRidgeSite(
        {
            "id": "uyuni-incahuasi-ojos-bolivia",
            "name": "Salar de Uyuni: Isla Incahuasi & Colchani Ojos del Salar Perimeter",
            "country": "Bolivia",
            "region": "Potosi Altiplano (Daniel Campos / Nor Lipez)",
            "elevation_range": "3,656 m",
            "max_elevation_m": 3656,
            "morphology": "ojos-del-salar-brine-upwelling",
            "difficulty": "challenging",
            "default_crust_thickness_cm": 24.0,
            "default_brine_eye_proximity_m": 14.0,
            "default_ridge_relief_cm": 34.0,
            "default_solar_uv_index": 16.0,
            "default_packsled_load_kg": 48.0,
            "primary_hazard": (
                "Sub-crustal pressurized lithium-magnesium brine eyes (Ojos del Salar) masked by "
                "thin translucent efflorescent salt skins and dual-hemisphere 0.85+ UV albedo."
            ),
            "traversal_strategy": (
                "Maintain a minimum 25 m standoff arc around bubbling Ojos del Salar vents near "
                "Colchani and Isla Incahuasi; probe grey or wet-sheen polygon sutures with a "
                "graduated T-handle brine sounding rod before committing packsled weight."
            ),
            "navigation_protocol": (
                "Sight bearings off Isla Incahuasi and Tunupa volcano before midday thermal shimmer "
                "destabilizes the horizon; log dual-frequency GNSS waypoints across featureless "
                "polygonal halite basins."
            ),
            "progression_protocol": (
                "Step squarely onto flat central polygon plates rather than uplifted suture seams; "
                "tow the UHMWPE packsled on a 6 m floating spectra tether to distribute axle load."
            ),
            "field_notes": (
                "After rainy-season sheet flooding (Jan-Mar), freshly precipitated halite needles "
                "conceal hollow gas-vent chimneys along the Colchani littoral transition."
            ),
        }
    ),
    SalarPressureRidgeSite(
        {
            "id": "atacama-soncor-cordillera-sal-chile",
            "name": "Salar de Atacama: Laguna Chaxa, Soncor & Cordillera de la Sal Traverse",
            "country": "Chile",
            "region": "Antofagasta Region (El Loa / Los Flamencos National Reserve)",
            "elevation_range": "2,305 m - 2,620 m",
            "max_elevation_m": 2620,
            "morphology": "corrugated-gypsum-chevron-crust",
            "difficulty": "extreme",
            "default_crust_thickness_cm": 11.0,
            "default_brine_eye_proximity_m": 8.0,
            "default_ridge_relief_cm": 72.0,
            "default_solar_uv_index": 18.5,
            "default_packsled_load_kg": 55.0,
            "primary_hazard": (
                "Razor-sharp 40-90 cm buckled halite-gypsum chevron pressure ridges ("
                "costra rugosa) capable of shredding Vibram lugs and boot randing within 15 km, "
                "paired with hyper-arid solar dehydration."
            ),
            "traversal_strategy": (
                "Follow inter-ridge deflation troughs parallel to Cordillera de la Sal fold axes; "
                "strap Kevlar/TPU sole over-gaiters over mountaineering boots and carry packs "
                "rather than dragging sleds across high-relief chevron fields."
            ),
            "navigation_protocol": (
                "Use high-contrast SAR/optical satellite overlays to skirt active Soncor brine "
                "lagoons (Laguna Chaxa / Barros Negros) and avoid acoustic-fracturing cavernous "
                "gypsum blisters."
            ),
            "progression_protocol": (
                "Test every overarching chevron crest for hollow underside voids with a steel-tipped "
                "trekking pole before stepping; inspect boot midsoles and crampon straps every 5 km."
            ),
            "field_notes": (
                "Diurnal thermal expansion causes audible cracking across the Cordillera de la Sal "
                "halite domes at dusk; carry 7 L/day water plus hypertonic electrolyte packets."
            ),
        }
    ),
    SalarPressureRidgeSite(
        {
            "id": "arizaro-cono-arita-puna-argentina",
            "name": "Salar de Arizaro: Cono de Arita & Black-Halite Pressure-Ridge Basin",
            "country": "Argentina",
            "region": "Salta Province (Tolar Grande / Puna de Atacama)",
            "elevation_range": "3,475 m - 3,690 m",
            "max_elevation_m": 3690,
            "morphology": "polygonal-halite-pressure-crust",
            "difficulty": "extreme",
            "default_crust_thickness_cm": 15.0,
            "default_brine_eye_proximity_m": 12.0,
            "default_ridge_relief_cm": 64.0,
            "default_solar_uv_index": 17.5,
            "default_packsled_load_kg": 60.0,
            "primary_hazard": (
                "Jagged iron-and-clay-stained black-halite thrust polygons around the Cono de Arita "
                "sandstone-salt volcanic cone, combined with 75+ km/h Puna afternoon katabatic gales."
            ),
            "traversal_strategy": (
                "Execute main basin crossings between 05:30 and 11:30 local time before Puna wind "
                "scour peaks; select older weathered polygon corridors north of the Cono de Arita "
                "apron where thrust-ridge teeth are partially rounded."
            ),
            "navigation_protocol": (
                "Lock dead-reckoning compass back-azimuths onto the 200 m Cono de Arita pyramid "
                "and Socompa/Llullaillaco summits; establish wind-walled halite-block bivouacs "
                "before 14:00."
            ),
            "progression_protocol": (
                "Rig twin Rigid tow-bars on the UHMWPE expedition sled to prevent side-slipping into "
                "knife-edged halite crevices during crosswind gusts."
            ),
            "field_notes": (
                "Arizaro's dark windblown volcanic ash lowers surface albedo locally and accelerates "
                "differential solar melting along subsurface brine pockets."
            ),
        }
    ),
    SalarPressureRidgeSite(
        {
            "id": "chalviri-termas-polques-bolivia",
            "name": "Salar de Chalviri: Termas de Polques & Laguna Salada Borate-Mirabilite Margin",
            "country": "Bolivia",
            "region": "Sud Lipez (Eduardo Avaroa Andean Fauna National Reserve)",
            "elevation_range": "4,398 m",
            "max_elevation_m": 4398,
            "morphology": "borate-mirabilite-mud-margin",
            "difficulty": "moderate",
            "default_crust_thickness_cm": 18.0,
            "default_brine_eye_proximity_m": 16.0,
            "default_ridge_relief_cm": 22.0,
            "default_solar_uv_index": 19.0,
            "default_packsled_load_kg": 35.0,
            "primary_hazard": (
                "Sub-zero (-12 C) eutectic sodium-sulfate (mirabilite/ulexite) slush trenches and "
                "deceptive thermal seepage aprons near Termas de Polques that trigger rapid immersion "
                "hypothermia and chemical boot desiccation."
            ),
            "traversal_strategy": (
                "Cross the Laguna Salada borate-mirabilite flats at dawn when nocturnal freezing "
                "consolidates the hydrated sodium-sulfate crust; detour upslope onto firm alluvial "
                "gravels around active Polques hydrothermal outflows."
            ),
            "navigation_protocol": (
                "Track shoreline colour transitions from bright chalky white ulexite domes (firm) "
                "to olive-grey saturated borate ooze (breakthrough hazard)."
            ),
            "progression_protocol": (
                "Wear sealed neoprene-lined overboots and Rinse all footwear, crampon bindings, "
                "and probe ferrules with fresh water immediately after exiting the salar margin."
            ),
            "field_notes": (
                "At nearly 4,400 m elevation, extreme UV-B flux and pre-dawn -18 C windchill demand "
                "simultaneous Category-4 ocular shielding and full cold-injury mitigation."
            ),
        }
    ),
]

SALAR_SITES: list[SalarPressureRidgeSite] = SALAR_PRESSURE_RIDGE_SITES

SALAR_PRESSURE_RIDGE_GEAR_CHECKLIST: list[dict[str, str]] = [
    {
        "item": "Category-4 Glacier Wrap Sunglasses & Dual-Hemisphere UV Lip/Nose Zinc Shield",
        "category": "Ocular & Solar Protection",
        "priority": "essential",
        "rationale": (
            "Crystalline halite crusts reflect 80-88% of incident UV-A/UV-B upward from the basin "
            "floor, causing acute photokeratitis (salar snow-blindness) and sub-chin thermal burns "
            "within 45 minutes of unprotected exposure."
        ),
    },
    {
        "item": "Graduated 150 cm T-Handle Stainless Brine-Crust Sounding Probe",
        "category": "Sub-Crustal Hazard Detection",
        "priority": "essential",
        "rationale": (
            "Measures effective halite plate thickness and detects hollow gas-vent chimneys or "
            "pressurized Ojos del Salar brine lenses before committing packsled or trekker weight."
        ),
    },
    {
        "item": "Abrasion-Armored Kevlar/TPU Over-Gaiters & Sacrificial Vibram Sole Savers",
        "category": "Footwear & Laceration Defense",
        "priority": "essential",
        "rationale": (
            "Buckled polygonal halite-gypsum pressure ridges (costra rugosa) act like coarse carbide "
            "rasps that shear boot welt stitching and strip 3-8 mm of rubber tread per 10 km."
        ),
    },
    {
        "item": "UHMWPE High-Clearance Expedition Packsled with 6 m Floating Spectra Tow Tether",
        "category": "Load Distribution & Haulage",
        "priority": "essential",
        "rationale": (
            "Distributes 35-120 kg expedition water and winter bivouac loads below 12 kPa ground "
            "pressure while allowing the trekker to unclip or belay across thin brine-eye margins."
        ),
    },
    {
        "item": "Freshwater Desalination Rinse Bottle & Silicone Boot/Ferrule Barrier Balm",
        "category": "Chemical Corrosion & Skin Care",
        "priority": "essential",
        "rationale": (
            "Saturated lithium-magnesium-borate brines aggressively desiccate leather, corrode "
            "aluminum probe locks, and cause painful halite crystal fissuring on exposed skin."
        ),
    },
    {
        "item": "Dual-Frequency GNSS Receiver & Laser Rangefinder with High-Contrast Horizon Targets",
        "category": "Featureless Basin Navigation",
        "priority": "essential",
        "rationale": (
            "Midday refractive shimmer and zero-relief whiteout horizons obliterate visual depth "
            "perception across 50+ km salar expanses."
        ),
    },
]


def get_all_sites() -> list[SalarPressureRidgeSite]:
    """Return all 4 high-altitude salar pressure-ridge sites."""
    return list(SALAR_PRESSURE_RIDGE_SITES)


def get_all_salar_pressure_ridge_sites() -> list[SalarPressureRidgeSite]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_gear_checklist() -> list[dict[str, str]]:
    """Return the 6 essential gear checklist items for salar pressure-ridge trekking."""
    return [dict(item) for item in SALAR_PRESSURE_RIDGE_GEAR_CHECKLIST]


def get_site_by_id(site_id: str) -> SalarPressureRidgeSite | None:
    """Lookup a salar pressure-ridge site by exact ID or fuzzy substring match."""
    if not site_id or not site_id.strip():
        return None
    norm = site_id.strip().lower()
    for site in SALAR_PRESSURE_RIDGE_SITES:
        if site["id"].lower() == norm:
            return site

    alias_map = {
        "uyuni": "uyuni-incahuasi-ojos-bolivia",
        "incahuasi": "uyuni-incahuasi-ojos-bolivia",
        "colchani": "uyuni-incahuasi-ojos-bolivia",
        "ojos del salar": "uyuni-incahuasi-ojos-bolivia",
        "atacama": "atacama-soncor-cordillera-sal-chile",
        "chaxa": "atacama-soncor-cordillera-sal-chile",
        "soncor": "atacama-soncor-cordillera-sal-chile",
        "cordillera de la sal": "atacama-soncor-cordillera-sal-chile",
        "arizaro": "arizaro-cono-arita-puna-argentina",
        "cono de arita": "arizaro-cono-arita-puna-argentina",
        "arita": "arizaro-cono-arita-puna-argentina",
        "chalviri": "chalviri-termas-polques-bolivia",
        "polques": "chalviri-termas-polques-bolivia",
        "laguna salada": "chalviri-termas-polques-bolivia",
    }
    for alias, target_id in alias_map.items():
        if alias in norm:
            for site in SALAR_PRESSURE_RIDGE_SITES:
                if site["id"] == target_id:
                    return site

    for site in SALAR_PRESSURE_RIDGE_SITES:
        if norm in site["id"].lower() or norm in site["name"].lower():
            return site
    return None


def get_salar_pressure_ridge_site_by_id(site_id: str) -> SalarPressureRidgeSite | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[SalarPressureRidgeSite]:
    """Filter salar pressure-ridge sites by country, morphology, difficulty, and free-text search."""
    results = list(SALAR_PRESSURE_RIDGE_SITES)
    if country and country.strip():
        c_norm = country.strip().lower()
        results = [s for s in results if s["country"].lower() == c_norm]
    if morphology and morphology.strip():
        m_norm = morphology.strip().lower()
        results = [s for s in results if m_norm in s["morphology"].lower()]
    if difficulty and difficulty.strip():
        d_norm = difficulty.strip().lower()
        results = [s for s in results if s["difficulty"].lower() == d_norm]
    if search and search.strip():
        q_norm = search.strip().lower()
        results = [
            s
            for s in results
            if q_norm in s["id"].lower()
            or q_norm in s["name"].lower()
            or q_norm in s["country"].lower()
            or q_norm in s["region"].lower()
            or q_norm in s["morphology"].lower()
            or q_norm in s["primary_hazard"].lower()
            or q_norm in s["traversal_strategy"].lower()
            or q_norm in s["field_notes"].lower()
        ]
    return results


def calculate_salar_pressure_ridge(
    crust_thickness_cm: float = 24.0,
    brine_eye_proximity_m: float = 18.0,
    ridge_relief_cm: float = 35.0,
    solar_uv_index: float = 15.0,
    packsled_load_kg: float = 45.0,
) -> dict[str, Any]:
    """Calculate salar halite crust punch-through, albedo UV dose, sole wear, and brine immersion risk.

    Raises ValueError if any input is outside validated physical bounds:
    - crust_thickness_cm: 0.5 to 150.0 cm
    - brine_eye_proximity_m: 0.5 to 200.0 m
    - ridge_relief_cm: 2.0 to 120.0 cm
    - solar_uv_index: 1.0 to 22.0
    - packsled_load_kg: 8.0 to 150.0 kg
    """
    if not (0.5 <= crust_thickness_cm <= 150.0):
        raise ValueError(
            f"crust_thickness_cm must be between 0.5 and 150.0 cm (got {crust_thickness_cm})"
        )
    if not (0.5 <= brine_eye_proximity_m <= 200.0):
        raise ValueError(
            f"brine_eye_proximity_m must be between 0.5 and 200.0 m (got {brine_eye_proximity_m})"
        )
    if not (2.0 <= ridge_relief_cm <= 120.0):
        raise ValueError(
            f"ridge_relief_cm must be between 2.0 and 120.0 cm (got {ridge_relief_cm})"
        )
    if not (1.0 <= solar_uv_index <= 22.0):
        raise ValueError(
            f"solar_uv_index must be between 1.0 and 22.0 (got {solar_uv_index})"
        )
    if not (8.0 <= packsled_load_kg <= 150.0):
        raise ValueError(
            f"packsled_load_kg must be between 8.0 and 150.0 kg (got {packsled_load_kg})"
        )

    # 1. Crust punch-through probability (%)
    thickness_component = (
        max(0.0, (45.0 - crust_thickness_cm) / 44.5) * 48.0
        + (220.0 / (crust_thickness_cm + 3.5))
    )
    proximity_component = 95.0 / (brine_eye_proximity_m + 2.0)
    load_component = ((packsled_load_kg - 8.0) / 142.0) * 26.0
    crust_punch_through_probability_pct = round(
        min(99.0, max(1.0, 2.0 + thickness_component + proximity_component + load_component)),
        1,
    )

    # 2. Effective albedo-amplified UV dose index (0.85+ crystalline salt floor reflection + ridge facets)
    albedo_multiplier = 1.62 + min(0.28, (ridge_relief_cm / 120.0) * 0.22)
    effective_albedo_uv_dose_index = round(
        min(42.0, max(1.5, solar_uv_index * albedo_multiplier)),
        1,
    )

    # 3. Sole laceration wear rate (mm / 10 km) from buckled halite-gypsum chevron teeth
    raw_sole_wear = (
        0.25
        + (ridge_relief_cm / 24.0)
        + ((packsled_load_kg - 8.0) / 55.0)
        + (ridge_relief_cm * packsled_load_kg) / 4200.0
    )
    sole_laceration_wear_rate_mm_per_10km = round(
        min(15.0, max(0.2, raw_sole_wear)),
        2,
    )

    # 4. Brine hypothermia & chemical immersion risk (%)
    raw_immersion_risk = (
        crust_punch_through_probability_pct * 0.68
        + (85.0 / (brine_eye_proximity_m + 2.5))
        + ((packsled_load_kg - 8.0) / 142.0) * 14.0
    )
    brine_hypothermia_immersion_risk_pct = round(
        min(99.0, max(1.0, raw_immersion_risk)),
        1,
    )

    # Warnings & recommendations
    warnings: list[str] = []
    recommendations: list[str] = []

    if crust_thickness_cm < 12.0 or crust_punch_through_probability_pct >= 65.0:
        warnings.append(
            f"CRITICAL HALITE CRUST THINNING: {crust_thickness_cm:.1f} cm crust has a "
            f"{crust_punch_through_probability_pct:.1f}% punch-through probability under a "
            f"{packsled_load_kg:.0f} kg packsled load."
        )
        recommendations.append(
            "Probe every 3 m with a graduated 150 cm T-handle sounding rod; unclip direct harness "
            "attachment and belay the UHMWPE packsled on a 6 m floating spectra tether."
        )
    elif crust_thickness_cm < 25.0 or crust_punch_through_probability_pct >= 35.0:
        warnings.append(
            f"MODERATE-TO-HIGH CRUST FLEXURE: {crust_thickness_cm:.1f} cm halite plate requires "
            "strict center-plate foot placement away from moist polygon suture seams."
        )
        recommendations.append(
            "Step onto dry central polygon plates and avoid dark or translucent capillary brine sutures."
        )

    if brine_eye_proximity_m < 12.0 or brine_hypothermia_immersion_risk_pct >= 60.0:
        warnings.append(
            f"OJOS DEL SALAR BRINE-EYE HAZARD: {brine_eye_proximity_m:.1f} m standoff yields a "
            f"{brine_hypothermia_immersion_risk_pct:.1f}% eutectic brine immersion risk."
        )
        recommendations.append(
            "Widen radial clearance to at least 25 m around bubbling Ojos del Salar vents and carry "
            "freshwater rinse bottles to flush corrosive lithium-magnesium brine from skin and boots."
        )

    if ridge_relief_cm >= 45.0 or sole_laceration_wear_rate_mm_per_10km >= 3.5:
        warnings.append(
            f"SEVERE CHEVRON RIDGE ABRASION: {ridge_relief_cm:.0f} cm buckled halite-gypsum ridges "
            f"project {sole_laceration_wear_rate_mm_per_10km:.2f} mm/10 km sole tread laceration."
        )
        recommendations.append(
            "Don Kevlar/TPU abrasion over-gaiters and route along inter-ridge deflation troughs "
            "instead of crest-hopping razor-edged costra rugosa chevrons."
        )

    if effective_albedo_uv_dose_index >= 20.0:
        warnings.append(
            f"EXTREME DUAL-HEMISPHERE ALBEDO UV: Effective UV dose index {effective_albedo_uv_dose_index:.1f} "
            "from 0.85+ crystalline salt reflection threatens acute photokeratitis within 30 minutes."
        )
        recommendations.append(
            "Enforce mandatory Category-4 glacier wrap shields with side-cups, full-face UPF-50+ "
            "balaclava, and sub-nostril/sub-chin zinc oxide block."
        )

    if len(recommendations) < 2:
        recommendations.extend(
            [
                "Maintain Category-4 ocular protection and reapply zinc oxide block every 90 minutes across the reflective halite pan.",
                "Inspect UHMWPE packsled runners and boot rand stitching every 5 km and log GNSS waypoints before midday horizon shimmer peaks.",
            ]
        )

    # Determine overall risk_level
    if (
        crust_punch_through_probability_pct >= 70.0
        or brine_hypothermia_immersion_risk_pct >= 68.0
        or sole_laceration_wear_rate_mm_per_10km >= 6.0
        or effective_albedo_uv_dose_index >= 31.0
    ):
        risk_level = "critical"
        traversal_strategy = (
            "ABORT DIRECT BRINE-EYE LINE: Detour >= 30 m onto consolidated multi-decimeter white "
            "halite plates, deploy 6 m floating packsled tether, probe continuously, and armor "
            "boots with Kevlar/TPU sole gaiters."
        )
    elif (
        crust_punch_through_probability_pct >= 42.0
        or brine_hypothermia_immersion_risk_pct >= 42.0
        or sole_laceration_wear_rate_mm_per_10km >= 3.5
        or effective_albedo_uv_dose_index >= 24.0
    ):
        risk_level = "high"
        traversal_strategy = (
            "HIGH-ALERT SALAR TRAVERSE: Probe grey polygon sutures prior to loading, keep >= 25 m "
            "from Ojos del Salar upwellings, follow inter-ridge troughs to limit sole laceration, "
            "and enforce Category-4 ocular shielding."
        )
    elif (
        crust_punch_through_probability_pct >= 20.0
        or brine_hypothermia_immersion_risk_pct >= 20.0
        or sole_laceration_wear_rate_mm_per_10km >= 2.0
        or effective_albedo_uv_dose_index >= 14.0
    ):
        risk_level = "moderate"
        traversal_strategy = (
            "STANDARD POLYGONAL HALITE PROTOCOL: Step onto central polygon plates, monitor packsled "
            "runner wear across pressure-ridge seams, and maintain full UV-B albedo protection."
        )
    else:
        risk_level = "low"
        traversal_strategy = (
            "CONSOLIDATED HALITE BASIN PROGRESSION: Firm multi-decimeter salt crust permits steady "
            "packsled haulage; maintain routine GNSS bearing checks and ocular UV discipline."
        )

    return {
        "crust_thickness_cm": round(float(crust_thickness_cm), 1),
        "brine_eye_proximity_m": round(float(brine_eye_proximity_m), 1),
        "ridge_relief_cm": round(float(ridge_relief_cm), 1),
        "solar_uv_index": round(float(solar_uv_index), 1),
        "packsled_load_kg": round(float(packsled_load_kg), 1),
        "crust_punch_through_probability_pct": crust_punch_through_probability_pct,
        "effective_albedo_uv_dose_index": effective_albedo_uv_dose_index,
        "sole_laceration_wear_rate_mm_per_10km": sole_laceration_wear_rate_mm_per_10km,
        "brine_hypothermia_immersion_risk_pct": brine_hypothermia_immersion_risk_pct,
        "risk_level": risk_level,
        "safety_status": risk_level,
        "traversal_strategy": traversal_strategy,
        "warnings": warnings,
        "recommendations": recommendations,
    }


_EXPLICIT_SALAR_PRESSURE_RIDGE_TERMS: tuple[str, ...] = (
    "salar pressure ridge",
    "salar-pressure-ridge",
    "salar_pressure_ridge",
    "halite pressure ridge",
    "halite pressure-ridge",
    "polygonal halite pressure",
    "black-halite pressure",
    "black halite pressure",
    "ojos del salar",
    "brine eye",
    "brine-eye",
    "brine pool",
    "brine-pool",
    "brine upwelling",
    "salar de atacama",
    "laguna chaxa",
    "cordillera de la sal",
    "soncor",
    "salar de arizaro",
    "cono de arita",
    "salar de chalviri",
    "termas de polques",
    "laguna salada",
    "mirabilite",
    "borate-mirabilite",
    "costra rugosa",
    "uyuni-incahuasi-ojos-bolivia",
    "atacama-soncor-cordillera-sal-chile",
    "arizaro-cono-arita-puna-argentina",
    "chalviri-termas-polques-bolivia",
    "colchani",
    "isla incahuasi",
)

_SALT_PAN_LEGACY_EXCLUSIONS: tuple[str, ...] = (
    "halite polygon basin",
    "salar-de-uyuni-incahuasi-halite-polygon-basin",
    "salt pan",
    "salt-pan",
    "playa crust",
    "sebkha",
    "sabkha",
    "chott el djerid",
    "makgadikgadi",
    "ntwetwe",
    "sua pan",
    "bonneville",
    "badwater",
    "devil's golf course",
    "devils golf course",
    "fata morgana",
    "mirage compass",
    "water table",
    "core auger",
)

_OTHER_DOMAIN_EXCLUSIONS: tuple[str, ...] = (
    "penitentes",
    "ablation blade",
    "aconcagua",
    "yardang",
    "kalut",
    "dasht-e lut",
    "badain jaran",
    "mega-dune",
    "solfatara",
    "fumarole",
    "el tatio",
    "h2s detector",
    "4-gas",
    "thermokarst",
    "alas depression",
    "drunken forest",
    "ice-wedge",
    "bamboo thicket",
    "bamboo",
    "gypsum karst",
    "gypsum-karst",
    "gypsum_karst",
    "gypsum maze",
    "evaporite karst",
    "anhydrite hydration",
    "hydration dome",
    "optimisticeskaja",
    "optymistychna",
    "ozerna",
    "podolia",
    "vena del gesso",
    "spipola",
    "acquafredda",
    "yesos de sorbas",
    "sorbas",
    "covadura",
    "parks ranch",
    "parks-ranch",
    "swallowtail selenite",
)


def is_salar_pressure_ridge_query(query: str) -> bool:
    """Return True if the user query targets High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking."""
    if not query or not query.strip():
        return False
    q = query.strip().lower()

    has_explicit = any(term in q for term in _EXPLICIT_SALAR_PRESSURE_RIDGE_TERMS)
    if has_explicit:
        return True

    # Exclude legacy salt_pan_navigation or other terrain queries when no explicit salar_pressure_ridge marker is present
    if any(excl in q for excl in _SALT_PAN_LEGACY_EXCLUSIONS):
        return False
    if any(excl in q for excl in _OTHER_DOMAIN_EXCLUSIONS):
        return False

    has_salar_or_halite = any(
        w in q for w in ("salar", "arizaro", "chalviri", "polques", "ulexite", "halite")
    )
    has_ridge_or_mechanic = any(
        w in q
        for w in (
            "pressure ridge",
            "pressure-ridge",
            "ridge relief",
            "sole laceration",
            "packsled",
            "punch-through",
            "punch through",
            "brine",
            "chevron",
            "albedo",
        )
    )
    return has_salar_or_halite and has_ridge_or_mechanic


def detect_salar_pressure_ridge_intent(query: str) -> bool:
    """Alias for is_salar_pressure_ridge_query()."""
    return is_salar_pressure_ridge_query(query)


def extract_salar_pressure_ridge_params(query: str) -> dict[str, Any]:
    """Extract salar site_id and calculator parameters from a natural-language query."""
    q = (query or "").lower()

    matched_site = None
    for token in (
        "uyuni-incahuasi-ojos-bolivia",
        "atacama-soncor-cordillera-sal-chile",
        "arizaro-cono-arita-puna-argentina",
        "chalviri-termas-polques-bolivia",
        "atacama",
        "laguna chaxa",
        "cordillera de la sal",
        "soncor",
        "arizaro",
        "cono de arita",
        "chalviri",
        "termas de polques",
        "polques",
        "laguna salada",
        "uyuni",
        "incahuasi",
        "colchani",
        "ojos del salar",
    ):
        if token in q:
            matched_site = get_site_by_id(token)
            if matched_site is not None:
                break

    site_defaults = matched_site or SALAR_PRESSURE_RIDGE_SITES[0]
    crust_thickness_cm = float(site_defaults["default_crust_thickness_cm"])
    brine_eye_proximity_m = float(site_defaults["default_brine_eye_proximity_m"])
    ridge_relief_cm = float(site_defaults["default_ridge_relief_cm"])
    solar_uv_index = float(site_defaults["default_solar_uv_index"])
    packsled_load_kg = float(site_defaults["default_packsled_load_kg"])
    has_calc_params = False

    # Crust thickness (cm)
    crust_patterns = [
        r"crust\s+thickness\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*cm",
        r"(\d+(?:\.\d+)?)\s*cm\s+(?:halite\s+|salt\s+)?crust(?:\s+thickness)?",
        r"thickness\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*cm",
    ]
    for pat in crust_patterns:
        m = re.search(pat, q)
        if m:
            crust_thickness_cm = max(0.5, min(150.0, float(m.group(1))))
            has_calc_params = True
            break

    # Brine eye proximity (m)
    prox_patterns = [
        r"brine[\s-]+(?:eye|pool|vent)?\s*proximity\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*m\b",
        r"(\d+(?:\.\d+)?)\s*m\s+brine[\s-]+(?:eye|pool|vent)(?:\s+proximity)?",
        r"proximity\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*m\b",
    ]
    for pat in prox_patterns:
        m = re.search(pat, q)
        if m:
            brine_eye_proximity_m = max(0.5, min(200.0, float(m.group(1))))
            has_calc_params = True
            break

    # Ridge relief (cm)
    relief_patterns = [
        r"ridge\s+relief\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*cm",
        r"(\d+(?:\.\d+)?)\s*cm\s+(?:pressure[\s-]+)?ridge\s+relief",
        r"relief\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*cm",
    ]
    for pat in relief_patterns:
        m = re.search(pat, q)
        if m:
            ridge_relief_cm = max(2.0, min(120.0, float(m.group(1))))
            has_calc_params = True
            break

    # Solar UV index
    uv_patterns = [
        r"(?:solar\s+)?uv(?:\s+index)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)",
        r"(\d+(?:\.\d+)?)\s*(?:solar\s+)?uv\s+index",
    ]
    for pat in uv_patterns:
        m = re.search(pat, q)
        if m:
            solar_uv_index = max(1.0, min(22.0, float(m.group(1))))
            has_calc_params = True
            break

    # Packsled load (kg)
    load_patterns = [
        r"(?:packsled|sled|haul)\s+(?:load\s*)?(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*kg",
        r"(\d+(?:\.\d+)?)\s*kg\s+(?:packsled|sled|haul)(?:\s+load)?",
    ]
    for pat in load_patterns:
        m = re.search(pat, q)
        if m:
            packsled_load_kg = max(8.0, min(150.0, float(m.group(1))))
            has_calc_params = True
            break

    if any(w in q for w in ("calculate", "calculator", "compute")) and not has_calc_params:
        has_calc_params = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "site": matched_site,
        "crust_thickness_cm": crust_thickness_cm,
        "brine_eye_proximity_m": brine_eye_proximity_m,
        "ridge_relief_cm": ridge_relief_cm,
        "solar_uv_index": solar_uv_index,
        "packsled_load_kg": packsled_load_kg,
        "has_calc_params": has_calc_params,
    }


def format_salar_pressure_ridge_response(query: str) -> dict[str, Any]:
    """Build a structured salar pressure-ridge response payload for chat and SSE endpoints."""
    params = extract_salar_pressure_ridge_params(query)
    matched_site = params["site"]
    has_calc = bool(params["has_calc_params"])

    calc_result = calculate_salar_pressure_ridge(
        crust_thickness_cm=params["crust_thickness_cm"],
        brine_eye_proximity_m=params["brine_eye_proximity_m"],
        ridge_relief_cm=params["ridge_relief_cm"],
        solar_uv_index=params["solar_uv_index"],
        packsled_load_kg=params["packsled_load_kg"],
    )

    if has_calc:
        action = "salar_pressure_ridge_calculated"
        matched_sites = [matched_site] if matched_site else list(SALAR_PRESSURE_RIDGE_SITES)
    elif matched_site is not None:
        action = "salar_pressure_ridge_lookup"
        matched_sites = [matched_site]
    else:
        action = "salar_pressure_ridge_info"
        matched_sites = list(SALAR_PRESSURE_RIDGE_SITES)

    site_summary = (
        f"{matched_site['name']} ({matched_site['country']}, {matched_site['elevation_range']})"
        if matched_site
        else "Andean & Puna High-Altitude Salar Basins (Uyuni, Atacama, Arizaro, Chalviri)"
    )

    summary_lines = [
        f"### High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Assessment: {site_summary}",
        f"- **Safety / Risk Level:** `{calc_result['risk_level'].upper()}`",
        f"- **Crust Punch-Through Probability:** `{calc_result['crust_punch_through_probability_pct']:.1f}%` "
        f"(Crust Thickness `{calc_result['crust_thickness_cm']:.1f} cm`, Brine-Eye Proximity `{calc_result['brine_eye_proximity_m']:.1f} m`, "
        f"Packsled Load `{calc_result['packsled_load_kg']:.1f} kg`)",
        f"- **Effective Albedo UV Dose Index:** `{calc_result['effective_albedo_uv_dose_index']:.1f}` "
        f"(Incident Solar UV `{calc_result['solar_uv_index']:.1f}` + 0.85+ Crystalline Halite Floor Reflection)",
        f"- **Sole Laceration Wear Rate:** `{calc_result['sole_laceration_wear_rate_mm_per_10km']:.2f} mm / 10 km` "
        f"(Pressure-Ridge Relief `{calc_result['ridge_relief_cm']:.1f} cm`)",
        f"- **Eutectic Brine Immersion Risk:** `{calc_result['brine_hypothermia_immersion_risk_pct']:.1f}%`",
        f"- **Traversal Strategy:** {calc_result['traversal_strategy']}",
    ]
    if matched_site:
        summary_lines.append(f"- **Site Navigation Protocol:** {matched_site['navigation_protocol']}")
        summary_lines.append(f"- **Site Progression Protocol:** {matched_site['progression_protocol']}")
    if calc_result["warnings"]:
        summary_lines.append("- **Active Warnings:** " + " | ".join(calc_result["warnings"]))
    summary_lines.append(
        "- **Essential Gear:** "
        + "; ".join(item["item"] for item in SALAR_PRESSURE_RIDGE_GEAR_CHECKLIST[:4])
    )

    formatted_text = "\n".join(summary_lines)

    return {
        "action": action,
        "query": query,
        "site": dict(matched_site) if matched_site else None,
        "matched_sites": [dict(s) for s in matched_sites],
        "sites": [dict(s) for s in SALAR_PRESSURE_RIDGE_SITES],
        "calculation": calc_result,
        "gear_checklist": get_gear_checklist(),
        "answer": formatted_text,
        "formatted_response": formatted_text,
    }


def build_salar_pressure_ridge_prompt(info_or_query: dict[str, Any] | str) -> str:
    """Build the system prompt grounding block for LLM generation on salar pressure-ridge queries."""
    info = (
        format_salar_pressure_ridge_response(info_or_query)
        if isinstance(info_or_query, str)
        else info_or_query
    )
    calc = info.get("calculation") or {}
    site = info.get("site")
    site_header = (
        f"Target Site: {site['name']} ({site['country']}, {site['elevation_range']}, morphology={site['morphology']})"
        if site
        else "Target Domain: High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking"
    )
    warnings_str = "; ".join(calc.get("warnings", [])) or "None"
    recs_str = "; ".join(calc.get("recommendations", []))
    return (
        "\n\n[HIGH-ALTITUDE SALAR BRINE-POOL & POLYGONAL HALITE PRESSURE-RIDGE FIELD GUIDE]\n"
        f"{site_header}\n"
        f"Action: {info.get('action', 'salar_pressure_ridge_info')}\n"
        f"Risk Level: {calc.get('risk_level', 'moderate')}\n"
        f"Inputs: crust_thickness_cm={calc.get('crust_thickness_cm')}, "
        f"brine_eye_proximity_m={calc.get('brine_eye_proximity_m')}, "
        f"ridge_relief_cm={calc.get('ridge_relief_cm')}, "
        f"solar_uv_index={calc.get('solar_uv_index')}, "
        f"packsled_load_kg={calc.get('packsled_load_kg')}\n"
        f"Calculated Metrics: crust_punch_through_probability_pct={calc.get('crust_punch_through_probability_pct')}%, "
        f"effective_albedo_uv_dose_index={calc.get('effective_albedo_uv_dose_index')}, "
        f"sole_laceration_wear_rate_mm_per_10km={calc.get('sole_laceration_wear_rate_mm_per_10km')} mm/10km, "
        f"brine_hypothermia_immersion_risk_pct={calc.get('brine_hypothermia_immersion_risk_pct')}%\n"
        f"Traversal Strategy: {calc.get('traversal_strategy', '')}\n"
        f"Warnings: {warnings_str}\n"
        f"Recommendations: {recs_str}\n"
        "Provide concrete high-altitude salar evaporite basin guidance covering Ojos del Salar brine "
        "upwelling standoff, polygonal halite pressure-ridge (costra rugosa) sole protection, "
        "Category-4 dual-hemisphere UV albedo shielding, and UHMWPE packsled tether progression.\n"
    )


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a standalone fallback chat response dictionary with salar_pressure_ridge_info."""
    info = format_salar_pressure_ridge_response(query)
    return {
        "answer": info["formatted_response"],
        "context": [s["name"] for s in info["matched_sites"]],
        "salar_pressure_ridge_info": info,
    }


def generate_stream_events(query: str) -> Iterator[dict[str, Any]]:
    """Yield SSE event dictionaries for standalone salar pressure-ridge streaming."""
    info = format_salar_pressure_ridge_response(query)
    text = info["formatted_response"]
    midpoint = max(1, len(text) // 2)
    yield {
        "answer": text[:midpoint],
        "context": [s["name"] for s in info["matched_sites"]],
        "salar_pressure_ridge_info": info,
    }
    yield {
        "answer": text[midpoint:],
    }
    yield {
        "done": True,
        "salar_pressure_ridge_info": info,
    }
