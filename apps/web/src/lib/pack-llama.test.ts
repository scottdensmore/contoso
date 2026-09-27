import { describe, it, expect } from 'vitest';
import {
  getPackLlamaRoutes,
  getPackLlamaRouteById,
  calculatePackLlamaPayload,
  getPackLlamaGearChecklist,
  type PackLlamaQuery,
} from './pack-llama';

describe('Pack Llama Library', () => {
  describe('getPackLlamaRoutes', () => {
    it('returns all 5 iconic wilderness pack-llama routes when no filter is provided', () => {
      const routes = getPackLlamaRoutes();
      expect(routes).toHaveLength(5);
      expect(routes.map((r) => r.id)).toEqual([
        'high-sierra-bishop-pass',
        'wind-river-cirque-towers',
        'san-juan-weminuche-pass',
        'pasayten-boundary-trail',
        'uinta-four-lakes-basin',
      ]);
    });

    it('filters routes by saddle rigging', () => {
      const woodRoutes = getPackLlamaRoutes('wood_crossbuck_pack');
      expect(woodRoutes).toHaveLength(2);
      expect(woodRoutes.map((r) => r.id)).toEqual([
        'high-sierra-bishop-pass',
        'pasayten-boundary-trail',
      ]);

      const deckerRoutes = getPackLlamaRoutes('decker_cinch_pack');
      expect(deckerRoutes).toHaveLength(1);
      expect(deckerRoutes[0].id).toBe('san-juan-weminuche-pass');

      const fiberglassRoutes = getPackLlamaRoutes('articulated_fiberglass_tree');
      expect(fiberglassRoutes).toHaveLength(2);
      expect(fiberglassRoutes.map((r) => r.id)).toEqual([
        'wind-river-cirque-towers',
        'uinta-four-lakes-basin',
      ]);
    });
  });

  describe('getPackLlamaRouteById', () => {
    it('returns the route with matching id', () => {
      const route = getPackLlamaRouteById('high-sierra-bishop-pass');
      expect(route).toBeDefined();
      expect(route?.title).toBe('High Sierra Bishop Pass & Dusy Basin Llama Trek');
      expect(route?.wildernessArea).toBe('John Muir Wilderness');
      expect(route?.nationalForest).toBe('Inyo National Forest, CA, USA');
      expect(route?.elevationMeters).toBe(3650);
      expect(route?.saddleRigging).toBe('wood_crossbuck_pack');
      expect(route?.maxStringLlamas).toBe(4);
      expect(route?.typicalDays).toBe(5);
      expect(route?.highlights).toContain('Granite switchback agility');
    });

    it('returns undefined for non-existent route id', () => {
      expect(getPackLlamaRouteById('non-existent-route')).toBeUndefined();
    });
  });

  describe('getPackLlamaGearChecklist', () => {
    it('returns all 6 mandatory pack-llama safety & tack checklist items', () => {
      const gear = getPackLlamaGearChecklist();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);
      expect(gear.map((item) => item.id)).toEqual([
        'padded-llama-pack-saddle',
        'highline-tree-savers-swivels',
        'dual-side-balanced-panniers',
        'breakaway-lead-and-halter',
        'llama-hoof-shears-styptic',
        'bear-resistant-food-canisters',
      ]);
    });
  });

  describe('calculatePackLlamaPayload', () => {
    it('calculates default payload with perfect balance and optimal working capacity', () => {
      const query: PackLlamaQuery = {
        routeId: 'high-sierra-bishop-pass',
        saddleRigging: 'wood_crossbuck_pack',
        llamaBodyWeightLbs: 360,
        leftPannierLbs: 32,
        rightPannierLbs: 32,
        saddlePadWeightLbs: 12,
        trailElevationMeters: 3200,
      };

      const result = calculatePackLlamaPayload(query);
      // total = 32 + 32 + 12 = 76 lbs
      expect(result.totalPayloadLbs).toBe(76);
      // percentage = Math.round((76 / 360) * 1000) / 10 = 21.1%
      expect(result.payloadPercentage).toBe(21.1);
      // diff = |32 - 32| = 0
      expect(result.weightDifferenceLbs).toBe(0);
      expect(result.balanceStatus).toBe('perfect_balance');
      expect(result.capacityStatus).toBe('optimal_working_capacity');
      expect(result.highlineSpacingMeters).toBe(3.5);
      // water = Math.round((360 * 0.0055) * 10) / 10 = 2.0 gal
      expect(result.dailyWaterEstimateGal).toBe(2.0);
      expect(result.riggingAdvisory).toContain('Perfect balance');
      expect(result.trailEtiquetteGuidance).toContain('3.5m spacing');
    });

    it('identifies light cruising load when percentage <= 18.0%', () => {
      const query: PackLlamaQuery = {
        routeId: 'pasayten-boundary-trail',
        saddleRigging: 'wood_crossbuck_pack',
        llamaBodyWeightLbs: 400,
        leftPannierLbs: 25,
        rightPannierLbs: 25,
        saddlePadWeightLbs: 10,
        trailElevationMeters: 2200,
      };

      const result = calculatePackLlamaPayload(query);
      // total = 25 + 25 + 10 = 60 lbs
      expect(result.totalPayloadLbs).toBe(60);
      // percentage = (60 / 400) * 100 = 15.0%
      expect(result.payloadPercentage).toBe(15.0);
      expect(result.capacityStatus).toBe('light_cruising_load');
    });

    it('identifies acceptable balance when diff is between 1.6 and 3.5 lbs', () => {
      const query: PackLlamaQuery = {
        routeId: 'san-juan-weminuche-pass',
        saddleRigging: 'decker_cinch_pack',
        llamaBodyWeightLbs: 380,
        leftPannierLbs: 33,
        rightPannierLbs: 30,
        saddlePadWeightLbs: 14,
        trailElevationMeters: 3800,
      };

      const result = calculatePackLlamaPayload(query);
      // diff = |33 - 30| = 3 lbs (<= 3.5) -> acceptable_balance
      expect(result.weightDifferenceLbs).toBe(3);
      expect(result.balanceStatus).toBe('acceptable_balance');
      expect(result.riggingAdvisory).toContain('Acceptable balance');
    });

    it('identifies unbalanced girth gall risk and overloaded spine strain when thresholds are exceeded', () => {
      const query: PackLlamaQuery = {
        routeId: 'wind-river-cirque-towers',
        saddleRigging: 'articulated_fiberglass_tree',
        llamaBodyWeightLbs: 320,
        leftPannierLbs: 44,
        rightPannierLbs: 30,
        saddlePadWeightLbs: 16,
        trailElevationMeters: 3250,
      };

      const result = calculatePackLlamaPayload(query);
      // total = 44 + 30 + 16 = 90 lbs
      expect(result.totalPayloadLbs).toBe(90);
      // percentage = Math.round((90 / 320) * 1000) / 10 = 28.1% (> 25.0%)
      expect(result.payloadPercentage).toBe(28.1);
      expect(result.capacityStatus).toBe('overloaded_spine_strain');
      // diff = |44 - 30| = 14 lbs (> 3.5 lbs)
      expect(result.weightDifferenceLbs).toBe(14);
      expect(result.balanceStatus).toBe('unbalanced_girth_gall_risk');
      expect(result.riggingAdvisory).toMatch(/warning.*girth gall/i);
    });
  });
});
