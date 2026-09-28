import { describe, it, expect } from 'vitest';
import {
  getZiplineCourses,
  getZiplineCourseById,
  getZiplineGear,
  calculateZiplineDynamics,
  type ZiplineQuery,
} from './zipline';

describe('Wilderness Canyon Zipline Domain Logic', () => {
  describe('Zipline Courses Catalog', () => {
    it('returns all 5 iconic canyon and canopy zipline courses', () => {
      const courses = getZiplineCourses();
      expect(courses).toHaveLength(5);

      const ids = courses.map((c) => c.id);
      expect(ids).toContain('royal-gorge-canyon-extreme');
      expect(ids).toContain('snake-river-canyon-highline');
      expect(ids).toContain('haleakala-canopy-rainforest');
      expect(ids).toContain('red-river-gorge-cliffside');
      expect(ids).toContain('new-river-gorge-span-express');
    });

    it('filters courses by CourseType', () => {
      const canopy = getZiplineCourses('canopy_tour');
      expect(canopy).toHaveLength(2);
      const canopyIds = canopy.map((c) => c.id);
      expect(canopyIds).toContain('haleakala-canopy-rainforest');
      expect(canopyIds).toContain('red-river-gorge-cliffside');

      const extreme = getZiplineCourses('extreme_gravity_zipline');
      expect(extreme).toHaveLength(1);
      expect(extreme[0].id).toBe('royal-gorge-canyon-extreme');

      const canyonHighline = getZiplineCourses('canyon_highline_express');
      expect(canyonHighline).toHaveLength(1);
      expect(canyonHighline[0].id).toBe('snake-river-canyon-highline');

      const dualRacing = getZiplineCourses('dual_racing_canyon');
      expect(dualRacing).toHaveLength(1);
      expect(dualRacing[0].id).toBe('new-river-gorge-span-express');
    });

    it('finds a course by id with exact specifications', () => {
      const course = getZiplineCourseById('royal-gorge-canyon-extreme');
      expect(course).toBeDefined();
      expect(course?.title).toBe('Royal Gorge Canyon Extreme Zip');
      expect(course?.canyonLocation).toBe('Royal Gorge');
      expect(course?.stateOrRegion).toBe('CO');
      expect(course?.spanLengthFt).toBe(2400);
      expect(course?.verticalDropFt).toBe(360);
      expect(course?.maxSpeedMph).toBe(55);
      expect(course?.courseType).toBe('extreme_gravity_zipline');
      expect(course?.brakingSystem).toBe('active_magnetic_zipstop');
      expect(course?.highlights).toContain('1,000-ft gorge suspension drop');
      expect(course?.highlights).toContain('Arkansas River aerial canyon crossing');
      expect(course?.highlights).toContain('Magnetic eddy-current primary braking');

      const nonExistent = getZiplineCourseById('unknown-course');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('Mandatory Canyon Zipline Safety Kit Checklist', () => {
    it('returns all 6 mandatory gear items with expected categories', () => {
      const gear = getZiplineGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('full-body-canyon-harness');
      expect(ids).toContain('high-speed-dual-tandem-trolley');
      expect(ids).toContain('impact-rated-zip-helmet');
      expect(ids).toContain('kevlar-reinforced-braking-gloves');
      expect(ids).toContain('dual-redundant-safety-lanyard');
      expect(ids).toContain('dynamic-backup-locking-carabiners');

      const harness = gear.find((g) => g.id === 'full-body-canyon-harness');
      expect(harness?.category).toBe('harness');

      const trolley = gear.find((g) => g.id === 'high-speed-dual-tandem-trolley');
      expect(trolley?.category).toBe('trolley');

      const helmet = gear.find((g) => g.id === 'impact-rated-zip-helmet');
      expect(helmet?.category).toBe('helmet');

      const gloves = gear.find((g) => g.id === 'kevlar-reinforced-braking-gloves');
      expect(gloves?.category).toBe('gloves');

      const tether = gear.find((g) => g.id === 'dual-redundant-safety-lanyard');
      expect(tether?.category).toBe('tether');

      const hardware = gear.find((g) => g.id === 'dynamic-backup-locking-carabiners');
      expect(hardware?.category).toBe('hardware');
    });
  });

  describe('Zipline Speed & Deceleration Dynamics Calculator', () => {
    it('calculates velocity, braking distance, tension load, and safety rating for default inputs', () => {
      const query: ZiplineQuery = {
        courseId: 'royal-gorge-canyon-extreme',
        riderPayloadLbs: 175,
        lineLengthFt: 2400,
        slopeGradePercent: 15,
        trolleyBearing: 'dual_steel_high_speed',
      };

      const result = calculateZiplineDynamics(query);
      expect(result.courseTitle).toBe('Royal Gorge Canyon Extreme Zip');
      expect(result.courseType).toBe('extreme_gravity_zipline');
      expect(result.riderPayloadLbs).toBe(175);
      expect(result.calculatedSpeedMph).toBe(40);
      expect(result.brakingDistanceFt).toBe(64); // 40^2 / 25 = 1600 / 25 = 64
      expect(result.cableTensionKn).toBe(23.4);
      expect(result.safetyRating).toBe('optimal_descent_dynamics');
      expect(result.brakingAdvisory).toBeDefined();
      expect(result.engineeringAdvisory).toBeDefined();
    });

    it('adjusts velocity with bearing friction multipliers', () => {
      const baseQuery: ZiplineQuery = {
        courseId: 'royal-gorge-canyon-extreme',
        riderPayloadLbs: 175,
        lineLengthFt: 2400,
        slopeGradePercent: 15,
        trolleyBearing: 'dual_steel_high_speed',
      };

      const standard = calculateZiplineDynamics(baseQuery);
      const ceramic = calculateZiplineDynamics({ ...baseQuery, trolleyBearing: 'ceramic_hybrid' });
      const tandem = calculateZiplineDynamics({ ...baseQuery, trolleyBearing: 'tandem_pulley' });

      expect(ceramic.calculatedSpeedMph).toBeGreaterThanOrEqual(standard.calculatedSpeedMph);
      expect(tandem.calculatedSpeedMph).toBeLessThanOrEqual(standard.calculatedSpeedMph);
    });

    it('flags excessive_velocity_hazard_regrade when slopeGradePercent > 22 or speed > 65 mph', () => {
      const extremeQuery: ZiplineQuery = {
        courseId: 'royal-gorge-canyon-extreme',
        riderPayloadLbs: 250,
        lineLengthFt: 3500,
        slopeGradePercent: 24,
        trolleyBearing: 'ceramic_hybrid',
      };

      const result = calculateZiplineDynamics(extremeQuery);
      expect(result.safetyRating).toBe('excessive_velocity_hazard_regrade');
      expect(result.brakingAdvisory).toMatch(/critical|excessive|regrade/i);
    });

    it('flags high_speed_heavy_braking_required when speed is between 50 and 65 mph and slope <= 22', () => {
      const highSpeedQuery: ZiplineQuery = {
        courseId: 'snake-river-canyon-highline',
        riderPayloadLbs: 200,
        lineLengthFt: 2800,
        slopeGradePercent: 18,
        trolleyBearing: 'dual_steel_high_speed',
      };

      const result = calculateZiplineDynamics(highSpeedQuery);
      expect(result.calculatedSpeedMph).toBeGreaterThanOrEqual(50);
      expect(result.calculatedSpeedMph).toBeLessThanOrEqual(65);
      expect(result.safetyRating).toBe('high_speed_heavy_braking_required');
      expect(result.brakingAdvisory).toMatch(/caution|high-speed|heavy braking/i);
    });

    it('flags optimal_descent_dynamics for moderate conditions', () => {
      const mellowQuery: ZiplineQuery = {
        courseId: 'haleakala-canopy-rainforest',
        riderPayloadLbs: 120,
        lineLengthFt: 1800,
        slopeGradePercent: 8,
        trolleyBearing: 'tandem_pulley',
      };

      const result = calculateZiplineDynamics(mellowQuery);
      expect(result.safetyRating).toBe('optimal_descent_dynamics');
      expect(result.brakingAdvisory).toMatch(/optimal/i);
    });

    it('throws error when courseId is not found', () => {
      const invalidQuery: ZiplineQuery = {
        courseId: 'non-existent-course',
        riderPayloadLbs: 175,
        lineLengthFt: 2400,
        slopeGradePercent: 15,
        trolleyBearing: 'dual_steel_high_speed',
      };

      expect(() => calculateZiplineDynamics(invalidQuery)).toThrow(/not found/i);
    });
  });
});
