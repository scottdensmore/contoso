export type QuickClayDepositType =
  | 'glaciomarine-kvikkleire-ravine'
  | 'champlain-sea-leda-clay-terrace'
  | 'tyrrell-sea-postglacial-bluff'
  | 'fjord-delta-subaqueous-scarp';

export interface QuickClayTerraceSite {
  id: string;
  name: string;
  paleoMarineBasin: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  depositType: QuickClayDepositType;
  marineLimitElevationM: number;
  sensitivityRatioSt: number;
  poreSalinityGPerL: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  terraceProtocol: string;
  description: string;
}

export interface QuickClayTerraceInput {
  sensitivityRatioSt: number;
  poreSalinityGPerL: number;
  ravineSlopeAngleDeg: number;
  streamToeErosionRateCmYr: number;
  rainfallSaturationPct: number;
}

export interface QuickClayTerraceAnalysis {
  retrogressiveLiquefactionRiskPct: number;
  retrogressionRunoutDistanceM: number;
  remoldedShearStrengthKpa: number;
  safeCrownSetbackDistanceM: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  terraceStrategy:
    | 'bedrock-ridge-above-marine-limit'
    | 'wide-setback-dry-crust-terrace-march'
    | 'evacuate-ravine-floor-lateral-high-ground'
    | 'abort-imminent-flake-flow-liquefaction';
  warnings: string[];
  recommendations: string[];
}

export interface QuickClayGearItem {
  id: string;
  name: string;
  category:
    | 'geotechnical-probing'
    | 'load-distribution'
    | 'slurry-flotation-rescue'
    | 'li-gnss-scarp-mapping';
  essential: boolean;
  rationale: string;
}

export const QUICK_CLAY_TERRACE_SITES: QuickClayTerraceSite[] = [
  {
    id: 'gauldalen-trondheimsfjord-kvikkleire-norway',
    name: 'Gauldalen & Rissa Trondheimsfjord Kvikkleire Marine-Terrace Ravines',
    paleoMarineBasin: 'Trøndelag Glaciomarine Basin',
    country: 'Norway',
    region: 'Melhus / Indre Fosen',
    latitude: 63.285,
    longitude: 10.278,
    elevationMeters: 145,
    depositType: 'glaciomarine-kvikkleire-ravine',
    marineLimitElevationM: 175,
    sensitivityRatioSt: 120,
    poreSalinityGPerL: 0.7,
    difficulty: 'challenging',
    bestSeason: 'January – March (Deep Winter Frozen Dry-Crust Window)',
    hazards: [
      'Card-house flocculated glaciomarine clay leached below 1.0 g/L NaCl with sensitivity ratios St > 100 that liquefy into a frictionless non-Newtonian fluid upon minor toe-undercutting or vibrational loading',
      'Domino-style retrogressive flake and flow slides capable of eating 500–1,500 m backward across seemingly flat agricultural marine terraces in minutes (as seen in the 1978 Rissa and 1345 Gauldalen disasters)',
      'Submerged quick-clay slurry bowls and translationally rafted dry-crust islands that trap hikers in suction-locked thixotropic mud',
    ],
    terraceProtocol:
      'wide-setback-dry-crust-terrace-march maintaining >= 15x slope-height crown setback from incised stream ravines, routing above the 175 m Holocene marine limit (marin grense) on crystalline gneiss ridges during heavy rain or spring snowmelt.',
    description:
      'Classic Norwegian fjord-valley kvikkleire landscape along the Gaula River and Lake Botnen (Rissa), where post-glacial isostatic rebound lifted salt-flocculated marine clays up to 175 m above modern sea level and freshwater artesian leaching created ultra-sensitive retrogressive slump corridors.',
  },
  {
    id: 'romerike-gjerdrum-ravine-terrace-norway',
    name: 'Romerike & Nittedal-Gjerdrum Dissected Quick-Clay Plateau',
    paleoMarineBasin: 'Oslo Fjord Paleo-Marine Limit',
    country: 'Norway',
    region: 'Akershus',
    latitude: 60.065,
    longitude: 11.036,
    elevationMeters: 185,
    depositType: 'fjord-delta-subaqueous-scarp',
    marineLimitElevationM: 220,
    sensitivityRatioSt: 245,
    poreSalinityGPerL: 0.4,
    difficulty: 'extreme',
    bestSeason: 'February – Early March (Sub-Zero Crust Consolidation)',
    hazards: [
      'Deeply incised dendritic ravine networks cutting 25–40 m into ultra-sensitive kvikkleire pockets (St > 200, remolded shear strength < 0.2 kPa) beneath a deceptively firm 2–4 m weathered dry crust (tørrskorpeleire)',
      'Active stream-toe erosion along Tistilbekken-type gullies following prolonged autumn/winter rainfall saturation (>80%), triggering sudden 300 x 700 m retrogressive cratering',
      'Instantaneous liquefaction of remolded clay into a 30–40 km/h fluid debris wave flowing down-talweg for over 1.5 km',
    ],
    terraceProtocol:
      'abort-imminent-flake-flow-liquefaction avoiding all ravine floors and active stream-toe cutbanks after 72-hour saturation events, consulting NVE Kvikkleiresoner hazard polygons, and evacuating laterally toward Precambrian bedrock knobs.',
    description:
      'Norway’s most extensively dissected post-glacial marine-clay plateau north of Oslo, where the marine limit reaches ~220 m and artesian upward groundwater gradients have leached thick glaciomarine clay beds into high-consequence retrogressive slump basins.',
  },
  {
    id: 'south-nation-lemieux-leda-clay-ontario-canada',
    name: 'South Nation River & Lemieux Champlain Sea Leda-Clay Bluffs',
    paleoMarineBasin: 'St. Lawrence / Ottawa Valley Lowlands',
    country: 'Canada',
    region: 'Eastern Ontario',
    latitude: 45.397,
    longitude: -75.058,
    elevationMeters: 72,
    depositType: 'champlain-sea-leda-clay-terrace',
    marineLimitElevationM: 198,
    sensitivityRatioSt: 95,
    poreSalinityGPerL: 0.9,
    difficulty: 'challenging',
    bestSeason: 'July – September (Low-Water Summer Baseflow Window)',
    hazards: [
      'Sensitive Champlain Sea Leda clay bluffs beneath a thin deltaic sand cap that fail via rapid retrogressive earthflows during spring freshet pore-pressure spikes (1971 and 1993 Lemieux landslides)',
      '15–25 m riverbank scarps capable of retrogressing 650+ m inland within 45 minutes and damming the mainstem river channel up to 3 km upstream and downstream',
      'Liquefied clay-silt spoil aprons that look crusted on the surface but offer < 0.3 kPa bearing capacity underneath',
    ],
    terraceProtocol:
      'wide-setback-dry-crust-terrace-march staying at least 250 m back from actively sloughing South Nation River bluff crowns during spring thaw and never camping on low river benches opposite concave retrogressive amphitheaters.',
    description:
      'Broad post-glacial Champlain Sea marine plain in the Ottawa–St. Lawrence Lowlands where rock-flour clay and silt settled in brackish water 10,000–12,000 BP and now produces textbook retrogressive flowslides along the South Nation River.',
  },
  {
    id: 'saguenay-saint-jean-vianney-terrace-quebec-canada',
    name: 'Saguenay Fjord & Rivière aux Vases Laflamme Sea Clay Terraces',
    paleoMarineBasin: 'Saguenay–Lac-Saint-Jean Graben',
    country: 'Canada',
    region: 'Quebec',
    latitude: 48.468,
    longitude: -71.218,
    elevationMeters: 110,
    depositType: 'tyrrell-sea-postglacial-bluff',
    marineLimitElevationM: 180,
    sensitivityRatioSt: 185,
    poreSalinityGPerL: 0.5,
    difficulty: 'extreme',
    bestSeason: 'August – Early October (Dry Late-Summer Graben Window)',
    hazards: [
      'Deeply stratified Laflamme Sea quick-clay terraces capable of catastrophic multi-million-cubic-meter retrogressive liquefaction (1971 Saint-Jean-Vianney slide carried 7M m³ of liquefied clay 3 km into the Saguenay River at 26 km/h)',
      'Nested paleo-scarp amphitheaters where groundwater seepage at the base of 30 m bluffs initiates rapid backward scarp collapse without warning',
      'Steep tributary gorges (Rivière aux Vases / Petit Bras) that funnel liquefied clay flows like high-velocity lahars toward the mainstem fjord',
    ],
    terraceProtocol:
      'evacuate-ravine-floor-lateral-high-ground keeping routes anchored on Grenville anorthosite and granite-gneiss bedrock shoulders or maintaining wide LiDAR-verified crown setbacks outside mapped Laflamme Sea retrogressive bowls.',
    description:
      'Dramatic glaciomarine terraces flanking the Saguenay Fjord graben, deposited in the post-glacial Laflamme Sea and carved by tributary ravines into some of North America’s largest historical retrogressive quick-clay amphitheaters.',
  },
];

export const QUICK_CLAY_TERRACE_GEAR_CHECKLIST: QuickClayGearItem[] = [
  {
    id: 'portable-vane-shear-salinity-conductivity-probe',
    name: 'Portable Field Vane-Shear & Conductivity Pore-Salinity Probe',
    category: 'geotechnical-probing',
    essential: true,
    rationale:
      'Detects leached glaciomarine clay horizons (pore-water NaCl < 1.0 g/L) and verifies whether remolded shear strength beneath the weathered surface crust drops below the 0.5 kPa kvikkleire liquefaction threshold.',
  },
  {
    id: 'wide-backcountry-skis-bog-flotation-snowshoes',
    name: 'Wide Backcountry Skis or High-Flotation Bog Snowshoes with Quick-Release Bindings',
    category: 'load-distribution',
    essential: true,
    rationale:
      'Distributes hiker ground contact pressure below 5 kPa across thin weathered dry crusts (tørrskorpeleire) and allows rapid lateral egress without post-holing into thixotropic clay silt.',
  },
  {
    id: 'li-lidar-marine-limit-gnss-scarp-tablet',
    name: 'Offline 1m LiDAR Hillshade & NVE/GSC Marine-Limit (Marin Grense) GNSS Mapper',
    category: 'li-gnss-scarp-mapping',
    essential: true,
    rationale:
      'Reveals subtle arcuate paleo-slump scars, active tension cracks, and the exact Holocene marine limit elevation above which salt-flocculated quick clay cannot exist.',
  },
  {
    id: 'inflatable-mud-rescue-board-throw-bag-tether',
    name: 'Inflatable Slurry-Flotation Rescue Sled & 30m Floating Dyneema Throw-Line',
    category: 'slurry-flotation-rescue',
    essential: true,
    rationale:
      'Remolded quick clay behaves like a high-density viscous liquid with powerful suction; rescuers must never walk onto a fresh slide bowl on foot and require horizontal flotation platforms and throw-lines.',
  },
  {
    id: 'graduated-2m-geotechnical-sounding-rod',
    name: 'Graduated 2.0m T-Handle Geotechnical Sounding & Tension-Crack Probe Rod',
    category: 'geotechnical-probing',
    essential: true,
    rationale:
      'Probes turf-masked crown tension cracks along ravine rims and gauges the thickness of the consolidated upper dry crust before committing a team across a marine terrace.',
  },
  {
    id: 'piezometric-rain-gauge-clinometer-transceiver',
    name: 'Digital Ravine-Slope Clinometer, 72h Rain-Saturation Logger & Satellite SOS Beacon',
    category: 'li-gnss-scarp-mapping',
    essential: false,
    rationale:
      'Measures critical 1:15 (3.8°) potential retrogression runout angles from stream toes and provides emergency satellite telemetry if a retrogressive slump severs valley road corridors.',
  },
];

export function filterQuickClayTerraceSites(
  sites: QuickClayTerraceSite[] = QUICK_CLAY_TERRACE_SITES,
  filters: {
    country?: string;
    depositType?: string;
    difficulty?: string;
    search?: string;
  } = {}
): QuickClayTerraceSite[] {
  const { country, depositType, difficulty, search } = filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (
      depositType &&
      depositType !== 'all' &&
      site.depositType !== depositType
    ) {
      return false;
    }
    if (difficulty && difficulty !== 'all' && site.difficulty !== difficulty) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.paleoMarineBasin,
        site.country,
        site.region,
        site.depositType,
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

export function calculateQuickClayTerrace(
  input: QuickClayTerraceInput
): QuickClayTerraceAnalysis {
  const {
    sensitivityRatioSt,
    poreSalinityGPerL,
    ravineSlopeAngleDeg,
    streamToeErosionRateCmYr,
    rainfallSaturationPct,
  } = input;

  if (
    !Number.isFinite(sensitivityRatioSt) ||
    sensitivityRatioSt < 10 ||
    sensitivityRatioSt > 300
  ) {
    throw new Error(
      'Invalid sensitivityRatioSt: must be a finite number between 10 and 300.'
    );
  }

  if (
    !Number.isFinite(poreSalinityGPerL) ||
    poreSalinityGPerL < 0.1 ||
    poreSalinityGPerL > 15.0
  ) {
    throw new Error(
      'Invalid poreSalinityGPerL: must be a finite number between 0.1 and 15.0 g/L.'
    );
  }

  if (
    !Number.isFinite(ravineSlopeAngleDeg) ||
    ravineSlopeAngleDeg < 5 ||
    ravineSlopeAngleDeg > 45
  ) {
    throw new Error(
      'Invalid ravineSlopeAngleDeg: must be a finite number between 5 and 45 degrees.'
    );
  }

  if (
    !Number.isFinite(streamToeErosionRateCmYr) ||
    streamToeErosionRateCmYr < 0 ||
    streamToeErosionRateCmYr > 150
  ) {
    throw new Error(
      'Invalid streamToeErosionRateCmYr: must be a finite number between 0 and 150 cm/yr.'
    );
  }

  if (
    !Number.isFinite(rainfallSaturationPct) ||
    rainfallSaturationPct < 0 ||
    rainfallSaturationPct > 100
  ) {
    throw new Error(
      'Invalid rainfallSaturationPct: must be a finite number between 0 and 100%.'
    );
  }

  const stNorm = (sensitivityRatioSt - 10) / 290.0;
  const leachNorm = 1 - (poreSalinityGPerL - 0.1) / 14.9;
  const slopeNorm = (ravineSlopeAngleDeg - 5) / 40.0;
  const erosionNorm = streamToeErosionRateCmYr / 150.0;
  const rainNorm = rainfallSaturationPct / 100.0;

  // 1. retrogressiveLiquefactionRiskPct (1 to 99 %)
  const rawLiq =
    1 +
    stNorm * 28 +
    leachNorm * 24 +
    slopeNorm * 16 +
    erosionNorm * 16 +
    rainNorm * 14;
  const retrogressiveLiquefactionRiskPct = roundTo(clamp(rawLiq, 1, 99), 1);

  // 2. retrogressionRunoutDistanceM (15 to 1200 m)
  const rawRunout = 15 + stNorm * 480 + leachNorm * 260 + rainNorm * 240;
  const retrogressionRunoutDistanceM = roundTo(clamp(rawRunout, 15, 1200), 1);

  // 3. remoldedShearStrengthKpa (0.05 to 2.5 kPa)
  const combinedDisturbance = 0.55 * stNorm + 0.45 * leachNorm;
  const rawShear = 0.05 + 2.45 * Math.pow(1 - combinedDisturbance, 2.6);
  const remoldedShearStrengthKpa = roundTo(clamp(rawShear, 0.05, 2.5), 2);

  // 4. safeCrownSetbackDistanceM (15 to 850 m)
  const rawSetback =
    15 + retrogressionRunoutDistanceM * 0.52 + slopeNorm * 140;
  const safeCrownSetbackDistanceM = roundTo(clamp(rawSetback, 15, 850), 1);

  // 5. riskLevel
  let riskLevel: QuickClayTerraceAnalysis['riskLevel'];
  if (
    retrogressiveLiquefactionRiskPct >= 75 ||
    retrogressionRunoutDistanceM >= 600 ||
    remoldedShearStrengthKpa <= 0.25 ||
    safeCrownSetbackDistanceM >= 450
  ) {
    riskLevel = 'critical';
  } else if (
    retrogressiveLiquefactionRiskPct >= 50 ||
    retrogressionRunoutDistanceM >= 320 ||
    remoldedShearStrengthKpa <= 0.45 ||
    safeCrownSetbackDistanceM >= 250
  ) {
    riskLevel = 'high';
  } else if (
    retrogressiveLiquefactionRiskPct >= 28 ||
    retrogressionRunoutDistanceM >= 140 ||
    remoldedShearStrengthKpa <= 0.85 ||
    safeCrownSetbackDistanceM >= 110
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. terraceStrategy
  const strategyMap: Record<
    QuickClayTerraceAnalysis['riskLevel'],
    QuickClayTerraceAnalysis['terraceStrategy']
  > = {
    critical: 'abort-imminent-flake-flow-liquefaction',
    high: 'evacuate-ravine-floor-lateral-high-ground',
    moderate: 'wide-setback-dry-crust-terrace-march',
    low: 'bedrock-ridge-above-marine-limit',
  };

  const terraceStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (riskLevel === 'critical') {
    warnings.push(
      `CRITICAL KVIKKLEIRE RETROGRESSIVE LIQUEFACTION & FLAKE-FLOW SLUMP HAZARD (liquefaction risk = ${retrogressiveLiquefactionRiskPct}%, runout = ${retrogressionRunoutDistanceM} m, remolded shear = ${remoldedShearStrengthKpa} kPa, crown setback = ${safeCrownSetbackDistanceM} m): Leached card-house clay structure is poised for domino-style collapse; abort marine-terrace traversal immediately.`
    );
  } else if (riskLevel === 'high') {
    warnings.push(
      `HIGH RETROGRESSIVE SLUMP & RAVINE TOE-UNDERCUTTING RISK (liquefaction risk = ${retrogressiveLiquefactionRiskPct}%, runout = ${retrogressionRunoutDistanceM} m, remolded shear = ${remoldedShearStrengthKpa} kPa, crown setback = ${safeCrownSetbackDistanceM} m): Evacuate incised ravine floors immediately and climb laterally onto crystalline bedrock or above the marine limit.`
    );
  } else if (riskLevel === 'moderate') {
    warnings.push(
      `Moderate glaciomarine clay sensitivity and pore-salinity leaching (liquefaction risk = ${retrogressiveLiquefactionRiskPct}%, runout = ${retrogressionRunoutDistanceM} m, remolded shear = ${remoldedShearStrengthKpa} kPa, crown setback = ${safeCrownSetbackDistanceM} m): Maintain a wide ${safeCrownSetbackDistanceM} m crown setback on consolidated dry crust and avoid undercut stream banks.`
    );
  }

  if (poreSalinityGPerL <= 1.0 || remoldedShearStrengthKpa <= 0.5) {
    warnings.push(
      `SALT-LEACHED CARD-HOUSE CLAY THRESHOLD BREACHED (pore salinity = ${poreSalinityGPerL} g/L, remolded shear = ${remoldedShearStrengthKpa} kPa): Pore-water NaCl below 1.0 g/L and remolded shear strength <= 0.5 kPa define true quick clay capable of spontaneous transformation into a liquid slurry upon disturbance.`
    );
  }

  const recommendations: string[] = [
    `Execute ${terraceStrategy} protocol immediately (liquefaction risk: ${retrogressiveLiquefactionRiskPct}%, predicted retrogression runout: ${retrogressionRunoutDistanceM} m, minimum safe crown setback: ${safeCrownSetbackDistanceM} m).`,
    poreSalinityGPerL <= 2.0 || sensitivityRatioSt >= 50
      ? `Route above the regional Holocene marine limit (marin grense) or along exposed crystalline bedrock ribs; leached clay (St = ${sensitivityRatioSt}, salinity = ${poreSalinityGPerL} g/L) retains only ${remoldedShearStrengthKpa} kPa remolded strength.`
      : `Stay on consolidated weathered dry crust (tørrskorpeleire) with ${safeCrownSetbackDistanceM} m buffer from ${ravineSlopeAngleDeg}° ravine crests while monitoring stream toe erosion (${streamToeErosionRateCmYr} cm/yr).`,
    streamToeErosionRateCmYr >= 50 || rainfallSaturationPct >= 50
      ? `Never descend into incised ravine talwegs during ${rainfallSaturationPct}% 72-hour rainfall saturation and ${streamToeErosionRateCmYr} cm/yr stream toe erosion; a single small bank slip can unbuttress a ${retrogressionRunoutDistanceM} m retrogressive flake slide.`
      : `Carry 1m LiDAR hillshade maps and a 2m sounding rod to verify absence of arcuate crown tension cracks across low-angle marine terraces.`,
  ];

  return {
    retrogressiveLiquefactionRiskPct,
    retrogressionRunoutDistanceM,
    remoldedShearStrengthKpa,
    safeCrownSetbackDistanceM,
    riskLevel,
    terraceStrategy,
    warnings,
    recommendations,
  };
}

export function getQuickClayTerraceGearChecklist(): QuickClayGearItem[] {
  return [...QUICK_CLAY_TERRACE_GEAR_CHECKLIST];
}
