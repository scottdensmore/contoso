import { describe, it, expect } from 'vitest';
import {
  SALT_PAN_SITES,
  SALT_PAN_GEAR_CHECKLIST,
  getAllSaltPanSites,
  getSaltPanSiteById,
  filterSaltPanSites,
  getSaltPanGearChecklist,
  calculateSaltPanNavigationSafety,
} from './salt-pan-navigation';

describe('salt-pan-navigation domain library', () => {
  describe('SALT_PAN_SITES catalog & lookup helpers', () => {
    it('exports 5 curated salt pan & arid playa sites with expected IDs and telemetry', () => {
      const sites = getAllSaltPanSites();
      expect(sites).toHaveLength(5);
      expect(sites).toEqual(SALT_PAN_SITES);

      const expectedIds = [
        'salar-de-uyuni-incahuasi-halite-polygon-basin',
        'badwater-devils-golf-course-halite-pan',
        'makgadikgadi-ntwetwe-sua-salt-pan-traverse',
        'chott-el-djerid-ephemeral-mirage-salar',
        'bonneville-salt-flats-wendover-crust-corridor',
      ];
      expect(sites.map((s) => s.id)).toEqual(expectedIds);

      const uyuni = getSaltPanSiteById(
        'salar-de-uyuni-incahuasi-halite-polygon-basin'
      );
      expect(uyuni).toBeDefined();
      expect(uyuni?.elevationMeters).toBe(3656);
      expect(uyuni?.crustType).toBe('polygonal_halite_pressure_ridge');
      expect(uyuni?.typicalRefractionState).toBe('predawn_isothermal_clarity');
      expect(uyuni?.recommendedTraversalMode).toBe(
        'wide_tire_desert_expedition_cart'
      );
      expect(uyuni?.meanHaliteCrustThicknessCm).toBe(38);
      expect(uyuni?.waterTableDepthCm).toBe(45);
      expect(uyuni?.typicalSurfaceAirTempC).toBe(14);
      expect(uyuni?.typicalGroundSkinTempC).toBe(22);

      const badwater = getSaltPanSiteById(
        'badwater-devils-golf-course-halite-pan'
      );
      expect(badwater?.elevationMeters).toBe(-86);
      expect(badwater?.crustType).toBe('puffy_gypsum_efflorescent_crust');
      expect(badwater?.typicalRefractionState).toBe(
        'inferior_shimmer_horizon_collapse'
      );

      expect(getSaltPanSiteById('non-existent-salar')).toBeUndefined();
    });

    it('filters sites by crustType, refractionState, and traversalMode', () => {
      expect(filterSaltPanSites()).toHaveLength(5);

      const halitePolygon = filterSaltPanSites({
        crustType: 'polygonal_halite_pressure_ridge',
      });
      expect(halitePolygon).toHaveLength(1);
      expect(halitePolygon[0].id).toBe(
        'salar-de-uyuni-incahuasi-halite-polygon-basin'
      );

      const fataMorgana = filterSaltPanSites({
        refractionState: 'fata_morgana_vertical_loom',
      });
      expect(fataMorgana).toHaveLength(2);
      expect(fataMorgana.map((s) => s.id)).toEqual([
        'makgadikgadi-ntwetwe-sua-salt-pan-traverse',
        'chott-el-djerid-ephemeral-mirage-salar',
      ]);

      const cartSites = filterSaltPanSites({
        traversalMode: 'wide_tire_desert_expedition_cart',
      });
      expect(cartSites).toHaveLength(2);
      expect(cartSites.map((s) => s.id)).toEqual([
        'salar-de-uyuni-incahuasi-halite-polygon-basin',
        'bonneville-salt-flats-wendover-crust-corridor',
      ]);

      const combined = filterSaltPanSites({
        refractionState: 'fata_morgana_vertical_loom',
        traversalMode: 'belayed_crust_sounding_probe_team',
      });
      expect(combined).toHaveLength(1);
      expect(combined[0].id).toBe('chott-el-djerid-ephemeral-mirage-salar');
    });
  });

  describe('SALT_PAN_GEAR_CHECKLIST', () => {
    it('exports 6 mandatory crust-sounding, optical navigation, albedo protection, and mire extraction gear items', () => {
      const checklist = getSaltPanGearChecklist();
      expect(checklist).toHaveLength(6);
      expect(checklist).toEqual(SALT_PAN_GEAR_CHECKLIST);

      const expectedGearIds = [
        'graduated-stainless-evaporite-crust-core-auger',
        'fluid-damped-prismatic-sighting-compass-and-sun-compass',
        'polarized-category-4-wrap-glare-shields',
        'collapsible-high-flotation-brine-mud-extraction-boards',
        'dual-band-gnss-inreach-beacon-and-paper-utm-grid',
        'ptfe-coated-halite-resistant-gaiters-and-barrier-salve',
      ];
      expect(checklist.map((item) => item.id)).toEqual(expectedGearIds);
      expect(checklist.every((item) => item.mandatory)).toBe(true);
      expect(checklist.every((item) => item.weightGrams > 0)).toBe(true);
    });
  });

  describe('calculateSaltPanNavigationSafety', () => {
    it('validates input bounds and throws descriptive errors for out-of-range values', () => {
      const baseValid = {
        haliteCrustThicknessCm: 30,
        waterTableDepthCm: 40,
        surfaceAirTempC: 18,
        groundSkinTempC: 24,
        totalTravelerLoadKg: 90,
        targetSightingDistanceKm: 12,
      };

      expect(() =>
        calculateSaltPanNavigationSafety({
          ...baseValid,
          haliteCrustThicknessCm: 0,
        })
      ).toThrow(/haliteCrustThicknessCm/i);
      expect(() =>
        calculateSaltPanNavigationSafety({
          ...baseValid,
          haliteCrustThicknessCm: 151,
        })
      ).toThrow(/haliteCrustThicknessCm/i);

      expect(() =>
        calculateSaltPanNavigationSafety({
          ...baseValid,
          waterTableDepthCm: -1,
        })
      ).toThrow(/waterTableDepthCm/i);
      expect(() =>
        calculateSaltPanNavigationSafety({
          ...baseValid,
          waterTableDepthCm: 251,
        })
      ).toThrow(/waterTableDepthCm/i);

      expect(() =>
        calculateSaltPanNavigationSafety({
          ...baseValid,
          surfaceAirTempC: -16,
        })
      ).toThrow(/surfaceAirTempC/i);
      expect(() =>
        calculateSaltPanNavigationSafety({
          ...baseValid,
          surfaceAirTempC: 61,
        })
      ).toThrow(/surfaceAirTempC/i);

      expect(() =>
        calculateSaltPanNavigationSafety({
          ...baseValid,
          groundSkinTempC: -16,
        })
      ).toThrow(/groundSkinTempC/i);
      expect(() =>
        calculateSaltPanNavigationSafety({
          ...baseValid,
          groundSkinTempC: 86,
        })
      ).toThrow(/groundSkinTempC/i);

      expect(() =>
        calculateSaltPanNavigationSafety({
          ...baseValid,
          totalTravelerLoadKg: 29,
        })
      ).toThrow(/totalTravelerLoadKg/i);
      expect(() =>
        calculateSaltPanNavigationSafety({
          ...baseValid,
          totalTravelerLoadKg: 301,
        })
      ).toThrow(/totalTravelerLoadKg/i);

      expect(() =>
        calculateSaltPanNavigationSafety({
          ...baseValid,
          targetSightingDistanceKm: 0.4,
        })
      ).toThrow(/targetSightingDistanceKm/i);
      expect(() =>
        calculateSaltPanNavigationSafety({
          ...baseValid,
          targetSightingDistanceKm: 51,
        })
      ).toThrow(/targetSightingDistanceKm/i);
    });

    it('calculates nominal_crystalline_halite_corridor under thick halite crust and predawn clarity', () => {
      const res = calculateSaltPanNavigationSafety({
        haliteCrustThicknessCm: 38,
        waterTableDepthCm: 45,
        surfaceAirTempC: 14,
        groundSkinTempC: 18,
        totalTravelerLoadKg: 95,
        targetSightingDistanceKm: 12,
        crustType: 'polygonal_halite_pressure_ridge',
        refractionState: 'predawn_isothermal_clarity',
      });

      expect(res.safetyStatus).toBe('nominal_crystalline_halite_corridor');
      expect(res.crustBearingSafetyFactor).toBeGreaterThanOrEqual(1.85);
      expect(res.brineMudBreakthroughProbability).toBeLessThan(0.25);
      expect(res.mirageHorizonDipErrorDeg).toBeLessThan(0.85);
      expect(res.effectiveVisualRangeKm).toBeGreaterThanOrEqual(3.5);
      expect(res.deadReckoningRoutingProtocol).toMatch(/prismatic/i);
      expect(res.crustSoundingAndExtractionAdvisory).toMatch(/extraction/i);
    });

    it('calculates caution_mirage_azimuth_drift_and_brine_crust under midday inferior shimmer and gypsum crust', () => {
      const res = calculateSaltPanNavigationSafety({
        haliteCrustThicknessCm: 16,
        waterTableDepthCm: 28,
        surfaceAirTempC: 39,
        groundSkinTempC: 58,
        totalTravelerLoadKg: 90,
        targetSightingDistanceKm: 10,
        crustType: 'puffy_gypsum_efflorescent_crust',
        refractionState: 'inferior_shimmer_horizon_collapse',
      });

      expect(res.safetyStatus).toBe(
        'caution_mirage_azimuth_drift_and_brine_crust'
      );
      expect(res.mirageHorizonDipErrorDeg).toBeGreaterThanOrEqual(0.85);
      expect(res.deadReckoningRoutingProtocol).toMatch(/GNSS/i);
    });

    it('calculates abort_subsurface_brine_mud_breakthrough under thin liquefied silt dome or haboob whiteout', () => {
      const res = calculateSaltPanNavigationSafety({
        haliteCrustThicknessCm: 7,
        waterTableDepthCm: 9,
        surfaceAirTempC: 37,
        groundSkinTempC: 55,
        totalTravelerLoadKg: 110,
        targetSightingDistanceKm: 8,
        crustType: 'subsurface_liquefied_silt_dome',
        refractionState: 'fata_morgana_vertical_loom',
      });

      expect(res.safetyStatus).toBe('abort_subsurface_brine_mud_breakthrough');
      expect(res.crustBearingSafetyFactor).toBeLessThan(1.15);
      expect(res.brineMudBreakthroughProbability).toBeGreaterThanOrEqual(0.55);

      const haboobRes = calculateSaltPanNavigationSafety({
        haliteCrustThicknessCm: 35,
        waterTableDepthCm: 45,
        surfaceAirTempC: 25,
        groundSkinTempC: 30,
        totalTravelerLoadKg: 85,
        targetSightingDistanceKm: 10,
        crustType: 'polygonal_halite_pressure_ridge',
        refractionState: 'haboob_halite_aerosol_whiteout',
      });
      expect(haboobRes.safetyStatus).toBe(
        'abort_subsurface_brine_mud_breakthrough'
      );
    });
  });
});
