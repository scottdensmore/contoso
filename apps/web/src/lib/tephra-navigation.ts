export type TephraLithology =
  | 'vesicular-pumice'
  | 'scoria-lapilli'
  | 'vitrophyric-ash'
  | 'lithic-cinder';

export interface TephraSlopeSite {
  id: string;
  name: string;
  volcanicField: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  tephraLithology: TephraLithology;
  angleOfReposeDeg: number;
  cristobaliteAshPct: number;
  medianLapilliMm: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  respiratorProtocol: string;
  description: string;
}

export interface TephraNavigationInput {
  slopeAngleDeg: number;
  ashDepthCm: number;
  windSpeedKmh: number;
  cristobalitePct: number;
  grainSizeMm: number;
}

export interface TephraNavigationAnalysis {
  resuspendedPm10UgM3: number;
  grainFlowFactorOfSafety: number;
  downslopeSlideRatio: number;
  filterClogHours: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  respiratorClass:
    | 'N95-goggles'
    | 'P100-elastomeric-sealed-goggles'
    | 'P100-full-face-APR'
    | 'abort-silicosis-grainflow-hazard';
  warnings: string[];
  recommendations: string[];
}

export interface TephraGearItem {
  id: string;
  name: string;
  category:
    | 'respiration'
    | 'eye-protection'
    | 'gaiters-footwear'
    | 'navigation';
  essential: boolean;
  rationale: string;
}

export const TEPHRA_SLOPE_SITES: TephraSlopeSite[] = [
  {
    id: 'yasur-ash-plain-vanuatu',
    name: 'Mount Yasur Ash Plain & Scoria Cone Apron',
    volcanicField: 'Siwi Caldera & Yenkahe Resurgent Block',
    country: 'Vanuatu',
    region: 'Tanna Island, Tafea Province',
    latitude: -19.532,
    longitude: 169.447,
    elevationMeters: 361,
    tephraLithology: 'scoria-lapilli',
    angleOfReposeDeg: 29,
    cristobaliteAshPct: 5.5,
    medianLapilliMm: 4.5,
    difficulty: 'moderate',
    bestSeason: 'May – October (Southeast Trade-Wind Dry Window)',
    hazards: [
      'Continuous Strombolian ash-fall blankets across the Lake Siwi deflation plain',
      'Sharp basaltic-andesite scoria lapilli infiltrating unsealed ankle collars',
      'Sudden crosswind ash vortices reducing visibility and stinging exposed corneas',
    ],
    respiratorProtocol:
      'P100-elastomeric-sealed-goggles during crosswind ash plumes; N95-goggles minimum on upwind approaches.',
    description:
      'An active basaltic-andesite scoria cone apron rising above the Siwi ash plain where loose lapilli beds and trade-wind ash resuspension demand sealed eye protection and controlled plunge-step descents.',
  },
  {
    id: 'acatenango-fuego-tephra-guatemala',
    name: 'Volcán Acatenango–Fuego Lapilli Saddle & Scree Chute',
    volcanicField: 'Central America Volcanic Arc (Cordillera Central)',
    country: 'Guatemala',
    region: 'Sacatepéquez & Chimaltenango',
    latitude: 14.501,
    longitude: -90.876,
    elevationMeters: 3880,
    tephraLithology: 'lithic-cinder',
    angleOfReposeDeg: 34,
    cristobaliteAshPct: 9.0,
    medianLapilliMm: 6.2,
    difficulty: 'challenging',
    bestSeason: 'November – April (Highland Dry Window)',
    hazards: [
      'Unconsolidated 32–36° lithic cinder and scoria chutes prone to localized grain-flow avalanching',
      'Fine vulcanian ash fallout from adjacent Volcán de Fuego resuspended by boot traffic and ridge gusts',
      'High-altitude dehydration compounding respiratory resistance through particulate filters at 3,880 m',
    ],
    respiratorProtocol:
      'P100-elastomeric-sealed-goggles on the La Horqueta saddle and leeward descent chutes.',
    description:
      'High-altitude stratovolcano saddle and steep lithic-cinder descent chutes linking Acatenango and Fuego, famous for deep plunge-stepping in rolling lapilli and intermittent fine ash plumes.',
  },
  {
    id: 'tarawera-scoria-chute-nz',
    name: 'Mount Tarawera Chasm & Basaltic Scoria Scree',
    volcanicField: 'Okataina Volcanic Centre (Taupō Volcanic Zone)',
    country: 'New Zealand',
    region: 'Bay of Plenty, North Island',
    latitude: -38.227,
    longitude: 176.506,
    elevationMeters: 1111,
    tephraLithology: 'vesicular-pumice',
    angleOfReposeDeg: 32,
    cristobaliteAshPct: 7.5,
    medianLapilliMm: 8.5,
    difficulty: 'challenging',
    bestSeason: 'December – April (Austral Summer Window)',
    hazards: [
      'Deep vesicular basaltic scoria and rhyolitic pumice scree chutes descending into the 1886 eruption chasm',
      'Razor-edged glassy pyroclasts shredding light mesh trail-running uppers and exposed shins',
      'Loose bi-modal pumice-scoria layering causing variable plunge-step slide ratios',
    ],
    respiratorProtocol:
      'N95-goggles or P100-elastomeric-sealed-goggles during dry gusty chasm descents.',
    description:
      'Steep 1886 rift chasm walls mantled in red-black basaltic scoria and underlying Kaharoa rhyolitic vesicular pumice where heel-weighted plunge-stepping regulates downslope momentum.',
  },
  {
    id: 'chaiten-rhyolite-pumice-chile',
    name: 'Volcán Chaitén Obsidian Dome & Cristobalite Ash Apron',
    volcanicField: 'Southern Volcanic Zone (Andean Austral Arc)',
    country: 'Chile',
    region: 'Palena Province, Los Lagos',
    latitude: -42.833,
    longitude: -72.646,
    elevationMeters: 1122,
    tephraLithology: 'vitrophyric-ash',
    angleOfReposeDeg: 35,
    cristobaliteAshPct: 19.0,
    medianLapilliMm: 0.12,
    difficulty: 'extreme',
    bestSeason: 'January – March (Austral Late-Summer Window)',
    hazards: [
      'High crystalline silica (18–21% cristobalite) generated by vapor-phase devitrification in the 2008 rhyolite obsidian dome',
      'Ultra-fine vitrophyric glass shards (<10 µm) remaining suspended in caldera air currents for hours',
      'Steep, unstable caldera-wall tephra aprons prone to sudden dry grain flows and lahars after rain',
    ],
    respiratorProtocol:
      'P100-full-face-APR mandatory in dry caldera ash aprons; abort traverse if wind gusts exceed 40 km/h.',
    description:
      'Caldera rim and obsidian lava-dome apron blanketed by 2008 rhyolitic vitrophyric ash rich in breathable cristobalite nanofibers, representing a premier volcanic silicosis and ocular abrasion hazard.',
  },
];

export const TEPHRA_GEAR_CHECKLIST: TephraGearItem[] = [
  {
    id: 'p100-elastomeric-half-mask-respirator',
    name: 'NIOSH P100 Elastomeric Half-Mask Respirator & Spare Particulate Cartridges',
    category: 'respiration',
    essential: true,
    rationale:
      'Blocks >=99.97% of sub-4 µm respirable cristobalite silica and vitrophyric glass shards that bypass cloth bandanas and loose disposable masks during downhill plunge-stepping.',
  },
  {
    id: 'non-vented-sealed-polycarbonate-ash-goggles',
    name: 'Non-Vented Sealed Polycarbonate Ash & Lapilli Goggles',
    category: 'eye-protection',
    essential: true,
    rationale:
      'Closed-cell foam or silicone perimeter seal prevents angular volcanic glass shards from entering the tear film and causing acute corneal abrasions. Contact lenses must never be worn in ash-fall zones.',
  },
  {
    id: 'kevlar-instep-strap-scree-gaiters',
    name: 'Full-Height Cordura/Kevlar Scree Gaiters with Replaceable Underfoot Cable',
    category: 'gaiters-footwear',
    essential: true,
    rationale:
      'Seals the boot collar against 2–64 mm vesicular lapilli and abrasive scoria intrusion during heel-first plunge-step descents where feet sink 15–30 cm into loose tephra.',
  },
  {
    id: 'full-grain-leather-vibram-mountaineering-boots',
    name: 'Full-Grain Leather Boots with Deep-Lug Vibram & Rubber Rand Armor',
    category: 'gaiters-footwear',
    essential: true,
    rationale:
      '360-degree vulcanized rubber rand resists shredding by sharp vitrophyric obsidian and basaltic scoria clasts that slice through ultralight knit mesh uppers in a single chute descent.',
  },
  {
    id: 'saline-ocular-flush-ampoules',
    name: 'Sterile Single-Use Isotonic Saline Ocular Irrigation Ampoules (6 x 20 mL)',
    category: 'eye-protection',
    essential: true,
    rationale:
      'Enables immediate hands-free flushing of acidic ash particles and glass splinters from the conjunctival sac without rubbing the cornea.',
  },
  {
    id: 'barometric-gnss-compass-with-dustproof-ip68-housing',
    name: 'IP68 Dust-Sealed Dual-Band GNSS Navigator & Sighting Compass',
    category: 'navigation',
    essential: true,
    rationale:
      'Maintains waypoint lock and barometric elevation tracking when resuspended ash plumes drop visual range below 30 m without fine tephra jamming open mechanical bezels.',
  },
];

export function filterTephraSites(
  sites: TephraSlopeSite[] = TEPHRA_SLOPE_SITES,
  filters: {
    country?: string;
    lithology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): TephraSlopeSite[] {
  const { country, lithology, difficulty, search } = filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (
      lithology &&
      lithology !== 'all' &&
      site.tephraLithology !== lithology
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
        site.volcanicField,
        site.country,
        site.region,
        site.tephraLithology,
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

export function calculateTephraNavigation(
  input: TephraNavigationInput
): TephraNavigationAnalysis {
  const {
    slopeAngleDeg,
    ashDepthCm,
    windSpeedKmh,
    cristobalitePct,
    grainSizeMm,
  } = input;

  if (
    !Number.isFinite(slopeAngleDeg) ||
    slopeAngleDeg < 0 ||
    slopeAngleDeg > 55
  ) {
    throw new Error(
      'Invalid slopeAngleDeg: must be a finite number between 0 and 55 degrees.'
    );
  }

  if (!Number.isFinite(ashDepthCm) || ashDepthCm < 0 || ashDepthCm > 300) {
    throw new Error(
      'Invalid ashDepthCm: must be a finite number between 0 and 300 cm.'
    );
  }

  if (
    !Number.isFinite(windSpeedKmh) ||
    windSpeedKmh < 0 ||
    windSpeedKmh > 150
  ) {
    throw new Error(
      'Invalid windSpeedKmh: must be a finite number between 0 and 150 km/h.'
    );
  }

  if (
    !Number.isFinite(cristobalitePct) ||
    cristobalitePct < 0 ||
    cristobalitePct > 35
  ) {
    throw new Error(
      'Invalid cristobalitePct: must be a finite number between 0 and 35%.'
    );
  }

  if (
    !Number.isFinite(grainSizeMm) ||
    grainSizeMm < 0.01 ||
    grainSizeMm > 64
  ) {
    throw new Error(
      'Invalid grainSizeMm: must be a finite number between 0.01 and 64 mm.'
    );
  }

  // Fine volcanic ash (< 2 mm) resuspends exponentially more than coarse lapilli
  const fineGrainFactor = 1 / Math.pow(Math.max(0.05, grainSizeMm), 0.55);
  const rawPm10 =
    25 + (windSpeedKmh * 6.5 + ashDepthCm * 2.2) * fineGrainFactor;
  const resuspendedPm10UgM3 = roundTo(clamp(rawPm10, 10, 5000), 1);

  // Effective internal friction angle (~34 deg baseline, increases slightly for angular lapilli, decreases for deep fine ash)
  const effectiveFrictionAngle = clamp(
    34 +
      Math.min(4, Math.log10(Math.max(0.05, grainSizeMm) + 1) * 3.2) -
      (ashDepthCm / 300) * 5.5,
    24,
    40
  );
  const grainFlowFactorOfSafety = roundTo(
    clamp(effectiveFrictionAngle / Math.max(1, slopeAngleDeg), 0.4, 5.0),
    2
  );

  // Downslope plunge-step slide distance ratio (0.1 to 2.5)
  const downslopeSlideRatio = roundTo(
    clamp(
      0.1 +
        (slopeAngleDeg / 55) * 1.45 +
        (ashDepthCm / 300) * 0.75 +
        (grainSizeMm >= 2 && grainSizeMm <= 16 ? 0.2 : 0.05),
      0.1,
      2.5
    ),
    2
  );

  // Hours before P100 particulate filter cartridges saturate (0.5 to 12.0)
  const filterClogHours = roundTo(
    clamp(
      12.0 -
        (resuspendedPm10UgM3 / 2200) * 10.5 -
        (windSpeedKmh / 150) * 1.2,
      0.5,
      12.0
    ),
    1
  );

  let riskLevel: TephraNavigationAnalysis['riskLevel'];
  if (
    resuspendedPm10UgM3 >= 1500 ||
    grainFlowFactorOfSafety < 0.95 ||
    cristobalitePct >= 18 ||
    slopeAngleDeg >= 38
  ) {
    riskLevel = 'critical';
  } else if (
    resuspendedPm10UgM3 >= 700 ||
    grainFlowFactorOfSafety < 1.15 ||
    cristobalitePct >= 10 ||
    slopeAngleDeg >= 32
  ) {
    riskLevel = 'high';
  } else if (
    resuspendedPm10UgM3 >= 250 ||
    grainFlowFactorOfSafety < 1.35 ||
    cristobalitePct >= 5 ||
    slopeAngleDeg >= 24
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  const respiratorClassMap: Record<
    TephraNavigationAnalysis['riskLevel'],
    TephraNavigationAnalysis['respiratorClass']
  > = {
    critical: 'abort-silicosis-grainflow-hazard',
    high: 'P100-full-face-APR',
    moderate: 'P100-elastomeric-sealed-goggles',
    low: 'N95-goggles',
  };

  const respiratorClass = respiratorClassMap[riskLevel];

  const warnings: string[] = [];
  if (cristobalitePct >= 18) {
    warnings.push(
      `CRITICAL CRISTOBALITE SILICOSIS HAZARD (${cristobalitePct}% crystalline silica): Devitrified volcanic dome ash exceeds acute occupational exposure thresholds.`
    );
  } else if (cristobalitePct >= 10) {
    warnings.push(
      `HIGH CRISTOBALITE ASH CONTENT (${cristobalitePct}%): Prolonged inhalation of sub-10 µm cristobalite particles risks accelerated fibrotic silicosis.`
    );
  } else if (cristobalitePct >= 5) {
    warnings.push(
      `Elevated crystalline silica fraction (${cristobalitePct}% cristobalite): Maintain tight respirator facepiece seal throughout descent.`
    );
  }

  if (grainFlowFactorOfSafety < 0.95 || slopeAngleDeg >= 38) {
    warnings.push(
      `IMMINENT GRAIN-FLOW SLAB INSTABILITY (FoS ${grainFlowFactorOfSafety} at ${slopeAngleDeg}°): Slope exceeds angle of repose for unconsolidated tephra.`
    );
  } else if (grainFlowFactorOfSafety < 1.15 || slopeAngleDeg >= 32) {
    warnings.push(
      `Marginal scoria/lapilli slope stability (FoS ${grainFlowFactorOfSafety}): Footfalls may trigger cascading dry grain flows onto lower party members.`
    );
  } else if (grainFlowFactorOfSafety < 1.35 || slopeAngleDeg >= 24) {
    warnings.push(
      `Active lapilli creep zone (FoS ${grainFlowFactorOfSafety}): Expect ${downslopeSlideRatio}m downslope slide per plunge step.`
    );
  }

  if (resuspendedPm10UgM3 >= 1500) {
    warnings.push(
      `EXTREME ASH RESUSPENSION (${resuspendedPm10UgM3} µg/m³ PM10): Severe zero-visibility brownout and rapid P100 cartridge blinding (${filterClogHours} h service life).`
    );
  } else if (resuspendedPm10UgM3 >= 700) {
    warnings.push(
      `Heavy airborne volcanic ash plume (${resuspendedPm10UgM3} µg/m³ PM10): Remove contact lenses immediately and seal non-vented goggles.`
    );
  } else if (resuspendedPm10UgM3 >= 250) {
    warnings.push(
      `Moderate resuspended ash concentration (${resuspendedPm10UgM3} µg/m³ PM10): Dust plumes trailed by lead descendents require echelon spacing.`
    );
  }

  const recommendations: string[] = [
    `Deploy ${respiratorClass} respiratory and ocular protection protocol before entering the tephra apron.`,
    `Inspect and tap-clean or swap P100 particulate filter cartridges every ${filterClogHours} hours to prevent high inspiratory breathing resistance.`,
    'Descend in diagonal echelon formation rather than single-file fall-line alignment to avoid kicking scoria lapilli and ash plumes onto lower climbers.',
    'Remove all contact lenses prior to descent; use non-vented foam-sealed polycarbonate goggles and carry sterile isotonic saline ampoules.',
    `Use heel-weighted plunge-stepping with knees flexed and gaiters cable-locked (estimated slide ratio: ${downslopeSlideRatio}x stride).`,
  ];

  return {
    resuspendedPm10UgM3,
    grainFlowFactorOfSafety,
    downslopeSlideRatio,
    filterClogHours,
    riskLevel,
    respiratorClass,
    warnings,
    recommendations,
  };
}

export function getTephraGearChecklist(): TephraGearItem[] {
  return [...TEPHRA_GEAR_CHECKLIST];
}
