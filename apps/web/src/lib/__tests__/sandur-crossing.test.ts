import { describe, it, expect } from 'vitest';
import {
  SANDUR_CROSSING_SITES,
  filterSandurSites,
  calculateSandurCrossing,
  getSandurGearChecklist,
  type SandurCrossingInput,
} from '../sandur-crossing';

describe('sandur-crossing domain library', () => {
  describe('SANDUR_CROSSING_SITES catalog', () => {
    it('exports all 4 real-world glacial outwash braided-river sandur crossings with complete metadata', () => {
      expect(SANDUR_CROSSING_SITES).toHaveLength(4);

      const ids = SANDUR_CROSSING_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'skeidararsandur-krossa-iceland',
        'slim-river-kaskawulsh-canada',
        'rakaia-gorge-braids-nz',
        'copper-river-sheridan-alaska-usa',
      ]);

      const iceland = SANDUR_CROSSING_SITES.find(
        (s) => s.id === 'skeidararsandur-krossa-iceland'
      );
      expect(iceland).toBeDefined();
      expect(iceland?.name).toBe(
        'Skeiðarársandur & Þórsmörk Krossá Braided Outwash Plain'
      );
      expect(iceland?.country).toBe('Iceland');
      expect(iceland?.elevationMeters).toBe(180);
      expect(iceland?.morphology).toBe('jokulhlaup-basalt-sandur');

      const canada = SANDUR_CROSSING_SITES.find(
        (s) => s.id === 'slim-river-kaskawulsh-canada'
      );
      expect(canada).toBeDefined();
      expect(canada?.name).toBe(
        "Kaskawulsh & Slims River (Ä'äy Chù) Glacial Silt Outwash"
      );
      expect(canada?.country).toBe('Canada');
      expect(canada?.elevationMeters).toBe(810);
      expect(canada?.morphology).toBe('anastomosing-glacial-silt-braid');

      const nz = SANDUR_CROSSING_SITES.find(
        (s) => s.id === 'rakaia-gorge-braids-nz'
      );
      expect(nz).toBeDefined();
      expect(nz?.name).toBe(
        'Rakaia & Hopkins Braided Greywacke Shingle Outwash'
      );
      expect(nz?.country).toBe('New Zealand');
      expect(nz?.elevationMeters).toBe(490);
      expect(nz?.morphology).toBe('proglacial-boulder-outwash-fan');

      const alaska = SANDUR_CROSSING_SITES.find(
        (s) => s.id === 'copper-river-sheridan-alaska-usa'
      );
      expect(alaska).toBeDefined();
      expect(alaska?.name).toBe(
        'Sheridan & Scott Glacier Outwash Sandur Delta'
      );
      expect(alaska?.country).toBe('United States');
      expect(alaska?.elevationMeters).toBe(45);
      expect(alaska?.morphology).toBe('tidal-estuarine-glacial-delta');

      for (const site of SANDUR_CROSSING_SITES) {
        expect(site.glacierSource.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.activeBraidCount).toBeGreaterThanOrEqual(2);
        expect(site.diurnalSurgeRatio).toBeGreaterThanOrEqual(1.1);
        expect(site.siltFlourConcentrationMgL).toBeGreaterThanOrEqual(50);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.wadingProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterSandurSites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterSandurSites(SANDUR_CROSSING_SITES, {})).toHaveLength(4);

      const byCountry = filterSandurSites(SANDUR_CROSSING_SITES, {
        country: 'Iceland',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('skeidararsandur-krossa-iceland');

      const byMorphology = filterSandurSites(SANDUR_CROSSING_SITES, {
        morphology: 'anastomosing-glacial-silt-braid',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe('slim-river-kaskawulsh-canada');

      const byDifficulty = filterSandurSites(SANDUR_CROSSING_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterSandurSites(SANDUR_CROSSING_SITES, {
        search: 'Rakaia',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('rakaia-gorge-braids-nz');
    });
  });

  describe('calculateSandurCrossing', () => {
    const validBase: SandurCrossingInput = {
      waterDepthM: 0.3,
      flowVelocityMs: 0.9,
      hourOfDay24: 6,
      siltFlourConcentrationMgL: 250,
      hikerMassKg: 80,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateSandurCrossing({ ...validBase, waterDepthM: 0.05 })
      ).toThrow(/waterDepthM/i);
      expect(() =>
        calculateSandurCrossing({ ...validBase, waterDepthM: 2.1 })
      ).toThrow(/waterDepthM/i);
      expect(() =>
        calculateSandurCrossing({ ...validBase, waterDepthM: NaN })
      ).toThrow(/waterDepthM/i);

      expect(() =>
        calculateSandurCrossing({ ...validBase, flowVelocityMs: 0.05 })
      ).toThrow(/flowVelocityMs/i);
      expect(() =>
        calculateSandurCrossing({ ...validBase, flowVelocityMs: 5.1 })
      ).toThrow(/flowVelocityMs/i);

      expect(() =>
        calculateSandurCrossing({ ...validBase, hourOfDay24: -1 })
      ).toThrow(/hourOfDay24/i);
      expect(() =>
        calculateSandurCrossing({ ...validBase, hourOfDay24: 24 })
      ).toThrow(/hourOfDay24/i);

      expect(() =>
        calculateSandurCrossing({ ...validBase, siltFlourConcentrationMgL: 49 })
      ).toThrow(/siltFlourConcentrationMgL/i);
      expect(() =>
        calculateSandurCrossing({
          ...validBase,
          siltFlourConcentrationMgL: 5001,
        })
      ).toThrow(/siltFlourConcentrationMgL/i);

      expect(() =>
        calculateSandurCrossing({ ...validBase, hikerMassKg: 39 })
      ).toThrow(/hikerMassKg/i);
      expect(() =>
        calculateSandurCrossing({ ...validBase, hikerMassKg: 151 })
      ).toThrow(/hikerMassKg/i);
    });

    it('computes low risk level and solo-diagonal-downstream-pole technique under dawn shallow riffle conditions', () => {
      const analysis = calculateSandurCrossing(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.crossingTechnique).toBe('solo-diagonal-downstream-pole');
      expect(analysis.diurnalDischargeMultiplier).toBeGreaterThanOrEqual(0.75);
      expect(analysis.diurnalDischargeMultiplier).toBeLessThanOrEqual(0.9);
      expect(analysis.hydrodynamicMomentumProduct).toBeLessThan(0.55);
      expect(analysis.quicksandLiquefactionIndex).toBeLessThan(5.0);
      expect(analysis.bedloadBoulderRollRiskPct).toBeLessThan(25);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('peaks diurnalDischargeMultiplier in late afternoon (14-20) compared to dawn (4-8) and increases momentum product and boulder roll risk', () => {
      const dawnCrossing = calculateSandurCrossing({
        waterDepthM: 0.45,
        flowVelocityMs: 1.4,
        hourOfDay24: 6,
        siltFlourConcentrationMgL: 600,
        hikerMassKg: 75,
      });
      const afternoonSurge = calculateSandurCrossing({
        waterDepthM: 0.45,
        flowVelocityMs: 1.4,
        hourOfDay24: 17,
        siltFlourConcentrationMgL: 600,
        hikerMassKg: 75,
      });

      expect(afternoonSurge.diurnalDischargeMultiplier).toBeGreaterThanOrEqual(
        1.35
      );
      expect(afternoonSurge.diurnalDischargeMultiplier).toBeLessThanOrEqual(
        1.65
      );
      expect(afternoonSurge.diurnalDischargeMultiplier).toBeGreaterThan(
        dawnCrossing.diurnalDischargeMultiplier
      );
      expect(afternoonSurge.hydrodynamicMomentumProduct).toBeGreaterThan(
        dawnCrossing.hydrodynamicMomentumProduct
      );
      expect(afternoonSurge.bedloadBoulderRollRiskPct).toBeGreaterThan(
        dawnCrossing.bedloadBoulderRollRiskPct
      );
    });

    it('computes moderate risk level and tripod-wedge-linked-belt-unbuckled technique when moderate thresholds are met', () => {
      const analysis = calculateSandurCrossing({
        waterDepthM: 0.6,
        flowVelocityMs: 1.3,
        hourOfDay24: 10,
        siltFlourConcentrationMgL: 1600,
        hikerMassKg: 78,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.crossingTechnique).toBe(
        'tripod-wedge-linked-belt-unbuckled'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and wait-for-dawn-low-melt-window technique when high thresholds are met', () => {
      const analysis = calculateSandurCrossing({
        waterDepthM: 0.85,
        flowVelocityMs: 1.05,
        hourOfDay24: 15,
        siltFlourConcentrationMgL: 3400,
        hikerMassKg: 75,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.crossingTechnique).toBe('wait-for-dawn-low-melt-window');
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-impassable-glacial-torrent technique under deep high-velocity afternoon melt surge', () => {
      const analysis = calculateSandurCrossing({
        waterDepthM: 1.25,
        flowVelocityMs: 3.1,
        hourOfDay24: 17,
        siltFlourConcentrationMgL: 4400,
        hikerMassKg: 68,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.crossingTechnique).toBe(
        'abort-impassable-glacial-torrent'
      );
      expect(analysis.hydrodynamicMomentumProduct).toBeGreaterThanOrEqual(1.45);
      expect(analysis.bedloadBoulderRollRiskPct).toBeGreaterThanOrEqual(75);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getSandurGearChecklist', () => {
    it('returns at least 6 gear items spanning wading-stability, pack-waterproofing, quicksand-extraction, and thermal-recovery', () => {
      const gear = getSandurGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('wading-stability')).toBe(true);
      expect(categories.has('pack-waterproofing')).toBe(true);
      expect(categories.has('quicksand-extraction')).toBe(true);
      expect(categories.has('thermal-recovery')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
