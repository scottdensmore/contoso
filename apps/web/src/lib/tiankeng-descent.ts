export type TiankengMorphology =
  | 'collapse-mega-doline'
  | 'overhung-bell-shaft-sinkhole'
  | 'erosional-waterfall-tiankeng'
  | 'twin-window-karst-chasm';

export interface TiankengDescentSite {
  id: string;
  name: string;
  karstProvince: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: TiankengMorphology;
  verticalDepthMeters: number;
  rebelayPitchCount: number;
  fogSaturationPct: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  riggingProtocol: string;
  description: string;
}

export interface TiankengDescentInput {
  verticalDropM: number;
  rebelayCount: number;
  fogHumidityPct: number;
  overhangAngleDeg: number;
  waterfallSprayLitresMin: number;
}

export interface TiankengDescentAnalysis {
  wetRopeFrictionMultiplier: number;
  descenderThermalC: number;
  limestoneSpallTrajectoryRiskPct: number;
  freeHangBounceAmplitudeM: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riggingStrategy:
    | 'single-pitch-rack-descender'
    | 'multi-rebelay-deviation-srt'
    | 'expedition-6-bar-rack-water-deviation'
    | 'abort-plummet-spall-hypothermia-hazard';
  warnings: string[];
  recommendations: string[];
}

export interface TiankengGearItem {
  id: string;
  name: string;
  category:
    | 'srt-descender'
    | 'rebelay-rigging'
    | 'rockfall-armor'
    | 'microclimate-shell';
  essential: boolean;
  rationale: string;
}

export const TIANKENG_DESCENT_SITES: TiankengDescentSite[] = [
  {
    id: 'xiaozhai-tiankeng-chongqing-china',
    name: 'Xiaozhai Tiankeng Double-Nested Collapse Mega-Doline',
    karstProvince: 'Fengjie Karst',
    country: 'China',
    region: 'Chongqing',
    latitude: 30.751,
    longitude: 109.471,
    elevationMeters: 1331,
    morphology: 'collapse-mega-doline',
    verticalDepthMeters: 662,
    rebelayPitchCount: 11,
    fogSaturationPct: 94,
    difficulty: 'extreme',
    bestSeason: 'October – November (Post-Monsoon Low Underground River Discharge)',
    hazards: [
      'Two-tiered 320 m upper bowl and 342 m vertical lower shaft where unbroken rope weight prevents initial descender feed and glazes aluminum bobbins above 180 °C',
      'Dislodged Triassic limestone spall and epiphytic root-mat debris falling from the 300 m intermediate terrace ledge',
      'Turbulent subterranean Difeng River resurgence spray filling the lower chasm with 100% relative humidity inversion fog',
    ],
    riggingProtocol:
      'expedition-6-bar-rack-water-deviation across 11 bolted rebelays with intermediate ledge deviation anchors.',
    description:
      'The deepest and most voluminous double-nested collapse tiankeng on Earth, dropping 662 meters through vertical Triassic limestone cliffs into a roaring underground river cavern.',
  },
  {
    id: 'dashiwei-tiankeng-leye-china',
    name: 'Dashiwei Tiankeng Subterranean Cloud-Forest Rim',
    karstProvince: 'Leye-Fengshan Global Geopark',
    country: 'China',
    region: 'Guangxi',
    latitude: 24.792,
    longitude: 106.489,
    elevationMeters: 1466,
    morphology: 'twin-window-karst-chasm',
    verticalDepthMeters: 613,
    rebelayPitchCount: 9,
    fogSaturationPct: 91,
    difficulty: 'extreme',
    bestSeason: 'November – March (Dry Winter Subterranean Inversion Window)',
    hazards: [
      'Sheer 500+ meter Carboniferous limestone walls overhanging a 96,000 m² virgin subterranean cloud forest teeming with slippery bryophyte and orchid mats',
      'Persistent thermal inversion fog layers that saturate polyamide ropes with slick carbonate mud and increase wet-rope friction multipliers past 1.8x',
      'Sharp karst blade flutes and overhang transitions requiring multi-point Y-hang rebelays and heavy canvas edge protectors',
    ],
    riggingProtocol:
      'expedition-6-bar-rack-water-deviation with Y-hang rebelay loops every 55–75 m to clear overhang knife-edges.',
    description:
      'A colossal collapse sinkhole in the Leye karst cluster featuring a pristine subterranean cloud-forest floor and dual underground river portals at the base of 613-meter sheer walls.',
  },
  {
    id: 'sotano-de-las-golondrinas-mexico',
    name: 'Sótano de las Golondrinas Overhung Free-Fall Bell Shaft',
    karstProvince: 'Huasteca Potosina',
    country: 'Mexico',
    region: 'San Luis Potosí',
    latitude: 21.599,
    longitude: -99.098,
    elevationMeters: 815,
    morphology: 'overhung-bell-shaft-sinkhole',
    verticalDepthMeters: 372,
    rebelayPitchCount: 1,
    fogSaturationPct: 76,
    difficulty: 'challenging',
    bestSeason: 'December – April (Dry Season Outside Morning/Dusk Swift Vortex)',
    hazards: [
      'Continuous 333–372 m free-hanging bell-shaped drop where 25+ kg of suspended static rope locks the descender at the lip and induces extreme thermal build-up in the lower half',
      'Severe elastic rope bounce (6–10 m harmonic oscillation) during changeover or ascender attachment on an unbroken 370 m span',
      'High-speed collisions with swirling flocks of white-collared swifts and green parakeets during dawn exit and dusk re-entry spirals',
    ],
    riggingProtocol:
      'expedition-6-bar-rack-water-deviation using a 6-bar stainless U-rack with hyper-bar and bottom-weight management.',
    description:
      'World-renowned conical bell-shaped karst shaft in the Sierra Madre Oriental where climbers step off an overhung lip into a continuous 372-meter free-hanging void.',
  },
  {
    id: 'sima-humboldt-sarisarinama-venezuela',
    name: 'Sima Mayor de Sarisariñama Quartzite Tepui Sinkhole',
    karstProvince: 'Jaua-Sarisariñama National Park',
    country: 'Venezuela',
    region: 'Bolívar',
    latitude: 4.685,
    longitude: -64.215,
    elevationMeters: 1950,
    morphology: 'erosional-waterfall-tiankeng',
    verticalDepthMeters: 314,
    rebelayPitchCount: 6,
    fogSaturationPct: 95,
    difficulty: 'moderate',
    bestSeason: 'January – March (Low Orinoco Trade-Wind Squall Window)',
    hazards: [
      'Dense bromeliad and tepui cloud-forest overhangs along the upper rim that conceal friable Precambrian quartzite ledges and wet peat blocks',
      'Sudden convective rain squalls that transform rim seepage into 150–300 L/min waterfall plumes directly along the rigging line',
      'Isolated subterranean ecosystem at the 350 m-wide sinkhole floor where radiative night cooling and mist saturation accelerate hypothermia',
    ],
    riggingProtocol:
      'multi-rebelay-deviation-srt with directional deviation slings pulling the main line clear of active tepui waterfall chutes.',
    description:
      'Enormous collapse sinkhole carved into ancient Precambrian quartzite atop the Sarisariñama tepui plateau, sheltering an isolated primeval forest patch 314 meters below the rim.',
  },
];

export const TIANKENG_GEAR_CHECKLIST: TiankengGearItem[] = [
  {
    id: 'stainless-6-bar-u-rack-descender-hyperbar',
    name: '6-Bar Stainless U-Rack with Hyper-Bar & Stainless Heat-Sink Spacers',
    category: 'srt-descender',
    essential: true,
    rationale:
      'Allows variable bar engagement to feed heavy suspended rope at the lip and progressively add friction bars near the bottom while dissipating >150 °C thermal loads without glazing.',
  },
  {
    id: 'nomex-kevlar-leather-belay-gloves-heat-shield',
    name: 'Heavy-Duty Nomex/Leather SRT Braking Gloves & Descender Thermal Pouch',
    category: 'srt-descender',
    essential: true,
    rationale:
      'Prevents third-degree palm burns when handling a superheated rack or bobbin after a 200+ m drop and shields polyamide rope from hot metal at pitch base.',
  },
  {
    id: 'low-stretch-polyamide-srt-rope-dyneema-rebelay-kit',
    name: '10.5 mm Low-Stretch Polyamide SRT Static Line, Dyneema Rebelay Slings & Canvas Edge Rollers',
    category: 'rebelay-rigging',
    essential: true,
    rationale:
      'Minimizes free-hang harmonic bounce (<2.5% elongation) while Y-hang rebelay anchors and deviations keep the rope off razor-sharp karst flutes and waterfall chutes.',
  },
  {
    id: 'en12492-polycarbonate-spall-helmet-visor',
    name: 'EN 12492 Impact-Foam Mountaineering Helmet with Polycarbonate Spall Visor',
    category: 'rockfall-armor',
    essential: true,
    rationale:
      'Protects cranium and eyes against high-velocity limestone spall pebbles, dislodged cloud-forest epiphyte root clods, and falling water droplets accelerated over 400 m.',
  },
  {
    id: 'ballistic-nylon-shoulder-spall-cape-pad',
    name: 'Ballistic Cordura Shoulder & Collarbone Spall-Deflection Cape',
    category: 'rockfall-armor',
    essential: false,
    rationale:
      'Dampens impact energy from small carbonate fragments and wet mud balls shed down positive-angle slabbing walls during multi-team rebelay transitions.',
  },
  {
    id: 'cagoule-neoprene-cuff-inversion-hypothermia-shell',
    name: 'Waterproof Caving Cagoule, Neoprene Wrist Seals & Closed-Cell Vapor-Barrier Vest',
    category: 'microclimate-shell',
    essential: true,
    rationale:
      'Blocks 100% humidity subterranean cloud-forest mist and cold waterfall plume downdrafts while hanging stationary at rebelay stations.',
  },
];

export function filterTiankengSites(
  sites: TiankengDescentSite[] = TIANKENG_DESCENT_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): TiankengDescentSite[] {
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
        site.karstProvince,
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

export function calculateTiankengDescent(
  input: TiankengDescentInput
): TiankengDescentAnalysis {
  const {
    verticalDropM,
    rebelayCount,
    fogHumidityPct,
    overhangAngleDeg,
    waterfallSprayLitresMin,
  } = input;

  if (
    !Number.isFinite(verticalDropM) ||
    verticalDropM < 50 ||
    verticalDropM > 700
  ) {
    throw new Error(
      'Invalid verticalDropM: must be a finite number between 50 and 700 meters.'
    );
  }

  if (
    !Number.isFinite(rebelayCount) ||
    rebelayCount < 0 ||
    rebelayCount > 20
  ) {
    throw new Error(
      'Invalid rebelayCount: must be a finite number between 0 and 20 pitches.'
    );
  }

  if (
    !Number.isFinite(fogHumidityPct) ||
    fogHumidityPct < 30 ||
    fogHumidityPct > 100
  ) {
    throw new Error(
      'Invalid fogHumidityPct: must be a finite number between 30 and 100 percent.'
    );
  }

  if (
    !Number.isFinite(overhangAngleDeg) ||
    overhangAngleDeg < -25 ||
    overhangAngleDeg > 30
  ) {
    throw new Error(
      'Invalid overhangAngleDeg: must be a finite number between -25 and 30 degrees.'
    );
  }

  if (
    !Number.isFinite(waterfallSprayLitresMin) ||
    waterfallSprayLitresMin < 0 ||
    waterfallSprayLitresMin > 500
  ) {
    throw new Error(
      'Invalid waterfallSprayLitresMin: must be a finite number between 0 and 500 L/min.'
    );
  }

  const unbrokenSpanM = verticalDropM / Math.max(1, rebelayCount + 1);

  // 1. wetRopeFrictionMultiplier (1.0 to 2.8)
  const rawFriction =
    1.0 +
    ((fogHumidityPct - 30) / 70) * 0.45 +
    (waterfallSprayLitresMin / 500) * 0.75 +
    (unbrokenSpanM / 700) * 0.6;
  const wetRopeFrictionMultiplier = roundTo(clamp(rawFriction, 1.0, 2.8), 2);

  // 2. descenderThermalC (35 to 260 °C)
  const rawThermal =
    35 +
    (unbrokenSpanM / 350) * 195 +
    ((100 - fogHumidityPct) / 70) * 15 -
    (waterfallSprayLitresMin / 500) * 35;
  const descenderThermalC = roundTo(clamp(rawThermal, 35, 260), 1);

  // 3. limestoneSpallTrajectoryRiskPct (0 to 100%)
  const wallAngleFactor =
    ((overhangAngleDeg + 25) / 55) * 55 +
    (overhangAngleDeg > 0 ? (overhangAngleDeg / 30) * 20 : 0);
  const unbrokenExposure = (unbrokenSpanM / 500) * 28;
  const sprayDislodgement = (waterfallSprayLitresMin / 500) * 15;
  const rawSpall =
    wallAngleFactor +
    unbrokenExposure +
    sprayDislodgement -
    Math.min(rebelayCount, 8) * 2.2;
  const limestoneSpallTrajectoryRiskPct = roundTo(clamp(rawSpall, 0, 100), 1);

  // 4. freeHangBounceAmplitudeM (0.4 to 14.0 m)
  const rawBounce =
    0.4 +
    (unbrokenSpanM / 550) * 12.6 +
    ((fogHumidityPct - 30) / 70) * 0.8;
  const freeHangBounceAmplitudeM = roundTo(clamp(rawBounce, 0.4, 14.0), 2);

  let riskLevel: TiankengDescentAnalysis['riskLevel'];
  if (
    descenderThermalC >= 185 ||
    limestoneSpallTrajectoryRiskPct >= 75 ||
    waterfallSprayLitresMin >= 280 ||
    (verticalDropM >= 450 && rebelayCount < 2)
  ) {
    riskLevel = 'critical';
  } else if (
    descenderThermalC >= 135 ||
    limestoneSpallTrajectoryRiskPct >= 50 ||
    waterfallSprayLitresMin >= 150 ||
    freeHangBounceAmplitudeM >= 7.5
  ) {
    riskLevel = 'high';
  } else if (
    descenderThermalC >= 95 ||
    limestoneSpallTrajectoryRiskPct >= 28 ||
    waterfallSprayLitresMin >= 60 ||
    freeHangBounceAmplitudeM >= 4.0
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  const strategyMap: Record<
    TiankengDescentAnalysis['riskLevel'],
    TiankengDescentAnalysis['riggingStrategy']
  > = {
    critical: 'abort-plummet-spall-hypothermia-hazard',
    high: 'expedition-6-bar-rack-water-deviation',
    moderate: 'multi-rebelay-deviation-srt',
    low: 'single-pitch-rack-descender',
  };

  const riggingStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (descenderThermalC >= 185 || (verticalDropM >= 450 && rebelayCount < 2)) {
    warnings.push(
      `CRITICAL DESCENDER THERMAL GLAZING HAZARD (${descenderThermalC} °C across ${roundTo(unbrokenSpanM, 1)} m unbroken span): Approaches polyamide sheath softening/melting threshold (~190–220 °C).`
    );
  } else if (descenderThermalC >= 135) {
    warnings.push(
      `HIGH DESCENDER THERMAL LOAD (${descenderThermalC} °C on ${roundTo(unbrokenSpanM, 1)} m span): Standard aluminum bobbin descenders will overheat; use a 6-bar stainless U-rack.`
    );
  } else if (descenderThermalC >= 95) {
    warnings.push(
      `Moderate descender heating (${descenderThermalC} °C): Avoid abrupt high-speed rappelling and unclip descender from rope immediately upon landing.`
    );
  }

  if (limestoneSpallTrajectoryRiskPct >= 75) {
    warnings.push(
      `CRITICAL LIMESTONE SPALL & EPIPHYTE CHUTE EXPOSURE (${limestoneSpallTrajectoryRiskPct}% strike probability at ${overhangAngleDeg}° wall angle): Direct rockfall trajectory along slabbing karst wall.`
    );
  } else if (limestoneSpallTrajectoryRiskPct >= 50) {
    warnings.push(
      `High rockfall and cloud-forest root-clod spall hazard (${limestoneSpallTrajectoryRiskPct}% risk): Install intermediate rebelay and directional deviation anchors away from main fall line.`
    );
  } else if (limestoneSpallTrajectoryRiskPct >= 28) {
    warnings.push(
      `Moderate limestone spall trajectory exposure (${limestoneSpallTrajectoryRiskPct}% risk): Clear loose rim blocks and protect rope over intermediate ledges.`
    );
  }

  if (waterfallSprayLitresMin >= 280) {
    warnings.push(
      `CRITICAL WATERFALL PLUME DROWNING & HYPOTHERMIA HAZARD (${waterfallSprayLitresMin} L/min spray, ${wetRopeFrictionMultiplier}x wet friction): Heavy water column will pin climber on rope and flood airway.`
    );
  } else if (waterfallSprayLitresMin >= 150) {
    warnings.push(
      `High waterfall spray plume (${waterfallSprayLitresMin} L/min, ${wetRopeFrictionMultiplier}x friction): Rig high-angle deviation slings to pull SRT line outside the active water curtain.`
    );
  } else if (waterfallSprayLitresMin >= 60 || freeHangBounceAmplitudeM >= 4.0) {
    warnings.push(
      `Elevated wet-rope friction (${wetRopeFrictionMultiplier}x) and free-hang elastic bounce (${freeHangBounceAmplitudeM} m amplitude): Use smooth bar-addition technique during descent.`
    );
  }

  const recommendations: string[] = [
    `Deploy ${riggingStrategy} configuration immediately (unbroken pitch span: ${roundTo(unbrokenSpanM, 1)} m, peak rack thermal: ${descenderThermalC} °C).`,
    rebelayCount < 3 && verticalDropM >= 200
      ? `Add intermediate bolted rebelay stations to subdivide the ${verticalDropM} m drop below 60–80 m pitches, cutting free-hang bounce (${freeHangBounceAmplitudeM} m) and thermal build-up.`
      : `Maintain ${rebelayCount} rebelay pitch splits with Y-hang load sharing and 1.5 m knot loops to isolate rope abrasion across karst flutes.`,
    overhangAngleDeg >= 0
      ? `Offset anchors laterally with directional deviation slings to move the rope out of the ${overhangAngleDeg}° slabbing spall chute (${limestoneSpallTrajectoryRiskPct}% strike risk).`
      : `Leverage the ${overhangAngleDeg}° negative bell-shaft overhang for clean free-hang clearance while managing suspended rope weight at the lip.`,
    `Account for ${wetRopeFrictionMultiplier}x wet-rope drag at ${fogHumidityPct}% cloud-forest humidity and ${waterfallSprayLitresMin} L/min spray by starting with 3–4 rack bars at the rim and engaging all 6 bars near the bottom.`,
  ];

  return {
    wetRopeFrictionMultiplier,
    descenderThermalC,
    limestoneSpallTrajectoryRiskPct,
    freeHangBounceAmplitudeM,
    riskLevel,
    riggingStrategy,
    warnings,
    recommendations,
  };
}

export function getTiankengGearChecklist(): TiankengGearItem[] {
  return [...TIANKENG_GEAR_CHECKLIST];
}
