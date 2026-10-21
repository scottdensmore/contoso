import { describe, it, expect } from 'vitest';
import {
  TEPUI_PLATEAU_SITES,
  filterTepuiSites,
  calculateTepuiNavigation,
  getTepuiGearChecklist,
  type TepuiNavigationInput,
} from '../tepui-navigation';

describe('tepui-navigation domain library', () => {
  describe('TEPUI_PLATEAU_SITES catalog', () => {
    it('exports all 4 real-world quartzite table-mountain tepui / sandstone fissure plateaus with complete metadata', () => {
      expect(TEPUI_PLATEAU_SITES).toHaveLength(4);

      const ids = TEPUI_PLATEAU_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'mount-roraima-maverick-plateau',
        'auyan-tepui-churun-rim-venezuela',
        'kukenan-matawi-tepui-venezuela',
        'chiribiquete-tepui-mesas-colombia',
      ]);

      const roraima = TEPUI_PLATEAU_SITES.find(
        (s) => s.id === 'mount-roraima-maverick-plateau'
      );
      expect(roraima).toBeDefined();
      expect(roraima?.name).toBe(
        'Mount Roraima Maverick Summit & Labyrinth Pseudokarst Plateau'
      );
      expect(roraima?.country).toBe('Venezuela');
      expect(roraima?.elevationMeters).toBe(2810);
      expect(roraima?.morphology).toBe('pseudokarst-fissure-grid');

      const auyan = TEPUI_PLATEAU_SITES.find(
        (s) => s.id === 'auyan-tepui-churun-rim-venezuela'
      );
      expect(auyan).toBeDefined();
      expect(auyan?.name).toBe(
        "Auyán-Tepui Devil's Canyon & Churún Orthoquartzite Mesa"
      );
      expect(auyan?.country).toBe('Venezuela');
      expect(auyan?.elevationMeters).toBe(2450);
      expect(auyan?.morphology).toBe('brocchinia-bog-sinkhole-mesa');

      const kukenan = TEPUI_PLATEAU_SITES.find(
        (s) => s.id === 'kukenan-matawi-tepui-venezuela'
      );
      expect(kukenan).toBeDefined();
      expect(kukenan?.name).toBe(
        'Kukenán (Matawi) Tepui Proterozoic Escarpment & Summit Chasm'
      );
      expect(kukenan?.country).toBe('Venezuela');
      expect(kukenan?.elevationMeters).toBe(2680);
      expect(kukenan?.morphology).toBe('orthoquartzite-pinnacle-plateau');

      const chiribiquete = TEPUI_PLATEAU_SITES.find(
        (s) => s.id === 'chiribiquete-tepui-mesas-colombia'
      );
      expect(chiribiquete).toBeDefined();
      expect(chiribiquete?.name).toBe(
        'Serranía de Chiribiquete Quartzite Table-Mountain Mesas'
      );
      expect(chiribiquete?.country).toBe('Colombia');
      expect(chiribiquete?.elevationMeters).toBe(980);
      expect(chiribiquete?.morphology).toBe('proterozoic-escarpment-ramp');

      for (const site of TEPUI_PLATEAU_SITES) {
        expect(site.highlandMassif.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.fissureDepthMeters).toBeGreaterThan(0);
        expect(site.cyanobacteriaBiofilmPct).toBeGreaterThanOrEqual(0);
        expect(site.cyanobacteriaBiofilmPct).toBeLessThanOrEqual(100);
        expect(site.orographicRainMmDay).toBeGreaterThan(0);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.navigationProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterTepuiSites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterTepuiSites(TEPUI_PLATEAU_SITES, {})).toHaveLength(4);

      const byCountry = filterTepuiSites(TEPUI_PLATEAU_SITES, {
        country: 'Colombia',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('chiribiquete-tepui-mesas-colombia');

      const byMorphology = filterTepuiSites(TEPUI_PLATEAU_SITES, {
        morphology: 'brocchinia-bog-sinkhole-mesa',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe('auyan-tepui-churun-rim-venezuela');

      const byDifficulty = filterTepuiSites(TEPUI_PLATEAU_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterTepuiSites(TEPUI_PLATEAU_SITES, {
        search: 'Maverick',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('mount-roraima-maverick-plateau');
    });
  });

  describe('calculateTepuiNavigation', () => {
    const validBase: TepuiNavigationInput = {
      cyanobacteriaBiofilmPct: 18,
      fissureGapWidthM: 0.6,
      orographicRainMmHr: 4,
      cloudVisibilityM: 220,
      slabSlopeDeg: 8,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateTepuiNavigation({ ...validBase, cyanobacteriaBiofilmPct: -1 })
      ).toThrow(/cyanobacteriaBiofilmPct/i);
      expect(() =>
        calculateTepuiNavigation({ ...validBase, cyanobacteriaBiofilmPct: 101 })
      ).toThrow(/cyanobacteriaBiofilmPct/i);
      expect(() =>
        calculateTepuiNavigation({ ...validBase, cyanobacteriaBiofilmPct: NaN })
      ).toThrow(/cyanobacteriaBiofilmPct/i);

      expect(() =>
        calculateTepuiNavigation({ ...validBase, fissureGapWidthM: 0.1 })
      ).toThrow(/fissureGapWidthM/i);
      expect(() =>
        calculateTepuiNavigation({ ...validBase, fissureGapWidthM: 6.1 })
      ).toThrow(/fissureGapWidthM/i);

      expect(() =>
        calculateTepuiNavigation({ ...validBase, orographicRainMmHr: -1 })
      ).toThrow(/orographicRainMmHr/i);
      expect(() =>
        calculateTepuiNavigation({ ...validBase, orographicRainMmHr: 91 })
      ).toThrow(/orographicRainMmHr/i);

      expect(() =>
        calculateTepuiNavigation({ ...validBase, cloudVisibilityM: 2 })
      ).toThrow(/cloudVisibilityM/i);
      expect(() =>
        calculateTepuiNavigation({ ...validBase, cloudVisibilityM: 501 })
      ).toThrow(/cloudVisibilityM/i);

      expect(() =>
        calculateTepuiNavigation({ ...validBase, slabSlopeDeg: -1 })
      ).toThrow(/slabSlopeDeg/i);
      expect(() =>
        calculateTepuiNavigation({ ...validBase, slabSlopeDeg: 46 })
      ).toThrow(/slabSlopeDeg/i);
    });

    it('computes low risk level and sticky-rubber-cairn-bearing protocol under mild dry-window plateau conditions', () => {
      const analysis = calculateTepuiNavigation(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.progressionProtocol).toBe('sticky-rubber-cairn-bearing');
      expect(analysis.biofilmTractionCoefficient).toBeGreaterThan(0.48);
      expect(analysis.biofilmTractionCoefficient).toBeLessThanOrEqual(0.78);
      expect(analysis.fissureBridgeCollapseRiskPct).toBeLessThan(28);
      expect(analysis.orographicBlackoutIndex).toBeGreaterThanOrEqual(1.0);
      expect(analysis.orographicBlackoutIndex).toBeLessThanOrEqual(10.0);
      expect(analysis.blackwaterStreamSurgeMultiplier).toBeGreaterThanOrEqual(1.0);
      expect(analysis.blackwaterStreamSurgeMultiplier).toBeLessThanOrEqual(6.5);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('decreases biofilmTractionCoefficient and increases fissureBridgeCollapseRiskPct, orographicBlackoutIndex, and blackwaterStreamSurgeMultiplier under severe tepui storm conditions', () => {
      const mild = calculateTepuiNavigation(validBase);
      const severe = calculateTepuiNavigation({
        cyanobacteriaBiofilmPct: 88,
        fissureGapWidthM: 4.5,
        orographicRainMmHr: 55,
        cloudVisibilityM: 8,
        slabSlopeDeg: 34,
      });

      expect(severe.biofilmTractionCoefficient).toBeLessThan(
        mild.biofilmTractionCoefficient
      );
      expect(severe.fissureBridgeCollapseRiskPct).toBeGreaterThan(
        mild.fissureBridgeCollapseRiskPct
      );
      expect(severe.orographicBlackoutIndex).toBeGreaterThan(
        mild.orographicBlackoutIndex
      );
      expect(severe.blackwaterStreamSurgeMultiplier).toBeGreaterThan(
        mild.blackwaterStreamSurgeMultiplier
      );
    });

    it('computes moderate risk level and felt-overboot-probe-peat-bridges protocol when moderate thresholds are met', () => {
      const analysis = calculateTepuiNavigation({
        cyanobacteriaBiofilmPct: 48,
        fissureGapWidthM: 1.8,
        orographicRainMmHr: 14,
        cloudVisibilityM: 50,
        slabSlopeDeg: 18,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.progressionProtocol).toBe(
        'felt-overboot-probe-peat-bridges'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and belayed-fissure-jump-gps-breadcrumb protocol when high thresholds are met', () => {
      const analysis = calculateTepuiNavigation({
        cyanobacteriaBiofilmPct: 72,
        fissureGapWidthM: 3.2,
        orographicRainMmHr: 28,
        cloudVisibilityM: 20,
        slabSlopeDeg: 26,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.progressionProtocol).toBe(
        'belayed-fissure-jump-gps-breadcrumb'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-shelter-under-el-hotel-overhang protocol under extreme biofilm slip, wide fissure bridge risk, or cloud whiteout', () => {
      const analysis = calculateTepuiNavigation({
        cyanobacteriaBiofilmPct: 92,
        fissureGapWidthM: 5.0,
        orographicRainMmHr: 60,
        cloudVisibilityM: 6,
        slabSlopeDeg: 38,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.progressionProtocol).toBe(
        'abort-shelter-under-el-hotel-overhang'
      );
      expect(analysis.biofilmTractionCoefficient).toBeLessThanOrEqual(0.22);
      expect(analysis.fissureBridgeCollapseRiskPct).toBeGreaterThanOrEqual(75);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getTepuiGearChecklist', () => {
    it('returns at least 6 gear items spanning biofilm-traction, fissure-spanning, cloud-navigation, and overhang-bivouac', () => {
      const gear = getTepuiGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('biofilm-traction')).toBe(true);
      expect(categories.has('fissure-spanning')).toBe(true);
      expect(categories.has('cloud-navigation')).toBe(true);
      expect(categories.has('overhang-bivouac')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
