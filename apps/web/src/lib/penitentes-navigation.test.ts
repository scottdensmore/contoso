import { describe, it, expect } from 'vitest';
import {
  PENITENTES_SITES,
  PENITENTES_GEAR_CHECKLIST,
  getAllPenitentesSites,
  getPenitentesSiteById,
  filterPenitentesSites,
  getPenitentesGearChecklist,
  calculatePenitentesNavigationDynamics,
} from './penitentes-navigation';

describe('penitentes-navigation domain library', () => {
  describe('PENITENTES_SITES and site queries', () => {
    it('exports exactly 5 curated high-alpine sun-cup and penitentes sites', () => {
      const sites = getAllPenitentesSites();
      expect(sites).toHaveLength(5);
      expect(sites).toEqual(PENITENTES_SITES);

      const ids = sites.map((s) => s.id);
      expect(ids).toEqual([
        'aconcagua-polish-glacier-penitentes',
        'mount-rainier-muir-snowfield-suncups',
        'tupungato-high-puna-ice-pinnacles',
        'mount-shasta-avalanche-gulch-suncups',
        'khumbu-lobuche-east-ablation-spires',
      ]);
    });

    it('contains accurate telemetry and morphology attributes for each curated site', () => {
      const aconcagua = getPenitentesSiteById('aconcagua-polish-glacier-penitentes');
      expect(aconcagua).toBeDefined();
      expect(aconcagua?.name).toBe(
        'Aconcagua Polish Glacier & Upper Guanacos Penitentes Labyrinth'
      );
      expect(aconcagua?.elevationMeters).toBe(6150);
      expect(aconcagua?.ablationMorphology).toBe('mature_cathedral_nieves_penitentes');
      expect(aconcagua?.recommendedTechnique).toBe('axe_belayed_blade_threading');
      expect(aconcagua?.typicalDiurnalFreezeState).toBe('predawn_vitreous_lockup');
      expect(aconcagua?.meanBladeHeightCm).toBe(185);
      expect(aconcagua?.troughCorridorAzimuthDeg).toBe(82);
      expect(aconcagua?.slopeAngleDeg).toBe(34);
      expect(aconcagua?.highlights.length).toBeGreaterThanOrEqual(2);

      const rainier = getPenitentesSiteById('mount-rainier-muir-snowfield-suncups');
      expect(rainier?.elevationMeters).toBe(2950);
      expect(rainier?.ablationMorphology).toBe('deep_suncup_crest_labyrinth');
      expect(rainier?.recommendedTechnique).toBe('crest_ridge_step_bridging');
      expect(rainier?.typicalDiurnalFreezeState).toBe('midmorning_crust_softening');
      expect(rainier?.meanBladeHeightCm).toBe(55);
      expect(rainier?.troughCorridorAzimuthDeg).toBe(98);
      expect(rainier?.slopeAngleDeg).toBe(24);

      const tupungato = getPenitentesSiteById('tupungato-high-puna-ice-pinnacles');
      expect(tupungato?.elevationMeters).toBe(5800);
      expect(tupungato?.ablationMorphology).toBe('mature_cathedral_nieves_penitentes');
      expect(tupungato?.recommendedTechnique).toBe('hybrid_frontpoint_stemming');
      expect(tupungato?.typicalDiurnalFreezeState).toBe('predawn_vitreous_lockup');
      expect(tupungato?.meanBladeHeightCm).toBe(240);
      expect(tupungato?.troughCorridorAzimuthDeg).toBe(78);
      expect(tupungato?.slopeAngleDeg).toBe(31);

      const shasta = getPenitentesSiteById('mount-shasta-avalanche-gulch-suncups');
      expect(shasta?.elevationMeters).toBe(3650);
      expect(shasta?.ablationMorphology).toBe('shallow_parabolic_suncup_matrix');
      expect(shasta?.recommendedTechnique).toBe('solar_azimuth_trough_corridor_gliding');
      expect(shasta?.typicalDiurnalFreezeState).toBe('midmorning_crust_softening');
      expect(shasta?.meanBladeHeightCm).toBe(38);
      expect(shasta?.troughCorridorAzimuthDeg).toBe(105);
      expect(shasta?.slopeAngleDeg).toBe(32);

      const khumbu = getPenitentesSiteById('khumbu-lobuche-east-ablation-spires');
      expect(khumbu?.elevationMeters).toBe(5450);
      expect(khumbu?.ablationMorphology).toBe('rotten_basal_moat_undercut_field');
      expect(khumbu?.recommendedTechnique).toBe('axe_belayed_blade_threading');
      expect(khumbu?.typicalDiurnalFreezeState).toBe('solar_noon_slush_collapse');
      expect(khumbu?.meanBladeHeightCm).toBe(130);
      expect(khumbu?.troughCorridorAzimuthDeg).toBe(88);
      expect(khumbu?.slopeAngleDeg).toBe(29);
    });

    it('returns undefined for an unknown site id', () => {
      expect(getPenitentesSiteById('non-existent-glacier')).toBeUndefined();
    });

    it('filters sites by morphology, technique, and freezeState', () => {
      expect(filterPenitentesSites()).toHaveLength(5);

      const matureSites = filterPenitentesSites({
        morphology: 'mature_cathedral_nieves_penitentes',
      });
      expect(matureSites.map((s) => s.id)).toEqual([
        'aconcagua-polish-glacier-penitentes',
        'tupungato-high-puna-ice-pinnacles',
      ]);

      const threadingSites = filterPenitentesSites({
        technique: 'axe_belayed_blade_threading',
      });
      expect(threadingSites.map((s) => s.id)).toEqual([
        'aconcagua-polish-glacier-penitentes',
        'khumbu-lobuche-east-ablation-spires',
      ]);

      const predawnSites = filterPenitentesSites({
        freezeState: 'predawn_vitreous_lockup',
      });
      expect(predawnSites.map((s) => s.id)).toEqual([
        'aconcagua-polish-glacier-penitentes',
        'tupungato-high-puna-ice-pinnacles',
      ]);

      const combined = filterPenitentesSites({
        morphology: 'mature_cathedral_nieves_penitentes',
        technique: 'hybrid_frontpoint_stemming',
        freezeState: 'predawn_vitreous_lockup',
      });
      expect(combined.map((s) => s.id)).toEqual(['tupungato-high-puna-ice-pinnacles']);
    });
  });

  describe('PENITENTES_GEAR_CHECKLIST', () => {
    it('exports 6 mandatory crampon and lower-limb armor gear items', () => {
      const checklist = getPenitentesGearChecklist();
      expect(checklist).toHaveLength(6);
      expect(checklist).toEqual(PENITENTES_GEAR_CHECKLIST);

      expect(checklist.map((item) => item.id)).toEqual([
        'chromoly-12-point-mountaineering-crampons-antibot',
        'hardshell-kevlar-padded-shin-gaiters',
        'curved-shaft-technical-alpine-ice-axe',
        'dual-flicklock-alpine-poles-snow-baskets',
        'category-4-glacier-goggles-nose-guard',
        'high-ankle-stiff-shank-mountaineering-boots',
      ]);

      for (const item of checklist) {
        expect(item.mandatory).toBe(true);
        expect(item.weightGrams).toBeGreaterThan(0);
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });

  describe('calculatePenitentesNavigationDynamics', () => {
    it('throws descriptive errors for out-of-range inputs', () => {
      const valid = {
        bladeHeightCm: 45,
        troughSpacingCm: 60,
        slopeAngleDeg: 25,
        snowSurfaceTempC: -6,
        solarIrradianceWm2: 350,
        packWeightKg: 14,
      };

      expect(() =>
        calculatePenitentesNavigationDynamics({ ...valid, bladeHeightCm: 4 })
      ).toThrow(/bladeHeightCm/i);
      expect(() =>
        calculatePenitentesNavigationDynamics({ ...valid, bladeHeightCm: 405 })
      ).toThrow(/bladeHeightCm/i);

      expect(() =>
        calculatePenitentesNavigationDynamics({ ...valid, troughSpacingCm: 8 })
      ).toThrow(/troughSpacingCm/i);
      expect(() =>
        calculatePenitentesNavigationDynamics({ ...valid, troughSpacingCm: 255 })
      ).toThrow(/troughSpacingCm/i);

      expect(() =>
        calculatePenitentesNavigationDynamics({ ...valid, slopeAngleDeg: -1 })
      ).toThrow(/slopeAngleDeg/i);
      expect(() =>
        calculatePenitentesNavigationDynamics({ ...valid, slopeAngleDeg: 68 })
      ).toThrow(/slopeAngleDeg/i);

      expect(() =>
        calculatePenitentesNavigationDynamics({ ...valid, snowSurfaceTempC: -46 })
      ).toThrow(/snowSurfaceTempC/i);
      expect(() =>
        calculatePenitentesNavigationDynamics({ ...valid, snowSurfaceTempC: 16 })
      ).toThrow(/snowSurfaceTempC/i);

      expect(() =>
        calculatePenitentesNavigationDynamics({ ...valid, solarIrradianceWm2: -5 })
      ).toThrow(/solarIrradianceWm2/i);
      expect(() =>
        calculatePenitentesNavigationDynamics({ ...valid, solarIrradianceWm2: 1650 })
      ).toThrow(/solarIrradianceWm2/i);

      expect(() =>
        calculatePenitentesNavigationDynamics({ ...valid, packWeightKg: -1 })
      ).toThrow(/packWeightKg/i);
      expect(() =>
        calculatePenitentesNavigationDynamics({ ...valid, packWeightKg: 60 })
      ).toThrow(/packWeightKg/i);
    });

    it('calculates optimal_predawn_frozen_corridor dynamics for cold shallow sun-cups', () => {
      const result = calculatePenitentesNavigationDynamics({
        bladeHeightCm: 35,
        troughSpacingCm: 55,
        slopeAngleDeg: 20,
        snowSurfaceTempC: -8,
        solarIrradianceWm2: 240,
        packWeightKg: 12,
        ablationMorphology: 'shallow_parabolic_suncup_matrix',
      });

      expect(result.safetyStatus).toBe('optimal_predawn_frozen_corridor');
      expect(result.effectiveHorizontalPaceMhr).toBeCloseTo(275.0, 1);
      expect(result.caloricEnergyMultiplier).toBeCloseTo(2.11, 2);
      expect(result.cramponAntibotBallingRiskPercent).toBeCloseTo(16.0, 1);
      expect(result.bladeMoatCollapseProbability).toBeCloseTo(0.17, 2);
      expect(result.solarAzimuthRoutingProtocol).toMatch(/east-west/i);
      expect(result.ankleTorqueAndShinArmorAdvisory).toMatch(/anti-bot/i);
    });

    it('calculates caution_crampon_balling_and_ankle_torque for midmorning crust softening', () => {
      const result = calculatePenitentesNavigationDynamics({
        bladeHeightCm: 80,
        troughSpacingCm: 65,
        slopeAngleDeg: 26,
        snowSurfaceTempC: -2,
        solarIrradianceWm2: 650,
        packWeightKg: 16,
        ablationMorphology: 'deep_suncup_crest_labyrinth',
      });

      expect(result.safetyStatus).toBe('caution_crampon_balling_and_ankle_torque');
      expect(result.cramponAntibotBallingRiskPercent).toBeGreaterThanOrEqual(48);
      expect(result.cramponAntibotBallingRiskPercent).toBeLessThan(82);
      expect(result.bladeMoatCollapseProbability).toBeLessThan(0.65);
    });

    it('calculates abort_isothermal_blade_collapse for rotten warm penitentes under high irradiance', () => {
      const result = calculatePenitentesNavigationDynamics({
        bladeHeightCm: 160,
        troughSpacingCm: 90,
        slopeAngleDeg: 32,
        snowSurfaceTempC: 1.5,
        solarIrradianceWm2: 1120,
        packWeightKg: 20,
        ablationMorphology: 'rotten_basal_moat_undercut_field',
      });

      expect(result.safetyStatus).toBe('abort_isothermal_blade_collapse');
      expect(result.bladeMoatCollapseProbability).toBeGreaterThanOrEqual(0.65);
      expect(result.cramponAntibotBallingRiskPercent).toBeGreaterThanOrEqual(82);
      expect(result.effectiveHorizontalPaceMhr).toBeGreaterThanOrEqual(45);
    });
  });
});
