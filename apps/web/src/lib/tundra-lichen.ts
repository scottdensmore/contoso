export type LichenMorphology =
  | 'crustose_saxicolous'
  | 'foliose_macrolichen'
  | 'fruticose_macrolichen'
  | 'squamulose_soil_crust';

export type SubstrateType =
  | 'volcanic_basalt_outcrop'
  | 'granitic_gneiss_boulder'
  | 'glacial_till_gravel'
  | 'calcareous_limestone_shale'
  | 'acidic_peat_tussock';

export type PermafrostStatus =
  | 'continuous_permafrost'
  | 'discontinuous_permafrost'
  | 'alpine_permafrost_islands'
  | 'sporadic_permafrost';

export type AirQualityDeposition =
  | 'pristine_baseline'
  | 'moderate_drift'
  | 'elevated_anthropogenic';

export type LichenConservationStatus =
  | 'optimal_pristine_climax'
  | 'vulnerable_microclimate_shift'
  | 'critical_cryoturbation_disturbance';

export interface TundraLichenSite {
  id: string;
  title: string;
  region: string;
  range: string;
  elevationMeters: number;
  dominantMorphology: LichenMorphology;
  substrateType: SubstrateType;
  permafrostStatus: PermafrostStatus;
  description: string;
  highlights: string[];
}

export interface LichenDynamicsQuery {
  siteId: string;
  morphology: LichenMorphology; // default 'crustose_saxicolous'
  substrate: SubstrateType; // default 'volcanic_basalt_outcrop'
  colonyDiameterMm: number; // 10 to 300 mm, default 65
  annualGrowthRateMmYr: number; // 0.10 to 3.00 mm/yr, default 0.50
  uvExposureIndex: number; // 1 to 10, default 6
  snowCoverDurationMonths: number; // 4 to 10 months, default 7
  airDeposition: AirQualityDeposition; // default 'pristine_baseline'
}

export interface LichenDynamicsResult {
  siteTitle: string;
  estimatedColonyAgeYears: number;
  bioindicatorHealthIndex: number; // 0.00 to 1.00
  desiccationResilienceScore: number; // 0.0 to 100.0
  conservationStatus: LichenConservationStatus;
  lichenometryAdvisory: string;
  chemicalSpotTestProtocol: string;
}

export interface LichenGearItem {
  id: string;
  name: string;
  category: 'optical' | 'chemical' | 'collection' | 'measurement' | 'storage';
  mandatory: boolean;
  description: string;
}

export const TUNDRA_LICHEN_SITES: TundraLichenSite[] = [
  {
    id: 'denali-polychrome-pass',
    title: 'Polychrome Pass Permafrost Tundra & Saxicolous Fellfield',
    region: 'Denali National Park, Alaska, USA',
    range: 'Alaska Range',
    elevationMeters: 1100,
    dominantMorphology: 'crustose_saxicolous',
    substrateType: 'volcanic_basalt_outcrop',
    permafrostStatus: 'continuous_permafrost',
    description:
      'Vibrant polychrome mineral ridge featuring multi-colored Rhizocarpon geographicum crustose lichens and arctic alpine fellfield mats.',
    highlights: [
      'Ancient map lichen (Rhizocarpon geographicum) colonies',
      'Wind-scoured permafrost fellfield bryophyte mounds',
      'Extreme sub-zero desiccation adaptation zone',
    ],
  },
  {
    id: 'torngat-mountains-fjords',
    title: 'Torngat Mountains Arctic Fjord Lichen Barrens',
    region: 'Newfoundland & Labrador, Canada',
    range: 'Torngat Mountains',
    elevationMeters: 850,
    dominantMorphology: 'fruticose_macrolichen',
    substrateType: 'granitic_gneiss_boulder',
    permafrostStatus: 'continuous_permafrost',
    description:
      'Subarctic coastal fjord plateau colonized by dense reindeer lichen carpets (Cladonia rangiferina) and coastal arctic bryophytes.',
    highlights: [
      'Dense Cladonia stellaris and rangiferina lichen mats',
      'Caribou winter grazing ecological bioindicator plots',
      'Coastal subarctic fjord microclimate corridors',
    ],
  },
  {
    id: 'wrangell-st-elias-root-glacier',
    title: 'Root Glacier Lateral Moraine Bryophyte Succession Basin',
    region: 'Kennecott, Alaska, USA',
    range: 'Wrangell Mountains',
    elevationMeters: 670,
    dominantMorphology: 'foliose_macrolichen',
    substrateType: 'glacial_till_gravel',
    permafrostStatus: 'discontinuous_permafrost',
    description:
      'Primary glacial moraine succession study area showcasing pelt lichens (Peltigera) and pioneering pioneer mosses on gravel benches.',
    highlights: [
      'Nitrogen-fixing cyanolichen (Peltigera aphthosa) beds',
      'Post-glacial moraine chronological succession stages',
      'Moist riparian meltwater microhabitats',
    ],
  },
  {
    id: 'beartooth-plateau-alpine-tundra',
    title: 'Beartooth Plateau High-Alpine Cryoturbation Flats',
    region: 'Montana / Wyoming border, USA',
    range: 'Beartooth Mountains',
    elevationMeters: 3300,
    dominantMorphology: 'squamulose_soil_crust',
    substrateType: 'calcareous_limestone_shale',
    permafrostStatus: 'alpine_permafrost_islands',
    description:
      'Expansive 10,000ft alpine tundra plateau exhibiting patterned ground cryoturbation polygons and rock tripe (Umbilicaria) colonies.',
    highlights: [
      'Cryoturbation frost-heave polygon soil crusts',
      'High-angle Umbilicaria cliff-face saxicolous colonies',
      'High-ultraviolet alpine radiation resilience',
    ],
  },
  {
    id: 'brooks-range-anaktuvuk-pass',
    title: 'Anaktuvuk Pass Arctic Foothills Tundra Bryoflora',
    region: 'North Slope, Alaska, USA',
    range: 'Brooks Range',
    elevationMeters: 660,
    dominantMorphology: 'fruticose_macrolichen',
    substrateType: 'acidic_peat_tussock',
    permafrostStatus: 'continuous_permafrost',
    description:
      'High-latitude tussock tundra supporting arctic Thamnolia vermicularis (whiteworm lichen), Sphagnum bogs, and permafrost ice-wedge polygons.',
    highlights: [
      'Endemic arctic Thamnolia vermicularis colonies',
      'Thawing permafrost thermo-erosion gullying surveys',
      'Pristine arctic air quality baseline biomonitoring',
    ],
  },
];

export const LICHEN_GEAR_CHECKLIST: LichenGearItem[] = [
  {
    id: 'achromatic-field-loupe-20x',
    name: '20x Hastings Triplet Achromatic Field Hand Lens with LED',
    category: 'optical',
    mandatory: true,
    description:
      'Essential distortion-free magnification for resolving apothecia, soredia, and isidia micro-structures',
  },
  {
    id: 'chemical-spot-test-reagent-kit',
    name: 'Micro-Dropper Spot Reagent Vial Set (KOH, P-Phenylenediamine, Sodium Hypochlorite)',
    category: 'chemical',
    mandatory: true,
    description:
      'Reagent color-change test kit for detecting secondary lichen acid metabolites in thallus tissues',
  },
  {
    id: 'subarctic-specimen-chisels',
    name: 'Hardened Geological Cold Chisel & Rubber-Grip Masonry Hammer',
    category: 'collection',
    mandatory: true,
    description:
      'Precision tools for collecting minimal saxicolous voucher specimens without shattering rock matrix',
  },
  {
    id: 'digital-lichenometry-caliper',
    name: 'Waterproof Stainless Digital Micrometer Caliper (0.01mm resolution)',
    category: 'measurement',
    mandatory: true,
    description:
      'High-precision measurement tool for documenting thallus colony diameters in lichenometric surface dating',
  },
  {
    id: 'breathable-specimen-herbarium-packets',
    name: 'Acid-Free 100% Cotton Rag Herbarium Specimen Packets with Field Labels',
    category: 'storage',
    mandatory: true,
    description:
      'Permits specimen desiccation and prevents mold during remote multi-week subarctic expeditions',
  },
  {
    id: 'field-uv-fluorescence-torch',
    name: '365nm High-Output UV Blacklight Fluorescence Torch',
    category: 'optical',
    mandatory: true,
    description:
      'Excites fluorescence in specific lichen acids such as xanthones and depsidones for nocturnal and field identification',
  },
];

export function getTundraLichenSites(morphology?: LichenMorphology): TundraLichenSite[] {
  if (!morphology) {
    return TUNDRA_LICHEN_SITES;
  }
  return TUNDRA_LICHEN_SITES.filter((site) => site.dominantMorphology === morphology);
}

export function getTundraLichenSiteById(id: string): TundraLichenSite | undefined {
  return TUNDRA_LICHEN_SITES.find((site) => site.id === id);
}

export function getLichenGearChecklist(): LichenGearItem[] {
  return LICHEN_GEAR_CHECKLIST;
}

export function calculateLichenDynamics(query: LichenDynamicsQuery): LichenDynamicsResult {
  const site = getTundraLichenSiteById(query.siteId) ?? TUNDRA_LICHEN_SITES[0];
  const estimatedColonyAgeYears = Math.round(
    query.colonyDiameterMm / query.annualGrowthRateMmYr
  );

  const airFactor =
    query.airDeposition === 'pristine_baseline'
      ? 1.0
      : query.airDeposition === 'moderate_drift'
        ? 0.75
        : 0.5;

  const uvPenalty = Math.max(0, (query.uvExposureIndex - 5) * 0.04);
  const snowFactor = 1.0 - Math.abs(query.snowCoverDurationMonths - 7) * 0.05;

  const bioindicatorHealthIndex = Math.min(
    0.99,
    Math.max(0.15, Math.round((airFactor * snowFactor - uvPenalty) * 100) / 100)
  );

  const desiccationResilienceScore = Math.round(
    Math.min(99.0, Math.max(20.0, bioindicatorHealthIndex * 70.0 + query.uvExposureIndex * 3.0))
  );

  let conservationStatus: LichenConservationStatus;
  if (
    bioindicatorHealthIndex < 0.5 ||
    query.airDeposition === 'elevated_anthropogenic'
  ) {
    conservationStatus = 'critical_cryoturbation_disturbance';
  } else if (bioindicatorHealthIndex < 0.75 || query.uvExposureIndex >= 8) {
    conservationStatus = 'vulnerable_microclimate_shift';
  } else {
    conservationStatus = 'optimal_pristine_climax';
  }

  let lichenometryAdvisory: string;
  if (estimatedColonyAgeYears > 300) {
    lichenometryAdvisory = `Lichenometric thallus diameter (${query.colonyDiameterMm} mm) reveals an ancient surface exposure age of ~${estimatedColonyAgeYears} years on ${query.substrate.replace(/_/g, ' ')}. Substrate has maintained permafrost cryic stability since early neoglacial moraine stabilization.`;
  } else if (estimatedColonyAgeYears > 100) {
    lichenometryAdvisory = `Lichenometric thallus diameter (${query.colonyDiameterMm} mm) yields an estimated surface exposure age of ~${estimatedColonyAgeYears} years on ${query.substrate.replace(/_/g, ' ')}. Represents stabilized post-Little Ice Age subarctic bedrock colonization.`;
  } else {
    lichenometryAdvisory = `Lichenometric thallus diameter (${query.colonyDiameterMm} mm) indicates pioneering surface exposure of ~${estimatedColonyAgeYears} years on ${query.substrate.replace(/_/g, ' ')}. Characteristic of active periglacial retreat, recent scree displacement, or cryoturbation renewal.`;
  }

  let chemicalSpotTestProtocol: string;
  switch (query.morphology) {
    case 'crustose_saxicolous':
      chemicalSpotTestProtocol =
        'KOH (K) test: K+ yellow turning deep red (norstictic acid crystals under polarized light). C test: C- negative. PD (P) test: PD+ orange-red (stictic acid complex). Apply 10% KOH micro-droplet to upper cortex under 20x loupe.';
      break;
    case 'foliose_macrolichen':
      chemicalSpotTestProtocol =
        'KOH (K) test: K- negative or pale yellow. C test: C+ bright carmine-red (gyrophoric/lecanoric acid in medulla). PD (P) test: PD- negative. Confirm presence of cephalodia and tomentum on lower cortex.';
      break;
    case 'fruticose_macrolichen':
      chemicalSpotTestProtocol =
        'KOH (K) test: K+ persistent bright canary yellow (thamnolic acid). C test: C- negative. PD (P) test: PD+ deep orange (fumarprotocetraric acid). UV 365nm fluorescence emits vibrant chalky white.';
      break;
    case 'squamulose_soil_crust':
    default:
      chemicalSpotTestProtocol =
        'KOH (K) test: K+ yellow (atranorin). C test: C- negative or faint pink. PD (P) test: PD+ pale yellow (psoromic acid). Micro-scrape apothecial margin to preserve basal squamules.';
      break;
  }

  return {
    siteTitle: site.title,
    estimatedColonyAgeYears,
    bioindicatorHealthIndex,
    desiccationResilienceScore,
    conservationStatus,
    lichenometryAdvisory,
    chemicalSpotTestProtocol,
  };
}
