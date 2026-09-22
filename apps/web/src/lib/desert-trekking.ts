export type AridityZone =
  | 'hyper_arid_salt_playa'
  | 'canyon_wash_slickrock'
  | 'high_desert_sage_steppe'
  | 'creosote_bajada_scrub';

export type FlashFloodRisk = 'low' | 'moderate' | 'high' | 'extreme';

export type HydrationSafetyStatus =
  | 'carry_capacity_adequate'
  | 'water_cache_mandatory'
  | 'extreme_heat_no_travel';

export interface DesertRoute {
  id: string;
  title: string;
  region: string;
  distanceKm: number;
  elevationGainM: number;
  aridityZone: AridityZone;
  waterSourcesCount: number;
  typicalDurationDays: number;
  waterCacheRequired: boolean;
  flashFloodRisk: FlashFloodRisk;
  description: string;
  highlights: string[];
}

export interface HydrationPlanQuery {
  routeId: string;
  ambientTemperatureF: number;
  relativeHumidityPct: number;
  hikerWeightKg: number;
  packWeightKg: number;
  trekkingPaceKmH: number;
  hoursInDirectSun: number;
  shadeUmbrellaUsed: boolean;
}

export interface HydrationPlanResult {
  routeTitle: string;
  aridityZone: AridityZone;
  feltHeatIndexF: number;
  hourlySweatRateLiters: number;
  totalWaterNeededLiters: number;
  safetyStatus: HydrationSafetyStatus;
  electrolyteDoseMg: number;
  siestaHoursAdvisory: string;
  flashFloodAdvisory: string;
  cachingNotice: string;
}

export interface DesertGearItem {
  id: string;
  name: string;
  category: 'sun_protection' | 'hydration' | 'shelter' | 'navigation' | 'signaling';
  mandatory: boolean;
  description: string;
}

export const DESERT_ROUTES: DesertRoute[] = [
  {
    id: 'badwater-telescope-peak-traverse',
    title: 'Badwater Basin to Telescope Peak Low-to-High',
    region: 'Death Valley National Park, Inyo County, CA',
    distanceKm: 48.0,
    elevationGainM: 3450,
    aridityZone: 'hyper_arid_salt_playa',
    waterSourcesCount: 1,
    typicalDurationDays: 3,
    waterCacheRequired: true,
    flashFloodRisk: 'low',
    description:
      'Extreme elevation ascent starting on the blistering salt flats of Death Valley and ascending to alpine limber pine groves atop Telescope Peak.',
    highlights: [
      'From -282 ft below sea level to 11,049 ft summit',
      'Salt polygons of Badwater Basin',
      'Sub-alpine limber pine crest contrast',
    ],
  },
  {
    id: 'hayduke-buckskin-gulch-paria',
    title: 'Buckskin Gulch to Paria Canyon Confluence',
    region: 'Vermilion Cliffs National Monument, Kane County, UT',
    distanceKm: 34.0,
    elevationGainM: 280,
    aridityZone: 'canyon_wash_slickrock',
    waterSourcesCount: 2,
    typicalDurationDays: 2,
    waterCacheRequired: false,
    flashFloodRisk: 'extreme',
    description:
      'North America’s longest and deepest slot canyon, cutting through towering Navajo sandstone narrows with extreme flash flood containment risks.',
    highlights: [
      'Deepest slot canyon in North America',
      'Narrow 10-foot wide 500-foot sandstone corridors',
      'Flash flood escape ladder checkpoints',
    ],
  },
  {
    id: 'mazatzal-wilderness-divide-trail',
    title: 'Mazatzal Divide Trail & Red Creek Basin',
    region: 'Mazatzal Wilderness, Gila County, AZ',
    distanceKm: 42.0,
    elevationGainM: 1720,
    aridityZone: 'creosote_bajada_scrub',
    waterSourcesCount: 2,
    typicalDurationDays: 3,
    waterCacheRequired: true,
    flashFloodRisk: 'moderate',
    description:
      'Rugged Central Arizona divide traversing dense Sonoran bajada scrub, volcanic ridgelines, and precious seasonal bedrock tinajas.',
    highlights: [
      'Rugged desert crest ridgelines',
      'Seasonal tinaja rock water pools',
      'Saguaro to pinyon-juniper ecological zone shift',
    ],
  },
  {
    id: 'black-rock-desert-playa-crossing',
    title: 'Black Rock Desert High Rock Canyon Emigrant Trail',
    region: 'Black Rock Desert, Washoe County, NV',
    distanceKm: 56.0,
    elevationGainM: 310,
    aridityZone: 'hyper_arid_salt_playa',
    waterSourcesCount: 0,
    typicalDurationDays: 2,
    waterCacheRequired: true,
    flashFloodRisk: 'low',
    description:
      'Vast, horizon-spanning ancient pluvial lakebed crossing where absence of natural water sources and alkali dust demand pre-staged water caches.',
    highlights: [
      'Vast 400-square-mile dry lake bed expanse',
      'Applegate-Lassen historic pioneer wagon trail',
      'Geothermal hot springs perimeter',
    ],
  },
  {
    id: 'chihuahuan-mariscal-canyon-rim',
    title: 'Mariscal Canyon Rim & Talley Desert Route',
    region: 'Big Bend National Park, Brewster County, TX',
    distanceKm: 26.0,
    elevationGainM: 640,
    aridityZone: 'high_desert_sage_steppe',
    waterSourcesCount: 0,
    typicalDurationDays: 2,
    waterCacheRequired: true,
    flashFloodRisk: 'moderate',
    description:
      'Chihuahuan desert rim trek through candelilla-covered limestone badlands overlooking vertical drops to the Rio Grande canyon floor.',
    highlights: [
      '1,200-foot vertical limestone canyon cliffs above Rio Grande',
      'Candelilla wax camp historic ruins',
      'Chisos Mountains desert horizon vista',
    ],
  },
];

export const DESERT_GEAR: DesertGearItem[] = [
  {
    id: 'wide-brim-sun-sombrero-cape',
    name: 'UPF 50+ Wide-Brim Desert Sun Hat with Removable Neck/Face Sun Drape',
    category: 'sun_protection',
    mandatory: true,
    description:
      'Full coverage desert headwear shielding face, neck, and carotid arteries from radiant solar heating.',
  },
  {
    id: 'electrolytes-fluid-reservoir-system',
    name: 'Heavy-Duty 6-Liter Dual Dromedary Hydration Reservoir Bladders plus Sodium-Potassium Electrolytes',
    category: 'hydration',
    mandatory: true,
    description:
      'Puncture-resistant 1000D Cordura dromedary bags and medical-grade oral rehydration salts preventing hyponatremia.',
  },
  {
    id: 'uv-blocking-ultralight-sun-umbrella',
    name: 'Reflective Chrome UV-Block Trekking Sun Umbrella (Reduces Felt Temp by 15°F)',
    category: 'sun_protection',
    mandatory: true,
    description:
      'Ultralight metallized UPF 50+ sun umbrella reflecting 99% of UV radiation to slash microclimate radiant load.',
  },
  {
    id: 'emergency-desert-bivvy-tarp',
    name: 'Reflective Thermal Bivvy Sack and Mylar Shade Fly with Guyline Stakes',
    category: 'shelter',
    mandatory: true,
    description:
      'Dual-purpose aluminized shelter for daytime solar reflection and critical nighttime hypothermia prevention.',
  },
  {
    id: 'satellite-sos-inreach-messenger',
    name: 'Two-Way Satellite Messenger & Offline GPS Topo Map Navigation',
    category: 'navigation',
    mandatory: true,
    description:
      'Iridium network communicator with dedicated SOS trigger and cached USGS 1:24k topo offline layers.',
  },
  {
    id: 'high-vis-desert-signal-mirror',
    name: 'Precision Aiming Glass Signal Mirror and Pealess Emergency Whistle',
    category: 'signaling',
    mandatory: true,
    description:
      'Retro-reflective aiming mesh mirror visible up to 20 miles for airborne SAR operations in barren expanses.',
  },
];

export function getDesertRoutes(zone?: AridityZone): DesertRoute[] {
  if (!zone) {
    return DESERT_ROUTES;
  }
  return DESERT_ROUTES.filter((route) => route.aridityZone === zone);
}

export function getDesertRouteById(id: string): DesertRoute | undefined {
  return DESERT_ROUTES.find((route) => route.id === id);
}

export function getDesertGear(): DesertGearItem[] {
  return DESERT_GEAR;
}

function computeHeatIndex(tempF: number, rh: number): number {
  if (tempF < 80) {
    return 0.5 * (tempF + 61.0 + ((tempF - 68.0) * 1.2) + (rh * 0.094));
  }
  const c1 = -42.379;
  const c2 = 2.04901523;
  const c3 = 10.14333127;
  const c4 = -0.22475541;
  const c5 = -0.00683783;
  const c6 = -0.05481717;
  const c7 = 0.00122874;
  const c8 = 0.00085282;
  const c9 = -0.00000199;

  let hi =
    c1 +
    c2 * tempF +
    c3 * rh +
    c4 * tempF * rh +
    c5 * tempF * tempF +
    c6 * rh * rh +
    c7 * tempF * tempF * rh +
    c8 * tempF * rh * rh +
    c9 * tempF * tempF * rh * rh;

  if (rh < 13 && tempF >= 80 && tempF <= 112) {
    const adj = ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tempF - 95.0)) / 17);
    hi -= adj;
  } else if (rh > 85 && tempF >= 80 && tempF <= 87) {
    const adj = ((rh - 85) / 10) * ((87 - tempF) / 5);
    hi += adj;
  }
  return hi;
}

export function calculateHydrationPlan(query: HydrationPlanQuery): HydrationPlanResult {
  const route = getDesertRouteById(query.routeId);
  if (!route) {
    throw new Error(`Desert route with id "${query.routeId}" not found.`);
  }

  const baseHeatIndex = computeHeatIndex(query.ambientTemperatureF, query.relativeHumidityPct);
  // Umbrella reduces felt temperature by 15°F
  const feltHeatIndexF = Math.round(query.shadeUmbrellaUsed ? baseHeatIndex - 15 : baseHeatIndex);

  // Arid sweat rate modeling:
  // Baseline arid rate + heat stress scaled by mass and pace
  const heatStress = Math.max(0, feltHeatIndexF - 70);
  const heatFactor = heatStress * 0.018;

  const totalMass = query.hikerWeightKg + query.packWeightKg;
  const massRatio = totalMass / 85;
  const paceRatio = 0.5 + 0.5 * (query.trekkingPaceKmH / 3.5);

  const hourlySweatRate = (0.55 + heatFactor) * massRatio * paceRatio;
  const hourlySweatRateLiters = Number(hourlySweatRate.toFixed(2));
  const totalWaterNeededLiters = Number((hourlySweatRateLiters * query.hoursInDirectSun).toFixed(1));

  // Determine safety status
  let safetyStatus: HydrationSafetyStatus = 'carry_capacity_adequate';
  if (feltHeatIndexF > 110) {
    safetyStatus = 'extreme_heat_no_travel';
  } else if (totalWaterNeededLiters > 7.0) {
    safetyStatus = 'water_cache_mandatory';
  } else {
    safetyStatus = 'carry_capacity_adequate';
  }

  // Electrolyte dose (sodium): ~650 mg per liter of sweat lost
  const electrolyteDoseMg = Math.round(totalWaterNeededLiters * 650);

  // Siesta hours advisory
  let siestaHoursAdvisory = '';
  if (feltHeatIndexF >= 105) {
    siestaHoursAdvisory =
      'MANDATORY SIESTA: Halt all travel between 10:00 AM and 4:30 PM. Extreme solar radiation and heat index present immediate heat stroke danger.';
  } else if (feltHeatIndexF >= 92) {
    siestaHoursAdvisory =
      'RECOMMENDED SIESTA: Halt open travel between 11:00 AM and 4:00 PM. Rest in canyon wall shade or rigged reflective fly.';
  } else {
    siestaHoursAdvisory =
      'OPTIONAL MIDDAY PAUSE: Rest in available shade between 12:00 PM and 2:30 PM during peak solar UV index.';
  }

  // Flash flood advisory
  let flashFloodAdvisory = '';
  if (route.flashFloodRisk === 'extreme') {
    flashFloodAdvisory =
      'EXTREME FLASH FLOOD RISK: Buckskin Gulch and Paria narrows have zero escape ladders for miles. Distant storms 30 miles away can flood corridors violently.';
  } else if (route.flashFloodRisk === 'high') {
    flashFloodAdvisory =
      'HIGH FLASH FLOOD RISK: Slot canyon walls funnel flash runoff rapidly. Identify high ledges before entering narrows.';
  } else if (route.flashFloodRisk === 'moderate') {
    flashFloodAdvisory =
      'MODERATE FLASH FLOOD RISK: Desert arroyos, canyon washes, and dry gulches can rapidly funnel runoff during monsoon downpours.';
  } else {
    flashFloodAdvisory =
      'LOW FLASH FLOOD RISK: Expansive dry playa bed and ridge crest topography have minimal slot entrapment danger.';
  }

  // Caching notice
  let cachingNotice = '';
  if (safetyStatus === 'extreme_heat_no_travel') {
    cachingNotice =
      'EXTREME HEAT WARNING — HALT TRAVEL: Thermal index exceeds human sweat dissipation thresholds. Postpone expedition or hike exclusively at night.';
  } else if (safetyStatus === 'water_cache_mandatory') {
    cachingNotice = `MANDATORY WATER CACHE REQUIRED: Total water requirement (${totalWaterNeededLiters} L) exceeds safe pack carrying capacity (7 L / 15.4 lbs). Pre-cache water containers along access points before starting.`;
  } else {
    cachingNotice = route.waterCacheRequired
      ? `ROUTE WATER CACHE RECOMMENDED: Single push estimate (${totalWaterNeededLiters} L) is within 7L capacity, but this multi-day traverse typically requires pre-staged water caches.`
      : `CARRY CAPACITY ADEQUATE: Fluid demand (${totalWaterNeededLiters} L) is within 6-7 Liter reservoir carry limit. Maintain constant fluid and electrolyte intake.`;
  }

  return {
    routeTitle: route.title,
    aridityZone: route.aridityZone,
    feltHeatIndexF,
    hourlySweatRateLiters,
    totalWaterNeededLiters,
    safetyStatus,
    electrolyteDoseMg,
    siestaHoursAdvisory,
    flashFloodAdvisory,
    cachingNotice,
  };
}
