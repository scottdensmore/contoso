export type SeracHazardLevel = 'low' | 'moderate' | 'high' | 'extreme';
export type CrevassePattern = 'transverse' | 'longitudinal' | 'marginal' | 'bergschrund' | 'icefall_chaos';
export type BridgeSafetyStatus = 'safe_crossing' | 'caution_belayed_crossing_only' | 'hazardous_bypass_required';

export interface GlacierZone {
  id: string;
  title: string;
  glacierSystem: string;
  region: string;
  elevationM: number;
  hazardLevel: SeracHazardLevel;
  crevassePattern: CrevassePattern;
  ladderSectionsRequired: boolean;
  typicalCrossingHours: number;
  description: string;
  routeHighlights: string[];
}

export interface CrevasseNavigationQuery {
  zoneId: string;
  teamSize: number; // 2 to 5 members, default 3
  snowBridgeDepthM: number; // 0.3 to 3.0 m, default 1.2
  crevasseWidthM: number; // 0.5 to 8.0 m, default 2.0
  ambientTempF: number; // -10 to 45 F, default 24
  ropeIntervalM: number; // 8 to 20 m, default 12
}

export interface CrevasseNavigationResult {
  zoneTitle: string;
  spanToDepthRatio: number;
  recommendedIntervalM: number;
  intervalStatus: 'optimal' | 'adequate' | 'unsafe';
  safetyStatus: BridgeSafetyStatus;
  thermalStability: string;
  routeRecommendation: string;
  rescueReserveLengthM: number;
}

export interface GlacierGearItem {
  id: string;
  name: string;
  category: 'probing' | 'rescue' | 'rigging' | 'traction' | 'anchoring' | 'survival';
  mandatory: boolean;
  description: string;
}

export const GLACIER_ZONES: GlacierZone[] = [
  {
    id: 'khumbu-icefall-everest',
    title: 'Khumbu Icefall Lower Maze',
    glacierSystem: 'Khumbu Glacier',
    region: 'Sagarmatha National Park, Nepal',
    elevationM: 5350,
    hazardLevel: 'extreme',
    crevassePattern: 'icefall_chaos',
    ladderSectionsRequired: true,
    typicalCrossingHours: 6.5,
    description:
      'The legendary gateway to the Western Cwm on Mount Everest, featuring towering moving seracs, yawning bottomless crevasses, and chaotic glacial ice blocks.',
    routeHighlights: [
      'Active serac collapse corridors',
      'Aluminum ladder crevasse bridges',
      'Fixed safety line anchors',
    ],
  },
  {
    id: 'ingraham-glacier-rainier',
    title: 'Ingraham Direct & Disappointment Cleaver',
    glacierSystem: 'Ingraham Glacier',
    region: 'Mount Rainier, WA, USA',
    elevationM: 3800,
    hazardLevel: 'high',
    crevassePattern: 'bergschrund',
    ladderSectionsRequired: false,
    typicalCrossingHours: 3.5,
    description:
      'High-altitude volcanic glacier route on Mount Rainier navigating dynamic bergschrund snow bridges, icefall bypasses, and steep firn traverses above Camp Muir.',
    routeHighlights: [
      'Bergschrund snow bridge crossing',
      'Upper icefall bypass traverse',
      'Crevasse field route wanding',
    ],
  },
  {
    id: 'mer-de-glace-geant',
    title: 'Mer de Glace & Glacier du Géant',
    glacierSystem: 'Mer de Glace',
    region: 'Mont Blanc Massif, Chamonix, France',
    elevationM: 3000,
    hazardLevel: 'moderate',
    crevassePattern: 'transverse',
    ladderSectionsRequired: false,
    typicalCrossingHours: 5.0,
    description:
      'Historic Mont Blanc glacier highway traversing expansive transverse crevasse fields, deep blue ice moulins, and steep lateral moraine access points.',
    routeHighlights: [
      'Labyrinth of transverse crevasses',
      'Moulin drainage abyss navigation',
      'Summer serac pinnacle instability',
    ],
  },
  {
    id: 'root-glacier-st-elias',
    title: 'Root & Kennicott Glacier Confluence',
    glacierSystem: 'Root Glacier',
    region: 'Root Glacier, Wrangell-St. Elias National Park, AK, USA',
    elevationM: 1100,
    hazardLevel: 'low',
    crevassePattern: 'longitudinal',
    ladderSectionsRequired: false,
    typicalCrossingHours: 4.0,
    description:
      'Expansive Alaskan sub-polar glacier featuring accessible dry ice fields, step-cutting bypasses around compression moraines, and crystal-clear melt pools.',
    routeHighlights: [
      'Open dry-ice crevasse bypasses',
      'Step-cutting around compression moraines',
      'Blue ice moulins and melt pools',
    ],
  },
  {
    id: 'tasman-glacier-icefall',
    title: 'Upper Tasman Glacier Icefall',
    glacierSystem: 'Tasman Glacier',
    region: 'Aoraki / Mount Cook, New Zealand',
    elevationM: 2200,
    hazardLevel: 'high',
    crevassePattern: 'marginal',
    ladderSectionsRequired: true,
    typicalCrossingHours: 4.5,
    description:
      'Southern Alps premier glaciated terrain characterized by marginal shear fractures, steep bergschrund transitions, and dynamic serac exposure below Mount Cook.',
    routeHighlights: [
      'Dynamic snow bridge collapse cycles',
      'Steep bergschrund negotiation',
      'Glacier headwall serac exposure',
    ],
  },
];

export const GLACIER_GEAR_KIT: GlacierGearItem[] = [
  {
    id: 'avalanche-crevasse-probe',
    name: '320cm Graduated Aluminum Snow & Crevasse Probe for Depth Verification',
    category: 'probing',
    mandatory: true,
    description:
      'Essential for sounding snow bridge thickness, detecting concealed crevasse lips, and measuring firn layer density before committing team weight.',
  },
  {
    id: 'crevasse-rescue-pulley-kit',
    name: 'Micro Traxion, Tibloc, and Prusik Cord Mechanical Advantage Rescue Kit',
    category: 'rescue',
    mandatory: true,
    description:
      'Progress capture pulleys and friction ascenders configured for rapid 3:1 Z-pulley or 6:1 compound mechanical advantage crevasse extrication.',
  },
  {
    id: 'dynamic-dry-glacier-rope',
    name: '60m 8.9mm UIAA Dry-Treated Triple-Rated Dynamic Glacier Rope',
    category: 'rigging',
    mandatory: true,
    description:
      'Water-repellent dry treatment prevents freezing and water absorption in sub-zero snowpacks, absorbing arrest shock during unexpected bridge breakthroughs.',
  },
  {
    id: 'forged-steel-crampons',
    name: '12-Point Forged Steel Semi-Rigid Mountaineering Crampons with Anti-Balling Plates',
    category: 'traction',
    mandatory: true,
    description:
      'Aggressive horizontal front points and dual secondary points provide positive purchase on hard glacier ice, refrozen firn, and steep ladder traverses.',
  },
  {
    id: 'technical-ice-axe',
    name: 'Curved Alpine Mountaineering Ice Axe with Adze for T-Slot Excavation',
    category: 'anchoring',
    mandatory: true,
    description:
      'Engineered for self-arrest in steep firn and adze excavation of deadman T-slots and snow bollards for bombproof rescue anchor stations.',
  },
  {
    id: 'bivy-hypothermia-wrap',
    name: 'Reflective Ultralight Emergency Bivy Sack & Heat-Reflecting Hypothermia Wrap',
    category: 'survival',
    mandatory: true,
    description:
      'Critical thermal defense against rapid hypothermia during prolonged crevasse entrapment and emergency bivouacs in cold glacial environments.',
  },
];

export function getGlacierZones(hazard?: SeracHazardLevel): GlacierZone[] {
  if (!hazard) return GLACIER_ZONES;
  return GLACIER_ZONES.filter((zone) => zone.hazardLevel === hazard);
}

export function getGlacierZoneById(id: string): GlacierZone | undefined {
  return GLACIER_ZONES.find((zone) => zone.id === id);
}

export function calculateCrevasseNavigation(query: CrevasseNavigationQuery): CrevasseNavigationResult {
  const zone = getGlacierZoneById(query.zoneId);
  const zoneTitle = zone ? zone.title : 'Glacier Route';

  const depth = Math.max(0.1, query.snowBridgeDepthM);
  const width = Math.max(0.1, query.crevasseWidthM);
  const spanToDepthRatio = Math.round((depth / width) * 100) / 100;

  const recommendedIntervalM = query.teamSize === 2 ? 15 : 12;

  const intervalDiff = Math.abs(query.ropeIntervalM - recommendedIntervalM);
  let intervalStatus: 'optimal' | 'adequate' | 'unsafe';
  if (intervalDiff <= 1) {
    intervalStatus = 'optimal';
  } else if (intervalDiff <= 3) {
    intervalStatus = 'adequate';
  } else {
    intervalStatus = 'unsafe';
  }

  const totalRopeM = 60;
  const activeRopeM = Math.max(1, query.teamSize - 1) * query.ropeIntervalM;
  const rescueReserveLengthM = Math.max(0, totalRopeM - activeRopeM);

  const isHazardous =
    query.ambientTempF > 34 ||
    query.snowBridgeDepthM < 0.5 ||
    (query.snowBridgeDepthM < 0.8 && query.crevasseWidthM >= 2.0) ||
    spanToDepthRatio < 0.35;

  const isCaution =
    query.ambientTempF >= 30 ||
    query.snowBridgeDepthM < 1.0 ||
    query.crevasseWidthM >= 3.0 ||
    spanToDepthRatio < 0.55;

  let safetyStatus: BridgeSafetyStatus;
  if (isHazardous) {
    safetyStatus = 'hazardous_bypass_required';
  } else if (isCaution) {
    safetyStatus = 'caution_belayed_crossing_only';
  } else {
    safetyStatus = 'safe_crossing';
  }

  let thermalStability: string;
  if (query.ambientTempF > 34) {
    thermalStability =
      'Isothermal melting state: High risk of sudden collapse. Bridge crystalline bonds weakened by liquid water content.';
  } else if (query.ambientTempF >= 30) {
    thermalStability =
      'Marginal freezing threshold: Snow firn softening with active creep deformation under point loads.';
  } else if (query.ambientTempF >= 15) {
    thermalStability =
      'Stable cold firn: Well-bonded crystalline snowpack with high tensile and shear resistance.';
  } else {
    thermalStability =
      'Deep sub-freezing: Brittle firn conditions. Excellent compressive strength; probe for concealed hollow cavities.';
  }

  let routeRecommendation: string;
  if (safetyStatus === 'hazardous_bypass_required') {
    routeRecommendation =
      'Do not cross: Bridge failure hazard imminent. Probe margins for alternative bypass, utilize fixed ladders if equipped, or retreat before solar radiation escalates serac collapse risk.';
  } else if (safetyStatus === 'caution_belayed_crossing_only') {
    routeRecommendation =
      'Belayed individual crossing only: Set snow picket or T-slot anchor on near lip, probe center line, and belay lead member across one at a time on tensioned rope.';
  } else {
    routeRecommendation =
      'Proceed with standard rope team spacing: Maintain taut line, cross perpendicular to crevasse strike, and keep continuous visual and voice communication.';
  }

  return {
    zoneTitle,
    spanToDepthRatio,
    recommendedIntervalM,
    intervalStatus,
    safetyStatus,
    thermalStability,
    routeRecommendation,
    rescueReserveLengthM,
  };
}

export function getGlacierGear(): GlacierGearItem[] {
  return GLACIER_GEAR_KIT;
}
