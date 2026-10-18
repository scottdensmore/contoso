export type LavaTubeEcologicalZone =
  | 'skylight_entrance_ecotone'
  | 'twilight_moss_threshold'
  | 'transition_variable_microclimate'
  | 'deep_dark_stagnant_saturation'
  | 'subterranean_root_curtain_gallery';

export type VolcanicSubstrateFeature =
  | 'aa_clinker_rubble_floor'
  | 'pahoehoe_ropy_bench_ledges'
  | 'lavacicle_ceiling_stalactites'
  | 'actinobacterial_golden_slime_wall'
  | 'ephemeral_perched_water_drip_pool';

export type TroglomorphicAdaptationClass =
  | 'obligate_eyeless_troglobite'
  | 'facultative_root_feeding_troglophile'
  | 'trogloxene_roosting_commensal'
  | 'chemolithoautotrophic_microbial_mat';

export type BiospeleologyConservationStatus =
  | 'pristine_endemic_refugium'
  | 'vulnerable_microclimate_desiccation'
  | 'critical_anthropogenic_biocontamination';

export interface LavaTubeBiospeleologySite {
  id: string;
  title: string;
  region: string;
  range: string;
  elevationMeters: number;
  dominantZone: LavaTubeEcologicalZone;
  primarySubstrate: VolcanicSubstrateFeature;
  dominantAdaptation: TroglomorphicAdaptationClass;
  description: string;
  highlights: string[];
}

export interface LavaTubeBiospeleologyQuery {
  siteId: string;
  ecologicalZone?: LavaTubeEcologicalZone;
  substrateFeature?: VolcanicSubstrateFeature;
  relativeHumidityPercent: number;
  distanceFromSkylightMeters: number;
  ceilingRootDensityPerM2: number;
  ambientCo2Ppm: number;
}

export interface LavaTubeBiospeleologyResult {
  siteTitle: string;
  troglobiteEndemismIndex: number;
  rootExudateTrophicCapacityMgCM2Day: number;
  vaporPressureDeficitStressKpa: number;
  microbialMatIntegrityPercent: number;
  conservationStatus: BiospeleologyConservationStatus;
  nonContactTraversalProtocol: string;
  biocontaminationDeconAdvisory: string;
}

export interface LavaTubeBiospeleologyGearItem {
  id: string;
  name: string;
  category:
    | 'helmet'
    | 'lighting'
    | 'armor'
    | 'decontamination'
    | 'optics'
    | 'sampling';
  mandatory: boolean;
  description: string;
}

export const LAVA_TUBE_BIOSPELEOLOGY_SITES: LavaTubeBiospeleologySite[] = [
  {
    id: 'kazumura-cave-kilauea-root-galleries',
    title: 'Kazumura Cave Kilauea Metrosideros Root Curtain Galleries',
    region: 'Puna District, Hawaii Island, USA',
    range: 'Kilauea East Rift Zone (Ailaau Pahoehoe Shield)',
    elevationMeters: 410,
    dominantZone: 'subterranean_root_curtain_gallery',
    primarySubstrate: 'lavacicle_ceiling_stalactites',
    dominantAdaptation: 'obligate_eyeless_troglobite',
    description:
      'World-renowned 65.5-kilometer basaltic lava tube system where endemic Ohia lehua (Metrosideros polymorpha) aerial roots penetrate glassy lavacicle ceilings, sustaining eyeless Oliarus polyphemus planthoppers and Caconemobius cave crickets.',
    highlights: [
      'Dense curtains of subterranean Ohia roots providing primary phloem trophic energy in total darkness',
      'Endemic obligate eyeless troglobites including blind wolf spiders (Lycosa howarthi) and cave planthoppers',
      'Fragile shark-tooth lavacicles and glazed pahoehoe lining requiring strict single-file center-channel foot placement',
    ],
  },
  {
    id: 'ape-cave-mount-st-helens-basalt',
    title: 'Ape Cave Mount St. Helens Subterranean Basalt Tube',
    region: 'Gifford Pinchot National Forest, Washington, USA',
    range: 'Cascade Volcanic Arc (Mount St. Helens Southern Flank)',
    elevationMeters: 695,
    dominantZone: 'transition_variable_microclimate',
    primarySubstrate: 'actinobacterial_golden_slime_wall',
    dominantAdaptation: 'chemolithoautotrophic_microbial_mat',
    description:
      'Two-mile-long subalpine basalt conduit formed 2,000 years ago by fluid pahoehoe flows, hosting hydrophobic actinobacterial cave slime mats, endemic grylloblattid ice crawlers, and hibernating Corynorhinus townsendii bats.',
    highlights: [
      'Hydrophobic golden-white Streptomyces and actinobacterial biofilm walls strictly off-limits to skin contact',
      'Cryophilic Grylloblatta chirurgica rock crawlers foraging along chilled basalt cooling-contraction fissures',
      'Seasonal cold-air chimney draughts requiring strict Pseudogymnoascus destructans (WNS) boot decontamination',
    ],
  },
  {
    id: 'undara-volcanic-lava-tubes',
    title: 'Undara Cainozoic Shield Skylight & Collapse Tube System',
    region: 'Far North Queensland, Australia',
    range: 'McBride Volcanic Province (Great Dividing Range)',
    elevationMeters: 780,
    dominantZone: 'skylight_entrance_ecotone',
    primarySubstrate: 'aa_clinker_rubble_floor',
    dominantAdaptation: 'trogloxene_roosting_commensal',
    description:
      'Ancient 190,000-year-old basaltic lava tube network punctuated by roof-collapse skylights that support remnant dry-rainforest vine thickets, microbat maternity roosts, and guano-dependent guanophilic arthropods.',
    highlights: [
      'Sharp microclimatic gradients between semi-arid savanna skylights and humid, CO2-stratified dark vaults',
      'Massive multi-species microbat colonies driving guano-based detritivore food webs on aa clinker floors',
      'Elevated deep-chamber CO2 accumulation pockets requiring real-time ambient gas monitoring during summer rains',
    ],
  },
  {
    id: 'manjanggul-jeju-volcanic-tube',
    title: 'Manjanggul Geomunoreum Multi-Level Pahoehoe Lava Tube',
    region: 'Gujwa-eup, Jeju Island, South Korea',
    range: 'Hallasan Shield Volcano (Geomunoreum Lava Tube System)',
    elevationMeters: 85,
    dominantZone: 'twilight_moss_threshold',
    primarySubstrate: 'pahoehoe_ropy_bench_ledges',
    dominantAdaptation: 'facultative_root_feeding_troglophile',
    description:
      'Monumental multi-tiered basaltic tunnel featuring 7.6-meter lava columns, multi-story lateral flow benches, and high-humidity bryophyte entrance thresholds transitioning into endemic Jeju cave spider refugia.',
    highlights: [
      'Three-tiered lateral pahoehoe flow ledges preserving pristine tubular lava stalagmites and bridge structures',
      'Rich bryophyte and fern twilight threshold ecotone buffering interior moisture against coastal wind desiccation',
      'Protected habitat for the endemic Jeju cave spider (Nesticella quelpartensis) and bent-winged bat colonies',
    ],
  },
  {
    id: 'cueva-de-los-verdes-lanzarote',
    title: 'Cueva de los Verdes & Monte Corona Subterranean Tube',
    region: 'Haría, Lanzarote, Canary Islands, Spain',
    range: 'Malpaís de la Corona (Volcán de la Corona Eastern Flank)',
    elevationMeters: 45,
    dominantZone: 'deep_dark_stagnant_saturation',
    primarySubstrate: 'ephemeral_perched_water_drip_pool',
    dominantAdaptation: 'obligate_eyeless_troglobite',
    description:
      'Six-kilometer stacked volcanic gallery extending from the Corona cone to the Atlantic anchialine coast, where stagnant vapor-saturated vaults and perched mineral drip pools shelter relict stygobitic and troglobitic fauna.',
    highlights: [
      'Vapor-saturated deep dark galleries isolated from Trade Wind desiccation by thick vesicular basalt overburden',
      'Perched basaltic percolation drip pools and anchialine transitions harboring eyeless Munidopsis and amphipods',
      'Delicate staphylinid beetles and depigmented isopods sensitive to thermal and photonic visitor disturbance',
    ],
  },
];

export const LAVA_TUBE_BIOSPELEOLOGY_GEAR_CHECKLIST: LavaTubeBiospeleologyGearItem[] =
  [
    {
      id: 'en12492-low-profile-basalt-caving-helmet',
      name: 'EN 12492 Low-Profile ABS/EPP Basalt Speleology Helmet',
      category: 'helmet',
      mandatory: true,
      description:
        'Snag-free ABS hardshell helmet prevents cranial lacerations against razor-sharp basaltic lavacicles while eliminating top-heavy headlamp brackets that snap fragile ceiling stalactites.',
    },
    {
      id: 'red-spectrum-low-lux-biosurvey-headlamp',
      name: '630nm Red-Spectrum & Diffused Low-Lux Biosurvey Headlamp',
      category: 'lighting',
      mandatory: true,
      description:
        'Constant-current floodlight with 630nm deep-red mode (<15 lux) to observe photophobic eyeless troglobites and roosting bats without inducing acute phototoxic stress or lampenflora algae growth.',
    },
    {
      id: 'neoprene-kevlar-aa-basalt-knee-elbow-pads',
      name: 'Non-Shedding Kevlar-Faced Neoprene Aa Basalt Knee & Elbow Pads',
      category: 'armor',
      mandatory: true,
      description:
        'Articulated closed-cell armor engineered to resist shredding on glassy aa clinker rubble while preventing synthetic microfiber lint deposition in oligotrophic cave habitats.',
    },
    {
      id: 'quaternary-ammonium-boot-decon-kit',
      name: 'Quaternary Ammonium & Virkon-S Biospeleology Boot Decon Kit',
      category: 'decontamination',
      mandatory: true,
      description:
        'Portable stiff-bristle tread scrubbers and sealed disinfectant bath pouches to eradicate Pseudogymnoascus destructans (WNS) spores and exotic soil nematodes before and after cave entry.',
    },
    {
      id: 'macro-15x-illuminated-entomological-loupe',
      name: 'Achromatic 15x Ring-Illuminated Troglomorphic Macro Loupe',
      category: 'optics',
      mandatory: true,
      description:
        'Triplet glass hand lens with polarized ring diffuser for in-situ taxonomic verification of depigmented collembola, pseudoscorpions, and root-feeding planthopper nymphs without specimen removal.',
    },
    {
      id: 'nondestructive-aspirator-pooter-vial-set',
      name: 'HEPA-Filtered Non-Destructive Entomological Aspirator (Pooter) Set',
      category: 'sampling',
      mandatory: true,
      description:
        'Low-suction polycarbonate aspirator with inline 0.2-micron HEPA spore filter and graduated borosilicate observation vials for permitted, zero-crush bio-inventory surveys.',
    },
  ];

export function getLavaTubeBiospeleologySites(
  zone?: LavaTubeEcologicalZone
): LavaTubeBiospeleologySite[] {
  if (!zone) {
    return LAVA_TUBE_BIOSPELEOLOGY_SITES;
  }
  return LAVA_TUBE_BIOSPELEOLOGY_SITES.filter(
    (site) => site.dominantZone === zone
  );
}

export function getLavaTubeBiospeleologySiteById(
  id: string
): LavaTubeBiospeleologySite | undefined {
  return LAVA_TUBE_BIOSPELEOLOGY_SITES.find((site) => site.id === id);
}

export function getLavaTubeBiospeleologyGearChecklist(): LavaTubeBiospeleologyGearItem[] {
  return LAVA_TUBE_BIOSPELEOLOGY_GEAR_CHECKLIST;
}

export function calculateLavaTubeBiospeleologyDynamics(
  query: LavaTubeBiospeleologyQuery
): LavaTubeBiospeleologyResult {
  const site =
    getLavaTubeBiospeleologySiteById(query.siteId) ??
    LAVA_TUBE_BIOSPELEOLOGY_SITES[0];
  const ecologicalZone = query.ecologicalZone ?? site.dominantZone;
  const substrateFeature = query.substrateFeature ?? site.primarySubstrate;

  // Clamp inputs to realistic speleological bounds
  const relativeHumidityPercent = Math.min(
    100,
    Math.max(55, query.relativeHumidityPercent)
  );
  const distanceFromSkylightMeters = Math.min(
    1200,
    Math.max(5, query.distanceFromSkylightMeters)
  );
  const ceilingRootDensityPerM2 = Math.min(
    120,
    Math.max(0, query.ceilingRootDensityPerM2)
  );
  const ambientCo2Ppm = Math.min(5000, Math.max(400, query.ambientCo2Ppm));

  // 1. Vapor Pressure Deficit Stress (0.00 to 1.50 kPa)
  // At 15-18°C cave temperature, saturation vapor pressure is ~1.85 kPa
  const saturationKpa = 1.85;
  let zoneVpdModifier = 0;
  if (ecologicalZone === 'skylight_entrance_ecotone') zoneVpdModifier = 0.22;
  else if (ecologicalZone === 'twilight_moss_threshold') zoneVpdModifier = 0.12;
  else if (ecologicalZone === 'transition_variable_microclimate')
    zoneVpdModifier = 0.06;
  else if (ecologicalZone === 'subterranean_root_curtain_gallery')
    zoneVpdModifier = -0.02;
  else if (ecologicalZone === 'deep_dark_stagnant_saturation')
    zoneVpdModifier = -0.04;

  const rawVpd =
    saturationKpa * (1 - relativeHumidityPercent / 100) +
    zoneVpdModifier +
    Math.max(0, (120 - distanceFromSkylightMeters) * 0.0012);
  const vaporPressureDeficitStressKpa = Math.min(
    1.5,
    Math.max(0.0, Math.round(rawVpd * 100) / 100)
  );

  // 2. Root Exudate Trophic Capacity (5.0 to 450.0 mg C/m²/day)
  let zoneTrophicMultiplier = 1.0;
  if (ecologicalZone === 'subterranean_root_curtain_gallery')
    zoneTrophicMultiplier = 1.45;
  else if (ecologicalZone === 'deep_dark_stagnant_saturation')
    zoneTrophicMultiplier = 1.05;
  else if (ecologicalZone === 'transition_variable_microclimate')
    zoneTrophicMultiplier = 0.9;
  else if (ecologicalZone === 'twilight_moss_threshold')
    zoneTrophicMultiplier = 0.85;
  else if (ecologicalZone === 'skylight_entrance_ecotone')
    zoneTrophicMultiplier = 0.75;

  let substrateTrophicBonus = 0;
  if (substrateFeature === 'lavacicle_ceiling_stalactites')
    substrateTrophicBonus = 24.0;
  else if (substrateFeature === 'ephemeral_perched_water_drip_pool')
    substrateTrophicBonus = 18.0;
  else if (substrateFeature === 'actinobacterial_golden_slime_wall')
    substrateTrophicBonus = 15.0;
  else if (substrateFeature === 'pahoehoe_ropy_bench_ledges')
    substrateTrophicBonus = 10.0;
  else if (substrateFeature === 'aa_clinker_rubble_floor')
    substrateTrophicBonus = 6.0;

  const humidityRetentionFactor = Math.max(
    0.45,
    (relativeHumidityPercent - 45) / 55
  );
  const rawTrophicCapacity =
    (12.0 + ceilingRootDensityPerM2 * 4.35 + substrateTrophicBonus) *
    zoneTrophicMultiplier *
    humidityRetentionFactor;
  const rootExudateTrophicCapacityMgCM2Day = Math.min(
    450.0,
    Math.max(5.0, Math.round(rawTrophicCapacity * 10) / 10)
  );

  // 3. Troglobite Endemism Index (0.00 to 1.00)
  let zoneEndemismBase = 0.45;
  if (ecologicalZone === 'deep_dark_stagnant_saturation')
    zoneEndemismBase = 0.68;
  else if (ecologicalZone === 'subterranean_root_curtain_gallery')
    zoneEndemismBase = 0.65;
  else if (ecologicalZone === 'transition_variable_microclimate')
    zoneEndemismBase = 0.44;
  else if (ecologicalZone === 'twilight_moss_threshold')
    zoneEndemismBase = 0.28;
  else if (ecologicalZone === 'skylight_entrance_ecotone')
    zoneEndemismBase = 0.16;

  const isolationBonus = Math.min(0.2, distanceFromSkylightMeters / 2500);
  const humidityBonus = Math.max(
    -0.25,
    (relativeHumidityPercent - 88) * 0.014
  );
  const rootSupportBonus = Math.min(0.12, ceilingRootDensityPerM2 * 0.002);
  const co2Penalty =
    ambientCo2Ppm > 1200 ? (ambientCo2Ppm - 1200) * 0.00008 : 0;

  const rawEndemism =
    zoneEndemismBase +
    isolationBonus +
    humidityBonus +
    rootSupportBonus -
    co2Penalty;
  const troglobiteEndemismIndex = Math.min(
    1.0,
    Math.max(0.0, Math.round(rawEndemism * 100) / 100)
  );

  // 4. Microbial Mat Integrity (0.0 to 100.0%)
  let substrateMatBase = 84.0;
  if (substrateFeature === 'actinobacterial_golden_slime_wall')
    substrateMatBase = 92.0;
  else if (substrateFeature === 'lavacicle_ceiling_stalactites')
    substrateMatBase = 89.0;
  else if (substrateFeature === 'ephemeral_perched_water_drip_pool')
    substrateMatBase = 87.0;
  else if (substrateFeature === 'pahoehoe_ropy_bench_ledges')
    substrateMatBase = 82.0;
  else if (substrateFeature === 'aa_clinker_rubble_floor')
    substrateMatBase = 76.0;

  const vpdDegradation = vaporPressureDeficitStressKpa * 32.0;
  const co2BiocontamPenalty =
    ambientCo2Ppm > 800 ? (ambientCo2Ppm - 800) * 0.018 : 0;
  const rawMatIntegrity =
    substrateMatBase - vpdDegradation - co2BiocontamPenalty;
  const microbialMatIntegrityPercent = Math.min(
    100.0,
    Math.max(0.0, Math.round(rawMatIntegrity * 10) / 10)
  );

  // 5. Conservation Status
  let conservationStatus: BiospeleologyConservationStatus;
  if (
    ambientCo2Ppm >= 1500 ||
    microbialMatIntegrityPercent < 55.0 ||
    (substrateFeature === 'actinobacterial_golden_slime_wall' &&
      ambientCo2Ppm >= 1200)
  ) {
    conservationStatus = 'critical_anthropogenic_biocontamination';
  } else if (
    relativeHumidityPercent < 86 ||
    vaporPressureDeficitStressKpa >= 0.25 ||
    ecologicalZone === 'skylight_entrance_ecotone'
  ) {
    conservationStatus = 'vulnerable_microclimate_desiccation';
  } else {
    conservationStatus = 'pristine_endemic_refugium';
  }

  // 6. Non-Contact Traversal Protocol
  let nonContactTraversalProtocol: string;
  if (
    ecologicalZone === 'subterranean_root_curtain_gallery' ||
    substrateFeature === 'lavacicle_ceiling_stalactites'
  ) {
    nonContactTraversalProtocol = `ROOT CURTAIN & LAVACICLE CLEARANCE: Maintain >=45cm vertical helmet clearance below ceiling root curtains (${ceilingRootDensityPerM2} roots/m² delivering ${rootExudateTrophicCapacityMgCM2Day.toFixed(1)} mg C/m²/day); crouch through low pahoehoe squeezes and never use basalt walls or root strands for handholds.`;
  } else if (substrateFeature === 'actinobacterial_golden_slime_wall') {
    nonContactTraversalProtocol = `ACTINOBACTERIAL BIOFILM PROTECTION: Stay strictly within established center-floor flagging tape; skin oils irreversibly lyse hydrophobic golden cave slime mats (current integrity ${microbialMatIntegrityPercent.toFixed(1)}%). Use Kevlar knee pads for low-crawl stabilization on bare floor basalt only.`;
  } else if (
    substrateFeature === 'ephemeral_perched_water_drip_pool' ||
    ecologicalZone === 'deep_dark_stagnant_saturation'
  ) {
    nonContactTraversalProtocol = `STYGOBITIC DRIP POOL AVOIDANCE: Detour around perched basaltic sinter pools at ${distanceFromSkylightMeters}m depth (endemism index ${troglobiteEndemismIndex.toFixed(2)}); silt suspension from single boot steps suffocates blind amphipods and larval cave beetles.`;
  } else {
    nonContactTraversalProtocol = `SINGLE-FILE SUBSTRATE DISCIPLINE: Traverse in strict single-file formation over ${substrateFeature.replace(/_/g, ' ')}, switch headlamps to 630nm red-spectrum (<15 lux) near roosting ledges, and avoid kicking loose clinker into lateral crevice microhabitats.`;
  }

  // 7. Biocontamination & Decon Advisory
  let biocontaminationDeconAdvisory: string;
  if (conservationStatus === 'critical_anthropogenic_biocontamination') {
    biocontaminationDeconAdvisory = `CRITICAL BIOCONTAMINATION ALERT (${ambientCo2Ppm} ppm CO2): Suspend group entry immediately to prevent thermal plume stratification and CO2 buildup. Scrub all boot lugs and knee armor in 2% Virkon-S or quaternary ammonium solution for 10 minutes before egress.`;
  } else if (conservationStatus === 'vulnerable_microclimate_desiccation') {
    biocontaminationDeconAdvisory = `DESICCATION & SPORE CONTROL PROTOCOL (VPD ${vaporPressureDeficitStressKpa.toFixed(2)} kPa): Limit party size to <=4 researchers to prevent chimney-effect draft acceleration, seal all organic food crumbs in double zip-locks, and complete full WNS quaternary ammonium boot decontamination at the skylight threshold.`;
  } else {
    biocontaminationDeconAdvisory = `PRISTINE REFUGIUM BIOSECURITY (${relativeHumidityPercent}% RH, VPD ${vaporPressureDeficitStressKpa.toFixed(2)} kPa): Enforce clean-caving gear segregation (dedicated single-tube harness/pads), disinfect boot treads with quaternary ammonium pre-entry, and log all troglobite sightings via non-destructive 15x macro optics.`;
  }

  return {
    siteTitle: site.title,
    troglobiteEndemismIndex,
    rootExudateTrophicCapacityMgCM2Day,
    vaporPressureDeficitStressKpa,
    microbialMatIntegrityPercent,
    conservationStatus,
    nonContactTraversalProtocol,
    biocontaminationDeconAdvisory,
  };
}
