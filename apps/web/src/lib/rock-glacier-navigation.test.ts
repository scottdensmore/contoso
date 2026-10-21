import { describe, it, expect } from 'vitest';
import {
  ROCK_GLACIER_SITES,
  ROCK_GLACIER_GEAR_CHECKLIST,
  getAllRockGlacierSites,
  getRockGlacierSiteById,
  filterRockGlacierSites,
  getRockGlacierGearChecklist,
  calculateRockGlacierNavigationSafety,
} from './rock-glacier-navigation';

describe('rock-glacier-navigation domain library', () => {
  describe('curated sites & lookup helpers', () => {
    it('returns all 5 curated rock glacier sites', () => {
      const sites = getAllRockGlacierSites();
      expect(sites).toHaveLength(5);
      expect(sites).toEqual(ROCK_GLACIER_SITES);
      expect(sites.map((s) => s.id)).toEqual([
        'sourdough-peak-mccarthy-creek-rock-glacier',
        'mount-mendenhall-san-juan-imbricated-tongue',
        'muragl-upper-engadine-permafrost-carapace',
        'dos-lenguas-agua-negra-andean-cryolith-lobe',
        'nesters-ridge-wheeler-peak-quartzite-blockfield',
      ]);
    });

    it('retrieves a specific site by ID or returns undefined', () => {
      const sourdough = getRockGlacierSiteById(
        'sourdough-peak-mccarthy-creek-rock-glacier'
      );
      expect(sourdough).toBeDefined();
      expect(sourdough?.name).toContain('Sourdough Peak');
      expect(sourdough?.elevationMeters).toBe(1720);
      expect(sourdough?.meanBlockDiameterCm).toBe(75);
      expect(sourdough?.slopeAngleDeg).toBe(21);
      expect(sourdough?.activeLayerThawDepthCm).toBe(65);
      expect(sourdough?.interstitialVoidRatioPercent).toBe(22);

      expect(getRockGlacierSiteById('non-existent-id')).toBeUndefined();
    });

    it('filters sites by morphology, iceState, and technique', () => {
      expect(filterRockGlacierSites()).toHaveLength(5);

      const lobate = filterRockGlacierSites({
        morphology: 'active_lobate_ice_cored_carapace',
      });
      expect(lobate).toHaveLength(1);
      expect(lobate[0].id).toBe('sourdough-peak-mccarthy-creek-rock-glacier');

      const cryoLocked = filterRockGlacierSites({
        iceState: 'cryo_cemented_permafrost_lock',
      });
      expect(cryoLocked).toHaveLength(2);

      const slabStepping = filterRockGlacierSites({
        technique: 'three_point_imbricated_slab_stepping',
      });
      expect(slabStepping).toHaveLength(2);

      const combined = filterRockGlacierSites({
        iceState: 'cryo_cemented_permafrost_lock',
        technique: 'three_point_imbricated_slab_stepping',
      });
      expect(combined).toHaveLength(1);
      expect(combined[0].id).toBe(
        'nesters-ridge-wheeler-peak-quartzite-blockfield'
      );
    });
  });

  describe('mandatory gear checklist', () => {
    it('returns all 6 mandatory ankle/tibial armor and block extrication gear items', () => {
      const checklist = getRockGlacierGearChecklist();
      expect(checklist).toHaveLength(6);
      expect(checklist).toEqual(ROCK_GLACIER_GEAR_CHECKLIST);
      expect(checklist.every((item) => item.mandatory)).toBe(true);
      expect(checklist.map((item) => item.id)).toEqual([
        'stiff-shank-vibram-megagrip-mountaineering-boots',
        'kevlar-reinforced-nitrile-palm-boulder-gloves',
        'fixed-section-chromoly-scrambling-staff-no-baskets',
        'uiia-certified-rockfall-and-impact-climbing-helmet',
        'high-collar-ballistic-nylon-talus-gaiters',
        'compact-dyneema-cord-and-pulley-block-extrication-kit',
      ]);
    });
  });

  describe('calculateRockGlacierNavigationSafety', () => {
    it('throws descriptive errors for out-of-range inputs', () => {
      const validBase = {
        meanBlockDiameterCm: 75,
        slopeAngleDeg: 21,
        activeLayerThawDepthCm: 65,
        interstitialVoidRatioPercent: 22,
        ambientAirTempC: 2,
        packWeightKg: 14,
      };

      expect(() =>
        calculateRockGlacierNavigationSafety({
          ...validBase,
          meanBlockDiameterCm: 10,
        })
      ).toThrow(/meanBlockDiameterCm/i);

      expect(() =>
        calculateRockGlacierNavigationSafety({
          ...validBase,
          meanBlockDiameterCm: 310,
        })
      ).toThrow(/meanBlockDiameterCm/i);

      expect(() =>
        calculateRockGlacierNavigationSafety({
          ...validBase,
          slopeAngleDeg: 4,
        })
      ).toThrow(/slopeAngleDeg/i);

      expect(() =>
        calculateRockGlacierNavigationSafety({
          ...validBase,
          slopeAngleDeg: 58,
        })
      ).toThrow(/slopeAngleDeg/i);

      expect(() =>
        calculateRockGlacierNavigationSafety({
          ...validBase,
          activeLayerThawDepthCm: 5,
        })
      ).toThrow(/activeLayerThawDepthCm/i);

      expect(() =>
        calculateRockGlacierNavigationSafety({
          ...validBase,
          activeLayerThawDepthCm: 420,
        })
      ).toThrow(/activeLayerThawDepthCm/i);

      expect(() =>
        calculateRockGlacierNavigationSafety({
          ...validBase,
          interstitialVoidRatioPercent: 3,
        })
      ).toThrow(/interstitialVoidRatioPercent/i);

      expect(() =>
        calculateRockGlacierNavigationSafety({
          ...validBase,
          interstitialVoidRatioPercent: 70,
        })
      ).toThrow(/interstitialVoidRatioPercent/i);

      expect(() =>
        calculateRockGlacierNavigationSafety({
          ...validBase,
          ambientAirTempC: -40,
        })
      ).toThrow(/ambientAirTempC/i);

      expect(() =>
        calculateRockGlacierNavigationSafety({
          ...validBase,
          ambientAirTempC: 40,
        })
      ).toThrow(/ambientAirTempC/i);

      expect(() =>
        calculateRockGlacierNavigationSafety({
          ...validBase,
          packWeightKg: -1,
        })
      ).toThrow(/packWeightKg/i);

      expect(() =>
        calculateRockGlacierNavigationSafety({
          ...validBase,
          packWeightKg: 55,
        })
      ).toThrow(/packWeightKg/i);
    });

    it('calculates nominal_cryo_cemented_carapace status for stable cryo-cemented compression ridges', () => {
      const result = calculateRockGlacierNavigationSafety({
        meanBlockDiameterCm: 75,
        slopeAngleDeg: 21,
        activeLayerThawDepthCm: 65,
        interstitialVoidRatioPercent: 22,
        ambientAirTempC: 2,
        packWeightKg: 14,
        morphology: 'active_lobate_ice_cored_carapace',
        iceState: 'cryo_cemented_permafrost_lock',
      });

      expect(result.safetyStatus).toBe('nominal_cryo_cemented_carapace');
      expect(result.blockRotationalStabilityIndex).toBeGreaterThanOrEqual(1.8);
      expect(result.perchedBlockTipProbability).toBeLessThan(0.26);
      expect(result.subCarapaceVoidEntrapmentRiskPercent).toBeLessThan(46);
      expect(result.effectiveHorizontalPaceMhr).toBeGreaterThan(200);
      expect(result.carapaceRoutingProtocol).toMatch(/compression ridge/i);
      expect(result.tibialEntrapmentAndRockfallAdvisory).toMatch(/basket/i);
    });

    it('calculates caution_perched_block_and_void_hazard status during midday active-layer thaw and void hazard', () => {
      const result = calculateRockGlacierNavigationSafety({
        meanBlockDiameterCm: 92,
        slopeAngleDeg: 27,
        activeLayerThawDepthCm: 125,
        interstitialVoidRatioPercent: 31,
        ambientAirTempC: 9,
        packWeightKg: 16,
        morphology: 'tongue_shaped_interstitial_ice_matrix',
        iceState: 'seasonal_active_layer_thaw_lubrication',
      });

      expect(result.safetyStatus).toBe('caution_perched_block_and_void_hazard');
      expect(result.subCarapaceVoidEntrapmentRiskPercent).toBeGreaterThanOrEqual(
        46
      );
      expect(result.carapaceRoutingProtocol).toMatch(/compression ridge/i);
      expect(result.tibialEntrapmentAndRockfallAdvisory).toMatch(/diagonal/i);
    });

    it('calculates abort_oversteepened_scarp_or_thaw_rotation status on oversteepened (>35°) frontal talus scarps', () => {
      const result = calculateRockGlacierNavigationSafety({
        meanBlockDiameterCm: 68,
        slopeAngleDeg: 39,
        activeLayerThawDepthCm: 210,
        interstitialVoidRatioPercent: 42,
        ambientAirTempC: 12,
        packWeightKg: 22,
        morphology: 'oversteepened_frontal_talus_apron',
        iceState: 'isothermal_debris_creep_slump',
      });

      expect(result.safetyStatus).toBe(
        'abort_oversteepened_scarp_or_thaw_rotation'
      );
      expect(result.blockRotationalStabilityIndex).toBeLessThan(1.15);
      expect(result.perchedBlockTipProbability).toBeGreaterThanOrEqual(0.55);
      expect(result.carapaceRoutingProtocol).toMatch(/35°|frontal/i);
      expect(result.tibialEntrapmentAndRockfallAdvisory).toMatch(
        /tabular|diagonal/i
      );
    });

    it('uses default morphology and iceState factors when optional fields are omitted', () => {
      const result = calculateRockGlacierNavigationSafety({
        meanBlockDiameterCm: 80,
        slopeAngleDeg: 20,
        activeLayerThawDepthCm: 70,
        interstitialVoidRatioPercent: 20,
        ambientAirTempC: 4,
        packWeightKg: 12,
      });

      expect(result.blockRotationalStabilityIndex).toBeGreaterThan(1.5);
      expect(result.safetyStatus).toBeDefined();
    });
  });
});
