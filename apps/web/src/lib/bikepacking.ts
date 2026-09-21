export type TerrainCategory =
  | 'gravel_fire_road'
  | 'rugged_singletrack'
  | 'mixed_pavement_gravel'
  | 'remote_two_track'
  | 'high_alpine_pass';

export type BikeType =
  | 'gravel_all_road'
  | 'hardtail_mtb'
  | 'full_suspension_plus'
  | 'rigid_adventure';

export interface BikepackingRoute {
  id: string;
  name: string;
  region: string;
  distanceMiles: number;
  elevationGainFt: number;
  terrainCategory: TerrainCategory;
  recommendedTireWidthMm: number;
  recommendedBikeType: BikeType;
  typicalDays: number;
  resupplyIntervalMiles: number;
  waterCarryLiters: number;
  description: string;
  highlights: string[];
}

export interface BikepackingRigQuery {
  routeId: string;
  tripDurationDays: number;
  shelterType: 'ultralight_bivy' | 'bikepacking_tent' | 'tarp_setup';
  riderWeightLbs: number;
}

export interface BikepackingRigResult {
  routeName: string;
  recommendedTirePressurePsi: { front: number; rear: number };
  totalGearWeightLbs: number;
  dailyCalorieDemandKcal: number;
  bagCapacityLitres: {
    frameBag: number;
    seatPack: number;
    handlebarRoll: number;
    total: number;
  };
  dailyWaterDemandLiters: number;
  mechanicalSparesPriority: string[];
}

export interface BikepackingGearItem {
  id: string;
  name: string;
  category:
    | 'bike_bags'
    | 'repair_tools'
    | 'sleep_system'
    | 'hydration_fuel'
    | 'electronics';
  mandatory: boolean;
  purpose: string;
}

export const BIKEPACKING_ROUTES: BikepackingRoute[] = [
  {
    id: 'cross-washington-xwa',
    name: 'Cross-Washington Mountain Bike Route (XWA)',
    region: 'Cascade Mountains & Columbia Basin, WA',
    distanceMiles: 680,
    elevationGainFt: 34000,
    terrainCategory: 'mixed_pavement_gravel',
    recommendedTireWidthMm: 50,
    recommendedBikeType: 'gravel_all_road',
    typicalDays: 7,
    resupplyIntervalMiles: 65,
    waterCarryLiters: 3.5,
    description:
      'A strenuous cross-state traverse linking the Olympic coast, Cascade mountain passes, and Columbia Basin rail-corridors over tarmac, gravel, and unpaved rights-of-way.',
    highlights: [
      'Snoqualmie Tunnel passage',
      'Palouse to Cascades rail trail',
      'Columbia River basalt canyon',
      'Eastern Washington gravel ridges',
    ],
  },
  {
    id: 'oregon-outback',
    name: 'Oregon Outback Gravel Epic',
    region: 'Central Oregon High Desert, OR',
    distanceMiles: 364,
    elevationGainFt: 14500,
    terrainCategory: 'gravel_fire_road',
    recommendedTireWidthMm: 45,
    recommendedBikeType: 'gravel_all_road',
    typicalDays: 4,
    resupplyIntervalMiles: 85,
    waterCarryLiters: 4.0,
    description:
      'Legendary south-to-north gravel odyssey spanning remote red cinder volcanic roads, pine forest double-track, and sagebrush high-desert plateaus.',
    highlights: [
      'Fort Rock volcanic caldera',
      'Ochoco National Forest single/double-track',
      'Prineville Reservoir ascent',
      'Remote desert canyon roads',
    ],
  },
  {
    id: 'great-divide-montana',
    name: 'Great Divide Mountain Bike Route - Montana Passes',
    region: 'Continental Divide, MT',
    distanceMiles: 410,
    elevationGainFt: 28000,
    terrainCategory: 'remote_two_track',
    recommendedTireWidthMm: 55,
    recommendedBikeType: 'rigid_adventure',
    typicalDays: 5,
    resupplyIntervalMiles: 75,
    waterCarryLiters: 3.0,
    description:
      'The crown jewel northern segment of the Great Divide, featuring jagged pass climbs, remote national forest two-track, and backcountry grizzly bear corridors.',
    highlights: [
      'Whitefish Divide mountain pass',
      'Seeley-Swan wilderness valley',
      'Richmond Peak remote double-track',
      'Continental Divide spine crossings',
    ],
  },
  {
    id: 'olympic-adventure-trail-loop',
    name: 'Olympic Discovery & Adventure Singletrack',
    region: 'Olympic Peninsula, WA',
    distanceMiles: 135,
    elevationGainFt: 9500,
    terrainCategory: 'rugged_singletrack',
    recommendedTireWidthMm: 60,
    recommendedBikeType: 'hardtail_mtb',
    typicalDays: 2,
    resupplyIntervalMiles: 40,
    waterCarryLiters: 2.5,
    description:
      'Lush coastal rainforest loop featuring purpose-built bench-cut singletrack, flowy descents, and views over Lake Crescent in the foothills of Olympic National Park.',
    highlights: [
      'Olympic Adventure Trail singletrack',
      'Lake Crescent glacial shoreline',
      'Spruce Railroad historic tunnel',
      'Elwha River canyon suspension bridge',
    ],
  },
  {
    id: 'cascade-hut-to-hut-gravel',
    name: 'Cascade High Alpine Fire Road Traverse',
    region: 'Central Cascades, WA/OR',
    distanceMiles: 220,
    elevationGainFt: 18000,
    terrainCategory: 'high_alpine_pass',
    recommendedTireWidthMm: 55,
    recommendedBikeType: 'rigid_adventure',
    typicalDays: 3,
    resupplyIntervalMiles: 60,
    waterCarryLiters: 3.0,
    description:
      'Rugged volcanic backcountry traverse tracing USFS fire roads and primitive subalpine tracks between Mount Hood and Mount Adams.',
    highlights: [
      'Subalpine volcanic vistas',
      'Old lava bed pass crossings',
      'Remote backcountry shelter huts',
      'Fast gravel descent descents',
    ],
  },
];

export const MANDATORY_GEAR_CHECKLIST: BikepackingGearItem[] = [
  {
    id: 'multi-tool',
    name: 'Multi-tool with integrated chain breaker and tubeless valve core tool',
    category: 'repair_tools',
    mandatory: true,
    purpose: 'Emergency cockpit adjustment, spoke tensioning, drivetrain chain repair, and valve core maintenance.',
  },
  {
    id: 'tubeless-plugs',
    name: 'Tubeless plug puncture kit (bacon strips) + tyre boot patches',
    category: 'repair_tools',
    mandatory: true,
    purpose: 'Rapid trailside puncture sealing and emergency sidewall casing rip protection.',
  },
  {
    id: 'mini-pump-co2',
    name: 'High-volume frame mini pump + CO2 inflator with cartridges',
    category: 'repair_tools',
    mandatory: true,
    purpose: 'Reliable high-volume tire reinflation and emergency tubeless bead re-seating on remote trails.',
  },
  {
    id: 'derailleur-hanger-link',
    name: 'Spare derailleur hanger & speed-matched quick-link master links',
    category: 'repair_tools',
    mandatory: true,
    purpose: 'Critical drivetrain recovery in the event of rock strikes, bent hangers, or broken chains.',
  },
  {
    id: 'waterproof-bag-system',
    name: 'Waterproof handlebar roll & seat pack harness system',
    category: 'bike_bags',
    mandatory: true,
    purpose: 'Submersion-proof storage for sleep system and spare apparel with stable handling over rough terrain.',
  },
  {
    id: 'gravity-water-filter',
    name: 'Ultralight gravity water filtration bag / fast-flow squeeze filter',
    category: 'hydration_fuel',
    mandatory: true,
    purpose: 'Safe microbial water purification from streams, alpine seeps, and wilderness lakes.',
  },
];

export function getBikepackingRoutes(terrain?: TerrainCategory): BikepackingRoute[] {
  if (!terrain) {
    return BIKEPACKING_ROUTES;
  }
  return BIKEPACKING_ROUTES.filter((route) => route.terrainCategory === terrain);
}

export function getBikepackingRouteById(id: string): BikepackingRoute | undefined {
  return BIKEPACKING_ROUTES.find((route) => route.id === id);
}

export function calculateBikepackingRig(query: BikepackingRigQuery): BikepackingRigResult {
  const route = getBikepackingRouteById(query.routeId) || BIKEPACKING_ROUTES[0];
  const tireWidth = route.recommendedTireWidthMm;

  // Realistic tire pressure calculation:
  // Baseline pressure at 160 lbs: 70 - (tireWidth * 0.8)
  // Weight adjustment: (riderWeightLbs - 160) * 0.12
  const weightDelta = (query.riderWeightLbs - 160) * 0.12;
  const rearPsi = Math.max(18, Math.round(70 - tireWidth * 0.8 + weightDelta));
  const frontPsi = Math.max(16, Math.round(rearPsi * 0.9));

  // Bag capacity calculation:
  // Frame bag scales slightly with trip duration (6L to 12L)
  const frameBag = Math.min(12, 6 + Math.round(query.tripDurationDays * 0.6));
  // Seat pack scales with trip duration (8L to 16L)
  const seatPack = Math.min(16, 8 + Math.round(query.tripDurationDays * 0.8));
  // Handlebar roll scales with shelter bulk
  const handlebarRollMap = {
    ultralight_bivy: 9,
    tarp_setup: 11,
    bikepacking_tent: 14,
  };
  const handlebarRoll = handlebarRollMap[query.shelterType] ?? 12;
  const total = frameBag + seatPack + handlebarRoll;

  // Total gear weight (lbs):
  const shelterWeightMap = {
    ultralight_bivy: 1.8,
    tarp_setup: 2.5,
    bikepacking_tent: 4.2,
  };
  const baseGearWeight = 11.5; // harness, tools, electronics, cook kit, first aid
  const clothesAndSleepWeight = 5.0;
  const foodPerDay = 1.75;
  const foodWeight = Math.min(query.tripDurationDays, 5) * foodPerDay;
  const totalGearWeightLbs =
    Math.round(
      (baseGearWeight +
        shelterWeightMap[query.shelterType] +
        clothesAndSleepWeight +
        foodWeight) *
        10
    ) / 10;

  // Daily calorie burn demand:
  // Base 2200 kcal + 25 kcal/mile + 0.15 kcal/ft elevation gain
  const dailyMiles = route.distanceMiles / route.typicalDays;
  const dailyVert = route.elevationGainFt / route.typicalDays;
  const dailyCalorieDemandKcal = Math.round(
    2200 + dailyMiles * 25 + dailyVert * 0.15
  );

  // Daily hydration demand:
  const dailyWaterDemandLiters = route.waterCarryLiters;

  // Mechanical spares recommendations based on terrain:
  const mechanicalSparesPriority: string[] = [
    'Tubeless tire plug kit (bacon strips) & brass insertion tool',
    'Spare derailleur hanger matching frame dropout spec',
    'Speed-matched master quick-links (11/12-spd)',
    'High-volume hand pump & valve core remover tool',
    'Pre-glued tyre casing emergency boot patches',
  ];

  if (route.terrainCategory === 'rugged_singletrack' || route.terrainCategory === 'high_alpine_pass') {
    mechanicalSparesPriority.push('Replacement disc brake pads & rotor truing fork');
  }

  return {
    routeName: route.name,
    recommendedTirePressurePsi: {
      front: frontPsi,
      rear: rearPsi,
    },
    totalGearWeightLbs,
    dailyCalorieDemandKcal,
    bagCapacityLitres: {
      frameBag,
      seatPack,
      handlebarRoll,
      total,
    },
    dailyWaterDemandLiters,
    mechanicalSparesPriority,
  };
}

export function getBikepackingGear(): BikepackingGearItem[] {
  return MANDATORY_GEAR_CHECKLIST;
}
