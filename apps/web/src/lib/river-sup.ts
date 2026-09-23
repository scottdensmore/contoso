export type RiverDifficulty = 'class_ii' | 'class_iii' | 'class_iv';
export type FinType = 'retractable_click_fin' | 'short_flexible_river_fins' | 'standard_long_touring_fin';
export type LeashType = 'torso_quick_release' | 'ankle_fixed_coiled' | 'none';
export type SupSafetyStatus = 'approved' | 'caution_expert_only' | 'hazardous_prohibited';

export interface RiverSupRun {
  id: string;
  title: string;
  riverSystem: string;
  region: string;
  difficulty: RiverDifficulty;
  lengthMiles: number;
  gradientFtPerMile: number;
  flowRangeCfs: string;
  typicalDurationHours: number;
  description: string;
  highlights: string[];
}

export interface RiverSupQuery {
  runId: string;
  paddlerWeightKg: number; // 45 to 130 kg, default 75
  gearWeightKg: number; // 0 to 30 kg, default 5
  boardVolumeLiters: number; // 220 to 380 L, default 310
  riverFlowCfs: number; // 400 to 6000 CFS, default 1500
  finType: FinType;
  leashType: LeashType;
}

export interface RiverSupResult {
  runTitle: string;
  totalPayloadKg: number;
  volumeToWeightRatio: number;
  buoyancyRating: string;
  stabilityIndexPercent: number;
  finClearanceStatus: string;
  leashSafetyStatus: string;
  safetyStatus: SupSafetyStatus;
  paddlingAdvisory: string;
}

export interface RiverSupGearItem {
  id: string;
  name: string;
  category: 'leash_safety' | 'buoyancy' | 'head_protection' | 'fins' | 'propulsion' | 'footwear';
  mandatory: boolean;
  description: string;
}

export const RIVER_SUP_RUNS: RiverSupRun[] = [
  {
    id: 'arkansas-river-browns-canyon',
    title: 'Browns Canyon National Monument',
    riverSystem: 'Arkansas River',
    region: 'Salida/Buena Vista, CO, USA',
    difficulty: 'class_iii',
    lengthMiles: 14,
    gradientFtPerMile: 28,
    flowRangeCfs: '800 - 2,200 CFS',
    typicalDurationHours: 4.5,
    description:
      'Iconic granite canyon corridor carving through Colorado high country, offering continuous wavetrains, crisp eddy lines, and dramatic Collegiate Peaks scenery.',
    highlights: [
      'Canyon punchy wavetrains',
      'Continuous granite boulder gardens',
      'Zoeller & Seidel eddy lines',
    ],
  },
  {
    id: 'white-salmon-husum',
    title: 'Middle White Salmon River',
    riverSystem: 'White Salmon River',
    region: 'BZ Corners, WA, USA',
    difficulty: 'class_iv',
    lengthMiles: 6,
    gradientFtPerMile: 45,
    flowRangeCfs: '900 - 2,500 CFS',
    typicalDurationHours: 3.0,
    description:
      'Lush Pacific Northwest volcanic gorge featuring cold glacier melt, high-consequence basalt drops, intense boil lines, and technical mandatory scout rapids.',
    highlights: [
      'Lush basalt canyon gorges',
      'Punchy hydraulic holes',
      'Husum Falls portage option',
    ],
  },
  {
    id: 'french-broad-section-9',
    title: 'French Broad River (Section 9)',
    riverSystem: 'French Broad River',
    region: 'Marshall to Hot Springs, NC, USA',
    difficulty: 'class_iii',
    lengthMiles: 8.5,
    gradientFtPerMile: 24,
    flowRangeCfs: '1,200 - 4,000 CFS',
    typicalDurationHours: 3.5,
    description:
      'Warm Appalachian free-flowing waterway with sprawling boulder gardens, forgiving wave trains, and the signature Kayaker\'s Ledge and Frank Bell\'s rapid drops.',
    highlights: [
      'Warm Appalachian free-flowing water',
      'Wide technical eddy hopping',
      'Frank Bell\'s Rapid drop',
    ],
  },
  {
    id: 'deschutes-maupin-run',
    title: 'Lower Deschutes (Maupin Reach)',
    riverSystem: 'Deschutes River',
    region: 'Maupin, OR, USA',
    difficulty: 'class_iii',
    lengthMiles: 10,
    gradientFtPerMile: 22,
    flowRangeCfs: '3,500 - 5,500 CFS',
    typicalDurationHours: 4.0,
    description:
      'High-desert basalt canyon run showcasing massive volume wave trains, broad turbulent eddies, and famous whitewater playground rapids like Boxcar and Oak Springs.',
    highlights: [
      'Desert canyon basalt walls',
      'Boxcar & Oak Springs standing waves',
      'Big volume rolling wave trains',
    ],
  },
  {
    id: 'soca-kobarid-slalom',
    title: 'Soča River (Kobarid Reach)',
    riverSystem: 'Soča River',
    region: 'Kobarid, Slovenia',
    difficulty: 'class_iv',
    lengthMiles: 7.5,
    gradientFtPerMile: 35,
    flowRangeCfs: '700 - 2,100 CFS',
    typicalDurationHours: 3.5,
    description:
      'Legendary crystal turquoise alpine river flowing through Julian Alps limestone gorges, requiring pinpoint slalom turns around white boulders and siphon zones.',
    highlights: [
      'Crystal turquoise glacial pools',
      'Technical limestone boulder slaloms',
      'Emerald standing wave surf spots',
    ],
  },
];

export const RIVER_SUP_GEAR: RiverSupGearItem[] = [
  {
    id: 'quick-release-torso-leash',
    name: 'Chest-Harness Quick-Release River Leash Belt with High-Visibility Toggle',
    category: 'leash_safety',
    mandatory: true,
    description:
      'Torso-mounted quick-release belt that detaches instantly under strong river hydraulic drag to prevent catastrophic foot and ankle entrapment.',
  },
  {
    id: 'whitewater-certified-pfd',
    name: 'Type V High-Buoyancy Whitewater PFD with Rescue Harness Ring',
    category: 'buoyancy',
    mandatory: true,
    description:
      'High-flotation river rescue vest providing at least 16-22 lbs of inherent lift with quick-release chest harness for swiftwater swimmer extractions.',
  },
  {
    id: 'drainage-water-helmet',
    name: 'EN 1385 Certified Whitewater Drainage Helmet with Ear Protection',
    category: 'head_protection',
    mandatory: true,
    description:
      'Impact-resistant swiftwater helmet with rapid drainage vents and side impact coverage to protect against shallow riverbed boulder collisions.',
  },
  {
    id: 'flexible-river-fins',
    name: 'Low-Profile 2-4 Inch Flexible Polyurethane River Fins for Shallow Clearance',
    category: 'fins',
    mandatory: true,
    description:
      'Shallow-draft flexible polyurethane fins that bend effortlessly over river stones, preventing violent pitch-pole ejections in shallow rapids.',
  },
  {
    id: 'carbon-reinforced-river-paddle',
    name: 'Durable Nylon/Carbon River SUP Paddle with Reinforced Tip',
    category: 'propulsion',
    mandatory: true,
    description:
      'Rugged paddle shaft and impact-tolerant composite blade engineered to absorb heavy rock strikes and deliver authoritative low-brace stabilization.',
  },
  {
    id: 'padded-neoprene-booties',
    name: '5mm Sticky Rubber Sole Neoprene River Booties with Ankle Protection',
    category: 'footwear',
    mandatory: true,
    description:
      'High-friction sticky rubber traction soles for slippery algae-covered river rocks with thermal neoprene insulation and ankle impact padding.',
  },
];

export function getRiverSupRuns(difficulty?: RiverDifficulty): RiverSupRun[] {
  if (!difficulty) return RIVER_SUP_RUNS;
  return RIVER_SUP_RUNS.filter((run) => run.difficulty === difficulty);
}

export function getRiverSupRunById(id: string): RiverSupRun | undefined {
  return RIVER_SUP_RUNS.find((run) => run.id === id);
}

export function calculateRiverSup(query: RiverSupQuery): RiverSupResult {
  const run = getRiverSupRunById(query.runId);
  const runTitle = run ? run.title : 'River SUP Run';

  const totalPayloadKg = Math.max(1, query.paddlerWeightKg + query.gearWeightKg);
  const volumeToWeightRatio =
    Math.round((query.boardVolumeLiters / totalPayloadKg) * 100) / 100;

  let buoyancyRating: string;
  if (volumeToWeightRatio >= 3.6) {
    buoyancyRating = 'Optimal Whitewater Buoyancy (High Flotation & Rapid Planing)';
  } else if (volumeToWeightRatio >= 3.0) {
    buoyancyRating = 'Moderate River Buoyancy (Adequate Flotation for Moderate Swell)';
  } else {
    buoyancyRating = 'Low Buoyancy Warning (Submerged Rails & High Drag)';
  }

  const stabilityIndexPercent = Math.round(
    Math.min(98, Math.max(30, (volumeToWeightRatio / 4.0) * 95)),
  );

  let finClearanceStatus: string;
  if (query.finType === 'standard_long_touring_fin') {
    finClearanceStatus =
      'DANGER: Severe Fin Strike & Pitch-Pole Flipping Hazard! Long touring fins snag riverbed boulders and violently catapult paddler.';
  } else if (query.finType === 'retractable_click_fin') {
    finClearanceStatus =
      'Adaptive River Clearance: Retractable click fin deflects and retracts flush into box upon rock contact.';
  } else {
    finClearanceStatus =
      'Optimal River Clearance: Low-profile 2-4" flexible fins flex over shallow gravel bars and rock ledges.';
  }

  let leashSafetyStatus: string;
  if (query.leashType === 'ankle_fixed_coiled') {
    leashSafetyStatus =
      'DANGER: Lethal Ankle Entrapment Hazard! Prohibited in moving rivers. Hydrodynamic drag prevents reaching ankle release toggle.';
  } else if (query.leashType === 'none') {
    leashSafetyStatus =
      'Caution: Unattached Board Hazard. Immediate board loss risk in swift rapids; acceptable only in deep, low-consequence pools.';
  } else {
    leashSafetyStatus =
      'Optimal Swiftwater Safety: Chest-mounted quick-release harness detaches reliably under full river hydraulic tension.';
  }

  let safetyStatus: SupSafetyStatus;
  if (
    query.leashType === 'ankle_fixed_coiled' ||
    query.finType === 'standard_long_touring_fin' ||
    volumeToWeightRatio < 3.0
  ) {
    safetyStatus = 'hazardous_prohibited';
  } else if (
    query.leashType === 'none' ||
    run?.difficulty === 'class_iv' ||
    query.riverFlowCfs > 4000 ||
    volumeToWeightRatio < 3.4
  ) {
    safetyStatus = 'caution_expert_only';
  } else {
    safetyStatus = 'approved';
  }

  let paddlingAdvisory: string;
  if (safetyStatus === 'hazardous_prohibited') {
    if (query.leashType === 'ankle_fixed_coiled') {
      paddlingAdvisory =
        'Prohibited river setup: Fixed ankle leashes cause fatal entrapments in moving currents. Replace immediately with a torso quick-release belt before entering river.';
    } else if (query.finType === 'standard_long_touring_fin') {
      paddlingAdvisory =
        'Prohibited river setup: Long touring fin poses severe rock strike and violent pitch-pole flipping danger. Swap to low-profile flexible river fins.';
    } else {
      paddlingAdvisory =
        'Prohibited river setup: Board volume is critically insufficient for total payload weight. Upgrade to a higher-volume whitewater board (minimum 3.0x ratio).';
    }
  } else if (safetyStatus === 'caution_expert_only') {
    if (run?.difficulty === 'class_iv') {
      paddlingAdvisory =
        'Expert paddlers only: Class IV whitewater features powerful hydraulics and mandatory scout drops. Dialed brace and river self-rescue skills required.';
    } else if (query.leashType === 'none') {
      paddlingAdvisory =
        'Caution: Paddling unattached risks rapid board separation in heavy currents. Quick-release torso belt strongly recommended.';
    } else {
      paddlingAdvisory =
        'Caution advised: Heavy river flow or marginal payload buoyancy requires aggressive defensive paddling and wide safety margins.';
    }
  } else {
    paddlingAdvisory =
      'Approved setup: Buoyancy ratio, shallow flexible fin clearance, and quick-release torso leash meet river SUP safety standards. Maintain active downstream situational awareness.';
  }

  return {
    runTitle,
    totalPayloadKg,
    volumeToWeightRatio,
    buoyancyRating,
    stabilityIndexPercent,
    finClearanceStatus,
    leashSafetyStatus,
    safetyStatus,
    paddlingAdvisory,
  };
}

export function getRiverSupGear(): RiverSupGearItem[] {
  return RIVER_SUP_GEAR;
}
