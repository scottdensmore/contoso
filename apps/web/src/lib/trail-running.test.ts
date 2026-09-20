import { describe, it, expect } from 'vitest';
import {
  getTrailRunRoutes,
  getTrailRunRouteById,
  calculateTrailRunPacing,
  getTrailRunningGear,
  type PacingQuery,
} from './trail-running';

describe('trail-running lib', () => {
  describe('getTrailRunRoutes', () => {
    it('returns all 5 iconic routes when no filter is passed', () => {
      const routes = getTrailRunRoutes();
      expect(routes).toHaveLength(5);
      const ids = routes.map((r) => r.id);
      expect(ids).toContain('enchantments-thru-run');
      expect(ids).toContain('timberline-trail-ultra');
      expect(ids).toContain('wonderland-trail-fastpack');
      expect(ids).toContain('si-mailbox-vertical-double');
      expect(ids).toContain('olympic-coast-wilderness-run');
    });

    it('filters routes correctly by technicalDifficulty', () => {
      const highMountain = getTrailRunRoutes('high_mountain');
      expect(highMountain).toHaveLength(1);
      expect(highMountain[0].id).toBe('wonderland-trail-fastpack');
      expect(highMountain[0].technicalDifficulty).toBe('high_mountain');

      const severe = getTrailRunRoutes('severe_technical');
      expect(severe).toHaveLength(1);
      expect(severe[0].id).toBe('enchantments-thru-run');

      const technical = getTrailRunRoutes('technical');
      expect(technical).toHaveLength(1);
      expect(technical[0].id).toBe('timberline-trail-ultra');

      const scramble = getTrailRunRoutes('steep_scramble');
      expect(scramble).toHaveLength(1);
      expect(scramble[0].id).toBe('si-mailbox-vertical-double');

      const moderate = getTrailRunRoutes('moderate');
      expect(moderate).toHaveLength(1);
      expect(moderate[0].id).toBe('olympic-coast-wilderness-run');
    });
  });

  describe('getTrailRunRouteById', () => {
    it('returns the route when found', () => {
      const route = getTrailRunRouteById('timberline-trail-ultra');
      expect(route).toBeDefined();
      expect(route?.name).toBe('Timberline Trail Around Mt. Hood');
      expect(route?.distanceMiles).toBe(40.2);
      expect(route?.elevationGainFt).toBe(9000);
      expect(route?.elevationLossFt).toBe(9000);
      expect(route?.terrainType).toBe('volcanic_scree');
      expect(route?.waterRefillPoints).toBe(10);
      expect(route?.estimatedFastTimeHrs).toBe(8.5);
      expect(route?.lugDepthMm).toBe(4.5);
    });

    it('returns undefined for nonexistent route id', () => {
      const route = getTrailRunRouteById('non-existent-route');
      expect(route).toBeUndefined();
    });
  });

  describe('getTrailRunningGear', () => {
    it('returns 6 mandatory mountain ultra gear items', () => {
      const gear = getTrailRunningGear();
      expect(gear).toHaveLength(6);
      gear.forEach((item) => {
        expect(item.mandatory).toBe(true);
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.notes).toBeTruthy();
        expect(['hydration', 'protection', 'traction', 'nutrition', 'first_aid']).toContain(
          item.category
        );
      });

      const names = gear.map((g) => g.name);
      expect(names).toContain('Hydration vest (min 1.5L capacity)');
      expect(names).toContain('Ultralight emergency bivy / space blanket');
      expect(names).toContain('Running microspikes / traction cleats');
      expect(names).toContain('Waterproof breathable hooded shell (taped seams)');
      expect(names).toContain('High-lumen rechargeable headlamp + emergency spare battery');
      expect(names).toContain('Squeeze water filtration flask + electrolyte tablets');
    });
  });

  describe('calculateTrailRunPacing', () => {
    const baseQuery: PacingQuery = {
      routeId: 'timberline-trail-ultra',
      targetPaceMinMile: 12.0,
      runnerWeightLbs: 150,
      ambientTempF: 65,
    };

    it('calculates pacing result with all expected fields', () => {
      const result = calculateTrailRunPacing(baseQuery);
      expect(result.estimatedTimeHours).toBeGreaterThan(0);
      expect(result.totalCaloriesKcal).toBeGreaterThan(0);
      expect(result.hourlyCarbsGrams).toBeGreaterThan(0);
      expect(result.fluidLitersTotal).toBeGreaterThan(0);
      expect(result.electrolytesMgHourly).toBeGreaterThan(0);
      expect(result.hydrationVestMinCapacityL).toBeGreaterThanOrEqual(1.5);
      expect(result.pacingSplits.length).toBeGreaterThanOrEqual(4);
    });

    it('adjusts estimated time and calories for elevation gain', () => {
      // Compare Olympic Coast (17.5 mi, 1,200 ft gain) vs Si-Mailbox (16.0 mi, 7,200 ft gain)
      const coastalQuery: PacingQuery = {
        routeId: 'olympic-coast-wilderness-run',
        targetPaceMinMile: 12.0,
        runnerWeightLbs: 150,
        ambientTempF: 65,
      };
      const siQuery: PacingQuery = {
        routeId: 'si-mailbox-vertical-double',
        targetPaceMinMile: 12.0,
        runnerWeightLbs: 150,
        ambientTempF: 65,
      };

      const coastalResult = calculateTrailRunPacing(coastalQuery);
      const siResult = calculateTrailRunPacing(siQuery);

      // Even though Si is slightly shorter distance, the 7,200ft vert adds significant climbing time and calorie burn
      expect(siResult.estimatedTimeHours).toBeGreaterThan(coastalResult.estimatedTimeHours);
      expect(siResult.totalCaloriesKcal).toBeGreaterThan(coastalResult.totalCaloriesKcal);
    });

    it('adjusts caloric burn and fluid needs for runner weight', () => {
      const lightRunner: PacingQuery = { ...baseQuery, runnerWeightLbs: 130 };
      const heavyRunner: PacingQuery = { ...baseQuery, runnerWeightLbs: 190 };

      const lightResult = calculateTrailRunPacing(lightRunner);
      const heavyResult = calculateTrailRunPacing(heavyRunner);

      expect(heavyResult.totalCaloriesKcal).toBeGreaterThan(lightResult.totalCaloriesKcal);
      expect(heavyResult.fluidLitersTotal).toBeGreaterThan(lightResult.fluidLitersTotal);
    });

    it('adjusts fluid and electrolyte targets for ambient temperature', () => {
      const coolQuery: PacingQuery = { ...baseQuery, ambientTempF: 50 };
      const hotQuery: PacingQuery = { ...baseQuery, ambientTempF: 85 };

      const coolResult = calculateTrailRunPacing(coolQuery);
      const hotResult = calculateTrailRunPacing(hotQuery);

      expect(hotResult.fluidLitersTotal).toBeGreaterThan(coolResult.fluidLitersTotal);
      expect(hotResult.electrolytesMgHourly).toBeGreaterThan(coolResult.electrolytesMgHourly);
    });

    it('throws error when routeId is invalid', () => {
      expect(() =>
        calculateTrailRunPacing({
          ...baseQuery,
          routeId: 'non-existent-route',
        })
      ).toThrowError(/not found/i);
    });
  });
});
