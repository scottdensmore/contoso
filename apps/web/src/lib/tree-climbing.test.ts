import { describe, it, expect } from 'vitest';
import {
  getCanopyGroves,
  getCanopyGroveById,
  calculateTreeClimbing,
  getTreeGear,
} from './tree-climbing';

describe('Tree Climbing & Arboreal Canopy Expedition Systems Lib', () => {
  describe('getCanopyGroves and getCanopyGroveById', () => {
    it('returns all 5 iconic canopy expedition groves', () => {
      const groves = getCanopyGroves();
      expect(groves).toHaveLength(5);
      expect(groves.map((g) => g.id)).toEqual([
        'redwood-canopy-prairie-creek',
        'olympic-rainforest-sitka',
        'sequoia-giant-forest',
        'appalachian-white-oak',
        'tasmanian-tarkine-eucalyptus',
      ]);
    });

    it('filters groves by climbing system', () => {
      const srtGroves = getCanopyGroves('SRT');
      expect(srtGroves).toHaveLength(4);
      expect(srtGroves.every((g) => g.climbingSystem === 'SRT')).toBe(true);

      const mrtGroves = getCanopyGroves('MRT_DRT');
      expect(mrtGroves).toHaveLength(1);
      expect(mrtGroves[0].id).toBe('appalachian-white-oak');
      expect(mrtGroves[0].climbingSystem).toBe('MRT_DRT');
    });

    it('retrieves grove by id correctly', () => {
      const redwood = getCanopyGroveById('redwood-canopy-prairie-creek');
      expect(redwood).toBeDefined();
      expect(redwood?.title).toBe('Prairie Creek Redwoods Canopy Expedition');
      expect(redwood?.treeSpecies).toBe('Coast Redwood (Sequoia sempervirens)');
      expect(redwood?.canopyHeightM).toBe(92);
      expect(redwood?.limbDiameterMinCm).toBe(25);
      expect(redwood?.highlights).toContain('90m+ vertical ascent corridors');
    });

    it('returns undefined for nonexistent grove id', () => {
      expect(getCanopyGroveById('nonexistent-grove')).toBeUndefined();
    });
  });

  describe('getTreeGear', () => {
    it('returns 6 mandatory tree gear kit items', () => {
      const gear = getTreeGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const categories = gear.map((item) => item.category);
      expect(categories).toContain('tree_protection');
      expect(categories).toContain('rigging');
      expect(categories).toContain('rope');
      expect(categories).toContain('harness');
      expect(categories).toContain('ascender');
      expect(categories).toContain('ppe');
    });
  });

  describe('calculateTreeClimbing', () => {
    it('calculates basal anchor peak fork loads with 2.0x multiplier and 1.2 safety factor', () => {
      const result = calculateTreeClimbing({
        groveId: 'redwood-canopy-prairie-creek',
        climbingSystem: 'SRT',
        anchorStyle: 'basal_anchor',
        climberWeightLbs: 190,
        branchDiameterCm: 22,
      });

      // 190 * 2.0 * 1.2 = 456
      expect(result.peakForkLoadLbs).toBe(456);
      // 456 * 0.00444822 = 2.028... => 2.03
      expect(result.peakForkLoadKn).toBe(2.03);
      // (22 / 15.0)^2 = 2.1511... => 2.15
      expect(result.limbSafetyRatio).toBe(2.15);
      expect(result.safetyStatus).toBe('approved_cambium_saver_required');
      expect(result.frictionHitchRecommendation).toBe(
        'Valdôtain Tresse (VT) or Rope Wrench with 8mm Heat-Resistant Cord'
      );
      expect(result.groveTitle).toBe('Prairie Creek Redwoods Canopy Expedition');
    });

    it('calculates canopy isolated anchor peak fork loads with 1.0x multiplier and 1.2 safety factor', () => {
      const result = calculateTreeClimbing({
        groveId: 'appalachian-white-oak',
        climbingSystem: 'MRT_DRT',
        anchorStyle: 'canopy_anchor',
        climberWeightLbs: 190,
        branchDiameterCm: 22,
      });

      // 190 * 1.0 * 1.2 = 228
      expect(result.peakForkLoadLbs).toBe(228);
      // 228 * 0.00444822 = 1.014... => 1.01
      expect(result.peakForkLoadKn).toBe(1.01);
      expect(result.frictionHitchRecommendation).toBe(
        'Distel or Michoacan friction hitch on dynamic split-tail'
      );
    });

    it('evaluates safety status thresholds based on branch diameter', () => {
      // < 12 cm => prohibited_structural_failure_risk
      const prohibited = calculateTreeClimbing({
        groveId: 'redwood-canopy-prairie-creek',
        climbingSystem: 'SRT',
        anchorStyle: 'basal_anchor',
        climberWeightLbs: 180,
        branchDiameterCm: 11,
      });
      expect(prohibited.safetyStatus).toBe('prohibited_structural_failure_risk');

      // 12 to < 15 cm => marginal_undersized_limb_hazard
      const marginal = calculateTreeClimbing({
        groveId: 'redwood-canopy-prairie-creek',
        climbingSystem: 'SRT',
        anchorStyle: 'basal_anchor',
        climberWeightLbs: 180,
        branchDiameterCm: 14,
      });
      expect(marginal.safetyStatus).toBe('marginal_undersized_limb_hazard');

      // >= 15 cm => approved_cambium_saver_required
      const approved = calculateTreeClimbing({
        groveId: 'redwood-canopy-prairie-creek',
        climbingSystem: 'SRT',
        anchorStyle: 'basal_anchor',
        climberWeightLbs: 180,
        branchDiameterCm: 15,
      });
      expect(approved.safetyStatus).toBe('approved_cambium_saver_required');
    });

    it('falls back to custom title when groveId is not found', () => {
      const result = calculateTreeClimbing({
        groveId: 'unknown-grove',
        climbingSystem: 'SRT',
        anchorStyle: 'canopy_anchor',
        climberWeightLbs: 160,
        branchDiameterCm: 20,
      });
      expect(result.groveTitle).toBe('Canopy Expedition Anchor');
    });
  });
});
