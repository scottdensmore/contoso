export interface RentalPackage {
  id: string;
  name: string;
  category: 'camping' | 'backpacking' | 'paddling' | 'winter';
  dailyRate: number;
  deposit: number;
  description: string;
  specs: string[];
  image: string;
}

export interface RentalCalculation {
  days: number;
  dailyRate: number;
  baseSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  deposit: number;
  totalDue: number;
}

export interface RentalReservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  packageId: string;
  packageName: string;
  storeId: string;
  storeName: string;
  startDate: string;
  endDate: string;
  days: number;
  totalDue: number;
  deposit: number;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
}

export interface RentalStore {
  id: string;
  name: string;
  address: string;
}

export const RENTAL_STORES: RentalStore[] = [
  { id: 'seattle', name: 'Seattle Flagship', address: '1201 3rd Ave, Seattle, WA 98101' },
  { id: 'denver', name: 'Denver Downtown', address: '1600 California St, Denver, CO 80202' },
  { id: 'portland', name: 'Portland Outdoor', address: '700 SW 5th Ave, Portland, OR 97204' },
  { id: 'salt-lake', name: 'Salt Lake Outpost', address: '50 S Main St, Salt Lake City, UT 84101' },
];

export const RENTAL_PACKAGES: RentalPackage[] = [
  {
    id: 'camp-bundle-4p',
    name: '4-Person Deluxe Camping Package',
    category: 'camping',
    dailyRate: 45,
    deposit: 100,
    description:
      'Complete family or small group camping outfit with heavy-duty weather protection and cozy sleeping gear.',
    specs: [
      '4-person weatherproof tent',
      '2 queen airbeds',
      '2 dual-burner camp stoves',
      '4 LED lanterns',
    ],
    image: 'rentals-camping-bundle',
  },
  {
    id: 'backpack-ultralight',
    name: 'Ultralight Backpacking Kit',
    category: 'backpacking',
    dailyRate: 35,
    deposit: 75,
    description:
      'Sub-30lb full kit designed for weekend alpine trekking and thru-hiking adventures.',
    specs: [
      '65L technical backpack',
      '1-person ultralight tent',
      'Down 20°F sleeping bag',
      'Pocket camp stove',
    ],
    image: 'rentals-backpacking-kit',
  },
  {
    id: 'kayak-touring-set',
    name: 'Touring Kayak & Paddle Set',
    category: 'paddling',
    dailyRate: 50,
    deposit: 150,
    description:
      'High-stability coastal and lake touring setup with premium paddle and safety equipment.',
    specs: [
      '12ft sit-inside kayak',
      'Carbon fiber paddle',
      'Type III PFD life vest',
      'Waterproof dry bag',
    ],
    image: 'rentals-kayak-set',
  },
  {
    id: 'snowshoe-alpine-kit',
    name: 'Alpine Snowshoe & Pole Kit',
    category: 'winter',
    dailyRate: 25,
    deposit: 50,
    description:
      'Deep powder and icy crust snowshoeing outfit with rugged crampons and adjustable poles.',
    specs: [
      'All-terrain aluminum snowshoes',
      'Telescoping trekking poles',
      'Gaiters set',
    ],
    image: 'rentals-snowshoe-kit',
  },
];

export function calculateRentalDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const [y1, m1, d1] = startDate.split('-').map(Number);
  const [y2, m2, d2] = endDate.split('-').map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 0;
  const start = new Date(y1, m1 - 1, d1);
  const end = new Date(y2, m2 - 1, d2);
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function calculateRentalCost(
  dailyRate: number,
  days: number,
  deposit: number = 0,
): RentalCalculation {
  const validDays = Math.max(0, Math.floor(days));
  let discountPercent = 0;
  if (validDays >= 7) {
    discountPercent = 20;
  } else if (validDays >= 3) {
    discountPercent = 10;
  }

  const baseSubtotal = dailyRate * validDays;
  const discountAmount = Math.round((baseSubtotal * discountPercent) / 100);
  const subtotal = baseSubtotal - discountAmount;
  const totalDue = subtotal + deposit;

  return {
    days: validDays,
    dailyRate,
    baseSubtotal,
    discountPercent,
    discountAmount,
    subtotal,
    deposit,
    totalDue,
  };
}

const STORAGE_KEY = 'contoso_rental_reservations';

export function getRentalReservations(): RentalReservation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getRentalReservationById(id: string): RentalReservation | null {
  const reservations = getRentalReservations();
  return reservations.find((r) => r.id === id) ?? null;
}

export function saveRentalReservation(
  reservation: Omit<RentalReservation, 'id' | 'createdAt' | 'status'>,
): RentalReservation {
  const id = `RNT-${Math.floor(10000 + Math.random() * 90000)}`;
  const fullReservation: RentalReservation = {
    ...reservation,
    id,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  };

  if (typeof window !== 'undefined') {
    try {
      const current = getRentalReservations();
      const updated = [...current, fullReservation];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // safe fallback
    }
  }

  return fullReservation;
}
