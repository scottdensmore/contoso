export type BambooEcotype =
  | 'chusquea-solid-culm-cloud-ridge'
  | 'sasa-kurilensis-dwarf-snow-bamboo'
  | 'yushania-alpina-montane-belt'
  | 'guadua-spiny-riparian-tangle';

export interface BambooThicketSite {
  id: string;
  name: string;
  mountainCordillera: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  ecotype: BambooEcotype;
  culmDensityPerSqM: number;
  canopyArchHeightM: number;
  silicaTrichomeScore: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  threadingProtocol: string;
  description: string;
}

export interface BambooThicketInput {
  culmDensityPerSqM: number;
  culmDiameterMm: number;
  ridgeSlopeDeg: number;
  wetnessFilmPct: number;
  followerSpacingM: number;
}

export interface BambooThicketAnalysis {
  reboundWhipKineticJ: number;
  wetCulmSlipProbabilityPct: number;
  netAdvanceMetersPerHour: number;
  punjiStumpPunctureRiskPct: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  threadingStrategy:
    | 'follow-tapir-bear-tunnel-leads'
    | 'hand-over-hand-culm-belay-swim'
    | 'flush-node-saw-prune-4m-spacing'
    | 'abort-cornice-drop-spiny-impaction';
  warnings: string[];
  recommendations: string[];
}

export interface BambooGearItem {
  id: string;
  name: string;
  category:
    | 'eye-face-mesh'
    | 'culm-traction'
    | 'lnt-pruning'
    | 'ridge-navigation';
  essential: boolean;
  rationale: string;
}

export const BAMBOO_THICKET_SITES: BambooThicketSite[] = [
  {
    id: 'chirripo-talamanca-chusquea-costa-rica',
    name: 'Cordillera de Talamanca & Cerro Kamuk Chusquea Cloud-Ridge',
    mountainCordillera: 'La Amistad International Park',
    country: 'Costa Rica',
    region: 'Limón / Puntarenas',
    latitude: 9.273,
    longitude: -83.032,
    elevationMeters: 3250,
    ecotype: 'chusquea-solid-culm-cloud-ridge',
    culmDensityPerSqM: 82,
    canopyArchHeightM: 4.5,
    silicaTrichomeScore: 8,
    difficulty: 'extreme',
    bestSeason: 'January – April (Dry Trade-Wind Páramo Window)',
    hazards: [
      'Solid-pith Chusquea subtessellata and Chusquea talamancensis culms storing high flexural springback energy that whip toward trailing hikers',
      'False bamboo-mat overhangs masking vertical 200 m cloud-forest knife-edge drops along the continental divide',
      'Diagonal machete-cut bamboo "punji stakes" hidden beneath wet epiphytic moss carpets on old surveyor paths',
    ],
    threadingProtocol:
      'follow-tapir-bear-tunnel-leads along Baird’s tapir (Tapirus bairdii) crest tunnels with strict 4 m follower spacing and flush-node pull-saw pruning only when deadlocked.',
    description:
      'High-elevation neotropical cloud-ridge and sub-páramo transition dominated by interlocking solid-culm Chusquea thickets where Baird’s tapir tunnels form the only passable arteries.',
  },
  {
    id: 'hidaka-sasa-kurilensis-hokkaido-japan',
    name: 'Hidaka Mountains Poroshiri-dake Sasa kurilensis (Chishima-zasa) Crest',
    mountainCordillera: 'Hidaka Sanmyaku-Erimo Quasi-National Park',
    country: 'Japan',
    region: 'Hokkaido',
    latitude: 42.719,
    longitude: 142.683,
    elevationMeters: 1850,
    ecotype: 'sasa-kurilensis-dwarf-snow-bamboo',
    culmDensityPerSqM: 96,
    canopyArchHeightM: 2.2,
    silicaTrichomeScore: 7,
    difficulty: 'challenging',
    bestSeason: 'July – September (Post-Snowmelt Yabukogi Window)',
    hazards: [
      'Downslope-prostrate Chishima-zasa (Sasa kurilensis) culms polished by winter snowpack into an ultra-slick glossy silica slide',
      'Sub-canopy brown bear (Ursus arctos yesoensis) day-beds and zero-visibility acoustic damping inside chest-high Sasa seas',
      'Hidden snow-bridge voids and alpine cirque headwall cornices concealed under cantilevered Sasa rhizome mats',
    ],
    threadingProtocol:
      'hand-over-hand-culm-belay-swim using Japanese yabukogi uphill culm-base grips, felt/pin-sole tabi or micro-crampon traction, and continuous bear-bell acoustic signaling.',
    description:
      'Classic Hokkaido alpine yabukogi (bamboo bushwhacking) across untrailed Hidaka knife-edges carpeted in dense, snow-flattened Sasa kurilensis dwarf bamboo.',
  },
  {
    id: 'rwenzori-virunga-yushania-uganda',
    name: 'Rwenzori & Virunga Yushania alpina Montane Bamboo Belt',
    mountainCordillera: 'Albertine Rift Cloud Forest',
    country: 'Uganda',
    region: 'Kasese / Kisoro',
    latitude: 0.362,
    longitude: 29.914,
    elevationMeters: 2850,
    ecotype: 'yushania-alpina-montane-belt',
    culmDensityPerSqM: 54,
    canopyArchHeightM: 9.5,
    silicaTrichomeScore: 6,
    difficulty: 'moderate',
    bestSeason: 'December – February & June – August (Bimodal Dry Window)',
    hazards: [
      'Perpetually rain-slicked horizontal Yushania alpina culm lattices suspended over knee-deep black humic peat bogs',
      'Abrasive culm-sheath silica hairs (trichomes) shedding from overhead nodes into eyes and collar openings',
      'Labyrinthine forest elephant and mountain buffalo tracks that dead-end at steep basaltic ravine drop-offs',
    ],
    threadingProtocol:
      'hand-over-hand-culm-belay-swim stepping strictly on rooted rhizome knuckles rather than suspended wet internodes while wearing sealed mesh eye protection.',
    description:
      'Equatorial Afro-montane cloud bamboo zone between 2,500 m and 3,000 m where towering hollow Yushania alpina culms arch over boggy volcanic and metamorphic ridges.',
  },
  {
    id: 'vilcabamba-colani-chusquea-peru',
    name: 'Cordillera Vilcabamba & Apurímac Chusquea scandens Knife-Edge',
    mountainCordillera: 'Eastern Andes Yungas',
    country: 'Peru',
    region: 'Cusco',
    latitude: -13.164,
    longitude: -72.892,
    elevationMeters: 3120,
    ecotype: 'guadua-spiny-riparian-tangle',
    culmDensityPerSqM: 88,
    canopyArchHeightM: 6.0,
    silicaTrichomeScore: 10,
    difficulty: 'extreme',
    bestSeason: 'May – September (Andean Austral Dry Season)',
    hazards: [
      'Climbing Chusquea scandens and lower-montane spiny Guadua nodal hooks that snag pack frames and lacerate exposed skin',
      '45-degree rain-saturated Yungas shale ridges where intertwined bamboo roots cantilever out over 400 m abysses',
      'Severe stinging silica trichome clouds and arboreal pit-viper (Bothrops taeniatus) habitat inside suspended leaf litter',
    ],
    threadingProtocol:
      'flush-node-saw-prune-4m-spacing with mandatory polycarbonate forestry face visors, leather Kevlar gauntlets, and probing every ridge step with an iron-shod pole.',
    description:
      'Vertiginous Eastern Andean cloud-forest ridge crests choked with scandent, hook-branching Chusquea and spiny bamboo tangles above the Apurímac and Urubamba gorges.',
  },
];

export const BAMBOO_GEAR_CHECKLIST: BambooGearItem[] = [
  {
    id: 'polycarbonate-forestry-mesh-goggles-visor',
    name: 'Polycarbonate Forestry Mesh Goggles & Ballistic Eye-Whip Visor',
    category: 'eye-face-mesh',
    essential: true,
    rationale:
      'Prevents corneal lacerations from 15+ Joule culm springback whip and blocks fog-free vision while shedding irritating silica culm-sheath trichomes.',
  },
  {
    id: 'folding-japanese-pull-saw-flush-node',
    name: 'Folding Japanese Pull-Saw (Silky Gomboy) for Flush Node Cuts',
    category: 'lnt-pruning',
    essential: true,
    rationale:
      'Cuts deadlocked culms perpendicular and flush against a solid node ring, eliminating lethal 45-degree diagonal machete "punji stakes" that impale slipping hikers.',
  },
  {
    id: 'steel-pin-sole-tabi-or-instep-crampons',
    name: 'Steel-Pin Felt-Sole Bushwhacking Boots or 6-Point Instep Micro-Spikes',
    category: 'culm-traction',
    essential: true,
    rationale:
      'Bites into glossy, silica-armored wet horizontal Sasa and Chusquea culms where standard Vibram rubber lugs hydroplane instantly.',
  },
  {
    id: 'kevlar-palm-culm-belay-gauntlets',
    name: 'Kevlar-Lined Leather Culm-Belay Gauntlets & Forearm Sleeves',
    category: 'culm-traction',
    essential: true,
    rationale:
      'Protects hands from razor-sharp split bamboo silica edges, nodal thorns, and stinging trichomes during continuous uphill hand-over-hand culm belaying.',
  },
  {
    id: 'dual-band-gnss-altimeter-cornice-probe',
    name: 'Dual-Band Multi-GNSS Barometric Altimeter & Graduated Ridge Probe Pole',
    category: 'ridge-navigation',
    essential: true,
    rationale:
      'Tests bedrock footing beneath cantilevered false bamboo-mat cornices and maintains sub-2 m tracklock under zero-horizon canopy arches.',
  },
  {
    id: 'snag-free-tubular-pack-cover-bear-bell',
    name: 'Snag-Free Cordura Pack Shell & High-Decibel Brass Bear/Tapir Bell',
    category: 'ridge-navigation',
    essential: false,
    rationale:
      'Eliminates external mesh pockets and ice-axe loops that hang up on nodal branch whorls while alerting wildlife inside acoustically damped thickets.',
  },
];

export function filterBambooSites(
  sites: BambooThicketSite[] = BAMBOO_THICKET_SITES,
  filters: {
    country?: string;
    ecotype?: string;
    difficulty?: string;
    search?: string;
  } = {}
): BambooThicketSite[] {
  const { country, ecotype, difficulty, search } = filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (ecotype && ecotype !== 'all' && site.ecotype !== ecotype) {
      return false;
    }
    if (difficulty && difficulty !== 'all' && site.difficulty !== difficulty) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.mountainCordillera,
        site.country,
        site.region,
        site.ecotype,
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

export function calculateBambooThicket(
  input: BambooThicketInput
): BambooThicketAnalysis {
  const {
    culmDensityPerSqM,
    culmDiameterMm,
    ridgeSlopeDeg,
    wetnessFilmPct,
    followerSpacingM,
  } = input;

  if (
    !Number.isFinite(culmDensityPerSqM) ||
    culmDensityPerSqM < 5 ||
    culmDensityPerSqM > 120
  ) {
    throw new Error(
      'Invalid culmDensityPerSqM: must be a finite number between 5 and 120 culms/m².'
    );
  }

  if (
    !Number.isFinite(culmDiameterMm) ||
    culmDiameterMm < 4 ||
    culmDiameterMm > 80
  ) {
    throw new Error(
      'Invalid culmDiameterMm: must be a finite number between 4 and 80 mm.'
    );
  }

  if (
    !Number.isFinite(ridgeSlopeDeg) ||
    ridgeSlopeDeg < 0 ||
    ridgeSlopeDeg > 55
  ) {
    throw new Error(
      'Invalid ridgeSlopeDeg: must be a finite number between 0 and 55 degrees.'
    );
  }

  if (
    !Number.isFinite(wetnessFilmPct) ||
    wetnessFilmPct < 0 ||
    wetnessFilmPct > 100
  ) {
    throw new Error(
      'Invalid wetnessFilmPct: must be a finite number between 0 and 100 %.'
    );
  }

  if (
    !Number.isFinite(followerSpacingM) ||
    followerSpacingM < 0.5 ||
    followerSpacingM > 15.0
  ) {
    throw new Error(
      'Invalid followerSpacingM: must be a finite number between 0.5 and 15.0 m.'
    );
  }

  const densityNorm = (culmDensityPerSqM - 5) / 115;
  const diamNorm = (culmDiameterMm - 4) / 76;
  const slopeNorm = ridgeSlopeDeg / 55;
  const wetNorm = wetnessFilmPct / 100;
  const invSpacingNorm =
    (1 / followerSpacingM - 1 / 15.0) / (1 / 0.5 - 1 / 15.0);

  // 1. reboundWhipKineticJ (0.5 to 35.0 J)
  const rawWhip =
    0.5 + diamNorm * 13.0 + densityNorm * 9.0 + invSpacingNorm * 12.5;
  const reboundWhipKineticJ = roundTo(clamp(rawWhip, 0.5, 35.0), 2);

  // 2. wetCulmSlipProbabilityPct (5 to 98 %)
  const rawSlip = 5 + wetNorm * 45 + slopeNorm * 28 + densityNorm * 20;
  const wetCulmSlipProbabilityPct = roundTo(clamp(rawSlip, 5, 98), 1);

  // 3. netAdvanceMetersPerHour (30 to 1200 m/hr)
  const impedance = clamp(
    densityNorm * 0.48 + diamNorm * 0.28 + slopeNorm * 0.24,
    0,
    0.98
  );
  const rawAdvance = 30 + 1170 * Math.pow(1 - impedance, 3.0);
  const netAdvanceMetersPerHour = Math.round(clamp(rawAdvance, 30, 1200));

  // 4. punjiStumpPunctureRiskPct (0 to 100 %)
  const rawPunji =
    ((wetCulmSlipProbabilityPct - 5) / 93) * 62 + diamNorm * 38;
  const punjiStumpPunctureRiskPct = roundTo(clamp(rawPunji, 0, 100), 1);

  // 5. riskLevel
  let riskLevel: BambooThicketAnalysis['riskLevel'];
  if (
    reboundWhipKineticJ >= 18.0 ||
    wetCulmSlipProbabilityPct >= 80 ||
    netAdvanceMetersPerHour <= 90 ||
    punjiStumpPunctureRiskPct >= 75
  ) {
    riskLevel = 'critical';
  } else if (
    reboundWhipKineticJ >= 10.0 ||
    wetCulmSlipProbabilityPct >= 60 ||
    netAdvanceMetersPerHour <= 200 ||
    punjiStumpPunctureRiskPct >= 50
  ) {
    riskLevel = 'high';
  } else if (
    reboundWhipKineticJ >= 4.5 ||
    wetCulmSlipProbabilityPct >= 35 ||
    netAdvanceMetersPerHour <= 450 ||
    punjiStumpPunctureRiskPct >= 28
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. threadingStrategy
  const strategyMap: Record<
    BambooThicketAnalysis['riskLevel'],
    BambooThicketAnalysis['threadingStrategy']
  > = {
    critical: 'abort-cornice-drop-spiny-impaction',
    high: 'flush-node-saw-prune-4m-spacing',
    moderate: 'hand-over-hand-culm-belay-swim',
    low: 'follow-tapir-bear-tunnel-leads',
  };

  const threadingStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (riskLevel === 'critical') {
    warnings.push(
      `CRITICAL BAMBOO-THICKET IMPACTION & WHIP/PUNJI HAZARD (whip energy = ${reboundWhipKineticJ} J, slip probability = ${wetCulmSlipProbabilityPct}%, advance = ${netAdvanceMetersPerHour} m/hr, punji puncture risk = ${punjiStumpPunctureRiskPct}%): Extreme culm springback, glossy silica slip, and sub-90 m/hr exhaustion risk along overhanging cloud-ridge drop-offs.`
    );
  } else if (riskLevel === 'high') {
    warnings.push(
      `HIGH CULM SPRINGBACK & SILICA SLIP HAZARD (whip energy = ${reboundWhipKineticJ} J, slip probability = ${wetCulmSlipProbabilityPct}%, advance = ${netAdvanceMetersPerHour} m/hr): Dense ${culmDensityPerSqM} culms/m² thicket demands 4+ m follower spacing and flush-node pull-saw pruning.`
    );
  } else if (riskLevel === 'moderate') {
    warnings.push(
      `Moderate bamboo culm rebound and wet silica footing load (whip energy = ${reboundWhipKineticJ} J, slip = ${wetCulmSlipProbabilityPct}%, advance = ${netAdvanceMetersPerHour} m/hr): Wear mesh eye protection and maintain controlled hand-over-hand culm releases.`
    );
  }

  if (punjiStumpPunctureRiskPct >= 40 || followerSpacingM < 3.5) {
    warnings.push(
      `ELEVATED PUNJI-STAKE IMPALEMENT & TRAILING EYE-WHIP RISK (${punjiStumpPunctureRiskPct}% puncture risk, ${followerSpacingM} m spacing): Never cut bamboo diagonally with a machete and increase team spacing to at least 4.0 m.`
    );
  }

  const recommendations: string[] = [
    `Execute ${threadingStrategy} strategy immediately (rebound whip: ${reboundWhipKineticJ} J, wet culm slip: ${wetCulmSlipProbabilityPct}%, net advance: ${netAdvanceMetersPerHour} m/hr).`,
    followerSpacingM < 4.0 || reboundWhipKineticJ >= 8.0
      ? `Expand trailing hiker interval from ${followerSpacingM} m to >= 4.5 m and pass bent ${culmDiameterMm} mm culms hand-to-hand to dissipate ${reboundWhipKineticJ} J springback energy.`
      : `Maintain ${followerSpacingM} m team spacing with polycarbonate mesh eye protection and vocal release calls before letting go of tensioned culms.`,
    punjiStumpPunctureRiskPct >= 28 || wetCulmSlipProbabilityPct >= 35
      ? `Forbid diagonal machete slashes (${punjiStumpPunctureRiskPct}% punji puncture risk); prune deadlocked culms strictly perpendicular and flush against a solid node using a folding pull-saw.`
      : `Step directly atop rooted bamboo rhizome knuckles rather than glossy horizontal internodes (${wetCulmSlipProbabilityPct}% slip probability) and probe ridge edges for false bamboo-mat cornices.`,
  ];

  return {
    reboundWhipKineticJ,
    wetCulmSlipProbabilityPct,
    netAdvanceMetersPerHour,
    punjiStumpPunctureRiskPct,
    riskLevel,
    threadingStrategy,
    warnings,
    recommendations,
  };
}

export function getBambooGearChecklist(): BambooGearItem[] {
  return [...BAMBOO_GEAR_CHECKLIST];
}
