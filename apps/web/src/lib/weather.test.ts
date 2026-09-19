import { describe, it, expect } from 'vitest';
import {
  getMountainForecastZones,
  getMountainZoneById,
  calculateMicroclimate,
  getSevereWeatherProtocols,
} from './weather';

describe('weather library', () => {
  describe('getMountainForecastZones', () => {
    it('returns all 5 Pacific Northwest mountain forecast zones', () => {
      const zones = getMountainForecastZones();
      expect(zones).toHaveLength(5);

      const ids = zones.map((z) => z.id);
      expect(ids).toEqual([
        'mount-rainier',
        'mount-baker',
        'snoqualmie-alpental',
        'stevens-crest',
        'olympic-hurricane',
      ]);

      for (const zone of zones) {
        expect(zone.name).toBeTruthy();
        expect(zone.mountainRange).toBeTruthy();
        expect(zone.baseElevationFt).toBeGreaterThan(0);
        expect(zone.summitElevationFt).toBeGreaterThan(zone.baseElevationFt);
        expect(zone.freezingLevelFt).toBeGreaterThan(0);
        expect(zone.windSpeedMph).toBeGreaterThanOrEqual(0);
        expect(zone.windGustMph).toBeGreaterThanOrEqual(zone.windSpeedMph);
        expect(zone.windDirection).toBeTruthy();
        expect(zone.synopsis).toBeTruthy();
        expect(zone.lastUpdated).toBeTruthy();
      }
    });

    it('contains exact specifications for Mount Rainier and Mount Baker', () => {
      const rainier = getMountainZoneById('mount-rainier');
      expect(rainier).toBeDefined();
      expect(rainier?.name).toBe('Mount Rainier (Paradise to Summit)');
      expect(rainier?.mountainRange).toBe('South Cascades');
      expect(rainier?.baseElevationFt).toBe(5400);
      expect(rainier?.summitElevationFt).toBe(14411);
      expect(rainier?.baseTempF).toBe(44);
      expect(rainier?.summitTempF).toBe(12);
      expect(rainier?.freezingLevelFt).toBe(7500);
      expect(rainier?.windSpeedMph).toBe(25);
      expect(rainier?.windGustMph).toBe(45);
      expect(rainier?.windDirection).toBe('WSW');
      expect(rainier?.condition).toBe('snow_flurries');
      expect(rainier?.pressureTrend).toBe('rapidly_falling');
      expect(rainier?.lightningRisk).toBe('moderate');
      expect(rainier?.stormWarning).toBe(true);
      expect(rainier?.synopsis).toContain('Approaching Pacific cold front');

      const baker = getMountainZoneById('mount-baker');
      expect(baker).toBeDefined();
      expect(baker?.name).toBe('Mount Baker (Heather Meadows to Summit)');
      expect(baker?.mountainRange).toBe('North Cascades');
      expect(baker?.baseElevationFt).toBe(4300);
      expect(baker?.summitElevationFt).toBe(10781);
      expect(baker?.baseTempF).toBe(40);
      expect(baker?.summitTempF).toBe(18);
      expect(baker?.freezingLevelFt).toBe(6200);
      expect(baker?.windSpeedMph).toBe(20);
      expect(baker?.windGustMph).toBe(35);
      expect(baker?.windDirection).toBe('W');
      expect(baker?.condition).toBe('heavy_snow');
      expect(baker?.pressureTrend).toBe('falling');
      expect(baker?.lightningRisk).toBe('low');
      expect(baker?.stormWarning).toBe(false);
      expect(baker?.synopsis).toContain('Substantial orographic snowfall');
    });

    it('contains exact specifications for Snoqualmie Alpental, Stevens Crest, and Olympic Hurricane', () => {
      const snoqualmie = getMountainZoneById('snoqualmie-alpental');
      expect(snoqualmie).toBeDefined();
      expect(snoqualmie?.name).toBe('Snoqualmie Pass & Alpental Valley');
      expect(snoqualmie?.freezingLevelFt).toBe(5800);
      expect(snoqualmie?.condition).toBe('rain');
      expect(snoqualmie?.pressureTrend).toBe('steady');

      const stevens = getMountainZoneById('stevens-crest');
      expect(stevens).toBeDefined();
      expect(stevens?.name).toBe('Stevens Pass & Skyline Ridge');
      expect(stevens?.freezingLevelFt).toBe(5200);
      expect(stevens?.condition).toBe('partly_cloudy');
      expect(stevens?.pressureTrend).toBe('rising');

      const olympic = getMountainZoneById('olympic-hurricane');
      expect(olympic).toBeDefined();
      expect(olympic?.name).toBe('Olympic Mountains (Hurricane Ridge)');
      expect(olympic?.freezingLevelFt).toBe(6800);
      expect(olympic?.condition).toBe('overcast');
      expect(olympic?.pressureTrend).toBe('falling');
    });
  });

  describe('getMountainZoneById', () => {
    it('returns undefined when zone is not found', () => {
      expect(getMountainZoneById('unknown-zone')).toBeUndefined();
    });
  });

  describe('calculateMicroclimate', () => {
    it('calculates temperature lapse rate correctly (3.5°F drop per 1,000 ft)', () => {
      // Rainier base: 5400 ft, 44°F
      // Target: 8400 ft (+3000 ft) -> 44 - (3 * 3.5) = 44 - 10.5 = 33.5 -> Math.round = 34°F
      const result = calculateMicroclimate({
        zoneId: 'mount-rainier',
        targetElevationFt: 8400,
        exposureLevel: 'sheltered_valley',
      });

      expect(result.estimatedTempF).toBe(34);
      expect(result.isBelowFreezing).toBe(false);
    });

    it('identifies below freezing status when estimated temp is <= 32°F', () => {
      // Rainier base: 5400 ft, 44°F
      // Target: 10,000 ft (+4600 ft) -> 44 - 16.1 = 27.9 -> Math.round = 28°F
      const result = calculateMicroclimate({
        zoneId: 'mount-rainier',
        targetElevationFt: 10000,
        exposureLevel: 'open_slope',
      });

      expect(result.estimatedTempF).toBe(28);
      expect(result.isBelowFreezing).toBe(true);
    });

    it('applies wind speed multipliers by terrain exposure', () => {
      // Rainier base wind: 25 mph
      // sheltered_valley: 0.7 -> 17.5 -> 18
      const sheltered = calculateMicroclimate({
        zoneId: 'mount-rainier',
        targetElevationFt: 6000,
        exposureLevel: 'sheltered_valley',
      });
      expect(sheltered.estimatedWindSpeedMph).toBe(18);

      // open_slope: 1.1 -> 27.5 -> 28
      const openSlope = calculateMicroclimate({
        zoneId: 'mount-rainier',
        targetElevationFt: 6000,
        exposureLevel: 'open_slope',
      });
      expect(openSlope.estimatedWindSpeedMph).toBe(28);

      // exposed_ridge: 1.6 -> 40
      const ridge = calculateMicroclimate({
        zoneId: 'mount-rainier',
        targetElevationFt: 6000,
        exposureLevel: 'exposed_ridge',
      });
      expect(ridge.estimatedWindSpeedMph).toBe(40);

      // summit: 2.0 -> 50
      const summit = calculateMicroclimate({
        zoneId: 'mount-rainier',
        targetElevationFt: 6000,
        exposureLevel: 'summit',
      });
      expect(summit.estimatedWindSpeedMph).toBe(50);
    });

    it('calculates wind chill using NWS formula and determines hypothermia risk levels', () => {
      // Rainier at 10,000 ft on exposed_ridge:
      // T = 28°F, V = 40 mph
      // windChill formula: 35.74 + 0.6215*28 - 35.75*(40^0.16) + 0.4275*28*(40^0.16) = 10.2 -> 10°F
      const result = calculateMicroclimate({
        zoneId: 'mount-rainier',
        targetElevationFt: 10000,
        exposureLevel: 'exposed_ridge',
      });

      expect(result.estimatedTempF).toBe(28);
      expect(result.estimatedWindSpeedMph).toBe(40);
      expect(result.windChillF).toBe(10);
      expect(result.hypothermiaRisk).toBe('critical'); // <= 15
    });

    it('evaluates hypothermia risk thresholds correctly (critical <= 15, high <= 32, moderate <= 45, low > 45)', () => {
      // Snoqualmie base: 3000 ft, 48°F, wind: 10 mph
      // Target: 3000 ft, sheltered_valley -> wind = 7 mph
      // T = 48, V = 7 -> windChill = 35.74 + 29.832 - 48.78 + 28.02 = 44.8 -> 45°F -> moderate
      const modResult = calculateMicroclimate({
        zoneId: 'snoqualmie-alpental',
        targetElevationFt: 3000,
        exposureLevel: 'sheltered_valley',
      });
      expect(modResult.hypothermiaRisk).toBe('moderate');

      // Target: 5400 ft (+2400 ft) -> T = 48 - (2.4 * 3.5) = 48 - 8.4 = 39.6 -> 40°F
      // exposed_ridge: wind = 10 * 1.6 = 16 mph
      // T = 40, V = 16 -> windChill = 35.74 + 24.86 - 55.77 + 26.68 = 31.5 -> 32°F -> high
      const highResult = calculateMicroclimate({
        zoneId: 'snoqualmie-alpental',
        targetElevationFt: 5400,
        exposureLevel: 'exposed_ridge',
      });
      expect(highResult.hypothermiaRisk).toBe('high');
    });

    it('does not calculate wind chill when temp > 50°F or wind < 3 mph', () => {
      // Snoqualmie base: 48°F, if target elevation is 2000 ft (-1000 ft) -> 48 - (-3.5) = 51.5 -> 52°F
      const result = calculateMicroclimate({
        zoneId: 'snoqualmie-alpental',
        targetElevationFt: 2000,
        exposureLevel: 'sheltered_valley',
      });
      expect(result.estimatedTempF).toBe(52);
      expect(result.windChillF).toBe(52);
      expect(result.hypothermiaRisk).toBe('low');
    });

    it('returns the required 3-layer mountain clothing advice and advisory', () => {
      const result = calculateMicroclimate({
        zoneId: 'mount-rainier',
        targetElevationFt: 8000,
        exposureLevel: 'open_slope',
      });

      expect(result.layeringAdvice).toHaveLength(3);
      expect(result.layeringAdvice[0]).toContain('Merino wool or synthetic moisture-wicking next-to-skin (no cotton)');
      expect(result.layeringAdvice[1]).toContain('Active breathable fleece or 800-fill down/synthetic puffy');
      expect(result.layeringAdvice[2]).toContain('3-layer Gore-Tex / hardshell windproof and waterproof jacket & pants');
      expect(result.weatherAdvisory).toBeTruthy();
    });
  });

  describe('getSevereWeatherProtocols', () => {
    it('returns lightning safety guidelines and whiteout navigation protocols', () => {
      const protocols = getSevereWeatherProtocols();
      expect(protocols.lightningProtocol.length).toBeGreaterThanOrEqual(4);
      expect(protocols.whiteoutNavigation.length).toBeGreaterThanOrEqual(4);

      const lightningText = protocols.lightningProtocol.join(' ');
      expect(lightningText).toContain('30/30');
      expect(lightningText).toContain('trekking poles');
      expect(lightningText).toContain('pad');

      const whiteoutText = protocols.whiteoutNavigation.join(' ');
      expect(whiteoutText).toContain('horizon');
      expect(whiteoutText).toContain('GPS');
    });
  });
});
