export type BortleClass = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CelestialTarget = 'deep_sky' | 'planets' | 'milky_way' | 'meteor_shower' | 'aurora';
export type MoonPhase =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'third_quarter'
  | 'waning_crescent';

export interface ObservingSite {
  id: string;
  name: string;
  region: string;
  bortleClass: BortleClass;
  sqmReading: number;
  elevationFt: number;
  coordinates: { lat: number; lng: number };
  bestSeasons: string[];
  featuredTargets: string[];
  accessNotes: string;
  overnightCamping: boolean;
}

export interface ViewingWindowQuery {
  siteId: string;
  moonPhase: MoonPhase;
  cloudCoverPercent: number;
  targetType: CelestialTarget;
}

export interface ViewingWindowResult {
  viewingQuality: 'optimal' | 'good' | 'marginal' | 'poor';
  score: number;
  reasons: string[];
  recommendedOptics: string;
  darkAdaptationNotice: string;
}

export interface MeteorShower {
  id: string;
  name: string;
  peakDate: string;
  zhrRate: number;
  parentBody: string;
  notes: string;
}

export interface StargazingGearItem {
  id: string;
  name: string;
  category: 'optics' | 'lighting' | 'comfort' | 'navigation';
  essential: boolean;
  notes: string;
}

export const STARGAZING_SITES: ObservingSite[] = [
  {
    id: 'prineville-reservoir',
    name: 'Prineville Reservoir State Park',
    region: 'Central Oregon (Dark Sky Park)',
    bortleClass: 2,
    sqmReading: 21.75,
    elevationFt: 3200,
    coordinates: { lat: 44.1568, lng: -120.7329 },
    bestSeasons: ['summer', 'fall'],
    featuredTargets: ['Milky Way core', 'Perseid meteors', 'M31 Andromeda'],
    accessNotes:
      'Designated International Dark Sky Park. Paved highway access, dedicated lakeside observing areas, developed campgrounds with yurt and cabin rentals.',
    overnightCamping: true,
  },
  {
    id: 'artist-point-baker',
    name: 'Artist Point at Mount Baker',
    region: 'Washington Cascades',
    bortleClass: 3,
    sqmReading: 21.45,
    elevationFt: 5100,
    coordinates: { lat: 48.8471, lng: -121.6934 },
    bestSeasons: ['summer', 'early_fall'],
    featuredTargets: ['Aurora Borealis', 'Milky Way arches', 'Star clusters'],
    accessNotes:
      'Paved mountain highway (SR 542) open seasonally (July to October). Day-use parking lot with 360-degree Cascade vistas; overnight camping in parking lot is prohibited.',
    overnightCamping: false,
  },
  {
    id: 'john-day-fossil',
    name: 'John Day Fossil Beds - Painted Hills',
    region: 'Eastern Oregon',
    bortleClass: 1,
    sqmReading: 21.95,
    elevationFt: 2300,
    coordinates: { lat: 44.6616, lng: -120.2736 },
    bestSeasons: ['spring', 'summer', 'fall'],
    featuredTargets: ['Zodiacal light', 'Deep sky nebulae', 'Pinwheel galaxy'],
    accessNotes:
      'Paved road access with daylight scenic overlooks. Day-use only inside National Monument boundaries; dispersed BLM public camping available nearby.',
    overnightCamping: false,
  },
  {
    id: 'copper-ridge-cascades',
    name: 'Copper Ridge Fire Lookout',
    region: 'North Cascades National Park',
    bortleClass: 1,
    sqmReading: 21.98,
    elevationFt: 5400,
    coordinates: { lat: 48.9192, lng: -121.4089 },
    bestSeasons: ['summer'],
    featuredTargets: ['Unfiltered galactic core', 'Airglow', 'Faint comets'],
    accessNotes:
      'Challenging 15-mile backcountry alpine hike via Hannegan Pass. Backcountry permit required; designated wilderness tent pads available adjacent to the historic lookout.',
    overnightCamping: true,
  },
  {
    id: 'crater-lake-rim',
    name: 'Crater Lake Rim Watchman Overlook',
    region: 'Southern Oregon Cascades',
    bortleClass: 2,
    sqmReading: 21.8,
    elevationFt: 7400,
    coordinates: { lat: 42.9463, lng: -122.1678 },
    bestSeasons: ['summer', 'fall'],
    featuredTargets: ['Deep sky clusters', 'High elevation transparency', 'Planetary alignments'],
    accessNotes:
      'West Rim Drive pullout at high elevation. Mazama Village campground open seasonally; high-altitude freezing temperatures possible year-round.',
    overnightCamping: true,
  },
];

export const METEOR_SHOWERS: MeteorShower[] = [
  {
    id: 'perseids',
    name: 'Perseids',
    peakDate: 'August 12-13',
    zhrRate: 100,
    parentBody: '109P/Swift-Tuttle',
    notes: 'Warm summer night observing, bright fireballs with persistent trains',
  },
  {
    id: 'geminids',
    name: 'Geminids',
    peakDate: 'December 13-14',
    zhrRate: 120,
    parentBody: '3200 Phaethon',
    notes: 'Strongest annual shower with slow multi-colored meteors',
  },
  {
    id: 'orionids',
    name: 'Orionids',
    peakDate: 'October 21-22',
    zhrRate: 20,
    parentBody: '1P/Halley',
    notes: 'Fast meteors radiating from Orion constellation',
  },
  {
    id: 'lyrids',
    name: 'Lyrids',
    peakDate: 'April 21-22',
    zhrRate: 18,
    parentBody: 'C/1861 G1 Thatcher',
    notes: 'Spring shower with occasional surges up to 100 per hour',
  },
];

export const STARGAZING_GEAR: StargazingGearItem[] = [
  {
    id: 'optics-binoculars-10x50',
    name: '10x50 Porro-Prism Astronomy Binoculars',
    category: 'optics',
    essential: true,
    notes: 'Wide 6.5° field of view ideal for scanning the Milky Way and pinpointing bright nebulae.',
  },
  {
    id: 'optics-dobsonian-reflector',
    name: '8-Inch Parabolic Dobsonian Reflector',
    category: 'optics',
    essential: false,
    notes: 'High light gathering aperture for revealing spiral galaxy structures and faint globular clusters.',
  },
  {
    id: 'optics-dew-heater',
    name: 'Dew Shield & USB Eyepiece Heater Band',
    category: 'optics',
    essential: true,
    notes: 'Prevents condensation and frost from obscuring optical elements during night temperature drops.',
  },
  {
    id: 'lighting-red-headlamp',
    name: 'Astronomical Red LED Headlamp (Dimmable)',
    category: 'lighting',
    essential: true,
    notes: 'True red light (>620nm) preserves rhodopsin and protects 20-30 minute night visual adaptation.',
  },
  {
    id: 'lighting-red-device-filter',
    name: 'Rubylith Red Filter Sheet for Mobile Screens',
    category: 'lighting',
    essential: true,
    notes: 'Covers smartphone or tablet screens to avoid destructive white/blue light flashes.',
  },
  {
    id: 'comfort-reclining-chair',
    name: 'Zero-Gravity Reclining Camp Chair',
    category: 'comfort',
    essential: true,
    notes: 'Eliminates neck and spine strain during extended zenith observing and meteor watches.',
  },
  {
    id: 'comfort-thermal-sleeping-mat',
    name: 'Insulated Sub-Zero Ground Pad & Sleeping Bag',
    category: 'comfort',
    essential: true,
    notes: 'Blocks conductive ground chill when observing meteors lying flat in alpine conditions.',
  },
  {
    id: 'navigation-planisphere',
    name: '40°–50° N Planisphere Star Wheel Chart',
    category: 'navigation',
    essential: true,
    notes: 'Moisture-resistant all-season mechanical celestial map for rapid manual star hopping.',
  },
  {
    id: 'navigation-red-compass',
    name: 'Phosphorescent Sighting Compass & Topo Map',
    category: 'navigation',
    essential: true,
    notes: 'Critical for navigating dark mountain trailheads and accurately finding Polaris celestial north.',
  },
];

export function getStargazingSites(bortleMax?: number): ObservingSite[] {
  if (bortleMax !== undefined) {
    return STARGAZING_SITES.filter((site) => site.bortleClass <= bortleMax);
  }
  return [...STARGAZING_SITES];
}

export function getStargazingSiteById(id: string): ObservingSite | undefined {
  return STARGAZING_SITES.find((site) => site.id === id);
}

export function getMeteorShowerCalendar(): MeteorShower[] {
  return [...METEOR_SHOWERS];
}

export function getStargazingGearChecklist(): StargazingGearItem[] {
  return [...STARGAZING_GEAR];
}

export function calculateViewingWindow(query: ViewingWindowQuery): ViewingWindowResult {
  const site = getStargazingSiteById(query.siteId);
  const reasons: string[] = [];

  let score = 100;

  // Site darkness evaluation
  if (site) {
    if (site.bortleClass === 1) {
      reasons.push(
        `Pristine Bortle 1 darkness (SQM ${site.sqmReading.toFixed(2)}) offers supreme contrast and unfiltered celestial views.`
      );
    } else if (site.bortleClass === 2) {
      score -= 5;
      reasons.push(
        `Bortle 2 dark sky preserve (SQM ${site.sqmReading.toFixed(2)}) features barely discernible horizon light domes.`
      );
    } else if (site.bortleClass === 3) {
      const penalty = query.targetType === 'planets' ? 4 : 12;
      score -= penalty;
      reasons.push(
        `Bortle 3 rural dark sky (SQM ${site.sqmReading.toFixed(2)}) with low light pollution.`
      );
    } else {
      const penalty = query.targetType === 'planets' ? 8 : 22;
      score -= penalty;
      reasons.push(`Bortle ${site.bortleClass} sky with noticeable ambient artificial light.`);
    }

    if (site.elevationFt >= 5000) {
      reasons.push(
        `High alpine elevation (${site.elevationFt.toLocaleString()} ft) rises above thermal inversions for exceptional atmospheric transparency.`
      );
    }
  } else {
    score -= 10;
    reasons.push('General baseline dark sky assumptions applied for this site.');
  }

  // Moon phase impact
  let moonPenalty = 0;
  switch (query.moonPhase) {
    case 'new_moon':
      moonPenalty = 0;
      reasons.push('New Moon creates a completely black sky background with zero lunar interference.');
      break;
    case 'waxing_crescent':
    case 'waning_crescent':
      moonPenalty = 8;
      reasons.push('Slender crescent moon offers minimal sky wash and long dark observation periods.');
      break;
    case 'first_quarter':
    case 'third_quarter':
      moonPenalty = 22;
      reasons.push('Quarter moon illuminates the atmosphere; best to view targets away from the moon or after moonset.');
      break;
    case 'waxing_gibbous':
    case 'waning_gibbous':
      moonPenalty = 42;
      reasons.push('Bright gibbous moon washes out faint nebulae and diffuse galactic dust.');
      break;
    case 'full_moon':
      moonPenalty = 58;
      reasons.push('Full Moon severely illuminates the entire sky, washing out faint deep sky targets and meteor streaks.');
      break;
  }

  if (query.targetType === 'planets') {
    moonPenalty = Math.round(moonPenalty * 0.35);
  }
  score -= moonPenalty;

  // Cloud cover impact
  const cloudPercent = Math.max(0, Math.min(100, query.cloudCoverPercent));
  if (cloudPercent === 0) {
    reasons.push('0% cloud cover provides pristine, completely unobstructed sky clarity from horizon to zenith.');
  } else if (cloudPercent <= 20) {
    const cloudPenalty = Math.round(cloudPercent * 0.7);
    score -= cloudPenalty;
    reasons.push(`Minimal cloud cover (${cloudPercent}%) leaves generous unobstructed viewing windows.`);
  } else if (cloudPercent <= 50) {
    const cloudPenalty = Math.round(cloudPercent * 0.85);
    score -= cloudPenalty;
    reasons.push(`Moderate cloud cover (${cloudPercent}%) intermittently restricts viewing lanes.`);
  } else {
    const cloudPenalty = Math.round(cloudPercent * 0.95);
    score -= cloudPenalty;
    reasons.push(`Heavy cloud cover (${cloudPercent}%) heavily blankets the sky, causing severe viewing obstruction.`);
  }

  // Heavy cloud guard
  if (cloudPercent >= 85) {
    score = Math.min(score, 25);
  }

  // Target specific advice
  switch (query.targetType) {
    case 'deep_sky':
      reasons.push('Deep sky targets (galaxies, planetary nebulae) require maximum dark adaptation and zero lunar glow.');
      break;
    case 'planets':
      reasons.push('Planetary details (Jupiter belts, Saturn rings) remain visible even under moderate moonlight or light pollution.');
      break;
    case 'milky_way':
      reasons.push('Milky Way galactic dust lanes and core features are most vibrant in Bortle 1-2 dark skies with no moon.');
      break;
    case 'meteor_shower':
      reasons.push('Meteor counts maximize under dark skies where faint terminal flashes and ion trains are visible.');
      break;
    case 'aurora':
      reasons.push('Auroral curtains and geomagnetic pillars need open northern horizons and dark skies.');
      break;
  }

  // Clamp score
  score = Math.max(5, Math.min(100, score));

  let viewingQuality: ViewingWindowResult['viewingQuality'] = 'poor';
  if (score >= 85) {
    viewingQuality = 'optimal';
  } else if (score >= 65) {
    viewingQuality = 'good';
  } else if (score >= 45) {
    viewingQuality = 'marginal';
  } else {
    viewingQuality = 'poor';
  }

  let recommendedOptics = '';
  switch (query.targetType) {
    case 'deep_sky':
      recommendedOptics = '8" to 10" Dobsonian Reflector with wide-field 2-inch eyepieces and UHC/O-III nebula filters';
      break;
    case 'planets':
      recommendedOptics = '100-150mm ED Refractor or Schmidt-Cassegrain with 6mm-9mm planetary eyepieces and 2x Barlow';
      break;
    case 'milky_way':
      recommendedOptics = '10x50 Astronomy Binoculars or fast wide-angle camera lens (14-24mm f/1.8 to f/2.8)';
      break;
    case 'meteor_shower':
      recommendedOptics = 'Naked eye with wide field of view; reclining chair and warm sleeping bag';
      break;
    case 'aurora':
      recommendedOptics = 'Fast wide-angle lens (14-20mm f/1.8 - f/2.8) on a sturdy tripod or naked eye';
      break;
  }

  const darkAdaptationNotice =
    'Use red light headlamps only (620nm+). It takes 20-30 minutes for eyes to build retinal rhodopsin for peak night vision. Any exposure to white light resets adaptation immediately.';

  return {
    viewingQuality,
    score,
    reasons,
    recommendedOptics,
    darkAdaptationNotice,
  };
}
