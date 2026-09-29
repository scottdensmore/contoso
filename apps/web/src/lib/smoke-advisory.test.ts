import { describe, it, expect } from 'vitest';
import {
  getSmokeStations,
  getSmokeStationById,
  calculateSmokeExposure,
  getSmokeGearChecklist,
  type SmokeAdvisoryQuery,
} from './smoke-advisory';

describe('smoke-advisory lib', () => {
  describe('getSmokeStations', () => {
    it('returns all 5 iconic wilderness stations when no filter provided', () => {
      const stations = getSmokeStations();
      expect(stations).toHaveLength(5);
      const ids = stations.map((s) => s.id);
      expect(ids).toContain('pasayten-boundary-fire');
      expect(ids).toContain('sawtooth-wilderness-basin');
      expect(ids).toContain('sierra-crest-granite-gap');
      expect(ids).toContain('san-juan-wetterhorn-basin');
      expect(ids).toContain('bob-marshall-wilderness-complex');
    });

    it('filters stations by elevation layer', () => {
      const midSlope = getSmokeStations('mid_slope_thermal_belt');
      expect(midSlope).toHaveLength(1);
      expect(midSlope[0].id).toBe('sawtooth-wilderness-basin');

      const valleyBasin = getSmokeStations('valley_basin_trapping');
      expect(valleyBasin).toHaveLength(2);
      expect(valleyBasin.map((s) => s.id)).toEqual(
        expect.arrayContaining(['pasayten-boundary-fire', 'bob-marshall-wilderness-complex'])
      );
    });

    it('filters stations by smoke severity', () => {
      const hazardous = getSmokeStations(undefined, 'hazardous_dense_inversion');
      expect(hazardous).toHaveLength(1);
      expect(hazardous[0].id).toBe('sierra-crest-granite-gap');

      const clean = getSmokeStations(undefined, 'clean_uncompromised');
      expect(clean).toHaveLength(1);
      expect(clean[0].id).toBe('san-juan-wetterhorn-basin');
    });
  });

  describe('getSmokeStationById', () => {
    it('returns the station matching the id', () => {
      const station = getSmokeStationById('pasayten-boundary-fire');
      expect(station).toBeDefined();
      expect(station?.title).toBe('Pasayten Boundary Fire Telemetry');
      expect(station?.inversionTrapped).toBe(true);
      expect(station?.pm25UgM3).toBe(121.5);
    });

    it('returns undefined for unknown id', () => {
      const station = getSmokeStationById('unknown-station');
      expect(station).toBeUndefined();
    });
  });

  describe('calculateSmokeExposure', () => {
    it('calculates effective PM2.5, AQI, and dose with N95 mask under valley basin trapping', () => {
      const query: SmokeAdvisoryQuery = {
        stationId: 'pasayten-boundary-fire',
        elevationLayer: 'valley_basin_trapping',
        activityIntensity: 'low_camp_rest',
        exposureHours: 6,
        respiratorType: 'n95_particulate_respirator',
      };

      const result = calculateSmokeExposure(query);
      expect(result.stationTitle).toBe('Pasayten Boundary Fire Telemetry');
      expect(result.effectivePm25UgM3).toBe(164.0); // 121.5 * 1.35 = 164.025 -> 164.0
      expect(result.effectiveAqi).toBe(214);
      expect(result.inhaledParticulateDoseUg).toBe(29.5); // 164.0 * 0.6 * (1 - 0.95) * 6 = 29.52 -> 29.5
      expect(result.safetyStatus).toBe('critical_hazard_cease_exertion'); // AQI > 200
      expect(result.inversionAlert).toBe(true);
      expect(result.advisoryNotes.length).toBeGreaterThan(0);
      expect(result.recommendedActions.length).toBeGreaterThan(0);
    });

    it('calculates strenuous activity with no mask and demonstrates massive dose spike', () => {
      const query: SmokeAdvisoryQuery = {
        stationId: 'pasayten-boundary-fire',
        elevationLayer: 'valley_basin_trapping',
        activityIntensity: 'strenuous_alpine_ascent',
        exposureHours: 6,
        respiratorType: 'none',
      };

      const result = calculateSmokeExposure(query);
      expect(result.effectivePm25UgM3).toBe(164.0);
      // dose = 164.0 * 3.2 * 1.0 * 6 = 3148.8
      expect(result.inhaledParticulateDoseUg).toBe(3148.8);
      expect(result.safetyStatus).toBe('critical_hazard_cease_exertion');
    });

    it('demonstrates dose reduction when using P100 elastomeric half-mask', () => {
      const query: SmokeAdvisoryQuery = {
        stationId: 'pasayten-boundary-fire',
        elevationLayer: 'valley_basin_trapping',
        activityIntensity: 'strenuous_alpine_ascent',
        exposureHours: 6,
        respiratorType: 'p100_elastomeric_half_mask',
      };

      const result = calculateSmokeExposure(query);
      // dose = 164.0 * 3.2 * (1 - 0.999) * 6 = 3.1488 -> 3.1
      expect(result.inhaledParticulateDoseUg).toBe(3.1);
      // Even though dose is 3.1, AQI is still 214 > 200 so safetyStatus remains critical_hazard_cease_exertion
      expect(result.safetyStatus).toBe('critical_hazard_cease_exertion');
    });

    it('evaluates nominal safe exertion for clean alpine air', () => {
      const query: SmokeAdvisoryQuery = {
        stationId: 'san-juan-wetterhorn-basin',
        elevationLayer: 'alpine_ridge_free_air',
        activityIntensity: 'low_camp_rest',
        exposureHours: 4,
        respiratorType: 'none',
      };

      const result = calculateSmokeExposure(query);
      // station pm25 = 8.4; alpine_ridge factor = 0.70; effectivePm25 = 8.4 * 0.7 = 5.88 -> 5.9
      expect(result.effectivePm25UgM3).toBe(5.9);
      // effectiveAqi <= 12.0: Math.round((50 / 12.0) * 5.9) = Math.round(24.583) = 25
      expect(result.effectiveAqi).toBe(25);
      // dose = 5.9 * 0.6 * 1.0 * 4 = 14.16 -> 14.2
      expect(result.inhaledParticulateDoseUg).toBe(14.2);
      expect(result.safetyStatus).toBe('nominal_safe_exertion');
      expect(result.inversionAlert).toBe(false);
    });

    it('evaluates caution moderate respiration when dose or AQI triggers caution threshold', () => {
      const query: SmokeAdvisoryQuery = {
        stationId: 'sawtooth-wilderness-basin',
        elevationLayer: 'mid_slope_thermal_belt',
        activityIntensity: 'strenuous_alpine_ascent',
        exposureHours: 6,
        respiratorType: 'none',
      };

      const result = calculateSmokeExposure(query);
      // station pm25 = 25.2, mid_slope factor = 0.85 -> 21.42 -> 21.4
      expect(result.effectivePm25UgM3).toBe(21.4);
      // dose = 21.4 * 3.2 * 1.0 * 6 = 410.88 -> 410.9
      expect(result.inhaledParticulateDoseUg).toBe(410.9);
      // Dose is > 150 but <= 500, AQI is <= 200 -> caution
      expect(result.safetyStatus).toBe('caution_moderate_respiration');
    });

    it('handles alpine ridge with hazardous plume keeping factor 1.0', () => {
      const query: SmokeAdvisoryQuery = {
        stationId: 'sierra-crest-granite-gap',
        elevationLayer: 'alpine_ridge_free_air',
        activityIntensity: 'moderate_backpacking',
        exposureHours: 2,
        respiratorType: 'none',
      };

      const result = calculateSmokeExposure(query);
      // station severity is 'hazardous_dense_inversion', so alpine_ridge factor = 1.0
      expect(result.effectivePm25UgM3).toBe(260.0);
      expect(result.safetyStatus).toBe('critical_hazard_cease_exertion');
    });
  });

  describe('getSmokeGearChecklist', () => {
    it('returns all 6 mandatory items', () => {
      const gear = getSmokeGearChecklist();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toEqual([
        'n95-valved-particulate-respirator',
        'sealed-smoke-goggles',
        'portable-laser-pm25-monitor',
        'hepa-micro-tent-purifier',
        'electrolyte-saline-eye-rinse',
        'bronchodilator-emergency-inhaler-pouch',
      ]);
    });
  });
});
