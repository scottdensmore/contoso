import { describe, it, expect } from 'vitest';
import {
  getRaftingExpeditions,
  getRaftingExpeditionById,
  calculateRaftDynamics,
  getRaftingGear,
  type RaftCalculationQuery,
} from './river-rafting';

describe('river-rafting library', () => {
  describe('expeditions catalog and lookup', () => {
    it('returns all 5 iconic multi-day river expeditions', () => {
      const expeditions = getRaftingExpeditions();
      expect(expeditions).toHaveLength(5);
      expect(expeditions.map((e) => e.id)).toEqual([
        'colorado-river-grand-canyon',
        'middle-fork-salmon-river',
        'rogue-river-wilderness',
        'selway-river-wilderness',
        'green-river-gates-of-lodore',
      ]);
    });

    it('filters expeditions correctly by difficulty', () => {
      const class3 = getRaftingExpeditions('Class_III_Moderate');
      expect(class3).toHaveLength(0);

      const class4 = getRaftingExpeditions('Class_IV_Advanced');
      expect(class4).toHaveLength(3);
      expect(class4.map((e) => e.id)).toEqual([
        'middle-fork-salmon-river',
        'rogue-river-wilderness',
        'green-river-gates-of-lodore',
      ]);

      const class5 = getRaftingExpeditions('Class_V_Expert');
      expect(class5).toHaveLength(2);
      expect(class5.map((e) => e.id)).toEqual([
        'colorado-river-grand-canyon',
        'selway-river-wilderness',
      ]);
    });

    it('finds an expedition by id', () => {
      const gc = getRaftingExpeditionById('colorado-river-grand-canyon');
      expect(gc).toBeDefined();
      expect(gc?.name).toBe('Colorado River — Grand Canyon Expedition');
      expect(gc?.river).toBe('Colorado River');
      expect(gc?.location).toBe("Lee's Ferry to Diamond Creek, AZ");
      expect(gc?.difficulty).toBe('Class_V_Expert');
      expect(gc?.mileageMiles).toBe(226);
      expect(gc?.typicalDays).toBe(18);
      expect(gc?.recommendedRaftSizeFeet).toBe(18);
      expect(gc?.permitSeason).toBe('Weighted lottery (Feb-Apr, Oct-Nov)');
      expect(gc?.highlights).toHaveLength(3);
      expect(gc?.highlights).toContain('Lava Falls ledge hole punch');
    });

    it('returns undefined for an unknown expedition id', () => {
      expect(getRaftingExpeditionById('non-existent-river')).toBeUndefined();
    });
  });

  describe('mandatory multi-day rafting & groover safety checklist', () => {
    it('returns all 6 mandatory safety and groover gear items', () => {
      const gear = getRaftingGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((g) => g.mandatory)).toBe(true);

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('frame');
      expect(categories).toContain('oars');
      expect(categories).toContain('containment');
      expect(categories).toContain('rigging');
      expect(categories).toContain('safety_pfd');
      expect(categories).toContain('waste_fire');

      const ids = gear.map((g) => g.id);
      expect(ids).toEqual([
        'modular-aluminum-oar-frame',
        'counterbalanced-composite-oars',
        'gasketed-aluminum-drybox',
        'heavy-duty-drop-bag-cargo-net',
        'high-flotation-type-v-pfd',
        'firepan-clean-waste-groover',
      ]);
    });
  });

  describe('calculateRaftDynamics', () => {
    it('calculates leverage ratio, displacement, momentum, and punch clean for Grand Canyon expedition rig', () => {
      const query: RaftCalculationQuery = {
        expeditionId: 'colorado-river-grand-canyon',
        raftLengthFeet: 18,
        riggedPayloadKg: 650,
        oarLengthFeet: 10.0,
        inboardLeverageInches: 34,
        entrySpeedKnots: 6,
      };

      const result = calculateRaftDynamics(query);

      // Outboard = (10 * 12) - 34 = 86 inches
      // Leverage ratio = 86 / 34 = 2.53
      expect(result.expeditionName).toBe('Colorado River — Grand Canyon Expedition');
      expect(result.leverageRatio).toBe(2.53);

      // Base hull = 18 * 8 = 144 kg
      // Total weight = 650 + 144 = 794 kg
      // Displacement = Math.round(794 * 1.05) = 834 L
      expect(result.totalDisplacementLiters).toBe(834);

      // Velocity = 6 * 0.514444 = 3.086664 m/s
      // Momentum = Math.round(794 * 3.086664) = 2451 Ns
      expect(result.holePunchMomentumNs).toBe(2451);
      expect(result.punchFeasibility).toBe('punch_clean');

      // backFerryEfficiencyScore: Math.max(10, Math.min(100, Math.round(100 - Math.abs(2.53 - 2.15) * 45 - (650 / 800) * 15)))
      // = 100 - (0.38 * 45) - (0.8125 * 15) = 100 - 17.1 - 12.1875 = 70.7125 -> 71
      expect(result.backFerryEfficiencyScore).toBe(71);

      // Since leverageRatio > 2.45, warning should be present
      expect(result.stabilityWarning).toContain('Oar leverage ratio too stiff!');
      expect(result.oarRigRecommendation).toBeDefined();
    });

    it('calculates caution_stall_risk for moderate momentum setup', () => {
      const query: RaftCalculationQuery = {
        expeditionId: 'middle-fork-salmon-river',
        raftLengthFeet: 16,
        riggedPayloadKg: 420,
        oarLengthFeet: 9.5,
        inboardLeverageInches: 32,
        entrySpeedKnots: 5,
      };

      const result = calculateRaftDynamics(query);

      // Outboard = (9.5 * 12) - 32 = 82 inches
      // Leverage = 82 / 32 = 2.56
      // Base hull = 16 * 8 = 128 kg
      // Total weight = 420 + 128 = 548 kg
      // Velocity = 5 * 0.514444 = 2.57222 m/s
      // Momentum = Math.round(548 * 2.57222) = 1410 Ns (>= 1400 and < 2200)
      expect(result.holePunchMomentumNs).toBe(1410);
      expect(result.punchFeasibility).toBe('caution_stall_risk');
    });

    it('calculates flip_hazard_danger and emits stall warning for low momentum setup', () => {
      const query: RaftCalculationQuery = {
        expeditionId: 'rogue-river-wilderness',
        raftLengthFeet: 13,
        riggedPayloadKg: 150,
        oarLengthFeet: 9.0,
        inboardLeverageInches: 34,
        entrySpeedKnots: 3,
      };

      const result = calculateRaftDynamics(query);

      // Base hull = 13 * 8 = 104 kg
      // Total weight = 150 + 104 = 254 kg
      // Velocity = 3 * 0.514444 = 1.543332 m/s
      // Momentum = Math.round(254 * 1.543332) = 392 Ns (< 1400)
      expect(result.punchFeasibility).toBe('flip_hazard_danger');
      expect(result.stabilityWarning).toContain('Critical stall danger!');
    });

    it('emits severe overloading warning when rigged payload exceeds 600kg on raft under 15ft', () => {
      const query: RaftCalculationQuery = {
        expeditionId: 'selway-river-wilderness',
        raftLengthFeet: 14,
        riggedPayloadKg: 650,
        oarLengthFeet: 9.5,
        inboardLeverageInches: 30,
        entrySpeedKnots: 6,
      };

      const result = calculateRaftDynamics(query);
      expect(result.stabilityWarning).toContain('Severe overloading!');
    });

    it('calculates optimal back ferry efficiency score with near 2.15 leverage ratio', () => {
      const query: RaftCalculationQuery = {
        expeditionId: 'green-river-gates-of-lodore',
        raftLengthFeet: 16,
        riggedPayloadKg: 400,
        oarLengthFeet: 9.0,
        inboardLeverageInches: 34.3, // Outboard: 108 - 34.3 = 73.7, 73.7 / 34.3 = 2.1487 -> 2.15
        entrySpeedKnots: 7,
      };

      const result = calculateRaftDynamics(query);
      expect(result.leverageRatio).toBe(2.15);
      // Penalty: |2.15 - 2.15| * 45 = 0; payload penalty = (400/800)*15 = 7.5; 100 - 7.5 = 92.5 -> 93
      expect(result.backFerryEfficiencyScore).toBe(93);
      expect(result.stabilityWarning).toBeUndefined();
    });
  });
});
