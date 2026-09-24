import { describe, it, expect } from 'vitest';
import {
  getAlpineScubaSites,
  getAlpineScubaSiteById,
  calculateScubaProfile,
  getAlpineScubaGear,
  type ScubaCalculationQuery,
} from './alpine-scuba';

describe('alpine-scuba library', () => {
  describe('site catalog and lookup', () => {
    it('returns all 5 iconic high-altitude scuba sites', () => {
      const sites = getAlpineScubaSites();
      expect(sites).toHaveLength(5);
      expect(sites.map((s) => s.id)).toEqual([
        'lake-tahoe-rubicon-wall',
        'crater-lake-wizard-island',
        'emerald-lake-rockies',
        'lake-ouananiche-chic-chocs',
        'homestake-reservoir-colorado',
      ]);
    });

    it('filters sites correctly by waterType', () => {
      const freshwater = getAlpineScubaSites('freshwater_alpine');
      expect(freshwater).toHaveLength(1);
      expect(freshwater[0].id).toBe('lake-tahoe-rubicon-wall');

      const crater = getAlpineScubaSites('high_elevation_crater');
      expect(crater).toHaveLength(1);
      expect(crater[0].id).toBe('crater-lake-wizard-island');

      const glacial = getAlpineScubaSites('glacial_melt_ice');
      expect(glacial).toHaveLength(2);
      expect(glacial.map((s) => s.id)).toEqual([
        'emerald-lake-rockies',
        'lake-ouananiche-chic-chocs',
      ]);

      const quarry = getAlpineScubaSites('alpine_quarry');
      expect(quarry).toHaveLength(1);
      expect(quarry[0].id).toBe('homestake-reservoir-colorado');
    });

    it('finds a site by id', () => {
      const tahoe = getAlpineScubaSiteById('lake-tahoe-rubicon-wall');
      expect(tahoe).toBeDefined();
      expect(tahoe?.name).toBe('Rubicon Wall & Emerald Bay');
      expect(tahoe?.elevationMeters).toBe(1897);
      expect(tahoe?.maxDepthMeters).toBe(120);
      expect(tahoe?.summerWaterTempC).toBe(14);
      expect(tahoe?.winterWaterTempC).toBe(4);
      expect(tahoe?.typicalVisibilityMeters).toBe(30);
      expect(tahoe?.overheadCondition).toBe('open_surface');
      expect(tahoe?.highlights).toHaveLength(3);
    });

    it('returns undefined for an unknown site id', () => {
      expect(getAlpineScubaSiteById('non-existent-site')).toBeUndefined();
    });
  });

  describe('mandatory cold water & ice safety checklist', () => {
    it('returns all 6 mandatory items', () => {
      const gear = getAlpineScubaGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((g) => g.mandatory)).toBe(true);

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('regulator');
      expect(categories).toContain('drysuit');
      expect(categories).toContain('tether');
      expect(categories).toContain('redundancy');
      expect(categories).toContain('computer');
      expect(categories).toContain('ice_tools');
    });
  });

  describe('calculateScubaProfile', () => {
    it('calculates profile correctly for Lake Tahoe at 18m and 3°C', () => {
      const query: ScubaCalculationQuery = {
        siteId: 'lake-tahoe-rubicon-wall',
        targetDepthMeters: 18,
        bottomTimeMinutes: 15,
        thermalExposure: 'drysuit_heavy_undergarment',
        waterTempC: 3,
      };

      const result = calculateScubaProfile(query);

      // Lake Tahoe elevation: 1897m
      // Patm = Math.round(1.0 * Math.exp(-1897 / 8434) * 100) / 100 = 0.80 bar
      expect(result.siteName).toBe('Rubicon Wall & Emerald Bay');
      expect(result.atmosphericPressureBar).toBe(0.8);

      // ESLD = Math.round((18 * (1.0 / 0.80)) * 10) / 10 = 22.5m
      expect(result.equivalentSeaLevelDepthMeters).toBe(22.5);

      // ESLD 22.5m <= 24m -> base NDL = 28 min
      // adjustedNdlMinutes = Math.max(3, Math.round(28 * 0.80)) = 22 min
      expect(result.adjustedNdlMinutes).toBe(22);

      // bottomTimeMinutes = 15 <= 22 - 5 (17) -> 'safe_ndl'
      expect(result.decompressionStatus).toBe('safe_ndl');

      // waterTempC = 3 (<= 5) -> 'moderate'
      expect(result.regulatorFreezeRisk).toBe('moderate');

      // elevation 1897 <= 2000 and targetDepth 18 < 30 -> 18 hours
      expect(result.minSurfaceIntervalHours).toBe(18);

      // open surface -> no ice safety advisory
      expect(result.iceSafetyAdvisory).toBeUndefined();
    });

    it('calculates caution_near_ndl when bottom time is within 5 minutes of adjusted NDL', () => {
      const query: ScubaCalculationQuery = {
        siteId: 'lake-tahoe-rubicon-wall',
        targetDepthMeters: 18,
        bottomTimeMinutes: 20, // 20 > 17 and <= 22
        thermalExposure: 'drysuit_heavy_undergarment',
        waterTempC: 3,
      };

      const result = calculateScubaProfile(query);
      expect(result.decompressionStatus).toBe('caution_near_ndl');
    });

    it('calculates decompression_required, 24h wait, and critical freeze risk for deep ice dive', () => {
      const query: ScubaCalculationQuery = {
        siteId: 'lake-tahoe-rubicon-wall',
        targetDepthMeters: 30,
        bottomTimeMinutes: 25,
        thermalExposure: 'wetsuit_7mm_hooded',
        waterTempC: 1,
      };

      const result = calculateScubaProfile(query);

      // ESLD = Math.round((30 * (1.0 / 0.80)) * 10) / 10 = 37.5m
      expect(result.equivalentSeaLevelDepthMeters).toBe(37.5);

      // ESLD 37.5m <= 40m -> base NDL = 9 min
      // adjusted NDL = Math.round(9 * 0.80) = 7 min
      expect(result.adjustedNdlMinutes).toBe(7);

      // bottomTime 25 > 7 -> decompression_required
      expect(result.decompressionStatus).toBe('decompression_required');

      // waterTemp 1 <= 2 and depth 30 >= 25 -> 'critical'
      expect(result.regulatorFreezeRisk).toBe('critical');

      // targetDepth 30 >= 30 -> 24 hours
      expect(result.minSurfaceIntervalHours).toBe(24);

      // thermalExposure !== 'drysuit_heavy_undergarment' && waterTempC <= 4
      expect(result.thermalProtectionAdvisory).toContain('Extreme hypothermia danger');
    });

    it('handles high elevation (>2000m) and overhead ice environment for Emerald Lake and Homestake', () => {
      // Emerald Lake: elevation 1300, overhead: 'overhead_ice_vault'
      const emeraldResult = calculateScubaProfile({
        siteId: 'emerald-lake-rockies',
        targetDepthMeters: 15,
        bottomTimeMinutes: 20,
        thermalExposure: 'drysuit_heavy_undergarment',
        waterTempC: 0,
      });

      expect(emeraldResult.iceSafetyAdvisory).toContain('Overhead Ice Environment');
      // waterTemp 0 <= 2 and targetDepth 15 < 25 -> 'high' freeze risk
      expect(emeraldResult.regulatorFreezeRisk).toBe('high');

      // Homestake: elevation 3115m (>2000m)
      const homestakeResult = calculateScubaProfile({
        siteId: 'homestake-reservoir-colorado',
        targetDepthMeters: 10,
        bottomTimeMinutes: 20,
        thermalExposure: 'drysuit_heavy_undergarment',
        waterTempC: 6, // > 5 -> low freeze risk
      });

      // elevation > 2000 -> 24h wait
      expect(homestakeResult.minSurfaceIntervalHours).toBe(24);
      expect(homestakeResult.regulatorFreezeRisk).toBe('low');
    });
  });
});
