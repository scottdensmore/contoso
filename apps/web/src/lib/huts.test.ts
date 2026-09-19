import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAlpineHuts,
  getAlpineHutById,
  calculateHutCost,
  getHutReservations,
  saveHutReservation,
  cancelHutReservation,
  RESERVATIONS_STORAGE_KEY,
} from './huts';

describe('Alpine Hut & Backcountry Shelter Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getAlpineHuts & getAlpineHutById', () => {
    it('returns at least 4 standard huts with full details', () => {
      const huts = getAlpineHuts();
      expect(huts.length).toBeGreaterThanOrEqual(4);

      const hutIds = huts.map((h) => h.id);
      expect(hutIds).toContain('asgard-refuge');
      expect(hutIds).toContain('mueller-ridge');
      expect(hutIds).toContain('cirque-towers');
      expect(hutIds).toContain('red-mountain-yurt');

      const asgard = huts.find((h) => h.id === 'asgard-refuge');
      expect(asgard).toBeDefined();
      expect(asgard?.name).toBe('Asgard Pass High Alpine Refuge');
      expect(asgard?.mountainRange).toBe('Cascades');
      expect(asgard?.elevationFeet).toBe(7850);
      expect(asgard?.capacityBunks).toBe(12);
      expect(asgard?.pricePerNight).toBe(45);
      expect(asgard?.accessDifficulty).toBe('Strenuous');
      expect(asgard?.amenities).toContain('Wood Stove');
      expect(asgard?.amenities).toContain('Solar Lighting');
      expect(asgard?.amenities).toContain('Composting Toilet');
      expect(asgard?.amenities).toContain('Snow Melt Cistern');
      expect(asgard?.mandatoryGear).toContain('Sleeping Bag Liner');
      expect(asgard?.mandatoryGear).toContain('Headlamp');
      expect(asgard?.mandatoryGear).toContain('Microspikes');

      const mueller = huts.find((h) => h.id === 'mueller-ridge');
      expect(mueller?.mountainRange).toBe('Olympic');
      expect(mueller?.elevationFeet).toBe(5400);
      expect(mueller?.capacityBunks).toBe(8);
      expect(mueller?.pricePerNight).toBe(35);
      expect(mueller?.accessDifficulty).toBe('Moderate');
      expect(mueller?.mandatoryGear).toContain('Water Filter');

      const cirque = huts.find((h) => h.id === 'cirque-towers');
      expect(cirque?.mountainRange).toBe('Wind River');
      expect(cirque?.elevationFeet).toBe(10200);
      expect(cirque?.capacityBunks).toBe(6);
      expect(cirque?.pricePerNight).toBe(50);
      expect(cirque?.accessDifficulty).toBe('Technical');
      expect(cirque?.mandatoryGear).toContain('Helmet');
      expect(cirque?.mandatoryGear).toContain('Satellite Communicator');

      const redMountain = huts.find((h) => h.id === 'red-mountain-yurt');
      expect(redMountain?.mountainRange).toBe('San Juan');
      expect(redMountain?.elevationFeet).toBe(11200);
      expect(redMountain?.capacityBunks).toBe(10);
      expect(redMountain?.pricePerNight).toBe(40);
      expect(redMountain?.accessDifficulty).toBe('Strenuous');
      expect(redMountain?.mandatoryGear).toContain('Avalanche Beacon');
      expect(redMountain?.mandatoryGear).toContain('Shovel');
      expect(redMountain?.mandatoryGear).toContain('Probe');
    });

    it('returns a hut by id or null if not found', () => {
      const found = getAlpineHutById('asgard-refuge');
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Asgard Pass High Alpine Refuge');

      const notFound = getAlpineHutById('unknown-hut-id');
      expect(notFound).toBeNull();
    });
  });

  describe('calculateHutCost', () => {
    it('calculates total price as pricePerNight * nights * guests', () => {
      // 45 * 2 * 2 = 180
      expect(calculateHutCost(45, 2, 2)).toBe(180);
      // 35 * 3 * 1 = 105
      expect(calculateHutCost(35, 3, 1)).toBe(105);
      // 50 * 1 * 4 = 200
      expect(calculateHutCost(50, 1, 4)).toBe(200);
    });

    it('handles zero, negative, or invalid values safely by returning 0', () => {
      expect(calculateHutCost(45, 0, 2)).toBe(0);
      expect(calculateHutCost(45, 2, 0)).toBe(0);
      expect(calculateHutCost(45, -1, 2)).toBe(0);
      expect(calculateHutCost(45, 2, -1)).toBe(0);
      expect(calculateHutCost(NaN, 2, 2)).toBe(0);
    });
  });

  describe('Hut Reservation Storage Helpers', () => {
    const sampleReservationInput = {
      hutId: 'asgard-refuge',
      hutName: 'Asgard Pass High Alpine Refuge',
      checkInDate: '2026-10-15',
      nights: 2,
      guests: 2,
      pricePerNight: 45,
      totalPrice: 180,
      leadGuestName: 'Alex Honnold',
      leadGuestEmail: 'alex@example.com',
      leadGuestPhone: '555-0199',
    };

    it('returns empty array when no reservations are saved', () => {
      expect(getHutReservations()).toEqual([]);
    });

    it('saves a new hut reservation with HUT-XXXXX format, confirmed status, and createdAt', () => {
      const saved = saveHutReservation(sampleReservationInput);

      expect(saved.id).toMatch(/^HUT-\d{5}$/);
      expect(saved.status).toBe('confirmed');
      expect(saved.hutName).toBe('Asgard Pass High Alpine Refuge');
      expect(saved.totalPrice).toBe(180);
      expect(saved.leadGuestName).toBe('Alex Honnold');
      expect(saved.createdAt).toBeTruthy();

      const all = getHutReservations();
      expect(all.length).toBe(1);
      expect(all[0].id).toBe(saved.id);
      expect(localStorage.getItem(RESERVATIONS_STORAGE_KEY)).toContain(saved.id);
    });

    it('cancels an existing reservation and returns true', () => {
      const saved = saveHutReservation(sampleReservationInput);
      expect(saved.status).toBe('confirmed');

      const success = cancelHutReservation(saved.id);
      expect(success).toBe(true);

      const all = getHutReservations();
      const target = all.find((r) => r.id === saved.id);
      expect(target?.status).toBe('cancelled');
    });

    it('returns false when trying to cancel a non-existent reservation', () => {
      const success = cancelHutReservation('HUT-99999');
      expect(success).toBe(false);
    });
  });
});
