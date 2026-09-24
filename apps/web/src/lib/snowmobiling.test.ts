import { describe, it, expect } from 'vitest';
import {
  getSnowmobileZones,
  getSnowmobileZoneById,
  calculateSnowmobilePerformance,
  getSnowmobileGear,
  type SledCalculationQuery,
} from './snowmobiling';

describe('Snowmobiling Data & Calculation Engine', () => {
  describe('getSnowmobileZones', () => {
    it('returns all 5 iconic mountain snowmobile zones', () => {
      const zones = getSnowmobileZones();
      expect(zones).toHaveLength(5);
      const zoneIds = zones.map((z) => z.id);
      expect(zoneIds).toEqual([
        'revelstoke-boulder-mountain',
        'cooke-city-daisy-pass',
        'togwotee-pass-brooks-lake',
        'valee-de-bras-du-nord-gaspe',
        'steamboat-rabbit-ears-pass',
      ]);
    });

    it('filters zones correctly by riding style', () => {
      const treeRiding = getSnowmobileZones('technical_tree_riding');
      expect(treeRiding).toHaveLength(2);
      expect(treeRiding.map((z) => z.id)).toContain('revelstoke-boulder-mountain');
      expect(treeRiding.map((z) => z.id)).toContain('valee-de-bras-du-nord-gaspe');

      const chuteClimbing = getSnowmobileZones('chute_climbing');
      expect(chuteClimbing).toHaveLength(1);
      expect(chuteClimbing[0].id).toBe('cooke-city-daisy-pass');

      const sidehilling = getSnowmobileZones('steep_sidehilling');
      expect(sidehilling).toHaveLength(1);
      expect(sidehilling[0].id).toBe('steamboat-rabbit-ears-pass');

      const boondocking = getSnowmobileZones('boondocking_meadows');
      expect(boondocking).toHaveLength(1);
      expect(boondocking[0].id).toBe('togwotee-pass-brooks-lake');
    });

    it('contains valid ATES ratings and highlights', () => {
      const cookeCity = getSnowmobileZoneById('cooke-city-daisy-pass');
      expect(cookeCity).toBeDefined();
      expect(cookeCity?.atesRating).toBe('Complex');
      expect(cookeCity?.elevationMeters).toBe(3050);
      expect(cookeCity?.highlights.length).toBeGreaterThanOrEqual(3);
    });

    it('returns undefined for non-existent zone id', () => {
      expect(getSnowmobileZoneById('non-existent-zone')).toBeUndefined();
    });
  });

  describe('getSnowmobileGear', () => {
    it('returns exactly 6 mandatory avalanche and mountain sled gear items', () => {
      const gear = getSnowmobileGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const categories = gear.map((g) => g.category);
      expect(categories).toEqual([
        'avalanche_airbag',
        'beacon',
        'probe',
        'shovel_saw',
        'tether',
        'recovery',
      ]);
    });
  });

  describe('calculateSnowmobilePerformance', () => {
    it('models elevation horsepower loss on naturally aspirated engine at high elevation', () => {
      // Cooke City at 3050m (~10,006 ft)
      const query: SledCalculationQuery = {
        zoneId: 'cooke-city-daisy-pass',
        trackLengthInches: 165,
        lugHeightInches: 2.6,
        engineType: 'naturally_aspirated_850',
        riderAndGearWeightKg: 90,
        snowpackCondition: 'deep_powder',
      };

      const result = calculateSnowmobilePerformance(query);
      expect(result.zoneName).toBe('Daisy Pass & Henderson Mountain');
      expect(result.powerLossPercent).toBe(35);
      expect(result.effectiveHorsepower).toBe(107.3);
      expect(result.avalancheTerrainWarning).toContain('Complex Avalanche Terrain');
    });

    it('models factory turbo maintaining full boost up to 10,000 ft', () => {
      // Cooke City with factory turbo: ~10,006 ft, minimal loss
      const turboQuery: SledCalculationQuery = {
        zoneId: 'cooke-city-daisy-pass',
        trackLengthInches: 165,
        lugHeightInches: 3.0,
        engineType: 'factory_turbo_850',
        riderAndGearWeightKg: 85,
        snowpackCondition: 'deep_powder',
      };

      const turboResult = calculateSnowmobilePerformance(turboQuery);
      expect(turboResult.powerLossPercent).toBe(0);
      expect(turboResult.effectiveHorsepower).toBe(165);
    });

    it('calculates flotation index and trenching risk under different snowpack conditions and weight', () => {
      // Short track, low lug, heavy rider in sugary facets
      const severeQuery: SledCalculationQuery = {
        zoneId: 'revelstoke-boulder-mountain',
        trackLengthInches: 146,
        lugHeightInches: 2.25,
        engineType: 'naturally_aspirated_850',
        riderAndGearWeightKg: 130,
        snowpackCondition: 'sugary_facets',
      };

      const severeResult = calculateSnowmobilePerformance(severeQuery);
      expect(severeResult.sidehillStabilityRating).toBe('nimble_responsive');
      expect(severeResult.trenchingRisk).toBe('severe');
      expect(severeResult.counterSteeringGuidance).toContain('High trenching hazard');

      // Long track, tall lug, light rider on hardpack spring
      const lowRiskQuery: SledCalculationQuery = {
        zoneId: 'steamboat-rabbit-ears-pass',
        trackLengthInches: 175,
        lugHeightInches: 3.0,
        engineType: 'factory_turbo_850',
        riderAndGearWeightKg: 75,
        snowpackCondition: 'hardpack_spring',
      };

      const lowRiskResult = calculateSnowmobilePerformance(lowRiskQuery);
      expect(lowRiskResult.sidehillStabilityRating).toBe('stable_high_effort');
      expect(lowRiskResult.flotationIndex).toBe(100);
      expect(lowRiskResult.trenchingRisk).toBe('low');
    });

    it('classifies 154" and 165" tracks as balanced sidehill stability', () => {
      const query154: SledCalculationQuery = {
        zoneId: 'togwotee-pass-brooks-lake',
        trackLengthInches: 154,
        lugHeightInches: 2.6,
        engineType: 'naturally_aspirated_850',
        riderAndGearWeightKg: 90,
        snowpackCondition: 'deep_powder',
      };
      const result154 = calculateSnowmobilePerformance(query154);
      expect(result154.sidehillStabilityRating).toBe('balanced');
    });
  });
});
