import { describe, it, expect } from 'vitest';
import {
  getAltitudeProfiles,
  getAltitudeProfileById,
  calculateAcclimatizationPlan,
  getAltitudeMedicalGear,
  type AcclimatizationPlanQuery,
} from './acclimatization';

describe('acclimatization library', () => {
  describe('peak profiles and catalog', () => {
    it('contains all 5 iconic high-altitude peaks', () => {
      const profiles = getAltitudeProfiles();
      expect(profiles).toHaveLength(5);

      const ids = profiles.map((p) => p.id);
      expect(ids).toContain('colorado-mount-elbert');
      expect(ids).toContain('washington-mount-rainier');
      expect(ids).toContain('alaska-denali');
      expect(ids).toContain('california-mount-whitney');
      expect(ids).toContain('mexico-pico-de-orizaba');
    });

    it('correctly filters profiles by altitude zone', () => {
      const highPeaks = getAltitudeProfiles('high_12000_14000');
      expect(highPeaks).toHaveLength(3);
      expect(highPeaks.map((p) => p.id)).toEqual(
        expect.arrayContaining([
          'colorado-mount-elbert',
          'washington-mount-rainier',
          'california-mount-whitney',
        ])
      );

      const extremePeaks = getAltitudeProfiles('extreme_death_zone_18000_plus');
      expect(extremePeaks).toHaveLength(1);
      expect(extremePeaks[0].id).toBe('alaska-denali');

      const veryHighPeaks = getAltitudeProfiles('very_high_14000_18000');
      expect(veryHighPeaks).toHaveLength(1);
      expect(veryHighPeaks[0].id).toBe('mexico-pico-de-orizaba');

      const moderatePeaks = getAltitudeProfiles('moderate_8000_12000');
      expect(moderatePeaks).toHaveLength(0);
    });

    it('finds peak profile by id', () => {
      const denali = getAltitudeProfileById('alaska-denali');
      expect(denali).toBeDefined();
      expect(denali?.peakName).toContain('Denali');
      expect(denali?.summitElevationFt).toBe(20310);
      expect(denali?.oxygenPercentageEffective).toBe(9.8);
      expect(denali?.keyAcclimatizationCamps).toHaveLength(4);

      const unknown = getAltitudeProfileById('non-existent-peak');
      expect(unknown).toBeUndefined();
    });

    it('verifies Mount Rainier profile attributes', () => {
      const rainier = getAltitudeProfileById('washington-mount-rainier');
      expect(rainier).toBeDefined();
      expect(rainier?.baseElevationFt).toBe(5420);
      expect(rainier?.summitElevationFt).toBe(14411);
      expect(rainier?.recommendedAcclimatizationDays).toBe(3);
      expect(rainier?.maxDailyElevationGainFt).toBe(3500);
      expect(rainier?.oxygenPercentageEffective).toBe(12.3);
      expect(rainier?.keyAcclimatizationCamps).toContain('Camp Muir (10,080 ft)');
    });
  });

  describe('medical gear checklist', () => {
    it('returns 6 mandatory medical and monitoring items', () => {
      const gear = getAltitudeMedicalGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const itemNames = gear.map((g) => g.name);
      expect(
        itemNames.some((n) => n.includes('Clinical fingertip pulse oximeter'))
      ).toBe(true);
      expect(
        itemNames.some((n) => n.includes('Acetazolamide (Diamox)'))
      ).toBe(true);
      expect(
        itemNames.some((n) => n.includes('Gamow bag or supplemental emergency O2'))
      ).toBe(true);
      expect(
        itemNames.some((n) => n.includes('Lake Louise AMS symptom score'))
      ).toBe(true);
      expect(
        itemNames.some((n) => n.includes('Insulated 1-liter wide-mouth water bottles'))
      ).toBe(true);
      expect(
        itemNames.some((n) => n.includes('High-calorie electrolyte & carbohydrate'))
      ).toBe(true);
    });
  });

  describe('acclimatization plan calculations', () => {
    it('calculates safe ascent for Denali with 14 days and experienced climber', () => {
      const query: AcclimatizationPlanQuery = {
        peakId: 'alaska-denali',
        climberRestingHeartRate: 60,
        currentAltitudeFt: 7200,
        targetAltitudeFt: 20310,
        daysAllowed: 14,
        priorAltitudeExperience: 'experienced_high_altitude',
      };

      const plan = calculateAcclimatizationPlan(query);
      expect(plan.peakName).toContain('Denali');
      // Vertical gain: 20310 - 7200 = 13110. Daily: 13110 / 14 = 936 ft/day.
      expect(plan.recommendedDailyAscentFt).toBe(936);
      expect(plan.restDaysRequired).toBeGreaterThanOrEqual(2);
      expect(plan.gamowBagOrO2Recommended).toBe(true); // extreme altitude
      expect(plan.hydrationRequirementLiters).toBeGreaterThanOrEqual(4.5);
      expect(plan.climbHighSleepLowSchedule).toContain('14,000 ft Camp');
    });

    it('flags severe AMS risk for rushed ascent on Denali in 3 days with no experience', () => {
      const query: AcclimatizationPlanQuery = {
        peakId: 'alaska-denali',
        climberRestingHeartRate: 85,
        currentAltitudeFt: 7200,
        targetAltitudeFt: 20310,
        daysAllowed: 3,
        priorAltitudeExperience: 'none',
      };

      const plan = calculateAcclimatizationPlan(query);
      // Vertical gain: 13110 / 3 = 4370 ft/day.
      expect(plan.recommendedDailyAscentFt).toBe(4370);
      expect(plan.amsRisk).toBe('severe');
      expect(plan.gamowBagOrO2Recommended).toBe(true);
      expect(plan.medicalAdvisory).toContain('CRITICAL');
    });

    it('calculates Mount Rainier typical 3-day ascent with moderate/high AMS risk', () => {
      const query: AcclimatizationPlanQuery = {
        peakId: 'washington-mount-rainier',
        climberRestingHeartRate: 65,
        currentAltitudeFt: 5420,
        targetAltitudeFt: 14411,
        daysAllowed: 3,
        priorAltitudeExperience: 'some_14er',
      };

      const plan = calculateAcclimatizationPlan(query);
      // 14411 - 5420 = 8991. Daily: 8991 / 3 = 2997 ft/day.
      expect(plan.recommendedDailyAscentFt).toBe(2997);
      expect(plan.restDaysRequired).toBe(1);
      expect(['moderate', 'high']).toContain(plan.amsRisk);
      expect(plan.hydrationRequirementLiters).toBeGreaterThanOrEqual(4.0);
    });

    it('calculates Mount Elbert gradual acclimatization with low risk', () => {
      const query: AcclimatizationPlanQuery = {
        peakId: 'colorado-mount-elbert',
        climberRestingHeartRate: 55,
        currentAltitudeFt: 11800,
        targetAltitudeFt: 14440,
        daysAllowed: 3,
        priorAltitudeExperience: 'experienced_high_altitude',
      };

      const plan = calculateAcclimatizationPlan(query);
      // 14440 - 11800 = 2640. Daily: 2640 / 3 = 880 ft/day.
      expect(plan.recommendedDailyAscentFt).toBe(880);
      expect(plan.amsRisk).toBe('low');
      expect(plan.medicalAdvisory).toContain('STABLE');
    });
  });
});
