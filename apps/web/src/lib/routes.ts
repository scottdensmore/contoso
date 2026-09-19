export type RouteDifficulty = 'easy' | 'moderate' | 'strenuous' | 'expert';

export interface RouteWaypoint {
  name: string;
  mile: number;
  elevationFeet: number;
  coordinates: [number, number]; // [lat, lng]
  type: 'trailhead' | 'junction' | 'summit' | 'water_source' | 'campsite';
  notes: string;
}

export interface TrailRoute {
  id: string;
  slug: string;
  name: string;
  region: string;
  wildernessArea: string;
  distanceMiles: number;
  elevationGainFeet: number;
  highestPointFeet: number;
  difficulty: RouteDifficulty;
  estimatedHours: number;
  waypoints: RouteWaypoint[];
  gpxContent: string;
  description: string;
  highlights: string[];
}

export interface RouteExportOptions {
  format: 'gpx' | 'kml' | 'json';
  includeWaypoints: boolean;
  includeElevationProfile: boolean;
}

export interface RouteFilter {
  region?: string;
  difficulty?: RouteDifficulty;
  searchQuery?: string;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export function generateGpxExport(
  route: TrailRoute,
  options?: Partial<RouteExportOptions>
): string {
  const includeWaypoints = options?.includeWaypoints ?? true;
  const includeElevationProfile = options?.includeElevationProfile ?? true;

  const waypointsXml = includeWaypoints
    ? route.waypoints
        .map((wpt) => {
          const eleXml = includeElevationProfile
            ? `\n    <ele>${(wpt.elevationFeet * 0.3048).toFixed(1)}</ele>`
            : '';
          return `  <wpt lat="${wpt.coordinates[0]}" lon="${wpt.coordinates[1]}">${eleXml}
    <name>${escapeXml(wpt.name)}</name>
    <desc>${escapeXml(wpt.notes)}</desc>
    <type>${wpt.type}</type>
  </wpt>`;
        })
        .join('\n')
    : '';

  const trkptsXml = route.waypoints
    .map((wpt) => {
      const eleXml = includeElevationProfile
        ? `\n        <ele>${(wpt.elevationFeet * 0.3048).toFixed(1)}</ele>`
        : '';
      return `      <trkpt lat="${wpt.coordinates[0]}" lon="${wpt.coordinates[1]}">${eleXml}
      </trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Contoso Outdoors Wilderness GPS Exporter" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(route.name)}</name>
    <desc>${escapeXml(`${route.wildernessArea} - ${route.difficulty.toUpperCase()} - ${route.distanceMiles} miles - +${route.elevationGainFeet} ft gain`)}</desc>
    <time>2026-09-19T11:00:00Z</time>
  </metadata>
${waypointsXml ? waypointsXml + '\n' : ''}  <trk>
    <name>${escapeXml(route.name)}</name>
    <desc>${escapeXml(route.description)}</desc>
    <trkseg>
${trkptsXml}
    </trkseg>
  </trk>
</gpx>`;
}

export function calculateElevationGradient(waypoints: RouteWaypoint[]): {
  maxGradientPercent: number;
  avgGradientPercent: number;
} {
  if (waypoints.length < 2) {
    return { maxGradientPercent: 0, avgGradientPercent: 0 };
  }

  let maxGradient = 0;
  let totalDeltaFeet = 0;
  let totalDistMiles = 0;

  for (let i = 1; i < waypoints.length; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const distMiles = Math.abs(curr.mile - prev.mile);
    const elevChangeFeet = Math.abs(curr.elevationFeet - prev.elevationFeet);

    if (distMiles > 0) {
      const distFeet = distMiles * 5280;
      const gradient = (elevChangeFeet / distFeet) * 100;
      if (gradient > maxGradient) {
        maxGradient = gradient;
      }
    }

    totalDeltaFeet += elevChangeFeet;
    totalDistMiles += distMiles;
  }

  const avgGradient =
    totalDistMiles > 0 ? (totalDeltaFeet / (totalDistMiles * 5280)) * 100 : 0;

  return {
    maxGradientPercent: Math.round(maxGradient * 10) / 10,
    avgGradientPercent: Math.round(avgGradient * 10) / 10,
  };
}

const RAW_TRAIL_ROUTES: Omit<TrailRoute, 'gpxContent'>[] = [
  {
    id: 'enchantments-thru-hike',
    slug: 'enchantments-thru-hike',
    name: 'The Enchantments Thru-Hike',
    region: 'Cascades',
    wildernessArea: 'Alpine Lakes Wilderness',
    distanceMiles: 18.5,
    elevationGainFeet: 4500,
    highestPointFeet: 7841,
    difficulty: 'expert',
    estimatedHours: 12.0,
    waypoints: [
      {
        name: 'Snow Lakes Trailhead',
        mile: 0,
        elevationFeet: 1300,
        coordinates: [47.543, -120.704],
        type: 'trailhead',
        notes: 'Lower trailhead parking and permit registration kiosk',
      },
      {
        name: 'Nada Lake',
        mile: 5.5,
        elevationFeet: 5000,
        coordinates: [47.512, -120.755],
        type: 'water_source',
        notes: 'First major water refilling point and designated backcountry campsites',
      },
      {
        name: 'Lower Enchantments',
        mile: 9.0,
        elevationFeet: 6800,
        coordinates: [47.491, -120.798],
        type: 'campsite',
        notes: 'Granite basin entrance, alpine tarns, and mountain goat habitat',
      },
      {
        name: 'Aasgard Pass',
        mile: 14.5,
        elevationFeet: 7841,
        coordinates: [47.488, -120.822],
        type: 'summit',
        notes: 'Steep scree chute crest connecting Upper Enchantments to Colchuck basin',
      },
      {
        name: 'Colchuck Lake',
        mile: 16.0,
        elevationFeet: 5600,
        coordinates: [47.497, -120.835],
        type: 'water_source',
        notes: 'Turquoise glacial cirque beneath Dragontail Peak and Colchuck Peak',
      },
      {
        name: 'Stuart Lake Trailhead',
        mile: 18.5,
        elevationFeet: 3400,
        coordinates: [47.527, -120.820],
        type: 'trailhead',
        notes: 'Upper exit trailhead at Bridge Creek and Forest Service Road 7601',
      },
    ],
    description:
      'A legendary Pacific Northwest alpine crossing through jagged granite spires, crystal-clear glacial tarns, and the grueling boulder fields of Aasgard Pass.',
    highlights: [
      'Alpine Lakes Wilderness Core Zone',
      'Aasgard Pass crest at 7,841 ft',
      'Colchuck & Snow Lakes basins',
      'Mountain goat habitats',
    ],
  },
  {
    id: 'spray-park-loop',
    slug: 'spray-park-loop',
    name: 'Spray Park & Mount Rainier Loop',
    region: 'Mount Rainier',
    wildernessArea: 'Mount Rainier Wilderness',
    distanceMiles: 16.0,
    elevationGainFeet: 3600,
    highestPointFeet: 6400,
    difficulty: 'strenuous',
    estimatedHours: 8.5,
    waypoints: [
      {
        name: 'Mowich Lake Trailhead',
        mile: 0,
        elevationFeet: 4929,
        coordinates: [46.933, -121.863],
        type: 'trailhead',
        notes: 'Mowich Lake campground and Wonderland Trail junction',
      },
      {
        name: 'Spray Falls',
        mile: 2.1,
        elevationFeet: 5300,
        coordinates: [46.920, -121.848],
        type: 'water_source',
        notes: 'Dramatic 354-foot waterfall cascade pouring from Mount Rainier snowfields',
      },
      {
        name: 'Spray Park Meadows',
        mile: 3.5,
        elevationFeet: 6400,
        coordinates: [46.915, -121.825],
        type: 'summit',
        notes: 'Lush subalpine wildflower meadows with up-close views of Mount Rainier',
      },
      {
        name: 'Seattle Park',
        mile: 5.0,
        elevationFeet: 5900,
        coordinates: [46.928, -121.808],
        type: 'campsite',
        notes: 'Quiet high meadow basin bordering Carbon River drainage',
      },
      {
        name: 'Carbon River Suspension Bridge',
        mile: 8.5,
        elevationFeet: 3100,
        coordinates: [46.966, -121.782],
        type: 'junction',
        notes: 'Engineering marvel suspension bridge over glacial Carbon River',
      },
      {
        name: 'Ipsut Pass',
        mile: 12.0,
        elevationFeet: 5100,
        coordinates: [46.967, -121.839],
        type: 'summit',
        notes: 'Steep switchbacks scaling the headwall back toward Mowich Lake',
      },
      {
        name: 'Mowich Lake Trailhead',
        mile: 16.0,
        elevationFeet: 4929,
        coordinates: [46.933, -121.863],
        type: 'trailhead',
        notes: 'Loop completion at Mowich Lake patrol cabin',
      },
    ],
    description:
      'A rugged circuit traversing wildflower-carpeted subalpine meadows, torrential glacial waterfalls, and the roaring Carbon River suspension crossing.',
    highlights: [
      'Spray Falls 354-ft viewpoint',
      'Vibrant alpine meadows of Spray Park',
      'Carbon River suspension bridge crossing',
      'Wonderland Trail connection',
    ],
  },
  {
    id: 'hoh-river-blue-glacier',
    slug: 'hoh-river-blue-glacier',
    name: 'Hoh River Trail to Blue Glacier',
    region: 'Olympic National Park',
    wildernessArea: 'Olympic Wilderness',
    distanceMiles: 34.8,
    elevationGainFeet: 3700,
    highestPointFeet: 4300,
    difficulty: 'strenuous',
    estimatedHours: 20.0,
    waypoints: [
      {
        name: 'Hoh Rain Forest Visitor Center',
        mile: 0,
        elevationFeet: 578,
        coordinates: [47.860, -123.934],
        type: 'trailhead',
        notes: 'Hoh Visitor Center and temperate rainforest trailhead',
      },
      {
        name: 'Olympus Guard Station',
        mile: 9.1,
        elevationFeet: 950,
        coordinates: [47.818, -123.825],
        type: 'campsite',
        notes: 'Historic ranger station, backcountry campsites, and reliable water',
      },
      {
        name: 'Lewis Meadow',
        mile: 13.2,
        elevationFeet: 1200,
        coordinates: [47.808, -123.754],
        type: 'campsite',
        notes: 'Expansive gravel bar campsites along the glacial Hoh River',
      },
      {
        name: 'Elk Lake',
        mile: 15.1,
        elevationFeet: 2500,
        coordinates: [47.805, -123.719],
        type: 'water_source',
        notes: 'Alpine lake transition marking the start of steep ascent to Mount Olympus',
      },
      {
        name: 'Glacier Meadows',
        mile: 17.1,
        elevationFeet: 4300,
        coordinates: [47.784, -123.702],
        type: 'campsite',
        notes: 'High alpine basecamp below the Blue Glacier terminus and rope ladder',
      },
      {
        name: 'Lateral Moraine Overlook',
        mile: 17.4,
        elevationFeet: 5200,
        coordinates: [47.780, -123.693],
        type: 'summit',
        notes: 'Breathtaking terminus vantage directly overlooking Blue Glacier icefall',
      },
    ],
    description:
      'Epic wilderness trek from dense temperate moss rainforests to the awe-inspiring icefalls and seracs of Mount Olympus Blue Glacier.',
    highlights: [
      'Ancient Hoh Rainforest moss canopies',
      'Wild glacier-fed river valley',
      'Glacier Meadows alpine camp',
      'Massive Blue Glacier lateral moraine overlook',
    ],
  },
  {
    id: 'goat-rocks-knife-edge',
    slug: 'goat-rocks-knife-edge',
    name: "Goat Rocks Wilderness Knife's Edge",
    region: 'Cascades',
    wildernessArea: 'Goat Rocks Wilderness',
    distanceMiles: 12.4,
    elevationGainFeet: 3200,
    highestPointFeet: 6900,
    difficulty: 'strenuous',
    estimatedHours: 7.5,
    waypoints: [
      {
        name: 'Snowgrass Flat Trailhead',
        mile: 0,
        elevationFeet: 4600,
        coordinates: [46.505, -121.521],
        type: 'trailhead',
        notes: 'Chambers Lake access road trailhead parking',
      },
      {
        name: 'Snowgrass Flats',
        mile: 4.2,
        elevationFeet: 6000,
        coordinates: [46.516, -121.464],
        type: 'campsite',
        notes: 'Expansive alpine meadows with streams and prime tent sites',
      },
      {
        name: 'Goat Lake',
        mile: 6.5,
        elevationFeet: 6400,
        coordinates: [46.501, -121.442],
        type: 'water_source',
        notes: 'Semi-frozen glacial cirque lake surrounded by talus slopes',
      },
      {
        name: "Knife's Edge Crest",
        mile: 7.8,
        elevationFeet: 6900,
        coordinates: [46.510, -121.433],
        type: 'summit',
        notes: 'Exhilarating knife-edge ridge traverse along the Pacific Crest Trail',
      },
      {
        name: 'Cispus Pass',
        mile: 10.2,
        elevationFeet: 6475,
        coordinates: [46.488, -121.436],
        type: 'junction',
        notes: 'High pass overlooking the upper Cispus River basin',
      },
      {
        name: 'Trailhead Return',
        mile: 12.4,
        elevationFeet: 4600,
        coordinates: [46.505, -121.521],
        type: 'trailhead',
        notes: 'Loop completion back to Snowgrass Flat Trailhead',
      },
    ],
    description:
      'A high-wire ridgeline traverse along the Pacific Crest Trail featuring vertigo-inducing views of Mount Rainier, Mount Adams, and Mount St. Helens.',
    highlights: [
      "Knife's Edge PCT spine traverse",
      'Turquoise waters of alpine Goat Lake',
      'Panoramic vistas of Cascade volcanoes',
      'Expansive Snowgrass Flats wildflower gardens',
    ],
  },
  {
    id: 'rattlesnake-ledge',
    slug: 'rattlesnake-ledge',
    name: 'Rattlesnake Ledge Trail',
    region: 'North Bend',
    wildernessArea: 'Rattlesnake Mountain Scenic Area',
    distanceMiles: 4.0,
    elevationGainFeet: 1160,
    highestPointFeet: 2070,
    difficulty: 'easy',
    estimatedHours: 2.0,
    waypoints: [
      {
        name: 'Rattlesnake Lake Recreation Area',
        mile: 0,
        elevationFeet: 910,
        coordinates: [47.434, -121.768],
        type: 'trailhead',
        notes: 'Main recreation parking lot, restrooms, and lake shore access',
      },
      {
        name: 'First Ledge Viewpoint',
        mile: 2.0,
        elevationFeet: 2070,
        coordinates: [47.435, -121.794],
        type: 'summit',
        notes: 'Massive rock outcropping high above Rattlesnake Lake with sweeping valley views',
      },
    ],
    description:
      'A classic, accessible Pacific Northwest hike through lush second-growth cedar forests leading to dramatic sheer rock ledges overlooking Rattlesnake Lake.',
    highlights: [
      'Monolithic exposed rock ledge',
      'Panoramic Rattlesnake Lake vistas',
      'Accessible well-graded switchbacks',
      'Close proximity to Seattle metro',
    ],
  },
];

export const TRAIL_ROUTES: TrailRoute[] = RAW_TRAIL_ROUTES.map((route) => {
  const gpxContent = generateGpxExport({ ...route, gpxContent: '' });
  return {
    ...route,
    gpxContent,
  };
});

export function getTrailRoutes(filters?: RouteFilter): TrailRoute[] {
  if (!filters) return TRAIL_ROUTES;

  return TRAIL_ROUTES.filter((route) => {
    if (filters.region && filters.region !== 'All') {
      const regionMatch =
        route.region.toLowerCase() === filters.region.toLowerCase() ||
        route.region.toLowerCase().includes(filters.region.toLowerCase());
      if (!regionMatch) return false;
    }

    if (filters.difficulty && filters.difficulty !== ('All' as unknown as RouteDifficulty)) {
      if (route.difficulty !== filters.difficulty) return false;
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      const inName = route.name.toLowerCase().includes(q);
      const inDesc = route.description.toLowerCase().includes(q);
      const inWilderness = route.wildernessArea.toLowerCase().includes(q);
      const inRegion = route.region.toLowerCase().includes(q);
      const inWaypoints = route.waypoints.some(
        (w) => w.name.toLowerCase().includes(q) || w.notes.toLowerCase().includes(q)
      );
      const inHighlights = route.highlights.some((h) => h.toLowerCase().includes(q));

      if (!inName && !inDesc && !inWilderness && !inRegion && !inWaypoints && !inHighlights) {
        return false;
      }
    }

    return true;
  });
}

export function getTrailRouteBySlug(slug: string): TrailRoute | undefined {
  return TRAIL_ROUTES.find((r) => r.slug === slug);
}
