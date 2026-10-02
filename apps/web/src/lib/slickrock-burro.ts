export type CanyonTerrain =
  | 'slickrock_dry_wash'
  | 'deep_alluvial_sand'
  | 'rugged_cobble_wash'
  | 'limestone_scree_bench';

export type WaterAvailability =
  | 'sparse_alkali_seeps'
  | 'intermittent_tinaja_pockets'
  | 'spring_fed_potholes'
  | 'seasonal_desert_tinajas'
  | 'perennial_river_corridor';

export type HoofProtection =
  | 'barefoot_conditioned'
  | 'neoprene_trail_boots'
  | 'steel_shod_cleats';

export type BurroTriageStatus =
  | 'optimal_conditioned_trek'
  | 'caution_heat_hydration_strain'
  | 'critical_overload_dehydration_hazard';

export interface SlickrockBurroRoute {
  id: string;
  title: string;
  region: string;
  range: string;
  trailDistanceKm: number;
  canyonTerrain: CanyonTerrain;
  waterAvailability: WaterAvailability;
  maxAmbientTempC: number;
  description: string;
  highlights: string[];
}

export interface BurroDynamicsQuery {
  routeId: string;
  terrain: CanyonTerrain;                  // default 'slickrock_dry_wash'
  waterSource: WaterAvailability;           // default 'intermittent_tinaja_pockets'
  hoofProtection: HoofProtection;           // default 'neoprene_trail_boots'
  burroCount: number;                       // 1 to 4, default 2
  ambientPeakTempC: number;                 // 20 to 45 C, default 34
  dailyTrekKm: number;                      // 10 to 35 km, default 18
  cargoWeightKgPerBurro: number;            // 20 to 65 kg, default 40
  pannierWeightDeltaKg: number;             // 0.0 to 10.0 kg, default 1.2
}

export interface BurroDynamicsResult {
  routeTitle: string;
  dailyWaterRequirementLiters: number;      // Liters per burro/day
  hoofSlickrockSlipRiskIndex: number;       // 0.00 to 1.00
  pannierBalanceScore: number;              // 0.0 to 100.0
  triageStatus: BurroTriageStatus;
  packBalanceAdvisory: string;
  desertTrekWaterProtocol: string;
}

export interface BurroGearItem {
  id: string;
  name: string;
  category: 'saddle' | 'storage' | 'hydration' | 'hoofcare' | 'restraint';
  mandatory: boolean;
  description: string;
}

export const SLICKROCK_BURRO_ROUTES: SlickrockBurroRoute[] = [
  {
    id: 'san-rafael-swell-chute-canyon',
    title: 'San Rafael Swell Chute Canyon & Muddy Creek Traverse',
    region: 'Emery County, Utah, USA',
    range: 'San Rafael Swell',
    trailDistanceKm: 42,
    canyonTerrain: 'slickrock_dry_wash',
    waterAvailability: 'intermittent_tinaja_pockets',
    maxAmbientTempC: 38,
    description:
      'Arid sandstone wilderness canyon traverse requiring careful pack-burro navigation across smooth slickrock benches and gravel dry washes.',
    highlights: [
      'Navigating narrow sandstone pour-offs with pack animals',
      'Slickrock friction hoof traction management',
      'Remote desert tinaja water scouting',
    ],
  },
  {
    id: 'grand-gulch-cedar-mesa-canyon',
    title: 'Grand Gulch Primitive Desert Wash Packing Route',
    region: 'San Juan County, Utah, USA',
    range: 'Cedar Mesa / Bears Ears',
    trailDistanceKm: 58,
    canyonTerrain: 'deep_alluvial_sand',
    waterAvailability: 'spring_fed_potholes',
    maxAmbientTempC: 34,
    description:
      'Deep winding alluvial canyon cut into Cedar Mesa sandstone with ancestral Puebloan sites and deep sand wash footing.',
    highlights: [
      'Deep alluvial sand pacing to prevent equine tendon strain',
      'Natural spring pothole filtration stops',
      'Arduous pack saddle load balance monitoring',
    ],
  },
  {
    id: 'death-valley-cottonwood-marble',
    title: 'Death Valley Cottonwood-Marble Desert Canyons',
    region: 'Inyo County, California, USA',
    range: 'Cottonwood Mountains / Death Valley',
    trailDistanceKm: 51,
    canyonTerrain: 'rugged_cobble_wash',
    waterAvailability: 'sparse_alkali_seeps',
    maxAmbientTempC: 44,
    description:
      'Extreme hyper-arid desert circuit linking dry polished marble narrows and sun-scorched gravel washes.',
    highlights: [
      'Extreme hyper-arid hydration logistics (40L/burro/day)',
      'Polished marble canyon friction descents',
      'High-temperature heat exhaustion mitigation',
    ],
  },
  {
    id: 'escalante-river-baker-canyon',
    title: 'Escalante River & Baker Canyon Slickrock Benches',
    region: 'Garfield County, Utah, USA',
    range: 'Grand Staircase-Escalante',
    trailDistanceKm: 36,
    canyonTerrain: 'slickrock_dry_wash',
    waterAvailability: 'perennial_river_corridor',
    maxAmbientTempC: 36,
    description:
      'Expedition through towering Navajo sandstone cliffs alternating between river crossings and dry slickrock fin climbs.',
    highlights: [
      'Navajo sandstone slickrock friction scrambling',
      'Frequent muddy river crossings with loaded panniers',
      'Dense willow bench bypass trails',
    ],
  },
  {
    id: 'big-bend-mesa-de-anguila',
    title: 'Big Bend Mesa de Anguila Canyon & Rim Pass',
    region: 'Brewster County, Texas, USA',
    range: 'Chihuahuan Desert / Rio Grande',
    trailDistanceKm: 48,
    canyonTerrain: 'limestone_scree_bench',
    waterAvailability: 'seasonal_desert_tinajas',
    maxAmbientTempC: 41,
    description:
      'Rugged Chihuahuan limestone scarp and sheer canyon rim route requiring surefooted burro packing.',
    highlights: [
      'Sharp limestone scree hoof protection',
      'Exposed rimrock ledge navigation with pack frames',
      'Desert tinaja water conservation',
    ],
  },
];

export const BURRO_GEAR_CHECKLIST: BurroGearItem[] = [
  {
    id: 'sawbuck-pack-saddle-rig',
    name: 'Hand-Crafted Ash Wood Sawbuck Pack Saddle with Heavy-Duty Cinches & Britchen',
    category: 'saddle',
    mandatory: true,
    description:
      'Traditional dual-crossbuck pack frame with breeching and breast collar to prevent load shift on steep slickrock passes',
  },
  {
    id: 'heavy-duty-canvas-panniers',
    name: 'Reinforced 24oz Duck Canvas Pack Panniers with Leather Corner Guards',
    category: 'storage',
    mandatory: true,
    description:
      'Hard-wearing pannier boxes for carrying balanced gear and food through abrasive sandstone narrows',
  },
  {
    id: 'collapsible-desert-water-bladder',
    name: 'Food-Grade 20L TPU Heavy-Duty Equine Transport Water Bladder',
    category: 'hydration',
    mandatory: true,
    description:
      'Puncture-resistant flexible bladders designed to ride symmetrically in panniers across dry stretches',
  },
  {
    id: 'protective-equine-trail-boots',
    name: 'Kevlar-Reinforced All-Terrain Hoof Boots with Aggressive Tread',
    category: 'hoofcare',
    mandatory: true,
    description:
      'Provides impact damping on jagged limestone and prevents excessive wear on abrasive slickrock',
  },
  {
    id: 'hoof-pick-and-rasp-kit',
    name: 'Stainless Steel Folding Hoof Pick & Multi-Cut Farrier Rasp',
    category: 'hoofcare',
    mandatory: true,
    description:
      'Essential field maintenance tools for removing jammed sandstone pebbles and dressing hoof cracks',
  },
  {
    id: 'desert-night-hobble-tether',
    name: 'Padded Sheepskin-Lined Leather Leg Hobbles with High-Visibility Lead Rope',
    category: 'restraint',
    mandatory: true,
    description:
      'Prevents pack burros from wandering into canyon wash hazards while allowing forage grazing at camp',
  },
];

const TERRAIN_SLIP_FACTORS: Record<CanyonTerrain, number> = {
  slickrock_dry_wash: 0.35,
  deep_alluvial_sand: 0.15,
  rugged_cobble_wash: 0.28,
  limestone_scree_bench: 0.40,
};

const HOOF_MODIFIERS: Record<HoofProtection, number> = {
  barefoot_conditioned: 1.0,
  neoprene_trail_boots: 0.65,
  steel_shod_cleats: 1.45,
};

export function getSlickrockBurroRoutes(terrain?: CanyonTerrain): SlickrockBurroRoute[] {
  if (!terrain) {
    return SLICKROCK_BURRO_ROUTES;
  }
  return SLICKROCK_BURRO_ROUTES.filter((route) => route.canyonTerrain === terrain);
}

export function getSlickrockBurroRouteById(id: string): SlickrockBurroRoute | undefined {
  return SLICKROCK_BURRO_ROUTES.find((route) => route.id === id);
}

export function calculateBurroDynamics(query: BurroDynamicsQuery): BurroDynamicsResult {
  const route = getSlickrockBurroRouteById(query.routeId);
  const routeTitle = route ? route.title : 'High-Desert Canyon Traverse';

  const baseWater =
    15.0 +
    Math.max(0, (query.ambientPeakTempC - 20.0) * 0.9) +
    query.dailyTrekKm * 0.45 +
    query.cargoWeightKgPerBurro * 0.15;
  const dailyWaterRequirementLiters = Math.round(baseWater * 10) / 10;

  const terrainSlipFactor = TERRAIN_SLIP_FACTORS[query.terrain] ?? 0.35;
  const hoofMod = HOOF_MODIFIERS[query.hoofProtection] ?? 0.65;
  const rawSlip = terrainSlipFactor * hoofMod + (query.cargoWeightKgPerBurro / 65.0) * 0.25;
  const hoofSlickrockSlipRiskIndex = Math.min(
    0.99,
    Math.max(0.08, Math.round(rawSlip * 100) / 100),
  );

  const pannierBalanceScore = Math.max(
    0.0,
    Math.round((100.0 - query.pannierWeightDeltaKg * 10.0) * 10) / 10,
  );

  let triageStatus: BurroTriageStatus;
  if (
    dailyWaterRequirementLiters >= 35.0 ||
    query.ambientPeakTempC >= 40.0 ||
    query.cargoWeightKgPerBurro >= 55.0 ||
    pannierBalanceScore < 60.0
  ) {
    triageStatus = 'critical_overload_dehydration_hazard';
  } else if (
    dailyWaterRequirementLiters >= 25.0 ||
    hoofSlickrockSlipRiskIndex >= 0.50 ||
    pannierBalanceScore < 85.0
  ) {
    triageStatus = 'caution_heat_hydration_strain';
  } else {
    triageStatus = 'optimal_conditioned_trek';
  }

  let packBalanceAdvisory: string;
  if (pannierBalanceScore < 60.0) {
    packBalanceAdvisory = `CRITICAL IMBALANCE: Pannier weight differential of ${query.pannierWeightDeltaKg.toFixed(1)} kg exceeds safety limit. Severe load listing risks saddle rolling, spinal cinch lesions, and lethal slip hazard on slickrock benches. Re-distribute cargo immediately to achieve delta under 1.5 kg.`;
  } else if (pannierBalanceScore < 85.0) {
    packBalanceAdvisory = `CAUTION - LOAD ASYMMETRY: Pannier weight discrepancy of ${query.pannierWeightDeltaKg.toFixed(1)} kg detected. Shift water bladders or concentrated food packs lower into the lighter side to prevent sawbuck listing on narrow canyon ledges.`;
  } else {
    packBalanceAdvisory = `OPTIMAL COUNTERBALANCE: Left and right panniers are balanced within ${query.pannierWeightDeltaKg.toFixed(1)} kg. Load rests symmetrically on the ribcage, minimizing tree friction and ensuring stable footing on steep sandstone pour-offs.`;
  }

  let desertTrekWaterProtocol: string;
  if (query.waterSource === 'sparse_alkali_seeps') {
    desertTrekWaterProtocol = `ALKALI WARNING: Local canyon seeps contain toxic mineral salts and alkali concentrations. Prevent pack burros from drinking contaminated ground pools. Pack 100% of required potable water (${dailyWaterRequirementLiters} L/day per animal) in dual balanced bladders.`;
  } else if (dailyWaterRequirementLiters >= 35.0) {
    desertTrekWaterProtocol = `EXTREME HYDRATION DEMAND: High thermal strain and arduous mileage demand ${dailyWaterRequirementLiters} L/burro/day (total ${(dailyWaterRequirementLiters * query.burroCount).toFixed(1)} L/day for herd). Restrict movement to early morning and twilight wash hours. Pre-scout water caches at verified tinaja potholes.`;
  } else if (dailyWaterRequirementLiters >= 25.0) {
    desertTrekWaterProtocol = `ELEVATED HYDRATION DEMAND: Daily consumption estimated at ${dailyWaterRequirementLiters} L per burro. Hydrate pack stock at every available wash tinaja or spring pothole before offering dry forage. Check skin tenting and capillary refill during mid-day rest.`;
  } else {
    desertTrekWaterProtocol = `MODERATE HYDRATION PROTOCOL: Baseline water need is ${dailyWaterRequirementLiters} L/burro/day. Maintain regular watering intervals every 4 to 5 hours while traversing sandstone washes and shaded canyon benches.`;
  }

  return {
    routeTitle,
    dailyWaterRequirementLiters,
    hoofSlickrockSlipRiskIndex,
    pannierBalanceScore,
    triageStatus,
    packBalanceAdvisory,
    desertTrekWaterProtocol,
  };
}

export function getSlickrockBurroGearChecklist(): BurroGearItem[] {
  return BURRO_GEAR_CHECKLIST;
}
