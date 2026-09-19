export interface TripTemplate {
  id: string;
  name: string;
  defaultDays: number;
  defaultGroupSize: number;
  climate: 'warm' | 'moderate' | 'cold' | 'subzero';
  terrain: 'forest' | 'alpine' | 'desert' | 'snow';
  description: string;
}

export interface ChecklistItem {
  id: string;
  category: 'The Ten Essentials' | 'Shelter & Sleep' | 'Cooking & Water' | 'Apparel & Layers' | 'Camp Comfort';
  name: string;
  essential: boolean;
  climateSpecific?: 'cold' | 'subzero' | 'desert' | 'any';
  weightGrams: number;
}

export interface TripPlanSummary {
  totalCaloriesKcal: number;
  dailyCaloriesPerPersonKcal: number;
  dailyWaterLitersPerPerson: number;
  totalWaterCapacityLiters: number;
  estimatedBaseWeightKg: number;
  items: ChecklistItem[];
}

export interface TripPlanParameters {
  templateId?: string;
  days: number;
  groupSize: number;
  climate: 'warm' | 'moderate' | 'cold' | 'subzero';
  terrain: 'forest' | 'alpine' | 'desert' | 'snow';
}

export const TRIP_TEMPLATES: TripTemplate[] = [
  {
    id: 'weekend-backpacking',
    name: 'Weekend Backpacking',
    defaultDays: 3,
    defaultGroupSize: 2,
    climate: 'moderate',
    terrain: 'forest',
    description: 'Classic multi-day backcountry trail trip through temperate forested wilderness and rolling terrain.',
  },
  {
    id: 'alpine-day-summit',
    name: 'Alpine Day Summit',
    defaultDays: 1,
    defaultGroupSize: 1,
    climate: 'cold',
    terrain: 'alpine',
    description: 'High-altitude mountain peak scramble demanding technical agility, windproof shells, and thermal insulation.',
  },
  {
    id: 'extended-backcountry',
    name: 'Extended Backcountry',
    defaultDays: 7,
    defaultGroupSize: 3,
    climate: 'moderate',
    terrain: 'forest',
    description: 'Extended remote expedition requiring significant nutritional reserves, redundant gear, and durable shelter.',
  },
  {
    id: 'winter-snow-camping',
    name: 'Winter Snow Camping',
    defaultDays: 3,
    defaultGroupSize: 2,
    climate: 'subzero',
    terrain: 'snow',
    description: 'Sub-zero snowpack expedition requiring 4-season geodesic shelter, insulated sleeping pads, and traction cleats.',
  },
  {
    id: 'desert-canyoneering',
    name: 'Desert Canyoneering',
    defaultDays: 3,
    defaultGroupSize: 2,
    climate: 'warm',
    terrain: 'desert',
    description: 'Arid canyon expedition demanding high hydration capacity, electrolyte replenishment, and intense sun protection.',
  },
];

export const CHECKLIST_CATALOG: ChecklistItem[] = [
  // 1. The Ten Essentials
  {
    id: 'nav-map-compass',
    category: 'The Ten Essentials',
    name: 'Topographic Map & Magnetic Compass',
    essential: true,
    weightGrams: 120,
  },
  {
    id: 'headlamp',
    category: 'The Ten Essentials',
    name: 'LED Headlamp & Spare Rechargeable Batteries',
    essential: true,
    weightGrams: 95,
  },
  {
    id: 'sun-protection',
    category: 'The Ten Essentials',
    name: 'Sunscreen, Lip Balm & UV Polarized Sunglasses',
    essential: true,
    weightGrams: 110,
  },
  {
    id: 'first-aid',
    category: 'The Ten Essentials',
    name: 'Backcountry Medical & Trauma First Aid Kit',
    essential: true,
    weightGrams: 350,
  },
  {
    id: 'knife-repair',
    category: 'The Ten Essentials',
    name: 'Locking Multi-tool Knife & Duct Repair Tape',
    essential: true,
    weightGrams: 180,
  },
  {
    id: 'fire-starter',
    category: 'The Ten Essentials',
    name: 'Waterproof Storm Matches & Spark Ignition Starter',
    essential: true,
    weightGrams: 85,
  },
  {
    id: 'emergency-shelter',
    category: 'The Ten Essentials',
    name: 'Emergency Thermal Bivy / Reflective Blanket',
    essential: true,
    weightGrams: 120,
  },
  {
    id: 'extra-food',
    category: 'The Ten Essentials',
    name: 'Extra High-Calorie Nutrition Bars & Emergency Rations',
    essential: true,
    weightGrams: 300,
  },
  {
    id: 'extra-water',
    category: 'The Ten Essentials',
    name: 'Water Purification Tablets & Emergency Hydration',
    essential: true,
    weightGrams: 150,
  },
  {
    id: 'extra-clothing',
    category: 'The Ten Essentials',
    name: 'Emergency Storm Shell Jacket & Synthetic Layer',
    essential: true,
    weightGrams: 420,
  },

  // 2. Shelter & Sleep
  {
    id: 'tent-3season',
    category: 'Shelter & Sleep',
    name: '3-Season Lightweight Backpacking Tent',
    essential: true,
    weightGrams: 1650,
  },
  {
    id: 'tent-4season',
    category: 'Shelter & Sleep',
    name: '4-Season Mountaineering Geodesic Tent',
    essential: true,
    climateSpecific: 'cold',
    weightGrams: 2850,
  },
  {
    id: 'sleeping-bag-moderate',
    category: 'Shelter & Sleep',
    name: 'Down Sleeping Bag (20°F Rating)',
    essential: true,
    weightGrams: 980,
  },
  {
    id: 'sleeping-bag-subzero',
    category: 'Shelter & Sleep',
    name: 'Expedition Down Sleeping Bag (-20°F Rating)',
    essential: true,
    climateSpecific: 'subzero',
    weightGrams: 1650,
  },
  {
    id: 'pad-standard',
    category: 'Shelter & Sleep',
    name: 'Inflatable Sleeping Pad (R-Value 3.2)',
    essential: true,
    weightGrams: 460,
  },
  {
    id: 'pad-insulated',
    category: 'Shelter & Sleep',
    name: 'High R-Value Insulated Sleeping Pad (R-Value 5.0+)',
    essential: true,
    climateSpecific: 'cold',
    weightGrams: 650,
  },
  {
    id: 'tent-footprint',
    category: 'Shelter & Sleep',
    name: 'Durable Tent Groundsheet / Footprint',
    essential: false,
    weightGrams: 210,
  },

  // 3. Cooking & Water
  {
    id: 'backpacking-stove',
    category: 'Cooking & Water',
    name: 'Canister Backpacking Stove & Piezo Igniter',
    essential: true,
    weightGrams: 110,
  },
  {
    id: 'iso-fuel',
    category: 'Cooking & Water',
    name: 'Isobutane Fuel Canister (230g)',
    essential: true,
    weightGrams: 360,
  },
  {
    id: 'cookset-pot',
    category: 'Cooking & Water',
    name: 'Anodized Aluminum Cook Pot & Titanium Spork',
    essential: true,
    weightGrams: 240,
  },
  {
    id: 'water-filter',
    category: 'Cooking & Water',
    name: 'Backcountry Microfiltration Squeeze Pump',
    essential: true,
    weightGrams: 140,
  },
  {
    id: 'water-bottles',
    category: 'Cooking & Water',
    name: 'Wide-Mouth 1L Water Bottles (x2)',
    essential: true,
    weightGrams: 220,
  },
  {
    id: 'desert-water-reservoir',
    category: 'Cooking & Water',
    name: 'High-Capacity Hydration Reservoir (3L Dromedary)',
    essential: true,
    climateSpecific: 'desert',
    weightGrams: 280,
  },
  {
    id: 'bear-canister',
    category: 'Cooking & Water',
    name: 'IGBC-Certified Bear-Resistant Food Canister',
    essential: true,
    weightGrams: 940,
  },
  {
    id: 'camp-biodegradable-soap',
    category: 'Cooking & Water',
    name: 'Leave No Trace Concentrated Camp Soap & Scrubber',
    essential: false,
    weightGrams: 85,
  },

  // 4. Apparel & Layers
  {
    id: 'merino-base-layer',
    category: 'Apparel & Layers',
    name: 'Merino Wool Moisture-Wicking Base Layers',
    essential: true,
    weightGrams: 310,
  },
  {
    id: 'fleece-midlayer',
    category: 'Apparel & Layers',
    name: 'Breathable Grid Fleece / Insulated Midlayer',
    essential: true,
    weightGrams: 380,
  },
  {
    id: 'hardshell-rain-jacket',
    category: 'Apparel & Layers',
    name: 'GORE-TEX Waterproof Breathable Rain Jacket',
    essential: true,
    weightGrams: 390,
  },
  {
    id: 'wool-hiking-socks',
    category: 'Apparel & Layers',
    name: 'Merino Wool Trail Cushion Socks (3 Pairs)',
    essential: true,
    weightGrams: 190,
  },
  {
    id: 'hiking-boots',
    category: 'Apparel & Layers',
    name: 'Rugged Waterproof Trail Boots / Trail Runners',
    essential: true,
    weightGrams: 880,
  },
  {
    id: 'microspikes',
    category: 'Apparel & Layers',
    name: 'Traction Microspikes / Crampons',
    essential: true,
    climateSpecific: 'cold',
    weightGrams: 390,
  },
  {
    id: 'thermal-gloves-beanie',
    category: 'Apparel & Layers',
    name: 'Insulated Windproof Gloves & Thermal Beanie',
    essential: true,
    climateSpecific: 'cold',
    weightGrams: 160,
  },
  {
    id: 'sun-hoodie-desert-hat',
    category: 'Apparel & Layers',
    name: 'UPF 50+ Sun Hoodie & Wide-Brim Desert Hat',
    essential: true,
    climateSpecific: 'desert',
    weightGrams: 210,
  },

  // 5. Camp Comfort
  {
    id: 'inflatable-pillow',
    category: 'Camp Comfort',
    name: 'Ultralight Ergonomic Camp Pillow',
    essential: false,
    weightGrams: 80,
  },
  {
    id: 'camp-sandals',
    category: 'Camp Comfort',
    name: 'Lightweight Packable Camp Shoes / Sandals',
    essential: false,
    weightGrams: 260,
  },
  {
    id: 'trekking-poles',
    category: 'Camp Comfort',
    name: 'Carbon Fiber Adjustable Trekking Poles',
    essential: false,
    weightGrams: 420,
  },
  {
    id: 'power-bank',
    category: 'Camp Comfort',
    name: '10,000mAh Rugged Outdoor Power Bank & Cable',
    essential: false,
    weightGrams: 230,
  },
  {
    id: 'bug-spray',
    category: 'Camp Comfort',
    name: 'DEET / Picaridin Insect Repellent Spray',
    essential: false,
    weightGrams: 110,
  },
  {
    id: 'camp-sit-pad',
    category: 'Camp Comfort',
    name: 'Closed-Cell Foam Folding Sit Pad',
    essential: false,
    weightGrams: 60,
  },
];

export function getAllTripTemplates(): TripTemplate[] {
  return [...TRIP_TEMPLATES];
}

export function calculateNutritionHydration(
  days: number,
  groupSize: number,
  climate: TripPlanParameters['climate'],
  terrain: TripPlanParameters['terrain']
) {
  let dailyCaloriesPerPersonKcal = 3000;
  if (climate === 'subzero' || terrain === 'snow') {
    dailyCaloriesPerPersonKcal = 3800;
  } else if (climate === 'cold' || terrain === 'alpine') {
    dailyCaloriesPerPersonKcal = 3400;
  } else if (climate === 'warm') {
    dailyCaloriesPerPersonKcal = 2800;
  }

  let dailyWaterLitersPerPerson = 3.0;
  if (terrain === 'desert' || terrain === 'alpine' || climate === 'warm') {
    dailyWaterLitersPerPerson = 4.5;
  }

  const totalCaloriesKcal = dailyCaloriesPerPersonKcal * days * groupSize;
  const totalWaterCapacityLiters = Number((dailyWaterLitersPerPerson * groupSize).toFixed(1));

  return {
    totalCaloriesKcal,
    dailyCaloriesPerPersonKcal,
    dailyWaterLitersPerPerson,
    totalWaterCapacityLiters,
  };
}

export function generateTripPlan(params: TripPlanParameters): TripPlanSummary {
  const { days, groupSize, climate, terrain } = params;
  const nutrition = calculateNutritionHydration(days, groupSize, climate, terrain);

  const isCold = climate === 'cold' || climate === 'subzero';
  const isSubzero = climate === 'subzero';
  const isDesert = terrain === 'desert' || climate === 'warm';

  const items = CHECKLIST_CATALOG.filter((item) => {
    // Exclude warm/moderate-only shelter & sleep gear in freezing/subzero conditions
    if (item.id === 'tent-3season' || item.id === 'pad-standard' || item.id === 'sleeping-bag-moderate') {
      return !isCold;
    }

    if (!item.climateSpecific || item.climateSpecific === 'any') {
      return true;
    }

    if (item.climateSpecific === 'cold') {
      return isCold;
    }

    if (item.climateSpecific === 'subzero') {
      return isSubzero;
    }

    if (item.climateSpecific === 'desert') {
      return isDesert;
    }

    return true;
  });

  const totalGrams = items.reduce((acc, item) => acc + item.weightGrams, 0);
  const estimatedBaseWeightKg = Number((totalGrams / 1000).toFixed(1));

  return {
    ...nutrition,
    estimatedBaseWeightKg,
    items,
  };
}
