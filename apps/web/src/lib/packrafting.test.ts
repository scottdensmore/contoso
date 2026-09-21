import { describe, it, expect } from 'vitest';
import {
  getPackraftRoutes,
  getPackraftRouteById,
  calculatePackraftPlan,
  getPackraftGear,
  PACKRAFT_ROUTES,
  PackraftPlanQuery,
} from './packrafting';

describe('packrafting catalog & route retrieval', () => {
  it('contains 5 iconic wilderness packrafting expeditions with accurate data', () => {
    expect(PACKRAFT_ROUTES).toHaveLength(5);
    const ids = PACKRAFT_ROUTES.map((r) => r.id);
    expect(ids).toEqual([
      'frank-church-middle-fork-salmon',
      'bob-marshall-south-fork-flathead',
      'alaska-talkeetna-river-wilderness',
      'escalante-river-desert-canyon',
      'green-river-desolation-canyon',
    ]);
  });

  it('retrieves route by id with all required expedition properties', () => {
    const route = getPackraftRouteById('frank-church-middle-fork-salmon');
    expect(route).toBeDefined();
    expect(route?.riverName).toBe('Middle Fork Salmon River');
    expect(route?.sectionName).toBe('Wilderness Section');
    expect(route?.region).toBe('Frank Church Wilderness, ID');
    expect(route?.riverMiles).toBe(96);
    expect(route?.portageMiles).toBe(4.5);
    expect(route?.riverGrade).toBe('class_iii_moderate');
    expect(route?.flowStatus).toBe('optimal');
    expect(route?.minFlowCfs).toBe(1200);
    expect(route?.maxFlowCfs).toBe(3500);
    expect(route?.currentFlowCfs).toBe(2100);
    expect(route?.spraydeckRequired).toBe(true);
    expect(route?.portageKeyFeatures).toEqual([
      'Impassable Canyon portages',
      'Hot springs camps',
      'Granite boulder garden rapids',
    ]);
  });

  it('returns undefined for non-existent route id', () => {
    expect(getPackraftRouteById('unknown-route')).toBeUndefined();
  });

  it('filters routes by river grade', () => {
    const classIV = getPackraftRoutes('class_iv_technical');
    expect(classIV).toHaveLength(1);
    expect(classIV[0].id).toBe('alaska-talkeetna-river-wilderness');

    const classIII = getPackraftRoutes('class_iii_moderate');
    expect(classIII).toHaveLength(1);
    expect(classIII[0].id).toBe('frank-church-middle-fork-salmon');

    const classII = getPackraftRoutes('class_ii_mild');
    expect(classII).toHaveLength(2);
    expect(classII.map((r) => r.id)).toEqual([
      'bob-marshall-south-fork-flathead',
      'green-river-desolation-canyon',
    ]);

    const classI = getPackraftRoutes('class_i_flatwater');
    expect(classI).toHaveLength(1);
    expect(classI[0].id).toBe('escalante-river-desert-canyon');

    const allRoutes = getPackraftRoutes();
    expect(allRoutes).toHaveLength(5);
  });
});

describe('calculatePackraftPlan', () => {
  it('calculates navigable flow feasibility when within runnable window', () => {
    const query: PackraftPlanQuery = {
      routeId: 'frank-church-middle-fork-salmon',
      paddlerSkill: 'intermediate',
      flowRateCfs: 2100,
      boatWeightCapacityKg: 135,
      paddlerWeightWithGearKg: 90,
    };
    const result = calculatePackraftPlan(query);

    expect(result.riverAndSectionName).toContain('Middle Fork Salmon River');
    expect(result.flowFeasibility).toBe('navigable');
    expect(result.recommendedSpraydeckType).toBe('whitewater_deck');
    expect(result.payloadMarginKg).toBe(45);
    expect(result.breakdownPaddleLengthCm).toBe(210);
    expect(result.safetyAdvisory).toBeTruthy();
  });

  it('calculates scrape_risk when flow is below minFlowCfs', () => {
    const query: PackraftPlanQuery = {
      routeId: 'frank-church-middle-fork-salmon',
      paddlerSkill: 'intermediate',
      flowRateCfs: 900, // min is 1200
      boatWeightCapacityKg: 135,
      paddlerWeightWithGearKg: 90,
    };
    const result = calculatePackraftPlan(query);

    expect(result.flowFeasibility).toBe('scrape_risk');
    expect(result.safetyAdvisory).toMatch(/scrape|portag|shallow/i);
  });

  it('calculates hazardous_high when flow is above maxFlowCfs', () => {
    const query: PackraftPlanQuery = {
      routeId: 'frank-church-middle-fork-salmon',
      paddlerSkill: 'expert',
      flowRateCfs: 4000, // max is 3500
      boatWeightCapacityKg: 135,
      paddlerWeightWithGearKg: 90,
    };
    const result = calculatePackraftPlan(query);

    expect(result.flowFeasibility).toBe('hazardous_high');
    expect(result.safetyAdvisory).toMatch(/hazard|high|flood/i);
  });

  it('recommends self_bailer for Class II mild routes without spraydeck requirement', () => {
    const query: PackraftPlanQuery = {
      routeId: 'bob-marshall-south-fork-flathead',
      paddlerSkill: 'intermediate',
      flowRateCfs: 1450,
      boatWeightCapacityKg: 140,
      paddlerWeightWithGearKg: 85,
    };
    const result = calculatePackraftPlan(query);

    expect(result.recommendedSpraydeckType).toBe('self_bailer');
    expect(result.payloadMarginKg).toBe(55);
    expect(result.breakdownPaddleLengthCm).toBe(215);
  });

  it('recommends open_bucket for Class I flatwater desert canyons', () => {
    const query: PackraftPlanQuery = {
      routeId: 'escalante-river-desert-canyon',
      paddlerSkill: 'beginner',
      flowRateCfs: 85,
      boatWeightCapacityKg: 135,
      paddlerWeightWithGearKg: 80,
    };
    const result = calculatePackraftPlan(query);

    expect(result.recommendedSpraydeckType).toBe('open_bucket');
    expect(result.breakdownPaddleLengthCm).toBe(220);
  });

  it('recommends whitewater_deck and 205cm paddle for Class IV technical routes', () => {
    const query: PackraftPlanQuery = {
      routeId: 'alaska-talkeetna-river-wilderness',
      paddlerSkill: 'expert',
      flowRateCfs: 5200,
      boatWeightCapacityKg: 140,
      paddlerWeightWithGearKg: 95,
    };
    const result = calculatePackraftPlan(query);

    expect(result.recommendedSpraydeckType).toBe('whitewater_deck');
    expect(result.breakdownPaddleLengthCm).toBe(205);
  });

  it('flags skill mismatch safety advisory for beginners attempting Class III or IV', () => {
    const query: PackraftPlanQuery = {
      routeId: 'alaska-talkeetna-river-wilderness',
      paddlerSkill: 'beginner',
      flowRateCfs: 4000,
      boatWeightCapacityKg: 135,
      paddlerWeightWithGearKg: 90,
    };
    const result = calculatePackraftPlan(query);

    expect(result.safetyAdvisory).toMatch(/skill|danger|expert|not suitable/i);
  });

  it('flags overloaded boat payload warning when payloadMarginKg is low or negative', () => {
    const query: PackraftPlanQuery = {
      routeId: 'frank-church-middle-fork-salmon',
      paddlerSkill: 'intermediate',
      flowRateCfs: 2100,
      boatWeightCapacityKg: 100,
      paddlerWeightWithGearKg: 105,
    };
    const result = calculatePackraftPlan(query);

    expect(result.payloadMarginKg).toBe(-5);
    expect(result.safetyAdvisory).toMatch(/payload|capacity|overload|swamp/i);
  });

  it('throws an error if routeId is not found', () => {
    expect(() =>
      calculatePackraftPlan({
        routeId: 'non-existent',
        paddlerSkill: 'intermediate',
        flowRateCfs: 1000,
        boatWeightCapacityKg: 135,
        paddlerWeightWithGearKg: 90,
      })
    ).toThrow(/non-existent/i);
  });
});

describe('getPackraftGear', () => {
  it('returns 6 mandatory ultralight packrafting kit items', () => {
    const gear = getPackraftGear();
    expect(gear).toHaveLength(6);
    expect(gear.every((item) => item.mandatory)).toBe(true);

    const names = gear.map((g) => g.name);
    expect(names).toContain(
      'Ultralight TPU fabric packraft with internal TiZip cargo zipper'
    );
    expect(names).toContain(
      '4-piece breakdown packrafting paddle with carbon shaft'
    );
    expect(names).toContain(
      'USCG Type III/V Whitewater PFD with low-profile flotation'
    );
    expect(names).toContain(
      'Lightweight rapid inflation bag (nylon pump bag) & top-off twist valve'
    );
    expect(names).toContain(
      'Whitewater kayak helmet (CE/UIAA certified)'
    );
    expect(names).toContain(
      'Packraft emergency field repair kit (Aquaseal, Tenacious Tape, alcohol pads, spare valve)'
    );
  });
});
