export type ParamoSubstrateMorphology =
  | 'plantago_distichia_cushion_bog_dome'
  | 'espeletia_frailejon_tussock_matrix'
  | 'waterlogged_histosol_turbera_basin'
  | 'superparamo_periglacial_solifluction_scree'
  | 'polylepis_cloud_forest_ecotone_margin';

export type AndeanCloudFogRegime =
  | 'morning_zenith_uv_window'
  | 'orographic_paramo_drizzle_whiteout'
  | 'freezing_horizontal_sleet_squall'
  | 'nocturnal_radiative_needle_ice_frost';

export type ParamoTraversalTechnique =
  | 'distichia_cushion_dome_stepping'
  | 'tussock_crown_bridging_with_baskets'
  | 'wellies_and_gaiter_turbera_contouring'
  | 'compass_pacing_azimuth_dead_reckoning';

export type ParamoSafetyStatus =
  | 'nominal_morning_window_cushion_corridor'
  | 'caution_whiteout_fog_and_turbera_breakthrough'
  | 'abort_hypothermic_squall_and_peat_mire_entrapment';

export interface ParamoSite {
  id: string;
  name: string;
  region: string;
  country: string;
  elevationMeters: number;
  substrateMorphology: ParamoSubstrateMorphology;
  typicalFogRegime: AndeanCloudFogRegime;
  recommendedTechnique: ParamoTraversalTechnique;
  meanCushionMatThicknessCm: number;
  histosolWaterSaturationPercent: number;
  typicalVisibilityMeters: number;
  typicalAmbientTempC: number;
  typicalWindSpeedKmh: number;
  highlights: string[];
  bestSeason: string;
}

export interface ParamoGearItem {
  id: string;
  name: string;
  category:
    | 'turbera_footwear'
    | 'cushion_probing'
    | 'hypothermia_defense'
    | 'whiteout_wayfinding';
  mandatory: boolean;
  weightGrams: number;
  rationale: string;
}

export interface ParamoCalculatorInput {
  cushionMatThicknessCm: number;
  histosolWaterSaturationPercent: number;
  visibilityMeters: number;
  ambientTempC: number;
  windSpeedKmh: number;
  packWeightKg: number;
  substrateMorphology?: ParamoSubstrateMorphology;
  fogRegime?: AndeanCloudFogRegime;
}

export interface ParamoCalculatorResult {
  cushionBearingSafetyFactor: number;
  turberaBreakthroughProbability: number;
  effectiveWindChillC: number;
  azimuthDriftMetersPerKm: number;
  safetyStatus: ParamoSafetyStatus;
  turberaSteppingProtocol: string;
  whiteoutAndHypothermiaAdvisory: string;
}

export const PARAMO_SITES: ParamoSite[] = [
  {
    id: 'sumapaz-chisaca-laguna-tunjos-paramo',
    name: 'Páramo de Sumapaz & Lagunas de Chisacá Frailejón Moorland',
    region: 'Cundinamarca, Cordillera Oriental',
    country: 'Colombia',
    elevationMeters: 3780,
    substrateMorphology: 'espeletia_frailejon_tussock_matrix',
    typicalFogRegime: 'orographic_paramo_drizzle_whiteout',
    recommendedTechnique: 'tussock_crown_bridging_with_baskets',
    meanCushionMatThicknessCm: 26,
    histosolWaterSaturationPercent: 78,
    typicalVisibilityMeters: 45,
    typicalAmbientTempC: 5,
    typicalWindSpeedKmh: 24,
    highlights: [
      'Dense Espeletia grandiflora (frailejón) rosette corridors and Calamagrostis effusa tussock crowns spanning dark Andosol-Histosol peat troughs',
      'Afternoon Amazonian-Orinocan orographic cloud advection reducing visibility below 45 m across the Chisacá-Los Tunjos glacial basin',
      'Subsurface water-saturated turbera conduits hidden beneath overhanging tussock skirts that require 85 mm snow-basket pole probing',
    ],
    bestSeason: 'December – February (Dry-Season Morning Window)',
  },
  {
    id: 'el-angel-frailejon-giant-rosette-reserve',
    name: 'Reserva Ecológica El Ángel & Voladero Cushion-Bog Basin',
    region: 'Carchi Province, Northern Andes',
    country: 'Ecuador',
    elevationMeters: 3850,
    substrateMorphology: 'plantago_distichia_cushion_bog_dome',
    typicalFogRegime: 'morning_zenith_uv_window',
    recommendedTechnique: 'distichia_cushion_dome_stepping',
    meanCushionMatThicknessCm: 38,
    histosolWaterSaturationPercent: 68,
    typicalVisibilityMeters: 220,
    typicalAmbientTempC: 8,
    typicalWindSpeedKmh: 16,
    highlights: [
      'Firm, convex Plantago rigida and Distichia muscoides vascular cushion domes up to 38 cm thick around Lagunas del Voladero',
      'Towering Espeletia pycnophylla (frailejón) forests reaching 5–7 m height with thick marcescent leaf necromass sheaths',
      'High-equatorial morning UV window giving way to rapid midday cloud-bank immersion along the Chiles-Potrerillos divide',
    ],
    bestSeason: 'June – September (Equatorial Dry-Wind Window)',
  },
  {
    id: 'cajas-toreadora-glacial-turbera-labyrinth',
    name: 'Parque Nacional Cajas & Luspa Glacial-Trough Turbera Labyrinth',
    region: 'Azuay Province, Southern Andes',
    country: 'Ecuador',
    elevationMeters: 3960,
    substrateMorphology: 'waterlogged_histosol_turbera_basin',
    typicalFogRegime: 'orographic_paramo_drizzle_whiteout',
    recommendedTechnique: 'wellies_and_gaiter_turbera_contouring',
    meanCushionMatThicknessCm: 14,
    histosolWaterSaturationPercent: 92,
    typicalVisibilityMeters: 28,
    typicalAmbientTempC: 4,
    typicalWindSpeedKmh: 32,
    highlights: [
      'Over 270 glacially scoured tarns connected by 92%-saturated Histosol peat mires (turberas) and thin Sphagnum-Werneria mats',
      'Persistent Pacific-Amazonian cross-divide drizzle and 32 km/h wind chill driving rapid conductive hypothermia in wet footwear',
      'Complex U-shaped valley floor intersections requiring knee-high neoprene-lined rubber pantaneras and high-wall moraine contouring',
    ],
    bestSeason: 'August – November (Austral Transition Window)',
  },
  {
    id: 'cocuy-ritacuba-superparamo-cushion-pass',
    name: 'Sierra Nevada del Cocuy & Valle de los Cojines Distichia Pass',
    region: 'Boyacá, Cordillera Oriental',
    country: 'Colombia',
    elevationMeters: 4380,
    substrateMorphology: 'superparamo_periglacial_solifluction_scree',
    typicalFogRegime: 'freezing_horizontal_sleet_squall',
    recommendedTechnique: 'compass_pacing_azimuth_dead_reckoning',
    meanCushionMatThicknessCm: 18,
    histosolWaterSaturationPercent: 85,
    typicalVisibilityMeters: 18,
    typicalAmbientTempC: 1,
    typicalWindSpeedKmh: 46,
    highlights: [
      'High-altitude superpáramo valley at 4,380 m carpeted in mosaic Distichia muscoides cushions bordered by periglacial frost-shattered quartzite scree',
      'Fierce horizontal Llanos sleet squalls (46 km/h) and sub-zero wind chill erasing visual landmarks within minutes',
      'Strict mirror-sighting compass dead reckoning and altimeter contour verification mandatory across featureless cushion passes',
    ],
    bestSeason: 'December – February (Verano Seco High-Pressure Window)',
  },
  {
    id: 'chirripo-sabana-de-los-leones-talamanca-paramo',
    name: 'Cerro Chirripó & Valle de los Conejos Chusquea-Páramo Basin',
    region: 'Cordillera de Talamanca',
    country: 'Costa Rica',
    elevationMeters: 3520,
    substrateMorphology: 'polylepis_cloud_forest_ecotone_margin',
    typicalFogRegime: 'nocturnal_radiative_needle_ice_frost',
    recommendedTechnique: 'distichia_cushion_dome_stepping',
    meanCushionMatThicknessCm: 32,
    histosolWaterSaturationPercent: 71,
    typicalVisibilityMeters: 160,
    typicalAmbientTempC: 7,
    typicalWindSpeedKmh: 20,
    highlights: [
      'Northernmost Neotropical páramo enclave featuring dwarf Chusquea subtessellata bamboo, peat cushion pockets, and stunted cloud-forest ecotones',
      'Strong nocturnal radiative cooling in glacially carved cirques producing needle-ice (pipkrake) heave across saturated organic soils',
      'Sharp afternoon Caribbean trade-wind fog banks rolling over Crestones ridges into Valle de los Conejos',
    ],
    bestSeason: 'January – April (Dry Trade-Wind Dawn Window)',
  },
];

export const PARAMO_GEAR_CHECKLIST: ParamoGearItem[] = [
  {
    id: 'knee-high-neoprene-lined-rubber-paramo-panteneras',
    name: 'Knee-High Neoprene-Lined Vulcanized Rubber Páramo Pantaneras',
    category: 'turbera_footwear',
    mandatory: true,
    weightGrams: 1680,
    rationale:
      'Standard waterproof-breathable hiking boots flood over the ankle collar within minutes in 80–95% saturated Histosol turberas; 40 cm knee-high vulcanized rubber wellies (pantaneras) with 5 mm neoprene insulation prevent cold bog water ingress and conductive foot immersion.',
  },
  {
    id: 'dual-probe-85mm-snow-basket-trekking-poles',
    name: 'Dual-Probe Carbon/Alloy Trekking Poles with 85 mm Snow Baskets',
    category: 'cushion_probing',
    mandatory: true,
    weightGrams: 540,
    rationale:
      'Wide 85 mm snow baskets prevent pole tips from punching straight through vascular Distichia and Plantago cushion domes while allowing forward depth-probing of black inter-dome peat channels before committing full pack weight.',
  },
  {
    id: 'three-layer-hydrostatic-28k-gore-pro-hardshell',
    name: '3-Layer 28,000 mm Hydrostatic-Head Storm Hardshell Jacket & Pants',
    category: 'hypothermia_defense',
    mandatory: true,
    weightGrams: 820,
    rationale:
      'Continuous horizontal orographic páramo drizzle (llovizna) driven by 30–50 km/h winds at 1–5 °C rapidly overwhelms DWR-only softshells, triggering wet-cold conductive hypothermia above 3,700 m.',
  },
  {
    id: 'declination-adjustable-mirror-sighting-compass-and-altimeter',
    name: 'Declination-Adjustable Mirror Sighting Compass & Barometric Altimeter',
    category: 'whiteout_wayfinding',
    mandatory: true,
    weightGrams: 145,
    rationale:
      'Enables leapfrog azimuth sighting between giant Espeletia (frailejón) rosettes and barometric contour-line tracking when dense afternoon cloud banks reduce visibility below 30 m across featureless glacial basins.',
  },
  {
    id: 'vapor-barrier-fleece-liner-gloves-and-overmitts',
    name: 'Seam-Taped Waterproof Shell Overmitts & Fleece/Vapor-Barrier Liners',
    category: 'hypothermia_defense',
    mandatory: true,
    weightGrams: 210,
    rationale:
      'Preserves manual dexterity for compass bezel adjustments and trekking-pole probing when 1–5 °C rain and sleet squalls numb exposed fingers within 15 minutes.',
  },
  {
    id: 'ultralight-bothy-bag-emergency-storm-shelter',
    name: '2-Person Siliconized Nylon Emergency Bothy Bag Storm Shelter',
    category: 'hypothermia_defense',
    mandatory: true,
    weightGrams: 360,
    rationale:
      'Deploys in under 30 seconds over seated navigators where waterlogged peat turberas prohibit tent-stake pitching, creating a +8 to +12 °C internal microclimate during freezing sleet squalls.',
  },
];

export function getAllParamoSites(): ParamoSite[] {
  return PARAMO_SITES;
}

export function getParamoSiteById(id: string): ParamoSite | undefined {
  return PARAMO_SITES.find((site) => site.id === id);
}

export function filterParamoSites(filters?: {
  substrateMorphology?: ParamoSubstrateMorphology;
  fogRegime?: AndeanCloudFogRegime;
  technique?: ParamoTraversalTechnique;
}): ParamoSite[] {
  if (!filters) {
    return PARAMO_SITES;
  }
  return PARAMO_SITES.filter((site) => {
    if (
      filters.substrateMorphology &&
      site.substrateMorphology !== filters.substrateMorphology
    ) {
      return false;
    }
    if (filters.fogRegime && site.typicalFogRegime !== filters.fogRegime) {
      return false;
    }
    if (
      filters.technique &&
      site.recommendedTechnique !== filters.technique
    ) {
      return false;
    }
    return true;
  });
}

export function getParamoGearChecklist(): ParamoGearItem[] {
  return PARAMO_GEAR_CHECKLIST;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

const SUBSTRATE_BEARING_MULTIPLIERS: Record<ParamoSubstrateMorphology, number> =
  {
    plantago_distichia_cushion_bog_dome: 1.28,
    polylepis_cloud_forest_ecotone_margin: 1.12,
    espeletia_frailejon_tussock_matrix: 0.95,
    superparamo_periglacial_solifluction_scree: 0.82,
    waterlogged_histosol_turbera_basin: 0.55,
  };

export function calculateParamoNavigationSafety(
  input: ParamoCalculatorInput
): ParamoCalculatorResult {
  const {
    cushionMatThicknessCm,
    histosolWaterSaturationPercent,
    visibilityMeters,
    ambientTempC,
    windSpeedKmh,
    packWeightKg,
    substrateMorphology,
    fogRegime,
  } = input;

  if (
    !Number.isFinite(cushionMatThicknessCm) ||
    cushionMatThicknessCm < 2 ||
    cushionMatThicknessCm > 100
  ) {
    throw new Error(
      'Invalid cushionMatThicknessCm: must be between 2 and 100 cm.'
    );
  }

  if (
    !Number.isFinite(histosolWaterSaturationPercent) ||
    histosolWaterSaturationPercent < 20 ||
    histosolWaterSaturationPercent > 100
  ) {
    throw new Error(
      'Invalid histosolWaterSaturationPercent: must be between 20 and 100 percent.'
    );
  }

  if (
    !Number.isFinite(visibilityMeters) ||
    visibilityMeters < 2 ||
    visibilityMeters > 2000
  ) {
    throw new Error(
      'Invalid visibilityMeters: must be between 2 and 2000 meters.'
    );
  }

  if (
    !Number.isFinite(ambientTempC) ||
    ambientTempC < -15 ||
    ambientTempC > 28
  ) {
    throw new Error('Invalid ambientTempC: must be between -15 and 28 °C.');
  }

  if (
    !Number.isFinite(windSpeedKmh) ||
    windSpeedKmh < 0 ||
    windSpeedKmh > 120
  ) {
    throw new Error('Invalid windSpeedKmh: must be between 0 and 120 km/h.');
  }

  if (
    !Number.isFinite(packWeightKg) ||
    packWeightKg < 0 ||
    packWeightKg > 45
  ) {
    throw new Error('Invalid packWeightKg: must be between 0 and 45 kg.');
  }

  const substrateMultiplier = substrateMorphology
    ? SUBSTRATE_BEARING_MULTIPLIERS[substrateMorphology]
    : 0.92;

  const cushionBearingSafetyFactor = roundTo(
    clamp(
      (cushionMatThicknessCm / (10 + packWeightKg * 0.25)) *
        substrateMultiplier *
        Math.max(0.35, 1.35 - (histosolWaterSaturationPercent / 100) * 0.78),
      0.15,
      4.5
    ),
    2
  );

  const turberaBreakthroughProbability = roundTo(
    clamp(
      0.86 -
        cushionBearingSafetyFactor * 0.34 +
        Math.max(0, histosolWaterSaturationPercent - 75) * 0.012,
      0.02,
      0.98
    ),
    2
  );

  const effectiveWindChillC = roundTo(
    windSpeedKmh >= 5
      ? 13.12 +
          0.6215 * ambientTempC -
          11.37 * Math.pow(windSpeedKmh, 0.16) +
          0.3965 * ambientTempC * Math.pow(windSpeedKmh, 0.16)
      : ambientTempC,
    1
  );

  const azimuthDriftMetersPerKm = Math.round(
    clamp(
      12 +
        (1200 / Math.max(5, visibilityMeters)) * 2.1 +
        (fogRegime === 'orographic_paramo_drizzle_whiteout' ||
        fogRegime === 'freezing_horizontal_sleet_squall'
          ? 35
          : 0),
      8,
      420
    )
  );

  let safetyStatus: ParamoSafetyStatus;
  if (
    cushionBearingSafetyFactor < 1.1 ||
    turberaBreakthroughProbability >= 0.56 ||
    effectiveWindChillC <= -5.0 ||
    visibilityMeters < 15
  ) {
    safetyStatus = 'abort_hypothermic_squall_and_peat_mire_entrapment';
  } else if (
    cushionBearingSafetyFactor < 1.75 ||
    turberaBreakthroughProbability >= 0.28 ||
    effectiveWindChillC <= 2.5 ||
    visibilityMeters < 65 ||
    histosolWaterSaturationPercent >= 82
  ) {
    safetyStatus = 'caution_whiteout_fog_and_turbera_breakthrough';
  } else {
    safetyStatus = 'nominal_morning_window_cushion_corridor';
  }

  const turberaSteppingProtocol =
    safetyStatus === 'abort_hypothermic_squall_and_peat_mire_entrapment'
      ? `ABORT TURBERA BASIN CROSSING: Cushion bearing safety factor is critically low (${cushionBearingSafetyFactor}) with ${Math.round(turberaBreakthroughProbability * 100)}% peat-mire breakthrough probability in ${histosolWaterSaturationPercent}% waterlogged histosol. Retreat to drained moraine crests; step strictly onto firm convex Distichia muscoides and Plantago rigida cushion centers rather than dark inter-dome waterlogged histosol channels, and probe black peat margins ahead with 85 mm basket poles.`
      : safetyStatus === 'caution_whiteout_fog_and_turbera_breakthrough'
        ? `CAUTION TURBERA STEPPING PROTOCOL: Cushion bearing safety factor is ${cushionBearingSafetyFactor} (${Math.round(turberaBreakthroughProbability * 100)}% breakthrough risk). Probe black peat margins with 85 mm basket poles before committing full pack weight (${packWeightKg} kg), step onto convex Distichia muscoides / Plantago rigida cushion centers or Calamagrostis tussock crowns rather than dark inter-dome waterlogged histosol channels, and wear knee-high neoprene-lined pantaneras.`
        : `NOMINAL CUSHION-BOG CORRIDOR PROTOCOL: Cushion bearing safety factor is ${cushionBearingSafetyFactor} (${Math.round(turberaBreakthroughProbability * 100)}% breakthrough risk). Step onto convex Distichia muscoides / Plantago rigida cushion centers rather than dark inter-dome waterlogged histosol channels, and probe black peat margins with 85 mm basket poles to preserve fragile cushion domes.`;

  const whiteoutAndHypothermiaAdvisory =
    safetyStatus === 'abort_hypothermic_squall_and_peat_mire_entrapment'
      ? `CRITICAL HYPOTHERMIC SQUALL & WHITEOUT ALERT: Effective wind chill is ${effectiveWindChillC} °C with ${visibilityMeters} m visibility (${azimuthDriftMetersPerKm} m/km azimuth drift). Deploy the bothy shelter immediately against driving cold páramo drizzle and sleet, seal 3-layer hardshell closures and overmitts, and halt traverse until visibility recovers or navigate via strict leapfrog sighting-compass bearings between giant Espeletia (frailejón) rosettes.`
      : safetyStatus === 'caution_whiteout_fog_and_turbera_breakthrough'
        ? `ACTIVE OROGRAPHIC WHITEOUT & WET-COLD ADVISORY: Visibility is ${visibilityMeters} m (${azimuthDriftMetersPerKm} m/km azimuth drift) with ${effectiveWindChillC} °C effective wind chill. Take leapfrog sighting-compass bearings between giant Espeletia (frailejón) rosettes when visibility drops below 50 m, wear full 28,000 mm hardshell armor and waterproof overmitts, and keep the bothy shelter ready for rapid deployment against driving cold páramo drizzle.`
        : `NOMINAL MORNING WINDOW & WAYFINDING ADVISORY: Visibility is ${visibilityMeters} m (${azimuthDriftMetersPerKm} m/km azimuth drift) with ${effectiveWindChillC} °C effective wind chill. Log baseline mirror-compass azimuths and altimeter elevations now before afternoon cloud advection; be prepared to take leapfrog sighting-compass bearings between giant Espeletia (frailejón) rosettes if visibility drops below 50 m and carry a bothy shelter against driving cold páramo drizzle.`;

  return {
    cushionBearingSafetyFactor,
    turberaBreakthroughProbability,
    effectiveWindChillC,
    azimuthDriftMetersPerKm,
    safetyStatus,
    turberaSteppingProtocol,
    whiteoutAndHypothermiaAdvisory,
  };
}
