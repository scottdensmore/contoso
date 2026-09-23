export type AnimalFamily = 'canid' | 'felid' | 'ursid' | 'ungulate';
export type SubstrateType =
  | 'dry_sand_silt'
  | 'compacted_mud'
  | 'fresh_powder_snow'
  | 'dense_wet_snow'
  | 'forest_loam';
export type ExposureCondition =
  | 'sheltered_dense_canopy'
  | 'moderate_breeze_filtered'
  | 'direct_blistering_sun_wind';
export type TrackWallCondition =
  | 'razor_crisp_undisturbed'
  | 'softened_rounded_edges'
  | 'collapsed_debris_filled';
export type PredatorAlertLevel =
  | 'normal_wilderness_protocol'
  | 'caution_monitoring'
  | 'heightened_predator_alert';

export interface AnimalTrackProfile {
  id: string;
  commonName: string;
  scientificName: string;
  family: AnimalFamily;
  trackLengthInches: number;
  trackWidthInches: number;
  clawMarksVisible: boolean;
  toeCount: number;
  typicalStrideInches: number;
  typicalGait: string;
  habitat: string;
  description: string;
  identifyingSigns: string[];
}

export interface TrackAgingQuery {
  speciesId: string;
  substrate: SubstrateType;
  sunWindExposure: ExposureCondition;
  trackWallSharpness: TrackWallCondition;
  measuredStrideInches: number; // 10 to 65 inches, default 28
  dewclawPresent: boolean;
}

export interface TrackAgingResult {
  speciesName: string;
  family: AnimalFamily;
  gaitClassification: string;
  estimatedSpeedMph: number;
  estimatedAgeHours: string;
  freshnessRating: 'very_fresh_immediate' | 'recent_today' | 'aged_yesterday_or_older';
  predatorAlert: PredatorAlertLevel;
  substratePreservationRating: string;
  trackerAdvisory: string;
}

export interface TrackingGearItem {
  id: string;
  name: string;
  category: 'measurement' | 'optics' | 'observation' | 'documentation' | 'recording' | 'safety';
  mandatory: boolean;
  description: string;
}

export const ANIMAL_TRACK_PROFILES: AnimalTrackProfile[] = [
  {
    id: 'gray-wolf-pack',
    commonName: 'Northwestern Gray Wolf',
    scientificName: 'Canis lupus',
    family: 'canid',
    trackLengthInches: 4.5,
    trackWidthInches: 4.0,
    clawMarksVisible: true,
    toeCount: 4,
    typicalStrideInches: 28,
    typicalGait: 'Direct Register Trot',
    habitat: 'Boreal Forests & Mountain Valleys',
    description:
      'Large oval symmetrical tracks with prominent claws, tight front-pad chevron, and single-file direct-register pacing.',
    identifyingSigns: [
      'Parallel pack scent posts',
      'Urine scratch territorial marks',
      'Cracked ungulate femur bones at kill sites',
    ],
  },
  {
    id: 'mountain-lion-cougar',
    commonName: 'North American Cougar',
    scientificName: 'Puma concolor',
    family: 'felid',
    trackLengthInches: 3.8,
    trackWidthInches: 4.2,
    clawMarksVisible: false,
    toeCount: 4,
    typicalStrideInches: 16,
    typicalGait: 'Stalking Walk',
    habitat: 'Rocky Canyons & Conifer Slopes',
    description:
      'Asymmetrical teardrop toes with leading toe, absence of claw punctures, and M-shaped triple-lobed heel pad.',
    identifyingSigns: [
      'Leaf and needle scraped territorial mounds',
      'Ungulate kills cached under brush',
      'Horizontal claw scratches on low trunks',
    ],
  },
  {
    id: 'grizzly-brown-bear',
    commonName: 'Interior Grizzly Bear',
    scientificName: 'Ursus arctos horribilis',
    family: 'ursid',
    trackLengthInches: 11.0,
    trackWidthInches: 7.0,
    clawMarksVisible: true,
    toeCount: 5,
    typicalStrideInches: 40,
    typicalGait: 'Overstep Shuffling Walk',
    habitat: 'Subalpine Meadows & Riparian Corridors',
    description:
      'Massive plantigrade foot impressions with straight-line toe alignment and long claw marks 2-3 inches ahead of pads.',
    identifyingSigns: [
      'Bite and claw tree markings 7-9 feet high',
      'Extensively excavated marmot burrows',
      'High-volume berry or fish scat',
    ],
  },
  {
    id: 'rocky-mountain-elk',
    commonName: 'Rocky Mountain Elk',
    scientificName: 'Cervus canadensis',
    family: 'ungulate',
    trackLengthInches: 4.5,
    trackWidthInches: 3.5,
    clawMarksVisible: false,
    toeCount: 2,
    typicalStrideInches: 30,
    typicalGait: 'Diagonal Walk',
    habitat: 'Montane Forests & Alpine Parks',
    description:
      'Rounded heart-shaped cloven hoof prints with blunt tips; dewclaws appear in soft mud and deep snow.',
    identifyingSigns: [
      'Velvet rub bark striations on saplings',
      'Wallow depressions in muddy creek bends',
      'Cylindrical pellet clusters',
    ],
  },
  {
    id: 'north-american-moose',
    commonName: 'Western Shiras Moose',
    scientificName: 'Alces alces shirasi',
    family: 'ungulate',
    trackLengthInches: 5.5,
    trackWidthInches: 4.5,
    clawMarksVisible: false,
    toeCount: 2,
    typicalStrideInches: 48,
    typicalGait: 'High-Stepping Paced Walk',
    habitat: 'Riparian Willow Basins & Marshlands',
    description:
      'Pointed teardrop cloven hooves that splay dramatically in marshy mud; heavy stride with distinct dewclaw pits.',
    identifyingSigns: [
      'Willow and aspen browse lines at 6-8 feet',
      'Massive fibrous dung piles',
      'Wide snow trench bedding hollows',
    ],
  },
];

export const TRACKING_GEAR: TrackingGearItem[] = [
  {
    id: 'calibrated-tracking-stick',
    name: '60-Inch Graduated Tracker\x27s Measuring Stick with Sliding O-Rings',
    category: 'measurement',
    mandatory: true,
    description:
      'Lightweight graduated dowel with adjustable silicone O-rings for recording stride, straddle, and individual print dimensions without kneeling.',
  },
  {
    id: 'high-intensity-raking-light',
    name: '500-Lumen High-CRI LED Flashlight for Low-Angle Shadow Cast',
    category: 'optics',
    mandatory: true,
    description:
      'Side-casting raking illuminator designed to reveal subtle compression ridges, toe impressions, and claw scratches on shallow substrates.',
  },
  {
    id: 'compact-8x42-binoculars',
    name: 'Roof Prism 8x42 Waterproof ED Binoculars for Long-Distance Observation',
    category: 'observation',
    mandatory: true,
    description:
      'High light-transmission binoculars for scanning ridgelines, willow flats, and distant game trails prior to entering predator zones.',
  },
  {
    id: 'quick-hardening-dental-stone',
    name: 'Pre-Measured High-Strength Dental Stone Plaster & Casting Frame',
    category: 'documentation',
    mandatory: true,
    description:
      'Ultra-fine gypsum casting compound yielding durable 18,000 PSI reproductions of delicate track floor morphology and dermal details.',
  },
  {
    id: 'weatherproof-field-journal',
    name: 'All-Weather Grid Rite-in-the-Rain Notebook with Animal Sign Reference',
    category: 'recording',
    mandatory: true,
    description:
      'Waterproof synthetic paper journal with 1/4-inch grid ruling for documenting track matrices, direction of travel, and aging timelines.',
  },
  {
    id: 'inertial-holstered-bear-spray',
    name: 'EPA-Certified 10.2oz 2.0% Major Capsaicinoid Bear Deterrent Spray with Holster',
    category: 'safety',
    mandatory: true,
    description:
      'Rapid-deployment 35-foot range capsaicin fogger essential when following fresh large carnivore tracks in backcountry terrain.',
  },
];

export function getAnimalTrackProfiles(family?: AnimalFamily): AnimalTrackProfile[] {
  if (!family) {
    return [...ANIMAL_TRACK_PROFILES];
  }
  return ANIMAL_TRACK_PROFILES.filter((profile) => profile.family === family);
}

export function getAnimalTrackProfileById(id: string): AnimalTrackProfile | undefined {
  return ANIMAL_TRACK_PROFILES.find((profile) => profile.id === id);
}

export function getTrackingGear(): TrackingGearItem[] {
  return [...TRACKING_GEAR];
}

export function calculateTrackAging(query: TrackAgingQuery): TrackAgingResult {
  const profile = ANIMAL_TRACK_PROFILES.find((p) => p.id === query.speciesId);
  const speciesName = profile ? profile.commonName : 'Unidentified Wilderness Animal';
  const family = profile ? profile.family : 'canid';
  const typicalStride = profile ? profile.typicalStrideInches : 28;
  const typicalGait = profile ? profile.typicalGait : 'Direct Register Trot';

  // Gait & speed calculation
  const strideRatio = query.measuredStrideInches / typicalStride;
  let gaitClassification: string;
  let estimatedSpeedMph: number;

  if (strideRatio < 0.75) {
    gaitClassification = 'Slow Stalking Walk';
    estimatedSpeedMph = Math.max(1.5, Math.round(query.measuredStrideInches * 0.15 * 10) / 10);
  } else if (strideRatio <= 1.25) {
    gaitClassification = typicalGait;
    estimatedSpeedMph = Math.round(query.measuredStrideInches * 0.215);
  } else if (strideRatio <= 1.75) {
    gaitClassification = 'Bounding Lope';
    estimatedSpeedMph = Math.round(query.measuredStrideInches * 0.28 * 10) / 10;
  } else {
    gaitClassification = 'Full Gallop / High-Speed Pursuit';
    estimatedSpeedMph = Math.round(query.measuredStrideInches * 0.38 * 10) / 10;
  }

  // Track wall aging & freshness
  let freshnessRating: 'very_fresh_immediate' | 'recent_today' | 'aged_yesterday_or_older';
  let estimatedAgeHours: string;

  if (query.trackWallSharpness === 'razor_crisp_undisturbed') {
    freshnessRating = 'very_fresh_immediate';
    if (query.sunWindExposure === 'direct_blistering_sun_wind') {
      estimatedAgeHours = '< 1 hour (Extremely Fresh - Rapid Desiccation)';
    } else {
      estimatedAgeHours = '< 2 hours (Extremely Fresh)';
    }
  } else if (query.trackWallSharpness === 'softened_rounded_edges') {
    freshnessRating = 'recent_today';
    if (query.sunWindExposure === 'direct_blistering_sun_wind') {
      estimatedAgeHours = '2 to 6 hours (Rapidly Weathering)';
    } else if (query.sunWindExposure === 'moderate_breeze_filtered') {
      estimatedAgeHours = '4 to 12 hours (Today\x27s Sign)';
    } else {
      estimatedAgeHours = '6 to 18 hours (Today\x27s Sign)';
    }
  } else {
    freshnessRating = 'aged_yesterday_or_older';
    estimatedAgeHours = '24+ hours (Weathered Sign)';
  }

  // Substrate preservation rating
  let substratePreservationRating: string;
  switch (query.substrate) {
    case 'compacted_mud':
      substratePreservationRating = 'High Cohesion (Crisp Detail & Long Retention)';
      break;
    case 'fresh_powder_snow':
      substratePreservationRating = 'Low Cohesion (High Wind Drift & Thermal Melting)';
      break;
    case 'dense_wet_snow':
      substratePreservationRating = 'Moderate Cohesion (Temperature Sensitive Freeze-Thaw)';
      break;
    case 'dry_sand_silt':
      substratePreservationRating = 'Low to Moderate Cohesion (Prone to Gravity Slumping)';
      break;
    case 'forest_loam':
      substratePreservationRating = 'Good Cohesion (Organic Cushion & Resilience)';
      break;
    default:
      substratePreservationRating = 'Standard Wilderness Matrix';
  }

  // Predator alert determination
  const isPredator = family === 'ursid' || family === 'felid' || family === 'canid';
  let predatorAlert: PredatorAlertLevel;

  if (isPredator) {
    if (freshnessRating === 'very_fresh_immediate') {
      predatorAlert = 'heightened_predator_alert';
    } else if (freshnessRating === 'recent_today') {
      predatorAlert = 'caution_monitoring';
    } else {
      predatorAlert = 'normal_wilderness_protocol';
    }
  } else {
    predatorAlert = 'normal_wilderness_protocol';
  }

  // Tracker advisory note
  let trackerAdvisory: string;
  if (predatorAlert === 'heightened_predator_alert') {
    trackerAdvisory =
      'CRITICAL PREDATOR ALERT: Extremely fresh apex predator track detected within past 2 hours. Animal is likely in the immediate vicinity. Have bear spray unholstered and safety clip removed. Group together, make assertive human vocal noises, avoid running, and retreat upwind or do not pursue.';
  } else if (predatorAlert === 'caution_monitoring') {
    trackerAdvisory =
      'CAUTION ADVISORY: Recent predator activity observed within the past 12 hours. Keep bear deterrent spray accessible on hip belt. Maintain situational awareness, avoid blind corners, and store food in bear canisters.';
  } else {
    trackerAdvisory =
      'NORMAL PROTOCOL: Track shows significant weathering or belongs to non-predatory ungulates. Maintain standard backcountry awareness, watch for fresh sign, and travel in designated corridors.';
  }

  if (query.dewclawPresent) {
    trackerAdvisory +=
      ' Dewclaw impressions indicate deep substrate penetration, high animal mass, or rapid deceleration / forceful push-off.';
  }

  return {
    speciesName,
    family,
    gaitClassification,
    estimatedSpeedMph,
    estimatedAgeHours,
    freshnessRating,
    predatorAlert,
    substratePreservationRating,
    trackerAdvisory,
  };
}
