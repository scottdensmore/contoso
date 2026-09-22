export type NavigationDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type TerrainType = 'flat_trail' | 'open_forest' | 'rocky_talus' | 'dense_brush' | 'snowfield';
export type VisibilityCondition = 'clear' | 'fog_overcast' | 'dense_canopy' | 'night_whiteout';

export interface OrienteeringCourse {
  id: string;
  title: string;
  region: string;
  difficulty: NavigationDifficulty;
  terrainType: string;
  distanceKm: number;
  checkpointControls: number;
  magneticDeclinationDeg: number; // e.g. -12.5 for 12.5 W, +14.8 for 14.8 E
  basePaceCountPer100m: number;   // base double paces per 100m on flat trail
  offTrailPercentage: number;
  description: string;
  highlights: string[];
}

export interface NavigationLegQuery {
  courseId: string;
  legDistanceMeters: number;      // e.g. 50 to 3000
  mapBearingDegrees: number;      // 0 to 359
  terrainType: TerrainType;
  visibility: VisibilityCondition;
}

export interface NavigationLegResult {
  courseTitle: string;
  magneticBearingDegrees: number;
  backBearingDegrees: number;
  aimOffBearingDegrees: number;
  effectivePaceCountPer100m: number;
  totalDoublePaces: number;
  estimatedTimeMinutes: number;
  techniqueRecommendation: string;
  safetyAdvisory: string;
}

export interface OrienteeringGearItem {
  id: string;
  name: string;
  category: 'compass' | 'map' | 'tools' | 'pacing' | 'instruments' | 'marking';
  mandatory: boolean;
  description: string;
}

export const ORIENTEERING_COURSES: OrienteeringCourse[] = [
  {
    id: 'harriman-silvermine-classic',
    title: 'Harriman Silvermine Classic Orienteering Course',
    region: 'Harriman State Park, NY',
    difficulty: 'intermediate',
    terrainType: 'dense_deciduous_forest',
    distanceKm: 6.8,
    checkpointControls: 12,
    magneticDeclinationDeg: -12.5,
    basePaceCountPer100m: 64,
    offTrailPercentage: 45,
    description: 'Technical off-trail navigation through rocky hemlock knolls, stone walls, and glacial erratic boulders.',
    highlights: [
      'Glacial erratics as attack points',
      'Iron mine contour re-entrants',
      'Linear stone wall handrails',
    ],
  },
  {
    id: 'devils-lake-bluff-rogaine',
    title: "Devil's Lake Quartzite Bluffs Rogaine",
    region: 'Baraboo Hills, WI',
    difficulty: 'advanced',
    terrainType: 'quartzite_talus_bluffs',
    distanceKm: 14.5,
    checkpointControls: 24,
    magneticDeclinationDeg: -2.0,
    basePaceCountPer100m: 62,
    offTrailPercentage: 75,
    description: 'Challenging cross-country rogaine across 500-foot quartzite cliffs, talus slopes, and oak savanna ridges.',
    highlights: [
      'Steep cliff contour lines',
      'Talus field pace adjustments',
      'Ridge-to-gully bearing checks',
    ],
  },
  {
    id: 'rainier-paradise-glacier-traverse',
    title: 'Mount Rainier Paradise Off-Trail Alpine Traverse',
    region: 'Mount Rainier National Park, WA',
    difficulty: 'expert',
    terrainType: 'alpine_tundra_moraine',
    distanceKm: 9.2,
    checkpointControls: 8,
    magneticDeclinationDeg: 14.8,
    basePaceCountPer100m: 66,
    offTrailPercentage: 90,
    description: 'High-alpine whiteout navigation across lateral moraines, snowfields, and unmarked alpine meadows above timberline.',
    highlights: [
      'Dead reckoning in whiteout conditions',
      'Altimeter elevation verification',
      'Moraine crest handrails',
    ],
  },
  {
    id: 'blue-ridge-linville-gorge-challenge',
    title: 'Linville Gorge Wilderness Precision Navigation',
    region: 'Pisgah National Forest, NC',
    difficulty: 'expert',
    terrainType: 'rugged_canyon_rhododendron',
    distanceKm: 11.4,
    checkpointControls: 16,
    magneticDeclinationDeg: -7.5,
    basePaceCountPer100m: 65,
    offTrailPercentage: 80,
    description: 'Extreme off-trail bushwhacking through dense rhododendron hells and steep canyon chimneys requiring precise compass bearings.',
    highlights: [
      'Rhododendron thicket aim-off technique',
      'Canyon rim sightlines',
      'Spur-and-draw terrain association',
    ],
  },
  {
    id: 'boulder-chautauqua-sprint-course',
    title: 'Chautauqua Open Mesa Orienteering Sprint',
    region: 'Boulder Open Space, CO',
    difficulty: 'beginner',
    terrainType: 'open_pine_savanna',
    distanceKm: 4.2,
    checkpointControls: 10,
    magneticDeclinationDeg: 8.5,
    basePaceCountPer100m: 63,
    offTrailPercentage: 25,
    description: 'Fast-paced introduction to topographic map reading and control point identification along open ponderosa pine foothills.',
    highlights: [
      'Distinct trail intersections',
      'Flatiron geological landmarks',
      'Easy thumbing-the-map practice',
    ],
  },
];

export const MANDATORY_NAVIGATION_GEAR: OrienteeringGearItem[] = [
  {
    id: 'mirrored-sighting-compass',
    name: 'Adjustable Declination Mirrored Sighting Compass',
    category: 'compass',
    mandatory: true,
    description: 'Sighting mirror with sighting hole, 1° resolution bezel, clinometer for slope angle, and tool-adjustable declination screw.',
  },
  {
    id: 'waterproof-topo-map',
    name: 'Waterproof 1:24,000 USGS Topographic Map & Map Case',
    category: 'map',
    mandatory: true,
    description: 'Detailed 7.5-minute quadrangle map with 40ft contour intervals, protected inside a UV-resistant watertight sealable case.',
  },
  {
    id: 'utm-mgrs-grid-reader',
    name: 'Transparent Corner UTM / MGRS Coordinate Grid Reader & Protractor',
    category: 'tools',
    mandatory: true,
    description: 'Precision 1:24k/1:25k/1:50k slot ruler and 360° protractor for plotting exact 6-to-8-digit grid coordinates.',
  },
  {
    id: 'ranger-pace-tally-beads',
    name: 'Ranger Pace Count Tally Beads (Paracord & Beads)',
    category: 'pacing',
    mandatory: true,
    description: 'Mechanical pace counter with 9 100m beads and 4 1km beads to track dead-reckoning distance without losing count.',
  },
  {
    id: 'barometric-altimeter-watch',
    name: 'Calibrated Barometric Altimeter Watch & Backup Compass',
    category: 'instruments',
    mandatory: true,
    description: 'Barometric elevation gauge calibrated at known benchmarks to verify contour elevation bands and cross-check position.',
  },
  {
    id: 'high-visibility-marking-ribbon',
    name: 'High-Visibility Biodegradable Surveying Ribbon & Map Pen',
    category: 'marking',
    mandatory: true,
    description: 'Non-permanent fine-point waterproof alcohol pen for route sketching and biodegradable trail flags for attack point confirmation.',
  },
];

const TERRAIN_PACE_MULTIPLIERS: Record<TerrainType, number> = {
  flat_trail: 1.0,
  open_forest: 1.10,
  rocky_talus: 1.35,
  dense_brush: 1.50,
  snowfield: 1.40,
};

const TERRAIN_SPEED_KMH: Record<TerrainType, number> = {
  flat_trail: 4.0,
  open_forest: 3.0,
  rocky_talus: 1.8,
  dense_brush: 1.2,
  snowfield: 1.5,
};

const VISIBILITY_FACTORS: Record<VisibilityCondition, number> = {
  clear: 1.0,
  dense_canopy: 1.0,
  fog_overcast: 0.8,
  night_whiteout: 0.6,
};

export function getOrienteeringCourses(difficulty?: NavigationDifficulty): OrienteeringCourse[] {
  if (!difficulty) {
    return ORIENTEERING_COURSES;
  }
  return ORIENTEERING_COURSES.filter((course) => course.difficulty === difficulty);
}

export function getOrienteeringCourseById(id: string): OrienteeringCourse | undefined {
  return ORIENTEERING_COURSES.find((course) => course.id === id);
}

export function getOrienteeringGear(): OrienteeringGearItem[] {
  return MANDATORY_NAVIGATION_GEAR;
}

export function calculateNavigationLeg(query: NavigationLegQuery): NavigationLegResult {
  const course = getOrienteeringCourseById(query.courseId) ?? ORIENTEERING_COURSES[0];

  const declination = course.magneticDeclinationDeg;
  // Magnetic bearing: map bearing minus declination
  const rawMagnetic = ((query.mapBearingDegrees - declination) % 360 + 360) % 360;
  const magneticBearingDegrees = Math.round(rawMagnetic * 10) / 10;

  // Back bearing (reciprocal)
  const backBearingDegrees = query.mapBearingDegrees < 180
    ? query.mapBearingDegrees + 180
    : query.mapBearingDegrees - 180;

  // Aim-off bearing (+4° deliberate offset)
  const aimOffBearingDegrees = Math.round((query.mapBearingDegrees + 4) % 360);

  // Terrain multiplier and pace calculations
  const terrainMultiplier = TERRAIN_PACE_MULTIPLIERS[query.terrainType] ?? 1.0;
  const effectivePaceCountPer100m = Math.round(course.basePaceCountPer100m * terrainMultiplier);
  const totalDoublePaces = Math.round((query.legDistanceMeters / 100) * effectivePaceCountPer100m);

  // Speed and time calculation
  const baseSpeed = TERRAIN_SPEED_KMH[query.terrainType] ?? 3.0;
  const visibilityFactor = VISIBILITY_FACTORS[query.visibility] ?? 1.0;
  const speedKmH = baseSpeed * visibilityFactor;
  const estimatedTimeMinutes = Math.max(1, Math.round(((query.legDistanceMeters / 1000) / speedKmH) * 60));

  // Technique recommendations
  let techniqueRecommendation: string;
  if (query.visibility === 'night_whiteout') {
    techniqueRecommendation = 'Leap-frog pacing: Send lead navigator forward to the edge of visibility, check bearing alignment, and repeat.';
  } else if (query.terrainType === 'dense_brush') {
    techniqueRecommendation = 'Aiming off: Deliberately navigate 4° off target toward a linear catching feature (stream/trail) to avoid directional ambiguity.';
  } else if (query.terrainType === 'rocky_talus') {
    techniqueRecommendation = 'Handrail & Attack Point: Follow distinct contour lines or ridge spines toward a prominent boulder or saddle attack point.';
  } else if (query.terrainType === 'snowfield') {
    techniqueRecommendation = 'Dead reckoning & Altimeter checks: Maintain compass heading with strict pace tally counting, confirming elevation bands.';
  } else if (query.terrainType === 'open_forest') {
    techniqueRecommendation = 'Thumbing the map & Point-to-point: Keep thumb anchored on current location, checking bearing at every prominent knoll or re-entrant.';
  } else {
    techniqueRecommendation = 'Direct azimuth navigation: Follow compass sighting line directly to destination control point.';
  }

  // Safety advisories
  let safetyAdvisory: string;
  if (query.visibility === 'night_whiteout') {
    safetyAdvisory = 'Extreme disorientation hazard: maintain strict contact with handrails and leap-frog bearings.';
  } else if (query.visibility === 'fog_overcast') {
    safetyAdvisory = 'Reduced optical range: keep legs under 400m between verified attack points.';
  } else if (query.terrainType === 'dense_brush') {
    safetyAdvisory = 'High risk of lateral drift: aim off by 4° toward a definitive linear catching feature.';
  } else if (query.terrainType === 'rocky_talus') {
    safetyAdvisory = 'Slip and fall hazard on loose scree: reduce pace length and verify handholds across boulder fields.';
  } else if (query.terrainType === 'snowfield') {
    safetyAdvisory = 'Hypothermia and cornice hazard: verify barometric altimeter and watch for concealed crevasses or wind slabs.';
  } else {
    safetyAdvisory = 'Nominal off-trail conditions: maintain dead reckoning pace tally and periodic bearing cross-checks.';
  }

  return {
    courseTitle: course.title,
    magneticBearingDegrees,
    backBearingDegrees,
    aimOffBearingDegrees,
    effectivePaceCountPer100m,
    totalDoublePaces,
    estimatedTimeMinutes,
    techniqueRecommendation,
    safetyAdvisory,
  };
}
