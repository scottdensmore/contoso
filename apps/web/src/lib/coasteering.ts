export type CoasteeringGrade =
  | 'grade_1_sheltered_cove'
  | 'grade_2_moderate_coastal'
  | 'grade_3_advanced_swell'
  | 'grade_4_extreme_surge';

export type TideState = 'rising_flood' | 'slack_water' | 'falling_ebb';

export type JumpSafetyStatus =
  | 'safe_jump_approved'
  | 'caution_surge_timing'
  | 'critical_shallow_hazard'
  | 'extreme_surge_warning';

export interface CoasteeringRoute {
  id: string;
  title: string;
  region: string;
  distanceKm: number;
  typicalDurationHours: number;
  coasteeringGrade: CoasteeringGrade;
  maxJumpHeightM: number;
  seaCaveCount: number;
  waterTempF: number;
  tideWindow: string;
  minWaterDepthM: number;
  description: string;
  highlights: string[];
}

export interface JumpSafetyQuery {
  routeId: string;
  jumpHeightM: number;
  waterDepthM: number;
  swellHeightM: number;
  swellPeriodSeconds: number;
  tideState: TideState;
  waterAeratedWithFoam: boolean;
}

export interface JumpSafetyResult {
  routeTitle: string;
  coasteeringGrade: CoasteeringGrade;
  minRequiredDepthM: number;
  depthMarginM: number;
  safetyStatus: JumpSafetyStatus;
  aerationImpactNotice: string;
  surgeTimingAdvisory: string;
  bodyPositionGuide: string;
  exitRouteAdvisory: string;
}

export interface CoasteeringGearItem {
  id: string;
  name: string;
  category:
    | 'headwear'
    | 'thermal_protection'
    | 'flotation'
    | 'footwear'
    | 'protective_gear'
    | 'rescue_safety';
  mandatory: boolean;
  description: string;
}

export const COASTEERING_ROUTES: CoasteeringRoute[] = [
  {
    id: 'point-lobos-granite-coves',
    title: 'Point Lobos Granite Headlands Traverse',
    region: 'Point Lobos State Reserve, Carmel, CA',
    distanceKm: 2.8,
    typicalDurationHours: 3.0,
    coasteeringGrade: 'grade_2_moderate_coastal',
    maxJumpHeightM: 5.5,
    seaCaveCount: 2,
    waterTempF: 52,
    tideWindow: 'Mid tide slack',
    minWaterDepthM: 4.0,
    description:
      'Dramatic granitic headland traverse featuring turquoise ocean channels, kelp canopies, sea lion colonies, and scenic scramble ledges.',
    highlights: [
      'Piedras Blancas sea lion haulouts',
      'Crystalline blue-green kelp forest channels',
      'Whalers Cove protected swim exit',
    ],
  },
  {
    id: 'depoe-bay-spouting-horn-surge',
    title: 'Depoe Bay Basalt Cliffs & Spouting Horn',
    region: 'Central Oregon Coast, Depoe Bay, OR',
    distanceKm: 3.5,
    typicalDurationHours: 4.0,
    coasteeringGrade: 'grade_3_advanced_swell',
    maxJumpHeightM: 8.0,
    seaCaveCount: 3,
    waterTempF: 49,
    tideWindow: 'Low to rising',
    minWaterDepthM: 5.5,
    description:
      'Rugged basalt sea cliffs and high-energy Pacific surge channels featuring geyser-like blowholes and committing deep water leaps.',
    highlights: [
      'Active volcanic basalt blowholes',
      'Challenging surging sea chasm leap',
      'Deep water cave exploration',
    ],
  },
  {
    id: 'acadia-otter-cliffs-traverse',
    title: 'Acadia Otter Cliffs & Ocean Path Traverse',
    region: 'Mount Desert Island, Acadia NP, ME',
    distanceKm: 2.2,
    typicalDurationHours: 2.5,
    coasteeringGrade: 'grade_2_moderate_coastal',
    maxJumpHeightM: 6.0,
    seaCaveCount: 1,
    waterTempF: 54,
    tideWindow: 'Mid tide slack',
    minWaterDepthM: 4.5,
    description:
      'Pink granite sea cliff scrambles along the bold Maine Atlantic coastline with cold water tidal swims and sheltered cove exits.',
    highlights: [
      'Pink granite sea cliff traverses',
      'Dramatic Thunder Hole surge soundscape',
      'Sheltered cobble beach landing',
    ],
  },
  {
    id: 'la-jolla-coves-caves-traverse',
    title: 'La Jolla Ecological Reserve Sea Coves & Arches',
    region: 'La Jolla, San Diego County, CA',
    distanceKm: 2.0,
    typicalDurationHours: 2.0,
    coasteeringGrade: 'grade_1_sheltered_cove',
    maxJumpHeightM: 4.0,
    seaCaveCount: 4,
    waterTempF: 64,
    tideWindow: 'Any calm swell',
    minWaterDepthM: 3.5,
    description:
      'Sunlit sandstone cliffs and sheltered marine reserve sea arches with gentle swell, abundant marine life, and beginner-friendly jumps.',
    highlights: [
      "Clam's Cave vaulted sea arch swim-through",
      'Leopard shark nursery sandy shallows',
      'Sun-warmed sandstone ledge jumps',
    ],
  },
  {
    id: 'cape-flattery-pacific-surge',
    title: 'Cape Flattery Pacific Rim Sea Stacks',
    region: 'Makah Reservation, Clallam County, WA',
    distanceKm: 4.2,
    typicalDurationHours: 5.0,
    coasteeringGrade: 'grade_4_extreme_surge',
    maxJumpHeightM: 9.5,
    seaCaveCount: 5,
    waterTempF: 48,
    tideWindow: 'Neap low slack',
    minWaterDepthM: 6.5,
    description:
      'Exposed, tempestuous Pacific rim traverse with towering sea stacks, massive ocean swells, subterranean surge caves, and high jump commitments.',
    highlights: [
      'Northwesternmost point of contiguous US',
      'Pounding Pacific ocean swell arches',
      'Sea otter colonies and towering sea stacks',
    ],
  },
];

export const COASTEERING_GEAR: CoasteeringGearItem[] = [
  {
    id: 'high-impact-watersports-helmet',
    name: 'EN 1385 Certified Watersports Helmet with Ear Protection & Drainage Vents',
    category: 'headwear',
    mandatory: true,
    description:
      'Protects against direct head trauma on submerged rock shelves, barnacle faces, and cliff impact while draining water instantly upon entry.',
  },
  {
    id: 'reinforced-steamer-wetsuit',
    name: '5/4mm or 4/3mm Heavy-Duty Neoprene Steamer Wetsuit with Abrasion-Resistant Kevlar/Supratex Knees & Seat',
    category: 'thermal_protection',
    mandatory: true,
    description:
      'Essential cold water thermal barrier preventing hypothermia in 48-60°F Pacific/Atlantic waters while cushioning against abrasive barnacles and rocks.',
  },
  {
    id: 'high-buoyancy-coasteering-pfd',
    name: 'ISO 12402-5 / USCG Type III 50N+ High-Impact Buoyancy Aid with Quick-Release Rescue Harness',
    category: 'flotation',
    mandatory: true,
    description:
      'Guarantees rapid surface return in highly aerated white-water foam pools and features an integrated rescue tow tether.',
  },
  {
    id: 'sticky-rubber-water-boots',
    name: 'High-Traction Vibram/Stealth Sticky Rubber Canyoneering/Coasteering Boots with Ankle Support',
    category: 'footwear',
    mandatory: true,
    description:
      'Specialized sticky rubber compound outsole delivers maximum friction on wet algae, slick kelp, and slimy sea rocks.',
  },
  {
    id: 'neoprene-impact-gloves',
    name: 'Reinforced 2mm Pre-Curved Neoprene Gloves with Kevlar Palm Protection (Barnacle & Urchin Shield)',
    category: 'protective_gear',
    mandatory: true,
    description:
      'Guards palms and fingers from razor-sharp razor clams, encrusting barnacles, and sea urchin spines during scramble exits.',
  },
  {
    id: 'coasteering-throwline-whistle',
    name: '15m Floating Water Rescue Throwline in Waist Pouch with Pealess Marine Whistle',
    category: 'rescue_safety',
    mandatory: true,
    description:
      'Rapid deployment floating rescue line with pea-less SOLAS whistle audible over crashing surf and ocean surge.',
  },
];

export function getCoasteeringRoutes(grade?: CoasteeringGrade): CoasteeringRoute[] {
  if (!grade) {
    return COASTEERING_ROUTES;
  }
  return COASTEERING_ROUTES.filter((route) => route.coasteeringGrade === grade);
}

export function getCoasteeringRouteById(id: string): CoasteeringRoute | undefined {
  return COASTEERING_ROUTES.find((route) => route.id === id);
}

export function getCoasteeringGear(): CoasteeringGearItem[] {
  return COASTEERING_GEAR;
}

export function calculateJumpSafety(query: JumpSafetyQuery): JumpSafetyResult {
  const route = getCoasteeringRouteById(query.routeId);
  if (!route) {
    throw new Error(`Coasteering route with id "${query.routeId}" not found.`);
  }

  const baseRequiredDepth = 1.5 + query.jumpHeightM * 0.5;
  const aerationPenalty = query.waterAeratedWithFoam ? 1.0 : 0.0;
  const minRequiredDepthM = Number((baseRequiredDepth + aerationPenalty).toFixed(1));
  const depthMarginM = Number((query.waterDepthM - minRequiredDepthM).toFixed(1));

  let safetyStatus: JumpSafetyStatus;
  if (depthMarginM < 0) {
    safetyStatus = 'critical_shallow_hazard';
  } else if (
    query.swellHeightM >= 2.5 ||
    (query.swellHeightM >= 2.0 && query.swellPeriodSeconds >= 14)
  ) {
    safetyStatus = 'extreme_surge_warning';
  } else if (
    query.swellHeightM >= 1.5 ||
    query.tideState === 'falling_ebb' ||
    query.waterAeratedWithFoam ||
    depthMarginM < 0.5
  ) {
    safetyStatus = 'caution_surge_timing';
  } else {
    safetyStatus = 'safe_jump_approved';
  }

  const aerationImpactNotice = query.waterAeratedWithFoam
    ? 'White-water foam aeration reduces water density by ~25%, decreasing buoyancy and extending entry plunge depth. Extra 1.0m safety depth buffer applied.'
    : 'Water surface is clear with standard seawater density. Normal buoyant deceleration applies.';

  let surgeTimingAdvisory = '';
  if (safetyStatus === 'extreme_surge_warning') {
    surgeTimingAdvisory =
      'EXTREME SURGE WARNING: Violent swells create heavy backwash and powerful undertow against cliff bases. Jump entry is strictly unsafe.';
  } else if (safetyStatus === 'caution_surge_timing') {
    surgeTimingAdvisory =
      'CAUTION: Complex wave cycles detected. Time jump precisely: jump at crest of wave, avoid falling trough to prevent bottoming out or washing onto rocks.';
  } else {
    surgeTimingAdvisory =
      'Optimal surge conditions: jump at crest of wave, avoid falling trough for soft aerated entry cushion and clean swimmer dispersion.';
  }

  const bodyPositionGuide =
    'Pencil Jump Position: Keep body strictly vertical, legs locked together, toes pointed down, arms crossed over chest holding PFD collar, chin tucked, and mouth firmly closed upon impact.';

  let exitRouteAdvisory = '';
  if (safetyStatus === 'critical_shallow_hazard') {
    exitRouteAdvisory =
      'CRITICAL HAZARD: Depth is insufficient. DO NOT ENTER water. Locate an alternative descent or scramble back.';
  } else if (safetyStatus === 'extreme_surge_warning') {
    exitRouteAdvisory =
      'EMERGENCY: Heavy surge obscures exit ledges. Stay clear of surge gullies and maintain safe distance.';
  } else {
    exitRouteAdvisory =
      'Identify secondary scramble egress prior to leap. Time swell surge to float up onto barnacle shelves and grab handholds before backwash.';
  }

  return {
    routeTitle: route.title,
    coasteeringGrade: route.coasteeringGrade,
    minRequiredDepthM,
    depthMarginM,
    safetyStatus,
    aerationImpactNotice,
    surgeTimingAdvisory,
    bodyPositionGuide,
    exitRouteAdvisory,
  };
}
