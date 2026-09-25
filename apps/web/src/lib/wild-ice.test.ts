import { describe, it, expect } from 'vitest';
import {
  getWildIceVenues,
  getWildIceVenueById,
  calculateWildIce,
  getWildIceGear,
  WILD_ICE_VENUES,
  WILD_ICE_GEAR,
  WildIceQuery,
} from './wild-ice';

describe('Wild Ice Library', () => {
  describe('Catalog & Venue Retrieval', () => {
    it('returns all 5 iconic wild ice venues when no filter is provided', () => {
      const venues = getWildIceVenues();
      expect(venues).toHaveLength(5);
      expect(venues.map((v) => v.id)).toEqual([
        'lake-malaren-archipelago',
        'lake-siljan-dalarna',
        'lake-baikal-olkhon',
        'lake-moraine-banff',
        'lake-superior-chequamegon',
      ]);
    });

    it('filters venues correctly by ice type', () => {
      const blackIce = getWildIceVenues('black_ice');
      expect(blackIce).toHaveLength(4);
      expect(blackIce.map((v) => v.id)).toEqual([
        'lake-malaren-archipelago',
        'lake-siljan-dalarna',
        'lake-baikal-olkhon',
        'lake-superior-chequamegon',
      ]);

      const snowIce = getWildIceVenues('white_snow_ice');
      expect(snowIce).toHaveLength(1);
      expect(snowIce[0].id).toBe('lake-moraine-banff');

      const candledIce = getWildIceVenues('candled_ice');
      expect(candledIce).toHaveLength(0);
    });

    it('retrieves venue by ID or returns undefined for unknown ID', () => {
      const venue = getWildIceVenueById('lake-malaren-archipelago');
      expect(venue).toBeDefined();
      expect(venue?.title).toBe('Lake Mälaren & Stockholm Archipelago');
      expect(venue?.surfaceElevationM).toBe(1);
      expect(venue?.iceType).toBe('black_ice');
      expect(venue?.defaultThicknessCm).toBe(9.0);
      expect(venue?.typicalTourKm).toBe(35);

      const unknown = getWildIceVenueById('unknown-lake');
      expect(unknown).toBeUndefined();
    });

    it('has valid venue structure with highlights and details', () => {
      for (const venue of WILD_ICE_VENUES) {
        expect(venue.id).toBeTruthy();
        expect(venue.title).toBeTruthy();
        expect(venue.waterBody).toBeTruthy();
        expect(venue.region).toBeTruthy();
        expect(venue.surfaceElevationM).toBeGreaterThanOrEqual(0);
        expect(venue.defaultThicknessCm).toBeGreaterThan(0);
        expect(venue.typicalTourKm).toBeGreaterThan(0);
        expect(venue.description).toBeTruthy();
        expect(venue.highlights.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('Mandatory Nordic Wild Ice Safety Kit', () => {
    it('returns exactly 6 mandatory gear items with correct categories', () => {
      const gear = getWildIceGear();
      expect(gear).toHaveLength(6);
      expect(WILD_ICE_GEAR).toEqual(gear);

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('self_rescue');
      expect(categories).toContain('probing');
      expect(categories).toContain('buoyancy');
      expect(categories).toContain('rescue');
      expect(categories).toContain('traction');
      expect(categories).toContain('hypothermia');

      for (const item of gear) {
        expect(item.mandatory).toBe(true);
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
      }
    });
  });

  describe('Calculator Engine & Mathematical Logic', () => {
    const baseQuery: WildIceQuery = {
      venueId: 'lake-malaren-archipelago',
      iceType: 'black_ice',
      thicknessCm: 8.0,
      skaterWeightLbs: 180,
      ambientTempF: 22,
    };

    it('calculates effective thickness, safe load capacity, and acoustic resonance for black ice', () => {
      const result = calculateWildIce(baseQuery);
      // black_ice: effective thickness = 8.0 * 1.0 = 8.0 cm
      expect(result.effectiveThicknessCm).toBe(8.0);
      // safeLoadCapacityLbs: Math.round(50 * 8^2) = 50 * 64 = 3200 lbs
      expect(result.safeLoadCapacityLbs).toBe(3200);
      // acousticResonanceHz: Math.round(1200 / Math.sqrt(8.0)) = 424 Hz
      expect(result.acousticResonanceHz).toBe(424);
      expect(result.resonanceDescription).toBe(
        'Mid-Frequency Singing (Moderate Congelation Ice)'
      );
      expect(result.safetyStatus).toBe('safe_touring_window');
      expect(result.venueTitle).toBe('Lake Mälaren & Stockholm Archipelago');
      expect(result.advisory).toContain('SAFE TOURING WINDOW');
    });

    it('calculates effective thickness as 50% for white snow ice', () => {
      const result = calculateWildIce({
        ...baseQuery,
        iceType: 'white_snow_ice',
        thicknessCm: 10.0,
      });
      // white_snow_ice: effective thickness = 10.0 * 0.5 = 5.0 cm
      expect(result.effectiveThicknessCm).toBe(5.0);
      // safe load = 50 * 5^2 = 1250 lbs
      expect(result.safeLoadCapacityLbs).toBe(1250);
      // acoustic resonance = Math.round(1200 / Math.sqrt(5.0)) = 537 Hz
      expect(result.acousticResonanceHz).toBe(537);
      expect(result.resonanceDescription).toBe(
        'Mid-Frequency Singing (Moderate Congelation Ice)'
      );
      // effectiveThickness 5.0 cm (>= 4.5 and < 7.0) -> marginal_caution_scouting_only
      expect(result.safetyStatus).toBe('marginal_caution_scouting_only');
      expect(result.advisory).toContain('CAUTION & PIKE PROBING');
    });

    it('sets effective thickness and bearing capacity to zero for candled ice with muffled decay resonance', () => {
      const result = calculateWildIce({
        ...baseQuery,
        iceType: 'candled_ice',
        thicknessCm: 15.0,
      });
      expect(result.effectiveThicknessCm).toBe(0.0);
      expect(result.safeLoadCapacityLbs).toBe(0);
      expect(result.acousticResonanceHz).toBe(0);
      expect(result.resonanceDescription).toBe(
        'Muffled Decay (Structural Integrity Nil)'
      );
      expect(result.safetyStatus).toBe('unsafe_icefall_submersion_hazard');
      expect(result.advisory).toContain('SUBMERSION HAZARD');
    });

    it('categorizes acoustic resonance descriptions across frequency thresholds', () => {
      // High singing: >= 600 Hz (e.g. 4.0 cm -> 1200 / sqrt(4) = 600 Hz)
      const highRes = calculateWildIce({
        ...baseQuery,
        thicknessCm: 4.0,
        iceType: 'black_ice',
      });
      expect(highRes.acousticResonanceHz).toBe(600);
      expect(highRes.resonanceDescription).toBe(
        'High Singing Resonance (Thin Resonant Membrane)'
      );

      // Deep low-frequency booming: > 0 and < 350 Hz (e.g. 18.0 cm -> 1200 / sqrt(18) = 283 Hz)
      const deepBoom = calculateWildIce({
        ...baseQuery,
        thicknessCm: 18.0,
        iceType: 'black_ice',
      });
      expect(deepBoom.acousticResonanceHz).toBe(283);
      expect(deepBoom.resonanceDescription).toBe(
        'Deep Low-Frequency Booming (Thick Structural Sheet)'
      );
    });

    it('evaluates safetyStatus thresholds correctly', () => {
      // effective thickness < 4.5 cm -> unsafe_icefall_submersion_hazard
      const thinIce = calculateWildIce({
        ...baseQuery,
        thicknessCm: 4.0,
      });
      expect(thinIce.safetyStatus).toBe('unsafe_icefall_submersion_hazard');

      // ambientTempF > 36 -> unsafe_icefall_submersion_hazard
      const warmThaw = calculateWildIce({
        ...baseQuery,
        thicknessCm: 12.0,
        ambientTempF: 38,
      });
      expect(warmThaw.safetyStatus).toBe('unsafe_icefall_submersion_hazard');

      // skaterWeightLbs > safeLoadCapacityLbs -> unsafe_icefall_submersion_hazard
      const overload = calculateWildIce({
        ...baseQuery,
        thicknessCm: 4.6,
        skaterWeightLbs: 320,
      });
      expect(overload.safetyStatus).toBe('marginal_caution_scouting_only');

      // Ambient temp > 32 but <= 36 -> marginal_caution_scouting_only
      const mildThaw = calculateWildIce({
        ...baseQuery,
        thicknessCm: 10.0,
        ambientTempF: 34,
      });
      expect(mildThaw.safetyStatus).toBe('marginal_caution_scouting_only');

      // Effective thickness 5.5 cm with temp 20F -> marginal_caution_scouting_only
      const scoutingOnly = calculateWildIce({
        ...baseQuery,
        thicknessCm: 5.5,
        ambientTempF: 20,
      });
      expect(scoutingOnly.safetyStatus).toBe('marginal_caution_scouting_only');
    });

    it('uses fallback title when venueId is unknown', () => {
      const fallback = calculateWildIce({
        ...baseQuery,
        venueId: 'unknown-venue',
      });
      expect(fallback.venueTitle).toBe('Wild Ice Touring Arena');
    });
  });
});
