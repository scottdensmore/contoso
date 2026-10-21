export type RockGlacierMorphologyType =
  | 'active_lobate_ice_cored_carapace'
  | 'tongue_shaped_interstitial_ice_matrix'
  | 'oversteepened_frontal_talus_apron'
  | 'thermokarst_furrow_and_ridge_labyrinth'
  | 'relict_collapsed_boulder_blockfield';

export type InterstitialIceState =
  | 'cryo_cemented_permafrost_lock'
  | 'seasonal_active_layer_thaw_lubrication'
  | 'basal_meltwater_piping_undercut'
  | 'isothermal_debris_creep_slump';

export type CarapaceTraversalTechnique =
  | 'compression_ridge_crest_hopping'
  | 'diagonal_furrow_trough_contouring'
  | 'three_point_imbricated_slab_stepping'
  | 'belayed_frontal_scarp_switchbacking';

export type RockGlacierSafetyStatus =
  | 'nominal_cryo_cemented_carapace'
  | 'caution_perched_block_and_void_hazard'
  | 'abort_oversteepened_scarp_or_thaw_rotation';

export interface RockGlacierSite {
  id: string;
  name: string;
  region: string;
  country: string;
  elevationMeters: number;
  morphology: RockGlacierMorphologyType;
  typicalIceState: InterstitialIceState;
  recommendedTechnique: CarapaceTraversalTechnique;
  meanBlockDiameterCm: number;
  slopeAngleDeg: number;
  activeLayerThawDepthCm: number;
  interstitialVoidRatioPercent: number;
  highlights: string[];
  bestSeason: string;
}

export interface RockGlacierGearItem {
  id: string;
  name: string;
  category:
    | 'ankle_tibial_armor'
    | 'block_stabilization'
    | 'void_entrapment_defense';
  mandatory: boolean;
  weightGrams: number;
  rationale: string;
}

export interface RockGlacierCalculatorInput {
  meanBlockDiameterCm: number;
  slopeAngleDeg: number;
  activeLayerThawDepthCm: number;
  interstitialVoidRatioPercent: number;
  ambientAirTempC: number;
  packWeightKg: number;
  morphology?: RockGlacierMorphologyType;
  iceState?: InterstitialIceState;
}

export interface RockGlacierCalculatorResult {
  blockRotationalStabilityIndex: number;
  perchedBlockTipProbability: number;
  subCarapaceVoidEntrapmentRiskPercent: number;
  effectiveHorizontalPaceMhr: number;
  safetyStatus: RockGlacierSafetyStatus;
  carapaceRoutingProtocol: string;
  tibialEntrapmentAndRockfallAdvisory: string;
}

export const ROCK_GLACIER_SITES: RockGlacierSite[] = [
  {
    id: 'sourdough-peak-mccarthy-creek-rock-glacier',
    name: 'Sourdough Peak & McCarthy Creek Lobate Rock Glacier',
    region: 'Wrangell-St. Elias National Park, Alaska',
    country: 'USA',
    elevationMeters: 1720,
    morphology: 'active_lobate_ice_cored_carapace',
    typicalIceState: 'cryo_cemented_permafrost_lock',
    recommendedTechnique: 'compression_ridge_crest_hopping',
    meanBlockDiameterCm: 75,
    slopeAngleDeg: 21,
    activeLayerThawDepthCm: 65,
    interstitialVoidRatioPercent: 22,
    highlights: [
      'Classic multi-lobed Nikolai Greenstone & granodiorite carapace overriding a deforming permafrost ice core',
      'Concentric arcuate compression ridges allow continuous crest-hopping above damp inter-ridge furrows',
      'Shallow sub-arctic active layer (<70 cm) keeps basal blocks firmly cryo-cemented through early autumn',
    ],
    bestSeason: 'June – Mid-September',
  },
  {
    id: 'mount-mendenhall-san-juan-imbricated-tongue',
    name: 'Mount Mendenhall & Imogene Basin Tongue-Shaped Rock Glacier',
    region: 'San Juan Mountains, Colorado',
    country: 'USA',
    elevationMeters: 3780,
    morphology: 'tongue_shaped_interstitial_ice_matrix',
    typicalIceState: 'seasonal_active_layer_thaw_lubrication',
    recommendedTechnique: 'three_point_imbricated_slab_stepping',
    meanBlockDiameterCm: 92,
    slopeAngleDeg: 27,
    activeLayerThawDepthCm: 125,
    interstitialVoidRatioPercent: 31,
    highlights: [
      'High-alpine volcanic breccia and rhyolite clast carapace flowing down an elongated glacial cirque floor',
      'Tabular imbricated slabs tilt toward the afternoon sun, lubricating interstitial silt-ice interfaces after 11:00 AM',
      'Demands three-point weight-transfer checks on every perched flat boulder before committing center of mass',
    ],
    bestSeason: 'July – Early October',
  },
  {
    id: 'muragl-upper-engadine-permafrost-carapace',
    name: 'Val Muragl & Murtèl-Corvatsch Permafrost Rock Glacier',
    region: 'Upper Engadine, Graubünden',
    country: 'Switzerland',
    elevationMeters: 2680,
    morphology: 'thermokarst_furrow_and_ridge_labyrinth',
    typicalIceState: 'basal_meltwater_piping_undercut',
    recommendedTechnique: 'diagonal_furrow_trough_contouring',
    meanBlockDiameterCm: 84,
    slopeAngleDeg: 25,
    activeLayerThawDepthCm: 145,
    interstitialVoidRatioPercent: 35,
    highlights: [
      'Extensively instrumented Alpine permafrost rock glacier featuring 4–6 m deep thermokarst furrow-and-ridge relief',
      'Audible sub-carapace meltwater piping hollows out cavernous air-ventilated chimneys beneath coarse gneiss boulders',
      'Requires basketless chromoly staff probing and diagonal trough contouring to avoid cantilevered void bridges',
    ],
    bestSeason: 'Late June – September',
  },
  {
    id: 'dos-lenguas-agua-negra-andean-cryolith-lobe',
    name: 'Glaciar de Escombros Dos Lenguas',
    region: 'Paso de Agua Negra, San Juan Andes',
    country: 'Argentina',
    elevationMeters: 4450,
    morphology: 'oversteepened_frontal_talus_apron',
    typicalIceState: 'isothermal_debris_creep_slump',
    recommendedTechnique: 'belayed_frontal_scarp_switchbacking',
    meanBlockDiameterCm: 68,
    slopeAngleDeg: 39,
    activeLayerThawDepthCm: 210,
    interstitialVoidRatioPercent: 42,
    highlights: [
      'Hyper-arid Central Andean cryogenic rock glacier terminating in a towering 38–41° angle-of-repose frontal scarp',
      'Oversteepened frontal apron sheds spontaneous boulder-roll cascades as internal ice creep pushes clasts past equilibrium',
      'Direct frontal ascent must be aborted during afternoon thaw in favor of lateral flank switchbacks or upper ridge entry',
    ],
    bestSeason: 'November – March (Austral Summer)',
  },
  {
    id: 'nesters-ridge-wheeler-peak-quartzite-blockfield',
    name: 'Wheeler Peak Cirque & Lehman Quartzite Active Rock Glacier',
    region: 'Great Basin National Park, Nevada',
    country: 'USA',
    elevationMeters: 3410,
    morphology: 'relict_collapsed_boulder_blockfield',
    typicalIceState: 'cryo_cemented_permafrost_lock',
    recommendedTechnique: 'three_point_imbricated_slab_stepping',
    meanBlockDiameterCm: 110,
    slopeAngleDeg: 19,
    activeLayerThawDepthCm: 80,
    interstitialVoidRatioPercent: 24,
    highlights: [
      'Massive angular Prospect Mountain Quartzite mega-blocks (>1 m) interlocking across a sheltered north-facing headwall',
      'High quartz surface friction when dry, punctuated by deep interstitial cold-air balch-effect vents',
      'Stiff-shank Vibram mountaineering boots and Kevlar palm gloves essential against razor-edged orthoquartzite fractures',
    ],
    bestSeason: 'July – September',
  },
];

export const ROCK_GLACIER_GEAR_CHECKLIST: RockGlacierGearItem[] = [
  {
    id: 'stiff-shank-vibram-megagrip-mountaineering-boots',
    name: 'Full/3-Quarter Shank Vibram Megagrip B2/B3 Mountaineering Boots',
    category: 'ankle_tibial_armor',
    mandatory: true,
    weightGrams: 1580,
    rationale:
      'Provides torsional midsole rigidity and high-collar malleolar protection when edging on sharp 30–40° quartzite or gneiss blocks and resists ankle inversion if a perched slab tips.',
  },
  {
    id: 'kevlar-reinforced-nitrile-palm-boulder-gloves',
    name: 'Kevlar-Stitched Nitrile-Palm Scrambling & Boulder-Stabilization Gloves',
    category: 'block_stabilization',
    mandatory: true,
    weightGrams: 135,
    rationale:
      'Protects palms and tendons from razor-sharp unweathered talus fractures during continuous three-point slab testing and emergency hand-jamming.',
  },
  {
    id: 'fixed-section-chromoly-scrambling-staff-no-baskets',
    name: 'Fixed-Wall Chromoly/7075-T6 Scrambling Staff (Snow Baskets Stripped)',
    category: 'block_stabilization',
    mandatory: true,
    weightGrams: 310,
    rationale:
      'Stripping trekking baskets prevents the shaft from wedging in interstitial boulder throats and snapping under forward momentum while probing sub-carapace voids.',
  },
  {
    id: 'uiia-certified-rockfall-and-impact-climbing-helmet',
    name: 'UIAA 106 Dual-Density EPP/ABS Side-Impact Rockfall Helmet',
    category: 'ankle_tibial_armor',
    mandatory: true,
    weightGrams: 240,
    rationale:
      'Shields cranium against spontaneous clast shedding from oversteepened (>35°) rock-glacier frontal scarps and rotational block tip-slips.',
  },
  {
    id: 'high-collar-ballistic-nylon-talus-gaiters',
    name: '1000D Ballistic Cordura Shin-Padded Talus & Scree Gaiters',
    category: 'void_entrapment_defense',
    mandatory: true,
    weightGrams: 295,
    rationale:
      'Armors the anterior tibia against shear lacerations when a foot punches through thin active-layer rubble into an interstitial permafrost chimney.',
  },
  {
    id: 'compact-dyneema-cord-and-pulley-block-extrication-kit',
    name: 'Compact 6mm Dyneema Cord, Micro-Traxion & 3:1 Z-Drag Block Extrication Kit',
    category: 'void_entrapment_defense',
    mandatory: true,
    weightGrams: 460,
    rationale:
      'Enables rapid mechanical-advantage leverage (3:1 or 5:1 haul) to shift a settled 150–300 kg carapace boulder off an entrapped boot or lower leg.',
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function getAllRockGlacierSites(): RockGlacierSite[] {
  return ROCK_GLACIER_SITES;
}

export function getRockGlacierSiteById(
  id: string
): RockGlacierSite | undefined {
  return ROCK_GLACIER_SITES.find((site) => site.id === id);
}

export function filterRockGlacierSites(filters?: {
  morphology?: RockGlacierMorphologyType;
  iceState?: InterstitialIceState;
  technique?: CarapaceTraversalTechnique;
}): RockGlacierSite[] {
  if (!filters) {
    return ROCK_GLACIER_SITES;
  }

  return ROCK_GLACIER_SITES.filter((site) => {
    if (filters.morphology && site.morphology !== filters.morphology) {
      return false;
    }
    if (filters.iceState && site.typicalIceState !== filters.iceState) {
      return false;
    }
    if (filters.technique && site.recommendedTechnique !== filters.technique) {
      return false;
    }
    return true;
  });
}

export function getRockGlacierGearChecklist(): RockGlacierGearItem[] {
  return ROCK_GLACIER_GEAR_CHECKLIST;
}

const MORPHOLOGY_STRUCTURAL_FACTORS: Record<RockGlacierMorphologyType, number> =
  {
    relict_collapsed_boulder_blockfield: 1.22,
    active_lobate_ice_cored_carapace: 1.14,
    tongue_shaped_interstitial_ice_matrix: 0.96,
    thermokarst_furrow_and_ridge_labyrinth: 0.82,
    oversteepened_frontal_talus_apron: 0.58,
  };

const ICE_STATE_FACTORS: Record<InterstitialIceState, number> = {
  cryo_cemented_permafrost_lock: 1.15,
  seasonal_active_layer_thaw_lubrication: 0.88,
  basal_meltwater_piping_undercut: 0.74,
  isothermal_debris_creep_slump: 0.58,
};

export function calculateRockGlacierNavigationSafety(
  input: RockGlacierCalculatorInput
): RockGlacierCalculatorResult {
  const {
    meanBlockDiameterCm,
    slopeAngleDeg,
    activeLayerThawDepthCm,
    interstitialVoidRatioPercent,
    ambientAirTempC,
    packWeightKg,
    morphology,
    iceState,
  } = input;

  if (
    !Number.isFinite(meanBlockDiameterCm) ||
    meanBlockDiameterCm < 15 ||
    meanBlockDiameterCm > 300
  ) {
    throw new Error(
      'Invalid meanBlockDiameterCm: must be between 15 and 300 cm.'
    );
  }
  if (
    !Number.isFinite(slopeAngleDeg) ||
    slopeAngleDeg < 5 ||
    slopeAngleDeg > 55
  ) {
    throw new Error('Invalid slopeAngleDeg: must be between 5 and 55 degrees.');
  }
  if (
    !Number.isFinite(activeLayerThawDepthCm) ||
    activeLayerThawDepthCm < 10 ||
    activeLayerThawDepthCm > 400
  ) {
    throw new Error(
      'Invalid activeLayerThawDepthCm: must be between 10 and 400 cm.'
    );
  }
  if (
    !Number.isFinite(interstitialVoidRatioPercent) ||
    interstitialVoidRatioPercent < 5 ||
    interstitialVoidRatioPercent > 65
  ) {
    throw new Error(
      'Invalid interstitialVoidRatioPercent: must be between 5 and 65%.'
    );
  }
  if (
    !Number.isFinite(ambientAirTempC) ||
    ambientAirTempC < -35 ||
    ambientAirTempC > 35
  ) {
    throw new Error(
      'Invalid ambientAirTempC: must be between -35 and 35 °C.'
    );
  }
  if (
    !Number.isFinite(packWeightKg) ||
    packWeightKg < 0 ||
    packWeightKg > 50
  ) {
    throw new Error('Invalid packWeightKg: must be between 0 and 50 kg.');
  }

  const morphologyFactor = morphology
    ? MORPHOLOGY_STRUCTURAL_FACTORS[morphology]
    : 0.95;
  const iceFactor = iceState ? ICE_STATE_FACTORS[iceState] : 0.95;

  const rawStabilityIndex =
    2.45 *
    morphologyFactor *
    iceFactor *
    (1 - (slopeAngleDeg - 15) * 0.022) *
    (1 - (activeLayerThawDepthCm / 480) * 0.35) *
    (1 - (packWeightKg / 110) * 0.18);

  const blockRotationalStabilityIndex = roundTo(
    clamp(rawStabilityIndex, 0.2, 4.5),
    2
  );

  const rawTipProb =
    0.86 -
    blockRotationalStabilityIndex * 0.33 +
    Math.max(0, ambientAirTempC) * 0.008 +
    Math.max(0, slopeAngleDeg - 26) * 0.014;

  const perchedBlockTipProbability = roundTo(
    clamp(rawTipProb, 0.03, 0.97),
    2
  );

  const rawVoidRisk =
    interstitialVoidRatioPercent * 1.45 +
    meanBlockDiameterCm / 8 +
    (iceState === 'basal_meltwater_piping_undercut' ? 16 : 0);

  const subCarapaceVoidEntrapmentRiskPercent = roundTo(
    clamp(rawVoidRisk, 5, 98),
    1
  );

  const rawPace =
    380 * Math.min(1.1, blockRotationalStabilityIndex * 0.52) -
    slopeAngleDeg * 3.6 -
    packWeightKg * 2.2 -
    interstitialVoidRatioPercent * 1.8;

  const effectiveHorizontalPaceMhr = Math.round(clamp(rawPace, 55, 380));

  let safetyStatus: RockGlacierSafetyStatus;
  if (
    blockRotationalStabilityIndex < 1.15 ||
    perchedBlockTipProbability >= 0.55 ||
    slopeAngleDeg >= 36 ||
    subCarapaceVoidEntrapmentRiskPercent >= 72
  ) {
    safetyStatus = 'abort_oversteepened_scarp_or_thaw_rotation';
  } else if (
    blockRotationalStabilityIndex < 1.8 ||
    perchedBlockTipProbability >= 0.26 ||
    subCarapaceVoidEntrapmentRiskPercent >= 46 ||
    activeLayerThawDepthCm >= 120 ||
    ambientAirTempC >= 8
  ) {
    safetyStatus = 'caution_perched_block_and_void_hazard';
  } else {
    safetyStatus = 'nominal_cryo_cemented_carapace';
  }

  let carapaceRoutingProtocol: string;
  let tibialEntrapmentAndRockfallAdvisory: string;

  if (safetyStatus === 'abort_oversteepened_scarp_or_thaw_rotation') {
    carapaceRoutingProtocol =
      'ABORT FRONTAL SCARP / THAW-SLUMP TRAVERSAL: Oversteepened (>35°) frontal talus scarps or isothermal active-layer thaw-slump conditions create imminent block rotation and cascade rockfall. Retreat laterally off the frontal apron and bypass via stable bedrock moraine shoulders or upper compression ridges.';
    tibialEntrapmentAndRockfallAdvisory =
      'Do not ascend or descend directly in the fall-line of the frontal scarp. Strip all pole baskets so shafts do not jam between shifting boulders, test tabular blocks before committing center of mass, and enforce strict 15 m diagonal spacing with UIAA rockfall helmets and 3:1 Dyneema extrication cord ready.';
  } else if (safetyStatus === 'caution_perched_block_and_void_hazard') {
    carapaceRoutingProtocol =
      'CAUTION — ACTIVE-LAYER THAW & SUB-CARAPACE PIPING VOIDS: Midday solar thaw or basal meltwater piping is lubricating interstitial ice matrices. Route along upper compression ridge crests or contour diagonally across shallow furrows rather than dropping into deep thermokarst troughs or oversteepened (>35°) frontal talus scarps.';
    tibialEntrapmentAndRockfallAdvisory =
      'Strip pole baskets immediately to prevent shaft jamming in boulder throats. Probe dark interstitial chimneys for acoustic meltwater piping, test every tabular block with a 3-point tap before committing center of mass, and maintain diagonal spacing between climbers to prevent cascade rockfall and tibial pinching.';
  } else {
    carapaceRoutingProtocol =
      'NOMINAL CRYO-CEMENTED CARAPACE CORRIDOR: Sub-freezing interstitial permafrost lock and moderate slope angle support efficient compression ridge crest-hopping. Stay atop consolidated upper compression ridges and avoid descending oversteepened (>35°) frontal talus scarps.';
    tibialEntrapmentAndRockfallAdvisory =
      'Keep pole baskets stripped so shafts do not jam between angular clasts. Even on cryo-cemented carapaces, test tabular blocks before committing center of mass, wear stiff-shank boots with ballistic talus gaiters to guard against tibial void entrapment, and maintain diagonal spacing on pitched slopes.';
  }

  return {
    blockRotationalStabilityIndex,
    perchedBlockTipProbability,
    subCarapaceVoidEntrapmentRiskPercent,
    effectiveHorizontalPaceMhr,
    safetyStatus,
    carapaceRoutingProtocol,
    tibialEntrapmentAndRockfallAdvisory,
  };
}
