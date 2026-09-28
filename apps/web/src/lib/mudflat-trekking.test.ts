import { describe, it, expect } from 'vitest';
import {
  getMudflatRoutes,
  getMudflatRouteById,
  calculateMudflatDynamics,
  getMudflatGear,
  MUDFLAT_ROUTES,
  type MudflatQuery,
} from './mudflat-trekking';

describe('Mudflat Trekking Domain Logic', () => {
  describe('Catalog & Route Retrieval', () => {
    it('returns all 5 iconic mudflat routes', () => {
      const routes = getMudflatRoutes();
      expect(routes).toHaveLength(5);
      const ids = routes.map((r) => r.id);
      expect(ids).toEqual([
        'wadden-sea-neuwerk-traverse',
        'bay-of-fundy-miners-marsh',
        'mont-saint-michel-bay',
        'morecambe-bay-sands',
        'turnagain-arm-mudflats',
      ]);
    });

    it('filters routes by terrain profile', () => {
      const softSilt = getMudflatRoutes('soft_estuary_silt');
      expect(softSilt).toHaveLength(2);
      expect(softSilt.map((r) => r.id)).toEqual([
        'wadden-sea-neuwerk-traverse',
        'mont-saint-michel-bay',
      ]);

      const deepOoze = getMudflatRoutes('deep_quicksilt_ooze');
      expect(deepOoze).toHaveLength(3);
      expect(deepOoze.map((r) => r.id)).toEqual([
        'bay-of-fundy-miners-marsh',
        'morecambe-bay-sands',
        'turnagain-arm-mudflats',
      ]);

      const firmSand = getMudflatRoutes('firm_compact_sand');
      expect(firmSand).toHaveLength(0);

      const shellGravel = getMudflatRoutes('shell_gravel_shallows');
      expect(shellGravel).toHaveLength(0);
    });

    it('finds a route by id', () => {
      const route = getMudflatRouteById('wadden-sea-neuwerk-traverse');
      expect(route).toBeDefined();
      expect(route?.title).toBe('Wadden Sea Cuxhaven-Neuwerk Traverse');
      expect(route?.estuaryLocation).toContain('Lower Saxony Wadden Sea');
      expect(route?.region).toContain('Germany');
      expect(route?.routeDistanceKm).toBe(12.5);
      expect(route?.tidalWindowHours).toBe(3.5);
      expect(route?.maxSiltDepthCm).toBe(35);
      expect(route?.terrainProfile).toBe('soft_estuary_silt');
      expect(route?.highlights).toContain('Prikken navigation bush markers');
      expect(route?.highlights).toContain('Prielen tidal creek wading');
      expect(route?.highlights).toContain('Historical rescue beacon cages');

      const missing = getMudflatRouteById('non-existent');
      expect(missing).toBeUndefined();
    });

    it('contains all required fields for each route in the catalog', () => {
      expect(MUDFLAT_ROUTES).toHaveLength(5);
      for (const route of MUDFLAT_ROUTES) {
        expect(route.id).toBeTruthy();
        expect(route.title).toBeTruthy();
        expect(route.estuaryLocation).toBeTruthy();
        expect(route.region).toBeTruthy();
        expect(route.routeDistanceKm).toBeGreaterThan(0);
        expect(route.tidalWindowHours).toBeGreaterThan(0);
        expect(route.maxSiltDepthCm).toBeGreaterThan(0);
        expect(route.terrainProfile).toBeTruthy();
        expect(route.description).toBeTruthy();
        expect(route.highlights.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Mandatory Safety Kit Checklist', () => {
    it('returns the 6 mandatory mudflat trekking gear items', () => {
      const gear = getMudflatGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toEqual([
        'lace-locked-mudflat-booties',
        'telescoping-silt-probe-pole',
        'high-decibel-fog-marine-whistle',
        'high-visibility-tidal-strobe',
        'waterproof-gps-tide-altimeter',
        'neoprene-cold-water-wading-tights',
      ]);

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('footwear');
      expect(categories).toContain('probe_pole');
      expect(categories).toContain('signaling');
      expect(categories).toContain('lighting');
      expect(categories).toContain('navigation');
      expect(categories).toContain('apparel');
    });
  });

  describe('Tidal Silt Suction & Return Window Dynamics Calculator', () => {
    it('calculates dynamics correctly for default scenario on Wadden Sea', () => {
      const query: MudflatQuery = {
        routeId: 'wadden-sea-neuwerk-traverse',
        siltDepthCm: 25,
        trekkerPaceKph: 3.2,
        elapsedTimeMinutes: 45,
        tidalPhase: 'slack_low_tide',
      };

      const result = calculateMudflatDynamics(query);
      expect(result.routeTitle).toBe('Wadden Sea Cuxhaven-Neuwerk Traverse');
      expect(result.terrainProfile).toBe('soft_estuary_silt');
      expect(result.remainingTidalWindowMinutes).toBe(165);
      expect(result.siltSuctionDragIndex).toBe(6);
      expect(result.prielenWadingDepthCm).toBe(45);
      expect(result.tidalHazardRating).toBe('safe_low_tide_window');
      expect(result.evacuationAdvisory).toBeTruthy();
      expect(result.navigationGuidance).toBeTruthy();
    });

    it('calculates hazardous quicksilt tidal entrapment scenario on Bay of Fundy', () => {
      const query: MudflatQuery = {
        routeId: 'bay-of-fundy-miners-marsh',
        siltDepthCm: 52,
        trekkerPaceKph: 3.2,
        elapsedTimeMinutes: 130,
        tidalPhase: 'spring_bore_incoming',
      };

      const result = calculateMudflatDynamics(query);
      expect(result.remainingTidalWindowMinutes).toBe(20);
      expect(result.siltSuctionDragIndex).toBe(10);
      expect(result.prielenWadingDepthCm).toBe(138);
      expect(result.tidalHazardRating).toBe('hazardous_quicksilt_tidal_entrapment');
    });

    it('calculates caution accelerated flood return scenario', () => {
      const query: MudflatQuery = {
        routeId: 'wadden-sea-neuwerk-traverse',
        siltDepthCm: 32,
        trekkerPaceKph: 3.2,
        elapsedTimeMinutes: 140,
        tidalPhase: 'mid_flood_rising',
      };

      const result = calculateMudflatDynamics(query);
      expect(result.remainingTidalWindowMinutes).toBe(70);
      expect(result.prielenWadingDepthCm).toBe(75);
      expect(result.tidalHazardRating).toBe('caution_accelerated_flood_return');
    });

    it('handles remaining tidal window clamped to 0 when elapsed time exceeds window', () => {
      const query: MudflatQuery = {
        routeId: 'turnagain-arm-mudflats',
        siltDepthCm: 20,
        trekkerPaceKph: 3.0,
        elapsedTimeMinutes: 150,
        tidalPhase: 'slack_low_tide',
      };

      const result = calculateMudflatDynamics(query);
      expect(result.remainingTidalWindowMinutes).toBe(0);
      expect(result.tidalHazardRating).toBe('hazardous_quicksilt_tidal_entrapment');
    });

    it('throws when routeId is not found', () => {
      const query: MudflatQuery = {
        routeId: 'invalid-id',
        siltDepthCm: 25,
        trekkerPaceKph: 3.2,
        elapsedTimeMinutes: 45,
        tidalPhase: 'slack_low_tide',
      };

      expect(() => calculateMudflatDynamics(query)).toThrow(
        /route with ID "invalid-id" not found/i
      );
    });
  });
});
