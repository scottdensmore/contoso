import { describe, it, expect } from 'vitest';
import {
  getPotholeCanyonRoutes,
  getPotholeCanyonRouteById,
  getPotholeGearChecklist,
  calculatePotholeDynamics,
  type PotholeDynamicsQuery,
} from './pothole-escape';

describe('Pothole Escape Domain Logic', () => {
  describe('Pothole Canyon Routes Catalog', () => {
    it('returns all 5 iconic technical pothole routes', () => {
      const routes = getPotholeCanyonRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toContain('neon-canyon-golden-cathedral');
      expect(ids).toContain('choprock-canyon-keepers');
      expect(ids).toContain('black-hole-white-canyon');
      expect(ids).toContain('imlay-canyon-sneffels');
      expect(ids).toContain('heaps-canyon-emerald-pools');
    });

    it('filters routes by primary escape technique', () => {
      const sandtrapRoutes = getPotholeCanyonRoutes('sandtrap_ghost_anchor');
      expect(sandtrapRoutes).toHaveLength(2);
      expect(sandtrapRoutes.map((r) => r.id)).toEqual(
        expect.arrayContaining(['neon-canyon-golden-cathedral', 'heaps-canyon-emerald-pools'])
      );

      const hookRoutes = getPotholeCanyonRoutes('pot_hole_escape_hook');
      expect(hookRoutes).toHaveLength(1);
      expect(hookRoutes[0].id).toBe('choprock-canyon-keepers');

      const packTossRoutes = getPotholeCanyonRoutes('water_anchor_pack_toss');
      expect(packTossRoutes).toHaveLength(1);
      expect(packTossRoutes[0].id).toBe('black-hole-white-canyon');

      const cheaterStickRoutes = getPotholeCanyonRoutes('cheater_stick_reach');
      expect(cheaterStickRoutes).toHaveLength(1);
      expect(cheaterStickRoutes[0].id).toBe('imlay-canyon-sneffels');
    });

    it('retrieves a canyon route by id', () => {
      const neon = getPotholeCanyonRouteById('neon-canyon-golden-cathedral');
      expect(neon).toBeDefined();
      expect(neon?.title).toBe('Neon Canyon & The Golden Cathedral Keeper Potholes');
      expect(neon?.region).toBe('Escalante, Utah, USA');
      expect(neon?.depthMeters).toBe(45);
      expect(neon?.primaryTechnique).toBe('sandtrap_ghost_anchor');
      expect(neon?.lipFrictionAngleDegrees).toBe(65);
      expect(neon?.typicalWaterLevel).toBe('semi_swimming_keeper');
      expect(neon?.highlights).toContain('SandTrap ghost anchor retrievable rigging');

      const nonexistent = getPotholeCanyonRouteById('non-existent');
      expect(nonexistent).toBeUndefined();
    });

    it('accurately verifies specs of all 5 routes', () => {
      const choprock = getPotholeCanyonRouteById('choprock-canyon-keepers');
      expect(choprock?.depthMeters).toBe(55);
      expect(choprock?.primaryTechnique).toBe('pot_hole_escape_hook');
      expect(choprock?.typicalWaterLevel).toBe('deep_swimming_keeper');

      const blackHole = getPotholeCanyonRouteById('black-hole-white-canyon');
      expect(blackHole?.depthMeters).toBe(30);
      expect(blackHole?.primaryTechnique).toBe('water_anchor_pack_toss');
      expect(blackHole?.typicalWaterLevel).toBe('flooded_swimming_flume');

      const imlay = getPotholeCanyonRouteById('imlay-canyon-sneffels');
      expect(imlay?.depthMeters).toBe(90);
      expect(imlay?.primaryTechnique).toBe('cheater_stick_reach');
      expect(imlay?.typicalWaterLevel).toBe('bone_dry_scour');

      const heaps = getPotholeCanyonRouteById('heaps-canyon-emerald-pools');
      expect(heaps?.depthMeters).toBe(140);
      expect(heaps?.lipFrictionAngleDegrees).toBe(85);
    });
  });

  describe('Technical Pothole Escape Gear Checklist', () => {
    it('returns the 6 mandatory technical gear items', () => {
      const gear = getPotholeGearChecklist();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('sandtrap-ghosting-anchor');
      expect(ids).toContain('telescoping-cheater-stick');
      expect(ids).toContain('talon-pothole-escape-hooks');
      expect(ids).toContain('water-pack-toss-cord');
      expect(ids).toContain('foot-stirrup-etrier');
      expect(ids).toContain('full-neoprene-wetsuit');

      const sandtrap = gear.find((g) => g.id === 'sandtrap-ghosting-anchor');
      expect(sandtrap?.category).toBe('anchors');
      expect(sandtrap?.name).toBe('Retrievable SandTrap Canyoneering Anchor Fabric Bag');

      const suit = gear.find((g) => g.id === 'full-neoprene-wetsuit');
      expect(suit?.category).toBe('thermal');
    });
  });

  describe('Pothole Dynamics Calculation', () => {
    it('calculates dynamics for default parameters accurately', () => {
      const query: PotholeDynamicsQuery = {
        routeId: 'neon-canyon-golden-cathedral',
        technique: 'sandtrap_ghost_anchor',
        waterLevel: 'semi_swimming_keeper',
        wallWetness: 'damp_sandstone',
        teamSize: 3,
        leadClimberWeightKg: 75,
        lipHeightMeters: 3.0,
        inclineAngleDegrees: 70,
      };

      const result = calculatePotholeDynamics(query);

      expect(result.routeTitle).toBe('Neon Canyon & The Golden Cathedral Keeper Potholes');
      // base_gravity = 75 * 9.81 * sin(70 deg) = 691.38
      // friction_mult = 0.85 (damp_sandstone)
      // water_drag = 1.25 (semi_swimming_keeper)
      // effectiveHoistForceN = round(691.38 * 0.85 * 1.25) = round(734.59) = 735
      expect(result.effectiveHoistForceN).toBe(735);

      // packCounterweightKg = round((735 / 9.81) * 0.75 * 10) / 10 = round(561.9) / 10 = 56.2
      expect(result.packCounterweightKg).toBe(56.2);

      // base_difficulty = (3.0 / 6.0) * 0.4 + (70 / 90.0) * 0.3 + (1.25 - 1.0) * 0.5 = 0.2 + 0.2333 + 0.125 = 0.5583 -> 0.56
      expect(result.escapeDifficultyIndex).toBe(0.56);

      // 0.56 >= 0.45 -> caution_technical_hook_required
      expect(result.safetyStatus).toBe('caution_technical_hook_required');
      expect(result.anchorRetrievalAdvisory).toContain('SandTrap');
      expect(result.tacticalEscapeProtocol).toBeDefined();
    });

    it('identifies critical keeper trap hazard for flooded water flume', () => {
      const query: PotholeDynamicsQuery = {
        routeId: 'black-hole-white-canyon',
        technique: 'water_anchor_pack_toss',
        waterLevel: 'flooded_swimming_flume',
        wallWetness: 'slippery_algae_scum',
        teamSize: 4,
        leadClimberWeightKg: 85,
        lipHeightMeters: 4.0,
        inclineAngleDegrees: 80,
      };

      const result = calculatePotholeDynamics(query);
      expect(result.safetyStatus).toBe('critical_keeper_trap_hazard');
      expect(result.tacticalEscapeProtocol).toContain('CRITICAL');
    });

    it('identifies critical hazard when lip height >= 4.5m', () => {
      const query: PotholeDynamicsQuery = {
        routeId: 'imlay-canyon-sneffels',
        technique: 'cheater_stick_reach',
        waterLevel: 'bone_dry_scour',
        wallWetness: 'dry_slickrock',
        teamSize: 3,
        leadClimberWeightKg: 70,
        lipHeightMeters: 5.0,
        inclineAngleDegrees: 60,
      };

      const result = calculatePotholeDynamics(query);
      expect(result.safetyStatus).toBe('critical_keeper_trap_hazard');
    });

    it('identifies nominal partner boost when conditions are dry and low lip', () => {
      const query: PotholeDynamicsQuery = {
        routeId: 'imlay-canyon-sneffels',
        technique: 'sandtrap_ghost_anchor',
        waterLevel: 'bone_dry_scour',
        wallWetness: 'dry_slickrock',
        teamSize: 4,
        leadClimberWeightKg: 60,
        lipHeightMeters: 1.5,
        inclineAngleDegrees: 45,
      };

      const result = calculatePotholeDynamics(query);
      expect(result.safetyStatus).toBe('nominal_partner_boost');
      expect(result.tacticalEscapeProtocol).toContain('PARTNER BOOST');
    });

    it('identifies caution when pot_hole_escape_hook technique is used', () => {
      const query: PotholeDynamicsQuery = {
        routeId: 'choprock-canyon-keepers',
        technique: 'pot_hole_escape_hook',
        waterLevel: 'bone_dry_scour',
        wallWetness: 'dry_slickrock',
        teamSize: 3,
        leadClimberWeightKg: 60,
        lipHeightMeters: 1.5,
        inclineAngleDegrees: 45,
      };

      const result = calculatePotholeDynamics(query);
      expect(result.safetyStatus).toBe('caution_technical_hook_required');
    });

    it('handles fallback when route id is unknown', () => {
      const query: PotholeDynamicsQuery = {
        routeId: 'unknown-slot',
        technique: 'sandtrap_ghost_anchor',
        waterLevel: 'semi_swimming_keeper',
        wallWetness: 'damp_sandstone',
        teamSize: 3,
        leadClimberWeightKg: 75,
        lipHeightMeters: 3.0,
        inclineAngleDegrees: 70,
      };

      const result = calculatePotholeDynamics(query);
      expect(result.routeTitle).toBe('Technical Pothole Route');
    });
  });
});
