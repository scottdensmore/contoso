import { describe, it, expect } from 'vitest';
import {
  getNightViaFerrataRoutes,
  getNightViaFerrataRouteById,
  getNightViaFerrataGear,
  calculateNightViaFerrataDynamics,
  type NightViaFerrataQuery,
} from './night-via-ferrata';

describe('Alpine Via Ferrata Night Suspension Domain Logic', () => {
  describe('Nocturnal Via Ferrata Routes Catalog', () => {
    it('returns all 5 iconic nocturnal via ferrata routes', () => {
      const routes = getNightViaFerrataRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toContain('dolomites-kellner-night-traverse');
      expect(ids).toContain('ouray-canyon-night-ferrata');
      expect(ids).toContain('telluride-krogerata-moonlight');
      expect(ids).toContain('mammoth-pass-starlight-traverse');
      expect(ids).toContain('chamonix-aiguilles-rouges-darksky');
    });

    it('filters routes by NocturnalStyle', () => {
      const gorgeRoutes = getNightViaFerrataRoutes('alpine_gorge_suspension');
      expect(gorgeRoutes).toHaveLength(2);
      const gorgeIds = gorgeRoutes.map((r) => r.id);
      expect(gorgeIds).toContain('dolomites-kellner-night-traverse');
      expect(gorgeIds).toContain('chamonix-aiguilles-rouges-darksky');

      const graniteRoutes = getNightViaFerrataRoutes('vertical_granite_face');
      expect(graniteRoutes).toHaveLength(1);
      expect(graniteRoutes[0].id).toBe('ouray-canyon-night-ferrata');
      expect(graniteRoutes[0].maxGrade).toBe('C');

      const areteRoutes = getNightViaFerrataRoutes('knife_edge_arete');
      expect(areteRoutes).toHaveLength(1);
      expect(areteRoutes[0].id).toBe('telluride-krogerata-moonlight');
      expect(areteRoutes[0].maxGrade).toBe('D');

      const glacierRoutes = getNightViaFerrataRoutes('glacier_rim_traverse');
      expect(glacierRoutes).toHaveLength(1);
      expect(glacierRoutes[0].id).toBe('mammoth-pass-starlight-traverse');
      expect(glacierRoutes[0].maxGrade).toBe('D/E');
    });

    it('finds a route by id with exact specifications', () => {
      const dolomites = getNightViaFerrataRouteById('dolomites-kellner-night-traverse');
      expect(dolomites).toBeDefined();
      expect(dolomites?.title).toBe('Dolomites Ivano Dibona Nocturnal Suspension');
      expect(dolomites?.mountainRange).toBe('Monte Cristallo, Dolomites');
      expect(dolomites?.region).toBe('Italy');
      expect(dolomites?.routeElevationM).toBe(2950);
      expect(dolomites?.suspensionBridgeSpanM).toBe(30);
      expect(dolomites?.verticalDropM).toBe(450);
      expect(dolomites?.nocturnalStyle).toBe('alpine_gorge_suspension');
      expect(dolomites?.maxGrade).toBe('C/D');
      expect(dolomites?.highlights).toContain('Suspension wooden footbridge under full moonlight');

      const nonExistent = getNightViaFerrataRouteById('non-existent-route');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('Mandatory Night Via Ferrata Safety Kit Checklist', () => {
    it('returns all 6 mandatory nocturnal gear items', () => {
      const gear = getNightViaFerrataGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('dual-beam-alpine-headlamp-1200lm');
      expect(ids).toContain('en958-energy-absorbing-lanyards');
      expect(ids).toContain('glow-in-the-dark-climbing-helmet');
      expect(ids).toContain('thermal-friction-grip-gloves');
      expect(ids).toContain('reflective-padded-sit-chest-harness');
      expect(ids).toContain('backup-rechargeable-lumen-core');

      const headlamp = gear.find((g) => g.id === 'dual-beam-alpine-headlamp-1200lm');
      expect(headlamp?.category).toBe('lighting');
      expect(headlamp?.name).toContain('1200-Lumen');

      const lanyards = gear.find((g) => g.id === 'en958-energy-absorbing-lanyards');
      expect(lanyards?.category).toBe('lanyards');

      const helmet = gear.find((g) => g.id === 'glow-in-the-dark-climbing-helmet');
      expect(helmet?.category).toBe('helmet');

      const gloves = gear.find((g) => g.id === 'thermal-friction-grip-gloves');
      expect(gloves?.category).toBe('gloves');

      const harness = gear.find((g) => g.id === 'reflective-padded-sit-chest-harness');
      expect(harness?.category).toBe('harness');

      const backup = gear.find((g) => g.id === 'backup-rechargeable-lumen-core');
      expect(backup?.category).toBe('backup_lighting');
    });
  });

  describe('Nocturnal Visibility & Bridge Sway Dynamics Calculator', () => {
    it('calculates nominal dynamics accurately for default query', () => {
      const query: NightViaFerrataQuery = {
        routeId: 'dolomites-kellner-night-traverse',
        moonlightCondition: 'quarter_crescent',
        headlampLumens: 800,
        windGustsKph: 25,
        temperatureC: 2,
      };

      const result = calculateNightViaFerrataDynamics(query);

      expect(result.routeTitle).toBe('Dolomites Ivano Dibona Nocturnal Suspension');
      expect(result.nocturnalStyle).toBe('alpine_gorge_suspension');
      expect(result.maxGrade).toBe('C/D');
      expect(result.effectiveVisibilityMeters).toBe(53);
      expect(result.bridgeSwayAmplitudeCm).toBe(15);
      expect(result.hypothermiaRiskIndex).toBe(6);
      expect(result.safetyRating).toBe('optimal_moonlight_ascent');
      expect(result.lightingRecommendation).toBeDefined();
      expect(result.nocturnalAdvisory).toBeDefined();
    });

    it('evaluates optimal moonlight ascent with high lumens and low wind', () => {
      const query: NightViaFerrataQuery = {
        routeId: 'dolomites-kellner-night-traverse',
        moonlightCondition: 'full_moon_glare',
        headlampLumens: 1400,
        windGustsKph: 15,
        temperatureC: 2,
      };

      const result = calculateNightViaFerrataDynamics(query);

      expect(result.effectiveVisibilityMeters).toBe(120); // capped at 120m
      expect(result.bridgeSwayAmplitudeCm).toBe(9);
      expect(result.safetyRating).toBe('optimal_moonlight_ascent');
    });

    it('evaluates hazardous zero visibility abort for extreme conditions', () => {
      // Condition 1: low headlamp + pitch black
      const queryLowLight: NightViaFerrataQuery = {
        routeId: 'dolomites-kellner-night-traverse',
        moonlightCondition: 'new_moon_pitch_black',
        headlampLumens: 250,
        windGustsKph: 20,
        temperatureC: 5,
      };
      const resultLowLight = calculateNightViaFerrataDynamics(queryLowLight);
      expect(resultLowLight.safetyRating).toBe('hazardous_zero_visibility_abort');

      // Condition 2: extreme wind > 55 kph
      const queryHighWind: NightViaFerrataQuery = {
        routeId: 'dolomites-kellner-night-traverse',
        moonlightCondition: 'quarter_crescent',
        headlampLumens: 800,
        windGustsKph: 65,
        temperatureC: 2,
      };
      const resultHighWind = calculateNightViaFerrataDynamics(queryHighWind);
      expect(resultHighWind.safetyRating).toBe('hazardous_zero_visibility_abort');
      expect(resultHighWind.bridgeSwayAmplitudeCm).toBe(39);

      // Condition 3: extreme cold < -10 C
      const queryExtremeCold: NightViaFerrataQuery = {
        routeId: 'dolomites-kellner-night-traverse',
        moonlightCondition: 'quarter_crescent',
        headlampLumens: 800,
        windGustsKph: 20,
        temperatureC: -12,
      };
      const resultExtremeCold = calculateNightViaFerrataDynamics(queryExtremeCold);
      expect(resultExtremeCold.safetyRating).toBe('hazardous_zero_visibility_abort');
    });

    it('evaluates caution high headlamp beam required when conditions are intermediate', () => {
      // Lumens < 700
      const queryLowLumens: NightViaFerrataQuery = {
        routeId: 'dolomites-kellner-night-traverse',
        moonlightCondition: 'quarter_crescent',
        headlampLumens: 600,
        windGustsKph: 20,
        temperatureC: 5,
      };
      expect(calculateNightViaFerrataDynamics(queryLowLumens).safetyRating).toBe(
        'caution_high_headlamp_beam_required'
      );

      // Wind gusts >= 35 kph
      const queryModerateWind: NightViaFerrataQuery = {
        routeId: 'dolomites-kellner-night-traverse',
        moonlightCondition: 'quarter_crescent',
        headlampLumens: 800,
        windGustsKph: 40,
        temperatureC: 5,
      };
      expect(calculateNightViaFerrataDynamics(queryModerateWind).safetyRating).toBe(
        'caution_high_headlamp_beam_required'
      );

      // Temperature <= 0 C
      const queryFreezing: NightViaFerrataQuery = {
        routeId: 'dolomites-kellner-night-traverse',
        moonlightCondition: 'quarter_crescent',
        headlampLumens: 800,
        windGustsKph: 20,
        temperatureC: -2,
      };
      expect(calculateNightViaFerrataDynamics(queryFreezing).safetyRating).toBe(
        'caution_high_headlamp_beam_required'
      );
    });

    it('throws error when routeId does not exist', () => {
      const query: NightViaFerrataQuery = {
        routeId: 'unknown-route',
        moonlightCondition: 'quarter_crescent',
        headlampLumens: 800,
        windGustsKph: 25,
        temperatureC: 2,
      };

      expect(() => calculateNightViaFerrataDynamics(query)).toThrow(/not found/i);
    });
  });
});
