import { describe, it, expect } from 'vitest';
import {
  GLACIERE_CAVE_SITES,
  filterGlaciereSites,
  calculateGlaciereCaving,
  getGlaciereGearChecklist,
  type GlaciereCavingInput,
} from '../glaciere-caving';

describe('glaciere-caving domain library', () => {
  describe('GLACIERE_CAVE_SITES catalog', () => {
    it('exports all 4 real-world subterranean ice caves / glacières with complete metadata', () => {
      expect(GLACIERE_CAVE_SITES).toHaveLength(4);

      const ids = GLACIERE_CAVE_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'eisriesenwelt-tennengebirge-austria',
        'scarisoara-glaciere-apuseni-romania',
        'bandera-ice-cave-el-malpais-usa',
        'lofthellir-lava-glaciere-iceland',
      ]);

      const eisriesenwelt = GLACIERE_CAVE_SITES.find(
        (s) => s.id === 'eisriesenwelt-tennengebirge-austria'
      );
      expect(eisriesenwelt).toBeDefined();
      expect(eisriesenwelt?.name).toBe(
        'Eisriesenwelt Dynamic Wind-Chimney Ice Labyrinth'
      );
      expect(eisriesenwelt?.country).toBe('Austria');
      expect(eisriesenwelt?.elevationMeters).toBe(1641);
      expect(eisriesenwelt?.morphology).toBe('dynamic-chimney-karst-ice');

      const scarisoara = GLACIERE_CAVE_SITES.find(
        (s) => s.id === 'scarisoara-glaciere-apuseni-romania'
      );
      expect(scarisoara).toBeDefined();
      expect(scarisoara?.name).toBe(
        'Peștera Scărișoara Stratified Firn-Block Cold Trap'
      );
      expect(scarisoara?.country).toBe('Romania');
      expect(scarisoara?.elevationMeters).toBe(1165);
      expect(scarisoara?.morphology).toBe('stratified-firn-plug-pit');

      const bandera = GLACIERE_CAVE_SITES.find(
        (s) => s.id === 'bandera-ice-cave-el-malpais-usa'
      );
      expect(bandera).toBeDefined();
      expect(bandera?.name).toBe(
        'Bandera & Candelaria Static Cold-Trap Basalt Lava Tube'
      );
      expect(bandera?.country).toBe('United States');
      expect(bandera?.elevationMeters).toBe(2390);
      expect(bandera?.morphology).toBe('static-cold-trap-lava-tube');

      const lofthellir = GLACIERE_CAVE_SITES.find(
        (s) => s.id === 'lofthellir-lava-glaciere-iceland'
      );
      expect(lofthellir).toBeDefined();
      expect(lofthellir?.name).toBe(
        'Lofthellir Permafrost Basaltic Lava Tube Glacière'
      );
      expect(lofthellir?.country).toBe('Iceland');
      expect(lofthellir?.elevationMeters).toBe(370);
      expect(lofthellir?.morphology).toBe('permafrost-fissure-glaciere');

      for (const site of GLACIERE_CAVE_SITES) {
        expect(site.caveSystem.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.floorIceSlopeDeg).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(site.caveAirTempC)).toBe(true);
        expect(site.co2PocketPpm).toBeGreaterThanOrEqual(350);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.tractionProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterGlaciereSites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterGlaciereSites(GLACIERE_CAVE_SITES, {})).toHaveLength(4);

      const byCountry = filterGlaciereSites(GLACIERE_CAVE_SITES, {
        country: 'Iceland',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('lofthellir-lava-glaciere-iceland');

      const byMorphology = filterGlaciereSites(GLACIERE_CAVE_SITES, {
        morphology: 'stratified-firn-plug-pit',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe('scarisoara-glaciere-apuseni-romania');

      const byDifficulty = filterGlaciereSites(GLACIERE_CAVE_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterGlaciereSites(GLACIERE_CAVE_SITES, {
        search: 'Eisriesenwelt',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('eisriesenwelt-tennengebirge-austria');
    });
  });

  describe('calculateGlaciereCaving', () => {
    const validBase: GlaciereCavingInput = {
      floorIceSlopeDeg: 10,
      caveAirTempC: -5,
      meltwaterFilmMm: 0.5,
      co2Ppm: 650,
      hoarfrostCeilingThicknessCm: 8,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateGlaciereCaving({ ...validBase, floorIceSlopeDeg: -1 })
      ).toThrow(/floorIceSlopeDeg/i);
      expect(() =>
        calculateGlaciereCaving({ ...validBase, floorIceSlopeDeg: 61 })
      ).toThrow(/floorIceSlopeDeg/i);
      expect(() =>
        calculateGlaciereCaving({ ...validBase, floorIceSlopeDeg: NaN })
      ).toThrow(/floorIceSlopeDeg/i);

      expect(() =>
        calculateGlaciereCaving({ ...validBase, caveAirTempC: -21 })
      ).toThrow(/caveAirTempC/i);
      expect(() =>
        calculateGlaciereCaving({ ...validBase, caveAirTempC: 11 })
      ).toThrow(/caveAirTempC/i);

      expect(() =>
        calculateGlaciereCaving({ ...validBase, meltwaterFilmMm: -0.5 })
      ).toThrow(/meltwaterFilmMm/i);
      expect(() =>
        calculateGlaciereCaving({ ...validBase, meltwaterFilmMm: 26 })
      ).toThrow(/meltwaterFilmMm/i);

      expect(() =>
        calculateGlaciereCaving({ ...validBase, co2Ppm: 340 })
      ).toThrow(/co2Ppm/i);
      expect(() =>
        calculateGlaciereCaving({ ...validBase, co2Ppm: 50001 })
      ).toThrow(/co2Ppm/i);

      expect(() =>
        calculateGlaciereCaving({
          ...validBase,
          hoarfrostCeilingThicknessCm: -1,
        })
      ).toThrow(/hoarfrostCeilingThicknessCm/i);
      expect(() =>
        calculateGlaciereCaving({
          ...validBase,
          hoarfrostCeilingThicknessCm: 121,
        })
      ).toThrow(/hoarfrostCeilingThicknessCm/i);
    });

    it('computes low risk level and microspikes-10pt traction class under cold sub-zero low-slope conditions', () => {
      const analysis = calculateGlaciereCaving({
        floorIceSlopeDeg: 10,
        caveAirTempC: -5,
        meltwaterFilmMm: 0.5,
        co2Ppm: 650,
        hoarfrostCeilingThicknessCm: 8,
      });

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.tractionClass).toBe('microspikes-10pt');
      expect(analysis.cramponShearSafetyFactor).toBeGreaterThanOrEqual(1.6);
      expect(analysis.hoarfrostDetachmentRiskPct).toBeLessThan(25);
      expect(analysis.hypoxicCo2Index).toBe(0.13);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('decreases iceFrictionCoefficient sharply when caveAirTempC approaches >= -1 C and meltwaterFilmMm increases', () => {
      const coldDry = calculateGlaciereCaving({
        floorIceSlopeDeg: 12,
        caveAirTempC: -8,
        meltwaterFilmMm: 0,
        co2Ppm: 600,
        hoarfrostCeilingThicknessCm: 5,
      });
      const warmWet = calculateGlaciereCaving({
        floorIceSlopeDeg: 12,
        caveAirTempC: 0.5,
        meltwaterFilmMm: 10,
        co2Ppm: 600,
        hoarfrostCeilingThicknessCm: 5,
      });

      expect(warmWet.iceFrictionCoefficient).toBeLessThan(
        coldDry.iceFrictionCoefficient - 0.08
      );
    });

    it('computes moderate risk level and steel-12pt-crampons-ice-axe class when moderate thresholds are met', () => {
      const analysis = calculateGlaciereCaving({
        floorIceSlopeDeg: 22,
        caveAirTempC: -2.5,
        meltwaterFilmMm: 2.5,
        co2Ppm: 2400,
        hoarfrostCeilingThicknessCm: 35,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.tractionClass).toBe('steel-12pt-crampons-ice-axe');
      expect(analysis.hypoxicCo2Index).toBe(0.48);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and front-point-dual-tools-ice-screws class under steeper wet glaze or elevated CO2', () => {
      const analysis = calculateGlaciereCaving({
        floorIceSlopeDeg: 35,
        caveAirTempC: -0.5,
        meltwaterFilmMm: 7,
        co2Ppm: 6200,
        hoarfrostCeilingThicknessCm: 58,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.tractionClass).toBe('front-point-dual-tools-ice-screws');
      expect(analysis.hoarfrostDetachmentRiskPct).toBeGreaterThanOrEqual(50);
      expect(analysis.hypoxicCo2Index).toBe(1.24);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-glaze-co2-collapse-hazard class under extreme slope, warm meltwater glaze, or CO2 sump conditions', () => {
      const analysis = calculateGlaciereCaving({
        floorIceSlopeDeg: 48,
        caveAirTempC: 2.5,
        meltwaterFilmMm: 16,
        co2Ppm: 18500,
        hoarfrostCeilingThicknessCm: 92,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.tractionClass).toBe('abort-glaze-co2-collapse-hazard');
      expect(analysis.cramponShearSafetyFactor).toBeLessThan(0.95);
      expect(analysis.hoarfrostDetachmentRiskPct).toBeGreaterThanOrEqual(75);
      expect(analysis.hypoxicCo2Index).toBe(3.7);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getGlaciereGearChecklist', () => {
    it('returns at least 6 gear items spanning traction, gas-monitoring, thermal-shell, and rigging-anchoring', () => {
      const gear = getGlaciereGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('traction')).toBe(true);
      expect(categories.has('gas-monitoring')).toBe(true);
      expect(categories.has('thermal-shell')).toBe(true);
      expect(categories.has('rigging-anchoring')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
