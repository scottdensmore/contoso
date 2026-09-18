import { describe, it, expect } from 'vitest';
import {
  TRAILS,
  getTrails,
  getTrailById,
  generateChecklist,
} from './trails';

describe('trails catalog and utilities', () => {
  describe('catalog data', () => {
    it('contains four regional trails with correct structures', () => {
      expect(TRAILS).toHaveLength(4);

      const rattlesnake = TRAILS.find((t) => t.id === 'rattlesnake-ridge');
      expect(rattlesnake).toBeDefined();
      expect(rattlesnake?.name).toBe('Rattlesnake Ridge Trail');
      expect(rattlesnake?.region).toBe('Pacific Northwest');
      expect(rattlesnake?.difficulty).toBe('moderate');
      expect(rattlesnake?.distanceMiles).toBe(4.0);
      expect(rattlesnake?.elevationGainFt).toBe(1160);
      expect(rattlesnake?.currentWeather.temperatureF).toBe(58);
      expect(rattlesnake?.currentWeather.condition).toBe('Partly Cloudy');
      expect(rattlesnake?.currentWeather.trailStatus).toBe('open');
      expect(rattlesnake?.recommendedCategory).toBe('hiking-footwear');
      expect(rattlesnake?.essentialGear).toEqual([
        'Trekking poles',
        'Trail running shoes',
        'Hydration pack',
        'Light rain shell',
      ]);

      const bearPeak = TRAILS.find((t) => t.id === 'bear-peak');
      expect(bearPeak).toBeDefined();
      expect(bearPeak?.name).toBe('Bear Peak Summit');
      expect(bearPeak?.region).toBe('Rocky Mountains');
      expect(bearPeak?.difficulty).toBe('hard');
      expect(bearPeak?.distanceMiles).toBe(5.7);
      expect(bearPeak?.elevationGainFt).toBe(2900);
      expect(bearPeak?.currentWeather.temperatureF).toBe(45);
      expect(bearPeak?.currentWeather.condition).toBe('Breezy');
      expect(bearPeak?.currentWeather.trailStatus).toBe('open');

      const multnomah = TRAILS.find((t) => t.id === 'multnomah-loop');
      expect(multnomah).toBeDefined();
      expect(multnomah?.name).toBe('Multnomah-Wahkeena Loop');
      expect(multnomah?.region).toBe('Pacific Northwest');
      expect(multnomah?.difficulty).toBe('moderate');
      expect(multnomah?.currentWeather.trailStatus).toBe('caution');
      expect(multnomah?.currentWeather.advisory).toBe(
        'Slick rock surfaces near waterfalls spray'
      );

      const olympus = TRAILS.find((t) => t.id === 'mount-olympus');
      expect(olympus).toBeDefined();
      expect(olympus?.name).toBe('Mount Olympus Trail');
      expect(olympus?.region).toBe('Wasatch Range');
      expect(olympus?.difficulty).toBe('hard');
      expect(olympus?.distanceMiles).toBe(7.5);
      expect(olympus?.elevationGainFt).toBe(4100);
    });
  });

  describe('getTrails', () => {
    it('returns all trails when no filters or "all" are passed', () => {
      expect(getTrails()).toHaveLength(4);
      expect(getTrails('all', 'all')).toHaveLength(4);
    });

    it('filters by region', () => {
      const pnw = getTrails('Pacific Northwest');
      expect(pnw).toHaveLength(2);
      expect(pnw.map((t) => t.id)).toEqual(['rattlesnake-ridge', 'multnomah-loop']);

      const rockies = getTrails('Rocky Mountains');
      expect(rockies).toHaveLength(1);
      expect(rockies[0].id).toBe('bear-peak');

      const wasatch = getTrails('Wasatch Range');
      expect(wasatch).toHaveLength(1);
      expect(wasatch[0].id).toBe('mount-olympus');
    });

    it('filters by difficulty', () => {
      const moderate = getTrails('all', 'moderate');
      expect(moderate).toHaveLength(2);
      expect(moderate.map((t) => t.id)).toEqual(['rattlesnake-ridge', 'multnomah-loop']);

      const hard = getTrails('all', 'hard');
      expect(hard).toHaveLength(2);
      expect(hard.map((t) => t.id)).toEqual(['bear-peak', 'mount-olympus']);

      const easy = getTrails('all', 'easy');
      expect(easy).toHaveLength(0);
    });

    it('filters by both region and difficulty', () => {
      const pnwModerate = getTrails('Pacific Northwest', 'moderate');
      expect(pnwModerate).toHaveLength(2);

      const pnwHard = getTrails('Pacific Northwest', 'hard');
      expect(pnwHard).toHaveLength(0);
    });
  });

  describe('getTrailById', () => {
    it('returns the trail when found', () => {
      const trail = getTrailById('rattlesnake-ridge');
      expect(trail).not.toBeNull();
      expect(trail?.id).toBe('rattlesnake-ridge');
      expect(trail?.name).toBe('Rattlesnake Ridge Trail');
    });

    it('returns null when not found', () => {
      expect(getTrailById('non-existent-trail')).toBeNull();
    });
  });

  describe('generateChecklist', () => {
    it('generates the 10 essentials for day-hiking activity', () => {
      const items = generateChecklist('day-hiking', 'summer');
      expect(items.length).toBeGreaterThanOrEqual(10);
      const essentialNames = items.filter((i) => i.essential).map((i) => i.name.toLowerCase());
      
      expect(essentialNames.some((n) => n.includes('navigation') || n.includes('map'))).toBe(true);
      expect(essentialNames.some((n) => n.includes('hydration') || n.includes('water'))).toBe(true);
      expect(essentialNames.some((n) => n.includes('first aid'))).toBe(true);
      expect(essentialNames.some((n) => n.includes('headlamp'))).toBe(true);
      expect(essentialNames.some((n) => n.includes('snack'))).toBe(true);
      expect(essentialNames.some((n) => n.includes('tool') || n.includes('knife'))).toBe(true);
      expect(essentialNames.some((n) => n.includes('fire'))).toBe(true);
      expect(essentialNames.some((n) => n.includes('sun'))).toBe(true);
      expect(essentialNames.some((n) => n.includes('whistle'))).toBe(true);
    });

    it('generates backpacking items including shelter and camp stove', () => {
      const items = generateChecklist('backpacking', 'summer');
      const names = items.map((i) => i.name.toLowerCase());
      expect(names.some((n) => n.includes('shelter') || n.includes('tent'))).toBe(true);
      expect(names.some((n) => n.includes('sleeping bag'))).toBe(true);
      expect(names.some((n) => n.includes('stove'))).toBe(true);
      expect(names.some((n) => n.includes('filter'))).toBe(true);
      expect(names.some((n) => n.includes('pack'))).toBe(true);
      expect(names.some((n) => n.includes('bear canister'))).toBe(true);
    });

    it('generates alpine-snow items including snowshoes, ice axe, and beacon', () => {
      const items = generateChecklist('alpine-snow', 'winter');
      const names = items.map((i) => i.name.toLowerCase());
      expect(names.some((n) => n.includes('snowshoe') || n.includes('crampon'))).toBe(true);
      expect(names.some((n) => n.includes('ice axe'))).toBe(true);
      expect(names.some((n) => n.includes('beacon'))).toBe(true);
      expect(names.some((n) => n.includes('thermal'))).toBe(true);
    });

    it('generates desert-trek items including 4L+ water and snake-bite kit', () => {
      const items = generateChecklist('desert-trek', 'spring');
      const names = items.map((i) => i.name.toLowerCase());
      expect(names.some((n) => n.includes('4l') || n.includes('extra water'))).toBe(true);
      expect(names.some((n) => n.includes('hat'))).toBe(true);
      expect(names.some((n) => n.includes('electrolyte'))).toBe(true);
      expect(names.some((n) => n.includes('snake-bite'))).toBe(true);
    });

    it('adds winter seasonal items when season is winter', () => {
      const items = generateChecklist('day-hiking', 'winter');
      const names = items.map((i) => i.name.toLowerCase());
      expect(names.some((n) => n.includes('thermal') || n.includes('insulated') || n.includes('cleats'))).toBe(true);
    });

    it('adds summer seasonal items when season is summer', () => {
      const items = generateChecklist('day-hiking', 'summer');
      const names = items.map((i) => i.name.toLowerCase());
      expect(names.some((n) => n.includes('sun') || n.includes('hydration') || n.includes('spf'))).toBe(true);
    });

    it('adds spring seasonal items when season is spring', () => {
      const items = generateChecklist('day-hiking', 'spring');
      const names = items.map((i) => i.name.toLowerCase());
      expect(names.some((n) => n.includes('waterproof') || n.includes('rain') || n.includes('gaiters'))).toBe(true);
    });

    it('assigns unique id, non-empty category, and essential boolean to every item', () => {
      const items = generateChecklist('day-hiking', 'fall');
      const ids = new Set(items.map((i) => i.id));
      expect(ids.size).toBe(items.length);
      for (const item of items) {
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.category).toBeTruthy();
        expect(typeof item.essential).toBe('boolean');
      }
    });
  });
});
