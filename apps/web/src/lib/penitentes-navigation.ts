export type AblationMorphologyType =
  | 'shallow_parabolic_suncup_matrix'
  | 'deep_suncup_crest_labyrinth'
  | 'juvenile_micropenitente_serrations'
  | 'mature_cathedral_nieves_penitentes'
  | 'rotten_basal_moat_undercut_field';

export type CramponTraversalTechnique =
  | 'solar_azimuth_trough_corridor_gliding'
  | 'crest_ridge_step_bridging'
  | 'hybrid_frontpoint_stemming'
  | 'axe_belayed_blade_threading';

export type DiurnalFreezeState =
  | 'predawn_vitreous_lockup'
  | 'midmorning_crust_softening'
  | 'solar_noon_slush_collapse'
  | 'late_afternoon_isothermal_rot';

export type PenitentesSafetyStatus =
  | 'optimal_predawn_frozen_corridor'
  | 'caution_crampon_balling_and_ankle_torque'
  | 'abort_isothermal_blade_collapse';

export interface PenitentesSite {
  id: string;
  name: string;
  region: string;
  country: string;
  elevationMeters: number;
  latitudeDegrees: number;
  ablationMorphology: AblationMorphologyType;
  recommendedTechnique: CramponTraversalTechnique;
  typicalDiurnalFreezeState: DiurnalFreezeState;
  meanBladeHeightCm: number;
  troughCorridorAzimuthDeg: number;
  slopeAngleDeg: number;
  highlights: string[];
  bestSeason: string;
}

export interface PenitentesGearItem {
  id: string;
  name: string;
  category:
    | 'crampon_traction'
    | 'lower_limb_armor'
    | 'ice_axe_arrest'
    | 'solar_glare_protection';
  mandatory: boolean;
  weightGrams: number;
  rationale: string;
}

export interface PenitentesCalculatorInput {
  bladeHeightCm: number;
  troughSpacingCm: number;
  slopeAngleDeg: number;
  snowSurfaceTempC: number;
  solarIrradianceWm2: number;
  packWeightKg: number;
  ablationMorphology?: AblationMorphologyType;
}

export interface PenitentesCalculatorResult {
  effectiveHorizontalPaceMhr: number;
  caloricEnergyMultiplier: number;
  cramponAntibotBallingRiskPercent: number;
  bladeMoatCollapseProbability: number;
  safetyStatus: PenitentesSafetyStatus;
  solarAzimuthRoutingProtocol: string;
  ankleTorqueAndShinArmorAdvisory: string;
}

export const PENITENTES_SITES: PenitentesSite[] = [
  {
    id: 'aconcagua-polish-glacier-penitentes',
    name: 'Aconcagua Polish Glacier & Upper Guanacos Penitentes Labyrinth',
    region: 'Central Andes, Mendoza',
    country: 'Argentina',
    elevationMeters: 6150,
    latitudeDegrees: -32.6532,
    ablationMorphology: 'mature_cathedral_nieves_penitentes',
    recommendedTechnique: 'axe_belayed_blade_threading',
    typicalDiurnalFreezeState: 'predawn_vitreous_lockup',
    meanBladeHeightCm: 185,
    troughCorridorAzimuthDeg: 82,
    slopeAngleDeg: 34,
    highlights: [
      'Sublimation-sculpted 1.8m ice spires tilted toward the subtropical solar arc',
      'Narrow east-west trough corridors requiring sideways pack alignment and axe belays',
      'Vitreous predawn ice crust that locks crampon frontpoints until 09:30 local solar time',
    ],
    bestSeason: 'December – February (Austral Summer)',
  },
  {
    id: 'mount-rainier-muir-snowfield-suncups',
    name: 'Mount Rainier Late-Summer Muir Snowfield Sun-Cup Matrix',
    region: 'Cascade Range, Washington',
    country: 'USA',
    elevationMeters: 2950,
    latitudeDegrees: 46.8355,
    ablationMorphology: 'deep_suncup_crest_labyrinth',
    recommendedTechnique: 'crest_ridge_step_bridging',
    typicalDiurnalFreezeState: 'midmorning_crust_softening',
    meanBladeHeightCm: 55,
    troughCorridorAzimuthDeg: 98,
    slopeAngleDeg: 24,
    highlights: [
      'Hexagonal parabolic ablation bowls up to 60cm deep with narrow sinter-frozen rims',
      'High ankle-inversion hazard if stepping off sun-cup ridges into softened meltwater cups',
      'Rapid midmorning transition to sticky wet-snow balling under 12-point steel crampons',
    ],
    bestSeason: 'Late July – September',
  },
  {
    id: 'tupungato-high-puna-ice-pinnacles',
    name: 'Volcán Tupungato High-Puna Cathedral Penitente Forest',
    region: 'Dry Central Andes',
    country: 'Chile/Argentina Border',
    elevationMeters: 5800,
    latitudeDegrees: -33.3583,
    ablationMorphology: 'mature_cathedral_nieves_penitentes',
    recommendedTechnique: 'hybrid_frontpoint_stemming',
    typicalDiurnalFreezeState: 'predawn_vitreous_lockup',
    meanBladeHeightCm: 240,
    troughCorridorAzimuthDeg: 78,
    slopeAngleDeg: 31,
    highlights: [
      'Extreme hyper-arid dew-point depression producing 2.4m overhanging ice daggers',
      'Chimney-style crampon stemming between parallel blade walls over concealed basal moats',
      'Severe acoustic and line-of-sight isolation inside overhead penitente galleries',
    ],
    bestSeason: 'January – March',
  },
  {
    id: 'mount-shasta-avalanche-gulch-suncups',
    name: 'Mount Shasta Avalanche Gulch & Red Banks Sun-Cup Troughs',
    region: 'Southern Cascades, California',
    country: 'USA',
    elevationMeters: 3650,
    latitudeDegrees: 41.4092,
    ablationMorphology: 'shallow_parabolic_suncup_matrix',
    recommendedTechnique: 'solar_azimuth_trough_corridor_gliding',
    typicalDiurnalFreezeState: 'midmorning_crust_softening',
    meanBladeHeightCm: 38,
    troughCorridorAzimuthDeg: 105,
    slopeAngleDeg: 32,
    highlights: [
      'Coalesced east-west solar ablation ripples below the Red Banks couloirs',
      'Efficient rhythmic step-gliding when following natural 105° solar trough grooves',
      'Rime-scoured volcanic grit accelerating solar radiation absorption in cup basins',
    ],
    bestSeason: 'June – August',
  },
  {
    id: 'khumbu-lobuche-east-ablation-spires',
    name: 'Khumbu Glacier & Lobuche East High-Camp Ablation Spires',
    region: 'Mahalangur Himal',
    country: 'Nepal',
    elevationMeters: 5450,
    latitudeDegrees: 27.9586,
    ablationMorphology: 'rotten_basal_moat_undercut_field',
    recommendedTechnique: 'axe_belayed_blade_threading',
    typicalDiurnalFreezeState: 'solar_noon_slush_collapse',
    meanBladeHeightCm: 130,
    troughCorridorAzimuthDeg: 88,
    slopeAngleDeg: 29,
    highlights: [
      'High-altitude tropical solar zenith angle creating vertically undercut ice fins',
      'Subsurface meltwater channels hollowed beneath thin, rotten penitente bases',
      'High afternoon collapse risk requiring strict 03:00–10:00 alpine movement windows',
    ],
    bestSeason: 'April – May (Pre-Monsoon) & October – November',
  },
];

export const PENITENTES_GEAR_CHECKLIST: PenitentesGearItem[] = [
  {
    id: 'chromoly-12-point-mountaineering-crampons-antibot',
    name: 'Chromoly 12-Point Mountaineering Crampons with Dual-Density Anti-Bot Plates',
    category: 'crampon_traction',
    mandatory: true,
    weightGrams: 890,
    rationale:
      'Hardened chromoly steel resists lateral torsional bending when bridging frozen sun-cup rims, while active latex/TPU anti-bot plates shed cohesive wet slush in warming troughs.',
  },
  {
    id: 'hardshell-kevlar-padded-shin-gaiters',
    name: 'Hardshell Kevlar-Reinforced Padded Shin Armor & Expedition Gaiters',
    category: 'lower_limb_armor',
    mandatory: true,
    weightGrams: 460,
    rationale:
      'Protects the anterior tibia and medial malleolus from razor-sharp sublimated penitente crests and self-inflicted crampon point lacerations in narrow corridors.',
  },
  {
    id: 'curved-shaft-technical-alpine-ice-axe',
    name: 'Curved-Shaft Technical Alpine Ice Axe (55–65 cm) with Steel Adze',
    category: 'ice_axe_arrest',
    mandatory: true,
    weightGrams: 510,
    rationale:
      'Essential for cane-belay stabilization across uneven trough floors, chopping brittle penitente fins blocking passage, and high-clearance self-arrest.',
  },
  {
    id: 'dual-flicklock-alpine-poles-snow-baskets',
    name: 'Dual FlickLock Pro Carbon/Alloy Alpine Poles with 95 mm Powder Baskets',
    category: 'crampon_traction',
    mandatory: true,
    weightGrams: 480,
    rationale:
      'Provides four-point tripod balance when crest-bridging parabolic sun-cups and probes for hollow basal meltwater moats before committing full body weight.',
  },
  {
    id: 'category-4-glacier-goggles-nose-guard',
    name: 'Category 4 Photochromic Glacier Glasses with Side Shields & Neoprene Nose Guard',
    category: 'solar_glare_protection',
    mandatory: true,
    weightGrams: 65,
    rationale:
      'Parabolic sun-cups and penitente walls act as multi-angle concave solar reflectors, multiplying upward UV-B and shortwave albedo glare.',
  },
  {
    id: 'high-ankle-stiff-shank-mountaineering-boots',
    name: 'High-Ankle Full-Shank B2/B3 Insulated Mountaineering Boots',
    category: 'lower_limb_armor',
    mandatory: true,
    weightGrams: 1840,
    rationale:
      'Rigid carbon/fiberglass midsole prevents foot-arch fatigue during sustained frontpoint stemming and shields the subtalar joint from lateral torque when a fin shears.',
  },
];

export function getAllPenitentesSites(): PenitentesSite[] {
  return [...PENITENTES_SITES];
}

export function getPenitentesSiteById(id: string): PenitentesSite | undefined {
  return PENITENTES_SITES.find((site) => site.id === id);
}

export function filterPenitentesSites(filters?: {
  morphology?: AblationMorphologyType;
  technique?: CramponTraversalTechnique;
  freezeState?: DiurnalFreezeState;
}): PenitentesSite[] {
  if (!filters) {
    return [...PENITENTES_SITES];
  }

  return PENITENTES_SITES.filter((site) => {
    if (filters.morphology && site.ablationMorphology !== filters.morphology) {
      return false;
    }
    if (filters.technique && site.recommendedTechnique !== filters.technique) {
      return false;
    }
    if (
      filters.freezeState &&
      site.typicalDiurnalFreezeState !== filters.freezeState
    ) {
      return false;
    }
    return true;
  });
}

export function getPenitentesGearChecklist(): PenitentesGearItem[] {
  return [...PENITENTES_GEAR_CHECKLIST];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

const MORPHOLOGY_IMPEDANCE_FACTORS: Record<AblationMorphologyType, number> = {
  shallow_parabolic_suncup_matrix: 1.0,
  juvenile_micropenitente_serrations: 1.18,
  deep_suncup_crest_labyrinth: 1.38,
  mature_cathedral_nieves_penitentes: 1.75,
  rotten_basal_moat_undercut_field: 1.95,
};

export function calculatePenitentesNavigationDynamics(
  input: PenitentesCalculatorInput
): PenitentesCalculatorResult {
  const {
    bladeHeightCm,
    troughSpacingCm,
    slopeAngleDeg,
    snowSurfaceTempC,
    solarIrradianceWm2,
    packWeightKg,
    ablationMorphology,
  } = input;

  if (
    !Number.isFinite(bladeHeightCm) ||
    bladeHeightCm < 5 ||
    bladeHeightCm > 400
  ) {
    throw new Error(
      'Invalid bladeHeightCm: must be a finite number between 5 and 400 cm.'
    );
  }

  if (
    !Number.isFinite(troughSpacingCm) ||
    troughSpacingCm < 10 ||
    troughSpacingCm > 250
  ) {
    throw new Error(
      'Invalid troughSpacingCm: must be a finite number between 10 and 250 cm.'
    );
  }

  if (
    !Number.isFinite(slopeAngleDeg) ||
    slopeAngleDeg < 0 ||
    slopeAngleDeg > 65
  ) {
    throw new Error(
      'Invalid slopeAngleDeg: must be a finite number between 0 and 65 degrees.'
    );
  }

  if (
    !Number.isFinite(snowSurfaceTempC) ||
    snowSurfaceTempC < -45 ||
    snowSurfaceTempC > 15
  ) {
    throw new Error(
      'Invalid snowSurfaceTempC: must be a finite number between -45 and 15 °C.'
    );
  }

  if (
    !Number.isFinite(solarIrradianceWm2) ||
    solarIrradianceWm2 < 0 ||
    solarIrradianceWm2 > 1600
  ) {
    throw new Error(
      'Invalid solarIrradianceWm2: must be a finite number between 0 and 1600 W/m².'
    );
  }

  if (!Number.isFinite(packWeightKg) || packWeightKg < 0 || packWeightKg > 55) {
    throw new Error(
      'Invalid packWeightKg: must be a finite number between 0 and 55 kg.'
    );
  }

  const morphologyFactor = ablationMorphology
    ? MORPHOLOGY_IMPEDANCE_FACTORS[ablationMorphology]
    : 1.25;

  const rawPace =
    (420 -
      bladeHeightCm * 1.15 -
      slopeAngleDeg * 3.8 -
      packWeightKg * 2.4) /
    morphologyFactor;
  const effectiveHorizontalPaceMhr = roundTo(clamp(rawPace, 45, 420), 1);

  const rawCaloricMultiplier =
    1.0 +
    bladeHeightCm / 95 +
    slopeAngleDeg / 45 +
    packWeightKg / 40 +
    (morphologyFactor - 1) * 0.85;
  const caloricEnergyMultiplier = roundTo(
    clamp(rawCaloricMultiplier, 1.1, 4.8),
    2
  );

  const rawAntibotRisk =
    snowSurfaceTempC >= -4
      ? clamp(55 + (snowSurfaceTempC + 2.5) * 14 + solarIrradianceWm2 / 35, 5, 99)
      : clamp(12 + solarIrradianceWm2 / 60, 5, 45);
  const cramponAntibotBallingRiskPercent = roundTo(rawAntibotRisk, 1);

  const rawCollapseProb = clamp(
    0.08 +
      (bladeHeightCm / 320) * 0.35 +
      Math.max(0, snowSurfaceTempC + 3) * 0.08 +
      (solarIrradianceWm2 / 1400) * 0.28 +
      (ablationMorphology === 'rotten_basal_moat_undercut_field' ? 0.22 : 0),
    0.03,
    0.98
  );
  const bladeMoatCollapseProbability = roundTo(rawCollapseProb, 2);

  let safetyStatus: PenitentesSafetyStatus;
  if (
    bladeMoatCollapseProbability >= 0.65 ||
    (bladeHeightCm >= 140 &&
      snowSurfaceTempC >= -0.5 &&
      solarIrradianceWm2 >= 850) ||
    cramponAntibotBallingRiskPercent >= 82
  ) {
    safetyStatus = 'abort_isothermal_blade_collapse';
  } else if (
    bladeMoatCollapseProbability >= 0.35 ||
    bladeHeightCm >= 75 ||
    cramponAntibotBallingRiskPercent >= 48 ||
    snowSurfaceTempC >= -2.5
  ) {
    safetyStatus = 'caution_crampon_balling_and_ankle_torque';
  } else {
    safetyStatus = 'optimal_predawn_frozen_corridor';
  }

  let solarAzimuthRoutingProtocol: string;
  if (safetyStatus === 'abort_isothermal_blade_collapse') {
    solarAzimuthRoutingProtocol =
      'ABORT TRAVERSE: Isothermal basal moat undercutting and wet-slab blade shear exceed safe thresholds. Establish shaded anchor or bivouac on stable moraine/bedrock until nocturnal radiative refreeze restores east-west solar trough corridor integrity.';
  } else if (bladeHeightCm >= 100 || troughSpacingCm < 50) {
    solarAzimuthRoutingProtocol =
      'Align micro-tacks strictly with east-west solar azimuth trough corridors (78°–105°) rather than fighting perpendicular across cathedral blades; switchback at connected col gaps and use hybrid frontpoint stemming where troughs narrow below 50 cm.';
  } else {
    solarAzimuthRoutingProtocol =
      'Exploit natural east-west solar trough corridors for low-drag diagonal traverses; bridge sintered sun-cup crests during predawn vitreous lockup to preserve momentum and minimize vertical step-height expenditure.';
  }

  let ankleTorqueAndShinArmorAdvisory: string;
  if (safetyStatus === 'abort_isothermal_blade_collapse') {
    ankleTorqueAndShinArmorAdvisory =
      'CRITICAL LOWER-LIMB HAZARD: Rotten penitente fins will shear unexpectedly under crampon load, trapping frontpoints in hollow basal moats. Inspect crampon anti-bot plates every 15 minutes for cohesive snow balling and wear full Kevlar shin armor.';
  } else if (safetyStatus === 'caution_crampon_balling_and_ankle_torque') {
    ankleTorqueAndShinArmorAdvisory =
      'ELEVATED ANKLE TORQUE & BALLING: Clear crampon anti-bot plates regularly with your ice axe shaft to prevent platform stilts, maintain B2/B3 high-ankle boot lace tension, and deploy padded shin gaiters against serrated ice fins.';
  } else {
    ankleTorqueAndShinArmorAdvisory =
      'OPTIMAL CRAMPON TRACTION: Vitreous crust supports crisp 12-point placement; maintain active crampon anti-bot plate inspection as solar irradiance climbs and wear padded shin protection to guard against accidental cross-leg point snags.';
  }

  return {
    effectiveHorizontalPaceMhr,
    caloricEnergyMultiplier,
    cramponAntibotBallingRiskPercent,
    bladeMoatCollapseProbability,
    safetyStatus,
    solarAzimuthRoutingProtocol,
    ankleTorqueAndShinArmorAdvisory,
  };
}
