export type IntertidalSubstrateType =
  | 'balanus-mussel-basalt-bench'
  | 'sabellariid-honeycomb-worm-reef'
  | 'porphyra-ulva-glazed-shelf'
  | 'pollicipes-gooseneck-surge-channel';

export interface BarnacleLedgeSite {
  id: string;
  name: string;
  coastlineSector: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  substrateType: IntertidalSubstrateType;
  barnacleCoverPct: number;
  sabellariidFragilityScore: number;
  maxInfragravityRunupM: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  traversalProtocol: string;
  description: string;
}

export interface BarnacleLedgeInput {
  swellHeightM: number;
  swellPeriodSec: number;
  algalBiofilmCoverPct: number;
  sabellariidColonyDensityPct: number;
  ledgeFreeboardM: number;
}

export interface BarnacleLedgeAnalysis {
  infragravityOverwashProbabilityPct: number;
  barnacleLacerationShearScore: number;
  biogenicReefCrushDamagePct: number;
  safeTideWindowMinutes: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  traversalStrategy:
    | 'step-bare-basalt-avoid-worm-tubes'
    | 'carbide-stud-felt-bootie-low-stance'
    | 'wait-ebb-slack-belay-surge-gulley'
    | 'abort-infragravity-set-sweep-hazard';
  warnings: string[];
  recommendations: string[];
}

export interface BarnacleLedgeGearItem {
  id: string;
  name: string;
  category:
    | 'kevlar-cut-protection'
    | 'intertidal-traction'
    | 'surge-flotation'
    | 'marine-wound-care';
  essential: boolean;
  rationale: string;
}

export const BARNACLE_LEDGE_SITES: BarnacleLedgeSite[] = [
  {
    id: 'cape-perpetua-yachats-basalt-bench-oregon',
    name: "Cape Perpetua & Thor's Well Basalt Mussel-Barnacle Bench",
    coastlineSector: 'Siuslaw National Forest Coast',
    country: 'USA',
    region: 'Oregon',
    latitude: 44.278,
    longitude: -124.113,
    elevationMeters: 2,
    substrateType: 'balanus-mussel-basalt-bench',
    barnacleCoverPct: 82,
    sabellariidFragilityScore: 35,
    maxInfragravityRunupM: 4.8,
    difficulty: 'extreme',
    bestSeason: 'May – August (Spring Minus-Tide Morning Windows)',
    hazards: [
      "Long-period North Pacific sneaker and infragravity wave sets (16–20 s) exploding out of Thor's Well sinkhole and sweeping flat basalt benches without warning",
      'Razor-edged Balanus glandula barnacle tests and Mytilus californianus mussel beds capable of shearing through wet suit knees and unarmored palms',
      'Submerged surge fissures and Devil’s Churn blowhole trenches concealed beneath aerated whitewater foam',
    ],
    traversalProtocol:
      'wait-ebb-slack-belay-surge-gulley maintaining >= 3.0 m vertical freeboard above mean lower low water (MLLW) when swell periods exceed 14 seconds, never turning your back to the seaward horizon.',
    description:
      'A classic wave-cut Miocene basalt bench along the central Oregon coast densely armored with acorn barnacles, California sea mussels, and gooseneck clusters around collapsed lava sinkholes.',
  },
  {
    id: 'duckpool-bude-sabellaria-reef-cornwall-uk',
    name: 'Duckpool & Bude Intertidal Sabellaria alveolata Honeycomb Worm-Reef',
    coastlineSector: 'North Cornwall Atlantic Coast',
    country: 'UK',
    region: 'England',
    latitude: 50.863,
    longitude: -4.557,
    elevationMeters: 1,
    substrateType: 'sabellariid-honeycomb-worm-reef',
    barnacleCoverPct: 58,
    sabellariidFragilityScore: 92,
    maxInfragravityRunupM: 3.4,
    difficulty: 'moderate',
    bestSeason: 'April – September (Equinoctial & Summer Spring Ebb Tides)',
    hazards: [
      'Irreversible mechanical crushing of protected Sabellaria alveolata honeycomb sand-tube bioherms if hikers step directly onto crisp alveolar mounds',
      'Rapid macro-tidal Bristol Channel / Celtic Sea flood tide advance (up to 7.5 m range) cutting off headland return ledges beneath Carboniferous sandstone cliffs',
      'Slippery Fucus and Ulva algal draperies masking undercut worm-reef edges and Semibalanus balanoides barnacle plates',
    ],
    traversalProtocol:
      'step-bare-basalt-avoid-worm-tubes placing boots exclusively on bare greywacke rock or sand channels between biogenic Sabellaria hummocks during low-water spring slack.',
    description:
      'High-energy North Cornwall intertidal platform hosting some of Britain’s most extensive biogenic Sabellaria alveolata honeycomb worm reefs, where polychaetes cement coarse sand grains into fragile alveolar cushions.',
  },
  {
    id: 'west-coast-trail-owen-point-shelf-bc-canada',
    name: 'Owen Point & Thrasher Cove Wave-Cut Porphyra-Barnacle Shelf',
    coastlineSector: 'Pacific Rim National Park Reserve',
    country: 'Canada',
    region: 'Vancouver Island, BC',
    latitude: 48.549,
    longitude: -124.512,
    elevationMeters: 3,
    substrateType: 'porphyra-ulva-glazed-shelf',
    barnacleCoverPct: 76,
    sabellariidFragilityScore: 64,
    maxInfragravityRunupM: 4.1,
    difficulty: 'challenging',
    bestSeason: 'June – September (Low-Swell <= 1.8 m Chart Datum Tide Window)',
    hazards: [
      'Frictionless mucilage biofilm of red Porphyra (nori), Mazzaella, and green Ulva sea lettuce glazing tilted sandstone-basalt shelves above razor barnacle crusts',
      'Heavy 20–25 kg multi-day expedition packs raising center of gravity and causing violent rotational falls onto calcareous barnacle and Phragmatopoma worm tubes',
      'Deep surge channels and boulder-choked sea caves flooding when swell height exceeds 2.0 m above a 1.8 m tide table ceiling',
    ],
    traversalProtocol:
      'carbide-stud-felt-bootie-low-stance unbuckling hip-belts, lowering center of gravity with dual trekking poles, and stepping only on dry white barnacle patches rather than wet red/green algal films.',
    description:
      'The most technical intertidal shelf traverse on Vancouver Island’s West Coast Trail, requiring precise tidal timing below 1.8 m chart datum across wave-cut benches slick with marine algae and encrusted with barnacles.',
  },
  {
    id: 'cabo-percebes-costa-da-morte-galicia-spain',
    name: 'Roncudo & Cabo Vilán Gooseneck-Barnacle (Percebe) Surge Ledges',
    coastlineSector: 'Costa da Morte, A Coruña',
    country: 'Spain',
    region: 'Galicia',
    latitude: 43.275,
    longitude: -8.985,
    elevationMeters: 4,
    substrateType: 'pollicipes-gooseneck-surge-channel',
    barnacleCoverPct: 94,
    sabellariidFragilityScore: 48,
    maxInfragravityRunupM: 6.2,
    difficulty: 'extreme',
    bestSeason: 'May – September (Calm Azadón Atlantic Swell Window)',
    hazards: [
      'Violent North Atlantic surge amplification funneling up 45° granite-basalt crevices colonized by Pollicipes pollicipes gooseneck barnacles and Mytilus galloprovincialis mussels',
      'High-velocity backwash suction dragging unroped traversers down vertical barnacle-armored walls into aerated breaking surf',
      'Deep polymicrobial marine lacerations (Vibrio vulnificus / Mycobacterium marinum) from fractured calcareous capitular plates',
    ],
    traversalProtocol:
      'abort-infragravity-set-sweep-hazard whenever Atlantic swell exceeds 3.5 m, or deploy a dedicated cliff-top spotter and dynamic belay tether during brief ebb-tide trough recessions.',
    description:
      'World-renowned high-energy Atlantic surge ledges along Galicia’s Costa da Morte, where relentless wave runup sustains dense carpets of gooseneck and acorn barnacles on sheer coastal rock benches.',
  },
];

export const BARNACLE_LEDGE_GEAR_CHECKLIST: BarnacleLedgeGearItem[] = [
  {
    id: 'ansi-a5-kevlar-neoprene-intertidal-gloves-shins',
    name: 'ANSI A5 Kevlar-Palm Neoprene Intertidal Rock Gloves & Shin Guards',
    category: 'kevlar-cut-protection',
    essential: true,
    rationale:
      'Prevents deep tendon and palmar lacerations when bracing hands or knees against razor-sharp Balanus glandula and Semibalanus calcareous plates during wave surge.',
  },
  {
    id: 'tungsten-carbide-studded-felt-reef-booties',
    name: 'Tungsten-Carbide Studded Felt-Sole Intertidal Reef Booties',
    category: 'intertidal-traction',
    essential: true,
    rationale:
      'Combines compressed felt fibers that wick away Porphyra/Ulva algal mucilage with tungsten-carbide studs that bite through biofilm into underlying basalt and granite.',
  },
  {
    id: 'high-buoyancy-coastal-surge-pfd-throw-tow',
    name: 'Low-Profile Foam Rock-Hopping PFD & Quick-Release Surge Throw Line',
    category: 'surge-flotation',
    essential: true,
    rationale:
      'Provides immediate positive buoyancy in highly aerated whitewater surge channels where entrained air bubbles reduce water density and standard swimming fails.',
  },
  {
    id: 'high-pressure-sterile-saline-povidone-wound-kit',
    name: 'High-Pressure Sterile Saline Irrigation Syringe & Povidone-Iodine Kit',
    category: 'marine-wound-care',
    essential: true,
    rationale:
      'Flushes microscopic calcareous barnacle shell fragments and halophilic Vibrio / Shewanella bacteria out of intertidal abrasions immediately after bench exit.',
  },
  {
    id: 'locking-carbide-tip-collapsible-tide-poles',
    name: 'Dual External-Lock Trekking Poles with Bare Carbide Tips (Baskets Removed)',
    category: 'intertidal-traction',
    essential: true,
    rationale:
      'Establishes three-point contact on tilted wave-cut shelves without snow/mud baskets snagging inside narrow Mytilus mussel crevices or crushing Sabellaria tubes.',
  },
  {
    id: 'waterproof-vhf-chart-datum-tide-watch',
    name: 'Submersible IPX8 Marine VHF Radio & Harmonics Tide-Window Watch',
    category: 'surge-flotation',
    essential: false,
    rationale:
      'Tracks real-time MLLW / Chart Datum ebb-slack cutoffs and maintains Channel 16 Coast Guard contact beneath cliff shadow zones where cellular signal fails.',
  },
];

export function filterBarnacleLedgeSites(
  sites: BarnacleLedgeSite[] = BARNACLE_LEDGE_SITES,
  filters: {
    country?: string;
    substrateType?: string;
    difficulty?: string;
    search?: string;
  } = {}
): BarnacleLedgeSite[] {
  const { country, substrateType, difficulty, search } = filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (
      substrateType &&
      substrateType !== 'all' &&
      site.substrateType !== substrateType
    ) {
      return false;
    }
    if (difficulty && difficulty !== 'all' && site.difficulty !== difficulty) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.coastlineSector,
        site.country,
        site.region,
        site.substrateType,
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

export function calculateBarnacleLedge(
  input: BarnacleLedgeInput
): BarnacleLedgeAnalysis {
  const {
    swellHeightM,
    swellPeriodSec,
    algalBiofilmCoverPct,
    sabellariidColonyDensityPct,
    ledgeFreeboardM,
  } = input;

  if (
    !Number.isFinite(swellHeightM) ||
    swellHeightM < 0.2 ||
    swellHeightM > 6.5
  ) {
    throw new Error(
      'Invalid swellHeightM: must be a finite number between 0.2 and 6.5 m.'
    );
  }

  if (
    !Number.isFinite(swellPeriodSec) ||
    swellPeriodSec < 4 ||
    swellPeriodSec > 22
  ) {
    throw new Error(
      'Invalid swellPeriodSec: must be a finite number between 4 and 22 sec.'
    );
  }

  if (
    !Number.isFinite(algalBiofilmCoverPct) ||
    algalBiofilmCoverPct < 0 ||
    algalBiofilmCoverPct > 100
  ) {
    throw new Error(
      'Invalid algalBiofilmCoverPct: must be a finite number between 0 and 100 %.'
    );
  }

  if (
    !Number.isFinite(sabellariidColonyDensityPct) ||
    sabellariidColonyDensityPct < 0 ||
    sabellariidColonyDensityPct > 100
  ) {
    throw new Error(
      'Invalid sabellariidColonyDensityPct: must be a finite number between 0 and 100 %.'
    );
  }

  if (
    !Number.isFinite(ledgeFreeboardM) ||
    ledgeFreeboardM < 0.1 ||
    ledgeFreeboardM > 5.0
  ) {
    throw new Error(
      'Invalid ledgeFreeboardM: must be a finite number between 0.1 and 5.0 m.'
    );
  }

  const swellNorm = (swellHeightM - 0.2) / 6.3;
  const periodNorm = (swellPeriodSec - 4) / 18;
  const freeboardInv = (5.0 - ledgeFreeboardM) / 4.9;
  const freeboardNorm = (ledgeFreeboardM - 0.1) / 4.9;

  // 1. infragravityOverwashProbabilityPct (1 to 99 %)
  const rawOverwash =
    1 + swellNorm * 42 + periodNorm * 28 + freeboardInv * 28;
  const infragravityOverwashProbabilityPct = roundTo(
    clamp(rawOverwash, 1, 99),
    1
  );

  // 2. barnacleLacerationShearScore (5 to 100)
  const rawShear =
    5 +
    (algalBiofilmCoverPct / 100) * 55 +
    ((infragravityOverwashProbabilityPct - 1) / 98) * 40;
  const barnacleLacerationShearScore = roundTo(clamp(rawShear, 5, 100), 1);

  // 3. biogenicReefCrushDamagePct (0 to 100 %)
  const rawCrush =
    sabellariidColonyDensityPct * 0.75 + algalBiofilmCoverPct * 0.25;
  const biogenicReefCrushDamagePct = roundTo(clamp(rawCrush, 0, 100), 1);

  // 4. safeTideWindowMinutes (0 to 180 min)
  const rawWindow =
    freeboardNorm * 165 - swellNorm * 55 - periodNorm * 35 + 25;
  const safeTideWindowMinutes = Math.round(clamp(rawWindow, 0, 180));

  // 5. riskLevel
  let riskLevel: BarnacleLedgeAnalysis['riskLevel'];
  if (
    infragravityOverwashProbabilityPct >= 75 ||
    barnacleLacerationShearScore >= 80 ||
    biogenicReefCrushDamagePct >= 80 ||
    safeTideWindowMinutes <= 20
  ) {
    riskLevel = 'critical';
  } else if (
    infragravityOverwashProbabilityPct >= 50 ||
    barnacleLacerationShearScore >= 60 ||
    biogenicReefCrushDamagePct >= 55 ||
    safeTideWindowMinutes <= 45
  ) {
    riskLevel = 'high';
  } else if (
    infragravityOverwashProbabilityPct >= 28 ||
    barnacleLacerationShearScore >= 38 ||
    biogenicReefCrushDamagePct >= 30 ||
    safeTideWindowMinutes <= 85
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. traversalStrategy
  const strategyMap: Record<
    BarnacleLedgeAnalysis['riskLevel'],
    BarnacleLedgeAnalysis['traversalStrategy']
  > = {
    critical: 'abort-infragravity-set-sweep-hazard',
    high: 'wait-ebb-slack-belay-surge-gulley',
    moderate: 'carbide-stud-felt-bootie-low-stance',
    low: 'step-bare-basalt-avoid-worm-tubes',
  };

  const traversalStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (riskLevel === 'critical') {
    warnings.push(
      `CRITICAL INFRAGRAVITY BENCH OVERWASH & LACERATION HAZARD (overwash probability = ${infragravityOverwashProbabilityPct}%, laceration shear score = ${barnacleLacerationShearScore}/100, reef crush risk = ${biogenicReefCrushDamagePct}%, safe tide window = ${safeTideWindowMinutes} min): Long-period wave sets will sweep the intertidal shelf; abort bench entry immediately.`
    );
  } else if (riskLevel === 'high') {
    warnings.push(
      `HIGH SURGE CHANNEL & BIOGENIC REEF HAZARD (overwash probability = ${infragravityOverwashProbabilityPct}%, laceration shear score = ${barnacleLacerationShearScore}/100, reef crush risk = ${biogenicReefCrushDamagePct}%, safe tide window = ${safeTideWindowMinutes} min): Elevated wave runup and slick algal glaze; hold on high bluff until ebb slack.`
    );
  } else if (riskLevel === 'moderate') {
    warnings.push(
      `Moderate intertidal slip and wave-set runup risk (overwash probability = ${infragravityOverwashProbabilityPct}%, laceration shear score = ${barnacleLacerationShearScore}/100, reef crush risk = ${biogenicReefCrushDamagePct}%, safe tide window = ${safeTideWindowMinutes} min): Porphyra/Ulva biofilm (${algalBiofilmCoverPct}%) and ${swellPeriodSec}s swell require studded felt traction and horizon watch.`
    );
  }

  if (sabellariidColonyDensityPct >= 40) {
    warnings.push(
      `PROTECTED SABELLARIID HONEYCOMB WORM-REEF ZONE (${sabellariidColonyDensityPct}% colony density, ${biogenicReefCrushDamagePct}% crush damage risk): Stepping on cemented sand-tube bioherms causes permanent structural collapse that takes years to regenerate.`
    );
  }

  const recommendations: string[] = [
    `Execute ${traversalStrategy} protocol immediately (infragravity overwash: ${infragravityOverwashProbabilityPct}%, barnacle shear score: ${barnacleLacerationShearScore}/100, safe tide window: ${safeTideWindowMinutes} min).`,
    biogenicReefCrushDamagePct >= 30 || sabellariidColonyDensityPct >= 25
      ? `Step strictly on bare basalt bedrock or sandy inter-reef channels; never place boot weight onto fragile Sabellaria / Phragmatopoma honeycomb sand-tube mounds (${sabellariidColonyDensityPct}% density).`
      : `Maintain three-point contact on dry barnacle-armored rock while avoiding isolated Sabellariid worm-tube clusters.`,
    barnacleLacerationShearScore >= 38 || algalBiofilmCoverPct >= 30
      ? `Wear ANSI A5 Kevlar-palm gloves, shin protection, and tungsten-carbide studded felt booties to prevent rotational slips on ${algalBiofilmCoverPct}% Porphyra/Ulva mucilage onto Balanus plates.`
      : `Irrigate any minor barnacle test grazes immediately with high-pressure sterile saline and povidone-iodine to prevent Vibrio infection.`,
  ];

  return {
    infragravityOverwashProbabilityPct,
    barnacleLacerationShearScore,
    biogenicReefCrushDamagePct,
    safeTideWindowMinutes,
    riskLevel,
    traversalStrategy,
    warnings,
    recommendations,
  };
}

export function getBarnacleLedgeGearChecklist(): BarnacleLedgeGearItem[] {
  return [...BARNACLE_LEDGE_GEAR_CHECKLIST];
}
