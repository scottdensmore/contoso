import { describe, it, expect } from 'vitest';
import {
  getAvalancheZones,
  getAvalancheZoneById,
  assessSlopeTerrain,
  getCompanionRescueGear,
  getDangerScaleInfo,
  DangerLevel,
} from './avalanche';

describe('avalanche library', () => {
  describe('getAvalancheZones', () => {
    it('returns all 5 Pacific Northwest forecast zones with valid ratings and problems', () => {
      const zones = getAvalancheZones();
      expect(zones).toHaveLength(5);

      const zoneIds = zones.map((z) => z.id);
      expect(zoneIds).toEqual([
        'stevens-pass',
        'snoqualmie-pass',
        'mount-baker',
        'mount-rainier',
        'olympics',
      ]);

      for (const zone of zones) {
        expect(zone.name).toBeTruthy();
        expect(zone.region).toBeTruthy();
        expect(zone.summary).toBeTruthy();
        expect(zone.lastUpdated).toBeTruthy();
        expect(zone.overallDanger).toBeGreaterThanOrEqual(1);
        expect(zone.overallDanger).toBeLessThanOrEqual(5);

        // Check elevation danger ratings
        expect(zone.dangerRatings.above_treeline).toBeDefined();
        expect(zone.dangerRatings.near_treeline).toBeDefined();
        expect(zone.dangerRatings.below_treeline).toBeDefined();

        // Check problems
        expect(zone.problems.length).toBeGreaterThan(0);
        for (const problem of zone.problems) {
          expect(problem.type).toBeTruthy();
          expect(problem.name).toBeTruthy();
          expect(problem.likelihood).toBeTruthy();
          expect(problem.expectedSize).toBeTruthy();
          expect(problem.aspects.length).toBeGreaterThan(0);
          expect(problem.elevations.length).toBeGreaterThan(0);
          expect(problem.travelAdvice).toBeTruthy();
        }
      }
    });

    it('contains specific details for Stevens Pass and Mount Baker', () => {
      const stevens = getAvalancheZones().find((z) => z.id === 'stevens-pass');
      expect(stevens).toBeDefined();
      expect(stevens?.name).toBe('Stevens Pass / Cascade Crest');
      expect(stevens?.region).toBe('Central Cascades');
      expect(stevens?.dangerRatings.above_treeline).toBe(3);
      expect(stevens?.dangerRatings.near_treeline).toBe(3);
      expect(stevens?.dangerRatings.below_treeline).toBe(2);
      expect(stevens?.overallDanger).toBe(3);
      expect(stevens?.problems.map((p) => p.name)).toEqual(['Wind Slab', 'Storm Slab']);

      const baker = getAvalancheZones().find((z) => z.id === 'mount-baker');
      expect(baker).toBeDefined();
      expect(baker?.name).toBe('Mount Baker / West Slopes North');
      expect(baker?.region).toBe('North Cascades');
      expect(baker?.overallDanger).toBe(4);
      expect(baker?.dangerRatings.above_treeline).toBe(4);
      expect(baker?.problems.map((p) => p.name)).toEqual(['Storm Slab', 'Cornice Fall']);
    });
  });

  describe('getAvalancheZoneById', () => {
    it('finds existing zone by id', () => {
      const zone = getAvalancheZoneById('snoqualmie-pass');
      expect(zone).toBeDefined();
      expect(zone?.id).toBe('snoqualmie-pass');
      expect(zone?.name).toBe('Snoqualmie Pass');
    });

    it('returns undefined for non-existent zone', () => {
      const zone = getAvalancheZoneById('unknown-peak');
      expect(zone).toBeUndefined();
    });
  });

  describe('getDangerScaleInfo', () => {
    it('returns proper labels and advice for all 5 danger levels', () => {
      const levels: DangerLevel[] = [1, 2, 3, 4, 5];
      const expectedNames = ['low', 'moderate', 'considerable', 'high', 'extreme'];

      levels.forEach((lvl, idx) => {
        const info = getDangerScaleInfo(lvl);
        expect(info.name).toBe(expectedNames[idx]);
        expect(info.travelAdvice).toBeTruthy();
        expect(info.color).toBeTruthy();
      });
    });
  });

  describe('assessSlopeTerrain', () => {
    it('evaluates low angle slopes (< 30 deg) as safe from triggering', () => {
      const result = assessSlopeTerrain({
        slopeAngleDeg: 25,
        elevationBand: 'near_treeline',
        aspect: 'NE',
        zoneId: 'stevens-pass',
      });

      expect(result.slopeRiskCategory).toBe('low_angle_safe');
      expect(result.isInAvalancheTerrain).toBe(false);
      expect(result.recommendation).toBe('favorable');
      expect(result.advisory).toContain('Slopes under 30° generally do not produce avalanches');
      expect(result.safetyProtocols.some((p) => p.toLowerCase().includes('overhead'))).toBe(true);
    });

    it('evaluates prime avalanche terrain (30 - 45 deg) with heightened risk when danger >= 3', () => {
      const result = assessSlopeTerrain({
        slopeAngleDeg: 37,
        elevationBand: 'above_treeline',
        aspect: 'E',
        zoneId: 'stevens-pass', // danger is 3
      });

      expect(result.slopeRiskCategory).toBe('prime_avalanche_terrain');
      expect(result.isInAvalancheTerrain).toBe(true);
      expect(['avoid', 'not_recommended']).toContain(result.recommendation);
      expect(result.advisory).toContain('Prime avalanche terrain (30°-45°)');
      expect(result.safetyProtocols).toContain('Travel one at a time across avalanche paths and suspect slopes.');
      expect(result.safetyProtocols).toContain('Expose only one person to the hazard at any given time.');
      expect(result.safetyProtocols).toContain('Stop only in protected islands of safety (dense timber, behind rock ridges).');
    });

    it('evaluates prime avalanche terrain (30 - 45 deg) under high danger (level 4) as avoid', () => {
      const result = assessSlopeTerrain({
        slopeAngleDeg: 35,
        elevationBand: 'above_treeline',
        aspect: 'N',
        zoneId: 'mount-baker', // danger is 4
      });

      expect(result.slopeRiskCategory).toBe('prime_avalanche_terrain');
      expect(result.isInAvalancheTerrain).toBe(true);
      expect(result.recommendation).toBe('avoid');
    });

    it('evaluates extreme steep terrain (> 45 deg) as high consequence sluff terrain', () => {
      const result = assessSlopeTerrain({
        slopeAngleDeg: 50,
        elevationBand: 'above_treeline',
        aspect: 'NW',
        zoneId: 'mount-rainier',
      });

      expect(result.slopeRiskCategory).toBe('extreme_steep_sluff');
      expect(result.isInAvalancheTerrain).toBe(true);
      expect(result.recommendation).toBe('avoid');
      expect(result.advisory).toContain('Extreme steep terrain');
    });
  });

  describe('getCompanionRescueGear', () => {
    it('returns the essential companion rescue gear items', () => {
      const gear = getCompanionRescueGear();
      expect(gear.length).toBeGreaterThanOrEqual(5);

      const transceiver = gear.find((g) => g.id === 'transceiver');
      expect(transceiver).toBeDefined();
      expect(transceiver?.essential).toBe(true);
      expect(transceiver?.batteryCheckRequired).toBe(true);

      const probe = gear.find((g) => g.id === 'probe');
      expect(probe).toBeDefined();
      expect(probe?.essential).toBe(true);

      const shovel = gear.find((g) => g.id === 'shovel');
      expect(shovel).toBeDefined();
      expect(shovel?.essential).toBe(true);
      expect(shovel?.description).toContain('aluminum');

      const inclinometer = gear.find((g) => g.id === 'inclinometer');
      expect(inclinometer).toBeDefined();

      const bivy = gear.find((g) => g.id === 'first-aid-bivy');
      expect(bivy).toBeDefined();
    });
  });
});
