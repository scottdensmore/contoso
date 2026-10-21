import { describe, it, expect } from 'vitest';
import {
  COBBLE_SPIT_SITES,
  filterCobbleSpitSites,
  calculateCobbleSpitTrekking,
  getCobbleGearChecklist,
  type CobbleSpitInput,
} from '../cobble-spit-trekking';

describe('cobble-spit-trekking domain library', () => {
  describe('COBBLE_SPIT_SITES catalog', () => {
    it('exports all 4 real-world intertidal cobble spits & kelp-wrack boulder reefs with complete metadata', () => {
      expect(COBBLE_SPIT_SITES).toHaveLength(4);

      const ids = COBBLE_SPIT_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'dungeness-spit-olympic-usa',
        'chesil-beach-fleet-uk',
        'west-coast-trail-boulder-reef-canada',
        'farewell-spit-boulder-bank-nz',
      ]);

      const dungeness = COBBLE_SPIT_SITES.find(
        (s) => s.id === 'dungeness-spit-olympic-usa'
      );
      expect(dungeness).toBeDefined();
      expect(dungeness?.name).toBe(
        'Dungeness Cuspate Shingle Spit & Drift-Log Berm'
      );
      expect(dungeness?.country).toBe('United States');
      expect(dungeness?.elevationMeters).toBe(4);
      expect(dungeness?.morphology).toBe('cuspate-shingle-spit');

      const chesil = COBBLE_SPIT_SITES.find(
        (s) => s.id === 'chesil-beach-fleet-uk'
      );
      expect(chesil).toBeDefined();
      expect(chesil?.name).toBe(
        'Chesil Beach Graded Flint & Chert Storm-Berm Tombolo'
      );
      expect(chesil?.country).toBe('United Kingdom');
      expect(chesil?.elevationMeters).toBe(14);
      expect(chesil?.morphology).toBe('storm-berm-cobble-bar');

      const wct = COBBLE_SPIT_SITES.find(
        (s) => s.id === 'west-coast-trail-boulder-reef-canada'
      );
      expect(wct).toBeDefined();
      expect(wct?.name).toBe(
        'Pachena–Carmanah Intertidal Kelp-Wrack Boulder Reef'
      );
      expect(wct?.country).toBe('Canada');
      expect(wct?.elevationMeters).toBe(6);
      expect(wct?.morphology).toBe('intertidal-boulder-reef');

      const farewell = COBBLE_SPIT_SITES.find(
        (s) => s.id === 'farewell-spit-boulder-bank-nz'
      );
      expect(farewell).toBeDefined();
      expect(farewell?.name).toBe(
        'Nelson Boulder Bank & Farewell Spit Granodiorite Cobble Bar'
      );
      expect(farewell?.country).toBe('New Zealand');
      expect(farewell?.elevationMeters).toBe(8);
      expect(farewell?.morphology).toBe('glacio-fluvial-tombolo');

      for (const site of COBBLE_SPIT_SITES) {
        expect(site.coastalSystem.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.medianCobbleDiameterMm).toBeGreaterThanOrEqual(16);
        expect(site.kelpWrackDepthCm).toBeGreaterThanOrEqual(0);
        expect(site.bermSlopeDeg).toBeGreaterThanOrEqual(0);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.footwearProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterCobbleSpitSites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterCobbleSpitSites(COBBLE_SPIT_SITES, {})).toHaveLength(4);

      const byCountry = filterCobbleSpitSites(COBBLE_SPIT_SITES, {
        country: 'New Zealand',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('farewell-spit-boulder-bank-nz');

      const byMorphology = filterCobbleSpitSites(COBBLE_SPIT_SITES, {
        morphology: 'storm-berm-cobble-bar',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe('chesil-beach-fleet-uk');

      const byDifficulty = filterCobbleSpitSites(COBBLE_SPIT_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterCobbleSpitSites(COBBLE_SPIT_SITES, {
        search: 'Dungeness',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('dungeness-spit-olympic-usa');
    });
  });

  describe('calculateCobbleSpitTrekking', () => {
    const validBase: CobbleSpitInput = {
      medianCobbleDiameterMm: 45,
      kelpWrackDepthCm: 5,
      bermSlopeDeg: 6,
      swellHeightM: 0.6,
      packLoadKg: 8,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateCobbleSpitTrekking({
          ...validBase,
          medianCobbleDiameterMm: 15,
        })
      ).toThrow(/medianCobbleDiameterMm/i);
      expect(() =>
        calculateCobbleSpitTrekking({
          ...validBase,
          medianCobbleDiameterMm: 601,
        })
      ).toThrow(/medianCobbleDiameterMm/i);
      expect(() =>
        calculateCobbleSpitTrekking({
          ...validBase,
          medianCobbleDiameterMm: NaN,
        })
      ).toThrow(/medianCobbleDiameterMm/i);

      expect(() =>
        calculateCobbleSpitTrekking({ ...validBase, kelpWrackDepthCm: -1 })
      ).toThrow(/kelpWrackDepthCm/i);
      expect(() =>
        calculateCobbleSpitTrekking({ ...validBase, kelpWrackDepthCm: 151 })
      ).toThrow(/kelpWrackDepthCm/i);

      expect(() =>
        calculateCobbleSpitTrekking({ ...validBase, bermSlopeDeg: -0.5 })
      ).toThrow(/bermSlopeDeg/i);
      expect(() =>
        calculateCobbleSpitTrekking({ ...validBase, bermSlopeDeg: 41 })
      ).toThrow(/bermSlopeDeg/i);

      expect(() =>
        calculateCobbleSpitTrekking({ ...validBase, swellHeightM: -0.1 })
      ).toThrow(/swellHeightM/i);
      expect(() =>
        calculateCobbleSpitTrekking({ ...validBase, swellHeightM: 8.5 })
      ).toThrow(/swellHeightM/i);

      expect(() =>
        calculateCobbleSpitTrekking({ ...validBase, packLoadKg: -1 })
      ).toThrow(/packLoadKg/i);
      expect(() =>
        calculateCobbleSpitTrekking({ ...validBase, packLoadKg: 46 })
      ).toThrow(/packLoadKg/i);
    });

    it('computes low risk level and trail-runner-trekking-poles footwear class under benign low-swell shingle conditions', () => {
      const analysis = calculateCobbleSpitTrekking(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.footwearClass).toBe('trail-runner-trekking-poles');
      expect(analysis.mucilageSlipCoefficient).toBeGreaterThan(0.42);
      expect(analysis.ankleRollTorqueIndex).toBeLessThan(3.8);
      expect(analysis.swashRunupCutoffMinutes).toBeGreaterThan(100);
      expect(analysis.effectivePaceKmH).toBeGreaterThan(2.5);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('drops mucilageSlipCoefficient sharply as kelpWrackDepthCm and swellHeightM increase', () => {
      const cleanShingle = calculateCobbleSpitTrekking({
        medianCobbleDiameterMm: 60,
        kelpWrackDepthCm: 2,
        bermSlopeDeg: 8,
        swellHeightM: 0.4,
        packLoadKg: 10,
      });
      const heavyKelpMucilage = calculateCobbleSpitTrekking({
        medianCobbleDiameterMm: 60,
        kelpWrackDepthCm: 120,
        bermSlopeDeg: 8,
        swellHeightM: 3.5,
        packLoadKg: 10,
      });

      expect(heavyKelpMucilage.mucilageSlipCoefficient).toBeLessThan(
        cleanShingle.mucilageSlipCoefficient - 0.25
      );
    });

    it('computes moderate risk level and high-cuff-scree-boot-dual-poles class when moderate thresholds are met', () => {
      const analysis = calculateCobbleSpitTrekking({
        medianCobbleDiameterMm: 140,
        kelpWrackDepthCm: 35,
        bermSlopeDeg: 14,
        swellHeightM: 1.8,
        packLoadKg: 16,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.footwearClass).toBe('high-cuff-scree-boot-dual-poles');
      expect(analysis.ankleRollTorqueIndex).toBeGreaterThanOrEqual(3.8);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and tungsten-studded-felt-boot-wading-staff class under bowling-ball cobbles and thick kelp wrack', () => {
      const analysis = calculateCobbleSpitTrekking({
        medianCobbleDiameterMm: 240,
        kelpWrackDepthCm: 85,
        bermSlopeDeg: 24,
        swellHeightM: 3.1,
        packLoadKg: 26,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.footwearClass).toBe(
        'tungsten-studded-felt-boot-wading-staff'
      );
      expect(analysis.ankleRollTorqueIndex).toBeGreaterThanOrEqual(6.0);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-swash-overwash-entrapment class under storm swell and severe kelp-wrack boulder instability', () => {
      const analysis = calculateCobbleSpitTrekking({
        medianCobbleDiameterMm: 310,
        kelpWrackDepthCm: 130,
        bermSlopeDeg: 34,
        swellHeightM: 4.8,
        packLoadKg: 38,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.footwearClass).toBe('abort-swash-overwash-entrapment');
      expect(analysis.mucilageSlipCoefficient).toBeLessThanOrEqual(0.18);
      expect(analysis.ankleRollTorqueIndex).toBeGreaterThanOrEqual(8.0);
      expect(analysis.swashRunupCutoffMinutes).toBeLessThanOrEqual(25);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getCobbleGearChecklist', () => {
    it('returns at least 6 gear items spanning footwear, stability-poles, tidal-navigation, and immersion-protection', () => {
      const gear = getCobbleGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('footwear')).toBe(true);
      expect(categories.has('stability-poles')).toBe(true);
      expect(categories.has('tidal-navigation')).toBe(true);
      expect(categories.has('immersion-protection')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
