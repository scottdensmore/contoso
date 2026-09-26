export type BurroType = 'standard_burro' | 'mammoth_donkey' | 'miniature_burro';
export type BurroRaceStatus = 'optimal_race_cadence' | 'caution_steep_scree_braking' | 'disqualified_underweight_pack';
export type WeightComplianceStatus = 'regulation_compliant' | 'underweight_disqualification';

export interface PackBurroCourse {
  id: string;
  title: string;
  location: string;
  summitElevationM: number;
  distanceKm: number;
  defaultBurroType: BurroType;
  maxGradePercent: number;
  description: string;
  highlights: string[];
}

export interface PackBurroQuery {
  courseId: string;
  burroType: BurroType; // default 'standard_burro'
  packWeightLbs: number; // 20 to 60 lbs, default 35
  slopeGradientPercent: number; // 5 to 30 %, default 18
  runnerPaceMinPerMile: number; // 6 to 16 min/mi, default 10
}

export interface PackBurroResult {
  courseTitle: string;
  weightStatus: WeightComplianceStatus;
  brakingForceLbs: number;
  oxygenLevelPercent: number;
  teamStatus: BurroRaceStatus;
  advisory: string;
}

export interface BurroGearItem {
  id: string;
  name: string;
  category: 'saddle' | 'regulation_weight' | 'tack' | 'veterinary' | 'hoofcare' | 'runner_gear';
  mandatory: boolean;
  description: string;
}

export const PACK_BURRO_COURSES: PackBurroCourse[] = [
  {
    id: 'leadville-boom-days-mosquito-pass',
    title: 'Leadville Boom Days World Championship (Mosquito Pass)',
    location: 'Lake County, Leadville, CO, USA',
    summitElevationM: 4019,
    distanceKm: 33.8,
    defaultBurroType: 'standard_burro',
    maxGradePercent: 24,
    description: 'The premier alpine endurance test of the Triple Crown, crossing Mosquito Pass summit at 13,185 ft through unrelenting scree, historic mining claims, and extreme thin air.',
    highlights: [
      'Ascent to 13,185 ft Mosquito Pass summit',
      'Loose granite talus and scree switchbacks',
      'Historic 1880s mining claim trail',
    ],
  },
  {
    id: 'fairplay-burro-days-pass',
    title: 'Fairplay World Championship Burro Race',
    location: 'South Park, Fairplay, CO, USA',
    summitElevationM: 3995,
    distanceKm: 46.7,
    defaultBurroType: 'standard_burro',
    maxGradePercent: 22,
    description: 'The grueling 29-mile marathon leg of the Triple Crown, navigating expansive beaver meadows, cold glacial runoff crossings, and the historic high-pass divide.',
    highlights: [
      'High-altitude marathon endurance loop',
      'Stream crossings and beaver meadow bogs',
      'Triple Crown premiere leg',
    ],
  },
  {
    id: 'buena-vista-gold-rush-days',
    title: 'Buena Vista Gold Rush Pack-Burro Challenge',
    location: 'Chaffee County, CO, USA',
    summitElevationM: 2850,
    distanceKm: 21.0,
    defaultBurroType: 'standard_burro',
    maxGradePercent: 18,
    description: 'A fast, scenic course along the Arkansas River valley with sweeping Collegiate Peaks vistas, testing synchronized runner-burro sprinting over packed gravel.',
    highlights: [
      'Collegiate Peaks panoramic views',
      'Fast-paced Arkansas River gravel flats',
      'Rapid runner-burro stride synchronization',
    ],
  },
  {
    id: 'georgetown-canyon-burro-run',
    title: 'Georgetown Silver Plume Mining District Run',
    location: 'Clear Creek County, CO, USA',
    summitElevationM: 3100,
    distanceKm: 14.5,
    defaultBurroType: 'mammoth_donkey',
    maxGradePercent: 20,
    description: 'Historic mountain railbed course winding through narrow silver-mining canyons and rugged pine timber, suited for larger, powerful mammoth donkey teams.',
    highlights: [
      'Historic narrow-gauge railroad grade',
      'Tight alpine timber switchbacks',
      'Steep mining canyon ascents',
    ],
  },
  {
    id: 'idaho-springs-tombstone-dash',
    title: 'Idaho Springs Gold Digger Mile & Steeplechase',
    location: 'Clear Creek County, CO, USA',
    summitElevationM: 2590,
    distanceKm: 12.0,
    defaultBurroType: 'standard_burro',
    maxGradePercent: 16,
    description: 'A thrilling, rapid-paced sprint beginning on historic Miner Street before ascending the gritty grades and water bar obstacles of Virginia Canyon.',
    highlights: [
      'Fast spectator-lined street sprint start',
      'Virginia Canyon gravel climbing grind',
      'Technical downhill water bar jumps',
    ],
  },
];

export const BURRO_GEAR_CHECKLIST: BurroGearItem[] = [
  {
    id: 'regulation-pack-saddle',
    name: 'Regulation Wood Sawbuck Pack Saddle with Double Cinch & Breeching',
    category: 'saddle',
    mandatory: true,
    description: 'Traditional dual-cinch wood sawbuck or decker saddle fitted with wide leather breeching and breast collar to stabilize packs on steep descents.',
  },
  {
    id: 'prospector-mining-kit',
    name: 'Steel Mining Pick, Flat Shovel, & 14-Inch Steel Gold Pan (33-lb Minimum)',
    category: 'regulation_weight',
    mandatory: true,
    description: 'Authentic prospector mining kit that, combined with the saddle and pack, must weigh at least 33 lbs on official race scales.',
  },
  {
    id: 'cotton-lead-rope',
    name: '15-Foot Heavy-Duty Braided Cotton Lead Rope with Brass Swivel Snap',
    category: 'tack',
    mandatory: true,
    description: 'Regulation 15-foot soft cotton lead rope that prevents hand friction burns during sudden lunges without wrapping around wrists or saddles.',
  },
  {
    id: 'equine-cooling-electrolyte',
    name: 'Equine Veterinary Oral Electrolyte Syringe & Heart Rate Stethoscope',
    category: 'veterinary',
    mandatory: true,
    description: 'Emergency equine electrolyte paste and veterinary stethoscope for monitoring pulse rates at mandatory mid-race veterinary check stations.',
  },
  {
    id: 'hoof-pick-and-rasp',
    name: 'Ergonomic Brass Hoof Pick with Stiff Bristles & Compact Finishing Rasp',
    category: 'hoofcare',
    mandatory: true,
    description: 'Essential trail hoof pick and rasp to clear lodgepole gravel, sharp granite scree, and mud from the frog and hoof wall.',
  },
  {
    id: 'high-visibility-runner-vest',
    name: 'Breathable Fluorescent Runner-Wrangler Vest with Whistle & Bib Holder',
    category: 'runner_gear',
    mandatory: true,
    description: 'High-visibility fluorescent running vest with safety whistle for signaling course marshals and securing official WPBR bib numbers.',
  },
];

export function getPackBurroCourses(type?: BurroType): PackBurroCourse[] {
  if (!type) {
    return [...PACK_BURRO_COURSES];
  }
  return PACK_BURRO_COURSES.filter((course) => course.defaultBurroType === type);
}

export function getPackBurroCourseById(id: string): PackBurroCourse | undefined {
  return PACK_BURRO_COURSES.find((course) => course.id === id);
}

export function getBurroGear(): BurroGearItem[] {
  return [...BURRO_GEAR_CHECKLIST];
}

export function calculatePackBurro(query: PackBurroQuery): PackBurroResult {
  const course = getPackBurroCourseById(query.courseId) ?? PACK_BURRO_COURSES[0];
  const weightStatus: WeightComplianceStatus =
    query.packWeightLbs >= 33.0 ? 'regulation_compliant' : 'underweight_disqualification';

  const brakingForceLbs = Math.round(
    query.packWeightLbs * (query.slopeGradientPercent / 100) * 2.5
  );

  const oxygenLevelPercent = Math.round(
    100 * Math.exp(-course.summitElevationM / 8400)
  );

  let teamStatus: BurroRaceStatus;
  let advisory: string;

  if (query.packWeightLbs < 33.0) {
    teamStatus = 'disqualified_underweight_pack';
    advisory =
      'Pack saddle weight is underweight (below the mandatory 33-lb WPBR threshold). Team faces immediate disqualification at pre-race weigh-in. Add regulation ballast or mining tools immediately.';
  } else if (query.slopeGradientPercent > 20) {
    teamStatus = 'caution_steep_scree_braking';
    advisory = `Steep scree descent of ${query.slopeGradientPercent}% grade requires high breeching braking force (${brakingForceLbs} lbs). Give your burro ample head room and avoid wrapping the cotton lead rope around your hands.`;
  } else {
    teamStatus = 'optimal_race_cadence';
    advisory = `Optimal race cadence achieved with ${query.packWeightLbs} lbs regulation-compliant pack saddle on a manageable ${query.slopeGradientPercent}% grade. Maintain rhythmic stride coordination.`;
  }

  return {
    courseTitle: course.title,
    weightStatus,
    brakingForceLbs,
    oxygenLevelPercent,
    teamStatus,
    advisory,
  };
}
