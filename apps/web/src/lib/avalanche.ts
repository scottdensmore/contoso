export type DangerLevel = 1 | 2 | 3 | 4 | 5;
export type DangerRating = 'low' | 'moderate' | 'considerable' | 'high' | 'extreme';
export type ElevationBand = 'below_treeline' | 'near_treeline' | 'above_treeline';
export type Aspect = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
export type AvalancheProblemType =
  | 'wind_slab'
  | 'storm_slab'
  | 'persistent_slab'
  | 'deep_persistent_slab'
  | 'wet_loose'
  | 'dry_loose'
  | 'cornice_fall'
  | 'glide';

export interface AvalancheProblem {
  type: AvalancheProblemType;
  name: string;
  likelihood: 'unlikely' | 'possible' | 'likely' | 'very_likely' | 'almost_certain';
  expectedSize: string; // e.g. "D2 - D3"
  aspects: Aspect[];
  elevations: ElevationBand[];
  travelAdvice: string;
}

export interface AvalancheForecastZone {
  id: string;
  name: string;
  region: string;
  dangerRatings: Record<ElevationBand, DangerLevel>;
  overallDanger: DangerLevel;
  summary: string;
  problems: AvalancheProblem[];
  lastUpdated: string;
}

export interface SlopeTerrainAssessmentRequest {
  slopeAngleDeg: number;
  elevationBand: ElevationBand;
  aspect: Aspect;
  zoneId: string;
}

export interface SlopeTerrainAssessmentResult {
  slopeRiskCategory: 'low_angle_safe' | 'prime_avalanche_terrain' | 'extreme_steep_sluff';
  isInAvalancheTerrain: boolean;
  dangerLevel: DangerLevel;
  recommendation: 'favorable' | 'caution' | 'not_recommended' | 'avoid';
  advisory: string;
  safetyProtocols: string[];
}

export interface CompanionRescueGearItem {
  id: string;
  name: string;
  essential: boolean;
  description: string;
  batteryCheckRequired?: boolean;
}

export const AVALANCHE_ZONES: AvalancheForecastZone[] = [
  {
    id: 'stevens-pass',
    name: 'Stevens Pass / Cascade Crest',
    region: 'Central Cascades',
    dangerRatings: {
      above_treeline: 3,
      near_treeline: 3,
      below_treeline: 2,
    },
    overallDanger: 3,
    summary: 'Considerable danger above and near treeline with reactive wind slabs on leeward aspects.',
    problems: [
      {
        type: 'wind_slab',
        name: 'Wind Slab',
        likelihood: 'likely',
        expectedSize: 'D2 - D3',
        aspects: ['N', 'NE', 'E', 'SE'],
        elevations: ['above_treeline', 'near_treeline'],
        travelAdvice: 'Watch for smooth, pillowed drifts and shooting cracks on steep leeward aspects.',
      },
      {
        type: 'storm_slab',
        name: 'Storm Slab',
        likelihood: 'possible',
        expectedSize: 'D1.5 - D2.5',
        aspects: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
        elevations: ['above_treeline', 'near_treeline'],
        travelAdvice: 'Allow new storm snow time to settle and bond to underlying crusts before entering steep terrain.',
      },
    ],
    lastUpdated: 'Today, 06:00 PST',
  },
  {
    id: 'snoqualmie-pass',
    name: 'Snoqualmie Pass',
    region: 'West Slopes South',
    dangerRatings: {
      above_treeline: 3,
      near_treeline: 2,
      below_treeline: 1,
    },
    overallDanger: 3,
    summary: 'Heightened avalanche conditions on steep open slopes with recent warming.',
    problems: [
      {
        type: 'wet_loose',
        name: 'Wet Loose',
        likelihood: 'likely',
        expectedSize: 'D1 - D2',
        aspects: ['SE', 'S', 'SW', 'W'],
        elevations: ['near_treeline', 'below_treeline'],
        travelAdvice: 'Avoid steep sun-exposed slopes when surface snow becomes saturated or rollerballs/pinwheels form.',
      },
      {
        type: 'wind_slab',
        name: 'Wind Slab',
        likelihood: 'possible',
        expectedSize: 'D2',
        aspects: ['N', 'NE', 'E'],
        elevations: ['above_treeline'],
        travelAdvice: 'Identify wind-drifted pillows below ridge crests and cross-loaded gullies.',
      },
    ],
    lastUpdated: 'Today, 06:00 PST',
  },
  {
    id: 'mount-baker',
    name: 'Mount Baker / West Slopes North',
    region: 'North Cascades',
    dangerRatings: {
      above_treeline: 4,
      near_treeline: 3,
      below_treeline: 2,
    },
    overallDanger: 4,
    summary: 'High avalanche danger above treeline due to heavy snowfall and gale winds.',
    problems: [
      {
        type: 'storm_slab',
        name: 'Storm Slab',
        likelihood: 'very_likely',
        expectedSize: 'D2.5 - D3.5',
        aspects: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
        elevations: ['above_treeline', 'near_treeline'],
        travelAdvice: 'Avoid all avalanche terrain and runout zones during intense precipitation and storm cycles.',
      },
      {
        type: 'cornice_fall',
        name: 'Cornice Fall',
        likelihood: 'likely',
        expectedSize: 'D2 - D3',
        aspects: ['E', 'SE', 'NE'],
        elevations: ['above_treeline'],
        travelAdvice: 'Stay well back from scarp edges and do not travel directly underneath towering cornices.',
      },
    ],
    lastUpdated: 'Today, 06:00 PST',
  },
  {
    id: 'mount-rainier',
    name: 'Mount Rainier / Paradise & Muir',
    region: 'South Cascades',
    dangerRatings: {
      above_treeline: 4,
      near_treeline: 3,
      below_treeline: 2,
    },
    overallDanger: 4,
    summary: 'Dangerous avalanche conditions; human-triggered avalanches very likely on open slopes.',
    problems: [
      {
        type: 'wind_slab',
        name: 'Wind Slab',
        likelihood: 'very_likely',
        expectedSize: 'D2 - D3',
        aspects: ['N', 'NE', 'E', 'SE'],
        elevations: ['above_treeline', 'near_treeline'],
        travelAdvice: 'Avoid convex rolls, gullies, and lee slopes where wind-transported snow accumulates.',
      },
      {
        type: 'persistent_slab',
        name: 'Persistent Slab',
        likelihood: 'possible',
        expectedSize: 'D2.5 - D3.5',
        aspects: ['N', 'NE', 'NW'],
        elevations: ['above_treeline', 'near_treeline'],
        travelAdvice: 'Buried weak layers may propagate widely; choose low-angle, supported terrain.',
      },
    ],
    lastUpdated: 'Today, 06:00 PST',
  },
  {
    id: 'olympics',
    name: 'Olympic Mountains / Hurricane Ridge',
    region: 'Olympic Peninsula',
    dangerRatings: {
      above_treeline: 2,
      near_treeline: 2,
      below_treeline: 1,
    },
    overallDanger: 2,
    summary: 'Moderate avalanche danger; isolated pockets of wind-drifted snow on lee slopes.',
    problems: [
      {
        type: 'wind_slab',
        name: 'Wind Slab',
        likelihood: 'possible',
        expectedSize: 'D1.5 - D2',
        aspects: ['NE', 'E', 'SE'],
        elevations: ['above_treeline'],
        travelAdvice: 'Assess localized wind-drifted pillows before committing to steep slopes.',
      },
    ],
    lastUpdated: 'Today, 06:00 PST',
  },
];

export const COMPANION_RESCUE_GEAR: CompanionRescueGearItem[] = [
  {
    id: 'transceiver',
    name: 'Avalanche Transceiver (3-Antenna Beacon)',
    essential: true,
    description: '3-antenna digital beacon (457 kHz international standard) with harness worn securely beneath outer layers.',
    batteryCheckRequired: true,
  },
  {
    id: 'probe',
    name: 'Collapsible Avalanche Probe (240-300cm)',
    essential: true,
    description: 'Quick-draw tensioning probe in aluminum or carbon to pinpoint buried partners and measure burial depth.',
  },
  {
    id: 'shovel',
    name: 'Extendable Metal Snow Shovel',
    essential: true,
    description: 'Forged aluminum blade with extendable D-grip handle. Plastic shovel blades shatter in avalanche debris.',
  },
  {
    id: 'inclinometer',
    name: 'Slope Inclinometer (Clinometer)',
    essential: true,
    description: 'Precision slope angle gauge to evaluate slope angles and verify safe travel (<30°) versus prime avalanche terrain.',
  },
  {
    id: 'first-aid-bivy',
    name: 'Emergency Bivy & Trauma First Aid Kit',
    essential: true,
    description: 'Insulating hypothermia tarp/bivy sack, pressure bandages, splint, and windproof thermal barrier.',
  },
];

export function getAvalancheZones(): AvalancheForecastZone[] {
  return AVALANCHE_ZONES;
}

export function getAvalancheZoneById(id: string): AvalancheForecastZone | undefined {
  return AVALANCHE_ZONES.find((zone) => zone.id === id);
}

export function getCompanionRescueGear(): CompanionRescueGearItem[] {
  return COMPANION_RESCUE_GEAR;
}

export function getDangerScaleInfo(level: DangerLevel): {
  name: DangerRating;
  travelAdvice: string;
  color: string;
} {
  switch (level) {
    case 1:
      return {
        name: 'low',
        travelAdvice: 'Generally safe avalanche conditions. Watch for unstable snow on isolated extreme terrain features.',
        color: 'emerald',
      };
    case 2:
      return {
        name: 'moderate',
        travelAdvice: 'Heightened avalanche conditions on specific terrain features. Evaluate snow and terrain carefully; identify features of concern.',
        color: 'amber',
      };
    case 3:
      return {
        name: 'considerable',
        travelAdvice: 'Dangerous avalanche conditions. Careful snowpack evaluation, cautious route-finding, and conservative decision-making essential.',
        color: 'orange',
      };
    case 4:
      return {
        name: 'high',
        travelAdvice: 'Very dangerous avalanche conditions. Travel in avalanche terrain not recommended. Extensive natural and human-triggered avalanches likely.',
        color: 'red',
      };
    case 5:
      return {
        name: 'extreme',
        travelAdvice: 'Extremely dangerous avalanche conditions. Avoid all avalanche terrain. Natural and human-triggered avalanches certain and destructive.',
        color: 'zinc',
      };
  }
}

export function assessSlopeTerrain(
  request: SlopeTerrainAssessmentRequest
): SlopeTerrainAssessmentResult {
  const zone = getAvalancheZoneById(request.zoneId);
  const dangerLevel: DangerLevel = zone?.dangerRatings[request.elevationBand] ?? zone?.overallDanger ?? 1;

  if (request.slopeAngleDeg < 30) {
    return {
      slopeRiskCategory: 'low_angle_safe',
      isInAvalancheTerrain: false,
      dangerLevel,
      recommendation: dangerLevel >= 4 ? 'caution' : 'favorable',
      advisory: 'Slopes under 30° generally do not produce avalanches. Note: Beware of overhead avalanche runout zones from steeper slopes above.',
      safetyProtocols: [
        'Monitor slopes above you for overhead hazard and connected avalanche paths.',
        'Stay clear of avalanche runout zones and deposition run-out fans.',
        'Maintain group situational awareness and continuous visual contact.',
      ],
    };
  }

  if (request.slopeAngleDeg <= 45) {
    let recommendation: 'favorable' | 'caution' | 'not_recommended' | 'avoid';
    if (dangerLevel >= 4) {
      recommendation = 'avoid';
    } else if (dangerLevel === 3) {
      recommendation = 'not_recommended';
    } else {
      recommendation = 'caution';
    }

    return {
      slopeRiskCategory: 'prime_avalanche_terrain',
      isInAvalancheTerrain: true,
      dangerLevel,
      recommendation,
      advisory: 'Prime avalanche terrain (30°-45°). Most human-triggered avalanches occur between 35° and 38°.',
      safetyProtocols: [
        'Travel one at a time across avalanche paths and suspect slopes.',
        'Expose only one person to the hazard at any given time.',
        'Stop only in protected islands of safety (dense timber, behind rock ridges).',
        'Wear beacon in transmit mode under outer layer; have probe and shovel assembled or immediately accessible.',
      ],
    };
  }

  return {
    slopeRiskCategory: 'extreme_steep_sluff',
    isInAvalancheTerrain: true,
    dangerLevel,
    recommendation: 'avoid',
    advisory: 'Extreme steep terrain. Sluffs and frequent natural avalanches occur, with high consequence terrain traps (cliffs, crevasses).',
    safetyProtocols: [
      'Avoid travel on or beneath extreme steep pitches.',
      'Beware of sluff management and severe terrain traps (cliffs, gullies, crevasses).',
      'High fall consequence: falling can trigger loose snow sluffs or drag traveler over cliffs.',
    ],
  };
}
