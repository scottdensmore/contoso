import { describe, it, expect } from 'vitest';
import {
  OBSIDIAN_COULEE_SITES,
  filterObsidianCouleeSites,
  calculateObsidianCoulee,
  getObsidianCouleeGearChecklist,
  type ObsidianCouleeInput,
} from '../obsidian-coulee';

describe('obsidian-coulee domain library', () => {
  describe('OBSIDIAN_COULEE_SITES catalog', () => {
    it('exports all 4 real-world high-altitude volcanic obsidian-flow & glass-block coulee scrambling zones with complete metadata', () => {
      expect(OBSIDIAN_COULEE_SITES).toHaveLength(4);

      const ids = OBSIDIAN_COULEE_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'big-obsidian-flow-newberry-caldera-oregon',
        'glass-mountain-medicine-lake-volcano-california',
        'panum-crater-mono-inyo-obsidian-domes-california',
        'hrafntinnusker-torfajokull-obsidian-plateau-iceland',
      ]);

      const newberry = OBSIDIAN_COULEE_SITES.find(
        (s) => s.id === 'big-obsidian-flow-newberry-caldera-oregon'
      );
      expect(newberry).toBeDefined();
      expect(newberry?.name).toBe(
        'Big Obsidian Flow & Paulina Peak Rhyolite Coulee'
      );
      expect(newberry?.volcanicCaldera).toBe(
        'Newberry National Volcanic Monument'
      );
      expect(newberry?.country).toBe('USA');
      expect(newberry?.region).toBe('Deschutes County, Oregon');
      expect(newberry?.elevationMeters).toBe(2100);
      expect(newberry?.lithology).toBe('banded-rhyolite-obsidian-coulee');

      const medicineLake = OBSIDIAN_COULEE_SITES.find(
        (s) => s.id === 'glass-mountain-medicine-lake-volcano-california'
      );
      expect(medicineLake).toBeDefined();
      expect(medicineLake?.name).toBe(
        'Glass Mountain & Little Glass Mountain Dacite-Rhyolite Obsidian Flow'
      );
      expect(medicineLake?.volcanicCaldera).toBe(
        'Medicine Lake Volcano Highlands'
      );
      expect(medicineLake?.country).toBe('USA');
      expect(medicineLake?.region).toBe('Siskiyou County, California');
      expect(medicineLake?.elevationMeters).toBe(2323);
      expect(medicineLake?.lithology).toBe('pumiceous-carapace-glass-dome');

      const panum = OBSIDIAN_COULEE_SITES.find(
        (s) => s.id === 'panum-crater-mono-inyo-obsidian-domes-california'
      );
      expect(panum).toBeDefined();
      expect(panum?.name).toBe(
        'Panum Crater & Obsidian Dome Pressure-Spine Coulee'
      );
      expect(panum?.volcanicCaldera).toBe('Mono-Inyo Craters Volcanic Chain');
      expect(panum?.country).toBe('USA');
      expect(panum?.region).toBe('Mono County, California');
      expect(panum?.elevationMeters).toBe(2485);
      expect(panum?.lithology).toBe('perlitic-breccia-pressure-spine');

      const hrafntinnusker = OBSIDIAN_COULEE_SITES.find(
        (s) => s.id === 'hrafntinnusker-torfajokull-obsidian-plateau-iceland'
      );
      expect(hrafntinnusker).toBeDefined();
      expect(hrafntinnusker?.name).toBe(
        'Hrafntinnusker & Laugavegur Subglacial-Rhyolite Obsidian Ridge'
      );
      expect(hrafntinnusker?.volcanicCaldera).toBe(
        'Fjallabak Nature Reserve / Torfajökull Caldera'
      );
      expect(hrafntinnusker?.country).toBe('Iceland');
      expect(hrafntinnusker?.region).toBe('Highlands');
      expect(hrafntinnusker?.elevationMeters).toBe(1128);
      expect(hrafntinnusker?.lithology).toBe('vitrophyre-block-rubble-lobe');

      for (const site of OBSIDIAN_COULEE_SITES) {
        expect(site.volcanicCaldera.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.conchoidalBladeIndex).toBeGreaterThan(0);
        expect(site.couleeReliefMeters).toBeGreaterThan(0);
        expect(site.pumiceCrustFragilityPct).toBeGreaterThanOrEqual(0);
        expect(site.pumiceCrustFragilityPct).toBeLessThanOrEqual(100);
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

  describe('filterObsidianCouleeSites', () => {
    it('filters sites by country, lithology, difficulty, and search query', () => {
      expect(filterObsidianCouleeSites(OBSIDIAN_COULEE_SITES, {})).toHaveLength(
        4
      );

      const byCountry = filterObsidianCouleeSites(OBSIDIAN_COULEE_SITES, {
        country: 'Iceland',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe(
        'hrafntinnusker-torfajokull-obsidian-plateau-iceland'
      );

      const byLithology = filterObsidianCouleeSites(OBSIDIAN_COULEE_SITES, {
        lithology: 'pumiceous-carapace-glass-dome',
      });
      expect(byLithology).toHaveLength(1);
      expect(byLithology[0].id).toBe(
        'glass-mountain-medicine-lake-volcano-california'
      );

      const byDifficulty = filterObsidianCouleeSites(OBSIDIAN_COULEE_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterObsidianCouleeSites(OBSIDIAN_COULEE_SITES, {
        search: 'Panum Crater',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe(
        'panum-crater-mono-inyo-obsidian-domes-california'
      );
    });
  });

  describe('calculateObsidianCoulee', () => {
    const validBase: ObsidianCouleeInput = {
      conchoidalFlakeDensityPct: 12,
      blockInstabilityTiltDeg: 6,
      vesicularPumiceCrustRatioPct: 14,
      couleeCrestReliefM: 18,
      scramblerPackMassKg: 9,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateObsidianCoulee({ ...validBase, conchoidalFlakeDensityPct: 4 })
      ).toThrow(/conchoidalFlakeDensityPct/i);
      expect(() =>
        calculateObsidianCoulee({
          ...validBase,
          conchoidalFlakeDensityPct: 101,
        })
      ).toThrow(/conchoidalFlakeDensityPct/i);
      expect(() =>
        calculateObsidianCoulee({
          ...validBase,
          conchoidalFlakeDensityPct: NaN,
        })
      ).toThrow(/conchoidalFlakeDensityPct/i);

      expect(() =>
        calculateObsidianCoulee({ ...validBase, blockInstabilityTiltDeg: 1 })
      ).toThrow(/blockInstabilityTiltDeg/i);
      expect(() =>
        calculateObsidianCoulee({ ...validBase, blockInstabilityTiltDeg: 49 })
      ).toThrow(/blockInstabilityTiltDeg/i);

      expect(() =>
        calculateObsidianCoulee({
          ...validBase,
          vesicularPumiceCrustRatioPct: 4,
        })
      ).toThrow(/vesicularPumiceCrustRatioPct/i);
      expect(() =>
        calculateObsidianCoulee({
          ...validBase,
          vesicularPumiceCrustRatioPct: 96,
        })
      ).toThrow(/vesicularPumiceCrustRatioPct/i);

      expect(() =>
        calculateObsidianCoulee({ ...validBase, couleeCrestReliefM: 4 })
      ).toThrow(/couleeCrestReliefM/i);
      expect(() =>
        calculateObsidianCoulee({ ...validBase, couleeCrestReliefM: 141 })
      ).toThrow(/couleeCrestReliefM/i);

      expect(() =>
        calculateObsidianCoulee({ ...validBase, scramblerPackMassKg: 3 })
      ).toThrow(/scramblerPackMassKg/i);
      expect(() =>
        calculateObsidianCoulee({ ...validBase, scramblerPackMassKg: 46 })
      ).toThrow(/scramblerPackMassKg/i);
    });

    it('computes low risk level and step-massive-flow-banded-ribs-avoid-flakes strategy under low flake density, gentle tilt, solid crust, low relief, and light pack', () => {
      const analysis = calculateObsidianCoulee(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.scramblingStrategy).toBe(
        'step-massive-flow-banded-ribs-avoid-flakes'
      );
      expect(analysis.surgicalLacerationSeverityScore).toBeGreaterThanOrEqual(
        5
      );
      expect(analysis.surgicalLacerationSeverityScore).toBeLessThan(32);
      expect(
        analysis.vesicularCrustCollapseProbabilityPct
      ).toBeGreaterThanOrEqual(2);
      expect(analysis.vesicularCrustCollapseProbabilityPct).toBeLessThan(28);
      expect(analysis.blockTeeterPinchHazardPct).toBeGreaterThanOrEqual(2);
      expect(analysis.blockTeeterPinchHazardPct).toBeLessThan(28);
      expect(analysis.bootLugShredRateMmPerKm).toBeGreaterThanOrEqual(0.2);
      expect(analysis.bootLugShredRateMmPerKm).toBeLessThan(2.0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases surgicalLacerationSeverityScore, vesicularCrustCollapseProbabilityPct, blockTeeterPinchHazardPct, and bootLugShredRateMmPerKm as inputs worsen', () => {
      const mild = calculateObsidianCoulee(validBase);
      const severe = calculateObsidianCoulee({
        conchoidalFlakeDensityPct: 92,
        blockInstabilityTiltDeg: 42,
        vesicularPumiceCrustRatioPct: 86,
        couleeCrestReliefM: 125,
        scramblerPackMassKg: 38,
      });

      expect(severe.surgicalLacerationSeverityScore).toBeGreaterThan(
        mild.surgicalLacerationSeverityScore
      );
      expect(severe.vesicularCrustCollapseProbabilityPct).toBeGreaterThan(
        mild.vesicularCrustCollapseProbabilityPct
      );
      expect(severe.blockTeeterPinchHazardPct).toBeGreaterThan(
        mild.blockTeeterPinchHazardPct
      );
      expect(severe.bootLugShredRateMmPerKm).toBeGreaterThan(
        mild.bootLugShredRateMmPerKm
      );
    });

    it('computes moderate risk level and kevlar-gauntlet-shinguard-three-point-test strategy when moderate thresholds are met', () => {
      const analysis = calculateObsidianCoulee({
        conchoidalFlakeDensityPct: 38,
        blockInstabilityTiltDeg: 16,
        vesicularPumiceCrustRatioPct: 36,
        couleeCrestReliefM: 45,
        scramblerPackMassKg: 16,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.scramblingStrategy).toBe(
        'kevlar-gauntlet-shinguard-three-point-test'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and bypass-pumice-carapace-trough-detour strategy when high thresholds are met', () => {
      const analysis = calculateObsidianCoulee({
        conchoidalFlakeDensityPct: 64,
        blockInstabilityTiltDeg: 28,
        vesicularPumiceCrustRatioPct: 62,
        couleeCrestReliefM: 82,
        scramblerPackMassKg: 26,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.scramblingStrategy).toBe(
        'bypass-pumice-carapace-trough-detour'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-glass-breccia-spine-imminent-shear strategy under extreme conchoidal flake density, unstable block tilt, frothy pumice crust, or heavy pack mass', () => {
      const analysis = calculateObsidianCoulee({
        conchoidalFlakeDensityPct: 92,
        blockInstabilityTiltDeg: 42,
        vesicularPumiceCrustRatioPct: 86,
        couleeCrestReliefM: 125,
        scramblerPackMassKg: 38,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.scramblingStrategy).toBe(
        'abort-glass-breccia-spine-imminent-shear'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getObsidianCouleeGearChecklist', () => {
    it('returns at least 6 gear items spanning ansi-a6-cut-armor, sole-shank-protection, silica-eye-respiratory, and trauma-hemostasis', () => {
      const gear = getObsidianCouleeGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('ansi-a6-cut-armor')).toBe(true);
      expect(categories.has('sole-shank-protection')).toBe(true);
      expect(categories.has('silica-eye-respiratory')).toBe(true);
      expect(categories.has('trauma-hemostasis')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
