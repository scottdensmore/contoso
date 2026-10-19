import { describe, it, expect } from 'vitest';
import {
  PARAMO_SITES,
  PARAMO_GEAR_CHECKLIST,
  getAllParamoSites,
  getParamoSiteById,
  filterParamoSites,
  getParamoGearChecklist,
  calculateParamoNavigationSafety,
} from './paramo-navigation';

describe('paramo-navigation domain library', () => {
  describe('curated sites catalog', () => {
    it('returns all 5 curated paramo sites with complete telemetry', () => {
      const sites = getAllParamoSites();
      expect(sites).toHaveLength(5);
      expect(sites).toEqual(PARAMO_SITES);

      const ids = sites.map((s) => s.id);
      expect(ids).toEqual([
        'sumapaz-chisaca-laguna-tunjos-paramo',
        'el-angel-frailejon-giant-rosette-reserve',
        'cajas-toreadora-glacial-turbera-labyrinth',
        'cocuy-ritacuba-superparamo-cushion-pass',
        'chirripo-sabana-de-los-leones-talamanca-paramo',
      ]);

      for (const site of sites) {
        expect(site.name.length).toBeGreaterThan(10);
        expect(site.region.length).toBeGreaterThan(2);
        expect(site.country.length).toBeGreaterThan(2);
        expect(site.highlights.length).toBeGreaterThanOrEqual(2);
        expect(site.bestSeason.length).toBeGreaterThan(2);
      }
    });

    it('finds a site by id or returns undefined for unknown id', () => {
      const sumapaz = getParamoSiteById('sumapaz-chisaca-laguna-tunjos-paramo');
      expect(sumapaz).toBeDefined();
      expect(sumapaz?.name).toContain('Sumapaz');
      expect(sumapaz?.substrateMorphology).toBe(
        'espeletia_frailejon_tussock_matrix'
      );
      expect(sumapaz?.typicalFogRegime).toBe(
        'orographic_paramo_drizzle_whiteout'
      );
      expect(sumapaz?.recommendedTechnique).toBe(
        'tussock_crown_bridging_with_baskets'
      );
      expect(sumapaz?.elevationMeters).toBe(3780);
      expect(sumapaz?.meanCushionMatThicknessCm).toBe(26);
      expect(sumapaz?.histosolWaterSaturationPercent).toBe(78);
      expect(sumapaz?.typicalVisibilityMeters).toBe(45);
      expect(sumapaz?.typicalAmbientTempC).toBe(5);
      expect(sumapaz?.typicalWindSpeedKmh).toBe(24);

      expect(getParamoSiteById('non-existent-paramo-site')).toBeUndefined();
    });

    it('filters sites by substrateMorphology, fogRegime, and technique', () => {
      expect(filterParamoSites()).toHaveLength(5);

      const cushionSites = filterParamoSites({
        substrateMorphology: 'plantago_distichia_cushion_bog_dome',
      });
      expect(cushionSites).toHaveLength(1);
      expect(cushionSites[0].id).toBe(
        'el-angel-frailejon-giant-rosette-reserve'
      );

      const whiteoutSites = filterParamoSites({
        fogRegime: 'orographic_paramo_drizzle_whiteout',
      });
      expect(whiteoutSites).toHaveLength(2);

      const domeSteppingSites = filterParamoSites({
        technique: 'distichia_cushion_dome_stepping',
      });
      expect(domeSteppingSites).toHaveLength(2);

      const combined = filterParamoSites({
        fogRegime: 'orographic_paramo_drizzle_whiteout',
        technique: 'wellies_and_gaiter_turbera_contouring',
      });
      expect(combined).toHaveLength(1);
      expect(combined[0].id).toBe('cajas-toreadora-glacial-turbera-labyrinth');
    });
  });

  describe('mandatory gear checklist', () => {
    it('returns all 6 mandatory paramo gear items', () => {
      const checklist = getParamoGearChecklist();
      expect(checklist).toHaveLength(6);
      expect(checklist).toEqual(PARAMO_GEAR_CHECKLIST);

      const ids = checklist.map((g) => g.id);
      expect(ids).toEqual([
        'knee-high-neoprene-lined-rubber-paramo-panteneras',
        'dual-probe-85mm-snow-basket-trekking-poles',
        'three-layer-hydrostatic-28k-gore-pro-hardshell',
        'declination-adjustable-mirror-sighting-compass-and-altimeter',
        'vapor-barrier-fleece-liner-gloves-and-overmitts',
        'ultralight-bothy-bag-emergency-storm-shelter',
      ]);

      for (const item of checklist) {
        expect(item.mandatory).toBe(true);
        expect(item.weightGrams).toBeGreaterThan(0);
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });

  describe('calculateParamoNavigationSafety', () => {
    it('validates input bounds and throws descriptive errors', () => {
      const valid = {
        cushionMatThicknessCm: 30,
        histosolWaterSaturationPercent: 70,
        visibilityMeters: 150,
        ambientTempC: 7,
        windSpeedKmh: 18,
        packWeightKg: 11,
      };

      expect(() =>
        calculateParamoNavigationSafety({
          ...valid,
          cushionMatThicknessCm: 1.5,
        })
      ).toThrow(/cushionMatThicknessCm/i);

      expect(() =>
        calculateParamoNavigationSafety({
          ...valid,
          cushionMatThicknessCm: 101,
        })
      ).toThrow(/cushionMatThicknessCm/i);

      expect(() =>
        calculateParamoNavigationSafety({
          ...valid,
          histosolWaterSaturationPercent: 19,
        })
      ).toThrow(/histosolWaterSaturationPercent/i);

      expect(() =>
        calculateParamoNavigationSafety({
          ...valid,
          histosolWaterSaturationPercent: 101,
        })
      ).toThrow(/histosolWaterSaturationPercent/i);

      expect(() =>
        calculateParamoNavigationSafety({
          ...valid,
          visibilityMeters: 1,
        })
      ).toThrow(/visibilityMeters/i);

      expect(() =>
        calculateParamoNavigationSafety({
          ...valid,
          visibilityMeters: 2005,
        })
      ).toThrow(/visibilityMeters/i);

      expect(() =>
        calculateParamoNavigationSafety({
          ...valid,
          ambientTempC: -16,
        })
      ).toThrow(/ambientTempC/i);

      expect(() =>
        calculateParamoNavigationSafety({
          ...valid,
          ambientTempC: 29,
        })
      ).toThrow(/ambientTempC/i);

      expect(() =>
        calculateParamoNavigationSafety({
          ...valid,
          windSpeedKmh: -1,
        })
      ).toThrow(/windSpeedKmh/i);

      expect(() =>
        calculateParamoNavigationSafety({
          ...valid,
          windSpeedKmh: 125,
        })
      ).toThrow(/windSpeedKmh/i);

      expect(() =>
        calculateParamoNavigationSafety({
          ...valid,
          packWeightKg: -0.5,
        })
      ).toThrow(/packWeightKg/i);

      expect(() =>
        calculateParamoNavigationSafety({
          ...valid,
          packWeightKg: 46,
        })
      ).toThrow(/packWeightKg/i);
    });

    it('computes nominal morning window cushion corridor metrics accurately', () => {
      const result = calculateParamoNavigationSafety({
        cushionMatThicknessCm: 38,
        histosolWaterSaturationPercent: 65,
        visibilityMeters: 240,
        ambientTempC: 9,
        windSpeedKmh: 14,
        packWeightKg: 10,
        substrateMorphology: 'plantago_distichia_cushion_bog_dome',
        fogRegime: 'morning_zenith_uv_window',
      });

      expect(result.safetyStatus).toBe(
        'nominal_morning_window_cushion_corridor'
      );
      expect(result.cushionBearingSafetyFactor).toBeCloseTo(3.28, 2);
      expect(result.turberaBreakthroughProbability).toBeCloseTo(0.02, 2);
      expect(result.effectiveWindChillC).toBeCloseTo(6.8, 1);
      expect(result.azimuthDriftMetersPerKm).toBe(23);
      expect(result.turberaSteppingProtocol).toMatch(/Distichia/i);
      expect(result.whiteoutAndHypothermiaAdvisory).toMatch(/Espeletia/i);
    });

    it('computes caution whiteout fog and turbera breakthrough metrics accurately', () => {
      const result = calculateParamoNavigationSafety({
        cushionMatThicknessCm: 26,
        histosolWaterSaturationPercent: 78,
        visibilityMeters: 45,
        ambientTempC: 5,
        windSpeedKmh: 24,
        packWeightKg: 12,
        substrateMorphology: 'espeletia_frailejon_tussock_matrix',
        fogRegime: 'orographic_paramo_drizzle_whiteout',
      });

      expect(result.safetyStatus).toBe(
        'caution_whiteout_fog_and_turbera_breakthrough'
      );
      expect(result.cushionBearingSafetyFactor).toBeCloseTo(1.41, 2);
      expect(result.turberaBreakthroughProbability).toBeCloseTo(0.42, 2);
      expect(result.effectiveWindChillC).toBeCloseTo(0.6, 1);
      expect(result.azimuthDriftMetersPerKm).toBe(103);
      expect(result.turberaSteppingProtocol).toMatch(/85\s?mm/i);
      expect(result.whiteoutAndHypothermiaAdvisory).toMatch(/bothy/i);
    });

    it('computes abort hypothermic squall and peat mire entrapment metrics accurately', () => {
      const result = calculateParamoNavigationSafety({
        cushionMatThicknessCm: 14,
        histosolWaterSaturationPercent: 92,
        visibilityMeters: 12,
        ambientTempC: 0,
        windSpeedKmh: 46,
        packWeightKg: 16,
        substrateMorphology: 'waterlogged_histosol_turbera_basin',
        fogRegime: 'freezing_horizontal_sleet_squall',
      });

      expect(result.safetyStatus).toBe(
        'abort_hypothermic_squall_and_peat_mire_entrapment'
      );
      expect(result.cushionBearingSafetyFactor).toBeCloseTo(0.35, 2);
      expect(result.turberaBreakthroughProbability).toBeCloseTo(0.95, 2);
      expect(result.effectiveWindChillC).toBeCloseTo(-7.9, 1);
      expect(result.azimuthDriftMetersPerKm).toBe(257);
      expect(result.turberaSteppingProtocol).toMatch(/histosol/i);
      expect(result.whiteoutAndHypothermiaAdvisory).toMatch(/bothy/i);
    });
  });
});
