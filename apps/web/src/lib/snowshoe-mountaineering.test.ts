import { describe, it, expect } from 'vitest';
import {
  SNOWSHOE_ROUTES,
  SNOWSHOE_GEAR,
  getSnowshoeRoutes,
  getSnowshoeRouteById,
  getSnowshoeGear,
  calculateSnowshoeAscent,
  type SnowshoeQuery,
} from './snowshoe-mountaineering';

describe('Snowshoe Mountaineering Library', () => {
  describe('Catalog & Route Retrieval', () => {
    it('returns all 5 iconic alpine snowshoe routes when no filter is provided', () => {
      const routes = getSnowshoeRoutes();
      expect(routes).toHaveLength(5);
      expect(routes.map((r) => r.id)).toEqual([
        'mount-washington-tuckerman-ridge',
        'mount-rainier-muir-snowfield',
        'rocky-mountain-bear-lake-flattop',
        'mount-shasta-avalanche-gulch',
        'san-juan-red-mountain-pass',
      ]);
    });

    it('filters routes correctly by technical grade', () => {
      const steepAlpine = getSnowshoeRoutes('steep_alpine');
      expect(steepAlpine).toHaveLength(2);
      expect(steepAlpine.map((r) => r.id)).toEqual([
        'mount-washington-tuckerman-ridge',
        'san-juan-red-mountain-pass',
      ]);

      const glaciated = getSnowshoeRoutes('glaciated_high_altitude');
      expect(glaciated).toHaveLength(1);
      expect(glaciated[0].id).toBe('mount-rainier-muir-snowfield');

      const alpineRidge = getSnowshoeRoutes('alpine_ridge');
      expect(alpineRidge).toHaveLength(1);
      expect(alpineRidge[0].id).toBe('rocky-mountain-bear-lake-flattop');

      const extremeVolcanic = getSnowshoeRoutes('extreme_volcanic');
      expect(extremeVolcanic).toHaveLength(1);
      expect(extremeVolcanic[0].id).toBe('mount-shasta-avalanche-gulch');
    });

    it('retrieves route by ID or returns undefined for unknown ID', () => {
      const rainier = getSnowshoeRouteById('mount-rainier-muir-snowfield');
      expect(rainier).toBeDefined();
      expect(rainier?.title).toBe('Mount Rainier Camp Muir Winter Route');
      expect(rainier?.summitElevationM).toBe(3072);
      expect(rainier?.routeLengthKm).toBe(14.5);
      expect(rainier?.maxSlopeDeg).toBe(28);

      const unknown = getSnowshoeRouteById('unknown-route');
      expect(unknown).toBeUndefined();
    });

    it('has valid route structure with highlights and specs', () => {
      for (const route of SNOWSHOE_ROUTES) {
        expect(route.id).toBeTruthy();
        expect(route.title).toBeTruthy();
        expect(route.mountainRange).toBeTruthy();
        expect(route.region).toBeTruthy();
        expect(route.summitElevationM).toBeGreaterThan(0);
        expect(route.routeLengthKm).toBeGreaterThan(0);
        expect(route.maxSlopeDeg).toBeGreaterThan(0);
        expect(route.description).toBeTruthy();
        expect(route.highlights.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('Mandatory Snowshoe Mountaineering Safety Kit', () => {
    it('returns exactly 6 mandatory gear items with expected categories', () => {
      const gear = getSnowshoeGear();
      expect(gear).toHaveLength(6);
      expect(gear).toEqual(SNOWSHOE_GEAR);

      const expectedIds = [
        'serrated-side-rail-snowshoes',
        'modular-flotation-tails',
        'technical-telescoping-poles',
        'insulated-gaiters-crampon-shield',
        'avalanche-safety-trio',
        'emergency-ice-axe-hybrid',
      ];
      expect(gear.map((g) => g.id)).toEqual(expectedIds);

      gear.forEach((item) => {
        expect(item.mandatory).toBe(true);
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
      });

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('traction');
      expect(categories).toContain('flotation');
      expect(categories).toContain('poles');
      expect(categories).toContain('protection');
      expect(categories).toContain('avalanche_safety');
      expect(categories).toContain('ice_axe');
    });
  });

  describe('Calculator Engine & Mathematical Logic', () => {
    it('calculates standard deck flotation when payload and snowpack are within thresholds', () => {
      const query: SnowshoeQuery = {
        routeId: 'mount-rainier-muir-snowfield',
        snowpack: 'windslab_crust',
        slopeAngleDeg: 26,
        payloadLbs: 200,
        heelLifterEngaged: true,
      };

      const result = calculateSnowshoeAscent(query);
      expect(result.routeTitle).toBe('Mount Rainier Camp Muir Winter Route');
      expect(result.tailsRequired).toBe(false);
      expect(result.flotationStatus).toBe('Standard Deck Surface Flotation Sufficient');
      expect(result.calfStrainReductionPercent).toBe(35);
      expect(result.tractionStatus).toBe('optimal_snowshoe_ascent');
      expect(result.advisory).toBeTruthy();
    });

    it('requires flotation tails when payload exceeds 210 lbs on normal snowpack', () => {
      const query: SnowshoeQuery = {
        routeId: 'mount-rainier-muir-snowfield',
        snowpack: 'windslab_crust',
        slopeAngleDeg: 26,
        payloadLbs: 215,
        heelLifterEngaged: true,
      };

      const result = calculateSnowshoeAscent(query);
      expect(result.tailsRequired).toBe(true);
      expect(result.flotationStatus).toBe(
        'Tails Required (5-Inch Modular Extensions Recommended)',
      );
    });

    it('requires flotation tails in deep powder when payload exceeds 175 lbs', () => {
      const lowQuery: SnowshoeQuery = {
        routeId: 'san-juan-red-mountain-pass',
        snowpack: 'deep_powder',
        slopeAngleDeg: 20,
        payloadLbs: 170,
        heelLifterEngaged: true,
      };
      const lowResult = calculateSnowshoeAscent(lowQuery);
      expect(lowResult.tailsRequired).toBe(false);

      const highQuery: SnowshoeQuery = {
        routeId: 'san-juan-red-mountain-pass',
        snowpack: 'deep_powder',
        slopeAngleDeg: 20,
        payloadLbs: 180,
        heelLifterEngaged: true,
      };
      const highResult = calculateSnowshoeAscent(highQuery);
      expect(highResult.tailsRequired).toBe(true);
      expect(highResult.flotationStatus).toBe(
        'Tails Required (5-Inch Modular Extensions Recommended)',
      );
    });

    it('calculates Televator heel-lifter calf fatigue reduction percentage correctly', () => {
      // slope >= 15 with lifter engaged -> 35%
      const engagedSteep = calculateSnowshoeAscent({
        routeId: 'rocky-mountain-bear-lake-flattop',
        snowpack: 'windslab_crust',
        slopeAngleDeg: 15,
        payloadLbs: 200,
        heelLifterEngaged: true,
      });
      expect(engagedSteep.calfStrainReductionPercent).toBe(35);

      // slope >= 15 without lifter engaged -> 0%
      const disengagedSteep = calculateSnowshoeAscent({
        routeId: 'rocky-mountain-bear-lake-flattop',
        snowpack: 'windslab_crust',
        slopeAngleDeg: 25,
        payloadLbs: 200,
        heelLifterEngaged: false,
      });
      expect(disengagedSteep.calfStrainReductionPercent).toBe(0);

      // slope < 15 with lifter engaged -> 0%
      const engagedFlats = calculateSnowshoeAscent({
        routeId: 'rocky-mountain-bear-lake-flattop',
        snowpack: 'windslab_crust',
        slopeAngleDeg: 14,
        payloadLbs: 200,
        heelLifterEngaged: true,
      });
      expect(engagedFlats.calfStrainReductionPercent).toBe(0);
    });

    it('evaluates traction safety thresholds: optimal, caution, and hazardous transition to crampons', () => {
      // slope <= 32 on non-ice -> optimal_snowshoe_ascent
      const optimal = calculateSnowshoeAscent({
        routeId: 'mount-rainier-muir-snowfield',
        snowpack: 'spring_firn',
        slopeAngleDeg: 28,
        payloadLbs: 190,
        heelLifterEngaged: true,
      });
      expect(optimal.tractionStatus).toBe('optimal_snowshoe_ascent');

      // 33 <= slope <= 38 -> caution_steep_edging_required
      const cautionLow = calculateSnowshoeAscent({
        routeId: 'san-juan-red-mountain-pass',
        snowpack: 'windslab_crust',
        slopeAngleDeg: 33,
        payloadLbs: 200,
        heelLifterEngaged: true,
      });
      expect(cautionLow.tractionStatus).toBe('caution_steep_edging_required');

      const cautionHigh = calculateSnowshoeAscent({
        routeId: 'mount-washington-tuckerman-ridge',
        snowpack: 'windslab_crust',
        slopeAngleDeg: 38,
        payloadLbs: 200,
        heelLifterEngaged: true,
      });
      expect(cautionHigh.tractionStatus).toBe('caution_steep_edging_required');

      // slope > 38 -> hazardous_transition_to_crampons_axe
      const hazardousSlope = calculateSnowshoeAscent({
        routeId: 'mount-shasta-avalanche-gulch',
        snowpack: 'windslab_crust',
        slopeAngleDeg: 39,
        payloadLbs: 200,
        heelLifterEngaged: true,
      });
      expect(hazardousSlope.tractionStatus).toBe('hazardous_transition_to_crampons_axe');
      expect(hazardousSlope.advisory).toMatch(/HAZARDOUS/i);

      // boilerplate ice (even on low slope) -> hazardous_transition_to_crampons_axe
      const hazardousIce = calculateSnowshoeAscent({
        routeId: 'mount-washington-tuckerman-ridge',
        snowpack: 'boilerplate_ice',
        slopeAngleDeg: 18,
        payloadLbs: 190,
        heelLifterEngaged: true,
      });
      expect(hazardousIce.tractionStatus).toBe('hazardous_transition_to_crampons_axe');
      expect(hazardousIce.advisory).toMatch(/BOILERPLATE/i);
    });

    it('falls back to default title if routeId is not found', () => {
      const fallbackResult = calculateSnowshoeAscent({
        routeId: 'non-existent',
        snowpack: 'windslab_crust',
        slopeAngleDeg: 25,
        payloadLbs: 200,
        heelLifterEngaged: true,
      });
      expect(fallbackResult.routeTitle).toBe('Alpine Winter Ascent Route');
    });
  });
});
