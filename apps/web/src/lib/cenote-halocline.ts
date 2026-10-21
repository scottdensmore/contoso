export type CenoteMorphology =
  | 'anchialine-halocline-conduit'
  | 'meromictic-h2s-cloud-bell-sinkhole'
  | 'decorated-speleothem-phreatic-maze'
  | 'coastal-tidal-siphon-blue-hole';

export interface CenoteHaloclineSite {
  id: string;
  name: string;
  aquiferSystem: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  morphology: CenoteMorphology;
  haloclineDepthMeters: number;
  salinityGradientPpt: number;
  tannicAttenuationPct: number;
  difficulty: 'moderate' | 'challenging' | 'extreme';
  bestSeason: string;
  hazards: string[];
  guidelineProtocol: string;
  description: string;
}

export interface CenoteHaloclineInput {
  salinityDeltaPpt: number;
  tannicDocMgL: number;
  siltClayFractionPct: number;
  penetrationDistanceM: number;
  h2sConcentrationPpm: number;
}

export interface CenoteHaloclineAnalysis {
  schlierenOpticalBlurIndex: number;
  postMixVisibilityMeters: number;
  buoyancyTrimShiftKg: number;
  ruleOfThirdsReserveBar: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  navigationProtocol:
    | 'visual-daylight-cavern-zone-line'
    | 'continuous-guideline-frog-kick-above-halocline'
    | 'blind-tactile-line-cookies-zero-vis-drill'
    | 'abort-toxic-h2s-siltout-entrapment-hazard';
  warnings: string[];
  recommendations: string[];
}

export interface CenoteGearItem {
  id: string;
  name: string;
  category:
    | 'guideline-markers'
    | 'lighting-optics'
    | 'buoyancy-trim'
    | 'gas-redundancy';
  essential: boolean;
  rationale: string;
}

export const CENOTE_HALOCLINE_SITES: CenoteHaloclineSite[] = [
  {
    id: 'ox-bel-ha-halocline-tulum-mexico',
    name: 'Sistema Ox Bel Ha Anchialine Halocline Labyrinth',
    aquiferSystem: 'Quintana Roo Karst Aquifer',
    country: 'Mexico',
    region: 'Tulum, Quintana Roo',
    latitude: 20.161,
    longitude: -87.488,
    elevationMeters: 6,
    morphology: 'anchialine-halocline-conduit',
    haloclineDepthMeters: 13.5,
    salinityGradientPpt: 28,
    tannicAttenuationPct: 34,
    difficulty: 'extreme',
    bestSeason: 'November – April (Dry-Season Low Tannic Inflow Window)',
    hazards: [
      'Sharp 12–15 m meteoric-to-marine halocline producing severe Schlieren refractive distortion when disturbed by lead-diver fin wash',
      'Braided anastomosing phreatic conduits with complex T-intersections, jumps, and dark mangrove-tannin ceiling lenses',
      'Fine authigenic calcite and montmorillonite clay floor sediments that remain suspended for hours after a single downward flutter kick',
    ],
    guidelineProtocol:
      'continuous-guideline-frog-kick-above-halocline with primary reel tie-off in the cavern zone, double directional arrows at every jump, and strict modified frog-kick trim 1.5 m above the density interface.',
    description:
      'One of Earth’s longest underwater anchialine cave labyrinths (> 435 km surveyed), where fresh Yucatan meteoric groundwater glides atop intruding Caribbean seawater across a razor-sharp halocline.',
  },
  {
    id: 'angelita-h2s-cloud-tulum-mexico',
    name: 'Cenote Angelita Meromictic Hydrogen-Sulfide Cloud Shaft',
    aquiferSystem: 'Tulum Karst Basin',
    country: 'Mexico',
    region: 'Quintana Roo',
    latitude: 20.116,
    longitude: -87.578,
    elevationMeters: 8,
    morphology: 'meromictic-h2s-cloud-bell-sinkhole',
    haloclineDepthMeters: 28.0,
    salinityGradientPpt: 33,
    tannicAttenuationPct: 68,
    difficulty: 'extreme',
    bestSeason: 'December – May (Minimal Surface Tannic Washout)',
    hazards: [
      'Dense 3 m thick meromictic hydrogen-sulfide (H2S) sulfate-reducing bacterial cloud at 28–31 m depth that extinguishes canister lights into pitch darkness',
      'Percutaneous H2S absorption and micro-bubble off-gassing inside neoprene wetsuits causing nausea, vertigo, and O2 sensor drift',
      'Sudden +2.8 kg buoyancy spike upon hitting the dense anoxic saline brine layer beneath the chemocline',
    ],
    guidelineProtocol:
      'abort-toxic-h2s-siltout-entrapment-hazard inside dense anoxic H2S pockets; descend along a vertical reference line with trilaminate drysuit isolation and ascend immediately above the chemocline upon olfactory or visual cloud contact.',
    description:
      'Deep cylindrical collapse cenote famous for its surreal 28-meter meromictic chemocline where decomposing organic detritus generates a ghostly, toxic hydrogen-sulfide cloud separating fresh water from dark anoxic brine.',
  },
  {
    id: 'sac-actun-pet-cembalo-mexico',
    name: 'Sistema Sac Actun & Dos Ojos Decorated Phreatic Conduit',
    aquiferSystem: 'Riviera Maya Karst Aquifer',
    country: 'Mexico',
    region: 'Riviera Maya, Quintana Roo',
    latitude: 20.325,
    longitude: -87.356,
    elevationMeters: 10,
    morphology: 'decorated-speleothem-phreatic-maze',
    haloclineDepthMeters: 16.0,
    salinityGradientPpt: 14,
    tannicAttenuationPct: 18,
    difficulty: 'moderate',
    bestSeason: 'Year-Round (Optimal Clarity January – May)',
    hazards: [
      'Fragile submerged Pleistocene stalactites, stalagmites, and soda-straw speleothem forests easily shattered by poor buoyancy control or exhaust bubbles',
      'Low-profile bedding-plane restrictions requiring sidemount or backmount horizontal trim within 40 cm of percolating clay floors',
      'False daylight portals and secondary sinkhole reflections that can lure divers off the continuous gold cavern/cave guideline',
    ],
    guidelineProtocol:
      'visual-daylight-cavern-zone-line for shallow decorated caverns or continuous-guideline-frog-kick-above-halocline with personal REM cookies and zero-touch anti-silt propulsion through speleothem galleries.',
    description:
      'Vast interconnected phreatic cave system adorned with submerged Ice Age speleothems, shallow crystal-clear meteoric conduits, and gentle inland halocline wedges.',
  },
  {
    id: 'dan-s-cave-abaco-anchialine-bahamas',
    name: "Dan's Cave & Sawmill Sink Anchialine Blue Hole Conduit",
    aquiferSystem: 'Great Abaco Karst Platform',
    country: 'Bahamas',
    region: 'Abaco Islands',
    latitude: 26.228,
    longitude: -77.198,
    elevationMeters: 4,
    morphology: 'coastal-tidal-siphon-blue-hole',
    haloclineDepthMeters: 17.5,
    salinityGradientPpt: 26,
    tannicAttenuationPct: 54,
    difficulty: 'challenging',
    bestSeason: 'February – June (Dry Pine-Barren Window & Slack Tidal Phase)',
    hazards: [
      'Tea-colored pine-forest tannic dissolved organic carbon (DOC) upper lens that absorbs 50–70% of surface daylight above 15 m',
      'Multi-layered haloclines and orange-tinted bacterial mats suspended at density interfaces that peel off when struck by exhaust gas',
      'Semi-diurnal coastal tidal siphon currents reversing flow velocity across narrow phreatic bedding planes',
    ],
    guidelineProtocol:
      'blind-tactile-line-cookies-zero-vis-drill across tannic-attenuated halocline transitions, locking personal line arrows toward the nearest exit and adjusting Rule-of-Thirds turn pressure for tidal outflow.',
    description:
      'Spectacular Bahamian carbonate blue-hole cave system featuring deep pine-tannin surface lenses, multi-step anchialine haloclines, and pristine aragonite-decorated deep phreatic passages.',
  },
];

export const CENOTE_GEAR_CHECKLIST: CenoteGearItem[] = [
  {
    id: 'primary-cave-reel-directional-arrows-cookies',
    name: 'Primary 120 m Braided Nylon Cave Reel, Directional Line Arrows & REM Cookies',
    category: 'guideline-markers',
    essential: true,
    rationale:
      'Maintains a continuous physical guideline to open surface water and marks T-intersections, jumps, and team presence during zero-visibility Schlieren or siltout conditions.',
  },
  {
    id: 'canister-primary-light-dual-backups',
    name: '2,500-Lumen Tight-Beam 6° Canister Primary Light & Dual Backup Torches',
    category: 'lighting-optics',
    essential: true,
    rationale:
      'Penetrates dark dissolved-organic-carbon (DOC) tannic water lenses and allows tight-beam signaling through refractive halocline blur.',
  },
  {
    id: 'dual-independent-sidemount-or-manifold-cylinders',
    name: 'Dual Independent Sidemount or Isolatable Manifold Twin Cylinders (Rule of Thirds)',
    category: 'gas-redundancy',
    essential: true,
    rationale:
      'Provides full redundant breathing gas reserves to exit long phreatic penetrations against halocline drag or zero-visibility tactile line follows.',
  },
  {
    id: 'low-volume-wing-trim-weights-drysuit',
    name: 'Streamlined Cave Wing BCD, Distributed Trim Weights & Chemocline Barrier Suit',
    category: 'buoyancy-trim',
    essential: true,
    rationale:
      'Holds a 15° head-up / feet-elevated horizontal profile to keep fin wash above clay floors and compensates for 1–3 kg buoyancy shifts across the halocline.',
  },
  {
    id: 'dual-safety-spool-lost-line-gap-reel',
    name: 'Dual 45 m Safety Gap Spools & Stainless Bolt-Snap Cutters (Ceramic Line Knife + Shears)',
    category: 'guideline-markers',
    essential: true,
    rationale:
      'Enables lost-line search drills, lost-diver tie-offs, and immediate entanglement clearing without severing the tensioned gold main line.',
  },
  {
    id: 'wetnotes-slate-depth-bottom-timer-compass',
    name: 'Submersible Wetnotes Slate, Wrist Compass & Redundant OLED Bottom Timer',
    category: 'lighting-optics',
    essential: false,
    rationale:
      'Logs turn pressures, penetration distance, and compass bearings across complex anastomosing phreatic loops.',
  },
];

export function filterCenoteSites(
  sites: CenoteHaloclineSite[] = CENOTE_HALOCLINE_SITES,
  filters: {
    country?: string;
    morphology?: string;
    difficulty?: string;
    search?: string;
  } = {}
): CenoteHaloclineSite[] {
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
        site.aquiferSystem,
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

export function calculateCenoteHalocline(
  input: CenoteHaloclineInput
): CenoteHaloclineAnalysis {
  const {
    salinityDeltaPpt,
    tannicDocMgL,
    siltClayFractionPct,
    penetrationDistanceM,
    h2sConcentrationPpm,
  } = input;

  if (
    !Number.isFinite(salinityDeltaPpt) ||
    salinityDeltaPpt < 2 ||
    salinityDeltaPpt > 36
  ) {
    throw new Error(
      'Invalid salinityDeltaPpt: must be a finite number between 2 and 36 ppt.'
    );
  }

  if (
    !Number.isFinite(tannicDocMgL) ||
    tannicDocMgL < 0 ||
    tannicDocMgL > 60
  ) {
    throw new Error(
      'Invalid tannicDocMgL: must be a finite number between 0 and 60 mg/L.'
    );
  }

  if (
    !Number.isFinite(siltClayFractionPct) ||
    siltClayFractionPct < 0 ||
    siltClayFractionPct > 100
  ) {
    throw new Error(
      'Invalid siltClayFractionPct: must be a finite number between 0 and 100 %.'
    );
  }

  if (
    !Number.isFinite(penetrationDistanceM) ||
    penetrationDistanceM < 10 ||
    penetrationDistanceM > 1200
  ) {
    throw new Error(
      'Invalid penetrationDistanceM: must be a finite number between 10 and 1200 m.'
    );
  }

  if (
    !Number.isFinite(h2sConcentrationPpm) ||
    h2sConcentrationPpm < 0 ||
    h2sConcentrationPpm > 80
  ) {
    throw new Error(
      'Invalid h2sConcentrationPpm: must be a finite number between 0 and 80 ppm.'
    );
  }

  const salinityNorm = (salinityDeltaPpt - 2) / 34;
  const tannicNorm = tannicDocMgL / 60;
  const siltNorm = siltClayFractionPct / 100;
  const distNorm = (penetrationDistanceM - 10) / 1190;

  // 1. schlierenOpticalBlurIndex (1.0 to 10.0)
  const rawBlur = 1.0 + salinityNorm * 6.8 + siltNorm * 2.2;
  const schlierenOpticalBlurIndex = roundTo(clamp(rawBlur, 1.0, 10.0), 2);

  // 2. postMixVisibilityMeters (0.2 to 45.0 m)
  const attenuationFactor = clamp(
    tannicNorm * 0.42 + siltNorm * 0.43 + salinityNorm * 0.15,
    0,
    0.995
  );
  const rawVis = 45.0 * Math.pow(1 - attenuationFactor, 2.2);
  const postMixVisibilityMeters = roundTo(clamp(rawVis, 0.2, 45.0), 1);

  // 3. buoyancyTrimShiftKg (0.3 to 3.2 kg)
  const rawBuoyancy = 0.3 + salinityNorm * 2.9;
  const buoyancyTrimShiftKg = roundTo(clamp(rawBuoyancy, 0.3, 3.2), 2);

  // 4. ruleOfThirdsReserveBar (70 to 160 bar)
  const rawReserve =
    70 +
    distNorm * 55 +
    ((schlierenOpticalBlurIndex - 1.0) / 9.0) * 20 +
    siltNorm * 15;
  const ruleOfThirdsReserveBar = Math.round(clamp(rawReserve, 70, 160));

  // 5. riskLevel
  let riskLevel: CenoteHaloclineAnalysis['riskLevel'];
  if (
    h2sConcentrationPpm >= 25 ||
    postMixVisibilityMeters <= 1.2 ||
    penetrationDistanceM >= 750 ||
    schlierenOpticalBlurIndex >= 8.5
  ) {
    riskLevel = 'critical';
  } else if (
    h2sConcentrationPpm >= 10 ||
    postMixVisibilityMeters <= 3.5 ||
    penetrationDistanceM >= 450 ||
    schlierenOpticalBlurIndex >= 6.5
  ) {
    riskLevel = 'high';
  } else if (
    h2sConcentrationPpm >= 3 ||
    postMixVisibilityMeters <= 9.0 ||
    penetrationDistanceM >= 200 ||
    schlierenOpticalBlurIndex >= 4.0
  ) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 6. navigationProtocol
  const protocolMap: Record<
    CenoteHaloclineAnalysis['riskLevel'],
    CenoteHaloclineAnalysis['navigationProtocol']
  > = {
    critical: 'abort-toxic-h2s-siltout-entrapment-hazard',
    high: 'blind-tactile-line-cookies-zero-vis-drill',
    moderate: 'continuous-guideline-frog-kick-above-halocline',
    low: 'visual-daylight-cavern-zone-line',
  };

  const navigationProtocol = protocolMap[riskLevel];

  const warnings: string[] = [];
  if (
    h2sConcentrationPpm >= 25 ||
    postMixVisibilityMeters <= 1.2 ||
    schlierenOpticalBlurIndex >= 8.5
  ) {
    warnings.push(
      `CRITICAL MEROMICTIC H2S & ZERO-VISIBILITY SILTOUT HAZARD (H2S = ${h2sConcentrationPpm} ppm, post-mix visibility = ${postMixVisibilityMeters} m, Schlieren blur = ${schlierenOpticalBlurIndex}/10): Toxic hydrogen-sulfide chemocline and colloidal clay/halocline mixing create immediate disorientation and percutaneous toxicity risk.`
    );
  } else if (
    h2sConcentrationPpm >= 10 ||
    postMixVisibilityMeters <= 3.5 ||
    schlierenOpticalBlurIndex >= 6.5
  ) {
    warnings.push(
      `HIGH HALOCLINE SCHLIEREN BLUR & CLAY RESUSPENSION HAZARD (Schlieren blur = ${schlierenOpticalBlurIndex}/10, visibility = ${postMixVisibilityMeters} m, H2S = ${h2sConcentrationPpm} ppm): Turbulent mixing across the ${salinityDeltaPpt} ppt interface degrades depth-gauge readability and guideline sightlines.`
    );
  } else if (
    h2sConcentrationPpm >= 3 ||
    postMixVisibilityMeters <= 9.0 ||
    schlierenOpticalBlurIndex >= 4.0 ||
    penetrationDistanceM >= 200
  ) {
    warnings.push(
      `Moderate halocline refraction and overhead penetration load (Schlieren = ${schlierenOpticalBlurIndex}/10, visibility = ${postMixVisibilityMeters} m, penetration = ${penetrationDistanceM} m): Maintain elevated frog-kick trim to avoid disturbing the ${salinityDeltaPpt} ppt density interface.`
    );
  }

  if (buoyancyTrimShiftKg >= 2.0 || penetrationDistanceM >= 450) {
    warnings.push(
      `SIGNIFICANT PYCNOCLINE BUOYANCY SHIFT & DEEP PENETRATION RESERVE (+${buoyancyTrimShiftKg} kg buoyancy shift, ${penetrationDistanceM} m penetration, ${ruleOfThirdsReserveBar} bar turn floor): Crossing from marine brine into meteoric freshwater causes rapid negative-buoyancy drop toward silt floors.`
    );
  }

  const recommendations: string[] = [
    `Execute ${navigationProtocol} protocol immediately (Schlieren blur: ${schlierenOpticalBlurIndex}/10, post-mix visibility: ${postMixVisibilityMeters} m, turn reserve: ${ruleOfThirdsReserveBar} bar).`,
    salinityDeltaPpt >= 15 || siltClayFractionPct >= 25
      ? `Hold horizontal trim 1.5 m above the ${salinityDeltaPpt} ppt halocline using a modified frog-kick or anti-silt pull-and-glide to prevent ${siltClayFractionPct}% clay resuspension and +${buoyancyTrimShiftKg} kg buoyancy oscillations.`
      : `Maintain visual reference along the continuous cavern/cave guideline with ${postMixVisibilityMeters} m forward visibility and anticipate a +${buoyancyTrimShiftKg} kg buoyancy shift at the halocline.`,
    h2sConcentrationPpm >= 10 || penetrationDistanceM >= 300
      ? `Enforce a strict ${ruleOfThirdsReserveBar} bar minimum turn pressure for the ${penetrationDistanceM} m penetration and stay above the ${h2sConcentrationPpm} ppm H2S chemocline layer.`
      : `Verify directional line arrows and personal REM cookies at every jump and turn the dive at or above ${ruleOfThirdsReserveBar} bar.`,
  ];

  return {
    schlierenOpticalBlurIndex,
    postMixVisibilityMeters,
    buoyancyTrimShiftKg,
    ruleOfThirdsReserveBar,
    riskLevel,
    navigationProtocol,
    warnings,
    recommendations,
  };
}

export function getCenoteGearChecklist(): CenoteGearItem[] {
  return [...CENOTE_GEAR_CHECKLIST];
}
