export type KelpForestStratum =
  | 'floating_pneumatocyst_canopy'
  | 'midwater_stipe_columns'
  | 'subcanopy_pterygophora_understory'
  | 'benthic_haptera_holdfast_reef'
  | 'intertidal_surge_channel_ecotone';

export type DominantKelpTaxa =
  | 'macrocystis_pyrifera_giant_kelp'
  | 'nereocystis_luetkeana_bull_kelp'
  | 'ecklonia_radiata_golden_kelp'
  | 'laminaria_hyperborea_cuvie_forest'
  | 'postelsia_palmaeformis_sea_palm';

export type TrophicCascadeState =
  | 'otter_keystone_climax_forest'
  | 'transitional_patch_mosaic'
  | 'purple_urchin_barren_degraded'
  | 'upwelling_nutrient_recovery_bloom';

export type FreediveSafetyStatus =
  | 'optimal_calm_canopy_window'
  | 'caution_stipe_entanglement_swell'
  | 'abort_heavy_surge_low_visibility';

export interface KelpFreedivingSite {
  id: string;
  title: string;
  region: string;
  range: string;
  maxDepthMeters: number;
  dominantStratum: KelpForestStratum;
  primaryTaxa: DominantKelpTaxa;
  trophicState: TrophicCascadeState;
  description: string;
  highlights: string[];
}

export interface KelpFreedivingQuery {
  siteId: string;
  kelpStratum?: KelpForestStratum;
  dominantTaxa?: DominantKelpTaxa;
  targetDepthMeters: number;
  waterTempCelsius: number;
  surgeVelocityMs: number;
  visibilityMeters: number;
  wetsuitThicknessMm: number;
}

export interface KelpFreedivingResult {
  siteTitle: string;
  neutralBuoyancyDepthMeters: number;
  recommendedLeadWeightKg: number;
  safeBottomTimeSeconds: number;
  stipeEntanglementRiskPercent: number;
  holdfastBiodiversityIndex: number;
  safetyStatus: FreediveSafetyStatus;
  canopyEntryProtocol: string;
  holdfastSurveyAdvisory: string;
}

export interface KelpFreedivingGearItem {
  id: string;
  name: string;
  category:
    | 'wetsuit'
    | 'ballast'
    | 'cutting_tool'
    | 'mask_snorkel'
    | 'fins'
    | 'survey';
  mandatory: boolean;
  description: string;
}

export const KELP_FREEDIVING_SITES: KelpFreedivingSite[] = [
  {
    id: 'point-lobos-carmel-pinnacles',
    title: 'Point Lobos State Natural Reserve & Carmel Pinnacles',
    region: 'Monterey Bay, California, USA',
    range: 'Central California Upwelling Current (Carmel Submarine Canyon)',
    maxDepthMeters: 24,
    dominantStratum: 'floating_pneumatocyst_canopy',
    primaryTaxa: 'macrocystis_pyrifera_giant_kelp',
    trophicState: 'otter_keystone_climax_forest',
    description:
      'Cathedral-like giant kelp (Macrocystis pyrifera) spires anchored to granitic pinnacles above the Carmel Submarine Canyon, where southern sea otters maintain a climax trophic state and gas-filled pneumatocysts form dense surface mats.',
    highlights: [
      'Dense floating pneumatocyst surface canopy requiring vertical duck-dive entry through natural skylight windows',
      'Southern sea otter (Enhydra lutris nereis) keystone predation suppressing purple urchin grazing on benthic haptera',
      'Cold nutrient-rich canyon upwelling sustaining blue rockfish schools and encrusting coralline algae reefs',
    ],
  },
  {
    id: 'channel-islands-anacapa-cathedral-cove',
    title: 'Anacapa Island Cathedral Cove & Landing Cove Holdfast Reefs',
    region: 'Channel Islands National Park, California, USA',
    range: 'Santa Barbara Channel (Southern California Bight)',
    maxDepthMeters: 18,
    dominantStratum: 'benthic_haptera_holdfast_reef',
    primaryTaxa: 'macrocystis_pyrifera_giant_kelp',
    trophicState: 'upwelling_nutrient_recovery_bloom',
    description:
      'Volcanic basalt reefs and sea arches sheltering high-visibility Macrocystis forests where intricate root-like haptera holdfasts shelter juvenile Garibaldi, California spiny lobsters, and brittle star assemblages.',
    highlights: [
      'Complex multi-year Macrocystis haptera holdfast domes hosting over 150 species of cryptic benthic invertebrates',
      'Clear transitional confluence of cold California Current and warm Davidson Countercurrent waters',
      'Volcanic surge channels and basaltic boulders patrolled by giant black sea bass and California sheephead',
    ],
  },
  {
    id: 'false-bay-millers-point-great-african-seaforest',
    title: "False Bay Miller's Point & Great African Seaforest",
    region: 'Cape Peninsula, South Africa',
    range: 'Benguela-Agulhas Mixing Zone (Atlantic Cape Coast)',
    maxDepthMeters: 15,
    dominantStratum: 'midwater_stipe_columns',
    primaryTaxa: 'ecklonia_radiata_golden_kelp',
    trophicState: 'transitional_patch_mosaic',
    description:
      'Sublittoral granite boulder labyrinths dominated by hollow-stiped sea bamboo (Ecklonia maxima) and golden kelp (Ecklonia radiata), forming rigid midwater stipe columns navigated by pyjama sharks and Cape rock lobsters.',
    highlights: [
      'Buoyant hollow midwater stipe columns creating shaded sub-canopy swim-throughs over pink crustose coralline boulders',
      'Endemic benthic elasmobranchs including striped pyjama catsharks and shysharks hunting within holdfast crevices',
      'Dynamic Atlantic groundswell refracting around granite pinnacles with variable cold Benguela upwelling thermoclines',
    ],
  },
  {
    id: 'barkley-sound-broken-group-bull-kelp',
    title: 'Barkley Sound Broken Group Islands Bull Kelp Surge Channels',
    region: 'Vancouver Island, BC, Canada',
    range: 'Pacific Rim Outer Coast (Clayoquot & Barkley Sound)',
    maxDepthMeters: 16,
    dominantStratum: 'intertidal_surge_channel_ecotone',
    primaryTaxa: 'nereocystis_luetkeana_bull_kelp',
    trophicState: 'otter_keystone_climax_forest',
    description:
      'High-energy Northeast Pacific surge channels lined with annual bull kelp (Nereocystis luetkeana) whip stipes and intertidal sea palms (Postelsia palmaeformis), thriving in cold, tidal-flushed coastal passages.',
    highlights: [
      'Elastic Nereocystis luetkeana whip stipes tensioned by bidirectional Pacific swell and strong spring tidal currents',
      'Wave-battered rocky intertidal ecotone supporting Postelsia sea palms, giant green anemones, and ochre sea stars',
      'Recovering sea otter trophic cascades restoring dense bull kelp beds over formerly grazed cobble-bedrock shelves',
    ],
  },
  {
    id: 'fortescue-bay-tasman-peninsula-giant-kelp',
    title: 'Fortescue Bay & Tasman Peninsula Subcanopy Kelp Refugia',
    region: 'Tasmania, Australia',
    range: 'Southeastern Tasman Sea (East Australian Current Convergence)',
    maxDepthMeters: 22,
    dominantStratum: 'subcanopy_pterygophora_understory',
    primaryTaxa: 'laminaria_hyperborea_cuvie_forest',
    trophicState: 'purple_urchin_barren_degraded',
    description:
      'Dolerite sea cliff reefs supporting remnant giant kelp and dense leathery subcanopy understory beds threatened by poleward-expanding long-spined sea urchins (Centrostephanus rodgersii) and warming Tasman currents.',
    highlights: [
      'Dense subcanopy understory and Ecklonia/Phyllospora beds clinging to vertical Jurassic dolerite walls',
      'Critical ecological monitoring transects tracking Centrostephanus urchin barren boundaries and weedy seadragon habitat',
      'Deep cold-water refugia requiring precise thermal ballast calibration and benthic quadrat biodiversity logging',
    ],
  },
];

export const KELP_FREEDIVING_GEAR_CHECKLIST: KelpFreedivingGearItem[] = [
  {
    id: 'open-cell-7mm-camo-freedive-wetsuit',
    name: 'Open-Cell 7mm Two-Piece Hooded Freedive Wetsuit',
    category: 'wetsuit',
    mandatory: true,
    description:
      'Buckle-free Yamamoto neoprene two-piece suit with integrated hood eliminates exterior Velcro/zipper snag points against kelp stipes while preventing cold-water flushing in 8–14°C upwelling zones.',
  },
  {
    id: 'quick-release-silicone-rubber-weight-belt',
    name: 'Quick-Release Marseillaise Silicone Weight Belt',
    category: 'ballast',
    mandatory: true,
    description:
      'Elastic silicone belt contracts at depth to stay locked on the hips during vertical duck-dives and features a single-hand quick-release pin for immediate ditching if entangled under a floating canopy.',
  },
  {
    id: 'blunt-tip-titanium-kelp-line-cutter',
    name: 'Dual-Sheathed Blunt-Tip Titanium Kelp & Line Cutter',
    category: 'cutting_tool',
    mandatory: true,
    description:
      'Serrated corrosion-proof titanium blade mounted on the inner calf and upper arm to cleanly sever monofilament fishing line or tensioned Macrocystis stipes without puncturing open-cell neoprene.',
  },
  {
    id: 'low-volume-frameless-freedive-mask-j-snorkel',
    name: 'Low-Volume Frameless Mask & Flexible Collapsible J-Snorkel',
    category: 'mask_snorkel',
    mandatory: true,
    description:
      'Minimal internal air-space mask for effortless equalization paired with a soft, valve-free silicone J-snorkel that removes from the mouth on descent to prevent pneumatocyst and blade drag.',
  },
  {
    id: 'carbon-fiber-long-blade-bi-fins',
    name: 'Streamlined Rail-Protected Carbon Fiber Bi-Fins',
    category: 'fins',
    mandatory: true,
    description:
      'High-modulus carbon blades with closed-heel foot pockets deliver high-thrust propulsion against coastal surge channels with minimal oxygen consumption and zero exposed heel straps.',
  },
  {
    id: 'submersible-slate-benthic-quadrat-frame',
    name: 'Submersible Wrist Slate & Folding 0.25m² Holdfast Quadrat',
    category: 'survey',
    mandatory: true,
    description:
      'Shock-corded PVC quadrat and graphite wrist slate for non-destructive benthic haptera biodiversity indexing, urchin density counts, and holdfast diameter logging during single-breath drops.',
  },
];

export function getKelpFreedivingSites(
  stratum?: KelpForestStratum
): KelpFreedivingSite[] {
  if (!stratum) {
    return KELP_FREEDIVING_SITES;
  }
  return KELP_FREEDIVING_SITES.filter(
    (site) => site.dominantStratum === stratum
  );
}

export function getKelpFreedivingSiteById(
  id: string
): KelpFreedivingSite | undefined {
  return KELP_FREEDIVING_SITES.find((site) => site.id === id);
}

export function getKelpFreedivingGearChecklist(): KelpFreedivingGearItem[] {
  return KELP_FREEDIVING_GEAR_CHECKLIST;
}

export function calculateKelpFreedivingDynamics(
  query: KelpFreedivingQuery
): KelpFreedivingResult {
  const site =
    getKelpFreedivingSiteById(query.siteId) ?? KELP_FREEDIVING_SITES[0];
  const kelpStratum = query.kelpStratum ?? site.dominantStratum;
  const dominantTaxa = query.dominantTaxa ?? site.primaryTaxa;

  // Clamp inputs to realistic coastal freediving bounds
  const targetDepthMeters = Math.min(
    30,
    Math.max(3, query.targetDepthMeters)
  );
  const waterTempCelsius = Math.min(24, Math.max(6, query.waterTempCelsius));
  const surgeVelocityMs = Math.min(2.5, Math.max(0.0, query.surgeVelocityMs));
  const visibilityMeters = Math.min(30, Math.max(1, query.visibilityMeters));
  const wetsuitThicknessMm = Math.min(
    9,
    Math.max(3, query.wetsuitThicknessMm)
  );

  // 1. Neutral Buoyancy Depth (3.0 to 15.0 m)
  // Deeper dives require deeper neutral buoyancy (minimum 10m or 2/3 of target depth, adjusted for wetsuit compression)
  const rawNeutralDepth =
    targetDepthMeters * 0.65 - (wetsuitThicknessMm - 5) * 0.35;
  const neutralBuoyancyDepthMeters = Math.min(
    15.0,
    Math.max(3.0, Math.round(rawNeutralDepth * 10) / 10)
  );

  // 2. Recommended Lead Weight (2.0 to 12.0 kg)
  // Thicker wetsuit increases required lead; deeper target depth reduces lead so diver remains positively buoyant in upper 10m
  const rawLeadWeight =
    wetsuitThicknessMm * 1.15 - (targetDepthMeters - 8) * 0.18 + 0.8;
  const recommendedLeadWeightKg = Math.min(
    12.0,
    Math.max(2.0, Math.round(rawLeadWeight * 10) / 10)
  );

  // 3. Stipe Entanglement Risk (0.0 to 100.0%)
  let stratumRiskBase = 18.0;
  if (kelpStratum === 'floating_pneumatocyst_canopy') stratumRiskBase = 28.0;
  else if (kelpStratum === 'intertidal_surge_channel_ecotone')
    stratumRiskBase = 34.0;
  else if (kelpStratum === 'midwater_stipe_columns') stratumRiskBase = 22.0;
  else if (kelpStratum === 'subcanopy_pterygophora_understory')
    stratumRiskBase = 20.0;
  else if (kelpStratum === 'benthic_haptera_holdfast_reef')
    stratumRiskBase = 16.0;

  let taxaRiskBonus = 0;
  if (dominantTaxa === 'macrocystis_pyrifera_giant_kelp') taxaRiskBonus = 8.0;
  else if (dominantTaxa === 'nereocystis_luetkeana_bull_kelp')
    taxaRiskBonus = 6.0;
  else if (dominantTaxa === 'postelsia_palmaeformis_sea_palm')
    taxaRiskBonus = 5.0;
  else if (dominantTaxa === 'laminaria_hyperborea_cuvie_forest')
    taxaRiskBonus = 4.0;
  else if (dominantTaxa === 'ecklonia_radiata_golden_kelp')
    taxaRiskBonus = 3.0;

  const surgePenalty = surgeVelocityMs * 26.0;
  const lowVisPenalty = Math.max(0, (12 - visibilityMeters) * 2.4);
  const depthPenalty = Math.max(0, (targetDepthMeters - 10) * 0.8);

  const rawEntanglementRisk =
    stratumRiskBase +
    taxaRiskBonus +
    surgePenalty +
    lowVisPenalty +
    depthPenalty;
  const stipeEntanglementRiskPercent = Math.min(
    100.0,
    Math.max(0.0, Math.round(rawEntanglementRisk * 10) / 10)
  );

  // 4. Safe Bottom Time (20 to 120 seconds)
  // Reduced by depth, cold water metabolic oxygen draw, and surge exertion
  const baseBottomTime = 95;
  const depthTimeReduction = (targetDepthMeters - 6) * 2.1;
  const coldWaterReduction = Math.max(0, (14 - waterTempCelsius) * 2.8);
  const surgeExertionReduction = surgeVelocityMs * 18.0;
  const rawBottomTime =
    baseBottomTime -
    depthTimeReduction -
    coldWaterReduction -
    surgeExertionReduction;
  const safeBottomTimeSeconds = Math.min(
    120,
    Math.max(20, Math.round(rawBottomTime))
  );

  // 5. Holdfast Biodiversity Index (0.00 to 1.00)
  let trophicBase = 0.72;
  if (site.trophicState === 'otter_keystone_climax_forest') trophicBase = 0.84;
  else if (site.trophicState === 'upwelling_nutrient_recovery_bloom')
    trophicBase = 0.78;
  else if (site.trophicState === 'transitional_patch_mosaic')
    trophicBase = 0.64;
  else if (site.trophicState === 'purple_urchin_barren_degraded')
    trophicBase = 0.38;

  let stratumBioBonus = 0.0;
  if (kelpStratum === 'benthic_haptera_holdfast_reef') stratumBioBonus = 0.1;
  else if (kelpStratum === 'subcanopy_pterygophora_understory')
    stratumBioBonus = 0.06;
  else if (kelpStratum === 'midwater_stipe_columns') stratumBioBonus = 0.04;
  else if (kelpStratum === 'floating_pneumatocyst_canopy')
    stratumBioBonus = 0.03;
  else if (kelpStratum === 'intertidal_surge_channel_ecotone')
    stratumBioBonus = 0.05;

  // Nutrient-rich cold upwelling water (<14°C) boosts kelp productivity
  const upwellingNutrientBonus =
    waterTempCelsius <= 14 ? (14 - waterTempCelsius) * 0.012 : -0.04;
  const rawBiodiversity =
    trophicBase + stratumBioBonus + upwellingNutrientBonus;
  const holdfastBiodiversityIndex = Math.min(
    1.0,
    Math.max(0.0, Math.round(rawBiodiversity * 100) / 100)
  );

  // 6. Safety Status
  let safetyStatus: FreediveSafetyStatus;
  if (
    surgeVelocityMs >= 1.2 ||
    visibilityMeters < 5 ||
    stipeEntanglementRiskPercent >= 70.0
  ) {
    safetyStatus = 'abort_heavy_surge_low_visibility';
  } else if (
    surgeVelocityMs >= 0.65 ||
    visibilityMeters < 9 ||
    stipeEntanglementRiskPercent >= 45.0 ||
    targetDepthMeters > 18
  ) {
    safetyStatus = 'caution_stipe_entanglement_swell';
  } else {
    safetyStatus = 'optimal_calm_canopy_window';
  }

  // 7. Canopy Entry Protocol
  let canopyEntryProtocol: string;
  if (safetyStatus === 'abort_heavy_surge_low_visibility') {
    canopyEntryProtocol = `ABORT CANOPY PENETRATION: Surge velocity (${surgeVelocityMs.toFixed(2)} m/s) and ${visibilityMeters}m visibility create a ${stipeEntanglementRiskPercent.toFixed(1)}% stipe entanglement hazard. Remain outside the surf-zone kelp edge or abort dive operations immediately.`;
  } else if (kelpStratum === 'floating_pneumatocyst_canopy') {
    canopyEntryProtocol = `SKYLIGHT VERTICAL ENTRY: Remove J-snorkel from mouth prior to duck-diving through open canopy skylights; set neutral buoyancy at ${neutralBuoyancyDepthMeters.toFixed(1)}m (${recommendedLeadWeightKg.toFixed(1)} kg lead on quick-release silicone belt) and part floating Macrocystis fronds laterally with open palms on ascent.`;
  } else if (kelpStratum === 'intertidal_surge_channel_ecotone') {
    canopyEntryProtocol = `SURGE CHANNEL TIMING PROTOCOL: Time vertical descent with the slack trough between wave sets (${surgeVelocityMs.toFixed(2)} m/s surge); keep carbon bi-fins streamlined in the mid-channel axis and maintain one-up/one-down visual buddy contact from the surface.`;
  } else {
    canopyEntryProtocol = `STREAMLINED STIPE CORRIDOR DESCENT: Descend vertically along open sand/rock channels outside dense ${dominantTaxa.replace(/_/g, ' ')} bundles; calibrate ${recommendedLeadWeightKg.toFixed(1)} kg ballast for ${neutralBuoyancyDepthMeters.toFixed(1)}m neutral trim and ascend with one hand extended overhead to part canopy blades.`;
  }

  // 8. Holdfast Survey Advisory
  let holdfastSurveyAdvisory: string;
  if (site.trophicState === 'purple_urchin_barren_degraded') {
    holdfastSurveyAdvisory = `URCHIN BARREN TRANSECT ALERT (HBI ${holdfastBiodiversityIndex.toFixed(2)}): Cap benthic quadrat logging at ${safeBottomTimeSeconds}s bottom time; record purple/long-spined urchin grazing density around remnant haptera cones and avoid gripping brittle, hollowed holdfasts for bottom stabilization.`;
  } else if (kelpStratum === 'benthic_haptera_holdfast_reef') {
    holdfastSurveyAdvisory = `ZERO-CONTACT HAPTERA SURVEY (HBI ${holdfastBiodiversityIndex.toFixed(2)}): Hover 0.5m above benthic haptera domes during ${safeBottomTimeSeconds}s bottom windows; never wedge fingers or fin tips into holdfast crevices to protect cryptic brittle stars, juvenile rockfish, and perennial stipe meristems.`;
  } else {
    holdfastSurveyAdvisory = `TROPHIC CASCADE MONITORING (HBI ${holdfastBiodiversityIndex.toFixed(2)}, ${waterTempCelsius}°C): Limit static holdfast quadrat observation at ${targetDepthMeters}m to ${safeBottomTimeSeconds}s maximum bottom time; log sea otter/predator presence and basal stipe recruitment without disturbing encrusting coralline algae.`;
  }

  return {
    siteTitle: site.title,
    neutralBuoyancyDepthMeters,
    recommendedLeadWeightKg,
    safeBottomTimeSeconds,
    stipeEntanglementRiskPercent,
    holdfastBiodiversityIndex,
    safetyStatus,
    canopyEntryProtocol,
    holdfastSurveyAdvisory,
  };
}
