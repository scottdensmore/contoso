export type GoatBreed =
  | 'alpine_dairy'
  | 'oberhasli_swiss'
  | 'saanen_draft'
  | 'boer_cross';

export type SaddleRigging =
  | 'crossbuck_sawbuck'
  | 'decker_soft_pack'
  | 'flexible_tree_harness';

export type TerrainAgility =
  | 'granite_talus'
  | 'alpine_scree'
  | 'subalpine_meadow'
  | 'timberline_plateau'
  | 'four_pass_loop';

export type BalanceStatus =
  | 'perfectly_balanced'
  | 'acceptable_balance'
  | 'unbalanced_roll_risk';

export type PayloadStatus =
  | 'optimal_light_load'
  | 'full_working_capacity'
  | 'overloaded_spinal_strain';

export interface PackGoatRoute {
  id: string;
  title: string;
  wildernessArea: string;
  nationalForest: string;
  elevationMeters: number;
  saddleRigging: SaddleRigging;
  terrainAgility: TerrainAgility;
  maxStringGoats: number;
  typicalDays: number;
  bighornBufferRequiredM: number;
  description: string;
  highlights: string[];
}

export interface PackGoatQuery {
  routeId: string;
  goatBreed: GoatBreed; // default 'alpine_dairy'
  goatBodyWeightLbs: number; // 140 to 240 lbs, default 180
  leftPannierLbs: number; // 5 to 30 lbs, default 18
  rightPannierLbs: number; // 5 to 30 lbs, default 18
  saddlePadWeightLbs: number; // 4 to 12 lbs, default 6
  saddleRigging: SaddleRigging; // default 'crossbuck_sawbuck'
}

export interface PackGoatResult {
  routeTitle: string;
  goatBreed: GoatBreed;
  totalPayloadLbs: number;
  payloadPercentage: number;
  weightDifferenceLbs: number;
  balanceStatus: BalanceStatus;
  payloadStatus: PayloadStatus;
  bighornBufferMeters: number;
  recommendedDailyForagePelletsLbs: number;
  riggingAdvisory: string;
  wildlifeMitigationAdvisory: string;
}

export interface PackGoatGearItem {
  id: string;
  name: string;
  category:
    | 'nutrition'
    | 'safety'
    | 'containment'
    | 'hoofcare'
    | 'rigging'
    | 'storage';
  mandatory: boolean;
  description: string;
}

export interface GoatBreedStandard {
  breed: GoatBreed;
  name: string;
  standardBodyWeightLbs: number;
  maxPayloadPercentage: number;
  traits: string;
}

export const GOAT_BREED_STANDARDS: Record<GoatBreed, GoatBreedStandard> = {
  alpine_dairy: {
    breed: 'alpine_dairy',
    name: 'Alpine Dairy',
    standardBodyWeightLbs: 180,
    maxPayloadPercentage: 25,
    traits: 'Standard body weight 180 lbs, max payload percentage 25%, agile in rocky passes.',
  },
  oberhasli_swiss: {
    breed: 'oberhasli_swiss',
    name: 'Oberhasli Swiss',
    standardBodyWeightLbs: 170,
    maxPayloadPercentage: 25,
    traits: 'Standard body weight 170 lbs, max payload percentage 25%, calm temperament, high endurance.',
  },
  saanen_draft: {
    breed: 'saanen_draft',
    name: 'Saanen Draft',
    standardBodyWeightLbs: 210,
    maxPayloadPercentage: 28,
    traits: 'Standard body weight 210 lbs, max payload percentage 28%, heavy duty wether packer.',
  },
  boer_cross: {
    breed: 'boer_cross',
    name: 'Boer Cross',
    standardBodyWeightLbs: 200,
    maxPayloadPercentage: 26,
    traits: 'Standard body weight 200 lbs, max payload percentage 26%, muscular build, sturdy frame.',
  },
};

export const PACK_GOAT_ROUTES: PackGoatRoute[] = [
  {
    id: 'wind-river-titcomb-basin',
    title: 'Wind River High Basin & Titcomb Lakes Goat Trek',
    wildernessArea: 'Bridger Wilderness',
    nationalForest: 'Bridger-Teton National Forest, WY, USA',
    elevationMeters: 3300,
    saddleRigging: 'flexible_tree_harness',
    terrainAgility: 'granite_talus',
    maxStringGoats: 4,
    typicalDays: 6,
    bighornBufferRequiredM: 200,
    description:
      'Expedition into the heart of the Wind River Range across granite boulder fields, glacial cirques, and alpine passes with agile working pack goats.',
    highlights: [
      'Granite talus pass hopping',
      'Grizzly bear country food canisters',
      'Highline tree-saver tethering above treeline',
    ],
  },
  {
    id: 'sawtooth-alice-toxaway',
    title: 'Sawtooth Wilderness Alice-Toxaway Loop',
    wildernessArea: 'Sawtooth Wilderness',
    nationalForest: 'Sawtooth National Forest, ID, USA',
    elevationMeters: 2850,
    saddleRigging: 'crossbuck_sawbuck',
    terrainAgility: 'alpine_scree',
    maxStringGoats: 4,
    typicalDays: 4,
    bighornBufferRequiredM: 100,
    description:
      'Classic Idaho high-country loop negotiating decomposed granite switchbacks, crystalline alpine lakes, and narrow talus ridgelines.',
    highlights: [
      'Decomposed granite scree switchbacks',
      'Twin lakes alpine campsites',
      'Leave No Trace grazing containment',
    ],
  },
  {
    id: 'eagle-cap-lakes-basin',
    title: 'Eagle Cap Wilderness Lakes Basin Traverse',
    wildernessArea: 'Eagle Cap Wilderness',
    nationalForest: 'Wallowa-Whitman National Forest, OR, USA',
    elevationMeters: 2600,
    saddleRigging: 'decker_soft_pack',
    terrainAgility: 'subalpine_meadow',
    maxStringGoats: 5,
    typicalDays: 5,
    bighornBufferRequiredM: 150,
    description:
      'Spectacular alpine lake basin traverse beneath towering granite peaks with subalpine meadow grazing restrictions and strict bighorn buffers.',
    highlights: [
      'Subalpine larch corridor trails',
      'Bighorn sheep permit separation corridor',
      'Certified weed-free forage mandate',
    ],
  },
  {
    id: 'uinta-highline-kings-peak',
    title: 'High Uintas Kings Peak Timberline Expedition',
    wildernessArea: 'High Uintas Wilderness',
    nationalForest: 'Ashley National Forest, UT, USA',
    elevationMeters: 3500,
    saddleRigging: 'flexible_tree_harness',
    terrainAgility: 'timberline_plateau',
    maxStringGoats: 3,
    typicalDays: 7,
    bighornBufferRequiredM: 200,
    description:
      'High-altitude ridgeline traverse crossing vast open tundra plateaus and jagged boulder fields leading to Utah’s highest summit.',
    highlights: [
      'Extreme altitude tundra plateau',
      'Boulder talus leaping agility',
      'Rapid summer thunderstorm bivouac',
    ],
  },
  {
    id: 'maroon-bells-four-pass',
    title: 'Maroon Bells Snowmass Four Pass Alpine Loop',
    wildernessArea: 'Maroon Bells-Snowmass Wilderness',
    nationalForest: 'White River National Forest, CO, USA',
    elevationMeters: 3800,
    saddleRigging: 'crossbuck_sawbuck',
    terrainAgility: 'four_pass_loop',
    maxStringGoats: 4,
    typicalDays: 5,
    bighornBufferRequiredM: 150,
    description:
      'Strenuous Colorado alpine circuit traversing four passes exceeding 12,400 feet with dramatic glacial valleys and fragile alpine tundra.',
    highlights: [
      'Four alpine passes over 12,400 feet',
      'Blaze orange safety collar requirement',
      'Crossbuck sawbuck cinching checks',
    ],
  },
];

export const PACK_GOAT_GEAR_CHECKLIST: PackGoatGearItem[] = [
  {
    id: 'weed-free-certified-forage',
    name: 'Weed-Free Certified Alfalfa/Timothy Pellets (Leave No Trace feed)',
    category: 'nutrition',
    mandatory: true,
    description:
      'Certified noxious weed-free compressed forage pellets to supplement caloric intake and prevent invasive seed transport.',
  },
  {
    id: 'high-vis-orange-safety-vest',
    name: 'Blaze Orange Goat Hunting-Season ID Vest & Brass Bells',
    category: 'safety',
    mandatory: true,
    description:
      'High-visibility blaze orange protective vests with audible brass bells to distinguish pack goats from wild game during hunting seasons.',
  },
  {
    id: 'highline-swivel-tether-kit',
    name: 'Overnight Alpine Highline Kit with Swivels & Tree-Savers',
    category: 'containment',
    mandatory: true,
    description:
      'Leave No Trace tree-saver straps, inline swivels, and lead lines for secure overnight highlining above tree line.',
  },
  {
    id: 'hoof-trimming-shears-styptic',
    name: 'Heavy-Duty Hoof Shears & Blood-Stop Styptic Powder',
    category: 'hoofcare',
    mandatory: true,
    description:
      'Precision hoof trimming shears, rasp, and fast-acting styptic powder for managing rock wear and split claws on granite.',
  },
  {
    id: 'crossbuck-saddle-breeching',
    name: 'Padded Crossbuck Goat Pack Saddle with Britchen & Breast Collar',
    category: 'rigging',
    mandatory: true,
    description:
      'Custom-fit crossbuck sawbuck pack saddle with breeching and breast collar to prevent load shift on steep grades.',
  },
  {
    id: 'bear-resistant-pannier-liner',
    name: 'Bear-Resistant Heavy Cordura Dual-Compartment Pack Panniers',
    category: 'storage',
    mandatory: true,
    description:
      'Durable Cordura side panniers with reinforced inserts designed for balanced weight distribution and predator deterrence.',
  },
];

export function getPackGoatRoutes(rigging?: SaddleRigging): PackGoatRoute[] {
  if (!rigging) {
    return PACK_GOAT_ROUTES;
  }
  return PACK_GOAT_ROUTES.filter((route) => route.saddleRigging === rigging);
}

export function getPackGoatRouteById(id: string): PackGoatRoute | undefined {
  return PACK_GOAT_ROUTES.find((route) => route.id === id);
}

export function getPackGoatGearChecklist(): PackGoatGearItem[] {
  return PACK_GOAT_GEAR_CHECKLIST;
}

export function calculatePackGoatPayload(query: PackGoatQuery): PackGoatResult {
  const route = getPackGoatRouteById(query.routeId) ?? PACK_GOAT_ROUTES[0];

  const totalPayloadLbs =
    query.leftPannierLbs + query.rightPannierLbs + query.saddlePadWeightLbs;
  const payloadPercentage =
    Math.round((totalPayloadLbs / query.goatBodyWeightLbs) * 1000) / 10;
  const weightDifferenceLbs = Math.abs(
    query.leftPannierLbs - query.rightPannierLbs
  );

  let balanceStatus: BalanceStatus;
  if (weightDifferenceLbs <= 1.0) {
    balanceStatus = 'perfectly_balanced';
  } else if (weightDifferenceLbs <= 2.5) {
    balanceStatus = 'acceptable_balance';
  } else {
    balanceStatus = 'unbalanced_roll_risk';
  }

  let payloadStatus: PayloadStatus;
  if (payloadPercentage <= 22) {
    payloadStatus = 'optimal_light_load';
  } else if (payloadPercentage <= 28) {
    payloadStatus = 'full_working_capacity';
  } else {
    payloadStatus = 'overloaded_spinal_strain';
  }

  const recommendedDailyForagePelletsLbs =
    Math.round(query.goatBodyWeightLbs * 0.015 * 10) / 10;

  let riggingAdvisory: string;
  if (balanceStatus === 'unbalanced_roll_risk') {
    riggingAdvisory = `Warning: Side pannier weight difference of ${weightDifferenceLbs} lbs creates severe saddle roll risk on technical passes. Rebalance panniers within 1.0 lb to avoid rollover. Recommended adjustment: equalize gear between left and right panniers.`;
  } else if (balanceStatus === 'acceptable_balance') {
    riggingAdvisory = `Acceptable balance: ${weightDifferenceLbs} lbs difference. Inspect cinch tension, breast collar, and breeching alignment frequently on steep switchbacks.`;
  } else {
    riggingAdvisory = `Perfect balance: Side pannier weights are equal or within 1.0 lb. Optimal stability for ${query.saddleRigging.replace(/_/g, ' ')} rigging across technical high-altitude terrain.`;
  }

  const bighornBufferMeters = route.bighornBufferRequiredM;
  const wildlifeMitigationAdvisory = `Maintain a mandatory ${bighornBufferMeters}m separation buffer from wild bighorn sheep at all times to prevent Mycoplasma ovipneumoniae respiratory transmission. Tether pack goats immediately if bighorns are sighted.`;

  return {
    routeTitle: route.title,
    goatBreed: query.goatBreed,
    totalPayloadLbs,
    payloadPercentage,
    weightDifferenceLbs,
    balanceStatus,
    payloadStatus,
    bighornBufferMeters,
    recommendedDailyForagePelletsLbs,
    riggingAdvisory,
    wildlifeMitigationAdvisory,
  };
}
