export type TrailDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expedition_extreme';

export type TrailSurfaceType =
  | 'groomed_hardpack'
  | 'frozen_lake_hardpack'
  | 'river_ice_and_powder'
  | 'glare_ice_jumble'
  | 'windblown_tundra_sea_ice';

export interface DogsledRoute {
  id: string;
  title: string;
  region: string;
  distanceKm: number;
  typicalDurationDays: number;
  difficulty: TrailDifficulty;
  trailSurface: TrailSurfaceType;
  recommendedTeamSize: number;
  minRestRatio: number; // e.g. 1.0 means 1 hr rest per 1 hr run
  lowTempRecordF: number;
  description: string;
  highlights: string[];
}

export interface MushingPacingQuery {
  routeId: string;
  teamDogCount: number; // 4 to 16 dogs, default 8
  ambientTempF: number; // -60 to 35 F, default -10
  cargoWeightKg: number; // 20 to 250 kg, default 65
  dailyRunHours: number; // 2 to 14 hours, default 6
  trailSurface: TrailSurfaceType;
}

export interface MushingPacingResult {
  routeTitle: string;
  effectiveSpeedKmh: number;
  dailyDistanceKm: number;
  dogCaloriesPerDay: number;
  teamTotalCaloriesPerDay: number;
  totalMeltWaterLiters: number;
  recommendedRestHours: number;
  requiredBootieCount: number;
  safetyStatus: 'optimal' | 'caution' | 'critical_hazard';
  trailAdvisory: string;
}

export interface MushingGearItem {
  id: string;
  name: string;
  category:
    | 'dog_welfare'
    | 'sled_anchors'
    | 'rigging_harness'
    | 'feeding_cooker'
    | 'nutrition'
    | 'musher_survival';
  mandatory: boolean;
  description: string;
}

export const DOGSLED_ROUTES: DogsledRoute[] = [
  {
    id: 'iditarod-historic-trail-traverse',
    title: 'Iditarod National Historic Trail Mushing Traverse',
    region: 'Seward to Nome, AK',
    distanceKm: 1560,
    typicalDurationDays: 11,
    difficulty: 'expedition_extreme',
    trailSurface: 'windblown_tundra_sea_ice',
    recommendedTeamSize: 14,
    minRestRatio: 1.0,
    lowTempRecordF: -55,
    description:
      'The premier subarctic ultra-distance sled dog expedition traversing mountain passes, frozen interior rivers, and treacherous Norton Sound sea ice.',
    highlights: [
      'Rainy Pass mountain divide',
      'Yukon River frozen ice highway',
      'Norton Sound sea ice ground blizzards',
    ],
  },
  {
    id: 'boundary-waters-quetico-run',
    title: 'Boundary Waters Frozen Lakes Wilderness Circuit',
    region: 'Ely & Superior National Forest, MN',
    distanceKm: 120,
    typicalDurationDays: 3,
    difficulty: 'intermediate',
    trailSurface: 'frozen_lake_hardpack',
    recommendedTeamSize: 6,
    minRestRatio: 0.8,
    lowTempRecordF: -35,
    description:
      'Classic Northwoods wilderness mushing over glaciated frozen lakes, portage trails, and dense boreal pine forests.',
    highlights: [
      'Endless lake chain crossings',
      'Wolf howling night bivouacs',
      'Tight pine portage trail handling',
    ],
  },
  {
    id: 'yukon-quest-eagle-summit',
    title: 'Yukon Quest Eagle Summit Alpine Crossing',
    region: 'Whitehorse to Fairbanks, YT/AK',
    distanceKm: 480,
    typicalDurationDays: 5,
    difficulty: 'advanced',
    trailSurface: 'glare_ice_jumble',
    recommendedTeamSize: 12,
    minRestRatio: 1.0,
    lowTempRecordF: -60,
    description:
      'Notoriously rugged alpine mushing conquering the exposed 3,652-foot Eagle Summit in brutal gale-force arctic winds.',
    highlights: [
      'Eagle Summit vertical ascent',
      'Glare ice shelf drop-offs',
      'Open river overflow hazard avoidance',
    ],
  },
  {
    id: 'denali-sanctuary-river-patrol',
    title: 'Denali Wilderness National Park Sled Patrol',
    region: 'Denali National Park, AK',
    distanceKm: 180,
    typicalDurationDays: 4,
    difficulty: 'intermediate',
    trailSurface: 'river_ice_and_powder',
    recommendedTeamSize: 8,
    minRestRatio: 0.9,
    lowTempRecordF: -45,
    description:
      'Traditional Alaskan freight sled mushing along braided glacial river gravel bars and pristine sub-peak valleys.',
    highlights: [
      'Mount Denali panoramic views',
      'Ranger freight sled heritage',
      'Moose trail route clearing',
    ],
  },
  {
    id: 'maine-north-woods-allagash',
    title: 'Allagash Wilderness Waterway Winter Trail',
    region: 'Northern Maine Woods, ME',
    distanceKm: 85,
    typicalDurationDays: 2,
    difficulty: 'beginner',
    trailSurface: 'groomed_hardpack',
    recommendedTeamSize: 6,
    minRestRatio: 0.7,
    lowTempRecordF: -25,
    description:
      'Gentle introduction to wilderness dog mushing along historic logging roads and sheltered riverways in the deep Maine woods.',
    highlights: [
      'Allagash River ice corridor',
      'Heated wilderness wall-tent camps',
      'Gentle rolling trail terrain',
    ],
  },
];

export const MUSHING_GEAR: MushingGearItem[] = [
  {
    id: 'dog-protective-booties',
    name: 'Cordura / Polar Fleece Sled Dog Booties (16 per dog)',
    category: 'dog_welfare',
    mandatory: true,
    description:
      '330D/500D breathable cordura and stretch velcro booties to shield dog paws from abrasive trail ice, snowballs, and splits.',
  },
  {
    id: 'dual-claw-snow-hook',
    name: 'Dual-Claw Welded Steel Snow Hook & Bungee Tether',
    category: 'sled_anchors',
    mandatory: true,
    description:
      'High-tensile steel snow hook that bites deep into packed snow and river ice to secure the eager dog team during halts.',
  },
  {
    id: 'aircraft-cable-gangline',
    name: 'Vinyl-Coated Aircraft Cable Gangline & Tuglines',
    category: 'rigging_harness',
    mandatory: true,
    description:
      'Internal 3/16" galvanized steel cable with braided polyethylene cover preventing chewed lines and runaway teams.',
  },
  {
    id: 'arctic-cooker-melt-pot',
    name: '5-Gallon Multi-Fuel Dog Cooker & Ladle (Melt Pot)',
    category: 'feeding_cooker',
    mandatory: true,
    description:
      'High-BTU camp cooker to rapidly melt clean snow and prepare warm, high-fat meat broth mash for canine hydration.',
  },
  {
    id: 'high-fat-canine-rations',
    name: 'High-Calorie Canine Trail Rations (Meat Broth & Kibble)',
    category: 'nutrition',
    mandatory: true,
    description:
      '32% protein / 20% fat nutrient-dense frozen beef/salmon tallow slabs formulated for 10,000+ kcal daily burn.',
  },
  {
    id: 'musher-subzero-bivy-parka',
    name: '-60°F Expedition Down Anorak Parka & Beaver Mittens',
    category: 'musher_survival',
    mandatory: true,
    description:
      'Deep tunnel fur ruff parka, heavy snow bibs, vapor barrier felt mukluks, and tethered beaver mittens to avoid frostbite.',
  },
];

export function getDogsledRoutes(difficulty?: TrailDifficulty): DogsledRoute[] {
  if (!difficulty) {
    return [...DOGSLED_ROUTES];
  }
  return DOGSLED_ROUTES.filter((r) => r.difficulty === difficulty);
}

export function getDogsledRouteById(id: string): DogsledRoute | undefined {
  return DOGSLED_ROUTES.find((r) => r.id === id);
}

export function getDogsledGear(): MushingGearItem[] {
  return [...MUSHING_GEAR];
}

export function calculateMushingPacing(query: MushingPacingQuery): MushingPacingResult {
  const route = getDogsledRouteById(query.routeId);
  const routeTitle = route?.title ?? 'Custom Wilderness Trail';

  // Base speed: 15 km/h
  const baseSpeed = 15.0;

  // Surface modifier
  const surfaceModifiers: Record<TrailSurfaceType, number> = {
    groomed_hardpack: 1.0,
    frozen_lake_hardpack: 1.0,
    river_ice_and_powder: 0.8,
    glare_ice_jumble: 0.75,
    windblown_tundra_sea_ice: 0.85,
  };
  const surfaceMod = surfaceModifiers[query.trailSurface] ?? 1.0;

  // Weight drag: dog capacity = teamDogCount * 25
  const dogCapacity = query.teamDogCount * 25;
  const weightMod =
    query.cargoWeightKg > dogCapacity
      ? Math.max(0.7, 1 - (query.cargoWeightKg - dogCapacity) / (dogCapacity * 2))
      : 1.0;

  // Temp modifier:
  // > 15 F: 0.85 (dogs warm up easily)
  // < -40 F: 0.90 (harsh cold)
  // else: 1.0
  let tempMod = 1.0;
  if (query.ambientTempF > 15) {
    tempMod = 0.85;
  } else if (query.ambientTempF < -40) {
    tempMod = 0.9;
  }

  // Effective speed & daily distance
  const effectiveSpeedKmh = Math.round(baseSpeed * surfaceMod * weightMod * tempMod * 10) / 10;
  const dailyDistanceKm = Math.round(effectiveSpeedKmh * query.dailyRunHours * 10) / 10;

  // Caloric needs
  const coldSupplement = query.ambientTempF < 0 ? Math.abs(query.ambientTempF) * 35 : 0;
  const dogCaloriesPerDay = Math.round(2500 + query.dailyRunHours * 750 + coldSupplement);
  const teamTotalCaloriesPerDay = dogCaloriesPerDay * query.teamDogCount;

  // Hydration
  const totalMeltWaterLiters = Math.round(query.teamDogCount * 4.0 * 10) / 10;

  // Rest hours
  const minRestRatio = route?.minRestRatio ?? 1.0;
  const recommendedRestHours = Math.round(query.dailyRunHours * minRestRatio * 10) / 10;

  // Booties
  const requiredBootieCount = query.teamDogCount * 16;

  // Safety status
  let safetyStatus: 'optimal' | 'caution' | 'critical_hazard' = 'optimal';
  let trailAdvisory =
    'OPTIMAL CONDITIONS: Excellent mushing weather and balanced sled weight. Dog team can maintain steady pacing with standard rest, hydration, and trail snack intervals.';

  if (
    query.ambientTempF < -45 ||
    query.ambientTempF > 25 ||
    query.cargoWeightKg > dogCapacity * 1.5
  ) {
    safetyStatus = 'critical_hazard';
    if (query.ambientTempF > 25) {
      trailAdvisory =
        'CRITICAL HAZARD: Ambient temperature is above 25°F. Sled dogs produce intense metabolic heat and cannot sweat; running in these temperatures presents severe hyperthermia, heat stroke, and collapse risk. Suspend heavy daytime runs.';
    } else if (query.ambientTempF < -45) {
      trailAdvisory =
        'CRITICAL HAZARD: Extreme arctic deep freeze below -45°F. Severe risk of canine respiratory lung frostbite, corneal freeze, and exposed skin necrosis. Bivouac in insulated shelters and use fleece wind-skirts.';
    } else {
      trailAdvisory =
        'CRITICAL HAZARD: Sled cargo weight severely exceeds safe working capacity (>150% maximum limit). Severe risk of canine musculoskeletal strain, wrist injuries, and sled tip-overs.';
    }
  } else if (
    query.ambientTempF < -25 ||
    query.trailSurface === 'glare_ice_jumble' ||
    query.dailyRunHours > 10
  ) {
    safetyStatus = 'caution';
    if (query.ambientTempF < -25) {
      trailAdvisory =
        'CAUTION: Subzero temperatures below -25°F require frequent paw wrist checks, thermal coats for short-coated dogs, and frequent warm high-fat broth snacks.';
    } else if (query.trailSurface === 'glare_ice_jumble') {
      trailAdvisory =
        'CAUTION: Glare ice and river jumbles present acute slip hazards, line tangling, and paw laceration risks. Ensure steel snow hooks and dual carbide drag brakes are engaged.';
    } else {
      trailAdvisory =
        'CAUTION: Daily running time exceeds 10 hours. High risk of canine physical exhaustion and fatigue. Mandatory multi-hour rest stop required before continuing.';
    }
  }

  return {
    routeTitle,
    effectiveSpeedKmh,
    dailyDistanceKm,
    dogCaloriesPerDay,
    teamTotalCaloriesPerDay,
    totalMeltWaterLiters,
    recommendedRestHours,
    requiredBootieCount,
    safetyStatus,
    trailAdvisory,
  };
}
