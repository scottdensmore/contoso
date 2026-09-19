export type TourDifficulty = 'beginner_friendly' | 'intermediate' | 'advanced' | 'expert_steep';
export type SnowpackZone = 'cascade_crest' | 'west_slopes' | 'east_slopes' | 'volcano_alpine';

export interface SkiTourRoute {
  id: string;
  name: string;
  region: string;
  zone: SnowpackZone;
  difficulty: TourDifficulty;
  distanceMiles: number;
  elevationGainFt: number;
  maxElevationFt: number;
  avgUphillHours: number;
  avalancheTerrainRating: 'simple' | 'challenging' | 'complex';
  recommendedSeason: string;
  skinTrackNotes: string;
  parkingPermitRequired: string;
  uphillTravelPolicy: string;
}

export interface SkinningPaceCalculationRequest {
  routeId: string;
  fitnessLevel: 'recreational' | 'moderate' | 'athletic' | 'skimo_racer';
  snowCondition: 'firm_skin_track' | 'breaking_trail_powder' | 'wet_heavy_spring';
  partySize: number;
}

export interface SkinningPaceCalculationResult {
  routeId: string;
  estimatedUphillMinutes: number;
  estimatedDescentMinutes: number;
  totalTourMinutes: number;
  verticalFeetPerHour: number;
  transitionCount: number;
  recommendedTurnaroundTime: string;
  hydrationLiters: number;
  caloriesBurned: number;
  gearRecommendations: string[];
}

export interface TouringGearItem {
  id: string;
  name: string;
  category: 'uphill_traction' | 'avalanche_safety' | 'repair_field' | 'comfort_layering';
  essential: boolean;
  description: string;
}

export const SKI_TOUR_ROUTES: SkiTourRoute[] = [
  {
    id: 'muir-snowfield',
    name: 'Camp Muir Snowfield',
    region: 'Mount Rainier National Park',
    zone: 'volcano_alpine',
    difficulty: 'advanced',
    distanceMiles: 9.0,
    elevationGainFt: 4600,
    maxElevationFt: 10080,
    avgUphillHours: 4.5,
    avalancheTerrainRating: 'challenging',
    recommendedSeason: 'April - July',
    skinTrackNotes: 'Crevasse fall danger above 10,000 ft; watch for sudden whiteout and keep compass bearing to Panorama Point.',
    parkingPermitRequired: 'National Park Pass',
    uphillTravelPolicy: 'Uphill travel permitted with wilderness climbing pass required above high camp.',
  },
  {
    id: 'kendal-lakes',
    name: 'Kendall Lakes Peak & Knob',
    region: 'Snoqualmie Pass',
    zone: 'cascade_crest',
    difficulty: 'intermediate',
    distanceMiles: 6.5,
    elevationGainFt: 2200,
    maxElevationFt: 5100,
    avgUphillHours: 2.5,
    avalancheTerrainRating: 'challenging',
    recommendedSeason: 'December - March',
    skinTrackNotes: 'Skin road to lake basin, ascending steep open glades with convex rollovers.',
    parkingPermitRequired: 'Sno-Park with Special Groomed Sticker',
    uphillTravelPolicy: 'Backcountry access through Commonwealth Basin; watch for cross-country skiers on groomed paths.',
  },
  {
    id: 'artist-point-table',
    name: 'Artist Point to Table Mountain',
    region: 'Mount Baker / Heather Meadows',
    zone: 'west_slopes',
    difficulty: 'beginner_friendly',
    distanceMiles: 4.0,
    elevationGainFt: 1400,
    maxElevationFt: 5100,
    avgUphillHours: 1.8,
    avalancheTerrainRating: 'simple',
    recommendedSeason: 'November - May',
    skinTrackNotes: 'Gentle rolling ridge line with stunning views of Shuksan; avoid steep cornice fall from Table Mountain cirque.',
    parkingPermitRequired: 'Northwest Forest Pass',
    uphillTravelPolicy: 'No uphill skinning inside ski area boundary during operating hours; utilize dedicated backcountry ascent trail.',
  },
  {
    id: 'silver-basin',
    name: 'Silver Basin & Three Way Peak',
    region: 'Crystal Mountain Backcountry',
    zone: 'cascade_crest',
    difficulty: 'advanced',
    distanceMiles: 5.5,
    elevationGainFt: 2800,
    maxElevationFt: 6790,
    avgUphillHours: 3.0,
    avalancheTerrainRating: 'complex',
    recommendedSeason: 'January - April',
    skinTrackNotes: 'Steep kick turns required on Three Way shoulder; high consequence terrain traps in north bowl.',
    parkingPermitRequired: 'Crystal Mountain Parking / USFS',
    uphillTravelPolicy: 'Resort boundary exit through gates only; transceiver required at resort access points.',
  },
  {
    id: 'blewett-pass-diamond',
    name: 'Diamond Head via Blewett Pass',
    region: 'East Cascades / Swauk',
    zone: 'east_slopes',
    difficulty: 'beginner_friendly',
    distanceMiles: 7.0,
    elevationGainFt: 1800,
    maxElevationFt: 5916,
    avgUphillHours: 2.2,
    avalancheTerrainRating: 'simple',
    recommendedSeason: 'December - March',
    skinTrackNotes: 'Mellow low-angle forest and glades with drier continental snowpack; ideal early-season or high-danger day tour.',
    parkingPermitRequired: 'Sno-Park Permit',
    uphillTravelPolicy: 'Non-motorized Sno-Park area; avoid snowmobile tracks on marked ski trails.',
  },
];

export const TOURING_GEAR_CHECKLIST: TouringGearItem[] = [
  {
    id: 'skins',
    name: 'Climbing Skins',
    category: 'uphill_traction',
    essential: true,
    description: 'Climbing skins (mohair/nylon blend tailored to ski waist) for reliable uphill traction and gliding efficiency.',
  },
  {
    id: 'ski-crampons',
    name: 'Ski Crampons',
    category: 'uphill_traction',
    essential: true,
    description: 'Binding-mounted ski crampons for icy traverses and firm morning crust.',
  },
  {
    id: 'skin-wax-scraper',
    name: 'Skin Wax & Scraper',
    category: 'repair_field',
    essential: false,
    description: 'Skin wax & scraper to prevent snow buildup, moisture freezing, and glopping in variable snow.',
  },
  {
    id: 'touring-poles',
    name: 'Lightweight Touring Poles',
    category: 'uphill_traction',
    essential: true,
    description: 'Lightweight touring poles with powder baskets, extended foam grips, and quick-adjust locking levers.',
  },
  {
    id: 'repair-multi-tool',
    name: 'Splitboard / AT Binding Repair Multi-Tool',
    category: 'repair_field',
    essential: true,
    description: 'Splitboard / AT binding repair multi-tool with spare screws, bits, and Voile straps for field fixes.',
  },
  {
    id: 'beacon-probe-shovel',
    name: 'Beacon / Probe / Shovel',
    category: 'avalanche_safety',
    essential: true,
    description: 'Beacon/Probe/Shovel (3-antenna digital transceiver, 280cm aluminum probe, metal scoop shovel).',
  },
  {
    id: 'helmet-headlamp',
    name: 'Helmet with Headlamp Clip',
    category: 'comfort_layering',
    essential: true,
    description: 'Helmet with headlamp clip certified for skiing and mountaineering with secure headlamp mount.',
  },
];

export function getSkiTourRoutes(difficulty?: TourDifficulty, zone?: SnowpackZone): SkiTourRoute[] {
  return SKI_TOUR_ROUTES.filter((route) => {
    if (difficulty && route.difficulty !== difficulty) {
      return false;
    }
    if (zone && route.zone !== zone) {
      return false;
    }
    return true;
  });
}

export function getSkiTourRouteById(id: string): SkiTourRoute | undefined {
  return SKI_TOUR_ROUTES.find((route) => route.id === id);
}

export function calculateSkinningPace(req: SkinningPaceCalculationRequest): SkinningPaceCalculationResult {
  const route = getSkiTourRouteById(req.routeId);
  if (!route) {
    throw new Error(`Route with id "${req.routeId}" not found`);
  }

  const baseVertMap: Record<SkinningPaceCalculationRequest['fitnessLevel'], number> = {
    recreational: 800,
    moderate: 1100,
    athletic: 1500,
    skimo_racer: 2000,
  };

  const snowMultiplierMap: Record<SkinningPaceCalculationRequest['snowCondition'], number> = {
    firm_skin_track: 1.05,
    breaking_trail_powder: 0.75,
    wet_heavy_spring: 0.85,
  };

  const baseVert = baseVertMap[req.fitnessLevel];
  const snowMultiplier = snowMultiplierMap[req.snowCondition];
  const partyFactor = Math.max(0.75, 1 - (req.partySize - 1) * 0.03);

  const verticalFeetPerHour = Math.round(baseVert * snowMultiplier * partyFactor);
  const estimatedUphillMinutes = Math.round((route.elevationGainFt / verticalFeetPerHour) * 60);
  const estimatedDescentMinutes = Math.round(route.distanceMiles * 8);
  const transitionCount = 2;
  const totalTourMinutes = estimatedUphillMinutes + transitionCount * 10 + estimatedDescentMinutes;

  const hydrationLiters = Math.round((totalTourMinutes / 60) * 0.7 * 10) / 10;
  const calorieRate = req.fitnessLevel === 'athletic' || req.fitnessLevel === 'skimo_racer' ? 12 : 9;
  const caloriesBurned = Math.round(estimatedUphillMinutes * calorieRate);

  // Turnaround calculation assuming standard 7:00 AM alpine trailhead departure
  const startTotalMinutes = 7 * 60;
  const turnaroundTotalMinutes = startTotalMinutes + estimatedUphillMinutes;
  const turnaroundHour24 = Math.floor(turnaroundTotalMinutes / 60);
  const turnaroundMin = turnaroundTotalMinutes % 60;
  const period = turnaroundHour24 >= 12 ? 'PM' : 'AM';
  const turnaroundHour12 =
    turnaroundHour24 > 12 ? turnaroundHour24 - 12 : turnaroundHour24 === 0 ? 12 : turnaroundHour24;
  const formattedTime = `${turnaroundHour12}:${turnaroundMin.toString().padStart(2, '0')} ${period}`;

  // Safe daylight margin before standard winter dusk (17:00 / 5:00 PM)
  const duskMinutes = 17 * 60;
  const returnMinutes = startTotalMinutes + totalTourMinutes;
  const marginHours = Math.max(0, Math.round(((duskMinutes - returnMinutes) / 60) * 10) / 10);
  const recommendedTurnaroundTime = `${formattedTime} (${marginHours}h daylight margin before dusk)`;

  const gearRecommendations: string[] = [
    'Climbing skins (mohair/nylon blend tailored to ski waist)',
    'Beacon/Probe/Shovel mandatory companion rescue set',
  ];

  if (req.snowCondition === 'firm_skin_track') {
    gearRecommendations.push('Ski crampons recommended for firm/icy morning skin track traverses');
  } else if (req.snowCondition === 'wet_heavy_spring') {
    gearRecommendations.push('Skin wax & scraper essential to prevent snow buildup and glopping');
  } else if (req.snowCondition === 'breaking_trail_powder') {
    gearRecommendations.push('Wide powder baskets and breathable climbing layers for breaking trail');
  }

  if (route.elevationGainFt >= 2500 || req.partySize >= 4) {
    gearRecommendations.push('Binding repair multi-tool with spare hardware and extra Voile straps');
  }

  if (route.maxElevationFt >= 7000) {
    gearRecommendations.push('Glacier glasses and high-SPF zinc face protection for high-elevation glare');
  }

  return {
    routeId: req.routeId,
    estimatedUphillMinutes,
    estimatedDescentMinutes,
    totalTourMinutes,
    verticalFeetPerHour,
    transitionCount,
    recommendedTurnaroundTime,
    hydrationLiters,
    caloriesBurned,
    gearRecommendations,
  };
}

export function getTouringGearChecklist(): TouringGearItem[] {
  return TOURING_GEAR_CHECKLIST;
}
