export type PatrolZone =
  | 'barrier_island_dunes'
  | 'coastal_wildlife_refuge'
  | 'remote_cays_atoll'
  | 'maritime_estuary_spit';

export type TurtleSpecies =
  | 'loggerhead'
  | 'green_sea_turtle'
  | 'leatherback'
  | 'kemps_ridley';

export type PredatorPressure = 'low' | 'moderate' | 'critical';

export type ConservationStatus =
  | 'optimal_nesting_conditions'
  | 'elevated_predator_advisory'
  | 'critical_tidal_washout_hazard';

export interface TurtlePatrolSector {
  id: string;
  title: string;
  beachLocation: string;
  region: string;
  beachLengthKm: number;
  primarySpecies: TurtleSpecies;
  patrolZone: PatrolZone;
  avgNestsPerKm: number;
  description: string;
  highlights: string[];
}

export interface TurtlePatrolQuery {
  sectorId: string;
  patrolLengthKm: number; // 5 to 40 km, default 18
  moonPhaseIlluminationPercent: number; // 0 to 100%, default 15
  ambientTemperatureC: number; // 20 to 35°C, default 28
  predatorPressure: PredatorPressure; // default 'moderate'
}

export interface TurtlePatrolResult {
  sectorTitle: string;
  patrolZone: PatrolZone;
  primarySpecies: TurtleSpecies;
  patrolLengthKm: number;
  estimatedEmergenceCount: number;
  incubationDaysEstimate: number;
  predatorLossRiskPercent: number;
  conservationStatus: ConservationStatus;
  patrolFrequencyRecommendation: string;
  conservationAdvisory: string;
}

export interface TurtlePatrolGearItem {
  id: string;
  name: string;
  category: 'lighting' | 'protection' | 'survey' | 'transport' | 'marking' | 'safety';
  mandatory: boolean;
  description: string;
}

export const TURTLE_PATROL_SECTORS: TurtlePatrolSector[] = [
  {
    id: 'cape-hatteras-barrier-spit',
    title: 'Cape Hatteras North Spit Barrier Beach',
    beachLocation: 'Outer Banks, NC',
    region: 'Outer Banks, NC',
    beachLengthKm: 18.5,
    primarySpecies: 'loggerhead',
    patrolZone: 'barrier_island_dunes',
    avgNestsPerKm: 14,
    description:
      'Dynamic barrier spit subject to high-energy Atlantic surf, where nesting loggerheads rely on pitch-dark dune horizons free of light pollution.',
    highlights: [
      'Dark sky dune barrier perimeter',
      'Ghost crab predator track surveying',
      'Tidal surge nest relocation markers',
    ],
  },
  {
    id: 'cumberland-island-wilderness-beach',
    title: 'Cumberland Island Wilderness Coast',
    beachLocation: 'Georgia Sea Islands, GA',
    region: 'Georgia Sea Islands, GA',
    beachLengthKm: 27.0,
    primarySpecies: 'loggerhead',
    patrolZone: 'coastal_wildlife_refuge',
    avgNestsPerKm: 22,
    description:
      'Pristine wilderness island seashore protected within a coastal wildlife refuge, featuring expansive maritime oak hammocks and dense loggerhead clutch clusters.',
    highlights: [
      'Maritime oak forest backcountry access',
      'Dawn hatchling tracks to surf verification',
      'Feral predator exclusion cage monitoring',
    ],
  },
  {
    id: 'padre-island-national-seashore',
    title: 'Padre Island Malaquite Beach Patrol',
    beachLocation: 'Gulf Coast, TX',
    region: 'Gulf Coast, TX',
    beachLengthKm: 32.0,
    primarySpecies: 'kemps_ridley',
    patrolZone: 'barrier_island_dunes',
    avgNestsPerKm: 18,
    description:
      'The longest undeveloped barrier island in the world, serving as the premier nesting stronghold for critically endangered Kemp\'s ridley daylight arribadas.',
    highlights: [
      "Kemp's ridley daytime arribada sweeps",
      'Corral incubation facility transport',
      'Four-wheel-drive remote beach tracking',
    ],
  },
  {
    id: 'archie-carr-national-refuge',
    title: 'Archie Carr Barrier Reef Coast',
    beachLocation: 'Melbourne Beach, FL',
    region: 'Melbourne Beach, FL',
    beachLengthKm: 21.0,
    primarySpecies: 'green_sea_turtle',
    patrolZone: 'coastal_wildlife_refuge',
    avgNestsPerKm: 35,
    description:
      'Globally significant green turtle rookery spanning 20 miles of coastal dunes, subject to rigorous thermal data monitoring and urban light shielding patrols.',
    highlights: [
      'High-density green turtle nesting clusters',
      'Artificial light pollution mitigation patrols',
      'Thermal clutch temperature data logging',
    ],
  },
  {
    id: 'culebra-resaca-beach-atoll',
    title: 'Culebra Resaca & Brava Coastal Cays',
    beachLocation: 'Culebra, PR',
    region: 'Culebra, PR',
    beachLengthKm: 12.0,
    primarySpecies: 'leatherback',
    patrolZone: 'remote_cays_atoll',
    avgNestsPerKm: 9,
    description:
      'Isolated Caribbean archipelago pocket beaches with steep sand berms where massive pelagic leatherbacks navigate offshore reefs to deposit deep clutches.',
    highlights: [
      'Massive leatherback body-pit triangulation',
      'Rough surf nocturnal emergence observation',
      'Reef coral barrier tide timing navigation',
    ],
  },
];

export const TURTLE_PATROL_GEAR: TurtlePatrolGearItem[] = [
  {
    id: 'red-led-headlamp-monochrome',
    name: 'Narrow-Spectrum Red LED Headlamp (600nm+ Sea Turtle Safe)',
    category: 'lighting',
    mandatory: true,
    description:
      'Monochromatic red light above 600nm wavelength to navigate dunes without blinding nesting females or causing hatchling phototactic misorientation.',
  },
  {
    id: 'dune-predator-exclusion-cages',
    name: 'Stainless Self-Anchoring Predator Exclusion Wire Cages',
    category: 'protection',
    mandatory: true,
    description:
      'Marine-grade stainless mesh enclosures anchored into dune sand to protect buried clutches against ghost crabs, raccoons, and feral canids.',
  },
  {
    id: 'night-patrol-gps-caliper-kit',
    name: 'Sub-Meter Handheld GPS & Digital Clutch Caliper Kit',
    category: 'survey',
    mandatory: true,
    description:
      'High-accuracy differential GPS receiver and precision digital calipers for recording exact crawl tracks, body pit coords, and egg cavity dimensions.',
  },
  {
    id: 'soft-touch-hatchling-carrier',
    name: 'Damp-Sand Aerated Soft-Touch Transport Cooler',
    category: 'transport',
    mandatory: true,
    description:
      'Insulated passive-airflow carrier bedded with native damp sand for safely conveying disoriented or stranded hatchlings to the water line.',
  },
  {
    id: 'high-tide-bamboo-marker-poles',
    name: 'Reflective Weatherproof Bamboo Survey Stakes & Nest Tags',
    category: 'marking',
    mandatory: true,
    description:
      'Biodegradable reflective bamboo markers and engraved weatherproof tags to delineate spring high-tide boundaries and nest numbers.',
  },
  {
    id: 'coastal-high-intensity-uv-filter',
    name: 'Coastal Dune VHF Transceiver & Emergency Distress Strobe',
    category: 'safety',
    mandatory: true,
    description:
      'Submersible multi-channel marine VHF radio and high-intensity strobe beacon for patroller emergency communication across remote barrier beaches.',
  },
];

export const PATROL_ZONE_LABELS: Record<PatrolZone, string> = {
  barrier_island_dunes: 'Barrier Island Dunes',
  coastal_wildlife_refuge: 'Coastal Wildlife Refuge',
  remote_cays_atoll: 'Remote Cays & Atoll',
  maritime_estuary_spit: 'Maritime Estuary Spit',
};

export const TURTLE_SPECIES_LABELS: Record<TurtleSpecies, string> = {
  loggerhead: 'Loggerhead (Caretta caretta)',
  green_sea_turtle: 'Green Sea Turtle (Chelonia mydas)',
  leatherback: 'Leatherback (Dermochelys coriacea)',
  kemps_ridley: "Kemp's Ridley (Lepidochelys kempii)",
};

export const CONSERVATION_STATUS_LABELS: Record<ConservationStatus, string> = {
  optimal_nesting_conditions: 'Optimal Nesting Conditions',
  elevated_predator_advisory: 'Elevated Predator Advisory',
  critical_tidal_washout_hazard: 'Critical Tidal Washout Hazard',
};

export function getTurtlePatrolSectors(zone?: PatrolZone): TurtlePatrolSector[] {
  if (!zone) {
    return TURTLE_PATROL_SECTORS;
  }
  return TURTLE_PATROL_SECTORS.filter((s) => s.patrolZone === zone);
}

export function getTurtlePatrolSectorById(id: string): TurtlePatrolSector | undefined {
  return TURTLE_PATROL_SECTORS.find((s) => s.id === id);
}

export function getTurtlePatrolGear(): TurtlePatrolGearItem[] {
  return TURTLE_PATROL_GEAR;
}

export function calculateTurtlePatrolDynamics(query: TurtlePatrolQuery): TurtlePatrolResult {
  const sector = getTurtlePatrolSectorById(query.sectorId);
  if (!sector) {
    throw new Error(`Turtle patrol sector with ID "${query.sectorId}" not found`);
  }

  // Predator pressure factor
  const pressureFactors: Record<PredatorPressure, number> = {
    low: 0.08,
    moderate: 0.2,
    critical: 0.42,
  };
  const pressureFactor = pressureFactors[query.predatorPressure] ?? 0.2;

  // Estimated emergence count: Math.max(5, Math.round(sector.avgNestsPerKm * (patrolLengthKm / 5) * 8.5))
  const estimatedEmergenceCount = Math.max(
    5,
    Math.round(sector.avgNestsPerKm * (query.patrolLengthKm / 5) * 8.5)
  );

  // Incubation days estimate: Math.round(55 - (ambientTemperatureC - 28) * 2.2) clamped 45 to 70 days
  const rawIncubationDays = Math.round(55 - (query.ambientTemperatureC - 28) * 2.2);
  const incubationDaysEstimate = Math.min(70, Math.max(45, rawIncubationDays));

  // Predator loss risk percent: Math.min(95, Math.round((pressureFactor * 100) + (moonPhaseIlluminationPercent * 0.15)))
  const predatorLossRiskPercent = Math.min(
    95,
    Math.round(pressureFactor * 100 + query.moonPhaseIlluminationPercent * 0.15)
  );

  // Conservation status:
  // if predatorPressure === 'critical' || predatorLossRiskPercent >= 45: 'critical_tidal_washout_hazard'
  // else if predatorPressure === 'moderate' || predatorLossRiskPercent >= 20: 'elevated_predator_advisory'
  // else: 'optimal_nesting_conditions'
  let conservationStatus: ConservationStatus;
  if (query.predatorPressure === 'critical' || predatorLossRiskPercent >= 45) {
    conservationStatus = 'critical_tidal_washout_hazard';
  } else if (query.predatorPressure === 'moderate' || predatorLossRiskPercent >= 20) {
    conservationStatus = 'elevated_predator_advisory';
  } else {
    conservationStatus = 'optimal_nesting_conditions';
  }

  // Recommendations and advisories text
  let patrolFrequencyRecommendation: string;
  let conservationAdvisory: string;

  switch (conservationStatus) {
    case 'critical_tidal_washout_hazard':
      patrolFrequencyRecommendation =
        'Continuous nocturnal sweeps (every 30-45 min) with immediate predator cage installation and nest relocation above the spring surge line.';
      conservationAdvisory =
        'CRITICAL ALERT: Extreme predator activity or imminent tidal inundation risk. Deploy reinforced exclusion mesh immediately and alert coastal biology teams.';
      break;
    case 'elevated_predator_advisory':
      patrolFrequencyRecommendation =
        'High-frequency sweeps (every 90-120 min) focusing on ghost crab tracks, feral predator exclusion, and dawn hatchling emergence monitoring.';
      conservationAdvisory =
        'ELEVATED ADVISORY: Heightened predator pressure or bright moonlight increases vulnerability. Maintain continuous dark-beach protocols and verify cage anchors.';
      break;
    case 'optimal_nesting_conditions':
      patrolFrequencyRecommendation =
        'Standard dusk and pre-dawn monitoring sweeps (twice per night) to log new crawls, record clutch coordinates, and inspect nest perimeters.';
      conservationAdvisory =
        'OPTIMAL CONDITIONS: Favorable sand thermal balance and subdued predator pressure. Preserve natural barrier dune darkness and minimize footprint impact.';
      break;
  }

  return {
    sectorTitle: sector.title,
    patrolZone: sector.patrolZone,
    primarySpecies: sector.primarySpecies,
    patrolLengthKm: query.patrolLengthKm,
    estimatedEmergenceCount,
    incubationDaysEstimate,
    predatorLossRiskPercent,
    conservationStatus,
    patrolFrequencyRecommendation,
    conservationAdvisory,
  };
}
