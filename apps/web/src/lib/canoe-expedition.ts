export type WhitewaterClass =
  | 'class_i_easy'
  | 'class_ii_moderate'
  | 'class_iii_advanced'
  | 'class_iv_expert';

export type CargoPlacement = 'forward' | 'centered' | 'rear';

export type RapidLevel =
  | 'flatwater'
  | 'class_i'
  | 'class_ii'
  | 'class_iii'
  | 'class_iv';

export interface CanoeRoute {
  id: string;
  title: string;
  region: string;
  distanceKm: number;
  typicalDurationDays: number;
  whitewaterClass: WhitewaterClass;
  totalPortages: number;
  longestPortageM: number;
  recommendedHullMaterial: string;
  recommendedLengthFt: number;
  description: string;
  highlights: string[];
}

export interface CanoeTrimQuery {
  routeId: string;
  canoeLengthFt: number; // 14 to 18 ft, default 16
  bowPaddlerWeightKg: number; // 50 to 120 kg, default 75
  sternPaddlerWeightKg: number; // 50 to 120 kg, default 85
  gearCargoWeightKg: number; // 20 to 200 kg, default 70
  cargoPlacement: CargoPlacement;
  rapidLevel: RapidLevel;
}

export interface CanoeTrimResult {
  routeTitle: string;
  totalGrossWeightKg: number;
  capacityPercent: number;
  centerFreeboardCm: number;
  centerFreeboardInches: number;
  trimStatus:
    | 'balanced_optimal'
    | 'slightly_stern_heavy'
    | 'bow_heavy'
    | 'excessively_stern_heavy';
  swampingRisk: 'low' | 'moderate' | 'high' | 'critical';
  safetyStatus: 'safe' | 'caution' | 'critical_hazard';
  tacticalAdvisory: string;
}

export interface CanoeGearItem {
  id: string;
  name: string;
  category:
    | 'hull_protection'
    | 'flotation'
    | 'lining_tracking'
    | 'dewatering'
    | 'portage'
    | 'paddler_safety';
  mandatory: boolean;
  description: string;
}

export const CANOE_ROUTES: CanoeRoute[] = [
  {
    id: 'allagash-wilderness-waterway',
    title: 'Allagash Wilderness Waterway Northern Canoe Traverse',
    region: 'North Maine Woods, ME',
    distanceKm: 150,
    typicalDurationDays: 7,
    whitewaterClass: 'class_ii_moderate',
    totalPortages: 4,
    longestPortageM: 1200,
    recommendedHullMaterial: 'Royalex / T-Formex',
    recommendedLengthFt: 16,
    description:
      'Legendary Northwoods river expedition with classic lake paddling, Chase Rapids whitewater, and historic carry trails.',
    highlights: [
      'Chase Rapids Class II technical rock garden',
      'Allagash Falls 40-foot waterfall carry',
      'Chesuncook & Chamberlain lake expanses',
    ],
  },
  {
    id: 'nahanni-river-canyon-run',
    title: 'South Nahanni River Grand Canyons & Virginia Falls',
    region: 'Dehcho Region, NT, Canada',
    distanceKm: 340,
    typicalDurationDays: 12,
    whitewaterClass: 'class_iii_advanced',
    totalPortages: 2,
    longestPortageM: 1600,
    recommendedHullMaterial: 'T-Formex Expedition',
    recommendedLengthFt: 17,
    description:
      'Expedition-class wilderness river cutting through four mile-deep canyons, massive standing waves, and boiling boil-line whirlpools.',
    highlights: [
      'Virginia Falls twice the height of Niagara',
      'Figure of Eight Rapids canyon standing waves',
      'The Gate vertical limestone buttress',
    ],
  },
  {
    id: 'boundary-waters-granite-river',
    title: 'Granite River International Border Canoe Route',
    region: 'Gunflint Trail & BWCAW, MN/ON',
    distanceKm: 52,
    typicalDurationDays: 4,
    whitewaterClass: 'class_i_easy',
    totalPortages: 8,
    longestPortageM: 650,
    recommendedHullMaterial: 'Kevlar-Carbon Ultralight',
    recommendedLengthFt: 17,
    description:
      'Pristine glaciated border route of rugged granite gorges, calm wilderness lakes, and short bouldery whitewater carries.',
    highlights: [
      'Granite river chutes and swifts',
      'Saganaga Lake archipelago crossing',
      'Historic voyageur marker cairns',
    ],
  },
  {
    id: 'missinaibi-river-james-bay',
    title: 'Missinaibi River Thunderhouse Falls to Moose Factory',
    region: 'Northern Ontario, ON, Canada',
    distanceKm: 540,
    typicalDurationDays: 18,
    whitewaterClass: 'class_iv_expert',
    totalPortages: 14,
    longestPortageM: 2400,
    recommendedHullMaterial: 'Royalex / T-Formex',
    recommendedLengthFt: 17,
    description:
      'Remote subarctic wilderness watershed demanding expert lining, tracking, portaging, and heavy spray-skirt whitewater handling.',
    highlights: [
      'Thunderhouse Falls dramatic granite canyon',
      'St. Paul & Peter chutes technical lining',
      'Tidal approach to James Bay saltwater',
    ],
  },
  {
    id: 'rio-grande-lower-canyons',
    title: 'Rio Grande Wild & Scenic Lower Canyons Descent',
    region: 'Big Bend & Chihuahuan Desert, TX',
    distanceKm: 135,
    typicalDurationDays: 8,
    whitewaterClass: 'class_iii_advanced',
    totalPortages: 3,
    longestPortageM: 400,
    recommendedHullMaterial: 'Royalex / T-Formex',
    recommendedLengthFt: 16,
    description:
      'Extremely isolated desert limestone canyon with towering 1,200ft cliff walls, cane thickets, and rock-sieve boulder rapids.',
    highlights: [
      'Burro Bluff colossal amphitheater',
      'Panther & Maravillas rapid sieves',
      'Thermal warm springs riverbank campsites',
    ],
  },
];

export const CANOE_GEAR: CanoeGearItem[] = [
  {
    id: 'whitewater-canoe-spray-deck',
    name: 'Full-Length Cordura Canoe Spray Deck Cover & Cockpit Skirts',
    category: 'hull_protection',
    mandatory: true,
    description:
      'Waterproof synthetic spray deck secured to gunwales with lash-cords and dual paddler cockpit coamings to prevent swamping in heavy standing waves.',
  },
  {
    id: 'dual-end-air-flotation-bags',
    name: '3D End Flotation Air Bags with Nylon Lacing Cages (Bow & Stern)',
    category: 'flotation',
    mandatory: true,
    description:
      'High-volume vinyl/urethane end bags displace 300+ lbs of water in a capsize, keeping gunwales high enough to rescue without sinking.',
  },
  {
    id: 'rapid-lining-tracking-ropes',
    name: 'Dual 25m Floating Polypropylene Rapid Lining & Tracking Ropes (Bow & Stern)',
    category: 'lining_tracking',
    mandatory: true,
    description:
      'Floating high-visibility ropes secured through stem eyelets for safely guiding loaded canoes through impassable boulder rapids from shore.',
  },
  {
    id: 'deep-water-canoe-bailer-pump',
    name: 'High-Capacity Marine Bilge Pump & Scooped Foam Bailer',
    category: 'dewatering',
    mandatory: true,
    description:
      'Handheld manual suction pump (8 gpm) with leash and scooped jug bailer to clear water rapidly while maneuvering downstream.',
  },
  {
    id: 'contoured-portage-yoke-pads',
    name: 'Ash Deep-Dish Contoured Portage Yoke & Clamp-On Shoulder Pads',
    category: 'portage',
    mandatory: true,
    description:
      'Anatomical carved ash wooden yoke with high-density EVA foam clamp-on pads to carry heavy 60+ lb canoes comfortably over portage carries.',
  },
  {
    id: 'whitewater-rescue-pfd-harness',
    name: 'USCG Type V / ISO High-Impact Whitewater PFD with Quick-Release Harness',
    category: 'paddler_safety',
    mandatory: true,
    description:
      '17+ lbs minimum buoyancy rescue vest with integrated quick-release chest belt, O-ring, whistle, knife lash tab, and strobe attachment.',
  },
];

export function getCanoeRoutes(whitewaterClass?: WhitewaterClass): CanoeRoute[] {
  if (!whitewaterClass) {
    return CANOE_ROUTES;
  }
  return CANOE_ROUTES.filter((r) => r.whitewaterClass === whitewaterClass);
}

export function getCanoeRouteById(id: string): CanoeRoute | undefined {
  return CANOE_ROUTES.find((r) => r.id === id);
}

export function getCanoeGear(): CanoeGearItem[] {
  return CANOE_GEAR;
}

export function calculateCanoeTrim(query: CanoeTrimQuery): CanoeTrimResult {
  const route = getCanoeRouteById(query.routeId);
  const routeTitle = route ? route.title : 'Expedition Route';

  const hullWeight =
    query.canoeLengthFt >= 17 ? 29 : query.canoeLengthFt <= 15 ? 24 : 26;
  const totalGrossWeightKg =
    query.bowPaddlerWeightKg +
    query.sternPaddlerWeightKg +
    query.gearCargoWeightKg +
    hullWeight;

  const ratedCapacity = query.canoeLengthFt * 27.5;
  const capacityPercent = Math.round((totalGrossWeightKg / ratedCapacity) * 100);

  const centerFreeboardCm = Math.max(
    8.0,
    Math.round((36.0 - (totalGrossWeightKg / 30.0) * 2.0) * 10) / 10
  );
  const centerFreeboardInches =
    Math.round((centerFreeboardCm / 2.54) * 10) / 10;

  const frontCargoFactor =
    query.cargoPlacement === 'forward'
      ? 0.7
      : query.cargoPlacement === 'centered'
      ? 0.35
      : 0;
  const rearCargoFactor =
    query.cargoPlacement === 'rear'
      ? 0.7
      : query.cargoPlacement === 'centered'
      ? 0.35
      : 0;

  const frontLoad =
    query.bowPaddlerWeightKg + query.gearCargoWeightKg * frontCargoFactor;
  const rearLoad =
    query.sternPaddlerWeightKg + query.gearCargoWeightKg * rearCargoFactor;

  const diff = rearLoad - frontLoad;

  let trimStatus: CanoeTrimResult['trimStatus'];
  if (diff < -5) {
    trimStatus = 'bow_heavy';
  } else if (diff >= 0 && diff <= 15) {
    trimStatus = 'slightly_stern_heavy';
  } else if (diff > 15) {
    trimStatus = 'excessively_stern_heavy';
  } else {
    trimStatus = 'balanced_optimal';
  }

  let swampingRisk: CanoeTrimResult['swampingRisk'];
  if (
    centerFreeboardInches < 5.5 ||
    (query.rapidLevel === 'class_iv' && centerFreeboardInches < 7.0)
  ) {
    swampingRisk = 'critical';
  } else if (
    centerFreeboardInches < 6.5 ||
    query.rapidLevel === 'class_iii'
  ) {
    swampingRisk = 'high';
  } else if (query.rapidLevel === 'class_ii') {
    swampingRisk = 'moderate';
  } else {
    swampingRisk = 'low';
  }

  let safetyStatus: CanoeTrimResult['safetyStatus'];
  if (
    capacityPercent > 92 ||
    centerFreeboardInches < 5.0 ||
    (query.rapidLevel === 'class_iv' && query.cargoPlacement === 'forward')
  ) {
    safetyStatus = 'critical_hazard';
  } else if (
    capacityPercent > 80 ||
    centerFreeboardInches < 6.5 ||
    trimStatus === 'bow_heavy'
  ) {
    safetyStatus = 'caution';
  } else {
    safetyStatus = 'safe';
  }

  let tacticalAdvisory: string;
  if (safetyStatus === 'critical_hazard') {
    if (capacityPercent > 92) {
      tacticalAdvisory =
        'CRITICAL HAZARD: Canoe payload exceeds 92% maximum rated displacement. Extreme risk of hull cracking or catastrophic swamping in standing waves.';
    } else if (centerFreeboardInches < 5.0) {
      tacticalAdvisory =
        'CRITICAL HAZARD: Gunwale freeboard is dangerously low (< 5.0 inches). River current boils and small wave trains will instantly submerge gunwales.';
    } else {
      tacticalAdvisory =
        'CRITICAL HAZARD: Forward cargo placement in Class IV whitewater causes the bow to spear into wave troughs rather than ride up. Relocate barrels rearward immediately.';
    }
  } else if (safetyStatus === 'caution') {
    if (trimStatus === 'bow_heavy') {
      tacticalAdvisory =
        'CAUTION: Hull is pitched bow-heavy. Downstream bow will dive into haystacks and paddle crosses will produce sluggish ferry angles.';
    } else if (capacityPercent > 80) {
      tacticalAdvisory =
        'CAUTION: Payload is above 80% capacity limit. Heavy hull response will sluggishly react to technical eddy turns and rock pivots.';
    } else {
      tacticalAdvisory =
        'CAUTION: Gunwale freeboard is under 6.5 inches. Install waterproof spray skirt and ensure end flotation bags are securely laced before running rapids.';
    }
  } else {
    if (trimStatus === 'slightly_stern_heavy') {
      tacticalAdvisory =
        'OPTIMAL TRIM: Hull is slightly stern-heavy (1-2 inches pitch), providing optimal bow lift over standing waves and agile pivot turns in eddy lines.';
    } else {
      tacticalAdvisory =
        'BALANCED: Hull displacement and trim are balanced within safe operational tolerances for open canoe wilderness tripping.';
    }
  }

  return {
    routeTitle,
    totalGrossWeightKg,
    capacityPercent,
    centerFreeboardCm,
    centerFreeboardInches,
    trimStatus,
    swampingRisk,
    safetyStatus,
    tacticalAdvisory,
  };
}
