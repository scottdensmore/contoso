import { describe, it, expect } from 'vitest';
import {
  FORAGING_SPECIES,
  getForagingSpecies,
  getForagingSpeciesById,
  evaluateForagingSafety,
  getForagingEthicalGuidelines,
  getForagingGearChecklist,
} from './foraging';

describe('Foraging Library', () => {
  describe('Catalog & Lookup', () => {
    it('contains the 5 required PNW wild edible species', () => {
      expect(FORAGING_SPECIES).toHaveLength(5);

      const ids = FORAGING_SPECIES.map((s) => s.id);
      expect(ids).toContain('golden-chanterelle');
      expect(ids).toContain('morel-mushroom');
      expect(ids).toContain('huckleberry');
      expect(ids).toContain('miner-lettuce');
      expect(ids).toContain('stinging-nettle');
    });

    it('has correct data schema for each species', () => {
      for (const species of FORAGING_SPECIES) {
        expect(species.id).toBeTruthy();
        expect(species.commonName).toBeTruthy();
        expect(species.scientificName).toBeTruthy();
        expect(['mushroom', 'berry', 'green', 'root_herb']).toContain(species.category);
        expect(['choice_edible', 'edible_caution', 'medicinal', 'toxic_poisonous']).toContain(species.edibility);
        expect(species.seasons.length).toBeGreaterThan(0);
        expect(species.primaryHabitat).toBeTruthy();
        expect(species.keyIdentifiers.length).toBeGreaterThan(0);
        expect(species.toxicLookalikes.length).toBeGreaterThan(0);
        expect(species.preparationSafety).toBeTruthy();
        expect(species.harvestLimitRules).toBeTruthy();
      }
    });

    it('filters species by category', () => {
      const mushrooms = getForagingSpecies('mushroom');
      expect(mushrooms.map((s) => s.id)).toEqual(['golden-chanterelle', 'morel-mushroom']);

      const berries = getForagingSpecies('berry');
      expect(berries.map((s) => s.id)).toEqual(['huckleberry']);

      const greens = getForagingSpecies('green');
      expect(greens.map((s) => s.id)).toEqual(['miner-lettuce', 'stinging-nettle']);
    });

    it('filters species by harvest season', () => {
      const springSpecies = getForagingSpecies(undefined, 'spring');
      const springIds = springSpecies.map((s) => s.id);
      expect(springIds).toContain('morel-mushroom');
      expect(springIds).toContain('miner-lettuce');
      expect(springIds).toContain('stinging-nettle');
      expect(springIds).not.toContain('golden-chanterelle');

      const fallSpecies = getForagingSpecies(undefined, 'fall');
      const fallIds = fallSpecies.map((s) => s.id);
      expect(fallIds).toContain('golden-chanterelle');
      expect(fallIds).toContain('huckleberry');
      expect(fallIds).not.toContain('morel-mushroom');
    });

    it('filters species by both category and season', () => {
      const fallMushrooms = getForagingSpecies('mushroom', 'fall');
      expect(fallMushrooms.map((s) => s.id)).toEqual(['golden-chanterelle']);

      const springGreens = getForagingSpecies('green', 'spring');
      expect(springGreens.map((s) => s.id)).toEqual(['miner-lettuce', 'stinging-nettle']);
    });

    it('retrieves species by id and returns undefined for non-existent id', () => {
      const chanterelle = getForagingSpeciesById('golden-chanterelle');
      expect(chanterelle).toBeDefined();
      expect(chanterelle?.scientificName).toBe('Cantharellus formosus');

      const nonExistent = getForagingSpeciesById('death-cap');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('evaluateForagingSafety', () => {
    it('evaluates mushroom with false gills and hollow stem as safe candidate', () => {
      const result = evaluateForagingSafety({
        category: 'mushroom',
        season: 'fall',
        hasFalseGills: true,
        isHollowStem: true,
      });

      expect(result.warningLevel).toBe('safe');
      expect(result.candidateMatch).toContain('Chanterelle');
      expect(result.recommendation).toBeTruthy();
      expect(result.safetyChecks.length).toBeGreaterThan(0);
      expect(result.permitNotice).toContain('Forest Service');
    });

    it('flags danger when mushroom has true gills (hasFalseGills is false)', () => {
      const result = evaluateForagingSafety({
        category: 'mushroom',
        season: 'fall',
        hasFalseGills: false,
      });

      expect(result.warningLevel).toBe('danger_do_not_consume');
      expect(result.candidateMatch).toMatch(/Jack O'Lantern|False Chanterelle|Toxic/i);
      expect(result.recommendation).toMatch(/do not consume/i);
    });

    it('evaluates spring mushroom with hollow stem as safe morel candidate', () => {
      const result = evaluateForagingSafety({
        category: 'mushroom',
        season: 'spring',
        isHollowStem: true,
      });

      expect(result.warningLevel).toBe('safe');
      expect(result.candidateMatch).toContain('Morel');
      expect(result.safetyChecks).toEqual(
        expect.arrayContaining([expect.stringMatching(/hollow/i)])
      );
    });

    it('flags danger when spring mushroom has solid or cottony stem (isHollowStem is false)', () => {
      const result = evaluateForagingSafety({
        category: 'mushroom',
        season: 'spring',
        isHollowStem: false,
      });

      expect(result.warningLevel).toBe('danger_do_not_consume');
      expect(result.candidateMatch).toMatch(/False Morel|Gyromitra/i);
      expect(result.recommendation).toMatch(/gyromitrin|do not consume/i);
    });

    it('flags caution when specimen has milky or colored sap', () => {
      const result = evaluateForagingSafety({
        category: 'mushroom',
        season: 'late_summer',
        hasMilkySap: true,
      });

      expect(result.warningLevel).toBe('caution');
      expect(result.recommendation).toMatch(/latex|milky|caution/i);
    });

    it('evaluates berry category in late summer', () => {
      const result = evaluateForagingSafety({
        category: 'berry',
        season: 'late_summer',
      });

      expect(result.warningLevel).toBe('safe');
      expect(result.candidateMatch).toContain('Huckleberry');
    });

    it('evaluates green category in spring', () => {
      const result = evaluateForagingSafety({
        category: 'green',
        season: 'spring',
      });

      expect(result.warningLevel).toBe('safe');
      expect(result.candidateMatch).toMatch(/Miner's Lettuce|Stinging Nettle/);
    });
  });

  describe('Guidelines & Gear Checklist', () => {
    it('returns ethical guidelines including the 1/3 rule and spore dispersal', () => {
      const guidelines = getForagingEthicalGuidelines();
      expect(guidelines.length).toBeGreaterThanOrEqual(4);

      const titles = guidelines.map((g) => g.title);
      expect(titles.some((t) => t.includes('1/3') || t.includes('Thirds'))).toBe(true);
      expect(titles.some((t) => t.toLowerCase().includes('spore'))).toBe(true);
      expect(titles.some((t) => t.toLowerCase().includes('certainty') || t.toLowerCase().includes('100%'))).toBe(true);
      expect(titles.some((t) => t.toLowerCase().includes('cut') || t.toLowerCase().includes('disturbance'))).toBe(true);
    });

    it('returns gear checklist with required tools and notes', () => {
      const checklist = getForagingGearChecklist();
      expect(checklist.length).toBeGreaterThanOrEqual(5);

      const names = checklist.map((item) => item.name.toLowerCase());
      expect(names.some((n) => n.includes('basket') || n.includes('mesh'))).toBe(true);
      expect(names.some((n) => n.includes('knife'))).toBe(true);
      expect(names.some((n) => n.includes('loupe') || n.includes('magnifier'))).toBe(true);
      expect(names.some((n) => n.includes('gloves'))).toBe(true);
      expect(names.some((n) => n.includes('guide') || n.includes('handbook'))).toBe(true);

      for (const item of checklist) {
        expect(item.id).toBeTruthy();
        expect(typeof item.required).toBe('boolean');
        expect(item.notes).toBeTruthy();
      }
    });
  });
});
