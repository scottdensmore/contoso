export type GlacierTerrainZone =
  | 'upper_firn_accumulation_basin'
  | 'compressed_icefall_serac_corridor'
  | 'crevasse_lattice_transition_zone'
  | 'bergschrund_headwall_chute'
  | 'subglacial_moraine_terminal_tongue';

export type SnowpackBridgeStability =
  | 'dense_wind_slab_bridge'
  | 'settled_spring_firn_bridge'
  | 'unconsolidated_powder_weak_bridge'
  | 'honeycombed_thermal_ablation_bridge';

export type RopeTravelProtocol =
  | 'roped_ski_tandem_glacier_traverse'
  | 'ski_crevasse_brake_knot_spread'
  | 'unroped_rapid_serac_hazard_sprint'
  | 'guide_belayed_couloir_ski_drop';

export type TraverseHazardLevel =
  | 'low_cold_stable_accumulation'
  | 'moderate_seasonal_bridge_softening'
  | 'severe_serac_toppling_exposure'
  | 'extreme_dynamic_icefall_collapse';

export interface GlacierSkiTraverseSite {
  id: string;
  title: string;
  region: string;
  range: string;
  elevationMeters: number;
  dominantZone: GlacierTerrainZone;
  bridgeStability: SnowpackBridgeStability;
  defaultProtocol: RopeTravelProtocol;
  description: string;
  highlights: string[];
}

export interface GlacierSkiTraverseQuery {
  siteId: string;
  terrainZone?: GlacierTerrainZone;
  bridgeStability?: SnowpackBridgeStability;
  travelersCount: number;
  packWeightKg: number;
  skiWidthWaistMm: number;
  slopeAngleDegrees: number;
  ambientTemperatureC: number;
}

export interface GlacierSkiTraverseResult {
  siteTitle: string;
  bridgeGroundPressureKpa: number;
  crevasseBridgeFailureRisk: number;
  seracCorridorExposureTimeMinutes: number;
  recommendedRopeSpacingMeters: number;
  hazardLevel: TraverseHazardLevel;
  ropeTravelAdvisory: string;
  emergencySkiRescueProtocol: string;
}

export interface GlacierSkiTraverseGearItem {
  id: string;
  name: string;
  category: 'harness_rigging' | 'rescue_rope' | 'pulley_capture' | 'traction' | 'snow_anchor' | 'probe';
  mandatory: boolean;
  description: string;
}

export const GLACIER_SKI_TRAVERSE_SITES: GlacierSkiTraverseSite[] = [
  {
    id: 'haute-route-chamonix-zermatt',
    title: 'Classic Haute Route Glacier Ski-Traverse (Chamonix to Zermatt)',
    region: 'Haute-Savoie / Valais, France & Switzerland',
    range: 'Mont Blanc & Pennine Alps',
    elevationMeters: 3790,
    dominantZone: 'crevasse_lattice_transition_zone',
    bridgeStability: 'settled_spring_firn_bridge',
    defaultProtocol: 'roped_ski_tandem_glacier_traverse',
    description:
      'The quintessential high-alpine ski-traverse weaving between massive sérac fields and crevassed névé basins from Argentière to Zermatt under the Matterhorn.',
    highlights: [
      'Traverse of the Plateau du Couloir and Mont Vélan glacier passes',
      'Critical navigation across the fractured Glacier de Saleina crevasse labyrinth',
      'High-speed descent down the Stockji Glacier serac bench to Zmutt',
    ],
  },
  {
    id: 'spearhead-traverse-whistler',
    title: 'Spearhead Horseshoe Glacier Ski-Traverse',
    region: 'Garibaldi Provincial Park, British Columbia, Canada',
    range: 'Coast Mountains',
    elevationMeters: 2640,
    dominantZone: 'bergschrund_headwall_chute',
    bridgeStability: 'dense_wind_slab_bridge',
    defaultProtocol: 'guide_belayed_couloir_ski_drop',
    description:
      'Rugged horseshoe circumnavigation crossing 13 glaciers and technical alpine cols between Whistler and Blackcomb mountains.',
    highlights: [
      'Steep bootpack and ski descents of Overlord and Tremor Col bergschrund headwalls',
      'Wind-scoured crevasse bridges across the expansive MacBeth Glacier',
      'Dynamic coastal snowpack transitions with maritime wind-slab bridging',
    ],
  },
  {
    id: 'wapta-traverse-canadian-rockies',
    title: 'Wapta Icefield Continental Divide Ski-Traverse',
    region: 'Banff & Yoho National Parks, Alberta & British Columbia, Canada',
    range: 'Canadian Rockies (Continental Divide)',
    elevationMeters: 2850,
    dominantZone: 'upper_firn_accumulation_basin',
    bridgeStability: 'unconsolidated_powder_weak_bridge',
    defaultProtocol: 'ski_crevasse_brake_knot_spread',
    description:
      'Expansive continental icefield traverse over high-elevation firn plateaus, requiring roped glacier travel due to cold, faceted winter snowbridges.',
    highlights: [
      'Vast low-angle firn basins crossing Peyto, Bow, and Balfour Glaciers',
      'High-exposure Balfour High Col icefall navigation between sheer seracs',
      'Cold continental snowpack with persistent depth hoar and weak bridge spans',
    ],
  },
  {
    id: 'berner-oberland-ski-traverse',
    title: 'Bernese Oberland Jungfrau-Aletsch Glacier Ski-Traverse',
    region: 'Canton of Bern / Valais, Switzerland',
    range: 'Bernese Alps',
    elevationMeters: 3460,
    dominantZone: 'compressed_icefall_serac_corridor',
    bridgeStability: 'settled_spring_firn_bridge',
    defaultProtocol: 'unroped_rapid_serac_hazard_sprint',
    description:
      'Massive glaciated alpine traverse traversing the Great Aletsch Glacier—the longest glacier in the Alps—through towering serac bands and icefalls.',
    highlights: [
      'Fast-paced descent through the fractured Konkordiaplatz ice confluence',
      'Overhanging sérac hazard exposure along the Lötschenlücke descent chute',
      'Deep firn reservoirs feeding the 23-kilometer Great Aletsch ice highway',
    ],
  },
  {
    id: 'wrangell-st-elias-bagley-icefield',
    title: 'Bagley Icefield & St. Elias Wilderness Glacier Ski Expedition',
    region: 'Wrangell-St. Elias National Park and Preserve, Alaska, USA',
    range: 'Saint Elias Mountains',
    elevationMeters: 3100,
    dominantZone: 'subglacial_moraine_terminal_tongue',
    bridgeStability: 'honeycombed_thermal_ablation_bridge',
    defaultProtocol: 'roped_ski_tandem_glacier_traverse',
    description:
      'Subarctic wilderness ski-traverse across North America’s largest non-polar icefield, navigating gargantuan crevasses, surging ice, and terminal moraine debris.',
    highlights: [
      'Expansive 200-kilometer glacial system with crevasses wide enough to engulf aircraft',
      'Summer thermal ablation creating honeycombed rotten bridges and supraglacial rivers',
      'Extreme isolation requiring multi-week self-sufficiency and full crevasse hauling kits',
    ],
  },
];

export const GLACIER_SKI_TRAVERSE_GEAR_CHECKLIST: GlacierSkiTraverseGearItem[] = [
  {
    id: 'glacier-skimo-harness-with-ski-slots',
    name: 'Ultralight Glacier Skimo Harness with Clip-In Ski Slots',
    category: 'harness_rigging',
    mandatory: true,
    description:
      'Specialized mountaineering harness designed to don without removing skis or crampons, equipped with reinforced crevasse tie-in loops and ice screw clips.',
  },
  {
    id: 'lightweight-hyperstatic-crevasse-rescue-cord',
    name: 'Lightweight Hyperstatic Crevasse Rescue Cord (6mm x 30m Rad Line)',
    category: 'rescue_rope',
    mandatory: true,
    description:
      'Aramid-core hyperstatic rope with <2% elongation under skier load, preventing rope cutting into crevasse snow lips during arrest and haul operations.',
  },
  {
    id: 'ultra-compact-ski-crevasse-pulley-progress-capture',
    name: 'Ultra-Compact Ski Crevasse Pulley & Progress Capture Device',
    category: 'pulley_capture',
    mandatory: true,
    description:
      'High-efficiency micro-pulley with integrated toothed cam for 3:1 Z-drag and 6:1 complex mechanical advantage hauling systems.',
  },
  {
    id: 'titanium-tech-ski-crampons-ski-mountaineering',
    name: 'Titanium Tech Ski Crampons for Dynafit/Pin Ski Mountaineering Bindings',
    category: 'traction',
    mandatory: true,
    description:
      'Serrated aluminum-titanium ski crampons (couteaux) providing lateral bite on bulletproof wind crust and steep serac icy ramps.',
  },
  {
    id: 'ski-tail-anchor-snow-picket-system',
    name: 'Ski-Tail Anchor Snow Picket & Deadman Rescue System',
    category: 'snow_anchor',
    mandatory: true,
    description:
      'Dual-purpose cable swaged aluminum picket and ski-tail t-slot connector for creating bombproof snow anchors in unconsolidated firn.',
  },
  {
    id: 'collapsible-avalanche-crevasse-probe-320cm',
    name: 'Collapsible Avalanche & Crevasse Sounding Probe (320cm Depth)',
    category: 'probe',
    mandatory: true,
    description:
      'Extra-long depth-graduated probe designed to sound for hidden crevasse voids, assess snowbridge thickness, and verify subsurface ice integrity.',
  },
];

export function getGlacierSkiTraverseSites(
  zone?: GlacierTerrainZone
): GlacierSkiTraverseSite[] {
  if (!zone) {
    return GLACIER_SKI_TRAVERSE_SITES;
  }
  return GLACIER_SKI_TRAVERSE_SITES.filter((site) => site.dominantZone === zone);
}

export function getGlacierSkiTraverseSiteById(
  id: string
): GlacierSkiTraverseSite | undefined {
  return GLACIER_SKI_TRAVERSE_SITES.find((site) => site.id === id);
}

export function getGlacierSkiTraverseGearChecklist(): GlacierSkiTraverseGearItem[] {
  return GLACIER_SKI_TRAVERSE_GEAR_CHECKLIST;
}

export function calculateGlacierSkiTraverseDynamics(
  query: GlacierSkiTraverseQuery
): GlacierSkiTraverseResult {
  const site = getGlacierSkiTraverseSiteById(query.siteId) ?? GLACIER_SKI_TRAVERSE_SITES[0];
  const terrainZone = query.terrainZone ?? site.dominantZone;
  const bridgeStability = query.bridgeStability ?? site.bridgeStability;
  const protocol = site.defaultProtocol;

  // Clamping inputs to physical operational limits
  const travelersCount = Math.min(8, Math.max(1, Math.round(query.travelersCount || 2)));
  const packWeightKg = Math.min(45, Math.max(0, query.packWeightKg));
  const skiWidthWaistMm = Math.min(130, Math.max(65, query.skiWidthWaistMm));
  const slopeAngleDegrees = Math.min(60, Math.max(0, query.slopeAngleDegrees));
  const ambientTemperatureC = Math.min(15, Math.max(-35, query.ambientTemperatureC));

  // 1. Bridge Ground Pressure (3.5 to 18.0 kPa)
  const skierMassKg = 75;
  const totalMassKg = skierMassKg + packWeightKg;
  const effectiveAreaM2 = 2 * 1.65 * (skiWidthWaistMm / 1000) * 0.72;
  const rawPressureKpa = ((totalMassKg * 9.80665) / effectiveAreaM2 / 1000) * 2.2;
  const bridgeGroundPressureKpa = Math.min(
    18.0,
    Math.max(3.5, Math.round(rawPressureKpa * 10) / 10)
  );

  // 2. Crevasse Bridge Failure Risk (0.00 to 1.00)
  let baseRisk = 0.28;
  if (bridgeStability === 'dense_wind_slab_bridge') baseRisk = 0.16;
  else if (bridgeStability === 'settled_spring_firn_bridge') baseRisk = 0.26;
  else if (bridgeStability === 'unconsolidated_powder_weak_bridge') baseRisk = 0.56;
  else if (bridgeStability === 'honeycombed_thermal_ablation_bridge') baseRisk = 0.72;

  // Temperature effect: thermal degradation above 0C or brittleness below -15C
  let tempDelta = 0;
  if (ambientTemperatureC > 0) {
    tempDelta = ambientTemperatureC * 0.045;
  } else if (ambientTemperatureC < -15) {
    tempDelta = (-15 - ambientTemperatureC) * 0.012;
  }

  // Ground pressure impact
  const pressureFactor = ((bridgeGroundPressureKpa - 7.0) / 10.0) * 0.18;

  // Zone multiplier
  let zoneFactor = 0;
  if (terrainZone === 'bergschrund_headwall_chute') zoneFactor = 0.08;
  else if (terrainZone === 'crevasse_lattice_transition_zone') zoneFactor = 0.06;
  else if (terrainZone === 'compressed_icefall_serac_corridor') zoneFactor = 0.05;

  const rawRisk = baseRisk + tempDelta + pressureFactor + zoneFactor;
  const crevasseBridgeFailureRisk = Math.min(
    1.0,
    Math.max(0.0, Math.round(rawRisk * 100) / 100)
  );

  // 3. Serac Corridor Exposure Time (5 to 120 minutes)
  let baseExposureMinutes = 20;
  if (terrainZone === 'compressed_icefall_serac_corridor') baseExposureMinutes = 65;
  else if (terrainZone === 'crevasse_lattice_transition_zone') baseExposureMinutes = 45;
  else if (terrainZone === 'bergschrund_headwall_chute') baseExposureMinutes = 35;
  else if (terrainZone === 'subglacial_moraine_terminal_tongue') baseExposureMinutes = 25;
  else if (terrainZone === 'upper_firn_accumulation_basin') baseExposureMinutes = 15;

  const slopeFactor = (slopeAngleDegrees - 20) * 0.85;
  const travelersFactor = (travelersCount - 2) * 4;
  const rawExposure = baseExposureMinutes + slopeFactor + travelersFactor;
  const seracCorridorExposureTimeMinutes = Math.min(
    120,
    Math.max(5, Math.round(rawExposure))
  );

  // 4. Recommended Rope Spacing (10 to 25 meters)
  let baseSpacing = 15;
  if (protocol === 'ski_crevasse_brake_knot_spread') baseSpacing = 18;
  else if (protocol === 'guide_belayed_couloir_ski_drop') baseSpacing = 22;
  else if (protocol === 'unroped_rapid_serac_hazard_sprint') baseSpacing = 11;
  else if (protocol === 'roped_ski_tandem_glacier_traverse') baseSpacing = 15;

  const riskAdjustment = crevasseBridgeFailureRisk > 0.45 ? 3 : 0;
  const teamAdjustment = travelersCount <= 2 ? 2 : -1;
  const rawSpacing = baseSpacing + riskAdjustment + teamAdjustment;
  const recommendedRopeSpacingMeters = Math.min(
    25,
    Math.max(10, Math.round(rawSpacing))
  );

  // 5. Traverse Hazard Level
  let hazardLevel: TraverseHazardLevel;
  if (
    (terrainZone === 'compressed_icefall_serac_corridor' && seracCorridorExposureTimeMinutes >= 40) ||
    crevasseBridgeFailureRisk >= 0.75
  ) {
    hazardLevel = 'extreme_dynamic_icefall_collapse';
  } else if (seracCorridorExposureTimeMinutes >= 35 || crevasseBridgeFailureRisk >= 0.6) {
    hazardLevel = 'severe_serac_toppling_exposure';
  } else if (
    ambientTemperatureC >= 1 ||
    bridgeStability === 'honeycombed_thermal_ablation_bridge' ||
    crevasseBridgeFailureRisk >= 0.35
  ) {
    hazardLevel = 'moderate_seasonal_bridge_softening';
  } else {
    hazardLevel = 'low_cold_stable_accumulation';
  }

  // 6. Rope Travel Advisory
  let ropeTravelAdvisory: string;
  if (protocol === 'unroped_rapid_serac_hazard_sprint') {
    ropeTravelAdvisory =
      'Sprint through serac collapse fall line without roping up to eliminate collective drag risk; maintain 50m visual intervals and rendezvous only on reinforced moraine benches.';
  } else if (protocol === 'guide_belayed_couloir_ski_drop') {
    ropeTravelAdvisory =
      'Anchor lead skier with T-slot deadman picket before skiing bergschrund drop; maintain tight guide belay and ski one-at-a-time to prevent avalanche triggering on crevasse lips.';
  } else if (protocol === 'ski_crevasse_brake_knot_spread') {
    ropeTravelAdvisory = `Tie 3 butterfly brake knots along the ${recommendedRopeSpacingMeters}m traveler interval to jam into crevasse lips upon breakthrough; keep rope taut and avoid s-turns crossing hidden transverse fractures.`;
  } else {
    ropeTravelAdvisory = `Maintain constant tension on ${recommendedRopeSpacingMeters}m glacier traverse rope; keep ski tips angled perpendicular to suspected crevasse azimuths and ski in tracks of the probe scout.`;
  }

  // 7. Emergency Ski Rescue Protocol
  let emergencySkiRescueProtocol: string;
  if (hazardLevel === 'extreme_dynamic_icefall_collapse') {
    emergencySkiRescueProtocol =
      'Emergency Drop-Loop 6:1 Pulley System: Establish twin-ski deadman anchor outside serac fall line. Immediately lower rescue line with micro-traxion progress capture; clear lip friction with ski poles.';
  } else if (crevasseBridgeFailureRisk >= 0.5) {
    emergencySkiRescueProtocol =
      'Standard 3:1 Z-Drag with Hyperstatic Cord: Skier immediately drop into self-arrest with ice axe/ski tails. Build backed-up picket anchor, send 320cm probe sounding line, and execute controlled haul.';
  } else {
    emergencySkiRescueProtocol =
      'Rapid Skier Assisted Prusik Ascent: Fallen skier deploys foot stirrups and chest harness prusiks to self-ascend hyperstatic cord while surface team constructs lip protector using ski tips.';
  }

  return {
    siteTitle: site.title,
    bridgeGroundPressureKpa,
    crevasseBridgeFailureRisk,
    seracCorridorExposureTimeMinutes,
    recommendedRopeSpacingMeters,
    hazardLevel,
    ropeTravelAdvisory,
    emergencySkiRescueProtocol,
  };
}
