import { describe, it, expect } from 'vitest';
import {
  getBushcraftProjects,
  getBushcraftProjectById,
  calculateShelterThermal,
  getBushcraftGear,
  type ShelterThermalQuery,
} from './bushcraft';

describe('Bushcraft Library Data & Calculations', () => {
  describe('getBushcraftProjects & getBushcraftProjectById', () => {
    it('returns all 5 iconic bushcraft projects when no filter is provided', () => {
      const projects = getBushcraftProjects();
      expect(projects).toHaveLength(5);
      const ids = projects.map((p) => p.id);
      expect(ids).toContain('boreal-debris-hut-shelter');
      expect(ids).toContain('cedar-bow-drill-ember');
      expect(ids).toContain('basswood-bast-fiber-cordage');
      expect(ids).toContain('mors-kochanski-super-shelter');
      expect(ids).toContain('birch-bark-water-boiling-vessel');
    });

    it('filters projects by bushcraft discipline', () => {
      const shelterProjects = getBushcraftProjects('shelter_craft');
      expect(shelterProjects).toHaveLength(2);
      expect(shelterProjects.every((p) => p.discipline === 'shelter_craft')).toBe(true);

      const frictionFireProjects = getBushcraftProjects('friction_fire');
      expect(frictionFireProjects).toHaveLength(1);
      expect(frictionFireProjects[0].id).toBe('cedar-bow-drill-ember');

      const cordageProjects = getBushcraftProjects('cordage_botany');
      expect(cordageProjects).toHaveLength(1);
      expect(cordageProjects[0].id).toBe('basswood-bast-fiber-cordage');

      const waterCraftProjects = getBushcraftProjects('water_foraging_craft');
      expect(waterCraftProjects).toHaveLength(1);
      expect(waterCraftProjects[0].id).toBe('birch-bark-water-boiling-vessel');

      const carvingProjects = getBushcraftProjects('woodcraft_carving');
      expect(carvingProjects).toHaveLength(0);
    });

    it('retrieves specific project by ID', () => {
      const hut = getBushcraftProjectById('boreal-debris-hut-shelter');
      expect(hut).toBeDefined();
      expect(hut?.title).toBe('Boreal Forest Debris Hut & Insulated Raised Bed');
      expect(hut?.region).toBe('Northwoods Boreal Forest, Ely, MN');
      expect(hut?.difficulty).toBe('intermediate_bushcraft');
      expect(hut?.thermalRatingRValue).toBe(8.0);
      expect(hut?.estimatedHours).toBe(4.5);
      expect(hut?.materialsRequired).toContain('Deadfall ridgepole');
      expect(hut?.toolRequired).toContain('Full-tang carbon steel bushcraft knife & folding saw');
      expect(hut?.highlights).toContain('3-foot thick insulating leaf layer');

      const nonExistent = getBushcraftProjectById('non-existent-craft');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('getBushcraftGear', () => {
    it('returns the mandatory 6-item bushcraft kit checklist', () => {
      const gear = getBushcraftGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory === true)).toBe(true);

      const knife = gear.find((g) => g.id === 'carbon-steel-bushcraft-knife');
      expect(knife).toBeDefined();
      expect(knife?.category).toBe('cutting');

      const saw = gear.find((g) => g.id === 'bushcraft-folding-saw');
      expect(saw).toBeDefined();
      expect(saw?.category).toBe('cutting');

      const ferroRod = gear.find((g) => g.id === 'ferrocerium-spark-rod');
      expect(ferroRod).toBeDefined();
      expect(ferroRod?.category).toBe('fire');

      const canteen = gear.find((g) => g.id === 'single-wall-stainless-canteen-cup');
      expect(canteen).toBeDefined();
      expect(canteen?.category).toBe('cooking');

      const bankline = gear.find((g) => g.id === 'tarred-marline-bankline');
      expect(bankline).toBeDefined();
      expect(bankline?.category).toBe('cordage');

      const blanket = gear.find((g) => g.id === 'heavy-canvas-wool-blanket');
      expect(blanket).toBeDefined();
      expect(blanket?.category).toBe('shelter');
    });
  });

  describe('calculateShelterThermal', () => {
    const baseQuery: ShelterThermalQuery = {
      projectId: 'boreal-debris-hut-shelter',
      ambientTemperatureF: 30,
      windSpeedMph: 15,
      debrisThicknessInches: 18,
      beddingElevationInches: 6,
      fireReflectorWall: false,
    };

    it('calculates baseline thermal properties for default parameters', () => {
      const result = calculateShelterThermal(baseQuery);
      expect(result.projectTitle).toBe('Boreal Forest Debris Hut & Insulated Raised Bed');
      expect(result.discipline).toBe('shelter_craft');
      expect(result.effectiveRValue).toBe(28.3);
      expect(result.estimatedInteriorTempF).toBe(50);
      expect(result.safetyStatus).toBe('adequate_survival_warmth');
      expect(result.groundConductiveLossWarning).toBe(false);
      expect(result.thermalAdvisory).toContain('Shelter envelope provides sufficient thermal retention');
      expect(result.fieldcraftTips.length).toBeGreaterThan(0);
    });

    it('scales R-value with debris thickness', () => {
      const thinDebris = calculateShelterThermal({
        ...baseQuery,
        debrisThicknessInches: 4,
      });

      const thickDebris = calculateShelterThermal({
        ...baseQuery,
        debrisThicknessInches: 36,
      });

      expect(thickDebris.effectiveRValue).toBeGreaterThan(thinDebris.effectiveRValue);
      expect(thickDebris.estimatedInteriorTempF).toBeGreaterThan(thinDebris.estimatedInteriorTempF);
    });

    it('flags ground conductive loss warning and applies penalty when bedding is below 4 inches', () => {
      const lowBedding = calculateShelterThermal({
        ...baseQuery,
        beddingElevationInches: 2,
      });

      const adequateBedding = calculateShelterThermal({
        ...baseQuery,
        beddingElevationInches: 4,
      });

      expect(lowBedding.groundConductiveLossWarning).toBe(true);
      expect(adequateBedding.groundConductiveLossWarning).toBe(false);
      expect(lowBedding.effectiveRValue).toBeLessThan(adequateBedding.effectiveRValue);
      expect(lowBedding.estimatedInteriorTempF).toBeLessThan(adequateBedding.estimatedInteriorTempF);
    });

    it('applies wind reduction penalty to effective R-value and interior temperature', () => {
      const calmWind = calculateShelterThermal({
        ...baseQuery,
        windSpeedMph: 0,
      });

      const highWind = calculateShelterThermal({
        ...baseQuery,
        windSpeedMph: 40,
      });

      expect(calmWind.effectiveRValue).toBeGreaterThan(highWind.effectiveRValue);
      expect(calmWind.estimatedInteriorTempF).toBeGreaterThan(highWind.estimatedInteriorTempF);
    });

    it('applies thermal boost when fire reflector wall is enabled', () => {
      const withoutReflector = calculateShelterThermal({
        ...baseQuery,
        fireReflectorWall: false,
      });

      const withReflector = calculateShelterThermal({
        ...baseQuery,
        fireReflectorWall: true,
      });

      expect(withReflector.effectiveRValue).toBeGreaterThan(withoutReflector.effectiveRValue);
      expect(withReflector.estimatedInteriorTempF).toBeGreaterThan(withoutReflector.estimatedInteriorTempF);
    });

    it('correctly categorizes status thresholds: adequate, caution, hazardous', () => {
      // Adequate warmth: mild ambient, good insulation
      const adequate = calculateShelterThermal({
        ...baseQuery,
        ambientTemperatureF: 40,
        debrisThicknessInches: 24,
        beddingElevationInches: 8,
      });
      expect(adequate.safetyStatus).toBe('adequate_survival_warmth');

      // Caution: chilly ambient, moderate insulation
      const caution = calculateShelterThermal({
        ...baseQuery,
        ambientTemperatureF: 20,
        debrisThicknessInches: 12,
        beddingElevationInches: 4,
      });
      expect(caution.safetyStatus).toBe('caution_hypothermia_risk');

      // Hazardous: sub-freezing ambient, depleted debris, 0in bedding (conduction drain)
      const hazardous = calculateShelterThermal({
        ...baseQuery,
        ambientTemperatureF: 10,
        debrisThicknessInches: 3,
        beddingElevationInches: 0,
        windSpeedMph: 35,
      });
      expect(hazardous.safetyStatus).toBe('hazardous_sub_freezing');
      expect(hazardous.groundConductiveLossWarning).toBe(true);
      expect(hazardous.thermalAdvisory).toContain('sub-freezing');
    });

    it('handles fallback gracefully when project is unknown', () => {
      const unknownResult = calculateShelterThermal({
        ...baseQuery,
        projectId: 'unknown-id',
      });
      expect(unknownResult.projectTitle).toBe('Custom Fieldcraft Shelter');
      expect(unknownResult.discipline).toBe('shelter_craft');
      expect(unknownResult.effectiveRValue).toBeGreaterThan(0);
    });
  });
});
