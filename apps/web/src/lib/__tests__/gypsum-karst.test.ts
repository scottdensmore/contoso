import { describe, it, expect } from 'vitest';
import {
  GYPSUM_KARST_SITES,
  filterGypsumKarstSites,
  calculateGypsumKarst,
  getGypsumKarstGearChecklist,
  type GypsumKarstInput,
} from '../gypsum-karst';

describe('gypsum-karst domain library', () => {
  describe('GYPSUM_KARST_SITES catalog', () => {
    it('exports all 4 real-world subterranean gypsum-karst dissolution maze & evaporite breakdown-hall systems with complete metadata', () => {
      expect(GYPSUM_KARST_SITES).toHaveLength(4);

      const ids = GYPSUM_KARST_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'optimisticeskaja-ozerna-podolia-ukraine',
        'spipola-acquafredda-vena-del-gesso-italy',
        'sorbas-covadura-yesos-almeria-spain',
        'parks-ranch-chandelier-gypsum-new-mexico',
      ]);

      const podolia = GYPSUM_KARST_SITES.find(
        (s) => s.id === 'optimisticeskaja-ozerna-podolia-ukraine'
      );
      expect(podolia).toBeDefined();
      expect(podolia?.name).toBe(
        'Optimisticeskaja (Optymistychna) & Ozerna Artesian Gypsum Mega-Labyrinth'
      );
      expect(podolia?.evaporiteBasin).toBe(
        'Podolian-Bukovinian Evaporite Basin'
      );
      expect(podolia?.country).toBe('Ukraine');
      expect(podolia?.region).toBe('Ternopil Oblast');
      expect(podolia?.elevationMeters).toBe(280);
      expect(podolia?.morphology).toBe('artesian-rectilinear-joint-labyrinth');

      const spipola = GYPSUM_KARST_SITES.find(
        (s) => s.id === 'spipola-acquafredda-vena-del-gesso-italy'
      );
      expect(spipola).toBeDefined();
      expect(spipola?.name).toBe(
        'Sistema Spipola-Acquafredda & Vena del Gesso Messinian Selenite Karst'
      );
      expect(spipola?.evaporiteBasin).toBe('Parco dei Gessi Bolognesi');
      expect(spipola?.country).toBe('Italy');
      expect(spipola?.region).toBe('Emilia-Romagna');
      expect(spipola?.elevationMeters).toBe(245);
      expect(spipola?.morphology).toBe('messinian-selenite-epigenetic-gorge');

      const sorbas = GYPSUM_KARST_SITES.find(
        (s) => s.id === 'sorbas-covadura-yesos-almeria-spain'
      );
      expect(sorbas).toBeDefined();
      expect(sorbas?.name).toBe(
        'Karst en Yesos de Sorbas & Cueva de Covadura Evaporite Maze'
      );
      expect(sorbas?.evaporiteBasin).toBe(
        'Paraje Natural Karst en Yesos de Sorbas'
      );
      expect(sorbas?.country).toBe('Spain');
      expect(sorbas?.region).toBe('Almería');
      expect(sorbas?.elevationMeters).toBe(410);
      expect(sorbas?.morphology).toBe('arid-ephemeral-evaporite-sink');

      const parksRanch = GYPSUM_KARST_SITES.find(
        (s) => s.id === 'parks-ranch-chandelier-gypsum-new-mexico'
      );
      expect(parksRanch).toBeDefined();
      expect(parksRanch?.name).toBe(
        'Parks Ranch Cave & Yeso-Castile Evaporite Sink-Maze'
      );
      expect(parksRanch?.evaporiteBasin).toBe(
        'Delaware Basin / Chihuahuan Gypsum Plains'
      );
      expect(parksRanch?.country).toBe('USA');
      expect(parksRanch?.region).toBe('Eddy County, New Mexico');
      expect(parksRanch?.elevationMeters).toBe(1020);
      expect(parksRanch?.morphology).toBe('permian-anhydrite-hydration-dome');

      for (const site of GYPSUM_KARST_SITES) {
        expect(site.evaporiteBasin.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.mappedPassageKm).toBeGreaterThan(1);
        expect(site.junctionDensityPer100m).toBeGreaterThanOrEqual(2);
        expect(site.junctionDensityPer100m).toBeLessThanOrEqual(45);
        expect(site.ceilingSlabPeelIndex).toBeGreaterThanOrEqual(1);
        expect(site.ceilingSlabPeelIndex).toBeLessThanOrEqual(100);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.surveyProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterGypsumKarstSites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterGypsumKarstSites(GYPSUM_KARST_SITES, {})).toHaveLength(4);

      const byCountry = filterGypsumKarstSites(GYPSUM_KARST_SITES, {
        country: 'Ukraine',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('optimisticeskaja-ozerna-podolia-ukraine');

      const byMorphology = filterGypsumKarstSites(GYPSUM_KARST_SITES, {
        morphology: 'messinian-selenite-epigenetic-gorge',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe(
        'spipola-acquafredda-vena-del-gesso-italy'
      );

      const byDifficulty = filterGypsumKarstSites(GYPSUM_KARST_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterGypsumKarstSites(GYPSUM_KARST_SITES, {
        search: 'Sorbas',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('sorbas-covadura-yesos-almeria-spain');
    });
  });

  describe('calculateGypsumKarst', () => {
    const validBase: GypsumKarstInput = {
      junctionCountPer100m: 5,
      ceilingBedThicknessCm: 85,
      surfaceRainInflowMmHr: 2,
      anhydriteSwellingPct: 6,
      partyAcousticDecibels: 45,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateGypsumKarst({ ...validBase, junctionCountPer100m: 1 })
      ).toThrow(/junctionCountPer100m/i);
      expect(() =>
        calculateGypsumKarst({ ...validBase, junctionCountPer100m: 46 })
      ).toThrow(/junctionCountPer100m/i);
      expect(() =>
        calculateGypsumKarst({ ...validBase, junctionCountPer100m: NaN })
      ).toThrow(/junctionCountPer100m/i);

      expect(() =>
        calculateGypsumKarst({ ...validBase, ceilingBedThicknessCm: 1.5 })
      ).toThrow(/ceilingBedThicknessCm/i);
      expect(() =>
        calculateGypsumKarst({ ...validBase, ceilingBedThicknessCm: 121 })
      ).toThrow(/ceilingBedThicknessCm/i);

      expect(() =>
        calculateGypsumKarst({ ...validBase, surfaceRainInflowMmHr: -1 })
      ).toThrow(/surfaceRainInflowMmHr/i);
      expect(() =>
        calculateGypsumKarst({ ...validBase, surfaceRainInflowMmHr: 81 })
      ).toThrow(/surfaceRainInflowMmHr/i);

      expect(() =>
        calculateGypsumKarst({ ...validBase, anhydriteSwellingPct: -0.5 })
      ).toThrow(/anhydriteSwellingPct/i);
      expect(() =>
        calculateGypsumKarst({ ...validBase, anhydriteSwellingPct: 66 })
      ).toThrow(/anhydriteSwellingPct/i);

      expect(() =>
        calculateGypsumKarst({ ...validBase, partyAcousticDecibels: 34 })
      ).toThrow(/partyAcousticDecibels/i);
      expect(() =>
        calculateGypsumKarst({ ...validBase, partyAcousticDecibels: 111 })
      ).toThrow(/partyAcousticDecibels/i);
    });

    it('computes low risk level and continuous-retro-reflective-spool-survey strategy under thick ceiling beds, sparse junctions, dry weather, and quiet acoustics', () => {
      const analysis = calculateGypsumKarst(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.navigationStrategy).toBe(
        'continuous-retro-reflective-spool-survey'
      );
      expect(analysis.ceilingSlabPeelProbabilityPct).toBeGreaterThanOrEqual(2);
      expect(analysis.ceilingSlabPeelProbabilityPct).toBeLessThan(28);
      expect(analysis.mazeDisorientationEntropyScore).toBeGreaterThanOrEqual(5);
      expect(analysis.mazeDisorientationEntropyScore).toBeLessThan(35);
      expect(analysis.rapidDissolutionSiphonFloodRiskPct).toBeGreaterThanOrEqual(
        0
      );
      expect(analysis.rapidDissolutionSiphonFloodRiskPct).toBeLessThan(25);
      expect(analysis.seleniteCrystalShearHazardPct).toBeGreaterThanOrEqual(3);
      expect(analysis.seleniteCrystalShearHazardPct).toBeLessThan(32);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases ceilingSlabPeelProbabilityPct, mazeDisorientationEntropyScore, rapidDissolutionSiphonFloodRiskPct, and seleniteCrystalShearHazardPct as inputs worsen', () => {
      const mild = calculateGypsumKarst(validBase);
      const severe = calculateGypsumKarst({
        junctionCountPer100m: 38,
        ceilingBedThicknessCm: 8,
        surfaceRainInflowMmHr: 64,
        anhydriteSwellingPct: 54,
        partyAcousticDecibels: 98,
      });

      expect(severe.ceilingSlabPeelProbabilityPct).toBeGreaterThan(
        mild.ceilingSlabPeelProbabilityPct
      );
      expect(severe.mazeDisorientationEntropyScore).toBeGreaterThan(
        mild.mazeDisorientationEntropyScore
      );
      expect(severe.rapidDissolutionSiphonFloodRiskPct).toBeGreaterThan(
        mild.rapidDissolutionSiphonFloodRiskPct
      );
      expect(severe.seleniteCrystalShearHazardPct).toBeGreaterThan(
        mild.seleniteCrystalShearHazardPct
      );
    });

    it('computes moderate risk level and silent-single-file-bypass-hydration-buckles strategy when moderate thresholds are met', () => {
      const analysis = calculateGypsumKarst({
        junctionCountPer100m: 16,
        ceilingBedThicknessCm: 52,
        surfaceRainInflowMmHr: 18,
        anhydriteSwellingPct: 22,
        partyAcousticDecibels: 64,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.navigationStrategy).toBe(
        'silent-single-file-bypass-hydration-buckles'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and retreat-upper-phreatic-tier-lock-compass strategy when high thresholds are met', () => {
      const analysis = calculateGypsumKarst({
        junctionCountPer100m: 28,
        ceilingBedThicknessCm: 28,
        surfaceRainInflowMmHr: 38,
        anhydriteSwellingPct: 38,
        partyAcousticDecibels: 80,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.navigationStrategy).toBe(
        'retreat-upper-phreatic-tier-lock-compass'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-evaporite-slab-collapse-siphon-closure strategy under extreme slab delamination, maze entropy, siphon flood, or selenite shear', () => {
      const analysis = calculateGypsumKarst({
        junctionCountPer100m: 40,
        ceilingBedThicknessCm: 8,
        surfaceRainInflowMmHr: 68,
        anhydriteSwellingPct: 58,
        partyAcousticDecibels: 98,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.navigationStrategy).toBe(
        'abort-evaporite-slab-collapse-siphon-closure'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getGypsumKarstGearChecklist', () => {
    it('returns at least 6 gear items spanning labyrinth-line-survey, selenite-cut-protection, slab-acoustics-helmet, and sulfate-water-filtration', () => {
      const gear = getGypsumKarstGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('labyrinth-line-survey')).toBe(true);
      expect(categories.has('selenite-cut-protection')).toBe(true);
      expect(categories.has('slab-acoustics-helmet')).toBe(true);
      expect(categories.has('sulfate-water-filtration')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
