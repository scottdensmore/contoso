export type RiggingSetup =
  | 'sidemount_dual_cylinder'
  | 'backmount_manifold_doubles'
  | 'closed_circuit_rebreather_ccr';

export type FlowType =
  | 'inflowing_siphon_suction'
  | 'outflowing_spring_resurgence'
  | 'static_slack_phreatic';

export type ReserveRule =
  | 'rule_of_thirds'
  | 'rule_of_sixths'
  | 'rule_of_quarters';

export type SiltRisk =
  | 'low_rock_floor'
  | 'moderate_sand_drift'
  | 'extreme_clay_zero_vis';

export type PenetrationSafety =
  | 'nominal_safe_turn'
  | 'caution_flow_resistance'
  | 'critical_gas_reserve_alert';

export interface CaveDivingSite {
  id: string;
  title: string;
  region: string;
  system: string;
  maxDepthMeters: number;
  waterTempC: number;
  flowType: FlowType;
  primaryRigging: RiggingSetup;
  sumpLengthMeters: number;
  siltRisk: SiltRisk;
  description: string;
  highlights: string[];
}

export interface CaveDivingQuery {
  siteId: string;
  riggingSetup: RiggingSetup;         // default 'sidemount_dual_cylinder'
  startingPressurePsi: number;        // 2400 to 3600 psi, default 3000
  reserveRule: ReserveRule;           // default 'rule_of_thirds'
  plannedPenetrationMeters: number;   // 20 to 300 meters, default 120
  flowType: FlowType;                 // default 'static_slack_phreatic'
}

export interface CaveDivingResult {
  siteTitle: string;
  riggingSetup: RiggingSetup;
  turnPressurePsi: number;
  usableGasPsi: number;
  reserveGasPsi: number;
  guidelineSpoolRequiredMeters: number;
  penetrationSafety: PenetrationSafety;
  siltRisk: SiltRisk;
  gasManagementAdvisory: string;
  decompressionAdvisory: string;
}

export interface CaveDivingGearItem {
  id: string;
  name: string;
  category: 'guideline' | 'lighting' | 'gas_management' | 'safety' | 'navigation' | 'exposure';
  mandatory: boolean;
  description: string;
}

export const CAVE_DIVING_SITES: CaveDivingSite[] = [
  {
    id: 'peacock-springs-karst',
    title: 'Peacock Springs Karst Siphon & Grand Traverse',
    region: 'Luraville, Florida, USA',
    system: 'Wes Skiles Peacock Springs State Park',
    maxDepthMeters: 20,
    waterTempC: 21,
    flowType: 'static_slack_phreatic',
    primaryRigging: 'sidemount_dual_cylinder',
    sumpLengthMeters: 850,
    siltRisk: 'moderate_sand_drift',
    description:
      'A legendary freshwater karst maze with intricate bedding-plane squeezes and low ceiling restriction conduits.',
    highlights: [
      'Interconnected cavern and cave passages',
      'Low bedding-plane restriction squeezes',
      'Permanent golden guideline navigation',
    ],
  },
  {
    id: 'ginnie-springs-devil-system',
    title: "Devil's Eye & Ear Spring Trunk Conduit",
    region: 'High Springs, Florida, USA',
    system: 'Santa Fe River Karst Basin',
    maxDepthMeters: 30,
    waterTempC: 22,
    flowType: 'outflowing_spring_resurgence',
    primaryRigging: 'backmount_manifold_doubles',
    sumpLengthMeters: 1200,
    siltRisk: 'low_rock_floor',
    description:
      'High-volume crystal clear artesian spring system rushing through deep limestone rifts and deep bone-white limestone rooms.',
    highlights: [
      'Heavy outflowing current resistance',
      "Devil's Ear high-flow limestone fissure",
      'Rule of Thirds deep trunk exploration',
    ],
  },
  {
    id: 'cholla-sump-lost-creek',
    title: 'Lost Creek Siphon Sump Penetration',
    region: 'Bighorn Mountains, Wyoming, USA',
    system: 'Tongue River Karst Highlands',
    maxDepthMeters: 18,
    waterTempC: 4,
    flowType: 'inflowing_siphon_suction',
    primaryRigging: 'sidemount_dual_cylinder',
    sumpLengthMeters: 320,
    siltRisk: 'extreme_clay_zero_vis',
    description:
      'High-altitude freezing alpine mountain sump requiring dry cave gear portaging and tight mud-floor siphon penetration.',
    highlights: [
      'Freezing 4°C alpine glacial water',
      'High-suction siphon drag dynamics',
      'Zero-visibility clay silt disturbance risks',
    ],
  },
  {
    id: 'phantom-lake-spring',
    title: 'Phantom Lake Cave Siphon Deep Conduit',
    region: 'Toyahvale, Texas, USA',
    system: 'Balmorhea Artesian Karst System',
    maxDepthMeters: 45,
    waterTempC: 20,
    flowType: 'static_slack_phreatic',
    primaryRigging: 'closed_circuit_rebreather_ccr',
    sumpLengthMeters: 1600,
    siltRisk: 'low_rock_floor',
    description:
      'Massive submerged subterranean conduit extending deep into West Texas desert aquifer rifts requiring helium trimix schedules.',
    highlights: [
      'Deep 45m phreatic aquifer trunk',
      'Helium trimix and rebreather depth staging',
      'Historic underwater scientific exploration',
    ],
  },
  {
    id: 'tuckaleechee-caverns-sump',
    title: 'Smoky Mountain Tuckaleechee Siphon Resurgence',
    region: 'Townsend, Tennessee, USA',
    system: 'Great Smoky Mountains Karst',
    maxDepthMeters: 25,
    waterTempC: 12,
    flowType: 'outflowing_spring_resurgence',
    primaryRigging: 'sidemount_dual_cylinder',
    sumpLengthMeters: 450,
    siltRisk: 'extreme_clay_zero_vis',
    description:
      'Cold Appalachian limestone rift sumps with sudden silting and intricate multi-jump finger spool navigation.',
    highlights: [
      'Cold Appalachian mountain runoff',
      'Multiple jump reel line transitions',
      'Restricted vertical fissure squeezes',
    ],
  },
];

export const CAVE_DIVING_GEAR: CaveDivingGearItem[] = [
  {
    id: 'primary-safety-guideline-reels',
    name: '400ft Anodized Aluminum Primary Reel & Two Safety Finger Spools with Line Arrows',
    category: 'guideline',
    mandatory: true,
    description:
      'Unbroken physical lifeline to the entrance, essential for surviving total zero-visibility silt-outs',
  },
  {
    id: 'redundant-led-dive-lights',
    name: '1500-Lumen Primary Canister Light & Two Independent Backup LED Torches',
    category: 'lighting',
    mandatory: true,
    description:
      'NSS-CDS rule of three independent submersible light sources with minimum 4-hour burn times',
  },
  {
    id: 'sidemount-dual-regulator-kit',
    name: 'Sealed Diaphragm First Stages with 7ft Long Hose and Right-Angle Swivels',
    category: 'gas_management',
    mandatory: true,
    description:
      'Environmentally sealed cold-water regulators ensuring redundant gas delivery through tight restriction passes',
  },
  {
    id: 'dual-cutting-devices',
    name: 'Serrated Line Cutter Titanium Z-Knife and Stainless Trauma Shears',
    category: 'safety',
    mandatory: true,
    description:
      'Instantly frees diver from entangling old line, mono-filament, or debris without puncturing drysuit',
  },
  {
    id: 'underwater-dive-slate-markers',
    name: 'Submersible Wrist Slate, Waterproof Pencil & Directional Line Markers',
    category: 'navigation',
    mandatory: true,
    description:
      'Directional line arrows pointing exit way and non-directional cookies marking personal jump tees',
  },
  {
    id: 'drysuit-crush-resistant-boots',
    name: 'High-Durability Cordura Karst Drysuit with Heavy Kevlar Kneepads',
    category: 'exposure',
    mandatory: true,
    description:
      'Protects against hypothermia and sharp jagged limestone abrasions in overhead sump squeezes',
  },
];

export function getCaveDivingSites(rigging?: RiggingSetup): CaveDivingSite[] {
  if (!rigging) {
    return CAVE_DIVING_SITES;
  }
  return CAVE_DIVING_SITES.filter((site) => site.primaryRigging === rigging);
}

export function getCaveDivingSiteById(id: string): CaveDivingSite | undefined {
  return CAVE_DIVING_SITES.find((site) => site.id === id);
}

export function getCaveDivingGearChecklist(): CaveDivingGearItem[] {
  return CAVE_DIVING_GEAR;
}

export function calculateCaveDivingGas(query: CaveDivingQuery): CaveDivingResult {
  const site = getCaveDivingSiteById(query.siteId) ?? CAVE_DIVING_SITES[0];

  let usableFraction = 1 / 3;
  if (query.reserveRule === 'rule_of_sixths') {
    usableFraction = 1 / 6;
  } else if (query.reserveRule === 'rule_of_quarters') {
    usableFraction = 1 / 4;
  }

  const usableGasPsi = Math.round(query.startingPressurePsi * usableFraction);
  const turnPressurePsi = query.startingPressurePsi - usableGasPsi;
  const reserveGasPsi = query.startingPressurePsi - usableGasPsi;
  const guidelineSpoolRequiredMeters = Math.round(query.plannedPenetrationMeters * 1.25) + 50;

  let penetrationSafety: PenetrationSafety = 'nominal_safe_turn';
  if (query.flowType === 'inflowing_siphon_suction') {
    if (query.reserveRule !== 'rule_of_sixths') {
      penetrationSafety = 'critical_gas_reserve_alert';
    } else {
      penetrationSafety = 'nominal_safe_turn';
    }
  } else if (query.flowType === 'outflowing_spring_resurgence') {
    penetrationSafety = 'nominal_safe_turn';
  } else if (query.flowType === 'static_slack_phreatic') {
    if (query.plannedPenetrationMeters > 200) {
      penetrationSafety = 'caution_flow_resistance';
    } else {
      penetrationSafety = 'nominal_safe_turn';
    }
  }

  let gasManagementAdvisory: string;
  if (query.flowType === 'inflowing_siphon_suction') {
    if (penetrationSafety === 'critical_gas_reserve_alert') {
      gasManagementAdvisory =
        'CRITICAL GAS ALERT: Inflowing siphon suction actively draws divers inward, creating dangerous water drag against egress. Rule of Thirds or Quarters will result in gas starvation on exit; strict Rule of Sixths (1/6 gas turn) is mandatory.';
    } else {
      gasManagementAdvisory =
        'Siphon Inflow Protocols Engaged: Rule of Sixths reserves 5/6ths cylinder capacity (2500+ psi) to overcome downstream flow resistance during sump egress.';
    }
  } else if (query.flowType === 'outflowing_spring_resurgence') {
    gasManagementAdvisory =
      'Spring Resurgence Advantage: Heavy outflowing current provides natural swimming assistance during exit. Standard Rule of Thirds provides solid reserve margin against upstream delays.';
  } else {
    if (query.plannedPenetrationMeters > 200) {
      gasManagementAdvisory =
        'Long-Range Penetration Caution: Distance beyond 200m in static conduits increases physical fatigue and swimming duration. Verify reserve turn pressures and stage bottles.';
    } else {
      gasManagementAdvisory =
        'Nominal Static Phreatic Protocol: Balanced swimming effort on penetration and exit. Standard Rule of Thirds maintains adequate reserve for air sharing or line entanglement.';
    }
  }

  let decompressionAdvisory: string;
  if (site.maxDepthMeters >= 40 || query.riggingSetup === 'closed_circuit_rebreather_ccr') {
    decompressionAdvisory =
      'Deep Conduit Helium & Deco Staging: Depths exceed 40m. Tri-mix diluent and staged decompression cylinders (50% & 100% O2) required to manage inert gas narcosis and mandatory decompression ceilings.';
  } else if (site.maxDepthMeters >= 25) {
    decompressionAdvisory =
      'Moderate Depth Overhead Profile: Monitor bottom time and nitrogen loading closely. An unplanned silt-out delay will rapidly trigger mandatory in-water decompression stops.';
  } else {
    decompressionAdvisory =
      'Shallow Karst Bedding Profile: Depths stay within 20m, reducing decompression ceiling risks, but strict overhead confinement requires flawless buoyancy to prevent silt blinding.';
  }

  return {
    siteTitle: site.title,
    riggingSetup: query.riggingSetup,
    turnPressurePsi,
    usableGasPsi,
    reserveGasPsi,
    guidelineSpoolRequiredMeters,
    penetrationSafety,
    siltRisk: site.siltRisk,
    gasManagementAdvisory,
    decompressionAdvisory,
  };
}
