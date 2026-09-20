import { describe, it, expect } from 'vitest';
import {
  getWildlifeSpecies,
  getWildlifeSpeciesById,
  assessEncounterSafety,
  getFoodStorageGuidelines,
  getWildlifeSafetyGear,
} from './wildlife';

describe('wildlife library', () => {
  describe('getWildlifeSpecies', () => {
    it('returns all 5 PNW & Rocky Mountain wildlife species', () => {
      const species = getWildlifeSpecies();
      expect(species).toHaveLength(5);

      const ids = species.map((s) => s.id);
      expect(ids).toEqual([
        'grizzly-bear',
        'black-bear',
        'cougar',
        'moose',
        'western-rattlesnake',
      ]);

      for (const animal of species) {
        expect(animal.commonName).toBeTruthy();
        expect(animal.scientificName).toBeTruthy();
        expect(animal.category).toBeTruthy();
        expect(animal.riskLevel).toBeTruthy();
        expect(animal.habitats.length).toBeGreaterThan(0);
        expect(animal.keyIdentificationTraits.length).toBeGreaterThan(0);
        expect(animal.encounterProtocol).toBeTruthy();
        expect(animal.safeDistanceYards).toBeGreaterThan(0);
        expect(animal.seasonalBehavior).toBeTruthy();
      }
    });

    it('filters species by category correctly', () => {
      const carnivores = getWildlifeSpecies('apex_carnivore');
      expect(carnivores.map((c) => c.id)).toEqual(['grizzly-bear', 'black-bear', 'cougar']);

      const ungulates = getWildlifeSpecies('large_ungulate');
      expect(ungulates.map((u) => u.id)).toEqual(['moose']);

      const reptiles = getWildlifeSpecies('reptile');
      expect(reptiles.map((r) => r.id)).toEqual(['western-rattlesnake']);
    });

    it('distinguishes Grizzly Bear and Black Bear morphological traits', () => {
      const grizzly = getWildlifeSpeciesById('grizzly-bear');
      expect(grizzly).toBeDefined();
      expect(grizzly?.riskLevel).toBe('extreme');
      expect(grizzly?.habitats).toEqual(['alpine_tundra', 'subalpine_meadow']);
      expect(grizzly?.safeDistanceYards).toBe(100);
      expect(grizzly?.bearSpecificTraits).toBeDefined();
      expect(grizzly?.bearSpecificTraits?.humpPresent).toBe(true);
      expect(grizzly?.bearSpecificTraits?.facialProfile).toBe('dished');
      expect(grizzly?.bearSpecificTraits?.earShape).toBe('short_rounded');
      expect(grizzly?.bearSpecificTraits?.clawLengthInches).toBeGreaterThanOrEqual(3);

      const blackBear = getWildlifeSpeciesById('black-bear');
      expect(blackBear).toBeDefined();
      expect(blackBear?.riskLevel).toBe('high');
      expect(blackBear?.habitats).toEqual(['dense_conifer', 'riparian_river']);
      expect(blackBear?.safeDistanceYards).toBe(100);
      expect(blackBear?.bearSpecificTraits).toBeDefined();
      expect(blackBear?.bearSpecificTraits?.humpPresent).toBe(false);
      expect(blackBear?.bearSpecificTraits?.facialProfile).toBe('straight');
      expect(blackBear?.bearSpecificTraits?.earShape).toBe('tall_pointed');
      expect(blackBear?.bearSpecificTraits?.clawLengthInches).toBeLessThanOrEqual(2);
    });

    it('includes Shiras Moose, Mountain Lion, and Western Rattlesnake details', () => {
      const cougar = getWildlifeSpeciesById('cougar');
      expect(cougar?.category).toBe('apex_carnivore');
      expect(cougar?.safeDistanceYards).toBe(100);
      expect(cougar?.encounterProtocol).toContain('Never run');

      const moose = getWildlifeSpeciesById('moose');
      expect(moose?.category).toBe('large_ungulate');
      expect(moose?.safeDistanceYards).toBe(25);
      expect(moose?.keyIdentificationTraits.some((t) => t.toLowerCase().includes('dewlap') || t.toLowerCase().includes('shoulder'))).toBe(true);

      const snake = getWildlifeSpeciesById('western-rattlesnake');
      expect(snake?.category).toBe('reptile');
      expect(snake?.safeDistanceYards).toBe(10);
      expect(snake?.habitats).toContain('high_desert');
    });
  });

  describe('getWildlifeSpeciesById', () => {
    it('returns undefined for an unknown species id', () => {
      expect(getWildlifeSpeciesById('unknown-beast')).toBeUndefined();
    });
  });

  describe('assessEncounterSafety', () => {
    it('evaluates critical imminent charge hazard when grizzly is close with cubs and approaching', () => {
      const assessment = assessEncounterSafety({
        speciesId: 'grizzly-bear',
        distanceYards: 25,
        hasCubsOrFood: true,
        isApproaching: true,
        hasBearSprayReady: true,
      });

      expect(assessment.dangerLevel).toBe('critical_imminent');
      expect(assessment.immediateAction).toContain('STAND YOUR GROUND');
      expect(assessment.defensiveSteps.length).toBeGreaterThanOrEqual(3);
      expect(assessment.bearSprayProtocol).toContain('30-40 ft');
      expect(assessment.foodStorageRule).toContain('IGBC');
    });

    it('evaluates elevated caution when within buffer or showing approach behavior', () => {
      const assessment = assessEncounterSafety({
        speciesId: 'black-bear',
        distanceYards: 70,
        hasCubsOrFood: false,
        isApproaching: false,
        hasBearSprayReady: false,
      });

      expect(assessment.dangerLevel).toBe('elevated_caution');
      expect(assessment.immediateAction).toBeTruthy();
    });

    it('evaluates monitor distance when safe buffer is observed with no threat triggers', () => {
      const assessment = assessEncounterSafety({
        speciesId: 'grizzly-bear',
        distanceYards: 150,
        hasCubsOrFood: false,
        isApproaching: false,
        hasBearSprayReady: true,
      });

      expect(assessment.dangerLevel).toBe('monitor_distance');
      expect(assessment.immediateAction).toContain('Maintain');
    });
  });

  describe('getFoodStorageGuidelines', () => {
    it('returns food storage guidelines for PNW national parks', () => {
      const guidelines = getFoodStorageGuidelines();
      expect(guidelines.length).toBeGreaterThanOrEqual(3);

      for (const item of guidelines) {
        expect(item.id).toBeTruthy();
        expect(item.zoneName).toBeTruthy();
        expect(typeof item.canisterRequired).toBe('boolean');
        expect(item.regulations).toBeTruthy();
        expect(item.hangSpecification).toBeTruthy();
      }

      const northCascades = guidelines.find((g) => g.id.includes('north-cascades'));
      expect(northCascades).toBeDefined();
      expect(northCascades?.canisterRequired).toBe(true);
    });
  });

  describe('getWildlifeSafetyGear', () => {
    it('returns essential deterrent and storage gear items', () => {
      const gear = getWildlifeSafetyGear();
      expect(gear.length).toBeGreaterThanOrEqual(5);

      const spray = gear.find((g) => g.id === 'bear-spray');
      expect(spray).toBeDefined();
      expect(spray?.essential).toBe(true);
      expect(spray?.category).toBe('deterrent');

      const canister = gear.find((g) => g.id === 'bear-canister');
      expect(canister).toBeDefined();
      expect(canister?.essential).toBe(true);
      expect(canister?.category).toBe('storage');
    });
  });
});
