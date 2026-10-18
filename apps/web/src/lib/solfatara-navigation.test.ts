import { describe, it, expect } from 'vitest';
import {
  SOLFATARA_SITES,
  SOLFATARA_GEAR_CHECKLIST,
  getAllSolfataraSites,
  getSolfataraSiteById,
  filterSolfataraSites,
  getSolfataraGearChecklist,
  calculateSolfataraNavigationSafety,
} from './solfatara-navigation';

describe('solfatara-navigation domain library', () => {
  describe('curated sites directory', () => {
    it('exports 5 curated solfatara & fumarole field sites with complete attributes', () => {
      const sites = getAllSolfataraSites();
      expect(sites).toHaveLength(5);
      expect(SOLFATARA_SITES).toHaveLength(5);

      const expectedIds = [
        'katmai-valley-of-ten-thousand-smokes-fumaroles',
        'lassens-bumpass-hell-devil-kitchen-solfatara',
        'askja-viti-kverkfjoll-geothermal-ice-fumaroles',
        'el-tatio-atacama-high-altitude-geyser-sinter',
        'mutnovsky-active-crater-sulfur-fumarole-canyon',
      ];
      expect(sites.map((s) => s.id)).toEqual(expectedIds);

      for (const site of sites) {
        expect(site.name.length).toBeGreaterThan(5);
        expect(site.region.length).toBeGreaterThan(3);
        expect(site.country.length).toBeGreaterThan(2);
        expect(site.elevationMeters).toBeGreaterThan(0);
        expect(site.meanCrustThicknessCm).toBeGreaterThan(0);
        expect(site.subsurfaceTemp10cmC).toBeGreaterThan(0);
        expect(site.basinDepressionDepthM).toBeGreaterThan(0);
        expect(site.baselineSo2Ppm).toBeGreaterThan(0);
        expect(site.baselineH2sPpm).toBeGreaterThan(0);
        expect(site.highlights.length).toBeGreaterThanOrEqual(3);
        expect(site.bestSeason.length).toBeGreaterThan(3);
      }
    });

    it('retrieves site by id or returns undefined for unknown id', () => {
      const katmai = getSolfataraSiteById(
        'katmai-valley-of-ten-thousand-smokes-fumaroles'
      );
      expect(katmai).toBeDefined();
      expect(katmai?.crustType).toBe('siliceous_geyserite_sinter_shield');
      expect(katmai?.elevationMeters).toBe(840);
      expect(katmai?.meanCrustThicknessCm).toBe(28);
      expect(katmai?.subsurfaceTemp10cmC).toBe(62);
      expect(katmai?.basinDepressionDepthM).toBe(2.5);
      expect(katmai?.baselineSo2Ppm).toBe(1.2);
      expect(katmai?.baselineH2sPpm).toBe(0.8);

      expect(getSolfataraSiteById('non-existent-solfatara')).toBeUndefined();
    });

    it('filters sites by crustType, gasRegime, and windState', () => {
      expect(filterSolfataraSites()).toHaveLength(5);

      const sinterSites = filterSolfataraSites({
        crustType: 'siliceous_geyserite_sinter_shield',
      });
      expect(sinterSites).toHaveLength(1);
      expect(sinterSites[0].id).toBe(
        'katmai-valley-of-ten-thousand-smokes-fumaroles'
      );

      const steamJetSites = filterSolfataraSites({
        gasRegime: 'superheated_fumarolic_steam_jet',
      });
      expect(steamJetSites).toHaveLength(2);

      const inversionSites = filterSolfataraSites({
        windState: 'katabatic_calms_inversion_trap',
      });
      expect(inversionSites).toHaveLength(2);

      const combined = filterSolfataraSites({
        crustType: 'native_sulfur_sublimation_dome',
        gasRegime: 'co2_cold_mofette_topographic_pooling',
        windState: 'katabatic_calms_inversion_trap',
      });
      expect(combined).toHaveLength(1);
      expect(combined[0].id).toBe(
        'mutnovsky-active-crater-sulfur-fumarole-canyon'
      );
    });
  });

  describe('mandatory gear checklist', () => {
    it('returns all 6 mandatory gas telemetry and crust probing gear items', () => {
      const gear = getSolfataraGearChecklist();
      expect(gear).toHaveLength(6);
      expect(SOLFATARA_GEAR_CHECKLIST).toHaveLength(6);

      const expectedIds = [
        'four-gas-pumped-electrochemical-detector',
        'niorsh-ov-ag-p100-acid-gas-half-mask-respirator',
        'carbon-fiber-graduated-thermal-crust-probe-pole',
        'sealed-polycarbonate-chemical-splash-goggles',
        'bi-metal-soil-probe-stem-thermometer',
        'ptfe-acid-resistant-overboots-and-gaiters',
      ];
      expect(gear.map((item) => item.id)).toEqual(expectedIds);

      for (const item of gear) {
        expect(item.mandatory).toBe(true);
        expect(item.weightGrams).toBeGreaterThan(0);
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });

  describe('calculateSolfataraNavigationSafety', () => {
    it('validates input ranges and throws descriptive errors for out-of-range inputs', () => {
      const validInput = {
        sinterCrustThicknessCm: 28,
        subsurfaceTemp10cmC: 60,
        windSpeedKmh: 22,
        basinDepressionDepthM: 2.0,
        ambientSo2Ppm: 0.8,
        ambientH2sPpm: 0.5,
      };

      expect(() =>
        calculateSolfataraNavigationSafety({
          ...validInput,
          sinterCrustThicknessCm: 0.5,
        })
      ).toThrow(/sinterCrustThicknessCm/i);
      expect(() =>
        calculateSolfataraNavigationSafety({
          ...validInput,
          sinterCrustThicknessCm: 155,
        })
      ).toThrow(/sinterCrustThicknessCm/i);

      expect(() =>
        calculateSolfataraNavigationSafety({
          ...validInput,
          subsurfaceTemp10cmC: -1,
        })
      ).toThrow(/subsurfaceTemp10cmC/i);
      expect(() =>
        calculateSolfataraNavigationSafety({
          ...validInput,
          subsurfaceTemp10cmC: 135,
        })
      ).toThrow(/subsurfaceTemp10cmC/i);

      expect(() =>
        calculateSolfataraNavigationSafety({
          ...validInput,
          windSpeedKmh: -2,
        })
      ).toThrow(/windSpeedKmh/i);
      expect(() =>
        calculateSolfataraNavigationSafety({
          ...validInput,
          windSpeedKmh: 125,
        })
      ).toThrow(/windSpeedKmh/i);

      expect(() =>
        calculateSolfataraNavigationSafety({
          ...validInput,
          basinDepressionDepthM: -0.5,
        })
      ).toThrow(/basinDepressionDepthM/i);
      expect(() =>
        calculateSolfataraNavigationSafety({
          ...validInput,
          basinDepressionDepthM: 65,
        })
      ).toThrow(/basinDepressionDepthM/i);

      expect(() =>
        calculateSolfataraNavigationSafety({
          ...validInput,
          ambientSo2Ppm: -0.1,
        })
      ).toThrow(/ambientSo2Ppm/i);
      expect(() =>
        calculateSolfataraNavigationSafety({
          ...validInput,
          ambientSo2Ppm: 105,
        })
      ).toThrow(/ambientSo2Ppm/i);

      expect(() =>
        calculateSolfataraNavigationSafety({
          ...validInput,
          ambientH2sPpm: -0.1,
        })
      ).toThrow(/ambientH2sPpm/i);
      expect(() =>
        calculateSolfataraNavigationSafety({
          ...validInput,
          ambientH2sPpm: 105,
        })
      ).toThrow(/ambientH2sPpm/i);
    });

    it('computes nominal_upwind_sinter_corridor for thick ventilated geyserite sinter shield', () => {
      const result = calculateSolfataraNavigationSafety({
        sinterCrustThicknessCm: 30,
        subsurfaceTemp10cmC: 58,
        windSpeedKmh: 24,
        basinDepressionDepthM: 2.0,
        ambientSo2Ppm: 0.8,
        ambientH2sPpm: 0.6,
        crustType: 'siliceous_geyserite_sinter_shield',
      });

      expect(result.safetyStatus).toBe('nominal_upwind_sinter_corridor');
      expect(result.crustBearingSafetyFactor).toBeGreaterThanOrEqual(1.85);
      expect(result.scaldBreakthroughProbability).toBeLessThan(0.25);
      expect(result.denseGasAccumulationIndex).toBeLessThan(24);
      expect(result.recommendedStandoffDistanceM).toBeGreaterThanOrEqual(5);
      expect(result.windwardRoutingProtocol).toMatch(/upwind|crosswind/i);
      expect(result.crustProbingAndRespiratorAdvisory).toMatch(/10\s*cm|OV\/AG\/P100/i);
    });

    it('computes caution_acid_plume_respirator_required for moderate acid plume downwash and warm argillic crust', () => {
      const result = calculateSolfataraNavigationSafety({
        sinterCrustThicknessCm: 22,
        subsurfaceTemp10cmC: 78,
        windSpeedKmh: 12,
        basinDepressionDepthM: 5.5,
        ambientSo2Ppm: 2.8,
        ambientH2sPpm: 4.5,
        crustType: 'travertine_carbonate_terrace',
      });

      expect(result.safetyStatus).toBe(
        'caution_acid_plume_respirator_required'
      );
      expect(result.denseGasAccumulationIndex).toBeGreaterThanOrEqual(24);
      expect(result.denseGasAccumulationIndex).toBeLessThan(55);
      expect(result.windwardRoutingProtocol).toMatch(/depressions|H2S|CO2/i);
      expect(result.crustProbingAndRespiratorAdvisory).toMatch(/respirator|probe/i);
    });

    it('computes abort_lethal_gas_pool_or_crust_collapse for thin undercut mudpot apron or lethal mofette gas pooling', () => {
      const result = calculateSolfataraNavigationSafety({
        sinterCrustThicknessCm: 9,
        subsurfaceTemp10cmC: 92,
        windSpeedKmh: 3,
        basinDepressionDepthM: 12.0,
        ambientSo2Ppm: 8.5,
        ambientH2sPpm: 14.0,
        crustType: 'undercut_boiling_mudpot_apron',
      });

      expect(result.safetyStatus).toBe(
        'abort_lethal_gas_pool_or_crust_collapse'
      );
      expect(result.crustBearingSafetyFactor).toBeLessThan(1.15);
      expect(result.scaldBreakthroughProbability).toBeGreaterThanOrEqual(0.55);
      expect(result.denseGasAccumulationIndex).toBeGreaterThanOrEqual(55);
      expect(result.windwardRoutingProtocol).toMatch(/ABORT/i);
      expect(result.crustProbingAndRespiratorAdvisory).toMatch(/OV\/AG\/P100/i);
    });
  });
});
