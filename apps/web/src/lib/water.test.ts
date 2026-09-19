import { describe, it, expect, beforeEach } from 'vitest';
import {
  getWaterSources,
  getWaterSourceById,
  calculateHydrationNeeds,
  getWaterConditionReports,
  saveWaterConditionReport,
  STORAGE_KEY,
} from './water';

describe('Water Sources & Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Water Sources Catalog', () => {
    it('provides standard water sources catalog with at least 4 sources', () => {
      const sources = getWaterSources();
      expect(sources.length).toBeGreaterThanOrEqual(4);

      const colchuck = sources.find((s) => s.id === 'colchuck-creek');
      expect(colchuck).toBeDefined();
      expect(colchuck?.name).toBe('Colchuck Creek Footbridge Crossing');
      expect(colchuck?.trailOrZone).toBe('Colchuck Lake Trail');
      expect(colchuck?.region).toBe('Cascades');
      expect(colchuck?.mileMarker).toBe(2.2);
      expect(colchuck?.elevationFeet).toBe(4100);
      expect(colchuck?.sourceType).toBe('stream');
      expect(colchuck?.flowStatus).toBe('Flowing Strong');
      expect(colchuck?.reliability).toBe('Year-round');
      expect(colchuck?.turbidity).toBe('Crystal Clear');
      expect(colchuck?.recommendedTreatment).toContain('hollow_fiber');
      expect(colchuck?.recommendedTreatment).toContain('gravity_filter');
      expect(colchuck?.lastReportedDate).toBe('2026-09-18');
      expect(colchuck?.notes).toBe('Fast-flowing mountain run-off. Easy bank access.');

      const asgard = sources.find((s) => s.id === 'asgard-snowmelt');
      expect(asgard).toBeDefined();
      expect(asgard?.sourceType).toBe('glacial_melt');
      expect(asgard?.reliability).toBe('Seasonal');

      const panhandle = sources.find((s) => s.id === 'panhandle-gap');
      expect(panhandle).toBeDefined();
      expect(panhandle?.sourceType).toBe('alpine_lake');
      expect(panhandle?.flowStatus).toBe('Stagnant');

      const enchanted = sources.find((s) => s.id === 'enchanted-valley-spring');
      expect(enchanted).toBeDefined();
      expect(enchanted?.sourceType).toBe('spring');
      expect(enchanted?.region).toBe('Olympics');
    });

    it('finds water source by ID', () => {
      const found = getWaterSourceById('colchuck-creek');
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Colchuck Creek Footbridge Crossing');

      const notFound = getWaterSourceById('non-existent-source');
      expect(notFound).toBeNull();
    });
  });

  describe('Hydration Calculation Logic', () => {
    it('calculates hydration needs for standard backcountry hike', () => {
      const calc = calculateHydrationNeeds(5, 1000, 70);
      expect(calc.distanceMiles).toBe(5);
      expect(calc.elevationGainFeet).toBe(1000);
      expect(calc.tempFahrenheit).toBe(70);
      expect(calc.hoursEstimated).toBeGreaterThan(0);
      expect(calc.litersNeeded).toBeGreaterThan(0);
      expect(calc.minCarryLiters).toBeGreaterThan(0);
    });

    it('increases liters needed and carry capacity when distance and temperature increase', () => {
      const moderateHike = calculateHydrationNeeds(5, 1000, 65);
      const strenuousHotHike = calculateHydrationNeeds(10, 2000, 85);

      expect(strenuousHotHike.hoursEstimated).toBeGreaterThan(moderateHike.hoursEstimated);
      expect(strenuousHotHike.litersNeeded).toBeGreaterThan(moderateHike.litersNeeded);
      expect(strenuousHotHike.minCarryLiters).toBeGreaterThanOrEqual(moderateHike.minCarryLiters);
    });

    it('handles zero or negative values gracefully without negative calculations', () => {
      const edgeCase = calculateHydrationNeeds(0, 0, 30);
      expect(edgeCase.distanceMiles).toBe(0);
      expect(edgeCase.elevationGainFeet).toBe(0);
      expect(edgeCase.hoursEstimated).toBeGreaterThanOrEqual(0);
      expect(edgeCase.litersNeeded).toBeGreaterThan(0);
      expect(edgeCase.minCarryLiters).toBeGreaterThan(0);
    });
  });

  describe('Condition Reports Persistence', () => {
    it('returns empty list or initial reports when localStorage is empty', () => {
      const reports = getWaterConditionReports();
      expect(Array.isArray(reports)).toBe(true);
    });

    it('saves water condition report with unique WTR-XXXXX identifier and ISO timestamp', () => {
      const saved = saveWaterConditionReport({
        sourceId: 'colchuck-creek',
        sourceName: 'Colchuck Creek Footbridge Crossing',
        reporterName: 'Alex Honnold',
        flowStatus: 'Flowing Strong',
        turbidity: 'Crystal Clear',
        treatmentMethodUsed: 'hollow_fiber',
        notes: 'Clean and cold fast flow',
      });

      expect(saved.id).toMatch(/^WTR-\d{5}$/);
      expect(saved.sourceId).toBe('colchuck-creek');
      expect(saved.sourceName).toBe('Colchuck Creek Footbridge Crossing');
      expect(saved.reporterName).toBe('Alex Honnold');
      expect(saved.flowStatus).toBe('Flowing Strong');
      expect(saved.turbidity).toBe('Crystal Clear');
      expect(saved.treatmentMethodUsed).toBe('hollow_fiber');
      expect(saved.notes).toBe('Clean and cold fast flow');
      expect(saved.reportedAt).toBeDefined();
      expect(new Date(saved.reportedAt).getTime()).not.toBeNaN();

      const reports = getWaterConditionReports();
      expect(reports.length).toBeGreaterThanOrEqual(1);
      expect(reports.some((r) => r.id === saved.id)).toBe(true);

      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      expect(raw).toContain(saved.id);
    });
  });
});
