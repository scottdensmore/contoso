import { describe, it, expect } from 'vitest';
import {
  TEPHRA_SLOPE_SITES,
   filterTephraSites,
  calculateTephraNavigation,
  getTephraGearChecklist,
  type TephraNavigationInput,
} from '../tephra-navigation';

describe('tephra-navigation domain library', () => {
  describe('TEPHRA_SLOPE_SITES catalog', () => {
    it('exports all 4 real-world volcanic tephra and lapilli scree sites with complete metadata', () => {
      expect(TEPHRA_SLOPE_SITES).toHaveLength(4);

      const ids = TEPHRA_SLOPE_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'yasur-ash-plain-vanuatu',
        'acatenango-fuego-tephra-guatemala',
        'tarawera-scoria-chute-nz',
        'chaiten-rhyolite-pumice-chile',
      ]);

      const yasur = TEPHRA_SLOPE_SITES.find(
        (s) => s.id === 'yasur-ash-plain-vanuatu'
      );
      expect(yasur).toBeDefined();
      expect(yasur?.name).toBe('Mount Yasur Ash Plain & Scoria Cone Apron');
      expect(yasur?.country).toBe('Vanuatu');
      expect(yasur?.elevationMeters).toBe(361);
      expect(yasur?.tephraLithology).toBe('scoria-lapilli');

      const acatenango = TEPHRA_SLOPE_SITES.find(
        (s) => s.id === 'acatenango-fuego-tephra-guatemala'
      );
      expect(acatenango).toBeDefined();
      expect(acatenango?.name).toBe(
        'Volcán Acatenango–Fuego Lapilli Saddle & Scree Chute'
      );
      expect(acatenango?.country).toBe('Guatemala');
      expect(acatenango?.elevationMeters).toBe(3880);
      expect(acatenango?.tephraLithology).toBe('lithic-cinder');

      const tarawera = TEPHRA_SLOPE_SITES.find(
        (s) => s.id === 'tarawera-scoria-chute-nz'
      );
      expect(tarawera).toBeDefined();
      expect(tarawera?.name).toBe(
        'Mount Tarawera Chasm & Basaltic Scoria Scree'
      );
      expect(tarawera?.country).toBe('New Zealand');
      expect(tarawera?.elevationMeters).toBe(1111);
      expect(tarawera?.tephraLithology).toBe('vesicular-pumice');

      const chaiten = TEPHRA_SLOPE_SITES.find(
        (s) => s.id === 'chaiten-rhyolite-pumice-chile'
      );
      expect(chaiten).toBeDefined();
      expect(chaiten?.name).toBe(
        'Volcán Chaitén Obsidian Dome & Cristobalite Ash Apron'
      );
      expect(chaiten?.country).toBe('Chile');
      expect(chaiten?.elevationMeters).toBe(1122);
      expect(chaiten?.tephraLithology).toBe('vitrophyric-ash');

      for (const site of TEPHRA_SLOPE_SITES) {
        expect(site.volcanicField.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.angleOfReposeDeg).toBeGreaterThan(0);
        expect(site.cristobaliteAshPct).toBeGreaterThanOrEqual(0);
        expect(site.medianLapilliMm).toBeGreaterThan(0);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.respiratorProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterTephraSites', () => {
    it('filters sites by country, lithology, difficulty, and search query', () => {
      expect(filterTephraSites(TEPHRA_SLOPE_SITES, {})).toHaveLength(4);

      const byCountry = filterTephraSites(TEPHRA_SLOPE_SITES, {
        country: 'Chile',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('chaiten-rhyolite-pumice-chile');

      const byLithology = filterTephraSites(TEPHRA_SLOPE_SITES, {
        lithology: 'vesicular-pumice',
      });
      expect(byLithology).toHaveLength(1);
      expect(byLithology[0].id).toBe('tarawera-scoria-chute-nz');

      const byDifficulty = filterTephraSites(TEPHRA_SLOPE_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterTephraSites(TEPHRA_SLOPE_SITES, {
        search: 'Acatenango',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('acatenango-fuego-tephra-guatemala');
    });
  });

  describe('calculateTephraNavigation', () => {
    const validBase: TephraNavigationInput = {
      slopeAngleDeg: 18,
      ashDepthCm: 12,
      windSpeedKmh: 10,
      cristobalitePct: 2,
      grainSizeMm: 8,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateTephraNavigation({ ...validBase, slopeAngleDeg: -1 })
      ).toThrow(/slopeAngleDeg/i);
      expect(() =>
        calculateTephraNavigation({ ...validBase, slopeAngleDeg: 56 })
      ).toThrow(/slopeAngleDeg/i);
      expect(() =>
        calculateTephraNavigation({ ...validBase, slopeAngleDeg: NaN })
      ).toThrow(/slopeAngleDeg/i);

      expect(() =>
        calculateTephraNavigation({ ...validBase, ashDepthCm: -5 })
      ).toThrow(/ashDepthCm/i);
      expect(() =>
        calculateTephraNavigation({ ...validBase, ashDepthCm: 301 })
      ).toThrow(/ashDepthCm/i);

      expect(() =>
        calculateTephraNavigation({ ...validBase, windSpeedKmh: -1 })
      ).toThrow(/windSpeedKmh/i);
      expect(() =>
        calculateTephraNavigation({ ...validBase, windSpeedKmh: 151 })
      ).toThrow(/windSpeedKmh/i);

      expect(() =>
        calculateTephraNavigation({ ...validBase, cristobalitePct: -0.5 })
      ).toThrow(/cristobalitePct/i);
      expect(() =>
        calculateTephraNavigation({ ...validBase, cristobalitePct: 36 })
      ).toThrow(/cristobalitePct/i);

      expect(() =>
        calculateTephraNavigation({ ...validBase, grainSizeMm: 0.005 })
      ).toThrow(/grainSizeMm/i);
      expect(() =>
        calculateTephraNavigation({ ...validBase, grainSizeMm: 65 })
      ).toThrow(/grainSizeMm/i);
    });

    it('computes low risk level and N95-goggles respirator class under benign coarse lapilli conditions', () => {
      const analysis = calculateTephraNavigation({
        slopeAngleDeg: 16,
        ashDepthCm: 10,
        windSpeedKmh: 8,
        cristobalitePct: 1.5,
        grainSizeMm: 10,
      });

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.respiratorClass).toBe('N95-goggles');
      expect(analysis.resuspendedPm10UgM3).toBeLessThan(250);
      expect(analysis.grainFlowFactorOfSafety).toBeGreaterThanOrEqual(1.35);
      expect(analysis.downslopeSlideRatio).toBeGreaterThanOrEqual(0.1);
      expect(analysis.downslopeSlideRatio).toBeLessThanOrEqual(2.5);
      expect(analysis.filterClogHours).toBeGreaterThanOrEqual(0.5);
      expect(analysis.filterClogHours).toBeLessThanOrEqual(12.0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes moderate risk level and P100-elastomeric-sealed-goggles class when moderate thresholds are met', () => {
      const analysis = calculateTephraNavigation({
        slopeAngleDeg: 26,
        ashDepthCm: 35,
        windSpeedKmh: 28,
        cristobalitePct: 6,
        grainSizeMm: 1.5,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.respiratorClass).toBe('P100-elastomeric-sealed-goggles');
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and P100-full-face-APR class under elevated wind, fine ash, or cristobalite levels', () => {
      const analysis = calculateTephraNavigation({
        slopeAngleDeg: 33,
        ashDepthCm: 65,
        windSpeedKmh: 50,
        cristobalitePct: 12,
        grainSizeMm: 0.25,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.respiratorClass).toBe('P100-full-face-APR');
      expect(analysis.resuspendedPm10UgM3).toBeGreaterThanOrEqual(700);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-silicosis-grainflow-hazard class under extreme cristobalite, slope, or PM10', () => {
      const analysis = calculateTephraNavigation({
        slopeAngleDeg: 39,
        ashDepthCm: 130,
        windSpeedKmh: 75,
        cristobalitePct: 22,
        grainSizeMm: 0.08,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.respiratorClass).toBe(
        'abort-silicosis-grainflow-hazard'
      );
      expect(analysis.resuspendedPm10UgM3).toBeGreaterThanOrEqual(1500);
      expect(analysis.grainFlowFactorOfSafety).toBeLessThan(0.95);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getTephraGearChecklist', () => {
    it('returns at least 6 gear items spanning respiration, eye-protection, gaiters-footwear, and navigation', () => {
      const gear = getTephraGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('respiration')).toBe(true);
      expect(categories.has('eye-protection')).toBe(true);
      expect(categories.has('gaiters-footwear')).toBe(true);
      expect(categories.has('navigation')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
