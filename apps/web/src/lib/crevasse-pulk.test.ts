import { describe, it, expect } from 'vitest';
import {
  getCrevassePulkRoutes,
  getCrevassePulkRouteById,
  calculatePulkDynamics,
  getCrevassePulkGearChecklist,
  type GlacierTerrain,
  type CrevasseRisk,
  type PulkDynamicsQuery,
} from './crevasse-pulk';

describe('crevasse-pulk lib', () => {
  describe('getCrevassePulkRoutes', () => {
    it('returns all 5 iconic routes when no filter is provided', () => {
      const routes = getCrevassePulkRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toEqual([
        'denali-kahiltna-glacier-highway',
        'bagley-icefield-traverse',
        'ruth-gorge-great-gorge-freight',
        'columbia-icefield-athabasca',
        'mount-rainier-ingraham-glacier',
      ]);
    });

    it('filters routes correctly by glacier terrain', () => {
      const terrains: GlacierTerrain[] = [
        'polar_icecap_plateau',
        'crevassed_icefall_labyrinth',
        'moraine_firn_basin',
        'wind_scoured_sastrugi',
        'steep_alpine_headwall',
      ];

      for (const terrain of terrains) {
        const filtered = getCrevassePulkRoutes(terrain);
        expect(filtered.length).toBeGreaterThan(0);
        expect(filtered.every((r) => r.terrain === terrain)).toBe(true);
      }

      expect(getCrevassePulkRoutes('crevassed_icefall_labyrinth')[0].id).toBe(
        'denali-kahiltna-glacier-highway',
      );
      expect(getCrevassePulkRoutes('polar_icecap_plateau')[0].id).toBe(
        'bagley-icefield-traverse',
      );
      expect(getCrevassePulkRoutes('moraine_firn_basin')[0].id).toBe(
        'ruth-gorge-great-gorge-freight',
      );
      expect(getCrevassePulkRoutes('wind_scoured_sastrugi')[0].id).toBe(
        'columbia-icefield-athabasca',
      );
      expect(getCrevassePulkRoutes('steep_alpine_headwall')[0].id).toBe(
        'mount-rainier-ingraham-glacier',
      );
    });

    it('filters routes correctly by crevasse hazard risk', () => {
      const risks: CrevasseRisk[] = ['extreme', 'high', 'moderate'];
      for (const risk of risks) {
        const routes = getCrevassePulkRoutes(undefined, risk);
        expect(routes.every((r) => r.crevassedRisk === risk)).toBe(true);
      }

      const extremeRoutes = getCrevassePulkRoutes(undefined, 'extreme');
      expect(extremeRoutes).toHaveLength(1);
      expect(extremeRoutes[0].id).toBe('mount-rainier-ingraham-glacier');

      const highRoutes = getCrevassePulkRoutes(undefined, 'high');
      expect(highRoutes).toHaveLength(2);
      expect(highRoutes.map((r) => r.id)).toContain('denali-kahiltna-glacier-highway');
      expect(highRoutes.map((r) => r.id)).toContain('columbia-icefield-athabasca');

      const moderateRoutes = getCrevassePulkRoutes(undefined, 'moderate');
      expect(moderateRoutes).toHaveLength(2);
      expect(moderateRoutes.map((r) => r.id)).toContain('bagley-icefield-traverse');
      expect(moderateRoutes.map((r) => r.id)).toContain('ruth-gorge-great-gorge-freight');
    });

    it('filters routes by both terrain and risk simultaneously', () => {
      const filtered = getCrevassePulkRoutes('crevassed_icefall_labyrinth', 'high');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('denali-kahiltna-glacier-highway');

      const nonMatching = getCrevassePulkRoutes('crevassed_icefall_labyrinth', 'low');
      expect(nonMatching).toHaveLength(0);
    });
  });

  describe('getCrevassePulkRouteById', () => {
    it('returns the route object for valid IDs', () => {
      const denali = getCrevassePulkRouteById('denali-kahiltna-glacier-highway');
      expect(denali).toBeDefined();
      expect(denali?.title).toBe('Denali Kahiltna Glacier Pulk Ascent');
      expect(denali?.region).toBe('Alaska Range, Alaska, USA');
      expect(denali?.system).toBe('Kahiltna Glacier Basin');
      expect(denali?.elevationMeters).toBe(2200);
      expect(denali?.averageSlopeDeg).toBe(8.5);
      expect(denali?.crevassedRisk).toBe('high');
      expect(denali?.primaryRigging).toBe('rigid_fiberglass_shaft_harness');
      expect(denali?.terrain).toBe('crevassed_icefall_labyrinth');
      expect(denali?.highlights).toEqual([
        'Heavily crevassed lower icefall maze',
        'Heavy 60kg double-carry expedition loads',
        'Rigid fiberglass shafts preventing downhill sled overrun',
      ]);

      const rainier = getCrevassePulkRouteById('mount-rainier-ingraham-glacier');
      expect(rainier).toBeDefined();
      expect(rainier?.title).toBe('Mount Rainier Ingraham Direct Pulk Staging');
      expect(rainier?.averageSlopeDeg).toBe(16.0);
      expect(rainier?.crevassedRisk).toBe('extreme');
    });

    it('returns undefined for non-existent route IDs', () => {
      expect(getCrevassePulkRouteById('unknown-route')).toBeUndefined();
    });
  });

  describe('calculatePulkDynamics', () => {
    const defaultQuery: PulkDynamicsQuery = {
      routeId: 'denali-kahiltna-glacier-highway',
      riggingSystem: 'rigid_fiberglass_shaft_harness',
      payloadKg: 50,
      haulerWeightKg: 78,
      inclineDegrees: 7,
      snowCondition: 'wind_packed_firn',
      crevasseHazard: 'moderate',
    };

    it('computes exact physics forces and dynamics for baseline defaults', () => {
      const result = calculatePulkDynamics(defaultQuery);

      expect(result.routeTitle).toBe('Denali Kahiltna Glacier Pulk Ascent');
      expect(result.gravityForceNewtons).toBe(60);
      expect(result.frictionForceNewtons).toBe(34);
      expect(result.towForceNewtons).toBe(94);
      expect(result.downhillOverrunJoules).toBe(190);
      expect(result.crevasseArrestForceKiloNewtons).toBe(0.78);
      expect(result.arrestSafety).toBe('nominal_dynamic_hold');
      expect(result.riggingAdvisory).toBeDefined();
      expect(result.crevasseExtractionProtocol).toBeDefined();
    });

    it('calculates friction accurately across all snow and ice conditions', () => {
      const blueIceResult = calculatePulkDynamics({
        ...defaultQuery,
        snowCondition: 'hard_blue_ice',
      });
      expect(blueIceResult.frictionForceNewtons).toBe(19);
      expect(blueIceResult.towForceNewtons).toBe(60 + 19);

      const powderResult = calculatePulkDynamics({
        ...defaultQuery,
        snowCondition: 'deep_unconsolidated_powder',
      });
      expect(powderResult.frictionForceNewtons).toBe(78);
      expect(powderResult.towForceNewtons).toBe(60 + 78);

      const slushResult = calculatePulkDynamics({
        ...defaultQuery,
        snowCondition: 'wet_heavy_slush',
      });
      expect(slushResult.frictionForceNewtons).toBe(107);
      expect(slushResult.towForceNewtons).toBe(60 + 107);
    });

    it('triggers critical_arrest_failure_alert when incline > 14 deg and rigging is not rigid shafts', () => {
      const result = calculatePulkDynamics({
        ...defaultQuery,
        inclineDegrees: 16,
        riggingSystem: 'rope_trace_with_brake_fin',
      });

      expect(result.arrestSafety).toBe('critical_arrest_failure_alert');
      expect(result.riggingAdvisory.toLowerCase()).toContain('rigid');
      expect(result.crevasseExtractionProtocol.toLowerCase()).toContain('anchor');
    });

    it('triggers caution_overrun_risk when payload > 70 kg and crevasse hazard is extreme', () => {
      const result = calculatePulkDynamics({
        ...defaultQuery,
        payloadKg: 85,
        crevasseHazard: 'extreme',
        inclineDegrees: 10,
        riggingSystem: 'rigid_fiberglass_shaft_harness',
      });

      expect(result.arrestSafety).toBe('caution_overrun_risk');
      expect(result.riggingAdvisory.toLowerCase()).toContain('caution');
    });

    it('remains nominal_dynamic_hold when steep incline uses rigid fiberglass shaft harness', () => {
      const result = calculatePulkDynamics({
        ...defaultQuery,
        inclineDegrees: 18,
        riggingSystem: 'rigid_fiberglass_shaft_harness',
        payloadKg: 60,
        crevasseHazard: 'high',
      });

      expect(result.arrestSafety).toBe('nominal_dynamic_hold');
    });

    it('provides fallback routeTitle when unknown routeId is supplied', () => {
      const result = calculatePulkDynamics({
        ...defaultQuery,
        routeId: 'unknown-glacial-route',
      });

      expect(result.routeTitle).toBe('Glacial Haul Route');
    });
  });

  describe('getCrevassePulkGearChecklist', () => {
    it('returns all 6 mandatory expedition gear items', () => {
      const gear = getCrevassePulkGearChecklist();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory === true)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toEqual([
        'reinforced-uhmwpe-expedition-pulk',
        'rigid-fiberglass-crossover-shafts',
        'downhill-trailing-rope-brake',
        'crevasse-arrest-prussik-haul-rig',
        'dual-directional-crevasse-fluke',
        'sub-zero-sled-lashing-cover',
      ]);

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('pulk');
      expect(categories).toContain('harness');
      expect(categories).toContain('braking');
      expect(categories).toContain('crevasse_safety');
      expect(categories).toContain('anchors');
      expect(categories).toContain('storage');
    });
  });
});
