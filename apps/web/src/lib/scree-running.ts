export type ScreeGradingClass =
  | 'fine_shale_pea_scree'
  | 'medium_slate_gravel_scree'
  | 'coarse_angular_talus_rubble'
  | 'unconsolidated_moraine_scree'
  | 'hardpan_embedded_scree_sheet';

export type DescentGaitTechnique =
  | 'heel_plunge_sliding_glide'
  | 'rapid_cadence_hop_braking'
  | 'sideways_edging_skate'
  | 'pole_stabilized_quad_braking';

export type RockfallExposureTier =
  | 'low_isolated_scree_fan'
  | 'moderate_lateral_chute_drift'
  | 'severe_overhead_couloir_funnel'
  | 'critical_spontaneous_scarp_shed';

export type ScreeSafetyStatus =
  | 'optimal_gliding_conditions'
  | 'elevated_ankle_hazard'
  | 'severe_rockfall_warning';

export interface ScreeRunningSite {
  id: string;
  title: string;
  region: string;
  range: string;
  elevationMeters: number;
  dominantGrading: ScreeGradingClass;
  defaultGait: DescentGaitTechnique;
  rockfallExposure: RockfallExposureTier;
  description: string;
  highlights: string[];
}

export interface ScreeRunningQuery {
  siteId: string;
  screeGrading?: ScreeGradingClass;
  descentGait?: DescentGaitTechnique;
  slopeAngleDegrees: number;
  descentVerticalMeters: number;
  runnerWeightKg: number;
  screeDepthCm: number;
}

export interface ScreeRunningResult {
  siteTitle: string;
  descentVelocityKmh: number;
  ankleImpactForceKn: number;
  slideArrestDistanceMeters: number;
  screeRunDurationMinutes: number;
  safetyStatus: ScreeSafetyStatus;
  brakingTechniqueAdvisory: string;
  gaiterAndProtectionProtocol: string;
}

export interface ScreeRunningGearItem {
  id: string;
  name: string;
  category: 'gaiters' | 'footwear' | 'helmet' | 'poles' | 'gloves' | 'eyewear';
  mandatory: boolean;
  description: string;
}

export const SCREE_RUNNING_SITES: ScreeRunningSite[] = [
  {
    id: 'mount-sneffels-south-slopes',
    title: 'Mount Sneffels Lavender Col & South Scree Gully',
    region: 'San Juan Mountains, Colorado, USA',
    range: 'San Juan Mountains (Sneffels Range)',
    elevationMeters: 4315,
    dominantGrading: 'coarse_angular_talus_rubble',
    defaultGait: 'sideways_edging_skate',
    rockfallExposure: 'severe_overhead_couloir_funnel',
    description:
      'High-altitude volcanic breccia and rhyolite talus chute descending from Lavender Col below the 14,150-foot summit of Mount Sneffels, demanding strict party spacing in upper rockfall funnels.',
    highlights: [
      'Sustained 36-degree volcanic breccia talus and gravel transition fan',
      'Upper V-notch couloir funnel requiring helmet discipline and one-at-a-time glissade intervals',
      'Lower Blue Lakes basin moraine scree ribbon for controlled heel-plunge descents',
    ],
  },
  {
    id: 'mount-stephen-fossil-talus',
    title: 'Mount Stephen Burgess Shale & Fossil Scree Slope',
    region: 'Yoho National Park, Canadian Rockies, BC, Canada',
    range: 'Canadian Rockies (President Range)',
    elevationMeters: 3199,
    dominantGrading: 'medium_slate_gravel_scree',
    defaultGait: 'pole_stabilized_quad_braking',
    rockfallExposure: 'moderate_lateral_chute_drift',
    description:
      'Massive Cambrian dolomitic slate and limestone scree apron perched above the Kicking Horse River valley, featuring layered platy shale plates that slide in cohesive sheets under boot pressure.',
    highlights: [
      'Over 1,200 vertical meters of continuous Cambrian slate and limestone scree aprons',
      'Platy imbricated shale slabs providing predictable lateral shear and edge control',
      'Sweeping views of Cathedral Mountain and the Spiral Tunnels from the West Ridge shoulder',
    ],
  },
  {
    id: 'great-gable-wastwater-screes',
    title: 'Great Gable & The Illgill Head Wastwater Screes',
    region: 'Lake District, England, UK',
    range: 'Cumbrian Mountains (Wasdale)',
    elevationMeters: 899,
    dominantGrading: 'hardpan_embedded_scree_sheet',
    defaultGait: 'rapid_cadence_hop_braking',
    rockfallExposure: 'critical_spontaneous_scarp_shed',
    description:
      'Historic fell-running proving ground above Wastwater where Borrowdale Volcanic Group gullies drop 500 meters straight toward the lake over weathered, partially consolidated scree beds.',
    highlights: [
      'Classic fell-running descent lines off Great Gable and Stone Cove gully fans',
      'Mixed hardpan-embedded volcanic tuff requiring high-frequency hop braking to prevent ankle inversion',
      'Steep crag-scarp overhang zones subject to freeze-thaw rock shedding after heavy rain',
    ],
  },
  {
    id: 'mount-teide-volcanic-cinder-scree',
    title: 'Mount Teide Montaña Blanca Pumice & Cinder Scree Fan',
    region: 'Tenerife, Canary Islands, Spain',
    range: 'Cordillera Dorsal (Las Cañadas Caldera)',
    elevationMeters: 3715,
    dominantGrading: 'fine_shale_pea_scree',
    defaultGait: 'heel_plunge_sliding_glide',
    rockfallExposure: 'low_isolated_scree_fan',
    description:
      'Deep, uniform lapilli pumice and volcanic pea-cinder slopes flanks above Las Cañadas caldera, offering low-impact, long-stride heel-plunge gliding with minimal overhead cliff hazard.',
    highlights: [
      'Deep 20+ cm beds of low-density volcanic lapilli and pea-sized pumice gravel',
      'Smooth energy-absorbing heel-plunge strides mimicking alpine spring firn skiing',
      'High-altitude dry trade-wind atmosphere requiring full dust gaiters and wrap-around eye protection',
    ],
  },
  {
    id: 'mount-nelson-scree-corridor',
    title: 'Mount Nelson East Ridge & Neoglacial Moraine Scree Corridor',
    region: 'Purcell Mountains, BC, Canada',
    range: 'Purcell Mountains (Columbia Basin)',
    elevationMeters: 3313,
    dominantGrading: 'unconsolidated_moraine_scree',
    defaultGait: 'pole_stabilized_quad_braking',
    rockfallExposure: 'moderate_lateral_chute_drift',
    description:
      'Rugged quartzite and argillite lateral moraine scree chute descending from the upper Nelson cirque, combining loose glacial till with pockets of fine alpine silt and rolling cobbles.',
    highlights: [
      'Steep neoglacial lateral moraine spine dropping 900 vertical meters into Farnham Creek',
      'Variable sorting from fine glacial flour to shifting watermelon-sized quartzite cobbles',
      'Fast egress route off the East Ridge scramble before afternoon convective storms',
    ],
  },
];

export const SCREE_RUNNING_GEAR_CHECKLIST: ScreeRunningGearItem[] = [
  {
    id: 'scree-running-high-cuff-dust-gaiters',
    name: 'High-Cuff Cordura Scree & Volcanic Dust Gaiters',
    category: 'gaiters',
    mandatory: true,
    description:
      'Abrasion-resistant 1000D ballistic nylon ankle-to-calf gaiters with replaceable under-arch Hypalon straps to seal boots against pea gravel and sharp shale ingress.',
  },
  {
    id: 'reinforced-toe-talus-running-shoes',
    name: 'Reinforced Rand & Rock-Plate Alpine Talus Running Footwear',
    category: 'footwear',
    mandatory: true,
    description:
      'Mountain scramble footwear featuring full 360-degree TPU mudguards, carbon-composite underfoot rock plates, and deep 6mm Vibram Megagrip braking lugs.',
  },
  {
    id: 'ultra-light-climbing-helmet-en12492',
    name: 'Ultra-Light EN 12492 Hybrid Polycarbonate Scree Helmet',
    category: 'helmet',
    mandatory: true,
    description:
      'Ventilated EPP/EPS foam and polycarbonate shell helmet certified for crown and lateral kinetic rockfall impacts triggered by upper-slope runners.',
  },
  {
    id: 'carbon-z-pole-folding-trekking-poles',
    name: 'Reinforced Carbon/Aluminum Z-Pole Trekking Poles with Scree Baskets',
    category: 'poles',
    mandatory: true,
    description:
      'Collapsible 3-section poles with carbide flex tips and 55mm scree baskets for outrigger balance and emergency dual-pole drag braking.',
  },
  {
    id: 'leather-palm-abrasion-scramble-gloves',
    name: 'Goatskin Leather-Palm Talus & Ridge Scramble Gloves',
    category: 'gloves',
    mandatory: true,
    description:
      'Puncture-resistant leather palm and knuckle-padded gloves protecting hands during low-center-of-gravity slide arrests on sharp slate and rhyolite.',
  },
  {
    id: 'high-wrap-ballistic-sunglasses',
    name: 'High-Wrap Ballistic Category 3/4 Glare & Silica Dust Eyewear',
    category: 'eyewear',
    mandatory: true,
    description:
      'Shatterproof polycarbonate wrap-around lenses with vented foam brow seals to block airborne volcanic dust and high-velocity pebble ricochets.',
  },
];

export function getScreeRunningSites(
  grading?: ScreeGradingClass
): ScreeRunningSite[] {
  if (!grading) {
    return SCREE_RUNNING_SITES;
  }
  return SCREE_RUNNING_SITES.filter((site) => site.dominantGrading === grading);
}

export function getScreeRunningSiteById(
  id: string
): ScreeRunningSite | undefined {
  return SCREE_RUNNING_SITES.find((site) => site.id === id);
}

export function getScreeRunningGearChecklist(): ScreeRunningGearItem[] {
  return SCREE_RUNNING_GEAR_CHECKLIST;
}

export function calculateScreeRunningDynamics(
  query: ScreeRunningQuery
): ScreeRunningResult {
  const site =
    getScreeRunningSiteById(query.siteId) ?? SCREE_RUNNING_SITES[0];
  const screeGrading = query.screeGrading ?? site.dominantGrading;
  const descentGait = query.descentGait ?? site.defaultGait;
  const rockfallExposure = site.rockfallExposure;

  // Clamp inputs to realistic physical bounds
  const slopeAngleDegrees = Math.min(50, Math.max(15, query.slopeAngleDegrees));
  const descentVerticalMeters = Math.min(
    2500,
    Math.max(50, query.descentVerticalMeters)
  );
  const runnerWeightKg = Math.min(130, Math.max(40, query.runnerWeightKg));
  const screeDepthCm = Math.min(45, Math.max(2, query.screeDepthCm));

  // 1. Descent Velocity (5.0 to 35.0 km/h)
  let gradingVelocityBase = 14.0;
  if (screeGrading === 'fine_shale_pea_scree') gradingVelocityBase = 21.5;
  else if (screeGrading === 'medium_slate_gravel_scree') gradingVelocityBase = 17.5;
  else if (screeGrading === 'unconsolidated_moraine_scree') gradingVelocityBase = 13.0;
  else if (screeGrading === 'hardpan_embedded_scree_sheet') gradingVelocityBase = 11.5;
  else if (screeGrading === 'coarse_angular_talus_rubble') gradingVelocityBase = 8.5;

  let gaitVelocityModifier = 0;
  if (descentGait === 'heel_plunge_sliding_glide') gaitVelocityModifier = 3.2;
  else if (descentGait === 'sideways_edging_skate') gaitVelocityModifier = 1.4;
  else if (descentGait === 'rapid_cadence_hop_braking') gaitVelocityModifier = -0.8;
  else if (descentGait === 'pole_stabilized_quad_braking') gaitVelocityModifier = -2.4;

  const slopeVelocityDelta = (slopeAngleDegrees - 28) * 0.38;
  const depthVelocityDelta =
    screeDepthCm >= 12 && screeDepthCm <= 28
      ? (screeDepthCm - 12) * 0.22
      : screeDepthCm < 12
        ? (screeDepthCm - 12) * 0.28
        : 3.5 - (screeDepthCm - 28) * 0.15;

  const rawVelocity =
    gradingVelocityBase +
    gaitVelocityModifier +
    slopeVelocityDelta +
    depthVelocityDelta;
  const descentVelocityKmh = Math.min(
    35.0,
    Math.max(5.0, Math.round(rawVelocity * 10) / 10)
  );

  // 2. Ankle Impact Force (0.6 to 3.5 kN)
  const weightForceBase = (runnerWeightKg / 75) * 1.45;
  // Deeper scree cushions impact force; shallow hardpan spikes impact force
  const depthCushionFactor = Math.max(0.55, 1.35 - screeDepthCm * 0.028);

  let gradingImpactMultiplier = 1.0;
  if (screeGrading === 'hardpan_embedded_scree_sheet') gradingImpactMultiplier = 1.35;
  else if (screeGrading === 'coarse_angular_talus_rubble') gradingImpactMultiplier = 1.28;
  else if (screeGrading === 'unconsolidated_moraine_scree') gradingImpactMultiplier = 1.15;
  else if (screeGrading === 'medium_slate_gravel_scree') gradingImpactMultiplier = 0.95;
  else if (screeGrading === 'fine_shale_pea_scree') gradingImpactMultiplier = 0.78;

  let gaitImpactModifier = 0;
  if (descentGait === 'rapid_cadence_hop_braking') gaitImpactModifier = 0.35;
  else if (descentGait === 'sideways_edging_skate') gaitImpactModifier = 0.15;
  else if (descentGait === 'heel_plunge_sliding_glide') gaitImpactModifier = -0.18;
  else if (descentGait === 'pole_stabilized_quad_braking') gaitImpactModifier = -0.25;

  const rawAnkleImpact =
    weightForceBase * depthCushionFactor * gradingImpactMultiplier +
    gaitImpactModifier;
  const ankleImpactForceKn = Math.min(
    3.5,
    Math.max(0.6, Math.round(rawAnkleImpact * 100) / 100)
  );

  // 3. Slide Arrest Distance (1.0 to 9.0 meters)
  const rawArrestDistance =
    1.1 +
    (descentVelocityKmh / 14) * 1.65 +
    (slopeAngleDegrees - 25) * 0.14 +
    (screeGrading === 'hardpan_embedded_scree_sheet' ? 1.4 : 0) -
    (descentGait === 'pole_stabilized_quad_braking' ? 0.9 : 0);
  const slideArrestDistanceMeters = Math.min(
    9.0,
    Math.max(1.0, Math.round(rawArrestDistance * 10) / 10)
  );

  // 4. Scree Run Duration (minutes based on slope distance and descent velocity)
  const slopeRadians = (slopeAngleDegrees * Math.PI) / 180;
  const slopeDistanceMeters =
    descentVerticalMeters / Math.max(0.25, Math.sin(slopeRadians));
  const speedMetersPerMinute = (descentVelocityKmh * 1000) / 60;
  const rawDurationMinutes = slopeDistanceMeters / speedMetersPerMinute;
  const screeRunDurationMinutes = Math.max(
    1,
    Math.round(rawDurationMinutes * 10) / 10
  );

  // 5. Safety Status
  let safetyStatus: ScreeSafetyStatus;
  if (
    (slopeAngleDegrees >= 38 &&
      (rockfallExposure === 'severe_overhead_couloir_funnel' ||
        rockfallExposure === 'critical_spontaneous_scarp_shed')) ||
    (screeGrading === 'coarse_angular_talus_rubble' && slopeAngleDegrees >= 37)
  ) {
    safetyStatus = 'severe_rockfall_warning';
  } else if (
    ankleImpactForceKn >= 2.15 ||
    screeDepthCm <= 6 ||
    screeGrading === 'hardpan_embedded_scree_sheet' ||
    screeGrading === 'coarse_angular_talus_rubble'
  ) {
    safetyStatus = 'elevated_ankle_hazard';
  } else {
    safetyStatus = 'optimal_gliding_conditions';
  }

  // 6. Braking Technique Advisory
  let brakingTechniqueAdvisory: string;
  if (descentGait === 'heel_plunge_sliding_glide') {
    brakingTechniqueAdvisory = `Commit weight onto rear heel strike at ${slopeAngleDegrees}° pitch, allowing the ${screeDepthCm}cm gravel wave to carry your foot ${slideArrestDistanceMeters.toFixed(1)}m per stride; flare toes upward to prevent boot submarine trapping.`;
  } else if (descentGait === 'sideways_edging_skate') {
    brakingTechniqueAdvisory = `Angle boots 45° across the fall line and carve lateral shear turns like alpine skis; expect ${slideArrestDistanceMeters.toFixed(1)}m stopping distance and traverse out of central rockfall funnels before pausing.`;
  } else if (descentGait === 'rapid_cadence_hop_braking') {
    brakingTechniqueAdvisory = `Maintain high-cadence 180+ spm light touch steps over shallow hardpan (${screeDepthCm}cm depth); never lock knees as ankle impact reaches ${ankleImpactForceKn.toFixed(2)} kN on embedded bedrock slabs.`;
  } else {
    brakingTechniqueAdvisory = `Deploy dual Z-poles with scree baskets slightly behind hip line to absorb eccentric quad load (${ankleImpactForceKn.toFixed(2)} kN ankle force) and shorten arrest distance to ${slideArrestDistanceMeters.toFixed(1)}m.`;
  }

  // 7. Gaiter & Protection Protocol
  let gaiterAndProtectionProtocol: string;
  if (safetyStatus === 'severe_rockfall_warning') {
    gaiterAndProtectionProtocol =
      'CRITICAL ROCKFALL PROTOCOL: Fasten EN 12492 helmet chinstrap, maintain strict 45m staggered lateral offset (never descend directly below another runner), and wear leather scramble gloves plus ballistic eyewear.';
  } else if (safetyStatus === 'elevated_ankle_hazard') {
    gaiterAndProtectionProtocol =
      'ANKLE & ABRASION PROTOCOL: Lock high-cuff Cordura gaiter under-arch straps, lace talus footwear through heel-lock eyelets to prevent torsional inversion, and keep leather-palmed hands ready for low tripod arrest.';
  } else {
    gaiterAndProtectionProtocol =
      'OPTIMAL GLIDE PROTOCOL: Seal high-cuff dust gaiters over boot collars, wear wrap-around Category 3/4 eyewear against silica/pumice plumes, and regroup at lateral rib safe zones every 200 vertical meters.';
  }

  return {
    siteTitle: site.title,
    descentVelocityKmh,
    ankleImpactForceKn,
    slideArrestDistanceMeters,
    screeRunDurationMinutes,
    safetyStatus,
    brakingTechniqueAdvisory,
    gaiterAndProtectionProtocol,
  };
}
