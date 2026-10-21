import { describe, it, expect } from 'vitest';
import {
  AAPA_PALSA_MIRE_SITES,
  filterAapaPalsaMireSites,
  calculateAapaPalsaMire,
  getAapaPalsaMireGearChecklist,
  type AapaPalsaMireInput,
} from '../aapa-palsa-mire';

describe('aapa-palsa-mire domain library', () => {
  describe('AAPA_PALSA_MIRE_SITES catalog', () => {
    it('exports all 4 real-world boreal string-bog (aapa mire) & palsa permafrost-mound zones with complete metadata', () => {
      expect(AAPA_PALSA_MIRE_SITES).toHaveLength(4);

      const ids = AAPA_PALSA_MIRE_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'voda-viiankiaapa-sodankyla-lapland-finland',
        'tavvavuoma-kummavuopio-palsa-norrbotten-sweden',
        'hudson-bay-lowlands-sutton-ridges-ontario-canada',
        'pasvik-iettiselga-injarvi-palsa-finnmark-norway',
      ]);

      const viiankiaapa = AAPA_PALSA_MIRE_SITES.find(
        (s) => s.id === 'voda-viiankiaapa-sodankyla-lapland-finland'
      );
      expect(viiankiaapa).toBeDefined();
      expect(viiankiaapa?.name).toBe(
        'Viiankiaapa & Sodankylä Concentric String-Bog (Aapasuo) Labyrinth'
      );
      expect(viiankiaapa?.borealSubarcticZone).toBe(
        'Central Lapland Mire Reserve'
      );
      expect(viiankiaapa?.country).toBe('Finland');
      expect(viiankiaapa?.region).toBe('Sodankylä');
      expect(viiankiaapa?.elevationMeters).toBe(205);
      expect(viiankiaapa?.morphology).toBe('concentric-strang-flark-aapa');

      const tavvavuoma = AAPA_PALSA_MIRE_SITES.find(
        (s) => s.id === 'tavvavuoma-kummavuopio-palsa-norrbotten-sweden'
      );
      expect(tavvavuoma).toBeDefined();
      expect(tavvavuoma?.name).toBe(
        'Tavvavuoma & Vissátvuopmi Giant Palsa-Mound Plateau'
      );
      expect(tavvavuoma?.borealSubarcticZone).toBe(
        'Vindelfjällen / Kiruna Subarctic Permafrost Zone'
      );
      expect(tavvavuoma?.country).toBe('Sweden');
      expect(tavvavuoma?.region).toBe('Norrbotten');
      expect(tavvavuoma?.elevationMeters).toBe(550);
      expect(tavvavuoma?.morphology).toBe('ice-cored-palsa-dome-plateau');

      const hudsonBay = AAPA_PALSA_MIRE_SITES.find(
        (s) => s.id === 'hudson-bay-lowlands-sutton-ridges-ontario-canada'
      );
      expect(hudsonBay).toBeDefined();
      expect(hudsonBay?.name).toBe(
        'Hudson Bay Lowlands & Polar Bear Provincial Park String-Fen & Palsa Complex'
      );
      expect(hudsonBay?.borealSubarcticZone).toBe(
        'James Bay / Hudson Bay Peatland Basin'
      );
      expect(hudsonBay?.country).toBe('Canada');
      expect(hudsonBay?.region).toBe('Northern Ontario');
      expect(hudsonBay?.elevationMeters).toBe(65);
      expect(hudsonBay?.morphology).toBe('thermokarst-lagg-moat-collapse');

      const pasvik = AAPA_PALSA_MIRE_SITES.find(
        (s) => s.id === 'pasvik-iettiselga-injarvi-palsa-finnmark-norway'
      );
      expect(pasvik).toBeDefined();
      expect(pasvik?.name).toBe(
        'Øvre Pasvik & Neiden-Munkefjord Palsa-Aapa Mire Corridor'
      );
      expect(pasvik?.borealSubarcticZone).toBe(
        'Sør-Varanger / Finnmark Permafrost Mire Belt'
      );
      expect(pasvik?.country).toBe('Norway');
      expect(pasvik?.region).toBe('Troms og Finnmark');
      expect(pasvik?.elevationMeters).toBe(115);
      expect(pasvik?.morphology).toBe('minerotrophic-sedge-carpet-fen');

      for (const site of AAPA_PALSA_MIRE_SITES) {
        expect(site.borealSubarcticZone.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.strangRidgeWidthM).toBeGreaterThanOrEqual(0.3);
        expect(site.strangRidgeWidthM).toBeLessThanOrEqual(6.0);
        expect(site.flarkPoolDepthM).toBeGreaterThan(0);
        expect(site.palsaMoundHeightM).toBeGreaterThanOrEqual(0);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.crossingProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterAapaPalsaMireSites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterAapaPalsaMireSites(AAPA_PALSA_MIRE_SITES, {})).toHaveLength(
        4
      );

      const byCountry = filterAapaPalsaMireSites(AAPA_PALSA_MIRE_SITES, {
        country: 'Finland',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe(
        'voda-viiankiaapa-sodankyla-lapland-finland'
      );

      const byMorphology = filterAapaPalsaMireSites(AAPA_PALSA_MIRE_SITES, {
        morphology: 'ice-cored-palsa-dome-plateau',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe(
        'tavvavuoma-kummavuopio-palsa-norrbotten-sweden'
      );

      const byDifficulty = filterAapaPalsaMireSites(AAPA_PALSA_MIRE_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterAapaPalsaMireSites(AAPA_PALSA_MIRE_SITES, {
        search: 'Hudson Bay',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe(
        'hudson-bay-lowlands-sutton-ridges-ontario-canada'
      );
    });
  });

  describe('calculateAapaPalsaMire', () => {
    const validBase: AapaPalsaMireInput = {
      strangWidthM: 4.5,
      flarkTroughSpanM: 5.0,
      activeThawDepthCm: 25,
      palsaRimFissureScore: 10,
      hikerPackWeightKg: 10,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateAapaPalsaMire({ ...validBase, strangWidthM: 0.2 })
      ).toThrow(/strangWidthM/i);
      expect(() =>
        calculateAapaPalsaMire({ ...validBase, strangWidthM: 6.1 })
      ).toThrow(/strangWidthM/i);
      expect(() =>
        calculateAapaPalsaMire({ ...validBase, strangWidthM: NaN })
      ).toThrow(/strangWidthM/i);

      expect(() =>
        calculateAapaPalsaMire({ ...validBase, flarkTroughSpanM: 0.8 })
      ).toThrow(/flarkTroughSpanM/i);
      expect(() =>
        calculateAapaPalsaMire({ ...validBase, flarkTroughSpanM: 66.0 })
      ).toThrow(/flarkTroughSpanM/i);

      expect(() =>
        calculateAapaPalsaMire({ ...validBase, activeThawDepthCm: 14 })
      ).toThrow(/activeThawDepthCm/i);
      expect(() =>
        calculateAapaPalsaMire({ ...validBase, activeThawDepthCm: 141 })
      ).toThrow(/activeThawDepthCm/i);

      expect(() =>
        calculateAapaPalsaMire({ ...validBase, palsaRimFissureScore: -1 })
      ).toThrow(/palsaRimFissureScore/i);
      expect(() =>
        calculateAapaPalsaMire({ ...validBase, palsaRimFissureScore: 101 })
      ).toThrow(/palsaRimFissureScore/i);

      expect(() =>
        calculateAapaPalsaMire({ ...validBase, hikerPackWeightKg: 4 })
      ).toThrow(/hikerPackWeightKg/i);
      expect(() =>
        calculateAapaPalsaMire({ ...validBase, hikerPackWeightKg: 56 })
      ).toThrow(/hikerPackWeightKg/i);
    });

    it('computes low risk level and thread-continuous-betula-strang-crests strategy under wide sträng ridges, narrow flark spans, shallow thaw, intact palsa rims, and light pack weight', () => {
      const analysis = calculateAapaPalsaMire(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.crossingStrategy).toBe(
        'thread-continuous-betula-strang-crests'
      );
      expect(analysis.strangShearBreakthroughRiskPct).toBeGreaterThanOrEqual(2);
      expect(analysis.strangShearBreakthroughRiskPct).toBeLessThan(28);
      expect(analysis.palsaLaggMoatEntrapmentPct).toBeGreaterThanOrEqual(3);
      expect(analysis.palsaLaggMoatEntrapmentPct).toBeLessThan(30);
      expect(analysis.flarkDetourDistanceMultiplier).toBeGreaterThanOrEqual(
        1.15
      );
      expect(analysis.flarkDetourDistanceMultiplier).toBeLessThan(1.85);
      expect(analysis.blackflyMosquitoSwarmStressIndex).toBeGreaterThanOrEqual(
        5
      );
      expect(analysis.blackflyMosquitoSwarmStressIndex).toBeLessThan(40);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases strangShearBreakthroughRiskPct, palsaLaggMoatEntrapmentPct, flarkDetourDistanceMultiplier, and blackflyMosquitoSwarmStressIndex as inputs worsen', () => {
      const mild = calculateAapaPalsaMire(validBase);
      const severe = calculateAapaPalsaMire({
        strangWidthM: 0.5,
        flarkTroughSpanM: 58.0,
        activeThawDepthCm: 130,
        palsaRimFissureScore: 92,
        hikerPackWeightKg: 48,
      });

      expect(severe.strangShearBreakthroughRiskPct).toBeGreaterThan(
        mild.strangShearBreakthroughRiskPct
      );
      expect(severe.palsaLaggMoatEntrapmentPct).toBeGreaterThan(
        mild.palsaLaggMoatEntrapmentPct
      );
      expect(severe.flarkDetourDistanceMultiplier).toBeGreaterThan(
        mild.flarkDetourDistanceMultiplier
      );
      expect(severe.blackflyMosquitoSwarmStressIndex).toBeGreaterThan(
        mild.blackflyMosquitoSwarmStressIndex
      );
    });

    it('computes moderate risk level and probe-sedge-mat-distribute-load strategy when moderate thresholds are met', () => {
      const analysis = calculateAapaPalsaMire({
        strangWidthM: 2.6,
        flarkTroughSpanM: 22.0,
        activeThawDepthCm: 55,
        palsaRimFissureScore: 34,
        hikerPackWeightKg: 22,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.crossingStrategy).toBe('probe-sedge-mat-distribute-load');
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and wide-berth-palsa-lagg-moat-detour strategy when high thresholds are met', () => {
      const analysis = calculateAapaPalsaMire({
        strangWidthM: 1.5,
        flarkTroughSpanM: 38.0,
        activeThawDepthCm: 85,
        palsaRimFissureScore: 62,
        hikerPackWeightKg: 35,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.crossingStrategy).toBe(
        'wide-berth-palsa-lagg-moat-detour'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-quaking-flark-basin-route-esker strategy under extreme sträng shear, palsa lagg collapse, flark detour, or insect swarm stress', () => {
      const analysis = calculateAapaPalsaMire({
        strangWidthM: 0.5,
        flarkTroughSpanM: 58.0,
        activeThawDepthCm: 130,
        palsaRimFissureScore: 92,
        hikerPackWeightKg: 48,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.crossingStrategy).toBe(
        'abort-quaking-flark-basin-route-esker'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getAapaPalsaMireGearChecklist', () => {
    it('returns at least 6 gear items spanning mire-flotation-probing, permafrost-lagg-safety, subarctic-insect-defense, and hypothermia-dry-system', () => {
      const gear = getAapaPalsaMireGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('mire-flotation-probing')).toBe(true);
      expect(categories.has('permafrost-lagg-safety')).toBe(true);
      expect(categories.has('subarctic-insect-defense')).toBe(true);
      expect(categories.has('hypothermia-dry-system')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
