"""Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Navigation Guide.

Domain calculator, site catalog, gear checklist, and intent detection for navigating
dissected glaciomarine clay terraces (kvikkleire / Leda clay) below the postglacial
marine limit, assessing pore-water salt leaching, sensitivity ratios (St), stream-toe
undercutting, and retrogressive bottleneck flow-slide runout zones.
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from typing import Any


class QuickClayTerraceSite(dict[str, Any]):
    """Dictionary subclass supporting attribute-style access for quick-clay terrace sites."""

    def __getattr__(self, item: str) -> Any:
        try:
            return self[item]
        except KeyError as exc:
            raise AttributeError(
                f"'QuickClayTerraceSite' object has no attribute '{item}'"
            ) from exc


QUICK_CLAY_TERRACE_SITES: list[QuickClayTerraceSite] = [
    QuickClayTerraceSite(
        {
            "id": "gauldalen-trondheimsfjord-kvikkleire-norway",
            "name": "Gauldalen & Rissa Trondheimsfjord Kvikkleire Marine-Terrace Ravines",
            "country": "Norway",
            "region": "Trøndelag (Gauldalen, Melhus, Buvika & Indre Fosen / Rissa, Trondheimsfjord Basin)",
            "deposit_type": "glaciomarine-kvikkleire-ravine",
            "terrace_type": "glaciomarine-kvikkleire-ravine",
            "morphology": "glaciomarine-kvikkleire-ravine",
            "substrate_type": "glaciomarine-kvikkleire-ravine",
            "lithology": "glaciomarine-kvikkleire-ravine",
            "difficulty": "extreme",
            "elevation_range": "5–175 m (below ~175 m postglacial marine limit)",
            "marine_limit_m": 175,
            "default_sensitivity_ratio_st": 125.0,
            "default_pore_salinity_g_per_l": 0.45,
            "default_ravine_slope_angle_deg": 28.0,
            "default_stream_toe_erosion_rate_cm_yr": 68.0,
            "default_rainfall_saturation_pct": 78.0,
            "primary_hazard": (
                "Card-house (flocculated) illite-chlorite marine clay leached by artesian "
                "groundwater to <0.5 g/L NaCl pore salinity (sensitivity St > 100, remolded "
                "shear strength <0.3 kPa), collapsing into high-velocity retrogressive "
                "bottleneck flow-slides triggered by Gaula River toe undercutting."
            ),
            "terrace_strategy": (
                "Navigate strictly along crystalline bedrock knolls (bergknauser) or coarse "
                "glaciofluvial ice-margin ridges above the 175 m marine limit; maintain a "
                ">= 15x scarp-height crown setback from active ravine heads and never camp "
                "inside historic pear-shaped bottleneck slump bowls (gryteskred)."
            ),
            "crossing_strategy": (
                "Cross incised ravine streams only at verified bedrock sills or boulder-armored "
                "thresholds; avoid descending steep (>20°) desiccated dry-crust (tørrskorpeleire) "
                "banks where basal artesian seepage softens underlying quick clay."
            ),
            "scarp_setback_protocol": (
                "Enforce a minimum 1:15 vertical-to-horizontal retrogression setback from "
                "unarmored ravine toes; monitor NVE Kvikkleire hazard zone maps (Faregrad Høy) "
                "and evacuate immediately if tension cracks or turbid clay boils appear."
            ),
            "remolding_avoidance_protocol": (
                "Never induce rhythmic jumping, heavy drop-stepping, or vehicle/sled vibration "
                "on saturated marine-terrace margins; distribute foot pressure with wide flotation "
                "frames if traversing softened clay-silt outwash aprons."
            ),
            "conservation_protocol": (
                "Do not disturb willow/alder riparian root mats or engineered rockfill toe-berms "
                "(motfylling) along Gaula salmon spawning reaches; stay on established farm tracks."
            ),
            "field_notes": (
                "Site of the historic 1345 Gauldalen catastrophe and the 1978 Rissa quick-clay "
                "landslide where 33 hectares of leached glaciomarine terrace liquefied into "
                "Lake Botnen at 30–40 km/h within minutes."
            ),
        }
    ),
    QuickClayTerraceSite(
        {
            "id": "romerike-gjerdrum-ravine-terrace-norway",
            "name": "Romerike & Nittedal-Gjerdrum Dissected Quick-Clay Plateau",
            "country": "Norway",
            "region": "Akershus (Romerike Plain, Gjerdrum / Ask, Ullensaker & Leira-Nitelva Ravine Valleys)",
            "deposit_type": "fjord-delta-subaqueous-scarp",
            "terrace_type": "fjord-delta-subaqueous-scarp",
            "morphology": "fjord-delta-subaqueous-scarp",
            "substrate_type": "fjord-delta-subaqueous-scarp",
            "lithology": "fjord-delta-subaqueous-scarp",
            "difficulty": "extreme",
            "elevation_range": "95–220 m (below ~220 m Oslo Fjord postglacial marine limit)",
            "marine_limit_m": 220,
            "default_sensitivity_ratio_st": 150.0,
            "default_pore_salinity_g_per_l": 0.35,
            "default_ravine_slope_angle_deg": 31.0,
            "default_stream_toe_erosion_rate_cm_yr": 82.0,
            "default_rainfall_saturation_pct": 84.0,
            "primary_hazard": (
                "Deeply incised dendritic ravine networks (25–45 m relief) cutting into "
                "ultra-sensitive Holocene fjord-marine clay plateaus where prolonged autumn/winter "
                "rainfall and stream-bend toe erosion trigger progressive rotational slumps that "
                "cascade into multi-hundred-meter retrogressive flake slides."
            ),
            "terrace_strategy": (
                "Plan routes along intact moraine crests or bedrock outcrops mapped on NGU "
                "Quaternary geology layers; avoid following narrow inter-ravine clay spurs "
                "(ravinerygger) after >40 mm/48h rainfall or rapid snowmelt saturation."
            ),
            "crossing_strategy": (
                "Detour around active outer-meander stream cutbanks in Tistilbekken and Leira "
                "tributaries; if crossing a ravine valley is mandatory, use bridged road crossings "
                "or low-gradient bedrock-floored saddles."
            ),
            "scarp_setback_protocol": (
                "Maintain >= 120 m horizontal setback from steep (>24°) unbuttressed ravine "
                "crowns during high pore-pressure periods; watch for tilted spruce trees "
                "('drunken ravine rims') and fresh arcuate crown fissures."
            ),
            "remolding_avoidance_protocol": (
                "Never enter freshly slumped clay debris lobes—remolded kvikkleire behaves as "
                "a heavy non-Newtonian fluid (density ~1.85 g/cm³) with zero bearing capacity "
                "beneath a thin floating turf raft."
            ),
            "conservation_protocol": (
                "Protect Romerike's red-listed active ravine landscapes (ravinelandskap) by "
                "preserving natural grey alder (gråor-heggeskog) root reinforcement along "
                "stream toes and respecting municipal NVE geohazard exclusion perimeters."
            ),
            "field_notes": (
                "Romerike contains Norway's densest concentration of mapped kvikkleire zones "
                "below the 220 m marine limit, including the December 2020 Ask (Gjerdrum) "
                "retrogressive landslide scar and the 1768 Skea flow-slide."
            ),
        }
    ),
    QuickClayTerraceSite(
        {
            "id": "south-nation-lemieux-leda-clay-ontario-canada",
            "name": "South Nation River & Lemieux Champlain Sea Leda-Clay Bluffs",
            "country": "Canada",
            "region": "Eastern Ontario (Prescott and Russell / Ottawa Valley, South Nation River Watershed)",
            "deposit_type": "champlain-sea-leda-clay-terrace",
            "terrace_type": "champlain-sea-leda-clay-terrace",
            "morphology": "champlain-sea-leda-clay-terrace",
            "substrate_type": "champlain-sea-leda-clay-terrace",
            "lithology": "champlain-sea-leda-clay-terrace",
            "difficulty": "challenging",
            "elevation_range": "45–95 m (Champlain Sea basin floor)",
            "marine_limit_m": 195,
            "default_sensitivity_ratio_st": 85.0,
            "default_pore_salinity_g_per_l": 0.65,
            "default_ravine_slope_angle_deg": 24.0,
            "default_stream_toe_erosion_rate_cm_yr": 52.0,
            "default_rainfall_saturation_pct": 72.0,
            "primary_hazard": (
                "Postglacial Champlain Sea 'Leda clay' (sensitive glaciomarine silt-clay) "
                "capped by a permeable 2–4 m Deltaic sand veneer that feeds high pore-water "
                "pressures into underlying leached clay layers during spring freshet, causing "
                "sudden 500–700 m retrogressive crater slides into the South Nation River channel."
            ),
            "terrace_strategy": (
                "Traverse well inland of the 15–28 m high river-bluff crown (minimum 100 m "
                "setback on flat agricultural/forested sand-over-clay plains); inspect LiDAR "
                "hillshades for prehistoric bottleneck crater rims before selecting camp sites."
            ),
            "crossing_strategy": (
                "Do not walk along the river-level clay toe bench during spring snowmelt or "
                "post-storm river drawdown, when rapid loss of hydraulic toe support triggers "
                "spontaneous bank failure and channel-blocking clay dams."
            ),
            "scarp_setback_protocol": (
                "Stay clear of groundwater seepage horizons at the sand-clay contact mid-bluff; "
                "if tension cracks or stepped slumping are observed along the bluff rim, retreat "
                "perpendicular to the river axis for at least 15x bluff height."
            ),
            "remolding_avoidance_protocol": (
                "If caught near a deforming terrace rim, move laterally onto intact desiccated "
                "surface crust or woody root rafts rather than stepping into grey fluidized "
                "silt-clay extruded from basal shear planes."
            ),
            "conservation_protocol": (
                "Respect South Nation Conservation Authority hazard-land setbacks around the "
                "former Lemieux townsite ghost town and avoid trampling bank-stabilizing "
                "tree plantations."
            ),
            "field_notes": (
                "In June 1993, the Lemieux retrogressive Leda-clay landslide liquefied 2.8 million m³ "
                "of Champlain Sea terrace over 680 m inland in under an hour, damming the "
                "South Nation River for 3 km upstream."
            ),
        }
    ),
    QuickClayTerraceSite(
        {
            "id": "saguenay-saint-jean-vianney-terrace-quebec-canada",
            "name": "Saguenay Fjord & Rivière aux Vases Laflamme Sea Clay Terraces",
            "country": "Canada",
            "region": "Saguenay–Lac-Saint-Jean, Quebec (Rivière aux Vases, Shipshaw & Saguenay Fjord Tributaries)",
            "deposit_type": "tyrrell-sea-postglacial-bluff",
            "terrace_type": "tyrrell-sea-postglacial-bluff",
            "morphology": "tyrrell-sea-postglacial-bluff",
            "substrate_type": "tyrrell-sea-postglacial-bluff",
            "lithology": "tyrrell-sea-postglacial-bluff",
            "difficulty": "challenging",
            "elevation_range": "20–165 m (Laflamme Sea postglacial marine terraces)",
            "marine_limit_m": 180,
            "default_sensitivity_ratio_st": 105.0,
            "default_pore_salinity_g_per_l": 0.50,
            "default_ravine_slope_angle_deg": 26.0,
            "default_stream_toe_erosion_rate_cm_yr": 60.0,
            "default_rainfall_saturation_pct": 76.0,
            "primary_hazard": (
                "Thick Laflamme Sea postglacial marine clay terraces dissected by flash-flooding "
                "tributary gorges (Rivière aux Vases and Rivière Ha! Ha!), where artesian upward "
                "hydraulic gradients and rapid snowmelt trigger high-velocity retrogressive earthflows "
                "capable of sweeping 2–3 km down-canyon into the Saguenay River."
            ),
            "terrace_strategy": (
                "Keep trekking routes anchored on Precambrian Grenville gneiss valley walls or "
                "high glaciofluvial outwash benches above the 180 m Laflamme Sea limit; avoid "
                "flooring tributary clay ravines during April–May snowmelt or heavy autumn rains."
            ),
            "crossing_strategy": (
                "Verify Ministère des Transports et de la Mobilité durable (MTMD) Quebec ZEC "
                "(Zone exposée aux glissements de terrain) hazard maps before crossing incised "
                "clay gorges; never linger below concave amphitheater scarp walls."
            ),
            "scarp_setback_protocol": (
                "Maintain a >= 100 m crown setback from 30 m high terraced clay bluffs; recognize "
                "concentric 'ribbed' horst-and-graben clay ridges inside old scars as evidence "
                "of extreme retrogressive spread sensitivity."
            ),
            "remolding_avoidance_protocol": (
                "Carry emergency snowshoes or wide mud-flotation frames and a 25 m throw bag "
                "when surveying ravine perimeters; never step off vegetated turf islands onto "
                "bare blue-grey Laflamme clay."
            ),
            "conservation_protocol": (
                "Observe Saint-Jean-Vianney memorial park boundaries and Saguenay Fjord National "
                "Park shoreline buffer regulations; do not excavate marine fossil shells (Hiatella "
                "arctica / Macoma balthica) from active bluff toes."
            ),
            "field_notes": (
                "The May 1971 Saint-Jean-Vianney retrogressive flow-slide mobilized 7 million m³ "
                "of Laflamme Sea quick clay within nested prehistoric landslide scars, carrying "
                "liquefied debris 3 km down the Rivière aux Vases at 26 km/h."
            ),
        }
    ),
]

QUICK_CLAY_SITES = QUICK_CLAY_TERRACE_SITES

QUICK_CLAY_TERRACE_GEAR_CHECKLIST: list[dict[str, Any]] = [
    {
        "item": "Geotechnical LiDAR Hillshade & NVE/MTMD Quick-Clay Hazard Zone Map Overlay",
        "category": "navigation",
        "priority": "essential",
        "reason": (
            "Identifies prehistoric pear-shaped bottleneck slump scars (gryteskred), "
            "active ravine headcuts, and safe crystalline bedrock knolls above the postglacial marine limit."
        ),
    },
    {
        "item": "Graduated T-Handle Soil Sounding Probe & Digital Pore-Water EC/Salinity Meter",
        "category": "assessment",
        "priority": "essential",
        "reason": (
            "Measures surface desiccated crust (tørrskorpe) thickness and checks seepage "
            "electrical conductivity for leached pore-water salinity (<1.0 g/L NaCl threshold)."
        ),
    },
    {
        "item": "Optical Clinometer & Laser Rangefinder (Scarp-Height & 1:15 Setback Verification)",
        "category": "assessment",
        "priority": "essential",
        "reason": (
            "Measures ravine slope angle (>20° critical threshold) and verifies the mandatory "
            "15x scarp-height horizontal retrogression setback from unbuttressed terrace crowns."
        ),
    },
    {
        "item": "Wide-Deck Emergency Mud/Bog Flotation Frames (Snowshoes) with Quick-Release Bindings",
        "category": "mobility",
        "priority": "essential",
        "reason": (
            "Reduces ground bearing pressure (<4 kPa) across softened silt-clay outwash "
            "aprons and allows emergency self-extrication onto intact turf rafts."
        ),
    },
    {
        "item": "25 m Floating Dyneema Throw Bag & Chest-Harness Belay Tether",
        "category": "rescue",
        "priority": "essential",
        "reason": (
            "Enables zero-entry shore rescue from stable bedrock or dry-crust ground if a "
            "party member becomes mired in remolded quick-clay seepage."
        ),
    },
    {
        "item": "PLB / Two-Way Satellite Communicator & High-Decibel Pealess Rescue Whistle",
        "category": "emergency",
        "priority": "essential",
        "reason": (
            "Provides immediate SAR helicopter hoist coordination and acoustic warning "
            "across wooded ravine corridors if retrogressive crown cracking initiates."
        ),
    },
]


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 reference sites in the coastal fjord quick-clay marine-terrace catalog."""
    return [dict(site) for site in QUICK_CLAY_TERRACE_SITES]


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Return a single quick-clay terrace site dictionary by ID, or None if not found."""
    target = site_id.strip().lower()
    for site in QUICK_CLAY_TERRACE_SITES:
        if site["id"].lower() == target:
            return dict(site)
    return None


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6-item essential gear checklist for quick-clay marine-terrace navigation."""
    return list(QUICK_CLAY_TERRACE_GEAR_CHECKLIST)


def filter_sites(
    country: str | None = None,
    deposit_type: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
    terrace_type: str | None = None,
    morphology: str | None = None,
    substrate_type: str | None = None,
    lithology: str | None = None,
) -> list[dict[str, Any]]:
    """Filter the quick-clay terrace catalog by country, deposit_type, difficulty, or search."""
    effective_deposit = (
        deposit_type or terrace_type or morphology or substrate_type or lithology
    )
    results: list[dict[str, Any]] = []
    for site in QUICK_CLAY_TERRACE_SITES:
        if country and site["country"].lower() != country.strip().lower():
            continue
        if (
            effective_deposit
            and effective_deposit.strip().lower() not in site["deposit_type"].lower()
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
                    str(site.get("deposit_type", "")),
                    str(site.get("primary_hazard", "")),
                    str(site.get("field_notes", "")),
                ]
            ).lower()
            if q not in searchable:
                continue
        results.append(dict(site))
    return results


def calculate_quick_clay_terrace(
    sensitivity_ratio_st: float = 65.0,
    pore_salinity_g_per_l: float = 0.8,
    ravine_slope_angle_deg: float = 24.0,
    stream_toe_erosion_rate_cm_yr: float = 45.0,
    rainfall_saturation_pct: float = 65.0,
) -> dict[str, Any]:
    """Calculate retrogressive liquefaction risk, runout distance, remolded shear strength, and safe crown setback."""
    if not (10.0 <= sensitivity_ratio_st <= 300.0):
        raise ValueError(
            "sensitivity_ratio_st must be between 10.0 and 300.0"
        )
    if not (0.1 <= pore_salinity_g_per_l <= 15.0):
        raise ValueError(
            "pore_salinity_g_per_l must be between 0.1 and 15.0 g/L"
        )
    if not (5.0 <= ravine_slope_angle_deg <= 45.0):
        raise ValueError(
            "ravine_slope_angle_deg must be between 5.0 and 45.0 degrees"
        )
    if not (0.0 <= stream_toe_erosion_rate_cm_yr <= 150.0):
        raise ValueError(
            "stream_toe_erosion_rate_cm_yr must be between 0.0 and 150.0 cm/yr"
        )
    if not (0.0 <= rainfall_saturation_pct <= 100.0):
        raise ValueError(
            "rainfall_saturation_pct must be between 0.0 and 100.0 %"
        )

    # Normalized factors (0.0 to 1.0)
    st_norm = (sensitivity_ratio_st - 10.0) / 290.0
    # Lower pore salinity (< 1.0 g/L) dramatically increases leaching instability
    leaching_norm = max(0.0, min(1.0, (15.0 - pore_salinity_g_per_l) / 14.9))
    low_salt_boost = max(0.0, (2.0 - min(2.0, pore_salinity_g_per_l)) / 1.9)
    slope_norm = (ravine_slope_angle_deg - 5.0) / 40.0
    erosion_norm = stream_toe_erosion_rate_cm_yr / 150.0
    rain_norm = rainfall_saturation_pct / 100.0

    # 1. Remolded shear strength Cu_r (kPa): true quick clay is defined by Cu_r < 0.5 kPa (NGI / NVE standard)
    remolded_shear_strength_kpa = round(
        max(
            0.05,
            min(
                4.50,
                (22.0 / max(10.0, sensitivity_ratio_st))
                * (0.45 + 0.14 * pore_salinity_g_per_l)
                * (1.15 - 0.35 * rain_norm),
            ),
        ),
        2,
    )

    # 2. Retrogressive liquefaction risk (%)
    retrogressive_liquefaction_risk_pct = round(
        min(
            99.0,
            max(
                4.0,
                5.0
                + st_norm * 32.0
                + leaching_norm * 14.0
                + low_salt_boost * 16.0
                + slope_norm * 18.0
                + erosion_norm * 10.0
                + rain_norm * 10.0,
            ),
        ),
        1,
    )

    # 3. Retrogression runout distance (m)
    retrogression_runout_distance_m = round(
        min(
            650.0,
            max(
                18.0,
                22.0
                + st_norm * 210.0
                + low_salt_boost * 95.0
                + slope_norm * 115.0
                + erosion_norm * 65.0
                + rain_norm * 55.0,
            ),
        ),
        1,
    )

    # 4. Safe crown setback distance (m) — based on NVE 1:15 retrogression envelope and sensitivity
    safe_crown_setback_distance_m = round(
        min(
            350.0,
            max(
                20.0,
                24.0
                + retrogression_runout_distance_m * 0.42
                + slope_norm * 35.0
                + low_salt_boost * 25.0,
            ),
        ),
        1,
    )

    if (
        retrogressive_liquefaction_risk_pct >= 72.0
        or (sensitivity_ratio_st >= 120.0 and pore_salinity_g_per_l <= 0.6)
        or (remolded_shear_strength_kpa <= 0.25 and ravine_slope_angle_deg >= 28.0)
    ):
        risk_level = "critical"
        safety_status = (
            "CRITICAL — EXTREME KVIKKLEIRE / LEDA-CLAY RETROGRESSIVE FLOW-SLIDE HAZARD"
        )
        terrace_strategy = (
            f"Abort all ravine-floor and bluff-edge travel; retreat >= {safe_crown_setback_distance_m:.0f} m "
            "inland onto crystalline bedrock knolls (bergknauser) or above the postglacial marine limit. "
            "Never enter bottleneck slump bowls or step onto freshly remolded clay lobes."
        )
    elif (
        retrogressive_liquefaction_risk_pct >= 48.0
        or sensitivity_ratio_st >= 60.0
        or pore_salinity_g_per_l <= 1.0
        or ravine_slope_angle_deg >= 24.0
    ):
        risk_level = "high"
        safety_status = (
            "HIGH CAUTION — LEACHED SENSITIVE GLACIOMARINE CLAY & ACTIVE TOE UNDERCUTTING"
        )
        terrace_strategy = (
            f"Maintain at least a {safe_crown_setback_distance_m:.0f} m horizontal crown setback from "
            "ravine rims and outer stream meanders; route along consolidated moraine ridges or "
            "bedrock sills and carry wide flotation frames plus a 25 m rescue throw bag."
        )
    elif retrogressive_liquefaction_risk_pct >= 28.0:
        risk_level = "moderate"
        safety_status = (
            "MODERATE — SEMI-CONSOLIDATED MARINE TERRACE WITH LOCALIZED RAVINE SEEPAGE"
        )
        terrace_strategy = (
            f"Keep a >= {safe_crown_setback_distance_m:.0f} m buffer from steep incised creek banks, "
            "stay on intact desiccated dry-crust (tørrskorpe) tracks, and avoid unbuttressed slopes "
            "after heavy rainfall."
        )
    else:
        risk_level = "low"
        safety_status = (
            "LOW — UNLEACHED SALINE GLACIOMARINE CLAY BENCH WITH STABLE DRY CRUST"
        )
        terrace_strategy = (
            "Proceed along established terrace paths while maintaining standard bank setbacks "
            "and avoiding stream-toe cutbanks during spring snowmelt."
        )

    warnings: list[str] = []
    recommendations: list[str] = []

    if pore_salinity_g_per_l <= 1.0 or remolded_shear_strength_kpa < 0.5:
        warnings.append(
            f"Severe salt-leached quick-clay state (pore salinity {pore_salinity_g_per_l:.2f} g/L, "
            f"remolded shear strength {remolded_shear_strength_kpa:.2f} kPa < 0.5 kPa threshold): "
            "card-house clay fabric can liquefy instantaneously into a non-Newtonian fluid."
        )
        recommendations.append(
            "Route strictly across crystalline bedrock outcrops or above the regional postglacial marine limit."
        )

    if sensitivity_ratio_st >= 50.0 or retrogressive_liquefaction_risk_pct >= 50.0:
        warnings.append(
            f"High retrogressive bottleneck slump potential ({retrogressive_liquefaction_risk_pct:.1f}%, "
            f"St={sensitivity_ratio_st:.0f}): initial bank failure can retrogress "
            f"~{retrogression_runout_distance_m:.0f} m inland."
        )
        recommendations.append(
            f"Enforce a minimum {safe_crown_setback_distance_m:.0f} m crown setback from ravine heads and consult NVE/MTMD LiDAR hazard maps."
        )

    if ravine_slope_angle_deg >= 22.0 or stream_toe_erosion_rate_cm_yr >= 50.0:
        warnings.append(
            f"Oversteepened ravine geometry ({ravine_slope_angle_deg:.1f}° slope) with active stream-toe "
            f"undercutting ({stream_toe_erosion_rate_cm_yr:.0f} cm/yr) destabilizes the basal clay prism."
        )
        recommendations.append(
            "Never descend outer meander cutbanks; cross incised streams only at bedrock thresholds or engineered rockfill berms."
        )

    if rainfall_saturation_pct >= 70.0:
        warnings.append(
            f"Elevated pore-water saturation ({rainfall_saturation_pct:.0f}%): artesian upward gradients "
            "soften the surface dry crust (tørrskorpe) and reduce effective normal stress."
        )
        recommendations.append(
            "Carry emergency snowshoes / mud-flotation frames and a 25 m floating throw bag when traversing near terrace margins."
        )

    if not warnings:
        warnings.append(
            "Intact saline pore-water flocculation and low ravine slope angle; watch for localized seasonal bank seepage."
        )
    if not recommendations:
        recommendations.append(
            "Stay on vegetated dry-crust trails, avoid disturbing riparian alder/willow roots, and verify marine-limit elevations on topo maps."
        )

    return {
        "sensitivity_ratio_st": float(sensitivity_ratio_st),
        "pore_salinity_g_per_l": float(pore_salinity_g_per_l),
        "ravine_slope_angle_deg": float(ravine_slope_angle_deg),
        "stream_toe_erosion_rate_cm_yr": float(stream_toe_erosion_rate_cm_yr),
        "rainfall_saturation_pct": float(rainfall_saturation_pct),
        "retrogressive_liquefaction_risk_pct": retrogressive_liquefaction_risk_pct,
        "retrogression_runout_distance_m": retrogression_runout_distance_m,
        "remolded_shear_strength_kpa": remolded_shear_strength_kpa,
        "safe_crown_setback_distance_m": safe_crown_setback_distance_m,
        "risk_level": risk_level,
        "safety_status": safety_status,
        "terrace_strategy": terrace_strategy,
        "crossing_strategy": terrace_strategy,
        "warnings": warnings,
        "recommendations": recommendations,
    }


_STRONG_QUICK_CLAY_TERRACE_KEYWORDS: tuple[str, ...] = (
    "quick clay",
    "quick-clay",
    "quick_clay",
    "quick-clay-terrace",
    "quick_clay_terrace",
    "kvikkleire",
    "kvikkleireskred",
    "gryteskred",
    "tørrskorpeleire",
    "torrskorpeleire",
    "leda clay",
    "leda-clay",
    "champlain sea clay",
    "champlain sea leda",
    "laflamme sea",
    "tyrrell sea clay",
    "gauldalen",
    "rissa landslide",
    "rissa kvikkleire",
    "trondheimsfjord kvikkleire",
    "gjerdrum",
    "romerike",
    "lemieux",
    "south nation river",
    "saint-jean-vianney",
    "st-jean-vianney",
    "rivière aux vases",
    "riviere aux vases",
    "retrogressive slump",
    "retrogressive flow-slide",
    "retrogressive flow slide",
    "bottleneck landslide",
    "bottleneck slump",
    "glaciomarine clay",
    "glaciomarine terrace",
    "marine-terrace ravine",
    "marine terrace ravine",
    "remolded shear strength",
)

_CONTEXT_QUICK_CLAY_TERMS: tuple[str, ...] = (
    "marine limit",
    "marine-limit",
    "pore salinity",
    "salt-leached",
    "salt leached",
    "sensitivity ratio",
    "crown setback",
    "ravine slope",
    "toe erosion",
    "champlain sea",
    "saguenay",
    "trondheimsfjord",
)

_ADJACENT_DOMAIN_EXCLUSIONS: tuple[str, ...] = (
    "wadden sea",
    "wattwandern",
    "neuwerk",
    "prielen",
    "prikken",
    "quicksilt",
    "bay of fundy",
    "mont-saint-michel",
    "morecambe bay",
    "turnagain arm",
    "skeidararsandur",
    "skeiðarársandur",
    "kaskawulsh",
    "rakaia braids",
    "rock-flour quicksand",
    "glacial flour quicksand",
    "batagaika",
    "tuktoyaktuk",
    "bykovsky",
    "noatak",
    "ice-wedge polygon",
    "ice wedge polygon",
    "retrogressive thaw",
    "thaw slump",
    "thaw-slump",
    "yedoma",
    "viiankiaapa",
    "tavvavuoma",
    "sutton ridges",
    "pasvik",
    "flark",
    "palsa",
    "aapa mire",
    "soomaa",
    "räätsad",
    "raatsad",
    "ombrotrophic",
    "dungeness spit",
    "chesil beach",
    "farewell spit",
    "cape perpetua",
    "sabellariid",
    "barnacle ledge",
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


def is_quick_clay_terrace_query(query: str) -> bool:
    """Return True if the user query specifically targets coastal fjord quick-clay marine-terrace & retrogressive slump navigation."""
    if not query or not query.strip():
        return False
    q = query.lower()

    if any(excl in q for excl in _ADJACENT_DOMAIN_EXCLUSIONS) and not any(
        kw in q
        for kw in (
            "quick clay",
            "quick-clay",
            "kvikkleire",
            "leda clay",
            "leda-clay",
            "gauldalen",
            "gjerdrum",
            "romerike",
            "lemieux",
            "saint-jean-vianney",
            "laflamme sea",
        )
    ):
        return False

    if any(kw in q for kw in _STRONG_QUICK_CLAY_TERRACE_KEYWORDS):
        return True

    context_hits = sum(1 for term in _CONTEXT_QUICK_CLAY_TERMS if term in q)
    if context_hits >= 2:
        return True

    if ("marine limit" in q or "glaciomarine" in q or "champlain sea" in q) and any(
        w in q
        for w in (
            "clay",
            "terrace",
            "ravine",
            "slump",
            "scarp",
            "salinity",
            "setback",
            "liquefaction",
        )
    ):
        return True

    return False


def detect_quick_clay_terrace_intent(query: str) -> bool:
    """Alias for is_quick_clay_terrace_query used across main.py and chat_request.py."""
    return is_quick_clay_terrace_query(query)


def _match_site_from_query(query: str) -> QuickClayTerraceSite:
    q = query.lower()
    if any(
        w in q
        for w in (
            "romerike",
            "gjerdrum",
            "nittedal",
            "ullensaker",
            "leira",
            "nitelva",
            "akershus",
            "fjord-delta-subaqueous-scarp",
        )
    ):
        return QUICK_CLAY_TERRACE_SITES[1]
    if any(
        w in q
        for w in (
            "south nation",
            "lemieux",
            "leda clay",
            "leda-clay",
            "champlain sea",
            "ontario",
            "ottawa valley",
            "prescott",
        )
    ):
        return QUICK_CLAY_TERRACE_SITES[2]
    if any(
        w in q
        for w in (
            "saguenay",
            "saint-jean-vianney",
            "st-jean-vianney",
            "laflamme",
            "rivière aux vases",
            "riviere aux vases",
            "shipshaw",
            "quebec",
            "tyrrell",
        )
    ):
        return QUICK_CLAY_TERRACE_SITES[3]
    return QUICK_CLAY_TERRACE_SITES[0]


def extract_quick_clay_terrace_params(query: str) -> dict[str, Any]:
    """Extract numerical calculator parameters from a natural-language query."""
    matched_site = _match_site_from_query(query)
    params: dict[str, Any] = {
        "sensitivity_ratio_st": float(matched_site["default_sensitivity_ratio_st"]),
        "pore_salinity_g_per_l": float(matched_site["default_pore_salinity_g_per_l"]),
        "ravine_slope_angle_deg": float(
            matched_site["default_ravine_slope_angle_deg"]
        ),
        "stream_toe_erosion_rate_cm_yr": float(
            matched_site["default_stream_toe_erosion_rate_cm_yr"]
        ),
        "rainfall_saturation_pct": float(
            matched_site["default_rainfall_saturation_pct"]
        ),
    }

    q = query.lower()

    m_st = (
        re.search(
            r"(?:sensitivity(?:\s+ratio)?(?:\s+st)?|\bst)\s*(?:=|of|at|is)?\s*(\d+(?:\.\d+)?)",
            q,
        )
        or re.search(
            r"(\d+(?:\.\d+)?)\s*(?:sensitivity(?:\s+ratio)?)",
            q,
        )
    )
    if m_st:
        val = float(m_st.group(1))
        params["sensitivity_ratio_st"] = min(300.0, max(10.0, val))

    m_sal = (
        re.search(
            r"(\d+(?:\.\d+)?)\s*g\s*/\s*l\b",
            q,
        )
        or re.search(
            r"(?:salinity|pore salinity)[^\d]{0,20}(\d+(?:\.\d+)?)\s*(?:g/l|g per l)?",
            q,
        )
    )
    if m_sal:
        val = float(m_sal.group(1))
        params["pore_salinity_g_per_l"] = min(15.0, max(0.1, val))

    m_slope = (
        re.search(
            r"(\d+(?:\.\d+)?)\s*(?:deg|degrees|°)\s*(?:ravine|slope|scarp|bluff|bank|angle)?",
            q,
        )
        or re.search(
            r"(?:ravine slope|slope angle|scarp angle)[^\d]{0,20}(\d+(?:\.\d+)?)\s*(?:deg|degrees|°)?",
            q,
        )
    )
    if m_slope:
        val = float(m_slope.group(1))
        params["ravine_slope_angle_deg"] = min(45.0, max(5.0, val))

    m_erosion = (
        re.search(
            r"(\d+(?:\.\d+)?)\s*cm\s*/\s*(?:yr|year)\b",
            q,
        )
        or re.search(
            r"(?:toe erosion|erosion rate)[^\d]{0,20}(\d+(?:\.\d+)?)\s*cm",
            q,
        )
    )
    if m_erosion:
        val = float(m_erosion.group(1))
        params["stream_toe_erosion_rate_cm_yr"] = min(150.0, max(0.0, val))

    m_rain = (
        re.search(
            r"(\d+(?:\.\d+)?)\s*%\s*(?:rainfall|saturation|pore saturation|soil saturation)",
            q,
        )
        or re.search(
            r"(?:rainfall saturation|saturation)[^\d]{0,20}(\d+(?:\.\d+)?)\s*%",
            q,
        )
    )
    if m_rain:
        val = float(m_rain.group(1))
        params["rainfall_saturation_pct"] = min(100.0, max(0.0, val))

    return params


def format_quick_clay_terrace_response(query: str) -> dict[str, Any]:
    """Build a structured domain response dictionary for chat and streaming endpoints."""
    matched_site = _match_site_from_query(query)
    params = extract_quick_clay_terrace_params(query)
    calc_info: dict[str, Any] = calculate_quick_clay_terrace(
        sensitivity_ratio_st=params["sensitivity_ratio_st"],
        pore_salinity_g_per_l=params["pore_salinity_g_per_l"],
        ravine_slope_angle_deg=params["ravine_slope_angle_deg"],
        stream_toe_erosion_rate_cm_yr=params["stream_toe_erosion_rate_cm_yr"],
        rainfall_saturation_pct=params["rainfall_saturation_pct"],
    )

    summary = (
        f"**Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Assessment — "
        f"{matched_site['name']} ({matched_site['country']})**\n\n"
        f"- **Deposit Type**: `{matched_site['deposit_type']}` | **Risk Level**: `{calc_info['risk_level'].upper()}`\n"
        f"- **Retrogressive Liquefaction Risk**: `{calc_info['retrogressive_liquefaction_risk_pct']}%` "
        f"(Sensitivity St={params['sensitivity_ratio_st']}, pore salinity={params['pore_salinity_g_per_l']} g/L)\n"
        f"- **Remolded Shear Strength (Cu_r)**: `{calc_info['remolded_shear_strength_kpa']} kPa` "
        f"(quick-clay liquefaction threshold < 0.50 kPa)\n"
        f"- **Retrogression Runout Distance**: `{calc_info['retrogression_runout_distance_m']} m` "
        f"({params['ravine_slope_angle_deg']}° ravine slope, {params['stream_toe_erosion_rate_cm_yr']} cm/yr toe erosion)\n"
        f"- **Safe Crown Setback Distance**: `{calc_info['safe_crown_setback_distance_m']} m` "
        f"(1:15 retrogression envelope at {params['rainfall_saturation_pct']}% saturation)\n"
        f"- **Terrace Navigation Strategy**: {calc_info['terrace_strategy']}\n"
        f"- **Conservation Protocol**: {matched_site['conservation_protocol']}"
    )

    return {
        "domain": "quick_clay_terrace",
        "action": "quick_clay_terrace_info",
        "query": query,
        "matched_site": dict(matched_site),
        "sites": [dict(s) for s in QUICK_CLAY_TERRACE_SITES],
        "calculation": calc_info,
        "gear_checklist": get_gear_checklist(),
        "summary": summary,
        "answer": summary,
    }


def build_quick_clay_terrace_prompt(info_or_query: dict[str, Any] | str) -> str:
    """Build system prompt context for LLM augmentation on quick-clay marine-terrace queries."""
    info: dict[str, Any] = (
        format_quick_clay_terrace_response(info_or_query)
        if isinstance(info_or_query, str)
        else info_or_query
    )
    site = info["matched_site"]
    calc = info["calculation"]
    return (
        "### Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Navigation Context\n"
        f"Matched Reference Site: {site['name']} ({site['country']}, {site['region']})\n"
        f"Deposit Type: {site['deposit_type']} | Difficulty: {site['difficulty']}\n"
        f"Calculated Risk Level: {calc['risk_level']} ({calc['safety_status']})\n"
        f"Metrics: Retrogressive Liquefaction Risk={calc['retrogressive_liquefaction_risk_pct']}%, "
        f"Remolded Shear Strength={calc['remolded_shear_strength_kpa']} kPa, "
        f"Retrogression Runout Distance={calc['retrogression_runout_distance_m']} m, "
        f"Safe Crown Setback Distance={calc['safe_crown_setback_distance_m']} m.\n"
        f"Terrace Strategy: {calc['terrace_strategy']}\n"
        f"Site Conservation Protocol: {site['conservation_protocol']}\n"
    )


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a full synchronous chat response payload for quick-clay terrace intent."""
    info: dict[str, Any] = format_quick_clay_terrace_response(query)
    return {
        "answer": info["summary"],
        "context": [site["name"] for site in QUICK_CLAY_TERRACE_SITES],
        "quick_clay_terrace_info": info,
    }


def generate_stream_events(query: str) -> Iterator[dict[str, Any]]:
    """Yield SSE event dictionaries for streaming quick-clay terrace responses."""
    info: dict[str, Any] = format_quick_clay_terrace_response(query)
    yield {
        "event": "quick_clay_terrace_info",
        "data": info,
        "quick_clay_terrace_info": info,
    }
    yield {
        "event": "message",
        "answer": info["summary"],
        "context": [site["name"] for site in QUICK_CLAY_TERRACE_SITES],
        "quick_clay_terrace_info": info,
    }
