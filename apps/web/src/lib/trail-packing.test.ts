import { describe, it, expect } from 'vitest';
import {
  getPackRoutes,
  getPackRouteById,
  getTackChecklist,
  calculateTrailPacking,
  type TrailPackingQuery,
} from './trail-packing';

describe('trail-packing library', () => {
  describe('getPackRoutes', () => {
    it('returns all 5 iconic wilderness routes when no saddle filter is provided', () => {
      const routes = getPackRoutes();
      expect(routes).toHaveLength(5);
      const ids = routes.map((r) => r.id);
      expect(ids).toContain('bob-marshall-wilderness');
      expect(ids).toContain('pasayten-wilderness');
      expect(ids).toContain('wind-river-range');
      expect(ids).toContain('pecos-wilderness');
      expect(ids).toContain('frank-church-river-of-no-return');
    });

    it('filters routes by decker saddle rigging', () => {
      const deckerRoutes = getPackRoutes('decker');
      expect(deckerRoutes).toHaveLength(3);
      deckerRoutes.forEach((r) => expect(r.saddleType).toBe('decker'));
      const ids = deckerRoutes.map((r) => r.id);
      expect(ids).toEqual([
        'bob-marshall-wilderness',
        'wind-river-range',
        'frank-church-river-of-no-return',
      ]);
    });

    it('filters routes by sawbuck saddle rigging', () => {
      const sawbuckRoutes = getPackRoutes('sawbuck');
      expect(sawbuckRoutes).toHaveLength(2);
      sawbuckRoutes.forEach((r) => expect(r.saddleType).toBe('sawbuck'));
      const ids = sawbuckRoutes.map((r) => r.id);
      expect(ids).toEqual(['pasayten-wilderness', 'pecos-wilderness']);
    });
  });

  describe('getPackRouteById', () => {
    it('finds route by valid ID', () => {
      const route = getPackRouteById('bob-marshall-wilderness');
      expect(route).toBeDefined();
      expect(route?.title).toBe('Bob Marshall Wilderness & Chinese Wall Pack String');
      expect(route?.nationalForest).toBe('Flathead National Forest, MT, USA');
      expect(route?.elevationM).toBe(2300);
      expect(route?.maxStringMules).toBe(6);
      expect(route?.routeHighlights).toHaveLength(3);
    });

    it('returns undefined for non-existent route ID', () => {
      expect(getPackRouteById('non-existent-trail')).toBeUndefined();
    });
  });

  describe('getTackChecklist', () => {
    it('returns all 6 mandatory safety and tack checklist items', () => {
      const checklist = getTackChecklist();
      expect(checklist).toHaveLength(6);
      checklist.forEach((item) => {
        expect(item.mandatory).toBe(true);
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
      });

      const categories = checklist.map((i) => i.category);
      expect(categories).toContain('containment');
      expect(categories).toContain('rigging');
      expect(categories).toContain('tack');
      expect(categories).toContain('storage');
      expect(categories).toContain('hoofcare');
      expect(categories).toContain('repair');
    });
  });

  describe('calculateTrailPacking', () => {
    it('calculates balanced payload within capacity for a mule', () => {
      const query: TrailPackingQuery = {
        routeId: 'bob-marshall-wilderness',
        stockAnimal: 'mule',
        leftPannierLbs: 65,
        rightPannierLbs: 65,
        topPackLbs: 20,
        hitchType: 'diamond_hitch',
      };

      const result = calculateTrailPacking(query);
      expect(result.routeTitle).toBe('Bob Marshall Wilderness & Chinese Wall Pack String');
      expect(result.stockAnimal).toBe('mule');
      expect(result.totalPayloadLbs).toBe(150);
      expect(result.weightDifferenceLbs).toBe(0);
      expect(result.balanceRatio).toBe(1);
      expect(result.balanceStatus).toBe('balanced');
      expect(result.payloadCapacityStatus).toBe('within_capacity');
      expect(result.highlineSpacingM).toBe(3.5);
      expect(result.recommendedHitchAdjustment.toLowerCase()).toContain('diamond hitch');
    });

    it('identifies acceptable minor weight difference (3 lbs)', () => {
      const query: TrailPackingQuery = {
        routeId: 'pasayten-wilderness',
        stockAnimal: 'pack_horse',
        leftPannierLbs: 65,
        rightPannierLbs: 62,
        topPackLbs: 20,
        hitchType: 'box_hitch',
      };

      const result = calculateTrailPacking(query);
      expect(result.weightDifferenceLbs).toBe(3);
      expect(result.balanceStatus).toBe('acceptable');
      expect(result.balanceRatio).toBe(0.95);
      expect(result.payloadCapacityStatus).toBe('within_capacity');
      expect(result.highlineSpacingM).toBe(4.0);
    });

    it('triggers unbalanced risk warning and recommended adjustment when pannier difference exceeds 5 lbs', () => {
      const query: TrailPackingQuery = {
        routeId: 'bob-marshall-wilderness',
        stockAnimal: 'mule',
        leftPannierLbs: 85,
        rightPannierLbs: 50,
        topPackLbs: 20,
        hitchType: 'diamond_hitch',
      };

      const result = calculateTrailPacking(query);
      expect(result.weightDifferenceLbs).toBe(35);
      expect(result.balanceStatus).toBe('unbalanced_risk_galls');
      expect(result.balanceRatio).toBe(0.59);
      expect(result.recommendedHitchAdjustment).toMatch(/unbalanced|gall|shift|35 lbs/i);
    });

    it('identifies near capacity status when payload is within 85% of max payload', () => {
      // Mule max payload = 190 lbs. 85% = 161.5 lbs.
      const query: TrailPackingQuery = {
        routeId: 'frank-church-river-of-no-return',
        stockAnimal: 'mule',
        leftPannierLbs: 75,
        rightPannierLbs: 75,
        topPackLbs: 20, // Total = 170 lbs
        hitchType: 'squaw_hitch',
      };

      const result = calculateTrailPacking(query);
      expect(result.totalPayloadLbs).toBe(170);
      expect(result.payloadCapacityStatus).toBe('near_capacity');
    });

    it('triggers overloaded injury risk when payload exceeds animal maximum payload limit', () => {
      // Mule max payload = 190 lbs.
      const query: TrailPackingQuery = {
        routeId: 'pecos-wilderness',
        stockAnimal: 'mule',
        leftPannierLbs: 95,
        rightPannierLbs: 95,
        topPackLbs: 30, // Total = 220 lbs
        hitchType: 'barrel_hitch',
      };

      const result = calculateTrailPacking(query);
      expect(result.totalPayloadLbs).toBe(220);
      expect(result.payloadCapacityStatus).toBe('overloaded_injury_risk');
    });

    it('provides specific hitch adjustment instructions for each hitch type', () => {
      const baseQuery: TrailPackingQuery = {
        routeId: 'wind-river-range',
        stockAnimal: 'quarter_horse',
        leftPannierLbs: 60,
        rightPannierLbs: 60,
        topPackLbs: 15,
        hitchType: 'diamond_hitch',
      };

      const diamond = calculateTrailPacking({ ...baseQuery, hitchType: 'diamond_hitch' });
      expect(diamond.recommendedHitchAdjustment.toLowerCase()).toContain('diamond');

      const box = calculateTrailPacking({ ...baseQuery, hitchType: 'box_hitch' });
      expect(box.recommendedHitchAdjustment.toLowerCase()).toContain('box');

      const squaw = calculateTrailPacking({ ...baseQuery, hitchType: 'squaw_hitch' });
      expect(squaw.recommendedHitchAdjustment.toLowerCase()).toContain('squaw');

      const barrel = calculateTrailPacking({ ...baseQuery, hitchType: 'barrel_hitch' });
      expect(barrel.recommendedHitchAdjustment.toLowerCase()).toContain('barrel');
    });
  });
});
