export type SalarMorphology =
  | 'polygonal-halite-pressure-crust'
  | 'ojos-del-salar-brine-upwelling'
  | 'corrugated-gypsum-chevron-crust'
  | 'borate-mirabilite-mud-margin';

export interface SalarPressureRidgeSite {
  id: string;
  name: string;
  endorheicBasin: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: SalarMorphology;
  crustThicknessCm: number;
  ridgeReliefCm: number;
  surfaceAlbedoRatio: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  traversalProtocol: string;
  description: string;
}

export interface SalarPressureRidgeInput {
  crustThicknessCm: number;
  brineEyeProximityM: number;
  ridgeReliefCm: number;
  solarUvIndex: number;
  packsledLoadKg: number;
}

export interface SalarPressureRidgeAnalysis {
  crustPunchThroughProbabilityPct: number;
  effectiveAlbedoUvDoseIndex: number;
  soleLacerationWearRateMmPer10Km: number;
  brineHypothermiaImmersionRiskPct: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  traversalStrategy:
    | 'direct-polygonal-plate-march'
    | 'probe-ojos-margin-30m-detour'
    | 'snowshoe-pulk-load-spread-glacier-goggles'
    | 'abort-thin-mirabilite-brine-crust';
  warnings: string[];
  recommendations: string[];
}

export interface SalarGearItem {
  id: string;
  name: string;
  category:
    | 'uv-albedo-shield'
    | 'crust-probing'
    | 'halite-sole-armor'
    | 'brine-neutralization';
  essential: boolean;
  rationale: string;
}

export const SALAR_PRESSURE_RIDGE_SITES: SalarPressureRidgeSite[] = [
  {
    id: 'uyuni-incahuasi-ojos-bolivia',
    name: 'Salar de Uyuni Isla Incahuasi & Colchani Ojos del Salar Corridor',
    endorheicBasin: 'Daniel Campos Province',
    country: 'Bolivia',
    region: 'Potosí',
    latitude: -20.243,
    longitude: -67.625,
    elevationMeters: 3656,
    morphology: 'ojos-del-salar-brine-upwelling',
    crustThicknessCm: 28,
    ridgeReliefCm: 18,
    surfaceAlbedoRatio: 0.91,
    difficulty: 'challenging',
    bestSeason: 'May – October (Austral Dry Hexagonal Crust Window)',
    hazards: [
      'Subsurface pressurized lithium-magnesium brine upwelling through circular Ojos del Salar chimneys concealed beneath thin 2–5 cm mirabilite crystal skins',
      'Near-isotropic 0.91 surface albedo reflecting extreme 3,656 m tropical UV radiation upward into nostrils, chin undersides, and unshielded corneas',
      '100-kilometer featureless horizon optical whiteout and nocturnal radiative cooling below -15 °C across the dry halite pan',
    ],
    traversalProtocol:
      'probe-ojos-margin-30m-detour maintaining a strict 30 m standoff from bubbling brine vents, probing amber or translucent crust haloes with a graduated steel rod, and wearing Category 4 side-shield glacier goggles.',
    description:
      'The world’s largest evaporite salt flat (10,582 km²), characterized by interlocking hexagonal halite polygons interrupted by active Colchani Ojos del Salar brine springs along the Isla Incahuasi approach.',
  },
  {
    id: 'atacama-soncor-cordillera-sal-chile',
    name: 'Salar de Atacama Laguna Chaxa & Cordillera de la Sal Pressure-Ridge Core',
    endorheicBasin: 'El Loa Province',
    country: 'Chile',
    region: 'Antofagasta',
    latitude: -23.289,
    longitude: -68.181,
    elevationMeters: 2305,
    morphology: 'corrugated-gypsum-chevron-crust',
    crustThicknessCm: 54,
    ridgeReliefCm: 82,
    surfaceAlbedoRatio: 0.85,
    difficulty: 'extreme',
    bestSeason: 'April – November (Hyper-Arid Atacama Winter Window)',
    hazards: [
      'heaved 60–110 cm corrugated halite-gypsum chevron pressure ridges ("costra rugosa") with razor-crystallized salt sutures that shred rubber boot lugs and pulk runners',
      'Hidden ankle-snapping desiccation cavities beneath thrust-faulted polygonal salt slabs',
      'Extreme hyper-arid evaporative dehydration (< 5% relative humidity) combined with intense high-altitude solar irradiance',
    ],
    traversalProtocol:
      'snowshoe-pulk-load-spread-glacier-goggles stepping along flat polygon centers where possible, armoring boot soles and UHMWPE pulk runners against halite crystals, and carrying 7+ L/day water.',
    description:
      'Hyper-arid pre-Andean evaporite basin dominated by buckled, silt-encrusted halite and gypsum pressure-ridge fields ("salares rugosos") bordering the Soncor lagoon system.',
  },
  {
    id: 'arizaro-cono-arita-puna-argentina',
    name: 'Salar de Arizaro & Cono de Arita Black-Halite Pressure-Ridge Basin',
    endorheicBasin: 'Tolar Grande',
    country: 'Argentina',
    region: 'Salta (Puna de Atacama)',
    latitude: -25.018,
    longitude: -67.721,
    elevationMeters: 3475,
    morphology: 'polygonal-halite-pressure-crust',
    crustThicknessCm: 76,
    ridgeReliefCm: 48,
    surfaceAlbedoRatio: 0.86,
    difficulty: 'moderate',
    bestSeason: 'April – October (Pre-Zonda Stable Puna Window)',
    hazards: [
      'Aeolian volcanic-ash-stained black halite pressure ridges concealing brittle hollow salt blisters around the Cono de Arita sandstone-salt cone',
      '60+ knot Puna katabatic and Zonda afternoon gales whipping hygroscopic halite-sulfate dust into eyes and respiratory tracts',
      'Severe remoteness 85 km from Tolar Grande with zero potable water sources across 1,600 km² of evaporite crust',
    ],
    traversalProtocol:
      'direct-polygonal-plate-march navigating polygonal plate interiors toward the Cono de Arita benchmark while wearing sealed goggles and carrying full self-rescue water reserves.',
    description:
      'Vast, wind-scoured Puna de Atacama salar surrounding the symmetrical Cono de Arita pyramid, featuring thick polygonal halite plates buckled into sharp thrust ridges.',
  },
  {
    id: 'chalviri-termas-polques-bolivia',
    name: 'Salar de Chalviri & Laguna Salada Borate-Mirabilite Margin',
    endorheicBasin: 'Eduardo Avaroa Andean Fauna National Reserve',
    country: 'Bolivia',
    region: 'Sud Lípez',
    latitude: -22.534,
    longitude: -67.648,
    elevationMeters: 4398,
    morphology: 'borate-mirabilite-mud-margin',
    crustThicknessCm: 11,
    ridgeReliefCm: 24,
    surfaceAlbedoRatio: 0.89,
    difficulty: 'extreme',
    bestSeason: 'June – September (Peak Austral Freeze Crust Window)',
    hazards: [
      'Deceptive white ulexite-borate and hydrous mirabilite (Na2SO4·10H2O) crusts that liquefy under midday solar warming over knee-deep sub-zero caustic brine mud',
      'Geothermal spring inflows near Polques creating invisible thermal thinning zones beside solid-looking salt shelves',
      'Extreme 4,398 m hypobaric hypoxia paired with 20+ UV Index solar radiation and rapid immersion hypothermia risk',
    ],
    traversalProtocol:
      'abort-thin-mirabilite-brine-crust during afternoon thaw; traverse strictly at dawn over frozen borate margins with snowshoe load-spreading and immediate fresh-water brine wash kits.',
    description:
      'High-altitude 4,398 m Altiplano borate and mirabilite salar in Sud Lípez where hydrothermal spring margins and diurnal salt-phase transitions create treacherous punch-through traps.',
  },
];

export const SALAR_GEAR_CHECKLIST: SalarGearItem[] = [
  {
    id: 'cat4-glacier-goggles-nose-chin-uv-shield',
    name: 'Category 4 Glacier Goggles with Leather Side-Shields & Nose Guard',
    category: 'uv-albedo-shield',
    essential: true,
    rationale:
      'Blocks 92–95% of visible light and 100% of direct plus 0.90 upward-reflected halite-crust UV radiation that causes acute solar photokeratitis within 45 minutes.',
  },
  {
    id: 'graduated-carbon-steel-halite-probe-rod',
    name: 'Graduated Carbon-Steel Halite Crust Probe Rod (200 cm)',
    category: 'crust-probing',
    essential: true,
    rationale:
      'Detects hollow overhanging salt shelves and thinning < 15 cm mirabilite crusts around Ojos del Salar brine upwelling chimneys before committing body and pulk weight.',
  },
  {
    id: 'zinc-oxide-upf50-sub-chin-balaclava',
    name: 'UPF 50+ Full-Face Sun Balaclava & 25% Zinc Oxide Sub-Nasal Barrier',
    category: 'uv-albedo-shield',
    essential: true,
    rationale:
      'Shields the underside of the chin, nostrils, earlobes, and palate from isotropic salt-pan albedo reflectance at 3,500–4,400 m elevation.',
  },
  {
    id: 'vibram-mont-kevlar-rand-gaiter-armor',
    name: 'Full-Rand Mountaineering Boots with Kevlar Ankle Gaiters & Spare Lugs',
    category: 'halite-sole-armor',
    essential: true,
    rationale:
      'Resists razor-sharp isometric halite and chevron gypsum crystal sutures along 80 cm pressure ridges that slice standard EVA midsoles and exposed Achilles tendons.',
  },
  {
    id: 'uhmwpe-pulk-runners-and-load-snowshoes',
    name: 'UHMWPE-Shod Expedition Pulk Sled & Modular Load-Spreading Snowshoes',
    category: 'crust-probing',
    essential: true,
    rationale:
      'Reduces ground contact pressure below 12 kPa when crossing thin borate-mirabilite margins while resisting abrasive salt-ridge scoring.',
  },
  {
    id: 'hyper-saline-freshwater-lavage-barrier-kit',
    name: 'Isotonic Eye/Skin Fresh-Water Lavage & Lanolin Brine-Barrier Kit',
    category: 'brine-neutralization',
    essential: false,
    rationale:
      'Flushes hyper-saline lithium-magnesium brine after crust punch-through, preventing hygroscopic chemical desiccation cracks and accelerated frostnip.',
  },
];

export function filterSalarSites(
  sites: SalarPressureRidgeSite[] = SALAR_PRESSURE_RIDGE_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): SalarPressureRidgeSite[] {
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
        site.endorheicBasin,
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

export function calculateSalarPressureRidge(
  input: SalarPressureRidgeInput
): SalarPressureRidgeAnalysis {
  const {
    crustThicknessCm,
    brineEyeProximityM,
    ridgeReliefCm,
    solarUvIndex,
    packsledLoadKg,
  } = input;

  if (
    !Number.isFinite(crustThicknessCm) ||
    crustThicknessCm < 1 ||
    crustThicknessCm > 150
  ) {
    throw new Error(
      'Invalid crustThicknessCm: must be a finite number between 1 and 150 cm.'
    );
  }

  if (
    !Number.isFinite(brineEyeProximityM) ||
    brineEyeProximityM < 0.5 ||
    brineEyeProximityM > 200.0
  ) {
    throw new Error(
      'Invalid brineEyeProximityM: must be a finite number between 0.5 and 200.0 m.'
    );
  }

  if (
    !Number.isFinite(ridgeReliefCm) ||
    ridgeReliefCm < 2 ||
    ridgeReliefCm > 120
  ) {
    throw new Error(
      'Invalid ridgeReliefCm: must be a finite number between 2 and 120 cm.'
    );
  }

  if (
    !Number.isFinite(solarUvIndex) ||
    solarUvIndex < 1 ||
    solarUvIndex > 22
  ) {
    throw new Error(
      'Invalid solarUvIndex: must be a finite number between 1 and 22.'
    );
  }

  if (
    !Number.isFinite(packsledLoadKg) ||
    packsledLoadKg < 10 ||
    packsledLoadKg > 160
  ) {
    throw new Error(
      'Invalid packsledLoadKg: must be a finite number between 10 and 160 kg.'
    );
  }

  const thickInv = Math.pow((150 - crustThicknessCm) / 149, 2.2);
  const eyeInv = Math.pow((200 - brineEyeProximityM) / 199.5, 3.0);
  const reliefNorm = (ridgeReliefCm - 2) / 118;
  const uvNorm = (solarUvIndex - 1) / 21;
  const loadNorm = (packsledLoadKg - 10) / 150;

  // 1. crustPunchThroughProbabilityPct (1 to 99 %)
  const rawPunch = 1 + thickInv * 46 + eyeInv * 26 + loadNorm * 26;
  const crustPunchThroughProbabilityPct = roundTo(clamp(rawPunch, 1, 99), 1);

  // 2. effectiveAlbedoUvDoseIndex (1.8 to 41.5)
  const rawUv = 1.8 + uvNorm * 39.7;
  const effectiveAlbedoUvDoseIndex = roundTo(clamp(rawUv, 1.8, 41.5), 1);

  // 3. soleLacerationWearRateMmPer10Km (0.2 to 9.5 mm/10km)
  const rawWear = 0.2 + reliefNorm * 6.3 + loadNorm * 3.0;
  const soleLacerationWearRateMmPer10Km = roundTo(
    clamp(rawWear, 0.2, 9.5),
    2
  );

  // 4. brineHypothermiaImmersionRiskPct (0 to 100 %)
  const rawBrine =
    ((crustPunchThroughProbabilityPct - 1) / 98) * 62 +
    Math.pow(eyeInv, 2) * 30;
  const brineHypothermiaImmersionRiskPct = roundTo(
    clamp(rawBrine, 0, 100),
    1
  );

  // 5. riskLevel
  let riskLevel: SalarPressureRidgeAnalysis['riskLevel'];
  if (
    crustPunchThroughProbabilityPct >= 75 ||
    effectiveAlbedoUvDoseIndex >= 32.0 ||
    soleLacerationWearRateMmPer10Km >= 6.5 ||
    brineHypothermiaImmersionRiskPct >= 75
  ) {
    riskLevel = 'critical';
  } else if (
    crustPunchThroughProbabilityPct >= 50 ||
    effectiveAlbedoUvDoseIndex >= 24.0 ||
    soleLacerationWearRateMmPer10Km >= 4.2 ||
    brineHypothermiaImmersionRiskPct >= 50
  ) {
    riskLevel = 'high';
  } else if (
    crustPunchThroughProbabilityPct >= 25 ||
    effectiveAlbedoUvDoseIndex >= 16.0 ||
    soleLacerationWearRateMmPer10Km >= 2.2 ||
    brineHypothermiaImmersionRiskPct >= 25
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. traversalStrategy
  const strategyMap: Record<
    SalarPressureRidgeAnalysis['riskLevel'],
    SalarPressureRidgeAnalysis['traversalStrategy']
  > = {
    critical: 'abort-thin-mirabilite-brine-crust',
    high: 'snowshoe-pulk-load-spread-glacier-goggles',
    moderate: 'probe-ojos-margin-30m-detour',
    low: 'direct-polygonal-plate-march',
  };

  const traversalStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (riskLevel === 'critical') {
    warnings.push(
      `CRITICAL SALAR BRINE PUNCH-THROUGH & ALBEDO/HALITE HAZARD (punch-through = ${crustPunchThroughProbabilityPct}%, effective UV dose = ${effectiveAlbedoUvDoseIndex}, sole wear = ${soleLacerationWearRateMmPer10Km} mm/10km, brine immersion risk = ${brineHypothermiaImmersionRiskPct}%): Imminent failure of thin mirabilite/halite shelf over hyper-saline brine or extreme photokeratitis/laceration exposure.`
    );
  } else if (riskLevel === 'high') {
    warnings.push(
      `HIGH HALITE PRESSURE-RIDGE & BRINE-EYE HAZARD (punch-through = ${crustPunchThroughProbabilityPct}%, effective UV dose = ${effectiveAlbedoUvDoseIndex}, sole wear = ${soleLacerationWearRateMmPer10Km} mm/10km): Distribute ${packsledLoadKg} kg load onto snowshoes/pulk and enforce Category 4 side-shield eye protection.`
    );
  } else if (riskLevel === 'moderate') {
    warnings.push(
      `Moderate salar crust thinning and pressure-ridge abrasion load (punch-through = ${crustPunchThroughProbabilityPct}%, effective UV dose = ${effectiveAlbedoUvDoseIndex}, sole wear = ${soleLacerationWearRateMmPer10Km} mm/10km): Detour 30+ m around Ojos del Salar vents and probe discolored salt seams.`
    );
  }

  if (brineEyeProximityM < 15 || crustThicknessCm < 20) {
    warnings.push(
      `PROXIMITY TO OJOS DEL SALAR UPWELLING VENT (${brineEyeProximityM} m proximity, ${crustThicknessCm} cm crust): Cantilevered salt overhangs collapse without audible cracking into sub-zero lithium-magnesium brine.`
    );
  }

  const recommendations: string[] = [
    `Execute ${traversalStrategy} protocol immediately (crust punch-through: ${crustPunchThroughProbabilityPct}%, effective UV-albedo dose: ${effectiveAlbedoUvDoseIndex}, sole wear: ${soleLacerationWearRateMmPer10Km} mm/10km).`,
    crustPunchThroughProbabilityPct >= 25 || brineEyeProximityM < 30
      ? `Maintain >= 30 m buffer from Ojos del Salar brine chimneys (current: ${brineEyeProximityM} m) and probe ${crustThicknessCm} cm crust continuously with a graduated steel rod.`
      : `Step along flat polygonal halite plate interiors while monitoring ${crustThicknessCm} cm crust integrity and ${ridgeReliefCm} cm suture relief.`,
    effectiveAlbedoUvDoseIndex >= 16.0 || soleLacerationWearRateMmPer10Km >= 2.2
      ? `Wear Category 4 side-shield glacier goggles with UPF 50+ sub-nasal/sub-chin zinc barrier (UV dose ${effectiveAlbedoUvDoseIndex}) and armor boots/pulk runners against ${soleLacerationWearRateMmPer10Km} mm/10km halite abrasion.`
      : `Maintain Category 4 glacier eyewear and inspect boot rands every 10 km across ${ridgeReliefCm} cm polygonal pressure-ridge sutures.`,
  ];

  return {
    crustPunchThroughProbabilityPct,
    effectiveAlbedoUvDoseIndex,
    soleLacerationWearRateMmPer10Km,
    brineHypothermiaImmersionRiskPct,
    riskLevel,
    traversalStrategy,
    warnings,
    recommendations,
  };
}

export function getSalarGearChecklist(): SalarGearItem[] {
  return [...SALAR_GEAR_CHECKLIST];
}
