export type RaptorSpecies =
  | 'peregrine_falcon'
  | 'gyrfalcon'
  | 'harriss_hawk'
  | 'red_tailed_hawk'
  | 'golden_eagle';

export type FlightStyle =
  | 'high_pitch_stoop'
  | 'level_speed_pursuit'
  | 'pack_cast_maneuver'
  | 'perch_ridge_soaring';

export type ConditioningStatus =
  | 'lethargic_overfed'
  | 'prime_hunting_condition'
  | 'keen_hyper_responsive'
  | 'starvation_danger_lethal';

export interface FalconryGround {
  id: string;
  title: string;
  region: string;
  territory: string;
  elevationMeters: number;
  primarySpecies: RaptorSpecies;
  flightStyle: FlightStyle;
  description: string;
  highlights: string[];
}

export interface FalconryQuery {
  groundId: string;
  raptorSpecies: RaptorSpecies; // default 'peregrine_falcon'
  baseMoltWeightGrams: number; // 600 to 4500 grams, default 900
  targetWeightGrams: number; // 500 to 4200 grams, default 790
  pitchAltitudeMeters: number; // 30 to 600 meters, default 250
  ambientTempC: number; // -15 to 30 C, default 10
}

export interface FalconryResult {
  groundTitle: string;
  raptorSpecies: RaptorSpecies;
  weightDeviationPercent: number;
  conditioningStatus: ConditioningStatus;
  estimatedStoopSpeedMph: number;
  telemetryRangeKm: number;
  weightConditioningAdvisory: string;
  flightRecoveryGuidance: string;
}

export interface FalconryGearItem {
  id: string;
  name: string;
  category: 'telemetry' | 'gauntlet' | 'furniture' | 'conditioning' | 'recall' | 'safety';
  mandatory: boolean;
  description: string;
}

export const FALCONRY_GROUNDS: FalconryGround[] = [
  {
    id: 'sagebrush-sea-wyoming',
    title: 'Red Desert High Steppe & Sagebrush Sea',
    region: 'Sweetwater County, Wyoming, USA',
    territory: 'Great Divide Basin',
    elevationMeters: 2100,
    primarySpecies: 'gyrfalcon',
    flightStyle: 'level_speed_pursuit',
    description:
      'Vast expanses of high desert sagebrush and strong thermal drafts allowing high-velocity low-altitude pursuits.',
    highlights: [
      'Vast open sagebrush terrain',
      'Thermal ridge lift updrafts',
      'Wide-angle biotelemetry tracking lines',
    ],
  },
  {
    id: 'snake-river-birds-of-prey',
    title: 'Morley Nelson Snake River Birds of Prey NCA',
    region: 'Owyhee Canyonlands, Idaho, USA',
    territory: 'Snake River Canyon',
    elevationMeters: 950,
    primarySpecies: 'peregrine_falcon',
    flightStyle: 'high_pitch_stoop',
    description:
      'Towering basalt canyon walls and deep volcanic gorges creating immense vertical air space for 200+ mph stoops.',
    highlights: [
      'Basalt canyon wall updrafts',
      'High-pitch 1,000ft waiting-on altitudes',
      'Dramatic vertical stoop acoustics',
    ],
  },
  {
    id: 'san-luis-valley-alpine-plateau',
    title: 'San Luis Valley High Desert Falconry Grounds',
    region: 'San Luis Basin, Colorado, USA',
    territory: 'Sangre de Cristo Foothills',
    elevationMeters: 2300,
    primarySpecies: 'peregrine_falcon',
    flightStyle: 'high_pitch_stoop',
    description:
      'High-altitude basin ringed by 14,000-foot peaks with dense cold winter air providing exceptional raptor lift.',
    highlights: [
      'Dense cold alpine air density',
      'Wide-open agricultural stubble fields',
      'Clear mountain horizon lines',
    ],
  },
  {
    id: 'sonoran-desert-bajada',
    title: 'Sonoran Saguaro Scrub & Bajada Washes',
    region: 'Pima County, Arizona, USA',
    territory: 'Sonoran Desert Bajadas',
    elevationMeters: 750,
    primarySpecies: 'harriss_hawk',
    flightStyle: 'pack_cast_maneuver',
    description:
      'Rugged desert washes and dense ironwood stands ideal for social pack hunting and rapid brush maneuvers.',
    highlights: [
      'Cast flying social hunting dynamics',
      'Tight desert brush navigation',
      'High-heat hydration protocols',
    ],
  },
  {
    id: 'bighorn-basin-badlands',
    title: 'Bighorn Basin Rimrock & Shoshone Ridge',
    region: 'Park County, Wyoming, USA',
    territory: 'Absaroka Foothills',
    elevationMeters: 1600,
    primarySpecies: 'golden_eagle',
    flightStyle: 'perch_ridge_soaring',
    description:
      'Rugged sandstone badlands and rimrock escarpments providing commanding perches for apex eagle soaring.',
    highlights: [
      'High-exposure rimrock launch points',
      'Strong mountain ridge deflection winds',
      'Heavy-quarry mountain terrain',
    ],
  },
];

export const FALCONRY_GEAR_CHECKLIST: FalconryGearItem[] = [
  {
    id: 'vhf-gps-telemetry-transmitter',
    name: 'Dual-Frequency 216MHz VHF Tail-Mount & Micro-GPS Backpack',
    category: 'telemetry',
    mandatory: true,
    description:
      'Precision dual-mode tracking ensuring raptor recovery over mountain ridges and distant draws',
  },
  {
    id: 'elk-hide-falconry-gauntlet',
    name: 'Reinforced Triple-Layer Elk-Hide Gauntlet with D-Ring Tether',
    category: 'gauntlet',
    mandatory: true,
    description:
      'Heavy puncture-resistant leather gauntlet protecting against razor-sharp talons and crushing grip pressure',
  },
  {
    id: 'handcrafted-aylmeri-jesses',
    name: 'Kangaroo Leather Aylmeri Anklets, Field Jesses & Sampo Swivel',
    category: 'furniture',
    mandatory: true,
    description:
      'High-tensile kangaroo leather field jesses preventing tangled legs during perch landings and flights',
  },
  {
    id: 'dutch-blocked-raptor-hood',
    name: 'Calibrated Dutch Roll-Top Kipskin Leather Hunting Hood',
    category: 'furniture',
    mandatory: true,
    description:
      'Precision-molded leather hood keeping the raptor calm and focused until quarry is spotted',
  },
  {
    id: 'digital-gram-field-scale',
    name: 'Precision 0.1g Digital Field Perch Scale with T-Bar Mount',
    category: 'conditioning',
    mandatory: true,
    description:
      'Daily flying weight monitoring ensuring optimal response motivation without dangerous starvation',
  },
  {
    id: 'feathered-leather-training-lure',
    name: 'Weighted Leather Horseshoe Lure with Fresh Meat Attachment Thongs',
    category: 'recall',
    mandatory: true,
    description:
      'Aerodynamic recall lure simulating natural quarry for conditioning and immediate field retrieval',
  },
];

export function getFalconryGrounds(species?: RaptorSpecies): FalconryGround[] {
  if (!species) {
    return FALCONRY_GROUNDS;
  }
  return FALCONRY_GROUNDS.filter((ground) => ground.primarySpecies === species);
}

export function getFalconryGroundById(id: string): FalconryGround | undefined {
  return FALCONRY_GROUNDS.find((ground) => ground.id === id);
}

export function getFalconryGearChecklist(): FalconryGearItem[] {
  return FALCONRY_GEAR_CHECKLIST;
}

export function calculateRaptorConditioning(query: FalconryQuery): FalconryResult {
  const ground = getFalconryGroundById(query.groundId) ?? FALCONRY_GROUNDS[0];

  // Weight deviation percent:
  const weightDeviationPercent =
    Math.round(((query.targetWeightGrams - query.baseMoltWeightGrams) / query.baseMoltWeightGrams) * 1000) /
    10;

  // Conditioning status:
  let conditioningStatus: ConditioningStatus;
  if (weightDeviationPercent > -5.0) {
    conditioningStatus = 'lethargic_overfed';
  } else if (weightDeviationPercent >= -14.0) {
    conditioningStatus = 'prime_hunting_condition';
  } else if (weightDeviationPercent >= -18.0) {
    conditioningStatus = 'keen_hyper_responsive';
  } else {
    conditioningStatus = 'starvation_danger_lethal';
  }

  // Stoop speed calculation (mph):
  let estimatedStoopSpeedMph: number;
  const h = query.pitchAltitudeMeters;
  switch (query.raptorSpecies) {
    case 'peregrine_falcon':
      estimatedStoopSpeedMph = Math.min(240, Math.round(Math.sqrt(2 * 9.81 * h * 0.82) * 2.23694));
      break;
    case 'gyrfalcon':
      estimatedStoopSpeedMph = Math.min(190, Math.round(Math.sqrt(2 * 9.81 * h * 0.7) * 2.23694));
      break;
    case 'harriss_hawk':
      estimatedStoopSpeedMph = Math.min(75, Math.round(Math.sqrt(2 * 9.81 * h * 0.35) * 2.23694));
      break;
    case 'red_tailed_hawk':
      estimatedStoopSpeedMph = Math.min(85, Math.round(Math.sqrt(2 * 9.81 * h * 0.4) * 2.23694));
      break;
    case 'golden_eagle':
      estimatedStoopSpeedMph = Math.min(160, Math.round(Math.sqrt(2 * 9.81 * h * 0.65) * 2.23694));
      break;
    default:
      estimatedStoopSpeedMph = Math.min(240, Math.round(Math.sqrt(2 * 9.81 * h * 0.82) * 2.23694));
  }

  // Telemetry line-of-sight range (km):
  const telemetryRangeKm =
    Math.round((Math.sqrt(query.pitchAltitudeMeters) * 1.8 + 12.0) * 10) / 10;

  // Weight conditioning advisory:
  let weightConditioningAdvisory: string;
  switch (conditioningStatus) {
    case 'lethargic_overfed':
      weightConditioningAdvisory =
        'Raptor is above hunting weight threshold. Low response motivation expected; high risk of soaring away or perching without attending to lure or quarry.';
      break;
    case 'prime_hunting_condition':
      weightConditioningAdvisory =
        'Optimal response motivation and aerobic endurance. Raptor is alert, responsive, and primed for high-performance mountain pursuit.';
      break;
    case 'keen_hyper_responsive':
      weightConditioningAdvisory =
        'Raptor is sharp and hyper-focused. Immediate response guaranteed; monitor caloric burn closely during cold flights.';
      break;
    case 'starvation_danger_lethal':
      weightConditioningAdvisory =
        'CRITICAL: Severe muscle wasting and lethal metabolic exhaustion danger. Do NOT fly bird. Initiate gradual warm feeding protocol immediately.';
      break;
  }

  // Flight recovery guidance:
  let flightRecoveryGuidance: string;
  if (query.ambientTempC < 0) {
    flightRecoveryGuidance =
      'Sub-zero conditions accelerate caloric expenditure. Ensure thermal hood insulation and monitor line-of-sight telemetry carefully.';
  } else if (query.ambientTempC >= 25) {
    flightRecoveryGuidance =
      'High heat increases dehydration and panting risk. Provide immediate hydration on gauntlet and minimize prolonged high-pitch waits.';
  } else {
    flightRecoveryGuidance =
      'Standard atmospheric conditions. Maintain line-of-sight tracking and have weighted horseshoe lure prepared for rapid recovery.';
  }

  return {
    groundTitle: ground.title,
    raptorSpecies: query.raptorSpecies,
    weightDeviationPercent,
    conditioningStatus,
    estimatedStoopSpeedMph,
    telemetryRangeKm,
    weightConditioningAdvisory,
    flightRecoveryGuidance,
  };
}
