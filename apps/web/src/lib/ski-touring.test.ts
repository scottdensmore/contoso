import { describe, it, expect } from 'vitest';
import {
  getSkiTourRoutes,
  getSkiTourRouteById,
  calculateSkinningPace,
  getTouringGearChecklist,
} from './ski-touring';

describe('ski-touring library', () => {
  describe('getSkiTourRoutes', () => {
    it('returns all 5 Pacific Northwest ski tour routes with valid properties', () => {
      const routes = getSkiTourRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toEqual([
        'muir-snowfield',
        'kendal-lakes',
        'artist-point-table',
        'silver-basin',
        'blewett-pass-diamond',
      ]);

      for (const route of routes) {
        expect(route.id).toBeTruthy();
        expect(route.name).toBeTruthy();
        expect(route.region).toBeTruthy();
        expect(route.zone).toBeTruthy();
        expect(route.difficulty).toBeTruthy();
        expect(route.distanceMiles).toBeGreaterThan(0);
        expect(route.elevationGainFt).toBeGreaterThan(0);
        expect(route.maxElevationFt).toBeGreaterThan(0);
        expect(route.avgUphillHours).toBeGreaterThan(0);
        expect(['simple', 'challenging', 'complex']).toContain(route.avalancheTerrainRating);
        expect(route.recommendedSeason).toBeTruthy();
        expect(route.skinTrackNotes).toBeTruthy();
        expect(route.parkingPermitRequired).toBeTruthy();
        expect(route.uphillTravelPolicy).toBeTruthy();
      }
    });

    it('contains exact specifications for Camp Muir and Kendall Lakes', () => {
      const muir = getSkiTourRouteById('muir-snowfield');
      expect(muir).toBeDefined();
      expect(muir?.name).toBe('Camp Muir Snowfield');
      expect(muir?.region).toBe('Mount Rainier National Park');
      expect(muir?.zone).toBe('volcano_alpine');
      expect(muir?.difficulty).toBe('advanced');
      expect(muir?.distanceMiles).toBe(9.0);
      expect(muir?.elevationGainFt).toBe(4600);
      expect(muir?.maxElevationFt).toBe(10080);
      expect(muir?.avgUphillHours).toBe(4.5);
      expect(muir?.avalancheTerrainRating).toBe('challenging');
      expect(muir?.recommendedSeason).toBe('April - July');
      expect(muir?.parkingPermitRequired).toBe('National Park Pass');
      expect(muir?.skinTrackNotes).toContain('Crevasse fall danger above 10,000 ft');
      expect(muir?.uphillTravelPolicy).toContain('wilderness climbing pass');

      const kendall = getSkiTourRouteById('kendal-lakes');
      expect(kendall).toBeDefined();
      expect(kendall?.name).toBe('Kendall Lakes Peak & Knob');
      expect(kendall?.region).toBe('Snoqualmie Pass');
      expect(kendall?.zone).toBe('cascade_crest');
      expect(kendall?.difficulty).toBe('intermediate');
      expect(kendall?.distanceMiles).toBe(6.5);
      expect(kendall?.elevationGainFt).toBe(2200);
      expect(kendall?.maxElevationFt).toBe(5100);
      expect(kendall?.avgUphillHours).toBe(2.5);
      expect(kendall?.avalancheTerrainRating).toBe('challenging');
      expect(kendall?.parkingPermitRequired).toBe('Sno-Park with Special Groomed Sticker');
    });

    it('filters routes by difficulty', () => {
      const beginner = getSkiTourRoutes('beginner_friendly');
      expect(beginner.map((r) => r.id)).toEqual(['artist-point-table', 'blewett-pass-diamond']);

      const intermediate = getSkiTourRoutes('intermediate');
      expect(intermediate.map((r) => r.id)).toEqual(['kendal-lakes']);

      const advanced = getSkiTourRoutes('advanced');
      expect(advanced.map((r) => r.id)).toEqual(['muir-snowfield', 'silver-basin']);
    });

    it('filters routes by zone', () => {
      const cascadeCrest = getSkiTourRoutes(undefined, 'cascade_crest');
      expect(cascadeCrest.map((r) => r.id)).toEqual(['kendal-lakes', 'silver-basin']);

      const volcano = getSkiTourRoutes(undefined, 'volcano_alpine');
      expect(volcano.map((r) => r.id)).toEqual(['muir-snowfield']);
    });

    it('filters routes by difficulty and zone simultaneously', () => {
      const advancedCrest = getSkiTourRoutes('advanced', 'cascade_crest');
      expect(advancedCrest.map((r) => r.id)).toEqual(['silver-basin']);
    });
  });

  describe('getSkiTourRouteById', () => {
    it('returns undefined when route id is not found', () => {
      expect(getSkiTourRouteById('non-existent-route')).toBeUndefined();
    });
  });

  describe('calculateSkinningPace', () => {
    it('calculates pace accurately for athletic fitness on firm skin track (Camp Muir)', () => {
      const result = calculateSkinningPace({
        routeId: 'muir-snowfield',
        fitnessLevel: 'athletic',
        snowCondition: 'firm_skin_track',
        partySize: 1,
      });

      expect(result.routeId).toBe('muir-snowfield');
      expect(result.verticalFeetPerHour).toBe(1575);
      expect(result.estimatedUphillMinutes).toBe(175);
      expect(result.estimatedDescentMinutes).toBe(72);
      expect(result.transitionCount).toBe(2);
      expect(result.totalTourMinutes).toBe(267);
      expect(result.hydrationLiters).toBe(3.1);
      expect(result.caloriesBurned).toBe(2100);
      expect(result.recommendedTurnaroundTime).toContain('9:55 AM');
      expect(result.gearRecommendations.length).toBeGreaterThan(0);
    });

    it('factors in breaking trail powder and moderate fitness penalty', () => {
      const result = calculateSkinningPace({
        routeId: 'kendal-lakes',
        fitnessLevel: 'moderate',
        snowCondition: 'breaking_trail_powder',
        partySize: 3,
      });

      expect(result.verticalFeetPerHour).toBe(776);
      expect(result.estimatedUphillMinutes).toBe(170);
      expect(result.estimatedDescentMinutes).toBe(52);
      expect(result.totalTourMinutes).toBe(242);
      expect(result.hydrationLiters).toBe(2.8);
      expect(result.caloriesBurned).toBe(1530);
      expect(result.recommendedTurnaroundTime).toContain('9:50 AM');
    });

    it('enforces party size penalty minimum floor of 0.75', () => {
      const result = calculateSkinningPace({
        routeId: 'artist-point-table',
        fitnessLevel: 'skimo_racer',
        snowCondition: 'wet_heavy_spring',
        partySize: 12,
      });

      expect(result.verticalFeetPerHour).toBe(1275);
    });

    it('calculates recreational fitness pace accurately', () => {
      const result = calculateSkinningPace({
        routeId: 'blewett-pass-diamond',
        fitnessLevel: 'recreational',
        snowCondition: 'firm_skin_track',
        partySize: 1,
      });

      expect(result.verticalFeetPerHour).toBe(840);
      expect(result.estimatedUphillMinutes).toBe(129);
      expect(result.caloriesBurned).toBe(1161);
    });

    it('throws when route id is unknown', () => {
      expect(() =>
        calculateSkinningPace({
          routeId: 'unknown-route',
          fitnessLevel: 'athletic',
          snowCondition: 'firm_skin_track',
          partySize: 2,
        })
      ).toThrowError(/Route with id "unknown-route" not found/);
    });
  });

  describe('getTouringGearChecklist', () => {
    it('returns the complete backcountry touring gear checklist', () => {
      const gear = getTouringGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(7);

      const skins = gear.find((g) => g.id === 'skins');
      expect(skins).toBeDefined();
      expect(skins?.essential).toBe(true);
      expect(skins?.category).toBe('uphill_traction');
      expect(skins?.description).toContain('mohair/nylon');

      const skiCrampons = gear.find((g) => g.id === 'ski-crampons');
      expect(skiCrampons).toBeDefined();
      expect(skiCrampons?.essential).toBe(true);
      expect(skiCrampons?.category).toBe('uphill_traction');

      const beaconShovelProbe = gear.find((g) => g.id === 'beacon-probe-shovel');
      expect(beaconShovelProbe).toBeDefined();
      expect(beaconShovelProbe?.essential).toBe(true);
      expect(beaconShovelProbe?.category).toBe('avalanche_safety');

      const tool = gear.find((g) => g.id === 'repair-multi-tool');
      expect(tool).toBeDefined();
      expect(tool?.essential).toBe(true);
      expect(tool?.category).toBe('repair_field');

      const helmet = gear.find((g) => g.id === 'helmet-headlamp');
      expect(helmet).toBeDefined();
      expect(helmet?.category).toBe('comfort_layering');
    });
  });
});
