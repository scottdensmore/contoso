import { describe, it, expect } from 'vitest';
import {
  getPsicoblocCrags,
  getPsicoblocCragById,
  calculatePsicobloc,
  getPsicoblocGear,
} from './psicobloc';

describe('psicobloc data & calculations', () => {
  describe('crag catalog', () => {
    it('returns all 5 iconic crags by default', () => {
      const crags = getPsicoblocCrags();
      expect(crags).toHaveLength(5);
      expect(crags.map((c) => c.id)).toEqual([
        'es-pontas-mallorca',
        'cala-barques-cave',
        'railay-tonsai-krabi',
        'swanage-conner-cove',
        'summersville-lake-wv',
      ]);
    });

    it('filters crags by rockType', () => {
      const pocketed = getPsicoblocCrags('pocketed_limestone');
      expect(pocketed).toHaveLength(2);
      expect(pocketed.map((c) => c.id)).toContain('es-pontas-mallorca');
      expect(pocketed.map((c) => c.id)).toContain('swanage-conner-cove');

      const tufa = getPsicoblocCrags('tufa_limestone');
      expect(tufa).toHaveLength(1);
      expect(tufa[0].id).toBe('cala-barques-cave');

      const karst = getPsicoblocCrags('karst_limestone');
      expect(karst).toHaveLength(1);
      expect(karst[0].id).toBe('railay-tonsai-krabi');

      const sandstone = getPsicoblocCrags('marine_sandstone');
      expect(sandstone).toHaveLength(1);
      expect(sandstone[0].id).toBe('summersville-lake-wv');
    });

    it('retrieves crag by id correctly', () => {
      const crag = getPsicoblocCragById('es-pontas-mallorca');
      expect(crag).toBeDefined();
      expect(crag?.title).toBe('Es Pontàs Natural Sea Arch');
      expect(crag?.country).toBe('Spain');
      expect(crag?.rockType).toBe('pocketed_limestone');
      expect(crag?.waterType).toBe('sea');
      expect(crag?.boatAccessOnly).toBe(false);
      expect(crag?.maxHeightM).toBe(20);

      const unknown = getPsicoblocCragById('non-existent');
      expect(unknown).toBeUndefined();
    });
  });

  describe('safety kit checklist', () => {
    it('returns all 6 mandatory safety gear items', () => {
      const gear = getPsicoblocGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('liquid-chalk-water-resistant');
      expect(ids).toContain('quick-drain-climbing-shoes');
      expect(ids).toContain('floating-drybag-chalkbag');
      expect(ids).toContain('weighted-cliff-exit-ladder');
      expect(ids).toContain('high-visibility-swim-buoy');
      expect(ids).toContain('microfiber-chamois-towels');
    });
  });

  describe('calculatePsicobloc', () => {
    it('calculates velocity, minimum safe depth, and approved status for standard safe fall', () => {
      const result = calculatePsicobloc({
        cragId: 'es-pontas-mallorca',
        climbingHeightM: 12,
        waterDepthM: 7,
        swellHeightM: 0.6,
        tideStage: 'high_slack_tide',
        bodyEntryPosition: 'pencil_feet_first_pointed',
      });

      // v = sqrt(2 * 9.81 * 12) = 15.344 -> 15.3 m/s
      // v kmh = 15.3 * 3.6 = 55.08 -> 55.1 km/h
      // minSafeDepthM = 2.5 + 0.3 * 12 = 6.1 m
      // depthClearanceM = 7 - 6.1 = 0.9 m
      expect(result.cragTitle).toBe('Es Pontàs Natural Sea Arch');
      expect(result.impactVelocityMs).toBe(15.3);
      expect(result.impactVelocityKmh).toBe(55.1);
      expect(result.minSafeDepthM).toBe(6.1);
      expect(result.depthClearanceM).toBe(0.9);
      expect(result.safetyStatus).toBe('approved');
      expect(result.entryOrientationSafety).toContain('pencil');
      expect(result.diveAdvisory).toMatch(/approved|safe/i);
    });

    it('flags hazardous_prohibited when water depth is below minimum safe depth', () => {
      const result = calculatePsicobloc({
        cragId: 'cala-barques-cave',
        climbingHeightM: 12,
        waterDepthM: 5.0, // minSafeDepth is 6.1m
        swellHeightM: 0.6,
        tideStage: 'high_slack_tide',
        bodyEntryPosition: 'pencil_feet_first_pointed',
      });

      expect(result.safetyStatus).toBe('hazardous_prohibited');
      expect(result.depthClearanceM).toBe(-1.1);
      expect(result.diveAdvisory).toMatch(/prohibited|depth/i);
    });

    it('flags hazardous_prohibited when body entry position is flat_back_or_belly', () => {
      const result = calculatePsicobloc({
        cragId: 'es-pontas-mallorca',
        climbingHeightM: 10,
        waterDepthM: 10,
        swellHeightM: 0.5,
        tideStage: 'high_slack_tide',
        bodyEntryPosition: 'flat_back_or_belly',
      });

      expect(result.safetyStatus).toBe('hazardous_prohibited');
      expect(result.entryOrientationSafety).toMatch(/trauma|flat/i);
      expect(result.diveAdvisory).toMatch(/prohibited|flat/i);
    });

    it('flags hazardous_prohibited when swell height exceeds 2.0m', () => {
      const result = calculatePsicobloc({
        cragId: 'swanage-conner-cove',
        climbingHeightM: 8,
        waterDepthM: 8,
        swellHeightM: 2.5,
        tideStage: 'high_slack_tide',
        bodyEntryPosition: 'pencil_feet_first_pointed',
      });

      expect(result.safetyStatus).toBe('hazardous_prohibited');
      expect(result.tideSwellSafety).toMatch(/surge|hazard/i);
      expect(result.diveAdvisory).toMatch(/prohibited|swell/i);
    });

    it('flags caution_high_risk when climbing height exceeds 16m', () => {
      const result = calculatePsicobloc({
        cragId: 'es-pontas-mallorca',
        climbingHeightM: 18,
        waterDepthM: 12,
        swellHeightM: 0.5,
        tideStage: 'high_slack_tide',
        bodyEntryPosition: 'pencil_feet_first_pointed',
      });

      expect(result.safetyStatus).toBe('caution_high_risk');
      expect(result.diveAdvisory).toMatch(/high risk|caution/i);
    });

    it('flags caution_high_risk when swell height is between 1.0m and 2.0m', () => {
      const result = calculatePsicobloc({
        cragId: 'railay-tonsai-krabi',
        climbingHeightM: 10,
        waterDepthM: 8,
        swellHeightM: 1.5,
        tideStage: 'mid_flood_tide',
        bodyEntryPosition: 'pencil_feet_first_pointed',
      });

      expect(result.safetyStatus).toBe('caution_high_risk');
    });

    it('flags caution_high_risk when tide stage is low_dead_tide', () => {
      const result = calculatePsicobloc({
        cragId: 'railay-tonsai-krabi',
        climbingHeightM: 10,
        waterDepthM: 8,
        swellHeightM: 0.5,
        tideStage: 'low_dead_tide',
        bodyEntryPosition: 'pencil_feet_first_pointed',
      });

      expect(result.safetyStatus).toBe('caution_high_risk');
    });

    it('handles feet_first_arms_flailing advisory correctly', () => {
      const result = calculatePsicobloc({
        cragId: 'summersville-lake-wv',
        climbingHeightM: 10,
        waterDepthM: 10,
        swellHeightM: 0.3,
        tideStage: 'high_slack_tide',
        bodyEntryPosition: 'feet_first_arms_flailing',
      });

      expect(result.safetyStatus).toBe('approved');
      expect(result.entryOrientationSafety).toMatch(/dislocation|arms/i);
    });

    it('handles unknown cragId fallback smoothly', () => {
      const result = calculatePsicobloc({
        cragId: 'custom-secret-cliff',
        climbingHeightM: 10,
        waterDepthM: 10,
        swellHeightM: 0.5,
        tideStage: 'high_slack_tide',
        bodyEntryPosition: 'pencil_feet_first_pointed',
      });

      expect(result.cragTitle).toBe('Custom Deep Water Soloing Crag');
    });
  });
});
