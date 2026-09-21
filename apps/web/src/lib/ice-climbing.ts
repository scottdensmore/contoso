export type IceGrade =
  | 'wi2_beginner'
  | 'wi3_intermediate'
  | 'wi4_advanced'
  | 'wi5_expert'
  | 'wi6_extreme';

export type IceStructure =
  | 'plastic_water_ice'
  | 'brittle_bullet_ice'
  | 'chandelier_candled_ice'
  | 'wet_aerated_ice';

export type AnchorType =
  | 'v_thread_abalakov'
  | 'dual_screw_equalized'
  | 'single_screw_bail';

export type AnchorSafetyStatus =
  | 'approved'
  | 'caution_conditions'
  | 'hazardous_thin_or_melting';

export interface IceClimbingRoute {
  id: string;
  title: string;
  region: string;
  pitches: number;
  lengthM: number;
  iceGrade: IceGrade;
  elevationM: number;
  iceStructure: IceStructure;
  typicalDurationHours: number;
  vThreadAnchorStandard: boolean;
  description: string;
  highlights: string[];
}

export interface IceRiggingQuery {
  routeId: string;
  iceTemperatureF: number;
  iceThicknessCm: number;
  screwLengthCm: number;
  screwPlacementAngleDeg: number;
  anchorType: AnchorType;
}

export interface IceRiggingResult {
  routeTitle: string;
  iceGrade: IceGrade;
  iceQualityRating: string;
  estimatedHoldingForceKn: number;
  safetyStatus: AnchorSafetyStatus;
  temperatureAdvisory: string;
  riggingRecommendation: string;
  vThreadSuitable: boolean;
}

export interface IceClimbingGearItem {
  id: string;
  name: string;
  category: 'tools' | 'crampons' | 'protection' | 'anchor' | 'footwear' | 'safety';
  mandatory: boolean;
  description: string;
}

export const ICE_CLIMBING_ROUTES: IceClimbingRoute[] = [
  {
    id: 'ouray-ice-park-pic-of-the-vic',
    title: 'Pic of the Vic & Upper Bridge Area',
    region: 'Ouray Ice Park, Ouray, CO',
    pitches: 2,
    lengthM: 45,
    iceGrade: 'wi3_intermediate',
    elevationM: 2400,
    iceStructure: 'plastic_water_ice',
    typicalDurationHours: 2.5,
    vThreadAnchorStandard: true,
    description:
      'Premier canyon waterfall ice featuring continuous blue flows, gorge rim bridge access, and top-rope anchor stanchions in the Uncompahgre Gorge.',
    highlights: [
      'Gorge rim bridge access',
      'Continuous blue waterfall ice flows',
      'Top-rope anchor stanchions',
    ],
  },
  {
    id: 'hyalite-canyon-genesis-ii',
    title: 'Genesis II Waterfall',
    region: 'Hyalite Canyon, Bozeman, MT',
    pitches: 3,
    lengthM: 85,
    iceGrade: 'wi4_advanced',
    elevationM: 2250,
    iceStructure: 'brittle_bullet_ice',
    typicalDurationHours: 4.0,
    vThreadAnchorStandard: true,
    description:
      'Sustained steep northern Rockies classic featuring an 80-degree ice wall in a cold, sheltered alpine drainage amphitheater with two distinct vertical flow steps.',
    highlights: [
      'Sustained 80-degree ice wall',
      'Sheltered alpine drainage amphitheater',
      'Two-tier vertical flow steps',
    ],
  },
  {
    id: 'canmore-weeping-wall-lower',
    title: 'The Weeping Wall (Lower Tier)',
    region: 'Banff & Jasper National Parks, AB, Canada',
    pitches: 4,
    lengthM: 160,
    iceGrade: 'wi4_advanced',
    elevationM: 1950,
    iceStructure: 'plastic_water_ice',
    typicalDurationHours: 5.5,
    vThreadAnchorStandard: true,
    description:
      'Vast 500-foot ice shield along the Icefields Parkway delivering multiple pitches of sustained blue waterfall ice curtain flows.',
    highlights: [
      'Vast 500-foot ice shield',
      'Iconic Canadian Rockies roadside route',
      'Massive blue ice curtain pitches',
    ],
  },
  {
    id: 'lake-willoughby-promised-land',
    title: 'The Promised Land',
    region: 'Lake Willoughby, Westmore, VT',
    pitches: 3,
    lengthM: 110,
    iceGrade: 'wi5_expert',
    elevationM: 580,
    iceStructure: 'chandelier_candled_ice',
    typicalDurationHours: 5.0,
    vThreadAnchorStandard: true,
    description:
      'Formidable northeastern testpiece characterized by high-angle columnar pillars, howling lake winds, and fragile chandelier ice formations.',
    highlights: [
      'High-angle columnar ice pillars',
      'Dramatic lake breeze exposure',
      'Delicate thin chandelier ice placements',
    ],
  },
  {
    id: 'vail-amphitheater-fang',
    title: 'The Fang',
    region: 'Vail Amphitheater, Vail, CO',
    pitches: 1,
    lengthM: 35,
    iceGrade: 'wi6_extreme',
    elevationM: 2700,
    iceStructure: 'chandelier_candled_ice',
    typicalDurationHours: 3.0,
    vThreadAnchorStandard: true,
    description:
      'Legendary free-standing vertical ice pillar demanding extreme precision on aerated hollow ice daggers with relentless forearm pump.',
    highlights: [
      'Legendary free-standing vertical ice pillar',
      'Aerated hollow ice dagger transitions',
      'Severe forearm pump and exposure',
    ],
  },
];

export const ICE_CLIMBING_GEAR: IceClimbingGearItem[] = [
  {
    id: 'technical-ice-tools',
    name: 'Pair of Ergonomic Technical Ice Tools with Aggressive Cascading Ice Picks',
    category: 'tools',
    mandatory: true,
    description:
      'Cambered clearance shafts with reverse-curve picks engineered for steep waterfall ice penetration and dry-tooling stability without pick shift.',
  },
  {
    id: 'mono-dual-point-crampons',
    name: 'Rigid or Semi-Rigid Steel Ice Climbing Crampons with Vertical Frontpoints',
    category: 'crampons',
    mandatory: true,
    description:
      'Aggressive vertical mono or dual frontpoints penetrating bullet hard water ice with secondary spur points for heel stability on columnar features.',
  },
  {
    id: 'ice-screw-rack',
    name: 'Rack of 8-12 CE/UIAA Certified Ice Screws (13cm, 16cm, 19cm, 22cm) with Express Cranks',
    category: 'protection',
    mandatory: true,
    description:
      'Polished chromoly or titanium ice screws with fold-out express crank handles for rapid one-handed placements in steep ice.',
  },
  {
    id: 'v-thread-hooker-cord',
    name: 'Abalakov V-Thread Cord Threader Tool and 7mm Static Dyneema/Perlon Anchor Cord',
    category: 'anchor',
    mandatory: true,
    description:
      'Lightweight wire hooker tool and 7mm high-modulus cord for rigging retrievable Abalakov V-thread rappels and equalized multi-pitch anchor stations.',
  },
  {
    id: 'insulated-mountaineering-boots',
    name: 'B3-Rated Rigid Waterproof Insulated Double Mountaineering Boots with Heel/Toe Welts',
    category: 'footwear',
    mandatory: true,
    description:
      'Fully rigid sole shank with front and rear automatic crampon bail welts, Primaloft insulation, and integrated waterproof gaiters for zero-degree belays.',
  },
  {
    id: 'ice-climbing-helmet-visor',
    name: 'EN 12492 Certified Climbing Helmet with Eye-Protection Ice Visor',
    category: 'safety',
    mandatory: true,
    description:
      'Top and side impact-certified alpine helmet equipped with a polycarbonate flip-down shield guarding against falling ice dinner-plates and tool strikes.',
  },
];

export function getIceClimbingRoutes(grade?: IceGrade): IceClimbingRoute[] {
  if (!grade) {
    return ICE_CLIMBING_ROUTES;
  }
  return ICE_CLIMBING_ROUTES.filter((route) => route.iceGrade === grade);
}

export function getIceClimbingRouteById(id: string): IceClimbingRoute | undefined {
  return ICE_CLIMBING_ROUTES.find((route) => route.id === id);
}

export function getIceClimbingGear(): IceClimbingGearItem[] {
  return ICE_CLIMBING_GEAR;
}

export function calculateIceRiggingPlan(query: IceRiggingQuery): IceRiggingResult {
  const route = getIceClimbingRouteById(query.routeId);
  if (!route) {
    throw new Error(`Ice climbing route with id "${query.routeId}" not found.`);
  }

  // 1. Ice Quality Rating
  let iceQualityRating = '';
  if (query.iceTemperatureF > 32) {
    iceQualityRating = 'Wet melting risk — aerated waterfall ice flow with active water percolation';
  } else if (query.iceTemperatureF < 10) {
    iceQualityRating = 'Brittle shattering risk — cold fractured bullet ice prone to dinner-plating';
  } else {
    iceQualityRating = 'Dense hero ice — optimal plastic water ice with maximum screw thread engagement';
  }

  // 2. Base holding capacity (kN)
  const lengthCapacities: Record<number, number> = {
    13: 8.0,
    16: 10.5,
    19: 13.0,
    22: 14.5,
  };
  const baseScrewHoldingForce = lengthCapacities[query.screwLengthCm] || 11.0;

  // Ice thickness factor:
  let thicknessFactor = 1.0;
  if (query.iceThicknessCm < query.screwLengthCm) {
    thicknessFactor = Math.max(0.3, (query.iceThicknessCm / query.screwLengthCm) * 0.7);
  } else if (query.iceThicknessCm < 15) {
    thicknessFactor = 0.8;
  }
  if (query.iceThicknessCm < 10) {
    thicknessFactor = Math.min(thicknessFactor, 0.45);
  }

  // Temperature factor:
  let tempFactor = 1.0;
  if (query.iceTemperatureF > 32) {
    tempFactor = 0.45;
  } else if (query.iceTemperatureF > 28) {
    tempFactor = 0.85;
  } else if (query.iceTemperatureF < 5) {
    tempFactor = 0.80;
  } else if (query.iceTemperatureF < 10) {
    tempFactor = 0.90;
  }

  // Angle factor:
  let angleFactor = 1.0;
  if (query.screwPlacementAngleDeg === 100) {
    angleFactor = 1.0;
  } else if (query.screwPlacementAngleDeg === 90) {
    angleFactor = 0.88;
  } else {
    angleFactor = 0.82;
  }

  const singleHoldingForce = baseScrewHoldingForce * thicknessFactor * tempFactor * angleFactor;

  // Check V-thread suitability:
  let vThreadSuitable = false;
  if (
    route.vThreadAnchorStandard &&
    query.iceThicknessCm >= 18 &&
    query.screwLengthCm >= 19 &&
    query.iceTemperatureF <= 32
  ) {
    vThreadSuitable = true;
  }

  let totalHoldingForce = 0;
  if (query.anchorType === 'dual_screw_equalized') {
    totalHoldingForce = singleHoldingForce * 1.65;
  } else if (query.anchorType === 'v_thread_abalakov') {
    if (vThreadSuitable) {
      totalHoldingForce = Math.min(18.0, singleHoldingForce * 1.25);
    } else {
      totalHoldingForce = singleHoldingForce * 0.65;
    }
  } else {
    // single_screw_bail
    totalHoldingForce = singleHoldingForce;
  }

  const estimatedHoldingForceKn = Number(totalHoldingForce.toFixed(1));

  // 3. Anchor Safety Status
  let safetyStatus: AnchorSafetyStatus = 'approved';

  if (query.iceTemperatureF > 32 || query.iceThicknessCm < 12) {
    safetyStatus = 'hazardous_thin_or_melting';
  } else if (
    query.anchorType === 'single_screw_bail' ||
    query.iceTemperatureF < 10 ||
    query.iceTemperatureF > 28 ||
    query.iceThicknessCm < 18 ||
    (query.anchorType === 'v_thread_abalakov' && !vThreadSuitable) ||
    estimatedHoldingForceKn < 15.0
  ) {
    safetyStatus = 'caution_conditions';
  } else {
    safetyStatus = 'approved';
  }

  // 4. Temperature Advisory
  let temperatureAdvisory = '';
  if (query.iceTemperatureF > 32) {
    temperatureAdvisory =
      'Melting hazard: Ambient and ice surface temperatures above freezing (32°F) cause rapid ice screw melt-out under solar or warm air exposure. Avoid ascending waterfall pillars during active thaws.';
  } else if (query.iceTemperatureF < 10) {
    temperatureAdvisory =
      'Extreme cold fracturing risk: Ice below 10°F is severely brittle. Ice screws cause significant radial dinner-plate fracturing upon placement. Tap screws gently to start, clear fractured surface ice, and equalize multi-point anchors.';
  } else {
    temperatureAdvisory =
      'Optimal plastic ice envelope: Temperatures between 10°F and 28°F yield plastic, shock-absorbing waterfall ice with maximum compressive strength and secure screw thread engagement.';
  }

  // 5. Rigging Recommendation
  let riggingRecommendation = '';
  if (query.anchorType === 'single_screw_bail') {
    riggingRecommendation =
      'WARNING: Single screw anchors lack critical redundancy and are unacceptable for multi-pitch belays. Use strictly as a temporary bail point backed up by terrain features or double-screw stations.';
  } else if (query.anchorType === 'v_thread_abalakov') {
    if (vThreadSuitable) {
      riggingRecommendation =
        'Abalakov V-thread suitable: Drill two intersecting 60-degree bores using 22cm screws, hook 7mm static cord with threader tool, and back up with a second screw for the first descender.';
    } else {
      riggingRecommendation =
        'Abalakov V-thread insufficient: Solid ice thickness (<18cm) or screw length (<19cm) is inadequate for standard 60-degree V-thread intersection. Transition to dual staggered equalized screws.';
    }
  } else {
    riggingRecommendation =
      'Dual screw equalized station: Place two screws vertically offset by at least 20cm and horizontally staggered to prevent shear line fracturing. Equalize with a static cordelette below 60 degrees.';
  }

  return {
    routeTitle: route.title,
    iceGrade: route.iceGrade,
    iceQualityRating,
    estimatedHoldingForceKn,
    safetyStatus,
    temperatureAdvisory,
    riggingRecommendation,
    vThreadSuitable,
  };
}
