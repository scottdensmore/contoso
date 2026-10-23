import { describe, it, expect } from 'vitest';
import {
  BENTONITE_BADLANDS_SITES,
  filterBentoniteBadlandsSites,
  calculateBentoniteBadlands,
  getBentoniteBadlandsGearChecklist,
  type BentoniteBadlandsInput,
} from '../bentonite-badlands';

describe('bentonite-badlands domain library', () => {
  describe('BENTONITE_BADLANDS_SITES catalog', () => {
    it('exports all 4 real-world bentonite badlands & piping-tunnel sinkhole sites with complete metadata', () => {
      expect(BENTONITE_BADLANDS_SITES).toHaveLength(4);

      const ids = BENTONITE_BADLANDS_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'badlands-sage-creek-chadron-south-dakota',
        'cainville-factory-butte-mancos-shale-utah',
        'dinosaur-red-deer-bearpaw-badlands-alberta-canada',
        'bardenas-reales-pisquerra-piping-navarra-spain',
      ]);

      const sageCreek = BENTONITE_BADLANDS_SITES.find(
        (s) => s.id === 'badlands-sage-creek-chadron-south-dakota'
      );
      expect(sageCreek).toBeDefined();
      expect(sageCreek?.name).toBe(
        'Badlands National Park Sage Creek & Chadron Smectite Pinnacles'
      );
      expect(sageCreek?.region).toBe('South Dakota (White River Badlands)');
      expect(sageCreek?.country).toBe('USA');
      expect(sageCreek?.morphology).toBe('popcorn-crust-mound');
      expect(sageCreek?.swellingGrade).toBe('high-sodium-bentonite');

      const cainville = BENTONITE_BADLANDS_SITES.find(
        (s) => s.id === 'cainville-factory-butte-mancos-shale-utah'
      );
      expect(cainville).toBeDefined();
      expect(cainville?.name).toBe(
        'Cainville Reef & North Cainville Mesa Mancos-Morrison Bentonite Hills'
      );
      expect(cainville?.region).toBe('Utah (Capitol Reef / Hanksville Badlands)');
      expect(cainville?.country).toBe('USA');
      expect(cainville?.morphology).toBe('caprock-hoodoo-pedestal');
      expect(cainville?.swellingGrade).toBe('extreme-thixotropic-gumbo');

      const dinosaur = BENTONITE_BADLANDS_SITES.find(
        (s) => s.id === 'dinosaur-red-deer-bearpaw-badlands-alberta-canada'
      );
      expect(dinosaur).toBeDefined();
      expect(dinosaur?.name).toBe(
        'Dinosaur Provincial Park & Red Deer River Bearpaw Bentonite Badlands'
      );
      expect(dinosaur?.region).toBe('Alberta (Red Deer River Valley)');
      expect(dinosaur?.country).toBe('Canada');
      expect(dinosaur?.morphology).toBe('piping-tunnel-bridge');
      expect(dinosaur?.swellingGrade).toBe('high-sodium-bentonite');

      const bardenas = BENTONITE_BADLANDS_SITES.find(
        (s) => s.id === 'bardenas-reales-pisquerra-piping-navarra-spain'
      );
      expect(bardenas).toBeDefined();
      expect(bardenas?.name).toBe(
        'Bardenas Reales & Rallón-Pisquerra Evaporite-Smectite Piping Badlands'
      );
      expect(bardenas?.region).toBe('Navarra (Ebro Basin)');
      expect(bardenas?.country).toBe('Spain');
      expect(bardenas?.morphology).toBe('dispersive-ruth-gully');
      expect(bardenas?.swellingGrade).toBe('moderate-montmorillonite');

      for (const site of BENTONITE_BADLANDS_SITES) {
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.elevationM).toBeGreaterThan(0);
        expect(site.pipingDepthM).toBeGreaterThan(0);
        expect(site.sodiumAdsorptionRatio).toBeGreaterThan(0);
        expect(site.slopeAngleDeg).toBeGreaterThan(0);
        expect(site.primaryHazard.length).toBeGreaterThan(5);
        expect(site.bestSeasons.length).toBeGreaterThan(0);
        expect(site.highlights.length).toBeGreaterThan(0);
        expect(site.description.length).toBeGreaterThan(15);
        expect(site.recommendedBootLugClearanceMm).toBeGreaterThan(0);
      }
    });
  });

  describe('filterBentoniteBadlandsSites', () => {
    it('filters sites by search, country, morphology, swellingGrade, and maxPipingDepthM', () => {
      expect(
        filterBentoniteBadlandsSites(BENTONITE_BADLANDS_SITES, {})
      ).toHaveLength(4);

      const byCountry = filterBentoniteBadlandsSites(BENTONITE_BADLANDS_SITES, {
        country: 'USA',
      });
      expect(byCountry).toHaveLength(2);
      expect(byCountry.every((s) => s.country === 'USA')).toBe(true);

      const byMorphology = filterBentoniteBadlandsSites(
        BENTONITE_BADLANDS_SITES,
        {
          morphology: 'piping-tunnel-bridge',
        }
      );
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe(
        'dinosaur-red-deer-bearpaw-badlands-alberta-canada'
      );

      const bySwellingGrade = filterBentoniteBadlandsSites(
        BENTONITE_BADLANDS_SITES,
        {
          swellingGrade: 'extreme-thixotropic-gumbo',
        }
      );
      expect(bySwellingGrade).toHaveLength(1);
      expect(bySwellingGrade[0].id).toBe(
        'cainville-factory-butte-mancos-shale-utah'
      );

      const byMaxPipingDepth = filterBentoniteBadlandsSites(
        BENTONITE_BADLANDS_SITES,
        {
          maxPipingDepthM: 5,
        }
      );
      expect(byMaxPipingDepth.every((s) => s.pipingDepthM <= 5)).toBe(true);

      const bySearch = filterBentoniteBadlandsSites(BENTONITE_BADLANDS_SITES, {
        search: 'Bardenas',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe(
        'bardenas-reales-pisquerra-piping-navarra-spain'
      );
    });
  });

  describe('calculateBentoniteBadlands', () => {
    const validBase: BentoniteBadlandsInput = {
      rainfallLast24hMm: 1,
      crustThicknessCm: 45,
      pipingVoidSpanM: 0.4,
      slopeAngleDeg: 10,
      sodiumSwellingIndexPct: 18,
      packWeightKg: 8,
      hasProbingStaff: true,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateBentoniteBadlands({ ...validBase, rainfallLast24hMm: -1 })
      ).toThrow(/rainfallLast24hMm/i);
      expect(() =>
        calculateBentoniteBadlands({ ...validBase, rainfallLast24hMm: 301 })
      ).toThrow(/rainfallLast24hMm/i);
      expect(() =>
        calculateBentoniteBadlands({ ...validBase, rainfallLast24hMm: NaN })
      ).toThrow(/rainfallLast24hMm/i);

      expect(() =>
        calculateBentoniteBadlands({ ...validBase, crustThicknessCm: 0.4 })
      ).toThrow(/crustThicknessCm/i);
      expect(() =>
        calculateBentoniteBadlands({ ...validBase, crustThicknessCm: 201 })
      ).toThrow(/crustThicknessCm/i);

      expect(() =>
        calculateBentoniteBadlands({ ...validBase, pipingVoidSpanM: -0.1 })
      ).toThrow(/pipingVoidSpanM/i);
      expect(() =>
        calculateBentoniteBadlands({ ...validBase, pipingVoidSpanM: 25.1 })
      ).toThrow(/pipingVoidSpanM/i);

      expect(() =>
        calculateBentoniteBadlands({ ...validBase, slopeAngleDeg: -1 })
      ).toThrow(/slopeAngleDeg/i);
      expect(() =>
        calculateBentoniteBadlands({ ...validBase, slopeAngleDeg: 86 })
      ).toThrow(/slopeAngleDeg/i);

      expect(() =>
        calculateBentoniteBadlands({
          ...validBase,
          sodiumSwellingIndexPct: -1,
        })
      ).toThrow(/sodiumSwellingIndexPct/i);
      expect(() =>
        calculateBentoniteBadlands({
          ...validBase,
          sodiumSwellingIndexPct: 101,
        })
      ).toThrow(/sodiumSwellingIndexPct/i);

      expect(() =>
        calculateBentoniteBadlands({ ...validBase, packWeightKg: -1 })
      ).toThrow(/packWeightKg/i);
      expect(() =>
        calculateBentoniteBadlands({ ...validBase, packWeightKg: 101 })
      ).toThrow(/packWeightKg/i);
    });

    it('computes low risk level under dry, thick-crust, narrow-void, gentle-slope conditions', () => {
      const result = calculateBentoniteBadlands(validBase);

      expect(result.riskLevel).toBe('low');
      expect(result.roofCollapseRiskPct).toBeLessThan(28);
      expect(result.bootMiringDepthCm).toBeLessThan(6);
      expect(result.effectiveTractionFrictionCoeff).toBeGreaterThan(0.45);
      expect(result.safeStandOffFromSinkholeM).toBeGreaterThanOrEqual(1);
      expect(result.recommendedAction.length).toBeGreaterThan(10);
    });

    it('computes moderate and high risk levels for intermediate conditions', () => {
      const moderate = calculateBentoniteBadlands({
        rainfallLast24hMm: 14,
        crustThicknessCm: 18,
        pipingVoidSpanM: 2.2,
        slopeAngleDeg: 24,
        sodiumSwellingIndexPct: 45,
        packWeightKg: 16,
        hasProbingStaff: true,
      });
      expect(moderate.riskLevel).toBe('moderate');

      const high = calculateBentoniteBadlands({
        rainfallLast24hMm: 35,
        crustThicknessCm: 8,
        pipingVoidSpanM: 5.5,
        slopeAngleDeg: 38,
        sodiumSwellingIndexPct: 72,
        packWeightKg: 24,
        hasProbingStaff: false,
      });
      expect(high.riskLevel).toBe('high');
      expect(high.warnings.length).toBeGreaterThan(0);
    });

    it('computes critical risk level under wet, thin-crust, wide-piping-span, steep-slope, high-sodium-swelling conditions', () => {
      const critical = calculateBentoniteBadlands({
        rainfallLast24hMm: 85,
        crustThicknessCm: 2.5,
        pipingVoidSpanM: 12,
        slopeAngleDeg: 52,
        sodiumSwellingIndexPct: 92,
        packWeightKg: 30,
        hasProbingStaff: false,
      });

      expect(critical.riskLevel).toBe('critical');
      expect(critical.roofCollapseRiskPct).toBeGreaterThanOrEqual(75);
      expect(critical.bootMiringDepthCm).toBeGreaterThan(15);
      expect(critical.effectiveTractionFrictionCoeff).toBeLessThan(0.2);
      expect(critical.safeStandOffFromSinkholeM).toBeGreaterThan(12);
      expect(critical.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('getBentoniteBadlandsGearChecklist', () => {
    it('returns gear checklist spanning probe, footwear, hydration, navigation, and extraction categories', () => {
      const gear = getBentoniteBadlandsGearChecklist({
        rainfallLast24hMm: 20,
        crustThicknessCm: 10,
        pipingVoidSpanM: 3,
        slopeAngleDeg: 30,
        sodiumSwellingIndexPct: 75,
        packWeightKg: 18,
        hasProbingStaff: false,
      });
      expect(gear.length).toBeGreaterThanOrEqual(5);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('probe')).toBe(true);
      expect(categories.has('footwear')).toBe(true);
      expect(categories.has('hydration')).toBe(true);
      expect(categories.has('navigation')).toBe(true);
      expect(categories.has('extraction')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.reason.length).toBeGreaterThan(15);
      }
    });
  });
});
