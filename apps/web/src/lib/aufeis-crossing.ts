export type AufeisMorphologyType =
  | 'braided_gravel_bar_sheet_icing'
  | 'pressurized_groundwater_frost_blister'
  | 'perennial_tundra_spring_naled'
  | 'canyon_confinement_stepped_overflow'
  | 'rotten_candle_ice_ablation_apron';

export type OverflowHydrologyState =
  | 'vitreous_dry_cryolock'
  | 'active_sheet_overflow_film'
  | 'pressurized_sub_crust_slush_lens'
  | 'hollow_drained_air_cavity_vault';

export type TraversalModeType =
  | 'nordic_backcountry_ski_glide'
  | 'articulated_crampon_snowshoe'
  | 'boot_microspike_pulk_tow'
  | 'belayed_ice_screw_probe_team';

export type AufeisSafetyStatus =
  | 'nominal_cryolocked_laminar_sheet'
  | 'caution_overflow_slush_accretion_hazard'
  | 'abort_pressurized_lens_or_cavity_collapse';

export interface AufeisSite {
  id: string;
  name: string;
  region: string;
  country: string;
  elevationMeters: number;
  morphology: AufeisMorphologyType;
  typicalOverflowState: OverflowHydrologyState;
  recommendedTraversalMode: TraversalModeType;
  meanUpperCrustThicknessCm: number;
  slushWaterLensDepthCm: number;
  hydrostaticHeadKpa: number;
  typicalCavitySpanM: number;
  highlights: string[];
  bestSeason: string;
}

export interface AufeisGearItem {
  id: string;
  name: string;
  category:
    | 'ice_sounding'
    | 'slush_waterproofing'
    | 'accretion_defense'
    | 'self_extraction';
  mandatory: boolean;
  weightGrams: number;
  rationale: string;
}

export interface AufeisCalculatorInput {
  upperCrustThicknessCm: number;
  slushWaterLensDepthCm: number;
  ambientAirTempC: number;
  hydrostaticHeadKpa: number;
  travelerPlusPulkLoadKg: number;
  cavitySpanM: number;
  morphology?: AufeisMorphologyType;
  overflowState?: OverflowHydrologyState;
}

export interface AufeisCalculatorResult {
  effectiveCrustBearingMargin: number;
  slushBreakthroughProbability: number;
  skiBootIceAccretionRateMmMin: number;
  cavityVaultCollapseRiskPercent: number;
  safetyStatus: AufeisSafetyStatus;
  overflowRoutingProtocol: string;
  slushExtractionAndDeicingAdvisory: string;
}

export const AUFEIS_SITES: AufeisSite[] = [
  {
    id: 'canning-river-shublik-springs-aufeis',
    name: 'Canning River & Shublik Springs Perennial Aufeis Field',
    region: 'Brooks Range, Arctic National Wildlife Refuge, Alaska',
    country: 'USA',
    elevationMeters: 420,
    morphology: 'perennial_tundra_spring_naled',
    typicalOverflowState: 'vitreous_dry_cryolock',
    recommendedTraversalMode: 'nordic_backcountry_ski_glide',
    meanUpperCrustThicknessCm: 26,
    slushWaterLensDepthCm: 8,
    hydrostaticHeadKpa: 12,
    typicalCavitySpanM: 0.6,
    highlights: [
      'Multi-year laminated carbonate spring naled spanning 4.5 km of the upper Canning valley floor',
      'Vitreous cryolocked mid-winter glaze with isolated thermal spring vents near Shublik limestone fault lines',
      'Fast Nordic backcountry ski touring corridor when air temperatures remain below -18°C',
    ],
    bestSeason: 'February – Early April',
  },
  {
    id: 'firth-river-joe-creek-naled-corridor',
    name: 'Firth River & Joe Creek Braided Naled Sheet',
    region: 'Ivvavik National Park, Yukon',
    country: 'Canada',
    elevationMeters: 360,
    morphology: 'braided_gravel_bar_sheet_icing',
    typicalOverflowState: 'active_sheet_overflow_film',
    recommendedTraversalMode: 'articulated_crampon_snowshoe',
    meanUpperCrustThicknessCm: 15,
    slushWaterLensDepthCm: 28,
    hydrostaticHeadKpa: 24,
    typicalCavitySpanM: 1.4,
    highlights: [
      'Braided sub-permafrost discharge sheets freezing in successive 3–8 cm diurnal overflow laminations',
      'Frequent shallow amber overflow films concealed beneath wind-drifted snow veneers',
      'Requires articulated crampon snowshoes and vapor-barrier overboots to traverse wet gravel bar margins',
    ],
    bestSeason: 'Late January – March',
  },
  {
    id: 'delta-river-black-rapids-overflow-sheet',
    name: 'Delta River & Castner Creek Glacial-Spring Overflow Corridor',
    region: 'Eastern Alaska Range, Alaska',
    country: 'USA',
    elevationMeters: 690,
    morphology: 'canyon_confinement_stepped_overflow',
    typicalOverflowState: 'pressurized_sub_crust_slush_lens',
    recommendedTraversalMode: 'boot_microspike_pulk_tow',
    meanUpperCrustThicknessCm: 11,
    slushWaterLensDepthCm: 45,
    hydrostaticHeadKpa: 42,
    typicalCavitySpanM: 2.2,
    highlights: [
      'Stepped glacial groundwater overflow benches confined between moraine walls and mainstem river channels',
      'Deep sub-crust slush lenses (40–50 cm) pressurized by subglacial winter discharge pulses',
      'High ski-base flash-icing risk demanding microspike boot-packing with sealed floating pulk hulls',
    ],
    bestSeason: 'January – Mid-March',
  },
  {
    id: 'moma-valley-ulakhan-taryn-giant-naled',
    name: 'Moma River Valley Ulakhan-Taryn Great Naled',
    region: 'Chersky Range, Sakha Republic, Siberia',
    country: 'Russia',
    elevationMeters: 510,
    morphology: 'perennial_tundra_spring_naled',
    typicalOverflowState: 'vitreous_dry_cryolock',
    recommendedTraversalMode: 'nordic_backcountry_ski_glide',
    meanUpperCrustThicknessCm: 34,
    slushWaterLensDepthCm: 6,
    hydrostaticHeadKpa: 10,
    typicalCavitySpanM: 0.5,
    highlights: [
      'Largest subarctic river icing on Earth (~26 km long, up to 5–8 m cumulative ice thickness)',
      'Cryolocked high-density blue ice terraces stabilized by -40°C continental Siberian inversions',
      'Requires continuous chisel-bar sounding near active sub-talik fissure domes along the valley axis',
    ],
    bestSeason: 'December – March',
  },
  {
    id: 'macmillan-pass-hess-river-frost-blister',
    name: 'Hess River & Macmillan Pass Pressurized Frost-Blister Crossing',
    region: 'Mackenzie Mountains, Yukon/NWT',
    country: 'Canada',
    elevationMeters: 1280,
    morphology: 'pressurized_groundwater_frost_blister',
    typicalOverflowState: 'hollow_drained_air_cavity_vault',
    recommendedTraversalMode: 'belayed_ice_screw_probe_team',
    meanUpperCrustThicknessCm: 7,
    slushWaterLensDepthCm: 68,
    hydrostaticHeadKpa: 68,
    typicalCavitySpanM: 4.2,
    highlights: [
      'Up-warped hydrostatic frost-blister domes (1.5–3 m high) under >60 kPa groundwater pressure',
      'Drained air-cavity vaults with 4m+ unsupported shell spans prone to sudden brittle flexural collapse',
      'High-consequence hazard zone requiring belayed ice-screw probe teams or wide willow-bench detours',
    ],
    bestSeason: 'February – Mid-March',
  },
];

export const AUFEIS_GEAR_CHECKLIST: AufeisGearItem[] = [
  {
    id: 'graduated-chisel-tip-ice-sounding-bar',
    name: 'Graduated Chisel-Tip Steel Ice Sounding Bar (1.6m)',
    category: 'ice_sounding',
    mandatory: true,
    weightGrams: 1180,
    rationale:
      'Single vigorous strike ahead of the lead traveler differentiates solid >=15 cm vitreous naled from thin bridge shells over pressurized slush lenses or hollow air vaults.',
  },
  {
    id: 'vapor-barrier-neoprene-insulated-overboots',
    name: 'Vapor-Barrier Neoprene & Coated-Nylon Insulated Overboots',
    category: 'slush_waterproofing',
    mandatory: true,
    weightGrams: 740,
    rationale:
      'Prevents capillary wicking of 0°C overflow water into leather or fabric ski boots, averting rapid conductive frostbite when stepping into -25°C air after a slush punch-through.',
  },
  {
    id: 'ptfe-fluoropolymer-ski-base-anti-ice-scraper',
    name: 'PTFE Fluoropolymer Paste Wax & Beveled Acrylic Base De-Icing Scraper',
    category: 'accretion_defense',
    mandatory: true,
    weightGrams: 195,
    rationale:
      'Clears flash-frozen 5–15 mm basal ice plates and slush-locked NNN-BC/tech bindings within 60 seconds of exiting an active overflow sheet.',
  },
  {
    id: 'retractable-dual-ice-awls-and-throw-bag',
    name: 'Chest-Holstered Retractable Dual Ice Awls & 20m Floating Dyneema Throw Bag',
    category: 'self_extraction',
    mandatory: true,
    weightGrams: 520,
    rationale:
      'Provides immediate traction on glaze ice to crawl out of deep pressurized frost-blister trenches or collapsed river channel vaults.',
  },
  {
    id: 'tubular-22cm-express-ice-screws-and-v-threader',
    name: '2x Tubular 22cm Express Ice Screws & Abalakov V-Thread Hook',
    category: 'ice_sounding',
    mandatory: true,
    weightGrams: 340,
    rationale:
      'Serves both as a precision core-thickness gauge (verifying >18 cm solid laminar ice vs. bubbly slush interbeds) and as a belay/haul anchor for pulk extraction.',
  },
  {
    id: 'sealed-drybag-pulk-hull-and-floating-tow-tether',
    name: 'Amphibious Sealed HDPE Pulk Hull & 8m Floating Rope Tow Extension',
    category: 'slush_waterproofing',
    mandatory: true,
    weightGrams: 890,
    rationale:
      'Decouples traveler and sled point loads across wide cavity spans while ensuring expedition sleeping gear stays buoyant and dry during slush trench submersion.',
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function getAllAufeisSites(): AufeisSite[] {
  return AUFEIS_SITES;
}

export function getAufeisSiteById(id: string): AufeisSite | undefined {
  return AUFEIS_SITES.find((site) => site.id === id);
}

export function filterAufeisSites(filters?: {
  morphology?: AufeisMorphologyType;
  overflowState?: OverflowHydrologyState;
  traversalMode?: TraversalModeType;
}): AufeisSite[] {
  if (!filters) {
    return AUFEIS_SITES;
  }

  return AUFEIS_SITES.filter((site) => {
    if (filters.morphology && site.morphology !== filters.morphology) {
      return false;
    }
    if (
      filters.overflowState &&
      site.typicalOverflowState !== filters.overflowState
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

export function getAufeisGearChecklist(): AufeisGearItem[] {
  return AUFEIS_GEAR_CHECKLIST;
}

const MORPHOLOGY_STRUCTURAL_FACTORS: Record<AufeisMorphologyType, number> = {
  perennial_tundra_spring_naled: 1.2,
  braided_gravel_bar_sheet_icing: 1.05,
  canyon_confinement_stepped_overflow: 0.85,
  pressurized_groundwater_frost_blister: 0.62,
  rotten_candle_ice_ablation_apron: 0.5,
};

export function calculateAufeisCrossingSafety(
  input: AufeisCalculatorInput
): AufeisCalculatorResult {
  const {
    upperCrustThicknessCm,
    slushWaterLensDepthCm,
    ambientAirTempC,
    hydrostaticHeadKpa,
    travelerPlusPulkLoadKg,
    cavitySpanM,
    morphology,
    overflowState,
  } = input;

  if (
    !Number.isFinite(upperCrustThicknessCm) ||
    upperCrustThicknessCm < 1 ||
    upperCrustThicknessCm > 150
  ) {
    throw new Error(
      'Invalid upperCrustThicknessCm: must be between 1 and 150 cm.'
    );
  }
  if (
    !Number.isFinite(slushWaterLensDepthCm) ||
    slushWaterLensDepthCm < 0 ||
    slushWaterLensDepthCm > 250
  ) {
    throw new Error(
      'Invalid slushWaterLensDepthCm: must be between 0 and 250 cm.'
    );
  }
  if (
    !Number.isFinite(ambientAirTempC) ||
    ambientAirTempC < -55 ||
    ambientAirTempC > 15
  ) {
    throw new Error('Invalid ambientAirTempC: must be between -55 and 15 °C.');
  }
  if (
    !Number.isFinite(hydrostaticHeadKpa) ||
    hydrostaticHeadKpa < 0 ||
    hydrostaticHeadKpa > 150
  ) {
    throw new Error(
      'Invalid hydrostaticHeadKpa: must be between 0 and 150 kPa.'
    );
  }
  if (
    !Number.isFinite(travelerPlusPulkLoadKg) ||
    travelerPlusPulkLoadKg < 30 ||
    travelerPlusPulkLoadKg > 250
  ) {
    throw new Error(
      'Invalid travelerPlusPulkLoadKg: must be between 30 and 250 kg.'
    );
  }
  if (!Number.isFinite(cavitySpanM) || cavitySpanM < 0 || cavitySpanM > 15) {
    throw new Error('Invalid cavitySpanM: must be between 0 and 15 m.');
  }

  const morphologyFactor = morphology
    ? MORPHOLOGY_STRUCTURAL_FACTORS[morphology]
    : 0.95;

  const rawBearingMargin =
    (upperCrustThicknessCm / Math.max(6, travelerPlusPulkLoadKg * 0.085)) *
    morphologyFactor *
    Math.max(0.45, 1 - hydrostaticHeadKpa / 160 - cavitySpanM * 0.11);

  const effectiveCrustBearingMargin = roundTo(
    clamp(rawBearingMargin, 0.15, 5.0),
    2
  );

  const rawBreakthroughProb =
    0.86 -
    effectiveCrustBearingMargin * 0.34 +
    (slushWaterLensDepthCm / 220) * 0.25 +
    (hydrostaticHeadKpa / 180) * 0.22;

  const slushBreakthroughProbability = roundTo(
    clamp(rawBreakthroughProb, 0.02, 0.98),
    2
  );

  const hasWetOverflowOrLens =
    slushWaterLensDepthCm > 4 ||
    overflowState === 'active_sheet_overflow_film' ||
    overflowState === 'pressurized_sub_crust_slush_lens';

  const rawAccretionRate = hasWetOverflowOrLens
    ? Math.max(0.5, -ambientAirTempC * 0.38 + slushWaterLensDepthCm * 0.09)
    : Math.max(0.1, -ambientAirTempC * 0.04);

  const skiBootIceAccretionRateMmMin = roundTo(
    clamp(rawAccretionRate, 0.1, 25.0),
    1
  );

  const rawVaultCollapse =
    8 +
    cavitySpanM * 18.5 +
    hydrostaticHeadKpa * 0.55 -
    upperCrustThicknessCm * 1.1 +
    (overflowState === 'hollow_drained_air_cavity_vault' ? 24 : 0);

  const cavityVaultCollapseRiskPercent = roundTo(
    clamp(rawVaultCollapse, 2, 99),
    1
  );

  let safetyStatus: AufeisSafetyStatus;
  if (
    effectiveCrustBearingMargin < 1.15 ||
    slushBreakthroughProbability >= 0.55 ||
    cavityVaultCollapseRiskPercent >= 62 ||
    hydrostaticHeadKpa >= 55
  ) {
    safetyStatus = 'abort_pressurized_lens_or_cavity_collapse';
  } else if (
    effectiveCrustBearingMargin < 1.85 ||
    slushBreakthroughProbability >= 0.26 ||
    skiBootIceAccretionRateMmMin >= 4.0 ||
    cavityVaultCollapseRiskPercent >= 32 ||
    slushWaterLensDepthCm >= 20
  ) {
    safetyStatus = 'caution_overflow_slush_accretion_hazard';
  } else {
    safetyStatus = 'nominal_cryolocked_laminar_sheet';
  }

  let overflowRoutingProtocol: string;
  let slushExtractionAndDeicingAdvisory: string;

  if (safetyStatus === 'abort_pressurized_lens_or_cavity_collapse') {
    overflowRoutingProtocol =
      'ABORT DIRECT ICING CROSSING: High risk of flexural shell collapse or pressurized groundwater eruption. Detour onto elevated riparian willow benches or gravel terraces around domed frost blisters and yellowed overflow aprons. Maintain continuous sounding-bar probing ahead of lead skier if retreating across perimeter ice.';
    slushExtractionAndDeicingAdvisory =
      'Rig 8m floating pulk tether extension and unbuckle waist harnesses before retreat. If a slush lens or hollow vault punches through, self-arrest with chest ice awls, haul sled via 22cm tubular ice screw V-thread anchor, and perform immediate dry-snow base blotting + PTFE scraping after slush contact.';
  } else if (safetyStatus === 'caution_overflow_slush_accretion_hazard') {
    overflowRoutingProtocol =
      'CAUTION — ACTIVE OVERFLOW & SLUSH LENS CORRIDOR: Advance with 1.6m graduated sounding-bar probing ahead of lead skier every 3–5 meters. Maintain 15m spacing between team members, detour around domed frost blisters and yellowed overflow aprons, and route across opaque white-blue cryolocked gravel bar ribs.';
    slushExtractionAndDeicingAdvisory =
      'Don vapor-barrier neoprene overboots and extend floating pulk tether extensions to decouple point loads. Upon any wet overflow contact, move immediately onto cold dry snow for dry-snow base blotting + PTFE scraping after slush contact to prevent concrete-hard basal ice accretion on skis and bindings.';
  } else {
    overflowRoutingProtocol =
      'NOMINAL CRYOLOCKED LAMINAR SHEET: Laminated naled exhibits adequate bearing margin for Nordic backcountry ski glide or pulk travel. Maintain routine sounding-bar probing ahead of lead skier across colour transitions, and detour around isolated domed frost blisters and yellowed overflow aprons near spring vents.';
    slushExtractionAndDeicingAdvisory =
      'Keep PTFE anti-ice scraper and vapor-barrier overboots accessible in top pack lid, with floating pulk tether extensions clipped ready. If capillary dampness is encountered, execute immediate dry-snow base blotting + PTFE scraping after slush contact before ice bonds to ski bases.';
  }

  return {
    effectiveCrustBearingMargin,
    slushBreakthroughProbability,
    skiBootIceAccretionRateMmMin,
    cavityVaultCollapseRiskPercent,
    safetyStatus,
    overflowRoutingProtocol,
    slushExtractionAndDeicingAdvisory,
  };
}
