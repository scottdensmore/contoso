export type NocturnalStyle =
  | 'alpine_gorge_suspension'
  | 'vertical_granite_face'
  | 'knife_edge_arete'
  | 'glacier_rim_traverse';

export type MoonlightIllumination =
  | 'full_moon_glare'
  | 'quarter_crescent'
  | 'new_moon_pitch_black'
  | 'starlight_overcast';

export type SafetyRating =
  | 'optimal_moonlight_ascent'
  | 'caution_high_headlamp_beam_required'
  | 'hazardous_zero_visibility_abort';

export interface NightViaFerrataRoute {
  id: string;
  title: string;
  mountainRange: string;
  region: string;
  routeElevationM: number;
  suspensionBridgeSpanM: number;
  verticalDropM: number;
  nocturnalStyle: NocturnalStyle;
  maxGrade: string;
  description: string;
  highlights: string[];
}

export interface NightViaFerrataQuery {
  routeId: string;
  moonlightCondition: MoonlightIllumination; // default 'quarter_crescent'
  headlampLumens: number; // 200 to 2000 lm, default 800
  windGustsKph: number; // 0 to 80 kph, default 25
  temperatureC: number; // -15 to 15°C, default 2
}

export interface NightViaFerrataResult {
  routeTitle: string;
  nocturnalStyle: NocturnalStyle;
  maxGrade: string;
  effectiveVisibilityMeters: number;
  bridgeSwayAmplitudeCm: number;
  hypothermiaRiskIndex: number;
  safetyRating: SafetyRating;
  lightingRecommendation: string;
  nocturnalAdvisory: string;
}

export interface NightViaFerrataGearItem {
  id: string;
  name: string;
  category: 'lighting' | 'lanyards' | 'helmet' | 'gloves' | 'harness' | 'backup_lighting';
  mandatory: boolean;
  description: string;
}

export const NIGHT_VIA_FERRATA_ROUTES: NightViaFerrataRoute[] = [
  {
    id: 'dolomites-kellner-night-traverse',
    title: 'Dolomites Ivano Dibona Nocturnal Suspension',
    mountainRange: 'Monte Cristallo, Dolomites',
    region: 'Italy',
    routeElevationM: 2950,
    suspensionBridgeSpanM: 30,
    verticalDropM: 450,
    nocturnalStyle: 'alpine_gorge_suspension',
    maxGrade: 'C/D',
    description:
      'Historic WW1 high-altitude iron rungs and suspension wooden footbridge crossing under celestial moonlight.',
    highlights: [
      'Suspension wooden footbridge under full moonlight',
      'WW1 historic high-altitude iron rungs',
      'Stygian gorge abyss illumination',
    ],
  },
  {
    id: 'ouray-canyon-night-ferrata',
    title: 'Ouray Uncompahgre Gorge Night Ferrata',
    mountainRange: 'San Juan Mountains',
    region: 'CO',
    routeElevationM: 2450,
    suspensionBridgeSpanM: 24,
    verticalDropM: 280,
    nocturnalStyle: 'vertical_granite_face',
    maxGrade: 'C',
    description:
      'Sheer vertical granite gorge wall ascent above the roaring Uncompahgre River in midnight shadows.',
    highlights: [
      'Thunder River roaring below in total darkness',
      'Dual-beam red/white headlight traverse',
      'Overhanging iron ladder rung climbing',
    ],
  },
  {
    id: 'telluride-krogerata-moonlight',
    title: 'Telluride Krogerata Midnight Iron Way',
    mountainRange: 'San Miguel Canyon',
    region: 'CO',
    routeElevationM: 3150,
    suspensionBridgeSpanM: 18,
    verticalDropM: 320,
    nocturnalStyle: 'knife_edge_arete',
    maxGrade: 'D',
    description:
      'Exposed knife-edge arete tightrope cable bridge suspended high over Bridal Veil Falls under the stars.',
    highlights: [
      'Main event cable tightrope over black void',
      'Bridal Veil Falls starlight mist spray',
      'High exposure slick granite stepping stones',
    ],
  },
  {
    id: 'mammoth-pass-starlight-traverse',
    title: 'Mammoth Pass Starlight Cliff Traverse',
    mountainRange: 'Eastern Sierra',
    region: 'CA',
    routeElevationM: 3400,
    suspensionBridgeSpanM: 35,
    verticalDropM: 520,
    nocturnalStyle: 'glacier_rim_traverse',
    maxGrade: 'D/E',
    description:
      'High-altitude sub-zero glacier rim traversing frozen volcanic crags against the silhouette of the Minarets.',
    highlights: [
      'Ritter Range silhouette moonrise backdrop',
      'Cold high-alpine nocturnal downdrafts',
      'Sub-zero rime ice cable detection',
    ],
  },
  {
    id: 'chamonix-aiguilles-rouges-darksky',
    title: 'Chamonix Aiguilles Rouges Dark Sky Way',
    mountainRange: 'Mont Blanc Massif',
    region: 'France',
    routeElevationM: 2600,
    suspensionBridgeSpanM: 28,
    verticalDropM: 380,
    nocturnalStyle: 'alpine_gorge_suspension',
    maxGrade: 'B/C',
    description:
      'High alpine darkness sanctuary traverse offering luminous views of Mont Blanc\'s glaciated summits.',
    highlights: [
      'Mont Blanc glacier night glow vantage',
      'Nepalese three-cable aerial void crossing',
      'Nocturnal alpine chamois habitat protection',
    ],
  },
];

export const NIGHT_VIA_FERRATA_GEAR: NightViaFerrataGearItem[] = [
  {
    id: 'dual-beam-alpine-headlamp-1200lm',
    name: 'High-Output Dual-Beam 1200-Lumen Alpine Headlamp with Cold-Resistant Battery',
    category: 'lighting',
    mandatory: true,
    description:
      'Dual flood/spot beam system with cold-weather lithium power pack for reliable route identification.',
  },
  {
    id: 'en958-energy-absorbing-lanyards',
    name: 'EN 958 Compliant Elasticated Energy Absorption Lanyards with Auto-Locking Carabiners',
    category: 'lanyards',
    mandatory: true,
    description:
      'Progressive tear-webbing lanyard rated for dynamic falls on vertical iron cables and suspension spans.',
  },
  {
    id: 'glow-in-the-dark-climbing-helmet',
    name: 'Photoluminescent High-Impact Mountaineering Helmet (CE EN 12492)',
    category: 'helmet',
    mandatory: true,
    description:
      'High-visibility luminescent shell protecting against nocturnal rockfall and cable whip.',
  },
  {
    id: 'thermal-friction-grip-gloves',
    name: 'Thermal Windproof Full-Finger Via Ferrata Gloves with Reinforced Palms',
    category: 'gloves',
    mandatory: true,
    description:
      'Kevlar-reinforced palms with thermal fleece lining for icy rungs and steel cables in sub-zero drafts.',
  },
  {
    id: 'reflective-padded-sit-chest-harness',
    name: 'Reflective 3M Padded Sit & Chest Harness Combination',
    category: 'harness',
    mandatory: true,
    description:
      'Sit harness paired with chest harness and reflective tape to maintain upright orientation during void exposure.',
  },
  {
    id: 'backup-rechargeable-lumen-core',
    name: 'Waterproof Backup 450-Lumen Compact Emergency Headlamp & Strobe',
    category: 'backup_lighting',
    mandatory: true,
    description:
      'Redundant IPX8 lighting unit with SOS beacon functionality in case of primary headlamp failure.',
  },
];

export function getNightViaFerrataRoutes(style?: NocturnalStyle): NightViaFerrataRoute[] {
  if (!style) {
    return NIGHT_VIA_FERRATA_ROUTES;
  }
  return NIGHT_VIA_FERRATA_ROUTES.filter((route) => route.nocturnalStyle === style);
}

export function getNightViaFerrataRouteById(id: string): NightViaFerrataRoute | undefined {
  return NIGHT_VIA_FERRATA_ROUTES.find((route) => route.id === id);
}

export function getNightViaFerrataGear(): NightViaFerrataGearItem[] {
  return NIGHT_VIA_FERRATA_GEAR;
}

const MOON_MULTIPLIERS: Record<MoonlightIllumination, number> = {
  full_moon_glare: 1.5,
  quarter_crescent: 1.0,
  starlight_overcast: 0.7,
  new_moon_pitch_black: 0.5,
};

export function calculateNightViaFerrataDynamics(
  query: NightViaFerrataQuery
): NightViaFerrataResult {
  const route = getNightViaFerrataRouteById(query.routeId);
  if (!route) {
    throw new Error(`Night via ferrata route with id "${query.routeId}" not found.`);
  }

  const moonMultiplier = MOON_MULTIPLIERS[query.moonlightCondition] ?? 1.0;
  const effectiveVisibilityMeters = Math.min(
    120,
    Math.round((query.headlampLumens / 15) * moonMultiplier)
  );

  const bridgeSwayAmplitudeCm = Math.round(
    route.suspensionBridgeSpanM * 0.4 * (query.windGustsKph / 20)
  );

  const hypothermiaRiskIndex = Math.max(
    1,
    Math.min(10, Math.round(5 - query.temperatureC * 0.3 + query.windGustsKph * 0.05))
  );

  let safetyRating: SafetyRating;
  if (
    (query.headlampLumens < 400 && query.moonlightCondition === 'new_moon_pitch_black') ||
    query.windGustsKph > 55 ||
    query.temperatureC < -10
  ) {
    safetyRating = 'hazardous_zero_visibility_abort';
  } else if (
    query.headlampLumens < 700 ||
    query.windGustsKph >= 35 ||
    query.temperatureC <= 0
  ) {
    safetyRating = 'caution_high_headlamp_beam_required';
  } else {
    safetyRating = 'optimal_moonlight_ascent';
  }

  let lightingRecommendation = '';
  let nocturnalAdvisory = '';

  if (safetyRating === 'hazardous_zero_visibility_abort') {
    lightingRecommendation =
      'Emergency lighting protocol only. Primary beam penetration is inadequate for safe cable transfers in current darkness.';
    nocturnalAdvisory =
      'Hazardous zero-visibility conditions detected. High wind gusts, severe frost, or pitch-black darkness exceed safe margins. Abort traverse or hold in emergency shelter.';
  } else if (safetyRating === 'caution_high_headlamp_beam_required') {
    lightingRecommendation =
      'High-beam focused spotlight (700+ lumens) required. Concentrate beam on upcoming iron rungs and ice rimed cables.';
    nocturnalAdvisory =
      'Elevated caution required. Sub-zero temperatures or gusty wind sway demand double-checking carabiner gates at all cable junctions.';
  } else {
    lightingRecommendation =
      'Balanced wide-angle flood beam with ambient moonlight integration. Excellent contrast across rock face and suspension spans.';
    nocturnalAdvisory =
      'Optimal moonlight ascent conditions. Moderate bridge sway and clear celestial illumination provide safe progression.';
  }

  return {
    routeTitle: route.title,
    nocturnalStyle: route.nocturnalStyle,
    maxGrade: route.maxGrade,
    effectiveVisibilityMeters,
    bridgeSwayAmplitudeCm,
    hypothermiaRiskIndex,
    safetyRating,
    lightingRecommendation,
    nocturnalAdvisory,
  };
}
