export interface ParkPass {
  id: string;
  name: string;
  price: number;
  duration: string;
  coverage: string;
  description: string;
  features: string[];
  purchaseUrl?: string;
}

export interface PermitLottery {
  id: string;
  park: string;
  zone: string;
  lotteryWindow: string;
  resultsAnnounced: string;
  permitSeason: string;
  quotaLimit: string;
  bearCanisterRequired: boolean;
  feePerPerson: number;
  difficulty: 'Easy' | 'Moderate' | 'Strenuous' | 'Expert';
  description: string;
  recreationGovUrl?: string;
}

export interface WildernessRegulation {
  id: string;
  title: string;
  category: 'Food Storage' | 'Campfires' | 'Waste Management' | 'Group Size' | 'Permit Display';
  rule: string;
  recommendation: string;
}

export interface TripChecklistItem {
  id: string;
  label: string;
  category: string;
}

export const PARK_PASSES: ParkPass[] = [
  {
    id: 'america-the-beautiful',
    name: 'America the Beautiful Annual Pass',
    price: 80,
    duration: '12 months from purchase month',
    coverage: '2,000+ federal recreation sites (NPS, USFS, BLM, USFWS, USBR)',
    description:
      'The comprehensive pass covering entrance fees and standard amenity day-use recreation fees across all national parks and federal recreational lands.',
    features: [
      'Access to over 2,000 federal recreation sites nationwide',
      'Admits pass owner and passengers in a personal non-commercial vehicle',
      'Free admission for up to 4 adults at per-person fee sites (children 15 & under free)',
      'Up to two signatures allowed per pass card to share between household members',
    ],
    purchaseUrl: 'https://store.usgs.gov/pass',
  },
  {
    id: 'senior-pass',
    name: 'Interagency Senior Pass',
    price: 80,
    duration: 'Lifetime ($80) or Annual ($20)',
    coverage: 'All federal recreation sites for US citizens/permanent residents age 62+',
    description:
      'Exclusive pass for US citizens or permanent residents aged 62 or older, offering lifetime entry or renewable annual access along with amenity discounts.',
    features: [
      'Lifetime pass option for $80 or an annual pass for $20 (trade in 4 annual passes for lifetime)',
      'Valid at National Parks, National Forests, BLM lands, and Fish & Wildlife Refuges',
      '50% discount on select expanded amenity fees such as camping, swimming, and boat launch',
      'Valid for pass holder and accompanying vehicle passengers',
    ],
    purchaseUrl: 'https://store.usgs.gov/senior-pass',
  },
  {
    id: 'military-pass',
    name: 'Military Pass',
    price: 0,
    duration: 'Lifetime (Veterans/Gold Star) or Annual (Active Duty)',
    coverage: 'All federal recreation sites nationwide',
    description:
      'Free pass program dedicated to current US military personnel and their dependents, military veterans, and Gold Star Family members.',
    features: [
      'Complimentary access for active duty military members and their dependents',
      'Free lifetime pass for military veterans and eligible Gold Star Families',
      'Covers day-use entrance fees across all federal recreation areas',
      'Direct in-person issuance at ranger stations or online through USGS',
    ],
    purchaseUrl: 'https://store.usgs.gov/military-pass',
  },
  {
    id: 'every-kid-outdoors',
    name: '4th Grade Every Kid Outdoors Pass',
    price: 0,
    duration: 'Valid September 1 through August 31 of 4th-grade year',
    coverage: 'All national parks and federal recreation sites nationwide',
    description:
      'Federal youth initiative giving fourth-grade students and their families free admission to all national public lands and waters.',
    features: [
      'Free admission for any US 4th grader and accompanying family members',
      'Covers full vehicle occupants or up to 3 accompanying adults at per-person sites',
      'Printable paper pass voucher exchangeable for plastic pass card at park entrance',
      'Includes access to all 400+ National Park Service units and US Forest lands',
    ],
    purchaseUrl: 'https://everykidoutdoors.gov',
  },
  {
    id: 'northwest-forest-pass',
    name: 'Northwest Forest Pass',
    price: 30,
    duration: '12 months from purchase month',
    coverage: 'USFS trailheads and day-use sites in Washington and Oregon',
    description:
      'Regional pass dedicated to day-use fee sites and premier trailheads operated by the US Forest Service across Washington and Oregon.',
    features: [
      'Valid at all US Forest Service trailheads and day-use sites in the Pacific Northwest',
      'Covers parking for one personal vehicle at standard amenity recreation sites',
      'Interchangeable between household vehicles using convenient mirror hangtag',
      'Accepted across Mount Baker-Snoqualmie, Gifford Pinchot, Mt. Hood, and Deschutes National Forests',
    ],
    purchaseUrl: 'https://www.fs.usda.gov',
  },
];

export const PERMIT_LOTTERIES: PermitLottery[] = [
  {
    id: 'the-enchantments',
    park: 'Okanogan-Wenatchee National Forest',
    zone: 'The Enchantments (Core Zone)',
    lotteryWindow: 'Feb 15 – Mar 1',
    resultsAnnounced: 'March 8',
    permitSeason: 'May 15 – Oct 31',
    quotaLimit: '16 people per day across 8 permits (Core Zone)',
    bearCanisterRequired: true,
    feePerPerson: 6,
    difficulty: 'Expert',
    description:
      'Legendary alpine basin featuring turquoise tarns, sheer granite spires, and mountain goat habitat in the Alpine Lakes Wilderness. Sub-2% lottery acceptance rate for the Core Enchantment zone.',
    recreationGovUrl: 'https://www.recreation.gov/permits/233273',
  },
  {
    id: 'mount-whitney',
    park: 'Inyo National Forest',
    zone: 'Mount Whitney (Main Trail)',
    lotteryWindow: 'Feb 1 – Mar 1',
    resultsAnnounced: 'March 15',
    permitSeason: 'May 1 – Nov 1',
    quotaLimit: '100 day hikers / 60 overnight hikers per day',
    bearCanisterRequired: true,
    feePerPerson: 15,
    difficulty: 'Strenuous',
    description:
      'Ascent to the highest summit in the contiguous United States (14,505 ft). Both day hiking and multi-day overnight backcountry wilderness trips are subject to the annual quota lottery.',
    recreationGovUrl: 'https://www.recreation.gov/permits/233260',
  },
  {
    id: 'half-dome',
    park: 'Yosemite National Park',
    zone: 'Half Dome (Cables Route)',
    lotteryWindow: 'Mar 1 – Mar 31',
    resultsAnnounced: 'Mid-April',
    permitSeason: 'May 23 – Oct 13',
    quotaLimit: '225 day hikers / 75 backpackers per day',
    bearCanisterRequired: true,
    feePerPerson: 10,
    difficulty: 'Strenuous',
    description:
      'Iconic granite dome summit climb rising 4,800 feet above Yosemite Valley, culminating in the 400-foot cable route. Pre-season lottery with additional daily rolling lotteries two days in advance.',
    recreationGovUrl: 'https://www.recreation.gov/permits/234652',
  },
  {
    id: 'wonderland-trail',
    park: 'Mount Rainier National Park',
    zone: 'Wonderland Trail (Full Circuit)',
    lotteryWindow: 'Feb 12 – Mar 4',
    resultsAnnounced: 'March 14',
    permitSeason: 'Jun 1 – Sep 30',
    quotaLimit: 'Early access lottery timed reservations; rolling backcountry quotas',
    bearCanisterRequired: false,
    feePerPerson: 26,
    difficulty: 'Strenuous',
    description:
      'Rugged 93-mile circumnavigation of Mount Rainier traversing alpine ridges, deep river valleys, and lowland forests with over 22,000 feet of cumulative elevation gain.',
    recreationGovUrl: 'https://www.recreation.gov/permits/4675317',
  },
  {
    id: 'grand-canyon-backcountry',
    park: 'Grand Canyon National Park',
    zone: 'Phantom Ranch / North Rim Backcountry',
    lotteryWindow: 'Rolling monthly (4 months in advance, 1st–last day)',
    resultsAnnounced: 'First week of following month',
    permitSeason: 'Year-round',
    quotaLimit: 'Corridor and wild zone overnight capacity limits',
    bearCanisterRequired: false,
    feePerPerson: 10,
    difficulty: 'Strenuous',
    description:
      'Multi-day inner canyon backcountry expeditions descending Bright Angel, South Kaibab, and remote North Rim routes. Monthly lotteries determine early access booking windows.',
    recreationGovUrl: 'https://www.recreation.gov/permits/4675333',
  },
];

export const WILDERNESS_REGULATIONS: WildernessRegulation[] = [
  {
    id: 'reg-bear-canister',
    title: 'Bear-Resistant Food Canisters (Certified IGBC)',
    category: 'Food Storage',
    rule:
      'All food, scented toiletries, garbage, and hygiene products must be secured in an Interagency Grizzly Bear Committee (IGBC) approved hard-sided bear-resistant canister in designated wilderness zones.',
    recommendation:
      'Store canisters at least 100 feet downwind from your tent on flat ground, away from cliffs and fast-flowing rivers where rolling could lose your food supply.',
  },
  {
    id: 'reg-waste-wag-bags',
    title: 'Leave No Trace Waste Disposal & WAG Bags',
    category: 'Waste Management',
    rule:
      'In high-altitude alpine zones and sensitive granite basins (such as Mount Whitney and Enchantments Core), human waste pack-out systems (WAG bags) are strictly mandatory.',
    recommendation:
      'Carry adequate waste bag kits, zip-closure puncture-resistant bags, and pack out all used toilet paper, wipes, and hygiene supplies. Never bury waste in snow or rock crevices.',
  },
  {
    id: 'reg-campfire-restrictions',
    title: 'Campfire Bans & Fire Danger Restrictions',
    category: 'Campfires',
    rule:
      'Campfires are banned above designated subalpine elevations (e.g. above 5,000 ft in Enchantments, above 10,000 ft in Sierra Nevada) and during seasonal fire danger stages. Only portable canister stoves with on/off valves are permitted.',
    recommendation:
      'Always verify current USFS/NPS fire restriction levels before your trip. When fires are permitted in lower zones, use established metal fire rings and drown ashes with water until cold to the touch.',
  },
  {
    id: 'reg-group-size',
    title: 'Wilderness Group Size Limits (Max 8-12)',
    category: 'Group Size',
    rule:
      'Party sizes in designated wilderness areas are capped at a strict maximum of 8 to 12 persons (including guides) per permit to minimize trail impact and protect wilderness solitude.',
    recommendation:
      'Do not attempt to split larger parties into multiple permits traveling or camping in the same watershed or drainage, as rangers enforce cumulative party regulations.',
  },
  {
    id: 'reg-permit-display',
    title: 'Physical Permit Display & Offline Accessibility',
    category: 'Permit Display',
    rule:
      'Permits must be officially printed on paper or validated at a ranger station before heading into the backcountry. Trip leaders must keep the permit affixed visibly to their pack exterior.',
    recommendation:
      'Keep a paper copy inside a waterproof zip pouch attached to your pack, and download an offline copy to your smartphone with battery backup for field ranger inspections.',
  },
];

export const TRIP_CHECKLIST_ITEMS: TripChecklistItem[] = [
  {
    id: 'lottery-window',
    label: 'Confirmed lottery application window and entry deadlines',
    category: 'Permits',
  },
  {
    id: 'bear-canister',
    label: 'IGBC approved bear canister acquired and tested for food volume',
    category: 'Gear',
  },
  {
    id: 'paper-permit',
    label: 'Paper permit printed and stored in waterproof pouch / downloaded offline',
    category: 'Documentation',
  },
  {
    id: 'emergency-contact',
    label: 'Emergency contact informed with detailed trail itinerary and check-in plan',
    category: 'Safety',
  },
  {
    id: 'campfire-stove',
    label: 'Campfire permit obtained or backpacking canister stove checked for function',
    category: 'Fire & Food',
  },
];

export function getAllPasses(): ParkPass[] {
  return PARK_PASSES;
}

export function getAllLotteries(): PermitLottery[] {
  return PERMIT_LOTTERIES;
}

export function getWildernessRegulations(): WildernessRegulation[] {
  return WILDERNESS_REGULATIONS;
}

export function filterLotteries(query: string): PermitLottery[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return getAllLotteries();
  return getAllLotteries().filter(
    (lottery) =>
      lottery.park.toLowerCase().includes(normalized) ||
      lottery.zone.toLowerCase().includes(normalized) ||
      lottery.description.toLowerCase().includes(normalized)
  );
}

export function filterPasses(query: string): ParkPass[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return getAllPasses();
  return getAllPasses().filter(
    (pass) =>
      pass.name.toLowerCase().includes(normalized) ||
      pass.description.toLowerCase().includes(normalized) ||
      pass.coverage.toLowerCase().includes(normalized)
  );
}
