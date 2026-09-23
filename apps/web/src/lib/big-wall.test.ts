import { describe, it, expect } from 'vitest';
import {
  getBigWallRoutes,
  getBigWallRouteById,
  getBigWallGear,
  calculateHaulEffort,
  type HaulCalculationQuery,
} from './big-wall';

describe('Alpine Big Wall Aid Climbing & Portaledge Systems Domain Logic', () => {
  describe('Big Wall Routes Catalog', () => {
    it('returns all 5 iconic big wall routes', () => {
      const routes = getBigWallRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toEqual([
        'el-capitan-nose',
        'half-dome-regular-northwest',
        'fisher-towers-titan',
        'zion-prodigal-son',
        'leaning-tower-west-face',
      ]);
    });

    it('filters routes by aid rating correctly', () => {
      const c1Routes = getBigWallRoutes('C1');
      expect(c1Routes).toHaveLength(1);
      expect(c1Routes[0].id).toBe('half-dome-regular-northwest');
      expect(c1Routes[0].grade).toBe('Grade VI 5.9 C1');

      const c2Routes = getBigWallRoutes('C2');
      expect(c2Routes).toHaveLength(2);
      const c2Ids = c2Routes.map((r) => r.id);
      expect(c2Ids).toContain('el-capitan-nose');
      expect(c2Ids).toContain('zion-prodigal-son');

      const a2PlusRoutes = getBigWallRoutes('A2+');
      expect(a2PlusRoutes).toHaveLength(1);
      expect(a2PlusRoutes[0].id).toBe('fisher-towers-titan');

      const c2fRoutes = getBigWallRoutes('C2F');
      expect(c2fRoutes).toHaveLength(1);
      expect(c2fRoutes[0].id).toBe('leaning-tower-west-face');

      const c3Routes = getBigWallRoutes('C3');
      expect(c3Routes).toHaveLength(0);
    });

    it('finds a route by id with exact specifications', () => {
      const nose = getBigWallRouteById('el-capitan-nose');
      expect(nose).toBeDefined();
      expect(nose?.name).toBe('The Nose — El Capitan');
      expect(nose?.location).toBe('Yosemite Valley, CA');
      expect(nose?.grade).toBe('Grade VI 5.9 C2');
      expect(nose?.aidRating).toBe('C2');
      expect(nose?.pitches).toBe(31);
      expect(nose?.heightMeters).toBe(1000);
      expect(nose?.recommendedDays).toBe(4);
      expect(nose?.typicalPigWeightKg).toBe(85);
      expect(nose?.description).toContain('Boot Flake');
      expect(nose?.highlights).toContain('King Swing pendulum');

      const titan = getBigWallRouteById('fisher-towers-titan');
      expect(titan).toBeDefined();
      expect(titan?.name).toBe('The Titan — Finger of Fate');
      expect(titan?.aidRating).toBe('A2+');

      const nonExistent = getBigWallRouteById('non-existent-route');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('Mandatory Big Wall Safety Kit Checklist', () => {
    it('returns all 6 mandatory big wall gear items', () => {
      const gear = getBigWallGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toEqual([
        'full-portaledge-storm-fly',
        'progress-capture-hauling-pulley',
        'adjustable-daisy-chains-etriers',
        'beak-and-cam-hook-set',
        'haul-bag-pig-dry-containment',
        'aluminum-waste-haul-tube',
      ]);

      const portaledge = gear.find((g) => g.id === 'full-portaledge-storm-fly');
      expect(portaledge?.category).toBe('portaledge');
      expect(portaledge?.name).toContain('Expedition Portaledge');

      const wasteTube = gear.find((g) => g.id === 'aluminum-waste-haul-tube');
      expect(wasteTube?.category).toBe('waste_ethics');
      expect(wasteTube?.description).toContain('zero-trace cliff ethics');
    });
  });

  describe('Haul Effort & System Calculator Physics', () => {
    it('calculates haul effort for 1:1 direct system on vertical wall', () => {
      const query: HaulCalculationQuery = {
        routeId: 'el-capitan-nose',
        pigWeightKg: 85,
        haulSystem: '1:1_direct',
        wallAngle: 'vertical',
        climberWeightKg: 75,
      };

      const result = calculateHaulEffort(query);

      expect(result.routeName).toBe('The Nose — El Capitan');
      expect(result.mechanicalAdvantageRatio).toBe(1.0);
      expect(result.frictionCoefficient).toBe(0.15);
      // (85 * 1.15) / 0.90 = 97.75 / 0.90 = 108.611... -> 108.6 kg
      expect(result.effectivePullForceKg).toBe(108.6);
      expect(result.counterweightSufficient).toBe(false);
      expect(result.haulEffortLevel).toBe('extreme_two_person');
      expect(result.safetyWarning).toContain(
        'Effective pull force exceeds climber bodyweight! 2:1 or 3:1 mechanical advantage or 2-person space-hauling counterweight required to prevent haul-line stall.'
      );
    });

    it('calculates haul effort for 3:1 Z-pulley system on vertical wall', () => {
      const query: HaulCalculationQuery = {
        routeId: 'el-capitan-nose',
        pigWeightKg: 85,
        haulSystem: '3:1_z_rig',
        wallAngle: 'vertical',
        climberWeightKg: 75,
      };

      const result = calculateHaulEffort(query);

      expect(result.mechanicalAdvantageRatio).toBe(3.0);
      expect(result.frictionCoefficient).toBe(0.15);
      // (85 * 1.15) / 2.40 = 97.75 / 2.40 = 40.729... -> 40.7 kg
      expect(result.effectivePullForceKg).toBe(40.7);
      expect(result.counterweightSufficient).toBe(true);
      expect(result.haulEffortLevel).toBe('moderate');
      expect(result.safetyWarning).toBeUndefined();
    });

    it('calculates haul effort for 2:1 mechanical advantage system', () => {
      const query: HaulCalculationQuery = {
        routeId: 'half-dome-regular-northwest',
        pigWeightKg: 55,
        haulSystem: '2:1_mechanical_advantage',
        wallAngle: 'vertical',
        climberWeightKg: 70,
      };

      const result = calculateHaulEffort(query);

      expect(result.mechanicalAdvantageRatio).toBe(2.0);
      expect(result.frictionCoefficient).toBe(0.15);
      // (55 * 1.15) / 1.70 = 63.25 / 1.70 = 37.205... -> 37.2 kg
      expect(result.effectivePullForceKg).toBe(37.2);
      expect(result.counterweightSufficient).toBe(true);
      expect(result.haulEffortLevel).toBe('moderate');
    });

    it('handles slab wall angle with friction 0.35 and issues slab warning', () => {
      const query: HaulCalculationQuery = {
        routeId: 'zion-prodigal-son',
        pigWeightKg: 50,
        haulSystem: '2:1_mechanical_advantage',
        wallAngle: 'slab',
        climberWeightKg: 75,
      };

      const result = calculateHaulEffort(query);

      expect(result.frictionCoefficient).toBe(0.35);
      // (50 * 1.35) / 1.70 = 67.5 / 1.70 = 39.705... -> 39.7 kg
      expect(result.effectivePullForceKg).toBe(39.7);
      expect(result.safetyWarning).toContain(
        'Heavy bag dragging on slab generates extreme abrasion; use haul bag swivel and wear-guard sleeves.'
      );
    });

    it('handles overhanging wall angle with friction 0.02', () => {
      const query: HaulCalculationQuery = {
        routeId: 'leaning-tower-west-face',
        pigWeightKg: 60,
        haulSystem: '2:1_mechanical_advantage',
        wallAngle: 'overhanging',
        climberWeightKg: 75,
      };

      const result = calculateHaulEffort(query);

      expect(result.frictionCoefficient).toBe(0.02);
      // (60 * 1.02) / 1.70 = 61.2 / 1.70 = 36.0 kg
      expect(result.effectivePullForceKg).toBe(36.0);
    });

    it('handles roof wall angle with friction 0.0', () => {
      const query: HaulCalculationQuery = {
        routeId: 'fisher-towers-titan',
        pigWeightKg: 45,
        haulSystem: '3:1_z_rig',
        wallAngle: 'roof',
        climberWeightKg: 75,
      };

      const result = calculateHaulEffort(query);

      expect(result.frictionCoefficient).toBe(0.0);
      // (45 * 1.0) / 2.40 = 18.75 -> 18.8 kg
      expect(result.effectivePullForceKg).toBe(18.8);
      expect(result.haulEffortLevel).toBe('low');
    });

    it('warns when pig weight exceeds 100 kg', () => {
      const query: HaulCalculationQuery = {
        routeId: 'el-capitan-nose',
        pigWeightKg: 120,
        haulSystem: '3:1_z_rig',
        wallAngle: 'vertical',
        climberWeightKg: 80,
      };

      const result = calculateHaulEffort(query);

      expect(result.safetyWarning).toContain(
        'Expedition double-pig load: separate into two hauls or use 3:1 Z-pulley with mechanical ascender foot-pumping.'
      );
    });

    it('combines multiple safety warnings when applicable', () => {
      const query: HaulCalculationQuery = {
        routeId: 'el-capitan-nose',
        pigWeightKg: 130,
        haulSystem: '1:1_direct',
        wallAngle: 'slab',
        climberWeightKg: 60,
      };

      const result = calculateHaulEffort(query);

      expect(result.safetyWarning).toContain('Effective pull force exceeds climber bodyweight');
      expect(result.safetyWarning).toContain('Heavy bag dragging on slab');
      expect(result.safetyWarning).toContain('Expedition double-pig load');
    });

    it('throws error when routeId is not found', () => {
      const query: HaulCalculationQuery = {
        routeId: 'invalid-route',
        pigWeightKg: 85,
        haulSystem: '1:1_direct',
        wallAngle: 'vertical',
        climberWeightKg: 75,
      };

      expect(() => calculateHaulEffort(query)).toThrow(
        'Big wall route with id "invalid-route" not found.'
      );
    });
  });
});
