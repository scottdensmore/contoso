import { describe, it, expect } from 'vitest';
import {
  LOOKOUT_TOWERS,
  LOOKOUT_GEAR,
  getFireLookoutTowers,
  getFireLookoutTowerById,
  calculateSmokeTriangulation,
  getLookoutGear,
} from './fire-lookout';

describe('fire-lookout catalog, triangulation calculator, and gear kit', () => {
  describe('LOOKOUT_TOWERS catalog', () => {
    it('contains all 5 iconic fire lookout towers with required specifications', () => {
      expect(LOOKOUT_TOWERS).toHaveLength(5);

      const winchester = LOOKOUT_TOWERS.find((t) => t.id === 'winchester-mountain-lookout');
      expect(winchester).toBeDefined();
      expect(winchester?.name).toBe('Winchester Mountain Lookout (L-4 Cab)');
      expect(winchester?.mountainPeak).toBe('Winchester Mountain');
      expect(winchester?.nationalForest).toBe('Mt. Baker-Snoqualmie National Forest, WA');
      expect(winchester?.elevationMeters).toBe(1988);
      expect(winchester?.towerStructure).toBe('live_in_wood_cab_l4');
      expect(winchester?.towerHeightMeters).toBe(4);
      expect(winchester?.viewshedRadiusKm).toBe(65);
      expect(winchester?.osborneAlidadeEquipped).toBe(true);
      expect(winchester?.activeObserverStatus).toBe('active_usfs_spotting');
      expect(winchester?.description).toContain('North Cascades');
      expect(winchester?.highlights).toEqual([
        'North Cascades 360° vantage',
        'Restored 1935 USFS L-4 timber cab',
        'Active lightning holdover spotting',
      ]);

      const desolation = LOOKOUT_TOWERS.find((t) => t.id === 'desolation-peak-lookout');
      expect(desolation).toBeDefined();
      expect(desolation?.name).toBe('Desolation Peak Fire Lookout');
      expect(desolation?.mountainPeak).toBe('Desolation Peak');
      expect(desolation?.nationalForest).toBe('Ross Lake National Recreation Area, WA');
      expect(desolation?.elevationMeters).toBe(1860);
      expect(desolation?.towerStructure).toBe('live_in_wood_cab_l4');
      expect(desolation?.towerHeightMeters).toBe(5);
      expect(desolation?.viewshedRadiusKm).toBe(70);
      expect(desolation?.osborneAlidadeEquipped).toBe(true);
      expect(desolation?.activeObserverStatus).toBe('volunteer_firewatch');
      expect(desolation?.highlights).toEqual([
        'Historic Pasayten Wilderness vistas',
        'Jack Kerouac summer station',
        'Osborne Fire Finder brass map table',
      ]);

      const cammerer = LOOKOUT_TOWERS.find((t) => t.id === 'mount-cammerer-lookout');
      expect(cammerer).toBeDefined();
      expect(cammerer?.name).toBe('Mount Cammerer Octagonal Stone Lookout');
      expect(cammerer?.mountainPeak).toBe('Mount Cammerer');
      expect(cammerer?.nationalForest).toBe('Great Smoky Mountains National Park, TN/NC');
      expect(cammerer?.elevationMeters).toBe(1502);
      expect(cammerer?.towerStructure).toBe('stone_cupola_ground_cab');
      expect(cammerer?.towerHeightMeters).toBe(6);
      expect(cammerer?.viewshedRadiusKm).toBe(45);
      expect(cammerer?.osborneAlidadeEquipped).toBe(true);
      expect(cammerer?.activeObserverStatus).toBe('historic_public_rental');
      expect(cammerer?.highlights).toEqual([
        'Octagonal hand-carved stone cab',
        'Pigeon River Gorge viewshed',
        'Appalachian ridge thermal observation',
      ]);

      const blackElk = LOOKOUT_TOWERS.find((t) => t.id === 'black-elk-peak-lookout');
      expect(blackElk).toBeDefined();
      expect(blackElk?.name).toBe('Black Elk Peak Stone Tower');
      expect(blackElk?.mountainPeak).toBe('Black Elk Peak (Harney Peak)');
      expect(blackElk?.nationalForest).toBe('Black Hills National Forest, SD');
      expect(blackElk?.elevationMeters).toBe(2207);
      expect(blackElk?.towerStructure).toBe('stone_cupola_ground_cab');
      expect(blackElk?.towerHeightMeters).toBe(13);
      expect(blackElk?.viewshedRadiusKm).toBe(80);
      expect(blackElk?.osborneAlidadeEquipped).toBe(true);
      expect(blackElk?.activeObserverStatus).toBe('emergency_surge_only');
      expect(blackElk?.highlights).toEqual([
        'Four-state panoramic viewshed',
        'Granite spire fortress construction',
        'High-wind anchoring system',
      ]);

      const sundance = LOOKOUT_TOWERS.find((t) => t.id === 'sundance-mountain-lookout');
      expect(sundance).toBeDefined();
      expect(sundance?.name).toBe('Sundance Mountain Steel Tower');
      expect(sundance?.mountainPeak).toBe('Sundance Mountain');
      expect(sundance?.nationalForest).toBe('Kaniksu National Forest, ID');
      expect(sundance?.elevationMeters).toBe(1920);
      expect(sundance?.towerStructure).toBe('steel_skeletal_tower');
      expect(sundance?.towerHeightMeters).toBe(24);
      expect(sundance?.viewshedRadiusKm).toBe(75);
      expect(sundance?.osborneAlidadeEquipped).toBe(true);
      expect(sundance?.activeObserverStatus).toBe('active_usfs_spotting');
      expect(sundance?.highlights).toEqual([
        '80-foot skeletal steel frame',
        'Selkirk Crest wildlands surveillance',
        'Rapid cross-bearing dispatch link',
      ]);
    });
  });

  describe('getFireLookoutTowers', () => {
    it('returns all towers when no filter provided', () => {
      const towers = getFireLookoutTowers();
      expect(towers).toHaveLength(5);
    });

    it('filters towers by towerStructure', () => {
      const l4Towers = getFireLookoutTowers('live_in_wood_cab_l4');
      expect(l4Towers).toHaveLength(2);
      expect(l4Towers.map((t) => t.id)).toEqual([
        'winchester-mountain-lookout',
        'desolation-peak-lookout',
      ]);

      const stoneTowers = getFireLookoutTowers('stone_cupola_ground_cab');
      expect(stoneTowers).toHaveLength(2);
      expect(stoneTowers.map((t) => t.id)).toEqual([
        'mount-cammerer-lookout',
        'black-elk-peak-lookout',
      ]);

      const steelTowers = getFireLookoutTowers('steel_skeletal_tower');
      expect(steelTowers).toHaveLength(1);
      expect(steelTowers[0].id).toBe('sundance-mountain-lookout');

      const poleTowers = getFireLookoutTowers('historic_pole_frame');
      expect(poleTowers).toHaveLength(0);
    });
  });

  describe('getFireLookoutTowerById', () => {
    it('returns the tower matching id', () => {
      const tower = getFireLookoutTowerById('winchester-mountain-lookout');
      expect(tower).toBeDefined();
      expect(tower?.name).toBe('Winchester Mountain Lookout (L-4 Cab)');
    });

    it('returns undefined if tower is not found', () => {
      expect(getFireLookoutTowerById('non-existent')).toBeUndefined();
    });
  });

  describe('LOOKOUT_GEAR and getLookoutGear', () => {
    it('returns the mandatory 6-item remote lookout observer kit', () => {
      expect(LOOKOUT_GEAR).toHaveLength(6);
      const gear = getLookoutGear();
      expect(gear).toEqual(LOOKOUT_GEAR);
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      expect(gear.map((g) => g.id)).toEqual([
        'osborne-alidade-sighting-peep',
        'high-magnification-roof-binocular',
        'usfs-topographic-panoramic-maps',
        'handheld-vhf-forest-net-transceiver',
        'sling-psychrometer-hygrothermometer',
        'faraday-lightning-ground-cable',
      ]);

      const alidade = gear.find((g) => g.id === 'osborne-alidade-sighting-peep');
      expect(alidade?.category).toBe('navigation');
      expect(alidade?.name).toBe('Brass Osborne Fire Finder Peep Sights & Graduated Ring');

      const radio = gear.find((g) => g.id === 'handheld-vhf-forest-net-transceiver');
      expect(radio?.category).toBe('radio');

      const safety = gear.find((g) => g.id === 'faraday-lightning-ground-cable');
      expect(safety?.category).toBe('safety');
    });
  });

  describe('calculateSmokeTriangulation', () => {
    it('calculates triangulated bearing string correctly across cardinal and intercardinal compass directions', () => {
      const testCases: { azimuth: number; expectedDir: string }[] = [
        { azimuth: 0, expectedDir: 'N' },
        { azimuth: 15, expectedDir: 'N' },
        { azimuth: 45, expectedDir: 'NE' },
        { azimuth: 90, expectedDir: 'E' },
        { azimuth: 135, expectedDir: 'SE' },
        { azimuth: 180, expectedDir: 'S' },
        { azimuth: 225, expectedDir: 'SW' },
        { azimuth: 270, expectedDir: 'W' },
        { azimuth: 315, expectedDir: 'NW' },
        { azimuth: 350, expectedDir: 'N' },
      ];

      for (const { azimuth, expectedDir } of testCases) {
        const result = calculateSmokeTriangulation({
          towerId: 'winchester-mountain-lookout',
          azimuthDegrees: azimuth,
          verticalAngleDegrees: -1.5,
          estimatedDistanceKm: 15,
          smokeBehavior: 'wispy_incipient_white',
          windSpeedMph: 10,
        });

        expect(result.triangulatedBearing).toBe(
          `${azimuth}° (${expectedDir}) | Dist: 15 km | Vert: -1.5°`
        );
      }
    });

    it('formats positive vertical angles with a leading plus sign', () => {
      const result = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 120,
        verticalAngleDegrees: 3.2,
        estimatedDistanceKm: 8,
        smokeBehavior: 'dense_vertical_convection',
        windSpeedMph: 12,
      });

      expect(result.triangulatedBearing).toBe('120° (SE) | Dist: 8 km | Vert: +3.2°');
    });

    it('calculates convection index percent with wind speed modifier and clamping', () => {
      // wispy: 35, wind <= 20 -> 35
      const r1 = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 20,
        smokeBehavior: 'wispy_incipient_white',
        windSpeedMph: 15,
      });
      expect(r1.convectionIndexPercent).toBe(35);

      // wispy: 35 + 10 (wind > 20) -> 45
      const r2 = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 20,
        smokeBehavior: 'wispy_incipient_white',
        windSpeedMph: 25,
      });
      expect(r2.convectionIndexPercent).toBe(45);

      // pyrocumulus_pulsing: 95 + 10 = 105 -> clamped to 100
      const r3 = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 20,
        smokeBehavior: 'pyrocumulus_pulsing',
        windSpeedMph: 30,
      });
      expect(r3.convectionIndexPercent).toBe(100);

      // flattened_shear_drift: 60
      const r4 = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 20,
        smokeBehavior: 'flattened_shear_drift',
        windSpeedMph: 10,
      });
      expect(r4.convectionIndexPercent).toBe(60);
    });

    it('evaluates plume alert level correctly', () => {
      // pyrocumulus -> extreme_blowup_evacuation
      const r1 = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 30,
        smokeBehavior: 'pyrocumulus_pulsing',
        windSpeedMph: 10,
      });
      expect(r1.plumeAlertLevel).toBe('extreme_blowup_evacuation');

      // dense_vertical_convection + wind >= 25 -> extreme_blowup_evacuation
      const r2 = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 30,
        smokeBehavior: 'dense_vertical_convection',
        windSpeedMph: 25,
      });
      expect(r2.plumeAlertLevel).toBe('extreme_blowup_evacuation');

      // dense_vertical_convection + wind < 25 -> confirmed_wildfire_dispatch
      const r3 = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 30,
        smokeBehavior: 'dense_vertical_convection',
        windSpeedMph: 15,
      });
      expect(r3.plumeAlertLevel).toBe('confirmed_wildfire_dispatch');

      // distance <= 10 km -> confirmed_wildfire_dispatch even if wispy
      const r4 = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 9,
        smokeBehavior: 'wispy_incipient_white',
        windSpeedMph: 10,
      });
      expect(r4.plumeAlertLevel).toBe('confirmed_wildfire_dispatch');

      // otherwise -> observation_watch
      const r5 = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 25,
        smokeBehavior: 'wispy_incipient_white',
        windSpeedMph: 15,
      });
      expect(r5.plumeAlertLevel).toBe('observation_watch');
    });

    it('evaluates observation status based on wind speed and distance threshold', () => {
      // windSpeedMph >= 40 -> active_lightning_storm_hazard
      const r1 = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout', // viewshed 65km
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 20,
        smokeBehavior: 'wispy_incipient_white',
        windSpeedMph: 42,
      });
      expect(r1.observationStatus).toBe('active_lightning_storm_hazard');

      // distance > viewshed * 0.75 (65 * 0.75 = 48.75km) -> haze_thermal_inversion
      const r2 = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 50,
        smokeBehavior: 'wispy_incipient_white',
        windSpeedMph: 15,
      });
      expect(r2.observationStatus).toBe('haze_thermal_inversion');

      // otherwise -> clear_line_of_sight
      const r3 = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 30,
        smokeBehavior: 'wispy_incipient_white',
        windSpeedMph: 20,
      });
      expect(r3.observationStatus).toBe('clear_line_of_sight');
    });

    it('calculates effective viewshed radius with high wind penalty', () => {
      // Winchester viewshed: 65 km
      // wind <= 35 -> 65 km
      const normal = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 20,
        smokeBehavior: 'wispy_incipient_white',
        windSpeedMph: 30,
      });
      expect(normal.effectiveViewshedKm).toBe(65);

      // wind > 35 -> Math.round(65 * 0.7) = 46 km
      const highWind = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 45,
        verticalAngleDegrees: 0,
        estimatedDistanceKm: 20,
        smokeBehavior: 'wispy_incipient_white',
        windSpeedMph: 36,
      });
      expect(highWind.effectiveViewshedKm).toBe(46);
    });

    it('returns exact advisories', () => {
      const result = calculateSmokeTriangulation({
        towerId: 'winchester-mountain-lookout',
        azimuthDegrees: 180,
        verticalAngleDegrees: -2.0,
        estimatedDistanceKm: 15,
        smokeBehavior: 'dense_vertical_convection',
        windSpeedMph: 14,
      });

      expect(result.towerName).toBe('Winchester Mountain Lookout (L-4 Cab)');
      expect(result.triangulationAdvisory).toBe(
        'Osborne Triangulation: Sighting cross-bearing verified at 180°. Relay coordinates to central dispatch for cross-bearing intersection.'
      );
      expect(result.holdoverFireAdvisory).toBe(
        'Holdover Sleeper Advisory: Lightning strikes in dense root duff can smolder undetected for 3 to 10 days before gusty afternoon winds ignite a visible plume.'
      );
      expect(result.towerSafetyAdvisory).toBe(
        'High-Peak Safety: Stand on glass-insulator stool during electrical storms. Secure exterior storm shutters when sustained winds exceed 35 mph.'
      );
    });
  });
});
