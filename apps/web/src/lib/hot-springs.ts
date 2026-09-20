export type MineralProfile =
  | 'sulfur_rich'
  | 'lithium_silica'
  | 'calcium_bicarbonate'
  | 'magnesium_sulfate'
  | 'iron_chalybeate';

export type PoolType =
  | 'primitive_rock'
  | 'cedar_tub'
  | 'travertine_terrace'
  | 'riverside_gravel'
  | 'sandstone_alcove';

export type AccessDifficulty =
  | 'easy_walk'
  | 'moderate_hike'
  | 'rugged_backcountry'
  | 'river_fording'
  | 'snowshoe_winter';

export interface HotSpringLocation {
  id: string;
  name: string;
  region: string;
  state: string;
  temperatureF: number;
  poolType: PoolType;
  mineralProfile: MineralProfile;
  accessDifficulty: AccessDifficulty;
  hikeDistanceMiles: number;
  elevationGainFt: number;
  clothingOptional: boolean;
  feeRequired: boolean;
  winterAccess: boolean;
  description: string;
  leaveNoTraceRules: string[];
  recommendedGear: string[];
}

export interface SoakingPlannerQuery {
  springId: string;
  partySize: number;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  soakDurationMinutes: number;
}

export interface SoakingPlannerResult {
  springName: string;
  waterTempF: number;
  safeMaxSessionMinutes: number;
  hydrationLitersRequired: number;
  electrolytesRecommendedMg: number;
  recommendedClothing: string;
  hazards: string[];
  ethicsChecklist: string[];
}

export interface HotSpringGearItem {
  id: string;
  name: string;
  category: 'hydration' | 'footwear' | 'pack_in' | 'thermal' | 'hygiene';
  mandatory: boolean;
  description: string;
}

export const HOT_SPRINGS_CATALOG: HotSpringLocation[] = [
  {
    id: 'scenic-hot-springs',
    name: 'Scenic Hot Springs',
    region: 'Cascade Mountains',
    state: 'WA',
    temperatureF: 104,
    poolType: 'cedar_tub',
    mineralProfile: 'lithium_silica',
    accessDifficulty: 'moderate_hike',
    hikeDistanceMiles: 4.4,
    elevationGainFt: 1100,
    clothingOptional: true,
    feeRequired: true,
    winterAccess: true,
    description:
      'Perched on a steep pine-forested slope in the Central Cascades, Scenic Hot Springs features three elevated cedar tubs fed by mineral-rich geothermal waters with sweeping mountain basin views.',
    leaveNoTraceRules: [
      'Advance reservation and permit code required for private property access',
      'Strictly pack out all beverage containers, food wrappers, and micro-trash',
      'Zero soaps, oils, or personal care products allowed in or near tubs',
    ],
    recommendedGear: [
      'Microspikes or snowshoes for steep winter snowpack',
      'Insulated parka and warm fleece beanie for post-soak transition',
      'High-traction boots for steep, muddy uphill trail',
    ],
  },
  {
    id: 'goldmyer-hot-springs',
    name: 'Goldmyer Hot Springs',
    region: 'Middle Fork Snoqualmie',
    state: 'WA',
    temperatureF: 111,
    poolType: 'primitive_rock',
    mineralProfile: 'sulfur_rich',
    accessDifficulty: 'rugged_backcountry',
    hikeDistanceMiles: 9.0,
    elevationGainFt: 800,
    clothingOptional: true,
    feeRequired: true,
    winterAccess: true,
    description:
      'Hidden in wilderness old-growth forest along the Middle Fork Snoqualmie River, Goldmyer features an ancient geothermal horizontal cave pool and tiered hand-carved stone soaking baths.',
    leaveNoTraceRules: [
      'Wilderness permit lottery reservation required prior to departure',
      'No domestic animals, alcohol, or smoking on wilderness grounds',
      'Zero soaps, shampoos, or cleansers in natural cave or rock pools',
    ],
    recommendedGear: [
      'High-clearance all-wheel drive vehicle for rough forest road access',
      'Submersible waterproof headlamp for dark cave soaking',
      'Heavy-duty dry bag and full wilderness backpacking kit',
    ],
  },
  {
    id: 'bagby-hot-springs',
    name: 'Bagby Hot Springs',
    region: 'Mount Hood National Forest',
    state: 'OR',
    temperatureF: 120,
    poolType: 'cedar_tub',
    mineralProfile: 'calcium_bicarbonate',
    accessDifficulty: 'easy_walk',
    hikeDistanceMiles: 3.0,
    elevationGainFt: 200,
    clothingOptional: false,
    feeRequired: true,
    winterAccess: false,
    description:
      'Nestled among towering old-growth firs in Mount Hood National Forest, Bagby offers historic hand-hollowed cedar log tubs fed by 120°F geothermal spring water.',
    leaveNoTraceRules: [
      'Clothing / swimwear mandatory on main community bathhouse decks',
      'USFS Forest Recreation Day Pass and soaking wristband required',
      'Alcohol and glass containers strictly prohibited in soaking area',
    ],
    recommendedGear: [
      'Cold water tempering bucket to cool 120°F source water',
      'Non-slip wading sandals for slippery cedar deck planks',
      'Quick-drying microfiber camp towel',
    ],
  },
  {
    id: 'travertine-hot-springs',
    name: 'Travertine Hot Springs',
    region: 'Eastern Sierra / Great Basin',
    state: 'CA',
    temperatureF: 103,
    poolType: 'travertine_terrace',
    mineralProfile: 'calcium_bicarbonate',
    accessDifficulty: 'easy_walk',
    hikeDistanceMiles: 0.2,
    elevationGainFt: 10,
    clothingOptional: true,
    feeRequired: false,
    winterAccess: true,
    description:
      'Colorful geothermal mineral terraces with warm pools overlooking Bridgeport Valley and the snowcapped granite peaks of the Eastern Sierra crest.',
    leaveNoTraceRules: [
      'Stay on established pathways to protect fragile mineral crust formations',
      'Pack out 100% of trash, baby wipes, and human waste',
      'No camping within 100 yards of hot spring pools',
    ],
    recommendedGear: [
      'Slip-on sandals for mineral mud and travertine edges',
      'Polarized UV sunglasses and wide-brim desert sun hat',
      'Windbreaker for brisk alpine desert evening temperatures',
    ],
  },
  {
    id: 'kirkham-hot-springs',
    name: 'Kirkham Hot Springs',
    region: 'Payette River Canyon',
    state: 'ID',
    temperatureF: 102,
    poolType: 'riverside_gravel',
    mineralProfile: 'magnesium_sulfate',
    accessDifficulty: 'easy_walk',
    hikeDistanceMiles: 0.4,
    elevationGainFt: 50,
    clothingOptional: false,
    feeRequired: true,
    winterAccess: true,
    description:
      'A geothermal wonderland along the South Fork Payette River featuring steamy hot waterfalls cascading into terraced riverside gravel pools.',
    leaveNoTraceRules: [
      'Day-use only between 7:00 AM and 10:00 PM; no night soaking',
      'Swimwear mandatory; respect family-friendly canyon setting',
      'Use designated wooden stairways to prevent steep riverbank erosion',
    ],
    recommendedGear: [
      'Neoprene river booties to protect against sharp canyon gravel',
      'Dry storage compression sack for riverside towels and dry clothes',
      'Fleece hoodie for river breeze upon exiting hot pools',
    ],
  },
];

export const HOT_SPRING_GEAR_ITEMS: HotSpringGearItem[] = [
  {
    id: 'gear-booties',
    name: 'Neoprene water booties or high-traction wading sandals',
    category: 'footwear',
    mandatory: true,
    description:
      'Thermal rubber traction soles protect against jagged river gravel, slick moss, and scalding bedrock.',
  },
  {
    id: 'gear-towel',
    name: 'Fast-drying ultralight microfiber towel',
    category: 'thermal',
    mandatory: true,
    description:
      'Ultra-absorbent, compact towel to quickly dry off before freezing backcountry air causes rapid hypothermia.',
  },
  {
    id: 'gear-hydration',
    name: 'Insulated hydration bottle (minimum 1.0L cold water per person)',
    category: 'hydration',
    mandatory: true,
    description:
      'Double-wall vacuum bottle with cold electrolyte water to counter heavy mineral pool dehydration.',
  },
  {
    id: 'gear-dry-bag',
    name: 'Pack-it-out leakproof dry bag for wet clothing and micro-trash',
    category: 'pack_in',
    mandatory: true,
    description:
      'Roll-top waterproof bag isolates damp swimwear and contains all used wrappers and micro-debris.',
  },
  {
    id: 'gear-headlamp',
    name: 'High-output headlamp with red-light night soaking mode',
    category: 'pack_in',
    mandatory: true,
    description:
      'Hands-free trail navigation with night-vision-preserving red LED mode for dark backcountry tub access.',
  },
  {
    id: 'gear-waste-bags',
    name: 'Biodegradable sealable pack-out waste bags (strict Leave No Trace)',
    category: 'hygiene',
    mandatory: true,
    description:
      'Puncture-resistant odor-proof waste disposal bags ensuring zero trace left in sensitive riparian zones.',
  },
];

export function getHotSprings(access?: AccessDifficulty): HotSpringLocation[] {
  if (!access) {
    return HOT_SPRINGS_CATALOG;
  }
  return HOT_SPRINGS_CATALOG.filter((spring) => spring.accessDifficulty === access);
}

export function getHotSpringById(id: string): HotSpringLocation | undefined {
  return HOT_SPRINGS_CATALOG.find((spring) => spring.id === id);
}

export function calculateSoakingPlan(query: SoakingPlannerQuery): SoakingPlannerResult {
  const spring = getHotSpringById(query.springId);
  if (!spring) {
    throw new Error(`Hot spring with id "${query.springId}" not found`);
  }

  const waterTempF = spring.temperatureF;

  let safeMaxSessionMinutes = 45;
  if (waterTempF >= 115) {
    safeMaxSessionMinutes = 15;
  } else if (waterTempF >= 108) {
    safeMaxSessionMinutes = 20;
  } else if (waterTempF >= 104) {
    safeMaxSessionMinutes = 30;
  }

  const seasonMultiplier =
    query.season === 'summer' ? 1.3 : query.season === 'winter' ? 1.1 : 1.0;
  const rawHydration = query.partySize * (query.soakDurationMinutes / 30) * 0.5 * seasonMultiplier;
  const hydrationLitersRequired = Math.max(
    query.partySize * 1.0,
    Math.round(rawHydration * 10) / 10
  );

  const electrolytesRecommendedMg = Math.round(
    query.partySize *
      (query.soakDurationMinutes / 30) *
      300 *
      (query.season === 'summer' ? 1.2 : 1.0)
  );

  let recommendedClothing = spring.clothingOptional
    ? 'Clothing optional pool etiquette. Quick-drying swimsuit optional; bring warm thermal wrap or fleece robe for transitions.'
    : 'Swimwear mandatory at all times. Quick-drying boardshorts, rashguard, or swimsuit required.';

  if (query.season === 'winter') {
    recommendedClothing +=
      ' Add heavy wool socks and insulated down jacket for frigid trailhead walk-out.';
  }

  const hazards: string[] = [];
  if (waterTempF >= 108) {
    hazards.push(
      'Extreme water temperature danger: soak in short increments (max 15-20 mins) and exit immediately if feeling lightheaded or dizzy.'
    );
  }
  if (query.soakDurationMinutes > safeMaxSessionMinutes) {
    hazards.push(
      `Planned soak duration (${query.soakDurationMinutes} min) exceeds safe single session limit (${safeMaxSessionMinutes} min). Schedule 15-minute cool-down intervals.`
    );
  }
  if (spring.accessDifficulty === 'rugged_backcountry') {
    hazards.push(
      'Remote backcountry wilderness: cell coverage unavailable and SAR evacuation takes several hours. Carry satellite emergency beacon.'
    );
  }
  if (spring.winterAccess && query.season === 'winter') {
    hazards.push(
      'Severe hypothermia danger: sub-freezing ambient air creates rapid body cooling upon exit. Dry off and layer up within 60 seconds.'
    );
  }
  if (query.season === 'summer') {
    hazards.push(
      'Elevated dehydration risk: hot summer sun amplifies perspiration in geothermal pools. Consume cold water before and during soak.'
    );
  }

  const ethicsChecklist: string[] = [
    'Pack out 100% of trash, micro-waste, bottles, and food scraps (strict Leave No Trace).',
    'Never introduce soaps, shampoos, bath salts, or oils into delicate geothermal mineral pools.',
    `Adhere to posted etiquette: ${spring.clothingOptional ? 'clothing optional with mutual respect' : 'swimwear strictly mandatory at all times'}.`,
    'Keep noise and music silenced to preserve quiet solitude of backcountry nature.',
  ];

  return {
    springName: spring.name,
    waterTempF,
    safeMaxSessionMinutes,
    hydrationLitersRequired,
    electrolytesRecommendedMg,
    recommendedClothing,
    hazards,
    ethicsChecklist,
  };
}

export function getHotSpringGear(): HotSpringGearItem[] {
  return HOT_SPRING_GEAR_ITEMS;
}
