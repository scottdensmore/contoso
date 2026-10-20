export type ThermokarstMorphology =
  | 'low-center-ice-wedge-polygon'
  | 'retrogressive-thaw-slump-headwall'
  | 'high-center-tussock-polygon-trough'
  | 'drunken-forest-alas-depression';

export interface ThermokarstTundraSite {
  id: string;
  name: string;
  permafrostZone: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: ThermokarstMorphology;
  activeLayerDepthCm: number;
  troughWaterDepthCm: number;
  headwallRetreatMetersYr: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  routingProtocol: string;
  description: string;
}

export interface ThermokarstTundraInput {
  activeLayerDepthCm: number;
  troughWaterDepthCm: number;
  soilMoistureSaturationPct: number;
  eriophorumTussockHeightCm: number;
  packLoadKg: number;
}

export interface ThermokarstTundraAnalysis {
  suprapermafrostLiquefactionIndex: number;
  bootSuctionEntrapmentPct: number;
  tussockAnkleFatigueMultiplier: number;
  effectiveForwardSpeedKmh: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  routingStrategy:
    | 'walk-polygon-rim-levees'
    | 'gravel-esker-ridge-detour'
    | 'probe-frost-table-diagonal-trough-hop'
    | 'abort-retrogressive-slump-mudflow-hazard';
  warnings: string[];
  recommendations: string[];
}

export interface ThermokarstGearItem {
  id: string;
  name: string;
  category:
    | 'frost-table-probing'
    | 'wading-footwear'
    | 'insect-thermal-armor'
    | 'polygon-navigation';
  essential: boolean;
  rationale: string;
}

export const THERMOKARST_TUNDRA_SITES: ThermokarstTundraSite[] = [
  {
    id: 'tuktoyaktuk-pingo-polygons-canada',
    name: 'Tuktoyaktuk Peninsula Ice-Wedge Polygon & Pingo Littoral Tundra',
    permafrostZone: 'Mackenzie Delta Permafrost Zone',
    country: 'Canada',
    region: 'Northwest Territories',
    latitude: 69.439,
    longitude: -133.014,
    elevationMeters: 18,
    morphology: 'low-center-ice-wedge-polygon',
    activeLayerDepthCm: 48,
    troughWaterDepthCm: 36,
    headwallRetreatMetersYr: 4.2,
    difficulty: 'moderate',
    bestSeason: 'Early June – Mid-July (Shallow Early-Summer Thaw Window)',
    hazards: [
      'Flooded low-center polygon pans and interconnected ice-wedge melt troughs concealing 0.5–1.2 m vertical ice-wedge thermal erosion gullies',
      'Coastal retrogressive thaw slumps along Beaufort Sea bluffs shedding saturated Pleistocene clay-silt lobes',
      'Dense sedge-moss floating mats masking open suprapermafrost water lenses around hydrostatic pingo bases',
    ],
    routingProtocol:
      'walk-polygon-rim-levees along raised peat-mineral ramparts bordering low-center basins, probing trough triple-junctions before committing to diagonal hops.',
    description:
      'Classic continuous permafrost coastal lowland dotted with 1,350 hydrostatic pingos and honeycomb networks of low-center ice-wedge polygons.',
  },
  {
    id: 'batagaika-mega-slump-yakutia',
    name: 'Batagaika & Yana Highlands Retrogressive Thaw-Slump Headwall',
    permafrostZone: 'Chersky Range Continuous Permafrost',
    country: 'Russia',
    region: 'Sakha Republic',
    latitude: 67.58,
    longitude: 134.772,
    elevationMeters: 290,
    morphology: 'retrogressive-thaw-slump-headwall',
    activeLayerDepthCm: 135,
    troughWaterDepthCm: 98,
    headwallRetreatMetersYr: 24.5,
    difficulty: 'extreme',
    bestSeason: 'Late May – Early June (Pre-Peak Headwall Ablation Window)',
    hazards: [
      '80-to-100-meter vertical Yedoma ice-complex headwalls retreating 20–30 m/yr via sudden overhanging peat-turf block topples',
      'Thixotropic ice-rich silt mudflows (liquefaction index > 8.5) across the slump floor capable of waist-deep suction entrapment',
      'Thermo-erosional gullies and subsurface piping tunnels collapsing beneath undercut boreal-tundra rim margins',
    ],
    routingProtocol:
      'abort-retrogressive-slump-mudflow-hazard on slump floors; maintain a 60-meter setback upslope of tensile rim cracks and detour along dry bedrock or gravel ridges.',
    description:
      'Earth’s largest retrogressive thaw megaslump, exposing 650,000-year-old Pleistocene Yedoma ice wedges and discharging liquefied silt slurries into the Batagay River valley.',
  },
  {
    id: 'noatak-foothills-tussock-alaska-usa',
    name: 'Noatak & Brooks Range Foothills Eriophorum Tussock Polygon Basin',
    permafrostZone: 'Arctic Slope / Brooks Range',
    country: 'United States',
    region: 'Alaska',
    latitude: 68.185,
    longitude: -159.824,
    elevationMeters: 420,
    morphology: 'high-center-tussock-polygon-trough',
    activeLayerDepthCm: 64,
    troughWaterDepthCm: 52,
    headwallRetreatMetersYr: 2.8,
    difficulty: 'challenging',
    bestSeason: 'June – Early July or Late August (Post-Frost-Settle Window)',
    hazards: [
      'Endless 45–60 cm Eriophorum vaginatum ("cottongrass bowling-ball") tussock pedestals that pivot under load and multiply ankle-inversion fatigue by 3x',
      'Degraded high-center ice-wedge polygon troughs filled with hip-deep tea-colored suprapermafrost water and soft muck',
      'Thermokarst beaded-stream pools connected by narrow, undercut sphagnum-peat channels',
    ],
    routingProtocol:
      'gravel-esker-ridge-detour along Pleistocene glacial eskers, dry Dryas river gravel bars, and caribou ridge trails; step between tussock bases rather than atop unstable crowns.',
    description:
      'Vast arctic foothill basin where degrading ice-wedge polygons intersect miles of wobbling Eriophorum sedge tussocks and beaded thermokarst drainage networks.',
  },
  {
    id: 'bykovsky-lena-alas-tundra-russia',
    name: 'Lena Delta & Bykovsky Yedoma Ice-Complex Alas Depressions',
    permafrostZone: 'Laptev Sea Coast',
    country: 'Russia',
    region: 'Sakha Republic',
    latitude: 71.785,
    longitude: 129.412,
    elevationMeters: 32,
    morphology: 'drunken-forest-alas-depression',
    activeLayerDepthCm: 92,
    troughWaterDepthCm: 76,
    headwallRetreatMetersYr: 14.0,
    difficulty: 'extreme',
    bestSeason: 'June or Early September (Early Autumn Refreeze Crust)',
    hazards: [
      'Coalescing thermokarst alas depressions with floating quagmire lake margins and biogenic methane-ebullition silt pits',
      'Conical thermokarst mounds (baydzharakhs) surrounded by liquefied organic-silt moats from melted syngenetic ice wedges',
      'Tilted "drunken" larch-tundra transition root mats and coastal thermo-denudation amphitheaters collapsing into the Laptev Sea',
    ],
    routingProtocol:
      'probe-frost-table-diagonal-trough-hop using a 160 cm graduated steel frost probe to track firm permafrost table contours along elevated inter-alas Yedoma divides.',
    description:
      'Late-Pleistocene Yedoma ice-complex peninsula sculpted into steep baydzharakh silt cones, coalescing thermokarst alas basins, and rapid thermo-abrasional coastal cliffs.',
  },
];

export const THERMOKARST_GEAR_CHECKLIST: ThermokarstGearItem[] = [
  {
    id: 'graduated-steel-permafrost-frost-probe-160cm',
    name: 'Graduated 160 cm Carbon-Steel Permafrost Frost-Table Tile Probe',
    category: 'frost-table-probing',
    essential: true,
    rationale:
      'Measures active-layer thaw depth ahead of each stride and locates firm frozen permafrost shelves before stepping across flooded ice-wedge troughs.',
  },
  {
    id: 'knee-high-neoprene-tundra-wading-boots-gaiters',
    name: 'Knee-High Neoprene-Lined Tundra Wading Boots & Locking Lace Gaiters',
    category: 'wading-footwear',
    essential: true,
    rationale:
      'Resists vacuum boot-suction extraction in thixotropic yedoma silt and prevents 2 °C suprapermafrost trough water from flooding footwear.',
  },
  {
    id: 'dual-basket-carbon-tussock-trekking-staffs',
    name: 'Dual Wide-Basket Carbon Trekking Staffs with Locking Snow/Mud Ferrules',
    category: 'frost-table-probing',
    essential: true,
    rationale:
      'Provides 4-point tripod stability across wobbling 50 cm Eriophorum cottongrass tussock pedestals and acts as an emergency self-extraction lever in mud.',
  },
  {
    id: 'high-visibility-polygon-gnss-satellite-inreach',
    name: 'Sub-Meter Multi-Band GNSS Receiver with Offline Ortho-Imagery & SOS Beacon',
    category: 'polygon-navigation',
    essential: true,
    rationale:
      'Resolves labyrinthine low-center polygon rim networks, beaded-stream oxbows, and gravel esker detour corridors where horizon relief is under 5 meters.',
  },
  {
    id: 'arctic-mosquito-headnet-windproof-shell',
    name: 'Fine-Mesh Blackfly/Mosquito Headnet, Elasticated Cuffs & Windproof Shell',
    category: 'insect-thermal-armor',
    essential: true,
    rationale:
      'Protects against blinding Culicidae/Simuliidae swarms emerging from stagnant polygon pans while blocking 4 °C coastal Arctic squalls.',
  },
  {
    id: 'packraft-ultralight-alas-trough-ferry',
    name: 'Ultralight 2.1 kg TPU Tundra Packraft & Collapsible 4-Piece Paddle',
    category: 'polygon-navigation',
    essential: false,
    rationale:
      'Enables safe ferrying across coalesced thermokarst alas lakes and deep beaded-stream channels that sever polygon-rim levee routes.',
  },
];

export function filterThermokarstSites(
  sites: ThermokarstTundraSite[] = THERMOKARST_TUNDRA_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): ThermokarstTundraSite[] {
  const { country, morphology, difficulty, search } = filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (morphology && morphology !== 'all' && site.morphology !== morphology) {
      return false;
    }
    if (difficulty && difficulty !== 'all' && site.difficulty !== difficulty) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.permafrostZone,
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

export function calculateThermokarstTundra(
  input: ThermokarstTundraInput
): ThermokarstTundraAnalysis {
  const {
    activeLayerDepthCm,
    troughWaterDepthCm,
    soilMoistureSaturationPct,
    eriophorumTussockHeightCm,
    packLoadKg,
  } = input;

  if (
    !Number.isFinite(activeLayerDepthCm) ||
    activeLayerDepthCm < 10 ||
    activeLayerDepthCm > 160
  ) {
    throw new Error(
      'Invalid activeLayerDepthCm: must be a finite number between 10 and 160 cm.'
    );
  }

  if (
    !Number.isFinite(troughWaterDepthCm) ||
    troughWaterDepthCm < 0 ||
    troughWaterDepthCm > 140
  ) {
    throw new Error(
      'Invalid troughWaterDepthCm: must be a finite number between 0 and 140 cm.'
    );
  }

  if (
    !Number.isFinite(soilMoistureSaturationPct) ||
    soilMoistureSaturationPct < 20 ||
    soilMoistureSaturationPct > 100
  ) {
    throw new Error(
      'Invalid soilMoistureSaturationPct: must be a finite number between 20 and 100 %.'
    );
  }

  if (
    !Number.isFinite(eriophorumTussockHeightCm) ||
    eriophorumTussockHeightCm < 5 ||
    eriophorumTussockHeightCm > 75
  ) {
    throw new Error(
      'Invalid eriophorumTussockHeightCm: must be a finite number between 5 and 75 cm.'
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

  const depthNorm = (activeLayerDepthCm - 10) / 150;
  const waterNorm = troughWaterDepthCm / 140;
  const moistureNorm = (soilMoistureSaturationPct - 20) / 80;
  const tussockNorm = (eriophorumTussockHeightCm - 5) / 70;
  const loadNorm = packLoadKg / 45;

  // 1. suprapermafrostLiquefactionIndex (1.0 to 10.0)
  const rawLiquefaction =
    1.0 +
    depthNorm * 4.5 +
    Math.pow(moistureNorm, 1.2) * 3.3 +
    loadNorm * 1.2;
  const suprapermafrostLiquefactionIndex = roundTo(
    clamp(rawLiquefaction, 1.0, 10.0),
    2
  );

  // 2. bootSuctionEntrapmentPct (0 to 100%)
  const rawSuction =
    depthNorm * 38 + waterNorm * 34 + moistureNorm * 28;
  const bootSuctionEntrapmentPct = roundTo(clamp(rawSuction, 0, 100), 1);

  // 3. tussockAnkleFatigueMultiplier (1.0 to 4.2)
  const rawFatigue =
    1.0 + Math.pow(tussockNorm, 1.15) * 2.2 + loadNorm * 1.0;
  const tussockAnkleFatigueMultiplier = roundTo(
    clamp(rawFatigue, 1.0, 4.2),
    2
  );

  // 4. effectiveForwardSpeedKmh (0.25 to 3.6 km/h)
  const rawSpeed =
    3.6 -
    ((suprapermafrostLiquefactionIndex - 1.0) / 9.0) * 1.35 -
    waterNorm * 1.05 -
    ((tussockAnkleFatigueMultiplier - 1.0) / 3.2) * 0.95;
  const effectiveForwardSpeedKmh = roundTo(clamp(rawSpeed, 0.25, 3.6), 2);

  // 5. riskLevel
  let riskLevel: ThermokarstTundraAnalysis['riskLevel'];
  if (
    suprapermafrostLiquefactionIndex >= 8.0 ||
    bootSuctionEntrapmentPct >= 75 ||
    troughWaterDepthCm >= 95 ||
    effectiveForwardSpeedKmh <= 0.45
  ) {
    riskLevel = 'critical';
  } else if (
    suprapermafrostLiquefactionIndex >= 6.0 ||
    bootSuctionEntrapmentPct >= 50 ||
    troughWaterDepthCm >= 65 ||
    tussockAnkleFatigueMultiplier >= 3.0
  ) {
    riskLevel = 'high';
  } else if (
    suprapermafrostLiquefactionIndex >= 3.8 ||
    bootSuctionEntrapmentPct >= 28 ||
    troughWaterDepthCm >= 35 ||
    tussockAnkleFatigueMultiplier >= 2.0
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. routingStrategy
  const strategyMap: Record<
    ThermokarstTundraAnalysis['riskLevel'],
    ThermokarstTundraAnalysis['routingStrategy']
  > = {
    critical: 'abort-retrogressive-slump-mudflow-hazard',
    high: 'gravel-esker-ridge-detour',
    moderate: 'probe-frost-table-diagonal-trough-hop',
    low: 'walk-polygon-rim-levees',
  };

  const routingStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (
    suprapermafrostLiquefactionIndex >= 8.0 ||
    bootSuctionEntrapmentPct >= 75 ||
    troughWaterDepthCm >= 95
  ) {
    warnings.push(
      `CRITICAL YEDOMA SILT LIQUEFACTION & TROUGH ENTRAPMENT (liquefaction = ${suprapermafrostLiquefactionIndex}/10, boot suction = ${bootSuctionEntrapmentPct}%, trough water = ${troughWaterDepthCm} cm): Active layer (${activeLayerDepthCm} cm) has liquefied into a thixotropic mudflow capable of thigh-deep vacuum entrapment.`
    );
  } else if (
    suprapermafrostLiquefactionIndex >= 6.0 ||
    bootSuctionEntrapmentPct >= 50 ||
    troughWaterDepthCm >= 65
  ) {
    warnings.push(
      `HIGH SUPRAPERMAFROST SLURRY & FLOODED ICE-WEDGE TROUGH HAZARD (liquefaction = ${suprapermafrostLiquefactionIndex}/10, boot suction = ${bootSuctionEntrapmentPct}%, trough water = ${troughWaterDepthCm} cm): Degraded polygon troughs exceed safe wading depth and risk boot-suction immobilization.`
    );
  } else if (
    suprapermafrostLiquefactionIndex >= 3.8 ||
    bootSuctionEntrapmentPct >= 28 ||
    troughWaterDepthCm >= 35
  ) {
    warnings.push(
      `Moderate active-layer saturation and flooded ice-wedge troughs (liquefaction = ${suprapermafrostLiquefactionIndex}/10, suction = ${bootSuctionEntrapmentPct}%, trough water = ${troughWaterDepthCm} cm): Probe frost-table depth before stepping off raised polygon rims.`
    );
  }

  if (
    tussockAnkleFatigueMultiplier >= 3.0 ||
    effectiveForwardSpeedKmh <= 0.45
  ) {
    warnings.push(
      `SEVERE ERIOPHORUM TUSSOCK BIOMECHANICAL FATIGUE (${tussockAnkleFatigueMultiplier}x ankle multiplier, net pace ${effectiveForwardSpeedKmh} km/h with ${packLoadKg} kg pack): High ${eriophorumTussockHeightCm} cm cottongrass pedestals create extreme ankle-inversion hazard and metabolic exhaustion.`
    );
  } else if (tussockAnkleFatigueMultiplier >= 2.0) {
    warnings.push(
      `Elevated Eriophorum tussock ankle-inversion load (${tussockAnkleFatigueMultiplier}x fatigue multiplier at ${eriophorumTussockHeightCm} cm tussock height, ${effectiveForwardSpeedKmh} km/h pace): Step in inter-tussock slots rather than balancing on wobbling sedge crowns.`
    );
  }

  const recommendations: string[] = [
    `Execute ${routingStrategy} strategy immediately (liquefaction: ${suprapermafrostLiquefactionIndex}/10, boot suction: ${bootSuctionEntrapmentPct}%, pace: ${effectiveForwardSpeedKmh} km/h).`,
    activeLayerDepthCm >= 60 || troughWaterDepthCm >= 35
      ? `Probe the frozen permafrost table ahead of every trough crossing (${activeLayerDepthCm} cm thaw depth, ${troughWaterDepthCm} cm trough water) and detour onto Pleistocene gravel eskers or raised polygon rim levees.`
      : `Follow elevated low-center polygon rim levees (${activeLayerDepthCm} cm shallow thaw depth) and avoid cutting across flooded central polygon pans.`,
    eriophorumTussockHeightCm >= 30 || packLoadKg >= 20
      ? `Deploy dual wide-basket trekking staffs to stabilize against ${eriophorumTussockHeightCm} cm Eriophorum tussock pedestals (${tussockAnkleFatigueMultiplier}x ankle fatigue under ${packLoadKg} kg pack).`
      : `Maintain steady ${effectiveForwardSpeedKmh} km/h pace along firm Dryas-heath ridges and log GNSS waypoints at polygon trough triple-junctions.`,
  ];

  return {
    suprapermafrostLiquefactionIndex,
    bootSuctionEntrapmentPct,
    tussockAnkleFatigueMultiplier,
    effectiveForwardSpeedKmh,
    riskLevel,
    routingStrategy,
    warnings,
    recommendations,
  };
}

export function getThermokarstGearChecklist(): ThermokarstGearItem[] {
  return [...THERMOKARST_GEAR_CHECKLIST];
}
