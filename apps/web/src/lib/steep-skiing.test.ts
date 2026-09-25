import { describe, it, expect } from 'vitest';
import {
  COULOIR_DESCENTS,
  STEEP_SKIING_GEAR,
  getCouloirDescents,
  getCouloirDescentById,
  calculateCouloirDynamics,
  getSteepSkiingGear,
  CouloirCalculationQuery,
} from './steep-skiing';

describe('steep-skiing library', () => {
  describe('Couloir Catalog', () => {
    it('provides exactly 5 iconic steep couloir descents', () => {
      expect(COULOIR_DESCENTS).toHaveLength(5);
      const descents = getCouloirDescents();
      expect(descents).toHaveLength(5);
    });

    it('contains all required iconic descents with correct metadata', () => {
      const ids = COULOIR_DESCENTS.map((c) => c.id);
      expect(ids).toEqual([
        'corbets-couloir-jackson',
        'tuckerman-ravine-headwall',
        'silver-couloir-buffalo',
        'terminal-cancer-couloir',
        'mount-superior-south-face',
      ]);

      const corbets = getCouloirDescentById('corbets-couloir-jackson');
      expect(corbets).toBeDefined();
      expect(corbets?.name).toBe("Corbet's Couloir & S&S Chute");
      expect(corbets?.mountain).toBe('Rendezvous Mountain');
      expect(corbets?.range).toBe('Teton Range, WY');
      expect(corbets?.grade).toBe('Class_2_Steep_45_50');
      expect(corbets?.maxSlopeAngleDeg).toBe(50);
      expect(corbets?.averageSlopeAngleDeg).toBe(46);
      expect(corbets?.verticalDropMeters).toBe(180);
      expect(corbets?.chokeWidthMeters).toBe(3.5);
      expect(corbets?.aspect).toBe('East');
      expect(corbets?.highlights).toContain('Mandatory cornice entry air');

      const terminalCancer = getCouloirDescentById('terminal-cancer-couloir');
      expect(terminalCancer).toBeDefined();
      expect(terminalCancer?.chokeWidthMeters).toBe(2.0);
    });

    it('filters couloirs by grade correctly', () => {
      const class2 = getCouloirDescents('Class_2_Steep_45_50');
      expect(class2.length).toBe(3);
      expect(class2.every((c) => c.grade === 'Class_2_Steep_45_50')).toBe(true);

      const class3 = getCouloirDescents('Class_3_Extreme_50_55');
      expect(class3.length).toBe(2);
      expect(class3.every((c) => c.grade === 'Class_3_Extreme_50_55')).toBe(true);

      const class1 = getCouloirDescents('Class_1_Moderate_40_45');
      expect(class1).toHaveLength(0);
    });

    it('returns undefined for an unknown couloir ID', () => {
      expect(getCouloirDescentById('non-existent-couloir')).toBeUndefined();
    });
  });

  describe('Steep Skiing Gear', () => {
    it('provides exactly 6 mandatory gear items', () => {
      expect(STEEP_SKIING_GEAR).toHaveLength(6);
      const gear = getSteepSkiingGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);
    });

    it('includes all 6 required specific safety items', () => {
      const gearIds = STEEP_SKIING_GEAR.map((g) => g.id);
      expect(gearIds).toEqual([
        'technical-ski-mountaineering-axes',
        'certified-ski-crampons',
        'ultralight-ski-rad-line',
        'ski-carry-airbag-backpack',
        'aluminum-snow-stake-fluke',
        'triple-certified-ski-climbing-helmet',
      ]);

      const axes = STEEP_SKIING_GEAR.find((g) => g.id === 'technical-ski-mountaineering-axes');
      expect(axes?.category).toBe('axes');
      expect(axes?.name).toBe('Curved Ski Mountaineering Ice Axes (Pair)');

      const helmet = STEEP_SKIING_GEAR.find((g) => g.id === 'triple-certified-ski-climbing-helmet');
      expect(helmet?.category).toBe('helmet');
      expect(helmet?.description).toContain('EN 12492');
    });
  });

  describe('Dynamics & Kinematics Calculations', () => {
    it('calculates sluff velocity and hop turn edge load accurately', () => {
      const query: CouloirCalculationQuery = {
        couloirId: 'corbets-couloir-jackson',
        slopeAngleDeg: 48,
        snowSurface: 'packed_powder',
        skierWeightKg: 78,
        sluffReleaseDistanceMeters: 20,
      };

      const result = calculateCouloirDynamics(query);
      expect(result.couloirName).toBe("Corbet's Couloir & S&S Chute");
      expect(result.sluffVelocityKmH).toBeGreaterThan(0);
      expect(result.hopTurnEdgeLoadN).toBeGreaterThan(0);

      // Verify specific physics calculations
      // theta = 48 * Math.PI / 180 = 0.837758
      // sin(theta) = 0.7431448
      // cos(theta) = 0.6691306
      // mu for packed_powder = 0.28
      // accel = 9.81 * (0.7431448 - 0.28 * 0.6691306) = 9.81 * (0.7431448 - 0.1873565) = 9.81 * 0.555788 = 5.45228
      // sluffVelocityMs = sqrt(2 * 5.45228 * 20) = sqrt(218.09) = 14.7679
      // sluffVelocityKmH = round(14.7679 * 3.6 * 10) / 10 = round(531.64) / 10 = 53.2 km/h
      expect(result.sluffVelocityKmH).toBeCloseTo(53.2, 0);

      // hopTurnEdgeLoadN:
      // ((78 * 2.2) / 0.12) * cos(48) + 78 * 9.81 * cos(48)
      // = (171.6 / 0.12) * 0.66913 + 765.18 * 0.66913
      // = 1430 * 0.66913 + 512.0
      // = 956.85 + 512.0 = 1468.85 -> 1469 N
      expect(result.hopTurnEdgeLoadN).toBe(1469);
    });

    it('evaluates fall consequence index correctly across conditions', () => {
      // 53+ degrees -> catastrophic
      const highAngleResult = calculateCouloirDynamics({
        couloirId: 'corbets-couloir-jackson',
        slopeAngleDeg: 53,
        snowSurface: 'packed_powder',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 10,
      });
      expect(highAngleResult.fallConsequenceIndex).toBe('catastrophic_unmitigated');

      // 48+ deg with corn_ice_firm -> catastrophic
      const icyResult = calculateCouloirDynamics({
        couloirId: 'corbets-couloir-jackson',
        slopeAngleDeg: 48,
        snowSurface: 'corn_ice_firm',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 10,
      });
      expect(icyResult.fallConsequenceIndex).toBe('catastrophic_unmitigated');

      // 46+ deg -> severe_injury_risk
      const severeAngleResult = calculateCouloirDynamics({
        couloirId: 'corbets-couloir-jackson',
        slopeAngleDeg: 46,
        snowSurface: 'packed_powder',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 10,
      });
      expect(severeAngleResult.fallConsequenceIndex).toBe('severe_injury_risk');

      // wind_slab at lower angle -> severe_injury_risk
      const slabResult = calculateCouloirDynamics({
        couloirId: 'corbets-couloir-jackson',
        slopeAngleDeg: 42,
        snowSurface: 'wind_slab',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 10,
      });
      expect(slabResult.fallConsequenceIndex).toBe('severe_injury_risk');

      // 42 deg packed powder -> moderate_arrestable
      const moderateResult = calculateCouloirDynamics({
        couloirId: 'corbets-couloir-jackson',
        slopeAngleDeg: 42,
        snowSurface: 'packed_powder',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 10,
      });
      expect(moderateResult.fallConsequenceIndex).toBe('moderate_arrestable');
    });

    it('recommends descent style based on slope angle and choke width', () => {
      // slope >= 52 -> ski_belay_rappel
      const steepStyle = calculateCouloirDynamics({
        couloirId: 'corbets-couloir-jackson',
        slopeAngleDeg: 52,
        snowSurface: 'packed_powder',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 10,
      });
      expect(steepStyle.recommendedStyle).toBe('ski_belay_rappel');

      // chokeWidth <= 2.2 -> side_slipping_choke (Terminal Cancer Couloir has choke 2.0m)
      const chokeStyle = calculateCouloirDynamics({
        couloirId: 'terminal-cancer-couloir',
        slopeAngleDeg: 44,
        snowSurface: 'packed_powder',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 10,
      });
      expect(chokeStyle.recommendedStyle).toBe('side_slipping_choke');

      // slope >= 45 -> hop_turns
      const hopStyle = calculateCouloirDynamics({
        couloirId: 'corbets-couloir-jackson',
        slopeAngleDeg: 46,
        snowSurface: 'packed_powder',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 10,
      });
      expect(hopStyle.recommendedStyle).toBe('hop_turns');

      // chalk_firm at 42 deg -> hop_turns
      const chalkHopStyle = calculateCouloirDynamics({
        couloirId: 'corbets-couloir-jackson',
        slopeAngleDeg: 42,
        snowSurface: 'chalk_firm',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 10,
      });
      expect(chalkHopStyle.recommendedStyle).toBe('hop_turns');

      // moderate slope & powder -> fluid_turns
      const fluidStyle = calculateCouloirDynamics({
        couloirId: 'corbets-couloir-jackson',
        slopeAngleDeg: 42,
        snowSurface: 'packed_powder',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 10,
      });
      expect(fluidStyle.recommendedStyle).toBe('fluid_turns');
    });

    it('includes sluff strategy and choke warnings when thresholds are met', () => {
      // High velocity sluff (> 35 km/h)
      const highSluff = calculateCouloirDynamics({
        couloirId: 'corbets-couloir-jackson',
        slopeAngleDeg: 50,
        snowSurface: 'packed_powder',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 30,
      });
      expect(highSluff.sluffVelocityKmH).toBeGreaterThan(35);
      expect(highSluff.sluffManagementStrategy).toContain('High-velocity sluff hazard');

      // Choke warning for couloir with chokeWidth <= 2.5m (terminal-cancer-couloir = 2.0m)
      const narrowChoke = calculateCouloirDynamics({
        couloirId: 'terminal-cancer-couloir',
        slopeAngleDeg: 45,
        snowSurface: 'packed_powder',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 10,
      });
      expect(narrowChoke.chokeWarning).toContain('Extreme choke restriction (<2.5m)');

      // Wide choke (corbets = 3.5m) does not generate choke warning
      const wideChoke = calculateCouloirDynamics({
        couloirId: 'corbets-couloir-jackson',
        slopeAngleDeg: 45,
        snowSurface: 'packed_powder',
        skierWeightKg: 75,
        sluffReleaseDistanceMeters: 10,
      });
      expect(wideChoke.chokeWarning).toBeUndefined();
    });

    it('throws error for unknown couloirId in calculation', () => {
      expect(() =>
        calculateCouloirDynamics({
          couloirId: 'unknown',
          slopeAngleDeg: 45,
          snowSurface: 'packed_powder',
          skierWeightKg: 75,
          sluffReleaseDistanceMeters: 10,
        }),
      ).toThrow('Couloir not found: unknown');
    });
  });
});
