import { describe, it, expect } from 'vitest';
import {
  KELP_FREEDIVING_SITES,
  KELP_FREEDIVING_GEAR_CHECKLIST,
  getKelpFreedivingSites,
  getKelpFreedivingSiteById,
  getKelpFreedivingGearChecklist,
  calculateKelpFreedivingDynamics,
} from './kelp-freediving';

describe('kelp-freediving domain library', () => {
  describe('KELP_FREEDIVING_SITES', () => {
    it('contains all 5 coastal intertidal kelp forest freediving sites', () => {
      expect(KELP_FREEDIVING_SITES).toHaveLength(5);
      const ids = KELP_FREEDIVING_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'point-lobos-carmel-pinnacles',
        'channel-islands-anacapa-cathedral-cove',
        'false-bay-millers-point-great-african-seaforest',
        'barkley-sound-broken-group-bull-kelp',
        'fortescue-bay-tasman-peninsula-giant-kelp',
      ]);
    });

    it('ensures every site has complete ecological and bathymetric metadata', () => {
      for (const site of KELP_FREEDIVING_SITES) {
        expect(site.id).toBeTruthy();
        expect(site.title).toBeTruthy();
        expect(site.region).toBeTruthy();
        expect(site.range).toBeTruthy();
        expect(site.maxDepthMeters).toBeGreaterThanOrEqual(8);
        expect(site.dominantStratum).toBeTruthy();
        expect(site.primaryTaxa).toBeTruthy();
        expect(site.trophicState).toBeTruthy();
        expect(site.description.length).toBeGreaterThan(20);
        expect(site.highlights.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('KELP_FREEDIVING_GEAR_CHECKLIST', () => {
    it('contains all 6 mandatory kelp forest freediving gear items', () => {
      expect(KELP_FREEDIVING_GEAR_CHECKLIST).toHaveLength(6);
      const expectedIds = [
        'open-cell-7mm-camo-freedive-wetsuit',
        'quick-release-silicone-rubber-weight-belt',
        'blunt-tip-titanium-kelp-line-cutter',
        'low-volume-frameless-freedive-mask-j-snorkel',
        'carbon-fiber-long-blade-bi-fins',
        'submersible-slate-benthic-quadrat-frame',
      ];
      expect(KELP_FREEDIVING_GEAR_CHECKLIST.map((g) => g.id)).toEqual(
        expectedIds
      );
      expect(KELP_FREEDIVING_GEAR_CHECKLIST.every((g) => g.mandatory)).toBe(
        true
      );
    });

    it('covers all 6 required kelp freediving gear categories', () => {
      const categories = KELP_FREEDIVING_GEAR_CHECKLIST.map((g) => g.category);
      expect(categories).toEqual([
        'wetsuit',
        'ballast',
        'cutting_tool',
        'mask_snorkel',
        'fins',
        'survey',
      ]);
    });
  });

  describe('query helpers', () => {
    it('filters sites by kelp forest stratum', () => {
      const allSites = getKelpFreedivingSites();
      expect(allSites).toHaveLength(5);

      const canopySites = getKelpFreedivingSites(
        'floating_pneumatocyst_canopy'
      );
      expect(canopySites).toHaveLength(1);
      expect(canopySites[0].id).toBe('point-lobos-carmel-pinnacles');

      const holdfastSites = getKelpFreedivingSites(
        'benthic_haptera_holdfast_reef'
      );
      expect(holdfastSites).toHaveLength(1);
      expect(holdfastSites[0].id).toBe(
        'channel-islands-anacapa-cathedral-cove'
      );
    });

    it('retrieves a site by id or returns undefined when not found', () => {
      const site = getKelpFreedivingSiteById(
        'false-bay-millers-point-great-african-seaforest'
      );
      expect(site).toBeDefined();
      expect(site?.region).toContain('South Africa');

      const missing = getKelpFreedivingSiteById('unknown-kelp-forest');
      expect(missing).toBeUndefined();
    });

    it('returns the mandatory gear checklist', () => {
      const checklist = getKelpFreedivingGearChecklist();
      expect(checklist).toHaveLength(6);
    });
  });

  describe('calculateKelpFreedivingDynamics', () => {
    const baseQuery = {
      siteId: 'point-lobos-carmel-pinnacles',
      targetDepthMeters: 12,
      waterTempCelsius: 11,
      surgeVelocityMs: 0.35,
      visibilityMeters: 14,
      wetsuitThicknessMm: 7,
    };

    it('calculates dynamics within valid freediving and ecological bounds', () => {
      const result = calculateKelpFreedivingDynamics(baseQuery);

      expect(result.siteTitle).toContain('Point Lobos');
      expect(result.neutralBuoyancyDepthMeters).toBeGreaterThanOrEqual(3.0);
      expect(result.neutralBuoyancyDepthMeters).toBeLessThanOrEqual(15.0);
      expect(result.recommendedLeadWeightKg).toBeGreaterThanOrEqual(2.0);
      expect(result.recommendedLeadWeightKg).toBeLessThanOrEqual(12.0);
      expect(result.safeBottomTimeSeconds).toBeGreaterThanOrEqual(20);
      expect(result.safeBottomTimeSeconds).toBeLessThanOrEqual(120);
      expect(result.stipeEntanglementRiskPercent).toBeGreaterThanOrEqual(0.0);
      expect(result.stipeEntanglementRiskPercent).toBeLessThanOrEqual(100.0);
      expect(result.holdfastBiodiversityIndex).toBeGreaterThanOrEqual(0.0);
      expect(result.holdfastBiodiversityIndex).toBeLessThanOrEqual(1.0);
      expect(result.safetyStatus).toBeTruthy();
      expect(result.canopyEntryProtocol.length).toBeGreaterThan(15);
      expect(result.holdfastSurveyAdvisory.length).toBeGreaterThan(15);
    });

    it('recommends more lead weight for thicker wetsuits and shallower target depths', () => {
      const thickSuitShallow = calculateKelpFreedivingDynamics({
        ...baseQuery,
        wetsuitThicknessMm: 9,
        targetDepthMeters: 6,
      });

      const thinSuitDeep = calculateKelpFreedivingDynamics({
        ...baseQuery,
        wetsuitThicknessMm: 3,
        targetDepthMeters: 18,
      });

      expect(thickSuitShallow.recommendedLeadWeightKg).toBeGreaterThan(
        thinSuitDeep.recommendedLeadWeightKg
      );
      expect(thinSuitDeep.neutralBuoyancyDepthMeters).toBeGreaterThan(
        thickSuitShallow.neutralBuoyancyDepthMeters
      );
    });

    it('increases stipe entanglement risk and decreases safe bottom time in high surge and low visibility', () => {
      const calmClear = calculateKelpFreedivingDynamics({
        ...baseQuery,
        surgeVelocityMs: 0.2,
        visibilityMeters: 18,
        waterTempCelsius: 15,
      });

      const heavySurgeMurky = calculateKelpFreedivingDynamics({
        ...baseQuery,
        surgeVelocityMs: 1.6,
        visibilityMeters: 3,
        waterTempCelsius: 8,
      });

      expect(heavySurgeMurky.stipeEntanglementRiskPercent).toBeGreaterThan(
        calmClear.stipeEntanglementRiskPercent
      );
      expect(heavySurgeMurky.safeBottomTimeSeconds).toBeLessThan(
        calmClear.safeBottomTimeSeconds
      );
    });

    it('determines safetyStatus across optimal, caution, and abort states', () => {
      const optimal = calculateKelpFreedivingDynamics({
        siteId: 'point-lobos-carmel-pinnacles',
        kelpStratum: 'floating_pneumatocyst_canopy',
        dominantTaxa: 'macrocystis_pyrifera_giant_kelp',
        targetDepthMeters: 10,
        waterTempCelsius: 13,
        surgeVelocityMs: 0.3,
        visibilityMeters: 16,
        wetsuitThicknessMm: 7,
      });
      expect(optimal.safetyStatus).toBe('optimal_calm_canopy_window');

      const caution = calculateKelpFreedivingDynamics({
        siteId: 'false-bay-millers-point-great-african-seaforest',
        kelpStratum: 'midwater_stipe_columns',
        dominantTaxa: 'ecklonia_radiata_golden_kelp',
        targetDepthMeters: 14,
        waterTempCelsius: 12,
        surgeVelocityMs: 0.9,
        visibilityMeters: 8,
        wetsuitThicknessMm: 7,
      });
      expect(caution.safetyStatus).toBe('caution_stipe_entanglement_swell');

      const abort = calculateKelpFreedivingDynamics({
        siteId: 'barkley-sound-broken-group-bull-kelp',
        kelpStratum: 'intertidal_surge_channel_ecotone',
        dominantTaxa: 'nereocystis_luetkeana_bull_kelp',
        targetDepthMeters: 18,
        waterTempCelsius: 9,
        surgeVelocityMs: 1.7,
        visibilityMeters: 3,
        wetsuitThicknessMm: 7,
      });
      expect(abort.safetyStatus).toBe('abort_heavy_surge_low_visibility');
    });

    it('clamps extreme out-of-range inputs safely within operational limits', () => {
      const clamped = calculateKelpFreedivingDynamics({
        siteId: 'point-lobos-carmel-pinnacles',
        targetDepthMeters: 100,
        waterTempCelsius: -5,
        surgeVelocityMs: 10,
        visibilityMeters: -10,
        wetsuitThicknessMm: 25,
      });

      expect(clamped.neutralBuoyancyDepthMeters).toBeGreaterThanOrEqual(3.0);
      expect(clamped.neutralBuoyancyDepthMeters).toBeLessThanOrEqual(15.0);
      expect(clamped.recommendedLeadWeightKg).toBeGreaterThanOrEqual(2.0);
      expect(clamped.recommendedLeadWeightKg).toBeLessThanOrEqual(12.0);
      expect(clamped.safeBottomTimeSeconds).toBeGreaterThanOrEqual(20);
      expect(clamped.safeBottomTimeSeconds).toBeLessThanOrEqual(120);
      expect(clamped.stipeEntanglementRiskPercent).toBeGreaterThanOrEqual(0.0);
      expect(clamped.stipeEntanglementRiskPercent).toBeLessThanOrEqual(100.0);
      expect(clamped.holdfastBiodiversityIndex).toBeGreaterThanOrEqual(0.0);
      expect(clamped.holdfastBiodiversityIndex).toBeLessThanOrEqual(1.0);
    });

    it('falls back to first site if unknown siteId is passed', () => {
      const fallback = calculateKelpFreedivingDynamics({
        ...baseQuery,
        siteId: 'non-existent-kelp-forest',
      });
      expect(fallback.siteTitle).toBe(KELP_FREEDIVING_SITES[0].title);
    });
  });
});
