import { describe, it, expect } from 'vitest';
import {
  LAVA_TUBE_BIOSPELEOLOGY_SITES,
  LAVA_TUBE_BIOSPELEOLOGY_GEAR_CHECKLIST,
  getLavaTubeBiospeleologySites,
  getLavaTubeBiospeleologySiteById,
  getLavaTubeBiospeleologyGearChecklist,
  calculateLavaTubeBiospeleologyDynamics,
} from './lava-tube-biospeleology';

describe('lava-tube-biospeleology domain library', () => {
  describe('LAVA_TUBE_BIOSPELEOLOGY_SITES', () => {
    it('contains all 5 subterranean lava tube biospeleology sites', () => {
      expect(LAVA_TUBE_BIOSPELEOLOGY_SITES).toHaveLength(5);
      const ids = LAVA_TUBE_BIOSPELEOLOGY_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'kazumura-cave-kilauea-root-galleries',
        'ape-cave-mount-st-helens-basalt',
        'undara-volcanic-lava-tubes',
        'manjanggul-jeju-volcanic-tube',
        'cueva-de-los-verdes-lanzarote',
      ]);
    });

    it('ensures every site has complete speleological and ecological metadata', () => {
      for (const site of LAVA_TUBE_BIOSPELEOLOGY_SITES) {
        expect(site.id).toBeTruthy();
        expect(site.title).toBeTruthy();
        expect(site.region).toBeTruthy();
        expect(site.range).toBeTruthy();
        expect(site.elevationMeters).toBeGreaterThanOrEqual(40);
        expect(site.dominantZone).toBeTruthy();
        expect(site.primarySubstrate).toBeTruthy();
        expect(site.dominantAdaptation).toBeTruthy();
        expect(site.description.length).toBeGreaterThan(20);
        expect(site.highlights.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('LAVA_TUBE_BIOSPELEOLOGY_GEAR_CHECKLIST', () => {
    it('contains all 6 mandatory lava tube biospeleology gear items', () => {
      expect(LAVA_TUBE_BIOSPELEOLOGY_GEAR_CHECKLIST).toHaveLength(6);
      const expectedIds = [
        'en12492-low-profile-basalt-caving-helmet',
        'red-spectrum-low-lux-biosurvey-headlamp',
        'neoprene-kevlar-aa-basalt-knee-elbow-pads',
        'quaternary-ammonium-boot-decon-kit',
        'macro-15x-illuminated-entomological-loupe',
        'nondestructive-aspirator-pooter-vial-set',
      ];
      expect(LAVA_TUBE_BIOSPELEOLOGY_GEAR_CHECKLIST.map((g) => g.id)).toEqual(
        expectedIds
      );
      expect(
        LAVA_TUBE_BIOSPELEOLOGY_GEAR_CHECKLIST.every((g) => g.mandatory)
      ).toBe(true);
    });

    it('covers all 6 required biospeleology gear categories', () => {
      const categories = LAVA_TUBE_BIOSPELEOLOGY_GEAR_CHECKLIST.map(
        (g) => g.category
      );
      expect(categories).toEqual([
        'helmet',
        'lighting',
        'armor',
        'decontamination',
        'optics',
        'sampling',
      ]);
    });
  });

  describe('query helpers', () => {
    it('filters sites by lava tube ecological zone', () => {
      const allSites = getLavaTubeBiospeleologySites();
      expect(allSites).toHaveLength(5);

      const rootCurtainSites = getLavaTubeBiospeleologySites(
        'subterranean_root_curtain_gallery'
      );
      expect(rootCurtainSites).toHaveLength(1);
      expect(rootCurtainSites[0].id).toBe(
        'kazumura-cave-kilauea-root-galleries'
      );

      const deepDarkSites = getLavaTubeBiospeleologySites(
        'deep_dark_stagnant_saturation'
      );
      expect(deepDarkSites).toHaveLength(1);
      expect(deepDarkSites[0].id).toBe('cueva-de-los-verdes-lanzarote');
    });

    it('retrieves a site by id or returns undefined when not found', () => {
      const site = getLavaTubeBiospeleologySiteById(
        'ape-cave-mount-st-helens-basalt'
      );
      expect(site).toBeDefined();
      expect(site?.region).toContain('Washington');

      const missing = getLavaTubeBiospeleologySiteById('unknown-lava-tube');
      expect(missing).toBeUndefined();
    });

    it('returns the mandatory gear checklist', () => {
      const checklist = getLavaTubeBiospeleologyGearChecklist();
      expect(checklist).toHaveLength(6);
    });
  });

  describe('calculateLavaTubeBiospeleologyDynamics', () => {
    const baseQuery = {
      siteId: 'kazumura-cave-kilauea-root-galleries',
      relativeHumidityPercent: 98,
      distanceFromSkylightMeters: 380,
      ceilingRootDensityPerM2: 42,
      ambientCo2Ppm: 650,
    };

    it('calculates dynamics within valid biospeleological and microclimatic bounds', () => {
      const result = calculateLavaTubeBiospeleologyDynamics(baseQuery);

      expect(result.siteTitle).toContain('Kazumura Cave');
      expect(result.troglobiteEndemismIndex).toBeGreaterThanOrEqual(0.0);
      expect(result.troglobiteEndemismIndex).toBeLessThanOrEqual(1.0);
      expect(result.rootExudateTrophicCapacityMgCM2Day).toBeGreaterThanOrEqual(
        5.0
      );
      expect(result.rootExudateTrophicCapacityMgCM2Day).toBeLessThanOrEqual(
        450.0
      );
      expect(result.vaporPressureDeficitStressKpa).toBeGreaterThanOrEqual(0.0);
      expect(result.vaporPressureDeficitStressKpa).toBeLessThanOrEqual(1.5);
      expect(result.microbialMatIntegrityPercent).toBeGreaterThanOrEqual(0.0);
      expect(result.microbialMatIntegrityPercent).toBeLessThanOrEqual(100.0);
      expect(result.conservationStatus).toBeTruthy();
      expect(result.nonContactTraversalProtocol.length).toBeGreaterThan(15);
      expect(result.biocontaminationDeconAdvisory.length).toBeGreaterThan(15);
    });

    it('calculates higher troglobite endemism index and lower VPD stress in deep saturated zones vs skylight entrance ecotone', () => {
      const deepSaturated = calculateLavaTubeBiospeleologyDynamics({
        ...baseQuery,
        ecologicalZone: 'deep_dark_stagnant_saturation',
        relativeHumidityPercent: 99,
        distanceFromSkylightMeters: 520,
      });

      const skylightEntrance = calculateLavaTubeBiospeleologyDynamics({
        ...baseQuery,
        ecologicalZone: 'skylight_entrance_ecotone',
        relativeHumidityPercent: 72,
        distanceFromSkylightMeters: 15,
      });

      expect(deepSaturated.troglobiteEndemismIndex).toBeGreaterThan(
        skylightEntrance.troglobiteEndemismIndex
      );
      expect(deepSaturated.vaporPressureDeficitStressKpa).toBeLessThan(
        skylightEntrance.vaporPressureDeficitStressKpa
      );
    });

    it('calculates higher root exudate trophic capacity with dense ceiling roots in root curtain galleries', () => {
      const denseRoots = calculateLavaTubeBiospeleologyDynamics({
        ...baseQuery,
        ecologicalZone: 'subterranean_root_curtain_gallery',
        ceilingRootDensityPerM2: 65,
        relativeHumidityPercent: 98,
      });

      const sparseRoots = calculateLavaTubeBiospeleologyDynamics({
        ...baseQuery,
        ecologicalZone: 'twilight_moss_threshold',
        ceilingRootDensityPerM2: 4,
        relativeHumidityPercent: 80,
      });

      expect(denseRoots.rootExudateTrophicCapacityMgCM2Day).toBeGreaterThan(
        sparseRoots.rootExudateTrophicCapacityMgCM2Day
      );
    });

    it('determines conservationStatus across pristine endemic refugium, vulnerable microclimate desiccation, and critical anthropogenic biocontamination', () => {
      const pristine = calculateLavaTubeBiospeleologyDynamics({
        siteId: 'kazumura-cave-kilauea-root-galleries',
        ecologicalZone: 'subterranean_root_curtain_gallery',
        substrateFeature: 'lavacicle_ceiling_stalactites',
        relativeHumidityPercent: 99,
        distanceFromSkylightMeters: 450,
        ceilingRootDensityPerM2: 48,
        ambientCo2Ppm: 580,
      });
      expect(pristine.conservationStatus).toBe('pristine_endemic_refugium');

      const desiccation = calculateLavaTubeBiospeleologyDynamics({
        siteId: 'undara-volcanic-lava-tubes',
        ecologicalZone: 'transition_variable_microclimate',
        substrateFeature: 'aa_clinker_rubble_floor',
        relativeHumidityPercent: 74,
        distanceFromSkylightMeters: 90,
        ceilingRootDensityPerM2: 12,
        ambientCo2Ppm: 720,
      });
      expect(desiccation.conservationStatus).toBe(
        'vulnerable_microclimate_desiccation'
      );

      const biocontamination = calculateLavaTubeBiospeleologyDynamics({
        siteId: 'ape-cave-mount-st-helens-basalt',
        ecologicalZone: 'transition_variable_microclimate',
        substrateFeature: 'actinobacterial_golden_slime_wall',
        relativeHumidityPercent: 82,
        distanceFromSkylightMeters: 160,
        ceilingRootDensityPerM2: 8,
        ambientCo2Ppm: 2100,
      });
      expect(biocontamination.conservationStatus).toBe(
        'critical_anthropogenic_biocontamination'
      );
    });

    it('clamps extreme out-of-range inputs safely within operational limits', () => {
      const clamped = calculateLavaTubeBiospeleologyDynamics({
        siteId: 'kazumura-cave-kilauea-root-galleries',
        relativeHumidityPercent: 140,
        distanceFromSkylightMeters: 5000,
        ceilingRootDensityPerM2: 500,
        ambientCo2Ppm: 15000,
      });

      expect(clamped.troglobiteEndemismIndex).toBeLessThanOrEqual(1.0);
      expect(clamped.troglobiteEndemismIndex).toBeGreaterThanOrEqual(0.0);
      expect(clamped.rootExudateTrophicCapacityMgCM2Day).toBeLessThanOrEqual(
        450.0
      );
      expect(
        clamped.rootExudateTrophicCapacityMgCM2Day
      ).toBeGreaterThanOrEqual(5.0);
      expect(clamped.vaporPressureDeficitStressKpa).toBeLessThanOrEqual(1.5);
      expect(clamped.vaporPressureDeficitStressKpa).toBeGreaterThanOrEqual(0.0);
      expect(clamped.microbialMatIntegrityPercent).toBeLessThanOrEqual(100.0);
      expect(clamped.microbialMatIntegrityPercent).toBeGreaterThanOrEqual(0.0);
    });

    it('falls back to first site if unknown siteId is passed', () => {
      const fallback = calculateLavaTubeBiospeleologyDynamics({
        ...baseQuery,
        siteId: 'non-existent-lava-tube',
      });
      expect(fallback.siteTitle).toBe(LAVA_TUBE_BIOSPELEOLOGY_SITES[0].title);
    });
  });
});
