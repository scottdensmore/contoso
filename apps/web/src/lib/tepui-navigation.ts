export type TepuiMorphology =
  | 'pseudokarst-fissure-grid'
  | 'orthoquartzite-pinnacle-plateau'
  | 'brocchinia-bog-sinkhole-mesa'
  | 'proterozoic-escarpment-ramp';

export interface TepuiPlateauSite {
  id: string;
  name: string;
  highlandMassif: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: TepuiMorphology;
  fissureDepthMeters: number;
  cyanobacteriaBiofilmPct: number;
  orographicRainMmDay: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  navigationProtocol: string;
  description: string;
}

export interface TepuiNavigationInput {
  cyanobacteriaBiofilmPct: number;
  fissureGapWidthM: number;
  orographicRainMmHr: number;
  cloudVisibilityM: number;
  slabSlopeDeg: number;
}

export interface TepuiNavigationAnalysis {
  biofilmTractionCoefficient: number;
  fissureBridgeCollapseRiskPct: number;
  orographicBlackoutIndex: number;
  blackwaterStreamSurgeMultiplier: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  progressionProtocol:
    | 'sticky-rubber-cairn-bearing'
    | 'felt-overboot-probe-peat-bridges'
    | 'belayed-fissure-jump-gps-breadcrumb'
    | 'abort-shelter-under-el-hotel-overhang';
  warnings: string[];
  recommendations: string[];
}

export interface TepuiGearItem {
  id: string;
  name: string;
  category:
    | 'biofilm-traction'
    | 'fissure-spanning'
    | 'cloud-navigation'
    | 'overhang-bivouac';
  essential: boolean;
  rationale: string;
}

export const TEPUI_PLATEAU_SITES: TepuiPlateauSite[] = [
  {
    id: 'mount-roraima-maverick-plateau',
    name: 'Mount Roraima Maverick Summit & Labyrinth Pseudokarst Plateau',
    highlandMassif: 'Pacaraima Range / Gran Sabana Roraima Supergroup',
    country: 'Venezuela',
    region: 'Bolívar State / Triple Frontier Plateau, Gran Sabana',
    latitude: 5.143,
    longitude: -60.763,
    elevationMeters: 2810,
    morphology: 'pseudokarst-fissure-grid',
    fissureDepthMeters: 42,
    cyanobacteriaBiofilmPct: 82,
    orographicRainMmDay: 48,
    difficulty: 'challenging',
    bestSeason: 'December – March (Gran Sabana Less-Torrential Window)',
    hazards: [
      'Black Stigonema cyanobacteria biofilm coating 80%+ of Pre-Cambrian orthoquartzite slabs, dropping wet friction to ice-like levels',
      '40-meter-deep intersecting pseudokarst joint chasms masked by false Brocchinia reducta and Stegolepis peat bridges',
      'Sudden 5-meter visibility cloud whiteouts across the Labyrinth and El Foso sinkhole corridors',
    ],
    navigationProtocol:
      'felt-overboot-probe-peat-bridges with continuous GNSS track-logging between "El Hotel" sandstone overhang caves and Maverick Rock.',
    description:
      'Iconic 31-square-kilometer Pre-Cambrian orthoquartzite table-mountain summit bounded by 400-meter vertical cliffs and dissected by labyrinthine pseudokarst fissure grids, quartz crystal valleys, and flooded sinkholes.',
  },
  {
    id: 'auyan-tepui-churun-rim-venezuela',
    name: "Auyán-Tepui Devil's Canyon & Churún Orthoquartzite Mesa",
    highlandMassif: 'Western Canaima Guiana Shield Massif',
    country: 'Venezuela',
    region: 'Canaima National Park, Bolívar State',
    latitude: 5.918,
    longitude: -62.536,
    elevationMeters: 2450,
    morphology: 'brocchinia-bog-sinkhole-mesa',
    fissureDepthMeters: 65,
    cyanobacteriaBiofilmPct: 88,
    orographicRainMmDay: 62,
    difficulty: 'extreme',
    bestSeason: 'January – March (Lower Churún Surge Window)',
    hazards: [
      'Zero-soil-absorption orthoquartzite catchment basins funneling afternoon cloudbursts into instantaneous tannic blackwater flash surges',
      'Deep spongy Bonnetia and Brocchinia carnivore-bog mats concealing 65-meter vertical pseudokarst shafts feeding Angel Falls (Kerepakupai Vená)',
      'Relentless trade-wind orographic fog banks severing visual contact across 700 km² of fractured sandstone plateau',
    ],
    navigationProtocol:
      'belayed-fissure-jump-gps-breadcrumb with carbon probe poles and mandatory high-slab staging before afternoon convective rain.',
    description:
      'Massive 700-square-kilometer heart-shaped sandstone plateau feeding the world’s highest uninterrupted waterfall, characterized by giant collapse simas, carnivore pitcher-plant bogs, and deeply incised blackwater canyons.',
  },
  {
    id: 'kukenan-matawi-tepui-venezuela',
    name: 'Kukenán (Matawi) Tepui Proterozoic Escarpment & Summit Chasm',
    highlandMassif: 'Eastern Tepuis Chain (Pacaraima Massif)',
    country: 'Venezuela',
    region: 'Gran Sabana, Bolívar State',
    latitude: 5.202,
    longitude: -60.825,
    elevationMeters: 2680,
    morphology: 'orthoquartzite-pinnacle-plateau',
    fissureDepthMeters: 55,
    cyanobacteriaBiofilmPct: 76,
    orographicRainMmDay: 52,
    difficulty: 'extreme',
    bestSeason: 'December – February (Brief Trade-Wind Clearing Intervals)',
    hazards: [
      'Isolated orthoquartzite towers split by unbridgeable 3-to-6-meter structural chasms requiring roped belayed leaps',
      'Steeply dipping slick black-algae rock ramps above 600-meter sheer perimeter walls with extreme wind-chill gusts',
      'Scarcity of dry sandstone overhang bivouac caves compared to neighboring Mount Roraima',
    ],
    navigationProtocol:
      'belayed-fissure-jump-gps-breadcrumb using 30m static line belays, polypropylene felt overboots, and storm-rated overhang portaledge tarps.',
    description:
      'Formidable neighbors of Roraima known in Pemón tradition as Matawi-tepui, featuring wind-sculpted orthoquartzite monoliths, deep tectonic clefts, and the 674-meter Kukenán Falls.',
  },
  {
    id: 'chiribiquete-tepui-mesas-colombia',
    name: 'Serranía de Chiribiquete Quartzite Table-Mountain Mesas',
    highlandMassif: 'Western Guiana Shield Palaeozoic-Proterozoic Outliers',
    country: 'Colombia',
    region: 'Caquetá & Guaviare Departments, Colombian Amazonia',
    latitude: 0.712,
    longitude: -72.784,
    elevationMeters: 980,
    morphology: 'proterozoic-escarpment-ramp',
    fissureDepthMeters: 28,
    cyanobacteriaBiofilmPct: 64,
    orographicRainMmDay: 38,
    difficulty: 'moderate',
    bestSeason: 'December – February (Amazonian Veranillo Dry Period)',
    hazards: [
      'Slick cyanobacteria-darkened sandstone dissolution pavements bordered by undermined overhang ledges and jaguar-inhabited rock shelters',
      'Dense equatorial cloud-forest mist and multi-tiered pseudokarst solution trenches dissecting table-mountain crowns',
      'Strict archaeological and endemic-flora biosecurity exclusions around ancient rock-art overhangs',
    ],
    navigationProtocol:
      'sticky-rubber-cairn-bearing with non-invasive felt-soled slab progression and strict zero-trace biosecurity containment.',
    description:
      'Westernmost table-mountain outliers of the Guiana Shield rising abruptly out of the Colombian Amazonian rainforest, featuring sculpted quartzite domes, solution corridors, and overhanging sandstone galleries.',
  },
];

export const TEPUI_GEAR_CHECKLIST: TepuiGearItem[] = [
  {
    id: 'polypropylene-felt-soled-biofilm-overboots',
    name: 'Polypropylene Felt-Soled Biofilm Overboots & Sticky-Rubber Approach Shoes',
    category: 'biofilm-traction',
    essential: true,
    rationale:
      'Micro-fibrous felt soles bite through gelatinous Stigonema cyanobacteria mucilage on wet orthoquartzite slabs where standard Vibram lugs hydroplane.',
  },
  {
    id: 'graduated-carbon-fissure-probe-belay-line',
    name: 'Graduated Carbon Fissure-Bridge Probe Pole & 30m Static Belay Line',
    category: 'fissure-spanning',
    essential: true,
    rationale:
      'Detects hollow Brocchinia bromeliad root mats and false peat bridges concealing 40-meter vertical pseudokarst crevasses before committing body weight.',
  },
  {
    id: 'dual-band-gnss-breadcrumb-compass-strobe',
    name: 'Dual-Band Multi-GNSS Breadcrumb Logger, Sighting Compass & Cairn Strobe Beacons',
    category: 'cloud-navigation',
    essential: true,
    rationale:
      'Prevents fatal cliff-edge disorientation when instantaneous orographic cloud whiteouts drop visibility below 5 meters across featureless rock mazes.',
  },
  {
    id: 'el-hotel-overhang-bivouac-tarp-waste-tubes',
    name: 'Sandstone Overhang Drip-Skirt Bivouac Tent & Sealed PVC Human-Waste Carry-Out Tubes',
    category: 'overhang-bivouac',
    essential: true,
    rationale:
      'Protects sleeping systems from subterranean roof-seepage inside "El Hotel" caves while preventing fecal contamination of zero-soil oligotrophic plateau waters.',
  },
  {
    id: 'submersible-drybags-hypothermia-shell-system',
    name: 'IPX8 Submersible Drybag Liner Pack & 28,000mm Hydrostatic-Head Storm Shell',
    category: 'overhang-bivouac',
    essential: true,
    rationale:
      'Shields insulation against 60+ mm/hr horizontal trade-wind cloudbursts and 8–10 °C nocturnal high-plateau hypothermia.',
  },
  {
    id: 'removable-camming-chocks-dyneema-slings',
    name: 'Wide-Range Quartzite Chock Wedges,Tricams & Abrasion-Shielded Dyneema Slings',
    category: 'fissure-spanning',
    essential: false,
    rationale:
      'Enables retrievable clean-aid anchors in parallel-sided horizontal orthoquartzite bedding planes for roped fissure jumps.',
  },
];

export function filterTepuiSites(
  sites: TepuiPlateauSite[] = TEPUI_PLATEAU_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): TepuiPlateauSite[] {
  const { country, morphology, difficulty, search } = filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (morphology && morphology !== 'all' && site.morphology !== morphology) {
      return false;
    }
    if (difficulty && difficulty !== 'all' && site.difficulty !== difficulty) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.highlandMassif,
        site.country,
        site.region,
        site.morphology,
        site.description,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(normalizedSearch)) {
        return false;
      }
    }
    return true;
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function calculateTepuiNavigation(
  input: TepuiNavigationInput
): TepuiNavigationAnalysis {
  const {
    cyanobacteriaBiofilmPct,
    fissureGapWidthM,
    orographicRainMmHr,
    cloudVisibilityM,
    slabSlopeDeg,
  } = input;

  if (
    !Number.isFinite(cyanobacteriaBiofilmPct) ||
    cyanobacteriaBiofilmPct < 0 ||
    cyanobacteriaBiofilmPct > 100
  ) {
    throw new Error(
      'Invalid cyanobacteriaBiofilmPct: must be a finite number between 0 and 100%.'
    );
  }

  if (
    !Number.isFinite(fissureGapWidthM) ||
    fissureGapWidthM < 0.2 ||
    fissureGapWidthM > 6.0
  ) {
    throw new Error(
      'Invalid fissureGapWidthM: must be a finite number between 0.2 and 6.0 meters.'
    );
  }

  if (
    !Number.isFinite(orographicRainMmHr) ||
    orographicRainMmHr < 0 ||
    orographicRainMmHr > 90
  ) {
    throw new Error(
      'Invalid orographicRainMmHr: must be a finite number between 0 and 90 mm/hr.'
    );
  }

  if (
    !Number.isFinite(cloudVisibilityM) ||
    cloudVisibilityM < 3 ||
    cloudVisibilityM > 500
  ) {
    throw new Error(
      'Invalid cloudVisibilityM: must be a finite number between 3 and 500 meters.'
    );
  }

  if (
    !Number.isFinite(slabSlopeDeg) ||
    slabSlopeDeg < 0 ||
    slabSlopeDeg > 45
  ) {
    throw new Error(
      'Invalid slabSlopeDeg: must be a finite number between 0 and 45 degrees.'
    );
  }

  // 1. biofilmTractionCoefficient (0.12 to 0.78)
  const rawTraction =
    0.78 -
    (cyanobacteriaBiofilmPct / 100) * 0.38 -
    (orographicRainMmHr / 90) * 0.18 -
    (slabSlopeDeg / 45) * 0.14;
  const biofilmTractionCoefficient = roundTo(clamp(rawTraction, 0.12, 0.78), 2);

  // 2. fissureBridgeCollapseRiskPct (0 to 100%)
  const rawCollapse =
    ((fissureGapWidthM - 0.2) / 5.8) * 68 +
    (orographicRainMmHr / 90) * 32;
  const fissureBridgeCollapseRiskPct = roundTo(clamp(rawCollapse, 0, 100), 1);

  // 3. orographicBlackoutIndex (1.0 to 10.0)
  const visibilityNormalized = (500 - cloudVisibilityM) / (500 - 3);
  const rawBlackout =
    1.0 +
    Math.pow(visibilityNormalized, 1.35) * 6.5 +
    (orographicRainMmHr / 90) * 2.5;
  const orographicBlackoutIndex = roundTo(clamp(rawBlackout, 1.0, 10.0), 2);

  // 4. blackwaterStreamSurgeMultiplier (1.0 to 6.5)
  const rawSurge =
    1.0 +
    (orographicRainMmHr / 90) * 4.5 +
    (slabSlopeDeg / 45) * 1.0;
  const blackwaterStreamSurgeMultiplier = roundTo(clamp(rawSurge, 1.0, 6.5), 2);

  // 5. riskLevel
  let riskLevel: TepuiNavigationAnalysis['riskLevel'];
  if (
    biofilmTractionCoefficient <= 0.22 ||
    fissureBridgeCollapseRiskPct >= 75 ||
    cloudVisibilityM <= 10 ||
    orographicRainMmHr >= 45
  ) {
    riskLevel = 'critical';
  } else if (
    biofilmTractionCoefficient <= 0.34 ||
    fissureBridgeCollapseRiskPct >= 50 ||
    cloudVisibilityM <= 25 ||
    orographicRainMmHr >= 25
  ) {
    riskLevel = 'high';
  } else if (
    biofilmTractionCoefficient <= 0.48 ||
    fissureBridgeCollapseRiskPct >= 28 ||
    cloudVisibilityM <= 60 ||
    orographicRainMmHr >= 10
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. progressionProtocol
  const protocolMap: Record<
    TepuiNavigationAnalysis['riskLevel'],
    TepuiNavigationAnalysis['progressionProtocol']
  > = {
    critical: 'abort-shelter-under-el-hotel-overhang',
    high: 'belayed-fissure-jump-gps-breadcrumb',
    moderate: 'felt-overboot-probe-peat-bridges',
    low: 'sticky-rubber-cairn-bearing',
  };

  const progressionProtocol = protocolMap[riskLevel];

  const warnings: string[] = [];
  if (biofilmTractionCoefficient <= 0.22 || orographicRainMmHr >= 45) {
    warnings.push(
      `CRITICAL STIGONEMA BIOFILM SLIP & BLACKWATER FLASH SURGE (traction μ = ${biofilmTractionCoefficient}, rain ${orographicRainMmHr} mm/hr, ${blackwaterStreamSurgeMultiplier}x stream surge): Wet cyanobacteria-coated orthoquartzite slabs behave like greased glass.`
    );
  } else if (biofilmTractionCoefficient <= 0.34 || orographicRainMmHr >= 25) {
    warnings.push(
      `HIGH CYANOBACTERIA BIOFILM LOSS OF FRICTION (traction μ = ${biofilmTractionCoefficient} at ${cyanobacteriaBiofilmPct}% biofilm cover, ${slabSlopeDeg}° slab slope): Unprotected rubber boots risk sudden unarrested slide toward fissure rims.`
    );
  } else if (biofilmTractionCoefficient <= 0.48 || orographicRainMmHr >= 10) {
    warnings.push(
      `Moderate wet-orthoquartzite biofilm slickness (traction μ = ${biofilmTractionCoefficient}, ${blackwaterStreamSurgeMultiplier}x blackwater sheet flow): Avoid dark Stigonema drainage streaks and step on bleached pink quartz crystals.`
    );
  }

  if (fissureBridgeCollapseRiskPct >= 75 || cloudVisibilityM <= 10) {
    warnings.push(
      `CRITICAL PSEUDOKARST FISSURE COLLAPSE & OROGRAPHIC WHITEOUT (${fissureBridgeCollapseRiskPct}% peat-bridge failure risk over ${fissureGapWidthM} m gap, ${cloudVisibilityM} m visibility, blackout index ${orographicBlackoutIndex}/10): High probability of stepping through waterlogged Brocchinia root mats into blind 40m chasms.`
    );
  } else if (fissureBridgeCollapseRiskPct >= 50 || cloudVisibilityM <= 25) {
    warnings.push(
      `High false-peat bridge collapse & cloud disorientation hazard (${fissureBridgeCollapseRiskPct}% collapse risk, ${cloudVisibilityM} m visibility): Probe every vegetated slot crossing and follow active GNSS breadcrumb tracks.`
    );
  } else if (fissureBridgeCollapseRiskPct >= 28 || cloudVisibilityM <= 60) {
    warnings.push(
      `Elevated pseudokarst slot-bridge and mist hazard (${fissureBridgeCollapseRiskPct}% bridge collapse risk, ${cloudVisibilityM} m visibility): Maintain visual lock on rock cairns.`
    );
  }

  const recommendations: string[] = [
    `Deploy ${progressionProtocol} protocol immediately (biofilm traction μ: ${biofilmTractionCoefficient}, bridge collapse risk: ${fissureBridgeCollapseRiskPct}%, blackout index: ${orographicBlackoutIndex}/10).`,
    biofilmTractionCoefficient <= 0.38
      ? `Fit polypropylene felt-soled overboots over approach shoes to shear through ${cyanobacteriaBiofilmPct}% Stigonema cyanobacteria mucilage on ${slabSlopeDeg}° quartzite slabs.`
      : `Prioritize pale/pink uncolonized orthoquartzite ripples and quartz-pebble basins across ${slabSlopeDeg}° slopes.`,
    fissureBridgeCollapseRiskPct >= 40 || cloudVisibilityM <= 30
      ? `Probe all Brocchinia/Stegolepis bog mats with a graduated carbon pole before crossing ${fissureGapWidthM} m fissures and log 10-meter GNSS breadcrumb waypoints.`
      : `Stage dry bivouac gear beneath mapped "El Hotel" sandstone overhangs and seal all human waste in rigid carry-out tubes to protect oligotrophic blackwater pools.`,
  ];

  return {
    biofilmTractionCoefficient,
    fissureBridgeCollapseRiskPct,
    orographicBlackoutIndex,
    blackwaterStreamSurgeMultiplier,
    riskLevel,
    progressionProtocol,
    warnings,
    recommendations,
  };
}

export function getTepuiGearChecklist(): TepuiGearItem[] {
  return [...TEPUI_GEAR_CHECKLIST];
}
