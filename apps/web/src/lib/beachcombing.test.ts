import { describe, it, expect } from 'vitest';
import {
  getBeachcombingSites,
  getBeachcombingSiteById,
  calculateBeachcombingProfile,
  getBeachcombingGear,
  BEACHCOMBING_SITES,
  type BeachcombingCalculationQuery,
} from './beachcombing';

describe('Beachcombing Domain Logic', () => {
  describe('Beachcombing Sites Catalog', () => {
    it('returns all 5 iconic beachcombing sites', () => {
      const sites = getBeachcombingSites();
      expect(sites).toHaveLength(5);

      const ids = sites.map((s) => s.id);
      expect(ids).toEqual([
        'glass-beach-fort-bragg',
        'kodiak-island-monashka',
        'cape-may-point-flotsam',
        'olympic-ruby-beach',
        'monhegan-island-lobsterman',
      ]);
    });

    it('filters sites by shoreline type', () => {
      const gravel = getBeachcombingSites('gravel_pebble_cove');
      expect(gravel).toHaveLength(2);
      expect(gravel.map((s) => s.id)).toEqual([
        'glass-beach-fort-bragg',
        'monhegan-island-lobsterman',
      ]);

      const boulder = getBeachcombingSites('high_energy_boulder_strand');
      expect(boulder).toHaveLength(1);
      expect(boulder[0].id).toBe('kodiak-island-monashka');

      const sandspit = getBeachcombingSites('barrier_island_sandspit');
      expect(sandspit).toHaveLength(1);
      expect(sandspit[0].id).toBe('cape-may-point-flotsam');

      const rocky = getBeachcombingSites('rocky_intertidal_shelf');
      expect(rocky).toHaveLength(1);
      expect(rocky[0].id).toBe('olympic-ruby-beach');
    });

    it('finds a site by id', () => {
      const site = getBeachcombingSiteById('glass-beach-fort-bragg');
      expect(site).toBeDefined();
      expect(site?.name).toBe('Glass Beach & MacKerricher Coves');
      expect(site?.region).toBe('Mendocino County, CA');
      expect(site?.coastline).toBe('Pacific Northern California');
      expect(site?.elevationMeters).toBe(4);
      expect(site?.shorelineType).toBe('gravel_pebble_cove');
      expect(site?.typicalTidalRangeMeters).toBe(2.1);
      expect(site?.stormDepositIndex).toBe(8.4);
      expect(site?.accessDifficulty).toBe('easy_beach_stroll');
      expect(site?.primaryGlassColors).toContain('Cobalt Blue');
      expect(site?.highlights).toContain('MacKerricher marine bluffs');

      const nonexistent = getBeachcombingSiteById('non-existent');
      expect(nonexistent).toBeUndefined();
    });

    it('contains valid data for all 5 sites in catalog', () => {
      expect(BEACHCOMBING_SITES).toHaveLength(5);
      for (const site of BEACHCOMBING_SITES) {
        expect(site.id).toBeTruthy();
        expect(site.name).toBeTruthy();
        expect(site.region).toBeTruthy();
        expect(site.coastline).toBeTruthy();
        expect(site.elevationMeters).toBeGreaterThan(0);
        expect(site.typicalTidalRangeMeters).toBeGreaterThan(0);
        expect(site.stormDepositIndex).toBeGreaterThan(0);
        expect(site.primaryGlassColors.length).toBeGreaterThan(0);
        expect(site.highlights.length).toBeGreaterThan(0);
        expect(site.description).toBeTruthy();
      }
    });
  });

  describe('Mandatory Coastal Beachcombing Kit Checklist', () => {
    it('returns the 6 mandatory beachcombing gear items', () => {
      const gear = getBeachcombingGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toEqual([
        'uv-blacklight-365nm',
        'sand-mesh-sifting-scoop',
        'neoprene-high-traction-tide-booties',
        'jewelers-loupe-caliper-set',
        'padded-compartment-finds-case',
        'intertidal-tide-clock-tide-table',
      ]);

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('illumination');
      expect(categories).toContain('container');
      expect(categories).toContain('footwear');
      expect(categories).toContain('measurement');
      expect(categories).toContain('optics');
      expect(categories).toContain('safety');
    });
  });

  describe('Intertidal Tide & Flotsam Foraging Calculator', () => {
    it('calculates expected yield correctly using formula', () => {
      // Glass Beach: stormDepositIndex = 8.4
      // Math.max(1, Math.round(searchHours * 3.5 * (site.stormDepositIndex / 5.0) * (tidalDropMeters / 2.0)))
      // For 3 hours, 2.5m drop: 3 * 3.5 * (8.4 / 5.0) * (2.5 / 2.0) = 10.5 * 1.68 * 1.25 = 22.05 -> 22
      const query: BeachcombingCalculationQuery = {
        siteId: 'glass-beach-fort-bragg',
        searchHours: 3,
        tidalDropMeters: 2.5,
        stormSurgeDaysAgo: 3,
        tumbleEnergy: 'extreme_ocean_surf',
      };

      const result = calculateBeachcombingProfile(query);
      expect(result.siteName).toBe('Glass Beach & MacKerricher Coves');
      expect(result.expectedYieldPieces).toBe(22);
    });

    it('enforces minimum expected yield of at least 1 piece', () => {
      const query: BeachcombingCalculationQuery = {
        siteId: 'cape-may-point-flotsam',
        searchHours: 1,
        tidalDropMeters: 0.5,
        stormSurgeDaysAgo: 14,
        tumbleEnergy: 'low_sheltered_cove',
      };

      const result = calculateBeachcombingProfile(query);
      expect(result.expectedYieldPieces).toBeGreaterThanOrEqual(1);
    });

    it('evaluates patina quality: ancient_c_fractured_frost (95%) for extreme ocean surf and >= 3 days ago', () => {
      const query: BeachcombingCalculationQuery = {
        siteId: 'kodiak-island-monashka',
        searchHours: 4,
        tidalDropMeters: 3.5,
        stormSurgeDaysAgo: 4,
        tumbleEnergy: 'extreme_ocean_surf',
      };

      const result = calculateBeachcombingProfile(query);
      expect(result.patinaQualityGrade).toBe('ancient_c_fractured_frost');
      expect(result.patinaRatingPercent).toBe(95);
    });

    it('evaluates patina quality: smooth_frosted_gem (80%) for moderate bay or >= 2 days ago', () => {
      const query1: BeachcombingCalculationQuery = {
        siteId: 'cape-may-point-flotsam',
        searchHours: 2,
        tidalDropMeters: 1.5,
        stormSurgeDaysAgo: 1,
        tumbleEnergy: 'moderate_bay',
      };
      const result1 = calculateBeachcombingProfile(query1);
      expect(result1.patinaQualityGrade).toBe('smooth_frosted_gem');
      expect(result1.patinaRatingPercent).toBe(80);

      const query2: BeachcombingCalculationQuery = {
        siteId: 'monhegan-island-lobsterman',
        searchHours: 2,
        tidalDropMeters: 1.5,
        stormSurgeDaysAgo: 2,
        tumbleEnergy: 'low_sheltered_cove',
      };
      const result2 = calculateBeachcombingProfile(query2);
      expect(result2.patinaQualityGrade).toBe('smooth_frosted_gem');
      expect(result2.patinaRatingPercent).toBe(80);
    });

    it('evaluates patina quality: early_frosting (55%) when conditions do not meet higher tiers', () => {
      const query: BeachcombingCalculationQuery = {
        siteId: 'glass-beach-fort-bragg',
        searchHours: 2,
        tidalDropMeters: 1.5,
        stormSurgeDaysAgo: 1,
        tumbleEnergy: 'low_sheltered_cove',
      };

      const result = calculateBeachcombingProfile(query);
      expect(result.patinaQualityGrade).toBe('early_frosting');
      expect(result.patinaRatingPercent).toBe(55);
    });

    it('determines prime_low_tide_wrack_window when tidalDropMeters >= 2.0 and stormSurgeDaysAgo <= 5', () => {
      const query: BeachcombingCalculationQuery = {
        siteId: 'olympic-ruby-beach',
        searchHours: 3,
        tidalDropMeters: 2.5,
        stormSurgeDaysAgo: 3,
        tumbleEnergy: 'moderate_bay',
      };

      const result = calculateBeachcombingProfile(query);
      expect(result.optimalForagingStatus).toBe('prime_low_tide_wrack_window');
    });

    it('determines suboptimal_slack_scour when stormSurgeDaysAgo > 8', () => {
      const query: BeachcombingCalculationQuery = {
        siteId: 'olympic-ruby-beach',
        searchHours: 3,
        tidalDropMeters: 3.0,
        stormSurgeDaysAgo: 10,
        tumbleEnergy: 'moderate_bay',
      };

      const result = calculateBeachcombingProfile(query);
      expect(result.optimalForagingStatus).toBe('suboptimal_slack_scour');
    });

    it('determines hazard_rising_tide_pinch when not prime and stormSurgeDaysAgo <= 8 (e.g. tidalDropMeters < 2.0)', () => {
      const query: BeachcombingCalculationQuery = {
        siteId: 'cape-may-point-flotsam',
        searchHours: 2,
        tidalDropMeters: 1.5,
        stormSurgeDaysAgo: 4,
        tumbleEnergy: 'moderate_bay',
      };

      const result = calculateBeachcombingProfile(query);
      expect(result.optimalForagingStatus).toBe('hazard_rising_tide_pinch');
    });

    it('includes standard rarity odds, tide safety advisory, and conservation advisory', () => {
      const query: BeachcombingCalculationQuery = {
        siteId: 'glass-beach-fort-bragg',
        searchHours: 3,
        tidalDropMeters: 2.5,
        stormSurgeDaysAgo: 3,
        tumbleEnergy: 'extreme_ocean_surf',
      };

      const result = calculateBeachcombingProfile(query);
      expect(result.rarityOdds).toBe(
        'Cobalt Blue: 1 in 250 pieces | Vaseline Uranium: 1 in 1,000 pieces | Ruby Red: 1 in 10,000 pieces'
      );
      expect(result.tideSafetyAdvisory).toBe(
        'Intertidal Safety: Never turn your back on the surf. Sneaker waves and incoming tides can rapidly cut off access around rocky headlands.'
      );
      expect(result.conservationAdvisory).toBe(
        'Leave No Trace Coastal Ethics: Pack out all plastic marine debris and ghost fishing gear found on the wrack line to protect sea life.'
      );
    });

    it('throws error for unknown siteId', () => {
      const query: BeachcombingCalculationQuery = {
        siteId: 'unknown-site',
        searchHours: 3,
        tidalDropMeters: 2.5,
        stormSurgeDaysAgo: 3,
        tumbleEnergy: 'extreme_ocean_surf',
      };

      expect(() => calculateBeachcombingProfile(query)).toThrow(
        /Beachcombing site with ID "unknown-site" not found/i
      );
    });
  });
});
