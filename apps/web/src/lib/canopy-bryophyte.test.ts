import { describe, it, expect } from 'vitest';
import {
  getCanopyBryophyteSites,
  getCanopyBryophyteSiteById,
  getCanopyBryophyteGearChecklist,
  calculateCanopyBryophyteDynamics,
} from './canopy-bryophyte';

describe('canopy-bryophyte library', () => {
  describe('getCanopyBryophyteSites', () => {
    it('returns all 5 rainforest canopy study sites when no stratum filter is provided', () => {
      const sites = getCanopyBryophyteSites();
      expect(sites).toHaveLength(5);
      expect(sites.map((s) => s.id)).toEqual([
        'hoh-river-hall-of-mosses',
        'tarkine-takayna-rainforest',
        'fiordland-milford-sound-canopy',
        'yakushima-ancient-cedar-moss',
        'great-bear-rainforest-fjords',
      ]);
    });

    it('filters sites by canopy stratum accurately', () => {
      const midCanopy = getCanopyBryophyteSites('mid_canopy_branch_mats');
      expect(midCanopy).toHaveLength(1);
      expect(midCanopy[0].id).toBe('hoh-river-hall-of-mosses');

      const treeFern = getCanopyBryophyteSites('tree_fern_caudex_skirt');
      expect(treeFern).toHaveLength(1);
      expect(treeFern[0].id).toBe('tarkine-takayna-rainforest');

      const subcanopy = getCanopyBryophyteSites('subcanopy_trunk_epiphytes');
      expect(subcanopy).toHaveLength(1);
      expect(subcanopy[0].id).toBe('fiordland-milford-sound-canopy');

      const groundFloor = getCanopyBryophyteSites('ground_floor_bryosphere');
      expect(groundFloor).toHaveLength(1);
      expect(groundFloor[0].id).toBe('yakushima-ancient-cedar-moss');

      const emergent = getCanopyBryophyteSites('emergent_outer_canopy');
      expect(emergent).toHaveLength(1);
      expect(emergent[0].id).toBe('great-bear-rainforest-fjords');
    });
  });

  describe('getCanopyBryophyteSiteById', () => {
    it('returns the site metadata matching the given id', () => {
      const site = getCanopyBryophyteSiteById('hoh-river-hall-of-mosses');
      expect(site).toBeDefined();
      expect(site?.title).toBe('Hoh River Hall of Mosses Temperate Rain Forest');
      expect(site?.region).toBe('Olympic National Park, Washington, USA');
      expect(site?.elevationMeters).toBe(180);
      expect(site?.dominantStratum).toBe('mid_canopy_branch_mats');
      expect(site?.primarySubstrate).toBe('bigleaf_maple_epiphyte_limb');
      expect(site?.microclimate).toBe('hyper_maritime_perhumid');
      expect(site?.highlights.length).toBeGreaterThanOrEqual(3);
    });

    it('returns undefined when querying an unlisted site id', () => {
      expect(getCanopyBryophyteSiteById('non-existent-canopy')).toBeUndefined();
    });
  });

  describe('getCanopyBryophyteGearChecklist', () => {
    it('returns exactly 6 mandatory gear items with expected categories', () => {
      const gear = getCanopyBryophyteGearChecklist();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((item) => item.id);
      expect(ids).toContain('arborist-friction-cambium-saver');
      expect(ids).toContain('lightweight-srt-canopy-ascent-kit');
      expect(ids).toContain('handheld-20x-achromatic-loupe');
      expect(ids).toContain('digital-ultrasonic-fog-canopy-hygrometer');
      expect(ids).toContain('breathable-botanical-collection-pouches');
      expect(ids).toContain('tree-fern-caudex-caliper-gauge');

      const categories = gear.map((item) => item.category);
      expect(categories).toContain('canopy_access');
      expect(categories).toContain('microscopy');
      expect(categories).toContain('microclimate');
      expect(categories).toContain('specimen');
      expect(categories).toContain('measurement');
    });
  });

  describe('calculateCanopyBryophyteDynamics', () => {
    it('computes correct baseline dynamics and pristine climax conservation status', () => {
      const result = calculateCanopyBryophyteDynamics({
        siteId: 'hoh-river-hall-of-mosses',
        stratum: 'mid_canopy_branch_mats',
        substrate: 'bigleaf_maple_epiphyte_limb',
        ambientHumidityPercent: 88,
        canopyHeightMeters: 45,
        fogDripRateMmDay: 12.0,
        matThicknessCm: 14.0,
      });

      expect(result.siteTitle).toBe('Hoh River Hall of Mosses Temperate Rain Forest');
      expect(result.waterStorageCapacityLitersM2).toBeGreaterThanOrEqual(10.0);
      expect(result.waterStorageCapacityLitersM2).toBeLessThanOrEqual(120.0);
      expect(result.poikilohydricRecoveryTimeMinutes).toBeGreaterThanOrEqual(5);
      expect(result.poikilohydricRecoveryTimeMinutes).toBeLessThanOrEqual(90);
      expect(result.canopyEpiphyteBiomassKgHa).toBeGreaterThanOrEqual(500);
      expect(result.canopyEpiphyteBiomassKgHa).toBeLessThanOrEqual(5000);
      expect(result.microclimateBufferIndex).toBeGreaterThanOrEqual(0.0);
      expect(result.microclimateBufferIndex).toBeLessThanOrEqual(1.0);
      expect(result.conservationStatus).toBe('pristine_climax_bryosphere');
      expect(result.canopyAccessProtocol).toContain('cambium');
      expect(result.microscopeIdentificationAdvisory).toContain('20x');
    });

    it('triggers microclimate desiccation warning under critically low ambient humidity', () => {
      const result = calculateCanopyBryophyteDynamics({
        siteId: 'hoh-river-hall-of-mosses',
        stratum: 'emergent_outer_canopy',
        substrate: 'sitka_spruce_bark',
        ambientHumidityPercent: 55,
        canopyHeightMeters: 50,
        fogDripRateMmDay: 1.5,
        matThicknessCm: 2.0,
      });

      expect(result.conservationStatus).toBe('microclimate_desiccation_warning');
      expect(result.microclimateBufferIndex).toBeLessThan(0.45);
      expect(result.poikilohydricRecoveryTimeMinutes).toBeGreaterThan(60);
    });

    it('triggers vulnerable fragmentation risk when mat thickness or buffer index are degraded', () => {
      const result = calculateCanopyBryophyteDynamics({
        siteId: 'tarkine-takayna-rainforest',
        stratum: 'tree_fern_caudex_skirt',
        substrate: 'dicksonia_antarctica_fibrous_caudex',
        ambientHumidityPercent: 78,
        canopyHeightMeters: 20,
        fogDripRateMmDay: 4.0,
        matThicknessCm: 3.5,
      });

      expect(result.conservationStatus).toBe('vulnerable_fragmentation_risk');
      expect(result.canopyAccessProtocol).toContain('caudex');
    });

    it('falls back to default site when invalid siteId is provided', () => {
      const result = calculateCanopyBryophyteDynamics({
        siteId: 'invalid-canopy-id',
        ambientHumidityPercent: 85,
        canopyHeightMeters: 35,
        fogDripRateMmDay: 8.5,
        matThicknessCm: 8.0,
      });

      expect(result.siteTitle).toBe('Hoh River Hall of Mosses Temperate Rain Forest');
      expect(result.conservationStatus).toBe('pristine_climax_bryosphere');
    });

    it('clamps extreme inputs into valid calculation bounds', () => {
      const result = calculateCanopyBryophyteDynamics({
        siteId: 'yakushima-ancient-cedar-moss',
        ambientHumidityPercent: 120,
        canopyHeightMeters: 100,
        fogDripRateMmDay: 50,
        matThicknessCm: 50,
      });

      expect(result.waterStorageCapacityLitersM2).toBeLessThanOrEqual(120.0);
      expect(result.canopyEpiphyteBiomassKgHa).toBeLessThanOrEqual(5000);
      expect(result.poikilohydricRecoveryTimeMinutes).toBeGreaterThanOrEqual(5);
      expect(result.microclimateBufferIndex).toBeLessThanOrEqual(1.0);
    });

    it('tailors canopy access protocol and microscope identification advisory for tree-fern caudices', () => {
      const result = calculateCanopyBryophyteDynamics({
        siteId: 'tarkine-takayna-rainforest',
        stratum: 'tree_fern_caudex_skirt',
        substrate: 'dicksonia_antarctica_fibrous_caudex',
        ambientHumidityPercent: 92,
        canopyHeightMeters: 25,
        fogDripRateMmDay: 15.0,
        matThicknessCm: 12.0,
      });

      expect(result.canopyAccessProtocol).toContain('Dicksonia');
      expect(result.microscopeIdentificationAdvisory).toContain('filmy-fern');
    });
  });
});
