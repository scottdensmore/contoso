export type TrailDifficulty = 'easy' | 'moderate' | 'hard';
export type TrailStatus = 'open' | 'caution' | 'closed';

export interface Trail {
  id: string;
  name: string;
  region: string;
  difficulty: TrailDifficulty;
  distanceMiles: number;
  elevationGainFt: number;
  currentWeather: {
    temperatureF: number;
    condition: string;
    trailStatus: TrailStatus;
    advisory?: string;
  };
  recommendedCategory: string;
  essentialGear: string[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  category: string;
  essential: boolean;
}

export const TRAILS: Trail[] = [
  {
    id: 'rattlesnake-ridge',
    name: 'Rattlesnake Ridge Trail',
    region: 'Pacific Northwest',
    difficulty: 'moderate',
    distanceMiles: 4.0,
    elevationGainFt: 1160,
    currentWeather: {
      temperatureF: 58,
      condition: 'Partly Cloudy',
      trailStatus: 'open',
    },
    recommendedCategory: 'hiking-footwear',
    essentialGear: [
      'Trekking poles',
      'Trail running shoes',
      'Hydration pack',
      'Light rain shell',
    ],
  },
  {
    id: 'bear-peak',
    name: 'Bear Peak Summit',
    region: 'Rocky Mountains',
    difficulty: 'hard',
    distanceMiles: 5.7,
    elevationGainFt: 2900,
    currentWeather: {
      temperatureF: 45,
      condition: 'Breezy',
      trailStatus: 'open',
    },
    recommendedCategory: 'hiking-clothing',
    essentialGear: [
      'Insulated windbreaker',
      'Sturdy hiking boots',
      'Electrolyte drink',
      'Topographic map',
    ],
  },
  {
    id: 'multnomah-loop',
    name: 'Multnomah-Wahkeena Loop',
    region: 'Pacific Northwest',
    difficulty: 'moderate',
    distanceMiles: 4.9,
    elevationGainFt: 1600,
    currentWeather: {
      temperatureF: 54,
      condition: 'Light Rain',
      trailStatus: 'caution',
      advisory: 'Slick rock surfaces near waterfalls spray',
    },
    recommendedCategory: 'hiking-clothing',
    essentialGear: [
      'Waterproof rain jacket',
      'Grip traction footwear',
      'Dry bag',
    ],
  },
  {
    id: 'mount-olympus',
    name: 'Mount Olympus Trail',
    region: 'Wasatch Range',
    difficulty: 'hard',
    distanceMiles: 7.5,
    elevationGainFt: 4100,
    currentWeather: {
      temperatureF: 62,
      condition: 'Sunny',
      trailStatus: 'open',
    },
    recommendedCategory: 'backpacks',
    essentialGear: [
      'UV protection sun hoodie',
      '3L water bladder',
      'Sunscreen SPF 50',
      'High-calorie energy chews',
    ],
  },
];

export function getTrails(region?: string, difficulty?: string): Trail[] {
  return TRAILS.filter((trail) => {
    if (region && region.toLowerCase() !== 'all') {
      if (trail.region.toLowerCase() !== region.toLowerCase()) {
        return false;
      }
    }
    if (difficulty && difficulty.toLowerCase() !== 'all') {
      if (trail.difficulty.toLowerCase() !== difficulty.toLowerCase()) {
        return false;
      }
    }
    return true;
  });
}

export function getTrailById(id: string): Trail | null {
  const found = TRAILS.find((trail) => trail.id === id);
  return found ?? null;
}

export function generateChecklist(
  activity: string,
  season: string,
  weatherCondition?: string
): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  const act = activity.toLowerCase();
  const sea = season.toLowerCase();

  // Activity base items
  if (act === 'day-hiking') {
    items.push(
      { id: 'hike-nav', name: 'Navigation (Topographic Map & Compass / GPS)', category: 'Navigation', essential: true },
      { id: 'hike-hydro', name: 'Hydration System (Water Bladder / Bottles 2L+)', category: 'Hydration', essential: true },
      { id: 'hike-first-aid', name: 'First Aid Kit & Medical Essentials', category: 'Safety', essential: true },
      { id: 'hike-headlamp', name: 'LED Headlamp & Backup Batteries', category: 'Illumination', essential: true },
      { id: 'hike-snacks', name: 'High-Energy Trail Snacks & Bars', category: 'Nutrition', essential: true },
      { id: 'hike-multi-tool', name: 'Multi-tool Knife & Duct Tape', category: 'Tools', essential: true },
      { id: 'hike-fire', name: 'Firestarter & Waterproof Matches', category: 'Fire', essential: true },
      { id: 'hike-sun', name: 'Sun Protection (Sunglasses & SPF Cream)', category: 'Sun Protection', essential: true },
      { id: 'hike-weather-layer', name: 'Weather-Resistant Outer Shell', category: 'Clothing', essential: true },
      { id: 'hike-whistle', name: 'Emergency Signal Whistle', category: 'Safety', essential: true },
      { id: 'hike-trekking-poles', name: 'Ergonomic Trekking Poles', category: 'Gear', essential: false }
    );
  } else if (act === 'backpacking') {
    items.push(
      { id: 'bp-shelter', name: 'Ultralight 3-Season Tent / Shelter', category: 'Shelter', essential: true },
      { id: 'bp-sleeping-bag', name: 'Down Sleeping Bag & Insulated Mat', category: 'Camp & Sleep', essential: true },
      { id: 'bp-stove', name: 'Backcountry Camp Stove & Fuel', category: 'Camp Kitchen', essential: true },
      { id: 'bp-water-filter', name: 'Micro-Filtration Water Filter', category: 'Hydration', essential: true },
      { id: 'bp-pack', name: '65L Technical Backpack & Rain Cover', category: 'Packs', essential: true },
      { id: 'bp-bear-canister', name: 'Bear Canister / Food Storage Vault', category: 'Safety', essential: true },
      { id: 'bp-first-aid', name: 'Comprehensive Wilderness First Aid Kit', category: 'Safety', essential: true },
      { id: 'bp-headlamp', name: 'Rechargeable LED Headlamp', category: 'Illumination', essential: true },
      { id: 'bp-meals', name: 'Dehydrated Meals & Caloric Trail Snacks', category: 'Nutrition', essential: true },
      { id: 'bp-fire-starter', name: 'Stormproof Firestarter Kit', category: 'Fire', essential: true }
    );
  } else if (act === 'alpine-snow') {
    items.push(
      { id: 'alpine-snowshoes', name: 'Alpine Snowshoes & Steel Crampons', category: 'Snow Traction', essential: true },
      { id: 'alpine-ice-axe', name: 'Technical Mountaineering Ice Axe', category: 'Snow Traction', essential: true },
      { id: 'alpine-beacon', name: 'Avalanche Beacon, Probe & Metal Shovel', category: 'Avalanche Safety', essential: true },
      { id: 'alpine-thermal', name: 'Merino Wool Thermal Base Layer', category: 'Insulation', essential: true },
      { id: 'alpine-mittens', name: 'Waterproof Insulated Mittens & Liners', category: 'Clothing', essential: true },
      { id: 'alpine-goggles', name: 'Polarized Snow Goggles & Glacier Glasses', category: 'Eye Protection', essential: true },
      { id: 'alpine-hardshell', name: 'Windproof / Waterproof Hardshell Jacket', category: 'Clothing', essential: true },
      { id: 'alpine-flask', name: 'Vacuum Insulated Hot Thermal Flask', category: 'Hydration', essential: false }
    );
  } else if (act === 'desert-trek') {
    items.push(
      { id: 'desert-water', name: 'Extra Water Capacity (4L+ Hydration Bladder)', category: 'Hydration', essential: true },
      { id: 'desert-hat', name: 'Wide-Brim Sun Hat & UV Neck Gaiter', category: 'Sun Protection', essential: true },
      { id: 'desert-electrolytes', name: 'Electrolyte Mineral Tablets & Mix', category: 'Nutrition', essential: true },
      { id: 'desert-gaiters', name: 'Breathable Sand & Debris Trail Gaiters', category: 'Footwear', essential: true },
      { id: 'desert-snake-kit', name: 'Snake-Bite & Venom Suction First Aid Kit', category: 'Safety', essential: true },
      { id: 'desert-sun-hoodie', name: 'Lightweight UPF 50+ Sun Hoodie', category: 'Clothing', essential: true },
      { id: 'desert-tarp', name: 'Reflective Shade Tarp & Poles', category: 'Shelter', essential: false }
    );
  }

  // Season adjustments
  if (sea === 'winter') {
    items.push(
      { id: 'season-winter-thermal', name: 'Heavyweight Thermal Insulation Fleece', category: 'Winter Warmth', essential: true },
      { id: 'season-winter-cleats', name: 'Traction Cleats & Microspikes', category: 'Winter Traction', essential: true },
      { id: 'season-winter-beanie', name: 'Insulated Windproof Beanie', category: 'Winter Warmth', essential: false }
    );
  } else if (sea === 'summer') {
    items.push(
      { id: 'season-summer-sun', name: 'SPF 50+ Broad-Spectrum Sunscreen & Lip Shield', category: 'Sun Protection', essential: true },
      { id: 'season-summer-hydro', name: 'Extra 1L Hydration & Electrolytes', category: 'Hydration', essential: true },
      { id: 'season-summer-towel', name: 'Cooling Neck Wrap Towel', category: 'Sun Protection', essential: false }
    );
  } else if (sea === 'spring') {
    items.push(
      { id: 'season-spring-waterproof', name: 'Waterproof Hardshell Rain Jacket', category: 'Wet Weather', essential: true },
      { id: 'season-spring-gaiters', name: 'Waterproof Mud Trail Gaiters', category: 'Footwear', essential: false }
    );
  } else if (sea === 'fall') {
    items.push(
      { id: 'season-fall-fleece', name: 'Windproof Fleece Mid-Layer Jacket', category: 'Layering', essential: true },
      { id: 'season-fall-gloves', name: 'Breathable Thermal Trail Gloves', category: 'Layering', essential: false }
    );
  }

  // Weather condition adjustments
  if (weatherCondition && weatherCondition.toLowerCase().includes('rain')) {
    if (!items.some((i) => i.name.toLowerCase().includes('rain'))) {
      items.push({
        id: 'weather-rain-cover',
        name: 'Pack Rain Cover & Waterproof Dry Bag',
        category: 'Wet Weather',
        essential: true,
      });
    }
  }

  return items;
}
