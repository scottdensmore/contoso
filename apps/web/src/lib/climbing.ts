export type ClimbingDiscipline = 'trad' | 'sport' | 'alpine_rock' | 'bouldering';
export type RockType = 'granite' | 'basalt' | 'welded_tuff' | 'sandstone' | 'gneiss';
export type YdsGrade =
  | '5.6'
  | '5.7'
  | '5.8'
  | '5.9'
  | '5.10a'
  | '5.10b'
  | '5.10c'
  | '5.10d'
  | '5.11a'
  | '5.11b'
  | '5.11c'
  | '5.11d'
  | '5.12a'
  | '5.12b'
  | '5.12c'
  | '5.13a'
  | '5.13d';

export interface ClimbingRoute {
  name: string;
  grade: YdsGrade;
  pitches: number;
  lengthFt: number;
  protectionType: ClimbingDiscipline;
  description: string;
  descentBeta: string;
}

export interface ClimbingCrag {
  id: string;
  name: string;
  area: string;
  region: string;
  rockType: RockType;
  elevationFt: number;
  approachMinutes: number;
  sunExposure: string;
  routes: ClimbingRoute[];
  standardRack: string;
  bestSeasons: string[];
  accessNotes: string;
  helmetRequired: boolean;
}

export interface RackCalculatorRequest {
  routeType: ClimbingDiscipline;
  pitches: number;
  cruxGrade: YdsGrade;
  routeLengthFt: number;
}

export interface RackCalculatorResult {
  camsDescription: string;
  nutsDescription: string;
  slingsCount: number;
  quickdrawsCount: number;
  ropeLengthM: number;
  specialGear: string[];
  weightEstLbs: number;
}

export interface RappelSafetyCheck {
  id: string;
  step: string;
  critical: boolean;
  detail: string;
}

export const CLIMBING_CRAGS: ClimbingCrag[] = [
  {
    id: 'index-lower-town-wall',
    name: 'Index Town Wall — Lower Wall',
    area: 'Skykomish Valley',
    region: 'Central Cascades',
    rockType: 'granite',
    elevationFt: 600,
    approachMinutes: 10,
    sunExposure: 'West-facing (afternoon sun)',
    routes: [
      {
        name: 'Godzilla',
        grade: '5.9',
        pitches: 1,
        lengthFt: 110,
        protectionType: 'trad',
        description: 'Iconic steep thin crack to expanding lieback flake.',
        descentBeta: 'Lower or rappel from two-ring bolted anchor (60m rope minimum).',
      },
      {
        name: 'City Park',
        grade: '5.13d',
        pitches: 1,
        lengthFt: 90,
        protectionType: 'trad',
        description: 'Historic Todd Skinner laser-cut finger crack testpiece.',
        descentBeta: 'Rappel from bolted anchor chain.',
      },
      {
        name: 'Slow Children',
        grade: '5.10d',
        pitches: 3,
        lengthFt: 300,
        protectionType: 'trad',
        description: 'Technical stemming corners and sustained friction slab.',
        descentBeta: 'Double 60m rope rappel down route.',
      },
    ],
    standardRack: 'Double rack 0.3 - 3, single 4, set of stoppers, micro-cams, 10-12 alpine draws',
    bestSeasons: ['May', 'June', 'July', 'August', 'September', 'October'],
    accessNotes: 'WDFW Vehicle Access Pass required at parking lot. Active railroad crossing required.',
    helmetRequired: true,
  },
  {
    id: 'leavenworth-castle-rock',
    name: 'Castle Rock',
    area: 'Icicle Canyon',
    region: 'Central Cascades',
    rockType: 'granite',
    elevationFt: 1800,
    approachMinutes: 20,
    sunExposure: 'South-facing (all day sun)',
    routes: [
      {
        name: 'Midway',
        grade: '5.6',
        pitches: 3,
        lengthFt: 350,
        protectionType: 'trad',
        description: 'Classic moderate route featuring the famous J-Crack pitch.',
        descentBeta: "Walk off logger ledge scramble trail to climber's right.",
      },
      {
        name: 'Catapult',
        grade: '5.8',
        pitches: 3,
        lengthFt: 320,
        protectionType: 'trad',
        description: 'Spectacular juggy overhangs and steep friction slabs.',
        descentBeta: 'Walk off via descent gully.',
      },
      {
        name: 'Damnation Crack',
        grade: '5.9',
        pitches: 2,
        lengthFt: 220,
        protectionType: 'trad',
        description: 'Strenuous hand crack through steep roof notch.',
        descentBeta: 'Rappel from tree anchors or walk off.',
      },
    ],
    standardRack: 'Single rack 0.4 - 3, full set of wires/nuts, 8 alpine draws, 60m rope',
    bestSeasons: ['April', 'May', 'June', 'September', 'October'],
    accessNotes: 'USFS pass / America the Beautiful pass required. Respect seasonal raptor closures.',
    helmetRequired: true,
  },
  {
    id: 'vantage-feathers',
    name: 'The Feathers',
    area: 'Frenchman Coulee / Vantage',
    region: 'Columbia Basin',
    rockType: 'basalt',
    elevationFt: 850,
    approachMinutes: 5,
    sunExposure: 'East and West columns (morning and shade options)',
    routes: [
      {
        name: 'Aggers Slab',
        grade: '5.7',
        pitches: 1,
        lengthFt: 55,
        protectionType: 'sport',
        description: 'Fun, well-bolted introductory columnar basalt edge-climbing.',
        descentBeta: 'Lower from two-ring cold-shut anchor.',
      },
      {
        name: 'Seven Virgins and a Mule',
        grade: '5.9',
        pitches: 1,
        lengthFt: 60,
        protectionType: 'sport',
        description: 'Stemming arête between two basalt columns.',
        descentBeta: 'Lower from Mussel-hook anchor.',
      },
      {
        name: "Ride 'Em Cowboy",
        grade: '5.10b',
        pitches: 1,
        lengthFt: 65,
        protectionType: 'sport',
        description: 'Sustained sequential face climbing on clean hexagonal basalt.',
        descentBeta: 'Lower from chain anchor.',
      },
    ],
    standardRack: '8-10 quickdraws, 60m rope, helmet',
    bestSeasons: ['March', 'April', 'May', 'October', 'November'],
    accessNotes: 'WDFW Discover Pass required. Windy conditions common. Watch for desert rattlesnakes.',
    helmetRequired: true,
  },
  {
    id: 'washington-pass-liberty-bell',
    name: 'Liberty Bell — Beckey Route',
    area: 'North Cascades Highway',
    region: 'North Cascades',
    rockType: 'granite',
    elevationFt: 7720,
    approachMinutes: 75,
    sunExposure: 'South-West (high alpine exposure)',
    routes: [
      {
        name: 'Beckey Route',
        grade: '5.6',
        pitches: 4,
        lengthFt: 450,
        protectionType: 'alpine_rock',
        description: 'The premier alpine rock route in the Pacific Northwest featuring clean granite, chimneys, and slabs.',
        descentBeta: 'Four rappels down South Face route from bolted stations (70m single or 60m doubles).',
      },
      {
        name: 'Liberty Crack',
        grade: '5.11a',
        pitches: 12,
        lengthFt: 1200,
        protectionType: 'alpine_rock',
        description: 'Monumental Grade V big wall aid/free route on the sheer east face.',
        descentBeta: 'Rappel Beckey route or walk over col.',
      },
    ],
    standardRack: 'Single rack to 3 inches, small set of offset nuts, 10-12 alpine draws, 70m rope, ice axe/crampons for early season approach',
    bestSeasons: ['July', 'August', 'September'],
    accessNotes: 'Northwest Forest Pass at Blue Lake Trailhead. Severe weather can move in rapidly.',
    helmetRequired: true,
  },
  {
    id: 'smith-rock-dihedrals',
    name: 'The Dihedrals',
    area: 'Smith Rock State Park',
    region: 'Central Oregon',
    rockType: 'welded_tuff',
    elevationFt: 2900,
    approachMinutes: 15,
    sunExposure: 'East-facing (shaded in afternoon)',
    routes: [
      {
        name: 'Chain Reaction',
        grade: '5.12c',
        pitches: 1,
        lengthFt: 60,
        protectionType: 'sport',
        description: 'World-famous steep endurance pocket route pioneered by Alan Watts.',
        descentBeta: 'Lower from steel carabiner anchor.',
      },
      {
        name: 'Moonshine Dihedral',
        grade: '5.9',
        pitches: 1,
        lengthFt: 85,
        protectionType: 'trad',
        description: 'Classic sweeping corner crack with stemming and finger jams.',
        descentBeta: 'Lower from two-bolt anchor.',
      },
    ],
    standardRack: '12 quickdraws, or single rack 0.3 - 2 for trad lines, 70m rope',
    bestSeasons: ['March', 'April', 'May', 'September', 'October', 'November'],
    accessNotes: 'Oregon State Parks pass required. Stay on designated paths to prevent soil erosion.',
    helmetRequired: true,
  },
];

export function getClimbingCrags(discipline?: ClimbingDiscipline, rockType?: RockType): ClimbingCrag[] {
  return CLIMBING_CRAGS.filter((crag) => {
    if (discipline && !crag.routes.some((r) => r.protectionType === discipline)) {
      return false;
    }
    if (rockType && crag.rockType !== rockType) {
      return false;
    }
    return true;
  });
}

export function getClimbingCragById(id: string): ClimbingCrag | undefined {
  return CLIMBING_CRAGS.find((c) => c.id === id);
}

export function calculateRack(req: RackCalculatorRequest): RackCalculatorResult {
  const { routeType, pitches, routeLengthFt } = req;

  if (routeType === 'sport') {
    const quickdrawsCount = Math.max(10, Math.ceil(routeLengthFt / 10) + 2);
    const ropeLengthM = routeLengthFt > 100 ? 70 : 60;
    return {
      camsDescription: 'None required (sport route)',
      nutsDescription: 'None required',
      slingsCount: 2,
      quickdrawsCount,
      ropeLengthM,
      specialGear: ['Sport quickdraws', 'Personal Anchor System (PAS)', 'Locking carabiners'],
      weightEstLbs: 7.5,
    };
  }

  if (routeType === 'trad') {
    const camsDescription =
      pitches > 1
        ? 'Double rack 0.3 - 3, single #4'
        : 'Single rack from #0.3 to #3 cams';
    const quickdrawsCount = pitches >= 3 ? 12 : pitches === 2 ? 10 : 8;
    const slingsCount = pitches > 1 ? 6 : 4;
    const ropeLengthM = routeLengthFt > 100 ? 70 : 60;
    const weightEstLbs = pitches > 1 ? 16.5 : 12.5;

    return {
      camsDescription,
      nutsDescription: 'Full set of stoppers / wired nuts (#4-#11)',
      slingsCount,
      quickdrawsCount,
      ropeLengthM,
      specialGear: [
        'Nut tool',
        'Alpine shoulder slings (60cm/120cm)',
        'Cordalette for multi-point anchors',
        'Locking carabiners',
      ],
      weightEstLbs,
    };
  }

  if (routeType === 'alpine_rock') {
    const camsDescription =
      pitches > 2
        ? 'Double rack 0.3 - 3, micro cams, offset cams'
        : 'Single rack 0.3 - 3, micro cams';
    return {
      camsDescription,
      nutsDescription: 'Set of offset nuts and micro stoppers',
      slingsCount: 6,
      quickdrawsCount: 12,
      ropeLengthM: 70,
      specialGear: [
        'Headlamp with extra batteries',
        'Emergency bivy gear & space blanket',
        'Prusik loops for crevasse/self-rescue',
        'Nut tool',
        'Approach shoes / crampons compatibility',
        'First aid & satellite communicator',
      ],
      weightEstLbs: 18.0,
    };
  }

  // Bouldering or default
  return {
    camsDescription: 'None',
    nutsDescription: 'None',
    slingsCount: 0,
    quickdrawsCount: 0,
    ropeLengthM: 0,
    specialGear: ['Crash pad', 'Chalk bag', 'Brush', 'Climbing shoes'],
    weightEstLbs: 15.0,
  };
}

export function getRappelSafetyChecklist(): RappelSafetyCheck[] {
  return [
    {
      id: 'stopper-knots',
      step: 'Knots in both rope ends / stopper knots',
      critical: true,
      detail:
        'Tie triple barrel or overhand stopper knots in both rope ends before tossing to prevent rappelling off the ends.',
    },
    {
      id: 'autoblock-backup',
      step: 'Backup friction hitch / autoblock on belay loop',
      critical: true,
      detail:
        'Attach an autoblock or prusik hitch below the rappel device to your leg loop or belay loop with a locking carabiner.',
    },
    {
      id: 'anchor-carabiners',
      step: 'Double-check master point and carabiners locked',
      critical: true,
      detail:
        'Double-check master point integrity, equalized anchor webbing/chains, and verify all screwgate or twist-lock carabiners are locked.',
    },
    {
      id: 'rope-path-clear',
      step: 'Clear rope path before tossing',
      critical: false,
      detail:
        'Ensure both strands reach the lower station or ground cleanly without crossing over sharp granite flakes or snagging bushes.',
    },
    {
      id: 'pre-weight-test',
      step: 'Weight system before uncoupling safety tether',
      critical: true,
      detail:
        'Fully weight the rappel system with your safety tether still clipped, confirm friction and lock, before uncoupling from the anchor.',
    },
  ];
}
