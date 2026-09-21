import { describe, it, expect } from 'vitest';
import {
  FISHING_LOCATIONS,
  getFishingLocations,
  getFishingLocationById,
  calculateAnglingMatch,
  getFlyFishingGear,
  type AnglingMatchQuery,
} from './fly-fishing';

describe('fly-fishing catalog', () => {
  it('contains 5 PNW & Rocky Mountain iconic waters with complete metadata', () => {
    expect(FISHING_LOCATIONS).toHaveLength(5);
    const ids = FISHING_LOCATIONS.map((loc) => loc.id);
    expect(ids).toEqual([
      'upper-yakima-canyon',
      'enchantment-crystal-lakes',
      'deschutes-warm-springs',
      'metolius-headwaters',
      'snake-river-grand-teton',
    ]);
  });

  it('retrieves location by id', () => {
    const yakima = getFishingLocationById('upper-yakima-canyon');
    expect(yakima).toBeDefined();
    expect(yakima?.name).toBe('Upper Yakima River Canyon');
    expect(yakima?.state).toBe('WA');
    expect(yakima?.waterType).toBe('freestone_river');
    expect(yakima?.elevationFt).toBe(1200);
    expect(yakima?.recommendedRodWeight).toBe(5);
    expect(yakima?.recommendedLeaderTippet).toBe('9ft 4X');
    expect(yakima?.targetSpecies).toEqual(['rainbow_trout', 'westside_cutthroat']);
    expect(yakima?.activeHatches).toEqual(['stonefly_salmonfly', 'caddis_elk_hair']);
    expect(yakima?.catchAndReleaseOnly).toBe(true);
    expect(yakima?.barblessRequired).toBe(true);

    expect(getFishingLocationById('non-existent')).toBeUndefined();
  });

  it('verifies all 5 locations specific properties', () => {
    const enchantments = getFishingLocationById('enchantment-crystal-lakes');
    expect(enchantments?.waterType).toBe('alpine_lake');
    expect(enchantments?.elevationFt).toBe(6800);
    expect(enchantments?.recommendedRodWeight).toBe(3);
    expect(enchantments?.recommendedLeaderTippet).toBe('9ft 5X - 6X');
    expect(enchantments?.targetSpecies).toEqual(['golden_trout', 'westside_cutthroat']);
    expect(enchantments?.activeHatches).toEqual(['midge_chironomid', 'terrestrial_hopper']);
    expect(enchantments?.catchAndReleaseOnly).toBe(true);
    expect(enchantments?.barblessRequired).toBe(true);

    const deschutes = getFishingLocationById('deschutes-warm-springs');
    expect(deschutes?.waterType).toBe('tailwater');
    expect(deschutes?.elevationFt).toBe(1500);
    expect(deschutes?.recommendedRodWeight).toBe(6);
    expect(deschutes?.catchAndReleaseOnly).toBe(false);
    expect(deschutes?.barblessRequired).toBe(true);

    const metolius = getFishingLocationById('metolius-headwaters');
    expect(metolius?.waterType).toBe('spring_creek');
    expect(metolius?.elevationFt).toBe(2900);
    expect(metolius?.recommendedRodWeight).toBe(4);
    expect(metolius?.recommendedLeaderTippet).toBe('12ft 6X');

    const snake = getFishingLocationById('snake-river-grand-teton');
    expect(snake?.waterType).toBe('freestone_river');
    expect(snake?.elevationFt).toBe(6700);
    expect(snake?.recommendedRodWeight).toBe(5);
    expect(snake?.recommendedLeaderTippet).toBe('9ft 4X');
  });

  it('filters locations by water type', () => {
    const alpineLakes = getFishingLocations('alpine_lake');
    expect(alpineLakes).toHaveLength(1);
    expect(alpineLakes[0].id).toBe('enchantment-crystal-lakes');

    const freestoneRivers = getFishingLocations('freestone_river');
    expect(freestoneRivers).toHaveLength(2);
    expect(freestoneRivers.map((loc) => loc.id)).toEqual([
      'upper-yakima-canyon',
      'snake-river-grand-teton',
    ]);

    const springCreeks = getFishingLocations('spring_creek');
    expect(springCreeks).toHaveLength(1);
    expect(springCreeks[0].id).toBe('metolius-headwaters');

    const tailwaters = getFishingLocations('tailwater');
    expect(tailwaters).toHaveLength(1);
    expect(tailwaters[0].id).toBe('deschutes-warm-springs');

    const allLocations = getFishingLocations();
    expect(allLocations).toHaveLength(5);
  });
});

describe('calculateAnglingMatch', () => {
  it('calculates optimal fly and presentation for rising fish in moderate water temps', () => {
    const query: AnglingMatchQuery = {
      locationId: 'upper-yakima-canyon',
      waterTemperatureF: 54,
      timeOfDay: 'midday',
      surfaceActivity: 'rising',
    };

    const result = calculateAnglingMatch(query);
    expect(result.locationName).toBe('Upper Yakima River Canyon');
    expect(result.suggestedFly).toBeDefined();
    expect(result.flySize).toBeDefined();
    expect(result.presentationTechnique).toBeDefined();
    expect(result.tippetSize).toBeDefined();
    expect(result.fishActivityLevel).toBe('high');
    expect(result.temperatureWarning).toBeUndefined();
    expect(result.regulationsSummary.length).toBeGreaterThan(0);
    expect(result.regulationsSummary).toContain('Single barbless hooks required');
    expect(result.regulationsSummary).toContain('Catch-and-release only (immediate return to water)');
  });

  it('triggers Hoot Owl thermal warning when water temperature > 65.0°F', () => {
    const query: AnglingMatchQuery = {
      locationId: 'upper-yakima-canyon',
      waterTemperatureF: 68,
      timeOfDay: 'midday',
      surfaceActivity: 'rising',
    };

    const result = calculateAnglingMatch(query);
    expect(result.temperatureWarning).toBe(
      'Hoot Owl Alert: Water temperature exceeds 65°F. Cease fishing during afternoon hours to protect native trout from thermal exhaustion.'
    );
    expect(result.fishActivityLevel).toBe('low');
  });

  it('does not trigger thermal warning when water temperature is exactly 65.0°F or lower', () => {
    const query: AnglingMatchQuery = {
      locationId: 'upper-yakima-canyon',
      waterTemperatureF: 65.0,
      timeOfDay: 'dawn',
      surfaceActivity: 'rising',
    };

    const result = calculateAnglingMatch(query);
    expect(result.temperatureWarning).toBeUndefined();
  });

  it('handles subsurface feeding and deep pool surface activities', () => {
    const subsurface = calculateAnglingMatch({
      locationId: 'enchantment-crystal-lakes',
      waterTemperatureF: 48,
      timeOfDay: 'dawn',
      surfaceActivity: 'subsurface_feeding',
    });
    expect(subsurface.presentationTechnique.toLowerCase()).toContain('nymph');

    const deepPool = calculateAnglingMatch({
      locationId: 'deschutes-warm-springs',
      waterTemperatureF: 52,
      timeOfDay: 'dusk',
      surfaceActivity: 'deep_pool',
    });
    expect(deepPool.presentationTechnique.toLowerCase()).toContain('streamer');
  });

  it('throws error for unknown location id', () => {
    expect(() =>
      calculateAnglingMatch({
        locationId: 'unknown-spot',
        waterTemperatureF: 50,
        timeOfDay: 'midday',
        surfaceActivity: 'rising',
      })
    ).toThrow(/unknown-spot/i);
  });
});

describe('getFlyFishingGear', () => {
  it('returns mandatory gear and conservation checklist containing 6 items', () => {
    const gear = getFlyFishingGear();
    expect(gear).toHaveLength(6);
    expect(gear.every((item) => item.mandatory)).toBe(true);

    const names = gear.map((item) => item.name);
    expect(names).toContain('Barbless hooks fly selection & silicone fly box');
    expect(names).toContain('Knotless rubber mesh catch-and-release net (preserves fish slime coating)');
    expect(names).toContain('Hemostats / forceps with line cutter for gentle hook removal');
    expect(names).toContain('Fluorocarbon / nylon tippet spools (3X through 6X)');
    expect(names).toContain('Quick-release wading belt & studded wading boots (swiftwater safety)');
    expect(names).toContain('Polarized eye protection with floating lanyard');
  });
});
