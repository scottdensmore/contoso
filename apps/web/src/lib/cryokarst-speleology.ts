export type CryokarstConduitType =
  | 'vertical_moulin_shaft'
  | 'horizontal_subglacial_tunnel'
  | 'bergschrund_fracture_cleft'
  | 'ice_siphon_sump_cave'
  | 'volcanic_fumarole_melt_cave';

export type IceStabilityClass =
  | 'cold_polar_stable'
  | 'temperate_firn_dynamic'
  | 'thermal_ablation_unstable';

export type MeltwaterFlowState =
  | 'bone_dry_winter_dormant'
  | 'low_trickle_frozen'
  | 'moderate_subglacial_stream'
  | 'high_risk_diurnal_surge'
  | 'continuous_thermal_drip';

export type CryokarstAnchorSystem =
  | 'standard_17cm'
  | 'long_21cm'
  | 'v_thread_abalakov';

export type CryokarstSafetyTriage =
  | 'nominal_stable_cold_ice'
  | 'caution_diurnal_melt_monitoring'
  | 'critical_ablation_collapse_danger';

export interface CryokarstSite {
  id: string;
  title: string;
  region: string;
  range: string;
  depthMeters: number;
  conduitType: CryokarstConduitType;
  iceStabilityClass: IceStabilityClass;
  meltwaterFlowState: MeltwaterFlowState;
  description: string;
  highlights: string[];
}

export interface CryokarstDynamicsQuery {
  siteId: string;
  conduitType: CryokarstConduitType; // default 'vertical_moulin_shaft'
  iceStability: IceStabilityClass; // default 'temperate_firn_dynamic'
  anchorSystem: CryokarstAnchorSystem; // default 'v_thread_abalakov'
  ambientIceTempC: number; // -15.0 to 1.0 C, default -2.0
  descentDepthMeters: number; // 10 to 120 m, default 45
  diurnalSolarExposureHours: number; // 0 to 12 hrs, default 4
  teamSize: number; // 2 to 6, default 3
}

export interface CryokarstDynamicsResult {
  siteTitle: string;
  anchorCreepRateMmHr: number; // mm/hr
  thermalAblationVelocityMmDay: number; // mm/day
  jokulhlaupOutburstRiskIndex: number; // 0.00 to 1.00
  safetyTriage: CryokarstSafetyTriage;
  anchorRiggingAdvisory: string;
  subglacialEscapeProtocol: string;
}

export interface CryokarstGearItem {
  id: string;
  name: string;
  category: 'thermal' | 'anchors' | 'safety' | 'lighting' | 'traction';
  mandatory: boolean;
  description: string;
}

export const CRYOKARST_SITES: CryokarstSite[] = [
  {
    id: 'matanuska-glacier-moulin-chamber',
    title: 'Matanuska Glacier Moulin Cathedral & Blue Ice Cavern',
    region: 'Palmer, Alaska, USA',
    range: 'Chugach Mountains',
    depthMeters: 65,
    conduitType: 'vertical_moulin_shaft',
    iceStabilityClass: 'temperate_firn_dynamic',
    meltwaterFlowState: 'moderate_subglacial_stream',
    description:
      'Spectacular 65m vertical moulin chamber entering a crystalline cobalt blue conduit carved through ancient basal glacier ice.',
    highlights: [
      'Deep 65-meter vertical moulin rappel',
      'Curved scalloped blue ice walls',
      'Subglacial meltwater drainage channels',
    ],
  },
  {
    id: 'root-glacier-cryokarst-conduit',
    title: 'Root Glacier Subglacial Fluvial Drainage Cave',
    region: 'Wrangell-St. Elias National Park, Alaska, USA',
    range: 'Wrangell Mountains',
    depthMeters: 45,
    conduitType: 'horizontal_subglacial_tunnel',
    iceStabilityClass: 'temperate_firn_dynamic',
    meltwaterFlowState: 'low_trickle_frozen',
    description:
      'Winding horizontal subglacial river conduit featuring fluted scallops, cryoconite sediment beds, and ice stalactites.',
    highlights: [
      'Sinuous 400m horizontal ice passage',
      'Cryoconite sediment hole analysis',
      'Subglacial sediment transport beds',
    ],
  },
  {
    id: 'athabasca-glacier-crevasse-chasm',
    title: 'Athabasca Glacier Ice Chasm & Bergschrund Crevasse',
    region: 'Jasper National Park, Alberta, Canada',
    range: 'Canadian Rockies',
    depthMeters: 55,
    conduitType: 'bergschrund_fracture_cleft',
    iceStabilityClass: 'cold_polar_stable',
    meltwaterFlowState: 'bone_dry_winter_dormant',
    description:
      'Deep cold-ice crevasse chasm near the headwall bergschrund with dense glacial ice banding and hanging hoarfrost crystals.',
    highlights: [
      'Massive 55m bergschrund cleft descent',
      'Dense annual accumulation ice stratification',
      'Delicate sub-surface hoarfrost feather formations',
    ],
  },
  {
    id: 'gorner-glacier-zermatt-cryokarst',
    title: 'Gorner Glacier Cryokarst Shaft & Ice Siphon Complex',
    region: 'Valais, Switzerland',
    range: 'Pennine Alps',
    depthMeters: 80,
    conduitType: 'ice_siphon_sump_cave',
    iceStabilityClass: 'temperate_firn_dynamic',
    meltwaterFlowState: 'high_risk_diurnal_surge',
    description:
      "One of the world's deepest explored glacier cave systems with multiple sump siphons and complex vertical drop sequences.",
    highlights: [
      'Pioneering European glacial speleology system',
      'Multi-pitch vertical ice descents',
      'Diurnal meltwater flood pulse monitoring',
    ],
  },
  {
    id: 'palmer-glacier-fumarole-ice-caves',
    title: 'Mount Hood Palmer Glacier Fumarole Thermal Ice Caves',
    region: 'Mount Hood Wilderness, Oregon, USA',
    range: 'Cascade Range',
    depthMeters: 35,
    conduitType: 'volcanic_fumarole_melt_cave',
    iceStabilityClass: 'thermal_ablation_unstable',
    meltwaterFlowState: 'continuous_thermal_drip',
    description:
      'Sub-surface volcanic fumaroles venting steam underneath the alpine glacier creating extensive steam-melted ice labyrinths.',
    highlights: [
      'Geothermal volcanic gas venting conduits',
      'Thermal ablation dome ceilings',
      'Multi-gas atmospheric safety monitoring (H2S, CO2)',
    ],
  },
];

export const CRYOKARST_GEAR_CHECKLIST: CryokarstGearItem[] = [
  {
    id: 'sub-zero-dry-caving-suit',
    name: 'Waterproof Cordura Glacial Caving Oversuit with Latex Seals',
    category: 'thermal',
    mandatory: true,
    description:
      'Abrasion-resistant sealed oversuit protecting against freezing spray and subglacial meltwater',
  },
  {
    id: 'dual-tube-stainless-ice-screws',
    name: '21cm Stainless Steel Reverse-Thread Ice Screws with Speed Handles',
    category: 'anchors',
    mandatory: true,
    description:
      'Long-shank ice anchors for setting redundant V-thread Abalakov anchors in temperate glacier ice',
  },
  {
    id: 'abalakov-v-thread-hooker',
    name: 'Rigid Steel V-Thread Snare Tool with Integrated 7mm Coreless Dyneema',
    category: 'anchors',
    mandatory: true,
    description:
      'Essential tool for threading 20cm ice anchors without leaving hardware inside retreating ice',
  },
  {
    id: 'subglacial-multi-gas-detector',
    name: 'Personal 4-Gas Monitor with Audible & Vibrating Alarms (CO, H2S, O2, LEL)',
    category: 'safety',
    mandatory: true,
    description:
      'Mandatory atmospheric monitoring for volcanic fumarole gases and hypoxic subglacial sumps',
  },
  {
    id: 'watertight-submersible-headlamp',
    name: 'IPX8 Submersible 1200-Lumen Glacial Speleo Headlamp with Helmet Mount',
    category: 'lighting',
    mandatory: true,
    description:
      'High-output waterproof illumination for navigating dark moulin chambers and flooded conduits',
  },
  {
    id: 'cryo-traction-ice-crampons',
    name: 'Modular 14-Point Steel Technical Crampons with Neoprene Anti-Balling Plates',
    category: 'traction',
    mandatory: true,
    description:
      'Aggressive front-points for vertical ice walls and anti-balling plates to prevent snow buildup',
  },
];

export function getCryokarstSites(conduitType?: CryokarstConduitType): CryokarstSite[] {
  if (!conduitType) {
    return CRYOKARST_SITES;
  }
  return CRYOKARST_SITES.filter((site) => site.conduitType === conduitType);
}

export function getCryokarstSiteById(id: string): CryokarstSite | undefined {
  return CRYOKARST_SITES.find((site) => site.id === id);
}

export function getCryokarstGearChecklist(): CryokarstGearItem[] {
  return CRYOKARST_GEAR_CHECKLIST;
}

export function calculateCryokarstDynamics(query: CryokarstDynamicsQuery): CryokarstDynamicsResult {
  const site = getCryokarstSiteById(query.siteId) ?? CRYOKARST_SITES[0];

  const tempFactor = Math.max(0.2, (query.ambientIceTempC + 16.0) / 10.0);

  let anchorMultiplier = 1.0;
  if (query.anchorSystem === 'standard_17cm') {
    anchorMultiplier = 1.4;
  } else if (query.anchorSystem === 'long_21cm') {
    anchorMultiplier = 1.0;
  } else if (query.anchorSystem === 'v_thread_abalakov') {
    anchorMultiplier = 0.65;
  }

  const anchorCreepRateMmHr =
    Math.round(1.5 * tempFactor * anchorMultiplier * (query.teamSize / 3.0) * 10) / 10;

  const thermalAblationVelocityMmDay =
    Math.round(
      (5.0 +
        query.diurnalSolarExposureHours * 3.5 +
        (query.iceStability === 'thermal_ablation_unstable' ? 25.0 : 0)) *
        10
    ) / 10;

  const baseOutburstRisk =
    (query.descentDepthMeters / 120.0) * 0.4 +
    (query.diurnalSolarExposureHours / 12.0) * 0.35 +
    (query.iceStability === 'thermal_ablation_unstable' ? 0.25 : 0.05);

  const jokulhlaupOutburstRiskIndex = Math.min(
    0.99,
    Math.max(0.08, Math.round(baseOutburstRisk * 100) / 100)
  );

  let safetyTriage: CryokarstSafetyTriage;
  if (
    jokulhlaupOutburstRiskIndex >= 0.7 ||
    query.iceStability === 'thermal_ablation_unstable' ||
    anchorCreepRateMmHr >= 3.5
  ) {
    safetyTriage = 'critical_ablation_collapse_danger';
  } else if (jokulhlaupOutburstRiskIndex >= 0.4 || query.ambientIceTempC > -1.0) {
    safetyTriage = 'caution_diurnal_melt_monitoring';
  } else {
    safetyTriage = 'nominal_stable_cold_ice';
  }

  let anchorRiggingAdvisory: string;
  if (query.anchorSystem === 'v_thread_abalakov') {
    anchorRiggingAdvisory =
      'Set redundant 60-degree V-Thread Abalakov anchors in dense crystalline ice using 20cm spacing with coreless Dyneema cords. Verify borehole integrity and ice bridge thickness.';
  } else if (query.anchorSystem === 'long_21cm') {
    anchorRiggingAdvisory =
      'Deploy paired 21cm stainless reverse-thread ice screws equalized with dynamic load distribution. Re-test torque resistance every 3 to 4 hours in dynamic firn.';
  } else {
    anchorRiggingAdvisory =
      'Standard 17cm screws suffer accelerated thermal creep in subglacial firn. Supplement with secondary equalized backup or upgrade to long 21cm / Abalakov anchors.';
  }
  if (anchorCreepRateMmHr >= 3.5) {
    anchorRiggingAdvisory +=
      ' WARNING: High anchor creep rate (>3.5 mm/hr) detected. Re-seat anchors frequently and avoid sustained single-point loading.';
  }

  let subglacialEscapeProtocol: string;
  if (safetyTriage === 'critical_ablation_collapse_danger') {
    subglacialEscapeProtocol =
      'EMERGENCY EGRESS: Extreme outburst flood or structural ablation risk. Immediately commence ascending egress up fixed lines; abandon non-essential gear; avoid narrow siphons and moulin sumps.';
  } else if (safetyTriage === 'caution_diurnal_melt_monitoring') {
    subglacialEscapeProtocol =
      'ELEVATED SURGE CAUTION: Maintain continuous radio watch for diurnal melt pulses and surface discharge spikes. Keep ascending ascenders pre-rigged and escape routes unobstructed.';
  } else {
    subglacialEscapeProtocol =
      'STANDARD CAVING PROTOCOL: Cold stable ice regime. Maintain 30-minute check-in intervals with surface watch, log meltwater channel levels, and travel in minimum pairs.';
  }

  return {
    siteTitle: site.title,
    anchorCreepRateMmHr,
    thermalAblationVelocityMmDay,
    jokulhlaupOutburstRiskIndex,
    safetyTriage,
    anchorRiggingAdvisory,
    subglacialEscapeProtocol,
  };
}
