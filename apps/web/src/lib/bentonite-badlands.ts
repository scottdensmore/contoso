export type BentoniteMorphology =
  | 'popcorn-crust-mound'
  | 'piping-tunnel-bridge'
  | 'dispersive-ruth-gully'
  | 'caprock-hoodoo-pedestal';

export type SmectiteSwellingGrade =
  | 'low-illitic-shale'
  | 'moderate-montmorillonite'
  | 'high-sodium-bentonite'
  | 'extreme-thixotropic-gumbo';

export type BentoniteRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface BentoniteBadlandsSite {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  morphology: BentoniteMorphology;
  swellingGrade: SmectiteSwellingGrade;
  pipingDepthM: number;
  sodiumAdsorptionRatio: number;
  slopeAngleDeg: number;
  primaryHazard: string;
  bestSeasons: string[];
  highlights: string[];
  description: string;
  recommendedBootLugClearanceMm: number;
}

export interface BentoniteBadlandsInput {
  rainfallLast24hMm: number;
  crustThicknessCm: number;
  pipingVoidSpanM: number;
  slopeAngleDeg: number;
  sodiumSwellingIndexPct: number;
  packWeightKg: number;
  hasProbingStaff: boolean;
}

export interface BentoniteBadlandsResult {
  roofCollapseRiskPct: number;
  bootMiringDepthCm: number;
  effectiveTractionFrictionCoeff: number;
  safeStandOffFromSinkholeM: number;
  riskLevel: BentoniteRiskLevel;
  recommendedAction: string;
  warnings: string[];
}

export interface BentoniteGearItem {
  id: string;
  name: string;
  category: 'probe' | 'footwear' | 'hydration' | 'navigation' | 'extraction';
  essential: boolean;
  reason: string;
}

export const BENTONITE_BADLANDS_SITES: BentoniteBadlandsSite[] = [
  {
    id: 'badlands-sage-creek-chadron-south-dakota',
    name: 'Badlands National Park Sage Creek & Chadron Smectite Pinnacles',
    region: 'South Dakota (White River Badlands)',
    country: 'USA',
    latitude: 43.878,
    longitude: -102.412,
    elevationM: 865,
    morphology: 'popcorn-crust-mound',
    swellingGrade: 'high-sodium-bentonite',
    pipingDepthM: 4.5,
    sodiumAdsorptionRatio: 26.4,
    slopeAngleDeg: 34,
    primaryHazard:
      'Desiccated Oglala/Chadron popcorn-clay mounds that swell up to 800% upon summer convective rain into frictionless bentonite gumbo masking 4.5 m pseudokarst piping shafts',
    bestSeasons: ['May – Early June', 'September – October'],
    highlights: [
      'Eocene Chadron Formation blue-gray smectite haystack mounds with classic polygonal popcorn desiccation crusts',
      'Subsurface pseudokarst piping networks draining vertically from Brule siltstone ledges into Sage Creek Basin',
      'Fossiliferous White River Group badland divides requiring strict dry-weather ridge routing',
    ],
    description:
      'Extensive Oligocene–Eocene volcanic ash-derived bentonite badlands in the Sage Creek Wilderness where sodium-rich smectite clays weather into puffy popcorn-textured domes riddled with concealed subsurface erosion pipes.',
    recommendedBootLugClearanceMm: 8,
  },
  {
    id: 'cainville-factory-butte-mancos-shale-utah',
    name: 'Cainville Reef & North Cainville Mesa Mancos-Morrison Bentonite Hills',
    region: 'Utah (Capitol Reef / Hanksville Badlands)',
    country: 'USA',
    latitude: 38.431,
    longitude: -110.916,
    elevationM: 1490,
    morphology: 'caprock-hoodoo-pedestal',
    swellingGrade: 'extreme-thixotropic-gumbo',
    pipingDepthM: 6.2,
    sodiumAdsorptionRatio: 34.8,
    slopeAngleDeg: 42,
    primaryHazard:
      'Brushy Basin Member (Morrison Formation) and Blue Gate Mancos Shale thixotropic gumbo that accretes 4 kg clay bricks onto boot soles and undercuts sandstone caprock pedestals',
    bestSeasons: ['April – May', 'October – November'],
    highlights: [
      'Rainbow-banded Jurassic Brushy Basin bentonite domes and Cretaceous Mancos Shale fluted knife-edge ridges',
      'Differential-erosion Dakota and Entrada sandstone caprock hoodoos balanced on dispersive smectite necks',
      'Deeply incised pseudokarst swallow holes along the Fremont River and Cainville Wash floor',
    ],
    description:
      'Hyper-arid Colorado Plateau badlands flanking Factory Butte and Cathedral Valley where volcanic-ash montmorillonite beds of the Morrison and Mancos formations create zero-traction wet gumbo and deeply piped caprock pedestals.',
    recommendedBootLugClearanceMm: 10,
  },
  {
    id: 'dinosaur-red-deer-bearpaw-badlands-alberta-canada',
    name: 'Dinosaur Provincial Park & Red Deer River Bearpaw Bentonite Badlands',
    region: 'Alberta (Red Deer River Valley)',
    country: 'Canada',
    latitude: 50.761,
    longitude: -111.488,
    elevationM: 675,
    morphology: 'piping-tunnel-bridge',
    swellingGrade: 'high-sodium-bentonite',
    pipingDepthM: 8.5,
    sodiumAdsorptionRatio: 29.2,
    slopeAngleDeg: 39,
    primaryHazard:
      'Thinly bridged pseudokarst piping tunnels up to 8.5 m deep cutting through Late Cretaceous Dinosaur Park and Bearpaw Formation bentonitic mudstones that collapse under unprobed footfalls',
    bestSeasons: ['Late May – June', 'September – Mid-October'],
    highlights: [
      'Labyrinthine coulees and natural clay bridges formed by dispersive sodium-montmorillonite subsurface piping',
      'Siderite-capped hoodoos and dark marine Bearpaw Shale bentonite marker beds along the Red Deer River',
      'Dense vertical sinkhole shafts connecting upper prairie benches directly to basal gully talwegs',
    ],
    description:
      'North America’s premier pseudokarst piping badlands carved into Upper Cretaceous Belly River Group and Bearpaw Formation bentonitic shales, where underground tunnel erosion leaves fragile natural clay bridges and hidden sinkholes.',
    recommendedBootLugClearanceMm: 9,
  },
  {
    id: 'bardenas-reales-pisquerra-piping-navarra-spain',
    name: 'Bardenas Reales & Rallón-Pisquerra Evaporite-Smectite Piping Badlands',
    region: 'Navarra (Ebro Basin)',
    country: 'Spain',
    latitude: 42.224,
    longitude: -1.452,
    elevationM: 430,
    morphology: 'dispersive-ruth-gully',
    swellingGrade: 'moderate-montmorillonite',
    pipingDepthM: 7.4,
    sodiumAdsorptionRatio: 22.5,
    slopeAngleDeg: 36,
    primaryHazard:
      'Dispersive sodic-gypsiferous Miocene marls and smectite clays creating vertical tollos (piping sinkholes) and overhanging gully rims along the Pisquerra and Rallón mesas',
    bestSeasons: ['March – May', 'October – November'],
    highlights: [
      'Sculpted Pisquerra and Rallón tabular sandstone-limestone caprocks overlooking dispersive ruth-gully badlands',
      'Deep Miocene Ebro Basin tollos (pseudokarst piping chasms) draining flash-flood sheetwash underground',
      'Polygonal desiccation cracks that rapidly widen into 7 m vertical collapse shafts during autumn Mediterranean storms',
    ],
    description:
      'Semi-arid UNESCO Biosphere Reserve in the central Ebro Basin where continental Miocene clays, gypsum, and sodic smectite marls undergo rapid dispersive tunnel erosion (tollos) beneath tabular sandstone-limestone mesas.',
    recommendedBootLugClearanceMm: 7,
  },
];

const BASE_GEAR_CHECKLIST: BentoniteGearItem[] = [
  {
    id: 'graduated-piping-void-sounding-staff',
    name: 'Graduated 1.8m T-Handle Piping-Void Sounding Staff',
    category: 'probe',
    essential: true,
    reason:
      'Tests desiccated popcorn-clay crust thickness and detects hollow subsurface pseudokarst piping tunnels and bridged sinkhole roofs before committing body weight.',
  },
  {
    id: 'wide-spaced-mud-shedding-boot-scraper',
    name: 'Wide-Lug Self-Cleaning Trail Footwear & UHMWPE Sole Mud-Scraper Blade',
    category: 'footwear',
    essential: true,
    reason:
      'High-sodium smectite gumbo adheres to closely spaced boot lugs in thick 3–5 kg layers; wide-spaced (>= 8 mm) lugs and a low-friction polymer scraper prevent disabling boot balling.',
  },
  {
    id: 'flocculant-alum-ceramic-microfilter-hydration',
    name: 'Alum Coagulant Settling Packets & Cleanable Ceramic Backcountry Filter',
    category: 'hydration',
    essential: true,
    reason:
      'Colloidal sodium-bentonite suspensions in badlands pools never settle by gravity alone and instantly blind hollow-fiber membranes without prior alum flocculation.',
  },
  {
    id: 'high-res-lidar-pseudokarst-gnss-mapper',
    name: 'Offline Sub-Meter LiDAR Hillshade & Sandstone Caprock GNSS Route Planner',
    category: 'navigation',
    essential: true,
    reason:
      'Identifies non-swelling sandstone/siderite caprock benches, dry gravel washes, and linear alignments of collapsed piping sinkholes (tollos) for safe storm egress.',
  },
  {
    id: 'webbing-bridle-mud-extraction-stirrup',
    name: '6m Tubular Webbing Foot-Stirrup & Load-Spreading Mud Extraction Sling',
    category: 'extraction',
    essential: false,
    reason:
      'Breaks vacuum suction around mired boots or breaks through a shallow piping roof collapse without pulling a rescuer onto an unstable sinkhole rim.',
  },
];

export function filterBentoniteBadlandsSites(
  sites: BentoniteBadlandsSite[] = BENTONITE_BADLANDS_SITES,
  filters: {
    search?: string;
    country?: string;
    morphology?: string;
    swellingGrade?: string;
    maxPipingDepthM?: number;
  } = {}
): BentoniteBadlandsSite[] {
  const { search, country, morphology, swellingGrade, maxPipingDepthM } =
    filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (
      morphology &&
      morphology !== 'all' &&
      site.morphology !== morphology
    ) {
      return false;
    }
    if (
      swellingGrade &&
      swellingGrade !== 'all' &&
      site.swellingGrade !== swellingGrade
    ) {
      return false;
    }
    if (
      typeof maxPipingDepthM === 'number' &&
      Number.isFinite(maxPipingDepthM) &&
      site.pipingDepthM > maxPipingDepthM
    ) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.region,
        site.country,
        site.morphology,
        site.swellingGrade,
        site.primaryHazard,
        site.description,
        ...site.highlights,
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

export function calculateBentoniteBadlands(
  input: BentoniteBadlandsInput
): BentoniteBadlandsResult {
  const {
    rainfallLast24hMm,
    crustThicknessCm,
    pipingVoidSpanM,
    slopeAngleDeg,
    sodiumSwellingIndexPct,
    packWeightKg,
    hasProbingStaff,
  } = input;

  if (
    !Number.isFinite(rainfallLast24hMm) ||
    rainfallLast24hMm < 0 ||
    rainfallLast24hMm > 300
  ) {
    throw new Error(
      'Invalid rainfallLast24hMm: must be a finite number between 0 and 300 mm.'
    );
  }

  if (
    !Number.isFinite(crustThicknessCm) ||
    crustThicknessCm < 0.5 ||
    crustThicknessCm > 200
  ) {
    throw new Error(
      'Invalid crustThicknessCm: must be a finite number between 0.5 and 200 cm.'
    );
  }

  if (
    !Number.isFinite(pipingVoidSpanM) ||
    pipingVoidSpanM < 0 ||
    pipingVoidSpanM > 25
  ) {
    throw new Error(
      'Invalid pipingVoidSpanM: must be a finite number between 0 and 25 m.'
    );
  }

  if (
    !Number.isFinite(slopeAngleDeg) ||
    slopeAngleDeg < 0 ||
    slopeAngleDeg > 85
  ) {
    throw new Error(
      'Invalid slopeAngleDeg: must be a finite number between 0 and 85 degrees.'
    );
  }

  if (
    !Number.isFinite(sodiumSwellingIndexPct) ||
    sodiumSwellingIndexPct < 0 ||
    sodiumSwellingIndexPct > 100
  ) {
    throw new Error(
      'Invalid sodiumSwellingIndexPct: must be a finite number between 0 and 100%.'
    );
  }

  if (
    !Number.isFinite(packWeightKg) ||
    packWeightKg < 0 ||
    packWeightKg > 100
  ) {
    throw new Error(
      'Invalid packWeightKg: must be a finite number between 0 and 100 kg.'
    );
  }

  const rainNorm = Math.min(1, rainfallLast24hMm / 100);
  const thinCrustNorm = 1 - Math.min(1, (crustThicknessCm - 0.5) / 49.5);
  const voidNorm = Math.min(1, pipingVoidSpanM / 12);
  const slopeNorm = slopeAngleDeg / 85;
  const swellingNorm = sodiumSwellingIndexPct / 100;
  const packNorm = packWeightKg / 100;
  const probePenalty = hasProbingStaff ? 0 : 12;

  // 1. roofCollapseRiskPct (1 to 99 %)
  const rawCollapse =
    2 +
    thinCrustNorm * 28 +
    voidNorm * 26 +
    rainNorm * 16 +
    swellingNorm * 10 +
    packNorm * 8 +
    probePenalty;
  const roofCollapseRiskPct = roundTo(clamp(rawCollapse, 1, 99), 1);

  // 2. bootMiringDepthCm (0.5 to 45 cm)
  const rawMiring =
    0.5 +
    rainNorm * 14 +
    swellingNorm * 8 +
    packNorm * 6 +
    thinCrustNorm * 4;
  const bootMiringDepthCm = roundTo(clamp(rawMiring, 0.5, 45), 1);

  // 3. effectiveTractionFrictionCoeff (0.05 to 0.75)
  const rawFriction =
    0.68 - rainNorm * 0.32 - swellingNorm * 0.18 - slopeNorm * 0.12;
  const effectiveTractionFrictionCoeff = roundTo(
    clamp(rawFriction, 0.05, 0.75),
    2
  );

  // 4. safeStandOffFromSinkholeM (1.0 to 40 m)
  const rawStandOff =
    1.5 + pipingVoidSpanM * 1.1 + rainNorm * 6 + slopeNorm * 5;
  const safeStandOffFromSinkholeM = roundTo(clamp(rawStandOff, 1.0, 40), 1);

  // 5. riskLevel
  let riskLevel: BentoniteRiskLevel;
  if (
    roofCollapseRiskPct >= 75 ||
    bootMiringDepthCm >= 20 ||
    effectiveTractionFrictionCoeff <= 0.22 ||
    safeStandOffFromSinkholeM >= 16
  ) {
    riskLevel = 'critical';
  } else if (
    roofCollapseRiskPct >= 52 ||
    bootMiringDepthCm >= 13 ||
    effectiveTractionFrictionCoeff <= 0.36 ||
    safeStandOffFromSinkholeM >= 10
  ) {
    riskLevel = 'high';
  } else if (
    roofCollapseRiskPct >= 28 ||
    bootMiringDepthCm >= 6 ||
    effectiveTractionFrictionCoeff <= 0.48 ||
    safeStandOffFromSinkholeM >= 5
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  const actionMap: Record<BentoniteRiskLevel, string> = {
    low: 'dry-popcorn-crest-traverse: Maintain standard probing cadence along desiccated ridges and sandstone caprock benches with >= 2.5 m sinkhole rim stand-off.',
    moderate:
      'probed-crust-wide-standoff-march: Probe ahead of every step across popcorn-clay saddles, avoid concave drainage depressions, and maintain >= 6 m stand-off from piping sinkholes.',
    high: 'bypass-piping-bridges-to-caprock: Abandon bentonitic gully floors and clay bridges immediately; transition onto lithified sandstone caprock or coarse alluvial gravel benches.',
    critical:
      'abort-wet-gumbo-imminent-pipe-collapse: Halt badlands traversal immediately; hydrated sodium-bentonite gumbo and thin-roofed piping voids pose severe collapse and immobilizing miring hazards.',
  };

  const recommendedAction = actionMap[riskLevel];

  const warnings: string[] = [];
  if (riskLevel === 'critical') {
    warnings.push(
      `CRITICAL PIPING-ROOF COLLAPSE & THIXOTROPIC GUMBO HAZARD (collapse risk = ${roofCollapseRiskPct}%, miring depth = ${bootMiringDepthCm} cm, friction μ = ${effectiveTractionFrictionCoeff}, stand-off = ${safeStandOffFromSinkholeM} m): Hydrated smectite crust over ${pipingVoidSpanM} m piping voids cannot support hiker load.`
    );
  } else if (riskLevel === 'high') {
    warnings.push(
      `HIGH PSEUDOKARST BRIDGE & SMECTITE SLICK HAZARD (collapse risk = ${roofCollapseRiskPct}%, miring depth = ${bootMiringDepthCm} cm, friction μ = ${effectiveTractionFrictionCoeff}, stand-off = ${safeStandOffFromSinkholeM} m): Bypass all clay bridges and retreat to sandstone caprock or gravel washes.`
    );
  } else if (riskLevel === 'moderate') {
    warnings.push(
      `Moderate popcorn-clay hydration and piping void span (collapse risk = ${roofCollapseRiskPct}%, stand-off = ${safeStandOffFromSinkholeM} m): Probe continuously for concealed subsurface flutes and avoid gully talwegs.`
    );
  }

  if (!hasProbingStaff && pipingVoidSpanM >= 1.5) {
    warnings.push(
      `UNPROBED PIPING-TUNNEL TRAVERSAL WARNING: Crossing ${pipingVoidSpanM} m pseudokarst void spans without a graduated sounding staff markedly increases blind roof-punch-through risk.`
    );
  }

  if (rainfallLast24hMm >= 10 && sodiumSwellingIndexPct >= 60) {
    warnings.push(
      `SODIUM-SMECTITE HYDRATION SWELLING ALERT (${rainfallLast24hMm} mm rain, ${sodiumSwellingIndexPct}% swelling index): Montmorillonite lattice expansion reduces effective boot traction to μ = ${effectiveTractionFrictionCoeff} and causes severe mud balling.`
    );
  }

  return {
    roofCollapseRiskPct,
    bootMiringDepthCm,
    effectiveTractionFrictionCoeff,
    safeStandOffFromSinkholeM,
    riskLevel,
    recommendedAction,
    warnings,
  };
}

export function getBentoniteBadlandsGearChecklist(
  input?: BentoniteBadlandsInput
): BentoniteGearItem[] {
  const items = BASE_GEAR_CHECKLIST.map((item) => ({ ...item }));
  if (
    input &&
    (input.rainfallLast24hMm >= 15 ||
      input.crustThicknessCm <= 10 ||
      input.pipingVoidSpanM >= 3 ||
      !input.hasProbingStaff)
  ) {
    return items.map((item) =>
      item.id === 'webbing-bridle-mud-extraction-stirrup'
        ? { ...item, essential: true }
        : item
    );
  }
  return items;
}
