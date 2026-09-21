export type FerrataGrade =
  | 'grade_a_easy'
  | 'grade_b_moderately_difficult'
  | 'grade_c_difficult'
  | 'grade_d_very_difficult'
  | 'grade_e_extremely_difficult';

export type ExposureLevel = 'low' | 'moderate' | 'high' | 'extreme';
export type EnergyAbsorberType = 'tearing_webbing_en958' | 'friction_brake_legacy';
export type WeightComplianceStatus = 'underweight_risk' | 'certified_compliant' | 'overweight_risk';
export type LanyardSafetyStatus = 'approved' | 'warning_backup_required' | 'outdated_unsafe';

export interface ViaFerrataRoute {
  id: string;
  title: string;
  region: string;
  distanceKm: number;
  verticalGainM: number;
  grade: FerrataGrade;
  cableLengthM: number;
  exposureLevel: ExposureLevel;
  typicalDurationHours: number;
  suspensionBridgeSpanM: number;
  restLanyardRecommended: boolean;
  description: string;
  highlights: string[];
}

export interface RiggingAdvisorQuery {
  routeId: string;
  climberWeightKg: number;
  hasHeavyBackpack: boolean;
  energyAbsorberType: EnergyAbsorberType;
  restLanyardAttached: boolean;
}

export interface RiggingAdvisorResult {
  routeTitle: string;
  routeGrade: FerrataGrade;
  effectiveWeightKg: number;
  weightStatus: WeightComplianceStatus;
  lanyardSafetyStatus: LanyardSafetyStatus;
  estimatedImpactForceKn: number;
  restLanyardAdvisory: string;
  safetyNotice: string;
  en958Compliant: boolean;
}

export interface ViaFerrataGearItem {
  id: string;
  name: string;
  category: 'lanyard' | 'hardware' | 'harness' | 'helmet' | 'safety' | 'apparel';
  mandatory: boolean;
  description: string;
}

export const VIA_FERRATA_ROUTES: ViaFerrataRoute[] = [
  {
    id: 'telluride-via-ferrata',
    title: 'Telluride Via Ferrata',
    region: 'San Juan Mountains, Telluride, CO',
    distanceKm: 3.2,
    verticalGainM: 185,
    grade: 'grade_c_difficult',
    cableLengthM: 1200,
    exposureLevel: 'high',
    typicalDurationHours: 3.5,
    suspensionBridgeSpanM: 0,
    restLanyardRecommended: true,
    description:
      'Legendary alpine traverse along sheer sandstone and quartzite amphitheater cliffs high above Telluride box canyon, featuring exhilarating exposed ledge walking and dizzying views of Bridal Veil Falls.',
    highlights: [
      'The Main Event sheer ledge traverse',
      'Direct views of Bridal Veil Falls',
      'Airy canyon rim stepping irons',
    ],
  },
  {
    id: 'mount-olympus-iron-way',
    title: 'Mount Olympus Iron Way Ridge',
    region: 'Wasatch Range, Salt Lake City, UT',
    distanceKm: 4.8,
    verticalGainM: 420,
    grade: 'grade_b_moderately_difficult',
    cableLengthM: 950,
    exposureLevel: 'moderate',
    typicalDurationHours: 4.0,
    suspensionBridgeSpanM: 15,
    restLanyardRecommended: false,
    description:
      'Panoramic alpine ridge ascent across Wasatch quartzite featuring thrilling monkey bridge cable crossings, sweeping friction slab traverses, and expansive views over the Salt Lake Valley.',
    highlights: [
      '15-meter wire suspension monkey bridge',
      'Granite friction slab traverses',
      'Panoramic Salt Lake Valley vistas',
    ],
  },
  {
    id: 'ouray-via-ferrata-gold-mountain',
    title: 'Ouray Via Ferrata Gold Mountain',
    region: 'Uncompahgre Gorge, Ouray, CO',
    distanceKm: 2.1,
    verticalGainM: 260,
    grade: 'grade_d_very_difficult',
    cableLengthM: 1400,
    exposureLevel: 'extreme',
    typicalDurationHours: 3.0,
    suspensionBridgeSpanM: 35,
    restLanyardRecommended: true,
    description:
      'Severe vertical gorge scramble navigating steep canyon rock faces, spanning a 35m aerial suspension cable bridge, and confronting climbers with vertical and slightly overhanging rung pitches.',
    highlights: [
      'Sky Bridge gorge crossing',
      'Vertical iron ladder staircase',
      'Overhanging headwall cable bypass',
    ],
  },
  {
    id: 'whistler-peak-via-ferrata',
    title: 'Whistler Peak West Ridge Via Ferrata',
    region: 'Coast Mountains, Whistler, BC',
    distanceKm: 3.6,
    verticalGainM: 310,
    grade: 'grade_b_moderately_difficult',
    cableLengthM: 800,
    exposureLevel: 'moderate',
    typicalDurationHours: 3.5,
    suspensionBridgeSpanM: 0,
    restLanyardRecommended: false,
    description:
      'High-alpine Canadian Coast Range route negotiating solid granite buttresses with panoramic views of volcanic spires, hanging glaciers, and subalpine marmot meadows.',
    highlights: [
      'Glaciated summit approach',
      'Coast Mountain volcanic horn panorama',
      'Alpine marmot meadows',
    ],
  },
  {
    id: 'mammoth-mountain-iron-crest',
    title: 'Mammoth Mountain Iron Crest Wall',
    region: 'Sierra Nevada, Mammoth Lakes, CA',
    distanceKm: 1.8,
    verticalGainM: 380,
    grade: 'grade_e_extremely_difficult',
    cableLengthM: 1100,
    exposureLevel: 'extreme',
    typicalDurationHours: 4.5,
    suspensionBridgeSpanM: 25,
    restLanyardRecommended: true,
    description:
      'Extreme high-altitude Sierra wall climb tackling sustained overhanging rung sections, aerial bridge beams, and sheer vertical exposure above the volcanic caldera.',
    highlights: [
      'Sustained 40-meter overhanging ladder rung face',
      'High Sierra crest panorama',
      'Suspended 25-meter wire beam crossing',
    ],
  },
];

export const VIA_FERRATA_GEAR: ViaFerrataGearItem[] = [
  {
    id: 'en958-energy-absorber-lanyard',
    name: 'EN 958:2017 Certified Y-Lanyard with Progressive Tearing Energy Absorber',
    category: 'lanyard',
    mandatory: true,
    description:
      'Energy-absorbing lanyard compliant with modern tear-webbing standard (40–120 kg capacity) to limit peak fall impact force under 6 kN.',
  },
  {
    id: 'locking-via-ferrata-carabiners',
    name: 'Dual Ergonomic Palm-Squeeze Auto-Locking Carabiners (Type K)',
    category: 'hardware',
    mandatory: true,
    description:
      'Wide-gate opening Type K carabiners engineered for high bending resistance over steel cable and quick one-handed palm gate operation.',
  },
  {
    id: 'climbing-harness-tested',
    name: 'CE/UIAA Certified Sit Climbing Harness with Reinforced Belay Loop',
    category: 'harness',
    mandatory: true,
    description:
      'Padded ergonomic rock climbing or mountaineering harness with rated structural tie-in loop for secure lanyard girth-hitch attachment.',
  },
  {
    id: 'climbing-helmet-en12492',
    name: 'EN 12492 Certified Mountaineering & Rock Climbing Helmet (Rockfall Protection)',
    category: 'helmet',
    mandatory: true,
    description:
      'Durable climbing helmet providing top and lateral impact resistance from falling rock dislodged by climbers above or cable vibration.',
  },
  {
    id: 'rest-sling-carabiner',
    name: 'Short Dynamic Rest Sling (15-30cm) with Screwgate Carabiner (for Ledge Resting)',
    category: 'safety',
    mandatory: true,
    description:
      'Non-deploying rest lanyard connected directly to harness belay loop allowing safe arm rests on iron rungs without stressing the shock absorber.',
  },
  {
    id: 'sticky-approach-shoes-gloves',
    name: 'Sticky Rubber Approach Shoes and Reinforced Half-Finger Climbing Gloves',
    category: 'apparel',
    mandatory: true,
    description:
      'Vibram-style climbing rubber footwear for friction slabs and durable leather-reinforced gloves to protect palms against cable burrs.',
  },
];

export function getViaFerrataRoutes(grade?: FerrataGrade): ViaFerrataRoute[] {
  if (!grade) {
    return VIA_FERRATA_ROUTES;
  }
  return VIA_FERRATA_ROUTES.filter((r) => r.grade === grade);
}

export function getViaFerrataRouteById(id: string): ViaFerrataRoute | undefined {
  return VIA_FERRATA_ROUTES.find((r) => r.id === id);
}

export function getViaFerrataGear(): ViaFerrataGearItem[] {
  return VIA_FERRATA_GEAR;
}

export function calculateRiggingPlan(query: RiggingAdvisorQuery): RiggingAdvisorResult {
  const route = getViaFerrataRouteById(query.routeId) || VIA_FERRATA_ROUTES[0];
  const effectiveWeightKg = query.climberWeightKg + (query.hasHeavyBackpack ? 10 : 0);

  let weightStatus: WeightComplianceStatus = 'certified_compliant';
  if (effectiveWeightKg < 40) {
    weightStatus = 'underweight_risk';
  } else if (effectiveWeightKg > 120) {
    weightStatus = 'overweight_risk';
  }

  const isLegacy = query.energyAbsorberType === 'friction_brake_legacy';
  const en958Compliant = !isLegacy;

  let lanyardSafetyStatus: LanyardSafetyStatus = 'approved';
  if (isLegacy) {
    lanyardSafetyStatus = 'outdated_unsafe';
  } else if (weightStatus !== 'certified_compliant') {
    lanyardSafetyStatus = 'warning_backup_required';
  }

  let estimatedImpactForceKn: number;
  if (isLegacy) {
    estimatedImpactForceKn = Number((7.5 + effectiveWeightKg * 0.02).toFixed(1));
  } else {
    estimatedImpactForceKn = Number((3.0 + effectiveWeightKg * 0.016).toFixed(1));
  }

  let restLanyardAdvisory: string;
  if (route.restLanyardRecommended) {
    if (query.restLanyardAttached) {
      restLanyardAdvisory =
        'Rest lanyard attached: Ideal for hands-free resting on steep iron rungs, bridge transitions, and anchor stances without deploying or stressing the shock absorber.';
    } else {
      restLanyardAdvisory =
        'Rest lanyard strongly recommended: This route features sustained steep or overhanging iron rungs. A dedicated short dynamic rest sling and carabiner prevents forearm pump and keeps the energy absorber unweighted while pausing.';
    }
  } else {
    if (query.restLanyardAttached) {
      restLanyardAdvisory =
        'Rest lanyard attached: Provides convenient clip-in capability for scenic overlooks and resting at cable anchors.';
    } else {
      restLanyardAdvisory =
        'Standard Y-lanyard is sufficient for this route, though carrying an optional rest sling can provide extra security during prolonged photo pauses.';
    }
  }

  let safetyNotice: string;
  if (lanyardSafetyStatus === 'outdated_unsafe') {
    safetyNotice =
      'CRITICAL SAFETY HAZARD: Legacy rope-friction brake plates are non-compliant with EN 958:2017. Due to rope glazing and stiffening over time, impact forces can exceed 9 kN, leading to catastrophic lanyard or anchor failure. Retire immediately!';
  } else if (weightStatus === 'underweight_risk') {
    safetyNotice =
      'SAFETY WARNING: Effective climber weight is under 40 kg. Standard EN 958 tearing webbing may fail to deploy smoothly, transferring dangerous peak impact forces to the climber. A top-rope belay backup is required on all steep sections.';
  } else if (weightStatus === 'overweight_risk') {
    safetyNotice =
      'SAFETY WARNING: Effective climber weight exceeds 120 kg. High momentum risks bottoming out the energy absorber webbing. An independent top-rope belay backup or specialized heavy-duty commercial rigging is mandatory.';
  } else {
    safetyNotice =
      'Rigging certified compliant: Total effective weight is within certified EN 958:2017 safety parameters (40–120 kg). The progressive-tearing energy absorber will safely dissipate fall energy below the 6.0 kN biological threshold.';
  }

  return {
    routeTitle: route.title,
    routeGrade: route.grade,
    effectiveWeightKg,
    weightStatus,
    lanyardSafetyStatus,
    estimatedImpactForceKn,
    restLanyardAdvisory,
    safetyNotice,
    en958Compliant,
  };
}
