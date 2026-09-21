export type GlacierRouteGrade = 'grade_ii' | 'grade_iii' | 'grade_iv' | 'grade_v';
export type CrevasseRiskLevel = 'low' | 'moderate' | 'high' | 'extreme';

export interface GlacierRoute {
  id: string;
  peakName: string;
  routeName: string;
  region: string;
  elevationFt: number;
  verticalGainFt: number;
  glacierGrade: GlacierRouteGrade;
  crevasseRisk: CrevasseRiskLevel;
  recommendedTeamSize: number;
  typicalAscentHours: number;
  recommendedRopeLengthM: number;
  cramponType: 'strap_on' | 'semi_automatic' | 'automatic_rigid';
  description: string;
  cruxKeyFeatures: string[];
}

export interface RopeTeamQuery {
  routeId: string;
  teamMembersCount: number;
  snowpackFirmness: 'hardpack_crust' | 'dense_firn' | 'soft_wet_spring' | 'fresh_powder';
  rescueHaulSystem: 'z_pulley_3_to_1' | 'c_pulley_2_to_1' | 'compound_6_to_1';
}

export interface RopeTeamResult {
  peakAndRouteName: string;
  recommendedRopeSpacingMeters: number;
  brakeKnotsRecommended: boolean;
  snowPicketCountRequired: number;
  preriggedPrusikCount: number;
  rescueHaulMechanicalAdvantage: string;
  glacierTurnaroundTimeHours: number;
  safetyAlert?: string;
}

export interface GlacierGearItem {
  id: string;
  name: string;
  category: 'hardware' | 'soft_goods' | 'rescue' | 'protection' | 'navigation';
  mandatory: boolean;
  description: string;
}

export const GLACIER_ROUTES: GlacierRoute[] = [
  {
    id: 'rainier-disappointment-cleaver',
    peakName: 'Mount Rainier',
    routeName: 'Disappointment Cleaver',
    region: 'Mount Rainier National Park, WA',
    elevationFt: 14411,
    verticalGainFt: 9000,
    glacierGrade: 'grade_iii',
    crevasseRisk: 'extreme',
    recommendedTeamSize: 3,
    typicalAscentHours: 14,
    recommendedRopeLengthM: 60,
    cramponType: 'semi_automatic',
    description:
      'Iconic glaciated route traversing the Ingraham Glacier, ascending the fractured Cleaver rib, and negotiating complex upper crevasse bridges to the Columbia Crest crater rim.',
    cruxKeyFeatures: [
      'Ingraham Glacier active icefall and serac hazard',
      'Disappointment Cleaver loose rock choss rib',
      'Upper snowbridge crossings above 13,000 ft',
    ],
  },
  {
    id: 'baker-coleman-deming',
    peakName: 'Mount Baker',
    routeName: 'Coleman-Deming Glacier',
    region: 'North Cascades, WA',
    elevationFt: 10781,
    verticalGainFt: 7000,
    glacierGrade: 'grade_ii',
    crevasseRisk: 'high',
    recommendedTeamSize: 3,
    typicalAscentHours: 10,
    recommendedRopeLengthM: 50,
    cramponType: 'semi_automatic',
    description:
      'Classic Pacific Northwest glacier climb featuring vast crevasse fields across the Coleman Glacier, crossing the Colfax Saddle, and ascending the Deming Roman Wall.',
    cruxKeyFeatures: [
      'Coleman Glacier lower icefall serac maze',
      'Colfax Saddle bergschrund transition',
      'Roman Wall 40° sustained firn/ice headwall',
    ],
  },
  {
    id: 'shasta-avalanche-gulch',
    peakName: 'Mount Shasta',
    routeName: 'Avalanche Gulch & Clear Creek',
    region: 'Cascade Range, Northern CA',
    elevationFt: 14179,
    verticalGainFt: 7300,
    glacierGrade: 'grade_ii',
    crevasseRisk: 'moderate',
    recommendedTeamSize: 2,
    typicalAscentHours: 11,
    recommendedRopeLengthM: 30,
    cramponType: 'strap_on',
    description:
      'Premier California stratovolcano route climbing past Helen Lake through the Red Banks chutes and crossing Misery Hill to the summit pinnacle.',
    cruxKeyFeatures: [
      'Red Banks chimney snow chutes and rockfall',
      'Misery Hill high-elevation exposed plateau',
      'Whitney and Konwakiton Glacier margin crevasses',
    ],
  },
  {
    id: 'hood-south-side-pearly-gates',
    peakName: 'Mount Hood',
    routeName: 'South Side via Pearly Gates / Old Chute',
    region: 'Mount Hood Wilderness, OR',
    elevationFt: 11249,
    verticalGainFt: 5300,
    glacierGrade: 'grade_ii',
    crevasseRisk: 'high',
    recommendedTeamSize: 2,
    typicalAscentHours: 8,
    recommendedRopeLengthM: 30,
    cramponType: 'semi_automatic',
    description:
      'Steep volcanic route departing Timberline, ascending the Hogsback knife-edge ridge above toxic fumaroles, and navigating steep rime ice chutes to the summit.',
    cruxKeyFeatures: [
      'Hogsback bergschrund gap',
      'Hot Rocks / Devil’s Kitchen active sulfur fumaroles',
      'Pearly Gates 45° rime ice upper chute',
    ],
  },
  {
    id: 'olympus-blue-glacier',
    peakName: 'Mount Olympus',
    routeName: 'Blue Glacier via Hoh River',
    region: 'Olympic National Park, WA',
    elevationFt: 7980,
    verticalGainFt: 8200,
    glacierGrade: 'grade_iv',
    crevasseRisk: 'extreme',
    recommendedTeamSize: 3,
    typicalAscentHours: 18,
    recommendedRopeLengthM: 60,
    cramponType: 'semi_automatic',
    description:
      'Remote wilderness expedition traversing the massive Blue Glacier ice tongue, ascending the Snow Dome bergschrund, and finishing with a 5.4 rock climb on the summit pinnacle.',
    cruxKeyFeatures: [
      'Blue Glacier massive lateral and transverse crevasses',
      'Snow Dome bergschrund transition',
      'Class 4-5.4 final summit rock horn pitch',
    ],
  },
];

export const GLACIER_GEAR: GlacierGearItem[] = [
  {
    id: 'ice-axe',
    name: 'CE/UIAA certified steel pick and adze mountaineering ice axe',
    category: 'hardware',
    mandatory: true,
    description:
      'Certified mountaineering piolet for self-arrest, snow cutting, and anchoring.',
  },
  {
    id: 'crampons',
    name: '10-to-12 point tempered steel mountaineering crampons with anti-balling plates',
    category: 'hardware',
    mandatory: true,
    description:
      'Rigid or semi-rigid steel crampons with anti-snow balling ABS plates for firm glacier ice.',
  },
  {
    id: 'glacier-rope',
    name: '30m-to-60m dynamic dry-treated mountaineering rope',
    category: 'soft_goods',
    mandatory: true,
    description:
      'Hydrophobic dry-treated dynamic rope preventing water absorption and freezing.',
  },
  {
    id: 'crevasse-rescue-kit',
    name: 'Crevasse rescue pulley kit (micro-traxion, prusik loops, tibloc, locking biners)',
    category: 'rescue',
    mandatory: true,
    description:
      'micro-traxion progress capture pulley, tibloc, prusik loops, and locking carabiners for mechanical advantage haul systems.',
  },
  {
    id: 'snow-picket',
    name: 'T-profile aluminum snow picket (50cm+) with wired runner',
    category: 'protection',
    mandatory: true,
    description:
      'Engineered T-extrusion aluminum picket for deadman and vertical snow anchors.',
  },
  {
    id: 'mountaineering-helmet',
    name: 'UIAA climbing helmet with headlamp retainers',
    category: 'hardware',
    mandatory: true,
    description:
      'Impact protection helmet for overhead serac ice fall and loose rock in couloirs.',
  },
];

export function getGlacierRoutes(grade?: GlacierRouteGrade): GlacierRoute[] {
  if (!grade) {
    return GLACIER_ROUTES;
  }
  return GLACIER_ROUTES.filter((r) => r.glacierGrade === grade);
}

export function getGlacierRouteById(id: string): GlacierRoute | undefined {
  return GLACIER_ROUTES.find((r) => r.id === id);
}

export function calculateRopeTeamPlan(query: RopeTeamQuery): RopeTeamResult {
  const team = Math.max(2, Math.min(5, Math.floor(query.teamMembersCount || 3)));
  const route = getGlacierRouteById(query.routeId) || GLACIER_ROUTES[0];

  const isSoft =
    query.snowpackFirmness === 'soft_wet_spring' ||
    query.snowpackFirmness === 'fresh_powder';

  // Base spacing: 2 climbers: 14m, 3 climbers: 12m, 4 climbers: 10m, 5 climbers: 8m.
  // Soft/powder snow widens spacing by 2m to prevent simultaneous bridge loading.
  const baseSpacing = team === 2 ? 14 : team === 3 ? 12 : team === 4 ? 10 : 8;
  const recommendedRopeSpacingMeters = isSoft ? baseSpacing + 2 : baseSpacing;

  // Brake knots strongly recommended for 2-person rope teams or soft snowpack.
  const brakeKnotsRecommended = team === 2 || isSoft;

  // Snow pickets: minimum team + 1 for firm firn, team + 2 for soft snow deadman anchors.
  const snowPicketCountRequired = team + (isSoft ? 2 : 1);

  // Pre-rigged ascending and arrest prusiks: 2 per climber (waist + foot loop).
  const preriggedPrusikCount = team * 2;

  let rescueHaulMechanicalAdvantage = '3:1 (Simple Z-Pulley system with tractor prusik)';
  if (query.rescueHaulSystem === 'c_pulley_2_to_1') {
    rescueHaulMechanicalAdvantage = '2:1 (Drop-loop / C-pulley for conscious climber)';
  } else if (query.rescueHaulSystem === 'compound_6_to_1') {
    rescueHaulMechanicalAdvantage =
      '6:1 (Compound 3:1 Z-pulley with 2:1 piggyback system for small teams)';
  }

  // Turnaround hours: ~60% into typical ascent, advanced earlier in soft spring snow.
  const baseTurnaround = Math.round(route.typicalAscentHours * 0.6);
  const glacierTurnaroundTimeHours = isSoft
    ? Math.max(4, baseTurnaround - 1)
    : baseTurnaround;

  let safetyAlert: string | undefined;
  if (team === 2) {
    safetyAlert =
      'Two-person rope teams lack self-arrest redundancy. Brake knots and pre-rigged ascending prusiks are vital for crevasse arrest and self-extrication.';
  } else if (isSoft) {
    safetyAlert =
      'Soft or unbonded snow reduces crevasse lip friction and snow anchor strength. Maintain maximum rope spacing and test all snow bridges.';
  } else if (route.crevasseRisk === 'extreme') {
    safetyAlert =
      'Extreme crevasse hazard with serac exposure. Enforce strict early alpine morning turnaround before solar warming.';
  }

  return {
    peakAndRouteName: `${route.peakName} — ${route.routeName}`,
    recommendedRopeSpacingMeters,
    brakeKnotsRecommended,
    snowPicketCountRequired,
    preriggedPrusikCount,
    rescueHaulMechanicalAdvantage,
    glacierTurnaroundTimeHours,
    safetyAlert,
  };
}

export function getGlacierGear(): GlacierGearItem[] {
  return GLACIER_GEAR;
}
