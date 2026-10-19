export type CobbleMorphology =
  | 'cuspate-shingle-spit'
  | 'glacio-fluvial-tombolo'
  | 'intertidal-boulder-reef'
  | 'storm-berm-cobble-bar';

export interface CobbleSpitSite {
  id: string;
  name: string;
  coastalSystem: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: CobbleMorphology;
  medianCobbleDiameterMm: number;
  kelpWrackDepthCm: number;
  bermSlopeDeg: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  footwearProtocol: string;
  description: string;
}

export interface CobbleSpitInput {
  medianCobbleDiameterMm: number;
  kelpWrackDepthCm: number;
  bermSlopeDeg: number;
  swellHeightM: number;
  packLoadKg: number;
}

export interface CobbleSpitAnalysis {
  mucilageSlipCoefficient: number;
  ankleRollTorqueIndex: number;
  swashRunupCutoffMinutes: number;
  effectivePaceKmH: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  footwearClass:
    | 'trail-runner-trekking-poles'
    | 'high-cuff-scree-boot-dual-poles'
    | 'tungsten-studded-felt-boot-wading-staff'
    | 'abort-swash-overwash-entrapment';
  warnings: string[];
  recommendations: string[];
}

export interface CobbleGearItem {
  id: string;
  name: string;
  category:
    | 'footwear'
    | 'stability-poles'
    | 'tidal-navigation'
    | 'immersion-protection';
  essential: boolean;
  rationale: string;
}

export const COBBLE_SPIT_SITES: CobbleSpitSite[] = [
  {
    id: 'dungeness-spit-olympic-usa',
    name: 'Dungeness Cuspate Shingle Spit & Drift-Log Berm',
    coastalSystem: 'Strait of Juan de Fuca Littoral Drift Cell',
    country: 'United States',
    region: 'Strait of Juan de Fuca, Washington',
    latitude: 48.181,
    longitude: -123.112,
    elevationMeters: 4,
    morphology: 'cuspate-shingle-spit',
    medianCobbleDiameterMm: 95,
    kelpWrackDepthCm: 28,
    bermSlopeDeg: 11,
    difficulty: 'moderate',
    bestSeason: 'May – September (Neap Ebb & Low Westerly Swell Window)',
    hazards: [
      '8.9 km recurved shingle spit where incoming flood tides and westerly Strait swells pinch the wet sand foreshore against a chaotic drift-log crest',
      'Rolling 60–140 mm glacio-marine cobbles along the steep upper storm berm that sap caloric pace by 45%',
      'Buoyant multi-ton Sitka spruce and Douglas-fir drift logs mobilized during king tides and gale-force wind waves',
    ],
    footwearProtocol:
      'high-cuff-scree-boot-dual-poles with gaiters on the upper shingle berm; switch to trail runners on low-tide foreshore.',
    description:
      'The longest natural sand and shingle spit in the United States, fed by erosion of glacial bluffs along the Olympic Peninsula and armored with a massive driftwood spine and graded cobble foreshore.',
  },
  {
    id: 'chesil-beach-fleet-uk',
    name: 'Chesil Beach Graded Flint & Chert Storm-Berm Tombolo',
    coastalSystem: 'Lyme Bay & Isle of Portland Barrier Shingle System',
    country: 'United Kingdom',
    region: 'Jurassic Coast, Dorset',
    latitude: 50.616,
    longitude: -2.526,
    elevationMeters: 14,
    morphology: 'storm-berm-cobble-bar',
    medianCobbleDiameterMm: 135,
    kelpWrackDepthCm: 22,
    bermSlopeDeg: 24,
    difficulty: 'challenging',
    bestSeason: 'April – October (Calm English Channel High-Pressure Window)',
    hazards: [
      'Steep 20–28° unconsolidated flint and chert shingle storm ridge that collapses underfoot with every stride',
      'Severe plunging shorebreak and undertow along the steep seaward face with zero offshore sandbar attenuation',
      'Size-graded pebbles (pea-shingle at West Bay to 150 mm cobbles at Portland) creating relentless Achilles and ankle-inversion fatigue over 29 km',
    ],
    footwearProtocol:
      'high-cuff-scree-boot-dual-poles with stiff full-length shank and ankle-lock lacing to resist shingle back-slide.',
    description:
      'A 29 km barrier tombolo linking the Isle of Portland to mainland Dorset, globally renowned for its razor-precise longshore size grading of flint and chert cobbles and its towering 14 m storm-wave berm.',
  },
  {
    id: 'west-coast-trail-boulder-reef-canada',
    name: 'Pachena–Carmanah Intertidal Kelp-Wrack Boulder Reef',
    coastalSystem: 'Vancouver Island Outer Coast Sandstone Shelf & Boulder Field',
    country: 'Canada',
    region: 'Pacific Rim National Park, Vancouver Island',
    latitude: 48.662,
    longitude: -124.845,
    elevationMeters: 6,
    morphology: 'intertidal-boulder-reef',
    medianCobbleDiameterMm: 260,
    kelpWrackDepthCm: 85,
    bermSlopeDeg: 22,
    difficulty: 'extreme',
    bestSeason: 'June – August (Low-Tide Daylight Shelf Transit Window)',
    hazards: [
      'Bowling-ball 180–350 mm sandstone boulders coated in decaying Nereocystis luetkeana (bull kelp) alginate mucilage with friction below 0.18',
      'Deep ankle-snapping interstitial voids concealed beneath 50–110 cm mats of rotting kelp wrack and surfgrass',
      'Long-period North Pacific swell sets overtopping shore-platform surge channels and pinning trekkers against vertical coastal bluffs',
    ],
    footwearProtocol:
      'tungsten-studded-felt-boot-wading-staff or sticky butyl-rubber canyoneering boots paired with basketless carbide wading staffs.',
    description:
      'Notorious outer-coast intertidal boulder fields and wave-cut sandstone reefs along the West Coast Trail, where heavy multi-day packs, slick bull-kelp mucilage, and tidal cutoffs demand meticulous foot placement.',
  },
  {
    id: 'farewell-spit-boulder-bank-nz',
    name: 'Nelson Boulder Bank & Farewell Spit Granodiorite Cobble Bar',
    coastalSystem: 'Tasman Bay & Golden Bay Longshore Drift Barrier System',
    country: 'New Zealand',
    region: 'Tasman Bay / Golden Bay, South Island',
    latitude: -41.215,
    longitude: 173.312,
    elevationMeters: 8,
    morphology: 'glacio-fluvial-tombolo',
    medianCobbleDiameterMm: 210,
    kelpWrackDepthCm: 48,
    bermSlopeDeg: 18,
    difficulty: 'challenging',
    bestSeason: 'November – March (Austral Summer Neap Tide Window)',
    hazards: [
      '13 km natural granodiorite boulder bank composed of interlocking 150–300 mm rounded cobbles that pivot under off-axis heel strikes',
      'Slick Durvillaea antarctica (southern bull kelp) holdfasts and mucilage coating the lower intertidal boulder apron',
      'Rapid 4.5 m Tasman Bay spring tidal range submerging the lower shingle toe and amplifying wave swash runup',
    ],
    footwearProtocol:
      'high-cuff-scree-boot-dual-poles with basketless carbide tips to prevent pole entrapment between granodiorite boulders.',
    description:
      'An extraordinary 13 km natural cuspate barrier of rounded Cable Bay granodiorite boulders transported by relentless southward longshore drift across Tasman Bay.',
  },
];

export const COBBLE_GEAR_CHECKLIST: CobbleGearItem[] = [
  {
    id: 'tungsten-studded-felt-intertidal-boots',
    name: 'Tungsten-Carbide Studded Felt-Sole Intertidal Wading Boots',
    category: 'footwear',
    essential: true,
    rationale:
      'Compressed polypropylene felt absorbs and displaces the hydrodynamic alginate mucilage film on decaying Macrocystis and Nereocystis kelp while tungsten studs bite into underlying sandstone and granodiorite.',
  },
  {
    id: 'basketless-carbide-wading-staffs',
    name: 'Basketless Carbon-Chromoly Wading Staffs with Carbide Tips',
    category: 'stability-poles',
    essential: true,
    rationale:
      'Removing snow/mud baskets prevents trekking poles from wedging and snapping inside 120–350 mm interstitial cobble voids during off-balance recovery steps.',
  },
  {
    id: 'harmonic-tide-table-swell-inclinometer',
    name: 'Waterproof Harmonic Tide Table & Pocket Swell Period Chrono',
    category: 'tidal-navigation',
    essential: true,
    rationale:
      'Tracks exact tidal pinch cutoff windows and measures long-period (>14 s) swell sets that generate extreme swash runup over steep shingle storm berms.',
  },
  {
    id: 'high-cuff-kevlar-shingle-gaiters',
    name: 'High-Cuff Kevlar-Reinforced Shingle & Barnacle Ankle Gaiters',
    category: 'footwear',
    essential: true,
    rationale:
      'Seals boot collars against pea-shingle ingress on collapsing storm berms and shields malleoli from razor-sharp Semibalanus barnacles and mussel beds when a foot slips into a boulder crevasse.',
  },
  {
    id: 'quick-release-pack-sternum-hipbelt',
    name: 'Quick-Release Cam-Buckle Hipbelt & Waterproof Drybag Pack Liner',
    category: 'immersion-protection',
    essential: true,
    rationale:
      'Allows instantaneous pack jettison if knocked into shorebreak undertow or pinned by a rolling drift log during an unexpected swash overwash wave.',
  },
  {
    id: 'neoprene-immersion-leggings-throwbag',
    name: '3 mm Neoprene Surf-Zone Leggings & 15 m Floating Dyneema Throw Bag',
    category: 'immersion-protection',
    essential: true,
    rationale:
      'Maintains lower-extremity thermal dexterity in 8–12°C upwelling coastal surf and enables partner extraction from flooded surge channels.',
  },
];

export function filterCobbleSpitSites(
  sites: CobbleSpitSite[] = COBBLE_SPIT_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): CobbleSpitSite[] {
  const { country, morphology, difficulty, search } = filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (
      morphology &&
      morphology !== 'all' &&
      site.morphology !== morphology
    ) {
      return false;
    }
    if (
      difficulty &&
      difficulty !== 'all' &&
      site.difficulty !== difficulty
    ) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.coastalSystem,
        site.country,
        site.region,
        site.morphology,
        site.description,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(normalizedSearch)) {
        return false;
      }
    }
    return true;
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function calculateCobbleSpitTrekking(
  input: CobbleSpitInput
): CobbleSpitAnalysis {
  const {
    medianCobbleDiameterMm,
    kelpWrackDepthCm,
    bermSlopeDeg,
    swellHeightM,
    packLoadKg,
  } = input;

  if (
    !Number.isFinite(medianCobbleDiameterMm) ||
    medianCobbleDiameterMm < 16 ||
    medianCobbleDiameterMm > 600
  ) {
    throw new Error(
      'Invalid medianCobbleDiameterMm: must be a finite number between 16 and 600 mm.'
    );
  }

  if (
    !Number.isFinite(kelpWrackDepthCm) ||
    kelpWrackDepthCm < 0 ||
    kelpWrackDepthCm > 150
  ) {
    throw new Error(
      'Invalid kelpWrackDepthCm: must be a finite number between 0 and 150 cm.'
    );
  }

  if (
    !Number.isFinite(bermSlopeDeg) ||
    bermSlopeDeg < 0 ||
    bermSlopeDeg > 40
  ) {
    throw new Error(
      'Invalid bermSlopeDeg: must be a finite number between 0 and 40 degrees.'
    );
  }

  if (
    !Number.isFinite(swellHeightM) ||
    swellHeightM < 0 ||
    swellHeightM > 8
  ) {
    throw new Error(
      'Invalid swellHeightM: must be a finite number between 0 and 8 meters.'
    );
  }

  if (
    !Number.isFinite(packLoadKg) ||
    packLoadKg < 0 ||
    packLoadKg > 45
  ) {
    throw new Error(
      'Invalid packLoadKg: must be a finite number between 0 and 45 kg.'
    );
  }

  // Mucilage slip coefficient (0.10 to 0.75) drops sharply as kelpWrackDepthCm and swellHeightM increase
  const rawSlip =
    0.72 -
    (kelpWrackDepthCm / 150) * 0.46 -
    (swellHeightM / 8) * 0.24 -
    (bermSlopeDeg / 40) * 0.06;
  const mucilageSlipCoefficient = roundTo(clamp(rawSlip, 0.1, 0.75), 2);

  // Ankle roll torque index (1.0 to 10.0) increases with medianCobbleDiameterMm (especially bowling-ball cobbles 120-350mm), bermSlopeDeg, packLoadKg, and kelpWrackDepthCm
  const bowlingBallBoost =
    medianCobbleDiameterMm >= 120 && medianCobbleDiameterMm <= 350 ? 0.9 : 0;
  const cobbleFactor =
    (medianCobbleDiameterMm / 600) * 3.2 + bowlingBallBoost;
  const rawTorque =
    1.0 +
    cobbleFactor +
    (bermSlopeDeg / 40) * 2.4 +
    (packLoadKg / 45) * 1.8 +
    (kelpWrackDepthCm / 150) * 1.6;
  const ankleRollTorqueIndex = roundTo(clamp(rawTorque, 1.0, 10.0), 2);

  // Swash runup cutoff minutes (5 to 240 min), decreasing as swellHeightM and bermSlopeDeg increase
  const rawCutoff =
    240 - (swellHeightM / 8) * 260 - (bermSlopeDeg / 40) * 80;
  const swashRunupCutoffMinutes = Math.round(clamp(rawCutoff, 5, 240));

  // Effective pace km/h (0.4 to 4.2 km/h)
  const rawPace =
    4.2 -
    (ankleRollTorqueIndex / 10) * 2.1 -
    ((0.75 - mucilageSlipCoefficient) / 0.65) * 1.4 -
    (packLoadKg / 45) * 0.5;
  const effectivePaceKmH = roundTo(clamp(rawPace, 0.4, 4.2), 2);

  let riskLevel: CobbleSpitAnalysis['riskLevel'];
  if (
    swellHeightM >= 4.0 ||
    swashRunupCutoffMinutes <= 25 ||
    ankleRollTorqueIndex >= 8.0 ||
    mucilageSlipCoefficient <= 0.18
  ) {
    riskLevel = 'critical';
  } else if (
    swellHeightM >= 2.8 ||
    swashRunupCutoffMinutes <= 55 ||
    ankleRollTorqueIndex >= 6.0 ||
    mucilageSlipCoefficient <= 0.28
  ) {
    riskLevel = 'high';
  } else if (
    swellHeightM >= 1.6 ||
    swashRunupCutoffMinutes <= 100 ||
    ankleRollTorqueIndex >= 3.8 ||
    mucilageSlipCoefficient <= 0.42
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  const footwearClassMap: Record<
    CobbleSpitAnalysis['riskLevel'],
    CobbleSpitAnalysis['footwearClass']
  > = {
    critical: 'abort-swash-overwash-entrapment',
    high: 'tungsten-studded-felt-boot-wading-staff',
    moderate: 'high-cuff-scree-boot-dual-poles',
    low: 'trail-runner-trekking-poles',
  };

  const footwearClass = footwearClassMap[riskLevel];

  const warnings: string[] = [];
  if (swellHeightM >= 4.0 || swashRunupCutoffMinutes <= 25) {
    warnings.push(
      `CRITICAL SWASH OVERWASH & DRIFT-LOG ENTRAPMENT (${swellHeightM} m swell, ${swashRunupCutoffMinutes} min cutoff): Wave runup overtops the ${bermSlopeDeg}° berm and mobilizes multi-ton drift logs.`
    );
  } else if (swellHeightM >= 2.8 || swashRunupCutoffMinutes <= 55) {
    warnings.push(
      `HIGH TIDAL PINCH & SURGE RUNUP (${swellHeightM} m swell, ${swashRunupCutoffMinutes} min window): Long-period swash reaches upper boulder wrack; identify bluff escape routes immediately.`
    );
  } else if (swellHeightM >= 1.6 || swashRunupCutoffMinutes <= 100) {
    warnings.push(
      `Moderate wave swash runup (${swellHeightM} m swell, ${swashRunupCutoffMinutes} min cutoff): Stay above the wet drift-log line during incoming flood sets.`
    );
  }

  if (mucilageSlipCoefficient <= 0.18) {
    warnings.push(
      `CRITICAL ALGINATE MUCILAGE BIOFILM SLIP (µ = ${mucilageSlipCoefficient} at ${kelpWrackDepthCm} cm wrack): Decaying Macrocystis/Nereocystis mucilage reduces rubber traction to wet-ice levels.`
    );
  } else if (mucilageSlipCoefficient <= 0.28) {
    warnings.push(
      `High kelp-mucilage slip hazard (µ = ${mucilageSlipCoefficient} across ${kelpWrackDepthCm} cm wrack): Standard Vibram lugs hydroplane on alginate-coated boulders.`
    );
  } else if (mucilageSlipCoefficient <= 0.42) {
    warnings.push(
      `Moderate intertidal kelp wrack slip (µ = ${mucilageSlipCoefficient}): Step on barnacle-crusted rock crests rather than wet brown-algal fronds.`
    );
  }

  if (ankleRollTorqueIndex >= 8.0) {
    warnings.push(
      `CRITICAL ANKLE-INVERSION & VOID ENTRAPMENT (Torque Index ${ankleRollTorqueIndex}/10 on ${medianCobbleDiameterMm} mm boulders): Concealed inter-boulder cavities beneath ${kelpWrackDepthCm} cm wrack threaten tibial fracture.`
    );
  } else if (ankleRollTorqueIndex >= 6.0) {
    warnings.push(
      `High bowling-ball cobble rotation torque (Index ${ankleRollTorqueIndex}/10 on ${medianCobbleDiameterMm} mm clasts with ${packLoadKg} kg pack): High-cuff ankle support and basketless wading staff mandatory.`
    );
  } else if (ankleRollTorqueIndex >= 3.8) {
    warnings.push(
      `Moderate shingle-berm ankle torque (Index ${ankleRollTorqueIndex}/10 at ${bermSlopeDeg}° slope): Unconsolidated ${medianCobbleDiameterMm} mm cobbles roll under heel strike.`
    );
  }

  const recommendations: string[] = [
    `Deploy ${footwearClass} protocol before entering the intertidal boulder or shingle spit zone (modeled pace: ${effectivePaceKmH} km/h).`,
    `Remove snow and mud baskets from trekking poles or wading staffs so tips cannot jam inside ${medianCobbleDiameterMm} mm inter-cobble voids.`,
    `Probe concealed gaps beneath ${kelpWrackDepthCm} cm kelp wrack before committing full weight (${packLoadKg} kg pack load; torque index: ${ankleRollTorqueIndex}).`,
    `Maintain continuous visual watch on seaward swell sets (${swellHeightM} m) and never walk on the seaward side of wet, buoyant drift logs (cutoff window: ${swashRunupCutoffMinutes} min).`,
    `Target dry upper-berm shingle or barnacle-encrusted boulder flats to maximize traction (current mucilage µ: ${mucilageSlipCoefficient}).`,
  ];

  return {
    mucilageSlipCoefficient,
    ankleRollTorqueIndex,
    swashRunupCutoffMinutes,
    effectivePaceKmH,
    riskLevel,
    footwearClass,
    warnings,
    recommendations,
  };
}

export function getCobbleGearChecklist(): CobbleGearItem[] {
  return [...COBBLE_GEAR_CHECKLIST];
}
