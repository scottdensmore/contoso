export type TrapCategory = 'deadfall' | 'snare';
export type QuarryType = 'snowshoe_hare' | 'ground_squirrel' | 'grouse_ptarmigan' | 'cottontail';
export type CordageType = 'natural_dogbane' | 'tarred_bankline' | 'paracord_inner_core';
export type SensitivityStatus = 'optimal_sensitivity' | 'overly_stiff_miss_risk' | 'hair_trigger_premature_release';
export type LethalityStatus = 'humane_instant_dispatch' | 'sufficient' | 'underweight_cruelty_risk';

export interface TrappingMechanism {
  id: string;
  title: string;
  category: TrapCategory;
  cordageRequired: boolean;
  sensitivityRating: 'hair_trigger' | 'moderate' | 'firm';
  quarrySuitability: string;
  description: string;
  highlights: string[];
}

export interface TrappingCalculationQuery {
  mechanismId: string;
  quarry: QuarryType; // default 'snowshoe_hare'
  deadfallWeightLbs: number; // 5 to 40 lbs, default 15
  notchDepthMm: number; // 1 to 10 mm, default 4
  cordageType: CordageType; // default 'tarred_bankline'
}

export interface TrappingCalculationResult {
  mechanismTitle: string;
  quarryName: string;
  quarryWeightLbs: number;
  deadfallWeightLbs: number;
  weightRatio: number; // deadfallWeightLbs / quarryWeightLbs
  lethalityStatus: LethalityStatus;
  sensitivityStatus: SensitivityStatus;
  estimatedTripForceOz: number;
  legalEthicsAdvisory: string;
}

export interface TrappingSafetyItem {
  id: string;
  name: string;
  category: 'carving' | 'cordage' | 'training' | 'safety' | 'rigging' | 'reference';
  mandatory: boolean;
  description: string;
}

export const QUARRY_INFO: Record<QuarryType, { name: string; weightLbs: number }> = {
  snowshoe_hare: {
    name: 'Snowshoe Hare',
    weightLbs: 3.5,
  },
  ground_squirrel: {
    name: 'Ground Squirrel',
    weightLbs: 1.2,
  },
  grouse_ptarmigan: {
    name: 'Grouse / Ptarmigan',
    weightLbs: 1.8,
  },
  cottontail: {
    name: 'Cottontail',
    weightLbs: 2.5,
  },
};

export const TRAPPING_MECHANISMS: TrappingMechanism[] = [
  {
    id: 'figure-4-deadfall',
    title: 'Classic All-Wood Figure-4 Deadfall',
    category: 'deadfall',
    cordageRequired: false,
    sensitivityRating: 'moderate',
    quarrySuitability: 'Cottontail, ground squirrel, small mammals',
    description:
      'An ancient, self-supporting three-stick deadfall system that locks together under the weight of a stone or log without requiring any cordage.',
    highlights: [
      'Interlocking three-stick geometry',
      'Zero cordage reliance using split wood',
      'Adjustable bait stick horizontal reach',
    ],
  },
  {
    id: 'paiute-deadfall',
    title: 'Paiute Deadfall with Cordage & Hair-Trigger Toggle',
    category: 'deadfall',
    cordageRequired: true,
    sensitivityRating: 'hair_trigger',
    quarrySuitability: 'Mice, voles, ground squirrels, rats',
    description:
      'A high-sensitivity indigenous deadfall using a cordage-tethered toggle stick to hold the upright post on a knife-edge balance.',
    highlights: [
      'Cordage-wrapped upright pivot',
      'Hair-trigger toggle stick sensitivity',
      'Ultra-fast drop release under light nibbles',
    ],
  },
  {
    id: 'promontory-peg-snare',
    title: 'Promontory Peg Interlocking Cordage Snare',
    category: 'snare',
    cordageRequired: true,
    sensitivityRating: 'moderate',
    quarrySuitability: 'Snowshoe hare, cottontail rabbits',
    description:
      'An archaic notched two-peg tension trigger preserved in caves of the Great Basin, utilizing interlocking wooden shoulders under spring sapling tension.',
    highlights: [
      'Ancient Great Basin notched peg design',
      'Bent willow or birch tension sapling',
      'Runs on game trail runways without bait',
    ],
  },
  {
    id: 'spring-pole-snare',
    title: 'Tensioned Sapling Spring-Pole Toggle Snare',
    category: 'snare',
    cordageRequired: true,
    sensitivityRating: 'hair_trigger',
    quarrySuitability: 'Snowshoe hare, grouse, game birds',
    description:
      'A rapid-action kinetic snare powered by a bent green sapling that instantly lifts quarry upon loop disturbance, keeping catch away from ground predators.',
    highlights: [
      'Lifts quarry clear of ground scavengers',
      'Trigger toggle slips instantly on loop pull',
      'Ideal in winter boreal snowpack trails',
    ],
  },
  {
    id: 'rolling-log-deadfall',
    title: 'Heavy Timber Rolling Log & Lever Deadfall',
    category: 'deadfall',
    cordageRequired: false,
    sensitivityRating: 'firm',
    quarrySuitability: 'Larger foraging pests and camp nuisance scavengers',
    description:
      'A high-mass deadfall utilizing heavy timber logs propped on parallel guide rails, designed to deliver high crushing inertia over wide crawlways.',
    highlights: [
      'Dual guide logs prevent lateral roll',
      'High-inertia timber deadweight crushing force',
      'Simple prop-stick trip trigger',
    ],
  },
];

export const TRAPPING_SAFETY_ITEMS: TrappingSafetyItem[] = [
  {
    id: 'carving-bushcraft-knife',
    name: 'High-Carbon Fixed Blade Woodcarving Knife with Scandi Grind for Trigger Notching',
    category: 'carving',
    mandatory: true,
    description:
      'Zero-bevel Scandinavian grind knife optimized for push-cuts, precise 90-degree square notches, and feather sticks.',
  },
  {
    id: 'tarred-bank-line',
    name: '#36 Tarred Braided Bank Line (320 lb Tensile Strength) for Toggle Rigging',
    category: 'cordage',
    mandatory: true,
    description:
      'Petroleum-waxed braided nylon cordage impervious to rot and moisture, ideal for friction lashings and trigger loops.',
  },
  {
    id: 'inert-training-peg-set',
    name: 'Hardwood Split Inert Practice Pegs and Figure-4 Demonstration Set',
    category: 'training',
    mandatory: true,
    description:
      'Non-lethal lightweight practice sticks for perfecting trigger geometries and finger safety without handling dangerous crushing weights.',
  },
  {
    id: 'safety-flagging-tape',
    name: 'High-Visibility Fluorescent Orange Trail Flagging Ribbon for Trap Marking',
    category: 'safety',
    mandatory: true,
    description:
      'High-visibility ribbon for marking training deadfall locations to prevent accidental tripping by humans or domestic animals.',
  },
  {
    id: 'spring-wire-snare-gauge',
    name: 'Aircraft Galvanized Small-Game Snare Wire with Safety Stop',
    category: 'rigging',
    mandatory: true,
    description:
      'Corrosion-resistant steel cable or brass snare wire equipped with mechanical safety stops to prevent non-target animal captures.',
  },
  {
    id: 'survival-regulations-guide',
    name: 'Wilderness Survival Trapping Ethics & Game Code Emergency Legal Field Manual',
    category: 'reference',
    mandatory: true,
    description:
      'Comprehensive waterproof handbook outlining state/provincial wildlife codes, emergency salvage protocols, and humane dispatch ethics.',
  },
];

export function getTrappingMechanisms(category?: TrapCategory): TrappingMechanism[] {
  if (!category) {
    return [...TRAPPING_MECHANISMS];
  }
  return TRAPPING_MECHANISMS.filter((m) => m.category === category);
}

export function getTrappingMechanismById(id: string): TrappingMechanism | undefined {
  return TRAPPING_MECHANISMS.find((m) => m.id === id);
}

export function getTrappingSafetyGear(): TrappingSafetyItem[] {
  return [...TRAPPING_SAFETY_ITEMS];
}

const MECHANISM_SENSITIVITY_FACTORS: Record<'hair_trigger' | 'moderate' | 'firm', number> = {
  hair_trigger: 0.6,
  moderate: 1.0,
  firm: 1.5,
};

const CORDAGE_FRICTION_FACTORS: Record<CordageType, number> = {
  tarred_bankline: 1.0,
  natural_dogbane: 1.15,
  paracord_inner_core: 0.85,
};

export function calculatePrimitiveTrapping(
  query: TrappingCalculationQuery
): TrappingCalculationResult {
  const mechanism = getTrappingMechanismById(query.mechanismId);
  const mechanismTitle = mechanism ? mechanism.title : 'Custom Primitive Mechanism';

  const quarryInfo = QUARRY_INFO[query.quarry] ?? QUARRY_INFO.snowshoe_hare;
  const quarryName = quarryInfo.name;
  const quarryWeightLbs = quarryInfo.weightLbs;

  const deadfallWeightLbs = query.deadfallWeightLbs;
  const weightRatio = Math.round((deadfallWeightLbs / quarryWeightLbs) * 10) / 10;

  let lethalityStatus: LethalityStatus;
  if (weightRatio >= 5.0) {
    lethalityStatus = 'humane_instant_dispatch';
  } else if (weightRatio >= 3.0) {
    lethalityStatus = 'sufficient';
  } else {
    lethalityStatus = 'underweight_cruelty_risk';
  }

  let sensitivityStatus: SensitivityStatus;
  if (query.notchDepthMm < 3.0) {
    sensitivityStatus = 'hair_trigger_premature_release';
  } else if (query.notchDepthMm <= 6.0) {
    sensitivityStatus = 'optimal_sensitivity';
  } else {
    sensitivityStatus = 'overly_stiff_miss_risk';
  }

  const sensitivityRating = mechanism ? mechanism.sensitivityRating : 'moderate';
  const mechFactor = MECHANISM_SENSITIVITY_FACTORS[sensitivityRating] ?? 1.0;
  const cordageFactor = CORDAGE_FRICTION_FACTORS[query.cordageType] ?? 1.0;

  // Base force: deadfall weight downforce + notch depth engagement
  const baseForce = deadfallWeightLbs * 0.08 + query.notchDepthMm * 0.5;
  const rawTripForce = baseForce * cordageFactor * mechFactor;
  const estimatedTripForceOz = Math.round(rawTripForce * 10) / 10;

  const legalEthicsAdvisory =
    'Primitive deadfalls and snares are strictly regulated under state and federal wildlife conservation laws. These mechanisms are documented solely for extreme survival emergencies or inert educational practice. Never deploy untended live traps in non-emergency wilderness settings.';

  return {
    mechanismTitle,
    quarryName,
    quarryWeightLbs,
    deadfallWeightLbs,
    weightRatio,
    lethalityStatus,
    sensitivityStatus,
    estimatedTripForceOz,
    legalEthicsAdvisory,
  };
}
