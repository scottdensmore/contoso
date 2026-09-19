export type LntPrincipleId =
  | 'plan-ahead'
  | 'durable-surfaces'
  | 'dispose-waste'
  | 'leave-what-you-find'
  | 'minimize-campfire'
  | 'respect-wildlife'
  | 'be-considerate';

export type WasteDisposalMethod = 'cathole' | 'wag_bag_required' | 'outhouse_privy' | 'pack_out_all';

export type ElevationZone = 'lowland' | 'subalpine' | 'alpine_above_treeline' | 'riparian';

export interface LntPrinciple {
  id: LntPrincipleId;
  number: number;
  title: string;
  subtitle: string;
  guidelines: string[];
  backcountryPractices: string[];
}

export interface WildernessZoneRegulation {
  id: string;
  name: string;
  region: string;
  elevationZone: ElevationZone;
  humanWasteProtocol: WasteDisposalMethod;
  foodStorageRequirement: 'bear_canister_required' | 'bear_canister_or_hang' | 'bear_box_provided';
  campfirePolicy: 'prohibited_all_elevations' | 'prohibited_above_elev' | 'established_fire_rings_only';
  elevationThresholdFt?: number;
  specialRules: string[];
}

export interface WasteAssessmentRequest {
  zoneId: string;
  elevationFt?: number;
  distanceFromWaterFt: number;
  groupSize: number;
  stayDays: number;
}

export interface WasteAssessmentResult {
  humanWasteMethod: WasteDisposalMethod;
  foodStorageMethod: string;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  guidanceNotes: string[];
  requiredGear: string[];
  estimatedWagBagsNeeded: number;
}

export interface PackOutSupplies {
  wagBags: number;
  trashBags: number;
  odorProofBags: number;
  trowelNeeded: boolean;
  sanitizerOz: number;
}

export const LNT_PRINCIPLES: LntPrinciple[] = [
  {
    id: 'plan-ahead',
    number: 1,
    title: 'Plan Ahead and Prepare',
    subtitle: 'Know regulations, hazards, and weather before departure',
    guidelines: [
      'Check weather forecasts, trail conditions, and backcountry permits in advance',
      'Prepare for extreme weather, sudden storms, and route hazards',
      'Schedule visits during off-peak times to minimize trail overcrowding',
      'Repackage food to reduce trash and minimize pack-out bulk',
    ],
    backcountryPractices: [
      'Carry appropriate topographic maps, compass, and emergency signaling gear',
      'Verify wilderness zone human waste rules (cathole vs WAG bag mandate)',
      'Calculate party food quantities and bear-proof storage requirements beforehand',
    ],
  },
  {
    id: 'durable-surfaces',
    number: 2,
    title: 'Travel and Camp on Durable Surfaces',
    subtitle: 'Protect fragile alpine vegetation and riparian zones',
    guidelines: [
      'Durable surfaces include established trails, bedrock, gravel bars, and snow',
      'Camp at least 200 feet away from lakes, streams, and pristine water bodies',
      'Good campsites are found, not made; never alter or clear natural terrain',
      'In popular zones, concentrate use on designated campsites and durable trails',
    ],
    backcountryPractices: [
      'Walk single file in the center of the trail, even when muddy, to prevent trail widening',
      'Spread out when traveling cross-country in pristine zones to avoid creating new paths',
      'Avoid trampling fragile alpine tundra, moss mats, and subalpine wildflower meadows',
    ],
  },
  {
    id: 'dispose-waste',
    number: 3,
    title: 'Dispose of Waste Properly',
    subtitle: 'Pack it in, pack it out, and safeguard backcountry watersheds',
    guidelines: [
      'Pack out all trash, food scraps, leftover crumbs, and used hygiene products',
      'Deposit solid human waste in catholes dug 6 to 8 inches deep, 200 feet from water and camps',
      'Use WAG bags in alpine, glacial, and heavily regulated wilderness zones',
      'Wash dishes and body 200 feet from water sources using minimal biodegradable soap',
    ],
    backcountryPractices: [
      'Always pack out toilet paper, wet wipes, and feminine hygiene supplies in odor-proof bags',
      'Carry a lightweight backcountry trowel for zones where catholes are permitted',
      'In high alpine and snowpack environments, pack out all solid waste using approved WAG bags',
    ],
  },
  {
    id: 'leave-what-you-find',
    number: 4,
    title: 'Leave What You Find',
    subtitle: 'Preserve natural history, cultural heritage, and ecological balance',
    guidelines: [
      'Preserve historic artifacts, cultural sites, and indigenous landmarks intact',
      'Leave wildflowers, plants, rocks, antlers, and natural features untouched',
      'Avoid introducing non-native organisms or transporting invasive plant seeds',
      'Do not dig trenches, carve trees, or construct lean-tos or rock tables',
    ],
    backcountryPractices: [
      'Photograph specimens and vistas instead of collecting natural artifacts',
      'Clean hiking boots, trekking poles, and tent stakes before entering new wilderness areas',
      'Dismantle unauthorized user-built rock cairns, furniture, or shelters',
    ],
  },
  {
    id: 'minimize-campfire',
    number: 5,
    title: 'Minimize Campfire Impacts',
    subtitle: 'Rely on lightweight backpacking stoves and respect fire restrictions',
    guidelines: [
      'Campfires cause lasting scars; use lightweight canister or liquid stoves for cooking',
      'Where fires are permitted, use established fire rings, fire pans, or mound fires',
      'Keep campfires small and burn only downed wood no thicker than an adult wrist',
      'Burn all wood and coals to ash; drench completely with water until cold to the touch',
    ],
    backcountryPractices: [
      'Check fire danger indices and stage restrictions before your trip',
      'Never leave a campfire unattended, even for a short walk',
      'Practice the Drown-Stir-Feel Cold test before departing campsite',
    ],
  },
  {
    id: 'respect-wildlife',
    number: 6,
    title: 'Respect Wildlife',
    subtitle: 'Observe animals from distance and secure all scented items',
    guidelines: [
      'Observe wildlife from a safe distance; never pursue, corner, or surround animals',
      'Never feed wildlife; habituated animals become aggressive and must often be euthanized',
      'Store food, trash, and scented attractants in bear-resistant containers or canisters',
      'Keep pets leashed at all times, or leave them at home in sensitive habitats',
    ],
    backcountryPractices: [
      'Use the rule of thumb: if an outstretched thumb cannot cover the animal, you are too close',
      'Carry IGBC-certified bear canisters in mandatory zones (e.g. Enchantments, Boston Basin)',
      'Cook and store food at least 200 feet downwind from your sleeping area',
    ],
  },
  {
    id: 'be-considerate',
    number: 7,
    title: 'Be Considerate of Other Visitors',
    subtitle: 'Honor natural quiet, share trails, and yield appropriately',
    guidelines: [
      'Respect other visitors and protect the serene quality of their outdoor experience',
      'Yield to uphill hikers when descending steep terrain; yield to pack stock',
      'Step to the downhill side of the trail when horses or mules pass',
      'Take rest breaks away from trails and camps; maintain natural quiet',
    ],
    backcountryPractices: [
      'Keep audio devices silenced or use personal headphones to preserve nature sounds',
      'Pitch tents away from trails and fellow campers when campsite options permit',
      'Keep pets under close control to prevent disturbing other hikers and wildlife',
    ],
  },
];

export const WILDERNESS_ZONES: WildernessZoneRegulation[] = [
  {
    id: 'enchantments-core',
    name: 'Enchantments Core Alpine Zone',
    region: 'Alpine Lakes Wilderness',
    elevationZone: 'alpine_above_treeline',
    humanWasteProtocol: 'wag_bag_required',
    foodStorageRequirement: 'bear_canister_required',
    campfirePolicy: 'prohibited_all_elevations',
    elevationThresholdFt: 6800,
    specialRules: [
      'Solid human waste must be packed out in WAG bags',
      'Hard-sided IGBC bear canisters mandatory',
      'Campfires strictly forbidden',
      'No camping on alpine vegetation / fragile tundra',
    ],
  },
  {
    id: 'mount-rainier-muir',
    name: 'Mount Rainier Alpine Snowfield (Camp Muir)',
    region: 'Mount Rainier National Park',
    elevationZone: 'alpine_above_treeline',
    humanWasteProtocol: 'wag_bag_required',
    foodStorageRequirement: 'bear_canister_or_hang',
    campfirePolicy: 'prohibited_all_elevations',
    elevationThresholdFt: 10000,
    specialRules: [
      'Blue bag / WAG bag disposal required on glacier / snowpack',
      'Pack out all toilet paper and wipes',
      'No open wood fires',
    ],
  },
  {
    id: 'olympic-coast',
    name: 'Olympic Wilderness Coastal Strip',
    region: 'Olympic National Park',
    elevationZone: 'riparian',
    humanWasteProtocol: 'cathole',
    foodStorageRequirement: 'bear_canister_required',
    campfirePolicy: 'established_fire_rings_only',
    specialRules: [
      'Tides wash over camps; camp above high tide line',
      'Cat-holes in intertidal zone below high tide or pack out',
      'Bear canisters required due to raccoon and bear activity',
    ],
  },
  {
    id: 'north-cascades-boston',
    name: 'Boston Basin High Alpine',
    region: 'North Cascades National Park',
    elevationZone: 'alpine_above_treeline',
    humanWasteProtocol: 'wag_bag_required',
    foodStorageRequirement: 'bear_canister_required',
    campfirePolicy: 'prohibited_all_elevations',
    elevationThresholdFt: 5500,
    specialRules: [
      'WAG bag pack-out required on rock and moraine',
      'Bear canisters mandatory May 1 - Nov 15',
      'Strict group size limit of 12',
    ],
  },
  {
    id: 'alpine-lakes-lowland',
    name: 'Alpine Lakes Lowland Valley Trails',
    region: 'Okanogan-Wenatchee & Mt. Baker-Snoqualmie',
    elevationZone: 'lowland',
    humanWasteProtocol: 'cathole',
    foodStorageRequirement: 'bear_canister_or_hang',
    campfirePolicy: 'established_fire_rings_only',
    specialRules: [
      'Cathole 6-8 inches deep at least 200 feet from water and trails',
      'Pack out all toilet paper',
      'Campfires prohibited above 4,000 feet',
    ],
  },
];

export function getLntPrinciples(): LntPrinciple[] {
  return [...LNT_PRINCIPLES];
}

export function getLntPrincipleById(id: string): LntPrinciple | undefined {
  return LNT_PRINCIPLES.find((p) => p.id === id);
}

export function getWildernessZoneRegulations(): WildernessZoneRegulation[] {
  return [...WILDERNESS_ZONES];
}

export function getWildernessZoneById(id: string): WildernessZoneRegulation | undefined {
  return WILDERNESS_ZONES.find((z) => z.id === id);
}

export function assessWasteCompliance(request: WasteAssessmentRequest): WasteAssessmentResult {
  const zone = getWildernessZoneById(request.zoneId);
  const humanWasteMethod: WasteDisposalMethod = zone?.humanWasteProtocol ?? 'cathole';
  const notes: string[] = [];
  const requiredGear: string[] = [];
  let complianceStatus: 'compliant' | 'warning' | 'violation' = 'compliant';

  const isWagBagRequired = humanWasteMethod === 'wag_bag_required';
  const estimatedWagBagsNeeded = isWagBagRequired
    ? Math.max(0, request.groupSize * request.stayDays * 2)
    : 0;

  let foodStorageMethod = 'IGBC bear canister or counter-balance bear hang';
  if (zone?.foodStorageRequirement === 'bear_canister_required') {
    foodStorageMethod = 'Hard-sided IGBC bear canister mandatory';
  } else if (zone?.foodStorageRequirement === 'bear_box_provided') {
    foodStorageMethod = 'Food locker / bear box provided at designated sites';
  }

  // Human waste protocol & distance checks
  if (isWagBagRequired) {
    notes.push('WAG bags must be packed out and disposed of in municipal trash or designated trailhead barrels.');
    notes.push('Never bury WAG bags, plastic liners, or sanitary wet wipes in soil, rock crevasses, or snowpack.');
    requiredGear.push('WAG Bags (Waste Bag Kits)');
    requiredGear.push('Odor-proof transport bags / secondary containment');
    requiredGear.push('Hand sanitizer');
  } else {
    // Cathole protocol
    requiredGear.push('Backcountry trowel');
    requiredGear.push('Pack-out bags for toilet paper (Ziploc)');
    requiredGear.push('Hand sanitizer');

    if (request.distanceFromWaterFt < 200) {
      complianceStatus = 'violation';
      notes.push('Catholes must be at least 200 feet (approx 70 adult steps) from any lake, stream, or campsite.');
    } else {
      notes.push('Catholes must be dug 6 to 8 inches deep in organic soil, at least 200 feet from water, trails, and campsites.');
      notes.push('Pack out all used toilet paper, wipes, and hygiene products in sealed bags.');
    }
  }

  // Food storage gear
  if (zone?.foodStorageRequirement === 'bear_canister_required') {
    requiredGear.push('IGBC-Approved Hard-Sided Bear Canister');
  } else {
    requiredGear.push('Bear Canister or 50ft Bear Hang System');
  }

  // Group size limits
  if (request.groupSize > 12) {
    if (complianceStatus !== 'violation') {
      complianceStatus = 'warning';
    }
    notes.push('Wilderness regulations enforce a strict group size limit of 12 people to mitigate trail and campsite impact.');
  }

  // Add zone-specific rules
  if (zone?.specialRules && zone.specialRules.length > 0) {
    for (const rule of zone.specialRules) {
      notes.push(rule);
    }
  }

  return {
    humanWasteMethod,
    foodStorageMethod,
    complianceStatus,
    guidanceNotes: Array.from(new Set(notes)),
    requiredGear: Array.from(new Set(requiredGear)),
    estimatedWagBagsNeeded,
  };
}

export function calculatePackOutSupplies(
  groupSize: number,
  stayDays: number,
  requiresWagBags: boolean
): PackOutSupplies {
  const safeGroup = Math.max(1, groupSize);
  const safeDays = Math.max(1, stayDays);

  return {
    wagBags: requiresWagBags ? safeGroup * safeDays * 2 : 0,
    trashBags: Math.ceil(safeDays / 2),
    odorProofBags: Math.ceil(safeGroup / 2),
    trowelNeeded: !requiresWagBags,
    sanitizerOz: Math.ceil(safeGroup * safeDays * 0.5),
  };
}
