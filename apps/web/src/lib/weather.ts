export type WeatherCondition =
  | 'clear_sunny'
  | 'partly_cloudy'
  | 'overcast'
  | 'rain'
  | 'snow_flurries'
  | 'heavy_snow'
  | 'thunderstorms'
  | 'high_winds_blizzard';

export type LightningRisk = 'none' | 'low' | 'moderate' | 'high' | 'extreme';
export type PressureTrend = 'rapidly_falling' | 'falling' | 'steady' | 'rising';

export interface MountainForecastZone {
  id: string;
  name: string;
  mountainRange: string;
  baseElevationFt: number;
  summitElevationFt: number;
  baseTempF: number;
  summitTempF: number;
  freezingLevelFt: number;
  windSpeedMph: number;
  windGustMph: number;
  windDirection: string;
  condition: WeatherCondition;
  pressureTrend: PressureTrend;
  lightningRisk: LightningRisk;
  stormWarning: boolean;
  synopsis: string;
  lastUpdated: string;
}

export interface MicroclimateCalculationRequest {
  zoneId: string;
  targetElevationFt: number;
  exposureLevel: 'sheltered_valley' | 'open_slope' | 'exposed_ridge' | 'summit';
}

export interface MicroclimateCalculationResult {
  zoneId: string;
  targetElevationFt: number;
  estimatedTempF: number;
  windChillF: number;
  isBelowFreezing: boolean;
  estimatedWindSpeedMph: number;
  hypothermiaRisk: 'low' | 'moderate' | 'high' | 'critical';
  layeringAdvice: string[];
  weatherAdvisory: string;
}

export interface SevereWeatherChecklist {
  lightningProtocol: string[];
  whiteoutNavigation: string[];
}

export const MOUNTAIN_ZONES: MountainForecastZone[] = [
  {
    id: 'mount-rainier',
    name: 'Mount Rainier (Paradise to Summit)',
    mountainRange: 'South Cascades',
    baseElevationFt: 5400,
    summitElevationFt: 14411,
    baseTempF: 44,
    summitTempF: 12,
    freezingLevelFt: 7500,
    windSpeedMph: 25,
    windGustMph: 45,
    windDirection: 'WSW',
    condition: 'snow_flurries',
    pressureTrend: 'rapidly_falling',
    lightningRisk: 'moderate',
    stormWarning: true,
    synopsis:
      'Approaching Pacific cold front with rapidly dropping barometric pressure and gale gusts along Disappointment Cleaver.',
    lastUpdated: 'Today, 06:00 PST',
  },
  {
    id: 'mount-baker',
    name: 'Mount Baker (Heather Meadows to Summit)',
    mountainRange: 'North Cascades',
    baseElevationFt: 4300,
    summitElevationFt: 10781,
    baseTempF: 40,
    summitTempF: 18,
    freezingLevelFt: 6200,
    windSpeedMph: 20,
    windGustMph: 35,
    windDirection: 'W',
    condition: 'heavy_snow',
    pressureTrend: 'falling',
    lightningRisk: 'low',
    stormWarning: false,
    synopsis:
      'Substantial orographic snowfall with localized whiteout conditions above treeline.',
    lastUpdated: 'Today, 06:00 PST',
  },
  {
    id: 'snoqualmie-alpental',
    name: 'Snoqualmie Pass & Alpental Valley',
    mountainRange: 'Central Cascades',
    baseElevationFt: 3000,
    summitElevationFt: 5400,
    baseTempF: 48,
    summitTempF: 39,
    freezingLevelFt: 5800,
    windSpeedMph: 10,
    windGustMph: 20,
    windDirection: 'NW',
    condition: 'rain',
    pressureTrend: 'steady',
    lightningRisk: 'none',
    stormWarning: false,
    synopsis:
      'Transitioning rain-snow mix near pass level, calm to moderate winds in the valley.',
    lastUpdated: 'Today, 06:00 PST',
  },
  {
    id: 'stevens-crest',
    name: 'Stevens Pass & Skyline Ridge',
    mountainRange: 'Central Cascades',
    baseElevationFt: 4000,
    summitElevationFt: 5800,
    baseTempF: 42,
    summitTempF: 35,
    freezingLevelFt: 5200,
    windSpeedMph: 15,
    windGustMph: 28,
    windDirection: 'WNW',
    condition: 'partly_cloudy',
    pressureTrend: 'rising',
    lightningRisk: 'none',
    stormWarning: false,
    synopsis:
      'Clearing trend behind frontal passage, brisk ridge winds decreasing by afternoon.',
    lastUpdated: 'Today, 06:00 PST',
  },
  {
    id: 'olympic-hurricane',
    name: 'Olympic Mountains (Hurricane Ridge)',
    mountainRange: 'Olympic Peninsula',
    baseElevationFt: 5200,
    summitElevationFt: 7980,
    baseTempF: 46,
    summitTempF: 36,
    freezingLevelFt: 6800,
    windSpeedMph: 18,
    windGustMph: 32,
    windDirection: 'SW',
    condition: 'overcast',
    pressureTrend: 'falling',
    lightningRisk: 'none',
    stormWarning: false,
    synopsis:
      'Cloud cap forming over the High Divide, sustained maritime moisture pushing east.',
    lastUpdated: 'Today, 06:00 PST',
  },
];

const EXPOSURE_WIND_MULTIPLIERS: Record<
  MicroclimateCalculationRequest['exposureLevel'],
  number
> = {
  sheltered_valley: 0.7,
  open_slope: 1.1,
  exposed_ridge: 1.6,
  summit: 2.0,
};

const SEVERE_WEATHER_PROTOCOLS: SevereWeatherChecklist = {
  lightningProtocol: [
    'Adhere to the 30/30 Rule: Seek shelter if flash-to-bang is under 30 seconds; remain sheltered 30 minutes after last thunder.',
    'Ditch metal trekking poles, ice axes, and external frame packs at least 100 feet away from your shelter site.',
    'Assume the Lightning Position: Crouch on an insulating closed-cell foam pad with feet pressed tightly together.',
    'Avoid isolated tall trees, open ridgelines, shallow caves, and wet rock gullies.',
  ],
  whiteoutNavigation: [
    'Halt travel immediately upon loss of horizon and landmarks to prevent walking over cornices or cliffs.',
    'Anchor group members with safety tether/rope and reference compass bearing and pre-loaded offline GPS track.',
    'Deploy storm shelter or emergency bivy on leeward side of natural windbreaks before frostbite sets in.',
    'Use wands or cairn markers when retreating down established routes in blowing drift snow.',
  ],
};

export function getMountainForecastZones(): MountainForecastZone[] {
  return MOUNTAIN_ZONES;
}

export function getMountainZoneById(id: string): MountainForecastZone | undefined {
  return MOUNTAIN_ZONES.find((zone) => zone.id === id);
}

export function calculateMicroclimate(
  req: MicroclimateCalculationRequest
): MicroclimateCalculationResult {
  const zone = getMountainZoneById(req.zoneId) ?? MOUNTAIN_ZONES[0];

  // Temperature Lapse Rate: 3.5°F drop per 1,000 ft elevation gain from base elevation
  const estimatedTempF = Math.round(
    zone.baseTempF - ((req.targetElevationFt - zone.baseElevationFt) / 1000) * 3.5
  );

  // Wind speed adjusted by exposure
  const multiplier = EXPOSURE_WIND_MULTIPLIERS[req.exposureLevel] ?? 1.0;
  const estimatedWindSpeedMph = Math.round(zone.windSpeedMph * multiplier);

  // Wind Chill (NWS formula when temp <= 50 and wind >= 3)
  let windChillF = estimatedTempF;
  if (estimatedTempF <= 50 && estimatedWindSpeedMph >= 3) {
    const powV = Math.pow(estimatedWindSpeedMph, 0.16);
    windChillF = Math.round(
      35.74 + 0.6215 * estimatedTempF - 35.75 * powV + 0.4275 * estimatedTempF * powV
    );
  }

  const isBelowFreezing = estimatedTempF <= 32;

  // Hypothermia risk
  let hypothermiaRisk: 'low' | 'moderate' | 'high' | 'critical';
  if (windChillF <= 15) {
    hypothermiaRisk = 'critical';
  } else if (windChillF <= 32) {
    hypothermiaRisk = 'high';
  } else if (windChillF <= 45) {
    hypothermiaRisk = 'moderate';
  } else {
    hypothermiaRisk = 'low';
  }

  // Layering advice
  const layeringAdvice = [
    'Base Layer: Merino wool or synthetic moisture-wicking next-to-skin (no cotton)',
    'Mid Layer: Active breathable fleece or 800-fill down/synthetic puffy',
    'Outer Shell: 3-layer Gore-Tex / hardshell windproof and waterproof jacket & pants',
  ];

  let weatherAdvisory = '';
  switch (hypothermiaRisk) {
    case 'critical':
      weatherAdvisory =
        'Critical hypothermia danger: Sub-zero wind chill and extreme alpine exposure. Frostbite possible within 30 minutes on exposed skin. Emergency storm shelter and expedition-grade insulation mandatory.';
      break;
    case 'high':
      weatherAdvisory =
        'High hypothermia risk: Sustained sub-freezing temperatures and heavy wind chill. Full windproof hardshell, insulated gloves, and thermal headwear required.';
      break;
    case 'moderate':
      weatherAdvisory =
        'Moderate hypothermia risk: Cool temperatures and moderate exposure. Monitor sweat output to prevent saturated next-to-skin layers.';
      break;
    case 'low':
      weatherAdvisory =
        'Low hypothermia risk: Relatively mild alpine conditions. Keep waterproof shells easily accessible in case of rapid weather shifts.';
      break;
  }

  return {
    zoneId: req.zoneId,
    targetElevationFt: req.targetElevationFt,
    estimatedTempF,
    windChillF,
    isBelowFreezing,
    estimatedWindSpeedMph,
    hypothermiaRisk,
    layeringAdvice,
    weatherAdvisory,
  };
}

export function getSevereWeatherProtocols(): SevereWeatherChecklist {
  return SEVERE_WEATHER_PROTOCOLS;
}
