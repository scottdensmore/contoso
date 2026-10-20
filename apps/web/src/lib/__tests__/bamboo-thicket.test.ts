import { describe, it, expect } from 'vitest';
import {
  BAMBOO_THICKET_SITES,
  filterBambooSites,
  calculateBambooThicket,
  getBambooGearChecklist,
  type BambooThicketInput,
} from '../bamboo-thicket';

describe('bamboo-thicket domain library', () => {
  describe('BAMBOO_THICKET_SITES catalog', () => {
    it('exports all 4 real-world montane bamboo-thicket bushwhacking zones with complete metadata', () => {
      expect(BAMBOO_THICKET_SITES).toHaveLength(4);

      const ids = BAMBOO_THICKET_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'chirripo-talamanca-chusquea-costa-rica',
        'hidaka-sasa-kurilensis-hokkaido-japan',
        'rwenzori-virunga-yushania-uganda',
        'vilcabamba-colani-chusquea-peru',
      ]);

      const chirripo = BAMBOO_THICKET_SITES.find(
        (s) => s.id === 'chirripo-talamanca-chusquea-costa-rica'
      );
      expect(chirripo).toBeDefined();
      expect(chirripo?.name).toBe(
        'Cordillera de Talamanca & Cerro Kamuk Chusquea Cloud-Ridge'
      );
      expect(chirripo?.mountainCordillera).toBe('La Amistad International Park');
      expect(chirripo?.country).toBe('Costa Rica');
      expect(chirripo?.region).toBe('Limón / Puntarenas');
      expect(chirripo?.elevationMeters).toBe(3250);
      expect(chirripo?.ecotype).toBe('chusquea-solid-culm-cloud-ridge');

      const hidaka = BAMBOO_THICKET_SITES.find(
        (s) => s.id === 'hidaka-sasa-kurilensis-hokkaido-japan'
      );
      expect(hidaka).toBeDefined();
      expect(hidaka?.name).toBe(
        'Hidaka Mountains Poroshiri-dake Sasa kurilensis (Chishima-zasa) Crest'
      );
      expect(hidaka?.mountainCordillera).toBe(
        'Hidaka Sanmyaku-Erimo Quasi-National Park'
      );
      expect(hidaka?.country).toBe('Japan');
      expect(hidaka?.region).toBe('Hokkaido');
      expect(hidaka?.elevationMeters).toBe(1850);
      expect(hidaka?.ecotype).toBe('sasa-kurilensis-dwarf-snow-bamboo');

      const rwenzori = BAMBOO_THICKET_SITES.find(
        (s) => s.id === 'rwenzori-virunga-yushania-uganda'
      );
      expect(rwenzori).toBeDefined();
      expect(rwenzori?.name).toBe(
        'Rwenzori & Virunga Yushania alpina Montane Bamboo Belt'
      );
      expect(rwenzori?.mountainCordillera).toBe('Albertine Rift Cloud Forest');
      expect(rwenzori?.country).toBe('Uganda');
      expect(rwenzori?.region).toBe('Kasese / Kisoro');
      expect(rwenzori?.elevationMeters).toBe(2850);
      expect(rwenzori?.ecotype).toBe('yushania-alpina-montane-belt');

      const vilcabamba = BAMBOO_THICKET_SITES.find(
        (s) => s.id === 'vilcabamba-colani-chusquea-peru'
      );
      expect(vilcabamba).toBeDefined();
      expect(vilcabamba?.name).toBe(
        'Cordillera Vilcabamba & Apurímac Chusquea scandens Knife-Edge'
      );
      expect(vilcabamba?.mountainCordillera).toBe('Eastern Andes Yungas');
      expect(vilcabamba?.country).toBe('Peru');
      expect(vilcabamba?.region).toBe('Cusco');
      expect(vilcabamba?.elevationMeters).toBe(3120);
      expect(vilcabamba?.ecotype).toBe('guadua-spiny-riparian-tangle');

      for (const site of BAMBOO_THICKET_SITES) {
        expect(site.mountainCordillera.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.culmDensityPerSqM).toBeGreaterThanOrEqual(5);
        expect(site.culmDensityPerSqM).toBeLessThanOrEqual(120);
        expect(site.canopyArchHeightM).toBeGreaterThan(0);
        expect(site.silicaTrichomeScore).toBeGreaterThanOrEqual(1);
        expect(site.silicaTrichomeScore).toBeLessThanOrEqual(10);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.threadingProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterBambooSites', () => {
    it('filters sites by country, ecotype, difficulty, and search query', () => {
      expect(filterBambooSites(BAMBOO_THICKET_SITES, {})).toHaveLength(4);

      const byCountry = filterBambooSites(BAMBOO_THICKET_SITES, {
        country: 'Japan',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('hidaka-sasa-kurilensis-hokkaido-japan');

      const byEcotype = filterBambooSites(BAMBOO_THICKET_SITES, {
        ecotype: 'yushania-alpina-montane-belt',
      });
      expect(byEcotype).toHaveLength(1);
      expect(byEcotype[0].id).toBe('rwenzori-virunga-yushania-uganda');

      const byDifficulty = filterBambooSites(BAMBOO_THICKET_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterBambooSites(BAMBOO_THICKET_SITES, {
        search: 'Kamuk',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('chirripo-talamanca-chusquea-costa-rica');
    });
  });

  describe('calculateBambooThicket', () => {
    const validBase: BambooThicketInput = {
      culmDensityPerSqM: 12,
      culmDiameterMm: 8,
      ridgeSlopeDeg: 8,
      wetnessFilmPct: 15,
      followerSpacingM: 6.0,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateBambooThicket({ ...validBase, culmDensityPerSqM: 4 })
      ).toThrow(/culmDensityPerSqM/i);
      expect(() =>
        calculateBambooThicket({ ...validBase, culmDensityPerSqM: 121 })
      ).toThrow(/culmDensityPerSqM/i);
      expect(() =>
        calculateBambooThicket({ ...validBase, culmDensityPerSqM: NaN })
      ).toThrow(/culmDensityPerSqM/i);

      expect(() =>
        calculateBambooThicket({ ...validBase, culmDiameterMm: 3 })
      ).toThrow(/culmDiameterMm/i);
      expect(() =>
        calculateBambooThicket({ ...validBase, culmDiameterMm: 81 })
      ).toThrow(/culmDiameterMm/i);

      expect(() =>
        calculateBambooThicket({ ...validBase, ridgeSlopeDeg: -1 })
      ).toThrow(/ridgeSlopeDeg/i);
      expect(() =>
        calculateBambooThicket({ ...validBase, ridgeSlopeDeg: 56 })
      ).toThrow(/ridgeSlopeDeg/i);

      expect(() =>
        calculateBambooThicket({ ...validBase, wetnessFilmPct: -1 })
      ).toThrow(/wetnessFilmPct/i);
      expect(() =>
        calculateBambooThicket({ ...validBase, wetnessFilmPct: 101 })
      ).toThrow(/wetnessFilmPct/i);

      expect(() =>
        calculateBambooThicket({ ...validBase, followerSpacingM: 0.4 })
      ).toThrow(/followerSpacingM/i);
      expect(() =>
        calculateBambooThicket({ ...validBase, followerSpacingM: 15.1 })
      ).toThrow(/followerSpacingM/i);
    });

    it('computes low risk level and follow-tapir-bear-tunnel-leads strategy under mild open bamboo conditions', () => {
      const analysis = calculateBambooThicket(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.threadingStrategy).toBe('follow-tapir-bear-tunnel-leads');
      expect(analysis.reboundWhipKineticJ).toBeGreaterThanOrEqual(0.5);
      expect(analysis.reboundWhipKineticJ).toBeLessThan(4.5);
      expect(analysis.wetCulmSlipProbabilityPct).toBeGreaterThanOrEqual(5);
      expect(analysis.wetCulmSlipProbabilityPct).toBeLessThan(35);
      expect(analysis.netAdvanceMetersPerHour).toBeGreaterThan(450);
      expect(analysis.netAdvanceMetersPerHour).toBeLessThanOrEqual(1200);
      expect(analysis.punjiStumpPunctureRiskPct).toBeGreaterThanOrEqual(0);
      expect(analysis.punjiStumpPunctureRiskPct).toBeLessThan(28);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases reboundWhipKineticJ, wetCulmSlipProbabilityPct, and punjiStumpPunctureRiskPct while decreasing netAdvanceMetersPerHour under dense, steep, wet conditions with tight spacing', () => {
      const mild = calculateBambooThicket(validBase);
      const severe = calculateBambooThicket({
        culmDensityPerSqM: 95,
        culmDiameterMm: 54,
        ridgeSlopeDeg: 44,
        wetnessFilmPct: 92,
        followerSpacingM: 1.2,
      });

      expect(severe.reboundWhipKineticJ).toBeGreaterThan(
        mild.reboundWhipKineticJ
      );
      expect(severe.wetCulmSlipProbabilityPct).toBeGreaterThan(
        mild.wetCulmSlipProbabilityPct
      );
      expect(severe.punjiStumpPunctureRiskPct).toBeGreaterThan(
        mild.punjiStumpPunctureRiskPct
      );
      expect(severe.netAdvanceMetersPerHour).toBeLessThan(
        mild.netAdvanceMetersPerHour
      );
    });

    it('computes moderate risk level and hand-over-hand-culm-belay-swim strategy when moderate thresholds are met', () => {
      const analysis = calculateBambooThicket({
        culmDensityPerSqM: 38,
        culmDiameterMm: 22,
        ridgeSlopeDeg: 20,
        wetnessFilmPct: 45,
        followerSpacingM: 4.5,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.threadingStrategy).toBe('hand-over-hand-culm-belay-swim');
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and flush-node-saw-prune-4m-spacing strategy when high thresholds are met', () => {
      const analysis = calculateBambooThicket({
        culmDensityPerSqM: 68,
        culmDiameterMm: 36,
        ridgeSlopeDeg: 32,
        wetnessFilmPct: 68,
        followerSpacingM: 2.8,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.threadingStrategy).toBe(
        'flush-node-saw-prune-4m-spacing'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-cornice-drop-spiny-impaction strategy under extreme density, whip energy, or wet culm slip', () => {
      const analysis = calculateBambooThicket({
        culmDensityPerSqM: 105,
        culmDiameterMm: 58,
        ridgeSlopeDeg: 46,
        wetnessFilmPct: 92,
        followerSpacingM: 1.0,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.threadingStrategy).toBe(
        'abort-cornice-drop-spiny-impaction'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getBambooGearChecklist', () => {
    it('returns at least 6 gear items spanning eye-face-mesh, culm-traction, lnt-pruning, and ridge-navigation', () => {
      const gear = getBambooGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('eye-face-mesh')).toBe(true);
      expect(categories.has('culm-traction')).toBe(true);
      expect(categories.has('lnt-pruning')).toBe(true);
      expect(categories.has('ridge-navigation')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
