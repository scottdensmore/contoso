import { describe, it, expect } from 'vitest';
import {
  getOrienteeringCourses,
  getOrienteeringCourseById,
  calculateNavigationLeg,
  getOrienteeringGear,
} from './orienteering';

describe('Orienteering Domain Logic', () => {
  describe('Orienteering Courses Catalog', () => {
    it('returns all 5 iconic navigation courses', () => {
      const courses = getOrienteeringCourses();
      expect(courses).toHaveLength(5);

      const ids = courses.map((c) => c.id);
      expect(ids).toEqual([
        'harriman-silvermine-classic',
        'devils-lake-bluff-rogaine',
        'rainier-paradise-glacier-traverse',
        'blue-ridge-linville-gorge-challenge',
        'boulder-chautauqua-sprint-course',
      ]);
    });

    it('filters courses by difficulty', () => {
      const beginner = getOrienteeringCourses('beginner');
      expect(beginner).toHaveLength(1);
      expect(beginner[0].id).toBe('boulder-chautauqua-sprint-course');

      const intermediate = getOrienteeringCourses('intermediate');
      expect(intermediate).toHaveLength(1);
      expect(intermediate[0].id).toBe('harriman-silvermine-classic');

      const advanced = getOrienteeringCourses('advanced');
      expect(advanced).toHaveLength(1);
      expect(advanced[0].id).toBe('devils-lake-bluff-rogaine');

      const expert = getOrienteeringCourses('expert');
      expect(expert).toHaveLength(2);
      expect(expert.map((c) => c.id)).toContain('rainier-paradise-glacier-traverse');
      expect(expert.map((c) => c.id)).toContain('blue-ridge-linville-gorge-challenge');
    });

    it('finds a course by id', () => {
      const harriman = getOrienteeringCourseById('harriman-silvermine-classic');
      expect(harriman).toBeDefined();
      expect(harriman?.title).toBe('Harriman Silvermine Classic Orienteering Course');
      expect(harriman?.region).toBe('Harriman State Park, NY');
      expect(harriman?.difficulty).toBe('intermediate');
      expect(harriman?.distanceKm).toBe(6.8);
      expect(harriman?.checkpointControls).toBe(12);
      expect(harriman?.magneticDeclinationDeg).toBe(-12.5);
      expect(harriman?.basePaceCountPer100m).toBe(64);
      expect(harriman?.offTrailPercentage).toBe(45);
      expect(harriman?.highlights).toContain('Glacial erratics as attack points');

      const nonExistent = getOrienteeringCourseById('non-existent-course');
      expect(nonExistent).toBeUndefined();
    });

    it('verifies all 5 courses have detailed required specs', () => {
      const rainier = getOrienteeringCourseById('rainier-paradise-glacier-traverse');
      expect(rainier?.magneticDeclinationDeg).toBe(14.8);
      expect(rainier?.checkpointControls).toBe(8);
      expect(rainier?.difficulty).toBe('expert');

      const linville = getOrienteeringCourseById('blue-ridge-linville-gorge-challenge');
      expect(linville?.magneticDeclinationDeg).toBe(-7.5);
      expect(linville?.basePaceCountPer100m).toBe(65);

      const devilsLake = getOrienteeringCourseById('devils-lake-bluff-rogaine');
      expect(devilsLake?.magneticDeclinationDeg).toBe(-2.0);
      expect(devilsLake?.checkpointControls).toBe(24);

      const chautauqua = getOrienteeringCourseById('boulder-chautauqua-sprint-course');
      expect(chautauqua?.magneticDeclinationDeg).toBe(8.5);
      expect(chautauqua?.checkpointControls).toBe(10);
    });
  });

  describe('Mandatory Navigation Kit Checklist', () => {
    it('returns the 6 mandatory orienteering gear items', () => {
      const gear = getOrienteeringGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('compass');
      expect(categories).toContain('map');
      expect(categories).toContain('tools');
      expect(categories).toContain('pacing');
      expect(categories).toContain('instruments');
      expect(categories).toContain('marking');

      const compass = gear.find((g) => g.id === 'mirrored-sighting-compass');
      expect(compass?.name).toBe('Adjustable Declination Mirrored Sighting Compass');
      expect(compass?.description).toContain('clinometer');

      const paceBeads = gear.find((g) => g.id === 'ranger-pace-tally-beads');
      expect(paceBeads?.name).toBe('Ranger Pace Count Tally Beads (Paracord & Beads)');
    });
  });

  describe('Navigation & Pace Calculator', () => {
    it('calculates magnetic bearing with westerly declination (Harriman -12.5°)', () => {
      const result = calculateNavigationLeg({
        courseId: 'harriman-silvermine-classic',
        legDistanceMeters: 350,
        mapBearingDegrees: 45,
        terrainType: 'open_forest',
        visibility: 'clear',
      });

      // 45 - (-12.5) = 57.5°
      expect(result.courseTitle).toBe('Harriman Silvermine Classic Orienteering Course');
      expect(result.magneticBearingDegrees).toBe(57.5);
      // Back bearing: 45 + 180 = 225°
      expect(result.backBearingDegrees).toBe(225);
      // Aim-off bearing: (45 + 4) % 360 = 49°
      expect(result.aimOffBearingDegrees).toBe(49);
      // Effective paces: 64 * 1.10 = 70.4 -> 70 paces/100m
      expect(result.effectivePaceCountPer100m).toBe(70);
      // Total double paces: (350 / 100) * 70 = 245
      expect(result.totalDoublePaces).toBe(245);
      // Travel time: 350m / 3.0 km/h = 7 minutes
      expect(result.estimatedTimeMinutes).toBe(7);
      expect(result.techniqueRecommendation).toContain('Thumbing the map');
      expect(result.safetyAdvisory).toBe('Nominal off-trail conditions: maintain dead reckoning pace tally and periodic bearing cross-checks.');
    });

    it('calculates magnetic bearing with easterly declination and wrap-around (Rainier +14.8°)', () => {
      const result = calculateNavigationLeg({
        courseId: 'rainier-paradise-glacier-traverse',
        legDistanceMeters: 500,
        mapBearingDegrees: 10,
        terrainType: 'snowfield',
        visibility: 'night_whiteout',
      });

      // 10 - 14.8 = -4.8 -> 355.2°
      expect(result.magneticBearingDegrees).toBe(355.2);
      expect(result.backBearingDegrees).toBe(190);
      expect(result.aimOffBearingDegrees).toBe(14);
      // Effective paces: 66 * 1.40 = 92.4 -> 92 paces/100m
      expect(result.effectivePaceCountPer100m).toBe(92);
      // Total double paces: 5 * 92 = 460
      expect(result.totalDoublePaces).toBe(460);
      // Speed: snowfield 1.5 * night_whiteout 0.6 = 0.9 km/h. 0.5km / 0.9 * 60 = 33.33 -> 33 min
      expect(result.estimatedTimeMinutes).toBe(33);
      expect(result.techniqueRecommendation).toContain('Leap-frog pacing');
      expect(result.safetyAdvisory).toBe('Extreme disorientation hazard: maintain strict contact with handrails and leap-frog bearings.');
    });

    it('handles reciprocal back bearing for bearings >= 180°', () => {
      const result = calculateNavigationLeg({
        courseId: 'boulder-chautauqua-sprint-course',
        legDistanceMeters: 200,
        mapBearingDegrees: 270,
        terrainType: 'flat_trail',
        visibility: 'clear',
      });

      // 270 - 180 = 90°
      expect(result.backBearingDegrees).toBe(90);
      // 270 - 8.5 = 261.5°
      expect(result.magneticBearingDegrees).toBe(261.5);
      expect(result.aimOffBearingDegrees).toBe(274);
      // flat trail: base 63 * 1.0 = 63 paces/100m
      expect(result.effectivePaceCountPer100m).toBe(63);
      expect(result.totalDoublePaces).toBe(126);
      // 200m / 4.0 km/h = 3 min
      expect(result.estimatedTimeMinutes).toBe(3);
    });

    it('recommends aim-off technique and flags dense brush advisory', () => {
      const result = calculateNavigationLeg({
        courseId: 'blue-ridge-linville-gorge-challenge',
        legDistanceMeters: 600,
        mapBearingDegrees: 358,
        terrainType: 'dense_brush',
        visibility: 'clear',
      });

      // 358 + 4 = 362 -> 2°
      expect(result.aimOffBearingDegrees).toBe(2);
      expect(result.techniqueRecommendation).toContain('Aiming off');
      expect(result.safetyAdvisory).toBe('High risk of lateral drift: aim off by 4° toward a definitive linear catching feature.');
    });

    it('handles rocky talus terrain and fog visibility', () => {
      const result = calculateNavigationLeg({
        courseId: 'devils-lake-bluff-rogaine',
        legDistanceMeters: 450,
        mapBearingDegrees: 90,
        terrainType: 'rocky_talus',
        visibility: 'fog_overcast',
      });

      // 90 - (-2.0) = 92°
      expect(result.magneticBearingDegrees).toBe(92);
      expect(result.effectivePaceCountPer100m).toBe(Math.round(62 * 1.35)); // 84
      expect(result.techniqueRecommendation).toContain('Handrail & Attack Point');
      expect(result.safetyAdvisory).toBe('Reduced optical range: keep legs under 400m between verified attack points.');
    });

    it('falls back gracefully to default course if courseId is unrecognized', () => {
      const result = calculateNavigationLeg({
        courseId: 'unknown-id',
        legDistanceMeters: 100,
        mapBearingDegrees: 0,
        terrainType: 'flat_trail',
        visibility: 'clear',
      });

      expect(result.courseTitle).toBe('Harriman Silvermine Classic Orienteering Course');
      expect(result.magneticBearingDegrees).toBe(12.5); // 0 - (-12.5) = 12.5
    });
  });
});
