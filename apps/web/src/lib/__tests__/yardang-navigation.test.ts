import { describe, it, expect } from 'vitest';
import {
  YARDANG_DESERT_SITES,
  filterYardangSites,
  calculateYardangNavigation,
  getYardangGearChecklist,
  type YardangNavigationInput,
} from '../yardang-navigation';

describe('yardang-navigation domain library', () => {
  describe('YARDANG_DESERT_SITES catalog', () => {
    it('exports all 4 real-world aeolian yardang & star-dune mega-erg sites with complete metadata', () => {
      expect(YARDANG_DESERT_SITES).toHaveLength(4);

      const ids = YARDANG_DESERT_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'dasht-e-lut-kaluts-iran',
        'badain-jaran-star-dunes-china',
        'lop-nur-yardang-xinjiang-china',
        'borkou-ennedi-yardangs-chad',
      ]);

      const lut = YARDANG_DESERT_SITES.find(
        (s) => s.id === 'dasht-e-lut-kaluts-iran'
      );
      expect(lut).toBeDefined();
      expect(lut?.name).toBe(
        'Dasht-e Lut Gandom Beryan & Shahr-e Lut Mega-Yardang (Kalut) Corridors'
      );
      expect(lut?.country).toBe('Iran');
      expect(lut?.elevationMeters).toBe(390);
      expect(lut?.morphology).toBe('kalut-mega-yardang-corridor');

      const badain = YARDANG_DESERT_SITES.find(
        (s) => s.id === 'badain-jaran-star-dunes-china'
      );
      expect(badain).toBeDefined();
      expect(badain?.name).toBe(
        'Badain Jaran Bilutu Peak Mega-Star-Dune & Interdune Lakes'
      );
      expect(badain?.country).toBe('China');
      expect(badain?.elevationMeters).toBe(1611);
      expect(badain?.morphology).toBe('star-dune-multi-arm-slipface');

      const lopNur = YARDANG_DESERT_SITES.find(
        (s) => s.id === 'lop-nur-yardang-xinjiang-china'
      );
      expect(lopNur).toBeDefined();
      expect(lopNur?.name).toBe(
        'Lop Nur & Dunhuang Yadan Pleistocene Lacustrine Fleet'
      );
      expect(lopNur?.country).toBe('China');
      expect(lopNur?.elevationMeters).toBe(820);
      expect(lopNur?.morphology).toBe('lacustrine-mudstone-yardang-fleet');

      const borkou = YARDANG_DESERT_SITES.find(
        (s) => s.id === 'borkou-ennedi-yardangs-chad'
      );
      expect(borkou).toBeDefined();
      expect(borkou?.name).toBe(
        'Borkou–Tibesti Sandstone Yardang Wind-Tunnels & Erg Djourab'
      );
      expect(borkou?.country).toBe('Chad');
      expect(borkou?.elevationMeters).toBe(460);
      expect(borkou?.morphology).toBe('barchanoid-interdune-gassi');

      for (const site of YARDANG_DESERT_SITES) {
        expect(site.desertBasin.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.reliefHeightMeters).toBeGreaterThan(0);
        expect(site.slipFaceAngleDeg).toBeGreaterThanOrEqual(10);
        expect(site.slipFaceAngleDeg).toBeLessThanOrEqual(42);
        expect(site.prevailingCorridorAzimuthDeg).toBeGreaterThanOrEqual(0);
        expect(site.prevailingCorridorAzimuthDeg).toBeLessThanOrEqual(360);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.routingProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterYardangSites', () => {
    it('filters sites by country, morphology, difficulty, and search query', () => {
      expect(filterYardangSites(YARDANG_DESERT_SITES, {})).toHaveLength(4);

      const byCountry = filterYardangSites(YARDANG_DESERT_SITES, {
        country: 'Iran',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('dasht-e-lut-kaluts-iran');

      const byMorphology = filterYardangSites(YARDANG_DESERT_SITES, {
        morphology: 'star-dune-multi-arm-slipface',
      });
      expect(byMorphology).toHaveLength(1);
      expect(byMorphology[0].id).toBe('badain-jaran-star-dunes-china');

      const byDifficulty = filterYardangSites(YARDANG_DESERT_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterYardangSites(YARDANG_DESERT_SITES, {
        search: 'Bilutu',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('badain-jaran-star-dunes-china');
    });
  });

  describe('calculateYardangNavigation', () => {
    const validBase: YardangNavigationInput = {
      slipFaceAngleDeg: 18,
      windSpeedKmh: 12,
      corridorWidthM: 120,
      sandSurfaceTempC: 26,
      visibilityM: 1500,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateYardangNavigation({ ...validBase, slipFaceAngleDeg: 9 })
      ).toThrow(/slipFaceAngleDeg/i);
      expect(() =>
        calculateYardangNavigation({ ...validBase, slipFaceAngleDeg: 43 })
      ).toThrow(/slipFaceAngleDeg/i);
      expect(() =>
        calculateYardangNavigation({ ...validBase, slipFaceAngleDeg: NaN })
      ).toThrow(/slipFaceAngleDeg/i);

      expect(() =>
        calculateYardangNavigation({ ...validBase, windSpeedKmh: -1 })
      ).toThrow(/windSpeedKmh/i);
      expect(() =>
        calculateYardangNavigation({ ...validBase, windSpeedKmh: 131 })
      ).toThrow(/windSpeedKmh/i);

      expect(() =>
        calculateYardangNavigation({ ...validBase, corridorWidthM: 1.5 })
      ).toThrow(/corridorWidthM/i);
      expect(() =>
        calculateYardangNavigation({ ...validBase, corridorWidthM: 251 })
      ).toThrow(/corridorWidthM/i);

      expect(() =>
        calculateYardangNavigation({ ...validBase, sandSurfaceTempC: 9 })
      ).toThrow(/sandSurfaceTempC/i);
      expect(() =>
        calculateYardangNavigation({ ...validBase, sandSurfaceTempC: 73 })
      ).toThrow(/sandSurfaceTempC/i);

      expect(() =>
        calculateYardangNavigation({ ...validBase, visibilityM: 4 })
      ).toThrow(/visibilityM/i);
      expect(() =>
        calculateYardangNavigation({ ...validBase, visibilityM: 2001 })
      ).toThrow(/visibilityM/i);
    });

    it('computes low risk level and follow-windward-stoss-ridge strategy under calm windward stoss conditions', () => {
      const analysis = calculateYardangNavigation(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.routingStrategy).toBe('follow-windward-stoss-ridge');
      expect(analysis.avalancheSlipSafetyFactor).toBeGreaterThanOrEqual(1.38);
      expect(analysis.avalancheSlipSafetyFactor).toBeLessThanOrEqual(3.2);
      expect(analysis.venturiWindAccelerationRatio).toBeGreaterThanOrEqual(1.0);
      expect(analysis.venturiWindAccelerationRatio).toBeLessThanOrEqual(2.6);
      expect(analysis.triboelectricGnssNoiseIndex).toBeGreaterThanOrEqual(1.0);
      expect(analysis.triboelectricGnssNoiseIndex).toBeLessThanOrEqual(10.0);
      expect(analysis.strideSinkageEnergyMultiplier).toBeGreaterThanOrEqual(1.0);
      expect(analysis.strideSinkageEnergyMultiplier).toBeLessThanOrEqual(3.8);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('decreases avalancheSlipSafetyFactor and increases venturiWindAccelerationRatio, triboelectricGnssNoiseIndex, and strideSinkageEnergyMultiplier under severe haboob & steep slip-face conditions', () => {
      const mild = calculateYardangNavigation(validBase);
      const severe = calculateYardangNavigation({
        slipFaceAngleDeg: 35,
        windSpeedKmh: 85,
        corridorWidthM: 12,
        sandSurfaceTempC: 64,
        visibilityM: 18,
      });

      expect(severe.avalancheSlipSafetyFactor).toBeLessThan(
        mild.avalancheSlipSafetyFactor
      );
      expect(severe.venturiWindAccelerationRatio).toBeGreaterThan(
        mild.venturiWindAccelerationRatio
      );
      expect(severe.triboelectricGnssNoiseIndex).toBeGreaterThan(
        mild.triboelectricGnssNoiseIndex
      );
      expect(severe.strideSinkageEnergyMultiplier).toBeGreaterThan(
        mild.strideSinkageEnergyMultiplier
      );
    });

    it('computes moderate risk level and inter-yardang-gassi-corridor-bearing strategy when moderate thresholds are met', () => {
      const analysis = calculateYardangNavigation({
        slipFaceAngleDeg: 26,
        windSpeedKmh: 34,
        corridorWidthM: 60,
        sandSurfaceTempC: 42,
        visibilityM: 180,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.routingStrategy).toBe(
        'inter-yardang-gassi-corridor-bearing'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and diagonal-switchback-avoid-leeward-horn strategy when high thresholds are met', () => {
      const analysis = calculateYardangNavigation({
        slipFaceAngleDeg: 31,
        windSpeedKmh: 56,
        corridorWidthM: 28,
        sandSurfaceTempC: 52,
        visibilityM: 65,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.routingStrategy).toBe(
        'diagonal-switchback-avoid-leeward-horn'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-haboob-sheltered-lee-trench strategy under dry-sand avalanche failure, haboob wind, extreme surface heat, or dust blackout', () => {
      const analysis = calculateYardangNavigation({
        slipFaceAngleDeg: 36,
        windSpeedKmh: 88,
        corridorWidthM: 10,
        sandSurfaceTempC: 65,
        visibilityM: 15,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.routingStrategy).toBe(
        'abort-haboob-sheltered-lee-trench'
      );
      expect(analysis.avalancheSlipSafetyFactor).toBeLessThan(0.98);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getYardangGearChecklist', () => {
    it('returns at least 6 gear items spanning sand-goggles-respiration, aeolian-navigation, flotation-footwear, and thermal-hydration', () => {
      const gear = getYardangGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('sand-goggles-respiration')).toBe(true);
      expect(categories.has('aeolian-navigation')).toBe(true);
      expect(categories.has('flotation-footwear')).toBe(true);
      expect(categories.has('thermal-hydration')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
