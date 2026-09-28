import { describe, expect, it } from 'vitest';
import {
  calculateStationTelemetry,
  getWeatherStationById,
  getWeatherStationGear,
  getWeatherStations,
  type WeatherStationQuery,
} from './weather-station';

describe('weather-station library', () => {
  describe('station catalog and retrieval', () => {
    it('returns all 5 iconic alpine weather stations', () => {
      const stations = getWeatherStations();
      expect(stations).toHaveLength(5);
      const ids = stations.map((s) => s.id);
      expect(ids).toContain('everest-south-col-station');
      expect(ids).toContain('denali-football-field-station');
      expect(ids).toContain('mount-washington-observatory');
      expect(ids).toContain('matterhorn-solvay-station');
      expect(ids).toContain('aconcagua-colera-high-camp');
    });

    it('filters weather stations by alpine zone', () => {
      const colStations = getWeatherStations('high_altitude_col');
      expect(colStations).toHaveLength(2);
      expect(colStations.every((s) => s.alpineZone === 'high_altitude_col')).toBe(true);

      const basinStations = getWeatherStations('glacier_basin_camp');
      expect(basinStations).toHaveLength(1);
      expect(basinStations[0].id).toBe('denali-football-field-station');

      const summitStations = getWeatherStations('extreme_summit_crest');
      expect(summitStations).toHaveLength(1);
      expect(summitStations[0].id).toBe('mount-washington-observatory');

      const ridgeStations = getWeatherStations('subalpine_ridgeline');
      expect(ridgeStations).toHaveLength(1);
      expect(ridgeStations[0].id).toBe('matterhorn-solvay-station');
    });

    it('retrieves a weather station by id', () => {
      const station = getWeatherStationById('everest-south-col-station');
      expect(station).toBeDefined();
      expect(station?.title).toBe('Everest South Col Alpine Weather Station');
      expect(station?.elevationM).toBe(7945);
      expect(station?.sensorType).toBe('heated_ultrasonic_anemometer');
      expect(station?.batteryVolts).toBe(13.8);
      expect(station?.currentWindKph).toBe(85);
      expect(station?.highlights).toHaveLength(3);
    });

    it('returns undefined for non-existent station id', () => {
      const station = getWeatherStationById('unknown-station-id');
      expect(station).toBeUndefined();
    });
  });

  describe('mandatory gear checklist', () => {
    it('returns 6 mandatory weather station maintenance gear items', () => {
      const gear = getWeatherStationGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const categories = gear.map((g) => g.category);
      expect(categories).toEqual([
        'anemometer',
        'power',
        'telemetry',
        'rigging',
        'de_icing',
        'lightning_protection',
      ]);

      const ids = gear.map((g) => g.id);
      expect(ids).toEqual([
        'heated-sonic-anemometer-sensor',
        'arctic-lifepo4-battery-pack',
        'iridium-satellite-burst-transceiver',
        'titanium-guywire-mast-anchors',
        'anti-rime-hydrophobic-dome',
        'lightning-dissipation-ground-rod',
      ]);
    });
  });

  describe('telemetry and anemometry calculations', () => {
    it('calculates telemetry for default query values', () => {
      const query: WeatherStationQuery = {
        stationId: 'everest-south-col-station',
        ambientTempC: -18,
        windSpeedKph: 65,
        solarIrradianceWm2: 450,
        rimeIcingProbabilityPercent: 25,
      };

      const result = calculateStationTelemetry(query);
      expect(result.stationTitle).toBe('Everest South Col Alpine Weather Station');
      expect(result.alpineZone).toBe('high_altitude_col');
      expect(result.windChillC).toBe(-34);
      expect(result.batteryDischargeRateW).toBe(25); // 15 + 10 (-18C is < 0 and >= -20) + 0 (25% <= 40%)
      expect(result.windDynamicPressureNm2).toBeGreaterThan(0);
      expect(result.telemetryStatus).toBe('advisory_rime_icing_detected'); // -18C <= -15
      expect(result.thermalAdvisory).toBeTruthy();
      expect(result.stationHealthGuidance).toBeTruthy();
    });

    it('identifies critical sensor freeze power loss under extreme conditions', () => {
      const query: WeatherStationQuery = {
        stationId: 'denali-football-field-station',
        ambientTempC: -45,
        windSpeedKph: 175,
        solarIrradianceWm2: 100,
        rimeIcingProbabilityPercent: 85,
      };

      const result = calculateStationTelemetry(query);
      // ambientTempC < -40, windSpeedKph > 160, batteryDischargeRateW = 15 + 25 + 35 = 75 > 60
      expect(result.batteryDischargeRateW).toBe(75);
      expect(result.telemetryStatus).toBe('critical_sensor_freeze_power_loss');
    });

    it('identifies nominal transmission under mild alpine conditions', () => {
      const query: WeatherStationQuery = {
        stationId: 'matterhorn-solvay-station',
        ambientTempC: -5,
        windSpeedKph: 25,
        solarIrradianceWm2: 600,
        rimeIcingProbabilityPercent: 10,
      };

      const result = calculateStationTelemetry(query);
      // temp > -15, wind < 90, rime < 50, discharge = 15 + 10 + 0 = 25 <= 60
      expect(result.batteryDischargeRateW).toBe(25);
      expect(result.telemetryStatus).toBe('nominal_transmission');
    });

    it('accounts for station elevation in dynamic wind pressure calculations', () => {
      const highColResult = calculateStationTelemetry({
        stationId: 'everest-south-col-station', // 7945m
        ambientTempC: -10,
        windSpeedKph: 100,
        solarIrradianceWm2: 500,
        rimeIcingProbabilityPercent: 20,
      });

      const crestResult = calculateStationTelemetry({
        stationId: 'mount-washington-observatory', // 1917m
        ambientTempC: -10,
        windSpeedKph: 100,
        solarIrradianceWm2: 500,
        rimeIcingProbabilityPercent: 20,
      });

      // At lower elevation (denser air), dynamic pressure must be significantly higher for the same wind speed
      expect(crestResult.windDynamicPressureNm2).toBeGreaterThan(highColResult.windDynamicPressureNm2);
    });

    it('falls back gracefully to first station if stationId is unknown', () => {
      const result = calculateStationTelemetry({
        stationId: 'non-existent-id',
        ambientTempC: -10,
        windSpeedKph: 50,
        solarIrradianceWm2: 400,
        rimeIcingProbabilityPercent: 20,
      });

      expect(result.stationTitle).toBe('Everest South Col Alpine Weather Station');
    });
  });
});
