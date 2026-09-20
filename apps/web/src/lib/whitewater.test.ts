import { describe, it, expect } from 'vitest';
import {
  getWhitewaterRuns,
  getWhitewaterRunById,
  assessRiverSafety,
  getWhitewaterGearChecklist,
  WHITEWATER_RUNS,
} from './whitewater';

describe('whitewater catalog', () => {
  it('contains 5 Pacific Northwest river runs with complete metadata', () => {
    expect(WHITEWATER_RUNS).toHaveLength(5);
    const ids = WHITEWATER_RUNS.map((r) => r.id);
    expect(ids).toEqual([
      'wenatchee-tumwater',
      'skykomish-boulder-drop',
      'white-salmon-husum',
      'snoqualmie-middle-fork',
      'deschutes-maupin',
    ]);
  });

  it('retrieves run by id', () => {
    const wenatchee = getWhitewaterRunById('wenatchee-tumwater');
    expect(wenatchee).toBeDefined();
    expect(wenatchee?.name).toBe('Wenatchee River — Tumwater Canyon');
    expect(wenatchee?.classRating).toBe('Class V');
    expect(wenatchee?.waterTempF).toBe(44);
    expect(wenatchee?.gaugeStationId).toBe('USGS-12457000');
    expect(wenatchee?.keyRapids).toHaveLength(2);

    expect(getWhitewaterRunById('non-existent')).toBeUndefined();
  });

  it('filters runs by class rating', () => {
    const classIVRuns = getWhitewaterRuns('Class IV');
    expect(classIVRuns.some((r) => r.id === 'skykomish-boulder-drop')).toBe(true);

    const classVRuns = getWhitewaterRuns('Class V');
    expect(classVRuns.some((r) => r.id === 'wenatchee-tumwater')).toBe(true);
    expect(classVRuns.every((r) => r.classRating.includes('Class V'))).toBe(true);

    const classIIIRuns = getWhitewaterRuns('Class III');
    expect(classIIIRuns.some((r) => r.id === 'snoqualmie-middle-fork')).toBe(true);
    expect(classIIIRuns.some((r) => r.id === 'deschutes-maupin')).toBe(true);
  });

  it('filters runs by region', () => {
    const cascaderuns = getWhitewaterRuns(undefined, 'Central Cascades');
    expect(cascaderuns.length).toBeGreaterThanOrEqual(2);
    expect(cascaderuns.some((r) => r.id === 'wenatchee-tumwater')).toBe(true);
  });
});

describe('assessRiverSafety', () => {
  it('evaluates flow < minRunnableCfs as too_low and unrunnable', () => {
    const result = assessRiverSafety({
      runId: 'wenatchee-tumwater',
      craft: 'kayak',
      paddlerSkill: 'expert',
      flowCfs: 800, // min is 1200
    });

    expect(result.flowStatus).toBe('too_low');
    expect(result.isRunnable).toBe(false);
    expect(result.suitability).toBe('not_recommended');
    expect(result.recommendationText).toContain('Flow is below minimum runnable level');
  });

  it('evaluates flow > maxRunnableCfs as flood_dangerous and unrunnable', () => {
    const result = assessRiverSafety({
      runId: 'wenatchee-tumwater',
      craft: 'kayak',
      paddlerSkill: 'expert',
      flowCfs: 9000, // max is 7000
    });

    expect(result.flowStatus).toBe('flood_dangerous');
    expect(result.isRunnable).toBe(false);
    expect(result.suitability).toBe('danger_prohibited');
    expect(result.recommendationText).toContain('Flow is in flood stage');
  });

  it('evaluates flow statuses within runnable range', () => {
    // Low runnable (min 1200, optimalLow 2000)
    const low = assessRiverSafety({
      runId: 'wenatchee-tumwater',
      craft: 'kayak',
      paddlerSkill: 'expert',
      flowCfs: 1500,
    });
    expect(low.flowStatus).toBe('low_runnable');
    expect(low.isRunnable).toBe(true);

    // Optimal medium (optimalLow 2000, optimalHigh 4500)
    const optimal = assessRiverSafety({
      runId: 'wenatchee-tumwater',
      craft: 'kayak',
      paddlerSkill: 'expert',
      flowCfs: 2800,
    });
    expect(optimal.flowStatus).toBe('optimal_medium');
    expect(optimal.isRunnable).toBe(true);

    // High challenging (optimalHigh 4500, max 7000)
    const high = assessRiverSafety({
      runId: 'wenatchee-tumwater',
      craft: 'kayak',
      paddlerSkill: 'expert',
      flowCfs: 5500,
    });
    expect(high.flowStatus).toBe('high_challenging');
    expect(high.isRunnable).toBe(true);
  });

  it('evaluates Class V paddler skill requirements', () => {
    // Wenatchee Tumwater is Class V
    const expert = assessRiverSafety({
      runId: 'wenatchee-tumwater',
      craft: 'kayak',
      paddlerSkill: 'expert',
    });
    expect(expert.suitability).toBe('recommended');

    const advanced = assessRiverSafety({
      runId: 'wenatchee-tumwater',
      craft: 'kayak',
      paddlerSkill: 'advanced',
    });
    expect(advanced.suitability).toBe('not_recommended');

    const intermediate = assessRiverSafety({
      runId: 'wenatchee-tumwater',
      craft: 'kayak',
      paddlerSkill: 'intermediate',
    });
    expect(intermediate.suitability).toBe('danger_prohibited');

    const novice = assessRiverSafety({
      runId: 'wenatchee-tumwater',
      craft: 'kayak',
      paddlerSkill: 'novice',
    });
    expect(novice.suitability).toBe('danger_prohibited');
  });

  it('evaluates Class IV paddler skill requirements', () => {
    // Skykomish Boulder Drop is Class IV
    const expert = assessRiverSafety({
      runId: 'skykomish-boulder-drop',
      craft: 'raft',
      paddlerSkill: 'expert',
    });
    expect(expert.suitability).toBe('recommended');

    const advanced = assessRiverSafety({
      runId: 'skykomish-boulder-drop',
      craft: 'raft',
      paddlerSkill: 'advanced',
    });
    expect(advanced.suitability).toBe('recommended');

    const intermediate = assessRiverSafety({
      runId: 'skykomish-boulder-drop',
      craft: 'raft',
      paddlerSkill: 'intermediate',
    });
    expect(intermediate.suitability).toBe('not_recommended');

    const novice = assessRiverSafety({
      runId: 'skykomish-boulder-drop',
      craft: 'raft',
      paddlerSkill: 'novice',
    });
    expect(novice.suitability).toBe('danger_prohibited');
  });

  it('evaluates Class III paddler skill requirements', () => {
    // Snoqualmie Middle Fork is Class III
    const intermediate = assessRiverSafety({
      runId: 'snoqualmie-middle-fork',
      craft: 'packraft',
      paddlerSkill: 'intermediate',
    });
    expect(intermediate.suitability).toBe('recommended');

    const novice = assessRiverSafety({
      runId: 'snoqualmie-middle-fork',
      craft: 'packraft',
      paddlerSkill: 'novice',
    });
    expect(novice.suitability).toBe('proceed_with_caution');
  });

  it('flags cold water immersion warning when waterTempF < 55', () => {
    const result = assessRiverSafety({
      runId: 'wenatchee-tumwater', // waterTempF = 44
      craft: 'kayak',
      paddlerSkill: 'expert',
    });
    expect(result.coldWaterImmersionWarning).toBe(true);
    expect(result.requiredGear.some((g) => g.toLowerCase().includes('drysuit'))).toBe(true);
  });

  it('includes craft-specific required gear', () => {
    const kayakResult = assessRiverSafety({
      runId: 'snoqualmie-middle-fork',
      craft: 'kayak',
      paddlerSkill: 'intermediate',
    });
    expect(kayakResult.requiredGear.some((g) => g.toLowerCase().includes('spray skirt'))).toBe(true);
    expect(kayakResult.requiredGear.some((g) => g.toLowerCase().includes('flotation bags'))).toBe(true);

    const raftResult = assessRiverSafety({
      runId: 'snoqualmie-middle-fork',
      craft: 'raft',
      paddlerSkill: 'intermediate',
    });
    expect(raftResult.requiredGear.some((g) => g.toLowerCase().includes('perimeter'))).toBe(true);
    expect(raftResult.requiredGear.some((g) => g.toLowerCase().includes('pump'))).toBe(true);
  });

  it('throws for an invalid run id', () => {
    expect(() =>
      assessRiverSafety({
        runId: 'unknown-river',
        craft: 'kayak',
        paddlerSkill: 'intermediate',
      })
    ).toThrow(/unknown-river/i);
  });
});

describe('getWhitewaterGearChecklist', () => {
  it('returns mandatory whitewater gear list', () => {
    const items = getWhitewaterGearChecklist();
    expect(items.length).toBeGreaterThanOrEqual(8);
    const itemNames = items.map((i) => i.name);
    expect(itemNames).toContain('Type III/V Whitewater PFD');
    expect(itemNames).toContain('Whitewater Helmet');
    expect(itemNames).toContain('Drysuit with latex/silicone gaskets');
    expect(itemNames).toContain('River Rescue Throw Bag');
    expect(itemNames).toContain('River Knife');
    expect(itemNames).toContain('Neoprene Booties & Pogies');
    expect(itemNames).toContain('First Aid & Hypothermia Kit');
    expect(itemNames).toContain('Safety Whistle');
  });
});
