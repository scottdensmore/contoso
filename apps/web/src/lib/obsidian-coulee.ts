export type ObsidianLithologyType =
  | 'banded-rhyolite-obsidian-coulee'
  | 'pumiceous-carapace-glass-dome'
  | 'perlitic-breccia-pressure-spine'
  | 'vitrophyre-block-rubble-lobe';

export interface ObsidianCouleeSite {
  id: string;
  name: string;
  volcanicCaldera: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  lithology: ObsidianLithologyType;
  conchoidalBladeIndex: number;
  couleeReliefMeters: number;
  pumiceCrustFragilityPct: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  scramblingProtocol: string;
  description: string;
}

export interface ObsidianCouleeInput {
  conchoidalFlakeDensityPct: number;
  blockInstabilityTiltDeg: number;
  vesicularPumiceCrustRatioPct: number;
  couleeCrestReliefM: number;
  scramblerPackMassKg: number;
}

export interface ObsidianCouleeAnalysis {
  surgicalLacerationSeverityScore: number;
  vesicularCrustCollapseProbabilityPct: number;
  blockTeeterPinchHazardPct: number;
  bootLugShredRateMmPerKm: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  scramblingStrategy:
    | 'step-massive-flow-banded-ribs-avoid-flakes'
    | 'kevlar-gauntlet-shinguard-three-point-test'
    | 'bypass-pumice-carapace-trough-detour'
    | 'abort-glass-breccia-spine-imminent-shear';
  warnings: string[];
  recommendations: string[];
}

export interface ObsidianGearItem {
  id: string;
  name: string;
  category:
    | 'ansi-a6-cut-armor'
    | 'sole-shank-protection'
    | 'silica-eye-respiratory'
    | 'trauma-hemostasis';
  essential: boolean;
  rationale: string;
}

export const OBSIDIAN_COULEE_SITES: ObsidianCouleeSite[] = [
  {
    id: 'big-obsidian-flow-newberry-caldera-oregon',
    name: 'Big Obsidian Flow & Paulina Peak Rhyolite Coulee',
    volcanicCaldera: 'Newberry National Volcanic Monument',
    country: 'USA',
    region: 'Deschutes County, Oregon',
    latitude: 43.688,
    longitude: -121.233,
    elevationMeters: 2100,
    lithology: 'banded-rhyolite-obsidian-coulee',
    conchoidalBladeIndex: 86,
    couleeReliefMeters: 42,
    pumiceCrustFragilityPct: 38,
    difficulty: 'moderate',
    bestSeason: 'July – October (Snow-Free Caldera Summer Window)',
    hazards: [
      'Surgical 3-nanometer conchoidal volcanic-glass spalls and flow-banded rhyolite fins capable of slicing through leather boots, trekking pole straps, and softshell trousers on contact',
      'Intercalated gray pumice-diapir troughs and hollow cooling-contraction clefts separating 30–50 m pressure ridges across the 1,300-year-old caldera coulee',
      'Intense high-albedo specular glare from vitreous black obsidian facets combined with strict federal USFS / Archaeological Resources Protection Act (ARPA) zero-collection enforcement',
    ],
    scramblingProtocol:
      'step-massive-flow-banded-ribs-avoid-flakes keeping boots planted on thick, grey flow-banded lithoidal rhyolite ribs, wearing ANSI A6 Kevlar gauntlets for balance touches, and never reaching bare-handed to arrest a stumble.',
    description:
      'Oregon’s youngest (~1,300 BP) high-silica rhyolite lava flow filling the southern floor of Newberry Caldera with 1.8 square miles of vitreous black obsidian blocks, flow-banded pumice ridges, and pressure domes.',
  },
  {
    id: 'glass-mountain-medicine-lake-volcano-california',
    name: 'Glass Mountain & Little Glass Mountain Dacite-Rhyolite Obsidian Flow',
    volcanicCaldera: 'Medicine Lake Volcano Highlands',
    country: 'USA',
    region: 'Siskiyou County, California',
    latitude: 41.602,
    longitude: -121.504,
    elevationMeters: 2323,
    lithology: 'pumiceous-carapace-glass-dome',
    conchoidalBladeIndex: 94,
    couleeReliefMeters: 95,
    pumiceCrustFragilityPct: 74,
    difficulty: 'extreme',
    bestSeason: 'Late July – September (High-Cascade Dry Window)',
    hazards: [
      'Towering 60–95 m steep blocky coulee fronts composed of unstable, un-cemented multi-ton dacite-rhyolite obsidian boulders poised at the angle of repose (35–44°)',
      'Frothy, finely vesicular pumiceous carapace crusts bridging 3–8 m deep cooling fissures that crush explosively under boot weight into razor-walled glass chasms',
      'Airborne microscopic volcanic-glass shards and cristobalite-bearing silica dust lofted when shifting talus blocks grind together under scrambler load',
    ],
    scramblingProtocol:
      'bypass-pumice-carapace-trough-detour avoiding frothy light-grey vesicular pumice bridges, testing every multi-ton obsidian block with a three-point load check before committing weight, and ascending only low-angle flow lobes.',
    description:
      'A colossal ~900-year-old compositional-zoned rhyolite and dacite glass coulee on the eastern rim of Medicine Lake shield volcano, forming sheer jet-black obsidian talus ramparts and frothy pumiceous pressure ridges.',
  },
  {
    id: 'panum-crater-mono-inyo-obsidian-domes-california',
    name: 'Panum Crater & Obsidian Dome Pressure-Spine Coulee',
    volcanicCaldera: 'Mono-Inyo Craters Volcanic Chain',
    country: 'USA',
    region: 'Mono County, California',
    latitude: 37.927,
    longitude: -119.045,
    elevationMeters: 2485,
    lithology: 'perlitic-breccia-pressure-spine',
    conchoidalBladeIndex: 91,
    couleeReliefMeters: 78,
    pumiceCrustFragilityPct: 66,
    difficulty: 'challenging',
    bestSeason: 'May – October (Eastern Sierra Snow-Free Window)',
    hazards: [
      'Jagged perlitic-breccia extrusion spines and vertical squeeze-up pinnacles fractured by thermal shock into unstable columns of needle-sharp volcanic glass',
      'Teetering vitrophyre and pumiceous-rhyolite blocks balanced on slick conchoidal fulcrums that pinch ankles or shear off when weighted along dome margins',
      'Rapid Vibram boot-lug shredding (3–6 mm/km) and laceration hazard in narrow explosion-pit moat gullies and central dome collapse trenches',
    ],
    scramblingProtocol:
      'kevlar-gauntlet-shinguard-three-point-test donning full ANSI A6/A7 para-aramid gauntlets and hardshell shin gaiters, staying off overhanging perlitic pressure spines, and following consolidated tephra-ring trails where possible.',
    description:
      'Classic phreatomagmatic tephra-ring crater and extruded rhyolitic glass domes (~600–650 BP) in the Mono Basin, showcasing jagged perlitic breccia spines, flow-banded coulee lobes, and vesicular pumice carapaces.',
  },
  {
    id: 'hrafntinnusker-torfajokull-obsidian-plateau-iceland',
    name: 'Hrafntinnusker & Laugavegur Subglacial-Rhyolite Obsidian Ridge',
    volcanicCaldera: 'Fjallabak Nature Reserve / Torfajökull Caldera',
    country: 'Iceland',
    region: 'Highlands',
    latitude: 63.932,
    longitude: -19.168,
    elevationMeters: 1128,
    lithology: 'vitrophyre-block-rubble-lobe',
    conchoidalBladeIndex: 89,
    couleeReliefMeters: 64,
    pumiceCrustFragilityPct: 58,
    difficulty: 'challenging',
    bestSeason: 'July – August (Icelandic Highland Late-Summer Thaw)',
    hazards: [
      'Quenched subglacial rhyolite-vitrophyre rubble ridges mantled in wet, glaze-iced conchoidal obsidian plates that offer near-zero wet rubber friction',
      'Boiling fumarole-steamed snowbridges and hydrothermally altered clay pockets adjacent to razor-edged obsidian talus slopes inside Torfajökull caldera',
      'Sudden zero-visibility North Atlantic blizzard whiteouts and 25 m/s katabatic gusts across exposed 1,100 m glass-rubble plateaus',
    ],
    scramblingProtocol:
      'kevlar-gauntlet-shinguard-three-point-test combining high-durometer mountaineering soles with cut-resistant gaiters, probing snow-masked obsidian rubble margins with trekking poles, and maintaining GNSS track lock in highland fog.',
    description:
      'Iceland’s largest silicic volcanic complex where subglacial and post-glacial rhyolite eruptions produced shimmering black Hrafntinna (raven-flint) obsidian ridges, vitrophyre block fields, and geothermal ice caves.',
  },
];

export const OBSIDIAN_COULEE_GEAR_CHECKLIST: ObsidianGearItem[] = [
  {
    id: 'ansi-a6-kevlar-scrambling-gauntlets',
    name: 'ANSI/ISEA A6/A7 Para-Aramid Kevlar Scrambling Gauntlets with Nitrile Palm',
    category: 'ansi-a6-cut-armor',
    essential: true,
    rationale:
      'Freshly fractured volcanic obsidian cleaves to a 3-nanometer molecular edge (~500x sharper than surgical steel); ANSI A6/A7 para-aramid gauntlets prevent catastrophic tendon and palmar artery severance during balance touches.',
  },
  {
    id: 'full-shank-vibram-mont-mountaineering-boots',
    name: 'Full-Shank Mountaineering Boots with High-Durometer Vibram Mont Compound & 360° Rubber Rand',
    category: 'sole-shank-protection',
    essential: true,
    rationale:
      'Soft trail-running EVA midsoles and sticky climbing rubbers are sliced to ribbons by conchoidal glass fins; a rigid steel/TPU shank and high-durometer mountaineering compound prevent sole puncture and torsional ankle roll on teetering blocks.',
  },
  {
    id: 'cordura-1000d-kevlar-shin-gaiters',
    name: '1000D Ballistic Cordura & Kevlar-Lined Shin-Guard Scree Gaiters',
    category: 'ansi-a6-cut-armor',
    essential: true,
    rationale:
      'Armors the tibial crest, Achilles tendon, and saphenous vein against razor-walled vesicular pumice crust breakthroughs and shifting obsidian talus slabs.',
  },
  {
    id: 'ansi-z87-polycarbonate-glare-shields-p100',
    name: 'ANSI Z87.1+ Ballistic Wrap-Around Eye Shields & P100 Silica-Dust Half-Mask',
    category: 'silica-eye-respiratory',
    essential: true,
    rationale:
      'Blocks high-velocity vitreous glass spalls kicked up by boots or trekking poles and filters airborne amorphous silica / cristobalite dust lofted from collapsing pumiceous carapaces.',
  },
  {
    id: 'cat-tourniquet-celox-hemostatic-trauma-kit',
    name: 'CoTCCC Windlass Tourniquet, Hemostatic Gauze & Steri-Strip Laceration Trauma Kit',
    category: 'trauma-hemostasis',
    essential: true,
    rationale:
      'Conchoidal obsidian lacerations produce clean, deep surgical incisions that bleed profusely; immediate access to hemostatic gauze, pressure dressings, and a tourniquet is critical on remote caldera flows.',
  },
  {
    id: 'kevlar-reinforced-foam-kneepads-trekking-baskets',
    name: 'Hardshell Cap Kneepads & Heavy-Duty Carbide-Tip Poles without Wrist Straps',
    category: 'sole-shank-protection',
    essential: false,
    rationale:
      'Protects patellar tendons when testing fragile pumice bridges and eliminates pole wrist-strap entrapment if a tip wedges into a deep cooling-contraction glass fissure.',
  },
];

export function filterObsidianCouleeSites(
  sites: ObsidianCouleeSite[] = OBSIDIAN_COULEE_SITES,
  filters: {
    country?: string;
    lithology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): ObsidianCouleeSite[] {
  const { country, lithology, difficulty, search } = filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (lithology && lithology !== 'all' && site.lithology !== lithology) {
      return false;
    }
    if (difficulty && difficulty !== 'all' && site.difficulty !== difficulty) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.volcanicCaldera,
        site.country,
        site.region,
        site.lithology,
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

export function calculateObsidianCoulee(
  input: ObsidianCouleeInput
): ObsidianCouleeAnalysis {
  const {
    conchoidalFlakeDensityPct,
    blockInstabilityTiltDeg,
    vesicularPumiceCrustRatioPct,
    couleeCrestReliefM,
    scramblerPackMassKg,
  } = input;

  if (
    !Number.isFinite(conchoidalFlakeDensityPct) ||
    conchoidalFlakeDensityPct < 5 ||
    conchoidalFlakeDensityPct > 100
  ) {
    throw new Error(
      'Invalid conchoidalFlakeDensityPct: must be a finite number between 5 and 100%.'
    );
  }

  if (
    !Number.isFinite(blockInstabilityTiltDeg) ||
    blockInstabilityTiltDeg < 2 ||
    blockInstabilityTiltDeg > 48
  ) {
    throw new Error(
      'Invalid blockInstabilityTiltDeg: must be a finite number between 2 and 48 degrees.'
    );
  }

  if (
    !Number.isFinite(vesicularPumiceCrustRatioPct) ||
    vesicularPumiceCrustRatioPct < 5 ||
    vesicularPumiceCrustRatioPct > 95
  ) {
    throw new Error(
      'Invalid vesicularPumiceCrustRatioPct: must be a finite number between 5 and 95%.'
    );
  }

  if (
    !Number.isFinite(couleeCrestReliefM) ||
    couleeCrestReliefM < 5 ||
    couleeCrestReliefM > 140
  ) {
    throw new Error(
      'Invalid couleeCrestReliefM: must be a finite number between 5 and 140 meters.'
    );
  }

  if (
    !Number.isFinite(scramblerPackMassKg) ||
    scramblerPackMassKg < 4 ||
    scramblerPackMassKg > 45
  ) {
    throw new Error(
      'Invalid scramblerPackMassKg: must be a finite number between 4 and 45 kg.'
    );
  }

  const flakeNorm = (conchoidalFlakeDensityPct - 5) / 95.0;
  const tiltNorm = (blockInstabilityTiltDeg - 2) / 46.0;
  const pumiceNorm = (vesicularPumiceCrustRatioPct - 5) / 90.0;
  const reliefNorm = (couleeCrestReliefM - 5) / 135.0;
  const packNorm = (scramblerPackMassKg - 4) / 41.0;

  // 1. surgicalLacerationSeverityScore (5 to 100)
  const rawLaceration = 5 + flakeNorm * 58 + tiltNorm * 37;
  const surgicalLacerationSeverityScore = roundTo(
    clamp(rawLaceration, 5, 100),
    1
  );

  // 2. vesicularCrustCollapseProbabilityPct (2 to 99 %)
  const rawCollapse = 2 + pumiceNorm * 62 + packNorm * 35;
  const vesicularCrustCollapseProbabilityPct = roundTo(
    clamp(rawCollapse, 2, 99),
    1
  );

  // 3. blockTeeterPinchHazardPct (2 to 99 %)
  const rawTeeter = 2 + tiltNorm * 45 + reliefNorm * 32 + packNorm * 20;
  const blockTeeterPinchHazardPct = roundTo(clamp(rawTeeter, 2, 99), 1);

  // 4. bootLugShredRateMmPerKm (0.2 to 8.5 mm/km)
  const rawShred = 0.2 + flakeNorm * 5.3 + packNorm * 3.0;
  const bootLugShredRateMmPerKm = roundTo(clamp(rawShred, 0.2, 8.5), 1);

  // 5. riskLevel
  let riskLevel: ObsidianCouleeAnalysis['riskLevel'];
  if (
    surgicalLacerationSeverityScore >= 78 ||
    vesicularCrustCollapseProbabilityPct >= 75 ||
    blockTeeterPinchHazardPct >= 75 ||
    bootLugShredRateMmPerKm >= 5.8
  ) {
    riskLevel = 'critical';
  } else if (
    surgicalLacerationSeverityScore >= 55 ||
    vesicularCrustCollapseProbabilityPct >= 52 ||
    blockTeeterPinchHazardPct >= 52 ||
    bootLugShredRateMmPerKm >= 3.8
  ) {
    riskLevel = 'high';
  } else if (
    surgicalLacerationSeverityScore >= 32 ||
    vesicularCrustCollapseProbabilityPct >= 28 ||
    blockTeeterPinchHazardPct >= 28 ||
    bootLugShredRateMmPerKm >= 2.0
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. scramblingStrategy
  const strategyMap: Record<
    ObsidianCouleeAnalysis['riskLevel'],
    ObsidianCouleeAnalysis['scramblingStrategy']
  > = {
    critical: 'abort-glass-breccia-spine-imminent-shear',
    high: 'bypass-pumice-carapace-trough-detour',
    moderate: 'kevlar-gauntlet-shinguard-three-point-test',
    low: 'step-massive-flow-banded-ribs-avoid-flakes',
  };

  const scramblingStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (riskLevel === 'critical') {
    warnings.push(
      `CRITICAL CONCHOIDAL SURGICAL LACERATION, PUMICE CARAPACE COLLAPSE & VITROPHYRE BLOCK SHEAR HAZARD (laceration score = ${surgicalLacerationSeverityScore}/100, crust collapse = ${vesicularCrustCollapseProbabilityPct}%, block teeter = ${blockTeeterPinchHazardPct}%, lug shred = ${bootLugShredRateMmPerKm} mm/km): Imminent multi-ton obsidian block shift or vesicular crust breakthrough into razor-walled cooling fissures; abort glass-breccia spine immediately.`
    );
  } else if (riskLevel === 'high') {
    warnings.push(
      `HIGH VESICULAR PUMICE CRUST COLLAPSE, CONCHOIDAL BLADE EXPOSURE & BLOCK PINCH RISK (laceration score = ${surgicalLacerationSeverityScore}/100, crust collapse = ${vesicularCrustCollapseProbabilityPct}%, block teeter = ${blockTeeterPinchHazardPct}%, lug shred = ${bootLugShredRateMmPerKm} mm/km): Bypass frothy pumiceous carapace bridges via consolidated trough detours and enforce full ANSI A6/A7 cut armor.`
    );
  } else if (riskLevel === 'moderate') {
    warnings.push(
      `Moderate conchoidal glass flake density and angular block instability (laceration score = ${surgicalLacerationSeverityScore}/100, crust collapse = ${vesicularCrustCollapseProbabilityPct}%, block teeter = ${blockTeeterPinchHazardPct}%, lug shred = ${bootLugShredRateMmPerKm} mm/km): Wear Kevlar gauntlets and shin gaiters and perform three-point stability tests before committing pack load.`
    );
  }

  if (vesicularPumiceCrustRatioPct >= 50 || bootLugShredRateMmPerKm >= 3.5) {
    warnings.push(
      `FROTHY PUMICEOUS CARAPACE CAVITIES & ACCELERATED OUTSOLE SHREDDING (pumice crust = ${vesicularPumiceCrustRatioPct}%, lug shred = ${bootLugShredRateMmPerKm} mm/km): Hollow cooling clefts masked by brittle vesicular glass skins and rapid Vibram lug slicing threaten sudden leg-breakthrough and mid-route boot delamination.`
    );
  }

  const recommendations: string[] = [
    `Execute ${scramblingStrategy} protocol immediately (laceration severity: ${surgicalLacerationSeverityScore}/100, crust collapse: ${vesicularCrustCollapseProbabilityPct}%, block teeter: ${blockTeeterPinchHazardPct}%).`,
    conchoidalFlakeDensityPct >= 35 || blockInstabilityTiltDeg >= 15
      ? `Don ANSI A6/A7 para-aramid gauntlets and 1000D Kevlar shin guards across ${conchoidalFlakeDensityPct}% conchoidal flake beds inclined at ${blockInstabilityTiltDeg}°, never catching a slip with ungloved hands.`
      : `Step strictly on massive grey flow-banded lithoidal rhyolite ribs (${conchoidalFlakeDensityPct}% flake cover, ${blockInstabilityTiltDeg}° block tilt) while avoiding loose vitreous black spalls.`,
    vesicularPumiceCrustRatioPct >= 35 || scramblerPackMassKg >= 18
      ? `Avoid light-grey frothy vesicular pumice crusts (${vesicularPumiceCrustRatioPct}% carapace ratio under ${scramblerPackMassKg} kg pack load) and inspect boot outsoles every 2 km for ${bootLugShredRateMmPerKm} mm/km glass slicing.`
      : `Maintain three-point stability across consolidated coulee crests (${couleeCrestReliefM} m relief, ${scramblerPackMassKg} kg pack) and observe strict zero-collect federal cultural/geological artifact laws.`,
  ];

  return {
    surgicalLacerationSeverityScore,
    vesicularCrustCollapseProbabilityPct,
    blockTeeterPinchHazardPct,
    bootLugShredRateMmPerKm,
    riskLevel,
    scramblingStrategy,
    warnings,
    recommendations,
  };
}

export function getObsidianCouleeGearChecklist(): ObsidianGearItem[] {
  return [...OBSIDIAN_COULEE_GEAR_CHECKLIST];
}
