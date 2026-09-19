import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllFieldReports,
  getActiveHazardAlerts,
  getReportsByTrail,
  filterFieldReports,
  submitFieldReport,
  resetFieldReports,
  type ReportSubmission,
} from './field-reports-data';

describe('field-reports-data', () => {
  beforeEach(() => {
    resetFieldReports();
  });

  describe('getAllFieldReports', () => {
    it('returns the initial catalog of field reports', () => {
      const reports = getAllFieldReports();
      expect(reports.length).toBeGreaterThanOrEqual(5);

      const trailNames = reports.map((r) => r.trailName);
      expect(trailNames).toContain('Mount Si');
      expect(trailNames).toContain('Skyline Trail (Mount Rainier)');
      expect(trailNames).toContain('Enchantments Core Zone');
      expect(trailNames).toContain('Lake 22');
      expect(trailNames).toContain("Angel's Landing (Zion)");
    });

    it('contains valid report fields according to interface specifications', () => {
      const reports = getAllFieldReports();
      const mountSi = reports.find((r) => r.trailName === 'Mount Si');
      expect(mountSi).toBeDefined();
      expect(mountSi?.condition).toBe('Clear & Dry');
      expect(mountSi?.snowDepthInches).toBe(0);
      expect(mountSi?.bugRating).toBe('Low');
      expect(mountSi?.parkingStatus).toBe('Full by 8:00 AM');

      const skyline = reports.find((r) => r.trailName === 'Skyline Trail (Mount Rainier)');
      expect(skyline).toBeDefined();
      expect(skyline?.condition).toBe('Snow & Ice');
      expect(skyline?.snowDepthInches).toBe(18);
      expect(skyline?.bugRating).toBe('None');
      expect(skyline?.parkingStatus).toBe('Mostly Full');
      expect(skyline?.notes).toMatch(/microspikes/i);

      const enchantments = reports.find((r) => r.trailName === 'Enchantments Core Zone');
      expect(enchantments).toBeDefined();
      expect(enchantments?.condition).toBe('Hazard Warning');
      expect(enchantments?.snowDepthInches).toBe(8);
      expect(enchantments?.bugRating).toBe('None');
      expect(enchantments?.parkingStatus).toBe('Full by 8:00 AM');
      expect(enchantments?.hasHazardAlert).toBe(true);

      const lake22 = reports.find((r) => r.trailName === 'Lake 22');
      expect(lake22).toBeDefined();
      expect(lake22?.condition).toBe('Muddy / Wet');
      expect(lake22?.snowDepthInches).toBe(2);
      expect(lake22?.bugRating).toBe('Moderate');
      expect(lake22?.parkingStatus).toBe('Ample Parking');

      const angels = reports.find((r) => r.trailName === "Angel's Landing (Zion)");
      expect(angels).toBeDefined();
      expect(angels?.condition).toBe('Obstacles / Blowdowns');
      expect(angels?.snowDepthInches).toBe(0);
      expect(angels?.bugRating).toBe('None');
      expect(angels?.parkingStatus).toBe('Road Inaccessible');
    });
  });

  describe('getActiveHazardAlerts', () => {
    it('returns the active hazard alerts catalog', () => {
      const alerts = getActiveHazardAlerts();
      expect(alerts).toHaveLength(3);

      const enchantmentsAlert = alerts.find((a) => a.trailName === 'The Enchantments Core');
      expect(enchantmentsAlert).toBeDefined();
      expect(enchantmentsAlert?.hazardType).toBe('Snow Bridge Collapse');
      expect(enchantmentsAlert?.severity).toBe('Severe');
      expect(enchantmentsAlert?.summary).toContain('Unstable snow bridges');

      const angelsAlert = alerts.find((a) => a.trailName === "Angel's Landing");
      expect(angelsAlert).toBeDefined();
      expect(angelsAlert?.hazardType).toBe('High Wind Warning');
      expect(angelsAlert?.severity).toBe('Warning');
      expect(angelsAlert?.summary).toContain('55 mph');

      const rainierAlert = alerts.find((a) => a.trailName === 'Mount Rainier Paradise');
      expect(rainierAlert).toBeDefined();
      expect(rainierAlert?.hazardType).toBe('Avalanche Risk');
      expect(rainierAlert?.severity).toBe('Caution');
      expect(rainierAlert?.summary).toContain('Loose wet slides');
    });
  });

  describe('getReportsByTrail', () => {
    it('filters reports by trail name case-insensitively', () => {
      const results = getReportsByTrail('mount si');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.trailName.toLowerCase().includes('mount si'))).toBe(true);
    });
  });

  describe('filterFieldReports', () => {
    it('filters by search keyword matching trail name or notes', () => {
      const results = filterFieldReports('slush');
      expect(results.length).toBe(1);
      expect(results[0].trailName).toBe('Lake 22');

      const nameResults = filterFieldReports('Rainier');
      expect(nameResults.length).toBe(1);
      expect(nameResults[0].trailName).toContain('Skyline Trail');
    });

    it('filters by condition filter button', () => {
      const clearReports = filterFieldReports('', 'Clear & Dry');
      expect(clearReports.every((r) => r.condition === 'Clear & Dry')).toBe(true);
      expect(clearReports.some((r) => r.trailName === 'Mount Si')).toBe(true);

      const snowReports = filterFieldReports('', 'Snow & Ice');
      expect(snowReports.every((r) => r.condition === 'Snow & Ice')).toBe(true);
      expect(snowReports.some((r) => r.trailName.includes('Skyline'))).toBe(true);

      const hazardsReports = filterFieldReports('', 'Hazards Only');
      expect(hazardsReports.length).toBeGreaterThanOrEqual(1);
      expect(hazardsReports.every((r) => r.condition === 'Hazard Warning' || r.hasHazardAlert)).toBe(true);

      const allReports = filterFieldReports('', 'All');
      expect(allReports.length).toBe(getAllFieldReports().length);
    });

    it('combines search query and condition filter', () => {
      const results = filterFieldReports('Vivian', 'Hazards Only');
      expect(results.length).toBe(1);
      expect(results[0].trailName).toBe('Enchantments Core Zone');

      const noMatch = filterFieldReports('Vivian', 'Clear & Dry');
      expect(noMatch.length).toBe(0);
    });
  });

  describe('submitFieldReport', () => {
    it('adds a new field report and returns it with a generated TRP reference ID', () => {
      const submission: ReportSubmission = {
        trailName: 'Mailbox Peak',
        hikeDate: '2026-09-18',
        reporterUsername: 'trail_runner',
        condition: 'Clear & Dry',
        snowDepthInches: 0,
        bugRating: 'None',
        parkingStatus: 'Full by 8:00 AM',
        notes: 'Steep climb on the old trail. Inversion layer at summit.',
      };

      const newReport = submitFieldReport(submission);
      expect(newReport.id).toMatch(/^TRP-[A-Z0-9]+$/);
      expect(newReport.trailName).toBe('Mailbox Peak');
      expect(newReport.condition).toBe('Clear & Dry');

      const all = getAllFieldReports();
      expect(all.some((r) => r.id === newReport.id)).toBe(true);
      expect(all[0].id).toBe(newReport.id);
    });
  });
});
