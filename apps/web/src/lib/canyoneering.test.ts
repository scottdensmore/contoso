import { describe, it, expect } from 'vitest';
import {
  getCanyonRoutes,
  getCanyonRouteById,
  getCanyoneeringGear,
  calculateRopeRiggingPlan,
  type RopeRiggingQuery,
} from './canyoneering';

describe('Canyoneering Domain Logic', () => {
  describe('Canyon Routes Catalog', () => {
    it('returns all 5 iconic technical slot canyon routes', () => {
      const routes = getCanyonRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toContain('zion-subway-left-fork');
      expect(ids).toContain('zion-mystery-canyon');
      expect(ids).toContain('escalante-choprock-canyon');
      expect(ids).toContain('san-rafael-black-hole');
      expect(ids).toContain('robbers-roost-bluejohn');
    });

    it('filters routes by technical grade', () => {
      const class3b = getCanyonRoutes('class_3b');
      expect(class3b.length).toBe(2);
      expect(class3b.map((r) => r.id)).toEqual(
        expect.arrayContaining(['zion-subway-left-fork', 'zion-mystery-canyon'])
      );

      const class4b = getCanyonRoutes('class_4b');
      expect(class4b.length).toBe(1);
      expect(class4b[0].id).toBe('escalante-choprock-canyon');

      const class3c = getCanyonRoutes('class_3c');
      expect(class3c.length).toBe(1);
      expect(class3c[0].id).toBe('san-rafael-black-hole');

      const class3a = getCanyonRoutes('class_3a');
      expect(class3a.length).toBe(1);
      expect(class3a[0].id).toBe('robbers-roost-bluejohn');
    });

    it('finds a route by id', () => {
      const mystery = getCanyonRouteById('zion-mystery-canyon');
      expect(mystery).toBeDefined();
      expect(mystery?.canyonName).toBe('Mystery Canyon');
      expect(mystery?.longestRappelFt).toBe(120);
      expect(mystery?.numberOfRappels).toBe(12);
      expect(mystery?.technicalGrade).toBe('class_3b');
      expect(mystery?.flashFloodRisk).toBe('moderate');

      const nonexistent = getCanyonRouteById('non-existent');
      expect(nonexistent).toBeUndefined();
    });

    it('has accurate canyon specs for all routes', () => {
      const subway = getCanyonRouteById('zion-subway-left-fork');
      expect(subway?.maxRappelFt).toBe(30);
      expect(subway?.wetsuitThicknessMm).toBe(4);
      expect(subway?.anchorFeatures).toContain('Emerald pools cascade');

      const choprock = getCanyonRouteById('escalante-choprock-canyon');
      expect(choprock?.technicalGrade).toBe('class_4b');
      expect(choprock?.flashFloodRisk).toBe('high');
      expect(choprock?.longestRappelFt).toBe(80);

      const blackHole = getCanyonRouteById('san-rafael-black-hole');
      expect(blackHole?.technicalGrade).toBe('class_3c');
      expect(blackHole?.wetsuitThicknessMm).toBe(5);

      const bluejohn = getCanyonRouteById('robbers-roost-bluejohn');
      expect(bluejohn?.technicalGrade).toBe('class_3a');
      expect(bluejohn?.wetsuitThicknessMm).toBe(0);
      expect(bluejohn?.flashFloodRisk).toBe('low');
    });
  });

  describe('Technical Canyoneering Kit Checklist', () => {
    it('returns the 6 mandatory canyoneering gear items', () => {
      const gear = getCanyoneeringGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const names = gear.map((g) => g.name);
      expect(
        names.some((n) => n.includes('CE certified canyoneering harness'))
      ).toBe(true);
      expect(
        names.some((n) => n.includes('8.3mm-to-9.2mm static hydrophobic canyoneering rope'))
      ).toBe(true);
      expect(
        names.some((n) => n.includes('Figure-8 or Totem / Pirana'))
      ).toBe(true);
      expect(
        names.some((n) => n.includes('4mm-5mm sealed neoprene full wetsuit'))
      ).toBe(true);
      expect(
        names.some((n) => n.includes('Sandstone canyoning helmet'))
      ).toBe(true);
      expect(
        names.some((n) => n.includes('Pothole escape kit'))
      ).toBe(true);
    });
  });

  describe('Rope Rigging & Flash Flood Hydrology Calculator', () => {
    it('calculates primary rope length and pull cord length for Mystery Canyon', () => {
      const query: RopeRiggingQuery = {
        routeId: 'zion-mystery-canyon',
        teamSize: 4,
        ropeDiameterMm: 9.0,
        pullCordType: 'dedicated_pull_line',
        waterImmersionLevel: 'pothole_swimming',
      };

      const result = calculateRopeRiggingPlan(query);

      expect(result.canyonAndRouteName).toContain('Mystery Canyon');
      // Longest drop is 120ft, with standard 20ft buffer = 140ft
      expect(result.recommendedRopeLengthFt).toBe(140);
      expect(result.pullCordLengthFt).toBe(140);
      expect(result.riggingStatus).toBe('safe');
      expect(result.riggingAnchorSystem).toContain('contingency');
      expect(result.neopreneSuitSpec).toContain('neoprene');
      expect(result.safetyAdvisory).toContain('Mystery Canyon');
    });

    it('recommends dual rope system rigging for dual rope queries', () => {
      const query: RopeRiggingQuery = {
        routeId: 'zion-mystery-canyon',
        teamSize: 4,
        ropeDiameterMm: 9.0,
        pullCordType: 'dual_rope_system',
        waterImmersionLevel: 'pothole_swimming',
      };

      const result = calculateRopeRiggingPlan(query);
      expect(result.riggingAnchorSystem).toContain('Dual-rope');
      expect(result.pullCordLengthFt).toBe(140);
    });

    it('flags critical hazard when retrievable FiddleStick toggle is selected in flowing water', () => {
      const query: RopeRiggingQuery = {
        routeId: 'san-rafael-black-hole',
        teamSize: 3,
        ropeDiameterMm: 9.0,
        pullCordType: 'fiddle_stick_retrievable',
        waterImmersionLevel: 'flowing_water',
      };

      const result = calculateRopeRiggingPlan(query);
      expect(result.riggingStatus).toBe('critical_hazard');
      expect(result.safetyAdvisory).toContain('CRITICAL HAZARD');
      expect(result.safetyAdvisory).toContain('FiddleStick');
    });

    it('flags caution when thin diameter rope (<8.3mm) is used', () => {
      const query: RopeRiggingQuery = {
        routeId: 'robbers-roost-bluejohn',
        teamSize: 4,
        ropeDiameterMm: 8.0,
        pullCordType: 'dedicated_pull_line',
        waterImmersionLevel: 'dry',
      };

      const result = calculateRopeRiggingPlan(query);
      expect(result.riggingStatus).toBe('caution');
      expect(result.safetyAdvisory).toContain('8.0mm');
      expect(result.neopreneSuitSpec).toContain('No wetsuit required');
    });

    it('recommends 5mm sealed suit for high water immersion or cold gorge swims', () => {
      const query: RopeRiggingQuery = {
        routeId: 'san-rafael-black-hole',
        teamSize: 4,
        ropeDiameterMm: 9.2,
        pullCordType: 'dedicated_pull_line',
        waterImmersionLevel: 'flowing_water',
      };

      const result = calculateRopeRiggingPlan(query);
      expect(result.neopreneSuitSpec).toContain('5mm');
      expect(result.neopreneSuitSpec).toContain('hood');
    });

    it('throws error for unknown routeId', () => {
      const query: RopeRiggingQuery = {
        routeId: 'invalid-canyon',
        teamSize: 4,
        ropeDiameterMm: 9.0,
        pullCordType: 'dedicated_pull_line',
        waterImmersionLevel: 'dry',
      };

      expect(() => calculateRopeRiggingPlan(query)).toThrow(/not found/i);
    });
  });
});
