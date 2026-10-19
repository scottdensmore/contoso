import { describe, it, expect } from 'vitest';
import {
  TUSSOCK_HEADLAND_SITES,
  filterTussockSites,
  calculateTussockHeadland,
  getTussockGearChecklist,
  type TussockHeadlandInput,
} from '../tussock-headland';

describe('tussock-headland domain library', () => {
  describe('TUSSOCK_HEADLAND_SITES catalog', () => {
    it('exports all 4 real-world subantarctic tussock-grass headlands with complete metadata', () => {
      expect(TUSSOCK_HEADLAND_SITES).toHaveLength(4);

      const ids = TUSSOCK_HEADLAND_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'fortuna-bay-stromness-south-georgia',
        'macquarie-island-featherbed-australia',
        'enderby-island-megaherb-auckland-nz',
        'kerguelen-courbet-azorella-france',
      ]);

      const fortuna = TUSSOCK_HEADLAND_SITES.find(
        (s) => s.id === 'fortuna-bay-stromness-south-georgia'
      );
      expect(fortuna).toBeDefined();
      expect(fortuna?.name).toBe(
        'Fortuna Bay & Shackleton Gap Poa flabellata Tussock Headland'
      );
      expect(fortuna?.archipelago).toBe('South Georgia Archipelago');
      expect(fortuna?.country).toBe('United Kingdom');
      expect(fortuna?.elevationMeters).toBe(310);
      expect(fortuna?.morphology).toBe('poa-flabellata-pedestal-maze');

      const macquarie = TUSSOCK_HEADLAND_SITES.find(
        (s) => s.id === 'macquarie-island-featherbed-australia'
      );
      expect(macquarie).toBeDefined();
      expect(macquarie?.name).toBe(
        'Macquarie Island Featherbed Peat Terrace & Katabatic Escarpment'
      );
      expect(macquarie?.country).toBe('Australia');
      expect(macquarie?.elevationMeters).toBe(240);
      expect(macquarie?.morphology).toBe('seal-wallow-bog-trench-apron');

      const enderby = TUSSOCK_HEADLAND_SITES.find(
        (s) => s.id === 'enderby-island-megaherb-auckland-nz'
      );
      expect(enderby).toBeDefined();
      expect(enderby?.name).toBe(
        'Enderby & Adams Island Chionochloa Tussock & Megaherb Bog'
      );
      expect(enderby?.country).toBe('New Zealand');
      expect(enderby?.elevationMeters).toBe(195);
      expect(enderby?.morphology).toBe('chionochloa-megaherb-peat-terrace');

      const kerguelen = TUSSOCK_HEADLAND_SITES.find(
        (s) => s.id === 'kerguelen-courbet-azorella-france'
      );
      expect(kerguelen).toBeDefined();
      expect(kerguelen?.name).toBe(
        "Péninsule Courbet & Baie de l'Oiseau Azorella Feldmark Headland"
      );
      expect(kerguelen?.country).toBe('France');
      expect(kerguelen?.elevationMeters).toBe(160);
      expect(kerguelen?.morphology).toBe('azorella-feldmark-katabatic-ridge');

      for (const site of TUSSOCK_HEADLAND_SITES) {
        expect(site.archipelago.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.pedestalHeightM).toBeGreaterThanOrEqual(0.2);
        expect(site.katabaticGustKmh).toBeGreaterThanOrEqual(40);
        expect(site.wallowTrenchDepthCm).toBeGreaterThanOrEqual(10);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.routingProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterTussockSites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterTussockSites(TUSSOCK_HEADLAND_SITES, {})).toHaveLength(4);

      const byCountry = filterTussockSites(TUSSOCK_HEADLAND_SITES, {
        country: 'Australia',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('macquarie-island-featherbed-australia');

      const byMorphology = filterTussockSites(TUSSOCK_HEADLAND_SITES, {
        morphology: 'chionochloa-megaherb-peat-terrace',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe('enderby-island-megaherb-auckland-nz');

      const byDifficulty = filterTussockSites(TUSSOCK_HEADLAND_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterTussockSites(TUSSOCK_HEADLAND_SITES, {
        search: 'Kerguelen',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('kerguelen-courbet-azorella-france');
    });
  });

  describe('calculateTussockHeadland', () => {
    const validBase: TussockHeadlandInput = {
      pedestalHeightM: 0.6,
      katabaticWindKmh: 25,
      wallowTrenchDepthCm: 15,
      ambientTempC: 6,
      sealDensityPerHa: 8,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateTussockHeadland({ ...validBase, pedestalHeightM: 0.1 })
      ).toThrow(/pedestalHeightM/i);
      expect(() =>
        calculateTussockHeadland({ ...validBase, pedestalHeightM: 3.1 })
      ).toThrow(/pedestalHeightM/i);
      expect(() =>
        calculateTussockHeadland({ ...validBase, pedestalHeightM: NaN })
      ).toThrow(/pedestalHeightM/i);

      expect(() =>
        calculateTussockHeadland({ ...validBase, katabaticWindKmh: -1 })
      ).toThrow(/katabaticWindKmh/i);
      expect(() =>
        calculateTussockHeadland({ ...validBase, katabaticWindKmh: 161 })
      ).toThrow(/katabaticWindKmh/i);

      expect(() =>
        calculateTussockHeadland({ ...validBase, wallowTrenchDepthCm: -1 })
      ).toThrow(/wallowTrenchDepthCm/i);
      expect(() =>
        calculateTussockHeadland({ ...validBase, wallowTrenchDepthCm: 181 })
      ).toThrow(/wallowTrenchDepthCm/i);

      expect(() =>
        calculateTussockHeadland({ ...validBase, ambientTempC: -16 })
      ).toThrow(/ambientTempC/i);
      expect(() =>
        calculateTussockHeadland({ ...validBase, ambientTempC: 19 })
      ).toThrow(/ambientTempC/i);

      expect(() =>
        calculateTussockHeadland({ ...validBase, sealDensityPerHa: -1 })
      ).toThrow(/sealDensityPerHa/i);
      expect(() =>
        calculateTussockHeadland({ ...validBase, sealDensityPerHa: 121 })
      ).toThrow(/sealDensityPerHa/i);
    });

    it('computes low risk level and crown-hop-raised-peat-pedestals strategy under calm tussock conditions', () => {
      const analysis = calculateTussockHeadland(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.routingStrategy).toBe('crown-hop-raised-peat-pedestals');
      expect(analysis.katabaticKnockdownIndex).toBeGreaterThanOrEqual(1.0);
      expect(analysis.katabaticKnockdownIndex).toBeLessThan(3.8);
      expect(analysis.interPedestalPitEntrapmentPct).toBeLessThan(25);
      expect(analysis.windChillEffectiveC).toBeGreaterThan(-18);
      expect(analysis.faunaEncounterDetourMultiplier).toBeGreaterThanOrEqual(
        1.0
      );
      expect(analysis.faunaEncounterDetourMultiplier).toBeLessThanOrEqual(3.2);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases katabaticKnockdownIndex, interPedestalPitEntrapmentPct, and faunaEncounterDetourMultiplier under severe headland conditions', () => {
      const mild = calculateTussockHeadland(validBase);
      const severe = calculateTussockHeadland({
        pedestalHeightM: 2.2,
        katabaticWindKmh: 105,
        wallowTrenchDepthCm: 120,
        ambientTempC: -4,
        sealDensityPerHa: 85,
      });

      expect(severe.katabaticKnockdownIndex).toBeGreaterThan(
        mild.katabaticKnockdownIndex
      );
      expect(severe.interPedestalPitEntrapmentPct).toBeGreaterThan(
        mild.interPedestalPitEntrapmentPct
      );
      expect(severe.windChillEffectiveC).toBeLessThan(mild.windChillEffectiveC);
      expect(severe.faunaEncounterDetourMultiplier).toBeGreaterThan(
        mild.faunaEncounterDetourMultiplier
      );
    });

    it('computes moderate risk level and low-crawl-leeward-trench-probe strategy when moderate thresholds are met', () => {
      const analysis = calculateTussockHeadland({
        pedestalHeightM: 1.2,
        katabaticWindKmh: 55,
        wallowTrenchDepthCm: 50,
        ambientTempC: 3,
        sealDensityPerHa: 30,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.routingStrategy).toBe('low-crawl-leeward-trench-probe');
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and detour-inland-feldmark-bench strategy when high thresholds are met', () => {
      const analysis = calculateTussockHeadland({
        pedestalHeightM: 1.9,
        katabaticWindKmh: 90,
        wallowTrenchDepthCm: 95,
        ambientTempC: -1,
        sealDensityPerHa: 72,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.routingStrategy).toBe('detour-inland-feldmark-bench');
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-katabatic-bivouac-lee-tussock strategy under extreme katabatic gusts or deep wallow entrapment', () => {
      const analysis = calculateTussockHeadland({
        pedestalHeightM: 2.5,
        katabaticWindKmh: 125,
        wallowTrenchDepthCm: 145,
        ambientTempC: -8,
        sealDensityPerHa: 95,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.routingStrategy).toBe(
        'abort-katabatic-bivouac-lee-tussock'
      );
      expect(analysis.katabaticKnockdownIndex).toBeGreaterThanOrEqual(8.0);
      expect(analysis.interPedestalPitEntrapmentPct).toBeGreaterThanOrEqual(75);
      expect(analysis.windChillEffectiveC).toBeLessThanOrEqual(-18);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getTussockGearChecklist', () => {
    it('returns at least 6 gear items spanning katabatic-shell, bog-trench-probing, fauna-biosecurity, and dead-reckoning', () => {
      const gear = getTussockGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('katabatic-shell')).toBe(true);
      expect(categories.has('bog-trench-probing')).toBe(true);
      expect(categories.has('fauna-biosecurity')).toBe(true);
      expect(categories.has('dead-reckoning')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
