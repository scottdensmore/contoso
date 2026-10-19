import { describe, it, expect } from 'vitest';
import {
  KRUMMHOLZ_SITES,
  filterKrummholzSites,
  calculateKrummholzBushwhack,
  getKrummholzGearChecklist,
  type KrummholzBushwhackInput,
} from '../krummholz-bushwhack';

describe('krummholz-bushwhack domain library', () => {
  describe('KRUMMHOLZ_SITES catalog', () => {
    it('exports all 4 real-world subalpine krummholz zones with complete metadata', () => {
      expect(KRUMMHOLZ_SITES).toHaveLength(4);

      const ids = KRUMMHOLZ_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'presidential-krummholz-whitemtns-usa',
        'karwendel-latschenkiefer-tyrol-austria',
        'garibaldi-slide-alder-subalpine-canada',
        'tateyama-hai-matsu-alps-japan',
      ]);

      const presidential = KRUMMHOLZ_SITES.find(
        (s) => s.id === 'presidential-krummholz-whitemtns-usa'
      );
      expect(presidential).toBeDefined();
      expect(presidential?.name).toBe(
        'Presidential Range Abies balsamea Krummholz Wave Zone'
      );
      expect(presidential?.country).toBe('United States');
      expect(presidential?.elevationMeters).toBe(1490);
      expect(presidential?.ecotype).toBe('balsam-fir-spruce-mat');

      const karwendel = KRUMMHOLZ_SITES.find(
        (s) => s.id === 'karwendel-latschenkiefer-tyrol-austria'
      );
      expect(karwendel).toBeDefined();
      expect(karwendel?.name).toBe(
        'Karwendel Pinus mugo (Latschenkiefer) Limestone Bench Labyrinth'
      );
      expect(karwendel?.country).toBe('Austria');
      expect(karwendel?.elevationMeters).toBe(1820);
      expect(karwendel?.ecotype).toBe('mountain-pine-latschen-labyrinth');

      const garibaldi = KRUMMHOLZ_SITES.find(
        (s) => s.id === 'garibaldi-slide-alder-subalpine-canada'
      );
      expect(garibaldi).toBeDefined();
      expect(garibaldi?.name).toBe(
        'Garibaldi & Coast Range Sitka Alder / Subalpine Fir Mat'
      );
      expect(garibaldi?.country).toBe('Canada');
      expect(garibaldi?.elevationMeters).toBe(1610);
      expect(garibaldi?.ecotype).toBe('subalpine-larch-alder-thicket');

      const tateyama = KRUMMHOLZ_SITES.find(
        (s) => s.id === 'tateyama-hai-matsu-alps-japan'
      );
      expect(tateyama).toBeDefined();
      expect(tateyama?.name).toBe(
        'Tateyama Kurobe Pinus pumila (Hai-Matsu) Wind-Swept Crest'
      );
      expect(tateyama?.country).toBe('Japan');
      expect(tateyama?.elevationMeters).toBe(2450);
      expect(tateyama?.ecotype).toBe('wind-flagged-whitebark-cushion');

      for (const site of KRUMMHOLZ_SITES) {
        expect(site.mountainRange.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.stemsPerSqMeter).toBeGreaterThanOrEqual(1);
        expect(site.canopyMatHeightM).toBeGreaterThanOrEqual(0.3);
        expect(site.snowMoatDepthCm).toBeGreaterThanOrEqual(0);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.transitProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterKrummholzSites', () => {
    it('filters sites by country, ecotype, difficulty, and search query', () => {
      expect(filterKrummholzSites(KRUMMHOLZ_SITES, {})).toHaveLength(4);

      const byCountry = filterKrummholzSites(KRUMMHOLZ_SITES, {
        country: 'Austria',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('karwendel-latschenkiefer-tyrol-austria');

      const byEcotype = filterKrummholzSites(KRUMMHOLZ_SITES, {
        ecotype: 'wind-flagged-whitebark-cushion',
      });
      expect(byEcotype).toHaveLength(1);
      expect(byEcotype[0].id).toBe('tateyama-hai-matsu-alps-japan');

      const byDifficulty = filterKrummholzSites(KRUMMHOLZ_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterKrummholzSites(KRUMMHOLZ_SITES, {
        search: 'Presidential',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('presidential-krummholz-whitemtns-usa');
    });
  });

  describe('calculateKrummholzBushwhack', () => {
    const validBase: KrummholzBushwhackInput = {
      stemsPerSqMeter: 4,
      canopyMatHeightM: 0.5,
      snowMoatDepthCm: 5,
      slopeAngleDeg: 8,
      packWidthCm: 32,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateKrummholzBushwhack({ ...validBase, stemsPerSqMeter: 0.5 })
      ).toThrow(/stemsPerSqMeter/i);
      expect(() =>
        calculateKrummholzBushwhack({ ...validBase, stemsPerSqMeter: 46 })
      ).toThrow(/stemsPerSqMeter/i);
      expect(() =>
        calculateKrummholzBushwhack({ ...validBase, stemsPerSqMeter: NaN })
      ).toThrow(/stemsPerSqMeter/i);

      expect(() =>
        calculateKrummholzBushwhack({ ...validBase, canopyMatHeightM: 0.2 })
      ).toThrow(/canopyMatHeightM/i);
      expect(() =>
        calculateKrummholzBushwhack({ ...validBase, canopyMatHeightM: 3.6 })
      ).toThrow(/canopyMatHeightM/i);

      expect(() =>
        calculateKrummholzBushwhack({ ...validBase, snowMoatDepthCm: -1 })
      ).toThrow(/snowMoatDepthCm/i);
      expect(() =>
        calculateKrummholzBushwhack({ ...validBase, snowMoatDepthCm: 251 })
      ).toThrow(/snowMoatDepthCm/i);

      expect(() =>
        calculateKrummholzBushwhack({ ...validBase, slopeAngleDeg: -1 })
      ).toThrow(/slopeAngleDeg/i);
      expect(() =>
        calculateKrummholzBushwhack({ ...validBase, slopeAngleDeg: 51 })
      ).toThrow(/slopeAngleDeg/i);

      expect(() =>
        calculateKrummholzBushwhack({ ...validBase, packWidthCm: 24 })
      ).toThrow(/packWidthCm/i);
      expect(() =>
        calculateKrummholzBushwhack({ ...validBase, packWidthCm: 86 })
      ).toThrow(/packWidthCm/i);
    });

    it('computes low risk level and follow-frost-heave-rock-leads strategy under open low-cushion conditions', () => {
      const analysis = calculateKrummholzBushwhack(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.transitStrategy).toBe('follow-frost-heave-rock-leads');
      expect(analysis.effectiveVelocityKmH).toBeGreaterThan(1.2);
      expect(analysis.treeWellSpruceTrapRiskPct).toBeLessThan(25);
      expect(analysis.branchSnagResistanceIndex).toBeLessThan(3.8);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('decreases effectiveVelocityKmH and increases treeWellSpruceTrapRiskPct, metabolicKcalPerHour, and branchSnagResistanceIndex under denser, deeper conditions', () => {
      const openMat = calculateKrummholzBushwhack({
        stemsPerSqMeter: 5,
        canopyMatHeightM: 0.6,
        snowMoatDepthCm: 10,
        slopeAngleDeg: 10,
        packWidthCm: 35,
      });
      const denseThicket = calculateKrummholzBushwhack({
        stemsPerSqMeter: 32,
        canopyMatHeightM: 1.8,
        snowMoatDepthCm: 160,
        slopeAngleDeg: 32,
        packWidthCm: 68,
      });

      expect(denseThicket.effectiveVelocityKmH).toBeLessThan(
        openMat.effectiveVelocityKmH
      );
      expect(denseThicket.treeWellSpruceTrapRiskPct).toBeGreaterThan(
        openMat.treeWellSpruceTrapRiskPct
      );
      expect(denseThicket.metabolicKcalPerHour).toBeGreaterThan(
        openMat.metabolicKcalPerHour
      );
      expect(denseThicket.branchSnagResistanceIndex).toBeGreaterThan(
        openMat.branchSnagResistanceIndex
      );
    });

    it('computes moderate risk level and streamline-pack-eye-shield-crawl strategy when moderate thresholds are met', () => {
      const analysis = calculateKrummholzBushwhack({
        stemsPerSqMeter: 16,
        canopyMatHeightM: 1.4,
        snowMoatDepthCm: 85,
        slopeAngleDeg: 18,
        packWidthCm: 48,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.transitStrategy).toBe('streamline-pack-eye-shield-crawl');
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and snowshoe-float-probe-spruce-moats strategy when high thresholds are met', () => {
      const analysis = calculateKrummholzBushwhack({
        stemsPerSqMeter: 25,
        canopyMatHeightM: 1.8,
        snowMoatDepthCm: 160,
        slopeAngleDeg: 26,
        packWidthCm: 58,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.transitStrategy).toBe(
        'snowshoe-float-probe-spruce-moats'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-reroute-to-scree-drainage strategy under extreme spruce-trap and thicket density', () => {
      const analysis = calculateKrummholzBushwhack({
        stemsPerSqMeter: 38,
        canopyMatHeightM: 2.0,
        snowMoatDepthCm: 210,
        slopeAngleDeg: 36,
        packWidthCm: 74,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.transitStrategy).toBe('abort-reroute-to-scree-drainage');
      expect(analysis.treeWellSpruceTrapRiskPct).toBeGreaterThanOrEqual(75);
      expect(analysis.effectiveVelocityKmH).toBeLessThanOrEqual(0.35);
      expect(analysis.branchSnagResistanceIndex).toBeGreaterThanOrEqual(8.2);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getKrummholzGearChecklist', () => {
    it('returns at least 6 gear items spanning eye-face-armor, pack-streamlining, snow-moat-extraction, and navigation', () => {
      const gear = getKrummholzGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('eye-face-armor')).toBe(true);
      expect(categories.has('pack-streamlining')).toBe(true);
      expect(categories.has('snow-moat-extraction')).toBe(true);
      expect(categories.has('navigation')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
