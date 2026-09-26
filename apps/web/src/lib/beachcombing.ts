export type ShorelineType =
  | 'gravel_pebble_cove'
  | 'rocky_intertidal_shelf'
  | 'barrier_island_sandspit'
  | 'high_energy_boulder_strand';

export type PatinaGrade =
  | 'raw_sharp_break'
  | 'early_frosting'
  | 'smooth_frosted_gem'
  | 'ancient_c_fractured_frost';

export type TidalPhase =
  | 'spring_low_tide'
  | 'neap_low_tide'
  | 'slack_water'
  | 'rising_flood_tide';

export type ForagingStatus =
  | 'prime_low_tide_wrack_window'
  | 'suboptimal_slack_scour'
  | 'hazard_rising_tide_pinch';

export interface BeachcombingSite {
  id: string;
  name: string;
  region: string;
  coastline: string;
  elevationMeters: number;
  shorelineType: ShorelineType;
  primaryGlassColors: string[];
  typicalTidalRangeMeters: number;
  stormDepositIndex: number;
  accessDifficulty:
    | 'easy_beach_stroll'
    | 'moderate_tide_walk'
    | 'rugged_coastal_scramble'
    | 'boat_access_only';
  description: string;
  highlights: string[];
}

export interface BeachcombingCalculationQuery {
  siteId: string;
  searchHours: number; // 1 to 8 hours
  tidalDropMeters: number; // 0.5 to 5.0 meters
  stormSurgeDaysAgo: number; // 1 to 14 days ago
  tumbleEnergy: 'low_sheltered_cove' | 'moderate_bay' | 'extreme_ocean_surf';
}

export interface BeachcombingCalculationResult {
  siteName: string;
  expectedYieldPieces: number;
  patinaQualityGrade: PatinaGrade;
  patinaRatingPercent: number;
  optimalForagingStatus: ForagingStatus;
  rarityOdds: string;
  tideSafetyAdvisory: string;
  conservationAdvisory: string;
  foragingAdvisory?: string;
}

export interface BeachcombingGearItem {
  id: string;
  name: string;
  category:
    | 'optics'
    | 'container'
    | 'footwear'
    | 'measurement'
    | 'safety'
    | 'illumination';
  mandatory: boolean;
  description: string;
}

export const BEACHCOMBING_SITES: BeachcombingSite[] = [
  {
    id: 'glass-beach-fort-bragg',
    name: 'Glass Beach & MacKerricher Coves',
    region: 'Mendocino County, CA',
    coastline: 'Pacific Northern California',
    elevationMeters: 4,
    shorelineType: 'gravel_pebble_cove',
    primaryGlassColors: ['Cobalt Blue', 'Seafoam Green', 'Amber', 'Ruby Red'],
    typicalTidalRangeMeters: 2.1,
    stormDepositIndex: 8.4,
    accessDifficulty: 'easy_beach_stroll',
    description:
      'World-renowned pebble coves where decades of ocean wave energy smoothed vintage glass into frosted shoreline gravels.',
    highlights: [
      'MacKerricher marine bluffs',
      'Dense smoothed sea glass shingle',
      'Protected state park observation',
    ],
  },
  {
    id: 'kodiak-island-monashka',
    name: 'Monashka Bay & Mill Bay Strands',
    region: 'Kodiak Island, AK',
    coastline: 'Gulf of Alaska',
    elevationMeters: 2,
    shorelineType: 'high_energy_boulder_strand',
    primaryGlassColors: ['Japanese Glass Floats', 'Forest Green', 'Aqua Aqua'],
    typicalTidalRangeMeters: 3.8,
    stormDepositIndex: 9.6,
    accessDifficulty: 'moderate_tide_walk',
    description:
      'Rugged sub-arctic volcanic strandlines battered by North Pacific winter gales, receiving trans-oceanic flotsam and heavy antique fishing floats.',
    highlights: [
      'Trans-Pacific drift current line',
      'Japanese blown glass float strand',
      'Extreme tidal drop exposure',
    ],
  },
  {
    id: 'cape-may-point-flotsam',
    name: 'Cape May Point & Sunset Beach',
    region: 'Cape May County, NJ',
    coastline: 'Atlantic Mid-Atlantic',
    elevationMeters: 1,
    shorelineType: 'barrier_island_sandspit',
    primaryGlassColors: [
      'Cape May Diamonds (Quartz)',
      'Olive Wine',
      'Depression Vaseline',
    ],
    typicalTidalRangeMeters: 1.6,
    stormDepositIndex: 7.2,
    accessDifficulty: 'easy_beach_stroll',
    description:
      'Gentle coastal sandspit famous for pure rounded quartz Cape May diamonds, Depression-era glassware, and historic concrete ship wrecks.',
    highlights: [
      'SS Atlantus concrete ship drift',
      'Pure rounded quartz pebbles',
      'Delaware Bay confluence deposits',
    ],
  },
  {
    id: 'olympic-ruby-beach',
    name: 'Ruby Beach & Destruction Island Drift',
    region: 'Olympic National Park, WA',
    coastline: 'Pacific Northwest Wilderness',
    elevationMeters: 3,
    shorelineType: 'rocky_intertidal_shelf',
    primaryGlassColors: ['Seafoam', 'Smoky Quartz', 'Teal Floats'],
    typicalTidalRangeMeters: 3.2,
    stormDepositIndex: 9.1,
    accessDifficulty: 'rugged_coastal_scramble',
    description:
      'Wild Olympic coast strand line strewn with ancient cedar driftwood, sea stacks, and intertidal rocky surge channels trapping weathered flotsam.',
    highlights: [
      'Driftwood surge log jams',
      'Destruction Island lighthouse flotsam',
      'Wilderness tidepool marine sanctuary',
    ],
  },
  {
    id: 'monhegan-island-lobsterman',
    name: 'Monhegan Island Pebble Shingle Coves',
    region: 'Lincoln County, ME',
    coastline: 'Gulf of Maine',
    elevationMeters: 5,
    shorelineType: 'gravel_pebble_cove',
    primaryGlassColors: ['Deep Cobalt', 'Amethyst Sun-Purple', 'Black Glass Rum'],
    typicalTidalRangeMeters: 3.0,
    stormDepositIndex: 8.8,
    accessDifficulty: 'boat_access_only',
    description:
      'Isolated offshore Maine island with pebble shingle beaches holding 19th-century pirate rum bottles, sun-purpled amethyst glass, and heavy surf patina.',
    highlights: [
      'Lobster trap drift line',
      '19th century apothecary glass',
      'Granite sea cliff pocket coves',
    ],
  },
];

export const COASTAL_BEACHCOMBING_KIT: BeachcombingGearItem[] = [
  {
    id: 'uv-blacklight-365nm',
    name: '365nm Longwave UV Blacklight Torch',
    category: 'illumination',
    mandatory: true,
    description:
      'Precision filtered ultraviolet flashlight to fluoresce uranium vaseline glass, manganese sun-purple glass, and phosphorescent minerals on dark beaches.',
  },
  {
    id: 'sand-mesh-sifting-scoop',
    name: 'Marine Stainless Steel Sand-Sifting Mesh Scoop',
    category: 'container',
    mandatory: true,
    description:
      'Corrosion-resistant stainless wire sieve scoop allowing wet beach sand and water to drain while capturing smoothed pebbles and glass gems.',
  },
  {
    id: 'neoprene-high-traction-tide-booties',
    name: '5mm Neoprene Kevlar-Sole Intertidal Wading Boots',
    category: 'footwear',
    mandatory: true,
    description:
      'Puncture-resistant Kevlar sole boots providing critical ankle support and grip on slippery kelp, barnacles, and jagged submerged rocks.',
  },
  {
    id: 'jewelers-loupe-caliper-set',
    name: "10x Achromatic Jeweler's Loupe & Brass Millimeter Gauge",
    category: 'measurement',
    mandatory: true,
    description:
      'Dual-magnification optical loupe to inspect C-shaped hydration micro-fractures, air bubbles, and surface frosting alongside precision calipers.',
  },
  {
    id: 'padded-compartment-finds-case',
    name: 'Shockproof Hydro-Sealed Divided Glass Specimen Case',
    category: 'optics',
    mandatory: true,
    description:
      'Floating crushproof polymer container with micro-velvet dividers to prevent delicate frosted glass gems from scratching during transit.',
  },
  {
    id: 'intertidal-tide-clock-tide-table',
    name: 'Barometric Intertidal Tide Clock & Emergency Signal Mirror',
    category: 'safety',
    mandatory: true,
    description:
      'Sealed marine tide gauge tracking moon phases and ebb cycles with built-in solar mirror to prevent strandline cutoff by incoming flood tides.',
  },
];

export function getBeachcombingSites(
  shorelineType?: ShorelineType
): BeachcombingSite[] {
  if (!shorelineType) {
    return BEACHCOMBING_SITES;
  }
  return BEACHCOMBING_SITES.filter(
    (site) => site.shorelineType === shorelineType
  );
}

export function getBeachcombingSiteById(
  id: string
): BeachcombingSite | undefined {
  return BEACHCOMBING_SITES.find((site) => site.id === id);
}

export function getBeachcombingGear(): BeachcombingGearItem[] {
  return COASTAL_BEACHCOMBING_KIT;
}

export function getForagingStatusAdvisory(status: ForagingStatus): string {
  switch (status) {
    case 'prime_low_tide_wrack_window':
      return 'Prime foraging conditions: Spring low tide exposes the fresh high-tide wrack line and deep intertidal shingle beds deposited by recent storm surge.';
    case 'suboptimal_slack_scour':
      return 'Suboptimal foraging: Extended calm seas have allowed tides to bury flotsam in deep sand; focus on gravel pocket coves and bedrock shelves.';
    case 'hazard_rising_tide_pinch':
      return 'Hazard warning: Tidal range (<2.0m) or advancing flood tide poses a headland pinch risk. Always monitor retreat routes off the beach.';
  }
}

export function calculateBeachcombingProfile(
  query: BeachcombingCalculationQuery
): BeachcombingCalculationResult {
  const site = getBeachcombingSiteById(query.siteId);
  if (!site) {
    throw new Error(`Beachcombing site with ID "${query.siteId}" not found`);
  }

  // Yield formula: Math.max(1, Math.round(searchHours * 3.5 * (site.stormDepositIndex / 5.0) * (tidalDropMeters / 2.0)))
  const expectedYieldPieces = Math.max(
    1,
    Math.round(
      query.searchHours *
        3.5 *
        (site.stormDepositIndex / 5.0) *
        (query.tidalDropMeters / 2.0)
    )
  );

  // Patina quality & rating
  let patinaQualityGrade: PatinaGrade;
  let patinaRatingPercent: number;

  if (
    query.tumbleEnergy === 'extreme_ocean_surf' &&
    query.stormSurgeDaysAgo >= 3
  ) {
    patinaQualityGrade = 'ancient_c_fractured_frost';
    patinaRatingPercent = 95;
  } else if (
    query.tumbleEnergy === 'moderate_bay' ||
    query.stormSurgeDaysAgo >= 2
  ) {
    patinaQualityGrade = 'smooth_frosted_gem';
    patinaRatingPercent = 80;
  } else {
    patinaQualityGrade = 'early_frosting';
    patinaRatingPercent = 55;
  }

  // Optimal foraging status & advisory
  let optimalForagingStatus: ForagingStatus;
  if (query.tidalDropMeters >= 2.0 && query.stormSurgeDaysAgo <= 5) {
    optimalForagingStatus = 'prime_low_tide_wrack_window';
  } else if (query.stormSurgeDaysAgo > 8) {
    optimalForagingStatus = 'suboptimal_slack_scour';
  } else {
    optimalForagingStatus = 'hazard_rising_tide_pinch';
  }

  const foragingAdvisory = getForagingStatusAdvisory(optimalForagingStatus);

  const rarityOdds =
    'Cobalt Blue: 1 in 250 pieces | Vaseline Uranium: 1 in 1,000 pieces | Ruby Red: 1 in 10,000 pieces';
  const tideSafetyAdvisory =
    'Intertidal Safety: Never turn your back on the surf. Sneaker waves and incoming tides can rapidly cut off access around rocky headlands.';
  const conservationAdvisory =
    'Leave No Trace Coastal Ethics: Pack out all plastic marine debris and ghost fishing gear found on the wrack line to protect sea life.';

  return {
    siteName: site.name,
    expectedYieldPieces,
    patinaQualityGrade,
    patinaRatingPercent,
    optimalForagingStatus,
    rarityOdds,
    tideSafetyAdvisory,
    conservationAdvisory,
    foragingAdvisory,
  };
}
