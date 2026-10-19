import { describe, it, expect } from 'vitest';
import {
  TIANKENG_DESCENT_SITES,
  filterTiankengSites,
  calculateTiankengDescent,
  getTiankengGearChecklist,
  type TiankengDescentInput,
} from '../tiankeng-descent';

describe('tiankeng-descent domain library', () => {
  describe('TIANKENG_DESCENT_SITES catalog', () => {
    it('exports all 4 real-world giant karst collapse sinkholes (tiankengs) with complete metadata', () => {
      expect(TIANKENG_DESCENT_SITES).toHaveLength(4);

      const ids = TIANKENG_DESCENT_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'xiaozhai-tiankeng-chongqing-china',
        'dashiwei-tiankeng-leye-china',
        'sotano-de-las-golondrinas-mexico',
        'sima-humboldt-sarisarinama-venezuela',
      ]);

      const xiaozhai = TIANKENG_DESCENT_SITES.find(
        (s) => s.id === 'xiaozhai-tiankeng-chongqing-china'
      );
      expect(xiaozhai).toBeDefined();
      expect(xiaozhai?.name).toBe(
        'Xiaozhai Tiankeng Double-Nested Collapse Mega-Doline'
      );
      expect(xiaozhai?.country).toBe('China');
      expect(xiaozhai?.elevationMeters).toBe(1331);
      expect(xiaozhai?.morphology).toBe('collapse-mega-doline');

      const dashiwei = TIANKENG_DESCENT_SITES.find(
        (s) => s.id === 'dashiwei-tiankeng-leye-china'
      );
      expect(dashiwei).toBeDefined();
      expect(dashiwei?.name).toBe(
        'Dashiwei Tiankeng Subterranean Cloud-Forest Rim'
      );
      expect(dashiwei?.country).toBe('China');
      expect(dashiwei?.elevationMeters).toBe(1466);
      expect(dashiwei?.morphology).toBe('twin-window-karst-chasm');

      const golondrinas = TIANKENG_DESCENT_SITES.find(
        (s) => s.id === 'sotano-de-las-golondrinas-mexico'
      );
      expect(golondrinas).toBeDefined();
      expect(golondrinas?.name).toBe(
        'Sótano de las Golondrinas Overhung Free-Fall Bell Shaft'
      );
      expect(golondrinas?.country).toBe('Mexico');
      expect(golondrinas?.elevationMeters).toBe(815);
      expect(golondrinas?.morphology).toBe('overhung-bell-shaft-sinkhole');

      const sima = TIANKENG_DESCENT_SITES.find(
        (s) => s.id === 'sima-humboldt-sarisarinama-venezuela'
      );
      expect(sima).toBeDefined();
      expect(sima?.name).toBe(
        'Sima Mayor de Sarisariñama Quartzite Tepui Sinkhole'
      );
      expect(sima?.country).toBe('Venezuela');
      expect(sima?.elevationMeters).toBe(1950);
      expect(sima?.morphology).toBe('erosional-waterfall-tiankeng');

      for (const site of TIANKENG_DESCENT_SITES) {
        expect(site.karstProvince.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.verticalDepthMeters).toBeGreaterThanOrEqual(300);
        expect(site.rebelayPitchCount).toBeGreaterThanOrEqual(0);
        expect(site.fogSaturationPct).toBeGreaterThanOrEqual(30);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.riggingProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterTiankengSites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterTiankengSites(TIANKENG_DESCENT_SITES, {})).toHaveLength(4);

      const byCountry = filterTiankengSites(TIANKENG_DESCENT_SITES, {
        country: 'Mexico',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('sotano-de-las-golondrinas-mexico');

      const byMorphology = filterTiankengSites(TIANKENG_DESCENT_SITES, {
        morphology: 'twin-window-karst-chasm',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe('dashiwei-tiankeng-leye-china');

      const byDifficulty = filterTiankengSites(TIANKENG_DESCENT_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterTiankengSites(TIANKENG_DESCENT_SITES, {
        search: 'Sarisariñama',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('sima-humboldt-sarisarinama-venezuela');
    });
  });

  describe('calculateTiankengDescent', () => {
    const validBase: TiankengDescentInput = {
      verticalDropM: 120,
      rebelayCount: 4,
      fogHumidityPct: 65,
      overhangAngleDeg: -10,
      waterfallSprayLitresMin: 10,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateTiankengDescent({ ...validBase, verticalDropM: 49 })
      ).toThrow(/verticalDropM/i);
      expect(() =>
        calculateTiankengDescent({ ...validBase, verticalDropM: 701 })
      ).toThrow(/verticalDropM/i);
      expect(() =>
        calculateTiankengDescent({ ...validBase, verticalDropM: NaN })
      ).toThrow(/verticalDropM/i);

      expect(() =>
        calculateTiankengDescent({ ...validBase, rebelayCount: -1 })
      ).toThrow(/rebelayCount/i);
      expect(() =>
        calculateTiankengDescent({ ...validBase, rebelayCount: 21 })
      ).toThrow(/rebelayCount/i);

      expect(() =>
        calculateTiankengDescent({ ...validBase, fogHumidityPct: 29 })
      ).toThrow(/fogHumidityPct/i);
      expect(() =>
        calculateTiankengDescent({ ...validBase, fogHumidityPct: 101 })
      ).toThrow(/fogHumidityPct/i);

      expect(() =>
        calculateTiankengDescent({ ...validBase, overhangAngleDeg: -26 })
      ).toThrow(/overhangAngleDeg/i);
      expect(() =>
        calculateTiankengDescent({ ...validBase, overhangAngleDeg: 31 })
      ).toThrow(/overhangAngleDeg/i);

      expect(() =>
        calculateTiankengDescent({ ...validBase, waterfallSprayLitresMin: -1 })
      ).toThrow(/waterfallSprayLitresMin/i);
      expect(() =>
        calculateTiankengDescent({ ...validBase, waterfallSprayLitresMin: 501 })
      ).toThrow(/waterfallSprayLitresMin/i);
    });

    it('computes low risk level and single-pitch-rack-descender strategy under broken-pitch overhung conditions', () => {
      const analysis = calculateTiankengDescent(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.riggingStrategy).toBe('single-pitch-rack-descender');
      expect(analysis.wetRopeFrictionMultiplier).toBeGreaterThanOrEqual(1.0);
      expect(analysis.wetRopeFrictionMultiplier).toBeLessThanOrEqual(2.8);
      expect(analysis.descenderThermalC).toBeLessThan(95);
      expect(analysis.limestoneSpallTrajectoryRiskPct).toBeLessThan(28);
      expect(analysis.freeHangBounceAmplitudeM).toBeLessThan(4.0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases descenderThermalC and freeHangBounceAmplitudeM on long unbroken drops compared to multi-rebelay pitches', () => {
      const rebelayDrop = calculateTiankengDescent({
        verticalDropM: 400,
        rebelayCount: 8,
        fogHumidityPct: 75,
        overhangAngleDeg: -15,
        waterfallSprayLitresMin: 20,
      });
      const unbrokenDrop = calculateTiankengDescent({
        verticalDropM: 400,
        rebelayCount: 0,
        fogHumidityPct: 75,
        overhangAngleDeg: -15,
        waterfallSprayLitresMin: 20,
      });

      expect(unbrokenDrop.descenderThermalC).toBeGreaterThan(
        rebelayDrop.descenderThermalC
      );
      expect(unbrokenDrop.freeHangBounceAmplitudeM).toBeGreaterThan(
        rebelayDrop.freeHangBounceAmplitudeM
      );
      expect(unbrokenDrop.wetRopeFrictionMultiplier).toBeGreaterThan(
        rebelayDrop.wetRopeFrictionMultiplier
      );
    });

    it('computes moderate risk level and multi-rebelay-deviation-srt strategy when moderate thresholds are met', () => {
      const analysis = calculateTiankengDescent({
        verticalDropM: 260,
        rebelayCount: 1,
        fogHumidityPct: 78,
        overhangAngleDeg: 4,
        waterfallSprayLitresMin: 45,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.riggingStrategy).toBe('multi-rebelay-deviation-srt');
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and expedition-6-bar-rack-water-deviation strategy when high thresholds are met', () => {
      const analysis = calculateTiankengDescent({
        verticalDropM: 420,
        rebelayCount: 1,
        fogHumidityPct: 88,
        overhangAngleDeg: 12,
        waterfallSprayLitresMin: 90,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.riggingStrategy).toBe(
        'expedition-6-bar-rack-water-deviation'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-plummet-spall-hypothermia-hazard strategy under unbroken mega-shaft or heavy waterfall spray', () => {
      const analysis = calculateTiankengDescent({
        verticalDropM: 580,
        rebelayCount: 0,
        fogHumidityPct: 96,
        overhangAngleDeg: 22,
        waterfallSprayLitresMin: 320,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.riggingStrategy).toBe(
        'abort-plummet-spall-hypothermia-hazard'
      );
      expect(analysis.descenderThermalC).toBeGreaterThanOrEqual(185);
      expect(analysis.limestoneSpallTrajectoryRiskPct).toBeGreaterThanOrEqual(
        75
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getTiankengGearChecklist', () => {
    it('returns at least 6 gear items spanning srt-descender, rebelay-rigging, rockfall-armor, and microclimate-shell', () => {
      const gear = getTiankengGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('srt-descender')).toBe(true);
      expect(categories.has('rebelay-rigging')).toBe(true);
      expect(categories.has('rockfall-armor')).toBe(true);
      expect(categories.has('microclimate-shell')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
