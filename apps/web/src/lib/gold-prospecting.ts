export type DepositType =
  | 'stream_gravel_riffle'
  | 'inside_bend_gravel_bar'
  | 'bedrock_crevice'
  | 'bench_placer_terrace';

export type SeparationMethod =
  | 'gravity_pan'
  | 'sluice_box'
  | 'snuffer_bottle_suction'
  | 'crevice_pick_extraction';

export type SluiceStatus =
  | 'optimal_riffle_recovery'
  | 'underflow_clogging_risk'
  | 'scour_blowout_velocity';

export interface GoldProspectingSite {
  id: string;
  title: string;
  region: string;
  riverSystem: string;
  elevationMeters: number;
  typicalGravelType: string;
  depositType: DepositType;
  maxHistoricalYieldGPerTon: number;
  accessDifficulty: 'easy_walk_in' | 'moderate_hike' | 'remote_pack_in' | 'rugged_canyon_scramble';
  description: string;
  highlights: string[];
}

export interface PlacerCalculationQuery {
  siteId: string;
  gravelVolumeBuckets: number;   // 1 to 50 buckets (5-gal)
  sluiceSlopeDeg: number;        // 4 to 12 degrees
  streamFlowVelocityFps: number; // 1.5 to 7.0 feet per second
  separationMethod: SeparationMethod;
}

export interface PlacerCalculationResult {
  siteTitle: string;
  expectedConcentrateGrams: number;
  recoveryEfficiencyPercent: number;
  sluiceStatus: SluiceStatus;
  densityRatio: number;
  recoveryAdvisory: string;
  regulatoryAdvisory: string;
}

export interface ProspectingGearItem {
  id: string;
  name: string;
  category: 'pan' | 'classifier' | 'sluice' | 'crevice_tools' | 'recovery' | 'magnet';
  mandatory: boolean;
  description: string;
}

export const GOLD_PROSPECTING_SITES: GoldProspectingSite[] = [
  {
    id: 'american-river-south-fork',
    title: 'South Fork American River & Coloma Shallows',
    region: 'El Dorado County, CA',
    riverSystem: 'American River Basin',
    elevationMeters: 230,
    typicalGravelType: 'Cobble & Quartz Gravel Bar',
    depositType: 'inside_bend_gravel_bar',
    maxHistoricalYieldGPerTon: 4.8,
    accessDifficulty: 'easy_walk_in',
    description:
      'Historic Gold Rush waterway characterized by broad inside point bars, decomposed granite sand, and accessible placer gravels.',
    highlights: [
      'Gold Discovery Park gravel shallows',
      'Inside meander sand deposition zones',
      'Fine flake and flour gold recovery',
    ],
  },
  {
    id: 'cache-creek-colorado',
    title: 'Cache Creek Placer Basin & Granite Gulch',
    region: 'Chaffee County, CO',
    riverSystem: 'Arkansas River Basin',
    elevationMeters: 2850,
    typicalGravelType: 'Glacial Till & Granite Boulders',
    depositType: 'bench_placer_terrace',
    maxHistoricalYieldGPerTon: 3.2,
    accessDifficulty: 'moderate_hike',
    description:
      'High-altitude glacial terrace deposit overlooking the Sawatch Range, featuring ancient stream benches and coarse angular gold flakes.',
    highlights: [
      'Public placer prospecting reserve',
      'Glacial moraine pay-dirt layers',
      'Subalpine panning sluicing stations',
    ],
  },
  {
    id: 'fairbanks-pedro-creek',
    title: 'Pedro Creek & Tanana Valley Basin',
    region: 'Interior Alaska, AK',
    riverSystem: 'Tanana River System',
    elevationMeters: 310,
    typicalGravelType: 'Schist & Bedrock Crevice Fractures',
    depositType: 'bedrock_crevice',
    maxHistoricalYieldGPerTon: 6.5,
    accessDifficulty: 'rugged_canyon_scramble',
    description:
      'Legendary sub-arctic bedrock waterway where deep schist fractures trap coarse nuggets and heavy wire gold beneath turbulent gravel runs.',
    highlights: [
      'Exposed bedrock trap pockets',
      'Historic Felix Pedro strike site',
      'Coarse nugget crevice extraction',
    ],
  },
  {
    id: 'rogue-river-galice',
    title: 'Galice Creek & Rogue River Canyon',
    region: 'Josephine County, OR',
    riverSystem: 'Rogue River Basin',
    elevationMeters: 195,
    typicalGravelType: 'Metamorphic River Gravels',
    depositType: 'stream_gravel_riffle',
    maxHistoricalYieldGPerTon: 3.9,
    accessDifficulty: 'moderate_hike',
    description:
      'Rugged Klamath-Siskiyou canyon tributary known for fast water velocity, black magnetic sand concentrations, and heavy placer pickers.',
    highlights: [
      'Klamath terrane gravel bars',
      'Heavy magnetite black sand paystreaks',
      'Natural underwater boulder riffles',
    ],
  },
  {
    id: 'swift-river-new-hampshire',
    title: 'Swift River Glacial Placer Bed',
    region: 'White Mountains, NH',
    riverSystem: 'Saco River Basin',
    elevationMeters: 380,
    typicalGravelType: 'Glacial Outwash & Quartz Sand',
    depositType: 'stream_gravel_riffle',
    maxHistoricalYieldGPerTon: 1.4,
    accessDifficulty: 'easy_walk_in',
    description:
      'Scenic granite mountain stream in the White Mountain National Forest with glacial flour deposits, recreational hand-panning, and crystal water.',
    highlights: [
      'White Mountain National Forest access',
      'Glacial pothole trap basins',
      'Recreational hand-pan gold zones',
    ],
  },
];

export const PROSPECTING_GEAR: ProspectingGearItem[] = [
  {
    id: 'dual-riffle-gold-pan',
    name: '14-Inch Deep-Drop Dual Riffle Gravity Pan',
    category: 'pan',
    mandatory: true,
    description:
      'High-contrast dark green polymer pan with 90-degree deep riffles and micro-riffles engineered for rapid gravity stratification and flake retention.',
  },
  {
    id: 'classifier-sieve-set',
    name: '1/2-Inch & 1/4-Inch Stainless Classifier Sieve Set',
    category: 'classifier',
    mandatory: true,
    description:
      'Heavy-gauge stainless steel mesh screens sized to nest over 5-gallon buckets, removing oversized barren cobbles before panning.',
  },
  {
    id: 'compact-backpacking-sluice',
    name: "50-Inch Aircraft Aluminum Backpacking Sluice Box with Hungarian Riffles & Miner's Moss",
    category: 'sluice',
    mandatory: true,
    description:
      "Ultra-light folded aluminum sluice channel outfitted with zinc-plated steel Hungarian riffles, expanded metal grate, and blue woven miner's moss.",
  },
  {
    id: 'hardened-crevice-tool-set',
    name: 'Drop-Forged Bedrock Crevice Tool & Spoon Pick',
    category: 'crevice_tools',
    mandatory: true,
    description:
      'Tempered forged carbon steel pry bars with angled scraper tip and spoon end to evacuate compacted decomposed bedrock fissures.',
  },
  {
    id: 'suction-snuffer-bottle-vials',
    name: 'High-Vacuum Snuffer Bottle & Glass Collection Vials',
    category: 'recovery',
    mandatory: true,
    description:
      'Flexible silicone suction bulb with directional intake drawtube to vacuum fine gold flakes directly from water and transfer into threaded glass vials.',
  },
  {
    id: 'magnetic-black-sand-separator',
    name: 'Rare-Earth 8-lb Magnet Black Sand Separator',
    category: 'magnet',
    mandatory: true,
    description:
      'Quick-release plunger neodymium magnet that pulls magnetic iron and black magnetite sand away from fine gold concentrates without touching.',
  },
];

export function getGoldProspectingSites(depositType?: DepositType): GoldProspectingSite[] {
  if (!depositType) return GOLD_PROSPECTING_SITES;
  return GOLD_PROSPECTING_SITES.filter((site) => site.depositType === depositType);
}

export function getGoldProspectingSiteById(id: string): GoldProspectingSite | undefined {
  return GOLD_PROSPECTING_SITES.find((site) => site.id === id);
}

export function getProspectingGear(): ProspectingGearItem[] {
  return PROSPECTING_GEAR;
}

export function calculatePlacerRecovery(query: PlacerCalculationQuery): PlacerCalculationResult {
  const site = getGoldProspectingSiteById(query.siteId) ?? GOLD_PROSPECTING_SITES[0];
  const siteTitle = site.title;

  const expectedConcentrateGrams =
    Math.round((query.gravelVolumeBuckets * 0.45 * (site.maxHistoricalYieldGPerTon / 5.0)) * 100) / 100;

  let sluiceStatus: SluiceStatus;
  let recoveryEfficiencyPercent: number;
  let recoveryAdvisory: string;

  if (
    query.sluiceSlopeDeg >= 5 &&
    query.sluiceSlopeDeg <= 8 &&
    query.streamFlowVelocityFps >= 2.5 &&
    query.streamFlowVelocityFps <= 4.5
  ) {
    sluiceStatus = 'optimal_riffle_recovery';
    recoveryEfficiencyPercent = 92;
    recoveryAdvisory =
      "Optimal hydraulic velocity and pitch (5-8° at 2.5-4.5 fps). Hungarian riffles create steady low-pressure vortex eddies that trap fine and coarse placer gold into miner's moss.";
  } else if (query.sluiceSlopeDeg < 5 || query.streamFlowVelocityFps < 2.5) {
    sluiceStatus = 'underflow_clogging_risk';
    recoveryEfficiencyPercent = 64;
    recoveryAdvisory =
      'Underflow warning: Insufficient gradient (<5°) or sluggish current (<2.5 fps) causes heavy gravels to pack and cement the riffles, allowing gold to slide over the clogged bed.';
  } else {
    sluiceStatus = 'scour_blowout_velocity';
    recoveryEfficiencyPercent = 48;
    recoveryAdvisory =
      'Scour blowout warning: Excessive pitch (>8°) or turbulent stream velocity (>4.5 fps) washes away vortex eddies and scours fine flour gold out the tail end of the sluice box.';
  }

  const densityRatio = 7.28;
  const regulatoryAdvisory =
    'USFS & BLM Regulations: Recreational hand panning and non-motorized backpacking sluicing permitted in designated waterways. Maintain instream sediment integrity: no bank undercutting, no motorized suction dredging, and restore gravel dig holes before leaving.';

  return {
    siteTitle,
    expectedConcentrateGrams,
    recoveryEfficiencyPercent,
    sluiceStatus,
    densityRatio,
    recoveryAdvisory,
    regulatoryAdvisory,
  };
}
