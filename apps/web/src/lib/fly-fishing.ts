export type WaterType =
  | 'alpine_lake'
  | 'freestone_river'
  | 'spring_creek'
  | 'tailwater'
  | 'high_gradient_stream';

export type TargetSpecies =
  | 'westside_cutthroat'
  | 'golden_trout'
  | 'bull_trout'
  | 'rainbow_trout'
  | 'brook_trout';

export type HatchType =
  | 'mayfly_callibaetis'
  | 'caddis_elk_hair'
  | 'stonefly_salmonfly'
  | 'midge_chironomid'
  | 'terrestrial_hopper';

export interface FishingLocation {
  id: string;
  name: string;
  region: string;
  state: string;
  elevationFt: number;
  waterType: WaterType;
  targetSpecies: TargetSpecies[];
  recommendedRodWeight: number;
  recommendedLeaderTippet: string;
  activeHatches: HatchType[];
  catchAndReleaseOnly: boolean;
  barblessRequired: boolean;
  description: string;
  regulations: string[];
}

export interface AnglingMatchQuery {
  locationId: string;
  waterTemperatureF: number;
  timeOfDay: 'dawn' | 'midday' | 'evening' | 'dusk';
  surfaceActivity: 'rising' | 'subsurface_feeding' | 'deep_pool';
}

export interface AnglingMatchResult {
  locationName: string;
  suggestedFly: string;
  flySize: string;
  presentationTechnique: string;
  tippetSize: string;
  fishActivityLevel: 'low' | 'moderate' | 'high';
  temperatureWarning?: string;
  regulationsSummary: string[];
}

export interface FlyFishingGearItem {
  id: string;
  name: string;
  category: 'rod_reel' | 'terminal_tackle' | 'wading_safety' | 'conservation' | 'tools';
  mandatory: boolean;
  notes: string;
}

export const FISHING_LOCATIONS: FishingLocation[] = [
  {
    id: 'upper-yakima-canyon',
    name: 'Upper Yakima River Canyon',
    region: 'Central Washington Cascades',
    state: 'WA',
    elevationFt: 1200,
    waterType: 'freestone_river',
    targetSpecies: ['rainbow_trout', 'westside_cutthroat'],
    recommendedRodWeight: 5,
    recommendedLeaderTippet: '9ft 4X',
    activeHatches: ['stonefly_salmonfly', 'caddis_elk_hair'],
    catchAndReleaseOnly: true,
    barblessRequired: true,
    description:
      'Legendary blue-ribbon freestone river coursing through high-desert basalt canyons, famous for aggressive native rainbow trout and westslope cutthroat feeding along structured foam lines.',
    regulations: [
      'Single barbless hooks required',
      'Catch-and-release only (immediate return to water)',
      'Artificial flies and lures only; selective gear rules in effect',
      'No motorized watercraft permitted in canyon section',
    ],
  },
  {
    id: 'enchantment-crystal-lakes',
    name: 'Enchantments Crystal Tarns',
    region: 'Alpine Lakes Wilderness',
    state: 'WA',
    elevationFt: 6800,
    waterType: 'alpine_lake',
    targetSpecies: ['golden_trout', 'westside_cutthroat'],
    recommendedRodWeight: 3,
    recommendedLeaderTippet: '9ft 5X - 6X',
    activeHatches: ['midge_chironomid', 'terrestrial_hopper'],
    catchAndReleaseOnly: true,
    barblessRequired: true,
    description:
      'Crystal-clear glacial cirques perched among granite spires, supporting wild California golden trout and cutthroat feeding on midges and alpine windfalls.',
    regulations: [
      'Single barbless hooks required',
      'Catch-and-release only (immediate return to water)',
      'Wilderness overnight permit required for camp access',
      'Pack out all monofilament leaders and tippet trimmings',
    ],
  },
  {
    id: 'deschutes-warm-springs',
    name: 'Lower Deschutes River',
    region: 'Central Oregon High Desert',
    state: 'OR',
    elevationFt: 1500,
    waterType: 'tailwater',
    targetSpecies: ['rainbow_trout', 'bull_trout'],
    recommendedRodWeight: 6,
    recommendedLeaderTippet: '9ft 3X - 4X',
    activeHatches: ['stonefly_salmonfly', 'caddis_elk_hair'],
    catchAndReleaseOnly: false,
    barblessRequired: true,
    description:
      'Powerful tailwater famous for native redband rainbow trout and predatory bull trout hiding in deep current breaks below Warm Springs.',
    regulations: [
      'Single barbless hooks required',
      'Artificial flies and lures only',
      'No fishing from floating devices; bank wading only',
      'Tribal boundary permits required when anchoring or wading east bank',
    ],
  },
  {
    id: 'metolius-headwaters',
    name: 'Metolius River Springs',
    region: 'Cascade Range / Camp Sherman',
    state: 'OR',
    elevationFt: 2900,
    waterType: 'spring_creek',
    targetSpecies: ['bull_trout', 'rainbow_trout'],
    recommendedRodWeight: 4,
    recommendedLeaderTippet: '12ft 6X',
    activeHatches: ['mayfly_callibaetis', 'caddis_elk_hair'],
    catchAndReleaseOnly: true,
    barblessRequired: true,
    description:
      'Ultra-clear, spring-fed sanctuary flowing icy 48°F year-round, requiring hyper-delicate dry fly presentations to fool wary wild rainbow and apex bull trout.',
    regulations: [
      'Single barbless hooks required',
      'Catch-and-release only (immediate return to water)',
      'Strictly fly fishing only with barbless artificial flies',
      'No wading within 50ft of sensitive gravel spawning redds',
    ],
  },
  {
    id: 'snake-river-grand-teton',
    name: 'Upper Snake River Headwaters',
    region: 'Grand Teton / Yellowstone',
    state: 'WY',
    elevationFt: 6700,
    waterType: 'freestone_river',
    targetSpecies: ['westside_cutthroat'],
    recommendedRodWeight: 5,
    recommendedLeaderTippet: '9ft 4X',
    activeHatches: ['terrestrial_hopper', 'mayfly_callibaetis'],
    catchAndReleaseOnly: true,
    barblessRequired: true,
    description:
      'Majestic freestone river snaking beneath the Cathedral Group, offering world-class dry-fly angling for fine-spotted Snake River and westslope cutthroat trout.',
    regulations: [
      'Single barbless hooks required',
      'Catch-and-release only (immediate return to water)',
      'Grand Teton National Park fishing permit required',
      'Felt-soled wading boots strictly prohibited to prevent invasive mudsnail spread',
    ],
  },
];

export const FLY_FISHING_GEAR: FlyFishingGearItem[] = [
  {
    id: 'barbless-fly-box',
    name: 'Barbless hooks fly selection & silicone fly box',
    category: 'terminal_tackle',
    mandatory: true,
    notes: 'Minimizes tissue damage and allows rapid, stress-free fish release.',
  },
  {
    id: 'rubber-mesh-net',
    name: 'Knotless rubber mesh catch-and-release net (preserves fish slime coating)',
    category: 'conservation',
    mandatory: true,
    notes: 'Crucial for keeping fish wet and preserving the protective mucous barrier.',
  },
  {
    id: 'hemostats-forceps',
    name: 'Hemostats / forceps with line cutter for gentle hook removal',
    category: 'tools',
    mandatory: true,
    notes: 'Allows swift hook extraction without squeezing the trout vitals or gills.',
  },
  {
    id: 'tippet-spools',
    name: 'Fluorocarbon / nylon tippet spools (3X through 6X)',
    category: 'terminal_tackle',
    mandatory: true,
    notes: 'Low-refraction fluorocarbon for crystal alpine tarns and ultra-clear spring creeks.',
  },
  {
    id: 'wading-safety',
    name: 'Quick-release wading belt & studded wading boots (swiftwater safety)',
    category: 'wading_safety',
    mandatory: true,
    notes: 'Prevents catastrophic wader inundation in powerful canyon currents.',
  },
  {
    id: 'polarized-eyewear',
    name: 'Polarized eye protection with floating lanyard',
    category: 'tools',
    mandatory: true,
    notes: 'Cuts surface glare to spot submerged structure and protects eyes from errant hook casts.',
  },
];

export function getFishingLocations(waterType?: WaterType): FishingLocation[] {
  if (!waterType) {
    return FISHING_LOCATIONS;
  }
  return FISHING_LOCATIONS.filter((loc) => loc.waterType === waterType);
}

export function getFishingLocationById(id: string): FishingLocation | undefined {
  return FISHING_LOCATIONS.find((loc) => loc.id === id);
}

export function getFlyFishingGear(): FlyFishingGearItem[] {
  return FLY_FISHING_GEAR;
}

export function calculateAnglingMatch(query: AnglingMatchQuery): AnglingMatchResult {
  const location = getFishingLocationById(query.locationId);
  if (!location) {
    throw new Error(`Unknown fishing location ID: ${query.locationId}`);
  }

  let fishActivityLevel: 'low' | 'moderate' | 'high';
  if (query.waterTemperatureF > 65.0 || query.waterTemperatureF < 45.0) {
    fishActivityLevel = 'low';
  } else if (query.waterTemperatureF >= 50.0 && query.waterTemperatureF <= 62.0) {
    fishActivityLevel = 'high';
  } else {
    fishActivityLevel = 'moderate';
  }

  const temperatureWarning =
    query.waterTemperatureF > 65.0
      ? 'Hoot Owl Alert: Water temperature exceeds 65°F. Cease fishing during afternoon hours to protect native trout from thermal exhaustion.'
      : undefined;

  let suggestedFly = 'Parachute Adams';
  let flySize = '#14 - #16';
  let presentationTechnique =
    'Dead-drift dry fly presentation along foam lines and bubble seams';
  let tippetSize = location.recommendedLeaderTippet;

  if (query.surfaceActivity === 'rising') {
    if (location.activeHatches.includes('stonefly_salmonfly')) {
      suggestedFly = 'Chubby Chernobyl / Salmonfly Dry';
      flySize = '#6 - #8';
    } else if (location.activeHatches.includes('terrestrial_hopper')) {
      suggestedFly = "Morrish Hopper / Dave's Hopper";
      flySize = '#8 - #12';
    } else if (location.activeHatches.includes('caddis_elk_hair')) {
      suggestedFly = 'Elk Hair Caddis / Goddard Caddis';
      flySize = '#14 - #16';
    } else if (location.activeHatches.includes('mayfly_callibaetis')) {
      suggestedFly = 'Callibaetis Cripple / Parachute Adams';
      flySize = '#14 - #18';
    } else if (location.activeHatches.includes('midge_chironomid')) {
      suggestedFly = "Griffith's Gnat / Adult Midge Cluster";
      flySize = '#18 - #22';
    }
    presentationTechnique =
      'Dead-drift dry fly presentation along foam lines, bubble lanes, and glassy bank seams';
  } else if (query.surfaceActivity === 'subsurface_feeding') {
    if (location.activeHatches.includes('midge_chironomid')) {
      suggestedFly = 'Zebra Midge / Chromie Chironomid Pupa';
      flySize = '#16 - #20';
    } else if (location.activeHatches.includes('stonefly_salmonfly')) {
      suggestedFly = "Pat's Rubber Legs / 20 Incher Stone";
      flySize = '#8 - #10';
    } else if (location.activeHatches.includes('mayfly_callibaetis')) {
      suggestedFly = "Beadhead Flashback Hare's Ear / Callibaetis Nymph";
      flySize = '#14 - #16';
    } else {
      suggestedFly = 'Beadhead Prince Nymph / Copper John';
      flySize = '#14 - #16';
    }
    presentationTechnique =
      'Suspended indicator nymphing or drop-shot euro-nymphing through riffles and tail-outs';
    tippetSize = '9ft 5X Fluorocarbon';
  } else {
    // deep_pool
    suggestedFly = 'Conehead Woolly Bugger / Sculpin Streamer';
    flySize = '#4 - #8';
    presentationTechnique =
      'Cross-current swing with pulsed streamer strips into deep plunge pools and undercut cutbanks';
    tippetSize = '7.5ft 3X - 4X Abrasion-Resistant Tippet';
  }

  const regulationsSummary: string[] = [];
  if (location.barblessRequired) {
    regulationsSummary.push('Single barbless hooks required');
  }
  if (location.catchAndReleaseOnly) {
    regulationsSummary.push('Catch-and-release only (immediate return to water)');
  }
  for (const reg of location.regulations) {
    if (!regulationsSummary.includes(reg)) {
      regulationsSummary.push(reg);
    }
  }

  return {
    locationName: location.name,
    suggestedFly,
    flySize,
    presentationTechnique,
    tippetSize,
    fishActivityLevel,
    temperatureWarning,
    regulationsSummary,
  };
}
