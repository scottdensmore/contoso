export type TussockMorphology =
  | 'poa-flabellata-pedestal-maze'
  | 'azorella-feldmark-katabatic-ridge'
  | 'chionochloa-megaherb-peat-terrace'
  | 'seal-wallow-bog-trench-apron';

export interface TussockHeadlandSite {
  id: string;
  name: string;
  archipelago: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: TussockMorphology;
  pedestalHeightM: number;
  katabaticGustKmh: number;
  wallowTrenchDepthCm: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  routingProtocol: string;
  description: string;
}

export interface TussockHeadlandInput {
  pedestalHeightM: number;
  katabaticWindKmh: number;
  wallowTrenchDepthCm: number;
  ambientTempC: number;
  sealDensityPerHa: number;
}

export interface TussockHeadlandAnalysis {
  katabaticKnockdownIndex: number;
  interPedestalPitEntrapmentPct: number;
  windChillEffectiveC: number;
  faunaEncounterDetourMultiplier: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  routingStrategy:
    | 'crown-hop-raised-peat-pedestals'
    | 'low-crawl-leeward-trench-probe'
    | 'detour-inland-feldmark-bench'
    | 'abort-katabatic-bivouac-lee-tussock';
  warnings: string[];
  recommendations: string[];
}

export interface TussockGearItem {
  id: string;
  name: string;
  category:
    | 'katabatic-shell'
    | 'bog-trench-probing'
    | 'fauna-biosecurity'
    | 'dead-reckoning';
  essential: boolean;
  rationale: string;
}

export const TUSSOCK_HEADLAND_SITES: TussockHeadlandSite[] = [
  {
    id: 'fortuna-bay-stromness-south-georgia',
    name: 'Fortuna Bay & Shackleton Gap Poa flabellata Tussock Headland',
    archipelago: 'South Georgia Archipelago',
    country: 'United Kingdom',
    region: 'South Georgia & the South Sandwich Islands',
    latitude: -54.152,
    longitude: -36.804,
    elevationMeters: 310,
    morphology: 'poa-flabellata-pedestal-maze',
    pedestalHeightM: 2.2,
    katabaticGustKmh: 128,
    wallowTrenchDepthCm: 135,
    difficulty: 'extreme',
    bestSeason: 'November – February (Austral Summer Post-Thaw Window)',
    hazards: [
      'Overhanging 2.2 m Poa flabellata fibrous peat pedestals concealing waist-deep anaerobic elephant-seal wallow trenches and meltwater gullies',
      'Explosive glacier-driven katabatic williwaw gusts (>125 km/h) accelerating down König Glacier and Shackleton Gap',
      'Aggressive territorial male Antarctic fur seals (Arctocephalus gazella) concealed at blind intersections inside chest-high tussock labyrinths',
    ],
    routingProtocol:
      'detour-inland-feldmark-bench above 180 m contour to bypass high-density coastal fur-seal aprons and deep inter-pedestal bog trenches.',
    description:
      'Classic subantarctic headland along the historic Shackleton traverse where towering Poa flabellata tussock stools form a blind 2-meter-tall maze swept by violent glacier katabatics.',
  },
  {
    id: 'macquarie-island-featherbed-australia',
    name: 'Macquarie Island Featherbed Peat Terrace & Katabatic Escarpment',
    archipelago: 'Subantarctic Macquarie Ridge',
    country: 'Australia',
    region: 'Tasmania',
    latitude: -54.523,
    longitude: 158.882,
    elevationMeters: 240,
    morphology: 'seal-wallow-bog-trench-apron',
    pedestalHeightM: 1.8,
    katabaticGustKmh: 115,
    wallowTrenchDepthCm: 155,
    difficulty: 'extreme',
    bestSeason: 'December – March (Late Austral Summer Ridge Window)',
    hazards: [
      'Quaking oligotrophic "featherbed" floating sphagnum-and-tussock mire aprons over liquid anaerobic peat exceeding 1.5 m depth',
      'Sustained Southern Ocean Roaring Fifties gale compression against the 240 m western coastal escarpment',
      'Subsurface elephant-seal wallow sumps and Giant Petrel nesting colonies requiring mandatory 100 m biosecurity and disturbance buffers',
    ],
    routingProtocol:
      'detour-inland-feldmark-bench along the raised central plateau gravel ridge before descending designated ridge spurs.',
    description:
      'An uplifted oceanic crust ridge in the Furious Fifties where saturated coastal featherbed mires and towering Poa foliosa pedestals guard a sheer 240-meter katabatic escarpment.',
  },
  {
    id: 'enderby-island-megaherb-auckland-nz',
    name: 'Enderby & Adams Island Chionochloa Tussock & Megaherb Bog',
    archipelago: 'Auckland Islands',
    country: 'New Zealand',
    region: 'Southland Subantarctic Territory',
    latitude: -50.498,
    longitude: 166.294,
    elevationMeters: 195,
    morphology: 'chionochloa-megaherb-peat-terrace',
    pedestalHeightM: 1.5,
    katabaticGustKmh: 92,
    wallowTrenchDepthCm: 95,
    difficulty: 'challenging',
    bestSeason: 'December – February (Peak Megaherb Bloom & Moderate Westerlies)',
    hazards: [
      'Dense Chionochloa antarctica tussock swards interleaved with slick Pleurophyllum and Bulbinella megaherb peat hummocks',
      'Concealed New Zealand sea lion (Phocarctos hookeri) resting hollows inside tall coastal tussock belts up to 500 m inland',
      'Sudden sea-fog whiteouts and horizontal sleet squalls obscuring basalt sea-cliff edges along the northern headland',
    ],
    routingProtocol:
      'low-crawl-leeward-trench-probe with acoustic staff tapping every 3 m through tall tussock corridors.',
    description:
      'Wave-lashed volcanic headland in the Auckland archipelago featuring waist-deep Chionochloa snow-tussock terraces, giant subantarctic megaherb meadows, and camouflaged sea-lion wallows.',
  },
  {
    id: 'kerguelen-courbet-azorella-france',
    name: "Péninsule Courbet & Baie de l'Oiseau Azorella Feldmark Headland",
    archipelago: 'Kerguelen Archipelago',
    country: 'France',
    region: 'French Southern and Antarctic Lands',
    latitude: -49.115,
    longitude: 70.185,
    elevationMeters: 160,
    morphology: 'azorella-feldmark-katabatic-ridge',
    pedestalHeightM: 0.9,
    katabaticGustKmh: 138,
    wallowTrenchDepthCm: 75,
    difficulty: 'moderate',
    bestSeason: 'January – March (Late Austral Summer Leeward Window)',
    hazards: [
      'Cook Ice Cap katabatic wind jets funneling across basaltic feldmark terraces with gusts exceeding 135 km/h',
      'Fragile Azorella selago cushion-plant domes surrounding waterlogged peat-bog channels that collapse under concentrated boot loads',
      'Rapid onset of sub-zero wind-chill hypothermia during sleet squalls across treeless headland ridges',
    ],
    routingProtocol:
      'low-crawl-leeward-trench-probe staying on exposed basalt gravel bars to avoid crushing Azorella cushions and sinking in marginal peat.',
    description:
      'Wind-scoured subantarctic headland in the Indian Ocean where compact Azorella selago cushions, coastal tussock hummocks, and elephant-seal wallow aprons face relentless katabatic gales.',
  },
];

export const TUSSOCK_GEAR_CHECKLIST: TussockGearItem[] = [
  {
    id: 'graduated-carbon-peat-wallow-probe-staff',
    name: '150 cm Graduated Carbon Peat-Bog & Seal-Wallow Depth Probe Staff',
    category: 'bog-trench-probing',
    essential: true,
    rationale:
      'Tests load-bearing integrity of inter-pedestal peat bridges before committing body weight and provides acoustic warning taps to alert concealed fur seals.',
  },
  {
    id: 'virkon-s-biocide-scrub-acoustic-bodkin',
    name: 'Virkon-S Biocide Boot Scrub Kit, Seed-Trap Gaiters & Acoustic Fur-Seal Deterrent Bodkin',
    category: 'fauna-biosecurity',
    essential: true,
    rationale:
      'Eliminates invasive Poa annua seeds and soil pathogens between island landings while maintaining non-injurious defensive spacing from charging Arctocephalus gazella bulls.',
  },
  {
    id: 'storm-cagoule-neoprene-face-mask-goggles',
    name: '3-Layer Gore-Tex Pro Katabatic Storm Cagoule, Neoprene Balaclava & Ballistic Wind Goggles',
    category: 'katabatic-shell',
    essential: true,
    rationale:
      'Prevents corneal freezing, spindrift/sea-spray blindness, and convective wind-chill hypothermia during 120+ km/h subantarctic williwaw gusts.',
  },
  {
    id: 'sealed-knee-high-bog-gaiters-cleated-boots',
    name: 'Sealed Knee-High Neoprene Bog-Trench Gaiters & Vibram Lugged Mountaineering Boots',
    category: 'bog-trench-probing',
    essential: true,
    rationale:
      'Seals lower extremities against liquid anaerobic seal-wallow slurry when slipping off overhanging Poa flabellata pedestal crowns.',
  },
  {
    id: 'dual-band-gnss-barometric-compass-lanyard',
    name: 'Dual-Band Multi-GNSS Receiver, Sighting Mirror Compass & Cliff-Edge Waypoint Lanyard',
    category: 'dead-reckoning',
    essential: true,
    rationale:
      'Maintains dead-reckoning bearing inside 2-meter-tall tussock mazes where horizon visibility is zero and sea-fog obscures coastal basalt cliffs.',
  },
  {
    id: 'bothy-bag-katabatic-anchor-bivouac-shelter',
    name: '2-Person Storm Bothy Bag with Tussock-Root Webbing Anchor Loops',
    category: 'katabatic-shell',
    essential: false,
    rationale:
      'Provides immediate lee-side microclimate shelter anchored around a solid tussock pedestal base when caught in knockdown >115 km/h katabatic squalls.',
  },
];

export function filterTussockSites(
  sites: TussockHeadlandSite[] = TUSSOCK_HEADLAND_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): TussockHeadlandSite[] {
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
        site.archipelago,
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

export function calculateTussockHeadland(
  input: TussockHeadlandInput
): TussockHeadlandAnalysis {
  const {
    pedestalHeightM,
    katabaticWindKmh,
    wallowTrenchDepthCm,
    ambientTempC,
    sealDensityPerHa,
  } = input;

  if (
    !Number.isFinite(pedestalHeightM) ||
    pedestalHeightM < 0.2 ||
    pedestalHeightM > 3.0
  ) {
    throw new Error(
      'Invalid pedestalHeightM: must be a finite number between 0.2 and 3.0 meters.'
    );
  }

  if (
    !Number.isFinite(katabaticWindKmh) ||
    katabaticWindKmh < 0 ||
    katabaticWindKmh > 160
  ) {
    throw new Error(
      'Invalid katabaticWindKmh: must be a finite number between 0 and 160 km/h.'
    );
  }

  if (
    !Number.isFinite(wallowTrenchDepthCm) ||
    wallowTrenchDepthCm < 0 ||
    wallowTrenchDepthCm > 180
  ) {
    throw new Error(
      'Invalid wallowTrenchDepthCm: must be a finite number between 0 and 180 cm.'
    );
  }

  if (
    !Number.isFinite(ambientTempC) ||
    ambientTempC < -15 ||
    ambientTempC > 18
  ) {
    throw new Error(
      'Invalid ambientTempC: must be a finite number between -15 and 18 °C.'
    );
  }

  if (
    !Number.isFinite(sealDensityPerHa) ||
    sealDensityPerHa < 0 ||
    sealDensityPerHa > 120
  ) {
    throw new Error(
      'Invalid sealDensityPerHa: must be a finite number between 0 and 120 seals/ha.'
    );
  }

  // 1. katabaticKnockdownIndex (1.0 to 10.0)
  const rawKnockdown =
    1.0 +
    (katabaticWindKmh / 160) * 7.8 +
    (pedestalHeightM / 3.0) * 1.2;
  const katabaticKnockdownIndex = roundTo(clamp(rawKnockdown, 1.0, 10.0), 2);

  // 2. interPedestalPitEntrapmentPct (0 to 100%)
  const rawEntrapment =
    ((pedestalHeightM - 0.2) / 2.8) * 45 +
    (wallowTrenchDepthCm / 180) * 48 +
    (sealDensityPerHa / 120) * 7;
  const interPedestalPitEntrapmentPct = roundTo(
    clamp(rawEntrapment, 0, 100),
    1
  );

  // 3. windChillEffectiveC (North American / WMO wind-chill equivalent temperature)
  let rawWindChill: number;
  if (katabaticWindKmh >= 4.8) {
    const vPow = Math.pow(katabaticWindKmh, 0.16);
    const wmoIndex =
      13.12 +
      0.6215 * ambientTempC -
      11.37 * vPow +
      0.3965 * ambientTempC * vPow;
    rawWindChill = Math.min(ambientTempC, wmoIndex);
  } else {
    rawWindChill = ambientTempC - (katabaticWindKmh / 4.8) * 1.2;
  }
  const windChillEffectiveC = roundTo(rawWindChill, 1);

  // 4. faunaEncounterDetourMultiplier (1.0 to 3.2)
  const rawDetour =
    1.0 +
    (sealDensityPerHa / 120) * 1.55 +
    ((pedestalHeightM - 0.2) / 2.8) * 0.65;
  const faunaEncounterDetourMultiplier = roundTo(
    clamp(rawDetour, 1.0, 3.2),
    2
  );

  // 5. riskLevel
  let riskLevel: TussockHeadlandAnalysis['riskLevel'];
  if (
    katabaticWindKmh >= 110 ||
    katabaticKnockdownIndex >= 8.0 ||
    interPedestalPitEntrapmentPct >= 75 ||
    windChillEffectiveC <= -18
  ) {
    riskLevel = 'critical';
  } else if (
    katabaticWindKmh >= 80 ||
    katabaticKnockdownIndex >= 6.0 ||
    interPedestalPitEntrapmentPct >= 50 ||
    sealDensityPerHa >= 65
  ) {
    riskLevel = 'high';
  } else if (
    katabaticWindKmh >= 45 ||
    katabaticKnockdownIndex >= 3.8 ||
    interPedestalPitEntrapmentPct >= 25 ||
    sealDensityPerHa >= 25
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. routingStrategy
  const strategyMap: Record<
    TussockHeadlandAnalysis['riskLevel'],
    TussockHeadlandAnalysis['routingStrategy']
  > = {
    critical: 'abort-katabatic-bivouac-lee-tussock',
    high: 'detour-inland-feldmark-bench',
    moderate: 'low-crawl-leeward-trench-probe',
    low: 'crown-hop-raised-peat-pedestals',
  };

  const routingStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (katabaticWindKmh >= 110 || katabaticKnockdownIndex >= 8.0) {
    warnings.push(
      `CRITICAL KATABATIC WILLIWAW KNOCKDOWN HAZARD (${katabaticWindKmh} km/h gusts, knockdown index ${katabaticKnockdownIndex}/10): Upright travel impossible; risk of being blown off coastal cliffs or into deep seal wallows.`
    );
  } else if (katabaticWindKmh >= 80 || katabaticKnockdownIndex >= 6.0) {
    warnings.push(
      `HIGH KATABATIC GUST DESTABILIZATION (${katabaticWindKmh} km/h, knockdown index ${katabaticKnockdownIndex}/10): Severe balance loss atop elevated tussock pedestals.`
    );
  } else if (katabaticWindKmh >= 45 || katabaticKnockdownIndex >= 3.8) {
    warnings.push(
      `Moderate katabatic crosswinds (${katabaticWindKmh} km/h, index ${katabaticKnockdownIndex}/10): Avoid leaping between tall overhanging pedestal crowns during gusts.`
    );
  }

  if (interPedestalPitEntrapmentPct >= 75) {
    warnings.push(
      `CRITICAL ANAEROBIC SEAL-WALLOW & BOG ENTRAPMENT (${interPedestalPitEntrapmentPct}% pit risk at ${pedestalHeightM} m pedestal height and ${wallowTrenchDepthCm} cm trench depth): Overhanging Poa flabellata crowns conceal chest-deep liquid peat sumps.`
    );
  } else if (interPedestalPitEntrapmentPct >= 50) {
    warnings.push(
      `High inter-pedestal bog-trench entrapment probability (${interPedestalPitEntrapmentPct}% at ${wallowTrenchDepthCm} cm trench depth): Probe every step before committing weight.`
    );
  } else if (interPedestalPitEntrapmentPct >= 25) {
    warnings.push(
      `Moderate peat-channel slip hazard (${interPedestalPitEntrapmentPct}% entrapment risk): Test tussock crown edge stability with carbon probe staff.`
    );
  }

  if (windChillEffectiveC <= -18) {
    warnings.push(
      `CRITICAL SUBANTARCTIC WIND-CHILL HYPOTHERMIA (${windChillEffectiveC} °C effective wind chill at ${ambientTempC} °C ambient): Rapid frostbite and wet-cold exhaustion.`
    );
  } else if (sealDensityPerHa >= 65) {
    warnings.push(
      `High fur-seal & elephant-seal labyrinth density (${sealDensityPerHa} seals/ha, ${faunaEncounterDetourMultiplier}x detour factor): Aggressive bulls concealed in blind tussock corridors.`
    );
  } else if (sealDensityPerHa >= 25) {
    warnings.push(
      `Elevated pinniped encounter density (${sealDensityPerHa} seals/ha, ${faunaEncounterDetourMultiplier}x detour multiplier): Maintain acoustic probing ahead of blind corners.`
    );
  }

  const recommendations: string[] = [
    `Execute ${routingStrategy} protocol immediately (knockdown index: ${katabaticKnockdownIndex}/10, pit entrapment: ${interPedestalPitEntrapmentPct}%, effective wind chill: ${windChillEffectiveC} °C).`,
    pedestalHeightM >= 1.4 || wallowTrenchDepthCm >= 70
      ? `Avoid crown-hopping across ${pedestalHeightM} m overhanging tussock stools; probe the ${wallowTrenchDepthCm} cm inter-pedestal channels or climb inland to firm feldmark gravel.`
      : `Step squarely onto the central fibrous rootstock of ${pedestalHeightM} m tussock pedestals rather than overhanging leaf skirts.`,
    sealDensityPerHa >= 25
      ? `Budget ${faunaEncounterDetourMultiplier}x route distance and tap your 150 cm probe staff acoustically every 3–5 m to alert sleeping Arctocephalus gazella fur seals before entering blind channels.`
      : `Maintain standard 25 m wildlife buffer and complete Virkon-S biocide boot scrubbing before and after headland transit.`,
  ];

  return {
    katabaticKnockdownIndex,
    interPedestalPitEntrapmentPct,
    windChillEffectiveC,
    faunaEncounterDetourMultiplier,
    riskLevel,
    routingStrategy,
    warnings,
    recommendations,
  };
}

export function getTussockGearChecklist(): TussockGearItem[] {
  return [...TUSSOCK_GEAR_CHECKLIST];
}
