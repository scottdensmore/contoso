"""Tropical Laterite Duricrust Mesa & Bauxite Ferricrete Scarp-Edge Bushwhacking Guide.

Domain calculator, site catalog, gear checklist, and intent detection for navigating
ferruginous laterite duricrust plateaus (bowé / cuirasse latéritique, canga hematite
mesas, bauxite aluminocrete breakaways, and pisolitic buckshot tablelands).
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from typing import Any


class LateriteDuricrustSite(dict[str, Any]):
    """Dictionary subclass supporting attribute-style access for laterite duricrust sites."""

    def __getattr__(self, item: str) -> Any:
        try:
            return self[item]
        except KeyError as exc:
            raise AttributeError(
                f"'LateriteDuricrustSite' object has no attribute '{item}'"
            ) from exc


LATERITE_DURICRUST_SITES: list[LateriteDuricrustSite] = [
    LateriteDuricrustSite(
        {
            "id": "fouta-djallon-bowe-labe-guinea",
            "name": "Fouta Djallon & Labé Ferricrete Bowé (Cuirasse Latéritique) Escarpment",
            "country": "Guinea",
            "region": "Moyenne-Guinée (Labé, Mali-ville & Koubia Plateau Rim)",
            "duricrust_type": "ferricrete-bowal-ironstone-cuirasse",
            "morphology": "ferricrete-bowal-ironstone-cuirasse",
            "substrate_type": "ferricrete-bowal-ironstone-cuirasse",
            "difficulty": "challenging",
            "elevation_range": "950–1,538 m",
            "max_elevation_m": 1538,
            "default_pisolite_gravel_depth_mm": 26.0,
            "default_scarp_slope_angle_deg": 28.0,
            "default_saprolite_undercut_span_m": 2.4,
            "default_surface_rock_temp_c": 52.0,
            "default_convective_storm_proximity_km": 14.0,
            "primary_hazard": (
                "Ball-bearing pisolitic ironstone gravel sheets over vesicular ferricrete slabs "
                "leading abruptly to cantilevered bowal breakaway rims undercut by kaolinitic "
                "saprolite piping caverns."
            ),
            "scarp_strategy": (
                "Maintain a 4 m setback from vesicular cuirasse breakaway rims, test slab resonance "
                "with a carbon probe before loading, and descend only via structural dolerite dike "
                "notches or incised gallery-forest ravines rather than undercut saprolite chutes."
            ),
            "crossing_strategy": (
                "Step on consolidated vesicular ironstone ribs rather than loose pisolite lag sheets; "
                "cross bowé flats before solar noon and navigate by GNSS/sun-compass due to remanent "
                "goethite-hematite magnetic anomalies."
            ),
            "navigation_strategy": (
                "Cross-check magnetic bearings against a solar gnomon or dual-frequency GNSS every "
                "400 m across magnetized ferricrete bowé pavements."
            ),
            "navigation_protocol": (
                "Disable magnetic auto-heading on handheld GPS units; rely on GNSS track-up bearing "
                "and visual terrain resection against incised valley heads."
            ),
            "conservation_protocol": (
                "Avoid trampling seasonal ephemeral bowal seepage pools (mares temporaires) that host "
                "endemic carnivorous Utricularia and Microcharis sedge micro-communities."
            ),
            "field_notes": (
                "Afternoon West African squall lines charge exposed ironstone mesas rapidly; vacate "
                "open cuirasse flats into gallery forest headwaters when thunder approaches within 15 km."
            ),
        }
    ),
    LateriteDuricrustSite(
        {
            "id": "serra-dos-carajas-canga-para-brazil",
            "name": "Serra dos Carajás & Campos Rupestres de Canga Hematite Mesa",
            "country": "Brazil",
            "region": "Pará (Flona de Carajás — Serra Norte N1–N4 & Serra Sul S11D)",
            "duricrust_type": "canga-hematite-rupestre-plateau",
            "morphology": "canga-hematite-rupestre-plateau",
            "substrate_type": "canga-hematite-rupestre-plateau",
            "difficulty": "extreme",
            "elevation_range": "650–890 m",
            "max_elevation_m": 890,
            "default_pisolite_gravel_depth_mm": 34.0,
            "default_scarp_slope_angle_deg": 35.0,
            "default_saprolite_undercut_span_m": 3.1,
            "default_surface_rock_temp_c": 57.0,
            "default_convective_storm_proximity_km": 9.0,
            "primary_hazard": (
                "Severe local compass deviation (up to 15°+) over massive banded-iron canga crusts, "
                "Collapsed subterranean iron-dissolution caves beneath 1–2 m thick surface bridges, "
                "and extreme convective lightning attraction on treeless hematite tablelands."
            ),
            "scarp_strategy": (
                "Never traverse directly above canga cave mouths or hollow-sounding breccia bridges; "
                "detour inland around marginal collapse dolines and use fixed webbing handlines on "
                "steep goethite-cemented talus aprons."
            ),
            "crossing_strategy": (
                "Use high-durometer Vibram mega-lug boots with kevlar ankle gaiters against razor-edged "
                "hematite clasts; navigate strictly with GNSS/inertial reference and optical sightlines."
            ),
            "navigation_strategy": (
                "Treat magnetic compasses as unreliable over jaspilite and martite-hematite canga; "
                "log sun-shadow azimuths and GNSS waypoints at every structural bench."
            ),
            "navigation_protocol": (
                "Pre-load high-resolution LiDAR/orthophoto tiles to identify collapsed canga sinkholes "
                "and metallophyte scrub corridors before stepping onto the open plateau."
            ),
            "conservation_protocol": (
                "Stay strictly on bare hematite pavement to protect endemic canga metallophytes "
                "(Ipomoea cavalcantei, Isoetes cangae) and bat-roost ferruginous caves."
            ),
            "field_notes": (
                "Dark hematite-magnetite crusts absorb intense equatorial radiation, pushing surface "
                "rock temperatures above 58 °C while triggering violent afternoon Amazonian cumulonimbus cells."
            ),
        }
    ),
    LateriteDuricrustSite(
        {
            "id": "mitchell-plateau-ngauwudu-kimberley-australia",
            "name": "Mitchell Plateau (Ngauwudu) Bauxite-Laterite Breakaway Scarp",
            "country": "Australia",
            "region": "North Kimberley, Western Australia (Ngauwudu / Wunambal Gaambera Country)",
            "duricrust_type": "bauxite-aluminocrete-scarp-rim",
            "morphology": "bauxite-aluminocrete-scarp-rim",
            "substrate_type": "bauxite-aluminocrete-scarp-rim",
            "difficulty": "extreme",
            "elevation_range": "280–540 m",
            "max_elevation_m": 540,
            "default_pisolite_gravel_depth_mm": 44.0,
            "default_scarp_slope_angle_deg": 38.0,
            "default_saprolite_undercut_span_m": 3.6,
            "default_surface_rock_temp_c": 59.0,
            "default_convective_storm_proximity_km": 11.0,
            "primary_hazard": (
                "Deep, ankle-rolling pisolitic gibbsite-boehmite bauxite gravel ('buckshot') over "
                "camouflaged breakaway ledges where pallid-zone clay weathering creates massive "
                "unbuttressed overhang blocks above Carson Volcanics slopes."
            ),
            "scarp_strategy": (
                "Probe through Livistona eastonii fan-palm litter and spinifex hummocks before "
                "approaching any breakaway edge; descend only where King Leopold sandstone or basalt "
                "benches crop out solidly without pallid-zone clay undercutting."
            ),
            "crossing_strategy": (
                "Shorten stride length by 40% on pisolitic bauxite buckshot slopes, lock trekking "
                "pole carbide tips into tubular root-mold cavities, and carry 1.2 L/hr electrolyte water."
            ),
            "navigation_strategy": (
                "Combine GNSS waypoints with drainage-divide contour reading to locate safe ramp breaks "
                "through the bauxite duricrust cap into the lower basalt woodland."
            ),
            "navigation_protocol": (
                "Mark breakaway descent slots carefully with reflective cairn tags or GNSS pins, as "
                "uniform Livistona palm plateaus obscure horizon landmarks."
            ),
            "conservation_protocol": (
                "Respect Wunambal Gaambera cultural heritage sites and Uunguu Visitor Pass zones; "
                "sanitize boot treads to prevent Phytophthora cinnamomi dieback on bauxite flora."
            ),
            "field_notes": (
                "Build-up season (October–December) brings extreme radiant heat off red bauxite "
                "gravels and sudden dry-microburst lightning across the plateau."
            ),
        }
    ),
    LateriteDuricrustSite(
        {
            "id": "panchgani-kaas-ferricrete-tableland-maharashtra-india",
            "name": "Kaas Plateau & Panchgani Deccan Laterite Tableland Rim",
            "country": "India",
            "region": "Northern Western Ghats (Sahyadri Escarpment, Satara District, Maharashtra)",
            "duricrust_type": "pisolitic-buckshot-breakaway-cap",
            "morphology": "pisolitic-buckshot-breakaway-cap",
            "substrate_type": "pisolitic-buckshot-breakaway-cap",
            "difficulty": "moderate",
            "elevation_range": "1,200–1,382 m",
            "max_elevation_m": 1382,
            "default_pisolite_gravel_depth_mm": 19.0,
            "default_scarp_slope_angle_deg": 24.0,
            "default_saprolite_undercut_span_m": 1.6,
            "default_surface_rock_temp_c": 45.0,
            "default_convective_storm_proximity_km": 18.0,
            "primary_hazard": (
                "Loose pisolitic iron-nodule gravel on beveled tableland shoulders combined with "
                "sudden zero-visibility Orographic Sahyadri cliff fog and slick cyanobacteria biofilms "
                "over vesicular laterite crust."
            ),
            "scarp_strategy": (
                "Follow established basalt-step shepherd gullies (ghat paths) off the laterite caprock "
                "and stay back from seasonal waterfall undercut rims where lithomarge clay slumps."
            ),
            "crossing_strategy": (
                "Step on rough hematitic nodules rather than dark algal-coated depressions during "
                "post-monsoon mist; arrest slides early before reaching the beveled scarp shoulder."
            ),
            "navigation_strategy": (
                "Record a back-azimuth and GNSS track before Sahyadri upslope fog envelopes the "
                "featureless flat tableland horizon."
            ),
            "navigation_protocol": (
                "Set a 15 m cliff-edge proximity geofence on handheld GNSS units when visibility "
                "drops below 30 m in Western Ghats cloud banks."
            ),
            "conservation_protocol": (
                "Never step into shallow soil-filled laterite depressions hosting UNESCO-protected "
                "ephemeral monsoon flora (Utricularia purpurascens, Eriocaulon, Dipcadi montanum)."
            ),
            "field_notes": (
                "High-elevation Deccan Trap laterite caps transition abruptly from flat indurated "
                "carapace to 600 m sheer basaltic drops into the Koyna and Krishna valleys."
            ),
        }
    ),
]

LATERITE_SITES = LATERITE_DURICRUST_SITES

LATERITE_DURICRUST_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "Deep-Lug Vibram Boots with Kevlar Pisolite-Scree Ankle Gaiters",
        "category": "footwear",
        "priority": "essential",
        "reason": (
            "Prevents ball-bearing pisolitic buckshot nodules from entering boot collars and "
            "resists sidewall shredding on sharp vesicular ferricrete and canga hematite edges."
        ),
    },
    {
        "item": "Solar Gnomon Sun-Compass & Dual-Frequency Multi-GNSS Receiver",
        "category": "navigation",
        "priority": "essential",
        "reason": (
            "Bypasses 5°–18°+ magnetic needle deflection caused by remanent magnetization in "
            "goethite, hematite, and magnetite-rich canga/ferricrete caprocks."
        ),
    },
    {
        "item": "Graduated Carbon-Shaft Saprolite Cavity & Overhang Sounding Probe",
        "category": "safety",
        "priority": "essential",
        "reason": (
            "Detects hollow kaolinitic/pallid-zone piping cavities and thin cantilevered "
            "duricrust bridges hidden beneath spinifex or palm litter at breakaway rims."
        ),
    },
    {
        "item": "Carbide-Tipped Dual Trekking Poles (No Rubber Ferrules)",
        "category": "mobility",
        "priority": "essential",
        "reason": (
            "Bites into vesicular ironstone pores and root-mold tubules when crossing "
            "loose pisolitic bauxite/ferricrete gravel on 20°–40° beveled scarp shoulders."
        ),
    },
    {
        "item": "Cut-Resistant Nitrile/Aramid Palm Scramble Gloves",
        "category": "protection",
        "priority": "essential",
        "reason": (
            "Protects hands from abrasive, slag-like vesicular ferricrete and superheated "
            "(50–65 °C) dark canga hematite boulders during three-point scarp downclimbing."
        ),
    },
    {
        "item": "Insulated 4 L Electrolyte Hydration System & Optical Lightning Detector",
        "category": "survival",
        "priority": "essential",
        "reason": (
            "Counters extreme radiant infrared heat flux off dark ironstone pavements and "
            "provides early warning of tropical convective squall cells approaching exposed mesas."
        ),
    },
]


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6-item essential gear checklist for laterite duricrust bushwhacking."""
    return list(LATERITE_DURICRUST_GEAR_CHECKLIST)


def filter_sites(
    country: str | None = None,
    duricrust_type: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
    morphology: str | None = None,
    substrate_type: str | None = None,
) -> list[dict[str, Any]]:
    """Filter the laterite duricrust catalog by country, duricrust_type, difficulty, or search."""
    effective_type = duricrust_type or morphology or substrate_type
    results: list[dict[str, Any]] = []
    for site in LATERITE_DURICRUST_SITES:
        if country and site["country"].lower() != country.strip().lower():
            continue
        if effective_type and effective_type.strip().lower() not in site["duricrust_type"].lower():
            continue
        if difficulty and site["difficulty"].lower() != difficulty.strip().lower():
            continue
        if search:
            q = search.strip().lower()
            searchable = " ".join(
                [
                    str(site.get("id", "")),
                    str(site.get("name", "")),
                    str(site.get("country", "")),
                    str(site.get("region", "")),
                    str(site.get("duricrust_type", "")),
                    str(site.get("primary_hazard", "")),
                    str(site.get("field_notes", "")),
                ]
            ).lower()
            if q not in searchable:
                continue
        results.append(dict(site))
    return results


def calculate_laterite_duricrust(
    pisolite_gravel_depth_mm: float = 18.0,
    scarp_slope_angle_deg: float = 24.0,
    saprolite_undercut_span_m: float = 1.4,
    surface_rock_temp_c: float = 48.0,
    convective_storm_proximity_km: float = 18.0,
) -> dict[str, Any]:
    """Calculate pisolite slip, cantilever rim collapse, compass deviation, and thermal/lightning risk."""
    if not (0.0 <= pisolite_gravel_depth_mm <= 85.0):
        raise ValueError(
            "pisolite_gravel_depth_mm must be between 0.0 and 85.0 mm"
        )
    if not (5.0 <= scarp_slope_angle_deg <= 55.0):
        raise ValueError(
            "scarp_slope_angle_deg must be between 5.0 and 55.0 degrees"
        )
    if not (0.0 <= saprolite_undercut_span_m <= 6.5):
        raise ValueError(
            "saprolite_undercut_span_m must be between 0.0 and 6.5 meters"
        )
    if not (22.0 <= surface_rock_temp_c <= 72.0):
        raise ValueError(
            "surface_rock_temp_c must be between 22.0 and 72.0 °C"
        )
    if not (1.0 <= convective_storm_proximity_km <= 60.0):
        raise ValueError(
            "convective_storm_proximity_km must be between 1.0 and 60.0 km"
        )

    # 1. Pisolite ball-bearing slip probability (%)
    depth_factor = (pisolite_gravel_depth_mm / 85.0) * 52.0
    slope_factor = ((scarp_slope_angle_deg - 5.0) / 50.0) * 44.0
    interaction_boost = (
        (pisolite_gravel_depth_mm / 85.0)
        * ((scarp_slope_angle_deg - 5.0) / 50.0)
        * 18.0
    )
    pisolite_ball_bearing_slip_pct = round(
        min(99.0, max(2.0, depth_factor + slope_factor + interaction_boost)), 1
    )

    # 2. Cantilever rim collapse probability (%)
    undercut_ratio = saprolite_undercut_span_m / 6.5
    slope_stress = ((scarp_slope_angle_deg - 5.0) / 50.0) * 26.0
    cantilever_rim_collapse_probability_pct = round(
        min(
            99.0,
            max(
                1.5,
                (undercut_ratio**1.05) * 86.0 + slope_stress,
            ),
        ),
        1,
    )

    # 3. Ferruginous magnetic compass deviation (degrees)
    ferruginous_compass_deviation_deg = round(
        min(
            22.0,
            max(
                1.2,
                1.8
                + (pisolite_gravel_depth_mm * 0.085)
                + (scarp_slope_angle_deg * 0.09)
                + ((surface_rock_temp_c - 22.0) * 0.06),
            ),
        ),
        1,
    )

    # 4. Mesa lightning & radiant thermal hazard score (0-100)
    thermal_component = max(0.0, (surface_rock_temp_c - 24.0) / 48.0) * 48.0
    storm_component = max(0.0, (60.0 - convective_storm_proximity_km) / 59.0) ** 1.35 * 55.0
    mesa_lightning_thermal_hazard_score = round(
        min(100.0, max(3.0, thermal_component + storm_component)), 1
    )

    composite = max(
        pisolite_ball_bearing_slip_pct,
        cantilever_rim_collapse_probability_pct,
        mesa_lightning_thermal_hazard_score,
    )

    if composite >= 72.0 or saprolite_undercut_span_m >= 3.5 or convective_storm_proximity_km <= 6.0:
        risk_level = "critical"
        safety_status = "DO NOT APPROACH BREAKAWAY RIM — IMMEDIATE CANTILEVER / LIGHTNING / SLIP HAZARD"
        scarp_strategy = (
            "Abort direct scarp-edge transit immediately; retreat >= 6 m inland from cantilevered "
            "ferricrete/bauxite rims, descend off the exposed ironstone caprock before convective "
            "lightning arrival, and bypass pisolitic buckshot chutes via structural bedrock gullies."
        )
    elif composite >= 48.0 or saprolite_undercut_span_m >= 2.2 or pisolite_gravel_depth_mm >= 30.0:
        risk_level = "high"
        safety_status = "HIGH CAUTION — PROBE SAPROLITE UNDERCUTS & ARREST PISOLITE GRAVEL SLIPS"
        scarp_strategy = (
            "Maintain a strict 4 m setback from vesicular breakaway ledges, probe ahead for hollow "
            "saprolite piping voids, use dual carbide poles on consolidated ironstone ribs, and "
            "cross-check all headings with GNSS or a solar gnomon."
        )
    elif composite >= 25.0:
        risk_level = "moderate"
        safety_status = "MODERATE — STANDARD LATERITE TABLELAND & BUCKSHOT GRAVEL PROTOCOLS"
        scarp_strategy = (
            "Shorten stride on pisolitic ironstone gravel, stay 2.5 m inside beveled scarp shoulders, "
            "and verify magnetic compass bearings against GNSS waypoints."
        )
    else:
        risk_level = "low"
        safety_status = "LOW — STABLE INDURATED DURICRUST PAVEMENT"
        scarp_strategy = (
            "Proceed across consolidated ferricrete pavement using standard lugged footwear while "
            "monitoring afternoon convective cloud buildup and local magnetic anomalies."
        )

    warnings: list[str] = []
    recommendations: list[str] = []

    if pisolite_ball_bearing_slip_pct >= 50.0 or pisolite_gravel_depth_mm >= 28.0:
        warnings.append(
            f"High pisolitic buckshot ball-bearing slip risk ({pisolite_ball_bearing_slip_pct}%): "
            f"{pisolite_gravel_depth_mm:.1f} mm loose ironstone/bauxite nodules on {scarp_slope_angle_deg:.1f}° slope."
        )
        recommendations.append(
            "Step on exposed vesicular ferricrete ribs rather than pisolite lag pockets and wear kevlar ankle gaiters."
        )

    if cantilever_rim_collapse_probability_pct >= 45.0 or saprolite_undercut_span_m >= 2.0:
        warnings.append(
            f"Cantilevered duricrust caprock collapse hazard ({cantilever_rim_collapse_probability_pct}%): "
            f"{saprolite_undercut_span_m:.1f} m pallid-zone saprolite undercut span."
        )
        recommendations.append(
            f"Enforce a minimum {max(3.5, round(saprolite_undercut_span_m * 1.8, 1))} m setback from the breakaway scarp rim and sound with a carbon probe."
        )

    if ferruginous_compass_deviation_deg >= 5.0:
        warnings.append(
            f"Ferruginous magnetic anomaly ({ferruginous_compass_deviation_deg}° compass deflection) "
            "from remanent hematite/goethite/magnetite mineralization."
        )
        recommendations.append(
            "Switch primary navigation to dual-frequency GNSS and solar gnomon shadow azimuths; do not trust magnetic needles."
        )

    if mesa_lightning_thermal_hazard_score >= 50.0 or convective_storm_proximity_km <= 12.0:
        warnings.append(
            f"Severe mesa thermal/lightning exposure (score {mesa_lightning_thermal_hazard_score}/100): "
            f"{surface_rock_temp_c:.1f} °C rock temp with storm cell at {convective_storm_proximity_km:.1f} km."
        )
        recommendations.append(
            "Vacate exposed ironstone tableland into incised gallery-forest ravines immediately and consume 1.0–1.2 L/hr electrolytes."
        )

    if not warnings:
        warnings.append(
            "Minor pisolite gravel scatter and weak ferruginous magnetic variance; remain alert near beveled scarp edges."
        )
    if not recommendations:
        recommendations.append(
            "Maintain a 2 m scarp-edge buffer, log GNSS reference waypoints, and protect endemic ephemeral pool flora."
        )

    return {
        "pisolite_gravel_depth_mm": float(pisolite_gravel_depth_mm),
        "scarp_slope_angle_deg": float(scarp_slope_angle_deg),
        "saprolite_undercut_span_m": float(saprolite_undercut_span_m),
        "surface_rock_temp_c": float(surface_rock_temp_c),
        "convective_storm_proximity_km": float(convective_storm_proximity_km),
        "pisolite_ball_bearing_slip_pct": pisolite_ball_bearing_slip_pct,
        "cantilever_rim_collapse_probability_pct": cantilever_rim_collapse_probability_pct,
        "ferruginous_compass_deviation_deg": ferruginous_compass_deviation_deg,
        "mesa_lightning_thermal_hazard_score": mesa_lightning_thermal_hazard_score,
        "risk_level": risk_level,
        "safety_status": safety_status,
        "scarp_strategy": scarp_strategy,
        "crossing_strategy": scarp_strategy,
        "navigation_strategy": (
            "Navigate via dual-frequency GNSS and solar gnomon sun-compass to mitigate "
            f"~{ferruginous_compass_deviation_deg}° ferruginous magnetic deviation."
        ),
        "warnings": warnings,
        "recommendations": recommendations,
    }


_STRONG_LATERITE_KEYWORDS: tuple[str, ...] = (
    "laterite",
    "lateritic",
    "duricrust",
    "ferricrete",
    "aluminocrete",
    "bauxite scarp",
    "bauxite breakaway",
    "bauxite plateau",
    "bauxite mesa",
    "bauxite-laterite",
    "bowal",
    "bowé",
    "bowe ",
    "cuirasse latéritique",
    "cuirasse lateritique",
    "ironstone cuirasse",
    "canga",
    "campos rupestres de canga",
    "serra dos carajas",
    "serra dos carajás",
    "fouta djallon",
    "mitchell plateau",
    "ngauwudu",
    "kaas plateau",
    "panchgani",
    "pisolite gravel",
    "pisolitic",
    "buckshot gravel",
    "saprolite undercut",
    "saprolite cavern",
    "pallid-zone",
    "pallid zone",
)

_CONTEXT_LATERITE_TERMS: tuple[str, ...] = (
    "bauxite",
    "pisolite",
    "ironstone",
    "saprolite",
    "breakaway scarp",
    "breakaway rim",
    "cuirasse",
    "hematite mesa",
)

_ADJACENT_DOMAIN_EXCLUSIONS: tuple[str, ...] = (
    "tepui",
    "roraima",
    "auyantepui",
    "tsingy",
    "bemaraha",
    "limestone karst",
    "cave pearl",
    "speleothem",
    "sluice box",
    "gold panning",
    "placer gold",
    "boot skiing",
    "volcanic scree",
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


def is_laterite_duricrust_query(query: str) -> bool:
    """Return True if the user query specifically targets tropical laterite duricrust / ferricrete mesas."""
    if not query or not query.strip():
        return False
    q = query.lower()

    if any(kw in q for kw in _STRONG_LATERITE_KEYWORDS):
        return True

    if any(excl in q for excl in _ADJACENT_DOMAIN_EXCLUSIONS):
        return False

    context_hits = sum(1 for term in _CONTEXT_LATERITE_TERMS if term in q)
    if context_hits >= 2:
        return True

    if "bauxite" in q and any(
        w in q for w in ("scarp", "mesa", "plateau", "breakaway", "gravel", "bushwhack", "trek", "rim")
    ):
        return True

    if "pisolite" in q and any(
        w in q for w in ("gravel", "scarp", "slip", "buckshot", "ironstone", "mesa", "tableland")
    ):
        return True

    return False


def detect_laterite_duricrust_intent(query: str) -> bool:
    """Alias for is_laterite_duricrust_query used across main.py and chat_request.py."""
    return is_laterite_duricrust_query(query)


def _match_site_from_query(query: str) -> LateriteDuricrustSite:
    q = query.lower()
    if any(w in q for w in ("carajas", "carajás", "canga", "pará", "para", "brazil", "hematite mesa")):
        return LATERITE_DURICRUST_SITES[1]
    if any(w in q for w in ("mitchell", "ngauwudu", "kimberley", "australia", "bauxite", "aluminocrete")):
        return LATERITE_DURICRUST_SITES[2]
    if any(w in q for w in ("panchgani", "kaas", "maharashtra", "deccan", "sahyadri", "india")):
        return LATERITE_DURICRUST_SITES[3]
    return LATERITE_DURICRUST_SITES[0]


def extract_laterite_duricrust_params(query: str) -> dict[str, Any]:
    """Extract numerical calculator parameters from a natural-language query."""
    matched_site = _match_site_from_query(query)
    params: dict[str, Any] = {
        "pisolite_gravel_depth_mm": float(matched_site["default_pisolite_gravel_depth_mm"]),
        "scarp_slope_angle_deg": float(matched_site["default_scarp_slope_angle_deg"]),
        "saprolite_undercut_span_m": float(matched_site["default_saprolite_undercut_span_m"]),
        "surface_rock_temp_c": float(matched_site["default_surface_rock_temp_c"]),
        "convective_storm_proximity_km": float(matched_site["default_convective_storm_proximity_km"]),
    }

    q = query.lower()

    m_gravel = re.search(
        r"(\d+(?:\.\d+)?)\s*mm\s*(?:of\s+)?(?:pisolite|pisolitic|buckshot|gravel|nodule)",
        q,
    ) or re.search(
        r"(?:pisolite|pisolitic|buckshot|gravel)[^\d]{0,25}(\d+(?:\.\d+)?)\s*mm",
        q,
    )
    if m_gravel:
        val = float(m_gravel.group(1))
        params["pisolite_gravel_depth_mm"] = min(85.0, max(0.0, val))

    m_slope = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:deg|degrees|°)\s*(?:scarp|slope|shoulder|incline)",
        q,
    ) or re.search(
        r"(?:scarp|slope)[^\d]{0,20}(\d+(?:\.\d+)?)\s*(?:deg|degrees|°)",
        q,
    )
    if m_slope:
        val = float(m_slope.group(1))
        params["scarp_slope_angle_deg"] = min(55.0, max(5.0, val))

    m_undercut = re.search(
        r"(\d+(?:\.\d+)?)\s*m\s*(?:saprolite|undercut|cantilever|overhang|cavern)",
        q,
    ) or re.search(
        r"(?:saprolite|undercut|cantilever)[^\d]{0,25}(\d+(?:\.\d+)?)\s*m\b",
        q,
    )
    if m_undercut:
        val = float(m_undercut.group(1))
        params["saprolite_undercut_span_m"] = min(6.5, max(0.0, val))

    m_temp = re.search(
        r"(\d+(?:\.\d+)?)\s*°?\s*c\b",
        q,
    )
    if m_temp:
        val = float(m_temp.group(1))
        params["surface_rock_temp_c"] = min(72.0, max(22.0, val))

    m_storm = re.search(
        r"(\d+(?:\.\d+)?)\s*km\b",
        q,
    )
    if m_storm:
        val = float(m_storm.group(1))
        params["convective_storm_proximity_km"] = min(60.0, max(1.0, val))

    return params


def format_laterite_duricrust_response(query: str) -> dict[str, Any]:
    """Build a structured domain response dictionary for chat and streaming endpoints."""
    matched_site = _match_site_from_query(query)
    params = extract_laterite_duricrust_params(query)
    calc_info: dict[str, Any] = calculate_laterite_duricrust(
        pisolite_gravel_depth_mm=params["pisolite_gravel_depth_mm"],
        scarp_slope_angle_deg=params["scarp_slope_angle_deg"],
        saprolite_undercut_span_m=params["saprolite_undercut_span_m"],
        surface_rock_temp_c=params["surface_rock_temp_c"],
        convective_storm_proximity_km=params["convective_storm_proximity_km"],
    )

    summary = (
        f"**Tropical Laterite Duricrust & Bauxite Ferricrete Assessment — {matched_site['name']} "
        f"({matched_site['country']})**\n\n"
        f"- **Duricrust Morphology**: `{matched_site['duricrust_type']}` | **Risk Level**: `{calc_info['risk_level'].upper()}`\n"
        f"- **Pisolite Ball-Bearing Slip Risk**: `{calc_info['pisolite_ball_bearing_slip_pct']}%` "
        f"({params['pisolite_gravel_depth_mm']} mm gravel on {params['scarp_slope_angle_deg']}° scarp)\n"
        f"- **Cantilever Rim Collapse Probability**: `{calc_info['cantilever_rim_collapse_probability_pct']}%` "
        f"({params['saprolite_undercut_span_m']} m saprolite undercut span)\n"
        f"- **Ferruginous Compass Deviation**: `±{calc_info['ferruginous_compass_deviation_deg']}°` "
        f"(use solar gnomon / dual-frequency GNSS)\n"
        f"- **Mesa Lightning & Thermal Score**: `{calc_info['mesa_lightning_thermal_hazard_score']}/100` "
        f"({params['surface_rock_temp_c']} °C rock temp, storm at {params['convective_storm_proximity_km']} km)\n"
        f"- **Scarp Strategy**: {calc_info['scarp_strategy']}\n"
        f"- **Conservation Protocol**: {matched_site['conservation_protocol']}"
    )

    return {
        "domain": "laterite_duricrust",
        "action": "laterite_duricrust_info",
        "query": query,
        "matched_site": dict(matched_site),
        "sites": [dict(s) for s in LATERITE_DURICRUST_SITES],
        "calculation": calc_info,
        "gear_checklist": get_gear_checklist(),
        "summary": summary,
        "answer": summary,
    }


def build_laterite_duricrust_prompt(info_or_query: dict[str, Any] | str) -> str:
    """Build system prompt context for LLM augmentation on laterite duricrust queries."""
    info = (
        format_laterite_duricrust_response(info_or_query)
        if isinstance(info_or_query, str)
        else info_or_query
    )
    site = info["matched_site"]
    calc = info["calculation"]
    return (
        "### Tropical Laterite Duricrust Mesa & Bauxite Ferricrete Scarp-Edge Bushwhacking Context\n"
        f"Matched Reference Site: {site['name']} ({site['country']}, {site['region']})\n"
        f"Duricrust Type: {site['duricrust_type']} | Difficulty: {site['difficulty']}\n"
        f"Calculated Risk Level: {calc['risk_level']} ({calc['safety_status']})\n"
        f"Metrics: Pisolite Slip={calc['pisolite_ball_bearing_slip_pct']}%, "
        f"Cantilever Rim Collapse={calc['cantilever_rim_collapse_probability_pct']}%, "
        f"Ferruginous Compass Deviation={calc['ferruginous_compass_deviation_deg']}°, "
        f"Mesa Lightning/Thermal Score={calc['mesa_lightning_thermal_hazard_score']}/100.\n"
        f"Scarp Strategy: {calc['scarp_strategy']}\n"
        f"Site Conservation Protocol: {site['conservation_protocol']}\n"
    )


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response payload for laterite duricrust intent."""
    info = format_laterite_duricrust_response(query)
    return {
        "answer": info["summary"],
        "context": [site["name"] for site in LATERITE_DURICRUST_SITES],
        "laterite_duricrust_info": info,
    }


def generate_stream_events(query: str) -> Iterator[dict[str, Any]]:
    """Yield SSE event dictionaries for streaming laterite duricrust responses."""
    info = format_laterite_duricrust_response(query)
    yield {
        "event": "laterite_duricrust_info",
        "data": info,
        "laterite_duricrust_info": info,
    }
    yield {
        "event": "message",
        "answer": info["summary"],
        "context": [site["name"] for site in LATERITE_DURICRUST_SITES],
        "laterite_duricrust_info": info,
    }
