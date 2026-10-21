export type TalusColdTrapRegime =
  | 'balch-chimney-megaboulder-gorge'
  | 'algific-dolomite-cold-vent-slope'
  | 'anorthosite-pseudokarst-ice-chasm'
  | 'periglacial-block-stream-felsenmeer';

export interface TalusColdTrapSite {
  id: string;
  name: string;
  physiographicProvince: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  regime: TalusColdTrapRegime;
  maxVoidDepthM: number;
  summerDraftTempDeltaC: number;
  mossBridgeMaskingPct: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  navigationProtocol: string;
  description: string;
}

export interface TalusColdTrapInput {
  ambientAirTempC: number;
  creviceVoidDepthM: number;
  mossHumusMaskingPct: number;
  boulderBlockSpanM: number;
  coldDraftVelocityMs: number;
}

export interface TalusColdTrapAnalysis {
  verglasGlazeSlipProbabilityPct: number;
  mossBridgeCollapseRiskPct: number;
  voidHypothermiaCoolingRateCPerHr: number;
  radonCo2PocketAccumulationIndex: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  navigationStrategy:
    | 'three-point-dry-granite-hop'
    | 'probe-sphagnum-mats-microspike-transition'
    | 'belay-chockstone-crawl-avoid-deep-vents'
    | 'abort-glazed-megatalus-entrapment-hazard';
  warnings: string[];
  recommendations: string[];
}

export interface TalusColdTrapGearItem {
  id: string;
  name: string;
  category:
    | 'verglas-traction'
    | 'void-fall-protection'
    | 'cold-cavity-rescue'
    | 'ecological-preservation';
  essential: boolean;
  rationale: string;
}

export const TALUS_COLD_TRAP_SITES: TalusColdTrapSite[] = [
  {
    id: 'king-ravine-mahosuc-notch-white-mountains-nh',
    name: 'King Ravine Subway & Mahoosuc Notch Balch-Ice Megatalus',
    physiographicProvince: 'Presidential & Mahoosuc Ranges',
    country: 'USA',
    region: 'New Hampshire / Maine',
    latitude: 44.382,
    longitude: -71.298,
    elevationMeters: 1180,
    regime: 'balch-chimney-megaboulder-gorge',
    maxVoidDepthM: 18,
    summerDraftTempDeltaC: 24,
    mossBridgeMaskingPct: 64,
    difficulty: 'extreme',
    bestSeason: 'Late June – September (Dry Barometric Afternoon Window)',
    hazards: [
      'Invisible summer dew-point condensation black-ice (verglas) forming where humid 24°C mountain air contacts 0°C Balch-cooled granite chockstones',
      'False Sphagnum moss and rotting yellow-birch root mats bridging 10–18 m deep sub-talus ice caves along the Subway and Ice Gulch floor',
      'Rapid conductive and convective hypothermia (3.5+ °C/hr core drop) if wedged inside a 0.5°C cold-draft conduit in sweat-soaked summer clothing',
    ],
    navigationProtocol:
      'belay-chockstone-crawl-avoid-deep-vents removing oversized packs before squeezing through sub-taluslemon squeezers, probing every moss mat with a carbide shaft, and carrying microspikes + shell layers even on 28°C July afternoons.',
    description:
      'Classic New England glacial-cirque and notch megatalus where house-sized Devonian schist and granite blocks trap dense winter air via the Balch effect, sustaining perennial subterranean ice caves beneath spruce-moss bridges.',
  },
  {
    id: 'indian-pass-avalanche-pass-adirondacks-ny',
    name: 'Indian Pass & Avalanche Pass Anorthosite Talus Ice Chasms',
    physiographicProvince: 'High Peaks Wilderness, Adirondack Park',
    country: 'USA',
    region: 'New York',
    latitude: 44.142,
    longitude: -74.022,
    elevationMeters: 860,
    regime: 'anorthosite-pseudokarst-ice-chasm',
    maxVoidDepthM: 22,
    summerDraftTempDeltaC: 26,
    mossBridgeMaskingPct: 72,
    difficulty: 'challenging',
    bestSeason: 'July – September (Low-Humidity Post-Frontal Days)',
    hazards: [
      'Deep vertical pseudokarst fissures between angular Marcy anorthosite megaboulders concealed beneath thick boreal feather-moss and conifer needle humus',
      'Slick plagioclase feldspar crystal faces coated in condensation moisture and sub-zero cold-air outflow jets at lower talus toe vents',
      'Stagnant CO2 and radon-enriched heavy air pockets pooling in dead-end lower talus sumps during calm barometric inversions',
    ],
    navigationProtocol:
      'probe-sphagnum-mats-microspike-transition stepping strictly on exposed grey anorthosite apexes, testing all root-suspended humus bridges, and never descending solo into unventilated lower sump crevices.',
    description:
      'Massive Proterozoic anorthosite cliff-fall block fields below Wallface Mountain and Avalanche Caribou Pass, forming multi-tiered pseudokarst cold traps that refrigerate summer air currents well into August.',
  },
  {
    id: 'driftless-algific-talus-slopes-iowa',
    name: 'Driftless Area Algific Talus Cold-Air Vent Slopes',
    physiographicProvince: 'Upper Mississippi Carbonate Escarpment',
    country: 'USA',
    region: 'Clayton County, Iowa',
    latitude: 42.845,
    longitude: -91.265,
    elevationMeters: 275,
    regime: 'algific-dolomite-cold-vent-slope',
    maxVoidDepthM: 12,
    summerDraftTempDeltaC: 28,
    mossBridgeMaskingPct: 85,
    difficulty: 'moderate',
    bestSeason: 'Observation Only from Designated Rim Overlooks (Closed to Off-Trail Foot Traffic)',
    hazards: [
      'Irreversible crushing of federally endangered Pleistocene relict land snails (Discus macclintocki) and northern monkshood (Aconitum noveboracense) by a single boot step',
      'Collapse of fragile, water-saturated bryophyte cushions and loose Ordovician dolomite colluvium capping subsurface ice-fissure vents',
      'Permanent disruption of delicate subterranean barometric cold-air chimney circulation if talus vent orifices are compacted or dislodged',
    ],
    navigationProtocol:
      'three-point-dry-granite-hop remaining strictly on designated upland dolomite ledges or viewing boardwalks, never stepping onto refrigerated bryophyte vent aprons or disturbing loose carbonate talus.',
    description:
      'Globally rare periglacial micro-ecosystems along the unglaciated Upper Mississippi blufflands where fractured dolomite sinkholes and ice-lined talus vents exhale 0–4°C air all summer, preserving Ice Age flora and fauna.',
  },
  {
    id: 'kamenec-crevice-ice-talus-bohemia-czechia',
    name: 'Kamenec & Naděje Pseudokarst Phonolite Cold-Trap Block-Field',
    physiographicProvince: 'Lužické hory / Česká Lípa, Northern Bohemia',
    country: 'Czech Republic',
    region: 'Northern Bohemia',
    latitude: 50.793,
    longitude: -14.634,
    elevationMeters: 540,
    regime: 'periglacial-block-stream-felsenmeer',
    maxVoidDepthM: 16,
    summerDraftTempDeltaC: 22,
    mossBridgeMaskingPct: 58,
    difficulty: 'challenging',
    bestSeason: 'May – October (Dry Midday Barometric Outflow)',
    hazards: [
      'Glazed clinking phonolite and basaltic felsenmeer slabs coated in perennial hoarfrost, sublimation glaze, and hepatic liverwort mats',
      'Narrow wedge-shaped periglacial crevices that trap ankles and knees beneath overhanging frost-riven volcanic plates',
      'Sudden thermal shock and lens/headlamp fogging when crossing the 22°C temperature boundary into subterranean ice caverns (Ledová jeskyně)',
    ],
    navigationProtocol:
      'probe-sphagnum-mats-microspike-transition maintaining three-point contact across ringing phonolite plates, avoiding frost-heaved edge cantilevers, and protecting endemic Arctic-alpine moss colonies around cold-vent mouths.',
    description:
      'Central European Tertiary volcanic phonolite block streams and pseudokarst ice caves in the Lusatian Mountains, where winter gravitational air drainage freezes spring snowmelt into subterranean firn and glaze.',
  },
];

export const TALUS_COLD_TRAP_GEAR_CHECKLIST: TalusColdTrapGearItem[] = [
  {
    id: 'stainless-torsional-microspikes-carbide-talus-probe',
    name: 'Stainless-Steel Torsional Chain Microspikes & Carbide Talus Probe',
    category: 'verglas-traction',
    essential: true,
    rationale:
      'Bites through invisible summer dew-point verglas on sub-zero Balch-cooled boulders while the carbide probe tests suspect Sphagnum and birch-root humus bridges before committing body weight.',
  },
  {
    id: 'uiaa-sub-talus-caving-helmet-dual-headlamp',
    name: 'UIAA-Rated Sub-Talus Caving Helmet & Dual-Beam Headlamp (Anti-Fog)',
    category: 'void-fall-protection',
    essential: true,
    rationale:
      'Protects the cranium against low overhanging granite chockstones inside pitch-black megatalus conduits where humid summer air instantly condenses into dense fog.',
  },
  {
    id: 'sub-zero-belay-parka-closed-cell-void-sit-pad',
    name: 'Packable Synthetic Belay Parka & Closed-Cell Foam Void Insulation Pad',
    category: 'cold-cavity-rescue',
    essential: true,
    rationale:
      'Prevents rapid conductive and convective hypothermia (3–6 °C/hr cooling) if a hiker is immobilized or wedged inside a 0°C subterranean cold-draft chimney.',
  },
  {
    id: 'webbing-haul-tether-pack-pass-cord',
    name: '15m 8mm Static Pack-Haul Line & Chockstone Belay Webbing Sling',
    category: 'void-fall-protection',
    essential: true,
    rationale:
      'Allows packs to be unbuckled and hauled separately through narrow sub-talus lemon squeezers and provides an upper spotter belay across glazed chasm bridges.',
  },
  {
    id: 'algific-bryophyte-boot-brush-standoff-protocol-card',
    name: 'Algific Relict Bryophyte Boot-Sanitation Brush & GPS Boundary Waypoints',
    category: 'ecological-preservation',
    essential: true,
    rationale:
      'Prevents invasive seed transport and keeps traversers off fragile algific dolomite cold-vent aprons harboring endangered Pleistocene relict snails (Discus macclintocki).',
  },
  {
    id: 'pocket-thermo-hygrometer-co2-sump-monitor',
    name: 'Digital Dew-Point Thermo-Hygrometer & Low-Ventilation CO2 Monitor',
    category: 'cold-cavity-rescue',
    essential: false,
    rationale:
      'Quantifies ambient dew-point spread to predict condensation verglas on cold rock and warns of stagnant heavy-gas accumulation in deep dead-end talus sumps.',
  },
];

export function filterTalusColdTrapSites(
  sites: TalusColdTrapSite[] = TALUS_COLD_TRAP_SITES,
  filters: {
    country?: string;
    regime?: string;
    difficulty?: string;
    search?: string;
  } = {}
): TalusColdTrapSite[] {
  const { country, regime, difficulty, search } = filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (regime && regime !== 'all' && site.regime !== regime) {
      return false;
    }
    if (difficulty && difficulty !== 'all' && site.difficulty !== difficulty) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.physiographicProvince,
        site.country,
        site.region,
        site.regime,
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

export function calculateTalusColdTrap(
  input: TalusColdTrapInput
): TalusColdTrapAnalysis {
  const {
    ambientAirTempC,
    creviceVoidDepthM,
    mossHumusMaskingPct,
    boulderBlockSpanM,
    coldDraftVelocityMs,
  } = input;

  if (
    !Number.isFinite(ambientAirTempC) ||
    ambientAirTempC < -10 ||
    ambientAirTempC > 38
  ) {
    throw new Error(
      'Invalid ambientAirTempC: must be a finite number between -10 and 38 °C.'
    );
  }

  if (
    !Number.isFinite(creviceVoidDepthM) ||
    creviceVoidDepthM < 1.0 ||
    creviceVoidDepthM > 35.0
  ) {
    throw new Error(
      'Invalid creviceVoidDepthM: must be a finite number between 1.0 and 35.0 m.'
    );
  }

  if (
    !Number.isFinite(mossHumusMaskingPct) ||
    mossHumusMaskingPct < 0 ||
    mossHumusMaskingPct > 100
  ) {
    throw new Error(
      'Invalid mossHumusMaskingPct: must be a finite number between 0 and 100 %.'
    );
  }

  if (
    !Number.isFinite(boulderBlockSpanM) ||
    boulderBlockSpanM < 0.4 ||
    boulderBlockSpanM > 12.0
  ) {
    throw new Error(
      'Invalid boulderBlockSpanM: must be a finite number between 0.4 and 12.0 m.'
    );
  }

  if (
    !Number.isFinite(coldDraftVelocityMs) ||
    coldDraftVelocityMs < 0.1 ||
    coldDraftVelocityMs > 8.5
  ) {
    throw new Error(
      'Invalid coldDraftVelocityMs: must be a finite number between 0.1 and 8.5 m/s.'
    );
  }

  const tempNorm = (ambientAirTempC - -10) / 48;
  const depthNorm = (creviceVoidDepthM - 1.0) / 34.0;
  const mossNorm = mossHumusMaskingPct / 100;
  const spanNorm = (boulderBlockSpanM - 0.4) / 11.6;
  const draftNorm = (coldDraftVelocityMs - 0.1) / 8.4;
  const draftInv = (8.5 - coldDraftVelocityMs) / 8.4;

  // 1. verglasGlazeSlipProbabilityPct (3 to 98 %)
  const rawVerglas = 3 + tempNorm * 40 + draftNorm * 30 + depthNorm * 25;
  const verglasGlazeSlipProbabilityPct = roundTo(clamp(rawVerglas, 3, 98), 1);

  // 2. mossBridgeCollapseRiskPct (2 to 99 %)
  const rawMoss = 2 + mossNorm * 52 + spanNorm * 25 + depthNorm * 20;
  const mossBridgeCollapseRiskPct = roundTo(clamp(rawMoss, 2, 99), 1);

  // 3. voidHypothermiaCoolingRateCPerHr (0.3 to 6.8 °C/hr)
  const rawCooling = 0.3 + draftNorm * 4.0 + depthNorm * 2.5;
  const voidHypothermiaCoolingRateCPerHr = roundTo(
    clamp(rawCooling, 0.3, 6.8),
    2
  );

  // 4. radonCo2PocketAccumulationIndex (5 to 100)
  const rawGas = 5 + depthNorm * 70 + draftInv * 25;
  const radonCo2PocketAccumulationIndex = roundTo(clamp(rawGas, 5, 100), 1);

  // 5. riskLevel
  let riskLevel: TalusColdTrapAnalysis['riskLevel'];
  if (
    verglasGlazeSlipProbabilityPct >= 78 ||
    mossBridgeCollapseRiskPct >= 78 ||
    voidHypothermiaCoolingRateCPerHr >= 4.5 ||
    radonCo2PocketAccumulationIndex >= 80
  ) {
    riskLevel = 'critical';
  } else if (
    verglasGlazeSlipProbabilityPct >= 55 ||
    mossBridgeCollapseRiskPct >= 55 ||
    voidHypothermiaCoolingRateCPerHr >= 2.8 ||
    radonCo2PocketAccumulationIndex >= 58
  ) {
    riskLevel = 'high';
  } else if (
    verglasGlazeSlipProbabilityPct >= 30 ||
    mossBridgeCollapseRiskPct >= 30 ||
    voidHypothermiaCoolingRateCPerHr >= 1.5 ||
    radonCo2PocketAccumulationIndex >= 35
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. navigationStrategy
  const strategyMap: Record<
    TalusColdTrapAnalysis['riskLevel'],
    TalusColdTrapAnalysis['navigationStrategy']
  > = {
    critical: 'abort-glazed-megatalus-entrapment-hazard',
    high: 'belay-chockstone-crawl-avoid-deep-vents',
    moderate: 'probe-sphagnum-mats-microspike-transition',
    low: 'three-point-dry-granite-hop',
  };

  const navigationStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (riskLevel === 'critical') {
    warnings.push(
      `CRITICAL MEGATALUS VERGLAS, MOSS-BRIDGE COLLAPSE & VOID ENTRAPMENT HAZARD (verglas slip = ${verglasGlazeSlipProbabilityPct}%, moss-bridge collapse = ${mossBridgeCollapseRiskPct}%, hypothermia cooling = ${voidHypothermiaCoolingRateCPerHr} °C/hr, radon/CO2 index = ${radonCo2PocketAccumulationIndex}/100): Severe sub-talus glazing and chasm punch-through risk; abort megatalus floor traverse immediately.`
    );
  } else if (riskLevel === 'high') {
    warnings.push(
      `HIGH BALCH COLD-VENT GLAZE & SUB-TALUS CHASM HAZARD (verglas slip = ${verglasGlazeSlipProbabilityPct}%, moss-bridge collapse = ${mossBridgeCollapseRiskPct}%, hypothermia cooling = ${voidHypothermiaCoolingRateCPerHr} °C/hr, radon/CO2 index = ${radonCo2PocketAccumulationIndex}/100): Unbuckle packs, belay across chockstones, and stay out of deep refrigerated vent conduits.`
    );
  } else if (riskLevel === 'moderate') {
    warnings.push(
      `Moderate condensation verglas and Sphagnum bridge masking risk (verglas slip = ${verglasGlazeSlipProbabilityPct}%, moss-bridge collapse = ${mossBridgeCollapseRiskPct}%, hypothermia cooling = ${voidHypothermiaCoolingRateCPerHr} °C/hr, radon/CO2 index = ${radonCo2PocketAccumulationIndex}/100): Probe all humus mats before stepping and transition to microspikes near cold-air outflow vents.`
    );
  }

  if (mossHumusMaskingPct >= 45) {
    warnings.push(
      `FALSE SPHAGNUM & ROOT-MAT CHASM MASKING (${mossHumusMaskingPct}% humus cover over ${creviceVoidDepthM}m voids): Suspended bryophyte carpets conceal open ${boulderBlockSpanM}m boulder spans and fragile algific talus micro-habitats.`
    );
  }

  const recommendations: string[] = [
    `Execute ${navigationStrategy} protocol immediately (verglas slip probability: ${verglasGlazeSlipProbabilityPct}%, moss-bridge collapse risk: ${mossBridgeCollapseRiskPct}%, void cooling rate: ${voidHypothermiaCoolingRateCPerHr} °C/hr).`,
    mossBridgeCollapseRiskPct >= 30 || mossHumusMaskingPct >= 30
      ? `Probe every Sphagnum and rotting birch-root mat with a carbide shaft before weighting, and never step onto protected algific dolomite cold-vent bryophyte aprons (${mossHumusMaskingPct}% masking).`
      : `Step strictly on dry, exposed bedrock apexes with three-point contact while avoiding isolated moss-draped crevice lips.`,
    voidHypothermiaCoolingRateCPerHr >= 1.5 ||
    radonCo2PocketAccumulationIndex >= 35
      ? `Pack a synthetic belay parka and closed-cell insulation pad for ${voidHypothermiaCoolingRateCPerHr} °C/hr cold-conduit cooling, and avoid unventilated dead-end talus sumps (radon/CO2 index: ${radonCo2PocketAccumulationIndex}/100).`
      : `Keep windproof shell layers accessible before entering sub-talus air-draft notches where summer temperatures plunge by 15–28 °C.`,
  ];

  return {
    verglasGlazeSlipProbabilityPct,
    mossBridgeCollapseRiskPct,
    voidHypothermiaCoolingRateCPerHr,
    radonCo2PocketAccumulationIndex,
    riskLevel,
    navigationStrategy,
    warnings,
    recommendations,
  };
}

export function getTalusColdTrapGearChecklist(): TalusColdTrapGearItem[] {
  return [...TALUS_COLD_TRAP_GEAR_CHECKLIST];
}
