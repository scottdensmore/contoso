import { describe, it, expect } from 'vitest';
import {
  getDogsledRoutes,
  getDogsledRouteById,
  calculateMushingPacing,
  getDogsledGear,
  type MushingPacingQuery,
} from './dogsledding';

describe('dogsledding library', () => {
  describe('getDogsledRoutes', () => {
    it('returns all 5 iconic dogsled routes with required properties', () => {
      const routes = getDogsledRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toEqual([
        'iditarod-historic-trail-traverse',
        'boundary-waters-quetico-run',
        'yukon-quest-eagle-summit',
        'denali-sanctuary-river-patrol',
        'maine-north-woods-allagash',
      ]);

      for (const route of routes) {
        expect(route.id).toBeTruthy();
        expect(route.title).toBeTruthy();
        expect(route.region).toBeTruthy();
        expect(route.distanceKm).toBeGreaterThan(0);
        expect(route.typicalDurationDays).toBeGreaterThan(0);
        expect(['beginner', 'intermediate', 'advanced', 'expedition_extreme']).toContain(
          route.difficulty
        );
        expect([
          'groomed_hardpack',
          'frozen_lake_hardpack',
          'river_ice_and_powder',
          'glare_ice_jumble',
          'windblown_tundra_sea_ice',
        ]).toContain(route.trailSurface);
        expect(route.recommendedTeamSize).toBeGreaterThan(0);
        expect(route.minRestRatio).toBeGreaterThan(0);
        expect(typeof route.lowTempRecordF).toBe('number');
        expect(route.description).toBeTruthy();
        expect(route.highlights.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('returns detailed metadata for Iditarod and Yukon Quest', () => {
      const iditarod = getDogsledRouteById('iditarod-historic-trail-traverse');
      expect(iditarod).toBeDefined();
      expect(iditarod?.title).toBe('Iditarod National Historic Trail Mushing Traverse');
      expect(iditarod?.region).toBe('Seward to Nome, AK');
      expect(iditarod?.distanceKm).toBe(1560);
      expect(iditarod?.typicalDurationDays).toBe(11);
      expect(iditarod?.difficulty).toBe('expedition_extreme');
      expect(iditarod?.trailSurface).toBe('windblown_tundra_sea_ice');
      expect(iditarod?.recommendedTeamSize).toBe(14);
      expect(iditarod?.minRestRatio).toBe(1.0);
      expect(iditarod?.lowTempRecordF).toBe(-55);
      expect(iditarod?.highlights).toContain('Rainy Pass mountain divide');
      expect(iditarod?.highlights).toContain('Yukon River frozen ice highway');
      expect(iditarod?.highlights).toContain('Norton Sound sea ice ground blizzards');

      const yukon = getDogsledRouteById('yukon-quest-eagle-summit');
      expect(yukon).toBeDefined();
      expect(yukon?.title).toBe('Yukon Quest Eagle Summit Alpine Crossing');
      expect(yukon?.difficulty).toBe('advanced');
      expect(yukon?.trailSurface).toBe('glare_ice_jumble');
      expect(yukon?.distanceKm).toBe(480);
      expect(yukon?.lowTempRecordF).toBe(-60);
    });

    it('filters routes by difficulty level', () => {
      const beginner = getDogsledRoutes('beginner');
      expect(beginner.map((r) => r.id)).toEqual(['maine-north-woods-allagash']);

      const intermediate = getDogsledRoutes('intermediate');
      expect(intermediate.map((r) => r.id)).toEqual([
        'boundary-waters-quetico-run',
        'denali-sanctuary-river-patrol',
      ]);

      const advanced = getDogsledRoutes('advanced');
      expect(advanced.map((r) => r.id)).toEqual(['yukon-quest-eagle-summit']);

      const extreme = getDogsledRoutes('expedition_extreme');
      expect(extreme.map((r) => r.id)).toEqual(['iditarod-historic-trail-traverse']);
    });
  });

  describe('getDogsledRouteById', () => {
    it('returns undefined when route ID does not exist', () => {
      expect(getDogsledRouteById('non-existent-trail')).toBeUndefined();
    });
  });

  describe('calculateMushingPacing', () => {
    it('calculates optimal pacing, calories, water, and rest for standard conditions', () => {
      const query: MushingPacingQuery = {
        routeId: 'maine-north-woods-allagash',
        teamDogCount: 8,
        ambientTempF: -10,
        cargoWeightKg: 65,
        dailyRunHours: 6,
        trailSurface: 'groomed_hardpack',
      };

      const result = calculateMushingPacing(query);
      expect(result.routeTitle).toBe('Allagash Wilderness Waterway Winter Trail');
      expect(result.effectiveSpeedKmh).toBe(15.0);
      expect(result.dailyDistanceKm).toBe(90.0);
      expect(result.dogCaloriesPerDay).toBe(7350);
      expect(result.teamTotalCaloriesPerDay).toBe(58800);
      expect(result.totalMeltWaterLiters).toBe(32.0);
      expect(result.recommendedRestHours).toBe(4.2);
      expect(result.requiredBootieCount).toBe(128);
      expect(result.safetyStatus).toBe('optimal');
      expect(result.trailAdvisory).toBeTruthy();
    });

    it('applies modifiers for surface type, overload weight, and extreme cold', () => {
      const query: MushingPacingQuery = {
        routeId: 'yukon-quest-eagle-summit',
        teamDogCount: 6,
        ambientTempF: -45,
        cargoWeightKg: 200,
        dailyRunHours: 8,
        trailSurface: 'glare_ice_jumble',
      };

      const result = calculateMushingPacing(query);
      expect(result.effectiveSpeedKmh).toBe(8.4);
      expect(result.dailyDistanceKm).toBe(Math.round(8.4 * 8 * 10) / 10);
      expect(result.safetyStatus).toBe('caution');
    });

    it('flags critical hazard when temperature is severely cold (< -45°F)', () => {
      const query: MushingPacingQuery = {
        routeId: 'iditarod-historic-trail-traverse',
        teamDogCount: 14,
        ambientTempF: -50,
        cargoWeightKg: 100,
        dailyRunHours: 8,
        trailSurface: 'windblown_tundra_sea_ice',
      };

      const result = calculateMushingPacing(query);
      expect(result.safetyStatus).toBe('critical_hazard');
      expect(result.trailAdvisory).toMatch(/critical|extreme|frostbite|freeze/i);
    });

    it('flags critical hazard when temperature is too warm (> 25°F) causing hyperthermia risk', () => {
      const query: MushingPacingQuery = {
        routeId: 'maine-north-woods-allagash',
        teamDogCount: 6,
        ambientTempF: 30,
        cargoWeightKg: 50,
        dailyRunHours: 4,
        trailSurface: 'groomed_hardpack',
      };

      const result = calculateMushingPacing(query);
      expect(result.safetyStatus).toBe('critical_hazard');
      expect(result.trailAdvisory).toMatch(/overheating|hyperthermia|warm/i);
    });

    it('flags critical hazard when cargo weight exceeds 1.5x dog capacity', () => {
      const query: MushingPacingQuery = {
        routeId: 'boundary-waters-quetico-run',
        teamDogCount: 4,
        ambientTempF: 0,
        cargoWeightKg: 160,
        dailyRunHours: 5,
        trailSurface: 'frozen_lake_hardpack',
      };

      const result = calculateMushingPacing(query);
      expect(result.safetyStatus).toBe('critical_hazard');
      expect(result.trailAdvisory).toMatch(/capacity|overload|cargo/i);
    });

    it('flags caution when conditions are challenging (-30°F, glare ice, or > 10 hours)', () => {
      const query: MushingPacingQuery = {
        routeId: 'iditarod-historic-trail-traverse',
        teamDogCount: 10,
        ambientTempF: -30,
        cargoWeightKg: 100,
        dailyRunHours: 6,
        trailSurface: 'windblown_tundra_sea_ice',
      };

      const result = calculateMushingPacing(query);
      expect(result.safetyStatus).toBe('caution');
    });

    it('falls back gracefully when routeId is unknown', () => {
      const query: MushingPacingQuery = {
        routeId: 'unknown-route',
        teamDogCount: 8,
        ambientTempF: 0,
        cargoWeightKg: 50,
        dailyRunHours: 6,
        trailSurface: 'groomed_hardpack',
      };

      const result = calculateMushingPacing(query);
      expect(result.routeTitle).toBe('Custom Wilderness Trail');
      expect(result.effectiveSpeedKmh).toBe(15.0);
    });
  });

  describe('getDogsledGear', () => {
    it('returns all 6 mandatory items for Mushing & Dog Welfare Kit', () => {
      const gear = getDogsledGear();
      expect(gear).toHaveLength(6);

      const mandatoryCount = gear.filter((g) => g.mandatory).length;
      expect(mandatoryCount).toBe(6);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('dog-protective-booties');
      expect(ids).toContain('dual-claw-snow-hook');
      expect(ids).toContain('aircraft-cable-gangline');
      expect(ids).toContain('arctic-cooker-melt-pot');
      expect(ids).toContain('high-fat-canine-rations');
      expect(ids).toContain('musher-subzero-bivy-parka');

      for (const item of gear) {
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect([
          'dog_welfare',
          'sled_anchors',
          'rigging_harness',
          'feeding_cooker',
          'nutrition',
          'musher_survival',
        ]).toContain(item.category);
      }
    });
  });
});
