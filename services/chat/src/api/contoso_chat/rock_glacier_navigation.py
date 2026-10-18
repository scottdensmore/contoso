"""High-Alpine Talus & Boulder-Field Periglacial Rock-Glacier Navigation Domain Module.

Provides domain logic, curated high-alpine periglacial rock-glacier and boulder-field catalogs,
mandatory ankle/tibial armor and block-stabilization gear checklists, block rotational stability,
perched-block tip probability, sub-carapace void entrapment risk, and effective horizontal pace
calculations, intent detection, and response formatting for periglacial rock-glacier navigation queries.
"""

import re
from typing import Any, Literal, Optional

RockGlacierMorphologyType = Literal[
    "active_lobate_ice_cored_carapace",
    "tongue_shaped_interstitial_ice_matrix",
    "oversteepened_frontal_talus_apron",
    "thermokarst_furrow_and_ridge_labyrinth",
    "relict_collapsed_boulder_blockfield",
]

InterstitialIceState = Literal[
    "cryo_cemented_permafrost_lock",
    "seasonal_active_layer_thaw_lubrication",
    "basal_meltwater_piping_undercut",
    "isothermal_debris_creep_slump",
]

CarapaceTraversalTechnique = Literal[
    "compression_ridge_crest_hopping",
    "diagonal_furrow_trough_contouring",
    "three_point_imbricated_slab_stepping",
    "belayed_frontal_scarp_switchbacking",
]

RockGlacierSafetyStatus = Literal[
    "nominal_cryo_cemented_carapace",
    "caution_perched_block_and_void_hazard",
    "abort_oversteepened_scarp_or_thaw_rotation",
]

VALID_MORPHOLOGY_TYPES: set[str] = {
    "active_lobate_ice_cored_carapace",
    "tongue_shaped_interstitial_ice_matrix",
    "oversteepened_frontal_talus_apron",
    "thermokarst_furrow_and_ridge_labyrinth",
    "relict_collapsed_boulder_blockfield",
}

VALID_ICE_STATES: set[str] = {
    "cryo_cemented_permafrost_lock",
    "seasonal_active_layer_thaw_lubrication",
    "basal_meltwater_piping_undercut",
    "isothermal_debris_creep_slump",
}

VALID_TECHNIQUES: set[str] = {
    "compression_ridge_crest_hopping",
    "diagonal_furrow_trough_contouring",
    "three_point_imbricated_slab_stepping",
    "belayed_frontal_scarp_switchbacking",
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


ROCK_GLACIER_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "sourdough-peak-mccarthy-creek-rock-glacier",
            "name": "Sourdough Peak & McCarthy Creek Lobate Rock Glacier",
            "region": "Wrangell-St. Elias National Park, Alaska, USA",
            "elevation": 1720,
            "elevation_m": 1720,
            "morphology": "active_lobate_ice_cored_carapace",
            "ice_state": "cryo_cemented_permafrost_lock",
            "technique": "compression_ridge_crest_hopping",
            "mean_block_diameter_cm": 75.0,
            "slope_angle_deg": 21.0,
            "active_layer_thaw_depth_cm": 65.0,
            "interstitial_void_ratio_percent": 22.0,
            "primary_hazard": (
                "Sub-carapace acoustic meltwater voids between angular Nikolai greenstone blocks and "
                "oversteepened 38-degree lateral margins shedding loose clasts during afternoon solar warming."
            ),
            "carapace_escape_protocol": (
                "Stay atop consolidated transverse compression-ridge crests along the central lobe axis and "
                "exit laterally onto stable vegetated tundra benches before reaching the steep frontal scarp."
            ),
            "field_notes": (
                "Massive ice-cored lobate rock glacier descending from Sourdough Peak; shallow 65 cm active layer "
                "keeps underlying angular blocks firmly cryo-cemented through early summer."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "mount-mendenhall-san-juan-imbricated-tongue",
            "name": "Mount Mendenhall & Imogene Basin Tongue-Shaped Rock Glacier",
            "region": "San Juan Mountains, Colorado, USA",
            "elevation": 3780,
            "elevation_m": 3780,
            "morphology": "tongue_shaped_interstitial_ice_matrix",
            "ice_state": "seasonal_active_layer_thaw_lubrication",
            "technique": "three_point_imbricated_slab_stepping",
            "mean_block_diameter_cm": 92.0,
            "slope_angle_deg": 27.0,
            "active_layer_thaw_depth_cm": 125.0,
            "interstitial_void_ratio_percent": 31.0,
            "primary_hazard": (
                "Perched tabular volcanic tuff-breccia slabs (92 cm mean) that pivot unpredictably when "
                "midday active-layer thaw lubricates interstitial ice-rich silt lenses at 1.25 m depth."
            ),
            "carapace_escape_protocol": (
                "Test every imbricated slab with a fixed chromoly staff before committing full pack weight and "
                "contour onto the bedrock rib flanking Upper Imogene Basin if audible sub-boulder trickle increases."
            ),
            "field_notes": (
                "Classic San Juan tongue-shaped rock glacier exhibiting pronounced longitudinal flow furrows and "
                "arcuate transverse ridges; never remove pole baskets' snag hazard—use basketless tips only."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "muragl-upper-engadine-permafrost-carapace",
            "name": "Val Muragl & Murtèl-Corvatsch Permafrost Rock Glacier",
            "region": "Upper Engadine, Graubünden, Switzerland",
            "elevation": 2680,
            "elevation_m": 2680,
            "morphology": "thermokarst_furrow_and_ridge_labyrinth",
            "ice_state": "basal_meltwater_piping_undercut",
            "technique": "diagonal_furrow_trough_contouring",
            "mean_block_diameter_cm": 84.0,
            "slope_angle_deg": 25.0,
            "active_layer_thaw_depth_cm": 145.0,
            "interstitial_void_ratio_percent": 35.0,
            "primary_hazard": (
                "Deep thermokarst depression pits, basal meltwater piping undercuts, and 35% open sub-carapace "
                "void ratios between coarse gneissic boulders across accelerating alpine permafrost lobes."
            ),
            "carapace_escape_protocol": (
                "Navigate diagonally along stable ridge shoulders above water-filled thermokarst furrows and "
                "avoid crossing undercut meltwater exit portals at the lower Val Muragl tongue."
            ),
            "field_notes": (
                "Extensively instrumented Swiss alpine permafrost benchmark site; warming permafrost has deepened "
                "the active boulder mantle to 145 cm, increasing rotational block instability in late August."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "dos-lenguas-agua-negra-andean-cryolith-lobe",
            "name": "Glaciar de Escombros Dos Lenguas, Paso de Agua Negra",
            "region": "San Juan Andes, Argentina",
            "elevation": 4450,
            "elevation_m": 4450,
            "morphology": "oversteepened_frontal_talus_apron",
            "ice_state": "isothermal_debris_creep_slump",
            "technique": "belayed_frontal_scarp_switchbacking",
            "mean_block_diameter_cm": 68.0,
            "slope_angle_deg": 39.0,
            "active_layer_thaw_depth_cm": 210.0,
            "interstitial_void_ratio_percent": 42.0,
            "primary_hazard": (
                "Oversteepened 39-degree frontal and lateral talus aprons at the angle of repose, deep 210 cm "
                "isothermal active-layer creep, and spontaneous boulder avalanches triggered by foot-traffic shear."
            ),
            "carapace_escape_protocol": (
                "Do not ascend the central oversteepened frontal scarp unroped; bypass via the stable lateral "
                "bedrock gully or use belayed switchbacks with zero vertical party stacking."
            ),
            "field_notes": (
                "High-Andean cryolithogenic bifurcated rock glacier ('Dos Lenguas') at 4,450 m; extreme arid solar "
                "insolation creates a deep 2.1 m unconsolidated boulder carapace with 42% interstitial void space."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "nesters-ridge-wheeler-peak-quartzite-blockfield",
            "name": "Wheeler Peak Cirque & Lehman Quartzite Active Rock Glacier",
            "region": "Great Basin National Park, Nevada, USA",
            "elevation": 3410,
            "elevation_m": 3410,
            "morphology": "relict_collapsed_boulder_blockfield",
            "ice_state": "cryo_cemented_permafrost_lock",
            "technique": "three_point_imbricated_slab_stepping",
            "mean_block_diameter_cm": 110.0,
            "slope_angle_deg": 19.0,
            "active_layer_thaw_depth_cm": 80.0,
            "interstitial_void_ratio_percent": 24.0,
            "primary_hazard": (
                "Massive 1.1 m angular Prospect Mountain quartzite monoliths concealing deep leg-snapping "
                "cavernous gaps and slick lichen-crusted block faces in shaded cirque alcoves."
            ),
            "carapace_escape_protocol": (
                "Maintain three points of contact across large interlocking quartzite blocks and retreat to "
                "the Wheeler Peak Glacier moraine crest trail if high winds or verglas coat the blockfield."
            ),
            "field_notes": (
                "Southernmost active/transitional rock glacier and quartzite felsenmeer blockfield in the Great Basin; "
                "cold cirque shading preserves interstitial ice cement below 80 cm depth."
            ),
        }
    ),
]


ROCK_GLACIER_GEAR_CHECKLIST: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "stiff-shank-vibram-megagrip-mountaineering-boots",
            "name": "Full-Shank TPU/Carbon Mountaineering Boots with Vibram Megagrip Edging Soles & 360° Rubber Rand",
            "category": "ankle_tibial_armor",
            "mandatory": True,
            "rationale": (
                "Prevents torsional ankle inversion on sharp boulder edges and shields malleoli from crushing "
                "pinch impacts when wedging between shifting periglacial rock-glacier blocks."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "kevlar-reinforced-nitrile-palm-boulder-gloves",
            "name": "Kevlar-Stitched Goat-Leather & Nitrile-Palm Scrambling Gloves",
            "category": "block_stabilization",
            "mandatory": True,
            "rationale": (
                "Protects palms and knuckles from razor-sharp quartzite, gneiss, and volcanic breccia crystals "
                "during continuous three-point slab balancing and hand-checking of perched boulders."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "fixed-section-chromoly-scrambling-staff-no-baskets",
            "name": "Fixed-Section Chromoly/7075-Alu Scrambling Staff with Carbide Tip (Baskets Removed)",
            "category": "block_stabilization",
            "mandatory": True,
            "rationale": (
                "Tests rotational stability of suspect perched slabs before weight transfer; removing snow/scree "
                "baskets is mandatory so pole tips never jam or snap in narrow interstitial boulder crevices."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "uiia-certified-rockfall-and-impact-climbing-helmet",
            "name": "UIAA 106 / EN 12492 Hybrid-Shell Rockfall & Lateral-Impact Mountaineering Helmet",
            "category": "ankle_tibial_armor",
            "mandatory": True,
            "rationale": (
                "Defends against spontaneous clast shedding from oversteepened 35–40° rock-glacier frontal scarps "
                "and cranial impact during a rotational boulder tip-out."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "high-collar-ballistic-nylon-talus-gaiters",
            "name": "1000D Ballistic Nylon High-Collar Talus Gaiters with Closed-Cell Tibial Shin Guards",
            "category": "void_entrapment_defense",
            "mandatory": True,
            "rationale": (
                "Armors the anterior tibia against laceration and periosteal bruising when a foot punches into "
                "concealed sub-carapace voids between angular rock-glacier blocks."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "compact-dyneema-cord-and-pulley-block-extrication-kit",
            "name": "Compact 6 mm Dyneema Cord, Micro-Traxion & 3:1 Z-Rig Boulder-Pinch Extrication Kit",
            "category": "void_entrapment_defense",
            "mandatory": True,
            "rationale": (
                "Provides immediate 3:1 or 5:1 mechanical advantage to lever or shift a rotated 150–400 kg "
                "periglacial block off an entrapped boot or lower leg."
            ),
        }
    ),
]


def get_all_rock_glacier_sites() -> list[dict[str, Any]]:
    """Return all curated high-alpine talus & periglacial rock-glacier navigation sites."""
    return list(ROCK_GLACIER_SITES)


def get_rock_glacier_site_by_id(site_id: str) -> Optional[dict[str, Any]]:
    """Return a single rock-glacier site by ID, or None if not found."""
    normalized = site_id.strip().lower()
    for site in ROCK_GLACIER_SITES:
        if site["id"] == normalized:
            return site
    return None


def filter_rock_glacier_sites(
    morphology: str | None = None,
    ice_state: str | None = None,
    technique: str | None = None,
) -> list[dict[str, Any]]:
    """Filter curated rock-glacier sites by morphology, ice_state, and/or technique.

    Raises ValueError if any supplied filter value is not in the valid domain literal set.
    """
    if morphology is not None and morphology not in VALID_MORPHOLOGY_TYPES:
        raise ValueError(
            f"Invalid morphology '{morphology}'. Must be one of {sorted(VALID_MORPHOLOGY_TYPES)}."
        )
    if ice_state is not None and ice_state not in VALID_ICE_STATES:
        raise ValueError(
            f"Invalid ice_state '{ice_state}'. Must be one of {sorted(VALID_ICE_STATES)}."
        )
    if technique is not None and technique not in VALID_TECHNIQUES:
        raise ValueError(
            f"Invalid technique '{technique}'. Must be one of {sorted(VALID_TECHNIQUES)}."
        )

    results = list(ROCK_GLACIER_SITES)
    if morphology is not None:
        results = [s for s in results if s["morphology"] == morphology]
    if ice_state is not None:
        results = [s for s in results if s["ice_state"] == ice_state]
    if technique is not None:
        results = [s for s in results if s["technique"] == technique]
    return results


def get_rock_glacier_gear_checklist() -> list[dict[str, Any]]:
    """Return the mandatory 6-item periglacial rock-glacier navigation gear checklist."""
    return list(ROCK_GLACIER_GEAR_CHECKLIST)


def calculate_rock_glacier_navigation_safety(
    morphology: str = "active_lobate_ice_cored_carapace",
    ice_state: str = "cryo_cemented_permafrost_lock",
    technique: str = "compression_ridge_crest_hopping",
    mean_block_diameter_cm: float = 75.0,
    slope_angle_deg: float = 21.0,
    active_layer_thaw_depth_cm: float = 65.0,
    interstitial_void_ratio_percent: float = 22.0,
    ambient_air_temp_c: float = -2.0,
    pack_weight_kg: float = 14.0,
) -> dict[str, Any]:
    """Calculate block rotational stability index, perched block tip probability,
    sub-carapace void entrapment risk percent, and effective horizontal pace across rock glaciers.
    """
    if morphology not in VALID_MORPHOLOGY_TYPES:
        raise ValueError(
            f"Invalid morphology '{morphology}'. Must be one of {sorted(VALID_MORPHOLOGY_TYPES)}."
        )
    if ice_state not in VALID_ICE_STATES:
        raise ValueError(
            f"Invalid ice_state '{ice_state}'. Must be one of {sorted(VALID_ICE_STATES)}."
        )
    if technique not in VALID_TECHNIQUES:
        raise ValueError(
            f"Invalid technique '{technique}'. Must be one of {sorted(VALID_TECHNIQUES)}."
        )
    if not (15.0 <= mean_block_diameter_cm <= 300.0):
        raise ValueError(
            f"mean_block_diameter_cm ({mean_block_diameter_cm}) must be between 15.0 and 300.0 cm."
        )
    if not (5.0 <= slope_angle_deg <= 55.0):
        raise ValueError(
            f"slope_angle_deg ({slope_angle_deg}) must be between 5.0 and 55.0 deg."
        )
    if not (10.0 <= active_layer_thaw_depth_cm <= 400.0):
        raise ValueError(
            f"active_layer_thaw_depth_cm ({active_layer_thaw_depth_cm}) must be between 10.0 and 400.0 cm."
        )
    if not (5.0 <= interstitial_void_ratio_percent <= 65.0):
        raise ValueError(
            f"interstitial_void_ratio_percent ({interstitial_void_ratio_percent}) must be between 5.0 and 65.0%."
        )
    if not (-35.0 <= ambient_air_temp_c <= 35.0):
        raise ValueError(
            f"ambient_air_temp_c ({ambient_air_temp_c}) must be between -35.0 and 35.0 °C."
        )
    if not (0.0 <= pack_weight_kg <= 50.0):
        raise ValueError(
            f"pack_weight_kg ({pack_weight_kg}) must be between 0.0 and 50.0 kg."
        )

    morphology_factor_map: dict[str, float] = {
        "relict_collapsed_boulder_blockfield": 1.28,
        "active_lobate_ice_cored_carapace": 1.22,
        "tongue_shaped_interstitial_ice_matrix": 1.08,
        "thermokarst_furrow_and_ridge_labyrinth": 0.96,
        "oversteepened_frontal_talus_apron": 0.52,
    }
    ice_state_factor_map: dict[str, float] = {
        "cryo_cemented_permafrost_lock": 1.32,
        "seasonal_active_layer_thaw_lubrication": 1.04,
        "basal_meltwater_piping_undercut": 0.88,
        "isothermal_debris_creep_slump": 0.48,
    }
    technique_factor_map: dict[str, float] = {
        "three_point_imbricated_slab_stepping": 1.18,
        "compression_ridge_crest_hopping": 1.15,
        "diagonal_furrow_trough_contouring": 1.08,
        "belayed_frontal_scarp_switchbacking": 0.96,
    }

    # Block rotational inertia increases with block diameter; steep slopes and deep thaw reduce stability
    block_size_factor = (mean_block_diameter_cm / 75.0) ** 0.45
    slope_stability_factor = max(0.32, 1.55 - (slope_angle_deg / 48.0))
    thaw_stability_factor = max(
        0.40, 1.32 - (active_layer_thaw_depth_cm / 340.0)
    )
    thermal_factor = (
        1.10
        if ambient_air_temp_c <= 0.0
        else max(0.68, 1.0 - (ambient_air_temp_c * 0.012))
    )
    pack_penalty_factor = max(0.75, 1.06 - (pack_weight_kg * 0.008))

    raw_stability = (
        1.35
        * morphology_factor_map[morphology]
        * ice_state_factor_map[ice_state]
        * technique_factor_map[technique]
        * block_size_factor
        * slope_stability_factor
        * thaw_stability_factor
        * thermal_factor
        * pack_penalty_factor
    )
    block_rotational_stability_index = round(
        max(0.12, min(5.0, raw_stability)), 2
    )

    # Perched block tip probability (0.01 to 0.99)
    slope_excess = max(0.0, (slope_angle_deg - 24.0) / 45.0)
    thaw_lubrication_penalty = (
        0.14
        if ice_state
        in (
            "seasonal_active_layer_thaw_lubrication",
            "isothermal_debris_creep_slump",
        )
        else 0.0
    )
    raw_tip_prob = (
        1.0 / (1.0 + (block_rotational_stability_index**2.15))
        + slope_excess
        + thaw_lubrication_penalty
    )
    if (
        block_rotational_stability_index >= 1.80
        and slope_angle_deg <= 23.0
        and ice_state == "cryo_cemented_permafrost_lock"
    ):
        raw_tip_prob = min(raw_tip_prob, 0.16)
    perched_block_tip_probability = round(
        max(0.01, min(0.99, raw_tip_prob)), 3
    )

    # Sub-carapace void entrapment risk percent (2.0 to 98.0%)
    piping_bonus = (
        11.0 if ice_state == "basal_meltwater_piping_undercut" else 0.0
    )
    labyrinth_bonus = (
        8.0 if morphology == "thermokarst_furrow_and_ridge_labyrinth" else 0.0
    )
    raw_void_risk = (
        (interstitial_void_ratio_percent * 0.72)
        + (active_layer_thaw_depth_cm * 0.055)
        + (pack_weight_kg * 0.25)
        + piping_bonus
        + labyrinth_bonus
        - (block_rotational_stability_index * 4.2)
    )
    sub_carapace_void_entrapment_risk_percent = round(
        max(2.0, min(98.0, raw_void_risk)), 1
    )

    # Effective horizontal pace (m/hr)
    base_pace_map: dict[str, float] = {
        "compression_ridge_crest_hopping": 460.0,
        "diagonal_furrow_trough_contouring": 410.0,
        "three_point_imbricated_slab_stepping": 360.0,
        "belayed_frontal_scarp_switchbacking": 195.0,
    }
    slope_pace_multiplier = max(0.35, 1.18 - (slope_angle_deg / 52.0))
    void_pace_multiplier = max(
        0.45, 1.12 - (interstitial_void_ratio_percent / 85.0)
    )
    pack_pace_multiplier = max(0.60, 1.05 - (pack_weight_kg / 95.0))
    raw_pace = (
        base_pace_map[technique]
        * slope_pace_multiplier
        * void_pace_multiplier
        * pack_pace_multiplier
    )
    effective_horizontal_pace_mhr = round(max(60.0, min(900.0, raw_pace)), 1)

    # Classify RockGlacierSafetyStatus
    safety_status: RockGlacierSafetyStatus
    if (
        block_rotational_stability_index < 0.85
        or perched_block_tip_probability >= 0.58
        or sub_carapace_void_entrapment_risk_percent >= 52.0
        or slope_angle_deg >= 36.0
        or active_layer_thaw_depth_cm >= 195.0
        or morphology == "oversteepened_frontal_talus_apron"
        or ice_state == "isothermal_debris_creep_slump"
    ):
        safety_status = "abort_oversteepened_scarp_or_thaw_rotation"
    elif (
        block_rotational_stability_index < 1.70
        or perched_block_tip_probability >= 0.22
        or sub_carapace_void_entrapment_risk_percent >= 26.0
        or slope_angle_deg >= 25.0
        or active_layer_thaw_depth_cm >= 110.0
        or ambient_air_temp_c >= 6.0
        or ice_state
        in (
            "seasonal_active_layer_thaw_lubrication",
            "basal_meltwater_piping_undercut",
        )
        or morphology == "thermokarst_furrow_and_ridge_labyrinth"
    ):
        safety_status = "caution_perched_block_and_void_hazard"
    else:
        safety_status = "nominal_cryo_cemented_carapace"

    if safety_status == "abort_oversteepened_scarp_or_thaw_rotation":
        carapace_routing_protocol = (
            "EMERGENCY ABORT — OVERSTEEPENED FRONTAL SCARP & THAW-SLUMP HAZARD: Do not traverse or ascend "
            f"the active boulder apron (block stability index {block_rotational_stability_index}, tip probability "
            f"{perched_block_tip_probability:.1%}, slope {slope_angle_deg:.1f}°, thaw depth "
            f"{active_layer_thaw_depth_cm:.0f} cm). Retreat immediately onto flanking bedrock ribs or stable "
            "tundra moraine benches with zero vertical stacking between party members."
        )
        tibial_entrapment_and_rockfall_advisory = (
            f"CRITICAL VOID & CRUSHING ROCKFALL RISK ({sub_carapace_void_entrapment_risk_percent:.1f}% void "
            "entrapment risk): Isothermal active-layer thaw lubricates basal ice-silt matrices, causing multi-ton "
            "boulders to rotate under body weight. Keep UIAA helmets strapped, stow basketed trekking poles, and "
            "keep the 3:1 Dyneema block-extrication pulley kit accessible at the top of the pack."
        )
    elif safety_status == "caution_perched_block_and_void_hazard":
        carapace_routing_protocol = (
            "CAUTION — THREE-POINT IMBRICATED SLAB & FURROW CONTOURING PROTOCOL: Moderate active-layer thaw "
            f"({active_layer_thaw_depth_cm:.0f} cm) and {interstitial_void_ratio_percent:.0f}% interstitial voids "
            f"yield a block stability index of {block_rotational_stability_index} (tip probability "
            f"{perched_block_tip_probability:.1%}, pace {effective_horizontal_pace_mhr:.0f} m/hr). Contour along "
            "compression ridge crests, probe suspect tabular slabs with a basketless chromoly staff, and maintain "
            "diagonal 15 m spacing across slope lines."
        )
        tibial_entrapment_and_rockfall_advisory = (
            f"ELEVATED TIBIAL VOID HAZARD ({sub_carapace_void_entrapment_risk_percent:.1f}% entrapment risk): "
            "Listen for sub-carapace meltwater piping before stepping across dark boulder gaps. Wear full-shank "
            "mountaineering boots, 1000D ballistic tibial gaiters, and Kevlar-palm boulder gloves for continuous "
            "three-point stabilization."
        )
    else:
        carapace_routing_protocol = (
            "NOMINAL CRYO-CEMENTED CARAPACE CORRIDOR: Interlocking periglacial blocks are solidly locked by "
            f"interstitial permafrost cement (block stability index {block_rotational_stability_index}, tip "
            f"probability {perched_block_tip_probability:.1%}, effective pace {effective_horizontal_pace_mhr:.0f} m/hr). "
            "Advance efficiently along consolidated compression-ridge crests while completing traverse before "
            "afternoon solar insolation warms the upper active layer."
        )
        tibial_entrapment_and_rockfall_advisory = (
            f"LOW SUB-CARAPACE VOID RISK ({sub_carapace_void_entrapment_risk_percent:.1f}%): Maintain standard "
            "stiff-shank boot edging and basketless staff probing across boulder bridges, and avoid stepping on "
            "isolated overhanging edge blocks along lateral furrow walls."
        )

    return _AttrDict(
        {
            "morphology": morphology,
            "ice_state": ice_state,
            "technique": technique,
            "mean_block_diameter_cm": round(mean_block_diameter_cm, 1),
            "slope_angle_deg": round(slope_angle_deg, 1),
            "active_layer_thaw_depth_cm": round(active_layer_thaw_depth_cm, 1),
            "interstitial_void_ratio_percent": round(
                interstitial_void_ratio_percent, 1
            ),
            "ambient_air_temp_c": round(ambient_air_temp_c, 1),
            "pack_weight_kg": round(pack_weight_kg, 1),
            "block_rotational_stability_index": block_rotational_stability_index,
            "perched_block_tip_probability": perched_block_tip_probability,
            "sub_carapace_void_entrapment_risk_percent": sub_carapace_void_entrapment_risk_percent,
            "effective_horizontal_pace_mhr": effective_horizontal_pace_mhr,
            "safety_status": safety_status,
            "carapace_routing_protocol": carapace_routing_protocol,
            "tibial_entrapment_and_rockfall_advisory": tibial_entrapment_and_rockfall_advisory,
        }
    )


_ROCK_GLACIER_KEYWORDS: tuple[str, ...] = (
    "rock glacier",
    "rock-glacier",
    "rock glaciers",
    "rock-glaciers",
    "periglacial",
    "blockfield",
    "blockfields",
    "felsenmeer",
    "interstitial ice",
    "active layer thaw",
    "active-layer thaw",
    "glaciar de escombros",
    "val muragl",
    "murtèl",
    "murtel-corvatsch",
    "dos lenguas",
    "agua negra",
    "sourdough peak",
    "mccarthy creek rock glacier",
    "mount mendenhall",
    "imogene basin",
    "nesters ridge",
    "lehman quartzite",
    "sub-carapace void",
    "sub carapace void",
    "cryo-cemented",
    "cryo cemented",
    "perched block",
    "tibial entrapment",
)


def is_rock_glacier_navigation_query(query: str) -> bool:
    """Return True if the user query pertains to high-alpine talus, boulder-field, or periglacial rock-glacier navigation."""
    if not query or not query.strip():
        return False
    q = query.lower()

    if any(kw in q for kw in _ROCK_GLACIER_KEYWORDS):
        return True

    has_boulder_talus_context = any(
        term in q
        for term in (
            "boulder field",
            "boulder-field",
            "talus apron",
            "talus carapace",
            "imbricated slab",
            "compression ridge",
            "thermokarst furrow",
        )
    )
    has_periglacial_mechanic = any(
        term in q
        for term in (
            "permafrost",
            "void ratio",
            "thaw depth",
            "rotational stability",
            "carapace",
            "lobate",
            "tongue-shaped",
            "entrapment",
        )
    )
    return has_boulder_talus_context and has_periglacial_mechanic


detect_rock_glacier_navigation_intent = is_rock_glacier_navigation_query


def extract_rock_glacier_navigation_params(query: str) -> dict[str, Any]:
    """Extract site_id, morphology, ice_state, technique, and numerical parameters from query."""
    q = query.lower()
    params: dict[str, Any] = {
        "site_id": None,
        "morphology": "active_lobate_ice_cored_carapace",
        "ice_state": "cryo_cemented_permafrost_lock",
        "technique": "compression_ridge_crest_hopping",
        "mean_block_diameter_cm": 75.0,
        "slope_angle_deg": 21.0,
        "active_layer_thaw_depth_cm": 65.0,
        "interstitial_void_ratio_percent": 22.0,
        "ambient_air_temp_c": -2.0,
        "pack_weight_kg": 14.0,
        "has_explicit_numbers": False,
        "is_calculation": False,
    }

    site_patterns: list[tuple[tuple[str, ...], str]] = [
        (
            ("sourdough", "mccarthy creek", "wrangell"),
            "sourdough-peak-mccarthy-creek-rock-glacier",
        ),
        (
            ("mendenhall", "imogene", "san juan imbricated"),
            "mount-mendenhall-san-juan-imbricated-tongue",
        ),
        (
            ("muragl", "murtèl", "murtel", "corvatsch", "engadine"),
            "muragl-upper-engadine-permafrost-carapace",
        ),
        (
            ("dos lenguas", "agua negra", "glaciar de escombros", "cryolith"),
            "dos-lenguas-agua-negra-andean-cryolith-lobe",
        ),
        (
            ("nesters ridge", "wheeler peak", "lehman quartzite"),
            "nesters-ridge-wheeler-peak-quartzite-blockfield",
        ),
    ]
    for aliases, site_id in site_patterns:
        if site_id in q or any(alias in q for alias in aliases):
            params["site_id"] = site_id
            site = get_rock_glacier_site_by_id(site_id)
            if site is not None:
                params["morphology"] = site["morphology"]
                params["ice_state"] = site["ice_state"]
                params["technique"] = site["technique"]
                params["mean_block_diameter_cm"] = site[
                    "mean_block_diameter_cm"
                ]
                params["slope_angle_deg"] = site["slope_angle_deg"]
                params["active_layer_thaw_depth_cm"] = site[
                    "active_layer_thaw_depth_cm"
                ]
                params["interstitial_void_ratio_percent"] = site[
                    "interstitial_void_ratio_percent"
                ]
            break

    # Override morphology if explicitly mentioned
    if (
        "oversteepened_frontal_talus_apron" in q
        or "oversteepened frontal" in q
        or "frontal talus apron" in q
    ):
        params["morphology"] = "oversteepened_frontal_talus_apron"
    elif (
        "thermokarst_furrow_and_ridge_labyrinth" in q
        or "thermokarst furrow" in q
        or "ridge labyrinth" in q
    ):
        params["morphology"] = "thermokarst_furrow_and_ridge_labyrinth"
    elif (
        "relict_collapsed_boulder_blockfield" in q
        or "relict collapsed" in q
        or "boulder blockfield" in q
    ):
        params["morphology"] = "relict_collapsed_boulder_blockfield"
    elif (
        "tongue_shaped_interstitial_ice_matrix" in q
        or "tongue-shaped" in q
        or "tongue shaped" in q
    ):
        params["morphology"] = "tongue_shaped_interstitial_ice_matrix"
    elif (
        "active_lobate_ice_cored_carapace" in q
        or "active lobate" in q
        or "ice-cored carapace" in q
    ):
        params["morphology"] = "active_lobate_ice_cored_carapace"

    # Override ice_state if explicitly mentioned
    if (
        "isothermal_debris_creep_slump" in q
        or "isothermal debris" in q
        or "creep slump" in q
    ):
        params["ice_state"] = "isothermal_debris_creep_slump"
    elif (
        "basal_meltwater_piping_undercut" in q
        or "meltwater piping" in q
        or "piping undercut" in q
    ):
        params["ice_state"] = "basal_meltwater_piping_undercut"
    elif (
        "seasonal_active_layer_thaw_lubrication" in q
        or "thaw lubrication" in q
        or "seasonal active layer" in q
    ):
        params["ice_state"] = "seasonal_active_layer_thaw_lubrication"
    elif (
        "cryo_cemented_permafrost_lock" in q
        or "cryo-cemented" in q
        or "cryo cemented" in q
        or "permafrost lock" in q
    ):
        params["ice_state"] = "cryo_cemented_permafrost_lock"

    # Override technique if explicitly mentioned
    if (
        "belayed_frontal_scarp_switchbacking" in q
        or "belayed frontal" in q
        or "scarp switchbacking" in q
    ):
        params["technique"] = "belayed_frontal_scarp_switchbacking"
    elif (
        "diagonal_furrow_trough_contouring" in q
        or "diagonal furrow" in q
        or "trough contouring" in q
    ):
        params["technique"] = "diagonal_furrow_trough_contouring"
    elif (
        "three_point_imbricated_slab_stepping" in q
        or "imbricated slab" in q
        or "slab stepping" in q
    ):
        params["technique"] = "three_point_imbricated_slab_stepping"
    elif (
        "compression_ridge_crest_hopping" in q
        or "compression ridge" in q
        or "crest hopping" in q
    ):
        params["technique"] = "compression_ridge_crest_hopping"

    # Extract mean block diameter (cm)
    block_match = re.search(
        r"(?:(?:mean\s+)?block(?:\s+diameter|\s+size)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*cm|(\d+(?:\.\d+)?)\s*cm\s+(?:mean\s+)?block)",
        q,
    )
    if block_match:
        val = float(block_match.group(1) or block_match.group(2))
        params["mean_block_diameter_cm"] = max(15.0, min(300.0, val))
        params["has_explicit_numbers"] = True

    # Extract slope angle (deg)
    slope_match = re.search(
        r"(?:slope(?:\s+angle)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*(?:deg(?:rees?)?|°)|(\d+(?:\.\d+)?)\s*(?:deg(?:rees?)?|°)\s+slope)",
        q,
    )
    if slope_match:
        val = float(slope_match.group(1) or slope_match.group(2))
        params["slope_angle_deg"] = max(5.0, min(55.0, val))
        params["has_explicit_numbers"] = True

    # Extract active layer thaw depth (cm)
    thaw_match = re.search(
        r"(?:(?:active\s+layer\s+)?thaw(?:\s+depth)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*cm|(\d+(?:\.\d+)?)\s*cm\s+(?:active\s+layer\s+)?thaw)",
        q,
    )
    if thaw_match:
        val = float(thaw_match.group(1) or thaw_match.group(2))
        params["active_layer_thaw_depth_cm"] = max(10.0, min(400.0, val))
        params["has_explicit_numbers"] = True

    # Extract interstitial void ratio (%)
    void_match = re.search(
        r"(?:(?:interstitial\s+)?void(?:\s+ratio)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*(?:%|percent)|(\d+(?:\.\d+)?)\s*(?:%|percent)\s+(?:interstitial\s+)?void)",
        q,
    )
    if void_match:
        val = float(void_match.group(1) or void_match.group(2))
        params["interstitial_void_ratio_percent"] = max(5.0, min(65.0, val))
        params["has_explicit_numbers"] = True

    # Extract ambient air temperature (°C)
    temp_match = re.search(
        r"(?:(?:ambient\s+|air\s+)?temp(?:erature)?(?:\s+of)?\s*(-?\d+(?:\.\d+)?)\s*°?\s*c\b|(-?\d+(?:\.\d+)?)\s*°?\s*c\s+(?:ambient|air))",
        q,
    )
    if temp_match:
        val = float(temp_match.group(1) or temp_match.group(2))
        params["ambient_air_temp_c"] = max(-35.0, min(35.0, val))
        params["has_explicit_numbers"] = True

    # Extract pack weight (kg)
    pack_match = re.search(
        r"(?:(?:pack\s+)?(?:weight|load)(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*kg|(\d+(?:\.\d+)?)\s*kg\s+pack)",
        q,
    )
    if pack_match:
        val = float(pack_match.group(1) or pack_match.group(2))
        params["pack_weight_kg"] = max(0.0, min(50.0, val))
        params["has_explicit_numbers"] = True

    calc_triggers = (
        "calculate",
        "evaluate",
        "assess",
        "block stability",
        "rotational stability",
        "tip probability",
        "entrapment risk",
        "horizontal pace",
    )
    params["is_calculation"] = bool(params["has_explicit_numbers"]) or any(
        t in q for t in calc_triggers
    )

    return params


def format_rock_glacier_navigation_response(
    query: str,
) -> tuple[str, dict[str, Any]]:
    """Format a structured markdown answer and info dictionary for rock-glacier navigation queries."""
    params = extract_rock_glacier_navigation_params(query)
    is_calc = bool(params["is_calculation"])

    if is_calc:
        calc_result = calculate_rock_glacier_navigation_safety(
            morphology=params["morphology"],
            ice_state=params["ice_state"],
            technique=params["technique"],
            mean_block_diameter_cm=float(params["mean_block_diameter_cm"]),
            slope_angle_deg=float(params["slope_angle_deg"]),
            active_layer_thaw_depth_cm=float(
                params["active_layer_thaw_depth_cm"]
            ),
            interstitial_void_ratio_percent=float(
                params["interstitial_void_ratio_percent"]
            ),
            ambient_air_temp_c=float(params["ambient_air_temp_c"]),
            pack_weight_kg=float(params["pack_weight_kg"]),
        )
        gear_list = [dict(g) for g in get_rock_glacier_gear_checklist()]
        calc_info: dict[str, Any] = {
            **dict(calc_result),
            "action": "rock_glacier_navigation_calculated",
            "calculation": dict(calc_result),
            "gear_checklist": gear_list,
        }
        if params["site_id"]:
            matched_site = get_rock_glacier_site_by_id(str(params["site_id"]))
            if matched_site is not None:
                calc_info["site"] = dict(matched_site)

        answer = (
            "### High-Alpine Talus & Periglacial Rock-Glacier Navigation Assessment\n\n"
            f"- **Safety Status:** `{calc_result['safety_status']}`\n"
            f"- **Block Rotational Stability Index:** `{calc_result['block_rotational_stability_index']}` "
            f"(`{calc_result['morphology']}`, {calc_result['mean_block_diameter_cm']} cm mean block diameter, "
            f"{calc_result['slope_angle_deg']}° slope)\n"
            f"- **Perched Block Tip Probability:** `{calc_result['perched_block_tip_probability']:.1%}` "
            f"(ice state `{calc_result['ice_state']}`, thaw depth `{calc_result['active_layer_thaw_depth_cm']} cm`)\n"
            f"- **Sub-Carapace Void Entrapment Risk:** `{calc_result['sub_carapace_void_entrapment_risk_percent']}%` "
            f"(void ratio `{calc_result['interstitial_void_ratio_percent']}%`, pack `{calc_result['pack_weight_kg']} kg`)\n"
            f"- **Effective Horizontal Pace:** `{calc_result['effective_horizontal_pace_mhr']} m/hr` "
            f"(`{calc_result['technique']}`, air `{calc_result['ambient_air_temp_c']}°C`)\n\n"
            f"**Carapace Routing Protocol:** {calc_result['carapace_routing_protocol']}\n\n"
            f"**Tibial Entrapment & Rockfall Advisory:** {calc_result['tibial_entrapment_and_rockfall_advisory']}"
        )
        return answer, calc_info

    if params["site_id"]:
        site = get_rock_glacier_site_by_id(str(params["site_id"]))
        if site is not None:
            site_calc = calculate_rock_glacier_navigation_safety(
                morphology=site["morphology"],
                ice_state=site["ice_state"],
                technique=site["technique"],
                mean_block_diameter_cm=float(site["mean_block_diameter_cm"]),
                slope_angle_deg=float(site["slope_angle_deg"]),
                active_layer_thaw_depth_cm=float(
                    site["active_layer_thaw_depth_cm"]
                ),
                interstitial_void_ratio_percent=float(
                    site["interstitial_void_ratio_percent"]
                ),
                ambient_air_temp_c=2.0,
                pack_weight_kg=14.0,
            )
            lookup_info: dict[str, Any] = {
                "action": "rock_glacier_navigation_lookup",
                "site": dict(site),
                "baseline_calculation": dict(site_calc),
                "gear_checklist": [
                    dict(g) for g in get_rock_glacier_gear_checklist()
                ],
            }
            answer = (
                f"### {site['name']} ({site['region']})\n\n"
                f"- **Site ID:** `{site['id']}` (Elevation: {site['elevation_m']} m)\n"
                f"- **Morphology:** `{site['morphology']}` "
                f"(Mean Block Diameter: {site['mean_block_diameter_cm']} cm, Slope: {site['slope_angle_deg']}°)\n"
                f"- **Interstitial Ice State:** `{site['ice_state']}` "
                f"(Active Layer Thaw Depth: {site['active_layer_thaw_depth_cm']} cm, Void Ratio: {site['interstitial_void_ratio_percent']}%)\n"
                f"- **Recommended Carapace Technique:** `{site['technique']}`\n"
                f"- **Primary Hazard:** {site['primary_hazard']}\n"
                f"- **Carapace Escape Protocol:** {site['carapace_escape_protocol']}\n"
                f"- **Field Notes:** {site['field_notes']}"
            )
            return answer, lookup_info

    sites_list = [dict(s) for s in get_all_rock_glacier_sites()]
    gear_list = [dict(g) for g in get_rock_glacier_gear_checklist()]
    general_info: dict[str, Any] = {
        "action": "rock_glacier_navigation_info",
        "sites": sites_list,
        "gear_checklist": gear_list,
    }
    site_bullets = "\n".join(
        f"- **{s['name']}** (`{s['id']}`, {s['region']}): `{s['morphology']}` / `{s['ice_state']}`"
        for s in sites_list
    )
    gear_bullets = "\n".join(
        f"- **{g['name']}** (`{g['category']}`): {g['rationale']}"
        for g in gear_list
    )
    answer = (
        "### High-Alpine Talus & Boulder-Field Periglacial Rock-Glacier Navigation Guide\n\n"
        "Navigating active ice-cored lobate rock glaciers, tongue-shaped interstitial-ice carapaces, "
        "and quartzite felsenmeer blockfields requires assessing active-layer thaw lubrication, "
        "probing perched tabular boulders with a basketless chromoly staff, and armoring the lower leg "
        "against sub-carapace void entrapment.\n\n"
        "#### Curated Periglacial Rock-Glacier Reference Sites\n"
        f"{site_bullets}\n\n"
        "#### Mandatory 6-Item Rock-Glacier Navigation Gear Checklist\n"
        f"{gear_bullets}"
    )
    return answer, general_info


def build_rock_glacier_navigation_prompt(query: str = "") -> str:
    """Build system prompt context for LLM augmentation on periglacial rock-glacier navigation topics."""
    answer, _ = format_rock_glacier_navigation_response(query)
    return (
        "You are an expert alpine geomorphologist and Periglacial Rock-Glacier & Boulder-Field Navigation specialist. "
        "Use the following carapace stability and interstitial permafrost telemetry to answer the user's question:\n\n"
        f"{answer}"
    )
