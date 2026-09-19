export type FireDangerLevel = 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';
export type FireRestrictionStage = 'none' | 'stage_1' | 'stage_2' | 'total_ban';
export type StovePermittedType =
  | 'canister_with_shutoff'
  | 'liquid_fuel'
  | 'alcohol_stove'
  | 'wood_burning_twigs'
  | 'open_campfire';

export interface FireZone {
  id: string;
  name: string;
  region: string;
  agency: string;
  dangerLevel: FireDangerLevel;
  restrictionStage: FireRestrictionStage;
  campfiresAllowed: boolean;
  campfirePermitRequired: boolean;
  elevationLimitFeet?: number;
  allowedStoves: StovePermittedType[];
  description: string;
  lastUpdated: string;
  advisoryNote: string;
}

export interface StoveCheckResult {
  zoneId: string;
  stoveType: StovePermittedType;
  isAllowed: boolean;
  restrictionStage: FireRestrictionStage;
  reason: string;
  precautions: string[];
}

export interface FireReport {
  id: string;
  zoneId: string;
  zoneName: string;
  locationDescription: string;
  reportedAt: string;
  reportType: 'unattended_campfire' | 'smoke_sighting' | 'illegal_burn';
  status: 'submitted' | 'dispatched' | 'resolved';
}

export const STORAGE_KEY = 'contoso_fire_reports';

export const FIRE_ZONES: FireZone[] = [
  {
    id: 'alpine-lakes-wilderness',
    name: 'Alpine Lakes Wilderness (Okanogan-Wenatchee)',
    region: 'Cascades',
    agency: 'USFS',
    dangerLevel: 'high',
    restrictionStage: 'stage_1',
    campfiresAllowed: false,
    campfirePermitRequired: false,
    elevationLimitFeet: 4000,
    allowedStoves: ['canister_with_shutoff'],
    description:
      'High alpine lake basins with fragile granite soils and sensitive subalpine vegetation. Campfires prohibited above 4,000 ft and within 0.5 miles of all lakes.',
    lastUpdated: '2026-09-18',
    advisoryNote:
      'Elevation restriction: Prohibited above 4,000 ft or within 0.5 mi of lakes; Stage 1 restrictions below 4,000 ft. Pressurized canister stoves with shutoff valve only.',
  },
  {
    id: 'mount-rainier-national-park',
    name: 'Mount Rainier National Park',
    region: 'Rainier',
    agency: 'NPS',
    dangerLevel: 'very_high',
    restrictionStage: 'stage_2',
    campfiresAllowed: false,
    campfirePermitRequired: false,
    allowedStoves: ['canister_with_shutoff', 'liquid_fuel'],
    description:
      'Glaciated stratovolcano flanks and old-growth timber stands. Strict Stage 2 restrictions prohibit all open flames across backcountry wilderness camps.',
    lastUpdated: '2026-09-18',
    advisoryNote:
      'Backcountry campfire ban in effect. Only pressurized canister stoves with shutoff valves and approved liquid fuel stoves are permitted.',
  },
  {
    id: 'olympic-national-park',
    name: 'Olympic National Park Backcountry',
    region: 'Olympics',
    agency: 'NPS',
    dangerLevel: 'moderate',
    restrictionStage: 'none',
    campfiresAllowed: true,
    campfirePermitRequired: true,
    elevationLimitFeet: 3500,
    allowedStoves: [
      'canister_with_shutoff',
      'liquid_fuel',
      'alcohol_stove',
      'wood_burning_twigs',
      'open_campfire',
    ],
    description:
      'Lush temperate rain forests, coastal strips, and rugged alpine peaks. Campfires allowed in designated existing fire rings below 3,500 ft elevation.',
    lastUpdated: '2026-09-17',
    advisoryNote:
      'Campfires permitted below 3,500 ft only in existing fire rings. Wilderness permit required. Practice strict Leave No Trace cold-out standards.',
  },
  {
    id: 'north-cascades-stehekin',
    name: 'North Cascades & Stehekin Corridor',
    region: 'North Cascades',
    agency: 'NPS / USFS',
    dangerLevel: 'extreme',
    restrictionStage: 'total_ban',
    campfiresAllowed: false,
    campfirePermitRequired: false,
    allowedStoves: ['canister_with_shutoff'],
    description:
      'Steep glacial drainages and dry eastern rain-shadow corridors with critically low fuel moisture levels. Red Flag warning conditions active.',
    lastUpdated: '2026-09-19',
    advisoryNote:
      'Complete burn ban in effect due to extreme fire danger. Open flames prohibited; only pressurized canister stoves with immediate shutoff valves are permitted.',
  },
  {
    id: 'mount-baker-snoqualmie',
    name: 'Mount Baker-Snoqualmie National Forest',
    region: 'Cascades',
    agency: 'USFS',
    dangerLevel: 'high',
    restrictionStage: 'stage_1',
    campfiresAllowed: true,
    campfirePermitRequired: false,
    allowedStoves: ['canister_with_shutoff', 'liquid_fuel'],
    description:
      'West-slope Cascade wilderness and alpine meadows. Stage 1 restrictions restrict campfires to developed campgrounds with established steel rings.',
    lastUpdated: '2026-09-18',
    advisoryNote:
      'Campfires permitted in developed campgrounds with agency-provided fire rings only. Prohibited in backcountry dispersed wilderness areas.',
  },
];

export const INITIAL_FIRE_REPORTS: FireReport[] = [
  {
    id: 'FIR-48201',
    zoneId: 'alpine-lakes-wilderness',
    zoneName: 'Alpine Lakes Wilderness (Okanogan-Wenatchee)',
    locationDescription: 'North shore of Snow Lake, approximately 0.25 mi from outlet trail',
    reportedAt: '2026-09-18T16:20:00.000Z',
    reportType: 'unattended_campfire',
    status: 'dispatched',
  },
  {
    id: 'FIR-29384',
    zoneId: 'north-cascades-stehekin',
    zoneName: 'North Cascades & Stehekin Corridor',
    locationDescription: 'Cascade Pass ridgeline near Sahale Arm trail junction',
    reportedAt: '2026-09-19T09:45:00.000Z',
    reportType: 'smoke_sighting',
    status: 'submitted',
  },
];

export function getFireZones(region?: string, dangerLevel?: FireDangerLevel): FireZone[] {
  let zones = [...FIRE_ZONES];

  if (region && region.toLowerCase() !== 'all') {
    zones = zones.filter((z) => z.region.toLowerCase() === region.toLowerCase());
  }

  if (dangerLevel) {
    zones = zones.filter((z) => z.dangerLevel === dangerLevel);
  }

  return zones;
}

export function getFireZoneById(id: string): FireZone | undefined {
  return FIRE_ZONES.find((z) => z.id === id);
}

export function checkStoveCompliance(
  zoneId: string,
  stoveType: StovePermittedType
): StoveCheckResult {
  const zone = getFireZoneById(zoneId);

  if (!zone) {
    return {
      zoneId,
      stoveType,
      isAllowed: false,
      restrictionStage: 'total_ban',
      reason: 'Unknown or unlisted fire zone selected. Zone not found.',
      precautions: [
        'Do not ignite any stove or open fire in unverified wilderness zones.',
        'Contact the local ranger station before lighting any flame.',
      ],
    };
  }

  const isAllowed = zone.allowedStoves.includes(stoveType);

  if (isAllowed) {
    let reason = `This stove type is permitted in ${zone.name} under ${formatRestrictionStage(zone.restrictionStage)}.`;
    if (stoveType === 'canister_with_shutoff') {
      reason = `Pressurized canister stoves with an integrated shutoff valve are permitted in ${zone.name}.`;
    } else if (stoveType === 'liquid_fuel') {
      reason = `Liquid fuel stoves (white gas/kerosene) are permitted in ${zone.name} under current regulations.`;
    } else if (stoveType === 'open_campfire') {
      reason = `Campfires are permitted in ${zone.name}${zone.elevationLimitFeet ? ` below ${zone.elevationLimitFeet.toLocaleString()} ft` : ''} in existing designated fire rings.`;
    }

    const precautions = [
      'Clear a 3-foot radius around the stove down to bare mineral soil or rock.',
      'Never leave any ignited stove or open flame unattended for any duration.',
      'Maintain at least 1 liter of water immediately accessible for fire suppression.',
      'Ensure stove is stable and isolated from dry needles, duff, or overhanging branches.',
    ];

    return {
      zoneId,
      stoveType,
      isAllowed: true,
      restrictionStage: zone.restrictionStage,
      reason,
      precautions,
    };
  }

  let reason = `This stove type is prohibited in ${zone.name} due to ${formatRestrictionStage(zone.restrictionStage)}.`;
  if (zone.restrictionStage === 'total_ban') {
    reason = `Total burn ban in effect in ${zone.name}. All open campfires, twig/biomass stoves, alcohol stoves, and unapproved devices are strictly prohibited.`;
  } else if (stoveType === 'alcohol_stove') {
    reason = `Alcohol and solid fuel tablet stoves lack an immediate shutoff valve and are prohibited under ${formatRestrictionStage(zone.restrictionStage)} in ${zone.name}.`;
  } else if (stoveType === 'wood_burning_twigs') {
    reason = `Wood-burning / twig biomass stoves emit sparks and flying embers, making them strictly prohibited in ${zone.name}.`;
  } else if (stoveType === 'open_campfire') {
    reason = `Open campfires are prohibited in ${zone.name} under current fire restrictions and danger ratings.`;
  } else if (stoveType === 'liquid_fuel') {
    reason = `Liquid fuel stoves are prohibited in ${zone.name}; only pressurized canister stoves with shutoff valves are allowed.`;
  }

  const precautions = [
    'Switch to a compliant pressurized canister stove featuring an immediate shutoff valve.',
    'Do not ignite unapproved stoves or biomass fuel under any circumstances.',
    'Pack pre-cooked or no-cook food rations when traveling through restricted zones.',
    'Adhere to Leave No Trace principles to prevent wildfire ignition.',
  ];

  return {
    zoneId,
    stoveType,
    isAllowed: false,
    restrictionStage: zone.restrictionStage,
    reason,
    precautions,
  };
}

export function saveFireReport(
  report: Omit<FireReport, 'id' | 'reportedAt' | 'status'>
): FireReport {
  const reports = getFireReports();
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  const newReport: FireReport = {
    ...report,
    id: `FIR-${randomCode}`,
    reportedAt: new Date().toISOString(),
    status: 'submitted',
  };

  const updated = [newReport, ...reports];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore private browsing or quota limits
    }
  }

  return newReport;
}

export function getFireReports(): FireReport[] {
  if (typeof window === 'undefined') {
    return [...INITIAL_FIRE_REPORTS];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [...INITIAL_FIRE_REPORTS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as FireReport[];
    }
    return [...INITIAL_FIRE_REPORTS];
  } catch {
    return [...INITIAL_FIRE_REPORTS];
  }
}

function formatRestrictionStage(stage: FireRestrictionStage): string {
  switch (stage) {
    case 'none':
      return 'Stage 0 (No Restrictions)';
    case 'stage_1':
      return 'Stage 1 Restrictions';
    case 'stage_2':
      return 'Stage 2 Restrictions';
    case 'total_ban':
      return 'Total Burn Ban';
  }
}
