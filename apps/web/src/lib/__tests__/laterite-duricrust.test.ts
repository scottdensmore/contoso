import { describe, it, expect } from 'vitest';
import {
  LATERITE_DURICRUST_SITES,
  filterLateriteDuricrustSites,
  calculateLateriteDuricrust,
  getLateriteDuricrustGearChecklist,
  type LateriteDuricrustInput,
} from '../laterite-duricrust';

describe('laterite-duricrust domain library', () => {
  describe('LATERITE_DURICRUST_SITES catalog', () => {
    it('exports all 4 real-world tropical laterite duricrust mesa, bowal & canga scarp-edge zones with complete metadata', () => {
      expect(LATERITE_DURICRUST_SITES).toHaveLength(4);

      const ids = LATERITE_DURICRUST_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'fouta-djallon-bowe-labe-guinea',
        'serra-dos-carajas-canga-para-brazil',
        'mitchell-plateau-ngauwudu-kimberley-australia',
        'panchgani-kaas-ferricrete-tableland-maharashtra-india',
      ]);

      const fouta = LATERITE_DURICRUST_SITES.find(
        (s) => s.id === 'fouta-djallon-bowe-labe-guinea'
      );
      expect(fouta).toBeDefined();
      expect(fouta?.name).toBe(
        'Fouta Djallon & Labé Ferricrete Bowé (Cuirasse Latéritique) Escarpment'
      );
      expect(fouta?.cratonProvince).toBe('Middle Guinea Highlands');
      expect(fouta?.country).toBe('Guinea');
      expect(fouta?.region).toBe('Labé / Mali Prefecture');
      expect(fouta?.elevationMeters).toBe(1180);
      expect(fouta?.duricrustType).toBe('ferricrete-bowal-ironstone-cuirasse');

      const carajas = LATERITE_DURICRUST_SITES.find(
        (s) => s.id === 'serra-dos-carajas-canga-para-brazil'
      );
      expect(carajas).toBeDefined();
      expect(carajas?.name).toBe(
        'Serra dos Carajás & Campos Rupestres de Canga Hematite Mesa'
      );
      expect(carajas?.cratonProvince).toBe('Carajás National Forest');
      expect(carajas?.country).toBe('Brazil');
      expect(carajas?.region).toBe('Parauapebas, Pará');
      expect(carajas?.elevationMeters).toBe(720);
      expect(carajas?.duricrustType).toBe('canga-hematite-rupestre-plateau');

      const mitchell = LATERITE_DURICRUST_SITES.find(
        (s) => s.id === 'mitchell-plateau-ngauwudu-kimberley-australia'
      );
      expect(mitchell).toBeDefined();
      expect(mitchell?.name).toBe(
        'Mitchell Plateau (Ngauwudu) Bauxite-Laterite Breakaway Scarp'
      );
      expect(mitchell?.cratonProvince).toBe('North Kimberley Craton');
      expect(mitchell?.country).toBe('Australia');
      expect(mitchell?.region).toBe('Western Australia');
      expect(mitchell?.elevationMeters).toBe(340);
      expect(mitchell?.duricrustType).toBe('bauxite-aluminocrete-scarp-rim');

      const kaas = LATERITE_DURICRUST_SITES.find(
        (s) => s.id === 'panchgani-kaas-ferricrete-tableland-maharashtra-india'
      );
      expect(kaas).toBeDefined();
      expect(kaas?.name).toBe(
        'Kaas Plateau & Panchgani Deccan Laterite Tableland Rim'
      );
      expect(kaas?.cratonProvince).toBe('Northern Western Ghats (Sahyadri)');
      expect(kaas?.country).toBe('India');
      expect(kaas?.region).toBe('Satara, Maharashtra');
      expect(kaas?.elevationMeters).toBe(1240);
      expect(kaas?.duricrustType).toBe('pisolitic-buckshot-breakaway-cap');

      for (const site of LATERITE_DURICRUST_SITES) {
        expect(site.cratonProvince.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.pisoliteGravelCoverPct).toBeGreaterThanOrEqual(0);
        expect(site.pisoliteGravelCoverPct).toBeLessThanOrEqual(100);
        expect(site.scarpUndercutOverhangM).toBeGreaterThanOrEqual(0);
        expect(site.magneticDeclinationAnomalyDeg).toBeGreaterThan(0);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.scarpProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterLateriteDuricrustSites', () => {
    it('filters sites by country, duricrustType, difficulty, and search query', () => {
      expect(
        filterLateriteDuricrustSites(LATERITE_DURICRUST_SITES, {})
      ).toHaveLength(4);

      const byCountry = filterLateriteDuricrustSites(LATERITE_DURICRUST_SITES, {
        country: 'Guinea',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('fouta-djallon-bowe-labe-guinea');

      const byType = filterLateriteDuricrustSites(LATERITE_DURICRUST_SITES, {
        duricrustType: 'canga-hematite-rupestre-plateau',
      });
      expect(byType).toHaveLength(1);
      expect(byType[0].id).toBe('serra-dos-carajas-canga-para-brazil');

      const byDifficulty = filterLateriteDuricrustSites(
        LATERITE_DURICRUST_SITES,
        {
          difficulty: 'extreme',
        }
      );
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterLateriteDuricrustSites(LATERITE_DURICRUST_SITES, {
        search: 'Mitchell Plateau',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe(
        'mitchell-plateau-ngauwudu-kimberley-australia'
      );
    });
  });

  describe('calculateLateriteDuricrust', () => {
    const validBase: LateriteDuricrustInput = {
      pisoliteGravelDepthMm: 6,
      scarpSlopeAngleDeg: 10,
      saproliteUndercutSpanM: 0.5,
      surfaceRockTempC: 28,
      convectiveStormProximityKm: 48.0,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateLateriteDuricrust({ ...validBase, pisoliteGravelDepthMm: -1 })
      ).toThrow(/pisoliteGravelDepthMm/i);
      expect(() =>
        calculateLateriteDuricrust({ ...validBase, pisoliteGravelDepthMm: 86 })
      ).toThrow(/pisoliteGravelDepthMm/i);
      expect(() =>
        calculateLateriteDuricrust({ ...validBase, pisoliteGravelDepthMm: NaN })
      ).toThrow(/pisoliteGravelDepthMm/i);

      expect(() =>
        calculateLateriteDuricrust({ ...validBase, scarpSlopeAngleDeg: 4 })
      ).toThrow(/scarpSlopeAngleDeg/i);
      expect(() =>
        calculateLateriteDuricrust({ ...validBase, scarpSlopeAngleDeg: 56 })
      ).toThrow(/scarpSlopeAngleDeg/i);

      expect(() =>
        calculateLateriteDuricrust({
          ...validBase,
          saproliteUndercutSpanM: -0.1,
        })
      ).toThrow(/saproliteUndercutSpanM/i);
      expect(() =>
        calculateLateriteDuricrust({
          ...validBase,
          saproliteUndercutSpanM: 6.6,
        })
      ).toThrow(/saproliteUndercutSpanM/i);

      expect(() =>
        calculateLateriteDuricrust({ ...validBase, surfaceRockTempC: 21 })
      ).toThrow(/surfaceRockTempC/i);
      expect(() =>
        calculateLateriteDuricrust({ ...validBase, surfaceRockTempC: 73 })
      ).toThrow(/surfaceRockTempC/i);

      expect(() =>
        calculateLateriteDuricrust({
          ...validBase,
          convectiveStormProximityKm: 0.9,
        })
      ).toThrow(/convectiveStormProximityKm/i);
      expect(() =>
        calculateLateriteDuricrust({
          ...validBase,
          convectiveStormProximityKm: 60.1,
        })
      ).toThrow(/convectiveStormProximityKm/i);
    });

    it('computes low risk level and inland-cuirasse-slab-gnss-bearing strategy under shallow pisolite gravel, gentle slope, minimal saprolite undercut, cool rock temp, and distant storm', () => {
      const analysis = calculateLateriteDuricrust(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.scarpStrategy).toBe('inland-cuirasse-slab-gnss-bearing');
      expect(analysis.pisoliteBallBearingSlipPct).toBeGreaterThanOrEqual(2);
      expect(analysis.pisoliteBallBearingSlipPct).toBeLessThan(28);
      expect(analysis.cantileverRimCollapseProbabilityPct).toBeGreaterThanOrEqual(
        1
      );
      expect(analysis.cantileverRimCollapseProbabilityPct).toBeLessThan(26);
      expect(analysis.ferruginousCompassDeviationDeg).toBeGreaterThanOrEqual(
        1.5
      );
      expect(analysis.ferruginousCompassDeviationDeg).toBeLessThan(9.5);
      expect(analysis.mesaLightningThermalHazardScore).toBeGreaterThanOrEqual(5);
      expect(analysis.mesaLightningThermalHazardScore).toBeLessThan(34);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases pisoliteBallBearingSlipPct, cantileverRimCollapseProbabilityPct, ferruginousCompassDeviationDeg, and mesaLightningThermalHazardScore as inputs worsen', () => {
      const mild = calculateLateriteDuricrust(validBase);
      const severe = calculateLateriteDuricrust({
        pisoliteGravelDepthMm: 75,
        scarpSlopeAngleDeg: 48,
        saproliteUndercutSpanM: 5.8,
        surfaceRockTempC: 66,
        convectiveStormProximityKm: 4.0,
      });

      expect(severe.pisoliteBallBearingSlipPct).toBeGreaterThan(
        mild.pisoliteBallBearingSlipPct
      );
      expect(severe.cantileverRimCollapseProbabilityPct).toBeGreaterThan(
        mild.cantileverRimCollapseProbabilityPct
      );
      expect(severe.ferruginousCompassDeviationDeg).toBeGreaterThan(
        mild.ferruginousCompassDeviationDeg
      );
      expect(severe.mesaLightningThermalHazardScore).toBeGreaterThan(
        mild.mesaLightningThermalHazardScore
      );
    });

    it('computes moderate risk level and sweep-pisolite-pea-gravel-trekking-poles strategy when moderate thresholds are met', () => {
      const analysis = calculateLateriteDuricrust({
        pisoliteGravelDepthMm: 26,
        scarpSlopeAngleDeg: 22,
        saproliteUndercutSpanM: 2.0,
        surfaceRockTempC: 40,
        convectiveStormProximityKm: 34.0,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.scarpStrategy).toBe(
        'sweep-pisolite-pea-gravel-trekking-poles'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and setback-6m-undercut-saprolite-cornice strategy when high thresholds are met', () => {
      const analysis = calculateLateriteDuricrust({
        pisoliteGravelDepthMm: 50,
        scarpSlopeAngleDeg: 35,
        saproliteUndercutSpanM: 3.8,
        surfaceRockTempC: 52,
        convectiveStormProximityKm: 18.0,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.scarpStrategy).toBe(
        'setback-6m-undercut-saprolite-cornice'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-rim-descend-gully-lightning-collapse strategy under extreme pisolite gravel, steep scarp, deep saprolite undercut, or close convective storm', () => {
      const analysis = calculateLateriteDuricrust({
        pisoliteGravelDepthMm: 75,
        scarpSlopeAngleDeg: 48,
        saproliteUndercutSpanM: 5.8,
        surfaceRockTempC: 66,
        convectiveStormProximityKm: 4.0,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.scarpStrategy).toBe(
        'abort-rim-descend-gully-lightning-collapse'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getLateriteDuricrustGearChecklist', () => {
    it('returns at least 6 gear items spanning pisolite-traction, gnss-nonmagnetic-nav, scarp-thermal-shield, and canga-flora-protection', () => {
      const gear = getLateriteDuricrustGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('pisolite-traction')).toBe(true);
      expect(categories.has('gnss-nonmagnetic-nav')).toBe(true);
      expect(categories.has('scarp-thermal-shield')).toBe(true);
      expect(categories.has('canga-flora-protection')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
