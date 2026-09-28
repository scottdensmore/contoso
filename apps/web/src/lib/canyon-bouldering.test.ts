import { describe, it, expect } from 'vitest';
import {
  getCanyonBoulderingSectors,
  getCanyonBoulderingSectorById,
  calculateBoulderingDynamics,
  getCanyonBoulderingGear,
} from './canyon-bouldering';

describe('canyon-bouldering lib', () => {
  describe('getCanyonBoulderingSectors', () => {
    it('returns all 5 canyon bouldering sectors when no style is specified', () => {
      const sectors = getCanyonBoulderingSectors();
      expect(sectors).toHaveLength(5);
      const ids = sectors.map((s) => s.id);
      expect(ids).toContain('buttermilks-peabody-highballs');
      expect(ids).toContain('joes-valley-straight-canyon');
      expect(ids).toContain('red-rock-kraft-boulders');
      expect(ids).toContain('rocktown-pigeon-mountain');
      expect(ids).toContain('hueco-tanks-north-mountain');
    });

    it('filters sectors by boulderingStyle', () => {
      const highballs = getCanyonBoulderingSectors('highball_sandstone_pinnacle');
      expect(highballs).toHaveLength(1);
      expect(highballs[0].id).toBe('buttermilks-peabody-highballs');

      const roofs = getCanyonBoulderingSectors('overhung_canyon_roof');
      expect(roofs).toHaveLength(2);
      const roofIds = roofs.map((r) => r.id);
      expect(roofIds).toContain('joes-valley-straight-canyon');
      expect(roofIds).toContain('rocktown-pigeon-mountain');

      const slabs = getCanyonBoulderingSectors('technical_arete_slab');
      expect(slabs).toHaveLength(1);
      expect(slabs[0].id).toBe('red-rock-kraft-boulders');

      const crimps = getCanyonBoulderingSectors('crimpy_canyon_face');
      expect(crimps).toHaveLength(1);
      expect(crimps[0].id).toBe('hueco-tanks-north-mountain');
    });
  });

  describe('getCanyonBoulderingSectorById', () => {
    it('finds existing sector by id', () => {
      const sector = getCanyonBoulderingSectorById('buttermilks-peabody-highballs');
      expect(sector).toBeDefined();
      expect(sector?.title).toBe('Buttermilks Peabody Highball Boulders');
      expect(sector?.maxBoulderHeightM).toBe(14.0);
      expect(sector?.vGradeRange).toBe('V4 - V11');
      expect(sector?.boulderingStyle).toBe('highball_sandstone_pinnacle');
      expect(sector?.landingHazard).toBe('sloping_rock_shelf');
      expect(sector?.highlights).toContain('Grandpa Peabody massive 45-foot face');
    });

    it('returns undefined for non-existent sector', () => {
      const sector = getCanyonBoulderingSectorById('non-existent-sector');
      expect(sector).toBeUndefined();
    });
  });

  describe('calculateBoulderingDynamics', () => {
    it('calculates impact energy and pad coverage for default parameters', () => {
      const result = calculateBoulderingDynamics({
        sectorId: 'buttermilks-peabody-highballs',
        fallHeightM: 6.5,
        climberWeightKg: 72,
        crashPadsCount: 3,
        spottersCount: 2,
      });

      // 72 * 9.81 * 6.5 = 4591.08 -> Math.round = 4591
      expect(result.impactEnergyJoules).toBe(4591);
      // crashPadsCount / (fallHeightM > 8 ? 5 : 3) -> 3 / 3 = 100%
      expect(result.padCoverageAdequacyPercent).toBe(100);
      // fallHeightM <= 9, and crashPadsCount >= 2 && spottersCount >= 1 -> safe_cushioned_drop
      expect(result.fallHazardRating).toBe('safe_cushioned_drop');
      expect(result.sectorTitle).toBe('Buttermilks Peabody Highball Boulders');
      expect(result.boulderingStyle).toBe('highball_sandstone_pinnacle');
      expect(result.landingHazard).toBe('sloping_rock_shelf');
      expect(result.spottingRecommendation).toBeDefined();
      expect(result.padLayoutAdvisory).toBeDefined();
    });

    it('identifies hazardous_highball_groundfall_risk when fall height > 9m and crash pads < 4', () => {
      const result = calculateBoulderingDynamics({
        sectorId: 'buttermilks-peabody-highballs',
        fallHeightM: 12,
        climberWeightKg: 75,
        crashPadsCount: 2,
        spottersCount: 2,
      });

      // 75 * 9.81 * 12 = 8829
      expect(result.impactEnergyJoules).toBe(8829);
      // 2 / 5 * 100 = 40%
      expect(result.padCoverageAdequacyPercent).toBe(40);
      expect(result.fallHazardRating).toBe('hazardous_highball_groundfall_risk');
    });

    it('identifies caution_multiple_pads_spotter_required when fall height > 5m and insufficient pads or spotters', () => {
      const resultInsufficientPads = calculateBoulderingDynamics({
        sectorId: 'joes-valley-straight-canyon',
        fallHeightM: 7,
        climberWeightKg: 70,
        crashPadsCount: 1,
        spottersCount: 2,
      });
      expect(resultInsufficientPads.fallHazardRating).toBe('caution_multiple_pads_spotter_required');

      const resultInsufficientSpotters = calculateBoulderingDynamics({
        sectorId: 'joes-valley-straight-canyon',
        fallHeightM: 7,
        climberWeightKg: 70,
        crashPadsCount: 3,
        spottersCount: 0,
      });
      expect(resultInsufficientSpotters.fallHazardRating).toBe('caution_multiple_pads_spotter_required');
    });

    it('identifies safe_cushioned_drop when low fall height or sufficient protection', () => {
      const lowFall = calculateBoulderingDynamics({
        sectorId: 'red-rock-kraft-boulders',
        fallHeightM: 3,
        climberWeightKg: 70,
        crashPadsCount: 4,
        spottersCount: 2,
      });
      expect(lowFall.fallHazardRating).toBe('safe_cushioned_drop');
    });

    it('caps pad coverage adequacy at 100%', () => {
      const result = calculateBoulderingDynamics({
        sectorId: 'rocktown-pigeon-mountain',
        fallHeightM: 4,
        climberWeightKg: 70,
        crashPadsCount: 6,
        spottersCount: 2,
      });
      // 6 / 3 * 100 = 200, capped at 100
      expect(result.padCoverageAdequacyPercent).toBe(100);
    });
  });

  describe('getCanyonBoulderingGear', () => {
    it('returns the mandatory 6-item gear checklist', () => {
      const gear = getCanyonBoulderingGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toEqual([
        'triple-density-highball-crash-pad',
        'modular-hinge-blubber-pad',
        'boars-hair-telescoping-brush',
        'ergonomic-spotting-boulder-gloves',
        'heavy-duty-drag-tarp',
        'skin-repair-finger-tape-balm',
      ]);
    });
  });
});
