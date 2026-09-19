export type BeaconDeviceType =
  | 'garmin_inreach'
  | 'zoleo'
  | 'spot'
  | 'bivy_stick'
  | 'apple_satellite';

export type BeaconStatus =
  | 'ACTIVE_MONITORING'
  | 'CHECKED_IN'
  | 'OVERDUE'
  | 'DISPATCH_READY';

export type CheckinFrequency = 'daily' | 'twice_daily' | 'checkpoints';

export interface SafetyBeaconRegistration {
  id: string; // Format: SBR-XXXXX (e.g., SBR-84920)
  deviceType: BeaconDeviceType;
  deviceModel: string;
  deviceImei: string;
  ownerName: string;
  ownerPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  tripZone: string;
  departureDate: string;
  returnDate: string;
  checkinFrequency: CheckinFrequency;
  medicalNotes?: string;
  lastCheckinAt?: string;
  status: BeaconStatus;
  createdAt: string;
}

export interface EmergencyProtocol {
  id: string;
  title: string;
  category: 'medical' | 'environmental' | 'wildlife' | 'navigation';
  severity: 'CRITICAL' | 'URGENT' | 'MONITOR';
  summary: string;
  primarySteps: string[];
  sarSignaling: string[];
  dosAndDonts: { do: string[]; dont: string[] };
}

export const DEVICE_PRESETS: Record<
  BeaconDeviceType,
  { id: BeaconDeviceType; name: string; defaultModel: string; network: string }
> = {
  garmin_inreach: {
    id: 'garmin_inreach',
    name: 'Garmin inReach',
    defaultModel: 'Garmin inReach Mini 2 / Messenger',
    network: 'Iridium Satellite Constellation',
  },
  zoleo: {
    id: 'zoleo',
    name: 'ZOLEO Satellite Communicator',
    defaultModel: 'ZOLEO Satellite Communicator',
    network: 'Iridium Satellite Constellation',
  },
  spot: {
    id: 'spot',
    name: 'SPOT Satellite Messenger',
    defaultModel: 'SPOT Gen4 / SPOT X Satellite Messenger',
    network: 'Globalstar Satellite Constellation',
  },
  bivy_stick: {
    id: 'bivy_stick',
    name: 'ACR Bivy Stick',
    defaultModel: 'ACR Bivy Stick 2-Way Satellite Communicator',
    network: 'Iridium Satellite Constellation',
  },
  apple_satellite: {
    id: 'apple_satellite',
    name: 'Apple Satellite SOS',
    defaultModel: 'Apple Emergency SOS via Satellite',
    network: 'Globalstar Satellite Constellation',
  },
};

export const EMERGENCY_PROTOCOLS: EmergencyProtocol[] = [
  {
    id: 'hypothermia',
    title: 'Hypothermia & Cold Shock Protocol',
    category: 'medical',
    severity: 'CRITICAL',
    summary:
      'Immediate field treatment for core body temperature drop, cold immersion shock, and shivering exhaustion in wilderness conditions.',
    primarySteps: [
      '1. Shelter from wind, snow, and rain immediately; isolate the casualty from cold ground using a sleeping pad or bivy sack.',
      '2. Gently remove wet garments and replace with warm, dry synthetic or merino wool layers and an insulated shell.',
      '3. Wrap in a vapor barrier / reflective emergency foil space blanket and full sleeping bag (the "burrito" wrap).',
      '4. Apply chemical heat packs or warm water bottles wrapped in socks to the groin, armpits, and neck (avoid direct bare skin contact).',
      '5. If conscious and able to swallow, provide warm, sweetened, non-caffeinated liquids to restore glycogen levels.',
    ],
    sarSignaling: [
      'Initiate 2-way satellite SOS message with casualty consciousness state, exact coordinates, and active hypothermia symptoms.',
      'Signal rescue aircraft with 3 distinct audible whistle blasts or reflective signal mirror flashes at 1-minute intervals.',
      'Clear a 30x30 ft landing zone and lay out high-visibility orange bivy sack or tarps with weighted rock corners.',
    ],
    dosAndDonts: {
      do: [
        'Handle the casualty extremely gently to avoid triggering ventricular cardiac arrhythmias.',
        'Insulate beneath the casualty with closed-cell foam pads; conduction to frozen ground is the fastest heat-loss pathway.',
        'Monitor respiration and pulse for a full 60 seconds before initiating CPR in severe cases.',
      ],
      dont: [
        'Do NOT aggressively rub or massage cold extremities, as this pushes cold acidic blood back into core organs.',
        'Do NOT administer alcohol, caffeine, or hot fluids if the victim is semiconscious or nauseous.',
        'Do NOT allow the victim to walk or exert themselves after core temperature drop.',
      ],
    },
  },
  {
    id: 'wildlife',
    title: 'Grizzly / Black Bear & Cougar Protocol',
    category: 'wildlife',
    severity: 'URGENT',
    summary:
      'Deterrence, defense, and post-encounter protocols for apex predator encounters in backcountry terrain.',
    primarySteps: [
      '1. Stand ground calmly; unclip bear spray safety clip and maintain eye contact with cougars/black bears (avoid direct staring at grizzlies).',
      '2. Speak in a firm, loud, calm voice; raise arms or trekking poles above head to maximize perceived profile size.',
      '3. If charging within 30-40 feet, deploy bear spray in a downward sweeping 2-3 second burst directly into the animal path.',
      '4. If a defensive grizzly makes contact: drop to ground, interlock fingers behind neck, spread elbows and knees wide, and play dead.',
      '5. If a predatory black bear or cougar attacks: fight back aggressively with trekking poles, rocks, fists, and knives.',
    ],
    sarSignaling: [
      'If predator contact resulted in puncture wounds, severe bleeding, or stalking persistence, trigger SOS beacon immediately.',
      'Broadcast message: "ANIMAL ATTACK - VICTIM INJURED - REPAIR/FIRST AID UNDERWAY - COORDS VERIFIED".',
      'Discharge whistle bursts (3 blasts) to deter secondary approaches and alert nearby backcountry groups.',
    ],
    dosAndDonts: {
      do: [
        'Keep bear spray immediately holstered on chest or waist belt, never inside backpack storage.',
        'Group together tightly if traveling with partners; apex predators rarely attack compact groups of 3+.',
        'Hang bear canisters and food bags at least 100 yards downwind from your sleeping tent site.',
      ],
      dont: [
        'Do NOT run or make sudden fleeing motions; this instantly triggers innate predatory chase reflexes.',
        'Do NOT climb trees to escape grizzlies or cougars, as both species excel at climbing or can out-reach you.',
        'Do NOT play dead if attacked by a cougar or predatory black bear.',
      ],
    },
  },
  {
    id: 'lightning',
    title: 'High-Ridge Lightning Storm Protocol',
    category: 'environmental',
    severity: 'CRITICAL',
    summary:
      'High-elevation storm evasion, lightning crouch positioning, and strike victim resuscitation.',
    primarySteps: [
      '1. Monitor early storm development; descend below exposed ridge-lines, summits, and alpine cirques well before 12:00 PM.',
      '2. Discard metal trekking poles, ice axes, and metallic gear at least 50 feet away from your regroup position.',
      '3. Move away from isolated tall trees, shallow rock alcoves, overhangs, and water drainage channels.',
      '4. Assume the Lightning Crouch: squat low on a foam sleeping pad or dry pack, balls of feet together, hands over ears, head tucked down.',
      '5. Maintain a 30-50 foot spacing distance between expedition members to prevent ground current multi-victim strikes.',
    ],
    sarSignaling: [
      'If lightning strike occurs, immediately check responsiveness and pulse; begin CPR immediately without delay (victims do not carry charge).',
      'Send SOS beacon distress message specifying: "LIGHTNING INJURY - CPR/CARDIAC EMERGENCY - RESCUE REQUIRED".',
      'Deploy fluorescent orange ground markers only once active electrical storm cell has completely moved past.',
    ],
    dosAndDonts: {
      do: [
        'Count seconds between flash and thunder: under 30 seconds means storm is within 6 miles; seek immediate shelter.',
        'Sit on a non-conductive insulating insulator such as a rolled closed-cell foam pad or empty synthetic backpack.',
        'Treat lightning strike victims instantly; "reverse triage" applies because unresponsive victims may recover with immediate CPR.',
      ],
      dont: [
        'Do NOT shelter under isolated trees, metal towers, or shallow cave entrances prone to side-flash sparks.',
        'Do NOT lie flat on the ground; keeping total contact footprint minimal prevents fatal ground potential gradient currents.',
        'Do NOT stay huddled tightly with your group during an electrical storm.',
      ],
    },
  },
  {
    id: 'altitude',
    title: 'Acute Mountain Sickness (AMS) Protocol',
    category: 'medical',
    severity: 'URGENT',
    summary:
      'Recognition and rapid field stabilization of AMS, HAPE, and HACE at elevations above 8,000 feet.',
    primarySteps: [
      '1. Halt ascent immediately upon onset of persistent headache, nausea, dizziness, or fatigue (the classic AMS triad).',
      '2. Assess for High Altitude Pulmonary Edema (HAPE: crackles, cyanosis, rest dyspnea) and Cerebral Edema (HACE: ataxia, confusion).',
      '3. Begin immediate escorted descent of at least 1,500-3,000 feet (descent is the definitive medical cure for altitude sickness).',
      '4. Administer supplemental oxygen if available or place casualty in portable hyperbaric chamber (Gamow bag).',
      '5. Provide hydration, electrolyte replacement, and consider Acetazolamide (Diamox) or Dexamethasone under medical direction.',
    ],
    sarSignaling: [
      'If ataxia (loss of coordination / tandem gait failure) or rest dyspnea is observed, activate satellite SOS immediately.',
      'Message content: "SUSPECTED HACE/HAPE - NON-AMBULATORY - DESCENT IN PROGRESS - NEED HELIVAC".',
      'Prepare coordinates of lowest reachable flat clearing suitable for mountain search and rescue helicopter extraction.',
    ],
    dosAndDonts: {
      do: [
        'Perform the "tandem walk" (heel-to-toe line test); failure to walk in a straight line indicates neurological HACE.',
        'Descend immediately—even a loss of 1,000 feet of altitude can yield rapid clinical improvement.',
        'Never leave an altitude-impaired individual unattended or allow them to descend solo.',
      ],
      dont: [
        'Do NOT ascend further in elevation while symptoms of acute mountain sickness persist.',
        'Do NOT rely on pain relievers (ibuprofen/acetaminophen) to mask severe headaches to continue climbing higher.',
        'Do NOT delay descent waiting for nighttime or weather windows if pulmonary or cerebral symptoms develop.',
      ],
    },
  },
];

export const STORAGE_KEY = 'contoso_safety_beacons';

export function getEmergencyProtocols(): EmergencyProtocol[] {
  return EMERGENCY_PROTOCOLS;
}

export function getBeaconRegistrations(): SafetyBeaconRegistration[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SafetyBeaconRegistration[];
  } catch {
    return [];
  }
}

export function saveBeaconRegistration(
  reg: Omit<SafetyBeaconRegistration, 'id' | 'createdAt' | 'status'>
): SafetyBeaconRegistration {
  const registrations = getBeaconRegistrations();
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  const newRegistration: SafetyBeaconRegistration = {
    ...reg,
    id: `SBR-${randomCode}`,
    deviceModel:
      reg.deviceModel && reg.deviceModel.trim().length > 0
        ? reg.deviceModel
        : DEVICE_PRESETS[reg.deviceType]?.defaultModel || '',
    status: 'ACTIVE_MONITORING',
    createdAt: new Date().toISOString(),
  };

  const updated = [newRegistration, ...registrations];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage quota or restriction fallback
    }
  }

  return newRegistration;
}

export function recordBeaconCheckin(id: string): SafetyBeaconRegistration | null {
  const registrations = getBeaconRegistrations();
  const index = registrations.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updatedRegistration: SafetyBeaconRegistration = {
    ...registrations[index],
    lastCheckinAt: new Date().toISOString(),
    status: 'CHECKED_IN',
  };

  registrations[index] = updatedRegistration;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    } catch {
      // Storage fallback
    }
  }

  return updatedRegistration;
}

export function deleteBeaconRegistration(id: string): boolean {
  const registrations = getBeaconRegistrations();
  const next = registrations.filter((r) => r.id !== id);
  if (next.length === registrations.length) {
    return false;
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage fallback
    }
  }

  return true;
}
