import { describe, it, expect } from 'vitest';
import {
  getBogShoeingSites,
  getBogShoeingSiteById,
  calculateBogFlotation,
  getBogGearChecklist,
  type BogFlotationQuery,
} from './bog-shoeing';

describe('Bog-Shoeing Domain Logic', () => {
  describe('Site retrieval and filtering', () => {
    it('returns all 5 iconic peatland sites when no filter provided', () => {
      const sites = getBogShoeingSites();
      expect(sites).toHaveLength(5);
      expect(sites.map((s) => s.id)).toEqual([
        'great-dismal-swamp-quaking-mat',
        'boundary-waters-spruce-muskeg',
        'kenai-peninsula-patterned-fen',
        'adirondack-spring-mire-basin',
        'algonquin-highland-tussock-fen',
      ]);
    });

    it('filters sites by terrain type', () => {
      const fenSites = getBogShoeingSites('patterned_fen_flark');
      expect(fenSites).toHaveLength(1);
      expect(fenSites[0].id).toBe('kenai-peninsula-patterned-fen');
      expect(fenSites[0].title).toBe('Kenai Peninsula Patterned Fen & Flark System');

      const muskegSites = getBogShoeingSites('boreal_black_spruce_muskeg');
      expect(muskegSites).toHaveLength(1);
      expect(muskegSites[0].id).toBe('boundary-waters-spruce-muskeg');
    });

    it('filters sites by water saturation', () => {
      const seasonalSites = getBogShoeingSites(undefined, 'seasonally_flooded');
      expect(seasonalSites).toHaveLength(2);
      expect(seasonalSites.map((s) => s.id)).toContain('boundary-waters-spruce-muskeg');
      expect(seasonalSites.map((s) => s.id)).toContain('adirondack-spring-mire-basin');
    });

    it('filters sites by both terrain and water saturation', () => {
      const match = getBogShoeingSites('quaking_sphagnum_mat', 'fully_saturated_superficial_water');
      expect(match).toHaveLength(1);
      expect(match[0].id).toBe('great-dismal-swamp-quaking-mat');

      const noMatch = getBogShoeingSites('quaking_sphagnum_mat', 'drained_moss_crust');
      expect(noMatch).toHaveLength(0);
    });

    it('retrieves site by ID or returns undefined for unknown ID', () => {
      const site = getBogShoeingSiteById('adirondack-spring-mire-basin');
      expect(site).toBeDefined();
      expect(site?.primaryShoe).toBe('composite_mud_flotation_deck');
      expect(site?.peatDepthMeters).toBe(3.8);

      const missing = getBogShoeingSiteById('unknown-site');
      expect(missing).toBeUndefined();
    });
  });

  describe('Flotation & Sinkage Calculations', () => {
    it('calculates ground pressure, bearing threshold, sinkage, and flotation ratio correctly for baseline query', () => {
      const query: BogFlotationQuery = {
        siteId: 'great-dismal-swamp-quaking-mat',
        bogShoeType: 'wide_oval_sphagnum_glider',
        hikerWeightKg: 75,
        backpackWeightKg: 15,
        waterTableDepthCm: 0,
        cadenceStepsPerMin: 40,
      };

      const result = calculateBogFlotation(query);
      expect(result.siteTitle).toBe('Great Dismal Sphagnum Quake Corridor');
      expect(result.totalLoadKg).toBe(90);
      expect(result.groundPressurePsi).toBe(0.46);
      expect(result.peatBearingThresholdPsi).toBe(0.38);
      expect(result.flotationRatio).toBe(0.83);
      expect(result.estimatedSinkageCm).toBe(5);
      expect(result.sinkingHazard).toBe('moderate_saturated_slump');
      expect(result.navigationAdvisory).toBeTruthy();
      expect(result.selfRescueProtocol).toBeTruthy();
    });

    it('adjusts bearing threshold when waterTableDepthCm > 0', () => {
      const query: BogFlotationQuery = {
        siteId: 'kenai-peninsula-patterned-fen',
        bogShoeType: 'composite_mud_flotation_deck',
        hikerWeightKg: 85,
        backpackWeightKg: 20,
        waterTableDepthCm: 10,
        cadenceStepsPerMin: 35,
      };

      const result = calculateBogFlotation(query);
      expect(result.peatBearingThresholdPsi).toBe(0.26);
      expect(result.groundPressurePsi).toBe(0.77);
      expect(result.sinkingHazard).toBe('critical_quaking_mire_submersion');
    });

    it('identifies firm hummock support under lightweight low-pressure conditions', () => {
      const query: BogFlotationQuery = {
        siteId: 'boundary-waters-spruce-muskeg',
        bogShoeType: 'wide_oval_sphagnum_glider',
        hikerWeightKg: 50,
        backpackWeightKg: 5,
        waterTableDepthCm: -15,
        cadenceStepsPerMin: 50,
      };

      const result = calculateBogFlotation(query);
      expect(result.groundPressurePsi).toBe(0.28);
      expect(result.peatBearingThresholdPsi).toBe(0.50);
      expect(result.flotationRatio).toBe(1.79);
      expect(result.estimatedSinkageCm).toBe(3);
      expect(result.sinkingHazard).toBe('firm_hummock_support');
    });
  });

  describe('Mandatory Gear Checklist', () => {
    it('returns the 6 mandatory peatland self-rescue items', () => {
      const gear = getBogGearChecklist();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);
      expect(gear.map((g) => g.id)).toEqual([
        'wide-deck-sphagnum-bog-shoes',
        'carbon-fiber-bog-probing-pole',
        'chest-high-breathable-waders',
        'inflatable-self-rescue-bog-pillow',
        'sealed-tannin-proof-compass',
        'antimicrobial-peat-barrier-socks',
      ]);
    });
  });
});
