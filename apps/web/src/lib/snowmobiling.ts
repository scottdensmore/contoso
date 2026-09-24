export type SnowpackCondition = 'deep_powder' | 'wind_buff' | 'hardpack_spring' | 'sugary_facets';
export type RidingStyle = 'boondocking_meadows' | 'steep_sidehilling' | 'chute_climbing' | 'technical_tree_riding';
export type EngineType = 'naturally_aspirated_850' | 'factory_turbo_850';
export type TrackLengthInches = 146 | 154 | 165 | 175;

export interface SnowmobileZone {
  id: string;
  name: string;
  region: string;
  elevationMeters: number;
  averageAnnualSnowCm: number;
  primaryRidingStyle: RidingStyle;
  atesRating: 'Simple' | 'Challenging' | 'Complex';
  description: string;
  highlights: string[];
}

export interface SledCalculationQuery {
  zoneId: string;
  trackLengthInches: TrackLengthInches;
  lugHeightInches: number; // 2.25, 2.6, 3.0
  engineType: EngineType;
  riderAndGearWeightKg: number; // 60 to 140 kg
  snowpackCondition: SnowpackCondition;
}

export interface SledCalculationResult {
  zoneName: string;
  flotationIndex: number; // 0-100 score
  trenchingRisk: 'low' | 'moderate' | 'high' | 'severe';
  effectiveHorsepower: number;
  powerLossPercent: number;
  sidehillStabilityRating: 'nimble_responsive' | 'balanced' | 'stable_high_effort';
  counterSteeringGuidance: string;
  avalancheTerrainWarning: string;
}

export interface SnowmobileGearItem {
  id: string;
  name: string;
  category: 'avalanche_airbag' | 'beacon' | 'probe' | 'shovel_saw' | 'tether' | 'recovery';
  mandatory: boolean;
  description: string;
}

export const SNOWMOBILE_ZONES: SnowmobileZone[] = [
  {
    id: 'revelstoke-boulder-mountain',
    name: 'Boulder Mountain & Frisby Ridge',
    region: 'Revelstoke, BC',
    elevationMeters: 2300,
    averageAnnualSnowCm: 1400,
    primaryRidingStyle: 'technical_tree_riding',
    atesRating: 'Complex',
    description: 'Epic British Columbia big mountain terrain featuring towering bowls, steep timber glades, and high-altitude alpine cabin networks.',
    highlights: [
      'Frisby Ridge rolling bowls',
      'Superbowl chute ascents',
      'Boulder alpine warming cabin',
    ],
  },
  {
    id: 'cooke-city-daisy-pass',
    name: 'Daisy Pass & Henderson Mountain',
    region: 'Cooke City, MT',
    elevationMeters: 3050,
    averageAnnualSnowCm: 1100,
    primaryRidingStyle: 'chute_climbing',
    atesRating: 'Complex',
    description: 'Extreme high-elevation playground on the edge of Yellowstone, notorious for vertical mountain chutes and demanding avalanche decision-making.',
    highlights: [
      'Daisy Pass alpine access',
      'Lulu Pass sidehilling traverses',
      'Henderson Mountain climbing chutes',
    ],
  },
  {
    id: 'togwotee-pass-brooks-lake',
    name: 'Togwotee Pass & Continental Divide',
    region: 'Dubois, WY',
    elevationMeters: 2940,
    averageAnnualSnowCm: 1300,
    primaryRidingStyle: 'boondocking_meadows',
    atesRating: 'Challenging',
    description: 'Vast high-plateau backcountry with endless deep powder meadows, subalpine canyons, and breathtaking views of the Grand Tetons.',
    highlights: [
      'Brooks Lake powder bowls',
      'Sublette Pass expansive meadows',
      'Continental Divide trailheads',
    ],
  },
  {
    id: 'valee-de-bras-du-nord-gaspe',
    name: 'Monts Chic-Chocs & Haute-Gaspésie',
    region: 'Gaspé, QC',
    elevationMeters: 1150,
    averageAnnualSnowCm: 950,
    primaryRidingStyle: 'technical_tree_riding',
    atesRating: 'Challenging',
    description: 'Remote eastern backcountry wilderness with dense birch glades, steep coastal ravines, and maritime alpine tundra plateaus.',
    highlights: [
      'Mont Blanche-Lamontagne chutes',
      'Dense hardwood tree boondocking',
      'Maritime snowpack navigation',
    ],
  },
  {
    id: 'steamboat-rabbit-ears-pass',
    name: 'Rabbit Ears Pass & Buffalo Pass',
    region: 'Steamboat Springs, CO',
    elevationMeters: 3170,
    averageAnnualSnowCm: 1250,
    primaryRidingStyle: 'steep_sidehilling',
    atesRating: 'Simple',
    description: 'Home of world-famous champagne powder, featuring rolling timber, steep canyon banks, and accessible Continental Divide riding.',
    highlights: [
      'Muddy Creek sidehill banks',
      'Buffalo Pass deep powder basins',
      'Continental Divide rolling glades',
    ],
  },
];

export const SNOWMOBILE_GEAR: SnowmobileGearItem[] = [
  {
    id: 'electronic-avalanche-airbag-pack',
    name: 'Electronic Fan-Drive Avalanche Airbag Backpack (25L-32L)',
    category: 'avalanche_airbag',
    mandatory: true,
    description: 'Supercapacitor or lithium battery electric fan system for multiple deployments in extreme subzero cold without travel airline restrictions.',
  },
  {
    id: 'digital-three-antenna-beacon',
    name: 'Digital 3-Antenna Avalanche Transceiver with Harness',
    category: 'beacon',
    mandatory: true,
    description: 'Modern multi-antenna beacon with group check mode, auto-revert to transmit upon secondary slide, and 70m circular search range.',
  },
  {
    id: 'stealth-snow-probe-carbon-320',
    name: 'Quick-Deploy Carbon Avalanche Probe (300cm-320cm)',
    category: 'probe',
    mandatory: true,
    description: 'Extra-long stiff carbon probe with rapid tensioning lock and clear depth centimeter markings for deep mountain snowpack strikes.',
  },
  {
    id: 'd-grip-metal-snow-saw-shovel',
    name: 'Forged Aluminum Avalanche Shovel with Integrated Snow Saw',
    category: 'shovel_saw',
    mandatory: true,
    description: 'Heavy-duty metal blade with hoe mode and internal folding tree/snow saw stored inside the shaft for avalanche debris and timber clearing.',
  },
  {
    id: 'magnetic-kill-switch-tether',
    name: 'Magnetic Engine Safety Cutoff Tether Cord',
    category: 'tether',
    mandatory: true,
    description: "Emergency engine kill-switch tether clipped to the rider's jacket D-ring or wrist to immediately stop the engine and spinning track during a dismount.",
  },
  {
    id: 'tunnel-retractable-recovery-winch',
    name: 'Sled Recovery Winch Strap, Bungie & Emergency Tow Rig',
    category: 'recovery',
    mandatory: true,
    description: 'Kinetic snatch strap snow bungie and 2000 lb rating tow rig for extracting buried mountain sleds from tree wells and steep creeks.',
  },
];

const SNOW_FACTORS: Record<SnowpackCondition, number> = {
  deep_powder: 0.85,
  sugary_facets: 0.70,
  wind_buff: 1.10,
  hardpack_spring: 1.25,
};

export function getSnowmobileZones(ridingStyle?: RidingStyle): SnowmobileZone[] {
  if (!ridingStyle) return SNOWMOBILE_ZONES;
  return SNOWMOBILE_ZONES.filter((zone) => zone.primaryRidingStyle === ridingStyle);
}

export function getSnowmobileZoneById(id: string): SnowmobileZone | undefined {
  return SNOWMOBILE_ZONES.find((zone) => zone.id === id);
}

export function getSnowmobileGear(): SnowmobileGearItem[] {
  return SNOWMOBILE_GEAR;
}

export function calculateSnowmobilePerformance(query: SledCalculationQuery): SledCalculationResult {
  const zone = getSnowmobileZoneById(query.zoneId) ?? SNOWMOBILE_ZONES[0];
  const elevFeet = zone.elevationMeters * 3.28084;
  const baseHP = 165;

  let powerLossPercent: number;
  let effectiveHorsepower: number;

  if (query.engineType === 'factory_turbo_850') {
    powerLossPercent = elevFeet > 10000 ? Math.round(((elevFeet - 10000) / 1000) * 2.0 * 10) / 10 : 0;
    effectiveHorsepower = Math.round(baseHP * (1 - powerLossPercent / 100) * 10) / 10;
  } else {
    powerLossPercent = Math.min(45, Math.round((elevFeet / 1000) * 3.5 * 10) / 10);
    effectiveHorsepower = Math.round(baseHP * (1 - powerLossPercent / 100) * 10) / 10;
  }

  const trackSurfaceScore = (query.trackLengthInches / 175) * 60 + (query.lugHeightInches / 3.0) * 40;
  const weightPenalty = query.riderAndGearWeightKg > 90 ? (query.riderAndGearWeightKg - 90) * 0.4 : 0;
  const snowConditionFactor = SNOW_FACTORS[query.snowpackCondition] ?? 0.85;

  const rawFlotation = trackSurfaceScore * snowConditionFactor - weightPenalty;
  const flotationIndex = Math.min(100, Math.max(10, Math.round(rawFlotation)));

  let trenchingRisk: 'low' | 'moderate' | 'high' | 'severe';
  if (flotationIndex >= 80) {
    trenchingRisk = 'low';
  } else if (flotationIndex >= 65) {
    trenchingRisk = 'moderate';
  } else if (flotationIndex >= 45) {
    trenchingRisk = 'high';
  } else {
    trenchingRisk = 'severe';
  }

  let sidehillStabilityRating: 'nimble_responsive' | 'balanced' | 'stable_high_effort';
  if (query.trackLengthInches === 146) {
    sidehillStabilityRating = 'nimble_responsive';
  } else if (query.trackLengthInches === 175) {
    sidehillStabilityRating = 'stable_high_effort';
  } else {
    sidehillStabilityRating = 'balanced';
  }

  let counterSteeringGuidance: string;
  if (trenchingRisk === 'severe' || trenchingRisk === 'high') {
    counterSteeringGuidance = 'High trenching hazard: maintain constant momentum, avoid sudden throttle punch, and ride wrong-foot-forward to transfer weight uphill.';
  } else {
    counterSteeringGuidance = 'Optimal flotation and track bite: maintain steady throttle modulation and initiate counter-steering by pressing down on the uphill running board.';
  }

  let avalancheTerrainWarning: string;
  if (zone.atesRating === 'Complex') {
    avalancheTerrainWarning = 'Complex Avalanche Terrain: severe overhead exposure, terrain traps, and multiple starting zones. Ride one-at-a-time from safe island to safe island.';
  } else if (zone.atesRating === 'Challenging') {
    avalancheTerrainWarning = 'Challenging Avalanche Terrain: well-defined paths and terrain traps exist. Careful route finding and avalanche transceiver checks required.';
  } else {
    avalancheTerrainWarning = 'Simple Avalanche Terrain: low-angle slopes and forest cover dominate. Continuously monitor local avalanche center danger ratings.';
  }

  return {
    zoneName: zone.name,
    flotationIndex,
    trenchingRisk,
    effectiveHorsepower,
    powerLossPercent,
    sidehillStabilityRating,
    counterSteeringGuidance,
    avalancheTerrainWarning,
  };
}
