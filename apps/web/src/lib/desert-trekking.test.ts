import { describe, it, expect } from 'vitest';
import {
  getDesertRoutes,
  getDesertRouteById,
  getDesertGear,
  calculateHydrationPlan,
  type HydrationPlanQuery,
} from './desert-trekking';

describe('Desert Trekking Domain Logic', () => {
  describe('Desert Routes Catalog', () => {
    it('returns all 5 iconic desert trekking routes', () => {
      const routes = getDesertRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toContain('badwater-telescope-peak-traverse');
      expect(ids).toContain('hayduke-buckskin-gulch-paria');
      expect(ids).toContain('mazatzal-wilderness-divide-trail');
      expect(ids).toContain('black-rock-desert-playa-crossing');
      expect(ids).toContain('chihuahuan-mariscal-canyon-rim');
    });

    it('filters routes by aridity zone', () => {
      const playaRoutes = getDesertRoutes('hyper_arid_salt_playa');
      expect(playaRoutes).toHaveLength(2);
      expect(playaRoutes.map((r) => r.id)).toEqual(
        expect.arrayContaining([
          'badwater-telescope-peak-traverse',
          'black-rock-desert-playa-crossing',
        ])
      );

      const canyonRoutes = getDesertRoutes('canyon_wash_slickrock');
      expect(canyonRoutes).toHaveLength(1);
      expect(canyonRoutes[0].id).toBe('hayduke-buckskin-gulch-paria');

      const bajadaRoutes = getDesertRoutes('creosote_bajada_scrub');
      expect(bajadaRoutes).toHaveLength(1);
      expect(bajadaRoutes[0].id).toBe('mazatzal-wilderness-divide-trail');

      const highDesertRoutes = getDesertRoutes('high_desert_sage_steppe');
      expect(highDesertRoutes).toHaveLength(1);
      expect(highDesertRoutes[0].id).toBe('chihuahuan-mariscal-canyon-rim');
    });

    it('finds a route by id with correct specs and highlights', () => {
      const badwater = getDesertRouteById('badwater-telescope-peak-traverse');
      expect(badwater).toBeDefined();
      expect(badwater?.title).toBe('Badwater Basin to Telescope Peak Low-to-High');
      expect(badwater?.distanceKm).toBe(48.0);
      expect(badwater?.elevationGainM).toBe(3450);
      expect(badwater?.aridityZone).toBe('hyper_arid_salt_playa');
      expect(badwater?.waterSourcesCount).toBe(1);
      expect(badwater?.typicalDurationDays).toBe(3);
      expect(badwater?.waterCacheRequired).toBe(true);
      expect(badwater?.flashFloodRisk).toBe('low');
      expect(badwater?.highlights).toContain('From -282 ft below sea level to 11,049 ft summit');

      const buckskin = getDesertRouteById('hayduke-buckskin-gulch-paria');
      expect(buckskin).toBeDefined();
      expect(buckskin?.flashFloodRisk).toBe('extreme');
      expect(buckskin?.waterCacheRequired).toBe(false);

      const nonexistent = getDesertRouteById('non-existent');
      expect(nonexistent).toBeUndefined();
    });
  });

  describe('Desert Trekking Safety Kit Checklist', () => {
    it('returns the mandatory 6-item desert safety kit', () => {
      const gear = getDesertGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('wide-brim-sun-sombrero-cape');
      expect(ids).toContain('electrolytes-fluid-reservoir-system');
      expect(ids).toContain('uv-blocking-ultralight-sun-umbrella');
      expect(ids).toContain('emergency-desert-bivvy-tarp');
      expect(ids).toContain('satellite-sos-inreach-messenger');
      expect(ids).toContain('high-vis-desert-signal-mirror');

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('sun_protection');
      expect(categories).toContain('hydration');
      expect(categories).toContain('shelter');
      expect(categories).toContain('navigation');
      expect(categories).toContain('signaling');
    });
  });

  describe('Hydration & Arid Survival Calculator', () => {
    const defaultQuery: HydrationPlanQuery = {
      routeId: 'badwater-telescope-peak-traverse',
      ambientTemperatureF: 95,
      relativeHumidityPct: 15,
      hikerWeightKg: 75,
      packWeightKg: 15,
      trekkingPaceKmH: 3.5,
      hoursInDirectSun: 6,
      shadeUmbrellaUsed: false,
    };

    it('calculates hourly sweat rate and total water for baseline conditions', () => {
      const result = calculateHydrationPlan(defaultQuery);

      expect(result.routeTitle).toBe('Badwater Basin to Telescope Peak Low-to-High');
      expect(result.aridityZone).toBe('hyper_arid_salt_playa');
      expect(result.hourlySweatRateLiters).toBeGreaterThan(0.7);
      expect(result.hourlySweatRateLiters).toBeLessThan(1.5);
      expect(result.totalWaterNeededLiters).toBeGreaterThan(4.0);
      expect(result.electrolyteDoseMg).toBeGreaterThan(0);
      expect(result.siestaHoursAdvisory).toBeDefined();
      expect(result.cachingNotice).toBeDefined();
    });

    it('reduces felt heat index and sweat rate when reflective shade umbrella is used', () => {
      const withoutUmbrella = calculateHydrationPlan({
        ...defaultQuery,
        ambientTemperatureF: 100,
        shadeUmbrellaUsed: false,
      });

      const withUmbrella = calculateHydrationPlan({
        ...defaultQuery,
        ambientTemperatureF: 100,
        shadeUmbrellaUsed: true,
      });

      // Umbrella reduces felt temp by 15°F
      expect(withoutUmbrella.feltHeatIndexF - withUmbrella.feltHeatIndexF).toBe(15);
      expect(withUmbrella.hourlySweatRateLiters).toBeLessThan(withoutUmbrella.hourlySweatRateLiters);
      expect(withUmbrella.totalWaterNeededLiters).toBeLessThan(withoutUmbrella.totalWaterNeededLiters);
    });

    it('triggers water_cache_mandatory when total water needed exceeds 7 Liters', () => {
      // 8 hours in direct sun at 104°F should exceed 7 Liters
      const highWaterQuery: HydrationPlanQuery = {
        ...defaultQuery,
        ambientTemperatureF: 104,
        hoursInDirectSun: 8,
        shadeUmbrellaUsed: false,
      };

      const result = calculateHydrationPlan(highWaterQuery);
      expect(result.totalWaterNeededLiters).toBeGreaterThan(7.0);
      expect(result.safetyStatus).toBe('water_cache_mandatory');
      expect(result.cachingNotice).toMatch(/mandatory|cache/i);
    });

    it('triggers extreme_heat_no_travel when felt heat index exceeds 110°F', () => {
      const extremeHeatQuery: HydrationPlanQuery = {
        ...defaultQuery,
        ambientTemperatureF: 118,
        relativeHumidityPct: 20,
        hoursInDirectSun: 5,
        shadeUmbrellaUsed: false,
      };

      const result = calculateHydrationPlan(extremeHeatQuery);
      expect(result.feltHeatIndexF).toBeGreaterThan(110);
      expect(result.safetyStatus).toBe('extreme_heat_no_travel');
      expect(result.cachingNotice).toMatch(/halt|extreme/i);
    });

    it('marks carry_capacity_adequate when water needed is <= 7L and felt heat <= 110°F', () => {
      const moderateQuery: HydrationPlanQuery = {
        ...defaultQuery,
        ambientTemperatureF: 80,
        hoursInDirectSun: 4,
        shadeUmbrellaUsed: true,
      };

      const result = calculateHydrationPlan(moderateQuery);
      expect(result.totalWaterNeededLiters).toBeLessThanOrEqual(7.0);
      expect(result.feltHeatIndexF).toBeLessThanOrEqual(110);
      expect(result.safetyStatus).toBe('carry_capacity_adequate');
    });

    it('calculates electrolyte dosage proportional to fluid loss', () => {
      const lowHydration = calculateHydrationPlan({
        ...defaultQuery,
        hoursInDirectSun: 3,
        shadeUmbrellaUsed: true,
      });

      const highHydration = calculateHydrationPlan({
        ...defaultQuery,
        hoursInDirectSun: 7,
        shadeUmbrellaUsed: false,
      });

      expect(highHydration.electrolyteDoseMg).toBeGreaterThan(lowHydration.electrolyteDoseMg);
      // Dose should be approximately 500-800mg sodium per liter of sweat
      const dosePerLiter = highHydration.electrolyteDoseMg / highHydration.totalWaterNeededLiters;
      expect(dosePerLiter).toBeGreaterThanOrEqual(500);
      expect(dosePerLiter).toBeLessThanOrEqual(800);
    });

    it('includes flash flood advisory tailored to route flood risk', () => {
      const buckskinPlan = calculateHydrationPlan({
        ...defaultQuery,
        routeId: 'hayduke-buckskin-gulch-paria',
      });

      expect(buckskinPlan.flashFloodAdvisory).toMatch(/flash flood/i);
      expect(buckskinPlan.flashFloodAdvisory).toMatch(/extreme/i);

      const badwaterPlan = calculateHydrationPlan(defaultQuery);
      expect(badwaterPlan.flashFloodAdvisory).toMatch(/low/i);
    });

    it('throws an error if routeId is not found', () => {
      expect(() =>
        calculateHydrationPlan({
          ...defaultQuery,
          routeId: 'unknown-desert-trail',
        })
      ).toThrow(/not found/i);
    });
  });
});
