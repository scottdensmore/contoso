import { describe, it, expect } from 'vitest';
import {
  getFalconryGrounds,
  getFalconryGroundById,
  calculateRaptorConditioning,
  getFalconryGearChecklist,
  type FalconryQuery,
} from './falconry';

describe('falconry library', () => {
  describe('ground catalog and lookup', () => {
    it('returns all 5 iconic falconry grounds', () => {
      const grounds = getFalconryGrounds();
      expect(grounds).toHaveLength(5);
      expect(grounds.map((g) => g.id)).toEqual([
        'sagebrush-sea-wyoming',
        'snake-river-birds-of-prey',
        'san-luis-valley-alpine-plateau',
        'sonoran-desert-bajada',
        'bighorn-basin-badlands',
      ]);
    });

    it('filters grounds correctly by raptorSpecies', () => {
      const gyrfalconGrounds = getFalconryGrounds('gyrfalcon');
      expect(gyrfalconGrounds).toHaveLength(1);
      expect(gyrfalconGrounds[0].id).toBe('sagebrush-sea-wyoming');

      const peregrineGrounds = getFalconryGrounds('peregrine_falcon');
      expect(peregrineGrounds).toHaveLength(2);
      expect(peregrineGrounds.map((g) => g.id)).toEqual([
        'snake-river-birds-of-prey',
        'san-luis-valley-alpine-plateau',
      ]);

      const harrissGrounds = getFalconryGrounds('harriss_hawk');
      expect(harrissGrounds).toHaveLength(1);
      expect(harrissGrounds[0].id).toBe('sonoran-desert-bajada');

      const redTailedGrounds = getFalconryGrounds('red_tailed_hawk');
      expect(redTailedGrounds).toHaveLength(0);

      const goldenEagleGrounds = getFalconryGrounds('golden_eagle');
      expect(goldenEagleGrounds).toHaveLength(1);
      expect(goldenEagleGrounds[0].id).toBe('bighorn-basin-badlands');
    });

    it('finds a ground by id', () => {
      const snakeRiver = getFalconryGroundById('snake-river-birds-of-prey');
      expect(snakeRiver).toBeDefined();
      expect(snakeRiver?.title).toBe('Morley Nelson Snake River Birds of Prey NCA');
      expect(snakeRiver?.elevationMeters).toBe(950);
      expect(snakeRiver?.primarySpecies).toBe('peregrine_falcon');
      expect(snakeRiver?.flightStyle).toBe('high_pitch_stoop');
      expect(snakeRiver?.highlights).toHaveLength(3);
    });

    it('returns undefined for an unknown ground id', () => {
      expect(getFalconryGroundById('non-existent-ground')).toBeUndefined();
    });
  });

  describe('mandatory falconry safety and furniture checklist', () => {
    it('returns all 6 mandatory items', () => {
      const checklist = getFalconryGearChecklist();
      expect(checklist).toHaveLength(6);
      expect(checklist.every((item) => item.mandatory)).toBe(true);

      const ids = checklist.map((item) => item.id);
      expect(ids).toEqual([
        'vhf-gps-telemetry-transmitter',
        'elk-hide-falconry-gauntlet',
        'handcrafted-aylmeri-jesses',
        'dutch-blocked-raptor-hood',
        'digital-gram-field-scale',
        'feathered-leather-training-lure',
      ]);

      const categories = checklist.map((item) => item.category);
      expect(categories).toContain('telemetry');
      expect(categories).toContain('gauntlet');
      expect(categories).toContain('furniture');
      expect(categories).toContain('conditioning');
      expect(categories).toContain('recall');
    });
  });

  describe('calculateRaptorConditioning', () => {
    it('calculates default profile for Peregrine Falcon correctly', () => {
      const query: FalconryQuery = {
        groundId: 'snake-river-birds-of-prey',
        raptorSpecies: 'peregrine_falcon',
        baseMoltWeightGrams: 900,
        targetWeightGrams: 790,
        pitchAltitudeMeters: 250,
        ambientTempC: 10,
      };

      const result = calculateRaptorConditioning(query);

      expect(result.groundTitle).toBe('Morley Nelson Snake River Birds of Prey NCA');
      expect(result.raptorSpecies).toBe('peregrine_falcon');
      // Weight deviation: (790 - 900) / 900 = -12.2%
      expect(result.weightDeviationPercent).toBe(-12.2);
      // -12.2% >= -14.0% -> prime_hunting_condition
      expect(result.conditioningStatus).toBe('prime_hunting_condition');
      // Stoop speed: 142 mph
      expect(result.estimatedStoopSpeedMph).toBe(142);
      // Telemetry range: 40.5 km
      expect(result.telemetryRangeKm).toBe(40.5);
      expect(result.weightConditioningAdvisory).toContain('Optimal response motivation');
      expect(result.flightRecoveryGuidance).toBeDefined();
    });

    it('classifies conditioning status accurately across weight deviation thresholds', () => {
      // > -5.0 -> lethargic_overfed
      const overfed = calculateRaptorConditioning({
        groundId: 'snake-river-birds-of-prey',
        raptorSpecies: 'peregrine_falcon',
        baseMoltWeightGrams: 1000,
        targetWeightGrams: 960, // -4%
        pitchAltitudeMeters: 200,
        ambientTempC: 15,
      });
      expect(overfed.weightDeviationPercent).toBe(-4.0);
      expect(overfed.conditioningStatus).toBe('lethargic_overfed');
      expect(overfed.weightConditioningAdvisory).toContain('above hunting weight');

      // >= -14.0 (and <= -5.0) -> prime_hunting_condition
      const prime = calculateRaptorConditioning({
        groundId: 'snake-river-birds-of-prey',
        raptorSpecies: 'peregrine_falcon',
        baseMoltWeightGrams: 1000,
        targetWeightGrams: 900, // -10%
        pitchAltitudeMeters: 200,
        ambientTempC: 15,
      });
      expect(prime.weightDeviationPercent).toBe(-10.0);
      expect(prime.conditioningStatus).toBe('prime_hunting_condition');

      // >= -18.0 (and < -14.0) -> keen_hyper_responsive
      const keen = calculateRaptorConditioning({
        groundId: 'snake-river-birds-of-prey',
        raptorSpecies: 'peregrine_falcon',
        baseMoltWeightGrams: 1000,
        targetWeightGrams: 840, // -16%
        pitchAltitudeMeters: 200,
        ambientTempC: 15,
      });
      expect(keen.weightDeviationPercent).toBe(-16.0);
      expect(keen.conditioningStatus).toBe('keen_hyper_responsive');
      expect(keen.weightConditioningAdvisory).toContain('hyper-focused');

      // < -18.0 -> starvation_danger_lethal
      const starvation = calculateRaptorConditioning({
        groundId: 'snake-river-birds-of-prey',
        raptorSpecies: 'peregrine_falcon',
        baseMoltWeightGrams: 1000,
        targetWeightGrams: 800, // -20%
        pitchAltitudeMeters: 200,
        ambientTempC: 15,
      });
      expect(starvation.weightDeviationPercent).toBe(-20.0);
      expect(starvation.conditioningStatus).toBe('starvation_danger_lethal');
      expect(starvation.weightConditioningAdvisory).toContain('CRITICAL');
    });

    it('calculates stoop speeds for all species and respects speed caps', () => {
      // High pitch altitude of 600m
      const altitude = 600;

      // Gyrfalcon cap 190 mph
      const gyr = calculateRaptorConditioning({
        groundId: 'sagebrush-sea-wyoming',
        raptorSpecies: 'gyrfalcon',
        baseMoltWeightGrams: 1200,
        targetWeightGrams: 1050,
        pitchAltitudeMeters: altitude,
        ambientTempC: 5,
      });
      expect(gyr.estimatedStoopSpeedMph).toBeLessThanOrEqual(190);

      // Harris Hawk cap 75 mph
      const harris = calculateRaptorConditioning({
        groundId: 'sonoran-desert-bajada',
        raptorSpecies: 'harriss_hawk',
        baseMoltWeightGrams: 750,
        targetWeightGrams: 670,
        pitchAltitudeMeters: altitude,
        ambientTempC: 28,
      });
      expect(harris.estimatedStoopSpeedMph).toBe(75);

      // Red-Tailed Hawk cap 85 mph
      const redTail = calculateRaptorConditioning({
        groundId: 'san-luis-valley-alpine-plateau',
        raptorSpecies: 'red_tailed_hawk',
        baseMoltWeightGrams: 1100,
        targetWeightGrams: 950,
        pitchAltitudeMeters: altitude,
        ambientTempC: 12,
      });
      expect(redTail.estimatedStoopSpeedMph).toBe(85);

      // Golden Eagle cap 160 mph
      const eagle = calculateRaptorConditioning({
        groundId: 'bighorn-basin-badlands',
        raptorSpecies: 'golden_eagle',
        baseMoltWeightGrams: 4200,
        targetWeightGrams: 3700,
        pitchAltitudeMeters: altitude,
        ambientTempC: -5,
      });
      expect(eagle.estimatedStoopSpeedMph).toBe(160);
    });

    it('adapts flight recovery guidance based on ambient temperature extremes', () => {
      // Sub-zero
      const coldResult = calculateRaptorConditioning({
        groundId: 'bighorn-basin-badlands',
        raptorSpecies: 'golden_eagle',
        baseMoltWeightGrams: 4000,
        targetWeightGrams: 3500,
        pitchAltitudeMeters: 300,
        ambientTempC: -10,
      });
      expect(coldResult.flightRecoveryGuidance).toContain('Sub-zero');

      // High heat
      const hotResult = calculateRaptorConditioning({
        groundId: 'sonoran-desert-bajada',
        raptorSpecies: 'harriss_hawk',
        baseMoltWeightGrams: 800,
        targetWeightGrams: 700,
        pitchAltitudeMeters: 100,
        ambientTempC: 28,
      });
      expect(hotResult.flightRecoveryGuidance).toContain('heat');
    });
  });
});
