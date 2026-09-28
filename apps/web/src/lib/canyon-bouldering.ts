export type BoulderingStyle =
  | 'highball_sandstone_pinnacle'
  | 'overhung_canyon_roof'
  | 'technical_arete_slab'
  | 'crimpy_canyon_face';

export type LandingHazard =
  | 'flat_sandy_wash'
  | 'uneven_talus_field'
  | 'sloping_rock_shelf'
  | 'boulder_choke_gap';

export type FallHazardRating =
  | 'safe_cushioned_drop'
  | 'caution_multiple_pads_spotter_required'
  | 'hazardous_highball_groundfall_risk';

export interface CanyonBoulderingSector {
  id: string;
  title: string;
  canyonLocation: string;
  region: string;
  maxBoulderHeightM: number;
  vGradeRange: string;
  boulderingStyle: BoulderingStyle;
  landingHazard: LandingHazard;
  description: string;
  highlights: string[];
}

export interface BoulderingQuery {
  sectorId: string;
  fallHeightM: number; // 2 to 15 m, default 6.5
  climberWeightKg: number; // 45 to 110 kg, default 72
  crashPadsCount: number; // 1 to 8 pads, default 3
  spottersCount: number; // 0 to 5, default 2
}

export interface BoulderingResult {
  sectorTitle: string;
  boulderingStyle: BoulderingStyle;
  landingHazard: LandingHazard;
  impactEnergyJoules: number;
  padCoverageAdequacyPercent: number;
  fallHazardRating: FallHazardRating;
  spottingRecommendation: string;
  padLayoutAdvisory: string;
}

export interface CanyonBoulderingGearItem {
  id: string;
  name: string;
  category: 'crash_pad' | 'blubber_pad' | 'cleaning' | 'protection' | 'tarp' | 'skin_care';
  mandatory: boolean;
  description: string;
}

export const CANYON_BOULDERING_SECTORS: CanyonBoulderingSector[] = [
  {
    id: 'buttermilks-peabody-highballs',
    title: 'Buttermilks Peabody Highball Boulders',
    canyonLocation: 'Buttermilk Country',
    region: 'Bishop, CA',
    maxBoulderHeightM: 14.0,
    vGradeRange: 'V4 - V11',
    boulderingStyle: 'highball_sandstone_pinnacle',
    landingHazard: 'sloping_rock_shelf',
    description:
      'World-renowned colossal monzonite and sandstone highball boulders perched on a high-desert hillside beneath the Sierra crest. Steep committing topouts over sloping granite and sandstone bedrock.',
    highlights: [
      'Grandpa Peabody massive 45-foot face',
      'Ambrosia iconic highball line',
      'Stacker crash pad landing zone setup',
    ],
  },
  {
    id: 'joes-valley-straight-canyon',
    title: "Joe's Valley Straight Canyon Sandstone",
    canyonLocation: 'Straight Canyon',
    region: 'Orangeville, UT',
    maxBoulderHeightM: 8.5,
    vGradeRange: 'V3 - V12',
    boulderingStyle: 'overhung_canyon_roof',
    landingHazard: 'flat_sandy_wash',
    description:
      'Steep sandstone canyon roofs featuring ergonomic incut huecos, crimps, and compressions along sandy canyon creek bottoms with straightforward pad arrangements.',
    highlights: [
      'Right Fork sandstone roof crimping',
      'Classic Hueco-scale pocket pulling',
      'Sandy runoff bed flat landings',
    ],
  },
  {
    id: 'red-rock-kraft-boulders',
    title: 'Red Rock Kraft Canyon Sandstone',
    canyonLocation: 'Kraft Mountain Canyon',
    region: 'Calico Basin, NV',
    maxBoulderHeightM: 7.0,
    vGradeRange: 'V1 - V9',
    boulderingStyle: 'technical_arete_slab',
    landingHazard: 'flat_sandy_wash',
    description:
      'Vibrant Aztec sandstone towers and technical canyon blocks showcasing bullet varnish crimps, aesthetic aretes, and delicate balance slabs with clean wash runouts.',
    highlights: [
      "Plumber's Crack highball chimney",
      'Calico Aztec sandstone patina crimps',
      'Easy canyon wash accessibility',
    ],
  },
  {
    id: 'rocktown-pigeon-mountain',
    title: 'Rocktown Pigeon Mountain Sandstone',
    canyonLocation: 'Crockford Pigeon Mountain',
    region: 'LaFayette, GA',
    maxBoulderHeightM: 9.0,
    vGradeRange: 'V2 - V10',
    boulderingStyle: 'overhung_canyon_roof',
    landingHazard: 'uneven_talus_field',
    description:
      'Dense wilderness sandstone labyrinth of capstone roofs, scoops, and iron-banded slopers situated over a maze of uneven talus and tiered boulders requiring extensive pad terracing.',
    highlights: [
      'Orb roof horizontal dynos',
      'Ancient sandstone mushroom caps',
      'Tiered talus boulder field spotting',
    ],
  },
  {
    id: 'hueco-tanks-north-mountain',
    title: 'Hueco Tanks North Mountain Canyon',
    canyonLocation: 'North Mountain Canyon',
    region: 'El Paso, TX',
    maxBoulderHeightM: 11.0,
    vGradeRange: 'V5 - V13',
    boulderingStyle: 'crimpy_canyon_face',
    landingHazard: 'boulder_choke_gap',
    description:
      'Sacred desert canyon cradles with bullet syenite porphyry and canyon face crimping, characterized by deep drop-off chasm gaps and boulder chokes between landing slabs.',
    highlights: [
      'Historic iron-patina hueco pockets',
      'Deep chasm pit gap spanning',
      'Strict reservation wilderness ethics',
    ],
  },
];

export const CANYON_BOULDERING_GEAR: CanyonBoulderingGearItem[] = [
  {
    id: 'triple-density-highball-crash-pad',
    name: 'High-Impact Triple-Density Foam Highball Crash Pad (5-inch core)',
    category: 'crash_pad',
    mandatory: true,
    description:
      '5-inch multi-layer open and closed-cell foam crash pad engineered to absorb terminal ground impacts on highball falls exceeding 6 meters.',
  },
  {
    id: 'modular-hinge-blubber-pad',
    name: 'Modular Full-Coverage Foam Blubber Pad (Gap Cover)',
    category: 'blubber_pad',
    mandatory: true,
    description:
      'Ultra-thin 1-inch high-density foam cover sheet designed to seal seams between landing pads and prevent ankle entrapment in boulder cracks.',
  },
  {
    id: 'boars-hair-telescoping-brush',
    name: "12-Foot Telescoping Carbon Boar's Hair Boulder Brush",
    category: 'cleaning',
    mandatory: true,
    description:
      "Rigid carbon fiber telescoping pole with dense natural boar bristles to scrub chalk build-up and delicate sandstone friction grain without polishing rock.",
  },
  {
    id: 'ergonomic-spotting-boulder-gloves',
    name: 'High-Traction Ergonomic Spotter Impact Gloves',
    category: 'protection',
    mandatory: true,
    description:
      'Reinforced wrist and palm padding designed to prevent wrist hyperextension when redirecting high-velocity falling climbers away from hazards.',
  },
  {
    id: 'heavy-duty-drag-tarp',
    name: 'Weatherproof 8x8 Heavy-Duty Vinyl Crash Pad Ground Tarp',
    category: 'tarp',
    mandatory: true,
    description:
      'Water-resistant drag tarp to protect crash pad fabrics from sharp canyon talus, mud, and abrasive desert sand during sector transitions.',
  },
  {
    id: 'skin-repair-finger-tape-balm',
    name: 'Climbing Finger Tape, Sanding Block & High-Altitude Skin Balm Kit',
    category: 'skin_care',
    mandatory: true,
    description:
      'Medical-grade non-stretch zinc oxide climbing tape, skin callus rasp, and herbal beeswax balm for rapid repair of sandstone split fingertips.',
  },
];

export function getCanyonBoulderingSectors(style?: BoulderingStyle): CanyonBoulderingSector[] {
  if (!style) {
    return CANYON_BOULDERING_SECTORS;
  }
  return CANYON_BOULDERING_SECTORS.filter((sector) => sector.boulderingStyle === style);
}

export function getCanyonBoulderingSectorById(id: string): CanyonBoulderingSector | undefined {
  return CANYON_BOULDERING_SECTORS.find((sector) => sector.id === id);
}

export function getCanyonBoulderingGear(): CanyonBoulderingGearItem[] {
  return CANYON_BOULDERING_GEAR;
}

export function calculateBoulderingDynamics(query: BoulderingQuery): BoulderingResult {
  const sector =
    getCanyonBoulderingSectorById(query.sectorId) ?? CANYON_BOULDERING_SECTORS[0];

  const fallHeightM = Math.max(2, Math.min(15, query.fallHeightM));
  const climberWeightKg = Math.max(45, Math.min(110, query.climberWeightKg));
  const crashPadsCount = Math.max(1, Math.min(8, query.crashPadsCount));
  const spottersCount = Math.max(0, Math.min(5, query.spottersCount));

  // Impact energy Joules: Math.round(climberWeightKg * 9.81 * fallHeightM)
  const impactEnergyJoules = Math.round(climberWeightKg * 9.81 * fallHeightM);

  // Pad coverage adequacy: Math.min(100, Math.round((crashPadsCount / (fallHeightM > 8 ? 5 : 3)) * 100))
  const requiredPads = fallHeightM > 8 ? 5 : 3;
  const padCoverageAdequacyPercent = Math.min(
    100,
    Math.round((crashPadsCount / requiredPads) * 100)
  );

  // Fall hazard rating
  let fallHazardRating: FallHazardRating;
  if (fallHeightM > 9 && crashPadsCount < 4) {
    fallHazardRating = 'hazardous_highball_groundfall_risk';
  } else if (fallHeightM > 5 && (crashPadsCount < 2 || spottersCount < 1)) {
    fallHazardRating = 'caution_multiple_pads_spotter_required';
  } else {
    fallHazardRating = 'safe_cushioned_drop';
  }

  // Spotting recommendation
  let spottingRecommendation: string;
  if (fallHazardRating === 'hazardous_highball_groundfall_risk') {
    spottingRecommendation =
      'Highball groundfall hazard! Extreme impact risk above 9m. Minimum 4 to 6 attentive spotters required with focused hip-guiding technique and secondary spotters deflecting away from boulders.';
  } else if (fallHazardRating === 'caution_multiple_pads_spotter_required') {
    spottingRecommendation =
      'Spotter required! Fall heights exceed 5m with marginal pad coverage. Position at least 2 spotters to guide torso trajectory and protect head and neck from uneven terrain.';
  } else {
    spottingRecommendation =
      'Standard spotting protocol. 1 to 2 attentive ground spotters positioned to redirect falls onto center pad sweet spots.';
  }

  // Pad layout advisory
  let padLayoutAdvisory: string;
  if (sector.landingHazard === 'boulder_choke_gap') {
    padLayoutAdvisory =
      'Chasm gap hazard: Bridge gaps with thick primary highball pads topped by continuous blubber pads to prevent foot-trapping between boulders.';
  } else if (sector.landingHazard === 'uneven_talus_field') {
    padLayoutAdvisory =
      'Talus terrain: Level uneven boulders with taco-style starter pads, then layer large highball pads horizontally to build an even landing terrace.';
  } else if (sector.landingHazard === 'sloping_rock_shelf') {
    padLayoutAdvisory =
      'Sloping bedrock: Anchor uphill edges and stack secondary pads on downhill runoffs to counter slide momentum upon landing.';
  } else {
    padLayoutAdvisory =
      'Flat wash terrain: Lay ground tarp beneath pads to seal out abrasive sand, arrange pads edge-to-edge, and cover seams with blubber mat.';
  }

  return {
    sectorTitle: sector.title,
    boulderingStyle: sector.boulderingStyle,
    landingHazard: sector.landingHazard,
    impactEnergyJoules,
    padCoverageAdequacyPercent,
    fallHazardRating,
    spottingRecommendation,
    padLayoutAdvisory,
  };
}
