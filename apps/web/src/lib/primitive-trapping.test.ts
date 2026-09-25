import { describe, it, expect } from 'vitest';
import {
  getTrappingMechanisms,
  getTrappingMechanismById,
  calculatePrimitiveTrapping,
  getTrappingSafetyGear,
  type TrappingCalculationQuery,
} from './primitive-trapping';

describe('primitive-trapping library', () => {
  describe('getTrappingMechanisms', () => {
    it('returns all 5 primitive trapping mechanisms when no category filter is passed', () => {
      const all = getTrappingMechanisms();
      expect(all).toHaveLength(5);
      expect(all.map((m) => m.id)).toEqual([
        'figure-4-deadfall',
        'paiute-deadfall',
        'promontory-peg-snare',
        'spring-pole-snare',
        'rolling-log-deadfall',
      ]);
    });

    it('filters mechanisms by category "deadfall"', () => {
      const deadfalls = getTrappingMechanisms('deadfall');
      expect(deadfalls).toHaveLength(3);
      expect(deadfalls.every((m) => m.category === 'deadfall')).toBe(true);
      expect(deadfalls.map((m) => m.id)).toEqual([
        'figure-4-deadfall',
        'paiute-deadfall',
        'rolling-log-deadfall',
      ]);
    });

    it('filters mechanisms by category "snare"', () => {
      const snares = getTrappingMechanisms('snare');
      expect(snares).toHaveLength(2);
      expect(snares.every((m) => m.category === 'snare')).toBe(true);
      expect(snares.map((m) => m.id)).toEqual([
        'promontory-peg-snare',
        'spring-pole-snare',
      ]);
    });
  });

  describe('getTrappingMechanismById', () => {
    it('returns the correct mechanism by id', () => {
      const mech = getTrappingMechanismById('figure-4-deadfall');
      expect(mech).toBeDefined();
      expect(mech?.title).toBe('Classic All-Wood Figure-4 Deadfall');
      expect(mech?.cordageRequired).toBe(false);
      expect(mech?.sensitivityRating).toBe('moderate');
      expect(mech?.highlights).toHaveLength(3);
    });

    it('returns undefined for non-existent mechanism id', () => {
      const mech = getTrappingMechanismById('non-existent');
      expect(mech).toBeUndefined();
    });
  });

  describe('getTrappingSafetyGear', () => {
    it('returns 6 mandatory safety and bushcraft training kit items', () => {
      const gear = getTrappingSafetyGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);
      expect(gear.map((item) => item.id)).toEqual([
        'carving-bushcraft-knife',
        'tarred-bank-line',
        'inert-training-peg-set',
        'safety-flagging-tape',
        'spring-wire-snare-gauge',
        'survival-regulations-guide',
      ]);
    });
  });

  describe('calculatePrimitiveTrapping', () => {
    it('calculates weight ratio and status correctly for default Figure-4 deadfall and snowshoe hare', () => {
      const query: TrappingCalculationQuery = {
        mechanismId: 'figure-4-deadfall',
        quarry: 'snowshoe_hare',
        deadfallWeightLbs: 15,
        notchDepthMm: 4,
        cordageType: 'tarred_bankline',
      };
      const result = calculatePrimitiveTrapping(query);

      expect(result.mechanismTitle).toBe('Classic All-Wood Figure-4 Deadfall');
      expect(result.quarryName).toBe('Snowshoe Hare');
      expect(result.quarryWeightLbs).toBe(3.5);
      expect(result.deadfallWeightLbs).toBe(15);
      // 15 / 3.5 = 4.2857... rounded to 4.3
      expect(result.weightRatio).toBe(4.3);
      // 3.0 <= ratio < 5.0 -> sufficient
      expect(result.lethalityStatus).toBe('sufficient');
      // 3.0 <= notchDepthMm <= 6.0 -> optimal_sensitivity
      expect(result.sensitivityStatus).toBe('optimal_sensitivity');
      // estimated trip force = (15 * 0.08 + 4 * 0.5) * 1.0 * 1.0 = 3.2
      expect(result.estimatedTripForceOz).toBe(3.2);
      expect(result.legalEthicsAdvisory).toContain('survival');
    });

    it('identifies humane instant dispatch when weight ratio >= 5.0', () => {
      const query: TrappingCalculationQuery = {
        mechanismId: 'figure-4-deadfall',
        quarry: 'snowshoe_hare', // 3.5 lbs
        deadfallWeightLbs: 20, // 20 / 3.5 = 5.7x >= 5.0
        notchDepthMm: 4,
        cordageType: 'tarred_bankline',
      };
      const result = calculatePrimitiveTrapping(query);
      expect(result.weightRatio).toBe(5.7);
      expect(result.lethalityStatus).toBe('humane_instant_dispatch');
    });

    it('identifies underweight cruelty risk when weight ratio < 3.0', () => {
      const query: TrappingCalculationQuery = {
        mechanismId: 'figure-4-deadfall',
        quarry: 'snowshoe_hare', // 3.5 lbs
        deadfallWeightLbs: 5, // 5 / 3.5 = 1.4x < 3.0
        notchDepthMm: 4,
        cordageType: 'tarred_bankline',
      };
      const result = calculatePrimitiveTrapping(query);
      expect(result.weightRatio).toBe(1.4);
      expect(result.lethalityStatus).toBe('underweight_cruelty_risk');
    });

    it('evaluates sensitivity status for shallow notch (<3.0 mm) as hair trigger', () => {
      const query: TrappingCalculationQuery = {
        mechanismId: 'paiute-deadfall',
        quarry: 'ground_squirrel',
        deadfallWeightLbs: 10,
        notchDepthMm: 2,
        cordageType: 'tarred_bankline',
      };
      const result = calculatePrimitiveTrapping(query);
      expect(result.sensitivityStatus).toBe('hair_trigger_premature_release');
    });

    it('evaluates sensitivity status for deep notch (>6.0 mm) as overly stiff', () => {
      const query: TrappingCalculationQuery = {
        mechanismId: 'rolling-log-deadfall',
        quarry: 'cottontail',
        deadfallWeightLbs: 25,
        notchDepthMm: 8,
        cordageType: 'tarred_bankline',
      };
      const result = calculatePrimitiveTrapping(query);
      expect(result.sensitivityStatus).toBe('overly_stiff_miss_risk');
    });

    it('factors quarry weights accurately for all quarry types', () => {
      const hare = calculatePrimitiveTrapping({
        mechanismId: 'figure-4-deadfall',
        quarry: 'snowshoe_hare',
        deadfallWeightLbs: 10,
        notchDepthMm: 4,
        cordageType: 'tarred_bankline',
      });
      expect(hare.quarryWeightLbs).toBe(3.5);

      const squirrel = calculatePrimitiveTrapping({
        mechanismId: 'figure-4-deadfall',
        quarry: 'ground_squirrel',
        deadfallWeightLbs: 10,
        notchDepthMm: 4,
        cordageType: 'tarred_bankline',
      });
      expect(squirrel.quarryWeightLbs).toBe(1.2);

      const grouse = calculatePrimitiveTrapping({
        mechanismId: 'figure-4-deadfall',
        quarry: 'grouse_ptarmigan',
        deadfallWeightLbs: 10,
        notchDepthMm: 4,
        cordageType: 'tarred_bankline',
      });
      expect(grouse.quarryWeightLbs).toBe(1.8);

      const rabbit = calculatePrimitiveTrapping({
        mechanismId: 'figure-4-deadfall',
        quarry: 'cottontail',
        deadfallWeightLbs: 10,
        notchDepthMm: 4,
        cordageType: 'tarred_bankline',
      });
      expect(rabbit.quarryWeightLbs).toBe(2.5);
    });

    it('adjusts trip force with mechanism sensitivity and cordage friction factors', () => {
      // Paiute has hair_trigger sensitivity rating (factor 0.6)
      const paiute = calculatePrimitiveTrapping({
        mechanismId: 'paiute-deadfall',
        quarry: 'ground_squirrel',
        deadfallWeightLbs: 15,
        notchDepthMm: 4,
        cordageType: 'tarred_bankline', // factor 1.0
      });
      // (15 * 0.08 + 4 * 0.5) * 1.0 * 0.6 = 3.2 * 0.6 = 1.92 -> 1.9 oz
      expect(paiute.estimatedTripForceOz).toBe(1.9);

      // Natural dogbane has higher friction (factor 1.15)
      const dogbane = calculatePrimitiveTrapping({
        mechanismId: 'figure-4-deadfall',
        quarry: 'cottontail',
        deadfallWeightLbs: 15,
        notchDepthMm: 4,
        cordageType: 'natural_dogbane',
      });
      // 3.2 * 1.15 * 1.0 = 3.68 -> 3.7 oz
      expect(dogbane.estimatedTripForceOz).toBe(3.7);

      // Paracord inner core has lower friction (factor 0.85)
      const paracord = calculatePrimitiveTrapping({
        mechanismId: 'figure-4-deadfall',
        quarry: 'cottontail',
        deadfallWeightLbs: 15,
        notchDepthMm: 4,
        cordageType: 'paracord_inner_core',
      });
      // 3.2 * 0.85 * 1.0 = 2.72 -> 2.7 oz
      expect(paracord.estimatedTripForceOz).toBe(2.7);
    });
  });
});
