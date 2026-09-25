export type SynopticLevel = '300mb' | '500mb' | '600mb' | '700mb';
export type BarometricTrendStatus =
  | 'steady_fair'
  | 'approaching_front'
  | 'rapid_storm_warning'
  | 'explosive_cyclogenesis_evacuation';
export type SummitWindowStatus =
  | 'go_summit_window'
  | 'marginal_caution_window'
  | 'abort_severe_winds_whiteout';

export interface WeatherSector {
  id: string;
  title: string;
  mountainRange: string;
  region: string;
  elevationM: number;
  synopticLevel: SynopticLevel;
  venturiMultiplier: number;
  defaultJetStreamOffsetKm: number;
  description: string;
  highlights: string[];
}

export interface MountainWeatherQuery {
  sectorId: string;
  baselineWindMph: number; // 5 to 65 mph, default 20
  barometricDropHpa: number; // 0.0 to 8.0 hPa per 3hr, default 1.2
  jetStreamOffsetKm: number; // 0 to 500 km, default 150
  airTempF: number; // -40 to 45 F, default 10
}

export interface MountainWeatherResult {
  sectorTitle: string;
  elevationM: number;
  summitWindMph: number;
  windChillF: number;
  barometricTrend: BarometricTrendStatus;
  summitWindowStatus: SummitWindowStatus;
  routeAdvisory: string;
}

export interface WeatherGearItem {
  id: string;
  name: string;
  category: 'barometry' | 'wind' | 'communications' | 'navigation' | 'protection' | 'survival';
  mandatory: boolean;
  description: string;
}

export const WEATHER_SECTORS: WeatherSector[] = [
  {
    id: 'denali-south-buttress',
    title: 'Denali Upper Kahiltna & South Buttress',
    mountainRange: 'Alaska Range',
    region: 'AK, USA',
    elevationM: 6190,
    synopticLevel: '500mb',
    venturiMultiplier: 2.2,
    defaultJetStreamOffsetKm: 80,
    description:
      'Upper Kahiltna glacier and South Buttress alpine approach exposed to Gulf of Alaska low-pressure systems and polar jet intrusions.',
    highlights: [
      'Sub-arctic polar jet stream intersection',
      'Extreme summit venturi acceleration',
      'Sudden Gulf of Alaska barometric drops',
    ],
  },
  {
    id: 'mount-washington-ridge',
    title: 'Mount Washington Presidential Range Summit',
    mountainRange: 'White Mountains',
    region: 'NH, USA',
    elevationM: 1917,
    synopticLevel: '700mb',
    venturiMultiplier: 2.6,
    defaultJetStreamOffsetKm: 40,
    description:
      'Presidential Range ridge line at convergence of Atlantic coastal and continental storm tracks producing world-record surface wind gusts.',
    highlights: [
      'Convergence zone super-hurricane gusts',
      'Continuous supercooled rime icing',
      'Severe lee-wave rotor turbulence',
    ],
  },
  {
    id: 'rainier-columbia-crest',
    title: 'Mount Rainier Columbia Crest & Crater Rim',
    mountainRange: 'Cascade Range',
    region: 'WA, USA',
    elevationM: 4392,
    synopticLevel: '600mb',
    venturiMultiplier: 1.8,
    defaultJetStreamOffsetKm: 120,
    description:
      'Isolated stratovolcano crest intercepting moist Pacific maritime frontal systems with extreme orographic lift and lenticular wind caps.',
    highlights: [
      'Pacific atmospheric river moisture plume',
      'Lenticular cloud cap cap-shear warning',
      'Freezing level inversion swings',
    ],
  },
  {
    id: 'everest-south-col',
    title: 'Mount Everest South Col & Geneva Spur Sector',
    mountainRange: 'Mahalangur Himalaya',
    region: 'Nepal',
    elevationM: 7906,
    synopticLevel: '300mb',
    venturiMultiplier: 2.4,
    defaultJetStreamOffsetKm: 25,
    description:
      'Extreme high-altitude death zone ridge directly exposed to the core velocity of the winter and pre-monsoon subtropical jet stream.',
    highlights: [
      'Direct subtropical jet stream plume',
      'Summit plume banner cloud dynamics',
      'Hypoxic extreme wind chill drop',
    ],
  },
  {
    id: 'matterhorn-hornli-ridge',
    title: 'Matterhorn Hörnli Ridge & Solvay Platform',
    mountainRange: 'Pennine Alps',
    region: 'Zermatt, Switzerland',
    elevationM: 4478,
    synopticLevel: '600mb',
    venturiMultiplier: 1.9,
    defaultJetStreamOffsetKm: 150,
    description:
      'Pyramidal alpine horn prone to severe south Foehn wind events, sudden Mediterranean Genoa low cyclogenesis, and summit electrical storms.',
    highlights: [
      'Foehn wind lee-side thermal surge',
      'Rapid cyclogenesis Genoa low tracking',
      'Isolated summit lightning discharge',
    ],
  },
];

export const WEATHER_GEAR: WeatherGearItem[] = [
  {
    id: 'barometric-altimeter-watch',
    name: 'Triple-Sensor Barometric Pressure Altimeter Watch with Storm Alarm',
    category: 'barometry',
    mandatory: true,
    description:
      'Precision pressure sensor tracking 3-hour barometric delta and storm trend alerts.',
  },
  {
    id: 'ultralight-anemometer',
    name: 'Calibrated Digital Vane Anemometer with Wind Chill Thermometer',
    category: 'wind',
    mandatory: true,
    description:
      'Instantaneous and peak gust airspeed measurement with built-in ambient temperature calculation.',
  },
  {
    id: 'satellite-synoptic-inreach',
    name: 'Two-Way Satellite Messenger with High-Resolution Synoptic Weather Forecasts',
    category: 'communications',
    mandatory: true,
    description:
      'Iridium satellite transceiver fetching 500mb geopotential height forecasts and emergency messaging.',
  },
  {
    id: 'aviation-synoptic-chart',
    name: 'Waterproof Laminated 500mb Upper-Air Geopotential Chart & Cloud Key',
    category: 'navigation',
    mandatory: true,
    description:
      'Field reference chart for identifying jet stream troughs, ridges, and vorticity advection.',
  },
  {
    id: 'thermal-face-mask-goggles',
    name: 'Double-Lens Antifog Glacier Goggles & Neoprene Wind-Rime Face Mask',
    category: 'protection',
    mandatory: true,
    description:
      'High-altitude eye and respiratory protection against 50+ knot wind-driven rime ice and snow blindness.',
  },
  {
    id: 'emergency-hypothermia-bivy',
    name: '4-Season Insulated Mylar Reflective Storm Shelter Bivouac',
    category: 'survival',
    mandatory: true,
    description:
      'Ultralight heat-reflective shelter designed to endure unplanned exposure in hurricane-force blizzard conditions.',
  },
];

export function getWeatherSectors(level?: SynopticLevel): WeatherSector[] {
  if (!level) {
    return WEATHER_SECTORS;
  }
  return WEATHER_SECTORS.filter((sector) => sector.synopticLevel === level);
}

export function getWeatherSectorById(id: string): WeatherSector | undefined {
  return WEATHER_SECTORS.find((sector) => sector.id === id);
}

export function getWeatherGear(): WeatherGearItem[] {
  return WEATHER_GEAR;
}

export function calculateMountainWeather(query: MountainWeatherQuery): MountainWeatherResult {
  const sector = getWeatherSectorById(query.sectorId);
  if (!sector) {
    throw new Error(`Sector with id "${query.sectorId}" not found`);
  }

  // Venturi acceleration & jet stream proximity boost (< 100 km)
  const jetBoost = query.jetStreamOffsetKm < 100 ? (100 - query.jetStreamOffsetKm) * 0.25 : 0;
  const summitWindMph = Math.round(query.baselineWindMph * sector.venturiMultiplier + jetBoost);

  // NWS wind chill formula
  let windChillF = Math.round(query.airTempF);
  if (summitWindMph > 3 && query.airTempF <= 50) {
    const windPow = Math.pow(summitWindMph, 0.16);
    windChillF = Math.round(
      35.74 + 0.6215 * query.airTempF - 35.75 * windPow + 0.4275 * query.airTempF * windPow
    );
  }

  // Barometric trend status (drop per 3hr)
  let barometricTrend: BarometricTrendStatus;
  if (query.barometricDropHpa < 1.0) {
    barometricTrend = 'steady_fair';
  } else if (query.barometricDropHpa < 2.5) {
    barometricTrend = 'approaching_front';
  } else if (query.barometricDropHpa < 4.0) {
    barometricTrend = 'rapid_storm_warning';
  } else {
    barometricTrend = 'explosive_cyclogenesis_evacuation';
  }

  // Summit window status
  let summitWindowStatus: SummitWindowStatus;
  if (summitWindMph > 50 || query.barometricDropHpa >= 2.5 || query.jetStreamOffsetKm < 40) {
    summitWindowStatus = 'abort_severe_winds_whiteout';
  } else if (
    summitWindMph >= 30 ||
    query.barometricDropHpa >= 1.0 ||
    query.jetStreamOffsetKm < 100
  ) {
    summitWindowStatus = 'marginal_caution_window';
  } else {
    summitWindowStatus = 'go_summit_window';
  }

  // Route advisory text
  let routeAdvisory: string;
  if (summitWindowStatus === 'abort_severe_winds_whiteout') {
    routeAdvisory =
      'Critical storm hazard. Summit winds exceed safe operational limits, rapid barometric collapse detected, or jet stream core is directly overhead. Stand down summit bids immediately, fortify high camp anchors, or initiate emergency descent.';
  } else if (summitWindowStatus === 'marginal_caution_window') {
    routeAdvisory =
      'Caution advised. Marginal weather window in effect. Elevated ridge winds and active barometric transitions require shortened turnaround times, storm-bivy readiness, and frequent pressure checks.';
  } else {
    routeAdvisory =
      'Favorable summit window open. Moderate wind profile and stable barometric trend. Proceed with normal alpine timing, full high-altitude kit, and continuous synoptic observation.';
  }

  return {
    sectorTitle: sector.title,
    elevationM: sector.elevationM,
    summitWindMph,
    windChillF,
    barometricTrend,
    summitWindowStatus,
    routeAdvisory,
  };
}
