export type ShelterDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ShelterEnvironment =
  | 'alpine_snow_drift'
  | 'subarctic_tundra'
  | 'shallow_snow_slope'
  | 'boreal_forest'
  | 'conifer_tree_well';

export interface SurvivalShelter {
  id: string;
  title: string;
  environment: ShelterEnvironment;
  minSnowDepthM: number;
  difficulty: ShelterDifficulty;
  constructionHours: number;
  capacityPersons: number;
  interiorThermalGainF: number;
  minRoofThicknessCm: number;
  description: string;
  highlights: string[];
}

export interface ShelterThermodynamicsQuery {
  shelterId: string;
  ambientTempF: number; // -40 to 32 F, default 0
  occupantCount: number; // 1 to 4 persons, default 2
  wallThicknessCm: number; // 15 to 80 cm, default 30
  ventHoleDiameterCm: number; // 5 to 20 cm, default 10
  platformHeightAboveFloorCm: number; // 0 to 60 cm, default 35
  candleLit: boolean; // default false
}

export interface ShelterThermodynamicsResult {
  shelterTitle: string;
  interiorTempF: number;
  floorTempF: number;
  wallRValue: number;
  coldTrapDifferentialF: number;
  ventilationAdequacyPercent: number;
  structuralSafetyStatus: 'safe' | 'caution' | 'critical_hazard';
  thermalAdvisory: string;
}

export interface ShelterGearItem {
  id: string;
  name: string;
  category:
    | 'excavation'
    | 'cutting_shaping'
    | 'thermal_insulation'
    | 'ground_barrier'
    | 'ventilation'
    | 'heat_atmosphere';
  mandatory: boolean;
  description: string;
}

export const SURVIVAL_SHELTERS: SurvivalShelter[] = [
  {
    id: 'alpine-snow-cave-bivouac',
    title: 'Deep Drift Alpine Snow Cave with Cold-Air Well',
    environment: 'alpine_snow_drift',
    minSnowDepthM: 2.0,
    difficulty: 'advanced',
    constructionHours: 3.5,
    capacityPersons: 2,
    interiorThermalGainF: 32,
    minRoofThicknessCm: 30,
    description:
      'Subterranean snow shelter dug into windward or leeward consolidated drifts featuring an elevated sleeping shelf above an excavated cold-air drainage sink and angled ventilation chimney.',
    highlights: [
      'Raised sleeping platform above cold trap',
      'Angled ski-pole ventilation chimney',
      'Smooth domed ceiling preventing drip',
    ],
  },
  {
    id: 'subarctic-quinzhee-snow-mound',
    title: 'Sintered Subarctic Quinzhee Snow Mound',
    environment: 'subarctic_tundra',
    minSnowDepthM: 0.8,
    difficulty: 'intermediate',
    constructionHours: 4.5,
    capacityPersons: 3,
    interiorThermalGainF: 28,
    minRoofThicknessCm: 25,
    description:
      'Sintered dome constructed by shoveling powdery snow into a high mound, inserting 10-inch guide sticks, resting 2 hours for crystal bonding (sintering), then hollowing the interior.',
    highlights: [
      'Sintering crystal metamorphosis',
      'Stick-depth wall thickness calibration',
      'Low wind profile dome geometry',
    ],
  },
  {
    id: 'emergency-snow-trench-tarp',
    title: 'Emergency Hypothermia Snow Trench with Ski Roof',
    environment: 'shallow_snow_slope',
    minSnowDepthM: 1.2,
    difficulty: 'beginner',
    constructionHours: 1.2,
    capacityPersons: 1,
    interiorThermalGainF: 20,
    minRoofThicknessCm: 15,
    description:
      'Fast-deployment survival trench dug just wider than a bivy bag, bridged with skis/poles and insulated with cut snow blocks or tarp.',
    highlights: [
      'Rapid sub-90-minute deployment',
      'A-frame ski and pole structural rafters',
      'Full ground blizzard protection',
    ],
  },
  {
    id: 'boreal-debris-hut-lean-to',
    title: 'Boreal Forest Heavy Debris Thermal Cocoon',
    environment: 'boreal_forest',
    minSnowDepthM: 0.0,
    difficulty: 'intermediate',
    constructionHours: 3.0,
    capacityPersons: 1,
    interiorThermalGainF: 22,
    minRoofThicknessCm: 60,
    description:
      'Dense thermal cocoon constructed from a stout ridgepole, ribbing branches, and two to three feet of dry leaf and pine needle loft.',
    highlights: [
      'Dense dead-air space lofting',
      'Waterproof exterior shingle bark layer',
      'Thick 12-inch bough bed insulation',
    ],
  },
  {
    id: 'tree-well-snow-bivouac',
    title: 'Conifer Tree-Well Natural Snow Shelter',
    environment: 'conifer_tree_well',
    minSnowDepthM: 1.5,
    difficulty: 'beginner',
    constructionHours: 1.5,
    capacityPersons: 2,
    interiorThermalGainF: 18,
    minRoofThicknessCm: 20,
    description:
      'Exploiting natural ground depression under sheltering low spruce or fir boughs, reinforced with cut snow blocks and insulated bench.',
    highlights: [
      'Pre-excavated natural depression',
      'Canopy wind and precipitation shield',
      'Quick bough bed platform installation',
    ],
  },
];

export const SHELTER_GEAR: ShelterGearItem[] = [
  {
    id: 'd-grip-avalanche-snow-shovel',
    name: 'Tempered Aluminum Extendable D-Grip Snow Shovel with Hoe Mode',
    category: 'excavation',
    mandatory: true,
    description:
      'Rugged 6061 T6 aluminum shovel blade with hoe conversion mode for fast excavating, block shaping, and cavern hollow-out.',
  },
  {
    id: 'folding-snow-bone-saw',
    name: '35cm Stainless Steel Aggressive Tooth Snow & Wood Saw',
    category: 'cutting_shaping',
    mandatory: true,
    description:
      'Dual-purpose saw with laser-cut teeth to slice uniform structural snow blocks for doorways, quinzhees, and igloo tiers.',
  },
  {
    id: 'thermal-bivy-survival-bag',
    name: 'Waterproof Breathable Reflective Thermal Survival Bivy Sack',
    category: 'thermal_insulation',
    mandatory: true,
    description:
      'Heat-reflective metallized interior lining reflecting 90% body heat while preventing melting snow from soaking sleep systems.',
  },
  {
    id: 'closed-cell-foam-sleeping-pad',
    name: 'Dual-Density Closed-Cell Foam Sleeping Pad (R-Value 2.5+)',
    category: 'ground_barrier',
    mandatory: true,
    description:
      'Impermeable closed-cell foam insulation preventing conductive heat loss between the warm body and subzero snow shelf.',
  },
  {
    id: 'angled-ventilation-probe',
    name: '240cm Aluminum Avalanche Probe & Vent Hole Punch',
    category: 'ventilation',
    mandatory: true,
    description:
      'Used to clear and test snow depth, punch angled ceiling ventilation chimneys, and maintain critical oxygen airflow.',
  },
  {
    id: 'survival-candle-lantern',
    name: 'Long-Burn Wax Candle Lantern with Carabiner Hook',
    category: 'heat_atmosphere',
    mandatory: true,
    description:
      'Provides 150+ BTUs of gentle radiant warmth to glaze interior walls and acts as an early atmospheric oxygen-depletion indicator.',
  },
];

export function getSurvivalShelters(difficulty?: ShelterDifficulty): SurvivalShelter[] {
  if (!difficulty) {
    return [...SURVIVAL_SHELTERS];
  }
  return SURVIVAL_SHELTERS.filter((s) => s.difficulty === difficulty);
}

export function getSurvivalShelterById(id: string): SurvivalShelter | undefined {
  return SURVIVAL_SHELTERS.find((s) => s.id === id);
}

export function getShelterGear(): ShelterGearItem[] {
  return [...SHELTER_GEAR];
}

export function calculateShelterThermodynamics(
  query: ShelterThermodynamicsQuery
): ShelterThermodynamicsResult {
  const shelter =
    SURVIVAL_SHELTERS.find((s) => s.id === query.shelterId) || SURVIVAL_SHELTERS[0];
  const shelterTitle = shelter.title;

  const wallRValue = Math.round((query.wallThicknessCm / 2.54) * 10) / 10;
  const coldTrapDifferentialF = Math.min(
    18,
    Math.round((query.platformHeightAboveFloorCm / 30.0) * 12)
  );

  const occupantFactor = Math.min(1.5, query.occupantCount * 0.7);
  const candleHeat = query.candleLit ? 4 : 0;
  const unconstrained =
    query.ambientTempF +
    shelter.interiorThermalGainF * occupantFactor +
    coldTrapDifferentialF +
    candleHeat;

  const interiorTempF = Math.min(
    32,
    Math.max(query.ambientTempF + 4, Math.round(unconstrained))
  );
  const floorTempF = Math.round(interiorTempF - coldTrapDifferentialF);

  const ventArea = Math.PI * Math.pow(query.ventHoleDiameterCm / 2, 2);
  const reqArea = query.occupantCount * 15.0;
  const ventilationAdequacyPercent = Math.min(
    200,
    Math.round((ventArea / reqArea) * 100)
  );

  let structuralSafetyStatus: 'safe' | 'caution' | 'critical_hazard' = 'safe';
  if (
    query.ventHoleDiameterCm < 6 ||
    query.wallThicknessCm < 18 ||
    interiorTempF < -10
  ) {
    structuralSafetyStatus = 'critical_hazard';
  } else if (
    query.ventHoleDiameterCm < 9 ||
    query.platformHeightAboveFloorCm < 20 ||
    query.wallThicknessCm < 24
  ) {
    structuralSafetyStatus = 'caution';
  } else {
    structuralSafetyStatus = 'safe';
  }

  let thermalAdvisory = '';
  if (structuralSafetyStatus === 'critical_hazard') {
    if (query.ventHoleDiameterCm < 6) {
      thermalAdvisory =
        'CRITICAL HAZARD: Ventilation chimney diameter (<6 cm) risks fatal carbon dioxide accumulation and oxygen depletion. Clear vent hole immediately.';
    } else if (query.wallThicknessCm < 18) {
      thermalAdvisory =
        'CRITICAL HAZARD: Structural snow roof/wall thickness (<18 cm) poses severe collapse hazard under snowpack weight. Reinforce immediately.';
    } else {
      thermalAdvisory =
        'CRITICAL HAZARD: Interior sleeping platform temperature is below -10°F. Immediate risk of acute hypothermia and severe frostbite.';
    }
  } else if (structuralSafetyStatus === 'caution') {
    if (query.platformHeightAboveFloorCm < 20) {
      thermalAdvisory =
        'CAUTION: Sleeping platform height (<20 cm) is too close to cold drainage sink. Elevate sleeping bench to capture convective thermal dome.';
    } else if (query.ventHoleDiameterCm < 9) {
      thermalAdvisory =
        'CAUTION: Ventilation chimney diameter (<9 cm) provides restricted airflow. Monitor frequently for riming and frost blockage.';
    } else {
      thermalAdvisory =
        'CAUTION: Snow wall thickness (<24 cm) offers reduced thermal retention margin. Bank additional exterior drift snow.';
    }
  } else {
    thermalAdvisory =
      'STABLE MICROCLIMATE: Optimal snow envelope and cold-air drainage sink functioning. Angled vent chimney supplies ample oxygen exchange.';
  }

  return {
    shelterTitle,
    interiorTempF,
    floorTempF,
    wallRValue,
    coldTrapDifferentialF,
    ventilationAdequacyPercent,
    structuralSafetyStatus,
    thermalAdvisory,
  };
}
