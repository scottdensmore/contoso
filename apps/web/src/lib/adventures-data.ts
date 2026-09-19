export interface AdventureTour {
  id: string;
  title: string;
  category: 'Mountaineering' | 'Rock Climbing' | 'Water Sports' | 'Safety & Survival';
  location: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Strenuous' | 'Expert';
  pricePerPerson: number;
  gearRentalFee: number;
  maxGroupSize: number;
  leadGuideName: string;
  description: string;
  includedGear: string[];
  prerequisites: string;
}

export interface AdventureGuide {
  id: string;
  name: string;
  title: string;
  certifications: string[];
  yearsExperience: number;
  bio: string;
}

export interface AdventureBookingEstimate {
  tourId: string;
  tourTitle: string;
  participants: number;
  includeGearRental: boolean;
  baseTotal: number;
  gearRentalTotal: number;
  totalPrice: number;
}

export const ADVENTURE_TOURS: AdventureTour[] = [
  {
    id: 'alpine-mountaineering-rainier',
    title: 'Alpine Mountaineering & Glacier Travel',
    category: 'Mountaineering',
    location: 'Mount Rainier',
    duration: '3 Days',
    difficulty: 'Expert',
    pricePerPerson: 650,
    gearRentalFee: 75,
    maxGroupSize: 4,
    leadGuideName: 'Sarah Jenkins',
    description:
      'Tackle crevasses, ice climbing pitches, and high-altitude glacier navigation on technical mountain terrain with our elite expedition leaders.',
    includedGear: [
      'Glacier ropes & harnesses',
      'Technical ice axes',
      'Steel crampons & helmets',
      'Crevasse rescue pulley kits',
    ],
    prerequisites:
      'Prior multi-day backpacking experience and high cardiovascular endurance required. Must be able to carry a 45-pound pack.',
  },
  {
    id: 'intro-rock-climbing-smith-rock',
    title: 'Introduction to Outdoor Rock Climbing',
    category: 'Rock Climbing',
    location: 'Smith Rock',
    duration: '1 Day',
    difficulty: 'Beginner',
    pricePerPerson: 175,
    gearRentalFee: 35,
    maxGroupSize: 6,
    leadGuideName: 'Marcus Vance',
    description:
      'Learn fundamental top-rope climbing mechanics, footwork placement, knot tying, and belay communication on world-famous basalt crags.',
    includedGear: [
      'Climbing harness',
      'Sticky rubber climbing shoes',
      'Locking carabiners & ATC belay device',
      'Climbing helmet',
    ],
    prerequisites:
      'No prior outdoor climbing experience required. Basic physical mobility and enthusiasm for heights recommended.',
  },
  {
    id: 'whitewater-rafting-rogue-river',
    title: 'Backcountry Whitewater Rafting Expedition',
    category: 'Water Sports',
    location: 'Rogue River',
    duration: '2 Days',
    difficulty: 'Intermediate',
    pricePerPerson: 420,
    gearRentalFee: 50,
    maxGroupSize: 8,
    leadGuideName: 'David Chen',
    description:
      'Navigate Class III and IV whitewater rapids through pristine canyon wilderness with riverside camping, campfire gourmet meals, and canyon hikes.',
    includedGear: [
      'Type V whitewater PFD life vest',
      'Composite guide paddle',
      'Waterproof expedition dry bags',
      'River helmet & neoprene wetsuit',
    ],
    prerequisites:
      'Comfortable swimming in turbulent moving water; participants must be 14 years or older.',
  },
  {
    id: 'wilderness-navigation-cascades',
    title: 'Wilderness Navigation & Compass Clinic',
    category: 'Safety & Survival',
    location: 'North Cascades',
    duration: '1 Day',
    difficulty: 'Beginner',
    pricePerPerson: 120,
    gearRentalFee: 20,
    maxGroupSize: 10,
    leadGuideName: 'Elena Rostova',
    description:
      'Master topographic map interpretation, magnetic declination adjustment, resection triangulation, and off-trail orienteering without GPS reliance.',
    includedGear: [
      'USGS 7.5-minute topographic map',
      'Sighting mirror compass with clinometer',
      'Waterproof field notebook & UTM plotter',
    ],
    prerequisites:
      'Comfortable hiking 4 to 6 miles over uneven forest trail terrain with slight elevation change.',
  },
  {
    id: 'avalanche-safety-rescue',
    title: 'Avalanche Safety & Rescue Basics',
    category: 'Safety & Survival',
    location: 'Snoqualmie Pass',
    duration: '1 Day',
    difficulty: 'Intermediate',
    pricePerPerson: 150,
    gearRentalFee: 40,
    maxGroupSize: 8,
    leadGuideName: 'Sarah Jenkins',
    description:
      'Understand snowpack stratigraphy, pit stability tests, digital avalanche transceiver search grids, probe lines, and rapid companion burial rescue.',
    includedGear: [
      'Digital 3-antenna avalanche beacon transceiver',
      'Quick-draw 280cm aluminum probe',
      'High-volume metal snow shovel',
    ],
    prerequisites:
      'Familiarity with winter backcountry travel and snowshoeing or backcountry alpine touring equipment.',
  },
];

export const ADVENTURE_GUIDES: AdventureGuide[] = [
  {
    id: 'sarah-jenkins',
    name: 'Sarah Jenkins',
    title: 'Lead Alpine Guide',
    certifications: ['AMGA Certified Alpine Guide', 'WFR'],
    yearsExperience: 12,
    bio: 'Sarah has led expeditions across Denali, the Cascade Range, and the Andes, specializing in high-altitude glacier travel and technical mountain rescue.',
  },
  {
    id: 'marcus-vance',
    name: 'Marcus Vance',
    title: 'Senior Rock Climbing Instructor',
    certifications: ['AMGA Rock Guide', 'WFR'],
    yearsExperience: 9,
    bio: 'A veteran route-setter and trad climbing expert, Marcus specializes in coaching climbers transitioning from indoor gyms to multi-pitch granite and sandstone crags.',
  },
  {
    id: 'david-chen',
    name: 'David Chen',
    title: 'Whitewater Expeditions Director',
    certifications: ['ACA Whitewater Kayak Instructor', 'Swiftwater Rescue', 'WFR'],
    yearsExperience: 14,
    bio: 'David has run rivers across the Pacific Northwest and Colorado River Basin for over a decade, with an uncompromising passion for swiftwater hydrology and safety.',
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    title: 'Backcountry Navigation & Survival Specialist',
    certifications: ['Wilderness First Responder', 'WFR'],
    yearsExperience: 8,
    bio: 'Elena is a former search and rescue specialist focusing on wilderness survival, orienteering, emergency shelter fabrication, and deep-backcountry risk mitigation.',
  },
];

export function getAllAdventures(): AdventureTour[] {
  return ADVENTURE_TOURS;
}

export function getAdventuresByCategory(category: string): AdventureTour[] {
  if (!category || category === 'All') {
    return ADVENTURE_TOURS;
  }
  return ADVENTURE_TOURS.filter((tour) => tour.category === category);
}

export function getAdventureById(id: string): AdventureTour | undefined {
  return ADVENTURE_TOURS.find((tour) => tour.id === id);
}

export function getAllGuides(): AdventureGuide[] {
  return ADVENTURE_GUIDES;
}

export function calculateAdventureBooking(
  tourId: string,
  participants: number,
  includeGearRental: boolean
): AdventureBookingEstimate {
  const tour = getAdventureById(tourId);
  if (!tour) {
    throw new Error(`Tour not found: ${tourId}`);
  }

  const validParticipants = Math.max(1, Math.floor(participants));
  const baseTotal = tour.pricePerPerson * validParticipants;
  const gearRentalTotal = includeGearRental ? tour.gearRentalFee * validParticipants : 0;
  const totalPrice = baseTotal + gearRentalTotal;

  return {
    tourId: tour.id,
    tourTitle: tour.title,
    participants: validParticipants,
    includeGearRental,
    baseTotal,
    gearRentalTotal,
    totalPrice,
  };
}

export function filterAdventures(query: string, category: string): AdventureTour[] {
  const normalizedCategory = category.trim();
  const normalizedQuery = query.trim().toLowerCase();

  return ADVENTURE_TOURS.filter((tour) => {
    const matchesCategory =
      !normalizedCategory ||
      normalizedCategory === 'All' ||
      tour.category.toLowerCase() === normalizedCategory.toLowerCase();

    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;

    const searchableText = [
      tour.title,
      tour.location,
      tour.category,
      tour.description,
      tour.leadGuideName,
      tour.difficulty,
      ...tour.includedGear,
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
