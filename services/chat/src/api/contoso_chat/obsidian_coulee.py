"""High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling Guide.

Domain calculator, site catalog, gear checklist, and intent detection for scrambling
across holocene rhyolitic/dacitic obsidian coulees, pumiceous carapace domes,
perlitic breccia pressure-spines, and subglacial vitrophyre block lobes.
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from typing import Any


class ObsidianCouleeSite(dict[str, Any]):
    """Dictionary subclass supporting attribute-style access for obsidian coulee sites."""

    def __getattr__(self, item: str) -> Any:
        try:
            return self[item]
        except KeyError as exc:
            raise AttributeError(
                f"'ObsidianCouleeSite' object has no attribute '{item}'"
            ) from exc


OBSIDIAN_COULEE_SITES: list[ObsidianCouleeSite] = [
    ObsidianCouleeSite(
        {
            "id": "big-obsidian-flow-newberry-caldera-oregon",
            "name": "Big Obsidian Flow & Paulina Peak Rhyolite Coulee",
            "country": "USA",
            "region": "Newberry National Volcanic Monument, Deschutes County, Oregon (Cascade Arc)",
            "lithology": "banded-rhyolite-obsidian-coulee",
            "coulee_type": "banded-rhyolite-obsidian-coulee",
            "morphology": "banded-rhyolite-obsidian-coulee",
            "substrate_type": "banded-rhyolite-obsidian-coulee",
            "difficulty": "moderate",
            "elevation_range": "1,950–2,135 m",
            "max_elevation_m": 2135,
            "default_conchoidal_flake_density_pct": 54.0,
            "default_block_instability_tilt_deg": 20.0,
            "default_vesicular_pumice_crust_ratio_pct": 32.0,
            "default_coulee_crest_relief_m": 38.0,
            "default_scrambler_pack_mass_kg": 14.0,
            "primary_hazard": (
                "Surgical-grade conchoidal volcanic glass edges (3 nm fracture radius) along "
                "flow-banded rhyolite pressure ridges and unstable grey vesicular pumice blocks "
                "that rock unpredictably under boot loads."
            ),
            "scrambling_strategy": (
                "Traverse along consolidated flow-foliated rhyolite trough benches rather than "
                "cresting unstable glassy pressure ridges; test every block for teeter before "
                "committing full pack weight and never use bare hands for balance."
            ),
            "crossing_strategy": (
                "Keep three points of contact with ANSI A7/A9 Kevlar-lined leather gloves; step "
                "flat-footed onto dull micro-vesicular grey rhyolite ribs rather than mirror-black "
                "conchoidal obsidian fracture planes."
            ),
            "footwork_protocol": (
                "Plant high-durometer Vibram Mont soles squarely on matte flow-banded surfaces; "
                "avoid edging or smearing across razor-sharp glassy conchoidal spalls that slice "
                "soft rubber lugs and sidewalls."
            ),
            "hand_protection_protocol": (
                "Wear full-finger para-aramid (Kevlar/Dyneema) cut-resistant leather gloves at "
                "all times; brush volcanic glass micro-splinters off palms with a stiff bristle "
                "brush rather than wiping with bare skin."
            ),
            "conservation_protocol": (
                "Collecting obsidian or pumice specimens within Newberry National Volcanic Monument "
                "is strictly prohibited under federal law; avoid disturbing indigenous lithic "
                "quarry reduction scatter zones."
            ),
            "field_notes": (
                "Erupted ~1,300 years BP, the 1.8 km³ Big Obsidian Flow exhibits alternating "
                "compression ridges and 15–40 m relief troughs that trap solar heat while hiding "
                "persistent early-summer snow bridges in basal clefts."
            ),
        }
    ),
    ObsidianCouleeSite(
        {
            "id": "glass-mountain-medicine-lake-volcano-california",
            "name": "Glass Mountain & Little Glass Mountain Dacite-Rhyolite Obsidian Flow",
            "country": "USA",
            "region": "Medicine Lake Highlands, Modoc National Forest, Siskiyou County, California",
            "lithology": "pumiceous-carapace-glass-dome",
            "coulee_type": "pumiceous-carapace-glass-dome",
            "morphology": "pumiceous-carapace-glass-dome",
            "substrate_type": "pumiceous-carapace-glass-dome",
            "difficulty": "extreme",
            "elevation_range": "2,080–2,323 m",
            "max_elevation_m": 2323,
            "default_conchoidal_flake_density_pct": 82.0,
            "default_block_instability_tilt_deg": 35.0,
            "default_vesicular_pumice_crust_ratio_pct": 66.0,
            "default_coulee_crest_relief_m": 78.0,
            "default_scrambler_pack_mass_kg": 20.0,
            "primary_hazard": (
                "Steep 50–90 m tall advancing-lobe talus aprons of meter-scale dacite-rhyolite "
                "obsidian blocks capped by hollow, frothy vesicular pumice carapaces that "
                "punch through into 2–4 m deep inter-block shear fissures."
            ),
            "scrambling_strategy": (
                "Ascend the coulee flank only via lower-angle blocky compression gullies where "
                "dense black obsidian cores interlock; strictly avoid white/tan frothy pumice "
                "carapace crusts spanning dark inter-block voids."
            ),
            "crossing_strategy": (
                "Maintain a 6 m vertical stagger between party members on 32°–38° glass-block "
                "talus aprons to prevent cascading conchoidal block slides; probe vesicular "
                "surface crusts with a chromoly pole tip before stepping."
            ),
            "footwork_protocol": (
                "Inspect Vibram boot lugs every 1.5 km for deep glass-spall lacerations; wear "
                "UHMWPE/Cordura shin guards and Kevlar scree gaiters to shield tibial arteries "
                "from shifting obsidian plates."
            ),
            "hand_protection_protocol": (
                "Mandatory ANSI A8/A9 Kevlar-lined leather gauntlets plus wrap-around ANSI Z87.1+ "
                "polycarbonate eye shields when climbing steep pressure spines where loaded "
                "obsidian blocks spall airborne glass shards."
            ),
            "conservation_protocol": (
                "Respect Pit River and Modoc ancestral sacred landscapes across Medicine Lake "
                "Highlands; leave all mahogany and rainbow sheen obsidian blades in situ."
            ),
            "field_notes": (
                "This ~1,000-year-old bimodal rhyolite-dacite coulee features some of the "
                "steepest unconsolidated glass-block flow fronts in North America, shredding "
                "standard soft trail-running outsoles within 3 km."
            ),
        }
    ),
    ObsidianCouleeSite(
        {
            "id": "panum-crater-mono-inyo-obsidian-domes-california",
            "name": "Panum Crater & Obsidian Dome Pressure-Spine Coulee",
            "country": "USA",
            "region": "Mono-Inyo Craters Volcanic Chain, Inyo National Forest, Mono County, California",
            "lithology": "perlitic-breccia-pressure-spine",
            "coulee_type": "perlitic-breccia-pressure-spine",
            "morphology": "perlitic-breccia-pressure-spine",
            "substrate_type": "perlitic-breccia-pressure-spine",
            "difficulty": "challenging",
            "elevation_range": "2,070–2,510 m",
            "max_elevation_m": 2510,
            "default_conchoidal_flake_density_pct": 68.0,
            "default_block_instability_tilt_deg": 29.0,
            "default_vesicular_pumice_crust_ratio_pct": 52.0,
            "default_coulee_crest_relief_m": 58.0,
            "default_scrambler_pack_mass_kg": 16.0,
            "primary_hazard": (
                "Jagged extrusive rhyolitic pressure spines and perlitic collapse breccia towers "
                "surrounded by friable pumiceous breadcrust shells that shear off under hand "
                "or foot traction."
            ),
            "scrambling_strategy": (
                "Bypass overhanging extrusive pressure spines via annular tuff-ring benches or "
                "inter-lobe rubble corridors; never pull outward on perlitic breccia flakes "
                "or breadcrust pumice rinds."
            ),
            "crossing_strategy": (
                "Keep center of mass directly over the knees when stepping across tilted "
                "obsidian-perlite slabs; test perlitic onion-skin fractures with downward heel "
                "pressure before transferring weight."
            ),
            "footwork_protocol": (
                "Use stiff-shanked approach or mountaineering boots with full 360° rubber rands "
                "to prevent ankle roll and leather upper slicing in narrow pressure-ridge clefts."
            ),
            "hand_protection_protocol": (
                "Wear cut-resistant aramid-lined scramble gloves and long-cuff abrasion sleeves "
                "when threading narrow slot corridors between extrusive glass spines."
            ),
            "conservation_protocol": (
                "Stay off fragile tephra-ring cryptobiotic crusts and preserve pre-contact "
                "Kutzadika'a Paiute obsidian tool-working floors around Mono Basin."
            ),
            "field_notes": (
                "Extruded around 1350–1400 CE, the Mono-Inyo domes combine dense black vitrophyre "
                "ribs with brittle hydrated perlite and low-density pumice breccia that collapses "
                "audibly under heavy packs."
            ),
        }
    ),
    ObsidianCouleeSite(
        {
            "id": "hrafntinnusker-torfajokull-obsidian-plateau-iceland",
            "name": "Hrafntinnusker & Laugavegur Subglacial-Rhyolite Obsidian Ridge",
            "country": "Iceland",
            "region": "Fjallabak Nature Reserve (Torfajökull Caldera Complex, Southern Highlands)",
            "lithology": "vitrophyre-block-rubble-lobe",
            "coulee_type": "vitrophyre-block-rubble-lobe",
            "morphology": "vitrophyre-block-rubble-lobe",
            "substrate_type": "vitrophyre-block-rubble-lobe",
            "difficulty": "challenging",
            "elevation_range": "1,020–1,140 m",
            "max_elevation_m": 1140,
            "default_conchoidal_flake_density_pct": 72.0,
            "default_block_instability_tilt_deg": 27.0,
            "default_vesicular_pumice_crust_ratio_pct": 46.0,
            "default_coulee_crest_relief_m": 52.0,
            "default_scrambler_pack_mass_kg": 18.0,
            "primary_hazard": (
                "Quenched subglacial rhyolite vitrophyre and pitchstone rubble lobes coated in "
                "rime ice or wet highland mist, adjacent to collapsed geothermal snow bridges "
                "and razor-sharp 'raven-flint' (hrafntinna) boulder fields."
            ),
            "scrambling_strategy": (
                "Follow staked ridge lines across compact vitrophyre rubble benches; avoid "
                "stepping onto thin perennial snow cornices or steam-hollowed ice pockets "
                "abutting warm obsidian-rhyolite coulee margins."
            ),
            "crossing_strategy": (
                "When rain or highland fog wets glassy conchoidal facets, shorten stride by 35% "
                "and place boots only on rough spherulitic or devitrified rhyolite matrix rather "
                "than slick mirror-smooth obsidian faces."
            ),
            "footwork_protocol": (
                "Combine high-durometer Vibram Megagrip boots with heavy gaiters; do not wear "
                "lightweight aluminum microspikes directly on bare obsidian blocks as steel/alloy "
                "chains skate violently and chip conchoidal glass."
            ),
            "hand_protection_protocol": (
                "Wear waterproof insulated cut-resistant Kevlar gloves to protect against both "
                "freezing highland wind-chill and wet surgical-sharp hrafntinna glass shards."
            ),
            "conservation_protocol": (
                "Strictly prohibited under Fjallabak Nature Reserve regulations to remove any "
                "hrafntinna (obsidian) samples or step off durable glassy rubble onto fragile "
                "highland moss carpets."
            ),
            "field_notes": (
                "Torfajökull is Iceland's largest silicic volcanic center; rapid subglacial and "
                "subaerial quenching created extensive black vitrophyre coulees where sudden "
                "orographic blizzards occur even in mid-August."
            ),
        }
    ),
]

OBSIDIAN_SITES = OBSIDIAN_COULEE_SITES

OBSIDIAN_COULEE_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "ANSI A7/A9 Para-Aramid (Kevlar/Dyneema) Lined Leather Scrambling Gloves",
        "category": "protection",
        "priority": "essential",
        "reason": (
            "Prevents deep tendon and palmar artery lacerations from surgical-grade "
            "(~3 nm edge radius) conchoidal obsidian fractures during three-point scrambling."
        ),
    },
    {
        "item": "High-Durometer Vibram Mont Boots with 360° Rand & Kevlar Scree Gaiters",
        "category": "footwear",
        "priority": "essential",
        "reason": (
            "Resists rapid lug chunking, midsole puncturing, and upper sidewall slicing "
            "across razor-edged volcanic glass spalls and wedging coulee clefts."
        ),
    },
    {
        "item": "ANSI Z87.1+ Wrap-Around Ballistic Polycarbonate Eye Shields",
        "category": "eye-protection",
        "priority": "essential",
        "reason": (
            "Blocks airborne conchoidal glass micro-spalls ejected when heavy obsidian "
            "blocks shift, grind, or fracture under scrambler boot loads."
        ),
    },
    {
        "item": "UHMWPE / Cordura Articulated Shin & Knee Guards",
        "category": "armor",
        "priority": "essential",
        "reason": (
            "Protects patellar tendons and tibial crests if a frothy vesicular pumice "
            "carapace crust punches through into an angular glass-block cavity."
        ),
    },
    {
        "item": "Chromoly-Tipped Probing Poles (No Rubber Ferrules, Heavy Snow Baskets Removed)",
        "category": "mobility",
        "priority": "essential",
        "reason": (
            "Tests hollow vesicular pumice breadcrusts and block teeter stability ahead "
            "of the lead scrambler without wedging baskets into narrow glass-block slots."
        ),
    },
    {
        "item": "Hemostatic Trauma & Glass-Shard Irrigation Kit (QuikClot, Fine Forceps, Steri-Strips)",
        "category": "medical",
        "priority": "essential",
        "reason": (
            "Provides immediate hemorrhage control and high-pressure sterile irrigation "
            "to flush translucent vitrophyre micro-splinters before wound closure."
        ),
    },
]


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 reference sites in the volcanic obsidian-flow coulee catalog."""
    return [dict(site) for site in OBSIDIAN_COULEE_SITES]


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Return a single obsidian coulee site dictionary by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in OBSIDIAN_COULEE_SITES:
        if site["id"].lower() == target:
            return dict(site)
    return None


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6-item essential gear checklist for volcanic obsidian-flow coulee scrambling."""
    return list(OBSIDIAN_COULEE_GEAR_CHECKLIST)


def filter_sites(
    country: str | None = None,
    lithology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
    coulee_type: str | None = None,
    morphology: str | None = None,
    substrate_type: str | None = None,
) -> list[dict[str, Any]]:
    """Filter the obsidian coulee catalog by country, lithology, difficulty, or search."""
    effective_lithology = lithology or coulee_type or morphology or substrate_type
    results: list[dict[str, Any]] = []
    for site in OBSIDIAN_COULEE_SITES:
        if country and site["country"].lower() != country.strip().lower():
            continue
        if (
            effective_lithology
            and effective_lithology.strip().lower() not in site["lithology"].lower()
        ):
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
                    str(site.get("lithology", "")),
                    str(site.get("primary_hazard", "")),
                    str(site.get("field_notes", "")),
                ]
            ).lower()
            if q not in searchable:
                continue
        results.append(dict(site))
    return results


def calculate_obsidian_coulee(
    conchoidal_flake_density_pct: float = 55.0,
    block_instability_tilt_deg: float = 22.0,
    vesicular_pumice_crust_ratio_pct: float = 35.0,
    coulee_crest_relief_m: float = 45.0,
    scrambler_pack_mass_kg: float = 16.0,
) -> dict[str, Any]:
    """Calculate surgical laceration severity, vesicular crust collapse, block teeter pinch, and boot lug shred rate."""
    if not (5.0 <= conchoidal_flake_density_pct <= 100.0):
        raise ValueError(
            "conchoidal_flake_density_pct must be between 5.0 and 100.0 %"
        )
    if not (2.0 <= block_instability_tilt_deg <= 48.0):
        raise ValueError(
            "block_instability_tilt_deg must be between 2.0 and 48.0 degrees"
        )
    if not (5.0 <= vesicular_pumice_crust_ratio_pct <= 95.0):
        raise ValueError(
            "vesicular_pumice_crust_ratio_pct must be between 5.0 and 95.0 %"
        )
    if not (5.0 <= coulee_crest_relief_m <= 140.0):
        raise ValueError(
            "coulee_crest_relief_m must be between 5.0 and 140.0 meters"
        )
    if not (4.0 <= scrambler_pack_mass_kg <= 45.0):
        raise ValueError(
            "scrambler_pack_mass_kg must be between 4.0 and 45.0 kg"
        )

    # 1. Surgical laceration severity score (0–100)
    flake_norm = (conchoidal_flake_density_pct - 5.0) / 95.0
    tilt_norm = (block_instability_tilt_deg - 2.0) / 46.0
    pack_norm = (scrambler_pack_mass_kg - 4.0) / 41.0
    relief_norm = (coulee_crest_relief_m - 5.0) / 135.0
    pumice_norm = (vesicular_pumice_crust_ratio_pct - 5.0) / 90.0

    surgical_laceration_severity_score = round(
        min(
            100.0,
            max(
                4.0,
                6.0
                + flake_norm * 54.0
                + tilt_norm * 24.0
                + pack_norm * 10.0
                + flake_norm * tilt_norm * 12.0,
            ),
        ),
        1,
    )

    # 2. Vesicular pumice crust collapse probability (%)
    vesicular_crust_collapse_probability_pct = round(
        min(
            99.0,
            max(
                3.0,
                4.5
                + pumice_norm * 56.0
                + pack_norm * 22.0
                + relief_norm * 12.0
                + pumice_norm * pack_norm * 12.0,
            ),
        ),
        1,
    )

    # 3. Block teeter & ankle/hand pinch hazard (%)
    block_teeter_pinch_hazard_pct = round(
        min(
            99.0,
            max(
                3.0,
                4.0
                + tilt_norm * 55.0
                + relief_norm * 23.0
                + pack_norm * 14.0
                + tilt_norm * relief_norm * 11.0,
            ),
        ),
        1,
    )

    # 4. Boot lug shred rate (mm per km)
    boot_lug_shred_rate_mm_per_km = round(
        min(
            4.5,
            max(
                0.15,
                0.22
                + flake_norm * 1.95
                + tilt_norm * 0.85
                + pack_norm * 0.55
                + flake_norm * tilt_norm * 0.45,
            ),
        ),
        2,
    )

    composite = max(
        surgical_laceration_severity_score,
        vesicular_crust_collapse_probability_pct,
        block_teeter_pinch_hazard_pct,
    )

    if (
        composite >= 72.0
        or conchoidal_flake_density_pct >= 85.0
        or block_instability_tilt_deg >= 38.0
    ):
        risk_level = "critical"
        safety_status = (
            "CRITICAL — EXTREME CONCHOIDAL GLASS LACERATION & VESICULAR CRUST PUNCH-THROUGH HAZARD"
        )
        scrambling_strategy = (
            "Abort steep pressure-spine or advancing-lobe talus ascents; descend into low-angle "
            "consolidated rhyolite trough corridors, enforce a >= 6 m stagger between scramblers, "
            "wear ANSI A8/A9 Kevlar gauntlets + Z87.1+ eye shields, and probe all frothy pumice crusts."
        )
    elif (
        composite >= 48.0
        or conchoidal_flake_density_pct >= 65.0
        or block_instability_tilt_deg >= 26.0
    ):
        risk_level = "high"
        safety_status = (
            "HIGH CAUTION — ACTIVE GLASS-BLOCK TEETER & SURGICAL FLAKE EXPOSURE"
        )
        scrambling_strategy = (
            "Maintain three-point contact using ANSI A7+ para-aramid lined leather gloves, step only "
            "on matte flow-foliated rhyolite ribs, sound pale pumiceous breadcrusts with a chromoly "
            "pole tip before loading, and inspect boot lugs every 1.5 km."
        )
    elif composite >= 26.0:
        risk_level = "moderate"
        safety_status = (
            "MODERATE — STANDARD VOLCANIC OBSIDIAN COULEE SCRAMBLING PROTOCOLS"
        )
        scrambling_strategy = (
            "Follow established inter-ridge benches, wear cut-resistant gloves and Kevlar ankle "
            "gaiters, test medium blocks for rocking before committing pack weight, and avoid "
            "smearing boots across mirror-black conchoidal facets."
        )
    else:
        risk_level = "low"
        safety_status = (
            "LOW — CONSOLIDATED FLOW-BANDED RHYOLITE BENCH"
        )
        scrambling_strategy = (
            "Proceed across stable flow-foliated rhyolite benches with high-durometer lugged boots "
            "and protective gloves while remaining alert for isolated obsidian spalls."
        )

    warnings: list[str] = []
    recommendations: list[str] = []

    if surgical_laceration_severity_score >= 50.0 or conchoidal_flake_density_pct >= 60.0:
        warnings.append(
            f"Severe surgical glass laceration hazard (score {surgical_laceration_severity_score}/100): "
            f"{conchoidal_flake_density_pct:.1f}% conchoidal obsidian flake cover can sever tendons on contact."
        )
        recommendations.append(
            "Enforce full-finger ANSI A7/A9 Kevlar/Dyneema-lined leather gloves, UHMWPE shin guards, and ballistic eye shields."
        )

    if (
        vesicular_crust_collapse_probability_pct >= 45.0
        or vesicular_pumice_crust_ratio_pct >= 50.0
    ):
        warnings.append(
            f"High vesicular pumice carapace punch-through risk ({vesicular_crust_collapse_probability_pct}%): "
            f"{vesicular_pumice_crust_ratio_pct:.1f}% frothy pumice crust under {scrambler_pack_mass_kg:.1f} kg pack load."
        )
        recommendations.append(
            "Probe pale frothy pumice breadcrusts with a chromoly pole tip and step only on dense dark rhyolite-obsidian cores."
        )

    if block_teeter_pinch_hazard_pct >= 45.0 or block_instability_tilt_deg >= 25.0:
        warnings.append(
            f"Unstable glass-block teeter & pinch hazard ({block_teeter_pinch_hazard_pct}%): "
            f"{block_instability_tilt_deg:.1f}° block tilt across {coulee_crest_relief_m:.1f} m coulee relief."
        )
        recommendations.append(
            "Maintain a 6 m fall-line spacing between party members and never place hands or ankles inside inter-block pinch clefts."
        )

    if boot_lug_shred_rate_mm_per_km >= 1.5:
        warnings.append(
            f"Accelerated outsole lug shredding ({boot_lug_shred_rate_mm_per_km:.2f} mm/km): "
            "sharp conchoidal glass ribs rapidly slice soft rubber compounds."
        )
        recommendations.append(
            "Use high-durometer Vibram Mont mountaineering/approach boots with a 360° rubber rand and carry Urethane/Aquaseal sidewall repair adhesive."
        )

    if not warnings:
        warnings.append(
            "Minor conchoidal glass spall scatter and localized block rocking; avoid bare-handed bracing."
        )
    if not recommendations:
        recommendations.append(
            "Wear cut-resistant scramble gloves, plant boots flat on matte rhyolite bands, and leave all obsidian specimens in place."
        )

    return {
        "conchoidal_flake_density_pct": float(conchoidal_flake_density_pct),
        "block_instability_tilt_deg": float(block_instability_tilt_deg),
        "vesicular_pumice_crust_ratio_pct": float(vesicular_pumice_crust_ratio_pct),
        "coulee_crest_relief_m": float(coulee_crest_relief_m),
        "scrambler_pack_mass_kg": float(scrambler_pack_mass_kg),
        "surgical_laceration_severity_score": surgical_laceration_severity_score,
        "vesicular_crust_collapse_probability_pct": vesicular_crust_collapse_probability_pct,
        "block_teeter_pinch_hazard_pct": block_teeter_pinch_hazard_pct,
        "boot_lug_shred_rate_mm_per_km": boot_lug_shred_rate_mm_per_km,
        "risk_level": risk_level,
        "safety_status": safety_status,
        "scrambling_strategy": scrambling_strategy,
        "crossing_strategy": scrambling_strategy,
        "warnings": warnings,
        "recommendations": recommendations,
    }


_STRONG_OBSIDIAN_COULEE_KEYWORDS: tuple[str, ...] = (
    "obsidian coulee",
    "obsidian-coulee",
    "obsidian_coulee",
    "obsidian flow",
    "obsidian-flow",
    "obsidian dome",
    "obsidian-dome",
    "obsidian ridge",
    "obsidian plateau",
    "obsidian block",
    "obsidian boulder",
    "obsidian talus",
    "obsidian scramble",
    "obsidian scrambling",
    "big obsidian flow",
    "newberry caldera",
    "paulina peak rhyolite",
    "glass mountain",
    "medicine lake volcano",
    "medicine lake highlands",
    "panum crater",
    "mono-inyo",
    "mono inyo",
    "hrafntinnusker",
    "hrafntinna",
    "torfajokull",
    "torfajökull",
    "conchoidal fracture",
    "conchoidal flake",
    "conchoidal glass",
    "volcanic glass",
    "glass-block coulee",
    "glass block coulee",
    "vitrophyre",
    "rhyolite coulee",
    "rhyolitic coulee",
    "perlitic breccia",
    "pumiceous carapace",
)

_CONTEXT_OBSIDIAN_TERMS: tuple[str, ...] = (
    "obsidian",
    "conchoidal",
    "coulee",
    "rhyolite",
    "perlitic",
    "pumice crust",
    "pressure-spine",
    "pressure spine",
)

_ADJACENT_DOMAIN_EXCLUSIONS: tuple[str, ...] = (
    "mount yasur",
    "yasur",
    "acatenango",
    "tarawera",
    "chaiten",
    "chaitén",
    "ash-fall",
    "ashfall",
    "lapilli",
    "cristobalite",
    "pumice scree",
    "scoria scree",
    "vitrophyric ash",
    "vitrophyric-ash",
    "frenchman coulee",
    "tsingy",
    "bemaraha",
    "rillenkarren",
    "razor limestone",
    "solfatara",
    "kverkfjöll",
    "kverkfjoll",
    "kazumura",
    "lava tube",
    "biospeleology",
    "mahoosuc",
    "algific",
    "talus cold trap",
    "mount sneffels",
    "wastwater screes",
)


def is_obsidian_coulee_query(query: str) -> bool:
    """Return True if the user query specifically targets volcanic obsidian-flow & glass-block coulee scrambling."""
    if not query or not query.strip():
        return False
    q = query.lower()

    if any(kw in q for kw in _STRONG_OBSIDIAN_COULEE_KEYWORDS):
        return True

    if any(excl in q for excl in _ADJACENT_DOMAIN_EXCLUSIONS):
        return False

    context_hits = sum(1 for term in _CONTEXT_OBSIDIAN_TERMS if term in q)
    if context_hits >= 2:
        return True

    if "obsidian" in q and any(
        w in q
        for w in (
            "scramble",
            "scrambling",
            "gloves",
            "kevlar",
            "boots",
            "lug",
            "laceration",
            "sharp",
            "glass",
            "crust",
            "dome",
            "flow",
            "coulee",
        )
    ):
        return True

    return False


def detect_obsidian_coulee_intent(query: str) -> bool:
    """Alias for is_obsidian_coulee_query used across main.py and chat_request.py."""
    return is_obsidian_coulee_query(query)


def _match_site_from_query(query: str) -> ObsidianCouleeSite:
    q = query.lower()
    if any(
        w in q
        for w in (
            "glass mountain",
            "medicine lake",
            "modoc",
            "siskiyou",
            "pumiceous-carapace",
            "pumiceous carapace",
        )
    ):
        return OBSIDIAN_COULEE_SITES[1]
    if any(
        w in q
        for w in (
            "panum",
            "mono-inyo",
            "mono inyo",
            "mono lake",
            "inyo craters",
            "perlitic",
            "pressure-spine",
            "pressure spine",
        )
    ):
        return OBSIDIAN_COULEE_SITES[2]
    if any(
        w in q
        for w in (
            "hrafntinnusker",
            "hrafntinna",
            "torfajokull",
            "torfajökull",
            "laugavegur",
            "fjallabak",
            "iceland",
            "vitrophyre",
        )
    ):
        return OBSIDIAN_COULEE_SITES[3]
    return OBSIDIAN_COULEE_SITES[0]


def extract_obsidian_coulee_params(query: str) -> dict[str, Any]:
    """Extract numerical calculator parameters from a natural-language query."""
    matched_site = _match_site_from_query(query)
    params: dict[str, Any] = {
        "conchoidal_flake_density_pct": float(
            matched_site["default_conchoidal_flake_density_pct"]
        ),
        "block_instability_tilt_deg": float(
            matched_site["default_block_instability_tilt_deg"]
        ),
        "vesicular_pumice_crust_ratio_pct": float(
            matched_site["default_vesicular_pumice_crust_ratio_pct"]
        ),
        "coulee_crest_relief_m": float(matched_site["default_coulee_crest_relief_m"]),
        "scrambler_pack_mass_kg": float(
            matched_site["default_scrambler_pack_mass_kg"]
        ),
    }

    q = query.lower()

    m_flake = re.search(
        r"(\d+(?:\.\d+)?)\s*%\s*(?:conchoidal|flake|glass|obsidian)",
        q,
    ) or re.search(
        r"(?:conchoidal|flake density)[^\d]{0,25}(\d+(?:\.\d+)?)\s*%",
        q,
    )
    if m_flake:
        val = float(m_flake.group(1))
        params["conchoidal_flake_density_pct"] = min(100.0, max(5.0, val))

    m_tilt = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:deg|degrees|°)\s*(?:block|tilt|instability|slope|incline)",
        q,
    ) or re.search(
        r"(?:block|tilt|instability)[^\d]{0,25}(\d+(?:\.\d+)?)\s*(?:deg|degrees|°)",
        q,
    )
    if m_tilt:
        val = float(m_tilt.group(1))
        params["block_instability_tilt_deg"] = min(48.0, max(2.0, val))

    m_pumice = re.search(
        r"(\d+(?:\.\d+)?)\s*%\s*(?:vesicular|pumice|crust|carapace)",
        q,
    ) or re.search(
        r"(?:vesicular|pumice crust|carapace)[^\d]{0,25}(\d+(?:\.\d+)?)\s*%",
        q,
    )
    if m_pumice:
        val = float(m_pumice.group(1))
        params["vesicular_pumice_crust_ratio_pct"] = min(95.0, max(5.0, val))

    m_relief = re.search(
        r"(\d+(?:\.\d+)?)\s*m\s*(?:coulee|crest|relief|ridge|spine|lobe)",
        q,
    ) or re.search(
        r"(?:crest relief|coulee relief|relief)[^\d]{0,25}(\d+(?:\.\d+)?)\s*m\b",
        q,
    )
    if m_relief:
        val = float(m_relief.group(1))
        params["coulee_crest_relief_m"] = min(140.0, max(5.0, val))

    m_pack = re.search(
        r"(\d+(?:\.\d+)?)\s*kg\b",
        q,
    )
    if m_pack:
        val = float(m_pack.group(1))
        params["scrambler_pack_mass_kg"] = min(45.0, max(4.0, val))

    return params


def format_obsidian_coulee_response(query: str) -> dict[str, Any]:
    """Build a structured domain response dictionary for chat and streaming endpoints."""
    matched_site = _match_site_from_query(query)
    params = extract_obsidian_coulee_params(query)
    calc_info: dict[str, Any] = calculate_obsidian_coulee(
        conchoidal_flake_density_pct=params["conchoidal_flake_density_pct"],
        block_instability_tilt_deg=params["block_instability_tilt_deg"],
        vesicular_pumice_crust_ratio_pct=params["vesicular_pumice_crust_ratio_pct"],
        coulee_crest_relief_m=params["coulee_crest_relief_m"],
        scrambler_pack_mass_kg=params["scrambler_pack_mass_kg"],
    )

    summary = (
        f"**High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Assessment — {matched_site['name']} "
        f"({matched_site['country']})**\n\n"
        f"- **Coulee Lithology**: `{matched_site['lithology']}` | **Risk Level**: `{calc_info['risk_level'].upper()}`\n"
        f"- **Surgical Laceration Severity Score**: `{calc_info['surgical_laceration_severity_score']}/100` "
        f"({params['conchoidal_flake_density_pct']}% conchoidal flake density)\n"
        f"- **Vesicular Crust Collapse Probability**: `{calc_info['vesicular_crust_collapse_probability_pct']}%` "
        f"({params['vesicular_pumice_crust_ratio_pct']}% frothy pumice crust, {params['scrambler_pack_mass_kg']} kg pack)\n"
        f"- **Block Teeter & Pinch Hazard**: `{calc_info['block_teeter_pinch_hazard_pct']}%` "
        f"({params['block_instability_tilt_deg']}° block tilt, {params['coulee_crest_relief_m']} m crest relief)\n"
        f"- **Boot Lug Shred Rate**: `{calc_info['boot_lug_shred_rate_mm_per_km']} mm/km` "
        f"(use high-durometer Vibram Mont soles + 360° rubber rand)\n"
        f"- **Scrambling Strategy**: {calc_info['scrambling_strategy']}\n"
        f"- **Conservation Protocol**: {matched_site['conservation_protocol']}"
    )

    return {
        "domain": "obsidian_coulee",
        "action": "obsidian_coulee_info",
        "query": query,
        "matched_site": dict(matched_site),
        "sites": [dict(s) for s in OBSIDIAN_COULEE_SITES],
        "calculation": calc_info,
        "gear_checklist": get_gear_checklist(),
        "summary": summary,
        "answer": summary,
    }


def build_obsidian_coulee_prompt(info_or_query: dict[str, Any] | str) -> str:
    """Build system prompt context for LLM augmentation on volcanic obsidian-flow coulee queries."""
    info: dict[str, Any] = (
        format_obsidian_coulee_response(info_or_query)
        if isinstance(info_or_query, str)
        else info_or_query
    )
    site = info["matched_site"]
    calc = info["calculation"]
    return (
        "### High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling Context\n"
        f"Matched Reference Site: {site['name']} ({site['country']}, {site['region']})\n"
        f"Lithology: {site['lithology']} | Difficulty: {site['difficulty']}\n"
        f"Calculated Risk Level: {calc['risk_level']} ({calc['safety_status']})\n"
        f"Metrics: Surgical Laceration Score={calc['surgical_laceration_severity_score']}/100, "
        f"Vesicular Crust Collapse={calc['vesicular_crust_collapse_probability_pct']}%, "
        f"Block Teeter Pinch Hazard={calc['block_teeter_pinch_hazard_pct']}%, "
        f"Boot Lug Shred Rate={calc['boot_lug_shred_rate_mm_per_km']} mm/km.\n"
        f"Scrambling Strategy: {calc['scrambling_strategy']}\n"
        f"Site Conservation Protocol: {site['conservation_protocol']}\n"
    )


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response payload for obsidian coulee intent."""
    info: dict[str, Any] = format_obsidian_coulee_response(query)
    return {
        "answer": info["summary"],
        "context": [site["name"] for site in OBSIDIAN_COULEE_SITES],
        "obsidian_coulee_info": info,
    }


def generate_stream_events(query: str) -> Iterator[dict[str, Any]]:
    """Yield SSE event dictionaries for streaming obsidian coulee responses."""
    info: dict[str, Any] = format_obsidian_coulee_response(query)
    yield {
        "event": "obsidian_coulee_info",
        "data": info,
        "obsidian_coulee_info": info,
    }
    yield {
        "event": "message",
        "answer": info["summary"],
        "context": [site["name"] for site in OBSIDIAN_COULEE_SITES],
        "obsidian_coulee_info": info,
    }
