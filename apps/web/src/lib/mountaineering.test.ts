import { describe, it, expect } from 'vitest';
import {
  getGlacierRoutes,
  getGlacierRouteById,
  calculateRopeTeamPlan,
  getGlacierGear,
} from './mountaineering';

describe('mountaineering library', () => {
  describe('getGlacierRoutes catalog & filtering', () => {
    it('returns all 5 iconic glaciated routes by default', () => {
      const routes = getGlacierRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toEqual([
        'rainier-disappointment-cleaver',
        'baker-coleman-deming',
        'shasta-avalanche-gulch',
        'hood-south-side-pearly-gates',
        'olympus-blue-glacier',
      ]);
    });

    it('has accurate specs for Mount Rainier Disappointment Cleaver', () => {
      const rainier = getGlacierRoutes().find(
        (r) => r.id === 'rainier-disappointment-cleaver',
      );
      expect(rainier).toBeDefined();
      expect(rainier?.peakName).toBe('Mount Rainier');
      expect(rainier?.routeName).toBe('Disappointment Cleaver');
      expect(rainier?.elevationFt).toBe(14411);
      expect(rainier?.verticalGainFt).toBe(9000);
      expect(rainier?.glacierGrade).toBe('grade_iii');
      expect(rainier?.crevasseRisk).toBe('extreme');
      expect(rainier?.recommendedTeamSize).toBe(3);
      expect(rainier?.typicalAscentHours).toBe(14);
      expect(rainier?.recommendedRopeLengthM).toBe(60);
      expect(rainier?.cramponType).toBe('semi_automatic');
      expect(rainier?.cruxKeyFeatures.length).toBeGreaterThanOrEqual(2);
    });

    it('has accurate specs for Mount Baker Coleman-Deming', () => {
      const baker = getGlacierRoutes().find(
        (r) => r.id === 'baker-coleman-deming',
      );
      expect(baker).toBeDefined();
      expect(baker?.peakName).toBe('Mount Baker');
      expect(baker?.routeName).toBe('Coleman-Deming Glacier');
      expect(baker?.elevationFt).toBe(10781);
      expect(baker?.verticalGainFt).toBe(7000);
      expect(baker?.glacierGrade).toBe('grade_ii');
      expect(baker?.crevasseRisk).toBe('high');
      expect(baker?.recommendedTeamSize).toBe(3);
      expect(baker?.typicalAscentHours).toBe(10);
      expect(baker?.recommendedRopeLengthM).toBe(50);
      expect(baker?.cramponType).toBe('semi_automatic');
    });

    it('has accurate specs for Mount Shasta Avalanche Gulch', () => {
      const shasta = getGlacierRoutes().find(
        (r) => r.id === 'shasta-avalanche-gulch',
      );
      expect(shasta).toBeDefined();
      expect(shasta?.elevationFt).toBe(14179);
      expect(shasta?.verticalGainFt).toBe(7300);
      expect(shasta?.glacierGrade).toBe('grade_ii');
      expect(shasta?.crevasseRisk).toBe('moderate');
      expect(shasta?.recommendedRopeLengthM).toBe(30);
      expect(shasta?.cramponType).toBe('strap_on');
    });

    it('has accurate specs for Mount Hood South Side', () => {
      const hood = getGlacierRoutes().find(
        (r) => r.id === 'hood-south-side-pearly-gates',
      );
      expect(hood).toBeDefined();
      expect(hood?.elevationFt).toBe(11249);
      expect(hood?.verticalGainFt).toBe(5300);
      expect(hood?.glacierGrade).toBe('grade_ii');
      expect(hood?.crevasseRisk).toBe('high');
      expect(hood?.recommendedRopeLengthM).toBe(30);
      expect(hood?.cramponType).toBe('semi_automatic');
    });

    it('has accurate specs for Mount Olympus Blue Glacier', () => {
      const olympus = getGlacierRoutes().find(
        (r) => r.id === 'olympus-blue-glacier',
      );
      expect(olympus).toBeDefined();
      expect(olympus?.elevationFt).toBe(7980);
      expect(olympus?.verticalGainFt).toBe(8200);
      expect(olympus?.glacierGrade).toBe('grade_iv');
      expect(olympus?.crevasseRisk).toBe('extreme');
      expect(olympus?.recommendedRopeLengthM).toBe(60);
      expect(olympus?.cramponType).toBe('semi_automatic');
    });

    it('filters routes by technical glacier grade', () => {
      const gradeIIRoutes = getGlacierRoutes('grade_ii');
      expect(gradeIIRoutes.length).toBe(3);
      expect(gradeIIRoutes.every((r) => r.glacierGrade === 'grade_ii')).toBe(true);

      const gradeIIIRoutes = getGlacierRoutes('grade_iii');
      expect(gradeIIIRoutes.length).toBe(1);
      expect(gradeIIIRoutes[0].id).toBe('rainier-disappointment-cleaver');

      const gradeIVRoutes = getGlacierRoutes('grade_iv');
      expect(gradeIVRoutes.length).toBe(1);
      expect(gradeIVRoutes[0].id).toBe('olympus-blue-glacier');

      const gradeVRoutes = getGlacierRoutes('grade_v');
      expect(gradeVRoutes).toHaveLength(0);
    });
  });

  describe('getGlacierRouteById', () => {
    it('returns route when valid ID provided', () => {
      const route = getGlacierRouteById('baker-coleman-deming');
      expect(route).toBeDefined();
      expect(route?.peakName).toBe('Mount Baker');
    });

    it('returns undefined when ID does not exist', () => {
      const route = getGlacierRouteById('non-existent-peak');
      expect(route).toBeUndefined();
    });
  });

  describe('calculateRopeTeamPlan', () => {
    it('calculates plan for a standard 3-person team on Mount Baker with firm firn snow', () => {
      const plan = calculateRopeTeamPlan({
        routeId: 'baker-coleman-deming',
        teamMembersCount: 3,
        snowpackFirmness: 'dense_firn',
        rescueHaulSystem: 'z_pulley_3_to_1',
      });

      expect(plan.peakAndRouteName).toContain('Mount Baker');
      expect(plan.recommendedRopeSpacingMeters).toBe(12);
      expect(plan.brakeKnotsRecommended).toBe(false);
      expect(plan.snowPicketCountRequired).toBe(4);
      expect(plan.preriggedPrusikCount).toBe(6);
      expect(plan.rescueHaulMechanicalAdvantage).toContain('3:1');
      expect(plan.glacierTurnaroundTimeHours).toBe(6);
    });

    it('recommends brake knots for a 2-person rope team even on firm snow', () => {
      const plan = calculateRopeTeamPlan({
        routeId: 'baker-coleman-deming',
        teamMembersCount: 2,
        snowpackFirmness: 'hardpack_crust',
        rescueHaulSystem: 'c_pulley_2_to_1',
      });

      expect(plan.brakeKnotsRecommended).toBe(true);
      expect(plan.recommendedRopeSpacingMeters).toBe(14);
      expect(plan.preriggedPrusikCount).toBe(4);
      expect(plan.rescueHaulMechanicalAdvantage).toContain('2:1');
      expect(plan.safetyAlert).toBeDefined();
      expect(plan.safetyAlert).toContain('Two-person');
    });

    it('recommends brake knots and extra pickets in soft spring snow or fresh powder for 3+ person teams', () => {
      const plan = calculateRopeTeamPlan({
        routeId: 'rainier-disappointment-cleaver',
        teamMembersCount: 3,
        snowpackFirmness: 'soft_wet_spring',
        rescueHaulSystem: 'compound_6_to_1',
      });

      expect(plan.brakeKnotsRecommended).toBe(true);
      expect(plan.recommendedRopeSpacingMeters).toBe(14); // Wider spacing in soft snow
      expect(plan.snowPicketCountRequired).toBe(5); // Extra pickets for soft snow deadman anchors
      expect(plan.rescueHaulMechanicalAdvantage).toContain('6:1');
      expect(plan.safetyAlert).toBeDefined();
    });

    it('handles compound 6:1 rescue haul mechanical advantage system', () => {
      const plan = calculateRopeTeamPlan({
        routeId: 'olympus-blue-glacier',
        teamMembersCount: 4,
        snowpackFirmness: 'dense_firn',
        rescueHaulSystem: 'compound_6_to_1',
      });

      expect(plan.rescueHaulMechanicalAdvantage).toContain('6:1');
      expect(plan.recommendedRopeSpacingMeters).toBe(10);
      expect(plan.preriggedPrusikCount).toBe(8);
    });

    it('clamps team size to 2-5 climbers', () => {
      const lowPlan = calculateRopeTeamPlan({
        routeId: 'shasta-avalanche-gulch',
        teamMembersCount: 1,
        snowpackFirmness: 'dense_firn',
        rescueHaulSystem: 'z_pulley_3_to_1',
      });
      expect(lowPlan.brakeKnotsRecommended).toBe(true); // Clamped to 2
      expect(lowPlan.preriggedPrusikCount).toBe(4);

      const highPlan = calculateRopeTeamPlan({
        routeId: 'shasta-avalanche-gulch',
        teamMembersCount: 8,
        snowpackFirmness: 'dense_firn',
        rescueHaulSystem: 'z_pulley_3_to_1',
      });
      expect(highPlan.recommendedRopeSpacingMeters).toBe(8); // Clamped to 5
      expect(highPlan.preriggedPrusikCount).toBe(10);
    });
  });

  describe('getGlacierGear checklist', () => {
    it('returns the 6 mandatory technical glacier kit items', () => {
      const gear = getGlacierGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((g) => g.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('ice-axe');
      expect(ids).toContain('crampons');
      expect(ids).toContain('glacier-rope');
      expect(ids).toContain('crevasse-rescue-kit');
      expect(ids).toContain('snow-picket');
      expect(ids).toContain('mountaineering-helmet');

      const iceAxe = gear.find((g) => g.id === 'ice-axe');
      expect(iceAxe?.name).toContain('ice axe');
      expect(iceAxe?.category).toBe('hardware');

      const rescueKit = gear.find((g) => g.id === 'crevasse-rescue-kit');
      expect(rescueKit?.category).toBe('rescue');
      expect(rescueKit?.description).toContain('micro-traxion');
    });
  });
});
