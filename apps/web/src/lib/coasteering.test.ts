import { describe, it, expect } from 'vitest';
import {
  getCoasteeringRoutes,
  getCoasteeringRouteById,
  getCoasteeringGear,
  calculateJumpSafety,
  type JumpSafetyQuery,
} from './coasteering';

describe('Coasteering Domain Logic', () => {
  describe('Coasteering Routes Catalog', () => {
    it('returns all 5 iconic coasteering routes', () => {
      const routes = getCoasteeringRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toContain('point-lobos-granite-coves');
      expect(ids).toContain('depoe-bay-spouting-horn-surge');
      expect(ids).toContain('acadia-otter-cliffs-traverse');
      expect(ids).toContain('la-jolla-coves-caves-traverse');
      expect(ids).toContain('cape-flattery-pacific-surge');
    });

    it('filters routes by coasteering grade', () => {
      const grade1 = getCoasteeringRoutes('grade_1_sheltered_cove');
      expect(grade1).toHaveLength(1);
      expect(grade1[0].id).toBe('la-jolla-coves-caves-traverse');

      const grade2 = getCoasteeringRoutes('grade_2_moderate_coastal');
      expect(grade2).toHaveLength(2);
      expect(grade2.map((r) => r.id)).toEqual(
        expect.arrayContaining(['point-lobos-granite-coves', 'acadia-otter-cliffs-traverse'])
      );

      const grade3 = getCoasteeringRoutes('grade_3_advanced_swell');
      expect(grade3).toHaveLength(1);
      expect(grade3[0].id).toBe('depoe-bay-spouting-horn-surge');

      const grade4 = getCoasteeringRoutes('grade_4_extreme_surge');
      expect(grade4).toHaveLength(1);
      expect(grade4[0].id).toBe('cape-flattery-pacific-surge');
    });

    it('finds a route by id', () => {
      const depoe = getCoasteeringRouteById('depoe-bay-spouting-horn-surge');
      expect(depoe).toBeDefined();
      expect(depoe?.title).toBe('Depoe Bay Basalt Cliffs & Spouting Horn');
      expect(depoe?.maxJumpHeightM).toBe(8.0);
      expect(depoe?.seaCaveCount).toBe(3);
      expect(depoe?.coasteeringGrade).toBe('grade_3_advanced_swell');
      expect(depoe?.minWaterDepthM).toBe(5.5);

      const nonexistent = getCoasteeringRouteById('non-existent');
      expect(nonexistent).toBeUndefined();
    });

    it('has accurate specs and highlights for all routes', () => {
      const lobos = getCoasteeringRouteById('point-lobos-granite-coves');
      expect(lobos?.distanceKm).toBe(2.8);
      expect(lobos?.typicalDurationHours).toBe(3.0);
      expect(lobos?.waterTempF).toBe(52);
      expect(lobos?.highlights).toContain('Whalers Cove protected swim exit');

      const cape = getCoasteeringRouteById('cape-flattery-pacific-surge');
      expect(cape?.coasteeringGrade).toBe('grade_4_extreme_surge');
      expect(cape?.maxJumpHeightM).toBe(9.5);
      expect(cape?.seaCaveCount).toBe(5);
      expect(cape?.highlights).toContain('Northwesternmost point of contiguous US');
    });
  });

  describe('Mandatory Coasteering Kit Checklist', () => {
    it('returns the 6 mandatory coasteering gear items', () => {
      const gear = getCoasteeringGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const names = gear.map((g) => g.name);
      expect(
        names.some((n) => n.includes('EN 1385 Certified Watersports Helmet'))
      ).toBe(true);
      expect(
        names.some((n) => n.includes('5/4mm or 4/3mm Heavy-Duty Neoprene Steamer Wetsuit'))
      ).toBe(true);
      expect(
        names.some((n) => n.includes('ISO 12402-5 / USCG Type III 50N+ High-Impact Buoyancy Aid'))
      ).toBe(true);
      expect(
        names.some((n) => n.includes('High-Traction Vibram/Stealth Sticky Rubber'))
      ).toBe(true);
      expect(
        names.some((n) => n.includes('Reinforced 2mm Pre-Curved Neoprene Gloves'))
      ).toBe(true);
      expect(
        names.some((n) => n.includes('15m Floating Water Rescue Throwline'))
      ).toBe(true);
    });
  });

  describe('Swell & Surge Jump Safety Calculator', () => {
    it('calculates safe jump approved conditions when depth is ample and swell is calm', () => {
      const query: JumpSafetyQuery = {
        routeId: 'point-lobos-granite-coves',
        jumpHeightM: 5.0,
        waterDepthM: 6.0,
        swellHeightM: 1.0,
        swellPeriodSeconds: 10,
        tideState: 'rising_flood',
        waterAeratedWithFoam: false,
      };

      const result = calculateJumpSafety(query);

      expect(result.routeTitle).toContain('Point Lobos');
      expect(result.coasteeringGrade).toBe('grade_2_moderate_coastal');
      // Base required depth: 1.5 + 5.0 * 0.5 = 4.0m
      expect(result.minRequiredDepthM).toBe(4.0);
      expect(result.depthMarginM).toBe(2.0);
      expect(result.safetyStatus).toBe('safe_jump_approved');
      expect(result.bodyPositionGuide).toContain('Pencil');
      expect(result.surgeTimingAdvisory).toContain('jump at crest of wave, avoid falling trough');
    });

    it('penalizes water depth for aerated white-water foam due to buoyancy loss', () => {
      const baseQuery: JumpSafetyQuery = {
        routeId: 'acadia-otter-cliffs-traverse',
        jumpHeightM: 5.0,
        waterDepthM: 5.0,
        swellHeightM: 1.0,
        swellPeriodSeconds: 10,
        tideState: 'slack_water',
        waterAeratedWithFoam: false,
      };

      const aeratedQuery: JumpSafetyQuery = {
        ...baseQuery,
        waterAeratedWithFoam: true,
      };

      const baseResult = calculateJumpSafety(baseQuery);
      const aeratedResult = calculateJumpSafety(aeratedQuery);

      expect(aeratedResult.minRequiredDepthM).toBeGreaterThan(baseResult.minRequiredDepthM);
      expect(aeratedResult.depthMarginM).toBeLessThan(baseResult.depthMarginM);
      expect(aeratedResult.aerationImpactNotice).toMatch(/density|buoyancy|foam/i);
    });

    it('identifies critical shallow hazard when water depth is less than required depth', () => {
      const query: JumpSafetyQuery = {
        routeId: 'depoe-bay-spouting-horn-surge',
        jumpHeightM: 8.0,
        waterDepthM: 3.5,
        swellHeightM: 1.0,
        swellPeriodSeconds: 10,
        tideState: 'slack_water',
        waterAeratedWithFoam: false,
      };

      const result = calculateJumpSafety(query);

      expect(result.safetyStatus).toBe('critical_shallow_hazard');
      expect(result.depthMarginM).toBeLessThan(0);
      expect(result.exitRouteAdvisory).toMatch(/DO NOT ENTER|insufficient/i);
    });

    it('issues extreme surge warning when swell height exceeds 2.5m or extreme period combination', () => {
      const query: JumpSafetyQuery = {
        routeId: 'cape-flattery-pacific-surge',
        jumpHeightM: 6.0,
        waterDepthM: 8.0,
        swellHeightM: 2.8,
        swellPeriodSeconds: 16,
        tideState: 'falling_ebb',
        waterAeratedWithFoam: false,
      };

      const result = calculateJumpSafety(query);

      expect(result.safetyStatus).toBe('extreme_surge_warning');
      expect(result.surgeTimingAdvisory).toMatch(/EXTREME SURGE|undertow/i);
    });

    it('advises caution surge timing during falling ebb tide or moderate swell', () => {
      const query: JumpSafetyQuery = {
        routeId: 'point-lobos-granite-coves',
        jumpHeightM: 4.0,
        waterDepthM: 4.5,
        swellHeightM: 1.6,
        swellPeriodSeconds: 12,
        tideState: 'falling_ebb',
        waterAeratedWithFoam: false,
      };

      const result = calculateJumpSafety(query);

      expect(result.safetyStatus).toBe('caution_surge_timing');
      expect(result.surgeTimingAdvisory).toContain('jump at crest of wave, avoid falling trough');
    });

    it('throws an error for unknown routeId', () => {
      const query: JumpSafetyQuery = {
        routeId: 'unknown-route',
        jumpHeightM: 5.0,
        waterDepthM: 5.0,
        swellHeightM: 1.0,
        swellPeriodSeconds: 10,
        tideState: 'slack_water',
        waterAeratedWithFoam: false,
      };

      expect(() => calculateJumpSafety(query)).toThrow(/not found/i);
    });
  });
});
