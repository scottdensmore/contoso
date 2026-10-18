export type EvaporiteCrustType =
  | 'polygonal_halite_pressure_ridge'
  | 'desiccated_argillaceous_hardpan'
  | 'puffy_gypsum_efflorescent_crust'
  | 'wet_capillary_brine_salar_margin'
  | 'subsurface_liquefied_silt_dome';

export type AtmosphericRefractionState =
  | 'predawn_isothermal_clarity'
  | 'inferior_shimmer_horizon_collapse'
  | 'fata_morgana_vertical_loom'
  | 'haboob_halite_aerosol_whiteout';

export type PlayaTraversalMode =
  | 'wide_tire_desert_expedition_cart'
  | 'foot_trek_distributed_sand_sandals'
  | 'fat_tire_bikepacking_low_psi'
  | 'belayed_crust_sounding_probe_team';

export type SaltPanSafetyStatus =
  | 'nominal_crystalline_halite_corridor'
  | 'caution_mirage_azimuth_drift_and_brine_crust'
  | 'abort_subsurface_brine_mud_breakthrough';

export interface SaltPanSite {
  id: string;
  name: string;
  region: string;
  country: string;
  elevationMeters: number;
  crustType: EvaporiteCrustType;
  typicalRefractionState: AtmosphericRefractionState;
  recommendedTraversalMode: PlayaTraversalMode;
  meanHaliteCrustThicknessCm: number;
  waterTableDepthCm: number;
  typicalSurfaceAirTempC: number;
  typicalGroundSkinTempC: number;
  highlights: string[];
  bestSeason: string;
}

export interface SaltPanGearItem {
  id: string;
  name: string;
  category:
    | 'crust_sounding'
    | 'optical_navigation'
    | 'albedo_eye_protection'
    | 'mire_extraction';
  mandatory: boolean;
  weightGrams: number;
  rationale: string;
}

export interface SaltPanCalculatorInput {
  haliteCrustThicknessCm: number;
  waterTableDepthCm: number;
  surfaceAirTempC: number;
  groundSkinTempC: number;
  totalTravelerLoadKg: number;
  targetSightingDistanceKm: number;
  crustType?: EvaporiteCrustType;
  refractionState?: AtmosphericRefractionState;
}

export interface SaltPanCalculatorResult {
  crustBearingSafetyFactor: number;
  brineMudBreakthroughProbability: number;
  mirageHorizonDipErrorDeg: number;
  effectiveVisualRangeKm: number;
  safetyStatus: SaltPanSafetyStatus;
  deadReckoningRoutingProtocol: string;
  crustSoundingAndExtractionAdvisory: string;
}

export const SALT_PAN_SITES: SaltPanSite[] = [
  {
    id: 'salar-de-uyuni-incahuasi-halite-polygon-basin',
    name: 'Salar de Uyuni & Isla Incahuasi Polygonal Halite Core',
    region: 'Daniel Campos Province, Potosí',
    country: 'Bolivia',
    elevationMeters: 3656,
    crustType: 'polygonal_halite_pressure_ridge',
    typicalRefractionState: 'predawn_isothermal_clarity',
    recommendedTraversalMode: 'wide_tire_desert_expedition_cart',
    meanHaliteCrustThicknessCm: 38,
    waterTableDepthCm: 45,
    typicalSurfaceAirTempC: 14,
    typicalGroundSkinTempC: 22,
    highlights: [
      '10,582 km² high-altitude interlocking halite polygon plate over pressurized lithium-rich brine',
      'Extreme UV + 0.85 crystalline albedo demanding Category 4 wrap glare shields',
      'Predawn isothermal horizon clarity transitioning to midday inferior shimmer towards Isla Incahuasi',
    ],
    bestSeason: 'May – October (Austral Dry Season)',
  },
  {
    id: 'badwater-devils-golf-course-halite-pan',
    name: "Badwater Basin & Devil's Golf Course Serrated Halite Pan",
    region: 'Death Valley National Park, California',
    country: 'USA',
    elevationMeters: -86,
    crustType: 'puffy_gypsum_efflorescent_crust',
    typicalRefractionState: 'inferior_shimmer_horizon_collapse',
    recommendedTraversalMode: 'foot_trek_distributed_sand_sandals',
    meanHaliteCrustThicknessCm: 16,
    waterTableDepthCm: 28,
    typicalSurfaceAirTempC: 39,
    typicalGroundSkinTempC: 58,
    highlights: [
      'Lowest evaporite basin in North America (-86 m) bordered by capillary gypsum-glauberite margins',
      'Severe ground-to-air superadiabatic lapse (>19°C delta) collapsing visual horizons under 2.5 km',
      'Serrated acoustic halite spires interleaved with soft efflorescent gypsum domes over saline mud',
    ],
    bestSeason: 'November – Early March',
  },
  {
    id: 'makgadikgadi-ntwetwe-sua-salt-pan-traverse',
    name: 'Makgadikgadi Ntwetwe & Sua Evaporite Pan Traverse',
    region: 'Central Kalahari Basin',
    country: 'Botswana',
    elevationMeters: 905,
    crustType: 'desiccated_argillaceous_hardpan',
    typicalRefractionState: 'fata_morgana_vertical_loom',
    recommendedTraversalMode: 'fat_tire_bikepacking_low_psi',
    meanHaliteCrustThicknessCm: 24,
    waterTableDepthCm: 35,
    typicalSurfaceAirTempC: 34,
    typicalGroundSkinTempC: 51,
    highlights: [
      'Relict Paleolake Makgadikgadi carbonate-silcrete and argillaceous salt hardpan spanning 16,000 km²',
      'Pronounced Fata Morgana vertical looming that detachedly inverts Kubu Island granite outcrops',
      'Ideal low-PSI (6–9 psi) fat-tire bikepacking corridor when dry winter trade winds stabilize crust',
    ],
    bestSeason: 'June – September',
  },
  {
    id: 'chott-el-djerid-ephemeral-mirage-salar',
    name: 'Chott el Djerid Ephemeral Gypsum-Brine Sebkha',
    region: 'Tozeur & Kebili Governorates, Southern Tunisia',
    country: 'Tunisia',
    elevationMeters: 15,
    crustType: 'subsurface_liquefied_silt_dome',
    typicalRefractionState: 'fata_morgana_vertical_loom',
    recommendedTraversalMode: 'belayed_crust_sounding_probe_team',
    meanHaliteCrustThicknessCm: 7,
    waterTableDepthCm: 9,
    typicalSurfaceAirTempC: 37,
    typicalGroundSkinTempC: 55,
    highlights: [
      'Endorheic Sahara sebkha notorious for thin 5–9 cm gypsum crusts concealing bottomless thixotropic chott mud',
      'Shallow artesian brine water table (<10 cm) creating treacherous dark capillary rings (aioun)',
      'Requires roped crust-sounding probe intervals and high-flotation extraction boards outside marked causeways',
    ],
    bestSeason: 'December – February',
  },
  {
    id: 'bonneville-salt-flats-wendover-crust-corridor',
    name: 'Bonneville Salt Flats & Silver Island Halite Crust Corridor',
    region: 'Great Salt Lake Desert, Utah',
    country: 'USA',
    elevationMeters: 1286,
    crustType: 'wet_capillary_brine_salar_margin',
    typicalRefractionState: 'inferior_shimmer_horizon_collapse',
    recommendedTraversalMode: 'wide_tire_desert_expedition_cart',
    meanHaliteCrustThicknessCm: 14,
    waterTableDepthCm: 19,
    typicalSurfaceAirTempC: 31,
    typicalGroundSkinTempC: 44,
    highlights: [
      'Pliocene Lake Bonneville evaporite pan tapering from 1.5 m central halite lens to <5 cm wet clay margins',
      'Strong inferior mirage azimuth shimmer obscuring Floating Island and Silver Island Range bearings',
      'Susceptible to rapid capillary brine wicking after late-summer Great Basin thunderhead outflows',
    ],
    bestSeason: 'August – October (Late Summer Desiccation)',
  },
];

export const SALT_PAN_GEAR_CHECKLIST: SaltPanGearItem[] = [
  {
    id: 'graduated-stainless-evaporite-crust-core-auger',
    name: 'Graduated Stainless Evaporite Crust Core Auger & T-Probe (1.2m)',
    category: 'crust_sounding',
    mandatory: true,
    weightGrams: 860,
    rationale:
      'Drills and probes ahead of lead traveler at dark damp capillary transitions to verify solid crystalline halite thickness (>15 cm) before stepping over thixotropic brine mud.',
  },
  {
    id: 'fluid-damped-prismatic-sighting-compass-and-sun-compass',
    name: 'Fluid-Damped Prismatic Sighting Compass & Bagnold Solar Azimuth Dial',
    category: 'optical_navigation',
    mandatory: true,
    weightGrams: 310,
    rationale:
      'Maintains sub-degree dead-reckoning headings across featureless 360° white pans when inferior shimmer or Fata Morgana vertical looming obscures distant horizon landmarks.',
  },
  {
    id: 'polarized-category-4-wrap-glare-shields',
    name: 'Polarized Category 4 (5% VLT) Side-Shielded Albedo Glare Goggles',
    category: 'albedo_eye_protection',
    mandatory: true,
    weightGrams: 145,
    rationale:
      'Blocks omnidirectional 80–85% shortwave UV reflection off crystalline halite polygons to prevent acute photokeratitis (salt-pan snow blindness) and preserve horizon contrast.',
  },
  {
    id: 'collapsible-high-flotation-brine-mud-extraction-boards',
    name: 'Collapsible High-Flotation Composite Brine-Mud Extraction Boards (Pair)',
    category: 'mire_extraction',
    mandatory: true,
    weightGrams: 1420,
    rationale:
      'Distributes traveler or expedition cart ground pressure below 12 kPa to bridge fractured gypsum crusts and lever sunken wheels or boots out of liquefied clay-brine mires.',
  },
  {
    id: 'dual-band-gnss-inreach-beacon-and-paper-utm-grid',
    name: 'Dual-Band L1/L5 GNSS Satellite Communicator & Laminated UTM Salar Chart',
    category: 'optical_navigation',
    mandatory: true,
    weightGrams: 290,
    rationale:
      'Cross-checks prismatic compass pace counts against multi-constellation GNSS waypoints to eliminate lateral drift toward unmapped spring vents (ojos del salar).',
  },
  {
    id: 'ptfe-coated-halite-resistant-gaiters-and-barrier-salve',
    name: 'PTFE-Coated Halite-Guard Ankle Gaiters & Anhydrous Lanolin Barrier Salve',
    category: 'mire_extraction',
    mandatory: true,
    weightGrams: 260,
    rationale:
      'Prevents razor-sharp halite pressure ridges and hyper-saline capillary brine (280+ g/L TDS) from abrading and chemically desiccating skin and boot stitching.',
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function getAllSaltPanSites(): SaltPanSite[] {
  return SALT_PAN_SITES;
}

export function getSaltPanSiteById(id: string): SaltPanSite | undefined {
  return SALT_PAN_SITES.find((site) => site.id === id);
}

export function filterSaltPanSites(filters?: {
  crustType?: EvaporiteCrustType;
  refractionState?: AtmosphericRefractionState;
  traversalMode?: PlayaTraversalMode;
}): SaltPanSite[] {
  if (!filters) {
    return SALT_PAN_SITES;
  }

  return SALT_PAN_SITES.filter((site) => {
    if (filters.crustType && site.crustType !== filters.crustType) {
      return false;
    }
    if (
      filters.refractionState &&
      site.typicalRefractionState !== filters.refractionState
    ) {
      return false;
    }
    if (
      filters.traversalMode &&
      site.recommendedTraversalMode !== filters.traversalMode
    ) {
      return false;
    }
    return true;
  });
}

export function getSaltPanGearChecklist(): SaltPanGearItem[] {
  return SALT_PAN_GEAR_CHECKLIST;
}

const CRUST_STRUCTURAL_FACTORS: Record<EvaporiteCrustType, number> = {
  polygonal_halite_pressure_ridge: 1.25,
  desiccated_argillaceous_hardpan: 1.05,
  puffy_gypsum_efflorescent_crust: 0.78,
  wet_capillary_brine_salar_margin: 0.58,
  subsurface_liquefied_silt_dome: 0.42,
};

export function calculateSaltPanNavigationSafety(
  input: SaltPanCalculatorInput
): SaltPanCalculatorResult {
  const {
    haliteCrustThicknessCm,
    waterTableDepthCm,
    surfaceAirTempC,
    groundSkinTempC,
    totalTravelerLoadKg,
    targetSightingDistanceKm,
    crustType,
    refractionState,
  } = input;

  if (
    !Number.isFinite(haliteCrustThicknessCm) ||
    haliteCrustThicknessCm < 1 ||
    haliteCrustThicknessCm > 150
  ) {
    throw new Error(
      'Invalid haliteCrustThicknessCm: must be between 1 and 150 cm.'
    );
  }
  if (
    !Number.isFinite(waterTableDepthCm) ||
    waterTableDepthCm < 0 ||
    waterTableDepthCm > 250
  ) {
    throw new Error(
      'Invalid waterTableDepthCm: must be between 0 and 250 cm.'
    );
  }
  if (
    !Number.isFinite(surfaceAirTempC) ||
    surfaceAirTempC < -15 ||
    surfaceAirTempC > 60
  ) {
    throw new Error(
      'Invalid surfaceAirTempC: must be between -15 and 60 °C.'
    );
  }
  if (
    !Number.isFinite(groundSkinTempC) ||
    groundSkinTempC < -15 ||
    groundSkinTempC > 85
  ) {
    throw new Error(
      'Invalid groundSkinTempC: must be between -15 and 85 °C.'
    );
  }
  if (
    !Number.isFinite(totalTravelerLoadKg) ||
    totalTravelerLoadKg < 30 ||
    totalTravelerLoadKg > 300
  ) {
    throw new Error(
      'Invalid totalTravelerLoadKg: must be between 30 and 300 kg.'
    );
  }
  if (
    !Number.isFinite(targetSightingDistanceKm) ||
    targetSightingDistanceKm < 0.5 ||
    targetSightingDistanceKm > 50
  ) {
    throw new Error(
      'Invalid targetSightingDistanceKm: must be between 0.5 and 50 km.'
    );
  }

  const crustFactor = crustType
    ? CRUST_STRUCTURAL_FACTORS[crustType]
    : 0.92;

  const rawSafetyFactor =
    (haliteCrustThicknessCm / Math.max(6, totalTravelerLoadKg * 0.08)) *
    crustFactor *
    Math.min(1.15, 0.55 + waterTableDepthCm / 65);

  const crustBearingSafetyFactor = roundTo(
    clamp(rawSafetyFactor, 0.15, 5.0),
    2
  );

  const rawBreakthroughProb =
    0.88 -
    crustBearingSafetyFactor * 0.35 +
    Math.max(0, 25 - waterTableDepthCm) * 0.012;

  const brineMudBreakthroughProbability = roundTo(
    clamp(rawBreakthroughProb, 0.02, 0.98),
    2
  );

  const tempDelta = Math.max(0, groundSkinTempC - surfaceAirTempC);

  const rawDipError =
    0.08 +
    tempDelta * 0.065 +
    (refractionState === 'fata_morgana_vertical_loom'
      ? 0.45
      : refractionState === 'inferior_shimmer_horizon_collapse'
        ? 0.3
        : 0);

  const mirageHorizonDipErrorDeg = roundTo(
    clamp(rawDipError, 0.05, 3.5),
    2
  );

  const rawVisualRange =
    targetSightingDistanceKm /
    (1 +
      tempDelta * 0.09 +
      (refractionState === 'haboob_halite_aerosol_whiteout' ? 2.8 : 0));

  const effectiveVisualRangeKm = roundTo(
    clamp(rawVisualRange, 0.4, targetSightingDistanceKm),
    1
  );

  let safetyStatus: SaltPanSafetyStatus;
  if (
    crustBearingSafetyFactor < 1.15 ||
    brineMudBreakthroughProbability >= 0.55 ||
    waterTableDepthCm <= 10 ||
    refractionState === 'haboob_halite_aerosol_whiteout'
  ) {
    safetyStatus = 'abort_subsurface_brine_mud_breakthrough';
  } else if (
    crustBearingSafetyFactor < 1.85 ||
    brineMudBreakthroughProbability >= 0.25 ||
    mirageHorizonDipErrorDeg >= 0.85 ||
    effectiveVisualRangeKm < 3.5 ||
    waterTableDepthCm <= 22
  ) {
    safetyStatus = 'caution_mirage_azimuth_drift_and_brine_crust';
  } else {
    safetyStatus = 'nominal_crystalline_halite_corridor';
  }

  let deadReckoningRoutingProtocol: string;
  let crustSoundingAndExtractionAdvisory: string;

  if (safetyStatus === 'abort_subsurface_brine_mud_breakthrough') {
    deadReckoningRoutingProtocol =
      'ABORT PLAYA TRAVERSAL: Critical subsurface brine-mud punch-through risk or zero-visibility halite haboob whiteout. Lock in reverse back-azimuth on your fluid-damped prismatic sighting compass + dual-band GNSS waypoint track immediately; do not rely on visual horizon features distorted by Fata Morgana or aerosol glare.';
    crustSoundingAndExtractionAdvisory =
      'Halt forward progress across dark damp capillary margins or puffed silt domes. Deploy collapsible high-flotation extraction boards beneath feet or cart wheels to distribute footprint load, probe retreat path every 2 meters with the graduated stainless crust core auger, and avoid open brine vents (ojos del salar).';
  } else if (
    safetyStatus === 'caution_mirage_azimuth_drift_and_brine_crust'
  ) {
    deadReckoningRoutingProtocol =
      'CAUTION — MIRAGE REFRACTION & CAPILLARY CRUST DRIFT: Superadiabatic ground heating or inferior shimmer is distorting distant salar islands. Navigate strictly by fluid-damped prismatic compass + dual-band GNSS dead-reckoning at 500 m pace-counted intervals rather than chasing shimmering false-water horizons.';
    crustSoundingAndExtractionAdvisory =
      'Stop and core-sound with the graduated stainless auger whenever crossing from white polygonal halite into tan efflorescent gypsum or dark damp capillary brine margins. Lower tire pressure or don wide-distribution sandals, and keep high-flotation extraction boards unstrapped for immediate self-recovery.';
  } else {
    deadReckoningRoutingProtocol =
      'NOMINAL CRYSTALLINE HALITE CORRIDOR: Interlocking polygonal halite crust and low thermal lapse support direct traversal. Log baseline prismatic sighting compass bearings and dual-band GNSS waypoints during predawn clarity before solar heating induces midday inferior mirage drift.';
    crustSoundingAndExtractionAdvisory =
      'Maintain routine auger sounding at polygon pressure-ridge junctions and damp color transitions. Keep Category 4 polarized glare shields on at all times and carry collapsible extraction boards accessible on the rear deck in case isolated subsurface brine pockets are encountered.';
  }

  return {
    crustBearingSafetyFactor,
    brineMudBreakthroughProbability,
    mirageHorizonDipErrorDeg,
    effectiveVisualRangeKm,
    safetyStatus,
    deadReckoningRoutingProtocol,
    crustSoundingAndExtractionAdvisory,
  };
}
