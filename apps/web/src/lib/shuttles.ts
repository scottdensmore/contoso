export interface ShuttleRoute {
  id: string;
  name: string;
  region: string;
  departureLocation: string;
  arrivalTrailhead: string;
  durationMinutes: number;
  pricePerSeat: number;
  scheduleDays: string[];
  departureTimes: string[];
  isThroughHikeConnector: boolean;
  parkingAdvice: string;
}

export interface ShuttleReservation {
  id: string; // Format: SHT-XXXXX (e.g. SHT-48291)
  routeId: string;
  routeName: string;
  departureDate: string;
  departureTime: string;
  seats: number;
  totalPrice: number;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface CarpoolListing {
  id: string; // Format: CPL-XXXXX
  originCity: string;
  destinationTrailhead: string;
  departureDate: string;
  seatsAvailable: number;
  driverName: string;
  driverContact: string;
  notes: string;
  createdAt: string;
}

export const SHUTTLE_ROUTES: ShuttleRoute[] = [
  {
    id: 'enchantments-connector',
    name: 'Enchantments Through-Hike Connector',
    region: 'Cascades',
    departureLocation: 'Snow Lakes Trailhead',
    arrivalTrailhead: 'Stuart/Colchuck Trailhead',
    durationMinutes: 35,
    pricePerSeat: 30,
    scheduleDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    departureTimes: ['05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM'],
    isThroughHikeConnector: true,
    parkingAdvice:
      'Leave vehicle at Snow Lakes exit trailhead; take morning shuttle to Stuart Lake entrance to avoid parking congestion and vehicle retrieval.',
  },
  {
    id: 'rainier-express',
    name: 'Mount Rainier Skyline & Paradise Shuttle',
    region: 'Rainier',
    departureLocation: 'Ashford Gateway',
    arrivalTrailhead: 'Paradise Visitor Center',
    durationMinutes: 45,
    pricePerSeat: 25,
    scheduleDays: ['Friday', 'Saturday', 'Sunday'],
    departureTimes: ['07:00 AM', '08:30 AM', '10:00 AM', '01:00 PM'],
    isThroughHikeConnector: false,
    parkingAdvice:
      'Peak summer timed-entry and lot congestion at Paradise; shuttle bypasses main gate parking queues.',
  },
  {
    id: 'olympic-coast',
    name: 'Olympic Coast Wilderness Transit',
    region: 'Olympic',
    departureLocation: 'Forks Transit Center',
    arrivalTrailhead: 'Rialto Beach / Ozette',
    durationMinutes: 55,
    pricePerSeat: 35,
    scheduleDays: ['Monday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    departureTimes: ['06:30 AM', '09:00 AM', '01:30 PM'],
    isThroughHikeConnector: true,
    parkingAdvice:
      'Tide-dependent coastal access; parking at Rialto Beach fills by mid-morning.',
  },
  {
    id: 'rockies-loop',
    name: 'Colorado Continental Divide Shuttle',
    region: 'Rockies',
    departureLocation: 'Estes Park',
    arrivalTrailhead: 'Bear Lake & Glacier Gorge',
    durationMinutes: 30,
    pricePerSeat: 20,
    scheduleDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    departureTimes: ['06:00 AM', '07:30 AM', '09:00 AM', '11:00 AM'],
    isThroughHikeConnector: false,
    parkingAdvice:
      'Bear Lake Road corridor requires timed-entry permits unless arriving via regional transit shuttle.',
  },
];

export const INITIAL_CARPOOL_LISTINGS: CarpoolListing[] = [
  {
    id: 'CPL-10492',
    originCity: 'Seattle',
    destinationTrailhead: 'Snow Lakes Trailhead',
    departureDate: '2026-10-03',
    seatsAvailable: 3,
    driverName: 'Marcus Vance',
    driverContact: 'marcus.vance@example.com',
    notes: 'Early morning drive from Green Lake P&R for a 1-day Enchantments thru-run.',
    createdAt: '2026-09-18T14:30:00.000Z',
  },
  {
    id: 'CPL-28491',
    originCity: 'Tacoma',
    destinationTrailhead: 'Paradise Trailhead',
    departureDate: '2026-10-04',
    seatsAvailable: 2,
    driverName: 'Sarah Chen',
    driverContact: '555-0144',
    notes: 'Heading up for Skyline Trail loop and Camp Muir day hike. Split park entrance fee.',
    createdAt: '2026-09-18T16:15:00.000Z',
  },
  {
    id: 'CPL-39201',
    originCity: 'Denver',
    destinationTrailhead: 'Bear Lake Trailhead',
    departureDate: '2026-10-05',
    seatsAvailable: 4,
    driverName: "Liam O'Connor",
    driverContact: 'liam.oc@example.com',
    notes: 'Subaru Outback with national park pass. Heading out early to catch sunrise at Dream Lake.',
    createdAt: '2026-09-19T07:00:00.000Z',
  },
];

export const RESERVATIONS_STORAGE_KEY = 'contoso_shuttle_reservations';
export const CARPOOL_STORAGE_KEY = 'contoso_carpool_listings';

export function getShuttleRoutes(): ShuttleRoute[] {
  return SHUTTLE_ROUTES;
}

export function getShuttleRouteById(id: string): ShuttleRoute | null {
  return SHUTTLE_ROUTES.find((route) => route.id === id) ?? null;
}

export function calculateShuttleCost(pricePerSeat: number, seats: number): number {
  if (seats <= 0 || isNaN(seats)) {
    return 0;
  }
  return Math.max(0, pricePerSeat * seats);
}

export function getShuttleReservations(): ShuttleReservation[] {
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

export function saveShuttleReservation(
  res: Omit<ShuttleReservation, 'id' | 'createdAt' | 'status'>
): ShuttleReservation {
  const reservations = getShuttleReservations();
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  const newReservation: ShuttleReservation = {
    ...res,
    id: `SHT-${randomCode}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  const updated = [newReservation, ...reservations];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
  }

  return newReservation;
}

export function cancelShuttleReservation(id: string): boolean {
  const reservations = getShuttleReservations();
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

export function getCarpoolListings(): CarpoolListing[] {
  if (typeof window === 'undefined') {
    return INITIAL_CARPOOL_LISTINGS;
  }
  try {
    const raw = localStorage.getItem(CARPOOL_STORAGE_KEY);
    if (!raw) return INITIAL_CARPOOL_LISTINGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_CARPOOL_LISTINGS;
  } catch {
    return INITIAL_CARPOOL_LISTINGS;
  }
}

export function saveCarpoolListing(
  listing: Omit<CarpoolListing, 'id' | 'createdAt'>
): CarpoolListing {
  const listings = getCarpoolListings();
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  const newListing: CarpoolListing = {
    ...listing,
    id: `CPL-${randomCode}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newListing, ...listings];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CARPOOL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
  }

  return newListing;
}
