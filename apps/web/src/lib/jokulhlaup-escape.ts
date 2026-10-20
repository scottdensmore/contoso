export type JokulhlaupTriggerMechanism =
  | 'subglacial-geothermal-caldera'
  | 'marginal-ice-dam-flotation'
  | 'supraglacial-englacial-conduit'
  | 'moraine-ice-core-piping';

export interface JokulhlaupEscapeSite {
  id: string;
  name: string;
  glacierSystem: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  triggerMechanism: JokulhlaupTriggerMechanism;
  historicalPeakDischargeM3s: number;
  safeTerraceGainM: number;
  floodWaveLeadMinutes: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  evacuationProtocol: string;
  description: string;
}

export interface JokulhlaupEscapeInput {
  iceDamDrawdownCmPerHr: number;
  proglacialConductivityUsCm: number;
  subglacialTremorAmplitudeUm: number;
  canyonFloorDistanceFromPortalKm: number;
  verticalGainToSafeTerraceM: number;
}

export interface JokulhlaupEscapeAnalysis {
  estimatedPeakDischargeM3s: number;
  floodFrontArrivalMinutes: number;
  requiredAscentRateMPerMin: number;
  iceBlockBallisticImpactRiskPct: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  evacuationStrategy:
    | 'routine-proglacial-terrace-watch'
    | 'halt-canyon-entry-monitor-h2s-plume'
    | 'immediate-lateral-moraine-sprint'
    | 'emergency-vertical-scree-scramble-abandon-loads';
  warnings: string[];
  recommendations: string[];
}

export interface JokulhlaupGearItem {
  id: string;
  name: string;
  category:
    | 'gas-hydro-detection'
    | 'vertical-escape-traction'
    | 'emergency-signaling'
    | 'hypothermia-bivouac';
  essential: boolean;
  rationale: string;
}

export const JOKULHLAUP_ESCAPE_SITES: JokulhlaupEscapeSite[] = [
  {
    id: 'grimsvotn-skeidararsandur-vatnajokull-iceland',
    name: 'Grímsvötn & Skeiðarárjökull Subglacial Caldera Outburst Corridor',
    glacierSystem: 'Vatnajökull National Park',
    country: 'Iceland',
    region: 'Suðurland',
    latitude: 64.416,
    longitude: -17.316,
    elevationMeters: 1450,
    triggerMechanism: 'subglacial-geothermal-caldera',
    historicalPeakDischargeM3s: 45000,
    safeTerraceGainM: 95,
    floodWaveLeadMinutes: 25,
    difficulty: 'extreme',
    bestSeason: 'February – May (Pre-Summer Subglacial Melt Window)',
    hazards: [
      'Subglacial geothermal caldera melt accumulation lifting the 250 m ice shelf until hyperconcentrated floods (up to 45,000 m³/s) burst across Skeiðarársandur',
      'Lethal pockets of volcanic hydrogen sulfide (H2S) and sulfur dioxide (SO2) venting from the Skeiðarárjökull ice portal hours before the flood front arrives',
      'House-sized 1,000-ton calved ice blocks and volcanic tephra slurry obliterating braided outwash channels',
    ],
    evacuationProtocol:
      'emergency-vertical-scree-scramble-abandon-loads ascending perpendicular onto Skaftafell bedrock or high lateral moraine benches >= 95 m above the sandur plain upon H2S detection or > 20 µm harmonic tremor.',
    description:
      'Europe’s flagship subglacial geothermal jökulhlaup system, where Grímsvötn caldera meltwater drains through 50 km subglacial tunnels beneath Vatnajökull to burst out of the Skeiðarárjökull terminus.',
  },
  {
    id: 'suicide-basin-mendenhall-juneau-alaska',
    name: 'Suicide Basin (Klesteroa) & Mendenhall Glacier Ice-Dammed Margin',
    glacierSystem: 'Juneau Icefield / Tongass National Forest',
    country: 'USA',
    region: 'Alaska',
    latitude: 58.458,
    longitude: -134.568,
    elevationMeters: 420,
    triggerMechanism: 'marginal-ice-dam-flotation',
    historicalPeakDischargeM3s: 1850,
    safeTerraceGainM: 38,
    floodWaveLeadMinutes: 65,
    difficulty: 'moderate',
    bestSeason: 'October – April (Frozen Basin / Post-Drainage Window)',
    hazards: [
      'Hydrostatic flotation of the Mendenhall Glacier ice dam when Suicide Basin water depth exceeds ~400 m, triggering rapid subglacial drainage within 24–48 hours',
      'Collapse of undercut proglacial lake bluff terraces and floating tabular icebergs choking the Mendenhall River canyon',
      'Sudden inundation of sub-ice caves and West Glacier trail approach benches by 1.5 °C silt-laden meltwater',
    ],
    evacuationProtocol:
      'halt-canyon-entry-monitor-h2s-plume and climb >= 38 m onto the granitic West Glacier bedrock ridge whenever USGS acoustic stage gauges record > 15 cm/hr basin drawdown.',
    description:
      'An active ice-dammed marginal basin adjacent to Mendenhall Glacier where seasonal meltwater impoundment repeatedly lifts the main glacier tongue, unleashing destructive proglacial outburst floods.',
  },
  {
    id: 'cachet-dos-colonia-patagonia-chile',
    name: 'Lago Cachet II & Glaciar Colonia Proglacial Canyon',
    glacierSystem: 'Northern Patagonian Icefield',
    country: 'Chile',
    region: 'Aysén',
    latitude: -47.115,
    longitude: -73.245,
    elevationMeters: 470,
    triggerMechanism: 'supraglacial-englacial-conduit',
    historicalPeakDischargeM3s: 3800,
    safeTerraceGainM: 62,
    floodWaveLeadMinutes: 35,
    difficulty: 'challenging',
    bestSeason: 'May – September (Austral Winter Low-Melt Window)',
    hazards: [
      'Exponential Röthlisberger (R-channel) frictional melt enlargement draining 200 million m³ of Lago Cachet II through an 8 km englacial tunnel in under 18 hours',
      '6–10 m vertical flood wave surging through the narrow Colonia and Baker river gorges, reversing tributary flow',
      'Violent hydraulic air-blast winds and stranded ice-floe jams blocking lower canyon exit trails',
    ],
    evacuationProtocol:
      'immediate-lateral-moraine-sprint climbing >= 62 m up Nothofagus-forested granitic valley walls perpendicular to the Rio Colonia thalweg before the flood crest arrives.',
    description:
      'Benchmark Patagonian ice-dammed lake on the eastern flank of the Northern Patagonian Icefield whose recurrent englacial tunnel ruptures send 3,800 m³/s flood waves down the Colonia and Baker valleys.',
  },
  {
    id: 'kyagar-shaksgam-karakoram-pakistan-china',
    name: 'Kyagar Tso & Upper Shaksgam Glacier Ice-Dammed Gorge',
    glacierSystem: 'North Karakoram / Aghil Range',
    country: 'Pakistan / China',
    region: 'Xinjiang / Gilgit-Baltistan Border',
    latitude: 35.683,
    longitude: 77.081,
    elevationMeters: 4750,
    triggerMechanism: 'moraine-ice-core-piping',
    historicalPeakDischargeM3s: 6500,
    safeTerraceGainM: 125,
    floodWaveLeadMinutes: 18,
    difficulty: 'extreme',
    bestSeason: 'November – March (Deep Winter Freeze Window)',
    hazards: [
      'Surging polythermal Kyagar Glacier ice-core dam piping and mechanical roof collapse releasing 6,500 m³/s hyperconcentrated debris-and-ice slurry into the confined Shaksgam Gorge',
      'Zero down-valley outrun possibility inside a 4,750 m sheer-walled trans-Himalayan canyon where flood waves travel > 30 km/h',
      'Severe high-altitude hypoxia impairing vertical scrambling speed up loose 38° dolomitic scree slopes',
    ],
    evacuationProtocol:
      'emergency-vertical-scree-scramble-abandon-loads jettisoning heavy expedition packs immediately and ascending >= 125 m onto consolidated high alluvial fan terraces upon seismic rumble or rapid turbidity spike.',
    description:
      'High-altitude 4,750 m Karakoram ice-dammed lake formed by surging Kyagar Glacier blocking the Upper Shaksgam Valley, renowned for catastrophic piping outbursts through narrow canyon walls.',
  },
];

export const JOKULHLAUP_GEAR_CHECKLIST: JokulhlaupGearItem[] = [
  {
    id: 'h2s-so2-subglacial-gas-conductivity-detector',
    name: 'Clip-On H2S / SO2 Subglacial Gas Detector & Conductivity Probe',
    category: 'gas-hydro-detection',
    essential: true,
    rationale:
      'Alerts trekkers at >= 5 ppm hydrogen sulfide venting from subglacial portals and measures > 300 µS/cm proglacial geothermal meltwater spikes that precede outburst flood fronts by 30–120 minutes.',
  },
  {
    id: 'quick-deploy-micro-crampons-whippet-pole',
    name: 'Quick-Deploy Micro-Crampons & Whippet Self-Arrest Pole',
    category: 'vertical-escape-traction',
    essential: true,
    rationale:
      'Provides immediate bite on ice-cored lateral moraines and wet 35–42° proglacial scree walls during high-angle perpendicular emergency ascents.',
  },
  {
    id: 'quick-release-jettison-expedition-harness-pack',
    name: 'Single-Pull Quick-Release Pack Waistbelt & Scree Helmet',
    category: 'vertical-escape-traction',
    essential: true,
    rationale:
      'Allows instant load jettisoning when required vertical ascent rates exceed 6.0 m/min and shields the cranium from air-blast rockfall and calved ice-block shrapnel.',
  },
  {
    id: 'dual-band-satellite-sos-plb-strobe',
    name: 'Dual-Band Iridium/Cospas-Sarsat PLB & High-Intensity Strobe',
    category: 'emergency-signaling',
    essential: true,
    rationale:
      'Transmits GPS evacuation coordinates from deep canyon walls when braided outwash bridges and lower valley return trails are severed by a jökulhlaup.',
  },
  {
    id: 'acoustic-laser-rangefinder-stage-marker-kit',
    name: 'Laser Rangefinder & High-Contrast Proglacial Stage Marker Tape',
    category: 'gas-hydro-detection',
    essential: true,
    rationale:
      'Quantifies ice-dam crest subsidence and proglacial river stage rise from a safe standoff without stepping onto undercut canyon floor banks.',
  },
  {
    id: 'subzero-terrace-bivouac-shelter-stove',
    name: 'Ultralight 2-Person Storm Bivouac Sack & Multi-Fuel Stove',
    category: 'hypothermia-bivouac',
    essential: false,
    rationale:
      'Sustains stranded parties on exposed upper lateral moraine terraces for 24–72 hours while post-outburst hyperconcentrated slurry and ice blocks subside.',
  },
];

export function filterJokulhlaupSites(
  sites: JokulhlaupEscapeSite[] = JOKULHLAUP_ESCAPE_SITES,
  filters: {
    country?: string;
    triggerMechanism?: string;
    difficulty?: string;
    search?: string;
  } = {}
): JokulhlaupEscapeSite[] {
  const { country, triggerMechanism, difficulty, search } = filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (
      triggerMechanism &&
      triggerMechanism !== 'all' &&
      site.triggerMechanism !== triggerMechanism
    ) {
      return false;
    }
    if (difficulty && difficulty !== 'all' && site.difficulty !== difficulty) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.glacierSystem,
        site.country,
        site.region,
        site.triggerMechanism,
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

export function calculateJokulhlaupEscape(
  input: JokulhlaupEscapeInput
): JokulhlaupEscapeAnalysis {
  const {
    iceDamDrawdownCmPerHr,
    proglacialConductivityUsCm,
    subglacialTremorAmplitudeUm,
    canyonFloorDistanceFromPortalKm,
    verticalGainToSafeTerraceM,
  } = input;

  if (
    !Number.isFinite(iceDamDrawdownCmPerHr) ||
    iceDamDrawdownCmPerHr < 0 ||
    iceDamDrawdownCmPerHr > 250
  ) {
    throw new Error(
      'Invalid iceDamDrawdownCmPerHr: must be a finite number between 0 and 250 cm/hr.'
    );
  }

  if (
    !Number.isFinite(proglacialConductivityUsCm) ||
    proglacialConductivityUsCm < 20 ||
    proglacialConductivityUsCm > 1200
  ) {
    throw new Error(
      'Invalid proglacialConductivityUsCm: must be a finite number between 20 and 1200 µS/cm.'
    );
  }

  if (
    !Number.isFinite(subglacialTremorAmplitudeUm) ||
    subglacialTremorAmplitudeUm < 0.1 ||
    subglacialTremorAmplitudeUm > 50.0
  ) {
    throw new Error(
      'Invalid subglacialTremorAmplitudeUm: must be a finite number between 0.1 and 50.0 µm.'
    );
  }

  if (
    !Number.isFinite(canyonFloorDistanceFromPortalKm) ||
    canyonFloorDistanceFromPortalKm < 0.2 ||
    canyonFloorDistanceFromPortalKm > 40.0
  ) {
    throw new Error(
      'Invalid canyonFloorDistanceFromPortalKm: must be a finite number between 0.2 and 40.0 km.'
    );
  }

  if (
    !Number.isFinite(verticalGainToSafeTerraceM) ||
    verticalGainToSafeTerraceM < 5 ||
    verticalGainToSafeTerraceM > 220
  ) {
    throw new Error(
      'Invalid verticalGainToSafeTerraceM: must be a finite number between 5 and 220 m.'
    );
  }

  const drawdownNorm = iceDamDrawdownCmPerHr / 250;
  const condNorm = (proglacialConductivityUsCm - 20) / 1180;
  const tremorNorm = (subglacialTremorAmplitudeUm - 0.1) / 49.9;

  // 1. estimatedPeakDischargeM3s (50 to 45000 m³/s)
  const dischargeFactor =
    drawdownNorm * 0.45 + tremorNorm * 0.38 + condNorm * 0.17;
  const rawDischarge = 50 + Math.pow(dischargeFactor, 1.8) * 44950;
  const estimatedPeakDischargeM3s = Math.round(
    clamp(rawDischarge, 50, 45000)
  );

  // 2. floodFrontArrivalMinutes (2 to 240 min)
  const waveSpeedKmPerMin =
    0.12 + Math.pow((estimatedPeakDischargeM3s - 50) / 44950, 0.45) * 0.48;
  const rawArrival = canyonFloorDistanceFromPortalKm / waveSpeedKmPerMin;
  const floodFrontArrivalMinutes = roundTo(clamp(rawArrival, 2, 240), 1);

  // 3. requiredAscentRateMPerMin (0.2 to 45.0 m/min)
  const rawAscent = verticalGainToSafeTerraceM / floodFrontArrivalMinutes;
  const requiredAscentRateMPerMin = roundTo(clamp(rawAscent, 0.2, 45.0), 2);

  // 4. iceBlockBallisticImpactRiskPct (0 to 100 %)
  const qNorm = Math.pow((estimatedPeakDischargeM3s - 50) / 44950, 0.55);
  const distInv = Math.pow(
    (40.0 - canyonFloorDistanceFromPortalKm) / 39.8,
    2.2
  );
  const rawImpact = qNorm * 58 + distInv * 42;
  const iceBlockBallisticImpactRiskPct = roundTo(clamp(rawImpact, 0, 100), 1);

  // 5. riskLevel
  let riskLevel: JokulhlaupEscapeAnalysis['riskLevel'];
  if (
    estimatedPeakDischargeM3s >= 6000 ||
    floodFrontArrivalMinutes <= 18 ||
    requiredAscentRateMPerMin >= 6.0 ||
    iceBlockBallisticImpactRiskPct >= 75
  ) {
    riskLevel = 'critical';
  } else if (
    estimatedPeakDischargeM3s >= 2500 ||
    floodFrontArrivalMinutes <= 40 ||
    requiredAscentRateMPerMin >= 3.2 ||
    iceBlockBallisticImpactRiskPct >= 50
  ) {
    riskLevel = 'high';
  } else if (
    estimatedPeakDischargeM3s >= 800 ||
    floodFrontArrivalMinutes <= 85 ||
    requiredAscentRateMPerMin >= 1.5 ||
    iceBlockBallisticImpactRiskPct >= 25
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. evacuationStrategy
  const strategyMap: Record<
    JokulhlaupEscapeAnalysis['riskLevel'],
    JokulhlaupEscapeAnalysis['evacuationStrategy']
  > = {
    critical: 'emergency-vertical-scree-scramble-abandon-loads',
    high: 'immediate-lateral-moraine-sprint',
    moderate: 'halt-canyon-entry-monitor-h2s-plume',
    low: 'routine-proglacial-terrace-watch',
  };

  const evacuationStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (riskLevel === 'critical') {
    warnings.push(
      `CRITICAL JÖKULHLAUP OUTBURST & CANYON INUNDATION (peak discharge = ${estimatedPeakDischargeM3s} m³/s, arrival = ${floodFrontArrivalMinutes} min, required climb = ${requiredAscentRateMPerMin} m/min, ice-block impact risk = ${iceBlockBallisticImpactRiskPct}%): Exponential Röthlisberger conduit rupture underway; outrunning down-canyon is impossible.`
    );
  } else if (riskLevel === 'high') {
    warnings.push(
      `HIGH SUBGLACIAL OUTBURST HAZARD (peak discharge = ${estimatedPeakDischargeM3s} m³/s, arrival = ${floodFrontArrivalMinutes} min, required climb = ${requiredAscentRateMPerMin} m/min): Rapid ice-dam flotation and R-channel enlargement detected; abort canyon floor immediately.`
    );
  } else if (riskLevel === 'moderate') {
    warnings.push(
      `Moderate subglacial drainage precursor activity (peak discharge = ${estimatedPeakDischargeM3s} m³/s, arrival = ${floodFrontArrivalMinutes} min, ice-block risk = ${iceBlockBallisticImpactRiskPct}%): Elevated conductivity (${proglacialConductivityUsCm} µS/cm) and ice-dam drawdown (${iceDamDrawdownCmPerHr} cm/hr) indicate early conduit opening.`
    );
  }

  if (proglacialConductivityUsCm >= 400 || subglacialTremorAmplitudeUm >= 10) {
    warnings.push(
      `SUBGLACIAL H2S / SO2 GAS & HARMONIC TREMOR PRECURSOR (${proglacialConductivityUsCm} µS/cm, ${subglacialTremorAmplitudeUm} µm tremor): Toxic geothermal gas pockets pool in low proglacial depressions ahead of the flood wave.`
    );
  }

  const recommendations: string[] = [
    `Execute ${evacuationStrategy} protocol immediately (estimated peak Q: ${estimatedPeakDischargeM3s} m³/s, arrival window: ${floodFrontArrivalMinutes} min, required ascent rate: ${requiredAscentRateMPerMin} m/min).`,
    requiredAscentRateMPerMin >= 3.2 || floodFrontArrivalMinutes <= 40
      ? `Climb strictly perpendicular (90°) up bedrock or consolidated lateral moraine walls to >= ${verticalGainToSafeTerraceM} m elevation; never attempt to outrun a jökulhlaup down the canyon floor.`
      : `Identify pre-planned perpendicular escape gullies to the ${verticalGainToSafeTerraceM} m terrace bench while staying above braided sandur channels.`,
    proglacialConductivityUsCm >= 250 || iceBlockBallisticImpactRiskPct >= 25
      ? `Activate clip-on H2S gas alarm, maintain standoff from the glacier portal (${canyonFloorDistanceFromPortalKm} km current), and guard against ${iceBlockBallisticImpactRiskPct}% calved ice-block ballistic overtopping.`
      : `Log proglacial conductivity (${proglacialConductivityUsCm} µS/cm) and ice-dam drawdown (${iceDamDrawdownCmPerHr} cm/hr) every 30 minutes from elevated moraine vantage points.`,
  ];

  return {
    estimatedPeakDischargeM3s,
    floodFrontArrivalMinutes,
    requiredAscentRateMPerMin,
    iceBlockBallisticImpactRiskPct,
    riskLevel,
    evacuationStrategy,
    warnings,
    recommendations,
  };
}

export function getJokulhlaupGearChecklist(): JokulhlaupGearItem[] {
  return [...JOKULHLAUP_GEAR_CHECKLIST];
}
