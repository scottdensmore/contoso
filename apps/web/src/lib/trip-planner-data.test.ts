import { describe, it, expect } from 'vitest';
import {
  getAllTripTemplates,
  calculateNutritionHydration,
  generateTripPlan,
  CHECKLIST_CATALOG,
} from './trip-planner-data';

describe('trip-planner-data catalog and calculation logic', () => {
  describe('getAllTripTemplates', () => {
    it('returns all 5 trip templates with required attributes', () => {
      const templates = getAllTripTemplates();
      expect(templates).toHaveLength(5);

      const templateIds = templates.map((t) => t.id);
      expect(templateIds).toContain('weekend-backpacking');
      expect(templateIds).toContain('alpine-day-summit');
      expect(templateIds).toContain('extended-backcountry');
      expect(templateIds).toContain('winter-snow-camping');
      expect(templateIds).toContain('desert-canyoneering');

      const weekend = templates.find((t) => t.id === 'weekend-backpacking');
      expect(weekend?.name).toBe('Weekend Backpacking');
      expect(weekend?.defaultDays).toBe(3);
      expect(weekend?.defaultGroupSize).toBe(2);
      expect(weekend?.climate).toBe('moderate');
      expect(weekend?.terrain).toBe('forest');
      expect(weekend?.description).toBeTruthy();

      const winter = templates.find((t) => t.id === 'winter-snow-camping');
      expect(winter?.name).toBe('Winter Snow Camping');
      expect(winter?.climate).toBe('subzero');
      expect(winter?.terrain).toBe('snow');

      const desert = templates.find((t) => t.id === 'desert-canyoneering');
      expect(desert?.climate).toBe('warm');
      expect(desert?.terrain).toBe('desert');

      const alpine = templates.find((t) => t.id === 'alpine-day-summit');
      expect(alpine?.climate).toBe('cold');
      expect(alpine?.terrain).toBe('alpine');
    });
  });

  describe('calculateNutritionHydration', () => {
    it('calculates calories and water for moderate forest backpacking', () => {
      const result = calculateNutritionHydration(3, 2, 'moderate', 'forest');
      expect(result.dailyCaloriesPerPersonKcal).toBe(3000);
      expect(result.totalCaloriesKcal).toBe(18000);
      expect(result.dailyWaterLitersPerPerson).toBe(3.0);
      expect(result.totalWaterCapacityLiters).toBe(6.0);
    });

    it('calculates elevated calories and water for cold alpine scrambling', () => {
      const result = calculateNutritionHydration(1, 1, 'cold', 'alpine');
      expect(result.dailyCaloriesPerPersonKcal).toBe(3400);
      expect(result.totalCaloriesKcal).toBe(3400);
      expect(result.dailyWaterLitersPerPerson).toBe(4.5);
      expect(result.totalWaterCapacityLiters).toBe(4.5);
    });

    it('calculates maximum calories for subzero snow expeditions', () => {
      const result = calculateNutritionHydration(3, 2, 'subzero', 'snow');
      expect(result.dailyCaloriesPerPersonKcal).toBe(3800);
      expect(result.totalCaloriesKcal).toBe(22800);
      expect(result.dailyWaterLitersPerPerson).toBe(3.0);
      expect(result.totalWaterCapacityLiters).toBe(6.0);
    });

    it('calculates desert hydration requirements for warm desert canyoneering', () => {
      const result = calculateNutritionHydration(4, 2, 'warm', 'desert');
      expect(result.dailyCaloriesPerPersonKcal).toBe(2800);
      expect(result.totalCaloriesKcal).toBe(22400);
      expect(result.dailyWaterLitersPerPerson).toBe(4.5);
      expect(result.totalWaterCapacityLiters).toBe(9.0);
    });
  });

  describe('CHECKLIST_CATALOG', () => {
    it('contains items across all 5 standard categories', () => {
      const categories = new Set(CHECKLIST_CATALOG.map((item) => item.category));
      expect(categories).toContain('The Ten Essentials');
      expect(categories).toContain('Shelter & Sleep');
      expect(categories).toContain('Cooking & Water');
      expect(categories).toContain('Apparel & Layers');
      expect(categories).toContain('Camp Comfort');
    });

    it('contains all 10 essential safety items', () => {
      const essentials = CHECKLIST_CATALOG.filter(
        (item) => item.category === 'The Ten Essentials' && item.essential
      );
      expect(essentials.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('generateTripPlan', () => {
    it('generates standard moderate plan with 3-season tent and no cold gear', () => {
      const plan = generateTripPlan({
        days: 3,
        groupSize: 2,
        climate: 'moderate',
        terrain: 'forest',
      });

      expect(plan.totalCaloriesKcal).toBe(18000);
      expect(plan.dailyWaterLitersPerPerson).toBe(3.0);
      expect(plan.estimatedBaseWeightKg).toBeGreaterThan(5);

      const itemNames = plan.items.map((i) => i.name);
      expect(itemNames).toContain('3-Season Lightweight Backpacking Tent');
      expect(itemNames).not.toContain('4-Season Mountaineering Geodesic Tent');
      expect(itemNames).not.toContain('Traction Microspikes / Crampons');
    });

    it('switches to 4-season tent and adds microspikes in cold weather', () => {
      const plan = generateTripPlan({
        days: 2,
        groupSize: 2,
        climate: 'cold',
        terrain: 'forest',
      });

      const itemNames = plan.items.map((i) => i.name);
      expect(itemNames).toContain('4-Season Mountaineering Geodesic Tent');
      expect(itemNames).toContain('Traction Microspikes / Crampons');
      expect(itemNames).toContain('High R-Value Insulated Sleeping Pad (R-Value 5.0+)');
      expect(itemNames).not.toContain('3-Season Lightweight Backpacking Tent');
    });

    it('includes subzero sleeping bag and gear for subzero snow trips', () => {
      const plan = generateTripPlan({
        days: 4,
        groupSize: 2,
        climate: 'subzero',
        terrain: 'snow',
      });

      const itemNames = plan.items.map((i) => i.name);
      expect(itemNames).toContain('Expedition Down Sleeping Bag (-20°F Rating)');
      expect(itemNames).toContain('4-Season Mountaineering Geodesic Tent');
      expect(itemNames).toContain('Traction Microspikes / Crampons');
    });

    it('includes desert hydration reservoir and sun apparel for desert trips', () => {
      const plan = generateTripPlan({
        days: 3,
        groupSize: 2,
        climate: 'warm',
        terrain: 'desert',
      });

      const itemNames = plan.items.map((i) => i.name);
      expect(itemNames).toContain('High-Capacity Hydration Reservoir (3L Dromedary)');
      expect(itemNames).toContain('UPF 50+ Sun Hoodie & Wide-Brim Desert Hat');
    });
  });
});
