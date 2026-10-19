"""Subarctic River Aufeis (Icings) & Overflow Ice Sheet Crossing Domain Module.

Provides domain logic, curated subarctic aufeis/naled corridor catalogs,
mandatory ice-sounding and slush-waterproofing gear checklists, upper crust
bearing safety, pressurized slush breakthrough, ski/boot ice accretion, and
hollow cavity vault collapse calculations, intent detection, and response
formatting for subarctic river aufeis and overflow ice sheet crossing queries.
"""

import re
from typing import Any, Literal, Optional

AufeisMorphologyType = Literal[
    "braided_gravel_bar_sheet_icing",
    "pressurized_groundwater_frost_blister",
    "perennial_tundra_spring_naled",
    "canyon_confinement_stepped_overflow",
    "rotten_candle_ice_ablation_apron",
]

OverflowHydrologyState = Literal[
    "vitreous_dry_cryolock",
    "active_sheet_overflow_film",
    "pressurized_sub_crust_slush_lens",
    "hollow_drained_air_cavity_vault",
]

TraversalModeType = Literal[
    "nordic_backcountry_ski_glide",
    "articulated_crampon_snowshoe",
    "boot_microspike_pulk_tow",
    "belayed_ice_screw_probe_team",
]

AufeisSafetyStatus = Literal[
    "nominal_cryolocked_laminar_sheet",
    "caution_overflow_slush_accretion_hazard",
    "abort_pressurized_lens_or_cavity_collapse",
]

VALID_MORPHOLOGIES: set[str] = {
    "braided_gravel_bar_sheet_icing",
    "pressurized_groundwater_frost_blister",
    "perennial_tundra_spring_naled",
    "canyon_confinement_stepped_overflow",
    "rotten_candle_ice_ablation_apron",
}

VALID_OVERFLOW_STATES: set[str] = {
    "vitreous_dry_cryolock",
    "active_sheet_overflow_film",
    "pressurized_sub_crust_slush_lens",
    "hollow_drained_air_cavity_vault",
}

VALID_TRAVERSAL_MODES: set[str] = {
    "nordic_backcountry_ski_glide",
    "articulated_crampon_snowshoe",
    "boot_microspike_pulk_tow",
    "belayed_ice_screw_probe_team",
}


class _AttrDict(dict[str, Any]):
    """Dictionary supporting both key and attribute access plus model_dump()."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc

    def model_dump(self) -> dict[str, Any]:
        return dict(self)


AUFEIS_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "canning-river-shublik-springs-aufeis",
            "name": "Canning River & Shublik Springs Perennial Aufeis Field",
            "region": "Brooks Range, Arctic National Wildlife Refuge, Alaska, USA",
            "elevation": 420,
            "elevation_m": 420,
            "morphology": "perennial_tundra_spring_naled",
            "overflow_state": "vitreous_dry_cryolock",
            "traversal_mode": "nordic_backcountry_ski_glide",
            "mean_upper_crust_thickness_cm": 26.0,
            "slush_water_lens_depth_cm": 8.0,
            "hydrostatic_head_kpa": 12.0,
            "typical_cavity_span_m": 0.6,
            "primary_hazard": (
                "Perennial carbonate-spring discharge feeding multi-meter laminated icing terraces "
                "with localized peripheral overflow films along the Shublik Mountains fault line."
            ),
            "high_bench_bypass_route": (
                "Hold the elevated east-bank tundra gravel terrace above Shublik Springs canyon "
                "whenever thermal upwellings wet the main braided channel apron."
            ),
            "field_notes": (
                "Thick vitreous cryolocked strata support rapid Nordic backcountry ski glide under deep "
                "mid-winter cold, but probe stained yellow-ochre spring vents before committing pulk loads."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "firth-river-joe-creek-naled-corridor",
            "name": "Firth River & Joe Creek Braided Naled Sheet",
            "region": "Ivvavik National Park, Yukon, Canada",
            "elevation": 360,
            "elevation_m": 360,
            "morphology": "braided_gravel_bar_sheet_icing",
            "overflow_state": "active_sheet_overflow_film",
            "traversal_mode": "articulated_crampon_snowshoe",
            "mean_upper_crust_thickness_cm": 15.0,
            "slush_water_lens_depth_cm": 28.0,
            "hydrostatic_head_kpa": 24.0,
            "typical_cavity_span_m": 1.4,
            "primary_hazard": (
                "Shallow sub-permafrost channel constriction forcing thin laminar overflow sheets "
                "across braided gravel bars that flash-freeze onto ski bases and snowshoe decks."
            ),
            "high_bench_bypass_route": (
                "Exit active overflow channels onto willow-lined alluvial fans on the north bank "
                "near Joe Creek confluence until surface films refreeze."
            ),
            "field_notes": (
                "Articulated crampon snowshoes distribute foot pressure across 15 cm crusts while "
                "maintaining bite on glazed icing domes; scrape ski and pulk runners immediately after wet crossings."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "delta-river-black-rapids-overflow-sheet",
            "name": "Delta River & Castner Creek Glacial-Spring Overflow Corridor",
            "region": "Eastern Alaska Range, Alaska, USA",
            "elevation": 690,
            "elevation_m": 690,
            "morphology": "canyon_confinement_stepped_overflow",
            "overflow_state": "pressurized_sub_crust_slush_lens",
            "traversal_mode": "boot_microspike_pulk_tow",
            "mean_upper_crust_thickness_cm": 11.0,
            "slush_water_lens_depth_cm": 45.0,
            "hydrostatic_head_kpa": 42.0,
            "typical_cavity_span_m": 2.2,
            "primary_hazard": (
                "Deep pressurized sub-crust slush lenses (45 cm) trapped beneath thin wind-glazed "
                "crusts where glacial tributaries join the wind-scoured Delta River corridor."
            ),
            "high_bench_bypass_route": (
                "Traverse lateral moraine benches along the Richardson corridor east flank rather "
                "than cutting directly across stepped overflow basins below Castner Creek."
            ),
            "field_notes": (
                "Punching through an 11 cm crust into 45 cm of knee-deep supercooled slush at -25°C "
                "encases boots in solid ice within 90 seconds; wear vapor-barrier neoprene overboots."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "moma-valley-ulakhan-taryn-giant-naled",
            "name": "Moma River Valley Ulakhan-Taryn Great Naled",
            "region": "Chersky Range, Sakha Republic, Siberia",
            "elevation": 510,
            "elevation_m": 510,
            "morphology": "perennial_tundra_spring_naled",
            "overflow_state": "vitreous_dry_cryolock",
            "traversal_mode": "nordic_backcountry_ski_glide",
            "mean_upper_crust_thickness_cm": 34.0,
            "slush_water_lens_depth_cm": 6.0,
            "hydrostatic_head_kpa": 10.0,
            "typical_cavity_span_m": 0.5,
            "primary_hazard": (
                "Continental-scale sub-permafrost tectonic fault springs creating a 26 km long, "
                "multi-layered blue-ice naled dome with thermal contraction cracks and marginal upwellings."
            ),
            "high_bench_bypass_route": (
                "Follow larch-taiga river terraces along the western Moma graben margin when crossing "
                "active central fracture domes."
            ),
            "field_notes": (
                "At -40°C the central 34 cm vitreous ice sheet is rock-solid and fast for expedition "
                "skis, though brittle thermal tension fractures require steady chisel-bar sounding."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "macmillan-pass-hess-river-frost-blister",
            "name": "Hess River & Macmillan Pass Pressurized Frost-Blister Crossing",
            "region": "Mackenzie Mountains, Yukon/NWT, Canada",
            "elevation": 1280,
            "elevation_m": 1280,
            "morphology": "pressurized_groundwater_frost_blister",
            "overflow_state": "hollow_drained_air_cavity_vault",
            "traversal_mode": "belayed_ice_screw_probe_team",
            "mean_upper_crust_thickness_cm": 7.0,
            "slush_water_lens_depth_cm": 68.0,
            "hydrostatic_head_kpa": 68.0,
            "typical_cavity_span_m": 4.2,
            "primary_hazard": (
                "Up-warped hydrostatic frost blisters and drained 4.2 m air-cavity ice vaults "
                "with 7 cm unsupported shell roofs prone to catastrophic flexural collapse."
            ),
            "high_bench_bypass_route": (
                "Abort valley-bottom icing transit and contour high along dwarf-birch talus toes "
                "15–30 m above the pressurized frost-blister field."
            ),
            "field_notes": (
                "Hollow booming acoustics under the sounding bar indicate drained sub-ice vaults or "
                "high-head artesian lenses; never cross frost-blister apices unroped or with a heavy pulk."
            ),
        }
    ),
]


AUFEIS_GEAR_CHECKLIST: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "graduated-chisel-tip-ice-sounding-bar",
            "name": "Graduated Chisel-Tip Steel/Carbon Ice-Sounding Bar (1.7 m)",
            "category": "ice_sounding",
            "mandatory": True,
            "rationale": (
                "Delivers high-energy acoustic blows 1.5 m ahead of the lead traveler to differentiate "
                "solid laminated blue aufeis from hollow air-cavity vaults and thin crusts over pressurized slush."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "vapor-barrier-neoprene-insulated-overboots",
            "name": "Closed-Cell Neoprene & butyl Vapor-Barrier Slush Overboots (Knee-High)",
            "category": "slush_waterproofing",
            "mandatory": True,
            "rationale": (
                "Prevents supercooled overflow water and pressurized sub-crust slush from saturating "
                "leather/fabric ski boots and freezing solid into a frostbite cast upon re-emerging into subzero air."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "ptfe-fluoropolymer-ski-base-anti-ice-scraper",
            "name": "Beveled PTFE / Stainless Ski-Base & Pulk-Runner De-Icing Scraper + Fluoropolymer Paste",
            "category": "accretion_defense",
            "mandatory": True,
            "rationale": (
                "Shears off flash-frozen overflow ice plates accumulated on ski bases, climbing skins, and "
                "pulk runners immediately after wet naled crossings before bonding becomes irreversible."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "retractable-dual-ice-awls-and-throw-bag",
            "name": "Chest-Mounted Retractable Dual Ice Awls (Ispiggar) & 20 m Floating Throw-Line",
            "category": "self_extraction",
            "mandatory": True,
            "rationale": (
                "Provides immediate high-purchase traction on wet vitreous overflow sheets to haul oneself "
                "out of deep slush trenches or collapsed frost-blister vaults."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "tubular-22cm-express-ice-screws-and-v-threader",
            "name": "Tubular 22 cm Express Ice Screws (x2) & Abalakov V-Thread Hook",
            "category": "ice_sounding",
            "mandatory": True,
            "rationale": (
                "Functions both as a core sampler to verify upper crust lamination thickness and free water "
                "depth and as an emergency belay/haul anchor on steep stepped canyon icings."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "sealed-drybag-pulk-hull-and-floating-tow-tether",
            "name": "Watertight Roll-Top Pulk Liner & Quick-Release Floating Dyneema Tow Tether",
            "category": "slush_waterproofing",
            "mandatory": True,
            "rationale": (
                "Keeps sleeping bags and survival electronics dry when a pulk submerges in a 50 cm overflow "
                "slush trough and allows instant load jettisoning if a cavity vault collapses."
            ),
        }
    ),
]


def get_all_aufeis_sites() -> list[dict[str, Any]]:
    """Return all curated subarctic river aufeis and overflow ice sheet sites."""
    return list(AUFEIS_SITES)


def get_aufeis_site_by_id(site_id: str) -> Optional[dict[str, Any]]:
    """Return a single aufeis site by ID, or None if not found."""
    normalized = site_id.strip().lower()
    for site in AUFEIS_SITES:
        if site["id"] == normalized:
            return site
    return None


def filter_aufeis_sites(
    morphology: str | None = None,
    overflow_state: str | None = None,
    traversal_mode: str | None = None,
) -> list[dict[str, Any]]:
    """Filter curated aufeis sites by morphology, overflow_state, and/or traversal_mode.

    Raises ValueError if any supplied filter value is not in the valid domain literal set.
    """
    if morphology is not None and morphology not in VALID_MORPHOLOGIES:
        raise ValueError(
            f"Invalid morphology '{morphology}'. Must be one of {sorted(VALID_MORPHOLOGIES)}."
        )
    if overflow_state is not None and overflow_state not in VALID_OVERFLOW_STATES:
        raise ValueError(
            f"Invalid overflow_state '{overflow_state}'. Must be one of {sorted(VALID_OVERFLOW_STATES)}."
        )
    if traversal_mode is not None and traversal_mode not in VALID_TRAVERSAL_MODES:
        raise ValueError(
            f"Invalid traversal_mode '{traversal_mode}'. Must be one of {sorted(VALID_TRAVERSAL_MODES)}."
        )

    results = list(AUFEIS_SITES)
    if morphology is not None:
        results = [s for s in results if s["morphology"] == morphology]
    if overflow_state is not None:
        results = [s for s in results if s["overflow_state"] == overflow_state]
    if traversal_mode is not None:
        results = [s for s in results if s["traversal_mode"] == traversal_mode]
    return results


def get_aufeis_gear_checklist() -> list[dict[str, Any]]:
    """Return the mandatory 6-item subarctic aufeis and overflow crossing gear checklist."""
    return list(AUFEIS_GEAR_CHECKLIST)


def calculate_aufeis_crossing_safety(
    morphology: str = "perennial_tundra_spring_naled",
    overflow_state: str = "vitreous_dry_cryolock",
    traversal_mode: str = "nordic_backcountry_ski_glide",
    upper_crust_thickness_cm: float = 26.0,
    slush_water_lens_depth_cm: float = 8.0,
    ambient_air_temp_c: float = -22.0,
    hydrostatic_head_kpa: float = 12.0,
    traveler_plus_pulk_load_kg: float = 95.0,
    cavity_span_m: float = 0.6,
) -> dict[str, Any]:
    """Calculate subarctic aufeis crust bearing margin, slush breakthrough, ice accretion, and cavity collapse risk."""
    if morphology not in VALID_MORPHOLOGIES:
        raise ValueError(
            f"Invalid morphology '{morphology}'. Must be one of {sorted(VALID_MORPHOLOGIES)}."
        )
    if overflow_state not in VALID_OVERFLOW_STATES:
        raise ValueError(
            f"Invalid overflow_state '{overflow_state}'. Must be one of {sorted(VALID_OVERFLOW_STATES)}."
        )
    if traversal_mode not in VALID_TRAVERSAL_MODES:
        raise ValueError(
            f"Invalid traversal_mode '{traversal_mode}'. Must be one of {sorted(VALID_TRAVERSAL_MODES)}."
        )
    if not (1.0 <= upper_crust_thickness_cm <= 150.0):
        raise ValueError(
            f"upper_crust_thickness_cm ({upper_crust_thickness_cm}) must be between 1.0 and 150.0 cm."
        )
    if not (0.0 <= slush_water_lens_depth_cm <= 250.0):
        raise ValueError(
            f"slush_water_lens_depth_cm ({slush_water_lens_depth_cm}) must be between 0.0 and 250.0 cm."
        )
    if not (-55.0 <= ambient_air_temp_c <= 15.0):
        raise ValueError(
            f"ambient_air_temp_c ({ambient_air_temp_c}) must be between -55.0 and 15.0 °C."
        )
    if not (0.0 <= hydrostatic_head_kpa <= 150.0):
        raise ValueError(
            f"hydrostatic_head_kpa ({hydrostatic_head_kpa}) must be between 0.0 and 150.0 kPa."
        )
    if not (30.0 <= traveler_plus_pulk_load_kg <= 250.0):
        raise ValueError(
            f"traveler_plus_pulk_load_kg ({traveler_plus_pulk_load_kg}) must be between 30.0 and 250.0 kg."
        )
    if not (0.0 <= cavity_span_m <= 15.0):
        raise ValueError(
            f"cavity_span_m ({cavity_span_m}) must be between 0.0 and 15.0 m."
        )

    morphology_strength_map: dict[str, float] = {
        "perennial_tundra_spring_naled": 1.32,
        "braided_gravel_bar_sheet_icing": 1.08,
        "canyon_confinement_stepped_overflow": 0.90,
        "pressurized_groundwater_frost_blister": 0.62,
        "rotten_candle_ice_ablation_apron": 0.48,
    }
    overflow_support_map: dict[str, float] = {
        "vitreous_dry_cryolock": 1.25,
        "active_sheet_overflow_film": 0.95,
        "pressurized_sub_crust_slush_lens": 0.72,
        "hollow_drained_air_cavity_vault": 0.52,
    }
    footprint_factor_map: dict[str, float] = {
        "nordic_backcountry_ski_glide": 1.30,
        "articulated_crampon_snowshoe": 1.15,
        "belayed_ice_screw_probe_team": 1.05,
        "boot_microspike_pulk_tow": 0.85,
    }

    # Thermal cryolock factor: colder subzero air strengthens upper crust; above -2C softens rapidly
    if ambient_air_temp_c <= -15.0:
        thermal_factor = 1.15
    elif ambient_air_temp_c <= -5.0:
        thermal_factor = 1.0
    elif ambient_air_temp_c <= 0.0:
        thermal_factor = 0.78
    else:
        thermal_factor = max(0.35, 0.70 - ambient_air_temp_c * 0.025)

    # Load and span penalty
    load_norm = 100.0 / max(30.0, traveler_plus_pulk_load_kg)
    span_penalty = 1.0 / (1.0 + max(0.0, cavity_span_m - 0.8) * 0.20)
    head_penalty = 1.0 / (1.0 + max(0.0, hydrostatic_head_kpa - 18.0) * 0.008)

    raw_bearing_margin = (
        (upper_crust_thickness_cm / 11.5)
        * morphology_strength_map[morphology]
        * overflow_support_map[overflow_state]
        * footprint_factor_map[traversal_mode]
        * thermal_factor
        * load_norm
        * span_penalty
        * head_penalty
    )
    effective_crust_bearing_margin = round(max(0.08, min(6.5, raw_bearing_margin)), 2)

    # Slush breakthrough probability (0.01 to 0.99)
    lens_pressure_boost = (
        (slush_water_lens_depth_cm / 160.0) * 0.18
        + (hydrostatic_head_kpa / 140.0) * 0.20
    )
    raw_breakthrough = (
        1.0 / (1.0 + (effective_crust_bearing_margin**2.2))
    ) + lens_pressure_boost
    if (
        effective_crust_bearing_margin >= 1.75
        and slush_water_lens_depth_cm <= 15.0
        and hydrostatic_head_kpa <= 18.0
    ):
        raw_breakthrough = min(raw_breakthrough, 0.16)
    slush_breakthrough_probability = round(max(0.01, min(0.99, raw_breakthrough)), 3)

    # Ski & boot ice accretion rate (mm/min) when liquid overflow or slush meets subzero air
    wetness_factor_map: dict[str, float] = {
        "vitreous_dry_cryolock": 0.12,
        "hollow_drained_air_cavity_vault": 0.35,
        "pressurized_sub_crust_slush_lens": 0.85,
        "active_sheet_overflow_film": 1.15,
    }
    subzero_delta = max(0.0, -ambient_air_temp_c)
    lens_moisture = min(1.5, 0.3 + (slush_water_lens_depth_cm / 45.0))
    if ambient_air_temp_c >= 0.5:
        raw_accretion = 0.05
    else:
        raw_accretion = (
            wetness_factor_map[overflow_state]
            * (0.25 + (subzero_delta / 12.0))
            * lens_moisture
        )
    ski_boot_ice_accretion_rate_mm_min = round(max(0.05, min(12.0, raw_accretion)), 2)

    # Cavity vault collapse risk percent (1.0 to 99.0)
    morphology_vault_hazard: dict[str, float] = {
        "perennial_tundra_spring_naled": 6.0,
        "braided_gravel_bar_sheet_icing": 12.0,
        "canyon_confinement_stepped_overflow": 22.0,
        "rotten_candle_ice_ablation_apron": 34.0,
        "pressurized_groundwater_frost_blister": 38.0,
    }
    state_vault_hazard: dict[str, float] = {
        "vitreous_dry_cryolock": 2.0,
        "active_sheet_overflow_film": 8.0,
        "pressurized_sub_crust_slush_lens": 18.0,
        "hollow_drained_air_cavity_vault": 32.0,
    }
    span_risk = (cavity_span_m / 4.5) * 28.0
    thin_crust_risk = max(0.0, (22.0 - upper_crust_thickness_cm) * 1.45)
    head_upwarp_risk = (hydrostatic_head_kpa / 80.0) * 18.0
    load_stress_risk = max(0.0, (traveler_plus_pulk_load_kg - 80.0) * 0.12)

    raw_collapse_pct = (
        morphology_vault_hazard[morphology]
        + state_vault_hazard[overflow_state]
        + span_risk
        + thin_crust_risk
        + head_upwarp_risk
        + load_stress_risk
        - min(18.0, max(0.0, upper_crust_thickness_cm - 20.0) * 0.85)
    )
    cavity_vault_collapse_risk_percent = round(
        max(1.0, min(99.0, raw_collapse_pct)), 1
    )

    # Determine safety status
    safety_status: AufeisSafetyStatus
    if (
        effective_crust_bearing_margin < 0.85
        or slush_breakthrough_probability >= 0.62
        or cavity_vault_collapse_risk_percent >= 62.0
        or upper_crust_thickness_cm < 9.0
        or hydrostatic_head_kpa >= 55.0
        or cavity_span_m >= 3.2
    ):
        safety_status = "abort_pressurized_lens_or_cavity_collapse"
    elif (
        effective_crust_bearing_margin < 1.65
        or slush_breakthrough_probability >= 0.25
        or cavity_vault_collapse_risk_percent >= 28.0
        or ski_boot_ice_accretion_rate_mm_min >= 1.5
        or overflow_state in ("active_sheet_overflow_film", "pressurized_sub_crust_slush_lens")
        or morphology == "rotten_candle_ice_ablation_apron"
    ):
        safety_status = "caution_overflow_slush_accretion_hazard"
    else:
        safety_status = "nominal_cryolocked_laminar_sheet"

    if safety_status == "abort_pressurized_lens_or_cavity_collapse":
        overflow_routing_protocol = (
            "EMERGENCY ABORT — HIGH-BENCH TERRACE BYPASS: Do not enter the active frost-blister or "
            f"hollow cavity vault corridor (collapse risk {cavity_vault_collapse_risk_percent}%, "
            f"crust thickness {upper_crust_thickness_cm:.1f} cm, hydrostatic head {hydrostatic_head_kpa:.1f} kPa). "
            "Retreat immediately to elevated alluvial gravel benches or bedrock canyon margins."
        )
        slush_extraction_and_deicing_advisory = (
            "CRITICAL BREAKTHROUGH & FLASH-FREEZE HAZARD: Punching through into pressurized sub-crust water "
            f"({slush_water_lens_depth_cm:.1f} cm depth at {ambient_air_temp_c:.1f}°C) causes rapid pulk flooding "
            f"and {ski_boot_ice_accretion_rate_mm_min:.2f} mm/min ice accretion. Rig 22 cm express ice-screw belays "
            "and unclip pulk waist harnesses before retreating."
        )
    elif safety_status == "caution_overflow_slush_accretion_hazard":
        overflow_routing_protocol = (
            "CAUTION — PERIPHERAL LAMINAR ROUTING: Sound every 2 m with a graduated chisel-tip bar "
            f"(bearing margin {effective_crust_bearing_margin}, breakthrough probability {slush_breakthrough_probability:.1%}). "
            "Avoid yellow-stained spring upwelling domes and distribute weight with articulated crampon snowshoes or wide skis."
        )
        slush_extraction_and_deicing_advisory = (
            "SLUSH WATERPROOFING & DE-ICING PROTOCOL: Wear knee-high vapor-barrier neoprene overboots and "
            "keep quick-release floating pulk tether armed. Upon exiting wet overflow films, immediately scrape "
            f"ski bases and pulk runners with a PTFE bevel scraper (accretion rate {ski_boot_ice_accretion_rate_mm_min:.2f} mm/min) "
            "and stride through dry snow to blot moisture."
        )
    else:
        overflow_routing_protocol = (
            "NOMINAL CRYOLOCKED LAMINAR TRANSIT: Upper icing crust is structurally sound and cryolocked "
            f"(bearing margin {effective_crust_bearing_margin}, thickness {upper_crust_thickness_cm:.1f} cm). "
            "Maintain steady spacing along pale-blue laminated main-channel benches while sounding dark fracture lines."
        )
        slush_extraction_and_deicing_advisory = (
            "Keep chest-mounted retractable ice awls accessible and PTFE ski scraper in outer parka pocket. "
            f"Ice accretion rate is low ({ski_boot_ice_accretion_rate_mm_min:.2f} mm/min); inspect pulk runners "
            "at regular rest halts for localized seepage glaze."
        )

    return _AttrDict(
        {
            "morphology": morphology,
            "overflow_state": overflow_state,
            "traversal_mode": traversal_mode,
            "upper_crust_thickness_cm": round(upper_crust_thickness_cm, 1),
            "slush_water_lens_depth_cm": round(slush_water_lens_depth_cm, 1),
            "ambient_air_temp_c": round(ambient_air_temp_c, 1),
            "hydrostatic_head_kpa": round(hydrostatic_head_kpa, 1),
            "traveler_plus_pulk_load_kg": round(traveler_plus_pulk_load_kg, 1),
            "cavity_span_m": round(cavity_span_m, 2),
            "effective_crust_bearing_margin": effective_crust_bearing_margin,
            "slush_breakthrough_probability": slush_breakthrough_probability,
            "ski_boot_ice_accretion_rate_mm_min": ski_boot_ice_accretion_rate_mm_min,
            "cavity_vault_collapse_risk_percent": cavity_vault_collapse_risk_percent,
            "safety_status": safety_status,
            "overflow_routing_protocol": overflow_routing_protocol,
            "slush_extraction_and_deicing_advisory": slush_extraction_and_deicing_advisory,
        }
    )


_AUFEIS_KEYWORDS: tuple[str, ...] = (
    "aufeis",
    "naled",
    "naleds",
    "overflow ice",
    "frost blister",
    "frost-blister",
    "icing sheet",
    "river icing",
    "subarctic icing",
    "ulakhan-taryn",
    "ulakhan taryn",
    "candle ice",
    "shublik springs",
    "canning river",
    "firth river",
    "joe creek",
    "black rapids overflow",
    "castner creek",
    "moma valley",
    "macmillan pass",
    "hess river",
    "slush lens",
    "sounding bar",
    "cryolock",
    "cryolocked",
)


def is_aufeis_crossing_query(query: str) -> bool:
    """Return True if the user query pertains to subarctic river aufeis / naled / overflow ice crossing."""
    if not query or not query.strip():
        return False
    q = query.lower()

    if any(
        ex in q
        for ex in (
            "glaciere",
            "glacière",
            "ice-filled lava tube",
            "cold-trap",
            "cold trap",
            "balch effect",
            "eisriesenwelt",
            "scarisoara",
            "scărișoara",
            "bandera ice cave",
            "lofthellir",
            "hoarfrost ceiling",
        )
    ):
        return False

    if any(kw in q for kw in _AUFEIS_KEYWORDS):
        return True

    has_overflow_context = any(
        term in q
        for term in (
            "subarctic river",
            "arctic river",
            "braided river ice",
            "pressurized groundwater",
            "permafrost spring",
            "overflow slush",
        )
    )
    has_crossing_hazard = any(
        term in q
        for term in (
            "crust",
            "slush",
            "overboot",
            "accretion",
            "cavity",
            "blister",
            "sounding",
            "breakthrough",
        )
    )
    return has_overflow_context and has_crossing_hazard


detect_aufeis_crossing_intent = is_aufeis_crossing_query


def extract_aufeis_crossing_params(query: str) -> dict[str, Any]:
    """Extract site_id, morphology, overflow_state, traversal_mode, and numerical parameters from query."""
    q = query.lower()
    params: dict[str, Any] = {
        "site_id": None,
        "morphology": "perennial_tundra_spring_naled",
        "overflow_state": "vitreous_dry_cryolock",
        "traversal_mode": "nordic_backcountry_ski_glide",
        "upper_crust_thickness_cm": 26.0,
        "slush_water_lens_depth_cm": 8.0,
        "ambient_air_temp_c": -22.0,
        "hydrostatic_head_kpa": 12.0,
        "traveler_plus_pulk_load_kg": 95.0,
        "cavity_span_m": 0.6,
        "has_explicit_numbers": False,
        "is_calculation": False,
    }

    site_patterns: list[tuple[tuple[str, ...], str]] = [
        (
            ("canning river", "shublik", "brooks range", "anwr"),
            "canning-river-shublik-springs-aufeis",
        ),
        (
            ("firth river", "joe creek", "ivvavik"),
            "firth-river-joe-creek-naled-corridor",
        ),
        (
            ("delta river", "black rapids", "castner creek"),
            "delta-river-black-rapids-overflow-sheet",
        ),
        (
            ("moma", "ulakhan-taryn", "ulakhan taryn", "chersky", "sakha"),
            "moma-valley-ulakhan-taryn-giant-naled",
        ),
        (
            ("macmillan pass", "hess river", "mackenzie mountains"),
            "macmillan-pass-hess-river-frost-blister",
        ),
    ]
    for aliases, site_id in site_patterns:
        if site_id in q or any(alias in q for alias in aliases):
            params["site_id"] = site_id
            site = get_aufeis_site_by_id(site_id)
            if site is not None:
                params["morphology"] = site["morphology"]
                params["overflow_state"] = site["overflow_state"]
                params["traversal_mode"] = site["traversal_mode"]
                params["upper_crust_thickness_cm"] = site["mean_upper_crust_thickness_cm"]
                params["slush_water_lens_depth_cm"] = site["slush_water_lens_depth_cm"]
                params["hydrostatic_head_kpa"] = site["hydrostatic_head_kpa"]
                params["cavity_span_m"] = site["typical_cavity_span_m"]
            break

    # Override morphology if explicitly mentioned
    if (
        "pressurized_groundwater_frost_blister" in q
        or "frost blister" in q
        or "frost-blister" in q
    ):
        params["morphology"] = "pressurized_groundwater_frost_blister"
    elif "braided_gravel_bar_sheet_icing" in q or "braided gravel" in q:
        params["morphology"] = "braided_gravel_bar_sheet_icing"
    elif "canyon_confinement_stepped_overflow" in q or "stepped overflow" in q:
        params["morphology"] = "canyon_confinement_stepped_overflow"
    elif "rotten_candle_ice_ablation_apron" in q or "candle ice" in q:
        params["morphology"] = "rotten_candle_ice_ablation_apron"
    elif "perennial_tundra_spring_naled" in q or "spring naled" in q:
        params["morphology"] = "perennial_tundra_spring_naled"

    # Override overflow_state if explicitly mentioned
    if "hollow_drained_air_cavity_vault" in q or "cavity vault" in q or "hollow" in q:
        params["overflow_state"] = "hollow_drained_air_cavity_vault"
    elif "pressurized_sub_crust_slush_lens" in q or "slush lens" in q:
        params["overflow_state"] = "pressurized_sub_crust_slush_lens"
    elif "active_sheet_overflow_film" in q or "overflow film" in q:
        params["overflow_state"] = "active_sheet_overflow_film"
    elif "vitreous_dry_cryolock" in q or "cryolock" in q:
        params["overflow_state"] = "vitreous_dry_cryolock"

    # Override traversal_mode if explicitly mentioned
    if "belayed_ice_screw_probe_team" in q or "belayed" in q:
        params["traversal_mode"] = "belayed_ice_screw_probe_team"
    elif "boot_microspike_pulk_tow" in q or "microspike" in q:
        params["traversal_mode"] = "boot_microspike_pulk_tow"
    elif "articulated_crampon_snowshoe" in q or "snowshoe" in q:
        params["traversal_mode"] = "articulated_crampon_snowshoe"
    elif "nordic_backcountry_ski_glide" in q or "ski glide" in q:
        params["traversal_mode"] = "nordic_backcountry_ski_glide"

    # Extract upper crust thickness (cm)
    crust_match = re.search(
        r"(?:crust(?:\s+thickness)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*cm|(\d+(?:\.\d+)?)\s*cm\s+(?:upper\s+)?crust)",
        q,
    )
    if crust_match:
        val = float(crust_match.group(1) or crust_match.group(2))
        params["upper_crust_thickness_cm"] = max(1.0, min(150.0, val))
        params["has_explicit_numbers"] = True

    # Extract slush water lens depth (cm)
    slush_match = re.search(
        r"(?:(?:slush|lens|water)(?:\s+lens)?(?:\s+depth)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*cm|(\d+(?:\.\d+)?)\s*cm\s+(?:slush|lens))",
        q,
    )
    if slush_match:
        val = float(slush_match.group(1) or slush_match.group(2))
        params["slush_water_lens_depth_cm"] = max(0.0, min(250.0, val))
        params["has_explicit_numbers"] = True

    # Extract ambient air temperature (°C)
    temp_match = re.search(r"(-?\d+(?:\.\d+)?)\s*°?\s*c\b", q)
    if temp_match:
        params["ambient_air_temp_c"] = max(
            -55.0, min(15.0, float(temp_match.group(1)))
        )
        params["has_explicit_numbers"] = True

    # Extract hydrostatic head (kPa)
    head_match = re.search(
        r"(?:(?:hydrostatic\s+)?head(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*kpa|(\d+(?:\.\d+)?)\s*kpa)",
        q,
    )
    if head_match:
        val = float(head_match.group(1) or head_match.group(2))
        params["hydrostatic_head_kpa"] = max(0.0, min(150.0, val))
        params["has_explicit_numbers"] = True

    # Extract traveler + pulk load (kg)
    load_match = re.search(
        r"(?:load(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*kg|(\d+(?:\.\d+)?)\s*kg)",
        q,
    )
    if load_match:
        val = float(load_match.group(1) or load_match.group(2))
        params["traveler_plus_pulk_load_kg"] = max(30.0, min(250.0, val))
        params["has_explicit_numbers"] = True

    # Extract cavity span (m)
    span_match = re.search(
        r"(?:(?:cavity\s+)?span(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*m|(\d+(?:\.\d+)?)\s*m\s+(?:cavity|vault|span))",
        q,
    )
    if span_match:
        val = float(span_match.group(1) or span_match.group(2))
        params["cavity_span_m"] = max(0.0, min(15.0, val))
        params["has_explicit_numbers"] = True

    calc_triggers = (
        "calculate",
        "evaluate",
        "assess",
        "bearing margin",
        "breakthrough",
        "accretion rate",
        "collapse risk",
        "kpa",
    )
    params["is_calculation"] = bool(params["has_explicit_numbers"]) or any(
        t in q for t in calc_triggers
    )

    return params


def format_aufeis_crossing_response(query: str) -> tuple[str, dict[str, Any]]:
    """Format a structured markdown answer and info dictionary for aufeis crossing queries."""
    params = extract_aufeis_crossing_params(query)
    is_calc = bool(params["is_calculation"])

    if is_calc:
        calc_result = calculate_aufeis_crossing_safety(
            morphology=params["morphology"],
            overflow_state=params["overflow_state"],
            traversal_mode=params["traversal_mode"],
            upper_crust_thickness_cm=float(params["upper_crust_thickness_cm"]),
            slush_water_lens_depth_cm=float(params["slush_water_lens_depth_cm"]),
            ambient_air_temp_c=float(params["ambient_air_temp_c"]),
            hydrostatic_head_kpa=float(params["hydrostatic_head_kpa"]),
            traveler_plus_pulk_load_kg=float(params["traveler_plus_pulk_load_kg"]),
            cavity_span_m=float(params["cavity_span_m"]),
        )
        gear_list = [dict(g) for g in get_aufeis_gear_checklist()]
        calc_info: dict[str, Any] = {
            **dict(calc_result),
            "action": "aufeis_crossing_calculated",
            "calculation": dict(calc_result),
            "gear_checklist": gear_list,
        }
        if params["site_id"]:
            matched_site = get_aufeis_site_by_id(str(params["site_id"]))
            if matched_site is not None:
                calc_info["site"] = dict(matched_site)

        answer = (
            "### Subarctic River Aufeis & Overflow Ice Sheet Crossing Assessment\n\n"
            f"- **Safety Status:** `{calc_result['safety_status']}`\n"
            f"- **Effective Crust Bearing Margin:** `{calc_result['effective_crust_bearing_margin']}` "
            f"(`{calc_result['morphology']}`, {calc_result['upper_crust_thickness_cm']} cm upper crust, "
            f"{calc_result['traveler_plus_pulk_load_kg']} kg load)\n"
            f"- **Slush Breakthrough Probability:** `{calc_result['slush_breakthrough_probability']:.1%}` "
            f"(lens depth `{calc_result['slush_water_lens_depth_cm']} cm`, head `{calc_result['hydrostatic_head_kpa']} kPa`)\n"
            f"- **Ski & Boot Ice Accretion Rate:** `{calc_result['ski_boot_ice_accretion_rate_mm_min']} mm/min` "
            f"(air temp `{calc_result['ambient_air_temp_c']}°C`, state `{calc_result['overflow_state']}`)\n"
            f"- **Cavity Vault Collapse Risk:** `{calc_result['cavity_vault_collapse_risk_percent']}%` "
            f"(cavity span `{calc_result['cavity_span_m']} m`)\n\n"
            f"**Overflow Routing Protocol:** {calc_result['overflow_routing_protocol']}\n\n"
            f"**Slush Extraction & De-Icing Advisory:** {calc_result['slush_extraction_and_deicing_advisory']}"
        )
        return answer, calc_info

    if params["site_id"]:
        site = get_aufeis_site_by_id(str(params["site_id"]))
        if site is not None:
            site_calc = calculate_aufeis_crossing_safety(
                morphology=site["morphology"],
                overflow_state=site["overflow_state"],
                traversal_mode=site["traversal_mode"],
                upper_crust_thickness_cm=float(site["mean_upper_crust_thickness_cm"]),
                slush_water_lens_depth_cm=float(site["slush_water_lens_depth_cm"]),
                ambient_air_temp_c=-20.0,
                hydrostatic_head_kpa=float(site["hydrostatic_head_kpa"]),
                traveler_plus_pulk_load_kg=100.0,
                cavity_span_m=float(site["typical_cavity_span_m"]),
            )
            lookup_info: dict[str, Any] = {
                "action": "aufeis_crossing_lookup",
                "site": dict(site),
                "baseline_calculation": dict(site_calc),
                "gear_checklist": [dict(g) for g in get_aufeis_gear_checklist()],
            }
            answer = (
                f"### {site['name']} ({site['region']})\n\n"
                f"- **Site ID:** `{site['id']}` (Elevation: {site['elevation_m']} m)\n"
                f"- **Aufeis Morphology:** `{site['morphology']}` "
                f"(Mean Upper Crust: {site['mean_upper_crust_thickness_cm']} cm, Cavity Span: {site['typical_cavity_span_m']} m)\n"
                f"- **Overflow Hydrology State:** `{site['overflow_state']}` "
                f"(Slush Lens Depth: {site['slush_water_lens_depth_cm']} cm, Hydrostatic Head: {site['hydrostatic_head_kpa']} kPa)\n"
                f"- **Recommended Traversal Mode:** `{site['traversal_mode']}`\n"
                f"- **Primary Hazard:** {site['primary_hazard']}\n"
                f"- **High-Bench Bypass Route:** {site['high_bench_bypass_route']}\n"
                f"- **Field Notes:** {site['field_notes']}"
            )
            return answer, lookup_info

    sites_list = [dict(s) for s in get_all_aufeis_sites()]
    gear_list = [dict(g) for g in get_aufeis_gear_checklist()]
    general_info: dict[str, Any] = {
        "action": "aufeis_crossing_info",
        "sites": sites_list,
        "gear_checklist": gear_list,
    }
    site_bullets = "\n".join(
        f"- **{s['name']}** (`{s['id']}`, {s['region']}): `{s['morphology']}` / `{s['overflow_state']}`"
        for s in sites_list
    )
    gear_bullets = "\n".join(
        f"- **{g['name']}** (`{g['category']}`): {g['rationale']}"
        for g in gear_list
    )
    answer = (
        "### Subarctic River Aufeis (Icings) & Overflow Ice Sheet Crossing Guide\n\n"
        "Crossing subarctic river aufeis (naleds), pressurized groundwater frost blisters, and stepped "
        "overflow sheets requires continuous acoustic sounding with a graduated chisel bar, knee-high "
        "vapor-barrier slush waterproofing, and immediate PTFE ski/pulk base de-icing.\n\n"
        "#### Curated Subarctic Aufeis & Naled Reference Corridors\n"
        f"{site_bullets}\n\n"
        "#### Mandatory 6-Item Aufeis & Overflow Crossing Gear Checklist\n"
        f"{gear_bullets}"
    )
    return answer, general_info


def build_aufeis_crossing_prompt(query: str = "") -> str:
    """Build system prompt context for LLM augmentation on subarctic aufeis crossing topics."""
    answer, _ = format_aufeis_crossing_response(query)
    return (
        "You are an expert cryosphere hydrologist and Subarctic River Aufeis (Naled) & Overflow Ice Sheet Crossing specialist. "
        "Use the following subarctic aufeis and overflow crossing telemetry to answer the user's question:\n\n"
        f"{answer}"
    )
