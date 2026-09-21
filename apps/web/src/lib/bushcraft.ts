export type BushcraftDiscipline =
  | 'shelter_craft'
  | 'friction_fire'
  | 'cordage_botany'
  | 'woodcraft_carving'
  | 'water_foraging_craft';

export type SkillLevel =
  | 'foundation_beginner'
  | 'intermediate_bushcraft'
  | 'advanced_wilderness';

export type ThermalSafetyStatus =
  | 'adequate_survival_warmth'
  | 'caution_hypothermia_risk'
  | 'hazardous_sub_freezing';

export interface BushcraftProject {
  id: string;
  title: string;
  region: string;
  discipline: BushcraftDiscipline;
  difficulty: SkillLevel;
  estimatedHours: number;
  thermalRatingRValue: number;
  materialsRequired: string[];
  toolRequired: string;
  description: string;
  highlights: string[];
}

export interface ShelterThermalQuery {
  projectId: string;
  ambientTemperatureF: number;
  windSpeedMph: number;
  debrisThicknessInches: number;
  beddingElevationInches: number;
  fireReflectorWall: boolean;
}

export interface ShelterThermalResult {
  projectTitle: string;
  discipline: BushcraftDiscipline;
  effectiveRValue: number;
  estimatedInteriorTempF: number;
  safetyStatus: ThermalSafetyStatus;
  groundConductiveLossWarning: boolean;
  thermalAdvisory: string;
  fieldcraftTips: string[];
}

export interface BushcraftGearItem {
  id: string;
  name: string;
  category: 'cutting' | 'fire' | 'cooking' | 'cordage' | 'shelter' | 'container';
  mandatory: boolean;
  description: string;
}

export const BUSHCRAFT_PROJECTS: BushcraftProject[] = [
  {
    id: 'boreal-debris-hut-shelter',
    title: 'Boreal Forest Debris Hut & Insulated Raised Bed',
    region: 'Northwoods Boreal Forest, Ely, MN',
    discipline: 'shelter_craft',
    difficulty: 'intermediate_bushcraft',
    estimatedHours: 4.5,
    thermalRatingRValue: 8.0,
    materialsRequired: [
      'Deadfall ridgepole',
      'Forked support stakes',
      'Leaf and moss debris (3ft thick)',
      'Pine bough bedding',
    ],
    toolRequired: 'Full-tang carbon steel bushcraft knife & folding saw',
    description:
      'A classic sub-arctic survival shelter built with an A-frame ridgepole, rib struts, and a thick canopy of insulating debris designed to trap radiant body heat.',
    highlights: [
      '3-foot thick insulating leaf layer',
      'Body-contoured thermal coffin interior',
      'Small crawl-in low draft entry hole',
    ],
  },
  {
    id: 'cedar-bow-drill-ember',
    title: 'Northern White Cedar Bow Drill Friction Fire',
    region: 'Adirondack High Peaks, Lake Placid, NY',
    discipline: 'friction_fire',
    difficulty: 'intermediate_bushcraft',
    estimatedHours: 2.0,
    thermalRatingRValue: 0.0,
    materialsRequired: [
      'White cedar spindle & hearthboard',
      'Hardwood bearing block with green leaf lube',
      'Curved branch bow',
      "Tinder fungus or cedar bark bird's nest",
    ],
    toolRequired: 'Carbon steel knife with 90-degree spine',
    description:
      'Mastering primitive kinetic fire friction using resonant northern white cedar timber, carving burn-in notches, and generating cherry-red glowing embers.',
    highlights: [
      'Smoke-to-black-powder friction threshold',
      'Hot glowing punk ember transfer',
      "Gentle blowing bird's nest to flame",
    ],
  },
  {
    id: 'basswood-bast-fiber-cordage',
    title: 'Basswood Inner Bark Two-Ply Reverse Wrap Cordage',
    region: 'Great Smoky Mountains, Gatlinburg, TN',
    discipline: 'cordage_botany',
    difficulty: 'foundation_beginner',
    estimatedHours: 3.0,
    thermalRatingRValue: 0.0,
    materialsRequired: [
      'Soaked basswood inner bark strips',
      'Retting bath bucket or stream pool',
      'Smooth scraping rock or wooden wedge',
    ],
    toolRequired: 'Fixed blade carving knife',
    description:
      'Harvesting spring bast fibers from fallen linden or basswood, retting outer bark layers, and reverse-twist rolling continuous high-tensile wilderness cordage.',
    highlights: [
      'Inner bast peel separation from outer bark',
      'Two-ply reverse twist rolling technique',
      'Splice staggering for continuous rope strength',
    ],
  },
  {
    id: 'mors-kochanski-super-shelter',
    title: 'Mors Kochanski Polar Super Shelter',
    region: 'Allagash Wilderness Waterway, Fort Kent, ME',
    discipline: 'shelter_craft',
    difficulty: 'advanced_wilderness',
    estimatedHours: 6.0,
    thermalRatingRValue: 12.0,
    materialsRequired: [
      "Clear polyethylene painter's plastic",
      'Mylar reflective space blankets',
      'Green pole lean-to framework',
      'Long log reflector fire wall',
    ],
    toolRequired: 'Forest axe, bushcraft knife, and folding bucksaw',
    description:
      'Legendary polar survival engineering utilizing a clear plastic greenhouse front, rear Mylar radiant reflectors, and an exterior raised reflector fire.',
    highlights: [
      'Greenhouse radiant heat trapping',
      'Reflective Mylar wall backer',
      'Sub-zero survival in light clothing',
    ],
  },
  {
    id: 'birch-bark-water-boiling-vessel',
    title: 'Folded Birch Bark Cooking Pot & Stone Boiling',
    region: 'Superior National Forest, Grand Marais, MN',
    discipline: 'water_foraging_craft',
    difficulty: 'advanced_wilderness',
    estimatedHours: 3.5,
    thermalRatingRValue: 0.0,
    materialsRequired: [
      'Flexible paper birch bark sheet',
      'Split spruce root split-lashes',
      'Smooth non-porous granite river cobbles',
      'Split green wood cooking tongs',
    ],
    toolRequired: 'Awl or knife tip and carving blade',
    description:
      'Pliable winter-peeled birch bark origami-folded into a leak-proof basin and boiled safely using superheated fire stones without scorching the bark.',
    highlights: [
      'Origami-folded water-tight seams',
      'Hot stone radiant conduction boiling',
      'Zero scorched bark water physics',
    ],
  },
];

export const BUSHCRAFT_GEAR: BushcraftGearItem[] = [
  {
    id: 'carbon-steel-bushcraft-knife',
    name: 'High-Carbon Steel Full-Tang Bushcraft Knife with Scandi Grind & 90-Degree Spine',
    category: 'cutting',
    mandatory: true,
    description:
      '1095 or O1 carbon steel fixed blade optimized for wood splitting (batonning), precise notch carving, and throwing sparks from a ferro rod.',
  },
  {
    id: 'bushcraft-folding-saw',
    name: 'Aggressive Cross-Cut Folding Saw or Compact Buck Saw',
    category: 'cutting',
    mandatory: true,
    description:
      'Pull-stroke Japanese tooth folding saw for processing ridgepole timbers, framing stakes, and deadwood rounds with minimal calorie expenditure.',
  },
  {
    id: 'ferrocerium-spark-rod',
    name: 'Heavy-Duty 1/2-Inch Ferrocerium Rod with Hardened Steel Striker',
    category: 'fire',
    mandatory: true,
    description:
      'Reliable all-weather ignition tool delivering showers of 5,500°F sparks even after total water submersion or in sub-zero blizzards.',
  },
  {
    id: 'single-wall-stainless-canteen-cup',
    name: '32oz Single-Wall Stainless Steel Bushcraft Canteen with Nesting Cup & Lid',
    category: 'cooking',
    mandatory: true,
    description:
      'Direct-flame safe 304 food-grade stainless steel bottle and nesting cup combination for boiling pathogen-free water and preparing hot infusions.',
  },
  {
    id: 'tarred-marline-bankline',
    name: 'Roll of #36 Braided Tarred Bankline (Cordage & Lashing)',
    category: 'cordage',
    mandatory: true,
    description:
      'Braided nylon cordage treated with petroleum wax and tar, offering 320 lb tensile strength, rot resistance, and exceptional knot-holding hold for lashings.',
  },
  {
    id: 'heavy-canvas-wool-blanket',
    name: 'Heavyweight 100% Virgin Wool Bushcraft Blanket or Oilskin Tarp',
    category: 'shelter',
    mandatory: true,
    description:
      'Dense 800+ GSM natural wool weave that provides convective wind blocking and maintains thermal insulation even when thoroughly damp or near ember sparks.',
  },
];

export function getBushcraftProjects(discipline?: BushcraftDiscipline): BushcraftProject[] {
  if (!discipline) {
    return [...BUSHCRAFT_PROJECTS];
  }
  return BUSHCRAFT_PROJECTS.filter((p) => p.discipline === discipline);
}

export function getBushcraftProjectById(id: string): BushcraftProject | undefined {
  return BUSHCRAFT_PROJECTS.find((p) => p.id === id);
}

export function getBushcraftGear(): BushcraftGearItem[] {
  return [...BUSHCRAFT_GEAR];
}

export function calculateShelterThermal(query: ShelterThermalQuery): ShelterThermalResult {
  const project = BUSHCRAFT_PROJECTS.find((p) => p.id === query.projectId);
  const projectTitle = project ? project.title : 'Custom Fieldcraft Shelter';
  const discipline = project ? project.discipline : 'shelter_craft';

  const baseR = project ? project.thermalRatingRValue : 6.0;
  const debrisR = query.debrisThicknessInches * 0.9;
  const beddingR = query.beddingElevationInches * 0.8;
  const reflectorR = query.fireReflectorWall ? 2.5 : 0;
  const windRPenalty = (query.windSpeedMph / 15) * 0.7;
  const groundRPenalty =
    query.beddingElevationInches < 4 ? (4 - query.beddingElevationInches) * 1.5 : 0;

  const effectiveRValue = Math.max(
    0.5,
    Math.round((baseR + debrisR + beddingR + reflectorR - windRPenalty - groundRPenalty) * 10) / 10
  );

  const bodyLift = Math.min(30, effectiveRValue * 0.85);
  const reflectorTempBoost = query.fireReflectorWall ? 18 : 0;
  const windTempLoss = query.windSpeedMph * 0.3;
  const groundTempLoss =
    query.beddingElevationInches < 4 ? (4 - query.beddingElevationInches) * 4.0 : 0;

  const estimatedInteriorTempF = Math.round(
    query.ambientTemperatureF + bodyLift + reflectorTempBoost - windTempLoss - groundTempLoss
  );

  const groundConductiveLossWarning = query.beddingElevationInches < 4;

  let safetyStatus: ThermalSafetyStatus;
  if (estimatedInteriorTempF >= 50) {
    safetyStatus = 'adequate_survival_warmth';
  } else if (estimatedInteriorTempF >= 32) {
    safetyStatus = 'caution_hypothermia_risk';
  } else {
    safetyStatus = 'hazardous_sub_freezing';
  }

  let thermalAdvisory = '';
  if (safetyStatus === 'adequate_survival_warmth') {
    thermalAdvisory =
      'Shelter envelope provides sufficient thermal retention to maintain core body temperature safely overnight.';
  } else if (safetyStatus === 'caution_hypothermia_risk') {
    thermalAdvisory =
      'Interior temperature approaches hypothermia risk levels. Increase debris thatch density, reduce draft openings, or erect a fire reflector wall.';
  } else {
    thermalAdvisory =
      'Severe hypothermia and frostbite hazard! Interior conditions are sub-freezing. Immediately elevate bedding off the frozen ground and increase thatch wall thickness to at least 24-36 inches.';
  }

  if (groundConductiveLossWarning) {
    thermalAdvisory = `Warning: Critical conductive ground chill detected! Bedding is under 4 inches. ${thermalAdvisory}`;
  }

  const fieldcraftTips = [
    'Thatch debris until you cannot push an arm through without resistance (target 3 feet for sub-freezing bivouacs).',
    'Body-contour the internal sleeping chamber to minimize dead air volume your body has to warm.',
    'Keep your entrance opening minimal and plug with a debris door plug or pack when inside.',
    'Always insulate the floor before building the roof: conduction to the ground drains heat 24x faster than air.',
  ];

  return {
    projectTitle,
    discipline,
    effectiveRValue,
    estimatedInteriorTempF,
    safetyStatus,
    groundConductiveLossWarning,
    thermalAdvisory,
    fieldcraftTips,
  };
}
