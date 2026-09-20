export type ForagingCategory = 'mushroom' | 'berry' | 'green' | 'root_herb';
export type EdibilityRating = 'choice_edible' | 'edible_caution' | 'medicinal' | 'toxic_poisonous';
export type HarvestSeason = 'spring' | 'summer' | 'late_summer' | 'fall' | 'all_year';
export type HabitatType = 'conifer_forest' | 'deciduous_forest' | 'alpine_meadow' | 'riparian_riverbank' | 'subalpine';

export interface EdibleSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  category: ForagingCategory;
  edibility: EdibilityRating;
  seasons: HarvestSeason[];
  primaryHabitat: HabitatType;
  keyIdentifiers: string[];
  toxicLookalikes: string[];
  preparationSafety: string;
  harvestLimitRules: string;
}

export interface ForagingSafetyQuery {
  category: ForagingCategory | 'all';
  season: HarvestSeason;
  hasFalseGills?: boolean;
  isHollowStem?: boolean;
  hasMilkySap?: boolean;
  growingOnDeadWood?: boolean;
}

export interface ForagingSafetyResult {
  candidateMatch: string;
  warningLevel: 'safe' | 'caution' | 'danger_do_not_consume';
  recommendation: string;
  safetyChecks: string[];
  permitNotice: string;
}

export interface ForagingGuideline {
  id: string;
  title: string;
  principle: string;
  detail: string;
}

export const FORAGING_SPECIES: EdibleSpecies[] = [
  {
    id: 'golden-chanterelle',
    commonName: 'Pacific Golden Chanterelle',
    scientificName: 'Cantharellus formosus',
    category: 'mushroom',
    edibility: 'choice_edible',
    seasons: ['late_summer', 'fall'],
    primaryHabitat: 'conifer_forest',
    keyIdentifiers: [
      'Blunt, fork-branching false gills running decurrent down the stem',
      'Solid white interior flesh that pulls apart like string cheese',
      'Vibrant golden-orange to apricot hue with fruity aroma',
      'Never grows in dense shelf clusters on dead standing wood',
    ],
    toxicLookalikes: [
      "Jack O'Lantern (Omphalotus olivascens) - true blade-like gills, orange interior flesh, grows in dense clusters directly on wood, severe gastrointestinal toxicity",
      'Woolly False Chanterelle (Turbinellus floccosus) - deep funnel vase with shaggy orange scales, causes acute GI upset',
    ],
    preparationSafety:
      'Always thoroughly cook before consumption. Never eat raw chanterelles. Dry-sauté first to release abundant moisture before adding butter, shallots, or oil.',
    harvestLimitRules:
      'US Forest Service PNW Region 6 allows up to 1 gallon per person per day for incidental personal use without a commercial permit. Cut at base to leave mycelium undisturbed.',
  },
  {
    id: 'morel-mushroom',
    commonName: 'Pacific Northwest Black Morel',
    scientificName: 'Morchella elata',
    category: 'mushroom',
    edibility: 'choice_edible',
    seasons: ['spring'],
    primaryHabitat: 'conifer_forest',
    keyIdentifiers: [
      'Distinctive pitted, honeycomb-patterned conical cap with dark ridges',
      'Cap is continuously attached at base directly to hollow stem',
      'Entire mushroom is completely hollow inside from cap tip to stem base',
      'Prolific in prior-year wildfire burn zones and mixed conifer duff',
    ],
    toxicLookalikes: [
      'False Morel (Gyromitra esculenta / G. montana) - brain-like wavy lobes rather than honeycomb pits, cottony or chambered interior flesh, contains volatile hydrazine toxin gyromitrin',
      'Early Morel / Thimble Morel (Verpa bohemica) - cap hangs free from top of stem like a thimble on a finger, cottony interior',
    ],
    preparationSafety:
      'MUST be thoroughly cooked to destroy thermolabile hemolysin toxins. Slice lengthwise in half to verify hollow chamber and rinse out insects or soil particles.',
    harvestLimitRules:
      'Free-use personal harvest limit is 5 gallons per person per day in designated National Forest burn areas. Mushroom caps must be cut in half on site in some ranger districts.',
  },
  {
    id: 'huckleberry',
    commonName: 'Pacific Mountain Huckleberry',
    scientificName: 'Vaccinium membranaceum',
    category: 'berry',
    edibility: 'choice_edible',
    seasons: ['late_summer', 'fall'],
    primaryHabitat: 'subalpine',
    keyIdentifiers: [
      'Single dark purple-black globose berries with a distinct circular calyx ring at apex',
      'Alternate ovate finely serrate leaves on slender woody branching shrubs (2-6 ft)',
      'Rich tart-sweet flavor, far more intense than cultivated blueberries',
      'Thrives in subalpine clearings, avalanche chutes, and sunny ridgelines',
    ],
    toxicLookalikes: [
      'Baneberry (Actaea rubra) - glossy red or porcelain white berries borne on erect branching stalks with coarse compound foliage; highly toxic cardiotoxin',
      'Trailing Nightshade (Solanum dulcamara) - red elongated berries on vine, toxic solanine',
    ],
    preparationSafety:
      'Can be enjoyed freshly rinsed, baked into pies, preserved in compotes, or dehydrated for trail pemmican. Wash thoroughly with cold water to remove dust.',
    harvestLimitRules:
      'Personal consumption limit is 1 gallon per person per year in most PNW National Forests. Gifford Pinchot National Forest designates special zones reserved for tribal treaty rights.',
  },
  {
    id: 'miner-lettuce',
    commonName: "Miner's Lettuce",
    scientificName: 'Claytonia perfoliata',
    category: 'green',
    edibility: 'choice_edible',
    seasons: ['spring', 'summer'],
    primaryHabitat: 'riparian_riverbank',
    keyIdentifiers: [
      'Perfoliate circular saucer leaves completely pierced by the flower stem',
      'Tiny 5-petaled white or pale pink blossoms clustered at the disc center',
      'Crisp, juicy, tender succulent stems with mild sweet flavor',
      'Grows in cool, damp, shaded riparian soils, under forest canopy, and riverbanks',
    ],
    toxicLookalikes: [
      'Few look-alikes due to unique disk-shaped leaf; avoid harvesting near stagnant runoff where toxic water hemlock (Cicuta douglasii) may contaminate the watershed',
    ],
    preparationSafety:
      'Harvest tender leaves and stems; rinse carefully in clean mountain water. Superb raw in field salads, offering rich concentrations of vitamin C and beta-carotene.',
    harvestLimitRules:
      'Pinch or snip top disk leaves above ground level. Always adhere to the 1/3 rule: leave at least two-thirds of the patch to flower and reseed.',
  },
  {
    id: 'stinging-nettle',
    commonName: 'Common Stinging Nettle',
    scientificName: 'Urtica dioica',
    category: 'green',
    edibility: 'choice_edible',
    seasons: ['spring'],
    primaryHabitat: 'riparian_riverbank',
    keyIdentifiers: [
      'Opposite coarsely serrated heart-to-lance-shaped dark green leaves',
      'Rigid square 4-angled stem covered with tiny glass-like stinging trichomes',
      'Immediate stinging histamine/formic acid reaction when brushed against bare skin',
      'Favors rich nitrogen-heavy alluvial bottomland, moist creek beds, and woodland edges',
    ],
    toxicLookalikes: [
      'Wood Nettle (Laportea canadensis) - alternate leaves instead of opposite; also edible when cooked',
      'Deadnettle (Lamium species) - lacks stinging hairs and square stem blossoms differ; non-toxic',
    ],
    preparationSafety:
      'Always wear thick gardening or work gloves during harvest. Blanch in boiling water for 90 seconds or sauté to completely neutralize the stinging hairs. Never consume raw.',
    harvestLimitRules:
      'Harvest only the top 4 to 6 young tender leaves in early spring before flowering. Once flowering begins, leaves develop gritty calcium oxalate cystoliths that strain kidneys.',
  },
];

export function getForagingSpecies(category?: ForagingCategory, season?: HarvestSeason): EdibleSpecies[] {
  return FORAGING_SPECIES.filter((species) => {
    if (category && species.category !== category) return false;
    if (season && !species.seasons.includes(season) && !species.seasons.includes('all_year')) {
      return false;
    }
    return true;
  });
}

export function getForagingSpeciesById(id: string): EdibleSpecies | undefined {
  return FORAGING_SPECIES.find((species) => species.id === id);
}

export function evaluateForagingSafety(query: ForagingSafetyQuery): ForagingSafetyResult {
  const permitNotice =
    'US Forest Service Region 6 (Pacific Northwest) personal use limits: 1 gallon/day for chanterelles & berries, 5 gallons/day for morels. Commercial harvesting requires a designated ranger district permit.';

  // 1. Check for deadly or severe toxic indicators
  if (query.category === 'mushroom' && query.hasFalseGills === false) {
    return {
      candidateMatch: "Suspected Jack O'Lantern (Omphalotus olivascens) or Toxic Agaric",
      warningLevel: 'danger_do_not_consume',
      recommendation:
        'DO NOT CONSUME. True sharp blade-like gills running into the stem are characteristic of the toxic Jack O’Lantern mushroom, which causes severe gastrointestinal distress and cramping.',
      safetyChecks: [
        'DANGER: Sharp blade gills present instead of blunt false ridges',
        'Cross-check interior flesh color (Jack O’Lantern is orange, Chanterelle is white)',
        'Check substrate: Jack O’Lantern grows clustered on wood or buried roots',
      ],
      permitNotice,
    };
  }

  if (query.category === 'mushroom' && query.isHollowStem === false && (query.season === 'spring' || query.hasFalseGills === undefined)) {
    return {
      candidateMatch: 'Suspected False Morel (Gyromitra esculenta / Gyromitra montana)',
      warningLevel: 'danger_do_not_consume',
      recommendation:
        'DO NOT CONSUME. A solid, chambered, or cottony-filled stem interior strongly suggests a toxic False Morel (Gyromitra). Contains gyromitrin, a hazardous volatile toxin that metabolizes into monomethylhydrazine.',
      safetyChecks: [
        'DANGER: Stem is not completely hollow from tip to base',
        'Cap features brain-like convoluted folds rather than distinct honeycomb pits',
        'Cap skirt may hang free from the stem rather than continuous attachment',
      ],
      permitNotice,
    };
  }

  // 2. Check for caution indicators (milky/colored sap)
  if (query.hasMilkySap) {
    return {
      candidateMatch: 'Latex-Exuding Species (Lactifluus / Lactarius or toxic euphorbia)',
      warningLevel: 'caution',
      recommendation:
        'CAUTION - CONFIRMATION REQUIRED. Exuding milky or colored latex sap requires precise spore print analysis and latex taste/staining verification. Several milky species cause severe gastric irritation.',
      safetyChecks: [
        'Record color changes of milky sap when exposed to air (white to yellow, lilac, or green)',
        'Take spore print on both white and black paper',
        'Consult regional PNW mycological key before considering edibility',
      ],
      permitNotice,
    };
  }

  // 3. Positive identification matches
  if (query.category === 'mushroom') {
    if (query.hasFalseGills === true) {
      return {
        candidateMatch: 'Pacific Golden Chanterelle (Cantharellus formosus)',
        warningLevel: 'safe',
        recommendation:
          'SAFE CANDIDATE IDENTIFIED. Blunt, decurrent ridge-like false gills and solid white string-cheese interior flesh strongly align with the Pacific Golden Chanterelle.',
        safetyChecks: [
          'Blunt, wavy ridges (false gills) that run down the stem',
          'Solid white interior flesh with faint fruity/apricot aroma',
          'Stem is not hollow and flesh does not bruise dark green/black',
          'Cook thoroughly in dry skillet before consumption',
        ],
        permitNotice,
      };
    }

    if (query.isHollowStem === true) {
      return {
        candidateMatch: 'Pacific Northwest Black Morel (Morchella elata)',
        warningLevel: 'safe',
        recommendation:
          'SAFE CANDIDATE IDENTIFIED. Completely hollow interior chamber and honeycomb-pitted cap strongly align with the Pacific Northwest Black Morel. Always cook thoroughly before eating.',
        safetyChecks: [
          'Entire specimen verified 100% hollow from cap apex to stem base',
          'Pitted honeycomb structure, not brain-like folds',
          'Cap bottom is continuously fused with the stem',
          'Cook thoroughly; never consume raw morels',
        ],
        permitNotice,
      };
    }
  }

  if (query.category === 'berry') {
    return {
      candidateMatch: 'Pacific Mountain Huckleberry (Vaccinium membranaceum)',
      warningLevel: 'safe',
      recommendation:
        'SAFE CANDIDATE IDENTIFIED. Single purple-black berries with distinctive apical calyx crown on woody shrub indicate high probability of native Mountain Huckleberry.',
      safetyChecks: [
        'Confirm circular calyx depression at the tip of each berry',
        'Grows on woody shrubs with alternate, finely serrate leaves',
        'Verify berries are not borne on toxic baneberry stalks or nightshade clusters',
      ],
      permitNotice,
    };
  }

  if (query.category === 'green') {
    return {
      candidateMatch: "Miner's Lettuce (Claytonia perfoliata) / Stinging Nettle (Urtica dioica)",
      warningLevel: 'safe',
      recommendation:
        'SAFE CANDIDATE IDENTIFIED. Spring riparian greens verified. For nettles, handle with protective gloves and boil or sauté to neutralize stinging hairs. For Miner’s lettuce, enjoy fresh after cold rinse.',
      safetyChecks: [
        'Distinctive perfoliate cup leaves confirm Miner’s Lettuce',
        'Square stem and stinging trichomes confirm Stinging Nettle (cook before eating)',
        'Harvest clean plants away from stagnant drainage or high-traffic animal zones',
      ],
      permitNotice,
    };
  }

  return {
    candidateMatch: 'General Pacific Northwest Foraging Observation',
    warningLevel: 'caution',
    recommendation:
      'CAUTION - CONFIRMATION REQUIRED. Please supply specific morphological characteristics (such as gill structure, stem interior, and seasonal habitat) to narrow identification certainty.',
    safetyChecks: [
      'Compare specimen against botanical field handbook keys',
      'Never consume any wild specimen without 100% positive identification',
      'Preserve sample in breathable paper bag for expert mycological review',
    ],
    permitNotice,
  };
}

export function getForagingEthicalGuidelines(): ForagingGuideline[] {
  return [
    {
      id: 'rule-of-thirds',
      title: 'The Rule of Thirds',
      principle: '1/3 for you, 1/3 for wildlife, 1/3 for regeneration',
      detail:
        'Never harvest more than one-third of any healthy plant stand or mushroom cluster. Leave one-third to nourish local wildlife and one-third to seed, spore, and regenerate next year’s growth.',
    },
    {
      id: 'spore-dispersal',
      title: 'Spore Dispersal & Collection',
      principle: 'Carry harvest in airy mesh baskets or porous canvas',
      detail:
        'Avoid airtight plastic bags that induce premature rotting. Porous mesh baskets let millions of microscopic fungal spores sift through back onto the damp forest floor as you hike.',
    },
    {
      id: 'absolute-certainty',
      title: '100% Identification Certainty Rule',
      principle: 'When in doubt, leave it out',
      detail:
        'Never consume any wild plant or mushroom unless you have verified multiple independent macroscopic identifiers, cross-checked toxic look-alikes, and consulted trusted regional keys.',
    },
    {
      id: 'clean-cutting',
      title: 'Clean Cutting vs Soil Disturbance',
      principle: 'Slice cleanly at the stem base without raking soil',
      detail:
        'Use a sharp curved foraging knife to slice stems just above soil level. Never rake or tear up forest duff, which disrupts delicate underground mycelial networks and root systems.',
    },
  ];
}

export function getForagingGearChecklist(): Array<{
  id: string;
  name: string;
  required: boolean;
  notes: string;
}> {
  return [
    {
      id: 'mesh-basket',
      name: 'Mesh collection basket or airy canvas bag',
      required: true,
      notes: 'Permits continuous spore dispersal across forest duff and prevents specimens from sweating or crushing.',
    },
    {
      id: 'mushroom-knife',
      name: 'Opinel mushroom knife with boar bristle brush',
      required: true,
      notes: 'Curved hawkbill blade for clean stem severance and stiff natural bristle brush to sweep duff before packing.',
    },
    {
      id: 'field-loupe',
      name: '10x field loupe magnifier',
      required: true,
      notes: 'Crucial for inspecting false vs true gill morphology, leaf serrations, and glandular trichomes.',
    },
    {
      id: 'waxed-pouches',
      name: 'Breathable waxed paper or canvas bags',
      required: false,
      notes: 'Keeps disparate mushroom varieties segregated so accidental toxic contact cannot cross-contaminate edible yields.',
    },
    {
      id: 'protective-gloves',
      name: 'Protective nitrile or thorn-proof gloves',
      required: true,
      notes: 'Guards hands against stinging nettle formic acid trichomes, thorny berry brambles, and irritating milky sap.',
    },
    {
      id: 'field-guide',
      name: 'PNW Wild Edibles & Mushroom Identification Field Guide',
      required: true,
      notes: 'Waterproof regional botanical taxonomy guide for reliable offline cross-examination deep in backcountry valleys.',
    },
  ];
}
