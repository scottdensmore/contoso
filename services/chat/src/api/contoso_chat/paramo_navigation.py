"""High-Altitude Páramo & Frailejón Cushion-Bog Moorland Navigation Domain Module.

Provides domain logic, curated tropical Andean and Talamanca páramo moorland site catalogs,
mandatory turbera footwear, cushion probing, whiteout wayfinding, and hypothermia defense
gear checklists, cushion bearing safety factor, turbera breakthrough probability, effective
wind chill, and azimuth drift calculations, intent detection, and response formatting for
high-altitude páramo and frailejón cushion-bog moorland navigation queries.
"""

import re
from typing import Any, Literal, Optional

ParamoSubstrateMorphology = Literal[
    "plantago_distichia_cushion_bog_dome",
    "espeletia_frailejon_tussock_matrix",
    "waterlogged_histosol_turbera_basin",
    "superparamo_periglacial_solifluction_scree",
    "polylepis_cloud_forest_ecotone_margin",
]

AndeanCloudFogRegime = Literal[
    "morning_zenith_uv_window",
    "orographic_paramo_drizzle_whiteout",
    "freezing_horizontal_sleet_squall",
    "nocturnal_radiative_needle_ice_frost",
]

ParamoTraversalTechnique = Literal[
    "distichia_cushion_dome_stepping",
    "tussock_crown_bridging_with_baskets",
    "wellies_and_gaiter_turbera_contouring",
    "compass_pacing_azimuth_dead_reckoning",
]

ParamoSafetyStatus = Literal[
    "nominal_morning_window_cushion_corridor",
    "caution_whiteout_fog_and_turbera_breakthrough",
    "abort_hypothermic_squall_and_peat_mire_entrapment",
]

VALID_SUBSTRATE_MORPHOLOGIES: set[str] = {
    "plantago_distichia_cushion_bog_dome",
    "espeletia_frailejon_tussock_matrix",
    "waterlogged_histosol_turbera_basin",
    "superparamo_periglacial_solifluction_scree",
    "polylepis_cloud_forest_ecotone_margin",
}

VALID_FOG_REGIMES: set[str] = {
    "morning_zenith_uv_window",
    "orographic_paramo_drizzle_whiteout",
    "freezing_horizontal_sleet_squall",
    "nocturnal_radiative_needle_ice_frost",
}

VALID_TRAVERSAL_TECHNIQUES: set[str] = {
    "distichia_cushion_dome_stepping",
    "tussock_crown_bridging_with_baskets",
    "wellies_and_gaiter_turbera_contouring",
    "compass_pacing_azimuth_dead_reckoning",
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


PARAMO_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "sumapaz-chisaca-laguna-tunjos-paramo",
            "name": "Páramo de Sumapaz & Lagunas de Chisacá Frailejón Moorland",
            "region": "Cundinamarca, Colombia",
            "elevation": 3780,
            "elevation_m": 3780,
            "substrate_morphology": "espeletia_frailejon_tussock_matrix",
            "fog_regime": "orographic_paramo_drizzle_whiteout",
            "technique": "tussock_crown_bridging_with_baskets",
            "mean_cushion_mat_thickness_cm": 26.0,
            "histosol_water_saturation_percent": 78.0,
            "typical_visibility_meters": 45.0,
            "typical_ambient_temp_c": 5.0,
            "typical_wind_speed_kmh": 24.0,
            "primary_hazard": (
                "Persistent orographic cloud-fog whiteout (45 m visibility) over deep acidic "
                "Andosol-Histosol peat trenches hidden between giant Espeletia grandiflora "
                "frailejón rosettes and Calamagrostis effusa bunchgrass tussocks."
            ),
            "turbera_stepping_and_wayfinding_protocol": (
                "Probe every inter-tussock hollow with dual 85 mm snow-basket trekking poles before "
                "transferring weight; step strictly on consolidated Calamagrostis tussock crowns and "
                "take mirror-compass bearings between Laguna de los Tunjos glacial moraine ribs."
            ),
            "field_notes": (
                "The largest alpine páramo moorland ecosystem on Earth; saturated black volcanic "
                "histosols act as a high-altitude hydrological sponge feeding the Orinoco and Magdalena basins."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "el-angel-frailejon-giant-rosette-reserve",
            "name": "Reserva Ecológica El Ángel & Voladero Cushion-Bog Basin",
            "region": "Carchi, Ecuador",
            "elevation": 3850,
            "elevation_m": 3850,
            "substrate_morphology": "plantago_distichia_cushion_bog_dome",
            "fog_regime": "morning_zenith_uv_window",
            "technique": "distichia_cushion_dome_stepping",
            "mean_cushion_mat_thickness_cm": 38.0,
            "histosol_water_saturation_percent": 68.0,
            "typical_visibility_meters": 220.0,
            "typical_ambient_temp_c": 8.0,
            "typical_wind_speed_kmh": 16.0,
            "primary_hazard": (
                "Quaking dome margins around Lagunas del Voladero where firm 38 cm Plantago rigida "
                "and Distichia muscoides vascular cushion domes abruptly drop into bottomless floating "
                "peat-water channels beneath overhanging Espeletia pycnophylla necromass skirts."
            ),
            "turbera_stepping_and_wayfinding_protocol": (
                "Execute center-of-dome stepping across bright-green convex Plantago rigida cushions "
                "during the clear morning zenith UV window; never step on dark-brown waterlogged "
                "sphagnum rims or disturb insulating marcescent frailejón leaf skirts."
            ),
            "field_notes": (
                "Iconic northern Andean frailejón forest and vascular cushion-bog basin straddling the "
                "Ecuadorian-Colombian border with dense stands of 5 m tall Espeletia pycnophylla."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "cajas-toreadora-glacial-turbera-labyrinth",
            "name": "Parque Nacional Cajas & Luspa Glacial-Trough Turbera Labyrinth",
            "region": "Azuay, Ecuador",
            "elevation": 3960,
            "elevation_m": 3960,
            "substrate_morphology": "waterlogged_histosol_turbera_basin",
            "fog_regime": "orographic_paramo_drizzle_whiteout",
            "technique": "wellies_and_gaiter_turbera_contouring",
            "mean_cushion_mat_thickness_cm": 14.0,
            "histosol_water_saturation_percent": 92.0,
            "typical_visibility_meters": 28.0,
            "typical_ambient_temp_c": 4.0,
            "typical_wind_speed_kmh": 32.0,
            "primary_hazard": (
                "270+ interconnected glacial tarn basins linked by 92% water-saturated Histosol "
                "turbera mires (14 cm thin surface crust) swept by 32 km/h horizontal Pacific-Amazon "
                "continental divide drizzle and 28 m visibility whiteout."
            ),
            "turbera_stepping_and_wayfinding_protocol": (
                "Contour high along rocky glacial lateral moraines and Polylepis woodland fringes "
                "wearing knee-high neoprene-lined rubber panteneras; avoid valley-floor turbera flats "
                "that liquefy under repeated footfalls."
            ),
            "field_notes": (
                "Pleistocene ice-scoured volcanic plateau lacking Espeletia rosettes, dominated instead "
                "by waterlogged Werneria/Xenophyllum cushion fens and gnarled Polylepis reticulata groves."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "cocuy-ritacuba-superparamo-cushion-pass",
            "name": "Sierra Nevada del Cocuy & Valle de los Cojines Distichia Pass",
            "region": "Boyacá, Colombia",
            "elevation": 4380,
            "elevation_m": 4380,
            "substrate_morphology": "superparamo_periglacial_solifluction_scree",
            "fog_regime": "freezing_horizontal_sleet_squall",
            "technique": "compass_pacing_azimuth_dead_reckoning",
            "mean_cushion_mat_thickness_cm": 18.0,
            "histosol_water_saturation_percent": 85.0,
            "typical_visibility_meters": 18.0,
            "typical_ambient_temp_c": 1.0,
            "typical_wind_speed_kmh": 46.0,
            "primary_hazard": (
                "Violent Llanos-fed freezing horizontal sleet squalls (46 km/h wind, 1°C ambient, "
                "18 m visibility) across 4,380 m superpáramo periglacial solifluction lobes and "
                "submerged Distichia muscoides cushion-bog passes."
            ),
            "turbera_stepping_and_wayfinding_protocol": (
                "Navigate strictly via declination-adjusted mirror-compass dead reckoning and barometric "
                "altimeter contour checks; deploy the ultralight bothy storm shelter immediately if sleet "
                "squalls drive effective wind chill below -5°C."
            ),
            "field_notes": (
                "High-elevation superpáramo transition zone below Ritacuba Blanco where diurnal "
                "freeze-thaw cycles heave wet slate scree around emerald Distichia cushion islands."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "chirripo-sabana-de-los-leones-talamanca-paramo",
            "name": "Cerro Chirripó & Valle de los Conejos Chusquea-Páramo Basin",
            "region": "Cordillera de Talamanca, Costa Rica",
            "elevation": 3520,
            "elevation_m": 3520,
            "substrate_morphology": "polylepis_cloud_forest_ecotone_margin",
            "fog_regime": "nocturnal_radiative_needle_ice_frost",
            "technique": "distichia_cushion_dome_stepping",
            "mean_cushion_mat_thickness_cm": 32.0,
            "histosol_water_saturation_percent": 71.0,
            "typical_visibility_meters": 160.0,
            "typical_ambient_temp_c": 7.0,
            "typical_wind_speed_kmh": 20.0,
            "primary_hazard": (
                "Nocturnal radiative frost and extruded 5 cm needle-ice (pipkrake) columns that "
                "crumble bog bank margins at dawn, paired with dense Chusquea subtessellata dwarf "
                "bamboo thickets and rapid trade-wind cloud-bank engulfment."
            ),
            "turbera_stepping_and_wayfinding_protocol": (
                "Step on firm central cushion domes and frost-stabilized glacial till ribs before "
                "mid-morning solar thaw turns needle-ice-heaved peat banks into slick mud slides."
            ),
            "field_notes": (
                "Neotropical northernmost glacial páramo enclave in the Cordillera de Talamanca, "
                "featuring cirque lakes, dwarf Chusquea bamboo moorlands, and Hypericum irazuense."
            ),
        }
    ),
]


PARAMO_GEAR_CHECKLIST: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "knee-high-neoprene-lined-rubber-paramo-panteneras",
            "name": "Knee-High 5mm Neoprene-Lined Vulcanized Rubber Páramo Panteneras & Sealed Gaiters",
            "category": "turbera_footwear",
            "mandatory": True,
            "rationale": (
                "Provides 100% waterproof immersion defense across 40 cm deep waterlogged Histosol "
                "turbera trenches where leather/membrane hiking boots saturate within minutes."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "dual-probe-85mm-snow-basket-trekking-poles",
            "name": "Dual Graduated Carbon-Lower Trekking Poles with 85mm Bog/Snow Flotation Baskets",
            "category": "cushion_probing",
            "mandatory": True,
            "rationale": (
                "Probes concealed peat-mire depth between Plantago/Distichia cushion domes and prevents "
                "pole tips from punching through fragile vascular bog mats during load transfer."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "three-layer-hydrostatic-28k-gore-pro-hardshell",
            "name": "3-Layer 28,000mm Hydrostatic-Head Storm Hardshell Jacket & Full-Zip Rain Pants",
            "category": "hypothermia_defense",
            "mandatory": True,
            "rationale": (
                "Blocks relentless horizontal Andean drizzle and freezing sleet squalls that rapidly "
                "induce conductive hypothermia at 3,500–4,400 m elevation."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "declination-adjustable-mirror-sighting-compass-and-altimeter",
            "name": "Declination-Adjustable Mirror Sighting Compass & Barometric Altimeter Watch",
            "category": "whiteout_wayfinding",
            "mandatory": True,
            "rationale": (
                "Essential for azimuth dead reckoning and contour-elevation verification when "
                "orographic cloud-fog reduces páramo visibility below 25 meters across monotonous frailejón basins."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "vapor-barrier-fleece-liner-gloves-and-overmitts",
            "name": "Seam-Taped Waterproof Breathable Shell Overmitts with High-Loft Fleece Liners",
            "category": "hypothermia_defense",
            "mandatory": True,
            "rationale": (
                "Maintains manual dexterity for compass sighting and pole probing during 1–5°C "
                "wind-driven sleet and wet fog conditions."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "ultralight-bothy-bag-emergency-storm-shelter",
            "name": "2-Person Silicone-Nylon Ultralight Windproof Bothy Bag Emergency Storm Shelter",
            "category": "hypothermia_defense",
            "mandatory": True,
            "rationale": (
                "Creates an immediate +10°C microclimate refuge within 30 seconds on treeless, "
                "waterlogged páramo moorlands where pitching a tent in deep peat mire is impossible."
            ),
        }
    ),
]


def get_all_paramo_sites() -> list[dict[str, Any]]:
    """Return all curated high-altitude páramo & frailejón cushion-bog moorland sites."""
    return list(PARAMO_SITES)


def get_paramo_site_by_id(site_id: str) -> Optional[dict[str, Any]]:
    """Return a single páramo moorland site by ID, or None if not found."""
    normalized = site_id.strip().lower()
    for site in PARAMO_SITES:
        if site["id"] == normalized:
            return site
    return None


def filter_paramo_sites(
    substrate_morphology: str | None = None,
    fog_regime: str | None = None,
    technique: str | None = None,
) -> list[dict[str, Any]]:
    """Filter curated páramo sites by substrate_morphology, fog_regime, and/or technique.

    Raises ValueError if any supplied filter value is not in the valid domain literal set.
    """
    if (
        substrate_morphology is not None
        and substrate_morphology not in VALID_SUBSTRATE_MORPHOLOGIES
    ):
        raise ValueError(
            f"Invalid substrate_morphology '{substrate_morphology}'. Must be one of {sorted(VALID_SUBSTRATE_MORPHOLOGIES)}."
        )
    if fog_regime is not None and fog_regime not in VALID_FOG_REGIMES:
        raise ValueError(
            f"Invalid fog_regime '{fog_regime}'. Must be one of {sorted(VALID_FOG_REGIMES)}."
        )
    if technique is not None and technique not in VALID_TRAVERSAL_TECHNIQUES:
        raise ValueError(
            f"Invalid technique '{technique}'. Must be one of {sorted(VALID_TRAVERSAL_TECHNIQUES)}."
        )

    results = list(PARAMO_SITES)
    if substrate_morphology is not None:
        results = [
            s
            for s in results
            if s["substrate_morphology"] == substrate_morphology
        ]
    if fog_regime is not None:
        results = [s for s in results if s["fog_regime"] == fog_regime]
    if technique is not None:
        results = [s for s in results if s["technique"] == technique]
    return results


def get_paramo_gear_checklist() -> list[dict[str, Any]]:
    """Return the mandatory 6-item high-altitude páramo & cushion-bog gear checklist."""
    return list(PARAMO_GEAR_CHECKLIST)


def calculate_paramo_navigation_safety(
    substrate_morphology: str = "plantago_distichia_cushion_bog_dome",
    fog_regime: str = "morning_zenith_uv_window",
    technique: str = "distichia_cushion_dome_stepping",
    cushion_mat_thickness_cm: float = 38.0,
    histosol_water_saturation_percent: float = 68.0,
    visibility_meters: float = 220.0,
    ambient_temp_c: float = 8.0,
    wind_speed_kmh: float = 16.0,
    pack_weight_kg: float = 14.0,
) -> dict[str, Any]:
    """Calculate cushion bearing safety factor, turbera breakthrough probability (0-1),
    effective wind chill (°C), and azimuth drift (meters/km) for páramo navigation.
    """
    if substrate_morphology not in VALID_SUBSTRATE_MORPHOLOGIES:
        raise ValueError(
            f"Invalid substrate_morphology '{substrate_morphology}'. Must be one of {sorted(VALID_SUBSTRATE_MORPHOLOGIES)}."
        )
    if fog_regime not in VALID_FOG_REGIMES:
        raise ValueError(
            f"Invalid fog_regime '{fog_regime}'. Must be one of {sorted(VALID_FOG_REGIMES)}."
        )
    if technique not in VALID_TRAVERSAL_TECHNIQUES:
        raise ValueError(
            f"Invalid technique '{technique}'. Must be one of {sorted(VALID_TRAVERSAL_TECHNIQUES)}."
        )
    if not (2.0 <= cushion_mat_thickness_cm <= 100.0):
        raise ValueError(
            f"cushion_mat_thickness_cm ({cushion_mat_thickness_cm}) must be between 2.0 and 100.0 cm."
        )
    if not (20.0 <= histosol_water_saturation_percent <= 100.0):
        raise ValueError(
            f"histosol_water_saturation_percent ({histosol_water_saturation_percent}) must be between 20.0 and 100.0%."
        )
    if not (2.0 <= visibility_meters <= 2000.0):
        raise ValueError(
            f"visibility_meters ({visibility_meters}) must be between 2.0 and 2000.0 meters."
        )
    if not (-15.0 <= ambient_temp_c <= 28.0):
        raise ValueError(
            f"ambient_temp_c ({ambient_temp_c}) must be between -15.0 and 28.0 °C."
        )
    if not (0.0 <= wind_speed_kmh <= 120.0):
        raise ValueError(
            f"wind_speed_kmh ({wind_speed_kmh}) must be between 0.0 and 120.0 km/h."
        )
    if not (0.0 <= pack_weight_kg <= 45.0):
        raise ValueError(
            f"pack_weight_kg ({pack_weight_kg}) must be between 0.0 and 45.0 kg."
        )

    substrate_structural_modulus: dict[str, float] = {
        "plantago_distichia_cushion_bog_dome": 1.25,
        "polylepis_cloud_forest_ecotone_margin": 1.15,
        "espeletia_frailejon_tussock_matrix": 0.98,
        "superparamo_periglacial_solifluction_scree": 0.88,
        "waterlogged_histosol_turbera_basin": 0.65,
    }
    technique_bearing_bonus: dict[str, float] = {
        "distichia_cushion_dome_stepping": 1.12,
        "tussock_crown_bridging_with_baskets": 1.08,
        "wellies_and_gaiter_turbera_contouring": 1.02,
        "compass_pacing_azimuth_dead_reckoning": 0.95,
    }
    fog_drift_multiplier: dict[str, float] = {
        "morning_zenith_uv_window": 0.75,
        "nocturnal_radiative_needle_ice_frost": 1.05,
        "orographic_paramo_drizzle_whiteout": 1.38,
        "freezing_horizontal_sleet_squall": 1.72,
    }

    # 1. Cushion bearing safety factor
    saturation_weakening = max(
        0.30, 1.0 - max(0.0, histosol_water_saturation_percent - 50.0) * 0.011
    )
    load_ratio = (75.0 + pack_weight_kg) / 85.0
    raw_safety_factor = (
        (cushion_mat_thickness_cm / 16.0)
        * substrate_structural_modulus[substrate_morphology]
        * technique_bearing_bonus[technique]
        * saturation_weakening
        / load_ratio
    )
    cushion_bearing_safety_factor = round(
        max(0.25, min(4.50, raw_safety_factor)), 2
    )

    # 2. Turbera breakthrough probability (0.01 to 0.99)
    thickness_deficit = max(0.0, (32.0 - cushion_mat_thickness_cm) / 32.0)
    sat_excess = max(0.0, (histosol_water_saturation_percent - 60.0) / 40.0)
    pack_penalty = (pack_weight_kg / 45.0) * 0.16
    raw_breakthrough = (
        0.06
        + (thickness_deficit * 0.42)
        + (sat_excess * 0.34)
        + pack_penalty
        + (1.15 - substrate_structural_modulus[substrate_morphology]) * 0.22
    )
    if fog_regime == "nocturnal_radiative_needle_ice_frost":
        raw_breakthrough += 0.04
    turbera_breakthrough_probability = round(
        max(0.01, min(0.99, raw_breakthrough)), 3
    )

    # 3. Effective wind chill (°C) including wet-adiabatic / drizzle evaporative cooling penalty
    if wind_speed_kmh >= 4.8 and ambient_temp_c <= 10.0:
        v_pow = wind_speed_kmh**0.16
        wc_base = (
            13.12
            + 0.6215 * ambient_temp_c
            - 11.37 * v_pow
            + 0.3965 * ambient_temp_c * v_pow
        )
    else:
        wc_base = ambient_temp_c - (wind_speed_kmh * 0.06)

    wet_chill_penalty = 0.0
    if fog_regime == "orographic_paramo_drizzle_whiteout":
        wet_chill_penalty = 1.4
    elif fog_regime == "freezing_horizontal_sleet_squall":
        wet_chill_penalty = 2.8
    elif fog_regime == "nocturnal_radiative_needle_ice_frost":
        wet_chill_penalty = 0.9

    effective_wind_chill_c = round(wc_base - wet_chill_penalty, 1)

    # 4. Azimuth drift (meters per km)
    vis_factor = (120.0 / max(5.0, min(400.0, visibility_meters))) ** 0.72
    wind_buffet_drift = wind_speed_kmh * 0.38
    raw_drift = (
        14.0 * vis_factor + wind_buffet_drift
    ) * fog_drift_multiplier[fog_regime]
    if technique == "compass_pacing_azimuth_dead_reckoning":
        raw_drift *= 0.82
    azimuth_drift_meters_per_km = round(max(3.0, min(320.0, raw_drift)), 1)

    # 5. Classify ParamoSafetyStatus
    safety_status: ParamoSafetyStatus
    if (
        cushion_bearing_safety_factor < 0.85
        or turbera_breakthrough_probability >= 0.58
        or effective_wind_chill_c <= -4.5
        or visibility_meters < 20.0
        or histosol_water_saturation_percent >= 94.0
        or fog_regime == "freezing_horizontal_sleet_squall"
    ):
        safety_status = "abort_hypothermic_squall_and_peat_mire_entrapment"
    elif (
        cushion_bearing_safety_factor < 1.45
        or turbera_breakthrough_probability >= 0.25
        or effective_wind_chill_c <= 3.5
        or visibility_meters < 90.0
        or histosol_water_saturation_percent >= 76.0
        or azimuth_drift_meters_per_km >= 40.0
        or fog_regime
        in (
            "orographic_paramo_drizzle_whiteout",
            "nocturnal_radiative_needle_ice_frost",
        )
        or substrate_morphology
        in (
            "waterlogged_histosol_turbera_basin",
            "superparamo_periglacial_solifluction_scree",
        )
    ):
        safety_status = "caution_whiteout_fog_and_turbera_breakthrough"
    else:
        safety_status = "nominal_morning_window_cushion_corridor"

    if safety_status == "abort_hypothermic_squall_and_peat_mire_entrapment":
        turbera_stepping_protocol = (
            "EMERGENCY ABORT — PEAT-MIRE BREAKTHROUGH & HYPOTHERMIC SQUALL HAZARD: "
            f"Do not cross open Histosol turbera basins (bearing safety factor {cushion_bearing_safety_factor}, "
            f"breakthrough probability {turbera_breakthrough_probability:.1%}, cushion mat {cushion_mat_thickness_cm} cm "
            f"at {histosol_water_saturation_percent}% water saturation). Retreat immediately to consolidated "
            "glacial moraine crests or bedrock ribs using dual 85 mm basket poles held horizontally if "
            "peat liquefaction occurs."
        )
        whiteout_and_hypothermia_advisory = (
            f"CRITICAL HYPOTHERMIA & WHITEOUT ALERT (effective wind chill {effective_wind_chill_c}°C, "
            f"visibility {visibility_meters} m, azimuth drift {azimuth_drift_meters_per_km} m/km): "
            "Deploy the 2-person silicone-nylon bothy storm shelter immediately on firm high ground, "
            "seal 28k hydrostatic hardshell and waterproof overmitts, and lock mirror-compass back-bearings."
        )
    elif safety_status == "caution_whiteout_fog_and_turbera_breakthrough":
        turbera_stepping_protocol = (
            "CAUTION — ACTIVE TURBERA PROBING & TUSSOCK/CUSHION BRIDGING PROTOCOL: "
            f"Cushion bearing safety factor is {cushion_bearing_safety_factor} with "
            f"{turbera_breakthrough_probability:.1%} breakthrough probability across `{substrate_morphology}`. "
            f"Advance via `{technique}`, probing inter-tussock channels with 85 mm snow-basket poles "
            "and stepping only on convex Plantago/Distichia dome centers or Calamagrostis tussock crowns."
        )
        whiteout_and_hypothermia_advisory = (
            f"OROGRAPHIC FOG & WET-CHILL CAUTION (effective wind chill {effective_wind_chill_c}°C, "
            f"visibility {visibility_meters} m, azimuth drift {azimuth_drift_meters_per_km} m/km under `{fog_regime}`): "
            "Shorten sighting legs to <40 m between giant Espeletia frailejón landmarks, verify altitude "
            "contours on barometric altimeter watch, and wear knee-high neoprene-lined panteneras."
        )
    else:
        turbera_stepping_protocol = (
            "NOMINAL MORNING ZENITH CUSHION CORRIDOR: Firm vascular cushion thickness "
            f"({cushion_mat_thickness_cm} cm) and moderate saturation ({histosol_water_saturation_percent}%) "
            f"yield a {cushion_bearing_safety_factor} bearing safety factor and low "
            f"{turbera_breakthrough_probability:.1%} breakthrough risk. Step cleanly across central "
            f"Distichia/Plantago domes via `{technique}` while protecting fragile Espeletia root collars."
        )
        whiteout_and_hypothermia_advisory = (
            f"FAVORABLE MORNING WINDOW (effective wind chill {effective_wind_chill_c}°C, "
            f"visibility {visibility_meters} m, azimuth drift {azimuth_drift_meters_per_km} m/km): "
            "Log baseline mirror-compass azimuths and altimeter waypoints before midday orographic "
            "cloud-bank buildup; keep 28k hardshell and ultralight bothy bag accessible at top of pack."
        )

    return _AttrDict(
        {
            "substrate_morphology": substrate_morphology,
            "fog_regime": fog_regime,
            "technique": technique,
            "cushion_mat_thickness_cm": round(cushion_mat_thickness_cm, 1),
            "histosol_water_saturation_percent": round(
                histosol_water_saturation_percent, 1
            ),
            "visibility_meters": round(visibility_meters, 1),
            "ambient_temp_c": round(ambient_temp_c, 1),
            "wind_speed_kmh": round(wind_speed_kmh, 1),
            "pack_weight_kg": round(pack_weight_kg, 1),
            "cushion_bearing_safety_factor": cushion_bearing_safety_factor,
            "turbera_breakthrough_probability": turbera_breakthrough_probability,
            "effective_wind_chill_c": effective_wind_chill_c,
            "azimuth_drift_meters_per_km": azimuth_drift_meters_per_km,
            "safety_status": safety_status,
            "turbera_stepping_protocol": turbera_stepping_protocol,
            "whiteout_and_hypothermia_advisory": whiteout_and_hypothermia_advisory,
        }
    )


_PARAMO_NAVIGATION_KEYWORDS: tuple[str, ...] = (
    "paramo",
    "páramo",
    "superparamo",
    "superpáramo",
    "frailejon",
    "frailejón",
    "frailejones",
    "espeletia",
    "turbera",
    "turberas",
    "distichia",
    "plantago rigida",
    "sumapaz",
    "chisaca",
    "chisacá",
    "laguna tunjos",
    "laguna de los tunjos",
    "el angel",
    "el ángel",
    "voladero",
    "cajas",
    "toreadora",
    "luspa",
    "cocuy",
    "ritacuba",
    "valle de los cojines",
    "chirripo",
    "chirripó",
    "sabana de los leones",
    "talamanca paramo",
    "talamanca páramo",
    "panteneras",
    "cushion bog",
    "cushion-bog",
    "cushion bogs",
    "histosol",
)


def is_paramo_navigation_query(query: str) -> bool:
    """Return True if the user query pertains to high-altitude páramo & frailejón cushion-bog moorland navigation."""
    if not query or not query.strip():
        return False
    q = query.lower()

    if any(
        excl in q
        for excl in (
            "krummholz",
            "bushwhack",
            "bushwhacking",
            "dwarf conifer",
            "dwarf-conifer",
            "spruce trap",
            "latschenkiefer",
            "pinus mugo",
            "hai-matsu",
            "slide alder",
            "cripplebrush",
            "timberline thicket",
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
        )
    ):
        return False

    if any(kw in q for kw in _PARAMO_NAVIGATION_KEYWORDS):
        return True

    has_andean_moorland_context = any(
        term in q
        for term in (
            "andean moorland",
            "tropical alpine moorland",
            "giant rosette",
            "polylepis ecotone",
            "cushion dome",
        )
    )
    has_paramo_mechanic = any(
        term in q
        for term in (
            "tussock crown",
            "cushion mat",
            "peat mire",
            "orographic drizzle",
            "needle ice",
            "bothy bag",
        )
    )
    return has_andean_moorland_context and has_paramo_mechanic


detect_paramo_navigation_intent = is_paramo_navigation_query


def extract_paramo_navigation_params(query: str) -> dict[str, Any]:
    """Extract site_id, substrate_morphology, fog_regime, technique, and numerical parameters from query."""
    q = query.lower()
    params: dict[str, Any] = {
        "site_id": None,
        "substrate_morphology": "plantago_distichia_cushion_bog_dome",
        "fog_regime": "morning_zenith_uv_window",
        "technique": "distichia_cushion_dome_stepping",
        "cushion_mat_thickness_cm": 38.0,
        "histosol_water_saturation_percent": 68.0,
        "visibility_meters": 220.0,
        "ambient_temp_c": 8.0,
        "wind_speed_kmh": 16.0,
        "pack_weight_kg": 14.0,
        "has_explicit_numbers": False,
        "is_calculation": False,
    }

    site_patterns: list[tuple[tuple[str, ...], str]] = [
        (
            ("sumapaz", "chisaca", "chisacá", "tunjos", "cundinamarca"),
            "sumapaz-chisaca-laguna-tunjos-paramo",
        ),
        (
            ("el angel", "el ángel", "voladero", "carchi"),
            "el-angel-frailejon-giant-rosette-reserve",
        ),
        (
            ("cajas", "toreadora", "luspa", "azuay"),
            "cajas-toreadora-glacial-turbera-labyrinth",
        ),
        (
            ("cocuy", "ritacuba", "cojines", "boyaca", "boyacá"),
            "cocuy-ritacuba-superparamo-cushion-pass",
        ),
        (
            ("chirripo", "chirripó", "sabana de los leones", "conejos", "talamanca"),
            "chirripo-sabana-de-los-leones-talamanca-paramo",
        ),
    ]
    for aliases, site_id in site_patterns:
        if site_id in q or any(alias in q for alias in aliases):
            params["site_id"] = site_id
            site = get_paramo_site_by_id(site_id)
            if site is not None:
                params["substrate_morphology"] = site["substrate_morphology"]
                params["fog_regime"] = site["fog_regime"]
                params["technique"] = site["technique"]
                params["cushion_mat_thickness_cm"] = site[
                    "mean_cushion_mat_thickness_cm"
                ]
                params["histosol_water_saturation_percent"] = site[
                    "histosol_water_saturation_percent"
                ]
                params["visibility_meters"] = site["typical_visibility_meters"]
                params["ambient_temp_c"] = site["typical_ambient_temp_c"]
                params["wind_speed_kmh"] = site["typical_wind_speed_kmh"]
            break

    # Override substrate_morphology if explicitly mentioned
    if (
        "waterlogged_histosol_turbera_basin" in q
        or "waterlogged histosol" in q
        or "turbera basin" in q
    ):
        params["substrate_morphology"] = "waterlogged_histosol_turbera_basin"
    elif (
        "superparamo_periglacial_solifluction_scree" in q
        or "solifluction scree" in q
        or "periglacial solifluction" in q
    ):
        params["substrate_morphology"] = (
            "superparamo_periglacial_solifluction_scree"
        )
    elif (
        "polylepis_cloud_forest_ecotone_margin" in q
        or "polylepis" in q
        or "cloud forest ecotone" in q
    ):
        params["substrate_morphology"] = (
            "polylepis_cloud_forest_ecotone_margin"
        )
    elif (
        "espeletia_frailejon_tussock_matrix" in q
        or "tussock matrix" in q
        or "frailejon tussock" in q
        or "frailejón tussock" in q
    ):
        params["substrate_morphology"] = "espeletia_frailejon_tussock_matrix"
    elif (
        "plantago_distichia_cushion_bog_dome" in q
        or "cushion bog dome" in q
        or "cushion-bog dome" in q
        or "plantago" in q
    ):
        params["substrate_morphology"] = "plantago_distichia_cushion_bog_dome"

    # Override fog_regime if explicitly mentioned
    if (
        "freezing_horizontal_sleet_squall" in q
        or "sleet squall" in q
        or "freezing horizontal sleet" in q
    ):
        params["fog_regime"] = "freezing_horizontal_sleet_squall"
    elif (
        "nocturnal_radiative_needle_ice_frost" in q
        or "needle ice" in q
        or "needle-ice" in q
        or "radiative frost" in q
    ):
        params["fog_regime"] = "nocturnal_radiative_needle_ice_frost"
    elif (
        "orographic_paramo_drizzle_whiteout" in q
        or "drizzle whiteout" in q
        or "orographic paramo drizzle" in q
    ):
        params["fog_regime"] = "orographic_paramo_drizzle_whiteout"
    elif (
        "morning_zenith_uv_window" in q
        or "morning zenith" in q
        or "uv window" in q
    ):
        params["fog_regime"] = "morning_zenith_uv_window"

    # Override technique if explicitly mentioned
    if (
        "compass_pacing_azimuth_dead_reckoning" in q
        or "azimuth dead reckoning" in q
        or "compass pacing" in q
    ):
        params["technique"] = "compass_pacing_azimuth_dead_reckoning"
    elif (
        "wellies_and_gaiter_turbera_contouring" in q
        or "turbera contouring" in q
        or "wellies" in q
    ):
        params["technique"] = "wellies_and_gaiter_turbera_contouring"
    elif (
        "tussock_crown_bridging_with_baskets" in q
        or "tussock crown bridging" in q
        or "crown bridging" in q
    ):
        params["technique"] = "tussock_crown_bridging_with_baskets"
    elif (
        "distichia_cushion_dome_stepping" in q
        or "cushion dome stepping" in q
        or "dome stepping" in q
    ):
        params["technique"] = "distichia_cushion_dome_stepping"

    # Extract cushion_mat_thickness_cm
    thickness_match = re.search(
        r"(?:(?:cushion\s+(?:mat\s+)?)?thickness(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*cm\b|(\d+(?:\.\d+)?)\s*cm\s+(?:cushion\s+)?(?:mat\s+)?thickness)",
        q,
    )
    if thickness_match:
        val = float(thickness_match.group(1) or thickness_match.group(2))
        params["cushion_mat_thickness_cm"] = max(2.0, min(100.0, val))
        params["has_explicit_numbers"] = True

    # Extract histosol_water_saturation_percent
    saturation_match = re.search(
        r"(?:(?:histosol\s+)?(?:water\s+)?saturation(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*%?|(\d+(?:\.\d+)?)\s*%\s*(?:histosol\s+)?(?:water\s+)?saturation)",
        q,
    )
    if saturation_match:
        val = float(saturation_match.group(1) or saturation_match.group(2))
        params["histosol_water_saturation_percent"] = max(20.0, min(100.0, val))
        params["has_explicit_numbers"] = True

    # Extract visibility_meters
    vis_match = re.search(
        r"(?:visibility(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*(?:meters?|m)\b|(\d+(?:\.\d+)?)\s*(?:meters?|m)\s+visibility)",
        q,
    )
    if vis_match:
        val = float(vis_match.group(1) or vis_match.group(2))
        params["visibility_meters"] = max(2.0, min(2000.0, val))
        params["has_explicit_numbers"] = True

    # Extract ambient_temp_c
    temp_match = re.search(
        r"(?:(?:ambient\s+)?temp(?:erature)?(?:\s+of)?\s*(-?\d+(?:\.\d+)?)\s*°?\s*c\b|(-?\d+(?:\.\d+)?)\s*°?\s*c\s+(?:ambient\s+)?temp)",
        q,
    )
    if temp_match:
        val = float(temp_match.group(1) or temp_match.group(2))
        params["ambient_temp_c"] = max(-15.0, min(28.0, val))
        params["has_explicit_numbers"] = True

    # Extract wind_speed_kmh
    wind_match = re.search(
        r"(?:wind(?:\s+speed)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*(?:km/h|kmh|kph)\b|(\d+(?:\.\d+)?)\s*(?:km/h|kmh|kph)\b)",
        q,
    )
    if wind_match:
        val = float(wind_match.group(1) or wind_match.group(2))
        params["wind_speed_kmh"] = max(0.0, min(120.0, val))
        params["has_explicit_numbers"] = True

    # Extract pack_weight_kg
    pack_match = re.search(
        r"(?:pack(?:\s+weight)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*kg\b|(\d+(?:\.\d+)?)\s*kg\s+pack)",
        q,
    )
    if pack_match:
        val = float(pack_match.group(1) or pack_match.group(2))
        params["pack_weight_kg"] = max(0.0, min(45.0, val))
        params["has_explicit_numbers"] = True

    calc_triggers = (
        "calculate",
        "evaluate",
        "assess",
        "breakthrough probability",
        "bearing safety factor",
        "azimuth drift",
        "wind chill",
    )
    params["is_calculation"] = bool(params["has_explicit_numbers"]) or any(
        t in q for t in calc_triggers
    )

    return params


def format_paramo_navigation_response(
    query: str,
) -> tuple[str, dict[str, Any]]:
    """Format a structured markdown answer and info dictionary for páramo navigation queries."""
    params = extract_paramo_navigation_params(query)
    is_calc = bool(params["is_calculation"])

    if is_calc:
        calc_result = calculate_paramo_navigation_safety(
            substrate_morphology=params["substrate_morphology"],
            fog_regime=params["fog_regime"],
            technique=params["technique"],
            cushion_mat_thickness_cm=float(params["cushion_mat_thickness_cm"]),
            histosol_water_saturation_percent=float(
                params["histosol_water_saturation_percent"]
            ),
            visibility_meters=float(params["visibility_meters"]),
            ambient_temp_c=float(params["ambient_temp_c"]),
            wind_speed_kmh=float(params["wind_speed_kmh"]),
            pack_weight_kg=float(params["pack_weight_kg"]),
        )
        gear_list = [dict(g) for g in get_paramo_gear_checklist()]
        calc_info: dict[str, Any] = {
            **dict(calc_result),
            "action": "paramo_navigation_calculated",
            "calculation": dict(calc_result),
            "gear_checklist": gear_list,
        }
        if params["site_id"]:
            matched_site = get_paramo_site_by_id(str(params["site_id"]))
            if matched_site is not None:
                calc_info["site"] = dict(matched_site)

        answer = (
            "### High-Altitude Páramo & Frailejón Cushion-Bog Navigation Safety Assessment\n\n"
            f"- **Safety Status:** `{calc_result['safety_status']}`\n"
            f"- **Cushion Bearing Safety Factor:** `{calc_result['cushion_bearing_safety_factor']}` "
            f"(`{calc_result['substrate_morphology']}`, {calc_result['cushion_mat_thickness_cm']} cm mat, "
            f"{calc_result['pack_weight_kg']} kg pack)\n"
            f"- **Turbera Breakthrough Probability:** `{calc_result['turbera_breakthrough_probability']:.1%}` "
            f"({calc_result['histosol_water_saturation_percent']}% Histosol saturation, `{calc_result['technique']}`)\n"
            f"- **Effective Wind Chill:** `{calc_result['effective_wind_chill_c']} °C` "
            f"({calc_result['ambient_temp_c']} °C ambient, {calc_result['wind_speed_kmh']} km/h wind, `{calc_result['fog_regime']}`)\n"
            f"- **Azimuth Drift:** `{calc_result['azimuth_drift_meters_per_km']} m/km` "
            f"({calc_result['visibility_meters']} m visibility)\n\n"
            f"**Turbera Stepping Protocol:** {calc_result['turbera_stepping_protocol']}\n\n"
            f"**Whiteout & Hypothermia Advisory:** {calc_result['whiteout_and_hypothermia_advisory']}"
        )
        return answer, calc_info

    if params["site_id"]:
        site = get_paramo_site_by_id(str(params["site_id"]))
        if site is not None:
            site_calc = calculate_paramo_navigation_safety(
                substrate_morphology=site["substrate_morphology"],
                fog_regime=site["fog_regime"],
                technique=site["technique"],
                cushion_mat_thickness_cm=float(
                    site["mean_cushion_mat_thickness_cm"]
                ),
                histosol_water_saturation_percent=float(
                    site["histosol_water_saturation_percent"]
                ),
                visibility_meters=float(site["typical_visibility_meters"]),
                ambient_temp_c=float(site["typical_ambient_temp_c"]),
                wind_speed_kmh=float(site["typical_wind_speed_kmh"]),
                pack_weight_kg=14.0,
            )
            lookup_info: dict[str, Any] = {
                "action": "paramo_navigation_lookup",
                "site": dict(site),
                "baseline_calculation": dict(site_calc),
                "gear_checklist": [
                    dict(g) for g in get_paramo_gear_checklist()
                ],
            }
            answer = (
                f"### {site['name']} ({site['region']})\n\n"
                f"- **Site ID:** `{site['id']}` (Elevation: {site['elevation_m']} m)\n"
                f"- **Substrate Morphology:** `{site['substrate_morphology']}` "
                f"(Cushion Mat Thickness: {site['mean_cushion_mat_thickness_cm']} cm, "
                f"Histosol Saturation: {site['histosol_water_saturation_percent']}%)\n"
                f"- **Andean Cloud-Fog Regime:** `{site['fog_regime']}` "
                f"(Visibility: {site['typical_visibility_meters']} m, Temp: {site['typical_ambient_temp_c']} °C, "
                f"Wind: {site['typical_wind_speed_kmh']} km/h)\n"
                f"- **Recommended Traversal Technique:** `{site['technique']}`\n"
                f"- **Primary Hazard:** {site['primary_hazard']}\n"
                f"- **Turbera Stepping & Wayfinding Protocol:** {site['turbera_stepping_and_wayfinding_protocol']}\n"
                f"- **Field Notes:** {site['field_notes']}"
            )
            return answer, lookup_info

    sites_list = [dict(s) for s in get_all_paramo_sites()]
    gear_list = [dict(g) for g in get_paramo_gear_checklist()]
    general_info: dict[str, Any] = {
        "action": "paramo_navigation_info",
        "sites": sites_list,
        "gear_checklist": gear_list,
    }
    site_bullets = "\n".join(
        f"- **{s['name']}** (`{s['id']}`, {s['region']}, {s['elevation']} m): `{s['substrate_morphology']}` / `{s['fog_regime']}`"
        for s in sites_list
    )
    gear_bullets = "\n".join(
        f"- **{g['name']}** (`{g['category']}`): {g['rationale']}"
        for g in gear_list
    )
    answer = (
        "### High-Altitude Páramo & Frailejón Cushion-Bog Moorland Navigation Guide\n\n"
        "Navigating high-altitude Andean and Talamanca páramo moorlands, Espeletia frailejón "
        "tussock matrices, and Plantago/Distichia cushion-bog domes requires probing concealed "
        "waterlogged Histosol turbera trenches with 85 mm basket poles, wearing knee-high neoprene "
        "panteneras, executing mirror-compass dead reckoning through orographic cloud-fog whiteouts, "
        "and carrying an emergency bothy storm shelter.\n\n"
        "#### Curated High-Altitude Páramo Reference Sites\n"
        f"{site_bullets}\n\n"
        "#### Mandatory 6-Item Páramo Navigation Gear Checklist\n"
        f"{gear_bullets}"
    )
    return answer, general_info


def build_paramo_navigation_prompt(query: str = "") -> str:
    """Build system prompt context for LLM augmentation on high-altitude páramo navigation topics."""
    answer, _ = format_paramo_navigation_response(query)
    return (
        "You are an expert high-altitude tropical Andean eco-hydrologist and Páramo & Frailejón Cushion-Bog Moorland Navigation specialist. "
        "Use the following Plantago/Distichia cushion bearing safety factor, Histosol turbera breakthrough probability, and orographic whiteout telemetry to answer the user's question:\n\n"
        f"{answer}"
    )
