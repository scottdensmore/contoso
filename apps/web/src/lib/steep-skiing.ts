export type CouloirGrade =
  | 'Class_1_Moderate_40_45'
  | 'Class_2_Steep_45_50'
  | 'Class_3_Extreme_50_55'
  | 'Class_4_Exposed_55_plus';

export type SnowSurface =
  | 'packed_powder'
  | 'wind_slab'
  | 'chalk_firm'
  | 'corn_ice_firm'
  | 'crust_unconsolidated';

export type DescentStyle =
  | 'fluid_turns'
  | 'hop_turns'
  | 'side_slipping_choke'
  | 'ski_belay_rappel';

export interface CouloirDescent {
  id: string;
  name: string;
  mountain: string;
  range: string;
  grade: CouloirGrade;
  maxSlopeAngleDeg: number;
  averageSlopeAngleDeg: number;
  verticalDropMeters: number;
  chokeWidthMeters: number;
  aspect: string;
  description: string;
  highlights: string[];
}

export interface CouloirCalculationQuery {
  couloirId: string;
  slopeAngleDeg: number;         // 40 to 60 deg
  snowSurface: SnowSurface;
  skierWeightKg: number;         // 50 to 110 kg
  sluffReleaseDistanceMeters: number; // 5 to 50m
}

export interface CouloirCalculationResult {
  couloirName: string;
  sluffVelocityKmH: number;
  hopTurnEdgeLoadN: number;
  fallConsequenceIndex: 'moderate_arrestable' | 'severe_injury_risk' | 'catastrophic_unmitigated';
  recommendedStyle: DescentStyle;
  sluffManagementStrategy: string;
  chokeWarning?: string;
}

export interface SteepSkiingGearItem {
  id: string;
  name: string;
  category: 'axes' | 'crampons' | 'rope_rad' | 'airbag' | 'snow_anchor' | 'helmet';
  mandatory: boolean;
  description: string;
}

export const COULOIR_DESCENTS: CouloirDescent[] = [
  {
    id: 'corbets-couloir-jackson',
    name: "Corbet's Couloir & S&S Chute",
    mountain: 'Rendezvous Mountain',
    range: 'Teton Range, WY',
    grade: 'Class_2_Steep_45_50',
    maxSlopeAngleDeg: 50,
    averageSlopeAngleDeg: 46,
    verticalDropMeters: 180,
    chokeWidthMeters: 3.5,
    aspect: 'East',
    description: "America's most storied in-bounds couloir featuring a 10-to-20 foot mandatory cornice drop, rock funnel walls, and 50-degree chalk turns.",
    highlights: [
      'Mandatory cornice entry air',
      'Narrow rock gate funnel',
      'Wind-buffed chalk turns',
    ],
  },
  {
    id: 'tuckerman-ravine-headwall',
    name: 'Tuckerman Ravine — The Lip & Center Headwall',
    mountain: 'Mount Washington',
    range: 'White Mountains, NH',
    grade: 'Class_3_Extreme_50_55',
    maxSlopeAngleDeg: 55,
    averageSlopeAngleDeg: 51,
    verticalDropMeters: 320,
    chokeWidthMeters: 4.0,
    aspect: 'East',
    description: 'Iconic glacial cirque headwall renowned for extreme 55-degree pitches, gaping bergschrund crevasses, and variable Atlantic freeze-thaw snowpacks.',
    highlights: [
      'Spring headwall corn turns',
      'Bergschrund gaping schrund jump',
      'Lunch Rocks spectator bowl',
    ],
  },
  {
    id: 'silver-couloir-buffalo',
    name: 'Silver Couloir — Buffalo Mountain',
    mountain: 'Buffalo Mountain',
    range: 'Gore Range, CO',
    grade: 'Class_2_Steep_45_50',
    maxSlopeAngleDeg: 48,
    averageSlopeAngleDeg: 45,
    verticalDropMeters: 915,
    chokeWidthMeters: 2.8,
    aspect: 'North',
    description: 'Aesthetic 3,000-vertical-foot direct plummet down Buffalo Mountain with continuous high-angle fall lines and an intimidating rocky choke midway down.',
    highlights: [
      '3,000 vertical feet continuous pitch',
      'Mid-couloir rocky choke constriction',
      'Protected cold northern powder',
    ],
  },
  {
    id: 'terminal-cancer-couloir',
    name: 'Terminal Cancer Couloir',
    mountain: 'Ruby Dome Massif',
    range: 'Ruby Mountains, NV',
    grade: 'Class_2_Steep_45_50',
    maxSlopeAngleDeg: 46,
    averageSlopeAngleDeg: 43,
    verticalDropMeters: 550,
    chokeWidthMeters: 2.0,
    aspect: 'North',
    description: 'A surreal 14-foot wide vertical limestone slot canyon dropping dead-straight for 1,800 feet down the Ruby Mountains like a knife slice through rock.',
    highlights: [
      '14-foot razor-thin slot walls',
      'Dead-straight continuous fall line',
      'Pencil-thin hop-turn rhythm',
    ],
  },
  {
    id: 'mount-superior-south-face',
    name: 'Mount Superior — South Face & Suicide Chute',
    mountain: 'Mount Superior',
    range: 'Wasatch Range, UT',
    grade: 'Class_3_Extreme_50_55',
    maxSlopeAngleDeg: 52,
    averageSlopeAngleDeg: 47,
    verticalDropMeters: 890,
    chokeWidthMeters: 3.0,
    aspect: 'South',
    description: 'The Wasatch premier extreme face directly overlooking Little Cottonwood Canyon highway, demanding sunrise timing before solar thermal deterioration.',
    highlights: [
      'Exposed knife-edge ridge entry',
      'Solar aspect spring corn cycle',
      'Highway 210 direct finish apron',
    ],
  },
];

export const STEEP_SKIING_GEAR: SteepSkiingGearItem[] = [
  {
    id: 'technical-ski-mountaineering-axes',
    name: 'Curved Ski Mountaineering Ice Axes (Pair)',
    category: 'axes',
    mandatory: true,
    description: 'Ultralight technical steel-pick axes with dual hand rests, hammer/adze heads, and spike spikes for self-arrest in 50° firm snow.',
  },
  {
    id: 'certified-ski-crampons',
    name: 'CNC Machined High-Angle Ski Crampons (Harscheisen)',
    category: 'crampons',
    mandatory: true,
    description: 'Waist-matched binding ski crampons providing mechanical lateral bite into frozen 45° sidehill skin tracks before booting.',
  },
  {
    id: 'ultralight-ski-rad-line',
    name: '30m 6mm Hyperstatic Aramid RAD Rappel Line & Micro Traxion',
    category: 'rope_rad',
    mandatory: true,
    description: 'Hyperstatic aramid cord with progress-capture pulley for crevasse extraction and un-skiable choke cliff rappels.',
  },
  {
    id: 'ski-carry-airbag-backpack',
    name: '30L Avalanche Airbag Pack with Diagonal/A-Frame Ski Carry',
    category: 'airbag',
    mandatory: true,
    description: 'Electronic or canister airbag pack reinforced with cut-resistant Dyneema ski carry straps and ice axe tool garages.',
  },
  {
    id: 'aluminum-snow-stake-fluke',
    name: 'Forged Aluminum T-Slot Snow Picket & Deadman Fluke',
    category: 'snow_anchor',
    mandatory: true,
    description: 'Aircraft aluminum anchor picket for driving deep deadman anchors or snow bollards to ski-belay steep icy entrances.',
  },
  {
    id: 'triple-certified-ski-climbing-helmet',
    name: 'Dual/Triple-Certified Climbing & Ski Mountaineering Helmet',
    category: 'helmet',
    mandatory: true,
    description: 'Multi-impact helmet certified to EN 12492 (mountaineering rockfall) and EN 1077 (alpine ski crash) standards.',
  },
];

const FRICTION_COEFFICIENTS: Record<SnowSurface, number> = {
  packed_powder: 0.28,
  wind_slab: 0.20,
  chalk_firm: 0.32,
  corn_ice_firm: 0.15,
  crust_unconsolidated: 0.22,
};

export function getCouloirDescents(grade?: CouloirGrade): CouloirDescent[] {
  if (!grade) return COULOIR_DESCENTS;
  return COULOIR_DESCENTS.filter((couloir) => couloir.grade === grade);
}

export function getCouloirDescentById(id: string): CouloirDescent | undefined {
  return COULOIR_DESCENTS.find((couloir) => couloir.id === id);
}

export function getSteepSkiingGear(): SteepSkiingGearItem[] {
  return STEEP_SKIING_GEAR;
}

export function calculateCouloirDynamics(
  query: CouloirCalculationQuery,
): CouloirCalculationResult {
  const couloir = getCouloirDescentById(query.couloirId);
  if (!couloir) {
    throw new Error(`Couloir not found: ${query.couloirId}`);
  }

  const theta = (query.slopeAngleDeg * Math.PI) / 180;
  const mu = FRICTION_COEFFICIENTS[query.snowSurface] ?? 0.25;

  const accel = Math.max(0.5, 9.81 * (Math.sin(theta) - mu * Math.cos(theta)));
  const sluffVelocityMs = Math.sqrt(2 * accel * query.sluffReleaseDistanceMeters);
  const sluffVelocityKmH = Math.round(sluffVelocityMs * 3.6 * 10) / 10;

  // Hop-turn edge impact force:
  // Landing velocity from jump: base ~2.2 m/s. deltaT = 0.12s.
  const hopTurnEdgeLoadN = Math.round(
    ((query.skierWeightKg * 2.2) / 0.12) * Math.cos(theta) +
      query.skierWeightKg * 9.81 * Math.cos(theta),
  );

  let fallConsequenceIndex: CouloirCalculationResult['fallConsequenceIndex'];
  if (
    query.slopeAngleDeg >= 53 ||
    (query.slopeAngleDeg >= 48 && query.snowSurface === 'corn_ice_firm')
  ) {
    fallConsequenceIndex = 'catastrophic_unmitigated';
  } else if (
    query.slopeAngleDeg >= 46 ||
    query.snowSurface === 'wind_slab'
  ) {
    fallConsequenceIndex = 'severe_injury_risk';
  } else {
    fallConsequenceIndex = 'moderate_arrestable';
  }

  let recommendedStyle: DescentStyle;
  if (query.slopeAngleDeg >= 52) {
    recommendedStyle = 'ski_belay_rappel';
  } else if (couloir.chokeWidthMeters <= 2.2) {
    recommendedStyle = 'side_slipping_choke';
  } else if (
    query.slopeAngleDeg >= 45 ||
    query.snowSurface === 'chalk_firm'
  ) {
    recommendedStyle = 'hop_turns';
  } else {
    recommendedStyle = 'fluid_turns';
  }

  let sluffManagementStrategy: string;
  if (sluffVelocityKmH > 35) {
    sluffManagementStrategy =
      'High-velocity sluff hazard: Ski down-and-cut rhythm; make 2-3 turns then pull onto protected rock ribs to let sluff run past.';
  } else {
    sluffManagementStrategy =
      'Controlled sluff hazard: Maintain deliberate rhythm, manage sluff runouts behind turns, and pause on safe shoulders.';
  }

  let chokeWarning: string | undefined;
  if (couloir.chokeWidthMeters <= 2.5) {
    chokeWarning =
      'Extreme choke restriction (<2.5m): Narrower than ski turn radius. Use methodical side-slipping with ice axe held in uphill hand.';
  }

  return {
    couloirName: couloir.name,
    sluffVelocityKmH,
    hopTurnEdgeLoadN,
    fallConsequenceIndex,
    recommendedStyle,
    sluffManagementStrategy,
    chokeWarning,
  };
}
