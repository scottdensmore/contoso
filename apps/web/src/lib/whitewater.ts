export type RiverClass =
  | 'Class I'
  | 'Class II'
  | 'Class III'
  | 'Class IV'
  | 'Class V'
  | 'Class V+'
  | 'Class III-IV'
  | 'Class III+'
  | 'Class IV+';

export type FlowStatus = 'too_low' | 'low_runnable' | 'optimal_medium' | 'high_challenging' | 'flood_dangerous';
export type CraftType = 'kayak' | 'raft' | 'packraft' | 'canoe' | 'sup';

export interface RiverRapid {
  name: string;
  rating: RiverClass;
  hazardDescription: string;
  scoutRecommended: boolean;
}

export interface WhitewaterRiverRun {
  id: string;
  name: string;
  section: string;
  river: string;
  region: string;
  classRating: RiverClass;
  lengthMiles: number;
  putInLocation: string;
  takeOutLocation: string;
  currentFlowCfs: number;
  minRunnableCfs: number;
  optimalLowCfs: number;
  optimalHighCfs: number;
  maxRunnableCfs: number;
  flowStatus: FlowStatus;
  waterTempF: number;
  gaugeStationName: string;
  gaugeStationId: string;
  keyRapids: RiverRapid[];
  hazards: string[];
  permitRequired: string;
}

export interface RiverSafetyAssessmentRequest {
  runId: string;
  craft: CraftType;
  paddlerSkill: 'novice' | 'intermediate' | 'advanced' | 'expert';
  flowCfs?: number;
}

export interface RiverSafetyAssessmentResult {
  runId: string;
  flowStatus: FlowStatus;
  isRunnable: boolean;
  suitability: 'recommended' | 'proceed_with_caution' | 'not_recommended' | 'danger_prohibited';
  recommendationText: string;
  requiredGear: string[];
  coldWaterImmersionWarning: boolean;
  safetyChecklist: string[];
}

export interface WhitewaterGearItem {
  id: string;
  name: string;
  category: 'mandatory_pfd_head' | 'thermal_protection' | 'rescue_field' | 'boat_rigging';
  essential: boolean;
  description: string;
}

export const WHITEWATER_RUNS: WhitewaterRiverRun[] = [
  {
    id: 'wenatchee-tumwater',
    name: 'Wenatchee River — Tumwater Canyon',
    section: 'Tumwater Canyon',
    river: 'Wenatchee',
    region: 'Central Cascades / Leavenworth',
    classRating: 'Class V',
    lengthMiles: 7.0,
    putInLocation: 'Tumwater Campground',
    takeOutLocation: 'Leavenworth Waterfront Park',
    currentFlowCfs: 2800,
    minRunnableCfs: 1200,
    optimalLowCfs: 2000,
    optimalHighCfs: 4500,
    maxRunnableCfs: 7000,
    flowStatus: 'optimal_medium',
    waterTempF: 44,
    gaugeStationName: 'Wenatchee River at Plain',
    gaugeStationId: 'USGS-12457000',
    keyRapids: [
      {
        name: 'Chaos',
        rating: 'Class V',
        hazardDescription: 'Massive recirculating hydraulic and pour-over boulders',
        scoutRecommended: true,
      },
      {
        name: 'Wall',
        rating: 'Class IV+',
        hazardDescription: 'Severe pillow rock with keeper hole',
        scoutRecommended: true,
      },
    ],
    hazards: [
      'Terminal keeper holes',
      'Cold glacial meltwater',
      'Undercut river left canyon walls',
    ],
    permitRequired: 'None required for private boaters',
  },
  {
    id: 'skykomish-boulder-drop',
    name: 'Skykomish River — Sunset to Big Eddy',
    section: 'Index Run / Boulder Drop',
    river: 'Skykomish',
    region: 'North Cascades / Index',
    classRating: 'Class IV',
    lengthMiles: 8.5,
    putInLocation: 'Sunset Falls Bridge',
    takeOutLocation: 'Big Eddy County Park',
    currentFlowCfs: 3400,
    minRunnableCfs: 1500,
    optimalLowCfs: 2500,
    optimalHighCfs: 5000,
    maxRunnableCfs: 9000,
    flowStatus: 'optimal_medium',
    waterTempF: 46,
    gaugeStationName: 'Skykomish River near Gold Bar',
    gaugeStationId: 'USGS-12134500',
    keyRapids: [
      {
        name: 'Boulder Drop',
        rating: 'Class IV+',
        hazardDescription: '1/4 mile continuous rock garden with House Rock sieve and island drop',
        scoutRecommended: true,
      },
    ],
    hazards: [
      'Large sieve traps at low flow',
      'Wood debris / river logs',
      'Undercuts',
    ],
    permitRequired: 'Discover Pass at Big Eddy',
  },
  {
    id: 'white-salmon-husum',
    name: 'White Salmon River — BZ Corner to Husum',
    section: 'Middle White Salmon',
    river: 'White Salmon',
    region: 'Columbia River Gorge',
    classRating: 'Class III-IV',
    lengthMiles: 6.0,
    putInLocation: 'BZ Corner Launch',
    takeOutLocation: 'Husum Falls Takeout',
    currentFlowCfs: 1400,
    minRunnableCfs: 700,
    optimalLowCfs: 1000,
    optimalHighCfs: 2200,
    maxRunnableCfs: 3500,
    flowStatus: 'optimal_medium',
    waterTempF: 48,
    gaugeStationName: 'White Salmon River near Underwood',
    gaugeStationId: 'USGS-14123500',
    keyRapids: [
      {
        name: 'Husum Falls',
        rating: 'Class V',
        hazardDescription: '14-foot vertical waterfall drop, mandatory portage for commercial rafts',
        scoutRecommended: true,
      },
      {
        name: 'Rattlesnake',
        rating: 'Class III+',
        hazardDescription: 'Steep staircase with pushy waves',
        scoutRecommended: false,
      },
    ],
    hazards: [
      'Narrow basalt gorge',
      'Mandatory portage or expert line at Husum',
      'Cold spring-fed flows',
    ],
    permitRequired: 'USFS Self-Issue river permit',
  },
  {
    id: 'snoqualmie-middle-fork',
    name: 'Middle Fork Snoqualmie — Mine Creek to Middlefield',
    section: 'Mine Creek Run',
    river: 'Snoqualmie',
    region: 'Central Cascades / North Bend',
    classRating: 'Class III',
    lengthMiles: 5.5,
    putInLocation: 'Mine Creek Day Use',
    takeOutLocation: 'Gateway Bridge',
    currentFlowCfs: 1800,
    minRunnableCfs: 900,
    optimalLowCfs: 1400,
    optimalHighCfs: 2800,
    maxRunnableCfs: 4500,
    flowStatus: 'optimal_medium',
    waterTempF: 45,
    gaugeStationName: 'Middle Fork Snoqualmie near Tanner',
    gaugeStationId: 'USGS-12141300',
    keyRapids: [
      {
        name: 'House Rocks',
        rating: 'Class III',
        hazardDescription: 'Technical slalom through boulders',
        scoutRecommended: false,
      },
      {
        name: 'Mine Creek Rapid',
        rating: 'Class III',
        hazardDescription: 'Wave train with lateral push into right wall',
        scoutRecommended: false,
      },
    ],
    hazards: ['Log jams and root wads', 'Cold runoff'],
    permitRequired: 'Discover Pass',
  },
  {
    id: 'deschutes-maupin',
    name: 'Lower Deschutes River — Warm Springs to Maupin',
    section: 'Maupin Day Stretch',
    river: 'Deschutes',
    region: 'Central Oregon / Maupin',
    classRating: 'Class III',
    lengthMiles: 12.0,
    putInLocation: 'Warm Springs Launch',
    takeOutLocation: 'Sandy Beach / Maupin City Park',
    currentFlowCfs: 4200,
    minRunnableCfs: 2800,
    optimalLowCfs: 3800,
    optimalHighCfs: 5500,
    maxRunnableCfs: 8000,
    flowStatus: 'optimal_medium',
    waterTempF: 52,
    gaugeStationName: 'Deschutes River at Moody near Biggs',
    gaugeStationId: 'USGS-14103000',
    keyRapids: [
      {
        name: 'Oak Springs',
        rating: 'Class III+',
        hazardDescription: 'Fast entry with big breaking standing wave',
        scoutRecommended: false,
      },
      {
        name: 'Boxcar',
        rating: 'Class III',
        hazardDescription: 'Pushy rapid with large ledge hole on left',
        scoutRecommended: false,
      },
    ],
    hazards: [
      'Sun exposure / heat',
      'Rattlesnakes along banks',
      'Wind gusts in Deschutes canyon',
    ],
    permitRequired: 'BLM Boater Pass required',
  },
];

export const WHITEWATER_GEAR_CHECKLIST: WhitewaterGearItem[] = [
  {
    id: 'pfd',
    name: 'Type III/V Whitewater PFD',
    category: 'mandatory_pfd_head',
    essential: true,
    description: 'High-flotation vest equipped with quick-release rescue harness and chest lash tab.',
  },
  {
    id: 'helmet',
    name: 'Whitewater Helmet',
    category: 'mandatory_pfd_head',
    essential: true,
    description: 'CE 1385 certified impact protection designed for aquatic sports with drain vents.',
  },
  {
    id: 'drysuit',
    name: 'Drysuit with latex/silicone gaskets',
    category: 'thermal_protection',
    essential: true,
    description: 'Full breathable immersion drysuit with watertight latex or silicone neck/wrist seals.',
  },
  {
    id: 'throw-bag',
    name: 'River Rescue Throw Bag',
    category: 'rescue_field',
    essential: true,
    description: '70-75ft high-tensile floating polypropylene rescue rope packed in a quick-toss bag.',
  },
  {
    id: 'knife',
    name: 'River Knife',
    category: 'rescue_field',
    essential: true,
    description: 'Blunt tip rescue knife mounted securely to PFD lash tab for emergency rope severance.',
  },
  {
    id: 'booties-pogies',
    name: 'Neoprene Booties & Pogies',
    category: 'thermal_protection',
    essential: true,
    description: 'Traction-grip rubber sole thermal booties and windproof paddle pogies.',
  },
  {
    id: 'first-aid',
    name: 'First Aid & Hypothermia Kit',
    category: 'rescue_field',
    essential: true,
    description: 'Submersible dry bag with trauma bandages, sam splint, space blankets, and glucose.',
  },
  {
    id: 'whistle',
    name: 'Safety Whistle',
    category: 'mandatory_pfd_head',
    essential: true,
    description: 'Pea-less storm safety whistle audible over roaring whitewater rapids.',
  },
];

export function getWhitewaterRuns(
  classRating?: RiverClass,
  region?: string
): WhitewaterRiverRun[] {
  return WHITEWATER_RUNS.filter((run) => {
    if (classRating) {
      const targetClass = classRating.toLowerCase();
      const runClass = run.classRating.toLowerCase();
      if (!runClass.includes(targetClass)) {
        return false;
      }
    }
    if (region) {
      const targetRegion = region.toLowerCase();
      if (!run.region.toLowerCase().includes(targetRegion)) {
        return false;
      }
    }
    return true;
  });
}

export function getWhitewaterRunById(id: string): WhitewaterRiverRun | undefined {
  return WHITEWATER_RUNS.find((run) => run.id === id);
}

export function assessRiverSafety(
  req: RiverSafetyAssessmentRequest
): RiverSafetyAssessmentResult {
  const run = getWhitewaterRunById(req.runId);
  if (!run) {
    throw new Error(`Whitewater river run "${req.runId}" not found.`);
  }

  const flow = req.flowCfs ?? run.currentFlowCfs;
  const coldWaterImmersionWarning = run.waterTempF < 55;

  let flowStatus: FlowStatus;
  let isRunnable = true;
  let suitability: RiverSafetyAssessmentResult['suitability'] = 'recommended';
  let recommendationText = '';

  if (flow < run.minRunnableCfs) {
    flowStatus = 'too_low';
    isRunnable = false;
    suitability = 'not_recommended';
    recommendationText =
      'Flow is below minimum runnable level. High risk of boat damage on exposed rocks and shallow pin hazards.';
  } else if (flow > run.maxRunnableCfs) {
    flowStatus = 'flood_dangerous';
    isRunnable = false;
    suitability = 'danger_prohibited';
    recommendationText =
      'Flow is in flood stage. High water washes out eddies, creates terminal keeper holes, and makes rescue impossible.';
  } else if (flow < run.optimalLowCfs) {
    flowStatus = 'low_runnable';
  } else if (flow <= run.optimalHighCfs) {
    flowStatus = 'optimal_medium';
  } else {
    flowStatus = 'high_challenging';
  }

  // Skill mapping when runnable
  if (isRunnable) {
    const isClassV = run.classRating.includes('Class V');
    const isClassIV = run.classRating.includes('Class IV');
    const isClassIII = run.classRating.includes('Class III');

    if (isClassV) {
      if (req.paddlerSkill === 'expert') {
        suitability = 'recommended';
        recommendationText = `Recommended: ${run.name} (${run.classRating}) matches expert boat handling skills at current flow of ${flow} CFS. Maintain group safety spacing and scout horizon drops.`;
      } else if (req.paddlerSkill === 'advanced') {
        suitability = 'not_recommended';
        recommendationText = `Not recommended: ${run.name} (${run.classRating}) presents severe hazard margins for advanced paddlers. Class V rapids require seasoned expert rescue capabilities.`;
      } else {
        suitability = 'danger_prohibited';
        recommendationText = `Danger / Prohibited: ${run.name} (${run.classRating}) is life-threatening for ${req.paddlerSkill} paddlers. Never attempt Class V without expert river running credentials.`;
      }
    } else if (isClassIV) {
      if (req.paddlerSkill === 'expert' || req.paddlerSkill === 'advanced') {
        suitability = 'recommended';
        recommendationText = `Recommended: ${run.name} (${run.classRating}) is runnable for ${req.paddlerSkill} paddlers at ${flow} CFS. Scout major drops and maintain boat-to-boat safety.`;
      } else if (req.paddlerSkill === 'intermediate') {
        suitability = 'not_recommended';
        recommendationText = `Not recommended: ${run.name} (${run.classRating}) features complex technical moves and strong hydraulics unsuitable for intermediate paddlers.`;
      } else {
        suitability = 'danger_prohibited';
        recommendationText = `Danger / Prohibited: ${run.name} (${run.classRating}) has deadly pinning hazards and severe rapids prohibited for novice paddlers.`;
      }
    } else if (isClassIII) {
      if (req.paddlerSkill === 'novice') {
        suitability = 'proceed_with_caution';
        recommendationText = `Proceed with caution: ${run.name} (${run.classRating}) requires strong basic maneuvering for novice paddlers. Must be run with a guided group and experienced safety boaters.`;
      } else {
        suitability = 'recommended';
        recommendationText = `Recommended: ${run.name} (${run.classRating}) is well-suited for ${req.paddlerSkill} paddlers at ${flow} CFS. Review river signals and scout blind bends.`;
      }
    }
  }

  // Required gear list
  const requiredGear: string[] = [
    'Type III/V Whitewater PFD (quick-release rescue harness)',
    'Whitewater Helmet (CE 1385 certified)',
    'River Rescue Throw Bag (70-75ft floating line)',
    'River Rescue Knife (blunt-tip mounted on PFD)',
    'Pea-less storm safety whistle',
  ];

  if (coldWaterImmersionWarning) {
    requiredGear.push(
      'Drysuit with latex/silicone gaskets & thermal underlayers (water < 55°F)'
    );
  }

  if (req.craft === 'kayak') {
    requiredGear.push('Neoprene whitewater spray skirt');
    requiredGear.push('Kayak flotation bags (bow & stern air bladders)');
  } else if (req.craft === 'raft' || req.craft === 'packraft') {
    requiredGear.push('Perimeter safety grab line & bow/stern painters');
    requiredGear.push('Spare breakdown paddle / oar');
    requiredGear.push('High-volume river inflation pump');
  } else if (req.craft === 'canoe') {
    requiredGear.push('Canoe flotation end bags / air blocks');
    requiredGear.push('Spare breakdown canoe paddle');
  } else if (req.craft === 'sup') {
    requiredGear.push('Torso quick-release river leash (never ankle leash)');
    requiredGear.push('Breakdown river SUP paddle');
  }

  const safetyChecklist: string[] = [
    `Verify real-time USGS gauge (${run.gaugeStationId}): ${flow} CFS within runnable window (${run.minRunnableCfs} - ${run.maxRunnableCfs} CFS).`,
    'Master defensive swimming position: float on back, feet up and downstream, head raised, never stand in current.',
    `Scout critical rapids prior to running: ${run.keyRapids.map((r) => r.name).join(', ')}.`,
    'Scan river corridor for fallen wood, strainers, and sieve entrapments.',
    'Confirm thermal protection drysuit sealed with cold-water headwear and booties.',
  ];

  return {
    runId: run.id,
    flowStatus,
    isRunnable,
    suitability,
    recommendationText,
    requiredGear,
    coldWaterImmersionWarning,
    safetyChecklist,
  };
}

export function getWhitewaterGearChecklist(): WhitewaterGearItem[] {
  return WHITEWATER_GEAR_CHECKLIST;
}
