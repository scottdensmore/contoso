import { describe, it, expect } from 'vitest';
import {
  CLIMBING_CRAGS,
  getClimbingCrags,
  getClimbingCragById,
  calculateRack,
  getRappelSafetyChecklist,
} from './climbing';

describe('climbing library', () => {
  describe('CLIMBING_CRAGS catalog', () => {
    it('contains all 5 Pacific Northwest climbing crags', () => {
      expect(CLIMBING_CRAGS).toHaveLength(5);
      const ids = CLIMBING_CRAGS.map((c) => c.id);
      expect(ids).toEqual([
        'index-lower-town-wall',
        'leavenworth-castle-rock',
        'vantage-feathers',
        'washington-pass-liberty-bell',
        'smith-rock-dihedrals',
      ]);
    });

    it('has correct properties for Index Town Wall — Lower Wall', () => {
      const crag = getClimbingCragById('index-lower-town-wall');
      expect(crag).toBeDefined();
      expect(crag?.name).toBe('Index Town Wall — Lower Wall');
      expect(crag?.area).toBe('Skykomish Valley');
      expect(crag?.region).toBe('Central Cascades');
      expect(crag?.rockType).toBe('granite');
      expect(crag?.elevationFt).toBe(600);
      expect(crag?.approachMinutes).toBe(10);
      expect(crag?.sunExposure).toBe('West-facing (afternoon sun)');
      expect(crag?.helmetRequired).toBe(true);
      expect(crag?.routes).toHaveLength(3);
      expect(crag?.routes[0].name).toBe('Godzilla');
      expect(crag?.routes[0].grade).toBe('5.9');
      expect(crag?.routes[0].protectionType).toBe('trad');
      expect(crag?.routes[1].name).toBe('City Park');
      expect(crag?.routes[1].grade).toBe('5.13d');
      expect(crag?.routes[2].name).toBe('Slow Children');
      expect(crag?.routes[2].pitches).toBe(3);
    });

    it('has correct properties for The Feathers', () => {
      const crag = getClimbingCragById('vantage-feathers');
      expect(crag).toBeDefined();
      expect(crag?.name).toBe('The Feathers');
      expect(crag?.rockType).toBe('basalt');
      expect(crag?.routes).toHaveLength(3);
      expect(crag?.routes.every((r) => r.protectionType === 'sport')).toBe(true);
      expect(crag?.routes.map((r) => r.name)).toContain('Seven Virgins and a Mule');
    });

    it('has correct properties for Liberty Bell — Beckey Route', () => {
      const crag = getClimbingCragById('washington-pass-liberty-bell');
      expect(crag).toBeDefined();
      expect(crag?.name).toBe('Liberty Bell — Beckey Route');
      expect(crag?.elevationFt).toBe(7720);
      expect(crag?.approachMinutes).toBe(75);
      expect(crag?.routes[0].protectionType).toBe('alpine_rock');
    });

    it('has correct properties for The Dihedrals at Smith Rock', () => {
      const crag = getClimbingCragById('smith-rock-dihedrals');
      expect(crag).toBeDefined();
      expect(crag?.name).toBe('The Dihedrals');
      expect(crag?.rockType).toBe('welded_tuff');
      expect(crag?.routes.some((r) => r.name === 'Chain Reaction' && r.grade === '5.12c')).toBe(true);
      expect(crag?.routes.some((r) => r.name === 'Moonshine Dihedral' && r.protectionType === 'trad')).toBe(true);
    });
  });

  describe('getClimbingCrags filtering', () => {
    it('returns all crags when no filter is provided', () => {
      const crags = getClimbingCrags();
      expect(crags).toHaveLength(5);
    });

    it('filters by discipline correctly', () => {
      const sportCrags = getClimbingCrags('sport');
      expect(sportCrags.map((c) => c.id)).toEqual(['vantage-feathers', 'smith-rock-dihedrals']);

      const tradCrags = getClimbingCrags('trad');
      expect(tradCrags.map((c) => c.id)).toEqual([
        'index-lower-town-wall',
        'leavenworth-castle-rock',
        'smith-rock-dihedrals',
      ]);

      const alpineCrags = getClimbingCrags('alpine_rock');
      expect(alpineCrags.map((c) => c.id)).toEqual(['washington-pass-liberty-bell']);

      const boulderingCrags = getClimbingCrags('bouldering');
      expect(boulderingCrags).toHaveLength(0);
    });

    it('filters by rockType correctly', () => {
      const basaltCrags = getClimbingCrags(undefined, 'basalt');
      expect(basaltCrags).toHaveLength(1);
      expect(basaltCrags[0].id).toBe('vantage-feathers');

      const tuffCrags = getClimbingCrags(undefined, 'welded_tuff');
      expect(tuffCrags).toHaveLength(1);
      expect(tuffCrags[0].id).toBe('smith-rock-dihedrals');

      const graniteCrags = getClimbingCrags(undefined, 'granite');
      expect(graniteCrags).toHaveLength(3);
    });

    it('filters by both discipline and rockType simultaneously', () => {
      const graniteTrad = getClimbingCrags('trad', 'granite');
      expect(graniteTrad.map((c) => c.id)).toEqual(['index-lower-town-wall', 'leavenworth-castle-rock']);

      const tuffTrad = getClimbingCrags('trad', 'welded_tuff');
      expect(tuffTrad.map((c) => c.id)).toEqual(['smith-rock-dihedrals']);
    });
  });

  describe('getClimbingCragById', () => {
    it('returns undefined for non-existent id', () => {
      expect(getClimbingCragById('non-existent')).toBeUndefined();
    });
  });

  describe('calculateRack', () => {
    it('calculates rack for sport climbing under 100 ft', () => {
      const result = calculateRack({
        routeType: 'sport',
        pitches: 1,
        cruxGrade: '5.10b',
        routeLengthFt: 65,
      });
      expect(result.camsDescription).toMatch(/none/i);
      expect(result.nutsDescription).toMatch(/none/i);
      expect(result.quickdrawsCount).toBe(10);
      expect(result.slingsCount).toBe(2);
      expect(result.ropeLengthM).toBe(60);
      expect(result.weightEstLbs).toBe(7.5);
      expect(result.specialGear).toContain('Sport quickdraws');
    });

    it('calculates rack for long sport climbing over 100 ft with 70m rope', () => {
      const result = calculateRack({
        routeType: 'sport',
        pitches: 1,
        cruxGrade: '5.11a',
        routeLengthFt: 110,
      });
      expect(result.quickdrawsCount).toBe(13);
      expect(result.ropeLengthM).toBe(70);
      expect(result.weightEstLbs).toBe(7.5);
    });

    it('calculates rack for single-pitch trad climbing', () => {
      const result = calculateRack({
        routeType: 'trad',
        pitches: 1,
        cruxGrade: '5.9',
        routeLengthFt: 90,
      });
      expect(result.camsDescription).toContain('Single rack');
      expect(result.nutsDescription).toContain('stoppers');
      expect(result.quickdrawsCount).toBe(8);
      expect(result.ropeLengthM).toBe(60);
      expect(result.weightEstLbs).toBeGreaterThanOrEqual(12);
      expect(result.weightEstLbs).toBeLessThanOrEqual(18);
      expect(result.specialGear).toContain('Nut tool');
    });

    it('calculates rack for multi-pitch trad climbing (3 pitches)', () => {
      const result = calculateRack({
        routeType: 'trad',
        pitches: 3,
        cruxGrade: '5.10d',
        routeLengthFt: 300,
      });
      expect(result.camsDescription).toContain('Double rack');
      expect(result.quickdrawsCount).toBe(12);
      expect(result.ropeLengthM).toBe(70);
      expect(result.weightEstLbs).toBeGreaterThanOrEqual(12);
      expect(result.weightEstLbs).toBeLessThanOrEqual(18);
    });

    it('calculates rack for alpine rock climbing', () => {
      const result = calculateRack({
        routeType: 'alpine_rock',
        pitches: 4,
        cruxGrade: '5.6',
        routeLengthFt: 450,
      });
      expect(result.ropeLengthM).toBe(70);
      expect(result.specialGear).toContain('Headlamp with extra batteries');
      expect(result.specialGear).toContain('Emergency bivy gear & space blanket');
      expect(result.specialGear).toContain('Prusik loops for crevasse/self-rescue');
      expect(result.specialGear).toContain('Nut tool');
    });

    it('handles bouldering loadout cleanly', () => {
      const result = calculateRack({
        routeType: 'bouldering',
        pitches: 1,
        cruxGrade: '5.10a',
        routeLengthFt: 15,
      });
      expect(result.ropeLengthM).toBe(0);
      expect(result.quickdrawsCount).toBe(0);
      expect(result.specialGear).toContain('Crash pad');
    });
  });

  describe('getRappelSafetyChecklist', () => {
    it('returns standard rappel checklist with critical items', () => {
      const checklist = getRappelSafetyChecklist();
      expect(checklist.length).toBeGreaterThanOrEqual(4);

      const criticalChecks = checklist.filter((item) => item.critical);
      expect(criticalChecks.length).toBeGreaterThanOrEqual(3);

      const stopperKnots = checklist.find((item) => item.id === 'stopper-knots');
      expect(stopperKnots).toBeDefined();
      expect(stopperKnots?.critical).toBe(true);

      const autoblock = checklist.find((item) => item.id === 'autoblock-backup');
      expect(autoblock).toBeDefined();
      expect(autoblock?.critical).toBe(true);

      const preWeight = checklist.find((item) => item.id === 'pre-weight-test');
      expect(preWeight).toBeDefined();
      expect(preWeight?.critical).toBe(true);

      const carabiners = checklist.find((item) => item.id === 'anchor-carabiners');
      expect(carabiners).toBeDefined();
      expect(carabiners?.critical).toBe(true);
    });
  });
});
