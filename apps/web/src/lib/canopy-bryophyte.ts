export type CanopyStratum =
  | 'ground_floor_bryosphere'
  | 'subcanopy_trunk_epiphytes'
  | 'tree_fern_caudex_skirt'
  | 'mid_canopy_branch_mats'
  | 'emergent_outer_canopy';

export type HostSubstrate =
  | 'sitka_spruce_bark'
  | 'western_hemlock_fluted_trunk'
  | 'dicksonia_antarctica_fibrous_caudex'
  | 'bigleaf_maple_epiphyte_limb'
  | 'tasmanian_myrtle_beech';

export type RainforestMicroclimate =
  | 'hyper_maritime_perhumid'
  | 'montane_cloud_inversion'
  | 'sheltered_riparian_gorge'
  | 'seasonally_buffered_temperate';

export type EpiphyteHydrationState =
  | 'poikilohydric_dormant'
  | 'active_photosynthetic_saturation'
  | 'fog_interception_phase';

export type CanopyBryophyteConservationStatus =
  | 'pristine_climax_bryosphere'
  | 'vulnerable_fragmentation_risk'
  | 'microclimate_desiccation_warning';

export interface CanopyBryophyteSite {
  id: string;
  title: string;
  region: string;
  range: string;
  elevationMeters: number;
  dominantStratum: CanopyStratum;
  primarySubstrate: HostSubstrate;
  microclimate: RainforestMicroclimate;
  description: string;
  highlights: string[];
}

export interface CanopyBryophyteQuery {
  siteId: string;
  stratum?: CanopyStratum;
  substrate?: HostSubstrate;
  ambientHumidityPercent: number;
  canopyHeightMeters: number;
  fogDripRateMmDay: number;
  matThicknessCm: number;
}

export interface CanopyBryophyteResult {
  siteTitle: string;
  waterStorageCapacityLitersM2: number;
  poikilohydricRecoveryTimeMinutes: number;
  canopyEpiphyteBiomassKgHa: number;
  microclimateBufferIndex: number;
  conservationStatus: CanopyBryophyteConservationStatus;
  canopyAccessProtocol: string;
  microscopeIdentificationAdvisory: string;
}

export interface CanopyBryophyteGearItem {
  id: string;
  name: string;
  category: 'canopy_access' | 'microscopy' | 'microclimate' | 'specimen' | 'measurement';
  mandatory: boolean;
  description: string;
}

export const CANOPY_BRYOPHYTE_SITES: CanopyBryophyteSite[] = [
  {
    id: 'hoh-river-hall-of-mosses',
    title: 'Hoh River Hall of Mosses Temperate Rain Forest',
    region: 'Olympic National Park, Washington, USA',
    range: 'Olympic Mountains',
    elevationMeters: 180,
    dominantStratum: 'mid_canopy_branch_mats',
    primarySubstrate: 'bigleaf_maple_epiphyte_limb',
    microclimate: 'hyper_maritime_perhumid',
    description:
      'Temperate rainforest characterized by grand bigleaf maple limbs draped in massive pendulous epiphytic bryophyte mats up to 30cm thick.',
    highlights: [
      'Draped hanging moss mats (Isothecium stoloniferum) and licorice ferns',
      'Deep canopy organic soil mats supporting independent root networks',
      'Persistent hyper-maritime fog moisture and high annual precipitation',
    ],
  },
  {
    id: 'tarkine-takayna-rainforest',
    title: 'Tarkine / takayna Ancient Cool Temperate Rainforest',
    region: 'Tasmania, Australia',
    range: 'Tarkine Wilderness',
    elevationMeters: 320,
    dominantStratum: 'tree_fern_caudex_skirt',
    primarySubstrate: 'dicksonia_antarctica_fibrous_caudex',
    microclimate: 'sheltered_riparian_gorge',
    description:
      'Ancient Gondwanan rainforest featuring majestic Dicksonia antarctica soft tree ferns hosting diverse micro-epiphytes along their fibrous caudex skirts.',
    highlights: [
      'Fibrous tree-fern caudices harboring over 40 species of bryophytes and filmy ferns',
      'Endemic Tasmanian myrtle beech and southern sassafras subcanopy layers',
      'High riparian humidity buffers against summer thermal stress',
    ],
  },
  {
    id: 'fiordland-milford-sound-canopy',
    title: 'Fiordland Milford Sound Hanging Bryosphere',
    region: 'South Island, New Zealand',
    range: 'Southern Alps / Fiordland',
    elevationMeters: 120,
    dominantStratum: 'subcanopy_trunk_epiphytes',
    primarySubstrate: 'tasmanian_myrtle_beech',
    microclimate: 'seasonally_buffered_temperate',
    description:
      'Glacial fiord rainforest with sheer vertical wall canopies covered by deep cushions of liverworts and hanging mosses intercepting extreme rainfall.',
    highlights: [
      'Pendulous liverwort veils (Plagiochila and Weymouthia) dripping with mountain run-off',
      'Subcanopy trunk moss cloaks regulating trunkflow chemistry',
      'Over 6,000 mm of annual rainfall creating continuous saturation conditions',
    ],
  },
  {
    id: 'yakushima-ancient-cedar-moss',
    title: 'Yakushima Ancient Sugi & Cloud Inversion Bryosphere',
    region: 'Yakushima, Japan',
    range: 'Yakushima Mountains',
    elevationMeters: 900,
    dominantStratum: 'ground_floor_bryosphere',
    primarySubstrate: 'western_hemlock_fluted_trunk',
    microclimate: 'montane_cloud_inversion',
    description:
      'Subtropical-to-temperate montane island famous for centuries-old Yakusugi cedars and emerald carpets of over 600 bryophyte species.',
    highlights: [
      'Enchanted Shiratani Unsuikyo boulder carpets and fallen nurse logs',
      'Persistent mountain cloud inversion providing perpetual condensing fog',
      'Endemic Dicranum mosses and rare Bazzania liverwort cushions',
    ],
  },
  {
    id: 'great-bear-rainforest-fjords',
    title: 'Great Bear Rainforest Emergent Canopy Estuary',
    region: 'British Columbia, Canada',
    range: 'Pacific Coast Mountains',
    elevationMeters: 80,
    dominantStratum: 'emergent_outer_canopy',
    primarySubstrate: 'sitka_spruce_bark',
    microclimate: 'hyper_maritime_perhumid',
    description:
      'Pristine coastal temperate rainforest where centuries-old emergent Sitka spruce host massive outer-canopy moss mats buffering coastal storms.',
    highlights: [
      'Massive Sitka spruce branches supporting 500+ kg epiphyte mats per limb',
      'Canopy interception of marine fog carrying marine-derived nitrogen',
      'Critical nesting habitat for the marbled murrelet in deep moss platforms',
    ],
  },
];

export const CANOPY_BRYOPHYTE_GEAR_CHECKLIST: CanopyBryophyteGearItem[] = [
  {
    id: 'arborist-friction-cambium-saver',
    name: 'Arborist Non-Invasive Friction Cambium Saver (90cm Leather/Webbing)',
    category: 'canopy_access',
    mandatory: true,
    description:
      'Protects delicate tree limbs and moss-covered epiphyte pads from rope friction grooving during SRT canopy ascent.',
  },
  {
    id: 'lightweight-srt-canopy-ascent-kit',
    name: 'Lightweight SRT Canopy Ascent System (Chest Ascender & Foot Loop)',
    category: 'canopy_access',
    mandatory: true,
    description:
      'Single Rope Technique climbing kit calibrated for vertical ascent into 30m+ rainforest canopies with minimal branch impact.',
  },
  {
    id: 'handheld-20x-achromatic-loupe',
    name: 'Handheld 20x Achromatic Field Loupe with Dual LED Illumination',
    category: 'microscopy',
    mandatory: true,
    description:
      'Essential high-magnification optical lens for examining leaf costa, alar cells, and sporophyte peristome teeth in the canopy.',
  },
  {
    id: 'digital-ultrasonic-fog-canopy-hygrometer',
    name: 'Digital Ultrasonic Fog & Canopy Hygrometer-Thermometer Probe',
    category: 'microclimate',
    mandatory: true,
    description:
      'Measures micro-stratum ambient relative humidity, dew point depression, and fog condensation rates in real time.',
  },
  {
    id: 'breathable-botanical-collection-pouches',
    name: 'Breathable Botanical Specimen Collection Pouches (Pack of 12)',
    category: 'specimen',
    mandatory: true,
    description:
      'Micro-perforated archival paper pouches that allow field specimens to desensitize and breathe without mold growth during transport.',
  },
  {
    id: 'tree-fern-caudex-caliper-gauge',
    name: 'Tree-Fern Caudex & Mat Thickness Caliper Gauge (500mm)',
    category: 'measurement',
    mandatory: true,
    description:
      'Precision non-destructive sliding caliper gauge designed to measure fibrous caudex girth and epiphyte mat depth.',
  },
];

export function getCanopyBryophyteSites(stratum?: CanopyStratum): CanopyBryophyteSite[] {
  if (!stratum) {
    return CANOPY_BRYOPHYTE_SITES;
  }
  return CANOPY_BRYOPHYTE_SITES.filter((site) => site.dominantStratum === stratum);
}

export function getCanopyBryophyteSiteById(id: string): CanopyBryophyteSite | undefined {
  return CANOPY_BRYOPHYTE_SITES.find((site) => site.id === id);
}

export function getCanopyBryophyteGearChecklist(): CanopyBryophyteGearItem[] {
  return CANOPY_BRYOPHYTE_GEAR_CHECKLIST;
}

export function calculateCanopyBryophyteDynamics(
  query: CanopyBryophyteQuery
): CanopyBryophyteResult {
  const site = getCanopyBryophyteSiteById(query.siteId) ?? CANOPY_BRYOPHYTE_SITES[0];
  const stratum = query.stratum ?? site.dominantStratum;
  const substrate = query.substrate ?? site.primarySubstrate;

  // Clamping inputs to safe biological ranges
  const clampedHumidity = Math.min(100, Math.max(30, query.ambientHumidityPercent));
  const clampedHeight = Math.min(90, Math.max(5, query.canopyHeightMeters));
  const clampedFog = Math.min(30.0, Math.max(0.5, query.fogDripRateMmDay));
  const clampedMat = Math.min(35.0, Math.max(0.5, query.matThicknessCm));

  // 1. Water Storage Capacity (10.0 to 120.0 L/m2)
  const rawWaterStorage = clampedMat * 3.8 + (clampedHumidity / 100) * 12 + clampedFog * 0.7;
  const waterStorageCapacityLitersM2 = Math.min(
    120.0,
    Math.max(10.0, Math.round(rawWaterStorage * 10) / 10)
  );

  // 2. Poikilohydric Recovery Time (5 to 90 min)
  // Higher humidity and higher fog drip lead to rapid recovery (shorter time)
  const rawRecoveryTime = 98 - (clampedHumidity - 40) * 1.15 - clampedFog * 1.6;
  const poikilohydricRecoveryTimeMinutes = Math.min(
    90,
    Math.max(5, Math.round(rawRecoveryTime))
  );

  // 3. Canopy Epiphyte Biomass (500 to 5000 kg/ha)
  const rawBiomass = clampedHeight * 32 + clampedMat * 115 + clampedFog * 45;
  const canopyEpiphyteBiomassKgHa = Math.min(
    5000,
    Math.max(500, Math.round(rawBiomass))
  );

  // 4. Microclimate Buffer Index (0.00 to 1.00)
  const rawBufferIndex =
    (clampedHumidity / 100) * 0.5 +
    (clampedMat / 35) * 0.35 +
    Math.min(1, clampedFog / 20) * 0.15;
  const microclimateBufferIndex = Math.min(
    1.0,
    Math.max(0.0, Math.round(rawBufferIndex * 100) / 100)
  );

  // 5. Conservation Status
  let conservationStatus: CanopyBryophyteConservationStatus;
  if (clampedHumidity < 65 || microclimateBufferIndex < 0.45) {
    conservationStatus = 'microclimate_desiccation_warning';
  } else if (clampedHeight < 25 || clampedMat < 4.0 || microclimateBufferIndex < 0.55) {
    conservationStatus = 'vulnerable_fragmentation_risk';
  } else {
    conservationStatus = 'pristine_climax_bryosphere';
  }

  // 6. Canopy Access Protocol
  let canopyAccessProtocol: string;
  if (stratum === 'tree_fern_caudex_skirt' || substrate === 'dicksonia_antarctica_fibrous_caudex') {
    canopyAccessProtocol =
      'Rig ascent lines strictly from dominant canopy trees; never attach hardware to delicate Dicksonia antarctica caudices. Use pole-mounted ground optics or non-destructive low-impact ladders for caudex skirt surveys.';
  } else if (stratum === 'emergent_outer_canopy') {
    canopyAccessProtocol =
      'Deploy wide-strap arborist friction cambium savers over high branch unions (>=25cm diameter). Avoid rigging directly on moss pads. Employ SRT ascent with twin backup prusiks to protect emergent epiphyte communities.';
  } else {
    canopyAccessProtocol =
      'Rig lines using high-friction leather cambium savers placed directly over solid timber crotches. Keep ascending climbers at least 50cm clear of primary epiphyte mats to prevent displacement of pendulous Isothecium curtains.';
  }

  // 7. Microscope Identification Advisory
  let microscopeIdentificationAdvisory: string;
  if (stratum === 'tree_fern_caudex_skirt' || substrate === 'dicksonia_antarctica_fibrous_caudex') {
    microscopeIdentificationAdvisory =
      'Use 20x achromatic loupe to examine filmy-fern fronds (Hymenophyllaceae) single-cell leaf laminae, rhizoid anchors, and caudex adventitious root hairs for micro-liverwort colonies.';
  } else if (substrate === 'bigleaf_maple_epiphyte_limb') {
    microscopeIdentificationAdvisory =
      'Inspect leaf apex and alar cell clusters of Isothecium and Antitrichia under 20x magnification. Look for characteristic vermicular median cells and serrated leaf margins to confirm temperate canopy taxa.';
  } else {
    microscopeIdentificationAdvisory =
      'Examine hyaline alar cell differentiation, mid-leaf costa prominence, and peristome tooth ornamentation with the 20x field loupe. Check for epiphyte hydric status and sporophyte seta maturation.';
  }

  return {
    siteTitle: site.title,
    waterStorageCapacityLitersM2,
    poikilohydricRecoveryTimeMinutes,
    canopyEpiphyteBiomassKgHa,
    microclimateBufferIndex,
    conservationStatus,
    canopyAccessProtocol,
    microscopeIdentificationAdvisory,
  };
}
