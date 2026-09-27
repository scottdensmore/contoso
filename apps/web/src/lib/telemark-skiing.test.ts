import { describe, it, expect } from 'vitest';
import {
  getTelemarkZones,
  getTelemarkZoneById,
  getTelemarkGearChecklist,
  calculateTelemarkActivity,
  type TelemarkQuery,
} from './telemark-skiing';

describe('telemark-skiing library', () => {
  describe('getTelemarkZones', () => {
    it('returns all 5 iconic zones when unfiltered', () => {
      const zones = getTelemarkZones();
      expect(zones).toHaveLength(5);
      const ids = zones.map((z) => z.id);
      expect(ids).toContain('silverton-mountain-powder');
      expect(ids).toContain('mad-river-glen-trees');
      expect(ids).toContain('alta-catherine-pass');
      expect(ids).toContain('rogers-pass-asulkan');
      expect(ids).toContain('tuckerman-ravine-bowl');
    });

    it('filters zones correctly by binding system', () => {
      const ntnZones = getTelemarkZones('ntn_modern');
      expect(ntnZones).toHaveLength(3);
      expect(ntnZones.every((z) => z.primaryBinding === 'ntn_modern')).toBe(true);

      const duckbillZones = getTelemarkZones('duckbill_75mm_cable');
      expect(duckbillZones).toHaveLength(1);
      expect(duckbillZones[0].id).toBe('mad-river-glen-trees');

      const hybridZones = getTelemarkZones('tele_tech_hybrid');
      expect(hybridZones).toHaveLength(1);
      expect(hybridZones[0].id).toBe('rogers-pass-asulkan');
    });

    it('preserves complete zone details and metadata', () => {
      const silverton = getTelemarkZones().find((z) => z.id === 'silverton-mountain-powder');
      expect(silverton).toBeDefined();
      expect(silverton?.elevationMeters).toBe(4100);
      expect(silverton?.steepnessDegrees).toBe(45);
      expect(silverton?.range).toBe('San Juan National Forest');
      expect(silverton?.region).toBe('San Juan Mountains, Colorado, USA');
      expect(silverton?.snowType).toBe('Deep Ungrooved Dry San Juan Powder');
      expect(silverton?.highlights).toHaveLength(3);
    });
  });

  describe('getTelemarkZoneById', () => {
    it('retrieves an existing zone by id', () => {
      const zone = getTelemarkZoneById('alta-catherine-pass');
      expect(zone).toBeDefined();
      expect(zone?.title).toBe("Alta Backcountry Catherine's Pass & Supreme Cirque");
    });

    it('returns undefined for non-existent zone id', () => {
      const zone = getTelemarkZoneById('non-existent-zone');
      expect(zone).toBeUndefined();
    });
  });

  describe('getTelemarkGearChecklist', () => {
    it('returns 6 mandatory telemark gear items', () => {
      const gear = getTelemarkGearChecklist();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('telemark-bellows-boots');
      expect(ids).toContain('touring-climbing-skins');
      expect(ids).toContain('safety-leash-release-cables');
      expect(ids).toContain('adjustable-whippet-poles');
      expect(ids).toContain('binding-spare-cartridge-kit');
      expect(ids).toContain('avalanche-airbag-rescue-pack');
    });

    it('provides valid categories and descriptions for each item', () => {
      const gear = getTelemarkGearChecklist();
      const boot = gear.find((g) => g.id === 'telemark-bellows-boots');
      expect(boot?.category).toBe('boots');
      expect(boot?.description).toContain('Metatarsal accordion bellows');
    });
  });

  describe('calculateTelemarkActivity', () => {
    it('computes baseline resistance for modern NTN bindings at default tension and weight', () => {
      const query: TelemarkQuery = {
        zoneId: 'silverton-mountain-powder',
        bindingSystem: 'ntn_modern',
        skierWeightLbs: 170,
        snowCondition: 'deep_blower_powder',
        turnStyle: 'fluid_deep_knee_lunges',
        tensionLevel: 3,
      };

      const result = calculateTelemarkActivity(query);
      // base: 45.0, tension mod: (3-3)*6 = 0, weight factor: 170/170 = 1.0 -> 45.0 Nm
      expect(result.effectiveResistanceNm).toBe(45.0);
      // 45.0 / 80.0 = 0.5625 -> round(0.5625 * 100) / 100 = 0.56
      expect(result.tipDriveEdgePressureIndex).toBe(0.56);
      expect(result.resistanceRating).toBe('balanced_all_mountain');
      expect(result.zoneTitle).toBe('Silverton Mountain High Alpine Freeheel Bowls');
      expect(result.bindingSystem).toBe('ntn_modern');
    });

    it('computes baseline resistance for duckbill 75mm cable bindings', () => {
      const query: TelemarkQuery = {
        zoneId: 'mad-river-glen-trees',
        bindingSystem: 'duckbill_75mm_cable',
        skierWeightLbs: 170,
        snowCondition: 'firm_hardpack_groomer',
        turnStyle: 'fluid_deep_knee_lunges',
        tensionLevel: 3,
      };

      const result = calculateTelemarkActivity(query);
      // base: 35.0, tension mod: 0 -> 35.0 Nm
      expect(result.effectiveResistanceNm).toBe(35.0);
      // 35.0 / 80.0 = 0.4375 -> round(0.4375 * 100) / 100 = 0.44
      expect(result.tipDriveEdgePressureIndex).toBe(0.44);
      expect(result.resistanceRating).toBe('balanced_all_mountain');
    });

    it('computes baseline resistance for tele tech hybrid bindings', () => {
      const query: TelemarkQuery = {
        zoneId: 'rogers-pass-asulkan',
        bindingSystem: 'tele_tech_hybrid',
        skierWeightLbs: 170,
        snowCondition: 'deep_blower_powder',
        turnStyle: 'compact_quick_tempo',
        tensionLevel: 3,
      };

      const result = calculateTelemarkActivity(query);
      // base: 40.0, tension mod: 0 -> 40.0 Nm
      expect(result.effectiveResistanceNm).toBe(40.0);
      expect(result.tipDriveEdgePressureIndex).toBe(0.50);
      expect(result.resistanceRating).toBe('balanced_all_mountain');
    });

    it('adjusts resistance based on tension level modifiers', () => {
      // Minimum tension 1 on NTN: base 45 + (1-3)*6 = 33.0 Nm (< 35 -> supple_surf_flex)
      const lowTensionResult = calculateTelemarkActivity({
        zoneId: 'silverton-mountain-powder',
        bindingSystem: 'ntn_modern',
        skierWeightLbs: 170,
        snowCondition: 'deep_blower_powder',
        turnStyle: 'fluid_deep_knee_lunges',
        tensionLevel: 1,
      });
      expect(lowTensionResult.effectiveResistanceNm).toBe(33.0);
      expect(lowTensionResult.resistanceRating).toBe('supple_surf_flex');

      // Maximum tension 5 on NTN: base 45 + (5-3)*6 = 57.0 Nm (52 <= 57 < 70 -> active_carving_power)
      const highTensionResult = calculateTelemarkActivity({
        zoneId: 'silverton-mountain-powder',
        bindingSystem: 'ntn_modern',
        skierWeightLbs: 170,
        snowCondition: 'deep_blower_powder',
        turnStyle: 'steep_jump_tele_turn',
        tensionLevel: 5,
      });
      expect(highTensionResult.effectiveResistanceNm).toBe(57.0);
      expect(highTensionResult.tipDriveEdgePressureIndex).toBe(0.71);
      expect(highTensionResult.resistanceRating).toBe('active_carving_power');
    });

    it('scales resistance and classifies as stiff_race_lockout for heavy skier and max tension', () => {
      // 220 lbs, tension 5 on NTN: (45 + 12) * (220 / 170) = 57 * 1.2941176 = 73.7647 -> 73.8 Nm
      const heavyResult = calculateTelemarkActivity({
        zoneId: 'silverton-mountain-powder',
        bindingSystem: 'ntn_modern',
        skierWeightLbs: 220,
        snowCondition: 'firm_hardpack_groomer',
        turnStyle: 'steep_jump_tele_turn',
        tensionLevel: 5,
      });
      expect(heavyResult.effectiveResistanceNm).toBe(73.8);
      expect(heavyResult.resistanceRating).toBe('stiff_race_lockout');
      expect(heavyResult.bellowsStrainWarning).toContain('High bellows fatigue risk');
    });

    it('caps tipDriveEdgePressureIndex at 0.98 max', () => {
      const maxedResult = calculateTelemarkActivity({
        zoneId: 'silverton-mountain-powder',
        bindingSystem: 'ntn_modern',
        skierWeightLbs: 260,
        snowCondition: 'firm_hardpack_groomer',
        turnStyle: 'steep_jump_tele_turn',
        tensionLevel: 5,
      });
      expect(maxedResult.tipDriveEdgePressureIndex).toBe(0.98);
    });

    it('generates appropriate lead change and edge transition guidance based on input styles', () => {
      const jumpResult = calculateTelemarkActivity({
        zoneId: 'tuckerman-ravine-bowl',
        bindingSystem: 'ntn_modern',
        skierWeightLbs: 170,
        snowCondition: 'steep_spring_corn',
        turnStyle: 'steep_jump_tele_turn',
        tensionLevel: 4,
      });
      expect(jumpResult.leadChangeAdvisory).toContain('airborne lead change');
      expect(jumpResult.edgeTransitionGuidance).toContain('NTN underfoot claw');

      const duckbillResult = calculateTelemarkActivity({
        zoneId: 'mad-river-glen-trees',
        bindingSystem: 'duckbill_75mm_cable',
        skierWeightLbs: 160,
        snowCondition: 'deep_blower_powder',
        turnStyle: 'compact_quick_tempo',
        tensionLevel: 2,
      });
      expect(duckbillResult.leadChangeAdvisory).toContain('Rapid, tight lead changes');
      expect(duckbillResult.edgeTransitionGuidance).toContain('75mm duckbill cable');
    });
  });
});
