export type LittoralConduitMorphology =
  | 'constricted_pneumatic_blowhole_shaft'
  | 'convergent_basalt_surge_slot'
  | 'submerged_siphon_overpressure_chamber'
  | 'dual_portal_littoral_through_arch'
  | 'boulder_choked_collapse_doline';

export type WavePeriodRegime =
  | 'short_period_wind_chop_8s'
  | 'moderate_groundswell_12s'
  | 'long_period_forerunner_swell_17s'
  | 'infragravity_sneaker_wave_group_22s';

export type LittoralTraversalMode =
  | 'sit_on_top_sea_kayak_sprint'
  | 'helmeted_coasteer_swim_and_scramble'
  | 'inflatable_rescue_sled_recon'
  | 'rope_belayed_rim_standoff_observation';

export type SeaCavePneumaticSafetyStatus =
  | 'nominal_vented_slack_swell_window'
  | 'caution_acoustic_overpressure_and_rebound_surge'
  | 'abort_pneumatic_piston_seal_and_blowhole_eruption';

export interface SeaCavePneumaticSite {
  id: string;
  name: string;
  region: string;
  country: string;
  elevationMeters: number;
  morphology: LittoralConduitMorphology;
  typicalWaveRegime: WavePeriodRegime;
  recommendedTraversalMode: LittoralTraversalMode;
  portalCeilingClearanceM: number;
  typicalSignificantWaveHeightM: number;
  typicalSwellPeriodSeconds: number;
  chamberConvergenceRatio: number;
  chamberLengthM: number;
  highlights: string[];
  bestSeason: string;
}

export interface SeaCavePneumaticGearItem {
  id: string;
  name: string;
  category:
    | 'impact_and_barotrauma_armor'
    | 'buoyancy_and_extraction'
    | 'littoral_telemetry';
  mandatory: boolean;
  weightGrams: number;
  rationale: string;
}

export interface SeaCavePneumaticCalculatorInput {
  portalCeilingClearanceM: number;
  significantWaveHeightM: number;
  swellPeriodSeconds: number;
  chamberConvergenceRatio: number;
  tideHeightAboveMllwM: number;
  chamberLengthM: number;
  morphology?: LittoralConduitMorphology;
  waveRegime?: WavePeriodRegime;
}

export interface SeaCavePneumaticCalculatorResult {
  portalPistonSealProbability: number;
  pneumaticOverpressureKpa: number;
  reboundSurgeVelocityMs: number;
  safeSetLullWindowSeconds: number;
  safetyStatus: SeaCavePneumaticSafetyStatus;
  swellSetTimingProtocol: string;
  barotraumaAndClapotisAdvisory: string;
}

export const SEA_CAVE_PNEUMATIC_SITES: SeaCavePneumaticSite[] = [
  {
    id: 'mendocino-devils-punchbowl-russian-gulch-siphon',
    name: "Russian Gulch Devil's Punchbowl & Mendocino Headland Surge Caverns",
    region: 'Mendocino Coast, California',
    country: 'USA',
    elevationMeters: 0,
    morphology: 'boulder_choked_collapse_doline',
    typicalWaveRegime: 'long_period_forerunner_swell_17s',
    recommendedTraversalMode: 'sit_on_top_sea_kayak_sprint',
    portalCeilingClearanceM: 3.2,
    typicalSignificantWaveHeightM: 1.8,
    typicalSwellPeriodSeconds: 15,
    chamberConvergenceRatio: 2.4,
    chamberLengthM: 62,
    highlights: [
      'Collapsed Franciscan greywacke sea-cave roof forming a 60 m inland doline sinkhole fed by twin littoral siphon tunnels',
      'North Pacific 15–17s forerunner groundswells shoal over submerged chockstones and generate cross-portal standing clapotis',
      'Requires 15-minute swell-set timing outside the seaward arch before committing to a slack-tide sit-on-top kayak sprint',
    ],
    bestSeason: 'July – Early October (Calm Summer Groundswell Lulls)',
  },
  {
    id: 'staffa-fingals-cave-columnar-basalt-surge-vault',
    name: "Fingal's Cave & Clamshell Basalt Surge Vault",
    region: 'Isle of Staffa, Inner Hebrides, Scotland',
    country: 'UK',
    elevationMeters: 0,
    morphology: 'convergent_basalt_surge_slot',
    typicalWaveRegime: 'moderate_groundswell_12s',
    recommendedTraversalMode: 'helmeted_coasteer_swim_and_scramble',
    portalCeilingClearanceM: 6.5,
    typicalSignificantWaveHeightM: 1.4,
    typicalSwellPeriodSeconds: 12,
    chamberConvergenceRatio: 1.8,
    chamberLengthM: 72,
    highlights: [
      'Hexagonal Palaeogene columnar basalt cathedral tapering 72 m into a resonant dead-end acoustic surge slot',
      'Atlantic swell reflections off the rear wall amplify booming low-frequency acoustic overpressure and steep backwash',
      'Coasteerers and basalt-ledge scramblers must wear CE EN 1385 helmets and vented earplugs against rebound surge',
    ],
    bestSeason: 'May – August',
  },
  {
    id: 'pictured-rocks-lovers-leap-sandstone-sea-caves',
    name: 'Pictured Rocks Littoral Sandstone Surge Caves',
    region: 'Lake Superior, Michigan',
    country: 'USA',
    elevationMeters: 183,
    morphology: 'dual_portal_littoral_through_arch',
    typicalWaveRegime: 'short_period_wind_chop_8s',
    recommendedTraversalMode: 'sit_on_top_sea_kayak_sprint',
    portalCeilingClearanceM: 4.8,
    typicalSignificantWaveHeightM: 0.7,
    typicalSwellPeriodSeconds: 8,
    chamberConvergenceRatio: 1.3,
    chamberLengthM: 38,
    highlights: [
      'Wave-undercut Cambrian Munising sandstone sea caves and through-arches venting short-period freshwater chop',
      'Dual-portal architecture prevents adiabatic air trapping during low summer swell but focuses multi-directional vertical clapotis',
      'Ideal benchmark for practicing sprint timing and helm control inside echoing sandstone chambers',
    ],
    bestSeason: 'Late June – Early September',
  },
  {
    id: 'kiama-bombo-headland-basalt-blowhole-slot',
    name: 'Kiama & Bombo Headland Columnar Basalt Blowhole Conduit',
    region: 'Illawarra Coast, New South Wales',
    country: 'Australia',
    elevationMeters: 0,
    morphology: 'constricted_pneumatic_blowhole_shaft',
    typicalWaveRegime: 'infragravity_sneaker_wave_group_22s',
    recommendedTraversalMode: 'rope_belayed_rim_standoff_observation',
    portalCeilingClearanceM: 1.4,
    typicalSignificantWaveHeightM: 2.8,
    typicalSwellPeriodSeconds: 18,
    chamberConvergenceRatio: 4.1,
    chamberLengthM: 54,
    highlights: [
      'Low-ceilinged Permian latite/basalt sea-cave conduit funneling southeast Tasman Sea groundswells into a vertical chimney vent',
      'Complete portal piston-sealing compresses trapped air adiabatically and erupts 25–30 m seawater geysers at >50 kPa overpressure',
      'Strictly prohibited for aquatic entry; requires rope-belayed rim standoff outside the ballistic cobble and spray blast zone',
    ],
    bestSeason: 'Year-Round (Rim Standoff Observation Only)',
  },
  {
    id: 'na-pali-honopu-open-ceiling-lava-sea-cave',
    name: "Na Pali Open-Ceiling & Pirate's Lava Tube Sea Caves",
    region: 'Kauai, Hawaii',
    country: 'USA',
    elevationMeters: 0,
    morphology: 'submerged_siphon_overpressure_chamber',
    typicalWaveRegime: 'long_period_forerunner_swell_17s',
    recommendedTraversalMode: 'inflatable_rescue_sled_recon',
    portalCeilingClearanceM: 2.6,
    typicalSignificantWaveHeightM: 1.9,
    typicalSwellPeriodSeconds: 16,
    chamberConvergenceRatio: 2.9,
    chamberLengthM: 85,
    highlights: [
      'Deep shield-volcano basalt lava tubes partially drowned by Holocene sea-level rise along the remote Na Pali cliffs',
      'Long-period North Pacific forerunner swells can seal the low outer arch while compressing rear air domes above submerged siphons',
      'Demands strict swell-period telemetry and low-draft rescue sled or sit-on-top recon only during flat summer trade-wind lulls',
    ],
    bestSeason: 'June – August (South/North Swell Minimum)',
  },
];

export const SEA_CAVE_PNEUMATIC_GEAR_CHECKLIST: SeaCavePneumaticGearItem[] = [
  {
    id: 'ce-en1385-whitewater-and-surf-impact-helmet',
    name: 'CE EN 1385 Multi-Impact Whitewater & Littoral Surf Helmet with Ear Guards',
    category: 'impact_and_barotrauma_armor',
    mandatory: true,
    weightGrams: 420,
    rationale:
      'Protects the cranium and temporal bone against sudden vertical lift into low basalt cave ceilings during unexpected wave-crest piston surges.',
  },
  {
    id: 'vented-acoustic-barotrauma-surf-earplugs',
    name: 'Vented Acoustic-Attenuation & Barotrauma Defense Surf Earplugs',
    category: 'impact_and_barotrauma_armor',
    mandatory: true,
    weightGrams: 18,
    rationale:
      'Dampens impulsive pneumatic shockwaves (20–120 kPa) and prevents tympanic membrane rupture when a wave crest piston-seals a dead-end sea cave.',
  },
  {
    id: 'high-flotation-quick-release-coasteering-pfd',
    name: 'High-Flotation (70N+) Low-Profile Coasteering & Surf-Kayak PFD',
    category: 'buoyancy_and_extraction',
    mandatory: true,
    weightGrams: 780,
    rationale:
      'Maintains positive buoyancy inside aerated whitewater foam and violent rebound clapotis where water density drops by up to 40%.',
  },
  {
    id: 'blunt-tip-titanium-line-cutter-and-kelp-knife',
    name: 'PFD-Lashed Blunt-Tip Titanium Line Cutter & Bull-Kelp Extraction Knife',
    category: 'buoyancy_and_extraction',
    mandatory: true,
    weightGrams: 95,
    rationale:
      'Allows immediate single-handed severing of tangled tow-tethers, ghost fishing nets, or dense Macrocystis/Nereocystis kelp stalks in dark surge slots.',
  },
  {
    id: 'dual-beam-ipx8-submersible-headlamp-and-strobe',
    name: 'Helmet-Mounted IPX8 Submersible Spot/Flood Headlamp & High-Vis Strobe',
    category: 'littoral_telemetry',
    mandatory: true,
    weightGrams: 145,
    rationale:
      'Penetrates suspended sea-foam mist and aphotic basalt interior chambers when a rising swell crest eclipses natural portal daylight.',
  },
  {
    id: 'digital-swell-set-interval-chronograph-and-tide-table',
    name: 'Wrist-Mounted Swell-Set Interval Chronograph & Local MLLW Tide Slate',
    category: 'littoral_telemetry',
    mandatory: true,
    weightGrams: 68,
    rationale:
      'Tracks 15-minute infragravity wave-group cycles and tidal ceiling clearance reduction to time safe portal entry and egress during set lulls.',
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function getAllSeaCavePneumaticSites(): SeaCavePneumaticSite[] {
  return SEA_CAVE_PNEUMATIC_SITES;
}

export function getSeaCavePneumaticSiteById(
  id: string
): SeaCavePneumaticSite | undefined {
  return SEA_CAVE_PNEUMATIC_SITES.find((site) => site.id === id);
}

export function filterSeaCavePneumaticSites(filters?: {
  morphology?: LittoralConduitMorphology;
  waveRegime?: WavePeriodRegime;
  traversalMode?: LittoralTraversalMode;
}): SeaCavePneumaticSite[] {
  if (!filters) {
    return SEA_CAVE_PNEUMATIC_SITES;
  }

  return SEA_CAVE_PNEUMATIC_SITES.filter((site) => {
    if (filters.morphology && site.morphology !== filters.morphology) {
      return false;
    }
    if (filters.waveRegime && site.typicalWaveRegime !== filters.waveRegime) {
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

export function getSeaCavePneumaticGearChecklist(): SeaCavePneumaticGearItem[] {
  return SEA_CAVE_PNEUMATIC_GEAR_CHECKLIST;
}

const MORPHOLOGY_CONFINEMENT_MULTIPLIERS: Record<
  LittoralConduitMorphology,
  number
> = {
  dual_portal_littoral_through_arch: 0.65,
  boulder_choked_collapse_doline: 0.95,
  convergent_basalt_surge_slot: 1.2,
  submerged_siphon_overpressure_chamber: 1.55,
  constricted_pneumatic_blowhole_shaft: 1.8,
};

export function calculateSeaCavePneumaticSafety(
  input: SeaCavePneumaticCalculatorInput
): SeaCavePneumaticCalculatorResult {
  const {
    portalCeilingClearanceM,
    significantWaveHeightM,
    swellPeriodSeconds,
    chamberConvergenceRatio,
    tideHeightAboveMllwM,
    chamberLengthM,
    morphology,
  } = input;

  if (
    !Number.isFinite(portalCeilingClearanceM) ||
    portalCeilingClearanceM < 0.3 ||
    portalCeilingClearanceM > 25
  ) {
    throw new Error(
      'Invalid portalCeilingClearanceM: must be between 0.3 and 25 m.'
    );
  }
  if (
    !Number.isFinite(significantWaveHeightM) ||
    significantWaveHeightM < 0.1 ||
    significantWaveHeightM > 12
  ) {
    throw new Error(
      'Invalid significantWaveHeightM: must be between 0.1 and 12 m.'
    );
  }
  if (
    !Number.isFinite(swellPeriodSeconds) ||
    swellPeriodSeconds < 4 ||
    swellPeriodSeconds > 28
  ) {
    throw new Error(
      'Invalid swellPeriodSeconds: must be between 4 and 28 seconds.'
    );
  }
  if (
    !Number.isFinite(chamberConvergenceRatio) ||
    chamberConvergenceRatio < 1.0 ||
    chamberConvergenceRatio > 6.0
  ) {
    throw new Error(
      'Invalid chamberConvergenceRatio: must be between 1.0 and 6.0.'
    );
  }
  if (
    !Number.isFinite(tideHeightAboveMllwM) ||
    tideHeightAboveMllwM < -1.5 ||
    tideHeightAboveMllwM > 5.0
  ) {
    throw new Error(
      'Invalid tideHeightAboveMllwM: must be between -1.5 and 5.0 m.'
    );
  }
  if (
    !Number.isFinite(chamberLengthM) ||
    chamberLengthM < 5 ||
    chamberLengthM > 250
  ) {
    throw new Error('Invalid chamberLengthM: must be between 5 and 250 m.');
  }

  const morphologyMultiplier = morphology
    ? MORPHOLOGY_CONFINEMENT_MULTIPLIERS[morphology]
    : 1.1;

  const effectiveClearanceM = Math.max(
    0.2,
    portalCeilingClearanceM - Math.max(0, tideHeightAboveMllwM * 0.65)
  );

  const amplifiedWaveCrestM =
    significantWaveHeightM *
    Math.pow(chamberConvergenceRatio, 0.55) *
    (1 + (swellPeriodSeconds - 8) * 0.035) *
    morphologyMultiplier;

  const portalPistonSealProbability = roundTo(
    clamp((amplifiedWaveCrestM / (effectiveClearanceM * 1.45)) * 0.62, 0.02, 0.99),
    2
  );

  const pneumaticOverpressureKpa = roundTo(
    clamp(
      portalPistonSealProbability *
        chamberConvergenceRatio *
        (swellPeriodSeconds / 8) *
        18.5 *
        morphologyMultiplier,
      0.5,
      160.0
    ),
    1
  );

  const reboundSurgeVelocityMs = roundTo(
    clamp(
      1.2 +
        significantWaveHeightM * 1.35 * Math.sqrt(chamberConvergenceRatio) +
        swellPeriodSeconds * 0.12,
      0.8,
      16.0
    ),
    1
  );

  const safeSetLullWindowSeconds = Math.round(
    clamp(
      swellPeriodSeconds * 7.5 -
        chamberLengthM * 0.85 -
        portalPistonSealProbability * 55,
      5,
      180
    )
  );

  let safetyStatus: SeaCavePneumaticSafetyStatus;
  if (
    portalPistonSealProbability >= 0.55 ||
    pneumaticOverpressureKpa >= 45 ||
    reboundSurgeVelocityMs >= 6.5 ||
    safeSetLullWindowSeconds < 30
  ) {
    safetyStatus = 'abort_pneumatic_piston_seal_and_blowhole_eruption';
  } else if (
    portalPistonSealProbability >= 0.25 ||
    pneumaticOverpressureKpa >= 18 ||
    reboundSurgeVelocityMs >= 3.8 ||
    swellPeriodSeconds >= 14
  ) {
    safetyStatus = 'caution_acoustic_overpressure_and_rebound_surge';
  } else {
    safetyStatus = 'nominal_vented_slack_swell_window';
  }

  let swellSetTimingProtocol: string;
  let barotraumaAndClapotisAdvisory: string;

  if (safetyStatus === 'abort_pneumatic_piston_seal_and_blowhole_eruption') {
    swellSetTimingProtocol =
      'ABORT SEA-CAVE PORTAL ENTRY: Extreme risk of portal piston-sealing and blowhole pneumatic eruption. Never enter single-outlet dead-end conduits when amplified wave crests exceed 60% of portal ceiling clearance. Time at least two full 15-minute wave set cycles from a safe offshore or rope-belayed rim standoff position and abort all interior traversal.';
    barotraumaAndClapotisAdvisory =
      'Adiabatic air compression (>45 kPa) and violent rebound surge velocities (>6.5 m/s) can rupture tympanic membranes and hurl kayaks or swimmers into ceiling vaults. Enforce vented acoustic earplugs + EN 1385 helmets and stand clear of reflected clapotis backwash jets.';
  } else if (
    safetyStatus === 'caution_acoustic_overpressure_and_rebound_surge'
  ) {
    swellSetTimingProtocol =
      'CAUTION — ACOUSTIC OVERPRESSURE & REBOUND SURGE: Time at least two full 15-minute wave set cycles outside the portal before entry to identify infragravity sneaker wave groups. Never enter single-outlet dead-end conduits when amplified wave crests exceed 60% of portal ceiling clearance; restrict recon to outer vented arches during confirmed set lulls.';
    barotraumaAndClapotisAdvisory =
      'Convergent wall geometry amplifies acoustic shockwaves and standing-wave clapotis. Mandatory vented acoustic earplugs + EN 1385 helmets and 70N+ PFD required; keep bow pointed seaward and brace actively against reflected clapotis backwash.';
  } else {
    swellSetTimingProtocol =
      'NOMINAL VENTED SLACK-SWELL WINDOW: Adequate portal ceiling headroom and low piston-seal probability. Still time at least two full 15-minute wave set cycles outside the portal before entry, and never enter single-outlet dead-end conduits when amplified wave crests exceed 60% of portal ceiling clearance.';
    barotraumaAndClapotisAdvisory =
      'Maintain continuous helmeted & ear-protected posture (vented acoustic earplugs + EN 1385 helmets) against localized acoustic booms, carry an IPX8 headlamp and titanium kelp knife, and brace against reflected clapotis backwash near interior boulder sills.';
  }

  return {
    portalPistonSealProbability,
    pneumaticOverpressureKpa,
    reboundSurgeVelocityMs,
    safeSetLullWindowSeconds,
    safetyStatus,
    swellSetTimingProtocol,
    barotraumaAndClapotisAdvisory,
  };
}
