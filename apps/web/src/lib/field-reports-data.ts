export interface FieldReport {
  id: string;
  trailName: string;
  hikeDate: string;
  reporterUsername: string;
  condition: 'Clear & Dry' | 'Snow & Ice' | 'Muddy / Wet' | 'Obstacles / Blowdowns' | 'Hazard Warning';
  snowDepthInches: number;
  bugRating: 'None' | 'Low' | 'Moderate' | 'Severe';
  parkingStatus: 'Ample Parking' | 'Mostly Full' | 'Full by 8:00 AM' | 'Road Inaccessible';
  notes: string;
  hasHazardAlert?: boolean;
}

export interface HazardAlert {
  id: string;
  trailName: string;
  severity: 'Caution' | 'Warning' | 'Severe';
  hazardType: 'Snow Bridge Collapse' | 'High Wind Warning' | 'Trail Washout' | 'Avalanche Risk';
  reportedDate: string;
  summary: string;
  safetyAdvisory: string;
}

export interface ReportSubmission {
  trailName: string;
  hikeDate: string;
  reporterUsername: string;
  condition: FieldReport['condition'];
  snowDepthInches: number;
  bugRating: FieldReport['bugRating'];
  parkingStatus: FieldReport['parkingStatus'];
  notes: string;
}

export const INITIAL_HAZARD_ALERTS: HazardAlert[] = [
  {
    id: 'HAZ-001',
    trailName: 'The Enchantments Core',
    severity: 'Severe',
    hazardType: 'Snow Bridge Collapse',
    reportedDate: '2026-09-17',
    summary: 'Unstable snow bridges over outlet streams near Upper Enchantments',
    safetyAdvisory: 'Avoid crossing weakened snow bridges. Seek alternate rock routes or turn back if route is unclear.',
  },
  {
    id: 'HAZ-002',
    trailName: "Angel's Landing",
    severity: 'Warning',
    hazardType: 'High Wind Warning',
    reportedDate: '2026-09-18',
    summary: 'Gusts up to 55 mph reported along the spine',
    safetyAdvisory: 'Do not hike the chain section during severe wind advisories. Fall hazard is extreme.',
  },
  {
    id: 'HAZ-003',
    trailName: 'Mount Rainier Paradise',
    severity: 'Caution',
    hazardType: 'Avalanche Risk',
    reportedDate: '2026-09-16',
    summary: 'Loose wet slides possible on steep southern aspects',
    safetyAdvisory: 'Carry beacon, probe, and shovel. Avoid steep slopes during peak afternoon warming.',
  },
];

export const INITIAL_FIELD_REPORTS: FieldReport[] = [
  {
    id: 'TRP-84901',
    trailName: 'Mount Si',
    hikeDate: '2026-09-17',
    reporterUsername: 'cascade_hiker',
    condition: 'Clear & Dry',
    snowDepthInches: 0,
    bugRating: 'Low',
    parkingStatus: 'Full by 8:00 AM',
    notes: 'Trail is in great summer condition. Clear tread all the way to the haystack base. Lots of traffic and parking lot was full early.',
    hasHazardAlert: false,
  },
  {
    id: 'TRP-84902',
    trailName: 'Skyline Trail (Mount Rainier)',
    hikeDate: '2026-09-16',
    reporterUsername: 'alpine_wanderer',
    condition: 'Snow & Ice',
    snowDepthInches: 18,
    bugRating: 'None',
    parkingStatus: 'Mostly Full',
    notes: 'Firm morning snow with icy patches on Panorama Point loop. Microspikes recommended, trekking poles essential.',
    hasHazardAlert: false,
  },
  {
    id: 'TRP-84903',
    trailName: 'Enchantments Core Zone',
    hikeDate: '2026-09-15',
    reporterUsername: 'granite_ridge',
    condition: 'Hazard Warning',
    snowDepthInches: 8,
    bugRating: 'None',
    parkingStatus: 'Full by 8:00 AM',
    notes: 'Snow bridge collapse hazard above Vivian. Rapid thaw creating hazardous undermined snow cavities near the creek.',
    hasHazardAlert: true,
  },
  {
    id: 'TRP-84904',
    trailName: 'Lake 22',
    hikeDate: '2026-09-17',
    reporterUsername: 'mossy_boots',
    condition: 'Muddy / Wet',
    snowDepthInches: 2,
    bugRating: 'Moderate',
    parkingStatus: 'Ample Parking',
    notes: '2in slush around the boardwalk. Waterproof boots advised. Lower talus field had intermittent flowing water.',
    hasHazardAlert: false,
  },
  {
    id: 'TRP-84905',
    trailName: "Angel's Landing (Zion)",
    hikeDate: '2026-09-16',
    reporterUsername: 'canyon_scout',
    condition: 'Obstacles / Blowdowns',
    snowDepthInches: 0,
    bugRating: 'None',
    parkingStatus: 'Road Inaccessible',
    notes: 'Chain section maintenance underway. Shuttle road inaccessible to private cars. High exposure and gusty winds.',
    hasHazardAlert: true,
  },
];

let fieldReports: FieldReport[] = [...INITIAL_FIELD_REPORTS];

export function resetFieldReports(): void {
  fieldReports = [...INITIAL_FIELD_REPORTS];
}

export function getAllFieldReports(): FieldReport[] {
  return [...fieldReports];
}

export function getActiveHazardAlerts(): HazardAlert[] {
  return [...INITIAL_HAZARD_ALERTS];
}

export function getReportsByTrail(trailName: string): FieldReport[] {
  const query = trailName.toLowerCase().trim();
  return fieldReports.filter((report) => report.trailName.toLowerCase().includes(query));
}

export function filterFieldReports(query?: string, conditionFilter?: string): FieldReport[] {
  const q = (query ?? '').toLowerCase().trim();
  const c = conditionFilter ?? 'All';

  return fieldReports.filter((report) => {
    const matchesQuery =
      !q ||
      report.trailName.toLowerCase().includes(q) ||
      report.notes.toLowerCase().includes(q) ||
      report.reporterUsername.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (!c || c === 'All') return true;

    if (c === 'Hazards Only') {
      return report.condition === 'Hazard Warning' || Boolean(report.hasHazardAlert);
    }

    return report.condition === c;
  });
}

export function submitFieldReport(submission: ReportSubmission): FieldReport {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const newReport: FieldReport = {
    id: `TRP-${randomSuffix}`,
    trailName: submission.trailName.trim(),
    hikeDate: submission.hikeDate,
    reporterUsername: submission.reporterUsername.trim() || 'anonymous_hiker',
    condition: submission.condition,
    snowDepthInches: Number(submission.snowDepthInches) || 0,
    bugRating: submission.bugRating,
    parkingStatus: submission.parkingStatus,
    notes: submission.notes.trim(),
    hasHazardAlert: submission.condition === 'Hazard Warning',
  };

  fieldReports.unshift(newReport);
  return newReport;
}
