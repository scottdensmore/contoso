import { describe, it, expect } from 'vitest';
import {
  getCaveMineralogySites,
  getCaveMineralogySiteById,
  getSpeleothemGearChecklist,
  calculateMineralAccretion,
  type MineralAccretionQuery,
} from './cave-mineralogy';

describe('Wilderness Caving Cave Pearl Karst Mineralogy & Speleothem Survey Domain Logic', () => {
  describe('Karst Mineralogy Sites Catalog', () => {
    it('returns all 5 iconic wilderness karst mineralogy sites', () => {
      const sites = getCaveMineralogySites();
      expect(sites).toHaveLength(5);

      const ids = sites.map((s) => s.id);
      expect(ids).toContain('carlsbad-rookery-chamber');
      expect(ids).toContain('lechuguilla-chandelier-room');
      expect(ids).toContain('organ-cave-anthodite-gallery');
      expect(ids).toContain('mammoth-frozen-niagara');
      expect(ids).toContain('blanchard-springs-coral-grotto');
    });

    it('filters sites by speleothemType', () => {
      const pearls = getCaveMineralogySites('cave_pearl_pisolith');
      expect(pearls).toHaveLength(1);
      expect(pearls[0].id).toBe('carlsbad-rookery-chamber');
      expect(pearls[0].speleothemType).toBe('cave_pearl_pisolith');

      const helictites = getCaveMineralogySites('eccentric_helictite');
      expect(helictites).toHaveLength(1);
      expect(helictites[0].id).toBe('blanchard-springs-coral-grotto');

      const anthodites = getCaveMineralogySites('aragonite_anthodite');
      expect(anthodites).toHaveLength(1);
      expect(anthodites[0].id).toBe('organ-cave-anthodite-gallery');

      const gypsum = getCaveMineralogySites('gypsum_flower_needle');
      expect(gypsum).toHaveLength(1);
      expect(gypsum[0].id).toBe('lechuguilla-chandelier-room');

      const rimstone = getCaveMineralogySites('rimstone_gour_dam');
      expect(rimstone).toHaveLength(1);
      expect(rimstone[0].id).toBe('mammoth-frozen-niagara');
    });

    it('filters sites by conservationStatus', () => {
      const pristine = getCaveMineralogySites(undefined, 'pristine_active_growth');
      expect(pristine).toHaveLength(3);
      expect(pristine.map((s) => s.id)).toEqual([
        'carlsbad-rookery-chamber',
        'lechuguilla-chandelier-room',
        'blanchard-springs-coral-grotto',
      ]);

      const vulnerable = getCaveMineralogySites(undefined, 'vulnerable_low_drip');
      expect(vulnerable).toHaveLength(2);
      expect(vulnerable.map((s) => s.id)).toEqual([
        'organ-cave-anthodite-gallery',
        'mammoth-frozen-niagara',
      ]);
    });

    it('finds a site by id with full karst specifications', () => {
      const carlsbad = getCaveMineralogySiteById('carlsbad-rookery-chamber');
      expect(carlsbad).toBeDefined();
      expect(carlsbad?.title).toBe('Carlsbad Caverns Rookery Nest');
      expect(carlsbad?.region).toBe('Guadalupe Mountains, New Mexico');
      expect(carlsbad?.system).toBe('Capitan Reef Karst');
      expect(carlsbad?.maxDepthMeters).toBe(250);
      expect(carlsbad?.ambientTempC).toBe(13.5);
      expect(carlsbad?.humidityPercent).toBe(98);
      expect(carlsbad?.speleothemType).toBe('cave_pearl_pisolith');
      expect(carlsbad?.hostRock).toBe('permian_evaporite_gypsum');
      expect(carlsbad?.conservationStatus).toBe('pristine_active_growth');
      expect(carlsbad?.description).toContain('Shallow agitated splash pools');
      expect(carlsbad?.highlights).toContain('Polished spherical pisolith clusters');

      const missing = getCaveMineralogySiteById('non-existent-site');
      expect(missing).toBeUndefined();
    });
  });

  describe('Speleothem Survey Mandatory Gear Checklist', () => {
    it('returns all 6 mandatory speleothem survey gear items', () => {
      const checklist = getSpeleothemGearChecklist();
      expect(checklist).toHaveLength(6);
      expect(checklist.every((item) => item.mandatory)).toBe(true);

      const ids = checklist.map((i) => i.id);
      expect(ids).toContain('uv-365nm-forensic-lamp');
      expect(ids).toContain('digital-micro-caliper-laser');
      expect(ids).toContain('waterproof-hydro-ph-ec-meter');
      expect(ids).toContain('lint-free-nitrile-caver-gloves');
      expect(ids).toContain('subterranean-acoustic-drip-counter');
      expect(ids).toContain('sealed-pelican-specimen-case');

      const uvLamp = checklist.find((i) => i.id === 'uv-365nm-forensic-lamp');
      expect(uvLamp?.category).toBe('optical');
      expect(uvLamp?.name).toBe('High-Intensity 365nm Filtered UV Speleothem Luminescence Lamp');

      const gloves = checklist.find((i) => i.id === 'lint-free-nitrile-caver-gloves');
      expect(gloves?.category).toBe('conservation');
      expect(gloves?.name).toContain('Nitrile Survey Gloves');
    });
  });

  describe('Hydrochemical & Mineral Accretion Calculator', () => {
    it('calculates Calcite Saturation Index (SI), pool agitation, and accretion rate correctly for nominal conditions', () => {
      const query: MineralAccretionQuery = {
        siteId: 'carlsbad-rookery-chamber',
        speleothemType: 'cave_pearl_pisolith',
        dripRateDpm: 24,
        waterPh: 7.8,
        calciumCarbonatePpm: 220,
        surveyHours: 4,
      };

      const result = calculateMineralAccretion(query);

      expect(result.siteTitle).toBe('Carlsbad Caverns Rookery Nest');
      // SI = ((7.8 - 7.0)*0.6 + (220 - 200)/400) = 0.48 + 0.05 = 0.53
      expect(result.calciteSaturationIndex).toBe(0.53);
      // Pool agitation = 24 * 0.045 = 1.08 J/hr
      expect(result.poolAgitationJoulesPerHour).toBe(1.08);
      // dripRate 24 is < 40 but >= 15, and SI 0.53 > 0.1 -> 'stable_laminar_accretion'
      expect(result.rotationState).toBe('stable_laminar_accretion');
      // Accretion = Math.max(1, Math.round(0.53 * 25.0 * (24 / 20.0))) = Math.round(15.9) = 16
      expect(result.estimatedAccretionMicronsPerYear).toBe(16);
      expect(result.triageStatus).toBe('nominal_active_mineralization');
      expect(result.conservationAdvisory).toBeTruthy();
      expect(result.monitoringProtocol).toBeTruthy();
    });

    it('identifies active_polishing_rotation when drip rate is high (>= 40) and SI > 0.4', () => {
      const query: MineralAccretionQuery = {
        siteId: 'carlsbad-rookery-chamber',
        speleothemType: 'cave_pearl_pisolith',
        dripRateDpm: 60,
        waterPh: 7.8,
        calciumCarbonatePpm: 220,
        surveyHours: 4,
      };

      const result = calculateMineralAccretion(query);
      expect(result.rotationState).toBe('active_polishing_rotation');
      expect(result.poolAgitationJoulesPerHour).toBe(2.7);
      expect(result.triageStatus).toBe('nominal_active_mineralization');
    });

    it('identifies cementation_stagnation_risk when drip rate is low (< 15)', () => {
      const query: MineralAccretionQuery = {
        siteId: 'carlsbad-rookery-chamber',
        speleothemType: 'cave_pearl_pisolith',
        dripRateDpm: 10,
        waterPh: 7.8,
        calciumCarbonatePpm: 220,
        surveyHours: 4,
      };

      const result = calculateMineralAccretion(query);
      expect(result.rotationState).toBe('cementation_stagnation_risk');
    });

    it('triggers critical_desiccation_halt_traffic triage when drip rate < 5 DPM or SI < 0.0', () => {
      const lowDripQuery: MineralAccretionQuery = {
        siteId: 'carlsbad-rookery-chamber',
        speleothemType: 'cave_pearl_pisolith',
        dripRateDpm: 2,
        waterPh: 7.8,
        calciumCarbonatePpm: 220,
        surveyHours: 4,
      };

      const resultLowDrip = calculateMineralAccretion(lowDripQuery);
      expect(resultLowDrip.triageStatus).toBe('critical_desiccation_halt_traffic');
      expect(resultLowDrip.rotationState).toBe('cementation_stagnation_risk');

      const negativeSiQuery: MineralAccretionQuery = {
        siteId: 'organ-cave-anthodite-gallery',
        speleothemType: 'aragonite_anthodite',
        dripRateDpm: 20,
        waterPh: 6.5,
        calciumCarbonatePpm: 50,
        surveyHours: 4,
      };

      const resultNegativeSi = calculateMineralAccretion(negativeSiQuery);
      expect(resultNegativeSi.calciteSaturationIndex).toBeLessThan(0);
      expect(resultNegativeSi.triageStatus).toBe('critical_desiccation_halt_traffic');
    });

    it('triggers caution_low_saturation triage when SI is between 0.0 and 0.2 and drip rate >= 5', () => {
      const query: MineralAccretionQuery = {
        siteId: 'mammoth-frozen-niagara',
        speleothemType: 'rimstone_gour_dam',
        dripRateDpm: 18,
        waterPh: 7.1,
        calciumCarbonatePpm: 180,
        surveyHours: 4,
      };

      const result = calculateMineralAccretion(query);
      // SI = ((7.1 - 7.0)*0.6 + (180 - 200)/400) = 0.06 - 0.05 = 0.01
      expect(result.calciteSaturationIndex).toBe(0.01);
      expect(result.triageStatus).toBe('caution_low_saturation');
    });
  });
});
