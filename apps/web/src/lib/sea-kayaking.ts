export type CoastalWaterGrade =
  | 'grade_1_sheltered'
  | 'grade_2_coastal'
  | 'grade_3_open_crossing'
  | 'grade_4_exposed_ocean';

export type TideCurrentRisk = 'low' | 'moderate' | 'strong' | 'extreme';

export interface SeaKayakRoute {
  id: string;
  title: string;
  region: string;
  distanceNm: number;
  typicalDurationDays: number;
  waterGrade: CoastalWaterGrade;
  currentRisk: TideCurrentRisk;
  maxCurrentKnots: number;
  openCrossingMiles: number;
  recommendedKayakLengthFt: number;
  drysuitMandatory: boolean;
  description: string;
  highlights: string[];
}

export interface TidePlanQuery {
  routeId: string;
  paddlerSkillLevel: 'novice' | 'intermediate' | 'advanced';
  currentSpeedKnots: number;
  windSpeedKnots: number;
  crossingWindowHours: number;
}

export interface TidePlanResult {
  routeTitle: string;
  crossingSafetyStatus: 'favorable' | 'caution' | 'hazardous';
  recommendedDepartureTiming: string;
  estimatedFerryAngleDegrees: number;
  effectivePaddlingSpeedKnots: number;
  drysuitRequired: boolean;
  vhfChannel: number;
  safetyAdvisory: string;
}

export interface SeaKayakGearItem {
  id: string;
  name: string;
  category: 'immersion' | 'kayak_hardware' | 'navigation' | 'signaling' | 'safety';
  mandatory: boolean;
  description: string;
}

export const SEA_KAYAK_ROUTES: SeaKayakRoute[] = [
  {
    id: 'san-juan-islands-crossing',
    title: 'San Juan Islands Archipelago Traverse',
    region: 'Washington Sound, WA',
    distanceNm: 28,
    typicalDurationDays: 3,
    waterGrade: 'grade_2_coastal',
    currentRisk: 'strong',
    maxCurrentKnots: 4.2,
    openCrossingMiles: 2.5,
    recommendedKayakLengthFt: 16,
    drysuitMandatory: true,
    description:
      'Navigate tide rips, rocky shores, and marine parks across the sheltered and channel waters of the San Juan archipelago.',
    highlights: [
      'Orca whale sanctuaries',
      'Rosario Strait tidal races',
      'Turn Island marine park campsites',
    ],
  },
  {
    id: 'prince-william-sound-fjords',
    title: 'Prince William Sound Glaciated Fjords',
    region: 'Valdez & Whittier, AK',
    distanceNm: 45,
    typicalDurationDays: 5,
    waterGrade: 'grade_3_open_crossing',
    currentRisk: 'moderate',
    maxCurrentKnots: 2.8,
    openCrossingMiles: 4.0,
    recommendedKayakLengthFt: 17,
    drysuitMandatory: true,
    description:
      'Glacial fjord exploration amidst icebergs, remote wilderness camps, and active tidewater glacier calving faces.',
    highlights: [
      'Tidewater glacier calving',
      'Harriman Fjord ice fields',
      'Otter & sea lion haul-outs',
    ],
  },
  {
    id: 'maine-island-trail-passage',
    title: 'Maine Island Trail Penobscot Bay Passage',
    region: 'Midcoast Maine, ME',
    distanceNm: 32,
    typicalDurationDays: 4,
    waterGrade: 'grade_2_coastal',
    currentRisk: 'moderate',
    maxCurrentKnots: 3.0,
    openCrossingMiles: 1.8,
    recommendedKayakLengthFt: 16,
    drysuitMandatory: true,
    description:
      "Historic granite island-hopping along Maine's protected coastal waters and working lobster harbors.",
    highlights: [
      'Granite archipelago islands',
      'Lobster boat channels',
      'Merchants Row sheltered islands',
    ],
  },
  {
    id: 'apostle-islands-sea-caves',
    title: 'Apostle Islands Sea Caves & Outer Islands',
    region: 'Lake Superior, WI',
    distanceNm: 22,
    typicalDurationDays: 2,
    waterGrade: 'grade_2_coastal',
    currentRisk: 'low',
    maxCurrentKnots: 1.2,
    openCrossingMiles: 3.5,
    recommendedKayakLengthFt: 15,
    drysuitMandatory: true,
    description:
      "Explore intricate red sandstone sea arches and wave-carved caves along Lake Superior's formidable freshwater coastline.",
    highlights: [
      'Sandstone sea arches',
      'Devils Island wave caves',
      'Historic lighthouses',
    ],
  },
  {
    id: 'haida-gwaii-gwaii-haanas',
    title: 'Gwaii Haanas Coastal Wilderness Expedition',
    region: 'Haida Gwaii, BC',
    distanceNm: 65,
    typicalDurationDays: 7,
    waterGrade: 'grade_4_exposed_ocean',
    currentRisk: 'extreme',
    maxCurrentKnots: 5.5,
    openCrossingMiles: 6.0,
    recommendedKayakLengthFt: 18,
    drysuitMandatory: true,
    description:
      'Expedition-level open ocean paddling around rugged Pacific capes, tidal surges, and ancient indigenous cultural heritage sites.',
    highlights: [
      'Open Pacific ocean swells',
      'Hecate Strait tidal surges',
      'Ancient Haida village poles',
    ],
  },
];

export const SEA_KAYAK_GEAR: SeaKayakGearItem[] = [
  {
    id: 'pfd-rescue-harness',
    name: 'USCG/Transport Canada Type III/V Whitewater/Sea PFD with rescue harness',
    category: 'safety',
    mandatory: true,
    description:
      'Type III/V sea rescue vest equipped with quick-release chest harness, towing pigtail, and knife tab.',
  },
  {
    id: 'drysuit-gaskets',
    name: 'Waterproof breathable dry suit with neoprene/latex neck & wrist gaskets',
    category: 'immersion',
    mandatory: true,
    description:
      'Heavy-duty breathable immersion suit with sealed latex gaskets, integrated relief zipper, and fabric booties.',
  },
  {
    id: 'marine-vhf-radio',
    name: 'Marine VHF waterproof radio (floating, channel 16/9/weather)',
    category: 'signaling',
    mandatory: true,
    description:
      'Submersible IPX8 floating 6W marine VHF radio with NOAA weather alerts and dedicated Ch 16 distress button.',
  },
  {
    id: 'bilge-pump-paddle-float',
    name: 'High-volume manual bilge pump and dual-chamber paddle float',
    category: 'safety',
    mandatory: true,
    description:
      'Dual-action manual evacuation pump with high-buoyancy inflatable paddle float for self-rescue re-entry.',
  },
  {
    id: 'dual-waterproof-bulkheads',
    name: 'Dual waterproof bulkheads with sealed watertight hatches (bow & stern)',
    category: 'kayak_hardware',
    mandatory: true,
    description:
      'Sealed positive buoyancy compartments providing unsinkable volume and dry expedition gear storage.',
  },
  {
    id: 'whistle-distress-flares',
    name: 'Audible signaling device (pealess marine whistle) & visual day/night distress flares',
    category: 'signaling',
    mandatory: true,
    description:
      'USCG approved pealess marine storm whistle (115dB) with red aerial signals and handheld orange smoke flares.',
  },
];

export function getSeaKayakRoutes(grade?: CoastalWaterGrade): SeaKayakRoute[] {
  if (!grade) {
    return SEA_KAYAK_ROUTES;
  }
  return SEA_KAYAK_ROUTES.filter((route) => route.waterGrade === grade);
}

export function getSeaKayakRouteById(id: string): SeaKayakRoute | undefined {
  return SEA_KAYAK_ROUTES.find((route) => route.id === id);
}

export function calculateTidePlan(query: TidePlanQuery): TidePlanResult {
  const route = getSeaKayakRouteById(query.routeId);
  if (!route) {
    throw new Error(`Route with id "${query.routeId}" not found`);
  }

  const baseSpeeds: Record<TidePlanQuery['paddlerSkillLevel'], number> = {
    novice: 2.5,
    intermediate: 3.5,
    advanced: 4.5,
  };

  const baseSpeed = baseSpeeds[query.paddlerSkillLevel];
  const windPenalty = query.windSpeedKnots * 0.05;
  const effectivePaddlingSpeedKnots = Math.max(
    0.8,
    Math.round((baseSpeed - windPenalty) * 10) / 10
  );

  let estimatedFerryAngleDegrees = 0;
  if (query.currentSpeedKnots > 0) {
    const ratio = query.currentSpeedKnots / effectivePaddlingSpeedKnots;
    if (ratio >= 1) {
      estimatedFerryAngleDegrees = 90;
    } else {
      estimatedFerryAngleDegrees = Math.round(Math.asin(ratio) * (180 / Math.PI));
    }
  }

  let crossingSafetyStatus: 'favorable' | 'caution' | 'hazardous';
  if (
    query.currentSpeedKnots >= effectivePaddlingSpeedKnots ||
    query.windSpeedKnots >= 22 ||
    query.currentSpeedKnots >= 4.0 ||
    (query.paddlerSkillLevel === 'novice' &&
      (query.currentSpeedKnots > 2.0 ||
        query.windSpeedKnots > 12 ||
        route.waterGrade !== 'grade_1_sheltered')) ||
    (query.paddlerSkillLevel === 'intermediate' &&
      route.waterGrade === 'grade_4_exposed_ocean')
  ) {
    crossingSafetyStatus = 'hazardous';
  } else if (
    query.windSpeedKnots >= 12 ||
    query.currentSpeedKnots >= 2.0 ||
    query.crossingWindowHours < 2 ||
    route.waterGrade === 'grade_3_open_crossing' ||
    route.waterGrade === 'grade_4_exposed_ocean' ||
    query.paddlerSkillLevel === 'novice'
  ) {
    crossingSafetyStatus = 'caution';
  } else {
    crossingSafetyStatus = 'favorable';
  }

  let recommendedDepartureTiming: string;
  if (query.currentSpeedKnots >= 3.0) {
    recommendedDepartureTiming =
      'Slack water departure mandatory: launch 30 min before slack turning to ebb';
  } else if (query.currentSpeedKnots >= 1.0) {
    recommendedDepartureTiming =
      'Depart 45 min before predicted slack water to complete crossing within current window';
  } else {
    recommendedDepartureTiming =
      'Depart during mild slack or ebb window with favorable tidal drift assist';
  }

  let safetyAdvisory: string;
  if (crossingSafetyStatus === 'hazardous') {
    safetyAdvisory =
      'Hazardous marine conditions: Gale/strong current warning. Current speed exceeds ferry capacity or wind generates breaking swell over 3ft. Delay crossing until slack or wind subsides.';
  } else if (crossingSafetyStatus === 'caution') {
    safetyAdvisory =
      'Exercise caution: Active tidal currents and moderate chop. Maintain tight group formation, monitor VHF ch 16 for commercial traffic, and set ferry angle.';
  } else {
    safetyAdvisory =
      'Favorable crossing conditions: Light winds and manageable tidal flow. Standard coastal navigation and visual pilotage recommended.';
  }

  return {
    routeTitle: route.title,
    crossingSafetyStatus,
    recommendedDepartureTiming,
    estimatedFerryAngleDegrees,
    effectivePaddlingSpeedKnots,
    drysuitRequired: route.drysuitMandatory,
    vhfChannel: 16,
    safetyAdvisory,
  };
}

export function getSeaKayakGear(): SeaKayakGearItem[] {
  return SEA_KAYAK_GEAR;
}
