export type GlaciereMorphology =
  | 'static-cold-trap-lava-tube'
  | 'dynamic-chimney-karst-ice'
  | 'permafrost-fissure-glaciere'
  | 'stratified-firn-plug-pit';

export interface GlaciereCaveSite {
  id: string;
  name: string;
  caveSystem: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: GlaciereMorphology;
  floorIceSlopeDeg: number;
  caveAirTempC: number;
  co2PocketPpm: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  tractionProtocol: string;
  description: string;
}

export interface GlaciereCavingInput {
  floorIceSlopeDeg: number;
  caveAirTempC: number;
  meltwaterFilmMm: number;
  co2Ppm: number;
  hoarfrostCeilingThicknessCm: number;
}

export interface GlaciereCavingAnalysis {
  iceFrictionCoefficient: number;
  cramponShearSafetyFactor: number;
  hoarfrostDetachmentRiskPct: number;
  hypoxicCo2Index: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  tractionClass:
    | 'microspikes-10pt'
    | 'steel-12pt-crampons-ice-axe'
    | 'front-point-dual-tools-ice-screws'
    | 'abort-glaze-co2-collapse-hazard';
  warnings: string[];
  recommendations: string[];
}

export interface GlaciereGearItem {
  id: string;
  name: string;
  category:
    | 'traction'
    | 'gas-monitoring'
    | 'thermal-shell'
    | 'rigging-anchoring';
  essential: boolean;
  rationale: string;
}

export const GLACIERE_CAVE_SITES: GlaciereCaveSite[] = [
  {
    id: 'eisriesenwelt-tennengebirge-austria',
    name: 'Eisriesenwelt Dynamic Wind-Chimney Ice Labyrinth',
    caveSystem: 'Tennengebirge Dachstein Limestone Karst System',
    country: 'Austria',
    region: 'Tennengebirge, Salzburg',
    latitude: 47.503,
    longitude: 13.19,
    elevationMeters: 1641,
    morphology: 'dynamic-chimney-karst-ice',
    floorIceSlopeDeg: 28,
    caveAirTempC: -1.8,
    co2PocketPpm: 950,
    difficulty: 'challenging',
    bestSeason: 'May – October (Post-Avalanche Portal Window)',
    hazards: [
      'Steep 25–32° Congelation-ice ramps across the Great Ice Embankment (Großer Eiswall)',
      'Fierce barometric chimney drafts at the entrance portal accelerating windchill and glaze polishing',
      'Overhead sublimation hoarfrost plates detaching during late-summer warm air intrusions',
    ],
    tractionProtocol:
      'steel-12pt-crampons-ice-axe with full anti-balling plates across thePosselt Hall and Eispalast ramps.',
    description:
      'The world’s largest known limestone dynamic ice cave system (42 km total length), where winter chimney convection freezes spring karst seepage into towering congelation-ice walls and steep subterranean glacier ramps.',
  },
  {
    id: 'scarisoara-glaciere-apuseni-romania',
    name: 'Peștera Scărișoara Stratified Firn-Block Cold Trap',
    caveSystem: 'Ghețarul de la Scărișoara Karst Sinkhole Shaft',
    country: 'Romania',
    region: 'Apuseni Mountains, Alba County',
    latitude: 46.489,
    longitude: 22.809,
    elevationMeters: 1165,
    morphology: 'stratified-firn-plug-pit',
    floorIceSlopeDeg: 32,
    caveAirTempC: -1.2,
    co2PocketPpm: 2100,
    difficulty: 'challenging',
    bestSeason: 'June – October (Stable Cold-Trap Stratification Window)',
    hazards: [
      '100,000-m³ perennial subterranean ice block flanked by vertical 15–22 m marginal rimayes (randklufts)',
      'Slick meltwater-filmed ice stalagmites in the Church (Biserica) and Great Reserve chambers',
      'Dense cold-air and biogenic CO2 pooling in the lower Great Reserve depression',
    ],
    tractionProtocol:
      'steel-12pt-crampons-ice-axe and fixed static rope handrails around the Great Hall ice block perimeter.',
    description:
      'A classic Balch-effect descending sinkhole shaft housing one of Europe’s oldest perennial underground firn and congelation-ice blocks (>10,500 years BP), surrounded by deep peripheral meltwater rimayes.',
  },
  {
    id: 'bandera-ice-cave-el-malpais-usa',
    name: 'Bandera & Candelaria Static Cold-Trap Basalt Lava Tube',
    caveSystem: 'McCartys & Bandera Pāhoehoe Lava Tube Complex',
    country: 'United States',
    region: 'El Malpais Volcanic Field, New Mexico',
    latitude: 34.993,
    longitude: -108.083,
    elevationMeters: 2390,
    morphology: 'static-cold-trap-lava-tube',
    floorIceSlopeDeg: 18,
    caveAirTempC: -1.5,
    co2PocketPpm: 1450,
    difficulty: 'moderate',
    bestSeason: 'April – November (Semi-Arid Cold-Trap Equilibrium)',
    hazards: [
      'Mirror-smooth congelation floor ice interlayered with razor-sharp vesicular basalt breakdown clasts that blunt crampon points',
      'Sub-ceiling hoarfrost crystal blankets shedding over collapse-trench portals during summer monsoons',
      'Sudden thermal shock transitioning from +32°C desert surface lava fields into -1.5°C static cold-trap tubes',
    ],
    tractionProtocol:
      'microspikes-10pt or chromoly steel 12-point crampons; avoid aluminum spikes across exposed basalt breakdown.',
    description:
      'High-elevation basaltic lava tubes where porous vesicular scoria insulates trapped winter density currents (the Balch effect), preserving perennial green-tinted floor ice beneath the semi-arid New Mexico desert.',
  },
  {
    id: 'lofthellir-lava-glaciere-iceland',
    name: 'Lofthellir Permafrost Basaltic Lava Tube Glacière',
    caveSystem: 'Ludentarborgir & Búrfellshraun Fissure Lava Tube',
    country: 'Iceland',
    region: 'Búrfellshraun, Mývatn',
    latitude: 65.545,
    longitude: -16.768,
    elevationMeters: 370,
    morphology: 'permafrost-fissure-glaciere',
    floorIceSlopeDeg: 34,
    caveAirTempC: -0.8,
    co2PocketPpm: 2600,
    difficulty: 'extreme',
    bestSeason: 'January – April (Cryotic Permafrost Freeze Window)',
    hazards: [
      'Low crawlway squeezeover wet near-0°C black glaze ice leading into steeply pitched subterranean ice chambers',
      'Deep meltwater-flooded sub-ice floor voids and thin cryogenic ice bridges over stagnant water sumps',
      'Volcanic-karstic CO2 accumulation and body-heat-induced ceiling hoarfrost detachment in dead-end chambers',
    ],
    tractionProtocol:
      'front-point-dual-tools-ice-screws with 12-point chromoly crampons and V-thread ice-screw belays on inner ice pitches.',
    description:
      'A 3,500-year-old basaltic lava tube in the Mývatn volcanic zone containing monumental perennial ice stalagmites, steep wet-glaze ramps, and sub-floor meltwater lenses demanding full technical crampon and gas safety protocols.',
  },
];

export const GLACIERE_GEAR_CHECKLIST: GlaciereGearItem[] = [
  {
    id: '12pt-chromoly-steel-crampons-antiballing',
    name: '12-Point Chromoly Steel Crampons with Full Anti-Balling Plates',
    category: 'traction',
    essential: true,
    rationale:
      'Hardened chromoly steel resists point blunting when stepping between congelation floor ice and abrasive basaltic lava breakdown; active ABS plates prevent wet near-0°C slush from balling underfoot.',
  },
  {
    id: 'ndir-co2-o2-sump-gas-monitor',
    name: 'NDIR Dual-Channel CO2 & O2 Subterranean Sump Gas Monitor',
    category: 'gas-monitoring',
    essential: true,
    rationale:
      'Cold-trap density stratification traps dense carbon dioxide (foul air) in descending lava-tube sumps and rimaye trenches where flame tests fail to quantify sub-lethal hypercapnia (2,000–15,000 ppm).',
  },
  {
    id: 'en12492-caving-helmet-dual-ip68-headlamps',
    name: 'EN 12492 Hybrid Caving Helmet with Dual IP68 Cold-Rated LED Headlamps',
    category: 'thermal-shell',
    essential: true,
    rationale:
      'Absorbs impact from detaching ceiling hoarfrost plates and icicle daggers while lithium-ion cold packs maintain lumen output in sub-zero 100%-humidity cave air.',
  },
  {
    id: 'tubular-steel-ice-screws-vthread-hook',
    name: '13–17 cm Chromoly Tubular Ice Screws & Abalakov V-Thread Hook',
    category: 'rigging-anchoring',
    essential: true,
    rationale:
      'Provides reliable belay and handline anchors in thick congelation floor ice where vesicular lava tube walls lack sound rock bolt placements.',
  },
  {
    id: 'cordura-caving-oversuit-neoprene-kneepads',
    name: 'Waterproof Cordura Speleo Oversuit with Insulated Neoprene Kneepads',
    category: 'thermal-shell',
    essential: true,
    rationale:
      'Prevents conductive hypothermia and fabric shredding during low entrance crawls across 0°C meltwater films and razor-sharp aa/pāhoehoe basalt crusts.',
  },
  {
    id: 'compact-technical-ice-axe-adze',
    name: 'Compact 45–50 cm Technical Cave Ice Axe with Steel Adze',
    category: 'rigging-anchoring',
    essential: true,
    rationale:
      'Short shaft clears low lava-tube ceilings during self-arrest and step-chopping on steep subterranean congelation-ice embankments.',
  },
];

export function filterGlaciereSites(
  sites: GlaciereCaveSite[] = GLACIERE_CAVE_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): GlaciereCaveSite[] {
  const { country, morphology, difficulty, search } = filters;
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
      difficulty &&
      difficulty !== 'all' &&
      site.difficulty !== difficulty
    ) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.caveSystem,
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

export function calculateGlaciereCaving(
  input: GlaciereCavingInput
): GlaciereCavingAnalysis {
  const {
    floorIceSlopeDeg,
    caveAirTempC,
    meltwaterFilmMm,
    co2Ppm,
    hoarfrostCeilingThicknessCm,
  } = input;

  if (
    !Number.isFinite(floorIceSlopeDeg) ||
    floorIceSlopeDeg < 0 ||
    floorIceSlopeDeg > 60
  ) {
    throw new Error(
      'Invalid floorIceSlopeDeg: must be a finite number between 0 and 60 degrees.'
    );
  }

  if (
    !Number.isFinite(caveAirTempC) ||
    caveAirTempC < -20 ||
    caveAirTempC > 10
  ) {
    throw new Error(
      'Invalid caveAirTempC: must be a finite number between -20 and 10 degrees Celsius.'
    );
  }

  if (
    !Number.isFinite(meltwaterFilmMm) ||
    meltwaterFilmMm < 0 ||
    meltwaterFilmMm > 25
  ) {
    throw new Error(
      'Invalid meltwaterFilmMm: must be a finite number between 0 and 25 mm.'
    );
  }

  if (!Number.isFinite(co2Ppm) || co2Ppm < 350 || co2Ppm > 50000) {
    throw new Error(
      'Invalid co2Ppm: must be a finite number between 350 and 50000 ppm.'
    );
  }

  if (
    !Number.isFinite(hoarfrostCeilingThicknessCm) ||
    hoarfrostCeilingThicknessCm < 0 ||
    hoarfrostCeilingThicknessCm > 120
  ) {
    throw new Error(
      'Invalid hoarfrostCeilingThicknessCm: must be a finite number between 0 and 120 cm.'
    );
  }

  // Ice friction coefficient drops sharply when caveAirTempC approaches >= -1 C ("warm wet ice") and as meltwaterFilmMm increases
  const warmPenalty =
    caveAirTempC >= -1
      ? 0.09 + Math.max(0, caveAirTempC + 1) * 0.008
      : Math.max(0, (caveAirTempC + 10) / 9) * 0.06;
  const filmPenalty = (meltwaterFilmMm / 25) * 0.09;
  const iceFrictionCoefficient = roundTo(
    clamp(0.24 - warmPenalty - filmPenalty, 0.02, 0.25),
    3
  );

  // Crampon shear safety factor decreases with floorIceSlopeDeg, meltwaterFilmMm, and warm caveAirTempC
  const rawShearFoS =
    2.4 -
    (floorIceSlopeDeg / 60) * 1.55 -
    (meltwaterFilmMm / 25) * 0.55 -
    (caveAirTempC > -2 ? ((caveAirTempC + 2) / 12) * 0.45 : 0);
  const cramponShearSafetyFactor = roundTo(clamp(rawShearFoS, 0.35, 2.5), 2);

  // Hoarfrost ceiling detachment risk (0 to 100%) increases with caveAirTempC > -1.5, hoarfrostCeilingThicknessCm, and meltwaterFilmMm
  const tempDetachmentBoost =
    caveAirTempC > -1.5
      ? 22 + ((caveAirTempC + 1.5) / 11.5) * 28
      : Math.max(0, ((caveAirTempC + 20) / 18.5) * 10);
  const rawDetachmentRisk =
    (hoarfrostCeilingThicknessCm / 120) * 48 +
    (meltwaterFilmMm / 25) * 22 +
    tempDetachmentBoost;
  const hoarfrostDetachmentRiskPct = roundTo(
    clamp(rawDetachmentRisk, 0, 100),
    1
  );

  // Normalized hypoxic CO2 index (co2Ppm / 5000.0, rounded to 2 decimals)
  const hypoxicCo2Index = roundTo(co2Ppm / 5000.0, 2);

  let riskLevel: GlaciereCavingAnalysis['riskLevel'];
  if (
    co2Ppm >= 15000 ||
    cramponShearSafetyFactor < 0.95 ||
    hoarfrostDetachmentRiskPct >= 75 ||
    floorIceSlopeDeg >= 45
  ) {
    riskLevel = 'critical';
  } else if (
    co2Ppm >= 5000 ||
    cramponShearSafetyFactor < 1.25 ||
    hoarfrostDetachmentRiskPct >= 50 ||
    floorIceSlopeDeg >= 32
  ) {
    riskLevel = 'high';
  } else if (
    co2Ppm >= 2000 ||
    cramponShearSafetyFactor < 1.6 ||
    hoarfrostDetachmentRiskPct >= 25 ||
    floorIceSlopeDeg >= 18
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  const tractionClassMap: Record<
    GlaciereCavingAnalysis['riskLevel'],
    GlaciereCavingAnalysis['tractionClass']
  > = {
    critical: 'abort-glaze-co2-collapse-hazard',
    high: 'front-point-dual-tools-ice-screws',
    moderate: 'steel-12pt-crampons-ice-axe',
    low: 'microspikes-10pt',
  };

  const tractionClass = tractionClassMap[riskLevel];

  const warnings: string[] = [];
  if (co2Ppm >= 15000) {
    warnings.push(
      `CRITICAL HYPERCAPNIC CO2 SUMP (${co2Ppm} ppm, Index ${hypoxicCo2Index}): Immediate respiratory acidosis and incapacitation hazard in descending cold-trap pockets.`
    );
  } else if (co2Ppm >= 5000) {
    warnings.push(
      `HIGH CO2 POCKET CONCENTRATION (${co2Ppm} ppm, Index ${hypoxicCo2Index}): Exceeds occupational 8-hr PEL; hyperventilation and cognitive dulling likely in low floor trenches.`
    );
  } else if (co2Ppm >= 2000) {
    warnings.push(
      `Elevated cold-trap CO2 pooling (${co2Ppm} ppm, Index ${hypoxicCo2Index}): Monitor NDIR gas sensor continuously before descending rimaye pits.`
    );
  }

  if (cramponShearSafetyFactor < 0.95 || floorIceSlopeDeg >= 45) {
    warnings.push(
      `CRITICAL WET-GLAZE SHEAR FAILURE (FoS ${cramponShearSafetyFactor} on ${floorIceSlopeDeg}° ice): Hydrodynamic meltwater film (${meltwaterFilmMm} mm) reduces ice friction to ${iceFrictionCoefficient}.`
    );
  } else if (cramponShearSafetyFactor < 1.25 || floorIceSlopeDeg >= 32) {
    warnings.push(
      `High front-point shear load (FoS ${cramponShearSafetyFactor} at ${floorIceSlopeDeg}°): Unbelayed slip on congelation ice risks terminal impact into basalt breakdown.`
    );
  } else if (cramponShearSafetyFactor < 1.6 || floorIceSlopeDeg >= 18) {
    warnings.push(
      `Moderate congelation-ice ramp gradient (${floorIceSlopeDeg}°, FoS ${cramponShearSafetyFactor}): Microspikes insufficient against rotational shear.`
    );
  }

  if (hoarfrostDetachmentRiskPct >= 75) {
    warnings.push(
      `IMMINENT CEILING HOARFROST & ICICLE COLLAPSE (${hoarfrostDetachmentRiskPct}% risk): Warm cave air (${caveAirTempC}°C) destabilizes ${hoarfrostCeilingThicknessCm} cm sublimation crystal canopies.`
    );
  } else if (hoarfrostDetachmentRiskPct >= 50) {
    warnings.push(
      `High overhead hoarfrost shedding risk (${hoarfrostDetachmentRiskPct}%): Avoid lingering beneath ${hoarfrostCeilingThicknessCm} cm ceiling ice prisms and minimize thermal plume dwell time.`
    );
  } else if (hoarfrostDetachmentRiskPct >= 25) {
    warnings.push(
      `Moderate ceiling hoarfrost instability (${hoarfrostDetachmentRiskPct}%): Maintain helmet chin-strap tension and scan portal vaults for wet icicle fractures.`
    );
  }

  const recommendations: string[] = [
    `Deploy ${tractionClass} traction and anchoring protocol before stepping onto subterranean congelation ice.`,
    `Maintain continuous NDIR CO2 gas monitoring at ankle-to-waist height when entering Balch-effect cold traps (current CO2 index: ${hypoxicCo2Index}).`,
    'Use hardened chromoly steel crampons with active anti-balling plates; inspect front points after crossing vesicular basalt breakdown.',
    'Do not linger directly beneath thick ceiling hoarfrost canopies or portal icicle curtains where caver body heat accelerates basal detachment.',
    `Place 13–17 cm tubular ice screws or Abalakov V-threads in clear blue congelation ice when floor slope exceeds 25° (current shear FoS: ${cramponShearSafetyFactor}).`,
  ];

  return {
    iceFrictionCoefficient,
    cramponShearSafetyFactor,
    hoarfrostDetachmentRiskPct,
    hypoxicCo2Index,
    riskLevel,
    tractionClass,
    warnings,
    recommendations,
  };
}

export function getGlaciereGearChecklist(): GlaciereGearItem[] {
  return [...GLACIERE_GEAR_CHECKLIST];
}
