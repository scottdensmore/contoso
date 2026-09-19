export interface VolunteerWorkparty {
  id: string;
  title: string;
  trailName: string;
  region: string;
  date: string;
  meetingTime: string;
  durationHours: number;
  difficulty: 'Introductory' | 'Moderate' | 'Strenuous' | 'Backcountry BCR';
  requiredTools: string[];
  providedSafetyGear: string[];
  spotsRemaining: number;
  description: string;
}

export interface VolunteerRegistration {
  id: string; // Format: VOL-XXXXX (e.g. VOL-28491)
  workpartyId: string;
  workpartyTitle: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  dietaryPreferences?: string;
  safetyWaiverSigned: boolean;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface StewardshipHoursLog {
  totalHours: number;
  activeVolunteers: number;
  trailsMaintainedMiles: number;
  treesCleared: number;
  drainageStructuresBuilt: number;
}

export const WORKPARTIES_CATALOG: VolunteerWorkparty[] = [
  {
    id: 'mailbox-drainage',
    title: 'Mailbox Peak Drainage & Turnpike Restoration',
    trailName: 'Mailbox Peak Trail',
    region: 'Cascades',
    date: '2026-10-10',
    meetingTime: '08:30 AM',
    durationHours: 7,
    difficulty: 'Strenuous',
    requiredTools: ['Pulaski', 'McLeod', 'Rock Bar'],
    providedSafetyGear: ['Hardhat', 'Work Gloves', 'Safety Glasses'],
    spotsRemaining: 6,
    description:
      'Restore eroded trail bed, construct timber turnpikes, and clear heavy drainage dips along the high-impact Mailbox Peak trail corridor.',
  },
  {
    id: 'tiger-tread',
    title: 'Tiger Mountain Corridor Brushing & Tread Repair',
    trailName: 'Tiger Mountain Trail',
    region: 'Issaquah Alps',
    date: '2026-10-17',
    meetingTime: '09:00 AM',
    durationHours: 5,
    difficulty: 'Moderate',
    requiredTools: ['Loppers', 'Handsaw', 'Hoe'],
    providedSafetyGear: ['Hardhat', 'Work Gloves', 'Eye Protection'],
    spotsRemaining: 10,
    description:
      'Clear heavy overgrown corridor brush, re-establish outsloped trail tread, and remove loose rock along the popular Tiger Mountain loop.',
  },
  {
    id: 'colchuck-naturalize',
    title: 'Enchantments Alpine Campsite & LNT Naturalization',
    trailName: 'Colchuck Lake Trail',
    region: 'Cascades',
    date: '2026-10-24',
    meetingTime: '07:30 AM',
    durationHours: 8,
    difficulty: 'Backcountry BCR',
    requiredTools: ['Crosscut Saw', 'Pick Mattock'],
    providedSafetyGear: ['Hardhat', 'Gloves', 'Satellite Radio'],
    spotsRemaining: 4,
    description:
      'Backcountry response crew repairing alpine fragile zones, naturalizing illegal social campsites, and reinforcing granite water bars near Colchuck Lake.',
  },
  {
    id: 'hoh-river-blowdown',
    title: 'Olympic Hoh River Blowdown Clearing',
    trailName: 'Hoh River Trail',
    region: 'Olympics',
    date: '2026-11-01',
    meetingTime: '08:00 AM',
    durationHours: 6,
    difficulty: 'Moderate',
    requiredTools: ['Crosscut Saw', 'Peavey', 'Axe'],
    providedSafetyGear: ['Hardhat', 'Work Gloves'],
    spotsRemaining: 8,
    description:
      'Clear winter blowdown timber, buck fallen nurse logs, and restore wilderness tread in the lush Hoh River temperate rain forest corridor.',
  },
  {
    id: 'mount-si-intro',
    title: 'Mount Si Lower Trail Clearing & Turnout Grading',
    trailName: 'Mount Si Trail',
    region: 'Cascades',
    date: '2026-11-07',
    meetingTime: '09:00 AM',
    durationHours: 4,
    difficulty: 'Introductory',
    requiredTools: ['Rake', 'Loppers'],
    providedSafetyGear: ['Hardhat', 'Work Gloves', 'Safety Glasses'],
    spotsRemaining: 12,
    description:
      'Introductory stewardship session for first-time volunteers clearing switchback drainage ditches and raking loose gravel.',
  },
];

export const INITIAL_STEWARDSHIP_IMPACT: StewardshipHoursLog = {
  totalHours: 4280,
  activeVolunteers: 342,
  trailsMaintainedMiles: 128,
  treesCleared: 315,
  drainageStructuresBuilt: 94,
};

export const STORAGE_KEY = 'contoso_volunteer_registrations';

export function getWorkparties(): VolunteerWorkparty[] {
  return WORKPARTIES_CATALOG;
}

export function getWorkpartyById(id: string): VolunteerWorkparty | null {
  return WORKPARTIES_CATALOG.find((wp) => wp.id === id) ?? null;
}

export function getStewardshipImpact(): StewardshipHoursLog {
  return INITIAL_STEWARDSHIP_IMPACT;
}

export function getVolunteerRegistrations(): VolunteerRegistration[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VolunteerRegistration[];
  } catch {
    return [];
  }
}

export function saveVolunteerRegistration(
  reg: Omit<VolunteerRegistration, 'id' | 'createdAt' | 'status'>
): VolunteerRegistration {
  const registrations = getVolunteerRegistrations();
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  const newRegistration: VolunteerRegistration = {
    ...reg,
    id: `VOL-${randomCode}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  const updated = [newRegistration, ...registrations];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
  }

  return newRegistration;
}

export function cancelVolunteerRegistration(id: string): boolean {
  const registrations = getVolunteerRegistrations();
  const index = registrations.findIndex((r) => r.id === id);
  if (index === -1) {
    return false;
  }

  registrations[index] = {
    ...registrations[index],
    status: 'cancelled',
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    } catch {
      // Storage fallback
    }
  }

  return true;
}
