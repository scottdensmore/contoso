export type TechnicalGrade =
  | 'steep_alpine'
  | 'glaciated_high_altitude'
  | 'alpine_ridge'
  | 'extreme_volcanic';

export type SnowpackSurface =
  | 'deep_powder'
  | 'windslab_crust'
  | 'spring_firn'
  | 'boilerplate_ice';

export type TractionStatus =
  | 'optimal_snowshoe_ascent'
  | 'caution_steep_edging_required'
  | 'hazardous_transition_to_crampons_axe';

export interface SnowshoeRoute {
  id: string;
  title: string;
  mountainRange: string;
  region: string;
  summitElevationM: number;
  routeLengthKm: number;
  technicalGrade: TechnicalGrade;
  maxSlopeDeg: number;
  description: string;
  highlights: string[];
}

export interface SnowshoeQuery {
  routeId: string;
  snowpack: SnowpackSurface; // default 'windslab_crust'
  slopeAngleDeg: number; // 10 to 45 deg, default 26
  payloadLbs: number; // 130 to 300 lbs, default 200
  heelLifterEngaged: boolean; // default true
}

export interface SnowshoeResult {
  routeTitle: string;
  tailsRequired: boolean;
  flotationStatus: string;
  calfStrainReductionPercent: number;
  tractionStatus: TractionStatus;
  advisory: string;
}

export interface SnowshoeGearItem {
  id: string;
  name: string;
  category:
    | 'traction'
    | 'flotation'
    | 'poles'
    | 'protection'
    | 'avalanche_safety'
    | 'ice_axe';
  mandatory: boolean;
  description: string;
}

export const SNOWSHOE_ROUTES: SnowshoeRoute[] = [
  {
    id: 'mount-washington-tuckerman-ridge',
    title: 'Mount Washington Lion Head Winter Ridge',
    mountainRange: 'White Mountains',
    region: 'NH, USA',
    summitElevationM: 1917,
    routeLengthKm: 13.5,
    technicalGrade: 'steep_alpine',
    maxSlopeDeg: 38,
    description:
      "New England's premier alpine winter proving ground. Ascends the steep, wind-scoured Lion Head ridge above Tuckerman Ravine, confronting hurricane-force arctic winds, hard-packed windslab, and exposed sub-alpine rock steps.",
    highlights: [
      'Lion Head winter crag switchbacks',
      'Extreme sub-zero windslab exposure',
      'Sub-alpine krummholz snowshoe traverses',
    ],
  },
  {
    id: 'mount-rainier-muir-snowfield',
    title: 'Mount Rainier Camp Muir Winter Route',
    mountainRange: 'Cascade Range',
    region: 'WA, USA',
    summitElevationM: 3072,
    routeLengthKm: 14.5,
    technicalGrade: 'glaciated_high_altitude',
    maxSlopeDeg: 28,
    description:
      'An endurance high-altitude snowshoe ascent ascending 4,800 vertical feet from Paradise to Camp Muir. Demands strict compass and GPS navigation across featureless glaciated snowfields prone to sudden disorienting whiteouts.',
    highlights: [
      'Muir Snowfield steady uphill grind',
      'Whiteout compass navigation wands',
      'High-angle crevasse perimeter bypass',
    ],
  },
  {
    id: 'rocky-mountain-bear-lake-flattop',
    title: 'Flattop Mountain & Hallett Peak Winter Traverse',
    mountainRange: 'Rocky Mountain National Park',
    region: 'CO, USA',
    summitElevationM: 3875,
    routeLengthKm: 15.0,
    technicalGrade: 'alpine_ridge',
    maxSlopeDeg: 32,
    description:
      'A high-alpine traverse above Bear Lake along the windswept spine of the Continental Divide. Features sustained winds, dense sastrugi snowpack, and spectacular sheer drops into Tyndall Gorge.',
    highlights: [
      'Continental Divide rim windswept crust',
      'Tyndall Glacier overlook',
      'Televator heel-lifter steep timberline ascent',
    ],
  },
  {
    id: 'mount-shasta-avalanche-gulch',
    title: 'Mount Shasta Avalanche Gulch Winter Ascent',
    mountainRange: 'Cascade Range',
    region: 'CA, USA',
    summitElevationM: 4322,
    routeLengthKm: 18.0,
    technicalGrade: 'extreme_volcanic',
    maxSlopeDeg: 40,
    description:
      'A colossal volcanic ascent rising over 7,000 vertical feet through Avalanche Gulch to Helen Lake and the steep Red Banks apron. Rigorous alpine snowshoeing transitions to technical front-pointing on high-altitude volcanic rime ice.',
    highlights: [
      'Red Banks technical snowshoe approach',
      'Helen Lake winter high camp',
      'Volcanic rime-ice perimeter edging',
    ],
  },
  {
    id: 'san-juan-red-mountain-pass',
    title: 'Red Mountain Pass & Commodore Basin',
    mountainRange: 'San Juan Mountains',
    region: 'CO, USA',
    summitElevationM: 3680,
    routeLengthKm: 11.2,
    technicalGrade: 'steep_alpine',
    maxSlopeDeg: 34,
    description:
      "Colorado's steep avalanche corridor linking historical mining high-roads and deep powder basins between Silverton and Ouray. Demands modular tail flotation in bottomless powder and aggressive perimeter edge engagement on sidehill ascents.",
    highlights: [
      'High San Juan powder basins',
      'Modular tail extension deep flotation',
      'Aggressive side-rail traverse traversing',
    ],
  },
];

export const SNOWSHOE_GEAR: SnowshoeGearItem[] = [
  {
    id: 'serrated-side-rail-snowshoes',
    name: 'Aggressive 3D Perimeter Serrated Steel Traction Snowshoes with Televator Heel Lifters',
    category: 'traction',
    mandatory: true,
    description:
      'Rigid lightweight frames with full-length 3D lateral serrated teeth and integrated Televator climbing bars for maximum mechanical purchase on wind-crusted alpine steeps.',
  },
  {
    id: 'modular-flotation-tails',
    name: '5-Inch Modular Flotation Tail Extensions for Heavy Winter Packs',
    category: 'flotation',
    mandatory: true,
    description:
      'Tool-free snap-on flotation tails expanding surface deck area, preventing exhausting post-holing when navigating bottomless alpine powder with heavy winter expedition packs.',
  },
  {
    id: 'technical-telescoping-poles',
    name: '3-Section Carbon/Aluminum Trekking Poles with Dual-Density Grips and Snow Baskets',
    category: 'poles',
    mandatory: true,
    description:
      'Sturdy expedition flick-lock poles with extended lower foam traverse grips and 95mm powder baskets for 3-point stability and upper-body ascent propulsion.',
  },
  {
    id: 'insulated-gaiters-crampon-shield',
    name: 'Cordura Waterproof Gore-Tex High Mountaineering Gaiters with Ballistic Crampon Shield',
    category: 'protection',
    mandatory: true,
    description:
      'Heavy-duty waterproof breathable knee-high gaiters with reinforced instep abrasion scuff guards to shield shells and trousers against sharp serrated traction rails.',
  },
  {
    id: 'avalanche-safety-trio',
    name: 'Digital 3-Antenna Avalanche Transceiver, 300cm Probe, and Tempered Alloy Shovel',
    category: 'avalanche_safety',
    mandatory: true,
    description:
      'Mandatory companion rescue set including multi-burial acoustic search beacon, hardened aluminum probe with quick-draw tension cord, and metal hoe-mode snow shovel.',
  },
  {
    id: 'emergency-ice-axe-hybrid',
    name: '55cm Lightweight Alpine Ice Axe for Self-Arrest on Frozen Slopes',
    category: 'ice_axe',
    mandatory: true,
    description:
      'Certified classical alpine axe with positive-clearance steel pick and adze for emergency self-arrest, anchor placement, and step cutting when slopes exceed snowshoe traction limits.',
  },
];

export function getSnowshoeRoutes(grade?: TechnicalGrade): SnowshoeRoute[] {
  if (!grade) return SNOWSHOE_ROUTES;
  return SNOWSHOE_ROUTES.filter((route) => route.technicalGrade === grade);
}

export function getSnowshoeRouteById(id: string): SnowshoeRoute | undefined {
  return SNOWSHOE_ROUTES.find((route) => route.id === id);
}

export function getSnowshoeGear(): SnowshoeGearItem[] {
  return SNOWSHOE_GEAR;
}

export function calculateSnowshoeAscent(query: SnowshoeQuery): SnowshoeResult {
  const route = getSnowshoeRouteById(query.routeId);
  const routeTitle = route ? route.title : 'Alpine Winter Ascent Route';

  // 1. Modular Flotation Tails logic
  const tailsRequired =
    query.payloadLbs > 210 ||
    (query.snowpack === 'deep_powder' && query.payloadLbs > 175);

  const flotationStatus = tailsRequired
    ? 'Tails Required (5-Inch Modular Extensions Recommended)'
    : 'Standard Deck Surface Flotation Sufficient';

  // 2. Televator Heel-Lifter Calf Fatigue Reduction logic
  const calfStrainReductionPercent =
    query.heelLifterEngaged && query.slopeAngleDeg >= 15 ? 35 : 0;

  // 3. Traction safety thresholds
  let tractionStatus: TractionStatus;
  let advisory: string;

  if (query.slopeAngleDeg > 38 || query.snowpack === 'boilerplate_ice') {
    tractionStatus = 'hazardous_transition_to_crampons_axe';
    if (query.snowpack === 'boilerplate_ice') {
      advisory =
        'BOILERPLATE ICE HAZARD: Glazed boilerplate ice offers zero penetration for snowshoe crampons. Transition immediately to rigid steel mountaineering crampons and self-arrest ice axe before continuing.';
    } else {
      advisory = `HAZARDOUS SLOPE THRESHOLD: Slope incline (${query.slopeAngleDeg}°) exceeds safe snowshoe biomechanical climbing angles (>38°). Transition to technical mountaineering boots, front-point crampons, and ice axe.`;
    }
  } else if (query.slopeAngleDeg >= 33) {
    tractionStatus = 'caution_steep_edging_required';
    advisory = `STEEP EDGING ADVISORY: Approaching steep alpine slope (${query.slopeAngleDeg}°). Engage full perimeter 3D serrated steel side rails, use pole plants for three-point contact, and avoid switchback shearing.`;
  } else {
    tractionStatus = 'optimal_snowshoe_ascent';
    const lifterNote =
      query.heelLifterEngaged && query.slopeAngleDeg >= 15
        ? ' with Televator climbing bars engaged for 35% calf strain reduction'
        : '';
    advisory = `OPTIMAL ASCENT CONDITIONS: Stable snowshoe ascent on ${query.snowpack.replace('_', ' ')} (${query.slopeAngleDeg}° slope). Maintain rhythmic uphill cadence${lifterNote}.`;
  }

  return {
    routeTitle,
    tailsRequired,
    flotationStatus,
    calfStrainReductionPercent,
    tractionStatus,
    advisory,
  };
}
