import { describe, it, expect } from 'vitest';
import {
  SCREE_RUNNING_SITES,
  SCREE_RUNNING_GEAR_CHECKLIST,
  getScreeRunningSites,
  getScreeRunningSiteById,
  getScreeRunningGearChecklist,
  calculateScreeRunningDynamics,
} from './scree-running';

describe('scree-running domain library', () => {
  describe('SCREE_RUNNING_SITES', () => {
    it('contains all 5 high-altitude alpine scree running sites', () => {
      expect(SCREE_RUNNING_SITES).toHaveLength(5);
      const ids = SCREE_RUNNING_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'mount-sneffels-south-slopes',
        'mount-stephen-fossil-talus',
        'great-gable-wastwater-screes',
        'mount-teide-volcanic-cinder-scree',
        'mount-nelson-scree-corridor',
      ]);
    });

    it('ensures every site has complete geographic and geomorphological metadata', () => {
      for (const site of SCREE_RUNNING_SITES) {
        expect(site.id).toBeTruthy();
        expect(site.title).toBeTruthy();
        expect(site.region).toBeTruthy();
        expect(site.range).toBeTruthy();
        expect(site.elevationMeters).toBeGreaterThan(800);
        expect(site.dominantGrading).toBeTruthy();
        expect(site.defaultGait).toBeTruthy();
        expect(site.rockfallExposure).toBeTruthy();
        expect(site.description.length).toBeGreaterThan(20);
        expect(site.highlights.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('SCREE_RUNNING_GEAR_CHECKLIST', () => {
    it('contains all 6 mandatory scree running gear items', () => {
      expect(SCREE_RUNNING_GEAR_CHECKLIST).toHaveLength(6);
      const expectedIds = [
        'scree-running-high-cuff-dust-gaiters',
        'reinforced-toe-talus-running-shoes',
        'ultra-light-climbing-helmet-en12492',
        'carbon-z-pole-folding-trekking-poles',
        'leather-palm-abrasion-scramble-gloves',
        'high-wrap-ballistic-sunglasses',
      ];
      expect(SCREE_RUNNING_GEAR_CHECKLIST.map((g) => g.id)).toEqual(expectedIds);
      expect(SCREE_RUNNING_GEAR_CHECKLIST.every((g) => g.mandatory)).toBe(true);
    });

    it('covers all 6 required gear categories', () => {
      const categories = SCREE_RUNNING_GEAR_CHECKLIST.map((g) => g.category);
      expect(categories).toEqual([
        'gaiters',
        'footwear',
        'helmet',
        'poles',
        'gloves',
        'eyewear',
      ]);
    });
  });

  describe('query helpers', () => {
    it('filters sites by scree grading class', () => {
      const allSites = getScreeRunningSites();
      expect(allSites).toHaveLength(5);

      const fineShaleSites = getScreeRunningSites('fine_shale_pea_scree');
      expect(fineShaleSites).toHaveLength(1);
      expect(fineShaleSites[0].id).toBe('mount-teide-volcanic-cinder-scree');

      const coarseTalusSites = getScreeRunningSites('coarse_angular_talus_rubble');
      expect(coarseTalusSites).toHaveLength(1);
      expect(coarseTalusSites[0].id).toBe('mount-sneffels-south-slopes');
    });

    it('retrieves a site by id or returns undefined when not found', () => {
      const site = getScreeRunningSiteById('mount-stephen-fossil-talus');
      expect(site).toBeDefined();
      expect(site?.range).toContain('Canadian Rockies');

      const missing = getScreeRunningSiteById('unknown-scree-slope');
      expect(missing).toBeUndefined();
    });

    it('returns the mandatory gear checklist', () => {
      const checklist = getScreeRunningGearChecklist();
      expect(checklist).toHaveLength(6);
    });
  });

  describe('calculateScreeRunningDynamics', () => {
    const baseQuery = {
      siteId: 'mount-teide-volcanic-cinder-scree',
      slopeAngleDegrees: 32,
      descentVerticalMeters: 600,
      runnerWeightKg: 72,
      screeDepthCm: 18,
    };

    it('calculates dynamics within valid biomechanical and kinematic bounds', () => {
      const result = calculateScreeRunningDynamics(baseQuery);

      expect(result.siteTitle).toContain('Mount Teide');
      expect(result.descentVelocityKmh).toBeGreaterThanOrEqual(5.0);
      expect(result.descentVelocityKmh).toBeLessThanOrEqual(35.0);
      expect(result.ankleImpactForceKn).toBeGreaterThanOrEqual(0.6);
      expect(result.ankleImpactForceKn).toBeLessThanOrEqual(3.5);
      expect(result.slideArrestDistanceMeters).toBeGreaterThanOrEqual(1.0);
      expect(result.slideArrestDistanceMeters).toBeLessThanOrEqual(9.0);
      expect(result.screeRunDurationMinutes).toBeGreaterThan(0);
      expect(result.safetyStatus).toBeTruthy();
      expect(result.brakingTechniqueAdvisory.length).toBeGreaterThan(15);
      expect(result.gaiterAndProtectionProtocol.length).toBeGreaterThan(15);
    });

    it('calculates faster descent velocity on fine pea scree with deeper cushioning vs coarse angular talus', () => {
      const fineGlide = calculateScreeRunningDynamics({
        ...baseQuery,
        screeGrading: 'fine_shale_pea_scree',
        slopeAngleDegrees: 35,
        screeDepthCm: 22,
      });

      const coarseTalus = calculateScreeRunningDynamics({
        ...baseQuery,
        screeGrading: 'coarse_angular_talus_rubble',
        slopeAngleDegrees: 24,
        screeDepthCm: 6,
      });

      expect(fineGlide.descentVelocityKmh).toBeGreaterThan(coarseTalus.descentVelocityKmh);
    });

    it('calculates higher ankle impact force for heavier runners on shallow hardpan vs lighter runners on deep pea scree', () => {
      const cushionedLight = calculateScreeRunningDynamics({
        ...baseQuery,
        screeGrading: 'fine_shale_pea_scree',
        descentGait: 'heel_plunge_sliding_glide',
        runnerWeightKg: 58,
        screeDepthCm: 26,
      });

      const hardpanHeavy = calculateScreeRunningDynamics({
        ...baseQuery,
        screeGrading: 'hardpan_embedded_scree_sheet',
        descentGait: 'rapid_cadence_hop_braking',
        runnerWeightKg: 98,
        screeDepthCm: 4,
      });

      expect(hardpanHeavy.ankleImpactForceKn).toBeGreaterThan(cushionedLight.ankleImpactForceKn);
    });

    it('determines safetyStatus across optimal gliding, elevated ankle hazard, and severe rockfall warning', () => {
      const optimal = calculateScreeRunningDynamics({
        siteId: 'mount-teide-volcanic-cinder-scree',
        screeGrading: 'fine_shale_pea_scree',
        descentGait: 'heel_plunge_sliding_glide',
        slopeAngleDegrees: 28,
        descentVerticalMeters: 450,
        runnerWeightKg: 68,
        screeDepthCm: 22,
      });
      expect(optimal.safetyStatus).toBe('optimal_gliding_conditions');

      const ankleHazard = calculateScreeRunningDynamics({
        siteId: 'great-gable-wastwater-screes',
        screeGrading: 'hardpan_embedded_scree_sheet',
        descentGait: 'rapid_cadence_hop_braking',
        slopeAngleDegrees: 34,
        descentVerticalMeters: 500,
        runnerWeightKg: 96,
        screeDepthCm: 3,
      });
      expect(ankleHazard.safetyStatus).toBe('elevated_ankle_hazard');

      const rockfallWarning = calculateScreeRunningDynamics({
        siteId: 'mount-sneffels-south-slopes',
        screeGrading: 'coarse_angular_talus_rubble',
        descentGait: 'sideways_edging_skate',
        slopeAngleDegrees: 41,
        descentVerticalMeters: 800,
        runnerWeightKg: 82,
        screeDepthCm: 10,
      });
      expect(rockfallWarning.safetyStatus).toBe('severe_rockfall_warning');
    });

    it('clamps extreme out-of-range inputs safely within operational limits', () => {
      const clamped = calculateScreeRunningDynamics({
        siteId: 'mount-sneffels-south-slopes',
        slopeAngleDegrees: 80,
        descentVerticalMeters: 5000,
        runnerWeightKg: 200,
        screeDepthCm: 120,
      });

      expect(clamped.descentVelocityKmh).toBeLessThanOrEqual(35.0);
      expect(clamped.descentVelocityKmh).toBeGreaterThanOrEqual(5.0);
      expect(clamped.ankleImpactForceKn).toBeLessThanOrEqual(3.5);
      expect(clamped.ankleImpactForceKn).toBeGreaterThanOrEqual(0.6);
      expect(clamped.slideArrestDistanceMeters).toBeLessThanOrEqual(9.0);
      expect(clamped.slideArrestDistanceMeters).toBeGreaterThanOrEqual(1.0);
    });

    it('falls back to first site if unknown siteId is passed', () => {
      const fallback = calculateScreeRunningDynamics({
        ...baseQuery,
        siteId: 'non-existent-scree-chute',
      });
      expect(fallback.siteTitle).toBe(SCREE_RUNNING_SITES[0].title);
    });
  });
});
