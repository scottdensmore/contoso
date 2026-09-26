export type TowerStructure =
  | 'live_in_wood_cab_l4'
  | 'steel_skeletal_tower'
  | 'stone_cupola_ground_cab'
  | 'historic_pole_frame';

export type SmokeBehavior =
  | 'wispy_incipient_white'
  | 'dense_vertical_convection'
  | 'flattened_shear_drift'
  | 'pyrocumulus_pulsing';

export type PlumeAlertLevel =
  | 'observation_watch'
  | 'confirmed_wildfire_dispatch'
  | 'extreme_blowup_evacuation';

export type ObservationStatus =
  | 'clear_line_of_sight'
  | 'haze_thermal_inversion'
  | 'active_lightning_storm_hazard';

export interface FireLookoutTower {
  id: string;
  name: string;
  mountainPeak: string;
  nationalForest: string;
  elevationMeters: number;
  towerStructure: TowerStructure;
  towerHeightMeters: number;
  viewshedRadiusKm: number;
  osborneAlidadeEquipped: boolean;
  activeObserverStatus:
    | 'active_usfs_spotting'
    | 'volunteer_firewatch'
    | 'historic_public_rental'
    | 'emergency_surge_only';
  description: string;
  highlights: string[];
}

export interface SmokeTriangulationQuery {
  towerId: string;
  azimuthDegrees: number;        // 0 to 359 degrees
  verticalAngleDegrees: number;  // -10.0 to +10.0 degrees
  estimatedDistanceKm: number;   // 2 to 60 km
  smokeBehavior: SmokeBehavior;
  windSpeedMph: number;          // 0 to 50 mph
}

export interface SmokeTriangulationResult {
  towerName: string;
  triangulatedBearing: string;
  effectiveViewshedKm: number;
  plumeAlertLevel: PlumeAlertLevel;
  convectionIndexPercent: number;
  observationStatus: ObservationStatus;
  triangulationAdvisory: string;
  holdoverFireAdvisory: string;
  towerSafetyAdvisory: string;
}

export interface LookoutGearItem {
  id: string;
  name: string;
  category: 'optics' | 'navigation' | 'radio' | 'weather' | 'safety' | 'power';
  mandatory: boolean;
  description: string;
}

export const LOOKOUT_TOWERS: FireLookoutTower[] = [
  {
    id: 'winchester-mountain-lookout',
    name: 'Winchester Mountain Lookout (L-4 Cab)',
    mountainPeak: 'Winchester Mountain',
    nationalForest: 'Mt. Baker-Snoqualmie National Forest, WA',
    elevationMeters: 1988,
    towerStructure: 'live_in_wood_cab_l4',
    towerHeightMeters: 4,
    viewshedRadiusKm: 65,
    osborneAlidadeEquipped: true,
    activeObserverStatus: 'active_usfs_spotting',
    description:
      'Perched high in the North Cascades with panoramic 360-degree vistas of Mount Baker, Mount Shuksan, and the rugged Canadian Border Wilderness.',
    highlights: [
      'North Cascades 360° vantage',
      'Restored 1935 USFS L-4 timber cab',
      'Active lightning holdover spotting',
    ],
  },
  {
    id: 'desolation-peak-lookout',
    name: 'Desolation Peak Fire Lookout',
    mountainPeak: 'Desolation Peak',
    nationalForest: 'Ross Lake National Recreation Area, WA',
    elevationMeters: 1860,
    towerStructure: 'live_in_wood_cab_l4',
    towerHeightMeters: 5,
    viewshedRadiusKm: 70,
    osborneAlidadeEquipped: true,
    activeObserverStatus: 'volunteer_firewatch',
    description:
      'Famed wilderness lookout over Ross Lake and the Pasayten Wilderness, where Jack Kerouac spent the summer of 1956 spotting lightning strikes.',
    highlights: [
      'Historic Pasayten Wilderness vistas',
      'Jack Kerouac summer station',
      'Osborne Fire Finder brass map table',
    ],
  },
  {
    id: 'mount-cammerer-lookout',
    name: 'Mount Cammerer Octagonal Stone Lookout',
    mountainPeak: 'Mount Cammerer',
    nationalForest: 'Great Smoky Mountains National Park, TN/NC',
    elevationMeters: 1502,
    towerStructure: 'stone_cupola_ground_cab',
    towerHeightMeters: 6,
    viewshedRadiusKm: 45,
    osborneAlidadeEquipped: true,
    activeObserverStatus: 'historic_public_rental',
    description:
      'Hand-hewn stone cupola lookout built by the CCC in 1937, commanding the steep Pigeon River Gorge and Southern Appalachian ridges.',
    highlights: [
      'Octagonal hand-carved stone cab',
      'Pigeon River Gorge viewshed',
      'Appalachian ridge thermal observation',
    ],
  },
  {
    id: 'black-elk-peak-lookout',
    name: 'Black Elk Peak Stone Tower',
    mountainPeak: 'Black Elk Peak (Harney Peak)',
    nationalForest: 'Black Hills National Forest, SD',
    elevationMeters: 2207,
    towerStructure: 'stone_cupola_ground_cab',
    towerHeightMeters: 13,
    viewshedRadiusKm: 80,
    osborneAlidadeEquipped: true,
    activeObserverStatus: 'emergency_surge_only',
    description:
      'Highest point east of the Rockies; stone fortress lookout surveying four states across the granite needles of the Black Hills.',
    highlights: [
      'Four-state panoramic viewshed',
      'Granite spire fortress construction',
      'High-wind anchoring system',
    ],
  },
  {
    id: 'sundance-mountain-lookout',
    name: 'Sundance Mountain Steel Tower',
    mountainPeak: 'Sundance Mountain',
    nationalForest: 'Kaniksu National Forest, ID',
    elevationMeters: 1920,
    towerStructure: 'steel_skeletal_tower',
    towerHeightMeters: 24,
    viewshedRadiusKm: 75,
    osborneAlidadeEquipped: true,
    activeObserverStatus: 'active_usfs_spotting',
    description:
      '80-foot steel tower engineered after the devastating 1967 Sundance Fire, monitoring the rugged Selkirk and Cabinet mountain ranges.',
    highlights: [
      '80-foot skeletal steel frame',
      'Selkirk Crest wildlands surveillance',
      'Rapid cross-bearing dispatch link',
    ],
  },
];

export const LOOKOUT_GEAR: LookoutGearItem[] = [
  {
    id: 'osborne-alidade-sighting-peep',
    name: 'Brass Osborne Fire Finder Peep Sights & Graduated Ring',
    category: 'navigation',
    mandatory: true,
    description:
      'Precision brass sighting alidade and rotating azimuth ring to triangulate exact horizontal degree bearings and vertical depression angles of distant smoke plumes.',
  },
  {
    id: 'high-magnification-roof-binocular',
    name: '10x50 Waterproof ED High-Transmission Spotting Binoculars',
    category: 'optics',
    mandatory: true,
    description:
      'Extra-low dispersion glass binoculars with mil-dot reticle to discern thin incipient wisps of smoke through dense valley thermal inversion haze.',
  },
  {
    id: 'usfs-topographic-panoramic-maps',
    name: '360-Degree Panoramic Circular Fire Map Set & Mylar Overlay',
    category: 'navigation',
    mandatory: true,
    description:
      'Oriented circular contour map mounted beneath the Osborne finder glass with transparent grease-pencil overlays for line-of-sight bearing marks.',
  },
  {
    id: 'handheld-vhf-forest-net-transceiver',
    name: 'VHF Multi-Channel Forest Service Band Radio & Whip Antenna',
    category: 'radio',
    mandatory: true,
    description:
      'High-power ruggedized transceiver tuned to forest dispatch repeaters with squelch controls to transmit instant wildfire coordinates.',
  },
  {
    id: 'sling-psychrometer-hygrothermometer',
    name: 'Sling Psychrometer & Precision Wet-Bulb Relative Humidity Meter',
    category: 'weather',
    mandatory: true,
    description:
      'Rapid-spin analog psychrometer to calculate dew point, fuel moisture depression, and extreme afternoon ignition thresholds.',
  },
  {
    id: 'faraday-lightning-ground-cable',
    name: 'Heavy-Duty Copper Lightning Ground Stretcher & Static Static Dissipator',
    category: 'safety',
    mandatory: true,
    description:
      'Braided 00-gauge copper conductor straps bonded to steel tie-down footings to divert direct mountain peak lightning strikes away from the cab.',
  },
];

export function getFireLookoutTowers(structure?: TowerStructure): FireLookoutTower[] {
  if (!structure) {
    return LOOKOUT_TOWERS;
  }
  return LOOKOUT_TOWERS.filter((t) => t.towerStructure === structure);
}

export function getFireLookoutTowerById(id: string): FireLookoutTower | undefined {
  return LOOKOUT_TOWERS.find((t) => t.id === id);
}

export function getLookoutGear(): LookoutGearItem[] {
  return LOOKOUT_GEAR;
}

function getCompassDirection(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return 'N';
  if (normalized < 67.5) return 'NE';
  if (normalized < 112.5) return 'E';
  if (normalized < 157.5) return 'SE';
  if (normalized < 202.5) return 'S';
  if (normalized < 247.5) return 'SW';
  if (normalized < 292.5) return 'W';
  return 'NW';
}

export function calculateSmokeTriangulation(
  query: SmokeTriangulationQuery
): SmokeTriangulationResult {
  const tower = getFireLookoutTowerById(query.towerId) ?? LOOKOUT_TOWERS[0];
  const towerName = tower ? tower.name : 'Unknown Fire Lookout';
  const viewshedRadiusKm = tower ? tower.viewshedRadiusKm : 65;

  const dir = getCompassDirection(query.azimuthDegrees);
  const formattedVert = `${query.verticalAngleDegrees >= 0 ? '+' : ''}${query.verticalAngleDegrees.toFixed(1)}°`;
  const triangulatedBearing = `${Math.round(query.azimuthDegrees)}° (${dir}) | Dist: ${query.estimatedDistanceKm} km | Vert: ${formattedVert}`;

  // Convection Index %
  let baseConvection = 35;
  switch (query.smokeBehavior) {
    case 'dense_vertical_convection':
      baseConvection = 85;
      break;
    case 'pyrocumulus_pulsing':
      baseConvection = 95;
      break;
    case 'flattened_shear_drift':
      baseConvection = 60;
      break;
    case 'wispy_incipient_white':
    default:
      baseConvection = 35;
      break;
  }

  const convectionIndexPercent = Math.min(
    100,
    Math.max(15, Math.round(baseConvection + (query.windSpeedMph > 20 ? 10 : 0)))
  );

  // Plume Alert Level
  let plumeAlertLevel: PlumeAlertLevel = 'observation_watch';
  if (
    query.smokeBehavior === 'pyrocumulus_pulsing' ||
    (query.smokeBehavior === 'dense_vertical_convection' && query.windSpeedMph >= 25)
  ) {
    plumeAlertLevel = 'extreme_blowup_evacuation';
  } else if (
    query.smokeBehavior === 'dense_vertical_convection' ||
    query.estimatedDistanceKm <= 10
  ) {
    plumeAlertLevel = 'confirmed_wildfire_dispatch';
  } else {
    plumeAlertLevel = 'observation_watch';
  }

  // Observation Status
  let observationStatus: ObservationStatus = 'clear_line_of_sight';
  if (query.windSpeedMph >= 40) {
    observationStatus = 'active_lightning_storm_hazard';
  } else if (query.estimatedDistanceKm > viewshedRadiusKm * 0.75) {
    observationStatus = 'haze_thermal_inversion';
  } else {
    observationStatus = 'clear_line_of_sight';
  }

  // Effective viewshed km
  const windFactor = query.windSpeedMph > 35 ? 0.3 : 0.0;
  const effectiveViewshedKm = Math.round(
    Math.min(viewshedRadiusKm, viewshedRadiusKm * (1.0 - windFactor))
  );

  const triangulationAdvisory = `Osborne Triangulation: Sighting cross-bearing verified at ${query.azimuthDegrees}°. Relay coordinates to central dispatch for cross-bearing intersection.`;
  const holdoverFireAdvisory = `Holdover Sleeper Advisory: Lightning strikes in dense root duff can smolder undetected for 3 to 10 days before gusty afternoon winds ignite a visible plume.`;
  const towerSafetyAdvisory = `High-Peak Safety: Stand on glass-insulator stool during electrical storms. Secure exterior storm shutters when sustained winds exceed 35 mph.`;

  return {
    towerName,
    triangulatedBearing,
    effectiveViewshedKm,
    plumeAlertLevel,
    convectionIndexPercent,
    observationStatus,
    triangulationAdvisory,
    holdoverFireAdvisory,
    towerSafetyAdvisory,
  };
}
