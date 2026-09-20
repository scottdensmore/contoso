import { describe, it, expect } from 'vitest';
import {
  STARGAZING_SITES,
  getStargazingSites,
  getStargazingSiteById,
  calculateViewingWindow,
  getMeteorShowerCalendar,
  getStargazingGearChecklist,
  type ViewingWindowQuery,
} from './stargazing';

describe('stargazing lib', () => {
  describe('STARGAZING_SITES catalog', () => {
    it('contains all 5 dark sky sanctuary sites with exact specs', () => {
      expect(STARGAZING_SITES).toHaveLength(5);

      const prineville = STARGAZING_SITES.find((s) => s.id === 'prineville-reservoir');
      expect(prineville).toBeDefined();
      expect(prineville?.name).toContain('Prineville Reservoir');
      expect(prineville?.bortleClass).toBe(2);
      expect(prineville?.sqmReading).toBe(21.75);
      expect(prineville?.elevationFt).toBe(3200);
      expect(prineville?.bestSeasons).toEqual(['summer', 'fall']);
      expect(prineville?.featuredTargets).toEqual(['Milky Way core', 'Perseid meteors', 'M31 Andromeda']);
      expect(prineville?.overnightCamping).toBe(true);

      const baker = STARGAZING_SITES.find((s) => s.id === 'artist-point-baker');
      expect(baker).toBeDefined();
      expect(baker?.name).toContain('Artist Point at Mount Baker');
      expect(baker?.bortleClass).toBe(3);
      expect(baker?.sqmReading).toBe(21.45);
      expect(baker?.elevationFt).toBe(5100);
      expect(baker?.bestSeasons).toEqual(['summer', 'early_fall']);
      expect(baker?.featuredTargets).toEqual(['Aurora Borealis', 'Milky Way arches', 'Star clusters']);
      expect(baker?.overnightCamping).toBe(false);

      const johnDay = STARGAZING_SITES.find((s) => s.id === 'john-day-fossil');
      expect(johnDay).toBeDefined();
      expect(johnDay?.name).toContain('John Day Fossil Beds - Painted Hills');
      expect(johnDay?.bortleClass).toBe(1);
      expect(johnDay?.sqmReading).toBe(21.95);
      expect(johnDay?.elevationFt).toBe(2300);
      expect(johnDay?.bestSeasons).toEqual(['spring', 'summer', 'fall']);
      expect(johnDay?.featuredTargets).toEqual(['Zodiacal light', 'Deep sky nebulae', 'Pinwheel galaxy']);
      expect(johnDay?.overnightCamping).toBe(false);

      const copperRidge = STARGAZING_SITES.find((s) => s.id === 'copper-ridge-cascades');
      expect(copperRidge).toBeDefined();
      expect(copperRidge?.name).toContain('Copper Ridge Fire Lookout');
      expect(copperRidge?.bortleClass).toBe(1);
      expect(copperRidge?.sqmReading).toBe(21.98);
      expect(copperRidge?.elevationFt).toBe(5400);
      expect(copperRidge?.bestSeasons).toEqual(['summer']);
      expect(copperRidge?.featuredTargets).toEqual(['Unfiltered galactic core', 'Airglow', 'Faint comets']);
      expect(copperRidge?.overnightCamping).toBe(true);

      const craterLake = STARGAZING_SITES.find((s) => s.id === 'crater-lake-rim');
      expect(craterLake).toBeDefined();
      expect(craterLake?.name).toContain('Crater Lake Rim Watchman Overlook');
      expect(craterLake?.bortleClass).toBe(2);
      expect(craterLake?.sqmReading).toBe(21.8);
      expect(craterLake?.elevationFt).toBe(7400);
      expect(craterLake?.bestSeasons).toEqual(['summer', 'fall']);
      expect(craterLake?.featuredTargets).toEqual(['Deep sky clusters', 'High elevation transparency', 'Planetary alignments']);
      expect(craterLake?.overnightCamping).toBe(true);
    });
  });

  describe('getStargazingSites', () => {
    it('returns all sites when no bortleMax filter is provided', () => {
      const sites = getStargazingSites();
      expect(sites).toHaveLength(5);
    });

    it('filters sites by bortleMax correctly', () => {
      const pristineSites = getStargazingSites(2);
      expect(pristineSites).toHaveLength(4);
      expect(pristineSites.find((s) => s.id === 'artist-point-baker')).toBeUndefined();
      expect(pristineSites.find((s) => s.id === 'john-day-fossil')).toBeDefined();

      const bortle1Sites = getStargazingSites(1);
      expect(bortle1Sites).toHaveLength(2);
      expect(bortle1Sites.map((s) => s.id)).toEqual(['john-day-fossil', 'copper-ridge-cascades']);
    });
  });

  describe('getStargazingSiteById', () => {
    it('returns the site when matching id is found', () => {
      const site = getStargazingSiteById('copper-ridge-cascades');
      expect(site).toBeDefined();
      expect(site?.id).toBe('copper-ridge-cascades');
    });

    it('returns undefined for non-existent site', () => {
      const site = getStargazingSiteById('non-existent-site');
      expect(site).toBeUndefined();
    });
  });

  describe('getMeteorShowerCalendar', () => {
    it('returns 4 premier annual meteor showers', () => {
      const showers = getMeteorShowerCalendar();
      expect(showers).toHaveLength(4);

      const perseids = showers.find((s) => s.id === 'perseids');
      expect(perseids).toBeDefined();
      expect(perseids?.peakDate).toBe('August 12-13');
      expect(perseids?.zhrRate).toBe(100);
      expect(perseids?.parentBody).toBe('109P/Swift-Tuttle');

      const geminids = showers.find((s) => s.id === 'geminids');
      expect(geminids).toBeDefined();
      expect(geminids?.peakDate).toBe('December 13-14');
      expect(geminids?.zhrRate).toBe(120);
      expect(geminids?.parentBody).toBe('3200 Phaethon');

      const orionids = showers.find((s) => s.id === 'orionids');
      expect(orionids).toBeDefined();
      expect(orionids?.peakDate).toBe('October 21-22');
      expect(orionids?.zhrRate).toBe(20);
      expect(orionids?.parentBody).toBe('1P/Halley');

      const lyrids = showers.find((s) => s.id === 'lyrids');
      expect(lyrids).toBeDefined();
      expect(lyrids?.peakDate).toBe('April 21-22');
      expect(lyrids?.zhrRate).toBe(18);
      expect(lyrids?.parentBody).toBe('C/1861 G1 Thatcher');
    });
  });

  describe('getStargazingGearChecklist', () => {
    it('returns checklist items across optics, lighting, comfort, and navigation', () => {
      const gear = getStargazingGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((g) => g.category));
      expect(categories.has('optics')).toBe(true);
      expect(categories.has('lighting')).toBe(true);
      expect(categories.has('comfort')).toBe(true);
      expect(categories.has('navigation')).toBe(true);

      const redHeadlamp = gear.find((g) => g.id.includes('red-headlamp') || g.name.toLowerCase().includes('red'));
      expect(redHeadlamp).toBeDefined();
      expect(redHeadlamp?.essential).toBe(true);
    });
  });

  describe('calculateViewingWindow', () => {
    it('evaluates optimal conditions for Copper Ridge with New Moon and 0% clouds', () => {
      const query: ViewingWindowQuery = {
        siteId: 'copper-ridge-cascades',
        moonPhase: 'new_moon',
        cloudCoverPercent: 0,
        targetType: 'deep_sky',
      };

      const result = calculateViewingWindow(query);
      expect(result.viewingQuality).toBe('optimal');
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.recommendedOptics).toBeTruthy();
      expect(result.darkAdaptationNotice).toMatch(/red light/i);
    });

    it('evaluates poor conditions when cloud cover is heavy (90%)', () => {
      const query: ViewingWindowQuery = {
        siteId: 'copper-ridge-cascades',
        moonPhase: 'new_moon',
        cloudCoverPercent: 90,
        targetType: 'deep_sky',
      };

      const result = calculateViewingWindow(query);
      expect(result.viewingQuality).toBe('poor');
      expect(result.score).toBeLessThanOrEqual(40);
      expect(result.reasons.some((r) => r.toLowerCase().includes('cloud'))).toBe(true);
    });

    it('evaluates marginal or good conditions with full moon for planets vs deep sky', () => {
      const deepSkyQuery: ViewingWindowQuery = {
        siteId: 'prineville-reservoir',
        moonPhase: 'full_moon',
        cloudCoverPercent: 10,
        targetType: 'deep_sky',
      };
      const planetsQuery: ViewingWindowQuery = {
        siteId: 'prineville-reservoir',
        moonPhase: 'full_moon',
        cloudCoverPercent: 10,
        targetType: 'planets',
      };

      const deepSkyResult = calculateViewingWindow(deepSkyQuery);
      const planetsResult = calculateViewingWindow(planetsQuery);

      // Planets are far less vulnerable to moonlight wash than deep sky objects
      expect(planetsResult.score).toBeGreaterThan(deepSkyResult.score);
    });

    it('gracefully handles unknown siteId', () => {
      const query: ViewingWindowQuery = {
        siteId: 'unknown-site',
        moonPhase: 'new_moon',
        cloudCoverPercent: 0,
        targetType: 'deep_sky',
      };
      const result = calculateViewingWindow(query);
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons.length).toBeGreaterThan(0);
    });
  });
});
