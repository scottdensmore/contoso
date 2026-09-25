export type IceType = 'black_ice' | 'white_snow_ice' | 'candled_ice';
export type WildIceSafetyStatus =
  | 'safe_touring_window'
  | 'marginal_caution_scouting_only'
  | 'unsafe_icefall_submersion_hazard';

export interface WildIceVenue {
  id: string;
  title: string;
  waterBody: string;
  region: string;
  surfaceElevationM: number;
  iceType: IceType;
  defaultThicknessCm: number;
  typicalTourKm: number;
  description: string;
  highlights: string[];
}

export interface WildIceQuery {
  venueId: string;
  iceType: IceType; // default 'black_ice'
  thicknessCm: number; // 2.0 to 30.0 cm, default 8.0
  skaterWeightLbs: number; // 120 to 320 lbs, default 180
  ambientTempF: number; // -20 to 40 F, default 22
}

export interface WildIceResult {
  venueTitle: string;
  effectiveThicknessCm: number;
  safeLoadCapacityLbs: number;
  acousticResonanceHz: number;
  resonanceDescription: string;
  safetyStatus: WildIceSafetyStatus;
  advisory: string;
}

export interface WildIceGearItem {
  id: string;
  name: string;
  category:
    | 'self_rescue'
    | 'probing'
    | 'buoyancy'
    | 'rescue'
    | 'traction'
    | 'hypothermia';
  mandatory: boolean;
  description: string;
}

export const WILD_ICE_VENUES: WildIceVenue[] = [
  {
    id: 'lake-malaren-archipelago',
    title: 'Lake Mälaren & Stockholm Archipelago',
    waterBody: 'Lake Mälaren & Baltic Archipelago',
    region: 'Stockholm County, Sweden',
    surfaceElevationM: 1,
    iceType: 'black_ice',
    defaultThicknessCm: 9.0,
    typicalTourKm: 35,
    description:
      'Sweden’s storied cradle of Nordic tour skating (Långfärdsskridskor). Vast black congelation sheets connect freshwater bays to brackish Baltic outer skerries with musical singing ice resonance.',
    highlights: [
      'Black mirror congelation ice',
      'Archipelago island hopping corridors',
      'Hydroacoustic singing ice resonance',
    ],
  },
  {
    id: 'lake-siljan-dalarna',
    title: 'Lake Siljan & Orsa Wild Ice Circuit',
    waterBody: 'Lake Siljan & Lake Orsa',
    region: 'Dalarna, Sweden',
    surfaceElevationM: 161,
    iceType: 'black_ice',
    defaultThicknessCm: 12.0,
    typicalTourKm: 45,
    description:
      'Formed inside a 377-million-year-old meteorite impact crater, Lake Siljan provides expansive, dark glass ice runs where skaters log 50km loops punctuated by midwinter expansion booms.',
    highlights: [
      'Crater lake vast ice expanses',
      'Nordic skate heel-free touring tracks',
      'Midwinter thermal expansion booming',
    ],
  },
  {
    id: 'lake-baikal-olkhon',
    title: 'Lake Baikal & Olkhon Island Strait',
    waterBody: 'Lake Baikal (Olkhon Gate)',
    region: 'Siberian Taiga, Russia',
    surfaceElevationM: 456,
    iceType: 'black_ice',
    defaultThicknessCm: 18.0,
    typicalTourKm: 60,
    description:
      'The deepest and clearest wild ice sheet on Earth. Skate over crystal abysses revealing submerged granite cliffs, azure pressure hummocks, and infinite black ice mirrors.',
    highlights: [
      'Deepest clear wild ice in the world',
      'Meter-high pressure ridges and hummocks',
      'Translucent blue ice chasms',
    ],
  },
  {
    id: 'lake-moraine-banff',
    title: 'Lake Moraine & Bow Valley Alpine Tarns',
    waterBody: 'Moraine Lake & Bow Valley Tarns',
    region: 'Banff National Park, AB, Canada',
    surfaceElevationM: 1884,
    iceType: 'white_snow_ice',
    defaultThicknessCm: 8.0,
    typicalTourKm: 15,
    description:
      'A fleeting high-alpine early winter window where glacial flour lakes freeze into brilliant turquoise and white snow ice before heavy Canadian Rockies snowfalls bury the sheet.',
    highlights: [
      'Sub-zero early-season window',
      'Valley of the Ten Peaks reflection',
      'Wind-scoured glacial tarn wild ice',
    ],
  },
  {
    id: 'lake-superior-chequamegon',
    title: 'Chequamegon Bay & Apostle Islands Wild Ice',
    waterBody: 'Lake Superior (Chequamegon Bay)',
    region: 'Lake Superior, WI, USA',
    surfaceElevationM: 183,
    iceType: 'black_ice',
    defaultThicknessCm: 10.0,
    typicalTourKm: 25,
    description:
      'Wild maritime lake ice rimming dramatic sandstone sea caves. Fast Nordic gliding alongside crystalline ice stalactites, subject to rapid Great Lakes offshore wind rifts.',
    highlights: [
      'Sea cave ice stalactite corridors',
      'Great Lakes offshore wind rift hazard',
      'Open pressure lead jumping channels',
    ],
  },
];

export const WILD_ICE_GEAR: WildIceGearItem[] = [
  {
    id: 'neck-worn-ice-claws',
    name: 'Dual Hand Ice Claws (Ispiggar) with Emergency Neck Lanyard',
    category: 'self_rescue',
    mandatory: true,
    description:
      'Hardened steel picks worn high around the neck with a chest strap, enabling instantaneous self-arrest and clawing traction out of an ice hole onto slippery ice sheet edges.',
  },
  {
    id: 'nordic-ice-pike-staff',
    name: 'Hardened Chisel-Tip Ice Probing Pole (Pik) for Sound & Depth Testing',
    category: 'probing',
    mandatory: true,
    description:
      'Weighted Nordic skate pole with hardened steel chisel tip for probing ice thickness on the fly, assessing congelation quality by pitch and structural strike resistance.',
  },
  {
    id: 'buoyant-skate-backpack',
    name: 'Waterproof Drybag Backpack with Crotch Strap & Waist Belt for Flotation',
    category: 'buoyancy',
    mandatory: true,
    description:
      'Specialized 35–45L touring pack with airtight roll-top drybag liner, harness waist belt, and critical crotch strap preventing the pack from riding up over your head during submersion.',
  },
  {
    id: 'throw-rescue-lifeline',
    name: '25-Meter Floating Rescue Throw Line (Räddningslina) with Carabiner',
    category: 'rescue',
    mandatory: true,
    description:
      'Weighted deployment throw bag with floating poly rope and secure carabiner harness attachment mounted on the exterior pack belt for rapid teammate rescue.',
  },
  {
    id: 'heel-free-nordic-blades',
    name: '45cm Tool-Steel Nordic Tour Skates with NNN/BC Cross-Country Bindings',
    category: 'traction',
    mandatory: true,
    description:
      'Long-radius tool steel speed blades mounted to Nordic cross-country ski bindings allowing free-heel ergonomic striding across uneven natural lake ice.',
  },
  {
    id: 'sealed-dry-change-kit',
    name: 'Full Thermal Base Layer and Fleece Change Set in Submersible Dry Sack',
    category: 'hypothermia',
    mandatory: true,
    description:
      'Complete vacuum-packed change of wool base layers, windproof socks, fleece midlayer, and towel to immediately halt catastrophic post-submersion hypothermia.',
  },
];

export function getWildIceVenues(iceType?: IceType): WildIceVenue[] {
  if (!iceType) return WILD_ICE_VENUES;
  return WILD_ICE_VENUES.filter((venue) => venue.iceType === iceType);
}

export function getWildIceVenueById(id: string): WildIceVenue | undefined {
  return WILD_ICE_VENUES.find((venue) => venue.id === id);
}

export function getWildIceGear(): WildIceGearItem[] {
  return WILD_ICE_GEAR;
}

export function calculateWildIce(query: WildIceQuery): WildIceResult {
  const venue = getWildIceVenueById(query.venueId);
  const venueTitle = venue ? venue.title : 'Wild Ice Touring Arena';

  // 1. Calculate effective thickness
  let multiplier = 1.0;
  if (query.iceType === 'white_snow_ice') {
    multiplier = 0.5;
  } else if (query.iceType === 'candled_ice') {
    multiplier = 0.0;
  }
  const effectiveThicknessCm = Math.round(query.thicknessCm * multiplier * 10) / 10;

  // 2. Safe load capacity via Gold's formula
  const safeLoadCapacityLbs =
    effectiveThicknessCm > 0
      ? Math.round(50 * Math.pow(effectiveThicknessCm, 2))
      : 0;

  // 3. Acoustic resonance frequency
  const acousticResonanceHz =
    effectiveThicknessCm > 0
      ? Math.round(1200 / Math.sqrt(effectiveThicknessCm))
      : 0;

  // 4. Resonance description
  let resonanceDescription: string;
  if (acousticResonanceHz >= 600) {
    resonanceDescription =
      'High Singing Resonance (Thin Resonant Membrane)';
  } else if (acousticResonanceHz >= 350) {
    resonanceDescription =
      'Mid-Frequency Singing (Moderate Congelation Ice)';
  } else if (acousticResonanceHz > 0) {
    resonanceDescription =
      'Deep Low-Frequency Booming (Thick Structural Sheet)';
  } else {
    resonanceDescription = 'Muffled Decay (Structural Integrity Nil)';
  }

  // 5. Safety status logic
  let safetyStatus: WildIceSafetyStatus;
  let advisory: string;

  if (
    effectiveThicknessCm < 4.5 ||
    query.iceType === 'candled_ice' ||
    query.ambientTempF > 36 ||
    query.skaterWeightLbs > safeLoadCapacityLbs
  ) {
    safetyStatus = 'unsafe_icefall_submersion_hazard';
    if (query.iceType === 'candled_ice') {
      advisory =
        'SUBMERSION HAZARD: Candled spring ice has decoupled vertical crystal boundaries with zero load capacity. Severe breakout submersion risk. Do not skate.';
    } else if (query.ambientTempF > 36) {
      advisory =
        'SUBMERSION HAZARD: Ambient air temperature above 36°F causes rapid solar radiation decay and structural isothermal melt. Breakthrough imminent.';
    } else if (query.skaterWeightLbs > safeLoadCapacityLbs) {
      advisory =
        'SUBMERSION HAZARD: Skater total load exceeds Gold’s bearing capacity formula for this ice sheet. High breakthrough hazard.';
    } else {
      advisory =
        'SUBMERSION HAZARD: Effective structural ice thickness is below the 4.5 cm minimum threshold. High risk of catastrophic cold water submersion.';
    }
  } else if (effectiveThicknessCm < 7.0 || query.ambientTempF > 32) {
    safetyStatus = 'marginal_caution_scouting_only';
    if (query.ambientTempF > 32) {
      advisory =
        'CAUTION & PIKE PROBING: Ambient temperature above freezing (33–36°F) softens top skate glaze. Continuous ice pike strikes required to test strength.';
    } else {
      advisory =
        'CAUTION & PIKE PROBING: Marginal ice thickness (4.5–7.0 cm). Approved for cautious scouting with 50-meter separation and continuous pike sound testing.';
    }
  } else {
    safetyStatus = 'safe_touring_window';
    advisory =
      'SAFE TOURING WINDOW: Congelation black ice sheet displays structural integrity. Acoustic singing tones indicate high elastic modulus. Maintain mandatory Nordic safety kit.';
  }

  return {
    venueTitle,
    effectiveThicknessCm,
    safeLoadCapacityLbs,
    acousticResonanceHz,
    resonanceDescription,
    safetyStatus,
    advisory,
  };
}
