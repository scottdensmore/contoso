export type ClimbingSystem = 'SRT' | 'MRT_DRT';
export type AnchorStyle = 'basal_anchor' | 'canopy_anchor';
export type CanopySafetyStatus =
  | 'approved_cambium_saver_required'
  | 'marginal_undersized_limb_hazard'
  | 'prohibited_structural_failure_risk';

export interface CanopyGrove {
  id: string;
  title: string;
  treeSpecies: string;
  location: string;
  canopyHeightM: number;
  climbingSystem: ClimbingSystem;
  limbDiameterMinCm: number;
  description: string;
  highlights: string[];
}

export interface TreeClimbingQuery {
  groveId: string;
  climbingSystem: ClimbingSystem; // default 'SRT'
  anchorStyle: AnchorStyle; // default 'basal_anchor'
  climberWeightLbs: number; // 120 to 300 lbs, default 190
  branchDiameterCm: number; // 10 to 45 cm, default 22
}

export interface TreeClimbingResult {
  groveTitle: string;
  peakForkLoadLbs: number;
  peakForkLoadKn: number;
  limbSafetyRatio: number;
  frictionHitchRecommendation: string;
  safetyStatus: CanopySafetyStatus;
  advisory: string;
}

export interface TreeGearItem {
  id: string;
  name: string;
  category: 'tree_protection' | 'rigging' | 'rope' | 'harness' | 'ascender' | 'ppe';
  mandatory: boolean;
  description: string;
}

export const CANOPY_GROVES: CanopyGrove[] = [
  {
    id: 'redwood-canopy-prairie-creek',
    title: 'Prairie Creek Redwoods Canopy Expedition',
    treeSpecies: 'Coast Redwood (Sequoia sempervirens)',
    location: 'Prairie Creek Redwoods State Park, CA, USA',
    canopyHeightM: 92,
    climbingSystem: 'SRT',
    limbDiameterMinCm: 25,
    description:
      'Ancient temperate rainforest grove featuring towering coast redwoods with massive reiterated trunk architectures and perched canopy soils.',
    highlights: [
      '90m+ vertical ascent corridors',
      'Suspended canopy research portaledge',
      'Fern mat arboreal micro-ecosystem',
    ],
  },
  {
    id: 'olympic-rainforest-sitka',
    title: 'Hoh River Valley Giant Sitka Spruce',
    treeSpecies: 'Sitka Spruce (Picea sitchensis)',
    location: 'Olympic National Park, WA, USA',
    canopyHeightM: 75,
    climbingSystem: 'SRT',
    limbDiameterMinCm: 22,
    description:
      'Perennially damp maritime rainforest giant laden with thick hanging epiphytic moss mats requiring specialized friction cord selection.',
    highlights: [
      'Massive hanging epiphyte moss drapery',
      'Wet-weather friction hitch calibration',
      'High-tensile throwline crotch isolation',
    ],
  },
  {
    id: 'sequoia-giant-forest',
    title: 'Giant Forest Sierra Redwood Ascent',
    treeSpecies: 'Giant Sequoia (Sequoiadendron giganteum)',
    location: 'Sequoia National Park, CA, USA',
    canopyHeightM: 80,
    climbingSystem: 'SRT',
    limbDiameterMinCm: 30,
    description:
      'Colossal Sierra montane canopy with thick fibrous bark layers and colossal lateral limbs requiring specialized cambium protectors and dual basal anchors.',
    highlights: [
      'Massive trunk circumference traverse',
      'Sub-alpine fire-scarred bark protection',
      'Double-basal trunk anchor rigging',
    ],
  },
  {
    id: 'appalachian-white-oak',
    title: 'Smoky Mountains Grand White Oak Canopy',
    treeSpecies: 'Eastern White Oak (Quercus alba)',
    location: 'Great Smoky Mountains, NC/TN, USA',
    canopyHeightM: 38,
    climbingSystem: 'MRT_DRT',
    limbDiameterMinCm: 18,
    description:
      'Sprawling hardwood crown architecture ideal for moving rope technique, limb walking, and lateral canopy traversal across ancient decurrent branches.',
    highlights: [
      'Broad hardwood lateral branch walking',
      'Moving rope technique crown exploration',
      'Friction hitch limb transfer maneuvers',
    ],
  },
  {
    id: 'tasmanian-tarkine-eucalyptus',
    title: 'Tarkine Forest Swamp Gum Canopy',
    treeSpecies: 'Mountain Ash (Eucalyptus regnans)',
    location: 'Tarkine Rainforest, Tasmania, Australia',
    canopyHeightM: 85,
    climbingSystem: 'SRT',
    limbDiameterMinCm: 20,
    description:
      'Southern hemisphere temperate rainforest titan representing the world’s tallest flowering trees with smooth peeling bark requiring friction management.',
    highlights: [
      'Tallest flowering hardwood trees on Earth',
      'Wind-swayed high canopy rigging',
      'Cambium conduit isolation over wet bark',
    ],
  },
];

export const TREE_GEAR_CHECKLIST: TreeGearItem[] = [
  {
    id: 'cambium-saver-conduit',
    name: 'Leather Cambium Friction Saver & Ring-and-Ring Tree Protection Strap',
    category: 'tree_protection',
    mandatory: true,
    description:
      'Heavy-duty conduit strap with unequal aluminum friction rings to eliminate cambium bark grooving during rope cycling.',
  },
  {
    id: 'arborist-throwline-kit',
    name: '55m Dyneema Throwline & 12oz Cordura Throw Weight with Storage Cube',
    category: 'rigging',
    mandatory: true,
    description:
      'Slick 1.8mm high-modulus polyethylene line for launching pilot lines over high canopy crotches up to 35 meters.',
  },
  {
    id: 'high-tensile-static-rope',
    name: '60m 11.5mm Semi-Static 24-Strand Low-Stretch Arborist Climbing Rope',
    category: 'rope',
    mandatory: true,
    description:
      'Abrasion-resistant kernmantle rope with low elongation under load for efficient vertical ascender stroke progression.',
  },
  {
    id: 'tree-climbing-saddle',
    name: 'Wide Ergonomic Padded Arborist Harness with Multi-Bridge Attachment',
    category: 'harness',
    mandatory: true,
    description:
      'Suspension harness with rigid leg pads, dual sliding rope bridge attachments, and rated side positioning D-rings.',
  },
  {
    id: 'mechanical-friction-ascender',
    name: 'Mechanical Rope Grab Ascender & Dual-Action Prusik Friction Hitch Cord',
    category: 'ascender',
    mandatory: true,
    description:
      'Dual-cam knee/chest ascenders paired with heat-dissipating 8mm aramid hitch cords for smooth ascent and controlled friction descent.',
  },
  {
    id: 'canopy-suspension-helmet',
    name: 'Ventilated Arborist Climbing Helmet with Integrated Eye Shield',
    category: 'ppe',
    mandatory: true,
    description:
      'EN 12492 certified canopy helmet with chin strap retention, headlamp clips, and flip-down polycarbonate eye protection against deadwood.',
  },
];

export function getCanopyGroves(system?: ClimbingSystem): CanopyGrove[] {
  if (!system) return CANOPY_GROVES;
  return CANOPY_GROVES.filter((grove) => grove.climbingSystem === system);
}

export function getCanopyGroveById(id: string): CanopyGrove | undefined {
  return CANOPY_GROVES.find((grove) => grove.id === id);
}

export function getTreeGear(): TreeGearItem[] {
  return TREE_GEAR_CHECKLIST;
}

export function calculateTreeClimbing(query: TreeClimbingQuery): TreeClimbingResult {
  const grove = getCanopyGroveById(query.groveId);
  const groveTitle = grove ? grove.title : 'Canopy Expedition Anchor';

  const anchorMultiplier = query.anchorStyle === 'basal_anchor' ? 2.0 : 1.0;
  const peakForkLoadLbs = Math.round(query.climberWeightLbs * anchorMultiplier * 1.2);
  const peakForkLoadKn = Number((peakForkLoadLbs * 0.00444822).toFixed(2));

  const limbSafetyRatio = Number((Math.pow(query.branchDiameterCm / 15.0, 2)).toFixed(2));

  let safetyStatus: CanopySafetyStatus;
  let advisory: string;

  if (query.branchDiameterCm < 12.0) {
    safetyStatus = 'prohibited_structural_failure_risk';
    advisory = `CRITICAL SAFETY WARNING: Branch diameter of ${query.branchDiameterCm} cm is below the absolute 12.0 cm failure threshold. Severe risk of catastrophic branch shearing under dynamic load. Do not ascend or weight this anchor.`;
  } else if (query.branchDiameterCm < 15.0) {
    safetyStatus = 'marginal_undersized_limb_hazard';
    advisory = `CAUTION - MARGINAL LIMB: Branch diameter of ${query.branchDiameterCm} cm provides limited structural safety factor. Secondary crotch tie-in or load-sharing backup required before ascending.`;
  } else {
    safetyStatus = 'approved_cambium_saver_required';
    advisory = `APPROVED FOR CANOPY ASCENT: Branch diameter of ${query.branchDiameterCm} cm exceeds safety threshold. Rig using an approved cambium friction saver to safeguard tree vascular cambium.`;
  }

  const frictionHitchRecommendation =
    query.climbingSystem === 'SRT'
      ? 'Valdôtain Tresse (VT) or Rope Wrench with 8mm Heat-Resistant Cord'
      : 'Distel or Michoacan friction hitch on dynamic split-tail';

  return {
    groveTitle,
    peakForkLoadLbs,
    peakForkLoadKn,
    limbSafetyRatio,
    frictionHitchRecommendation,
    safetyStatus,
    advisory,
  };
}
