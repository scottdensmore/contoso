export type SandurMorphology =
  | 'jokulhlaup-basalt-sandur'
  | 'anastomosing-glacial-silt-braid'
  | 'proglacial-boulder-outwash-fan'
  | 'tidal-estuarine-glacial-delta';

export interface SandurCrossingSite {
  id: string;
  name: string;
  glacierSource: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: SandurMorphology;
  activeBraidCount: number;
  diurnalSurgeRatio: number;
  siltFlourConcentrationMgL: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  wadingProtocol: string;
  description: string;
}

export interface SandurCrossingInput {
  waterDepthM: number;
  flowVelocityMs: number;
  hourOfDay24: number;
  siltFlourConcentrationMgL: number;
  hikerMassKg: number;
}

export interface SandurCrossingAnalysis {
  hydrodynamicMomentumProduct: number;
  quicksandLiquefactionIndex: number;
  diurnalDischargeMultiplier: number;
  bedloadBoulderRollRiskPct: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  crossingTechnique:
    | 'solo-diagonal-downstream-pole'
    | 'tripod-wedge-linked-belt-unbuckled'
    | 'wait-for-dawn-low-melt-window'
    | 'abort-impassable-glacial-torrent';
  warnings: string[];
  recommendations: string[];
}

export interface SandurGearItem {
  id: string;
  name: string;
  category:
    | 'wading-stability'
    | 'pack-waterproofing'
    | 'quicksand-extraction'
    | 'thermal-recovery';
  essential: boolean;
  rationale: string;
}

export const SANDUR_CROSSING_SITES: SandurCrossingSite[] = [
  {
    id: 'skeidararsandur-krossa-iceland',
    name: 'Skeiðarársandur & Þórsmörk Krossá Braided Outwash Plain',
    glacierSource: 'Vatnajökull / Mýrdalsjökull',
    country: 'Iceland',
    region: 'Suðurland',
    latitude: 63.683,
    longitude: -19.512,
    elevationMeters: 180,
    morphology: 'jokulhlaup-basalt-sandur',
    activeBraidCount: 18,
    diurnalSurgeRatio: 2.4,
    siltFlourConcentrationMgL: 3800,
    difficulty: 'extreme',
    bestSeason: 'Late June – Early September (04:30–07:30 Dawn Freeze Trough)',
    hazards: [
      'Rapid diurnal and volcanic subglacial jökulhlaup discharge surges that shift deep thalweg channels across black basalt tephra within hours',
      'Thixotropic volcanic-basalt and glacial-flour silt bars (bleytur) bordering slackwater braids that liquefy instantly under static boot pressure',
      'Rolling 15–40 kg sub-surface basalt cobbles and 1–3 °C meltwater triggering rapid lower-extremity neuromuscular incapacitation',
    ],
    wadingProtocol:
      'wait-for-dawn-low-melt-window or execute tripod-wedge-linked-belt-unbuckled across the widest multi-thread diagonal gravel riffle.',
    description:
      'Hyper-dynamic Icelandic basalt outwash plains fed by Vatnajökull and Mýrdalsjökull, where opaque glacial milk conceals rolling basalt bedload and notorious volcanic quicksand pockets.',
  },
  {
    id: 'slim-river-kaskawulsh-canada',
    name: "Kaskawulsh & Slims River (Ä'äy Chù) Glacial Silt Outwash",
    glacierSource: 'Kaskawulsh Glacier (St. Elias Icefield)',
    country: 'Canada',
    region: 'Kluane National Park, Yukon',
    latitude: 60.875,
    longitude: -138.582,
    elevationMeters: 810,
    morphology: 'anastomosing-glacial-silt-braid',
    activeBraidCount: 14,
    diurnalSurgeRatio: 2.1,
    siltFlourConcentrationMgL: 4200,
    difficulty: 'challenging',
    bestSeason: 'June – August (Early-Morning Katabatic Cold-Drainage Window)',
    hazards: [
      'Deep thixotropic glacial-flour quicksand flats formed by rapid drainage piracy and suspended sediment deposition exceeding 4,000 mg/L',
      'Steeply undercut anastomosing silt cutbanks that collapse into fast-flowing proglacial braids when weighted near the channel margin',
      'Severe katabatic glacier-wind dust storms and 2 °C meltwater channels requiring continuous thermal recovery management',
    ],
    wadingProtocol:
      'tripod-wedge-linked-belt-unbuckled while probing unconsolidated silt bars ahead with a carbide-tipped wading staff and maintaining constant forward motion.',
    description:
      'Vast anastomosing proglacial valley floor in Kluane National Park where St. Elias rock flour creates expansive thixotropic quicksand aprons and shifting braided channels.',
  },
  {
    id: 'rakaia-gorge-braids-nz',
    name: 'Rakaia & Hopkins Braided Greywacke Shingle Outwash',
    glacierSource: 'Lyell & Ramsay Glaciers (Southern Alps)',
    country: 'New Zealand',
    region: 'Canterbury',
    latitude: -43.385,
    longitude: 171.142,
    elevationMeters: 490,
    morphology: 'proglacial-boulder-outwash-fan',
    activeBraidCount: 22,
    diurnalSurgeRatio: 1.9,
    siltFlourConcentrationMgL: 1650,
    difficulty: 'challenging',
    bestSeason: 'January – April (Stable Late-Summer Nor-West Free Window)',
    hazards: [
      'High-velocity greywacke shingle and boulder bedload transport audible underwater as a continuous clattering roar during afternoon melt or Nor-West rain',
      'Deceptively steep hydraulic gradients across 2 km-wide shingle plains where narrow single-chute convergences exceed 2.5 m/s',
      'Opaque turquoise glacial flour masking abrupt 1.2 m scour holes downstream of mid-channel gravel bars',
    ],
    wadingProtocol:
      'tripod-wedge-linked-belt-unbuckled or mutual-support pack-strap link across the widest oblique shingle riffle between gravel islands.',
    description:
      'Iconic Southern Alps braided greywacke river valleys where hikers must read diagonal riffle lines across dozens of active shingle threads and guard against rolling bedload.',
  },
  {
    id: 'copper-river-sheridan-alaska-usa',
    name: 'Sheridan & Scott Glacier Outwash Sandur Delta',
    glacierSource: 'Sheridan & Scott Glaciers (Chugach Mountains)',
    country: 'United States',
    region: 'Copper River Delta, Alaska',
    latitude: 60.482,
    longitude: -145.365,
    elevationMeters: 45,
    morphology: 'tidal-estuarine-glacial-delta',
    activeBraidCount: 11,
    diurnalSurgeRatio: 1.6,
    siltFlourConcentrationMgL: 2400,
    difficulty: 'moderate',
    bestSeason: 'May – September (Low-Tide & Dawn Ablation Coincidence)',
    hazards: [
      'Compounded hydrodynamic backwater when Gulf of Alaska flood tides dam afternoon Chugach glacial ablation surges',
      'Waterlogged estuarine glacial-silt mudflats and liquefied sand bars bordering coastal willow islands',
      'Floating brash ice fragments and submerged spruce snags entrained in turbid proglacial delta channels',
    ],
    wadingProtocol:
      'solo-diagonal-downstream-pole at low-tide dawn slackwater with hipbelt and sternum strap unbuckled.',
    description:
      'A coastal Chugach glacial outwash sandur merging into the Copper River Delta, where safe wading requires synchronizing early-morning ablation lows with ebb-tide drainage.',
  },
];

export const SANDUR_GEAR_CHECKLIST: SandurGearItem[] = [
  {
    id: 'carbide-wading-staff-dual-flicklock-poles',
    name: 'Carbide-Tipped Collapsible Wading Staff & Dual Flick-Lock Trekking Poles',
    category: 'wading-stability',
    essential: true,
    rationale:
      'Provides a third and fourth point of contact to probe unseen scour drop-offs and resist lateral hydrodynamic drag in opaque glacial milk.',
  },
  {
    id: 'high-traction-lugged-trail-wading-boots',
    name: 'Drainage-Port Lugged Trail Runners or Neoprene-Sock Gravel-Guard Wading Boots',
    category: 'wading-stability',
    essential: true,
    rationale:
      'Protects toes and ankles from rolling basalt/greywacke cobbles while preventing boot suction in thixotropic glacial silt.',
  },
  {
    id: 'submersible-tpu-pack-liner-quick-release-buckle',
    name: 'Submersible Roll-Top TPU Pack Liner & Quick-Release Hipbelt Buckle Check',
    category: 'pack-waterproofing',
    essential: true,
    rationale:
      'Keeps insulation dry while turning the pack into a positive-buoyancy flotation bladder; unbuckled hipbelt and sternum straps allow instant jettison if swept.',
  },
  {
    id: 'floating-polypropylene-throw-bag-rescue-line',
    name: '20 m Floating Polypropylene 8 mm Throw Bag & Quick-Clip Rescue Sling',
    category: 'quicksand-extraction',
    essential: true,
    rationale:
      'Enables bank-anchored pendulum rescues and low-angle horizontal extraction of a partner immobilized in liquefied silt-bar quicksand.',
  },
  {
    id: 'horizontal-quicksand-distribute-load-pad',
    name: 'Closed-Cell EVA Foam Crawl Pad / Snowshoe Load-Distribution Platform',
    category: 'quicksand-extraction',
    essential: false,
    rationale:
      'Distributes body weight below the liquefaction yield threshold when crawling horizontally out of thixotropic glacial-flour silt bars.',
  },
  {
    id: 'neoprene-wading-socks-windproof-recovery-kit',
    name: '3 mm Neoprene Wading Socks, Microfiber Dry Towel & Windproof Shell Trousers',
    category: 'thermal-recovery',
    essential: true,
    rationale:
      'Prevents cold-water vasoconstriction and loss of proprioception across 10+ consecutive 1–3 °C braided channels.',
  },
];

export function filterSandurSites(
  sites: SandurCrossingSite[] = SANDUR_CROSSING_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): SandurCrossingSite[] {
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
        site.glacierSource,
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

export function calculateSandurCrossing(
  input: SandurCrossingInput
): SandurCrossingAnalysis {
  const {
    waterDepthM,
    flowVelocityMs,
    hourOfDay24,
    siltFlourConcentrationMgL,
    hikerMassKg,
  } = input;

  if (
    !Number.isFinite(waterDepthM) ||
    waterDepthM < 0.1 ||
    waterDepthM > 2.0
  ) {
    throw new Error(
      'Invalid waterDepthM: must be a finite number between 0.1 and 2.0 meters.'
    );
  }

  if (
    !Number.isFinite(flowVelocityMs) ||
    flowVelocityMs < 0.1 ||
    flowVelocityMs > 5.0
  ) {
    throw new Error(
      'Invalid flowVelocityMs: must be a finite number between 0.1 and 5.0 m/s.'
    );
  }

  if (
    !Number.isFinite(hourOfDay24) ||
    hourOfDay24 < 0 ||
    hourOfDay24 > 23
  ) {
    throw new Error(
      'Invalid hourOfDay24: must be a finite number between 0 and 23 hours.'
    );
  }

  if (
    !Number.isFinite(siltFlourConcentrationMgL) ||
    siltFlourConcentrationMgL < 50 ||
    siltFlourConcentrationMgL > 5000
  ) {
    throw new Error(
      'Invalid siltFlourConcentrationMgL: must be a finite number between 50 and 5000 mg/L.'
    );
  }

  if (
    !Number.isFinite(hikerMassKg) ||
    hikerMassKg < 40 ||
    hikerMassKg > 150
  ) {
    throw new Error(
      'Invalid hikerMassKg: must be a finite number between 40 and 150 kg.'
    );
  }

  // Diurnal discharge multiplier:
  // Lowest around dawn (hourOfDay24 4..8 => 0.75 to 0.90)
  // Peaks in late afternoon/evening (hourOfDay24 14..20 => 1.35 to 1.65)
  let rawDiurnalMultiplier: number;
  if (hourOfDay24 >= 4 && hourOfDay24 <= 8) {
    rawDiurnalMultiplier = 0.75 + Math.abs(hourOfDay24 - 6) * 0.06;
  } else if (hourOfDay24 >= 14 && hourOfDay24 <= 20) {
    rawDiurnalMultiplier = 1.65 - Math.abs(hourOfDay24 - 17) * 0.09;
  } else if (hourOfDay24 > 8 && hourOfDay24 < 14) {
    rawDiurnalMultiplier = 0.9 + ((hourOfDay24 - 8) / 6) * 0.44;
  } else if (hourOfDay24 > 20) {
    rawDiurnalMultiplier = 1.32 - ((hourOfDay24 - 20) / 4) * 0.28;
  } else {
    rawDiurnalMultiplier = 1.02 - (hourOfDay24 / 4) * 0.14;
  }
  const diurnalDischargeMultiplier = roundTo(
    clamp(rawDiurnalMultiplier, 0.75, 1.65),
    2
  );

  // Hydrodynamic momentum product: waterDepthM * (flowVelocityMs * diurnalDischargeMultiplier) adjusted for hikerMassKg
  const massFactor = Math.pow(80 / hikerMassKg, 0.35);
  const rawMomentum =
    waterDepthM * (flowVelocityMs * diurnalDischargeMultiplier) * massFactor;
  const hydrodynamicMomentumProduct = roundTo(clamp(rawMomentum, 0.01, 15.0), 2);

  // Thixotropic glacial-flour silt-bar liquefaction index (1.0 to 10.0),
  // increasing with siltFlourConcentrationMgL and low-to-moderate braid edge velocities
  const edgeSettlingFactor =
    Math.exp(-Math.pow((flowVelocityMs - 1.2) / 1.4, 2)) * 1.6;
  const rawQuicksand =
    1.0 +
    ((siltFlourConcentrationMgL - 50) / 4950) * 6.8 +
    edgeSettlingFactor * (siltFlourConcentrationMgL / 5000) +
    (diurnalDischargeMultiplier - 0.75) * 0.9;
  const quicksandLiquefactionIndex = roundTo(
    clamp(rawQuicksand, 1.0, 10.0),
    1
  );

  // Probability of submerged cobbles/boulders rolling underfoot (0 to 100%),
  // increasing with flowVelocityMs, waterDepthM, and diurnalDischargeMultiplier
  const effectiveVelocity = flowVelocityMs * diurnalDischargeMultiplier;
  const rawBoulderRoll =
    (effectiveVelocity / 4.2) * 52 +
    (waterDepthM / 1.6) * 32 +
    (diurnalDischargeMultiplier - 0.75) * 18;
  const bedloadBoulderRollRiskPct = roundTo(
    clamp(rawBoulderRoll, 0, 100),
    1
  );

  let riskLevel: SandurCrossingAnalysis['riskLevel'];
  if (
    hydrodynamicMomentumProduct >= 1.45 ||
    waterDepthM >= 1.1 ||
    flowVelocityMs >= 2.8 ||
    bedloadBoulderRollRiskPct >= 75
  ) {
    riskLevel = 'critical';
  } else if (
    hydrodynamicMomentumProduct >= 0.95 ||
    waterDepthM >= 0.8 ||
    quicksandLiquefactionIndex >= 7.5 ||
    bedloadBoulderRollRiskPct >= 50
  ) {
    riskLevel = 'high';
  } else if (
    hydrodynamicMomentumProduct >= 0.55 ||
    waterDepthM >= 0.55 ||
    quicksandLiquefactionIndex >= 5.0 ||
    bedloadBoulderRollRiskPct >= 25
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  const techniqueMap: Record<
    SandurCrossingAnalysis['riskLevel'],
    SandurCrossingAnalysis['crossingTechnique']
  > = {
    critical: 'abort-impassable-glacial-torrent',
    high: 'wait-for-dawn-low-melt-window',
    moderate: 'tripod-wedge-linked-belt-unbuckled',
    low: 'solo-diagonal-downstream-pole',
  };

  const crossingTechnique = techniqueMap[riskLevel];

  const warnings: string[] = [];
  if (
    hydrodynamicMomentumProduct >= 1.45 ||
    waterDepthM >= 1.1 ||
    flowVelocityMs >= 2.8
  ) {
    warnings.push(
      `CRITICAL HYDRODYNAMIC DRAG TORRENT (${hydrodynamicMomentumProduct} m²/s momentum product at ${waterDepthM} m depth and ${flowVelocityMs} m/s velocity): Exceeds human wading stability envelope for a ${hikerMassKg} kg hiker.`
    );
  } else if (hydrodynamicMomentumProduct >= 0.95 || waterDepthM >= 0.8) {
    warnings.push(
      `HIGH GLACIAL MELT SURGE DRAG (${hydrodynamicMomentumProduct} m²/s momentum product, ${diurnalDischargeMultiplier}x diurnal multiplier at ${hourOfDay24}:00): Thigh-to-waist immersion threatens immediate foot sweep.`
    );
  } else if (hydrodynamicMomentumProduct >= 0.55 || waterDepthM >= 0.55) {
    warnings.push(
      `Moderate hydrodynamic knee-to-thigh drag (${hydrodynamicMomentumProduct} m²/s momentum product at ${waterDepthM} m depth): Unbuckle pack hipbelt/sternum straps and link team wedge.`
    );
  }

  if (quicksandLiquefactionIndex >= 7.5) {
    warnings.push(
      `SEVERE THIXOTROPIC SILT-BAR QUICKSAND HAZARD (${quicksandLiquefactionIndex}/10 liquefaction index at ${siltFlourConcentrationMgL} mg/L glacial flour): Slackwater braid margins will liquefy under static foot placement.`
    );
  } else if (quicksandLiquefactionIndex >= 5.0) {
    warnings.push(
      `Moderate glacial-flour quicksand liquefaction risk (${quicksandLiquefactionIndex}/10 index at ${siltFlourConcentrationMgL} mg/L): Keep moving across exposed silt bars and probe channel edges.`
    );
  }

  if (bedloadBoulderRollRiskPct >= 75) {
    warnings.push(
      `CRITICAL SUBMERGED BEDLOAD BOULDER ROLL (${bedloadBoulderRollRiskPct}% roll risk): High tractive force is actively mobilizing cobbles and boulders along the channel floor.`
    );
  } else if (bedloadBoulderRollRiskPct >= 50) {
    warnings.push(
      `High bedload cobble instability (${bedloadBoulderRollRiskPct}% roll risk): Expect shifting underwater boulders and zero visual bottom contact.`
    );
  } else if (bedloadBoulderRollRiskPct >= 25) {
    warnings.push(
      `Moderate shifting shingle/cobble bedload (${bedloadBoulderRollRiskPct}% roll risk): Shuffle feet rather than lifting high into the current.`
    );
  }

  const recommendations: string[] = [
    `Execute ${crossingTechnique} protocol immediately (momentum product: ${hydrodynamicMomentumProduct} m²/s, diurnal multiplier: ${diurnalDischargeMultiplier}x).`,
    hourOfDay24 >= 12
      ? `Target the 04:30–08:00 dawn freeze trough instead of ${hourOfDay24}:00 to cut diurnal glacial discharge multiplier from ${diurnalDischargeMultiplier}x down toward 0.75x.`
      : `Capitalize on the early-morning low-ablation window (${hourOfDay24}:00, ${diurnalDischargeMultiplier}x multiplier) before solar melt waves arrive from the glacier terminus.`,
    `Select the widest multi-thread braided gravel riffle (angled 30–45° diagonally downstream) rather than narrow single-chute bottlenecks.`,
    `Unbuckle pack hipbelt and sternum straps prior to stepping off the bank and probe turbid (${siltFlourConcentrationMgL} mg/L) silt margins for thixotropic quicksand (${quicksandLiquefactionIndex}/10).`,
  ];

  return {
    hydrodynamicMomentumProduct,
    quicksandLiquefactionIndex,
    diurnalDischargeMultiplier,
    bedloadBoulderRollRiskPct,
    riskLevel,
    crossingTechnique,
    warnings,
    recommendations,
  };
}

export function getSandurGearChecklist(): SandurGearItem[] {
  return [...SANDUR_GEAR_CHECKLIST];
}
