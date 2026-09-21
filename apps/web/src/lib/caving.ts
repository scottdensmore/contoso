export type CaveClass =
  | 'class_1_horizontal_walk'
  | 'class_2_scramble_crawl'
  | 'class_3_tight_squeeze'
  | 'class_4_vertical_srt'
  | 'class_5_complex_alpine';

export type CaveEnvironment =
  | 'dry_fossil_passage'
  | 'active_streamway'
  | 'alpine_cold_waterfall'
  | 'muddy_sump_passage';

export type AbrasionRisk =
  | 'none_clean_drop'
  | 'minor_lip_contact'
  | 'severe_rub_point';

export type SrtSafetyStatus =
  | 'approved_safe_hang'
  | 'caution_rope_pad_required'
  | 'critical_rope_shear_risk';

export interface CavingRoute {
  id: string;
  title: string;
  region: string;
  depthM: number;
  totalLengthM: number;
  caveGrade: CaveClass;
  deepestPitchM: number;
  environmentalType: CaveEnvironment;
  typicalDurationHours: number;
  rebelaysRequired: number;
  waterproofOversuitRequired: boolean;
  description: string;
  highlights: string[];
}

export interface SrtRiggingQuery {
  caveId: string;
  pitchDepthM: number;
  caverWeightKg: number;
  caverPackWeightKg: number;
  ropeDiameterMm: number;
  ropeAbrasionRisk: AbrasionRisk;
  rebelayConfigured: boolean;
}

export interface SrtRiggingResult {
  caveTitle: string;
  caveGrade: CaveClass;
  totalSuspendedWeightKg: number;
  estimatedRopeStretchM: number;
  safetyStatus: SrtSafetyStatus;
  descenderRecommendation: string;
  rebelayAdvisory: string;
  biosecurityNotice: string;
}

export interface CavingGearItem {
  id: string;
  name: string;
  category:
    | 'helmet_lighting'
    | 'vertical_srt'
    | 'protective_wear'
    | 'conservation'
    | 'emergency';
  mandatory: boolean;
  description: string;
}

export const CAVING_ROUTES: CavingRoute[] = [
  {
    id: 'fantastic-pit-ellisons-cave',
    title: "Fantastic Pit & Ellison's Cave System",
    region: 'Pigeon Mountain, Walker County, GA',
    depthM: 325,
    totalLengthM: 19500,
    caveGrade: 'class_4_vertical_srt',
    deepestPitchM: 179,
    environmentalType: 'active_streamway',
    typicalDurationHours: 8.5,
    rebelaysRequired: 2,
    waterproofOversuitRequired: true,
    description:
      "Premier Appalachian vertical caving system containing Fantastic Pit, the deepest unobstructed subterranean vertical drop in the lower 48 states, featuring violent waterfall spray and balcony traverses.",
    highlights: [
      '586-foot unbroken vertical drop (deepest free drop in lower 48)',
      'Massive subterranean cathedral acoustic volume',
      'Balcony traverse pitch',
    ],
  },
  {
    id: 'mammoth-cave-historic-dallons',
    title: 'Mammoth Cave Historic Cleaveland Avenue Route',
    region: 'Mammoth Cave National Park, Edmonson County, KY',
    depthM: 115,
    totalLengthM: 680000,
    caveGrade: 'class_1_horizontal_walk',
    deepestPitchM: 0,
    environmentalType: 'dry_fossil_passage',
    typicalDurationHours: 4.0,
    rebelaysRequired: 0,
    waterproofOversuitRequired: false,
    description:
      'World-famous colossal karst labyrinth featuring expansive dry walking corridors, indigenous chert extraction artifacts, and intricate gypsum flower rosettes encrusting tubular ceilings.',
    highlights: [
      'Gypsum flower encrusted tubular ceilings',
      'Ancient native chert mining artifacts',
      'Bottomless Pit rim overlook',
    ],
  },
  {
    id: 'leprechaun-cave-bighorns',
    title: 'Great X Pit & Columbine Crevasse',
    region: 'Bighorn Mountains, Sheridan County, WY',
    depthM: 410,
    totalLengthM: 12400,
    caveGrade: 'class_5_complex_alpine',
    deepestPitchM: 95,
    environmentalType: 'alpine_cold_waterfall',
    typicalDurationHours: 12.0,
    rebelaysRequired: 6,
    waterproofOversuitRequired: true,
    description:
      'High-altitude alpine karst shaft system featuring freezing torrents, glacial melt cascades, narrow restrictions, and complex multi-stage rebelay rigging requiring full thermal suits.',
    highlights: [
      'Near-freezing waterfall vertical drops',
      'Sub-glacial alpine karst limestone',
      'Complex multi-stage rebelay rigging',
    ],
  },
  {
    id: 'carlsbad-caverns-slaughter-canyon',
    title: 'Slaughter Canyon Cave (New Cave)',
    region: 'Carlsbad Caverns National Park, Eddy County, NM',
    depthM: 85,
    totalLengthM: 8200,
    caveGrade: 'class_2_scramble_crawl',
    deepestPitchM: 0,
    environmentalType: 'dry_fossil_passage',
    typicalDurationHours: 3.5,
    rebelaysRequired: 0,
    waterproofOversuitRequired: false,
    description:
      'Undeveloped backcountry cave in the Capitan Reef karst featuring steep slippery guano slopes, massive prehistoric speleothems, dark squeezes, and historic guano miner pathways.',
    highlights: [
      'Enormous 89-foot high Monarch stalagmite',
      'The Clansman massive flowstone totem',
      'Guano mining historic trails',
    ],
  },
  {
    id: 'tumbling-rock-cave-passages',
    title: 'Tumbling Rock Cave Streamway & Top of the World',
    region: 'Jackson County, AL',
    depthM: 70,
    totalLengthM: 11000,
    caveGrade: 'class_3_tight_squeeze',
    deepestPitchM: 18,
    environmentalType: 'active_streamway',
    typicalDurationHours: 6.0,
    rebelaysRequired: 1,
    waterproofOversuitRequired: true,
    description:
      'Renowned TAG limestone stream cave featuring boulder-strewn subterranean canyon walking, tight squeeze passages like the Squeeze Box, and the towering Mount Olympus breakdown mountain.',
    highlights: [
      '400-foot long Mount Olympus breakdown mound',
      'The Squeeze Box limestone restriction',
      'Subterranean rimstone dam pools',
    ],
  },
];

export const CAVING_GEAR: CavingGearItem[] = [
  {
    id: 'en12492-caving-helmet-mount',
    name: 'EN 12492 Certified Caving Helmet with Integrated Dual-Beam Waterproof Headlamp (IP68)',
    category: 'helmet_lighting',
    mandatory: true,
    description:
      'Impact-resistant speleological helmet with four-point chin strap retention and high-lumen IP68 submersible headlamp delivering balanced flood and long-throw spot illumination.',
  },
  {
    id: 'secondary-backup-headlamp',
    name: 'Independent 300+ Lumen Backup Headlamp plus Emergency Whistle and Spare Lithium Cells',
    category: 'helmet_lighting',
    mandatory: true,
    description:
      'Fully redundant autonomous waterproof light source with signaling whistle and extreme-cold-tolerant lithium cells housed in a dry Pelican micro-case.',
  },
  {
    id: 'caving-srt-frog-system',
    name: 'CE/UIAA Certified Low-Attachment Caving Harness with Chest Harness, Croll Ascender, and Handled Jammer',
    category: 'vertical_srt',
    mandatory: true,
    description:
      'Low ventral center-of-gravity sit harness, specialized semi-circular maillon rapide, chest positioning strap, Petzl Croll chest ascender, and handled ascender with footloops.',
  },
  {
    id: 'caving-bobbin-rack-descender',
    name: 'Industrial Stainless Steel Bobbin or Long-Bar Rappel Rack with Braking Carabiner',
    category: 'vertical_srt',
    mandatory: true,
    description:
      'Heavy-duty variable friction descent hardware with secondary braking steel carabiner, engineered to control rappel rates on mud-coated ropes and dissipate heat on long drops.',
  },
  {
    id: 'heavy-cordura-caving-oversuit',
    name: 'Abrasion-Resistant Cordura Caving Oversuit with PVC Knee/Elbow Pads and Neoprene Undersuit',
    category: 'protective_wear',
    mandatory: true,
    description:
      'Reinforced 1000-denier ballistic Cordura one-piece exterior protective suit with welded PVC knee and elbow reinforcements, worn over thermal neoprene layers.',
  },
  {
    id: 'wns-biosecurity-decon-kit',
    name: 'White-Nose Syndrome (WNS) Biosecurity Decontamination Kit (EPA-Registered Disinfectant & Wipes)',
    category: 'conservation',
    mandatory: true,
    description:
      'National WNS decontamination protocol supplies including EPA-registered antifungal solution, stiff nylon scrub brushes, and bio-hazard sealed transport containers.',
  },
];

export function getCavingRoutes(grade?: CaveClass): CavingRoute[] {
  if (!grade) {
    return CAVING_ROUTES;
  }
  return CAVING_ROUTES.filter((route) => route.caveGrade === grade);
}

export function getCavingRouteById(id: string): CavingRoute | undefined {
  return CAVING_ROUTES.find((route) => route.id === id);
}

export function getCavingGear(): CavingGearItem[] {
  return CAVING_GEAR;
}

export function calculateSrtRiggingPlan(query: SrtRiggingQuery): SrtRiggingResult {
  const route = getCavingRouteById(query.caveId);
  if (!route) {
    throw new Error(`Caving route with id "${query.caveId}" not found.`);
  }

  const totalSuspendedWeightKg = query.caverWeightKg + query.caverPackWeightKg;

  // Stretch calculation:
  // Base static elongation ~3.5% at 80kg on 10mm rope.
  // Segmented by rebelay if configured:
  const pitchSegments = query.rebelayConfigured ? Math.max(2, route.rebelaysRequired + 1) : 1;
  const effectiveSegmentM = query.pitchDepthM / pitchSegments;
  const stretchFactor = (totalSuspendedWeightKg / 80) * (10 / query.ropeDiameterMm);
  const estimatedRopeStretchM = Number((effectiveSegmentM * 0.035 * stretchFactor).toFixed(2));

  // Safety status:
  let safetyStatus: SrtSafetyStatus = 'approved_safe_hang';
  if (query.ropeAbrasionRisk === 'severe_rub_point' && !query.rebelayConfigured) {
    safetyStatus = 'critical_rope_shear_risk';
  } else if (
    query.ropeAbrasionRisk === 'severe_rub_point' ||
    query.ropeAbrasionRisk === 'minor_lip_contact'
  ) {
    safetyStatus = 'caution_rope_pad_required';
  }

  // Descender recommendation:
  let descenderRecommendation = '';
  if (query.pitchDepthM > 50) {
    descenderRecommendation =
      'Stainless Steel Long-Bar Rappel Rack with 5-6 bars (Required for deep pitches >50m to dissipate extreme friction heat and prevent rope sheath glaze)';
  } else {
    descenderRecommendation =
      'Petzl Simple or Stop Bobbin Descender with braking carabiner (Compact and lightweight for pitches ≤50m)';
  }

  // Rebelay advisory:
  let rebelayAdvisory = '';
  if (query.ropeAbrasionRisk === 'severe_rub_point' && !query.rebelayConfigured) {
    rebelayAdvisory =
      'CRITICAL: Severe lip rub point detected without rebelay! High rope shear hazard under dynamic caver bounce. Rig an intermediate rebelay anchor or directional redirect immediately.';
  } else if (query.rebelayConfigured) {
    rebelayAdvisory =
      `Rebelay configured: Intermediate anchor successfully isolates edge rub point and segments ${query.pitchDepthM}m drop into manageable hangs, minimizing rope stretch and cyclic ascender bounce.`;
  } else if (query.ropeAbrasionRisk === 'minor_lip_contact') {
    rebelayAdvisory =
      'Caution: Minor lip contact present. Deploy a heavy-duty canvas or PVC rope protector pad securely anchored above the lip.';
  } else if (route.rebelaysRequired > 0 && query.pitchDepthM > 50) {
    rebelayAdvisory =
      `Warning: Cave survey notes ${route.rebelaysRequired} required rebelays on deep vertical sections. An intermediate hang is strongly advised to prevent rub and excess rope stretch.`;
  } else {
    rebelayAdvisory =
      'Direct unbroken free hang: Plumb line drops clear of karst walls. Ensure top rigging is equalized with bombproof primary and backup anchors.';
  }

  const biosecurityNotice =
    'White-Nose Syndrome (WNS) Biosecurity Protocol: Decontaminate all vertical hardware, rope, and boots by submerging in hot water (≥55°C/131°F for 20 min) or applying EPA-registered disinfectant before entering or moving between karst basins.';

  return {
    caveTitle: route.title,
    caveGrade: route.caveGrade,
    totalSuspendedWeightKg,
    estimatedRopeStretchM,
    safetyStatus,
    descenderRecommendation,
    rebelayAdvisory,
    biosecurityNotice,
  };
}
