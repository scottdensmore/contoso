import { describe, it, expect } from 'vitest';
import {
  getLntPrinciples,
  getLntPrincipleById,
  getWildernessZoneRegulations,
  getWildernessZoneById,
  assessWasteCompliance,
  calculatePackOutSupplies,
  type WasteAssessmentRequest,
} from './leave-no-trace';

describe('Leave No Trace Principles Catalog', () => {
  it('returns all 7 LNT principles in numeric order', () => {
    const principles = getLntPrinciples();
    expect(principles).toHaveLength(7);
    expect(principles.map((p) => p.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(principles.map((p) => p.id)).toEqual([
      'plan-ahead',
      'durable-surfaces',
      'dispose-waste',
      'leave-what-you-find',
      'minimize-campfire',
      'respect-wildlife',
      'be-considerate',
    ]);
  });

  it('retrieves a principle by its id', () => {
    const principle = getLntPrincipleById('dispose-waste');
    expect(principle).toBeDefined();
    expect(principle?.title).toBe('Dispose of Waste Properly');
    expect(principle?.number).toBe(3);
    expect(principle?.guidelines.length).toBeGreaterThan(0);
    expect(principle?.backcountryPractices.length).toBeGreaterThan(0);
  });

  it('returns undefined for non-existent principle id', () => {
    expect(getLntPrincipleById('unknown-id')).toBeUndefined();
  });
});

describe('Wilderness Zone Regulations Catalog', () => {
  it('returns all 5 Pacific Northwest wilderness zones', () => {
    const zones = getWildernessZoneRegulations();
    expect(zones).toHaveLength(5);
    const ids = zones.map((z) => z.id);
    expect(ids).toContain('enchantments-core');
    expect(ids).toContain('mount-rainier-muir');
    expect(ids).toContain('olympic-coast');
    expect(ids).toContain('north-cascades-boston');
    expect(ids).toContain('alpine-lakes-lowland');
  });

  it('retrieves zone regulations by id', () => {
    const enchantments = getWildernessZoneById('enchantments-core');
    expect(enchantments).toBeDefined();
    expect(enchantments?.name).toBe('Enchantments Core Alpine Zone');
    expect(enchantments?.humanWasteProtocol).toBe('wag_bag_required');
    expect(enchantments?.foodStorageRequirement).toBe('bear_canister_required');
    expect(enchantments?.campfirePolicy).toBe('prohibited_all_elevations');
    expect(enchantments?.elevationThresholdFt).toBe(6800);
  });

  it('returns undefined for unknown zone', () => {
    expect(getWildernessZoneById('unknown-zone')).toBeUndefined();
  });
});

describe('assessWasteCompliance', () => {
  it('identifies WAG bag requirement and calculates needed bags for Enchantments Core', () => {
    const request: WasteAssessmentRequest = {
      zoneId: 'enchantments-core',
      distanceFromWaterFt: 250,
      groupSize: 2,
      stayDays: 3,
    };

    const result = assessWasteCompliance(request);
    expect(result.humanWasteMethod).toBe('wag_bag_required');
    expect(result.complianceStatus).toBe('compliant');
    expect(result.estimatedWagBagsNeeded).toBe(12); // 2 people * 3 days * 2 uses/day
    expect(result.foodStorageMethod).toContain('bear canister');
    expect(
      result.guidanceNotes.some((note) =>
        note.toLowerCase().includes('wag bag') || note.toLowerCase().includes('pack out')
      )
    ).toBe(true);
    expect(
      result.guidanceNotes.some((note) =>
        note.toLowerCase().includes('municipal trash') || note.toLowerCase().includes('trailhead')
      )
    ).toBe(true);
  });

  it('flags cathole distance violation when closer than 200 feet to water', () => {
    const request: WasteAssessmentRequest = {
      zoneId: 'alpine-lakes-lowland',
      distanceFromWaterFt: 50,
      groupSize: 2,
      stayDays: 2,
    };

    const result = assessWasteCompliance(request);
    expect(result.humanWasteMethod).toBe('cathole');
    expect(result.complianceStatus).toBe('violation');
    expect(result.guidanceNotes).toContain(
      'Catholes must be at least 200 feet (approx 70 adult steps) from any lake, stream, or campsite.'
    );
  });

  it('passes cathole compliance when at least 200 feet from water in lowland zones', () => {
    const request: WasteAssessmentRequest = {
      zoneId: 'alpine-lakes-lowland',
      distanceFromWaterFt: 200,
      groupSize: 2,
      stayDays: 2,
    };

    const result = assessWasteCompliance(request);
    expect(result.humanWasteMethod).toBe('cathole');
    expect(result.complianceStatus).toBe('compliant');
    expect(result.estimatedWagBagsNeeded).toBe(0);
    expect(result.requiredGear).toContain('Backcountry trowel');
  });

  it('warns when group size exceeds zone regulations (e.g. limit of 12)', () => {
    const request: WasteAssessmentRequest = {
      zoneId: 'north-cascades-boston',
      distanceFromWaterFt: 300,
      groupSize: 14,
      stayDays: 2,
    };

    const result = assessWasteCompliance(request);
    expect(result.complianceStatus).toBe('warning');
    expect(
      result.guidanceNotes.some((note) => note.toLowerCase().includes('group size limit'))
    ).toBe(true);
  });
});

describe('calculatePackOutSupplies', () => {
  it('calculates supplies correctly when WAG bags are required', () => {
    const supplies = calculatePackOutSupplies(2, 3, true);
    expect(supplies.wagBags).toBe(12); // 2 * 3 * 2
    expect(supplies.trashBags).toBe(2); // ceil(3 / 2)
    expect(supplies.odorProofBags).toBe(1); // ceil(2 / 2)
    expect(supplies.trowelNeeded).toBe(false);
    expect(supplies.sanitizerOz).toBe(3); // ceil(2 * 3 * 0.5)
  });

  it('calculates supplies correctly for cathole zones (no WAG bags, trowel needed)', () => {
    const supplies = calculatePackOutSupplies(4, 4, false);
    expect(supplies.wagBags).toBe(0);
    expect(supplies.trashBags).toBe(2); // ceil(4 / 2)
    expect(supplies.odorProofBags).toBe(2); // ceil(4 / 2)
    expect(supplies.trowelNeeded).toBe(true);
    expect(supplies.sanitizerOz).toBe(8); // ceil(4 * 4 * 0.5)
  });

  it('updates WAG bags to 32 for 4 people staying 4 days', () => {
    const supplies = calculatePackOutSupplies(4, 4, true);
    expect(supplies.wagBags).toBe(32); // 4 * 4 * 2
  });
});
