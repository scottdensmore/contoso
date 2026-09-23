import { describe, it, expect } from 'vitest';
import {
  getSurvivalShelters,
  getSurvivalShelterById,
  calculateShelterThermodynamics,
  getShelterGear,
  type ShelterThermodynamicsQuery,
} from './wilderness-shelters';

describe('wilderness-shelters library', () => {
  describe('getSurvivalShelters & getSurvivalShelterById', () => {
    it('returns all 5 survival shelters when difficulty is omitted', () => {
      const shelters = getSurvivalShelters();
      expect(shelters).toHaveLength(5);
      expect(shelters.map((s) => s.id)).toEqual([
        'alpine-snow-cave-bivouac',
        'subarctic-quinzhee-snow-mound',
        'emergency-snow-trench-tarp',
        'boreal-debris-hut-lean-to',
        'tree-well-snow-bivouac',
      ]);
    });

    it('filters shelters by beginner difficulty', () => {
      const beginnerShelters = getSurvivalShelters('beginner');
      expect(beginnerShelters).toHaveLength(2);
      expect(beginnerShelters.map((s) => s.id)).toEqual([
        'emergency-snow-trench-tarp',
        'tree-well-snow-bivouac',
      ]);
    });

    it('filters shelters by intermediate difficulty', () => {
      const intermediateShelters = getSurvivalShelters('intermediate');
      expect(intermediateShelters).toHaveLength(2);
      expect(intermediateShelters.map((s) => s.id)).toEqual([
        'subarctic-quinzhee-snow-mound',
        'boreal-debris-hut-lean-to',
      ]);
    });

    it('filters shelters by advanced difficulty', () => {
      const advancedShelters = getSurvivalShelters('advanced');
      expect(advancedShelters).toHaveLength(1);
      expect(advancedShelters[0].id).toBe('alpine-snow-cave-bivouac');
    });

    it('finds shelter by id and returns undefined for unknown id', () => {
      const alpine = getSurvivalShelterById('alpine-snow-cave-bivouac');
      expect(alpine).toBeDefined();
      expect(alpine?.title).toBe('Deep Drift Alpine Snow Cave with Cold-Air Well');
      expect(alpine?.environment).toBe('alpine_snow_drift');
      expect(alpine?.minSnowDepthM).toBe(2.0);

      const unknown = getSurvivalShelterById('non-existent-shelter');
      expect(unknown).toBeUndefined();
    });
  });

  describe('getShelterGear', () => {
    it('returns 6 mandatory gear items with required categories', () => {
      const gear = getShelterGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('d-grip-avalanche-snow-shovel');
      expect(ids).toContain('folding-snow-bone-saw');
      expect(ids).toContain('thermal-bivy-survival-bag');
      expect(ids).toContain('closed-cell-foam-sleeping-pad');
      expect(ids).toContain('angled-ventilation-probe');
      expect(ids).toContain('survival-candle-lantern');
    });
  });

  describe('calculateShelterThermodynamics', () => {
    const defaultQuery: ShelterThermodynamicsQuery = {
      shelterId: 'alpine-snow-cave-bivouac',
      ambientTempF: 0,
      occupantCount: 2,
      wallThicknessCm: 30,
      ventHoleDiameterCm: 10,
      platformHeightAboveFloorCm: 35,
      candleLit: false,
    };

    it('calculates thermodynamics with default values correctly', () => {
      const result = calculateShelterThermodynamics(defaultQuery);
      expect(result.shelterTitle).toBe('Deep Drift Alpine Snow Cave with Cold-Air Well');
      expect(result.wallRValue).toBe(11.8);
      expect(result.coldTrapDifferentialF).toBe(14);
      expect(result.interiorTempF).toBe(32); // Capped at 32°F
      expect(result.floorTempF).toBe(18); // 32 - 14 = 18
      expect(result.ventilationAdequacyPercent).toBe(200); // Capped at 200%
      expect(result.structuralSafetyStatus).toBe('safe');
      expect(result.thermalAdvisory).toMatch(/STABLE MICROCLIMATE/i);
    });

    it('caps cold-air trap differential at 18°F', () => {
      const query: ShelterThermodynamicsQuery = {
        ...defaultQuery,
        platformHeightAboveFloorCm: 60,
      };
      const result = calculateShelterThermodynamics(query);
      expect(result.coldTrapDifferentialF).toBe(18);
    });

    it('accounts for candle lantern adding 4°F when interior is not capped at 32°F', () => {
      const coldQueryWithoutCandle: ShelterThermodynamicsQuery = {
        shelterId: 'emergency-snow-trench-tarp',
        ambientTempF: -30,
        occupantCount: 1,
        wallThicknessCm: 30,
        ventHoleDiameterCm: 10,
        platformHeightAboveFloorCm: 25,
        candleLit: false,
      };
      const resultWithoutCandle = calculateShelterThermodynamics(coldQueryWithoutCandle);

      const coldQueryWithCandle: ShelterThermodynamicsQuery = {
        ...coldQueryWithoutCandle,
        candleLit: true,
      };
      const resultWithCandle = calculateShelterThermodynamics(coldQueryWithCandle);

      expect(resultWithCandle.interiorTempF - resultWithoutCandle.interiorTempF).toBe(4);
    });

    it('enforces lower bound of ambientTempF + 4 on interior temperature', () => {
      const query: ShelterThermodynamicsQuery = {
        shelterId: 'tree-well-snow-bivouac',
        ambientTempF: -40,
        occupantCount: 1,
        wallThicknessCm: 20,
        ventHoleDiameterCm: 10,
        platformHeightAboveFloorCm: 0,
        candleLit: false,
      };
      const result = calculateShelterThermodynamics(query);
      expect(result.interiorTempF).toBeGreaterThanOrEqual(-36);
    });

    it('identifies critical_hazard when vent hole diameter is under 6 cm', () => {
      const query: ShelterThermodynamicsQuery = {
        ...defaultQuery,
        ventHoleDiameterCm: 5,
      };
      const result = calculateShelterThermodynamics(query);
      expect(result.structuralSafetyStatus).toBe('critical_hazard');
      expect(result.thermalAdvisory).toMatch(/CRITICAL/i);
    });

    it('identifies critical_hazard when wall thickness is under 18 cm', () => {
      const query: ShelterThermodynamicsQuery = {
        ...defaultQuery,
        wallThicknessCm: 15,
      };
      const result = calculateShelterThermodynamics(query);
      expect(result.structuralSafetyStatus).toBe('critical_hazard');
      expect(result.thermalAdvisory).toMatch(/CRITICAL/i);
    });

    it('identifies caution when vent hole diameter is between 6 and 8.9 cm', () => {
      const query: ShelterThermodynamicsQuery = {
        ...defaultQuery,
        ventHoleDiameterCm: 8,
      };
      const result = calculateShelterThermodynamics(query);
      expect(result.structuralSafetyStatus).toBe('caution');
      expect(result.thermalAdvisory).toMatch(/CAUTION/i);
    });

    it('identifies caution when platform height is under 20 cm', () => {
      const query: ShelterThermodynamicsQuery = {
        ...defaultQuery,
        platformHeightAboveFloorCm: 15,
      };
      const result = calculateShelterThermodynamics(query);
      expect(result.structuralSafetyStatus).toBe('caution');
    });

    it('identifies caution when wall thickness is between 18 and 23 cm', () => {
      const query: ShelterThermodynamicsQuery = {
        ...defaultQuery,
        wallThicknessCm: 22,
      };
      const result = calculateShelterThermodynamics(query);
      expect(result.structuralSafetyStatus).toBe('caution');
    });

    it('falls back to default shelter if shelterId is not found', () => {
      const query: ShelterThermodynamicsQuery = {
        ...defaultQuery,
        shelterId: 'invalid-id',
      };
      const result = calculateShelterThermodynamics(query);
      expect(result.shelterTitle).toBe('Deep Drift Alpine Snow Cave with Cold-Air Well');
    });
  });
});
