import { describe, it, expect } from 'vitest';
import {
  getTundraLichenSites,
  getTundraLichenSiteById,
  getLichenGearChecklist,
  calculateLichenDynamics,
} from './tundra-lichen';

describe('tundra-lichen lib', () => {
  describe('getTundraLichenSites', () => {
    it('returns all 5 iconic study sites when no morphology is specified', () => {
      const sites = getTundraLichenSites();
      expect(sites).toHaveLength(5);
      expect(sites.map((s) => s.id)).toEqual([
        'denali-polychrome-pass',
        'torngat-mountains-fjords',
        'wrangell-st-elias-root-glacier',
        'beartooth-plateau-alpine-tundra',
        'brooks-range-anaktuvuk-pass',
      ]);
    });

    it('filters sites by morphology correctly', () => {
      const crustose = getTundraLichenSites('crustose_saxicolous');
      expect(crustose).toHaveLength(1);
      expect(crustose[0].id).toBe('denali-polychrome-pass');

      const fruticose = getTundraLichenSites('fruticose_macrolichen');
      expect(fruticose).toHaveLength(2);
      expect(fruticose.map((s) => s.id)).toEqual([
        'torngat-mountains-fjords',
        'brooks-range-anaktuvuk-pass',
      ]);

      const foliose = getTundraLichenSites('foliose_macrolichen');
      expect(foliose).toHaveLength(1);
      expect(foliose[0].id).toBe('wrangell-st-elias-root-glacier');

      const squamulose = getTundraLichenSites('squamulose_soil_crust');
      expect(squamulose).toHaveLength(1);
      expect(squamulose[0].id).toBe('beartooth-plateau-alpine-tundra');
    });
  });

  describe('getTundraLichenSiteById', () => {
    it('returns the site corresponding to the given id', () => {
      const site = getTundraLichenSiteById('denali-polychrome-pass');
      expect(site).toBeDefined();
      expect(site?.title).toBe(
        'Polychrome Pass Permafrost Tundra & Saxicolous Fellfield'
      );
      expect(site?.elevationMeters).toBe(1100);
      expect(site?.dominantMorphology).toBe('crustose_saxicolous');
      expect(site?.substrateType).toBe('volcanic_basalt_outcrop');
      expect(site?.permafrostStatus).toBe('continuous_permafrost');
    });

    it('returns undefined for nonexistent id', () => {
      expect(getTundraLichenSiteById('unknown-site')).toBeUndefined();
    });
  });

  describe('getLichenGearChecklist', () => {
    it('returns exactly 6 mandatory gear items with proper categories', () => {
      const gear = getLichenGearChecklist();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((item) => item.id);
      expect(ids).toContain('achromatic-field-loupe-20x');
      expect(ids).toContain('chemical-spot-test-reagent-kit');
      expect(ids).toContain('subarctic-specimen-chisels');
      expect(ids).toContain('digital-lichenometry-caliper');
      expect(ids).toContain('breathable-specimen-herbarium-packets');
      expect(ids).toContain('field-uv-fluorescence-torch');
    });
  });

  describe('calculateLichenDynamics', () => {
    it('computes correct baseline metrics with default inputs', () => {
      const result = calculateLichenDynamics({
        siteId: 'denali-polychrome-pass',
        morphology: 'crustose_saxicolous',
        substrate: 'volcanic_basalt_outcrop',
        colonyDiameterMm: 65,
        annualGrowthRateMmYr: 0.5,
        uvExposureIndex: 6,
        snowCoverDurationMonths: 7,
        airDeposition: 'pristine_baseline',
      });

      expect(result.siteTitle).toBe(
        'Polychrome Pass Permafrost Tundra & Saxicolous Fellfield'
      );
      expect(result.estimatedColonyAgeYears).toBe(130);
      expect(result.bioindicatorHealthIndex).toBe(0.96);
      expect(result.desiccationResilienceScore).toBe(85);
      expect(result.conservationStatus).toBe('optimal_pristine_climax');
      expect(result.lichenometryAdvisory).toContain('130 years');
      expect(result.lichenometryAdvisory).toContain('volcanic basalt outcrop');
      expect(result.chemicalSpotTestProtocol).toContain('norstictic acid');
    });

    it('triggers critical disturbance status on elevated anthropogenic air deposition', () => {
      const result = calculateLichenDynamics({
        siteId: 'denali-polychrome-pass',
        morphology: 'crustose_saxicolous',
        substrate: 'volcanic_basalt_outcrop',
        colonyDiameterMm: 65,
        annualGrowthRateMmYr: 0.5,
        uvExposureIndex: 6,
        snowCoverDurationMonths: 7,
        airDeposition: 'elevated_anthropogenic',
      });

      expect(result.conservationStatus).toBe('critical_cryoturbation_disturbance');
      expect(result.bioindicatorHealthIndex).toBeLessThan(0.5);
    });

    it('triggers vulnerable microclimate shift when UV index >= 8', () => {
      const result = calculateLichenDynamics({
        siteId: 'beartooth-plateau-alpine-tundra',
        morphology: 'squamulose_soil_crust',
        substrate: 'calcareous_limestone_shale',
        colonyDiameterMm: 50,
        annualGrowthRateMmYr: 0.5,
        uvExposureIndex: 9,
        snowCoverDurationMonths: 7,
        airDeposition: 'pristine_baseline',
      });

      expect(result.conservationStatus).toBe('vulnerable_microclimate_shift');
    });

    it('adjusts lichenometry advisory for ancient exposure (>300 years)', () => {
      const result = calculateLichenDynamics({
        siteId: 'torngat-mountains-fjords',
        morphology: 'fruticose_macrolichen',
        substrate: 'granitic_gneiss_boulder',
        colonyDiameterMm: 200,
        annualGrowthRateMmYr: 0.25,
        uvExposureIndex: 5,
        snowCoverDurationMonths: 7,
        airDeposition: 'pristine_baseline',
      });

      expect(result.estimatedColonyAgeYears).toBe(800);
      expect(result.lichenometryAdvisory).toContain('ancient surface exposure age');
      expect(result.chemicalSpotTestProtocol).toContain('thamnolic acid');
    });

    it('adjusts lichenometry advisory for pioneering exposure (<=100 years)', () => {
      const result = calculateLichenDynamics({
        siteId: 'wrangell-st-elias-root-glacier',
        morphology: 'foliose_macrolichen',
        substrate: 'glacial_till_gravel',
        colonyDiameterMm: 25,
        annualGrowthRateMmYr: 0.5,
        uvExposureIndex: 5,
        snowCoverDurationMonths: 7,
        airDeposition: 'pristine_baseline',
      });

      expect(result.estimatedColonyAgeYears).toBe(50);
      expect(result.lichenometryAdvisory).toContain('pioneering surface exposure');
      expect(result.chemicalSpotTestProtocol).toContain('gyrophoric/lecanoric acid');
    });

    it('handles squamulose morphology chemical protocol', () => {
      const result = calculateLichenDynamics({
        siteId: 'beartooth-plateau-alpine-tundra',
        morphology: 'squamulose_soil_crust',
        substrate: 'calcareous_limestone_shale',
        colonyDiameterMm: 40,
        annualGrowthRateMmYr: 0.4,
        uvExposureIndex: 7,
        snowCoverDurationMonths: 6,
        airDeposition: 'moderate_drift',
      });

      expect(result.chemicalSpotTestProtocol).toContain('atranorin');
    });

    it('falls back to default site if siteId is invalid', () => {
      const result = calculateLichenDynamics({
        siteId: 'non-existent',
        morphology: 'crustose_saxicolous',
        substrate: 'volcanic_basalt_outcrop',
        colonyDiameterMm: 65,
        annualGrowthRateMmYr: 0.5,
        uvExposureIndex: 6,
        snowCoverDurationMonths: 7,
        airDeposition: 'pristine_baseline',
      });

      expect(result.siteTitle).toBe(
        'Polychrome Pass Permafrost Tundra & Saxicolous Fellfield'
      );
    });
  });
});
