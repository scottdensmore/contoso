export type AltitudeZone =
  | 'moderate_8000_12000'
  | 'high_12000_14000'
  | 'very_high_14000_18000'
  | 'extreme_death_zone_18000_plus';

export type AmsRiskLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface AltitudePeakProfile {
  id: string;
  peakName: string;
  region: string;
  summitElevationFt: number;
  baseElevationFt: number;
  zone: AltitudeZone;
  recommendedAcclimatizationDays: number;
  maxDailyElevationGainFt: number;
  oxygenPercentageEffective: number;
  description: string;
  keyAcclimatizationCamps: string[];
}

export interface AcclimatizationPlanQuery {
  peakId: string;
  climberRestingHeartRate: number;
  currentAltitudeFt: number;
  targetAltitudeFt: number;
  daysAllowed: number;
  priorAltitudeExperience: 'none' | 'some_14er' | 'experienced_high_altitude';
}

export interface AcclimatizationPlanResult {
  peakName: string;
  recommendedDailyAscentFt: number;
  restDaysRequired: number;
  amsRisk: AmsRiskLevel;
  climbHighSleepLowSchedule: string;
  hydrationRequirementLiters: number;
  gamowBagOrO2Recommended: boolean;
  medicalAdvisory: string;
}

export interface AltitudeMedicalGearItem {
  id: string;
  name: string;
  category:
    | 'monitoring'
    | 'oxygen_emergency'
    | 'hydration_electrolytes'
    | 'medication_first_aid'
    | 'thermal_bivy';
  mandatory: boolean;
  description: string;
}

export const ALTITUDE_PEAKS: AltitudePeakProfile[] = [
  {
    id: 'colorado-mount-elbert',
    peakName: 'Mount Elbert (Sawatch Range, CO)',
    region: 'Sawatch Range, CO',
    summitElevationFt: 14440,
    baseElevationFt: 10040,
    zone: 'high_12000_14000',
    recommendedAcclimatizationDays: 2,
    maxDailyElevationGainFt: 2000,
    oxygenPercentageEffective: 12.3,
    description:
      'Highest summit in the Rocky Mountains of North America and highest point in Colorado. High alpine ascent requiring careful staging above 10,000 ft to prevent Acute Mountain Sickness.',
    keyAcclimatizationCamps: [
      'Halfmoon Creek Trailhead (10,040 ft)',
      'Treeline Bivy Camp (11,800 ft)',
      'Summit Ridge (14,440 ft)',
    ],
  },
  {
    id: 'washington-mount-rainier',
    peakName: 'Mount Rainier (Cascade Range, WA)',
    region: 'Cascade Range, WA',
    summitElevationFt: 14411,
    baseElevationFt: 5420,
    zone: 'high_12000_14000',
    recommendedAcclimatizationDays: 3,
    maxDailyElevationGainFt: 3500,
    oxygenPercentageEffective: 12.3,
    description:
      'Massive glaciated stratovolcano in the Cascade Range. Severe vertical relief from sea-level maritime weather to sub-freezing glaciated summit demanding staged high-camp acclimatization.',
    keyAcclimatizationCamps: [
      'Paradise Base (5,420 ft)',
      'Camp Muir (10,080 ft)',
      'Ingraham Flats (11,100 ft)',
    ],
  },
  {
    id: 'alaska-denali',
    peakName: 'Denali / Mount McKinley (Alaska Range, AK)',
    region: 'Alaska Range, AK',
    summitElevationFt: 20310,
    baseElevationFt: 7200,
    zone: 'extreme_death_zone_18000_plus',
    recommendedAcclimatizationDays: 14,
    maxDailyElevationGainFt: 2000,
    oxygenPercentageEffective: 9.8,
    description:
      'Highest peak in North America with extreme arctic barometric pressure causing effective altitude to feel significantly higher than equatorial 20,000 ft peaks.',
    keyAcclimatizationCamps: [
      'Kahiltna Base Camp (7,200 ft)',
      'Ski Hill Camp (11,000 ft)',
      'Genet Basin / 14k Camp (14,200 ft)',
      'High Camp (17,200 ft)',
    ],
  },
  {
    id: 'california-mount-whitney',
    peakName: 'Mount Whitney (Sierra Nevada, CA)',
    region: 'Sierra Nevada, CA',
    summitElevationFt: 14505,
    baseElevationFt: 8360,
    zone: 'high_12000_14000',
    recommendedAcclimatizationDays: 2,
    maxDailyElevationGainFt: 3000,
    oxygenPercentageEffective: 12.2,
    description:
      'Tallest mountain in the contiguous United States. Demanding single or multi-day alpine ascent requiring acclimatization staging at Trail Camp to reduce AMS risk before the 99 switchbacks.',
    keyAcclimatizationCamps: [
      'Whitney Portal (8,360 ft)',
      'Outpost Camp (10,360 ft)',
      'Trail Camp (12,000 ft)',
    ],
  },
  {
    id: 'mexico-pico-de-orizaba',
    peakName: 'Pico de Orizaba (Trans-Mexican Volcanic Belt)',
    region: 'Trans-Mexican Volcanic Belt, Mexico',
    summitElevationFt: 18491,
    baseElevationFt: 10500,
    zone: 'very_high_14000_18000',
    recommendedAcclimatizationDays: 5,
    maxDailyElevationGainFt: 2500,
    oxygenPercentageEffective: 10.5,
    description:
      'Highest mountain in Mexico and third highest peak in North America. Steep glaciated stratovolcano requiring acclimatization days at high mountain refugios.',
    keyAcclimatizationCamps: [
      'Tlachichuca Base (8,500 ft)',
      'Piedra Grande Hut (14,010 ft)',
      'Jamapa Glacier High Camp (15,400 ft)',
    ],
  },
];

export const ALTITUDE_MEDICAL_GEAR: AltitudeMedicalGearItem[] = [
  {
    id: 'pulse-oximeter',
    name: 'Clinical fingertip pulse oximeter with SpO2 and pulse rate monitoring',
    category: 'monitoring',
    mandatory: true,
    description:
      'Monitors resting blood oxygen saturation and heart rate fluctuations morning and evening to detect early hypoxia.',
  },
  {
    id: 'acetazolamide-diamox',
    name: 'Acetazolamide (Diamox) prescription prophylaxis with dosing protocol',
    category: 'medication_first_aid',
    mandatory: true,
    description:
      'Carbonic anhydrase inhibitor accelerating metabolic acidosis acclimatization and nocturnal breathing stimulation.',
  },
  {
    id: 'gamow-bag-o2',
    name: 'Portable hyperbaric Gamow bag or supplemental emergency O2 canister',
    category: 'oxygen_emergency',
    mandatory: true,
    description:
      'Life-saving hyperbaric chamber simulating 4,000-5,000 ft descent for severe AMS, HAPE, or HACE emergencies.',
  },
  {
    id: 'lake-louise-card',
    name: 'Lake Louise AMS symptom score assessment diagnostic card',
    category: 'monitoring',
    mandatory: true,
    description:
      'Standardized clinical scoring diagnostic rubric assessing headache, gastrointestinal symptoms, fatigue, dizziness, and mental status.',
  },
  {
    id: 'insulated-water-bottles',
    name: 'Insulated 1-liter wide-mouth water bottles with thermal neoprene parka jackets',
    category: 'hydration_electrolytes',
    mandatory: true,
    description:
      'Prevents critical water freezing in sub-zero alpine conditions to maintain essential 4-5 liter daily hydration.',
  },
  {
    id: 'electrolyte-rehydration-mix',
    name: 'High-calorie electrolyte & carbohydrate rehydration drink mix',
    category: 'hydration_electrolytes',
    mandatory: true,
    description:
      'Rapid electrolyte replenishment maintaining plasma volume and preventing hyponatremia during intense pulmonary respiration.',
  },
];

export function getAltitudeProfiles(zone?: AltitudeZone): AltitudePeakProfile[] {
  if (!zone) {
    return ALTITUDE_PEAKS;
  }
  return ALTITUDE_PEAKS.filter((p) => p.zone === zone);
}

export function getAltitudeProfileById(id: string): AltitudePeakProfile | undefined {
  return ALTITUDE_PEAKS.find((p) => p.id === id);
}

export function getAltitudeMedicalGear(): AltitudeMedicalGearItem[] {
  return ALTITUDE_MEDICAL_GEAR;
}

export function calculateAcclimatizationPlan(
  query: AcclimatizationPlanQuery
): AcclimatizationPlanResult {
  const peak = getAltitudeProfileById(query.peakId) ?? ALTITUDE_PEAKS[0];
  const targetAlt = query.targetAltitudeFt || peak.summitElevationFt;
  const currentAlt = Math.max(0, query.currentAltitudeFt || 0);
  const verticalGain = Math.max(0, targetAlt - currentAlt);
  const daysAllowed = Math.max(1, query.daysAllowed || 1);

  const recommendedDailyAscentFt = Math.round(verticalGain / daysAllowed);

  // Calculate rest days required
  let restDaysRequired = 0;
  if (targetAlt >= 18000) {
    restDaysRequired = Math.max(2, Math.floor(daysAllowed / 4));
  } else if (targetAlt >= 14000) {
    restDaysRequired = daysAllowed >= 4 ? 2 : daysAllowed >= 2 ? 1 : 0;
  } else if (targetAlt >= 10000 && daysAllowed >= 3) {
    restDaysRequired = 1;
  }

  if (query.priorAltitudeExperience === 'none' && targetAlt >= 12000) {
    restDaysRequired += 1;
  } else if (
    query.priorAltitudeExperience === 'experienced_high_altitude' &&
    restDaysRequired > 1
  ) {
    restDaysRequired -= 1;
  }

  // Calculate AMS Risk Score
  let amsScore = 0;

  if (recommendedDailyAscentFt > 3500) {
    amsScore += 4;
  } else if (recommendedDailyAscentFt > 2500) {
    amsScore += 3;
  } else if (recommendedDailyAscentFt > 1500) {
    amsScore += 2;
  } else if (recommendedDailyAscentFt > 1000) {
    amsScore += 1;
  }

  if (targetAlt >= 18000) {
    amsScore += 4;
  } else if (targetAlt >= 14000) {
    amsScore += 2;
  } else if (targetAlt >= 12000) {
    amsScore += 1;
  }

  if (daysAllowed < peak.recommendedAcclimatizationDays) {
    amsScore += 2;
  }

  if (query.climberRestingHeartRate > 80) {
    amsScore += 2;
  } else if (query.climberRestingHeartRate > 70) {
    amsScore += 1;
  }

  if (query.priorAltitudeExperience === 'none') {
    amsScore += 2;
  } else if (query.priorAltitudeExperience === 'experienced_high_altitude') {
    amsScore -= 2;
  }

  let amsRisk: AmsRiskLevel;
  if (amsScore >= 7) {
    amsRisk = 'severe';
  } else if (amsScore >= 5) {
    amsRisk = 'high';
  } else if (amsScore >= 3) {
    amsRisk = 'moderate';
  } else {
    amsRisk = 'low';
  }

  // Hydration calculation
  let hydrationRequirementLiters = 3.0;
  if (targetAlt >= 18000) {
    hydrationRequirementLiters = 5.0;
  } else if (targetAlt >= 14000) {
    hydrationRequirementLiters = 4.0;
  } else if (targetAlt >= 10000) {
    hydrationRequirementLiters = 3.5;
  }
  if (recommendedDailyAscentFt > 2500) {
    hydrationRequirementLiters += 0.5;
  }

  const gamowBagOrO2Recommended =
    targetAlt >= 18000 ||
    amsRisk === 'severe' ||
    (targetAlt >= 14000 && amsRisk === 'high');

  let climbHighSleepLowSchedule: string;
  if (targetAlt >= 18000) {
    climbHighSleepLowSchedule =
      'Stage at 14,000 ft Camp for 3-4 days. Carry cache loads to 16,500-17,200 ft, then descend back to 14,000 ft to sleep before final summit push.';
  } else if (targetAlt >= 14000) {
    climbHighSleepLowSchedule =
      'Ascend to high camp (10,000-11,500 ft) on Day 1. Hike 1,500 ft higher for evening active acclimatization, return to camp to sleep, and summit on Day 2/3.';
  } else {
    climbHighSleepLowSchedule =
      'Maintain active ascent with rest stops every 1,000 ft vertical gain. Sleep at base trailhead elevation prior to summit day.';
  }

  let medicalAdvisory: string;
  if (amsRisk === 'severe') {
    medicalAdvisory =
      'CRITICAL: Extreme risk of HAPE (High Altitude Pulmonary Edema) and HACE (High Altitude Cerebral Edema). Do NOT ascend further if experiencing persistent headache, ataxia, or confusion. Immediate descent of 2,000-3,000 ft and emergency hyperbaric/O2 protocol required.';
  } else if (amsRisk === 'high') {
    medicalAdvisory =
      'HIGH WARNING: Elevated risk of Acute Mountain Sickness (Lake Louise score >= 5). Consider prophylactic Acetazolamide (Diamox 125mg BID), enforce mandatory hydration, and delay ascent if resting SpO2 falls below 80%.';
  } else if (amsRisk === 'moderate') {
    medicalAdvisory =
      'MODERATE CAUTION: Monitor morning and evening SpO2 and resting pulse. Enforce "Climb High, Sleep Low" protocol and allow at least one full rest day before exceeding 14,000 ft.';
  } else {
    medicalAdvisory =
      'STABLE: Gradual ascent profile aligns with acclimatization physiology. Maintain 3-4L hydration, eat frequent complex carbohydrates, and monitor team members for early AMS symptoms.';
  }

  return {
    peakName: peak.peakName,
    recommendedDailyAscentFt,
    restDaysRequired,
    amsRisk,
    climbHighSleepLowSchedule,
    hydrationRequirementLiters,
    gamowBagOrO2Recommended,
    medicalAdvisory,
  };
}
