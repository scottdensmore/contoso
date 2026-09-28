import { describe, it, expect } from 'vitest';
import {
  getTurtlePatrolSectors,
  getTurtlePatrolSectorById,
  calculateTurtlePatrolDynamics,
  getTurtlePatrolGear,
} from './turtle-patrol';

describe('turtle-patrol library', () => {
  describe('getTurtlePatrolSectors', () => {
    it('returns all 5 iconic sea turtle conservation nesting sectors when no zone is passed', () => {
      const sectors = getTurtlePatrolSectors();
      expect(sectors).toHaveLength(5);
      const ids = sectors.map((s) => s.id);
      expect(ids).toEqual([
        'cape-hatteras-barrier-spit',
        'cumberland-island-wilderness-beach',
        'padre-island-national-seashore',
        'archie-carr-national-refuge',
        'culebra-resaca-beach-atoll',
      ]);
    });

    it('filters sectors correctly by PatrolZone', () => {
      const dunes = getTurtlePatrolSectors('barrier_island_dunes');
      expect(dunes).toHaveLength(2);
      expect(dunes.map((s) => s.id)).toEqual([
        'cape-hatteras-barrier-spit',
        'padre-island-national-seashore',
      ]);

      const refuge = getTurtlePatrolSectors('coastal_wildlife_refuge');
      expect(refuge).toHaveLength(2);
      expect(refuge.map((s) => s.id)).toEqual([
        'cumberland-island-wilderness-beach',
        'archie-carr-national-refuge',
      ]);

      const atoll = getTurtlePatrolSectors('remote_cays_atoll');
      expect(atoll).toHaveLength(1);
      expect(atoll[0].id).toBe('culebra-resaca-beach-atoll');

      const estuary = getTurtlePatrolSectors('maritime_estuary_spit');
      expect(estuary).toHaveLength(0);
    });
  });

  describe('getTurtlePatrolSectorById', () => {
    it('returns the requested sector by id with valid properties', () => {
      const sector = getTurtlePatrolSectorById('padre-island-national-seashore');
      expect(sector).toBeDefined();
      expect(sector?.title).toBe('Padre Island Malaquite Beach Patrol');
      expect(sector?.beachLengthKm).toBe(32.0);
      expect(sector?.primarySpecies).toBe('kemps_ridley');
      expect(sector?.patrolZone).toBe('barrier_island_dunes');
      expect(sector?.avgNestsPerKm).toBe(18);
      expect(sector?.highlights).toContain("Kemp's ridley daytime arribada sweeps");
    });

    it('returns undefined for nonexistent id', () => {
      const sector = getTurtlePatrolSectorById('non-existent-sector');
      expect(sector).toBeUndefined();
    });
  });

  describe('getTurtlePatrolGear', () => {
    it('returns the 6 mandatory conservation patrol kit items', () => {
      const gear = getTurtlePatrolGear();
      expect(gear).toHaveLength(6);
      gear.forEach((item) => {
        expect(item.mandatory).toBe(true);
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.category).toBeTruthy();
        expect(item.description).toBeTruthy();
      });
      const ids = gear.map((g) => g.id);
      expect(ids).toContain('red-led-headlamp-monochrome');
      expect(ids).toContain('dune-predator-exclusion-cages');
      expect(ids).toContain('night-patrol-gps-caliper-kit');
      expect(ids).toContain('soft-touch-hatchling-carrier');
      expect(ids).toContain('high-tide-bamboo-marker-poles');
      expect(ids).toContain('coastal-high-intensity-uv-filter');
    });
  });

  describe('calculateTurtlePatrolDynamics', () => {
    it('calculates dynamics for default parameters on Cape Hatteras', () => {
      const result = calculateTurtlePatrolDynamics({
        sectorId: 'cape-hatteras-barrier-spit',
        patrolLengthKm: 18,
        moonPhaseIlluminationPercent: 15,
        ambientTemperatureC: 28,
        predatorPressure: 'moderate',
      });

      // avgNestsPerKm: 14
      // Emergence count: Math.max(5, Math.round(14 * (18 / 5) * 8.5)) = Math.round(14 * 3.6 * 8.5) = 428
      expect(result.estimatedEmergenceCount).toBe(428);
      // Incubation days: Math.round(55 - (28 - 28) * 2.2) = 55
      expect(result.incubationDaysEstimate).toBe(55);
      // Predator loss risk: pressureFactor (moderate=0.20) -> Math.min(95, Math.round(20 + 15 * 0.15)) = Math.round(20 + 2.25) = 22
      expect(result.predatorLossRiskPercent).toBe(22);
      // Conservation status: moderate predator pressure with risk >= 20 -> 'elevated_predator_advisory'
      expect(result.conservationStatus).toBe('elevated_predator_advisory');
      expect(result.sectorTitle).toBe('Cape Hatteras North Spit Barrier Beach');
      expect(result.primarySpecies).toBe('loggerhead');
      expect(result.patrolZone).toBe('barrier_island_dunes');
      expect(result.patrolFrequencyRecommendation).toBeTruthy();
      expect(result.conservationAdvisory).toBeTruthy();
    });

    it('calculates critical hazard conditions when predator pressure is critical or risk >= 45', () => {
      const result = calculateTurtlePatrolDynamics({
        sectorId: 'cape-hatteras-barrier-spit',
        patrolLengthKm: 25,
        moonPhaseIlluminationPercent: 80,
        ambientTemperatureC: 32,
        predatorPressure: 'critical',
      });

      // pressureFactor critical = 0.42 -> 42 + 80 * 0.15 = 42 + 12 = 54%
      expect(result.predatorLossRiskPercent).toBe(54);
      expect(result.conservationStatus).toBe('critical_tidal_washout_hazard');
      // Incubation days at 32°C: Math.round(55 - 4 * 2.2) = Math.round(55 - 8.8) = 46
      expect(result.incubationDaysEstimate).toBe(46);
    });

    it('calculates optimal nesting conditions when predator pressure is low and risk < 20', () => {
      const result = calculateTurtlePatrolDynamics({
        sectorId: 'culebra-resaca-beach-atoll',
        patrolLengthKm: 12,
        moonPhaseIlluminationPercent: 5,
        ambientTemperatureC: 28,
        predatorPressure: 'low',
      });

      // pressureFactor low = 0.08 -> 8 + 5 * 0.15 = 8 + 0.75 = 8.75 -> 9%
      expect(result.predatorLossRiskPercent).toBe(9);
      expect(result.conservationStatus).toBe('optimal_nesting_conditions');
    });

    it('clamps incubation days between 45 and 70 days', () => {
      // Very high temperature 35°C: 55 - 7 * 2.2 = 39.6 -> clamped to 45
      const hotResult = calculateTurtlePatrolDynamics({
        sectorId: 'padre-island-national-seashore',
        patrolLengthKm: 10,
        moonPhaseIlluminationPercent: 10,
        ambientTemperatureC: 35,
        predatorPressure: 'low',
      });
      expect(hotResult.incubationDaysEstimate).toBe(45);

      // Very low temperature 20°C: 55 - (-8) * 2.2 = 72.6 -> clamped to 70
      const coldResult = calculateTurtlePatrolDynamics({
        sectorId: 'padre-island-national-seashore',
        patrolLengthKm: 10,
        moonPhaseIlluminationPercent: 10,
        ambientTemperatureC: 20,
        predatorPressure: 'low',
      });
      expect(coldResult.incubationDaysEstimate).toBe(70);
    });

    it('ensures minimum emergence count is 5', () => {
      const minResult = calculateTurtlePatrolDynamics({
        sectorId: 'culebra-resaca-beach-atoll',
        patrolLengthKm: 0.1,
        moonPhaseIlluminationPercent: 0,
        ambientTemperatureC: 28,
        predatorPressure: 'low',
      });
      expect(minResult.estimatedEmergenceCount).toBeGreaterThanOrEqual(5);
    });

    it('throws error for unknown sector id', () => {
      expect(() =>
        calculateTurtlePatrolDynamics({
          sectorId: 'unknown-id',
          patrolLengthKm: 18,
          moonPhaseIlluminationPercent: 15,
          ambientTemperatureC: 28,
          predatorPressure: 'moderate',
        })
      ).toThrow('Turtle patrol sector with ID "unknown-id" not found');
    });
  });
});
