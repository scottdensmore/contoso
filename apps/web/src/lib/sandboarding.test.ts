import { describe, it, expect } from 'vitest';
import {
  getDuneLocations,
  getDuneLocationById,
  calculateSandboardingGlide,
  getSandboardingGearChecklist,
  type SandboardingQuery,
} from './sandboarding';

describe('Sandboarding Domain Logic', () => {
  describe('Dune Locations Catalog', () => {
    it('returns all 5 iconic North American sand dune fields', () => {
      const locations = getDuneLocations();
      expect(locations).toHaveLength(5);
      expect(locations.map((d) => d.id)).toEqual([
        'great-sand-dunes-star-dune',
        'oregon-dunes-florence-bowl',
        'coral-pink-sand-dunes',
        'bruneau-dunes-mega-ridge',
        'white-sands-alkali-flats',
      ]);
    });

    it('filters dune locations by primary board style', () => {
      const freestyle = getDuneLocations('twin_tip_freestyle');
      expect(freestyle).toHaveLength(2);
      expect(freestyle.map((d) => d.id)).toContain('oregon-dunes-florence-bowl');
      expect(freestyle.map((d) => d.id)).toContain('coral-pink-sand-dunes');

      const carvers = getDuneLocations('directional_carver');
      expect(carvers).toHaveLength(2);
      expect(carvers.map((d) => d.id)).toContain('great-sand-dunes-star-dune');
      expect(carvers.map((d) => d.id)).toContain('bruneau-dunes-mega-ridge');

      const sleds = getDuneLocations('tandem_seated_sled');
      expect(sleds).toHaveLength(1);
      expect(sleds[0].id).toBe('white-sands-alkali-flats');
    });

    it('finds a dune location by id with accurate elevation, dune height, and slope specs', () => {
      const starDune = getDuneLocationById('great-sand-dunes-star-dune');
      expect(starDune).toBeDefined();
      expect(starDune?.title).toBe('Great Sand Dunes Star Dune Slipface');
      expect(starDune?.elevationMeters).toBe(2600);
      expect(starDune?.duneHeightMeters).toBe(230);
      expect(starDune?.maxSlopeDegrees).toBe(34);
      expect(starDune?.sandType).toBe('Alpine Quartz & Volcanic Sand');
      expect(starDune?.highlights).toContain('Tallest dunes in North America');

      const unknown = getDuneLocationById('non-existent-dune');
      expect(unknown).toBeUndefined();
    });
  });

  describe('Sandboarding Gear Checklist', () => {
    it('returns 6 mandatory gear items covering all safety categories', () => {
      const gear = getSandboardingGearChecklist();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((item) => item.id);
      expect(ids).toContain('sealed-sand-goggles');
      expect(ids).toContain('hard-sand-speed-wax');
      expect(ids).toContain('thermal-sand-socks');
      expect(ids).toContain('desert-hydration-pack');
      expect(ids).toContain('board-base-scraper');
      expect(ids).toContain('sun-sand-shield-buff');
    });
  });

  describe('Dune Glide & Wax Friction Calculator', () => {
    it('calculates baseline glide friction and terminal speed for silicone wax and dry sand', () => {
      const query: SandboardingQuery = {
        duneId: 'great-sand-dunes-star-dune',
        boardStyle: 'directional_carver',
        riderWeightLbs: 165,
        slopeDegrees: 32,
        sandCondition: 'dry_temperate_loose',
        waxType: 'silicone_speed_wax',
      };

      const result = calculateSandboardingGlide(query);
      // silicone_speed_wax: 0.22, dry_temperate_loose: +0.00 -> finalMu = 0.22
      expect(result.kineticFrictionCoefficient).toBe(0.22);
      expect(result.duneTitle).toBe('Great Sand Dunes Star Dune Slipface');
      expect(result.boardStyle).toBe('directional_carver');
      // effectiveAngleRad = 32 * pi / 180 = 0.5585 rad
      // netAccel = 9.81 * (sin(32°) - 0.22 * cos(32°)) = 9.81 * (0.52992 - 0.22 * 0.84805) = 9.81 * 0.34335 = 3.368
      // speedMps = sqrt(2 * 3.368 * 40) = sqrt(269.46) = 16.415 m/s
      // speedMph = round(16.415 * 2.23694 * 10) / 10 = round(367.2) / 10 = 36.7 mph
      expect(result.estimatedTopSpeedMph).toBeCloseTo(36.7, 1);
      expect(result.glidePerformance).toBe('blistering_speed');
      expect(result.waxReapplicationRuns).toBe(2);
      expect(result.slipfaceRisk).toBe('moderate_surface_sluff'); // 32 degrees -> moderate
    });

    it('modifies friction based on sand condition', () => {
      // Early morning damp (-0.04)
      const dampResult = calculateSandboardingGlide({
        duneId: 'oregon-dunes-florence-bowl',
        boardStyle: 'twin_tip_freestyle',
        riderWeightLbs: 150,
        slopeDegrees: 30,
        sandCondition: 'early_morning_damp',
        waxType: 'silicone_speed_wax',
      });
      // 0.22 - 0.04 = 0.18
      expect(dampResult.kineticFrictionCoefficient).toBe(0.18);
      expect(dampResult.waxReapplicationRuns).toBe(3);

      // Baked desert hot (+0.05)
      const hotResult = calculateSandboardingGlide({
        duneId: 'bruneau-dunes-mega-ridge',
        boardStyle: 'directional_carver',
        riderWeightLbs: 180,
        slopeDegrees: 35,
        sandCondition: 'baked_desert_hot',
        waxType: 'pure_carnauba_hard',
      });
      // 0.26 + 0.05 = 0.31
      expect(hotResult.kineticFrictionCoefficient).toBe(0.31);
      expect(hotResult.waxReapplicationRuns).toBe(1);
      expect(hotResult.slipfaceRisk).toBe('high_sandfall_avalanche'); // >= 34 degrees
      expect(hotResult.thermalBaseWarning).toMatch(/thermal abrasion/i);
    });

    it('caps speed at 14.0 mph and warns on unwaxed raw base', () => {
      const unwaxedResult = calculateSandboardingGlide({
        duneId: 'great-sand-dunes-star-dune',
        boardStyle: 'directional_carver',
        riderWeightLbs: 165,
        slopeDegrees: 34,
        sandCondition: 'dry_temperate_loose',
        waxType: 'unwaxed_raw_base',
      });

      // 0.52 base + 0 = 0.52
      expect(unwaxedResult.kineticFrictionCoefficient).toBe(0.52);
      expect(unwaxedResult.estimatedTopSpeedMph).toBeLessThanOrEqual(14.0);
      expect(unwaxedResult.waxReapplicationRuns).toBe(0);
      expect(unwaxedResult.thermalBaseWarning).toMatch(/severe base scorch|delamination/i);
      expect(unwaxedResult.glidePerformance).toBe('high_friction_drag');
    });

    it('determines slipface risk thresholds correctly', () => {
      // slope < 29
      const lowRisk = calculateSandboardingGlide({
        duneId: 'white-sands-alkali-flats',
        boardStyle: 'tandem_seated_sled',
        riderWeightLbs: 140,
        slopeDegrees: 25,
        sandCondition: 'dry_temperate_loose',
        waxType: 'silicone_speed_wax',
      });
      expect(lowRisk.slipfaceRisk).toBe('low_firm_sand');
      expect(lowRisk.riderTechniqueAdvisory).toMatch(/lean back/i);

      // slope >= 29 and < 34
      const modRisk = calculateSandboardingGlide({
        duneId: 'coral-pink-sand-dunes',
        boardStyle: 'twin_tip_freestyle',
        riderWeightLbs: 160,
        slopeDegrees: 30,
        sandCondition: 'dry_temperate_loose',
        waxType: 'silicone_speed_wax',
      });
      expect(modRisk.slipfaceRisk).toBe('moderate_surface_sluff');

      // slope >= 34
      const highRisk = calculateSandboardingGlide({
        duneId: 'bruneau-dunes-mega-ridge',
        boardStyle: 'directional_carver',
        riderWeightLbs: 175,
        slopeDegrees: 35,
        sandCondition: 'dry_temperate_loose',
        waxType: 'silicone_speed_wax',
      });
      expect(highRisk.slipfaceRisk).toBe('high_sandfall_avalanche');
      expect(highRisk.riderTechniqueAdvisory).toMatch(/sluff avalanche/i);
    });

    it('clamps kinetic friction coefficient to [0.15, 0.65]', () => {
      const ultraLow = calculateSandboardingGlide({
        duneId: 'oregon-dunes-florence-bowl',
        boardStyle: 'twin_tip_freestyle',
        riderWeightLbs: 150,
        slopeDegrees: 30,
        sandCondition: 'early_morning_damp',
        waxType: 'silicone_speed_wax',
      });
      expect(ultraLow.kineticFrictionCoefficient).toBeGreaterThanOrEqual(0.15);

      const ultraHigh = calculateSandboardingGlide({
        duneId: 'white-sands-alkali-flats',
        boardStyle: 'tandem_seated_sled',
        riderWeightLbs: 200,
        slopeDegrees: 20,
        sandCondition: 'baked_desert_hot',
        waxType: 'unwaxed_raw_base',
      });
      expect(ultraHigh.kineticFrictionCoefficient).toBeLessThanOrEqual(0.65);
    });
  });
});
