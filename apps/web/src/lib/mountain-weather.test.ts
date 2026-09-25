import { describe, it, expect } from 'vitest';
import {
  getWeatherSectors,
  getWeatherSectorById,
  calculateMountainWeather,
  getWeatherGear,
  type MountainWeatherQuery,
} from './mountain-weather';

describe('mountain-weather lib', () => {
  describe('getWeatherSectors', () => {
    it('returns all 5 iconic mountain weather sectors when no level filter is provided', () => {
      const sectors = getWeatherSectors();
      expect(sectors).toHaveLength(5);
      const ids = sectors.map((s) => s.id);
      expect(ids).toContain('denali-south-buttress');
      expect(ids).toContain('mount-washington-ridge');
      expect(ids).toContain('rainier-columbia-crest');
      expect(ids).toContain('everest-south-col');
      expect(ids).toContain('matterhorn-hornli-ridge');
    });

    it('filters sectors by synoptic level correctly', () => {
      const level300 = getWeatherSectors('300mb');
      expect(level300).toHaveLength(1);
      expect(level300[0].id).toBe('everest-south-col');

      const level500 = getWeatherSectors('500mb');
      expect(level500).toHaveLength(1);
      expect(level500[0].id).toBe('denali-south-buttress');

      const level600 = getWeatherSectors('600mb');
      expect(level600).toHaveLength(2);
      expect(level600.map((s) => s.id)).toEqual(
        expect.arrayContaining(['rainier-columbia-crest', 'matterhorn-hornli-ridge'])
      );

      const level700 = getWeatherSectors('700mb');
      expect(level700).toHaveLength(1);
      expect(level700[0].id).toBe('mount-washington-ridge');
    });
  });

  describe('getWeatherSectorById', () => {
    it('returns sector by id when it exists', () => {
      const denali = getWeatherSectorById('denali-south-buttress');
      expect(denali).toBeDefined();
      expect(denali?.title).toBe('Denali Upper Kahiltna & South Buttress');
      expect(denali?.elevationM).toBe(6190);
      expect(denali?.venturiMultiplier).toBe(2.2);
      expect(denali?.synopticLevel).toBe('500mb');
    });

    it('returns undefined for non-existent sector id', () => {
      expect(getWeatherSectorById('unknown-peak')).toBeUndefined();
    });
  });

  describe('calculateMountainWeather', () => {
    it('calculates summit wind speed with venturi multiplier and jet stream proximity boost (< 100km)', () => {
      const query: MountainWeatherQuery = {
        sectorId: 'denali-south-buttress',
        baselineWindMph: 20,
        barometricDropHpa: 0.8,
        jetStreamOffsetKm: 80,
        airTempF: 10,
      };

      const result = calculateMountainWeather(query);
      expect(result.sectorTitle).toBe('Denali Upper Kahiltna & South Buttress');
      expect(result.elevationM).toBe(6190);
      expect(result.summitWindMph).toBe(49);
    });

    it('calculates summit wind speed without jet stream boost when offset >= 100km', () => {
      const query: MountainWeatherQuery = {
        sectorId: 'rainier-columbia-crest',
        baselineWindMph: 20,
        barometricDropHpa: 0.5,
        jetStreamOffsetKm: 150,
        airTempF: 20,
      };

      const result = calculateMountainWeather(query);
      expect(result.summitWindMph).toBe(36);
    });

    it('calculates wind chill using NWS formula for winds > 3mph and temp <= 50F', () => {
      const query: MountainWeatherQuery = {
        sectorId: 'denali-south-buttress',
        baselineWindMph: 20,
        barometricDropHpa: 0.5,
        jetStreamOffsetKm: 150,
        airTempF: 0,
      };

      const result = calculateMountainWeather(query);
      expect(result.windChillF).toBe(-30);
    });

    it('returns airTempF as wind chill when wind <= 3mph or temp > 50F', () => {
      const queryMild: MountainWeatherQuery = {
        sectorId: 'rainier-columbia-crest',
        baselineWindMph: 1,
        barometricDropHpa: 0.2,
        jetStreamOffsetKm: 200,
        airTempF: 32,
      };
      const resultMild = calculateMountainWeather(queryMild);
      expect(resultMild.windChillF).toBe(32);

      const queryWarm: MountainWeatherQuery = {
        sectorId: 'rainier-columbia-crest',
        baselineWindMph: 30,
        barometricDropHpa: 0.2,
        jetStreamOffsetKm: 200,
        airTempF: 55,
      };
      const resultWarm = calculateMountainWeather(queryWarm);
      expect(resultWarm.windChillF).toBe(55);
    });

    it('determines barometric trend correctly based on 3-hour pressure drop', () => {
      const makeQuery = (barometricDropHpa: number): MountainWeatherQuery => ({
        sectorId: 'rainier-columbia-crest',
        baselineWindMph: 10,
        barometricDropHpa,
        jetStreamOffsetKm: 200,
        airTempF: 20,
      });

      expect(calculateMountainWeather(makeQuery(0.5)).barometricTrend).toBe('steady_fair');
      expect(calculateMountainWeather(makeQuery(0.99)).barometricTrend).toBe('steady_fair');
      expect(calculateMountainWeather(makeQuery(1.0)).barometricTrend).toBe('approaching_front');
      expect(calculateMountainWeather(makeQuery(2.4)).barometricTrend).toBe('approaching_front');
      expect(calculateMountainWeather(makeQuery(2.5)).barometricTrend).toBe('rapid_storm_warning');
      expect(calculateMountainWeather(makeQuery(3.9)).barometricTrend).toBe('rapid_storm_warning');
      expect(calculateMountainWeather(makeQuery(4.0)).barometricTrend).toBe('explosive_cyclogenesis_evacuation');
      expect(calculateMountainWeather(makeQuery(6.5)).barometricTrend).toBe('explosive_cyclogenesis_evacuation');
    });

    it('evaluates summit window status as abort_severe_winds_whiteout when severe conditions are met', () => {
      const severeWind = calculateMountainWeather({
        sectorId: 'denali-south-buttress',
        baselineWindMph: 30,
        barometricDropHpa: 0.5,
        jetStreamOffsetKm: 200,
        airTempF: 10,
      });
      expect(severeWind.summitWindowStatus).toBe('abort_severe_winds_whiteout');

      const severeDrop = calculateMountainWeather({
        sectorId: 'rainier-columbia-crest',
        baselineWindMph: 10,
        barometricDropHpa: 2.6,
        jetStreamOffsetKm: 200,
        airTempF: 20,
      });
      expect(severeDrop.summitWindowStatus).toBe('abort_severe_winds_whiteout');

      const severeJet = calculateMountainWeather({
        sectorId: 'rainier-columbia-crest',
        baselineWindMph: 10,
        barometricDropHpa: 0.5,
        jetStreamOffsetKm: 35,
        airTempF: 20,
      });
      expect(severeJet.summitWindowStatus).toBe('abort_severe_winds_whiteout');
    });

    it('evaluates summit window status as marginal_caution_window when moderate caution criteria are met', () => {
      const marginalWind = calculateMountainWeather({
        sectorId: 'rainier-columbia-crest',
        baselineWindMph: 20,
        barometricDropHpa: 0.5,
        jetStreamOffsetKm: 150,
        airTempF: 20,
      });
      expect(marginalWind.summitWindowStatus).toBe('marginal_caution_window');

      const marginalDrop = calculateMountainWeather({
        sectorId: 'rainier-columbia-crest',
        baselineWindMph: 10,
        barometricDropHpa: 1.5,
        jetStreamOffsetKm: 150,
        airTempF: 20,
      });
      expect(marginalDrop.summitWindowStatus).toBe('marginal_caution_window');

      const marginalJet = calculateMountainWeather({
        sectorId: 'rainier-columbia-crest',
        baselineWindMph: 10,
        barometricDropHpa: 0.5,
        jetStreamOffsetKm: 70,
        airTempF: 20,
      });
      expect(marginalJet.summitWindowStatus).toBe('marginal_caution_window');
    });

    it('evaluates summit window status as go_summit_window when all criteria are favorable', () => {
      const favorable = calculateMountainWeather({
        sectorId: 'rainier-columbia-crest',
        baselineWindMph: 10,
        barometricDropHpa: 0.5,
        jetStreamOffsetKm: 200,
        airTempF: 25,
      });
      expect(favorable.summitWindowStatus).toBe('go_summit_window');
      expect(favorable.routeAdvisory).toContain('Favorable summit window');
    });

    it('throws an error if sectorId is invalid', () => {
      expect(() =>
        calculateMountainWeather({
          sectorId: 'non-existent',
          baselineWindMph: 20,
          barometricDropHpa: 1.0,
          jetStreamOffsetKm: 150,
          airTempF: 10,
        })
      ).toThrow('Sector with id "non-existent" not found');
    });
  });

  describe('getWeatherGear', () => {
    it('returns the mandatory 6-item weather routing and altimetry gear checklist', () => {
      const gear = getWeatherGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory === true)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toEqual([
        'barometric-altimeter-watch',
        'ultralight-anemometer',
        'satellite-synoptic-inreach',
        'aviation-synoptic-chart',
        'thermal-face-mask-goggles',
        'emergency-hypothermia-bivy',
      ]);
    });
  });
});
