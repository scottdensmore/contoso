import { describe, it, expect } from 'vitest';
import {
  TSINGY_LABYRINTH_SITES,
  filterTsingySites,
  calculateTsingyLabyrinth,
  getTsingyGearChecklist,
  type TsingyLabyrinthInput,
} from '../tsingy-labyrinth';

describe('tsingy-labyrinth domain library', () => {
  describe('TSINGY_LABYRINTH_SITES catalog', () => {
    it('exports all 4 real-world tropical pinnacle karst / tsingy labyrinths with complete metadata', () => {
      expect(TSINGY_LABYRINTH_SITES).toHaveLength(4);

      const ids = TSINGY_LABYRINTH_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'bemaraha-grand-tsingy-madagascar',
        'ankarana-tsingy-canyon-madagascar',
        'mulu-api-pinnacles-borneo-malaysia',
        'shilin-naigu-stone-forest-china',
      ]);

      const bemaraha = TSINGY_LABYRINTH_SITES.find(
        (s) => s.id === 'bemaraha-grand-tsingy-madagascar'
      );
      expect(bemaraha).toBeDefined();
      expect(bemaraha?.name).toBe(
        'Tsingy de Bemaraha Grand Tsingy & Andamozavaky Razor Labyrinth'
      );
      expect(bemaraha?.country).toBe('Madagascar');
      expect(bemaraha?.region).toBe('Melaky Region, Western Madagascar');
      expect(bemaraha?.elevationMeters).toBe(410);
      expect(bemaraha?.morphology).toBe('rillenkarren-razor-spires');

      const ankarana = TSINGY_LABYRINTH_SITES.find(
        (s) => s.id === 'ankarana-tsingy-canyon-madagascar'
      );
      expect(ankarana).toBeDefined();
      expect(ankarana?.name).toBe(
        "Massif de l'Ankarana Tsingy Rary & Sunken Diaclase Forest"
      );
      expect(ankarana?.country).toBe('Madagascar');
      expect(ankarana?.region).toBe('Diana Region, Northern Madagascar');
      expect(ankarana?.elevationMeters).toBe(285);
      expect(ankarana?.morphology).toBe('diaclase-slot-corridor-maze');

      const mulu = TSINGY_LABYRINTH_SITES.find(
        (s) => s.id === 'mulu-api-pinnacles-borneo-malaysia'
      );
      expect(mulu).toBeDefined();
      expect(mulu?.name).toBe(
        'Gunung Api & Gunung Mulu Razor-Limestone Pinnacles'
      );
      expect(mulu?.country).toBe('Malaysia');
      expect(mulu?.region).toBe('Gunung Mulu National Park, Sarawak');
      expect(mulu?.elevationMeters).toBe(1200);
      expect(mulu?.morphology).toBe('canopy-suspension-bridge-arête');

      const shilin = TSINGY_LABYRINTH_SITES.find(
        (s) => s.id === 'shilin-naigu-stone-forest-china'
      );
      expect(shilin).toBeDefined();
      expect(shilin?.name).toBe(
        'Shilin & Naigu Permian Dolomitic Pinnacle Labyrinth'
      );
      expect(shilin?.country).toBe('China');
      expect(shilin?.region).toBe('Kunming Karst Plateau, Yunnan');
      expect(shilin?.elevationMeters).toBe(1750);
      expect(shilin?.morphology).toBe('stone-forest-shilin-pinnacles');

      for (const site of TSINGY_LABYRINTH_SITES) {
        expect(site.karstMassif.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.spireHeightMeters).toBeGreaterThanOrEqual(5);
        expect(site.bladeEdgeRadiusMm).toBeGreaterThanOrEqual(0.2);
        expect(site.rockSurfaceTempC).toBeGreaterThanOrEqual(18);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.scramblingProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterTsingySites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterTsingySites(TSINGY_LABYRINTH_SITES, {})).toHaveLength(4);

      const byCountry = filterTsingySites(TSINGY_LABYRINTH_SITES, {
        country: 'Malaysia',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('mulu-api-pinnacles-borneo-malaysia');

      const byMorphology = filterTsingySites(TSINGY_LABYRINTH_SITES, {
        morphology: 'diaclase-slot-corridor-maze',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe('ankarana-tsingy-canyon-madagascar');

      const byDifficulty = filterTsingySites(TSINGY_LABYRINTH_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterTsingySites(TSINGY_LABYRINTH_SITES, {
        search: 'Kunming',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('shilin-naigu-stone-forest-china');
    });
  });

  describe('calculateTsingyLabyrinth', () => {
    const validBase: TsingyLabyrinthInput = {
      bladeEdgeRadiusMm: 8.5,
      spireHeightM: 18,
      rockSurfaceTempC: 28,
      diaclaseGapWidthM: 0.8,
      ambientHumidityPct: 45,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateTsingyLabyrinth({ ...validBase, bladeEdgeRadiusMm: 0.1 })
      ).toThrow(/bladeEdgeRadiusMm/i);
      expect(() =>
        calculateTsingyLabyrinth({ ...validBase, bladeEdgeRadiusMm: 15.1 })
      ).toThrow(/bladeEdgeRadiusMm/i);
      expect(() =>
        calculateTsingyLabyrinth({ ...validBase, bladeEdgeRadiusMm: NaN })
      ).toThrow(/bladeEdgeRadiusMm/i);

      expect(() =>
        calculateTsingyLabyrinth({ ...validBase, spireHeightM: 4 })
      ).toThrow(/spireHeightM/i);
      expect(() =>
        calculateTsingyLabyrinth({ ...validBase, spireHeightM: 121 })
      ).toThrow(/spireHeightM/i);

      expect(() =>
        calculateTsingyLabyrinth({ ...validBase, rockSurfaceTempC: 17 })
      ).toThrow(/rockSurfaceTempC/i);
      expect(() =>
        calculateTsingyLabyrinth({ ...validBase, rockSurfaceTempC: 69 })
      ).toThrow(/rockSurfaceTempC/i);

      expect(() =>
        calculateTsingyLabyrinth({ ...validBase, diaclaseGapWidthM: 0.2 })
      ).toThrow(/diaclaseGapWidthM/i);
      expect(() =>
        calculateTsingyLabyrinth({ ...validBase, diaclaseGapWidthM: 8.1 })
      ).toThrow(/diaclaseGapWidthM/i);

      expect(() =>
        calculateTsingyLabyrinth({ ...validBase, ambientHumidityPct: 19 })
      ).toThrow(/ambientHumidityPct/i);
      expect(() =>
        calculateTsingyLabyrinth({ ...validBase, ambientHumidityPct: 101 })
      ).toThrow(/ambientHumidityPct/i);
    });

    it('computes low risk level and kevlar-gloves-approach-boots scrambling class under rounded dolomitic pinnacle conditions', () => {
      const analysis = calculateTsingyLabyrinth(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.scramblingClass).toBe('kevlar-gloves-approach-boots');
      expect(analysis.lacerationShearIndex).toBeGreaterThanOrEqual(1.0);
      expect(analysis.lacerationShearIndex).toBeLessThanOrEqual(10.0);
      expect(analysis.cordCutThroughRiskPct).toBeLessThan(28);
      expect(analysis.radiantSweatLossLitresHr).toBeGreaterThanOrEqual(0.4);
      expect(analysis.radiantSweatLossLitresHr).toBeLessThan(1.1);
      expect(analysis.arêteExposureFactor).toBeGreaterThanOrEqual(1.0);
      expect(analysis.arêteExposureFactor).toBeLessThanOrEqual(10.0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases lacerationShearIndex, cordCutThroughRiskPct, radiantSweatLossLitresHr, and arêteExposureFactor under severe razor-karst conditions', () => {
      const mild = calculateTsingyLabyrinth(validBase);
      const severe = calculateTsingyLabyrinth({
        bladeEdgeRadiusMm: 0.9,
        spireHeightM: 75,
        rockSurfaceTempC: 51,
        diaclaseGapWidthM: 4.8,
        ambientHumidityPct: 82,
      });

      expect(severe.lacerationShearIndex).toBeGreaterThan(
        mild.lacerationShearIndex
      );
      expect(severe.cordCutThroughRiskPct).toBeGreaterThan(
        mild.cordCutThroughRiskPct
      );
      expect(severe.radiantSweatLossLitresHr).toBeGreaterThan(
        mild.radiantSweatLossLitresHr
      );
      expect(severe.arêteExposureFactor).toBeGreaterThan(
        mild.arêteExposureFactor
      );
    });

    it('computes moderate risk level and via-ferrata-energy-absorber-lanyards class when moderate thresholds are met', () => {
      const analysis = calculateTsingyLabyrinth({
        bladeEdgeRadiusMm: 3.2,
        spireHeightM: 35,
        rockSurfaceTempC: 40,
        diaclaseGapWidthM: 1.8,
        ambientHumidityPct: 58,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.scramblingClass).toBe(
        'via-ferrata-energy-absorber-lanyards'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and twin-steel-core-tethers-edge-protectors class when high thresholds are met', () => {
      const analysis = calculateTsingyLabyrinth({
        bladeEdgeRadiusMm: 1.4,
        spireHeightM: 58,
        rockSurfaceTempC: 48,
        diaclaseGapWidthM: 3.4,
        ambientHumidityPct: 72,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.scramblingClass).toBe(
        'twin-steel-core-tethers-edge-protectors'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-razor-karst-hyperthermia-hazard class under sub-millimeter knife-edge blades or extreme crest heat', () => {
      const analysis = calculateTsingyLabyrinth({
        bladeEdgeRadiusMm: 0.4,
        spireHeightM: 92,
        rockSurfaceTempC: 58,
        diaclaseGapWidthM: 6.2,
        ambientHumidityPct: 88,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.scramblingClass).toBe(
        'abort-razor-karst-hyperthermia-hazard'
      );
      expect(analysis.cordCutThroughRiskPct).toBeGreaterThanOrEqual(75);
      expect(analysis.radiantSweatLossLitresHr).toBeGreaterThanOrEqual(2.3);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getTsingyGearChecklist', () => {
    it('returns at least 6 gear items spanning cut-resistant-armor, lanyard-rigging, thermal-hydration, and diaclase-navigation', () => {
      const gear = getTsingyGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('cut-resistant-armor')).toBe(true);
      expect(categories.has('lanyard-rigging')).toBe(true);
      expect(categories.has('thermal-hydration')).toBe(true);
      expect(categories.has('diaclase-navigation')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
