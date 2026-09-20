export type SpeciesRiskLevel = 'extreme' | 'high' | 'moderate' | 'low';
export type WildlifeCategory = 'apex_carnivore' | 'large_ungulate' | 'small_predator' | 'reptile';
export type HabitatZone = 'alpine_tundra' | 'dense_conifer' | 'riparian_river' | 'high_desert' | 'subalpine_meadow';

export interface WildlifeSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  category: WildlifeCategory;
  riskLevel: SpeciesRiskLevel;
  habitats: HabitatZone[];
  keyIdentificationTraits: string[];
  bearSpecificTraits?: {
    humpPresent: boolean;
    facialProfile: 'dished' | 'straight';
    earShape: 'short_rounded' | 'tall_pointed';
    clawLengthInches: number;
  };
  encounterProtocol: string;
  safeDistanceYards: number;
  seasonalBehavior: string;
}

export interface EncounterAssessmentQuery {
  speciesId: string;
  distanceYards: number;
  hasCubsOrFood: boolean;
  isApproaching: boolean;
  hasBearSprayReady: boolean;
}

export interface EncounterAssessmentResult {
  dangerLevel: 'critical_imminent' | 'elevated_caution' | 'monitor_distance';
  immediateAction: string;
  defensiveSteps: string[];
  bearSprayProtocol: string;
  foodStorageRule: string;
}

export interface FoodStorageGuideline {
  id: string;
  zoneName: string;
  canisterRequired: boolean;
  regulations: string;
  hangSpecification: string;
}

export interface WildlifeGearItem {
  id: string;
  name: string;
  essential: boolean;
  category: 'deterrent' | 'storage' | 'signaling';
  notes: string;
}

export const WILDLIFE_CATALOG: WildlifeSpecies[] = [
  {
    id: 'grizzly-bear',
    commonName: 'Grizzly Bear',
    scientificName: 'Ursus arctos horribilis',
    category: 'apex_carnivore',
    riskLevel: 'extreme',
    habitats: ['alpine_tundra', 'subalpine_meadow'],
    keyIdentificationTraits: [
      'Prominent muscular shoulder hump between front shoulders',
      'Dished (concave) facial profile extending between eyes and snout',
      'Short, rounded, fuzzy ears',
      'Long, gently curved claws (3-4 inches), typically light-colored',
    ],
    bearSpecificTraits: {
      humpPresent: true,
      facialProfile: 'dished',
      earShape: 'short_rounded',
      clawLengthInches: 4,
    },
    encounterProtocol:
      'Do not run. Stand your ground, group together, and speak in a calm, assertive tone. Ready bear spray immediately by unclipping safety. If charged defensively, discharge spray in 1-2s downward bursts at 30-40 ft. If physical contact occurs with a defensive grizzly, drop onto your stomach, clasp hands behind neck, and spread legs wide.',
    safeDistanceYards: 100,
    seasonalBehavior:
      'Undergoes hyperphagia in late summer and fall, foraging intensely for roots, berries, whitebark pine seeds, and moths in high alpine bowls.',
  },
  {
    id: 'black-bear',
    commonName: 'American Black Bear',
    scientificName: 'Ursus americanus',
    category: 'apex_carnivore',
    riskLevel: 'high',
    habitats: ['dense_conifer', 'riparian_river'],
    keyIdentificationTraits: [
      'No shoulder hump; highest point of back is near rump when standing',
      'Straight facial profile from forehead down to muzzle',
      'Tall, pointed, conspicuous upright ears',
      'Short, strongly curved dark claws (1-2 inches) adapted for tree climbing',
    ],
    bearSpecificTraits: {
      humpPresent: false,
      facialProfile: 'straight',
      earShape: 'tall_pointed',
      clawLengthInches: 1.5,
    },
    encounterProtocol:
      'Make yourself look large, talk assertively, and slowly back away without turning your back. If the bear approaches persistently or follows, stand your ground, yell aggressively, throw objects, and deploy bear spray. If attacked by a black bear, do NOT play dead — fight back aggressively with rocks, sticks, and bare hands.',
    safeDistanceYards: 100,
    seasonalBehavior:
      'Active spring through autumn foraging berries, insects, and riparian salmon runs; forages heavily in dense timber and riverbeds before winter torpor.',
  },
  {
    id: 'cougar',
    commonName: 'Mountain Lion / Cougar',
    scientificName: 'Puma concolor',
    category: 'apex_carnivore',
    riskLevel: 'high',
    habitats: ['dense_conifer', 'high_desert'],
    keyIdentificationTraits: [
      'Solitary, muscular feline build with tawny tan/buff short coat',
      'Long cylindrical tail with distinct black tip, measuring ~one-third total body length',
      'Small rounded ears with dark exterior marks',
      'Silent ambush hunter with stealthy low-profile gait',
    ],
    encounterProtocol:
      'Never run, crouch, or turn your back — running triggers a predatory stalk-and-pounce instinct. Face animal directly, make eye contact, hold pack or jacket overhead to look huge, speak loudly and firmly, and prepare bear spray or rocks. If attacked, fight back viciously, aiming blows at eyes and throat.',
    safeDistanceYards: 100,
    seasonalBehavior:
      'Territorial apex stalker roaming massive home ranges; actively follows migratory mule deer and elk herds between high alpine passes and winter lowlands.',
  },
  {
    id: 'moose',
    commonName: 'Shiras Moose',
    scientificName: 'Alces alces shirasi',
    category: 'large_ungulate',
    riskLevel: 'high',
    habitats: ['riparian_river', 'dense_conifer'],
    keyIdentificationTraits: [
      'Towering shoulder height up to 6 feet with dark brown-black coat',
      'Long, stilt-like legs enabling rapid navigation through deep bogs and snow',
      'Pendulous flap of skin (dewlap/bell) hanging beneath throat',
      'Broad, palmate antlers on adult bulls (shed each winter)',
    ],
    encounterProtocol:
      'Maintain at least 25 yards of distance (minimum 50-75 yards if cow with calf or rutting bull). Look for aggressive posturing: ears pinned flat against head, neck hair (hackles) raised, snorting, or tongue clicking. If a moose charges, do NOT stand your ground — RUN immediately and place large obstacles (mature trees, boulders, vehicles) between you and the moose.',
    safeDistanceYards: 25,
    seasonalBehavior:
      'Fierce autumn rutting season (September-October) brings volatile bull aggression; cows vigorously defend newborn calves in spring and summer near willow riparian zones.',
  },
  {
    id: 'western-rattlesnake',
    commonName: 'Western Rattlesnake',
    scientificName: 'Crotalus oreganus',
    category: 'reptile',
    riskLevel: 'moderate',
    habitats: ['high_desert'],
    keyIdentificationTraits: [
      'Broad, triangular head distinct from narrow neck with pit organs between eyes and nostrils',
      'Segmented keratin rattle at the tip of the tail that buzzes when agitated',
      'Dull olive, brown, or grayish body with dark blotches edged with light scales',
      'Vertical elliptical (cat-like) pupils',
    ],
    encounterProtocol:
      'Freeze immediately upon hearing a rattle buzz. Scan the ground carefully without making sudden lunges to pinpoint the snake. Slowly back away along your approach path, giving the snake at least 10 yards of clearance. Always look before placing hands or feet on rocky ledges and fallen logs.',
    safeDistanceYards: 10,
    seasonalBehavior:
      'Emerges from communal rocky winter dens (hibernacula) in mid-spring; basks in morning sun on rocky slopes and talus, switching to nocturnal hunting during intense summer heat.',
  },
];

export const FOOD_STORAGE_GUIDELINES: FoodStorageGuideline[] = [
  {
    id: 'north-cascades',
    zoneName: 'North Cascades National Park & Stephen Mather Wilderness',
    canisterRequired: true,
    regulations:
      'Hard-sided IGBC-approved bear canisters are strictly mandatory for all overnight camping between May 1 and November 1 in designated subalpine zones including Boston Basin, Sahale Glacier, and Cascade Pass.',
    hangSpecification:
      'In zones where canisters are not legally mandated, food must be suspended using the counter-balance or PCT method at least 12 feet above the ground and 4 feet horizontally from tree trunks.',
  },
  {
    id: 'olympic-national-park',
    zoneName: 'Olympic National Park Wilderness',
    canisterRequired: true,
    regulations:
      'Approved bear canisters are mandatory year-round in high-use wilderness zones including Sol Duc/Seven Lakes Basin, Royal Basin, Enchanted Valley, and coastal wilderness strips.',
    hangSpecification:
      'Bear wires and cable poles are installed at certain backcountry camps. If hanging where permissible, suspend food 12 feet high and 10 feet out from the main trunk.',
  },
  {
    id: 'mount-rainier',
    zoneName: 'Mount Rainier National Park Backcountry',
    canisterRequired: false,
    regulations:
      'Food hanging poles or cables are provided at designated backcountry trailside camps. Where poles are unavailable, an approved hard-sided bear canister is required.',
    hangSpecification:
      'Use park-provided food poles or suspend food bags via PCT method minimum 10-12 feet high and 4 feet out from tree trunks, at least 100 yards downwind from campsites.',
  },
];

export const WILDLIFE_SAFETY_GEAR: WildlifeGearItem[] = [
  {
    id: 'bear-spray',
    name: 'EPA-Registered Bear Spray with Quick-Draw Holster',
    essential: true,
    category: 'deterrent',
    notes:
      'Contains 1.0-2.0% capsaicin; minimum 30-foot spray range; carry in accessible holster on chest or hip, NEVER inside your backpack.',
  },
  {
    id: 'bear-canister',
    name: 'IGBC-Certified Bear Resistant Canister',
    essential: true,
    category: 'storage',
    notes:
      'Hard-sided canister approved by the Interagency Grizzly Bear Committee (e.g. Garcia, BearVault BV500). Cache 100 yards downwind.',
  },
  {
    id: 'odor-proof-bags',
    name: 'Heavy-Duty Odor-Proof Barrier Bags',
    essential: false,
    category: 'storage',
    notes:
      '6-mil barrier film bags (OPSAK) that prevent scent escape for food, waste, and scented hygiene items inside your canister.',
  },
  {
    id: 'bear-air-horn',
    name: 'Compact Wildlife Air Horn / Audible Deterrent',
    essential: false,
    category: 'signaling',
    notes:
      '115dB compressed air horn provides intense acoustic deterrent against curious, non-charging wildlife from distance.',
  },
  {
    id: 'paracord-rigging',
    name: '50ft High-Tensile Paracord & Carabiner',
    essential: false,
    category: 'storage',
    notes:
      '550-lb test reflective cord with smooth carabiner for rigging PCT-method bear hangs in zones where canisters are optional.',
  },
];

export function getWildlifeSpecies(category?: WildlifeCategory): WildlifeSpecies[] {
  if (!category) {
    return WILDLIFE_CATALOG;
  }
  return WILDLIFE_CATALOG.filter((species) => species.category === category);
}

export function getWildlifeSpeciesById(id: string): WildlifeSpecies | undefined {
  return WILDLIFE_CATALOG.find((species) => species.id === id);
}

export function getFoodStorageGuidelines(): FoodStorageGuideline[] {
  return FOOD_STORAGE_GUIDELINES;
}

export function getWildlifeSafetyGear(): WildlifeGearItem[] {
  return WILDLIFE_SAFETY_GEAR;
}

export function assessEncounterSafety(query: EncounterAssessmentQuery): EncounterAssessmentResult {
  const species = getWildlifeSpeciesById(query.speciesId);
  const safeDist = species?.safeDistanceYards ?? 100;
  const isApex = species?.category === 'apex_carnivore' || species?.id === 'moose';

  let dangerLevel: 'critical_imminent' | 'elevated_caution' | 'monitor_distance';

  if (query.distanceYards <= 25 && (query.isApproaching || query.hasCubsOrFood || isApex)) {
    dangerLevel = 'critical_imminent';
  } else if (query.distanceYards < safeDist && (query.isApproaching || query.hasCubsOrFood)) {
    dangerLevel = 'critical_imminent';
  } else if (query.distanceYards < safeDist || query.isApproaching || query.hasCubsOrFood) {
    dangerLevel = 'elevated_caution';
  } else {
    dangerLevel = 'monitor_distance';
  }

  let immediateAction = '';
  let defensiveSteps: string[] = [];

  if (dangerLevel === 'critical_imminent') {
    immediateAction =
      species?.id === 'moose'
        ? 'RUN IMMEDIATELY — Put large trees, boulders, or dense terrain between you and the charging moose.'
        : 'STAND YOUR GROUND — DO NOT RUN. Remove safety clip from bear spray and prepare immediate defensive barrier.';

    defensiveSteps = [
      'Never run or turn your back on a predator; fleeing triggers predatory pursuit instincts.',
      'Group everyone tightly together immediately to project maximum physical size and mass.',
      'Remove safety clip from bear spray canister and hold with two hands, finger on trigger.',
      'If animal charges, fire in 1-2 second bursts aimed slightly downward at 30-40 ft to create an expanding barrier cloud.',
      species?.id === 'grizzly-bear'
        ? 'If physical contact is imminent with a defensive grizzly, drop onto stomach, clasp hands behind neck, and spread legs wide.'
        : species?.id === 'black-bear' || species?.id === 'cougar'
        ? 'If physical contact is made, FIGHT BACK aggressively with rocks, sticks, trekking poles, and fists targeting eyes and nose.'
        : 'Duck behind large timber or heavy boulders to break the charge line.',
    ];
  } else if (dangerLevel === 'elevated_caution') {
    immediateAction =
      'Stop in your tracks. Group together, speak in calm assertive voices, unholster bear spray, and slowly back away.';
    defensiveSteps = [
      'Stop walking and face the animal calmly without making sudden aggressive gestures.',
      'Ready bear spray by removing canister from holster; check wind direction.',
      'Speak in low, calm, assertive voices to identify yourselves as human.',
      'Slowly increase distance by backing away diagonally without turning your back.',
      'Give wide clearance around terrain features, thickets, or blind corners.',
    ];
  } else {
    immediateAction =
      'Maintain safe visual distance. Do not approach or corner the animal, and detour quietly around the habitat.';
    defensiveSteps = [
      `Keep at least ${safeDist}+ yards of distance from the animal at all times.`,
      'Do not move closer for photography or closer inspection.',
      'Make occasional conversational noise as you travel so other animals are not surprised.',
      'Ensure all food, trash, and scented items remain sealed in odor-proof containers.',
    ];
  }

  const bearSprayProtocol =
    'Remove safety clip, grip canister with both hands, aim slightly downward toward charging animal, and fire in 1-2 second bursts at 30-40 ft range to form an expanding deterrent fog barrier.';

  const foodStorageRule =
    'Store all food, cookware, garbage, and toiletries in an IGBC-approved bear canister or park-provided cable locker placed 100 yards downwind from your sleeping area.';

  return {
    dangerLevel,
    immediateAction,
    defensiveSteps,
    bearSprayProtocol,
    foodStorageRule,
  };
}
