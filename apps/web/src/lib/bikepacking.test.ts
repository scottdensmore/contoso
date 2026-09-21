import { describe, it, expect } from 'vitest';
import {
  getBikepackingRoutes,
  getBikepackingRouteById,
  calculateBikepackingRig,
  getBikepackingGear,
} from './bikepacking';

describe('Bikepacking Library', () => {
  describe('getBikepackingRoutes', () => {
    it('returns all 5 iconic routes when no filter is provided', () => {
      const routes = getBikepackingRoutes();
      expect(routes).toHaveLength(5);
      const ids = routes.map((r) => r.id);
      expect(ids).toContain('cross-washington-xwa');
      expect(ids).toContain('oregon-outback');
      expect(ids).toContain('great-divide-montana');
      expect(ids).toContain('olympic-adventure-trail-loop');
      expect(ids).toContain('cascade-hut-to-hut-gravel');
    });

    it('filters routes correctly by terrain category', () => {
      const singletrack = getBikepackingRoutes('rugged_singletrack');
      expect(singletrack).toHaveLength(1);
      expect(singletrack[0].id).toBe('olympic-adventure-trail-loop');

      const gravel = getBikepackingRoutes('gravel_fire_road');
      expect(gravel).toHaveLength(1);
      expect(gravel[0].id).toBe('oregon-outback');

      const alpine = getBikepackingRoutes('high_alpine_pass');
      expect(alpine).toHaveLength(1);
      expect(alpine[0].id).toBe('cascade-hut-to-hut-gravel');

      const mixed = getBikepackingRoutes('mixed_pavement_gravel');
      expect(mixed).toHaveLength(1);
      expect(mixed[0].id).toBe('cross-washington-xwa');

      const twoTrack = getBikepackingRoutes('remote_two_track');
      expect(twoTrack).toHaveLength(1);
      expect(twoTrack[0].id).toBe('great-divide-montana');
    });
  });

  describe('getBikepackingRouteById', () => {
    it('returns the route when a valid ID is provided', () => {
      const route = getBikepackingRouteById('oregon-outback');
      expect(route).toBeDefined();
      expect(route?.name).toBe('Oregon Outback Gravel Epic');
      expect(route?.distanceMiles).toBe(364);
      expect(route?.elevationGainFt).toBe(14500);
      expect(route?.recommendedTireWidthMm).toBe(45);
      expect(route?.waterCarryLiters).toBe(4.0);
    });

    it('returns undefined for an unknown route ID', () => {
      const route = getBikepackingRouteById('non-existent-route');
      expect(route).toBeUndefined();
    });
  });

  describe('calculateBikepackingRig', () => {
    it('calculates realistic tire pressure adjusted for rider weight and tire width', () => {
      // 165 lbs on Oregon Outback (45mm)
      const baseResult = calculateBikepackingRig({
        routeId: 'oregon-outback',
        tripDurationDays: 4,
        shelterType: 'bikepacking_tent',
        riderWeightLbs: 165,
      });

      // 210 lbs on Oregon Outback (45mm)
      const heavierResult = calculateBikepackingRig({
        routeId: 'oregon-outback',
        tripDurationDays: 4,
        shelterType: 'bikepacking_tent',
        riderWeightLbs: 210,
      });

      // Heavier rider needs higher tire pressure
      expect(heavierResult.recommendedTirePressurePsi.rear).toBeGreaterThan(
        baseResult.recommendedTirePressurePsi.rear
      );
      expect(heavierResult.recommendedTirePressurePsi.front).toBeGreaterThan(
        baseResult.recommendedTirePressurePsi.front
      );

      // Rear tire pressure is higher than front tire pressure
      expect(baseResult.recommendedTirePressurePsi.rear).toBeGreaterThanOrEqual(
        baseResult.recommendedTirePressurePsi.front
      );

      // Wider tire (Olympic Singletrack 60mm) should recommend lower pressure than 45mm
      const wideTireResult = calculateBikepackingRig({
        routeId: 'olympic-adventure-trail-loop',
        tripDurationDays: 2,
        shelterType: 'bikepacking_tent',
        riderWeightLbs: 165,
      });

      expect(wideTireResult.recommendedTirePressurePsi.rear).toBeLessThan(
        baseResult.recommendedTirePressurePsi.rear
      );
    });

    it('scales bag capacity and gear weight with shelter type and trip duration', () => {
      const bivyResult = calculateBikepackingRig({
        routeId: 'cross-washington-xwa',
        tripDurationDays: 3,
        shelterType: 'ultralight_bivy',
        riderWeightLbs: 160,
      });

      const tentResult = calculateBikepackingRig({
        routeId: 'cross-washington-xwa',
        tripDurationDays: 3,
        shelterType: 'bikepacking_tent',
        riderWeightLbs: 160,
      });

      // Tent setup requires larger handlebar roll capacity and adds gear weight
      expect(tentResult.bagCapacityLitres.handlebarRoll).toBeGreaterThan(
        bivyResult.bagCapacityLitres.handlebarRoll
      );
      expect(tentResult.totalGearWeightLbs).toBeGreaterThan(
        bivyResult.totalGearWeightLbs
      );
      expect(tentResult.bagCapacityLitres.total).toBe(
        tentResult.bagCapacityLitres.frameBag +
          tentResult.bagCapacityLitres.seatPack +
          tentResult.bagCapacityLitres.handlebarRoll
      );

      // Extended duration increases total bag capacity requirement
      const longTripResult = calculateBikepackingRig({
        routeId: 'cross-washington-xwa',
        tripDurationDays: 7,
        shelterType: 'bikepacking_tent',
        riderWeightLbs: 160,
      });

      expect(longTripResult.bagCapacityLitres.total).toBeGreaterThan(
        tentResult.bagCapacityLitres.total
      );
      expect(longTripResult.totalGearWeightLbs).toBeGreaterThan(
        tentResult.totalGearWeightLbs
      );
    });

    it('calculates daily calorie and water demands and lists mechanical spares', () => {
      const result = calculateBikepackingRig({
        routeId: 'great-divide-montana',
        tripDurationDays: 5,
        shelterType: 'tarp_setup',
        riderWeightLbs: 170,
      });

      expect(result.routeName).toBe(
        'Great Divide Mountain Bike Route - Montana Passes'
      );
      expect(result.dailyCalorieDemandKcal).toBeGreaterThan(3000);
      expect(result.dailyWaterDemandLiters).toBeGreaterThanOrEqual(2.5);
      expect(result.mechanicalSparesPriority.length).toBeGreaterThan(0);
      expect(result.mechanicalSparesPriority.join(' ').toLowerCase()).toMatch(
        /hanger|tubeless|plug|chain|link/
      );
    });
  });

  describe('getBikepackingGear', () => {
    it('returns the 6 mandatory trailside repair and gear items', () => {
      const gear = getBikepackingGear();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const mandatoryItems = gear.filter((item) => item.mandatory);
      expect(mandatoryItems.length).toBe(6);

      const itemNames = gear.map((g) => g.name);
      expect(
        itemNames.some((n) => n.includes('Multi-tool') && n.includes('chain breaker'))
      ).toBe(true);
      expect(
        itemNames.some((n) => n.includes('Tubeless plug') && n.includes('bacon strips'))
      ).toBe(true);
      expect(
        itemNames.some((n) => n.includes('mini pump') && n.includes('CO2 inflator'))
      ).toBe(true);
      expect(
        itemNames.some((n) => n.includes('derailleur hanger') && n.includes('quick-link'))
      ).toBe(true);
      expect(
        itemNames.some((n) => n.includes('handlebar roll') && n.includes('seat pack'))
      ).toBe(true);
      expect(
        itemNames.some((n) => n.includes('water filtration') && n.includes('squeeze filter'))
      ).toBe(true);

      for (const item of gear) {
        expect(item.id).toBeTruthy();
        expect(item.purpose).toBeTruthy();
        expect(['bike_bags', 'repair_tools', 'sleep_system', 'hydration_fuel', 'electronics']).toContain(
          item.category
        );
      }
    });
  });
});
