export interface TradeInCategory {
  id: string;
  name: string;
  defaultMsrp: number;
  description: string;
  acceptableItems: string[];
}

export interface EligibleBrand {
  id: string;
  name: string;
  tier: 'Contoso Outdoors' | 'Partner Brand' | 'Premium Technical';
}

export interface TradeInEstimate {
  category: string;
  brand: string;
  originalMsrp: number;
  condition: 'Excellent' | 'Very Good' | 'Fair';
  creditAmount: number;
  co2AvoidedKg: number;
}

export interface TradeInSubmission {
  category: string;
  brand: string;
  condition: 'Excellent' | 'Very Good' | 'Fair';
  creditAmount: number;
  fulfillmentMethod: 'in_store' | 'shipping_kit';
  customerName: string;
  customerEmail: string;
}

export interface TradeInSubmissionResult {
  success: boolean;
  referenceNumber: string;
  message: string;
}

export const TRADE_IN_CATEGORIES: TradeInCategory[] = [
  {
    id: 'tents-shelters',
    name: 'Tents & Shelters',
    defaultMsrp: 400,
    description: 'Backpacking, mountaineering, and basecamp tents, ultralight tarps, and bivy shelters.',
    acceptableItems: [
      '3-season and 4-season backpacking tents',
      'Mountaineering expedition shelters',
      'Ultralight pyramid tarps and bivy sacks',
      'Family basecamp shelters (complete poles and rainfly)',
    ],
  },
  {
    id: 'technical-backpacks',
    name: 'Technical Backpacks',
    defaultMsrp: 220,
    description: 'Multi-day expedition packs, alpine climbing rucksacks, and technical daypacks.',
    acceptableItems: [
      'Expedition backpacks (60L - 85L+)',
      'Weekend backpacking packs (40L - 55L)',
      'Alpine climbing packs and ski touring packs',
      'Technical daypacks with functional harness frames',
    ],
  },
  {
    id: 'outerwear-jackets',
    name: 'Outerwear & Jackets',
    defaultMsrp: 280,
    description: 'Hard shell storm jackets, alpine down parkas, and technical synthetic midlayers.',
    acceptableItems: [
      'GORE-TEX / 3-layer waterproof breathable hard shells',
      '800+ fill power down belay parkas and light down hoodies',
      'Synthetic active insulation midlayers',
      'Softshell alpine mountaineering jackets',
    ],
  },
  {
    id: 'sleeping-bags',
    name: 'Sleeping Bags',
    defaultMsrp: 250,
    description: 'Down and synthetic technical sleeping bags, quilts, and backcountry sleep systems.',
    acceptableItems: [
      'Down mummy bags (0°F to 30°F rated)',
      'Ultralight backpacking quilts',
      'Synthetic cold-weather expedition bags',
      'Double sleeping systems with compression dry sacks',
    ],
  },
  {
    id: 'footwear-boots',
    name: 'Footwear & Boots',
    defaultMsrp: 180,
    description: 'Leather backpacking boots, alpine mountaineering boots, and trail runners.',
    acceptableItems: [
      'Full-grain leather and synthetic backpacking boots',
      'Crampon-compatible mountaineering boots',
      'Technical trail running and approach shoes (clean treads)',
      'Winter insulated snow boots',
    ],
  },
];

export const ELIGIBLE_BRANDS: EligibleBrand[] = [
  {
    id: 'contoso-outdoors',
    name: 'Contoso Outdoors',
    tier: 'Contoso Outdoors',
  },
  {
    id: 'patagonia',
    name: 'Patagonia',
    tier: 'Partner Brand',
  },
  {
    id: 'arcteryx',
    name: "Arc'teryx",
    tier: 'Premium Technical',
  },
  {
    id: 'the-north-face',
    name: 'The North Face',
    tier: 'Partner Brand',
  },
  {
    id: 'mountain-hardwear',
    name: 'Mountain Hardwear',
    tier: 'Partner Brand',
  },
  {
    id: 'osprey',
    name: 'Osprey',
    tier: 'Partner Brand',
  },
  {
    id: 'big-agnes',
    name: 'Big Agnes',
    tier: 'Partner Brand',
  },
  {
    id: 'nemo-equipment',
    name: 'Nemo Equipment',
    tier: 'Partner Brand',
  },
];

export const CONDITION_MULTIPLIERS: Record<'Excellent' | 'Very Good' | 'Fair', number> = {
  Excellent: 0.5,
  'Very Good': 0.4,
  Fair: 0.25,
};

export const CATEGORY_CO2_AVOIDED_KG: Record<string, number> = {
  'tents-shelters': 15,
  'technical-backpacks': 10,
  'sleeping-bags': 10,
  'outerwear-jackets': 8,
  'footwear-boots': 6,
};

export function getAllTradeInCategories(): TradeInCategory[] {
  return TRADE_IN_CATEGORIES;
}

export function getEligibleBrands(): EligibleBrand[] {
  return ELIGIBLE_BRANDS;
}

export function calculateTradeInValue(
  category: string,
  brand: string,
  originalMsrp: number,
  condition: 'Excellent' | 'Very Good' | 'Fair'
): TradeInEstimate {
  const msrp = Math.max(0, originalMsrp);
  const multiplier = CONDITION_MULTIPLIERS[condition] ?? 0.25;
  const creditAmount = Math.round(msrp * multiplier * 100) / 100;

  const normalized = category.toLowerCase().trim();
  let co2AvoidedKg = 10;

  if (normalized.includes('tent') || normalized.includes('shelter')) {
    co2AvoidedKg = 15;
  } else if (normalized.includes('pack')) {
    co2AvoidedKg = 10;
  } else if (normalized.includes('sleeping') || normalized.includes('bag')) {
    co2AvoidedKg = 10;
  } else if (normalized.includes('outerwear') || normalized.includes('jacket')) {
    co2AvoidedKg = 8;
  } else if (normalized.includes('footwear') || normalized.includes('boot')) {
    co2AvoidedKg = 6;
  }

  return {
    category,
    brand,
    originalMsrp: msrp,
    condition,
    creditAmount,
    co2AvoidedKg,
  };
}

export function submitTradeIn(data: TradeInSubmission): TradeInSubmissionResult {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const referenceNumber = `#TIN-${randomSuffix}`;

  return {
    success: true,
    referenceNumber,
    message: `Trade-in intake successfully received for ${data.customerName}. Confirmation reference ${referenceNumber} generated.`,
  };
}
