"""Karst Tiankeng (Giant Collapse Sinkhole) & Vertical Cloud-Forest Rim Descent Guide module.

Provides domain data, physics-based multi-rebelay Single Rope Technique (SRT) modeling,
descender thermal friction dissipation, limestone/quartzite spall trajectory risk estimation,
free-hang rope bounce amplitude calculation, mandatory safety gear checklists,
and intent detection for giant collapse sinkholes (tiankengs) and vertical cloud-forest rims.
"""

from __future__ import annotations

import json
import re
from collections.abc import Generator
from typing import Any, Literal

TiankengMorphology = Literal[
    "collapse-mega-doline",
    "twin-window-karst-chasm",
    "overhung-bell-shaft-sinkhole",
    "erosional-waterfall-tiankeng",
]
TiankengDifficulty = Literal["moderate", "challenging", "extreme"]
TiankengRiskLevel = Literal["low", "moderate", "high", "critical"]
TiankengRiggingStrategy = Literal[
    "continuous-free-hang-6-bar-rack",
    "segmented-rebelay-lip-deviation",
    "offset-pendulum-spray-avoidance-rig",
    "abort-monsoon-waterfall-plume-lockout",
]


class _AttrDict(dict[str, Any]):
    """Dictionary subclass supporting attribute-style read access."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc


# ---------------------------------------------------------------------------
# Reference Karst Tiankeng & Vertical Cloud-Forest Rim Sites Catalog (4 Sites)
# ---------------------------------------------------------------------------

TIANKENG_DESCENT_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "xiaozhai-tiankeng-chongqing-china",
            "name": "Xiaozhai Tiankeng Double-Nested Collapse Mega-Doline",
            "country": "China",
            "region": "Fengjie County, Chongqing Municipality (Three Gorges Karst)",
            "elevation": "662 m vertical depth (1,331 m rim)",
            "elevation_m": 1331,
            "morphology": "collapse-mega-doline",
            "difficulty": "extreme",
            "default_vertical_drop_m": 511.0,
            "default_rebelay_count": 6,
            "default_fog_humidity_pct": 88.0,
            "default_overhang_angle_deg": 4.0,
            "default_waterfall_spray_litres_min": 85.0,
            "rigging_protocol": (
                "Stage multi-pitch Y-hang rebelays across the 320 m upper bowl terrace and "
                "342 m lower vertical shaft above the subterranean Difeng karst river resurgence."
            ),
            "primary_hazard": (
                "Exfoliating Triassic limestone spall from the mid-bowl ledge, monsoon subterranean "
                "river flood surges, and rope glaze on 300+ m unsegmented vertical drops."
            ),
            "navigation_protocol": (
                "Rig offset deviation anchors clear of the main seasonal waterfall chute; transition "
                "from 6-bar stainless steel rack on long drops to closed-frame bobbin at rebelay ledges."
            ),
            "traversal_protocol": (
                "Rig offset deviation anchors clear of the main seasonal waterfall chute; transition "
                "from 6-bar stainless steel rack on long drops to closed-frame bobbin at rebelay ledges."
            ),
            "field_notes": (
                "The world's deepest and most voluminous karst tiankeng (119.3 million m³), featuring "
                "a double-stepped vertical wall collapsing into a roaring underground river cavern."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "dashiwei-tiankeng-leye-china",
            "name": "Dashiwei Tiankeng Subterranean Cloud-Forest Rim",
            "country": "China",
            "region": "Leye-Fengshan UNESCO Global Geopark, Guangxi",
            "elevation": "613 m vertical depth (1,468 m rim)",
            "elevation_m": 1468,
            "morphology": "twin-window-karst-chasm",
            "difficulty": "extreme",
            "default_vertical_drop_m": 450.0,
            "default_rebelay_count": 5,
            "default_fog_humidity_pct": 94.0,
            "default_overhang_angle_deg": -6.0,
            "default_waterfall_spray_litres_min": 55.0,
            "rigging_protocol": (
                "Establish dual-bolt stainless expansion stations below the rotting epiphytic cloud-forest "
                "rim overhang; deploy canvas edge rollers across razor-sharp Permian limestone flutes."
            ),
            "primary_hazard": (
                "Dense 95% subterranean advection fog obscuring rebelay stations, slick bryophyte-coated "
                "collapse talus at the base, and sharp karst rillenkarren rope-sheath abrasion."
            ),
            "navigation_protocol": (
                "Descend the sheer southern saddle wall using segmented 70–90 m SRT pitches to isolate "
                "rope bounce above the 96,000 m² primeval subterranean forest floor."
            ),
            "traversal_protocol": (
                "Descend the sheer southern saddle wall using segmented 70–90 m SRT pitches to isolate "
                "rope bounce above the 96,000 m² primeval subterranean forest floor."
            ),
            "field_notes": (
                "Part of the 28-tiankeng Leye cluster, Dashiwei traps a perennial cloud-forest microclimate "
                "harboring endemic blind cave fish and ancient Fokienia hodginsii conifers at its floor."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "sotano-de-las-golondrinas-mexico",
            "name": "Sótano de las Golondrinas Overhung Free-Fall Bell Shaft",
            "country": "Mexico",
            "region": "Aquismón, Sierra Madre Oriental, San Luis Potosí",
            "elevation": "376 m single free-fall drop (512 m total depth)",
            "elevation_m": 825,
            "morphology": "overhung-bell-shaft-sinkhole",
            "difficulty": "challenging",
            "default_vertical_drop_m": 376.0,
            "default_rebelay_count": 2,
            "default_fog_humidity_pct": 82.0,
            "default_overhang_angle_deg": -18.0,
            "default_waterfall_spray_litres_min": 20.0,
            "rigging_protocol": (
                "Rig a cantilevered high-lip Y-hang on the low-side 333 m or high-side 376 m overhang "
                "with a 6-bar long-frame stainless rappel rack and 400 m pre-soaked 11 mm low-stretch rope."
            ),
            "primary_hazard": (
                "Extreme descender thermal buildup (>160 °C) capable of melting nylon rope cores on pause, "
                "severe rotational spin on 370 m free-hangs, and high-velocity swift/parrot guano dust."
            ),
            "navigation_protocol": (
                "Pre-wet the 11 mm static line and carry a 2 L water squirt bottle clipped to the harness "
                "to cool the stainless rack bars during the 376 m continuous free-hanging descent."
            ),
            "traversal_protocol": (
                "Pre-wet the 11 mm static line and carry a 2 L water squirt bottle clipped to the harness "
                "to cool the stainless rack bars during the 376 m continuous free-hanging descent."
            ),
            "field_notes": (
                "Conical bell-shaped Cretaceous karst shaft whose 60 m surface mouth flares outward to a "
                "300 × 135 m subterranean floor, eliminating mid-wall rock contact after the rim lip."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "sima-humboldt-sarisarinama-venezuela",
            "name": "Sima Mayor de Sarisariñama Quartzite Tepui Sinkhole",
            "country": "Venezuela",
            "region": "Jaua-Sarisariñama National Park, Bolívar State (Guiana Shield)",
            "elevation": "314 m vertical depth (2,350 m tepui plateau)",
            "elevation_m": 2350,
            "morphology": "erosional-waterfall-tiankeng",
            "difficulty": "extreme",
            "default_vertical_drop_m": 314.0,
            "default_rebelay_count": 5,
            "default_fog_humidity_pct": 96.0,
            "default_overhang_angle_deg": -10.0,
            "default_waterfall_spray_litres_min": 140.0,
            "rigging_protocol": (
                "Anchor into solid Precambrian Roraima orthoquartzite bedrock back from the overhanging "
                "bromeliad peat rim; rig offset pendulum deviations to bypass torrential tepui waterfall plumes."
            ),
            "primary_hazard": (
                "Flash-flooding blackwater tepui waterfalls, saturated waterlogged peat-mat collapses at the lip, "
                "and hypothermic wind-driven mist inside the isolated subterranean island forest."
            ),
            "navigation_protocol": (
                "Monitor plateau rain squalls continuously before committing to the shaft; use sealed wet-caving "
                "oversuits and keep whistle/strobe telemetry active across roaring waterfall rebelays."
            ),
            "traversal_protocol": (
                "Monitor plateau rain squalls continuously before committing to the shaft; use sealed wet-caving "
                "oversuits and keep whistle/strobe telemetry active across roaring waterfall rebelays."
            ),
            "field_notes": (
                "Formed by deep hydrothermal and piping dissolution in 1.7-billion-year-old Roraima group "
                "quartzite sandstone, enclosing an untouched prehistoric cloud-forest ecosystem at its base."
            ),
        }
    ),
]

TIANKENG_SITES: list[dict[str, Any]] = TIANKENG_DESCENT_SITES


# ---------------------------------------------------------------------------
# Mandatory 6-Item Karst Tiankeng & Cloud-Forest Rim Descent Gear Checklist
# ---------------------------------------------------------------------------

TIANKENG_DESCENT_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "6-Bar Long-Frame Stainless Steel Rappel Rack with Hyperbar & Thermal Heat-Sink Bars",
        "category": "thermal_descent_control",
        "priority": "essential",
        "rationale": (
            "Distributes frictional heat across six thick stainless steel bars and allows live "
            "bar-spacing adjustment as rope weight decreases during 300–500 m vertical drops."
        ),
    },
    {
        "item": "EN 1891 Type A 10.5–11 mm Low-Stretch Aramid/Polyamide Static Kernmantle Rope",
        "category": "primary_rigging_line",
        "priority": "essential",
        "rationale": (
            "Limits static elongation below 2.5% to suppress dangerous cyclic yo-yo bounce during "
            "frog-system ascents and resists thermal glazing and limestone flute abrasion."
        ),
    },
    {
        "item": "Multi-Point Y-Hang Rebelay Kit (316L Stainless Hangers, Maillon Rapides & Dyneema Slings)",
        "category": "rebelay_lip_isolation",
        "priority": "essential",
        "rationale": (
            "Segments massive tiankeng shafts into 60–90 m pitches so ropes hang completely clear "
            "of razor-sharp karst lips, rockfall funnels, and active waterfall plumes."
        ),
    },
    {
        "item": "Complete Frog-System SRT Ascender Rig (Chest Croll, Hand Ascender, Footloop & Pantin)",
        "category": "vertical_ascent_system",
        "priority": "essential",
        "rationale": (
            "Provides biomechanically efficient sit-stand vertical climbing for grueling 400–600 m "
            "multi-rebelay ascents back to the cloud-forest rim."
        ),
    },
    {
        "item": "Articulated Ballistic PVC/Cordura Rope Pad & Dual-Axle Edge Roller Protector",
        "category": "sheath_abrasion_protection",
        "priority": "essential",
        "rationale": (
            "Shields loaded static lines where they cross overhanging cloud-forest root mats and "
            "corrosive rillenkarren limestone edges at the sinkhole lip."
        ),
    },
    {
        "item": "EN 12492 Impact-Rated Speleology Helmet with Dual IPX8 1,500-Lumen Fog-Penetrating Headlamps",
        "category": "spall_and_visibility_safety",
        "priority": "essential",
        "rationale": (
            "Protects against terminal-velocity limestone spall and botanically dislodged rim debris "
            "while cutting through 95% subterranean advection cloud-forest fog."
        ),
    },
]

TIANKENG_GEAR_CHECKLIST: list[dict[str, Any]] = TIANKENG_DESCENT_GEAR_CHECKLIST


# ---------------------------------------------------------------------------
# Catalog Accessors & Filtering
# ---------------------------------------------------------------------------


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 reference karst tiankeng descent sites."""
    return list(TIANKENG_DESCENT_SITES)


def get_all_tiankeng_descent_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Return a single karst tiankeng descent site by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in TIANKENG_DESCENT_SITES:
        if str(site["id"]).lower() == target:
            return site
    return None


def get_tiankeng_descent_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """Filter karst tiankeng descent sites by country, morphology, difficulty, or free-text search."""
    results: list[dict[str, Any]] = list(TIANKENG_DESCENT_SITES)

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
        q_lower = search.strip().lower().replace("ñ", "n").replace("ó", "o")
        results = [
            s
            for s in results
            if q_lower in str(s["name"]).lower().replace("ñ", "n").replace("ó", "o")
            or q_lower in str(s["country"]).lower()
            or q_lower in str(s["region"]).lower().replace("ñ", "n").replace("ó", "o")
            or q_lower in str(s["morphology"]).lower()
            or q_lower in str(s["field_notes"]).lower().replace("ñ", "n").replace("ó", "o")
            or q_lower in str(s["id"]).lower()
        ]

    return results


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6-item mandatory karst tiankeng & cloud-forest rim descent gear checklist."""
    return list(TIANKENG_DESCENT_GEAR_CHECKLIST)


# ---------------------------------------------------------------------------
# Physics-Based Karst Tiankeng & Vertical Cloud-Forest Rim Descent Calculator
# ---------------------------------------------------------------------------


def calculate_tiankeng_descent(
    vertical_drop_m: float = 250.0,
    rebelay_count: int = 4,
    fog_humidity_pct: float = 85.0,
    overhang_angle_deg: float = -5.0,
    waterfall_spray_litres_min: float = 35.0,
) -> dict[str, Any]:
    """Calculate wet-rope friction multiplier, descender thermal temperature, limestone spall risk, and bounce amplitude.

    Parameters
    ----------
    vertical_drop_m:
        Total vertical pitch depth from cloud-forest rim to collapse floor in meters [50, 700].
    rebelay_count:
        Number of intermediate rebelay / deviation anchors dividing the drop [0, 20].
    fog_humidity_pct:
        Subterranean cloud-forest advection fog relative humidity in percent [30, 100].
    overhang_angle_deg:
        Wall inclination angle in degrees where negative is bell-overhung and positive is slab/funnel [-25, 30].
    waterfall_spray_litres_min:
        Waterfall plume spray flux intersecting the rope line in litres/min [0, 500].
    """
    if not (50.0 <= vertical_drop_m <= 700.0):
        raise ValueError("vertical_drop_m must be between 50 and 700 meters")
    if not (0 <= rebelay_count <= 20):
        raise ValueError("rebelay_count must be between 0 and 20")
    if not (30.0 <= fog_humidity_pct <= 100.0):
        raise ValueError("fog_humidity_pct must be between 30 and 100 percent")
    if not (-25.0 <= overhang_angle_deg <= 30.0):
        raise ValueError("overhang_angle_deg must be between -25 and 30 degrees")
    if not (0.0 <= waterfall_spray_litres_min <= 500.0):
        raise ValueError("waterfall_spray_litres_min must be between 0 and 500 L/min")

    # 1. Wet-rope friction & suspended water-film drag multiplier
    wet_rope_friction_multiplier = round(
        0.82 + (fog_humidity_pct / 250.0) + (waterfall_spray_litres_min / 600.0),
        2,
    )

    # 2. Peak descender thermal load (°C) across longest unsegmented pitch span
    max_segment_m = vertical_drop_m / max(1.0, float(rebelay_count) * 0.65 + 1.0)
    cooling_factor = max(
        0.55,
        1.0 - (waterfall_spray_litres_min / 900.0) - ((fog_humidity_pct - 50.0) / 500.0),
    )
    descender_thermal_c = round(
        22.0 + (vertical_drop_m * 0.24 + max_segment_m * 0.42) * cooling_factor,
        1,
    )

    # 3. Limestone / quartzite spall trajectory & rockfall impact risk (0 to 99%)
    overhang_factor = max(2.0, (overhang_angle_deg + 28.0) * 1.15)
    raw_spall = (
        overhang_factor
        + (waterfall_spray_litres_min * 0.11)
        + (vertical_drop_m * 0.035)
        + ((fog_humidity_pct - 50.0) * 0.12)
        - (min(float(rebelay_count), 8.0) * 1.2)
    )
    limestone_spall_trajectory_risk_pct = round(min(99.0, max(1.0, raw_spall)), 1)

    # 4. Free-hang elastic rope bounce amplitude (meters) on EN 1891 Type A static line
    effective_span_m = vertical_drop_m / max(1.0, float(rebelay_count) * 0.75 + 1.0)
    free_hang_bounce_amplitude_m = round(
        min(25.0, max(0.2, effective_span_m * 0.032)),
        2,
    )

    # 5. Classify Risk Level & Rigging Strategy
    warnings: list[str] = []
    recommendations: list[str] = []

    if (
        waterfall_spray_litres_min >= 220.0
        or limestone_spall_trajectory_risk_pct >= 78.0
        or free_hang_bounce_amplitude_m >= 7.5
        or descender_thermal_c >= 185.0
        or (vertical_drop_m >= 500.0 and rebelay_count <= 2)
    ):
        risk_level: TiankengRiskLevel = "critical"
        rigging_strategy: TiankengRiggingStrategy = "abort-monsoon-waterfall-plume-lockout"
    elif (
        waterfall_spray_litres_min >= 75.0
        or limestone_spall_trajectory_risk_pct >= 52.0
        or free_hang_bounce_amplitude_m >= 4.2
        or descender_thermal_c >= 135.0
        or vertical_drop_m >= 350.0
    ):
        risk_level = "high"
        rigging_strategy = "offset-pendulum-spray-avoidance-rig"
    elif (
        waterfall_spray_litres_min >= 20.0
        or limestone_spall_trajectory_risk_pct >= 28.0
        or free_hang_bounce_amplitude_m >= 2.0
        or descender_thermal_c >= 85.0
        or vertical_drop_m >= 160.0
    ):
        risk_level = "moderate"
        rigging_strategy = "segmented-rebelay-lip-deviation"
    else:
        risk_level = "low"
        rigging_strategy = "continuous-free-hang-6-bar-rack"

    # Populate actionable warnings
    if descender_thermal_c >= 130.0:
        warnings.append(
            f"DESCENDER THERMAL GLAZING HAZARD ({descender_thermal_c:.1f} °C): "
            f"Peak rack temperature approaches polyamide softening threshold (~175 °C) over a "
            f"{vertical_drop_m:.0f} m drop with {rebelay_count} rebelay(s); never halt stationary on a hot descender without water cooling."
        )
    if limestone_spall_trajectory_risk_pct >= 50.0 or overhang_angle_deg > 0.0:
        warnings.append(
            f"LIMESTONE/QUARTZITE SPALL TRAJECTORY RISK ({limestone_spall_trajectory_risk_pct:.1f}%): "
            f"Positive or near-vertical wall angle ({overhang_angle_deg:.1f}°) funnels dislodged rim cobbles "
            "and exfoliating karst flakes directly down the fall line."
        )
    if waterfall_spray_litres_min >= 75.0:
        warnings.append(
            f"WATERFALL PLUME ASPHYXIATION & HYPOTHERMIA HAZARD ({waterfall_spray_litres_min:.0f} L/min): "
            "Heavy spray curtain saturates breathing air around the caver's helmet and rapidly strips core heat on the rope."
        )
    if free_hang_bounce_amplitude_m >= 3.5:
        warnings.append(
            f"SEVERE FREE-HANG ROPE BOUNCE ({free_hang_bounce_amplitude_m:.2f} m amplitude): "
            "Long unsegmented rope span creates hazardous harmonic oscillation across upper karst lip projections."
        )

    # Populate technical recommendations
    if rigging_strategy == "abort-monsoon-waterfall-plume-lockout":
        recommendations.append(
            "DO NOT COMMIT TO THE SHAFT: Monsoon waterfall discharge and fall-line rockfall trajectory "
            "create lethal mid-rope entrapment; wait for plateau hydrograph recession or relocate to a dry overhang sector."
        )
        recommendations.append(
            "Add intermediate Y-hang rebelay stations every 60–80 m to reduce free-hang bounce amplitude "
            "and isolate the rope from active waterfall chutes before any future descent."
        )
    elif rigging_strategy == "offset-pendulum-spray-avoidance-rig":
        recommendations.append(
            "Rig offset pendulum deviation anchors and multi-point Y-hang rebelays to pull the SRT line "
            "laterally out of the main waterfall plume and rockfall funnel."
        )
        recommendations.append(
            "Use a 6-bar long-frame stainless steel rappel rack with hyperbar and carry a harness-mounted "
            "water squirt bottle to quench bar heat during long free-hanging segments."
        )
    elif rigging_strategy == "segmented-rebelay-lip-deviation":
        recommendations.append(
            "Maintain segmented rebelay loops (1.5–2 m slack loops) at every karst lip projection and "
            "install ballistic PVC rope pads plus edge rollers across cloud-forest root ledges."
        )
        recommendations.append(
            "Enforce one-caver-per-pitch spacing between rebelay stations to eliminate tandem harmonic "
            "rope bounce and protect lower climbers from dislodged limestone spall."
        )
    else:
        recommendations.append(
            "Standard bell-shaft free-hang protocol: rig a redundant cantilevered Y-hang at the overhanging lip "
            "and descend smoothly on a 6-bar stainless steel rack without shock-loading the line."
        )

    recommendations.append(
        "Verify stopper knots in all rope ends and inspect frog-system Croll/hand-ascender cams for "
        "calcite mud or bryophyte debris before starting the vertical ascent."
    )

    return _AttrDict(
        {
            "vertical_drop_m": round(vertical_drop_m, 1),
            "rebelay_count": int(rebelay_count),
            "fog_humidity_pct": round(fog_humidity_pct, 1),
            "overhang_angle_deg": round(overhang_angle_deg, 1),
            "waterfall_spray_litres_min": round(waterfall_spray_litres_min, 1),
            "wet_rope_friction_multiplier": wet_rope_friction_multiplier,
            "descender_thermal_c": descender_thermal_c,
            "limestone_spall_trajectory_risk_pct": limestone_spall_trajectory_risk_pct,
            "free_hang_bounce_amplitude_m": free_hang_bounce_amplitude_m,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "rigging_strategy": rigging_strategy,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


# ---------------------------------------------------------------------------
# Intent Detection & Parameter Extraction
# ---------------------------------------------------------------------------

_TIANKENG_DESCENT_KEYWORDS: tuple[str, ...] = (
    "tiankeng",
    "tiankengs",
    "giant sinkhole",
    "collapse sinkhole",
    "mega-doline",
    "mega doline",
    "xiaozhai",
    "dashiwei",
    "golondrinas",
    "sotano de las golondrinas",
    "sótano de las golondrinas",
    "sarisarinama",
    "sarisariñama",
    "sima humboldt",
    "sima mayor",
    "rebelay",
    "rebelays",
    "bell shaft sinkhole",
    "bell-shaft sinkhole",
    "cloud-forest rim",
    "cloud forest rim",
    "tepui sinkhole",
    "collapse-mega-doline",
    "twin-window-karst-chasm",
    "overhung-bell-shaft-sinkhole",
    "erosional-waterfall-tiankeng",
)

_TIANKENG_DESCENT_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return policy",
    "return label",
    "shipping",
    "tracking number",
    "invoice",
    "cancel my order",
    # Classical US pit caving exclusions (caving.py)
    "pit cave",
    "pit caving",
    "fantastic pit",
    "ellison's cave",
    "ellisons cave",
    "mammoth cave",
    "tumbling rock",
    "great x pit",
    "columbine crevasse",
    "slaughter canyon",
    "white-nose syndrome",
    "white nose syndrome",
    # Cave mineralogy exclusions
    "cave pearl",
    "pisolith",
    "helictite",
    "anthodite",
    "calcite saturation",
    "carlsbad caverns",
    "lechuguilla",
    # Cave diving exclusions
    "cave diving",
    "sump diving",
    "turn pressure",
    "rule of thirds",
    "peacock springs",
    "ginnie springs",
    # Cryokarst & glaciere exclusions
    "cryokarst",
    "glaciere",
    "glacière",
    "eisriesenwelt",
    "scarisoara",
    "scărișoara",
    "bandera ice cave",
    "lofthellir",
    # Pothole escape / slot canyon exclusions
    "keeper pothole",
    "sandtrap",
    "cheater stick",
    "neon canyon",
    "choprock canyon",
    # Sea cave pneumatics exclusions
    "sea cave",
    "sea-cave",
    "blowhole",
    "piston-seal",
    "piston seal",
    "devil's punchbowl",
    "devils punchbowl",
    # Tropical tsingy labyrinth exclusions
    "tsingy",
    "bemaraha",
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
    # Canopy bryophyte exclusions
    "canopy bryophyte",
    "epiphytic bryophyte",
    "hall of mosses",
    "poikilohydric",
)


def is_tiankeng_descent_query(query: str) -> bool:
    """Return True if the user query is asking about karst tiankeng (giant collapse sinkhole) or cloud-forest rim descents."""
    if not query or not query.strip():
        return False
    q_lower = query.lower()

    if any(excl in q_lower for excl in _TIANKENG_DESCENT_EXCLUSIONS):
        return False

    return any(kw in q_lower for kw in _TIANKENG_DESCENT_KEYWORDS)


def detect_tiankeng_descent_intent(query: str) -> bool:
    """Alias for is_tiankeng_descent_query()."""
    return is_tiankeng_descent_query(query)


def extract_tiankeng_descent_params(query: str) -> dict[str, Any]:
    """Extract tiankeng descent site ID and numerical calculator parameters from a natural-language query."""
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = None

    if "xiaozhai" in q_lower or "chongqing" in q_lower or "fengjie" in q_lower:
        matched_site = get_site_by_id("xiaozhai-tiankeng-chongqing-china")
    elif "dashiwei" in q_lower or "leye" in q_lower or "guangxi" in q_lower:
        matched_site = get_site_by_id("dashiwei-tiankeng-leye-china")
    elif (
        "golondrinas" in q_lower
        or "aquismon" in q_lower
        or "aquismón" in q_lower
        or "mexico" in q_lower
    ):
        matched_site = get_site_by_id("sotano-de-las-golondrinas-mexico")
    elif (
        "sarisarinama" in q_lower
        or "sarisariñama" in q_lower
        or "sima humboldt" in q_lower
        or "sima mayor" in q_lower
        or "tepui" in q_lower
        or "venezuela" in q_lower
    ):
        matched_site = get_site_by_id("sima-humboldt-sarisarinama-venezuela")

    drop_m = float(matched_site["default_vertical_drop_m"]) if matched_site else 250.0
    rebelays = int(matched_site["default_rebelay_count"]) if matched_site else 4
    humidity_pct = float(matched_site["default_fog_humidity_pct"]) if matched_site else 85.0
    overhang_deg = float(matched_site["default_overhang_angle_deg"]) if matched_site else -5.0
    spray_l_min = (
        float(matched_site["default_waterfall_spray_litres_min"]) if matched_site else 35.0
    )

    has_explicit_numbers = False

    drop_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:vertical\s*drop|drop|depth|deep|shaft|pitch)?",
        q_lower,
    )
    if drop_match:
        val = float(drop_match.group(1))
        if 50.0 <= val <= 700.0:
            drop_m = val
            has_explicit_numbers = True

    rebelay_match = re.search(
        r"\b(\d{1,2})\s*(?:rebelay|rebelays|re-belays|deviations?)\b",
        q_lower,
    )
    if rebelay_match:
        r_val = int(rebelay_match.group(1))
        if 0 <= r_val <= 20:
            rebelays = r_val
            has_explicit_numbers = True

    hum_match = re.search(
        r"(\d+(?:\.\d+)?)\s*%\s*(?:fog|humidity|rh)?",
        q_lower,
    )
    if hum_match:
        val = float(hum_match.group(1))
        if 30.0 <= val <= 100.0:
            humidity_pct = val
            has_explicit_numbers = True

    overhang_match = re.search(
        r"(-?\d+(?:\.\d+)?)\s*(?:deg|degree|degrees|°)\s*(?:overhang|angle|wall|inclination)?",
        q_lower,
    )
    if overhang_match:
        val = float(overhang_match.group(1))
        if -25.0 <= val <= 30.0:
            overhang_deg = val
            has_explicit_numbers = True

    spray_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:l/min|litres/min|liters/min|l\s*per\s*min)\b",
        q_lower,
    )
    if spray_match:
        val = float(spray_match.group(1))
        if 0.0 <= val <= 500.0:
            spray_l_min = val
            has_explicit_numbers = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "matched_site": matched_site,
        "vertical_drop_m": drop_m,
        "rebelay_count": rebelays,
        "fog_humidity_pct": humidity_pct,
        "overhang_angle_deg": overhang_deg,
        "waterfall_spray_litres_min": spray_l_min,
        "has_explicit_numbers": has_explicit_numbers,
    }


def format_tiankeng_descent_response(query: str) -> dict[str, Any]:
    """Build a structured response dictionary for a karst tiankeng descent query."""
    params: dict[str, Any] = extract_tiankeng_descent_params(query)
    q_lower = query.lower()
    matched_site: dict[str, Any] | None = params["matched_site"]

    calc_result: dict[str, Any] = calculate_tiankeng_descent(
        vertical_drop_m=float(params["vertical_drop_m"]),
        rebelay_count=int(params["rebelay_count"]),
        fog_humidity_pct=float(params["fog_humidity_pct"]),
        overhang_angle_deg=float(params["overhang_angle_deg"]),
        waterfall_spray_litres_min=float(params["waterfall_spray_litres_min"]),
    )

    is_calc_request = bool(
        params["has_explicit_numbers"]
        or any(
            w in q_lower
            for w in (
                "calculate",
                "calculator",
                "thermal",
                "bounce",
                "amplitude",
                "multiplier",
                "spall",
            )
        )
    )

    if is_calc_request:
        action = "tiankeng_descent_calculated"
    elif matched_site is not None:
        action = "tiankeng_descent_lookup"
    else:
        action = "tiankeng_descent_info"

    site_summary = (
        f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']} — "
        f"morphology: `{matched_site['morphology']}`, difficulty: `{matched_site['difficulty']}`): "
        f"{matched_site['navigation_protocol']} "
        if matched_site
        else "Karst tiankeng (giant collapse sinkhole) and vertical cloud-forest rim descents require "
        "careful evaluation of multi-rebelay pitch segmentation, descender thermal dissipation, "
        "limestone spall trajectories, and waterfall spray plumes. "
    )

    answer = (
        f"{site_summary}"
        f"For a **{calc_result['vertical_drop_m']} m vertical drop** with "
        f"**{calc_result['rebelay_count']} rebelays** "
        f"({calc_result['fog_humidity_pct']}% fog humidity, {calc_result['overhang_angle_deg']}° overhang angle, "
        f"{calc_result['waterfall_spray_litres_min']} L/min waterfall spray), "
        f"the wet-rope friction multiplier is **{calc_result['wet_rope_friction_multiplier']}x**, "
        f"peak descender thermal load is **{calc_result['descender_thermal_c']} °C**, "
        f"limestone spall trajectory risk is **{calc_result['limestone_spall_trajectory_risk_pct']}%**, "
        f"free-hang bounce amplitude is **{calc_result['free_hang_bounce_amplitude_m']} m**, and risk level is "
        f"**{calc_result['risk_level'].upper()}** (rigging strategy: `{calc_result['rigging_strategy']}`)."
    )

    return _AttrDict(
        {
            "action": action,
            "answer": answer,
            "matched_site": matched_site,
            "calculation": calc_result,
            "sites": TIANKENG_DESCENT_SITES,
            "checklist": TIANKENG_DESCENT_GEAR_CHECKLIST,
        }
    )


def build_tiankeng_descent_prompt(query: str = "") -> str:
    """Build system prompt context for LLM calls involving karst tiankeng & cloud-forest rim descents."""
    info: dict[str, Any] = (
        format_tiankeng_descent_response(query)
        if query
        else format_tiankeng_descent_response("tiankeng descent")
    )
    calc: dict[str, Any] = info["calculation"]
    matched_site: dict[str, Any] | None = info.get("matched_site")

    lines: list[str] = [
        "### Karst Tiankeng (Giant Collapse Sinkhole) & Vertical Cloud-Forest Rim Descent Context",
        "- **Tiankeng Morphologies**: Double-nested collapse mega-dolines (e.g., Xiaozhai Tiankeng, Chongqing), "
        "twin-window subterranean cloud-forest chasms (e.g., Dashiwei Tiankeng, Leye), overhung free-fall bell shafts "
        "(e.g., Sótano de las Golondrinas, Mexico), and erosional quartzite tepui sinkholes "
        "(e.g., Sima Mayor de Sarisariñama / Sima Humboldt, Venezuela).",
        f"- **Calculated Tiankeng SRT Physics**: VerticalDrop={calc['vertical_drop_m']}m, "
        f"Rebelays={calc['rebelay_count']}, FogHumidity={calc['fog_humidity_pct']}%, "
        f"OverhangAngle={calc['overhang_angle_deg']}°, Spray={calc['waterfall_spray_litres_min']}L/min -> "
        f"WetFrictionMultiplier={calc['wet_rope_friction_multiplier']}x, DescenderThermal={calc['descender_thermal_c']}°C, "
        f"SpallTrajectoryRisk={calc['limestone_spall_trajectory_risk_pct']}%, BounceAmplitude={calc['free_hang_bounce_amplitude_m']}m, "
        f"Risk={calc['risk_level']}, RiggingStrategy={calc['rigging_strategy']}.",
    ]
    if matched_site:
        lines.append(
            f"- **Focused Tiankeng Site**: {matched_site['name']} ({matched_site['country']}) — "
            f"Primary Hazard: {matched_site['primary_hazard']} | Navigation Protocol: {matched_site['navigation_protocol']}"
        )
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response dictionary for a karst tiankeng descent query."""
    info: dict[str, Any] = format_tiankeng_descent_response(query)
    return {
        "answer": info["answer"],
        "tiankeng_descent_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[str, None, None]:
    """Yield SSE stream chunks for a karst tiankeng descent query."""
    info: dict[str, Any] = format_tiankeng_descent_response(query)
    yield f"data: {json.dumps({'action': info['action'], 'tiankeng_descent_info': info})}\n\n"
    yield f"data: {json.dumps({'content': info['answer'], 'answer': info['answer']})}\n\n"
    yield "data: [DONE]\n\n"
