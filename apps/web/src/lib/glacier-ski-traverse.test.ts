import { describe, it, expect } from 'vitest';
import {
  GLACIER_SKI_TRAVERSE_SITES,
  GLACIER_SKI_TRAVERSE_GEAR_CHECKLIST,
  getGlacierSkiTraverseSites,
  getGlacierSkiTraverseSiteById,
  getGlacierSkiTraverseGearChecklist,
  calculateGlacierSkiTraverseDynamics,
} from './glacier-ski-traverse';

describe('glacier-ski-traverse domain library', () => {
  describe('GLACIER_SKI_TRAVERSE_SITES', () => {
    it('contains exactly 5 iconic alpine glacier ski traverse sites', () => {
      expect(GLACIER_SKI_TRAVERSE_SITES).toHaveLength(5);
      const ids = GLACIER_SKI_TRAVERSE_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'haute-route-chamonix-zermatt',
        'spearhead-traverse-whistler',
        'wapta-traverse-canadian-rockies',
        'berner-oberland-ski-traverse',
        'wrangell-st-elias-bagley-icefield',
      ]);
    });

    it('ensures each site has valid geographic and logistical attributes', () => {
      for (const site of GLACIER_SKI_TRAVERSE_SITES) {
        expect(site.id).toBeTruthy();
        expect(site.title).toBeTruthy();
        expect(site.region).toBeTruthy();
        expect(site.range).toBeTruthy();
        expect(site.elevationMeters).toBeGreaterThan(1500);
        expect(site.dominantZone).toBeTruthy();
        expect(site.bridgeStability).toBeTruthy();
        expect(site.defaultProtocol).toBeTruthy();
        expect(site.description.length).toBeGreaterThan(20);
        expect(site.highlights.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('GLACIER_SKI_TRAVERSE_GEAR_CHECKLIST', () => {
    it('contains exactly 6 mandatory glacier skimo rescue gear items', () => {
      expect(GLACIER_SKI_TRAVERSE_GEAR_CHECKLIST).toHaveLength(6);
      const expectedIds = [
        'glacier-skimo-harness-with-ski-slots',
        'lightweight-hyperstatic-crevasse-rescue-cord',
        'ultra-compact-ski-crevasse-pulley-progress-capture',
        'titanium-tech-ski-crampons-ski-mountaineering',
        'ski-tail-anchor-snow-picket-system',
        'collapsible-avalanche-crevasse-probe-320cm',
      ];
      expect(GLACIER_SKI_TRAVERSE_GEAR_CHECKLIST.map((g) => g.id)).toEqual(expectedIds);
      expect(GLACIER_SKI_TRAVERSE_GEAR_CHECKLIST.every((g) => g.mandatory)).toBe(true);
    });

    it('covers all designated gear categories', () => {
      const categories = GLACIER_SKI_TRAVERSE_GEAR_CHECKLIST.map((g) => g.category);
      expect(categories).toContain('harness_rigging');
      expect(categories).toContain('rescue_rope');
      expect(categories).toContain('pulley_capture');
      expect(categories).toContain('traction');
      expect(categories).toContain('snow_anchor');
      expect(categories).toContain('probe');
    });
  });

  describe('query helpers', () => {
    it('filters sites by terrain zone', () => {
      const allSites = getGlacierSkiTraverseSites();
      expect(allSites).toHaveLength(5);

      const seracSites = getGlacierSkiTraverseSites('compressed_icefall_serac_corridor');
      expect(seracSites).toHaveLength(1);
      expect(seracSites[0].id).toBe('berner-oberland-ski-traverse');

      const bergschrundSites = getGlacierSkiTraverseSites('bergschrund_headwall_chute');
      expect(bergschrundSites).toHaveLength(1);
      expect(bergschrundSites[0].id).toBe('spearhead-traverse-whistler');
    });

    it('fetches site by ID', () => {
      const site = getGlacierSkiTraverseSiteById('haute-route-chamonix-zermatt');
      expect(site).toBeDefined();
      expect(site?.range).toBe('Mont Blanc & Pennine Alps');

      const notFound = getGlacierSkiTraverseSiteById('unknown-icefield');
      expect(notFound).toBeUndefined();
    });

    it('returns the gear checklist copy', () => {
      const checklist = getGlacierSkiTraverseGearChecklist();
      expect(checklist).toHaveLength(6);
    });
  });

  describe('calculateGlacierSkiTraverseDynamics', () => {
    const baseQuery = {
      siteId: 'haute-route-chamonix-zermatt',
      travelersCount: 3,
      packWeightKg: 14,
      skiWidthWaistMm: 95,
      slopeAngleDegrees: 24,
      ambientTemperatureC: -4,
    };

    it('calculates standard dynamics within valid physical and logistical bounds', () => {
      const result = calculateGlacierSkiTraverseDynamics(baseQuery);

      expect(result.siteTitle).toContain('Haute Route');
      expect(result.bridgeGroundPressureKpa).toBeGreaterThanOrEqual(3.5);
      expect(result.bridgeGroundPressureKpa).toBeLessThanOrEqual(18.0);
      expect(result.crevasseBridgeFailureRisk).toBeGreaterThanOrEqual(0.0);
      expect(result.crevasseBridgeFailureRisk).toBeLessThanOrEqual(1.0);
      expect(result.seracCorridorExposureTimeMinutes).toBeGreaterThanOrEqual(5);
      expect(result.seracCorridorExposureTimeMinutes).toBeLessThanOrEqual(120);
      expect(result.recommendedRopeSpacingMeters).toBeGreaterThanOrEqual(10);
      expect(result.recommendedRopeSpacingMeters).toBeLessThanOrEqual(25);
      expect(result.hazardLevel).toBeTruthy();
      expect(result.ropeTravelAdvisory.length).toBeGreaterThan(10);
      expect(result.emergencySkiRescueProtocol.length).toBeGreaterThan(10);
    });

    it('calculates higher ground pressure with narrower skis and heavier packs', () => {
      const wideLight = calculateGlacierSkiTraverseDynamics({
        ...baseQuery,
        packWeightKg: 8,
        skiWidthWaistMm: 115,
      });

      const narrowHeavy = calculateGlacierSkiTraverseDynamics({
        ...baseQuery,
        packWeightKg: 28,
        skiWidthWaistMm: 75,
      });

      expect(narrowHeavy.bridgeGroundPressureKpa).toBeGreaterThan(wideLight.bridgeGroundPressureKpa);
    });

    it('calculates higher bridge failure risk with thermal softening or weak powder bridges', () => {
      const coldFirn = calculateGlacierSkiTraverseDynamics({
        ...baseQuery,
        bridgeStability: 'settled_spring_firn_bridge',
        ambientTemperatureC: -12,
      });

      const thermalAblation = calculateGlacierSkiTraverseDynamics({
        ...baseQuery,
        bridgeStability: 'honeycombed_thermal_ablation_bridge',
        ambientTemperatureC: 4,
      });

      expect(thermalAblation.crevasseBridgeFailureRisk).toBeGreaterThan(coldFirn.crevasseBridgeFailureRisk);
    });

    it('calculates increased serac exposure time in icefall corridor and on steeper terrain', () => {
      const basinGentle = calculateGlacierSkiTraverseDynamics({
        ...baseQuery,
        terrainZone: 'upper_firn_accumulation_basin',
        slopeAngleDegrees: 12,
      });

      const icefallSteep = calculateGlacierSkiTraverseDynamics({
        ...baseQuery,
        terrainZone: 'compressed_icefall_serac_corridor',
        slopeAngleDegrees: 38,
      });

      expect(icefallSteep.seracCorridorExposureTimeMinutes).toBeGreaterThan(
        basinGentle.seracCorridorExposureTimeMinutes
      );
    });

    it('determines appropriate hazard levels across varying terrain and thermal conditions', () => {
      const extreme = calculateGlacierSkiTraverseDynamics({
        siteId: 'berner-oberland-ski-traverse',
        terrainZone: 'compressed_icefall_serac_corridor',
        bridgeStability: 'honeycombed_thermal_ablation_bridge',
        travelersCount: 4,
        packWeightKg: 30,
        skiWidthWaistMm: 78,
        slopeAngleDegrees: 42,
        ambientTemperatureC: 5,
      });
      expect(extreme.hazardLevel).toBe('extreme_dynamic_icefall_collapse');

      const low = calculateGlacierSkiTraverseDynamics({
        siteId: 'wapta-traverse-canadian-rockies',
        terrainZone: 'upper_firn_accumulation_basin',
        bridgeStability: 'dense_wind_slab_bridge',
        travelersCount: 2,
        packWeightKg: 10,
        skiWidthWaistMm: 105,
        slopeAngleDegrees: 12,
        ambientTemperatureC: -15,
      });
      expect(low.hazardLevel).toBe('low_cold_stable_accumulation');
    });

    it('handles query clamping on extreme input values', () => {
      const result = calculateGlacierSkiTraverseDynamics({
        siteId: 'spearhead-traverse-whistler',
        travelersCount: 20, // clamps
        packWeightKg: 90, // clamps
        skiWidthWaistMm: 250, // clamps
        slopeAngleDegrees: 85, // clamps
        ambientTemperatureC: 40, // clamps
      });

      expect(result.bridgeGroundPressureKpa).toBeLessThanOrEqual(18.0);
      expect(result.seracCorridorExposureTimeMinutes).toBeLessThanOrEqual(120);
      expect(result.recommendedRopeSpacingMeters).toBeLessThanOrEqual(25);
    });

    it('falls back to default site if unknown siteId provided', () => {
      const result = calculateGlacierSkiTraverseDynamics({
        siteId: 'non-existent-site',
        travelersCount: 2,
        packWeightKg: 15,
        skiWidthWaistMm: 95,
        slopeAngleDegrees: 20,
        ambientTemperatureC: -5,
      });

      expect(result.siteTitle).toBe(GLACIER_SKI_TRAVERSE_SITES[0].title);
    });
  });
});
