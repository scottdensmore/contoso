import { describe, it, expect } from 'vitest';
import {
  getHighlineSpans,
  getHighlineSpanById,
  getHighlineGear,
  calculateRiggingPhysics,
  type RiggingCalculationQuery,
} from './highline';

describe('Alpine Highline & Slackline Domain Logic', () => {
  describe('Highline Spans Catalog', () => {
    it('returns all 5 iconic highline spans', () => {
      const spans = getHighlineSpans();
      expect(spans).toHaveLength(5);

      const ids = spans.map((s) => s.id);
      expect(ids).toContain('yosemite-taft-point-highline');
      expect(ids).toContain('moab-fruit-bowl-canyon');
      expect(ids).toContain('smith-rock-monkey-face-highline');
      expect(ids).toContain('castle-valley-rectory-span');
      expect(ids).toContain('index-town-walls-practice-highline');
    });

    it('filters spans by HighlineDifficulty', () => {
      const beginner = getHighlineSpans('beginner');
      expect(beginner).toHaveLength(1);
      expect(beginner[0].id).toBe('index-town-walls-practice-highline');
      expect(beginner[0].spanLengthM).toBe(32);
      expect(beginner[0].voidExposureM).toBe(45);

      const intermediate = getHighlineSpans('intermediate');
      expect(intermediate).toHaveLength(1);
      expect(intermediate[0].id).toBe('smith-rock-monkey-face-highline');
      expect(intermediate[0].spanLengthM).toBe(45);

      const advanced = getHighlineSpans('advanced');
      expect(advanced).toHaveLength(1);
      expect(advanced[0].id).toBe('yosemite-taft-point-highline');
      expect(advanced[0].spanLengthM).toBe(65);
      expect(advanced[0].voidExposureM).toBe(850);

      const expert = getHighlineSpans('expert');
      expect(expert).toHaveLength(2);
      const expertIds = expert.map((s) => s.id);
      expect(expertIds).toContain('moab-fruit-bowl-canyon');
      expect(expertIds).toContain('castle-valley-rectory-span');
    });

    it('finds a span by id with exact specifications', () => {
      const taft = getHighlineSpanById('yosemite-taft-point-highline');
      expect(taft).toBeDefined();
      expect(taft?.title).toBe('Taft Point Fissures Alpine Highline');
      expect(taft?.region).toBe('Yosemite National Park, CA');
      expect(taft?.spanLengthM).toBe(65);
      expect(taft?.voidExposureM).toBe(850);
      expect(taft?.difficulty).toBe('advanced');
      expect(taft?.primaryWebbing).toBe('polyester_low_stretch');
      expect(taft?.backupWebbing).toBe('dyneema_uhmwpe');
      expect(taft?.nominalTensionKn).toBe(3.5);
      expect(taft?.anchorSystem).toBe('Multi-bolt equalized master point with quad redundancy');
      expect(taft?.windExposure).toBe('high_crosswind');
      expect(taft?.highlights).toContain('850m vertical air exposure');

      const nonExistent = getHighlineSpanById('unknown-span');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('Mandatory Highline Rigging Kit Checklist', () => {
    it('returns all 6 mandatory highline gear items', () => {
      const gear = getHighlineGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('highline-leash-dual-rings');
      expect(ids).toContain('independent-backup-webbing');
      expect(ids).toContain('weblock-anchor-devices');
      expect(ids).toContain('buckingham-pulley-system');
      expect(ids).toContain('heavy-duty-edge-pads');
      expect(ids).toContain('wind-dampener-wind-sock');

      const leash = gear.find((g) => g.id === 'highline-leash-dual-rings');
      expect(leash?.category).toBe('safety_leash');
      expect(leash?.name).toContain('Dual Steel Rings');

      const edge = gear.find((g) => g.id === 'heavy-duty-edge-pads');
      expect(edge?.category).toBe('edge_protection');

      const wind = gear.find((g) => g.id === 'wind-dampener-wind-sock');
      expect(wind?.category).toBe('oscillation_control');
    });
  });

  describe('Span Sag & Tension Calculator Physics', () => {
    it('calculates midpoint sag, tension, anchor leg load, and safety factor for nominal query', () => {
      const query: RiggingCalculationQuery = {
        spanId: 'yosemite-taft-point-highline',
        walkerWeightKg: 75,
        standingSagPercent: 6,
        dynamicLoadFactor: 1.2,
        anchorAngleDegrees: 45,
      };

      const result = calculateRiggingPhysics(query);

      expect(result.spanTitle).toBe('Taft Point Fissures Alpine Highline');
      expect(result.centerSagM).toBe(3.9);
      expect(result.lineTensionKn).toBe(1.9);
      expect(result.anchorLegLoadKn).toBe(1.0);
      expect(result.webbingSafetyFactor).toBe(15.8);
      expect(result.minVoidClearanceM).toBe(6.9);
      expect(result.safetyStatus).toBe('safe');
      expect(result.riggingAdvisory).toMatch(/nominal/i);
    });

    it('flags critical status when anchor angle exceeds 90 degrees', () => {
      const query: RiggingCalculationQuery = {
        spanId: 'smith-rock-monkey-face-highline',
        walkerWeightKg: 75,
        standingSagPercent: 6,
        dynamicLoadFactor: 1.2,
        anchorAngleDegrees: 95,
      };

      const result = calculateRiggingPhysics(query);
      expect(result.safetyStatus).toBe('critical');
      expect(result.riggingAdvisory).toMatch(/anchor angle.*(exceeds|severe|critical)/i);
    });

    it('flags caution status when anchor angle is between 61 and 90 degrees', () => {
      const query: RiggingCalculationQuery = {
        spanId: 'smith-rock-monkey-face-highline',
        walkerWeightKg: 75,
        standingSagPercent: 6,
        dynamicLoadFactor: 1.2,
        anchorAngleDegrees: 75,
      };

      const result = calculateRiggingPhysics(query);
      expect(result.safetyStatus).toBe('caution');
      expect(result.riggingAdvisory).toMatch(/anchor angle.*exceeds 60°/i);
    });

    it('flags critical status when webbing safety factor drops below 4.0', () => {
      const query: RiggingCalculationQuery = {
        spanId: 'index-town-walls-practice-highline',
        walkerWeightKg: 110,
        standingSagPercent: 3,
        dynamicLoadFactor: 2.5, // Leash fall arc
        anchorAngleDegrees: 45,
      };

      const result = calculateRiggingPhysics(query);
      expect(result.webbingSafetyFactor).toBeLessThan(4.0);
      expect(result.safetyStatus).toBe('critical');
      expect(result.riggingAdvisory).toMatch(/safety factor.*below 4:1/i);
    });

    it('flags caution status when line tension exceeds 6.0 kN', () => {
      const query: RiggingCalculationQuery = {
        spanId: 'moab-fruit-bowl-canyon',
        walkerWeightKg: 100,
        standingSagPercent: 3,
        dynamicLoadFactor: 1.8, // Dynamic bounce
        anchorAngleDegrees: 50,
      };

      const result = calculateRiggingPhysics(query);
      expect(result.lineTensionKn).toBeGreaterThan(6.0);
      expect(result.safetyStatus).toBe('caution');
      expect(result.riggingAdvisory).toMatch(/tension exceeds 6.0 kN/i);
    });

    it('throws error when spanId does not exist', () => {
      const query: RiggingCalculationQuery = {
        spanId: 'unknown-gap',
        walkerWeightKg: 75,
        standingSagPercent: 6,
        dynamicLoadFactor: 1.2,
        anchorAngleDegrees: 45,
      };

      expect(() => calculateRiggingPhysics(query)).toThrow(/not found/i);
    });
  });
});
