export type SmokeSeverity =
  | 'clean_uncompromised'
  | 'moderate_drift_haze'
  | 'unhealthy_wildfire_plume'
  | 'hazardous_dense_inversion';

export type ElevationLayer =
  | 'valley_basin_trapping'
  | 'mid_slope_thermal_belt'
  | 'alpine_ridge_free_air';

export type ActivityIntensity =
  | 'low_camp_rest'
  | 'moderate_backpacking'
  | 'strenuous_alpine_ascent';

export type RespiratorType =
  | 'none'
  | 'n95_particulate_respirator'
  | 'p100_elastomeric_half_mask';

export type ExertionSafetyStatus =
  | 'nominal_safe_exertion'
  | 'caution_moderate_respiration'
  | 'critical_hazard_cease_exertion';

export interface SmokeStation {
  id: string;
  title: string;
  region: string;
  range: string;
  elevationMeters: number;
  aqi: number;
  pm25UgM3: number;
  severity: SmokeSeverity;
  layer: ElevationLayer;
  inversionTrapped: boolean;
  activeFireDistanceKm: number;
  description: string;
  highlights: string[];
}

export interface SmokeAdvisoryQuery {
  stationId: string;
  elevationLayer: ElevationLayer;
  activityIntensity: ActivityIntensity;
  exposureHours: number;           // 1 to 24, default 6
  respiratorType: RespiratorType;  // default 'none'
}

export interface SmokeAdvisoryResult {
  stationTitle: string;
  effectivePm25UgM3: number;
  effectiveAqi: number;
  inhaledParticulateDoseUg: number;
  safetyStatus: ExertionSafetyStatus;
  inversionAlert: boolean;
  advisoryNotes: string[];
  recommendedActions: string[];
}

export interface SmokeGearItem {
  id: string;
  name: string;
  category: 'respirator' | 'eye_protection' | 'sensor' | 'shelter' | 'medical' | 'filtration';
  mandatory: boolean;
  description: string;
}

export const SMOKE_STATIONS: SmokeStation[] = [
  {
    id: 'pasayten-boundary-fire',
    title: 'Pasayten Boundary Fire Telemetry',
    region: 'North Cascades, Washington',
    range: 'Cascade Crest',
    elevationMeters: 1450,
    aqi: 185,
    pm25UgM3: 121.5,
    severity: 'unhealthy_wildfire_plume',
    layer: 'valley_basin_trapping',
    inversionTrapped: true,
    activeFireDistanceKm: 18,
    description: 'Dense smoke trapped in glaciated river valleys beneath an overnight subsidence thermal inversion.',
    highlights: [
      'Morning temperature inversion layer',
      'Valley drainage particulate accumulation',
      'High particulate spike before afternoon thermal mixing',
    ],
  },
  {
    id: 'sawtooth-wilderness-basin',
    title: 'Sawtooth Valley Inversion & Ridge Station',
    region: 'Sawtooth Range, Idaho',
    range: 'Central Idaho Rocky Mountains',
    elevationMeters: 2350,
    aqi: 78,
    pm25UgM3: 25.2,
    severity: 'moderate_drift_haze',
    layer: 'mid_slope_thermal_belt',
    inversionTrapped: false,
    activeFireDistanceKm: 42,
    description: 'Moderate regional drift aloft with noticeably cleaner air above the 7,500-foot valley smoke ceiling.',
    highlights: [
      'Mid-slope thermal belt refuge',
      'Moderate diurnal wind ventilation',
      'Valley floor smoke haze visibility line',
    ],
  },
  {
    id: 'sierra-crest-granite-gap',
    title: 'Sierra Crest Granite Gap Smoke Corridor',
    region: 'High Sierra, California',
    range: 'Sierra Nevada',
    elevationMeters: 3120,
    aqi: 310,
    pm25UgM3: 260.0,
    severity: 'hazardous_dense_inversion',
    layer: 'alpine_ridge_free_air',
    inversionTrapped: false,
    activeFireDistanceKm: 12,
    description: 'Direct downwind plume funneled across high granite passes by strong afternoon convective pressure gradients.',
    highlights: [
      'Dangerous active wildfire plume crossing',
      'Extreme hazardous PM2.5 concentrations',
      'Urgent egress and respiratory shelter requirement',
    ],
  },
  {
    id: 'san-juan-wetterhorn-basin',
    title: 'San Juan Wetterhorn Alpine Air Basin',
    region: 'San Juan Mountains, Colorado',
    range: 'San Juan Volcanic Uplift',
    elevationMeters: 3450,
    aqi: 35,
    pm25UgM3: 8.4,
    severity: 'clean_uncompromised',
    layer: 'alpine_ridge_free_air',
    inversionTrapped: false,
    activeFireDistanceKm: 95,
    description: 'Pristine high-altitude airflow with persistent mountain winds dispersing distant regional haze.',
    highlights: [
      'Clean uncompromised alpine air',
      'Low particulate concentration',
      'Full unrestricted athletic exertion safe',
    ],
  },
  {
    id: 'bob-marshall-wilderness-complex',
    title: 'Bob Marshall Complex River Basin Drift',
    region: 'Northern Rockies, Montana',
    range: 'Flathead National Forest',
    elevationMeters: 1620,
    aqi: 162,
    pm25UgM3: 76.8,
    severity: 'unhealthy_wildfire_plume',
    layer: 'valley_basin_trapping',
    inversionTrapped: true,
    activeFireDistanceKm: 25,
    description: 'Wildfire smoke pooling deeply along major wilderness river corridors during calm stagnant evening high-pressure.',
    highlights: [
      'River canyon smoke drainage',
      'Stable stagnant air boundary layer',
      'Significant night-time air stagnation',
    ],
  },
];

export const MANDATORY_SMOKE_GEAR: SmokeGearItem[] = [
  {
    id: 'n95-valved-particulate-respirator',
    name: 'Dual-Strap Valved N95 Particulate Respirator (NIOSH Certified)',
    category: 'respirator',
    mandatory: true,
    description: 'Filters 95% of fine airborne PM2.5 particles while exhalation valve prevents moisture buildup during trail ascents',
  },
  {
    id: 'sealed-smoke-goggles',
    name: 'Vented Foam-Sealed Smoke & Particulate Safety Goggles',
    category: 'eye_protection',
    mandatory: true,
    description: 'Shields eyes and conjunctival membranes from stinging wood smoke resin acids and flying ash particulate',
  },
  {
    id: 'portable-laser-pm25-monitor',
    name: 'Field-Deployable Laser PM2.5 / PM10 Air Quality Sensor',
    category: 'sensor',
    mandatory: true,
    description: 'Measures real-time microclimate particulate density in micrograms per cubic meter directly at camp',
  },
  {
    id: 'hepa-micro-tent-purifier',
    name: 'USB-Rechargeable In-Tent Positive-Pressure HEPA Air Scrubber',
    category: 'shelter',
    mandatory: true,
    description: 'Creates a clean-air microclimate inside enclosed backpacking tents to allow lungs to recover overnight',
  },
  {
    id: 'electrolyte-saline-eye-rinse',
    name: 'Sterile Ophthalmic Saline Flush & Eye Relief Solution (250ml)',
    category: 'medical',
    mandatory: true,
    description: 'Removes particulate grit, soot residue, and corrosive wood ash from eyes after windward ridgeline crossings',
  },
  {
    id: 'bronchodilator-emergency-inhaler-pouch',
    name: 'Weatherproof Emergency Inhaler & Respiration First Aid Pouch',
    category: 'respirator',
    mandatory: true,
    description: 'Keeps rapid-relief bronchodilators, antihistamines, and pulmonary triage instructions dry and instantly accessible',
  },
];

export function getSmokeStations(layer?: ElevationLayer, severity?: SmokeSeverity): SmokeStation[] {
  return SMOKE_STATIONS.filter((station) => {
    if (layer && station.layer !== layer) return false;
    if (severity && station.severity !== severity) return false;
    return true;
  });
}

export function getSmokeStationById(id: string): SmokeStation | undefined {
  return SMOKE_STATIONS.find((station) => station.id === id);
}

export function getSmokeGearChecklist(): SmokeGearItem[] {
  return [...MANDATORY_SMOKE_GEAR];
}

export function calculateSmokeExposure(query: SmokeAdvisoryQuery): SmokeAdvisoryResult {
  const station = getSmokeStationById(query.stationId) ?? SMOKE_STATIONS[0];

  // Elevation layer factor
  let layerFactor = 1.0;
  if (query.elevationLayer === 'valley_basin_trapping') {
    layerFactor = station.inversionTrapped ? 1.35 : 1.15;
  } else if (query.elevationLayer === 'mid_slope_thermal_belt') {
    layerFactor = 0.85;
  } else if (query.elevationLayer === 'alpine_ridge_free_air') {
    layerFactor = station.severity === 'hazardous_dense_inversion' ? 1.0 : 0.70;
  }

  const effectivePm25UgM3 = Math.round(station.pm25UgM3 * layerFactor * 10) / 10;

  // Effective AQI
  let effectiveAqi = 0;
  if (effectivePm25UgM3 <= 12.0) {
    effectiveAqi = Math.round((50 / 12.0) * effectivePm25UgM3);
  } else if (effectivePm25UgM3 <= 35.4) {
    effectiveAqi = Math.round(50 + ((100 - 50) / (35.4 - 12.0)) * (effectivePm25UgM3 - 12.0));
  } else if (effectivePm25UgM3 <= 55.4) {
    effectiveAqi = Math.round(101 + ((150 - 101) / (55.4 - 35.4)) * (effectivePm25UgM3 - 35.4));
  } else if (effectivePm25UgM3 <= 150.4) {
    effectiveAqi = Math.round(151 + ((200 - 151) / (150.4 - 55.4)) * (effectivePm25UgM3 - 55.4));
  } else if (effectivePm25UgM3 <= 250.4) {
    effectiveAqi = Math.round(201 + ((300 - 201) / (250.4 - 150.4)) * (effectivePm25UgM3 - 150.4));
  } else {
    effectiveAqi = Math.min(500, Math.round(301 + ((500 - 301) / (500.0 - 250.4)) * (effectivePm25UgM3 - 250.4)));
  }

  // Ventilation rate by activity intensity (m^3/hr)
  const ventilationRates: Record<ActivityIntensity, number> = {
    low_camp_rest: 0.6,
    moderate_backpacking: 1.8,
    strenuous_alpine_ascent: 3.2,
  };
  const ventilationRate = ventilationRates[query.activityIntensity] ?? 1.8;

  // Mask filtration efficiency
  const maskEfficiencies: Record<RespiratorType, number> = {
    none: 0.0,
    n95_particulate_respirator: 0.95,
    p100_elastomeric_half_mask: 0.999,
  };
  const maskEfficiency = maskEfficiencies[query.respiratorType] ?? 0.0;

  // Inhaled particulate dose in micrograms
  const exposureHours = Math.max(1, Math.min(24, query.exposureHours || 6));
  const inhaledParticulateDoseUg =
    Math.round(effectivePm25UgM3 * ventilationRate * (1 - maskEfficiency) * exposureHours * 10) / 10;

  // Safety status
  let safetyStatus: ExertionSafetyStatus = 'nominal_safe_exertion';
  if (effectiveAqi > 200 || inhaledParticulateDoseUg > 500) {
    safetyStatus = 'critical_hazard_cease_exertion';
  } else if (effectiveAqi > 100 || inhaledParticulateDoseUg > 150) {
    safetyStatus = 'caution_moderate_respiration';
  } else {
    safetyStatus = 'nominal_safe_exertion';
  }

  const inversionAlert = Boolean(
    station.inversionTrapped && query.elevationLayer === 'valley_basin_trapping'
  );

  const advisoryNotes: string[] = [];
  const recommendedActions: string[] = [];

  if (safetyStatus === 'critical_hazard_cease_exertion') {
    advisoryNotes.push(
      `Extreme particulate density: Effective PM2.5 is ${effectivePm25UgM3} µg/m³ with an AQI of ${effectiveAqi}.`
    );
    if (inversionAlert) {
      advisoryNotes.push(
        'Subsidence thermal inversion is actively trapping concentrated particulate in low valley drainages.'
      );
    }
    if (station.activeFireDistanceKm <= 25) {
      advisoryNotes.push(
        `Active wildfire plume located only ${station.activeFireDistanceKm} km away along primary convective airflow corridors.`
      );
    }
    advisoryNotes.push(
      `Calculated inhaled particulate dose over ${exposureHours} hours reaches ${inhaledParticulateDoseUg} µg.`
    );

    recommendedActions.push('Cease all strenuous cardiovascular exertion immediately to prevent acute bronchial injury.');
    recommendedActions.push('Ascend into mid-slope thermal belt refuge or evacuate downwind drainage basins.');
    if (query.respiratorType === 'none') {
      recommendedActions.push('Immediately don NIOSH-certified N95 or P100 particulate respirator for all trail movement.');
    } else {
      recommendedActions.push('Maintain tight seal on respirator; seal tent seams and activate positive-pressure filtration.');
    }
  } else if (safetyStatus === 'caution_moderate_respiration') {
    advisoryNotes.push(
      `Moderate particulate exposure: Effective PM2.5 is ${effectivePm25UgM3} µg/m³ (AQI: ${effectiveAqi}).`
    );
    advisoryNotes.push(
      `Projected ${exposureHours}-hour particulate dose is ${inhaledParticulateDoseUg} µg at current ventilation intensity.`
    );
    if (inversionAlert) {
      advisoryNotes.push('Early morning thermal inversion may trap smoke until afternoon convective heating begins.');
    }

    recommendedActions.push('Moderate respiration rate: avoid prolonged maximum aerobic ascents and pace climbs evenly.');
    if (query.respiratorType === 'none') {
      recommendedActions.push('Consider equipping an N95 respirator to reduce particulate uptake by 95%.');
    }
    recommendedActions.push('Rinse eyes with sterile ophthalmic saline flush after traversing exposed windward saddles.');
  } else {
    advisoryNotes.push(
      `Nominal backcountry air quality: PM2.5 is ${effectivePm25UgM3} µg/m³ (AQI: ${effectiveAqi}).`
    );
    advisoryNotes.push(
      `Inhaled particulate dose is minimal (${inhaledParticulateDoseUg} µg over ${exposureHours} hours).`
    );

    recommendedActions.push('Full athletic exertion and alpine climbing permitted with nominal respiratory risk.');
    recommendedActions.push('Pack an emergency N95 respirator and monitor afternoon wind shifts for sudden drift plumes.');
  }

  return {
    stationTitle: station.title,
    effectivePm25UgM3,
    effectiveAqi,
    inhaledParticulateDoseUg,
    safetyStatus,
    inversionAlert,
    advisoryNotes,
    recommendedActions,
  };
}
