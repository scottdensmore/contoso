import { describe, it, expect } from 'vitest';
import {
  getRiverSupRuns,
  getRiverSupRunById,
  calculateRiverSup,
  getRiverSupGear,
} from './river-sup';

describe('river-sup lib', () => {
  describe('getRiverSupRuns', () => {
    it('returns all 5 iconic river SUP runs when no filter is supplied', () => {
      const runs = getRiverSupRuns();
      expect(runs).toHaveLength(5);

      const ids = runs.map((r) => r.id);
      expect(ids).toContain('arkansas-river-browns-canyon');
      expect(ids).toContain('white-salmon-husum');
      expect(ids).toContain('french-broad-section-9');
      expect(ids).toContain('deschutes-maupin-run');
      expect(ids).toContain('soca-kobarid-slalom');
    });

    it('filters runs correctly by RiverDifficulty', () => {
      const class2Runs = getRiverSupRuns('class_ii');
      expect(class2Runs).toHaveLength(0);

      const class3Runs = getRiverSupRuns('class_iii');
      expect(class3Runs).toHaveLength(3);
      expect(class3Runs.map((r) => r.id)).toEqual(
        expect.arrayContaining([
          'arkansas-river-browns-canyon',
          'french-broad-section-9',
          'deschutes-maupin-run',
        ]),
      );

      const class4Runs = getRiverSupRuns('class_iv');
      expect(class4Runs).toHaveLength(2);
      expect(class4Runs.map((r) => r.id)).toEqual(
        expect.arrayContaining(['white-salmon-husum', 'soca-kobarid-slalom']),
      );
    });

    it('verifies all expected run properties are correctly populated', () => {
      const brownsCanyon = getRiverSupRunById('arkansas-river-browns-canyon');
      expect(brownsCanyon).toBeDefined();
      expect(brownsCanyon?.title).toBe('Browns Canyon National Monument');
      expect(brownsCanyon?.riverSystem).toBe('Arkansas River');
      expect(brownsCanyon?.region).toBe('Salida/Buena Vista, CO, USA');
      expect(brownsCanyon?.difficulty).toBe('class_iii');
      expect(brownsCanyon?.lengthMiles).toBe(14);
      expect(brownsCanyon?.gradientFtPerMile).toBe(28);
      expect(brownsCanyon?.flowRangeCfs).toBe('800 - 2,200 CFS');
      expect(brownsCanyon?.typicalDurationHours).toBe(4.5);
      expect(brownsCanyon?.highlights).toEqual(
        expect.arrayContaining([
          'Canyon punchy wavetrains',
          'Continuous granite boulder gardens',
          'Zoeller & Seidel eddy lines',
        ]),
      );

      const whiteSalmon = getRiverSupRunById('white-salmon-husum');
      expect(whiteSalmon).toBeDefined();
      expect(whiteSalmon?.title).toBe('Middle White Salmon River');
      expect(whiteSalmon?.riverSystem).toBe('White Salmon River');
      expect(whiteSalmon?.region).toBe('BZ Corners, WA, USA');
      expect(whiteSalmon?.difficulty).toBe('class_iv');
      expect(whiteSalmon?.lengthMiles).toBe(6);
      expect(whiteSalmon?.gradientFtPerMile).toBe(45);
      expect(whiteSalmon?.flowRangeCfs).toBe('900 - 2,500 CFS');
      expect(whiteSalmon?.typicalDurationHours).toBe(3.0);
      expect(whiteSalmon?.highlights).toEqual(
        expect.arrayContaining([
          'Lush basalt canyon gorges',
          'Punchy hydraulic holes',
          'Husum Falls portage option',
        ]),
      );
    });

    it('returns undefined for non-existent run IDs', () => {
      expect(getRiverSupRunById('non-existent-run')).toBeUndefined();
    });
  });

  describe('calculateRiverSup', () => {
    it('calculates payload buoyancy ratios and approved setup accurately for default values', () => {
      const result = calculateRiverSup({
        runId: 'arkansas-river-browns-canyon',
        paddlerWeightKg: 75,
        gearWeightKg: 5,
        boardVolumeLiters: 310,
        riverFlowCfs: 1500,
        finType: 'short_flexible_river_fins',
        leashType: 'torso_quick_release',
      });

      expect(result.runTitle).toBe('Browns Canyon National Monument');
      expect(result.totalPayloadKg).toBe(80);
      expect(result.volumeToWeightRatio).toBe(3.88);
      expect(result.buoyancyRating).toMatch(/optimal/i);
      expect(result.stabilityIndexPercent).toBeGreaterThanOrEqual(80);
      expect(result.finClearanceStatus).toMatch(/flexible|clearance/i);
      expect(result.leashSafetyStatus).toMatch(/quick-release/i);
      expect(result.safetyStatus).toBe('approved');
      expect(result.paddlingAdvisory).toMatch(/optimal|approved/i);
    });

    it('triggers hazardous prohibited status and danger warning if fixed ankle leash is chosen', () => {
      const result = calculateRiverSup({
        runId: 'arkansas-river-browns-canyon',
        paddlerWeightKg: 75,
        gearWeightKg: 5,
        boardVolumeLiters: 310,
        riverFlowCfs: 1500,
        finType: 'short_flexible_river_fins',
        leashType: 'ankle_fixed_coiled',
      });

      expect(result.safetyStatus).toBe('hazardous_prohibited');
      expect(result.leashSafetyStatus).toMatch(/danger|entrapment|prohibited/i);
      expect(result.paddlingAdvisory).toMatch(/prohibited|ankle leash/i);
    });

    it('triggers hazardous prohibited status and strike warning if standard long touring fin is chosen', () => {
      const result = calculateRiverSup({
        runId: 'white-salmon-husum',
        paddlerWeightKg: 75,
        gearWeightKg: 5,
        boardVolumeLiters: 310,
        riverFlowCfs: 1500,
        finType: 'standard_long_touring_fin',
        leashType: 'torso_quick_release',
      });

      expect(result.safetyStatus).toBe('hazardous_prohibited');
      expect(result.finClearanceStatus).toMatch(/danger|strike|pitch-pole|flipping/i);
      expect(result.paddlingAdvisory).toMatch(/prohibited|fin/i);
    });

    it('triggers hazardous prohibited status for severely under-buoyant setups', () => {
      const result = calculateRiverSup({
        runId: 'arkansas-river-browns-canyon',
        paddlerWeightKg: 120,
        gearWeightKg: 20,
        boardVolumeLiters: 220,
        riverFlowCfs: 1500,
        finType: 'short_flexible_river_fins',
        leashType: 'torso_quick_release',
      });

      // 220 / 140 = 1.57 ratio
      expect(result.totalPayloadKg).toBe(140);
      expect(result.volumeToWeightRatio).toBe(1.57);
      expect(result.safetyStatus).toBe('hazardous_prohibited');
      expect(result.buoyancyRating).toMatch(/low buoyancy|submerged/i);
    });

    it('triggers caution expert only on Class IV runs or unattached leash setups', () => {
      // Class IV run with compliant gear
      const resultClass4 = calculateRiverSup({
        runId: 'white-salmon-husum',
        paddlerWeightKg: 75,
        gearWeightKg: 5,
        boardVolumeLiters: 310,
        riverFlowCfs: 1500,
        finType: 'short_flexible_river_fins',
        leashType: 'torso_quick_release',
      });

      expect(resultClass4.safetyStatus).toBe('caution_expert_only');
      expect(resultClass4.paddlingAdvisory).toMatch(/expert/i);

      // Unattached leash setup on Class III run
      const resultNoLeash = calculateRiverSup({
        runId: 'french-broad-section-9',
        paddlerWeightKg: 75,
        gearWeightKg: 5,
        boardVolumeLiters: 310,
        riverFlowCfs: 1500,
        finType: 'retractable_click_fin',
        leashType: 'none',
      });

      expect(resultNoLeash.safetyStatus).toBe('caution_expert_only');
      expect(resultNoLeash.leashSafetyStatus).toMatch(/unattached|caution/i);
    });

    it('handles fallback runTitle for unknown runId', () => {
      const result = calculateRiverSup({
        runId: 'unknown-river-run',
        paddlerWeightKg: 75,
        gearWeightKg: 5,
        boardVolumeLiters: 310,
        riverFlowCfs: 1500,
        finType: 'short_flexible_river_fins',
        leashType: 'torso_quick_release',
      });

      expect(result.runTitle).toBe('River SUP Run');
    });
  });

  describe('getRiverSupGear', () => {
    it('returns all 6 mandatory river SUP safety kit items', () => {
      const gear = getRiverSupGear();
      expect(gear).toHaveLength(6);

      expect(gear.every((item) => item.mandatory === true)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('quick-release-torso-leash');
      expect(ids).toContain('whitewater-certified-pfd');
      expect(ids).toContain('drainage-water-helmet');
      expect(ids).toContain('flexible-river-fins');
      expect(ids).toContain('carbon-reinforced-river-paddle');
      expect(ids).toContain('padded-neoprene-booties');

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('leash_safety');
      expect(categories).toContain('buoyancy');
      expect(categories).toContain('head_protection');
      expect(categories).toContain('fins');
      expect(categories).toContain('propulsion');
      expect(categories).toContain('footwear');
    });
  });
});
