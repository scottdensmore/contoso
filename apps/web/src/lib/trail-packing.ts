export type SaddleType = 'decker' | 'sawbuck';
export type PackTerrain = 'mountain_pass' | 'alpine_meadow' | 'boulder_pass' | 'plateau_forest' | 'canyon_breaks';
export type StockAnimalType = 'mule' | 'pack_horse' | 'quarter_horse';
export type HitchType = 'diamond_hitch' | 'box_hitch' | 'squaw_hitch' | 'barrel_hitch';
export type BalanceStatus = 'balanced' | 'acceptable' | 'unbalanced_risk_galls';
export type PayloadCapacityStatus = 'within_capacity' | 'near_capacity' | 'overloaded_injury_risk';

export interface PackRoute {
  id: string;
  title: string;
  wildernessArea: string;
  nationalForest: string;
  elevationM: number;
  saddleType: SaddleType;
  terrain: PackTerrain;
  maxStringMules: number;
  typicalDays: number;
  description: string;
  routeHighlights: string[];
}

export interface TrailPackingQuery {
  routeId: string;
  stockAnimal: StockAnimalType; // default 'mule'
  leftPannierLbs: number; // 20 to 120 lbs, default 65
  rightPannierLbs: number; // 20 to 120 lbs, default 65
  topPackLbs: number; // 0 to 50 lbs, default 20
  hitchType: HitchType; // default 'diamond_hitch'
}

export interface TrailPackingResult {
  routeTitle: string;
  stockAnimal: StockAnimalType;
  totalPayloadLbs: number;
  weightDifferenceLbs: number;
  balanceRatio: number;
  balanceStatus: BalanceStatus;
  payloadCapacityStatus: PayloadCapacityStatus;
  recommendedHitchAdjustment: string;
  highlineSpacingM: number;
}

export interface TackChecklistItem {
  id: string;
  name: string;
  category: 'containment' | 'rigging' | 'tack' | 'storage' | 'hoofcare' | 'repair';
  mandatory: boolean;
  description: string;
}

export const ANIMAL_STANDARDS: Record<StockAnimalType, { bodyWeightLbs: number; maxPayloadLbs: number; label: string }> = {
  mule: { bodyWeightLbs: 950, maxPayloadLbs: 190, label: 'Mule (950 lbs)' },
  pack_horse: { bodyWeightLbs: 1100, maxPayloadLbs: 220, label: 'Pack Horse (1100 lbs)' },
  quarter_horse: { bodyWeightLbs: 1000, maxPayloadLbs: 200, label: 'Quarter Horse (1000 lbs)' },
};

export const PACK_ROUTES: PackRoute[] = [
  {
    id: 'bob-marshall-wilderness',
    title: 'Bob Marshall Wilderness & Chinese Wall Pack String',
    wildernessArea: 'Bob Marshall Wilderness',
    nationalForest: 'Flathead National Forest, MT, USA',
    elevationM: 2300,
    saddleType: 'decker',
    terrain: 'mountain_pass',
    maxStringMules: 6,
    typicalDays: 7,
    description:
      'Legendary Northern Rockies wilderness traverse skirting the 1,000-foot limestone escarpment of the Chinese Wall, featuring Continental Divide river fords and historic Forest Service pack bridges.',
    routeHighlights: [
      'Chinese Wall limestone escarpment',
      'Highline tree saver overnight picketing',
      'Continental Divide river fords',
    ],
  },
  {
    id: 'pasayten-wilderness',
    title: 'Pasayten Wilderness Border Trail Expedition',
    wildernessArea: 'Pasayten Wilderness',
    nationalForest: 'Okanogan-Wenatchee National Forest, WA, USA',
    elevationM: 2150,
    saddleType: 'sawbuck',
    terrain: 'alpine_meadow',
    maxStringMules: 5,
    typicalDays: 6,
    description:
      'Expedition through remote northern Washington wilderness featuring golden subalpine larch corridors, open ridge traverses along the Canadian border, and designated wilderness meadow stock rotations.',
    routeHighlights: [
      'Subalpine larch corridor traverses',
      'Diamond hitch timberline lashing',
      'Designated wilderness meadow rotation',
    ],
  },
  {
    id: 'wind-river-range',
    title: 'Wind River High Route & Cirque Pack Expedition',
    wildernessArea: 'Bridger Wilderness',
    nationalForest: 'Bridger-Teton National Forest, WY, USA',
    elevationM: 3200,
    saddleType: 'decker',
    terrain: 'boulder_pass',
    maxStringMules: 4,
    typicalDays: 8,
    description:
      'High-altitude expedition over rugged granite talus passes and glacial cirques requiring meticulous pannier balancing over 10,000 feet and bear-resistant mantmy panniers.',
    routeHighlights: [
      'Granite talus pass switchbacks',
      'Pannier balance calibration over 10,000ft',
      'Bear-resistant hard-sided mantmy panniers',
    ],
  },
  {
    id: 'pecos-wilderness',
    title: 'Pecos Wilderness Truchas Peaks Circuit',
    wildernessArea: 'Pecos Wilderness',
    nationalForest: 'Santa Fe National Forest, NM, USA',
    elevationM: 2800,
    saddleType: 'sawbuck',
    terrain: 'plateau_forest',
    maxStringMules: 4,
    typicalDays: 5,
    description:
      'Southern Rocky Mountain pack circuit traversing high mesa aspen groves and subalpine plateaus beneath the Truchas Peaks with traditional sawbuck box hitch packing.',
    routeHighlights: [
      'High mesa aspen grove trails',
      'Box hitch duffel packing',
      'Leave No Trace horse grazing containment',
    ],
  },
  {
    id: 'frank-church-river-of-no-return',
    title: 'Frank Church Salmon River Breaks Trail',
    wildernessArea: 'Frank Church River of No Return Wilderness',
    nationalForest: 'Payette National Forest, ID, USA',
    elevationM: 1900,
    saddleType: 'decker',
    terrain: 'canyon_breaks',
    maxStringMules: 6,
    typicalDays: 9,
    description:
      'Demanding canyon expedition navigating steep river canyon switchbacks along the Salmon River breaks with lead line tensioning and gravel river bar picket camps.',
    routeHighlights: [
      'Steep canyon switchback pack strings',
      'Mule string lead line tensioning',
      'River bar night picket camp',
    ],
  },
];

export const TACK_CHECKLIST: TackChecklistItem[] = [
  {
    id: 'tree-saver-highline-straps',
    name: 'Wide Nylon Tree-Saver Straps & 100ft Static Kernmantle Highline',
    category: 'containment',
    mandatory: true,
    description:
      'Protects sensitive tree bark from rope girdling and provides safe overhead tethering for the entire pack string.',
  },
  {
    id: 'breakaway-lead-ropes',
    name: 'Heavy-Duty Cotton Lead Ropes with Leather Breakaway Fuses',
    category: 'rigging',
    mandatory: true,
    description:
      'Prevents fatal neck trauma in wrecks while maintaining secure string trail spacing.',
  },
  {
    id: 'contoured-pack-pads',
    name: '1-Inch Pressed Wool Contoured Pack Saddle Blankets',
    category: 'tack',
    mandatory: true,
    description:
      'Absorbs sweat, prevents saddle sores and cinch galling, and conforms to equine withers under heavy loads.',
  },
  {
    id: 'bear-resistant-panniers',
    name: 'IGBC-Approved Certified Bear-Resistant Hard-Sided Pack Panniers',
    category: 'storage',
    mandatory: true,
    description:
      'Interagency Grizzly Bear Committee certified panniers to protect backcountry rations and meet wilderness food storage orders.',
  },
  {
    id: 'easyboot-trail-spares',
    name: 'Emergency Equine Trail Hoof Boots & Rasp Set',
    category: 'hoofcare',
    mandatory: true,
    description:
      'Replaces thrown iron shoes on rocky trails and dresses damaged hoof walls until the wrangler can reshoe.',
  },
  {
    id: 'leather-punch-mending-kit',
    name: 'Rotary Leather Hole Punch, Copper Rivets, & Waxed Awl Mending Kit',
    category: 'repair',
    mandatory: true,
    description:
      'Field repair toolkit for breeching, breast collars, cinch straps, and latigos damaged on the trail.',
  },
];

export function getPackRoutes(saddle?: SaddleType): PackRoute[] {
  if (!saddle) {
    return [...PACK_ROUTES];
  }
  return PACK_ROUTES.filter((r) => r.saddleType === saddle);
}

export function getPackRouteById(id: string): PackRoute | undefined {
  return PACK_ROUTES.find((r) => r.id === id);
}

export function getTackChecklist(): TackChecklistItem[] {
  return [...TACK_CHECKLIST];
}

export function calculateTrailPacking(query: TrailPackingQuery): TrailPackingResult {
  const route = getPackRouteById(query.routeId) ?? PACK_ROUTES[0];
  const animalStandard = ANIMAL_STANDARDS[query.stockAnimal] ?? ANIMAL_STANDARDS.mule;

  const totalPayloadLbs = query.leftPannierLbs + query.rightPannierLbs + query.topPackLbs;
  const weightDifferenceLbs = Math.abs(query.leftPannierLbs - query.rightPannierLbs);

  const maxPannier = Math.max(query.leftPannierLbs, query.rightPannierLbs);
  const minPannier = Math.min(query.leftPannierLbs, query.rightPannierLbs);
  const balanceRatio = maxPannier > 0 ? Math.round((minPannier / maxPannier) * 100) / 100 : 1;

  let balanceStatus: BalanceStatus = 'balanced';
  if (weightDifferenceLbs > 5) {
    balanceStatus = 'unbalanced_risk_galls';
  } else if (weightDifferenceLbs > 2) {
    balanceStatus = 'acceptable';
  }

  let payloadCapacityStatus: PayloadCapacityStatus = 'within_capacity';
  if (totalPayloadLbs > animalStandard.maxPayloadLbs) {
    payloadCapacityStatus = 'overloaded_injury_risk';
  } else if (totalPayloadLbs >= animalStandard.maxPayloadLbs * 0.85) {
    payloadCapacityStatus = 'near_capacity';
  }

  // Recommended hitch adjustment advisory
  let recommendedHitchAdjustment = '';
  if (balanceStatus === 'unbalanced_risk_galls') {
    const heavier = query.leftPannierLbs > query.rightPannierLbs ? 'Left' : 'Right';
    const lighter = query.leftPannierLbs > query.rightPannierLbs ? 'Right' : 'Left';
    const shiftAmt = Math.round(weightDifferenceLbs / 2);
    recommendedHitchAdjustment = `CRITICAL UNBALANCED WARNING: ${heavier} pannier is ${weightDifferenceLbs} lbs heavier than ${lighter}. Shift approximately ${shiftAmt} lbs from ${heavier.toLowerCase()} to ${lighter.toLowerCase()} to prevent saddle roll, cinch galls, and spine trauma. Slack off ${query.hitchType.replace('_', ' ')} lashings and calibrate side balance before proceeding.`;
  } else if (payloadCapacityStatus === 'overloaded_injury_risk') {
    const excess = totalPayloadLbs - animalStandard.maxPayloadLbs;
    recommendedHitchAdjustment = `OVERLOAD ADVISORY: Total payload (${totalPayloadLbs} lbs) exceeds the strict 20% equine body weight limit (${animalStandard.maxPayloadLbs} lbs) by ${excess} lbs. Distribute ${excess} lbs onto another pack animal in the string.`;
  } else {
    switch (query.hitchType) {
      case 'diamond_hitch':
        recommendedHitchAdjustment =
          'Diamond hitch tensioning optimal: maintain equal tension on the center diamond apex and lock running rope around front and rear manta corners.';
        break;
      case 'box_hitch':
        recommendedHitchAdjustment =
          'Box hitch corners locked: verify square corner lashings hold side boxes flush against the sawbuck crosses with snug top pack tie-off.';
        break;
      case 'squaw_hitch':
        recommendedHitchAdjustment =
          'Squaw hitch half-hitches secure: inspect side cinch rope tension across belly rings and ensure manta duffels are leveled.';
        break;
      case 'barrel_hitch':
        recommendedHitchAdjustment =
          'Barrel hitch slings tensioned: ensure double half hitches are snug around cylindrical kegs/panniers to prevent rotational slippage.';
        break;
    }
  }

  const highlineSpacingM = query.stockAnimal === 'pack_horse' ? 4.0 : 3.5;

  return {
    routeTitle: route.title,
    stockAnimal: query.stockAnimal,
    totalPayloadLbs,
    weightDifferenceLbs,
    balanceRatio,
    balanceStatus,
    payloadCapacityStatus,
    recommendedHitchAdjustment,
    highlineSpacingM,
  };
}
