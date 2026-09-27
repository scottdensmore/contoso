export type SaddleRigging =
  | 'wood_crossbuck_pack'
  | 'decker_cinch_pack'
  | 'articulated_fiberglass_tree';

export type BalanceStatus =
  | 'perfect_balance'
  | 'acceptable_balance'
  | 'unbalanced_girth_gall_risk';

export type CapacityStatus =
  | 'light_cruising_load'
  | 'optimal_working_capacity'
  | 'overloaded_spine_strain';

export interface PackLlamaRoute {
  id: string;
  title: string;
  wildernessArea: string;
  nationalForest: string;
  elevationMeters: number;
  saddleRigging: SaddleRigging;
  maxStringLlamas: number;
  typicalDays: number;
  description: string;
  highlights: string[];
}

export interface PackLlamaQuery {
  routeId: string;
  saddleRigging: SaddleRigging; // default 'wood_crossbuck_pack'
  llamaBodyWeightLbs: number; // 300 to 450 lbs, default 360
  leftPannierLbs: number; // 15 to 45 lbs, default 32
  rightPannierLbs: number; // 15 to 45 lbs, default 32
  saddlePadWeightLbs: number; // 8 to 18 lbs, default 12
  trailElevationMeters: number; // 1500 to 4000 meters, default 3200
}

export interface PackLlamaResult {
  routeTitle: string;
  saddleRigging: SaddleRigging;
  totalPayloadLbs: number;
  payloadPercentage: number;
  weightDifferenceLbs: number;
  balanceStatus: BalanceStatus;
  capacityStatus: CapacityStatus;
  highlineSpacingMeters: number;
  dailyWaterEstimateGal: number;
  riggingAdvisory: string;
  trailEtiquetteGuidance: string;
}

export interface PackLlamaGearItem {
  id: string;
  name: string;
  category:
    | 'rigging'
    | 'containment'
    | 'storage'
    | 'handling'
    | 'hoofcare'
    | 'safety';
  mandatory: boolean;
  description: string;
}

export const PACK_LLAMA_ROUTES: PackLlamaRoute[] = [
  {
    id: 'high-sierra-bishop-pass',
    title: 'High Sierra Bishop Pass & Dusy Basin Llama Trek',
    wildernessArea: 'John Muir Wilderness',
    nationalForest: 'Inyo National Forest, CA, USA',
    elevationMeters: 3650,
    saddleRigging: 'wood_crossbuck_pack',
    maxStringLlamas: 4,
    typicalDays: 5,
    description:
      'Spectacular High Sierra granite switchbacks and hanging alpine lake basins traversed with minimal impact on fragile alpine turf.',
    highlights: [
      'Granite switchback agility',
      'Two-toed soft pad low meadow impact',
      'Dusy Basin alpine camp string picket',
    ],
  },
  {
    id: 'wind-river-cirque-towers',
    title: 'Wind River Cirque of the Towers Llama Expedition',
    wildernessArea: 'Bridger Wilderness',
    nationalForest: 'Bridger-Teton National Forest, WY, USA',
    elevationMeters: 3250,
    saddleRigging: 'articulated_fiberglass_tree',
    maxStringLlamas: 4,
    typicalDays: 6,
    description:
      'Glaciated granite peaks and boulder talus fields where agile working gelding llamas carry wilderness expedition loads.',
    highlights: [
      'Cirque of the Towers granite monoliths',
      'Grizzly bear canister pannier stowage',
      'Highline tree-saver overnight picketing',
    ],
  },
  {
    id: 'san-juan-weminuche-pass',
    title: 'Weminuche Wilderness Continental Divide Llama Trek',
    wildernessArea: 'Weminuche Wilderness',
    nationalForest: 'San Juan National Forest, CO, USA',
    elevationMeters: 3800,
    saddleRigging: 'decker_cinch_pack',
    maxStringLlamas: 5,
    typicalDays: 7,
    description:
      'The largest wilderness area in Colorado featuring long high-tundra traverses and subalpine forest campsites along the Continental Divide.',
    highlights: [
      'High tundra Continental Divide ridges',
      'Browse grazing alpine shrub foraging',
      'Deep canyon switchback stability',
    ],
  },
  {
    id: 'pasayten-boundary-trail',
    title: 'Pasayten Wilderness Northern Loop Llama Pack',
    wildernessArea: 'Pasayten Wilderness',
    nationalForest: 'Okanogan-Wenatchee National Forest, WA, USA',
    elevationMeters: 2200,
    saddleRigging: 'wood_crossbuck_pack',
    maxStringLlamas: 5,
    typicalDays: 6,
    description:
      'Remote Pacific Northwest border trail traversing golden subalpine larch corridors with designated low-impact meadow rotation.',
    highlights: [
      'Subalpine larch golden autumn traverses',
      'Low-impact meadow grazing rotation',
      'Calm trail pack string disposition',
    ],
  },
  {
    id: 'uinta-four-lakes-basin',
    title: 'High Uintas Four Lakes Basin Llama Expedition',
    wildernessArea: 'High Uintas Wilderness',
    nationalForest: 'Ashley National Forest, UT, USA',
    elevationMeters: 3350,
    saddleRigging: 'articulated_fiberglass_tree',
    maxStringLlamas: 4,
    typicalDays: 4,
    description:
      'High alpine plateau dotted with crystal clear glacial lakes and quartzite boulder fields ideal for sure-footed pack llamas.',
    highlights: [
      'Quartzite boulder field sure-footedness',
      'High-altitude lake chain circumnavigation',
      'Rapid summer thunderstorm bivouac',
    ],
  },
];

export const PACK_LLAMA_GEAR_CHECKLIST: PackLlamaGearItem[] = [
  {
    id: 'padded-llama-pack-saddle',
    name: 'Contoured Wool-Felt Padded Llama Pack Saddle with Britchen & Breast Collar',
    category: 'rigging',
    mandatory: true,
    description:
      'Distributes weight evenly along ribcage while preventing forward/aft slippage on steep grades',
  },
  {
    id: 'highline-tree-savers-swivels',
    name: 'Low-Impact Highline System with 4-Inch Tree Savers & In-Line Swivels',
    category: 'containment',
    mandatory: true,
    description:
      'Protects sensitive high-altitude bark from girdling while allowing 360-degree llama browse radius',
  },
  {
    id: 'dual-side-balanced-panniers',
    name: 'Heavy-Duty Cordura Dual Pack Panniers with Compression Cinch Straps',
    category: 'storage',
    mandatory: true,
    description:
      'Tear-resistant pack bags keeping gear tight against the pack frame over boulder passes',
  },
  {
    id: 'breakaway-lead-and-halter',
    name: 'Fitted Llama Halter with Leather Breakaway Fuse & 10ft Cotton Lead',
    category: 'handling',
    mandatory: true,
    description:
      'Safely releases under emergency snag loads while maintaining trail string connection',
  },
  {
    id: 'llama-hoof-shears-styptic',
    name: 'Compound-Lever Toe Shears & Styptic Antiseptic Powder',
    category: 'hoofcare',
    mandatory: true,
    description:
      'Maintains two-toed soft foot pads and prevents nail cracking over rough granite talus',
  },
  {
    id: 'bear-resistant-food-canisters',
    name: 'IGBC-Approved Bear-Resistant Food Canisters for Pannier Stowage',
    category: 'safety',
    mandatory: true,
    description:
      'Mandatory wilderness food storage canisters sized specifically for llama pack panniers',
  },
];

export function getPackLlamaRoutes(rigging?: SaddleRigging): PackLlamaRoute[] {
  if (!rigging) {
    return PACK_LLAMA_ROUTES;
  }
  return PACK_LLAMA_ROUTES.filter((route) => route.saddleRigging === rigging);
}

export function getPackLlamaRouteById(id: string): PackLlamaRoute | undefined {
  return PACK_LLAMA_ROUTES.find((route) => route.id === id);
}

export function getPackLlamaGearChecklist(): PackLlamaGearItem[] {
  return PACK_LLAMA_GEAR_CHECKLIST;
}

export function calculatePackLlamaPayload(query: PackLlamaQuery): PackLlamaResult {
  const route = getPackLlamaRouteById(query.routeId) ?? PACK_LLAMA_ROUTES[0];

  const totalPayloadLbs =
    query.leftPannierLbs + query.rightPannierLbs + query.saddlePadWeightLbs;
  const payloadPercentage =
    Math.round((totalPayloadLbs / query.llamaBodyWeightLbs) * 1000) / 10;
  const weightDifferenceLbs =
    Math.round(Math.abs(query.leftPannierLbs - query.rightPannierLbs) * 10) / 10;

  let balanceStatus: BalanceStatus;
  if (weightDifferenceLbs <= 1.5) {
    balanceStatus = 'perfect_balance';
  } else if (weightDifferenceLbs <= 3.5) {
    balanceStatus = 'acceptable_balance';
  } else {
    balanceStatus = 'unbalanced_girth_gall_risk';
  }

  let capacityStatus: CapacityStatus;
  if (payloadPercentage <= 18.0) {
    capacityStatus = 'light_cruising_load';
  } else if (payloadPercentage <= 25.0) {
    capacityStatus = 'optimal_working_capacity';
  } else {
    capacityStatus = 'overloaded_spine_strain';
  }

  const highlineSpacingMeters = 3.5;
  const dailyWaterEstimateGal =
    Math.round(query.llamaBodyWeightLbs * 0.0055 * 10) / 10;

  let riggingAdvisory: string;
  if (balanceStatus === 'unbalanced_girth_gall_risk') {
    riggingAdvisory = `Warning: Side pannier weight difference of ${weightDifferenceLbs} lbs creates severe girth gall and saddle sore risk. Equalize panniers within 1.5 lbs immediately to prevent ribcage tissue damage on high-altitude ascents.`;
  } else if (balanceStatus === 'acceptable_balance') {
    riggingAdvisory = `Acceptable balance: ${weightDifferenceLbs} lbs side variance. Check cinch tension, britchen, and breast collar regularly over steep alpine switchbacks.`;
  } else {
    riggingAdvisory = `Perfect balance: Side pannier weights are equal or within 1.5 lbs. Optimal load symmetry protects the spine and avoids girth friction across rugged passes.`;
  }

  const trailEtiquetteGuidance = `Pack llamas yield right-of-way to uphill hikers and saddle equines. When passing other parties, talk calmly so horses identify the pack string, keep llamas on designated tread to preserve fragile alpine meadows, and maintain a minimum ${highlineSpacingMeters}m spacing between animals on overnight highlines.`;

  return {
    routeTitle: route.title,
    saddleRigging: query.saddleRigging,
    totalPayloadLbs,
    payloadPercentage,
    weightDifferenceLbs,
    balanceStatus,
    capacityStatus,
    highlineSpacingMeters,
    dailyWaterEstimateGal,
    riggingAdvisory,
    trailEtiquetteGuidance,
  };
}
