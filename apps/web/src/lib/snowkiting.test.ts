import { describe, it, expect } from 'vitest';
import {
  getSnowkitingSpots,
  getSnowkitingSpotById,
  calculateSnowkiting,
  getSnowkitingGear,
  SNOWKITING_SPOTS,
  SNOWKITING_GEAR,
  SnowkitingQuery,
} from './snowkiting';

describe('Snowkiting Library', () => {
  describe('Catalog & Spot Retrieval', () => {
    it('returns all 5 iconic spots when no filter is provided', () => {
      const spots = getSnowkitingSpots();
      expect(spots).toHaveLength(5);
      expect(spots.map((s) => s.id)).toEqual([
        'hardangervidda-plateau-norway',
        'camas-prairie-idaho',
        'col-du-lautaret-alps',
        'lake-mille-lacs-minnesota',
        'greenland-icecap-traverse',
      ]);
    });

    it('filters spots correctly by terrain', () => {
      const polar = getSnowkitingSpots('polar_plateau');
      expect(polar).toHaveLength(1);
      expect(polar[0].id).toBe('hardangervidda-plateau-norway');

      const basin = getSnowkitingSpots('alpine_basin');
      expect(basin).toHaveLength(1);
      expect(basin[0].id).toBe('col-du-lautaret-alps');

      const powder = getSnowkitingSpots('powder_snowfield');
      expect(powder).toHaveLength(1);
      expect(powder[0].id).toBe('camas-prairie-idaho');

      const lake = getSnowkitingSpots('frozen_lake');
      expect(lake).toHaveLength(1);
      expect(lake[0].id).toBe('lake-mille-lacs-minnesota');

      const iceSheet = getSnowkitingSpots('ice_sheet');
      expect(iceSheet).toHaveLength(1);
      expect(iceSheet[0].id).toBe('greenland-icecap-traverse');
    });

    it('retrieves spot by ID or returns undefined for unknown ID', () => {
      const spot = getSnowkitingSpotById('hardangervidda-plateau-norway');
      expect(spot).toBeDefined();
      expect(spot?.title).toBe('Hardangervidda Polar Plateau');
      expect(spot?.elevationM).toBe(1250);
      expect(spot?.expeditionPulkFriendly).toBe(true);

      const unknown = getSnowkitingSpotById('non-existent-spot');
      expect(unknown).toBeUndefined();
    });

    it('has valid spot structure with highlights and wind patterns', () => {
      for (const spot of SNOWKITING_SPOTS) {
        expect(spot.id).toBeTruthy();
        expect(spot.title).toBeTruthy();
        expect(spot.region).toBeTruthy();
        expect(spot.country).toBeTruthy();
        expect(spot.elevationM).toBeGreaterThan(0);
        expect(spot.typicalWindKnots).toBeTruthy();
        expect(spot.bestSeason).toBeTruthy();
        expect(typeof spot.expeditionPulkFriendly).toBe('boolean');
        expect(spot.highlights.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('Mandatory Snowkiting Safety Kit', () => {
    it('returns exactly 6 mandatory gear items with correct categories', () => {
      const gear = getSnowkitingGear();
      expect(gear).toHaveLength(6);
      expect(SNOWKITING_GEAR).toEqual(gear);

      const categories = gear.map((g) => g.category);
      expect(categories).toContain('kite_engine');
      expect(categories).toContain('harness');
      expect(categories).toContain('safety_release');
      expect(categories).toContain('hauling');
      expect(categories).toContain('navigation');
      expect(categories).toContain('protection');

      for (const item of gear) {
        expect(item.mandatory).toBe(true);
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
      }
    });
  });

  describe('Calculator Engine', () => {
    const baseQuery: SnowkitingQuery = {
      spotId: 'hardangervidda-plateau-norway',
      riderWeightKg: 75,
      pulkWeightKg: 20,
      windSpeedKnots: 16,
      snowSurface: 'hardpack_crust',
      kiteType: 'closed_cell_depower_foil',
    };

    it('calculates default payload, friction, recommended kite area, and glide efficiency', () => {
      const result = calculateSnowkiting(baseQuery);
      // totalPayload = 75 + 20 = 95 kg
      expect(result.totalPayloadKg).toBe(95);
      // friction for hardpack_crust is 0.05
      expect(result.frictionCoefficient).toBe(0.05);
      // area: ((95 * 1.8) / 16) * 1.05 = (171 / 16) * 1.05 = 10.6875 * 1.05 = 11.221875 -> 11.2
      expect(result.recommendedKiteAreaM2).toBe(11.2);
      // glide efficiency: Math.round((1.0 - (0.05 / 0.30)) * 100) = Math.round((1 - 0.16666) * 100) = 83%
      expect(result.glideEfficiencyPercent).toBe(83);
      expect(result.safetyStatus).toBe('approved');
      expect(result.powerRating).toContain('OPTIMAL POWER');
      expect(result.spotTitle).toBe('Hardangervidda Polar Plateau');
    });

    it('handles friction variance across all snow surfaces', () => {
      // frozen_lake_ice: 0.03
      const iceResult = calculateSnowkiting({
        ...baseQuery,
        snowSurface: 'frozen_lake_ice',
      });
      expect(iceResult.frictionCoefficient).toBe(0.03);
      // (1 - 0.03 / 0.30) * 100 = 90%
      expect(iceResult.glideEfficiencyPercent).toBe(90);

      // sastrugi_drift: 0.22
      const sastrugiResult = calculateSnowkiting({
        ...baseQuery,
        snowSurface: 'sastrugi_drift',
      });
      expect(sastrugiResult.frictionCoefficient).toBe(0.22);
      // (1 - 0.22 / 0.30) * 100 = Math.round(26.666) = 27%
      expect(sastrugiResult.glideEfficiencyPercent).toBe(27);
      // sastrugi triggers caution_high_load
      expect(sastrugiResult.safetyStatus).toBe('caution_high_load');

      // groomed_packed: 0.08
      const groomedResult = calculateSnowkiting({
        ...baseQuery,
        snowSurface: 'groomed_packed',
      });
      expect(groomedResult.frictionCoefficient).toBe(0.08);
      expect(groomedResult.glideEfficiencyPercent).toBe(73);

      // dry_powder: 0.16
      const powderResult = calculateSnowkiting({
        ...baseQuery,
        snowSurface: 'dry_powder',
      });
      expect(powderResult.frictionCoefficient).toBe(0.16);
      expect(powderResult.glideEfficiencyPercent).toBe(47);
    });

    it('clamps kite area between 4.0 m² and 18.0 m²', () => {
      // Very heavy load, very low wind -> capped at 18.0
      const maxAreaResult = calculateSnowkiting({
        ...baseQuery,
        riderWeightKg: 120,
        pulkWeightKg: 100,
        windSpeedKnots: 6,
        snowSurface: 'sastrugi_drift',
      });
      expect(maxAreaResult.recommendedKiteAreaM2).toBe(18.0);

      // Very light rider, no pulk, very high wind -> floored at 4.0
      const minAreaResult = calculateSnowkiting({
        ...baseQuery,
        riderWeightKg: 45,
        pulkWeightKg: 0,
        windSpeedKnots: 40,
        snowSurface: 'frozen_lake_ice',
      });
      expect(minAreaResult.recommendedKiteAreaM2).toBe(4.0);
    });

    it('determines powerRating correctly based on wind speed and kite area', () => {
      // Underpowered: wind <= 8
      const under = calculateSnowkiting({
        ...baseQuery,
        windSpeedKnots: 8,
      });
      expect(under.powerRating).toBe(
        'UNDERPOWERED: Insufficient pull to overcome snow friction and pulk inertia.'
      );

      // High power: wind >= 24 (and not overpowered)
      const high = calculateSnowkiting({
        ...baseQuery,
        windSpeedKnots: 26,
      });
      expect(high.powerRating).toBe(
        'HIGH POWER: Strong traction pull; continuous depower vigilance required.'
      );

      // Dangerous overpower: wind >= 30 and recommendedKiteAreaM2 > 10
      const overpower = calculateSnowkiting({
        ...baseQuery,
        riderWeightKg: 110,
        pulkWeightKg: 90,
        windSpeedKnots: 30,
      });
      expect(overpower.recommendedKiteAreaM2).toBeGreaterThan(10);
      expect(overpower.powerRating).toBe(
        'DANGEROUS OVERPOWER: Extreme lofting and uncontrollable high-speed dragging risk.'
      );
    });

    it('evaluates safetyStatus for hazardous storm force conditions', () => {
      // wind > 32 knots -> hazardous_storm_force
      const stormResult = calculateSnowkiting({
        ...baseQuery,
        windSpeedKnots: 35,
      });
      expect(stormResult.safetyStatus).toBe('hazardous_storm_force');
      expect(stormResult.tacticalAdvisory).toContain('STORM');

      // inflatable tube kite with wind > 25 knots -> hazardous_storm_force
      const leiHazard = calculateSnowkiting({
        ...baseQuery,
        windSpeedKnots: 26,
        kiteType: 'inflatable_leading_edge_tubekite',
      });
      expect(leiHazard.safetyStatus).toBe('hazardous_storm_force');
      expect(leiHazard.tacticalAdvisory).toContain('Inflatable');
    });

    it('evaluates safetyStatus for caution_high_load conditions', () => {
      // wind > 24 knots (but <= 32 and not tube kite > 25)
      const highWind = calculateSnowkiting({
        ...baseQuery,
        windSpeedKnots: 25,
        kiteType: 'closed_cell_depower_foil',
      });
      expect(highWind.safetyStatus).toBe('caution_high_load');

      // pulkWeightKg > 60
      const heavyPulk = calculateSnowkiting({
        ...baseQuery,
        windSpeedKnots: 16,
        pulkWeightKg: 65,
      });
      expect(heavyPulk.safetyStatus).toBe('caution_high_load');

      // sastrugi_drift
      const sastrugi = calculateSnowkiting({
        ...baseQuery,
        snowSurface: 'sastrugi_drift',
      });
      expect(sastrugi.safetyStatus).toBe('caution_high_load');
    });

    it('uses fallback title when spotId is unknown', () => {
      const fallback = calculateSnowkiting({
        ...baseQuery,
        spotId: 'non-existent',
      });
      expect(fallback.spotTitle).toBe('Polar Expedition Arena');
    });
  });
});
