export type SpeleothemType =
  | 'cave_pearl_pisolith'
  | 'eccentric_helictite'
  | 'aragonite_anthodite'
  | 'gypsum_flower_needle'
  | 'rimstone_gour_dam';

export type KarstHostRock =
  | 'ordovician_dolomite'
  | 'mississippian_limestone'
  | 'cretaceous_chalk'
  | 'permian_evaporite_gypsum';

export type ConservationStatus =
  | 'pristine_active_growth'
  | 'vulnerable_low_drip'
  | 'threatened_microclimate_desiccation';

export type PearlRotationState =
  | 'active_polishing_rotation'
  | 'stable_laminar_accretion'
  | 'cementation_stagnation_risk';

export type ConservationTriage =
  | 'nominal_active_mineralization'
  | 'caution_low_saturation'
  | 'critical_desiccation_halt_traffic';

export interface CaveMineralogySite {
  id: string;
  title: string;
  region: string;
  system: string;
  maxDepthMeters: number;
  ambientTempC: number;
  humidityPercent: number;
  speleothemType: SpeleothemType;
  hostRock: KarstHostRock;
  conservationStatus: ConservationStatus;
  description: string;
  highlights: string[];
}

export interface MineralAccretionQuery {
  siteId: string;
  speleothemType: SpeleothemType;
  dripRateDpm: number;         // 1 to 120, default 24
  waterPh: number;             // 6.5 to 8.5, default 7.8
  calciumCarbonatePpm: number; // 50 to 500, default 220
  surveyHours: number;         // 1 to 24, default 4
}

export interface MineralAccretionResult {
  siteTitle: string;
  calciteSaturationIndex: number;
  poolAgitationJoulesPerHour: number;
  rotationState: PearlRotationState;
  estimatedAccretionMicronsPerYear: number;
  triageStatus: ConservationTriage;
  conservationAdvisory: string;
  monitoringProtocol: string;
}

export interface SpeleothemGearItem {
  id: string;
  name: string;
  category: 'optical' | 'survey' | 'hydrology' | 'conservation' | 'transport';
  mandatory: boolean;
  description: string;
}

export const CAVE_MINERALOGY_SITES: CaveMineralogySite[] = [
  {
    id: 'carlsbad-rookery-chamber',
    title: 'Carlsbad Caverns Rookery Nest',
    region: 'Guadalupe Mountains, New Mexico',
    system: 'Capitan Reef Karst',
    maxDepthMeters: 250,
    ambientTempC: 13.5,
    humidityPercent: 98,
    speleothemType: 'cave_pearl_pisolith',
    hostRock: 'permian_evaporite_gypsum',
    conservationStatus: 'pristine_active_growth',
    description:
      'Shallow agitated splash pools with nested nest-like spherical calcite cave pearls formed by constant ceiling drips.',
    highlights: [
      'Polished spherical pisolith clusters',
      'Constant aerosol drip agitation',
      'Restricted scientific conservation zone',
    ],
  },
  {
    id: 'lechuguilla-chandelier-room',
    title: 'Lechuguilla Chandelier Ballroom',
    region: 'Eddy County, New Mexico',
    system: 'Guadalupe Sulfuric Basin',
    maxDepthMeters: 480,
    ambientTempC: 20.0,
    humidityPercent: 100,
    speleothemType: 'gypsum_flower_needle',
    hostRock: 'permian_evaporite_gypsum',
    conservationStatus: 'pristine_active_growth',
    description:
      'World-class 6-meter-long branching gypsum chandeliers and delicate curved gypsum needles growing under hyper-isolated airflows.',
    highlights: [
      'Massive selenitic gypsum chandeliers',
      'Sub-micron aerosol air currents',
      'Strict zero-impact glove-only protocol',
    ],
  },
  {
    id: 'organ-cave-anthodite-gallery',
    title: 'Organ Cave Anthodite Hall',
    region: 'Greenbrier County, West Virginia',
    system: 'Appalachian Karst Highlands',
    maxDepthMeters: 140,
    ambientTempC: 11.2,
    humidityPercent: 96,
    speleothemType: 'aragonite_anthodite',
    hostRock: 'mississippian_limestone',
    conservationStatus: 'vulnerable_low_drip',
    description:
      "Radiating needle-like aragonite 'cave flowers' emerging from damp dolomite fractures under delicate drip seepage.",
    highlights: [
      'Radiating quill-like anthodite clusters',
      'Sensitive microclimate moisture balance',
      'High-humidity drip-rate equilibrium',
    ],
  },
  {
    id: 'mammoth-frozen-niagara',
    title: 'Mammoth Cave Travertine Cascades',
    region: 'Edmonson County, Kentucky',
    system: 'Mississippian Chester Karst',
    maxDepthMeters: 110,
    ambientTempC: 12.8,
    humidityPercent: 94,
    speleothemType: 'rimstone_gour_dam',
    hostRock: 'mississippian_limestone',
    conservationStatus: 'vulnerable_low_drip',
    description:
      'Terraced rimstone dams and flowstone drapes depositing pure calcite from gently spilling supersaturated cave streams.',
    highlights: [
      'Terraced micro-gour pools',
      'Active calcium bicarbonate precipitation',
      'Historic geological exploration route',
    ],
  },
  {
    id: 'blanchard-springs-coral-grotto',
    title: 'Blanchard Springs Coral & Helictite Grotto',
    region: 'Ozark Mountains, Arkansas',
    system: 'Ozark Highland Karst',
    maxDepthMeters: 115,
    ambientTempC: 14.4,
    humidityPercent: 99,
    speleothemType: 'eccentric_helictite',
    hostRock: 'ordovician_dolomite',
    conservationStatus: 'pristine_active_growth',
    description:
      'Gravity-defying helictites that twist horizontally through capillary pressure and rapid hydrostatic changes.',
    highlights: [
      'Capillary-driven helical calcite filaments',
      'Subterranean stream humidity corridor',
      'Active Ozark karst monitoring',
    ],
  },
];

export const SPELEOTHEM_GEAR_CHECKLIST: SpeleothemGearItem[] = [
  {
    id: 'uv-365nm-forensic-lamp',
    name: 'High-Intensity 365nm Filtered UV Speleothem Luminescence Lamp',
    category: 'optical',
    mandatory: true,
    description:
      'Excites fluorescence in calcite crystals to identify organic humic acid growth bands without physical contact',
  },
  {
    id: 'digital-micro-caliper-laser',
    name: 'Non-Contact Sub-Millimeter Laser Profile Gauge & Photogrammetry Scale Bar',
    category: 'survey',
    mandatory: true,
    description:
      'Measures speleothem diameter, pisolith spherical roundness, and accretion rate without touching fragile mineral coats',
  },
  {
    id: 'waterproof-hydro-ph-ec-meter',
    name: 'Micro-Sample Water pH, EC, and Total Dissolved Solids Field Meter',
    category: 'hydrology',
    mandatory: true,
    description:
      'Measures drip water saturation index, calcium hardness, and dissolved carbon dioxide in splash pools',
  },
  {
    id: 'lint-free-nitrile-caver-gloves',
    name: 'Heavy-Duty Powder-Free Textured Nitrile Survey Gloves (Pack of 12)',
    category: 'conservation',
    mandatory: true,
    description:
      'Prevents skin lipids, oils, and perspiration acids from contaminating active calcite crystal nucleation surfaces',
  },
  {
    id: 'subterranean-acoustic-drip-counter',
    name: 'Submersible Piezoelectric Acoustic Cave Drip Rate Sensor',
    category: 'hydrology',
    mandatory: true,
    description:
      'Logs drip frequency in drips per minute (DPM) to assess seasonal aquifer recharge and pool agitation energy',
  },
  {
    id: 'sealed-pelican-specimen-case',
    name: 'Pressure-Equalized Foam-Lined Waterproof Scientific Speleothem Case',
    category: 'transport',
    mandatory: true,
    description:
      'Safeguards fragile fallen crystal flakes, sediment samples, and micro-sensors across tight crawlways',
  },
];

export function getCaveMineralogySites(
  speleothemType?: SpeleothemType,
  conservation?: ConservationStatus
): CaveMineralogySite[] {
  return CAVE_MINERALOGY_SITES.filter((site) => {
    if (speleothemType && site.speleothemType !== speleothemType) {
      return false;
    }
    if (conservation && site.conservationStatus !== conservation) {
      return false;
    }
    return true;
  });
}

export function getCaveMineralogySiteById(id: string): CaveMineralogySite | undefined {
  return CAVE_MINERALOGY_SITES.find((site) => site.id === id);
}

export function getSpeleothemGearChecklist(): SpeleothemGearItem[] {
  return SPELEOTHEM_GEAR_CHECKLIST;
}

export function calculateMineralAccretion(query: MineralAccretionQuery): MineralAccretionResult {
  const site = getCaveMineralogySiteById(query.siteId);
  const siteTitle = site ? site.title : 'Subterranean Speleothem Basin';

  const calciteSaturationIndex =
    Math.round(((query.waterPh - 7.0) * 0.6 + (query.calciumCarbonatePpm - 200) / 400) * 100) / 100;

  const poolAgitationJoulesPerHour =
    Math.round(query.dripRateDpm * 0.045 * 100) / 100;

  let rotationState: PearlRotationState;
  if (query.dripRateDpm >= 40 && calciteSaturationIndex > 0.4) {
    rotationState = 'active_polishing_rotation';
  } else if (query.dripRateDpm >= 15 && calciteSaturationIndex > 0.1) {
    rotationState = 'stable_laminar_accretion';
  } else {
    rotationState = 'cementation_stagnation_risk';
  }

  const estimatedAccretionMicronsPerYear = Math.max(
    1,
    Math.round(calciteSaturationIndex * 25.0 * (query.dripRateDpm / 20.0))
  );

  let triageStatus: ConservationTriage;
  if (calciteSaturationIndex < 0.0 || query.dripRateDpm < 5) {
    triageStatus = 'critical_desiccation_halt_traffic';
  } else if (calciteSaturationIndex < 0.2) {
    triageStatus = 'caution_low_saturation';
  } else {
    triageStatus = 'nominal_active_mineralization';
  }

  let conservationAdvisory: string;
  if (triageStatus === 'critical_desiccation_halt_traffic') {
    conservationAdvisory =
      'CRITICAL DESICCATION ALERT: Severe drip starvation or water undersaturation detected. Risk of mineral dissolution and calcitic pearl floor cementation. Immediately halt caver foot traffic, seal microclimate airflow corridors, and log acoustic hydro-recharge.';
  } else if (triageStatus === 'caution_low_saturation') {
    conservationAdvisory =
      'CAUTION: Marginal calcium carbonate saturation. Accretion rates are diminished with localized vulnerability to microclimate turbulence. Maintain non-contact photogrammetric observation and monitor pool evaporation.';
  } else {
    conservationAdvisory =
      'NOMINAL MINERALIZATION: Hydrochemical saturation and drip kinetics support active speleothem development and smooth concentric crystal accretion. Continue baseline non-destructive monitoring.';
  }

  let monitoringProtocol: string;
  switch (query.speleothemType) {
    case 'cave_pearl_pisolith':
      monitoringProtocol =
        'Pisolith Nest Protocol: Deploy non-contact laser calipers across orthogonal axes. Record pool hydrodynamic agitation and verify splash cup concentric polishing without disturbing resting sediment nests.';
      break;
    case 'eccentric_helictite':
      monitoringProtocol =
        'Helictite Capillary Protocol: Measure hydrostatic fracture moisture and relative humidity at >= 98%. Strictly avoid artificial convective airflows that induce micro-desiccation.';
      break;
    case 'aragonite_anthodite':
      monitoringProtocol =
        'Anthodite Needle Protocol: Map needle radiating quill tips with high-resolution UV macro-luminescence. Record magnesium-to-calcium solute ratios in host fracture seepage.';
      break;
    case 'gypsum_flower_needle':
      monitoringProtocol =
        'Gypsum Ballroom Protocol: Implement clean-room cavern suit controls. Airflow velocity must remain sub-micron to avoid brittle fracture of curved branching selenitic blades.';
      break;
    case 'rimstone_gour_dam':
      monitoringProtocol =
        'Rimstone Gour Dam Protocol: Inspect travertine spillway lips for laminar sheet flow. Measure dissolved CO2 degassing gradient between upper cascade pools and lower reservoirs.';
      break;
    default:
      monitoringProtocol =
        'Standard Speleological Protocol: Non-contact photographic survey scale bar inspection and continuous multi-sensor microclimate data logging.';
  }

  return {
    siteTitle,
    calciteSaturationIndex,
    poolAgitationJoulesPerHour,
    rotationState,
    estimatedAccretionMicronsPerYear,
    triageStatus,
    conservationAdvisory,
    monitoringProtocol,
  };
}
