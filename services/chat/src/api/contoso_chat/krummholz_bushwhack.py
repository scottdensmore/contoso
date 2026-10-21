"""Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking Guide module.

Provides domain data, physics-based thicket stem drag & effective velocity modeling,
tree-well / spruce-trap void collapse risk estimation, metabolic expenditure calculation,
branch-snag resistance indexing, mandatory safety gear checklists, and intent detection for
subalpine krummholz and dwarf-conifer thickets.
"""

from __future__ import annotations

import json
import re
from collections.abc import Generator
from typing import Any, Literal

KrummholzEcotype = Literal[
    "balsam-fir-spruce-mat",
    "mountain-pine-latschen-labyrinth",
    "subalpine-larch-alder-thicket",
    "wind-flagged-whitebark-cushion",
]
KrummholzDifficulty = Literal["moderate", "challenging", "extreme"]
KrummholzRiskLevel = Literal["low", "moderate", "high", "critical"]
KrummholzTransitStrategy = Literal[
    "frost-ridge-rock-hopping-leads",
    "streamlined-pack-creek-bed-bypass",
    "probe-tested-canopy-crawling",
    "abort-impenetrable-spruce-trap-labyrinth",
]


class _AttrDict(dict[str, Any]):
    """Dictionary subclass supporting attribute-style read access."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc


# ---------------------------------------------------------------------------
# Reference Subalpine Krummholz & Dwarf-Conifer Thicket Sites Catalog (4 Sites)
# ---------------------------------------------------------------------------

KRUMMHOLZ_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "presidential-krummholz-whitemtns-usa",
            "name": "Presidential Range Abies balsamea Krummholz Wave Zone",
            "country": "United States",
            "region": "White Mountains, New Hampshire",
            "elevation": "1,280 – 1,520 m",
            "elevation_m": 1400,
            "ecotype": "balsam-fir-spruce-mat",
            "difficulty": "extreme",
            "default_stems_per_sq_meter": 28.0,
            "default_canopy_mat_height_m": 1.8,
            "default_snow_moat_depth_cm": 95.0,
            "default_slope_angle_deg": 26.0,
            "default_pack_width_cm": 48.0,
            "spruce_trap_protocol": (
                "Probe ahead of every step with locked trekking poles when crossing drifted snow "
                "bridges over horizontal balsam fir bows; never step directly adjacent to emergent leader tips."
            ),
            "primary_hazard": (
                "Interlocking rime-encrusted Abies balsamea (balsam fir) and Picea rubens mats concealing "
                "1.5–2.0 m deep sub-canopy snow moats ('spruce traps') and eye-level dead branch stubs."
            ),
            "navigation_protocol": (
                "Follow glacial erratic boulder strings and dry avalanchebrook boulder ribs across "
                "fir waves; stow all external pack attachments and wear polycarbonate eye protection."
            ),
            "traversal_protocol": (
                "Follow glacial erratic boulder strings and dry avalanchebrook boulder ribs across "
                "fir waves; stow all external pack attachments and wear polycarbonate eye protection."
            ),
            "field_notes": (
                "Hurricane-force Mount Washington winds sculpt dense cyclical 'fir waves' where "
                "unprepared off-trail bushwhackers routinely drop to 0.25 km/h and suffer inverted spruce-trap entrapment."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "karwendel-latschenkiefer-tyrol-austria",
            "name": "Karwendel Pinus mugo Latschenkiefer Limestone Bench Labyrinth",
            "country": "Austria",
            "region": "Karwendel Alps, Tyrol",
            "elevation": "1,650 – 2,100 m",
            "elevation_m": 1875,
            "ecotype": "mountain-pine-latschen-labyrinth",
            "difficulty": "challenging",
            "default_stems_per_sq_meter": 18.0,
            "default_canopy_mat_height_m": 1.6,
            "default_snow_moat_depth_cm": 40.0,
            "default_slope_angle_deg": 22.0,
            "default_pack_width_cm": 44.0,
            "spruce_trap_protocol": (
                "Test elastic Pinus mugo prostrate trunks before committing full body weight; "
                "avoid stepping into dark gaps between overlapping Latschen crowns that mask karst fissures."
            ),
            "primary_hazard": (
                "Springy, resinous prostrate Pinus mugo (Latschenkiefer) stems bowing downslope over "
                "Wetterstein limestone solution grikes and sudden drop-offs."
            ),
            "navigation_protocol": (
                "Exploit seasonal gravel scree gullies (Schuttkarren) and chamois game paths (Gamswechsel) "
                "to link open limestone benches rather than fighting straight uphill against down-swept pine bows."
            ),
            "traversal_protocol": (
                "Exploit seasonal gravel scree gullies (Schuttkarren) and chamois game paths (Gamswechsel) "
                "to link open limestone benches rather than fighting straight uphill against down-swept pine bows."
            ),
            "field_notes": (
                "Dense Tyrolean Latschenfelder form elastic, head-high green mazes across subalpine "
                "carbonate terraces, demanding precise micro-route reading from above before descending."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "garibaldi-slide-alder-subalpine-canada",
            "name": "Garibaldi & Coast Range Sitka Alder / Subalpine Fir Mat",
            "country": "Canada",
            "region": "Garibaldi Provincial Park, Coast Mountains, British Columbia",
            "elevation": "1,350 – 1,750 m",
            "elevation_m": 1550,
            "ecotype": "subalpine-larch-alder-thicket",
            "difficulty": "challenging",
            "default_stems_per_sq_meter": 20.0,
            "default_canopy_mat_height_m": 2.1,
            "default_snow_moat_depth_cm": 65.0,
            "default_slope_angle_deg": 24.0,
            "default_pack_width_cm": 46.0,
            "spruce_trap_protocol": (
                "Maintain partner voice and visual contact within 8 m when transitioning from springtime "
                "maritime snowpack onto hollowed-out Abies lasiocarpa tree wells and slide-alder arches."
            ),
            "primary_hazard": (
                "Down-curved Alnus viridis sinuata (Sitka slide alder) and yellow-cedar cripplebrush "
                "creating slick, spring-loaded stem traps over steep gullies and early-summer snow moats."
            ),
            "navigation_protocol": (
                "Gain timberline ridge crests early via old-growth timber ribs to bypass avalanche-path "
                "slide alder entirely; if descending through alder, travel with the grain of the downslope stems."
            ),
            "traversal_protocol": (
                "Gain timberline ridge crests early via old-growth timber ribs to bypass avalanche-path "
                "slide alder entirely; if descending through alder, travel with the grain of the downslope stems."
            ),
            "field_notes": (
                "Pacific Northwest Coast Range bushwhacking is infamous for 'avalanche-trained' Sitka "
                "alder and subalpine fir mats that repel uphill travel like giant overlapping fish scales."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "tateyama-hai-matsu-alps-japan",
            "name": "Tateyama Kurobe Pinus pumila Hai-Matsu Wind-Swept Crest",
            "country": "Japan",
            "region": "Hida Mountains (Northern Japan Alps), Toyama Prefecture",
            "elevation": "2,300 – 2,750 m",
            "elevation_m": 2525,
            "ecotype": "wind-flagged-whitebark-cushion",
            "difficulty": "moderate",
            "default_stems_per_sq_meter": 10.0,
            "default_canopy_mat_height_m": 0.9,
            "default_snow_moat_depth_cm": 25.0,
            "default_slope_angle_deg": 14.0,
            "default_pack_width_cm": 40.0,
            "spruce_trap_protocol": (
                "Stay strictly on frost-shattered granite block leads and flagged corridor stones; "
                "avoid stepping into wind-hollowed snow pockets leeward of Pinus pumila cushions."
            ),
            "primary_hazard": (
                "Tangled knee-to-waist-high Pinus pumila (Japanese stone pine / Hai-Matsu) mats hiding "
                "sharp porphyritic granite blocks and sudden Siberian-monsoon whiteout disorientation."
            ),
            "navigation_protocol": (
                "Thread interconnected wind-deflation gravel leads and boulder fields between dwarf pine "
                "islands while preserving Rock Ptarmigan (Raicho) nesting cushions."
            ),
            "traversal_protocol": (
                "Thread interconnected wind-deflation gravel leads and boulder fields between dwarf pine "
                "islands while preserving Rock Ptarmigan (Raicho) nesting cushions."
            ),
            "field_notes": (
                "Extreme Sea of Japan winter snowpacks and violent westerly jets compress Pinus pumila "
                "into streamlined waist-high carpets across the high Tateyama and剱岳 (Tsurugi-dake) ridges."
            ),
        }
    ),
]

KRUMMHOLZ_BUSHWHACK_SITES: list[dict[str, Any]] = KRUMMHOLZ_SITES


# ---------------------------------------------------------------------------
# Mandatory 6-Item Krummholz & Dwarf-Conifer Bushwhacking Gear Checklist
# ---------------------------------------------------------------------------

KRUMMHOLZ_BUSHWHACK_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "ANSI Z87.1 Clear/Amber Polycarbonate Forestry Eye Shield Glasses",
        "category": "eye_face_protection",
        "priority": "essential",
        "rationale": (
            "Prevents corneal abrasions and penetrating eye trauma from whip-back dwarf conifer "
            "needles and brittle dead sub-canopy Abies/Pinus branch stubs."
        ),
    },
    {
        "item": "500D Cordura Ripstop Brush Gaiters & Abrasion-Resistant Shell Pants",
        "category": "lower_limb_armor",
        "priority": "essential",
        "rationale": (
            "Stops jagged broken krummholz stubs from puncturing shins, tearing waterproof membranes, "
            "or funneling conifer needles and wet snow into boot cuffs."
        ),
    },
    {
        "item": "Slick-Haul Tubular Alpine Pack (Zero External Mesh Pockets or Dangling Gear)",
        "category": "pack_streamlining",
        "priority": "essential",
        "rationale": (
            "Eliminates branch-snag hang-ups in dense >15 stems/m² thickets where wide frames or "
            "strapped-on snowshoes anchor the climber backward on every step."
        ),
    },
    {
        "item": "240 cm Collapsible Aluminum Avalanche / Spruce-Trap Sounding Probe & Basketless Pole",
        "category": "void_detection",
        "priority": "essential",
        "rationale": (
            "Allows continuous sounding of drifted snow bridges to detect 1–2.5 m deep sub-canopy "
            "spruce traps and tree-well voids before committing body weight."
        ),
    },
    {
        "item": "Reinforced Goat-Leather Thorn & Pitch-Resistant Rigging Gloves",
        "category": "hand_protection",
        "priority": "essential",
        "rationale": (
            "Protects hands from sticky conifer resin, sharp desiccation-hardened twigs, and rough "
            "bark during continuous stem parting and four-point canopy scrambling."
        ),
    },
    {
        "item": "Loud Pea-Less Emergency Whistle & Chest-Harness Dual-Band GPS/PLB",
        "category": "partner_contact_rescue",
        "priority": "essential",
        "rationale": (
            "Maintains acoustic contact when visual sightlines drop below 3 m in head-high thickets "
            "and enables immediate summoning of a partner during inverted tree-well/spruce-trap entrapment."
        ),
    },
]

KRUMMHOLZ_GEAR_CHECKLIST: list[dict[str, Any]] = KRUMMHOLZ_BUSHWHACK_GEAR_CHECKLIST


# ---------------------------------------------------------------------------
# Catalog Accessors & Filtering
# ---------------------------------------------------------------------------


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 reference krummholz bushwhack sites."""
    return list(KRUMMHOLZ_SITES)


def get_all_krummholz_bushwhack_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Return a single krummholz bushwhack site by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in KRUMMHOLZ_SITES:
        if str(site["id"]).lower() == target:
            return site
    return None


def get_krummholz_bushwhack_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    ecotype: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """Filter krummholz bushwhack sites by country, ecotype, difficulty, or free-text search."""
    results: list[dict[str, Any]] = list(KRUMMHOLZ_SITES)

    if country:
        c_lower = country.strip().lower()
        results = [s for s in results if c_lower in str(s["country"]).lower()]

    if ecotype:
        e_lower = ecotype.strip().lower().replace("_", "-")
        results = [s for s in results if str(s["ecotype"]).lower() == e_lower]

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
            or q_lower in str(s["ecotype"]).lower()
            or q_lower in str(s["field_notes"]).lower()
            or q_lower in str(s["id"]).lower()
        ]

    return results


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6-item mandatory krummholz & dwarf-conifer bushwhacking gear checklist."""
    return list(KRUMMHOLZ_BUSHWHACK_GEAR_CHECKLIST)


# ---------------------------------------------------------------------------
# Physics-Based Krummholz & Dwarf-Conifer Thicket Bushwhacking Calculator
# ---------------------------------------------------------------------------


def calculate_krummholz_bushwhack(
    stems_per_sq_meter: float = 12.0,
    canopy_mat_height_m: float = 1.4,
    snow_moat_depth_cm: float = 40.0,
    slope_angle_deg: float = 18.0,
    pack_width_cm: float = 45.0,
) -> dict[str, Any]:
    """Calculate effective bushwhacking velocity, spruce-trap risk, metabolic cost, and branch-snag index.

    Parameters
    ----------
    stems_per_sq_meter:
        Prostrate and interlocking woody stem density in stems/m² [1, 45].
    canopy_mat_height_m:
        Vertical thickness/height of the dwarf-conifer krummholz canopy mat in meters [0.3, 3.5].
    snow_moat_depth_cm:
        Sub-canopy hollow snow moat or spruce-trap void depth in cm [0, 250].
    slope_angle_deg:
        Subalpine terrain slope angle in degrees [0, 50].
    pack_width_cm:
        Effective horizontal backpack profile width in cm [25, 85].
    """
    if not (1.0 <= stems_per_sq_meter <= 45.0):
        raise ValueError("stems_per_sq_meter must be between 1 and 45 stems/m2")
    if not (0.3 <= canopy_mat_height_m <= 3.5):
        raise ValueError("canopy_mat_height_m must be between 0.3 and 3.5 meters")
    if not (0.0 <= snow_moat_depth_cm <= 250.0):
        raise ValueError("snow_moat_depth_cm must be between 0 and 250 cm")
    if not (0.0 <= slope_angle_deg <= 50.0):
        raise ValueError("slope_angle_deg must be between 0 and 50 degrees")
    if not (25.0 <= pack_width_cm <= 85.0):
        raise ValueError("pack_width_cm must be between 25 and 85 cm")

    # 1. Branch snag resistance index (0 to 100)
    raw_snag = (
        (stems_per_sq_meter * 1.45)
        + (canopy_mat_height_m * 11.5)
        + ((pack_width_cm - 25.0) * 0.48)
        + (slope_angle_deg * 0.25)
    )
    branch_snag_resistance_index = round(min(100.0, max(2.0, raw_snag)), 1)

    # 2. Tree-well & spruce-trap collapse risk percentage (0 to 100%)
    raw_trap = (
        (snow_moat_depth_cm * 0.34)
        + (canopy_mat_height_m * 8.2)
        + (stems_per_sq_meter * 0.42)
        + (slope_angle_deg * 0.22)
    )
    if snow_moat_depth_cm <= 0.0:
        raw_trap *= 0.25
    tree_well_spruce_trap_risk_pct = round(min(99.0, max(1.0, raw_trap)), 1)

    # 3. Effective off-trail bushwhacking velocity (km/h)
    drag_factor = (
        1.0
        + (stems_per_sq_meter * 0.11)
        + (canopy_mat_height_m * 0.55)
        + (snow_moat_depth_cm * 0.008)
        + (slope_angle_deg * 0.032)
        + ((pack_width_cm - 30.0) * 0.012)
    )
    effective_velocity_km_h = round(max(0.08, min(3.2, 3.1 / drag_factor)), 2)

    # 4. Metabolic energy expenditure rate (kcal/hr)
    raw_kcal = (
        310.0
        + (stems_per_sq_meter * 9.8)
        + (canopy_mat_height_m * 95.0)
        + (snow_moat_depth_cm * 1.35)
        + (slope_angle_deg * 6.4)
        + ((pack_width_cm - 30.0) * 2.1)
    )
    metabolic_kcal_per_hour = round(min(1350.0, max(260.0, raw_kcal)), 0)

    # 5. Determine Risk Level & Transit Strategy
    warnings: list[str] = []
    recommendations: list[str] = []

    if (
        stems_per_sq_meter >= 34.0
        or snow_moat_depth_cm >= 150.0
        or tree_well_spruce_trap_risk_pct >= 75.0
        or branch_snag_resistance_index >= 85.0
        or effective_velocity_km_h <= 0.32
    ):
        risk_level: KrummholzRiskLevel = "critical"
        transit_strategy: KrummholzTransitStrategy = "abort-impenetrable-spruce-trap-labyrinth"
    elif (
        stems_per_sq_meter >= 20.0
        or snow_moat_depth_cm >= 75.0
        or tree_well_spruce_trap_risk_pct >= 48.0
        or branch_snag_resistance_index >= 54.0
        or canopy_mat_height_m >= 1.8
    ):
        risk_level = "high"
        transit_strategy = "probe-tested-canopy-crawling"
    elif (
        stems_per_sq_meter >= 9.0
        or snow_moat_depth_cm >= 20.0
        or tree_well_spruce_trap_risk_pct >= 24.0
        or branch_snag_resistance_index >= 32.0
        or canopy_mat_height_m >= 1.0
    ):
        risk_level = "moderate"
        transit_strategy = "streamlined-pack-creek-bed-bypass"
    else:
        risk_level = "low"
        transit_strategy = "frost-ridge-rock-hopping-leads"

    # Populate actionable warnings
    if tree_well_spruce_trap_risk_pct >= 45.0 or snow_moat_depth_cm >= 60.0:
        warnings.append(
            f"SEVERE SPRUCE-TRAP / TREE-WELL HAZARD ({tree_well_spruce_trap_risk_pct:.1f}%): "
            f"Sub-canopy snow moat depth ({snow_moat_depth_cm:.0f} cm) beneath a "
            f"{canopy_mat_height_m:.1f} m krummholz mat creates high risk of inverted entrapment."
        )
    if branch_snag_resistance_index >= 55.0 or stems_per_sq_meter >= 22.0:
        warnings.append(
            f"EXTREME STEM DRAG & PACK SNAGGING (Index {branch_snag_resistance_index:.1f}/100): "
            f"{stems_per_sq_meter:.0f} stems/m² with a {pack_width_cm:.0f} cm pack reduces "
            f"forward progress to {effective_velocity_km_h:.2f} km/h."
        )
    if metabolic_kcal_per_hour >= 800.0:
        warnings.append(
            f"EXHAUSTION & SWEAT-SOAK HYPOTHERMIA RISK: Estimated burn rate of "
            f"{metabolic_kcal_per_hour:.0f} kcal/hr in dense cripplebrush can rapidly deplete "
            "glycogen and drench base layers prior to exposed alpine ridge emergence."
        )
    if slope_angle_deg >= 30.0 and canopy_mat_height_m >= 1.5:
        warnings.append(
            f"Steep {slope_angle_deg:.0f}° slope combined with spring-loaded downslope stems "
            "creates slip-and-impale hazards on dead lower conifer stubs."
        )

    # Populate technical recommendations
    if transit_strategy == "abort-impenetrable-spruce-trap-labyrinth":
        recommendations.append(
            "DO NOT FORCE DIRECT THICKET PENETRATION: Progress below 0.35 km/h with severe "
            "spruce-trap void hazard. Contour laterally or retreat to an open avalanche talus rib, "
            "dry creek bed, or subalpine ridge spine."
        )
        recommendations.append(
            "Maintain strict 3-meter partner spacing with whistles ready; never travel solo when "
            "sub-canopy snow moats exceed 100 cm."
        )
    elif transit_strategy == "probe-tested-canopy-crawling":
        recommendations.append(
            "Sound every snow bridge ahead with a locked trekking pole or probe before committing weight, "
            "and distribute load across thicker horizontal conifer boughs when canopy-crawling."
        )
        recommendations.append(
            "Strip all external items (snowshoes, ice axes, foam pads) from the outside of your pack "
            "to prevent backward hang-ups in interlocking branches."
        )
    elif transit_strategy == "streamlined-pack-creek-bed-bypass":
        recommendations.append(
            "Link interconnected boulder leads, dry drainage channels, and animal game paths to bypass "
            "the densest krummholz wave crests."
        )
        recommendations.append(
            "Wear ANSI-rated polycarbonate eye protection and 500D Cordura gaiters to shield against "
            "whip-back branches and lower-limb stub punctures."
        )
    else:
        recommendations.append(
            "Standard subalpine cushion-zone transit: rock-hop along frost-shattered granite/limestone "
            "leads and avoid trampling slow-growing wind-flagged conifer cushions."
        )

    recommendations.append(
        "Unbuckle your pack hip-belt and sternum strap when crossing deep snow moats over buried "
        "krummholz so you can jettison the load if dropped into a tree well."
    )

    return _AttrDict(
        {
            "stems_per_sq_meter": round(stems_per_sq_meter, 1),
            "canopy_mat_height_m": round(canopy_mat_height_m, 2),
            "snow_moat_depth_cm": round(snow_moat_depth_cm, 1),
            "slope_angle_deg": round(slope_angle_deg, 1),
            "pack_width_cm": round(pack_width_cm, 1),
            "effective_velocity_km_h": effective_velocity_km_h,
            "tree_well_spruce_trap_risk_pct": tree_well_spruce_trap_risk_pct,
            "metabolic_kcal_per_hour": metabolic_kcal_per_hour,
            "branch_snag_resistance_index": branch_snag_resistance_index,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "transit_strategy": transit_strategy,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


# ---------------------------------------------------------------------------
# Intent Detection & Parameter Extraction
# ---------------------------------------------------------------------------

_KRUMMHOLZ_BUSHWHACK_KEYWORDS: tuple[str, ...] = (
    "krummholz",
    "bushwhack",
    "bushwhacking",
    "dwarf conifer",
    "dwarf-conifer",
    "spruce trap",
    "spruce traps",
    "spruce-trap",
    "latschenkiefer",
    "latschenfelder",
    "pinus mugo",
    "hai-matsu",
    "haimatsu",
    "pinus pumila",
    "slide alder",
    "cripplebrush",
    "timberline thicket",
    "fir wave",
    "fir waves",
    "abies balsamea krummholz",
    "balsam-fir-spruce-mat",
    "mountain-pine-latschen-labyrinth",
    "subalpine-larch-alder-thicket",
    "wind-flagged-whitebark-cushion",
)

_KRUMMHOLZ_BUSHWHACK_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return policy",
    "return label",
    "shipping",
    "tracking number",
    "invoice",
    "cancel my order",
    # Bushcraft / shelter exclusions
    "bow drill",
    "feather stick",
    "ferro rod",
    "debris hut",
    "tarp shelter",
    # Arborist / old-growth tree climbing exclusions
    "cambium saver",
    "throwline",
    "arborist",
    "rope wrench",
    # Canopy bryophyte exclusions
    "epiphytic",
    "bryophyte",
    "canopy moss",
    # Tundra lichen exclusions
    "cladonia",
    "caribou moss",
    "reindeer lichen",
    "cetraria",
    # Paramo exclusions
    "frailejon",
    "frailejón",
    "espeletia",
    "chuscales",
    # Montane bamboo-thicket exclusions (bamboo_thicket.py)
    "bamboo",
    "chusquea",
    "sasa kurilensis",
    "chishima-zasa",
    "chishima zasa",
    "yabu-kogi",
    "yabukogi",
    "yushania",
    "guadua",
    "cerro kamuk",
    "poroshiri-dake",
    "poroshiri dake",
    "culm",
    "punji stump",
    "vilcabamba",
    "rwenzori",
    # Subantarctic tussock headland exclusions
    "subantarctic",
    "poa flabellata",
    "fortuna bay",
    "south georgia",
    "macquarie island",
    "featherbed",
    "enderby island",
    "auckland islands",
    "kerguelen",
    "azorella",
    "katabatic",
    "williwaw",
    "seal wallow",
    # Tropical laterite duricrust & bauxite ferricrete exclusions (laterite_duricrust.py)
    "laterite",
    "duricrust",
    "ferricrete",
    "bauxite",
    "bowal",
    "bowé",
    "cuirasse",
    "canga",
    "serra dos carajas",
    "serra dos carajás",
    "fouta djallon",
    "mitchell plateau",
    "ngauwudu",
    "kaas plateau",
    "panchgani",
    "pisolite",
    "pisolitic",
    "buckshot gravel",
    "saprolite",
    "aluminocrete",
)


def is_krummholz_bushwhack_query(query: str) -> bool:
    """Return True if the user query is asking about subalpine krummholz or dwarf-conifer thicket bushwhacking."""
    if not query or not query.strip():
        return False
    q_lower = query.lower()

    if any(excl in q_lower for excl in _KRUMMHOLZ_BUSHWHACK_EXCLUSIONS):
        return False

    return any(kw in q_lower for kw in _KRUMMHOLZ_BUSHWHACK_KEYWORDS)


def detect_krummholz_bushwhack_intent(query: str) -> bool:
    """Alias for is_krummholz_bushwhack_query()."""
    return is_krummholz_bushwhack_query(query)


def extract_krummholz_bushwhack_params(query: str) -> dict[str, Any]:
    """Extract krummholz bushwhack site ID and numerical calculator parameters from a natural-language query."""
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = None

    if (
        "presidential" in q_lower
        or "white mountains" in q_lower
        or "abies balsamea" in q_lower
        or "fir wave" in q_lower
    ):
        matched_site = get_site_by_id("presidential-krummholz-whitemtns-usa")
    elif (
        "karwendel" in q_lower
        or "latschenkiefer" in q_lower
        or "pinus mugo" in q_lower
        or "tyrol" in q_lower
        or "austria" in q_lower
    ):
        matched_site = get_site_by_id("karwendel-latschenkiefer-tyrol-austria")
    elif (
        "garibaldi" in q_lower
        or "slide alder" in q_lower
        or "sitka alder" in q_lower
        or "coast range" in q_lower
        or "canada" in q_lower
    ):
        matched_site = get_site_by_id("garibaldi-slide-alder-subalpine-canada")
    elif (
        "tateyama" in q_lower
        or "hai-matsu" in q_lower
        or "haimatsu" in q_lower
        or "pinus pumila" in q_lower
        or "japan" in q_lower
    ):
        matched_site = get_site_by_id("tateyama-hai-matsu-alps-japan")

    stems_m2 = (
        float(matched_site["default_stems_per_sq_meter"]) if matched_site else 12.0
    )
    canopy_m = (
        float(matched_site["default_canopy_mat_height_m"]) if matched_site else 1.4
    )
    moat_cm = (
        float(matched_site["default_snow_moat_depth_cm"]) if matched_site else 40.0
    )
    slope_deg = (
        float(matched_site["default_slope_angle_deg"]) if matched_site else 18.0
    )
    pack_cm = (
        float(matched_site["default_pack_width_cm"]) if matched_site else 45.0
    )

    has_explicit_numbers = False

    stems_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:stems/m2|stems/m²|stems\s*per\s*sq\s*m|stems)\b",
        q_lower,
    )
    if stems_match:
        val = float(stems_match.group(1))
        if 1.0 <= val <= 45.0:
            stems_m2 = val
            has_explicit_numbers = True

    canopy_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:canopy|mat|height|thicket|krummholz)",
        q_lower,
    )
    if canopy_match:
        val = float(canopy_match.group(1))
        if 0.3 <= val <= 3.5:
            canopy_m = val
            has_explicit_numbers = True

    moat_match = re.search(
        r"(\d+(?:\.\d+)?)\s*cm\s*(?:snow|moat|spruce\s*trap|void|depth)",
        q_lower,
    )
    if moat_match:
        val = float(moat_match.group(1))
        if 0.0 <= val <= 250.0:
            moat_cm = val
            has_explicit_numbers = True

    slope_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:deg|degree|degrees|°)\s*(?:slope|grade|angle)?",
        q_lower,
    )
    if slope_match:
        val = float(slope_match.group(1))
        if 0.0 <= val <= 50.0:
            slope_deg = val
            has_explicit_numbers = True

    pack_match = re.search(
        r"(\d+(?:\.\d+)?)\s*cm\s*(?:pack|backpack|width)",
        q_lower,
    )
    if pack_match:
        val = float(pack_match.group(1))
        if 25.0 <= val <= 85.0:
            pack_cm = val
            has_explicit_numbers = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "matched_site": matched_site,
        "stems_per_sq_meter": stems_m2,
        "canopy_mat_height_m": canopy_m,
        "snow_moat_depth_cm": moat_cm,
        "slope_angle_deg": slope_deg,
        "pack_width_cm": pack_cm,
        "has_explicit_numbers": has_explicit_numbers,
    }


def format_krummholz_bushwhack_response(query: str) -> dict[str, Any]:
    """Build a structured response dictionary for a krummholz bushwhack query."""
    params: dict[str, Any] = extract_krummholz_bushwhack_params(query)
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = params["matched_site"]

    calc_result: dict[str, Any] = calculate_krummholz_bushwhack(
        stems_per_sq_meter=float(params["stems_per_sq_meter"]),
        canopy_mat_height_m=float(params["canopy_mat_height_m"]),
        snow_moat_depth_cm=float(params["snow_moat_depth_cm"]),
        slope_angle_deg=float(params["slope_angle_deg"]),
        pack_width_cm=float(params["pack_width_cm"]),
    )

    is_calc_request = bool(
        params["has_explicit_numbers"]
        or any(
            w in q_lower
            for w in (
                "calculate",
                "calculator",
                "velocity",
                "resistance",
                "kcal",
                "metabolic",
                "snag index",
            )
        )
    )

    if is_calc_request:
        action = "krummholz_bushwhack_calculated"
    elif matched_site is not None:
        action = "krummholz_bushwhack_lookup"
    else:
        action = "krummholz_bushwhack_info"

    site_summary = (
        f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']} — "
        f"ecotype: `{matched_site['ecotype']}`, difficulty: `{matched_site['difficulty']}`): "
        f"{matched_site['navigation_protocol']} "
        if matched_site
        else "Subalpine krummholz and wind-sculpted dwarf-conifer thickets require careful evaluation "
        "of woody stem density, sub-canopy spruce-trap snow moats, and pack-snag resistance. "
    )

    answer = (
        f"{site_summary}"
        f"For **{calc_result['stems_per_sq_meter']} stems/m²** in a "
        f"**{calc_result['canopy_mat_height_m']} m canopy mat** with a "
        f"**{calc_result['snow_moat_depth_cm']} cm snow moat** "
        f"({calc_result['slope_angle_deg']}° slope, {calc_result['pack_width_cm']} cm pack width), "
        f"the modeled effective velocity is **{calc_result['effective_velocity_km_h']} km/h**, "
        f"tree-well / spruce-trap risk is **{calc_result['tree_well_spruce_trap_risk_pct']}%**, "
        f"metabolic burn is **{calc_result['metabolic_kcal_per_hour']:.0f} kcal/hr**, "
        f"branch-snag resistance index is **{calc_result['branch_snag_resistance_index']}**, and risk level is "
        f"**{calc_result['risk_level'].upper()}** (transit strategy: `{calc_result['transit_strategy']}`)."
    )

    return _AttrDict(
        {
            "action": action,
            "answer": answer,
            "matched_site": matched_site,
            "calculation": calc_result,
            "sites": KRUMMHOLZ_SITES,
            "checklist": KRUMMHOLZ_BUSHWHACK_GEAR_CHECKLIST,
        }
    )


def build_krummholz_bushwhack_prompt(query: str = "") -> str:
    """Build system prompt context for LLM calls involving subalpine krummholz & dwarf-conifer bushwhacking."""
    info: dict[str, Any] = (
        format_krummholz_bushwhack_response(query)
        if query
        else format_krummholz_bushwhack_response("krummholz bushwhack")
    )
    calc: dict[str, Any] = info["calculation"]
    matched_site: dict[str, Any] | None = info.get("matched_site")

    lines: list[str] = [
        "### Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking Context",
        "- **Krummholz Ecotypes**: Balsam fir / red spruce wave mats (e.g., Presidential Range), "
        "prostrate Pinus mugo Latschenkiefer labyrinths (e.g., Karwendel Alps), Sitka slide-alder / "
        "subalpine fir thickets (e.g., Garibaldi Coast Range), and wind-flagged Pinus pumila Hai-Matsu "
        "cushions (e.g., Tateyama Northern Japan Alps).",
        f"- **Calculated Thicket Bushwhacking Physics**: Stems={calc['stems_per_sq_meter']}/m², "
        f"CanopyMat={calc['canopy_mat_height_m']}m, SnowMoat={calc['snow_moat_depth_cm']}cm, "
        f"Slope={calc['slope_angle_deg']}°, PackWidth={calc['pack_width_cm']}cm -> "
        f"Velocity={calc['effective_velocity_km_h']}km/h, SpruceTrapRisk={calc['tree_well_spruce_trap_risk_pct']}%, "
        f"Metabolic={calc['metabolic_kcal_per_hour']}kcal/hr, SnagIndex={calc['branch_snag_resistance_index']}, "
        f"Risk={calc['risk_level']}, Strategy={calc['transit_strategy']}.",
    ]
    if matched_site:
        lines.append(
            f"- **Focused Krummholz Site**: {matched_site['name']} ({matched_site['country']}) — "
            f"Primary Hazard: {matched_site['primary_hazard']} | Navigation Protocol: {matched_site['navigation_protocol']}"
        )
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response dictionary for a krummholz bushwhack query."""
    info: dict[str, Any] = format_krummholz_bushwhack_response(query)
    return {
        "answer": info["answer"],
        "krummholz_bushwhack_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[str, None, None]:
    """Yield SSE stream chunks for a krummholz bushwhack query."""
    info: dict[str, Any] = format_krummholz_bushwhack_response(query)
    yield f"data: {json.dumps({'action': info['action'], 'krummholz_bushwhack_info': info})}\n\n"
    yield f"data: {json.dumps({'content': info['answer'], 'answer': info['answer']})}\n\n"
    yield "data: [DONE]\n\n"
