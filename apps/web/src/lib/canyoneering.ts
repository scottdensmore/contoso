export type CanyonTechnicalGrade =
  | 'class_3a'
  | 'class_3b'
  | 'class_3c'
  | 'class_4a'
  | 'class_4b'
  | 'class_4c';

export type FlashFloodRiskLevel =
  | 'low'
  | 'moderate'
  | 'high'
  | 'extreme_imminent';

export interface SlotCanyonRoute {
  id: string;
  canyonName: string;
  routeName: string;
  region: string;
  technicalGrade: CanyonTechnicalGrade;
  flashFloodRisk: FlashFloodRiskLevel;
  maxRappelFt: number;
  numberOfRappels: number;
  longestRappelFt: number;
  wetsuitThicknessMm: number;
  typicalDurationHours: number;
  description: string;
  anchorFeatures: string[];
}

export interface RopeRiggingQuery {
  routeId: string;
  teamSize: number;
  ropeDiameterMm: number;
  pullCordType: 'dedicated_pull_line' | 'dual_rope_system' | 'fiddle_stick_retrievable';
  waterImmersionLevel: 'dry' | 'pothole_swimming' | 'flowing_water';
}

export interface RopeRiggingResult {
  canyonAndRouteName: string;
  recommendedRopeLengthFt: number;
  pullCordLengthFt: number;
  riggingAnchorSystem: string;
  riggingStatus: 'safe' | 'caution' | 'critical_hazard';
  neopreneSuitSpec: string;
  safetyAdvisory: string;
}

export interface CanyoneeringGearItem {
  id: string;
  name: string;
  category: 'harness_rigging' | 'rope_hardware' | 'thermal_protection' | 'pot_hole_escape' | 'pack_flotation';
  mandatory: boolean;
  description: string;
}

export const CANYON_ROUTES: SlotCanyonRoute[] = [
  {
    id: 'zion-subway-left-fork',
    canyonName: 'The Subway',
    routeName: 'Left Fork of North Creek',
    region: 'Zion National Park, UT',
    technicalGrade: 'class_3b',
    flashFloodRisk: 'moderate',
    maxRappelFt: 30,
    numberOfRappels: 3,
    longestRappelFt: 30,
    wetsuitThicknessMm: 4,
    typicalDurationHours: 7,
    description:
      'Iconic Zion subterranean slot canyon featuring curved tubular tunnel walls, emerald swimming pools, cold canyon wading, and bowling-ball drop rappels.',
    anchorFeatures: [
      'Cold water pothole swims',
      'Keyhole bowling ball rappel',
      'Emerald pools cascade',
    ],
  },
  {
    id: 'zion-mystery-canyon',
    canyonName: 'Mystery Canyon',
    routeName: 'Technical Descent',
    region: 'Zion National Park, UT',
    technicalGrade: 'class_3b',
    flashFloodRisk: 'moderate',
    maxRappelFt: 120,
    numberOfRappels: 12,
    longestRappelFt: 120,
    wetsuitThicknessMm: 3,
    typicalDurationHours: 8,
    description:
      'Dramatic steep slot descent terminating in a stunning two-stage 120-foot rappel down a dripping waterfall face directly into the Virgin River Narrows.',
    anchorFeatures: [
      'Mystery Springs rappel',
      'Terminal waterfall into The Narrows',
      'Natural webbing slings',
    ],
  },
  {
    id: 'escalante-choprock-canyon',
    canyonName: 'Choprock Canyon',
    routeName: 'Deep Slot',
    region: 'Grand Staircase-Escalante, UT',
    technicalGrade: 'class_4b',
    flashFloodRisk: 'high',
    maxRappelFt: 80,
    numberOfRappels: 7,
    longestRappelFt: 80,
    wetsuitThicknessMm: 5,
    typicalDurationHours: 11,
    description:
      'Formidable and remote high-commitment Escalante slot canyon with grim keeper potholes, log jams, cold sustained swimming, and strenuous pack hauling.',
    anchorFeatures: [
      'Log jam natural anchors',
      'Grim keeper potholes',
      'Serrated sandstone flute anchors',
    ],
  },
  {
    id: 'san-rafael-black-hole',
    canyonName: 'The Black Hole',
    routeName: 'White Canyon Gorge',
    region: 'San Rafael Swell, UT',
    technicalGrade: 'class_3c',
    flashFloodRisk: 'high',
    maxRappelFt: 40,
    numberOfRappels: 2,
    longestRappelFt: 40,
    wetsuitThicknessMm: 5,
    typicalDurationHours: 5,
    description:
      'Continuous frigid deep swim through a narrow, sunless slot corridor prone to violent flash flooding with sculpted fluted sandstone canyon narrows.',
    anchorFeatures: [
      'Sustained frigid gorge swim',
      'Fluted sculpted walls',
      'Boulder choke bypass',
    ],
  },
  {
    id: 'robbers-roost-bluejohn',
    canyonName: 'Bluejohn Canyon',
    routeName: 'Squeeze Fork',
    region: 'Robbers Roost, UT',
    technicalGrade: 'class_3a',
    flashFloodRisk: 'low',
    maxRappelFt: 90,
    numberOfRappels: 5,
    longestRappelFt: 90,
    wetsuitThicknessMm: 0,
    typicalDurationHours: 9,
    description:
      'Classic remote Robbers Roost labyrinth featuring tight subterranean squeeze slots, stemming, and an airy 90-foot free-hanging drop into the main canyon.',
    anchorFeatures: [
      'Squeeze slot chimneying',
      'Terminal 90ft dry drop',
      'Chockstone deadman anchors',
    ],
  },
];

export const CANYONEERING_GEAR: CanyoneeringGearItem[] = [
  {
    id: 'gear-harness',
    name: 'CE certified canyoneering harness with protective PVC scuff guard seat',
    category: 'harness_rigging',
    mandatory: true,
    description:
      'Heavy-duty canyon harness featuring reinforced tie-in points and a replaceable PVC armor seat for prolonged sandstone friction.',
  },
  {
    id: 'gear-rope',
    name: '8.3mm-to-9.2mm static hydrophobic canyoneering rope (dry treated)',
    category: 'rope_hardware',
    mandatory: true,
    description:
      'Low-elongation static canyoneering rope engineered with hydrophobic sheath fibers to resist water absorption and sandstone sheath abrading.',
  },
  {
    id: 'gear-descender',
    name: 'Figure-8 or Totem / Pirana variable-friction descender',
    category: 'rope_hardware',
    mandatory: true,
    description:
      'Versatile canyon rappel descender allowing rapid on-the-fly friction adjustments for single or double ropes across varying drop heights.',
  },
  {
    id: 'gear-wetsuit',
    name: '4mm-5mm sealed neoprene full wetsuit with glued blind-stitched seams',
    category: 'thermal_protection',
    mandatory: true,
    description:
      'Crucial thermal immersion barrier preventing hypothermia in sunless, spring-fed sandstone pothole pools and prolonged canyon swims.',
  },
  {
    id: 'gear-helmet',
    name: 'Sandstone canyoning helmet with drain vents (EN 12492)',
    category: 'harness_rigging',
    mandatory: true,
    description:
      'Impact-rated climbing and canyoning helmet with ventilation ports to quickly expel water upon plunging into deep pools.',
  },
  {
    id: 'gear-pothole-kit',
    name: 'Pothole escape kit (cheater stick, pot-shots, etrier ladder, Dyneema webbing)',
    category: 'pot_hole_escape',
    mandatory: true,
    description:
      'Specialized self-rescue kit for escaping scoured sandstone keeper potholes without bolted anchors.',
  },
];

export function getCanyonRoutes(grade?: CanyonTechnicalGrade): SlotCanyonRoute[] {
  if (!grade) {
    return CANYON_ROUTES;
  }
  return CANYON_ROUTES.filter((route) => route.technicalGrade === grade);
}

export function getCanyonRouteById(id: string): SlotCanyonRoute | undefined {
  return CANYON_ROUTES.find((route) => route.id === id);
}

export function getCanyoneeringGear(): CanyoneeringGearItem[] {
  return CANYONEERING_GEAR;
}

export function calculateRopeRiggingPlan(query: RopeRiggingQuery): RopeRiggingResult {
  const route = getCanyonRouteById(query.routeId);
  if (!route) {
    throw new Error(`Canyon route with id "${query.routeId}" not found.`);
  }

  const canyonAndRouteName = `${route.canyonName} — ${route.routeName}`;

  // Primary rope length needs to cover longest drop + 20ft buffer for anchor tie-offs and rigging
  const recommendedRopeLengthFt = route.longestRappelFt + 20;
  const pullCordLengthFt = recommendedRopeLengthFt;

  // Rigging anchor system advice
  let riggingAnchorSystem = '';
  if (query.pullCordType === 'dual_rope_system') {
    riggingAnchorSystem =
      'Dual-rope contingency block (releasable Figure-8 on a bight or Joker rig) with isolated strands allowing immediate lower if a rappeller gets stuck or tangled in hydraulics.';
  } else if (query.pullCordType === 'fiddle_stick_retrievable') {
    riggingAnchorSystem =
      'Smooth Operator / FiddleStick retrievable toggle anchor rigged with releasable stone knot backup for first descenders; last person down pulls the toggle pin.';
  } else {
    riggingAnchorSystem =
      'Single-rope contingency anchor with Alpine Butterfly or releasable Munter-Mule block hitched to primary anchor, with separate lightweight static pull cord.';
  }

  // Rigging status determination
  let riggingStatus: RopeRiggingResult['riggingStatus'] = 'safe';

  if (
    query.pullCordType === 'fiddle_stick_retrievable' &&
    query.waterImmersionLevel === 'flowing_water'
  ) {
    riggingStatus = 'critical_hazard';
  } else if (
    route.flashFloodRisk === 'extreme_imminent'
  ) {
    riggingStatus = 'critical_hazard';
  } else if (
    query.ropeDiameterMm < 8.3 ||
    route.flashFloodRisk === 'high' ||
    (query.teamSize > 4 && query.pullCordType === 'fiddle_stick_retrievable') ||
    query.waterImmersionLevel === 'flowing_water'
  ) {
    riggingStatus = 'caution';
  }

  // Neoprene thermal suit specification
  let neopreneSuitSpec = '';
  if (route.wetsuitThicknessMm === 0 && query.waterImmersionLevel === 'dry') {
    neopreneSuitSpec =
      'No wetsuit required. Quick-dry technical hiking layers and sandstone knee protection.';
  } else if (
    query.waterImmersionLevel === 'flowing_water' ||
    route.wetsuitThicknessMm >= 5
  ) {
    neopreneSuitSpec =
      '5mm full sealed neoprene wetsuit with integrated hood, 3mm neoprene booties, and reinforced elbow/knee pads for sustained cold water immersion.';
  } else if (
    route.wetsuitThicknessMm >= 4 ||
    query.waterImmersionLevel === 'pothole_swimming'
  ) {
    neopreneSuitSpec =
      '4mm-5mm glued and blind-stitched full steamer wetsuit with 3mm neoprene socks and thermal rashguard.';
  } else {
    neopreneSuitSpec =
      '3mm full neoprene wetsuit or 3mm Farmer John with windbreaker shell and neoprene canyon socks.';
  }

  // Safety advisory synthesis
  const advisories: string[] = [];

  if (
    query.pullCordType === 'fiddle_stick_retrievable' &&
    query.waterImmersionLevel === 'flowing_water'
  ) {
    advisories.push(
      'CRITICAL HAZARD: Retrievable FiddleStick toggle systems must NEVER be deployed in flowing water! Hydraulic turbulence and water weight can dislodge the toggle pin prematurely or jam the pull line, causing catastrophic anchor failure.'
    );
  }

  if (route.flashFloodRisk === 'high') {
    advisories.push(
      'HIGH FLASH FLOOD DANGER: This slot canyon has extensive upstream drainage basins with zero escape routes once committed into the narrows. Check NOAA flash flood potential and canyon radar before entering.'
    );
  } else if (route.flashFloodRisk === 'moderate') {
    advisories.push(
      `MODERATE FLASH FLOOD RISK in ${route.canyonName}: Monitor weather closely. Never enter canyon if convective storms or heavy cloud cover threaten the drainage basin.`
    );
  } else {
    advisories.push(
      `Flash flood risk is low for ${route.canyonName} under stable regional weather forecasts.`
    );
  }

  if (query.ropeDiameterMm < 8.3) {
    advisories.push(
      `Warning: Rope diameter (${query.ropeDiameterMm.toFixed(1)}mm) is thin for technical sandstone drops: use extra friction carabiners on descender and vigilantly pad sharp edges.`
    );
  } else {
    advisories.push(
      `Standard ${query.ropeDiameterMm.toFixed(1)}mm static canyoneering rope provides robust abrasion resistance over sandstone edges.`
    );
  }

  if (query.teamSize <= 2) {
    advisories.push(
      'Small team of 2 has no rescue redundancy if a teammate is injured or stuck on rope.'
    );
  } else if (query.teamSize > 4) {
    advisories.push(
      `Team of ${query.teamSize} requires disciplined rappel transitions to prevent cold water exposure bottlenecks at pool drops.`
    );
  } else {
    advisories.push(
      `Optimal team size (${query.teamSize} canyoneers) balancing rapid rappel transitions and group rescue redundancy.`
    );
  }

  const safetyAdvisory = advisories.join(' ');

  return {
    canyonAndRouteName,
    recommendedRopeLengthFt,
    pullCordLengthFt,
    riggingAnchorSystem,
    riggingStatus,
    neopreneSuitSpec,
    safetyAdvisory,
  };
}
