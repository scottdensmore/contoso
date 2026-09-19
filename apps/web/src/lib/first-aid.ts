export type TriageSeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';
export type EvacuationUrgency = 'self_rescue' | 'assisted_walkout' | 'urgent_sar' | 'immediate_helo';
export type MedicalCategory = 'environmental' | 'trauma' | 'medical' | 'bites_stings';

export interface MedicalCondition {
  id: string;
  title: string;
  category: MedicalCategory;
  severity: TriageSeverity;
  symptoms: string[];
  fieldTreatments: string[];
  evacuationUrgency: EvacuationUrgency;
  redFlagSigns: string[];
}

export type FirstAidKitCategory =
  | 'wound_care'
  | 'medications'
  | 'splint_ortho'
  | 'emergency_tools'
  | 'blister_care';

export interface FirstAidKitItem {
  name: string;
  category: FirstAidKitCategory;
  recommendedQty: number;
  essential: boolean;
  notes: string;
}

export interface KitRecommendation {
  partySize: number;
  tripDays: number;
  totalItems: number;
  items: FirstAidKitItem[];
}

export interface TriageAssessmentRequest {
  symptoms: string[];
  injuryType?: string;
  isConscious: boolean;
  canWalk: boolean;
}

export interface TriageAssessmentResult {
  conditionMatch: string;
  severity: TriageSeverity;
  evacuationRecommendation: EvacuationUrgency;
  immediateAction: string;
  steps: string[];
}

export const MEDICAL_CONDITIONS: MedicalCondition[] = [
  {
    id: 'hypothermia',
    title: 'Hypothermia (Cold Exposure)',
    category: 'environmental',
    severity: 'moderate',
    symptoms: [
      'Uncontrollable shivering',
      'Apathy',
      "Fumbling hands ('the umbles')",
      'Slurred speech',
    ],
    fieldTreatments: [
      'Remove wet clothing immediately',
      'Add dry insulating layers and wind/rain shell',
      'Provide warm sweet liquids if conscious',
      'Hypothermia burrito wrap with sleeping bag & pad',
    ],
    evacuationUrgency: 'assisted_walkout',
    redFlagSigns: [
      'Loss of shivering (severe)',
      'Altered mental status',
      'Paradoxical undressing',
    ],
  },
  {
    id: 'heat-exhaustion-stroke',
    title: 'Heat Exhaustion & Heat Stroke',
    category: 'environmental',
    severity: 'severe',
    symptoms: [
      'Heavy sweating or hot dry skin',
      'Dizziness & nausea',
      'Rapid weak pulse',
      'Confusion or headache',
    ],
    fieldTreatments: [
      'Move to shade immediately',
      'Douse body with cool water and fan vigorously',
      'Sip electrolyte fluids',
      'Ice/snow packs in axilla and groin',
    ],
    evacuationUrgency: 'immediate_helo',
    redFlagSigns: [
      'Core temp > 104°F / altered mental status',
      'Cessation of sweating',
      'Seizures or loss of consciousness',
    ],
  },
  {
    id: 'acute-mountain-sickness',
    title: 'Acute Mountain Sickness (AMS) & HAPE/HACE',
    category: 'environmental',
    severity: 'severe',
    symptoms: [
      'Throbbing headache',
      'Fatigue & nausea',
      'Insomnia',
      'Loss of appetite',
    ],
    fieldTreatments: [
      'Stop ascent immediately',
      'Rest and hydrate',
      'Administer ibuprofen / acetazolamide if carried',
      'Descend at least 1,500-3,000 ft immediately if symptoms worsen',
    ],
    evacuationUrgency: 'urgent_sar',
    redFlagSigns: [
      'Ataxia (inability to walk heel-to-toe)',
      'Persistent dry cough / pink frothy sputum (HAPE)',
      'Confusion and hallucination (HACE)',
    ],
  },
  {
    id: 'musculoskeletal-fracture',
    title: 'Sprains, Strains & Extremity Fractures',
    category: 'trauma',
    severity: 'moderate',
    symptoms: [
      'Severe localized pain',
      'Swelling & bruising',
      'Deformity or crepitus',
      'Inability to bear weight',
    ],
    fieldTreatments: [
      'RICE (Rest, Ice/snow, Compress, Elevate)',
      'Immobilize with SAM splint and elastic wrap',
      'Check distal pulse, motor, and sensory (PMS) before and after splinting',
    ],
    evacuationUrgency: 'assisted_walkout',
    redFlagSigns: [
      'Compound fracture (bone protruding)',
      'Loss of distal pulse or cold extremity',
      'Spine or pelvic pain',
    ],
  },
  {
    id: 'anaphylaxis',
    title: 'Severe Allergic Reaction (Anaphylaxis)',
    category: 'medical',
    severity: 'life_threatening',
    symptoms: [
      'Hives & generalized itching',
      'Swelling of lips, tongue, or throat',
      'Wheezing & shortness of breath',
      'Dizziness or fainting',
    ],
    fieldTreatments: [
      'Inject Epinephrine auto-injector (0.3mg adult) into outer mid-thigh immediately',
      'Call 911 / Satellite SOS',
      'Keep patient lying down with legs elevated',
      'Repeat epinephrine after 5-15 mins if no improvement',
    ],
    evacuationUrgency: 'immediate_helo',
    redFlagSigns: [
      'Airway compromise / stridor',
      'Hypotension / circulatory collapse',
    ],
  },
  {
    id: 'pit-viper-envenomation',
    title: 'Pit Viper Snakebite (Rattlesnake)',
    category: 'bites_stings',
    severity: 'severe',
    symptoms: [
      'Fang puncture marks',
      'Immediate intense burning pain',
      'Rapid localized swelling & edema',
      'Metallic taste or tingling sensations',
    ],
    fieldTreatments: [
      'Keep patient calm, reassuring, and completely still',
      'Remove constricting rings, watches, and boots immediately',
      'Immobilize bitten limb at neutral heart level',
      'Do NOT cut, suck, apply tourniquets, or ice the wound',
      'Trigger Satellite SOS for urgent antivenom transport',
    ],
    evacuationUrgency: 'urgent_sar',
    redFlagSigns: [
      'Rapidly advancing swelling (> 1 inch per hour)',
      'Difficulty breathing or swallowing',
      'Spontaneous bruising or systemic shock',
    ],
  },
];

interface BaseKitItemDefinition {
  name: string;
  category: FirstAidKitCategory;
  baseQty: number;
  essential: boolean;
  notes: string;
  scalesWithParty: boolean;
  scalesWithDays: boolean;
}

const KIT_ITEM_DEFINITIONS: BaseKitItemDefinition[] = [
  // Wound Care
  {
    name: 'Sterile Gauze Pads (4x4 in, sterile 2-packs)',
    category: 'wound_care',
    baseQty: 4,
    essential: true,
    notes: 'Direct pressure and sterile dressing for bleeding wounds',
    scalesWithParty: true,
    scalesWithDays: true,
  },
  {
    name: 'Antiseptic Cleansing Wipes (BZK / Alcohol)',
    category: 'wound_care',
    baseQty: 6,
    essential: true,
    notes: 'Irrigation border cleaning and minor wound disinfection',
    scalesWithParty: true,
    scalesWithDays: true,
  },
  {
    name: 'Medical Adhesive Cloth Tape (1 in x 10 yd)',
    category: 'wound_care',
    baseQty: 1,
    essential: true,
    notes: 'Securing dressings, wraps, and splint padding',
    scalesWithParty: false,
    scalesWithDays: false,
  },
  {
    name: 'Butterfly Bandages & Closure Strips',
    category: 'wound_care',
    baseQty: 8,
    essential: true,
    notes: 'Approximating clean laceration wound edges in the field',
    scalesWithParty: true,
    scalesWithDays: true,
  },
  {
    name: 'Heavy-Duty Medical Trauma Shears (7.5 in)',
    category: 'wound_care',
    baseQty: 1,
    essential: true,
    notes: 'Cutting thick clothing, bootlaces, seatbelts, and tape',
    scalesWithParty: false,
    scalesWithDays: false,
  },
  {
    name: 'Wound Irrigation Syringe (20ml curved tip)',
    category: 'wound_care',
    baseQty: 1,
    essential: false,
    notes: 'High-pressure clean water wound decontamination',
    scalesWithParty: false,
    scalesWithDays: false,
  },

  // Medications
  {
    name: 'Ibuprofen 200mg Tablets (NSAID)',
    category: 'medications',
    baseQty: 12,
    essential: true,
    notes: 'Anti-inflammatory for sprains, muscle strains, headache, fever',
    scalesWithParty: true,
    scalesWithDays: true,
  },
  {
    name: 'Diphenhydramine 25mg (Antihistamine / Benadryl)',
    category: 'medications',
    baseQty: 6,
    essential: true,
    notes: 'Allergic reactions, insect stings, itching, mild hives',
    scalesWithParty: true,
    scalesWithDays: true,
  },
  {
    name: 'Acetaminophen 500mg (Analgesic)',
    category: 'medications',
    baseQty: 8,
    essential: false,
    notes: 'Secondary pain relief and fever management',
    scalesWithParty: true,
    scalesWithDays: true,
  },
  {
    name: 'Loperamide 2mg (Anti-Diarrheal)',
    category: 'medications',
    baseQty: 6,
    essential: true,
    notes: 'Prevents severe dehydration from backcountry traveler diarrhea',
    scalesWithParty: true,
    scalesWithDays: true,
  },
  {
    name: 'Oral Rehydration Salts (ORS electrolyte packets)',
    category: 'medications',
    baseQty: 2,
    essential: true,
    notes: 'Critical therapy for heat exhaustion and gastrointestinal fluid loss',
    scalesWithParty: true,
    scalesWithDays: true,
  },

  // Splints & Orthopedics
  {
    name: 'SAM Splint (36 in malleable aluminum/foam)',
    category: 'splint_ortho',
    baseQty: 1,
    essential: true,
    notes: 'Immobilizing extremity fractures, wrist sprains, and ankle trauma',
    scalesWithParty: true,
    scalesWithDays: false,
  },
  {
    name: 'Elastic Compression Bandage (3 in ACE wrap)',
    category: 'splint_ortho',
    baseQty: 2,
    essential: true,
    notes: 'Compression wrap for joint sprains and securing splints',
    scalesWithParty: true,
    scalesWithDays: false,
  },
  {
    name: 'Triangular Bandage / Muslin Cravat (40x40x56 in)',
    category: 'splint_ortho',
    baseQty: 2,
    essential: true,
    notes: 'Arm sling, swathe for shoulder dislocation, or splint anchor',
    scalesWithParty: true,
    scalesWithDays: false,
  },

  // Emergency Tools & Barriers
  {
    name: 'Reflective Space Emergency Blanket / Bivvy',
    category: 'emergency_tools',
    baseQty: 1,
    essential: true,
    notes: 'Hypothermia burrito layer, weather shelter, and radar reflection',
    scalesWithParty: true,
    scalesWithDays: false,
  },
  {
    name: 'Nitrile Medical Examination Gloves (Pairs)',
    category: 'emergency_tools',
    baseQty: 2,
    essential: true,
    notes: 'Bodily fluid barrier and infection control during treatment',
    scalesWithParty: true,
    scalesWithDays: true,
  },
  {
    name: 'CPR Pocket Face Shield with One-Way Valve',
    category: 'emergency_tools',
    baseQty: 1,
    essential: true,
    notes: 'Safe rescue breathing barrier for cardiac/respiratory arrest',
    scalesWithParty: false,
    scalesWithDays: false,
  },
  {
    name: 'Fine-Tipped Splinter & Tick Tweezers',
    category: 'emergency_tools',
    baseQty: 1,
    essential: true,
    notes: 'Precision removal of embedded ticks, splinters, and cactus spines',
    scalesWithParty: false,
    scalesWithDays: false,
  },
  {
    name: 'Wilderness Medical Protocol Field Guide (Waterproof)',
    category: 'emergency_tools',
    baseQty: 1,
    essential: true,
    notes: 'Quick-reference diagnostic algorithms and CPR/evac protocols',
    scalesWithParty: false,
    scalesWithDays: false,
  },

  // Blister Care
  {
    name: 'Moleskin & Hydrocolloid Blister Pads (Pre-Cut)',
    category: 'blister_care',
    baseQty: 6,
    essential: true,
    notes: 'Friction relief, hotspot prevention, and second-skin blister healing',
    scalesWithParty: true,
    scalesWithDays: true,
  },
  {
    name: 'Leukotape P Rigid Athletic / Friction Tape (1.5 in)',
    category: 'blister_care',
    baseQty: 1,
    essential: true,
    notes: 'High-adhesion tape for friction hotspots and preventative taping',
    scalesWithParty: false,
    scalesWithDays: false,
  },
  {
    name: 'Tincture of Benzoin Skin Adherent Ampoules',
    category: 'blister_care',
    baseQty: 2,
    essential: false,
    notes: 'Preps wet/sweaty skin so tape adheres securely in harsh weather',
    scalesWithParty: true,
    scalesWithDays: true,
  },
];

export function getMedicalConditions(
  category?: MedicalCategory,
  severity?: TriageSeverity
): MedicalCondition[] {
  let conditions = [...MEDICAL_CONDITIONS];

  if (category) {
    conditions = conditions.filter((c) => c.category === category);
  }

  if (severity) {
    conditions = conditions.filter((c) => c.severity === severity);
  }

  return conditions;
}

export function getMedicalConditionById(id: string): MedicalCondition | undefined {
  return MEDICAL_CONDITIONS.find((c) => c.id === id);
}

export function calculateFirstAidKit(partySize: number, tripDays: number): KitRecommendation {
  // Clamp values: party size 1 to 12, trip days 1 to 14
  const clampedParty = Math.min(Math.max(1, Math.round(partySize || 1)), 12);
  const clampedDays = Math.min(Math.max(1, Math.round(tripDays || 1)), 14);

  const partyFactor = Math.ceil(clampedParty / 2);
  const dayFactor = Math.ceil(clampedDays / 3);

  const items: FirstAidKitItem[] = KIT_ITEM_DEFINITIONS.map((def) => {
    let qty = def.baseQty;

    if (def.name.includes('Emergency Blanket')) {
      qty = Math.max(1, clampedParty);
    } else if (def.name.includes('SAM Splint')) {
      qty = Math.max(1, Math.floor((clampedParty - 1) / 4) + 1);
    } else if (def.scalesWithParty && def.scalesWithDays) {
      qty = def.baseQty * partyFactor * dayFactor;
    } else if (def.scalesWithParty) {
      qty = def.baseQty * partyFactor;
    }

    return {
      name: def.name,
      category: def.category,
      recommendedQty: qty,
      essential: def.essential,
      notes: def.notes,
    };
  });

  const totalItems = items.reduce((sum, i) => sum + i.recommendedQty, 0);

  return {
    partySize: clampedParty,
    tripDays: clampedDays,
    totalItems,
    items,
  };
}

export function assessTriage(request: TriageAssessmentRequest): TriageAssessmentResult {
  const { symptoms, injuryType, isConscious, canWalk } = request;

  // 1. Unconscious or altered consciousness is an immediate, critical life threat
  if (!isConscious) {
    return {
      conditionMatch: 'Unconscious / Severe Neurological Emergency',
      severity: 'life_threatening',
      evacuationRecommendation: 'immediate_helo',
      immediateAction:
        'Protect airway immediately (recovery position or jaw-thrust), verify breathing, and trigger Satellite SOS.',
      steps: [
        'Activate Satellite SOS beacon (Garmin inReach / Apple SOS) with high-priority life-threat notification.',
        'Clear and protect airway: place patient in lateral recovery position unless spinal injury is suspected.',
        'Assess respiration and carotid pulse: begin immediate CPR (30 compressions : 2 breaths) if no breathing.',
        'Insulate patient from frozen ground using sleeping pad, thermal bivvy, and extra clothing layers.',
        'Prepare 100x100 ft flat obstacle-free Helicopter Landing Zone (LZ) for immediate medevac insertion.',
      ],
    };
  }

  // 2. Anaphylaxis (severe systemic allergic reaction)
  const isAnaphylaxis =
    injuryType === 'anaphylaxis' ||
    symptoms.some((s) => {
      const lower = s.toLowerCase();
      return (
        lower.includes('anaphylaxis') ||
        lower.includes('lip') ||
        lower.includes('throat') ||
        lower.includes('tongue') ||
        lower.includes('wheezing') ||
        lower.includes('stridor')
      );
    });

  if (isAnaphylaxis) {
    return {
      conditionMatch: 'Severe Allergic Reaction (Anaphylaxis)',
      severity: 'life_threatening',
      evacuationRecommendation: 'immediate_helo',
      immediateAction:
        'Inject Epinephrine auto-injector (0.3mg adult) into outer mid-thigh immediately and trigger Satellite SOS.',
      steps: [
        'Administer Epinephrine auto-injector (0.3mg adult dose) into anterolateral mid-thigh; hold firmly for 5 seconds.',
        'Trigger Satellite SOS / emergency dispatch immediately reporting severe anaphylactic airway compromise.',
        'Position patient supine with legs elevated 12 inches for shock; allow sitting upright only if severe dyspnea.',
        'Administer oral antihistamine (Diphenhydramine 50mg) only if patient remains alert with intact swallow reflex.',
        'Monitor airway closely and prepare second epinephrine dose in 5 to 15 minutes if symptoms persist.',
      ],
    };
  }

  // 3. Heat exhaustion / heat stroke
  const isHeatStroke =
    injuryType === 'heat-exhaustion-stroke' ||
    symptoms.some((s) => {
      const lower = s.toLowerCase();
      return (
        lower.includes('heat') ||
        lower.includes('dry skin') ||
        lower.includes('seizures') ||
        lower.includes('confusion')
      );
    });

  if (isHeatStroke) {
    const isSevereHeat = !canWalk || symptoms.some((s) => s.toLowerCase().includes('confusion'));
    return {
      conditionMatch: 'Heat Exhaustion & Heat Stroke',
      severity: 'severe',
      evacuationRecommendation: isSevereHeat ? 'immediate_helo' : 'urgent_sar',
      immediateAction:
        'Aggressively cool patient immediately with cold water dousing, fanning, and ice packs to groin/axilla.',
      steps: [
        'Move patient out of direct sunlight immediately into full shade.',
        'Douse clothing and skin with cold water and fan vigorously to produce rapid evaporative cooling.',
        'Place cold packs, snow, or wet compresses in axilla (armpits) and femoral (groin) heat-exchange zones.',
        'Administer cool electrolyte fluids in small sips if conscious and alert; withhold fluids if vomitous or stuporous.',
        'Transmit emergency SOS coordinates if core body temperature remains elevated or confusion persists.',
      ],
    };
  }

  // 4. Acute Mountain Sickness (AMS) / HAPE / HACE
  const isAltitude =
    injuryType === 'acute-mountain-sickness' ||
    symptoms.some((s) => {
      const lower = s.toLowerCase();
      return (
        lower.includes('mountain') ||
        lower.includes('altitude') ||
        lower.includes('ataxia') ||
        lower.includes('sputum') ||
        lower.includes('headache')
      );
    });

  if (isAltitude) {
    const isCriticalAltitude =
      !canWalk ||
      symptoms.some((s) => {
        const lower = s.toLowerCase();
        return lower.includes('ataxia') || lower.includes('sputum') || lower.includes('cough');
      });

    return {
      conditionMatch: 'Acute Mountain Sickness (AMS) & HAPE/HACE',
      severity: 'severe',
      evacuationRecommendation: isCriticalAltitude ? 'urgent_sar' : 'assisted_walkout',
      immediateAction:
        'Stop ascent immediately; descend at least 1,500 to 3,000 ft without delay — descent is the definitive cure.',
      steps: [
        'Cease all upward travel immediately. Never climb higher with active symptoms of mountain sickness.',
        'Begin assisted or supported descent immediately to lower elevations (minimum 1,500 - 3,000 ft drop).',
        'Administer Ibuprofen (600mg) for high-altitude headache and encourage hydration with electrolyte solution.',
        'If carrying emergency medications (Acetazolamide / Dexamethasone), administer per wilderness medical protocol.',
        'Coordinate urgent Search & Rescue evacuation if patient displays ataxia (loss of balance) or pink sputum.',
      ],
    };
  }

  // 5. Musculoskeletal injury / fracture
  const isTrauma =
    injuryType === 'musculoskeletal-fracture' ||
    symptoms.some((s) => {
      const lower = s.toLowerCase();
      return (
        lower.includes('fracture') ||
        lower.includes('sprain') ||
        lower.includes('bone') ||
        lower.includes('joint') ||
        lower.includes('pain') ||
        lower.includes('swelling')
      );
    });

  if (isTrauma) {
    if (!canWalk) {
      return {
        conditionMatch: 'Sprains, Strains & Extremity Fractures',
        severity: 'moderate',
        evacuationRecommendation: 'assisted_walkout',
        immediateAction:
          'Immobilize injured extremity with padded SAM splint, evaluate distal circulation, and arrange assisted transport.',
        steps: [
          'Assess distal Circulation, Motor, and Sensory (CMS/PMS) function in extremities before touching the limb.',
          'Form SAM splint into structural C-curve or sugar-tong fold and mold securely around injured joint.',
          'Wrap securely with elastic bandage; do not occlude arterial pulse or produce distal numbness.',
          'Re-check distal CMS/PMS after wrapping to confirm blood flow remains intact.',
          'Fashion improvised litter or coordinate assisted walkout with team members assisting weight transfer.',
        ],
      };
    }

    return {
      conditionMatch: 'Sprains, Strains & Extremity Fractures',
      severity: 'mild',
      evacuationRecommendation: 'self_rescue',
      immediateAction:
        'Apply RICE protocol (Rest, Ice/cold, Compress, Elevate), support with elastic bandage, and trek out using poles.',
      steps: [
        'Rest and evaluate joint range of motion and weight-bearing capability.',
        'Apply cold compress or snow packed in plastic bag for 15-20 minutes to limit swelling.',
        'Wrap with elastic bandage in figure-eight pattern for joint stability without restricting circulation.',
        'Use dual trekking poles to offload body weight from the injured side.',
        'Take Ibuprofen (400-600mg) with food to reduce inflammation and self-evacuate conservatively.',
      ],
    };
  }

  // 6. Hypothermia
  const isHypothermia =
    injuryType === 'hypothermia' ||
    symptoms.some((s) => {
      const lower = s.toLowerCase();
      return (
        lower.includes('shivering') ||
        lower.includes('cold') ||
        lower.includes('umbles') ||
        lower.includes('speech')
      );
    });

  if (isHypothermia) {
    return {
      conditionMatch: 'Hypothermia (Cold Exposure)',
      severity: canWalk ? 'mild' : 'moderate',
      evacuationRecommendation: canWalk ? 'self_rescue' : 'assisted_walkout',
      immediateAction:
        'Remove wet clothing immediately, insulate patient in hypothermia burrito wrap, and supply warm caloric fluids.',
      steps: [
        'Strip off cold, damp, or saturated garments down to dry base layer.',
        'Wrap patient in sleeping bag inside waterproof tarp or foil bivvy with closed-cell foam pad beneath.',
        'Provide warm sweet drinks (warm tea, sweetened broth) if patient is alert and able to swallow.',
        'Place warm water bottles wrapped in wool socks against lateral chest wall and armpits.',
        canWalk
          ? 'Once shivering ceases and mental sharpness returns, trek out briskly to maintain body heat.'
          : 'Arrange assisted trail walkout or litters if patient cannot support own body weight.',
      ],
    };
  }

  // 7. General fallback
  if (!canWalk) {
    return {
      conditionMatch: 'Immobilizing Backcountry Injury / Medical Incident',
      severity: 'moderate',
      evacuationRecommendation: 'assisted_walkout',
      immediateAction:
        'Immobilize casualty, shelter against elements, and prepare for assisted evacuation.',
      steps: [
        'Keep patient warm, sheltered from wind and precipitation, and hydrated.',
        'Conduct secondary head-to-toe physical assessment for hidden trauma or worsening vitals.',
        'Communicate coordinates to emergency contacts or rangers via two-way satellite messenger.',
        'Coordinate litter carry or assisted evacuation with trail rescue volunteers.',
      ],
    };
  }

  return {
    conditionMatch: 'Minor Wilderness Incident',
    severity: 'mild',
    evacuationRecommendation: 'self_rescue',
    immediateAction:
      'Administer basic first aid, maintain hydration and calorie intake, and monitor symptoms during self-rescue.',
    steps: [
      'Clean and dress minor wounds or abrasions using antiseptic wipes and sterile bandages.',
      'Maintain adequate hydration, electrolytes, and calorie intake.',
      'Travel in pairs or party formation at an easy pace toward the trailhead.',
    ],
  };
}
