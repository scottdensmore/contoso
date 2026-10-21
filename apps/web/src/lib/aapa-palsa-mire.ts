export type MireMorphologyType =
  | 'concentric-strang-flark-aapa'
  | 'ice-cored-palsa-dome-plateau'
  | 'thermokarst-lagg-moat-collapse'
  | 'minerotrophic-sedge-carpet-fen';

export interface AapaPalsaMireSite {
  id: string;
  name: string;
  borealSubarcticZone: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: MireMorphologyType;
  strangRidgeWidthM: number;
  flarkPoolDepthM: number;
  palsaMoundHeightM: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  crossingProtocol: string;
  description: string;
}

export interface AapaPalsaMireInput {
  strangWidthM: number;
  flarkTroughSpanM: number;
  activeThawDepthCm: number;
  palsaRimFissureScore: number;
  hikerPackWeightKg: number;
}

export interface AapaPalsaMireAnalysis {
  strangShearBreakthroughRiskPct: number;
  palsaLaggMoatEntrapmentPct: number;
  flarkDetourDistanceMultiplier: number;
  blackflyMosquitoSwarmStressIndex: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  crossingStrategy:
    | 'thread-continuous-betula-strang-crests'
    | 'probe-sedge-mat-distribute-load'
    | 'wide-berth-palsa-lagg-moat-detour'
    | 'abort-quaking-flark-basin-route-esker';
  warnings: string[];
  recommendations: string[];
}

export interface AapaPalsaGearItem {
  id: string;
  name: string;
  category:
    | 'mire-flotation-probing'
    | 'permafrost-lagg-safety'
    | 'subarctic-insect-defense'
    | 'hypothermia-dry-system';
  essential: boolean;
  rationale: string;
}

export const AAPA_PALSA_MIRE_SITES: AapaPalsaMireSite[] = [
  {
    id: 'voda-viiankiaapa-sodankyla-lapland-finland',
    name: 'Viiankiaapa & Sodankylä Concentric String-Bog (Aapasuo) Labyrinth',
    borealSubarcticZone: 'Central Lapland Mire Reserve',
    country: 'Finland',
    region: 'Sodankylä',
    latitude: 67.535,
    longitude: 26.862,
    elevationMeters: 205,
    morphology: 'concentric-strang-flark-aapa',
    strangRidgeWidthM: 1.4,
    flarkPoolDepthM: 2.6,
    palsaMoundHeightM: 0.8,
    difficulty: 'challenging',
    bestSeason: 'Late August – October (Post-Frost Crust & Post-Insect Window)',
    hazards: [
      'Perpendicular concentric peat ridges (jänne/sträng) narrowing below 0.8 m between bottomless open-water mud troughs (rimpi/flark) that shear under heavy pack load',
      'Deceptive bright-green Warnstorfia and Sphagnum floating carpets concealing 2.5+ m deep anaerobic sapropel silt traps',
      'Dense mid-summer Räkkä swarms of blackflies (Simuliidae), mosquitoes (Culicidae), and deer flies causing acute cognitive disorientation during sinuous sträng detours',
    ],
    crossingProtocol:
      'thread-continuous-betula-strang-crests reading aerial/satellite sträng continuity perpendicular to the hydraulic gradient, probing ahead with a 240 cm graduated mire staff, and routing long transitions along pine-clad glacial eskers (harju).',
    description:
      'Classic 66 km² northern boreal aapa mire in Finnish Lapland where spring snowmelt floods minerotrophic sedge fens and frost-thrusting aligns dwarf-birch peat strings across vast open-water flark pools.',
  },
  {
    id: 'tavvavuoma-kummavuopio-palsa-norrbotten-sweden',
    name: 'Tavvavuoma & Vissátvuopmi Giant Palsa-Mound Plateau',
    borealSubarcticZone: 'Vindelfjällen / Kiruna Subarctic Permafrost Zone',
    country: 'Sweden',
    region: 'Norrbotten',
    latitude: 68.472,
    longitude: 20.895,
    elevationMeters: 550,
    morphology: 'ice-cored-palsa-dome-plateau',
    strangRidgeWidthM: 1.8,
    flarkPoolDepthM: 3.1,
    palsaMoundHeightM: 6.5,
    difficulty: 'extreme',
    bestSeason: 'September – Early October (Autumn Active-Layer Refreeze)',
    hazards: [
      'Block erosion and sudden cantilevered collapse of 5–7 m high ice-cored peat domes (palsas) along deeply fissured wind-scoured rims',
      'Deep, vertical-walled peripheral thermokarst moats (lagg) filled with 1–2°C black peat-slurry water surrounding thawing palsa plateaus',
      'Labyrinthine thermokarst thaw ponds and drowned sedge mats with zero solid mineral substrate within pole-probing reach',
    ],
    crossingProtocol:
      'wide-berth-palsa-lagg-moat-detour staying at least 4 m outside fissured dark-peat palsa cliffs, never climbing overhanging block-erosion rims, and linking stable mineral moraine islands across the subarctic plateau.',
    description:
      'Sweden’s largest discontinuous-permafrost palsa mire complex north of Kiruna, featuring monumental 6+ meter ice-cored peat domes, block-collapsing thermokarst ramparts, and wind-swept tundra pools.',
  },
  {
    id: 'hudson-bay-lowlands-sutton-ridges-ontario-canada',
    name: 'Hudson Bay Lowlands & Polar Bear Provincial Park String-Fen & Palsa Complex',
    borealSubarcticZone: 'James Bay / Hudson Bay Peatland Basin',
    country: 'Canada',
    region: 'Northern Ontario',
    latitude: 54.482,
    longitude: -84.615,
    elevationMeters: 65,
    morphology: 'thermokarst-lagg-moat-collapse',
    strangRidgeWidthM: 1.1,
    flarkPoolDepthM: 3.4,
    palsaMoundHeightM: 4.2,
    difficulty: 'extreme',
    bestSeason: 'September (Late Summer Drawdown Before Coastal Blizzard Freeze-Up)',
    hazards: [
      'Multi-kilometer parallel ladder-fen flark troughs requiring 3.5–4.5x detour multipliers when continuous tamarack/dwarf-birch sträng bridges pinch out',
      'Active thermokarst slumping of degrading palsa fields into coalescing anoxic peat-slurry moats across virtually zero-relief marine-clay lowlands',
      'Hypothermic immersion in 2–4°C subarctic groundwater fens compounded by relentless blackfly/no-see-um clouds and remote polar-bear coastal proximity',
    ],
    crossingProtocol:
      'abort-quaking-flark-basin-route-esker abandoning discontinuous central ladder-fen troughs in favor of raised post-glacial marine beach ridges and Precambrian Sutton carbonate outcrops.',
    description:
      'Part of the second-largest contiguous peatland complex on Earth, where isostatic marine emergence, discontinuous permafrost palsas, and endless parallel string-fens span the subarctic Hudson Bay basin.',
  },
  {
    id: 'pasvik-iettiselga-injarvi-palsa-finnmark-norway',
    name: 'Øvre Pasvik & Neiden-Munkefjord Palsa-Aapa Mire Corridor',
    borealSubarcticZone: 'Sør-Varanger / Finnmark Permafrost Mire Belt',
    country: 'Norway',
    region: 'Troms og Finnmark',
    latitude: 69.145,
    longitude: 29.028,
    elevationMeters: 115,
    morphology: 'minerotrophic-sedge-carpet-fen',
    strangRidgeWidthM: 2.3,
    flarkPoolDepthM: 2.1,
    palsaMoundHeightM: 3.6,
    difficulty: 'moderate',
    bestSeason: 'August – October (Dry Late-Summer Boreal Window)',
    hazards: [
      'Quaking Carex rotundata and Eriophorum sedge mats that flex 30–50 cm into cold groundwater when hikers walk bunched together',
      'Submerged thermokarst marginal ring-moats around decaying Finnmark palsa mounds hidden beneath overhanging Rubus chamaemorus (cloudberry) peat shelves',
      'Rapid onset of conductive lower-body hypothermia during repeated knee-deep peat-water breakthroughs in subarctic maritime drizzle',
    ],
    crossingProtocol:
      'probe-sedge-mat-distribute-load maintaining 8 m spacing between hikers on flexing Carex rhizome mats, stepping directly on Betula nana root crowns along sträng crests, and bypassing dark open-water rimpi windows.',
    description:
      'Continental subarctic mire mosaic along the Norwegian-Finnish-Russian border zone combining minerotrophic sedge-carpet aapa fens, residual permafrost palsa domes, and old-growth pine esker corridors.',
  },
];

export const AAPA_PALSA_MIRE_GEAR_CHECKLIST: AapaPalsaGearItem[] = [
  {
    id: 'graduated-peat-probe-staff-wide-basket-poles',
    name: '240cm Graduated Peat-Depth Probe Staff & Wide-Basket Mire Trekking Poles',
    category: 'mire-flotation-probing',
    essential: true,
    rationale:
      'Essential for testing sedge-rhizome mat tensile integrity and sounding bottomless (>2 m) flark sapropel troughs before committing full body and pack weight.',
  },
  {
    id: 'floating-dyneema-mire-rescue-throw-bag',
    name: '20m Floating Dyneema Mire-Rescue Throw Bag & Chest-Harness Tow Tether',
    category: 'permafrost-lagg-safety',
    essential: true,
    rationale:
      'Allows rapid horizontal extraction from vertical-walled palsa thermokarst lagg moats and quaking rimpi breakthroughs where swimmers cannot gain solid purchase.',
  },
  {
    id: 'fine-mesh-simuliidae-headnet-sealed-cuff-anorak',
    name: 'Ultra-Fine 1000-Mesh Simuliidae Headnet & Elastic-Cuff Bug-Proof Anorak',
    category: 'subarctic-insect-defense',
    essential: true,
    rationale:
      'Prevents respiratory inhalation and ocular bites from dense boreal blackfly (Simuliidae) and mosquito swarms without relying solely on skin repellents that sweat off.',
  },
  {
    id: 'nordic-bog-skis-suonide-load-frames',
    name: 'Detachable Boreal Bog-Snowshoes (Suokengät) or Wide-Flotation Mire Frames',
    category: 'mire-flotation-probing',
    essential: false,
    rationale:
      'Reduces ground contact pressure by >65% when crossing wide minerotrophic Carex carpets where narrow Betula nana sträng ridges become discontinuous.',
  },
  {
    id: 'submersible-drysuit-socks-neoprene-thigh-waders',
    name: 'Vapor-Permeable Dry-Bibs or Neoprene-Lined Boreal Mire Wading Boots',
    category: 'hypothermia-dry-system',
    essential: true,
    rationale:
      'Protects lower extremities from conductive heat loss in 1–4°C permafrost-fed lagg moats and acidic sphagnum groundwater during multi-hour mire traverses.',
  },
  {
    id: 'offline-orthophoto-gnss-strang-mapper',
    name: 'High-Resolution Sentinel-2 / Aerial Orthophoto GNSS Receiver',
    category: 'permafrost-lagg-safety',
    essential: true,
    rationale:
      'Topographic maps rarely resolve individual 1–2m sträng bridges; sub-meter orthophotos reveal continuous ridge corridors and dead-end flark pools before entry.',
  },
];

export function filterAapaPalsaMireSites(
  sites: AapaPalsaMireSite[] = AAPA_PALSA_MIRE_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): AapaPalsaMireSite[] {
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
        site.borealSubarcticZone,
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

export function calculateAapaPalsaMire(
  input: AapaPalsaMireInput
): AapaPalsaMireAnalysis {
  const {
    strangWidthM,
    flarkTroughSpanM,
    activeThawDepthCm,
    palsaRimFissureScore,
    hikerPackWeightKg,
  } = input;

  if (
    !Number.isFinite(strangWidthM) ||
    strangWidthM < 0.3 ||
    strangWidthM > 6.0
  ) {
    throw new Error(
      'Invalid strangWidthM: must be a finite number between 0.3 and 6.0 meters.'
    );
  }

  if (
    !Number.isFinite(flarkTroughSpanM) ||
    flarkTroughSpanM < 1.0 ||
    flarkTroughSpanM > 65.0
  ) {
    throw new Error(
      'Invalid flarkTroughSpanM: must be a finite number between 1.0 and 65.0 meters.'
    );
  }

  if (
    !Number.isFinite(activeThawDepthCm) ||
    activeThawDepthCm < 15 ||
    activeThawDepthCm > 140
  ) {
    throw new Error(
      'Invalid activeThawDepthCm: must be a finite number between 15 and 140 cm.'
    );
  }

  if (
    !Number.isFinite(palsaRimFissureScore) ||
    palsaRimFissureScore < 0 ||
    palsaRimFissureScore > 100
  ) {
    throw new Error(
      'Invalid palsaRimFissureScore: must be a finite number between 0 and 100.'
    );
  }

  if (
    !Number.isFinite(hikerPackWeightKg) ||
    hikerPackWeightKg < 5 ||
    hikerPackWeightKg > 55
  ) {
    throw new Error(
      'Invalid hikerPackWeightKg: must be a finite number between 5 and 55 kg.'
    );
  }

  const strangInv = (6.0 - strangWidthM) / 5.7;
  const flarkNorm = (flarkTroughSpanM - 1.0) / 64.0;
  const thawNorm = (activeThawDepthCm - 15) / 125.0;
  const fissureNorm = palsaRimFissureScore / 100.0;
  const packNorm = (hikerPackWeightKg - 5) / 50.0;

  // 1. strangShearBreakthroughRiskPct (2 to 99 %)
  const rawStrangShear = 2 + strangInv * 42 + packNorm * 30 + thawNorm * 25;
  const strangShearBreakthroughRiskPct = roundTo(
    clamp(rawStrangShear, 2, 99),
    1
  );

  // 2. palsaLaggMoatEntrapmentPct (3 to 99 %)
  const rawLaggEntrapment = 3 + fissureNorm * 58 + thawNorm * 38;
  const palsaLaggMoatEntrapmentPct = roundTo(
    clamp(rawLaggEntrapment, 3, 99),
    1
  );

  // 3. flarkDetourDistanceMultiplier (1.15 to 4.8x)
  const rawDetour = 1.15 + flarkNorm * 2.45 + strangInv * 1.2;
  const flarkDetourDistanceMultiplier = roundTo(
    clamp(rawDetour, 1.15, 4.8),
    2
  );

  // 4. blackflyMosquitoSwarmStressIndex (5 to 100)
  const rawSwarm = 5 + thawNorm * 52 + flarkNorm * 43;
  const blackflyMosquitoSwarmStressIndex = roundTo(
    clamp(rawSwarm, 5, 100),
    1
  );

  // 5. riskLevel
  let riskLevel: AapaPalsaMireAnalysis['riskLevel'];
  if (
    strangShearBreakthroughRiskPct >= 75 ||
    palsaLaggMoatEntrapmentPct >= 78 ||
    flarkDetourDistanceMultiplier >= 3.6 ||
    blackflyMosquitoSwarmStressIndex >= 85
  ) {
    riskLevel = 'critical';
  } else if (
    strangShearBreakthroughRiskPct >= 52 ||
    palsaLaggMoatEntrapmentPct >= 55 ||
    flarkDetourDistanceMultiplier >= 2.7 ||
    blackflyMosquitoSwarmStressIndex >= 65
  ) {
    riskLevel = 'high';
  } else if (
    strangShearBreakthroughRiskPct >= 28 ||
    palsaLaggMoatEntrapmentPct >= 30 ||
    flarkDetourDistanceMultiplier >= 1.85 ||
    blackflyMosquitoSwarmStressIndex >= 40
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. crossingStrategy
  const strategyMap: Record<
    AapaPalsaMireAnalysis['riskLevel'],
    AapaPalsaMireAnalysis['crossingStrategy']
  > = {
    critical: 'abort-quaking-flark-basin-route-esker',
    high: 'wide-berth-palsa-lagg-moat-detour',
    moderate: 'probe-sedge-mat-distribute-load',
    low: 'thread-continuous-betula-strang-crests',
  };

  const crossingStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (riskLevel === 'critical') {
    warnings.push(
      `CRITICAL STRÄNG PEAT-RIDGE SHEAR, PALSA LAGG-MOAT ENTRAPMENT & QUAKING FLARK LABYRINTH HAZARD (sträng shear = ${strangShearBreakthroughRiskPct}%, palsa lagg moat = ${palsaLaggMoatEntrapmentPct}%, flark detour = ${flarkDetourDistanceMultiplier}x, swarm stress = ${blackflyMosquitoSwarmStressIndex}/100): Imminent breakthrough into bottomless sapropel flarks or collapsing permafrost lagg moats; abort mire basin crossing and route via glacial esker (harju) immediately.`
    );
  } else if (riskLevel === 'high') {
    warnings.push(
      `HIGH PALSA LAGG-MOAT COLLAPSE, NARROW STRÄNG SHEAR & TORTUOUS FLARK DETOUR RISK (sträng shear = ${strangShearBreakthroughRiskPct}%, palsa lagg moat = ${palsaLaggMoatEntrapmentPct}%, flark detour = ${flarkDetourDistanceMultiplier}x, swarm stress = ${blackflyMosquitoSwarmStressIndex}/100): Give decaying ice-cored palsa rims a wide berth and detour around coalescing rimpi troughs.`
    );
  } else if (riskLevel === 'moderate') {
    warnings.push(
      `Moderate sträng ridge compression and seasonal thaw-layer softening (sträng shear = ${strangShearBreakthroughRiskPct}%, palsa lagg moat = ${palsaLaggMoatEntrapmentPct}%, flark detour = ${flarkDetourDistanceMultiplier}x, swarm stress = ${blackflyMosquitoSwarmStressIndex}/100): Probe sedge mats continuously and maintain 8m spacing between hikers.`
    );
  }

  if (palsaRimFissureScore >= 50 || activeThawDepthCm >= 80) {
    warnings.push(
      `THERMOKARST PALSA RIM FISSURING & DEEP ACTIVE-LAYER THAW (fissure score = ${palsaRimFissureScore}/100, active thaw = ${activeThawDepthCm}cm): Overhanging peat blocks along palsa domes can calve suddenly into 1–2°C peripheral lagg moats.`
    );
  }

  const recommendations: string[] = [
    `Execute ${crossingStrategy} protocol immediately (sträng shear risk: ${strangShearBreakthroughRiskPct}%, palsa lagg entrapment: ${palsaLaggMoatEntrapmentPct}%, detour multiplier: ${flarkDetourDistanceMultiplier}x).`,
    strangWidthM <= 2.0 || hikerPackWeightKg >= 25
      ? `Step directly on intertwined Betula nana (dwarf birch) root crowns along the ${strangWidthM}m sträng crest and unbuckle hip-belts before crossing narrow bridges with a ${hikerPackWeightKg}kg pack.`
      : `Follow continuous perpendicular sträng ridges (${strangWidthM}m width) across the hydraulic gradient while probing ahead for submerged rimpi windows.`,
    blackflyMosquitoSwarmStressIndex >= 40 || palsaLaggMoatEntrapmentPct >= 30
      ? `Deploy 1000-mesh Simuliidae headnets (swarm stress ${blackflyMosquitoSwarmStressIndex}/100), keep 20m Dyneema throw bag accessible at chest level, and stay >=4m back from fissured palsa lagg moats.`
      : `Verify satellite orthophoto ridge continuity across ${flarkTroughSpanM}m flark spans and preserve dry insulation layers against subarctic mire groundwater.`,
  ];

  return {
    strangShearBreakthroughRiskPct,
    palsaLaggMoatEntrapmentPct,
    flarkDetourDistanceMultiplier,
    blackflyMosquitoSwarmStressIndex,
    riskLevel,
    crossingStrategy,
    warnings,
    recommendations,
  };
}

export function getAapaPalsaMireGearChecklist(): AapaPalsaGearItem[] {
  return [...AAPA_PALSA_MIRE_GEAR_CHECKLIST];
}
