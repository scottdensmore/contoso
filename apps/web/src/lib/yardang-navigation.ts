export type AeolianMorphology =
  | 'kalut-mega-yardang-corridor'
  | 'star-dune-multi-arm-slipface'
  | 'barchanoid-interdune-gassi'
  | 'lacustrine-mudstone-yardang-fleet';

export interface YardangDesertSite {
  id: string;
  name: string;
  desertBasin: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: AeolianMorphology;
  reliefHeightMeters: number;
  slipFaceAngleDeg: number;
  prevailingCorridorAzimuthDeg: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  routingProtocol: string;
  description: string;
}

export interface YardangNavigationInput {
  slipFaceAngleDeg: number;
  windSpeedKmh: number;
  corridorWidthM: number;
  sandSurfaceTempC: number;
  visibilityM: number;
}

export interface YardangNavigationAnalysis {
  avalancheSlipSafetyFactor: number;
  venturiWindAccelerationRatio: number;
  triboelectricGnssNoiseIndex: number;
  strideSinkageEnergyMultiplier: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  routingStrategy:
    | 'follow-windward-stoss-ridge'
    | 'inter-yardang-gassi-corridor-bearing'
    | 'diagonal-switchback-avoid-leeward-horn'
    | 'abort-haboob-sheltered-lee-trench';
  warnings: string[];
  recommendations: string[];
}

export interface YardangGearItem {
  id: string;
  name: string;
  category:
    | 'sand-goggles-respiration'
    | 'aeolian-navigation'
    | 'flotation-footwear'
    | 'thermal-hydration';
  essential: boolean;
  rationale: string;
}

export const YARDANG_DESERT_SITES: YardangDesertSite[] = [
  {
    id: 'dasht-e-lut-kaluts-iran',
    name: 'Dasht-e Lut Gandom Beryan & Shahr-e Lut Mega-Yardang (Kalut) Corridors',
    desertBasin: 'Central Lut Hyper-Arid Endorheic Basin',
    country: 'Iran',
    region: 'Lut Desert, Kerman Province',
    latitude: 30.583,
    longitude: 57.817,
    elevationMeters: 390,
    morphology: 'kalut-mega-yardang-corridor',
    reliefHeightMeters: 155,
    slipFaceAngleDeg: 34,
    prevailingCorridorAzimuthDeg: 335,
    difficulty: 'extreme',
    bestSeason: 'November – February (Winter Thermal Window)',
    hazards: [
      '70+ °C black basalt & playa sand surface temperatures near Gandom Beryan causing rapid conductive boot-sole delamination and hyperthermia',
      '150-meter-high parallel Pleistocene clay-silt Kalut ridges funneling 120-day Sistan (Bad-e Sad-o-Bist-Ruz) gales into blinding Venturi sand-blasting troughs',
      'Dead-end wind-carved gullies and salt-crusted Lut Rig slip-faces collapsing at the 34° dry-sand angle of repose',
    ],
    routingProtocol:
      'inter-yardang-gassi-corridor-bearing along the 335° NNW–SSE Kalut street axis with pre-dawn departures and baseplate compass back-bearings.',
    description:
      'Monumental 150-kilometer-long fleet of wind-abraded Pleistocene lacustrine ridges (Kaluts) separated by deep aeolian troughs and flanked by the 480-meter Rig-e Yalan dune massif.',
  },
  {
    id: 'badain-jaran-star-dunes-china',
    name: 'Badain Jaran Bilutu Peak Mega-Star-Dune & Interdune Lakes',
    desertBasin: 'Alxa Plateau / Gobi Western Erg Basin',
    country: 'China',
    region: 'Alxa Plateau, Inner Mongolia',
    latitude: 39.794,
    longitude: 102.435,
    elevationMeters: 1611,
    morphology: 'star-dune-multi-arm-slipface',
    reliefHeightMeters: 500,
    slipFaceAngleDeg: 35,
    prevailingCorridorAzimuthDeg: 305,
    difficulty: 'extreme',
    bestSeason: 'September – Early November (Post-Summer Calm Window)',
    hazards: [
      'Multi-directional star-dune arms converging on 500-meter-high Bilutu Peak with 34–35° acoustic booming-sand avalanche slip-faces on three flanks',
      'Steep leeward cornice overhangs and deep dry-sand grainflows that double metabolic stride sinkage and bury lower legs',
      'Saline groundwater discharge fringes around interdune spring lakes concealing soft quicksand-like evaporite mud',
    ],
    routingProtocol:
      'follow-windward-stoss-ridge along wind-packed 12–18° stoss spines, switching to diagonal-switchback-avoid-leeward-horn when crossing multi-arm saddles.',
    description:
      'Earth’s tallest stationary mega-star-dune field, where 450-to-500-meter sand peaks tower above more than 140 spring-fed hypersaline interdune lakes.',
  },
  {
    id: 'lop-nur-yardang-xinjiang-china',
    name: 'Lop Nur & Dunhuang Yadan Pleistocene Lacustrine Fleet',
    desertBasin: 'Tarim Basin / Kumtag Desert Eastern Depression',
    country: 'China',
    region: 'Tarim Basin / Kumtag Desert, Xinjiang / Gansu',
    latitude: 40.518,
    longitude: 93.241,
    elevationMeters: 820,
    morphology: 'lacustrine-mudstone-yardang-fleet',
    reliefHeightMeters: 35,
    slipFaceAngleDeg: 28,
    prevailingCorridorAzimuthDeg: 65,
    difficulty: 'challenging',
    bestSeason: 'September – October (Autumn Clear-Air Window)',
    hazards: [
      'Thousands of identical flat-topped mudstone "ship" yardangs causing severe visual horizon ambiguity and multipath GNSS reflections',
      'Undercut wind-abraded mudstone prows and overhanging pedestal ledges prone to sudden brittle slab cleavage',
      'Violent ENE "Kara-buran" black hurricanes that drop optical visibility below 10 meters and charge airborne silica with triboelectric static',
    ],
    routingProtocol:
      'inter-yardang-gassi-corridor-bearing using sighting-mirror compass dead-reckoning and 100-meter pace-bead counts across ENE–WSW corridors.',
    description:
      'The classic type-locality of the Uyghur term "Yardang" (steep bank), comprising vast fleets of streamlined Pleistocene lakebed mudstone hulls sculpted by relentless Tarim Basin winds.',
  },
  {
    id: 'borkou-ennedi-yardangs-chad',
    name: 'Borkou–Tibesti Sandstone Yardang Wind-Tunnels & Erg Djourab',
    desertBasin: 'Bodélé Depression / Southern Sahara Paleo-Megachad Basin',
    country: 'Chad',
    region: 'Bodélé Depression, Borkou Region',
    latitude: 17.912,
    longitude: 18.645,
    elevationMeters: 460,
    morphology: 'barchanoid-interdune-gassi',
    reliefHeightMeters: 85,
    slipFaceAngleDeg: 32,
    prevailingCorridorAzimuthDeg: 45,
    difficulty: 'moderate',
    bestSeason: 'December – February (Cooler Harmattan Season)',
    hazards: [
      'Low-level Bodélé jet stream funneling NE Harmattan winds through Paleozoic sandstone yardang grooves at 2x Venturi acceleration',
      'Fast-migrating barchan horns encroaching across hard inter-yardang gassi gravel streets and sealing off exit corridors',
      'Dense diatomite dust plumes from ancient Lake Megachad bed obscuring solar landmarks and clogging unsealed respirators',
    ],
    routingProtocol:
      'follow-windward-stoss-ridge along firm sandstone wind-tunnels and hard-packed gassi gravel corridors while skirting active barchan leeward horns.',
    description:
      'Deeply grooved Paleozoic sandstone yardang ridges and barchanoid dune trains aligned with the NE Harmattan wind corridor feeding the Bodélé Depression.',
  },
];

export const YARDANG_GEAR_CHECKLIST: YardangGearItem[] = [
  {
    id: 'foam-sealed-ballistic-sand-goggles-p100',
    name: 'Foam-Sealed Ballistic Sand Goggles & P100 Fine-Silica Particulate Respirator',
    category: 'sand-goggles-respiration',
    essential: true,
    rationale:
      'Blocks saltating quartz grains in 80+ km/h Venturi yardang corridors and filters sub-5-micron diatomite/playa dust during haboob whiteouts.',
  },
  {
    id: 'sighting-mirror-baseplate-compass-gnss',
    name: 'Sighting Mirror Baseplate Compass, Pace-Bead Counter & Dual-Band GNSS Logger',
    category: 'aeolian-navigation',
    essential: true,
    rationale:
      'Provides non-electronic dead-reckoning along prevailing yardang azimuths when triboelectric dust storms degrade GNSS carrier-to-noise ratios.',
  },
  {
    id: 'full-height-kevlar-desert-gaiters-stoss-boots',
    name: 'Full-Height Kevlar Desert Sand Gaiters & Wide-Last Vibram Stoss Trekking Boots',
    category: 'flotation-footwear',
    essential: true,
    rationale:
      'Prevents 60+ °C abrasive quartz sand from entering footwear on 34° slip-face grainflows and insulates soles against superheated Gandom Beryan basalt.',
  },
  {
    id: 'electrolyte-insulated-hydration-bladder-6l',
    name: '6-Liter Insulated Closed-Cell Hydration System & High-Sodium Electrolyte Salts',
    category: 'thermal-hydration',
    essential: true,
    rationale:
      'Sustains 1.0–1.5 L/hr sweat replacement rates when loose slip-face sinkage triples metabolic expenditure in <10% relative humidity.',
  },
  {
    id: 'esd-shielded-faraday-pouch-sat-messenger',
    name: 'ESD-Shielded Faraday Dry-Pouch & Satellite SOS Transceiver',
    category: 'aeolian-navigation',
    essential: true,
    rationale:
      'Protects avionics and lithium batteries against multi-kilovolt triboelectric static discharge generated by colliding airborne quartz grains.',
  },
  {
    id: 'haboob-storm-bivy-sand-fluke-anchors',
    name: 'Breathable Ripstop Haboob Storm Bivy Sack & Deadman Sand-Fluke Anchors',
    category: 'thermal-hydration',
    essential: false,
    rationale:
      'Anchors emergency shelter inside leeward inter-yardang trenches when Kara-buran or Sistan gales exceed 75 km/h.',
  },
];

export function filterYardangSites(
  sites: YardangDesertSite[] = YARDANG_DESERT_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): YardangDesertSite[] {
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
        site.desertBasin,
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

export function calculateYardangNavigation(
  input: YardangNavigationInput
): YardangNavigationAnalysis {
  const {
    slipFaceAngleDeg,
    windSpeedKmh,
    corridorWidthM,
    sandSurfaceTempC,
    visibilityM,
  } = input;

  if (
    !Number.isFinite(slipFaceAngleDeg) ||
    slipFaceAngleDeg < 10 ||
    slipFaceAngleDeg > 42
  ) {
    throw new Error(
      'Invalid slipFaceAngleDeg: must be a finite number between 10 and 42 degrees.'
    );
  }

  if (
    !Number.isFinite(windSpeedKmh) ||
    windSpeedKmh < 0 ||
    windSpeedKmh > 130
  ) {
    throw new Error(
      'Invalid windSpeedKmh: must be a finite number between 0 and 130 km/h.'
    );
  }

  if (
    !Number.isFinite(corridorWidthM) ||
    corridorWidthM < 2 ||
    corridorWidthM > 250
  ) {
    throw new Error(
      'Invalid corridorWidthM: must be a finite number between 2 and 250 meters.'
    );
  }

  if (
    !Number.isFinite(sandSurfaceTempC) ||
    sandSurfaceTempC < 10 ||
    sandSurfaceTempC > 72
  ) {
    throw new Error(
      'Invalid sandSurfaceTempC: must be a finite number between 10 and 72 °C.'
    );
  }

  if (
    !Number.isFinite(visibilityM) ||
    visibilityM < 5 ||
    visibilityM > 2000
  ) {
    throw new Error(
      'Invalid visibilityM: must be a finite number between 5 and 2000 meters.'
    );
  }

  // 1. avalancheSlipSafetyFactor (0.6 to 3.2): ratio of dry quartz sand angle of repose (~34 deg) to slipFaceAngleDeg, adjusted downward when windSpeedKmh loads leeward cornice
  const rawSafety = 34 / slipFaceAngleDeg - (windSpeedKmh / 130) * 0.22;
  const avalancheSlipSafetyFactor = roundTo(clamp(rawSafety, 0.6, 3.2), 2);

  // 2. venturiWindAccelerationRatio (1.0 to 2.6): wind speed amplification inside narrow inter-yardang troughs
  const widthNormalized = (250 - corridorWidthM) / (250 - 2);
  const rawVenturi =
    1.0 +
    Math.pow(widthNormalized, 1.3) * 1.1 +
    (windSpeedKmh / 130) * 0.5;
  const venturiWindAccelerationRatio = roundTo(clamp(rawVenturi, 1.0, 2.6), 2);

  // 3. triboelectricGnssNoiseIndex (1.0 to 10.0): electrostatic dust-devil / haboob radio-multipath & optical obscurity index
  const visibilityNormalized = (2000 - visibilityM) / (2000 - 5);
  const tempNormalized = (sandSurfaceTempC - 10) / (72 - 10);
  const rawNoise =
    1.0 +
    Math.pow(visibilityNormalized, 1.3) * 4.5 +
    (windSpeedKmh / 130) * 2.8 +
    tempNormalized * 1.7;
  const triboelectricGnssNoiseIndex = roundTo(clamp(rawNoise, 1.0, 10.0), 2);

  // 4. strideSinkageEnergyMultiplier (1.0 to 3.8): metabolic cost multiplier increasing steeply when slipFaceAngleDeg >= 28
  const baseSinkage =
    1.0 +
    ((slipFaceAngleDeg - 10) / 32) * 1.2 +
    tempNormalized * 0.3;
  const leewardAvalanchePenalty =
    slipFaceAngleDeg >= 28
      ? Math.pow((slipFaceAngleDeg - 27) / 15, 1.2) * 1.3
      : 0;
  const strideSinkageEnergyMultiplier = roundTo(
    clamp(baseSinkage + leewardAvalanchePenalty, 1.0, 3.8),
    2
  );

  // 5. riskLevel
  let riskLevel: YardangNavigationAnalysis['riskLevel'];
  if (
    avalancheSlipSafetyFactor < 0.98 ||
    windSpeedKmh >= 75 ||
    sandSurfaceTempC >= 60 ||
    visibilityM <= 25
  ) {
    riskLevel = 'critical';
  } else if (
    avalancheSlipSafetyFactor < 1.15 ||
    windSpeedKmh >= 50 ||
    sandSurfaceTempC >= 50 ||
    visibilityM <= 80
  ) {
    riskLevel = 'high';
  } else if (
    avalancheSlipSafetyFactor < 1.38 ||
    windSpeedKmh >= 28 ||
    sandSurfaceTempC >= 40 ||
    visibilityM <= 250
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. routingStrategy
  const strategyMap: Record<
    YardangNavigationAnalysis['riskLevel'],
    YardangNavigationAnalysis['routingStrategy']
  > = {
    critical: 'abort-haboob-sheltered-lee-trench',
    high: 'diagonal-switchback-avoid-leeward-horn',
    moderate: 'inter-yardang-gassi-corridor-bearing',
    low: 'follow-windward-stoss-ridge',
  };

  const routingStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (avalancheSlipSafetyFactor < 0.98 || windSpeedKmh >= 75) {
    warnings.push(
      `CRITICAL 34° SLIP-FACE GRAINFLOW AVALANCHE & VENTURI HABOOB (safety factor = ${avalancheSlipSafetyFactor}, wind ${windSpeedKmh} km/h at ${venturiWindAccelerationRatio}x Venturi amplification): Leeward cornice exceeds angle of repose; uncompacted sand will shear in full-slope slab grainflows.`
    );
  } else if (avalancheSlipSafetyFactor < 1.15 || windSpeedKmh >= 50) {
    warnings.push(
      `HIGH LEEWARD SLIP-FACE INSTABILITY & SALTATION BLAST (safety factor = ${avalancheSlipSafetyFactor} at ${slipFaceAngleDeg}°, ${venturiWindAccelerationRatio}x Venturi wind ratio): Steep leeward dune faces and narrow yardang throats risk ankle-burying sand slides (${strideSinkageEnergyMultiplier}x stride energy).`
    );
  } else if (avalancheSlipSafetyFactor < 1.38 || windSpeedKmh >= 28) {
    warnings.push(
      `Moderate slip-face sinkage and inter-yardang Venturi channeling (safety factor = ${avalancheSlipSafetyFactor}, ${venturiWindAccelerationRatio}x wind acceleration): Avoid traversing directly beneath overhanging yardang prows or steep leeward dune crests.`
    );
  }

  if (sandSurfaceTempC >= 60 || visibilityM <= 25) {
    warnings.push(
      `CRITICAL SURFACE THERMAL RADIATION & TRIBOELECTRIC WHITEOUT (${sandSurfaceTempC} °C sand surface, ${visibilityM} m visibility, GNSS noise ${triboelectricGnssNoiseIndex}/10): Extreme conductive heat and electrostatic dust blackout make open-corridor movement life-threatening.`
    );
  } else if (sandSurfaceTempC >= 50 || visibilityM <= 80) {
    warnings.push(
      `High surface thermal load and triboelectric GNSS degradation (${sandSurfaceTempC} °C sand temp, ${visibilityM} m visibility, noise index ${triboelectricGnssNoiseIndex}/10): Switch to optical sighting compass dead-reckoning and protect electronics inside ESD pouches.`
    );
  } else if (sandSurfaceTempC >= 40 || visibilityM <= 250) {
    warnings.push(
      `Elevated desert surface temperature and suspended dust haze (${sandSurfaceTempC} °C sand temp, ${visibilityM} m visibility): Monitor hydration every 20 minutes and log magnetic back-bearings along yardang corridors.`
    );
  }

  const recommendations: string[] = [
    `Execute ${routingStrategy} strategy immediately (slip-face safety factor: ${avalancheSlipSafetyFactor}, Venturi ratio: ${venturiWindAccelerationRatio}x, GNSS noise: ${triboelectricGnssNoiseIndex}/10).`,
    slipFaceAngleDeg >= 28
      ? `Avoid the ${slipFaceAngleDeg}° leeward slip-face (${strideSinkageEnergyMultiplier}x metabolic sinkage); ascend only wind-packed windward stoss slopes (10–18°) or hard interdune gassi gravel.`
      : `Stay on wind-compacted stoss ridges (${slipFaceAngleDeg}° slope, ${strideSinkageEnergyMultiplier}x stride cost) and maintain visual lock on yardang corridor azimuths.`,
    visibilityM <= 250 || windSpeedKmh >= 40
      ? `Seal ballistic sand goggles and P100 respirator against ${windSpeedKmh} km/h saltation (${corridorWidthM} m corridor width) and navigate via magnetic baseplate compass and pace beads.`
      : `Stage 6L insulated electrolyte reserves for ${sandSurfaceTempC} °C surface conditions and inspect undercut mudstone yardang pedestals before resting in shade.`,
  ];

  return {
    avalancheSlipSafetyFactor,
    venturiWindAccelerationRatio,
    triboelectricGnssNoiseIndex,
    strideSinkageEnergyMultiplier,
    riskLevel,
    routingStrategy,
    warnings,
    recommendations,
  };
}

export function getYardangGearChecklist(): YardangGearItem[] {
  return [...YARDANG_GEAR_CHECKLIST];
}
