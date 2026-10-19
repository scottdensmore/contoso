export type KrummholzEcotype =
  | 'balsam-fir-spruce-mat'
  | 'mountain-pine-latschen-labyrinth'
  | 'subalpine-larch-alder-thicket'
  | 'wind-flagged-whitebark-cushion';

export interface KrummholzSite {
  id: string;
  name: string;
  mountainRange: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  ecotype: KrummholzEcotype;
  stemsPerSqMeter: number;
  canopyMatHeightM: number;
  snowMoatDepthCm: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  transitProtocol: string;
  description: string;
}

export interface KrummholzBushwhackInput {
  stemsPerSqMeter: number;
  canopyMatHeightM: number;
  snowMoatDepthCm: number;
  slopeAngleDeg: number;
  packWidthCm: number;
}

export interface KrummholzBushwhackAnalysis {
  effectiveVelocityKmH: number;
  treeWellSpruceTrapRiskPct: number;
  metabolicKcalPerHour: number;
  branchSnagResistanceIndex: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  transitStrategy:
    | 'follow-frost-heave-rock-leads'
    | 'streamline-pack-eye-shield-crawl'
    | 'snowshoe-float-probe-spruce-moats'
    | 'abort-reroute-to-scree-drainage';
  warnings: string[];
  recommendations: string[];
}

export interface KrummholzGearItem {
  id: string;
  name: string;
  category:
    | 'eye-face-armor'
    | 'pack-streamlining'
    | 'snow-moat-extraction'
    | 'navigation';
  essential: boolean;
  rationale: string;
}

export const KRUMMHOLZ_SITES: KrummholzSite[] = [
  {
    id: 'presidential-krummholz-whitemtns-usa',
    name: 'Presidential Range Abies balsamea Krummholz Wave Zone',
    mountainRange: 'White Mountains (Presidential Range)',
    country: 'United States',
    region: 'New Hampshire',
    latitude: 44.303,
    longitude: -71.318,
    elevationMeters: 1490,
    ecotype: 'balsam-fir-spruce-mat',
    stemsPerSqMeter: 34,
    canopyMatHeightM: 1.7,
    snowMoatDepthCm: 165,
    difficulty: 'extreme',
    bestSeason: 'August – October (Dry Late-Summer Frost-Heave Window)',
    hazards: [
      'Interlocking Abies balsamea and Picea rubens wave-regenerated mats exceeding 30 stems/m² with needle-sharp dead lower twigs at eye level',
      'Deep winter/spring sub-canopy spruce-trap snow voids (150–200 cm) above hollow boulder cavities that trigger inverted tree-well entrapment',
      'Hurricane-force rime-ice wind shear above 1,450 m that forces rapid emergency descent back into disorienting chest-high conifer thickets',
    ],
    transitProtocol:
      'snowshoe-float-probe-spruce-moats during snowpack months or follow linear frost-heave quartzite boulder leads and dry birch-glade wave troughs.',
    description:
      'A classic wave-regenerated balsam fir and red spruce krummholz belt on the wind-scoured flanks of Mount Adams and Mount Jefferson, notorious for spruce traps and sub-0.4 km/h off-trail bushwhacking.',
  },
  {
    id: 'karwendel-latschenkiefer-tyrol-austria',
    name: 'Karwendel Pinus mugo (Latschenkiefer) Limestone Bench Labyrinth',
    mountainRange: 'Northern Limestone Alps (Karwendel)',
    country: 'Austria',
    region: 'Tyrol',
    latitude: 47.418,
    longitude: 11.472,
    elevationMeters: 1820,
    ecotype: 'mountain-pine-latschen-labyrinth',
    stemsPerSqMeter: 22,
    canopyMatHeightM: 1.9,
    snowMoatDepthCm: 95,
    difficulty: 'challenging',
    bestSeason: 'July – October (Snow-Free Carbonate Karst Window)',
    hazards: [
      'Springy decumbent Pinus mugo (Latschenkiefer) bows that store elastic energy and whip packs backward down 30° limestone scree benches',
      'Concealed karst solution grikes and doline fissures masked beneath continuous resinous dwarf-pine carpets',
      'Intense thermal radiation and lack of surface water across south-facing Wetterstein limestone terraces',
    ],
    transitProtocol:
      'streamline-pack-eye-shield-crawl along dry gravel chamois tracks (Gamswechsel) and carbonate erosion gullies rather than fighting across Latschen grain.',
    description:
      'Extensive prostrate mountain pine (Latschenkiefer) labyrinths blanketing steep Triassic limestone benches of the Tyrolean Karwendel, where elastic resinous stems demand streamlined packs and micro-channel routing.',
  },
  {
    id: 'garibaldi-slide-alder-subalpine-canada',
    name: 'Garibaldi & Coast Range Sitka Alder / Subalpine Fir Mat',
    mountainRange: 'Coast Mountains (Garibaldi Ranges)',
    country: 'Canada',
    region: 'British Columbia',
    latitude: 49.912,
    longitude: -122.988,
    elevationMeters: 1610,
    ecotype: 'subalpine-larch-alder-thicket',
    stemsPerSqMeter: 28,
    canopyMatHeightM: 2.3,
    snowMoatDepthCm: 185,
    difficulty: 'extreme',
    bestSeason: 'Late July – September (Post-Melt Alpine Ridge Window)',
    hazards: [
      'Downhill-bowed Alnus viridis sinuata (Sitka slide alder) and Abies lasiocarpa stems slick with coastal moss that trap ankles and external pack frames',
      'Massive maritime snowpack moats around subalpine fir islands creating 2-meter-deep perimeter voids during May–June isothermal melt',
      'Steep glaciated granodiorite slabs hidden directly beneath cantilevered root mats',
    ],
    transitProtocol:
      'snowshoe-float-probe-spruce-moats during deep spring consolidations or ascend bordering talus rib leads above the avalanche-path alder zone.',
    description:
      'Dense maritime avalanche-track slide alder and subalpine fir krummholz in the British Columbia Coast Mountains, where heavy winter snow creep trains every trunk into a downhill-pointing barrier.',
  },
  {
    id: 'tateyama-hai-matsu-alps-japan',
    name: 'Tateyama Kurobe Pinus pumila (Hai-Matsu) Wind-Swept Crest',
    mountainRange: 'Hida Mountains (Northern Japan Alps)',
    country: 'Japan',
    region: 'Toyama Prefecture',
    latitude: 36.578,
    longitude: 137.619,
    elevationMeters: 2450,
    ecotype: 'wind-flagged-whitebark-cushion',
    stemsPerSqMeter: 15,
    canopyMatHeightM: 0.9,
    snowMoatDepthCm: 70,
    difficulty: 'moderate',
    bestSeason: 'July – Early October (Post-Baiu High-Ridge Window)',
    hazards: [
      'Interwoven Siberian dwarf pine (Hai-Matsu, Pinus pumila) creeping mats that conceal ankle-twisting granite frost-shatter blocks',
      'Hollow spring snow bridges suspended over dwarf-pine crowns during rapid Sea-of-Japan snowdrift ablation',
      'Sudden Sea-of-Japan orographic fog banks reducing visibility to <15 m across featureless dwarf-conifer plateaus',
    ],
    transitProtocol:
      'follow-frost-heave-rock-leads along periglacial stone stripes and wind-deflated granite gravel leads.',
    description:
      'High-altitude Siberian dwarf pine (Hai-Matsu) cushion mats sculpted by fierce Siberian winter monsoons across the 2,450 m crests of the Northern Japan Alps.',
  },
];

export const KRUMMHOLZ_GEAR_CHECKLIST: KrummholzGearItem[] = [
  {
    id: 'ballistic-polycarbonate-eye-shield-visor',
    name: 'ANSI Z87.1 Ballistic Polycarbonate Wrap-Around Eye Shield & Mesh Face Visor',
    category: 'eye-face-armor',
    essential: true,
    rationale:
      'Prevents corneal abrasions and penetrating ocular trauma from stiff, dead sub-canopy spruce and balsam fir twigs under elastic tension.',
  },
  {
    id: 'slick-cordura-zero-lash-bushwhack-pack',
    name: 'Slick-Faced Cordura 500D Internal-Frame Pack with Zero External Lash Points',
    category: 'pack-streamlining',
    essential: true,
    rationale:
      'Eliminates mesh side pockets, external trekking-pole loops, and dangling straps that snag continuously in >20 stems/m² dwarf-conifer labyrinths.',
  },
  {
    id: 'avalanche-probe-compact-snow-saw-shovel',
    name: '240 cm Quick-Lock Probe, Compact Wood/Snow Saw & Collapsible Aluminum Shovel',
    category: 'snow-moat-extraction',
    essential: true,
    rationale:
      'Probes hollow sub-canopy spruce-trap voids before stepping and clears interlocking lower branches during inverted tree-well partner rescues.',
  },
  {
    id: 'high-flotation-tailed-mountain-snowshoes',
    name: 'High-Flotation Serrated-Deck Mountain Snowshoes with Detachable Flotation Tails',
    category: 'snow-moat-extraction',
    essential: true,
    rationale:
      'Distributes load across cantilevered conifer crown snow bridges and prevents catastrophic postholing into 1.5–2.5 m sub-canopy snow moats.',
  },
  {
    id: 'dual-frequency-gnss-magnetic-compass-clinometer',
    name: 'Dual-Frequency Multi-Band GNSS Receiver, Sighting Mirror Compass & Clinometer',
    category: 'navigation',
    essential: true,
    rationale:
      'Maintains dead-reckoning bearing accuracy toward frost-heave boulder leads and dry scree drainages when chest-high krummholz obscures terrain landmarks.',
  },
  {
    id: 'reinforced-kevlar-forearm-shin-gaiter-armor',
    name: 'Aramid-Reinforced Forearm Sleeves & Full-Height Hookless Gore-Tex Bushwhack Gaiters',
    category: 'pack-streamlining',
    essential: true,
    rationale:
      'Shields shins and forearms from resinous Pinus mugo and Abies lasiocarpa bark lacerations while preventing boot-lace hooks from catching root snares.',
  },
];

export function filterKrummholzSites(
  sites: KrummholzSite[] = KRUMMHOLZ_SITES,
  filters: {
    country?: string;
    ecotype?: string;
    difficulty?: string;
    search?: string;
  } = {}
): KrummholzSite[] {
  const { country, ecotype, difficulty, search } = filters;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return sites.filter((site) => {
    if (country && country !== 'all' && site.country !== country) {
      return false;
    }
    if (ecotype && ecotype !== 'all' && site.ecotype !== ecotype) {
      return false;
    }
    if (difficulty && difficulty !== 'all' && site.difficulty !== difficulty) {
      return false;
    }
    if (normalizedSearch.length > 0) {
      const haystack = [
        site.name,
        site.mountainRange,
        site.country,
        site.region,
        site.ecotype,
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

export function calculateKrummholzBushwhack(
  input: KrummholzBushwhackInput
): KrummholzBushwhackAnalysis {
  const {
    stemsPerSqMeter,
    canopyMatHeightM,
    snowMoatDepthCm,
    slopeAngleDeg,
    packWidthCm,
  } = input;

  if (
    !Number.isFinite(stemsPerSqMeter) ||
    stemsPerSqMeter < 1 ||
    stemsPerSqMeter > 45
  ) {
    throw new Error(
      'Invalid stemsPerSqMeter: must be a finite number between 1 and 45 stems/m².'
    );
  }

  if (
    !Number.isFinite(canopyMatHeightM) ||
    canopyMatHeightM < 0.3 ||
    canopyMatHeightM > 3.5
  ) {
    throw new Error(
      'Invalid canopyMatHeightM: must be a finite number between 0.3 and 3.5 meters.'
    );
  }

  if (
    !Number.isFinite(snowMoatDepthCm) ||
    snowMoatDepthCm < 0 ||
    snowMoatDepthCm > 250
  ) {
    throw new Error(
      'Invalid snowMoatDepthCm: must be a finite number between 0 and 250 cm.'
    );
  }

  if (
    !Number.isFinite(slopeAngleDeg) ||
    slopeAngleDeg < 0 ||
    slopeAngleDeg > 50
  ) {
    throw new Error(
      'Invalid slopeAngleDeg: must be a finite number between 0 and 50 degrees.'
    );
  }

  if (
    !Number.isFinite(packWidthCm) ||
    packWidthCm < 25 ||
    packWidthCm > 85
  ) {
    throw new Error(
      'Invalid packWidthCm: must be a finite number between 25 and 85 cm.'
    );
  }

  // Composite mechanical drag score (1.0 to 10.0), peaking in waist/chest-high mats (1.0–2.2 m)
  const waistChestPenalty =
    Math.exp(-Math.pow((canopyMatHeightM - 1.65) / 0.75, 2)) * 1.6;
  const heightDrag = (canopyMatHeightM / 3.5) * 1.8 + waistChestPenalty;
  const rawSnag =
    1.0 +
    (stemsPerSqMeter / 45) * 4.8 +
    heightDrag +
    ((packWidthCm - 25) / 60) * 1.8;
  const branchSnagResistanceIndex = roundTo(clamp(rawSnag, 1.0, 10.0), 1);

  // Effective bushwhacking velocity (0.15 to 3.2 km/h)
  const rawVelocity =
    3.2 -
    (branchSnagResistanceIndex - 1.0) * 0.31 -
    (snowMoatDepthCm / 250) * 0.82 -
    (slopeAngleDeg / 50) * 0.26;
  const effectiveVelocityKmH = roundTo(clamp(rawVelocity, 0.15, 3.2), 2);

  // Probability of postholing into hollow sub-canopy snow voids ("spruce traps" / tree wells) (0 to 100%)
  const rawTrapRisk =
    (snowMoatDepthCm / 250) * 65 +
    (stemsPerSqMeter / 45) * 28 * (snowMoatDepthCm / 250 + 0.15) +
    (canopyMatHeightM / 3.5) * 7 * (snowMoatDepthCm / 250);
  const treeWellSpruceTrapRiskPct = roundTo(clamp(rawTrapRisk, 0, 100), 1);

  // Metabolic energy expenditure (320 to 1150 kcal/hr)
  const rawKcal =
    320 +
    (stemsPerSqMeter / 45) * 280 +
    (slopeAngleDeg / 50) * 240 +
    (snowMoatDepthCm / 250) * 190 +
    ((packWidthCm - 25) / 60) * 120;
  const metabolicKcalPerHour = Math.round(clamp(rawKcal, 320, 1150));

  let riskLevel: KrummholzBushwhackAnalysis['riskLevel'];
  if (
    treeWellSpruceTrapRiskPct >= 75 ||
    effectiveVelocityKmH <= 0.35 ||
    branchSnagResistanceIndex >= 8.2
  ) {
    riskLevel = 'critical';
  } else if (
    treeWellSpruceTrapRiskPct >= 50 ||
    effectiveVelocityKmH <= 0.65 ||
    branchSnagResistanceIndex >= 6.2
  ) {
    riskLevel = 'high';
  } else if (
    treeWellSpruceTrapRiskPct >= 25 ||
    effectiveVelocityKmH <= 1.2 ||
    branchSnagResistanceIndex >= 3.8
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  const strategyMap: Record<
    KrummholzBushwhackAnalysis['riskLevel'],
    KrummholzBushwhackAnalysis['transitStrategy']
  > = {
    critical: 'abort-reroute-to-scree-drainage',
    high: 'snowshoe-float-probe-spruce-moats',
    moderate: 'streamline-pack-eye-shield-crawl',
    low: 'follow-frost-heave-rock-leads',
  };

  const transitStrategy = strategyMap[riskLevel];

  const warnings: string[] = [];
  if (treeWellSpruceTrapRiskPct >= 75) {
    warnings.push(
      `CRITICAL SPRUCE-TRAP & TREE-WELL VOID HAZARD (${treeWellSpruceTrapRiskPct}% risk at ${snowMoatDepthCm} cm snow moat depth and ${stemsPerSqMeter} stems/m²): High probability of inverted entrapment in hollow sub-canopy snow cavities.`
    );
  } else if (treeWellSpruceTrapRiskPct >= 50) {
    warnings.push(
      `HIGH SUB-CANOPY SPRUCE-MOAT COLLAPSE RISK (${treeWellSpruceTrapRiskPct}% risk, ${snowMoatDepthCm} cm moat): Cantilevered snow bridges over dwarf-conifer crowns can collapse without warning.`
    );
  } else if (treeWellSpruceTrapRiskPct >= 25) {
    warnings.push(
      `Moderate perimeter snow-moat postholing hazard (${treeWellSpruceTrapRiskPct}% spruce-trap index at ${snowMoatDepthCm} cm snow depth): Probe ahead of disguised fir/pine crowns.`
    );
  }

  if (effectiveVelocityKmH <= 0.35 || branchSnagResistanceIndex >= 8.2) {
    warnings.push(
      `CRITICAL MECHANICAL ENTANGLEMENT & EXHAUSTION (${effectiveVelocityKmH} km/h pace, snag index ${branchSnagResistanceIndex}/10, ${metabolicKcalPerHour} kcal/hr burn): Waist/chest-high ${canopyMatHeightM} m krummholz mat will immobilize a ${packWidthCm} cm pack.`
    );
  } else if (effectiveVelocityKmH <= 0.65 || branchSnagResistanceIndex >= 6.2) {
    warnings.push(
      `High branch-snag drag (${branchSnagResistanceIndex}/10 snag index, ${effectiveVelocityKmH} km/h effective pace): Stiff dead twigs and ${stemsPerSqMeter} stems/m² density pose severe ocular and pack-snag hazards.`
    );
  } else if (effectiveVelocityKmH <= 1.2 || branchSnagResistanceIndex >= 3.8) {
    warnings.push(
      `Moderate krummholz thicket impedance (${branchSnagResistanceIndex}/10 snag index, ${effectiveVelocityKmH} km/h pace across ${slopeAngleDeg}° slope): Strip external pack attachments and wear polycarbonate eye shields.`
    );
  }

  const recommendations: string[] = [
    `Execute ${transitStrategy} protocol immediately (modeled pace: ${effectiveVelocityKmH} km/h, metabolic burn: ${metabolicKcalPerHour} kcal/hr).`,
    snowMoatDepthCm >= 50
      ? `Maintain strict partner visual contact and probe ${snowMoatDepthCm} cm sub-canopy snow moats (${treeWellSpruceTrapRiskPct}% spruce-trap risk) before weighting snow bridges near conifer trunks.`
      : `Link periglacial frost-heave boulder strings, dry avalanche slide beds, and bedrock ribs to bypass ${stemsPerSqMeter} stems/m² conifer mats.`,
    `Compress pack profile from ${packWidthCm} cm by stowing trekking poles, ice axes, and foam pads internally to reduce ${branchSnagResistanceIndex}/10 mechanical snag drag.`,
    `Wear ANSI Z87.1 wrap-around polycarbonate eye protection continuously when pushing through ${canopyMatHeightM} m dwarf-conifer crowns.`,
  ];

  return {
    effectiveVelocityKmH,
    treeWellSpruceTrapRiskPct,
    metabolicKcalPerHour,
    branchSnagResistanceIndex,
    riskLevel,
    transitStrategy,
    warnings,
    recommendations,
  };
}

export function getKrummholzGearChecklist(): KrummholzGearItem[] {
  return [...KRUMMHOLZ_GEAR_CHECKLIST];
}
