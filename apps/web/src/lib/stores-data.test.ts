import { describe, it, expect } from 'vitest';
import {
  getAllStores,
  getStoreBySlug,
  filterStores,
} from './stores-data';

describe('stores-data', () => {
  describe('getAllStores', () => {
    it('returns all 5 official Contoso Outdoors stores', () => {
      const stores = getAllStores();
      expect(stores).toHaveLength(5);
      const names = stores.map((s) => s.name);
      expect(names).toContain('Seattle Flagship');
      expect(names).toContain('Denver Mountain Outpost');
      expect(names).toContain('Portland Trailhead');
      expect(names).toContain('Salt Lake City Basecamp');
      expect(names).toContain('San Francisco Bay');
    });

    it('returns complete store location properties for each store', () => {
      const stores = getAllStores();
      for (const store of stores) {
        expect(store.id).toBeDefined();
        expect(store.name).toBeDefined();
        expect(store.slug).toBeDefined();
        expect(store.address).toBeDefined();
        expect(store.city).toBeDefined();
        expect(store.state).toBeDefined();
        expect(store.zipCode).toBeDefined();
        expect(store.phone).toBeDefined();
        expect(store.hours.mondayFriday).toBeDefined();
        expect(store.hours.saturday).toBeDefined();
        expect(store.hours.sunday).toBeDefined();
        expect(typeof store.hasPickup).toBe('boolean');
        expect(typeof store.hasGearRental).toBe('boolean');
      }
    });
  });

  describe('getStoreBySlug', () => {
    it('returns the store matching the provided slug', () => {
      const store = getStoreBySlug('seattle-flagship');
      expect(store).toBeDefined();
      expect(store?.name).toBe('Seattle Flagship');
      expect(store?.city).toBe('Seattle');
      expect(store?.state).toBe('WA');
    });

    it('returns undefined when slug does not match any store', () => {
      const store = getStoreBySlug('non-existent-store');
      expect(store).toBeUndefined();
    });
  });

  describe('filterStores', () => {
    it('returns all stores when query is empty and no options provided', () => {
      const stores = filterStores('');
      expect(stores).toHaveLength(5);
    });

    it('filters stores by name case-insensitively', () => {
      const stores = filterStores('seattle');
      expect(stores).toHaveLength(1);
      expect(stores[0].name).toBe('Seattle Flagship');
    });

    it('filters stores by city case-insensitively', () => {
      const stores = filterStores('denver');
      expect(stores).toHaveLength(1);
      expect(stores[0].name).toBe('Denver Mountain Outpost');
    });

    it('filters stores by state abbreviation case-insensitively', () => {
      const stores = filterStores('OR');
      expect(stores).toHaveLength(1);
      expect(stores[0].name).toBe('Portland Trailhead');
    });

    it('filters stores by zip code', () => {
      const all = getAllStores();
      const first = all[0];
      const stores = filterStores(first.zipCode);
      expect(stores.some((s) => s.id === first.id)).toBe(true);
    });

    it('filters stores by hasPickup option', () => {
      const stores = filterStores('', { hasPickup: true });
      expect(stores.length).toBeGreaterThan(0);
      expect(stores.every((s) => s.hasPickup)).toBe(true);
    });

    it('filters stores by hasGearRental option', () => {
      const stores = filterStores('', { hasGearRental: true });
      expect(stores.length).toBeGreaterThan(0);
      expect(stores.every((s) => s.hasGearRental)).toBe(true);
    });

    it('combines text search query with option filters', () => {
      const stores = filterStores('Seattle', { hasGearRental: true });
      expect(stores).toHaveLength(1);
      expect(stores[0].name).toBe('Seattle Flagship');
      expect(stores[0].hasGearRental).toBe(true);
    });

    it('returns an empty array when no stores match query', () => {
      const stores = filterStores('Honolulu');
      expect(stores).toHaveLength(0);
    });
  });
});
