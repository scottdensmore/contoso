export type AlpineZone = 'subalpine_ridgeline' | 'glacier_basin_camp' | 'high_altitude_col' | 'extreme_summit_crest';
export type SensorPackage = 'heated_ultrasonic_anemometer' | 'cup_and_vane_mechanical' | 'laser_optical_disdrometer' | 'acoustic_snow_depth';
export type TelemetryStatus = 'nominal_transmission' | 'advisory_rime_icing_detected' | 'critical_sensor_freeze_power_loss';

export interface WeatherStation {
  id: string;
  title: string;
  mountainRange: string;
  region: string;
  elevationM: number;
  alpineZone: AlpineZone;
  sensorType: SensorPackage;
  batteryVolts: number;
  currentWindKph: number;
  description: string;
  highlights: string[];
}

export interface WeatherStationQuery {
  stationId: string;
  ambientTempC: number; // -60 to 10°C, default -18
  windSpeedKph: number; // 0 to 220 kph, default 65
  solarIrradianceWm2: number; // 0 to 1200 W/m², default 450
  rimeIcingProbabilityPercent: number; // 0 to 100%, default 25
}

export interface WeatherStationResult {
  stationTitle: string;
  alpineZone: AlpineZone;
  windChillC: number;
  batteryDischargeRateW: number;
  windDynamicPressureNm2: number;
  telemetryStatus: TelemetryStatus;
  thermalAdvisory: string;
  stationHealthGuidance: string;
}

export interface WeatherStationGearItem {
  id: string;
  name: string;
  category: 'anemometer' | 'power' | 'telemetry' | 'rigging' | 'de_icing' | 'lightning_protection';
  mandatory: boolean;
  description: string;
}

export const WEATHER_STATIONS: WeatherStation[] = [
  {
    id: 'everest-south-col-station',
    title: 'Everest South Col Alpine Weather Station',
    mountainRange: 'Khumbu Himalayas',
    region: 'Nepal',
    elevationM: 7945,
    alpineZone: 'high_altitude_col',
    sensorType: 'heated_ultrasonic_anemometer',
    batteryVolts: 13.8,
    currentWindKph: 85,
    description: 'Perched at 7,945 m on the windswept South Col between Mount Everest and Lhotse, braving jet stream gales and extreme thin-air freeze cycles.',
    highlights: [
      'Highest weather station on Earth',
      'Dual sonic anemometers with rime heating',
      'Iridium satellite real-time burst telemetry',
    ],
  },
  {
    id: 'denali-football-field-station',
    title: 'Denali Football Field High Camp Station',
    mountainRange: 'Alaska Range',
    region: 'AK, USA',
    elevationM: 5710,
    alpineZone: 'glacier_basin_camp',
    sensorType: 'heated_ultrasonic_anemometer',
    batteryVolts: 12.6,
    currentWindKph: 68,
    description: 'Anchored into deep firn ice on Denali’s high basin plateau at 5,710 m, enduring severe arctic blizzards and prolonged sub-zero whiteouts.',
    highlights: [
      'Sub-zero -50°C arctic wind survival',
      'Acoustic snow depth accumulation gauge',
      'Solar-supercapacitor hybrid power array',
    ],
  },
  {
    id: 'mount-washington-observatory',
    title: 'Mount Washington Summit Auto Station',
    mountainRange: 'White Mountains',
    region: 'NH, USA',
    elevationM: 1917,
    alpineZone: 'extreme_summit_crest',
    sensorType: 'cup_and_vane_mechanical',
    batteryVolts: 14.2,
    currentWindKph: 110,
    description: 'Located at the convergence of three major storm tracks, famed for historic 231 mph winds, relentless rime ice accretion, and cyclonic turbulence.',
    highlights: [
      'Historic 231 mph peak gust record site',
      'Heavy rime ice de-icing thermal heaters',
      'Triple redundant pitot-static pressure tubes',
    ],
  },
  {
    id: 'matterhorn-solvay-station',
    title: 'Matterhorn Solvay Hut Ridge Station',
    mountainRange: 'Pennine Alps',
    region: 'Switzerland',
    elevationM: 4003,
    alpineZone: 'subalpine_ridgeline',
    sensorType: 'laser_optical_disdrometer',
    batteryVolts: 13.1,
    currentWindKph: 45,
    description: 'Mounted onto sheer granite ledges along the Hörnli Ridge below the Matterhorn summit, monitoring localized storm cell development and cloud microphysics.',
    highlights: [
      'Exposed granite arete mast mounting',
      'Laser precipitation particle spectroscopy',
      'LoRaWAN mountain rescue telemetry relay',
    ],
  },
  {
    id: 'aconcagua-colera-high-camp',
    title: 'Aconcagua Camp Colera Weather Tower',
    mountainRange: 'Andes',
    region: 'Argentina',
    elevationM: 5970,
    alpineZone: 'high_altitude_col',
    sensorType: 'heated_ultrasonic_anemometer',
    batteryVolts: 12.9,
    currentWindKph: 72,
    description: 'Standing guard above 5,900 m in the Central Andes, measuring punishing Viento Blanco cyclonic winds and high ultraviolet solar radiation.',
    highlights: [
      'Viento Blanco gale force gust detection',
      'Extreme UV solar pyranometer telemetry',
      'Grounded lightning strike surge arrestors',
    ],
  },
];

export const WEATHER_STATION_GEAR: WeatherStationGearItem[] = [
  {
    id: 'heated-sonic-anemometer-sensor',
    name: 'Heated Ultrasonic Solid-State Alpine Anemometer (No Moving Parts)',
    category: 'anemometer',
    mandatory: true,
    description: 'Rugged dual-axis acoustic resonance wind velocity sensor with internal rime heating elements to prevent ice lockup.',
  },
  {
    id: 'arctic-lifepo4-battery-pack',
    name: 'Cold-Temperature Insulated LiFePO4 Station Battery with Internal Heater',
    category: 'power',
    mandatory: true,
    description: 'Specialized lithium iron phosphate battery enclosure engineered for discharge down to -40°C with automated self-heating mats.',
  },
  {
    id: 'iridium-satellite-burst-transceiver',
    name: 'Iridium SBD Low-Earth Orbit Satellite Telemetry Transceiver',
    category: 'telemetry',
    mandatory: true,
    description: 'Short-burst data (SBD) modem providing pole-to-pole global packet delivery for meteorological feeds in off-grid terrain.',
  },
  {
    id: 'titanium-guywire-mast-anchors',
    name: 'Aircraft-Grade Titanium Guy-Wire Mast Tower Rigging Kit (150mph rated)',
    category: 'rigging',
    mandatory: true,
    description: 'High-tensile corrosion-resistant titanium rigging cables and earth-permafrost screw anchors resisting cyclonic wind loading.',
  },
  {
    id: 'anti-rime-hydrophobic-dome',
    name: 'Superhydrophobic Fluoropolymer Anti-Rime Coating & Heat Wrap',
    category: 'de_icing',
    mandatory: true,
    description: 'Nano-textured fluoropolymer surface barrier preventing supercooled water droplet accretion on sensor housings.',
  },
  {
    id: 'lightning-dissipation-ground-rod',
    name: 'High-Altitude Copper-Clad Grounding Rod & Surge Arrestor Array',
    category: 'lightning_protection',
    mandatory: true,
    description: 'Multipath transient voltage surge suppression system designed for dry rocky ridgelines with minimal soil conductivity.',
  },
];

export function getWeatherStations(zone?: AlpineZone): WeatherStation[] {
  if (!zone) {
    return WEATHER_STATIONS;
  }
  return WEATHER_STATIONS.filter((s) => s.alpineZone === zone);
}

export function getWeatherStationById(id: string): WeatherStation | undefined {
  return WEATHER_STATIONS.find((s) => s.id === id);
}

export function getWeatherStationGear(): WeatherStationGearItem[] {
  return WEATHER_STATION_GEAR;
}

export function calculateStationTelemetry(query: WeatherStationQuery): WeatherStationResult {
  const station = getWeatherStationById(query.stationId) || WEATHER_STATIONS[0];

  const ambientTempC = query.ambientTempC;
  const windSpeedKph = query.windSpeedKph;
  const rimeIcingProbabilityPercent = query.rimeIcingProbabilityPercent;

  // Wind chill equivalent calculation formula:
  // Math.round(13.12 + 0.6215 * ambientTempC - 11.37 * Math.pow(Math.max(5, windSpeedKph), 0.16) + 0.3965 * ambientTempC * Math.pow(Math.max(5, windSpeedKph), 0.16))
  const effectiveWind = Math.max(5, windSpeedKph);
  const windPow = Math.pow(effectiveWind, 0.16);
  const windChillC = Math.round(
    13.12 + 0.6215 * ambientTempC - 11.37 * windPow + 0.3965 * ambientTempC * windPow
  );

  // Battery discharge rate W:
  // Math.round(15 + (ambientTempC < -20 ? 25 : (ambientTempC < 0 ? 10 : 2)) + (rimeIcingProbabilityPercent > 40 ? 35 : 0))
  const tempDraw = ambientTempC < -20 ? 25 : ambientTempC < 0 ? 10 : 2;
  const rimeDraw = rimeIcingProbabilityPercent > 40 ? 35 : 0;
  const batteryDischargeRateW = Math.round(15 + tempDraw + rimeDraw);

  // Wind dynamic pressure N/m²:
  // Math.round(0.5 * (1.225 * Math.exp(-station.elevationM / 8500)) * Math.pow(windSpeedKph * 0.277778, 2))
  const airDensity = 1.225 * Math.exp(-station.elevationM / 8500);
  const windSpeedMs = windSpeedKph * 0.277778;
  const windDynamicPressureNm2 = Math.round(0.5 * airDensity * Math.pow(windSpeedMs, 2));

  // Telemetry status rating:
  // if batteryDischargeRateW > 60 || ambientTempC < -40 || windSpeedKph > 160: 'critical_sensor_freeze_power_loss'
  // else if rimeIcingProbabilityPercent >= 50 || windSpeedKph >= 90 || ambientTempC <= -15: 'advisory_rime_icing_detected'
  // else: 'nominal_transmission'
  let telemetryStatus: TelemetryStatus = 'nominal_transmission';
  let thermalAdvisory = 'Operational parameters within stable thermal margins: Normal auxiliary heating load.';
  let stationHealthGuidance = 'Optimal station telemetry health. Routine data packet bursts scheduled.';

  if (batteryDischargeRateW > 60 || ambientTempC < -40 || windSpeedKph > 160) {
    telemetryStatus = 'critical_sensor_freeze_power_loss';
    thermalAdvisory = 'Severe freezing conditions: Heating circuit maximum threshold exceeded; potential power exhaustion or icing failure.';
    stationHealthGuidance = 'Station telemetry critical. Immediate remote power conservation protocol and sensor heater throttling recommended.';
  } else if (rimeIcingProbabilityPercent >= 50 || windSpeedKph >= 90 || ambientTempC <= -15) {
    telemetryStatus = 'advisory_rime_icing_detected';
    thermalAdvisory = 'Sub-zero conditions with active icing threat: Rime heating elements engaged.';
    stationHealthGuidance = 'Active de-icing advisory. Monitor solar panel charging and power reserves during prolonged low-sun periods.';
  }

  return {
    stationTitle: station.title,
    alpineZone: station.alpineZone,
    windChillC,
    batteryDischargeRateW,
    windDynamicPressureNm2,
    telemetryStatus,
    thermalAdvisory,
    stationHealthGuidance,
  };
}
