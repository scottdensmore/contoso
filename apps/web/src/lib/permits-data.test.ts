import { describe, it, expect } from 'vitest';
import {
  getAllPasses,
  getAllLotteries,
  getWildernessRegulations,
  filterLotteries,
  filterPasses,
  TRIP_CHECKLIST_ITEMS,
} from './permits-data';

describe('permits-data catalog and helpers', () => {
  describe('getAllPasses', () => {
    it('returns all required federal park and recreation passes', () => {
      const passes = getAllPasses();
      expect(passes).toHaveLength(5);

      const passIds = passes.map((p) => p.id);
      expect(passIds).toContain('america-the-beautiful');
      expect(passIds).toContain('senior-pass');
      expect(passIds).toContain('military-pass');
      expect(passIds).toContain('every-kid-outdoors');
      expect(passIds).toContain('northwest-forest-pass');

      const atb = passes.find((p) => p.id === 'america-the-beautiful');
      expect(atb).toBeDefined();
      expect(atb?.name).toBe('America the Beautiful Annual Pass');
      expect(atb?.price).toBe(80);
      expect(atb?.features.length).toBeGreaterThanOrEqual(3);
      expect(atb?.coverage).toContain('2,000+');

      const senior = passes.find((p) => p.id === 'senior-pass');
      expect(senior?.price).toBe(80);
      expect(senior?.duration).toContain('Lifetime');

      const military = passes.find((p) => p.id === 'military-pass');
      expect(military?.price).toBe(0);

      const fourthGrade = passes.find((p) => p.id === 'every-kid-outdoors');
      expect(fourthGrade?.price).toBe(0);

      const nwf = passes.find((p) => p.id === 'northwest-forest-pass');
      expect(nwf?.price).toBe(30);
    });

    it('ensures all passes have valid non-empty fields', () => {
      const passes = getAllPasses();
      for (const pass of passes) {
        expect(pass.id).toBeTruthy();
        expect(pass.name).toBeTruthy();
        expect(typeof pass.price).toBe('number');
        expect(pass.duration).toBeTruthy();
        expect(pass.coverage).toBeTruthy();
        expect(pass.description).toBeTruthy();
        expect(Array.isArray(pass.features)).toBe(true);
        expect(pass.features.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getAllLotteries', () => {
    it('returns all five key backcountry lotteries', () => {
      const lotteries = getAllLotteries();
      expect(lotteries).toHaveLength(5);

      const lotteryIds = lotteries.map((l) => l.id);
      expect(lotteryIds).toContain('the-enchantments');
      expect(lotteryIds).toContain('mount-whitney');
      expect(lotteryIds).toContain('half-dome');
      expect(lotteryIds).toContain('wonderland-trail');
      expect(lotteryIds).toContain('grand-canyon-backcountry');

      const enchantments = lotteries.find((l) => l.id === 'the-enchantments');
      expect(enchantments?.zone).toContain('Core Zone');
      expect(enchantments?.bearCanisterRequired).toBe(true);
      expect(enchantments?.difficulty).toBe('Expert');
      expect(enchantments?.feePerPerson).toBe(6);

      const whitney = lotteries.find((l) => l.id === 'mount-whitney');
      expect(whitney?.zone).toContain('Main Trail');
      expect(whitney?.bearCanisterRequired).toBe(true);
      expect(whitney?.feePerPerson).toBe(15);
      expect(whitney?.difficulty).toBe('Strenuous');

      const halfDome = lotteries.find((l) => l.id === 'half-dome');
      expect(halfDome?.zone).toContain('Cables Route');
      expect(halfDome?.bearCanisterRequired).toBe(true);

      const wonderland = lotteries.find((l) => l.id === 'wonderland-trail');
      expect(wonderland?.park).toContain('Mount Rainier');

      const grandCanyon = lotteries.find((l) => l.id === 'grand-canyon-backcountry');
      expect(grandCanyon?.zone).toContain('Phantom Ranch');
    });

    it('ensures all lotteries have required schema properties and recreation.gov links', () => {
      const lotteries = getAllLotteries();
      for (const lottery of lotteries) {
        expect(lottery.id).toBeTruthy();
        expect(lottery.park).toBeTruthy();
        expect(lottery.zone).toBeTruthy();
        expect(lottery.lotteryWindow).toBeTruthy();
        expect(lottery.resultsAnnounced).toBeTruthy();
        expect(lottery.permitSeason).toBeTruthy();
        expect(lottery.quotaLimit).toBeTruthy();
        expect(typeof lottery.bearCanisterRequired).toBe('boolean');
        expect(typeof lottery.feePerPerson).toBe('number');
        expect(['Easy', 'Moderate', 'Strenuous', 'Expert']).toContain(lottery.difficulty);
        expect(lottery.description).toBeTruthy();
        expect(lottery.recreationGovUrl).toMatch(/^https:\/\//);
      }
    });
  });

  describe('getWildernessRegulations', () => {
    it('returns regulations across all required categories', () => {
      const regs = getWildernessRegulations();
      expect(regs).toHaveLength(5);

      const categories = regs.map((r) => r.category);
      expect(categories).toContain('Food Storage');
      expect(categories).toContain('Waste Management');
      expect(categories).toContain('Campfires');
      expect(categories).toContain('Group Size');
      expect(categories).toContain('Permit Display');

      const food = regs.find((r) => r.category === 'Food Storage');
      expect(food?.rule).toContain('IGBC');
      expect(food?.recommendation).toBeTruthy();

      const fire = regs.find((r) => r.category === 'Campfires');
      expect(fire?.rule.toLowerCase()).toContain('campfire');

      const waste = regs.find((r) => r.category === 'Waste Management');
      expect(waste?.rule).toContain('WAG bag');

      const group = regs.find((r) => r.category === 'Group Size');
      expect(group?.rule).toMatch(/8 to 12|8-12/);

      const display = regs.find((r) => r.category === 'Permit Display');
      expect(display?.rule.toLowerCase()).toContain('permit');
    });
  });

  describe('filterLotteries', () => {
    it('returns all lotteries when query is empty or whitespace', () => {
      expect(filterLotteries('')).toHaveLength(5);
      expect(filterLotteries('   ')).toHaveLength(5);
    });

    it('filters lotteries by destination park name', () => {
      const results = filterLotteries('Rainier');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('wonderland-trail');
    });

    it('filters lotteries by zone name case-insensitively', () => {
      const enchantments = filterLotteries('enchantments');
      expect(enchantments).toHaveLength(1);
      expect(enchantments[0].id).toBe('the-enchantments');

      const whitney = filterLotteries('WHITNEY');
      expect(whitney).toHaveLength(1);
      expect(whitney[0].id).toBe('mount-whitney');
    });

    it('returns empty array when no destination matches', () => {
      expect(filterLotteries('NonexistentPeakXYZ')).toHaveLength(0);
    });
  });

  describe('filterPasses', () => {
    it('returns all passes when query is empty', () => {
      expect(filterPasses('')).toHaveLength(5);
    });

    it('filters passes by pass name', () => {
      const atb = filterPasses('America the Beautiful');
      expect(atb).toHaveLength(1);
      expect(atb[0].id).toBe('america-the-beautiful');
    });

    it('filters passes by coverage keyword', () => {
      const pnw = filterPasses('Washington');
      expect(pnw.some((p) => p.id === 'northwest-forest-pass')).toBe(true);
    });
  });

  describe('TRIP_CHECKLIST_ITEMS', () => {
    it('contains at least 5 standard readiness items', () => {
      expect(TRIP_CHECKLIST_ITEMS.length).toBeGreaterThanOrEqual(5);
      const labels = TRIP_CHECKLIST_ITEMS.map((item) => item.label.toLowerCase());
      expect(labels.some((l) => l.includes('lottery'))).toBe(true);
      expect(labels.some((l) => l.includes('bear canister'))).toBe(true);
      expect(labels.some((l) => l.includes('permit'))).toBe(true);
      expect(labels.some((l) => l.includes('contact'))).toBe(true);
      expect(labels.some((l) => l.includes('campfire') || l.includes('stove'))).toBe(true);
    });
  });
});
