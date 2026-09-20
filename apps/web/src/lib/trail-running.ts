export type TechnicalDifficulty =
  | 'moderate'
  | 'technical'
  | 'steep_scramble'
  | 'severe_technical'
  | 'high_mountain';

export type TerrainType =
  | 'granite_talus'
  | 'volcanic_scree'
  | 'mixed_alpine_forest'
  | 'root_rock_forest'
  | 'sand_boulder_headland';

export interface TrailRunRoute {
  id: string;
  name: string;
  region: string;
  distanceMiles: number;
  elevationGainFt: number;
  elevationLossFt: number;
  technicalDifficulty: TechnicalDifficulty;
  terrainType: TerrainType;
  waterRefillPoints: number;
  estimatedFastTimeHrs: number;
  recommendedDropMm: number;
  lugDepthMm: number;
  description: string;
  mandatoryGear: string[];
}

export interface PacingQuery {
  routeId: string;
  targetPaceMinMile: number;
  runnerWeightLbs: number;
  ambientTempF: number;
}

export interface PacingResult {
  estimatedTimeHours: number;
  totalCaloriesKcal: number;
  hourlyCarbsGrams: number;
  fluidLitersTotal: number;
  electrolytesMgHourly: number;
  hydrationVestMinCapacityL: number;
  pacingSplits: string[];
}

export interface TrailRunningGearItem {
  id: string;
  name: string;
  mandatory: boolean;
  category: 'hydration' | 'protection' | 'traction' | 'nutrition' | 'first_aid';
  notes: string;
}

export const TRAIL_RUN_ROUTES: TrailRunRoute[] = [
  {
    id: 'enchantments-thru-run',
    name: 'The Enchantments Thru-Run',
    region: 'Alpine Lakes Wilderness, WA',
    distanceMiles: 18.5,
    elevationGainFt: 4500,
    elevationLossFt: 6500,
    technicalDifficulty: 'severe_technical',
    terrainType: 'granite_talus',
    waterRefillPoints: 6,
    estimatedFastTimeHrs: 5.5,
    recommendedDropMm: 5,
    lugDepthMm: 5,
    description:
      'A legendary point-to-point alpine traverse conquering Aasgard Pass, technical granite slabs, and glaciated alpine lakes.',
    mandatoryGear: [
      'Hydration vest (min 1.5L capacity)',
      'Ultralight emergency bivy / space blanket',
      'Running microspikes / traction cleats',
      'Waterproof breathable hooded shell (taped seams)',
      'High-lumen rechargeable headlamp + emergency spare battery',
      'Squeeze water filtration flask + electrolyte tablets',
    ],
  },
  {
    id: 'timberline-trail-ultra',
    name: 'Timberline Trail Around Mt. Hood',
    region: 'Mt. Hood Wilderness, OR',
    distanceMiles: 40.2,
    elevationGainFt: 9000,
    elevationLossFt: 9000,
    technicalDifficulty: 'technical',
    terrainType: 'volcanic_scree',
    waterRefillPoints: 10,
    estimatedFastTimeHrs: 8.5,
    recommendedDropMm: 6,
    lugDepthMm: 4.5,
    description:
      'A rugged circumambulation of Mt. Hood navigating glacial river fords, steep volcanic scree, and sprawling subalpine ridges.',
    mandatoryGear: [
      'Hydration vest (min 1.5L capacity)',
      'Ultralight emergency bivy / space blanket',
      'Running microspikes / traction cleats',
      'Waterproof breathable hooded shell (taped seams)',
      'High-lumen rechargeable headlamp + emergency spare battery',
      'Squeeze water filtration flask + electrolyte tablets',
    ],
  },
  {
    id: 'wonderland-trail-fastpack',
    name: 'Wonderland Trail Fastpack',
    region: 'Mt. Rainier, WA',
    distanceMiles: 93.0,
    elevationGainFt: 24000,
    elevationLossFt: 24000,
    technicalDifficulty: 'high_mountain',
    terrainType: 'mixed_alpine_forest',
    waterRefillPoints: 18,
    estimatedFastTimeHrs: 22.0,
    recommendedDropMm: 6,
    lugDepthMm: 5,
    description:
      'The crown jewel of Pacific Northwest mountain ultramarathoning: complete circumnavigation of Tahoma across grueling alpine passes and glacial gorges.',
    mandatoryGear: [
      'Hydration vest (min 1.5L capacity)',
      'Ultralight emergency bivy / space blanket',
      'Running microspikes / traction cleats',
      'Waterproof breathable hooded shell (taped seams)',
      'High-lumen rechargeable headlamp + emergency spare battery',
      'Squeeze water filtration flask + electrolyte tablets',
    ],
  },
  {
    id: 'si-mailbox-vertical-double',
    name: 'Mount Si to Mailbox Peak Double Vert',
    region: 'Snoqualmie Corridor, WA',
    distanceMiles: 16.0,
    elevationGainFt: 7200,
    elevationLossFt: 7200,
    technicalDifficulty: 'steep_scramble',
    terrainType: 'root_rock_forest',
    waterRefillPoints: 2,
    estimatedFastTimeHrs: 4.0,
    recommendedDropMm: 5,
    lugDepthMm: 6,
    description:
      'A relentless vertical double-summit mountain run scaling the roots and boulder fields of the Cascade foothills.',
    mandatoryGear: [
      'Hydration vest (min 1.5L capacity)',
      'Ultralight emergency bivy / space blanket',
      'Running microspikes / traction cleats',
      'Waterproof breathable hooded shell (taped seams)',
      'High-lumen rechargeable headlamp + emergency spare battery',
      'Squeeze water filtration flask + electrolyte tablets',
    ],
  },
  {
    id: 'olympic-coast-wilderness-run',
    name: 'Olympic Wilderness Coast Tide Run',
    region: 'Olympic NP, WA',
    distanceMiles: 17.5,
    elevationGainFt: 1200,
    elevationLossFt: 1200,
    technicalDifficulty: 'moderate',
    terrainType: 'sand_boulder_headland',
    waterRefillPoints: 4,
    estimatedFastTimeHrs: 3.5,
    recommendedDropMm: 4,
    lugDepthMm: 4,
    description:
      'A coastal ultramarathon route through wilderness beaches, slippery sea-stack boulder scrambles, and tidal headland overland ropes.',
    mandatoryGear: [
      'Hydration vest (min 1.5L capacity)',
      'Ultralight emergency bivy / space blanket',
      'Running microspikes / traction cleats',
      'Waterproof breathable hooded shell (taped seams)',
      'High-lumen rechargeable headlamp + emergency spare battery',
      'Squeeze water filtration flask + electrolyte tablets',
    ],
  },
];

export const TRAIL_RUNNING_GEAR: TrailRunningGearItem[] = [
  {
    id: 'hydration-vest',
    name: 'Hydration vest (min 1.5L capacity)',
    mandatory: true,
    category: 'hydration',
    notes: 'Secure race vest carrying front collapsible flasks and rear bladder with zero bounce.',
  },
  {
    id: 'emergency-bivy',
    name: 'Ultralight emergency bivy / space blanket',
    mandatory: true,
    category: 'protection',
    notes: 'Thermal reflective emergency bivy shelter for hypothermia protection and unexpected mountain nights.',
  },
  {
    id: 'running-microspikes',
    name: 'Running microspikes / traction cleats',
    mandatory: true,
    category: 'traction',
    notes: 'Elastomer harness with steel spikes for crossing frozen snowfields, firn, and steep icy terrain.',
  },
  {
    id: 'waterproof-shell',
    name: 'Waterproof breathable hooded shell (taped seams)',
    mandatory: true,
    category: 'protection',
    notes: 'Ultralight mountain shell with minimum 10,000mm hydrostatic head and fully taped seams.',
  },
  {
    id: 'rechargeable-headlamp',
    name: 'High-lumen rechargeable headlamp + emergency spare battery',
    mandatory: true,
    category: 'first_aid',
    notes: 'Minimum 300+ lumens with reserve battery pack for night alpine trail navigation.',
  },
  {
    id: 'filtration-flask',
    name: 'Squeeze water filtration flask + electrolyte tablets',
    mandatory: true,
    category: 'nutrition',
    notes: 'Rapid 0.1-micron hollow-fiber filtration bottle plus high-sodium replacement tablets.',
  },
];

export function getTrailRunRoutes(difficulty?: TechnicalDifficulty): TrailRunRoute[] {
  if (!difficulty) {
    return TRAIL_RUN_ROUTES;
  }
  return TRAIL_RUN_ROUTES.filter((route) => route.technicalDifficulty === difficulty);
}

export function getTrailRunRouteById(id: string): TrailRunRoute | undefined {
  return TRAIL_RUN_ROUTES.find((route) => route.id === id);
}

export function getTrailRunningGear(): TrailRunningGearItem[] {
  return TRAIL_RUNNING_GEAR;
}

export function calculateTrailRunPacing(query: PacingQuery): PacingResult {
  const route = getTrailRunRouteById(query.routeId);
  if (!route) {
    throw new Error(`Route with id "${query.routeId}" not found`);
  }

  // Base flat time: distance * target pace in minutes
  const flatMinutes = route.distanceMiles * query.targetPaceMinMile;
  // Elevation gain penalty: ~12 minutes per 1,000 ft vertical gain
  const vertMinutes = (route.elevationGainFt / 1000) * 12;
  const totalMinutes = flatMinutes + vertMinutes;
  const estimatedTimeHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Caloric fuel burn: flat mechanical cost + vertical elevation work
  // Flat cost: 0.75 kcal per mile per lb of runner weight
  // Vertical climbing cost: 0.0015 kcal per ft per lb of runner weight
  const flatCalories = route.distanceMiles * query.runnerWeightLbs * 0.75;
  const vertCalories = route.elevationGainFt * query.runnerWeightLbs * 0.0015;
  const totalCaloriesKcal = Math.round(flatCalories + vertCalories);

  // Hourly carbohydrate intake target: 40-90g/hr scaled by intensity and body mass
  const baseCarbs = (query.runnerWeightLbs / 150) * 60;
  const paceFactor = Math.max(0.8, Math.min(1.4, 14 / Math.max(6, query.targetPaceMinMile)));
  const hourlyCarbsGrams = Math.min(90, Math.max(40, Math.round(baseCarbs * paceFactor)));

  // Fluid intake: baseline 0.55 L/hr, scaled for ambient temperature (>60F) and runner body mass
  const tempExcess = Math.max(0, query.ambientTempF - 60);
  const hourlyFluidLiters = (0.55 + tempExcess * 0.015) * (query.runnerWeightLbs / 150);
  const fluidLitersTotal = Math.round(estimatedTimeHours * hourlyFluidLiters * 10) / 10;

  // Hourly electrolytes (sodium): 450mg/hr baseline + heat adjustment + weight factor
  const electrolytesMgHourly = Math.round(
    Math.min(1000, Math.max(300, 450 + tempExcess * 8 + (query.runnerWeightLbs - 150) * 1.2))
  );

  // Hydration vest capacity requirement based on longest stretch between water refill points
  const refillIntervalMiles = route.distanceMiles / Math.max(1, route.waterRefillPoints);
  const timeBetweenRefillsHours = (refillIntervalMiles / route.distanceMiles) * estimatedTimeHours;
  const fluidBetweenRefills = timeBetweenRefillsHours * hourlyFluidLiters;
  // +0.5L safety margin, clamped at minimum 1.5L
  const hydrationVestMinCapacityL = Math.max(1.5, Math.round((fluidBetweenRefills + 0.5) * 2) / 2);

  // Pacing split checkpoints (quarterly breakdown)
  const quarters = [
    {
      label: `Mile 0.0 to ${(route.distanceMiles * 0.25).toFixed(1)}`,
      pct: 0.25,
      stage: 'Initial Ascent & Aerobic Rhythm',
    },
    {
      label: `Mile ${(route.distanceMiles * 0.25).toFixed(1)} to ${(route.distanceMiles * 0.5).toFixed(1)}`,
      pct: 0.5,
      stage: 'Mid-Route Alpine Section',
    },
    {
      label: `Mile ${(route.distanceMiles * 0.5).toFixed(1)} to ${(route.distanceMiles * 0.75).toFixed(1)}`,
      pct: 0.75,
      stage: 'High Mountain Pass & Technical Traverse',
    },
    {
      label: `Mile ${(route.distanceMiles * 0.75).toFixed(1)} to ${route.distanceMiles.toFixed(1)}`,
      pct: 1.0,
      stage: 'Final Descent & Trailhead Push',
    },
  ];

  const pacingSplits = quarters.map((q) => {
    const splitElapsedHrs = (estimatedTimeHours * q.pct).toFixed(1);
    return `${q.label} (${q.stage}) — Split Elapsed: ${splitElapsedHrs}h`;
  });

  return {
    estimatedTimeHours,
    totalCaloriesKcal,
    hourlyCarbsGrams,
    fluidLitersTotal,
    electrolytesMgHourly,
    hydrationVestMinCapacityL,
    pacingSplits,
  };
}
