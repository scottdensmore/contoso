"""Arid Playas & Salt Pan Crust Bearing-Capacity & Mirage Compass Navigation Domain Module.

Provides domain logic, curated arid playa and evaporite salar basin catalogs,
mandatory crust-sounding and optical mirage navigation gear checklists,
evaporite halite crust bearing safety, subsurface brine-mud breakthrough
probability, atmospheric refraction horizon dip error, and effective visual
sighting range calculations, intent detection, and response formatting for
arid playas and salt pan navigation queries.
"""

import re
from typing import Any, Literal, Optional

EvaporiteCrustType = Literal[
    "polygonal_halite_pressure_ridge",
    "desiccated_argillaceous_hardpan",
    "puffy_gypsum_efflorescent_crust",
    "wet_capillary_brine_salar_margin",
    "subsurface_liquefied_silt_dome",
]

AtmosphericRefractionState = Literal[
    "predawn_isothermal_clarity",
    "inferior_shimmer_horizon_collapse",
    "fata_morgana_vertical_loom",
    "haboob_halite_aerosol_whiteout",
]

PlayaTraversalMode = Literal[
    "wide_tire_desert_expedition_cart",
    "foot_trek_distributed_sand_sandals",
    "fat_tire_bikepacking_low_psi",
    "belayed_crust_sounding_probe_team",
]

SaltPanSafetyStatus = Literal[
    "nominal_crystalline_halite_corridor",
    "caution_mirage_azimuth_drift_and_brine_crust",
    "abort_subsurface_brine_mud_breakthrough",
]

VALID_CRUST_TYPES: set[str] = {
    "polygonal_halite_pressure_ridge",
    "desiccated_argillaceous_hardpan",
    "puffy_gypsum_efflorescent_crust",
    "wet_capillary_brine_salar_margin",
    "subsurface_liquefied_silt_dome",
}

VALID_REFRACTION_STATES: set[str] = {
    "predawn_isothermal_clarity",
    "inferior_shimmer_horizon_collapse",
    "fata_morgana_vertical_loom",
    "haboob_halite_aerosol_whiteout",
}

VALID_TRAVERSAL_MODES: set[str] = {
    "wide_tire_desert_expedition_cart",
    "foot_trek_distributed_sand_sandals",
    "fat_tire_bikepacking_low_psi",
    "belayed_crust_sounding_probe_team",
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


SALT_PAN_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "salar-de-uyuni-incahuasi-halite-polygon-basin",
            "name": "Salar de Uyuni & Isla Incahuasi Polygonal Halite Core",
            "region": "Potosí, Bolivia",
            "elevation": 3656,
            "elevation_m": 3656,
            "crust_type": "polygonal_halite_pressure_ridge",
            "refraction_state": "predawn_isothermal_clarity",
            "traversal_mode": "wide_tire_desert_expedition_cart",
            "mean_halite_crust_thickness_cm": 38.0,
            "water_table_depth_cm": 45.0,
            "typical_surface_air_temp_c": 14.0,
            "typical_ground_skin_temp_c": 22.0,
            "primary_hazard": (
                "Blinding 0.85 halite albedo, zero-relief horizon disorientation, and concealed "
                "'ojos del salar' artesian brine upwellings along polygonal pressure-ridge margins."
            ),
            "shoreline_escape_bearing_protocol": (
                "Sight true magnetic dead-reckoning bearings to Tunupa Volcano (5,321 m) or Isla Incahuasi "
                "coral knoll before solar heating collapses the distant horizon."
            ),
            "field_notes": (
                "Thick interlocking polygonal halite plates (38 cm mean) easily support wide-tire expedition "
                "carts during dry austral winter, but probe peripheral wet salar margins before crossing."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "badwater-devils-golf-course-halite-pan",
            "name": "Badwater Basin & Devil's Golf Course Serrated Halite Pan",
            "region": "Death Valley National Park, California, USA",
            "elevation": -86,
            "elevation_m": -86,
            "crust_type": "puffy_gypsum_efflorescent_crust",
            "refraction_state": "inferior_shimmer_horizon_collapse",
            "traversal_mode": "foot_trek_distributed_sand_sandals",
            "mean_halite_crust_thickness_cm": 16.0,
            "water_table_depth_cm": 28.0,
            "typical_surface_air_temp_c": 39.0,
            "typical_ground_skin_temp_c": 58.0,
            "primary_hazard": (
                "Razor-sharp serrated halite spires, collapsible puffy gypsum efflorescence over "
                "saturated Glauber's salt mud, and extreme 58°C ground-skin inferior mirage shimmer."
            ),
            "shoreline_escape_bearing_protocol": (
                "Hold a 085° magnetic escape back-bearing toward the Black Mountains alluvial fan aprons "
                "and avoid descending into dark damp brine troughs west of the main salt flat."
            ),
            "field_notes": (
                "Superheated boundary-layer air (19°C skin-to-air delta) produces severe inferior sky-mirroring "
                "that masks terrain relief beyond 2.5 km; navigate strictly by damped prismatic compass."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "makgadikgadi-ntwetwe-sua-salt-pan-traverse",
            "name": "Makgadikgadi Ntwetwe & Sua Evaporite Pan Traverse",
            "region": "Central Kalahari Basin, Botswana",
            "elevation": 905,
            "elevation_m": 905,
            "crust_type": "desiccated_argillaceous_hardpan",
            "refraction_state": "fata_morgana_vertical_loom",
            "traversal_mode": "fat_tire_bikepacking_low_psi",
            "mean_halite_crust_thickness_cm": 24.0,
            "water_table_depth_cm": 35.0,
            "typical_surface_air_temp_c": 34.0,
            "typical_ground_skin_temp_c": 51.0,
            "primary_hazard": (
                "Fata Morgana vertical looming that invents false baobab islands on the horizon and thin "
                "alkali clay crusts masking black anoxic bentonite ooze in seasonal depressions."
            ),
            "shoreline_escape_bearing_protocol": (
                "Lock dead-reckoning waypoints toward Kubu Island granitic outcrop and verify UTM grid "
                "progress every 3 km rather than chasing vertically stretched optical mirages."
            ),
            "field_notes": (
                "Running 4.8-inch fat tires at 6–8 PSI floats cleanly over desiccated argillaceous hardpan "
                "in the dry season, but darker gray moisture halos signal imminent wheel-hub crust breakthrough."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "chott-el-djerid-ephemeral-mirage-salar",
            "name": "Chott el Djerid Ephemeral Gypsum-Brine Sebkha",
            "region": "Tozeur & Kebili, Tunisia",
            "elevation": 15,
            "elevation_m": 15,
            "crust_type": "subsurface_liquefied_silt_dome",
            "refraction_state": "fata_morgana_vertical_loom",
            "traversal_mode": "belayed_crust_sounding_probe_team",
            "mean_halite_crust_thickness_cm": 7.0,
            "water_table_depth_cm": 9.0,
            "typical_surface_air_temp_c": 37.0,
            "typical_ground_skin_temp_c": 55.0,
            "primary_hazard": (
                "Treacherous 7 cm fragile gypsum-halite veneer suspended over bottomless liquefied "
                "thixotropic brine silt ('loukanda') with severe Fata Morgana horizon inversion."
            ),
            "shoreline_escape_bearing_protocol": (
                "Retreat immediately along established palm-trunk marker causeways toward the northern "
                "Djebel Tebaga escarpment whenever auger cores hit pressurized brine at <15 cm depth."
            ),
            "field_notes": (
                "Historically notorious for swallowing caravans whole; travel roped with 15 m spacing, "
                "core-augering every 3 m and carrying collapsible high-flotation extraction boards."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "bonneville-salt-flats-wendover-crust-corridor",
            "name": "Bonneville Salt Flats & Silver Island Halite Crust Corridor",
            "region": "Great Salt Lake Desert, Utah, USA",
            "elevation": 1286,
            "elevation_m": 1286,
            "crust_type": "wet_capillary_brine_salar_margin",
            "refraction_state": "inferior_shimmer_horizon_collapse",
            "traversal_mode": "wide_tire_desert_expedition_cart",
            "mean_halite_crust_thickness_cm": 14.0,
            "water_table_depth_cm": 19.0,
            "typical_surface_air_temp_c": 31.0,
            "typical_ground_skin_temp_c": 44.0,
            "primary_hazard": (
                "Thinning peripheral halite evaporite lenses over high capillary brine water tables (19 cm) "
                "and floating optical mountain illusions across the Great Salt Lake Desert floor."
            ),
            "shoreline_escape_bearing_protocol": (
                "Maintain a 320° true bearing toward the Silver Island Mountains bedrock bench if surface "
                "brine wicking softens the crystalline halite track."
            ),
            "field_notes": (
                "While the central compacted halite core exceeds 30 cm, outer salar margins thin rapidly "
                "to <14 cm over plastic oolitic clay; rinse all gear to prevent corrosive halite seizure."
            ),
        }
    ),
]


SALT_PAN_GEAR_CHECKLIST: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "graduated-stainless-evaporite-crust-core-auger",
            "name": "Graduated 316-Stainless Evaporite Crust Core Auger & T-Handle Sounding Rod (1.5 m)",
            "category": "crust_sounding",
            "mandatory": True,
            "rationale": (
                "Drills and sounds halite/gypsum crust thickness and measures shallow capillary brine "
                "water-table depth before committing traveler or expedition-cart weight."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "fluid-damped-prismatic-sighting-compass-and-sun-compass",
            "name": "Fluid-Damped Prismatic Sighting Compass & Bagnold Mechanical Sun-Compass",
            "category": "optical_navigation",
            "mandatory": True,
            "rationale": (
                "Enables drift-free dead reckoning when inferior shimmer or Fata Morgana vertical looming "
                "distorts, elevates, or completely erases distant mountain landmarks."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "polarized-category-4-wrap-glare-shields",
            "name": "Category-4 Polarized Glacier/Salar Wrap Shields with Removable Leather Side-Cups",
            "category": "albedo_eye_protection",
            "mandatory": True,
            "rationale": (
                "Blocks 92–95% visible light and upwelling UV/shortwave reflection from crystalline white "
                "halite pans (albedo up to 0.85) to prevent acute actinic keratitis."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "collapsible-high-flotation-brine-mud-extraction-boards",
            "name": "Collapsible Composite High-Flotation Brine-Mud Extraction Boards & 20 m Dyneema Tow Webbing",
            "category": "mire_extraction",
            "mandatory": True,
            "rationale": (
                "Spreads surface load (<8 kPa) to crawl or haul expedition carts out of thixotropic "
                "sub-crust silt domes after a halite veneer punch-through."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "dual-band-gnss-inreach-beacon-and-paper-utm-grid",
            "name": "Dual-Band L1/L5 GNSS Satellite SOS Beacon & Laminated 1:100k UTM Salar Grid Chart",
            "category": "optical_navigation",
            "mandatory": True,
            "rationale": (
                "Provides absolute coordinate fixes across featureless 10,000 km² evaporite basins and "
                "maps verified bedrock island refuges and known artesian brine eyes ('ojos')."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "ptfe-coated-halite-resistant-gaiters-and-barrier-salve",
            "name": "PTFE-Coated Halite-Abrasion Gaiters, Sealed Hub Bearings & Anhydrous Lanolin Barrier Salve",
            "category": "mire_extraction",
            "mandatory": True,
            "rationale": (
                "Shields shins and footwear seams from razor-sharp serrated halite pressure ridges and "
                "prevents hyper-saline chemical desiccation burns upon brine immersion."
            ),
        }
    ),
]


def get_all_salt_pan_sites() -> list[dict[str, Any]]:
    """Return all curated arid playa and salt pan navigation sites."""
    return list(SALT_PAN_SITES)


def get_salt_pan_site_by_id(site_id: str) -> Optional[dict[str, Any]]:
    """Return a single salt pan site by ID, or None if not found."""
    normalized = site_id.strip().lower()
    for site in SALT_PAN_SITES:
        if site["id"] == normalized:
            return site
    return None


def filter_salt_pan_sites(
    crust_type: str | None = None,
    refraction_state: str | None = None,
    traversal_mode: str | None = None,
) -> list[dict[str, Any]]:
    """Filter curated salt pan sites by crust_type, refraction_state, and/or traversal_mode.

    Raises ValueError if any supplied filter value is not in the valid domain literal set.
    """
    if crust_type is not None and crust_type not in VALID_CRUST_TYPES:
        raise ValueError(
            f"Invalid crust_type '{crust_type}'. Must be one of {sorted(VALID_CRUST_TYPES)}."
        )
    if (
        refraction_state is not None
        and refraction_state not in VALID_REFRACTION_STATES
    ):
        raise ValueError(
            f"Invalid refraction_state '{refraction_state}'. Must be one of {sorted(VALID_REFRACTION_STATES)}."
        )
    if (
        traversal_mode is not None
        and traversal_mode not in VALID_TRAVERSAL_MODES
    ):
        raise ValueError(
            f"Invalid traversal_mode '{traversal_mode}'. Must be one of {sorted(VALID_TRAVERSAL_MODES)}."
        )

    results = list(SALT_PAN_SITES)
    if crust_type is not None:
        results = [s for s in results if s["crust_type"] == crust_type]
    if refraction_state is not None:
        results = [
            s for s in results if s["refraction_state"] == refraction_state
        ]
    if traversal_mode is not None:
        results = [s for s in results if s["traversal_mode"] == traversal_mode]
    return results


def get_salt_pan_gear_checklist() -> list[dict[str, Any]]:
    """Return the mandatory 6-item arid playas & salt pan navigation gear checklist."""
    return list(SALT_PAN_GEAR_CHECKLIST)


def calculate_salt_pan_navigation_safety(
    crust_type: str = "polygonal_halite_pressure_ridge",
    refraction_state: str = "predawn_isothermal_clarity",
    traversal_mode: str = "wide_tire_desert_expedition_cart",
    halite_crust_thickness_cm: float = 38.0,
    water_table_depth_cm: float = 45.0,
    surface_air_temp_c: float = 14.0,
    ground_skin_temp_c: float = 22.0,
    total_traveler_load_kg: float = 95.0,
    target_sighting_distance_km: float = 12.0,
) -> dict[str, Any]:
    """Calculate evaporite crust bearing safety factor, brine-mud breakthrough probability,
    mirage horizon dip error, and effective visual sighting range across arid salt pans.
    """
    if crust_type not in VALID_CRUST_TYPES:
        raise ValueError(
            f"Invalid crust_type '{crust_type}'. Must be one of {sorted(VALID_CRUST_TYPES)}."
        )
    if refraction_state not in VALID_REFRACTION_STATES:
        raise ValueError(
            f"Invalid refraction_state '{refraction_state}'. Must be one of {sorted(VALID_REFRACTION_STATES)}."
        )
    if traversal_mode not in VALID_TRAVERSAL_MODES:
        raise ValueError(
            f"Invalid traversal_mode '{traversal_mode}'. Must be one of {sorted(VALID_TRAVERSAL_MODES)}."
        )
    if not (1.0 <= halite_crust_thickness_cm <= 150.0):
        raise ValueError(
            f"halite_crust_thickness_cm ({halite_crust_thickness_cm}) must be between 1.0 and 150.0 cm."
        )
    if not (0.0 <= water_table_depth_cm <= 250.0):
        raise ValueError(
            f"water_table_depth_cm ({water_table_depth_cm}) must be between 0.0 and 250.0 cm."
        )
    if not (-15.0 <= surface_air_temp_c <= 60.0):
        raise ValueError(
            f"surface_air_temp_c ({surface_air_temp_c}) must be between -15.0 and 60.0 °C."
        )
    if not (-15.0 <= ground_skin_temp_c <= 85.0):
        raise ValueError(
            f"ground_skin_temp_c ({ground_skin_temp_c}) must be between -15.0 and 85.0 °C."
        )
    if not (30.0 <= total_traveler_load_kg <= 300.0):
        raise ValueError(
            f"total_traveler_load_kg ({total_traveler_load_kg}) must be between 30.0 and 300.0 kg."
        )
    if not (0.5 <= target_sighting_distance_km <= 50.0):
        raise ValueError(
            f"target_sighting_distance_km ({target_sighting_distance_km}) must be between 0.5 and 50.0 km."
        )

    crust_strength_map: dict[str, float] = {
        "polygonal_halite_pressure_ridge": 1.38,
        "desiccated_argillaceous_hardpan": 1.12,
        "puffy_gypsum_efflorescent_crust": 0.84,
        "wet_capillary_brine_salar_margin": 0.66,
        "subsurface_liquefied_silt_dome": 0.44,
    }
    footprint_factor_map: dict[str, float] = {
        "belayed_crust_sounding_probe_team": 1.24,
        "foot_trek_distributed_sand_sandals": 1.16,
        "fat_tire_bikepacking_low_psi": 1.04,
        "wide_tire_desert_expedition_cart": 0.94,
    }

    # Water table proximity support factor (shallow capillary brine weakens evaporite cement)
    if water_table_depth_cm >= 40.0:
        water_table_factor = 1.18
    elif water_table_depth_cm >= 25.0:
        water_table_factor = 0.96
    elif water_table_depth_cm >= 12.0:
        water_table_factor = 0.72
    else:
        water_table_factor = max(0.35, 0.42 + (water_table_depth_cm / 40.0))

    load_norm = 95.0 / max(30.0, total_traveler_load_kg)
    thickness_factor = (halite_crust_thickness_cm / 15.0) ** 1.12

    raw_safety_factor = (
        thickness_factor
        * crust_strength_map[crust_type]
        * footprint_factor_map[traversal_mode]
        * water_table_factor
        * load_norm
    )
    crust_bearing_safety_factor = round(
        max(0.08, min(6.5, raw_safety_factor)), 2
    )

    # Subsurface brine-mud breakthrough probability (0.01 to 0.99)
    shallow_brine_penalty = max(0.0, (30.0 - water_table_depth_cm) / 80.0)
    silt_dome_penalty = (
        0.18 if crust_type == "subsurface_liquefied_silt_dome" else 0.0
    )
    raw_breakthrough = (
        1.0 / (1.0 + (crust_bearing_safety_factor**2.25))
        + shallow_brine_penalty
        + silt_dome_penalty
    )
    if crust_bearing_safety_factor >= 1.85 and water_table_depth_cm >= 35.0:
        raw_breakthrough = min(raw_breakthrough, 0.14)
    brine_mud_breakthrough_probability = round(
        max(0.01, min(0.99, raw_breakthrough)), 3
    )

    # Atmospheric refraction & mirage horizon dip error (deg)
    refraction_multiplier_map: dict[str, float] = {
        "predawn_isothermal_clarity": 0.35,
        "inferior_shimmer_horizon_collapse": 1.15,
        "fata_morgana_vertical_loom": 1.55,
        "haboob_halite_aerosol_whiteout": 1.85,
    }
    thermal_gradient_c = max(1.0, abs(ground_skin_temp_c - surface_air_temp_c))
    distance_factor = 0.65 + (target_sighting_distance_km / 25.0)
    raw_dip_error = (
        0.022
        * thermal_gradient_c
        * refraction_multiplier_map[refraction_state]
        * distance_factor
    )
    mirage_horizon_dip_error_deg = round(
        max(0.02, min(4.5, raw_dip_error)), 2
    )

    # Effective visual sighting range (km)
    refraction_visibility_cap: dict[str, float] = {
        "predawn_isothermal_clarity": 32.0,
        "inferior_shimmer_horizon_collapse": 6.5,
        "fata_morgana_vertical_loom": 4.2,
        "haboob_halite_aerosol_whiteout": 0.8,
    }
    thermal_shimmer_attenuation = 1.0 / (
        1.0 + max(0.0, thermal_gradient_c - 6.0) * 0.045
    )
    max_optical_horizon = (
        refraction_visibility_cap[refraction_state]
        * thermal_shimmer_attenuation
    )
    effective_visual_range_km = round(
        max(0.3, min(target_sighting_distance_km, max_optical_horizon)), 2
    )

    # Classify SaltPanSafetyStatus
    safety_status: SaltPanSafetyStatus
    if (
        crust_bearing_safety_factor < 0.88
        or brine_mud_breakthrough_probability >= 0.60
        or halite_crust_thickness_cm < 9.0
        or water_table_depth_cm < 12.0
        or crust_type == "subsurface_liquefied_silt_dome"
        or refraction_state == "haboob_halite_aerosol_whiteout"
    ):
        safety_status = "abort_subsurface_brine_mud_breakthrough"
    elif (
        crust_bearing_safety_factor < 1.75
        or brine_mud_breakthrough_probability >= 0.22
        or mirage_horizon_dip_error_deg >= 0.45
        or effective_visual_range_km < 7.5
        or refraction_state
        in ("inferior_shimmer_horizon_collapse", "fata_morgana_vertical_loom")
        or crust_type
        in (
            "puffy_gypsum_efflorescent_crust",
            "wet_capillary_brine_salar_margin",
        )
    ):
        safety_status = "caution_mirage_azimuth_drift_and_brine_crust"
    else:
        safety_status = "nominal_crystalline_halite_corridor"

    if safety_status == "abort_subsurface_brine_mud_breakthrough":
        dead_reckoning_routing_protocol = (
            "EMERGENCY ABORT — BEDROCK SHORELINE RETREAT: Do not advance onto thin evaporite veneers or "
            f"subsurface liquefied silt domes (safety factor {crust_bearing_safety_factor}, breakthrough "
            f"probability {brine_mud_breakthrough_probability:.1%}, water table {water_table_depth_cm:.1f} cm). "
            f"Mirage dip error is {mirage_horizon_dip_error_deg}° with {effective_visual_range_km} km visual range; "
            "navigate strictly by reciprocal magnetic back-bearing and L1/L5 GNSS waypoints to nearest alluvial fan."
        )
        crust_sounding_and_extraction_advisory = (
            "CRITICAL THIXOTROPIC BRINE-MUD HAZARD: Unclip expedition cart tow harnesses immediately, "
            "deploy collapsible composite high-flotation extraction boards flat on the halite surface, "
            "and probe every 1.5 m with the graduated stainless core auger while retreating along proven tracks."
        )
    elif safety_status == "caution_mirage_azimuth_drift_and_brine_crust":
        dead_reckoning_routing_protocol = (
            "CAUTION — DEAD-RECKONING & SUN-COMPASS PROTOCOL: Optical refraction distorts distant horizon "
            f"landmarks (mirage dip error {mirage_horizon_dip_error_deg}°, effective visual range "
            f"{effective_visual_range_km} km). Do not steer toward shimmering or vertically looming targets; "
            "lock azimuths on a fluid-damped prismatic compass and leap-frog team members every 400 m."
        )
        crust_sounding_and_extraction_advisory = (
            "MARGINAL EVAPORITE CRUST PROTOCOL: Sound crust thickness every 150 m with the stainless core auger "
            f"(bearing safety factor {crust_bearing_safety_factor}, breakthrough risk "
            f"{brine_mud_breakthrough_probability:.1%}). Bypass dark damp capillary brine halos and wear "
            "Category-4 polarized wrap shields and PTFE halite gaiters."
        )
    else:
        dead_reckoning_routing_protocol = (
            "NOMINAL CRYSTALLINE HALITE CORRIDOR: Interlocking polygonal halite crust provides high bearing "
            f"capacity (safety factor {crust_bearing_safety_factor}, thickness {halite_crust_thickness_cm:.1f} cm) "
            f"and clear optical sightlines ({effective_visual_range_km} km range, dip error "
            f"{mirage_horizon_dip_error_deg}°). Log magnetic bearings to primary basin peaks before midday heating."
        )
        crust_sounding_and_extraction_advisory = (
            "Maintain standard auger core checks at polygonal ridge transitions and inspect wide-tire cart hubs "
            "for halite crystal encrustation. Keep Category-4 glacier shields and barrier salve deployed against "
            "intense 0.85 surface albedo."
        )

    return _AttrDict(
        {
            "crust_type": crust_type,
            "refraction_state": refraction_state,
            "traversal_mode": traversal_mode,
            "halite_crust_thickness_cm": round(halite_crust_thickness_cm, 1),
            "water_table_depth_cm": round(water_table_depth_cm, 1),
            "surface_air_temp_c": round(surface_air_temp_c, 1),
            "ground_skin_temp_c": round(ground_skin_temp_c, 1),
            "total_traveler_load_kg": round(total_traveler_load_kg, 1),
            "target_sighting_distance_km": round(
                target_sighting_distance_km, 2
            ),
            "crust_bearing_safety_factor": crust_bearing_safety_factor,
            "brine_mud_breakthrough_probability": brine_mud_breakthrough_probability,
            "mirage_horizon_dip_error_deg": mirage_horizon_dip_error_deg,
            "effective_visual_range_km": effective_visual_range_km,
            "safety_status": safety_status,
            "dead_reckoning_routing_protocol": dead_reckoning_routing_protocol,
            "crust_sounding_and_extraction_advisory": crust_sounding_and_extraction_advisory,
        }
    )


_SALT_PAN_KEYWORDS: tuple[str, ...] = (
    "salt pan",
    "salt-pan",
    "salt flat",
    "salt flats",
    "salar",
    "salar de uyuni",
    "uyuni",
    "incahuasi",
    "playa crust",
    "halite crust",
    "evaporite crust",
    "polygonal halite",
    "sebkha",
    "sabkha",
    "chott",
    "chott el djerid",
    "makgadikgadi",
    "ntwetwe",
    "sua pan",
    "fata morgana",
    "mirage compass",
    "sun compass",
    "sun-compass",
    "devil's golf course",
    "devils golf course",
    "bonneville salt",
    "ojos del salar",
    "brine mud",
)


def is_salt_pan_navigation_query(query: str) -> bool:
    """Return True if the user query pertains to arid playas, salt pan crust bearing capacity, or mirage compass navigation."""
    if not query or not query.strip():
        return False
    q = query.lower()

    if any(
        ex in q
        for ex in (
            "yardang",
            "yardangs",
            "kalut",
            "kaluts",
            "dasht-e lut",
            "gandom beryan",
            "badain jaran",
            "bilutu",
            "lop nur",
            "dunhuang yadan",
            "barchanoid",
            "erg djourab",
            "borkou",
            "ennedi",
            "aeolian corridor",
            "star-dune",
            "mega-dune",
        )
    ):
        return False

    if any(kw in q for kw in _SALT_PAN_KEYWORDS):
        return True

    has_playa_context = any(
        term in q
        for term in (
            "arid playa",
            "alkali flat",
            "evaporite",
            "halite",
            "gypsum crust",
            "capillary brine",
        )
    )
    has_navigation_or_crust = any(
        term in q
        for term in (
            "crust",
            "mirage",
            "refraction",
            "bearing",
            "auger",
            "breakthrough",
            "water table",
            "albedo",
        )
    )
    return has_playa_context and has_navigation_or_crust


detect_salt_pan_navigation_intent = is_salt_pan_navigation_query


def extract_salt_pan_navigation_params(query: str) -> dict[str, Any]:
    """Extract site_id, crust_type, refraction_state, traversal_mode, and numerical parameters from query."""
    q = query.lower()
    params: dict[str, Any] = {
        "site_id": None,
        "crust_type": "polygonal_halite_pressure_ridge",
        "refraction_state": "predawn_isothermal_clarity",
        "traversal_mode": "wide_tire_desert_expedition_cart",
        "halite_crust_thickness_cm": 38.0,
        "water_table_depth_cm": 45.0,
        "surface_air_temp_c": 14.0,
        "ground_skin_temp_c": 22.0,
        "total_traveler_load_kg": 95.0,
        "target_sighting_distance_km": 12.0,
        "has_explicit_numbers": False,
        "is_calculation": False,
    }

    site_patterns: list[tuple[tuple[str, ...], str]] = [
        (
            ("uyuni", "incahuasi", "potosi", "potosí"),
            "salar-de-uyuni-incahuasi-halite-polygon-basin",
        ),
        (
            ("badwater", "devil's golf course", "devils golf course"),
            "badwater-devils-golf-course-halite-pan",
        ),
        (
            ("makgadikgadi", "ntwetwe", "sua pan", "kubu island"),
            "makgadikgadi-ntwetwe-sua-salt-pan-traverse",
        ),
        (
            ("chott", "djerid", "sebkha", "tozeur", "kebili"),
            "chott-el-djerid-ephemeral-mirage-salar",
        ),
        (
            ("bonneville", "wendover", "silver island"),
            "bonneville-salt-flats-wendover-crust-corridor",
        ),
    ]
    for aliases, site_id in site_patterns:
        if site_id in q or any(alias in q for alias in aliases):
            params["site_id"] = site_id
            site = get_salt_pan_site_by_id(site_id)
            if site is not None:
                params["crust_type"] = site["crust_type"]
                params["refraction_state"] = site["refraction_state"]
                params["traversal_mode"] = site["traversal_mode"]
                params["halite_crust_thickness_cm"] = site[
                    "mean_halite_crust_thickness_cm"
                ]
                params["water_table_depth_cm"] = site["water_table_depth_cm"]
                params["surface_air_temp_c"] = site["typical_surface_air_temp_c"]
                params["ground_skin_temp_c"] = site[
                    "typical_ground_skin_temp_c"
                ]
            break

    # Override crust_type if explicitly mentioned
    if (
        "subsurface_liquefied_silt_dome" in q
        or "liquefied silt" in q
        or "silt dome" in q
    ):
        params["crust_type"] = "subsurface_liquefied_silt_dome"
    elif (
        "wet_capillary_brine_salar_margin" in q
        or "capillary brine" in q
        or "salar margin" in q
    ):
        params["crust_type"] = "wet_capillary_brine_salar_margin"
    elif (
        "puffy_gypsum_efflorescent_crust" in q
        or "puffy gypsum" in q
        or "efflorescent" in q
    ):
        params["crust_type"] = "puffy_gypsum_efflorescent_crust"
    elif (
        "desiccated_argillaceous_hardpan" in q
        or "argillaceous" in q
        or "hardpan" in q
    ):
        params["crust_type"] = "desiccated_argillaceous_hardpan"
    elif (
        "polygonal_halite_pressure_ridge" in q
        or "polygonal halite" in q
        or "pressure ridge" in q
    ):
        params["crust_type"] = "polygonal_halite_pressure_ridge"

    # Override refraction_state if explicitly mentioned
    if (
        "haboob_halite_aerosol_whiteout" in q
        or "haboob" in q
        or "aerosol whiteout" in q
    ):
        params["refraction_state"] = "haboob_halite_aerosol_whiteout"
    elif (
        "fata_morgana_vertical_loom" in q
        or "fata morgana" in q
        or "vertical loom" in q
    ):
        params["refraction_state"] = "fata_morgana_vertical_loom"
    elif (
        "inferior_shimmer_horizon_collapse" in q
        or "inferior shimmer" in q
        or "horizon collapse" in q
    ):
        params["refraction_state"] = "inferior_shimmer_horizon_collapse"
    elif (
        "predawn_isothermal_clarity" in q
        or "predawn" in q
        or "isothermal clarity" in q
    ):
        params["refraction_state"] = "predawn_isothermal_clarity"

    # Override traversal_mode if explicitly mentioned
    if "belayed_crust_sounding_probe_team" in q or "belayed" in q:
        params["traversal_mode"] = "belayed_crust_sounding_probe_team"
    elif (
        "fat_tire_bikepacking_low_psi" in q
        or "fat tire" in q
        or "low psi" in q
    ):
        params["traversal_mode"] = "fat_tire_bikepacking_low_psi"
    elif (
        "foot_trek_distributed_sand_sandals" in q
        or "sand sandals" in q
        or "foot trek" in q
    ):
        params["traversal_mode"] = "foot_trek_distributed_sand_sandals"
    elif (
        "wide_tire_desert_expedition_cart" in q
        or "expedition cart" in q
        or "wide tire" in q
    ):
        params["traversal_mode"] = "wide_tire_desert_expedition_cart"

    # Extract halite crust thickness (cm)
    crust_match = re.search(
        r"(?:(?:halite\s+)?crust(?:\s+thickness)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*cm|(\d+(?:\.\d+)?)\s*cm\s+(?:halite\s+)?crust)",
        q,
    )
    if crust_match:
        val = float(crust_match.group(1) or crust_match.group(2))
        params["halite_crust_thickness_cm"] = max(1.0, min(150.0, val))
        params["has_explicit_numbers"] = True

    # Extract water table depth (cm)
    water_match = re.search(
        r"(?:(?:water\s+table|brine)(?:\s+depth)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*cm|(\d+(?:\.\d+)?)\s*cm\s+(?:water\s+table|brine))",
        q,
    )
    if water_match:
        val = float(water_match.group(1) or water_match.group(2))
        params["water_table_depth_cm"] = max(0.0, min(250.0, val))
        params["has_explicit_numbers"] = True

    # Extract surface air temperature (°C)
    air_temp_match = re.search(
        r"(?:air\s+temp(?:erature)?(?:\s+of)?\s*(-?\d+(?:\.\d+)?)\s*°?\s*c\b|(-?\d+(?:\.\d+)?)\s*°?\s*c\s+air)",
        q,
    )
    if air_temp_match:
        val = float(air_temp_match.group(1) or air_temp_match.group(2))
        params["surface_air_temp_c"] = max(-15.0, min(60.0, val))
        params["has_explicit_numbers"] = True

    # Extract ground skin temperature (°C)
    ground_temp_match = re.search(
        r"(?:(?:ground|skin)(?:\s+skin)?\s+temp(?:erature)?(?:\s+of)?\s*(-?\d+(?:\.\d+)?)\s*°?\s*c\b|(-?\d+(?:\.\d+)?)\s*°?\s*c\s+(?:ground|skin))",
        q,
    )
    if ground_temp_match:
        val = float(ground_temp_match.group(1) or ground_temp_match.group(2))
        params["ground_skin_temp_c"] = max(-15.0, min(85.0, val))
        params["has_explicit_numbers"] = True

    # Extract total traveler load (kg)
    load_match = re.search(
        r"(?:load(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*kg|(\d+(?:\.\d+)?)\s*kg)",
        q,
    )
    if load_match:
        val = float(load_match.group(1) or load_match.group(2))
        params["total_traveler_load_kg"] = max(30.0, min(300.0, val))
        params["has_explicit_numbers"] = True

    # Extract target sighting distance (km)
    dist_match = re.search(
        r"(?:(?:sighting\s+)?distance(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*km|(\d+(?:\.\d+)?)\s*km\s+(?:sighting|target|distance))",
        q,
    )
    if dist_match:
        val = float(dist_match.group(1) or dist_match.group(2))
        params["target_sighting_distance_km"] = max(0.5, min(50.0, val))
        params["has_explicit_numbers"] = True

    calc_triggers = (
        "calculate",
        "evaluate",
        "assess",
        "bearing capacity",
        "bearing safety",
        "breakthrough probability",
        "dip error",
        "sighting distance",
    )
    params["is_calculation"] = bool(params["has_explicit_numbers"]) or any(
        t in q for t in calc_triggers
    )

    return params


def format_salt_pan_navigation_response(
    query: str,
) -> tuple[str, dict[str, Any]]:
    """Format a structured markdown answer and info dictionary for salt pan navigation queries."""
    params = extract_salt_pan_navigation_params(query)
    is_calc = bool(params["is_calculation"])

    if is_calc:
        calc_result = calculate_salt_pan_navigation_safety(
            crust_type=params["crust_type"],
            refraction_state=params["refraction_state"],
            traversal_mode=params["traversal_mode"],
            halite_crust_thickness_cm=float(
                params["halite_crust_thickness_cm"]
            ),
            water_table_depth_cm=float(params["water_table_depth_cm"]),
            surface_air_temp_c=float(params["surface_air_temp_c"]),
            ground_skin_temp_c=float(params["ground_skin_temp_c"]),
            total_traveler_load_kg=float(params["total_traveler_load_kg"]),
            target_sighting_distance_km=float(
                params["target_sighting_distance_km"]
            ),
        )
        gear_list = [dict(g) for g in get_salt_pan_gear_checklist()]
        calc_info: dict[str, Any] = {
            **dict(calc_result),
            "action": "salt_pan_navigation_calculated",
            "calculation": dict(calc_result),
            "gear_checklist": gear_list,
        }
        if params["site_id"]:
            matched_site = get_salt_pan_site_by_id(str(params["site_id"]))
            if matched_site is not None:
                calc_info["site"] = dict(matched_site)

        answer = (
            "### Arid Playas & Salt Pan Crust Bearing-Capacity & Mirage Navigation Assessment\n\n"
            f"- **Safety Status:** `{calc_result['safety_status']}`\n"
            f"- **Crust Bearing Safety Factor:** `{calc_result['crust_bearing_safety_factor']}` "
            f"(`{calc_result['crust_type']}`, {calc_result['halite_crust_thickness_cm']} cm halite crust, "
            f"{calc_result['total_traveler_load_kg']} kg load)\n"
            f"- **Brine-Mud Breakthrough Probability:** `{calc_result['brine_mud_breakthrough_probability']:.1%}` "
            f"(water table depth `{calc_result['water_table_depth_cm']} cm`)\n"
            f"- **Mirage Horizon Dip Error:** `{calc_result['mirage_horizon_dip_error_deg']}°` "
            f"(air `{calc_result['surface_air_temp_c']}°C`, skin `{calc_result['ground_skin_temp_c']}°C`, "
            f"`{calc_result['refraction_state']}`)\n"
            f"- **Effective Visual Sighting Range:** `{calc_result['effective_visual_range_km']} km` "
            f"(target `{calc_result['target_sighting_distance_km']} km`)\n\n"
            f"**Dead-Reckoning Routing Protocol:** {calc_result['dead_reckoning_routing_protocol']}\n\n"
            f"**Crust Sounding & Extraction Advisory:** {calc_result['crust_sounding_and_extraction_advisory']}"
        )
        return answer, calc_info

    if params["site_id"]:
        site = get_salt_pan_site_by_id(str(params["site_id"]))
        if site is not None:
            site_calc = calculate_salt_pan_navigation_safety(
                crust_type=site["crust_type"],
                refraction_state=site["refraction_state"],
                traversal_mode=site["traversal_mode"],
                halite_crust_thickness_cm=float(
                    site["mean_halite_crust_thickness_cm"]
                ),
                water_table_depth_cm=float(site["water_table_depth_cm"]),
                surface_air_temp_c=float(site["typical_surface_air_temp_c"]),
                ground_skin_temp_c=float(site["typical_ground_skin_temp_c"]),
                total_traveler_load_kg=95.0,
                target_sighting_distance_km=12.0,
            )
            lookup_info: dict[str, Any] = {
                "action": "salt_pan_navigation_lookup",
                "site": dict(site),
                "baseline_calculation": dict(site_calc),
                "gear_checklist": [
                    dict(g) for g in get_salt_pan_gear_checklist()
                ],
            }
            answer = (
                f"### {site['name']} ({site['region']})\n\n"
                f"- **Site ID:** `{site['id']}` (Elevation: {site['elevation_m']} m)\n"
                f"- **Evaporite Crust Type:** `{site['crust_type']}` "
                f"(Mean Halite Crust: {site['mean_halite_crust_thickness_cm']} cm, Water Table Depth: {site['water_table_depth_cm']} cm)\n"
                f"- **Atmospheric Refraction State:** `{site['refraction_state']}` "
                f"(Air Temp: {site['typical_surface_air_temp_c']}°C, Ground Skin Temp: {site['typical_ground_skin_temp_c']}°C)\n"
                f"- **Recommended Traversal Mode:** `{site['traversal_mode']}`\n"
                f"- **Primary Hazard:** {site['primary_hazard']}\n"
                f"- **Shoreline Escape Bearing Protocol:** {site['shoreline_escape_bearing_protocol']}\n"
                f"- **Field Notes:** {site['field_notes']}"
            )
            return answer, lookup_info

    sites_list = [dict(s) for s in get_all_salt_pan_sites()]
    gear_list = [dict(g) for g in get_salt_pan_gear_checklist()]
    general_info: dict[str, Any] = {
        "action": "salt_pan_navigation_info",
        "sites": sites_list,
        "gear_checklist": gear_list,
    }
    site_bullets = "\n".join(
        f"- **{s['name']}** (`{s['id']}`, {s['region']}): `{s['crust_type']}` / `{s['refraction_state']}`"
        for s in sites_list
    )
    gear_bullets = "\n".join(
        f"- **{g['name']}** (`{g['category']}`): {g['rationale']}"
        for g in gear_list
    )
    answer = (
        "### Arid Playas & Salt Pan Crust Bearing-Capacity & Mirage Compass Navigation Guide\n\n"
        "Traversing hyper-arid evaporite playas, polygonal halite salars, and gypsum-brine sebkhas "
        "requires systematic stainless core-auger crust sounding, fluid-damped prismatic/sun-compass "
        "dead reckoning against Fata Morgana and inferior shimmer refraction, and Category-4 polarized "
        "eye defense against 0.85 halite albedo.\n\n"
        "#### Curated Arid Playa & Salt Pan Reference Corridors\n"
        f"{site_bullets}\n\n"
        "#### Mandatory 6-Item Salt Pan & Mirage Navigation Gear Checklist\n"
        f"{gear_bullets}"
    )
    return answer, general_info


def build_salt_pan_navigation_prompt(query: str = "") -> str:
    """Build system prompt context for LLM augmentation on arid playa and salt pan navigation topics."""
    answer, _ = format_salt_pan_navigation_response(query)
    return (
        "You are an expert arid-lands geomorphologist and Salt Pan Crust Bearing-Capacity & Mirage Compass Navigation specialist. "
        "Use the following evaporite crust and atmospheric refraction telemetry to answer the user's question:\n\n"
        f"{answer}"
    )
