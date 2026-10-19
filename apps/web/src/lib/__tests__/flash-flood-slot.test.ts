import { describe, it, expect } from 'vitest';
import {
  FLASH_FLOOD_SLOT_SITES,
  filterFlashFloodSlotSites,
  calculateFlashFloodSlot,
  getFlashFloodGearChecklist,
  type FlashFloodSlotInput,
} from '../flash-flood-slot';

describe('flash-flood-slot domain library', () => {
  describe('FLASH_FLOOD_SLOT_SITES catalog', () => {
    it('exports all 4 real-world slot-canyon flash-flood drainages with complete metadata', () => {
      expect(FLASH_FLOOD_SLOT_SITES).toHaveLength(4);

      const ids = FLASH_FLOOD_SLOT_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'buckskin-gulch-paria-usa',
        'little-wild-horse-bell-usa',
        'wadi-mujib-siq-jordan',
        'garganta-del-cares-wadi-oman',
      ]);

      const buckskin = FLASH_FLOOD_SLOT_SITES.find(
        (s) => s.id === 'buckskin-gulch-paria-usa'
      );
      expect(buckskin).toBeDefined();
      expect(buckskin?.name).toBe(
        'Buckskin Gulch & Wire Pass Navajo Sandstone Constriction'
      );
      expect(buckskin?.country).toBe('United States');
      expect(buckskin?.elevationMeters).toBe(1460);
      expect(buckskin?.lithology).toBe('navajo-sandstone-narrows');

      const lwh = FLASH_FLOOD_SLOT_SITES.find(
        (s) => s.id === 'little-wild-horse-bell-usa'
      );
      expect(lwh).toBeDefined();
      expect(lwh?.name).toBe(
        'Little Wild Horse & Bell Canyon San Rafael Reef Narrows'
      );
      expect(lwh?.country).toBe('United States');
      expect(lwh?.elevationMeters).toBe(1615);
      expect(lwh?.lithology).toBe('wingate-vertical-fissure');

      const mujib = FLASH_FLOOD_SLOT_SITES.find(
        (s) => s.id === 'wadi-mujib-siq-jordan'
      );
      expect(mujib).toBeDefined();
      expect(mujib?.name).toBe(
        'Wadi Mujib Dead Sea Sandstone Siq & Perennial Gorge'
      );
      expect(mujib?.country).toBe('Jordan');
      expect(mujib?.elevationMeters).toBe(-210);
      expect(mujib?.lithology).toBe('kayenta-ledgy-gorge');

      const ghul = FLASH_FLOOD_SLOT_SITES.find(
        (s) => s.id === 'garganta-del-cares-wadi-oman'
      );
      expect(ghul).toBeDefined();
      expect(ghul?.name).toBe(
        'Wadi Ghul (Al Nakhar Balcony Gorge) Limestone Slot'
      );
      expect(ghul?.country).toBe('Oman');
      expect(ghul?.elevationMeters).toBe(1080);
      expect(ghul?.lithology).toBe('limestone-karst-wadi');

      for (const site of FLASH_FLOOD_SLOT_SITES) {
        expect(site.drainageBasin.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.catchmentAreaKm2).toBeGreaterThanOrEqual(1);
        expect(site.slotWidthM).toBeGreaterThanOrEqual(0.3);
        expect(site.escapeLedgeSpacingM).toBeGreaterThanOrEqual(10);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.escapeProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterFlashFloodSlotSites', () => {
    it('filters sites by country, lithology, difficulty, and search query', () => {
      expect(filterFlashFloodSlotSites(FLASH_FLOOD_SLOT_SITES, {})).toHaveLength(
        4
      );

      const byCountry = filterFlashFloodSlotSites(FLASH_FLOOD_SLOT_SITES, {
        country: 'Jordan',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('wadi-mujib-siq-jordan');

      const byLithology = filterFlashFloodSlotSites(FLASH_FLOOD_SLOT_SITES, {
        lithology: 'wingate-vertical-fissure',
      });
      expect(byLithology).toHaveLength(1);
      expect(byLithology[0].id).toBe('little-wild-horse-bell-usa');

      const byDifficulty = filterFlashFloodSlotSites(FLASH_FLOOD_SLOT_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterFlashFloodSlotSites(FLASH_FLOOD_SLOT_SITES, {
        search: 'Buckskin',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('buckskin-gulch-paria-usa');
    });
  });

  describe('calculateFlashFloodSlot', () => {
    const validBase: FlashFloodSlotInput = {
      catchmentAreaKm2: 18,
      upstreamRainMmHr: 1.5,
      slotWidthM: 4.5,
      escapeLedgeHeightM: 6,
      distanceToExitKm: 1.2,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateFlashFloodSlot({ ...validBase, catchmentAreaKm2: 0.5 })
      ).toThrow(/catchmentAreaKm2/i);
      expect(() =>
        calculateFlashFloodSlot({ ...validBase, catchmentAreaKm2: 1501 })
      ).toThrow(/catchmentAreaKm2/i);
      expect(() =>
        calculateFlashFloodSlot({ ...validBase, catchmentAreaKm2: NaN })
      ).toThrow(/catchmentAreaKm2/i);

      expect(() =>
        calculateFlashFloodSlot({ ...validBase, upstreamRainMmHr: -1 })
      ).toThrow(/upstreamRainMmHr/i);
      expect(() =>
        calculateFlashFloodSlot({ ...validBase, upstreamRainMmHr: 121 })
      ).toThrow(/upstreamRainMmHr/i);

      expect(() =>
        calculateFlashFloodSlot({ ...validBase, slotWidthM: 0.2 })
      ).toThrow(/slotWidthM/i);
      expect(() =>
        calculateFlashFloodSlot({ ...validBase, slotWidthM: 26 })
      ).toThrow(/slotWidthM/i);

      expect(() =>
        calculateFlashFloodSlot({ ...validBase, escapeLedgeHeightM: 0.4 })
      ).toThrow(/escapeLedgeHeightM/i);
      expect(() =>
        calculateFlashFloodSlot({ ...validBase, escapeLedgeHeightM: 31 })
      ).toThrow(/escapeLedgeHeightM/i);

      expect(() =>
        calculateFlashFloodSlot({ ...validBase, distanceToExitKm: 0.05 })
      ).toThrow(/distanceToExitKm/i);
      expect(() =>
        calculateFlashFloodSlot({ ...validBase, distanceToExitKm: 21 })
      ).toThrow(/distanceToExitKm/i);
    });

    it('computes low risk level and normal-transit-monitor-sky class under benign dry-sky conditions', () => {
      const analysis = calculateFlashFloodSlot(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.escapeClass).toBe('normal-transit-monitor-sky');
      expect(analysis.wallOfWaterRiseRateMPerMin).toBeLessThan(0.2);
      expect(analysis.escapeMarginMinutes).toBeGreaterThanOrEqual(60);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases peakDischargeM3S and wallOfWaterRiseRateMPerMin with catchmentAreaKm2, upstreamRainMmHr, and narrower slotWidthM', () => {
      const wideGentle = calculateFlashFloodSlot({
        catchmentAreaKm2: 20,
        upstreamRainMmHr: 2,
        slotWidthM: 8.0,
        escapeLedgeHeightM: 5,
        distanceToExitKm: 1.5,
      });
      const narrowConvective = calculateFlashFloodSlot({
        catchmentAreaKm2: 350,
        upstreamRainMmHr: 30,
        slotWidthM: 1.2,
        escapeLedgeHeightM: 5,
        distanceToExitKm: 1.5,
      });

      expect(narrowConvective.peakDischargeM3S).toBeGreaterThan(
        wideGentle.peakDischargeM3S
      );
      expect(narrowConvective.wallOfWaterRiseRateMPerMin).toBeGreaterThan(
        wideGentle.wallOfWaterRiseRateMPerMin
      );
    });

    it('computes moderate risk level and accelerate-to-exit-stage-alcoves class when moderate thresholds are met', () => {
      const analysis = calculateFlashFloodSlot({
        catchmentAreaKm2: 65,
        upstreamRainMmHr: 6,
        slotWidthM: 3.5,
        escapeLedgeHeightM: 6,
        distanceToExitKm: 2.0,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.escapeClass).toBe('accelerate-to-exit-stage-alcoves');
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and ascend-high-water-escape-ledge-immediately class when high thresholds are met', () => {
      const analysis = calculateFlashFloodSlot({
        catchmentAreaKm2: 140,
        upstreamRainMmHr: 15,
        slotWidthM: 2.4,
        escapeLedgeHeightM: 8,
        distanceToExitKm: 2.2,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.escapeClass).toBe(
        'ascend-high-water-escape-ledge-immediately'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level, negative escapeMarginMinutes, and abort-do-not-enter-flash-flood-imminent class under heavy monsoon burst', () => {
      const analysis = calculateFlashFloodSlot({
        catchmentAreaKm2: 680,
        upstreamRainMmHr: 42,
        slotWidthM: 1.1,
        escapeLedgeHeightM: 10,
        distanceToExitKm: 6.5,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.escapeClass).toBe(
        'abort-do-not-enter-flash-flood-imminent'
      );
      expect(analysis.wallOfWaterRiseRateMPerMin).toBeGreaterThanOrEqual(1.5);
      expect(analysis.escapeMarginMinutes).toBeLessThan(0);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getFlashFloodGearChecklist', () => {
    it('returns at least 6 gear items spanning satellite-telemetry, vertical-escape, thermal-flotation, and anchoring', () => {
      const gear = getFlashFloodGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('satellite-telemetry')).toBe(true);
      expect(categories.has('vertical-escape')).toBe(true);
      expect(categories.has('thermal-flotation')).toBe(true);
      expect(categories.has('anchoring')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
