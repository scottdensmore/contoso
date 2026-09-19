import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FIRE_ZONES,
  getFireZones,
  getFireZoneById,
  checkStoveCompliance,
  saveFireReport,
  getFireReports,
  STORAGE_KEY,
} from './fire-safety';

describe('fire-safety catalog and functions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('FIRE_ZONES catalog', () => {
    it('contains all 5 required Pacific Northwest zones with exact specs', () => {
      expect(FIRE_ZONES).toHaveLength(5);

      const alpineLakes = FIRE_ZONES.find((z) => z.id === 'alpine-lakes-wilderness');
      expect(alpineLakes).toBeDefined();
      expect(alpineLakes?.name).toBe('Alpine Lakes Wilderness (Okanogan-Wenatchee)');
      expect(alpineLakes?.region).toBe('Cascades');
      expect(alpineLakes?.agency).toBe('USFS');
      expect(alpineLakes?.dangerLevel).toBe('high');
      expect(alpineLakes?.restrictionStage).toBe('stage_1');
      expect(alpineLakes?.campfiresAllowed).toBe(false);
      expect(alpineLakes?.allowedStoves).toEqual(['canister_with_shutoff']);

      const rainier = FIRE_ZONES.find((z) => z.id === 'mount-rainier-national-park');
      expect(rainier).toBeDefined();
      expect(rainier?.name).toBe('Mount Rainier National Park');
      expect(rainier?.region).toBe('Rainier');
      expect(rainier?.agency).toBe('NPS');
      expect(rainier?.dangerLevel).toBe('very_high');
      expect(rainier?.restrictionStage).toBe('stage_2');
      expect(rainier?.campfiresAllowed).toBe(false);
      expect(rainier?.allowedStoves).toEqual(['canister_with_shutoff', 'liquid_fuel']);

      const olympic = FIRE_ZONES.find((z) => z.id === 'olympic-national-park');
      expect(olympic).toBeDefined();
      expect(olympic?.name).toBe('Olympic National Park Backcountry');
      expect(olympic?.region).toBe('Olympics');
      expect(olympic?.agency).toBe('NPS');
      expect(olympic?.dangerLevel).toBe('moderate');
      expect(olympic?.restrictionStage).toBe('none');
      expect(olympic?.campfiresAllowed).toBe(true);
      expect(olympic?.allowedStoves).toEqual([
        'canister_with_shutoff',
        'liquid_fuel',
        'alcohol_stove',
        'wood_burning_twigs',
        'open_campfire',
      ]);

      const northCascades = FIRE_ZONES.find((z) => z.id === 'north-cascades-stehekin');
      expect(northCascades).toBeDefined();
      expect(northCascades?.name).toBe('North Cascades & Stehekin Corridor');
      expect(northCascades?.region).toBe('North Cascades');
      expect(northCascades?.agency).toBe('NPS / USFS');
      expect(northCascades?.dangerLevel).toBe('extreme');
      expect(northCascades?.restrictionStage).toBe('total_ban');
      expect(northCascades?.campfiresAllowed).toBe(false);
      expect(northCascades?.allowedStoves).toEqual(['canister_with_shutoff']);

      const bakerSnoqualmie = FIRE_ZONES.find((z) => z.id === 'mount-baker-snoqualmie');
      expect(bakerSnoqualmie).toBeDefined();
      expect(bakerSnoqualmie?.name).toBe('Mount Baker-Snoqualmie National Forest');
      expect(bakerSnoqualmie?.region).toBe('Cascades');
      expect(bakerSnoqualmie?.agency).toBe('USFS');
      expect(bakerSnoqualmie?.dangerLevel).toBe('high');
      expect(bakerSnoqualmie?.restrictionStage).toBe('stage_1');
      expect(bakerSnoqualmie?.campfiresAllowed).toBe(true);
      expect(bakerSnoqualmie?.allowedStoves).toEqual(['canister_with_shutoff', 'liquid_fuel']);
    });
  });

  describe('getFireZones', () => {
    it('returns all zones when no filter is provided', () => {
      const zones = getFireZones();
      expect(zones).toHaveLength(5);
    });

    it('filters zones by region', () => {
      const cascades = getFireZones('Cascades');
      expect(cascades).toHaveLength(2);
      expect(cascades.map((z) => z.id)).toEqual(
        expect.arrayContaining(['alpine-lakes-wilderness', 'mount-baker-snoqualmie'])
      );

      const rainier = getFireZones('Rainier');
      expect(rainier).toHaveLength(1);
      expect(rainier[0].id).toBe('mount-rainier-national-park');
    });

    it('handles region "all" or case-insensitive matching', () => {
      expect(getFireZones('all')).toHaveLength(5);
      expect(getFireZones('ALL')).toHaveLength(5);
      expect(getFireZones('olympics')).toHaveLength(1);
    });

    it('filters zones by dangerLevel', () => {
      const extreme = getFireZones(undefined, 'extreme');
      expect(extreme).toHaveLength(1);
      expect(extreme[0].id).toBe('north-cascades-stehekin');

      const high = getFireZones(undefined, 'high');
      expect(high).toHaveLength(2);
    });

    it('filters by both region and dangerLevel', () => {
      const cascadesHigh = getFireZones('Cascades', 'high');
      expect(cascadesHigh).toHaveLength(2);

      const cascadesExtreme = getFireZones('Cascades', 'extreme');
      expect(cascadesExtreme).toHaveLength(0);
    });
  });

  describe('getFireZoneById', () => {
    it('returns the zone if found', () => {
      const zone = getFireZoneById('alpine-lakes-wilderness');
      expect(zone).toBeDefined();
      expect(zone?.id).toBe('alpine-lakes-wilderness');
    });

    it('returns undefined if not found', () => {
      const zone = getFireZoneById('non-existent-zone');
      expect(zone).toBeUndefined();
    });
  });

  describe('checkStoveCompliance', () => {
    it('correctly evaluates permitted canister stove in Alpine Lakes Wilderness', () => {
      const result = checkStoveCompliance('alpine-lakes-wilderness', 'canister_with_shutoff');
      expect(result.zoneId).toBe('alpine-lakes-wilderness');
      expect(result.stoveType).toBe('canister_with_shutoff');
      expect(result.isAllowed).toBe(true);
      expect(result.restrictionStage).toBe('stage_1');
      expect(result.precautions.length).toBeGreaterThan(0);
    });

    it('correctly evaluates prohibited alcohol stove in Alpine Lakes Wilderness', () => {
      const result = checkStoveCompliance('alpine-lakes-wilderness', 'alcohol_stove');
      expect(result.isAllowed).toBe(false);
      expect(result.restrictionStage).toBe('stage_1');
      expect(result.reason).toContain('prohibited');
      expect(result.precautions.length).toBeGreaterThan(0);
    });

    it('evaluates liquid fuel in Mount Rainier National Park as permitted', () => {
      const result = checkStoveCompliance('mount-rainier-national-park', 'liquid_fuel');
      expect(result.isAllowed).toBe(true);
      expect(result.restrictionStage).toBe('stage_2');
    });

    it('evaluates open campfire in Mount Rainier National Park as prohibited', () => {
      const result = checkStoveCompliance('mount-rainier-national-park', 'open_campfire');
      expect(result.isAllowed).toBe(false);
      expect(result.restrictionStage).toBe('stage_2');
    });

    it('evaluates alcohol and twig stoves in Olympic National Park as permitted under stage none', () => {
      const alcohol = checkStoveCompliance('olympic-national-park', 'alcohol_stove');
      expect(alcohol.isAllowed).toBe(true);
      expect(alcohol.restrictionStage).toBe('none');

      const twigs = checkStoveCompliance('olympic-national-park', 'wood_burning_twigs');
      expect(twigs.isAllowed).toBe(true);
    });

    it('evaluates liquid fuel in North Cascades as prohibited under total ban', () => {
      const result = checkStoveCompliance('north-cascades-stehekin', 'liquid_fuel');
      expect(result.isAllowed).toBe(false);
      expect(result.restrictionStage).toBe('total_ban');
    });

    it('handles unknown zone gracefully', () => {
      const result = checkStoveCompliance('unknown-zone', 'canister_with_shutoff');
      expect(result.isAllowed).toBe(false);
      expect(result.reason).toMatch(/not found/i);
    });
  });

  describe('saveFireReport & getFireReports', () => {
    it('returns initial reports when localStorage is empty', () => {
      const reports = getFireReports();
      expect(reports.length).toBeGreaterThanOrEqual(2);
      expect(reports[0].id).toMatch(/^FIR-\d{5}$/);
    });

    it('saves a new fire report and persists to localStorage', () => {
      const newReport = saveFireReport({
        zoneId: 'alpine-lakes-wilderness',
        zoneName: 'Alpine Lakes Wilderness (Okanogan-Wenatchee)',
        locationDescription: 'Colchuck Lake west shore',
        reportType: 'smoke_sighting',
      });

      expect(newReport.id).toMatch(/^FIR-\d{5}$/);
      expect(newReport.status).toBe('submitted');
      expect(newReport.reportedAt).toBeDefined();
      expect(newReport.zoneName).toBe('Alpine Lakes Wilderness (Okanogan-Wenatchee)');

      const reports = getFireReports();
      expect(reports[0].id).toBe(newReport.id);
      expect(reports[0].locationDescription).toBe('Colchuck Lake west shore');

      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!)[0].id).toBe(newReport.id);
    });
  });
});
