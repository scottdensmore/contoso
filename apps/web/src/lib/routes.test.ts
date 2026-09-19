import { describe, it, expect } from 'vitest';
import {
  TRAIL_ROUTES,
  getTrailRoutes,
  getTrailRouteBySlug,
  calculateElevationGradient,
  generateGpxExport,
} from './routes';

describe('Trail Routes Catalog & GPS Utilities', () => {
  describe('Route Catalog', () => {
    it('contains all 5 PNW wilderness routes', () => {
      expect(TRAIL_ROUTES).toHaveLength(5);
      const slugs = TRAIL_ROUTES.map((r) => r.slug);
      expect(slugs).toEqual([
        'enchantments-thru-hike',
        'spray-park-loop',
        'hoh-river-blue-glacier',
        'goat-rocks-knife-edge',
        'rattlesnake-ledge',
      ]);
    });

    it('defines accurate route details for The Enchantments Thru-Hike', () => {
      const enchantments = getTrailRouteBySlug('enchantments-thru-hike');
      expect(enchantments).toBeDefined();
      expect(enchantments?.name).toBe('The Enchantments Thru-Hike');
      expect(enchantments?.region).toBe('Cascades');
      expect(enchantments?.wildernessArea).toBe('Alpine Lakes Wilderness');
      expect(enchantments?.distanceMiles).toBe(18.5);
      expect(enchantments?.elevationGainFeet).toBe(4500);
      expect(enchantments?.highestPointFeet).toBe(7841);
      expect(enchantments?.difficulty).toBe('expert');
      expect(enchantments?.estimatedHours).toBe(12.0);
      expect(enchantments?.waypoints.length).toBe(6);

      const aasgard = enchantments?.waypoints.find((w) => w.name === 'Aasgard Pass');
      expect(aasgard).toBeDefined();
      expect(aasgard?.mile).toBe(14.5);
      expect(aasgard?.elevationFeet).toBe(7841);
      expect(aasgard?.coordinates).toEqual([47.488, -120.822]);
      expect(aasgard?.type).toBe('summit');

      const colchuck = enchantments?.waypoints.find((w) => w.name === 'Colchuck Lake');
      expect(colchuck).toBeDefined();
      expect(colchuck?.elevationFeet).toBe(5600);
      expect(colchuck?.coordinates).toEqual([47.497, -120.835]);
    });

    it('defines Spray Park & Mount Rainier Loop details', () => {
      const spray = getTrailRouteBySlug('spray-park-loop');
      expect(spray).toBeDefined();
      expect(spray?.name).toBe('Spray Park & Mount Rainier Loop');
      expect(spray?.region).toBe('Mount Rainier');
      expect(spray?.distanceMiles).toBe(16.0);
      expect(spray?.elevationGainFeet).toBe(3600);
      expect(spray?.highestPointFeet).toBe(6400);
      expect(spray?.difficulty).toBe('strenuous');
      expect(spray?.estimatedHours).toBe(8.5);
      expect(spray?.waypoints.length).toBe(7);
    });

    it('defines Hoh River Trail to Blue Glacier details', () => {
      const hoh = getTrailRouteBySlug('hoh-river-blue-glacier');
      expect(hoh).toBeDefined();
      expect(hoh?.name).toBe('Hoh River Trail to Blue Glacier');
      expect(hoh?.region).toBe('Olympic National Park');
      expect(hoh?.distanceMiles).toBe(34.8);
      expect(hoh?.elevationGainFeet).toBe(3700);
      expect(hoh?.highestPointFeet).toBe(4300);
      expect(hoh?.difficulty).toBe('strenuous');
      expect(hoh?.estimatedHours).toBe(20.0);
      expect(hoh?.waypoints.length).toBe(6);
    });

    it('defines Goat Rocks Wilderness Knife\'s Edge details', () => {
      const goat = getTrailRouteBySlug('goat-rocks-knife-edge');
      expect(goat).toBeDefined();
      expect(goat?.name).toBe("Goat Rocks Wilderness Knife's Edge");
      expect(goat?.region).toBe('Cascades');
      expect(goat?.distanceMiles).toBe(12.4);
      expect(goat?.elevationGainFeet).toBe(3200);
      expect(goat?.highestPointFeet).toBe(6900);
      expect(goat?.difficulty).toBe('strenuous');
      expect(goat?.estimatedHours).toBe(7.5);
      expect(goat?.waypoints.length).toBe(6);
    });

    it('defines Rattlesnake Ledge Trail details', () => {
      const rattlesnake = getTrailRouteBySlug('rattlesnake-ledge');
      expect(rattlesnake).toBeDefined();
      expect(rattlesnake?.name).toBe('Rattlesnake Ledge Trail');
      expect(rattlesnake?.region).toContain('North Bend');
      expect(rattlesnake?.distanceMiles).toBe(4.0);
      expect(rattlesnake?.elevationGainFeet).toBe(1160);
      expect(rattlesnake?.highestPointFeet).toBe(2070);
      expect(rattlesnake?.difficulty).toBe('easy');
      expect(rattlesnake?.estimatedHours).toBe(2.0);
      expect(rattlesnake?.waypoints.length).toBe(2);
    });

    it('returns undefined for nonexistent route slug', () => {
      expect(getTrailRouteBySlug('nonexistent-trail')).toBeUndefined();
    });
  });

  describe('Filtering & Searching', () => {
    it('returns all routes when no filter provided', () => {
      const routes = getTrailRoutes();
      expect(routes).toHaveLength(5);
    });

    it('filters routes by region', () => {
      const cascades = getTrailRoutes({ region: 'Cascades' });
      expect(cascades).toHaveLength(2);
      expect(cascades.map((r) => r.slug)).toContain('enchantments-thru-hike');
      expect(cascades.map((r) => r.slug)).toContain('goat-rocks-knife-edge');

      const rainier = getTrailRoutes({ region: 'Mount Rainier' });
      expect(rainier).toHaveLength(1);
      expect(rainier[0].slug).toBe('spray-park-loop');

      const olympic = getTrailRoutes({ region: 'Olympic National Park' });
      expect(olympic).toHaveLength(1);
      expect(olympic[0].slug).toBe('hoh-river-blue-glacier');

      const northBend = getTrailRoutes({ region: 'North Bend' });
      expect(northBend).toHaveLength(1);
      expect(northBend[0].slug).toBe('rattlesnake-ledge');
    });

    it('filters routes by difficulty', () => {
      const expert = getTrailRoutes({ difficulty: 'expert' });
      expect(expert).toHaveLength(1);
      expect(expert[0].slug).toBe('enchantments-thru-hike');

      const easy = getTrailRoutes({ difficulty: 'easy' });
      expect(easy).toHaveLength(1);
      expect(easy[0].slug).toBe('rattlesnake-ledge');

      const strenuous = getTrailRoutes({ difficulty: 'strenuous' });
      expect(strenuous).toHaveLength(3);
    });

    it('searches routes by query across name, region, description, and waypoints', () => {
      const searchEnchant = getTrailRoutes({ searchQuery: 'Enchantments' });
      expect(searchEnchant).toHaveLength(1);
      expect(searchEnchant[0].slug).toBe('enchantments-thru-hike');

      const searchGlacier = getTrailRoutes({ searchQuery: 'Glacier' });
      expect(searchGlacier).toHaveLength(1);
      expect(searchGlacier[0].slug).toBe('hoh-river-blue-glacier');

      const searchAasgard = getTrailRoutes({ searchQuery: 'Aasgard' });
      expect(searchAasgard).toHaveLength(1);
      expect(searchAasgard[0].slug).toBe('enchantments-thru-hike');

      const searchNone = getTrailRoutes({ searchQuery: 'XYZRandomNonExistent' });
      expect(searchNone).toHaveLength(0);
    });

    it('combines region, difficulty, and search query filters', () => {
      const result = getTrailRoutes({
        region: 'Cascades',
        difficulty: 'expert',
        searchQuery: 'Enchantments',
      });
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('enchantments-thru-hike');

      const emptyResult = getTrailRoutes({
        region: 'Cascades',
        difficulty: 'easy',
      });
      expect(emptyResult).toHaveLength(0);
    });
  });

  describe('Elevation Gradient Calculation', () => {
    it('handles empty or single waypoint gracefully', () => {
      expect(calculateElevationGradient([])).toEqual({
        maxGradientPercent: 0,
        avgGradientPercent: 0,
      });

      expect(
        calculateElevationGradient([
          {
            name: 'Start',
            mile: 0,
            elevationFeet: 1000,
            coordinates: [47.0, -120.0],
            type: 'trailhead',
            notes: '',
          },
        ]),
      ).toEqual({
        maxGradientPercent: 0,
        avgGradientPercent: 0,
      });
    });

    it('calculates max and average gradient correctly for multi-waypoint trails', () => {
      const enchantments = getTrailRouteBySlug('enchantments-thru-hike');
      expect(enchantments).toBeDefined();
      if (!enchantments) return;

      const gradient = calculateElevationGradient(enchantments.waypoints);
      expect(gradient.maxGradientPercent).toBeGreaterThan(0);
      expect(gradient.avgGradientPercent).toBeGreaterThan(0);
      expect(gradient.maxGradientPercent).toBeGreaterThanOrEqual(gradient.avgGradientPercent);
    });

    it('calculates known gradient with precise mathematical accuracy', () => {
      // Mile 0: 0 ft, Mile 1 (5280 ft): 528 ft gain -> 10.0% gradient
      const waypoints = [
        {
          name: 'Point A',
          mile: 0,
          elevationFeet: 0,
          coordinates: [47.0, -120.0] as [number, number],
          type: 'trailhead' as const,
          notes: '',
        },
        {
          name: 'Point B',
          mile: 1,
          elevationFeet: 528,
          coordinates: [47.01, -120.01] as [number, number],
          type: 'junction' as const,
          notes: '',
        },
        {
          name: 'Point C',
          mile: 2,
          elevationFeet: 1584, // +1056 ft over 1 mile = 20.0% gradient
          coordinates: [47.02, -120.02] as [number, number],
          type: 'summit' as const,
          notes: '',
        },
      ];

      const { maxGradientPercent, avgGradientPercent } = calculateElevationGradient(waypoints);
      expect(maxGradientPercent).toBe(20.0);
      expect(avgGradientPercent).toBe(15.0);
    });
  });

  describe('GPX Export Generation', () => {
    it('generates well-formed GPX XML with metadata, waypoints, and trackpoints', () => {
      const enchantments = getTrailRouteBySlug('enchantments-thru-hike')!;
      const gpx = generateGpxExport(enchantments);

      expect(gpx).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(gpx).toContain('<gpx version="1.1"');
      expect(gpx).toContain('<metadata>');
      expect(gpx).toContain('<name>The Enchantments Thru-Hike</name>');
      expect(gpx).toContain('<wpt lat="47.488" lon="-120.822">');
      expect(gpx).toContain('<name>Aasgard Pass</name>');
      expect(gpx).toContain('<trk>');
      expect(gpx).toContain('<trkseg>');
      expect(gpx).toContain('<trkpt lat="47.543" lon="-120.704">');
      expect(gpx).toContain('</gpx>');
    });

    it('honors includeWaypoints=false option', () => {
      const enchantments = getTrailRouteBySlug('enchantments-thru-hike')!;
      const gpx = generateGpxExport(enchantments, { includeWaypoints: false });

      expect(gpx).not.toContain('<wpt');
      expect(gpx).toContain('<trk>');
    });

    it('honors includeElevationProfile=false option', () => {
      const enchantments = getTrailRouteBySlug('enchantments-thru-hike')!;
      const gpx = generateGpxExport(enchantments, { includeElevationProfile: false });

      expect(gpx).not.toContain('<ele>');
    });

    it('ensures each route in catalog has populated gpxContent', () => {
      for (const route of TRAIL_ROUTES) {
        expect(route.gpxContent).toBeTruthy();
        expect(route.gpxContent).toContain('<?xml');
        expect(route.gpxContent).toContain(route.wildernessArea);
        expect(route.gpxContent).toContain('<trk>');
      }
    });
  });
});
