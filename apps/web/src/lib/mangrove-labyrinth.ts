export type MangroveRootMorphology =
  | 'rhizophora_arching_prop_root_tangle'
  | 'avicennia_dense_pencil_pneumatophore_mat'
  | 'bruguiera_buttress_knee_root_hummocks'
  | 'sonneratia_conical_spike_root_shoal'
  | 'submerged_oyster_encrusted_deadfall_snag';

export type TidalCreekRegime =
  | 'high_slack_canopy_tunnel_float'
  | 'ebb_tide_dendritic_channel_drain'
  | 'flood_tide_sheetflow_inundation'
  | 'spring_low_exposed_sulfidic_mud_plug';

export type EstuarineTraversalMode =
  | 'short_hull_sit_in_creek_kayak'
  | 'sup_finless_shallow_draft_poling'
  | 'root_stepping_and_mud_ski_wading'
  | 'packraft_amphibious_portage';

export type MangroveSafetyStatus =
  | 'nominal_high_slack_canopy_corridor'
  | 'caution_prop_root_pinning_and_oyster_laceration'
  | 'abort_ebb_stranding_or_anoxic_silt_entrapment';

export interface MangroveLabyrinthSite {
  id: string;
  name: string;
  region: string;
  country: string;
  elevationMeters: number;
  rootMorphology: MangroveRootMorphology;
  typicalTidalRegime: TidalCreekRegime;
  recommendedTraversalMode: EstuarineTraversalMode;
  propRootDensityStemsM2: number;
  typicalCurrentVelocityKnots: number;
  typicalWaterDepthOverMudCm: number;
  anoxicSiltSinkDepthCm: number;
  canopyClosurePercent: number;
  highlights: string[];
  bestSeason: string;
}

export interface MangroveGearItem {
  id: string;
  name: string;
  category:
    | 'laceration_and_puncture_armor'
    | 'canopy_propulsion'
    | 'labyrinth_wayfinding';
  mandatory: boolean;
  weightGrams: number;
  rationale: string;
}

export interface MangroveCalculatorInput {
  propRootDensityStemsM2: number;
  tidalCurrentVelocityKnots: number;
  waterDepthOverMudCm: number;
  anoxicSiltSinkDepthCm: number;
  canopyClosurePercent: number;
  tideStageHoursToLow: number;
  rootMorphology?: MangroveRootMorphology;
  tidalRegime?: TidalCreekRegime;
}

export interface MangroveCalculatorResult {
  effectiveChannelSpeedKmHr: number;
  rootStrainerPinningRiskPercent: number;
  anoxicMudEntrapmentProbability: number;
  safeEbbExitWindowMinutes: number;
  safetyStatus: MangroveSafetyStatus;
  dendriticWayfindingProtocol: string;
  oysterArmorAndStrainerAdvisory: string;
}

export const MANGROVE_LABYRINTH_SITES: MangroveLabyrinthSite[] = [
  {
    id: 'everglades-hell-bay-labyrinth-waterway',
    name: 'Hell Bay & Whitewater Bay Rhizophora Prop-Root Wilderness',
    region: 'Everglades National Park, Florida',
    country: 'USA',
    elevationMeters: 0,
    rootMorphology: 'rhizophora_arching_prop_root_tangle',
    typicalTidalRegime: 'high_slack_canopy_tunnel_float',
    recommendedTraversalMode: 'short_hull_sit_in_creek_kayak',
    propRootDensityStemsM2: 14,
    typicalCurrentVelocityKnots: 0.6,
    typicalWaterDepthOverMudCm: 62,
    anoxicSiltSinkDepthCm: 35,
    canopyClosurePercent: 88,
    highlights: [
      'Sub-canopy red mangrove (Rhizophora mangle) tunnels requiring 115 cm breakdown paddles and hand-over-hand prop-root pulling',
      'Numbered PVC chickee markers ending at Lard Can and Pearl Bay where blind side-creeks bifurcate into tannin-stained dead ends',
      'Intertidal eastern oyster (Crassostrea virginica) clusters encrusting lower stilt roots along tidal choke points',
    ],
    bestSeason: 'November – March (Dry-Season High-Slack Window)',
  },
  {
    id: 'sundarbans-harbhanga-tidal-creek-nexus',
    name: 'Harbhanga & Matla Estuarine Pneumatophore Creek Labyrinth',
    region: 'Sundarbans Delta, West Bengal',
    country: 'India',
    elevationMeters: 1,
    rootMorphology: 'avicennia_dense_pencil_pneumatophore_mat',
    typicalTidalRegime: 'ebb_tide_dendritic_channel_drain',
    recommendedTraversalMode: 'short_hull_sit_in_creek_kayak',
    propRootDensityStemsM2: 42,
    typicalCurrentVelocityKnots: 2.4,
    typicalWaterDepthOverMudCm: 48,
    anoxicSiltSinkDepthCm: 72,
    canopyClosurePercent: 76,
    highlights: [
      'Macro-tidal dendritic khals draining rapidly across 42 stems/m² of vertical Avicennia & Sonneratia breathing spikes',
      'Fast 2.4-knot ebb currents that sweep hulls sideways against undercut mudbanks and submerged root strainers',
      'Deep thixotropic estuarine silt banks up to 72 cm thick that instantly immobilize unassisted waders at low water',
    ],
    bestSeason: 'December – February (Winter Neap-to-Mid Tide)',
  },
  {
    id: 'hinchinbrook-missionary-bay-mangrove-tunnels',
    name: 'Missionary Bay & Coral Creek Seven-Creek Mangrove Canopy Tunnels',
    region: 'Hinchinbrook Island, Queensland',
    country: 'Australia',
    elevationMeters: 0,
    rootMorphology: 'bruguiera_buttress_knee_root_hummocks',
    typicalTidalRegime: 'high_slack_canopy_tunnel_float',
    recommendedTraversalMode: 'sup_finless_shallow_draft_poling',
    propRootDensityStemsM2: 19,
    typicalCurrentVelocityKnots: 1.1,
    typicalWaterDepthOverMudCm: 78,
    anoxicSiltSinkDepthCm: 40,
    canopyClosurePercent: 82,
    highlights: [
      'Interconnected Bruguiera gymnorhiza and Rhizophora stylosa creeks linking Missionary Bay across seven numbered tidal conduits',
      'Looped knee-root hummocks and plank buttresses creating shallow-draft poling corridors during flood-to-high slack',
      'Strict hull-on-water protocol required in crocodile-inhabited tropical estuaries with zero bank-exit tolerance',
    ],
    bestSeason: 'May – September (Austral Dry-Season High Slack)',
  },
  {
    id: 'osa-sierpe-terraba-buttress-root-estuary',
    name: 'Térraba-Sierpe Pelliciera & Rhizophora Tidal Swamp Labyrinth',
    region: 'Osa Peninsula, Puntarenas',
    country: 'Costa Rica',
    elevationMeters: 0,
    rootMorphology: 'submerged_oyster_encrusted_deadfall_snag',
    typicalTidalRegime: 'spring_low_exposed_sulfidic_mud_plug',
    recommendedTraversalMode: 'packraft_amphibious_portage',
    propRootDensityStemsM2: 28,
    typicalCurrentVelocityKnots: 2.9,
    typicalWaterDepthOverMudCm: 22,
    anoxicSiltSinkDepthCm: 85,
    canopyClosurePercent: 91,
    highlights: [
      'Towering tea mangrove (Pelliciera rhizophorae) fluted buttresses and submerged deadfall snags coated in razor-sharp mangrove oysters',
      'Extreme 91% canopy closure causing severe multi-GNSS multipath reflection inside winding estero channels',
      'Exposed spring-low sulfidic mud plugs (85 cm sink depth) that strand paddlers who miss the ebb turnaround window',
    ],
    bestSeason: 'January – April (Dry-Season Flood-to-High Tide)',
  },
  {
    id: 'iriomote-nakama-river-bruguiera-knee-root-creek',
    name: 'Nakama & Urauchi River Subtropical Bruguiera Knee-Root Channels',
    region: 'Iriomote Island, Okinawa',
    country: 'Japan',
    elevationMeters: 0,
    rootMorphology: 'sonneratia_conical_spike_root_shoal',
    typicalTidalRegime: 'flood_tide_sheetflow_inundation',
    recommendedTraversalMode: 'root_stepping_and_mud_ski_wading',
    propRootDensityStemsM2: 22,
    typicalCurrentVelocityKnots: 1.4,
    typicalWaterDepthOverMudCm: 54,
    anoxicSiltSinkDepthCm: 45,
    canopyClosurePercent: 79,
    highlights: [
      'Subtropical Sonneratia alba conical spike shoals and Heritiera littoralis ribbon-buttress roots framing clear-to-brackish tributaries',
      'Flood-tide sheetflow over coral-sand and anoxic mud flats requiring careful draft timing to clear root weirs',
      'Sudden typhonal mountain runoff surges interacting with incoming Kuroshio flood tides in narrow upper gorges',
    ],
    bestSeason: 'March – May & October – November (Inter-Monsoon Flood Slack)',
  },
];

export const MANGROVE_LABYRINTH_GEAR_CHECKLIST: MangroveGearItem[] = [
  {
    id: 'kevlar-armored-cut-resistant-oyster-gloves-and-booties',
    name: 'Kevlar-Armored Cut-Resistant Oyster Gloves & Puncture-Proof Booties',
    category: 'laceration_and_puncture_armor',
    mandatory: true,
    weightGrams: 540,
    rationale:
      'ANSI Cut Level A5 Kevlar palms and vulcanized aramid-sole booties prevent deep lacerations from intertidal Crassostrea oyster shells during hand-over-hand prop-root pulling and emergency root-stepping.',
  },
  {
    id: 'compact-115cm-double-blade-breakdown-tunnel-paddle',
    name: 'Compact 115 cm Double-Blade Breakdown Canopy-Tunnel Paddle',
    category: 'canopy_propulsion',
    mandatory: true,
    weightGrams: 680,
    rationale:
      'Converts instantly from a full-length kayak paddle into a short 115 cm canoe/tunnel blade or push-pole when arching Rhizophora prop-root corridors narrow below 1.2 meters.',
  },
  {
    id: 'sub-canopy-multi-gnss-breadcrumb-plotter-and-rheoscopic-compass',
    name: 'Sub-Canopy Multi-Band GNSS Breadcrumb Plotter & Deck-Mounted Compass',
    category: 'labyrinth_wayfinding',
    mandatory: true,
    weightGrams: 310,
    rationale:
      'Dual-frequency L1/L5 satellite tracking paired with a liquid-damped deck compass maintains continuous outbound track logs under >85% wet mangrove canopy closure where single-band GPS drifts.',
  },
  {
    id: 'biodegradable-reflective-retro-clip-trail-markers',
    name: 'Biodegradable High-Visibility Retro-Reflective Confluence Clips (24-Pack)',
    category: 'labyrinth_wayfinding',
    mandatory: true,
    weightGrams: 190,
    rationale:
      'Clipped onto the outbound (seaward) side of every dendritic creek bifurcation and retrieved on the return leg to guarantee positive identification of the main stem during dusk or ebb-tide reversals.',
  },
  {
    id: 'quick-release-tow-belt-and-floating-snag-pruning-saw',
    name: 'Quick-Release Waist Tow-Belt & Sheathed Floating Snag-Clearing Saw',
    category: 'canopy_propulsion',
    mandatory: true,
    weightGrams: 460,
    rationale:
      'Allows immediate hull extraction or deadfall branch clearance if a kayak becomes pinned broadside against a submerged prop-root strainer in accelerating ebb currents.',
  },
  {
    id: 'sealed-permethrin-headnet-and-electrolyte-hydration-bladder',
    name: 'Permethrin-Treated Fine-Mesh No-See-Um Headnet & 3L Insulated Bladder',
    category: 'laceration_and_puncture_armor',
    mandatory: true,
    weightGrams: 420,
    rationale:
      'Shields eyes and airway from dense Culicoides biting midge swarms, mangrove orb-weaver spiders, and heat exhaustion inside stagnant, windless sub-canopy tunnels.',
  },
];

export function getAllMangroveLabyrinthSites(): MangroveLabyrinthSite[] {
  return MANGROVE_LABYRINTH_SITES;
}

export function getMangroveLabyrinthSiteById(
  id: string
): MangroveLabyrinthSite | undefined {
  return MANGROVE_LABYRINTH_SITES.find((site) => site.id === id);
}

export function filterMangroveLabyrinthSites(filters?: {
  rootMorphology?: MangroveRootMorphology;
  tidalRegime?: TidalCreekRegime;
  traversalMode?: EstuarineTraversalMode;
}): MangroveLabyrinthSite[] {
  if (!filters) {
    return MANGROVE_LABYRINTH_SITES;
  }
  return MANGROVE_LABYRINTH_SITES.filter((site) => {
    if (
      filters.rootMorphology &&
      site.rootMorphology !== filters.rootMorphology
    ) {
      return false;
    }
    if (
      filters.tidalRegime &&
      site.typicalTidalRegime !== filters.tidalRegime
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

export function getMangroveLabyrinthGearChecklist(): MangroveGearItem[] {
  return MANGROVE_LABYRINTH_GEAR_CHECKLIST;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

const MORPHOLOGY_DRAG_FACTORS: Record<MangroveRootMorphology, number> = {
  rhizophora_arching_prop_root_tangle: 1.28,
  avicennia_dense_pencil_pneumatophore_mat: 1.15,
  bruguiera_buttress_knee_root_hummocks: 1.08,
  sonneratia_conical_spike_root_shoal: 1.18,
  submerged_oyster_encrusted_deadfall_snag: 1.45,
};

export function calculateMangroveLabyrinthNavigation(
  input: MangroveCalculatorInput
): MangroveCalculatorResult {
  const {
    propRootDensityStemsM2,
    tidalCurrentVelocityKnots,
    waterDepthOverMudCm,
    anoxicSiltSinkDepthCm,
    canopyClosurePercent,
    tideStageHoursToLow,
    rootMorphology,
    tidalRegime,
  } = input;

  if (
    !Number.isFinite(propRootDensityStemsM2) ||
    propRootDensityStemsM2 < 1 ||
    propRootDensityStemsM2 > 120
  ) {
    throw new Error(
      'Invalid propRootDensityStemsM2: must be between 1 and 120 stems/m².'
    );
  }

  if (
    !Number.isFinite(tidalCurrentVelocityKnots) ||
    tidalCurrentVelocityKnots < 0 ||
    tidalCurrentVelocityKnots > 8
  ) {
    throw new Error(
      'Invalid tidalCurrentVelocityKnots: must be between 0 and 8 knots.'
    );
  }

  if (
    !Number.isFinite(waterDepthOverMudCm) ||
    waterDepthOverMudCm < 0 ||
    waterDepthOverMudCm > 350
  ) {
    throw new Error(
      'Invalid waterDepthOverMudCm: must be between 0 and 350 cm.'
    );
  }

  if (
    !Number.isFinite(anoxicSiltSinkDepthCm) ||
    anoxicSiltSinkDepthCm < 5 ||
    anoxicSiltSinkDepthCm > 180
  ) {
    throw new Error(
      'Invalid anoxicSiltSinkDepthCm: must be between 5 and 180 cm.'
    );
  }

  if (
    !Number.isFinite(canopyClosurePercent) ||
    canopyClosurePercent < 0 ||
    canopyClosurePercent > 100
  ) {
    throw new Error(
      'Invalid canopyClosurePercent: must be between 0 and 100 percent.'
    );
  }

  if (
    !Number.isFinite(tideStageHoursToLow) ||
    tideStageHoursToLow < 0 ||
    tideStageHoursToLow > 6.5
  ) {
    throw new Error(
      'Invalid tideStageHoursToLow: must be between 0 and 6.5 hours.'
    );
  }

  const morphologyFactor = rootMorphology
    ? MORPHOLOGY_DRAG_FACTORS[rootMorphology]
    : 1.15;

  const effectiveChannelSpeedKmHr = roundTo(
    clamp(
      (4.8 * Math.min(1.0, waterDepthOverMudCm / 45)) /
        (morphologyFactor *
          (1 +
            propRootDensityStemsM2 * 0.022 +
            tidalCurrentVelocityKnots * 0.18)),
      0.4,
      5.2
    ),
    2
  );

  const rootStrainerPinningRiskPercent = roundTo(
    clamp(
      8 +
        tidalCurrentVelocityKnots * 21.5 +
        propRootDensityStemsM2 * 0.65 +
        (rootMorphology === 'submerged_oyster_encrusted_deadfall_snag'
          ? 18
          : 0),
      4,
      99
    ),
    1
  );

  const anoxicMudEntrapmentProbability = roundTo(
    clamp(
      0.12 +
        (anoxicSiltSinkDepthCm / 150) * 0.55 +
        Math.max(0, 40 - waterDepthOverMudCm) * 0.014 +
        (tidalRegime === 'spring_low_exposed_sulfidic_mud_plug' ? 0.18 : 0),
      0.03,
      0.98
    ),
    2
  );

  const safeEbbExitWindowMinutes = Math.round(
    clamp(
      tideStageHoursToLow * 52 -
        propRootDensityStemsM2 * 1.2 -
        Math.max(0, 50 - waterDepthOverMudCm) * 1.4,
      10,
      320
    )
  );

  let safetyStatus: MangroveSafetyStatus;
  if (
    waterDepthOverMudCm < 25 ||
    anoxicMudEntrapmentProbability >= 0.58 ||
    rootStrainerPinningRiskPercent >= 68 ||
    safeEbbExitWindowMinutes < 40
  ) {
    safetyStatus = 'abort_ebb_stranding_or_anoxic_silt_entrapment';
  } else if (
    waterDepthOverMudCm < 45 ||
    anoxicMudEntrapmentProbability >= 0.32 ||
    rootStrainerPinningRiskPercent >= 36 ||
    tidalCurrentVelocityKnots >= 1.5 ||
    canopyClosurePercent >= 85
  ) {
    safetyStatus = 'caution_prop_root_pinning_and_oyster_laceration';
  } else {
    safetyStatus = 'nominal_high_slack_canopy_corridor';
  }

  const dendriticWayfindingProtocol =
    safetyStatus === 'abort_ebb_stranding_or_anoxic_silt_entrapment'
      ? `ABORT SUB-CANOPY ENTRY: Safe ebb exit window is critically short (${safeEbbExitWindowMinutes} min) with ${canopyClosurePercent}% canopy closure. Mark every confluence on the outbound side with retro-reflective clips, observe suspended tannin-floc flow direction at dendritic forks where GNSS multipath degrades under >80% canopy closure, and retreat immediately to the primary open-water channel before ebb drain exposes impassable mud plugs.`
      : safetyStatus === 'caution_prop_root_pinning_and_oyster_laceration'
        ? `CAUTION WAYFINDING PROTOCOL: Under ${canopyClosurePercent}% canopy closure, record dual-frequency GNSS breadcrumb waypoints while marking every confluence on the outbound side with retro-reflective clips. Track suspended tannin-floc flow direction and pneumatophore wake ripples at dendritic forks to verify the main draining stem before the ${safeEbbExitWindowMinutes}-minute ebb exit window closes.`
        : `NOMINAL HIGH-SLACK WAYFINDING: Maintain active L1/L5 breadcrumb plotting, clip biodegradable retro-reflective markers on the seaward side of each confluence, and monitor suspended tannin-floc flow direction at dendritic forks when GNSS multipath degrades under >80% canopy closure (${safeEbbExitWindowMinutes} min safe ebb window remaining).`;

  const oysterArmorAndStrainerAdvisory =
    safetyStatus === 'abort_ebb_stranding_or_anoxic_silt_entrapment'
      ? `CRITICAL STRAINER & SILT ENTRAPMENT HAZARD: Pinning risk is ${rootStrainerPinningRiskPercent}% and anoxic mud entrapment probability is ${Math.round(anoxicMudEntrapmentProbability * 100)}%. Never step off the hull into thixotropic sulfidic silt (${anoxicSiltSinkDepthCm} cm sink depth); wear ANSI A5 Kevlar cut-resistant gloves before any hand-over-hand prop-root pulling over razor-sharp Crassostrea oyster clusters, and keep a floating snag saw accessible.`
      : safetyStatus === 'caution_prop_root_pinning_and_oyster_laceration'
        ? `ACTIVE OYSTER & PROP-ROOT STRAINER ADVISORY: Switch to a 115 cm breakdown tunnel paddle and wear Kevlar cut-resistant gloves before hand-over-hand prop-root pulling over razor-sharp Crassostrea oyster clusters. Avoid broadside hull alignment in ${tidalCurrentVelocityKnots}-knot currents (${rootStrainerPinningRiskPercent}% pinning risk) and never step off the hull into thixotropic sulfidic silt.`
        : `STANDARD SUB-CANOPY ARMOR PROTOCOL: Wear Kevlar cut-resistant gloves and puncture-proof booties before hand-over-hand prop-root pulling over razor-sharp Crassostrea oyster clusters, stow full-length paddles in narrow arches, and never step off the hull into thixotropic sulfidic silt (${anoxicSiltSinkDepthCm} cm sink depth).`;

  return {
    effectiveChannelSpeedKmHr,
    rootStrainerPinningRiskPercent,
    anoxicMudEntrapmentProbability,
    safeEbbExitWindowMinutes,
    safetyStatus,
    dendriticWayfindingProtocol,
    oysterArmorAndStrainerAdvisory,
  };
}
