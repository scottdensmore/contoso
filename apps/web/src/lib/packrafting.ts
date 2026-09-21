export type PackraftRiverGrade =
  | 'class_i_flatwater'
  | 'class_ii_mild'
  | 'class_iii_moderate'
  | 'class_iv_technical';

export type WaterFlowStatus =
  | 'low_scrape'
  | 'optimal'
  | 'high_flush'
  | 'flood_warning';

export interface PackraftRoute {
  id: string;
  riverName: string;
  sectionName: string;
  region: string;
  riverMiles: number;
  portageMiles: number;
  riverGrade: PackraftRiverGrade;
  flowStatus: WaterFlowStatus;
  minFlowCfs: number;
  maxFlowCfs: number;
  currentFlowCfs: number;
  spraydeckRequired: boolean;
  description: string;
  portageKeyFeatures: string[];
}

export interface PackraftPlanQuery {
  routeId: string;
  paddlerSkill: 'beginner' | 'intermediate' | 'expert';
  flowRateCfs: number;
  boatWeightCapacityKg: number;
  paddlerWeightWithGearKg: number;
}

export interface PackraftPlanResult {
  riverAndSectionName: string;
  flowFeasibility: 'navigable' | 'scrape_risk' | 'hazardous_high';
  recommendedSpraydeckType: 'open_bucket' | 'self_bailer' | 'whitewater_deck';
  payloadMarginKg: number;
  breakdownPaddleLengthCm: number;
  safetyAdvisory: string;
}

export interface PackraftGearItem {
  id: string;
  name: string;
  category: 'boat_hull' | 'paddle' | 'safety' | 'portage_cargo' | 'repair';
  mandatory: boolean;
  description: string;
}

export const PACKRAFT_ROUTES: PackraftRoute[] = [
  {
    id: 'frank-church-middle-fork-salmon',
    riverName: 'Middle Fork Salmon River',
    sectionName: 'Wilderness Section',
    region: 'Frank Church Wilderness, ID',
    riverMiles: 96,
    portageMiles: 4.5,
    riverGrade: 'class_iii_moderate',
    flowStatus: 'optimal',
    minFlowCfs: 1200,
    maxFlowCfs: 3500,
    currentFlowCfs: 2100,
    spraydeckRequired: true,
    description:
      'Premier multi-day backcountry whitewater expedition through deep granite canyons, thermal hot springs, and continuous boulder rapids.',
    portageKeyFeatures: [
      'Impassable Canyon portages',
      'Hot springs camps',
      'Granite boulder garden rapids',
    ],
  },
  {
    id: 'bob-marshall-south-fork-flathead',
    riverName: 'South Fork Flathead River',
    sectionName: 'Meadow Creek Gorge',
    region: 'Bob Marshall Wilderness, MT',
    riverMiles: 42,
    portageMiles: 12.0,
    riverGrade: 'class_ii_mild',
    flowStatus: 'optimal',
    minFlowCfs: 800,
    maxFlowCfs: 2400,
    currentFlowCfs: 1450,
    spraydeckRequired: false,
    description:
      'Remote backcountry packrafting and native cutthroat trout expedition accessed via wilderness horse trails.',
    portageKeyFeatures: [
      'Meadow Creek gorge mandatory portage',
      'Cutthroat trout pools',
      'Pack-horse trail access',
    ],
  },
  {
    id: 'alaska-talkeetna-river-wilderness',
    riverName: 'Talkeetna River',
    sectionName: 'Deep Wilderness Traverse',
    region: 'Talkeetna Mountains, AK',
    riverMiles: 70,
    portageMiles: 8.0,
    riverGrade: 'class_iv_technical',
    flowStatus: 'high_flush',
    minFlowCfs: 2000,
    maxFlowCfs: 6500,
    currentFlowCfs: 5200,
    spraydeckRequired: true,
    description:
      'Remote sub-arctic fly-in expedition through steep Class IV canyon rapids and glacial braided waterways.',
    portageKeyFeatures: [
      'Talkeetna Canyon Class IV rapids',
      'Grizzly bear corridors',
      'Glacial silt hydraulics',
    ],
  },
  {
    id: 'escalante-river-desert-canyon',
    riverName: 'Escalante River',
    sectionName: 'Desert Slickrock Canyons',
    region: 'Grand Staircase-Escalante, UT',
    riverMiles: 35,
    portageMiles: 2.0,
    riverGrade: 'class_i_flatwater',
    flowStatus: 'low_scrape',
    minFlowCfs: 50,
    maxFlowCfs: 300,
    currentFlowCfs: 85,
    spraydeckRequired: false,
    description:
      'Desert slickrock canyon floating among towering sandstone walls, hanging gardens, and ancient alcoves.',
    portageKeyFeatures: [
      'Slickrock canyon narrows',
      'Beaver dam portages',
      'Desert alcove cliff camps',
    ],
  },
  {
    id: 'green-river-desolation-canyon',
    riverName: 'Green River',
    sectionName: 'Desolation & Gray Canyons',
    region: 'Tavaputs Plateau, UT',
    riverMiles: 84,
    portageMiles: 1.5,
    riverGrade: 'class_ii_mild',
    flowStatus: 'optimal',
    minFlowCfs: 2500,
    maxFlowCfs: 8000,
    currentFlowCfs: 4200,
    spraydeckRequired: false,
    description:
      'Iconic 84-mile desert wilderness river corridor featuring historic cattle ranches and friendly roller-coaster rapids.',
    portageKeyFeatures: [
      'Historic abandoned ranches',
      'Cottonwood sandbars',
      'Joe Hutch Canyon rapid',
    ],
  },
];

export const PACKRAFT_GEAR: PackraftGearItem[] = [
  {
    id: 'packraft-tpu-tizip',
    name: 'Ultralight TPU fabric packraft with internal TiZip cargo zipper',
    category: 'boat_hull',
    mandatory: true,
    description:
      'Rugged lightweight urethane packraft with internal dry cargo storage in pontoon tubes.',
  },
  {
    id: 'breakdown-paddle',
    name: '4-piece breakdown packrafting paddle with carbon shaft',
    category: 'paddle',
    mandatory: true,
    description:
      'Ultra-packable breakdown paddle designed for tight rucksack stowage and rapid field assembly.',
  },
  {
    id: 'whitewater-pfd',
    name: 'USCG Type III/V Whitewater PFD with low-profile flotation',
    category: 'safety',
    mandatory: true,
    description:
      'High-buoyancy low-profile vest engineered for wilderness whitewater swim mobility.',
  },
  {
    id: 'inflation-bag',
    name: 'Lightweight rapid inflation bag (nylon pump bag) & top-off twist valve',
    category: 'boat_hull',
    mandatory: true,
    description:
      'High-volume ripstop nylon inflation bag with rapid screw collar and top-off twist valve.',
  },
  {
    id: 'whitewater-helmet',
    name: 'Whitewater kayak helmet (CE/UIAA certified)',
    category: 'safety',
    mandatory: true,
    description:
      'Impact-resistant CE/UIAA certified multi-impact helmet with temple coverage and ear drains.',
  },
  {
    id: 'repair-kit',
    name: 'Packraft emergency field repair kit (Aquaseal, Tenacious Tape, alcohol pads, spare valve)',
    category: 'repair',
    mandatory: true,
    description:
      'Crucial backcountry repair kit with urethane adhesive, patches, alcohol swabs, and spare valve stem.',
  },
];

export function getPackraftRoutes(grade?: PackraftRiverGrade): PackraftRoute[] {
  if (!grade) {
    return PACKRAFT_ROUTES;
  }
  return PACKRAFT_ROUTES.filter((route) => route.riverGrade === grade);
}

export function getPackraftRouteById(id: string): PackraftRoute | undefined {
  return PACKRAFT_ROUTES.find((route) => route.id === id);
}

export function getPackraftGear(): PackraftGearItem[] {
  return PACKRAFT_GEAR;
}

export function calculatePackraftPlan(query: PackraftPlanQuery): PackraftPlanResult {
  const route = getPackraftRouteById(query.routeId);
  if (!route) {
    throw new Error(`Packraft route with id "${query.routeId}" not found.`);
  }

  const riverAndSectionName = `${route.riverName} — ${route.sectionName}`;
  const payloadMarginKg = query.boatWeightCapacityKg - query.paddlerWeightWithGearKg;

  // Flow feasibility
  let flowFeasibility: PackraftPlanResult['flowFeasibility'] = 'navigable';
  if (query.flowRateCfs < route.minFlowCfs) {
    flowFeasibility = 'scrape_risk';
  } else if (query.flowRateCfs > route.maxFlowCfs) {
    flowFeasibility = 'hazardous_high';
  }

  // Recommended spraydeck type
  let recommendedSpraydeckType: PackraftPlanResult['recommendedSpraydeckType'] = 'open_bucket';
  if (
    route.riverGrade === 'class_iv_technical' ||
    route.riverGrade === 'class_iii_moderate' ||
    route.spraydeckRequired
  ) {
    recommendedSpraydeckType = 'whitewater_deck';
  } else if (route.riverGrade === 'class_ii_mild') {
    recommendedSpraydeckType = 'self_bailer';
  } else {
    recommendedSpraydeckType = 'open_bucket';
  }

  // Recommended paddle length based on whitewater grade & packraft beam
  let breakdownPaddleLengthCm = 210;
  if (route.riverGrade === 'class_iv_technical') {
    breakdownPaddleLengthCm = 205;
  } else if (route.riverGrade === 'class_iii_moderate') {
    breakdownPaddleLengthCm = 210;
  } else if (route.riverGrade === 'class_ii_mild') {
    breakdownPaddleLengthCm = 215;
  } else if (route.riverGrade === 'class_i_flatwater') {
    breakdownPaddleLengthCm = 220;
  }

  // Construct comprehensive safety advisory
  const advisories: string[] = [];

  if (flowFeasibility === 'scrape_risk') {
    advisories.push(
      `Low scrape risk: ${query.flowRateCfs} CFS is below the runnable minimum (${route.minFlowCfs} CFS). Expect shallow gravel bar portaging, hull abrasion, and slow travel.`
    );
  } else if (flowFeasibility === 'hazardous_high') {
    advisories.push(
      `Hazardous high water: ${query.flowRateCfs} CFS exceeds the safe operating threshold (${route.maxFlowCfs} CFS). High flood volume creates dangerous boiling eddies, washed-out features, and severe swim hazards.`
    );
  } else {
    advisories.push(
      `Navigable flow: ${query.flowRateCfs} CFS falls within the prime runnable window (${route.minFlowCfs} – ${route.maxFlowCfs} CFS). River hydraulics and eddies are in optimal condition.`
    );
  }

  // Paddler skill match
  if (route.riverGrade === 'class_iv_technical') {
    if (query.paddlerSkill !== 'expert') {
      advisories.push(
        'Severe skill mismatch: Class IV technical whitewater demands expert boat control, rapid combat self-rescue, and experienced group safety boaters. Not suitable for beginner or intermediate paddlers.'
      );
    }
  } else if (route.riverGrade === 'class_iii_moderate') {
    if (query.paddlerSkill === 'beginner') {
      advisories.push(
        'Skill advisory: Class III moderate rapids require active ferry angles and aggressive defensive swimming skills. Beginners should only attempt with professional guides or experienced mentors.'
      );
    }
  }

  // Payload margin warning
  if (payloadMarginKg < 15) {
    advisories.push(
      `Warning: Boat payload safety margin is critically tight or overloaded (${payloadMarginKg} kg remaining). Overloaded packrafts suffer sluggish turning responsiveness, low freeboard, and increased risk of swamping in standing waves.`
    );
  } else {
    advisories.push(
      `Payload capacity is secure with a healthy ${payloadMarginKg} kg safety margin for expedition gear.`
    );
  }

  const safetyAdvisory = advisories.join(' ');

  return {
    riverAndSectionName,
    flowFeasibility,
    recommendedSpraydeckType,
    payloadMarginKg,
    breakdownPaddleLengthCm,
    safetyAdvisory,
  };
}
