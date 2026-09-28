export type TerrainProfile =
  | 'firm_compact_sand'
  | 'soft_estuary_silt'
  | 'deep_quicksilt_ooze'
  | 'shell_gravel_shallows';

export type TidalCurrentPhase =
  | 'slack_low_tide'
  | 'early_ebb_subsiding'
  | 'mid_flood_rising'
  | 'spring_bore_incoming';

export type TidalHazardRating =
  | 'safe_low_tide_window'
  | 'caution_accelerated_flood_return'
  | 'hazardous_quicksilt_tidal_entrapment';

export interface MudflatRoute {
  id: string;
  title: string;
  estuaryLocation: string;
  region: string;
  routeDistanceKm: number;
  tidalWindowHours: number;
  maxSiltDepthCm: number;
  terrainProfile: TerrainProfile;
  description: string;
  highlights: string[];
}

export interface MudflatQuery {
  routeId: string;
  siltDepthCm: number; // 5 to 60 cm, default 25
  trekkerPaceKph: number; // 1.5 to 5.0 kph, default 3.2
  elapsedTimeMinutes: number; // 0 to 180 min, default 45
  tidalPhase: TidalCurrentPhase; // default 'slack_low_tide'
}

export interface MudflatResult {
  routeTitle: string;
  terrainProfile: TerrainProfile;
  remainingTidalWindowMinutes: number;
  siltSuctionDragIndex: number; // 1 to 10 scale
  prielenWadingDepthCm: number;
  tidalHazardRating: TidalHazardRating;
  evacuationAdvisory: string;
  navigationGuidance: string;
}

export interface MudflatGearItem {
  id: string;
  name: string;
  category: 'footwear' | 'probe_pole' | 'signaling' | 'lighting' | 'navigation' | 'apparel';
  mandatory: boolean;
  description: string;
}

export const MUDFLAT_ROUTES: MudflatRoute[] = [
  {
    id: 'wadden-sea-neuwerk-traverse',
    title: 'Wadden Sea Cuxhaven-Neuwerk Traverse',
    estuaryLocation: 'Lower Saxony Wadden Sea',
    region: 'Germany',
    routeDistanceKm: 12.5,
    tidalWindowHours: 3.5,
    maxSiltDepthCm: 35,
    terrainProfile: 'soft_estuary_silt',
    description:
      'Historic Wattwandern route connecting the mainland of Sahlenburg to Neuwerk Island through open mudflats, marked by birch branches (Prikken).',
    highlights: [
      'Prikken navigation bush markers',
      'Prielen tidal creek wading',
      'Historical rescue beacon cages',
    ],
  },
  {
    id: 'bay-of-fundy-miners-marsh',
    title: 'Bay of Fundy Minas Basin Mud Traverse',
    estuaryLocation: 'Minas Basin / Bay of Fundy',
    region: 'Nova Scotia, Canada',
    routeDistanceKm: 8.0,
    tidalWindowHours: 2.5,
    maxSiltDepthCm: 45,
    terrainProfile: 'deep_quicksilt_ooze',
    description:
      'Treacherous high-amplitude mud flats along the red silt banks of the Minas Basin, subject to explosive tidal bore wave fronts.',
    highlights: [
      "World's highest 16-meter tidal swings",
      'Red mud suction walking',
      'Fast-moving tidal bore front tracking',
    ],
  },
  {
    id: 'mont-saint-michel-bay',
    title: 'Mont-Saint-Michel Bay Silt Crossing',
    estuaryLocation: 'Couesnon Estuary',
    region: 'Normandy, France',
    routeDistanceKm: 14.0,
    tidalWindowHours: 4.0,
    maxSiltDepthCm: 30,
    terrainProfile: 'soft_estuary_silt',
    description:
      'Pilgrim crossing across shifting sands and soft estuary silt surrounding the iconic tidal abbey of Mont-Saint-Michel.',
    highlights: [
      'Legendary quicksand pocket bypass',
      'Couesnon river estuary crossing',
      'Galloping horse tide speed retreat',
    ],
  },
  {
    id: 'morecambe-bay-sands',
    title: "Morecambe Bay Queen's Guide Crossing",
    estuaryLocation: 'Kent and Leven Estuaries',
    region: 'Lancashire, England',
    routeDistanceKm: 13.0,
    tidalWindowHours: 3.0,
    maxSiltDepthCm: 40,
    terrainProfile: 'deep_quicksilt_ooze',
    description:
      'Centuries-old royal guide route across deceptive estuary channels and shifting sink sands between Arnside and Grange-over-Sands.',
    highlights: [
      'Centuries-old royal guide route',
      'Kent and Leven estuary channels',
      'Deceptive sinking sand banks',
    ],
  },
  {
    id: 'turnagain-arm-mudflats',
    title: 'Turnagain Arm Silt Flats & Bore Tide',
    estuaryLocation: 'Cook Inlet / Turnagain Arm',
    region: 'Gulf of Alaska, AK',
    routeDistanceKm: 6.5,
    tidalWindowHours: 2.0,
    maxSiltDepthCm: 55,
    terrainProfile: 'deep_quicksilt_ooze',
    description:
      'Glacial powdered silt mudflats notorious for lethal liquefaction entrapment and freezing glacial bore tides.',
    highlights: [
      'Glacial silt liquefaction warning',
      'Bore tide wave front observation',
      'Extreme hypothermic mud conditions',
    ],
  },
];

export const MUDFLAT_GEAR: MudflatGearItem[] = [
  {
    id: 'lace-locked-mudflat-booties',
    name: 'High-Tension Lace-Locked Neoprene Mudflat Booties (Anti-Suction)',
    category: 'footwear',
    mandatory: true,
    description:
      'Prevents boots from being wrenched off feet by extreme vacuum suction force in deep silt.',
  },
  {
    id: 'telescoping-silt-probe-pole',
    name: 'Calibrated Depth-Graduated Aluminum Silt Probe Pole',
    category: 'probe_pole',
    mandatory: true,
    description:
      'Graduated sounding pole to probe submerged quicksilt channels and depth of upcoming mud layers.',
  },
  {
    id: 'high-decibel-fog-marine-whistle',
    name: 'Pealess Waterproof Marine Fog Whistle (120dB)',
    category: 'signaling',
    mandatory: true,
    description:
      'Ultra-loud acoustic distress signal capable of cutting through dense coastal sea fog.',
  },
  {
    id: 'high-visibility-tidal-strobe',
    name: 'IPX8 Waterproof Floating High-Candela Marine Emergency Strobe',
    category: 'lighting',
    mandatory: true,
    description:
      'Flashing emergency optical beacon visible to rescue aircraft and shore observers across open sandbanks.',
  },
  {
    id: 'waterproof-gps-tide-altimeter',
    name: 'Submersible High-Sensitivity GPS with Marine Tide Table Clock',
    category: 'navigation',
    mandatory: true,
    description:
      'Displays live astronomical tide countdowns, barometric pressure, and waypoint track vectors.',
  },
  {
    id: 'neoprene-cold-water-wading-tights',
    name: '3mm Titanium-Lined Thermal Neoprene Tidal Wading Tights',
    category: 'apparel',
    mandatory: true,
    description:
      'Thermal insulation preventing lower-extremity hypothermia when wading deep frigid tidal runnels.',
  },
];

const TERRAIN_FACTORS: Record<TerrainProfile, number> = {
  firm_compact_sand: 1,
  shell_gravel_shallows: 2,
  soft_estuary_silt: 3,
  deep_quicksilt_ooze: 5,
};

export function getMudflatRoutes(terrain?: TerrainProfile): MudflatRoute[] {
  if (!terrain) {
    return MUDFLAT_ROUTES;
  }
  return MUDFLAT_ROUTES.filter((r) => r.terrainProfile === terrain);
}

export function getMudflatRouteById(id: string): MudflatRoute | undefined {
  return MUDFLAT_ROUTES.find((r) => r.id === id);
}

export function getMudflatGear(): MudflatGearItem[] {
  return MUDFLAT_GEAR;
}

export function calculateMudflatDynamics(query: MudflatQuery): MudflatResult {
  const route = getMudflatRouteById(query.routeId);
  if (!route) {
    throw new Error(`Mudflat route with ID "${query.routeId}" not found.`);
  }

  const remainingTidalWindowMinutes = Math.max(
    0,
    Math.round(route.tidalWindowHours * 60 - query.elapsedTimeMinutes)
  );

  const terrainFactor = TERRAIN_FACTORS[route.terrainProfile] ?? 3;
  const siltSuctionDragIndex = Math.min(
    10,
    Math.max(1, Math.round(query.siltDepthCm / 8 + terrainFactor))
  );

  const tidalOffset =
    query.tidalPhase === 'mid_flood_rising'
      ? 30
      : query.tidalPhase === 'spring_bore_incoming'
      ? 65
      : 10;
  const prielenWadingDepthCm = Math.round(query.siltDepthCm * 1.4 + tidalOffset);

  let tidalHazardRating: TidalHazardRating;
  if (
    remainingTidalWindowMinutes < 40 ||
    query.siltDepthCm > 45 ||
    query.tidalPhase === 'spring_bore_incoming'
  ) {
    tidalHazardRating = 'hazardous_quicksilt_tidal_entrapment';
  } else if (
    remainingTidalWindowMinutes < 75 ||
    query.siltDepthCm >= 30 ||
    query.tidalPhase === 'mid_flood_rising'
  ) {
    tidalHazardRating = 'caution_accelerated_flood_return';
  } else {
    tidalHazardRating = 'safe_low_tide_window';
  }

  let evacuationAdvisory: string;
  let navigationGuidance: string;

  switch (tidalHazardRating) {
    case 'hazardous_quicksilt_tidal_entrapment':
      evacuationAdvisory =
        'CRITICAL ALERT: Imminent risk of tidal entrapment or quicksilt submersion. Abandon route immediately and head toward designated high-tide rescue beacons or nearest mainland shore.';
      navigationGuidance =
        'Sound 120dB marine whistle in continuous sets of three blasts. Unclip pack sternum strap. If sinking in liquefaction ooze, spread body weight horizontally and crawl using probe pole as outrigger.';
      break;
    case 'caution_accelerated_flood_return':
      evacuationAdvisory =
        'CAUTION: Inflow channels are filling and return margin is narrowing. Begin your return or shore exit route without delay before deep prielen become unfordable.';
      navigationGuidance =
        'Navigate diagonally upstream across filling prielen creeks. Increase cadence to stay above settling silt suction threshold and monitor shoreline landmarks closely.';
      break;
    case 'safe_low_tide_window':
    default:
      evacuationAdvisory =
        'SAFE WINDOW: Low tide slack conditions provide stable crossing window. Maintain designated pace and verify tidal turnaround clock at each waypoint.';
      navigationGuidance =
        'Follow prikken branch markers and stick to firm ribbed sand ridges. Sound silt depth ahead with graduated probe pole before stepping into turbid creek pools.';
      break;
  }

  return {
    routeTitle: route.title,
    terrainProfile: route.terrainProfile,
    remainingTidalWindowMinutes,
    siltSuctionDragIndex,
    prielenWadingDepthCm,
    tidalHazardRating,
    evacuationAdvisory,
    navigationGuidance,
  };
}
