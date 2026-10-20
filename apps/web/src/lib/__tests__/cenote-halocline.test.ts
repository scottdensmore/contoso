import { describe, it, expect } from 'vitest';
import {
  CENOTE_HALOCLINE_SITES,
  filterCenoteSites,
  calculateCenoteHalocline,
  getCenoteGearChecklist,
  type CenoteHaloclineInput,
} from '../cenote-halocline';

describe('cenote-halocline domain library', () => {
  describe('CENOTE_HALOCLINE_SITES catalog', () => {
    it('exports all 4 real-world anchialine cenote & halocline cave systems with complete metadata', () => {
      expect(CENOTE_HALOCLINE_SITES).toHaveLength(4);

      const ids = CENOTE_HALOCLINE_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'ox-bel-ha-halocline-tulum-mexico',
        'angelita-h2s-cloud-tulum-mexico',
        'sac-actun-pet-cembalo-mexico',
        'dan-s-cave-abaco-anchialine-bahamas',
      ]);

      const oxBelHa = CENOTE_HALOCLINE_SITES.find(
        (s) => s.id === 'ox-bel-ha-halocline-tulum-mexico'
      );
      expect(oxBelHa).toBeDefined();
      expect(oxBelHa?.name).toBe(
        'Sistema Ox Bel Ha Anchialine Halocline Labyrinth'
      );
      expect(oxBelHa?.aquiferSystem).toBe('Quintana Roo Karst Aquifer');
      expect(oxBelHa?.country).toBe('Mexico');
      expect(oxBelHa?.elevationMeters).toBe(6);
      expect(oxBelHa?.morphology).toBe('anchialine-halocline-conduit');

      const angelita = CENOTE_HALOCLINE_SITES.find(
        (s) => s.id === 'angelita-h2s-cloud-tulum-mexico'
      );
      expect(angelita).toBeDefined();
      expect(angelita?.name).toBe(
        'Cenote Angelita Meromictic Hydrogen-Sulfide Cloud Shaft'
      );
      expect(angelita?.aquiferSystem).toBe('Tulum Karst Basin');
      expect(angelita?.country).toBe('Mexico');
      expect(angelita?.elevationMeters).toBe(8);
      expect(angelita?.morphology).toBe('meromictic-h2s-cloud-bell-sinkhole');

      const sacActun = CENOTE_HALOCLINE_SITES.find(
        (s) => s.id === 'sac-actun-pet-cembalo-mexico'
      );
      expect(sacActun).toBeDefined();
      expect(sacActun?.name).toBe(
        'Sistema Sac Actun & Dos Ojos Decorated Phreatic Conduit'
      );
      expect(sacActun?.country).toBe('Mexico');
      expect(sacActun?.elevationMeters).toBe(10);
      expect(sacActun?.morphology).toBe('decorated-speleothem-phreatic-maze');

      const dansCave = CENOTE_HALOCLINE_SITES.find(
        (s) => s.id === 'dan-s-cave-abaco-anchialine-bahamas'
      );
      expect(dansCave).toBeDefined();
      expect(dansCave?.name).toBe(
        "Dan's Cave & Sawmill Sink Anchialine Blue Hole Conduit"
      );
      expect(dansCave?.aquiferSystem).toBe('Great Abaco Karst Platform');
      expect(dansCave?.country).toBe('Bahamas');
      expect(dansCave?.region).toBe('Abaco Islands');
      expect(dansCave?.elevationMeters).toBe(4);
      expect(dansCave?.morphology).toBe('coastal-tidal-siphon-blue-hole');

      for (const site of CENOTE_HALOCLINE_SITES) {
        expect(site.aquiferSystem.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.haloclineDepthMeters).toBeGreaterThan(0);
        expect(site.salinityGradientPpt).toBeGreaterThanOrEqual(2);
        expect(site.salinityGradientPpt).toBeLessThanOrEqual(36);
        expect(site.tannicAttenuationPct).toBeGreaterThanOrEqual(0);
        expect(site.tannicAttenuationPct).toBeLessThanOrEqual(100);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.guidelineProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterCenoteSites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterCenoteSites(CENOTE_HALOCLINE_SITES, {})).toHaveLength(4);

      const byCountry = filterCenoteSites(CENOTE_HALOCLINE_SITES, {
        country: 'Bahamas',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('dan-s-cave-abaco-anchialine-bahamas');

      const byMorphology = filterCenoteSites(CENOTE_HALOCLINE_SITES, {
        morphology: 'meromictic-h2s-cloud-bell-sinkhole',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe('angelita-h2s-cloud-tulum-mexico');

      const byDifficulty = filterCenoteSites(CENOTE_HALOCLINE_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterCenoteSites(CENOTE_HALOCLINE_SITES, {
        search: 'Sac Actun',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('sac-actun-pet-cembalo-mexico');
    });
  });

  describe('calculateCenoteHalocline', () => {
    const validBase: CenoteHaloclineInput = {
      salinityDeltaPpt: 8,
      tannicDocMgL: 6,
      siltClayFractionPct: 12,
      penetrationDistanceM: 80,
      h2sConcentrationPpm: 0,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateCenoteHalocline({ ...validBase, salinityDeltaPpt: 1 })
      ).toThrow(/salinityDeltaPpt/i);
      expect(() =>
        calculateCenoteHalocline({ ...validBase, salinityDeltaPpt: 37 })
      ).toThrow(/salinityDeltaPpt/i);
      expect(() =>
        calculateCenoteHalocline({ ...validBase, salinityDeltaPpt: NaN })
      ).toThrow(/salinityDeltaPpt/i);

      expect(() =>
        calculateCenoteHalocline({ ...validBase, tannicDocMgL: -1 })
      ).toThrow(/tannicDocMgL/i);
      expect(() =>
        calculateCenoteHalocline({ ...validBase, tannicDocMgL: 61 })
      ).toThrow(/tannicDocMgL/i);

      expect(() =>
        calculateCenoteHalocline({ ...validBase, siltClayFractionPct: -1 })
      ).toThrow(/siltClayFractionPct/i);
      expect(() =>
        calculateCenoteHalocline({ ...validBase, siltClayFractionPct: 101 })
      ).toThrow(/siltClayFractionPct/i);

      expect(() =>
        calculateCenoteHalocline({ ...validBase, penetrationDistanceM: 9 })
      ).toThrow(/penetrationDistanceM/i);
      expect(() =>
        calculateCenoteHalocline({ ...validBase, penetrationDistanceM: 1201 })
      ).toThrow(/penetrationDistanceM/i);

      expect(() =>
        calculateCenoteHalocline({ ...validBase, h2sConcentrationPpm: -1 })
      ).toThrow(/h2sConcentrationPpm/i);
      expect(() =>
        calculateCenoteHalocline({ ...validBase, h2sConcentrationPpm: 81 })
      ).toThrow(/h2sConcentrationPpm/i);
    });

    it('computes low risk level and visual-daylight-cavern-zone-line protocol under mild cavern conditions', () => {
      const analysis = calculateCenoteHalocline(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.navigationProtocol).toBe(
        'visual-daylight-cavern-zone-line'
      );
      expect(analysis.schlierenOpticalBlurIndex).toBeGreaterThanOrEqual(1.0);
      expect(analysis.schlierenOpticalBlurIndex).toBeLessThan(4.0);
      expect(analysis.postMixVisibilityMeters).toBeGreaterThan(9.0);
      expect(analysis.postMixVisibilityMeters).toBeLessThanOrEqual(45.0);
      expect(analysis.buoyancyTrimShiftKg).toBeGreaterThanOrEqual(0.3);
      expect(analysis.buoyancyTrimShiftKg).toBeLessThanOrEqual(3.2);
      expect(analysis.ruleOfThirdsReserveBar).toBeGreaterThanOrEqual(70);
      expect(analysis.ruleOfThirdsReserveBar).toBeLessThanOrEqual(160);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases Schlieren blur, buoyancy shift, and rule-of-thirds reserve while decreasing visibility under severe halocline and silt conditions', () => {
      const mild = calculateCenoteHalocline(validBase);
      const severe = calculateCenoteHalocline({
        salinityDeltaPpt: 34,
        tannicDocMgL: 48,
        siltClayFractionPct: 88,
        penetrationDistanceM: 920,
        h2sConcentrationPpm: 38,
      });

      expect(severe.schlierenOpticalBlurIndex).toBeGreaterThan(
        mild.schlierenOpticalBlurIndex
      );
      expect(severe.buoyancyTrimShiftKg).toBeGreaterThan(
        mild.buoyancyTrimShiftKg
      );
      expect(severe.ruleOfThirdsReserveBar).toBeGreaterThan(
        mild.ruleOfThirdsReserveBar
      );
      expect(severe.postMixVisibilityMeters).toBeLessThan(
        mild.postMixVisibilityMeters
      );
    });

    it('computes moderate risk level and continuous-guideline-frog-kick-above-halocline protocol when moderate thresholds are met', () => {
      const analysis = calculateCenoteHalocline({
        salinityDeltaPpt: 18,
        tannicDocMgL: 16,
        siltClayFractionPct: 28,
        penetrationDistanceM: 260,
        h2sConcentrationPpm: 4,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.navigationProtocol).toBe(
        'continuous-guideline-frog-kick-above-halocline'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and blind-tactile-line-cookies-zero-vis-drill protocol when high thresholds are met', () => {
      const analysis = calculateCenoteHalocline({
        salinityDeltaPpt: 26,
        tannicDocMgL: 32,
        siltClayFractionPct: 58,
        penetrationDistanceM: 520,
        h2sConcentrationPpm: 14,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.navigationProtocol).toBe(
        'blind-tactile-line-cookies-zero-vis-drill'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-toxic-h2s-siltout-entrapment-hazard protocol under toxic H2S or zero-vis siltout conditions', () => {
      const analysis = calculateCenoteHalocline({
        salinityDeltaPpt: 34,
        tannicDocMgL: 48,
        siltClayFractionPct: 88,
        penetrationDistanceM: 920,
        h2sConcentrationPpm: 38,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.navigationProtocol).toBe(
        'abort-toxic-h2s-siltout-entrapment-hazard'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getCenoteGearChecklist', () => {
    it('returns at least 6 gear items spanning guideline-markers, lighting-optics, buoyancy-trim, and gas-redundancy', () => {
      const gear = getCenoteGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('guideline-markers')).toBe(true);
      expect(categories.has('lighting-optics')).toBe(true);
      expect(categories.has('buoyancy-trim')).toBe(true);
      expect(categories.has('gas-redundancy')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
