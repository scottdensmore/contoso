export type RockType = 'pocketed_limestone' | 'tufa_limestone' | 'karst_limestone' | 'marine_sandstone';
export type TideStage = 'high_slack_tide' | 'mid_flood_tide' | 'mid_ebb_tide' | 'low_dead_tide';
export type BodyEntryPosition = 'pencil_feet_first_pointed' | 'feet_first_arms_flailing' | 'flat_back_or_belly';
export type DwsSafetyStatus = 'approved' | 'caution_high_risk' | 'hazardous_prohibited';

export interface PsicoblocCrag {
  id: string;
  title: string;
  location: string;
  country: string;
  gradeRange: string;
  maxHeightM: number;
  rockType: RockType;
  waterType: 'sea' | 'freshwater_lake';
  typicalWaterDepthM: number;
  boatAccessOnly: boolean;
  description: string;
  highlights: string[];
}

export interface PsicoblocQuery {
  cragId: string;
  climbingHeightM: number; // 3 to 22 meters, default 12
  waterDepthM: number; // 2 to 20 meters, default 7
  swellHeightM: number; // 0.1 to 3.0 meters, default 0.6
  tideStage: TideStage;
  bodyEntryPosition: BodyEntryPosition;
}

export interface PsicoblocResult {
  cragTitle: string;
  impactVelocityMs: number;
  impactVelocityKmh: number;
  minSafeDepthM: number;
  depthClearanceM: number;
  entryOrientationSafety: string;
  tideSwellSafety: string;
  safetyStatus: DwsSafetyStatus;
  diveAdvisory: string;
}

export interface PsicoblocGearItem {
  id: string;
  name: string;
  category: 'friction' | 'footwear' | 'chalk_containment' | 'exit_ascent' | 'buoyancy' | 'drying';
  mandatory: boolean;
  description: string;
}

export const PSICOBLOC_CRAGS: PsicoblocCrag[] = [
  {
    id: 'es-pontas-mallorca',
    title: 'Es Pontàs Natural Sea Arch',
    location: 'Santanyí, Mallorca',
    country: 'Spain',
    gradeRange: '9a+ (5.15a)',
    maxHeightM: 20,
    rockType: 'pocketed_limestone',
    waterType: 'sea',
    typicalWaterDepthM: 10,
    boatAccessOnly: false,
    description:
      "Mallorca's iconic standalone sea arch featuring huge pocketed roof climbing and legendary high-commitment water dynos.",
    highlights: [
      "World's most famous dyno over water",
      'Massive natural sea arch roof',
      'Deep Mediterranean fall zone',
    ],
  },
  {
    id: 'cala-barques-cave',
    title: 'Cala Barques & Cova del Diable',
    location: 'Manacor, Mallorca',
    country: 'Spain',
    gradeRange: '6b - 8a (5.10d - 5.13b)',
    maxHeightM: 14,
    rockType: 'tufa_limestone',
    waterType: 'sea',
    typicalWaterDepthM: 8,
    boatAccessOnly: false,
    description:
      'Sheltered sea cave overhangs, dripping tufas, and friendly horizontal traverses above crystal turquoise landing pools.',
    highlights: [
      'Sheltered sea cave overhangs',
      'Abundant warm-up traverses',
      'Clear turquoise landing pools',
    ],
  },
  {
    id: 'railay-tonsai-krabi',
    title: 'Railay Beach & Tonsai Towers',
    location: 'Krabi, Andaman Sea',
    country: 'Thailand',
    gradeRange: '6a - 7c (5.10a - 5.12d)',
    maxHeightM: 16,
    rockType: 'karst_limestone',
    waterType: 'sea',
    typicalWaterDepthM: 7,
    boatAccessOnly: true,
    description:
      'Towering karst sea pillars jutting straight out of the Andaman Sea, featuring dramatic stalactites and longtail boat logistics.',
    highlights: [
      'Tide-dependent karst monoliths',
      'Longtail boat access & safety watch',
      'Warm tropical waters & deep channels',
    ],
  },
  {
    id: 'swanage-conner-cove',
    title: 'Conner Cove & Portland Coast',
    location: 'Dorset Jurassic Coast',
    country: 'UK',
    gradeRange: '6b - 7b+ (5.10d - 5.12c)',
    maxHeightM: 12,
    rockType: 'pocketed_limestone',
    waterType: 'sea',
    typicalWaterDepthM: 6,
    boatAccessOnly: false,
    description:
      'Rugged limestone sea cliffs along the English Channel offering tidal sea traverses and brisk water soloing adventures.',
    highlights: [
      'Tide-critical Atlantic swell crags',
      'Scramble exit traverses with rope ladders',
      'Cool ocean waters requiring swift exits',
    ],
  },
  {
    id: 'summersville-lake-wv',
    title: "Pirate's Cove & Long Point",
    location: 'Summersville Lake, WV',
    country: 'USA',
    gradeRange: '5.9 - 5.13a',
    maxHeightM: 15,
    rockType: 'marine_sandstone',
    waterType: 'freshwater_lake',
    typicalWaterDepthM: 18,
    boatAccessOnly: true,
    description:
      'A premier freshwater deep water soloing destination in West Virginia featuring sheer Nuttall sandstone cliffs over deep, clear reservoir waters.',
    highlights: [
      'Premier freshwater deep water soloing',
      'Warm freshwater summer jumping',
      'Boat pickup & safe deep drop zone',
    ],
  },
];

export const PSICOBLOC_GEAR: PsicoblocGearItem[] = [
  {
    id: 'liquid-chalk-water-resistant',
    name: 'Quick-Drying Resin-Enhanced Liquid Chalk Tube for Salt Spray Resistance',
    category: 'friction',
    mandatory: true,
    description:
      'Alcohol-resin base liquid chalk that bonds to skin and resists sea spray humidity, preventing hand slipping on damp holds.',
  },
  {
    id: 'quick-drain-climbing-shoes',
    name: 'Multiple Pairs of Snug Synthetic Climbing Shoes for Rotating Dry Spares',
    category: 'footwear',
    mandatory: true,
    description:
      'Synthetic unlined climbing shoes that maintain tension when wet and dry rapidly while rotating between fall attempts.',
  },
  {
    id: 'floating-drybag-chalkbag',
    name: 'Floating Water-Sealed Roll-Top Chalk Bag with Waterproof Waist Belt',
    category: 'chalk_containment',
    mandatory: true,
    description:
      'Inflatable dry-chamber chalk pouch with roll-top seal that remains buoyant and watertight during unexpected drops into the sea.',
  },
  {
    id: 'weighted-cliff-exit-ladder',
    name: '15m Heavy-Duty Marine Rope Ladder with Steel Spreader Rungs for Cliff Exit',
    category: 'exit_ascent',
    mandatory: true,
    description:
      'Weighted marine rope ladder anchored at top stances to allow rapid, fatigue-free exit from breaking ocean swells onto the cliff base.',
  },
  {
    id: 'high-visibility-swim-buoy',
    name: 'Inflatable Safety Swim Tow Float with Integrated Whistle for Rescues',
    category: 'buoyancy',
    mandatory: true,
    description:
      'High-visibility inflatable tow buoy that provides immediate flotation, resting buoyancy, and acoustic signaling for boat traffic.',
  },
  {
    id: 'microfiber-chamois-towels',
    name: 'High-Absorption Quick-Dry Microfiber Chamois Towels for Rapid Sole Drying',
    category: 'drying',
    mandatory: true,
    description:
      'Dense chamois cloths engineered to pull ocean water off shoe rubber and fingertips before starting each vertical pitch.',
  },
];

export function getPsicoblocCrags(rockType?: RockType): PsicoblocCrag[] {
  if (!rockType) {
    return PSICOBLOC_CRAGS;
  }
  return PSICOBLOC_CRAGS.filter((crag) => crag.rockType === rockType);
}

export function getPsicoblocCragById(id: string): PsicoblocCrag | undefined {
  return PSICOBLOC_CRAGS.find((crag) => crag.id === id);
}

export function getPsicoblocGear(): PsicoblocGearItem[] {
  return PSICOBLOC_GEAR;
}

export function calculatePsicobloc(query: PsicoblocQuery): PsicoblocResult {
  const crag = getPsicoblocCragById(query.cragId);
  const cragTitle = crag ? crag.title : 'Custom Deep Water Soloing Crag';

  const impactVelocityMs = Math.round(Math.sqrt(2 * 9.81 * query.climbingHeightM) * 10) / 10;
  const impactVelocityKmh = Math.round(impactVelocityMs * 3.6 * 10) / 10;
  const minSafeDepthM = Math.round((2.5 + 0.3 * query.climbingHeightM) * 10) / 10;
  const depthClearanceM = Math.round((query.waterDepthM - minSafeDepthM) * 10) / 10;

  let safetyStatus: DwsSafetyStatus;
  if (
    query.waterDepthM < minSafeDepthM ||
    query.bodyEntryPosition === 'flat_back_or_belly' ||
    query.swellHeightM > 2.0
  ) {
    safetyStatus = 'hazardous_prohibited';
  } else if (
    query.climbingHeightM > 16 ||
    query.swellHeightM > 1.0 ||
    query.tideStage === 'low_dead_tide'
  ) {
    safetyStatus = 'caution_high_risk';
  } else {
    safetyStatus = 'approved';
  }

  // Entry orientation safety note
  let entryOrientationSafety: string;
  if (query.bodyEntryPosition === 'flat_back_or_belly') {
    entryOrientationSafety =
      'CATASTROPHIC IMPACT TRAUMA HAZARD: Flat belly or back landings at this velocity cause severe blunt force trauma, internal organ lacerations, and spinal deceleration injury. Strict vertical pencil entry is mandatory.';
  } else if (query.bodyEntryPosition === 'feet_first_arms_flailing') {
    entryOrientationSafety =
      'Upper limb dislocation risk: Flailing arms upon high-speed water entry frequently results in anterior shoulder dislocation and clavicle injury. Tuck arms tightly across chest before impact.';
  } else {
    entryOrientationSafety =
      'Optimal streamlined pencil entry: Toes pointed vertically downward, legs pressed together, and arms locked firmly across chest to pierce the surface tension smoothly.';
  }

  // Tide and swell safety note
  let tideSwellSafety: string;
  if (query.swellHeightM > 2.0) {
    tideSwellSafety =
      'Violent swell surge hazard: Waves above 2.0m produce turbulent undertows and crushing risks against cliff faces. Fall zones are unstable and dangerous.';
  } else if (query.swellHeightM > 1.0 || query.tideStage === 'low_dead_tide') {
    tideSwellSafety =
      'Moderate swell or low tide caution: Submerged reef boulders and sea urchins may be exposed in wave troughs. Verify drop clearance at low water slack.';
  } else {
    tideSwellSafety =
      'Favorable sea conditions: Calm swell and stable tidal buffer ensure consistent water depth and safe swimmer recovery.';
  }

  // Dive advisory
  let diveAdvisory: string;
  if (safetyStatus === 'hazardous_prohibited') {
    if (query.waterDepthM < minSafeDepthM) {
      diveAdvisory =
        'PROHIBITED: Water depth is below the minimum deceleration buffer needed to prevent seabed collision. Do not commit to climbs at this height without greater water depth.';
    } else if (query.bodyEntryPosition === 'flat_back_or_belly') {
      diveAdvisory =
        'PROHIBITED: Uncontrolled flat orientation guarantees severe trauma at this impact velocity. Do not climb if unable to execute a controlled vertical pencil entry.';
    } else {
      diveAdvisory =
        'PROHIBITED: Ocean swell exceeding 2.0m creates catastrophic cliff rebound waves and severe drowning risks. Postpone climb until seas settle.';
    }
  } else if (safetyStatus === 'caution_high_risk') {
    diveAdvisory =
      'HIGH RISK COMMITMENT: Fall height, swell, or low tide creates elevated hazards. Maintain an active spotter boat or swimmer with rescue float on water watch.';
  } else {
    diveAdvisory =
      'CONDITIONS APPROVED: Water depth and entry conditions are within safe deep water soloing parameters. Ensure exit ladder is deployed before starting.';
  }

  return {
    cragTitle,
    impactVelocityMs,
    impactVelocityKmh,
    minSafeDepthM,
    depthClearanceM,
    entryOrientationSafety,
    tideSwellSafety,
    safetyStatus,
    diveAdvisory,
  };
}
