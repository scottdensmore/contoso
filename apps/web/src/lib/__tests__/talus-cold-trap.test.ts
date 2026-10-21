import { describe, it, expect } from 'vitest';
import {
  TALUS_COLD_TRAP_SITES,
  filterTalusColdTrapSites,
  calculateTalusColdTrap,
  getTalusColdTrapGearChecklist,
  type TalusColdTrapInput,
} from '../talus-cold-trap';

describe('talus-cold-trap domain library', () => {
  describe('TALUS_COLD_TRAP_SITES catalog', () => {
    it('exports all 4 real-world subalpine boulder-talus air-draft ice cave & cold-trap block-field zones with complete metadata', () => {
      expect(TALUS_COLD_TRAP_SITES).toHaveLength(4);

      const ids = TALUS_COLD_TRAP_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'king-ravine-mahosuc-notch-white-mountains-nh',
        'indian-pass-avalanche-pass-adirondacks-ny',
        'driftless-algific-talus-slopes-iowa',
        'kamenec-crevice-ice-talus-bohemia-czechia',
      ]);

      const kingRavine = TALUS_COLD_TRAP_SITES.find(
        (s) => s.id === 'king-ravine-mahosuc-notch-white-mountains-nh'
      );
      expect(kingRavine).toBeDefined();
      expect(kingRavine?.name).toBe(
        'King Ravine Subway & Mahoosuc Notch Balch-Ice Megatalus'
      );
      expect(kingRavine?.physiographicProvince).toBe(
        'Presidential & Mahoosuc Ranges'
      );
      expect(kingRavine?.country).toBe('USA');
      expect(kingRavine?.region).toBe('New Hampshire / Maine');
      expect(kingRavine?.elevationMeters).toBe(1180);
      expect(kingRavine?.regime).toBe('balch-chimney-megaboulder-gorge');

      const indianPass = TALUS_COLD_TRAP_SITES.find(
        (s) => s.id === 'indian-pass-avalanche-pass-adirondacks-ny'
      );
      expect(indianPass).toBeDefined();
      expect(indianPass?.name).toBe(
        'Indian Pass & Avalanche Pass Anorthosite Talus Ice Chasms'
      );
      expect(indianPass?.physiographicProvince).toBe(
        'High Peaks Wilderness, Adirondack Park'
      );
      expect(indianPass?.country).toBe('USA');
      expect(indianPass?.region).toBe('New York');
      expect(indianPass?.elevationMeters).toBe(860);
      expect(indianPass?.regime).toBe('anorthosite-pseudokarst-ice-chasm');

      const driftless = TALUS_COLD_TRAP_SITES.find(
        (s) => s.id === 'driftless-algific-talus-slopes-iowa'
      );
      expect(driftless).toBeDefined();
      expect(driftless?.name).toBe(
        'Driftless Area Algific Talus Cold-Air Vent Slopes'
      );
      expect(driftless?.physiographicProvince).toBe(
        'Upper Mississippi Carbonate Escarpment'
      );
      expect(driftless?.country).toBe('USA');
      expect(driftless?.region).toBe('Clayton County, Iowa');
      expect(driftless?.elevationMeters).toBe(275);
      expect(driftless?.regime).toBe('algific-dolomite-cold-vent-slope');

      const kamenec = TALUS_COLD_TRAP_SITES.find(
        (s) => s.id === 'kamenec-crevice-ice-talus-bohemia-czechia'
      );
      expect(kamenec).toBeDefined();
      expect(kamenec?.name).toBe(
        'Kamenec & Naděje Pseudokarst Phonolite Cold-Trap Block-Field'
      );
      expect(kamenec?.physiographicProvince).toBe(
        'Lužické hory / Česká Lípa, Northern Bohemia'
      );
      expect(kamenec?.country).toBe('Czech Republic');
      expect(kamenec?.region).toBe('Northern Bohemia');
      expect(kamenec?.elevationMeters).toBe(540);
      expect(kamenec?.regime).toBe('periglacial-block-stream-felsenmeer');

      for (const site of TALUS_COLD_TRAP_SITES) {
        expect(site.physiographicProvince.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.maxVoidDepthM).toBeGreaterThanOrEqual(1);
        expect(site.maxVoidDepthM).toBeLessThanOrEqual(35);
        expect(site.summerDraftTempDeltaC).toBeGreaterThanOrEqual(5);
        expect(site.summerDraftTempDeltaC).toBeLessThanOrEqual(38);
        expect(site.mossBridgeMaskingPct).toBeGreaterThanOrEqual(0);
        expect(site.mossBridgeMaskingPct).toBeLessThanOrEqual(100);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.navigationProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterTalusColdTrapSites', () => {
    it('filters sites by country, regime, difficulty, and search query', () => {
      expect(filterTalusColdTrapSites(TALUS_COLD_TRAP_SITES, {})).toHaveLength(
        4
      );

      const byCountry = filterTalusColdTrapSites(TALUS_COLD_TRAP_SITES, {
        country: 'Czech Republic',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('kamenec-crevice-ice-talus-bohemia-czechia');

      const byRegime = filterTalusColdTrapSites(TALUS_COLD_TRAP_SITES, {
        regime: 'algific-dolomite-cold-vent-slope',
      });
      expect(byRegime).toHaveLength(1);
      expect(byRegime[0].id).toBe('driftless-algific-talus-slopes-iowa');

      const byDifficulty = filterTalusColdTrapSites(TALUS_COLD_TRAP_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterTalusColdTrapSites(TALUS_COLD_TRAP_SITES, {
        search: 'Mahoosuc',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe(
        'king-ravine-mahosuc-notch-white-mountains-nh'
      );
    });
  });

  describe('calculateTalusColdTrap', () => {
    const validBase: TalusColdTrapInput = {
      ambientAirTempC: 4,
      creviceVoidDepthM: 2.5,
      mossHumusMaskingPct: 10,
      boulderBlockSpanM: 1.2,
      coldDraftVelocityMs: 1.8,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateTalusColdTrap({ ...validBase, ambientAirTempC: -11 })
      ).toThrow(/ambientAirTempC/i);
      expect(() =>
        calculateTalusColdTrap({ ...validBase, ambientAirTempC: 39 })
      ).toThrow(/ambientAirTempC/i);
      expect(() =>
        calculateTalusColdTrap({ ...validBase, ambientAirTempC: NaN })
      ).toThrow(/ambientAirTempC/i);

      expect(() =>
        calculateTalusColdTrap({ ...validBase, creviceVoidDepthM: 0.9 })
      ).toThrow(/creviceVoidDepthM/i);
      expect(() =>
        calculateTalusColdTrap({ ...validBase, creviceVoidDepthM: 35.1 })
      ).toThrow(/creviceVoidDepthM/i);

      expect(() =>
        calculateTalusColdTrap({ ...validBase, mossHumusMaskingPct: -1 })
      ).toThrow(/mossHumusMaskingPct/i);
      expect(() =>
        calculateTalusColdTrap({ ...validBase, mossHumusMaskingPct: 101 })
      ).toThrow(/mossHumusMaskingPct/i);

      expect(() =>
        calculateTalusColdTrap({ ...validBase, boulderBlockSpanM: 0.3 })
      ).toThrow(/boulderBlockSpanM/i);
      expect(() =>
        calculateTalusColdTrap({ ...validBase, boulderBlockSpanM: 12.1 })
      ).toThrow(/boulderBlockSpanM/i);

      expect(() =>
        calculateTalusColdTrap({ ...validBase, coldDraftVelocityMs: 0.05 })
      ).toThrow(/coldDraftVelocityMs/i);
      expect(() =>
        calculateTalusColdTrap({ ...validBase, coldDraftVelocityMs: 8.6 })
      ).toThrow(/coldDraftVelocityMs/i);
    });

    it('computes low risk level and three-point-dry-granite-hop strategy under cool air, shallow voids, and minimal moss masking', () => {
      const analysis = calculateTalusColdTrap(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.navigationStrategy).toBe('three-point-dry-granite-hop');
      expect(analysis.verglasGlazeSlipProbabilityPct).toBeGreaterThanOrEqual(3);
      expect(analysis.verglasGlazeSlipProbabilityPct).toBeLessThan(30);
      expect(analysis.mossBridgeCollapseRiskPct).toBeGreaterThanOrEqual(2);
      expect(analysis.mossBridgeCollapseRiskPct).toBeLessThan(30);
      expect(analysis.voidHypothermiaCoolingRateCPerHr).toBeGreaterThanOrEqual(
        0.3
      );
      expect(analysis.voidHypothermiaCoolingRateCPerHr).toBeLessThan(1.5);
      expect(analysis.radonCo2PocketAccumulationIndex).toBeGreaterThanOrEqual(
        5
      );
      expect(analysis.radonCo2PocketAccumulationIndex).toBeLessThan(35);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases verglasGlazeSlipProbabilityPct, mossBridgeCollapseRiskPct, and voidHypothermiaCoolingRateCPerHr under higher ambient temperature, deeper voids, denser moss mats, wider block spans, and stronger cold draft', () => {
      const mild = calculateTalusColdTrap(validBase);
      const severe = calculateTalusColdTrap({
        ambientAirTempC: 32,
        creviceVoidDepthM: 29.0,
        mossHumusMaskingPct: 88,
        boulderBlockSpanM: 9.8,
        coldDraftVelocityMs: 7.2,
      });

      expect(severe.verglasGlazeSlipProbabilityPct).toBeGreaterThan(
        mild.verglasGlazeSlipProbabilityPct
      );
      expect(severe.mossBridgeCollapseRiskPct).toBeGreaterThan(
        mild.mossBridgeCollapseRiskPct
      );
      expect(severe.voidHypothermiaCoolingRateCPerHr).toBeGreaterThan(
        mild.voidHypothermiaCoolingRateCPerHr
      );

      // Verify radonCo2PocketAccumulationIndex increases with creviceVoidDepthM and inverse coldDraftVelocityMs
      const stagnantDeep = calculateTalusColdTrap({
        ...validBase,
        creviceVoidDepthM: 32.0,
        coldDraftVelocityMs: 0.2,
      });
      const ventilatedShallow = calculateTalusColdTrap({
        ...validBase,
        creviceVoidDepthM: 2.0,
        coldDraftVelocityMs: 7.5,
      });
      expect(stagnantDeep.radonCo2PocketAccumulationIndex).toBeGreaterThan(
        ventilatedShallow.radonCo2PocketAccumulationIndex
      );
    });

    it('computes moderate risk level and probe-sphagnum-mats-microspike-transition strategy when moderate thresholds are met', () => {
      const analysis = calculateTalusColdTrap({
        ambientAirTempC: 16,
        creviceVoidDepthM: 9.0,
        mossHumusMaskingPct: 38,
        boulderBlockSpanM: 3.5,
        coldDraftVelocityMs: 2.6,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.navigationStrategy).toBe(
        'probe-sphagnum-mats-microspike-transition'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and belay-chockstone-crawl-avoid-deep-vents strategy when high thresholds are met', () => {
      const analysis = calculateTalusColdTrap({
        ambientAirTempC: 24,
        creviceVoidDepthM: 18.0,
        mossHumusMaskingPct: 64,
        boulderBlockSpanM: 6.5,
        coldDraftVelocityMs: 4.5,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.navigationStrategy).toBe(
        'belay-chockstone-crawl-avoid-deep-vents'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-glazed-megatalus-entrapment-hazard strategy under extreme verglas, moss collapse, hypothermia, or gas accumulation', () => {
      const analysis = calculateTalusColdTrap({
        ambientAirTempC: 32,
        creviceVoidDepthM: 29.0,
        mossHumusMaskingPct: 88,
        boulderBlockSpanM: 9.8,
        coldDraftVelocityMs: 7.2,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.navigationStrategy).toBe(
        'abort-glazed-megatalus-entrapment-hazard'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getTalusColdTrapGearChecklist', () => {
    it('returns at least 6 gear items spanning verglas-traction, void-fall-protection, cold-cavity-rescue, and ecological-preservation', () => {
      const gear = getTalusColdTrapGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('verglas-traction')).toBe(true);
      expect(categories.has('void-fall-protection')).toBe(true);
      expect(categories.has('cold-cavity-rescue')).toBe(true);
      expect(categories.has('ecological-preservation')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
