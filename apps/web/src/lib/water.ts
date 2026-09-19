export type WaterSourceType = 'stream' | 'glacial_melt' | 'alpine_lake' | 'spring' | 'ephemeral_creek';
export type ReliabilityRating = 'Year-round' | 'Seasonal' | 'Unreliable / Dry';
export type TreatmentMethod = 'hollow_fiber' | 'uv_purifier' | 'chemical_drops' | 'gravity_filter';

export interface WaterSource {
  id: string;
  name: string;
  trailOrZone: string;
  region: string;
  mileMarker: number;
  elevationFeet: number;
  sourceType: WaterSourceType;
  flowStatus: 'Flowing Strong' | 'Moderate Trickle' | 'Stagnant' | 'Dry';
  reliability: ReliabilityRating;
  turbidity: 'Crystal Clear' | 'Glacial Silt / Turbid' | 'Algae Present';
  recommendedTreatment: TreatmentMethod[];
  lastReportedDate: string;
  notes: string;
}

export interface WaterConditionReport {
  id: string; // Format: WTR-XXXXX (e.g. WTR-38291)
  sourceId: string;
  sourceName: string;
  reporterName: string;
  flowStatus: 'Flowing Strong' | 'Moderate Trickle' | 'Stagnant' | 'Dry';
  turbidity: 'Crystal Clear' | 'Glacial Silt / Turbid' | 'Algae Present';
  treatmentMethodUsed: TreatmentMethod;
  reportedAt: string;
  notes: string;
}

export interface HydrationCalculation {
  distanceMiles: number;
  elevationGainFeet: number;
  tempFahrenheit: number;
  hoursEstimated: number;
  litersNeeded: number;
  minCarryLiters: number;
}

export const WATER_SOURCES: WaterSource[] = [
  {
    id: 'colchuck-creek',
    name: 'Colchuck Creek Footbridge Crossing',
    trailOrZone: 'Colchuck Lake Trail',
    region: 'Cascades',
    mileMarker: 2.2,
    elevationFeet: 4100,
    sourceType: 'stream',
    flowStatus: 'Flowing Strong',
    reliability: 'Year-round',
    turbidity: 'Crystal Clear',
    recommendedTreatment: ['hollow_fiber', 'gravity_filter'],
    lastReportedDate: '2026-09-18',
    notes: 'Fast-flowing mountain run-off. Easy bank access.',
  },
  {
    id: 'asgard-snowmelt',
    name: 'Asgard Pass Mid-Slope Melt Cascades',
    trailOrZone: 'Enchantments Core',
    region: 'Cascades',
    mileMarker: 5.1,
    elevationFeet: 6800,
    sourceType: 'glacial_melt',
    flowStatus: 'Moderate Trickle',
    reliability: 'Seasonal',
    turbidity: 'Glacial Silt / Turbid',
    recommendedTreatment: ['gravity_filter', 'chemical_drops'],
    lastReportedDate: '2026-09-15',
    notes: 'Contains fine glacial rock flour; pre-filter with bandanna recommended.',
  },
  {
    id: 'panhandle-gap',
    name: 'Panhandle Gap Tarn',
    trailOrZone: 'Wonderland Trail',
    region: 'Rainier',
    mileMarker: 14.8,
    elevationFeet: 6800,
    sourceType: 'alpine_lake',
    flowStatus: 'Stagnant',
    reliability: 'Seasonal',
    turbidity: 'Crystal Clear',
    recommendedTreatment: ['uv_purifier', 'hollow_fiber'],
    lastReportedDate: '2026-09-10',
    notes: 'Standing snowmelt tarn. Treat for cysts and bacteria.',
  },
  {
    id: 'enchanted-valley-spring',
    name: 'Pyrites Creek Spring',
    trailOrZone: 'Enchanted Valley',
    region: 'Olympics',
    mileMarker: 9.5,
    elevationFeet: 1400,
    sourceType: 'spring',
    flowStatus: 'Flowing Strong',
    reliability: 'Year-round',
    turbidity: 'Crystal Clear',
    recommendedTreatment: ['hollow_fiber', 'uv_purifier'],
    lastReportedDate: '2026-09-17',
    notes: 'Reliable cold subterranean spring discharge year-round.',
  },
  {
    id: 'carbon-river-tributary',
    name: 'Carbon River Suspension Bridge Creek',
    trailOrZone: 'Wonderland Trail',
    region: 'Rainier',
    mileMarker: 8.2,
    elevationFeet: 3100,
    sourceType: 'stream',
    flowStatus: 'Flowing Strong',
    reliability: 'Year-round',
    turbidity: 'Crystal Clear',
    recommendedTreatment: ['hollow_fiber', 'gravity_filter'],
    lastReportedDate: '2026-09-16',
    notes: 'Clear side tributary feeding Carbon River. Avoid silt-heavy main glacial riverbed.',
  },
  {
    id: 'seven-lakes-basin',
    name: 'Lunch Lake Basin Outlet',
    trailOrZone: 'High Divide Loop',
    region: 'Olympics',
    mileMarker: 8.0,
    elevationFeet: 4450,
    sourceType: 'alpine_lake',
    flowStatus: 'Moderate Trickle',
    reliability: 'Seasonal',
    turbidity: 'Crystal Clear',
    recommendedTreatment: ['uv_purifier', 'hollow_fiber'],
    lastReportedDate: '2026-09-14',
    notes: 'Subalpine lake outlet creek. High subalpine clarity; filter for Giardia.',
  },
];

export const INITIAL_FIELD_REPORTS: WaterConditionReport[] = [
  {
    id: 'WTR-74821',
    sourceId: 'colchuck-creek',
    sourceName: 'Colchuck Creek Footbridge Crossing',
    reporterName: 'Sierra Brooks',
    flowStatus: 'Flowing Strong',
    turbidity: 'Crystal Clear',
    treatmentMethodUsed: 'hollow_fiber',
    reportedAt: '2026-09-18T14:30:00.000Z',
    notes: 'High flow from Stuart Range snowpack. Very cold, zero particulate settling needed.',
  },
  {
    id: 'WTR-59102',
    sourceId: 'asgard-snowmelt',
    sourceName: 'Asgard Pass Mid-Slope Melt Cascades',
    reporterName: 'Marcus Thorne',
    flowStatus: 'Moderate Trickle',
    turbidity: 'Glacial Silt / Turbid',
    treatmentMethodUsed: 'gravity_filter',
    reportedAt: '2026-09-15T11:15:00.000Z',
    notes: 'Glacial runoff has heavy rock flour. Used bandanna prefilter before gravity bag.',
  },
];

export const STORAGE_KEY = 'contoso_water_reports';

export function getWaterSources(): WaterSource[] {
  return [...WATER_SOURCES];
}

export function getWaterSourceById(id: string): WaterSource | null {
  return WATER_SOURCES.find((source) => source.id === id) || null;
}

export function calculateHydrationNeeds(
  distanceMiles: number,
  elevationGainFeet: number,
  tempFahrenheit: number
): HydrationCalculation {
  const safeDistance = Math.max(0, distanceMiles);
  const safeElevation = Math.max(0, elevationGainFeet);
  const safeTemp = Number.isFinite(tempFahrenheit) ? tempFahrenheit : 68;

  // Pace: roughly 2.5 mph on level ground + 1 hr per 1500 ft elevation gain
  const rawHours = (safeDistance / 2.5) + (safeElevation / 1500);
  const hoursEstimated = Number(Math.max(safeDistance > 0 ? 0.5 : 0.0, rawHours).toFixed(1));

  // Baseline water consumption: 0.5 L per hour
  // Heat factor: +0.015 L/hr per degree over 70°F
  const heatFactor = Math.max(0, (safeTemp - 70) * 0.015);
  const hourlyRate = 0.5 + heatFactor;

  const rawLiters = Math.max(0.5, hoursEstimated * hourlyRate);
  const litersNeeded = Number(rawLiters.toFixed(1));

  // Minimum carrying capacity between water sources:
  // Typically at least 1.0L, scaling to ~60% of total needs capped at 3.0L max carry per push
  const rawMinCarry = Math.max(1.0, Math.min(litersNeeded, Math.max(1.0, litersNeeded * 0.6)));
  const minCarryLiters = Number(rawMinCarry.toFixed(1));

  return {
    distanceMiles: safeDistance,
    elevationGainFeet: safeElevation,
    tempFahrenheit: safeTemp,
    hoursEstimated,
    litersNeeded,
    minCarryLiters,
  };
}

export function getWaterConditionReports(): WaterConditionReport[] {
  if (typeof window === 'undefined') {
    return [...INITIAL_FIELD_REPORTS];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [...INITIAL_FIELD_REPORTS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as WaterConditionReport[];
    }
    return [...INITIAL_FIELD_REPORTS];
  } catch {
    return [...INITIAL_FIELD_REPORTS];
  }
}

export function saveWaterConditionReport(
  report: Omit<WaterConditionReport, 'id' | 'reportedAt'>
): WaterConditionReport {
  const reports = getWaterConditionReports();
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  const newReport: WaterConditionReport = {
    ...report,
    id: `WTR-${randomCode}`,
    reportedAt: new Date().toISOString(),
  };

  const updated = [newReport, ...reports];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage quota or private browsing errors
    }
  }

  return newReport;
}
