import { describe, it, expect } from 'vitest';
import {
  getHotSprings,
  getHotSpringById,
  calculateSoakingPlan,
  getHotSpringGear,
} from './hot-springs';

describe('hot-springs library', () => {
  describe('getHotSprings', () => {
    it('returns all 5 hot springs when no filter is provided', () => {
      const springs = getHotSprings();
      expect(springs).toHaveLength(5);
      const ids = springs.map((s) => s.id);
      expect(ids).toContain('scenic-hot-springs');
      expect(ids).toContain('goldmyer-hot-springs');
      expect(ids).toContain('bagby-hot-springs');
      expect(ids).toContain('travertine-hot-springs');
      expect(ids).toContain('kirkham-hot-springs');
    });

    it('filters by access difficulty "rugged_backcountry"', () => {
      const rugged = getHotSprings('rugged_backcountry');
      expect(rugged).toHaveLength(1);
      expect(rugged[0].id).toBe('goldmyer-hot-springs');
      expect(rugged[0].name).toBe('Goldmyer Hot Springs');
    });

    it('filters by access difficulty "easy_walk"', () => {
      const easy = getHotSprings('easy_walk');
      expect(easy).toHaveLength(3);
      const ids = easy.map((s) => s.id);
      expect(ids).toContain('bagby-hot-springs');
      expect(ids).toContain('travertine-hot-springs');
      expect(ids).toContain('kirkham-hot-springs');
    });

    it('filters by access difficulty "moderate_hike"', () => {
      const moderate = getHotSprings('moderate_hike');
      expect(moderate).toHaveLength(1);
      expect(moderate[0].id).toBe('scenic-hot-springs');
    });
  });

  describe('getHotSpringById', () => {
    it('returns the hot spring matching the id with all required fields', () => {
      const spring = getHotSpringById('scenic-hot-springs');
      expect(spring).toBeDefined();
      expect(spring?.name).toBe('Scenic Hot Springs');
      expect(spring?.region).toBe('Cascade Mountains');
      expect(spring?.state).toBe('WA');
      expect(spring?.temperatureF).toBe(104);
      expect(spring?.poolType).toBe('cedar_tub');
      expect(spring?.mineralProfile).toBe('lithium_silica');
      expect(spring?.accessDifficulty).toBe('moderate_hike');
      expect(spring?.hikeDistanceMiles).toBe(4.4);
      expect(spring?.elevationGainFt).toBe(1100);
      expect(spring?.clothingOptional).toBe(true);
      expect(spring?.feeRequired).toBe(true);
      expect(spring?.winterAccess).toBe(true);
      expect(spring?.leaveNoTraceRules.length).toBeGreaterThan(0);
      expect(spring?.recommendedGear.length).toBeGreaterThan(0);
    });

    it('returns undefined for nonexistent id', () => {
      const spring = getHotSpringById('nonexistent-spring');
      expect(spring).toBeUndefined();
    });
  });

  describe('getHotSpringGear', () => {
    it('returns 6 mandatory gear items with expected categories', () => {
      const gear = getHotSpringGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const names = gear.map((item) => item.name.toLowerCase());
      expect(names.some((n) => n.includes('booties') || n.includes('sandals'))).toBe(true);
      expect(names.some((n) => n.includes('towel'))).toBe(true);
      expect(names.some((n) => n.includes('hydration') || n.includes('bottle'))).toBe(true);
      expect(names.some((n) => n.includes('dry bag'))).toBe(true);
      expect(names.some((n) => n.includes('headlamp'))).toBe(true);
      expect(names.some((n) => n.includes('waste bags'))).toBe(true);
    });
  });

  describe('calculateSoakingPlan', () => {
    it('calculates plan for Scenic Hot Springs with party size 2 and 45 mins in summer', () => {
      const plan = calculateSoakingPlan({
        springId: 'scenic-hot-springs',
        partySize: 2,
        season: 'summer',
        soakDurationMinutes: 45,
      });

      expect(plan.springName).toBe('Scenic Hot Springs');
      expect(plan.waterTempF).toBe(104);
      expect(plan.safeMaxSessionMinutes).toBe(30);
      expect(plan.hydrationLitersRequired).toBeGreaterThanOrEqual(2.0);
      expect(plan.electrolytesRecommendedMg).toBeGreaterThan(0);
      expect(plan.recommendedClothing.toLowerCase()).toContain('optional');
      expect(plan.ethicsChecklist.length).toBeGreaterThan(0);
    });

    it('adjusts safeMaxSessionMinutes for extremely hot water at Bagby (120F)', () => {
      const plan = calculateSoakingPlan({
        springId: 'bagby-hot-springs',
        partySize: 2,
        season: 'summer',
        soakDurationMinutes: 30,
      });

      expect(plan.waterTempF).toBe(120);
      expect(plan.safeMaxSessionMinutes).toBe(15);
      expect(plan.recommendedClothing.toLowerCase()).toContain('swimwear mandatory');
      expect(plan.hazards.some((h) => h.toLowerCase().includes('temperature'))).toBe(true);
    });

    it('scales hydration requirements with larger party size and longer duration', () => {
      const basePlan = calculateSoakingPlan({
        springId: 'kirkham-hot-springs',
        partySize: 2,
        season: 'summer',
        soakDurationMinutes: 45,
      });

      const largerPlan = calculateSoakingPlan({
        springId: 'kirkham-hot-springs',
        partySize: 4,
        season: 'summer',
        soakDurationMinutes: 90,
      });

      expect(largerPlan.hydrationLitersRequired).toBeGreaterThan(basePlan.hydrationLitersRequired);
      expect(largerPlan.electrolytesRecommendedMg).toBeGreaterThan(basePlan.electrolytesRecommendedMg);
    });

    it('scales hydration higher for summer than spring/fall', () => {
      const springPlan = calculateSoakingPlan({
        springId: 'scenic-hot-springs',
        partySize: 2,
        season: 'spring',
        soakDurationMinutes: 60,
      });

      const summerPlan = calculateSoakingPlan({
        springId: 'scenic-hot-springs',
        partySize: 2,
        season: 'summer',
        soakDurationMinutes: 60,
      });

      expect(summerPlan.hydrationLitersRequired).toBeGreaterThanOrEqual(springPlan.hydrationLitersRequired);
    });

    it('throws error when hot spring id does not exist', () => {
      expect(() =>
        calculateSoakingPlan({
          springId: 'unknown',
          partySize: 2,
          season: 'summer',
          soakDurationMinutes: 45,
        })
      ).toThrow('Hot spring with id "unknown" not found');
    });
  });
});
