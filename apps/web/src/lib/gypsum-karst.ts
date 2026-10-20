export type GypsumMazeMorphology =
  | 'artesian-rectilinear-joint-labyrinth'
  | 'messinian-selenite-epigenetic-gorge'
  | 'permian-anhydrite-hydration-dome'
  | 'arid-ephemeral-evaporite-sink';

export interface GypsumKarstSite {
  id: string;
  name: string;
  evaporiteBasin: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: GypsumMazeMorphology;
  mappedPassageKm: number;
  junctionDensityPer100m: number;
  ceilingSlabPeelIndex: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  surveyProtocol: string;
  description: string;
}

export interface GypsumKarstInput {
  junctionCountPer100m: number;
  ceilingBedThicknessCm: number;
  surfaceRainInflowMmHr: number;
  anhydriteSwellingPct: number;
  partyAcousticDecibels: number;
}

export interface GypsumKarstAnalysis {
  ceilingSlabPeelProbabilityPct: number;
  mazeDisorientationEntropyScore: number;
  rapidDissolutionSiphonFloodRiskPct: number;
  seleniteCrystalShearHazardPct: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  navigationStrategy:
    | 'continuous-retro-reflective-spool-survey'
    | 'silent-single-file-bypass-hydration-buckles'
    | 'retreat-upper-phreatic-tier-lock-compass'
    | 'abort-evaporite-slab-collapse-siphon-closure';
  warnings: string[];
  recommendations: string[];
}

export interface GypsumKarstGearItem {
  id: string;
  name: string;
  category:
    | 'labyrinth-line-survey'
    | 'selenite-cut-protection'
    | 'slab-acoustics-helmet'
    | 'sulfate-water-filtration';
  essential: boolean;
  rationale: string;
}

export const GYPSUM_KARST_SITES: GypsumKarstSite[] = [
  {
    id: 'optimisticeskaja-ozerna-podolia-ukraine',
    name: 'Optimisticeskaja (Optymistychna) & Ozerna Artesian Gypsum Mega-Labyrinth',
    evaporiteBasin: 'Podolian-Bukovinian Evaporite Basin',
    country: 'Ukraine',
    region: 'Ternopil Oblast',
    latitude: 48.738,
    longitude: 25.974,
    elevationMeters: 280,
    morphology: 'artesian-rectilinear-joint-labyrinth',
    mappedPassageKm: 267.0,
    junctionDensityPer100m: 36,
    ceilingSlabPeelIndex: 68,
    difficulty: 'extreme',
    bestSeason: 'October – March (Stable Winter Phreatic Low-Water Stand)',
    hazards: [
      'Extreme 2D/3D topological disorientation across 267+ km of identical rectilinear joint corridors with up to 36 intersections per 100 m',
      'Delamination of thin Miocene gypsum and clay-cap ceiling beds in wide breakdown halls triggered by acoustic vibration or touching unstable flakes',
      'Sump isolation in lower Ozerna phreatic tubes when Dniester basin snowmelt raises the regional sulfate water table',
    ],
    surveyProtocol:
      'continuous-retro-reflective-spool-survey maintaining unbroken survey-station tie-ins to master camp baselines, placing directional retro-reflective markers at every 4-way joint intersection, and prohibiting permanent smoke or paint markings on selenite walls.',
    description:
      'The longest gypsum cave on Earth and a hypogene artesian labyrinth formed by upward-percolating aquifers across multi-story Neogene evaporite joint networks in western Ukraine.',
  },
  {
    id: 'spipola-acquafredda-vena-del-gesso-italy',
    name: 'Sistema Spipola-Acquafredda & Vena del Gesso Messinian Selenite Karst',
    evaporiteBasin: 'Parco dei Gessi Bolognesi',
    country: 'Italy',
    region: 'Emilia-Romagna',
    latitude: 44.432,
    longitude: 11.391,
    elevationMeters: 245,
    morphology: 'messinian-selenite-epigenetic-gorge',
    mappedPassageKm: 11.5,
    junctionDensityPer100m: 18,
    ceilingSlabPeelIndex: 54,
    difficulty: 'challenging',
    bestSeason: 'July – September (Dry Apennine Summer Low-Inflow Window)',
    hazards: [
      'Razor-cleaved Messinian swallowtail selenite crystal blades (geminati a ferro di lancia) capable of shearing Cordura suits, static ropes, and gloves',
      'Rapid flash-flooding of blind epigenetic doline sinks (inghiottitoi) and low-gradient gypsum siphons during Apennine convective storms',
      'Collapsible breakdown domes where interbedded marl layers swell and detach massive macro-crystalline selenite blocks',
    ],
    surveyProtocol:
      'silent-single-file-bypass-hydration-buckles rigging wide-radius Kevlar rope protectors over selenite crystal edges and monitoring surface Apennine radar before entering active Rio Acquafredda through-caves.',
    description:
      'UNESCO World Heritage Messinian salinity-crisis evaporite karst near Bologna, featuring giant swallowtail selenite crystals, blind valleys, and epigenetic multi-level drainage galleries.',
  },
  {
    id: 'sorbas-covadura-yesos-almeria-spain',
    name: 'Karst en Yesos de Sorbas & Cueva de Covadura Evaporite Maze',
    evaporiteBasin: 'Paraje Natural Karst en Yesos de Sorbas',
    country: 'Spain',
    region: 'Almería',
    latitude: 37.098,
    longitude: -2.062,
    elevationMeters: 410,
    morphology: 'arid-ephemeral-evaporite-sink',
    mappedPassageKm: 4.3,
    junctionDensityPer100m: 22,
    ceilingSlabPeelIndex: 61,
    difficulty: 'challenging',
    bestSeason: 'November – April (Cool Dry Window Outside Autumn Gota Fría Storms)',
    hazards: [
      'Sudden torrential flash-inflow through >1,000 surface dolines during Mediterranean Gota Fría cloudbursts, flooding lower pelitic-gypsum galleries in minutes',
      'Exfoliating tabular yeso (gypsum) strata and cantilevered breakdown slabs across multi-level canyon-and-tube intersections',
      'Abrasive desert-evaporite dust and razor-sharp alabaster/selenite dissolution flutes along tight vertical pitches',
    ],
    surveyProtocol:
      'retreat-upper-phreatic-tier-lock-compass verifying zero Mediterranean cut-off low (DANA) precipitation forecasts and ascending immediately to upper fossil galleries if acoustic water roar develops.',
    description:
      'Arid Betic Cordillera Messinian evaporite plateau honeycombed by over a thousand dolines and six stacked subterranean gallery levels carved in luminous selenite and alabaster.',
  },
  {
    id: 'parks-ranch-chandelier-gypsum-new-mexico',
    name: 'Parks Ranch Cave & Yeso-Castile Evaporite Sink-Maze',
    evaporiteBasin: 'Delaware Basin / Chihuahuan Gypsum Plains',
    country: 'USA',
    region: 'Eddy County, New Mexico',
    latitude: 32.112,
    longitude: -104.335,
    elevationMeters: 1020,
    morphology: 'permian-anhydrite-hydration-dome',
    mappedPassageKm: 6.6,
    junctionDensityPer100m: 26,
    ceilingSlabPeelIndex: 79,
    difficulty: 'moderate',
    bestSeason: 'October – May (Outside North American Monsoon Flash-Flood Season)',
    hazards: [
      'Up to 63% volumetric expansion as Permian anhydrite (CaSO4) hydrates into gypsum (CaSO4·2H2O), buckling floors into hollow hydration blisters and peeling ceiling slabs',
      'Ephemeral Chihuahuan Desert arroyo flash floods pouring into multiple sinkhole entrances and sealing low-ceilinged phreatic crawlways',
      'Non-potable calcium-sulfate (CaSO4) saturated bitter pools that cause osmotic gastrointestinal distress if consumed without reverse-osmosis treatment',
    ],
    surveyProtocol:
      'silent-single-file-bypass-hydration-buckles skirting hollow anhydrite-hydration floor domes, maintaining quiet single-file spacing beneath stressed tabular ceilings, and packing 100% of potable drinking water.',
    description:
      'Classic Permian Castile Formation gypsum karst in the Chihuahuan Desert where arroyo insurgence streams carve anastomosing flood mazes and anhydrite-hydration swelling buckles bedrock beds.',
  },
];

export const GYPSUM_KARST_GEAR_CHECKLIST: GypsumKarstGearItem[] = [
  {
    id: 'dyneema-labyrinth-spool-retro-reflective-cookies',
    name: 'Continuous 400m Dyneema Labyrinth Spool & Retro-Reflective Directional Cookies',
    category: 'labyrinth-line-survey',
    essential: true,
    rationale:
      'Prevents fatal disorientation in multi-story rectilinear gypsum joint mazes (up to 36 junctions/100m) while adhering to zero-mar conservation ethics without defacing cave walls.',
  },
  {
    id: 'kevlar-palm-gloves-cordura-selenite-knee-pads',
    name: 'ANSI A5 Kevlar-Palm Caving Gloves & Cordura Selenite-Guard Knee Pads',
    category: 'selenite-cut-protection',
    essential: true,
    rationale:
      'Protects hands, knees, and oversuits from razor-cleaved swallowtail selenite crystal blades and sharp gypsum dissolution flutes.',
  },
  {
    id: 'low-resonance-helmet-distox-laser-compass',
    name: 'UIAA Caving Helmet with Dual Flood-Spot LED & DistoX Laser Survey Compass',
    category: 'slab-acoustics-helmet',
    essential: true,
    rationale:
      'Allows touch-free laser inspection of sagging anhydrite-hydration ceiling slabs and real-time azimuth closure across high-entropy grid passages.',
  },
  {
    id: 'potable-water-bladders-sulfate-tds-meter',
    name: 'Sealed 4L Potable Water Bladders & Pocket Sulfate/TDS Conductivity Meter',
    category: 'sulfate-water-filtration',
    essential: true,
    rationale:
      'Subterranean gypsum karst water is saturated with dissolved CaSO4 (~2.4 g/L), acting as a strong laxative that standard microfilters cannot desalinate.',
  },
  {
    id: 'kevlar-aramid-rope-edge-protectors',
    name: 'Aramid/Kevlar Wrap-Around Rope Protectors & Deviation Slings',
    category: 'selenite-cut-protection',
    essential: true,
    rationale:
      'Isolates static SRT ropes from cleaved selenite crystal lips and friable gypsum ledges that rapidly abrade nylon sheaths.',
  },
  {
    id: 'barometric-siphon-flood-watch-whistleless-comms',
    name: 'Barometric Inflow Altimeter Watch & Low-Decibel Hand-Signal Protocol Card',
    category: 'slab-acoustics-helmet',
    essential: false,
    rationale:
      'Tracks storm-driven barometric drops ahead of flash-siphon closure while keeping party acoustic output below slab-resonance thresholds.',
  },
];

export function filterGypsumKarstSites(
  sites: GypsumKarstSite[] = GYPSUM_KARST_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): GypsumKarstSite[] {
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
        site.evaporiteBasin,
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

export function calculateGypsumKarst(
  input: GypsumKarstInput
): GypsumKarstAnalysis {
  const {
    junctionCountPer100m,
    ceilingBedThicknessCm,
    surfaceRainInflowMmHr,
    anhydriteSwellingPct,
    partyAcousticDecibels,
  } = input;

  if (
    !Number.isFinite(junctionCountPer100m) ||
    junctionCountPer100m < 2 ||
    junctionCountPer100m > 45
  ) {
    throw new Error(
      'Invalid junctionCountPer100m: must be a finite number between 2 and 45 junctions per 100m.'
    );
  }

  if (
    !Number.isFinite(ceilingBedThicknessCm) ||
    ceilingBedThicknessCm < 2 ||
    ceilingBedThicknessCm > 120
  ) {
    throw new Error(
      'Invalid ceilingBedThicknessCm: must be a finite number between 2 and 120 cm.'
    );
  }

  if (
    !Number.isFinite(surfaceRainInflowMmHr) ||
    surfaceRainInflowMmHr < 0 ||
    surfaceRainInflowMmHr > 80
  ) {
    throw new Error(
      'Invalid surfaceRainInflowMmHr: must be a finite number between 0 and 80 mm/hr.'
    );
  }

  if (
    !Number.isFinite(anhydriteSwellingPct) ||
    anhydriteSwellingPct < 0 ||
    anhydriteSwellingPct > 65
  ) {
    throw new Error(
      'Invalid anhydriteSwellingPct: must be a finite number between 0 and 65 %.'
    );
  }

  if (
    !Number.isFinite(partyAcousticDecibels) ||
    partyAcousticDecibels < 35 ||
    partyAcousticDecibels > 110
  ) {
    throw new Error(
      'Invalid partyAcousticDecibels: must be a finite number between 35 and 110 dB.'
    );
  }

  const juncNorm = (junctionCountPer100m - 2) / 43;
  const bedInv = (120 - ceilingBedThicknessCm) / 118;
  const rainNorm = surfaceRainInflowMmHr / 80;
  const swellNorm = anhydriteSwellingPct / 65;
  const acousticNorm = (partyAcousticDecibels - 35) / 75;

  // 1. ceilingSlabPeelProbabilityPct (2 to 99 %)
  const rawPeel = 2 + swellNorm * 40 + bedInv * 32 + acousticNorm * 25;
  const ceilingSlabPeelProbabilityPct = roundTo(clamp(rawPeel, 2, 99), 1);

  // 2. mazeDisorientationEntropyScore (5 to 100)
  const rawMaze = 5 + juncNorm * 95;
  const mazeDisorientationEntropyScore = roundTo(clamp(rawMaze, 5, 100), 1);

  // 3. rapidDissolutionSiphonFloodRiskPct (0 to 100 %)
  const rawFlood = rainNorm * 70 + swellNorm * 30;
  const rapidDissolutionSiphonFloodRiskPct = roundTo(
    clamp(rawFlood, 0, 100),
    1
  );

  // 4. seleniteCrystalShearHazardPct (3 to 98 %)
  const peelNorm = (ceilingSlabPeelProbabilityPct - 2) / 97;
  const rawShear = 3 + juncNorm * 48 + peelNorm * 47;
  const seleniteCrystalShearHazardPct = roundTo(clamp(rawShear, 3, 98), 1);

  // 5. riskLevel
  let riskLevel: GypsumKarstAnalysis['riskLevel'];
  if (
    ceilingSlabPeelProbabilityPct >= 75 ||
    mazeDisorientationEntropyScore >= 82 ||
    rapidDissolutionSiphonFloodRiskPct >= 75 ||
    seleniteCrystalShearHazardPct >= 80
  ) {
    riskLevel = 'critical';
  } else if (
    ceilingSlabPeelProbabilityPct >= 52 ||
    mazeDisorientationEntropyScore >= 60 ||
    rapidDissolutionSiphonFloodRiskPct >= 50 ||
    seleniteCrystalShearHazardPct >= 58
  ) {
    riskLevel = 'high';
  } else if (
    ceilingSlabPeelProbabilityPct >= 28 ||
    mazeDisorientationEntropyScore >= 35 ||
    rapidDissolutionSiphonFloodRiskPct >= 25 ||
    seleniteCrystalShearHazardPct >= 32
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. navigationStrategy
  const strategyMap: Record<
    GypsumKarstAnalysis['riskLevel'],
    GypsumKarstAnalysis['navigationStrategy']
  > = {
    critical: 'abort-evaporite-slab-collapse-siphon-closure',
    high: 'retreat-upper-phreatic-tier-lock-compass',
    moderate: 'silent-single-file-bypass-hydration-buckles',
    low: 'continuous-retro-reflective-spool-survey',
  };

  const navigationStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (riskLevel === 'critical') {
    warnings.push(
      `CRITICAL EVAPORITE BREAKDOWN-HALL DELAMINATION, SIPHON FLOOD & LABYRINTH ENTRAPMENT HAZARD (slab peel = ${ceilingSlabPeelProbabilityPct}%, maze entropy = ${mazeDisorientationEntropyScore}/100, siphon flood = ${rapidDissolutionSiphonFloodRiskPct}%, selenite shear = ${seleniteCrystalShearHazardPct}%): Imminent tabular ceiling collapse or flash-siphon seal; abort underground traverse immediately.`
    );
  } else if (riskLevel === 'high') {
    warnings.push(
      `HIGH GYPSUM SLAB PEEL, LABYRINTH ENTROPY & SIPHON SURGE RISK (slab peel = ${ceilingSlabPeelProbabilityPct}%, maze entropy = ${mazeDisorientationEntropyScore}/100, siphon flood = ${rapidDissolutionSiphonFloodRiskPct}%, selenite shear = ${seleniteCrystalShearHazardPct}%): Retreat along tagged survey line to upper fossil phreatic tiers and lock DistoX compass back-bearings.`
    );
  } else if (riskLevel === 'moderate') {
    warnings.push(
      `Moderate anhydrite-hydration slab stress and rectilinear maze branching (slab peel = ${ceilingSlabPeelProbabilityPct}%, maze entropy = ${mazeDisorientationEntropyScore}/100, siphon flood = ${rapidDissolutionSiphonFloodRiskPct}%, selenite shear = ${seleniteCrystalShearHazardPct}%): Maintain silent single-file spacing beneath thin ceiling beds and tag every junction.`
    );
  }

  if (anhydriteSwellingPct >= 30 || ceilingBedThicknessCm <= 25) {
    warnings.push(
      `ANHYDRITE-TO-GYPSUM HYDRATION SWELLING (${anhydriteSwellingPct}% volume expansion on ${ceilingBedThicknessCm}cm ceiling beds at ${partyAcousticDecibels} dB): Hydration buckles and acoustic resonance can trigger sudden multi-ton tabular block fall.`
    );
  }

  const recommendations: string[] = [
    `Execute ${navigationStrategy} protocol immediately (slab peel probability: ${ceilingSlabPeelProbabilityPct}%, maze entropy score: ${mazeDisorientationEntropyScore}/100, siphon flood risk: ${rapidDissolutionSiphonFloodRiskPct}%).`,
    mazeDisorientationEntropyScore >= 35 || junctionCountPer100m >= 15
      ? `Anchor a continuous Dyneema survey spool with directional retro-reflective cookies at all ${junctionCountPer100m} junctions/100m; never mark selenite walls with smoke or paint.`
      : `Log laser rangefinder & azimuth stations at each primary joint intersection while preserving pristine evaporite crystal surfaces.`,
    rapidDissolutionSiphonFloodRiskPct >= 25 ||
    seleniteCrystalShearHazardPct >= 32
      ? `Avoid low-gradient gypsum sumps during ${surfaceRainInflowMmHr} mm/hr rain inflow, wear Kevlar-palm gloves against swallowtail selenite blades (${seleniteCrystalShearHazardPct}% shear risk), and carry 100% potable water (never drink CaSO4-saturated cave pools).`
      : `Carry sealed potable water bladders (subterranean gypsum water is non-potable CaSO4 solution) and keep party acoustics near ${partyAcousticDecibels} dB under breakdown domes.`,
  ];

  return {
    ceilingSlabPeelProbabilityPct,
    mazeDisorientationEntropyScore,
    rapidDissolutionSiphonFloodRiskPct,
    seleniteCrystalShearHazardPct,
    riskLevel,
    navigationStrategy,
    warnings,
    recommendations,
  };
}

export function getGypsumKarstGearChecklist(): GypsumKarstGearItem[] {
  return [...GYPSUM_KARST_GEAR_CHECKLIST];
}
