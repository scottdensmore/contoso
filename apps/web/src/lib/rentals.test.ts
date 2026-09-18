import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  RENTAL_PACKAGES,
  RENTAL_STORES,
  calculateRentalCost,
  calculateRentalDays,
  saveRentalReservation,
  getRentalReservations,
  getRentalReservationById,
} from './rentals';

describe('rentals library', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('RENTAL_PACKAGES catalog', () => {
    it('contains all 4 required rental packages with correct specs and pricing', () => {
      expect(RENTAL_PACKAGES).toHaveLength(4);

      const camping = RENTAL_PACKAGES.find((p) => p.id === 'camp-bundle-4p');
      expect(camping).toBeDefined();
      expect(camping?.name).toBe('4-Person Deluxe Camping Package');
      expect(camping?.category).toBe('camping');
      expect(camping?.dailyRate).toBe(45);
      expect(camping?.deposit).toBe(100);
      expect(camping?.specs).toEqual([
        '4-person weatherproof tent',
        '2 queen airbeds',
        '2 dual-burner camp stoves',
        '4 LED lanterns',
      ]);

      const backpacking = RENTAL_PACKAGES.find((p) => p.id === 'backpack-ultralight');
      expect(backpacking).toBeDefined();
      expect(backpacking?.name).toBe('Ultralight Backpacking Kit');
      expect(backpacking?.category).toBe('backpacking');
      expect(backpacking?.dailyRate).toBe(35);
      expect(backpacking?.deposit).toBe(75);
      expect(backpacking?.specs).toEqual([
        '65L technical backpack',
        '1-person ultralight tent',
        'Down 20°F sleeping bag',
        'Pocket camp stove',
      ]);

      const paddling = RENTAL_PACKAGES.find((p) => p.id === 'kayak-touring-set');
      expect(paddling).toBeDefined();
      expect(paddling?.name).toBe('Touring Kayak & Paddle Set');
      expect(paddling?.category).toBe('paddling');
      expect(paddling?.dailyRate).toBe(50);
      expect(paddling?.deposit).toBe(150);
      expect(paddling?.specs).toEqual([
        '12ft sit-inside kayak',
        'Carbon fiber paddle',
        'Type III PFD life vest',
        'Waterproof dry bag',
      ]);

      const winter = RENTAL_PACKAGES.find((p) => p.id === 'snowshoe-alpine-kit');
      expect(winter).toBeDefined();
      expect(winter?.name).toBe('Alpine Snowshoe & Pole Kit');
      expect(winter?.category).toBe('winter');
      expect(winter?.dailyRate).toBe(25);
      expect(winter?.deposit).toBe(50);
      expect(winter?.specs).toEqual([
        'All-terrain aluminum snowshoes',
        'Telescoping trekking poles',
        'Gaiters set',
      ]);
    });
  });

  describe('RENTAL_STORES', () => {
    it('contains the 4 designated store locations for pickup', () => {
      expect(RENTAL_STORES).toHaveLength(4);
      const names = RENTAL_STORES.map((s) => s.name);
      expect(names).toContain('Seattle Flagship');
      expect(names).toContain('Denver Downtown');
      expect(names).toContain('Portland Outdoor');
      expect(names).toContain('Salt Lake Outpost');
    });
  });

  describe('calculateRentalDays', () => {
    it('returns 1 day for same day rental', () => {
      expect(calculateRentalDays('2026-10-01', '2026-10-01')).toBe(1);
    });

    it('returns 3 days for 3-day rental duration', () => {
      expect(calculateRentalDays('2026-10-01', '2026-10-03')).toBe(3);
    });

    it('returns 7 days for 7-day rental duration', () => {
      expect(calculateRentalDays('2026-10-01', '2026-10-07')).toBe(7);
    });

    it('returns 0 for end date before start date', () => {
      expect(calculateRentalDays('2026-10-05', '2026-10-01')).toBe(0);
    });

    it('returns 0 for empty or invalid dates', () => {
      expect(calculateRentalDays('', '2026-10-01')).toBe(0);
      expect(calculateRentalDays('2026-10-01', '')).toBe(0);
      expect(calculateRentalDays('', '')).toBe(0);
    });
  });

  describe('calculateRentalCost pricing logic', () => {
    it('applies 0% discount for 1-2 days rental', () => {
      const oneDay = calculateRentalCost(45, 1, 100);
      expect(oneDay).toEqual({
        days: 1,
        dailyRate: 45,
        baseSubtotal: 45,
        discountPercent: 0,
        discountAmount: 0,
        subtotal: 45,
        deposit: 100,
        totalDue: 145,
      });

      const twoDays = calculateRentalCost(45, 2, 100);
      expect(twoDays).toEqual({
        days: 2,
        dailyRate: 45,
        baseSubtotal: 90,
        discountPercent: 0,
        discountAmount: 0,
        subtotal: 90,
        deposit: 100,
        totalDue: 190,
      });
    });

    it('applies 10% discount for 3-6 days rental', () => {
      // 3 days: 45 * 3 = 135. discountAmount = Math.round(135 * 10 / 100) = 14. subtotal = 121. totalDue = 121 + 100 = 221
      const threeDays = calculateRentalCost(45, 3, 100);
      expect(threeDays).toEqual({
        days: 3,
        dailyRate: 45,
        baseSubtotal: 135,
        discountPercent: 10,
        discountAmount: 14,
        subtotal: 121,
        deposit: 100,
        totalDue: 221,
      });

      // 6 days: 50 * 6 = 300. discountAmount = Math.round(300 * 10 / 100) = 30. subtotal = 270. totalDue = 270 + 150 = 420
      const sixDays = calculateRentalCost(50, 6, 150);
      expect(sixDays).toEqual({
        days: 6,
        dailyRate: 50,
        baseSubtotal: 300,
        discountPercent: 10,
        discountAmount: 30,
        subtotal: 270,
        deposit: 150,
        totalDue: 420,
      });
    });

    it('applies 20% discount for 7+ days rental', () => {
      // 7 days: 35 * 7 = 245. discountAmount = Math.round(245 * 20 / 100) = 49. subtotal = 196. totalDue = 196 + 75 = 271
      const sevenDays = calculateRentalCost(35, 7, 75);
      expect(sevenDays).toEqual({
        days: 7,
        dailyRate: 35,
        baseSubtotal: 245,
        discountPercent: 20,
        discountAmount: 49,
        subtotal: 196,
        deposit: 75,
        totalDue: 271,
      });

      // 10 days: 25 * 10 = 250. discountAmount = Math.round(250 * 20 / 100) = 50. subtotal = 200. totalDue = 200 + 50 = 250
      const tenDays = calculateRentalCost(25, 10, 50);
      expect(tenDays).toEqual({
        days: 10,
        dailyRate: 25,
        baseSubtotal: 250,
        discountPercent: 20,
        discountAmount: 50,
        subtotal: 200,
        deposit: 50,
        totalDue: 250,
      });
    });

    it('handles 0 or negative days gracefully', () => {
      const zeroDays = calculateRentalCost(45, 0, 100);
      expect(zeroDays).toEqual({
        days: 0,
        dailyRate: 45,
        baseSubtotal: 0,
        discountPercent: 0,
        discountAmount: 0,
        subtotal: 0,
        deposit: 100,
        totalDue: 100,
      });
    });

    it('defaults deposit to 0 when omitted', () => {
      const cost = calculateRentalCost(45, 2);
      expect(cost.deposit).toBe(0);
      expect(cost.totalDue).toBe(90);
    });
  });

  describe('reservation storage helpers', () => {
    const sampleReservationInput = {
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
      customerPhone: '555-0199',
      packageId: 'camp-bundle-4p',
      packageName: '4-Person Deluxe Camping Package',
      storeId: 'seattle',
      storeName: 'Seattle Flagship',
      startDate: '2026-10-01',
      endDate: '2026-10-03',
      days: 3,
      totalDue: 221,
      deposit: 100,
    };

    it('saves a reservation, creates valid RNT- code, and stores in localStorage', () => {
      const saved = saveRentalReservation(sampleReservationInput);

      expect(saved.id).toMatch(/^RNT-\d{5}$/);
      expect(saved.status).toBe('confirmed');
      expect(saved.createdAt).toBeDefined();
      expect(saved.customerName).toBe('Jane Doe');
      expect(saved.packageName).toBe('4-Person Deluxe Camping Package');
      expect(saved.storeName).toBe('Seattle Flagship');

      const all = getRentalReservations();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(saved.id);
    });

    it('retrieves an existing reservation by ID', () => {
      const saved = saveRentalReservation(sampleReservationInput);
      const found = getRentalReservationById(saved.id);
      expect(found).toEqual(saved);

      const notFound = getRentalReservationById('RNT-99999');
      expect(notFound).toBeNull();
    });

    it('accumulates multiple reservations in localStorage', () => {
      const res1 = saveRentalReservation(sampleReservationInput);
      const res2 = saveRentalReservation({
        ...sampleReservationInput,
        customerName: 'John Smith',
        packageId: 'kayak-touring-set',
      });

      const all = getRentalReservations();
      expect(all).toHaveLength(2);
      expect(all.map((r) => r.id)).toEqual([res1.id, res2.id]);
    });
  });
});
