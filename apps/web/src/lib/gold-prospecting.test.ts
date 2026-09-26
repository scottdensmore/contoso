import { describe, it, expect } from 'vitest';
import {
  GOLD_PROSPECTING_SITES,
  PROSPECTING_GEAR,
  getGoldProspectingSites,
  getGoldProspectingSiteById,
  calculatePlacerRecovery,
  getProspectingGear,
  type PlacerCalculationQuery,
} from './gold-prospecting';

describe('gold-prospecting catalog', () => {
  it('exports GOLD_PROSPECTING_SITES and returns all 5 iconic placer prospecting sites', () => {
    expect(GOLD_PROSPECTING_SITES).toHaveLength(5);
    const sites = getGoldProspectingSites();
    expect(sites).toHaveLength(5);

    const ids = sites.map((s) => s.id);
    expect(ids).toContain('american-river-south-fork');
    expect(ids).toContain('cache-creek-colorado');
    expect(ids).toContain('fairbanks-pedro-creek');
    expect(ids).toContain('rogue-river-galice');
    expect(ids).toContain('swift-river-new-hampshire');
  });

  it('filters sites by deposit type', () => {
    const insideBendSites = getGoldProspectingSites('inside_bend_gravel_bar');
    expect(insideBendSites).toHaveLength(1);
    expect(insideBendSites[0].id).toBe('american-river-south-fork');

    const benchSites = getGoldProspectingSites('bench_placer_terrace');
    expect(benchSites).toHaveLength(1);
    expect(benchSites[0].id).toBe('cache-creek-colorado');

    const creviceSites = getGoldProspectingSites('bedrock_crevice');
    expect(creviceSites).toHaveLength(1);
    expect(creviceSites[0].id).toBe('fairbanks-pedro-creek');

    const riffleSites = getGoldProspectingSites('stream_gravel_riffle');
    expect(riffleSites).toHaveLength(2);
    expect(riffleSites.map((s) => s.id)).toEqual(
      expect.arrayContaining(['rogue-river-galice', 'swift-river-new-hampshire']),
    );
  });

  it('retrieves site by id correctly', () => {
    const site = getGoldProspectingSiteById('american-river-south-fork');
    expect(site).toBeDefined();
    expect(site?.title).toBe('South Fork American River & Coloma Shallows');
    expect(site?.region).toBe('El Dorado County, CA');
    expect(site?.elevationMeters).toBe(230);
    expect(site?.maxHistoricalYieldGPerTon).toBe(4.8);
    expect(site?.accessDifficulty).toBe('easy_walk_in');

    const unknown = getGoldProspectingSiteById('non-existent-site');
    expect(unknown).toBeUndefined();
  });

  it('exports PROSPECTING_GEAR and returns 6 mandatory items in the cold-stream prospecting gear kit', () => {
    expect(PROSPECTING_GEAR).toHaveLength(6);
    const gear = getProspectingGear();
    expect(gear).toHaveLength(6);
    expect(gear.every((item) => item.mandatory)).toBe(true);

    const categories = gear.map((g) => g.category);
    expect(categories).toContain('pan');
    expect(categories).toContain('classifier');
    expect(categories).toContain('sluice');
    expect(categories).toContain('crevice_tools');
    expect(categories).toContain('recovery');
    expect(categories).toContain('magnet');
  });
});

describe('calculatePlacerRecovery', () => {
  it('calculates optimal riffle recovery when slope is 5-8 deg and velocity is 2.5-4.5 fps', () => {
    const query: PlacerCalculationQuery = {
      siteId: 'american-river-south-fork',
      gravelVolumeBuckets: 5,
      sluiceSlopeDeg: 7,
      streamFlowVelocityFps: 3.5,
      separationMethod: 'sluice_box',
    };

    const result = calculatePlacerRecovery(query);

    expect(result.siteTitle).toBe('South Fork American River & Coloma Shallows');
    // expectedConcentrateGrams = Math.round((5 * 0.45 * (4.8 / 5.0)) * 100) / 100 = 2.16
    expect(result.expectedConcentrateGrams).toBe(2.16);
    expect(result.sluiceStatus).toBe('optimal_riffle_recovery');
    expect(result.recoveryEfficiencyPercent).toBe(92);
    expect(result.densityRatio).toBe(7.28);
    expect(result.recoveryAdvisory).toContain('Optimal hydraulic velocity');
    expect(result.regulatoryAdvisory).toContain('USFS & BLM Regulations');
  });

  it('calculates underflow clogging risk when slope < 5 or velocity < 2.5 fps', () => {
    const lowSlopeQuery: PlacerCalculationQuery = {
      siteId: 'fairbanks-pedro-creek',
      gravelVolumeBuckets: 10,
      sluiceSlopeDeg: 4,
      streamFlowVelocityFps: 3.0,
      separationMethod: 'sluice_box',
    };

    const lowSlopeResult = calculatePlacerRecovery(lowSlopeQuery);
    expect(lowSlopeResult.sluiceStatus).toBe('underflow_clogging_risk');
    expect(lowSlopeResult.recoveryEfficiencyPercent).toBe(64);
    expect(lowSlopeResult.recoveryAdvisory).toContain('Underflow warning');

    const lowVelocityQuery: PlacerCalculationQuery = {
      siteId: 'fairbanks-pedro-creek',
      gravelVolumeBuckets: 10,
      sluiceSlopeDeg: 6,
      streamFlowVelocityFps: 2.0,
      separationMethod: 'sluice_box',
    };

    const lowVelocityResult = calculatePlacerRecovery(lowVelocityQuery);
    expect(lowVelocityResult.sluiceStatus).toBe('underflow_clogging_risk');
    expect(lowVelocityResult.recoveryEfficiencyPercent).toBe(64);
    expect(lowVelocityResult.recoveryAdvisory).toContain('Underflow warning');
  });

  it('calculates scour blowout velocity when slope > 8 or velocity > 4.5 fps', () => {
    const steepSlopeQuery: PlacerCalculationQuery = {
      siteId: 'cache-creek-colorado',
      gravelVolumeBuckets: 8,
      sluiceSlopeDeg: 10,
      streamFlowVelocityFps: 3.5,
      separationMethod: 'sluice_box',
    };

    const steepResult = calculatePlacerRecovery(steepSlopeQuery);
    expect(steepResult.sluiceStatus).toBe('scour_blowout_velocity');
    expect(steepResult.recoveryEfficiencyPercent).toBe(48);
    expect(steepResult.recoveryAdvisory).toContain('Scour blowout warning');

    const fastWaterQuery: PlacerCalculationQuery = {
      siteId: 'cache-creek-colorado',
      gravelVolumeBuckets: 8,
      sluiceSlopeDeg: 6,
      streamFlowVelocityFps: 5.5,
      separationMethod: 'sluice_box',
    };

    const fastWaterResult = calculatePlacerRecovery(fastWaterQuery);
    expect(fastWaterResult.sluiceStatus).toBe('scour_blowout_velocity');
    expect(fastWaterResult.recoveryEfficiencyPercent).toBe(48);
    expect(fastWaterResult.recoveryAdvisory).toContain('Scour blowout warning');
  });

  it('handles unknown site fallback gracefully', () => {
    const query: PlacerCalculationQuery = {
      siteId: 'unknown-site',
      gravelVolumeBuckets: 4,
      sluiceSlopeDeg: 7,
      streamFlowVelocityFps: 3.5,
      separationMethod: 'gravity_pan',
    };

    const result = calculatePlacerRecovery(query);
    expect(result.siteTitle).toBeDefined();
    expect(result.expectedConcentrateGrams).toBeGreaterThan(0);
  });
});
