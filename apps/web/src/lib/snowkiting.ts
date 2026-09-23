export type SnowkitingTerrain =
  | 'polar_plateau'
  | 'alpine_basin'
  | 'powder_snowfield'
  | 'frozen_lake'
  | 'ice_sheet';

export type SnowSurface =
  | 'hardpack_crust'
  | 'groomed_packed'
  | 'dry_powder'
  | 'sastrugi_drift'
  | 'frozen_lake_ice';

export type KiteType =
  | 'closed_cell_depower_foil'
  | 'open_cell_foil'
  | 'inflatable_leading_edge_tubekite';

export type KiteSafetyStatus =
  | 'approved'
  | 'caution_high_load'
  | 'hazardous_storm_force';

export interface SnowkitingSpot {
  id: string;
  title: string;
  region: string;
  country: string;
  elevationM: number;
  terrain: SnowkitingTerrain;
  typicalWindKnots: string;
  bestSeason: string;
  expeditionPulkFriendly: boolean;
  description: string;
  highlights: string[];
}

export interface SnowkitingQuery {
  spotId: string;
  riderWeightKg: number; // 45 to 120 kg, default 75
  pulkWeightKg: number; // 0 to 100 kg, default 20
  windSpeedKnots: number; // 6 to 40 knots, default 16
  snowSurface: SnowSurface;
  kiteType: KiteType;
}

export interface SnowkitingResult {
  spotTitle: string;
  totalPayloadKg: number;
  recommendedKiteAreaM2: number;
  powerRating: string;
  frictionCoefficient: number;
  glideEfficiencyPercent: number;
  safetyStatus: KiteSafetyStatus;
  tacticalAdvisory: string;
}

export interface SnowkitingGearItem {
  id: string;
  name: string;
  category:
    | 'kite_engine'
    | 'harness'
    | 'safety_release'
    | 'hauling'
    | 'navigation'
    | 'protection';
  mandatory: boolean;
  description: string;
}

export const SNOWKITING_SPOTS: SnowkitingSpot[] = [
  {
    id: 'hardangervidda-plateau-norway',
    title: 'Hardangervidda Polar Plateau',
    region: 'Hardangervidda National Park',
    country: 'Norway',
    elevationM: 1250,
    terrain: 'polar_plateau',
    typicalWindKnots: '14 - 32 knots',
    bestSeason: 'November - May',
    expeditionPulkFriendly: true,
    description:
      "Norway's vast arctic plateau and the historic proving ground for polar explorers, offering infinite horizons and relentless wind funnels across rolling tundra.",
    highlights: [
      'Cradle of polar kite exploration',
      'Relentless arctic wind funnels',
      'Expedition pulk multi-day staging',
    ],
  },
  {
    id: 'camas-prairie-idaho',
    title: 'Camas Prairie High Basin',
    region: 'Fairfield, ID',
    country: 'USA',
    elevationM: 1540,
    terrain: 'powder_snowfield',
    typicalWindKnots: '10 - 22 knots',
    bestSeason: 'December - March',
    expeditionPulkFriendly: true,
    description:
      'An immense high-elevation basin framed by the Sawtooth Mountains, boasting deep dry champagne powder and wide-open launch flats with consistent thermal gradient breezes.',
    highlights: [
      'Sawtooth Mountain backdrop',
      'Unbroken deep champagne powder',
      'Ideal launch and depower arenas',
    ],
  },
  {
    id: 'col-du-lautaret-alps',
    title: 'Col du Lautaret Alpine Basin',
    region: 'Hautes-Alpes',
    country: 'France',
    elevationM: 2058,
    terrain: 'alpine_basin',
    typicalWindKnots: '12 - 28 knots',
    bestSeason: 'December - April',
    expeditionPulkFriendly: false,
    description:
      "Europe's premier high-alpine snowkiting venue sitting at over 2,000m, famous for venturi winds funneling between glaciers and dramatic 3D slope-soaring lines.",
    highlights: [
      'High-alpine thermal venturi wind',
      'Glacial ridge-soaring terrain',
      'Steep ascent kite mountaineering',
    ],
  },
  {
    id: 'lake-mille-lacs-minnesota',
    title: 'Lake Mille Lacs Frozen Expanse',
    region: 'Isle, MN',
    country: 'USA',
    elevationM: 380,
    terrain: 'frozen_lake',
    typicalWindKnots: '12 - 25 knots',
    bestSeason: 'January - March',
    expeditionPulkFriendly: true,
    description:
      'A gargantuan 132,000-acre inland frozen sea providing endless flat-ice and snow-drift runways with zero obstacles and steady midwestern continental winds.',
    highlights: [
      'Massive 132,000-acre flat icy runway',
      'Long endurance speed reaches',
      'Zero tree or terrain turbulence',
    ],
  },
  {
    id: 'greenland-icecap-traverse',
    title: 'Greenland Ice Sheet South-to-North Route',
    region: 'Kangerlussuaq to Qaanaaq',
    country: 'Greenland',
    elevationM: 2500,
    terrain: 'ice_sheet',
    typicalWindKnots: '15 - 40 knots',
    bestSeason: 'April - June',
    expeditionPulkFriendly: true,
    description:
      'The ultimate 2,500km trans-polar expedition traverse across pure inland ice cap with heavy expedition pulks powered by roaring gravity-driven katabatic winds.',
    highlights: [
      'Epic 2,500km polar traverse route',
      'Heavy 90kg expedition pulk hauling',
      'Sub-zero katabatic wind power',
    ],
  },
];

export const SNOWKITING_GEAR: SnowkitingGearItem[] = [
  {
    id: 'depower-foil-snowkite',
    name: '10m-12m Closed-Cell High-Depower Ultralight Foil Kite with Internal Drainage',
    category: 'kite_engine',
    mandatory: true,
    description:
      'Ram-air closed-cell foil kite engineered with water-repellent ultralight ripstop nylon, internal cross-venting baffle valves, and wide-span depower range for variable arctic gusts.',
  },
  {
    id: 'climbing-rated-kite-harness',
    name: 'CE Certified Mountaineering/Snowkite Seat Harness with Leg Loops',
    category: 'harness',
    mandatory: true,
    description:
      'Reinforced dual-rated climbing and snowkite harness with adjustable leg loops, spreader bar quick-ejection pins, and high haul-load haul loops for simultaneous pulk towing.',
  },
  {
    id: 'quick-release-chickenloop-leash',
    name: 'ISO 21853 Push-Away Quick-Release Chickenloop and 100% Depower Safety Line',
    category: 'safety_release',
    mandatory: true,
    description:
      'Standardized single-motion push-away mechanical safety release functioning reliably in -40°C sub-zero conditions, connected to a flagging safety leash that flags the kite instantly.',
  },
  {
    id: 'pulk-harness-tow-bridle',
    name: 'Shock-Absorbing Rigid Trace Pulk Tow Bridle with Quick-Jettison Carabiner',
    category: 'hauling',
    mandatory: true,
    description:
      'Fiberglass or carbon rigid trace poles paired with dampening bungee cords and emergency quick-release three-stage jettison carabiners to prevent pulk rollovers and spine shock.',
  },
  {
    id: 'backcountry-gps-inreach',
    name: 'Satellite Communicator & Glare-Resistant Winter GPS with Waypoint Compass',
    category: 'navigation',
    mandatory: true,
    description:
      'Cold-weather rated GPS navigation unit with two-way Iridium satellite SOS messaging, topographic polar maps, electronic three-axis compass, and lithium cold-drain battery backup.',
  },
  {
    id: 'multi-impact-snow-helmet',
    name: 'ASTM F2040 / EN 1077 Certified High-Impact Ski & Snowkite Helmet with Face Visor',
    category: 'protection',
    mandatory: true,
    description:
      'EPP multi-impact liner helmet with integrated anti-fog photochromic storm visor, ear protection, and storm chinstrap retention tested for high-speed snowkiting impact forces.',
  },
];

export function getSnowkitingSpots(terrain?: SnowkitingTerrain): SnowkitingSpot[] {
  if (!terrain) {
    return SNOWKITING_SPOTS;
  }
  return SNOWKITING_SPOTS.filter((spot) => spot.terrain === terrain);
}

export function getSnowkitingSpotById(id: string): SnowkitingSpot | undefined {
  return SNOWKITING_SPOTS.find((spot) => spot.id === id);
}

export function getSnowkitingGear(): SnowkitingGearItem[] {
  return SNOWKITING_GEAR;
}

const FRICTION_BY_SURFACE: Record<SnowSurface, number> = {
  frozen_lake_ice: 0.03,
  hardpack_crust: 0.05,
  groomed_packed: 0.08,
  dry_powder: 0.16,
  sastrugi_drift: 0.22,
};

export function calculateSnowkiting(query: SnowkitingQuery): SnowkitingResult {
  const spot = getSnowkitingSpotById(query.spotId);
  const spotTitle = spot ? spot.title : 'Polar Expedition Arena';

  const totalPayloadKg = query.riderWeightKg + query.pulkWeightKg;
  const frictionCoefficient = FRICTION_BY_SURFACE[query.snowSurface] ?? 0.08;

  const rawArea =
    Math.round(
      ((totalPayloadKg * 1.8) / query.windSpeedKnots) *
        (1.0 + frictionCoefficient) *
        10
    ) / 10;
  const recommendedKiteAreaM2 = Math.min(18.0, Math.max(4.0, rawArea));

  const glideEfficiencyPercent = Math.round(
    (1.0 - frictionCoefficient / 0.3) * 100
  );

  let powerRating: string;
  if (query.windSpeedKnots >= 30 && recommendedKiteAreaM2 > 10) {
    powerRating =
      'DANGEROUS OVERPOWER: Extreme lofting and uncontrollable high-speed dragging risk.';
  } else if (query.windSpeedKnots <= 8) {
    powerRating =
      'UNDERPOWERED: Insufficient pull to overcome snow friction and pulk inertia.';
  } else if (query.windSpeedKnots >= 24) {
    powerRating =
      'HIGH POWER: Strong traction pull; continuous depower vigilance required.';
  } else {
    powerRating =
      'OPTIMAL POWER: Balanced traction and controlled depower throw.';
  }

  let safetyStatus: KiteSafetyStatus;
  if (
    query.windSpeedKnots > 32 ||
    (query.kiteType === 'inflatable_leading_edge_tubekite' &&
      query.windSpeedKnots > 25)
  ) {
    safetyStatus = 'hazardous_storm_force';
  } else if (
    query.windSpeedKnots > 24 ||
    query.pulkWeightKg > 60 ||
    query.snowSurface === 'sastrugi_drift'
  ) {
    safetyStatus = 'caution_high_load';
  } else {
    safetyStatus = 'approved';
  }

  let tacticalAdvisory: string;
  if (safetyStatus === 'hazardous_storm_force') {
    if (query.windSpeedKnots > 32) {
      tacticalAdvisory =
        'STORM FORCE HAZARD: Wind velocities exceed 32 knots. Extreme risk of lofting, line snapping, and hypothermic blizzard isolation. Anchor pulks and shelter immediately.';
    } else {
      tacticalAdvisory =
        'EQUIPMENT HAZARD: Inflatable tube kites (LEI) are prone to bladder valve freezing and explosive deflation in sub-zero alpine gusts above 25 knots. Switch to closed-cell ram-air foils.';
    }
  } else if (safetyStatus === 'caution_high_load') {
    if (query.pulkWeightKg > 60) {
      tacticalAdvisory =
        'HIGH LOAD CAUTION: Heavy pulk towing (>60kg) generates severe harness inertia and downhill runaway risk. Secure rigid tow traces and prepare quick-release carabiners.';
    } else if (query.snowSurface === 'sastrugi_drift') {
      tacticalAdvisory =
        'TERRAIN CAUTION: Frozen sastrugi dunes produce unpredictable shock loads and tripping hazards. Depower kite to trim speed and maneuver around ridge crests.';
    } else {
      tacticalAdvisory =
        'HIGH WIND CAUTION: Sustained winds above 24 knots require rapid sheeting and continuous depower alertness. Maintain double safety leash checks.';
    }
  } else {
    tacticalAdvisory =
      'EXPEDITION APPROVED: Wind, payload, and snow friction are balanced for sustained polar traction. Maintain waypoint tracking and emergency signaling reserves.';
  }

  return {
    spotTitle,
    totalPayloadKg,
    recommendedKiteAreaM2,
    powerRating,
    frictionCoefficient,
    glideEfficiencyPercent,
    safetyStatus,
    tacticalAdvisory,
  };
}
