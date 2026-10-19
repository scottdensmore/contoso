export type SlotLithology =
  | 'navajo-sandstone-narrows'
  | 'kayenta-ledgy-gorge'
  | 'wingate-vertical-fissure'
  | 'limestone-karst-wadi';

export interface FlashFloodSlotSite {
  id: string;
  name: string;
  drainageBasin: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  lithology: SlotLithology;
  catchmentAreaKm2: number;
  slotWidthM: number;
  escapeLedgeSpacingM: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  escapeProtocol: string;
  description: string;
}

export interface FlashFloodSlotInput {
  catchmentAreaKm2: number;
  upstreamRainMmHr: number;
  slotWidthM: number;
  escapeLedgeHeightM: number;
  distanceToExitKm: number;
}

export interface FlashFloodSlotAnalysis {
  floodWaveLagMinutes: number;
  wallOfWaterRiseRateMPerMin: number;
  peakDischargeM3S: number;
  escapeMarginMinutes: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  escapeClass:
    | 'normal-transit-monitor-sky'
    | 'accelerate-to-exit-stage-alcoves'
    | 'ascend-high-water-escape-ledge-immediately'
    | 'abort-do-not-enter-flash-flood-imminent';
  warnings: string[];
  recommendations: string[];
}

export interface FlashFloodGearItem {
  id: string;
  name: string;
  category:
    | 'satellite-telemetry'
    | 'vertical-escape'
    | 'thermal-flotation'
    | 'anchoring';
  essential: boolean;
  rationale: string;
}

export const FLASH_FLOOD_SLOT_SITES: FlashFloodSlotSite[] = [
  {
    id: 'buckskin-gulch-paria-usa',
    name: 'Buckskin Gulch & Wire Pass Navajo Sandstone Constriction',
    drainageBasin: 'Paria River & Upper Buckskin Slickrock Watershed',
    country: 'United States',
    region: 'Paria River Basin, Utah/Arizona',
    latitude: 37.019,
    longitude: -112.002,
    elevationMeters: 1460,
    lithology: 'navajo-sandstone-narrows',
    catchmentAreaKm2: 1050,
    slotWidthM: 1.2,
    escapeLedgeSpacingM: 3200,
    difficulty: 'extreme',
    bestSeason: 'April – May & October – November (Pre/Post-Monsoon Window)',
    hazards: [
      '21 km continuous Navajo Sandstone slot constriction with vertical 120 m walls and multi-kilometer stretches devoid of high-water escape ledges',
      'Massive 1,050 km² slickrock catchment capable of delivering a 10–15 m debris-laden flood bore from convective storms 60 km upstream under blue skies',
      'Ice-cold chest-deep cesspool potholes and wedged cottonwood logjams that shift violently during ephemeral flood pulses',
    ],
    escapeProtocol:
      'ascend-high-water-escape-ledge-immediately at the Middle Trail boulder jam or confluence alcoves; never enter if Paria Basin QPF exceeds 10% convective probability.',
    description:
      'One of the longest and deepest contiguous slot canyons on Earth, carved through Jurassic Navajo Sandstone where distant Colorado Plateau monsoons funnel catastrophic flash-flood hydrographs through sub-2-meter corridors.',
  },
  {
    id: 'little-wild-horse-bell-usa',
    name: 'Little Wild Horse & Bell Canyon San Rafael Reef Narrows',
    drainageBasin: 'San Rafael Reef & Muddy Creek Ephemeral Monocline',
    country: 'United States',
    region: 'Muddy Creek / San Rafael Swell, Utah',
    latitude: 38.583,
    longitude: -110.803,
    elevationMeters: 1615,
    lithology: 'wingate-vertical-fissure',
    catchmentAreaKm2: 48,
    slotWidthM: 0.8,
    escapeLedgeSpacingM: 450,
    difficulty: 'moderate',
    hazards: [
      'Sub-meter Wingate and Navajo Sandstone narrows where Venturi constriction causes water levels to surge 3+ meters in under 4 minutes',
      'Steep bare-rock flatiron monocline catchment with near-100% runoff efficiency and less than 25 minutes flood-wave lag time',
      'High-velocity gravel and sandstone boulder slurries that abrade ankles and pin hikers in sculpted S-bend meanders',
    ],
    bestSeason: 'April – early June & September – October',
    escapeProtocol:
      'accelerate-to-exit-stage-alcoves between the lower narrows and the upper Kayenta bench road; climb 6 m Navajo ledges at the first acoustic roar.',
    description:
      'A classic sculpted slot cutting through the upturned Wingate and Navajo Sandstone reef of the San Rafael Swell, featuring tight shoulder-width stemming narrows fed by slickrock flatirons.',
  },
  {
    id: 'wadi-mujib-siq-jordan',
    name: 'Wadi Mujib Dead Sea Sandstone Siq & Perennial Gorge',
    drainageBasin: 'Wadi Mujib & Karak Plateau Rift Escarpment Basin',
    country: 'Jordan',
    region: 'Karak Governorate, Jordan Rift Valley',
    latitude: 31.466,
    longitude: 35.573,
    elevationMeters: -210,
    lithology: 'kayenta-ledgy-gorge',
    catchmentAreaKm2: 650,
    slotWidthM: 3.2,
    escapeLedgeSpacingM: 600,
    difficulty: 'challenging',
    bestSeason: 'May – October (Dry Eastern Plateau Summer Window)',
    hazards: [
      'Vast 650+ km² highland plateau drainage where autumn and spring Mediterranean depressions trigger lethal flash-flood bores at -210 m elevation',
      'Perennial baseflow combined with vertical Umm Ishrin sandstone walls that obscure upstream storm cells over the Moab and Karak highlands',
      'Submerged boulder chockstones and hydraulic reversals at waterfall drops that strip unsecured flotation gear',
    ],
    escapeProtocol:
      'ascend-high-water-escape-ledge-immediately onto bolted sandstone terrace ledges 8 m above perennial water level and await flood recession.',
    description:
      'The lowest-elevation slot gorge on Earth, incised deep into Cambrian-Ordovician sandstone along the Dead Sea Transform where distant highland rainstorms unleash sudden multi-meter flood surges.',
  },
  {
    id: 'garganta-del-cares-wadi-oman',
    name: 'Wadi Ghul (Al Nakhar Balcony Gorge) Limestone Slot',
    drainageBasin: 'Jebel Shams Southern Escarpment & Wadi Nakhar Catchment',
    country: 'Oman',
    region: 'Jebel Shams, Ad Dakhiliyah',
    latitude: 23.208,
    longitude: 57.204,
    elevationMeters: 1080,
    lithology: 'limestone-karst-wadi',
    catchmentAreaKm2: 185,
    slotWidthM: 2.5,
    escapeLedgeSpacingM: 520,
    difficulty: 'challenging',
    bestSeason: 'November – March (Cool Dry Hajar Winter Window)',
    hazards: [
      '2,000 m vertical Jebel Shams limestone headwall that concentratesographic convective downpours into a violent karst wadi bore',
      'Polished water-worn carbonate floor slabs and boulder constrictions with minimal friction once wetted by leading-edge flood foam',
      'Rockfall projectiles dislodged from overhanging cliffs by upland runoff waterfalls cascading directly into the slot floor',
    ],
    escapeProtocol:
      'accelerate-to-exit-stage-alcoves along elevated cliff-walk structural terraces 10 m above the active boulder talweg.',
    description:
      'An immense carbonate slot canyon beneath the 3,000 m summit of Jebel Shams in the Al Hajar Mountains, where hyper-arid limestone walls funnel sudden orographic cloudbursts into narrow boulder corridors.',
  },
];

export const FLASH_FLOOD_GEAR_CHECKLIST: FlashFloodGearItem[] = [
  {
    id: 'iridium-inreach-nexrad-telemetry',
    name: 'Dual-Band Iridium Satellite Communicator & NOAA NEXRAD Mesoscale Alerts',
    category: 'satellite-telemetry',
    essential: true,
    rationale:
      'Receives real-time upstream basin QPF radar updates and Flash Flood Warnings when deep sandstone walls block VHF/cellular line-of-sight.',
  },
  {
    id: 'hydrophobic-aramid-canyon-rope-ascenders',
    name: '60 m 8.5 mm Hydrophobic Aramid-Sheath Canyon Static Rope & Mechanical Ascenders',
    category: 'vertical-escape',
    essential: true,
    rationale:
      'Enables rapid vertical self-rescue up 5–25 mKayenta or Navajo escape ledges before the leading debris bore submerges the canyon floor.',
  },
  {
    id: 'sealed-neoprene-wetsuit-bivy-shelter',
    name: '4/3 mm Sealed Canyoneering Wetsuit & Aluminized Emergency Hypothermia Bivy',
    category: 'thermal-flotation',
    essential: true,
    rationale:
      'Prevents conductive hypothermia in 7–12°C shaded pothole water and sustains core temperature during 12–24 hour strandings on high-water escape alcoves.',
  },
  {
    id: 'releasable-contingency-anchor-sandtrap',
    name: 'Releasable Contingency Rigging Plate, Sand-Trap Anchor & Talon Skyhook',
    category: 'anchoring',
    essential: true,
    rationale:
      'Allows rapid natural-anchor rigging on high sandstone horns or marginal ledges when bolting is prohibited or time-critical during rising water.',
  },
  {
    id: 'quick-jettison-canyon-keg-flotation',
    name: 'Quick-Jettison Draining Canyon Pack with Sealed 15 L Buoyant Dry Keg',
    category: 'thermal-flotation',
    essential: true,
    rationale:
      'Provides positive torso buoyancy in aerated floodwater while cam-release shoulder straps prevent fatal entanglement against submerged logjams.',
  },
  {
    id: 'barometric-altimeter-acoustic-whistle',
    name: 'Barometric Pressure-Trend Watch & 120 dB Pealess Hydro-Whistle',
    category: 'satellite-telemetry',
    essential: true,
    rationale:
      'Detects sudden >3 hPa mesoscale downdraft pressure spikes and pierces the low-frequency roar of an approaching flash-flood bore to alert team members.',
  },
];

export function filterFlashFloodSlotSites(
  sites: FlashFloodSlotSite[] = FLASH_FLOOD_SLOT_SITES,
  filters: {
    country?: string;
    lithology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): FlashFloodSlotSite[] {
  const { country, lithology, difficulty, search } = filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (lithology && lithology !== 'all' && site.lithology !== lithology) {
      return false;
    }
    if (difficulty && difficulty !== 'all' && site.difficulty !== difficulty) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.drainageBasin,
        site.country,
        site.region,
        site.lithology,
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

export function calculateFlashFloodSlot(
  input: FlashFloodSlotInput
): FlashFloodSlotAnalysis {
  const {
    catchmentAreaKm2,
    upstreamRainMmHr,
    slotWidthM,
    escapeLedgeHeightM,
    distanceToExitKm,
  } = input;

  if (
    !Number.isFinite(catchmentAreaKm2) ||
    catchmentAreaKm2 < 1 ||
    catchmentAreaKm2 > 1500
  ) {
    throw new Error(
      'Invalid catchmentAreaKm2: must be a finite number between 1 and 1500 km².'
    );
  }

  if (
    !Number.isFinite(upstreamRainMmHr) ||
    upstreamRainMmHr < 0 ||
    upstreamRainMmHr > 120
  ) {
    throw new Error(
      'Invalid upstreamRainMmHr: must be a finite number between 0 and 120 mm/hr.'
    );
  }

  if (!Number.isFinite(slotWidthM) || slotWidthM < 0.3 || slotWidthM > 25) {
    throw new Error(
      'Invalid slotWidthM: must be a finite number between 0.3 and 25 meters.'
    );
  }

  if (
    !Number.isFinite(escapeLedgeHeightM) ||
    escapeLedgeHeightM < 0.5 ||
    escapeLedgeHeightM > 30
  ) {
    throw new Error(
      'Invalid escapeLedgeHeightM: must be a finite number between 0.5 and 30 meters.'
    );
  }

  if (
    !Number.isFinite(distanceToExitKm) ||
    distanceToExitKm < 0.1 ||
    distanceToExitKm > 20
  ) {
    throw new Error(
      'Invalid distanceToExitKm: must be a finite number between 0.1 and 20 km.'
    );
  }

  // Rational-method slickrock runoff discharge (C ≈ 0.72 -> C/3.6 = 0.20)
  const rawDischarge = 0.2 * catchmentAreaKm2 * upstreamRainMmHr;
  const peakDischargeM3S = roundTo(clamp(rawDischarge, 0, 36000), 2);

  // Vertical water-level rise rate inside the constriction (0.0 to 8.5 m/min),
  // inversely proportional to slotWidthM and proportional to peakDischargeM3S and rain intensity
  const rawRiseRate =
    upstreamRainMmHr === 0
      ? 0
      : (upstreamRainMmHr * 0.08 + peakDischargeM3S * 0.005) / slotWidthM;
  const wallOfWaterRiseRateMPerMin = roundTo(clamp(rawRiseRate, 0.0, 8.5), 2);

  // Flood wave lag time from upstream convective cell burst to flood-bore arrival (5 to 240 min)
  const rawLag =
    115 - upstreamRainMmHr * 2.4 - (catchmentAreaKm2 / 1500) * 30;
  const floodWaveLagMinutes = Math.round(clamp(rawLag, 5, 240));

  // Escape margin minutes: floodWaveLagMinutes - (distanceToExitKm / 2.2) * 60
  const transitMinutes = (distanceToExitKm / 2.2) * 60;
  const escapeMarginMinutes = roundTo(floodWaveLagMinutes - transitMinutes, 1);

  let riskLevel: FlashFloodSlotAnalysis['riskLevel'];
  if (
    upstreamRainMmHr >= 25 ||
    wallOfWaterRiseRateMPerMin >= 1.5 ||
    escapeMarginMinutes < 0
  ) {
    riskLevel = 'critical';
  } else if (
    upstreamRainMmHr >= 12 ||
    wallOfWaterRiseRateMPerMin >= 0.6 ||
    escapeMarginMinutes < 25
  ) {
    riskLevel = 'high';
  } else if (
    upstreamRainMmHr >= 4 ||
    wallOfWaterRiseRateMPerMin >= 0.2 ||
    escapeMarginMinutes < 60
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  const escapeClassMap: Record<
    FlashFloodSlotAnalysis['riskLevel'],
    FlashFloodSlotAnalysis['escapeClass']
  > = {
    critical: 'abort-do-not-enter-flash-flood-imminent',
    high: 'ascend-high-water-escape-ledge-immediately',
    moderate: 'accelerate-to-exit-stage-alcoves',
    low: 'normal-transit-monitor-sky',
  };

  const escapeClass = escapeClassMap[riskLevel];

  const warnings: string[] = [];
  if (upstreamRainMmHr >= 25 || wallOfWaterRiseRateMPerMin >= 1.5) {
    warnings.push(
      `CRITICAL FLASH-FLOOD BORE & VENTURI SURGE (${upstreamRainMmHr} mm/hr rain over ${catchmentAreaKm2} km², ${wallOfWaterRiseRateMPerMin} m/min rise in ${slotWidthM} m slot): Debris-laden wall of water (~${peakDischargeM3S} m³/s) will submerge lower ledges.`
    );
  } else if (upstreamRainMmHr >= 12 || wallOfWaterRiseRateMPerMin >= 0.6) {
    warnings.push(
      `HIGH CONVECTIVE RUNOFF SURGE (${upstreamRainMmHr} mm/hr upstream rain, ${wallOfWaterRiseRateMPerMin} m/min vertical rise): Slickrock sheetflow converging into the ${slotWidthM} m constriction.`
    );
  } else if (upstreamRainMmHr >= 4 || wallOfWaterRiseRateMPerMin >= 0.2) {
    warnings.push(
      `Moderate upstream precipitation (${upstreamRainMmHr} mm/hr, ${wallOfWaterRiseRateMPerMin} m/min rise rate): Ephemeral side-drainage waterfalls and turbid baseflow pulse expected.`
    );
  }

  if (escapeMarginMinutes < 0) {
    warnings.push(
      `CRITICAL NEGATIVE ESCAPE MARGIN (${escapeMarginMinutes} min margin for ${distanceToExitKm} km exit vs ${floodWaveLagMinutes} min bore lag): Flood wave arrives before canyon exit can be reached on foot.`
    );
  } else if (escapeMarginMinutes < 25) {
    warnings.push(
      `High entrapment hazard (${escapeMarginMinutes} min escape margin over ${distanceToExitKm} km to exit): Do not attempt to outrun the flood down-canyon; climb to an escape ledge immediately.`
    );
  } else if (escapeMarginMinutes < 60) {
    warnings.push(
      `Moderate transit buffer (${escapeMarginMinutes} min margin before ${floodWaveLagMinutes} min lag window): Maintain continuous visual tagging of high-water alcoves.`
    );
  }

  const timeToOvertopLedgeMin =
    wallOfWaterRiseRateMPerMin > 0
      ? roundTo(escapeLedgeHeightM / wallOfWaterRiseRateMPerMin, 1)
      : null;

  const recommendations: string[] = [
    `Execute ${escapeClass} protocol immediately (modeled peak discharge: ${peakDischargeM3S} m³/s, lag window: ${floodWaveLagMinutes} min).`,
    timeToOvertopLedgeMin !== null
      ? `Target escape alcoves well above ${escapeLedgeHeightM} m; at ${wallOfWaterRiseRateMPerMin} m/min vertical rise inside the ${slotWidthM} m constriction, a ${escapeLedgeHeightM} m ledge is reached in ~${timeToOvertopLedgeMin} min.`
      : `Identify and log high-water escape ledges at least ${escapeLedgeHeightM} m above the dry talweg across the ${distanceToExitKm} km remaining corridor.`,
    `Never attempt to outrun a flash-flood bore down-canyon when escape margin (${escapeMarginMinutes} min) is tight—ascend vertical sandstone walls or side-canyon benches instead.`,
    `Stage 60 m static rope, mechanical ascenders, and hypothermia bivy gear accessible at top of pack for multi-hour stranding over the ${catchmentAreaKm2} km² drainage.`,
  ];

  return {
    floodWaveLagMinutes,
    wallOfWaterRiseRateMPerMin,
    peakDischargeM3S,
    escapeMarginMinutes,
    riskLevel,
    escapeClass,
    warnings,
    recommendations,
  };
}

export function getFlashFloodGearChecklist(): FlashFloodGearItem[] {
  return [...FLASH_FLOOD_GEAR_CHECKLIST];
}
