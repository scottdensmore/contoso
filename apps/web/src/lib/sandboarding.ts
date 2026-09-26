export type BoardStyle = 'twin_tip_freestyle' | 'directional_carver' | 'tandem_seated_sled';
export type SandCondition = 'early_morning_damp' | 'dry_temperate_loose' | 'baked_desert_hot' | 'wind_compacted_crust';
export type WaxType = 'silicone_speed_wax' | 'pure_carnauba_hard' | 'graphite_friction_shield' | 'unwaxed_raw_base';
export type GlidePerformance = 'blistering_speed' | 'smooth_gliding' | 'high_friction_drag' | 'severe_drag_bogged';
export type SlipfaceRisk = 'low_firm_sand' | 'moderate_surface_sluff' | 'high_sandfall_avalanche';

export interface DuneLocation {
  id: string;
  title: string;
  region: string;
  park: string;
  elevationMeters: number;
  duneHeightMeters: number;
  primaryStyle: BoardStyle;
  maxSlopeDegrees: number;
  sandType: string;
  description: string;
  highlights: string[];
}

export interface SandboardingQuery {
  duneId: string;
  boardStyle: BoardStyle;             // default 'directional_carver'
  riderWeightLbs: number;             // 80 to 260 lbs, default 165
  slopeDegrees: number;               // 20 to 36 degrees, default 32
  sandCondition: SandCondition;       // default 'dry_temperate_loose'
  waxType: WaxType;                   // default 'silicone_speed_wax'
}

export interface SandboardingResult {
  duneTitle: string;
  boardStyle: BoardStyle;
  estimatedTopSpeedMph: number;
  kineticFrictionCoefficient: number;
  glidePerformance: GlidePerformance;
  waxReapplicationRuns: number;
  slipfaceRisk: SlipfaceRisk;
  thermalBaseWarning: string;
  riderTechniqueAdvisory: string;
}

export interface SandboardingGearItem {
  id: string;
  name: string;
  category: 'eyewear' | 'maintenance' | 'apparel' | 'hydration' | 'tools' | 'protection';
  mandatory: boolean;
  description: string;
}

export const DUNE_LOCATIONS: DuneLocation[] = [
  {
    id: 'great-sand-dunes-star-dune',
    title: 'Great Sand Dunes Star Dune Slipface',
    region: 'San Luis Valley, Colorado, USA',
    park: 'Great Sand Dunes National Park & Preserve',
    elevationMeters: 2600,
    duneHeightMeters: 230,
    primaryStyle: 'directional_carver',
    maxSlopeDegrees: 34,
    sandType: 'Alpine Quartz & Volcanic Sand',
    description: 'The tallest dunes in North America towering over the high-altitude San Luis Valley with massive slipfaces.',
    highlights: [
      'Tallest dunes in North America',
      'High-altitude 8,500ft alpine desert exertion',
      'Star dune ridge spines and knife-edge drops',
    ],
  },
  {
    id: 'oregon-dunes-florence-bowl',
    title: 'Oregon Dunes Coastal Sand Master Ridge',
    region: 'Florence, Oregon, USA',
    park: 'Oregon Dunes National Recreation Area',
    elevationMeters: 45,
    duneHeightMeters: 150,
    primaryStyle: 'twin_tip_freestyle',
    maxSlopeDegrees: 32,
    sandType: 'Maritime Coastal Silica Sand',
    description: 'Expansive Pacific maritime sand dunes where morning sea fog creates high-speed compacted sand conditions.',
    highlights: [
      'Pacific ocean-view slipfaces',
      'Moist morning fog sand compaction',
      'Natural amphitheater bowl kickers',
    ],
  },
  {
    id: 'coral-pink-sand-dunes',
    title: 'Coral Pink Dunes Navajo Sandstone Basin',
    region: 'Kanab, Utah, USA',
    park: 'Coral Pink Sand Dunes State Park',
    elevationMeters: 1800,
    duneHeightMeters: 100,
    primaryStyle: 'twin_tip_freestyle',
    maxSlopeDegrees: 33,
    sandType: 'Navajo Hematite Iron Oxide Sand',
    description: 'Vibrant salmon-pink sand dunes sculpted from eroded Navajo Sandstone nestled against red cliffs.',
    highlights: [
      'Vibrant reddish-pink sandscapes',
      'Pinyon-juniper forest border lines',
      'Midday heat friction challenges',
    ],
  },
  {
    id: 'bruneau-dunes-mega-ridge',
    title: 'Bruneau Dunes Single-Structure Mega Ridge',
    region: 'Mountain Home, Idaho, USA',
    park: 'Bruneau Dunes State Park',
    elevationMeters: 750,
    duneHeightMeters: 143,
    primaryStyle: 'directional_carver',
    maxSlopeDegrees: 35,
    sandType: 'Basaltic Inland Quartz Sand',
    description: 'The largest single-structured sand dune in North America rising dramatically from a high desert basin.',
    highlights: [
      'Largest single-structured sand dune in North America',
      'Steep 35-degree terminal slipface drop',
      'Clear desert night skies and thermal winds',
    ],
  },
  {
    id: 'white-sands-alkali-flats',
    title: 'White Sands Gypsum Crystal Dunes',
    region: 'Tularosa Basin, New Mexico, USA',
    park: 'White Sands National Park',
    elevationMeters: 1215,
    duneHeightMeters: 18,
    primaryStyle: 'tandem_seated_sled',
    maxSlopeDegrees: 30,
    sandType: 'Hydrous Calcium Sulfate Gypsum Sand',
    description: 'The world\'s largest gypsum dunefield with cool-to-the-touch pristine white sand ideal for seated dune sledding.',
    highlights: [
      'Pure gypsum sand that remains cool to the touch',
      'Gentle rolling dunes ideal for family sledding',
      'Expansive 275 sq mile glistening white field',
    ],
  },
];

export const SANDBOARDING_GEAR_CHECKLIST: SandboardingGearItem[] = [
  {
    id: 'sealed-sand-goggles',
    name: 'Full-Seal Anti-Scratch Sandboarding Goggles (ANSI Z87.1)',
    category: 'eyewear',
    mandatory: true,
    description: 'Foam-filtered ventilation prevents blinding airborne quartz grit during rapid descents',
  },
  {
    id: 'hard-sand-speed-wax',
    name: 'Dual-Temperature High-Friction Sand Speed Wax Bar',
    category: 'maintenance',
    mandatory: true,
    description: 'Carnauba and silicone enriched wax formulated specifically to counter quartz abrasion',
  },
  {
    id: 'thermal-sand-socks',
    name: 'High-Collar Neoprene Sand-Shield Booties & Ankle Gaiters',
    category: 'apparel',
    mandatory: true,
    description: 'Protects feet from burning sand temperatures exceeding 130°F on summer slipfaces',
  },
  {
    id: 'desert-hydration-pack',
    name: '3-Liter Insulated Sand-Proof Hydration Reservoir Pack',
    category: 'hydration',
    mandatory: true,
    description: 'Hydration reservoir with covered bite valve preventing grit ingestion during dune ascents',
  },
  {
    id: 'board-base-scraper',
    name: 'Heavy-Duty Brass Base Scraper & Sand Buffing Pad',
    category: 'tools',
    mandatory: true,
    description: 'Removes scorched wax buildup and polishes laminate base before fresh wax application',
  },
  {
    id: 'sun-sand-shield-buff',
    name: 'UPF 50+ Microfiber Sand Face Shield & Neck Gaiter',
    category: 'protection',
    mandatory: true,
    description: 'Shields face and neck from UV radiation and scouring sand drift in 25+ mph ridge gusts',
  },
];

const BASELINE_FRICTION: Record<WaxType, number> = {
  silicone_speed_wax: 0.22,
  pure_carnauba_hard: 0.26,
  graphite_friction_shield: 0.29,
  unwaxed_raw_base: 0.52,
};

const SAND_CONDITION_MODIFIERS: Record<SandCondition, number> = {
  early_morning_damp: -0.04,
  wind_compacted_crust: -0.02,
  dry_temperate_loose: 0.0,
  baked_desert_hot: 0.05,
};

export function getDuneLocations(style?: BoardStyle): DuneLocation[] {
  if (!style) {
    return DUNE_LOCATIONS;
  }
  return DUNE_LOCATIONS.filter((dune) => dune.primaryStyle === style);
}

export function getDuneLocationById(id: string): DuneLocation | undefined {
  return DUNE_LOCATIONS.find((dune) => dune.id === id);
}

export function getSandboardingGearChecklist(): SandboardingGearItem[] {
  return SANDBOARDING_GEAR_CHECKLIST;
}

export function calculateSandboardingGlide(query: SandboardingQuery): SandboardingResult {
  const dune = getDuneLocationById(query.duneId);
  const duneTitle = dune ? dune.title : 'Custom Dune Slipface';

  // Baseline friction and modifiers
  const baseMu = BASELINE_FRICTION[query.waxType] ?? 0.22;
  const condMod = SAND_CONDITION_MODIFIERS[query.sandCondition] ?? 0.0;
  const rawMu = baseMu + condMod;
  const clampedMu = Math.max(0.15, Math.min(0.65, rawMu));
  const kineticFrictionCoefficient = Math.round(clampedMu * 100) / 100;

  // Speed calculation
  const effectiveAngleRad = (query.slopeDegrees * Math.PI) / 180;
  const netAccel = Math.max(
    0.5,
    9.81 * (Math.sin(effectiveAngleRad) - kineticFrictionCoefficient * Math.cos(effectiveAngleRad)),
  );
  const speedMps = Math.sqrt(2 * netAccel * 40); // 40m average slipface descent
  let estimatedTopSpeedMph = Math.round(speedMps * 2.23694 * 10) / 10;
  if (query.waxType === 'unwaxed_raw_base') {
    estimatedTopSpeedMph = Math.min(estimatedTopSpeedMph, 14.0);
  }

  // Glide performance classification
  let glidePerformance: GlidePerformance;
  if (estimatedTopSpeedMph >= 30) {
    glidePerformance = 'blistering_speed';
  } else if (estimatedTopSpeedMph >= 20) {
    glidePerformance = 'smooth_gliding';
  } else if (estimatedTopSpeedMph >= 12) {
    glidePerformance = 'high_friction_drag';
  } else {
    glidePerformance = 'severe_drag_bogged';
  }

  // Wax reapplication runs
  let waxReapplicationRuns: number;
  if (query.waxType === 'unwaxed_raw_base') {
    waxReapplicationRuns = 0;
  } else if (query.sandCondition === 'baked_desert_hot') {
    waxReapplicationRuns = 1;
  } else if (query.sandCondition === 'dry_temperate_loose') {
    waxReapplicationRuns = 2;
  } else {
    waxReapplicationRuns = 3;
  }

  // Slipface risk assessment
  let slipfaceRisk: SlipfaceRisk;
  if (query.slopeDegrees >= 34) {
    slipfaceRisk = 'high_sandfall_avalanche';
  } else if (query.slopeDegrees >= 29) {
    slipfaceRisk = 'moderate_surface_sluff';
  } else {
    slipfaceRisk = 'low_firm_sand';
  }

  // Thermal base warning
  let thermalBaseWarning: string;
  if (query.waxType === 'unwaxed_raw_base') {
    thermalBaseWarning =
      'Severe base scorch danger: Riding unwaxed raw laminate on quartz sand generates excessive friction heat, causing micro-pitting and base delamination.';
  } else if (query.sandCondition === 'baked_desert_hot') {
    thermalBaseWarning =
      'High thermal abrasion: Surface temperatures exceed 130°F, vaporizing thin wax films rapidly. Inspect base laminate frequently.';
  } else {
    thermalBaseWarning =
      'Nominal base temperature: Thermal friction remains within standard operating tolerance for composite P-Tex/Formica bases.';
  }

  // Rider technique advisory
  let riderTechniqueAdvisory: string;
  if (query.boardStyle === 'tandem_seated_sled') {
    riderTechniqueAdvisory =
      'Lean back to weight the tail, use heels as stabilizing rudders, and avoid digging leading edges into loose sand.';
  } else if (query.slopeDegrees >= 34) {
    riderTechniqueAdvisory =
      'Commit body weight forward down the fall line; aggressive heel-side braking can trigger sluff avalanches.';
  } else {
    riderTechniqueAdvisory =
      'Maintain a centered athletic stance with 60% rear foot pressure to keep the nose floating above the loose quartz grains.';
  }

  return {
    duneTitle,
    boardStyle: query.boardStyle,
    estimatedTopSpeedMph,
    kineticFrictionCoefficient,
    glidePerformance,
    waxReapplicationRuns,
    slipfaceRisk,
    thermalBaseWarning,
    riderTechniqueAdvisory,
  };
}
