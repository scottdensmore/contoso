import { describe, it, expect } from 'vitest';
import {
  getCaveDivingSites,
  getCaveDivingSiteById,
  calculateCaveDivingGas,
  getCaveDivingGearChecklist,
  type CaveDivingQuery,
} from './cave-diving';

describe('cave-diving library', () => {
  describe('site retrieval and filtering', () => {
    it('returns all 5 iconic karst sump and cave diving sites when unfiltered', () => {
      const sites = getCaveDivingSites();
      expect(sites).toHaveLength(5);
      expect(sites.map((s) => s.id)).toEqual([
        'peacock-springs-karst',
        'ginnie-springs-devil-system',
        'cholla-sump-lost-creek',
        'phantom-lake-spring',
        'tuckaleechee-caverns-sump',
      ]);
    });

    it('filters sites by primary rigging setup', () => {
      const sidemountSites = getCaveDivingSites('sidemount_dual_cylinder');
      expect(sidemountSites).toHaveLength(3);
      expect(sidemountSites.every((s) => s.primaryRigging === 'sidemount_dual_cylinder')).toBe(true);

      const doublesSites = getCaveDivingSites('backmount_manifold_doubles');
      expect(doublesSites).toHaveLength(1);
      expect(doublesSites[0].id).toBe('ginnie-springs-devil-system');

      const ccrSites = getCaveDivingSites('closed_circuit_rebreather_ccr');
      expect(ccrSites).toHaveLength(1);
      expect(ccrSites[0].id).toBe('phantom-lake-spring');
    });

    it('finds site by ID', () => {
      const site = getCaveDivingSiteById('cholla-sump-lost-creek');
      expect(site).toBeDefined();
      expect(site?.title).toBe('Lost Creek Siphon Sump Penetration');
      expect(site?.flowType).toBe('inflowing_siphon_suction');
      expect(site?.waterTempC).toBe(4);
      expect(site?.siltRisk).toBe('extreme_clay_zero_vis');
    });

    it('returns undefined for non-existent site ID', () => {
      const site = getCaveDivingSiteById('non-existent-cave');
      expect(site).toBeUndefined();
    });
  });

  describe('gas management and penetration calculations', () => {
    it('calculates usable and reserve gas for rule of thirds', () => {
      const query: CaveDivingQuery = {
        siteId: 'peacock-springs-karst',
        riggingSetup: 'sidemount_dual_cylinder',
        startingPressurePsi: 3000,
        reserveRule: 'rule_of_thirds',
        plannedPenetrationMeters: 120,
        flowType: 'static_slack_phreatic',
      };

      const result = calculateCaveDivingGas(query);
      expect(result.siteTitle).toBe('Peacock Springs Karst Siphon & Grand Traverse');
      expect(result.usableGasPsi).toBe(1000);
      expect(result.turnPressurePsi).toBe(2000);
      expect(result.reserveGasPsi).toBe(2000);
      expect(result.guidelineSpoolRequiredMeters).toBe(200); // 120 * 1.25 + 50 = 200
      expect(result.penetrationSafety).toBe('nominal_safe_turn');
      expect(result.siltRisk).toBe('moderate_sand_drift');
    });

    it('calculates usable and reserve gas for rule of quarters', () => {
      const query: CaveDivingQuery = {
        siteId: 'ginnie-springs-devil-system',
        riggingSetup: 'backmount_manifold_doubles',
        startingPressurePsi: 3000,
        reserveRule: 'rule_of_quarters',
        plannedPenetrationMeters: 120,
        flowType: 'outflowing_spring_resurgence',
      };

      const result = calculateCaveDivingGas(query);
      expect(result.usableGasPsi).toBe(750); // 3000 * 0.25
      expect(result.turnPressurePsi).toBe(2250);
      expect(result.reserveGasPsi).toBe(2250);
      expect(result.penetrationSafety).toBe('nominal_safe_turn');
    });

    it('calculates usable and reserve gas for rule of sixths', () => {
      const query: CaveDivingQuery = {
        siteId: 'cholla-sump-lost-creek',
        riggingSetup: 'sidemount_dual_cylinder',
        startingPressurePsi: 3000,
        reserveRule: 'rule_of_sixths',
        plannedPenetrationMeters: 120,
        flowType: 'inflowing_siphon_suction',
      };

      const result = calculateCaveDivingGas(query);
      expect(result.usableGasPsi).toBe(500); // 3000 * (1/6)
      expect(result.turnPressurePsi).toBe(2500);
      expect(result.reserveGasPsi).toBe(2500);
      // With rule_of_sixths, siphon suction is nominal_safe_turn
      expect(result.penetrationSafety).toBe('nominal_safe_turn');
    });

    it('triggers critical_gas_reserve_alert for inflowing siphon suction when reserve rule is not rule of sixths', () => {
      const thirdsQuery: CaveDivingQuery = {
        siteId: 'cholla-sump-lost-creek',
        riggingSetup: 'sidemount_dual_cylinder',
        startingPressurePsi: 3000,
        reserveRule: 'rule_of_thirds',
        plannedPenetrationMeters: 120,
        flowType: 'inflowing_siphon_suction',
      };

      const thirdsResult = calculateCaveDivingGas(thirdsQuery);
      expect(thirdsResult.penetrationSafety).toBe('critical_gas_reserve_alert');

      const quartersQuery: CaveDivingQuery = {
        ...thirdsQuery,
        reserveRule: 'rule_of_quarters',
      };
      const quartersResult = calculateCaveDivingGas(quartersQuery);
      expect(quartersResult.penetrationSafety).toBe('critical_gas_reserve_alert');
    });

    it('triggers caution_flow_resistance for static slack phreatic when penetration exceeds 200m', () => {
      const query: CaveDivingQuery = {
        siteId: 'phantom-lake-spring',
        riggingSetup: 'closed_circuit_rebreather_ccr',
        startingPressurePsi: 3000,
        reserveRule: 'rule_of_thirds',
        plannedPenetrationMeters: 250,
        flowType: 'static_slack_phreatic',
      };

      const result = calculateCaveDivingGas(query);
      expect(result.penetrationSafety).toBe('caution_flow_resistance');
      expect(result.guidelineSpoolRequiredMeters).toBe(363); // round(250 * 1.25) + 50 = 313 + 50 = 363
    });

    it('returns nominal_safe_turn for outflowing spring resurgence', () => {
      const query: CaveDivingQuery = {
        siteId: 'ginnie-springs-devil-system',
        riggingSetup: 'backmount_manifold_doubles',
        startingPressurePsi: 3200,
        reserveRule: 'rule_of_thirds',
        plannedPenetrationMeters: 150,
        flowType: 'outflowing_spring_resurgence',
      };

      const result = calculateCaveDivingGas(query);
      expect(result.penetrationSafety).toBe('nominal_safe_turn');
    });

    it('provides gas management and decompression advisories', () => {
      const query: CaveDivingQuery = {
        siteId: 'phantom-lake-spring',
        riggingSetup: 'closed_circuit_rebreather_ccr',
        startingPressurePsi: 3000,
        reserveRule: 'rule_of_thirds',
        plannedPenetrationMeters: 120,
        flowType: 'static_slack_phreatic',
      };

      const result = calculateCaveDivingGas(query);
      expect(result.gasManagementAdvisory).toBeDefined();
      expect(result.gasManagementAdvisory.length).toBeGreaterThan(10);
      expect(result.decompressionAdvisory).toBeDefined();
      expect(result.decompressionAdvisory.length).toBeGreaterThan(10);
    });
  });

  describe('mandatory gear checklist', () => {
    it('returns 6 mandatory cave diving safety gear items', () => {
      const gear = getCaveDivingGearChecklist();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((item) => item.id);
      expect(ids).toContain('primary-safety-guideline-reels');
      expect(ids).toContain('redundant-led-dive-lights');
      expect(ids).toContain('sidemount-dual-regulator-kit');
      expect(ids).toContain('dual-cutting-devices');
      expect(ids).toContain('underwater-dive-slate-markers');
      expect(ids).toContain('drysuit-crush-resistant-boots');
    });
  });
});
