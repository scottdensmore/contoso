export type EscapeTechnique =
  | 'sandtrap_ghost_anchor'
  | 'pot_hole_escape_hook'
  | 'water_anchor_pack_toss'
  | 'cheater_stick_reach';

export type WaterLevelCondition =
  | 'bone_dry_scour'
  | 'knee_wading_sand'
  | 'semi_swimming_keeper'
  | 'deep_swimming_keeper'
  | 'flooded_swimming_flume';

export type WallWetness =
  | 'dry_slickrock'
  | 'damp_sandstone'
  | 'slippery_algae_scum';

export type PotholeSafetyStatus =
  | 'nominal_partner_boost'
  | 'caution_technical_hook_required'
  | 'critical_keeper_trap_hazard';

export interface PotholeCanyonRoute {
  id: string;
  title: string;
  region: string;
  range: string;
  depthMeters: number;
  primaryTechnique: EscapeTechnique;
  lipFrictionAngleDegrees: number;
  typicalWaterLevel: WaterLevelCondition;
  description: string;
  highlights: string[];
}

export interface PotholeDynamicsQuery {
  routeId: string;
  technique: EscapeTechnique;              // default 'sandtrap_ghost_anchor'
  waterLevel: WaterLevelCondition;         // default 'semi_swimming_keeper'
  wallWetness: WallWetness;                // default 'damp_sandstone'
  teamSize: number;                        // 2 to 6, default 3
  leadClimberWeightKg: number;             // 50 to 110 kg, default 75
  lipHeightMeters: number;                 // 1.5 to 6.0 m, default 3.0
  inclineAngleDegrees: number;             // 45 to 90 deg, default 70
}

export interface PotholeDynamicsResult {
  routeTitle: string;
  effectiveHoistForceN: number;
  packCounterweightKg: number;
  escapeDifficultyIndex: number;          // 0.00 to 1.00
  safetyStatus: PotholeSafetyStatus;
  anchorRetrievalAdvisory: string;
  tacticalEscapeProtocol: string;
}

export interface PotholeGearItem {
  id: string;
  name: string;
  category: 'anchors' | 'escape' | 'rigging' | 'aid' | 'thermal';
  mandatory: boolean;
  description: string;
}

export const POTHOLE_CANTON_ROUTES: PotholeCanyonRoute[] = [
  {
    id: 'neon-canyon-golden-cathedral',
    title: 'Neon Canyon & The Golden Cathedral Keeper Potholes',
    region: 'Escalante, Utah, USA',
    range: 'Grand Staircase-Escalante National Monument',
    depthMeters: 45,
    primaryTechnique: 'sandtrap_ghost_anchor',
    lipFrictionAngleDegrees: 65,
    typicalWaterLevel: 'semi_swimming_keeper',
    description:
      'World-class Escalante sandstone labyrinth with swirling circular keeper potholes requiring sandtrap ghosting anchors.',
    highlights: [
      'Famous 80ft triple-arch rappel into keeper pool',
      'SandTrap ghost anchor retrievable rigging',
      'High-angle pothole lip friction ascents',
    ],
  },
  {
    id: 'choprock-canyon-keepers',
    title: 'Choprock Canyon Severe Waterpocket Maze',
    region: 'Escalante Canyons, Utah, USA',
    range: 'Glen Canyon National Recreation Area',
    depthMeters: 55,
    primaryTechnique: 'pot_hole_escape_hook',
    lipFrictionAngleDegrees: 75,
    typicalWaterLevel: 'deep_swimming_keeper',
    description:
      'Notorious ultra-narrow deep slot with sequence of 10+ frigid swimming keeper potholes and undercut pour-offs.',
    highlights: [
      'Frigid multi-hour deep swimming keepers',
      'Delicate pothole escape hook placements',
      'Smooth undercut slickrock lip transitions',
    ],
  },
  {
    id: 'black-hole-white-canyon',
    title: 'White Canyon Black Hole & Slickrock Pot-Holes',
    region: 'San Juan County, Utah, USA',
    range: 'Cedar Mesa / White Canyon',
    depthMeters: 30,
    primaryTechnique: 'water_anchor_pack_toss',
    lipFrictionAngleDegrees: 50,
    typicalWaterLevel: 'flooded_swimming_flume',
    description:
      'Cold, flooded slot canyon flume with scouring scour-holes and swirling sandstone pothole traps.',
    highlights: [
      'Hydraulic pack-toss counterweight anchors',
      'Slick scouring sandstone flumes',
      'Chilled hypothermia risk water immersions',
    ],
  },
  {
    id: 'imlay-canyon-sneffels',
    title: 'Imlay Canyon Sneffels & Cathedral Keeper Sequences',
    region: 'Zion National Park, Utah, USA',
    range: 'Zion Canyon Wilderness',
    depthMeters: 90,
    primaryTechnique: 'cheater_stick_reach',
    lipFrictionAngleDegrees: 80,
    typicalWaterLevel: 'bone_dry_scour',
    description:
      'One of the most arduous technical slots in the Colorado Plateau featuring up to 30 keeper potholes.',
    highlights: [
      'Extreme 30-pothole keeper escape marathon',
      'Telescoping cheater stick lasso maneuvers',
      'Crucial partner-boosting pyramid stacks',
    ],
  },
  {
    id: 'heaps-canyon-emerald-pools',
    title: 'Heaps Canyon Final Pothole Drop & Emerald Pools',
    region: 'Zion National Park, Utah, USA',
    range: 'Zion High Plateaus',
    depthMeters: 140,
    primaryTechnique: 'sandtrap_ghost_anchor',
    lipFrictionAngleDegrees: 85,
    typicalWaterLevel: 'semi_swimming_keeper',
    description:
      'Legendary multi-day slot ending with cold keeper waterpockets and a breathtaking 300ft hanging rappel.',
    highlights: [
      'Massive 300ft hanging free-rappel sequence',
      'Ghost anchor SandTrap rigging without bolts',
      'Frigid swimming keeper pothole escapes',
    ],
  },
];

export const POTHOLE_GEAR_CHECKLIST: PotholeGearItem[] = [
  {
    id: 'sandtrap-ghosting-anchor',
    name: 'Retrievable SandTrap Canyoneering Anchor Fabric Bag',
    category: 'anchors',
    mandatory: true,
    description:
      'Leaves zero permanent bolts; retrievable sand-fill anchor system for slickrock lips',
  },
  {
    id: 'telescoping-cheater-stick',
    name: 'Carbon Fiber Telescoping Cheater Stick with Stainless Hook',
    category: 'escape',
    mandatory: true,
    description:
      'Extends up to 4 meters to hook pothole lips, logs, or anchor webbing from swimming pool',
  },
  {
    id: 'talon-pothole-escape-hooks',
    name: 'Dual-Point Talon & Bat-Hook Aid Rigging Hooks',
    category: 'escape',
    mandatory: true,
    description:
      'Engineered bat hooks for hooking small solution pockets and sandstone edges during aid escapes',
  },
  {
    id: 'water-pack-toss-cord',
    name: '60m 6mm Ultra-Light Dyneema Floating Pull Line with Throw-Bag',
    category: 'rigging',
    mandatory: true,
    description:
      'Floating throw line for tossing weighted water-packs over pothole lips to create counterweight',
  },
  {
    id: 'foot-stirrup-etrier',
    name: '6-Step Reinforced Canyoneering Aider Stirrup with Dynamic Lanyard',
    category: 'aid',
    mandatory: true,
    description:
      'Compact webbing ladders for standing out of water onto partner shoulders or hook anchors',
  },
  {
    id: 'full-neoprene-wetsuit',
    name: '4/3mm Glued & Blind-Stitched Canyoneering Neoprene Suit',
    category: 'thermal',
    mandatory: true,
    description:
      'Essential thermal insulation to prevent hypothermia during prolonged swimming keeper delays',
  },
];

export function getPotholeCanyonRoutes(technique?: EscapeTechnique): PotholeCanyonRoute[] {
  if (!technique) {
    return POTHOLE_CANTON_ROUTES;
  }
  return POTHOLE_CANTON_ROUTES.filter((route) => route.primaryTechnique === technique);
}

export function getPotholeCanyonRouteById(id: string): PotholeCanyonRoute | undefined {
  return POTHOLE_CANTON_ROUTES.find((route) => route.id === id);
}

export function getPotholeGearChecklist(): PotholeGearItem[] {
  return POTHOLE_GEAR_CHECKLIST;
}

const FRICTION_MULTIPLIERS: Record<WallWetness, number> = {
  dry_slickrock: 0.65,
  damp_sandstone: 0.85,
  slippery_algae_scum: 1.25,
};

const WATER_DRAG_FACTORS: Record<WaterLevelCondition, number> = {
  bone_dry_scour: 1.0,
  knee_wading_sand: 1.1,
  semi_swimming_keeper: 1.25,
  deep_swimming_keeper: 1.4,
  flooded_swimming_flume: 1.55,
};

export function calculatePotholeDynamics(query: PotholeDynamicsQuery): PotholeDynamicsResult {
  const route = getPotholeCanyonRouteById(query.routeId);
  const routeTitle = route ? route.title : 'Technical Pothole Route';

  // Base gravity force: leadClimberWeightKg * 9.81 * Math.sin(inclineAngleDegrees * Math.PI / 180)
  const angleRad = (query.inclineAngleDegrees * Math.PI) / 180;
  const baseGravity = query.leadClimberWeightKg * 9.81 * Math.sin(angleRad);

  const frictionMult = FRICTION_MULTIPLIERS[query.wallWetness] ?? 0.85;
  const waterDrag = WATER_DRAG_FACTORS[query.waterLevel] ?? 1.25;

  const effectiveHoistForceN = Math.round(baseGravity * frictionMult * waterDrag);
  const packCounterweightKg = Math.round(((effectiveHoistForceN / 9.81) * 0.75) * 10) / 10;

  const baseDifficulty =
    (query.lipHeightMeters / 6.0) * 0.4 +
    (query.inclineAngleDegrees / 90.0) * 0.3 +
    (waterDrag - 1.0) * 0.5;

  const escapeDifficultyIndex = Math.min(
    0.99,
    Math.max(0.12, Math.round(baseDifficulty * 100) / 100)
  );

  let safetyStatus: PotholeSafetyStatus;
  if (
    escapeDifficultyIndex >= 0.75 ||
    query.waterLevel === 'flooded_swimming_flume' ||
    query.lipHeightMeters >= 4.5
  ) {
    safetyStatus = 'critical_keeper_trap_hazard';
  } else if (
    escapeDifficultyIndex >= 0.45 ||
    query.technique === 'pot_hole_escape_hook'
  ) {
    safetyStatus = 'caution_technical_hook_required';
  } else {
    safetyStatus = 'nominal_partner_boost';
  }

  // Anchor retrieval advisory based on technique
  let anchorRetrievalAdvisory = '';
  switch (query.technique) {
    case 'sandtrap_ghost_anchor':
      anchorRetrievalAdvisory =
        'SandTrap Ghost Anchor Advisory: Fill bag with damp slickrock sand (min 20-30 kg). Position 2m back from lip edge. Rig dedicated dump pull line. Last person clears anchor by tensioning pull line from base.';
      break;
    case 'pot_hole_escape_hook':
      anchorRetrievalAdvisory =
        'Escape Hook Rigging Advisory: Set dual Talon / bat hooks in natural solution dimples. Keep continuous downward body tension on aider stirrups. Retrieve hooks via safety tether after topping out.';
      break;
    case 'water_anchor_pack_toss':
      anchorRetrievalAdvisory =
        'Water Anchor Pack Toss Advisory: Fill canyoneering haul pack with water/sand ballast. Toss cleanly over high lip into downstream sand pocket. Ascend pack counterweight line, then haul packs down.';
      break;
    case 'cheater_stick_reach':
      anchorRetrievalAdvisory =
        'Cheater Stick Reach Advisory: Fully extend carbon fiber telescoping stick to hook natural logs, rock horns, or pothole lip rim. Clip aider ladder to stick head and ascend carefully with partner belay.';
      break;
  }

  // Tactical escape protocol based on safetyStatus and teamSize
  let tacticalEscapeProtocol = '';
  if (safetyStatus === 'critical_keeper_trap_hazard') {
    tacticalEscapeProtocol =
      `CRITICAL KEEPER ESCAPE PROTOCOL: Form submerged multi-person pyramid immediately with all ${query.teamSize} team members to reduce water immersion hypothermia. Launch lightest climber with etrier aider and weighted pack-toss line. Rig mechanical advantage haul system before pulling remaining members out of the keeper trap.`;
  } else if (safetyStatus === 'caution_technical_hook_required') {
    tacticalEscapeProtocol =
      `TECHNICAL AID ESCAPE PROTOCOL: Deploy partner shoulder stand from team of ${query.teamSize} to gain maximum vertical reach. Set aid hooks or toss weighted pack over pothole lip. Maintain positive tension on ascending line and establish top anchor for trailing canyoneers.`;
  } else {
    tacticalEscapeProtocol =
      `NOMINAL PARTNER BOOST PROTOCOL: Utilize coordinated 2-person knee-and-shoulder boost from shallow water or sandbar. Lead climber tops out onto lip, anchors body position, and assists remaining ${query.teamSize - 1} team member(s) up with a hand line.`;
  }

  return {
    routeTitle,
    effectiveHoistForceN,
    packCounterweightKg,
    escapeDifficultyIndex,
    safetyStatus,
    anchorRetrievalAdvisory,
    tacticalEscapeProtocol,
  };
}
