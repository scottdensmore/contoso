import { describe, it, expect } from 'vitest';
import {
  getSlickrockBurroRoutes,
  getSlickrockBurroRouteById,
  calculateBurroDynamics,
  getSlickrockBurroGearChecklist,
  type BurroDynamicsQuery,
} from './slickrock-burro';

describe('slickrock-burro lib', () => {
  describe('getSlickrockBurroRoutes', () => {
    it('returns all 5 iconic routes when no filter is provided', () => {
      const routes = getSlickrockBurroRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toEqual([
        'san-rafael-swell-chute-canyon',
        'grand-gulch-cedar-mesa-canyon',
        'death-valley-cottonwood-marble',
        'escalante-river-baker-canyon',
        'big-bend-mesa-de-anguila',
      ]);
    });

    it('filters routes correctly by canyon terrain', () => {
      const slickrockRoutes = getSlickrockBurroRoutes('slickrock_dry_wash');
      expect(slickrockRoutes).toHaveLength(2);
      expect(slickrockRoutes.map((r) => r.id)).toEqual([
        'san-rafael-swell-chute-canyon',
        'escalante-river-baker-canyon',
      ]);

      const sandRoutes = getSlickrockBurroRoutes('deep_alluvial_sand');
      expect(sandRoutes).toHaveLength(1);
      expect(sandRoutes[0].id).toBe('grand-gulch-cedar-mesa-canyon');

      const cobbleRoutes = getSlickrockBurroRoutes('rugged_cobble_wash');
      expect(cobbleRoutes).toHaveLength(1);
      expect(cobbleRoutes[0].id).toBe('death-valley-cottonwood-marble');

      const limestoneRoutes = getSlickrockBurroRoutes('limestone_scree_bench');
      expect(limestoneRoutes).toHaveLength(1);
      expect(limestoneRoutes[0].id).toBe('big-bend-mesa-de-anguila');
    });
  });

  describe('getSlickrockBurroRouteById', () => {
    it('returns the correct route for each valid ID', () => {
      const chute = getSlickrockBurroRouteById('san-rafael-swell-chute-canyon');
      expect(chute).toBeDefined();
      expect(chute?.title).toBe('San Rafael Swell Chute Canyon & Muddy Creek Traverse');
      expect(chute?.region).toBe('Emery County, Utah, USA');
      expect(chute?.range).toBe('San Rafael Swell');
      expect(chute?.trailDistanceKm).toBe(42);
      expect(chute?.canyonTerrain).toBe('slickrock_dry_wash');
      expect(chute?.waterAvailability).toBe('intermittent_tinaja_pockets');
      expect(chute?.maxAmbientTempC).toBe(38);
      expect(chute?.highlights).toHaveLength(3);

      const grandGulch = getSlickrockBurroRouteById('grand-gulch-cedar-mesa-canyon');
      expect(grandGulch?.canyonTerrain).toBe('deep_alluvial_sand');

      const deathValley = getSlickrockBurroRouteById('death-valley-cottonwood-marble');
      expect(deathValley?.maxAmbientTempC).toBe(44);

      const escalante = getSlickrockBurroRouteById('escalante-river-baker-canyon');
      expect(escalante?.waterAvailability).toBe('perennial_river_corridor');

      const bigBend = getSlickrockBurroRouteById('big-bend-mesa-de-anguila');
      expect(bigBend?.canyonTerrain).toBe('limestone_scree_bench');
    });

    it('returns undefined for nonexistent route IDs', () => {
      expect(getSlickrockBurroRouteById('non-existent-route')).toBeUndefined();
    });
  });

  describe('calculateBurroDynamics', () => {
    it('computes standard dynamics correctly with default parameters', () => {
      const query: BurroDynamicsQuery = {
        routeId: 'san-rafael-swell-chute-canyon',
        terrain: 'slickrock_dry_wash',
        waterSource: 'intermittent_tinaja_pockets',
        hoofProtection: 'neoprene_trail_boots',
        burroCount: 2,
        ambientPeakTempC: 34,
        dailyTrekKm: 18,
        cargoWeightKgPerBurro: 40,
        pannierWeightDeltaKg: 1.2,
      };

      const result = calculateBurroDynamics(query);

      expect(result.routeTitle).toBe('San Rafael Swell Chute Canyon & Muddy Creek Traverse');
      // base water: 15 + (34 - 20) * 0.9 + 18 * 0.45 + 40 * 0.15 = 15 + 12.6 + 8.1 + 6 = 41.7
      expect(result.dailyWaterRequirementLiters).toBe(41.7);
      // slip: 0.35 * 0.65 + (40 / 65) * 0.25 = 0.2275 + 0.1538 = 0.3813 -> 0.38
      expect(result.hoofSlickrockSlipRiskIndex).toBe(0.38);
      // balance score: 100 - (1.2 * 10) = 88.0
      expect(result.pannierBalanceScore).toBe(88.0);
      // Water requirement >= 35.0 -> critical_overload_dehydration_hazard
      expect(result.triageStatus).toBe('critical_overload_dehydration_hazard');
      expect(result.packBalanceAdvisory).toBeDefined();
      expect(result.desertTrekWaterProtocol).toBeDefined();
    });

    it('evaluates optimal conditioned trek status under mild desert conditions', () => {
      const query: BurroDynamicsQuery = {
        routeId: 'escalante-river-baker-canyon',
        terrain: 'deep_alluvial_sand',
        waterSource: 'perennial_river_corridor',
        hoofProtection: 'neoprene_trail_boots',
        burroCount: 2,
        ambientPeakTempC: 20,
        dailyTrekKm: 10,
        cargoWeightKgPerBurro: 20,
        pannierWeightDeltaKg: 0.5,
      };

      const result = calculateBurroDynamics(query);

      // water: 15 + 0 + 4.5 + 3.0 = 22.5 (< 25.0)
      expect(result.dailyWaterRequirementLiters).toBe(22.5);
      // slip: 0.15 * 0.65 + (20 / 65) * 0.25 = 0.0975 + 0.0769 = 0.1744 -> 0.17 (< 0.50)
      expect(result.hoofSlickrockSlipRiskIndex).toBe(0.17);
      // balance: 100 - 5.0 = 95.0 (>= 85.0)
      expect(result.pannierBalanceScore).toBe(95.0);
      expect(result.triageStatus).toBe('optimal_conditioned_trek');
    });

    it('evaluates caution status when water consumption or slip risk is elevated', () => {
      const query: BurroDynamicsQuery = {
        routeId: 'escalante-river-baker-canyon',
        terrain: 'slickrock_dry_wash',
        waterSource: 'spring_fed_potholes',
        hoofProtection: 'neoprene_trail_boots',
        burroCount: 2,
        ambientPeakTempC: 22,
        dailyTrekKm: 12,
        cargoWeightKgPerBurro: 30,
        pannierWeightDeltaKg: 1.0,
      };

      const result = calculateBurroDynamics(query);

      // water: 15 + 2 * 0.9 + 12 * 0.45 + 30 * 0.15 = 15 + 1.8 + 5.4 + 4.5 = 26.7
      expect(result.dailyWaterRequirementLiters).toBe(26.7);
      // Since dailyWaterRequirementLiters >= 25.0 and < 35.0, status is caution
      expect(result.triageStatus).toBe('caution_heat_hydration_strain');
    });

    it('triggers critical status for severe pannier imbalance', () => {
      const query: BurroDynamicsQuery = {
        routeId: 'san-rafael-swell-chute-canyon',
        terrain: 'deep_alluvial_sand',
        waterSource: 'spring_fed_potholes',
        hoofProtection: 'neoprene_trail_boots',
        burroCount: 2,
        ambientPeakTempC: 20,
        dailyTrekKm: 10,
        cargoWeightKgPerBurro: 20,
        pannierWeightDeltaKg: 4.5, // 100 - 45 = 55.0 (< 60.0)
      };

      const result = calculateBurroDynamics(query);

      expect(result.pannierBalanceScore).toBe(55.0);
      expect(result.triageStatus).toBe('critical_overload_dehydration_hazard');
      expect(result.packBalanceAdvisory).toMatch(/CRITICAL IMBALANCE/i);
    });

    it('triggers high slip risk when using steel shoes on slickrock', () => {
      const query: BurroDynamicsQuery = {
        routeId: 'big-bend-mesa-de-anguila',
        terrain: 'limestone_scree_bench', // 0.40
        waterSource: 'seasonal_desert_tinajas',
        hoofProtection: 'steel_shod_cleats', // 1.45
        burroCount: 2,
        ambientPeakTempC: 20,
        dailyTrekKm: 10,
        cargoWeightKgPerBurro: 40,
        pannierWeightDeltaKg: 1.0,
      };

      const result = calculateBurroDynamics(query);

      // 0.40 * 1.45 + (40 / 65) * 0.25 = 0.58 + 0.1538 = 0.73
      expect(result.hoofSlickrockSlipRiskIndex).toBe(0.73);
      expect(result.triageStatus).toBe('caution_heat_hydration_strain');
    });

    it('generates alkali warning protocol when water source is sparse alkali seeps', () => {
      const query: BurroDynamicsQuery = {
        routeId: 'death-valley-cottonwood-marble',
        terrain: 'rugged_cobble_wash',
        waterSource: 'sparse_alkali_seeps',
        hoofProtection: 'barefoot_conditioned',
        burroCount: 2,
        ambientPeakTempC: 42,
        dailyTrekKm: 20,
        cargoWeightKgPerBurro: 45,
        pannierWeightDeltaKg: 1.0,
      };

      const result = calculateBurroDynamics(query);

      expect(result.desertTrekWaterProtocol).toMatch(/ALKALI WARNING/i);
      expect(result.triageStatus).toBe('critical_overload_dehydration_hazard');
    });
  });

  describe('getSlickrockBurroGearChecklist', () => {
    it('returns exactly 6 mandatory gear items with all required fields', () => {
      const checklist = getSlickrockBurroGearChecklist();
      expect(checklist).toHaveLength(6);

      const expectedIds = [
        'sawbuck-pack-saddle-rig',
        'heavy-duty-canvas-panniers',
        'collapsible-desert-water-bladder',
        'protective-equine-trail-boots',
        'hoof-pick-and-rasp-kit',
        'desert-night-hobble-tether',
      ];

      expect(checklist.map((item) => item.id)).toEqual(expectedIds);
      expect(checklist.every((item) => item.mandatory === true)).toBe(true);
      expect(checklist.every((item) => item.name.length > 0)).toBe(true);
      expect(checklist.every((item) => item.description.length > 0)).toBe(true);
    });
  });
});
