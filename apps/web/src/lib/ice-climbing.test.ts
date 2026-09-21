import { describe, it, expect } from 'vitest';
import {
  getIceClimbingRoutes,
  getIceClimbingRouteById,
  getIceClimbingGear,
  calculateIceRiggingPlan,
  type IceRiggingQuery,
} from './ice-climbing';

describe('Ice Climbing Domain Logic', () => {
  describe('Ice Climbing Routes Catalog', () => {
    it('returns all 5 iconic ice climbing routes', () => {
      const routes = getIceClimbingRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toContain('ouray-ice-park-pic-of-the-vic');
      expect(ids).toContain('hyalite-canyon-genesis-ii');
      expect(ids).toContain('canmore-weeping-wall-lower');
      expect(ids).toContain('lake-willoughby-promised-land');
      expect(ids).toContain('vail-amphitheater-fang');
    });

    it('filters routes by ice grade', () => {
      const wi3 = getIceClimbingRoutes('wi3_intermediate');
      expect(wi3).toHaveLength(1);
      expect(wi3[0].id).toBe('ouray-ice-park-pic-of-the-vic');

      const wi4 = getIceClimbingRoutes('wi4_advanced');
      expect(wi4).toHaveLength(2);
      expect(wi4.map((r) => r.id)).toEqual(
        expect.arrayContaining(['hyalite-canyon-genesis-ii', 'canmore-weeping-wall-lower'])
      );

      const wi5 = getIceClimbingRoutes('wi5_expert');
      expect(wi5).toHaveLength(1);
      expect(wi5[0].id).toBe('lake-willoughby-promised-land');

      const wi6 = getIceClimbingRoutes('wi6_extreme');
      expect(wi6).toHaveLength(1);
      expect(wi6[0].id).toBe('vail-amphitheater-fang');
    });

    it('finds a route by id', () => {
      const ouray = getIceClimbingRouteById('ouray-ice-park-pic-of-the-vic');
      expect(ouray).toBeDefined();
      expect(ouray?.title).toBe('Pic of the Vic & Upper Bridge Area');
      expect(ouray?.region).toBe('Ouray Ice Park, Ouray, CO');
      expect(ouray?.pitches).toBe(2);
      expect(ouray?.lengthM).toBe(45);
      expect(ouray?.iceGrade).toBe('wi3_intermediate');
      expect(ouray?.elevationM).toBe(2400);
      expect(ouray?.iceStructure).toBe('plastic_water_ice');
      expect(ouray?.typicalDurationHours).toBe(2.5);
      expect(ouray?.vThreadAnchorStandard).toBe(true);

      const nonexistent = getIceClimbingRouteById('non-existent');
      expect(nonexistent).toBeUndefined();
    });

    it('has accurate specs and highlights for each route', () => {
      const hyalite = getIceClimbingRouteById('hyalite-canyon-genesis-ii');
      expect(hyalite?.pitches).toBe(3);
      expect(hyalite?.lengthM).toBe(85);
      expect(hyalite?.iceStructure).toBe('brittle_bullet_ice');
      expect(hyalite?.highlights).toContain('Sustained 80-degree ice wall');

      const canmore = getIceClimbingRouteById('canmore-weeping-wall-lower');
      expect(canmore?.pitches).toBe(4);
      expect(canmore?.lengthM).toBe(160);
      expect(canmore?.elevationM).toBe(1950);
      expect(canmore?.highlights).toContain('Vast 500-foot ice shield');

      const willoughby = getIceClimbingRouteById('lake-willoughby-promised-land');
      expect(willoughby?.pitches).toBe(3);
      expect(willoughby?.lengthM).toBe(110);
      expect(willoughby?.iceGrade).toBe('wi5_expert');
      expect(willoughby?.highlights).toContain('High-angle columnar ice pillars');

      const vail = getIceClimbingRouteById('vail-amphitheater-fang');
      expect(vail?.pitches).toBe(1);
      expect(vail?.lengthM).toBe(35);
      expect(vail?.iceGrade).toBe('wi6_extreme');
      expect(vail?.highlights).toContain('Legendary free-standing vertical ice pillar');
    });
  });

  describe('Mandatory Ice Climbing Safety Kit Checklist', () => {
    it('returns the 6 mandatory ice climbing gear items', () => {
      const gear = getIceClimbingGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('technical-ice-tools');
      expect(ids).toContain('mono-dual-point-crampons');
      expect(ids).toContain('ice-screw-rack');
      expect(ids).toContain('v-thread-hooker-cord');
      expect(ids).toContain('insulated-mountaineering-boots');
      expect(ids).toContain('ice-climbing-helmet-visor');

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('tools');
      expect(categories).toContain('crampons');
      expect(categories).toContain('protection');
      expect(categories).toContain('anchor');
      expect(categories).toContain('footwear');
      expect(categories).toContain('safety');
    });
  });

  describe('Ice Screw Rigging & Anchor Load Calculator', () => {
    it('calculates approved anchor and holding force for dual equalized screws in plastic ice', () => {
      const query: IceRiggingQuery = {
        routeId: 'ouray-ice-park-pic-of-the-vic',
        iceTemperatureF: 20,
        iceThicknessCm: 25,
        screwLengthCm: 19,
        screwPlacementAngleDeg: 100,
        anchorType: 'dual_screw_equalized',
      };

      const result = calculateIceRiggingPlan(query);

      expect(result.routeTitle).toBe('Pic of the Vic & Upper Bridge Area');
      expect(result.iceGrade).toBe('wi3_intermediate');
      expect(result.iceQualityRating).toContain('Dense hero ice');
      expect(result.safetyStatus).toBe('approved');
      expect(result.estimatedHoldingForceKn).toBeGreaterThanOrEqual(16);
      expect(result.vThreadSuitable).toBe(true);
      expect(result.temperatureAdvisory).toContain('Optimal');
      expect(result.riggingRecommendation).toContain('staggered');
    });

    it('evaluates Abalakov V-thread suitability when criteria are met', () => {
      const query: IceRiggingQuery = {
        routeId: 'hyalite-canyon-genesis-ii',
        iceTemperatureF: 18,
        iceThicknessCm: 25,
        screwLengthCm: 22,
        screwPlacementAngleDeg: 100,
        anchorType: 'v_thread_abalakov',
      };

      const result = calculateIceRiggingPlan(query);
      expect(result.safetyStatus).toBe('approved');
      expect(result.vThreadSuitable).toBe(true);
      expect(result.riggingRecommendation).toContain('Abalakov V-thread');
      expect(result.estimatedHoldingForceKn).toBeGreaterThan(12);
    });

    it('flags caution conditions and marks vThread unsuitable if screw is too short for V-thread', () => {
      const query: IceRiggingQuery = {
        routeId: 'hyalite-canyon-genesis-ii',
        iceTemperatureF: 18,
        iceThicknessCm: 25,
        screwLengthCm: 13,
        screwPlacementAngleDeg: 100,
        anchorType: 'v_thread_abalakov',
      };

      const result = calculateIceRiggingPlan(query);
      expect(result.safetyStatus).toBe('caution_conditions');
      expect(result.vThreadSuitable).toBe(false);
      expect(result.riggingRecommendation).toContain('insufficient');
    });

    it('flags hazardous melting risk when ice temperature exceeds 32°F', () => {
      const query: IceRiggingQuery = {
        routeId: 'ouray-ice-park-pic-of-the-vic',
        iceTemperatureF: 36,
        iceThicknessCm: 25,
        screwLengthCm: 19,
        screwPlacementAngleDeg: 100,
        anchorType: 'dual_screw_equalized',
      };

      const result = calculateIceRiggingPlan(query);
      expect(result.safetyStatus).toBe('hazardous_thin_or_melting');
      expect(result.iceQualityRating).toContain('Wet melting risk');
      expect(result.temperatureAdvisory).toContain('Melting');
      expect(result.estimatedHoldingForceKn).toBeLessThan(12);
    });

    it('flags brittle shattering risk and caution status when temperature is below 10°F', () => {
      const query: IceRiggingQuery = {
        routeId: 'canmore-weeping-wall-lower',
        iceTemperatureF: 2,
        iceThicknessCm: 30,
        screwLengthCm: 19,
        screwPlacementAngleDeg: 100,
        anchorType: 'dual_screw_equalized',
      };

      const result = calculateIceRiggingPlan(query);
      expect(result.safetyStatus).toBe('caution_conditions');
      expect(result.iceQualityRating).toContain('Brittle shattering risk');
      expect(result.temperatureAdvisory).toContain('fracturing');
    });

    it('flags hazardous thin ice when ice thickness is under 12cm', () => {
      const query: IceRiggingQuery = {
        routeId: 'lake-willoughby-promised-land',
        iceTemperatureF: 20,
        iceThicknessCm: 8,
        screwLengthCm: 16,
        screwPlacementAngleDeg: 100,
        anchorType: 'dual_screw_equalized',
      };

      const result = calculateIceRiggingPlan(query);
      expect(result.safetyStatus).toBe('hazardous_thin_or_melting');
      expect(result.estimatedHoldingForceKn).toBeLessThan(9);
    });

    it('rejects single screw bail as an approved belay anchor and issues warning', () => {
      const query: IceRiggingQuery = {
        routeId: 'vail-amphitheater-fang',
        iceTemperatureF: 20,
        iceThicknessCm: 25,
        screwLengthCm: 19,
        screwPlacementAngleDeg: 100,
        anchorType: 'single_screw_bail',
      };

      const result = calculateIceRiggingPlan(query);
      expect(result.safetyStatus).not.toBe('approved');
      expect(result.safetyStatus).toBe('caution_conditions');
      expect(result.riggingRecommendation).toContain('WARNING: Single screw');
      expect(result.estimatedHoldingForceKn).toBeLessThan(14);
    });

    it('accounts for screw placement angle with 100 degrees yielding optimal holding force', () => {
      const queryOptimal: IceRiggingQuery = {
        routeId: 'ouray-ice-park-pic-of-the-vic',
        iceTemperatureF: 20,
        iceThicknessCm: 30,
        screwLengthCm: 19,
        screwPlacementAngleDeg: 100,
        anchorType: 'dual_screw_equalized',
      };

      const queryPerpendicular: IceRiggingQuery = {
        ...queryOptimal,
        screwPlacementAngleDeg: 90,
      };

      const resOptimal = calculateIceRiggingPlan(queryOptimal);
      const resPerpendicular = calculateIceRiggingPlan(queryPerpendicular);

      expect(resOptimal.estimatedHoldingForceKn).toBeGreaterThan(
        resPerpendicular.estimatedHoldingForceKn
      );
    });

    it('throws error when routeId is not found', () => {
      const query: IceRiggingQuery = {
        routeId: 'unknown-ice-route',
        iceTemperatureF: 20,
        iceThicknessCm: 25,
        screwLengthCm: 19,
        screwPlacementAngleDeg: 100,
        anchorType: 'dual_screw_equalized',
      };

      expect(() => calculateIceRiggingPlan(query)).toThrow(/not found/i);
    });
  });
});
