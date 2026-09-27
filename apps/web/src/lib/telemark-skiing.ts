export type BindingSystem = 'ntn_modern' | 'duckbill_75mm_cable' | 'tele_tech_hybrid';
export type SnowCondition = 'deep_blower_powder' | 'wind_crust_chop' | 'steep_spring_corn' | 'firm_hardpack_groomer';
export type TurnStyle = 'fluid_deep_knee_lunges' | 'compact_quick_tempo' | 'steep_jump_tele_turn';
export type ResistanceRating = 'supple_surf_flex' | 'balanced_all_mountain' | 'active_carving_power' | 'stiff_race_lockout';

export interface TelemarkZone {
  id: string;
  title: string;
  region: string;
  range: string;
  elevationMeters: number;
  primaryBinding: BindingSystem;
  steepnessDegrees: number;
  snowType: string;
  description: string;
  highlights: string[];
}

export interface TelemarkQuery {
  zoneId: string;
  bindingSystem: BindingSystem;       // default 'ntn_modern'
  skierWeightLbs: number;             // 100 to 260 lbs, default 170
  snowCondition: SnowCondition;       // default 'deep_blower_powder'
  turnStyle: TurnStyle;               // default 'fluid_deep_knee_lunges'
  tensionLevel: number;               // 1 to 5, default 3
}

export interface TelemarkResult {
  zoneTitle: string;
  bindingSystem: BindingSystem;
  effectiveResistanceNm: number;
  tipDriveEdgePressureIndex: number;
  resistanceRating: ResistanceRating;
  bellowsStrainWarning: string;
  leadChangeAdvisory: string;
  edgeTransitionGuidance: string;
}

export interface TelemarkGearItem {
  id: string;
  name: string;
  category: 'boots' | 'touring' | 'bindings' | 'poles' | 'repair' | 'safety';
  mandatory: boolean;
  description: string;
}

export const TELEMARK_ZONES: TelemarkZone[] = [
  {
    id: 'silverton-mountain-powder',
    title: 'Silverton Mountain High Alpine Freeheel Bowls',
    region: 'San Juan Mountains, Colorado, USA',
    range: 'San Juan National Forest',
    elevationMeters: 4100,
    primaryBinding: 'ntn_modern',
    steepnessDegrees: 45,
    snowType: 'Deep Ungrooved Dry San Juan Powder',
    description: 'Extreme avalanche-controlled backcountry peak with legendary 45-degree powder bowls demanding high spring activity.',
    highlights: [
      'High-altitude 13,487ft alpine ridge drops',
      'Deep ungrooved dry San Juan powder',
      'Active NTN power cartridge edge drive',
    ],
  },
  {
    id: 'mad-river-glen-trees',
    title: 'Mad River Glen Gen Stark Ridge Telemark Glades',
    region: 'Fayston, Vermont, USA',
    range: 'Green Mountains',
    elevationMeters: 1110,
    primaryBinding: 'duckbill_75mm_cable',
    steepnessDegrees: 36,
    snowType: 'Variable Eastern Hardpack & Powder Stashes',
    description: 'The historic spiritual home of East Coast telemark skiing famous for narrow hardwood tree lines and natural mogul drops.',
    highlights: [
      'Tight hardwood forest tree glades',
      'Traditional 75mm supple flex knee drops',
      'Natural waterfall and rock cliff drops',
    ],
  },
  {
    id: 'alta-catherine-pass',
    title: "Alta Backcountry Catherine's Pass & Supreme Cirque",
    region: 'Alta, Utah, USA',
    range: 'Wasatch Mountains',
    elevationMeters: 3200,
    primaryBinding: 'ntn_modern',
    steepnessDegrees: 38,
    snowType: 'Ultra-Light Wasatch Lake-Effect Fluff',
    description: 'Renowned high-density Wasatch powder stashes with rolling alpine fields and steep north-facing chutes.',
    highlights: [
      'Ultra-light 8.5% density Wasatch powder',
      'Fast fluid lead-change transitions',
      'Supreme Cirque steep chutes',
    ],
  },
  {
    id: 'rogers-pass-asulkan',
    title: 'Rogers Pass Asulkan Valley Glaciated Telemark Tours',
    region: 'Glacier National Park, BC, Canada',
    range: 'Selkirk Mountains',
    elevationMeters: 2600,
    primaryBinding: 'tele_tech_hybrid',
    steepnessDegrees: 42,
    snowType: 'Deep Coastal-Intermountain Maritime Powder',
    description: 'Epic glaciated mountain amphitheater offering 1,500m continuous descents on hybrid pin-tech touring setups.',
    highlights: [
      'Frictionless tech-toe skin track ascents',
      'Glaciated moraine powder bowls',
      'Massive 1,500m sustained fall line descents',
    ],
  },
  {
    id: 'tuckerman-ravine-bowl',
    title: 'Mount Washington Tuckerman Ravine Telemark Descent',
    region: 'White Mountain National Forest, NH, USA',
    range: 'Presidential Range',
    elevationMeters: 1916,
    primaryBinding: 'ntn_modern',
    steepnessDegrees: 50,
    snowType: 'Steep Spring Glissade Corn Snow',
    description: 'The premier spring mountaineering pilgrimage featuring 50-degree headwall drops requiring rock-solid edge bite.',
    highlights: [
      'Iconic 50-degree Tuckerman Headwall',
      'Spring corn snow edge carving',
      'High-exposure jump telemark turns',
    ],
  },
];

export const TELEMARK_GEAR_CHECKLIST: TelemarkGearItem[] = [
  {
    id: 'telemark-bellows-boots',
    name: 'Triple-Injection Pebax Bellows Telemark Boots with Walk-Mode Lockout',
    category: 'boots',
    mandatory: true,
    description: 'Metatarsal accordion bellows enables deep knee drop while rigid torsion frame drives ski edge',
  },
  {
    id: 'touring-climbing-skins',
    name: 'High-Traction Mohair-Nylon Blend Backcountry Climbing Skins with Tail Clips',
    category: 'touring',
    mandatory: true,
    description: 'Supple grip-to-glide ratio for steep skin tracks in deep alpine powder',
  },
  {
    id: 'safety-leash-release-cables',
    name: 'Breakaway Steel Core Telemark Safety Leashes or Low-Profile Brakes',
    category: 'bindings',
    mandatory: true,
    description: 'Prevents runaway ski loss down 45-degree bowls without inhibiting bellows flex',
  },
  {
    id: 'adjustable-whippet-poles',
    name: 'Two-Piece Aluminum Freeheel Ski Poles with Self-Arrest Whippet Picks',
    category: 'poles',
    mandatory: true,
    description: 'Integrated steel self-arrest blade provides immediate anchor if dropped on steep headwalls',
  },
  {
    id: 'binding-spare-cartridge-kit',
    name: 'Field Spare Cartridge Springs, Pivot Pins & Multi-Wrench Hex Tool',
    category: 'repair',
    mandatory: true,
    description: 'Essential backcountry repair parts for field spring swaps and pivot pin adjustments',
  },
  {
    id: 'avalanche-airbag-rescue-pack',
    name: 'Deployable Electric Avalanche Airbag Pack with Probe and Metal Shovel',
    category: 'safety',
    mandatory: true,
    description: 'Mandatory alpine safety equipment for traveling in avalanche terrain',
  },
];

export function getTelemarkZones(system?: BindingSystem): TelemarkZone[] {
  if (!system) {
    return TELEMARK_ZONES;
  }
  return TELEMARK_ZONES.filter((zone) => zone.primaryBinding === system);
}

export function getTelemarkZoneById(id: string): TelemarkZone | undefined {
  return TELEMARK_ZONES.find((zone) => zone.id === id);
}

export function getTelemarkGearChecklist(): TelemarkGearItem[] {
  return TELEMARK_GEAR_CHECKLIST;
}

export function calculateTelemarkActivity(query: TelemarkQuery): TelemarkResult {
  const zone = getTelemarkZoneById(query.zoneId);
  const zoneTitle = zone ? zone.title : 'Alpine Freeheel Descent';

  const baseResistanceMap: Record<BindingSystem, number> = {
    ntn_modern: 45.0,
    duckbill_75mm_cable: 35.0,
    tele_tech_hybrid: 40.0,
  };

  const base = baseResistanceMap[query.bindingSystem] ?? 45.0;
  const tensionMod = (query.tensionLevel - 3) * 6.0;
  const weightFactor = (query.skierWeightLbs || 170) / 170.0;

  const effectiveResistanceNm = Math.round((base + tensionMod) * weightFactor * 10) / 10;
  const tipDriveEdgePressureIndex = Math.min(0.98, Math.round((effectiveResistanceNm / 80.0) * 100) / 100);

  let resistanceRating: ResistanceRating;
  if (effectiveResistanceNm < 35) {
    resistanceRating = 'supple_surf_flex';
  } else if (effectiveResistanceNm < 52) {
    resistanceRating = 'balanced_all_mountain';
  } else if (effectiveResistanceNm < 70) {
    resistanceRating = 'active_carving_power';
  } else {
    resistanceRating = 'stiff_race_lockout';
  }

  let bellowsStrainWarning: string;
  switch (resistanceRating) {
    case 'stiff_race_lockout':
      bellowsStrainWarning = 'High bellows fatigue risk: rigid spring tension exerts intense shear stress on boot accordion creases during deep lunges.';
      break;
    case 'active_carving_power':
      bellowsStrainWarning = 'Moderate bellows strain: strong spring preload drives ski shovel effectively with manageable boot crease flex.';
      break;
    case 'balanced_all_mountain':
      bellowsStrainWarning = 'Nominal bellows strain: balanced flex profile promotes durable boot life and progressive knee drop.';
      break;
    case 'supple_surf_flex':
    default:
      bellowsStrainWarning = 'Low bellows strain: compliant resistance allows unrestricted metatarsal flexion and surfy turns.';
      break;
  }

  let leadChangeAdvisory: string;
  switch (query.turnStyle) {
    case 'steep_jump_tele_turn':
      leadChangeAdvisory = 'Simultaneous airborne lead change required; maintain compact stance and commit downhill knee before edge engagement on steep terrain.';
      break;
    case 'compact_quick_tempo':
      leadChangeAdvisory = 'Rapid, tight lead changes; keep rear foot tucked beneath hips to maintain quick edge transitions in tight corridors.';
      break;
    case 'fluid_deep_knee_lunges':
    default:
      leadChangeAdvisory = 'Smooth, progressive lead changes; drive through the rear ball-of-foot with steady forward knee pressure.';
      break;
  }

  let edgeTransitionGuidance: string;
  switch (query.bindingSystem) {
    case 'duckbill_75mm_cable':
      edgeTransitionGuidance = '75mm duckbill cable delivers traditional soft progressive flex; roll ankles deliberately to establish early edge bite.';
      break;
    case 'tele_tech_hybrid':
      edgeTransitionGuidance = 'Pin-tech toe pivot maximizes uphill efficiency while hybrid heel assembly provides solid edge hold on firm descents.';
      break;
    case 'ntn_modern':
    default:
      edgeTransitionGuidance = 'NTN underfoot claw delivers immediate lateral edging; initiate turn early with front shin pressure and active rear ski engagement.';
      break;
  }

  return {
    zoneTitle,
    bindingSystem: query.bindingSystem,
    effectiveResistanceNm,
    tipDriveEdgePressureIndex,
    resistanceRating,
    bellowsStrainWarning,
    leadChangeAdvisory,
    edgeTransitionGuidance,
  };
}
