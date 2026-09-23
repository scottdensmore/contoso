export type AidRating = 'C1' | 'C2' | 'C3' | 'A2+' | 'C2F';
export type HaulSystemType = '1:1_direct' | '2:1_mechanical_advantage' | '3:1_z_rig';
export type WallAngle = 'slab' | 'vertical' | 'overhanging' | 'roof';

export interface BigWallRoute {
  id: string;
  name: string;
  location: string;
  grade: string;
  aidRating: AidRating;
  pitches: number;
  heightMeters: number;
  recommendedDays: number;
  typicalPigWeightKg: number;
  description: string;
  highlights: string[];
}

export interface HaulCalculationQuery {
  routeId: string;
  pigWeightKg: number; // 30 to 180 kg
  haulSystem: HaulSystemType; // 1:1, 2:1, 3:1
  wallAngle: WallAngle; // slab, vertical, overhanging, roof
  climberWeightKg: number; // 50 to 110 kg
}

export interface HaulCalculationResult {
  routeName: string;
  effectivePullForceKg: number;
  mechanicalAdvantageRatio: number;
  frictionCoefficient: number;
  counterweightSufficient: boolean;
  haulEffortLevel: 'low' | 'moderate' | 'strenuous' | 'extreme_two_person';
  recommendedTechnique: string;
  safetyWarning?: string;
}

export interface BigWallGearItem {
  id: string;
  name: string;
  category: 'portaledge' | 'hauling' | 'aid_ladders' | 'protection' | 'haul_bag' | 'waste_ethics';
  mandatory: boolean;
  description: string;
}

export const BIG_WALL_ROUTES: BigWallRoute[] = [
  {
    id: 'el-capitan-nose',
    name: 'The Nose — El Capitan',
    location: 'Yosemite Valley, CA',
    grade: 'Grade VI 5.9 C2',
    aidRating: 'C2',
    pitches: 31,
    heightMeters: 1000,
    recommendedDays: 4,
    typicalPigWeightKg: 85,
    description: "The world's most famous big wall line featuring Boot Flake, the King Swing, and the Great Roof.",
    highlights: ['King Swing pendulum', 'Great Roof thin seam aid', 'Camp 4 and Camp 6 natural bivvies'],
  },
  {
    id: 'half-dome-regular-northwest',
    name: 'Regular Northwest Face — Half Dome',
    location: 'Yosemite Valley, CA',
    grade: 'Grade VI 5.9 C1',
    aidRating: 'C1',
    pitches: 23,
    heightMeters: 670,
    recommendedDays: 2,
    typicalPigWeightKg: 55,
    description: 'Classic sheer granite face requiring clean aid placements, chimney squeezing, and portaledge or bivy ledge camping.',
    highlights: ['Robbins Traverse', 'Zig-Zags clean aid pitches', 'Thank God Ledge'],
  },
  {
    id: 'fisher-towers-titan',
    name: 'The Titan — Finger of Fate',
    location: 'Moab, UT',
    grade: 'Grade V 5.8 A2+',
    aidRating: 'A2+',
    pitches: 4,
    heightMeters: 275,
    recommendedDays: 2,
    typicalPigWeightKg: 45,
    description: 'The largest freestanding sandstone tower in the US, known for bizarre mud curtains, soft sandstone, and serious nailing aid.',
    highlights: ['Mud curtain aid placements', 'Fragile sandstone anchor rigging', 'Free-hanging summit portaledge bivouac'],
  },
  {
    id: 'zion-prodigal-son',
    name: "Prodigal Son — Angel's Landing",
    location: 'Zion National Park, UT',
    grade: 'Grade V 5.8 C2',
    aidRating: 'C2',
    pitches: 8,
    heightMeters: 360,
    recommendedDays: 2,
    typicalPigWeightKg: 50,
    description: 'Spectacular desert big wall rising above the Virgin River with steep cracks, aid seams, and sheer sandstone exposures.',
    highlights: ['Virgin River canyon exposure', 'Sandstone hook moves', "Bivouac hanging above Angel's Landing"],
  },
  {
    id: 'leaning-tower-west-face',
    name: 'West Face — Leaning Tower',
    location: 'Yosemite Valley, CA',
    grade: 'Grade V 5.7 C2F',
    aidRating: 'C2F',
    pitches: 11,
    heightMeters: 365,
    recommendedDays: 2,
    typicalPigWeightKg: 60,
    description: 'One of the steepest rock faces in North America, continuously overhanging 110 degrees for incredible free-hanging hauls and portaledge camping.',
    highlights: ['Continuously overhanging wall', 'Completely free-hanging haul line', 'Awahnee Ledge portaledge setup'],
  },
];

export const BIG_WALL_GEAR: BigWallGearItem[] = [
  {
    id: 'full-portaledge-storm-fly',
    name: 'Heavy-Duty Expedition Portaledge & Sealed Storm Fly',
    category: 'portaledge',
    mandatory: true,
    description: 'Extruded aircraft aluminum frame with tensioned ballistic bed, master suspension fin, and taped storm fly with integrated air vents.',
  },
  {
    id: 'progress-capture-hauling-pulley',
    name: 'Progress-Capture Hauling Pulley (Pro Traxion Rig)',
    category: 'hauling',
    mandatory: true,
    description: 'High-efficiency 38mm toothed cam capture pulley rated for 2.5kN working load in 2:1 or 3:1 Z-pulley mechanical advantage hauling systems.',
  },
  {
    id: 'adjustable-daisy-chains-etriers',
    name: 'Pair of 8-Step Ladder Etriers & Adjustable Daisies',
    category: 'aid_ladders',
    mandatory: true,
    description: 'Reinforced 8-step nylon stirrups with spreader bars paired with rapid buckle-adjust positioning lanyards for bounce-testing placements.',
  },
  {
    id: 'beak-and-cam-hook-set',
    name: 'Clean Aid Cam Hook Rack & Birdbeak Piton Set',
    category: 'protection',
    mandatory: true,
    description: 'Heat-treated steel birdbeaks and wide/narrow cam hooks for fragile expanding flake progression without damaging the rock.',
  },
  {
    id: 'haul-bag-pig-dry-containment',
    name: '145L Durathane Hauling Pig & Docking Straps',
    category: 'haul_bag',
    mandatory: true,
    description: 'Puncture-proof welded polyurethane haul bag with tuck-away suspension harness, drain grommets, and dedicated anchor docking line.',
  },
  {
    id: 'aluminum-waste-haul-tube',
    name: 'Threaded PVC/Aluminum Big Wall Waste Tube & Wag Bags',
    category: 'waste_ethics',
    mandatory: true,
    description: 'Airtight sealable waste containment tube with haul clip loops and biodegradable wag bags to ensure strict zero-trace cliff ethics.',
  },
];

export function getBigWallRoutes(aidRating?: AidRating): BigWallRoute[] {
  if (!aidRating) {
    return BIG_WALL_ROUTES;
  }
  return BIG_WALL_ROUTES.filter((route) => route.aidRating === aidRating);
}

export function getBigWallRouteById(id: string): BigWallRoute | undefined {
  return BIG_WALL_ROUTES.find((route) => route.id === id);
}

export function getBigWallGear(): BigWallGearItem[] {
  return BIG_WALL_GEAR;
}

const FRICTION_COEFFICIENTS: Record<WallAngle, number> = {
  slab: 0.35,
  vertical: 0.15,
  overhanging: 0.02,
  roof: 0.0,
};

const HAUL_SYSTEM_CONFIG: Record<
  HaulSystemType,
  { ratio: number; effectiveMA: number }
> = {
  '1:1_direct': { ratio: 1.0, effectiveMA: 0.9 },
  '2:1_mechanical_advantage': { ratio: 2.0, effectiveMA: 1.7 },
  '3:1_z_rig': { ratio: 3.0, effectiveMA: 2.4 },
};

function getRecommendedTechnique(
  effortLevel: 'low' | 'moderate' | 'strenuous' | 'extreme_two_person'
): string {
  switch (effortLevel) {
    case 'low':
      return 'Direct 1:1 bodyweight squat haul or single-line pull with progress-capture pulley.';
    case 'moderate':
      return 'Counterweight space hauling with foot-loop ascender and bodyweight drops.';
    case 'strenuous':
      return '2:1 mechanical advantage assisted hauling or 3:1 Z-rig with ascender foot-pump.';
    case 'extreme_two_person':
      return 'Two-person synchronized space-hauling or 3:1 compound mechanical advantage system with mechanical ascenders.';
  }
}

export function calculateHaulEffort(query: HaulCalculationQuery): HaulCalculationResult {
  const route = getBigWallRouteById(query.routeId);
  if (!route) {
    throw new Error(`Big wall route with id "${query.routeId}" not found.`);
  }

  const frictionCoefficient = FRICTION_COEFFICIENTS[query.wallAngle] ?? 0.15;
  const systemConfig = HAUL_SYSTEM_CONFIG[query.haulSystem] ?? { ratio: 1.0, effectiveMA: 0.9 };
  const effectiveMA = systemConfig.effectiveMA;
  const mechanicalAdvantageRatio = systemConfig.ratio;

  const effectivePullForceKg =
    Math.round(((query.pigWeightKg * (1 + frictionCoefficient)) / effectiveMA) * 10) / 10;
  const counterweightSufficient = query.climberWeightKg >= effectivePullForceKg;

  let haulEffortLevel: 'low' | 'moderate' | 'strenuous' | 'extreme_two_person' = 'extreme_two_person';
  if (effectivePullForceKg < 35) {
    haulEffortLevel = 'low';
  } else if (effectivePullForceKg < 60) {
    haulEffortLevel = 'moderate';
  } else if (effectivePullForceKg < 90) {
    haulEffortLevel = 'strenuous';
  } else {
    haulEffortLevel = 'extreme_two_person';
  }

  const recommendedTechnique = getRecommendedTechnique(haulEffortLevel);

  const warnings: string[] = [];
  if (!counterweightSufficient) {
    warnings.push(
      'Effective pull force exceeds climber bodyweight! 2:1 or 3:1 mechanical advantage or 2-person space-hauling counterweight required to prevent haul-line stall.'
    );
  }
  if (query.wallAngle === 'slab') {
    warnings.push(
      'Heavy bag dragging on slab generates extreme abrasion; use haul bag swivel and wear-guard sleeves.'
    );
  }
  if (query.pigWeightKg > 100) {
    warnings.push(
      'Expedition double-pig load: separate into two hauls or use 3:1 Z-pulley with mechanical ascender foot-pumping.'
    );
  }

  const safetyWarning = warnings.length > 0 ? warnings.join(' ') : undefined;

  return {
    routeName: route.name,
    effectivePullForceKg,
    mechanicalAdvantageRatio,
    frictionCoefficient,
    counterweightSufficient,
    haulEffortLevel,
    recommendedTechnique,
    safetyWarning,
  };
}
