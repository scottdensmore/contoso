import { describe, it, expect } from 'vitest';
import {
  THERMOKARST_TUNDRA_SITES,
  filterThermokarstSites,
  calculateThermokarstTundra,
  getThermokarstGearChecklist,
  type ThermokarstTundraInput,
} from '../thermokarst-tundra';

describe('thermokarst-tundra domain library', () => {
  describe('THERMOKARST_TUNDRA_SITES catalog', () => {
    it('exports all 4 real-world Arctic ice-wedge polygon & thermokarst thaw-slump sites with complete metadata', () => {
      expect(THERMOKARST_TUNDRA_SITES).toHaveLength(4);

      const ids = THERMOKARST_TUNDRA_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'tuktoyaktuk-pingo-polygons-canada',
        'batagaika-mega-slump-yakutia',
        'noatak-foothills-tussock-alaska-usa',
        'bykovsky-lena-alas-tundra-russia',
      ]);

      const tuk = THERMOKARST_TUNDRA_SITES.find(
        (s) => s.id === 'tuktoyaktuk-pingo-polygons-canada'
      );
      expect(tuk).toBeDefined();
      expect(tuk?.name).toBe(
        'Tuktoyaktuk Peninsula Ice-Wedge Polygon & Pingo Littoral Tundra'
      );
      expect(tuk?.permafrostZone).toBe('Mackenzie Delta Permafrost Zone');
      expect(tuk?.country).toBe('Canada');
      expect(tuk?.region).toBe('Northwest Territories');
      expect(tuk?.elevationMeters).toBe(18);
      expect(tuk?.morphology).toBe('low-center-ice-wedge-polygon');

      const batagaika = THERMOKARST_TUNDRA_SITES.find(
        (s) => s.id === 'batagaika-mega-slump-yakutia'
      );
      expect(batagaika).toBeDefined();
      expect(batagaika?.name).toBe(
        'Batagaika & Yana Highlands Retrogressive Thaw-Slump Headwall'
      );
      expect(batagaika?.permafrostZone).toBe(
        'Chersky Range Continuous Permafrost'
      );
      expect(batagaika?.country).toBe('Russia');
      expect(batagaika?.region).toBe('Sakha Republic');
      expect(batagaika?.elevationMeters).toBe(290);
      expect(batagaika?.morphology).toBe('retrogressive-thaw-slump-headwall');

      const noatak = THERMOKARST_TUNDRA_SITES.find(
        (s) => s.id === 'noatak-foothills-tussock-alaska-usa'
      );
      expect(noatak).toBeDefined();
      expect(noatak?.name).toBe(
        'Noatak & Brooks Range Foothills Eriophorum Tussock Polygon Basin'
      );
      expect(noatak?.permafrostZone).toBe('Arctic Slope / Brooks Range');
      expect(noatak?.country).toBe('United States');
      expect(noatak?.region).toBe('Alaska');
      expect(noatak?.elevationMeters).toBe(420);
      expect(noatak?.morphology).toBe('high-center-tussock-polygon-trough');

      const bykovsky = THERMOKARST_TUNDRA_SITES.find(
        (s) => s.id === 'bykovsky-lena-alas-tundra-russia'
      );
      expect(bykovsky).toBeDefined();
      expect(bykovsky?.name).toBe(
        'Lena Delta & Bykovsky Yedoma Ice-Complex Alas Depressions'
      );
      expect(bykovsky?.permafrostZone).toBe('Laptev Sea Coast');
      expect(bykovsky?.country).toBe('Russia');
      expect(bykovsky?.region).toBe('Sakha Republic');
      expect(bykovsky?.elevationMeters).toBe(32);
      expect(bykovsky?.morphology).toBe('drunken-forest-alas-depression');

      for (const site of THERMOKARST_TUNDRA_SITES) {
        expect(site.permafrostZone.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.activeLayerDepthCm).toBeGreaterThanOrEqual(10);
        expect(site.activeLayerDepthCm).toBeLessThanOrEqual(160);
        expect(site.troughWaterDepthCm).toBeGreaterThanOrEqual(0);
        expect(site.troughWaterDepthCm).toBeLessThanOrEqual(140);
        expect(site.headwallRetreatMetersYr).toBeGreaterThanOrEqual(0);
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

  describe('filterThermokarstSites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterThermokarstSites(THERMOKARST_TUNDRA_SITES, {})).toHaveLength(
        4
      );

      const byCountry = filterThermokarstSites(THERMOKARST_TUNDRA_SITES, {
        country: 'Canada',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('tuktoyaktuk-pingo-polygons-canada');

      const byMorphology = filterThermokarstSites(THERMOKARST_TUNDRA_SITES, {
        morphology: 'retrogressive-thaw-slump-headwall',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe('batagaika-mega-slump-yakutia');

      const byDifficulty = filterThermokarstSites(THERMOKARST_TUNDRA_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterThermokarstSites(THERMOKARST_TUNDRA_SITES, {
        search: 'Noatak',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('noatak-foothills-tussock-alaska-usa');
    });
  });

  describe('calculateThermokarstTundra', () => {
    const validBase: ThermokarstTundraInput = {
      activeLayerDepthCm: 28,
      troughWaterDepthCm: 12,
      soilMoistureSaturationPct: 45,
      eriophorumTussockHeightCm: 15,
      packLoadKg: 10,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateThermokarstTundra({ ...validBase, activeLayerDepthCm: 9 })
      ).toThrow(/activeLayerDepthCm/i);
      expect(() =>
        calculateThermokarstTundra({ ...validBase, activeLayerDepthCm: 161 })
      ).toThrow(/activeLayerDepthCm/i);
      expect(() =>
        calculateThermokarstTundra({ ...validBase, activeLayerDepthCm: NaN })
      ).toThrow(/activeLayerDepthCm/i);

      expect(() =>
        calculateThermokarstTundra({ ...validBase, troughWaterDepthCm: -1 })
      ).toThrow(/troughWaterDepthCm/i);
      expect(() =>
        calculateThermokarstTundra({ ...validBase, troughWaterDepthCm: 141 })
      ).toThrow(/troughWaterDepthCm/i);

      expect(() =>
        calculateThermokarstTundra({
          ...validBase,
          soilMoistureSaturationPct: 19,
        })
      ).toThrow(/soilMoistureSaturationPct/i);
      expect(() =>
        calculateThermokarstTundra({
          ...validBase,
          soilMoistureSaturationPct: 101,
        })
      ).toThrow(/soilMoistureSaturationPct/i);

      expect(() =>
        calculateThermokarstTundra({
          ...validBase,
          eriophorumTussockHeightCm: 4,
        })
      ).toThrow(/eriophorumTussockHeightCm/i);
      expect(() =>
        calculateThermokarstTundra({
          ...validBase,
          eriophorumTussockHeightCm: 76,
        })
      ).toThrow(/eriophorumTussockHeightCm/i);

      expect(() =>
        calculateThermokarstTundra({ ...validBase, packLoadKg: -1 })
      ).toThrow(/packLoadKg/i);
      expect(() =>
        calculateThermokarstTundra({ ...validBase, packLoadKg: 46 })
      ).toThrow(/packLoadKg/i);
    });

    it('computes low risk level and walk-polygon-rim-levees strategy under shallow active-layer baseline conditions', () => {
      const analysis = calculateThermokarstTundra(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.routingStrategy).toBe('walk-polygon-rim-levees');
      expect(analysis.suprapermafrostLiquefactionIndex).toBeGreaterThanOrEqual(
        1.0
      );
      expect(analysis.suprapermafrostLiquefactionIndex).toBeLessThan(3.8);
      expect(analysis.bootSuctionEntrapmentPct).toBeGreaterThanOrEqual(0);
      expect(analysis.bootSuctionEntrapmentPct).toBeLessThan(28);
      expect(analysis.tussockAnkleFatigueMultiplier).toBeGreaterThanOrEqual(
        1.0
      );
      expect(analysis.tussockAnkleFatigueMultiplier).toBeLessThan(2.0);
      expect(analysis.effectiveForwardSpeedKmh).toBeGreaterThanOrEqual(0.25);
      expect(analysis.effectiveForwardSpeedKmh).toBeLessThanOrEqual(3.6);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases liquefaction, boot suction entrapment, and tussock ankle fatigue while decreasing forward speed under deep thaw conditions', () => {
      const mild = calculateThermokarstTundra(validBase);
      const severe = calculateThermokarstTundra({
        activeLayerDepthCm: 142,
        troughWaterDepthCm: 112,
        soilMoistureSaturationPct: 96,
        eriophorumTussockHeightCm: 66,
        packLoadKg: 36,
      });

      expect(severe.suprapermafrostLiquefactionIndex).toBeGreaterThan(
        mild.suprapermafrostLiquefactionIndex
      );
      expect(severe.bootSuctionEntrapmentPct).toBeGreaterThan(
        mild.bootSuctionEntrapmentPct
      );
      expect(severe.tussockAnkleFatigueMultiplier).toBeGreaterThan(
        mild.tussockAnkleFatigueMultiplier
      );
      expect(severe.effectiveForwardSpeedKmh).toBeLessThan(
        mild.effectiveForwardSpeedKmh
      );
    });

    it('computes moderate risk level and probe-frost-table-diagonal-trough-hop strategy when moderate thresholds are met', () => {
      const analysis = calculateThermokarstTundra({
        activeLayerDepthCm: 62,
        troughWaterDepthCm: 42,
        soilMoistureSaturationPct: 68,
        eriophorumTussockHeightCm: 32,
        packLoadKg: 18,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.routingStrategy).toBe(
        'probe-frost-table-diagonal-trough-hop'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and gravel-esker-ridge-detour strategy when high thresholds are met', () => {
      const analysis = calculateThermokarstTundra({
        activeLayerDepthCm: 98,
        troughWaterDepthCm: 72,
        soilMoistureSaturationPct: 84,
        eriophorumTussockHeightCm: 50,
        packLoadKg: 26,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.routingStrategy).toBe('gravel-esker-ridge-detour');
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-retrogressive-slump-mudflow-hazard strategy under thixotropic yedoma liquefaction or deep trough entrapment', () => {
      const analysis = calculateThermokarstTundra({
        activeLayerDepthCm: 142,
        troughWaterDepthCm: 112,
        soilMoistureSaturationPct: 96,
        eriophorumTussockHeightCm: 66,
        packLoadKg: 36,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.routingStrategy).toBe(
        'abort-retrogressive-slump-mudflow-hazard'
      );
      expect(analysis.suprapermafrostLiquefactionIndex).toBeGreaterThanOrEqual(
        8.0
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getThermokarstGearChecklist', () => {
    it('returns at least 6 gear items spanning frost-table-probing, wading-footwear, insect-thermal-armor, and polygon-navigation', () => {
      const gear = getThermokarstGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('frost-table-probing')).toBe(true);
      expect(categories.has('wading-footwear')).toBe(true);
      expect(categories.has('insect-thermal-armor')).toBe(true);
      expect(categories.has('polygon-navigation')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
