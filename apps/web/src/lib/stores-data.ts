export interface StoreLocation {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  hours: {
    mondayFriday: string;
    saturday: string;
    sunday: string;
  };
  hasPickup: boolean;
  hasGearRental: boolean;
}

export const STORES: StoreLocation[] = [
  {
    id: "store-seattle",
    name: "Seattle Flagship",
    slug: "seattle-flagship",
    address: "1201 3rd Ave",
    city: "Seattle",
    state: "WA",
    zipCode: "98101",
    phone: "(206) 555-0100",
    hours: {
      mondayFriday: "9:00 AM - 8:00 PM",
      saturday: "10:00 AM - 7:00 PM",
      sunday: "11:00 AM - 6:00 PM",
    },
    hasPickup: true,
    hasGearRental: true,
  },
  {
    id: "store-denver",
    name: "Denver Mountain Outpost",
    slug: "denver-mountain-outpost",
    address: "1600 California St",
    city: "Denver",
    state: "CO",
    zipCode: "80202",
    phone: "(303) 555-0145",
    hours: {
      mondayFriday: "9:00 AM - 8:00 PM",
      saturday: "10:00 AM - 7:00 PM",
      sunday: "11:00 AM - 5:00 PM",
    },
    hasPickup: true,
    hasGearRental: true,
  },
  {
    id: "store-portland",
    name: "Portland Trailhead",
    slug: "portland-trailhead",
    address: "700 SW 5th Ave",
    city: "Portland",
    state: "OR",
    zipCode: "97204",
    phone: "(503) 555-0182",
    hours: {
      mondayFriday: "10:00 AM - 7:00 PM",
      saturday: "10:00 AM - 6:00 PM",
      sunday: "11:00 AM - 5:00 PM",
    },
    hasPickup: true,
    hasGearRental: false,
  },
  {
    id: "store-salt-lake",
    name: "Salt Lake City Basecamp",
    slug: "salt-lake-city-basecamp",
    address: "50 S Main St",
    city: "Salt Lake City",
    state: "UT",
    zipCode: "84101",
    phone: "(801) 555-0199",
    hours: {
      mondayFriday: "9:30 AM - 8:00 PM",
      saturday: "10:00 AM - 7:00 PM",
      sunday: "Closed",
    },
    hasPickup: true,
    hasGearRental: true,
  },
  {
    id: "store-san-francisco",
    name: "San Francisco Bay",
    slug: "san-francisco-bay",
    address: "865 Market St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94103",
    phone: "(415) 555-0123",
    hours: {
      mondayFriday: "10:00 AM - 8:00 PM",
      saturday: "10:00 AM - 7:00 PM",
      sunday: "11:00 AM - 6:00 PM",
    },
    hasPickup: false,
    hasGearRental: false,
  },
];

export function getAllStores(): StoreLocation[] {
  return [...STORES];
}

export function getStoreBySlug(slug: string): StoreLocation | undefined {
  return STORES.find((store) => store.slug === slug);
}

export function filterStores(
  query: string,
  options?: { hasPickup?: boolean; hasGearRental?: boolean }
): StoreLocation[] {
  const normalized = query.trim().toLowerCase();

  return STORES.filter((store) => {
    if (options?.hasPickup && !store.hasPickup) {
      return false;
    }
    if (options?.hasGearRental && !store.hasGearRental) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    const matchesName = store.name.toLowerCase().includes(normalized);
    const matchesCity = store.city.toLowerCase().includes(normalized);
    const matchesState = store.state.toLowerCase().includes(normalized);
    const matchesZip = store.zipCode.includes(normalized);

    return matchesName || matchesCity || matchesState || matchesZip;
  });
}
