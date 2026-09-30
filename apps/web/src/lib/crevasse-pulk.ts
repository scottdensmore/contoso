export type GlacierTerrain =
  | 'polar_icecap_plateau'
  | 'crevassed_icefall_labyrinth'
  | 'moraine_firn_basin'
  | 'wind_scoured_sastrugi'
  | 'steep_alpine_headwall';

export type PulkRiggingSystem =
  | 'rigid_fiberglass_shaft_harness'
  | 'rope_trace_with_brake_fin'
  | 'dual_skier_tandem_haul';

export type SnowIceCondition =
  | 'hard_blue_ice'
  | 'wind_packed_firn'
  | 'deep_unconsolidated_powder'
  | 'wet_heavy_slush';

export type CrevasseRisk = 'low' | 'moderate' | 'high' | 'extreme';

export type CrevasseArrestSafety =
  | 'nominal_dynamic_hold'
  | 'caution_overrun_risk'
  | 'critical_arrest_failure_alert';

export interface CrevassePulkRoute {
  id: string;
  title: string;
  region: string;
  system: string;
  elevationMeters: number;
  averageSlopeDeg: number;
  crevassedRisk: CrevasseRisk;
  primaryRigging: PulkRiggingSystem;
  terrain: GlacierTerrain;
  description: string;
  highlights: string[];
}

export interface PulkDynamicsQuery {
  routeId: string;
  riggingSystem: PulkRiggingSystem;
  payloadKg: number; // 20 to 120 kg, default 50
  haulerWeightKg: number; // 50 to 110 kg, default 78
  inclineDegrees: number; // 0 to 25 deg, default 7
  snowCondition: SnowIceCondition; // default 'wind_packed_firn'
  crevasseHazard: CrevasseRisk; // default 'moderate'
}

export interface PulkDynamicsResult {
  routeTitle: string;
  towForceNewtons: number;
  gravityForceNewtons: number;
  frictionForceNewtons: number;
  downhillOverrunJoules: number;
  crevasseArrestForceKiloNewtons: number;
  arrestSafety: CrevasseArrestSafety;
  riggingAdvisory: string;
  crevasseExtractionProtocol: string;
}

export interface PulkGearItem {
  id: string;
  name: string;
  category: 'pulk' | 'harness' | 'braking' | 'crevasse_safety' | 'anchors' | 'storage';
  mandatory: boolean;
  description: string;
}

export const CREVASSE_PULK_ROUTES: CrevassePulkRoute[] = [
  {
    id: 'denali-kahiltna-glacier-highway',
    title: 'Denali Kahiltna Glacier Pulk Ascent',
    region: 'Alaska Range, Alaska, USA',
    system: 'Kahiltna Glacier Basin',
    elevationMeters: 2200,
    averageSlopeDeg: 8.5,
    crevassedRisk: 'high',
    primaryRigging: 'rigid_fiberglass_shaft_harness',
    terrain: 'crevassed_icefall_labyrinth',
    description:
      'High-volume glacial freighting route ascending from Kahiltna Base Camp with active snow bridges and deep hidden crevasses.',
    highlights: [
      'Heavily crevassed lower icefall maze',
      'Heavy 60kg double-carry expedition loads',
      'Rigid fiberglass shafts preventing downhill sled overrun',
    ],
  },
  {
    id: 'bagley-icefield-traverse',
    title: 'Bagley Icefield Polar Traverse',
    region: 'St. Elias Mountains, Alaska, USA',
    system: 'Wrangell-St. Elias Glacial System',
    elevationMeters: 1850,
    averageSlopeDeg: 3.2,
    crevassedRisk: 'moderate',
    primaryRigging: 'rope_trace_with_brake_fin',
    terrain: 'polar_icecap_plateau',
    description:
      'Massive non-polar subarctic icefield with endless wind-packed firm firn and vast rolling expanses requiring low-friction glider pulks.',
    highlights: [
      'Endless glacial icecap horizon',
      'Sastrugi wind-ridge navigation',
      'Long-distance multi-week unsupported sledging',
    ],
  },
  {
    id: 'ruth-gorge-great-gorge-freight',
    title: 'Ruth Glacier Great Gorge Sled Haul',
    region: 'Central Alaska Range, Alaska, USA',
    system: 'Ruth Amphitheater Karst-Granite',
    elevationMeters: 1550,
    averageSlopeDeg: 6.0,
    crevassedRisk: 'moderate',
    primaryRigging: 'rigid_fiberglass_shaft_harness',
    terrain: 'moraine_firn_basin',
    description:
      'Towering granite wall canyon with steep glacier drops, medial moraines, and rapid weather shifts demanding stable pulk control.',
    highlights: [
      'Enclosed granite amphitheater corridor',
      'Medial moraine rock debris transitions',
      'Downhill brake cord deployment',
    ],
  },
  {
    id: 'columbia-icefield-athabasca',
    title: 'Columbia Icefield Glacial Plateau Sledging',
    region: 'Canadian Rockies, Alberta, Canada',
    system: 'Columbia Icefield Basin',
    elevationMeters: 2800,
    averageSlopeDeg: 5.5,
    crevassedRisk: 'high',
    primaryRigging: 'dual_skier_tandem_haul',
    terrain: 'wind_scoured_sastrugi',
    description:
      'Wind-scoured subalpine ice dome characterized by deep lateral crevasses and severe katabatic crosswinds.',
    highlights: [
      'Hard-packed wind sastrugi ridges',
      'Severe sub-zero wind chill factors',
      'Tandem crevasse rope rescue backup',
    ],
  },
  {
    id: 'mount-rainier-ingraham-glacier',
    title: 'Mount Rainier Ingraham Direct Pulk Staging',
    region: 'Cascade Range, Washington, USA',
    system: 'Mount Rainier Volcano Glaciers',
    elevationMeters: 3300,
    averageSlopeDeg: 16.0,
    crevassedRisk: 'extreme',
    primaryRigging: 'rigid_fiberglass_shaft_harness',
    terrain: 'steep_alpine_headwall',
    description:
      'Steep volcanic crevasse chutes requiring winch pulleys, crampon front-pointing, and positive lock sled anchors.',
    highlights: [
      'Steep headwall incline hauling',
      'Serac fall zone velocity requirements',
      'High-angle crevasse arrest protocols',
    ],
  },
];

export const PULK_GEAR_CHECKLIST: PulkGearItem[] = [
  {
    id: 'reinforced-uhmwpe-expedition-pulk',
    name: 'UHMWPE Heavy-Duty Glacial Expedition Pulk (160cm / 80L)',
    category: 'pulk',
    mandatory: true,
    description:
      'Ultra-high-molecular-weight polyethylene hull with twin aluminum tracking skags for tracking across hard glacial blue ice',
  },
  {
    id: 'rigid-fiberglass-crossover-shafts',
    name: 'Locking Aluminum-Jointed Fiberglass Haul Shafts with Hip Harness',
    category: 'harness',
    mandatory: true,
    description:
      "Prevents the pulk from fishtailing or smashing into the mountaineer's heels during steep glacial descents",
  },
  {
    id: 'downhill-trailing-rope-brake',
    name: 'Braided Steel-Core Choke Rope & Prusik Friction Brake',
    category: 'braking',
    mandatory: true,
    description:
      'Automatically tightens underneath the hull during steep descents to maintain manageable sled descent speeds',
  },
  {
    id: 'crevasse-arrest-prussik-haul-rig',
    name: 'Pre-Rigged 8mm Rad-Line Crevasse Drop Harness & Progress Capture Pulley',
    category: 'crevasse_safety',
    mandatory: true,
    description:
      'Allows instant dynamic anchor arrest if either the climber or the pulk plunges into a concealed glacial bergschrund',
  },
  {
    id: 'dual-directional-crevasse-fluke',
    name: 'Forged Aluminum Glacial Snow Anchor Deadman Fluke',
    category: 'anchors',
    mandatory: true,
    description:
      'Rapidly driven into firn snow to build emergency load-rated belays during pulk hauling or crevasse rescue',
  },
  {
    id: 'sub-zero-sled-lashing-cover',
    name: 'Waterproof 1000D Cordura Fitted Pulk Duffel Cover with Compression Straps',
    category: 'storage',
    mandatory: true,
    description:
      'Encloses sleeping systems, fuel cans, and freeze-dried rations to survive blizzard rollovers without load spill',
  },
];

const FRICTION_COEFFICIENTS: Record<SnowIceCondition, number> = {
  hard_blue_ice: 0.04,
  wind_packed_firn: 0.07,
  deep_unconsolidated_powder: 0.16,
  wet_heavy_slush: 0.22,
};

export function getCrevassePulkRoutes(
  terrain?: GlacierTerrain,
  risk?: CrevasseRisk,
): CrevassePulkRoute[] {
  return CREVASSE_PULK_ROUTES.filter((route) => {
    if (terrain && route.terrain !== terrain) {
      return false;
    }
    if (risk && route.crevassedRisk !== risk) {
      return false;
    }
    return true;
  });
}

export function getCrevassePulkRouteById(id: string): CrevassePulkRoute | undefined {
  return CREVASSE_PULK_ROUTES.find((route) => route.id === id);
}

export function calculatePulkDynamics(query: PulkDynamicsQuery): PulkDynamicsResult {
  const route = getCrevassePulkRouteById(query.routeId);
  const routeTitle = route ? route.title : 'Glacial Haul Route';

  const mu = FRICTION_COEFFICIENTS[query.snowCondition] ?? 0.07;
  const rad = (query.inclineDegrees * Math.PI) / 180;

  const gravityForceNewtons = Math.round(query.payloadKg * 9.81 * Math.sin(rad));
  const frictionForceNewtons = Math.round(mu * query.payloadKg * 9.81 * Math.cos(rad));
  const towForceNewtons = gravityForceNewtons + frictionForceNewtons;

  const downhillOverrunJoules = Math.round(
    0.5 * query.payloadKg * (2.0 * 2.0) + query.payloadKg * 9.81 * Math.sin(rad) * 1.5,
  );

  const crevasseArrestForceKiloNewtons =
    Math.round(((query.payloadKg * 9.81 * 1.6) / 1000) * 100) / 100;

  let arrestSafety: CrevasseArrestSafety;
  let riggingAdvisory: string;
  let crevasseExtractionProtocol: string;

  if (
    query.inclineDegrees > 14 &&
    query.riggingSystem !== 'rigid_fiberglass_shaft_harness'
  ) {
    arrestSafety = 'critical_arrest_failure_alert';
    riggingAdvisory =
      'CRITICAL: Non-rigid rope traces on slopes exceeding 14° risk sled collision and uncontrollable downhill overrun. Rigid crossover fiberglass shafts are strictly required to lock pulk tracking.';
    crevasseExtractionProtocol =
      'Emergency deadman anchor deployment required. Drop ice axe into dynamic self-arrest, deploy twin snow flukes, isolate pulk load with Rad-Line progress capture pulley, and prepare 3:1 Z-pulley hoist.';
  } else if (query.payloadKg > 70 && query.crevasseHazard === 'extreme') {
    arrestSafety = 'caution_overrun_risk';
    riggingAdvisory =
      'CAUTION: Heavy expedition load (>70kg) in high-angle extreme crevasse hazard. Trailing friction rope brake and dual-skier tandem or rigid crossover shafts must be engaged to prevent sled runout.';
    crevasseExtractionProtocol =
      'Equalized snow fluke anchors required before approaching bergschrund transitions. Keep 6:1 compound mechanical advantage rescue rig staged with dry-treated dynamic line.';
  } else {
    arrestSafety = 'nominal_dynamic_hold';
    riggingAdvisory =
      'NOMINAL: Pulk tow dynamics and slope resistance are well within standard glacier haul limits. Maintain steady haul cadence and inspect shaft cross-joints periodically.';
    crevasseExtractionProtocol =
      'Standard crevasse arrest protocol: Dynamic self-arrest in firn snowpack, lock haul harness tension, set deadman fluke anchor, and transfer sled weight before assessing crevasse lip.';
  }

  return {
    routeTitle,
    towForceNewtons,
    gravityForceNewtons,
    frictionForceNewtons,
    downhillOverrunJoules,
    crevasseArrestForceKiloNewtons,
    arrestSafety,
    riggingAdvisory,
    crevasseExtractionProtocol,
  };
}

export function getCrevassePulkGearChecklist(): PulkGearItem[] {
  return PULK_GEAR_CHECKLIST;
}
