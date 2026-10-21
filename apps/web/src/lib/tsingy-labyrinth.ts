export type TsingyMorphology =
  | 'rillenkarren-razor-spires'
  | 'diaclase-slot-corridor-maze'
  | 'canopy-suspension-bridge-arête'
  | 'stone-forest-shilin-pinnacles';

export interface TsingyLabyrinthSite {
  id: string;
  name: string;
  karstMassif: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: TsingyMorphology;
  spireHeightMeters: number;
  bladeEdgeRadiusMm: number;
  rockSurfaceTempC: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  scramblingProtocol: string;
  description: string;
}

export interface TsingyLabyrinthInput {
  bladeEdgeRadiusMm: number;
  spireHeightM: number;
  rockSurfaceTempC: number;
  diaclaseGapWidthM: number;
  ambientHumidityPct: number;
}

export interface TsingyLabyrinthAnalysis {
  lacerationShearIndex: number;
  cordCutThroughRiskPct: number;
  radiantSweatLossLitresHr: number;
  arêteExposureFactor: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  scramblingClass:
    | 'kevlar-gloves-approach-boots'
    | 'via-ferrata-energy-absorber-lanyards'
    | 'twin-steel-core-tethers-edge-protectors'
    | 'abort-razor-karst-hyperthermia-hazard';
  warnings: string[];
  recommendations: string[];
}

export interface TsingyGearItem {
  id: string;
  name: string;
  category:
    | 'cut-resistant-armor'
    | 'lanyard-rigging'
    | 'thermal-hydration'
    | 'diaclase-navigation';
  essential: boolean;
  rationale: string;
}

export const TSINGY_LABYRINTH_SITES: TsingyLabyrinthSite[] = [
  {
    id: 'bemaraha-grand-tsingy-madagascar',
    name: 'Tsingy de Bemaraha Grand Tsingy & Andamozavaky Razor Labyrinth',
    karstMassif: 'Bemaraha Jurassic Limestone Plateau',
    country: 'Madagascar',
    region: 'Melaky Region, Western Madagascar',
    latitude: -18.667,
    longitude: 44.783,
    elevationMeters: 410,
    morphology: 'rillenkarren-razor-spires',
    spireHeightMeters: 85,
    bladeEdgeRadiusMm: 0.5,
    rockSurfaceTempC: 52,
    difficulty: 'extreme',
    bestSeason: 'May – October (Austral Dry Season Post-Monsoon)',
    hazards: [
      'Sub-millimeter (0.5 mm) dissolution-honed rillenkarren limestone flutes capable of shearing standard nylon webbing and bare skin on contact',
      'Solar-baked dark grey Jurassic limestone crests reaching 50–55 °C above 80-meter vertical diaclase chasms',
      'Blind three-dimensional subterranean fracture mazes transitioning abruptly into exposed canopy arêtes',
    ],
    scramblingProtocol:
      'twin-steel-core-tethers-edge-protectors with ANSI A5 Kevlar palm gloves and pre-dawn crest ascents before 10:30 local solar peak.',
    description:
      'UNESCO-listed Middle Jurassic limestone plateau carved by monsoon acid dissolution into a 85-meter-tall cathedral of razor-edged rillenkarren spires and deep diaclase slot corridors.',
  },
  {
    id: 'ankarana-tsingy-canyon-madagascar',
    name: "Massif de l'Ankarana Tsingy Rary & Sunken Diaclase Forest",
    karstMassif: 'Ankarana Middle Jurassic Karst Horst',
    country: 'Madagascar',
    region: 'Diana Region, Northern Madagascar',
    latitude: -12.917,
    longitude: 49.117,
    elevationMeters: 285,
    morphology: 'diaclase-slot-corridor-maze',
    spireHeightMeters: 55,
    bladeEdgeRadiusMm: 1.2,
    rockSurfaceTempC: 48,
    difficulty: 'challenging',
    bestSeason: 'May – November (Northern Dry Trade-Wind Window)',
    hazards: [
      'Fractured basalt-capped and crystalline limestone Tsingy Rary turrets split by 60 m deep sunken forest canyons',
      'Sharp acoustic-ringing limestone plates ("tsingy" = where one cannot walk barefoot) flanking narrow suspension bridges',
      'Rapid dehydration transitioning from humid 85% RH sunken canyon floors to 48 °C exposed pinnacle roofs',
    ],
    scramblingProtocol:
      'via-ferrata-energy-absorber-lanyards clipped continuously to steel cable traverses with cut-resistant shin and forearm protection.',
    description:
      'Fault-bounded karst massif in northern Madagascar where razor-sharp Tsingy Rary pinnacle fields overhang 120 kilometers of subterranean river caves and sunken deciduous canyon forests.',
  },
  {
    id: 'mulu-api-pinnacles-borneo-malaysia',
    name: 'Gunung Api & Gunung Mulu Razor-Limestone Pinnacles',
    karstMassif: 'Melinau Limestone Formation',
    country: 'Malaysia',
    region: 'Gunung Mulu National Park, Sarawak',
    latitude: 4.106,
    longitude: 114.898,
    elevationMeters: 1200,
    morphology: 'canopy-suspension-bridge-arête',
    spireHeightMeters: 45,
    bladeEdgeRadiusMm: 0.9,
    rockSurfaceTempC: 44,
    difficulty: 'extreme',
    bestSeason: 'March – September (Less Frequent Equatorial Afternoon Deluges)',
    hazards: [
      '45-meter-tall white-and-grey Melinau limestone blades emerging out of steep montane dipterocarp moss forest at 1,200 m elevation',
      'Slick biofilm, bryophyte cushions, and equatorial torrential rain turning near-vertical karst arêtes and alloy ladders treacherous',
      'High-humidity (90%+) thermal strain combined with unforgiving knife-edge limestone fins beneath fixed rope sections',
    ],
    scramblingProtocol:
      'twin-steel-core-tethers-edge-protectors over fixed lines and ladder rungs; mandatory turnaround if afternoon convective thunderheads build.',
    description:
      'Equatorial Borneo pinnacle karst where 45-meter-tall razor-sharp Melinau limestone spires pierce the upper montane rainforest canopy above the world’s largest cave chambers.',
  },
  {
    id: 'shilin-naigu-stone-forest-china',
    name: 'Shilin & Naigu Permian Dolomitic Pinnacle Labyrinth',
    karstMassif: 'Lunan Permian Carbonate Platform',
    country: 'China',
    region: 'Kunming Karst Plateau, Yunnan',
    latitude: 24.817,
    longitude: 103.324,
    elevationMeters: 1750,
    morphology: 'stone-forest-shilin-pinnacles',
    spireHeightMeters: 35,
    bladeEdgeRadiusMm: 3.4,
    rockSurfaceTempC: 36,
    difficulty: 'moderate',
    bestSeason: 'March – May & September – November (Dry Subtropical Plateau Windows)',
    hazards: [
      'Labyrinthine networks of 30–35 m Permian dolomitic and bioclastic limestone pillars with overhanging solution notches',
      'GNSS multipath signal reflection and dead-end fracture corridors across the dark Naigu dolomitic stone forest',
      'Sharp vertical solution grooves (karren) and wedged chockstones along off-trail chimney scrambles',
    ],
    scramblingProtocol:
      'kevlar-gloves-approach-boots with sticky butyl-rubber climbing rand and breadcrumb track-logging through Naigu fracture corridors.',
    description:
      '270-million-year-old Permian paleo-tsingy stone forest on the Yunnan-Guizhou Plateau featuring towering sword-shaped limestone pillars, solution arches, and multi-tiered subterranean fissures.',
  },
];

export const TSINGY_GEAR_CHECKLIST: TsingyGearItem[] = [
  {
    id: 'ansi-a5-kevlar-scrambling-gloves-sleeves',
    name: 'ANSI Cut-Level A5 Kevlar-Palm Scrambling Gloves & Forearm Sleeves',
    category: 'cut-resistant-armor',
    essential: true,
    rationale:
      'Prevents deep tendon and palmar artery lacerations when gripping sub-millimeter rillenkarren dissolution flutes and razor-sharp limestone fins.',
  },
  {
    id: 'en958-via-ferrata-steel-core-lanyard',
    name: 'EN 958 Energy-Absorbing Via-Ferrata Lanyard with Steel-Core Tethers & Canvas Edge Rollers',
    category: 'lanyard-rigging',
    essential: true,
    rationale:
      'Resists catastrophic webbing cut-through over sharp limestone edges during factor-1+ arête slips and suspension bridge transitions.',
  },
  {
    id: 'approach-boots-vibram-megagrip-rand',
    name: 'High-Rand Vibram Megagrip Approach Boots & Cordura Shin Gaiters',
    category: 'cut-resistant-armor',
    essential: true,
    rationale:
      'Protects ankle malleoli and shins from jagged solution pockets while maximizing friction on polished vertical limestone stems.',
  },
  {
    id: 'insulated-electrolyte-bladder-upf50-hoodie',
    name: '3.5L Insulated Electrolyte Bladder & Reflective UPF 50+ Solar-Crest Hoodie',
    category: 'thermal-hydration',
    essential: true,
    rationale:
      'Offsets 1.5–2.8 L/hr sweat rates caused by 50+ °C longwave infrared radiation off dark solar-baked tsingy pinnacles.',
  },
  {
    id: 'dual-band-gnss-diaclase-headlamp-crumb-beacon',
    name: 'Dual-Band Multi-GNSS Receiver, 600-Lumen Caving Headlamp & Diaclase Breadcrumb Marker Tags',
    category: 'diaclase-navigation',
    essential: true,
    rationale:
      'Maintains orientation when transitioning between twilight subterranean diaclase slot mazes and sky-exposed pinnacle crests.',
  },
  {
    id: 'dyneema-aramid-sheath-bailout-cord-trauma-kit',
    name: 'Aramid-Sheathed 8mm Bailout Cord, Ballistic Edge Pad & Hemostatic Laceration Kit',
    category: 'lanyard-rigging',
    essential: false,
    rationale:
      'Provides abrasion-shielded emergency lower capability and immediate hemorrhage control in remote pinnacle karst sectors.',
  },
];

export function filterTsingySites(
  sites: TsingyLabyrinthSite[] = TSINGY_LABYRINTH_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): TsingyLabyrinthSite[] {
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
        site.karstMassif,
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

export function calculateTsingyLabyrinth(
  input: TsingyLabyrinthInput
): TsingyLabyrinthAnalysis {
  const {
    bladeEdgeRadiusMm,
    spireHeightM,
    rockSurfaceTempC,
    diaclaseGapWidthM,
    ambientHumidityPct,
  } = input;

  if (
    !Number.isFinite(bladeEdgeRadiusMm) ||
    bladeEdgeRadiusMm < 0.2 ||
    bladeEdgeRadiusMm > 15.0
  ) {
    throw new Error(
      'Invalid bladeEdgeRadiusMm: must be a finite number between 0.2 and 15.0 mm.'
    );
  }

  if (
    !Number.isFinite(spireHeightM) ||
    spireHeightM < 5 ||
    spireHeightM > 120
  ) {
    throw new Error(
      'Invalid spireHeightM: must be a finite number between 5 and 120 meters.'
    );
  }

  if (
    !Number.isFinite(rockSurfaceTempC) ||
    rockSurfaceTempC < 18 ||
    rockSurfaceTempC > 68
  ) {
    throw new Error(
      'Invalid rockSurfaceTempC: must be a finite number between 18 and 68 °C.'
    );
  }

  if (
    !Number.isFinite(diaclaseGapWidthM) ||
    diaclaseGapWidthM < 0.3 ||
    diaclaseGapWidthM > 8.0
  ) {
    throw new Error(
      'Invalid diaclaseGapWidthM: must be a finite number between 0.3 and 8.0 meters.'
    );
  }

  if (
    !Number.isFinite(ambientHumidityPct) ||
    ambientHumidityPct < 20 ||
    ambientHumidityPct > 100
  ) {
    throw new Error(
      'Invalid ambientHumidityPct: must be a finite number between 20 and 100%.'
    );
  }

  // 1. lacerationShearIndex (1.0 to 10.0)
  const sharpnessNormalized = (15.0 - bladeEdgeRadiusMm) / (15.0 - 0.2);
  const rawShear =
    1.0 +
    Math.pow(sharpnessNormalized, 1.35) * 6.2 +
    ((spireHeightM - 5) / 115) * 2.0 +
    ((diaclaseGapWidthM - 0.3) / 7.7) * 0.8;
  const lacerationShearIndex = roundTo(clamp(rawShear, 1.0, 10.0), 2);

  // 2. cordCutThroughRiskPct (0 to 100%)
  const rawCutRisk =
    38 / Math.pow(bladeEdgeRadiusMm, 0.65) +
    ((spireHeightM - 5) / 115) * 32 -
    4;
  const cordCutThroughRiskPct = roundTo(clamp(rawCutRisk, 0, 100), 1);

  // 3. radiantSweatLossLitresHr (0.4 to 3.2 L/hr)
  const rawSweat =
    0.4 +
    ((rockSurfaceTempC - 18) / 50) * 1.9 +
    ((ambientHumidityPct - 20) / 80) * 0.9;
  const radiantSweatLossLitresHr = roundTo(clamp(rawSweat, 0.4, 3.2), 2);

  // 4. arêteExposureFactor (1.0 to 10.0)
  const rawExposure =
    1.0 +
    ((spireHeightM - 5) / 115) * 5.2 +
    ((diaclaseGapWidthM - 0.3) / 7.7) * 3.8;
  const arêteExposureFactor = roundTo(clamp(rawExposure, 1.0, 10.0), 2);

  // 5. riskLevel
  let riskLevel: TsingyLabyrinthAnalysis['riskLevel'];
  if (
    bladeEdgeRadiusMm <= 0.8 ||
    cordCutThroughRiskPct >= 75 ||
    rockSurfaceTempC >= 54 ||
    radiantSweatLossLitresHr >= 2.3
  ) {
    riskLevel = 'critical';
  } else if (
    bladeEdgeRadiusMm <= 1.8 ||
    cordCutThroughRiskPct >= 50 ||
    rockSurfaceTempC >= 46 ||
    radiantSweatLossLitresHr >= 1.7
  ) {
    riskLevel = 'high';
  } else if (
    bladeEdgeRadiusMm <= 4.0 ||
    cordCutThroughRiskPct >= 28 ||
    rockSurfaceTempC >= 38 ||
    radiantSweatLossLitresHr >= 1.1
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. scramblingClass
  const classMap: Record<
    TsingyLabyrinthAnalysis['riskLevel'],
    TsingyLabyrinthAnalysis['scramblingClass']
  > = {
    critical: 'abort-razor-karst-hyperthermia-hazard',
    high: 'twin-steel-core-tethers-edge-protectors',
    moderate: 'via-ferrata-energy-absorber-lanyards',
    low: 'kevlar-gloves-approach-boots',
  };

  const scramblingClass = classMap[riskLevel];

  const warnings: string[] = [];
  if (bladeEdgeRadiusMm <= 0.8 || cordCutThroughRiskPct >= 75) {
    warnings.push(
      `CRITICAL RILLENKARREN RAZOR-BLADE SHEAR HAZARD (${bladeEdgeRadiusMm} mm edge radius, ${cordCutThroughRiskPct}% cord cut-through probability): Standard nylon/dyneema slings will sever under fall load.`
    );
  } else if (bladeEdgeRadiusMm <= 1.8 || cordCutThroughRiskPct >= 50) {
    warnings.push(
      `HIGH LIMESTONE EDGE-SHEAR & LACERATION RISK (${bladeEdgeRadiusMm} mm blade radius, ${cordCutThroughRiskPct}% cut risk, shear index ${lacerationShearIndex}/10): Unprotected webbing and bare hands face severe laceration.`
    );
  } else if (bladeEdgeRadiusMm <= 4.0 || cordCutThroughRiskPct >= 28) {
    warnings.push(
      `Moderate dissolution-flute edge abrasion (${bladeEdgeRadiusMm} mm radius, ${cordCutThroughRiskPct}% cord cut risk): Inspect lanyard sheathing at every clip point.`
    );
  }

  if (rockSurfaceTempC >= 54 || radiantSweatLossLitresHr >= 2.3) {
    warnings.push(
      `CRITICAL PINNACLE-CREST SOLAR BAKE & HYPERTHERMIA (${rockSurfaceTempC} °C rock surface, ${radiantSweatLossLitresHr} L/hr sweat loss at ${ambientHumidityPct}% RH): Contact burns on bare skin and rapid heat exhaustion.`
    );
  } else if (rockSurfaceTempC >= 46 || radiantSweatLossLitresHr >= 1.7) {
    warnings.push(
      `High karst radiant thermal load (${rockSurfaceTempC} °C limestone surface, ${radiantSweatLossLitresHr} L/hr sweat rate): Limit exposed crest time and descend into shaded diaclase corridors.`
    );
  } else if (rockSurfaceTempC >= 38 || radiantSweatLossLitresHr >= 1.1) {
    warnings.push(
      `Elevated solar-limestone radiant heat (${rockSurfaceTempC} °C rock temp, ${radiantSweatLossLitresHr} L/hr sweat loss): Increase electrolyte intake on upper pinnacle traverses.`
    );
  }

  const recommendations: string[] = [
    `Deploy ${scramblingClass} protocol immediately (laceration shear index: ${lacerationShearIndex}/10, cord cut risk: ${cordCutThroughRiskPct}%, arête exposure: ${arêteExposureFactor}/10).`,
    bladeEdgeRadiusMm <= 1.8
      ? `Wear ANSI Cut-Level A5 Kevlar-palm gloves and rig twin steel-core via-ferrata tethers or ballistic canvas edge protectors over ${bladeEdgeRadiusMm} mm rillenkarren blades.`
      : `Maintain three points of contact with high-rand approach boots and cut-resistant gloves across ${spireHeightM} m spires.`,
    rockSurfaceTempC >= 42
      ? `Restrict exposed pinnacle-crest scrambling to pre-10:00 AM hours and retreat into shaded diaclase slot canyons (${radiantSweatLossLitresHr} L/hr hydration budget).`
      : `Carry ${roundTo(radiantSweatLossLitresHr * 3, 1)} L of electrolyte fluid for a 3-hour labyrinth circuit and log GNSS waypoints before descending into narrow diaclase fissures.`,
  ];

  return {
    lacerationShearIndex,
    cordCutThroughRiskPct,
    radiantSweatLossLitresHr,
    arêteExposureFactor,
    riskLevel,
    scramblingClass,
    warnings,
    recommendations,
  };
}

export function getTsingyGearChecklist(): TsingyGearItem[] {
  return [...TSINGY_GEAR_CHECKLIST];
}
