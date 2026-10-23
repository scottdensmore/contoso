import { describe, it, expect } from 'vitest';
import {
  QUICK_CLAY_TERRACE_SITES,
  filterQuickClayTerraceSites,
  calculateQuickClayTerrace,
  getQuickClayTerraceGearChecklist,
  type QuickClayTerraceInput,
} from '../quick-clay-terrace';

describe('quick-clay-terrace domain library', () => {
  describe('QUICK_CLAY_TERRACE_SITES catalog', () => {
    it('exports all 4 real-world coastal fjord quick-clay marine-terrace & retrogressive slump corridors with complete metadata', () => {
      expect(QUICK_CLAY_TERRACE_SITES).toHaveLength(4);

      const ids = QUICK_CLAY_TERRACE_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'gauldalen-trondheimsfjord-kvikkleire-norway',
        'romerike-gjerdrum-ravine-terrace-norway',
        'south-nation-lemieux-leda-clay-ontario-canada',
        'saguenay-saint-jean-vianney-terrace-quebec-canada',
      ]);

      const gauldalen = QUICK_CLAY_TERRACE_SITES.find(
        (s) => s.id === 'gauldalen-trondheimsfjord-kvikkleire-norway'
      );
      expect(gauldalen).toBeDefined();
      expect(gauldalen?.name).toBe(
        'Gauldalen & Rissa Trondheimsfjord Kvikkleire Marine-Terrace Ravines'
      );
      expect(gauldalen?.paleoMarineBasin).toBe('Trøndelag Glaciomarine Basin');
      expect(gauldalen?.country).toBe('Norway');
      expect(gauldalen?.region).toBe('Melhus / Indre Fosen');
      expect(gauldalen?.elevationMeters).toBe(145);
      expect(gauldalen?.depositType).toBe('glaciomarine-kvikkleire-ravine');

      const romerike = QUICK_CLAY_TERRACE_SITES.find(
        (s) => s.id === 'romerike-gjerdrum-ravine-terrace-norway'
      );
      expect(romerike).toBeDefined();
      expect(romerike?.name).toBe(
        'Romerike & Nittedal-Gjerdrum Dissected Quick-Clay Plateau'
      );
      expect(romerike?.paleoMarineBasin).toBe('Oslo Fjord Paleo-Marine Limit');
      expect(romerike?.country).toBe('Norway');
      expect(romerike?.region).toBe('Akershus');
      expect(romerike?.elevationMeters).toBe(185);
      expect(romerike?.depositType).toBe('fjord-delta-subaqueous-scarp');

      const southNation = QUICK_CLAY_TERRACE_SITES.find(
        (s) => s.id === 'south-nation-lemieux-leda-clay-ontario-canada'
      );
      expect(southNation).toBeDefined();
      expect(southNation?.name).toBe(
        'South Nation River & Lemieux Champlain Sea Leda-Clay Bluffs'
      );
      expect(southNation?.paleoMarineBasin).toBe(
        'St. Lawrence / Ottawa Valley Lowlands'
      );
      expect(southNation?.country).toBe('Canada');
      expect(southNation?.region).toBe('Eastern Ontario');
      expect(southNation?.elevationMeters).toBe(72);
      expect(southNation?.depositType).toBe('champlain-sea-leda-clay-terrace');

      const saguenay = QUICK_CLAY_TERRACE_SITES.find(
        (s) => s.id === 'saguenay-saint-jean-vianney-terrace-quebec-canada'
      );
      expect(saguenay).toBeDefined();
      expect(saguenay?.name).toBe(
        'Saguenay Fjord & Rivière aux Vases Laflamme Sea Clay Terraces'
      );
      expect(saguenay?.paleoMarineBasin).toBe(
        'Saguenay–Lac-Saint-Jean Graben'
      );
      expect(saguenay?.country).toBe('Canada');
      expect(saguenay?.region).toBe('Quebec');
      expect(saguenay?.elevationMeters).toBe(110);
      expect(saguenay?.depositType).toBe('tyrrell-sea-postglacial-bluff');

      for (const site of QUICK_CLAY_TERRACE_SITES) {
        expect(site.paleoMarineBasin.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.marineLimitElevationM).toBeGreaterThan(0);
        expect(site.sensitivityRatioSt).toBeGreaterThanOrEqual(10);
        expect(site.poreSalinityGPerL).toBeGreaterThan(0);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.terraceProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterQuickClayTerraceSites', () => {
    it('filters sites by country, depositType, difficulty, and search query', () => {
      expect(
        filterQuickClayTerraceSites(QUICK_CLAY_TERRACE_SITES, {})
      ).toHaveLength(4);

      const byCountry = filterQuickClayTerraceSites(QUICK_CLAY_TERRACE_SITES, {
        country: 'Norway',
      });
      expect(byCountry).toHaveLength(2);
      expect(byCountry.every((s) => s.country === 'Norway')).toBe(true);

      const byDepositType = filterQuickClayTerraceSites(
        QUICK_CLAY_TERRACE_SITES,
        {
          depositType: 'champlain-sea-leda-clay-terrace',
        }
      );
      expect(byDepositType).toHaveLength(1);
      expect(byDepositType[0].id).toBe(
        'south-nation-lemieux-leda-clay-ontario-canada'
      );

      const byDifficulty = filterQuickClayTerraceSites(
        QUICK_CLAY_TERRACE_SITES,
        {
          difficulty: 'extreme',
        }
      );
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterQuickClayTerraceSites(QUICK_CLAY_TERRACE_SITES, {
        search: 'Saguenay',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe(
        'saguenay-saint-jean-vianney-terrace-quebec-canada'
      );
    });
  });

  describe('calculateQuickClayTerrace', () => {
    const validBase: QuickClayTerraceInput = {
      sensitivityRatioSt: 18,
      poreSalinityGPerL: 13.5,
      ravineSlopeAngleDeg: 9,
      streamToeErosionRateCmYr: 10,
      rainfallSaturationPct: 10,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateQuickClayTerrace({ ...validBase, sensitivityRatioSt: 9 })
      ).toThrow(/sensitivityRatioSt/i);
      expect(() =>
        calculateQuickClayTerrace({ ...validBase, sensitivityRatioSt: 301 })
      ).toThrow(/sensitivityRatioSt/i);
      expect(() =>
        calculateQuickClayTerrace({ ...validBase, sensitivityRatioSt: NaN })
      ).toThrow(/sensitivityRatioSt/i);

      expect(() =>
        calculateQuickClayTerrace({ ...validBase, poreSalinityGPerL: 0.05 })
      ).toThrow(/poreSalinityGPerL/i);
      expect(() =>
        calculateQuickClayTerrace({ ...validBase, poreSalinityGPerL: 15.1 })
      ).toThrow(/poreSalinityGPerL/i);

      expect(() =>
        calculateQuickClayTerrace({ ...validBase, ravineSlopeAngleDeg: 4 })
      ).toThrow(/ravineSlopeAngleDeg/i);
      expect(() =>
        calculateQuickClayTerrace({ ...validBase, ravineSlopeAngleDeg: 46 })
      ).toThrow(/ravineSlopeAngleDeg/i);

      expect(() =>
        calculateQuickClayTerrace({
          ...validBase,
          streamToeErosionRateCmYr: -1,
        })
      ).toThrow(/streamToeErosionRateCmYr/i);
      expect(() =>
        calculateQuickClayTerrace({
          ...validBase,
          streamToeErosionRateCmYr: 151,
        })
      ).toThrow(/streamToeErosionRateCmYr/i);

      expect(() =>
        calculateQuickClayTerrace({ ...validBase, rainfallSaturationPct: -1 })
      ).toThrow(/rainfallSaturationPct/i);
      expect(() =>
        calculateQuickClayTerrace({ ...validBase, rainfallSaturationPct: 101 })
      ).toThrow(/rainfallSaturationPct/i);
    });

    it('computes low risk level and bedrock-ridge-above-marine-limit strategy under low sensitivity, high pore salinity, gentle slope, low erosion, and dry conditions', () => {
      const analysis = calculateQuickClayTerrace(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.terraceStrategy).toBe(
        'bedrock-ridge-above-marine-limit'
      );
      expect(analysis.retrogressiveLiquefactionRiskPct).toBeGreaterThanOrEqual(
        1
      );
      expect(analysis.retrogressiveLiquefactionRiskPct).toBeLessThan(28);
      expect(analysis.retrogressionRunoutDistanceM).toBeGreaterThanOrEqual(15);
      expect(analysis.retrogressionRunoutDistanceM).toBeLessThan(140);
      expect(analysis.remoldedShearStrengthKpa).toBeGreaterThan(0.85);
      expect(analysis.remoldedShearStrengthKpa).toBeLessThanOrEqual(2.5);
      expect(analysis.safeCrownSetbackDistanceM).toBeGreaterThanOrEqual(15);
      expect(analysis.safeCrownSetbackDistanceM).toBeLessThan(110);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases liquefaction risk, retrogression runout, and safe setback while decreasing remolded shear strength as conditions worsen', () => {
      const mild = calculateQuickClayTerrace(validBase);
      const severe = calculateQuickClayTerrace({
        sensitivityRatioSt: 260,
        poreSalinityGPerL: 0.4,
        ravineSlopeAngleDeg: 39,
        streamToeErosionRateCmYr: 130,
        rainfallSaturationPct: 92,
      });

      expect(severe.retrogressiveLiquefactionRiskPct).toBeGreaterThan(
        mild.retrogressiveLiquefactionRiskPct
      );
      expect(severe.retrogressionRunoutDistanceM).toBeGreaterThan(
        mild.retrogressionRunoutDistanceM
      );
      expect(severe.remoldedShearStrengthKpa).toBeLessThan(
        mild.remoldedShearStrengthKpa
      );
      expect(severe.safeCrownSetbackDistanceM).toBeGreaterThan(
        mild.safeCrownSetbackDistanceM
      );
    });

    it('computes moderate risk level and wide-setback-dry-crust-terrace-march strategy when moderate thresholds are met', () => {
      const analysis = calculateQuickClayTerrace({
        sensitivityRatioSt: 80,
        poreSalinityGPerL: 9.5,
        ravineSlopeAngleDeg: 18,
        streamToeErosionRateCmYr: 45,
        rainfallSaturationPct: 32,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.terraceStrategy).toBe(
        'wide-setback-dry-crust-terrace-march'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and evacuate-ravine-floor-lateral-high-ground strategy when high thresholds are met', () => {
      const analysis = calculateQuickClayTerrace({
        sensitivityRatioSt: 145,
        poreSalinityGPerL: 4.8,
        ravineSlopeAngleDeg: 27,
        streamToeErosionRateCmYr: 82,
        rainfallSaturationPct: 58,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.terraceStrategy).toBe(
        'evacuate-ravine-floor-lateral-high-ground'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-imminent-flake-flow-liquefaction strategy under high sensitivity, leached pore water, steep slope, rapid erosion, or saturated conditions', () => {
      const analysis = calculateQuickClayTerrace({
        sensitivityRatioSt: 260,
        poreSalinityGPerL: 0.4,
        ravineSlopeAngleDeg: 39,
        streamToeErosionRateCmYr: 130,
        rainfallSaturationPct: 92,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.terraceStrategy).toBe(
        'abort-imminent-flake-flow-liquefaction'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getQuickClayTerraceGearChecklist', () => {
    it('returns at least 6 gear items spanning geotechnical-probing, load-distribution, slurry-flotation-rescue, and li-gnss-scarp-mapping', () => {
      const gear = getQuickClayTerraceGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('geotechnical-probing')).toBe(true);
      expect(categories.has('load-distribution')).toBe(true);
      expect(categories.has('slurry-flotation-rescue')).toBe(true);
      expect(categories.has('li-gnss-scarp-mapping')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
