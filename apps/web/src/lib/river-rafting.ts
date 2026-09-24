export type RiverDifficulty = 'Class_III_Moderate' | 'Class_IV_Advanced' | 'Class_V_Expert';
export type FrameType =
  | 'expedition_bighorn_frame'
  | 'compact_day_frame'
  | 'stern_mount_frame'
  | 'cataraft_double_rail';
export type OarBladeType =
  | 'square_top_dynalite'
  | 'composite_smoker_asymmetrical'
  | 'heavy_duty_polyethylene';

export interface RaftingExpedition {
  id: string;
  name: string;
  river: string;
  location: string;
  difficulty: RiverDifficulty;
  mileageMiles: number;
  typicalDays: number;
  recommendedRaftSizeFeet: number;
  permitSeason: string;
  description: string;
  highlights: string[];
}

export interface RaftCalculationQuery {
  expeditionId: string;
  raftLengthFeet: number; // 13 to 18 ft
  riggedPayloadKg: number; // 150 to 800 kg (frame, boxes, cooler, water, gear, crew)
  oarLengthFeet: number; // 9.0 to 11.0 ft
  inboardLeverageInches: number; // 28 to 36 inches
  entrySpeedKnots: number; // 3 to 10 knots
}

export interface RaftCalculationResult {
  expeditionName: string;
  leverageRatio: number; // outboard / inboard ratio
  totalDisplacementLiters: number;
  holePunchMomentumNs: number;
  punchFeasibility: 'punch_clean' | 'caution_stall_risk' | 'flip_hazard_danger';
  backFerryEfficiencyScore: number; // 0-100 score
  stabilityWarning?: string;
  oarRigRecommendation: string;
}

export interface RaftingGearItem {
  id: string;
  name: string;
  category: 'frame' | 'oars' | 'containment' | 'rigging' | 'safety_pfd' | 'waste_fire';
  mandatory: boolean;
  description: string;
}

export const RAFTING_EXPEDITIONS: RaftingExpedition[] = [
  {
    id: 'colorado-river-grand-canyon',
    name: 'Colorado River — Grand Canyon Expedition',
    river: 'Colorado River',
    location: "Lee's Ferry to Diamond Creek, AZ",
    difficulty: 'Class_V_Expert',
    mileageMiles: 226,
    typicalDays: 18,
    recommendedRaftSizeFeet: 18,
    permitSeason: 'Weighted lottery (Feb-Apr, Oct-Nov)',
    description:
      'The crown jewel of American river expeditions featuring legendary rapids like Lava Falls and Crystal in a mile-deep Precambrian gorge.',
    highlights: [
      'Lava Falls ledge hole punch',
      'Granite Gorge roaring big water',
      'Phantom Ranch resupply',
    ],
  },
  {
    id: 'middle-fork-salmon-river',
    name: 'Middle Fork of the Salmon River',
    river: 'Middle Fork Salmon',
    location: 'Boundary Creek to Cache Bar, ID',
    difficulty: 'Class_IV_Advanced',
    mileageMiles: 100,
    typicalDays: 6,
    recommendedRaftSizeFeet: 15,
    permitSeason: 'Four Rivers lottery (Jun 20 - Sep 7)',
    description:
      'Premier wilderness free-flowing alpine river descending through Frank Church Wilderness, dropping 3,000 feet through technical granite canyons.',
    highlights: [
      'Velvet Falls drop-and-stop',
      'Impassable Canyon sheer diorite cliffs',
      'Sunflower natural geothermal hot springs',
    ],
  },
  {
    id: 'rogue-river-wilderness',
    name: 'Rogue River Wilderness Wild & Scenic',
    river: 'Rogue River',
    location: 'Grave Creek to Foster Bar, OR',
    difficulty: 'Class_IV_Advanced',
    mileageMiles: 34,
    typicalDays: 4,
    recommendedRaftSizeFeet: 14,
    permitSeason: 'Wild & Scenic Lottery (May 15 - Oct 15)',
    description:
      'Lush coastal temperate canyon with heart-pounding slot rapids, historic lodges, and famous black bear corridors.',
    highlights: [
      'Blossom Bar boulder maze run',
      'Mule Creek Canyon churning coffee pot',
      'Rainie Falls technical side chute',
    ],
  },
  {
    id: 'selway-river-wilderness',
    name: 'Selway River National Wilderness',
    river: 'Selway River',
    location: "Paradise to Slim's Camp, ID",
    difficulty: 'Class_V_Expert',
    mileageMiles: 47,
    typicalDays: 5,
    recommendedRaftSizeFeet: 15,
    permitSeason: 'Ultra-strict single launch/day lottery (May 15 - Jul 31)',
    description:
      'One of the most pristine and tightly regulated wilderness rivers on earth, renowned for continuous non-stop Class IV-V technical boulder gardens.',
    highlights: [
      'Moose Creek roaring granite sluice',
      'Ladle Rapid narrow raft slot',
      'Single private launch per day solitude',
    ],
  },
  {
    id: 'green-river-gates-of-lodore',
    name: 'Green River — Gates of Lodore',
    river: 'Green River',
    location: 'Dinosaur National Monument, CO/UT',
    difficulty: 'Class_IV_Advanced',
    mileageMiles: 44,
    typicalDays: 4,
    recommendedRaftSizeFeet: 16,
    permitSeason: 'Dinosaur National Monument Lottery',
    description:
      'Spectacular crimson quartzite canyons carved through the Uinta Mountains with high-volume technical drop rapids.',
    highlights: [
      'Disaster Falls historic boulder pinch',
      "Hell's Half Mile boiling foam",
      'Echo Park confluence with Yampa River',
    ],
  },
];

export const RAFTING_GEAR: RaftingGearItem[] = [
  {
    id: 'modular-aluminum-oar-frame',
    name: 'Extruded Modular Aluminum Oar Frame with High-Back Padded Seat',
    category: 'frame',
    mandatory: true,
    description:
      '1.25-inch anodized 6061-T6 aluminum modular breakdown frame with cast aluminum LoPro fittings and adjustable foot rest bar.',
  },
  {
    id: 'counterbalanced-composite-oars',
    name: '10-Foot Counterbalanced Carbon Oars & Dynalite Blades',
    category: 'oars',
    mandatory: true,
    description:
      'Counterbalanced carbon composite shafts with brass oarlocks, heavy-duty oar sleeves, and carbon-reinforced ash core blades.',
  },
  {
    id: 'gasketed-aluminum-drybox',
    name: 'Heavy-Duty Marine Aluminum Drybox with Neoprene Gasket',
    category: 'containment',
    mandatory: true,
    description:
      '0.080-inch welded 5052 aluminum dry storage with watertight seal, spring-loaded butterfly latches, and internal divider.',
  },
  {
    id: 'heavy-duty-drop-bag-cargo-net',
    name: 'Heavy PVC Drop Bag with 1.5-inch Webbing Cargo Net',
    category: 'rigging',
    mandatory: true,
    description:
      'Reinforced suspended drop bag for floor luggage paired with UV-resistant high-tensile cam straps to secure flip-proof cargo.',
  },
  {
    id: 'high-flotation-type-v-pfd',
    name: 'USCG Type V High-Flotation Whitewater Rescue PFD (22+ lbs Flotation)',
    category: 'safety_pfd',
    mandatory: true,
    description:
      'High-buoyancy swiftwater rescue vest equipped with quick-release chest harness, tether ring, and impact-resistant chest foam.',
  },
  {
    id: 'firepan-clean-waste-groover',
    name: 'Sealed Heavy-Duty Steel Groover (Ammo Can Toilet) & Firepan',
    category: 'waste_fire',
    mandatory: true,
    description:
      'Mandatory park service airtight human waste container with deodorizer packet and elevated 3-inch lip steel campfire pan.',
  },
];

export function getRaftingExpeditions(difficulty?: RiverDifficulty): RaftingExpedition[] {
  if (!difficulty) {
    return RAFTING_EXPEDITIONS;
  }
  return RAFTING_EXPEDITIONS.filter((expedition) => expedition.difficulty === difficulty);
}

export function getRaftingExpeditionById(id: string): RaftingExpedition | undefined {
  return RAFTING_EXPEDITIONS.find((expedition) => expedition.id === id);
}

export function getRaftingGear(): RaftingGearItem[] {
  return RAFTING_GEAR;
}

export function calculateRaftDynamics(query: RaftCalculationQuery): RaftCalculationResult {
  const expedition = getRaftingExpeditionById(query.expeditionId);
  const expeditionName = expedition ? expedition.name : 'Custom River Expedition';

  const outboardInches = query.oarLengthFeet * 12 - query.inboardLeverageInches;
  const leverageRatio = Math.round((outboardInches / query.inboardLeverageInches) * 100) / 100;

  const baseHullWeightKg = query.raftLengthFeet * 8;
  const totalWeightKg = query.riggedPayloadKg + baseHullWeightKg;
  const totalDisplacementLiters = Math.round(totalWeightKg * 1.05);

  const velocityMs = query.entrySpeedKnots * 0.514444;
  const holePunchMomentumNs = Math.round(totalWeightKg * velocityMs);

  let punchFeasibility: 'punch_clean' | 'caution_stall_risk' | 'flip_hazard_danger';
  if (holePunchMomentumNs >= 2200) {
    punchFeasibility = 'punch_clean';
  } else if (holePunchMomentumNs >= 1400) {
    punchFeasibility = 'caution_stall_risk';
  } else {
    punchFeasibility = 'flip_hazard_danger';
  }

  const backFerryEfficiencyScore = Math.max(
    10,
    Math.min(
      100,
      Math.round(
        100 -
          Math.abs(leverageRatio - 2.15) * 45 -
          (query.riggedPayloadKg / 800) * 15
      )
    )
  );

  const warnings: string[] = [];
  if (query.riggedPayloadKg > 600 && query.raftLengthFeet < 15) {
    warnings.push(
      'Severe overloading! Raft waterline submerged beyond safe freeboard; lower center-of-gravity and redistribute cargo into drop bags.'
    );
  }
  if (punchFeasibility === 'flip_hazard_danger') {
    warnings.push(
      'Critical stall danger! Rigged mass and entry speed produce insufficient momentum to punch hydraulic reversal; high risk of back-flip or surf entrapment.'
    );
  }
  if (leverageRatio > 2.45) {
    warnings.push(
      'Oar leverage ratio too stiff! Outboard exceeds 2.45x inboard. Excessive rower fatigue and high risk of wrist strain in heavy boil water.'
    );
  }

  const stabilityWarning = warnings.length > 0 ? warnings.join(' ') : undefined;

  let oarRigRecommendation = '';
  if (query.riggedPayloadKg >= 550) {
    oarRigRecommendation =
      'Heavy expedition rigging verified: 10\' to 11\' counterbalanced composite shafts with wide Dynalite blades provide the ideal mechanical advantage to maintain ferry angles under heavy gear loads.';
  } else if (query.raftLengthFeet <= 14) {
    oarRigRecommendation =
      'Agile technical setup: 9.0\' to 9.5\' oars deliver rapid blade response and tight slot clearance through technical rock gardens.';
  } else {
    oarRigRecommendation =
      'Standard all-around wilderness setup: 10\' oars with 31-33" inboard leverage deliver optimal 2.15:1 leverage for crisp back-ferry maneuvers and hydraulic punching power.';
  }

  if (leverageRatio > 2.45) {
    oarRigRecommendation +=
      ' Caution: Current oar leverage ratio exceeds 2.45x inboard — extend oarlock spacing or increase inboard leverage to reduce rower fatigue.';
  } else if (leverageRatio < 1.95) {
    oarRigRecommendation +=
      ' Caution: Inboard span is wide relative to oar length; consider longer oars to improve sweep efficiency.';
  }

  return {
    expeditionName,
    leverageRatio,
    totalDisplacementLiters,
    holePunchMomentumNs,
    punchFeasibility,
    backFerryEfficiencyScore,
    stabilityWarning,
    oarRigRecommendation,
  };
}
