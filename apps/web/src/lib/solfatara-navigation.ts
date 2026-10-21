export type HydrothermalCrustType =
  | 'siliceous_geyserite_sinter_shield'
  | 'argillic_kaolinite_steam_crust'
  | 'native_sulfur_sublimation_dome'
  | 'travertine_carbonate_terrace'
  | 'undercut_boiling_mudpot_apron';

export type VolcanicGasRegime =
  | 'h2s_so2_acid_fume_plume'
  | 'co2_cold_mofette_topographic_pooling'
  | 'superheated_fumarolic_steam_jet'
  | 'mixed_solfatara_degassing_basin';

export type BoundaryLayerWindState =
  | 'katabatic_calms_inversion_trap'
  | 'steady_upwind_ridge_ventilation'
  | 'gusty_rotors_plume_downwash'
  | 'barometric_drop_outgassing_surge';

export type SolfataraSafetyStatus =
  | 'nominal_upwind_sinter_corridor'
  | 'caution_acid_plume_respirator_required'
  | 'abort_lethal_gas_pool_or_crust_collapse';

export interface SolfataraSite {
  id: string;
  name: string;
  region: string;
  country: string;
  elevationMeters: number;
  crustType: HydrothermalCrustType;
  gasRegime: VolcanicGasRegime;
  typicalWindState: BoundaryLayerWindState;
  meanCrustThicknessCm: number;
  subsurfaceTemp10cmC: number;
  basinDepressionDepthM: number;
  baselineSo2Ppm: number;
  baselineH2sPpm: number;
  highlights: string[];
  bestSeason: string;
}

export interface SolfataraGearItem {
  id: string;
  name: string;
  category:
    | 'gas_telemetry'
    | 'respiratory_defense'
    | 'crust_probing'
    | 'thermal_footwear';
  mandatory: boolean;
  weightGrams: number;
  rationale: string;
}

export interface SolfataraCalculatorInput {
  sinterCrustThicknessCm: number;
  subsurfaceTemp10cmC: number;
  windSpeedKmh: number;
  basinDepressionDepthM: number;
  ambientSo2Ppm: number;
  ambientH2sPpm: number;
  crustType?: HydrothermalCrustType;
}

export interface SolfataraCalculatorResult {
  crustBearingSafetyFactor: number;
  scaldBreakthroughProbability: number;
  denseGasAccumulationIndex: number;
  recommendedStandoffDistanceM: number;
  safetyStatus: SolfataraSafetyStatus;
  windwardRoutingProtocol: string;
  crustProbingAndRespiratorAdvisory: string;
}

export const SOLFATARA_SITES: SolfataraSite[] = [
  {
    id: 'katmai-valley-of-ten-thousand-smokes-fumaroles',
    name: 'Valley of Ten Thousand Smokes & Novarupta Vent Dome',
    region: 'Katmai National Park, Alaska',
    country: 'USA',
    elevationMeters: 840,
    crustType: 'siliceous_geyserite_sinter_shield',
    gasRegime: 'superheated_fumarolic_steam_jet',
    typicalWindState: 'steady_upwind_ridge_ventilation',
    meanCrustThicknessCm: 28,
    subsurfaceTemp10cmC: 62,
    basinDepressionDepthM: 2.5,
    baselineSo2Ppm: 1.2,
    baselineH2sPpm: 0.8,
    highlights: [
      'Indurated rhyolitic ignimbrite and siliceous sinter shields bordering Novarupta dome fractures',
      'Persistent katabatic valley winds dispersing residual steam fissures along elevated river benches',
      'Deeply incised Lethe River gorges requiring careful bridge-crust probing near fumarolic vents',
    ],
    bestSeason: 'Late June – August',
  },
  {
    id: 'lassens-bumpass-hell-devil-kitchen-solfatara',
    name: "Bumpass Hell & Devil's Kitchen Acid-Sulfate Basin",
    region: 'Lassen Volcanic National Park, California',
    country: 'USA',
    elevationMeters: 2500,
    crustType: 'argillic_kaolinite_steam_crust',
    gasRegime: 'h2s_so2_acid_fume_plume',
    typicalWindState: 'gusty_rotors_plume_downwash',
    meanCrustThicknessCm: 14,
    subsurfaceTemp10cmC: 84,
    basinDepressionDepthM: 5.5,
    baselineSo2Ppm: 3.8,
    baselineH2sPpm: 6.5,
    highlights: [
      'Hydrothermally leached kaolinite-alunite clay crusts masking boiling 92°C sulfuric pools',
      'Orographic rotor turbulence sweeping H2S/SO2 acid plumes across low basin footpaths',
      'Rapid seasonal snowmelt undercutting thin argillic margins around roaring steam vents',
    ],
    bestSeason: 'July – October',
  },
  {
    id: 'askja-viti-kverkfjoll-geothermal-ice-fumaroles',
    name: 'Askja Víti Crater & Kverkfjöll Subglacial Solfatara Field',
    region: 'Dyngjufjöll Highlands',
    country: 'Iceland',
    elevationMeters: 1100,
    crustType: 'undercut_boiling_mudpot_apron',
    gasRegime: 'mixed_solfatara_degassing_basin',
    typicalWindState: 'barometric_drop_outgassing_surge',
    meanCrustThicknessCm: 9,
    subsurfaceTemp10cmC: 92,
    basinDepressionDepthM: 11.0,
    baselineSo2Ppm: 8.5,
    baselineH2sPpm: 14.0,
    highlights: [
      'Steep caldera rim walls trapping dense H2S and CO2 gases during low-pressure barometric drops',
      'Thixotropic boiling mudpot aprons and subglacial ice-cave steam cauldrons with <10 cm crust',
      'High-viscosity sulfuric clay slicks demanding PTFE overboots and continuous 4-gas pumped telemetry',
    ],
    bestSeason: 'July – Early September',
  },
  {
    id: 'el-tatio-atacama-high-altitude-geyser-sinter',
    name: 'El Tatio High-Andean Geyser & Sinter Terrace Field',
    region: 'Antofagasta Region, Northern Chile',
    country: 'Chile',
    elevationMeters: 4320,
    crustType: 'travertine_carbonate_terrace',
    gasRegime: 'superheated_fumarolic_steam_jet',
    typicalWindState: 'katabatic_calms_inversion_trap',
    meanCrustThicknessCm: 22,
    subsurfaceTemp10cmC: 76,
    basinDepressionDepthM: 3.0,
    baselineSo2Ppm: 1.8,
    baselineH2sPpm: 2.4,
    highlights: [
      'Predawn radiative temperature inversions condensing dense steam plumes at 4,320m altitude',
      'Overhanging opaline sinter and travertine terrace rims concealing 86°C boiling conduits',
      'Hypobaric hypoxia compounding toxic gas sensitivity before midday Andean westerly winds mix the basin',
    ],
    bestSeason: 'April – November (Dry Altiplano Window)',
  },
  {
    id: 'mutnovsky-active-crater-sulfur-fumarole-canyon',
    name: 'Mutnovsky Volcano Active Crater & Donnoe Solfatara Field',
    region: 'Kamchatka Peninsula',
    country: 'Russia',
    elevationMeters: 1680,
    crustType: 'native_sulfur_sublimation_dome',
    gasRegime: 'co2_cold_mofette_topographic_pooling',
    typicalWindState: 'katabatic_calms_inversion_trap',
    meanCrustThicknessCm: 11,
    subsurfaceTemp10cmC: 89,
    basinDepressionDepthM: 14.0,
    baselineSo2Ppm: 12.0,
    baselineH2sPpm: 18.5,
    highlights: [
      'Fragile yellow crystalline sulfur sublimation domes built over 150°C pressurized acid gas vents',
      'Deeply enclosed glacier-fumarole depression basins prone to lethal heavier-than-air CO2/H2S mofette pooling',
      'Mandatory NIOSH OV/AG/P100 full or half-mask respiratory defense and upwind ridge crest routing',
    ],
    bestSeason: 'August – September',
  },
];

export const SOLFATARA_GEAR_CHECKLIST: SolfataraGearItem[] = [
  {
    id: 'four-gas-pumped-electrochemical-detector',
    name: 'Pumped 4-Gas Electrochemical & NDIR Detector (H2S / SO2 / CO2 / O2)',
    category: 'gas_telemetry',
    mandatory: true,
    weightGrams: 440,
    rationale:
      'Active motorized sampling pump with a 1.5m wand probes ankle-level topographic depressions for heavier-than-air H2S (olfactory paralysis >100 ppm) and asphyxiating CO2 mofette pools before entry.',
  },
  {
    id: 'niorsh-ov-ag-p100-acid-gas-half-mask-respirator',
    name: 'NIOSH OV/AG/P100 Acid-Gas Elastomeric Half-Mask Respirator',
    category: 'respiratory_defense',
    mandatory: true,
    weightGrams: 390,
    rationale:
      'Neutralizes sulfur dioxide (SO2), hydrogen sulfide (H2S), and sulfuric acid aerosol droplets during unexpected rotor downwash or crosswind plume shifts.',
  },
  {
    id: 'carbon-fiber-graduated-thermal-crust-probe-pole',
    name: 'Graduated Carbon-Fiber Hydrothermal Crust Probe Staff (160 cm)',
    category: 'crust_probing',
    mandatory: true,
    weightGrams: 340,
    rationale:
      'Tests bearing resistance 1.2m ahead of lead footfalls to detect hollow undercut boiling mudpot aprons and fragile native sulfur sublimation domes before committing body weight.',
  },
  {
    id: 'sealed-polycarbonate-chemical-splash-goggles',
    name: 'Non-Vented Sealed Polycarbonate Chemical & Acid-Fume Goggles',
    category: 'respiratory_defense',
    mandatory: true,
    weightGrams: 115,
    rationale:
      'Prevents corneal chemical burns and severe blepharospasm triggered by acidic SO2/HCl fumarolic vapor condensation on tear films.',
  },
  {
    id: 'bi-metal-soil-probe-stem-thermometer',
    name: 'Armored Bi-Metal & Thermocouple 10 cm Subsurface Stem Thermometer',
    category: 'crust_probing',
    mandatory: true,
    weightGrams: 165,
    rationale:
      'Measures shallow 10 cm ground temperatures; a steep thermal gradient above 75°C warns of active steam condensation undercutting the overlying sinter or kaolinite crust.',
  },
  {
    id: 'ptfe-acid-resistant-overboots-and-gaiters',
    name: 'PTFE/Viton Acid-Resistant Thermal Overboots & Sealed Kevlar Gaiters',
    category: 'thermal_footwear',
    mandatory: true,
    weightGrams: 920,
    rationale:
      'Prevents sulfuric acid hydrolysis of polyurethane boot midsoles and provides critical thermal insulation against brief ankle-deep scald punch-throughs.',
  },
];

export function getAllSolfataraSites(): SolfataraSite[] {
  return [...SOLFATARA_SITES];
}

export function getSolfataraSiteById(id: string): SolfataraSite | undefined {
  return SOLFATARA_SITES.find((site) => site.id === id);
}

export function filterSolfataraSites(filters?: {
  crustType?: HydrothermalCrustType;
  gasRegime?: VolcanicGasRegime;
  windState?: BoundaryLayerWindState;
}): SolfataraSite[] {
  if (!filters) {
    return [...SOLFATARA_SITES];
  }

  return SOLFATARA_SITES.filter((site) => {
    if (filters.crustType && site.crustType !== filters.crustType) {
      return false;
    }
    if (filters.gasRegime && site.gasRegime !== filters.gasRegime) {
      return false;
    }
    if (filters.windState && site.typicalWindState !== filters.windState) {
      return false;
    }
    return true;
  });
}

export function getSolfataraGearChecklist(): SolfataraGearItem[] {
  return [...SOLFATARA_GEAR_CHECKLIST];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

const CRUST_STRENGTH_MULTIPLIERS: Record<HydrothermalCrustType, number> = {
  siliceous_geyserite_sinter_shield: 1.25,
  travertine_carbonate_terrace: 1.05,
  native_sulfur_sublimation_dome: 0.78,
  argillic_kaolinite_steam_crust: 0.62,
  undercut_boiling_mudpot_apron: 0.45,
};

export function calculateSolfataraNavigationSafety(
  input: SolfataraCalculatorInput
): SolfataraCalculatorResult {
  const {
    sinterCrustThicknessCm,
    subsurfaceTemp10cmC,
    windSpeedKmh,
    basinDepressionDepthM,
    ambientSo2Ppm,
    ambientH2sPpm,
    crustType,
  } = input;

  if (
    !Number.isFinite(sinterCrustThicknessCm) ||
    sinterCrustThicknessCm < 1 ||
    sinterCrustThicknessCm > 150
  ) {
    throw new Error(
      'Invalid sinterCrustThicknessCm: must be a finite number between 1 and 150 cm.'
    );
  }

  if (
    !Number.isFinite(subsurfaceTemp10cmC) ||
    subsurfaceTemp10cmC < 0 ||
    subsurfaceTemp10cmC > 130
  ) {
    throw new Error(
      'Invalid subsurfaceTemp10cmC: must be a finite number between 0 and 130 °C.'
    );
  }

  if (
    !Number.isFinite(windSpeedKmh) ||
    windSpeedKmh < 0 ||
    windSpeedKmh > 120
  ) {
    throw new Error(
      'Invalid windSpeedKmh: must be a finite number between 0 and 120 km/h.'
    );
  }

  if (
    !Number.isFinite(basinDepressionDepthM) ||
    basinDepressionDepthM < 0 ||
    basinDepressionDepthM > 60
  ) {
    throw new Error(
      'Invalid basinDepressionDepthM: must be a finite number between 0 and 60 m.'
    );
  }

  if (
    !Number.isFinite(ambientSo2Ppm) ||
    ambientSo2Ppm < 0 ||
    ambientSo2Ppm > 100
  ) {
    throw new Error(
      'Invalid ambientSo2Ppm: must be a finite number between 0 and 100 ppm.'
    );
  }

  if (
    !Number.isFinite(ambientH2sPpm) ||
    ambientH2sPpm < 0 ||
    ambientH2sPpm > 100
  ) {
    throw new Error(
      'Invalid ambientH2sPpm: must be a finite number between 0 and 100 ppm.'
    );
  }

  const crustMultiplier = crustType
    ? CRUST_STRENGTH_MULTIPLIERS[crustType]
    : 0.9;

  const crustBearingSafetyFactor = roundTo(
    clamp(
      (sinterCrustThicknessCm / 12) *
        crustMultiplier *
        Math.max(0.45, 1 - Math.max(0, subsurfaceTemp10cmC - 55) * 0.0085),
      0.2,
      5.0
    ),
    2
  );

  const scaldBreakthroughProbability = roundTo(
    clamp(
      0.88 -
        crustBearingSafetyFactor * 0.34 +
        Math.max(0, subsurfaceTemp10cmC - 70) * 0.007,
      0.02,
      0.98
    ),
    2
  );

  const denseGasAccumulationIndex = roundTo(
    clamp(
      (basinDepressionDepthM * 4.2) / Math.max(1.5, windSpeedKmh * 0.45) +
        ambientSo2Ppm * 3.5 +
        ambientH2sPpm * 4.2,
      1.0,
      100.0
    ),
    1
  );

  const recommendedStandoffDistanceM = Math.round(
    clamp(
      5 +
        denseGasAccumulationIndex * 0.85 +
        (1 / Math.max(0.3, crustBearingSafetyFactor)) * 12,
      5,
      150
    )
  );

  let safetyStatus: SolfataraSafetyStatus;
  if (
    crustBearingSafetyFactor < 1.15 ||
    scaldBreakthroughProbability >= 0.55 ||
    denseGasAccumulationIndex >= 55 ||
    ambientH2sPpm >= 10 ||
    ambientSo2Ppm >= 5
  ) {
    safetyStatus = 'abort_lethal_gas_pool_or_crust_collapse';
  } else if (
    crustBearingSafetyFactor < 1.85 ||
    scaldBreakthroughProbability >= 0.25 ||
    denseGasAccumulationIndex >= 24 ||
    ambientH2sPpm >= 2 ||
    ambientSo2Ppm >= 1.5 ||
    subsurfaceTemp10cmC >= 75
  ) {
    safetyStatus = 'caution_acid_plume_respirator_required';
  } else {
    safetyStatus = 'nominal_upwind_sinter_corridor';
  }

  let windwardRoutingProtocol: string;
  if (safetyStatus === 'abort_lethal_gas_pool_or_crust_collapse') {
    windwardRoutingProtocol = `ABORT BASIN ENTRY (Standoff >= ${recommendedStandoffDistanceM}m): Severe dense-gas mofette pooling or hydrothermally undercut crust collapse hazard. Retreat immediately along upwind/crosswind high-ground ridges and strictly avoid topographic depressions where heavier-than-air H2S and CO2 accumulate.`;
  } else if (safetyStatus === 'caution_acid_plume_respirator_required') {
    windwardRoutingProtocol = `CAUTION UPWIND/CROSSWIND ROUTING (Standoff >= ${recommendedStandoffDistanceM}m): Maintain elevated crosswind or upwind ridge corridors above fumarole plumes; bypass enclosed topographic depressions and gullies where heavier-than-air H2S/CO2 gas pools during calm or gusty downwash intervals.`;
  } else {
    windwardRoutingProtocol = `NOMINAL UPWIND SINTER CORRIDOR (Standoff >= ${recommendedStandoffDistanceM}m): Traverse along ventilated upwind and crosswind high-ground siliceous sinter benches; continuously monitor wind vectors and avoid descending into unventilated topographic depressions where H2S or CO2 may pool.`;
  }

  let crustProbingAndRespiratorAdvisory: string;
  if (safetyStatus === 'abort_lethal_gas_pool_or_crust_collapse') {
    crustProbingAndRespiratorAdvisory =
      'CRITICAL RESPIRATORY & SCALD HAZARD: Don NIOSH OV/AG/P100 acid-gas respirator and sealed splash goggles immediately. Do not step onto argillic kaolinite or native sulfur crusts; 10 cm subsurface temperatures indicate active steam undercutting and imminent boiling mudpot punch-through.';
  } else if (safetyStatus === 'caution_acid_plume_respirator_required') {
    crustProbingAndRespiratorAdvisory =
      'DON OV/AG/P100 RESPIRATOR & PROBE 10 CM TEMPS: Wear NIOSH OV/AG/P100 respirator and sealed goggles in acid plume corridors. Probe 1.2m ahead with a graduated carbon pole and verify 10 cm subsurface stem thermometer readings stay below 75°C before weighting altered crusts.';
  } else {
    crustProbingAndRespiratorAdvisory =
      'STANDARD CRUST PROBING & TELEMETRY: Keep NIOSH OV/AG/P100 respirator at chest-ready position and run continuous 4-gas pumped telemetry at knee height. Probe sinter margins and check 10 cm subsurface temperatures whenever transitioning off grey geyserite shields.';
  }

  return {
    crustBearingSafetyFactor,
    scaldBreakthroughProbability,
    denseGasAccumulationIndex,
    recommendedStandoffDistanceM,
    safetyStatus,
    windwardRoutingProtocol,
    crustProbingAndRespiratorAdvisory,
  };
}
