import { describe, it, expect } from 'vitest';
import {
  getSeaKayakRoutes,
  getSeaKayakRouteById,
  calculateTidePlan,
  getSeaKayakGear,
} from './sea-kayaking';

describe('sea-kayaking library', () => {
  describe('getSeaKayakRoutes', () => {
    it('returns all 5 iconic sea kayaking expeditions with complete metadata', () => {
      const routes = getSeaKayakRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toEqual([
        'san-juan-islands-crossing',
        'prince-william-sound-fjords',
        'maine-island-trail-passage',
        'apostle-islands-sea-caves',
        'haida-gwaii-gwaii-haanas',
      ]);

      for (const route of routes) {
        expect(route.id).toBeTruthy();
        expect(route.title).toBeTruthy();
        expect(route.region).toBeTruthy();
        expect(route.distanceNm).toBeGreaterThan(0);
        expect(route.typicalDurationDays).toBeGreaterThan(0);
        expect(['grade_1_sheltered', 'grade_2_coastal', 'grade_3_open_crossing', 'grade_4_exposed_ocean']).toContain(
          route.waterGrade
        );
        expect(['low', 'moderate', 'strong', 'extreme']).toContain(route.currentRisk);
        expect(route.maxCurrentKnots).toBeGreaterThan(0);
        expect(route.openCrossingMiles).toBeGreaterThan(0);
        expect(route.recommendedKayakLengthFt).toBeGreaterThanOrEqual(14);
        expect(route.drysuitMandatory).toBe(true);
        expect(route.description).toBeTruthy();
        expect(route.highlights.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('contains exact specifications for San Juan Islands and Gwaii Haanas', () => {
      const sanJuan = getSeaKayakRouteById('san-juan-islands-crossing');
      expect(sanJuan).toBeDefined();
      expect(sanJuan?.title).toBe('San Juan Islands Archipelago Traverse');
      expect(sanJuan?.region).toBe('Washington Sound, WA');
      expect(sanJuan?.distanceNm).toBe(28);
      expect(sanJuan?.typicalDurationDays).toBe(3);
      expect(sanJuan?.waterGrade).toBe('grade_2_coastal');
      expect(sanJuan?.currentRisk).toBe('strong');
      expect(sanJuan?.maxCurrentKnots).toBe(4.2);
      expect(sanJuan?.openCrossingMiles).toBe(2.5);
      expect(sanJuan?.recommendedKayakLengthFt).toBe(16);
      expect(sanJuan?.drysuitMandatory).toBe(true);
      expect(sanJuan?.highlights).toEqual([
        'Orca whale sanctuaries',
        'Rosario Strait tidal races',
        'Turn Island marine park campsites',
      ]);

      const gwaii = getSeaKayakRouteById('haida-gwaii-gwaii-haanas');
      expect(gwaii).toBeDefined();
      expect(gwaii?.title).toBe('Gwaii Haanas Coastal Wilderness Expedition');
      expect(gwaii?.region).toBe('Haida Gwaii, BC');
      expect(gwaii?.distanceNm).toBe(65);
      expect(gwaii?.typicalDurationDays).toBe(7);
      expect(gwaii?.waterGrade).toBe('grade_4_exposed_ocean');
      expect(gwaii?.currentRisk).toBe('extreme');
      expect(gwaii?.maxCurrentKnots).toBe(5.5);
      expect(gwaii?.openCrossingMiles).toBe(6.0);
      expect(gwaii?.recommendedKayakLengthFt).toBe(18);
      expect(gwaii?.highlights).toEqual([
        'Open Pacific ocean swells',
        'Hecate Strait tidal surges',
        'Ancient Haida village poles',
      ]);
    });

    it('filters routes by coastal water grade', () => {
      const coastal = getSeaKayakRoutes('grade_2_coastal');
      expect(coastal.map((r) => r.id)).toEqual([
        'san-juan-islands-crossing',
        'maine-island-trail-passage',
        'apostle-islands-sea-caves',
      ]);

      const openCrossing = getSeaKayakRoutes('grade_3_open_crossing');
      expect(openCrossing.map((r) => r.id)).toEqual(['prince-william-sound-fjords']);

      const exposed = getSeaKayakRoutes('grade_4_exposed_ocean');
      expect(exposed.map((r) => r.id)).toEqual(['haida-gwaii-gwaii-haanas']);

      const sheltered = getSeaKayakRoutes('grade_1_sheltered');
      expect(sheltered).toEqual([]);
    });
  });

  describe('getSeaKayakRouteById', () => {
    it('returns undefined when route id is not found', () => {
      expect(getSeaKayakRouteById('unknown-route')).toBeUndefined();
    });
  });

  describe('calculateTidePlan', () => {
    it('calculates favorable plan for advanced paddler in mild conditions', () => {
      const plan = calculateTidePlan({
        routeId: 'apostle-islands-sea-caves',
        paddlerSkillLevel: 'advanced',
        currentSpeedKnots: 1.0,
        windSpeedKnots: 8,
        crossingWindowHours: 3,
      });

      expect(plan.routeTitle).toBe('Apostle Islands Sea Caves & Outer Islands');
      expect(plan.crossingSafetyStatus).toBe('favorable');
      expect(plan.vhfChannel).toBe(16);
      expect(plan.drysuitRequired).toBe(true);
      expect(plan.estimatedFerryAngleDegrees).toBeGreaterThanOrEqual(10);
      expect(plan.estimatedFerryAngleDegrees).toBeLessThan(30);
      expect(plan.effectivePaddlingSpeedKnots).toBeGreaterThan(3.5);
      expect(plan.recommendedDepartureTiming).toContain('slack');
      expect(plan.safetyAdvisory).toContain('Favorable');
    });

    it('calculates caution plan when moderate current and wind require active ferry angle', () => {
      const plan = calculateTidePlan({
        routeId: 'san-juan-islands-crossing',
        paddlerSkillLevel: 'intermediate',
        currentSpeedKnots: 2.5,
        windSpeedKnots: 12,
        crossingWindowHours: 2,
      });

      expect(plan.routeTitle).toBe('San Juan Islands Archipelago Traverse');
      expect(plan.crossingSafetyStatus).toBe('caution');
      expect(plan.vhfChannel).toBe(16);
      expect(plan.drysuitRequired).toBe(true);
      expect(plan.estimatedFerryAngleDegrees).toBeGreaterThanOrEqual(45);
      expect(plan.effectivePaddlingSpeedKnots).toBeCloseTo(2.9, 1);
      expect(plan.recommendedDepartureTiming).toContain('slack');
      expect(plan.safetyAdvisory).toContain('caution');
    });

    it('calculates hazardous plan when current exceeds paddling capability or gale wind', () => {
      const plan = calculateTidePlan({
        routeId: 'haida-gwaii-gwaii-haanas',
        paddlerSkillLevel: 'intermediate',
        currentSpeedKnots: 5.0,
        windSpeedKnots: 25,
        crossingWindowHours: 2,
      });

      expect(plan.routeTitle).toBe('Gwaii Haanas Coastal Wilderness Expedition');
      expect(plan.crossingSafetyStatus).toBe('hazardous');
      expect(plan.safetyAdvisory).toContain('Hazardous');
    });

    it('flags novice attempting open crossing in high current as hazardous', () => {
      const plan = calculateTidePlan({
        routeId: 'prince-william-sound-fjords',
        paddlerSkillLevel: 'novice',
        currentSpeedKnots: 2.8,
        windSpeedKnots: 14,
        crossingWindowHours: 2,
      });

      expect(plan.crossingSafetyStatus).toBe('hazardous');
      expect(plan.safetyAdvisory).toContain('Hazardous');
    });

    it('throws error when route id is unknown', () => {
      expect(() =>
        calculateTidePlan({
          routeId: 'non-existent',
          paddlerSkillLevel: 'novice',
          currentSpeedKnots: 2,
          windSpeedKnots: 10,
          crossingWindowHours: 2,
        })
      ).toThrowError(/Route with id "non-existent" not found/);
    });
  });

  describe('getSeaKayakGear', () => {
    it('returns the 6 mandatory coastal safety kit items', () => {
      const gear = getSeaKayakGear();
      expect(gear).toHaveLength(6);

      const mandatoryCount = gear.filter((g) => g.mandatory).length;
      expect(mandatoryCount).toBe(6);

      const pfd = gear.find((g) => g.id === 'pfd-rescue-harness');
      expect(pfd).toBeDefined();
      expect(pfd?.name).toContain('PFD');
      expect(pfd?.category).toBe('safety');

      const drysuit = gear.find((g) => g.id === 'drysuit-gaskets');
      expect(drysuit).toBeDefined();
      expect(drysuit?.name.toLowerCase()).toContain('dry suit');
      expect(drysuit?.category).toBe('immersion');

      const vhf = gear.find((g) => g.id === 'marine-vhf-radio');
      expect(vhf).toBeDefined();
      expect(vhf?.name).toContain('VHF');
      expect(vhf?.category).toBe('signaling');

      const pump = gear.find((g) => g.id === 'bilge-pump-paddle-float');
      expect(pump).toBeDefined();
      expect(pump?.name).toContain('bilge pump');

      const bulkheads = gear.find((g) => g.id === 'dual-waterproof-bulkheads');
      expect(bulkheads).toBeDefined();
      expect(bulkheads?.category).toBe('kayak_hardware');

      const whistleFlares = gear.find((g) => g.id === 'whistle-distress-flares');
      expect(whistleFlares).toBeDefined();
      expect(whistleFlares?.category).toBe('signaling');
    });
  });
});
