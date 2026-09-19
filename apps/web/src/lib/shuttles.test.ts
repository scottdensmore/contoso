import { describe, it, expect, beforeEach } from 'vitest';
import {
  getShuttleRoutes,
  getShuttleRouteById,
  calculateShuttleCost,
  getShuttleReservations,
  saveShuttleReservation,
  cancelShuttleReservation,
  getCarpoolListings,
  saveCarpoolListing,
  INITIAL_CARPOOL_LISTINGS,
} from './shuttles';

describe('Trailhead Shuttle & Backcountry Rideshare Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getShuttleRoutes & getShuttleRouteById', () => {
    it('returns at least 4 standard routes with comprehensive route details', () => {
      const routes = getShuttleRoutes();
      expect(routes.length).toBeGreaterThanOrEqual(4);

      const routeIds = routes.map((r) => r.id);
      expect(routeIds).toContain('enchantments-connector');
      expect(routeIds).toContain('rainier-express');
      expect(routeIds).toContain('olympic-coast');
      expect(routeIds).toContain('rockies-loop');

      const enchantments = routes.find((r) => r.id === 'enchantments-connector');
      expect(enchantments).toBeDefined();
      expect(enchantments?.name).toBe('Enchantments Through-Hike Connector');
      expect(enchantments?.region).toBe('Cascades');
      expect(enchantments?.departureLocation).toBe('Snow Lakes Trailhead');
      expect(enchantments?.arrivalTrailhead).toBe('Stuart/Colchuck Trailhead');
      expect(enchantments?.durationMinutes).toBe(35);
      expect(enchantments?.pricePerSeat).toBe(30);
      expect(enchantments?.isThroughHikeConnector).toBe(true);
      expect(enchantments?.departureTimes).toContain('06:00 AM');
      expect(enchantments?.parkingAdvice.length).toBeGreaterThan(0);

      const rainier = routes.find((r) => r.id === 'rainier-express');
      expect(rainier?.region).toBe('Rainier');
      expect(rainier?.pricePerSeat).toBe(25);

      const olympic = routes.find((r) => r.id === 'olympic-coast');
      expect(olympic?.region).toBe('Olympic');
      expect(olympic?.pricePerSeat).toBe(35);

      const rockies = routes.find((r) => r.id === 'rockies-loop');
      expect(rockies?.region).toBe('Rockies');
      expect(rockies?.pricePerSeat).toBe(20);
    });

    it('returns a route by id or null if not found', () => {
      const found = getShuttleRouteById('enchantments-connector');
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Enchantments Through-Hike Connector');

      const notFound = getShuttleRouteById('non-existent-shuttle');
      expect(notFound).toBeNull();
    });
  });

  describe('calculateShuttleCost', () => {
    it('multiplies pricePerSeat by seats', () => {
      expect(calculateShuttleCost(30, 2)).toBe(60);
      expect(calculateShuttleCost(25, 4)).toBe(100);
      expect(calculateShuttleCost(35, 1)).toBe(35);
    });

    it('handles zero or negative seat count safely', () => {
      expect(calculateShuttleCost(30, 0)).toBe(0);
      expect(calculateShuttleCost(30, -2)).toBe(0);
    });
  });

  describe('Shuttle Reservation Storage Helpers', () => {
    const sampleReservationInput = {
      routeId: 'enchantments-connector',
      routeName: 'Enchantments Through-Hike Connector',
      departureDate: '2026-10-05',
      departureTime: '06:00 AM',
      seats: 2,
      totalPrice: 60,
      passengerName: 'Alex Honnold',
      passengerEmail: 'alex@example.com',
      passengerPhone: '555-0199',
    };

    it('returns empty array when no reservations are saved', () => {
      expect(getShuttleReservations()).toEqual([]);
    });

    it('saves a new shuttle reservation with SHT- prefix, confirmed status, and createdAt timestamp', () => {
      const saved = saveShuttleReservation(sampleReservationInput);

      expect(saved.id).toMatch(/^SHT-\d{5}$/);
      expect(saved.status).toBe('confirmed');
      expect(saved.createdAt).toBeTruthy();
      expect(saved.passengerName).toBe('Alex Honnold');
      expect(saved.totalPrice).toBe(60);
      expect(saved.seats).toBe(2);

      const all = getShuttleReservations();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(saved.id);
      expect(all[0].passengerName).toBe('Alex Honnold');
    });

    it('cancels an active reservation, updating its status to cancelled', () => {
      const saved = saveShuttleReservation(sampleReservationInput);
      expect(saved.status).toBe('confirmed');

      const cancelSuccess = cancelShuttleReservation(saved.id);
      expect(cancelSuccess).toBe(true);

      const all = getShuttleReservations();
      expect(all).toHaveLength(1);
      expect(all[0].status).toBe('cancelled');
    });

    it('returns false when attempting to cancel an unknown reservation id', () => {
      const result = cancelShuttleReservation('SHT-99999');
      expect(result).toBe(false);
    });
  });

  describe('Carpool Listing Storage Helpers', () => {
    it('returns initial community carpool listings when localStorage is empty', () => {
      const listings = getCarpoolListings();
      expect(listings.length).toBeGreaterThanOrEqual(3);
      expect(listings).toEqual(INITIAL_CARPOOL_LISTINGS);

      const first = listings[0];
      expect(first.id).toMatch(/^CPL-\d{5}$/);
      expect(first.originCity).toBeTruthy();
      expect(first.destinationTrailhead).toBeTruthy();
      expect(first.driverName).toBeTruthy();
      expect(first.driverContact).toBeTruthy();
    });

    it('saves a new carpool offer with CPL- prefix and prepends to listings', () => {
      const newOffer = {
        originCity: 'Seattle',
        destinationTrailhead: 'Snow Lakes Trailhead',
        departureDate: '2026-10-12',
        seatsAvailable: 3,
        driverName: 'Alex',
        driverContact: 'alex@example.com',
        notes: 'Driving electric SUV with bike rack and ski cargo box.',
      };

      const saved = saveCarpoolListing(newOffer);
      expect(saved.id).toMatch(/^CPL-\d{5}$/);
      expect(saved.originCity).toBe('Seattle');
      expect(saved.driverName).toBe('Alex');
      expect(saved.createdAt).toBeTruthy();

      const listings = getCarpoolListings();
      expect(listings[0].id).toBe(saved.id);
      expect(listings[0].driverName).toBe('Alex');
      expect(listings.length).toBe(INITIAL_CARPOOL_LISTINGS.length + 1);
    });
  });
});
