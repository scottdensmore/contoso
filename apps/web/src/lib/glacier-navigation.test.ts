import { describe, it, expect } from 'vitest';
import {
  getGlacierZones,
  getGlacierZoneById,
  calculateCrevasseNavigation,
  getGlacierGear,
} from './glacier-navigation';

describe('glacier-navigation lib', () => {
  describe('getGlacierZones', () => {
    it('returns all 5 iconic glacier zones when no filter is supplied', () => {
      const zones = getGlacierZones();
      expect(zones).toHaveLength(5);

      const ids = zones.map((z) => z.id);
      expect(ids).toContain('khumbu-icefall-everest');
      expect(ids).toContain('ingraham-glacier-rainier');
      expect(ids).toContain('mer-de-glace-geant');
      expect(ids).toContain('root-glacier-st-elias');
      expect(ids).toContain('tasman-glacier-icefall');
    });

    it('filters zones correctly by SeracHazardLevel', () => {
      const extremeZones = getGlacierZones('extreme');
      expect(extremeZones).toHaveLength(1);
      expect(extremeZones[0].id).toBe('khumbu-icefall-everest');
      expect(extremeZones[0].hazardLevel).toBe('extreme');

      const highZones = getGlacierZones('high');
      expect(highZones).toHaveLength(2);
      expect(highZones.map((z) => z.id)).toEqual(
        expect.arrayContaining(['ingraham-glacier-rainier', 'tasman-glacier-icefall']),
      );

      const moderateZones = getGlacierZones('moderate');
      expect(moderateZones).toHaveLength(1);
      expect(moderateZones[0].id).toBe('mer-de-glace-geant');

      const lowZones = getGlacierZones('low');
      expect(lowZones).toHaveLength(1);
      expect(lowZones[0].id).toBe('root-glacier-st-elias');
    });

    it('verifies all expected zone properties are populated', () => {
      const khumbu = getGlacierZoneById('khumbu-icefall-everest');
      expect(khumbu).toBeDefined();
      expect(khumbu?.title).toBe('Khumbu Icefall Lower Maze');
      expect(khumbu?.glacierSystem).toBe('Khumbu Glacier');
      expect(khumbu?.region).toBe('Sagarmatha National Park, Nepal');
      expect(khumbu?.elevationM).toBe(5350);
      expect(khumbu?.crevassePattern).toBe('icefall_chaos');
      expect(khumbu?.ladderSectionsRequired).toBe(true);
      expect(khumbu?.typicalCrossingHours).toBe(6.5);
      expect(khumbu?.routeHighlights).toEqual(
        expect.arrayContaining([
          'Active serac collapse corridors',
          'Aluminum ladder crevasse bridges',
          'Fixed safety line anchors',
        ]),
      );

      const ingraham = getGlacierZoneById('ingraham-glacier-rainier');
      expect(ingraham?.ladderSectionsRequired).toBe(false);
      expect(ingraham?.crevassePattern).toBe('bergschrund');
      expect(ingraham?.typicalCrossingHours).toBe(3.5);
    });

    it('returns undefined for non-existent zone IDs', () => {
      expect(getGlacierZoneById('non-existent-zone')).toBeUndefined();
    });
  });

  describe('calculateCrevasseNavigation', () => {
    it('calculates span-to-depth ratio accurately for default values', () => {
      const result = calculateCrevasseNavigation({
        zoneId: 'khumbu-icefall-everest',
        teamSize: 3,
        snowBridgeDepthM: 1.2,
        crevasseWidthM: 2.0,
        ambientTempF: 24,
        ropeIntervalM: 12,
      });

      expect(result.zoneTitle).toBe('Khumbu Icefall Lower Maze');
      expect(result.spanToDepthRatio).toBe(0.6);
      expect(result.recommendedIntervalM).toBe(12);
      expect(result.intervalStatus).toBe('optimal');
      expect(result.safetyStatus).toBe('safe_crossing');
      expect(result.rescueReserveLengthM).toBe(36);
      expect(result.thermalStability).toContain('Stable cold firn');
      expect(result.routeRecommendation).toContain('Proceed with standard rope team spacing');
    });

    it('enforces 2-person team rope interval requirements (15m)', () => {
      // 2-person team with 15m interval -> optimal
      const resultOptimal = calculateCrevasseNavigation({
        zoneId: 'ingraham-glacier-rainier',
        teamSize: 2,
        snowBridgeDepthM: 1.5,
        crevasseWidthM: 2.0,
        ambientTempF: 22,
        ropeIntervalM: 15,
      });
      expect(resultOptimal.recommendedIntervalM).toBe(15);
      expect(resultOptimal.intervalStatus).toBe('optimal');
      // Active rope: 1 * 15 = 15m, Reserve: 60 - 15 = 45m
      expect(resultOptimal.rescueReserveLengthM).toBe(45);

      // 2-person team with dangerously short interval (9m) -> unsafe
      const resultShort = calculateCrevasseNavigation({
        zoneId: 'ingraham-glacier-rainier',
        teamSize: 2,
        snowBridgeDepthM: 1.5,
        crevasseWidthM: 2.0,
        ambientTempF: 22,
        ropeIntervalM: 9,
      });
      expect(resultShort.recommendedIntervalM).toBe(15);
      expect(resultShort.intervalStatus).toBe('unsafe');
    });

    it('triggers hazardous bypass required on warm temperatures (>34°F)', () => {
      const resultWarm = calculateCrevasseNavigation({
        zoneId: 'khumbu-icefall-everest',
        teamSize: 3,
        snowBridgeDepthM: 1.5,
        crevasseWidthM: 2.0,
        ambientTempF: 38,
        ropeIntervalM: 12,
      });

      expect(resultWarm.safetyStatus).toBe('hazardous_bypass_required');
      expect(resultWarm.thermalStability).toMatch(/isothermal|melting|collapse/i);
      expect(resultWarm.routeRecommendation).toMatch(/do not cross|bypass|retreat/i);
    });

    it('triggers hazardous bypass required on thin snow bridges (<0.5m with wide crevasse)', () => {
      const resultThin = calculateCrevasseNavigation({
        zoneId: 'ingraham-glacier-rainier',
        teamSize: 3,
        snowBridgeDepthM: 0.4,
        crevasseWidthM: 2.5,
        ambientTempF: 20,
        ropeIntervalM: 12,
      });

      expect(resultThin.spanToDepthRatio).toBe(0.16);
      expect(resultThin.safetyStatus).toBe('hazardous_bypass_required');
      expect(resultThin.routeRecommendation).toMatch(/do not cross|failure hazard|bypass/i);
    });

    it('triggers caution belayed crossing on borderline temperatures (30°F to 34°F)', () => {
      const resultCaution = calculateCrevasseNavigation({
        zoneId: 'mer-de-glace-geant',
        teamSize: 3,
        snowBridgeDepthM: 1.2,
        crevasseWidthM: 2.0,
        ambientTempF: 32,
        ropeIntervalM: 12,
      });

      expect(resultCaution.safetyStatus).toBe('caution_belayed_crossing_only');
      expect(resultCaution.thermalStability).toMatch(/marginal|freezing threshold|softening/i);
      expect(resultCaution.routeRecommendation).toMatch(/belayed individual crossing/i);
    });

    it('handles fallback zoneTitle if unknown zoneId provided', () => {
      const result = calculateCrevasseNavigation({
        zoneId: 'unknown-zone',
        teamSize: 3,
        snowBridgeDepthM: 1.2,
        crevasseWidthM: 2.0,
        ambientTempF: 24,
        ropeIntervalM: 12,
      });
      expect(result.zoneTitle).toBe('Glacier Route');
    });
  });

  describe('getGlacierGear', () => {
    it('returns all 6 mandatory glacier crevasse safety kit items', () => {
      const gear = getGlacierGear();
      expect(gear).toHaveLength(6);

      const mandatoryAll = gear.every((g) => g.mandatory === true);
      expect(mandatoryAll).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('avalanche-crevasse-probe');
      expect(ids).toContain('crevasse-rescue-pulley-kit');
      expect(ids).toContain('dynamic-dry-glacier-rope');
      expect(ids).toContain('forged-steel-crampons');
      expect(ids).toContain('technical-ice-axe');
      expect(ids).toContain('bivy-hypothermia-wrap');

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('probing');
      expect(categories).toContain('rescue');
      expect(categories).toContain('rigging');
      expect(categories).toContain('traction');
      expect(categories).toContain('anchoring');
      expect(categories).toContain('survival');
    });
  });
});
