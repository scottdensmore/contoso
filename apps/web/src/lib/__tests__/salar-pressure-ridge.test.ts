import { describe, it, expect } from 'vitest';
import {
  SALAR_PRESSURE_RIDGE_SITES,
  filterSalarSites,
  calculateSalarPressureRidge,
  getSalarGearChecklist,
  type SalarPressureRidgeInput,
} from '../salar-pressure-ridge';

describe('salar-pressure-ridge domain library', () => {
  describe('SALAR_PRESSURE_RIDGE_SITES catalog', () => {
    it('exports all 4 real-world high-altitude salar pressure-ridge & brine-eye trekking zones with complete metadata', () => {
      expect(SALAR_PRESSURE_RIDGE_SITES).toHaveLength(4);

      const ids = SALAR_PRESSURE_RIDGE_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'uyuni-incahuasi-ojos-bolivia',
        'atacama-soncor-cordillera-sal-chile',
        'arizaro-cono-arita-puna-argentina',
        'chalviri-termas-polques-bolivia',
      ]);

      const uyuni = SALAR_PRESSURE_RIDGE_SITES.find(
        (s) => s.id === 'uyuni-incahuasi-ojos-bolivia'
      );
      expect(uyuni).toBeDefined();
      expect(uyuni?.name).toBe(
        'Salar de Uyuni Isla Incahuasi & Colchani Ojos del Salar Corridor'
      );
      expect(uyuni?.endorheicBasin).toBe('Daniel Campos Province');
      expect(uyuni?.country).toBe('Bolivia');
      expect(uyuni?.region).toBe('Potosí');
      expect(uyuni?.elevationMeters).toBe(3656);
      expect(uyuni?.morphology).toBe('ojos-del-salar-brine-upwelling');

      const atacama = SALAR_PRESSURE_RIDGE_SITES.find(
        (s) => s.id === 'atacama-soncor-cordillera-sal-chile'
      );
      expect(atacama).toBeDefined();
      expect(atacama?.name).toBe(
        'Salar de Atacama Laguna Chaxa & Cordillera de la Sal Pressure-Ridge Core'
      );
      expect(atacama?.endorheicBasin).toBe('El Loa Province');
      expect(atacama?.country).toBe('Chile');
      expect(atacama?.region).toBe('Antofagasta');
      expect(atacama?.elevationMeters).toBe(2305);
      expect(atacama?.morphology).toBe('corrugated-gypsum-chevron-crust');

      const arizaro = SALAR_PRESSURE_RIDGE_SITES.find(
        (s) => s.id === 'arizaro-cono-arita-puna-argentina'
      );
      expect(arizaro).toBeDefined();
      expect(arizaro?.name).toBe(
        'Salar de Arizaro & Cono de Arita Black-Halite Pressure-Ridge Basin'
      );
      expect(arizaro?.endorheicBasin).toBe('Tolar Grande');
      expect(arizaro?.country).toBe('Argentina');
      expect(arizaro?.region).toBe('Salta (Puna de Atacama)');
      expect(arizaro?.elevationMeters).toBe(3475);
      expect(arizaro?.morphology).toBe('polygonal-halite-pressure-crust');

      const chalviri = SALAR_PRESSURE_RIDGE_SITES.find(
        (s) => s.id === 'chalviri-termas-polques-bolivia'
      );
      expect(chalviri).toBeDefined();
      expect(chalviri?.name).toBe(
        'Salar de Chalviri & Laguna Salada Borate-Mirabilite Margin'
      );
      expect(chalviri?.endorheicBasin).toBe(
        'Eduardo Avaroa Andean Fauna National Reserve'
      );
      expect(chalviri?.country).toBe('Bolivia');
      expect(chalviri?.region).toBe('Sud Lípez');
      expect(chalviri?.elevationMeters).toBe(4398);
      expect(chalviri?.morphology).toBe('borate-mirabilite-mud-margin');

      for (const site of SALAR_PRESSURE_RIDGE_SITES) {
        expect(site.endorheicBasin.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.crustThicknessCm).toBeGreaterThanOrEqual(1);
        expect(site.crustThicknessCm).toBeLessThanOrEqual(150);
        expect(site.ridgeReliefCm).toBeGreaterThanOrEqual(2);
        expect(site.ridgeReliefCm).toBeLessThanOrEqual(120);
        expect(site.surfaceAlbedoRatio).toBeGreaterThan(0.5);
        expect(site.surfaceAlbedoRatio).toBeLessThanOrEqual(0.98);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.traversalProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterSalarSites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterSalarSites(SALAR_PRESSURE_RIDGE_SITES, {})).toHaveLength(4);

      const byCountry = filterSalarSites(SALAR_PRESSURE_RIDGE_SITES, {
        country: 'Chile',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('atacama-soncor-cordillera-sal-chile');

      const byMorphology = filterSalarSites(SALAR_PRESSURE_RIDGE_SITES, {
        morphology: 'polygonal-halite-pressure-crust',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe('arizaro-cono-arita-puna-argentina');

      const byDifficulty = filterSalarSites(SALAR_PRESSURE_RIDGE_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterSalarSites(SALAR_PRESSURE_RIDGE_SITES, {
        search: 'Incahuasi',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('uyuni-incahuasi-ojos-bolivia');
    });
  });

  describe('calculateSalarPressureRidge', () => {
    const validBase: SalarPressureRidgeInput = {
      crustThicknessCm: 85,
      brineEyeProximityM: 120.0,
      ridgeReliefCm: 10,
      solarUvIndex: 6,
      packsledLoadKg: 25,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateSalarPressureRidge({ ...validBase, crustThicknessCm: 0 })
      ).toThrow(/crustThicknessCm/i);
      expect(() =>
        calculateSalarPressureRidge({ ...validBase, crustThicknessCm: 151 })
      ).toThrow(/crustThicknessCm/i);
      expect(() =>
        calculateSalarPressureRidge({ ...validBase, crustThicknessCm: NaN })
      ).toThrow(/crustThicknessCm/i);

      expect(() =>
        calculateSalarPressureRidge({ ...validBase, brineEyeProximityM: 0.4 })
      ).toThrow(/brineEyeProximityM/i);
      expect(() =>
        calculateSalarPressureRidge({ ...validBase, brineEyeProximityM: 201 })
      ).toThrow(/brineEyeProximityM/i);

      expect(() =>
        calculateSalarPressureRidge({ ...validBase, ridgeReliefCm: 1 })
      ).toThrow(/ridgeReliefCm/i);
      expect(() =>
        calculateSalarPressureRidge({ ...validBase, ridgeReliefCm: 121 })
      ).toThrow(/ridgeReliefCm/i);

      expect(() =>
        calculateSalarPressureRidge({ ...validBase, solarUvIndex: 0 })
      ).toThrow(/solarUvIndex/i);
      expect(() =>
        calculateSalarPressureRidge({ ...validBase, solarUvIndex: 23 })
      ).toThrow(/solarUvIndex/i);

      expect(() =>
        calculateSalarPressureRidge({ ...validBase, packsledLoadKg: 9 })
      ).toThrow(/packsledLoadKg/i);
      expect(() =>
        calculateSalarPressureRidge({ ...validBase, packsledLoadKg: 161 })
      ).toThrow(/packsledLoadKg/i);
    });

    it('computes low risk level and direct-polygonal-plate-march strategy under thick halite crust and benign UV/relief conditions', () => {
      const analysis = calculateSalarPressureRidge(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.traversalStrategy).toBe('direct-polygonal-plate-march');
      expect(analysis.crustPunchThroughProbabilityPct).toBeGreaterThanOrEqual(1);
      expect(analysis.crustPunchThroughProbabilityPct).toBeLessThan(25);
      expect(analysis.effectiveAlbedoUvDoseIndex).toBeGreaterThanOrEqual(1.8);
      expect(analysis.effectiveAlbedoUvDoseIndex).toBeLessThan(16.0);
      expect(analysis.soleLacerationWearRateMmPer10Km).toBeGreaterThanOrEqual(0.2);
      expect(analysis.soleLacerationWearRateMmPer10Km).toBeLessThan(2.2);
      expect(analysis.brineHypothermiaImmersionRiskPct).toBeGreaterThanOrEqual(0);
      expect(analysis.brineHypothermiaImmersionRiskPct).toBeLessThan(25);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases crustPunchThroughProbabilityPct, effectiveAlbedoUvDoseIndex, soleLacerationWearRateMmPer10Km, and brineHypothermiaImmersionRiskPct under thin crust, close brine eyes, high relief, extreme UV, and heavy load', () => {
      const mild = calculateSalarPressureRidge(validBase);
      const severe = calculateSalarPressureRidge({
        crustThicknessCm: 6,
        brineEyeProximityM: 1.5,
        ridgeReliefCm: 95,
        solarUvIndex: 20,
        packsledLoadKg: 140,
      });

      expect(severe.crustPunchThroughProbabilityPct).toBeGreaterThan(
        mild.crustPunchThroughProbabilityPct
      );
      expect(severe.effectiveAlbedoUvDoseIndex).toBeGreaterThan(
        mild.effectiveAlbedoUvDoseIndex
      );
      expect(severe.soleLacerationWearRateMmPer10Km).toBeGreaterThan(
        mild.soleLacerationWearRateMmPer10Km
      );
      expect(severe.brineHypothermiaImmersionRiskPct).toBeGreaterThan(
        mild.brineHypothermiaImmersionRiskPct
      );
    });

    it('computes moderate risk level and probe-ojos-margin-30m-detour strategy when moderate thresholds are met', () => {
      const analysis = calculateSalarPressureRidge({
        crustThicknessCm: 42,
        brineEyeProximityM: 28.0,
        ridgeReliefCm: 36,
        solarUvIndex: 10,
        packsledLoadKg: 55,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.traversalStrategy).toBe('probe-ojos-margin-30m-detour');
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and snowshoe-pulk-load-spread-glacier-goggles strategy when high thresholds are met', () => {
      const analysis = calculateSalarPressureRidge({
        crustThicknessCm: 18,
        brineEyeProximityM: 8.0,
        ridgeReliefCm: 64,
        solarUvIndex: 14,
        packsledLoadKg: 95,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.traversalStrategy).toBe(
        'snowshoe-pulk-load-spread-glacier-goggles'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-thin-mirabilite-brine-crust strategy under extreme crust punch-through, UV dose, or sole wear', () => {
      const analysis = calculateSalarPressureRidge({
        crustThicknessCm: 4,
        brineEyeProximityM: 1.2,
        ridgeReliefCm: 105,
        solarUvIndex: 20,
        packsledLoadKg: 145,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.traversalStrategy).toBe(
        'abort-thin-mirabilite-brine-crust'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getSalarGearChecklist', () => {
    it('returns at least 6 gear items spanning uv-albedo-shield, crust-probing, halite-sole-armor, and brine-neutralization', () => {
      const gear = getSalarGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('uv-albedo-shield')).toBe(true);
      expect(categories.has('crust-probing')).toBe(true);
      expect(categories.has('halite-sole-armor')).toBe(true);
      expect(categories.has('brine-neutralization')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
