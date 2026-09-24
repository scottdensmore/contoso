export type WaterType =
  | 'freshwater_alpine'
  | 'high_elevation_crater'
  | 'glacial_melt_ice'
  | 'alpine_quarry';

export type ThermalExposure =
  | 'drysuit_heavy_undergarment'
  | 'drysuit_light_fleece'
  | 'semidry_8mm'
  | 'wetsuit_7mm_hooded';

export type OverheadCondition =
  | 'open_surface'
  | 'seasonal_ice_cover'
  | 'submerged_timber_canopy'
  | 'overhead_ice_vault';

export interface AlpineScubaSite {
  id: string;
  name: string;
  location: string;
  elevationMeters: number;
  maxDepthMeters: number;
  summerWaterTempC: number;
  winterWaterTempC: number;
  typicalVisibilityMeters: number;
  overheadCondition: OverheadCondition;
  waterType: WaterType;
  description: string;
  highlights: string[];
}

export interface ScubaCalculationQuery {
  siteId: string;
  targetDepthMeters: number; // 5 to 45m
  bottomTimeMinutes: number; // 10 to 60m
  thermalExposure: ThermalExposure;
  waterTempC: number; // -1 to 14°C
}

export interface ScubaCalculationResult {
  siteName: string;
  atmosphericPressureBar: number;
  equivalentSeaLevelDepthMeters: number;
  adjustedNdlMinutes: number;
  decompressionStatus: 'safe_ndl' | 'caution_near_ndl' | 'decompression_required';
  regulatorFreezeRisk: 'low' | 'moderate' | 'high' | 'critical';
  minSurfaceIntervalHours: number;
  thermalProtectionAdvisory: string;
  iceSafetyAdvisory?: string;
}

export interface AlpineScubaGearItem {
  id: string;
  name: string;
  category: 'regulator' | 'drysuit' | 'tether' | 'redundancy' | 'computer' | 'ice_tools';
  mandatory: boolean;
  description: string;
}

export const ALPINE_SCUBA_SITES: AlpineScubaSite[] = [
  {
    id: 'lake-tahoe-rubicon-wall',
    name: 'Rubicon Wall & Emerald Bay',
    location: 'Lake Tahoe, CA/NV',
    elevationMeters: 1897,
    maxDepthMeters: 120,
    summerWaterTempC: 14,
    winterWaterTempC: 4,
    typicalVisibilityMeters: 30,
    overheadCondition: 'open_surface',
    waterType: 'freshwater_alpine',
    description:
      'High Sierra sapphire lake renowned for vertical granite drop-offs, underwater boulder forests, and submerged historic wrecks.',
    highlights: [
      'Emerald Bay underwater heritage trail',
      'Rubicon wall sheer drop-off',
      'Exceptional cobalt alpine clarity',
    ],
  },
  {
    id: 'crater-lake-wizard-island',
    name: 'Wizard Island & Cleetwood Cove',
    location: 'Crater Lake National Park, OR',
    elevationMeters: 1883,
    maxDepthMeters: 85,
    summerWaterTempC: 9,
    winterWaterTempC: 3,
    typicalVisibilityMeters: 40,
    overheadCondition: 'open_surface',
    waterType: 'high_elevation_crater',
    description:
      'Pristine collapsed volcanic caldera filled with pure snowmelt, offering world-class 40-meter visibility and ancient hydrothermal moss towers.',
    highlights: [
      'Hydrothermal deep moss spires',
      'Merriam Cone volcanic slopes',
      'Cleetwood Cove sheer drop-in',
    ],
  },
  {
    id: 'emerald-lake-rockies',
    name: 'Emerald Lake & Burgess Shale Ice Vault',
    location: 'Yoho National Park, BC',
    elevationMeters: 1300,
    maxDepthMeters: 28,
    summerWaterTempC: 8,
    winterWaterTempC: 0,
    typicalVisibilityMeters: 18,
    overheadCondition: 'overhead_ice_vault',
    waterType: 'glacial_melt_ice',
    description:
      'Glacial alpine basin in the Canadian Rockies featuring thick winter ice ceilings, turquoise glacial flour water, and sub-zero overhead ice diving.',
    highlights: [
      'Winter triangle ice entry cut',
      'Glacial turquoise ice light shafts',
      'Timber canopy underwater salvage',
    ],
  },
  {
    id: 'lake-ouananiche-chic-chocs',
    name: 'Lac aux Américains Glacial Cirque',
    location: 'Chic-Chocs, QC',
    elevationMeters: 680,
    maxDepthMeters: 22,
    summerWaterTempC: 6,
    winterWaterTempC: 0,
    typicalVisibilityMeters: 12,
    overheadCondition: 'seasonal_ice_cover',
    waterType: 'glacial_melt_ice',
    description:
      'Steep glacial cirque lake carved into the Chic-Choc peaks, inhabited by Arctic char and covered by three feet of winter ice.',
    highlights: [
      'Sub-zero glacial cirque walls',
      'Arctic char winter habitat',
      'Chainsaw ice trench protocols',
    ],
  },
  {
    id: 'homestake-reservoir-colorado',
    name: 'Homestake Reservoir & Gold Dredge',
    location: 'Leadville, CO',
    elevationMeters: 3115,
    maxDepthMeters: 42,
    summerWaterTempC: 10,
    winterWaterTempC: 1,
    typicalVisibilityMeters: 15,
    overheadCondition: 'submerged_timber_canopy',
    waterType: 'alpine_quarry',
    description:
      'One of the highest diveable bodies of water in North America, featuring submerged gold mining timbers and extreme altitude decompression demands.',
    highlights: [
      'Extreme 3,115m altitude decompression',
      'Submerged mining sluice structures',
      'Cold-water drysuit high-alpine test site',
    ],
  },
];

export const ALPINE_SCUBA_GEAR: AlpineScubaGearItem[] = [
  {
    id: 'environmentally-sealed-coldwater-regulator',
    name: 'Dual Balanced Diaphragm Coldwater Regulators (EN250A Certified)',
    category: 'regulator',
    mandatory: true,
    description:
      'Environmentally dry-sealed first stages with heat-exchanger fins to prevent internal icing and catastrophic free-flow in 0°C water.',
  },
  {
    id: 'compressed-neoprene-drysuit',
    name: 'Kevlar-Reinforced Crushed Neoprene Drysuit & 400g Undergarment',
    category: 'drysuit',
    mandatory: true,
    description:
      'Heavy-duty watertight drysuit with silicone wrist/neck seals, integrated pee-valve, and 400g thinsulate active-thermal fleece undergarment.',
  },
  {
    id: 'harness-ice-tether-carabiner',
    name: '100m Floating Polypropylene Safety Line & Locking Harness Clip',
    category: 'tether',
    mandatory: true,
    description:
      'Highly visible buoyant static tether connecting diver harness to dedicated surface tender with standardized rope tug signals.',
  },
  {
    id: 'dual-independent-redundant-tanks',
    name: 'Independent Twinset Manifold or Dual Sidemount Cylinders',
    category: 'redundancy',
    mandatory: true,
    description:
      'Completely isolated dual gas supply with separate submersible pressure gauges to guarantee redundant breathing gas during a freeze-up.',
  },
  {
    id: 'altitude-decompression-dive-computer',
    name: 'Altitude-Barometric Multi-Gas Dive Computer (Bühlmann ZHL-16C)',
    category: 'computer',
    mandatory: true,
    description:
      'Real-time barometric pressure sensor dive computer configured with conservative altitude gradient factors (40/70) and ascent rate monitor.',
  },
  {
    id: 'chainsaw-ice-trench-clearing-tools',
    name: 'Ice Chainsaw, Egress Safety Ladder & Ice Tongs Set',
    category: 'ice_tools',
    mandatory: true,
    description:
      'High-power ice saw for cutting triangular entry holes, wood safety ladder secured at hole edge, and slush skimmers for overhead egress.',
  },
];

export function getAlpineScubaSites(waterType?: WaterType): AlpineScubaSite[] {
  if (!waterType) {
    return ALPINE_SCUBA_SITES;
  }
  return ALPINE_SCUBA_SITES.filter((site) => site.waterType === waterType);
}

export function getAlpineScubaSiteById(id: string): AlpineScubaSite | undefined {
  return ALPINE_SCUBA_SITES.find((site) => site.id === id);
}

export function getAlpineScubaGear(): AlpineScubaGearItem[] {
  return ALPINE_SCUBA_GEAR;
}

function getBaseNdl(depthMeters: number): number {
  if (depthMeters <= 12) return 130;
  if (depthMeters <= 15) return 75;
  if (depthMeters <= 18) return 50;
  if (depthMeters <= 21) return 35;
  if (depthMeters <= 24) return 28;
  if (depthMeters <= 27) return 22;
  if (depthMeters <= 30) return 18;
  if (depthMeters <= 33) return 14;
  if (depthMeters <= 36) return 12;
  if (depthMeters <= 40) return 9;
  return 7;
}

export function calculateScubaProfile(query: ScubaCalculationQuery): ScubaCalculationResult {
  const site = getAlpineScubaSiteById(query.siteId) ?? ALPINE_SCUBA_SITES[0];

  // Atmospheric pressure Patm (bar)
  const Patm = Math.round(1.0 * Math.exp(-site.elevationMeters / 8434) * 100) / 100;

  // Equivalent Sea Level Depth (ESLD in m)
  const equivalentSeaLevelDepthMeters =
    Math.round((query.targetDepthMeters * (1.0 / Patm)) * 10) / 10;

  // Sea-level base NDL lookup using ESLD
  const baseNdlForEsld = getBaseNdl(equivalentSeaLevelDepthMeters);

  // Altitude-adjusted NDL
  const adjustedNdlMinutes = Math.max(3, Math.round(baseNdlForEsld * Patm));

  // Decompression Status
  let decompressionStatus: 'safe_ndl' | 'caution_near_ndl' | 'decompression_required';
  if (query.bottomTimeMinutes <= adjustedNdlMinutes - 5) {
    decompressionStatus = 'safe_ndl';
  } else if (query.bottomTimeMinutes <= adjustedNdlMinutes) {
    decompressionStatus = 'caution_near_ndl';
  } else {
    decompressionStatus = 'decompression_required';
  }

  // Regulator Freeze Risk
  let regulatorFreezeRisk: 'low' | 'moderate' | 'high' | 'critical';
  if (query.waterTempC <= 2) {
    if (query.targetDepthMeters >= 25) {
      regulatorFreezeRisk = 'critical';
    } else {
      regulatorFreezeRisk = 'high';
    }
  } else if (query.waterTempC <= 5) {
    regulatorFreezeRisk = 'moderate';
  } else {
    regulatorFreezeRisk = 'low';
  }

  // Minimum Surface Interval Hours
  let minSurfaceIntervalHours = 18;
  if (site.elevationMeters > 2000 || query.targetDepthMeters >= 30) {
    minSurfaceIntervalHours = 24;
  }

  // Thermal Protection Advisory
  let thermalProtectionAdvisory: string;
  if (
    query.thermalExposure !== 'drysuit_heavy_undergarment' &&
    query.waterTempC <= 4
  ) {
    thermalProtectionAdvisory =
      'Extreme hypothermia danger: Wetsuits and light drysuit undergarments risk rapid incapacitation in <4°C water. Heavy 400g thinsulate drysuit systems mandatory.';
  } else {
    thermalProtectionAdvisory =
      'Thermal protection configuration matches current water temperature conditions. Maintain thermal envelope integrity throughout dive.';
  }

  // Ice Safety Advisory
  let iceSafetyAdvisory: string | undefined;
  if (
    site.overheadCondition === 'overhead_ice_vault' ||
    site.overheadCondition === 'seasonal_ice_cover'
  ) {
    iceSafetyAdvisory =
      'Overhead Ice Environment: Never enter ice hole without a dedicated surface line tender, locking harness safety tether, and standby safety diver.';
  }

  return {
    siteName: site.name,
    atmosphericPressureBar: Patm,
    equivalentSeaLevelDepthMeters,
    adjustedNdlMinutes,
    decompressionStatus,
    regulatorFreezeRisk,
    minSurfaceIntervalHours,
    thermalProtectionAdvisory,
    iceSafetyAdvisory,
  };
}
