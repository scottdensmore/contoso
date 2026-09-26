import { describe, it, expect } from 'vitest';
import {
  getPackBurroCourses,
  getPackBurroCourseById,
  calculatePackBurro,
  getBurroGear,
  type PackBurroQuery,
} from './pack-burro';

describe('pack-burro library', () => {
  describe('getPackBurroCourses', () => {
    it('returns all 5 iconic pack-burro race courses when no filter is provided', () => {
      const courses = getPackBurroCourses();
      expect(courses).toHaveLength(5);
      expect(courses.map((c) => c.id)).toEqual([
        'leadville-boom-days-mosquito-pass',
        'fairplay-burro-days-pass',
        'buena-vista-gold-rush-days',
        'georgetown-canyon-burro-run',
        'idaho-springs-tombstone-dash',
      ]);
    });

    it('filters courses by BurroType standard_burro', () => {
      const standardCourses = getPackBurroCourses('standard_burro');
      expect(standardCourses).toHaveLength(4);
      expect(standardCourses.every((c) => c.defaultBurroType === 'standard_burro')).toBe(true);
      expect(standardCourses.map((c) => c.id)).toContain('leadville-boom-days-mosquito-pass');
      expect(standardCourses.map((c) => c.id)).toContain('fairplay-burro-days-pass');
      expect(standardCourses.map((c) => c.id)).toContain('buena-vista-gold-rush-days');
      expect(standardCourses.map((c) => c.id)).toContain('idaho-springs-tombstone-dash');
    });

    it('filters courses by BurroType mammoth_donkey', () => {
      const mammothCourses = getPackBurroCourses('mammoth_donkey');
      expect(mammothCourses).toHaveLength(1);
      expect(mammothCourses[0].id).toBe('georgetown-canyon-burro-run');
      expect(mammothCourses[0].defaultBurroType).toBe('mammoth_donkey');
    });

    it('returns an empty array if filtered by an unused type like miniature_burro', () => {
      const miniCourses = getPackBurroCourses('miniature_burro');
      expect(miniCourses).toEqual([]);
    });
  });

  describe('getPackBurroCourseById', () => {
    it('returns the course when matching id exists', () => {
      const course = getPackBurroCourseById('leadville-boom-days-mosquito-pass');
      expect(course).toBeDefined();
      expect(course?.title).toBe('Leadville Boom Days World Championship (Mosquito Pass)');
      expect(course?.location).toBe('Lake County, Leadville, CO, USA');
      expect(course?.summitElevationM).toBe(4019);
      expect(course?.distanceKm).toBe(33.8);
      expect(course?.maxGradePercent).toBe(24);
      expect(course?.defaultBurroType).toBe('standard_burro');
      expect(course?.highlights).toHaveLength(3);
    });

    it('returns undefined when id is not found', () => {
      const course = getPackBurroCourseById('non-existent-course');
      expect(course).toBeUndefined();
    });
  });

  describe('getBurroGear', () => {
    it('returns the 6 mandatory WPBR regulation and veterinary kit items', () => {
      const gear = getBurroGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);
      expect(gear.map((item) => item.id)).toEqual([
        'regulation-pack-saddle',
        'prospector-mining-kit',
        'cotton-lead-rope',
        'equine-cooling-electrolyte',
        'hoof-pick-and-rasp',
        'high-visibility-runner-vest',
      ]);
    });

    it('verifies item categories and descriptions', () => {
      const gear = getBurroGear();
      const saddle = gear.find((g) => g.id === 'regulation-pack-saddle');
      expect(saddle?.category).toBe('saddle');
      expect(saddle?.name).toContain('Regulation Wood Sawbuck Pack Saddle');

      const kit = gear.find((g) => g.id === 'prospector-mining-kit');
      expect(kit?.category).toBe('regulation_weight');

      const rope = gear.find((g) => g.id === 'cotton-lead-rope');
      expect(rope?.category).toBe('tack');

      const vet = gear.find((g) => g.id === 'equine-cooling-electrolyte');
      expect(vet?.category).toBe('veterinary');

      const hoof = gear.find((g) => g.id === 'hoof-pick-and-rasp');
      expect(hoof?.category).toBe('hoofcare');

      const vest = gear.find((g) => g.id === 'high-visibility-runner-vest');
      expect(vest?.category).toBe('runner_gear');
    });
  });

  describe('calculatePackBurro', () => {
    it('calculates regulation compliance, braking force, oxygen level, and optimal team status for default Leadville inputs', () => {
      const query: PackBurroQuery = {
        courseId: 'leadville-boom-days-mosquito-pass',
        burroType: 'standard_burro',
        packWeightLbs: 35,
        slopeGradientPercent: 18,
        runnerPaceMinPerMile: 10,
      };

      const result = calculatePackBurro(query);

      expect(result.courseTitle).toBe('Leadville Boom Days World Championship (Mosquito Pass)');
      // 35 lbs >= 33.0 lbs
      expect(result.weightStatus).toBe('regulation_compliant');
      // Math.round(35 * (18 / 100) * 2.5) = Math.round(15.75) = 16
      expect(result.brakingForceLbs).toBe(16);
      // Math.round(100 * Math.exp(-4019 / 8400)) = Math.round(61.974...) = 62
      expect(result.oxygenLevelPercent).toBe(62);
      // pack >= 33, slope 18 <= 20 -> optimal_race_cadence
      expect(result.teamStatus).toBe('optimal_race_cadence');
      expect(result.advisory).toBeTruthy();
    });

    it('flags underweight pack disqualification when pack weight is under 33 lbs', () => {
      const query: PackBurroQuery = {
        courseId: 'leadville-boom-days-mosquito-pass',
        burroType: 'standard_burro',
        packWeightLbs: 28,
        slopeGradientPercent: 15,
        runnerPaceMinPerMile: 10,
      };

      const result = calculatePackBurro(query);

      expect(result.weightStatus).toBe('underweight_disqualification');
      expect(result.teamStatus).toBe('disqualified_underweight_pack');
      // Math.round(28 * 0.15 * 2.5) = Math.round(10.5) = 11
      expect(result.brakingForceLbs).toBe(11);
      expect(result.advisory).toContain('underweight');
    });

    it('flags caution steep scree braking when slope gradient exceeds 20%', () => {
      const query: PackBurroQuery = {
        courseId: 'fairplay-burro-days-pass',
        burroType: 'standard_burro',
        packWeightLbs: 35,
        slopeGradientPercent: 24,
        runnerPaceMinPerMile: 11,
      };

      const result = calculatePackBurro(query);

      expect(result.weightStatus).toBe('regulation_compliant');
      expect(result.teamStatus).toBe('caution_steep_scree_braking');
      // Math.round(35 * 0.24 * 2.5) = Math.round(21) = 21
      expect(result.brakingForceLbs).toBe(21);
      // Fairplay elevation 3995m: Math.round(100 * Math.exp(-3995 / 8400)) = 62
      expect(result.oxygenLevelPercent).toBe(62);
      expect(result.advisory).toContain('Steep');
    });

    it('prioritizes underweight pack disqualification over steep scree braking if both occur', () => {
      const query: PackBurroQuery = {
        courseId: 'fairplay-burro-days-pass',
        burroType: 'standard_burro',
        packWeightLbs: 30, // underweight
        slopeGradientPercent: 25, // steep
        runnerPaceMinPerMile: 9,
      };

      const result = calculatePackBurro(query);

      expect(result.weightStatus).toBe('underweight_disqualification');
      expect(result.teamStatus).toBe('disqualified_underweight_pack');
    });

    it('correctly handles boundary pack weight at exactly 33.0 lbs', () => {
      const query: PackBurroQuery = {
        courseId: 'buena-vista-gold-rush-days',
        burroType: 'standard_burro',
        packWeightLbs: 33,
        slopeGradientPercent: 12,
        runnerPaceMinPerMile: 8,
      };

      const result = calculatePackBurro(query);

      expect(result.weightStatus).toBe('regulation_compliant');
      expect(result.teamStatus).toBe('optimal_race_cadence');
      // Math.round(33 * 0.12 * 2.5) = Math.round(9.9) = 10
      expect(result.brakingForceLbs).toBe(10);
      // Buena Vista elevation 2850m: Math.round(100 * Math.exp(-2850 / 8400)) = 71
      expect(result.oxygenLevelPercent).toBe(71);
    });

    it('falls back gracefully to first course if unknown courseId provided', () => {
      const query: PackBurroQuery = {
        courseId: 'unknown-trail',
        burroType: 'standard_burro',
        packWeightLbs: 35,
        slopeGradientPercent: 10,
        runnerPaceMinPerMile: 10,
      };

      const result = calculatePackBurro(query);
      expect(result.courseTitle).toBe('Leadville Boom Days World Championship (Mosquito Pass)');
    });
  });
});
