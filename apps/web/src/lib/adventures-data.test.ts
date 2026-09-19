import { describe, it, expect } from 'vitest';
import {
  getAllAdventures,
  getAdventuresByCategory,
  getAdventureById,
  getAllGuides,
  calculateAdventureBooking,
  filterAdventures,
} from './adventures-data';

describe('adventures-data', () => {
  describe('getAllAdventures', () => {
    it('returns all 5 guided adventures and clinics', () => {
      const adventures = getAllAdventures();
      expect(adventures).toHaveLength(5);
      expect(adventures.map((a) => a.title)).toEqual(
        expect.arrayContaining([
          'Alpine Mountaineering & Glacier Travel',
          'Introduction to Outdoor Rock Climbing',
          'Backcountry Whitewater Rafting Expedition',
          'Wilderness Navigation & Compass Clinic',
          'Avalanche Safety & Rescue Basics',
        ])
      );
    });

    it('each adventure has valid required properties', () => {
      const adventures = getAllAdventures();
      for (const adv of adventures) {
        expect(adv.id).toBeTruthy();
        expect(adv.title).toBeTruthy();
        expect(['Mountaineering', 'Rock Climbing', 'Water Sports', 'Safety & Survival']).toContain(
          adv.category
        );
        expect(adv.location).toBeTruthy();
        expect(adv.duration).toBeTruthy();
        expect(['Beginner', 'Intermediate', 'Strenuous', 'Expert']).toContain(adv.difficulty);
        expect(adv.pricePerPerson).toBeGreaterThan(0);
        expect(adv.gearRentalFee).toBeGreaterThanOrEqual(0);
        expect(adv.maxGroupSize).toBeGreaterThan(0);
        expect(adv.leadGuideName).toBeTruthy();
        expect(adv.description).toBeTruthy();
        expect(Array.isArray(adv.includedGear)).toBe(true);
        expect(adv.includedGear.length).toBeGreaterThan(0);
        expect(adv.prerequisites).toBeTruthy();
      }
    });
  });

  describe('getAdventuresByCategory', () => {
    it('returns adventures matching the category', () => {
      const rockClimbing = getAdventuresByCategory('Rock Climbing');
      expect(rockClimbing).toHaveLength(1);
      expect(rockClimbing[0].title).toBe('Introduction to Outdoor Rock Climbing');

      const safety = getAdventuresByCategory('Safety & Survival');
      expect(safety).toHaveLength(2);
      expect(safety.map((s) => s.title)).toEqual(
        expect.arrayContaining([
          'Wilderness Navigation & Compass Clinic',
          'Avalanche Safety & Rescue Basics',
        ])
      );
    });

    it('returns all adventures when category is All', () => {
      expect(getAdventuresByCategory('All')).toHaveLength(5);
    });
  });

  describe('getAdventureById', () => {
    it('returns matching adventure by ID', () => {
      const adv = getAdventureById('intro-rock-climbing-smith-rock');
      expect(adv).toBeDefined();
      expect(adv?.title).toBe('Introduction to Outdoor Rock Climbing');
      expect(adv?.pricePerPerson).toBe(175);
    });

    it('returns undefined for non-existent ID', () => {
      expect(getAdventureById('unknown-tour')).toBeUndefined();
    });
  });

  describe('getAllGuides', () => {
    it('returns all 4 certified lead guides with AMGA, WFR, and ACA credentials', () => {
      const guides = getAllGuides();
      expect(guides).toHaveLength(4);

      const sarah = guides.find((g) => g.name === 'Sarah Jenkins');
      expect(sarah).toBeDefined();
      expect(sarah?.title).toBe('Lead Alpine Guide');
      expect(sarah?.certifications).toContain('AMGA Certified Alpine Guide');
      expect(sarah?.certifications).toContain('WFR');
      expect(sarah?.yearsExperience).toBe(12);

      const marcus = guides.find((g) => g.name === 'Marcus Vance');
      expect(marcus).toBeDefined();
      expect(marcus?.certifications).toContain('AMGA Rock Guide');

      const david = guides.find((g) => g.name === 'David Chen');
      expect(david).toBeDefined();
      expect(david?.certifications).toContain('ACA Whitewater Kayak Instructor');

      const elena = guides.find((g) => g.name === 'Elena Rostova');
      expect(elena).toBeDefined();
      expect(elena?.certifications).toContain('WFR');
    });
  });

  describe('calculateAdventureBooking', () => {
    it('calculates booking estimate without gear rental', () => {
      const estimate = calculateAdventureBooking('intro-rock-climbing-smith-rock', 2, false);
      expect(estimate.tourId).toBe('intro-rock-climbing-smith-rock');
      expect(estimate.tourTitle).toBe('Introduction to Outdoor Rock Climbing');
      expect(estimate.participants).toBe(2);
      expect(estimate.includeGearRental).toBe(false);
      expect(estimate.baseTotal).toBe(350); // 2 * 175
      expect(estimate.gearRentalTotal).toBe(0);
      expect(estimate.totalPrice).toBe(350);
    });

    it('calculates booking estimate with gear rental ($175 -> $350 + $70 = $420)', () => {
      const estimate = calculateAdventureBooking('intro-rock-climbing-smith-rock', 2, true);
      expect(estimate.participants).toBe(2);
      expect(estimate.includeGearRental).toBe(true);
      expect(estimate.baseTotal).toBe(350); // 2 * 175
      expect(estimate.gearRentalTotal).toBe(70); // 2 * 35
      expect(estimate.totalPrice).toBe(420); // 350 + 70
    });

    it('handles single participant booking for alpine mountaineering', () => {
      const estimate = calculateAdventureBooking('alpine-mountaineering-rainier', 1, true);
      expect(estimate.baseTotal).toBe(650);
      expect(estimate.gearRentalTotal).toBe(75);
      expect(estimate.totalPrice).toBe(725);
    });

    it('throws or handles non-existent tour safely', () => {
      expect(() => calculateAdventureBooking('non-existent', 1, false)).toThrow(
        /tour not found/i
      );
    });
  });

  describe('filterAdventures', () => {
    it('filters adventures by search query across title, location, and keywords', () => {
      const rockClimbingResults = filterAdventures('Rock Climbing', 'All');
      expect(rockClimbingResults).toHaveLength(1);
      expect(rockClimbingResults[0].title).toBe('Introduction to Outdoor Rock Climbing');

      const glacierResults = filterAdventures('Glacier', 'All');
      expect(glacierResults).toHaveLength(1);
      expect(glacierResults[0].title).toBe('Alpine Mountaineering & Glacier Travel');

      const locationResults = filterAdventures('Rainier', 'All');
      expect(locationResults).toHaveLength(1);
      expect(locationResults[0].location).toBe('Mount Rainier');
    });

    it('filters adventures by category', () => {
      const waterResults = filterAdventures('', 'Water Sports');
      expect(waterResults).toHaveLength(1);
      expect(waterResults[0].title).toBe('Backcountry Whitewater Rafting Expedition');
    });

    it('combines search query and category filtering', () => {
      const matching = filterAdventures('rescue', 'Safety & Survival');
      expect(matching).toHaveLength(1);
      expect(matching[0].title).toBe('Avalanche Safety & Rescue Basics');

      const nonMatching = filterAdventures('rafting', 'Safety & Survival');
      expect(nonMatching).toHaveLength(0);
    });
  });
});
