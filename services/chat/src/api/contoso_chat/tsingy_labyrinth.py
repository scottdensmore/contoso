"""Tropical Tsingy (Pinnacle Karst Labyrinth) & Razor-Limestone Arête Scrambling Guide module.

Provides domain data, physics-based rillenkarren razor-limestone blade shear & cord cut-through
modeling, solar-baked carbonate radiant sweat loss estimation, diaclase chasm arête exposure
factors, mandatory safety gear checklists, and intent detection for tropical tsingy and
pinnacle karst labyrinths.
"""

from __future__ import annotations

import json
import re
from collections.abc import Generator
from typing import Any, Literal

TsingyMorphology = Literal[
    "rillenkarren-razor-spires",
    "diaclase-slot-corridor-maze",
    "canopy-suspension-bridge-arête",
    "stone-forest-shilin-pinnacles",
]
TsingyDifficulty = Literal["moderate", "challenging", "extreme"]
TsingyRiskLevel = Literal["low", "moderate", "high", "critical"]
TsingyScramblingClass = Literal[
    "class-2-corridor-stone-forest-walk",
    "class-3-gloved-diaclase-stemming",
    "class-4-twin-lanyard-arete-via-ferrata",
    "class-5-abort-razor-spire-thermal-lockout",
]


class _AttrDict(dict[str, Any]):
    """Dictionary subclass supporting attribute-style read access."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc


# ---------------------------------------------------------------------------
# Reference Tropical Tsingy & Pinnacle Karst Labyrinth Sites (4 Sites)
# ---------------------------------------------------------------------------

TSINGY_LABYRINTH_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "bemaraha-grand-tsingy-madagascar",
            "name": "Tsingy de Bemaraha Grand Tsingy & Andamozavaky Razor Labyrinth",
            "country": "Madagascar",
            "region": "Melaky Region, Western Madagascar Limestone Karst Plateau",
            "elevation": "150 m Manambolo Gorge rim to 800 m limestone plateau",
            "elevation_m": 450,
            "morphology": "rillenkarren-razor-spires",
            "difficulty": "extreme",
            "default_blade_edge_radius_mm": 0.6,
            "default_spire_height_m": 65.0,
            "default_rock_surface_temp_c": 52.0,
            "default_diaclase_gap_width_m": 1.8,
            "default_ambient_humidity_pct": 58.0,
            "primary_hazard": (
                "Sub-millimeter Jurassic limestone rillenkarren blades capable of shearing dynamic nylon cord "
                "and bare skin upon contact, 60+ m vertical diaclase chasms, and intense solar-heated dark "
                "algal limestone radiating >50 °C."
            ),
            "scrambling_protocol": (
                "Clip both EN 958 progressive-tearing Y-lanyard arms with stainless-steel Type K carabiners "
                "onto fixed cable lifelines across razor arêtes; wear ANSI A6 Kevlar-palm leather scrambling "
                "gloves and high-rand stiff-shank approach boots at all times."
            ),
            "navigation_protocol": (
                "Descend into shaded subterranean diaclase joint corridors during peak midday solar heating, "
                "ascend via bolted ladder chimneys to canopy suspension bridges, and never jump across "
                "unbridged rillenkarren gaps."
            ),
            "traversal_protocol": (
                "Clip both EN 958 Y-lanyard arms across razor arêtes and use shaded diaclase corridors "
                "during midday solar heat."
            ),
            "field_notes": (
                "UNESCO World Heritage Jurassic karst labyrinth where rainwater dissolution along orthogonal "
                "joint networks has carved a 1,500 km² forest of acoustic limestone needles ('tsingy' — "
                "'where one cannot walk barefoot')."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "ankarana-tsingy-canyon-madagascar",
            "name": "Massif de l'Ankarana Tsingy Rary & Sunken Diaclase Forest",
            "country": "Madagascar",
            "region": "Diana Region, Northern Madagascar Mesozoic Karst Massif",
            "elevation": "80 m sunken canyon floor to 390 m basalt-capped tsingy rim",
            "elevation_m": 390,
            "morphology": "diaclase-slot-corridor-maze",
            "difficulty": "challenging",
            "default_blade_edge_radius_mm": 1.2,
            "default_spire_height_m": 38.0,
            "default_rock_surface_temp_c": 46.0,
            "default_diaclase_gap_width_m": 1.3,
            "default_ambient_humidity_pct": 68.0,
            "primary_hazard": (
                "Labyrinthine tectonic fault corridors and collapsing subterranean river roofs beneath "
                "fluted Tsingy Rary turret fields, combined with intense radiant heat reflection on "
                "exposed turret plateaus."
            ),
            "scrambling_protocol": (
                "Stem carefully between opposing diaclase walls using three-point contact on solution flutes; "
                "protect textile slings and pack straps with tubular UHMWPE/Dyneema abrasion sleeves."
            ),
            "navigation_protocol": (
                "Complete upper Tsingy Rary turret traverses before 10:30 local solar peak, then transition "
                "into the sunken deciduous forest canyons and cave-window passages for thermal refuge."
            ),
            "traversal_protocol": (
                "Complete upper Tsingy Rary turret traverses before midday solar peak and stem carefully "
                "between diaclase walls."
            ),
            "field_notes": (
                "Middle Jurassic limestone massif bisected by dramatic tectonic fault canyons, seasonal "
                "subterranean rivers (Styx and Besaboba), and suspended canopy walkways above razor-fluted pinnacles."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "mulu-api-pinnacles-borneo-malaysia",
            "name": "Gunung Api & Gunung Mulu Razor-Limestone Pinnacles",
            "country": "Malaysia",
            "region": "Gunung Mulu National Park, Sarawak, Borneo",
            "elevation": "1,200 m Melinau Gorge to 1,710 m Gunung Api Pinnacle Amphitheater",
            "elevation_m": 1200,
            "morphology": "canopy-suspension-bridge-arête",
            "difficulty": "extreme",
            "default_blade_edge_radius_mm": 0.8,
            "default_spire_height_m": 45.0,
            "default_rock_surface_temp_c": 43.0,
            "default_diaclase_gap_width_m": 2.1,
            "default_ambient_humidity_pct": 88.0,
            "primary_hazard": (
                "45-meter knife-edge Melinau limestone blades emerging out of steep montane dipterocarp "
                "moss forest, slick equatorial rain-soaked vertical ladders, and extreme humid heat strain "
                "(85–95% RH)."
            ),
            "scrambling_protocol": (
                "Maintain three points of contact on near-vertical aluminum ladder pitches and fixed "
                "synthetic handlines; never weight unpadded textile cord over knife-edge Melinau limestone crests."
            ),
            "navigation_protocol": (
                "Start the Camp 5 to Pinnacles ascent at dawn to reach the 1,200 m amphitheater before "
                "afternoon equatorial convective downpours turn the razor limestone chutes into slick torrents."
            ),
            "traversal_protocol": (
                "Ascend from Camp 5 at dawn to clear vertical ladder pitches and razor limestone chutes "
                "before afternoon convective rain."
            ),
            "field_notes": (
                "Towering 45 m silver-grey Melinau limestone blades rising out of equatorial montane "
                "rainforest above the Sarawak Chamber and Deer Cave karst system."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "shilin-naigu-stone-forest-china",
            "name": "Shilin & Naigu Permian Dolomitic Pinnacle Labyrinth",
            "country": "China",
            "region": "Shilin Yi Autonomous County, Yunnan Plateau (South China Karst)",
            "elevation": "1,720 m to 1,890 m Yunnan sub-tropical karst plateau",
            "elevation_m": 1820,
            "morphology": "stone-forest-shilin-pinnacles",
            "difficulty": "moderate",
            "default_blade_edge_radius_mm": 3.8,
            "default_spire_height_m": 28.0,
            "default_rock_surface_temp_c": 34.0,
            "default_diaclase_gap_width_m": 0.9,
            "default_ambient_humidity_pct": 62.0,
            "primary_hazard": (
                "Complex multi-tiered sword-shaped pinnacle fissures, blind sub-surface solution shafts, "
                "and disorienting acoustic echoes inside narrow Permian dolomitic limestone corridors."
            ),
            "scrambling_protocol": (
                "Use gloved friction palm-presses and high-traction Vibram Megagrip approach shoes through "
                "narrow solution clefts; avoid wedging knees or elbows into undercut subsoil dissolution notches."
            ),
            "navigation_protocol": (
                "Track numbered compass bearings and prominent pinnacle spires at corridor intersections; "
                "carry an independent barometric altimeter and offline karst fissure map when exploring "
                "outer Naigu sectors."
            ),
            "traversal_protocol": (
                "Track compass bearings at corridor intersections and use high-traction approach shoes "
                "through narrow solution clefts."
            ),
            "field_notes": (
                "Classic 270-million-year-old Permian carbonate 'Stone Forest' (Shilin) showcasing textbook "
                "subsoil kamenitza solution pans, sword-like rillenkarren flutes, and labyrinthine diaclase avenues."
            ),
        }
    ),
]

TSINGY_SITES: list[dict[str, Any]] = TSINGY_LABYRINTH_SITES


# ---------------------------------------------------------------------------
# Mandatory 6-Item Tropical Tsingy & Razor-Limestone Arête Gear Checklist
# ---------------------------------------------------------------------------

TSINGY_LABYRINTH_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "ANSI Cut-Level A6 Kevlar-Palm Full-Grain Leather Arête Scrambling Gloves",
        "category": "blade_laceration_armor",
        "priority": "essential",
        "rationale": (
            "Prevents deep tendon and palmar lacerations when hand-jamming or stemming against "
            "sub-millimeter rillenkarren solution flutes and razor-sharp limestone blades."
        ),
    },
    {
        "item": "EN 958 Progressive-Tearing Y-Lanyard with Stainless-Steel Type K Carabiners & Short Rest Tethers",
        "category": "arete_via_ferrata_retention",
        "priority": "essential",
        "rationale": (
            "Provides continuous two-point fall arrest along bolted cable lifelines and canopy "
            "suspension bridges while resisting severe carbonate abrasion on carabiner frames."
        ),
    },
    {
        "item": "Tubular UHMWPE / Dyneema & Kevlar Rope Edge-Protector Sleeves with Stainless Chain Maillons",
        "category": "cord_shear_protection",
        "priority": "essential",
        "rationale": (
            "Shields textile lanyards, haul cords, and anchor slings from catastrophic cut-through "
            "when loaded over sub-2 mm knife-edge limestone crests."
        ),
    },
    {
        "item": "Stiff-Shank Vibram Megagrip Approach Boots with 360° Climbing Rubber Rand & Ripstop Shin Guards",
        "category": "diaclase_footwork_shield",
        "priority": "essential",
        "rationale": (
            "Supports precision micro-edging on vertical solution flutes while protecting ankles "
            "and shins from razor-sharp subsoil dissolution notches in narrow diaclase slots."
        ),
    },
    {
        "item": "EN 12492 Hard-Shell ABS Karst Helmet with 600-Lumen Subterranean Diaclase Headlamp",
        "category": "chasm_and_head_protection",
        "priority": "essential",
        "rationale": (
            "Guards against overhanging limestone stalactite/blade strikes inside low cave-window "
            "passages and illuminates dark 60 m sunken diaclase corridors."
        ),
    },
    {
        "item": "3.5-Liter Insulated Hydration Bladder with Isotonic Electrolyte Salts & UPF 50+ Ceramic Sun Hoody",
        "category": "radiant_karst_thermoregulation",
        "priority": "essential",
        "rationale": (
            "Offsets 1.5–3.0 L/hr sweat losses generated by solar-baked dark algal limestone "
            "radiating >50 °C across windless pinnacle amphitheaters."
        ),
    },
]

TSINGY_GEAR_CHECKLIST: list[dict[str, Any]] = TSINGY_LABYRINTH_GEAR_CHECKLIST


# ---------------------------------------------------------------------------
# Catalog Accessors & Filtering
# ---------------------------------------------------------------------------


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 reference tropical tsingy pinnacle karst labyrinth sites."""
    return list(TSINGY_LABYRINTH_SITES)


def get_all_tsingy_labyrinth_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Return a single tropical tsingy pinnacle karst site by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in TSINGY_LABYRINTH_SITES:
        if str(site["id"]).lower() == target:
            return site
    return None


def get_tsingy_labyrinth_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """Filter tropical tsingy labyrinth sites by country, morphology, difficulty, or free-text search."""
    results: list[dict[str, Any]] = list(TSINGY_LABYRINTH_SITES)

    if country:
        c_lower = country.strip().lower()
        results = [s for s in results if c_lower in str(s["country"]).lower()]

    if morphology:
        m_lower = morphology.strip().lower().replace("_", "-").replace("ê", "e")
        results = [s for s in results if str(s["morphology"]).lower().replace("ê", "e") == m_lower]

    if difficulty:
        d_lower = difficulty.strip().lower()
        results = [s for s in results if str(s["difficulty"]).lower() == d_lower]

    if search:
        q_lower = search.strip().lower().replace("ê", "e").replace("é", "e").replace("è", "e")
        results = [
            s
            for s in results
            if q_lower in str(s["name"]).lower().replace("ê", "e").replace("é", "e")
            or q_lower in str(s["country"]).lower()
            or q_lower in str(s["region"]).lower().replace("ê", "e")
            or q_lower in str(s["morphology"]).lower().replace("ê", "e")
            or q_lower in str(s["field_notes"]).lower().replace("ê", "e")
            or q_lower in str(s["id"]).lower()
        ]

    return results


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6-item mandatory tropical tsingy & razor-limestone arête gear checklist."""
    return list(TSINGY_LABYRINTH_GEAR_CHECKLIST)


# ---------------------------------------------------------------------------
# Physics-Based Tropical Tsingy & Razor-Limestone Arête Calculator
# ---------------------------------------------------------------------------


def calculate_tsingy_labyrinth(
    blade_edge_radius_mm: float = 1.8,
    spire_height_m: float = 42.0,
    rock_surface_temp_c: float = 44.0,
    diaclase_gap_width_m: float = 1.4,
    ambient_humidity_pct: float = 65.0,
) -> dict[str, Any]:
    """Calculate laceration shear index, cord cut-through risk %, radiant sweat loss, and arête exposure factor.

    Parameters
    ----------
    blade_edge_radius_mm:
        Mean tip/edge radius of rillenkarren limestone blades in millimeters [0.2, 15.0].
    spire_height_m:
        Vertical relief of limestone pinnacles / diaclase chasms in meters [5, 120].
    rock_surface_temp_c:
        Solar-heated limestone surface temperature in degrees Celsius [18, 68].
    diaclase_gap_width_m:
        Mean horizontal span across diaclase joint corridors/gaps in meters [0.3, 8.0].
    ambient_humidity_pct:
        Ambient relative humidity in percent [20, 100].
    """
    if not (0.2 <= blade_edge_radius_mm <= 15.0):
        raise ValueError("blade_edge_radius_mm must be between 0.2 and 15.0 mm")
    if not (5.0 <= spire_height_m <= 120.0):
        raise ValueError("spire_height_m must be between 5 and 120 meters")
    if not (18.0 <= rock_surface_temp_c <= 68.0):
        raise ValueError("rock_surface_temp_c must be between 18 and 68 degrees Celsius")
    if not (0.3 <= diaclase_gap_width_m <= 8.0):
        raise ValueError("diaclase_gap_width_m must be between 0.3 and 8.0 meters")
    if not (20.0 <= ambient_humidity_pct <= 100.0):
        raise ValueError("ambient_humidity_pct must be between 20 and 100 percent")

    # 1. Rillenkarren blade laceration & contact shear index (0.5 to 10.0)
    raw_shear = (
        (4.2 / max(0.2, blade_edge_radius_mm))
        + (spire_height_m * 0.025)
        + (diaclase_gap_width_m * 0.35)
    )
    laceration_shear_index = round(min(10.0, max(0.5, raw_shear)), 2)

    # 2. Textile cord / sling edge cut-through probability under pendulum load (1.0 to 99.0%)
    raw_cut_risk = (
        (48.0 / (blade_edge_radius_mm + 0.35))
        + (spire_height_m * 0.22)
        + (diaclase_gap_width_m * 2.8)
    )
    cord_cut_through_risk_pct = round(min(99.0, max(1.0, raw_cut_risk)), 1)

    # 3. Radiant carbonate furnace & tropical humidity sweat loss rate (0.25 to 3.8 L/hr)
    raw_sweat = (
        0.25
        + (max(0.0, rock_surface_temp_c - 20.0) * 0.042)
        + (ambient_humidity_pct * 0.0065)
        + (spire_height_m * 0.003)
    )
    radiant_sweat_loss_litres_hr = round(min(3.8, max(0.25, raw_sweat)), 2)

    # 4. Arête & diaclase chasm exposure factor (1.0 to 10.0)
    raw_exposure = (
        1.0
        + (spire_height_m / 18.0)
        + (diaclase_gap_width_m * 0.55)
        + (1.2 / max(0.3, blade_edge_radius_mm))
    )
    arete_exposure_factor = round(min(10.0, max(1.0, raw_exposure)), 2)

    # 5. Classify Risk Level & Scrambling Class
    warnings: list[str] = []
    recommendations: list[str] = []

    if (
        blade_edge_radius_mm <= 0.45
        or cord_cut_through_risk_pct >= 78.0
        or rock_surface_temp_c >= 58.0
        or radiant_sweat_loss_litres_hr >= 2.55
        or diaclase_gap_width_m >= 5.0
        or spire_height_m >= 95.0
    ):
        risk_level: TsingyRiskLevel = "critical"
        scrambling_class: TsingyScramblingClass = "class-5-abort-razor-spire-thermal-lockout"
    elif (
        blade_edge_radius_mm <= 1.0
        or cord_cut_through_risk_pct >= 50.0
        or rock_surface_temp_c >= 48.0
        or radiant_sweat_loss_litres_hr >= 1.95
        or diaclase_gap_width_m >= 2.2
        or spire_height_m >= 55.0
    ):
        risk_level = "high"
        scrambling_class = "class-4-twin-lanyard-arete-via-ferrata"
    elif (
        blade_edge_radius_mm <= 2.8
        or cord_cut_through_risk_pct >= 26.0
        or rock_surface_temp_c >= 36.0
        or radiant_sweat_loss_litres_hr >= 1.25
        or diaclase_gap_width_m >= 1.1
        or spire_height_m >= 28.0
    ):
        risk_level = "moderate"
        scrambling_class = "class-3-gloved-diaclase-stemming"
    else:
        risk_level = "low"
        scrambling_class = "class-2-corridor-stone-forest-walk"

    # Populate actionable warnings
    if blade_edge_radius_mm <= 1.0 or laceration_shear_index >= 5.5:
        warnings.append(
            f"RAZOR RILLENKARREN LACERATION & SHEAR HAZARD ({blade_edge_radius_mm:.2f} mm blade radius, "
            f"shear index {laceration_shear_index:.2f}): Sub-millimeter limestone flutes act as serrated "
            "knives capable of severing bare skin and unshielded nylon webbing on contact."
        )
    if cord_cut_through_risk_pct >= 50.0:
        warnings.append(
            f"TEXTILE CORD CUT-THROUGH RISK ({cord_cut_through_risk_pct:.1f}%): Dynamic rope or standard "
            "tubular nylon slings loaded across knife-edge tsingy crests face acute edge-shearing failure."
        )
    if rock_surface_temp_c >= 48.0 or radiant_sweat_loss_litres_hr >= 1.95:
        warnings.append(
            f"CARBONATE RADIANT FURNACE HEAT STRAIN ({rock_surface_temp_c:.1f} °C rock surface, "
            f"{radiant_sweat_loss_litres_hr:.2f} L/hr sweat loss): Dark algal-coated limestone spires trap "
            "solar radiation and reflect intense infrared heat across windless arêtes."
        )
    if diaclase_gap_width_m >= 2.0 or spire_height_m >= 55.0:
        warnings.append(
            f"HIGH DIACLASE CHASM EXPOSURE ({spire_height_m:.0f} m spire height, {diaclase_gap_width_m:.1f} m "
            f"gap width, exposure {arete_exposure_factor:.2f}): Unbridged leaps across deep joint crevices "
            "carry fatal impalement and fall consequences."
        )

    # Populate technical recommendations
    if scrambling_class == "class-5-abort-razor-spire-thermal-lockout":
        recommendations.append(
            "ABORT UPPER ARÊTE SCRAMBLE IMMEDIATELY: Descend into shaded subterranean diaclase joint "
            "corridors or cave-window passages until rock surface temperatures drop below 45 °C."
        )
        recommendations.append(
            "Do not weight textile ropes or slings over sub-0.5 mm razor spires without stainless-steel "
            "chain maillons and multi-layer UHMWPE/Kevlar edge sleeves."
        )
    elif scrambling_class == "class-4-twin-lanyard-arete-via-ferrata":
        recommendations.append(
            "Maintain continuous twin-arm EN 958 progressive-tearing Y-lanyard attachment to fixed steel "
            "cable lifelines across all razor arêtes and canopy suspension bridges."
        )
        recommendations.append(
            "Wear ANSI Cut-Level A6 Kevlar-palm leather scrambling gloves and wrap all anchor/rest slings "
            "with tubular Dyneema/Kevlar abrasion guards."
        )
    elif scrambling_class == "class-3-gloved-diaclase-stemming":
        recommendations.append(
            "Stem deliberately between opposing diaclase walls using three-point contact and stiff-shank "
            "Vibram Megagrip approach boots; wear cut-resistant leather gloves for all hand placements."
        )
        recommendations.append(
            f"Plan hydration for {radiant_sweat_loss_litres_hr:.2f} L/hr sweat loss with isotonic electrolytes "
            "and schedule exposed spire crossings before 10:30 local solar peak."
        )
    else:
        recommendations.append(
            "Standard stone-forest pinnacle corridor walk: follow established floor avenues, track compass "
            "bearings at fissure intersections, and wear protective gloves when touching fluted walls."
        )

    recommendations.append(
        "Never jump blindly across unbridged diaclase slots; verify bolted ladder rungs and suspension "
        "bridge anchor pins before committing full body weight."
    )

    return _AttrDict(
        {
            "blade_edge_radius_mm": round(blade_edge_radius_mm, 2),
            "spire_height_m": round(spire_height_m, 1),
            "rock_surface_temp_c": round(rock_surface_temp_c, 1),
            "diaclase_gap_width_m": round(diaclase_gap_width_m, 2),
            "ambient_humidity_pct": round(ambient_humidity_pct, 1),
            "laceration_shear_index": laceration_shear_index,
            "cord_cut_through_risk_pct": cord_cut_through_risk_pct,
            "radiant_sweat_loss_litres_hr": radiant_sweat_loss_litres_hr,
            "arete_exposure_factor": arete_exposure_factor,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "scrambling_class": scrambling_class,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


# ---------------------------------------------------------------------------
# Intent Detection & Parameter Extraction
# ---------------------------------------------------------------------------

_TSINGY_LABYRINTH_KEYWORDS: tuple[str, ...] = (
    "tsingy",
    "bemaraha",
    "andamozavaky",
    "manambolo",
    "ankarana",
    "tsingy rary",
    "pinnacle karst",
    "pinnacle-karst",
    "karst labyrinth",
    "pinnacle labyrinth",
    "rillenkarren",
    "razor limestone",
    "razor-limestone",
    "razor spire",
    "razor spires",
    "razor arete",
    "razor arête",
    "gunung api",
    "mulu pinnacles",
    "melinau",
    "shilin",
    "naigu",
    "stone forest",
    "diaclase",
    "laceration shear",
    "cord cut-through",
    "cut-through risk",
    "rillenkarren-razor-spires",
    "diaclase-slot-corridor-maze",
    "canopy-suspension-bridge-arête",
    "canopy-suspension-bridge-arete",
    "stone-forest-shilin-pinnacles",
)

_TSINGY_LABYRINTH_EXCLUSIONS: tuple[str, ...] = (
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
    "xiaozhai",
    "dashiwei",
    "golondrinas",
    "sarisarinama",
    "sarisariñama",
    "sima humboldt",
    "cenote",
    "cenotes",
    "halocline",
    "anchialine",
    "schlieren",
    "ox bel ha",
    "ox-bel-ha",
    "angelita",
    "sac actun",
    "sac-actun",
    "pet cembalo",
    "dan's cave",
    "dans cave",
    "sawmill sink",
    "abaco",
    "meromictic",
    "tannic",
    "chemocline",
    "pycnocline",
    "blue hole",
    # Alpine via ferrata & night via ferrata exclusions (via_ferrata.py, night_via_ferrata.py)
    "telluride via ferrata",
    "ouray via ferrata",
    "whistler peak via ferrata",
    "mammoth iron crest",
    "mount olympus iron way",
    "night via ferrata",
    "moonlight via ferrata",
    "kellner",
    "krogerata",
    "aiguilles rouges",
    # Classical rock climbing exclusions (climbing.py)
    "index lower town wall",
    "castle rock",
    "vantage feathers",
    "frenchman coulee",
    "liberty bell",
    "smith rock",
    "camalot",
    "trad climbing",
    # Classical US pit caving & cave mineralogy exclusions (caving.py, cave_mineralogy.py)
    "fantastic pit",
    "ellison's cave",
    "ellisons cave",
    "mammoth cave",
    "tumbling rock",
    "slaughter canyon",
    "carlsbad caverns",
    "lechuguilla",
    "cave pearl",
    "pisolith",
    "calcite saturation",
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
    # Highline exclusions (highline.py)
    "highline",
    "slackline",
    "taft point",
    "fruit bowl",
    "weblock",
    "buckingham pulley",
    # Table-mountain quartzite tepui plateau navigation exclusions (tepui_navigation.py)
    "tepui",
    "mount roraima",
    "roraima",
    "auyan-tepui",
    "auyán-tepui",
    "kukenan",
    "kukenán",
    "chiribiquete",
    "gran sabana",
    "guiana shield",
    "pseudokarst",
    "brocchinia",
    "cyanobacteria biofilm",
)


def is_tsingy_labyrinth_query(query: str) -> bool:
    """Return True if the user query is asking about tropical tsingy pinnacle karst labyrinths or razor-limestone arête scrambling."""
    if not query or not query.strip():
        return False
    q_lower = query.lower()

    if any(excl in q_lower for excl in _TSINGY_LABYRINTH_EXCLUSIONS):
        return False

    if any(kw in q_lower for kw in _TSINGY_LABYRINTH_KEYWORDS):
        return True

    # Broad karst/limestone match when paired with pinnacle/blade/spire/labyrinth/laceration context
    if ("karst" in q_lower or "limestone" in q_lower) and any(
        ctx in q_lower
        for ctx in (
            "pinnacle",
            "pinnacles",
            "razor",
            "blade",
            "blades",
            "spire",
            "spires",
            "laceration",
            "cut-through",
            "madagascar",
            "borneo",
            "yunnan",
        )
    ):
        return True

    return False


def detect_tsingy_labyrinth_intent(query: str) -> bool:
    """Alias for is_tsingy_labyrinth_query()."""
    return is_tsingy_labyrinth_query(query)


def extract_tsingy_labyrinth_params(query: str) -> dict[str, Any]:
    """Extract tsingy labyrinth site ID and numerical calculator parameters from a natural-language query."""
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = None

    if (
        "bemaraha" in q_lower
        or "grand tsingy" in q_lower
        or "andamozavaky" in q_lower
        or "manambolo" in q_lower
    ):
        matched_site = get_site_by_id("bemaraha-grand-tsingy-madagascar")
    elif (
        "ankarana" in q_lower
        or "tsingy rary" in q_lower
        or "besaboba" in q_lower
        or "diana region" in q_lower
    ):
        matched_site = get_site_by_id("ankarana-tsingy-canyon-madagascar")
    elif (
        "gunung api" in q_lower
        or "mulu" in q_lower
        or "melinau" in q_lower
        or "borneo" in q_lower
        or "sarawak" in q_lower
        or "malaysia" in q_lower
    ):
        matched_site = get_site_by_id("mulu-api-pinnacles-borneo-malaysia")
    elif (
        "shilin" in q_lower
        or "naigu" in q_lower
        or "stone forest" in q_lower
        or "yunnan" in q_lower
        or "permian" in q_lower
    ):
        matched_site = get_site_by_id("shilin-naigu-stone-forest-china")
    elif "madagascar" in q_lower:
        matched_site = get_site_by_id("bemaraha-grand-tsingy-madagascar")

    blade_mm = float(matched_site["default_blade_edge_radius_mm"]) if matched_site else 1.8
    spire_m = float(matched_site["default_spire_height_m"]) if matched_site else 42.0
    temp_c = float(matched_site["default_rock_surface_temp_c"]) if matched_site else 44.0
    gap_m = float(matched_site["default_diaclase_gap_width_m"]) if matched_site else 1.4
    humidity_pct = float(matched_site["default_ambient_humidity_pct"]) if matched_site else 65.0

    has_explicit_numbers = False

    blade_match = re.search(
        r"(\d+(?:\.\d+)?)\s*mm\s*(?:blade|edge|radius|rillenkarren|tip)?",
        q_lower,
    )
    if blade_match:
        val = float(blade_match.group(1))
        if 0.2 <= val <= 15.0:
            blade_mm = val
            has_explicit_numbers = True

    spire_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:spire|spires|pinnacle|pinnacles|height|tall|relief)",
        q_lower,
    )
    if spire_match:
        val = float(spire_match.group(1))
        if 5.0 <= val <= 120.0:
            spire_m = val
            has_explicit_numbers = True

    gap_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:diaclase|gap|chasm|corridor|slot|width|span)",
        q_lower,
    )
    if gap_match:
        val = float(gap_match.group(1))
        if 0.3 <= val <= 8.0:
            gap_m = val
            has_explicit_numbers = True

    temp_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:°c|deg\s*c|degrees?\s*c|c)\s*(?:rock|surface|temp|temperature|limestone)?\b",
        q_lower,
    )
    if temp_match:
        val = float(temp_match.group(1))
        if 18.0 <= val <= 68.0:
            temp_c = val
            has_explicit_numbers = True

    hum_match = re.search(
        r"(\d+(?:\.\d+)?)\s*%\s*(?:ambient|humidity|rh)?",
        q_lower,
    )
    if hum_match:
        val = float(hum_match.group(1))
        if 20.0 <= val <= 100.0:
            humidity_pct = val
            has_explicit_numbers = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "matched_site": matched_site,
        "blade_edge_radius_mm": blade_mm,
        "spire_height_m": spire_m,
        "rock_surface_temp_c": temp_c,
        "diaclase_gap_width_m": gap_m,
        "ambient_humidity_pct": humidity_pct,
        "has_explicit_numbers": has_explicit_numbers,
    }


def format_tsingy_labyrinth_response(query: str) -> dict[str, Any]:
    """Build a structured response dictionary for a tropical tsingy pinnacle karst labyrinth query."""
    params: dict[str, Any] = extract_tsingy_labyrinth_params(query)
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = params["matched_site"]

    calc_result: dict[str, Any] = calculate_tsingy_labyrinth(
        blade_edge_radius_mm=float(params["blade_edge_radius_mm"]),
        spire_height_m=float(params["spire_height_m"]),
        rock_surface_temp_c=float(params["rock_surface_temp_c"]),
        diaclase_gap_width_m=float(params["diaclase_gap_width_m"]),
        ambient_humidity_pct=float(params["ambient_humidity_pct"]),
    )

    is_calc_request = bool(
        params["has_explicit_numbers"]
        or any(
            w in q_lower
            for w in (
                "calculate",
                "calculator",
                "laceration",
                "shear index",
                "cut-through",
                "sweat loss",
                "exposure factor",
            )
        )
    )

    if is_calc_request:
        action = "tsingy_labyrinth_calculated"
    elif matched_site is not None:
        action = "tsingy_labyrinth_lookup"
    else:
        action = "tsingy_labyrinth_info"

    site_summary = (
        f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']} — "
        f"morphology: `{matched_site['morphology']}`, difficulty: `{matched_site['difficulty']}`): "
        f"{matched_site['scrambling_protocol']} "
        if matched_site
        else "Tropical tsingy (pinnacle karst labyrinth) and razor-limestone arête scrambling require "
        "strict evaluation of rillenkarren blade edge radius, spire height, solar-heated carbonate "
        "surface temperatures, and diaclase chasm gap widths. "
    )

    answer = (
        f"{site_summary}"
        f"For **{calc_result['blade_edge_radius_mm']} mm rillenkarren blade edge radius** and "
        f"**{calc_result['spire_height_m']} m spire height** "
        f"({calc_result['rock_surface_temp_c']} °C rock surface temp, "
        f"{calc_result['diaclase_gap_width_m']} m diaclase gap width, "
        f"{calc_result['ambient_humidity_pct']}% humidity), "
        f"the laceration shear index is **{calc_result['laceration_shear_index']}**, "
        f"cord cut-through risk is **{calc_result['cord_cut_through_risk_pct']}%**, "
        f"radiant sweat loss is **{calc_result['radiant_sweat_loss_litres_hr']} L/hr**, "
        f"arête exposure factor is **{calc_result['arete_exposure_factor']}**, and risk level is "
        f"**{calc_result['risk_level'].upper()}** (scrambling class: `{calc_result['scrambling_class']}`)."
    )

    return _AttrDict(
        {
            "action": action,
            "answer": answer,
            "matched_site": matched_site,
            "calculation": calc_result,
            "sites": TSINGY_LABYRINTH_SITES,
            "checklist": TSINGY_LABYRINTH_GEAR_CHECKLIST,
        }
    )


def build_tsingy_labyrinth_prompt(query: str = "") -> str:
    """Build system prompt context for LLM calls involving tropical tsingy & razor-limestone arête scrambling."""
    info: dict[str, Any] = (
        format_tsingy_labyrinth_response(query)
        if query
        else format_tsingy_labyrinth_response("tropical tsingy pinnacle karst labyrinth")
    )
    calc: dict[str, Any] = info["calculation"]
    matched_site: dict[str, Any] | None = info.get("matched_site")

    lines: list[str] = [
        "### Tropical Tsingy (Pinnacle Karst Labyrinth) & Razor-Limestone Arête Scrambling Context",
        "- **Pinnacle Karst Morphologies**: Rillenkarren razor spires (e.g., Tsingy de Bemaraha Grand Tsingy, Madagascar), "
        "diaclase slot-corridor mazes (e.g., Massif de l'Ankarana Tsingy Rary, Madagascar), canopy suspension-bridge arêtes "
        "(e.g., Gunung Api & Mulu Pinnacles, Borneo, Malaysia), and Permian stone-forest pinnacles "
        "(e.g., Shilin & Naigu Stone Forest, Yunnan, China).",
        f"- **Calculated Tsingy Labyrinth Physics**: BladeEdgeRadius={calc['blade_edge_radius_mm']}mm, "
        f"SpireHeight={calc['spire_height_m']}m, RockSurfaceTemp={calc['rock_surface_temp_c']}°C, "
        f"DiaclaseGapWidth={calc['diaclase_gap_width_m']}m, AmbientHumidity={calc['ambient_humidity_pct']}% -> "
        f"LacerationShearIndex={calc['laceration_shear_index']}, CordCutThroughRisk={calc['cord_cut_through_risk_pct']}%, "
        f"RadiantSweatLoss={calc['radiant_sweat_loss_litres_hr']}L/hr, AreteExposureFactor={calc['arete_exposure_factor']}, "
        f"Risk={calc['risk_level']}, ScramblingClass={calc['scrambling_class']}.",
    ]
    if matched_site:
        lines.append(
            f"- **Focused Tsingy Site**: {matched_site['name']} ({matched_site['country']}) — "
            f"Primary Hazard: {matched_site['primary_hazard']} | Scrambling Protocol: {matched_site['scrambling_protocol']}"
        )
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response dictionary for a tropical tsingy labyrinth query."""
    info: dict[str, Any] = format_tsingy_labyrinth_response(query)
    return {
        "answer": info["answer"],
        "tsingy_labyrinth_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[str, None, None]:
    """Yield SSE stream chunks for a tropical tsingy labyrinth query."""
    info: dict[str, Any] = format_tsingy_labyrinth_response(query)
    yield f"data: {json.dumps({'action': info['action'], 'tsingy_labyrinth_info': info})}\n\n"
    yield f"data: {json.dumps({'content': info['answer'], 'answer': info['answer']})}\n\n"
    yield "data: [DONE]\n\n"
