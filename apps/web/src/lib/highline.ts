export type HighlineDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type WebbingType = 'polyester_low_stretch' | 'nylon_tubular' | 'dyneema_uhmwpe';
export type WindExposureLevel =
  | 'sheltered_forest'
  | 'moderate_gusts'
  | 'high_crosswind'
  | 'extreme_thermals'
  | 'severe_crosswind';

export interface HighlineSpan {
  id: string;
  title: string;
  region: string;
  spanLengthM: number;
  voidExposureM: number;
  difficulty: HighlineDifficulty;
  primaryWebbing: WebbingType;
  backupWebbing: WebbingType;
  nominalTensionKn: number;
  anchorSystem: string;
  windExposure: WindExposureLevel;
  description: string;
  highlights: string[];
}

export interface RiggingCalculationQuery {
  spanId: string;
  walkerWeightKg: number; // 50 to 120 kg, default 75
  standingSagPercent: number; // 3% to 15%, default 6%
  dynamicLoadFactor: number; // 1.2 (walking), 1.8 (bounce), 2.5 (leash fall)
  anchorAngleDegrees: number; // 20 to 120 degrees, default 45
}

export interface RiggingCalculationResult {
  spanTitle: string;
  centerSagM: number;
  lineTensionKn: number;
  anchorLegLoadKn: number;
  webbingSafetyFactor: number;
  minVoidClearanceM: number;
  riggingAdvisory: string;
  safetyStatus: 'safe' | 'caution' | 'critical';
}

export interface HighlineGearItem {
  id: string;
  name: string;
  category:
    | 'safety_leash'
    | 'redundancy'
    | 'rigging_hardware'
    | 'tensioning'
    | 'edge_protection'
    | 'oscillation_control';
  mandatory: boolean;
  description: string;
}

export const HIGHLINE_SPANS: HighlineSpan[] = [
  {
    id: 'yosemite-taft-point-highline',
    title: 'Taft Point Fissures Alpine Highline',
    region: 'Yosemite National Park, CA',
    spanLengthM: 65,
    voidExposureM: 850,
    difficulty: 'advanced',
    primaryWebbing: 'polyester_low_stretch',
    backupWebbing: 'dyneema_uhmwpe',
    nominalTensionKn: 3.5,
    anchorSystem: 'Multi-bolt equalized master point with quad redundancy',
    windExposure: 'high_crosswind',
    description:
      'Exposed granite fissure crossing with dramatic vertical drop over the valley, requiring wind dampening and heavy padding.',
    highlights: [
      '850m vertical air exposure',
      'Granite edge multi-layer padding',
      'Wind oscillation dampening required',
    ],
  },
  {
    id: 'moab-fruit-bowl-canyon',
    title: 'Moab Fruit Bowl Red Rock Canyon Span',
    region: 'Moab Desert, UT',
    spanLengthM: 110,
    voidExposureM: 140,
    difficulty: 'expert',
    primaryWebbing: 'nylon_tubular',
    backupWebbing: 'polyester_low_stretch',
    nominalTensionKn: 4.8,
    anchorSystem: 'Natural sandstone horn wrap and multi-directional equalized ground anchors',
    windExposure: 'moderate_gusts',
    description:
      'Long desert canyon crossing with high dynamic sag and deep pendulum swing potential over sandstone amphitheater.',
    highlights: [
      '110m longline sag dynamics',
      'Natural sandstone friction wraps',
      'Leash-fall deep arc buffer',
    ],
  },
  {
    id: 'smith-rock-monkey-face-highline',
    title: 'Monkey Face Tower Alpine Highline',
    region: 'Smith Rock State Park, OR',
    spanLengthM: 45,
    voidExposureM: 110,
    difficulty: 'intermediate',
    primaryWebbing: 'polyester_low_stretch',
    backupWebbing: 'nylon_tubular',
    nominalTensionKn: 3.2,
    anchorSystem: 'Welded cold-shut expansion anchors with redundant steel master rings',
    windExposure: 'extreme_thermals',
    description:
      'Classic spire-to-mesa traverse across basalt columns with turbulent afternoon thermal updrafts.',
    highlights: [
      'Basalt spire summit anchor',
      'Thermal updraft stabilizers',
      'Compact pulley tensioning',
    ],
  },
  {
    id: 'castle-valley-rectory-span',
    title: 'Castle Valley Priest-to-Rectory Gap',
    region: 'Castle Valley, UT',
    spanLengthM: 85,
    voidExposureM: 300,
    difficulty: 'expert',
    primaryWebbing: 'dyneema_uhmwpe',
    backupWebbing: 'polyester_low_stretch',
    nominalTensionKn: 5.2,
    anchorSystem: 'Equalized quad-point stainless steel resin capsule glue-ins',
    windExposure: 'severe_crosswind',
    description:
      'High-consequence desert tower gap rigged between crumbling wingate sandstone spires requiring pristine tension vector angles.',
    highlights: [
      'Tower-to-tower rigging',
      'Sub-60° vector master point',
      'T-loop tape backup interweave',
    ],
  },
  {
    id: 'index-town-walls-practice-highline',
    title: 'Lower Town Wall Intro Highline',
    region: 'Index, WA',
    spanLengthM: 32,
    voidExposureM: 45,
    difficulty: 'beginner',
    primaryWebbing: 'polyester_low_stretch',
    backupWebbing: 'polyester_low_stretch',
    nominalTensionKn: 2.8,
    anchorSystem: 'Bombproof granite twin-tree and triple-bolt equalized anchor',
    windExposure: 'sheltered_forest',
    description:
      'Accessible entry-level alpine highline over sheltered granite amphitheater, perfect for leash-fall training and rigging practice.',
    highlights: [
      'Tree-pro tree wraps with carpet',
      'Low exposure learning line',
      'Simple 5:1 Buckingham pulley setup',
    ],
  },
];

export const HIGHLINE_GEAR: HighlineGearItem[] = [
  {
    id: 'highline-leash-dual-rings',
    name: 'Climbing-Rated Highline Dynamic Leash with Dual Steel Rings',
    category: 'safety_leash',
    mandatory: true,
    description:
      'Dynamic rope core with tubular webbing sheath, twin forged steel connection rings, and taped figure-8 knots.',
  },
  {
    id: 'independent-backup-webbing',
    name: 'Full-Length Redundant Backup Webbing & T-Loop Taping',
    category: 'redundancy',
    mandatory: true,
    description:
      'Dedicated secondary line rigged slack beneath mainline, interconnected with T-loops or tape every 2-3 meters to avoid wind whip.',
  },
  {
    id: 'weblock-anchor-devices',
    name: 'High-Efficiency Webbing Anchor Friction Weblocks (x2)',
    category: 'rigging_hardware',
    mandatory: true,
    description:
      'Machined aluminum or steel weblocks with large diverter pins retaining 90%+ of webbing MBS (minimum breaking strength).',
  },
  {
    id: 'buckingham-pulley-system',
    name: '5:1 Buckingham Mechanical Advantage Tensioning System',
    category: 'tensioning',
    mandatory: true,
    description:
      'Lightweight line-grip and pulley system for dialing in exact line tension without leaving heavy pulleys under tension.',
  },
  {
    id: 'heavy-duty-edge-pads',
    name: 'Heavy-Duty Ballistic Cordura Edge Protection & Carpet',
    category: 'edge_protection',
    mandatory: true,
    description:
      'Multi-ply abrasive-resistant carpet and Velcro cordura sleeves protecting anchor slings from razor-sharp rock edges.',
  },
  {
    id: 'wind-dampener-wind-sock',
    name: 'Aerodynamic Wind Sock Dampeners & Stabilizer Slings',
    category: 'oscillation_control',
    mandatory: true,
    description:
      'Attached midway on lines >50m to disrupt resonant wind vortex shedding and suppress violent galloping oscillations.',
  },
];

export function getHighlineSpans(difficulty?: HighlineDifficulty): HighlineSpan[] {
  if (!difficulty) {
    return HIGHLINE_SPANS;
  }
  return HIGHLINE_SPANS.filter((span) => span.difficulty === difficulty);
}

export function getHighlineSpanById(id: string): HighlineSpan | undefined {
  return HIGHLINE_SPANS.find((span) => span.id === id);
}

export function getHighlineGear(): HighlineGearItem[] {
  return HIGHLINE_GEAR;
}

export function calculateRiggingPhysics(query: RiggingCalculationQuery): RiggingCalculationResult {
  const span = getHighlineSpanById(query.spanId);
  if (!span) {
    throw new Error(`Highline span with id "${query.spanId}" not found.`);
  }

  const centerSagM = Math.round(span.spanLengthM * (query.standingSagPercent / 100) * 100) / 100;
  const theta = Math.atan((4 * centerSagM) / span.spanLengthM);
  const loadKn = (query.walkerWeightKg * 9.81 * query.dynamicLoadFactor) / 1000;
  const lineTensionKn = Math.round((loadKn / (2 * Math.sin(theta))) * 10) / 10;
  const radAlpha = (query.anchorAngleDegrees * Math.PI) / 180;
  const anchorLegLoadKn = Math.round((lineTensionKn / (2 * Math.cos(radAlpha / 2))) * 10) / 10;
  const webbingSafetyFactor = Math.round((30.0 / lineTensionKn) * 10) / 10;
  const minVoidClearanceM = Math.round((centerSagM + 3.0) * 10) / 10;

  let safetyStatus: 'safe' | 'caution' | 'critical' = 'safe';
  let riggingAdvisory = '';

  if (
    query.anchorAngleDegrees > 90 ||
    webbingSafetyFactor < 4.0 ||
    minVoidClearanceM > span.voidExposureM
  ) {
    safetyStatus = 'critical';
    if (query.anchorAngleDegrees > 90) {
      riggingAdvisory = `CRITICAL: Anchor angle (${query.anchorAngleDegrees}°) exceeds 90° limit, severely multiplying anchor leg vector force! Re-rig anchor legs to under 60°.`;
    } else if (webbingSafetyFactor < 4.0) {
      riggingAdvisory = `CRITICAL: Webbing safety factor (${webbingSafetyFactor}:1) is below 4:1 minimum highline safety threshold! Increase sag percent or decrease dynamic impact load.`;
    } else {
      riggingAdvisory = `CRITICAL: Required void clearance (${minVoidClearanceM}m) exceeds available void exposure (${span.voidExposureM}m)! High risk of deck impact.`;
    }
  } else if (
    query.anchorAngleDegrees > 60 ||
    lineTensionKn > 6.0 ||
    webbingSafetyFactor < 6.0
  ) {
    safetyStatus = 'caution';
    if (query.anchorAngleDegrees > 60) {
      riggingAdvisory = `Caution: Anchor angle (${query.anchorAngleDegrees}°) exceeds 60° recommendation. Anchor leg loads are amplified beyond nominal tension.`;
    } else if (lineTensionKn > 6.0) {
      riggingAdvisory = `Caution: Midpoint line tension exceeds 6.0 kN (${lineTensionKn} kN). Use reinforced weblocks and double-check anchor equalization.`;
    } else {
      riggingAdvisory = `Caution: Webbing safety factor (${webbingSafetyFactor}:1) is under recommended 6:1 margin. Monitor line wear and inspect backup interweave.`;
    }
  } else {
    riggingAdvisory = `Nominal highline rigging configuration: Line tension (${lineTensionKn} kN) and webbing safety factor (${webbingSafetyFactor}:1) are well within safety standards. Anchor angle (${query.anchorAngleDegrees}°) provides balanced load sharing.`;
  }

  return {
    spanTitle: span.title,
    centerSagM,
    lineTensionKn,
    anchorLegLoadKn,
    webbingSafetyFactor,
    minVoidClearanceM,
    riggingAdvisory,
    safetyStatus,
  };
}
