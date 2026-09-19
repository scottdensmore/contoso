export interface AlpineHut {
  id: string;
  name: string;
  mountainRange: string;
  elevationFeet: number;
  capacityBunks: number;
  pricePerNight: number;
  amenities: string[];
  accessDifficulty: 'Moderate' | 'Strenuous' | 'Technical';
  mandatoryGear: string[];
  description: string;
}

export interface HutReservation {
  id: string; // Format: HUT-XXXXX (e.g. HUT-39281)
  hutId: string;
  hutName: string;
  checkInDate: string;
  nights: number;
  guests: number;
  pricePerNight: number;
  totalPrice: number;
  leadGuestName: string;
  leadGuestEmail: string;
  leadGuestPhone: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export const ALPINE_HUTS: AlpineHut[] = [
  {
    id: 'asgard-refuge',
    name: 'Asgard Pass High Alpine Refuge',
    mountainRange: 'Cascades',
    elevationFeet: 7850,
    capacityBunks: 12,
    pricePerNight: 45,
    amenities: ['Wood Stove', 'Solar Lighting', 'Composting Toilet', 'Snow Melt Cistern'],
    accessDifficulty: 'Strenuous',
    mandatoryGear: ['Sleeping Bag Liner', 'Headlamp', 'Microspikes'],
    description:
      'High-alpine stone refuge perched near the col of Asgard Pass in the Stuart Range. Provides dependable shelter from unpredictable Cascadian alpine squalls.',
  },
  {
    id: 'mueller-ridge',
    name: 'Mueller Ridge Backcountry Cabin',
    mountainRange: 'Olympic',
    elevationFeet: 5400,
    capacityBunks: 8,
    pricePerNight: 35,
    amenities: ['Propane Cooktop', 'Rainwater Catchment', 'Bear Proof Storage'],
    accessDifficulty: 'Moderate',
    mandatoryGear: ['Sleeping Bag Liner', 'Water Filter'],
    description:
      'Nestled among alpine meadows and subalpine fir in the Olympic range. Features secure food lockers and high-capacity rainwater harvesting.',
  },
  {
    id: 'cirque-towers',
    name: 'Cirque of the Towers Alpine Shelter',
    mountainRange: 'Wind River',
    elevationFeet: 10200,
    capacityBunks: 6,
    pricePerNight: 50,
    amenities: ['Solar Radio Beacon', 'Bunk Mats', 'First Aid Station'],
    accessDifficulty: 'Technical',
    mandatoryGear: ['Sleeping Bag Liner', 'Helmet', 'Satellite Communicator'],
    description:
      'Remote shelter situated directly below towering granite spires deep in the Wind River Range. Requires technical talus navigation and route-finding.',
  },
  {
    id: 'red-mountain-yurt',
    name: 'Red Mountain Backcountry Yurt',
    mountainRange: 'San Juan',
    elevationFeet: 11200,
    capacityBunks: 10,
    pricePerNight: 40,
    amenities: ['Wood Stove', 'Kitchenette', 'Fire Pit', 'Sauna Tent'],
    accessDifficulty: 'Strenuous',
    mandatoryGear: ['Sleeping Bag Liner', 'Avalanche Beacon', 'Shovel', 'Probe'],
    description:
      'Four-season insulated yurt in the San Juan Mountains off Red Mountain Pass. Premier basecamp for alpine ski mountaineering and high-ridge traverses.',
  },
];

export const RESERVATIONS_STORAGE_KEY = 'contoso_hut_reservations';

export function getAlpineHuts(): AlpineHut[] {
  return ALPINE_HUTS;
}

export function getAlpineHutById(id: string): AlpineHut | null {
  return ALPINE_HUTS.find((hut) => hut.id === id) ?? null;
}

export function calculateHutCost(
  pricePerNight: number,
  nights: number,
  guests: number
): number {
  if (
    nights <= 0 ||
    guests <= 0 ||
    isNaN(nights) ||
    isNaN(guests) ||
    isNaN(pricePerNight) ||
    pricePerNight <= 0
  ) {
    return 0;
  }
  return Math.max(0, pricePerNight * nights * guests);
}

export function getHutReservations(): HutReservation[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHutReservation(
  res: Omit<HutReservation, 'id' | 'createdAt' | 'status'>
): HutReservation {
  const reservations = getHutReservations();
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  const newReservation: HutReservation = {
    ...res,
    id: `HUT-${randomCode}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  const updated = [newReservation, ...reservations];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage quota or privacy fallback
    }
  }

  return newReservation;
}

export function cancelHutReservation(id: string): boolean {
  const reservations = getHutReservations();
  const index = reservations.findIndex((r) => r.id === id);
  if (index === -1) return false;

  reservations[index] = {
    ...reservations[index],
    status: 'cancelled',
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
    } catch {
      // Storage fallback
    }
  }

  return true;
}
