export type CourseType =
  | 'canopy_tour'
  | 'canyon_highline_express'
  | 'extreme_gravity_zipline'
  | 'dual_racing_canyon';

export type BrakingSystem =
  | 'active_magnetic_zipstop'
  | 'passive_gravity_brake'
  | 'spring_buffer_impact_brake';

export type TrolleyBearing =
  | 'dual_steel_high_speed'
  | 'ceramic_hybrid'
  | 'tandem_pulley';

export type SafetyRating =
  | 'optimal_descent_dynamics'
  | 'high_speed_heavy_braking_required'
  | 'excessive_velocity_hazard_regrade';

export interface ZiplineCourse {
  id: string;
  title: string;
  canyonLocation: string;
  stateOrRegion: string;
  spanLengthFt: number;
  verticalDropFt: number;
  maxSpeedMph: number;
  courseType: CourseType;
  brakingSystem: BrakingSystem;
  description: string;
  highlights: string[];
}

export interface ZiplineQuery {
  courseId: string;
  riderPayloadLbs: number; // 70 to 280 lbs, default 175
  lineLengthFt: number; // 500 to 4000 ft, default 2400
  slopeGradePercent: number; // 5 to 25%, default 15
  trolleyBearing: TrolleyBearing; // default 'dual_steel_high_speed'
}

export interface ZiplineResult {
  courseTitle: string;
  courseType: CourseType;
  riderPayloadLbs: number;
  calculatedSpeedMph: number;
  brakingDistanceFt: number;
  cableTensionKn: number;
  safetyRating: SafetyRating;
  speedCategory: string;
  brakingAdvisory: string;
  engineeringAdvisory: string;
}

export interface ZiplineGearItem {
  id: string;
  name: string;
  category: 'harness' | 'trolley' | 'helmet' | 'gloves' | 'tether' | 'hardware';
  mandatory: boolean;
  description: string;
}

export const ZIPLINE_COURSES: ZiplineCourse[] = [
  {
    id: 'royal-gorge-canyon-extreme',
    title: 'Royal Gorge Canyon Extreme Zip',
    canyonLocation: 'Royal Gorge',
    stateOrRegion: 'CO',
    spanLengthFt: 2400,
    verticalDropFt: 360,
    maxSpeedMph: 55,
    courseType: 'extreme_gravity_zipline',
    brakingSystem: 'active_magnetic_zipstop',
    description:
      'Massive gorge crossing suspended 1,000 feet above the roaring Arkansas River, delivering high-speed gravity flight.',
    highlights: [
      '1,000-ft gorge suspension drop',
      'Arkansas River aerial canyon crossing',
      'Magnetic eddy-current primary braking',
    ],
  },
  {
    id: 'snake-river-canyon-highline',
    title: 'Snake River Canyon Highline',
    canyonLocation: 'Snake River Canyon',
    stateOrRegion: 'ID',
    spanLengthFt: 3100,
    verticalDropFt: 420,
    maxSpeedMph: 68,
    courseType: 'canyon_highline_express',
    brakingSystem: 'active_magnetic_zipstop',
    description:
      'Exposed rim-to-rim canyon traverse over jagged basalt columns, built for maximum aerodynamic velocity.',
    highlights: [
      'High-velocity canyon rim blast',
      'Dual redundant 19mm steel cable line',
      'High-wind cross-canyon stability',
    ],
  },
  {
    id: 'haleakala-canopy-rainforest',
    title: 'Haleakala Canopy Rainforest Tour',
    canyonLocation: 'Haleakala',
    stateOrRegion: 'Maui, HI',
    spanLengthFt: 1800,
    verticalDropFt: 180,
    maxSpeedMph: 40,
    courseType: 'canopy_tour',
    brakingSystem: 'spring_buffer_impact_brake',
    description:
      'Lush multi-tier aerial glide through native cloud forest canopies and eucalyptus groves on the slopes of Haleakala.',
    highlights: [
      'Multi-tier endemic cloud forest platforms',
      'Suspended swaying bridge transitions',
      'Quiet ceramic-hybrid low-impact gliding',
    ],
  },
  {
    id: 'red-river-gorge-cliffside',
    title: 'Red River Gorge Cliffside Zip',
    canyonLocation: 'Red River Gorge',
    stateOrRegion: 'KY',
    spanLengthFt: 1900,
    verticalDropFt: 220,
    maxSpeedMph: 45,
    courseType: 'canopy_tour',
    brakingSystem: 'passive_gravity_brake',
    description:
      'Scenic glide across sandstone cliffs and dense Appalachian hemlock forest terminating in a gentle gravity rise.',
    highlights: [
      'Sandstone gorge amphitheater traverse',
      'Natural parabolic gravity catch terminal',
      'Canopy eco-line wildlife vantage',
    ],
  },
  {
    id: 'new-river-gorge-span-express',
    title: 'New River Gorge Dual-Racing Zip',
    canyonLocation: 'New River Gorge',
    stateOrRegion: 'WV',
    spanLengthFt: 3300,
    verticalDropFt: 480,
    maxSpeedMph: 65,
    courseType: 'dual_racing_canyon',
    brakingSystem: 'active_magnetic_zipstop',
    description:
      'Side-by-side dual tandem racing spans plunging across the New River Gorge with simultaneous racer release.',
    highlights: [
      'Side-by-side canyon rim racing lines',
      '3,300-foot continuous single span',
      'Zipstop multi-stage arrestor runout',
    ],
  },
];

export const ZIPLINE_GEAR: ZiplineGearItem[] = [
  {
    id: 'full-body-canyon-harness',
    name: 'Full-Body Canyon Aerial Suspension Harness',
    category: 'harness',
    mandatory: true,
    description:
      'Full-body padded suspension harness with dorsal attachment point and gear loops rated to 22kN.',
  },
  {
    id: 'high-speed-dual-tandem-trolley',
    name: 'High-Speed Dual Tandem Steel Pulley Trolley with Sealed Bearings',
    category: 'trolley',
    mandatory: true,
    description:
      'Dual tandem stainless steel sheaves with sealed precision ball bearings engineered for cable speeds up to 75 mph.',
  },
  {
    id: 'impact-rated-zip-helmet',
    name: 'Impact-Resistant CE EN 12492 Certified Canopy Helmet',
    category: 'helmet',
    mandatory: true,
    description:
      'Lightweight climbing and canopy helmet with high-density EPS foam liner and ventilated shell.',
  },
  {
    id: 'kevlar-reinforced-braking-gloves',
    name: 'Heavy-Duty Kevlar Reinforced Palm Braking Gloves',
    category: 'gloves',
    mandatory: true,
    description:
      'Triple-layer cowhide leather gloves with heat-resistant Kevlar palm patch for high-friction cable contact.',
  },
  {
    id: 'dual-redundant-safety-lanyard',
    name: 'Dual Redundant Heavy-Duty Shock-Absorbing Safety Lanyard',
    category: 'tether',
    mandatory: true,
    description:
      'Twin dynamic webbing safety lanyards with integrated energy absorber for redundant trolley tethering.',
  },
  {
    id: 'dynamic-backup-locking-carabiners',
    name: 'Tri-Act Auto-Locking Aluminum/Steel Backup Carabiners (35kN)',
    category: 'hardware',
    mandatory: true,
    description:
      'Triple-action auto-locking captive eye carabiners with 35kN major axis gate strength.',
  },
];

export function getZiplineCourses(courseType?: CourseType): ZiplineCourse[] {
  if (!courseType) {
    return ZIPLINE_COURSES;
  }
  return ZIPLINE_COURSES.filter((course) => course.courseType === courseType);
}

export function getZiplineCourseById(id: string): ZiplineCourse | undefined {
  return ZIPLINE_COURSES.find((course) => course.id === id);
}

export function getZiplineGear(): ZiplineGearItem[] {
  return ZIPLINE_GEAR;
}

export function calculateZiplineDynamics(query: ZiplineQuery): ZiplineResult {
  const course = getZiplineCourseById(query.courseId);
  if (!course) {
    throw new Error(`Zipline course with id "${query.courseId}" not found.`);
  }

  const frictionMultiplier =
    query.trolleyBearing === 'ceramic_hybrid'
      ? 1.05
      : query.trolleyBearing === 'tandem_pulley'
      ? 0.92
      : 1.0;

  const rawSpeed =
    Math.sqrt(
      2 *
        32.174 *
        (query.lineLengthFt * (query.slopeGradePercent / 100)) *
        (query.riderPayloadLbs / 175) *
        0.15
    ) *
    0.681818 *
    frictionMultiplier;

  const calculatedSpeedMph = Math.round(
    Math.min(80, Math.max(20, rawSpeed))
  );

  const brakingDistanceFt = Math.round(
    (calculatedSpeedMph * calculatedSpeedMph) / 25
  );

  const cableTensionKn = Number(
    (((query.riderPayloadLbs * 0.00444822 * query.lineLengthFt) / 80)).toFixed(1)
  );

  let safetyRating: SafetyRating;
  if (calculatedSpeedMph > 65 || query.slopeGradePercent > 22) {
    safetyRating = 'excessive_velocity_hazard_regrade';
  } else if (calculatedSpeedMph >= 50) {
    safetyRating = 'high_speed_heavy_braking_required';
  } else {
    safetyRating = 'optimal_descent_dynamics';
  }

  let speedCategory: string;
  let brakingAdvisory: string;
  let engineeringAdvisory: string;

  if (safetyRating === 'excessive_velocity_hazard_regrade') {
    speedCategory = 'Excessive Velocity Hazard';
    brakingAdvisory =
      'CRITICAL: Velocity exceeds 65 mph or slope grade exceeds 22%. Mandatory secondary magnetic Zipstop runout and line regrade required.';
    engineeringAdvisory = `Cable tension (${cableTensionKn} kN) reaches critical threshold. Reduce slope grade or increase trolley braking friction before flight.`;
  } else if (safetyRating === 'high_speed_heavy_braking_required') {
    speedCategory = 'High-Speed Velocity';
    brakingAdvisory =
      'CAUTION: High speed traverse requires active magnetic Zipstop primary brake with extended emergency spring arrestor.';
    engineeringAdvisory = `Tension load is ${cableTensionKn} kN. Verify magnetic brake catch car reset and inspect 19mm steel cable sag.`;
  } else {
    speedCategory = 'Optimal Cruising Speed';
    brakingAdvisory =
      'OPTIMAL: Controlled velocity compatible with standard passive gravity deceleration and secondary buffer springs.';
    engineeringAdvisory = `Descent envelope within safe parameters. Cable tension (${cableTensionKn} kN) provides smooth catenary curve.`;
  }

  return {
    courseTitle: course.title,
    courseType: course.courseType,
    riderPayloadLbs: query.riderPayloadLbs,
    calculatedSpeedMph,
    brakingDistanceFt,
    cableTensionKn,
    safetyRating,
    speedCategory,
    brakingAdvisory,
    engineeringAdvisory,
  };
}
