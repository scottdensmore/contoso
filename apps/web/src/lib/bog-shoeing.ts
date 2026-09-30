export type PeatlandTerrain =
  | 'quaking_sphagnum_mat'
  | 'boreal_black_spruce_muskeg'
  | 'patterned_fen_flark'
  | 'open_peat_mire'
  | 'floating_bog_tussock';

export type BogShoeType =
  | 'wide_oval_sphagnum_glider'
  | 'asymmetric_willow_bearpaw'
  | 'composite_mud_flotation_deck';

export type SinkingHazard =
  | 'firm_hummock_support'
  | 'moderate_saturated_slump'
  | 'critical_quaking_mire_submersion';

export type WaterSaturation =
  | 'drained_moss_crust'
  | 'seasonally_flooded'
  | 'fully_saturated_superficial_water';

export interface BogShoeingSite {
  id: string;
  title: string;
  region: string;
  system: string;
  peatDepthMeters: number;
  waterTableDepthCm: number;
  waterSaturation: WaterSaturation;
  terrain: PeatlandTerrain;
  primaryShoe: BogShoeType;
  description: string;
  highlights: string[];
}

export interface BogFlotationQuery {
  siteId: string;
  bogShoeType: BogShoeType;
  hikerWeightKg: number;       // 45 to 130 kg, default 75
  backpackWeightKg: number;    // 0 to 40 kg, default 15
  waterTableDepthCm: number;   // -30 to 20 cm, default 0
  cadenceStepsPerMin: number;  // 20 to 80 SPM, default 40
}

export interface BogFlotationResult {
  siteTitle: string;
  totalLoadKg: number;
  groundPressurePsi: number;
  peatBearingThresholdPsi: number;
  estimatedSinkageCm: number;
  sinkingHazard: SinkingHazard;
  flotationRatio: number;
  navigationAdvisory: string;
  selfRescueProtocol: string;
}

export interface BogGearItem {
  id: string;
  name: string;
  category: 'flotation' | 'navigation' | 'wading' | 'safety' | 'apparel' | 'traction';
  mandatory: boolean;
  description: string;
}

export const BOG_SHOEING_SITES: BogShoeingSite[] = [
  {
    id: 'great-dismal-swamp-quaking-mat',
    title: 'Great Dismal Sphagnum Quake Corridor',
    region: 'Virginia / North Carolina Border',
    system: 'Coastal Peatland Reserve',
    peatDepthMeters: 4.5,
    waterTableDepthCm: -5,
    waterSaturation: 'fully_saturated_superficial_water',
    terrain: 'quaking_sphagnum_mat',
    primaryShoe: 'wide_oval_sphagnum_glider',
    description:
      'Unconsolidated floating peat mats over deep subterranean organic sludge demanding wide-deck flotation and rhythmic stride pacing.',
    highlights: [
      'Floating peat mat elastic oscillations',
      'Deep sub-surface organic muck layers',
      'Restricted Atlantic white cedar groves',
    ],
  },
  {
    id: 'boundary-waters-spruce-muskeg',
    title: 'Boundary Waters Black Spruce Muskeg Traverse',
    region: 'Superior National Forest, Minnesota',
    system: 'Laurentian Mixed Forest Karst-Peat',
    peatDepthMeters: 6.2,
    waterTableDepthCm: -15,
    waterSaturation: 'seasonally_flooded',
    terrain: 'boreal_black_spruce_muskeg',
    primaryShoe: 'asymmetric_willow_bearpaw',
    description:
      'Densely forested boreal tamarack and stunted black spruce muskeg with deep waterlogged moss hollows between woody hummocks.',
    highlights: [
      'Stunted boreal spruce obstacle navigation',
      'Spongy hummock-and-hollow topography',
      'Sub-surface root tangle hazards',
    ],
  },
  {
    id: 'kenai-peninsula-patterned-fen',
    title: 'Kenai Peninsula Patterned Fen & Flark System',
    region: 'Kenai National Wildlife Refuge, Alaska',
    system: 'Subarctic Maritime Peatland',
    peatDepthMeters: 8.0,
    waterTableDepthCm: 5,
    waterSaturation: 'fully_saturated_superficial_water',
    terrain: 'patterned_fen_flark',
    primaryShoe: 'wide_oval_sphagnum_glider',
    description:
      'Vast subarctic ribbed fens with alternating linear moss strings and deep standing water flarks requiring constant water-crossing leaps.',
    highlights: [
      'Alternating flark water channel crossings',
      'High-latitude permafrost peat margins',
      'Subarctic migratory bird breeding grounds',
    ],
  },
  {
    id: 'adirondack-spring-mire-basin',
    title: 'Adirondack High Peaks Spring Mire Basin',
    region: 'Adirondack Park, New York',
    system: 'Northern Boreal Bog Preserve',
    peatDepthMeters: 3.8,
    waterTableDepthCm: -10,
    waterSaturation: 'seasonally_flooded',
    terrain: 'open_peat_mire',
    primaryShoe: 'composite_mud_flotation_deck',
    description:
      'Glacial kettle-hole bog featuring carnivorous pitcher plants, delicate sundews, and deep semi-fluid peat pools.',
    highlights: [
      'Glacial kettle-hole geological formations',
      'Vulnerable carnivorous bog botanical zones',
      'Acidic low-decomposition peat deposits',
    ],
  },
  {
    id: 'algonquin-highland-tussock-fen',
    title: 'Algonquin Highland Floating Tussock Fen',
    region: 'Ontario, Canada',
    system: 'Canadian Shield Boreal Bog System',
    peatDepthMeters: 5.5,
    waterTableDepthCm: 0,
    waterSaturation: 'fully_saturated_superficial_water',
    terrain: 'floating_bog_tussock',
    primaryShoe: 'asymmetric_willow_bearpaw',
    description:
      'Challenging tussock mounds surrounded by quaking muck trenches requiring precise step placement to prevent breakthrough.',
    highlights: [
      'Sedge tussock stepping stone navigation',
      'Cold tannin-stained peat water channels',
      'High-buoyancy hollow moss cushions',
    ],
  },
];

export const BOG_GEAR_CHECKLIST: BogGearItem[] = [
  {
    id: 'wide-deck-sphagnum-bog-shoes',
    name: '36x12-Inch High-Flotation Webbed Sphagnum Bog-Shoes',
    category: 'flotation',
    mandatory: true,
    description:
      'Distributes body weight below 0.35 psi to prevent puncturing the fragile upper living moss rhizome mat',
  },
  {
    id: 'carbon-fiber-bog-probing-pole',
    name: '3.5-Meter Segmented Carbon Peat Sounding & Probing Pole',
    category: 'navigation',
    mandatory: true,
    description:
      'Probes bottomless muck holes, measures water-table depth, and serves as horizontal self-rescue bridge',
  },
  {
    id: 'chest-high-breathable-waders',
    name: 'Puncture-Resistant Neoprene-Reinforced Breathable Bog Waders',
    category: 'wading',
    mandatory: true,
    description:
      'Protects against cold acidic peat water, sharp sub-surface bog iron deposits, and leeches',
  },
  {
    id: 'inflatable-self-rescue-bog-pillow',
    name: 'Rapid-Deploy CO2 Inflatable Peat Breakthrough Rescue Pontoon',
    category: 'safety',
    mandatory: true,
    description:
      'Provides instant 40-pound buoyancy lever to extricate legs trapped in suctioning quaking mire breaches',
  },
  {
    id: 'sealed-tannin-proof-compass',
    name: 'Waterproof Liquid-Filled Mirror Sight Compass with Luminescent Capsule',
    category: 'navigation',
    mandatory: true,
    description:
      'Maintains reliable heading across featureless uniform muskeg plains and trackless boreal fens',
  },
  {
    id: 'antimicrobial-peat-barrier-socks',
    name: 'Silver-Infused Waterproof Barrier Trekking Socks',
    category: 'apparel',
    mandatory: true,
    description:
      'Guards against cold trench-foot immersion injury and fungal dampness during multi-day subarctic traverses',
  },
];

const SHOE_SURFACE_AREA_SQ_IN: Record<BogShoeType, number> = {
  wide_oval_sphagnum_glider: 432,
  asymmetric_willow_bearpaw: 360,
  composite_mud_flotation_deck: 300,
};

const BASE_BEARING_THRESHOLD_PSI: Record<PeatlandTerrain, number> = {
  quaking_sphagnum_mat: 0.38,
  boreal_black_spruce_muskeg: 0.50,
  patterned_fen_flark: 0.30,
  open_peat_mire: 0.42,
  floating_bog_tussock: 0.46,
};

export function getBogShoeingSites(
  terrain?: PeatlandTerrain,
  saturation?: WaterSaturation
): BogShoeingSite[] {
  return BOG_SHOEING_SITES.filter((site) => {
    if (terrain && site.terrain !== terrain) {
      return false;
    }
    if (saturation && site.waterSaturation !== saturation) {
      return false;
    }
    return true;
  });
}

export function getBogShoeingSiteById(id: string): BogShoeingSite | undefined {
  return BOG_SHOEING_SITES.find((site) => site.id === id);
}

export function getBogGearChecklist(): BogGearItem[] {
  return BOG_GEAR_CHECKLIST;
}

export function calculateBogFlotation(query: BogFlotationQuery): BogFlotationResult {
  const site = getBogShoeingSiteById(query.siteId) ?? BOG_SHOEING_SITES[0];
  const totalLoadKg = query.hikerWeightKg + query.backpackWeightKg;
  const surfaceAreaInSqIn = SHOE_SURFACE_AREA_SQ_IN[query.bogShoeType] ?? 360;

  // groundPressurePsi = Math.round(((totalLoadKg * 2.20462) / surfaceAreaInSqIn) * 100) / 100
  const groundPressurePsi =
    Math.round(((totalLoadKg * 2.20462) / surfaceAreaInSqIn) * 100) / 100;

  const baseThreshold = BASE_BEARING_THRESHOLD_PSI[site.terrain] ?? 0.38;
  const peatBearingThresholdPsi =
    query.waterTableDepthCm > 0
      ? Math.round(baseThreshold * 0.85 * 100) / 100
      : baseThreshold;

  const flotationRatio =
    Math.round((peatBearingThresholdPsi / groundPressurePsi) * 100) / 100;

  const estimatedSinkageCm = Math.max(
    1,
    Math.round(
      (groundPressurePsi / peatBearingThresholdPsi) * 4.5 +
        Math.max(0, query.waterTableDepthCm) * 0.2
    )
  );

  let sinkingHazard: SinkingHazard;
  if (
    groundPressurePsi > peatBearingThresholdPsi * 1.25 ||
    estimatedSinkageCm > 14
  ) {
    sinkingHazard = 'critical_quaking_mire_submersion';
  } else if (
    groundPressurePsi > peatBearingThresholdPsi ||
    estimatedSinkageCm > 7
  ) {
    sinkingHazard = 'moderate_saturated_slump';
  } else {
    sinkingHazard = 'firm_hummock_support';
  }

  let navigationAdvisory: string;
  let selfRescueProtocol: string;

  switch (sinkingHazard) {
    case 'critical_quaking_mire_submersion':
      navigationAdvisory =
        'CRITICAL SUBMERSION HAZARD: Ground pressure significantly exceeds peat tensile bearing capacity. Maintain cadence above 50 SPM to prevent static subsidence, avoid resting on flarks, and step strictly on root networks.';
      selfRescueProtocol =
        'Deploy inflatable CO2 pontoon immediately if foot breaks through rhizome crust. Lay probing pole horizontally across moss surface as a weight-distribution bridge, flatten torso across the mat, and lever legs out before suction sets in.';
      break;
    case 'moderate_saturated_slump':
      navigationAdvisory =
        'MODERATE SLUMP RISK: Peat deflection underfoot will compress upper moss layers into the water table. Plan foot placement on raised sedge tussocks and woody hummocks rather than open saturated hollows.';
      selfRescueProtocol =
        'Sound each step ahead with your carbon probing pole. If deck begins sinking past ankle depth, lean backward toward consolidated peat and pull upward using pole leverage before transferring total load.';
      break;
    case 'firm_hummock_support':
    default:
      navigationAdvisory =
        'EXCELLENT FLOTATION: Ground pressure remains within the safe bearing limit of the living sphagnum rhizome mat. Maintain rhythmic pacing and respect fragile peat micro-topography.';
      selfRescueProtocol =
        'Standard precautions apply. Keep chest waders secured and carry probing pole in hand to identify concealed subterranean sinkholes beneath unconsolidated moss shelves.';
      break;
  }

  return {
    siteTitle: site.title,
    totalLoadKg,
    groundPressurePsi,
    peatBearingThresholdPsi,
    estimatedSinkageCm,
    sinkingHazard,
    flotationRatio,
    navigationAdvisory,
    selfRescueProtocol,
  };
}
