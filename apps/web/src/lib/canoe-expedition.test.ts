import { describe, it, expect } from 'vitest';
import {
  getCanoeRoutes,
  getCanoeRouteById,
  calculateCanoeTrim,
  getCanoeGear,
  type CanoeTrimQuery,
} from './canoe-expedition';

describe('Canoe Expedition Library', () => {
  describe('getCanoeRoutes', () => {
    it('returns all 5 iconic routes when unfiltered', () => {
      const routes = getCanoeRoutes();
      expect(routes).toHaveLength(5);
      const ids = routes.map((r) => r.id);
      expect(ids).toEqual([
        'allagash-wilderness-waterway',
        'nahanni-river-canyon-run',
        'boundary-waters-granite-river',
        'missinaibi-river-james-bay',
        'rio-grande-lower-canyons',
      ]);
    });

    it('filters routes by whitewaterClass', () => {
      const classI = getCanoeRoutes('class_i_easy');
      expect(classI).toHaveLength(1);
      expect(classI[0].id).toBe('boundary-waters-granite-river');

      const classII = getCanoeRoutes('class_ii_moderate');
      expect(classII).toHaveLength(1);
      expect(classII[0].id).toBe('allagash-wilderness-waterway');

      const classIII = getCanoeRoutes('class_iii_advanced');
      expect(classIII).toHaveLength(2);
      expect(classIII.map((r) => r.id)).toEqual([
        'nahanni-river-canyon-run',
        'rio-grande-lower-canyons',
      ]);

      const classIV = getCanoeRoutes('class_iv_expert');
      expect(classIV).toHaveLength(1);
      expect(classIV[0].id).toBe('missinaibi-river-james-bay');
    });
  });

  describe('getCanoeRouteById', () => {
    it('returns route for known id', () => {
      const route = getCanoeRouteById('allagash-wilderness-waterway');
      expect(route).toBeDefined();
      expect(route?.title).toBe('Allagash Wilderness Waterway Northern Canoe Traverse');
      expect(route?.region).toBe('North Maine Woods, ME');
      expect(route?.distanceKm).toBe(150);
      expect(route?.typicalDurationDays).toBe(7);
      expect(route?.whitewaterClass).toBe('class_ii_moderate');
      expect(route?.totalPortages).toBe(4);
      expect(route?.longestPortageM).toBe(1200);
      expect(route?.recommendedHullMaterial).toBe('Royalex / T-Formex');
      expect(route?.recommendedLengthFt).toBe(16);
      expect(route?.highlights).toHaveLength(3);
    });

    it('returns undefined for unknown id', () => {
      expect(getCanoeRouteById('unknown-route')).toBeUndefined();
    });
  });

  describe('getCanoeGear', () => {
    it('returns 6 mandatory expedition gear items', () => {
      const gear = getCanoeGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('whitewater-canoe-spray-deck');
      expect(ids).toContain('dual-end-air-flotation-bags');
      expect(ids).toContain('rapid-lining-tracking-ropes');
      expect(ids).toContain('deep-water-canoe-bailer-pump');
      expect(ids).toContain('contoured-portage-yoke-pads');
      expect(ids).toContain('whitewater-rescue-pfd-harness');
    });
  });

  describe('calculateCanoeTrim', () => {
    const baseQuery: CanoeTrimQuery = {
      routeId: 'allagash-wilderness-waterway',
      canoeLengthFt: 16,
      bowPaddlerWeightKg: 75,
      sternPaddlerWeightKg: 85,
      gearCargoWeightKg: 70,
      cargoPlacement: 'centered',
      rapidLevel: 'class_ii',
    };

    it('calculates trim, freeboard and safety for standard baseline configuration', () => {
      const result = calculateCanoeTrim(baseQuery);
      expect(result.routeTitle).toBe('Allagash Wilderness Waterway Northern Canoe Traverse');
      expect(result.totalGrossWeightKg).toBe(256);
      expect(result.capacityPercent).toBe(58);
      expect(result.centerFreeboardCm).toBe(18.9);
      expect(result.centerFreeboardInches).toBe(7.4);
      expect(result.trimStatus).toBe('slightly_stern_heavy');
      expect(result.swampingRisk).toBe('moderate');
      expect(result.safetyStatus).toBe('safe');
      expect(result.tacticalAdvisory).toBeTruthy();
    });

    it('identifies bow_heavy trim when forward load exceeds rear by more than 5kg', () => {
      const query: CanoeTrimQuery = {
        ...baseQuery,
        bowPaddlerWeightKg: 100,
        sternPaddlerWeightKg: 60,
        gearCargoWeightKg: 50,
        cargoPlacement: 'forward',
      };
      const result = calculateCanoeTrim(query);
      expect(result.trimStatus).toBe('bow_heavy');
      expect(result.safetyStatus).toBe('caution');
    });

    it('identifies excessively_stern_heavy trim when rear exceeds front by more than 15kg', () => {
      const query: CanoeTrimQuery = {
        ...baseQuery,
        bowPaddlerWeightKg: 50,
        sternPaddlerWeightKg: 110,
        gearCargoWeightKg: 80,
        cargoPlacement: 'rear',
      };
      const result = calculateCanoeTrim(query);
      expect(result.trimStatus).toBe('excessively_stern_heavy');
    });

    it('identifies balanced_optimal when diff is between -5 and 0', () => {
      const query: CanoeTrimQuery = {
        ...baseQuery,
        bowPaddlerWeightKg: 82,
        sternPaddlerWeightKg: 80,
        gearCargoWeightKg: 50,
        cargoPlacement: 'centered',
      };
      const result = calculateCanoeTrim(query);
      expect(result.trimStatus).toBe('balanced_optimal');
    });

    it('triggers critical hazard when capacity exceeds 92%', () => {
      const query: CanoeTrimQuery = {
        ...baseQuery,
        canoeLengthFt: 14,
        bowPaddlerWeightKg: 115,
        sternPaddlerWeightKg: 120,
        gearCargoWeightKg: 150,
        rapidLevel: 'flatwater',
      };
      const result = calculateCanoeTrim(query);
      expect(result.capacityPercent).toBeGreaterThan(92);
      expect(result.safetyStatus).toBe('critical_hazard');
    });

    it('triggers critical hazard for forward cargo in Class IV rapids', () => {
      const query: CanoeTrimQuery = {
        ...baseQuery,
        rapidLevel: 'class_iv',
        cargoPlacement: 'forward',
      };
      const result = calculateCanoeTrim(query);
      expect(result.safetyStatus).toBe('critical_hazard');
    });

    it('triggers critical swamping risk when centerFreeboardInches < 5.5 or Class IV with < 7.0 inches', () => {
      const lowFreeboardQuery: CanoeTrimQuery = {
        ...baseQuery,
        canoeLengthFt: 15, // hullWeight = 24
        bowPaddlerWeightKg: 110,
        sternPaddlerWeightKg: 115,
        gearCargoWeightKg: 170, // totalGross = 419 kg, 36 - (419/30)*2 = 8.07cm = 8.1cm = 3.2 inches
        rapidLevel: 'flatwater',
      };
      const resultLow = calculateCanoeTrim(lowFreeboardQuery);
      expect(resultLow.centerFreeboardInches).toBeLessThan(5.5);
      expect(resultLow.swampingRisk).toBe('critical');

      const classIVQuery: CanoeTrimQuery = {
        ...baseQuery,
        canoeLengthFt: 16, // hullWeight = 26
        bowPaddlerWeightKg: 90,
        sternPaddlerWeightKg: 95,
        gearCargoWeightKg: 110, // totalGross = 321 kg, 36 - (321/30)*2 = 14.6cm = 5.7 inches
        rapidLevel: 'class_iv',
      };
      const resultClassIV = calculateCanoeTrim(classIVQuery);
      expect(resultClassIV.centerFreeboardInches).toBeLessThan(7.0);
      expect(resultClassIV.swampingRisk).toBe('critical');
    });

    it('calculates hullWeight appropriately for 14ft, 16ft, and 18ft hulls', () => {
      const shortCanoe = calculateCanoeTrim({ ...baseQuery, canoeLengthFt: 14 });
      const midCanoe = calculateCanoeTrim({ ...baseQuery, canoeLengthFt: 16 });
      const longCanoe = calculateCanoeTrim({ ...baseQuery, canoeLengthFt: 18 });

      expect(shortCanoe.totalGrossWeightKg).toBe(254);
      expect(midCanoe.totalGrossWeightKg).toBe(256);
      expect(longCanoe.totalGrossWeightKg).toBe(259);
    });

    it('handles fallback routeTitle when routeId does not match catalog', () => {
      const result = calculateCanoeTrim({
        ...baseQuery,
        routeId: 'custom-unlisted-river',
      });
      expect(result.routeTitle).toBe('Expedition Route');
    });
  });
});
