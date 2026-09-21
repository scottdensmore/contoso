export type NordicDiscipline = 'classic_track' | 'skate_skiing' | 'backcountry_touring' | 'light_touring';
export type TrailDifficulty = 'easy_green' | 'moderate_blue' | 'difficult_black' | 'expert_double_black';
export type SnowCondition = 'fresh_powder' | 'packed_powder' | 'hardpack_groomed' | 'granular_spring' | 'wet_slush';

export interface NordicTrail {
  id: string;
  trailName: string;
  systemName: string;
  region: string;
  distanceKm: number;
  elevationGainM: number;
  discipline: NordicDiscipline;
  difficulty: TrailDifficulty;
  groomedDaily: boolean;
  skateLaneWidthM: number;
  classicTracksCount: number;
  description: string;
  trailHighlights: string[];
}

export interface WaxAdvisorQuery {
  trailId: string;
  airTemperatureF: number;
  snowCondition: SnowCondition;
  skiBaseType: 'waxable' | 'skin_integrated' | 'fishscale_waxless';
}

export interface WaxAdvisorResult {
  trailAndSystem: string;
  recommendedKickWax: string;
  recommendedGlideWax: string;
  waxPocketPressure: string;
  klisterRequired: boolean;
  glideSpeedRating: 'fast' | 'moderate' | 'slow_sticky';
  waxAdvisory: string;
}

export interface NordicGearItem {
  id: string;
  name: string;
  category: 'skis_bindings' | 'boots_poles' | 'wax_tuning' | 'apparel' | 'safety';
  mandatory: boolean;
  description: string;
}

export const NORDIC_TRAILS: NordicTrail[] = [
  {
    id: 'methow-valley-community-trail',
    trailName: 'Methow Valley Community Trail',
    systemName: 'Methow Trails',
    region: 'Winthrop, WA',
    distanceKm: 30.0,
    elevationGainM: 180,
    discipline: 'classic_track',
    difficulty: 'easy_green',
    groomedDaily: true,
    skateLaneWidthM: 4.5,
    classicTracksCount: 2,
    description:
      'Spanning the scenic Methow Valley from Mazama through Winthrop, this premier grade-separated corridor delivers rolling riverside flats, suspension bridges, and panoramic North Cascades views.',
    trailHighlights: [
      'Suspension bridge river crossing',
      'Heckendorn bakery ski-through',
      'Wide continuous valley skate lane',
    ],
  },
  {
    id: 'trapp-family-sugar-road',
    trailName: 'Trapp Family Lodge Sugar Road & Haul Road',
    systemName: 'Trapp Family Lodge',
    region: 'Stowe, VT',
    distanceKm: 15.0,
    elevationGainM: 320,
    discipline: 'classic_track',
    difficulty: 'moderate_blue',
    groomedDaily: true,
    skateLaneWidthM: 3.5,
    classicTracksCount: 2,
    description:
      "America's first commercial cross-country ski center, winding past working sugarhouses and hemlock groves up to the rustic Slayton Pasture Cabin.",
    trailHighlights: [
      'Historic Austrian cabin trails',
      'Slayton Pasture cabin soup stop',
      'Wooded sugar maple ridge descents',
    ],
  },
  {
    id: 'devil-thumb-ranch-high-lonesome',
    trailName: "Devil's Thumb Ranch High Lonesome Loop",
    systemName: "Devil's Thumb Ranch",
    region: 'Tabernash, CO',
    distanceKm: 22.5,
    elevationGainM: 410,
    discipline: 'skate_skiing',
    difficulty: 'difficult_black',
    groomedDaily: true,
    skateLaneWidthM: 5.0,
    classicTracksCount: 2,
    description:
      'Sweeping high-altitude Nordic loop tucked beneath the Continental Divide with pristine corduroy, demanding climbs, and thrilling descents through frost-covered spruce.',
    trailHighlights: [
      'Continental Divide vistas',
      'High-altitude skate corridor',
      'Ranch creek meadow flats',
    ],
  },
  {
    id: 'royal-gorge-rainbow-ridge',
    trailName: 'Royal Gorge Rainbow Ridge Scenic Rim',
    systemName: 'Royal Gorge Cross Country',
    region: 'Soda Springs, CA',
    distanceKm: 18.0,
    elevationGainM: 350,
    discipline: 'skate_skiing',
    difficulty: 'moderate_blue',
    groomedDaily: true,
    skateLaneWidthM: 4.0,
    classicTracksCount: 1,
    description:
      'Perched atop Donner Summit, Rainbow Ridge boasts dizzying views of the Royal Gorge canyon rim, expansive Sierra granite bowls, and precision machine grooming.',
    trailHighlights: [
      'Panoramic Donner Summit cliffs',
      'Van Norden meadow flats',
      'Solar warming snow transitions',
    ],
  },
  {
    id: 'boundary-waters-banadad-trail',
    trailName: 'Banadad Wilderness Backcountry Ski Trail',
    systemName: 'Boundary Waters Canoe Area',
    region: 'Grand Marais, MN',
    distanceKm: 42.0,
    elevationGainM: 260,
    discipline: 'backcountry_touring',
    difficulty: 'expert_double_black',
    groomedDaily: false,
    skateLaneWidthM: 0.0,
    classicTracksCount: 1,
    description:
      'The longest continuously maintained wilderness ski trail in the Boundary Waters Canoe Area Wilderness, carving a silent, intimate passage through deep boreal pine and wolf territory.',
    trailHighlights: [
      'Intimate boreal wilderness corridor',
      'Off-grid yurt overnight checkpoints',
      'Moose habitat singletrack',
    ],
  },
];

export const NORDIC_GEAR_CHECKLIST: NordicGearItem[] = [
  {
    id: 'skis-bindings',
    name: 'NNN / Prolink / SNS Profil boot-binding compatible cross-country skis',
    category: 'skis_bindings',
    mandatory: true,
    description:
      'Matched camber skis paired with modern NIS/Prolink cross-country bindings for optimal power transfer and track tracking.',
  },
  {
    id: 'boots-poles',
    name: 'High-modulus carbon composite cross-country ski poles with race or touring baskets',
    category: 'boots_poles',
    mandatory: true,
    description:
      'Stiff, ultralight poles sized to shoulder height for skate or armpit height for classic track propulsion.',
  },
  {
    id: 'apparel-layers',
    name: 'Breathable windproof cross-country softshell jacket and thermal tights',
    category: 'apparel',
    mandatory: true,
    description:
      'High-output athletic layers that vent excess moisture while deflecting cold winter headwinds.',
  },
  {
    id: 'kick-wax-skin-conditioner',
    name: 'Temperature-rated kick wax kit or mohair ski skin maintenance conditioner',
    category: 'wax_tuning',
    mandatory: true,
    description:
      'Essential kick-zone grip waxes, synthetic cork, or anti-icing treatment for skin-integrated bases.',
  },
  {
    id: 'eco-glide-wax',
    name: 'High-fluorocarbon-free eco glide wax with cork applicator and nylon brush',
    category: 'wax_tuning',
    mandatory: true,
    description:
      'Fluoro-free biodegradable glide wax optimized for low friction and environmentally safe ski touring.',
  },
  {
    id: 'hydration-pack',
    name: 'Insulated hydration belt pack with warm electrolyte drink bottle',
    category: 'safety',
    mandatory: true,
    description:
      'Thermal-sleeved lumbar hydration system preventing fluid freeze during sub-freezing Nordic tours.',
  },
];

export function getNordicTrails(discipline?: NordicDiscipline): NordicTrail[] {
  if (!discipline) {
    return NORDIC_TRAILS;
  }
  return NORDIC_TRAILS.filter((trail) => trail.discipline === discipline);
}

export function getNordicTrailById(id: string): NordicTrail | undefined {
  return NORDIC_TRAILS.find((trail) => trail.id === id);
}

export function getNordicGear(): NordicGearItem[] {
  return NORDIC_GEAR_CHECKLIST;
}

export function calculateWaxPlan(query: WaxAdvisorQuery): WaxAdvisorResult {
  const trail = getNordicTrailById(query.trailId);
  const trailAndSystem = trail
    ? `${trail.trailName} (${trail.systemName})`
    : 'Custom Nordic Trail';

  const isKlisterCandidate =
    query.snowCondition === 'granular_spring' ||
    query.snowCondition === 'wet_slush' ||
    query.airTemperatureF > 32;

  const klisterRequired = query.skiBaseType === 'waxable' && isKlisterCandidate;

  let recommendedKickWax: string;
  let waxPocketPressure: string;

  if (query.skiBaseType === 'skin_integrated') {
    recommendedKickWax = 'Mohair Skin Strip (No kick wax required — apply skin anti-icing conditioner)';
    waxPocketPressure =
      'Verify camber stiffness matches body weight precisely to prevent premature skin drag during glide phase.';
  } else if (query.skiBaseType === 'fishscale_waxless') {
    recommendedKickWax = 'Patterned Mechanical Base (Waxless — apply liquid glide/anti-ice emulsion)';
    waxPocketPressure =
      'Mechanical pattern engages upon weighted down-step; ensure tip and tail glide zones stay well brushed.';
  } else {
    // waxable
    if (klisterRequired) {
      if (query.snowCondition === 'wet_slush' || query.airTemperatureF >= 35) {
        recommendedKickWax = 'Swix Red Wet Klister (34°F to 45°F, wet saturated granular snow)';
      } else {
        recommendedKickWax = 'Swix Universal / Violet Klister (28°F to 36°F, transformed icy coarse snow)';
      }
      waxPocketPressure =
        'Shortened kick zone (2-3 inches shorter than hardwax zone) to prevent drag outside the camber pocket.';
    } else {
      if (query.airTemperatureF < 18) {
        recommendedKickWax = 'Swix Green Hardwax (-10°F to 18°F, fine dry powder & cold hardpack)';
      } else if (query.airTemperatureF <= 28) {
        recommendedKickWax = 'Swix Blue Extra Hardwax (18°F to 28°F, universal mid-cold hardpack)';
      } else if (query.airTemperatureF <= 32) {
        recommendedKickWax = 'Swix Violet Special Hardwax (28°F to 32°F, transitional moist snow)';
      } else {
        recommendedKickWax = 'Swix Red Special Hardwax (32°F to 36°F, moist new snow)';
      }
      waxPocketPressure =
        'Full camber closure needed. Apply 4-6 thin layers in kick zone; smooth thoroughly with synthetic cork.';
    }
  }

  let recommendedGlideWax: string;
  if (query.airTemperatureF < 15) {
    recommendedGlideWax = 'Cold Polar High-Density Hydrocarbon Glide Wax (8°F to 18°F)';
  } else if (query.airTemperatureF <= 28) {
    recommendedGlideWax = 'Mid-Range Cold Hydrocarbon Blue Glide Wax (18°F to 28°F)';
  } else if (query.airTemperatureF <= 36) {
    recommendedGlideWax = 'Universal All-Temp Red Hydrocarbon Glide Wax (28°F to 36°F)';
  } else {
    recommendedGlideWax = 'Warm High-Fluorocarbon-Free Yellow Wet Glide Wax (34°F to 48°F)';
  }

  let glideSpeedRating: 'fast' | 'moderate' | 'slow_sticky';
  if (query.snowCondition === 'wet_slush' || query.airTemperatureF >= 38) {
    glideSpeedRating = 'slow_sticky';
  } else if (
    query.snowCondition === 'hardpack_groomed' &&
    query.airTemperatureF >= 18 &&
    query.airTemperatureF <= 32
  ) {
    glideSpeedRating = 'fast';
  } else if (
    query.snowCondition === 'packed_powder' &&
    query.airTemperatureF >= 18 &&
    query.airTemperatureF <= 30
  ) {
    glideSpeedRating = 'fast';
  } else {
    glideSpeedRating = 'moderate';
  }

  const conditionDescription =
    query.snowCondition === 'wet_slush'
      ? 'wet slushy snow with high moisture suction'
      : query.snowCondition === 'granular_spring'
      ? 'coarse transformed spring corn and frozen crystals'
      : query.snowCondition === 'hardpack_groomed'
      ? 'firm machine-tilled corduroy and set tracks'
      : query.snowCondition === 'fresh_powder'
      ? 'uncompacted low-moisture fresh snowfall'
      : 'densified packed powder with excellent base cohesion';

  const waxAdvisory = `Conditions on ${trailAndSystem} at ${query.airTemperatureF}°F present ${conditionDescription}. Glide friction rating is ${glideSpeedRating.replace(
    '_',
    ' '
  )}. ${
    klisterRequired
      ? 'Klister is strictly required to bond into transformed coarse grain crystals.'
      : query.skiBaseType === 'waxable'
      ? 'Standard hardwax kick wax layers should be applied and corked evenly.'
      : 'Maintain clean glide zones and apply skin/pattern anti-ice emulsion.'
  }`;

  return {
    trailAndSystem,
    recommendedKickWax,
    recommendedGlideWax,
    waxPocketPressure,
    klisterRequired,
    glideSpeedRating,
    waxAdvisory,
  };
}
