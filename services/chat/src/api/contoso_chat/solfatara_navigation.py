"""Backcountry Geothermal Fumarole Field & Solfatara Gas Hazard Navigation Domain Module.

Provides domain logic, curated hydrothermal solfatara/fumarole field catalogs,
mandatory multi-gas/thermal-crust safety gear checklists, crust bearing safety
and dense gas accumulation physics calculations, intent detection, and response
formatting for backcountry geothermal fumarole and solfatara navigation queries.
"""

import re
from typing import Any, Literal, Optional

HydrothermalCrustType = Literal[
    "siliceous_geyserite_sinter_shield",
    "argillic_kaolinite_steam_crust",
    "native_sulfur_sublimation_dome",
    "travertine_carbonate_terrace",
    "undercut_boiling_mudpot_apron",
]

VolcanicGasRegime = Literal[
    "h2s_so2_acid_fume_plume",
    "co2_cold_mofette_topographic_pooling",
    "superheated_fumarolic_steam_jet",
    "mixed_solfatara_degassing_basin",
]

BoundaryLayerWindState = Literal[
    "katabatic_calms_inversion_trap",
    "steady_upwind_ridge_ventilation",
    "gusty_rotors_plume_downwash",
    "barometric_drop_outgassing_surge",
]

SolfataraSafetyStatus = Literal[
    "nominal_upwind_sinter_corridor",
    "caution_acid_plume_respirator_required",
    "abort_lethal_gas_pool_or_crust_collapse",
]

VALID_CRUST_TYPES: set[str] = {
    "siliceous_geyserite_sinter_shield",
    "argillic_kaolinite_steam_crust",
    "native_sulfur_sublimation_dome",
    "travertine_carbonate_terrace",
    "undercut_boiling_mudpot_apron",
}

VALID_GAS_REGIMES: set[str] = {
    "h2s_so2_acid_fume_plume",
    "co2_cold_mofette_topographic_pooling",
    "superheated_fumarolic_steam_jet",
    "mixed_solfatara_degassing_basin",
}

VALID_WIND_STATES: set[str] = {
    "katabatic_calms_inversion_trap",
    "steady_upwind_ridge_ventilation",
    "gusty_rotors_plume_downwash",
    "barometric_drop_outgassing_surge",
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


SOLFATARA_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "katmai-valley-of-ten-thousand-smokes-fumaroles",
            "name": "Valley of Ten Thousand Smokes & Novarupta Vent Dome",
            "region": "Katmai National Park, Alaska, USA",
            "elevation": 840,
            "elevation_m": 840,
            "crust_type": "siliceous_geyserite_sinter_shield",
            "gas_regime": "superheated_fumarolic_steam_jet",
            "wind_state": "steady_upwind_ridge_ventilation",
            "mean_crust_thickness_cm": 28.0,
            "subsurface_temp_10cm_c": 62.0,
            "basin_depression_depth_m": 2.5,
            "baseline_so2_ppm": 1.2,
            "baseline_h2s_ppm": 0.8,
            "primary_hazard": (
                "Relict ignimbrite fissure vents and localized steam-heated silica sinter bridges "
                "concealing high-temperature fractures along the Baked Mountain and Novarupta dome margins."
            ),
            "windward_escape_bearing": (
                "Ascend west-northwest up the cross-wind ignimbrite terrace toward Baked Mountain ridge "
                "whenever katabatic valley gusts shift steam plumes down-canyon."
            ),
            "field_notes": (
                "Indurated siliceous sinter shields provide solid bearing capacity across main benches, "
                "but probe actively bleached fracture rims where shallow ground temperatures exceed 60°C."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "lassens-bumpass-hell-devil-kitchen-solfatara",
            "name": "Bumpass Hell & Devil's Kitchen Acid-Sulfate Basin",
            "region": "Lassen Volcanic National Park, California, USA",
            "elevation": 2500,
            "elevation_m": 2500,
            "crust_type": "argillic_kaolinite_steam_crust",
            "gas_regime": "h2s_so2_acid_fume_plume",
            "wind_state": "gusty_rotors_plume_downwash",
            "mean_crust_thickness_cm": 14.0,
            "subsurface_temp_10cm_c": 84.0,
            "basin_depression_depth_m": 5.5,
            "baseline_so2_ppm": 3.8,
            "baseline_h2s_ppm": 6.5,
            "primary_hazard": (
                "Acid-sulfate alteration converts dacite bedrock into friable kaolinite and alunite clays "
                "overlying boiling pyrite-rich mudpots and roaring fumaroles like Big Boiler."
            ),
            "windward_escape_bearing": (
                "Retreat immediately upslope to the south-southwest caldera rim trail at least 25 m above "
                "the bleached hydrothermal amphitheater floor."
            ),
            "field_notes": (
                "Bright white and yellow altered ground is structurally compromised; probing every step with "
                "a graduated thermal pole and wearing an OV/AG/P100 respirator in downwash rotors are mandatory."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "askja-viti-kverkfjoll-geothermal-ice-fumaroles",
            "name": "Askja Víti Crater & Kverkfjöll Subglacial Solfatara Field",
            "region": "Dyngjufjöll Highlands, Iceland",
            "elevation": 1100,
            "elevation_m": 1100,
            "crust_type": "undercut_boiling_mudpot_apron",
            "gas_regime": "mixed_solfatara_degassing_basin",
            "wind_state": "barometric_drop_outgassing_surge",
            "mean_crust_thickness_cm": 9.0,
            "subsurface_temp_10cm_c": 92.0,
            "basin_depression_depth_m": 11.0,
            "baseline_so2_ppm": 8.5,
            "baseline_h2s_ppm": 14.0,
            "primary_hazard": (
                "Thinly crusted boiling mudpot aprons and subglacial ice-cauldron fumarole collars subject "
                "to sudden H2S/SO2/CO2 surges during North Atlantic low-pressure barometric drops."
            ),
            "windward_escape_bearing": (
                "Climb directly onto the basaltic crater rim crest perpendicular to the prevailing plume "
                "axis; never shelter inside warm fumarolic ice caves or crater gullies."
            ),
            "field_notes": (
                "Undercut clay aprons around Víti and Hveradalir collapse without warning into 90–98°C "
                "acidic mud; maintain strict rope and probe standoffs when barometric pressure is falling."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "el-tatio-atacama-high-altitude-geyser-sinter",
            "name": "El Tatio High-Andean Geyser & Sinter Terrace Field",
            "region": "Antofagasta Region, Chile",
            "elevation": 4320,
            "elevation_m": 4320,
            "crust_type": "travertine_carbonate_terrace",
            "gas_regime": "superheated_fumarolic_steam_jet",
            "wind_state": "katabatic_calms_inversion_trap",
            "mean_crust_thickness_cm": 22.0,
            "subsurface_temp_10cm_c": 76.0,
            "basin_depression_depth_m": 3.0,
            "baseline_so2_ppm": 1.8,
            "baseline_h2s_ppm": 2.4,
            "primary_hazard": (
                "Pre-dawn radiative inversions trap dense steam and H2S over thin sinter overhangs bordering "
                "86°C boiling geyser conduits at 4,320 m altitude."
            ),
            "windward_escape_bearing": (
                "Move east onto elevated gravel moraine benches until solar heating breaks the nocturnal "
                "inversion and clears ground-hugging steam banks."
            ),
            "field_notes": (
                "Boiling point at 4,320 m is ~86°C, masking vigorous ebullition; frost-coated sinter flanges "
                "around active spouters frequently overhang hollow scalding conduits."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "mutnovsky-active-crater-sulfur-fumarole-canyon",
            "name": "Mutnovsky Volcano Active Crater & Donnoe Solfatara Field",
            "region": "Kamchatka Peninsula, Russia",
            "elevation": 1680,
            "elevation_m": 1680,
            "crust_type": "native_sulfur_sublimation_dome",
            "gas_regime": "co2_cold_mofette_topographic_pooling",
            "wind_state": "katabatic_calms_inversion_trap",
            "mean_crust_thickness_cm": 11.0,
            "subsurface_temp_10cm_c": 89.0,
            "basin_depression_depth_m": 14.0,
            "baseline_so2_ppm": 12.0,
            "baseline_h2s_ppm": 18.5,
            "primary_hazard": (
                "Brittle yellow native-sulfur sublimation domes and deep glacial-volcanic depressions where "
                "heavier-than-air CO2 and H2S pool to asphyxiating concentrations."
            ),
            "windward_escape_bearing": (
                "Exit Vulkannaya River canyon breaches immediately via high windward basalt ribs; avoid all "
                "closed snow-moat depressions and sulfur chimney lees."
            ),
            "field_notes": (
                "Crystalline sulfur turrets are hollow and fracture under boot loads while emitting 150–300°C "
                "choking SO2/H2S/HF gas jets; continuous pumped four-gas monitoring at ankle height is vital."
            ),
        }
    ),
]


SOLFATARA_GEAR_CHECKLIST: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "four-gas-pumped-electrochemical-detector",
            "name": "Pumped 4-Gas Electrochemical & NDIR Detector (SO2 / H2S / CO2 / O2)",
            "category": "gas_telemetry",
            "mandatory": True,
            "rationale": (
                "Provides continuous real-time telemetry of toxic H2S (low-level 5 ppm / high-level 10 ppm alarms), "
                "acidic SO2 (2 ppm / 5 ppm alarms), asphyxiating CO2 (>5,000 ppm), and O2 depletion (<19.5%) using "
                "a sampling wand held at ankle/knee height before stepping into topographic depressions."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "niorsh-ov-ag-p100-acid-gas-half-mask-respirator",
            "name": "NIOSH OV/AG/P100 Acid-Gas Half-Mask Elastomeric Respirator",
            "category": "respiratory_defense",
            "mandatory": True,
            "rationale": (
                "Filters sulfur dioxide (SO2), hydrogen sulfide (H2S), hydrogen chloride/fluoride acid aerosols, "
                "and sulfuric acid mist during unexpected plume downwash or cross-wind traverses. (Note: air-purifying "
                "cartridges do not supply oxygen in CO2 mofette asphyxiation zones)."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "carbon-fiber-graduated-thermal-crust-probe-pole",
            "name": "Graduated Carbon-Fiber Hydrothermal Crust Probe Staff (1.6 m, Blunt Steel Tip)",
            "category": "crust_probing",
            "mandatory": True,
            "rationale": (
                "Tests flexural resistance and thickness of siliceous sinter, travertine ledges, and argillic clay "
                "crusts 1.5 m ahead of the lead traveller's boots to prevent punch-through into boiling mudpots."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "sealed-polycarbonate-chemical-splash-goggles",
            "name": "Indirect-Vent / Sealed Polycarbonate Acid-Fume & Splash Goggles",
            "category": "respiratory_defense",
            "mandatory": True,
            "rationale": (
                "Prevents corneal chemical burns and severe blepharospasm triggered by acidic SO2/H2S vapor plumes "
                "and ejecta from spattering mudpots or superheated fumarolic steam jets."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "bi-metal-soil-probe-stem-thermometer",
            "name": "Armored Bi-Metal / Thermocouple 10 cm Subsurface Soil Probe Thermometer (0–150°C)",
            "category": "crust_probing",
            "mandatory": True,
            "rationale": (
                "Measures shallow subsurface thermal gradients at 10 cm depth; temperatures above 65–75°C indicate "
                "active steam condensation, rapid acid-clay weakening, and imminent breakthrough hazard."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "ptfe-acid-resistant-overboots-and-gaiters",
            "name": "PTFE/Butyl Acid-Resistant Thermal Overboots & Sealed Knee Gaiters",
            "category": "thermal_footwear",
            "mandatory": True,
            "rationale": (
                "Protects mountaineering boot rand adhesives and lower extremities from pH 1–2 sulfuric acid water, "
                "scalding steam vents, and shallow surface crust shear."
            ),
        }
    ),
]


def get_all_solfatara_sites() -> list[dict[str, Any]]:
    """Return all curated backcountry geothermal fumarole and solfatara sites."""
    return list(SOLFATARA_SITES)


def get_solfatara_site_by_id(site_id: str) -> Optional[dict[str, Any]]:
    """Return a single solfatara site by ID, or None if not found."""
    normalized = site_id.strip().lower()
    for site in SOLFATARA_SITES:
        if site["id"] == normalized:
            return site
    return None


def filter_solfatara_sites(
    crust_type: str | None = None,
    gas_regime: str | None = None,
    wind_state: str | None = None,
) -> list[dict[str, Any]]:
    """Filter curated solfatara sites by crust_type, gas_regime, and/or wind_state.

    Raises ValueError if any supplied filter value is not in the valid domain literal set.
    """
    if crust_type is not None and crust_type not in VALID_CRUST_TYPES:
        raise ValueError(
            f"Invalid crust_type '{crust_type}'. Must be one of {sorted(VALID_CRUST_TYPES)}."
        )
    if gas_regime is not None and gas_regime not in VALID_GAS_REGIMES:
        raise ValueError(
            f"Invalid gas_regime '{gas_regime}'. Must be one of {sorted(VALID_GAS_REGIMES)}."
        )
    if wind_state is not None and wind_state not in VALID_WIND_STATES:
        raise ValueError(
            f"Invalid wind_state '{wind_state}'. Must be one of {sorted(VALID_WIND_STATES)}."
        )

    results = list(SOLFATARA_SITES)
    if crust_type is not None:
        results = [s for s in results if s["crust_type"] == crust_type]
    if gas_regime is not None:
        results = [s for s in results if s["gas_regime"] == gas_regime]
    if wind_state is not None:
        results = [s for s in results if s["wind_state"] == wind_state]
    return results


def get_solfatara_gear_checklist() -> list[dict[str, Any]]:
    """Return the mandatory 6-item solfatara and fumarole field safety gear checklist."""
    return list(SOLFATARA_GEAR_CHECKLIST)


def calculate_solfatara_navigation_safety(
    crust_type: str = "siliceous_geyserite_sinter_shield",
    gas_regime: str = "superheated_fumarolic_steam_jet",
    wind_state: str = "steady_upwind_ridge_ventilation",
    sinter_crust_thickness_cm: float = 24.0,
    subsurface_temp_10cm_c: float = 65.0,
    wind_speed_kmh: float = 22.0,
    basin_depression_depth_m: float = 2.5,
    ambient_so2_ppm: float = 1.0,
    ambient_h2s_ppm: float = 0.8,
) -> dict[str, Any]:
    """Calculate hydrothermal crust bearing safety factor and dense gas accumulation hazard."""
    if crust_type not in VALID_CRUST_TYPES:
        raise ValueError(
            f"Invalid crust_type '{crust_type}'. Must be one of {sorted(VALID_CRUST_TYPES)}."
        )
    if gas_regime not in VALID_GAS_REGIMES:
        raise ValueError(
            f"Invalid gas_regime '{gas_regime}'. Must be one of {sorted(VALID_GAS_REGIMES)}."
        )
    if wind_state not in VALID_WIND_STATES:
        raise ValueError(
            f"Invalid wind_state '{wind_state}'. Must be one of {sorted(VALID_WIND_STATES)}."
        )
    if not (1.0 <= sinter_crust_thickness_cm <= 150.0):
        raise ValueError(
            f"sinter_crust_thickness_cm ({sinter_crust_thickness_cm}) must be between 1.0 and 150.0 cm."
        )
    if not (0.0 <= subsurface_temp_10cm_c <= 130.0):
        raise ValueError(
            f"subsurface_temp_10cm_c ({subsurface_temp_10cm_c}) must be between 0.0 and 130.0 °C."
        )
    if not (0.0 <= wind_speed_kmh <= 120.0):
        raise ValueError(f"wind_speed_kmh ({wind_speed_kmh}) must be between 0.0 and 120.0 km/h.")
    if not (0.0 <= basin_depression_depth_m <= 60.0):
        raise ValueError(
            f"basin_depression_depth_m ({basin_depression_depth_m}) must be between 0.0 and 60.0 m."
        )
    if not (0.0 <= ambient_so2_ppm <= 100.0):
        raise ValueError(f"ambient_so2_ppm ({ambient_so2_ppm}) must be between 0.0 and 100.0 ppm.")
    if not (0.0 <= ambient_h2s_ppm <= 100.0):
        raise ValueError(f"ambient_h2s_ppm ({ambient_h2s_ppm}) must be between 0.0 and 100.0 ppm.")

    crust_modulus_map: dict[str, float] = {
        "siliceous_geyserite_sinter_shield": 1.40,
        "travertine_carbonate_terrace": 1.15,
        "argillic_kaolinite_steam_crust": 1.02,
        "native_sulfur_sublimation_dome": 0.65,
        "undercut_boiling_mudpot_apron": 0.35,
    }
    crust_mod = crust_modulus_map[crust_type]

    # Thermal softening penalty as 10 cm subsurface temperature approaches boiling
    thermal_degradation = max(0.35, 1.0 - max(0.0, subsurface_temp_10cm_c - 45.0) * 0.0065)

    # Bearing safety factor: thickness normalized against 12 cm nominal reference
    raw_safety_factor = (sinter_crust_thickness_cm / 12.0) * crust_mod * thermal_degradation
    crust_bearing_safety_factor = round(max(0.1, min(6.0, raw_safety_factor)), 2)

    # Breakthrough probability inversely related to safety factor and elevated by high shallow temperature
    temp_surge = max(0.0, (subsurface_temp_10cm_c - 70.0) / 100.0) * 0.25
    raw_breakthrough = (1.0 / (1.0 + (crust_bearing_safety_factor**2.2))) + temp_surge
    if crust_bearing_safety_factor >= 1.8 and subsurface_temp_10cm_c < 75.0:
        raw_breakthrough = min(raw_breakthrough, 0.14)
    scald_breakthrough_probability = round(max(0.01, min(0.99, raw_breakthrough)), 3)

    # Dense gas accumulation index (0.0 to 100.0 scale)
    gas_regime_weight: dict[str, float] = {
        "superheated_fumarolic_steam_jet": 14.0,
        "h2s_so2_acid_fume_plume": 28.0,
        "mixed_solfatara_degassing_basin": 38.0,
        "co2_cold_mofette_topographic_pooling": 48.0,
    }
    wind_state_weight: dict[str, float] = {
        "steady_upwind_ridge_ventilation": -8.0,
        "gusty_rotors_plume_downwash": 12.0,
        "barometric_drop_outgassing_surge": 18.0,
        "katabatic_calms_inversion_trap": 24.0,
    }

    ppm_hazard = (ambient_so2_ppm / 15.0) * 22.0 + (ambient_h2s_ppm / 20.0) * 28.0
    topographic_trap = min(22.0, (basin_depression_depth_m / 20.0) * 22.0)
    ventilation_relief = min(18.0, (wind_speed_kmh / 35.0) * 16.0)

    raw_gas_index = (
        gas_regime_weight[gas_regime]
        + wind_state_weight[wind_state]
        + ppm_hazard
        + topographic_trap
        - ventilation_relief
    )
    dense_gas_accumulation_index = round(max(2.0, min(99.0, raw_gas_index)), 2)

    # Determine safety status
    safety_status: SolfataraSafetyStatus
    if (
        crust_bearing_safety_factor < 0.85
        or scald_breakthrough_probability >= 0.60
        or dense_gas_accumulation_index >= 68.0
        or ambient_h2s_ppm >= 10.0
        or ambient_so2_ppm >= 8.0
        or subsurface_temp_10cm_c >= 90.0
    ):
        safety_status = "abort_lethal_gas_pool_or_crust_collapse"
    elif (
        crust_bearing_safety_factor < 1.55
        or scald_breakthrough_probability >= 0.25
        or dense_gas_accumulation_index >= 35.0
        or ambient_h2s_ppm >= 2.0
        or ambient_so2_ppm >= 1.5
        or subsurface_temp_10cm_c >= 72.0
    ):
        safety_status = "caution_acid_plume_respirator_required"
    else:
        safety_status = "nominal_upwind_sinter_corridor"

    # Recommended standoff distance (m)
    base_standoff = 5.0
    if safety_status == "caution_acid_plume_respirator_required":
        base_standoff = 18.0
    elif safety_status == "abort_lethal_gas_pool_or_crust_collapse":
        base_standoff = 45.0

    standoff_distance = round(
        base_standoff
        + (dense_gas_accumulation_index * 0.30)
        + max(0.0, (90.0 - sinter_crust_thickness_cm) * 0.12),
        1,
    )

    if safety_status == "abort_lethal_gas_pool_or_crust_collapse":
        windward_routing_protocol = (
            "EMERGENCY ABORT: Evacuate immediately perpendicular/upwind onto consolidated bedrock ridges "
            f"(minimum {standoff_distance} m standoff). Strictly avoid all topographic depressions, gully bottoms, "
            "and snow-moat mofettes where heavier-than-air CO2 and H2S pool to lethal concentrations."
        )
        crust_probing_and_respirator_advisory = (
            "CRITICAL HAZARD: Hydrothermal crust bearing factor or toxic gas accumulation exceeds safe limits "
            f"(safety factor {crust_bearing_safety_factor}, H2S {ambient_h2s_ppm} ppm, SO2 {ambient_so2_ppm} ppm). "
            "Don NIOSH OV/AG/P100 respirator + sealed splash goggles for emergency egress only; do not traverse "
            "undercut boiling mudpot aprons or native sulfur domes."
        )
    elif safety_status == "caution_acid_plume_respirator_required":
        windward_routing_protocol = (
            "CAUTION — UPWIND FLANK ROUTING: Maintain strict windward positioning relative to active fumaroles "
            f"with a {standoff_distance} m vent standoff. Stay out of closed basin hollows (>3 m depth) during "
            "gusty downwash or barometric drops."
        )
        crust_probing_and_respirator_advisory = (
            "Don NIOSH OV/AG/P100 acid-gas respirator and sealed polycarbonate goggles before entering plume fringes. "
            "Probe every step 1.5 m ahead with a graduated carbon-fiber staff and verify 10 cm soil temperature "
            f"(currently {subsurface_temp_10cm_c:.1f}°C) stays below 75°C."
        )
    else:
        windward_routing_protocol = (
            "NOMINAL UPWIND SINTER CORRIDOR: Traverse along indurated windward sinter shields while maintaining "
            f"at least {standoff_distance} m clearance from active steam jets and boiling vents."
        )
        crust_probing_and_respirator_advisory = (
            "Carry pumped 4-gas detector active at belt/ankle level and keep OV/AG/P100 respirator at the ready. "
            "Probe bleached fracture margins and verify crust thickness remains >= 20 cm."
        )

    return _AttrDict(
        {
            "crust_type": crust_type,
            "gas_regime": gas_regime,
            "wind_state": wind_state,
            "sinter_crust_thickness_cm": round(sinter_crust_thickness_cm, 1),
            "subsurface_temp_10cm_c": round(subsurface_temp_10cm_c, 1),
            "wind_speed_kmh": round(wind_speed_kmh, 1),
            "basin_depression_depth_m": round(basin_depression_depth_m, 1),
            "ambient_so2_ppm": round(ambient_so2_ppm, 2),
            "ambient_h2s_ppm": round(ambient_h2s_ppm, 2),
            "crust_bearing_safety_factor": crust_bearing_safety_factor,
            "scald_breakthrough_probability": scald_breakthrough_probability,
            "dense_gas_accumulation_index": dense_gas_accumulation_index,
            "recommended_standoff_distance_m": standoff_distance,
            "safety_status": safety_status,
            "windward_routing_protocol": windward_routing_protocol,
            "crust_probing_and_respirator_advisory": crust_probing_and_respirator_advisory,
        }
    )


_SOLFATARA_KEYWORDS: tuple[str, ...] = (
    "solfatara",
    "fumarole",
    "fumarolic",
    "mofette",
    "geyserite",
    "sinter crust",
    "sinter shield",
    "mudpot",
    "boiling mudpot",
    "kaolinite crust",
    "argillic crust",
    "sulfur sublimation",
    "sulfur dome",
    "hydrogen sulfide",
    "h2s",
    "so2 ppm",
    "h2s ppm",
    "ten thousand smokes",
    "novarupta",
    "bumpass hell",
    "devil's kitchen",
    "devils kitchen",
    "kverkfjöll",
    "kverkfjoll",
    "askja viti",
    "askja víti",
    "el tatio",
    "mutnovsky",
    "donnoe",
)


def is_solfatara_navigation_query(query: str) -> bool:
    """Return True if the user query pertains to geothermal fumarole/solfatara hazard navigation."""
    if not query or not query.strip():
        return False
    q = query.lower()

    if any(
        ex in q
        for ex in (
            "tephra",
            "lapilli",
            "ash-fall",
            "ashfall",
            "volcanic ash",
            "scoria scree",
            "pumice scree",
            "cristobalite",
            "mount yasur",
            "acatenango",
            "tarawera",
            "chaiten",
            "chaitén",
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
            "salar",
            "salar de uyuni",
            "salar de atacama",
            "salar de arizaro",
            "salar de chalviri",
            "termas de polques",
            "polques",
            "laguna chaxa",
            "cordillera de la sal",
            "cono de arita",
            "isla incahuasi",
            "ojos del salar",
            "halite",
            "pressure ridge",
            "pressure-ridge",
            "brine eye",
            "brine pool",
            "mirabilite",
        )
    ):
        return False

    if any(kw in q for kw in _SOLFATARA_KEYWORDS):
        return True

    # Secondary contextual combination: hydrothermal/geothermal + gas/crust/respirator/probe
    has_geothermal_context = any(
        term in q
        for term in (
            "hydrothermal",
            "geothermal vent",
            "geothermal basin",
            "volcanic gas",
            "acid gas",
            "sulfur dioxide",
        )
    )
    has_hazard_nav = any(
        term in q
        for term in (
            "crust",
            "sinter",
            "respirator",
            "p100",
            "four-gas",
            "4-gas",
            "standoff",
            "breakthrough",
            "scald",
            "inversion",
            "upwind",
        )
    )
    return has_geothermal_context and has_hazard_nav


detect_solfatara_navigation_intent = is_solfatara_navigation_query


def extract_solfatara_navigation_params(query: str) -> dict[str, Any]:
    """Extract site_id, crust_type, gas_regime, wind_state, and numerical parameters from query."""
    q = query.lower()
    params: dict[str, Any] = {
        "site_id": None,
        "crust_type": "siliceous_geyserite_sinter_shield",
        "gas_regime": "superheated_fumarolic_steam_jet",
        "wind_state": "steady_upwind_ridge_ventilation",
        "sinter_crust_thickness_cm": 24.0,
        "subsurface_temp_10cm_c": 65.0,
        "wind_speed_kmh": 22.0,
        "basin_depression_depth_m": 2.5,
        "ambient_so2_ppm": 1.0,
        "ambient_h2s_ppm": 0.8,
        "has_explicit_numbers": False,
        "is_calculation": False,
    }

    # Check site match
    site_patterns: list[tuple[tuple[str, ...], str]] = [
        (
            ("katmai", "ten thousand smokes", "novarupta"),
            "katmai-valley-of-ten-thousand-smokes-fumaroles",
        ),
        (
            ("bumpass", "devil's kitchen", "devils kitchen", "lassen"),
            "lassens-bumpass-hell-devil-kitchen-solfatara",
        ),
        (
            ("askja", "viti", "víti", "kverkfjöll", "kverkfjoll"),
            "askja-viti-kverkfjoll-geothermal-ice-fumaroles",
        ),
        (
            ("el tatio", "tatio", "atacama"),
            "el-tatio-atacama-high-altitude-geyser-sinter",
        ),
        (
            ("mutnovsky", "donnoe", "kamchatka"),
            "mutnovsky-active-crater-sulfur-fumarole-canyon",
        ),
    ]
    for aliases, site_id in site_patterns:
        if site_id in q or any(alias in q for alias in aliases):
            params["site_id"] = site_id
            site = get_solfatara_site_by_id(site_id)
            if site is not None:
                params["crust_type"] = site["crust_type"]
                params["gas_regime"] = site["gas_regime"]
                params["wind_state"] = site["wind_state"]
                params["sinter_crust_thickness_cm"] = site["mean_crust_thickness_cm"]
                params["subsurface_temp_10cm_c"] = site["subsurface_temp_10cm_c"]
                params["basin_depression_depth_m"] = site["basin_depression_depth_m"]
                params["ambient_so2_ppm"] = site["baseline_so2_ppm"]
                params["ambient_h2s_ppm"] = site["baseline_h2s_ppm"]
            break

    # Override crust_type if explicitly mentioned
    if "undercut_boiling_mudpot_apron" in q or "mudpot" in q:
        params["crust_type"] = "undercut_boiling_mudpot_apron"
    elif "argillic_kaolinite_steam_crust" in q or "kaolinite" in q or "argillic" in q:
        params["crust_type"] = "argillic_kaolinite_steam_crust"
    elif (
        "native_sulfur_sublimation_dome" in q
        or "sulfur dome" in q
        or "sublimation dome" in q
        or "native sulfur" in q
    ):
        params["crust_type"] = "native_sulfur_sublimation_dome"
    elif "travertine_carbonate_terrace" in q or "travertine" in q:
        params["crust_type"] = "travertine_carbonate_terrace"
    elif "siliceous_geyserite_sinter_shield" in q or "geyserite" in q or "sinter shield" in q:
        params["crust_type"] = "siliceous_geyserite_sinter_shield"

    # Override gas_regime if explicitly mentioned
    if "co2_cold_mofette_topographic_pooling" in q or "mofette" in q or "co2" in q:
        params["gas_regime"] = "co2_cold_mofette_topographic_pooling"
    elif "h2s_so2_acid_fume_plume" in q or "acid fume" in q or "acid plume" in q:
        params["gas_regime"] = "h2s_so2_acid_fume_plume"
    elif "mixed_solfatara_degassing_basin" in q or "mixed solfatara" in q:
        params["gas_regime"] = "mixed_solfatara_degassing_basin"
    elif "superheated_fumarolic_steam_jet" in q or "steam jet" in q:
        params["gas_regime"] = "superheated_fumarolic_steam_jet"

    # Override wind_state if explicitly mentioned
    if (
        "katabatic_calms_inversion_trap" in q
        or "inversion" in q
        or "katabatic calm" in q
        or "calms" in q
    ):
        params["wind_state"] = "katabatic_calms_inversion_trap"
    elif "barometric_drop_outgassing_surge" in q or "barometric" in q:
        params["wind_state"] = "barometric_drop_outgassing_surge"
    elif "gusty_rotors_plume_downwash" in q or "downwash" in q or "rotor" in q:
        params["wind_state"] = "gusty_rotors_plume_downwash"
    elif "steady_upwind_ridge_ventilation" in q or "steady upwind" in q:
        params["wind_state"] = "steady_upwind_ridge_ventilation"

    # Extract crust thickness (cm)
    crust_match = re.search(
        r"(?:crust(?:\s+thickness)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*cm|(\d+(?:\.\d+)?)\s*cm\s+(?:sinter\s+|mudpot\s+|kaolinite\s+|sulfur\s+)?crust)",
        q,
    )
    if crust_match:
        val = float(crust_match.group(1) or crust_match.group(2))
        params["sinter_crust_thickness_cm"] = max(1.0, min(150.0, val))
        params["has_explicit_numbers"] = True
    else:
        generic_cm = re.search(r"(\d+(?:\.\d+)?)\s*cm\b", q)
        if generic_cm and "10 cm" not in generic_cm.group(0) and "10cm" not in generic_cm.group(0):
            params["sinter_crust_thickness_cm"] = max(1.0, min(150.0, float(generic_cm.group(1))))
            params["has_explicit_numbers"] = True

    # Extract subsurface temperature (°C)
    temp_match = re.search(r"(\d+(?:\.\d+)?)\s*°?\s*c\b", q)
    if temp_match:
        params["subsurface_temp_10cm_c"] = max(0.0, min(130.0, float(temp_match.group(1))))
        params["has_explicit_numbers"] = True

    # Extract wind speed (km/h)
    wind_match = re.search(r"(\d+(?:\.\d+)?)\s*km/?h\b", q)
    if wind_match:
        params["wind_speed_kmh"] = max(0.0, min(120.0, float(wind_match.group(1))))
        params["has_explicit_numbers"] = True

    # Extract basin depression depth (m)
    depth_match = re.search(
        r"(?:depression(?:\s+depth)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*m|(\d+(?:\.\d+)?)\s*m\s+(?:depression|basin|mofette|depth|hollow))",
        q,
    )
    if depth_match:
        val = float(depth_match.group(1) or depth_match.group(2))
        params["basin_depression_depth_m"] = max(0.0, min(60.0, val))
        params["has_explicit_numbers"] = True

    # Extract SO2 ppm
    so2_match = re.search(
        r"(?:so2(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*(?:ppm)?|(\d+(?:\.\d+)?)\s*ppm\s*so2)",
        q,
    )
    if so2_match:
        val = float(so2_match.group(1) or so2_match.group(2))
        params["ambient_so2_ppm"] = max(0.0, min(100.0, val))
        params["has_explicit_numbers"] = True

    # Extract H2S ppm
    h2s_match = re.search(
        r"(?:h2s(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*(?:ppm)?|(\d+(?:\.\d+)?)\s*ppm\s*h2s)",
        q,
    )
    if h2s_match:
        val = float(h2s_match.group(1) or h2s_match.group(2))
        params["ambient_h2s_ppm"] = max(0.0, min(100.0, val))
        params["has_explicit_numbers"] = True

    calc_triggers = (
        "calculate",
        "evaluate",
        "assess",
        "safety factor",
        "breakthrough",
        "standoff",
        "accumulation index",
        "ppm",
        "km/h",
    )
    params["is_calculation"] = bool(params["has_explicit_numbers"]) or any(
        t in q for t in calc_triggers
    )

    return params


def format_solfatara_navigation_response(query: str) -> tuple[str, dict[str, Any]]:
    """Format a structured markdown answer and info dictionary for solfatara navigation queries."""
    params = extract_solfatara_navigation_params(query)
    is_calc = bool(params["is_calculation"])

    if is_calc:
        calc_result = calculate_solfatara_navigation_safety(
            crust_type=params["crust_type"],
            gas_regime=params["gas_regime"],
            wind_state=params["wind_state"],
            sinter_crust_thickness_cm=float(params["sinter_crust_thickness_cm"]),
            subsurface_temp_10cm_c=float(params["subsurface_temp_10cm_c"]),
            wind_speed_kmh=float(params["wind_speed_kmh"]),
            basin_depression_depth_m=float(params["basin_depression_depth_m"]),
            ambient_so2_ppm=float(params["ambient_so2_ppm"]),
            ambient_h2s_ppm=float(params["ambient_h2s_ppm"]),
        )
        gear_list = [dict(g) for g in get_solfatara_gear_checklist()]
        calc_info: dict[str, Any] = {
            **dict(calc_result),
            "action": "solfatara_navigation_calculated",
            "calculation": dict(calc_result),
            "gear_checklist": gear_list,
        }
        if params["site_id"]:
            matched_site = get_solfatara_site_by_id(str(params["site_id"]))
            if matched_site is not None:
                calc_info["site"] = dict(matched_site)

        answer = (
            "### Backcountry Geothermal Fumarole & Solfatara Hazard Assessment\n\n"
            f"- **Safety Status:** `{calc_result['safety_status']}`\n"
            f"- **Crust Bearing Safety Factor:** `{calc_result['crust_bearing_safety_factor']}` "
            f"(`{calc_result['crust_type']}`, {calc_result['sinter_crust_thickness_cm']} cm thickness, "
            f"{calc_result['subsurface_temp_10cm_c']}°C at 10 cm depth)\n"
            f"- **Scald Breakthrough Probability:** `{calc_result['scald_breakthrough_probability']:.1%}`\n"
            f"- **Dense Gas Accumulation Index:** `{calc_result['dense_gas_accumulation_index']}` "
            f"(SO2 `{calc_result['ambient_so2_ppm']} ppm`, H2S `{calc_result['ambient_h2s_ppm']} ppm`, "
            f"depression `{calc_result['basin_depression_depth_m']} m`, wind `{calc_result['wind_speed_kmh']} km/h`)\n"
            f"- **Recommended Vent Standoff Distance:** `{calc_result['recommended_standoff_distance_m']} m`\n\n"
            f"**Windward Routing Protocol:** {calc_result['windward_routing_protocol']}\n\n"
            f"**Crust Probing & Respirator Advisory:** {calc_result['crust_probing_and_respirator_advisory']}"
        )
        return answer, calc_info

    if params["site_id"]:
        site = get_solfatara_site_by_id(str(params["site_id"]))
        if site is not None:
            site_calc = calculate_solfatara_navigation_safety(
                crust_type=site["crust_type"],
                gas_regime=site["gas_regime"],
                wind_state=site["wind_state"],
                sinter_crust_thickness_cm=float(site["mean_crust_thickness_cm"]),
                subsurface_temp_10cm_c=float(site["subsurface_temp_10cm_c"]),
                wind_speed_kmh=18.0,
                basin_depression_depth_m=float(site["basin_depression_depth_m"]),
                ambient_so2_ppm=float(site["baseline_so2_ppm"]),
                ambient_h2s_ppm=float(site["baseline_h2s_ppm"]),
            )
            lookup_info: dict[str, Any] = {
                "action": "solfatara_navigation_lookup",
                "site": dict(site),
                "baseline_calculation": dict(site_calc),
                "gear_checklist": [dict(g) for g in get_solfatara_gear_checklist()],
            }
            answer = (
                f"### {site['name']} ({site['region']})\n\n"
                f"- **Site ID:** `{site['id']}` (Elevation: {site['elevation_m']} m)\n"
                f"- **Hydrothermal Crust Type:** `{site['crust_type']}` "
                f"(Mean Thickness: {site['mean_crust_thickness_cm']} cm, 10 cm Temp: {site['subsurface_temp_10cm_c']}°C)\n"
                f"- **Volcanic Gas Regime:** `{site['gas_regime']}` "
                f"(Baseline SO2: {site['baseline_so2_ppm']} ppm, H2S: {site['baseline_h2s_ppm']} ppm)\n"
                f"- **Boundary Layer Wind State:** `{site['wind_state']}`\n"
                f"- **Primary Hazard:** {site['primary_hazard']}\n"
                f"- **Windward Escape Bearing:** {site['windward_escape_bearing']}\n"
                f"- **Field Notes:** {site['field_notes']}"
            )
            return answer, lookup_info

    sites_list = [dict(s) for s in get_all_solfatara_sites()]
    gear_list = [dict(g) for g in get_solfatara_gear_checklist()]
    general_info: dict[str, Any] = {
        "action": "solfatara_navigation_info",
        "sites": sites_list,
        "gear_checklist": gear_list,
    }
    site_bullets = "\n".join(
        f"- **{s['name']}** (`{s['id']}`, {s['region']}): `{s['crust_type']}` / `{s['gas_regime']}`"
        for s in sites_list
    )
    gear_bullets = "\n".join(
        f"- **{g['name']}** (`{g['category']}`): {g['rationale']}" for g in gear_list
    )
    answer = (
        "### Backcountry Geothermal Fumarole Field & Solfatara Gas Hazard Navigation Guide\n\n"
        "Navigating active volcanic fumarole basins and acid-sulfate solfataras requires strict upwind "
        "corridor discipline, continuous ankle-level multi-gas telemetry (H2S/SO2/CO2/O2), and systematic "
        "probing of hydrothermal sinter and argillic clay crusts.\n\n"
        "#### Curated Solfatara & Fumarole Reference Basins\n"
        f"{site_bullets}\n\n"
        "#### Mandatory 6-Item Geothermal Hazard Gear Checklist\n"
        f"{gear_bullets}"
    )
    return answer, general_info


def build_solfatara_navigation_prompt(query: str = "") -> str:
    """Build system prompt context for LLM augmentation on solfatara navigation topics."""
    answer, _ = format_solfatara_navigation_response(query)
    return (
        "You are an expert volcanologist and Backcountry Geothermal Fumarole & Solfatara Hazard specialist. "
        "Use the following geothermal fumarole and solfatara gas hazard telemetry to answer the user's question:\n\n"
        f"{answer}"
    )
