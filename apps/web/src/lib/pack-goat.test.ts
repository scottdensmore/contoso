import { describe, it, expect } from 'vitest';
import {
  getPackGoatRoutes,
  getPackGoatRouteById,
  calculatePackGoatPayload,
  getPackGoatGearChecklist,
  type PackGoatQuery,
} from './pack-goat';

describe('Pack Goat Library', () => {
  describe('getPackGoatRoutes', () => {
    it('returns all 5 iconic alpine pack-goat trekking routes when no filter is provided', () => {
      const routes = getPackGoatRoutes();
      expect(routes).toHaveLength(5);
      expect(routes.map((r) => r.id)).toEqual([
        'wind-river-titcomb-basin',
        'sawtooth-alice-toxaway',
        'eagle-cap-lakes-basin',
        'uinta-highline-kings-peak',
        'maroon-bells-four-pass',
      ]);
    });

    it('filters routes by saddle rigging', () => {
      const crossbuckRoutes = getPackGoatRoutes('crossbuck_sawbuck');
      expect(crossbuckRoutes).toHaveLength(2);
      expect(crossbuckRoutes.map((r) => r.id)).toEqual([
        'sawtooth-alice-toxaway',
        'maroon-bells-four-pass',
      ]);

      const deckerRoutes = getPackGoatRoutes('decker_soft_pack');
      expect(deckerRoutes).toHaveLength(1);
      expect(deckerRoutes[0].id).toBe('eagle-cap-lakes-basin');

      const flexibleTreeRoutes = getPackGoatRoutes('flexible_tree_harness');
      expect(flexibleTreeRoutes).toHaveLength(2);
      expect(flexibleTreeRoutes.map((r) => r.id)).toEqual([
        'wind-river-titcomb-basin',
        'uinta-highline-kings-peak',
      ]);
    });
  });

  describe('getPackGoatRouteById', () => {
    it('returns the route with matching id', () => {
      const route = getPackGoatRouteById('wind-river-titcomb-basin');
      expect(route).toBeDefined();
      expect(route?.title).toBe('Wind River High Basin & Titcomb Lakes Goat Trek');
      expect(route?.elevationMeters).toBe(3300);
      expect(route?.saddleRigging).toBe('flexible_tree_harness');
      expect(route?.terrainAgility).toBe('granite_talus');
      expect(route?.maxStringGoats).toBe(4);
      expect(route?.typicalDays).toBe(6);
      expect(route?.bighornBufferRequiredM).toBe(200);
    });

    it('returns undefined for non-existent route id', () => {
      expect(getPackGoatRouteById('unknown-route')).toBeUndefined();
    });
  });

  describe('getPackGoatGearChecklist', () => {
    it('returns all 6 mandatory tack & safety checklist items', () => {
      const gear = getPackGoatGearChecklist();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);
      expect(gear.map((item) => item.id)).toEqual([
        'weed-free-certified-forage',
        'high-vis-orange-safety-vest',
        'highline-swivel-tether-kit',
        'hoof-trimming-shears-styptic',
        'crossbuck-saddle-breeching',
        'bear-resistant-pannier-liner',
      ]);
    });
  });

  describe('calculatePackGoatPayload', () => {
    it('calculates perfectly balanced load with optimal light load percentage', () => {
      const query: PackGoatQuery = {
        routeId: 'wind-river-titcomb-basin',
        goatBreed: 'alpine_dairy',
        goatBodyWeightLbs: 200,
        leftPannierLbs: 15,
        rightPannierLbs: 15,
        saddlePadWeightLbs: 6,
        saddleRigging: 'flexible_tree_harness',
      };

      const result = calculatePackGoatPayload(query);
      // total = 15 + 15 + 6 = 36 lbs
      expect(result.totalPayloadLbs).toBe(36);
      // percentage = (36 / 200) * 100 = 18.0%
      expect(result.payloadPercentage).toBe(18.0);
      expect(result.weightDifferenceLbs).toBe(0);
      expect(result.balanceStatus).toBe('perfectly_balanced');
      expect(result.payloadStatus).toBe('optimal_light_load');
      // forage = 200 * 0.015 = 3.0 lbs
      expect(result.recommendedDailyForagePelletsLbs).toBe(3.0);
      expect(result.bighornBufferMeters).toBe(200);
      expect(result.riggingAdvisory).toContain('Perfect balance');
      expect(result.wildlifeMitigationAdvisory).toContain('200m');
    });

    it('identifies acceptable balance and full working capacity', () => {
      const query: PackGoatQuery = {
        routeId: 'sawtooth-alice-toxaway',
        goatBreed: 'saanen_draft',
        goatBodyWeightLbs: 180,
        leftPannierLbs: 20,
        rightPannierLbs: 18,
        saddlePadWeightLbs: 6,
        saddleRigging: 'crossbuck_sawbuck',
      };

      const result = calculatePackGoatPayload(query);
      // total = 20 + 18 + 6 = 44 lbs
      expect(result.totalPayloadLbs).toBe(44);
      // percentage = Math.round((44 / 180) * 1000) / 10 = 24.4%
      expect(result.payloadPercentage).toBe(24.4);
      // diff = 2 lbs (<= 2.5) -> acceptable_balance
      expect(result.weightDifferenceLbs).toBe(2);
      expect(result.balanceStatus).toBe('acceptable_balance');
      expect(result.payloadStatus).toBe('full_working_capacity');
      // forage = 180 * 0.015 = 2.7 lbs
      expect(result.recommendedDailyForagePelletsLbs).toBe(2.7);
      expect(result.bighornBufferMeters).toBe(100);
      expect(result.riggingAdvisory).toContain('Acceptable balance');
    });

    it('identifies unbalanced roll risk when difference exceeds 2.5 lbs and overloaded spinal strain when percentage > 28%', () => {
      const query: PackGoatQuery = {
        routeId: 'uinta-highline-kings-peak',
        goatBreed: 'oberhasli_swiss',
        goatBodyWeightLbs: 160,
        leftPannierLbs: 26,
        rightPannierLbs: 12,
        saddlePadWeightLbs: 10,
        saddleRigging: 'flexible_tree_harness',
      };

      const result = calculatePackGoatPayload(query);
      // total = 26 + 12 + 10 = 48 lbs
      expect(result.totalPayloadLbs).toBe(48);
      // percentage = Math.round((48 / 160) * 1000) / 10 = 30.0%
      expect(result.payloadPercentage).toBe(30.0);
      // diff = 14 lbs (> 2.5) -> unbalanced_roll_risk
      expect(result.weightDifferenceLbs).toBe(14);
      expect(result.balanceStatus).toBe('unbalanced_roll_risk');
      expect(result.payloadStatus).toBe('overloaded_spinal_strain');
      // forage = 160 * 0.015 = 2.4 lbs
      expect(result.recommendedDailyForagePelletsLbs).toBe(2.4);
      expect(result.riggingAdvisory).toMatch(/warning.*rebalance/i);
    });
  });
});
